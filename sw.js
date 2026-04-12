const CACHE_NAME = 'gennyaku-manager-v3'; 

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://mashiroqun.github.io/-/icon.png',
  './icon.png?v=2'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    // ignoreSearch: true で「?v=2」などの違いを無視して確実にキャッシュをヒットさせます
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        // 万が一オフライン時にURLがズレてエラーになりかけた場合、強制的にアプリの画面(index.html)を返します
        if (event.request.mode === 'navigate' || event.request.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
