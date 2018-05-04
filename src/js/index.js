import DBHelper from "../js/dbhelper";
import "../css/all.css";

const current = {
  restaurants: [],
  neighborhoods: [],
  cuisines: [],
  map: null,
  markers: []
};

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener("DOMContentLoaded", () => {
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  current.map = new window.google.maps.Map(document.querySelector(".js-map"), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
};

/**
 * Update page and map for current restaurants.
 */
function updateRestaurants() {
  const cSelect = document.querySelector(".js-cuisines");
  const nSelect = document.querySelector(".js-neighborhoods");

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(
    cuisine,
    neighborhood,
    (error, restaurants) => {
      if (error) {
        console.error(error);
        return;
      }

      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  );
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 * @param {Object[]} restaurants New selected restaurants.
 */
function resetRestaurants(restaurants) {
  // Remove all restaurants
  current.restaurants = [];
  const ul = document.querySelector(".js-restaurants");
  ul.innerHTML = "";

  // Remove all map markers
  current.markers.forEach(m => m.setMap(null));
  current.markers = [];
  current.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 * @param {Object[]} restaurants Selected restaurants.
 */
function fillRestaurantsHTML(restaurants = current.restaurants) {
  const ul = document.querySelector(".js-restaurants");
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 * @param {Object} restaurant Restaurant details.
 * @return {Object} Restaurant HTML element.
 */
function createRestaurantHTML(restaurant) {
  const li = document.createElement("li");
  li.className = "restaurant filters-results__item";

  const image = document.createElement("img");
  image.className = "restaurant__image";
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  li.append(image);

  const name = document.createElement("h1");
  name.className = "restaurant__name";
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement("p");
  neighborhood.className = "restaurant__address";
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement("p");
  address.className = "restaurant__address";
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement("a");
  more.className = "restaurant__button";
  more.innerHTML = "View Details";
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more);

  return li;
}

/**
 * Add markers for current restaurants to the map.
 * @param {Object[]} restaurants Selected restaurants.
 */
function addMarkersToMap(restaurants = current.restaurants) {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, current.map);
    window.google.maps.event.addListener(marker, "click", () => {
      window.location.href = marker.url;
    });
    current.markers.push(marker);
  });
}

/**
 * Fetch all neighborhoods and set their HTML.
 */
function fetchNeighborhoods() {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) {
      // Got an error
      console.error(error);
      return;
    }

    current.neighborhoods = neighborhoods;
    fillNeighborhoodsHTML();
  });
}

/**
 * Set neighborhoods HTML.
 * @param {Object[]} neighborhoods Selected neighborhoods.
 */
function fillNeighborhoodsHTML(neighborhoods = current.neighborhoods) {
  const select = document.querySelector(".js-neighborhoods");

  neighborhoods.forEach(neighborhood => {
    const option = document.createElement("option");
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });

  select.addEventListener("change", updateRestaurants);
}

/**
 * Fetch all cuisines and set their HTML.
 */
function fetchCuisines() {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) {
      // Got an error!
      console.error(error);
      return;
    }

    current.cuisines = cuisines;
    fillCuisinesHTML();
  });
}

/**
 * Set cuisines HTML.
 * @param {Object[]} cuisines Selected cuisines.
 */
function fillCuisinesHTML(cuisines = current.cuisines) {
  const select = document.querySelector(".js-cuisines");

  cuisines.forEach(cuisine => {
    const option = document.createElement("option");
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });

  select.addEventListener("change", updateRestaurants);
}