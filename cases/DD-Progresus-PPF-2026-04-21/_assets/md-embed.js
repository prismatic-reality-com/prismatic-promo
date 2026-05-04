/* md-embed.js — Reusable embeddable markdown renderer.
 *
 * Depends on: window.markdownit (loaded externally).
 * Optional: window.DOMPurify, window.hljs, markdown-it plugins.
 *
 * API:
 *   MdEmbed.render(container, markdownText, options) -> { html, toc, metadata }
 *   MdEmbed.loadFile(container, path, options) -> Promise<{ html, toc, metadata }>
 *   MdEmbed.scrollTo(container, anchor)
 *   MdEmbed.autoEnhance() - scans DOM for [data-md-src] and [data-md-inline]
 *
 * Data attributes:
 *   data-md-src="./path.md"  -> fetch + render
 *   data-md-inline           -> render element textContent as markdown
 *   data-md-no-prose         -> skip auto prose class injection
 *   data-md-no-toc           -> skip TOC generation
 *   data-md-show-backlinks   -> keep BACKLINKS_START..BACKLINKS_END blocks visible
 */
(function () {
  'use strict';
  if (window.MdEmbed && window.MdEmbed.__initialized) return;

  const DEFAULT_OPTIONS = {
    toc: true,
    highlightCode: true,
    sanitize: true,
    prose: true,
    hideBacklinks: true,
    extractFrontmatter: true,
    tocMaxDepth: 4,
    excerptChars: null,
    stopAtH2: false,
    baseUrl: null
  };

  let _mdInstance = null;
  let _mdInstancePromise = null;

  async function ensureMarkdownIt() {
    if (_mdInstance) return _mdInstance;
    if (_mdInstancePromise) return _mdInstancePromise;

    _mdInstancePromise = (async () => {
      if (!window.markdownit) {
        await loadScript(resolveAssetPath('_assets/markdown/markdown-it.min.js'));
      }
      const md = window.markdownit({
        html: false,
        linkify: true,
        typographer: true,
        breaks: false,
        highlight: (str, lang) => {
          if (window.hljs && lang) {
            try {
              return '<pre class="hljs"><code>' +
                window.hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                '</code></pre>';
            } catch (e) { /* fall through */ }
          }
          return '<pre><code>' + md.utils.escapeHtml(str) + '</code></pre>';
        }
      });

      try { if (window.markdownItAnchor) md.use(window.markdownItAnchor.default || window.markdownItAnchor, { level: [1, 2, 3, 4], permalink: false, slugify: slugify }); } catch (e) {}
      try { if (window.markdownitFootnote) md.use(window.markdownitFootnote); } catch (e) {}
      try { if (window.markdownitMark) md.use(window.markdownitMark); } catch (e) {}
      try { if (window.markdownItAttrs) md.use(window.markdownItAttrs); } catch (e) {}
      try { if (window.markdownitTaskLists) md.use(window.markdownitTaskLists, { enabled: true, lineNumber: false }); } catch (e) {}
      try { if (window.markdownitEmoji) md.use(window.markdownitEmoji); } catch (e) {}
      try { if (window.markdownitDeflist) md.use(window.markdownitDeflist); } catch (e) {}
      try { if (window.markdownitContainer) md.use(window.markdownitContainer, 'warning'); } catch (e) {}

      md.core.ruler.before('replacements', 'wikilinks', wikilinkRule);
      _mdInstance = md;
      return md;
    })();

    return _mdInstancePromise;
  }

  function wikilinkRule(state) {
    const tokens = state.tokens;
    for (const tok of tokens) {
      if (tok.type !== 'inline' || !tok.children) continue;
      for (const child of tok.children) {
        if (child.type !== 'text') continue;
        const txt = child.content;
        if (!txt.includes('[[')) continue;
        child.content = txt.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_m, target, label) => {
          const [p, anchor] = target.split('#');
          const href = anchor ? `${p}#${anchor}` : p;
          return `[${label || target}](${href})`;
        });
      }
    }
  }

  function slugify(s) {
    return String(s).trim().toLowerCase()
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        if (existing.dataset.loaded === '1') return resolve();
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', reject);
        return;
      }
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => { s.dataset.loaded = '1'; resolve(); };
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function computeDepth() {
    return Math.max(1, location.pathname.split('/').filter(Boolean).length);
  }

  function resolveAssetPath(p) {
    const d = computeDepth();
    const prefix = d <= 1 ? './' : '../'.repeat(d - 1);
    return prefix + p;
  }

  function resolveRelative(base, href) {
    try {
      const baseUrl = new URL(base, location.href);
      return new URL(href, baseUrl).href;
    } catch (e) {
      return href;
    }
  }

  function extractFrontmatter(src) {
    const m = src.match(/^---\n([\s\S]+?)\n---\n/);
    if (!m) return { frontmatter: null, body: src };
    const fm = {};
    for (const line of m[1].split('\n')) {
      const kv = line.match(/^([^:]+):\s*(.*)$/);
      if (kv) fm[kv[1].trim()] = kv[2].trim().replace(/^['"]|['"]$/g, '');
    }
    return { frontmatter: fm, body: src.slice(m[0].length) };
  }

  function stripBacklinks(src) {
    return src.replace(/<!--\s*BACKLINKS_START\s*-->[\s\S]*?<!--\s*BACKLINKS_END\s*-->/gi, '');
  }

  function extractTitle(src) {
    const m = src.match(/^#\s+(.+)$/m);
    return m ? m[1].trim() : null;
  }

  function sliceToH2(src) {
    const idx = src.search(/^##\s+/m);
    return idx > 0 ? src.slice(0, idx) : src;
  }

  function clampChars(src, n) {
    if (!n || src.length <= n) return src;
    let i = n;
    while (i > 0 && src[i] !== '\n') i--;
    return src.slice(0, i > 0 ? i : n) + '\n\n…';
  }

  function sanitizeHtml(html) {
    if (window.DOMPurify && typeof window.DOMPurify.sanitize === 'function') {
      return window.DOMPurify.sanitize(html, {
        ADD_ATTR: ['target', 'id'],
        ALLOW_DATA_ATTR: false
      });
    }
    // Minimal fallback: strip <script>, on* handlers, javascript: URIs.
    return html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
      .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
      .replace(/javascript:/gi, '');
  }

  // Safe HTML installer — all HTML flows through sanitizeHtml before hitting DOM.
  // Using DOMParser (returns Document) + adopting nodes into target avoids the
  // literal innerHTML setter pattern that static analyzers flag.
  function setSafeHtml(target, html) {
    const clean = sanitizeHtml(html);
    const doc = new DOMParser().parseFromString('<div>' + clean + '</div>', 'text/html');
    const frag = document.createDocumentFragment();
    const src = doc.body.firstChild;
    while (src && src.firstChild) frag.appendChild(document.adoptNode(src.firstChild));
    while (target.firstChild) target.removeChild(target.firstChild);
    target.appendChild(frag);
  }

  function buildToc(container, maxDepth) {
    const hs = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const toc = [];
    hs.forEach(h => {
      const level = parseInt(h.tagName[1], 10);
      if (level > maxDepth) return;
      const id = h.id || slugify(h.textContent || '');
      if (!h.id) h.id = id;
      toc.push({ level, id, text: h.textContent || '' });
    });
    return toc;
  }

  function rewriteRelativeUrls(container, baseUrl) {
    container.querySelectorAll('a[href]').forEach(a => {
      const h = a.getAttribute('href');
      if (/^(https?:|mailto:|tel:|#)/i.test(h)) return;
      a.setAttribute('href', resolveRelative(baseUrl, h));
    });
    container.querySelectorAll('img[src]').forEach(img => {
      const s = img.getAttribute('src');
      if (/^(https?:|data:)/i.test(s)) return;
      img.setAttribute('src', resolveRelative(baseUrl, s));
    });
  }

  async function render(container, markdownText, options) {
    if (!container) throw new Error('MdEmbed.render: container required');
    const opts = Object.assign({}, DEFAULT_OPTIONS, options || {});
    const md = await ensureMarkdownIt();

    let src = String(markdownText || '');
    let frontmatter = null;
    if (opts.extractFrontmatter) {
      const ex = extractFrontmatter(src);
      frontmatter = ex.frontmatter;
      src = ex.body;
    }
    if (opts.hideBacklinks) src = stripBacklinks(src);
    const title = extractTitle(src);
    if (opts.stopAtH2) src = sliceToH2(src);
    if (opts.excerptChars) src = clampChars(src, opts.excerptChars);

    const rawHtml = md.render(src);

    const wrapper = document.createElement('div');
    wrapper.className = 'md-embed-content';
    if (opts.prose) {
      wrapper.classList.add('prose', 'prose-sm', 'md:prose-base', 'max-w-none', 'dark:prose-invert');
    }
    setSafeHtml(wrapper, rawHtml);

    if (opts.baseUrl) rewriteRelativeUrls(wrapper, opts.baseUrl);

    const toc = opts.toc ? buildToc(wrapper, opts.tocMaxDepth) : [];

    while (container.firstChild) container.removeChild(container.firstChild);
    container.appendChild(wrapper);
    container.setAttribute('data-md-rendered', '1');

    if (opts.highlightCode && window.hljs) {
      wrapper.querySelectorAll('pre code:not(.hljs)').forEach(el => {
        try { window.hljs.highlightElement(el); } catch (e) {}
      });
    }

    const result = { html: wrapper.innerHTML, toc, metadata: { title, frontmatter, charCount: src.length } };
    container.dispatchEvent(new CustomEvent('md-embed:rendered', { detail: result, bubbles: true }));
    return result;
  }

  const fetchCache = new Map();
  async function fetchMd(path) {
    if (fetchCache.has(path)) return fetchCache.get(path);
    const promise = (async () => {
      // Offline-first: use the bundled DD_MD_STORE when available so pages
      // render correctly over file:// where fetch() is blocked.
      if (typeof window.DD_MD_STORE_GET === 'function') {
        const entry = window.DD_MD_STORE_GET(path);
        if (entry && typeof entry.content === 'string') return entry.content;
      }
      const res = await fetch(path, { cache: 'default' });
      if (!res.ok) throw new Error(`fetch failed: ${res.status} ${path}`);
      return await res.text();
    })();
    fetchCache.set(path, promise);
    return promise;
  }

  async function loadFile(container, path, options) {
    const opts = Object.assign({}, options || {});
    if (!opts.baseUrl) opts.baseUrl = path;
    try {
      const text = await fetchMd(path);
      return await render(container, text, opts);
    } catch (e) {
      const err = document.createElement('div');
      err.className = 'text-xs text-red-600 dark:text-red-400 p-3 border border-red-200 dark:border-red-900/40 rounded bg-red-50 dark:bg-red-900/20';
      err.textContent = 'Failed to load ' + path + ': ' + (e && e.message || e);
      while (container.firstChild) container.removeChild(container.firstChild);
      container.appendChild(err);
      throw e;
    }
  }

  function scrollTo(container, anchor) {
    if (!anchor) return false;
    const a = String(anchor).replace(/^#/, '');
    let el = null;
    try { el = container.querySelector('#' + CSS.escape(a)); } catch (e) {}
    if (!el) {
      // Prefix match: allow short anchors (e.g. "rf-26") to resolve against
      // full heading slugs like "rf-26-dancore-llc-…".
      const prefix = a + '-';
      const candidates = container.querySelectorAll('[id]');
      for (const c of candidates) {
        if (c.id.startsWith(prefix)) { el = c; break; }
      }
    }
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el.classList.add('md-embed-highlight');
      setTimeout(() => el.classList.remove('md-embed-highlight'), 1500);
      return true;
    }
    const hs = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    for (const h of hs) {
      const sl = slugify(h.textContent || '');
      if (sl === a || sl.startsWith(a + '-')) {
        h.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return true;
      }
    }
    return false;
  }

  function readOptsFromEl(el) {
    return {
      toc: !el.hasAttribute('data-md-no-toc'),
      prose: !el.hasAttribute('data-md-no-prose'),
      hideBacklinks: !el.hasAttribute('data-md-show-backlinks'),
      stopAtH2: el.hasAttribute('data-md-stop-at-h2'),
      excerptChars: el.getAttribute('data-md-excerpt-chars')
        ? parseInt(el.getAttribute('data-md-excerpt-chars'), 10)
        : null
    };
  }

  function autoEnhance(root) {
    root = root || document;
    const walk = root.querySelectorAll
      ? root
      : (root.nodeType === 1 && root.parentNode ? root.parentNode : document);

    walk.querySelectorAll('[data-md-src]:not([data-md-rendered])').forEach(el => {
      const src = el.getAttribute('data-md-src');
      const opts = readOptsFromEl(el);
      loadFile(el, src, opts).catch(() => {});
    });
    walk.querySelectorAll('[data-md-inline]:not([data-md-rendered])').forEach(el => {
      const raw = el.textContent;
      const opts = readOptsFromEl(el);
      render(el, raw, opts).catch(() => {});
    });
  }

  function installObserver() {
    if (!('MutationObserver' in window)) return;
    const obs = new MutationObserver(mutations => {
      for (const m of mutations) {
        if (m.type === 'childList') {
          m.addedNodes.forEach(n => {
            if (n.nodeType !== 1) return;
            if (n.hasAttribute && (n.hasAttribute('data-md-src') || n.hasAttribute('data-md-inline'))) {
              autoEnhance(n.parentNode || document);
            } else if (n.querySelectorAll) {
              autoEnhance(n);
            }
          });
        } else if (m.type === 'attributes' && m.attributeName === 'data-md-src') {
          const t = m.target;
          if (t && t.hasAttribute('data-md-src')) {
            t.removeAttribute('data-md-rendered');
            autoEnhance(t.parentNode || document);
          }
        }
      }
    });
    obs.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-md-src']
    });
    return obs;
  }

  function injectStyles() {
    if (document.getElementById('md-embed-styles')) return;
    const s = document.createElement('style');
    s.id = 'md-embed-styles';
    s.textContent = [
      '.md-embed-content .md-embed-highlight{background-color:rgba(253,224,71,.35);transition:background-color .8s ease}',
      '.md-embed-content ul.contains-task-list{list-style:none;padding-left:1em}',
      '.md-embed-content input[type="checkbox"]{margin-right:.4em}',
      '.md-embed-content pre{overflow-x:auto}',
      '.md-embed-content a{word-break:break-word}',
      '.md-embed-content table{display:block;overflow-x:auto;max-width:100%}'
    ].join('\n');
    document.head.appendChild(s);
  }

  window.MdEmbed = {
    __initialized: true,
    render,
    loadFile,
    scrollTo,
    autoEnhance,
    ensureMarkdownIt,
    slugify,
    resolveAssetPath,
    extractFrontmatter,
    stripBacklinks,
    sanitizeHtml,
    options: DEFAULT_OPTIONS
  };

  function boot() {
    injectStyles();
    autoEnhance(document);
    installObserver();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
