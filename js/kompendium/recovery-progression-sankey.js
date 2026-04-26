// Recovery progression Sankey-like (Chart.js custom plugin)
(function () {
  'use strict';
  if (typeof Chart === 'undefined') return;
  var canvas = document.getElementById('recovery-sankey');
  var detail = document.getElementById('recovery-sankey-detail');
  if (!canvas || !detail) return;

  function setText(el, t) { while (el.firstChild) el.removeChild(el.firstChild); el.appendChild(document.createTextNode(t)); }

  // 5 stages → next-stage flow proportions (% pacientů postupujících)
  var STAGES = [
    { id: 'ass', label: '1. Posouzení', w: 1.00, color: 'rgba(239, 68, 68, 0.85)',
      info: 'Vstupní diagnostika: SCID-5, EA-screening, fenomenologický rozhovor, riziková stratifikace. ~ 100% pacientů.' },
    { id: 'stab', label: '2. Stabilizace', w: 0.92, color: 'rgba(245, 158, 11, 0.85)',
      info: 'Bezpečnostní plán, separace od manipulátora, spánek/výživa, anxiolytika PRN. ~ 92% postupuje (8% drop-out: relapse do izolace).' },
    { id: 'meta', label: '3. Metakognice', w: 0.74, color: 'rgba(59, 130, 246, 0.85)',
      info: 'CBT-E protokol, identifikace zakotvujících přesvědčení, behaviorální experimenty. ~ 74% (drop: nesnesitelná konfrontace).' },
    { id: 'herm', label: '4. Hermeneutika', w: 0.58, color: 'rgba(168, 85, 247, 0.85)',
      info: 'Narrative re-authoring, fenomenologie self, znovu-osvojení autorství. ~ 58% (drop: integrace traumatu).' },
    { id: 'cons', label: '5. Konsolidace', w: 0.47, color: 'rgba(16, 185, 129, 0.85)',
      info: 'Re-engagement do života, mentoring jiných, post-traumatic growth. ~ 47% dosáhne plné konsolidace.' }
  ];

  var INTERVENTIONS = {
    ass: ['SCID-5 strukturovaný rozhovor', 'EA-screening (Boyko 2024)', 'Fenomenologický rozhovor', 'Stratifikace rizika', 'Konzilium'],
    stab: ['Bezpečnostní plán', 'Separace od manipulátora', 'Hygienická intervence (spánek/jídlo)', 'Anxiolytika PRN', 'Krizová síť'],
    meta: ['CBT-E manualizovaný 12-sezení protokol', 'Identifikace zakotvujících přesvědčení', 'Behaviorální experimenty', 'Mindfulness pro hyperreflexi'],
    herm: ['White & Epston narrative therapy', 'Fenomenologické rozhovory (Husserl)', 'Re-authoring autorství', 'Skupinová hermeneutická práce'],
    cons: ['Re-engagement práce / vzdělání', 'Mentoring jiných ex-členů', 'Post-traumatic growth program', 'Komunitní integrace', 'Roční follow-up']
  };

  // Custom plugin to render flow bars
  var sankeyPlugin = {
    id: 'sankeyFlow',
    afterDraw: function (chart) {
      var ctx = chart.ctx;
      var area = chart.chartArea;
      if (!area) return;
      var W = area.right - area.left;
      var H = area.bottom - area.top;
      var n = STAGES.length;
      var bw = W / n * 0.65;
      var gap = W / n * 0.35;
      ctx.save();
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';

      var bars = STAGES.map(function (s, i) {
        var x = area.left + i * (bw + gap) + gap / 2;
        var bh = s.w * (H * 0.7);
        var y = area.top + (H - bh) / 2;
        return { x: x, y: y, bw: bw, bh: bh, s: s };
      });

      // Flow polygons between consecutive
      for (var i = 0; i < bars.length - 1; i++) {
        var a = bars[i], b = bars[i + 1];
        var grad = ctx.createLinearGradient(a.x + a.bw, 0, b.x, 0);
        grad.addColorStop(0, a.s.color);
        grad.addColorStop(1, b.s.color);
        ctx.fillStyle = grad;
        ctx.globalAlpha = 0.45;
        ctx.beginPath();
        ctx.moveTo(a.x + a.bw, a.y);
        ctx.bezierCurveTo((a.x + a.bw + b.x) / 2, a.y, (a.x + a.bw + b.x) / 2, b.y, b.x, b.y);
        ctx.lineTo(b.x, b.y + b.bh);
        ctx.bezierCurveTo((a.x + a.bw + b.x) / 2, b.y + b.bh, (a.x + a.bw + b.x) / 2, a.y + a.bh, a.x + a.bw, a.y + a.bh);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Bars + labels
      bars.forEach(function (b) {
        ctx.fillStyle = b.s.color;
        ctx.fillRect(b.x, b.y, b.bw, b.bh);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText(b.s.label, b.x + b.bw / 2, b.y - 8);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px sans-serif';
        ctx.fillText(Math.round(b.s.w * 100) + '%', b.x + b.bw / 2, b.y + b.bh + 16);
        ctx.font = 'bold 13px sans-serif';
      });

      // Store bar positions for click hit-testing
      chart._sankeyBars = bars;
      ctx.restore();
    }
  };

  function showStage(s) {
    while (detail.firstChild) detail.removeChild(detail.firstChild);
    var h = document.createElement('h4'); h.className = 'font-bold text-lg mb-2'; setText(h, s.label);
    var info = document.createElement('p'); info.className = 'mb-3'; setText(info, s.info);
    var sub = document.createElement('h5'); sub.className = 'font-semibold mb-1 text-slate-300'; setText(sub, 'Typické intervence:');
    var ul = document.createElement('ul'); ul.className = 'list-disc list-inside text-sm space-y-1';
    INTERVENTIONS[s.id].forEach(function (it) {
      var li = document.createElement('li'); setText(li, it); ul.appendChild(li);
    });
    detail.appendChild(h); detail.appendChild(info); detail.appendChild(sub); detail.appendChild(ul);
  }

  var chart = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: { labels: STAGES.map(function (s) { return s.label; }), datasets: [{ data: STAGES.map(function () { return 0; }), backgroundColor: 'rgba(0,0,0,0)' }] },
    options: {
      responsive: true,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: { x: { display: false }, y: { display: false, beginAtZero: true, max: 1 } }
    },
    plugins: [sankeyPlugin]
  });

  canvas.addEventListener('click', function (ev) {
    if (!chart._sankeyBars) return;
    var r = canvas.getBoundingClientRect();
    var mx = ev.clientX - r.left, my = ev.clientY - r.top;
    chart._sankeyBars.forEach(function (b) {
      if (mx >= b.x && mx <= b.x + b.bw && my >= b.y && my <= b.y + b.bh) showStage(b.s);
    });
  });

  setText(detail, 'Klikni na sloupec stádia pro výpis typických intervencí.');
})();
