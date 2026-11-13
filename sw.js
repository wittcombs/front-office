// Offline worker for Front Office League. Build 1b8134f872ac.
const CACHE = 'fol-1b8134f872ac';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
});

// A new version waits until you tap "Update now", so a game in progress never reloads by surprise.
self.addEventListener('message', (e) => { if (e.data === 'activate') self.skipWaiting(); });

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith('fol-') && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// The game is served from the copy on the device, so it opens instantly and works with no connection.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async (c) => {
    const key = e.request.mode === 'navigate' ? 'index.html' : e.request;
    const hit = await c.match(key, { ignoreSearch: true });
    if (hit) return hit;
    try { return await fetch(e.request); } catch { return (await c.match('index.html')) || Response.error(); }
  }));
});
