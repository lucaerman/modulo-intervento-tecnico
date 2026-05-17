const CACHE_NAME = 'rapporto-tecnico-v6';
const ASSETS_TO_CACHE = [
  './',
  './index.html', // Cambialo con il nome esatto del tuo file HTML se differente
  './style.css',
  './manifest.json',
  './icon.png',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

// Installazione e salvataggio dei file necessari in cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Attivazione e rimozione di vecchie cache obsolete
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Strategia Network-First con Fallback su Cache (Usa la rete se disponibile, altrimenti la cache)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Se la risposta è valida, aggiorna la cache in background
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // In assenza di rete, carica le risorse locali salvate
        return caches.match(event.request);
      })
  );
});
