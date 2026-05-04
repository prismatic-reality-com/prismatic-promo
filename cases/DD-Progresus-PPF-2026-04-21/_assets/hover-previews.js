/* Hover Previews — rich rendered markdown tooltips for internal .md links.
 *
 * Upgrade from v1 (text-only) -> v2 (markdown-rendered via MdEmbed).
 *   - Fetches linked .md file on hover
 *   - Renders first section (up to first H2 or excerpt chars) using MdEmbed
 *   - Wikilink [[path#anchor]] recognised; anchor scrolls into tooltip
 *   - Tooltip is Flowbite-styled, max 500px x 400px, scrollable
 *   - "Preview" button opens sidebar drawer (MdDrawer, provided by inline-md-autoload.js)
 *   - "Open" navigates normally
 */
(function () {
  'use strict';
  if (window.HoverPreviews && window.HoverPreviews.__initialized) return;

  const HOVER_DELAY = 280;
  const HIDE_DELAY = 150;
  const POPUP_ID = 'mycelium-hover-preview';
  const EXCERPT_CHARS = 600;

  let manifest = null;
  let backlinkMap = null;
  let showTimer = null;
  let hideTimer = null;
  let currentLink = null;
  const cache = new Map();

  function rel(depth) { return depth <= 1 ? './' : '../'.repeat(depth - 1); }
  function computeDepth() { return Math.max(1, location.pathname.split('/').filter(Boolean).length); }
  function resolvePath(p) { return rel(computeDepth()) + p; }

  async function loadManifest() {
    if (manifest) return manifest;
    // Offline-first: prefer bundled DD_MANIFEST (works over file://).
    if (window.DD_MANIFEST) {
      manifest = window.DD_MANIFEST;
      buildBacklinkMap();
      return manifest;
    }
    try {
      const res = await fetch(resolvePath('.manifest.json'), { cache: 'default' });
      if (!res.ok) throw new Error('status ' + res.status);
      manifest = await res.json();
      buildBacklinkMap();
    } catch (e) {
      manifest = { files: [] };
    }
    return manifest;
  }

  function buildBacklinkMap() {
    backlinkMap = new Map();
    if (!manifest || !manifest.files) return;
    for (const f of manifest.files) {
      if (Array.isArray(f.backlinks)) backlinkMap.set(f.path, f.backlinks.length);
      else if (Array.isArray(f.links_to)) {
        for (const t of f.links_to) backlinkMap.set(t, (backlinkMap.get(t) || 0) + 1);
      }
    }
  }

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === 'class') node.className = attrs[k];
      else if (k === 'text') node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    }
    if (children) (Array.isArray(children) ? children : [children]).forEach(c => {
      if (c == null) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  function ensurePopup() {
    let pop = document.getElementById(POPUP_ID);
    if (pop) return pop;
    pop = el('div', {
      id: POPUP_ID,
      class: [
        'fixed z-[99998] hidden',
        'bg-white/95 dark:bg-gray-800/95 backdrop-blur',
        'border border-gray-200 dark:border-gray-700',
        'rounded-lg shadow-2xl text-sm pointer-events-auto',
        'overflow-hidden flex flex-col'
      ].join(' '),
      style: 'max-width:500px;max-height:400px;min-width:320px;'
    });
    pop.addEventListener('mouseenter', () => { if (hideTimer) clearTimeout(hideTimer); });
    pop.addEventListener('mouseleave', schedulehide);
    document.body.appendChild(pop);
    return pop;
  }

  function schedulehide() {
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, HIDE_DELAY);
  }

  function hide() {
    const pop = document.getElementById(POPUP_ID);
    if (pop) pop.classList.add('hidden');
    currentLink = null;
  }

  // Parse [[wikilink]] or href -> { path, anchor }
  function splitAnchor(href) {
    const m = href.match(/^([^#]*)(?:#(.+))?$/);
    if (!m) return { path: href, anchor: null };
    return { path: m[1], anchor: m[2] || null };
  }

  function normalizeTargetPath(href) {
    try {
      const url = new URL(href, location.href);
      // reader.html?file=<path> — the actual markdown target is in the query param.
      const fileParam = url.searchParams.get('file');
      if (fileParam) return decodeURIComponent(fileParam);
      const p = decodeURIComponent(url.pathname.replace(/^\//, ''));
      const parts = p.split('/');
      const idx = parts.findIndex(x => x.startsWith('DD-'));
      return (idx >= 0 ? parts.slice(idx + 1).join('/') : p);
    } catch (e) { return null; }
  }

  async function fetchPreview(fullHref) {
    if (cache.has(fullHref)) return cache.get(fullHref);
    const { path: baseHref, anchor } = splitAnchor(fullHref);
    const relPath = normalizeTargetPath(baseHref);
    const m = await loadManifest();
    let entry = null;
    if (relPath && m.files) entry = m.files.find(f => f.path === relPath) || null;

    let data = {
      title: entry ? (entry.title || relPath) : baseHref.split('/').pop(),
      path: relPath || baseHref,
      severity: entry ? entry.severity : null,
      backlinks: entry && backlinkMap ? (backlinkMap.get(entry.path) || 0) : 0,
      modified: entry ? (entry.modified || entry.last_modified || null) : null,
      fullHref,
      baseHref,
      anchor,
      rawText: null,
      fetchError: null
    };

    // Offline-first: prefer bundled DD_MD_STORE (works over file://).
    let storeEntry = null;
    if (typeof window.DD_MD_STORE_GET === 'function') {
      storeEntry = window.DD_MD_STORE_GET(relPath || baseHref);
    }
    if (storeEntry && typeof storeEntry.content === 'string') {
      data.rawText = storeEntry.content;
      if (!entry) {
        const tm = data.rawText.match(/^#\s+(.+)$/m);
        if (tm) data.title = tm[1].trim();
      }
    } else if (location.protocol === 'file:') {
      data.fetchError = 'Not in offline store';
    } else {
      try {
        const fetchHref = (relPath && /\.md$/i.test(relPath)) ? resolvePath(relPath) : baseHref;
        const res = await fetch(fetchHref, { cache: 'default' });
        if (res.ok) {
          data.rawText = await res.text();
          if (!entry) {
            const tm = data.rawText.match(/^#\s+(.+)$/m);
            if (tm) data.title = tm[1].trim();
          }
        } else {
          data.fetchError = 'HTTP ' + res.status;
        }
      } catch (e) {
        data.fetchError = e && e.message || String(e);
      }
    }

    cache.set(fullHref, data);
    return data;
  }

  function severityClass(s) {
    return {
      critical: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
      low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
    }[s] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
  }

  // Extract a section by anchor from the raw md source. Returns substring of
  // that heading block, or whole body if anchor not found.
  function extractSection(raw, anchor) {
    if (!anchor || !raw) return raw;
    const lines = raw.split('\n');
    const slug = s => String(s).trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    let startIdx = -1;
    let startLevel = 0;
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(/^(#{1,6})\s+(.+)$/);
      if (m && slug(m[2]) === anchor) {
        startIdx = i;
        startLevel = m[1].length;
        break;
      }
    }
    if (startIdx < 0) return raw;
    let endIdx = lines.length;
    for (let j = startIdx + 1; j < lines.length; j++) {
      const m = lines[j].match(/^(#{1,6})\s+/);
      if (m && m[1].length <= startLevel) { endIdx = j; break; }
    }
    return lines.slice(startIdx, endIdx).join('\n');
  }

  async function renderPopup(data, link) {
    const pop = ensurePopup();
    while (pop.firstChild) pop.removeChild(pop.firstChild);

    // Header
    const sevBadge = data.severity && data.severity !== 'none'
      ? el('span', { class: 'ml-2 inline-block px-1.5 py-0.5 text-[10px] rounded ' + severityClass(data.severity), text: data.severity })
      : null;
    const title = el('h4', { class: 'font-semibold text-gray-900 dark:text-white text-sm leading-tight flex items-center' });
    title.appendChild(document.createTextNode(data.title || '(no title)'));
    if (sevBadge) title.appendChild(sevBadge);

    const header = el('div', {
      class: 'flex items-start justify-between gap-2 px-3 pt-3 pb-1 border-b border-gray-100 dark:border-gray-700'
    }, [
      el('div', { class: 'min-w-0 flex-1' }, [
        title,
        el('div', { class: 'text-[10px] uppercase tracking-wider text-gray-400 mt-0.5 truncate', text: data.path || '' })
      ])
    ]);
    pop.appendChild(header);

    // Body (rendered markdown)
    const body = el('div', {
      class: 'flex-1 overflow-y-auto px-3 py-2',
      style: 'max-height:260px;'
    });
    pop.appendChild(body);

    if (data.fetchError) {
      body.appendChild(el('div', {
        class: 'text-xs text-red-600 dark:text-red-400',
        text: 'Preview unavailable (' + data.fetchError + ')'
      }));
    } else if (!data.rawText) {
      body.appendChild(el('div', { class: 'text-xs text-gray-500 italic', text: 'Loading…' }));
    } else {
      const section = extractSection(data.rawText, data.anchor);
      if (window.MdEmbed && window.MdEmbed.render) {
        try {
          await window.MdEmbed.render(body, section, {
            stopAtH2: !data.anchor,      // if no anchor, cut at first H2
            excerptChars: data.anchor ? null : EXCERPT_CHARS,
            toc: false,
            baseUrl: data.baseHref,
            hideBacklinks: true,
            prose: true
          });
        } catch (e) {
          body.textContent = section.slice(0, EXCERPT_CHARS);
        }
      } else {
        body.appendChild(el('pre', {
          class: 'text-[11px] whitespace-pre-wrap font-mono',
          text: section.slice(0, EXCERPT_CHARS)
        }));
      }
    }

    // Footer
    const footer = el('div', {
      class: 'flex items-center justify-between gap-2 px-3 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 text-[11px]'
    });
    const metaParts = [];
    metaParts.push('📎 ' + data.backlinks + ' backlink' + (data.backlinks === 1 ? '' : 's'));
    if (data.modified) metaParts.push('🕒 ' + data.modified);
    footer.appendChild(el('span', { class: 'text-gray-500 dark:text-gray-400 truncate', text: metaParts.join(' · ') }));

    const actions = el('div', { class: 'flex gap-2 flex-shrink-0' });

    const previewBtn = el('button', {
      type: 'button',
      class: 'px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-medium'
    }, 'Preview');
    previewBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      hide();
      if (window.MdDrawer && window.MdDrawer.open) {
        window.MdDrawer.open(data.fullHref, { anchor: data.anchor });
      } else {
        window.open(data.fullHref, '_blank');
      }
    });
    actions.appendChild(previewBtn);

    const openLink = el('a', {
      href: data.fullHref,
      class: 'px-2 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-[11px] font-medium'
    }, 'Open →');
    actions.appendChild(openLink);

    footer.appendChild(actions);
    pop.appendChild(footer);

    positionPopup(pop, link);
    pop.classList.remove('hidden');
  }

  function positionPopup(pop, link) {
    const rect = link.getBoundingClientRect();
    pop.style.visibility = 'hidden';
    pop.classList.remove('hidden');
    const pw = pop.offsetWidth;
    const ph = pop.offsetHeight;
    pop.classList.add('hidden');
    pop.style.visibility = '';

    let top = rect.bottom + 8;
    let left = rect.left;
    if (left + pw > window.innerWidth - 16) left = window.innerWidth - pw - 16;
    if (left < 8) left = 8;
    if (top + ph > window.innerHeight - 16) top = rect.top - ph - 8;
    if (top < 8) top = 8;
    pop.style.top = top + 'px';
    pop.style.left = left + 'px';
  }

  function isInternalMdLink(a) {
    const href = a.getAttribute('href') || '';
    if (!href) return false;
    if (/^(https?:|mailto:|tel:|#)/i.test(href)) return false;
    return /\.md(\?|#|$)/i.test(href);
  }

  function onOver(e) {
    const a = e.target.closest && e.target.closest('a');
    if (!a || !isInternalMdLink(a)) return;
    if (hideTimer) clearTimeout(hideTimer);
    if (showTimer) clearTimeout(showTimer);
    currentLink = a;
    showTimer = setTimeout(async () => {
      if (currentLink !== a) return;
      const data = await fetchPreview(a.href);
      if (currentLink === a) {
        try { await renderPopup(data, a); } catch (err) { /* ignore */ }
      }
    }, HOVER_DELAY);
  }

  function onOut(e) {
    const a = e.target.closest && e.target.closest('a');
    if (!a) return;
    if (showTimer) clearTimeout(showTimer);
    schedulehide();
  }

  function onDocClick(e) {
    const pop = document.getElementById(POPUP_ID);
    if (!pop || pop.classList.contains('hidden')) return;
    if (!pop.contains(e.target)) hide();
  }

  function onEsc(e) {
    if (e.key === 'Escape') hide();
  }

  window.HoverPreviews = {
    __initialized: true,
    fetchPreview,
    hide,
    init() {
      loadManifest();
      document.addEventListener('mouseover', onOver, true);
      document.addEventListener('mouseout', onOut, true);
      document.addEventListener('click', onDocClick, true);
      document.addEventListener('keydown', onEsc);
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => window.HoverPreviews.init());
  else window.HoverPreviews.init();
})();
