// Section 06 — Clinical recovery pathway flow (Chart.js, sankey-like via bar + scatter, safe DOM)
(function() {
  'use strict';

  const STAGES = [
    {
      id: 1, name: 'Assessment', color: '#3b82f6',
      desc: 'Iniciální zhodnocení — self-report, semi-structured interview, screening.',
      techniques: [
        { code: 'EA-6.1', label: 'Self-report instrumenty', link: '/kompendium/06-klinicke-aplikace/self-report-instrumenty/' },
        { code: 'EA-6.2', label: 'Semi-structured interview', link: '/kompendium/06-klinicke-aplikace/semi-structured-interview-protokol/' },
        { code: 'EA-6.3', label: 'Screening instrumenty', link: '/kompendium/06-klinicke-aplikace/screening-instrumenty-detail/' }
      ]
    },
    {
      id: 2, name: 'Diagnostika', color: '#8b5cf6',
      desc: 'Stanovení diagnostické hypotézy, diferenciální diagnostika, identifikace primárních a sekundárních deficitů.',
      techniques: [
        { code: 'EA-6.4', label: 'Diagnostické indikátory', link: '/kompendium/06-klinicke-aplikace/diagnosticke-indikatory/' },
        { code: 'EA-6.5', label: 'Diferenciální diagnostika', link: '/kompendium/06-klinicke-aplikace/diferencialni-diagnostika/' }
      ]
    },
    {
      id: 3, name: 'Intervence', color: '#f59e0b',
      desc: 'Aktivní terapeutická fáze — epistemická rekonstrukce, kolektivní intervence, psychoterapie.',
      techniques: [
        { code: 'EA-6.6', label: 'Terapeutické přístupy', link: '/kompendium/06-klinicke-aplikace/terapeuticke-pristupy/' },
        { code: 'EA-6.7', label: 'Epistemická rekonstrukce', link: '/kompendium/06-klinicke-aplikace/epistemicka-rekonstrukce/' },
        { code: 'EA-6.8', label: 'Kolektivní intervence', link: '/kompendium/06-klinicke-aplikace/kolektivni-intervence/' }
      ]
    },
    {
      id: 4, name: 'Monitoring', color: '#06b6d4',
      desc: 'Průběžné sledování, supervizní rámce, prevence relapsu.',
      techniques: [
        { code: 'EA-6.9', label: 'Supervizní rámce', link: '/kompendium/06-klinicke-aplikace/supervizni-ramce/' },
        { code: 'EA-6.10', label: 'Preventivní strategie', link: '/kompendium/06-klinicke-aplikace/preventivni-strategie/' }
      ]
    },
    {
      id: 5, name: 'Zotavení', color: '#10b981',
      desc: 'Stabilizace nového epistemického profilu, integrace, dlouhodobá rezilience.',
      techniques: [
        { code: 'EA-6.11', label: 'Vulnerabilní populace — followup', link: '/kompendium/06-klinicke-aplikace/vulnerabilni-populace/' },
        { code: 'EA-6.12', label: 'Případové studie (akademie/doktorát)', link: '/kompendium/06-klinicke-aplikace/pripad-akademie/' }
      ]
    }
  ];

  // Transition flows (relative weights between stages, 0-100)
  const FLOWS = [
    { from: 1, to: 2, weight: 95 },
    { from: 2, to: 3, weight: 85 },
    { from: 3, to: 4, weight: 78 },
    { from: 4, to: 5, weight: 70 },
    { from: 4, to: 3, weight: 18 }, // relapse → re-intervention
    { from: 2, to: 1, weight: 10 }  // re-assessment loop
  ];

  function setDetail(container, stage) {
    while (container.firstChild) container.removeChild(container.firstChild);
    const h = document.createElement('h3');
    h.className = 'text-lg font-bold text-slate-100';
    h.textContent = 'Fáze ' + stage.id + ' — ' + stage.name;
    container.appendChild(h);
    const p = document.createElement('p');
    p.className = 'text-slate-300 mt-1';
    p.textContent = stage.desc;
    container.appendChild(p);
    const tH = document.createElement('p');
    tH.className = 'text-slate-300 mt-3 font-semibold';
    tH.textContent = 'Typické EA-6.X techniky a aktivity:';
    container.appendChild(tH);
    const ul = document.createElement('ul');
    ul.className = 'text-slate-300 list-disc list-inside text-sm';
    stage.techniques.forEach((t) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = t.link;
      a.className = 'text-blue-400 underline';
      a.textContent = t.code + ' — ' + t.label;
      li.appendChild(a);
      ul.appendChild(li);
    });
    container.appendChild(ul);
  }

  function init() {
    const canvas = document.getElementById('section-06-recovery-flow');
    if (!canvas || typeof Chart === 'undefined') return;
    const detail = document.getElementById('recovery-flow-detail');

    let highlightedStage = null;

    // Stage bars dataset (one bar per stage at integer x)
    const stageDataset = {
      label: 'Fáze',
      type: 'bar',
      data: STAGES.map((s) => ({ x: s.id, y: 100, _stage: s })),
      backgroundColor: STAGES.map((s) => s.color + 'CC'),
      borderColor: STAGES.map((s) => s.color),
      borderWidth: 2,
      barThickness: 70,
      order: 2
    };

    // Flow dataset — line segments between bars at varying y heights based on weight
    const flowDataset = {
      label: 'Flow',
      type: 'line',
      data: [],
      borderColor: 'rgba(148, 163, 184, 0.6)',
      backgroundColor: 'rgba(148, 163, 184, 0.6)',
      pointRadius: 0,
      borderWidth: 0,
      showLine: false,
      order: 1
    };

    // Render flows as labeled annotations
    const flowAnnotations = FLOWS.map((f) => {
      return {
        from: f.from, to: f.to, weight: f.weight
      };
    });

    new Chart(canvas, {
      type: 'bar',
      data: { datasets: [stageDataset, flowDataset] },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Klinická cesta zotavení — klik na fázi pro detail',
            color: '#f1f5f9'
          },
          legend: { display: false },
          tooltip: {
            filter: (ctx) => ctx.raw && ctx.raw._stage,
            callbacks: {
              title: (items) => {
                const s = items[0].raw._stage;
                return 'Fáze ' + s.id + ' — ' + s.name;
              },
              label: (ctx) => {
                const s = ctx.raw._stage;
                return s.techniques.length + ' technik / aktivit';
              }
            }
          }
        },
        scales: {
          x: {
            type: 'linear',
            ticks: {
              color: '#cbd5e1', stepSize: 1,
              callback: (v) => {
                const s = STAGES.find((st) => st.id === v);
                return s ? s.name : '';
              }
            },
            min: 0.5, max: 5.5,
            grid: { color: 'rgba(148,163,184,0.1)' },
            title: { display: true, text: 'Klinická cesta', color: '#cbd5e1' }
          },
          y: {
            ticks: { color: '#cbd5e1' },
            min: 0, max: 110,
            grid: { color: 'rgba(148,163,184,0.1)' },
            title: { display: true, text: 'Pacientský flow (relativní)', color: '#cbd5e1' }
          }
        },
        onClick: (e, els, chart) => {
          if (!els.length || !detail) return;
          const el = els[0];
          if (el.datasetIndex !== 0) return;
          const point = chart.data.datasets[0].data[el.index];
          if (!point || !point._stage) return;
          highlightedStage = point._stage.id;
          setDetail(detail, point._stage);

          // Highlight selected bar
          chart.data.datasets[0].borderWidth = chart.data.datasets[0].data.map((pt) =>
            pt._stage && pt._stage.id === highlightedStage ? 5 : 2
          );
          chart.update('none');
        }
      },
      plugins: [{
        id: 'flowOverlay',
        afterDraw: (chart) => {
          // Draw arrows between bars showing flow weights
          const ctx = chart.ctx;
          const xScale = chart.scales.x;
          const yScale = chart.scales.y;
          ctx.save();
          flowAnnotations.forEach((f) => {
            const x1 = xScale.getPixelForValue(f.from) + 35;
            const x2 = xScale.getPixelForValue(f.to) - 35;
            const yMid = yScale.getPixelForValue(50 + (f.from === f.to ? 20 : 0));
            const yArc = yScale.getPixelForValue(60 - f.weight * 0.2);
            ctx.beginPath();
            ctx.moveTo(x1, yMid);
            ctx.bezierCurveTo(x1 + 30, yArc, x2 - 30, yArc, x2, yMid);
            ctx.strokeStyle = 'rgba(148, 163, 184, ' + (0.2 + f.weight / 200) + ')';
            ctx.lineWidth = Math.max(1, f.weight / 25);
            ctx.stroke();

            // Arrowhead
            ctx.beginPath();
            const ah = f.from > f.to ? -1 : 1;
            ctx.moveTo(x2, yMid);
            ctx.lineTo(x2 - 8 * ah, yMid - 5);
            ctx.lineTo(x2 - 8 * ah, yMid + 5);
            ctx.closePath();
            ctx.fillStyle = 'rgba(148, 163, 184, ' + (0.4 + f.weight / 200) + ')';
            ctx.fill();

            // Weight label
            ctx.fillStyle = '#cbd5e1';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(f.weight + '%', (x1 + x2) / 2, yArc - 4);
          });
          ctx.restore();
        }
      }]
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
