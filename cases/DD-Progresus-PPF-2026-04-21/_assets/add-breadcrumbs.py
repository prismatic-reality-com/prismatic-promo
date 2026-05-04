#!/usr/bin/env python3
"""
Breadcrumb injector — adds <nav class="breadcrumb"> to every dashboard HTML.

Targets only curated dashboards (not raw/*). Idempotent: skip if class="breadcrumb" present.
"""
from __future__ import annotations

import os
import re
import sys
from pathlib import Path

WORKSPACE = Path(__file__).resolve().parent.parent

FOLDER_LABELS = {
    "01-intel": "🎯 01-intel",
    "02-entity": "🏢 02-entity",
    "03-financial": "💰 03-financial",
    "04-legal": "⚖️ 04-legal",
    "05-osint": "🔍 05-osint",
    "06-reports": "📊 06-reports",
    "07-sources": "📚 07-sources",
    "08-comms-templates": "✉️ 08-comms",
    "_assets": "⚙️ _assets",
}

# Curated dashboard whitelist (skip raw/ trees entirely).
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


def build_breadcrumb(rel_path: str) -> str:
    parts = rel_path.split("/")
    # depth → relative path back to root
    depth = len(parts) - 1
    to_root = "./" if depth == 0 else "../" * depth

    items: list[str] = []
    items.append(
        f'<li><a href="{to_root}index.html" class="hover:text-white hover:underline">🏠 Portal</a></li>'
    )

    # Walk folder chain
    # parts[:-1] is the list of folder segments. Current file is in parts[-1].
    # Depth == len(parts)-1 == number of folders the file sits inside.
    # Hops-back from the current file to reach a folder at index i is (depth - i - 1).
    cum = ""
    for i, segment in enumerate(parts[:-1]):
        cum = f"{cum}/{segment}" if cum else segment
        label = FOLDER_LABELS.get(segment, f"📂 {segment}")
        readme_candidate = WORKSPACE / cum / "README.md"
        hops_back = depth - i - 1
        back = "./" if hops_back == 0 else "../" * hops_back
        if readme_candidate.exists():
            href = f"{back}README.md" if hops_back == 0 else f"{back}{segment}/README.md"
        else:
            href = f"{back}" if hops_back == 0 else f"{back}{segment}/"
        items.append('<li class="text-gray-500">/</li>')
        items.append(
            f'<li><a href="{href}" class="hover:text-white hover:underline">{label}</a></li>'
        )

    # current file
    items.append(f'<li class="text-gray-500">/</li>')
    items.append(f'<li class="text-white font-medium">{parts[-1]}</li>')

    ol = "\n      ".join(items)
    return (
        '\n  <nav class="breadcrumb text-sm text-gray-400 mb-4 px-4 max-w-screen-2xl mx-auto no-print" aria-label="breadcrumb">\n'
        '    <ol class="flex flex-wrap items-center gap-2">\n'
        f'      {ol}\n'
        '    </ol>\n'
        '  </nav>\n'
    )


NAV_RE = re.compile(r"<nav\b[^>]*>", re.IGNORECASE)


def inject(html_path: Path, rel_path: str) -> bool:
    try:
        html = html_path.read_text(encoding="utf-8")
    except Exception:
        return False
    if 'class="breadcrumb"' in html or "class='breadcrumb'" in html:
        return False

    crumb = build_breadcrumb(rel_path)

    # Find first <nav ...>...</nav> and insert AFTER it.
    m = NAV_RE.search(html)
    if not m:
        # fall back: insert after <body ...>
        body_m = re.search(r"<body\b[^>]*>", html, re.IGNORECASE)
        if not body_m:
            return False
        insertion = body_m.end()
        new = html[:insertion] + crumb + html[insertion:]
    else:
        # find the matching </nav>
        tail = html[m.end():]
        close = re.search(r"</nav>", tail, re.IGNORECASE)
        if not close:
            # no closing nav; insert right after opening
            insertion = m.end()
        else:
            insertion = m.end() + close.end()
        new = html[:insertion] + crumb + html[insertion:]

    if new != html:
        html_path.write_text(new, encoding="utf-8")
        return True
    return False


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
    print(f"[breadcrumbs] processed={processed} changed={changed}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
