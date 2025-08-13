
const CACHE_NAME = 'harness-pwa-v1';
const ASSETS = [
  './index-harness-PWA.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-256.png',
  './icons/icon-384.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for HTML, cache-first for everything else
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const isHTML = req.headers.get('accept')?.includes('text/html');
  if (isHTML) {
    event.respondWith(
      fetch(req).then((res)=>{
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache)=> cache.put(req, copy));
        return res;
      }).catch(()=> caches.match(req))
    );
  } else {
    event.respondWith(
      caches.match(req).then((res)=> res || fetch(req).then((r)=>{
        const copy = r.clone();
        caches.open(CACHE_NAME).then((cache)=> cache.put(req, copy));
        return r;
      }))
    );
  }
});
