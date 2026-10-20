/* Service worker TKA ICG: buka cepat & tetap jalan tanpa internet.
   Naikkan VERSION setiap kali isi situs diperbarui agar cache lama dibersihkan. */
const VERSION = 'tka-icg-2026-10-20-v4';
const FONT_CACHE = 'tka-icg-fonts';
const CORE = [
  './', 'index.html', '404.html', 'manifest.webmanifest',
  'assets/portal.css', 'assets/portal.js', 'assets/catalog.js', 'assets/kisi.js',
  'assets/icons/icon.svg', 'assets/icons/icon-192.png', 'assets/icons/icon-512.png', 'assets/icons/favicon-32.png',
  'apps/tryout.html', 'apps/tryout.css', 'apps/tryout.js',
  'apps/literasi.css', 'apps/literasi.js', 'apps/bindo.html', 'apps/bing.html',
  'data/bindo.js', 'data/bing.js'
];
const HEAVY = [
  'apps/matwajib.html', 'apps/matlanjut.html', 'apps/fisika.html', 'apps/kimia.html', 'apps/biologi.html', 'apps/ekonomi.html',
  'data/bank-matwajib.js', 'data/bank-matlanjut.js', 'data/bank-fisika.js', 'data/bank-kimia.js', 'data/bank-biologi.js', 'data/bank-ekonomi.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== FONT_CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('message', e => {
  if (!e.data || e.data.type !== 'cache-all') return;
  e.waitUntil(caches.open(VERSION).then(async c => {
    let n = 0;
    for (const u of CORE.concat(HEAVY)) { try { await c.add(u); n++; } catch (err) {} }
    const clients = await self.clients.matchAll();
    clients.forEach(cl => cl.postMessage({ type: 'cached', n }));
  }));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(FONT_CACHE).then(async c => {
      const hit = await c.match(req);
      if (hit) return hit;
      try { const res = await fetch(req); if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; } catch (err) { return new Response('', { status: 504 }); }
    }));
    return;
  }
  if (url.origin !== self.location.origin) return;
  e.respondWith(caches.open(VERSION).then(async c => {
    const key = url.pathname.endsWith('/') ? new Request(new URL('index.html', url).href) : req;
    const hit = await c.match(key, { ignoreSearch: true });
    const net = fetch(req).then(res => { if (res.ok) c.put(key, res.clone()); return res; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    const res = await net;
    if (res) return res;
    if (req.mode === 'navigate') return (await c.match('index.html')) || new Response('Offline', { status: 503 });
    return new Response('', { status: 504 });
  }));
});
