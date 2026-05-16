const CACHE_NAME = 'macau-draw-v6'; // ⚠️ 每次更新網頁內容時，請務必手動將這裡的 v3 改為 v4, v5...

const ASSETS = [
  './',
  './index.html',
  './icon.png',
  './style.css',
  './app.js'
];

self.addEventListener('install', e => {
  self.skipWaiting(); // 強制立刻安裝新的 Service Worker
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS); // 只在版本號改變時，才會消耗流量重新下載
    })
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        // 刪除舊版本緩存，釋放空間
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

  // 改回 Cache-First (快取優先)：達到平時 0 流量消耗！
  e.respondWith(
    caches.match(e.request).then(response => {
      if (response) {
        return response; // 命中本地快取，直接返回，不吃 Netlify 流量
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