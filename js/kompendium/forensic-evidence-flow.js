// Forensic Evidence Flow — p5.js animated 5-stage flow
(function() {
  'use strict';
  const STAGES = [
    { id: 'incident', label: 'Incident', x: 0.10, color: [239, 68, 68], markers: [
      'Iniciační epistemický kontakt', 'Vstupní zranitelnosti zjištěny', 'Časová značka první expozice',
      'Sociální vektor identifikován', 'Digitální stopa kontaktu'
    ] },
    { id: 'assessment', label: 'Posouzení', x: 0.30, color: [245, 158, 11], markers: [
      'Klinická triage (BPRS, MMSE)', 'EA Severity Index 1-5', 'Diferenciální dg vs. psychóza',
      'Mapování použitých technik EA-1...EA-9', 'Trauma exposure inventory'
    ] },
    { id: 'documentation', label: 'Dokumentace', x: 0.50, color: [59, 130, 246], markers: [
      'Chain of custody (chat logy, audio)', 'Forenzní akvizice zařízení', 'Time-stamped journal',
      'Svědecké výpovědi (3rd party)', 'Korelace s útočníkovou taxonomií'
    ] },
    { id: 'testimony', label: 'Svědectví', x: 0.70, color: [168, 85, 247], markers: [
      'Expert witness affidavit', 'Hermeneutická rekonstrukce', 'Kompetenční hodnocení',
      'Cross-examination prep', 'Daubert/Frye standard compliance'
    ] },
    { id: 'resolution', label: 'Resoluce', x: 0.90, color: [16, 185, 129], markers: [
      'Civilní/trestní výrok', 'Restituce/odškodnění', 'No-contact / restraining',
      'Recovery protokol aktivován', 'Outcome registration (longitudinální)'
    ] }
  ];

  let particles = [];
  let highlightStage = null;

  function buildDetail(container, stage) {
    while (container.firstChild) container.removeChild(container.firstChild);
    const h = document.createElement('h3');
    h.className = 'text-lg font-bold';
    h.style.color = 'rgb(' + stage.color.join(',') + ')';
    h.textContent = stage.label;
    container.appendChild(h);
    const sub = document.createElement('p');
    sub.className = 'text-slate-400 mt-1 text-sm';
    sub.textContent = 'Typické forenzní markery EA-related případu:';
    container.appendChild(sub);
    const ul = document.createElement('ul');
    ul.className = 'mt-2 space-y-1 text-slate-300';
    stage.markers.forEach(m => {
      const li = document.createElement('li');
      li.className = 'text-sm';
      li.textContent = '• ' + m;
      ul.appendChild(li);
    });
    container.appendChild(ul);
  }

  function init() {
    const container = document.getElementById('forensic-evidence-flow');
    const detail = document.getElementById('forensic-evidence-detail');
    if (!container || typeof p5 === 'undefined') return;

    new p5(function(p) {
      let W, H;
      p.setup = function() {
        W = container.clientWidth || 800;
        H = 420;
        p.createCanvas(W, H).parent(container);
        for (let i = 0; i < 40; i++) {
          particles.push({
            stageIdx: 0,
            progress: Math.random(),
            speed: 0.002 + Math.random() * 0.003,
            offsetY: (Math.random() - 0.5) * 30
          });
        }
      };

      p.draw = function() {
        p.background(15, 23, 42);
        const yMid = H / 2;

        // Draw connection lines
        p.stroke(71, 85, 105);
        p.strokeWeight(2);
        for (let i = 0; i < STAGES.length - 1; i++) {
          const x1 = STAGES[i].x * W;
          const x2 = STAGES[i + 1].x * W;
          p.line(x1, yMid, x2, yMid);
        }

        // Draw particles
        p.noStroke();
        particles.forEach(part => {
          const s = STAGES[part.stageIdx];
          const next = STAGES[part.stageIdx + 1];
          if (!next) {
            part.stageIdx = 0; part.progress = 0;
            return;
          }
          const x = p.lerp(s.x * W, next.x * W, part.progress);
          const c = s.color;
          p.fill(c[0], c[1], c[2], 200);
          p.circle(x, yMid + part.offsetY, 4);
          part.progress += part.speed;
          if (part.progress >= 1) {
            part.stageIdx++;
            part.progress = 0;
            if (part.stageIdx >= STAGES.length - 1) {
              part.stageIdx = 0;
            }
          }
        });

        // Draw stage circles
        STAGES.forEach((s, i) => {
          const x = s.x * W;
          const isHL = highlightStage === i;
          const r = isHL ? 38 : 30;
          p.fill(s.color[0], s.color[1], s.color[2], isHL ? 220 : 160);
          p.circle(x, yMid, r * 2);
          p.fill(255);
          p.textAlign(p.CENTER);
          p.textSize(11);
          p.text(s.label, x, yMid + r + 18);
          p.textSize(10);
          p.fill(148, 163, 184);
          p.text((i + 1).toString(), x, yMid + 4);
        });
      };

      p.mouseClicked = function() {
        const yMid = H / 2;
        for (let i = 0; i < STAGES.length; i++) {
          const x = STAGES[i].x * W;
          const dx = p.mouseX - x;
          const dy = p.mouseY - yMid;
          if (dx * dx + dy * dy < 1500) {
            highlightStage = i;
            if (detail) buildDetail(detail, STAGES[i]);
            break;
          }
        }
      };
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
