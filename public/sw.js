// Service Worker for Offline Support
const CACHE_NAME = '40k-tactics-v2';
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
    );
});

// Fetch Event: Serve from cache if available
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached response or fetch from network
                return response || fetch(event.request);
            })
    );
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cache) => cache !== CACHE_NAME)
                    .map((cache) => caches.delete(cache))
            );
        })
    );
});
