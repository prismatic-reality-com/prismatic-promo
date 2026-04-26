// Kompendium EA — Taxonomy Distribution Chart (Chart.js, interactive)
// Doughnut chart of EA-1.X.Y, EA-5.1.*, EA-5.2.* etc. Click → drilldown.
(function() {
  'use strict';
  const TAXONOMY_DATA = {
    labels: ['EA-1 Akademické', 'EA-2 Delegitimizace', 'EA-3 Edukativní', 'EA-4 Terminální', 'EA-5.1 Singularita', 'EA-5.2 Metatranscend.', 'EA-5.3 Hypertransform.', 'EA-5.4 Paradoxální', 'EA-5.5 Transkonceptual', 'EA-6 Klinické', 'EA-7 Teoretické'],
    counts: [13, 50, 30, 12, 30, 10, 60, 60, 60, 50, 50],
    colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d', '#06b6d4', '#6366f1']
  };
  const TECHNIQUES_BY_CATEGORY = {
    'EA-1 Akademické': ['EA-1.1.1 Selektivní expozice', 'EA-1.1.2 Informační přetížení', 'EA-1.1.3 Terminologická mystifikace', 'EA-1.2.1 Falešné dilema', 'EA-1.2.2 Falešná ekvivalence', 'EA-1.2.3 Iluzorní komplexita', 'EA-1.3.1 Imunizace', 'EA-1.3.2 Strategická reinterpretace', 'EA-1.3.3 Tematická diverze', 'EA-1.4.1 Prosodická dominance', 'EA-1.4.2 Latentní emoce', 'EA-1.5.1 Strategická proxemika', 'EA-1.5.2 Tělesné hieroglyfy']
  };

  function init() {
    const canvas = document.getElementById('taxonomy-distribution');
    if (!canvas || typeof Chart === 'undefined') return;
    const detailEl = document.getElementById('taxonomy-detail');
    new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: TAXONOMY_DATA.labels,
        datasets: [{ data: TAXONOMY_DATA.counts, backgroundColor: TAXONOMY_DATA.colors, borderWidth: 2, borderColor: '#0f172a' }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'right', labels: { color: '#e2e8f0' } },
          title: { display: true, text: 'Distribuce EA technik napříč kategoriemi (klikněte pro detail)', color: '#f1f5f9' },
          tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed} technik` } }
        },
        onClick: (evt, elems) => {
          if (!elems.length || !detailEl) return;
          const i = elems[0].index;
          const cat = TAXONOMY_DATA.labels[i];
          const techs = TECHNIQUES_BY_CATEGORY[cat] || [`Detailní články pro ${cat} jsou v podknihovně /kompendium/techniques/.`];
          detailEl.innerHTML = `<h3 class="text-lg font-bold text-slate-100">${cat} (${TAXONOMY_DATA.counts[i]} technik)</h3><ul class="mt-2 space-y-1 text-slate-300">${techs.map(t => `<li>• ${t}</li>`).join('')}</ul>`;
        }
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
