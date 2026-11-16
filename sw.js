// Offline worker for Front Office League. Build 3e7877e0c1e2.
const CACHE = 'fol-3e7877e0c1e2';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

// A new worker takes over at once (it only decides where the next page load comes from; it never reloads one).
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith('fol-') && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  // Opening the app: the newest version when online (checked with the server, so nothing re-downloads unless
  // it changed), the copy on the device when offline.
  if (e.request.mode === 'navigate') {
    e.respondWith((async () => {
      const c = await caches.open(CACHE);
      try {
        const r = await fetch('index.html', { cache: 'no-cache' });
        if (r.ok) { c.put('index.html', r.clone()); return r; }
      } catch {}
      return (await c.match('index.html')) || Response.error();
    })());
    return;
  }
  e.respondWith(caches.open(CACHE).then(async (c) => (await c.match(e.request, { ignoreSearch: true })) || fetch(e.request)));
});
