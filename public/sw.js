const CACHE_NAME = 'site-cache-v1';
const ASSETS = [
    '/', // Cache root if needed
    '/index.html',
    '/styles.css',
    '/tabs.js',
    '/custom-elements-builtin.js',
    '/x-frame-bypass.js',
    '/6475165.png',
    '/globe-icon-2048x2048-5ralwwgx.png',
];

// Install event - Cache files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});

// Fetch event - Serve cached assets
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request);
        })
    );
});

// Apply service worker behavior to /frame route if needed
self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('/frame')) {
        event.respondWith(
            caches.match('/index.html').then((cachedResponse) => {
                return cachedResponse || fetch(event.request);
            })
        );
    }
});