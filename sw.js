const CACHE_NAME = 'rapporto-tecnico-v60';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './icon.png',
  './html2pdf.bundle.min.js', // Ora la libreria è locale!
  './firma-tecnico.png',
  './logo.png'
];

// Installazione e salvataggio dei file in cache locale
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }) // RIMOSSO il skipWaiting automatico da qui per permettere la notifica
  );
});

// Attivazione e pulizia vecchie cache
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

// Strategia Cache-First: Ideale per asset locali offline stabili
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Se c'è in cache, usa questa all'istante
      }

      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback estremo se manca sia rete che cache
        return new Response('Risorsa non disponibile offline', { status: 503 });
      });
    })
  );
});

---

### 🌟 AGGIUNTA PER GESTIRE LA NOTIFICA DI AGGIORNAMENTO 🌟

// Ascolta il messaggio "skipWaiting" inviato dal pulsante/conferma dell'app
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
