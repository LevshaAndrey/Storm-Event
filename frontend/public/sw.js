const VERSION = 'storm-trip-v2'
const SHELL_CACHE = `${VERSION}-shell`
const STATIC_CACHE = `${VERSION}-static`
const API_CACHE = `${VERSION}-api`
const SHELL_ASSETS = ['/', '/index.html', '/manifest.webmanifest', '/icon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .catch(() => undefined)
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('storm-trip-') && !key.startsWith(VERSION))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

function isCatalogRequest(url) {
  return url.pathname === '/api/event-categories' || url.pathname === '/api/localities'
}

function isFeedRequest(url) {
  return url.pathname === '/api/events'
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/assets/') ||
    /\.(?:css|js|mjs|svg|png|jpg|jpeg|webp|woff2?|webmanifest)$/.test(url.pathname)
  )
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  try {
    const response = await fetch(request)
    if (response.ok) cache.put(request, response.clone())
    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    throw new Error('offline')
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone())
      return response
    })
    .catch(() => null)
  return cached || (await network) || Response.error()
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok) cache.put(request, response.clone())
  return response
}

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Поиск и чат всегда идут в сеть: устаревшие предложения хуже, чем ошибка.
  if (url.pathname.startsWith('/api/search') || url.pathname.startsWith('/api/chat')) return

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, SHELL_CACHE).catch(() => caches.match('/index.html')))
    return
  }

  if (isCatalogRequest(url)) {
    event.respondWith(staleWhileRevalidate(request, API_CACHE))
    return
  }

  if (isFeedRequest(url)) {
    event.respondWith(networkFirst(request, API_CACHE))
    return
  }

  if (url.pathname.startsWith('/api/')) return

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus()
      }
      return self.clients.openWindow('/')
    })
  )
})
