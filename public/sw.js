// Service Worker for Offline Support
const CACHE_NAME = '40k-tactics-v10-11e';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './shared-theme.css',
  './sw.js',
  './main.css',
  './app/app.css',
  './app/app.js',
  './app/data.js',
  './app/router.js',
  './app/state.js',
  './app/sheets.js',
  './app/search.js',
  './app/views.js',
  './data/rules.json',
  './data/abilities.json',
  './data/stratagems.json',
  './data/keywords.json',
  './data/tables.json',
  './data/README.md',
  './data/roster/README.md',
  './patrulla.html',
  './patrulla.js',
  './patrulla.css',
  './patrols.json',
  './patrulla/patrulla_marines.md',
  './patrulla/patrulla_necrones.md',
  './patrulla/patrulla_orkos.md',
  './patrulla/patrulla_reglas.md',
  './patrulla/patrulla_tiranidos_asalto.md',
  './patrulla/patrulla_tiranidos_enajmbre.md',
  './images/icon.jpg',
];

// Install Event: Cache files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting()),
  );
});

// Activate Event: Clean up old caches and take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.filter((cache) => cache !== CACHE_NAME).map((cache) => caches.delete(cache)),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// Fetch Event: Network First strategy with cache fallback
self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Update cache with new content when network is available
        const responseClone = response.clone();
        caches
          .open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseClone);
          })
          .catch((error) => {
            console.error('Cache update failed:', error);
          });
        return response;
      })
      .catch(() => {
        // Fallback to cache when network fails
        return caches.match(event.request);
      }),
  );
});
