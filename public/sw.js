// Service Worker for Offline Support
const CACHE_NAME = '40k-tactics-v4';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './main.css',
    './stratagems.js',
    './tooltip.js',
    './images/icon.jpg'
];

// Install Event: Cache files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate Event: Clean up old caches and take control
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cache) => cache !== CACHE_NAME)
                    .map((cache) => caches.delete(cache))
            );
        }).then(() => self.clients.claim())
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
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                }).catch((error) => {
                    console.error('Cache update failed:', error);
                });
                return response;
            })
            .catch(() => {
                // Fallback to cache when network fails
                return caches.match(event.request);
            })
    );
});
