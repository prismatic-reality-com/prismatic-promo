/**
 * Project Mycelium — DD Command Service Worker
 * Klasifikace: DŮVĚRNÉ — Pouze tým prodávajícího
 * Verze: v1.0.0
 *
 * Strategie:
 *  - Předcache základního shellu (HTML/manifest/ikony/knihovny) při instalaci.
 *  - Cache-first pro ./_assets/ (knihovny, fonty, ikony).
 *  - Stale-while-revalidate pro .md a .html (obsah dossieru).
 *  - Network-first s fallbackem na cache pro vše ostatní same-origin.
 *  - Cross-origin runtime požadavky (fonty, mapy) jsou cachovány oportunně.
 */

const CACHE_VERSION = 'v1.2.0';
const SHELL_CACHE   = `mycelium-shell-${CACHE_VERSION}`;
const ASSET_CACHE   = `mycelium-assets-${CACHE_VERSION}`;
const CONTENT_CACHE = `mycelium-content-${CACHE_VERSION}`;
const RUNTIME_CACHE = `mycelium-runtime-${CACHE_VERSION}`;

const ALL_CACHES = [SHELL_CACHE, ASSET_CACHE, CONTENT_CACHE, RUNTIME_CACHE];

// Základní shell: absolutní minimum potřebné pro offline boot.
const SHELL_URLS = [
  './',
  './index.html',
  './manifest.json',
  './README.md',
  './00-INDEX.md',
  './search.html',
  './sitemap.html',
  './executive-briefing.html',
  './export-pack.html',
  './EXECUTIVE-ONE-PAGER.md',
  './PPF-PLAYBOOK.md',
  './RED-FLAGS.md',
  './MASTER-FINDINGS.md',
  './METHODOLOGY.md',
  './LINK-AUDIT.md',
  './06-reports/red-flags-dashboard.html',
  './06-reports/valuation-calculator.html',
  './06-reports/monte-carlo-valuation.html',
  './06-reports/scenario-compare.html',
  './06-reports/live-ticker.html',
  './06-reports/MASTER-DD-REPORT-v1.0.md',
  './06-reports/VALUATION-DEFENSE-MEMO.md',
  './06-reports/MASTER-ACTION-PLAN.md',
  './06-reports/DATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md',
  './print-pack.html',
  './reader.html',
  './knowledge-graph.html',
  './_assets/cmdk.js',
  './_assets/dd-scenario.js',
  './_assets/dd-entity-index.js',
  './_assets/entity-mentions.json',
  './_assets/ticker-feed.json',
  './_assets/md-store.js',
  './_assets/manifest-store.js',
  './_assets/graph-store.js',
  './_assets/flowbite.min.css',
  './_assets/tailwind.min.js',
  './_assets/alpine.min.js',
  './_assets/chart.min.js',
  './_assets/flowbite.min.js',
  './_assets/icon-192.png',
  './_assets/icon-512.png'
];

// ---------- INSTALL ----------
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    // Použít Promise.allSettled, aby jeden chybějící soubor nepřerušil instalaci.
    const results = await Promise.allSettled(
      SHELL_URLS.map((u) => cache.add(new Request(u, { cache: 'reload' })))
    );
    const failed = results
      .map((r, i) => (r.status === 'rejected' ? SHELL_URLS[i] : null))
      .filter(Boolean);
    if (failed.length) {
      console.warn('[SW] shell precache partial — missing:', failed);
    }
    await self.skipWaiting();
  })());
});

// ---------- ACTIVATE ----------
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Odstranit zastaralé cache ze starších verzí.
    const names = await caches.keys();
    await Promise.all(
      names
        .filter((n) => n.startsWith('mycelium-') && !ALL_CACHES.includes(n))
        .map((n) => caches.delete(n))
    );
    await self.clients.claim();
  })());
});

// ---------- MESSAGE (skipWaiting trigger) ----------
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ---------- FETCH ROUTER ----------
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Přeskočit non-GET (formuláře, API atd.)
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // ./_assets/* — cache first (knihovny jsou pro tento release neměnné).
  if (sameOrigin && url.pathname.includes('/_assets/')) {
    event.respondWith(cacheFirst(req, ASSET_CACHE));
    return;
  }

  // .md nebo .html obsah dossieru — stale-while-revalidate.
  if (sameOrigin && /\.(md|html)$/i.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(req, CONTENT_CACHE));
    return;
  }

  // Same-origin catch-all (JSON, obrázky atd.) — network-first s fallbackem.
  if (sameOrigin) {
    event.respondWith(networkFirst(req, CONTENT_CACHE));
    return;
  }

  // Cross-origin (fonty, mapy, telemetrie) — runtime cache, stale-while-revalidate.
  event.respondWith(staleWhileRevalidate(req, RUNTIME_CACHE));
});

// ---------- STRATEGIES ----------

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    // Poslední možnost při miss assetu — vyrobit 504.
    return new Response('Offline: asset není v cache', {
      status: 504,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(req);
    if (hit) return hit;
    // Fallback na shell pro navigace, abychom nikdy nezobrazili Chrome dinosaura.
    if (req.mode === 'navigate') {
      const shell = await caches.open(SHELL_CACHE);
      const indexHit = await shell.match('./index.html');
      if (indexHit) return indexHit;
    }
    return new Response('Offline: obsah není v cache', {
      status: 504,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  const fetchPromise = fetch(req)
    .then((res) => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => hit || new Response('Offline', { status: 504 }));
  return hit || fetchPromise;
}
