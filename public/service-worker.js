const CACHE_NAME = 'greenmap-v1.0.0';
const urlsToCache = ['/', '/index.html', '/manifest.json', '/favicon.svg'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME)
                        return caches.delete(cacheName);
                    return Promise.resolve();
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // 성공한 응답(200-299)만 캐싱, 404 등은 캐싱하지 않음
                if (
                    event.request.method === 'GET' &&
                    response.status >= 200 &&
                    response.status < 300
                ) {
                    const responseClone = response.clone();
                    caches
                        .open(CACHE_NAME)
                        .then((cache) =>
                            cache.put(event.request, responseClone)
                        );
                }

                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
