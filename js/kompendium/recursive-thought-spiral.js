// Recursive Thought Spiral — p5.js. Spiral fragments simulate hyperreflexive paralysis.
// EA-5.1.13 hyperreflexivita / EA-5.1.7 referenční rekurze.
new p5((p) => {
  let depth = 5;            // recursion depth (1-12), set by mouse Y
  let phase = 0;            // animation phase
  let fragments = [];       // detached spiral fragments
  let fragTimer = 0;
  let label = '';

  function depthLabel(d) {
    if (d <= 2) return 'Funkční reflexe';
    if (d <= 4) return 'Sebe-monitoring';
    if (d <= 6) return 'Hyperreflexivita';
    if (d <= 9) return 'Referenční rekurze';
    return 'Metakognitivní paralýza';
  }

  p.setup = function() {
    const c = p.createCanvas(800, 500);
    const target = document.getElementById('recursive-thought-spiral');
    if (target) c.parent('recursive-thought-spiral');
    p.angleMode(p.RADIANS);
    label = depthLabel(depth);
  };

  p.draw = function() {
    p.background(15, 23, 42, 25);
    phase += 0.012;

    // Mouse Y → recursion depth (1..12). Higher mouse = deeper spiral
    if (p.mouseX > 0 && p.mouseY > 0 && p.mouseX < p.width && p.mouseY < p.height) {
      const norm = 1 - (p.mouseY / p.height);
      depth = Math.max(1, Math.min(12, Math.floor(norm * 12) + 1));
    }
    label = depthLabel(depth);

    const cx = p.width / 2;
    const cy = p.height / 2;

    // Title and indicator
    p.noStroke();
    p.fill(241, 245, 249);
    p.textSize(14);
    p.text('Hloubka rekurze: ' + depth + '/12 — ' + label, 16, 24);
    p.fill(148, 163, 184);
    p.textSize(11);
    p.text('Pohni myší vertikálně (nahoru = hlubší rekurze)', 16, 44);

    // Recursive spiral — each layer is a thought reflecting on the previous
    p.noFill();
    for (let layer = 0; layer < depth; layer++) {
      const layerPhase = phase + layer * 0.8;
      const radiusBase = 20 + layer * 18;
      const collapseFactor = layer > 6 ? Math.pow(0.85, layer - 6) : 1;
      const r = radiusBase * collapseFactor;

      // Color shifts from teal (functional) → red (paralysis)
      const tDeep = layer / 12;
      const rC = p.lerp(99, 239, tDeep);
      const gC = p.lerp(102, 68, tDeep);
      const bC = p.lerp(241, 68, tDeep);
      const alpha = 200 - layer * 12;

      p.stroke(rC, gC, bC, Math.max(60, alpha));
      p.strokeWeight(layer < 4 ? 2 : 1.5);

      // Spiral path
      p.beginShape();
      const turns = 2.5 + layer * 0.3;
      const steps = 80;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const angle = t * turns * p.TWO_PI + layerPhase;
        const radius = r * t;
        const fragJitter = layer > 5 ? p.random(-2, 2) * (layer / 12) : 0;
        const x = cx + Math.cos(angle) * radius + fragJitter;
        const y = cy + Math.sin(angle) * radius + fragJitter;
        p.vertex(x, y);
      }
      p.endShape();
    }

    // Fragmentation when depth >= 7 — spirals shed pieces
    fragTimer++;
    if (depth >= 7 && fragTimer > Math.max(2, 10 - depth)) {
      fragTimer = 0;
      const angle = p.random(p.TWO_PI);
      const r = 40 + p.random(80);
      fragments.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        vx: Math.cos(angle) * (1 + (depth - 6) * 0.5),
        vy: Math.sin(angle) * (1 + (depth - 6) * 0.5),
        life: 100,
        size: 3 + p.random(4)
      });
      if (fragments.length > 200) fragments.shift();
    }

    // Render and update fragments
    fragments.forEach((f) => {
      f.x += f.vx;
      f.y += f.vy;
      f.life -= 1;
      const alpha = (f.life / 100) * 220;
      p.noStroke();
      p.fill(239, 68, 68, alpha);
      p.ellipse(f.x, f.y, f.size, f.size);
    });
    fragments = fragments.filter((f) => f.life > 0 && f.x > 0 && f.x < p.width && f.y > 0 && f.y < p.height);

    // Center "I" — collapses with depth
    const eyeSize = depth >= 9 ? 4 + p.random(-2, 2) : 8;
    const eyeR = depth >= 9 ? 239 : 99;
    const eyeG = depth >= 9 ? 68 : 102;
    const eyeB = depth >= 9 ? 68 : 241;
    p.noStroke();
    p.fill(eyeR, eyeG, eyeB);
    p.ellipse(cx, cy, eyeSize, eyeSize);

    // Paralysis warning at extreme depths
    if (depth >= 10) {
      p.fill(239, 68, 68);
      p.textSize(12);
      p.textAlign(p.CENTER);
      p.text('⚠ paralýza — myšlení reflektuje samo sebe bez ukotvení', cx, p.height - 20);
      p.textAlign(p.LEFT);
    }
  };
}, 'recursive-thought-spiral');
