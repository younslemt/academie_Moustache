/* Académie Moustache — service worker (seulement sur le vrai site, jamais dans l'Artifact Claude).
   - pages : réseau d'abord (toujours la dernière version), copie de secours hors ligne ;
   - icônes, manifeste : cache ;
   - polices Google : cache puis mise à jour en arrière-plan ;
   - vidéos et lecteur YouTube : jamais interceptés (lecture et avance rapide normales). */
const VERSION = "__VERSION__";
const CACHE = "academie-moustache-" + VERSION;
const SHELL = ["/", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png", "/icons/favicon.svg", "/icons/favicon-32.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("academie-moustache-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.pathname.startsWith("/videos/") || req.headers.has("range")) return;
  if (req.mode === "navigate"){
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put("/", copy)); return r; }).catch(() => caches.match("/")));
    return;
  }
  if (url.origin === location.origin){
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok && /^\/icons\//.test(url.pathname)) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; })));
    return;
  }
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com"){
    e.respondWith(caches.open(CACHE).then(c => c.match(req).then(hit => { const net = fetch(req).then(r => { if (r.ok || r.type === "opaque") c.put(req, r.clone()); return r; }).catch(() => hit); return hit || net; })));
  }
});
