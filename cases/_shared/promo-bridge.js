/* Prismatic promo bridge — DRY back-navigation pill for case dashboards.
 * Loaded by every case index.html via:
 *   <script src="/cases/_shared/promo-bridge.js" defer></script>
 *
 * Renders a small floating "← Prismatic Cases" link in the top-left corner
 * pointing at the cases listing on the promo site. Honors prefers-reduced-motion,
 * dark/light backgrounds (uses backdrop-blur + auto-contrast), and stays out of
 * the way (z-index 9999 but pointer-events: auto on a 32px hit area).
 *
 * Skip injection by setting `window.__PRISMATIC_NO_BRIDGE = true` before this
 * script loads (e.g., for embedded/iframe usage).
 */
(function () {
  if (typeof window === 'undefined') return;
  if (window.__PRISMATIC_NO_BRIDGE) return;
  if (document.getElementById('prismatic-bridge-pill')) return;

  function listingHref() {
    // Three contexts:
    //   1. http(s) under any host serving /cases/ (Zola promo OR Phoenix dev) → relative root path
    //   2. file:// preview                                                    → absolute promo URL
    //   3. anything else (loaded from a non-/cases/ path)                     → absolute promo URL
    if (location.protocol !== 'file:') {
      var p = location.pathname;
      var idx = p.indexOf('/cases/');
      if (idx >= 0) return p.substring(0, idx) + '/cases/';
    }
    return 'https://prismatic-reality-com.github.io/prismatic-promo/cases/';
  }

  function injectStyles() {
    if (document.getElementById('prismatic-bridge-style')) return;
    const s = document.createElement('style');
    s.id = 'prismatic-bridge-style';
    s.textContent = [
      '#prismatic-bridge-pill{',
      'position:fixed;top:10px;left:10px;z-index:9999;',
      'display:inline-flex;align-items:center;gap:6px;',
      'padding:6px 10px;border-radius:999px;',
      'font:600 11px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",Inter,sans-serif;',
      'letter-spacing:0.02em;text-decoration:none;color:#0f172a;',
      'background:rgba(255,255,255,0.85);',
      'backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);',
      'border:1px solid rgba(15,23,42,0.12);',
      'box-shadow:0 1px 3px rgba(0,0,0,0.08);',
      'transition:transform 120ms ease, background 120ms ease, color 120ms ease;',
      '}',
      '#prismatic-bridge-pill:hover{transform:translateY(-1px);background:rgba(255,255,255,1);color:#1e3a8a}',
      '#prismatic-bridge-pill:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}',
      '#prismatic-bridge-pill .pb-arrow{font-size:13px;line-height:1}',
      '#prismatic-bridge-pill .pb-label{opacity:0.85}',
      '@media (prefers-color-scheme: dark){',
      '#prismatic-bridge-pill{background:rgba(15,23,42,0.85);color:#e2e8f0;border-color:rgba(255,255,255,0.15)}',
      '#prismatic-bridge-pill:hover{background:rgba(15,23,42,1);color:#93c5fd}',
      '}',
      '@media (prefers-reduced-motion: reduce){',
      '#prismatic-bridge-pill{transition:none}',
      '#prismatic-bridge-pill:hover{transform:none}',
      '}',
      '@media print{#prismatic-bridge-pill{display:none}}'
    ].join('');
    document.head.appendChild(s);
  }

  function inject() {
    injectStyles();
    const a = document.createElement('a');
    a.id = 'prismatic-bridge-pill';
    a.href = listingHref();
    a.title = 'Zpět na všechny DD case dashboardy';
    a.setAttribute('aria-label', 'Zpět na seznam Prismatic case studií');

    const arrow = document.createElement('span');
    arrow.className = 'pb-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '←'; // ←

    const label = document.createElement('span');
    label.className = 'pb-label';
    label.textContent = 'Prismatic Cases';

    a.appendChild(arrow);
    a.appendChild(label);
    document.body.appendChild(a);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject, { once: true });
  } else {
    inject();
  }
})();
