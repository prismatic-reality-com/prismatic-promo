/* State Sync — localStorage + BroadcastChannel for cross-tab state.
 * Publishes + subscribes to named state keys, persists to localStorage,
 * broadcasts to other tabs.
 */
(function () {
  'use strict';
  if (window.StateSync && window.StateSync.__initialized) return;

  const LS_PREFIX = 'mycelium:state:';
  const CHANNEL = 'mycelium:sync';
  const KEYS = {
    darkMode: 'mycelium:darkMode',
    navigate: 'mycelium:navigate',
    filter: 'mycelium:filter',
    selection: 'mycelium:selection',
    recents: 'mycelium:cp:recents',
    valuation: 'mycelium:valuation'
  };

  const subs = new Map(); // key -> Set<fn>
  let bc = null;

  function getBc() {
    if (bc) return bc;
    if (typeof BroadcastChannel === 'undefined') return null;
    try {
      bc = new BroadcastChannel(CHANNEL);
      bc.addEventListener('message', (e) => {
        const { key, value, origin } = e.data || {};
        if (!key) return;
        dispatch(key, value, origin || 'remote');
      });
    } catch (e) { bc = null; }
    return bc;
  }

  function dispatch(key, value, origin) {
    const set = subs.get(key);
    if (!set) return;
    set.forEach(fn => {
      try { fn(value, origin); } catch (e) { console.warn('[StateSync] subscriber error:', e); }
    });
  }

  function persist(key, value) {
    try { localStorage.setItem(LS_PREFIX + key, JSON.stringify({ v: value, t: Date.now() })); }
    catch (e) {}
  }

  function load(key) {
    try {
      const raw = localStorage.getItem(LS_PREFIX + key);
      if (!raw) return undefined;
      const parsed = JSON.parse(raw);
      return parsed && parsed.v;
    } catch (e) { return undefined; }
  }

  function publish(key, value, opts = {}) {
    persist(key, value);
    const origin = opts.origin || 'local';
    dispatch(key, value, origin);
    const channel = getBc();
    if (channel && !opts.silent) {
      try { channel.postMessage({ key, value, origin: 'remote', t: Date.now() }); } catch (e) {}
    }
  }

  function subscribe(key, fn) {
    if (!subs.has(key)) subs.set(key, new Set());
    subs.get(key).add(fn);
    // Fire once with current value if present.
    const cur = load(key);
    if (cur !== undefined) { try { fn(cur, 'initial'); } catch (e) {} }
    return () => { const s = subs.get(key); if (s) s.delete(fn); };
  }

  // storage event keeps older browsers (no BroadcastChannel) in sync.
  window.addEventListener('storage', (e) => {
    if (!e.key || !e.key.startsWith(LS_PREFIX)) return;
    const key = e.key.slice(LS_PREFIX.length);
    try {
      const parsed = e.newValue ? JSON.parse(e.newValue) : null;
      dispatch(key, parsed && parsed.v, 'storage');
    } catch (err) {}
  });

  // Auto-sync dark mode: watch html.dark changes + localStorage dd-dark key.
  function wireDarkMode() {
    // Subscribe: apply to DOM
    subscribe('darkMode', (v) => {
      if (v == null) return;
      localStorage.setItem('dd-dark', String(v));
      document.documentElement.classList.toggle('dark', !!v);
    });
    // Seed from existing Alpine state.
    const initial = localStorage.getItem('dd-dark');
    if (initial !== null) publish('darkMode', initial !== 'false', { silent: true });
  }

  // Emit a navigation event so other tabs know what was viewed.
  function emitNavigation() {
    publish('navigate', { path: location.pathname, href: location.href, at: Date.now() });
  }

  window.StateSync = {
    __initialized: true,
    KEYS,
    publish,
    subscribe,
    get(key) { return load(key); }
  };

  function boot() {
    getBc();
    wireDarkMode();
    emitNavigation();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
