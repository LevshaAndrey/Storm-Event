const VERSION = 'storm-trip-v1'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Network-only by design: search results must never be served from a stale cache.
// The fetch handler still makes the PWA installable in Chrome.
self.addEventListener('fetch', () => {})
