// Severity Matrix — Chart.js bubble chart (size = count, color = severity)
(function() {
  'use strict';
  const CATEGORIES = ['EA-1', 'EA-2', 'EA-4', 'EA-5.1', 'EA-5.2', 'EA-5.3', 'EA-5.4', 'EA-5.5'];
  const SEVERITIES = ['mírná', 'střední', 'vysoká', 'extrémní'];
  const MATRIX = [[3,6,4,0],[10,15,20,5],[0,0,6,6],[0,0,0,30],[0,0,0,10],[0,0,5,55],[0,0,5,55],[0,0,0,60]];

  function setDetail(container, title, body) {
    while (container.firstChild) container.removeChild(container.firstChild);
    const h = document.createElement('h3');
    h.className = 'text-lg font-bold text-slate-100';
    h.textContent = title;
    container.appendChild(h);
    const p = document.createElement('p');
    p.className = 'text-slate-300 mt-2';
    p.textContent = body;
    container.appendChild(p);
  }

  function init() {
    const canvas = document.getElementById('severity-matrix');
    if (!canvas || typeof Chart === 'undefined') return;
    const detail = document.getElementById('severity-detail');
    const points = [];
    for (let c = 0; c < CATEGORIES.length; c++) {
      for (let s = 0; s < SEVERITIES.length; s++) {
        if (MATRIX[c][s] > 0) {
          points.push({ x: s, y: c, r: 4 + Math.sqrt(MATRIX[c][s]) * 2.5, count: MATRIX[c][s], cat: CATEGORIES[c], sev: SEVERITIES[s] });
        }
      }
    }
    new Chart(canvas, {
      type: 'bubble',
      data: { datasets: [{ label: 'EA techniky', data: points, backgroundColor: (ctx) => {
        const sev = ctx.raw && ctx.raw.x;
        return ['#10b981', '#f59e0b', '#ef4444', '#7f1d1d'][sev] || '#6366f1';
      } }] },
      options: {
        responsive: true,
        scales: {
          x: { type: 'linear', min: -0.5, max: 3.5, ticks: { callback: (v) => SEVERITIES[v] || '', color: '#cbd5e1' }, title: { display: true, text: 'Závažnost', color: '#e2e8f0' } },
          y: { type: 'linear', min: -0.5, max: 7.5, ticks: { callback: (v) => CATEGORIES[v] || '', color: '#cbd5e1' }, title: { display: true, text: 'EA kategorie', color: '#e2e8f0' } }
        },
        plugins: {
          tooltip: { callbacks: { label: (ctx) => ctx.raw.cat + ' / ' + ctx.raw.sev + ': ' + ctx.raw.count + ' technik' } },
          title: { display: true, text: 'Severity matrix — EA kategorie × závažnost', color: '#f1f5f9' }
        },
        onClick: (e, els) => {
          if (!els.length || !detail) return;
          const p = points[els[0].index];
          setDetail(detail, p.cat + ' • ' + p.sev, p.count + ' technik této závažnosti v této kategorii.');
        }
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
