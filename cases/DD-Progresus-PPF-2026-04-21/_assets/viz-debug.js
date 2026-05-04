/* viz-debug.js
   Lightweight debug overlay for canvas/chart/map sizing verification.
   Toggle:  Ctrl+Shift+D
   Shows per-canvas: CSS size, intrinsic pixel size, DPR, parent size.
*/
(function () {
  'use strict';

  let overlay = null;
  let visible = false;
  let tickHandle = null;

  function ensureOverlay() {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = '__viz_debug';
    overlay.setAttribute('aria-hidden', 'true');
    Object.assign(overlay.style, {
      position: 'fixed',
      top: '8px',
      right: '8px',
      zIndex: 99999,
      maxWidth: '360px',
      maxHeight: '70vh',
      overflow: 'auto',
      fontFamily: 'ui-monospace,SFMono-Regular,Menlo,Monaco,monospace',
      fontSize: '11px',
      lineHeight: '1.45',
      color: '#e5e7eb',
      background: 'rgba(17,24,39,0.92)',
      border: '1px solid rgba(239,68,68,0.6)',
      borderRadius: '6px',
      padding: '8px 10px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      pointerEvents: 'auto',
      whiteSpace: 'pre-wrap',
    });
    overlay.textContent = 'viz-debug initializing…';
    document.body.appendChild(overlay);
    return overlay;
  }

  function describe(el) {
    const rect = el.getBoundingClientRect();
    const parent = el.parentElement;
    const prect = parent ? parent.getBoundingClientRect() : null;
    const id = el.id || '(no id)';
    const dpr = window.devicePixelRatio || 1;
    const intrinsicW = el.width || 0;
    const intrinsicH = el.height || 0;
    const cssW = Math.round(rect.width);
    const cssH = Math.round(rect.height);
    const expectedW = cssW * dpr;
    const expectedH = cssH * dpr;
    const ratio = cssH ? (cssW / cssH).toFixed(2) : '-';
    const dprOk = (Math.abs(intrinsicW - expectedW) < 2) && (Math.abs(intrinsicH - expectedH) < 2);
    const parentSize = prect ? (Math.round(prect.width) + '×' + Math.round(prect.height)) : '-';
    const flags = [];
    if (cssH < 40)            flags.push('FLAT');
    if (cssH > window.innerHeight * 2) flags.push('VERTICAL-STRETCH');
    if (cssW > window.innerWidth) flags.push('OVERFLOW-X');
    if (intrinsicW === 0 || intrinsicH === 0) flags.push('ZERO-PX');
    if (!dprOk && dpr > 1)    flags.push('DPR-MISMATCH');
    return `#${id}
  css=${cssW}×${cssH}  ratio=${ratio}
  px =${intrinsicW}×${intrinsicH}  dpr=${dpr}
  parent=${parentSize}
  ${flags.length ? 'FLAGS: ' + flags.join(', ') : 'OK'}`;
  }

  function refresh() {
    if (!visible) return;
    const canvases = document.querySelectorAll('canvas');
    const maps = document.querySelectorAll('.leaflet-container');
    const lines = [];
    lines.push(`viz-debug  [Ctrl+Shift+D hide]  dpr=${window.devicePixelRatio || 1}  vp=${window.innerWidth}×${window.innerHeight}`);
    lines.push(`canvases: ${canvases.length}  leaflet: ${maps.length}`);
    lines.push('');
    canvases.forEach((c) => { lines.push(describe(c)); lines.push(''); });
    maps.forEach((m) => {
      const r = m.getBoundingClientRect();
      lines.push(`leaflet: ${Math.round(r.width)}×${Math.round(r.height)}  id=${m.id || '(anon)'}`);
    });
    ensureOverlay().textContent = lines.join('\n');
  }

  function show() {
    visible = true;
    ensureOverlay().style.display = 'block';
    refresh();
    tickHandle = setInterval(refresh, 500);
  }

  function hide() {
    visible = false;
    if (overlay) overlay.style.display = 'none';
    if (tickHandle) { clearInterval(tickHandle); tickHandle = null; }
  }

  function toggle() { (visible ? hide : show)(); }

  window.addEventListener('keydown', (ev) => {
    if (ev.ctrlKey && ev.shiftKey && (ev.key === 'D' || ev.key === 'd')) {
      ev.preventDefault();
      toggle();
    }
  });

  // expose for console use
  window.__vizDebug = { show, hide, toggle, refresh };
})();
