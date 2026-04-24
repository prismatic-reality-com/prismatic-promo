/**
 * copy-url.js — Clipboard handler for `.copy-url-btn` buttons.
 *
 * Delegated event listener: any button with class `copy-url-btn` and a
 * `data-copy-url` attribute will copy that URL to the clipboard on click,
 * flashing "Copied!" for 1.5s.
 *
 * Auto-included on every page by the base template. No dependencies.
 */
(function () {
  'use strict';

  document.addEventListener('click', function (event) {
    var btn = event.target.closest('.copy-url-btn');
    if (!btn) return;

    event.preventDefault();
    var url = btn.dataset.copyUrl;
    if (!url) return;

    // Grab the text node that's NOT inside an <svg> so we restore cleanly.
    var labelSpan = null;
    btn.childNodes.forEach(function (n) {
      if (n.nodeType === Node.TEXT_NODE && n.textContent.trim()) {
        labelSpan = n;
      }
    });

    function setLabel(text) {
      if (labelSpan) labelSpan.textContent = text;
    }

    navigator.clipboard
      .writeText(url)
      .then(function () {
        var prev = labelSpan ? labelSpan.textContent : null;
        setLabel(' Copied!');
        setTimeout(function () {
          if (prev !== null) setLabel(prev);
        }, 1500);
      })
      .catch(function () {
        setLabel(' Copy failed');
      });
  });
})();
