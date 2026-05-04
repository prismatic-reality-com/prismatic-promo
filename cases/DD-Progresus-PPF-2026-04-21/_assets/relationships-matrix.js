/* relationships-matrix.js
   Canvas-rendered file-to-file relationship heatmap.
   Data: ../.graph.json.  All DOM construction uses textContent/createElement. */
(function () {
  'use strict';

  const state = {
    nodes: [], edges: [], clusters: [],
    byId: new Map(),
    // dense matrix: edgeMatrix[rowIdx] -> Map(colIdx -> {type,count,weight})
    matrix: new Map(),
    // ordered list of currently-shown ids
    shown: [],
    cellSize: 8,
    labelWidth: 140,
    labelHeight: 60,
    filterTypes: new Set(),
    filterClusters: new Set(),
    searchTerm: '',
    showImplicit: true,
    showLabels: true,
    symmetrize: false,
    sort: 'degree',
    hovered: null,    // {r,c}
  };

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        if (k === 'class') node.className = attrs[k];
        else if (k === 'text') node.textContent = attrs[k];
        else if (k.startsWith('on') && typeof attrs[k] === 'function') {
          node.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        } else node.setAttribute(k, attrs[k]);
      }
    }
    if (children) for (const c of children) {
      if (c == null) continue;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return node;
  }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }

  async function loadGraph() {
    // Offline-first: prefer bundled DD_GRAPH (works over file://).
    let raw;
    if (window.DD_GRAPH) {
      raw = window.DD_GRAPH;
    } else {
      const resp = await fetch('../.graph.json', { cache: 'no-store' });
      if (!resp.ok) throw new Error('failed to load .graph.json');
      raw = await resp.json();
    }
    state.nodes = raw.nodes || [];
    state.edges = raw.edges || [];
    state.clusters = raw.clusters || [];
    state.nodes.forEach(n => state.byId.set(n.id, n));
    for (const e of state.edges) {
      if (!state.matrix.has(e.from)) state.matrix.set(e.from, new Map());
      state.matrix.get(e.from).set(e.to, e);
    }
    document.getElementById('matrix-stats').textContent =
      `${state.nodes.length} files · ${state.edges.length} relations`;
  }

  // ---------- sorting / filtering -------------------------------------------
  function computeShown() {
    const visible = state.nodes.filter(n => {
      if (state.filterTypes.size && !state.filterTypes.has(n.type)) return false;
      if (state.filterClusters.size && !state.filterClusters.has(n.cluster)) return false;
      if (state.searchTerm) {
        const hay = (n.id + ' ' + (n.title || '')).toLowerCase();
        if (!hay.includes(state.searchTerm)) return false;
      }
      return true;
    });
    const key = state.sort;
    visible.sort((a, b) => {
      switch (key) {
        case 'alpha': return a.id.localeCompare(b.id);
        case 'inbound': return (b.inbound || 0) - (a.inbound || 0) || a.id.localeCompare(b.id);
        case 'outbound': return (b.outbound || 0) - (a.outbound || 0) || a.id.localeCompare(b.id);
        case 'size': return (b.size || 0) - (a.size || 0);
        case 'cluster':
          return (a.cluster || '').localeCompare(b.cluster || '') || a.id.localeCompare(b.id);
        case 'degree':
        default:
          return ((b.inbound || 0) + (b.outbound || 0)) - ((a.inbound || 0) + (a.outbound || 0))
                 || a.id.localeCompare(b.id);
      }
    });
    state.shown = visible;
  }

  // ---------- canvas rendering ----------------------------------------------
  function render() {
    const canvas = document.getElementById('matrix-canvas');
    const ctx = canvas.getContext('2d');
    const N = state.shown.length;
    const cs = state.cellSize;
    const labels = state.showLabels;
    const lw = labels ? state.labelWidth : 4;
    const lh = labels ? state.labelHeight : 4;
    const W = lw + N * cs + 4;
    const H = lh + N * cs + 4;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // background
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, W, H);

    // cluster bands
    if (state.sort === 'cluster') {
      let start = 0;
      for (let i = 0; i <= N; i++) {
        const prev = i > 0 ? state.shown[i - 1].cluster : null;
        const cur = i < N ? state.shown[i].cluster : null;
        if (cur !== prev) {
          if (prev != null) {
            const clr = (state.clusters.find(c => c.id === prev) || {}).color || '#334155';
            ctx.fillStyle = clr + '20';
            ctx.fillRect(lw + start * cs, 0, (i - start) * cs, lh);
            ctx.fillRect(0, lh + start * cs, lw, (i - start) * cs);
          }
          start = i;
        }
      }
    }

    // labels
    if (labels) {
      ctx.font = '10px system-ui,sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'right';
      for (let i = 0; i < N; i++) {
        const n = state.shown[i];
        const label = (n.id.length > 22) ? ('…' + n.id.slice(-21)) : n.id;
        ctx.fillText(label, lw - 4, lh + i * cs + cs / 2);
      }
      ctx.textAlign = 'left';
      for (let i = 0; i < N; i++) {
        const n = state.shown[i];
        const label = (n.id.length > 22) ? ('…' + n.id.slice(-21)) : n.id;
        ctx.save();
        ctx.translate(lw + i * cs + cs / 2, lh - 4);
        ctx.rotate(-Math.PI / 3);
        ctx.fillText(label, 0, 0);
        ctx.restore();
      }
    }

    // cells
    for (let r = 0; r < N; r++) {
      const from = state.shown[r].id;
      const row = state.matrix.get(from);
      for (let c = 0; c < N; c++) {
        const to = state.shown[c].id;
        let e = row ? row.get(to) : null;
        if (!e && state.symmetrize) {
          const rev = state.matrix.get(to);
          if (rev) e = rev.get(from);
        }
        // Diagonal
        if (r === c) {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(lw + c * cs, lh + r * cs, cs, cs);
          ctx.strokeStyle = '#475569';
          ctx.strokeRect(lw + c * cs + 0.5, lh + r * cs + 0.5, cs - 1, cs - 1);
          continue;
        }
        if (!e) {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(lw + c * cs, lh + r * cs, cs, cs);
          continue;
        }
        if (e.type === 'implicit' && !state.showImplicit) {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(lw + c * cs, lh + r * cs, cs, cs);
          continue;
        }
        const color = cellColor(e);
        ctx.fillStyle = color;
        ctx.fillRect(lw + c * cs, lh + r * cs, cs, cs);
      }
    }

    // hover highlight
    if (state.hovered) {
      const { r, c } = state.hovered;
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(lw + c * cs + 0.5, lh + r * cs + 0.5, cs - 1, cs - 1);
      // cross-hair band
      ctx.fillStyle = 'rgba(253, 224, 71, 0.10)';
      ctx.fillRect(lw + c * cs, 0, cs, H);
      ctx.fillRect(0, lh + r * cs, W, cs);
    }
  }

  function cellColor(e) {
    if (e.type === 'implicit') return '#a855f7';
    const c = e.count || 0;
    if (c > 5) return '#ef4444';
    if (c >= 3) return '#f59e0b';
    return '#60a5fa';
  }

  // ---------- interaction ---------------------------------------------------
  function hitCell(ev) {
    const canvas = document.getElementById('matrix-canvas');
    const rect = canvas.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const cs = state.cellSize;
    const lw = state.showLabels ? state.labelWidth : 4;
    const lh = state.showLabels ? state.labelHeight : 4;
    if (x < lw || y < lh) return null;
    const c = Math.floor((x - lw) / cs);
    const r = Math.floor((y - lh) / cs);
    if (r < 0 || c < 0 || r >= state.shown.length || c >= state.shown.length) return null;
    return { r, c };
  }

  function handleMove(ev) {
    const cell = hitCell(ev);
    if (!cell) {
      if (state.hovered) { state.hovered = null; render(); hideTooltip(); }
      return;
    }
    if (!state.hovered || state.hovered.r !== cell.r || state.hovered.c !== cell.c) {
      state.hovered = cell;
      render();
    }
    showTooltip(cell, ev.clientX, ev.clientY);
  }

  function handleLeave() {
    if (state.hovered) { state.hovered = null; render(); hideTooltip(); }
  }

  function handleClick(ev) {
    const cell = hitCell(ev);
    if (!cell) return;
    openDetail(cell);
  }

  function showTooltip(cell, sx, sy) {
    const tip = document.getElementById('tooltip');
    const from = state.shown[cell.r];
    const to = state.shown[cell.c];
    let e = (state.matrix.get(from.id) || new Map()).get(to.id);
    if (!e && state.symmetrize) {
      e = (state.matrix.get(to.id) || new Map()).get(from.id);
    }
    clear(tip);
    tip.appendChild(el('div', {
      class: 'font-semibold text-gray-100 mb-1', text: from.id + '  →  ' + to.id,
    }));
    if (cell.r === cell.c) {
      tip.appendChild(el('div', { class: 'text-gray-400', text: '(diagonal — self)' }));
    } else if (!e) {
      tip.appendChild(el('div', { class: 'text-gray-500', text: 'no direct or implicit relation' }));
    } else if (e.type === 'implicit') {
      tip.appendChild(el('div', { class: 'text-purple-300', text: 'implicit — ' + e.label }));
      if (e.context) tip.appendChild(el('div', { class: 'text-gray-400 text-[11px]', text: e.context }));
    } else {
      tip.appendChild(el('div', { class: 'text-blue-300', text: `direct — ${e.count || 1}× mention${(e.count || 1) > 1 ? 's' : ''}` }));
      if (e.context) tip.appendChild(el('div', { class: 'text-gray-400 text-[11px]', text: e.context }));
      if (e.label) tip.appendChild(el('div', { class: 'text-gray-500 text-[11px]', text: '“' + e.label + '”' }));
    }
    tip.style.left = (sx + 14) + 'px';
    tip.style.top = (sy + 14) + 'px';
    tip.classList.remove('hidden');
  }
  function hideTooltip() { document.getElementById('tooltip').classList.add('hidden'); }

  function openDetail(cell) {
    const from = state.shown[cell.r];
    const to = state.shown[cell.c];
    const panel = document.getElementById('detail-panel');
    const body = document.getElementById('detail-body');
    clear(body);
    panel.classList.remove('translate-x-full');

    const makeCard = (n) => {
      const card = el('div', { class: 'border border-gray-800 rounded p-2 space-y-1 mb-3' });
      card.appendChild(el('div', { class: 'text-xs text-gray-500', text: n.cluster + ' · ' + n.type }));
      card.appendChild(el('div', { class: 'font-semibold text-white text-sm break-words', text: n.title || n.id }));
      card.appendChild(el('div', { class: 'text-xs text-gray-500 break-all', text: n.id }));
      card.appendChild(el('div', { class: 'text-xs text-gray-400 leading-relaxed',
        text: (n.excerpt || '—').slice(0, 220) + ((n.excerpt || '').length > 220 ? '…' : '') }));
      const meta = el('div', { class: 'text-[11px] text-gray-500' });
      meta.textContent = `${(n.size / 1024).toFixed(1)} KB · ${n.inbound || 0} in · ${n.outbound || 0} out`;
      card.appendChild(meta);
      card.appendChild(el('a', {
        href: '../' + n.id, target: '_blank', rel: 'noopener',
        class: 'inline-block mt-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-500 rounded text-white',
        text: 'Open file',
      }));
      return card;
    };

    body.appendChild(el('h2', { class: 'text-sm font-semibold text-white mb-2', text: 'Pair inspector' }));
    body.appendChild(el('div', { class: 'text-xs text-gray-400 mb-1 uppercase tracking-wider', text: 'Row (from)' }));
    body.appendChild(makeCard(from));
    body.appendChild(el('div', { class: 'text-xs text-gray-400 mb-1 uppercase tracking-wider', text: 'Column (to)' }));
    body.appendChild(makeCard(to));

    // Relation summary
    const summary = el('div', { class: 'border-t border-gray-800 pt-2 text-xs' });
    const e = (state.matrix.get(from.id) || new Map()).get(to.id);
    const eRev = (state.matrix.get(to.id) || new Map()).get(from.id);
    if (e) {
      summary.appendChild(el('div', { class: 'text-green-400', text: `→ ${e.type}${e.count ? ' (' + e.count + 'x)' : ''}` }));
      if (e.context) summary.appendChild(el('div', { class: 'text-gray-500', text: e.context }));
      if (e.label) summary.appendChild(el('div', { class: 'text-gray-500 italic', text: '“' + e.label + '”' }));
    } else {
      summary.appendChild(el('div', { class: 'text-gray-500', text: '→ no relation' }));
    }
    if (eRev) {
      summary.appendChild(el('div', { class: 'text-green-400 mt-1', text: `← ${eRev.type}${eRev.count ? ' (' + eRev.count + 'x)' : ''}` }));
      if (eRev.context) summary.appendChild(el('div', { class: 'text-gray-500', text: eRev.context }));
    } else {
      summary.appendChild(el('div', { class: 'text-gray-500 mt-1', text: '← no reverse relation' }));
    }
    body.appendChild(summary);

    body.appendChild(el('a', {
      href: '../knowledge-graph.html', class: 'inline-block mt-3 text-blue-400 text-xs hover:text-blue-200',
      text: 'Explore in graph view →',
    }));
  }

  // ---------- filter chips --------------------------------------------------
  function buildFilterChips() {
    const types = new Set(state.nodes.map(n => n.type));
    const typeEl = document.getElementById('type-filters');
    [...types].sort().forEach(t => {
      const b = el('button', {
        class: 'px-2 py-0.5 rounded border border-gray-700 text-gray-300 hover:bg-gray-800', text: t,
      });
      b.addEventListener('click', () => {
        if (state.filterTypes.has(t)) { state.filterTypes.delete(t); b.classList.remove('bg-gray-700'); }
        else { state.filterTypes.add(t); b.classList.add('bg-gray-700'); }
        computeShown(); render();
      });
      typeEl.appendChild(b);
    });

    const clusterEl = document.getElementById('cluster-filters');
    state.clusters.forEach(c => {
      const b = el('button', {
        class: 'px-2 py-0.5 rounded border text-gray-300 hover:bg-gray-800',
        style: 'border-color:' + c.color + '77;color:' + c.color,
        text: c.id + ' (' + c.count + ')',
      });
      b.addEventListener('click', () => {
        if (state.filterClusters.has(c.id)) { state.filterClusters.delete(c.id); b.classList.remove('bg-gray-700'); }
        else { state.filterClusters.add(c.id); b.classList.add('bg-gray-700'); }
        computeShown(); render();
      });
      clusterEl.appendChild(b);
    });
  }

  function wireControls() {
    document.getElementById('search').addEventListener('input', (e) => {
      state.searchTerm = e.target.value.toLowerCase().trim();
      computeShown(); render();
    });
    document.getElementById('sort').addEventListener('change', (e) => {
      state.sort = e.target.value;
      computeShown(); render();
    });
    document.getElementById('show-implicit').addEventListener('change', (e) => {
      state.showImplicit = e.target.checked; render();
    });
    document.getElementById('show-labels').addEventListener('change', (e) => {
      state.showLabels = e.target.checked; render();
    });
    document.getElementById('symmetric').addEventListener('change', (e) => {
      state.symmetrize = e.target.checked; render();
    });
    const cs = document.getElementById('cell-size');
    cs.addEventListener('input', () => {
      state.cellSize = +cs.value;
      document.getElementById('cell-val').textContent = cs.value;
      render();
    });
    document.getElementById('detail-close').addEventListener('click', () => {
      document.getElementById('detail-panel').classList.add('translate-x-full');
    });

    const canvas = document.getElementById('matrix-canvas');
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseleave', handleLeave);
    canvas.addEventListener('click', handleClick);
  }

  // ---------- boot ----------------------------------------------------------
  window.addEventListener('DOMContentLoaded', () => {
    loadGraph().then(() => {
      buildFilterChips();
      wireControls();
      computeShown();
      render();

      // Re-render on viewport/DPR changes or host size changes (monitor move,
      // sidebar collapse, browser zoom). Throttled via requestAnimationFrame.
      let raf = 0;
      const schedule = () => {
        if (raf) return;
        raf = requestAnimationFrame(() => { raf = 0; render(); });
      };
      window.addEventListener('resize', schedule, { passive: true });
      const host = document.getElementById('matrix-host');
      if (host && window.ResizeObserver) new ResizeObserver(schedule).observe(host);
    }).catch(err => {
      console.error(err);
      document.getElementById('matrix-stats').textContent = 'error: ' + err.message;
    });
  });

})();
