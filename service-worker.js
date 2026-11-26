const CACHE_NAME = 'fish-striker-v19';
const APP_FILES = [
  './',
  './index.html',
  './manifest.json',
  './app.js',
  './code.js',
  './library/p5.min.js',
  './data/enemy-rabbit.svg',
  './data/fish.png',
  './data/boss-rabbit.svg',
  './app-icon-192.png',
  './app-icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => Promise.all(
        cacheNames
          .filter(cacheName => cacheName.startsWith('fish-striker-') && cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then(response => {
        if (response.ok && response.type === 'basic') {
          const responseCopy = response.clone();
          return caches.open(CACHE_NAME)
            .then(cache => cache.put(request, responseCopy))
            .then(() => response);
        }
        return response;
      }).catch(error => {
        if (request.mode === 'navigate') {
          return caches.match('./index.html').then(fallback => {
            if (fallback) {
              return fallback;
            }
            throw error;
          });
        }
        throw error;
      });
    })
  );
});
