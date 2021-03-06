/* global serviceWorkerOption */
const assetsUrls = serviceWorkerOption.assets.concat("/");
const staticCacheName = "mws-static";

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll(assetsUrls);
    })
  );
});

self.addEventListener("fetch", function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response && !self.navigator.onLine) {
        return response;
      }

      return fetch(event.request).then(fetchResponse => {
        caches.open(staticCacheName).then(function(cache) {
          return cache.put(event.request.url, fetchResponse);
        });

        return fetchResponse.clone();
      });
    })
  );
});
