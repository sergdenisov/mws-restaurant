const images = require.context("../images", false, /\.jpg$/);

/**
 * Common database helper functions.
 */
export default class DBHelper {
  /**
   * Callback function for success restaurants fetch case.
   * @callback callback
   * @param {string | null} error Fetch response error.
   * @param {Object[] | Object | null} restaurants Fetch response data.
   */

  /**
   * Fetch all restaurants.
   * @param {callback} callback Callback function for restaurants fetch.
   */
  static fetchRestaurants(callback) {
    import("../data/restaurants.json")
      .then(json => {
        callback(null, json.restaurants);
      })
      .catch(error => {
        callback(error, null);
      });
  }

  /**
   * Fetch a restaurant by its ID.
   * @param {number} id Restaurant ID.
   * @param {callback} callback Callback function for restaurants fetch.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
        return;
      }

      const restaurant = restaurants.find(r => String(r.id) === id);
      if (restaurant) {
        // Got the restaurant
        callback(null, restaurant);
      } else {
        // Restaurant does not exist in the database
        callback("Restaurant does not exist", null);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error
   * handling.
   * @param {string} cuisine Cuisine type.
   * @param {string} neighborhood Neighborhood name.
   * @param {callback} callback Callback function for restaurants fetch.
   */
  static fetchRestaurantByCuisineAndNeighborhood(
    cuisine,
    neighborhood,
    callback
  ) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
        return;
      }

      let results = restaurants;
      if (cuisine !== "all") {
        // filter by cuisine
        results = results.filter(r => r.cuisine_type === cuisine);
      }
      if (neighborhood !== "all") {
        // filter by neighborhood
        results = results.filter(r => r.neighborhood === neighborhood);
      }
      callback(null, results);
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   * @param {callback} callback Callback function for restaurants fetch.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
        return;
      }

      // Get all neighborhoods from all restaurants
      const neighborhoods = restaurants.map(
        (v, i) => restaurants[i].neighborhood
      );
      // Remove duplicates from neighborhoods
      const uniqueNeighborhoods = neighborhoods.filter(
        (v, i) => neighborhoods.indexOf(v) === i
      );
      callback(null, uniqueNeighborhoods);
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   * @param {callback} callback Callback function for restaurants fetch.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
        return;
      }

      // Get all cuisines from all restaurants
      const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
      // Remove duplicates from cuisines
      const uniqueCuisines = cuisines.filter(
        (v, i) => cuisines.indexOf(v) === i
      );
      callback(null, uniqueCuisines);
    });
  }

  /**
   * Restaurant page URL.
   * @param {Object} restaurant Restaurant details.
   * @return {string} Restaurant URL.
   */
  static urlForRestaurant(restaurant) {
    return `./restaurant.html?id=${restaurant.id}`;
  }

  /**
   * Restaurant image URL.
   * @param {Object} restaurant Restaurant details.
   * @return {string} Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return images(`./${restaurant.photograph}`);
  }

  /**
   * Map marker for a restaurant.
   * @param {Object} restaurant Restaurant details.
   * @param {Object} map Google Maps' instance.
   * @return {Object} Google Maps' Marker instance.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    return new window.google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: window.google.maps.Animation.DROP
    });
  }
}
