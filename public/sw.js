// Minimal service worker — offline shell + tile cache for Leaflet.
const CACHE = "konnectik-v1"
const SHELL = ["/", "/logo-red.png", "/logo-white.png", "/manifest.json"]

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}))
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  const req = event.request
  if (req.method !== "GET") return

  const url = new URL(req.url)
  // Never cache Supabase or POST/auth calls
  if (url.host.includes("supabase.co")) return

  // OSM tiles: cache-first
  if (url.host.includes("tile.openstreetmap.org")) {
    event.respondWith(
      caches.open(CACHE).then((cache) =>
        cache.match(req).then((hit) => {
          if (hit) return hit
          return fetch(req).then((res) => {
            if (res.ok) cache.put(req, res.clone())
            return res
          })
        })
      )
    )
    return
  }

  // App shell: network-first, fallback to cache
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && url.origin === self.location.origin) {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(req, copy))
        }
        return res
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match("/")))
  )
})
