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

// --- Web Push handler ---------------------------------------------------
// Backend sends payloads like:
// { "title": "...", "body": "...", "url": "/sessions", "tag": "wallet" }
self.addEventListener("push", (event) => {
  let data = {}
  try { data = event.data ? event.data.json() : {} } catch { data = {} }
  const title = data.title || "Konnectik"
  const options = {
    body: data.body || "",
    icon: "/logo-red.png",
    badge: "/logo-red.png",
    tag: data.tag || "konnectik",
    data: { url: data.url || "/" },
    renotify: !!data.tag,
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const target = (event.notification.data && event.notification.data.url) || "/"
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if ("focus" in w) { w.navigate(target); return w.focus() }
      }
      if (self.clients.openWindow) return self.clients.openWindow(target)
    })
  )
})
