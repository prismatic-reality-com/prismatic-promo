/* inline-md-autoload.js — page-level enhancement layer on top of MdEmbed.
 *
 * Responsibilities:
 *   1. Render <code class="language-markdown"> blocks inline as rendered markdown.
 *   2. Resolve <div data-md-embed="path.md"> to fetched + rendered content.
 *      (Alias for data-md-src handled by MdEmbed; this adds a collapsible wrapper.)
 *   3. Intercept clicks on internal .md links and open in slide-in drawer.
 *      - Default: drawer opens.
 *      - Cmd/Ctrl+click -> native navigation (full page).
 *      - Shift+click    -> always drawer (even if intercept disabled elsewhere).
 *      - Esc / click outside -> closes drawer.
 *      - "Pop out" button -> navigate to link in reader.html (or the .md file).
 *
 * Depends on: MdEmbed (required), HoverPreviews (optional).
 */
(function () {
  'use strict';
  if (window.MdDrawer && window.MdDrawer.__initialized) return;

  const DRAWER_ID = 'md-drawer-root';
  const DRAWER_WIDTH_INITIAL = 480;
  const DRAWER_WIDTH_MAX = 960;
  const DRAWER_WIDTH_MIN = 320;

  let drawerEl = null;
  let drawerBody = null;
  let drawerTitle = null;
  let drawerPath = null;
  let currentPath = null;
  let currentAnchor = null;
  let currentWidth = DRAWER_WIDTH_INITIAL;

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

  function computeDepth() {
    return Math.max(1, location.pathname.split('/').filter(Boolean).length);
  }
  function resolveAssetPath(p) {
    const d = computeDepth();
    const prefix = d <= 1 ? './' : '../'.repeat(d - 1);
    return prefix + p;
  }

  function ensureDrawer() {
    if (drawerEl) return drawerEl;

    const backdrop = el('div', {
      id: 'md-drawer-backdrop',
      class: 'fixed inset-0 z-[99990] bg-black/30 backdrop-blur-sm hidden',
      'aria-hidden': 'true'
    });
    backdrop.addEventListener('click', close);

    drawerEl = el('aside', {
      id: DRAWER_ID,
      class: [
        'fixed top-0 right-0 z-[99991] h-full',
        'bg-white dark:bg-gray-900 shadow-2xl',
        'border-l border-gray-200 dark:border-gray-700',
        'flex flex-col transform translate-x-full transition-transform duration-200',
        'hidden'
      ].join(' '),
      'aria-hidden': 'true',
      role: 'complementary',
      style: 'width:' + DRAWER_WIDTH_INITIAL + 'px;max-width:95vw;'
    });

    // Resize handle on the left edge
    const handle = el('div', {
      class: 'absolute top-0 left-0 h-full w-1 cursor-col-resize hover:bg-blue-400/40',
      'aria-label': 'Resize drawer'
    });
    let dragging = false;
    handle.addEventListener('mousedown', (e) => {
      dragging = true;
      document.body.style.userSelect = 'none';
      e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const w = Math.min(DRAWER_WIDTH_MAX, Math.max(DRAWER_WIDTH_MIN, window.innerWidth - e.clientX));
      currentWidth = w;
      drawerEl.style.width = w + 'px';
    });
    document.addEventListener('mouseup', () => {
      if (dragging) { dragging = false; document.body.style.userSelect = ''; }
    });
    drawerEl.appendChild(handle);

    // Header
    drawerTitle = el('h3', { class: 'text-sm font-semibold text-gray-900 dark:text-white truncate flex-1' });
    drawerPath = el('div', { class: 'text-[10px] text-gray-400 uppercase tracking-wider truncate mt-0.5' });

    const popout = el('button', {
      type: 'button',
      class: 'p-1.5 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400',
      title: 'Open full page',
      'aria-label': 'Open full page'
    }, '↗');
    popout.addEventListener('click', () => {
      if (currentPath) {
        const url = currentAnchor ? currentPath + '#' + currentAnchor : currentPath;
        window.location.href = url;
      }
    });

    const closeBtn = el('button', {
      type: 'button',
      class: 'p-1.5 text-gray-500 hover:text-red-600 dark:hover:text-red-400',
      title: 'Close (Esc)',
      'aria-label': 'Close drawer'
    }, '×');
    closeBtn.addEventListener('click', close);

    const header = el('div', {
      class: 'flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
    }, [
      el('div', { class: 'min-w-0 flex-1' }, [drawerTitle, drawerPath]),
      popout,
      closeBtn
    ]);
    drawerEl.appendChild(header);

    // Body
    drawerBody = el('div', {
      class: 'flex-1 overflow-y-auto px-5 py-4',
      id: 'md-drawer-body'
    });
    drawerEl.appendChild(drawerBody);

    document.body.appendChild(backdrop);
    document.body.appendChild(drawerEl);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawerEl && !drawerEl.classList.contains('hidden')) close();
    });

    return drawerEl;
  }

  function open(href, options) {
    options = options || {};
    ensureDrawer();
    const [pathOnly, anchorFromHref] = href.split('#');
    currentPath = pathOnly || href;
    currentAnchor = options.anchor || anchorFromHref || null;

    const backdrop = document.getElementById('md-drawer-backdrop');
    backdrop.classList.remove('hidden');
    drawerEl.classList.remove('hidden');
    requestAnimationFrame(() => {
      drawerEl.classList.remove('translate-x-full');
      drawerEl.setAttribute('aria-hidden', 'false');
    });

    drawerTitle.textContent = 'Loading…';
    drawerPath.textContent = currentPath;
    while (drawerBody.firstChild) drawerBody.removeChild(drawerBody.firstChild);
    drawerBody.appendChild(el('div', { class: 'text-xs text-gray-500 italic', text: 'Loading ' + currentPath + '…' }));

    if (!window.MdEmbed || !window.MdEmbed.loadFile) {
      drawerBody.textContent = 'MdEmbed not available.';
      return;
    }

    window.MdEmbed.loadFile(drawerBody, currentPath, {
      toc: true,
      hideBacklinks: true,
      prose: true,
      baseUrl: currentPath
    }).then((result) => {
      if (result && result.metadata && result.metadata.title) {
        drawerTitle.textContent = result.metadata.title;
      } else {
        drawerTitle.textContent = currentPath.split('/').pop();
      }
      if (currentAnchor) {
        // Give MdEmbed a moment to fully install content.
        setTimeout(() => window.MdEmbed.scrollTo(drawerBody, currentAnchor), 60);
      }
    }).catch((err) => {
      drawerTitle.textContent = 'Error';
    });
  }

  function close() {
    if (!drawerEl) return;
    drawerEl.classList.add('translate-x-full');
    drawerEl.setAttribute('aria-hidden', 'true');
    const backdrop = document.getElementById('md-drawer-backdrop');
    setTimeout(() => {
      drawerEl.classList.add('hidden');
      if (backdrop) backdrop.classList.add('hidden');
    }, 200);
  }

  // Extract the markdown target from a reader.html?file=X.md[#anchor] URL.
  // Returns { file, anchor } or null for non-reader hrefs.
  function extractReaderTarget(href) {
    const m = href.match(/(?:^|\/)reader\.html\?file=([^&#]+)(?:#([^&]*))?/i);
    if (!m) return null;
    return { file: decodeURIComponent(m[1]), anchor: m[2] ? decodeURIComponent(m[2]) : null };
  }

  function isInternalMdLink(a) {
    const href = a.getAttribute('href') || '';
    if (!href) return false;
    if (/^(https?:|mailto:|tel:|#)/i.test(href)) return false;
    if (a.target && a.target === '_blank') return false;
    return /\.md(\?|#|$)/i.test(href);
  }

  function onClick(e) {
    const a = e.target.closest && e.target.closest('a');
    if (!a) return;
    const rawHref = a.getAttribute('href') || '';
    if (!rawHref) return;
    if (/^(https?:|mailto:|tel:|#)/i.test(rawHref)) return;
    if (a.target && a.target === '_blank') return;

    // Cmd/Ctrl click -> native navigation
    if (e.metaKey || e.ctrlKey) return;
    // Middle click -> native
    if (e.button === 1) return;

    // reader.html?file=X[.md]#anchor -> open the target .md directly in drawer.
    const reader = extractReaderTarget(rawHref);
    if (reader && /\.md$/i.test(reader.file)) {
      e.preventDefault();
      open(reader.anchor ? reader.file + '#' + reader.anchor : reader.file);
      return;
    }

    // Plain internal .md links -> drawer.
    if (!isInternalMdLink(a)) return;
    e.preventDefault();
    open(a.href);
  }

  // Upgrade <code class="language-markdown"> blocks to rendered markdown.
  function enhanceCodeBlocks(root) {
    root = root || document;
    const nodes = root.querySelectorAll
      ? root.querySelectorAll('pre > code.language-markdown:not([data-md-rendered])')
      : [];
    nodes.forEach(code => {
      const pre = code.parentElement;
      const raw = code.textContent;
      const container = document.createElement('div');
      container.className = 'md-inline-rendered border border-gray-200 dark:border-gray-700 rounded p-3 my-2 bg-white/50 dark:bg-gray-900/40';
      pre.parentNode.insertBefore(container, pre);
      pre.style.display = 'none';
      if (window.MdEmbed && window.MdEmbed.render) {
        window.MdEmbed.render(container, raw, { toc: false, prose: true }).catch(() => {
          pre.style.display = '';
          container.remove();
        });
      }
    });
  }

  // Convert <div data-md-embed="path.md"> to collapsible rendered document.
  function enhanceMdEmbed(root) {
    root = root || document;
    const nodes = root.querySelectorAll
      ? root.querySelectorAll('[data-md-embed]:not([data-md-enhanced])')
      : [];
    nodes.forEach(wrap => {
      wrap.setAttribute('data-md-enhanced', '1');
      const path = wrap.getAttribute('data-md-embed');
      wrap.classList.add('md-embed-wrap', 'border', 'border-gray-200', 'dark:border-gray-700', 'rounded', 'my-3');

      const header = el('div', {
        class: 'flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700'
      }, [
        el('div', { class: 'text-xs text-gray-600 dark:text-gray-300 font-mono truncate', text: path }),
        el('a', {
          href: path,
          class: 'text-xs text-blue-600 dark:text-blue-400 hover:underline flex-shrink-0 ml-2',
          text: 'Open →'
        })
      ]);
      const body = el('div', { class: 'px-4 py-3' });
      wrap.appendChild(header);
      wrap.appendChild(body);

      if (window.MdEmbed && window.MdEmbed.loadFile) {
        window.MdEmbed.loadFile(body, path, { toc: false, prose: true, baseUrl: path }).catch(() => {
          body.textContent = 'Failed to load ' + path;
        });
      }
    });
  }

  function autoEnhance(root) {
    enhanceCodeBlocks(root);
    enhanceMdEmbed(root);
  }

  function installObserver() {
    if (!('MutationObserver' in window)) return;
    const obs = new MutationObserver(mutations => {
      for (const m of mutations) {
        m.addedNodes.forEach(n => {
          if (n.nodeType === 1 && n.querySelectorAll) autoEnhance(n);
        });
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  window.MdDrawer = {
    __initialized: true,
    open,
    close
  };

  function boot() {
    autoEnhance(document);
    installObserver();
    // Intercept clicks globally.
    document.addEventListener('click', onClick, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
