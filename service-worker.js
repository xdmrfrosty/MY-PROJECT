const CACHE_NAME = "egibby-todo-cache-v1";
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./favicon.png",
  "./manifest.json"
];

// Install: cache files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("📦 Caching app files");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate: clear old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("🗑️ Removing old cache", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch: serve cached files when offline
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => {
        if (event.request.mode === "navigate") {
          return new Response(
            "<h1>⚠️ You are offline</h1><p>Your tasks are still available from local storage.</p>",
            { headers: { "Content-Type": "text/html" } }
          );
        }
      });
    })
  );
});
