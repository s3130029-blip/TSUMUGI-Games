/* ============================================================
   service-worker.js  -  オフライン対応(キャッシュ)
   ファイルを更新したら CACHE のバージョン名を変えてください。
   ============================================================ */

const CACHE = 'oekaki-v2';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './css/style.css',
  './js/app.js',
  './js/data.js',
  './js/canvas.js',
  './js/history.js',
  './js/fill.js',
  './js/sound.js',
];

// インストール: 必要ファイルを先読みキャッシュ
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

// 古いキャッシュを削除
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 取得: キャッシュ優先 → なければネット
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((hit) => {
      if (hit) return hit;
      return fetch(e.request)
        .then((res) => {
          // 同一オリジンのものは取得ついでにキャッシュ
          if (res.ok && e.request.url.startsWith(self.location.origin)) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
