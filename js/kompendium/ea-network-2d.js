// EA Technique Network 2D — Chart.js scatter as static 2D graph + click highlight
(function() {
  'use strict';

  // ~30 EA techniques across 5 categories with stable 2D layout
  const NODES = [
    // EA-1.1 Informational distortion (cluster top-left)
    { id: 'EA-1.1.1', label: 'Selektivní expozice', cat: 'info', x: -8, y: 6 },
    { id: 'EA-1.1.2', label: 'Informační přetížení', cat: 'info', x: -7, y: 5 },
    { id: 'EA-1.1.3', label: 'Term. mystifikace', cat: 'info', x: -6, y: 6.5 },
    { id: 'EA-1.1.4', label: 'Predikační rozpadání', cat: 'info', x: -7.5, y: 7 },

    // EA-1.2 Dilemmatic (top-center)
    { id: 'EA-1.2.1', label: 'Falešné dilema', cat: 'dilemma', x: -2, y: 7 },
    { id: 'EA-1.2.2', label: 'Falešná ekvivalence', cat: 'dilemma', x: -1, y: 6 },
    { id: 'EA-1.2.3', label: 'Iluzorní komplexita', cat: 'dilemma', x: -2.5, y: 5.5 },

    // EA-1.3 Discursive (top-right)
    { id: 'EA-1.3.1', label: 'Imunizace', cat: 'discourse', x: 4, y: 7 },
    { id: 'EA-1.3.2', label: 'Reinterpretace', cat: 'discourse', x: 5, y: 6 },
    { id: 'EA-1.3.3', label: 'Tematická diverze', cat: 'discourse', x: 6, y: 7 },

    // EA-1.4-1.5 Paralinguistic (right)
    { id: 'EA-1.4.1', label: 'Prosodická dominance', cat: 'paraling', x: 7, y: 2 },
    { id: 'EA-1.4.2', label: 'Latentní emoce', cat: 'paraling', x: 8, y: 1 },
    { id: 'EA-1.5.1', label: 'Proxemika', cat: 'paraling', x: 7.5, y: 0 },
    { id: 'EA-1.5.2', label: 'Tělesné hieroglyfy', cat: 'paraling', x: 8.5, y: -1 },

    // EA-5.1 Recursive nihilation (center, severe)
    { id: 'EA-5.1.1', label: 'Kanibalizace', cat: 'recursive', x: 0, y: 0 },
    { id: 'EA-5.1.2', label: 'Konceptuální nihilace', cat: 'recursive', x: 1, y: 1 },
    { id: 'EA-5.1.3', label: 'Reflexivní paradoxie', cat: 'recursive', x: -1, y: 1 },
    { id: 'EA-5.1.7', label: 'Referenční rekurze', cat: 'recursive', x: 0, y: -1 },
    { id: 'EA-5.1.13', label: 'Hyperreflexivita', cat: 'recursive', x: 1, y: -1 },

    // EA-5.2 Meta-epistemic (bottom-center, extreme)
    { id: 'EA-5.2.1', label: 'Meta-epist. inverze', cat: 'meta', x: -2, y: -5 },
    { id: 'EA-5.2.2', label: 'Anihilace pravdy', cat: 'meta', x: 0, y: -6 },
    { id: 'EA-5.2.3', label: 'Realitní fragmentace', cat: 'meta', x: 2, y: -5 },
    { id: 'EA-5.2.10', label: 'Metakogn. singularita', cat: 'meta', x: 0, y: -7.5 },

    // Bridges (bottom-left)
    { id: 'EA-2.1.1', label: 'Konfabulace', cat: 'info', x: -7, y: -3 },
    { id: 'EA-2.2.1', label: 'Gaslighting', cat: 'info', x: -6, y: -4 },
    { id: 'EA-3.1.1', label: 'Triangulace', cat: 'discourse', x: 5, y: -3 },
    { id: 'EA-3.2.1', label: 'Smear kampaň', cat: 'discourse', x: 6, y: -4 },
    { id: 'EA-4.1.1', label: 'Trauma bonding', cat: 'paraling', x: 4, y: -1 },
    { id: 'EA-4.2.1', label: 'Intermitentní reinforcement', cat: 'paraling', x: 5, y: 0 },
    { id: 'EA-6.1.1', label: 'Kolektivní gaslighting', cat: 'meta', x: -4, y: -7 }
  ];

  // Edges express conceptual / escalation relationships
  const EDGES = [
    ['EA-1.1.2', 'EA-1.1.1'], ['EA-1.1.2', 'EA-1.1.3'], ['EA-1.1.2', 'EA-1.1.4'],
    ['EA-1.2.1', 'EA-1.2.2'], ['EA-1.2.2', 'EA-1.2.3'],
    ['EA-1.3.1', 'EA-1.3.2'], ['EA-1.3.2', 'EA-1.3.3'],
    ['EA-1.4.1', 'EA-1.4.2'], ['EA-1.5.1', 'EA-1.5.2'],
    ['EA-5.1.1', 'EA-5.1.2'], ['EA-5.1.2', 'EA-5.1.3'],
    ['EA-5.1.7', 'EA-5.1.13'], ['EA-5.1.3', 'EA-5.1.13'],
    ['EA-5.1.2', 'EA-5.2.1'], ['EA-5.2.1', 'EA-5.2.2'], ['EA-5.2.2', 'EA-5.2.3'],
    ['EA-5.2.2', 'EA-5.2.10'], ['EA-5.2.3', 'EA-5.2.10'],
    ['EA-1.1.4', 'EA-5.1.2'], ['EA-1.2.3', 'EA-5.1.3'], ['EA-1.3.2', 'EA-5.1.1'],
    ['EA-2.1.1', 'EA-2.2.1'], ['EA-2.2.1', 'EA-5.2.1'],
    ['EA-3.1.1', 'EA-3.2.1'], ['EA-3.2.1', 'EA-6.1.1'],
    ['EA-4.1.1', 'EA-4.2.1'], ['EA-4.2.1', 'EA-5.1.1'],
    ['EA-6.1.1', 'EA-5.2.10']
  ];

  const CAT_COLORS = {
    info: '#3b82f6',
    dilemma: '#8b5cf6',
    discourse: '#06b6d4',
    paraling: '#10b981',
    recursive: '#f59e0b',
    meta: '#ef4444'
  };

  const CAT_LABELS = {
    info: 'Informační distorze',
    dilemma: 'Dilematické struktury',
    discourse: 'Diskursivní manipulace',
    paraling: 'Paralingvistické / somatické',
    recursive: 'Rekurzivní nihilace',
    meta: 'Meta-epistemická anihilace'
  };

  function neighborsOf(id) {
    const set = new Set();
    EDGES.forEach(([a, b]) => {
      if (a === id) set.add(b);
      if (b === id) set.add(a);
    });
    return set;
  }

  function setDetail(container, node, neighbors) {
    while (container.firstChild) container.removeChild(container.firstChild);
    const h = document.createElement('h3');
    h.className = 'text-lg font-bold text-slate-100';
    h.textContent = node.id + ' — ' + node.label;
    container.appendChild(h);
    const cat = document.createElement('p');
    cat.className = 'text-slate-400 text-sm';
    cat.textContent = 'Kategorie: ' + CAT_LABELS[node.cat];
    container.appendChild(cat);
    const nh = document.createElement('p');
    nh.className = 'text-slate-300 mt-2 font-semibold';
    nh.textContent = 'Sousední techniky (' + neighbors.size + '):';
    container.appendChild(nh);
    const ul = document.createElement('ul');
    ul.className = 'text-slate-300 list-disc list-inside text-sm';
    NODES.forEach((n) => {
      if (neighbors.has(n.id)) {
        const li = document.createElement('li');
        li.textContent = n.id + ' — ' + n.label;
        ul.appendChild(li);
      }
    });
    container.appendChild(ul);
  }

  function init() {
    const canvas = document.getElementById('ea-network-2d');
    if (!canvas || typeof Chart === 'undefined') return;
    const detail = document.getElementById('ea-network-detail');

    let highlightedId = null;

    // Build node datasets per category
    const nodeDatasets = Object.keys(CAT_COLORS).map((cat) => ({
      label: CAT_LABELS[cat],
      data: NODES.filter((n) => n.cat === cat).map((n) => ({
        x: n.x,
        y: n.y,
        _node: n
      })),
      backgroundColor: CAT_COLORS[cat],
      borderColor: CAT_COLORS[cat],
      pointRadius: 8,
      pointHoverRadius: 12,
      showLine: false
    }));

    // Build edge dataset (lines)
    const nodeMap = {};
    NODES.forEach((n) => { nodeMap[n.id] = n; });

    const edgeDataset = {
      label: 'Vztahy',
      data: [],
      borderColor: 'rgba(148, 163, 184, 0.3)',
      backgroundColor: 'rgba(148, 163, 184, 0.3)',
      pointRadius: 0,
      borderWidth: 1,
      showLine: true,
      tension: 0
    };

    // Encode edges as segments separated by NaN gaps
    EDGES.forEach(([a, b]) => {
      const na = nodeMap[a];
      const nb = nodeMap[b];
      if (!na || !nb) return;
      edgeDataset.data.push({ x: na.x, y: na.y });
      edgeDataset.data.push({ x: nb.x, y: nb.y });
      edgeDataset.data.push({ x: NaN, y: NaN });
    });

    new Chart(canvas, {
      type: 'scatter',
      data: { datasets: [edgeDataset].concat(nodeDatasets) },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: '2D síť EA technik — klik = zvýraznění sousedů',
            color: '#f1f5f9'
          },
          legend: {
            labels: {
              color: '#cbd5e1',
              filter: (item) => item.text !== 'Vztahy'
            }
          },
          tooltip: {
            filter: (ctx) => ctx.raw && ctx.raw._node,
            callbacks: {
              title: (items) => {
                const n = items[0].raw._node;
                return n.id + ' — ' + n.label;
              },
              label: (ctx) => {
                const n = ctx.raw._node;
                const neigh = neighborsOf(n.id);
                return CAT_LABELS[n.cat] + ' | ' + neigh.size + ' sousedů';
              }
            }
          }
        },
        scales: {
          x: { ticks: { color: '#cbd5e1' }, min: -10, max: 10, grid: { color: 'rgba(148,163,184,0.1)' } },
          y: { ticks: { color: '#cbd5e1' }, min: -9, max: 9, grid: { color: 'rgba(148,163,184,0.1)' } }
        },
        onClick: (e, els, chart) => {
          if (!els.length || !detail) return;
          const el = els[0];
          if (el.datasetIndex === 0) return; // edges
          const point = chart.data.datasets[el.datasetIndex].data[el.index];
          if (!point || !point._node) return;
          const node = point._node;
          highlightedId = node.id;
          const neigh = neighborsOf(node.id);
          setDetail(detail, node, neigh);

          // Update point radii to highlight
          chart.data.datasets.forEach((ds, di) => {
            if (di === 0) return;
            ds.pointRadius = ds.data.map((pt) => {
              if (!pt._node) return 8;
              if (pt._node.id === highlightedId) return 14;
              if (neigh.has(pt._node.id)) return 11;
              return 5;
            });
          });
          chart.update('none');
        }
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
