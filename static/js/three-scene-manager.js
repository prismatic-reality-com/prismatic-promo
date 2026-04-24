/**
 * three-scene-manager.js — Declarative three.js scene renderer.
 *
 * Scans the page for `[data-three-scene]` nodes, reads the scene type and
 * optional config from data-attributes, and renders a WebGL canvas. Each
 * scene preset is small and self-contained so articles can drop in a scene
 * with a single macro call.
 *
 * Usage:
 *
 *   <div data-three-scene="network-graph"
 *        data-three-nodes="30"
 *        data-three-edges="45"
 *        class="h-80 w-full rounded-xl border border-gray-800 bg-gray-950"></div>
 *
 * Presets:
 *   - network-graph:   animated 3D force graph (good for agent-network articles)
 *   - particles:       drifting particle field (background ambience)
 *   - rotating-sphere: wireframe sphere with slow rotation (abstract concept)
 *   - mycelium:        slow-branching 3D network (signature visual for mycelial articles)
 *
 * Design notes:
 *   - Graceful degradation: if three.js isn't loaded (SES lockdown, slow
 *     network, offline), the placeholder div stays put — scenes opt in.
 *   - One renderer per container. Cleaned up on `beforeunload`.
 *   - Respects prefers-reduced-motion by freezing animation frames.
 */
(function () {
  'use strict';

  if (typeof THREE === 'undefined') {
    console.warn('[three-scene-manager] THREE not available');
    return;
  }

  var scenes = [];
  var reduceMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function clearChildren(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function setupScene(el) {
    var preset = el.dataset.threeScene;
    if (!preset) return;

    var rect = el.getBoundingClientRect();
    var width = rect.width || el.offsetWidth || 600;
    var height = rect.height || el.offsetHeight || 400;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    var renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // Remove placeholder content only after renderer is ready
    clearChildren(el);
    el.appendChild(renderer.domElement);

    var state = buildPreset(preset, scene, camera, el);
    if (!state) {
      console.warn('[three-scene-manager] Unknown preset:', preset);
      return;
    }

    var animationId = null;

    function animate() {
      animationId = requestAnimationFrame(animate);
      if (state.update) state.update();
      renderer.render(scene, camera);
    }

    if (reduceMotion && state.update) {
      renderer.render(scene, camera);
    } else {
      animate();
    }

    function onResize() {
      var r = el.getBoundingClientRect();
      var w = r.width || el.offsetWidth;
      var h = r.height || el.offsetHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }

    window.addEventListener('resize', onResize);

    scenes.push({
      el: el,
      dispose: function () {
        if (animationId) cancelAnimationFrame(animationId);
        window.removeEventListener('resize', onResize);
        renderer.dispose();
      },
    });
  }

  function buildPreset(preset, scene, camera, el) {
    switch (preset) {
      case 'network-graph':
        return presetNetworkGraph(scene, camera, el);
      case 'particles':
        return presetParticles(scene, camera);
      case 'rotating-sphere':
        return presetRotatingSphere(scene, camera);
      case 'mycelium':
        return presetMycelium(scene, camera);
      default:
        return null;
    }
  }

  // ── Presets ────────────────────────────────────────────────────────────────

  function presetNetworkGraph(scene, camera, el) {
    var nodeCount = parseInt(el.dataset.threeNodes, 10) || 30;
    var edgeCount = parseInt(el.dataset.threeEdges, 10) || 45;

    camera.position.z = 60;

    var group = new THREE.Group();
    scene.add(group);

    var nodeGeom = new THREE.SphereGeometry(0.6, 12, 12);
    var nodeMat = new THREE.MeshBasicMaterial({ color: 0x818cf8 });
    var nodes = [];

    for (var i = 0; i < nodeCount; i++) {
      var m = new THREE.Mesh(nodeGeom, nodeMat);
      m.position.set(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40,
      );
      group.add(m);
      nodes.push(m);
    }

    var lineMat = new THREE.LineBasicMaterial({ color: 0x4f46e5, opacity: 0.35, transparent: true });
    for (var j = 0; j < edgeCount; j++) {
      var a = nodes[Math.floor(Math.random() * nodes.length)];
      var b = nodes[Math.floor(Math.random() * nodes.length)];
      if (a === b) continue;
      var geom = new THREE.BufferGeometry().setFromPoints([a.position, b.position]);
      group.add(new THREE.Line(geom, lineMat));
    }

    return {
      update: function () {
        group.rotation.y += 0.002;
        group.rotation.x += 0.001;
      },
    };
  }

  function presetParticles(scene, camera) {
    camera.position.z = 50;
    var count = 600;
    var positions = new Float32Array(count * 3);
    for (var i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    var geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var mat = new THREE.PointsMaterial({ size: 0.4, color: 0xc084fc });
    var points = new THREE.Points(geom, mat);
    scene.add(points);

    return {
      update: function () {
        points.rotation.y += 0.0008;
      },
    };
  }

  function presetRotatingSphere(scene, camera) {
    camera.position.z = 30;
    var geom = new THREE.IcosahedronGeometry(10, 2);
    var mat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, wireframe: true });
    var sphere = new THREE.Mesh(geom, mat);
    scene.add(sphere);

    return {
      update: function () {
        sphere.rotation.x += 0.003;
        sphere.rotation.y += 0.005;
      },
    };
  }

  function presetMycelium(scene, camera) {
    camera.position.z = 50;
    var root = new THREE.Group();
    scene.add(root);
    var lineMat = new THREE.LineBasicMaterial({ color: 0x10b981, opacity: 0.7, transparent: true });

    // Grow a simple fractal: each branch spawns 2-3 children.
    function grow(origin, depth) {
      if (depth <= 0) return;
      var branches = 2 + Math.floor(Math.random() * 2);
      for (var i = 0; i < branches; i++) {
        var end = origin.clone().add(
          new THREE.Vector3(
            (Math.random() - 0.5) * 10 * depth,
            (Math.random() - 0.5) * 10 * depth,
            (Math.random() - 0.5) * 10 * depth,
          ),
        );
        var geom = new THREE.BufferGeometry().setFromPoints([origin, end]);
        root.add(new THREE.Line(geom, lineMat));
        grow(end, depth - 1);
      }
    }

    grow(new THREE.Vector3(0, 0, 0), 4);

    return {
      update: function () {
        root.rotation.y += 0.001;
      },
    };
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  function init() {
    document.querySelectorAll('[data-three-scene]').forEach(setupScene);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('beforeunload', function () {
    scenes.forEach(function (s) {
      try {
        s.dispose();
      } catch (_e) {
        // ignore during unload
      }
    });
  });
})();
