// Cross-Cultural EA Heatmap — Chart.js scatter heatmap (10 regions × 8 dimensions)
(function() {
  'use strict';
  const REGIONS = ['Severní Amerika', 'Západní Evropa', 'Střední/Vých. Evropa', 'Latinská Amerika', 'Sub-saharská Afrika', 'Severní Afrika/ME', 'Jižní Asie', 'Východní Asie', 'Jihovýchodní Asie', 'Oceánie'];
  const DIMS = ['EA-1 Argument.', 'EA-2 Sociální', 'EA-3 Identita', 'EA-4 Telepres.', 'EA-5 Meta-epist.', 'EA-6 Hermenev.', 'EA-7 Komunita', 'EA-9 Digitální'];
  // Prevalence 0-1 — illustrative cross-cultural manifestation
  const PREVALENCE = [
    [0.85, 0.78, 0.72, 0.55, 0.68, 0.60, 0.50, 0.92], // NA
    [0.80, 0.75, 0.68, 0.50, 0.72, 0.65, 0.55, 0.88],
    [0.70, 0.82, 0.78, 0.65, 0.55, 0.50, 0.68, 0.75],
    [0.65, 0.85, 0.80, 0.70, 0.50, 0.55, 0.78, 0.70],
    [0.50, 0.88, 0.82, 0.75, 0.40, 0.45, 0.85, 0.55],
    [0.72, 0.85, 0.78, 0.60, 0.55, 0.70, 0.80, 0.78],
    [0.68, 0.90, 0.85, 0.72, 0.50, 0.55, 0.88, 0.75],
    [0.75, 0.80, 0.70, 0.55, 0.65, 0.60, 0.72, 0.85],
    [0.62, 0.85, 0.78, 0.68, 0.50, 0.55, 0.80, 0.78],
    [0.78, 0.75, 0.65, 0.50, 0.68, 0.62, 0.55, 0.85]
  ];
  const NOTES = {
    '0,7': 'NA: extrémně vysoká digitální saturace, sociální média jako primární vektor',
    '4,1': 'Sub-saharská Afrika: silná komunální identita, klanové konflikty zvyšují EA-2',
    '6,1': 'Jižní Asie: kastovní/náboženské tlaky → vysoká EA-2 prevalence',
    '5,7': 'Severní Afrika/ME: mobilní-první populace, WhatsApp/Telegram dezinformace',
    '7,7': 'Východní Asie: digitální platformy + vysoká uniformita → EA-9 dominance'
  };

  function buildDetail(container, region, dim, val) {
    while (container.firstChild) container.removeChild(container.firstChild);
    const h = document.createElement('h3');
    h.className = 'text-lg font-bold text-amber-300';
    h.textContent = region + ' × ' + dim;
    const p = document.createElement('p');
    p.className = 'text-slate-300 mt-1';
    p.textContent = 'Manifestační prevalence: ' + (val * 100).toFixed(0) + '%';
    container.appendChild(h);
    container.appendChild(p);
    const key = REGIONS.indexOf(region) + ',' + DIMS.indexOf(dim);
    if (NOTES[key]) {
      const note = document.createElement('p');
      note.className = 'text-slate-400 mt-2 text-sm';
      note.textContent = NOTES[key];
      container.appendChild(note);
    }
    const a = document.createElement('a');
    a.href = '/kompendium/techniques/';
    a.className = 'text-blue-400 underline mt-2 inline-block';
    a.textContent = '→ techniques v kategorii ' + dim;
    container.appendChild(a);
  }

  function colorFor(v) {
    // 0=green→0.5=amber→1=red
    if (v < 0.5) {
      const r = Math.floor(34 + (245 - 34) * (v / 0.5));
      const g = Math.floor(197 - (39) * (v / 0.5));
      return 'rgba(' + r + ',' + g + ',94,0.85)';
    } else {
      const r = Math.floor(245 + (239 - 245) * ((v - 0.5) / 0.5));
      const g = Math.floor(158 - (90) * ((v - 0.5) / 0.5));
      return 'rgba(' + r + ',' + g + ',68,0.9)';
    }
  }

  function init() {
    const canvas = document.getElementById('cross-cultural-heatmap');
    const detail = document.getElementById('cross-cultural-detail');
    if (!canvas || typeof Chart === 'undefined') return;

    const data = [];
    for (let r = 0; r < REGIONS.length; r++) {
      for (let d = 0; d < DIMS.length; d++) {
        data.push({
          x: d, y: r, v: PREVALENCE[r][d],
          regionLabel: REGIONS[r], dimLabel: DIMS[d]
        });
      }
    }

    new Chart(canvas, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Prevalence',
          data: data,
          backgroundColor: function(ctx) {
            return ctx.raw ? colorFor(ctx.raw.v) : '#475569';
          },
          pointRadius: 22,
          pointHoverRadius: 26,
          pointStyle: 'rect'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(ctx) {
                const d = ctx.raw;
                return d.regionLabel + ' × ' + d.dimLabel + ': ' + (d.v * 100).toFixed(0) + '%';
              }
            }
          }
        },
        scales: {
          x: {
            type: 'linear', min: -0.5, max: DIMS.length - 0.5,
            ticks: {
              stepSize: 1,
              callback: function(v) { return DIMS[v] || ''; },
              color: '#cbd5e1'
            },
            grid: { color: '#334155' }
          },
          y: {
            type: 'linear', min: -0.5, max: REGIONS.length - 0.5,
            ticks: {
              stepSize: 1,
              callback: function(v) { return REGIONS[v] || ''; },
              color: '#cbd5e1'
            },
            grid: { color: '#334155' }
          }
        },
        onClick: function(_e, els) {
          if (els.length > 0 && detail) {
            const d = data[els[0].index];
            buildDetail(detail, d.regionLabel, d.dimLabel, d.v);
          }
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
