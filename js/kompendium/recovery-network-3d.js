// Recovery Protocol Network — Three.js 3D node graph (30 nodes, phase-colored)
(function() {
  'use strict';
  // phases: 0=acute, 1=subacute, 2=midterm, 3=longterm, 4=special
  const NODES = [
    { id: 'P1', label: 'Bezpečné prostředí', phase: 0, desc: 'Izolace od zdroje EA, no-contact protokol' },
    { id: 'P2', label: 'Krizová stabilizace', phase: 0, desc: 'Akutní psychiatrie, anxiolýza, sleep restoration' },
    { id: 'P3', label: 'Triage assessment', phase: 0, desc: 'BPRS, EA Severity Index, riziko sebevraždy' },
    { id: 'P4', label: 'Somatic resourcing', phase: 0, desc: 'Grounding, polyvagální regulace, breath work' },
    { id: 'P5', label: 'Trauma psychoedukace', phase: 0, desc: 'Pojmenování EA dynamiky, normalizace reakcí' },
    { id: 'P6', label: 'Validace zkušenosti', phase: 1, desc: 'Hermeneutická validace bez gaslightingu' },
    { id: 'P7', label: 'Detekce reziduálních technik', phase: 1, desc: 'Mapování internalizovaných EA vzorců' },
    { id: 'P8', label: 'Metakogn. trénink', phase: 1, desc: 'Rozpoznávání vlastních myšlenek vs. implantátů' },
    { id: 'P9', label: 'Identitní inventář', phase: 1, desc: 'Pre-EA vs. post-EA self mapping' },
    { id: 'P10', label: 'Sociální remediace', phase: 1, desc: 'Reintegrace do podpůrných sítí' },
    { id: 'P11', label: 'Kognitivní rekonstrukce', phase: 2, desc: 'Vyšetření základních epistemických přesvědčení' },
    { id: 'P12', label: 'Hermeneutická obnova', phase: 2, desc: 'Rekonstrukce smyslu, výkladová suverenita' },
    { id: 'P13', label: 'Narrative therapy', phase: 2, desc: 'Re-authoring vlastního příběhu' },
    { id: 'P14', label: 'EMDR / brainspotting', phase: 2, desc: 'Bilaterální stimulace pro trauma processing' },
    { id: 'P15', label: 'Schema therapy', phase: 2, desc: 'Práce s ranými maladaptivními schématy' },
    { id: 'P16', label: 'Hodnotová obnova', phase: 2, desc: 'ACT-style rekonstrukce hodnot' },
    { id: 'P17', label: 'Vztahový retraining', phase: 3, desc: 'Bezpečné vazby, re-attachment' },
    { id: 'P18', label: 'Komunita přeživších', phase: 3, desc: 'Peer support, sdílená zkušenost' },
    { id: 'P19', label: 'Profesní rehabilitace', phase: 3, desc: 'Návrat k práci/studiu po cognitive restoration' },
    { id: 'P20', label: 'Rodinná terapie', phase: 3, desc: 'Re-integrace s rodinou, oprava dynamiky' },
    { id: 'P21', label: 'Spirituální obnova', phase: 3, desc: 'Pokud relevantní, mimo původní zneužívající strukturu' },
    { id: 'P22', label: 'Integrace zkušenosti', phase: 3, desc: 'Post-traumatic growth, smyslová syntéza' },
    { id: 'P23', label: 'Periodické re-assessment', phase: 3, desc: 'Sledování relapsů, longitudinální follow-up' },
    { id: 'P24', label: 'Kult-specifická exitová terapie', phase: 4, desc: 'Steven Hassan BITE model deconditioning' },
    { id: 'P25', label: 'Domácí násilí protokol', phase: 4, desc: 'Coercive control framework, právní podpora' },
    { id: 'P26', label: 'Workplace EA recovery', phase: 4, desc: 'Mobbing/gaslighting workplace, HR procesy' },
    { id: 'P27', label: 'Online harassment recovery', phase: 4, desc: 'Digitální detox, OPSEC, identity hardening' },
    { id: 'P28', label: 'Politická rekonstrukce', phase: 4, desc: 'Po totalitní expozici, dezinformační prostředí' },
    { id: 'P29', label: 'Pediatric EA recovery', phase: 4, desc: 'Děti vystavené v rodině/sektě, vývojová úskalí' },
    { id: 'P30', label: 'Komplexní PTSD program', phase: 4, desc: 'Multi-modal stepped care pro c-PTSD' }
  ];
  // Sequential dependencies (acute → subacute → midterm → longterm → special)
  const EDGES = [
    [0,1],[0,2],[1,3],[2,3],[2,4],[3,5],[4,5],
    [5,6],[6,7],[7,8],[6,9],[8,10],
    [10,11],[10,12],[11,13],[12,13],[13,14],[14,15],
    [15,16],[16,17],[15,18],[17,19],[18,20],[19,21],[21,22],
    [22,23],[22,24],[22,25],[22,26],[22,27],[22,28],[22,29]
  ];
  const PHASE_COLORS = [0xef4444, 0xf59e0b, 0x3b82f6, 0x10b981, 0xa855f7];
  const PHASE_NAMES = ['Akutní (0-14d)', 'Subakutní (2-12w)', 'Středně-doba (3-12m)', 'Dlouhodobá (>12m)', 'Speciální'];

  function buildDetail(container, node) {
    while (container.firstChild) container.removeChild(container.firstChild);
    const h = document.createElement('h3');
    h.className = 'text-lg font-bold text-emerald-300';
    h.textContent = node.id + ' — ' + node.label;
    const phase = document.createElement('p');
    phase.className = 'text-slate-400 mt-1 text-sm';
    phase.textContent = 'Fáze: ' + PHASE_NAMES[node.phase];
    const p = document.createElement('p');
    p.className = 'text-slate-300 mt-2';
    p.textContent = node.desc;
    const a = document.createElement('a');
    a.href = '/kompendium/recovery/';
    a.className = 'text-blue-400 underline mt-2 inline-block';
    a.textContent = '→ recovery protokoly';
    container.appendChild(h);
    container.appendChild(phase);
    container.appendChild(p);
    container.appendChild(a);
  }

  function init() {
    const container = document.getElementById('recovery-network-3d');
    const detail = document.getElementById('recovery-network-detail');
    if (!container || typeof THREE === 'undefined') return;
    const W = container.clientWidth || 800, H = 550;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 1000);
    camera.position.z = 18;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    container.appendChild(renderer.domElement);

    // Position nodes by phase along Y axis, distribute X/Z
    const positions = NODES.map((n) => {
      const phaseY = (n.phase - 2) * 3.5;
      const peers = NODES.filter(x => x.phase === n.phase);
      const idx = peers.indexOf(n);
      const angle = (idx / peers.length) * Math.PI * 2;
      const r = 5 + (n.phase % 2) * 1.5;
      return new THREE.Vector3(
        r * Math.cos(angle),
        phaseY + (Math.random() - 0.5) * 0.8,
        r * Math.sin(angle)
      );
    });

    const meshes = [];
    NODES.forEach((n, i) => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 16, 16),
        new THREE.MeshBasicMaterial({ color: PHASE_COLORS[n.phase] })
      );
      mesh.position.copy(positions[i]);
      mesh.userData = n;
      scene.add(mesh);
      meshes.push(mesh);
    });

    // Edges
    EDGES.forEach(([a, b]) => {
      const geom = new THREE.BufferGeometry().setFromPoints([positions[a], positions[b]]);
      const mat = new THREE.LineBasicMaterial({
        color: PHASE_COLORS[NODES[a].phase],
        transparent: true, opacity: 0.45
      });
      scene.add(new THREE.Line(geom, mat));
    });

    const ray = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    renderer.domElement.addEventListener('click', function(e) {
      const r = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      ray.setFromCamera(mouse, camera);
      const hits = ray.intersectObjects(meshes);
      if (hits.length > 0 && detail) buildDetail(detail, hits[0].object.userData);
    });

    let t = 0;
    function animate() {
      requestAnimationFrame(animate);
      t += 0.002;
      scene.rotation.y = t;
      renderer.render(scene, camera);
    }
    animate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
