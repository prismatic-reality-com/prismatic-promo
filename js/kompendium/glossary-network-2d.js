// Glossary network 2D (p5.js force-directed, top 50 terms)
(function () {
  'use strict';
  if (typeof p5 === 'undefined') return;
  var host = document.getElementById('glossary-network');
  var detail = document.getElementById('glossary-network-detail');
  if (!host || !detail) return;

  function setText(el, t) { while (el.firstChild) el.removeChild(el.firstChild); el.appendChild(document.createTextNode(t)); }

  var TERMS = [
    { id: 'ea', n: 'Epistemická anihilace', d: 'Cílené ničení epistemické autonomie subjektu.' },
    { id: 'ka', n: 'Kognitivní anihilace', d: 'Destrukce kognitivní integrity skrze vícevrstevný útok.' },
    { id: 'meta', n: 'Metakognice', d: 'Schopnost reflexe vlastního myšlení; primární obranná vrstva.' },
    { id: 'herm', n: 'Hermeneutika', d: 'Interpretace významu; v EA cílená inverze interpretačního pole.' },
    { id: 'tax', n: 'Taxonomie EA', d: '500+ technik organizovaných do 5 vrstev závažnosti.' },
    { id: 'nabla', n: 'NABLA Infinity', d: '16-úrovňová epistemická pipeline pro detekci.' },
    { id: 'dec', n: 'Decision Engine', d: 'Confidence ≠ truth; výpočet skóre rozhodnutí.' },
    { id: 'phen', n: 'Fenomenologie', d: 'První-osoba fenomenální popis EA prožitku.' },
    { id: 'rec', n: 'Rekonstrukce', d: '5-stádiová cesta zotavení po EA expozici.' },
    { id: 'hyp', n: 'Hyperreflexivita', d: 'Patologické zacyklení sebe-monitorování (EA-5.1.13).' },
    { id: 'iden', n: 'Identita', d: 'Narativní self-koherence napadána EA technikami.' },
    { id: 'bel', n: 'Přesvědčení', d: 'Elementární jednotka epistemiky; agregát do koherence.' },
    { id: 'mind', n: 'Mind control', d: 'Behaviorální + kognitivní + emoční koercivní rámec.' },
    { id: 'cult', n: 'Kult', d: 'Sociální struktura systematicky aplikující EA.' },
    { id: 'gas', n: 'Gaslighting', d: 'Postupná destrukce důvěry v epistemické vnímání.' },
    { id: 'iso', n: 'Izolace', d: 'Odříznutí od epistemických referenčních bodů.' },
    { id: 'love', n: 'Love bombing', d: 'Hyper-pozitivní rámcování pro snížení obran.' },
    { id: 'lang', n: 'Jazyková inverze', d: 'Sémantická redefinice klíčových termínů.' },
    { id: 'frame', n: 'Frame control', d: 'Kontrola interpretačního rámce komunikace.' },
    { id: 'auth', n: 'Autorita', d: 'Zneužití expertního/morálního/legálního statusu.' },
    { id: 'dis', n: 'Dezinformace', d: 'Záměrně nepravdivé informace; vrstva EA.' },
    { id: 'mis', n: 'Misinformace', d: 'Nepravdivé bez záměru; sekundární zranitelnost.' },
    { id: 'mal', n: 'Malinformace', d: 'Pravdivé info kontextualizované škodlivě.' },
    { id: 'over', n: 'Inform. přetížení', d: 'EA-1.1.2 - zahlcení pozornosti pro rozpad analýzy.' },
    { id: 'frag', n: 'Fragmentace', d: 'Stav rozpadlé epistemické koherence.' },
    { id: 'rec7', n: 'Referenční rekurze', d: 'EA-5.1.7 - zacyklené odkazování bez kotvy.' },
    { id: 'epi', n: 'Epistemika', d: 'Teorie poznání; cílový prostor EA útoku.' },
    { id: 'aut', n: 'Autonomie', d: 'Schopnost samostatného rozhodování; primární terč.' },
    { id: 'dec2', n: 'Deceptive practice', d: 'Technika klamavé prezentace pravdy.' },
    { id: 'depers', n: 'Depersonalizace', d: 'Symptom EA - odpojení od vlastního self.' },
    { id: 'derel', n: 'Derealizace', d: 'Symptom EA - odpojení od reality.' },
    { id: 'doubt', n: 'Pochybnosti (řízené)', d: 'Cíleně indukovaná epistemická nejistota.' },
    { id: 'doctr', n: 'Doktrinace', d: 'Systematické vštěpení uzavřeného souboru přesvědčení.' },
    { id: 'thought', n: 'Thought reform', n2: 'Thought reform', d: 'Lifton 8 kritérií totalistic milieu.' },
    { id: 'bite', n: 'BITE model', d: 'Hassan: Behavior, Information, Thought, Emotion control.' },
    { id: 'epi-iso', n: 'Epist. izolace', d: 'Bubble effect; uzavření před externími důkazy.' },
    { id: 'ruml', n: 'Ruminace', d: 'Patologické přemítání bez resoluce.' },
    { id: 'evid', n: 'Důkazní standard', d: 'Kolaps standardů v post-AI éře.' },
    { id: 'truth', n: 'Pravda', d: 'Korespondenční vs koherentní vs pragmatická.' },
    { id: 'pers', n: 'Persvaze', d: 'Legitimní opak manipulace; etická hranice.' },
    { id: 'manip', n: 'Manipulace', d: 'Persvaze obcházející racionální deliberaci.' },
    { id: 'coerc', n: 'Koerce', d: 'Donucení; nejtvrdší forma EA.' },
    { id: 'cog-bias', n: 'Kognit. zkreslení', d: 'Systematické chyby; zranitelnosti pro EA.' },
    { id: 'echo', n: 'Echo chamber', d: 'Sociální struktura potlačující dissens.' },
    { id: 'filter', n: 'Filter bubble', d: 'Algoritmická epistemická izolace.' },
    { id: 'rad', n: 'Radikalizace', d: 'Pipeline od mírné po extrémní pozici.' },
    { id: 'trauma', n: 'Trauma', d: 'EA expozice produkuje C-PTSD profile.' },
    { id: 'cptsd', n: 'C-PTSD', d: 'Komplexní PTSD - typický post-EA výsledek.' },
    { id: 'recov', n: 'Zotavení', d: 'Multi-stádiový proces; viz Rekonstrukce.' },
    { id: 'stab', n: 'Stabilizace', d: 'První fáze zotavení; bezpečí + spánek + výživa.' }
  ];

  var EDGES = [
    ['ea', 'ka'], ['ea', 'tax'], ['ea', 'nabla'], ['ea', 'phen'], ['ea', 'rec'],
    ['ka', 'meta'], ['ka', 'herm'], ['meta', 'hyp'], ['herm', 'frame'], ['herm', 'lang'],
    ['tax', 'gas'], ['tax', 'iso'], ['tax', 'love'], ['tax', 'over'], ['tax', 'rec7'],
    ['nabla', 'dec'], ['dec', 'evid'], ['dec', 'truth'], ['phen', 'depers'], ['phen', 'derel'],
    ['rec', 'stab'], ['rec', 'recov'], ['rec', 'trauma'], ['trauma', 'cptsd'],
    ['mind', 'bite'], ['mind', 'thought'], ['mind', 'cult'], ['cult', 'iso'], ['cult', 'love'],
    ['cult', 'auth'], ['cult', 'doctr'], ['gas', 'doubt'], ['gas', 'depers'], ['lang', 'frame'],
    ['frame', 'manip'], ['manip', 'pers'], ['manip', 'coerc'], ['dis', 'mis'], ['dis', 'mal'],
    ['over', 'frag'], ['frag', 'rec7'], ['rec7', 'hyp'], ['hyp', 'ruml'], ['epi', 'aut'],
    ['epi', 'epi-iso'], ['epi-iso', 'echo'], ['echo', 'filter'], ['filter', 'rad'],
    ['rad', 'cult'], ['cog-bias', 'manip'], ['cog-bias', 'gas'], ['iden', 'phen'],
    ['iden', 'depers'], ['bel', 'epi'], ['bel', 'frame'], ['dec2', 'manip'],
    ['auth', 'doctr'], ['doctr', 'thought'], ['stab', 'recov']
  ];

  var sketch = function (p) {
    var nodes = [], W = 0, H = 600;
    var sel = null;

    p.setup = function () {
      W = host.clientWidth || 800;
      var cnv = p.createCanvas(W, H);
      cnv.parent(host);
      TERMS.forEach(function (t, i) {
        nodes.push({ id: t.id, label: t.n, def: t.d, x: W / 2 + Math.cos(i / TERMS.length * Math.PI * 2) * 200, y: H / 2 + Math.sin(i / TERMS.length * Math.PI * 2) * 200, vx: 0, vy: 0 });
      });
    };

    function adj(id) {
      var s = {};
      EDGES.forEach(function (e) { if (e[0] === id) s[e[1]] = 1; if (e[1] === id) s[e[0]] = 1; });
      return s;
    }

    p.draw = function () {
      p.background(15, 23, 42);

      // Force layout
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var a = nodes[i], b = nodes[j];
          var dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) + 0.1;
          var f = 800 / (d * d);
          a.vx -= dx / d * f; a.vy -= dy / d * f;
          b.vx += dx / d * f; b.vy += dy / d * f;
        }
      }
      EDGES.forEach(function (e) {
        var a = nodes.find(function (n) { return n.id === e[0]; });
        var b = nodes.find(function (n) { return n.id === e[1]; });
        if (!a || !b) return;
        var dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) + 0.1;
        var f = (d - 80) * 0.02;
        a.vx += dx / d * f; a.vy += dy / d * f;
        b.vx -= dx / d * f; b.vy -= dy / d * f;
      });
      nodes.forEach(function (n) {
        n.vx += (W / 2 - n.x) * 0.001; n.vy += (H / 2 - n.y) * 0.001;
        n.vx *= 0.85; n.vy *= 0.85;
        n.x += n.vx; n.y += n.vy;
        n.x = Math.max(20, Math.min(W - 20, n.x));
        n.y = Math.max(20, Math.min(H - 20, n.y));
      });

      var hi = sel ? adj(sel.id) : null;

      // Edges
      EDGES.forEach(function (e) {
        var a = nodes.find(function (n) { return n.id === e[0]; });
        var b = nodes.find(function (n) { return n.id === e[1]; });
        if (!a || !b) return;
        if (sel && (e[0] === sel.id || e[1] === sel.id)) p.stroke(251, 191, 36, 200);
        else p.stroke(71, 85, 105, 80);
        p.line(a.x, a.y, b.x, b.y);
      });

      // Nodes
      nodes.forEach(function (n) {
        var on = !sel || n.id === sel.id || (hi && hi[n.id]);
        p.noStroke();
        p.fill(on ? p.color(59, 130, 246) : p.color(71, 85, 105, 120));
        p.circle(n.x, n.y, on ? 14 : 8);
        if (on) {
          p.fill(226, 232, 240);
          p.textSize(10);
          p.textAlign(p.CENTER);
          p.text(n.label, n.x, n.y - 12);
        }
      });
    };

    p.mousePressed = function () {
      var hit = null, mind = 1e9;
      nodes.forEach(function (n) {
        var d = p.dist(p.mouseX, p.mouseY, n.x, n.y);
        if (d < 18 && d < mind) { mind = d; hit = n; }
      });
      if (hit) {
        sel = hit;
        var t = TERMS.find(function (x) { return x.id === hit.id; });
        while (detail.firstChild) detail.removeChild(detail.firstChild);
        var h = document.createElement('h4'); h.className = 'font-bold text-lg mb-2'; setText(h, t.n);
        var pp = document.createElement('p'); setText(pp, t.d);
        detail.appendChild(h); detail.appendChild(pp);
      }
    };

    p.windowResized = function () {
      W = host.clientWidth || 800;
      p.resizeCanvas(W, H);
    };
  };

  new p5(sketch);
  setText(detail, 'Klikni na uzel pro zvýraznění sousedních termínů + definici.');
})();
