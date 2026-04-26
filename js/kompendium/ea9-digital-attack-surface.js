// EA-9 Digital Attack Surface — Three.js sphere with attack vectors
(function() {
  'use strict';
  const VECTORS = [
    { id: 'EA-9.1', label: 'Algoritmická amplifikace', cat: 0 },
    { id: 'EA-9.2', label: 'Echo chambers', cat: 0 },
    { id: 'EA-9.3', label: 'Filter bubbles', cat: 0 },
    { id: 'EA-9.4', label: 'Doomscroll loop', cat: 0 },
    { id: 'EA-9.5', label: 'Engagement bait', cat: 0 },
    { id: 'EA-9.6', label: 'Variable rewards', cat: 0 },
    { id: 'EA-9.7', label: 'Push notifikace', cat: 0 },
    { id: 'EA-9.8', label: 'FOMO design', cat: 0 },
    { id: 'EA-9.9', label: 'Social proof manipulation', cat: 0 },
    { id: 'EA-9.10', label: 'Astroturfing', cat: 1 },
    { id: 'EA-9.11', label: 'Sock puppet networks', cat: 1 },
    { id: 'EA-9.12', label: 'Coordinated inauthentic', cat: 1 },
    { id: 'EA-9.13', label: 'Bot amplification', cat: 1 },
    { id: 'EA-9.14', label: 'Dogpiling', cat: 1 },
    { id: 'EA-9.15', label: 'Mass reporting', cat: 1 },
    { id: 'EA-9.16', label: 'Brigading', cat: 1 },
    { id: 'EA-9.17', label: 'Doxxing', cat: 1 },
    { id: 'EA-9.18', label: 'SWATting', cat: 1 },
    { id: 'EA-9.19', label: 'Deepfake video', cat: 2 },
    { id: 'EA-9.20', label: 'Voice cloning', cat: 2 },
    { id: 'EA-9.21', label: 'AI-generated text', cat: 2 },
    { id: 'EA-9.22', label: 'Synthetic identity', cat: 2 },
    { id: 'EA-9.23', label: 'GAN imagery', cat: 2 },
    { id: 'EA-9.24', label: 'LLM persuasion', cat: 2 },
    { id: 'EA-9.25', label: 'Personalized propaganda', cat: 2 },
    { id: 'EA-9.26', label: 'Adversarial prompts', cat: 2 },
    { id: 'EA-9.27', label: 'Memetic engineering', cat: 3 },
    { id: 'EA-9.28', label: 'Viral mutation', cat: 3 },
    { id: 'EA-9.29', label: 'Symbolic capture', cat: 3 },
    { id: 'EA-9.30', label: 'Lexical poisoning', cat: 3 },
    { id: 'EA-9.31', label: 'Frame collision', cat: 3 },
    { id: 'EA-9.32', label: 'Narrative warfare', cat: 3 },
    { id: 'EA-9.33', label: 'Reality consensus attack', cat: 3 },
    { id: 'EA-9.34', label: 'Gaslighting at scale', cat: 3 },
    { id: 'EA-9.35', label: 'Truth decay', cat: 3 },
    { id: 'EA-9.36', label: 'Epistemic flooding', cat: 4 },
    { id: 'EA-9.37', label: 'Firehose of falsehood', cat: 4 },
    { id: 'EA-9.38', label: 'Whataboutism cascade', cat: 4 },
    { id: 'EA-9.39', label: 'Source confusion', cat: 4 },
    { id: 'EA-9.40', label: 'Citation laundering', cat: 4 },
    { id: 'EA-9.41', label: 'Context collapse', cat: 4 },
    { id: 'EA-9.42', label: 'Quote mining', cat: 4 },
    { id: 'EA-9.43', label: 'Out-of-context clips', cat: 4 },
    { id: 'EA-9.44', label: 'Selective leaking', cat: 4 },
    { id: 'EA-9.45', label: 'Flooding the zone', cat: 4 },
    { id: 'EA-9.46', label: 'Search SEO poisoning', cat: 5 },
    { id: 'EA-9.47', label: 'Wiki manipulation', cat: 5 },
    { id: 'EA-9.48', label: 'Recommendation hijack', cat: 5 },
    { id: 'EA-9.49', label: 'Trending hijack', cat: 5 },
    { id: 'EA-9.50', label: 'Hashtag flooding', cat: 5 },
    { id: 'EA-9.51', label: 'Comment derailing', cat: 5 },
    { id: 'EA-9.52', label: 'Review bombing', cat: 5 },
    { id: 'EA-9.53', label: 'Rating manipulation', cat: 5 },
    { id: 'EA-9.54', label: 'Targeted harassment', cat: 5 },
    { id: 'EA-9.55', label: 'Cancel campaigns', cat: 5 },
    { id: 'EA-9.56', label: 'Reputation laundering', cat: 5 },
    { id: 'EA-9.57', label: 'Memory hole edits', cat: 5 },
    { id: 'EA-9.58', label: 'Platform migration coercion', cat: 5 },
    { id: 'EA-9.59', label: 'Cross-platform pile-on', cat: 5 },
    { id: 'EA-9.60', label: 'Total attention capture', cat: 5 }
  ];
  const CAT_COLORS = [0x3b82f6, 0xef4444, 0xa855f7, 0xf59e0b, 0x10b981, 0xec4899];
  const CAT_NAMES = ['Algoritmická manipulace', 'Koordinované útoky', 'AI/Synthetic', 'Memetická válka', 'Epistemické zaplavení', 'Platform exploit'];

  function buildDetail(container, vec) {
    while (container.firstChild) container.removeChild(container.firstChild);
    const h = document.createElement('h3');
    h.className = 'text-lg font-bold text-red-300';
    h.textContent = vec.id + ' — ' + vec.label;
    const p = document.createElement('p');
    p.className = 'text-slate-300 mt-1 text-sm';
    p.textContent = 'Kategorie: ' + CAT_NAMES[vec.cat];
    const a = document.createElement('a');
    a.href = '/kompendium/techniques/';
    a.className = 'text-blue-400 underline mt-2 inline-block';
    a.textContent = '→ taxonomie EA-9';
    container.appendChild(h);
    container.appendChild(p);
    container.appendChild(a);
  }

  function init() {
    const container = document.getElementById('ea9-attack-surface');
    const detail = document.getElementById('ea9-attack-detail');
    if (!container || typeof THREE === 'undefined') return;
    const W = container.clientWidth || 800, H = 500;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
    camera.position.z = 18;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    container.appendChild(renderer.domElement);

    // Central sphere = epistemic surface
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(4, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x1e293b, wireframe: true, transparent: true, opacity: 0.6 })
    );
    scene.add(sphere);

    const lines = [];
    const tips = [];
    VECTORS.forEach((v, i) => {
      const phi = Math.acos(-1 + (2 * i) / VECTORS.length);
      const theta = Math.sqrt(VECTORS.length * Math.PI) * phi;
      const outR = 11;
      const x = outR * Math.cos(theta) * Math.sin(phi);
      const y = outR * Math.sin(theta) * Math.sin(phi);
      const z = outR * Math.cos(phi);
      const inR = 4.1;
      const xi = inR * Math.cos(theta) * Math.sin(phi);
      const yi = inR * Math.sin(theta) * Math.sin(phi);
      const zi = inR * Math.cos(phi);
      const geom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, y, z),
        new THREE.Vector3(xi, yi, zi)
      ]);
      const mat = new THREE.LineBasicMaterial({ color: CAT_COLORS[v.cat], transparent: true, opacity: 0.7 });
      const line = new THREE.Line(geom, mat);
      scene.add(line);
      lines.push(line);
      const tip = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 8, 8),
        new THREE.MeshBasicMaterial({ color: CAT_COLORS[v.cat] })
      );
      tip.position.set(x, y, z);
      tip.userData = v;
      scene.add(tip);
      tips.push(tip);
    });

    const ray = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    renderer.domElement.addEventListener('click', function(e) {
      const r = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      ray.setFromCamera(mouse, camera);
      const hits = ray.intersectObjects(tips);
      if (hits.length > 0 && detail) buildDetail(detail, hits[0].object.userData);
    });

    let t = 0;
    function animate() {
      requestAnimationFrame(animate);
      t += 0.003;
      sphere.rotation.y = t;
      scene.rotation.y = t * 0.3;
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
