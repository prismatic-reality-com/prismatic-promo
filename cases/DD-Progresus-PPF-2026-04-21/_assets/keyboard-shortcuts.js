/* Global Keyboard Shortcuts — vim-flavoured + command palette trigger.
 * Safe DOM (no innerHTML). Idempotent: only registers once.
 */
(function () {
  'use strict';
  if (window.KeyboardShortcuts && window.KeyboardShortcuts.__initialized) return;

  function rel(depth) { return depth <= 1 ? './' : '../'.repeat(depth - 1); }
  function computeDepth() { return Math.max(1, location.pathname.split('/').filter(Boolean).length); }
  function resolve(p) { return rel(computeDepth()) + p; }
  function go(path) { location.href = resolve(path); }

  const GOTO = {
    h: { path: 'index.html', label: 'Home (portal)' },
    s: { path: 'search.html', label: 'Search' },
    m: { path: 'sitemap.html', label: 'Sitemap' },
    r: { path: '06-reports/red-flags-dashboard.html', label: 'Red Flags Dashboard' },
    v: { path: '06-reports/valuation-calculator.html', label: 'Valuation Calculator' },
    t: { path: '06-reports/deal-journey.html', label: 'Timeline (deal journey)' },
    e: { path: '02-entity/entity-graph.html', label: 'Entity Graph' },
    c: { path: '08-comms-templates/comms-hub.html', label: 'Comms Hub' },
    p: { path: 'PPF-PLAYBOOK.md', label: 'PPF Playbook (markdown)' }
  };

  const SHORTCUTS = [
    { combo: 'Cmd/Ctrl + K', label: 'Open command palette', cat: 'Navigation' },
    { combo: 'g h', label: 'Go to portal (home)', cat: 'Navigation' },
    { combo: 'g s', label: 'Go to search', cat: 'Navigation' },
    { combo: 'g m', label: 'Go to sitemap', cat: 'Navigation' },
    { combo: 'g r', label: 'Go to red flags dashboard', cat: 'Navigation' },
    { combo: 'g v', label: 'Go to valuation calculator', cat: 'Navigation' },
    { combo: 'g t', label: 'Go to deal journey timeline', cat: 'Navigation' },
    { combo: 'g e', label: 'Go to entity graph', cat: 'Navigation' },
    { combo: 'g c', label: 'Go to comms hub', cat: 'Navigation' },
    { combo: 'g p', label: 'Go to PPF playbook', cat: 'Navigation' },
    { combo: '/', label: 'Focus search input', cat: 'Search' },
    { combo: 'j', label: 'Scroll down (vim)', cat: 'Search' },
    { combo: 'k', label: 'Scroll up (vim)', cat: 'Search' },
    { combo: 'd', label: 'Toggle dark mode', cat: 'Display' },
    { combo: '?', label: 'Show this help modal', cat: 'Display' },
    { combo: 'Esc', label: 'Close modal / exit focus', cat: 'Display' }
  ];

  const state = { awaitingG: false, gTimer: null };

  function el(tag, attrs, children) {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    }
    if (children) (Array.isArray(children) ? children : [children]).forEach(c => {
      if (c == null) return;
      n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return n;
  }

  function isTypingTarget(t) {
    if (!t) return false;
    const tag = (t.tagName || '').toUpperCase();
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable;
  }

  function toggleDark() {
    const current = localStorage.getItem('dd-dark') !== 'false';
    const next = !current;
    localStorage.setItem('dd-dark', String(next));
    document.documentElement.classList.toggle('dark', next);
    if (window.StateSync) window.StateSync.publish('darkMode', next);
  }

  function focusSearch() {
    const sel = [
      'input[type="search"]', 'input[data-search]', 'input[name="q"]',
      'input[placeholder*="search" i]', 'input[aria-label*="search" i]',
      '[role="search"] input'
    ].join(',');
    const input = document.querySelector(sel);
    if (input) { input.focus(); return true; }
    return false;
  }

  const HELP_ID = 'mycelium-keyboard-help';
  function openHelp() {
    if (document.getElementById(HELP_ID)) return;
    const backdrop = el('div', { class: 'absolute inset-0 bg-gray-900/70 backdrop-blur-sm', 'data-kh-backdrop': '1' });
    const close = el('button', {
      type: 'button', class: 'text-gray-400 hover:text-gray-900 dark:hover:text-white',
      'aria-label': 'Close'
    }, ['✕']);
    const header = el('div', { class: 'flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700' }, [
      el('h2', { class: 'text-lg font-semibold text-gray-900 dark:text-white', text: 'Keyboard Shortcuts' }),
      close
    ]);
    const body = el('div', { class: 'p-5 max-h-[60vh] overflow-y-auto' });
    const categories = {};
    SHORTCUTS.forEach(s => { (categories[s.cat] = categories[s.cat] || []).push(s); });
    Object.keys(categories).forEach(cat => {
      body.appendChild(el('h3', { class: 'text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-4 first:mt-0 mb-2', text: cat }));
      const tbl = el('table', { class: 'w-full text-sm' });
      const tbody = el('tbody');
      categories[cat].forEach(s => {
        const row = el('tr', { class: 'border-b border-gray-100 dark:border-gray-700' }, [
          el('td', { class: 'py-1.5 pr-4 w-40' }, [
            el('kbd', { class: 'inline-block px-2 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded', text: s.combo })
          ]),
          el('td', { class: 'py-1.5 text-gray-700 dark:text-gray-300', text: s.label })
        ]);
        tbody.appendChild(row);
      });
      tbl.appendChild(tbody);
      body.appendChild(tbl);
    });

    const card = el('div', { class: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden' }, [header, body]);
    const inner = el('div', { class: 'relative mx-auto mt-[10vh] w-full max-w-2xl px-4' }, [card]);
    const wrap = el('div', { id: HELP_ID, class: 'fixed inset-0 z-[99998]' }, [backdrop, inner]);
    document.body.appendChild(wrap);
    const closeFn = () => wrap.remove();
    close.addEventListener('click', closeFn);
    backdrop.addEventListener('click', closeFn);
    const esc = (e) => { if (e.key === 'Escape') { closeFn(); document.removeEventListener('keydown', esc, true); } };
    document.addEventListener('keydown', esc, true);
  }

  function onKeyDown(e) {
    // Cmd/Ctrl+K handled in cmdk.js itself.
    if (isTypingTarget(e.target)) {
      // Still allow Escape to blur.
      if (e.key === 'Escape' && typeof e.target.blur === 'function') e.target.blur();
      return;
    }

    // g <letter> sequence
    if (state.awaitingG) {
      clearTimeout(state.gTimer);
      state.awaitingG = false;
      const target = GOTO[e.key.toLowerCase()];
      if (target) { e.preventDefault(); go(target.path); return; }
      return;
    }

    if (e.key === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey) {
      state.awaitingG = true;
      state.gTimer = setTimeout(() => { state.awaitingG = false; }, 1200);
      return;
    }

    if (e.key === '?' || (e.shiftKey && e.key === '/')) { e.preventDefault(); openHelp(); return; }
    if (e.key === 'd' && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); toggleDark(); return; }
    if (e.key === '/' && !e.shiftKey) {
      if (focusSearch()) { e.preventDefault(); return; }
    }
    if (e.key === 'j') { window.scrollBy({ top: 80, behavior: 'smooth' }); return; }
    if (e.key === 'k') { window.scrollBy({ top: -80, behavior: 'smooth' }); return; }
    if (e.key === 'Escape') {
      const help = document.getElementById(HELP_ID);
      if (help) help.remove();
    }
  }

  window.KeyboardShortcuts = {
    __initialized: true,
    init() { document.addEventListener('keydown', onKeyDown); },
    openHelp,
    shortcuts: SHORTCUTS
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => window.KeyboardShortcuts.init());
  else window.KeyboardShortcuts.init();
})();
