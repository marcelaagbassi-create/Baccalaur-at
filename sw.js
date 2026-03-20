const CACHE_NAME = 'baccalaureat-v1';
const URLS_TO_CACHE = [
  '/Baccalaur-at/',
  '/Baccalaur-at/index.html',
  '/Baccalaur-at/manifest.json',
  '/Baccalaur-at/icon-192.png',
  '/Baccalaur-at/icon-512.png'
];

// Installation : mise en cache des ressources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activation : nettoyage anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch : réseau en priorité, cache en fallback
self.addEventListener('fetch', event => {
  // Ne pas intercepter les requêtes Firebase (temps réel)
  if (event.request.url.includes('firebasedatabase') ||
      event.request.url.includes('googleapis') ||
      event.request.url.includes('gstatic')) {
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
