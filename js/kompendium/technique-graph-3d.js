// EA Technique 3D Graph — Three.js force-layout + click → safe DOM detail
(function() {
  'use strict';
  const NODES = [
    { id: 'EA-1.1.1', label: 'Selektivní expozice', cat: 0 },
    { id: 'EA-1.1.2', label: 'Informační přetížení', cat: 0 },
    { id: 'EA-1.1.3', label: 'Term. mystifikace', cat: 0 },
    { id: 'EA-1.2.1', label: 'Falešné dilema', cat: 0 },
    { id: 'EA-1.2.2', label: 'Falešná ekvivalence', cat: 0 },
    { id: 'EA-1.2.3', label: 'Iluzorní komplexita', cat: 0 },
    { id: 'EA-1.3.1', label: 'Imunizace', cat: 0 },
    { id: 'EA-1.3.2', label: 'Reinterpretace', cat: 0 },
    { id: 'EA-1.3.3', label: 'Tematická diverze', cat: 0 },
    { id: 'EA-1.4.1', label: 'Prosodická dominance', cat: 0 },
    { id: 'EA-1.4.2', label: 'Latentní emoce', cat: 0 },
    { id: 'EA-1.5.1', label: 'Proxemika', cat: 0 },
    { id: 'EA-1.5.2', label: 'Tělesné hieroglyfy', cat: 0 },
    { id: 'EA-5.1.1', label: 'Kanibalizace', cat: 1 },
    { id: 'EA-5.1.2', label: 'Konceptuální nihilace', cat: 1 },
    { id: 'EA-5.1.3', label: 'Reflexivní paradoxie', cat: 1 },
    { id: 'EA-5.2.1', label: 'Meta-epist. inverze', cat: 2 },
    { id: 'EA-5.2.10', label: 'Metakogn. singularita', cat: 2 }
  ];
  const COLORS = [0x3b82f6, 0xef4444, 0xdc2626];

  function buildDetail(container, node) {
    while (container.firstChild) container.removeChild(container.firstChild);
    const h = document.createElement('h3');
    h.className = 'text-lg font-bold text-slate-100';
    h.textContent = node.id;
    const p = document.createElement('p');
    p.className = 'text-slate-300 mt-1';
    p.textContent = node.label;
    const a = document.createElement('a');
    a.href = '/kompendium/techniques/';
    a.className = 'text-blue-400 underline';
    a.textContent = '→ otevřít článek';
    container.appendChild(h);
    container.appendChild(p);
    container.appendChild(a);
  }

  function init() {
    const container = document.getElementById('technique-graph-3d');
    if (!container || typeof THREE === 'undefined') return;
    const W = container.clientWidth || 800, H = 500;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
    camera.position.z = 12;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    container.appendChild(renderer.domElement);
    const meshes = [];
    NODES.forEach((n, i) => {
      const phi = Math.acos(-1 + (2 * i) / NODES.length);
      const theta = Math.sqrt(NODES.length * Math.PI) * phi;
      const r = 6;
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 16, 16),
        new THREE.MeshStandardMaterial({ color: COLORS[n.cat], emissive: COLORS[n.cat], emissiveIntensity: 0.4 })
      );
      mesh.position.set(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
      mesh.userData = n;
      scene.add(mesh);
      meshes.push(mesh);
    });
    for (let i = 0; i < 12; i++) {
      const g = new THREE.BufferGeometry().setFromPoints([meshes[i].position, meshes[i + 1].position]);
      scene.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0x475569, opacity: 0.4, transparent: true })));
    }
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const light = new THREE.PointLight(0xffffff, 1.0, 100);
    light.position.set(10, 10, 10);
    scene.add(light);
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const detail = document.getElementById('graph-detail');
    container.addEventListener('click', (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(meshes);
      if (hits.length && detail) buildDetail(detail, hits[0].object.userData);
    });
    let t = 0;
    function animate() {
      requestAnimationFrame(animate);
      t += 0.003;
      scene.rotation.y = t;
      renderer.render(scene, camera);
    }
    animate();
    window.addEventListener('resize', () => {
      const w = container.clientWidth || 800;
      renderer.setSize(w, H);
      camera.aspect = w / H;
      camera.updateProjectionMatrix();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
