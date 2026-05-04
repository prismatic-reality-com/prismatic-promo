/* Command Palette — Cmd+K / Ctrl+K modal with fuzzy search.
 * All DOM built with createElement/textContent (no innerHTML) for safety.
 * Usage: auto-initializes on DOMContentLoaded.
 */
(function () {
  'use strict';
  if (window.CommandPalette && window.CommandPalette.__initialized) return;

  const LS_RECENTS = 'mycelium:cp:recents';
  const LS_MAX_RECENTS = 8;
  const MODAL_ID = 'mycelium-command-palette';

  const state = {
    manifest: null,
    dashboards: [],
    commands: new Map(),
    recents: [],
    open: false,
    results: [],
    selected: 0,
    query: ''
  };

  const el = (tag, attrs, children) => {
    const node = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (k === 'class') node.className = v;
        else if (k === 'text') node.textContent = v;
        else if (k === 'onClick') node.addEventListener('click', v);
        else if (k.startsWith('data-')) node.setAttribute(k, v);
        else node.setAttribute(k, v);
      }
    }
    if (children) {
      (Array.isArray(children) ? children : [children]).forEach(c => {
        if (c == null) return;
        node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      });
    }
    return node;
  };

  function rel(depth) { return depth <= 1 ? './' : '../'.repeat(depth - 1); }

  function computeDepth() {
    const parts = location.pathname.split('/').filter(Boolean);
    return Math.max(1, parts.length);
  }

  function loadRecents() {
    try {
      const raw = localStorage.getItem(LS_RECENTS);
      state.recents = raw ? JSON.parse(raw) : [];
    } catch (e) { state.recents = []; }
  }

  function saveRecent(item) {
    state.recents = [item, ...state.recents.filter(r => r.id !== item.id)].slice(0, LS_MAX_RECENTS);
    try { localStorage.setItem(LS_RECENTS, JSON.stringify(state.recents)); } catch (e) {}
  }

  function fuzzyScore(needle, haystack) {
    if (!needle) return 1;
    const n = needle.toLowerCase();
    const h = (haystack || '').toLowerCase();
    if (h.includes(n)) return 100 - h.indexOf(n);
    let hi = 0, score = 0, streak = 0;
    for (let i = 0; i < n.length; i++) {
      const pos = h.indexOf(n[i], hi);
      if (pos === -1) return 0;
      streak = (pos === hi) ? streak + 1 : 0;
      score += 1 + streak;
      hi = pos + 1;
    }
    return score;
  }

  function buildDashboardList() {
    state.dashboards = [
      { id: 'portal', name: 'Portal (home)', path: 'index.html', icon: '🏠' },
      { id: 'sitemap', name: 'Sitemap', path: 'sitemap.html', icon: '🗺' },
      { id: 'search', name: 'Search', path: 'search.html', icon: '🔍' },
      { id: 'executive', name: 'Executive Briefing', path: 'executive-briefing.html', icon: '📊' },
      { id: 'export', name: 'Export Pack', path: 'export-pack.html', icon: '📦' },
      { id: 'red-flags', name: 'Red Flags Dashboard', path: '06-reports/red-flags-dashboard.html', icon: '🚩' },
      { id: 'valuation', name: 'Valuation Calculator', path: '06-reports/valuation-calculator.html', icon: '💰' },
      { id: 'roadmap', name: 'Roadmap Gantt', path: '06-reports/roadmap-gantt.html', icon: '📅' },
      { id: 'timeline', name: 'Deal Journey (timeline)', path: '06-reports/deal-journey.html', icon: '⏱' },
      { id: 'entity-graph', name: 'Entity Graph', path: '02-entity/entity-graph.html', icon: '🕸' },
      { id: 'parcel-map', name: 'Parcel Map', path: '02-entity/parcel-map.html', icon: '🗺' },
      { id: 'governance', name: 'PPF Governance', path: '01-intel/ppf-governance.html', icon: '🏛' },
      { id: 'stakeholders', name: 'Stakeholder Map', path: '01-intel/stakeholder-map.html', icon: '👥' },
      { id: 'comms-hub', name: 'Comms Hub', path: '08-comms-templates/comms-hub.html', icon: '✉' },
      { id: 'bond-stack', name: 'Bond Stack', path: '03-financial/bond-stack.html', icon: '📜' },
      { id: 'tax-calc', name: 'Tax Calculator', path: '03-financial/tax-calculator.html', icon: '🧮' },
      { id: 'keyboard-help', name: 'Keyboard Shortcuts Help', path: 'keyboard-help.html', icon: '⌨' }
    ];
  }

  function registerDefaultCommands() {
    const add = (id, label, icon, fn) => state.commands.set(id, { id, label, icon, fn, type: 'command' });
    add('toggle-dark', 'Toggle dark mode', '🌓', () => {
      const current = localStorage.getItem('dd-dark') !== 'false';
      const next = !current;
      localStorage.setItem('dd-dark', String(next));
      document.documentElement.classList.toggle('dark', next);
      if (window.StateSync) window.StateSync.publish('darkMode', next);
    });
    add('print-page', 'Print current page', '🖨', () => window.print());
    add('copy-url', 'Copy current page URL', '📋', async () => {
      try { await navigator.clipboard.writeText(location.href); toast('URL copied'); }
      catch (e) { toast('Copy failed'); }
    });
    add('go-back', 'Go back', '⬅', () => history.back());
    add('go-forward', 'Go forward', '➡', () => history.forward());
    add('show-help', 'Show keyboard shortcuts help', '❓', () => {
      if (window.KeyboardShortcuts && window.KeyboardShortcuts.openHelp) window.KeyboardShortcuts.openHelp();
      else navigateToPath('keyboard-help.html');
    });
    add('search-findings', 'Search all findings', '🔎', () => {
      const q = state.query;
      location.href = resolvePath('search.html') + (q ? ('?q=' + encodeURIComponent(q)) : '');
    });
  }

  function toast(msg) {
    const t = el('div', { class: 'fixed bottom-6 right-6 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-[100000] mycelium-toast', text: msg });
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 1800);
  }

  function resolvePath(targetPath) { return rel(computeDepth()) + targetPath; }
  function navigateToPath(targetPath) { location.href = resolvePath(targetPath); }

  async function loadManifest(url) {
    // Offline-first: prefer bundled DD_MANIFEST (works over file://).
    if (window.DD_MANIFEST) {
      state.manifest = window.DD_MANIFEST;
      return;
    }
    try {
      const res = await fetch(url, { cache: 'default' });
      if (!res.ok) throw new Error('status ' + res.status);
      state.manifest = await res.json();
    } catch (e) {
      console.warn('[CommandPalette] manifest load failed:', e.message);
      state.manifest = { files: [] };
    }
  }

  function search(q) {
    state.query = q;
    const results = [];
    const rfMatch = q.match(/^\s*rf[-\s]?(\d+)\s*$/i);
    if (rfMatch) {
      const n = rfMatch[1];
      results.push({
        id: 'rf-' + n, label: 'Red Flag RF-' + n, sub: 'Jump to red flags dashboard',
        icon: '🚩', type: 'command', score: 999,
        run: () => { location.href = resolvePath('06-reports/red-flags-dashboard.html#RF-' + n); }
      });
    }
    for (const d of state.dashboards) {
      const score = fuzzyScore(q, d.name + ' ' + d.id + ' ' + d.path);
      if (score > 0) results.push({
        id: 'dash:' + d.id, label: d.name, sub: d.path, icon: d.icon || '🎛',
        type: 'dashboard', score, run: () => navigateToPath(d.path)
      });
    }
    if (state.manifest && state.manifest.files) {
      for (const f of state.manifest.files) {
        const score = fuzzyScore(q, (f.title || '') + ' ' + (f.path || '') + ' ' + (f.dir || ''));
        if (score > 0) {
          const isMd = f.type === 'markdown';
          const sevSub = (f.severity && f.severity !== 'none') ? ' · ' + f.severity : '';
          // Primary entry: route markdown through reader.html for beautiful rendering.
          results.push({
            id: 'file:' + f.path,
            label: f.title || f.path,
            sub: f.path + sevSub + (isMd ? ' · 📖 reader' : ''),
            icon: isMd ? '📖' : '📁',
            type: 'file',
            score,
            run: () => isMd ? navigateToPath('reader.html?file=' + f.path) : navigateToPath(f.path)
          });
          // Secondary entry: raw markdown access (lower score to keep reader primary).
          if (isMd) {
            results.push({
              id: 'raw:' + f.path,
              label: 'Open raw markdown: ' + (f.title || f.path),
              sub: f.path + ' · source',
              icon: '📄',
              type: 'file',
              score: Math.max(1, score - 5),
              run: () => navigateToPath(f.path)
            });
            // Tertiary: new-tab via reader.
            results.push({
              id: 'newtab:' + f.path,
              label: 'Open in new tab via reader: ' + (f.title || f.path),
              sub: f.path + ' · new tab',
              icon: '🗗',
              type: 'file',
              score: Math.max(1, score - 8),
              run: () => window.open(resolvePath('reader.html?file=' + f.path), '_blank', 'noopener')
            });
          }
        }
      }
    }
    for (const c of state.commands.values()) {
      const score = fuzzyScore(q, c.label + ' ' + c.id);
      if (score > 0) results.push({
        id: 'cmd:' + c.id, label: c.label, sub: 'Command', icon: c.icon || '⚡',
        type: 'command', score, run: () => { c.fn(); close(); }
      });
    }
    if (q.length > 1 && !results.some(r => r.id === 'cmd:search-findings')) {
      results.push({
        id: 'cmd:search-findings', label: 'Search findings for "' + q + '"', sub: 'Go to search page',
        icon: '🔍', type: 'command', score: 50,
        run: () => { location.href = resolvePath('search.html') + '?q=' + encodeURIComponent(q); }
      });
    }
    results.sort((a, b) => (b.score || 0) - (a.score || 0));
    state.results = results.slice(0, 40);
    state.selected = 0;
    render();
  }

  function buildModal() {
    if (document.getElementById(MODAL_ID)) return;

    const backdrop = el('div', { class: 'absolute inset-0 bg-gray-900/70 backdrop-blur-sm', 'data-cp-backdrop': '1' });
    const searchIcon = (() => {
      const svgNs = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNs, 'svg');
      svg.setAttribute('class', 'w-5 h-5 text-gray-400');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('viewBox', '0 0 24 24');
      const path = document.createElementNS(svgNs, 'path');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      path.setAttribute('stroke-width', '2');
      path.setAttribute('d', 'M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z');
      svg.appendChild(path);
      return svg;
    })();
    const input = el('input', {
      type: 'text', placeholder: 'Type to search files, dashboards, commands…',
      class: 'flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400',
      'data-cp-input': '1'
    });
    const escKbd = el('kbd', { class: 'hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 rounded border border-gray-200 dark:border-gray-600', text: 'Esc' });

    const header = el('div', { class: 'flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700' }, [searchIcon, input, escKbd]);
    const resultsBox = el('div', { class: 'max-h-[60vh] overflow-y-auto text-sm', 'data-cp-results': '1' });
    const footer = el('div', { class: 'flex items-center justify-between px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50' }, [
      el('span', {}, [
        el('kbd', { class: 'font-mono', text: '↑↓' }), ' navigate · ',
        el('kbd', { class: 'font-mono', text: '↵' }), ' open · ',
        el('kbd', { class: 'font-mono', text: 'Esc' }), ' close'
      ]),
      el('span', { text: 'Command Palette' })
    ]);
    const card = el('div', { class: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden' }, [header, resultsBox, footer]);
    const inner = el('div', { class: 'relative mx-auto mt-[10vh] w-full max-w-2xl px-4' }, [card]);
    const wrap = el('div', { id: MODAL_ID, class: 'fixed inset-0 z-[99999] hidden' }, [backdrop, inner]);
    document.body.appendChild(wrap);

    input.addEventListener('input', (e) => search(e.target.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); state.selected = Math.min(state.selected + 1, state.results.length - 1); render(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); state.selected = Math.max(state.selected - 1, 0); render(); }
      else if (e.key === 'Enter') { e.preventDefault(); execute(state.selected); }
      else if (e.key === 'Escape') { e.preventDefault(); close(); }
    });
    backdrop.addEventListener('click', close);
  }

  function execute(idx) {
    const item = state.results[idx];
    if (!item) return;
    saveRecent({ id: item.id, label: item.label, sub: item.sub, icon: item.icon, type: item.type });
    const run = item.run;
    close();
    if (typeof run === 'function') setTimeout(run, 40);
  }

  function render() {
    const wrap = document.getElementById(MODAL_ID);
    if (!wrap) return;
    const box = wrap.querySelector('[data-cp-results]');
    while (box.firstChild) box.removeChild(box.firstChild);
    const showRecents = !state.query && state.recents.length > 0;
    const list = showRecents ? state.recents : state.results;

    if (!list.length) {
      box.appendChild(el('div', { class: 'p-6 text-center text-gray-500 dark:text-gray-400', text: 'No results.' }));
      return;
    }

    box.appendChild(el('div', { class: 'px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider text-gray-400', text: showRecents ? 'Recent' : 'Results' }));

    list.forEach((r, i) => {
      const active = i === state.selected && !showRecents;
      const btn = el('button', {
        class: 'w-full flex items-center gap-3 px-4 py-2 text-left ' + (active ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'),
        type: 'button'
      });
      btn.appendChild(el('span', { class: 'text-lg leading-none', text: r.icon || '•' }));
      const mid = el('span', { class: 'flex-1 min-w-0' }, [
        el('span', { class: 'block truncate text-gray-900 dark:text-white', text: r.label || '' }),
        el('span', { class: 'block truncate text-xs text-gray-500 dark:text-gray-400', text: r.sub || '' })
      ]);
      btn.appendChild(mid);
      btn.appendChild(el('span', { class: 'text-[10px] uppercase tracking-wider text-gray-400', text: r.type || '' }));
      btn.addEventListener('click', () => {
        if (showRecents) {
          if (r.type === 'file') {
            if (r.id.startsWith('raw:')) {
              navigateToPath(r.id.replace(/^raw:/, ''));
            } else if (r.id.startsWith('newtab:')) {
              const p = r.id.replace(/^newtab:/, '');
              window.open(resolvePath('reader.html?file=' + p), '_blank', 'noopener');
            } else {
              const p = r.id.replace(/^file:/, '');
              // Default: route .md through reader.html
              if (/\.md$/i.test(p)) navigateToPath('reader.html?file=' + p);
              else navigateToPath(p);
            }
          }
          else if (r.type === 'dashboard') {
            const d = state.dashboards.find(x => 'dash:' + x.id === r.id);
            if (d) navigateToPath(d.path);
          } else if (r.type === 'command') {
            const c = state.commands.get(r.id.replace(/^cmd:/, ''));
            if (c) { c.fn(); close(); }
          }
        } else {
          execute(i);
        }
      });
      box.appendChild(btn);
    });
  }

  function open() {
    if (state.open) return;
    buildModal();
    const wrap = document.getElementById(MODAL_ID);
    wrap.classList.remove('hidden');
    state.open = true;
    state.query = '';
    const input = wrap.querySelector('[data-cp-input]');
    input.value = '';
    setTimeout(() => input.focus(), 10);
    render();
  }

  function close() {
    const wrap = document.getElementById(MODAL_ID);
    if (wrap) wrap.classList.add('hidden');
    state.open = false;
  }

  function registerCommand(id, fn, opts = {}) {
    state.commands.set(id, { id, label: opts.label || id, icon: opts.icon || '⚡', fn, type: 'command' });
  }

  function bindShortcut() {
    document.addEventListener('keydown', (e) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (state.open) close(); else open();
      }
    });
  }

  window.CommandPalette = {
    __initialized: true,
    init(opts = {}) {
      const manifestUrl = opts.manifestUrl || resolvePath('.manifest.json');
      loadRecents();
      buildDashboardList();
      registerDefaultCommands();
      bindShortcut();
      loadManifest(manifestUrl);
    },
    open, close, registerCommand
  };
  // Compatibility alias used by index.html's toolbar button.
  window.ddPalette = window.CommandPalette;

  function boot() { window.CommandPalette.init({}); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
