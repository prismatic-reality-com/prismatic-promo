// Phenomenology Timeline — Chart.js scatter, click point → safe DOM detail
(function() {
  'use strict';

  // Five symptom tracks across 0-60 months (intensity 0-100)
  const TIMEPOINTS = [0, 1, 3, 6, 9, 12, 18, 24, 30, 36, 48, 60];
  const TRACKS = {
    anxiety: {
      label: 'Úzkost',
      color: '#f59e0b',
      values: [10, 35, 62, 78, 82, 75, 65, 55, 48, 42, 35, 28]
    },
    depersonalization: {
      label: 'Depersonalizace',
      color: '#8b5cf6',
      values: [5, 22, 48, 70, 80, 78, 68, 58, 50, 42, 32, 25]
    },
    epistemicUncertainty: {
      label: 'Epistemická nejistota',
      color: '#ef4444',
      values: [15, 50, 75, 88, 92, 85, 72, 60, 50, 42, 35, 30]
    },
    somatic: {
      label: 'Somatická tíseň',
      color: '#10b981',
      values: [8, 28, 55, 68, 72, 65, 55, 45, 38, 32, 25, 20]
    },
    identityConfusion: {
      label: 'Konfuze identity',
      color: '#3b82f6',
      values: [12, 30, 58, 75, 85, 82, 70, 60, 52, 45, 38, 30]
    }
  };

  const NOTES = {
    anxiety: {
      0: 'Pre-expoziční baseline. Žádná systémová úzkost.',
      1: 'První manipulační kontakty — vegetativní reakce.',
      6: 'Vrchol akutní fáze. Anticipační úzkost před každou interakcí.',
      24: 'Stabilizace s podporou. Úzkost přechází do reziduální formy.',
      60: 'Dlouhodobá rezilience. Stopová úzkost při triggerech.'
    },
    depersonalization: {
      3: 'Nástup pocitu odcizení vlastním myšlenkám.',
      9: 'Plné disociativní epizody. „Já nejsem já."',
      36: 'Postupná reintegrace self přes hermeneutickou práci.'
    },
    epistemicUncertainty: {
      1: 'První pochybnost o vlastních smyslech.',
      9: 'Maximum — pacient odmítá důvěřovat jakémukoli vjemu.',
      24: 'Obnovení epistemické autonomie přes externí kotvy.'
    },
    somatic: {
      6: 'Tenze, GI symptomy, poruchy spánku, palpitace.',
      36: 'Somatické symptomy ustupují s návratem regulace.'
    },
    identityConfusion: {
      9: 'Kolaps narativu „kdo jsem". Polární self-koncepce.',
      24: 'Rekonstrukce identity nezávislé na manipulátorovi.',
      48: 'Stabilní nový epistemický a osobnostní profil.'
    }
  };

  function findClosestNote(trackKey, month) {
    const trackNotes = NOTES[trackKey] || {};
    const months = Object.keys(trackNotes).map(Number).sort((a, b) => a - b);
    if (months.length === 0) return null;
    let closest = months[0];
    let minDiff = Math.abs(month - closest);
    for (const m of months) {
      const diff = Math.abs(month - m);
      if (diff < minDiff) {
        minDiff = diff;
        closest = m;
      }
    }
    return trackNotes[closest];
  }

  function setDetail(container, track, month, intensity) {
    while (container.firstChild) container.removeChild(container.firstChild);
    const h = document.createElement('h3');
    h.className = 'text-lg font-bold text-slate-100';
    h.textContent = track.label + ' — měsíc ' + month;
    container.appendChild(h);
    const meta = document.createElement('p');
    meta.className = 'text-slate-400 text-sm';
    meta.textContent = 'Intenzita: ' + intensity + '/100';
    container.appendChild(meta);
    const note = findClosestNote(track.key, month);
    if (note) {
      const p = document.createElement('p');
      p.className = 'text-slate-300 mt-2';
      p.textContent = note;
      container.appendChild(p);
    }
  }

  function buildDataset(key) {
    const t = TRACKS[key];
    return {
      label: t.label,
      data: TIMEPOINTS.map((m, i) => ({ x: m, y: t.values[i], _track: key })),
      borderColor: t.color,
      backgroundColor: t.color + '40',
      pointBackgroundColor: t.color,
      pointRadius: 5,
      pointHoverRadius: 8,
      tension: 0.4,
      showLine: true
    };
  }

  function init() {
    const canvas = document.getElementById('phenomenology-timeline');
    if (!canvas || typeof Chart === 'undefined') return;
    const detail = document.getElementById('phenomenology-detail');

    const datasets = Object.keys(TRACKS).map(buildDataset);

    new Chart(canvas, {
      type: 'scatter',
      data: { datasets: datasets },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Fenomenologická timeline symptomů během EA expozice',
            color: '#f1f5f9'
          },
          legend: { labels: { color: '#cbd5e1' } },
          tooltip: {
            callbacks: {
              title: (items) => 'Měsíc ' + items[0].parsed.x,
              label: (ctx) => {
                const trackKey = ctx.raw._track;
                const t = TRACKS[trackKey];
                return t.label + ': ' + ctx.parsed.y + '/100';
              }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: '#cbd5e1' },
            title: { display: true, text: 'Čas od začátku expozice (měsíce)', color: '#e2e8f0' },
            min: 0,
            max: 60
          },
          y: {
            ticks: { color: '#cbd5e1' },
            title: { display: true, text: 'Intenzita symptomů (0-100)', color: '#e2e8f0' },
            min: 0,
            max: 100
          }
        },
        onClick: (e, els) => {
          if (!els.length || !detail) return;
          const el = els[0];
          const point = datasets[el.datasetIndex].data[el.index];
          const trackKey = point._track;
          const track = Object.assign({ key: trackKey }, TRACKS[trackKey]);
          setDetail(detail, track, point.x, point.y);
        }
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
