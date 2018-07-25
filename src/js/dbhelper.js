import idb from "idb";

const images = require.context("../images", false, /\.jpg$/);
const BACKEND_URL = "http://localhost:1337";

/**
 * Common database helper functions.
 */
export default new class DBHelper {
  /**
   * DBHelper constructor function
   */
  constructor() {
    this.fetchRestaurantsPromise = null;

    if (!("indexedDB" in window)) {
      return;
    }

    this.dbPromise = idb.open("mwsRestaurant", 1, function(upgradeDb) {
      upgradeDb.createObjectStore("restaurants", { keyPath: "id" });
      upgradeDb.createObjectStore("reviews", { keyPath: "id" });
    });
  }

  /**
   * Fetch all restaurants from network.
   * @return {Promise} Promise object represents all restaurants.
   */
  fetchRestaurantsFromNetwork() {
    return fetch(`${BACKEND_URL}/restaurants`)
      .then(response => response.json())
      .then(restaurants => {
        if (this.dbPromise) {
          this.dbPromise.then(db => {
            const store = db
              .transaction("restaurants", "readwrite")
              .objectStore("restaurants");

            for (const restaurant of restaurants) {
              store.put(restaurant);
            }
          });
        }

        return restaurants;
      })
      .catch(error => {
        console.error(error);
      });
  }

  /**
   * Fetch all restaurants from IndexedDB or network.
   * @return {Promise} Promise object represents all restaurants.
   */
  fetchRestaurants() {
    if (this.fetchRestaurantsPromise) {
      return this.fetchRestaurantsPromise;
    }

    if (!this.dbPromise) {
      this.fetchRestaurantsPromise = this.fetchRestaurantsFromNetwork();
      return this.fetchRestaurantsPromise;
    }

    this.fetchRestaurantsPromise = this.dbPromise
      .then(db =>
        db
          .transaction("restaurants")
          .objectStore("restaurants")
          .getAll()
      )
      .then(restaurants => {
        if (restaurants && restaurants.length) {
          return restaurants;
        }

        return this.fetchRestaurantsFromNetwork().then(restaurants => {
          this.fetchRestaurantsPromise = null;
          return restaurants;
        });
      })
      .catch(error => {
        console.error(error);
        this.fetchRestaurantsPromise = null;
      });

    return this.fetchRestaurantsPromise;
  }

  /**
   * Fetch a restaurant by its ID.
   * @param {string} id Restaurant ID.
   * @return {Promise} Promise object represents the restaurant.
   */
  fetchRestaurantByIdFromNetwork(id) {
    return fetch(`${BACKEND_URL}/restaurants/${id}`)
      .then(response => response.json())
      .then(restaurant => {
        if (this.dbPromise) {
          this.dbPromise.then(db => {
            db
              .transaction("restaurants", "readwrite")
              .objectStore("restaurants")
              .put(restaurant);
          });
        }

        return restaurant;
      })
      .catch(error => {
        console.error(error);
      });
  }

  /**
   * Fetch a restaurant by its ID from IndexedDB or network.
   * @param {string} id Restaurant ID.
   * @return {Promise} Promise object represents the restaurant.
   */
  fetchRestaurantById(id) {
    if (!this.dbPromise) {
      return this.fetchRestaurantByIdFromNetwork(id);
    }

    return this.dbPromise
      .then(db =>
        db
          .transaction("restaurants")
          .objectStore("restaurants")
          .get(parseInt(id, 10))
      )
      .then(restaurant => {
        if (restaurant) {
          return restaurant;
        }

        return this.fetchRestaurantByIdFromNetwork(id);
      })
      .catch(error => {
        console.error(error);
      });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood.
   * handling.
   * @param {string} cuisine Cuisine type.
   * @param {string} neighborhood Neighborhood name.
   * @return {Promise} Promise object represents filtered restaurants.
   */
  fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood) {
    // Fetch all restaurants
    return this.fetchRestaurants().then(restaurants => {
      let results = restaurants;
      if (cuisine !== "all") {
        // filter by cuisine
        results = results.filter(r => r.cuisine_type === cuisine);
      }
      if (neighborhood !== "all") {
        // filter by neighborhood
        results = results.filter(r => r.neighborhood === neighborhood);
      }

      return results;
    });
  }

  /**
   * Fetch all neighborhoods.
   * @return {Promise} Promise object represents all neighborhoods.
   */
  fetchNeighborhoods() {
    // Fetch all restaurants
    return this.fetchRestaurants().then(restaurants => {
      // Get all neighborhoods from all restaurants
      const neighborhoods = restaurants.map(
        (v, i) => restaurants[i].neighborhood
      );
      // Remove duplicates from neighborhoods
      return neighborhoods.filter((v, i) => neighborhoods.indexOf(v) === i);
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   * @return {Promise} Promise object represents all cuisines.
   */
  fetchCuisines() {
    // Fetch all restaurants
    return this.fetchRestaurants().then(restaurants => {
      // Get all cuisines from all restaurants
      const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
      // Remove duplicates from cuisines
      return cuisines.filter((v, i) => cuisines.indexOf(v) === i);
    });
  }

  /**
   * Fetch all reviews from network.
   * @return {Promise} Promise object represents all reviews.
   */
  fetchReviewsFromNetwork() {
    return fetch(`${BACKEND_URL}/reviews`)
      .then(response => response.json())
      .then(reviews => {
        if (this.dbPromise) {
          this.dbPromise.then(db => {
            const store = db
              .transaction("reviews", "readwrite")
              .objectStore("reviews");

            for (const review of reviews) {
              store.put(review);
            }
          });
        }

        return reviews;
      })
      .catch(error => {
        console.error(error);
      });
  }

  /**
   * Fetch all reviews from IndexedDB or network.
   * @return {Promise} Promise object represents all reviews.
   */
  fetchReviews() {
    if (this.fetchReviewsPromise) {
      return this.fetchReviewsPromise;
    }

    if (!this.dbPromise) {
      this.fetchReviewsPromise = this.fetchReviewsFromNetwork();
      return this.fetchReviewsPromise;
    }

    this.fetchReviewsPromise = this.dbPromise
      .then(db =>
        db
          .transaction("reviews")
          .objectStore("reviews")
          .getAll()
      )
      .then(reviews => {
        if (reviews && reviews.length) {
          return reviews;
        }

        return this.fetchReviewsFromNetwork().then(reviews => {
          this.fetchReviewsPromise = null;
          return reviews;
        });
      })
      .catch(error => {
        console.error(error);
        this.fetchReviewsPromise = null;
      });

    return this.fetchReviewsPromise;
  }

  /**
   * Fetch restaurant reviews by restaurant id.
   * @param {number} id Restaurant id.
   * @return {Promise} Promise object represents restaurant reviews.
   */
  fetchRestaurantReviews(id) {
    // Fetch all reviews
    return this.fetchReviews().then(reviews =>
      reviews.filter(review => review.restaurant_id === id)
    );
  }

  /**
   * Delete review by id.
   * @param {number} id Review id.
   * @return {Promise} Promise object represents review deleting.
   */
  deleteReview(id) {
    if (this.dbPromise) {
      return this.dbPromise.then(db => {
        const store = db
          .transaction("reviews", "readwrite")
          .objectStore("reviews");

        store.delete(id);

        return fetch(`${BACKEND_URL}/reviews/${id}`, { method: "DELETE" });
      });
    }

    return fetch(`${BACKEND_URL}/reviews/${id}`, { method: "DELETE" });
  }

  /**
   * Restaurant page URL.
   * @param {Object} restaurant Restaurant details.
   * @return {string} Restaurant URL.
   */
  urlForRestaurant(restaurant) {
    return `./restaurant.html?id=${restaurant.id}`;
  }

  /**
   * Restaurant image request.
   * @param {Object} restaurant Restaurant details.
   * @return {string} Restaurant image request.
   */
  imageRequestForRestaurant(restaurant) {
    const photograph = restaurant.photograph || "default";

    return images(`./${photograph}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   * @param {Object} restaurant Restaurant details.
   * @param {Object} map Google Maps' instance.
   * @return {Object} Google Maps' Marker instance.
   */
  mapMarkerForRestaurant(restaurant, map) {
    return new window.google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: this.urlForRestaurant(restaurant),
      map: map,
      animation: window.google.maps.Animation.DROP
    });
  }
}();
