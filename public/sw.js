const CACHE = "cactusbyte-studios-v1.1.1";
const CORE = ["/logo2.png", "/manifest.webmanifest", "/ffm-mark.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)).catch(() => undefined));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  const sameOrigin = url.origin === self.location.origin;

  // Never let an old registry response or old Next.js bundle override a new deployment.
  if (sameOrigin && (url.pathname.startsWith("/api/registry") || url.pathname.startsWith("/_next/"))) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Navigations are network-first so a newly deployed registry is shown immediately.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request, { cache: "no-store" })
        .then((response) => response)
        .catch(() => caches.match("/"))
    );
    return;
  }

  // Local static branding can be cached, but refresh it from the network when available.
  if (sameOrigin) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
});
