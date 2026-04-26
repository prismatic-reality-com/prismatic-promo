// p5.js — Epistemic disintegration simulation. Particles = beliefs/concepts.
new p5((p) => {
  let particles = [];
  let intensity = 0.3;
  let phase = 'stable'; // stable -> perturbed -> fragmented -> reconstructed
  let phaseTimer = 0;

  p.setup = function() {
    const c = p.createCanvas(800, 500);
    const target = document.getElementById('epistemic-disintegration');
    if (target) c.parent('epistemic-disintegration');
    for (let i = 0; i < 80; i++) {
      particles.push({ x: p.random(p.width), y: p.random(p.height), vx: 0, vy: 0, anchor: p.createVector(p.random(p.width), p.random(p.height)) });
    }
    const slider = document.getElementById('disintegration-intensity');
    if (slider) slider.addEventListener('input', (e) => { intensity = parseFloat(e.target.value); });
  };

  p.draw = function() {
    p.background(15, 23, 42, 30);
    phaseTimer++;
    if (phaseTimer > 200) { phaseTimer = 0; phase = phase === 'stable' ? 'perturbed' : phase === 'perturbed' ? 'fragmented' : phase === 'fragmented' ? 'reconstructed' : 'stable'; }
    p.noStroke();
    p.fill(241, 245, 249);
    p.textSize(14);
    p.text(`Fáze: ${phase} | intenzita: ${intensity.toFixed(2)}`, 16, 24);

    particles.forEach((part) => {
      // attraction to anchor (stable belief structure)
      const dx = part.anchor.x - part.x;
      const dy = part.anchor.y - part.y;
      part.vx += dx * 0.005;
      part.vy += dy * 0.005;
      // damping
      part.vx *= 0.92;
      part.vy *= 0.92;
      // perturbation from manipulation
      if (phase === 'perturbed' || phase === 'fragmented') {
        part.vx += p.random(-1, 1) * intensity * 2;
        part.vy += p.random(-1, 1) * intensity * 2;
      }
      if (phase === 'fragmented') {
        // anchors drift
        part.anchor.x += p.random(-0.5, 0.5);
        part.anchor.y += p.random(-0.5, 0.5);
      }
      part.x += part.vx;
      part.y += part.vy;
      const col = phase === 'stable' ? [99, 102, 241] : phase === 'perturbed' ? [245, 158, 11] : phase === 'fragmented' ? [239, 68, 68] : [16, 185, 129];
      p.fill(col[0], col[1], col[2], 200);
      p.ellipse(part.x, part.y, 6, 6);
    });
    // edges between close particles (epistemic relations)
    p.stroke(148, 163, 184, 30);
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const d = p.dist(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
        if (d < 50) p.line(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
      }
    }
  };
}, 'epistemic-disintegration');
