const CACHE_NAME = "enoted-cache-v1";
const urlsToCache = [
  "/index.html",
  "/blogpost/indexblogpost.html",
  "/blogpost/style.css",
  "/blogpost/script.js"
];

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        return response || fetch(event.request);
      })
  );
});
