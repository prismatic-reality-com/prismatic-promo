#!/usr/bin/env python3
"""Inject the viz-debug.js script tag into every audited HTML file that has a
<canvas>, a p5 hook, or a Leaflet map. Idempotent.
"""
from __future__ import annotations
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TARGETS = [
    'index.html',
    'executive-briefing.html',
    'knowledge-graph.html',
    '01-intel/ppf-governance.html',
    '01-intel/stakeholder-map.html',
    '02-entity/entity-graph.html',
    '02-entity/parcel-map.html',
    '02-entity/geo-parcel-map.html',
    '02-entity/entity-offices-map.html',
    '03-financial/bond-stack.html',
    '03-financial/tax-calculator.html',
    '04-legal/dancore-timeline.html',
    '06-reports/red-flags-dashboard.html',
    '06-reports/valuation-calculator.html',
    '06-reports/roadmap-gantt.html',
    '06-reports/deal-journey.html',
    '06-reports/geo-deal-overview.html',
    '06-reports/relationships-matrix.html',
    '08-comms-templates/comms-hub.html',
]


def rel_prefix(path: Path) -> str:
    depth = len(path.relative_to(ROOT).parts) - 1
    return '../' * depth if depth else './'


def inject(path: Path) -> str:
    if not path.exists():
        return 'missing'
    text = path.read_text(encoding='utf-8')
    if 'viz-debug.js' in text:
        return 'already'
    prefix = rel_prefix(path)
    tag = f'<script defer src="{prefix}_assets/viz-debug.js"></script>'
    # inject just before </body>
    if '</body>' not in text:
        return 'no-body'
    text = text.replace('</body>', f'  {tag}\n</body>', 1)
    path.write_text(text, encoding='utf-8')
    return 'injected'


def main() -> int:
    summary = {'injected': 0, 'already': 0, 'missing': 0, 'no-body': 0}
    for rel in TARGETS:
        p = ROOT / rel
        r = inject(p)
        summary[r] = summary.get(r, 0) + 1
        print(f'{r:9s}  {rel}')
    print()
    print('summary:', summary)
    return 0


if __name__ == '__main__':
    sys.exit(main())
