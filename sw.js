// MindMitra Offline-First Service Worker
// Versioned Application Shell & Offline Asset Caching
// Strictly non-blocking, safe cache invalidation without touching user data

const CACHE_NAME = 'mindmitra-shell-v1';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/styles/tokens.css',
  '/styles/app.css',
  '/src/app.js',
  '/src/router.js',
  '/src/state/store.js',
  '/src/state/database.js',
  '/src/services/storageService.js',
  '/src/services/offlineSyncService.js',
  '/src/services/activityRegistry.js',
  '/src/services/memoryService.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Gracefully attempt caching core assets without failing install if a single asset is 404
      return Promise.allSettled(
        CORE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[SW] Pre-cache skipped for ${url}:`, err.message);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name.startsWith('mindmitra-'))
          .map((name) => {
            console.log(`[SW] Deleting legacy cache: ${name}`);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);
  const isSensitive = 
    url.pathname.startsWith('/api/') ||
    url.pathname.includes('auth') ||
    url.pathname.includes('token') ||
    url.pathname.includes('session') ||
    url.pathname.includes('emergency') ||
    url.pathname.includes('reports') ||
    url.searchParams.has('token') ||
    url.searchParams.has('secret');

  // Network-First Strategy with Cache Fallback for static assets only
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache valid responses for core static assets only (never cache sensitive data)
        if (
          !isSensitive &&
          networkResponse &&
          networkResponse.status === 200 &&
          event.request.url.startsWith(self.location.origin)
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // Network failed: Serve from cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // For navigation requests, fallback to index.html application shell
        if (event.request.mode === 'navigate') {
          const shell = await caches.match('/index.html') || await caches.match('/');
          if (shell) {
            return shell;
          }
        }

        // Generic offline fallback response
        return new Response('MindMitra is currently in offline mode. Your data is safely saved on this device.', {
          status: 503,
          statusText: 'Offline',
          headers: { 'Content-Type': 'text/plain' }
        });
      })
  );
});
