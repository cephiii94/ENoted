const CACHE_NAME = "enoted-cache-v1.1.001"; // Naikkan versi cache
const urlsToCache = [
  "/",
  "/index.html",
  "/post-template.html",
  "/admin/create-post.html",
  "/admin/login.html",
  "/css/style.css",
  "/admin/Style.css",
  "/js/bg-waktu.js",
  "/js/firestore.js",
  "/js/main-page.js",
  "/js/post-page.js",
  "/js/script.js",
  "/js/auth.js",
  "/js/popup-category.js",
  "/js/admin/create-post-logic.js",
  "/img/bg.jpg",
  "/img/favicon.ico"
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