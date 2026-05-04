/**
 * connections.js — client-side helpers for backlinks, related files,
 * graph search, and shortest-path highlighting.
 *
 * Data source: local .graph.json produced by the DD workspace build pipeline
 * (trusted, generated content). All user-facing strings are passed through
 * escapeHtml() or inserted via textContent / DOM APIs — no raw untrusted HTML
 * is ever written to innerHTML.
 *
 * Usage:
 *   <script src="../_assets/connections.js"></script>
 *   <script>
 *     Connections.init().then(() => {
 *       Connections.renderBacklinksPanel(
 *         document.querySelector('#related-panel'),
 *         '03-financial/bond-stack.html'
 *       );
 *     });
 *   </script>
 */
(function (global) {
  'use strict';

  const STATE = {
    graph: null,
    loaded: false,
    loading: null,
    edgesFrom: new Map(),
    edgesTo: new Map(),
    nodesById: new Map(),
  };

  function resolveGraphUrl() {
    const path = global.location ? global.location.pathname : '/';
    const depth = Math.max(0, path.split('/').filter(Boolean).length - 1);
    const prefix = depth === 0 ? './' : '../'.repeat(depth);
    return prefix + '.graph.json';
  }

  function indexGraph(graph) {
    STATE.graph = graph;
    STATE.nodesById.clear();
    STATE.edgesFrom.clear();
    STATE.edgesTo.clear();
    (graph.nodes || []).forEach(function (n) { STATE.nodesById.set(n.id, n); });
    (graph.edges || []).forEach(function (e) {
      if (!STATE.edgesFrom.has(e.from)) STATE.edgesFrom.set(e.from, []);
      if (!STATE.edgesTo.has(e.to)) STATE.edgesTo.set(e.to, []);
      STATE.edgesFrom.get(e.from).push(e);
      STATE.edgesTo.get(e.to).push(e);
    });
    STATE.loaded = true;
  }

  function init(url) {
    if (STATE.loaded) return Promise.resolve(STATE.graph);
    if (STATE.loading) return STATE.loading;
    // Offline-first: prefer bundled DD_GRAPH (works over file://).
    if (global.DD_GRAPH) {
      indexGraph(global.DD_GRAPH);
      return Promise.resolve(STATE.graph);
    }
    const target = url || resolveGraphUrl();
    STATE.loading = fetch(target, { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('Failed to load graph: ' + r.status);
        return r.json();
      })
      .then(function (g) { indexGraph(g); return g; });
    return STATE.loading;
  }

  function pageDepth() {
    const path = global.location ? global.location.pathname : '/';
    return Math.max(0, path.split('/').filter(Boolean).length - 1);
  }

  function rootPrefix() {
    const d = pageDepth();
    return d === 0 ? './' : '../'.repeat(d);
  }

  function linkTo(targetId) { return rootPrefix() + targetId; }

  function getBacklinks(filename) {
    if (!STATE.loaded) return [];
    const edges = STATE.edgesTo.get(filename) || [];
    const bucket = new Map();
    edges.forEach(function (e) {
      const prev = bucket.get(e.from) || { source: e.from, count: 0, label: null };
      prev.count += e.count || 1;
      if (!prev.label && e.label) prev.label = e.label;
      bucket.set(e.from, prev);
    });
    return Array.from(bucket.values()).sort(function (a, b) { return b.count - a.count; });
  }

  function tagSet(node) {
    return new Set(((node && node.tags) || []).map(function (t) { return String(t).toLowerCase(); }));
  }

  function jaccard(a, b) {
    if (!a.size || !b.size) return 0;
    let inter = 0;
    a.forEach(function (x) { if (b.has(x)) inter += 1; });
    return inter / (a.size + b.size - inter);
  }

  function getRelated(filename, threshold, limit) {
    if (!STATE.loaded) return [];
    threshold = typeof threshold === 'number' ? threshold : 0.3;
    limit = typeof limit === 'number' ? limit : 5;
    const target = STATE.nodesById.get(filename);
    if (!target) return [];
    const ta = tagSet(target);
    if (!ta.size) return [];
    const scored = [];
    STATE.nodesById.forEach(function (node, id) {
      if (id === filename) return;
      const s = jaccard(ta, tagSet(node));
      if (s >= threshold) scored.push({ id: id, score: s, title: node.title || id });
    });
    scored.sort(function (a, b) { return b.score - a.score; });
    return scored.slice(0, limit);
  }

  // DOM helpers: build nodes instead of concatenating HTML strings.
  function el(tag, attrs, children) {
    const n = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'class') n.className = attrs[k];
        else if (k === 'text') n.textContent = attrs[k];
        else n.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) {
      if (c == null) return;
      n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return n;
  }

  function renderBacklinksPanel(container, filename) {
    if (!container) return;
    while (container.firstChild) container.removeChild(container.firstChild);

    const backs = getBacklinks(filename);
    const related = getRelated(filename);

    const wrap = el('div', { class: 'space-y-4 text-sm' });

    // Zpětné odkazy
    const backSec = el('div', {}, [
      el('h4', { class: 'text-xs uppercase tracking-wider text-gray-400 mb-2', text: '🔗 Zpětné odkazy' }),
    ]);
    const backUl = el('ul', { class: 'space-y-1 ml-2' });
    if (backs.length) {
      backs.slice(0, 10).forEach(function (b) {
        const li = el('li');
        const a = el('a', { class: 'text-sky-400 hover:text-sky-200 hover:underline', href: linkTo(b.source), text: b.source });
        li.appendChild(a);
        if (b.count > 1) {
          li.appendChild(el('span', { class: 'text-xs text-gray-500', text: ' ×' + b.count }));
        }
        if (b.label) {
          li.appendChild(el('span', { class: 'text-xs text-gray-500', text: ' — ' + b.label }));
        }
        backUl.appendChild(li);
      });
    } else {
      backUl.appendChild(el('li', { class: 'text-gray-500 italic', text: 'Žádné příchozí odkazy.' }));
    }
    backSec.appendChild(backUl);
    wrap.appendChild(backSec);

    // Související
    const relSec = el('div', {}, [
      el('h4', { class: 'text-xs uppercase tracking-wider text-gray-400 mb-2', text: '🏷️ Související' }),
    ]);
    const relUl = el('ul', { class: 'space-y-1 ml-2' });
    if (related.length) {
      related.forEach(function (r) {
        const li = el('li');
        li.appendChild(el('a', {
          class: 'text-emerald-400 hover:text-emerald-200 hover:underline',
          href: linkTo(r.id), text: r.id,
        }));
        li.appendChild(el('span', { class: 'text-xs text-gray-500', text: ' (' + r.score.toFixed(2) + ')' }));
        relUl.appendChild(li);
      });
    } else {
      relUl.appendChild(el('li', { class: 'text-gray-500 italic', text: 'Žádné silně související soubory.' }));
    }
    relSec.appendChild(relUl);
    wrap.appendChild(relSec);

    // Akce
    const actions = el('div', { class: 'pt-2 border-t border-gray-700 space-y-1' });
    actions.appendChild(el('a', { class: 'block text-gray-300 hover:text-white', href: linkTo('index.html'), text: '🏠 Otevřít v portálu' }));
    actions.appendChild(el('a', { class: 'block text-gray-300 hover:text-white', href: linkTo('sitemap.html'), text: '🗺️ Mapa stránek' }));
    actions.appendChild(el('a', { class: 'block text-gray-300 hover:text-white', href: linkTo('search.html'), text: '🔎 Hledat' }));
    const printBtn = el('button', { type: 'button', class: 'block w-full text-left text-gray-300 hover:text-white', text: '🖨️ Tisk / PDF' });
    printBtn.addEventListener('click', function () { global.print && global.print(); });
    actions.appendChild(printBtn);
    wrap.appendChild(actions);

    container.appendChild(wrap);
  }

  function graphSearch(query, limit) {
    if (!STATE.loaded) return [];
    limit = typeof limit === 'number' ? limit : 20;
    const q = String(query || '').toLowerCase().trim();
    if (!q) return [];
    const tokens = q.split(/\s+/);
    const out = [];
    STATE.nodesById.forEach(function (node, id) {
      const hay = [id, node.title || '', node.excerpt || '', (node.tags || []).join(' ')]
        .join(' ').toLowerCase();
      let score = 0;
      tokens.forEach(function (t) {
        if (hay.includes(t)) score += 1;
        if ((node.title || '').toLowerCase().includes(t)) score += 2;
        if (id.toLowerCase().includes(t)) score += 1;
      });
      if (score > 0) out.push({ id: id, score: score, title: node.title || id, type: node.type });
    });
    out.sort(function (a, b) { return b.score - a.score; });
    return out.slice(0, limit);
  }

  function highlightPath(fromFile, toFile) {
    if (!STATE.loaded) return null;
    if (fromFile === toFile) return [fromFile];
    const visited = new Set([fromFile]);
    const parent = new Map();
    const queue = [fromFile];
    while (queue.length) {
      const cur = queue.shift();
      const neighbors = (STATE.edgesFrom.get(cur) || []).map(function (e) { return e.to; })
        .concat((STATE.edgesTo.get(cur) || []).map(function (e) { return e.from; }));
      for (let i = 0; i < neighbors.length; i++) {
        const n = neighbors[i];
        if (visited.has(n)) continue;
        visited.add(n);
        parent.set(n, cur);
        if (n === toFile) {
          const path = [n];
          let p = cur;
          while (p) { path.unshift(p); p = parent.get(p); }
          return path;
        }
        queue.push(n);
      }
    }
    return null;
  }

  global.Connections = {
    init: init,
    getBacklinks: getBacklinks,
    getRelated: getRelated,
    renderBacklinksPanel: renderBacklinksPanel,
    graphSearch: graphSearch,
    highlightPath: highlightPath,
    _state: STATE,
  };
})(typeof window !== 'undefined' ? window : this);
