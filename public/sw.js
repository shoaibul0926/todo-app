// Offline support, hand-written (no build plugin).
// - Install: precache index.html and every ./relative asset it references (hashed JS/CSS, icons, manifest).
// - Pages: network first, so a new deploy shows up right away; the cached copy is used when offline.
// - Same-origin files: cache first (hashed assets never change).
// - Google Fonts: served from cache and refreshed in the background.
// Bump VERSION to drop everything cached by older versions.
const VERSION = 'v2'
const CACHE = `today-${VERSION}`
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com']

const scopeUrl = (path = '') => new URL(path, self.registration.scope).href
const isCacheable = (res) => res && (res.ok || res.type === 'opaque')

async function precache() {
  const cache = await caches.open(CACHE)
  const indexRes = await fetch(new Request(scopeUrl(), { cache: 'reload' }))
  if (!indexRes.ok) throw new Error(`Could not fetch the app shell (${indexRes.status})`)
  const html = await indexRes.clone().text()
  await cache.put(scopeUrl(), indexRes)

  // Every src="./..." and href="./..." in index.html: hashed bundles, icons and the manifest.
  const assets = [...html.matchAll(/(?:src|href)="(\.\/[^"]+)"/g)].map((m) => scopeUrl(m[1]))
  await cacheAll(cache, assets)

  // Icons are only referenced from the manifest, so read it too.
  const manifestUrl = assets.find((url) => url.endsWith('.webmanifest'))
  if (manifestUrl) {
    const manifest = await (await cache.match(manifestUrl))?.json()
    await cacheAll(cache, (manifest?.icons ?? []).map((icon) => new URL(icon.src, manifestUrl).href))
  }
}

async function cacheAll(cache, urls) {
  await Promise.all(
    [...new Set(urls)].map(async (url) => {
      const res = await fetch(new Request(url, { cache: 'reload' }))
      if (res.ok) await cache.put(url, res)
    }),
  )
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys()
      await Promise.all(names.filter((n) => n.startsWith('today-') && n !== CACHE).map((n) => caches.delete(n)))
      await self.clients.claim()
    })(),
  )
})

async function networkFirstPage(request) {
  const cache = await caches.open(CACHE)
  try {
    const res = await fetch(request)
    if (res.ok) cache.put(scopeUrl(), res.clone())
    return res
  } catch {
    return (await cache.match(request, { ignoreSearch: true })) ?? (await cache.match(scopeUrl())) ?? Response.error()
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE)
  const hit = await cache.match(request)
  if (hit) return hit
  const res = await fetch(request)
  if (isCacheable(res)) cache.put(request, res.clone())
  return res
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE)
  const hit = await cache.match(request)
  const refresh = fetch(request)
    .then((res) => {
      if (isCacheable(res)) cache.put(request, res.clone())
      return res
    })
    .catch(() => undefined)
  return hit ?? (await refresh) ?? Response.error()
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(request))
  } else if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request))
  } else if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(request))
  }
})
