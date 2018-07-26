import DBHelper from "../js/dbhelper";
import "../css/all.css";
import runtime from "serviceworker-webpack-plugin/lib/runtime";

if ("serviceWorker" in navigator) {
  runtime.register();
}

const current = { map: null, markers: [] };

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener("DOMContentLoaded", () => {
  fetchNeighborhoods();
  fetchCuisines();

  const offline = document.querySelector(".js-offline");
  window.setInterval(() => {
    if (window.navigator.onLine) {
      offline.style = "display: none";
    } else {
      offline.style = "";
    }
  }, 1000);
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
  document.querySelector(".js-map-static").style = "display: none";
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

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood).then(
    restaurants => {
      resetRestaurants(restaurants);
      fillRestaurantsHTML(restaurants);
    }
  );
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 * @param {Object[]} restaurants New selected restaurants.
 */
function resetRestaurants(restaurants) {
  // Remove all restaurants
  const ul = document.querySelector(".js-restaurants");
  ul.innerHTML = "";

  // Remove all map markers
  current.markers.forEach(m => m.setMap(null));
  current.markers = [];
}

/**
 * Create all restaurants HTML and add them to the webpage.
 * @param {Object[]} restaurants Selected restaurants.
 */
function fillRestaurantsHTML(restaurants) {
  const ul = document.querySelector(".js-restaurants");
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap(restaurants);
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
  const imageRequest = DBHelper.imageRequestForRestaurant(restaurant);
  image.src = imageRequest.images[imageRequest.images.length - 1].path;
  image.srcset = imageRequest.srcSet;
  image.alt = `Image of the restaurant ${restaurant.name}`;
  image.className = "restaurant__image";
  li.append(image);

  const name = document.createElement("h2");
  name.className = "restaurant__name";
  name.innerHTML = restaurant.name;
  li.append(name);

  const favouriteLabel = document.createElement("label");
  favouriteLabel.className = "restaurant__favorite-label";
  favouriteLabel.title = "Add/remove to/from favorite";
  favouriteLabel.tabIndex = 0;
  const favouriteCheckbox = document.createElement("input");
  favouriteCheckbox.className = "restaurant__favorite-checkbox";
  favouriteCheckbox.type = "checkbox";
  favouriteCheckbox.checked = String(restaurant.is_favorite) !== "false";
  favouriteCheckbox.addEventListener("change", () => {
    DBHelper.toggleRestaurantFavorite(
      restaurant.id,
      String(favouriteCheckbox.checked) !== "false"
    );
  });
  favouriteLabel.append(favouriteCheckbox);
  name.prepend(favouriteLabel);

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
function addMarkersToMap(restaurants) {
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
  DBHelper.fetchNeighborhoods().then(neighborhoods => {
    fillNeighborhoodsHTML(neighborhoods);
  });
}

/**
 * Set neighborhoods HTML.
 * @param {Object[]} neighborhoods Selected neighborhoods.
 */
function fillNeighborhoodsHTML(neighborhoods) {
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
  DBHelper.fetchCuisines().then(cuisines => {
    fillCuisinesHTML(cuisines);
  });
}

/**
 * Set cuisines HTML.
 * @param {Object[]} cuisines Selected cuisines.
 */
function fillCuisinesHTML(cuisines) {
  const select = document.querySelector(".js-cuisines");

  cuisines.forEach(cuisine => {
    const option = document.createElement("option");
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });

  select.addEventListener("change", updateRestaurants);
}
