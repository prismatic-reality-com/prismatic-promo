/* dd-entity-index.js
   ------------------------------------------------------------------
   Bidirectional cross-link between knowledge-graph entities and Markdown
   documents.

   Loads `_assets/entity-mentions.json` (built by build-entity-index.py),
   exposes a small API on `window.DD_ENTITY_INDEX`, and provides a DOM
   helper for in-place highlighting on the reader page.

   Public API:
     await DD_ENTITY_INDEX.ready();
     DD_ENTITY_INDEX.entitiesIn(filePath)   -> [{entity,count}]
     DD_ENTITY_INDEX.mentionsOf(entityName) -> [{path,count,title,snippet}]
     DD_ENTITY_INDEX.allEntities()          -> [name, ...]
     DD_ENTITY_INDEX.aliasesFor(name)       -> [alias, ...]
     DD_ENTITY_INDEX.highlight(rootEl, entityName)
                                            -> number of <mark> wrappers added
*/
(function () {
  'use strict';

  if (window.DD_ENTITY_INDEX && window.DD_ENTITY_INDEX.__init__) return;

  var STATE = {
    payload: null,
    promise: null,
    error: null
  };

  function jsonURL() {
    var here = document.currentScript && document.currentScript.src
      ? document.currentScript.src
      : null;
    if (here) {
      return here.replace(/[^/]+$/, 'entity-mentions.json');
    }
    return '_assets/entity-mentions.json';
  }

  function load() {
    if (STATE.promise) return STATE.promise;
    if (window.DD_ENTITY_MENTIONS && typeof window.DD_ENTITY_MENTIONS === 'object') {
      STATE.payload = window.DD_ENTITY_MENTIONS;
      STATE.promise = Promise.resolve(STATE.payload);
      return STATE.promise;
    }
    STATE.promise = fetch(jsonURL(), { cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (json) {
        STATE.payload = json;
        window.DD_ENTITY_MENTIONS = json;
        return json;
      })
      .catch(function (err) {
        STATE.error = err;
        console.warn('[dd-entity-index] load failed:', err && err.message);
        STATE.payload = { entities: {}, files: {}, meta: {} };
        return STATE.payload;
      });
    return STATE.promise;
  }

  function ready() { return load(); }

  function entitiesIn(filePath) {
    if (!STATE.payload || !filePath) return [];
    var list = STATE.payload.files && STATE.payload.files[filePath];
    return Array.isArray(list) ? list.slice() : [];
  }

  function mentionsOf(entityName) {
    if (!STATE.payload || !entityName) return [];
    var list = STATE.payload.entities && STATE.payload.entities[entityName];
    return Array.isArray(list) ? list.slice() : [];
  }

  function allEntities() {
    if (!STATE.payload) return [];
    return Object.keys(STATE.payload.entities || {});
  }

  function aliasesFor(name) {
    if (!name) return [];
    var out = [name];
    var stripped = name
      .replace(/\s+(a\.s\.|s\.r\.o\.?|spol\.?\s*s\s*r\.\s*o\.|v likvidaci)\.?\s*$/gi, '')
      .trim();
    if (stripped && stripped !== name) out.push(stripped);
    if (name.indexOf('IČO ') === 0) {
      out.push(name.slice(4).trim());
    }
    var seen = {};
    return out.filter(function (s) {
      if (!s || seen[s]) return false;
      seen[s] = 1;
      return true;
    });
  }

  // ------------------------------------------------------------------ //
  // Highlight                                                          //
  // ------------------------------------------------------------------ //
  var SKIP_TAGS = {
    'SCRIPT': 1, 'STYLE': 1, 'CODE': 1, 'PRE': 1, 'KBD': 1, 'TEXTAREA': 1,
    'MARK': 1, 'A': 1
  };

  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function buildHighlightRegex(entityName) {
    var aliases = aliasesFor(entityName)
      .filter(Boolean)
      .sort(function (a, b) { return b.length - a.length; });
    if (!aliases.length) return null;
    var alt = aliases.map(escapeRegex).join('|');
    // Lookbehind unsupported in Safari < 16.4 — fall back to a non-lookbehind
    // pattern when the modern regex throws SyntaxError.
    try {
      return new RegExp('(?<![A-Za-z0-9_])(' + alt + ')(?![A-Za-z0-9_])', 'gi');
    } catch (_) {
      return new RegExp('\\b(' + alt + ')\\b', 'gi');
    }
  }

  function highlight(root, entityName) {
    if (!root || !entityName) return 0;
    var rgx = buildHighlightRegex(entityName);
    if (!rgx) return 0;

    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue) return NodeFilter.FILTER_REJECT;
        var p = n.parentElement;
        while (p && p !== root) {
          if (SKIP_TAGS[p.tagName]) return NodeFilter.FILTER_REJECT;
          if (p.classList && p.classList.contains('dd-entity-mark')) {
            return NodeFilter.FILTER_REJECT;
          }
          p = p.parentElement;
        }
        rgx.lastIndex = 0;
        return rgx.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT
                                      : NodeFilter.FILTER_REJECT;
      }
    });

    var targets = [];
    var cur;
    while ((cur = walker.nextNode())) targets.push(cur);

    var hits = 0;
    targets.forEach(function (node) {
      var text = node.nodeValue;
      rgx.lastIndex = 0;
      var frag = document.createDocumentFragment();
      var last = 0;
      var m;
      while ((m = rgx.exec(text)) !== null) {
        if (m.index > last) {
          frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        }
        var mark = document.createElement('mark');
        mark.className = 'dd-entity-mark';
        mark.style.background = '#fde047';
        mark.style.color = '#111827';
        mark.style.padding = '0 2px';
        mark.style.borderRadius = '2px';
        mark.title = entityName;
        mark.textContent = m[0];
        frag.appendChild(mark);
        hits += 1;
        last = m.index + m[0].length;
      }
      if (last < text.length) {
        frag.appendChild(document.createTextNode(text.slice(last)));
      }
      if (frag.childNodes.length) node.parentNode.replaceChild(frag, node);
    });
    return hits;
  }

  // Map entity name -> preferred Czech source document.
  var ENTITY_TARGETS = {
    'PROGRESUS Group a.s.':       'reader.html?file=02-entity/confirmed-entities.md',
    'PROGRESUS invest holding s.r.o.': 'reader.html?file=02-entity/confirmed-entities.md',
    'PROGRESUS Developments s.r.o.': 'reader.html?file=02-entity/entity-structure.md',
    'PROGRESUS Gardens a.s.':     'reader.html?file=02-entity/confirmed-entities.md',
    'PROGRESUS IT s.r.o.':        'reader.html?file=02-entity/confirmed-entities.md',
    'PROGRESUS Marketing s.r.o.': 'reader.html?file=02-entity/confirmed-entities.md',
    'PROGRESUS Service center s.r.o.': 'reader.html?file=02-entity/confirmed-entities.md',
    'PROGRESUS R & D Alpha s.r.o.': 'reader.html?file=02-entity/confirmed-entities.md',
    'PROGRESUS Development Services s.r.o.': 'reader.html?file=02-entity/confirmed-entities.md',
    'PROGRESUS Development Acquisitions s.r.o.': 'reader.html?file=02-entity/confirmed-entities.md',
    'PROGRESUS Factories Acquisitions Alfa s.r.o.': 'reader.html?file=02-entity/confirmed-entities.md',
    'PROGRESUS RD Rymarov a.s.':  'reader.html?file=02-entity/confirmed-entities.md',
    'PROGRESUS RD Rymarov III a.s.': 'reader.html?file=02-entity/confirmed-entities.md',
    'PROGRESUS RD Rymarov IV a.s.': 'reader.html?file=02-entity/confirmed-entities.md',
    'RD Rymarov':                 'reader.html?file=02-entity/entity-structure.md',
    'RD Rymarov Invest Holding a.s.': 'reader.html?file=02-entity/confirmed-entities.md',
    'RD Rymarov Invest Develop a.s.': 'reader.html?file=02-entity/confirmed-entities.md',
    'RD Rymarov Invest III. alpha s.r.o.': 'reader.html?file=02-entity/entity-structure.md',
    'PROGRESUS RD Rýmařov a.s.':  'reader.html?file=02-entity/confirmed-entities.md',
    'PROGRESUS RD Rýmařov III a.s.': 'reader.html?file=02-entity/confirmed-entities.md',
    'PROGRESUS RD Rýmařov IV a.s.': 'reader.html?file=02-entity/confirmed-entities.md',
    'RD Rýmařov':                 'reader.html?file=02-entity/entity-structure.md',
    'RD Rýmařov Invest Holding a.s.': 'reader.html?file=02-entity/confirmed-entities.md',
    'RD Rýmařov Invest Develop a.s.': 'reader.html?file=02-entity/confirmed-entities.md',
    'RD Rýmařov Invest III. alpha s.r.o.': 'reader.html?file=02-entity/entity-structure.md',
    'Nový Zeleneč a.s.':          'reader.html?file=02-entity/land-title-chain.md',
    'Nuka Estates s.r.o.':        'reader.html?file=02-entity/confirmed-entities.md',
    'MARSEA MIA s.r.o.':          'reader.html?file=RED-FLAGS.md#rf-11',
    'DANCORE':                    'reader.html?file=04-legal/DANCORE-FORENSIC-DOSSIER.md',
    'DANCORE LLC':                'reader.html?file=04-legal/DANCORE-FORENSIC-DOSSIER.md',
    'CASPER':                     'reader.html?file=05-osint/insolvency-acquisition-pattern.md',
    'RONDAX':                     'reader.html?file=06-reports/consolidated-intel-2026-04-21-pass4.md',
    'Vitrablok':                  'reader.html?file=05-osint/insolvency-acquisition-pattern.md',
    'Ravantino Group':            'reader.html?file=01-intel/karlin-group-parallel-bidder-dossier.md',
    'Quinlan Private Residential II': 'reader.html?file=01-intel/karlin-group-parallel-bidder-dossier.md',
    'Karlin Group':               'reader.html?file=01-intel/karlin-group-parallel-bidder-dossier.md',
    'PPF':                        'reader.html?file=01-intel/ppf-dd-profile.md',
    'PPF a.s.':                   'reader.html?file=01-intel/ppf-dd-profile.md',
    'PPF Banka':                  'reader.html?file=01-intel/ppf-dd-profile.md',
    'PPF Real Estate Holding':    'reader.html?file=01-intel/ppf-dd-profile.md',
    'PPF reality 2 s.r.o.':       'reader.html?file=01-intel/ppf-dd-profile.md',
    'Petr Kellner':               'reader.html?file=01-intel/ppf-people-dossiers.md',
    'Renata Kellnerova':          'reader.html?file=01-intel/ppf-people-dossiers.md',
    'Josef Lebr':                 'reader.html?file=05-osint/insolvency-acquisition-pattern.md',
    'Pavlina Zdarilova':          'reader.html?file=04-legal/legal-exposure.md',
    'HP (Hospodarske Pozemky)':   'reader.html?file=02-entity/HP-sharing-ban-resolution.md',
    'CUZK':                       'reader.html?file=02-entity/cuzk-cadastre-forensics.md',
    'CNB':                        'reader.html?file=08-comms-templates/CNB-23A-CLEARANCE-REQUEST.md',
    'UOHS':                       'reader.html?file=04-legal/legal-exposure.md',
    'ARES':                       'reader.html?file=03-financial/sbirka-listin-audit.md',
    'Hlidac statu':               'reader.html?file=01-intel/principals-deep-osint.md'
  };

  var ICO_TO_TARGET = {
    '27825981': 'reader.html?file=02-entity/confirmed-entities.md',
    '10800123': 'reader.html?file=02-entity/entity-structure.md',
    '10978216': 'reader.html?file=02-entity/confirmed-entities.md',
    '09932836': 'reader.html?file=02-entity/confirmed-entities.md',
    '13995758': 'reader.html?file=02-entity/confirmed-entities.md',
    '21515841': 'reader.html?file=02-entity/confirmed-entities.md',
    '17053161': 'reader.html?file=02-entity/confirmed-entities.md',
    '09963758': 'reader.html?file=02-entity/confirmed-entities.md',
    '27890104': 'reader.html?file=02-entity/confirmed-entities.md',
    '14148978': 'reader.html?file=02-entity/entity-structure.md',
    '14270447': 'reader.html?file=02-entity/confirmed-entities.md',
    '14295521': 'reader.html?file=02-entity/confirmed-entities.md',
    '13956728': 'reader.html?file=02-entity/confirmed-entities.md',
    '13957384': 'reader.html?file=02-entity/confirmed-entities.md',
    '10916644': 'reader.html?file=02-entity/confirmed-entities.md',
    '10977414': 'reader.html?file=02-entity/confirmed-entities.md',
    '10745246': 'reader.html?file=02-entity/confirmed-entities.md',
    '10958452': 'reader.html?file=02-entity/confirmed-entities.md',
    '10907718': 'reader.html?file=01-intel/ppf-dd-profile.md',
    '19696477': 'reader.html?file=01-intel/ppf-dd-profile.md',
    '24225657': 'reader.html?file=01-intel/ppf-dd-profile.md',
    '24654744': 'reader.html?file=01-intel/ppf-dd-profile.md',
    '24908151': 'reader.html?file=01-intel/ppf-dd-profile.md',
    '24908487': 'reader.html?file=01-intel/ppf-dd-profile.md',
    '25099345': 'reader.html?file=01-intel/ppf-dd-profile.md',
    '26861054': 'reader.html?file=01-intel/ppf-dd-profile.md',
    '27638987': 'reader.html?file=01-intel/ppf-dd-profile.md',
    '29030072': 'reader.html?file=01-intel/ppf-dd-profile.md',
    '03454029': 'reader.html?file=01-intel/ppf-dd-profile.md',
    '18031862': 'reader.html?file=01-intel/ppf-dd-profile.md',
    '18031919': 'reader.html?file=01-intel/ppf-dd-profile.md'
  };

  function targetFor(entityName) {
    if (!entityName) return null;
    if (ENTITY_TARGETS[entityName]) return ENTITY_TARGETS[entityName];
    var icoMatch = entityName.match(/^I[CČ]O\s+(\d{8})$/);
    if (icoMatch) {
      return ICO_TO_TARGET[icoMatch[1]] || '02-entity/entity-graph.html';
    }
    return '02-entity/entity-graph.html';
  }

  function linkifyEntities(root, options) {
    if (!root || !STATE.payload) return 0;
    options = options || {};
    var only = options.only || null;
    var ents = allEntities();
    if (only) ents = ents.filter(function (n) { return only.indexOf(n) !== -1; });
    ents.sort(function (a, b) { return b.length - a.length; });

    var hits = 0;
    ents.forEach(function (entityName) {
      var rgx = buildHighlightRegex(entityName);
      if (!rgx) return;
      var href = targetFor(entityName);
      if (!href) return;

      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: function (n) {
          if (!n.nodeValue) return NodeFilter.FILTER_REJECT;
          var p = n.parentElement;
          while (p && p !== root) {
            if (SKIP_TAGS[p.tagName]) return NodeFilter.FILTER_REJECT;
            if (p.classList && p.classList.contains('dd-entity-link')) {
              return NodeFilter.FILTER_REJECT;
            }
            p = p.parentElement;
          }
          rgx.lastIndex = 0;
          return rgx.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT
                                        : NodeFilter.FILTER_REJECT;
        }
      });

      var targets = [];
      var cur;
      while ((cur = walker.nextNode())) targets.push(cur);

      targets.forEach(function (node) {
        rgx.lastIndex = 0;
        var text = node.nodeValue;
        var frag = document.createDocumentFragment();
        var last = 0;
        var m;
        while ((m = rgx.exec(text)) !== null) {
          if (m.index > last) {
            frag.appendChild(document.createTextNode(text.slice(last, m.index)));
          }
          var a = document.createElement('a');
          a.className = 'dd-xref dd-entity-link';
          a.textContent = m[0];
          a.href = href;
          a.title = 'Otevřít zdroj — ' + entityName;
          frag.appendChild(a);
          hits += 1;
          last = m.index + m[0].length;
        }
        if (last < text.length) {
          frag.appendChild(document.createTextNode(text.slice(last)));
        }
        if (frag.childNodes.length) node.parentNode.replaceChild(frag, node);
      });
    });

    return hits;
  }

  window.DD_ENTITY_INDEX = {
    __init__: true,
    ready: ready,
    entitiesIn: entitiesIn,
    mentionsOf: mentionsOf,
    allEntities: allEntities,
    aliasesFor: aliasesFor,
    highlight: highlight,
    linkifyEntities: linkifyEntities,
    targetFor: targetFor,
    get payload() { return STATE.payload; }
  };

  load();
})();
