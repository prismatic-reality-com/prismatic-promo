/**
 * reading-progress.js — Top-of-page reading progress bar.
 *
 * Opt-in: any page with a `[data-reading-progress]` element (typically the
 * outer article container) gets a fixed rail at the top of the viewport
 * whose width tracks how far the reader has scrolled through the article.
 *
 * No inline styles, no new classes — uses Tailwind utility classes applied
 * directly so the FLLM CSS-hygiene doctrine is satisfied.
 */
(function () {
  'use strict';

  var target = document.querySelector('[data-reading-progress]');
  if (!target) return;

  // Build rail markup once, inserted as first child of <body>.
  var rail = document.createElement('div');
  rail.className = 'fixed top-0 left-0 right-0 z-50 h-1 bg-transparent pointer-events-none';

  var bar = document.createElement('div');
  bar.className =
    'h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-0';
  bar.style.transition = 'width 100ms linear';

  rail.appendChild(bar);
  document.body.insertBefore(rail, document.body.firstChild);

  function update() {
    var rect = target.getBoundingClientRect();
    var viewportH = window.innerHeight;
    var scrolled = Math.max(0, -rect.top);
    var total = Math.max(1, target.offsetHeight - viewportH);
    var ratio = Math.min(1, scrolled / total);
    bar.style.width = (ratio * 100).toFixed(2) + '%';
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
