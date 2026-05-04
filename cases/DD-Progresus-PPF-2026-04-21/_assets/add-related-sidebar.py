#!/usr/bin/env python3
"""
Inject the 📎 Related sidebar + connections.js into every curated dashboard.

Idempotent: skip if data-connections-sidebar="injected" marker already present.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

WORKSPACE = Path(__file__).resolve().parent.parent

DASHBOARDS = [
    "index.html",
    "executive-briefing.html",
    "export-pack.html",
    "sitemap.html",
    "search.html",
    "01-intel/ppf-governance.html",
    "01-intel/stakeholder-map.html",
    "02-entity/entity-graph.html",
    "02-entity/parcel-map.html",
    "03-financial/bond-stack.html",
    "03-financial/tax-calculator.html",
    "04-legal/dancore-timeline.html",
    "06-reports/valuation-calculator.html",
    "06-reports/red-flags-dashboard.html",
    "06-reports/roadmap-gantt.html",
    "06-reports/deal-journey.html",
    "08-comms-templates/comms-hub.html",
]


def assets_prefix(rel_path: str) -> str:
    depth = rel_path.count("/")
    return "./" if depth == 0 else "../" * depth


def build_sidebar_markup(rel_path: str) -> str:
    pfx = assets_prefix(rel_path)
    fname_js = rel_path.replace("'", "\\'")
    return f'''
  <!-- Related sidebar (injected by add-related-sidebar.py) -->
  <div data-connections-sidebar="injected" x-data="{{ openRel: false }}" class="no-print">
    <button type="button"
      @click="openRel = !openRel"
      class="fixed right-4 bottom-4 z-40 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium shadow-lg rounded-full px-4 py-2 flex items-center gap-2"
      aria-label="Přepnout související soubory">
      <span>📎</span><span>Související</span>
    </button>
    <aside
      x-show="openRel"
      x-transition
      @click.away="openRel = false"
      class="fixed right-4 bottom-20 z-40 w-80 max-h-[70vh] overflow-y-auto bg-gray-900 border border-gray-700 text-gray-100 rounded-lg shadow-2xl p-4"
      style="display: none;">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-white">📎 Související soubory</h3>
        <button type="button" @click="openRel = false" class="text-gray-400 hover:text-white" aria-label="Zavřít">✕</button>
      </div>
      <div id="connections-related-panel" class="text-sm">
        <p class="text-gray-500 italic">Načítání…</p>
      </div>
    </aside>
  </div>
  <script src="{pfx}_assets/connections.js"></script>
  <script>
    (function () {{
      if (!window.Connections) return;
      window.Connections.init().then(function () {{
        var el = document.getElementById('connections-related-panel');
        if (el) window.Connections.renderBacklinksPanel(el, '{fname_js}');
      }}).catch(function (err) {{
        var el = document.getElementById('connections-related-panel');
        if (el) el.textContent = 'Graf není dostupný: ' + err.message;
      }});
    }})();
  </script>
'''


def inject(html_path: Path, rel_path: str) -> bool:
    try:
        html = html_path.read_text(encoding="utf-8")
    except Exception:
        return False
    if 'data-connections-sidebar="injected"' in html:
        return False
    markup = build_sidebar_markup(rel_path)
    # Insert just before </body>
    idx = html.rfind("</body>")
    if idx < 0:
        return False
    new = html[:idx] + markup + html[idx:]
    html_path.write_text(new, encoding="utf-8")
    return True


def main() -> int:
    processed = 0
    changed = 0
    for rel in DASHBOARDS:
        fp = WORKSPACE / rel
        if not fp.exists():
            continue
        processed += 1
        if inject(fp, rel):
            changed += 1
    print(f"[related-sidebar] processed={processed} changed={changed}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
