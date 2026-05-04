/* dd-auto-linkify.js — page-wide auto cross-linker for dashboards.
   Wraps RF-NN, MD/HTML paths, IČO, § statutes, court spis numbers, and
   76 named entities in clickable <a class="dd-xref"> anchors. */
(function () {
  'use strict';

  if (window.DD_AUTO_LINKIFY) return;

  // Pages where auto-linkification would conflict with the page's own
  // input handling. Trimmed list — most portal pages benefit from linking.
  var SKIP_PAGES = [
    'reader.html',          // already does its own enrichment
    'search.html',          // results contain entity tokens; would clash
    'export-pack.html',     // shell scripts in <pre>
    'test-all.html',        // test runner
    'keyboard-help.html'    // shortcut tables only
  ];
  var here = (location.pathname || '').split('/').pop().toLowerCase();
  if (SKIP_PAGES.indexOf(here) !== -1) {
    window.DD_AUTO_LINKIFY = { skipped: true };
    return;
  }

  function depth() {
    var p = location.pathname || '/';
    var n = p.split('/').filter(Boolean).length - 1;
    return n < 0 ? 0 : n;
  }
  function rootPrefix() {
    var d = depth();
    return d === 0 ? './' : new Array(d + 1).join('../');
  }
  function readerLink(path, fragment) {
    return rootPrefix() + 'reader.html?file=' +
           encodeURIComponent(path) + (fragment || '');
  }
  function pageLink(path) { return rootPrefix() + path; }

  var STATUTE_MAP = {
    '§ 23a ZoB':   '08-comms-templates/CNB-23A-CLEARANCE-REQUEST.md',
    '§23a ZoB':    '08-comms-templates/CNB-23A-CLEARANCE-REQUEST.md',
    '§ 19 ZDP':    '03-financial/TAX-STRUCTURE-MEMO.md',
    '§19 ZDP':     '03-financial/TAX-STRUCTURE-MEMO.md',
    '§ 56 ZDPH':   '03-financial/TAX-STRUCTURE-MEMO.md',
    '§56 ZDPH':    '03-financial/TAX-STRUCTURE-MEMO.md',
    '§ 21a ZoÚ':   '03-financial/sbirka-listin-audit.md',
    '§21a ZoÚ':    '03-financial/sbirka-listin-audit.md',
    '§ 21 ZoDluh': '08-comms-templates/BONDHOLDER-CONSENT-SOLICITATION.md',
    '§21 ZoDluh':  '08-comms-templates/BONDHOLDER-CONSENT-SOLICITATION.md',
    '§ 21a':       '03-financial/sbirka-listin-audit.md',
    '§21a':        '03-financial/sbirka-listin-audit.md'
  };

  var ICO_MAP = {
    '27825981': '02-entity/confirmed-entities.md',
    '10800123': '02-entity/entity-structure.md',
    '10978216': '02-entity/confirmed-entities.md',
    '09932836': '02-entity/confirmed-entities.md',
    '13995758': '02-entity/confirmed-entities.md',
    '21515841': '02-entity/confirmed-entities.md',
    '17053161': '02-entity/confirmed-entities.md',
    '09963758': '02-entity/confirmed-entities.md',
    '27890104': '02-entity/confirmed-entities.md',
    '14148978': '02-entity/entity-structure.md',
    '24654744': '01-intel/ppf-dd-profile.md',
    '24225657': '01-intel/ppf-dd-profile.md',
    '24908151': '01-intel/ppf-dd-profile.md',
    '24908487': '01-intel/ppf-dd-profile.md',
    '25099345': '01-intel/ppf-dd-profile.md',
    '27638987': '01-intel/ppf-dd-profile.md',
    '29030072': '01-intel/ppf-dd-profile.md',
    '10907718': '01-intel/ppf-dd-profile.md',
    '19696477': '01-intel/ppf-dd-profile.md'
  };

  var PATTERNS = [
    { name: 'subdir-md',
      re: /\b((?:[\w-]+\/)+[A-Z0-9][\w.\-]*\.md)\b/g,
      href: function (m) { return readerLink(m[1]); },
      title: function (m) { return 'Otevřít ' + m[1]; } },
    { name: 'root-md',
      re: /\b([A-Z][A-Z0-9\-]+\.md)\b/g,
      href: function (m) { return readerLink(m[1]); },
      title: function (m) { return 'Otevřít ' + m[1]; } },
    { name: 'subdir-html',
      re: /\b((?:[\w-]+\/)+[a-z][\w-]+\.html)\b/g,
      href: function (m) { return pageLink(m[1]); },
      title: function (m) { return 'Otevřít ' + m[1]; } },
    { name: 'rf',
      re: /\b(RF-\d+[A-Z]?)\b/g,
      href: function (m) {
        return readerLink('RED-FLAGS.md', '#' + m[1].toLowerCase());
      },
      title: function (m) { return 'Otevřít ' + m[1] + ' v RED-FLAGS.md'; } },
    { name: 'statute',
      re: /(§\s?(?:23a\s+ZoB|19\s+ZDP|56\s+ZDPH|21a\s+ZoÚ|21\s+ZoDluh|21a))/g,
      href: function (m) {
        var raw = m[1].replace(/\s+/g, ' ').trim();
        var t = STATUTE_MAP[raw] || STATUTE_MAP[raw.replace(/\s+/g, '')];
        return t ? readerLink(t) : null;
      },
      title: function () { return 'Otevřít související memo'; } },
    { name: 'ico',
      re: /\bIČO\s+(\d{8})\b|\b(\d{8})\b/g,
      href: function (m) {
        var ico = m[1] || m[2];
        var t = ICO_MAP[ico];
        if (t) return readerLink(t);
        return pageLink('02-entity/entity-graph.html');
      },
      title: function (m) { return 'Subjekt s IČO ' + (m[1] || m[2]); } },
    { name: 'spis',
      re: /\b(\d{1,3}\s+(?:Co|C|Cm|Sm|To|Tdo|EPR)\s+\d+\/\d{4}(?:-\d+)?)\b/g,
      href: function () { return readerLink('04-legal/DANCORE-FORENSIC-DOSSIER.md'); },
      title: function () { return 'Otevřít dosier DANCORE'; } }
  ];

  var SKIP_TAGS = {
    SCRIPT: 1, STYLE: 1, CODE: 1, PRE: 1, KBD: 1, A: 1,
    TEXTAREA: 1, BUTTON: 1, INPUT: 1, SELECT: 1, OPTION: 1, OPTGROUP: 1,
    LABEL: 1, MARK: 1
  };

  function shouldSkip(node) {
    // Note: we deliberately DO link inside Alpine x-text/x-html. Once Alpine
    // has rendered, the resulting text nodes are real DOM and safe to wrap.
    // If Alpine re-renders (data change), it overwrites our links; the next
    // refresh pass picks them up again.
    var p = node.parentElement;
    while (p) {
      if (SKIP_TAGS[p.tagName]) return true;
      var c = p.classList;
      if (c && (c.contains('no-linkify') ||
                c.contains('dd-xref') ||
                c.contains('dd-auto-linked') ||
                c.contains('rf-badge') ||
                c.contains('dd-entity-link') ||
                c.contains('dd-entity-mark'))) return true;
      p = p.parentElement;
    }
    return false;
  }

  function collectTextNodes(root) {
    var out = [];
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (shouldSkip(n)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var cur;
    while ((cur = walker.nextNode())) out.push(cur);
    return out;
  }

  function applyPatternToNode(node, spec) {
    var text = node.nodeValue;
    spec.re.lastIndex = 0;
    if (!spec.re.test(text)) return false;
    spec.re.lastIndex = 0;
    var frag = document.createDocumentFragment();
    var last = 0, m, any = false;
    while ((m = spec.re.exec(text)) !== null) {
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      var href = spec.href(m);
      if (href) {
        var a = document.createElement('a');
        a.className = 'dd-xref dd-auto-linked dd-auto-' + spec.name;
        a.textContent = m[0];
        a.href = href;
        var t = spec.title ? spec.title(m) : '';
        if (t) a.title = t;
        frag.appendChild(a);
        any = true;
      } else {
        frag.appendChild(document.createTextNode(m[0]));
      }
      last = m.index + m[0].length;
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    if (any) { node.parentNode.replaceChild(frag, node); return true; }
    return false;
  }

  function runPatterns(root) {
    var total = 0;
    PATTERNS.forEach(function (spec) {
      var nodes = collectTextNodes(root);
      nodes.forEach(function (n) { if (applyPatternToNode(n, spec)) total += 1; });
    });
    return total;
  }

  function runEntities(root) {
    if (!window.DD_ENTITY_INDEX || !window.DD_ENTITY_INDEX.linkifyEntities) return 0;
    try { return window.DD_ENTITY_INDEX.linkifyEntities(root) || 0; }
    catch (err) {
      console.warn('[dd-auto-linkify] entity linker failed:', err && err.message);
      return 0;
    }
  }

  function runAll(root) {
    root = root || document.body;
    if (!root) return { patterns: 0, entities: 0 };
    return { patterns: runPatterns(root), entities: runEntities(root) };
  }

  // No MutationObserver: walking the DOM on every reactive update locked
  // up sliders. Dashboards that need a re-link after async data should call
  // window.DD_AUTO_LINKIFY.refresh() directly from their own init handler.

  var ran = false;
  function init() {
    if (ran) return;
    ran = true;
    // First pass — static HTML.
    runPatterns(document.body);
    // Entity linking happens once after the entity index loads.
    if (window.DD_ENTITY_INDEX && window.DD_ENTITY_INDEX.ready) {
      Promise.resolve(window.DD_ENTITY_INDEX.ready()).then(function () {
        runEntities(document.body);
      });
    }
    // Two short late passes catch most Alpine x-for templates.
    // Deliberately no MutationObserver — it walked the DOM on every reactive
    // x-text update during slider drags, locking the UI. Dashboards that
    // want a refresh after their own data load should call
    // window.DD_AUTO_LINKIFY.refresh() explicitly.
    setTimeout(function () { runPatterns(document.body); }, 600);
    setTimeout(function () {
      runPatterns(document.body);
      runEntities(document.body);
    }, 2500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 0);
  }

  window.DD_AUTO_LINKIFY = {
    refresh: function () { return runAll(document.body); },
    refreshIn: function (root) { return runAll(root); },
    runPatterns: runPatterns,
    runEntities: runEntities
  };
})();
