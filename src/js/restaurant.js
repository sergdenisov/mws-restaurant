import DBHelper from "../js/dbhelper";
import "../css/all.css";

const current = { restaurant: null };

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) {
      // Got an error!
      console.error(error);
      return;
    }

    const map = new window.google.maps.Map(document.querySelector(".js-map"), {
      zoom: 16,
      center: restaurant.latlng,
      scrollwheel: false
    });
    fillBreadcrumb();
    DBHelper.mapMarkerForRestaurant(current.restaurant, map);
  });
};

/**
 * Get current restaurant from page URL.
 * @param {callback} callback Callback function for restaurants fetch.
 */
function fetchRestaurantFromURL(callback) {
  if (current.restaurant) {
    // restaurant already fetched!
    callback(null, current.restaurant);
    return;
  }

  const id = getParameterByName("id");
  if (!id) {
    // no id found in URL
    callback("No restaurant id in URL", null);
    return;
  }

  DBHelper.fetchRestaurantById(id, (error, restaurant) => {
    current.restaurant = restaurant;
    if (!restaurant) {
      console.error(error);
      return;
    }

    fillRestaurantHTML();
    callback(null, restaurant);
  });
}

/**
 * Add restaurant name to the breadcrumb navigation menu.
 * @param {Object} restaurant Restaurant details.
 */
function fillBreadcrumb(restaurant = current.restaurant) {
  const breadcrumbs = document.querySelector(".js-breadcrumbs");
  const li = document.createElement("li");
  li.innerHTML = restaurant.name;
  breadcrumbs.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 * @param {string} name Parameter name.
 * @param {string} url Url with parameters.
 * @return {string} Parameter value;
 */
function getParameterByName(name, url = window.location.href) {
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(url);

  if (!results) {
    return null;
  }

  if (!results[2]) {
    return "";
  }

  return decodeURIComponent(results[2]);
}

/**
 * Create restaurant HTML and add it to the web page.
 * @param {Object} restaurant Restaurant details.
 */
function fillRestaurantHTML(restaurant = current.restaurant) {
  const container = document.querySelector(".js-restaurant-container");
  const name = container.querySelector(".js-restaurant-name");
  name.innerHTML = restaurant.name;

  const address = container.querySelector(".js-restaurant-address");
  address.innerHTML = restaurant.address;

  const image = container.querySelector(".js-restaurant-image");
  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = container.querySelector(".js-restaurant-cuisine");
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }

  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the web page.
 * @param {Object} operatingHours Restaurant operating hours.
 */
function fillRestaurantHoursHTML(
  operatingHours = current.restaurant.operating_hours
) {
  const hours = document.querySelector(".js-restaurant-hours");

  for (const [operatingDay, operatingHour] of Object.entries(operatingHours)) {
    const row = document.createElement("tr");

    const day = document.createElement("td");
    day.innerHTML = operatingDay;
    row.appendChild(day);

    const time = document.createElement("td");
    time.innerHTML = operatingHour;
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the web page.
 * @param {Object} reviews Restaurant reviews.
 */
function fillReviewsHTML(reviews = current.restaurant.reviews) {
  const container = document.querySelector(".js-reviews-container");
  const title = document.createElement("h2");
  title.innerHTML = "Reviews";
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement("p");
    noReviews.innerHTML = "No reviews yet!";
    container.appendChild(noReviews);
    return;
  }

  const ul = document.querySelector(".js-reviews-list");
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the web page.
 * @param {Object} review Restaurant review.
 * @return {Object} Restaurant review HTML element.
 */
function createReviewHTML(review) {
  const li = document.createElement("li");
  const name = document.createElement("p");
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement("p");
  date.innerHTML = review.date;
  li.appendChild(date);

  const rating = document.createElement("p");
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement("p");
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}
