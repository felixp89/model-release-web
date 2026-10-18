/* Offline-Funktion: App-Dateien zwischenspeichern, Updates beim nächsten Start laden */
const CACHE = "model-release-__BUILD__";
const FILES = ["./", "index.html", "web-bridge.js", "jspdf.umd.min.js", "manifest.webmanifest",
  "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png",
  "fonts/instrument-sans-400.woff2", "fonts/instrument-sans-500.woff2", "fonts/instrument-sans-600.woff2",
  "fonts/instrument-sans-700.woff2", "fonts/source-serif-4-400.woff2", "fonts/source-serif-4-600.woff2"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(FILES.map(f => c.add(f).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if(e.request.method !== "GET" || url.origin !== location.origin) return;   // Lizenz-Abrufe gehen direkt ins Netz
  e.respondWith(
    fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match("index.html")))
  );
});
