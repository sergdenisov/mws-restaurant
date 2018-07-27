import DBHelper from "../js/dbhelper";
import "../css/all.css";
import runtime from "serviceworker-webpack-plugin/lib/runtime";
import LazyLoad from "vanilla-lazyload";

if ("serviceWorker" in navigator) {
  runtime.register();
}

const current = { restaurant: null };

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  const offline = document.querySelector(".js-offline");
  window.setInterval(() => {
    if (window.navigator.onLine) {
      offline.style = "display: none";
      DBHelper.checkPostponedActions();
    } else {
      offline.style = "";
    }
  }, 1000);

  fetchRestaurantFromURL().then(restaurant => {
    const map = new window.google.maps.Map(document.querySelector(".js-map"), {
      zoom: 16,
      center: restaurant.latlng,
      scrollwheel: false
    });
    document.querySelector(".js-map-static").style = "display: none";
    fillBreadcrumb(restaurant);
    DBHelper.mapMarkerForRestaurant(restaurant, map);
  });
};

/**
 * Get current restaurant from page URL.
 * @return {Promise} Promise object represents the restaurant.
 */
function fetchRestaurantFromURL() {
  if (current.restaurant) {
    // restaurant already fetched!
    return Promise.resolve(current.restaurant);
  }

  const id = getParameterByName("id");
  if (!id) {
    // no id found in URL
    console.error("No restaurant id in URL");
    return Promise.reject();
  }

  return DBHelper.fetchRestaurantById(id).then(restaurant => {
    fillRestaurantHTML(restaurant);
    new LazyLoad({ elements_selector: ".js-lazy" });
    current.restaurant = restaurant;
    return restaurant;
  });
}

/**
 * Add restaurant name to the breadcrumb navigation menu.
 * @param {Object} restaurant Restaurant details.
 */
function fillBreadcrumb(restaurant) {
  const breadcrumbs = document.querySelector(".js-breadcrumbs");
  const li = document.createElement("li");

  li.className = "breadcrumbs__item";
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
function fillRestaurantHTML(restaurant) {
  const container = document.querySelector(".js-restaurant");
  const name = container.querySelector(".js-restaurant-name");
  name.innerHTML = restaurant.name;

  const favouriteLabel = document.createElement("label");
  favouriteLabel.className = "restaurant__favorite-label";
  favouriteLabel.title = "Add/remove to/from favorite";
  favouriteLabel.tabIndex = 0;
  const favouriteCheckbox = document.createElement("input");
  favouriteCheckbox.className =
    "restaurant__favorite-checkbox restaurant__favorite-checkbox_big";
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

  const address = container.querySelector(".js-restaurant-address");
  address.innerHTML = restaurant.address;

  const image = container.querySelector(".js-restaurant-image");
  const imageRequest = DBHelper.imageRequestForRestaurant(restaurant);
  image.dataset.src = imageRequest.images[imageRequest.images.length - 1].path;
  image.dataset.srcset = imageRequest.srcSet;
  image.alt = `Image of the restaurant ${restaurant.name}`;

  const cuisine = container.querySelector(".js-restaurant-cuisine");
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML(restaurant.operating_hours);
  }

  // fill reviews
  DBHelper.fetchReviews(restaurant.id).then(reviews => {
    fillReviewsHTML(reviews, restaurant.id);
  });
}

/**
 * Create restaurant operating hours HTML table and add it to the web page.
 * @param {Object} operatingHours Restaurant operating hours.
 */
function fillRestaurantHoursHTML(operatingHours) {
  const hours = document.querySelector(".js-restaurant-hours");

  for (const [operatingDay, operatingHour] of Object.entries(operatingHours)) {
    const row = document.createElement("tr");

    const day = document.createElement("td");
    day.className = "restaurant-hours__cell";
    day.innerHTML = operatingDay;
    row.appendChild(day);

    const time = document.createElement("td");
    time.className = "restaurant-hours__cell";
    time.innerHTML = operatingHour;
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the web page.
 * @param {Object} reviews Restaurant reviews.
 * @param {number} restaurantId Restaurant id.
 */
function fillReviewsHTML(reviews, restaurantId) {
  const container = document.querySelector(".js-reviews");

  const form = container.querySelector(".js-reviews-form");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const review = {
      restaurant_id: parseInt(restaurantId, 10),
      name: form.querySelector(".js-reviews-form-name").value,
      rating: parseInt(form.querySelector(".js-reviews-form-rating").value, 10),
      comments: form.querySelector(".js-reviews-form-comments").value,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    DBHelper.postReview(review).then(() => {
      ul.appendChild(createReviewHTML(review));
      form.reset();
    });
  });

  form
    .querySelector(".js-reviews-form-cancel")
    .addEventListener("click", () => {
      form.reset();
    });

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
  li.className = "reviews__item";

  const remove = document.createElement("button");
  remove.className = "reviews__remove link";
  remove.type = "button";
  remove.innerText = "✕";
  remove.title = "Delete review";
  remove.addEventListener("click", () => {
    DBHelper.deleteReview(review.id).then(() => li.remove());
  });
  li.appendChild(remove);

  const edit = document.createElement("button");
  edit.className = "reviews__edit link";
  edit.type = "button";
  edit.innerText = "✎";
  edit.title = "Edit review";
  edit.addEventListener("click", () => createReviewEditHTML(review, li));
  li.appendChild(edit);

  const name = document.createElement("h3");
  name.className = "reviews__name";
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement("time");
  date.className = "reviews__date";
  date.innerHTML = new Date(review.updatedAt).toLocaleDateString();
  li.appendChild(date);

  const rating = document.createElement("strong");
  rating.className = "reviews__rating";
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement("p");
  comments.className = "reviews__comments";
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Create review edit HTML and add it to the web page.
 * @param {Object} review Restaurant review.
 * @param {Object} element Restaurant review HTML element.
 */
function createReviewEditHTML(review, element) {
  const formItem = document
    .querySelector(".js-reviews-form-item")
    .cloneNode(true);
  const form = formItem.querySelector(".js-reviews-form");

  form.querySelector(".js-reviews-form-title").innerHTML = "Edit review";
  const name = form.querySelector(".js-reviews-form-name");
  name.value = review.name;
  const rating = form.querySelector(".js-reviews-form-rating");
  rating.value = review.rating;
  const comments = form.querySelector(".js-reviews-form-comments");
  comments.value = review.comments;
  element.parentNode.insertBefore(formItem, element);
  element.remove();

  form.addEventListener("submit", e => {
    e.preventDefault();
    const editedReview = {
      id: parseInt(review.id, 10),
      restaurant_id: parseInt(review.restaurant_id, 10),
      name: name.value,
      rating: parseInt(rating.value, 10),
      comments: comments.value,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    DBHelper.editReview(editedReview).then(() => {
      formItem.parentNode.insertBefore(
        createReviewHTML(editedReview),
        formItem
      );
      formItem.remove();
    });
  });

  form
    .querySelector(".js-reviews-form-cancel")
    .addEventListener("click", () => {
      formItem.parentNode.insertBefore(createReviewHTML(review), formItem);
      formItem.remove();
    });
}
