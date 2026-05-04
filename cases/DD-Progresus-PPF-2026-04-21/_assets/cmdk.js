/* DD Workspace — Global ⌘K Command Palette (cmdk.js)
 * Self-contained, vanilla JS. No external libs.
 * Auto-injects on DOMContentLoaded.
 *
 * Triggers:
 *   - ⌘K / Ctrl+K
 *   - "/" key when not focused in input/textarea
 *   - Custom event: window.dispatchEvent(new CustomEvent('cmdk:open'))
 *
 * Public API (window.DD_CMDK):
 *   - open()
 *   - close()
 *   - addAction({ name, run, hint?, tags?, emoji? })
 */
(function () {
  'use strict';
  if (window.DD_CMDK && window.DD_CMDK.__initialized) return;

  const LS_RECENTS = 'dd:cmdk:recents';
  const LS_MAX_RECENTS = 10;
  const MODAL_ID = 'dd-cmdk-modal';
  const ANCHORS_PER_FILE = 5;

  // ---- depth-aware path resolution ---------------------------------------
  function computeRoot() {
    // Resolve workspace root prefix from this script's own src.
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      const s = scripts[i].getAttribute('src') || '';
      const m = s.match(/^(.*?)_assets\/cmdk\.js/);
      if (m) return m[1] || './';
    }
    // Fallback: detect known subdir
    const path = location.pathname.replace(/\\/g, '/');
    const known = ['06-reports', 'rendered', '01-intel', '02-entity', '03-financial',
                   '04-legal', '05-osint', '07-sources', '08-comms-templates'];
    for (const k of known) {
      if (path.indexOf('/' + k + '/') !== -1) return '../';
    }
    return './';
  }

  const ROOT = computeRoot();

  // ---- Hardcoded HTML dashboards (paths relative to workspace root) ------
  const HTML_PAGES = [
    { title: 'Hlavní portál',           path: 'index.html',                          emoji: '🏠', tags: ['portal','home','rozcestník'] },
    { title: 'Markdown čtečka',         path: 'reader.html',                         emoji: '📖', tags: ['reader','markdown'] },
    { title: 'Vyhledávání',             path: 'search.html',                         emoji: '🔍', tags: ['search','hledání'] },
    { title: 'Znalostní graf',          path: 'knowledge-graph.html',                emoji: '🕸️', tags: ['graph','sítě','vazby'] },
    { title: 'Mapa stránek',            path: 'sitemap.html',                        emoji: '🗺️', tags: ['sitemap','navigace'] },
    { title: 'Index Markdownů',         path: 'md-index.html',                       emoji: '📚', tags: ['index','markdown'] },
    { title: 'Manažerský briefing',     path: 'executive-briefing.html',             emoji: '👔', tags: ['briefing','executive','tisk'] },
    { title: 'Export pack',             path: 'export-pack.html',                    emoji: '📦', tags: ['export','balík'] },
    { title: 'Klávesová nápověda',      path: 'keyboard-help.html',                  emoji: '⌨️', tags: ['shortcuts','klávesy'] },
    { title: 'Test rozcestník',         path: 'test-all.html',                       emoji: '🧪', tags: ['test','qa'] },
    // 06-reports
    { title: 'Red flags dashboard',     path: '06-reports/red-flags-dashboard.html', emoji: '🚩', tags: ['rizika','red-flags'] },
    { title: 'Kalkulačka ocenění',      path: '06-reports/valuation-calculator.html',emoji: '💰', tags: ['valuation','ocenění'] },
    { title: 'Monte Carlo ocenění',     path: '06-reports/monte-carlo-valuation.html',emoji: '🎲', tags: ['valuation','monte-carlo','simulace'] },
    { title: 'Deal journey',            path: '06-reports/deal-journey.html',        emoji: '🛤️', tags: ['journey','timeline'] },
    { title: 'Geo přehled dealu',       path: '06-reports/geo-deal-overview.html',   emoji: '🗺️', tags: ['geo','mapa'] },
    { title: 'Tlakový radar',           path: '06-reports/pressure-radar.html',      emoji: '📡', tags: ['radar','pressure','tlak'] },
    { title: 'Matice vztahů',           path: '06-reports/relationships-matrix.html',emoji: '🔗', tags: ['matrix','vztahy'] },
    { title: 'Roadmap Gantt',           path: '06-reports/roadmap-gantt.html',       emoji: '📅', tags: ['roadmap','gantt','timeline'] },
    // Rendered static
    { title: 'Předrenderované — index', path: 'rendered/index.html',                 emoji: '📄', tags: ['rendered','offline'] },
    { title: 'One-pager (statický)',    path: 'rendered/one-pager.html',             emoji: '📃', tags: ['one-pager','print'] },
    { title: 'Master DD report',        path: 'rendered/master-dd-report.html',      emoji: '📑', tags: ['report','master'] },
    { title: 'Red flags (statické)',    path: 'rendered/red-flags.html',             emoji: '🚩', tags: ['rendered','red-flags'] },
    { title: 'Methodology (statická)',  path: 'rendered/methodology.html',           emoji: '📐', tags: ['methodology'] },
    { title: 'Mission complete',        path: 'rendered/mission-complete.html',      emoji: '🏁', tags: ['mission','complete'] }
  ];

  // ---- State ---------------------------------------------------------------
  const state = {
    items: [],          // built index
    customActions: [],  // user-added via addAction
    open: false,
    query: '',
    results: [],
    selected: 0,
    recents: loadRecents()
  };

  function loadRecents() {
    try {
      const raw = localStorage.getItem(LS_RECENTS);
      return raw ? JSON.parse(raw) : [];
    } catch (_) { return []; }
  }

  function saveRecents() {
    try { localStorage.setItem(LS_RECENTS, JSON.stringify(state.recents.slice(0, LS_MAX_RECENTS))); }
    catch (_) {}
  }

  function pushRecent(item) {
    const key = item.id;
    state.recents = [{ id: key }, ...state.recents.filter(r => r.id !== key)].slice(0, LS_MAX_RECENTS);
    saveRecents();
  }

  // ---- Index build ---------------------------------------------------------
  function extractAnchors(content) {
    if (!content) return [];
    const lines = content.split('\n');
    const anchors = [];
    let inFence = false;
    for (let i = 0; i < lines.length && anchors.length < ANCHORS_PER_FILE; i++) {
      const line = lines[i];
      if (/^```/.test(line)) { inFence = !inFence; continue; }
      if (inFence) continue;
      const m = line.match(/^(#{2,3})\s+(.+?)\s*#*$/);
      if (m) {
        const text = m[2].replace(/[*_`]/g, '').trim();
        if (text) anchors.push(text);
      }
    }
    return anchors;
  }

  function slugify(text) {
    return text.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function buildIndex() {
    const items = [];

    // 1. HTML pages
    HTML_PAGES.forEach(p => {
      items.push({
        id: 'html:' + p.path,
        kind: 'page',
        title: p.title,
        path: p.path,
        href: ROOT + p.path,
        emoji: p.emoji,
        tags: p.tags || []
      });
    });

    // 2. Markdown files from DD_MD_STORE
    const store = window.DD_MD_STORE;
    if (store && typeof store === 'object') {
      Object.keys(store).forEach(mdPath => {
        const entry = store[mdPath];
        if (!entry) return;
        const title = entry.title || mdPath.replace(/\.md$/, '');
        const tags = Array.isArray(entry.tags) ? entry.tags : [];
        items.push({
          id: 'md:' + mdPath,
          kind: 'md',
          title: title,
          path: mdPath,
          href: ROOT + 'reader.html?file=' + encodeURIComponent(mdPath),
          emoji: '📝',
          tags: tags
        });
        // Anchors
        const anchors = extractAnchors(entry.content);
        anchors.forEach(a => {
          items.push({
            id: 'md:' + mdPath + '#' + a,
            kind: 'anchor',
            title: a,
            subtitle: title,
            path: mdPath,
            href: ROOT + 'reader.html?file=' + encodeURIComponent(mdPath) + '#' + slugify(a),
            emoji: '#',
            tags: tags
          });
        });
      });
    }

    // 3. Built-in actions
    const actions = [
      { id: 'act:portal',    title: 'Otevřít portál',                emoji: '🏠', tags: ['action'],
        run: () => navigate(ROOT + 'index.html') },
      { id: 'act:graph',     title: 'Otevřít znalostní graf',        emoji: '🕸️', tags: ['action','graph'],
        run: () => navigate(ROOT + 'knowledge-graph.html') },
      { id: 'act:reader',    title: 'Otevřít čtečku Markdownu',      emoji: '📖', tags: ['action','reader'],
        run: () => navigate(ROOT + 'reader.html') },
      { id: 'act:search',    title: 'Otevřít vyhledávání',           emoji: '🔍', tags: ['action','search'],
        run: () => navigate(ROOT + 'search.html') },
      { id: 'act:dark',      title: 'Zapnout/vypnout tmavý režim',   emoji: '🌓', tags: ['action','dark','theme'],
        run: toggleDarkMode },
      { id: 'act:print',     title: 'Tisk této stránky',             emoji: '🖨️', tags: ['action','print','tisk'],
        run: () => window.print() },
      { id: 'act:copy-url',  title: 'Kopírovat odkaz',               emoji: '🔗', tags: ['action','copy','url'],
        run: copyLocationUrl },
      { id: 'act:back',      title: 'Zpět',                          emoji: '⬅️', tags: ['action','navigation'],
        run: () => history.back() },
      { id: 'act:reload',    title: 'Obnovit stránku',               emoji: '🔄', tags: ['action','reload'],
        run: () => location.reload() }
    ];
    actions.forEach(a => items.push({ kind: 'action', ...a }));

    // 4. Custom actions registered via API
    state.customActions.forEach(a => items.push({ kind: 'action', ...a }));

    state.items = items;
  }

  function navigate(url) {
    location.href = url;
  }

  function toggleDarkMode() {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');
    if (isDark) {
      html.classList.remove('dark');
      try { localStorage.setItem('dd-dark', 'false'); } catch (_) {}
    } else {
      html.classList.add('dark');
      try { localStorage.setItem('dd-dark', 'true'); } catch (_) {}
    }
  }

  function copyLocationUrl() {
    const url = location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(
        () => toast('Odkaz zkopírován'),
        () => toast('Kopírování selhalo', true)
      );
    } else {
      toast('Schránka není dostupná', true);
    }
  }

  function toast(message, isError) {
    const t = document.createElement('div');
    t.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg text-sm font-medium z-[10000] ' +
                  (isError ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white');
    t.textContent = message;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; }, 1800);
    setTimeout(() => t.remove(), 2200);
  }

  // ---- Fuzzy search --------------------------------------------------------
  function tokenize(s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .split(/\s+/).filter(Boolean);
  }

  function isWordBoundary(haystack, idx) {
    if (idx === 0) return true;
    const prev = haystack.charAt(idx - 1);
    return /[^a-z0-9]/.test(prev);
  }

  function scoreItem(item, qTokens) {
    if (!qTokens.length) return 0;
    const titleRaw = item.title || '';
    const title = titleRaw.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const path = (item.path || '').toLowerCase();
    const tags = (item.tags || []).join(' ').toLowerCase();
    const subtitle = (item.subtitle || '').toLowerCase();
    const haystack = title + ' ' + path + ' ' + tags + ' ' + subtitle;

    let score = 0;
    let allMatched = true;

    for (const tok of qTokens) {
      const inTitle = title.indexOf(tok);
      const inPath = path.indexOf(tok);
      const inTags = tags.indexOf(tok);
      const inSub = subtitle.indexOf(tok);
      const inAny = haystack.indexOf(tok);

      if (inAny === -1) { allMatched = false; continue; }

      score += 1;
      if (inTitle === 0) score += 10;
      else if (inTitle > 0 && isWordBoundary(title, inTitle)) score += 5;
      else if (inTitle > 0) score += 2;

      if (inTags > -1) score += 3;
      if (inPath > -1) score += 1;
      if (inSub > -1) score += 1;
    }

    if (allMatched) score += 20;
    else score = Math.floor(score / 2);

    if (item.kind === 'action') score += 2;
    if (item.kind === 'page') score += 1;

    return score;
  }

  function search(query) {
    const qTokens = tokenize(query);
    if (!qTokens.length) {
      if (state.recents.length) {
        const recent = state.recents
          .map(r => state.items.find(i => i.id === r.id))
          .filter(Boolean);
        if (recent.length) return recent.slice(0, 30);
      }
      return state.items.filter(i => i.kind === 'page' || i.kind === 'action').slice(0, 30);
    }
    const scored = [];
    for (const item of state.items) {
      const s = scoreItem(item, qTokens);
      if (s > 0) scored.push({ item, score: s });
    }
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (a.item.title || '').localeCompare(b.item.title || '', 'cs');
    });
    return scored.slice(0, 50).map(s => s.item);
  }

  // ---- DOM -----------------------------------------------------------------
  let modalEl = null;
  let inputEl = null;
  let listEl = null;
  let emptyEl = null;
  let headerLabelEl = null;

  function buildModal() {
    if (modalEl) return modalEl;
    const overlay = document.createElement('div');
    overlay.id = MODAL_ID;
    overlay.className = 'fixed inset-0 z-[9999] hidden items-start justify-center pt-[15vh] px-4';
    overlay.style.backgroundColor = 'rgba(2, 6, 23, 0.72)';
    overlay.style.backdropFilter = 'blur(4px)';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Paleta příkazů');

    const card = document.createElement('div');
    card.className = 'w-full max-w-[600px] rounded-xl shadow-2xl overflow-hidden border border-slate-700 ' +
                     'bg-slate-900 text-slate-100 flex flex-col';
    card.style.maxHeight = '70vh';
    card.style.animation = 'ddCmdkFadeIn 0.12s ease-out';

    // Header / input
    const header = document.createElement('div');
    header.className = 'flex items-center gap-3 px-4 py-3 border-b border-slate-700';

    const searchIcon = document.createElement('span');
    searchIcon.textContent = '⌘';
    searchIcon.className = 'text-slate-400 text-lg select-none';

    inputEl = document.createElement('input');
    inputEl.type = 'text';
    inputEl.placeholder = 'Hledat soubor nebo akci…';
    inputEl.className = 'flex-1 bg-transparent outline-none border-0 text-base placeholder:text-slate-500';
    inputEl.setAttribute('autocomplete', 'off');
    inputEl.setAttribute('spellcheck', 'false');
    inputEl.addEventListener('input', onInput);
    inputEl.addEventListener('keydown', onKeyDown);

    const escHint = document.createElement('kbd');
    escHint.textContent = 'Esc';
    escHint.className = 'text-[10px] px-1.5 py-0.5 rounded border border-slate-600 text-slate-400 select-none';

    header.appendChild(searchIcon);
    header.appendChild(inputEl);
    header.appendChild(escHint);

    // Section label
    headerLabelEl = document.createElement('div');
    headerLabelEl.className = 'px-4 pt-2 pb-1 text-[10px] font-semibold tracking-wider uppercase text-slate-500';
    headerLabelEl.textContent = 'Naposledy';

    // Results list
    listEl = document.createElement('div');
    listEl.className = 'overflow-y-auto flex-1 px-1 pb-2';
    listEl.setAttribute('role', 'listbox');

    // Empty state
    emptyEl = document.createElement('div');
    emptyEl.className = 'hidden text-center py-8 text-sm text-slate-500';
    emptyEl.textContent = 'Žádné výsledky';

    // Footer
    const footer = document.createElement('div');
    footer.className = 'flex items-center justify-between gap-3 px-4 py-2 border-t border-slate-700 ' +
                       'text-[11px] text-slate-500 bg-slate-900/60';
    const footerLeft = document.createElement('div');
    footerLeft.className = 'flex items-center gap-3';
    footerLeft.appendChild(makeKbdHint('↑↓', 'pohyb'));
    footerLeft.appendChild(makeKbdHint('Enter', 'otevřít'));
    footerLeft.appendChild(makeKbdHint('Esc', 'zavřít'));
    const footerRight = document.createElement('div');
    footerRight.textContent = 'DD ⌘K';
    footerRight.className = 'font-semibold text-slate-400';
    footer.appendChild(footerLeft);
    footer.appendChild(footerRight);

    card.appendChild(header);
    card.appendChild(headerLabelEl);
    card.appendChild(listEl);
    card.appendChild(emptyEl);
    card.appendChild(footer);
    overlay.appendChild(card);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    document.body.appendChild(overlay);
    injectStyles();
    modalEl = overlay;
    return overlay;
  }

  function makeKbdHint(key, label) {
    const wrap = document.createElement('span');
    wrap.className = 'flex items-center gap-1';
    const k = document.createElement('kbd');
    k.textContent = key;
    k.className = 'px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-300 text-[10px]';
    const t = document.createElement('span');
    t.textContent = label;
    wrap.appendChild(k);
    wrap.appendChild(t);
    return wrap;
  }

  function injectStyles() {
    if (document.getElementById('dd-cmdk-styles')) return;
    const s = document.createElement('style');
    s.id = 'dd-cmdk-styles';
    s.textContent = [
      '@keyframes ddCmdkFadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }',
      '#' + MODAL_ID + '.dd-cmdk-open { display: flex !important; }',
      '#' + MODAL_ID + ' .dd-cmdk-row { transition: background-color 0.08s; }',
      '#' + MODAL_ID + ' .dd-cmdk-row[data-active="1"] { background: rgba(99,102,241,0.18); }',
      '#' + MODAL_ID + ' .dd-cmdk-row[data-active="1"] .dd-cmdk-title { color: #c7d2fe; }',
      '#' + MODAL_ID + ' .dd-cmdk-tag { background: rgba(71,85,105,0.4); }'
    ].join('\n');
    document.head.appendChild(s);
  }

  // ---- Render --------------------------------------------------------------
  function render() {
    if (!listEl) return;
    while (listEl.firstChild) listEl.removeChild(listEl.firstChild);
    const results = state.results;

    if (state.query.trim() === '' && state.recents.length) {
      headerLabelEl.textContent = 'Naposledy';
      headerLabelEl.classList.remove('hidden');
    } else if (state.query.trim() === '') {
      headerLabelEl.textContent = 'Doporučeno';
      headerLabelEl.classList.remove('hidden');
    } else {
      headerLabelEl.classList.add('hidden');
    }

    if (!results.length) {
      emptyEl.classList.remove('hidden');
      return;
    } else {
      emptyEl.classList.add('hidden');
    }

    results.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = 'dd-cmdk-row flex items-center gap-3 px-3 py-2 mx-1 rounded-md cursor-pointer';
      row.setAttribute('role', 'option');
      row.setAttribute('data-idx', String(idx));
      if (idx === state.selected) row.setAttribute('data-active', '1');

      const ic = document.createElement('span');
      ic.className = 'shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-slate-800 text-base';
      ic.textContent = item.emoji || (item.kind === 'action' ? '⚡' : '📄');

      const body = document.createElement('div');
      body.className = 'flex-1 min-w-0';

      const titleRow = document.createElement('div');
      titleRow.className = 'flex items-center gap-2 min-w-0';
      const title = document.createElement('span');
      title.className = 'dd-cmdk-title font-medium text-sm truncate text-slate-100';
      title.textContent = item.title;
      titleRow.appendChild(title);

      if (item.kind === 'action') {
        const b = document.createElement('span');
        b.className = 'text-[9px] px-1.5 py-0.5 rounded bg-indigo-700/40 text-indigo-200 uppercase tracking-wider';
        b.textContent = 'akce';
        titleRow.appendChild(b);
      } else if (item.kind === 'anchor') {
        const b = document.createElement('span');
        b.className = 'text-[9px] px-1.5 py-0.5 rounded bg-amber-700/40 text-amber-200 uppercase tracking-wider';
        b.textContent = 'sekce';
        titleRow.appendChild(b);
      }
      body.appendChild(titleRow);

      const meta = document.createElement('div');
      meta.className = 'flex items-center gap-2 text-[11px] text-slate-500 truncate';
      const subText = item.subtitle ? (item.subtitle + ' · ' + item.path) : (item.path || '');
      if (subText) {
        const p = document.createElement('span');
        p.className = 'truncate';
        p.textContent = subText;
        meta.appendChild(p);
      }
      if (item.tags && item.tags.length) {
        item.tags.slice(0, 3).forEach(t => {
          const chip = document.createElement('span');
          chip.className = 'dd-cmdk-tag text-[9px] px-1.5 py-0.5 rounded text-slate-300';
          chip.textContent = t;
          meta.appendChild(chip);
        });
      }
      body.appendChild(meta);

      row.appendChild(ic);
      row.appendChild(body);

      row.addEventListener('mouseenter', () => {
        state.selected = idx;
        updateActiveRow();
      });
      row.addEventListener('click', () => {
        state.selected = idx;
        activate();
      });

      listEl.appendChild(row);
    });
  }

  function updateActiveRow() {
    if (!listEl) return;
    const rows = listEl.querySelectorAll('.dd-cmdk-row');
    rows.forEach((r, i) => {
      if (i === state.selected) {
        r.setAttribute('data-active', '1');
        r.scrollIntoView({ block: 'nearest' });
      } else {
        r.removeAttribute('data-active');
      }
    });
  }

  // ---- Events --------------------------------------------------------------
  function onInput() {
    state.query = inputEl.value;
    state.results = search(state.query);
    state.selected = 0;
    render();
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (state.selected < state.results.length - 1) state.selected++;
      updateActiveRow();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (state.selected > 0) state.selected--;
      updateActiveRow();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      activate();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'Home') {
      e.preventDefault();
      state.selected = 0;
      updateActiveRow();
    } else if (e.key === 'End') {
      e.preventDefault();
      state.selected = Math.max(0, state.results.length - 1);
      updateActiveRow();
    }
  }

  function activate() {
    const item = state.results[state.selected];
    if (!item) return;
    pushRecent({ id: item.id });
    close();
    if (item.kind === 'action' && typeof item.run === 'function') {
      try { item.run(); } catch (err) { console.error('cmdk action failed:', err); }
    } else if (item.href) {
      navigate(item.href);
    }
  }

  // ---- Open / Close --------------------------------------------------------
  function open() {
    buildModal();
    if (state.open) return;
    if (!state.items.length) buildIndex();
    state.open = true;
    state.query = '';
    inputEl.value = '';
    state.results = search('');
    state.selected = 0;
    modalEl.classList.add('dd-cmdk-open');
    render();
    setTimeout(() => inputEl.focus(), 10);
    document.addEventListener('keydown', globalKeyTrap, true);
  }

  function close() {
    if (!modalEl) return;
    state.open = false;
    modalEl.classList.remove('dd-cmdk-open');
    document.removeEventListener('keydown', globalKeyTrap, true);
  }

  function globalKeyTrap(e) {
    if (e.key === 'Escape' && state.open) {
      e.preventDefault();
      close();
    }
  }

  // ---- Trigger keys --------------------------------------------------------
  function isEditableTarget(t) {
    if (!t) return false;
    const tag = (t.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
    if (t.isContentEditable) return true;
    return false;
  }

  function onGlobalKey(e) {
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      if (state.open) close(); else open();
      return;
    }
    if (e.key === '/' && !state.open && !isEditableTarget(e.target) && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      open();
    }
  }

  // ---- Public API ----------------------------------------------------------
  const api = {
    __initialized: true,
    open: open,
    close: close,
    addAction: function (action) {
      if (!action || !action.name || typeof action.run !== 'function') return;
      const id = 'custom:' + (action.id || action.name);
      state.customActions.push({
        id: id,
        title: action.name,
        emoji: action.emoji || '⚡',
        tags: action.tags || ['custom'],
        run: action.run
      });
      if (state.items.length) buildIndex();
    },
    rebuild: buildIndex
  };
  window.DD_CMDK = api;

  // ---- Init ----------------------------------------------------------------
  function init() {
    buildIndex();
    buildModal();
    document.addEventListener('keydown', onGlobalKey);
    window.addEventListener('cmdk:open', open);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
