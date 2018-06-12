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
  }

  /**
   * Fetch all restaurants.
   * @return {Promise} Promise object represents all restaurants.
   */
  fetchRestaurants() {
    if (!this.fetchRestaurantsPromise) {
      this.fetchRestaurantsPromise = fetch(`${BACKEND_URL}/restaurants`)
        .then(response => response.json())
        .then(restaurants => {
          this.fetchRestaurantsPromise = null;
          return restaurants;
        })
        .catch(error => {
          console.error(error);
          this.fetchRestaurantsPromise = null;
        });
    }

    return this.fetchRestaurantsPromise;
  }

  /**
   * Fetch a restaurant by its ID.
   * @param {string} id Restaurant ID.
   * @return {Promise} Promise object represents the restaurant.
   */
  fetchRestaurantById(id) {
    return fetch(`${BACKEND_URL}/restaurants/${id}`)
      .then(response => response.json())
      .then(restaurant => restaurant)
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
