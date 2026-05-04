/* knowledge-graph.js
   Interactive force-directed graph rendered with P5.js.
   Data: ../.graph.json (produced by build-graph.py).
   All DOM construction uses textContent / createElement — no innerHTML. */
(function () {
  'use strict';

  const state = {
    nodes: [], edges: [], clusters: [], stats: {},
    byId: new Map(), neighbors: new Map(), edgeIndex: new Map(),
    filterTypes: new Set(), filterClusters: new Set(), filterSeverity: new Set(),
    searchTerm: '', showImplicit: true, showLabels: false,
    focusMode: false, pathMode: false,
    pathEndpoints: [], pathHighlight: new Set(),
    physicsOn: true,
    selected: null, hovered: null, dragging: null,
    camera: { x: 0, y: 0, scale: 1 },
    panning: false, panStart: null,
    params: { repulsion: 900, spring: 0.03, damping: 0.85 },
    canvasW: 0, canvasH: 0,
    colors: {
      index: '#3b82f6', red_flag: '#ef4444', report: '#f97316',
      dashboard: '#10b981', evidence: '#eab308', comms: '#a855f7',
      markdown: '#9ca3af', raw: '#78350f', data: '#78350f', readme: '#60a5fa',
    },
  };

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        if (k === 'class') node.className = attrs[k];
        else if (k === 'text') node.textContent = attrs[k];
        else if (k.startsWith('on') && typeof attrs[k] === 'function') {
          node.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        } else {
          node.setAttribute(k, attrs[k]);
        }
      }
    }
    if (children) {
      for (const c of children) {
        if (c == null) continue;
        node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      }
    }
    return node;
  }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  async function loadGraph() {
    // Offline-first: prefer bundled DD_GRAPH (works over file://).
    let raw;
    if (window.DD_GRAPH) {
      raw = window.DD_GRAPH;
    } else {
      const resp = await fetch('./.graph.json', { cache: 'no-store' });
      if (!resp.ok) throw new Error('failed to load .graph.json');
      raw = await resp.json();
    }
    state.clusters = raw.clusters || [];
    state.stats = raw.stats || {};

    const N = raw.nodes.length;
    raw.nodes.forEach((n, i) => {
      const angle = (i / N) * Math.PI * 2;
      const r = 280 + (Math.random() * 120);
      n.x = Math.cos(angle) * r; n.y = Math.sin(angle) * r;
      n.vx = 0; n.vy = 0; n.pinned = false;
      n.radius = nodeRadius(n);
      n.color = state.colors[n.type] || '#9ca3af';
      state.byId.set(n.id, n);
      state.edgeIndex.set(n.id, []);
      state.neighbors.set(n.id, new Set());
    });
    state.nodes = raw.nodes;

    raw.edges.forEach(e => {
      const a = state.byId.get(e.from);
      const b = state.byId.get(e.to);
      if (!a || !b) return;
      state.edges.push(e);
      state.edgeIndex.get(a.id).push(e);
      state.edgeIndex.get(b.id).push(e);
      state.neighbors.get(a.id).add(b.id);
      state.neighbors.get(b.id).add(a.id);
    });

    document.getElementById('stats-line').textContent =
      `${state.nodes.length} nodes · ${state.edges.length} edges · ` +
      `${state.stats.direct_edges}/${state.stats.implicit_edges} direct/implicit`;
  }

  function nodeRadius(n) {
    const degree = (n.inbound || 0) + (n.outbound || 0);
    return Math.min(24, 5 + Math.sqrt(degree) * 2.2 + Math.log10((n.size || 1000)) * 0.6);
  }

  function isNodeVisible(n) {
    if (state.filterTypes.size && !state.filterTypes.has(n.type)) return false;
    if (state.filterClusters.size && !state.filterClusters.has(n.cluster)) return false;
    if (state.filterSeverity.size && !(n.severity && state.filterSeverity.has(n.severity))) return false;
    if (state.searchTerm) {
      const hay = (n.id + ' ' + (n.title || '') + ' ' + (n.tags || []).join(' ')).toLowerCase();
      if (!hay.includes(state.searchTerm)) return false;
    }
    return true;
  }
  function isEdgeVisible(e) {
    if (!state.showImplicit && e.type === 'implicit') return false;
    const a = state.byId.get(e.from);
    const b = state.byId.get(e.to);
    if (!a || !b) return false;
    if (!isNodeVisible(a) || !isNodeVisible(b)) return false;
    if (state.focusMode && state.selected) {
      if (a.id !== state.selected && b.id !== state.selected) return false;
    }
    return true;
  }

  const sketch = (p) => {
    p.setup = () => {
      const host = document.getElementById('canvas-host');
      state.canvasW = host.clientWidth;
      state.canvasH = host.clientHeight;
      const c = p.createCanvas(state.canvasW, state.canvasH);
      c.parent('canvas-host');
      c.id('graph-canvas');
      p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
      state.camera.x = state.canvasW / 2;
      state.camera.y = state.canvasH / 2;
      p.textFont('system-ui');
      p.frameRate(60);
    };
    p.windowResized = () => {
      const host = document.getElementById('canvas-host');
      state.canvasW = host.clientWidth;
      state.canvasH = host.clientHeight;
      p.resizeCanvas(state.canvasW, state.canvasH);
    };
    p.draw = () => {
      p.clear();
      p.background(3, 7, 18, 255);
      if (state.physicsOn) stepPhysics();
      p.push();
      p.translate(state.camera.x, state.camera.y);
      p.scale(state.camera.scale);
      for (const e of state.edges) {
        if (!isEdgeVisible(e)) continue;
        const a = state.byId.get(e.from), b = state.byId.get(e.to);
        drawEdge(p, a, b, e);
      }
      for (const n of state.nodes) {
        if (!isNodeVisible(n)) continue;
        drawNode(p, n);
      }
      p.pop();
      if (p.frameCount % 30 === 0 && window._fpsLine) {
        window._fpsLine.textContent = Math.round(p.frameRate()) + ' fps';
      }
    };
    p.mousePressed = (ev) => {
      if (ev && ev.target && ev.target.id !== 'graph-canvas') return;
      const world = screenToWorld(p.mouseX, p.mouseY);
      const hit = hitTest(world.x, world.y);
      if (hit) {
        if (state.pathMode) {
          state.pathEndpoints.push(hit.id);
          if (state.pathEndpoints.length === 2) {
            state.pathHighlight = shortestPath(state.pathEndpoints[0], state.pathEndpoints[1]);
            state.pathEndpoints = [];
          }
          return;
        }
        state.dragging = hit;
        hit.pinned = true;
        state.selected = hit.id;
        renderDetail(hit);
        const c = document.getElementById('graph-canvas');
        if (c) c.classList.add('dragging');
      } else {
        state.panning = true;
        state.panStart = { x: p.mouseX - state.camera.x, y: p.mouseY - state.camera.y };
      }
    };
    p.mouseDragged = () => {
      if (state.dragging) {
        const world = screenToWorld(p.mouseX, p.mouseY);
        state.dragging.x = world.x; state.dragging.y = world.y;
        state.dragging.vx = 0; state.dragging.vy = 0;
      } else if (state.panning && state.panStart) {
        state.camera.x = p.mouseX - state.panStart.x;
        state.camera.y = p.mouseY - state.panStart.y;
      }
    };
    p.mouseReleased = () => {
      state.dragging = null;
      state.panning = false;
      state.panStart = null;
      const c = document.getElementById('graph-canvas');
      if (c) c.classList.remove('dragging');
    };
    p.mouseMoved = () => {
      const world = screenToWorld(p.mouseX, p.mouseY);
      const hit = hitTest(world.x, world.y);
      if (hit !== state.hovered) {
        state.hovered = hit;
        updateTooltip(hit, p.mouseX, p.mouseY);
      } else if (hit) {
        updateTooltip(hit, p.mouseX, p.mouseY);
      }
    };
    p.mouseWheel = (ev) => {
      const target = ev.target || document.activeElement;
      if (target && target.closest && target.closest('aside')) return;
      const world = screenToWorld(p.mouseX, p.mouseY);
      const factor = ev.delta > 0 ? 0.9 : 1.1;
      state.camera.scale = Math.max(0.2, Math.min(4, state.camera.scale * factor));
      const newWorld = screenToWorld(p.mouseX, p.mouseY);
      state.camera.x += (newWorld.x - world.x) * state.camera.scale;
      state.camera.y += (newWorld.y - world.y) * state.camera.scale;
      ev.preventDefault();
      return false;
    };
    p.keyPressed = () => {
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
      if (p.key === ' ') { togglePhysics(); return false; }
      if (p.key === 'r' || p.key === 'R') resetView();
    };
  };

  function stepPhysics() {
    const REP = state.params.repulsion, SPR = state.params.spring, DAMP = state.params.damping;
    const visible = state.nodes.filter(isNodeVisible);
    for (let i = 0; i < visible.length; i++) {
      const a = visible[i];
      if (a.pinned && a !== state.dragging) { a.vx *= DAMP; a.vy *= DAMP; }
      for (let j = i + 1; j < visible.length; j++) {
        const b = visible[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const distSq = dx * dx + dy * dy + 0.01;
        const dist = Math.sqrt(distSq);
        const force = REP / distSq;
        const fx = (dx / dist) * force, fy = (dy / dist) * force;
        if (!a.pinned) { a.vx -= fx; a.vy -= fy; }
        if (!b.pinned) { b.vx += fx; b.vy += fy; }
      }
    }
    for (const e of state.edges) {
      if (!isEdgeVisible(e)) continue;
      const a = state.byId.get(e.from), b = state.byId.get(e.to);
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) + 0.01;
      const rest = 120 + (e.type === 'implicit' ? 60 : 0);
      const delta = (dist - rest) * SPR * (e.weight || 0.5);
      const fx = (dx / dist) * delta, fy = (dy / dist) * delta;
      if (!a.pinned) { a.vx += fx; a.vy += fy; }
      if (!b.pinned) { b.vx -= fx; b.vy -= fy; }
    }
    for (const n of visible) {
      if (!n.pinned) {
        n.vx += -n.x * 0.0006; n.vy += -n.y * 0.0006;
        n.vx *= DAMP; n.vy *= DAMP;
        const v = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        if (v > 25) { n.vx = (n.vx / v) * 25; n.vy = (n.vy / v) * 25; }
        n.x += n.vx; n.y += n.vy;
      }
    }
  }

  function drawNode(p, n) {
    const isSel = n.id === state.selected;
    const isHov = state.hovered && state.hovered.id === n.id;
    const isPath = state.pathHighlight.has(n.id);
    const dim = state.focusMode && state.selected && n.id !== state.selected &&
                !state.neighbors.get(state.selected).has(n.id);
    p.noStroke();
    if (dim) p.fill(60, 60, 60, 120);
    else p.fill(n.color);
    p.circle(n.x, n.y, n.radius * 2);

    if (isSel || isPath) {
      p.noFill(); p.strokeWeight(2);
      p.stroke(isPath ? '#ef4444' : '#fde047');
      p.circle(n.x, n.y, n.radius * 2 + 6);
      p.noStroke();
    } else if (isHov) {
      p.noFill(); p.strokeWeight(1.5);
      p.stroke(255, 255, 255, 180);
      p.circle(n.x, n.y, n.radius * 2 + 4);
      p.noStroke();
    }

    if (n.severity === 'critical') {
      p.noFill(); p.strokeWeight(1);
      p.stroke(239, 68, 68, 160);
      p.circle(n.x, n.y, n.radius * 2 + 10);
      p.noStroke();
    }

    if (state.showLabels || isHov || isSel) {
      p.fill(dim ? 100 : 220);
      p.textAlign(p.CENTER, p.TOP);
      p.textSize(Math.max(10, 11 / state.camera.scale * 0.8));
      const label = (n.title && n.title.length < 34) ? n.title : n.id.split('/').pop();
      p.text(label.slice(0, 42), n.x, n.y + n.radius + 3);
    }
  }

  function drawEdge(p, a, b, e) {
    const dim = state.focusMode && state.selected &&
                a.id !== state.selected && b.id !== state.selected;
    const inPath = state.pathHighlight.has(a.id) && state.pathHighlight.has(b.id);
    let col, sw = 1;
    if (inPath) { col = [239, 68, 68, 230]; sw = 2.5; }
    else if (e.type === 'implicit') col = [168, 85, 247, dim ? 40 : 120];
    else if ((e.count || 0) > 5) { col = [249, 115, 22, dim ? 40 : 200]; sw = 2; }
    else col = [148, 163, 184, dim ? 25 : 110];
    p.stroke(col[0], col[1], col[2], col[3]);
    p.strokeWeight(sw);
    if (e.type === 'implicit') drawDashed(p, a.x, a.y, b.x, b.y, 5, 4);
    else p.line(a.x, a.y, b.x, b.y);
  }

  function drawDashed(p, x1, y1, x2, y2, dash, gap) {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1) return;
    const ux = dx / len, uy = dy / len;
    let drawn = 0;
    while (drawn < len) {
      const s = Math.min(dash, len - drawn);
      p.line(x1 + ux * drawn, y1 + uy * drawn, x1 + ux * (drawn + s), y1 + uy * (drawn + s));
      drawn += dash + gap;
    }
  }

  function screenToWorld(sx, sy) {
    return {
      x: (sx - state.camera.x) / state.camera.scale,
      y: (sy - state.camera.y) / state.camera.scale,
    };
  }
  function hitTest(wx, wy) {
    for (let i = state.nodes.length - 1; i >= 0; i--) {
      const n = state.nodes[i];
      if (!isNodeVisible(n)) continue;
      const dx = wx - n.x, dy = wy - n.y;
      if (dx * dx + dy * dy <= (n.radius + 3) ** 2) return n;
    }
    return null;
  }

  function shortestPath(a, b) {
    const seen = new Set([a]);
    const parent = { [a]: null };
    const queue = [a];
    while (queue.length) {
      const cur = queue.shift();
      if (cur === b) break;
      for (const nb of state.neighbors.get(cur) || []) {
        if (!seen.has(nb)) { seen.add(nb); parent[nb] = cur; queue.push(nb); }
      }
    }
    const out = new Set();
    if (!(b in parent)) return out;
    let cur = b;
    while (cur) { out.add(cur); cur = parent[cur]; }
    return out;
  }

  function renderDetail(n) {
    const panel = document.getElementById('detail-panel');
    panel.classList.remove('translate-x-full');
    const body = document.getElementById('detail-body');
    clear(body);

    const inbound = state.edges.filter(e => e.to === n.id);
    const outbound = state.edges.filter(e => e.from === n.id);

    const header = el('div', { class: 'space-y-1' });
    const badges = el('div', { class: 'flex items-center gap-1 flex-wrap' });
    badges.appendChild(el('span', {
      class: 'inline-block text-xs px-1.5 py-0.5 rounded',
      style: `background:${n.color}33;color:${n.color};border:1px solid ${n.color}66`,
      text: n.type,
    }));
    badges.appendChild(el('span', {
      class: 'inline-block text-xs px-1.5 py-0.5 rounded bg-gray-800 text-gray-400',
      text: n.cluster || '-',
    }));
    if (n.severity) {
      const sevColors = { critical: 'red', high: 'orange', medium: 'yellow' };
      const c = sevColors[n.severity] || 'gray';
      badges.appendChild(el('span', {
        class: `inline-block px-1.5 py-0.5 text-[10px] rounded ml-2 bg-${c}-900/60 text-${c}-300 border border-${c}-700`,
        text: n.severity,
      }));
    }
    header.appendChild(badges);
    header.appendChild(el('h2', {
      class: 'font-semibold text-base mt-2 text-white leading-tight break-words',
      text: n.title || n.id,
    }));
    header.appendChild(el('div', {
      class: 'text-xs text-gray-500 break-all mt-1', text: n.id,
    }));
    header.appendChild(el('div', {
      class: 'text-xs text-gray-500 mt-1',
      text: `${(n.size / 1024).toFixed(1)} KB · ${inbound.length} in · ${outbound.length} out · ${(n.tags || []).length} tags`,
    }));
    body.appendChild(header);

    const exBlock = el('div', { class: 'mt-3' });
    exBlock.appendChild(el('div', { class: 'text-xs text-gray-400 uppercase tracking-wider mb-1', text: 'Excerpt' }));
    exBlock.appendChild(el('p', {
      class: 'text-gray-200 text-xs leading-relaxed',
      text: (n.excerpt || '—') + (n.excerpt && n.excerpt.length >= 200 ? '…' : ''),
    }));
    body.appendChild(exBlock);

    if (n.tags && n.tags.length) {
      const tagsBlock = el('div', { class: 'mt-3' });
      tagsBlock.appendChild(el('div', { class: 'text-xs text-gray-400 uppercase tracking-wider mb-1', text: 'Tags' }));
      const tagsWrap = el('div', { class: 'flex flex-wrap gap-1' });
      n.tags.forEach(t => {
        tagsWrap.appendChild(el('span', {
          class: 'text-[10px] px-1.5 py-0.5 bg-gray-800 rounded text-gray-300', text: t,
        }));
      });
      tagsBlock.appendChild(tagsWrap);
      body.appendChild(tagsBlock);
    }

    const makeList = (title, edgesList, keyField) => {
      const block = el('div', { class: 'mt-3' });
      block.appendChild(el('div', { class: 'text-xs text-gray-400 uppercase tracking-wider mb-1', text: `${title} (${edgesList.length})` }));
      const ul = el('ul', { class: 'space-y-0.5 max-h-40 overflow-y-auto panel-scroll pr-1' });
      if (edgesList.length === 0) {
        ul.appendChild(el('li', { class: 'text-gray-600 text-xs', text: '— none —' }));
      } else {
        edgesList.slice(0, 40).forEach(e => {
          const li = el('li');
          const a = el('a', { href: '#', class: 'text-blue-400 hover:text-blue-200 text-xs break-all', text: e[keyField] });
          a.addEventListener('click', (ev) => {
            ev.preventDefault();
            const tn = state.byId.get(e[keyField]);
            if (tn) { state.selected = tn.id; renderDetail(tn); centerOn(tn); }
          });
          li.appendChild(a);
          li.appendChild(el('span', {
            class: 'ml-1 text-[10px] text-gray-600',
            text: e.type === 'implicit' ? '≈' : '→',
          }));
          ul.appendChild(li);
        });
      }
      block.appendChild(ul);
      body.appendChild(block);
    };
    makeList('Inbound', inbound, 'from');
    makeList('Outbound', outbound, 'to');

    if (n.relatedFiles && n.relatedFiles.length) {
      const relBlock = el('div', { class: 'mt-3' });
      relBlock.appendChild(el('div', { class: 'text-xs text-gray-400 uppercase tracking-wider mb-1', text: 'Related (Jaccard)' }));
      const ul = el('ul', { class: 'space-y-0.5' });
      n.relatedFiles.forEach(r => {
        const li = el('li');
        const a = el('a', { href: '#', class: 'text-purple-400 hover:text-purple-200 text-xs break-all', text: r });
        a.addEventListener('click', (ev) => {
          ev.preventDefault();
          const tn = state.byId.get(r);
          if (tn) { state.selected = tn.id; renderDetail(tn); centerOn(tn); }
        });
        li.appendChild(a);
        ul.appendChild(li);
      });
      relBlock.appendChild(ul);
      body.appendChild(relBlock);
    }

    // -- Zmíněno v dokumentech (entity-mentions index) ----------------------
    renderEntityMentions(body, n);
    renderEntitiesInFile(body, n);

    // Otevřít zdroj — prominent open-source buttons (reader for .md, raw for others)
    const isMarkdown = /\.md$/i.test(n.id || '');
    const isHtml = /\.html?$/i.test(n.id || '');
    const openBlock = el('div', { class: 'pt-3 mt-3 border-t border-gray-800' });
    openBlock.appendChild(el('div', {
      class: 'text-xs text-gray-400 uppercase tracking-wider mb-2',
      text: '📖 Otevřít zdroj',
    }));
    const openWrap = el('div', { class: 'flex flex-wrap gap-1.5' });
    if (isMarkdown) {
      openWrap.appendChild(el('a', {
        href: './reader.html?file=' + n.id, target: '_blank', rel: 'noopener',
        class: 'inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white transition',
        text: '📖 Čtečka',
      }));
      openWrap.appendChild(el('a', {
        href: './' + n.id, target: '_blank', rel: 'noopener',
        class: 'inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-200 font-mono transition',
        text: '.md raw',
      }));
    } else if (isHtml) {
      openWrap.appendChild(el('a', {
        href: './' + n.id, target: '_blank', rel: 'noopener',
        class: 'inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white transition',
        text: '🌐 Otevřít stránku',
      }));
    } else {
      openWrap.appendChild(el('a', {
        href: './' + n.id, target: '_blank', rel: 'noopener',
        class: 'inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white transition',
        text: '📂 Otevřít soubor',
      }));
    }
    openBlock.appendChild(openWrap);
    body.appendChild(openBlock);

    const actions = el('div', { class: 'flex gap-2 pt-3 mt-3 border-t border-gray-800' });
    actions.appendChild(el('button', {
      class: 'px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded',
      text: 'Unpin', onclick: () => { n.pinned = false; },
    }));
    actions.appendChild(el('button', {
      class: 'px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded',
      text: 'Focus',
      onclick: () => {
        state.focusMode = true;
        document.getElementById('focus-mode').checked = true;
      },
    }));
    body.appendChild(actions);
  }

  // ---------------------------------------------------------------------- //
  // Entity-mentions integration                                            //
  // ---------------------------------------------------------------------- //
  function entityKeysForNode(n) {
    if (!n || !window.DD_ENTITY_INDEX) return [];
    const all = window.DD_ENTITY_INDEX.allEntities();
    if (!all || !all.length) return [];
    const haystacks = [n.title, n.id, ...(n.aliases || [])]
      .filter(Boolean)
      .map(s => String(s));
    const matches = new Set();
    // Exact match
    haystacks.forEach(h => { if (all.indexOf(h) !== -1) matches.add(h); });
    // Substring match (case-insensitive) — fallback for "PPF" → "PPF a.s."
    if (!matches.size) {
      const lows = haystacks.map(s => s.toLowerCase());
      all.forEach(name => {
        const ln = name.toLowerCase();
        if (lows.some(h => h === ln || (h.length >= 4 && (h.indexOf(ln) !== -1 || ln.indexOf(h) !== -1)))) {
          matches.add(name);
        }
      });
    }
    return Array.from(matches);
  }

  function renderEntityMentions(body, n) {
    if (!window.DD_ENTITY_INDEX) return;
    const keys = entityKeysForNode(n);
    if (!keys.length) return;

    // Aggregate mentions across all matching entity keys.
    const acc = new Map(); // path -> {path, count, title}
    keys.forEach(key => {
      (window.DD_ENTITY_INDEX.mentionsOf(key) || []).forEach(row => {
        const cur = acc.get(row.path);
        if (cur) cur.count += row.count;
        else acc.set(row.path, { path: row.path, count: row.count, title: row.title });
      });
    });
    if (!acc.size) return;
    const rows = Array.from(acc.values()).sort((a, b) => b.count - a.count).slice(0, 10);
    const primaryKey = keys[0];

    const block = el('div', { class: 'mt-3' });
    block.appendChild(el('div', {
      class: 'text-xs text-gray-400 uppercase tracking-wider mb-1',
      text: `📄 Zmíněno v dokumentech (${acc.size})`,
    }));
    const ul = el('ul', { class: 'space-y-1 max-h-56 overflow-y-auto panel-scroll pr-1' });
    rows.forEach(row => {
      const li = el('li', { class: 'flex items-center justify-between gap-2' });
      const titleA = el('a', {
        href: './reader.html?file=' + encodeURIComponent(row.path) +
              '&highlight=' + encodeURIComponent(primaryKey),
        target: '_blank', rel: 'noopener',
        class: 'text-blue-400 hover:text-blue-200 text-xs break-all flex-1 min-w-0',
        text: row.title || row.path,
      });
      titleA.title = row.path;
      li.appendChild(titleA);

      const meta = el('span', { class: 'flex items-center gap-1 flex-shrink-0' });
      meta.appendChild(el('span', {
        class: 'text-[10px] text-gray-500 font-mono',
        text: '×' + row.count,
      }));
      meta.appendChild(el('a', {
        href: './reader.html?file=' + encodeURIComponent(row.path) +
              '&highlight=' + encodeURIComponent(primaryKey),
        target: '_blank', rel: 'noopener',
        class: 'text-[10px] px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-200 border border-indigo-700 hover:bg-indigo-700 hover:text-white',
        text: 'Otevřít v čtečce',
      }));
      li.appendChild(meta);
      ul.appendChild(li);
    });
    block.appendChild(ul);

    if (keys.length > 1) {
      const note = el('div', {
        class: 'mt-1 text-[10px] text-gray-500',
        text: 'Agregováno přes: ' + keys.slice(0, 5).join(', ') +
              (keys.length > 5 ? ' …' : ''),
      });
      block.appendChild(note);
    }
    body.appendChild(block);
  }

  function renderEntitiesInFile(body, n) {
    // Only meaningful for .md nodes (which are file paths).
    if (!window.DD_ENTITY_INDEX) return;
    if (!n || !/\.md$/i.test(n.id || '')) return;
    const entries = window.DD_ENTITY_INDEX.entitiesIn(n.id) || [];
    if (!entries.length) return;
    const block = el('div', { class: 'mt-3' });
    block.appendChild(el('div', {
      class: 'text-xs text-gray-400 uppercase tracking-wider mb-1',
      text: `🏷️ Entity v dokumentu (${entries.length})`,
    }));
    const ul = el('ul', { class: 'space-y-0.5 max-h-40 overflow-y-auto panel-scroll pr-1' });
    entries.slice(0, 10).forEach(row => {
      const li = el('li', { class: 'flex items-center justify-between gap-2' });
      const a = el('a', {
        href: './knowledge-graph.html?focus=' + encodeURIComponent(row.entity),
        class: 'text-emerald-400 hover:text-emerald-200 text-xs break-all flex-1',
        text: row.entity,
      });
      a.addEventListener('click', (ev) => {
        // If focus target is a known node by title/id, snap focus locally.
        const tn = state.byId.get(row.entity) ||
                   state.nodes.find(x => x.title === row.entity);
        if (tn) {
          ev.preventDefault();
          state.selected = tn.id;
          renderDetail(tn);
          centerOn(tn);
        }
      });
      li.appendChild(a);
      li.appendChild(el('span', {
        class: 'text-[10px] text-gray-500 font-mono flex-shrink-0',
        text: '×' + row.count,
      }));
      ul.appendChild(li);
    });
    block.appendChild(ul);
    body.appendChild(block);
  }

  // Honor ?focus=ENTITY_ID — try to focus a node with that id/title once
  // the graph finishes loading.
  function applyFocusFromQuery() {
    const qs = new URLSearchParams(location.search);
    const focus = qs.get('focus');
    if (!focus) return;
    const target =
      state.byId.get(focus) ||
      state.nodes.find(x => x.title === focus) ||
      state.nodes.find(x => (x.title || '').toLowerCase() === focus.toLowerCase()) ||
      state.nodes.find(x => x.id.toLowerCase().indexOf(focus.toLowerCase()) !== -1);
    if (target) {
      state.selected = target.id;
      renderDetail(target);
      centerOn(target);
    } else {
      // Fallback: pre-fill the search box so the user sees related nodes.
      const search = document.getElementById('search');
      if (search) {
        search.value = focus;
        state.searchTerm = focus.toLowerCase();
      }
    }
  }
  // Expose for boot logic.
  window.__ddApplyFocusFromQuery = applyFocusFromQuery;

  function centerOn(n) {
    state.camera.x = state.canvasW / 2 - n.x * state.camera.scale;
    state.camera.y = state.canvasH / 2 - n.y * state.camera.scale;
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('detail-close').addEventListener('click', () => {
      document.getElementById('detail-panel').classList.add('translate-x-full');
      state.selected = null;
    });
  });

  function updateTooltip(n, sx, sy) {
    const tip = document.getElementById('tooltip');
    if (!n) { tip.classList.add('hidden'); return; }
    clear(tip);
    tip.appendChild(el('div', { class: 'font-semibold text-gray-100 mb-1', text: n.title || n.id }));
    tip.appendChild(el('div', { class: 'text-gray-400 mb-1', text: n.id }));
    const excerpt = (n.excerpt || '').slice(0, 120);
    const suffix = (n.excerpt || '').length > 120 ? '…' : '';
    tip.appendChild(el('div', { class: 'text-gray-300', text: excerpt + suffix }));
    tip.appendChild(el('div', {
      class: 'mt-1 text-gray-500',
      text: `${n.inbound || 0}↙ ${n.outbound || 0}↗ · ${(n.size / 1024).toFixed(1)} KB`,
    }));
    tip.style.left = (sx + 14) + 'px';
    tip.style.top = (sy + 14) + 'px';
    tip.classList.remove('hidden');
  }

  // ---------------------------------------------------------------------------
  // Graph analytics: PageRank, Label Propagation, Betweenness Centrality.
  // Algorithms operate on state.nodes / state.edges (edges use from/to).
  // Results are persisted into node objects (n.pagerank, n.community,
  // n.betweenness) so subsequent renders reuse them without recomputation.
  // ---------------------------------------------------------------------------
  const analytics = {
    activeMode: null, // 'pagerank' | 'community' | null
    communityColors: new Map(), // communityId -> hex color
    originalRadius: new WeakMap(), // node -> original radius (for reset)
    originalColor: new WeakMap(), // node -> original color (for reset)
  };

  function pagerank(nodes, edges, opts) {
    opts = opts || {};
    const damping = opts.damping || 0.85;
    const iterations = opts.iterations || 50;
    const N = nodes.length;
    if (!N) return nodes;
    const idx = new Map(nodes.map((n, i) => [n.id, i]));
    const outDegree = new Array(N).fill(0);
    const inLinks = Array.from({ length: N }, () => []);
    edges.forEach(e => {
      const s = idx.get(e.source != null ? e.source : e.from);
      const t = idx.get(e.target != null ? e.target : e.to);
      if (s == null || t == null) return;
      outDegree[s]++;
      inLinks[t].push(s);
    });
    let rank = new Array(N).fill(1 / N);
    for (let it = 0; it < iterations; it++) {
      const next = new Array(N).fill((1 - damping) / N);
      for (let i = 0; i < N; i++) {
        const links = inLinks[i];
        for (let k = 0; k < links.length; k++) {
          const src = links[k];
          if (outDegree[src] > 0) next[i] += damping * rank[src] / outDegree[src];
        }
      }
      rank = next;
    }
    for (let i = 0; i < N; i++) nodes[i].pagerank = rank[i];
    return nodes;
  }

  function labelPropagation(nodes, edges, iterations) {
    iterations = iterations || 20;
    const N = nodes.length;
    if (!N) return nodes;
    const idx = new Map(nodes.map((n, i) => [n.id, i]));
    const adj = Array.from({ length: N }, () => []);
    edges.forEach(e => {
      const s = idx.get(e.source != null ? e.source : e.from);
      const t = idx.get(e.target != null ? e.target : e.to);
      if (s == null || t == null) return;
      adj[s].push(t);
      adj[t].push(s);
    });
    const labels = nodes.map((_, i) => i);
    for (let it = 0; it < iterations; it++) {
      const order = nodes.map((_, i) => i).sort(() => Math.random() - 0.5);
      let changed = false;
      for (const i of order) {
        const nb = adj[i];
        if (!nb.length) continue;
        const counts = new Map();
        for (let k = 0; k < nb.length; k++) {
          const lbl = labels[nb[k]];
          counts.set(lbl, (counts.get(lbl) || 0) + 1);
        }
        let max = 0;
        counts.forEach(v => { if (v > max) max = v; });
        const winners = [];
        counts.forEach((v, l) => { if (v === max) winners.push(l); });
        const newLabel = winners[Math.floor(Math.random() * winners.length)];
        if (labels[i] !== newLabel) { labels[i] = newLabel; changed = true; }
      }
      if (!changed) break;
    }
    for (let i = 0; i < N; i++) nodes[i].community = labels[i];
    return nodes;
  }

  function betweenness(nodes, edges) {
    // Brandes algorithm (unweighted) — O(V*E). For 189 nodes / 460 edges
    // this completes in well under 100ms.
    const N = nodes.length;
    if (!N) return nodes;
    const idx = new Map(nodes.map((n, i) => [n.id, i]));
    const adj = Array.from({ length: N }, () => []);
    edges.forEach(e => {
      const s = idx.get(e.source != null ? e.source : e.from);
      const t = idx.get(e.target != null ? e.target : e.to);
      if (s == null || t == null) return;
      adj[s].push(t);
      adj[t].push(s);
    });
    const cb = new Array(N).fill(0);
    for (let s = 0; s < N; s++) {
      const stack = [];
      const pred = Array.from({ length: N }, () => []);
      const sigma = new Array(N).fill(0); sigma[s] = 1;
      const dist = new Array(N).fill(-1); dist[s] = 0;
      const queue = [s];
      let qHead = 0;
      while (qHead < queue.length) {
        const v = queue[qHead++];
        stack.push(v);
        const nb = adj[v];
        for (let k = 0; k < nb.length; k++) {
          const w = nb[k];
          if (dist[w] < 0) { dist[w] = dist[v] + 1; queue.push(w); }
          if (dist[w] === dist[v] + 1) { sigma[w] += sigma[v]; pred[w].push(v); }
        }
      }
      const delta = new Array(N).fill(0);
      while (stack.length) {
        const w = stack.pop();
        const ps = pred[w];
        for (let k = 0; k < ps.length; k++) {
          const v = ps[k];
          delta[v] += (sigma[v] / sigma[w]) * (1 + delta[w]);
        }
        if (w !== s) cb[w] += delta[w];
      }
    }
    for (let i = 0; i < N; i++) nodes[i].betweenness = cb[i] / 2; // undirected
    return nodes;
  }

  // Stable color generator for community ids (HSL ring).
  function communityColor(communityId) {
    if (analytics.communityColors.has(communityId)) {
      return analytics.communityColors.get(communityId);
    }
    const hue = (analytics.communityColors.size * 47) % 360;
    const c = 'hsl(' + hue + ', 65%, 55%)';
    analytics.communityColors.set(communityId, c);
    return c;
  }

  function rememberOriginals() {
    for (const n of state.nodes) {
      if (!analytics.originalRadius.has(n)) analytics.originalRadius.set(n, n.radius);
      if (!analytics.originalColor.has(n)) analytics.originalColor.set(n, n.color);
    }
  }

  function applyPageRankSizes() {
    rememberOriginals();
    let max = 0;
    for (const n of state.nodes) if (n.pagerank > max) max = n.pagerank;
    if (max <= 0) return;
    for (const n of state.nodes) {
      const orig = analytics.originalRadius.get(n) || nodeRadius(n);
      const norm = (n.pagerank || 0) / max;
      // Scale 0.6x..2.4x of original radius based on PageRank.
      n.radius = Math.max(4, orig * (0.6 + norm * 1.8));
    }
  }

  function applyCommunityColors() {
    rememberOriginals();
    analytics.communityColors.clear();
    for (const n of state.nodes) {
      n.color = communityColor(n.community);
    }
  }

  function resetAnalyticsVisuals() {
    for (const n of state.nodes) {
      const r = analytics.originalRadius.get(n);
      const c = analytics.originalColor.get(n);
      if (r != null) n.radius = r;
      if (c != null) n.color = c;
    }
    analytics.activeMode = null;
  }

  function setAnalyticsStatus(msg) {
    const s = document.getElementById('analytics-status');
    if (s) s.textContent = msg || '';
  }

  function showResultsContainer() {
    const c = document.getElementById('analytics-results');
    if (c) c.classList.remove('hidden');
  }

  function renderPageRankPanel() {
    const panel = document.getElementById('analytics-pagerank-panel');
    const list = document.getElementById('analytics-pagerank-list');
    if (!panel || !list) return;
    clear(list);
    const top = state.nodes.slice()
      .sort((a, b) => (b.pagerank || 0) - (a.pagerank || 0))
      .slice(0, 10);
    top.forEach(n => {
      const li = el('li', { class: 'truncate' });
      const a = el('a', {
        href: '#',
        class: 'text-indigo-300 hover:text-indigo-100',
        text: (n.title || n.id),
      });
      a.addEventListener('click', (ev) => {
        ev.preventDefault();
        state.selected = n.id;
        renderDetail(n);
        centerOn(n);
      });
      li.appendChild(a);
      li.appendChild(el('span', {
        class: 'text-gray-500 ml-1',
        text: ' · ' + (n.pagerank || 0).toFixed(4),
      }));
      list.appendChild(li);
    });
    panel.classList.remove('hidden');
    showResultsContainer();
  }

  function renderCommunityPanel() {
    const panel = document.getElementById('analytics-community-panel');
    const list = document.getElementById('analytics-community-list');
    if (!panel || !list) return;
    clear(list);
    const groups = new Map();
    for (const n of state.nodes) {
      const k = n.community;
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(n);
    }
    const sorted = [...groups.entries()]
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 12);
    sorted.forEach(([cid, members]) => {
      const li = el('li', { class: 'flex items-start gap-2' });
      li.appendChild(el('span', {
        class: 'inline-block w-3 h-3 rounded-full mt-0.5 flex-shrink-0',
        style: 'background:' + communityColor(cid),
      }));
      const wrap = el('div', { class: 'flex-1 min-w-0' });
      const typeCounts = new Map();
      members.forEach(m => typeCounts.set(m.type, (typeCounts.get(m.type) || 0) + 1));
      const dominant = [...typeCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([t, c]) => t + '×' + c)
        .join(', ');
      wrap.appendChild(el('div', {
        class: 'text-gray-200',
        text: 'Komunita ' + cid + ' · ' + members.length + ' uzlů',
      }));
      wrap.appendChild(el('div', {
        class: 'text-gray-500 truncate',
        text: dominant || '—',
      }));
      li.appendChild(wrap);
      list.appendChild(li);
    });
    panel.classList.remove('hidden');
    showResultsContainer();
  }

  function renderBetweennessPanel() {
    const panel = document.getElementById('analytics-betweenness-panel');
    const list = document.getElementById('analytics-betweenness-list');
    if (!panel || !list) return;
    clear(list);
    const top = state.nodes.slice()
      .sort((a, b) => (b.betweenness || 0) - (a.betweenness || 0))
      .slice(0, 3);
    top.forEach(n => {
      const li = el('li', { class: 'truncate' });
      const a = el('a', {
        href: '#',
        class: 'text-amber-300 hover:text-amber-100',
        text: (n.title || n.id),
      });
      a.addEventListener('click', (ev) => {
        ev.preventDefault();
        state.selected = n.id;
        renderDetail(n);
        centerOn(n);
      });
      li.appendChild(a);
      li.appendChild(el('span', {
        class: 'text-gray-500 ml-1',
        text: ' · ' + (n.betweenness || 0).toFixed(1),
      }));
      list.appendChild(li);
    });
    panel.classList.remove('hidden');
    showResultsContainer();
  }

  function runPageRank() {
    setAnalyticsStatus('Počítám PageRank…');
    setTimeout(() => {
      const t0 = performance.now();
      pagerank(state.nodes, state.edges, { damping: 0.85, iterations: 50 });
      applyPageRankSizes();
      analytics.activeMode = 'pagerank';
      renderPageRankPanel();
      setAnalyticsStatus('PageRank · ' + (performance.now() - t0).toFixed(0) + ' ms');
    }, 0);
  }

  function runCommunities() {
    setAnalyticsStatus('Detekuji komunity…');
    setTimeout(() => {
      const t0 = performance.now();
      labelPropagation(state.nodes, state.edges, 30);
      applyCommunityColors();
      analytics.activeMode = 'community';
      renderCommunityPanel();
      setAnalyticsStatus('Komunity · ' + (performance.now() - t0).toFixed(0) + ' ms');
    }, 0);
  }

  function runBetweenness() {
    setAnalyticsStatus('Počítám betweenness…');
    setTimeout(() => {
      const t0 = performance.now();
      betweenness(state.nodes, state.edges);
      renderBetweennessPanel();
      setAnalyticsStatus('Betweenness · ' + (performance.now() - t0).toFixed(0) + ' ms');
    }, 0);
  }

  function resetAnalytics() {
    resetAnalyticsVisuals();
    const ids = [
      'analytics-pagerank-panel',
      'analytics-community-panel',
      'analytics-betweenness-panel',
    ];
    ids.forEach(id => {
      const p = document.getElementById(id);
      if (p) p.classList.add('hidden');
    });
    const c = document.getElementById('analytics-results');
    if (c) c.classList.add('hidden');
    setAnalyticsStatus('');
  }

  function wireAnalytics() {
    const pr = document.getElementById('analytics-pagerank');
    const co = document.getElementById('analytics-community');
    const bw = document.getElementById('analytics-betweenness');
    const rs = document.getElementById('analytics-reset');
    if (pr) pr.addEventListener('click', runPageRank);
    if (co) co.addEventListener('click', runCommunities);
    if (bw) bw.addEventListener('click', runBetweenness);
    if (rs) rs.addEventListener('click', resetAnalytics);
  }

  function buildFilterChips() {
    const types = new Set(state.nodes.map(n => n.type));
    const typeEl = document.getElementById('type-filters');
    [...types].sort().forEach(t => {
      const b = el('button', {
        class: 'px-2 py-0.5 rounded border border-gray-700 text-gray-300 hover:bg-gray-800',
        style: 'border-color:' + ((state.colors[t] || '#4b5563') + '77'),
        'data-type': t,
        text: t,
      });
      b.addEventListener('click', () => {
        if (state.filterTypes.has(t)) { state.filterTypes.delete(t); b.classList.remove('bg-gray-700'); }
        else { state.filterTypes.add(t); b.classList.add('bg-gray-700'); }
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
      });
      clusterEl.appendChild(b);
    });

    document.querySelectorAll('.sev-btn').forEach(b => {
      b.addEventListener('click', () => {
        const s = b.dataset.severity;
        if (state.filterSeverity.has(s)) { state.filterSeverity.delete(s); b.classList.remove('bg-gray-700'); }
        else { state.filterSeverity.add(s); b.classList.add('bg-gray-700'); }
      });
    });
  }

  function wireControls() {
    document.getElementById('search').addEventListener('input', (e) => {
      state.searchTerm = e.target.value.toLowerCase().trim();
    });
    const rep = document.getElementById('repulsion');
    rep.addEventListener('input', () => {
      state.params.repulsion = +rep.value;
      document.getElementById('repulsion-val').textContent = rep.value;
    });
    const spr = document.getElementById('spring');
    spr.addEventListener('input', () => {
      state.params.spring = +spr.value;
      document.getElementById('spring-val').textContent = spr.value;
    });
    const dmp = document.getElementById('damping');
    dmp.addEventListener('input', () => {
      state.params.damping = +dmp.value;
      document.getElementById('damping-val').textContent = dmp.value;
    });
    document.getElementById('physics-toggle').addEventListener('click', togglePhysics);
    document.getElementById('show-implicit').addEventListener('change', (e) => { state.showImplicit = e.target.checked; });
    document.getElementById('show-labels').addEventListener('change', (e) => { state.showLabels = e.target.checked; });
    document.getElementById('focus-mode').addEventListener('change', (e) => { state.focusMode = e.target.checked; });
    document.getElementById('path-mode').addEventListener('change', (e) => {
      state.pathMode = e.target.checked;
      if (!e.target.checked) { state.pathEndpoints = []; state.pathHighlight = new Set(); }
    });
    document.querySelectorAll('.layout-btn').forEach(b => {
      b.addEventListener('click', () => applyLayout(b.dataset.layout));
    });
    document.getElementById('export-png').addEventListener('click', exportPNG);
    document.getElementById('export-svg').addEventListener('click', exportSVG);
    document.getElementById('export-json').addEventListener('click', exportJSON);
    wireAnalytics();
  }

  function togglePhysics() {
    state.physicsOn = !state.physicsOn;
    document.getElementById('physics-toggle').textContent =
      state.physicsOn ? 'Pause physics' : 'Resume physics';
  }
  function resetView() {
    state.camera.x = state.canvasW / 2;
    state.camera.y = state.canvasH / 2;
    state.camera.scale = 1;
    state.nodes.forEach(n => { n.pinned = false; });
  }

  function applyLayout(name) {
    state.nodes.forEach(n => { n.vx = 0; n.vy = 0; });
    if (name === 'force') {
      state.physicsOn = true;
      state.nodes.forEach(n => { if (!n.pinned) { n.x += (Math.random() - .5) * 2; n.y += (Math.random() - .5) * 2; } });
      return;
    }
    if (name === 'radial') {
      const byCluster = {};
      state.clusters.forEach((c, i) => byCluster[c.id] = { angle: (i / state.clusters.length) * Math.PI * 2, members: [] });
      state.nodes.forEach(n => byCluster[n.cluster] && byCluster[n.cluster].members.push(n));
      Object.values(byCluster).forEach(({ angle, members }) => {
        const cx = Math.cos(angle) * 450;
        const cy = Math.sin(angle) * 450;
        members.forEach((n, i) => {
          const a = (i / Math.max(1, members.length)) * Math.PI * 2;
          const r = 50 + Math.sqrt(members.length) * 8;
          n.x = cx + Math.cos(a) * r;
          n.y = cy + Math.sin(a) * r;
          n.pinned = false;
        });
      });
      return;
    }
    if (name === 'hierarchical') {
      const root = '00-INDEX.md';
      const depth = { [root]: 0 };
      const queue = [root];
      while (queue.length) {
        const cur = queue.shift();
        for (const nb of state.neighbors.get(cur) || []) {
          if (!(nb in depth)) { depth[nb] = depth[cur] + 1; queue.push(nb); }
        }
      }
      const layers = {};
      state.nodes.forEach(n => {
        const d = depth[n.id] !== undefined ? depth[n.id] : (n.id.split('/').length + 4);
        (layers[d] = layers[d] || []).push(n);
      });
      Object.entries(layers).forEach(([d, arr]) => {
        arr.forEach((n, i) => {
          n.x = (i - arr.length / 2) * 80;
          n.y = +d * 110 - 300;
          n.pinned = false;
        });
      });
      return;
    }
    if (name === 'grid') {
      const cols = Math.ceil(Math.sqrt(state.nodes.length));
      state.nodes.forEach((n, i) => {
        const r = Math.floor(i / cols), c = i % cols;
        n.x = (c - cols / 2) * 70;
        n.y = (r - cols / 2) * 70;
        n.pinned = false;
      });
    }
  }

  function exportPNG() {
    const canvas = document.getElementById('graph-canvas');
    canvas.toBlob(blob => download(blob, 'knowledge-graph.png'), 'image/png');
  }
  function exportSVG() {
    if (!state.nodes.length) return;
    const minX = Math.min(...state.nodes.map(n => n.x)) - 40;
    const minY = Math.min(...state.nodes.map(n => n.y)) - 40;
    const maxX = Math.max(...state.nodes.map(n => n.x)) + 40;
    const maxY = Math.max(...state.nodes.map(n => n.y)) + 40;
    const w = maxX - minX, h = maxY - minY;
    const xmlEscape = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
    }[c]));
    const parts = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + minX + ' ' + minY + ' ' + w + ' ' + h +
                   '" width="' + w + '" height="' + h + '" style="background:#030712">'];
    parts.push('<g stroke-width="1">');
    for (const e of state.edges) {
      if (!isEdgeVisible(e)) continue;
      const a = state.byId.get(e.from), b = state.byId.get(e.to);
      const c = e.type === 'implicit' ? '#a855f7' : ((e.count || 0) > 5 ? '#f97316' : '#94a3b8');
      const d = e.type === 'implicit' ? ' stroke-dasharray="5,4"' : '';
      parts.push('<line x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y +
                 '" stroke="' + c + '" opacity="0.6"' + d + '/>');
    }
    parts.push('</g><g>');
    for (const n of state.nodes) {
      if (!isNodeVisible(n)) continue;
      const label = xmlEscape((n.title || n.id).slice(0, 30));
      parts.push('<circle cx="' + n.x + '" cy="' + n.y + '" r="' + n.radius + '" fill="' + n.color + '"/>');
      parts.push('<text x="' + n.x + '" y="' + (n.y + n.radius + 10) + '" text-anchor="middle" font-size="9" fill="#d1d5db">' +
                 label + '</text>');
    }
    parts.push('</g></svg>');
    const blob = new Blob([parts.join('')], { type: 'image/svg+xml' });
    download(blob, 'knowledge-graph.svg');
  }
  function exportJSON() {
    const payload = {
      exported_at: new Date().toISOString(),
      nodes: state.nodes.map(n => {
        const out = {};
        for (const k in n) {
          if (k === 'vx' || k === 'vy' || k === 'pinned' || k === 'color' || k === 'radius') continue;
          out[k] = n[k];
        }
        return out;
      }),
      edges: state.edges,
      stats: state.stats,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    download(blob, 'knowledge-graph-snapshot.json');
  }
  function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  window.addEventListener('DOMContentLoaded', () => {
    window._fpsLine = el('span', { class: 'ml-2 text-gray-600', text: '— fps' });
    document.getElementById('stats-line').appendChild(window._fpsLine);

    // eslint-disable-next-line no-new, no-undef
    new p5(sketch);

    loadGraph().then(() => {
      buildFilterChips();
      wireControls();
      setTimeout(() => { const b = document.getElementById('help-banner'); if (b) b.remove(); }, 8000);
      // Wait for the entity index too so renderDetail can populate the new
      // mentions panels even on the very first focus.
      const idxReady = (window.DD_ENTITY_INDEX && window.DD_ENTITY_INDEX.ready)
        ? window.DD_ENTITY_INDEX.ready()
        : Promise.resolve();
      Promise.resolve(idxReady).then(() => {
        if (typeof window.__ddApplyFocusFromQuery === 'function') {
          window.__ddApplyFocusFromQuery();
        }
      });
    }).catch(err => {
      console.error(err);
      document.getElementById('stats-line').textContent = 'error loading graph: ' + err.message;
    });
  });

})();
