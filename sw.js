const CACHE_NAME = 'macau-draw-v18'; // 版本更新

const ASSETS = [
  './',
  './index.html',
  './icon.png',
  './style.css',
  './app.js',
  './data.js'
];

self.addEventListener('install', e => {
  self.skipWaiting(); 
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS); 
    })
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || e.request.url.includes('firestore') || e.request.url.includes('google')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(response => {
      if (response) {
        return response; 
      }
      return fetch(e.request).then(fetchRes => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, fetchRes.clone());
          return fetchRes;
        });
      });
    }).catch(() => {
      return caches.match('./index.html');
    })
  );
});
