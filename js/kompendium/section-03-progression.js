// Section 03 — EA-1 technique progression through 5 phases (safe DOM, Chart.js scatter)
(function() {
  'use strict';

  // Phases: 1=etablovani, 2=exploitace, 3=konsolidace, 4=eskalace, 5=intervence
  const PHASES = {
    1: { name: 'Etablování', color: '#3b82f6', desc: 'Budování důvěry, autority, framing kontextu.' },
    2: { name: 'Exploitace', color: '#8b5cf6', desc: 'Aktivní použití technik na cílový subjekt.' },
    3: { name: 'Konsolidace', color: '#f59e0b', desc: 'Upevnění získaného epistemického vlivu.' },
    4: { name: 'Eskalace', color: '#ef4444', desc: 'Prohloubení manipulace, závažnější formy.' },
    5: { name: 'Intervence', color: '#10b981', desc: 'Bod, kde detekce a neutralizace mají nejvyšší účinnost.' }
  };

  // 13 EA-1 techniques mapped to (phase, severity 1-5)
  const NODES = [
    { id: 'EA-1.1.1', label: 'Selektivní expozice', phase: 1, sev: 2 },
    { id: 'EA-1.1.2', label: 'Informační přetížení', phase: 2, sev: 3 },
    { id: 'EA-1.1.3', label: 'Terminologická mystifikace', phase: 1, sev: 2 },
    { id: 'EA-1.1.4', label: 'Predikační rozpadání', phase: 3, sev: 3 },
    { id: 'EA-1.2.1', label: 'Falešné dilema', phase: 2, sev: 3 },
    { id: 'EA-1.2.2', label: 'Falešná ekvivalence', phase: 2, sev: 2 },
    { id: 'EA-1.2.3', label: 'Iluzorní komplexita', phase: 3, sev: 3 },
    { id: 'EA-1.3.1', label: 'Imunizace', phase: 3, sev: 4 },
    { id: 'EA-1.3.2', label: 'Reinterpretace', phase: 4, sev: 4 },
    { id: 'EA-1.3.3', label: 'Tematická diverze', phase: 2, sev: 2 },
    { id: 'EA-1.4.1', label: 'Prosodická dominance', phase: 1, sev: 2 },
    { id: 'EA-1.4.2', label: 'Latentní emoce', phase: 2, sev: 3 },
    { id: 'EA-1.5.1', label: 'Proxemika', phase: 1, sev: 1 }
  ];

  // Typical co-occurrence edges
  const EDGES = [
    ['EA-1.1.1', 'EA-1.1.3'],
    ['EA-1.1.1', 'EA-1.4.1'],
    ['EA-1.1.2', 'EA-1.2.1'],
    ['EA-1.1.2', 'EA-1.4.2'],
    ['EA-1.1.4', 'EA-1.2.3'],
    ['EA-1.2.1', 'EA-1.2.2'],
    ['EA-1.2.2', 'EA-1.3.3'],
    ['EA-1.2.3', 'EA-1.3.1'],
    ['EA-1.3.1', 'EA-1.3.2'],
    ['EA-1.3.2', 'EA-1.4.2'],
    ['EA-1.4.1', 'EA-1.5.1'],
    ['EA-1.4.2', 'EA-1.1.2']
  ];

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

    const phase = PHASES[node.phase];
    const ph = document.createElement('p');
    ph.className = 'text-slate-300 mt-1';
    ph.textContent = 'Fáze: ' + phase.name + ' — ' + phase.desc;
    container.appendChild(ph);

    const sev = document.createElement('p');
    sev.className = 'text-slate-400 text-sm';
    sev.textContent = 'Typická závažnost: ' + node.sev + '/5';
    container.appendChild(sev);

    const nh = document.createElement('p');
    nh.className = 'text-slate-300 mt-2 font-semibold';
    nh.textContent = 'Typická ko-okurence (' + neighbors.size + '):';
    container.appendChild(nh);

    const ul = document.createElement('ul');
    ul.className = 'text-slate-300 list-disc list-inside text-sm';
    NODES.forEach((n) => {
      if (neighbors.has(n.id)) {
        const li = document.createElement('li');
        li.textContent = n.id + ' — ' + n.label + ' (fáze ' + n.phase + ')';
        ul.appendChild(li);
      }
    });
    container.appendChild(ul);

    const link = document.createElement('a');
    link.href = '/kompendium/03-zakladni-kategorie/kapitola-1/';
    link.className = 'text-blue-400 underline text-sm mt-2 inline-block';
    link.textContent = '→ Plný popis v 3.1 Akademické techniky';
    container.appendChild(link);
  }

  function init() {
    const canvas = document.getElementById('section-03-progression');
    if (!canvas || typeof Chart === 'undefined') return;
    const detail = document.getElementById('progression-detail');

    let highlightedId = null;

    // Datasets per phase
    const phaseDatasets = Object.keys(PHASES).map((phase) => ({
      label: PHASES[phase].name,
      data: NODES.filter((n) => String(n.phase) === phase).map((n) => ({
        x: n.phase,
        y: n.sev,
        _node: n
      })),
      backgroundColor: PHASES[phase].color,
      borderColor: PHASES[phase].color,
      pointRadius: 10,
      pointHoverRadius: 14,
      showLine: false
    }));

    // Edge dataset
    const nodeMap = {};
    NODES.forEach((n) => { nodeMap[n.id] = n; });

    const edgeDataset = {
      label: 'Ko-okurence',
      data: [],
      borderColor: 'rgba(148, 163, 184, 0.35)',
      backgroundColor: 'rgba(148, 163, 184, 0.35)',
      pointRadius: 0,
      borderWidth: 1,
      showLine: true,
      tension: 0
    };

    EDGES.forEach(([a, b]) => {
      const na = nodeMap[a];
      const nb = nodeMap[b];
      if (!na || !nb) return;
      // tiny x jitter so co-phase edges are visible
      const ax = na.phase + (na.sev - 3) * 0.04;
      const bx = nb.phase + (nb.sev - 3) * 0.04;
      edgeDataset.data.push({ x: ax, y: na.sev });
      edgeDataset.data.push({ x: bx, y: nb.sev });
      edgeDataset.data.push({ x: NaN, y: NaN });
    });

    new Chart(canvas, {
      type: 'scatter',
      data: { datasets: [edgeDataset].concat(phaseDatasets) },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Postup EA-1 technik 5 fázemi — klik = detail + ko-okurence',
            color: '#f1f5f9'
          },
          legend: {
            labels: {
              color: '#cbd5e1',
              filter: (item) => item.text !== 'Ko-okurence'
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
                const ph = PHASES[n.phase];
                const neigh = neighborsOf(n.id);
                return ph.name + ' | sev ' + n.sev + ' | ' + neigh.size + ' ko-okur.';
              }
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#cbd5e1',
              stepSize: 1,
              callback: (v) => PHASES[v] ? PHASES[v].name : ''
            },
            min: 0.5, max: 5.5,
            grid: { color: 'rgba(148,163,184,0.1)' },
            title: { display: true, text: 'Fáze manipulačního cyklu', color: '#cbd5e1' }
          },
          y: {
            ticks: { color: '#cbd5e1', stepSize: 1 },
            min: 0, max: 5.5,
            grid: { color: 'rgba(148,163,184,0.1)' },
            title: { display: true, text: 'Typická závažnost (1–5)', color: '#cbd5e1' }
          }
        },
        onClick: (e, els, chart) => {
          if (!els.length || !detail) return;
          const el = els[0];
          if (el.datasetIndex === 0) return;
          const point = chart.data.datasets[el.datasetIndex].data[el.index];
          if (!point || !point._node) return;
          const node = point._node;
          highlightedId = node.id;
          const neigh = neighborsOf(node.id);
          setDetail(detail, node, neigh);

          chart.data.datasets.forEach((ds, di) => {
            if (di === 0) return;
            ds.pointRadius = ds.data.map((pt) => {
              if (!pt._node) return 10;
              if (pt._node.id === highlightedId) return 16;
              if (neigh.has(pt._node.id)) return 13;
              return 7;
            });
          });
          chart.update('none');
        }
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
