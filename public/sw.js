const CACHE_NAME = 'roomly-v6';
const SHELL_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Never cache API calls (any hostname, identified by path)
  if (
    url.pathname.includes('/roomly_api/') ||
    url.hostname === '127.0.0.1' ||
    url.hostname === 'localhost' && url.pathname.includes('/api/')
  ) {
    return;
  }

  // JS/CSS assets from Vite: Network first, short cache fallback
  if (url.pathname.includes('/assets/') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Navigation: Network first, fallback to cached /
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          // Only cache valid responses
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put('/', clone));
          }
          return res;
        })
        .catch(() =>
          caches.match('/').then((cached) =>
            cached || new Response('<!DOCTYPE html><html><body><h1>Sem ligação</h1><p>Verifica a tua ligação à internet.</p></body></html>', {
              headers: { 'Content-Type': 'text/html' }
            })
          )
        )
    );
    return;
  }

  // Everything else: Network first
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
