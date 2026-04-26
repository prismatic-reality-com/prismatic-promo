// Recovery Trajectory — Chart.js multi-line, click point for phase note (safe DOM)
(function() {
  'use strict';
  const PHASES = [
    { month: 0, mild: 100, moderate: 100, severe: 100, extreme: 100 },
    { month: 1, mild: 85, moderate: 95, severe: 100, extreme: 100 },
    { month: 3, mild: 65, moderate: 80, severe: 92, extreme: 98 },
    { month: 6, mild: 45, moderate: 65, severe: 80, extreme: 92 },
    { month: 12, mild: 25, moderate: 45, severe: 65, extreme: 80 },
    { month: 24, mild: 15, moderate: 30, severe: 50, extreme: 68 },
    { month: 36, mild: 10, moderate: 20, severe: 38, extreme: 55 },
    { month: 60, mild: 8, moderate: 15, severe: 28, extreme: 42 }
  ];
  const PHASE_NOTES = {
    1: 'Iniciální stabilizace — bezpečnostní kotvy, somatické regulace.',
    3: 'Rozpoznání — explicitní pojmenování technik, externalizace.',
    6: 'Metakognice — obnova schopnosti reflektovat vlastní reflexi.',
    12: 'Hermeneutika — rekonstrukce interpretačního rámce.',
    24: 'Konsolidace — stabilizace nového epistemického profilu.',
    36: 'Integrace — návrat do akademického / klinického kontextu.',
    60: 'Dlouhodobá rezilience — schopnost detekovat a neutralizovat budoucí pokusy.'
  };

  function setDetail(container, title, body) {
    while (container.firstChild) container.removeChild(container.firstChild);
    const h = document.createElement('h3');
    h.className = 'text-lg font-bold text-slate-100';
    h.textContent = title;
    container.appendChild(h);
    const p = document.createElement('p');
    p.className = 'text-slate-300 mt-1';
    p.textContent = body;
    container.appendChild(p);
  }

  function init() {
    const canvas = document.getElementById('recovery-trajectory');
    if (!canvas || typeof Chart === 'undefined') return;
    const detail = document.getElementById('recovery-detail');
    new Chart(canvas, {
      type: 'line',
      data: {
        labels: PHASES.map(p => p.month + ' mes.'),
        datasets: [
          { label: 'Mírná EA', data: PHASES.map(p => p.mild), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', tension: 0.4 },
          { label: 'Střední EA', data: PHASES.map(p => p.moderate), borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)', tension: 0.4 },
          { label: 'Vysoká EA', data: PHASES.map(p => p.severe), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', tension: 0.4 },
          { label: 'Extrémní EA', data: PHASES.map(p => p.extreme), borderColor: '#7f1d1d', backgroundColor: 'rgba(127,29,29,0.1)', tension: 0.4 }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Trajektorie zotavení podle závažnosti', color: '#f1f5f9' },
          legend: { labels: { color: '#cbd5e1' } }
        },
        scales: {
          x: { ticks: { color: '#cbd5e1' }, title: { display: true, text: 'Čas od intervence', color: '#e2e8f0' } },
          y: { ticks: { color: '#cbd5e1' }, title: { display: true, text: 'Reziduální deficit (%)', color: '#e2e8f0' }, min: 0, max: 100 }
        },
        onClick: (e, els) => {
          if (!els.length || !detail) return;
          const m = PHASES[els[0].index].month;
          setDetail(detail, 'Měsíc ' + m, PHASE_NOTES[m] || 'Pokračování stabilizační fáze.');
        }
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
