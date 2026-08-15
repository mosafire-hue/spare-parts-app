const CACHE_NAME = 'spare-parts-v3';
const urlsToCache = ['/', '/index.html', '/manifest.json'];

// عند التثبيت: احفظ الملفات
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// عند التفعيل: امسح الذاكرة القديمة
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// عند كل طلب: أظهر من الذاكرة فوراً، وحدّث من الإنترنت خلفياً
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      const fetchPromise = fetch(e.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return networkResponse;
      }).catch(() => response);
      return response || fetchPromise;
    })
  );
});
