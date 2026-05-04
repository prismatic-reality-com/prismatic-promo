#!/usr/bin/env node
/*
 * test-md-store.js — Offline-first store smoke test.
 *
 * Exit code: 0 on pass, 1 on any failure.
 * Run from workspace root:  node _assets/test-md-store.js
 */
'use strict';

const assert = require('assert');
const path = require('path');

globalThis.window = globalThis;
// Simulate the worst case: page opened over file://.
globalThis.location = { protocol: 'file:', search: '', hash: '' };

require(path.resolve(__dirname, 'md-store.js'));
require(path.resolve(__dirname, 'manifest-store.js'));
require(path.resolve(__dirname, 'graph-store.js'));

const failures = [];
function check(name, fn) {
  try {
    fn();
    console.log('  [pass]', name);
  } catch (e) {
    failures.push({ name, error: e });
    console.log('  [FAIL]', name, '--', e.message);
  }
}

console.log('== DD offline store smoke test ==');
check('DD_MD_STORE is defined', () => assert.ok(window.DD_MD_STORE));
check('DD_MD_STORE_GET is a function', () => assert.strictEqual(typeof window.DD_MD_STORE_GET, 'function'));
check('DD_MD_STORE_KEYS returns >= 50 files', () => {
  const n = window.DD_MD_STORE_KEYS().length;
  assert.ok(n >= 50, 'got ' + n);
});
check('DD_MD_STORE_META has fileCount matching keys', () => {
  assert.strictEqual(window.DD_MD_STORE_META.fileCount, window.DD_MD_STORE_KEYS().length);
});
check('Known files load', () => {
  for (const p of [
    'RED-FLAGS.md',
    '00-INDEX.md',
    '01-intel/README.md',
    '06-reports/MASTER-DD-REPORT-v1.0.md',
    '08-comms-templates/SAVILLS-NDA-STRESS-TEST-EMAIL.md',
  ]) {
    const e = window.DD_MD_STORE_GET(p);
    assert.ok(e, 'missing ' + p);
    assert.ok(typeof e.content === 'string' && e.content.length > 0, 'empty content for ' + p);
    assert.ok(typeof e.title === 'string', 'no title for ' + p);
  }
});
check('Path normalization: leading ./ and /', () => {
  assert.ok(window.DD_MD_STORE_GET('./RED-FLAGS.md'));
  assert.ok(window.DD_MD_STORE_GET('/RED-FLAGS.md'));
});
check('Path normalization: ?query and #fragment stripped', () => {
  assert.ok(window.DD_MD_STORE_GET('RED-FLAGS.md?v=1'));
  assert.ok(window.DD_MD_STORE_GET('RED-FLAGS.md#section'));
});
check('Path normalization: missing .md suffix tolerated', () => {
  assert.ok(window.DD_MD_STORE_GET('RED-FLAGS'));
});
check('Path normalization: ../ collapses correctly', () => {
  assert.ok(window.DD_MD_STORE_GET('01-intel/../RED-FLAGS.md'));
});
check('Path escape attempts rejected', () => {
  assert.strictEqual(window.DD_MD_STORE_GET('../outside.md'), null);
  assert.strictEqual(window.DD_MD_STORE_GET('../../etc/passwd'), null);
});
check('Unknown files return null', () => {
  assert.strictEqual(window.DD_MD_STORE_GET('does-not-exist.md'), null);
});
check('DD_MANIFEST is defined with files[]', () => {
  assert.ok(window.DD_MANIFEST);
  assert.ok(Array.isArray(window.DD_MANIFEST.files));
  assert.ok(window.DD_MANIFEST.files.length > 0);
});
check('DD_GRAPH is defined with nodes[] and edges[]', () => {
  assert.ok(window.DD_GRAPH);
  assert.ok(Array.isArray(window.DD_GRAPH.nodes));
  assert.ok(Array.isArray(window.DD_GRAPH.edges));
});
check('Unicode content round-trips (Czech diacritics)', () => {
  const keys = window.DD_MD_STORE_KEYS();
  // Any file with ČÚZK or Progresus → PPF should have non-ASCII chars.
  let foundUnicode = false;
  for (const k of keys) {
    const e = window.DD_MD_STORE_GET(k);
    if (/[ěščřžýáíéůúťďň→]/i.test(e.content)) { foundUnicode = true; break; }
  }
  assert.ok(foundUnicode, 'no Unicode content discovered — suspicious JSON escaping');
});
check('Content contains backticks untouched', () => {
  const e = window.DD_MD_STORE_GET('RED-FLAGS.md');
  // RED-FLAGS.md has fenced code blocks.
  assert.ok(e.content.includes('`') || e.content.includes('```'), 'expected backticks in RED-FLAGS.md');
});

console.log('');
if (failures.length) {
  console.log('FAILED:', failures.length, '/', failures.length + ' tests');
  process.exit(1);
} else {
  console.log('All tests passed.');
  process.exit(0);
}
