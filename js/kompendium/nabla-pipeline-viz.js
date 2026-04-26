// NABLA Infinity 16-level pipeline — Three.js stacked rings + animated particle flow
(function() {
  'use strict';

  const LEVELS = [
    { id: 'L0',  name: 'Sensory Input',           desc: 'Surová senzorická data — text, image, audio, telemetry.' },
    { id: 'L1',  name: 'Perception',              desc: 'Tokenizace, entity detection, low-level feature extraction.' },
    { id: 'L2',  name: 'Pattern Recognition',     desc: 'Syntaktické a strukturální vzory — n-grams, embeddings.' },
    { id: 'L3',  name: 'Semantic Understanding',  desc: 'Sémantická interpretace — relace mezi koncepty.' },
    { id: 'L4',  name: 'Contextual Integration',  desc: 'Integrace kontextu — historie, situace, intent.' },
    { id: 'L5',  name: 'Inferential Reasoning',   desc: 'Deduktivní/induktivní/abduktivní inference.' },
    { id: 'L6',  name: 'Causal Modeling',         desc: 'Kauzální grafy, counterfactual reasoning.' },
    { id: 'L7',  name: 'Hypothesis Generation',   desc: 'Generování hypotéz s confidence scoring.' },
    { id: 'L8',  name: 'Evidence Evaluation',     desc: 'Vážení důkazů — Bayesian update, likelihood ratio.' },
    { id: 'L9',  name: 'Uncertainty Quantification', desc: 'Epistemická vs aleatorická nejistota, bootstrap CI.' },
    { id: 'L10', name: 'Meta-Reasoning',          desc: 'Reflexe nad reasoning procesem — bias detection.' },
    { id: 'L11', name: 'Calibration Loop',        desc: 'Brier score, ECE, drift detection, weight adaptation.' },
    { id: 'L12', name: 'Ethical Constraints',     desc: 'Aplikace etických filtrů — harm prevention, fairness.' },
    { id: 'L13', name: 'Decision Synthesis',      desc: 'Syntéza rozhodnutí přes scoring engine + intelligence strategies.' },
    { id: 'L14', name: 'Explanation Generation',  desc: 'Traceable reasoning trace — auditovatelný výklad.' },
    { id: 'L15', name: 'Action / Output',         desc: 'Finální akce — recommendation, alert, autonomous step.' }
  ];

  let highlightedIndex = -1;

  function setDetail(container, idx) {
    while (container.firstChild) container.removeChild(container.firstChild);
    const lvl = LEVELS[idx];
    const h = document.createElement('h3');
    h.className = 'text-lg font-bold text-slate-100';
    h.textContent = lvl.id + ' — ' + lvl.name;
    container.appendChild(h);
    const p = document.createElement('p');
    p.className = 'text-slate-300 mt-1';
    p.textContent = lvl.desc;
    container.appendChild(p);
    const meta = document.createElement('p');
    meta.className = 'text-slate-400 text-xs mt-2';
    meta.textContent = 'Úroveň ' + (idx + 1) + ' z 16 v NABLA Infinity pipeline';
    container.appendChild(meta);
  }

  function levelColor(idx) {
    // Gradient: deep blue (L0) → cyan → green → yellow → red (L15)
    const t = idx / 15;
    if (t < 0.33) {
      const k = t / 0.33;
      return new THREE.Color(0.1 + k * 0.0, 0.2 + k * 0.6, 0.6 + k * 0.4);
    } else if (t < 0.66) {
      const k = (t - 0.33) / 0.33;
      return new THREE.Color(0.1 + k * 0.5, 0.8, 0.7 - k * 0.5);
    } else {
      const k = (t - 0.66) / 0.34;
      return new THREE.Color(0.6 + k * 0.4, 0.8 - k * 0.5, 0.2 - k * 0.1);
    }
  }

  function init() {
    const container = document.getElementById('nabla-pipeline-viz');
    if (!container || typeof THREE === 'undefined') return;
    const detail = document.getElementById('nabla-pipeline-detail');

    const W = container.clientWidth || 800;
    const H = 600;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 1000);
    camera.position.set(15, 8, 18);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Build 16 stacked rings
    const rings = [];
    const RING_SPACING = 0.9;
    const RING_RADIUS = 5;
    const RING_TUBE = 0.18;
    const TOTAL_HEIGHT = LEVELS.length * RING_SPACING;
    const Y_OFFSET = -TOTAL_HEIGHT / 2 + RING_SPACING / 2;

    LEVELS.forEach((lvl, i) => {
      const color = levelColor(i);
      const geom = new THREE.TorusGeometry(RING_RADIUS, RING_TUBE, 16, 64);
      const mat = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.35,
        transparent: true,
        opacity: 0.55,
        metalness: 0.2,
        roughness: 0.4
      });
      const ring = new THREE.Mesh(geom, mat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = Y_OFFSET + i * RING_SPACING;
      ring.userData = { index: i, baseColor: color.clone(), baseOpacity: 0.55 };
      scene.add(ring);
      rings.push(ring);

      // Text label sprite
      const canvas2d = document.createElement('canvas');
      canvas2d.width = 256;
      canvas2d.height = 64;
      const ctx = canvas2d.getContext('2d');
      ctx.fillStyle = 'rgba(15,23,42,0.85)';
      ctx.fillRect(0, 0, 256, 64);
      ctx.fillStyle = '#f1f5f9';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(lvl.id + '  ' + lvl.name, 12, 40);
      const tex = new THREE.CanvasTexture(canvas2d);
      tex.needsUpdate = true;
      const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(RING_RADIUS + 3, ring.position.y, 0);
      sprite.scale.set(4, 1, 1);
      scene.add(sprite);
    });

    // Particle pool flowing between adjacent levels
    const PARTICLE_COUNT = 30;
    const particles = [];
    const partGeom = new THREE.SphereGeometry(0.08, 8, 8);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const startLevel = Math.floor(Math.random() * (LEVELS.length - 1));
      const angle = Math.random() * Math.PI * 2;
      const partMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const part = new THREE.Mesh(partGeom, partMat);
      part.userData = {
        startLevel: startLevel,
        progress: Math.random(),
        speed: 0.004 + Math.random() * 0.006,
        angle: angle
      };
      scene.add(part);
      particles.push(part);
    }

    function updateParticles() {
      particles.forEach((p) => {
        const ud = p.userData;
        ud.progress += ud.speed;
        if (ud.progress >= 1) {
          ud.progress = 0;
          ud.startLevel = (ud.startLevel + 1) % (LEVELS.length - 1);
          ud.angle = Math.random() * Math.PI * 2;
        }
        const startY = Y_OFFSET + ud.startLevel * RING_SPACING;
        const endY = Y_OFFSET + (ud.startLevel + 1) * RING_SPACING;
        const y = startY + (endY - startY) * ud.progress;
        const radius = RING_RADIUS * (1 - 0.15 * Math.sin(ud.progress * Math.PI));
        p.position.set(
          Math.cos(ud.angle) * radius,
          y,
          Math.sin(ud.angle) * radius
        );
        const c = levelColor(ud.startLevel);
        p.material.color.copy(c);
      });
    }

    // Click → highlight ring
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    renderer.domElement.addEventListener('click', (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(rings);
      if (hits.length && detail) {
        const idx = hits[0].object.userData.index;
        highlightedIndex = idx;
        setDetail(detail, idx);
        rings.forEach((r, i) => {
          if (i === idx) {
            r.material.opacity = 0.95;
            r.material.emissiveIntensity = 0.9;
          } else {
            r.material.opacity = r.userData.baseOpacity;
            r.material.emissiveIntensity = 0.35;
          }
        });
      }
    });

    // Hover cursor change
    renderer.domElement.addEventListener('mousemove', (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      renderer.domElement.style.cursor = raycaster.intersectObjects(rings).length ? 'pointer' : 'default';
    });

    let theta = 0;
    function animate() {
      requestAnimationFrame(animate);
      theta += 0.0025;
      camera.position.x = Math.cos(theta) * 22;
      camera.position.z = Math.sin(theta) * 22;
      camera.lookAt(0, 0, 0);
      updateParticles();
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
