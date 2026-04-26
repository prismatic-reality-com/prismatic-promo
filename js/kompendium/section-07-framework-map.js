// Section 07 — Force-directed map of philosophers relevant to EA (p5.js, safe DOM)
(function() {
  'use strict';

  // Traditions: cont = continental, anal = analytic, cog = cognitive science, ethpol = ethics & politics
  const TRADITION_COLORS = {
    cont:   { rgb: [139, 92, 246], label: 'Kontinentální' },
    anal:   { rgb: [59, 130, 246], label: 'Analytická' },
    cog:    { rgb: [16, 185, 129], label: 'Kognitivní vědy' },
    ethpol: { rgb: [239, 68, 68],  label: 'Etika & politika' }
  };

  // 32 philosophers with EA-relevant concept + slug for kompendium link
  const PHILOSOPHERS = [
    { id: 'foucault',    label: 'Foucault',     trad: 'cont',   concept: 'Moc / diskurz / governmentalita',                slug: 'postmodernismus' },
    { id: 'adorno',      label: 'Adorno',       trad: 'cont',   concept: 'Negativní dialektika / kulturní průmysl',         slug: 'postmodernismus' },
    { id: 'habermas',    label: 'Habermas',     trad: 'cont',   concept: 'Komunikativní racionalita',                       slug: 'kuhn-paradigmaticke-revoluce' },
    { id: 'heidegger',   label: 'Heidegger',    trad: 'cont',   concept: 'Bytí ve světě / klam',                            slug: 'heidegger-byt-ve-svete' },
    { id: 'merleau',     label: 'Merleau-Ponty',trad: 'cont',   concept: 'Vtělená percepce',                                slug: 'merleau-ponty-vtelena-percepce' },
    { id: 'levinas',     label: 'Levinas',      trad: 'cont',   concept: 'Etika Druhého',                                   slug: 'levinas-jiny' },
    { id: 'sartre',      label: 'Sartre',       trad: 'cont',   concept: 'Mauvaise foi / radikální svoboda',                slug: 'sartre-existencialismus' },
    { id: 'ricoeur',     label: 'Ricoeur',      trad: 'cont',   concept: 'Trojí mimese / hermeneutika',                     slug: 'ricoeur-troji-mimese' },
    { id: 'butler',      label: 'Butler',       trad: 'cont',   concept: 'Performativita / norma',                          slug: 'butler-performative' },
    { id: 'arendt',      label: 'Arendt',       trad: 'ethpol', concept: 'Banalita zla / myšlení',                          slug: 'arendt-banalita-zla' },
    { id: 'honneth',     label: 'Honneth',      trad: 'ethpol', concept: 'Rozpoznání',                                      slug: 'honneth-rozpoznani' },
    { id: 'macintyre',   label: 'MacIntyre',    trad: 'ethpol', concept: 'After Virtue',                                    slug: 'macintyre-after-virtue' },
    { id: 'nussbaum',    label: 'Nussbaum',     trad: 'ethpol', concept: 'Capabilities approach',                           slug: 'nussbaum-capabilities' },
    { id: 'sen',         label: 'Sen',          trad: 'ethpol', concept: 'Development as Freedom',                          slug: 'sen-development-as-freedom' },
    { id: 'taylor',      label: 'Taylor',       trad: 'ethpol', concept: 'Sources of the Self',                             slug: 'taylor-sources-of-self' },
    { id: 'wittgenstein',label: 'Wittgenstein', trad: 'anal',   concept: 'Jazykové hry',                                    slug: 'wittgenstein-jezykove-hry' },
    { id: 'davidson',    label: 'Davidson',     trad: 'anal',   concept: 'Radical interpretation',                          slug: 'davidson-radical-interpretation' },
    { id: 'dennett',     label: 'Dennett',      trad: 'anal',   concept: 'Intentional stance',                              slug: 'dennett-intentional-stance' },
    { id: 'searle',      label: 'Searle',       trad: 'anal',   concept: 'Chinese room',                                    slug: 'searle-chinese-room' },
    { id: 'brandom',     label: 'Brandom',      trad: 'anal',   concept: 'Inferential semantics',                           slug: 'brandom-inferential-semantics' },
    { id: 'mcdowell',    label: 'McDowell',     trad: 'anal',   concept: 'Mind and World',                                  slug: 'mcDowell-mind-and-world' },
    { id: 'putnam',      label: 'Putnam',       trad: 'anal',   concept: 'Internal realism',                                slug: 'putnam-internal-realism' },
    { id: 'quine',       label: 'Quine',        trad: 'anal',   concept: 'Web of belief',                                   slug: 'quine-web-of-belief' },
    { id: 'rorty',       label: 'Rorty',        trad: 'anal',   concept: 'Contingency',                                     slug: 'rorty-contingency' },
    { id: 'kuhn',        label: 'Kuhn',         trad: 'anal',   concept: 'Paradigmatické revoluce',                         slug: 'kuhn-paradigmaticke-revoluce' },
    { id: 'feyerabend',  label: 'Feyerabend',   trad: 'anal',   concept: 'Anti-method',                                     slug: 'feyerabend-anti-method' },
    { id: 'williams',    label: 'Williams',     trad: 'anal',   concept: 'Truth and Truthfulness',                          slug: 'williams-truth-and-truthfulness' },
    { id: 'nagel',       label: 'Nagel',        trad: 'anal',   concept: 'View from Nowhere',                               slug: 'nagel-view-from-nowhere' },
    { id: 'block',       label: 'Block',        trad: 'cog',    concept: 'Phenomenal vs access',                            slug: 'block-phenomenal-vs-access' },
    { id: 'chalmers',    label: 'Chalmers',     trad: 'cog',    concept: 'Hard problem',                                    slug: 'chalmers-hard-problem' },
    { id: 'tononi',      label: 'Tononi',       trad: 'cog',    concept: 'IIT — integrovaná informace',                     slug: 'tononi-iit' },
    { id: 'friston',     label: 'Friston',      trad: 'cog',    concept: 'Active inference',                                slug: 'friston-active-inference' },
    { id: 'polanyi',     label: 'Polanyi',      trad: 'cog',    concept: 'Tichá znalost',                                   slug: 'polanyi-ticha-znalost' }
  ];

  // Influence edges (curated, asymmetric)
  const EDGES = [
    ['heidegger', 'merleau'], ['heidegger', 'sartre'], ['heidegger', 'levinas'],
    ['merleau', 'butler'], ['heidegger', 'arendt'],
    ['adorno', 'habermas'], ['foucault', 'butler'], ['foucault', 'adorno'],
    ['levinas', 'ricoeur'], ['ricoeur', 'taylor'],
    ['sartre', 'butler'], ['arendt', 'honneth'],
    ['macintyre', 'taylor'], ['nussbaum', 'sen'], ['sen', 'nussbaum'],
    ['wittgenstein', 'davidson'], ['wittgenstein', 'rorty'], ['wittgenstein', 'mcdowell'],
    ['davidson', 'brandom'], ['brandom', 'mcdowell'], ['quine', 'davidson'], ['quine', 'putnam'],
    ['putnam', 'rorty'], ['putnam', 'mcdowell'],
    ['dennett', 'searle'], ['dennett', 'chalmers'], ['chalmers', 'block'], ['block', 'tononi'],
    ['friston', 'chalmers'], ['friston', 'dennett'],
    ['kuhn', 'feyerabend'], ['kuhn', 'rorty'], ['kuhn', 'putnam'],
    ['williams', 'macintyre'], ['williams', 'nussbaum'], ['williams', 'rorty'],
    ['nagel', 'chalmers'], ['nagel', 'williams'],
    ['polanyi', 'kuhn'], ['polanyi', 'mcdowell'],
    ['foucault', 'arendt'], ['adorno', 'arendt']
  ];

  function setDetail(container, node) {
    while (container.firstChild) container.removeChild(container.firstChild);
    const h = document.createElement('h3');
    h.className = 'text-lg font-bold text-slate-100';
    h.textContent = node.label;
    container.appendChild(h);
    const trad = document.createElement('p');
    trad.className = 'text-slate-400 text-sm';
    trad.textContent = 'Tradice: ' + TRADITION_COLORS[node.trad].label;
    container.appendChild(trad);
    const c = document.createElement('p');
    c.className = 'text-slate-300 mt-2 font-semibold';
    c.textContent = 'EA-relevantní koncept:';
    container.appendChild(c);
    const cv = document.createElement('p');
    cv.className = 'text-slate-300 text-sm';
    cv.textContent = node.concept;
    container.appendChild(cv);

    if (node.slug) {
      const link = document.createElement('a');
      link.href = '/kompendium/07-teoreticke-reflexe/' + node.slug + '/';
      link.className = 'text-blue-400 underline text-sm mt-2 inline-block';
      link.textContent = '→ Otevřít plný článek';
      container.appendChild(link);
    }
  }

  function init() {
    const host = document.getElementById('section-07-framework-map');
    if (!host || typeof p5 === 'undefined') return;
    const detail = document.getElementById('framework-detail');

    new p5(function(p) {
      let w = 800, h = 600;
      const nodes = [];
      const edges = [];
      let hovered = null;
      let selected = null;
      let dragNode = null;

      p.setup = function() {
        const cnv = p.createCanvas(w, h);
        cnv.parent(host);

        // Initialize node positions deterministically (no Math.random for reproducibility across reloads)
        PHILOSOPHERS.forEach((ph, i) => {
          const a = (i / PHILOSOPHERS.length) * Math.PI * 2;
          nodes.push({
            data: ph,
            x: w / 2 + Math.cos(a) * 220,
            y: h / 2 + Math.sin(a) * 220,
            vx: 0, vy: 0,
            pinned: false
          });
        });

        const idx = {};
        nodes.forEach((n, i) => { idx[n.data.id] = i; });
        EDGES.forEach(([a, b]) => {
          if (idx[a] !== undefined && idx[b] !== undefined) {
            edges.push({ a: idx[a], b: idx[b] });
          }
        });
      };

      function neighborsOf(nodeIdx) {
        const set = new Set();
        edges.forEach((e) => {
          if (e.a === nodeIdx) set.add(e.b);
          if (e.b === nodeIdx) set.add(e.a);
        });
        return set;
      }

      function step() {
        // Repulsion
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[j].x - nodes[i].x;
            const dy = nodes[j].y - nodes[i].y;
            const d2 = Math.max(64, dx * dx + dy * dy);
            const f = 1500 / d2;
            const d = Math.sqrt(d2);
            const fx = (dx / d) * f;
            const fy = (dy / d) * f;
            nodes[i].vx -= fx; nodes[i].vy -= fy;
            nodes[j].vx += fx; nodes[j].vy += fy;
          }
        }
        // Spring on edges
        edges.forEach((e) => {
          const a = nodes[e.a], b = nodes[e.b];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d = Math.max(1, Math.sqrt(dx * dx + dy * dy));
          const k = 0.0018;
          const target = 110;
          const f = k * (d - target);
          const fx = (dx / d) * f;
          const fy = (dy / d) * f;
          a.vx += fx; a.vy += fy;
          b.vx -= fx; b.vy -= fy;
        });
        // Centering
        nodes.forEach((n) => {
          n.vx += (w / 2 - n.x) * 0.0005;
          n.vy += (h / 2 - n.y) * 0.0005;
        });
        // Integrate
        nodes.forEach((n) => {
          if (n.pinned) { n.vx = 0; n.vy = 0; return; }
          n.vx *= 0.85; n.vy *= 0.85;
          n.x += n.vx; n.y += n.vy;
          // bounds
          n.x = Math.max(20, Math.min(w - 20, n.x));
          n.y = Math.max(20, Math.min(h - 20, n.y));
        });
      }

      function pick(mx, my) {
        let best = null, bestD = 9999;
        nodes.forEach((n, i) => {
          const dx = mx - n.x, dy = my - n.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 16 && d < bestD) { best = i; bestD = d; }
        });
        return best;
      }

      p.draw = function() {
        p.background(15, 23, 42);
        if (!dragNode) step();

        const selectedNeighbors = selected !== null ? neighborsOf(selected) : null;

        // Edges
        edges.forEach((e) => {
          const a = nodes[e.a], b = nodes[e.b];
          let alpha = 70;
          if (selected !== null && (e.a === selected || e.b === selected)) alpha = 220;
          else if (selected !== null) alpha = 25;
          p.stroke(148, 163, 184, alpha);
          p.strokeWeight(1);
          p.line(a.x, a.y, b.x, b.y);
        });

        // Nodes
        nodes.forEach((n, i) => {
          const col = TRADITION_COLORS[n.data.trad].rgb;
          let r = 12;
          let alpha = 220;
          if (selected !== null) {
            if (i === selected) { r = 18; alpha = 255; }
            else if (selectedNeighbors && selectedNeighbors.has(i)) { r = 14; alpha = 230; }
            else { r = 9; alpha = 110; }
          }
          if (hovered === i) r += 2;
          p.noStroke();
          p.fill(col[0], col[1], col[2], alpha);
          p.ellipse(n.x, n.y, r * 2);

          if (selected === null || i === selected || (selectedNeighbors && selectedNeighbors.has(i)) || hovered === i) {
            p.fill(241, 245, 249, alpha);
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(10);
            p.text(n.data.label, n.x, n.y - r - 7);
          }
        });

        // tooltip
        if (hovered !== null) {
          const n = nodes[hovered];
          p.fill(15, 23, 42, 230);
          p.stroke(148, 163, 184, 180);
          p.strokeWeight(1);
          const tw = Math.max(220, p.textWidth(n.data.concept) + 30);
          p.rect(p.mouseX + 10, p.mouseY + 10, tw, 50, 4);
          p.noStroke();
          p.fill(241, 245, 249);
          p.textAlign(p.LEFT, p.TOP);
          p.textSize(11);
          p.text(n.data.label, p.mouseX + 18, p.mouseY + 16);
          p.fill(148, 163, 184);
          p.textSize(10);
          p.text(n.data.concept, p.mouseX + 18, p.mouseY + 32);
          p.text('Klik = výběr + odkaz', p.mouseX + 18, p.mouseY + 46);
        }
      };

      p.mouseMoved = function() {
        hovered = pick(p.mouseX, p.mouseY);
      };

      p.mousePressed = function() {
        const idx = pick(p.mouseX, p.mouseY);
        if (idx !== null) {
          selected = idx;
          dragNode = idx;
          nodes[idx].pinned = true;
          if (detail) setDetail(detail, nodes[idx].data);
        } else {
          selected = null;
        }
      };

      p.mouseDragged = function() {
        if (dragNode !== null) {
          nodes[dragNode].x = p.mouseX;
          nodes[dragNode].y = p.mouseY;
        }
      };

      p.mouseReleased = function() {
        dragNode = null;
      };
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
