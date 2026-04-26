// p5.js — Attention disruption simulation (EA-1.1.2 information overload)
new p5((p) => {
  let stream = [];
  let captured = 0;
  let missed = 0;
  let rate = 1.0;
  p.setup = function() {
    const c = p.createCanvas(800, 400);
    const target = document.getElementById('attention-disruption');
    if (target) c.parent('attention-disruption');
    const slider = document.getElementById('attention-rate');
    if (slider) slider.addEventListener('input', (e) => { rate = parseFloat(e.target.value); });
  };
  p.draw = function() {
    p.background(15, 23, 42);
    if (p.random() < rate * 0.1) {
      stream.push({ x: 0, y: p.random(50, p.height - 50), captured: false });
    }
    p.noStroke();
    p.fill(241, 245, 249);
    p.textSize(14);
    p.text(`Tempo: ${rate.toFixed(1)} | Zachyceno: ${captured} | Uniklo: ${missed}`, 16, 24);
    // attention "window" follows mouse
    const ax = p.mouseX, ay = p.mouseY;
    p.noFill();
    p.stroke(99, 102, 241, 200);
    p.strokeWeight(2);
    p.ellipse(ax, ay, 80, 80);
    // particles
    p.noStroke();
    stream = stream.filter((s) => {
      s.x += 3 + rate;
      const inWindow = p.dist(s.x, s.y, ax, ay) < 40;
      if (inWindow && !s.captured) { s.captured = true; captured++; }
      if (s.x > p.width) {
        if (!s.captured) missed++;
        return false;
      }
      p.fill(s.captured ? [16, 185, 129] : [148, 163, 184], 220);
      p.ellipse(s.x, s.y, 8, 8);
      return true;
    });
  };
}, 'attention-disruption');
