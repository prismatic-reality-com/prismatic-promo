// Section 04 — Radial decision tree for terminal protocol identification (p5.js, safe DOM)
(function() {
  'use strict';

  // 4-level radial tree. Risk colors: green safe, yellow watch, orange intervene, red critical.
  // Each node: id, label, risk, link (relative URL or null), children
  const TREE = {
    id: 'root',
    label: 'Posuzovaný případ',
    risk: 'neutral',
    link: null,
    children: [
      {
        id: 'd-yes', label: 'Detekce: ANO', risk: 'orange', link: null,
        children: [
          {
            id: 'd-yes-mild', label: 'Mírná', risk: 'yellow', link: null,
            children: [
              { id: 'd-yes-mild-konc', label: 'Konceptuální dekonstrukce', risk: 'yellow', link: '/kompendium/04-terminalni-protokoly/konceptualni-dekonstrukce/' },
              { id: 'd-yes-mild-iden', label: 'Identitní dekonstrukce', risk: 'yellow', link: '/kompendium/04-terminalni-protokoly/identitni-dekonstrukce/' }
            ]
          },
          {
            id: 'd-yes-mid', label: 'Střední', risk: 'orange', link: null,
            children: [
              { id: 'd-yes-mid-inst', label: 'Institucionální anihilace', risk: 'orange', link: '/kompendium/04-terminalni-protokoly/institucionalni-anihilace/' },
              { id: 'd-yes-mid-rec', label: 'Kontrolovaná rekonstituce', risk: 'orange', link: '/kompendium/04-terminalni-protokoly/kontrolovana-rekonstituce/' }
            ]
          },
          {
            id: 'd-yes-sev', label: 'Těžká', risk: 'red', link: null,
            children: [
              { id: 'd-yes-sev-ult', label: 'Ultimátní scénář', risk: 'red', link: '/kompendium/04-terminalni-protokoly/ultimatni-scenar/' },
              { id: 'd-yes-sev-stop', label: 'Tvrdá zastávka', risk: 'red', link: '/kompendium/04-terminalni-protokoly/intra-simulacni-monitoring/' }
            ]
          }
        ]
      },
      {
        id: 'd-unc', label: 'Detekce: NEJASNÉ', risk: 'yellow', link: null,
        children: [
          {
            id: 'd-unc-mon', label: 'Pokračovat v monitoringu', risk: 'yellow', link: '/kompendium/04-terminalni-protokoly/intra-simulacni-monitoring/',
            children: [
              { id: 'd-unc-mon-self', label: 'Self-report', risk: 'yellow', link: '/kompendium/06-klinicke-aplikace/self-report-instrumenty/' },
              { id: 'd-unc-mon-int', label: 'Interview', risk: 'yellow', link: '/kompendium/06-klinicke-aplikace/semi-structured-interview-protokol/' }
            ]
          },
          {
            id: 'd-unc-rs', label: 'Re-screening', risk: 'orange', link: '/kompendium/04-terminalni-protokoly/pred-simulacni-screening/',
            children: [
              { id: 'd-unc-rs-bridge', label: 'Diferenciální dx', risk: 'orange', link: '/kompendium/06-klinicke-aplikace/diferencialni-diagnostika/' }
            ]
          }
        ]
      },
      {
        id: 'd-no', label: 'Detekce: NE', risk: 'green', link: null,
        children: [
          {
            id: 'd-no-prev', label: 'Preventivní opatření', risk: 'green', link: '/kompendium/06-klinicke-aplikace/preventivni-strategie/',
            children: [
              { id: 'd-no-prev-edu', label: 'Edukace', risk: 'green', link: '/kompendium/06-klinicke-aplikace/preventivni-strategie/' },
              { id: 'd-no-prev-sup', label: 'Supervize', risk: 'green', link: '/kompendium/06-klinicke-aplikace/supervizni-ramce/' }
            ]
          }
        ]
      }
    ]
  };

  const RISK_COLORS = {
    neutral: [148, 163, 184],
    green: [16, 185, 129],
    yellow: [234, 179, 8],
    orange: [249, 115, 22],
    red: [239, 68, 68]
  };

  // Layout: assign each node an angle and depth recursively
  function layout(node, depth, startA, endA, list) {
    node._depth = depth;
    node._angle = (startA + endA) / 2;
    list.push(node);
    if (node.children && node.children.length) {
      const span = (endA - startA) / node.children.length;
      node.children.forEach((c, i) => {
        layout(c, depth + 1, startA + i * span, startA + (i + 1) * span, list);
      });
    }
  }

  function setDetail(container, node) {
    while (container.firstChild) container.removeChild(container.firstChild);
    const h = document.createElement('h3');
    h.className = 'text-lg font-bold text-slate-100';
    h.textContent = node.label;
    container.appendChild(h);
    const lvl = document.createElement('p');
    lvl.className = 'text-slate-400 text-sm';
    lvl.textContent = 'Úroveň ' + node._depth + ' — riziko: ' + node.risk;
    container.appendChild(lvl);
    if (node.link) {
      const link = document.createElement('a');
      link.href = node.link;
      link.className = 'text-blue-400 underline text-sm mt-2 inline-block';
      link.textContent = '→ Otevřít související článek';
      container.appendChild(link);
    } else {
      const p = document.createElement('p');
      p.className = 'text-slate-300 mt-2 text-sm';
      p.textContent = 'Klikněte na potomky uzlu pro hlubší rozhodnutí.';
      container.appendChild(p);
    }
  }

  function init() {
    const host = document.getElementById('section-04-decision-tree');
    if (!host || typeof p5 === 'undefined') return;
    const detail = document.getElementById('tree-detail');

    const flatList = [];
    layout(TREE, 0, -Math.PI, Math.PI, flatList);

    // sketch
    new p5(function(p) {
      let w = 800; let h = 600;
      let cx, cy;
      let radii = [0, 90, 180, 260, 330];
      let hovered = null;

      p.setup = function() {
        const cnv = p.createCanvas(w, h);
        cnv.parent(host);
        cx = w / 2; cy = h / 2;
      };

      p.draw = function() {
        p.background(15, 23, 42);
        // Draw edges first
        p.strokeWeight(1.2);
        p.noFill();
        flatList.forEach((node) => {
          if (!node.children) return;
          const r1 = radii[node._depth];
          const r2 = radii[node._depth + 1];
          node.children.forEach((c) => {
            const x1 = cx + r1 * Math.cos(node._angle);
            const y1 = cy + r1 * Math.sin(node._angle);
            const x2 = cx + r2 * Math.cos(c._angle);
            const y2 = cy + r2 * Math.sin(c._angle);
            const col = RISK_COLORS[c.risk] || RISK_COLORS.neutral;
            p.stroke(col[0], col[1], col[2], 90);
            p.line(x1, y1, x2, y2);
          });
        });

        // Draw nodes
        flatList.forEach((node) => {
          const r = radii[node._depth];
          const x = cx + r * Math.cos(node._angle);
          const y = cy + r * Math.sin(node._angle);
          const col = RISK_COLORS[node.risk] || RISK_COLORS.neutral;
          const baseR = 8 + (4 - node._depth) * 2;
          const isHover = hovered && hovered.id === node.id;
          p.noStroke();
          p.fill(col[0], col[1], col[2], isHover ? 255 : 200);
          p.ellipse(x, y, isHover ? baseR * 2 + 6 : baseR * 2);

          if (node._depth <= 2 || isHover) {
            p.fill(241, 245, 249);
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(node._depth === 0 ? 12 : (node._depth === 1 ? 11 : 10));
            const tx = node._depth === 0 ? x : x;
            const ty = node._depth === 0 ? y : y - baseR - 8;
            p.text(node.label, tx, ty);
          }
        });

        // hovered tooltip
        if (hovered) {
          p.fill(15, 23, 42, 230);
          p.stroke(148, 163, 184, 180);
          p.strokeWeight(1);
          const tw = Math.max(180, p.textWidth(hovered.label) + 30);
          p.rect(p.mouseX + 10, p.mouseY + 10, tw, 40, 4);
          p.noStroke();
          p.fill(241, 245, 249);
          p.textAlign(p.LEFT, p.TOP);
          p.textSize(11);
          p.text(hovered.label, p.mouseX + 18, p.mouseY + 16);
          p.fill(148, 163, 184);
          p.text('Riziko: ' + hovered.risk + ' — klik pro detail', p.mouseX + 18, p.mouseY + 30);
        }
      };

      function pickNodeAt(mx, my) {
        let best = null;
        let bestD = 9999;
        flatList.forEach((node) => {
          const r = radii[node._depth];
          const x = cx + r * Math.cos(node._angle);
          const y = cy + r * Math.sin(node._angle);
          const d = Math.sqrt((mx - x) * (mx - x) + (my - y) * (my - y));
          if (d < 14 && d < bestD) { best = node; bestD = d; }
        });
        return best;
      }

      p.mouseMoved = function() {
        hovered = pickNodeAt(p.mouseX, p.mouseY);
      };

      p.mousePressed = function() {
        const node = pickNodeAt(p.mouseX, p.mouseY);
        if (node && detail) setDetail(detail, node);
      };
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
