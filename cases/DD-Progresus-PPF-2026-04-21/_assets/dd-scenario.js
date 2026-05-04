/* dd-scenario.js — Shared DD calculator scenario state machine.
 *
 * Synchronizes inputs across:
 *   - 06-reports/monte-carlo-valuation.html
 *   - 06-reports/valuation-calculator.html
 *   - 03-financial/tax-calculator.html
 *
 * Persistence layers (priority order on read):
 *   1. URL query string  (?floor=3.7&dcfMu=5.4 ...   or  ?scenario=BASE64)
 *   2. localStorage      (key: dd.scenario.current)
 *   3. defaults
 *
 * On write: replaceState (no reload) + localStorage. Other tabs receive a
 * 'storage' event and re-apply state.
 *
 * Czech UI: "Scénář", "Uložit", "Sdílet permalink", "Načíst", "Resetovat", "Vlastní".
 */
(function (global) {
  'use strict';

  // -------- Defaults --------
  const defaults = Object.freeze({
    name: 'Default',
    // Walk-away / anchor / target
    floor: 3.7,
    target: 5.5,
    anchor: 6.5,
    // DCF method distribution
    dcfMu: 5.4, dcfSigma: 0.8,
    // Land comp
    landMu: 4.0, landSigma: 0.6,
    // Precedent transactions
    precedentMu: 4.2, precedentSigma: 0.5,
    // Liquidation
    liquidationMu: 2.5, liquidationSigma: 0.4,
    // Triangulation weights (sum ~= 1.0)
    weights: { dcf: 0.4, land: 0.3, precedent: 0.2, liquidation: 0.1 },
    // Deal economics
    escrowPct: 0.15,
    consentRate: 0.85,
    dancoreReserve: 0.3,
    // Structure
    structure: 'share',     // 'share' | 'asset' | 'hybrid'
    section19: true,
    section54: true,
    grossUp: false,
    // Monte Carlo
    iterations: 10000,
  });

  // -------- Preset scenarios --------
  const PRESETS = {
    'Default': {},
    'Base case': {
      name: 'Base case',
      floor: 3.7, target: 5.0, anchor: 6.0,
      dcfMu: 5.0, dcfSigma: 0.8,
      landMu: 4.2, landSigma: 0.6,
      precedentMu: 4.3, precedentSigma: 0.5,
      liquidationMu: 2.5, liquidationSigma: 0.4,
      weights: { dcf: 0.35, land: 0.30, precedent: 0.25, liquidation: 0.10 },
      escrowPct: 0.15, consentRate: 0.85, dancoreReserve: 0.3,
      structure: 'share', section19: true, section54: true, grossUp: false,
      iterations: 10000,
    },
    'PPF anchor': {
      name: 'PPF anchor',
      floor: 3.7, target: 4.5, anchor: 5.5,
      dcfMu: 4.4, dcfSigma: 1.0,        // DCF biased low
      landMu: 3.6, landSigma: 0.7,
      precedentMu: 3.9, precedentSigma: 0.6,
      liquidationMu: 2.3, liquidationSigma: 0.5,
      weights: { dcf: 0.30, land: 0.25, precedent: 0.30, liquidation: 0.15 },
      escrowPct: 0.20,                  // escrow high
      consentRate: 0.65,                // consent low
      dancoreReserve: 0.4,
      structure: 'asset', section19: false, section54: true, grossUp: true,
      iterations: 10000,
    },
    'Walk-away test': {
      name: 'Walk-away test',
      floor: 3.5, target: 4.2, anchor: 5.0,
      dcfMu: 4.0, dcfSigma: 1.1,
      landMu: 3.4, landSigma: 0.8,
      precedentMu: 3.8, precedentSigma: 0.7,
      liquidationMu: 2.0, liquidationSigma: 0.5,
      weights: { dcf: 0.25, land: 0.30, precedent: 0.25, liquidation: 0.20 },
      escrowPct: 0.20,
      consentRate: 0.55,
      dancoreReserve: 0.5,
      structure: 'share', section19: true, section54: true, grossUp: false,
      iterations: 10000,
    },
  };

  const STORAGE_KEY_CURRENT = 'dd.scenario.current';
  const STORAGE_KEY_NAMED = 'dd.scenario.named';
  const URL_PARAM_BASE64 = 'scenario';

  // -------- Utils --------
  function deepClone(o) {
    return JSON.parse(JSON.stringify(o));
  }

  function deepMerge(target, src) {
    const out = deepClone(target);
    if (!src || typeof src !== 'object') return out;
    for (const k of Object.keys(src)) {
      const v = src[k];
      if (v && typeof v === 'object' && !Array.isArray(v) &&
          out[k] && typeof out[k] === 'object' && !Array.isArray(out[k])) {
        out[k] = deepMerge(out[k], v);
      } else {
        out[k] = v;
      }
    }
    return out;
  }

  function safeNumber(v, fallback) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  function coerce(state) {
    // Coerce types & clamp into known shape
    const out = deepMerge(defaults, state || {});
    out.floor = safeNumber(out.floor, defaults.floor);
    out.target = safeNumber(out.target, defaults.target);
    out.anchor = safeNumber(out.anchor, defaults.anchor);
    out.dcfMu = safeNumber(out.dcfMu, defaults.dcfMu);
    out.dcfSigma = safeNumber(out.dcfSigma, defaults.dcfSigma);
    out.landMu = safeNumber(out.landMu, defaults.landMu);
    out.landSigma = safeNumber(out.landSigma, defaults.landSigma);
    out.precedentMu = safeNumber(out.precedentMu, defaults.precedentMu);
    out.precedentSigma = safeNumber(out.precedentSigma, defaults.precedentSigma);
    out.liquidationMu = safeNumber(out.liquidationMu, defaults.liquidationMu);
    out.liquidationSigma = safeNumber(out.liquidationSigma, defaults.liquidationSigma);
    out.escrowPct = safeNumber(out.escrowPct, defaults.escrowPct);
    out.consentRate = safeNumber(out.consentRate, defaults.consentRate);
    out.dancoreReserve = safeNumber(out.dancoreReserve, defaults.dancoreReserve);
    out.iterations = Math.max(100, Math.floor(safeNumber(out.iterations, defaults.iterations)));
    out.section19 = Boolean(out.section19);
    out.section54 = Boolean(out.section54);
    out.grossUp = Boolean(out.grossUp);
    out.structure = ['share', 'asset', 'hybrid'].includes(out.structure) ? out.structure : 'share';
    out.weights = {
      dcf: safeNumber(out.weights && out.weights.dcf, defaults.weights.dcf),
      land: safeNumber(out.weights && out.weights.land, defaults.weights.land),
      precedent: safeNumber(out.weights && out.weights.precedent, defaults.weights.precedent),
      liquidation: safeNumber(out.weights && out.weights.liquidation, defaults.weights.liquidation),
    };
    return out;
  }

  // -------- URL encoding --------
  // Flat keys we serialize as readable URL params (booleans -> '1'/'0').
  const FLAT_KEYS = [
    'name', 'floor', 'target', 'anchor',
    'dcfMu', 'dcfSigma', 'landMu', 'landSigma',
    'precedentMu', 'precedentSigma', 'liquidationMu', 'liquidationSigma',
    'escrowPct', 'consentRate', 'dancoreReserve',
    'structure', 'section19', 'section54', 'grossUp', 'iterations',
  ];

  function toUrlParams(state) {
    const params = new URLSearchParams();
    for (const k of FLAT_KEYS) {
      if (state[k] === undefined || state[k] === null) continue;
      const v = state[k];
      if (typeof v === 'boolean') {
        params.set(k, v ? '1' : '0');
      } else if (typeof v === 'number') {
        // strip trailing zeros for compactness
        params.set(k, String(Number(v.toFixed(4))));
      } else {
        params.set(k, String(v));
      }
    }
    // weights as compact wDcf/wLand/wPrec/wLiq
    if (state.weights) {
      params.set('wDcf', String(Number((state.weights.dcf ?? 0).toFixed(4))));
      params.set('wLand', String(Number((state.weights.land ?? 0).toFixed(4))));
      params.set('wPrec', String(Number((state.weights.precedent ?? 0).toFixed(4))));
      params.set('wLiq', String(Number((state.weights.liquidation ?? 0).toFixed(4))));
    }
    return params;
  }

  function fromUrlParams(params) {
    const out = {};
    for (const k of FLAT_KEYS) {
      if (!params.has(k)) continue;
      const raw = params.get(k);
      if (k === 'section19' || k === 'section54' || k === 'grossUp') {
        out[k] = raw === '1' || raw === 'true';
      } else if (k === 'name' || k === 'structure') {
        out[k] = raw;
      } else if (k === 'iterations') {
        out[k] = parseInt(raw, 10);
      } else {
        out[k] = Number(raw);
      }
    }
    if (params.has('wDcf') || params.has('wLand') || params.has('wPrec') || params.has('wLiq')) {
      out.weights = {
        dcf: Number(params.get('wDcf') ?? defaults.weights.dcf),
        land: Number(params.get('wLand') ?? defaults.weights.land),
        precedent: Number(params.get('wPrec') ?? defaults.weights.precedent),
        liquidation: Number(params.get('wLiq') ?? defaults.weights.liquidation),
      };
    }
    return out;
  }

  function encodeBase64(state) {
    try {
      const json = JSON.stringify(state);
      // unicode-safe base64
      return btoa(unescape(encodeURIComponent(json)));
    } catch (e) {
      return '';
    }
  }

  function decodeBase64(b64) {
    try {
      const json = decodeURIComponent(escape(atob(b64)));
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }

  // -------- Read --------
  function readFromUrl() {
    const search = global.location.search.replace(/^\?/, '');
    const params = new URLSearchParams(search);

    // Opaque base64 form takes precedence if present
    if (params.has(URL_PARAM_BASE64)) {
      const decoded = decodeBase64(params.get(URL_PARAM_BASE64));
      if (decoded) return decoded;
    }
    // Else, read flat params
    const flat = fromUrlParams(params);
    return Object.keys(flat).length ? flat : null;
  }

  function readFromLocalStorage() {
    try {
      const raw = global.localStorage.getItem(STORAGE_KEY_CURRENT);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function read() {
    const fromUrl = readFromUrl();
    if (fromUrl) return coerce(fromUrl);
    const fromLs = readFromLocalStorage();
    if (fromLs) return coerce(fromLs);
    return coerce({});
  }

  // -------- Write --------
  let _writeTimer = null;

  function writeUrl(state) {
    try {
      const params = toUrlParams(state);
      let qs = params.toString();
      // Compact-encoding fallback if too long
      if (qs.length > 2000) {
        qs = URL_PARAM_BASE64 + '=' + encodeURIComponent(encodeBase64(state));
      }
      const newUrl = global.location.pathname + (qs ? '?' + qs : '') + global.location.hash;
      global.history.replaceState(null, '', newUrl);
    } catch (e) { /* swallow */ }
  }

  function writeLocalStorage(state) {
    try {
      global.localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(state));
    } catch (e) { /* swallow */ }
  }

  function write(state) {
    const merged = coerce(state);
    // debounce URL writes (history API spam-protection)
    clearTimeout(_writeTimer);
    _writeTimer = setTimeout(() => {
      writeUrl(merged);
      writeLocalStorage(merged);
    }, 120);
    return merged;
  }

  // -------- Subscribe (cross-tab + manual) --------
  const _subs = new Set();

  function subscribe(cb) {
    if (typeof cb !== 'function') return () => {};
    _subs.add(cb);
    return () => _subs.delete(cb);
  }

  function _emit(state) {
    for (const cb of _subs) {
      try { cb(state); } catch (e) { /* swallow */ }
    }
  }

  global.addEventListener('storage', (e) => {
    if (e.key !== STORAGE_KEY_CURRENT) return;
    try {
      const next = e.newValue ? JSON.parse(e.newValue) : null;
      if (next) _emit(coerce(next));
    } catch (err) { /* swallow */ }
  });

  // -------- Named scenarios (save / load / list) --------
  function _readNamed() {
    try {
      return JSON.parse(global.localStorage.getItem(STORAGE_KEY_NAMED) || '{}') || {};
    } catch (e) { return {}; }
  }

  function _writeNamed(map) {
    try {
      global.localStorage.setItem(STORAGE_KEY_NAMED, JSON.stringify(map));
    } catch (e) { /* swallow */ }
  }

  function save(name, state) {
    if (!name) return;
    const map = _readNamed();
    map[name] = coerce({ ...state, name });
    _writeNamed(map);
  }

  function load(name) {
    if (!name) return null;
    // Built-in presets win
    if (PRESETS[name]) {
      const merged = coerce(deepMerge(defaults, PRESETS[name]));
      merged.name = name;
      return merged;
    }
    const map = _readNamed();
    if (map[name]) return coerce(map[name]);
    return null;
  }

  function list() {
    const named = Object.keys(_readNamed());
    const built = Object.keys(PRESETS);
    // dedupe, preserve preset order first
    const set = new Set([...built, ...named]);
    return Array.from(set);
  }

  function remove(name) {
    if (PRESETS[name]) return false; // protect built-ins
    const map = _readNamed();
    if (!(name in map)) return false;
    delete map[name];
    _writeNamed(map);
    return true;
  }

  // -------- Permalink --------
  function permalink(state) {
    const merged = coerce(state || read());
    const params = toUrlParams(merged);
    let qs = params.toString();
    if (qs.length > 2000) {
      qs = URL_PARAM_BASE64 + '=' + encodeURIComponent(encodeBase64(merged));
    }
    const url = global.location.origin + global.location.pathname + (qs ? '?' + qs : '');
    return url;
  }

  // -------- Header UI injection (safe DOM construction; no innerHTML) --------
  function _toast(msg, kind) {
    const el = document.createElement('div');
    el.textContent = msg;
    el.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);' +
      'z-index:60;padding:8px 14px;border-radius:6px;font:13px/1.4 system-ui,sans-serif;' +
      'box-shadow:0 6px 20px -6px rgba(0,0,0,.4);' +
      (kind === 'err'
        ? 'background:#7f1d1d;color:#fee2e2;'
        : 'background:#0f172a;color:#e5e7eb;');
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  }

  function _renderOptions(selectEl, currentName) {
    const names = list();
    while (selectEl.firstChild) selectEl.removeChild(selectEl.firstChild);
    for (const n of names) {
      const opt = document.createElement('option');
      opt.value = n;
      opt.textContent = n;
      if (n === currentName) opt.selected = true;
      selectEl.appendChild(opt);
    }
    // "Vlastní" as virtual option (shown when no preset matches)
    const customOpt = document.createElement('option');
    customOpt.value = '__custom__';
    customOpt.textContent = 'Vlastní';
    selectEl.appendChild(customOpt);
    if (!names.includes(currentName)) {
      customOpt.selected = true;
    }
  }

  function _mkBtn(id, label, primary, title) {
    const b = document.createElement('button');
    b.id = id;
    b.type = 'button';
    b.textContent = label;
    if (title) b.title = title;
    b.style.cssText = primary
      ? 'background:#dc2626;color:#fff;border:0;border-radius:4px;padding:4px 8px;cursor:pointer;font:inherit;'
      : 'background:#1e293b;color:#e5e7eb;border:1px solid #334155;border-radius:4px;padding:4px 8px;cursor:pointer;font:inherit;';
    return b;
  }

  function injectHeader(opts) {
    opts = opts || {};
    const onApply = typeof opts.onApply === 'function' ? opts.onApply : null;
    const getState = typeof opts.getState === 'function' ? opts.getState : (() => read());

    if (!document.body) {
      document.addEventListener('DOMContentLoaded', () => injectHeader(opts), { once: true });
      return;
    }
    if (document.getElementById('dd-scenario-bar')) return; // idempotent

    const wrap = document.createElement('div');
    wrap.id = 'dd-scenario-bar';
    wrap.setAttribute('role', 'region');
    wrap.setAttribute('aria-label', 'Sdílený scénář');
    wrap.style.cssText = [
      'position:fixed', 'top:64px', 'right:12px', 'z-index:40',
      'background:rgba(15,23,42,0.92)', 'color:#e5e7eb',
      'border:1px solid #334155', 'border-radius:8px',
      'padding:8px 10px', 'font:12px/1.4 system-ui,sans-serif',
      'box-shadow:0 8px 28px -10px rgba(0,0,0,.45)',
      'display:flex', 'flex-wrap:wrap', 'align-items:center', 'gap:6px',
      'max-width:calc(100vw - 24px)',
    ].join(';');

    const lbl = document.createElement('span');
    lbl.textContent = 'Scénář';
    lbl.style.cssText = 'font-weight:700;letter-spacing:.02em;';
    wrap.appendChild(lbl);

    const sel = document.createElement('select');
    sel.id = 'dd-scenario-select';
    sel.style.cssText = 'background:#0b1220;color:#e5e7eb;border:1px solid #334155;border-radius:4px;padding:3px 6px;font:inherit;';
    wrap.appendChild(sel);

    const btnLoad = _mkBtn('dd-scenario-load', 'Načíst', true, 'Načíst zvolený scénář');
    const btnSave = _mkBtn('dd-scenario-save', 'Uložit', false, 'Uložit aktuální stav jako pojmenovaný scénář');
    const btnShare = _mkBtn('dd-scenario-share', 'Sdílet permalink', false, 'Zkopírovat permalink se stavem');
    const btnReset = _mkBtn('dd-scenario-reset', 'Resetovat', false, 'Resetovat na výchozí stav');
    const btnClose = _mkBtn('dd-scenario-toggle', '×', false, 'Sbalit');
    btnClose.style.cssText = 'background:transparent;color:#94a3b8;border:0;cursor:pointer;font:inherit;padding:0 4px;';
    btnClose.setAttribute('aria-label', 'Sbalit panel');

    wrap.appendChild(btnLoad);
    wrap.appendChild(btnSave);
    wrap.appendChild(btnShare);
    wrap.appendChild(btnReset);
    wrap.appendChild(btnClose);

    document.body.appendChild(wrap);

    const initial = getState();
    _renderOptions(sel, initial && initial.name);

    btnLoad.addEventListener('click', () => {
      const name = sel.value;
      if (name === '__custom__') return;
      const s = load(name);
      if (s && onApply) onApply(s);
      _toast('Načteno: ' + name);
    });

    btnSave.addEventListener('click', () => {
      const def = (getState() && getState().name) || 'Vlastní';
      const name = global.prompt('Název scénáře:', def);
      if (!name) return;
      const cur = { ...getState(), name };
      save(name, cur);
      write(cur);
      _renderOptions(sel, name);
      _toast('Uloženo: ' + name);
    });

    btnShare.addEventListener('click', async () => {
      const url = permalink(getState());
      try {
        await navigator.clipboard.writeText(url);
        _toast('Permalink zkopírován do schránky');
      } catch (e) {
        global.prompt('Permalink:', url);
      }
    });

    btnReset.addEventListener('click', () => {
      const s = coerce({});
      if (onApply) onApply(s);
      _renderOptions(sel, s.name);
      _toast('Resetováno');
    });

    btnClose.addEventListener('click', () => {
      wrap.style.display = 'none';
    });

    // Re-render dropdown when external state changes (e.g. via subscribe)
    subscribe((s) => {
      _renderOptions(sel, s && s.name);
    });
  }

  // -------- Public API --------
  const API = {
    defaults,
    PRESETS: Object.freeze(PRESETS),
    read,
    write,
    subscribe,
    save,
    load,
    list,
    remove,
    permalink,
    coerce,
    injectHeader,
    // exposed for tests / advanced usage
    _internal: { encodeBase64, decodeBase64, toUrlParams, fromUrlParams },
  };

  global.DD_SCENARIO = API;
})(typeof window !== 'undefined' ? window : this);
