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
                const responseClone = response.clone();
                if (event.request.method === 'GET') {
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
