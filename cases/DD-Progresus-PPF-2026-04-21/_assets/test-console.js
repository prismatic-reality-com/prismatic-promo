/*
 * test-console.js — minimal in-browser assertion library.
 *
 * Registers a `window.DD_TEST` API with:
 *   DD_TEST.test(name, asyncFn)    → schedule a test
 *   DD_TEST.assert(cond, msg)      → assert truthy
 *   DD_TEST.equal(a, b, msg)       → assert deep equality (primitives / JSON)
 *   DD_TEST.run()                  → run all scheduled tests, returns Promise<Report>
 *   DD_TEST.reset()                → clear the test queue
 *
 * Report shape:
 *   { total, passed, failed, cases: [{name, status, error, durationMs}] }
 *
 * No dependencies. Safe to include from any HTML page.
 */
(function (global) {
  'use strict';

  const queue = [];
  const DD_TEST = {};

  DD_TEST.test = function (name, fn) {
    if (typeof name !== 'string' || typeof fn !== 'function') {
      throw new Error('DD_TEST.test(name, fn): invalid args');
    }
    queue.push({ name, fn });
  };

  DD_TEST.assert = function (cond, msg) {
    if (!cond) throw new Error(msg || 'assertion failed');
  };

  DD_TEST.equal = function (actual, expected, msg) {
    const a = JSON.stringify(actual);
    const b = JSON.stringify(expected);
    if (a !== b) {
      throw new Error((msg || 'equal') + ' — expected ' + b + ', got ' + a);
    }
  };

  DD_TEST.reset = function () { queue.length = 0; };

  DD_TEST.run = async function (onCase) {
    const cases = [];
    let passed = 0;
    let failed = 0;
    for (const c of queue) {
      const started = performance.now();
      const rec = { name: c.name, status: 'pass', error: null, durationMs: 0 };
      try {
        await c.fn();
        passed++;
      } catch (err) {
        rec.status = 'fail';
        rec.error = (err && err.message) ? err.message : String(err);
        failed++;
      }
      rec.durationMs = Math.round(performance.now() - started);
      cases.push(rec);
      if (typeof onCase === 'function') onCase(rec);
    }
    return { total: cases.length, passed, failed, cases };
  };

  global.DD_TEST = DD_TEST;
})(typeof window !== 'undefined' ? window : globalThis);
