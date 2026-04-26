// Protocol decision tree (Three.js 4-level 3D)
(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;
  var container = document.getElementById('protocol-decision-tree');
  var detail = document.getElementById('protocol-tree-detail');
  if (!container || !detail) return;

  function setText(el, t) { while (el.firstChild) el.removeChild(el.firstChild); el.appendChild(document.createTextNode(t)); }

  // Tree definition: 4 levels
  var TREE = [
    { id: 'root', lvl: 0, label: 'Detekce EA', x: 0, y: 6, z: 0, parent: null,
      info: 'Vstupní bod - klinické nebo vyšetřovací podezření na epistemickou anihilaci.' },
    { id: 'low', lvl: 1, label: 'Nízká (1-2)', x: -6, y: 3, z: 0, parent: 'root',
      info: 'Mírné fragmentace, zachovaná metakognice. Watchful waiting + psychoedukace.' },
    { id: 'mid', lvl: 1, label: 'Střední (3)', x: 0, y: 3, z: 0, parent: 'root',
      info: 'Aktivní symptomy, narušená koherence. Strukturovaná intervence.' },
    { id: 'high', lvl: 1, label: 'Vysoká (4-5)', x: 6, y: 3, z: 0, parent: 'root',
      info: 'Akutní krize, riziko sebepoškození. Stabilizace + krizová síť.' },
    { id: 'low-mon', lvl: 2, label: 'Monitoring', x: -7.5, y: 0, z: 0, parent: 'low',
      info: 'Týdenní self-report, sledování spánku/příjmu, sociálního zapojení.' },
    { id: 'low-edu', lvl: 2, label: 'Psychoedukace', x: -4.5, y: 0, z: 0, parent: 'low',
      info: 'Vysvětlení mechanismu manipulace, identifikace zranitelnosti, bibliografie.' },
    { id: 'mid-cog', lvl: 2, label: 'Kognitivní rekonstrukce', x: -1.5, y: 0, z: 0, parent: 'mid',
      info: 'Strukturovaná CBT-E protokol, identifikace zakotvujících přesvědčení.' },
    { id: 'mid-her', lvl: 2, label: 'Hermeneutická práce', x: 1.5, y: 0, z: 0, parent: 'mid',
      info: 'Reinterpretace narativu, obnova autorství, fenomenologické rozhovory.' },
    { id: 'high-stab', lvl: 2, label: 'Stabilizace', x: 4.5, y: 0, z: 0, parent: 'high',
      info: 'Bezpečnostní plán, separace od manipulátora, lékařské konzilium.' },
    { id: 'high-net', lvl: 2, label: 'Krizová síť', x: 7.5, y: 0, z: 0, parent: 'high',
      info: 'Rodina, právní zastoupení, deprogramming specialista, komunita ex-členů.' },
    { id: 'l3-1', lvl: 3, label: 'Self-monit. deník', x: -7.5, y: -3, z: 0, parent: 'low-mon',
      info: 'Denní záznam triggerů, emocí, somatických projevů; měsíční review s klinikem.' },
    { id: 'l3-2', lvl: 3, label: 'Psychoeduk. modul', x: -4.5, y: -3, z: 0, parent: 'low-edu',
      info: '8-týdenní program: manipulace, kognitivní zkreslení, kritické myšlení, reflexe.' },
    { id: 'l3-3', lvl: 3, label: 'CBT-E 12 sezení', x: -1.5, y: -3, z: 0, parent: 'mid-cog',
      info: 'Manualizovaný protokol pro post-coercive recovery; 12×60 min, behaviorální experimenty.' },
    { id: 'l3-4', lvl: 3, label: 'Narrative re-authoring', x: 1.5, y: -3, z: 0, parent: 'mid-her',
      info: 'White & Epston metoda - externalizace problému, mapování unikátních výsledků.' },
    { id: 'l3-5', lvl: 3, label: 'Akutní intervence', x: 4.5, y: -3, z: 0, parent: 'high-stab',
      info: 'Hospitalizace nebo intenzivní ambulantní program, medikace anxiolytik PRN.' },
    { id: 'l3-6', lvl: 3, label: 'Multi-disc. tým', x: 7.5, y: -3, z: 0, parent: 'high-net',
      info: 'Psychiatr + právník + sociální pracovník + ex-člen mentor; eskalace dle potřeby.' }
  ];

  var w = container.clientWidth || 800, h = 500;
  var scene = new THREE.Scene(); scene.background = new THREE.Color(0x0f172a);
  var camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 200);
  camera.position.set(0, 0, 18);
  var renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(w, h);
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  var dl = new THREE.DirectionalLight(0xffffff, 0.8); dl.position.set(5, 10, 7); scene.add(dl);

  var LVLCOLOR = [0xef4444, 0xf59e0b, 0x3b82f6, 0x10b981];
  var nodes = [];
  TREE.forEach(function (n) {
    var geo = new THREE.SphereGeometry(0.55, 24, 24);
    var mat = new THREE.MeshPhongMaterial({ color: LVLCOLOR[n.lvl], emissive: LVLCOLOR[n.lvl], emissiveIntensity: 0.25 });
    var m = new THREE.Mesh(geo, mat);
    m.position.set(n.x, n.y, n.z);
    m.userData = n;
    scene.add(m);
    nodes.push(m);
  });

  var lineMat = new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.5 });
  var highlightMat = new THREE.LineBasicMaterial({ color: 0xfbbf24, linewidth: 3 });
  var lines = [];
  TREE.forEach(function (n) {
    if (!n.parent) return;
    var p = TREE.find(function (x) { return x.id === n.parent; });
    var g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(p.x, p.y, p.z), new THREE.Vector3(n.x, n.y, n.z)]);
    var l = new THREE.Line(g, lineMat.clone());
    l.userData = { from: p.id, to: n.id };
    scene.add(l);
    lines.push(l);
  });

  var raycaster = new THREE.Raycaster(); var mouse = new THREE.Vector2();
  renderer.domElement.addEventListener('click', function (ev) {
    var r = renderer.domElement.getBoundingClientRect();
    mouse.x = ((ev.clientX - r.left) / r.width) * 2 - 1;
    mouse.y = -((ev.clientY - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    var hits = raycaster.intersectObjects(nodes);
    if (hits.length) highlight(hits[0].object.userData);
  });

  function highlight(node) {
    var path = []; var cur = node;
    while (cur) { path.push(cur.id); cur = cur.parent ? TREE.find(function (x) { return x.id === cur.parent; }) : null; }
    nodes.forEach(function (m) { m.material.emissiveIntensity = path.indexOf(m.userData.id) >= 0 ? 0.8 : 0.15; });
    lines.forEach(function (l) { l.material.color.setHex(path.indexOf(l.userData.to) >= 0 && path.indexOf(l.userData.from) >= 0 ? 0xfbbf24 : 0x475569); });
    while (detail.firstChild) detail.removeChild(detail.firstChild);
    var h2 = document.createElement('h4'); h2.className = 'font-bold text-lg mb-2'; setText(h2, node.label);
    var lvl = document.createElement('p'); lvl.className = 'text-xs text-slate-400 mb-2'; setText(lvl, 'Úroveň ' + node.lvl + ' · ' + ['detekce', 'severity', 'protokol', 'intervence'][node.lvl]);
    var p = document.createElement('p'); setText(p, node.info);
    detail.appendChild(h2); detail.appendChild(lvl); detail.appendChild(p);
  }

  function loop() { requestAnimationFrame(loop); scene.rotation.y += 0.001; renderer.render(scene, camera); }
  loop();
  setText(detail, 'Klikni na uzel pro zvýraznění cesty rozhodnutí + detail intervence.');
})();
