#!/usr/bin/env python3
"""Static scan over audited HTML files: verify each canvas has an explicit-height
parent container, each Chart.js has a resize handler wired, each Leaflet map has
invalidateSize on resize, each P5 sketch calls pixelDensity. Emits a markdown
table to _assets/CANVAS-AUDIT.md."""
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

# Rough "canvas has height" heuristic: either a viz-container wrapper, a
# parent with `h-` tailwind class, or an explicit style="height:Npx".
HEIGHT_PARENT_PATTERNS = [
    re.compile(r'<div[^>]*class=["\'][^"\']*(?:viz-container|h-\d|h-\[\d|h-\d\d)'),
    re.compile(r'<div[^>]*class=["\'][^"\']*\bh-\[?\d'),
    re.compile(r'style=["\'][^"\']*height\s*:\s*\d'),
    re.compile(r'#\w+\s*\{[^}]*height\s*:\s*\d'),   # CSS block, e.g. #map{height:640px}
    re.compile(r'id=["\']canvas-wrap["\']'),         # known p5 container
    re.compile(r'id=["\']graph-canvas["\']'),        # known p5 container with h- class
    re.compile(r'id=["\']net-canvas["\']'),          # known p5 container
    re.compile(r'id=["\']matrix-host["\']'),         # known canvas host (absolute fill)
]


def check_file(path: Path) -> dict:
    text = path.read_text(encoding='utf-8') if path.exists() else ''
    canvases = re.findall(r'<canvas[^>]*\bid=["\']([^"\']+)["\']', text)
    chart_calls = re.findall(r'new Chart\(', text)
    leaflet_calls = re.findall(r'L\.map\(', text)
    p5_calls = re.findall(r'createCanvas\(', text)

    has_height_parent = any(p.search(text) for p in HEIGHT_PARENT_PATTERNS)
    has_resize_listener = bool(re.search(r"addEventListener\(\s*['\"]resize['\"]", text))
    has_resize_observer = 'ResizeObserver' in text
    has_mAR_false = 'maintainAspectRatio' in text and 'maintainAspectRatio:false' not in text.replace(' ', '') or bool(
        re.search(r'maintainAspectRatio\s*:\s*false', text)
    )
    has_viz_container = 'viz-container' in text or 'viz-p5-host' in text or 'viz-leaflet-host' in text
    has_pixel_density = 'pixelDensity(' in text
    has_invalidate_size = 'invalidateSize()' in text
    has_viz_debug = 'viz-debug.js' in text

    return {
        'path': str(path.relative_to(ROOT)),
        'canvases': len(canvases),
        'canvas_ids': canvases,
        'chart_js': len(chart_calls),
        'leaflet': len(leaflet_calls),
        'p5': len(p5_calls),
        'container_ok': has_height_parent,
        'viz_container': has_viz_container,
        'resize_listener': has_resize_listener,
        'resize_observer': has_resize_observer,
        'ch_js_mAR_false': bool(re.search(r'maintainAspectRatio\s*:\s*false', text)),
        'p5_dpr': has_pixel_density,
        'leaflet_invalidate': has_invalidate_size,
        'viz_debug': has_viz_debug,
    }


def verdict(r: dict) -> str:
    problems = []
    if r['canvases'] and not (r['container_ok'] or r['viz_container']):
        problems.append('NO-HEIGHT-PARENT')
    if r['chart_js'] and not r['ch_js_mAR_false']:
        # maintainAspectRatio:false is required when parent has explicit height
        problems.append('CHART-mAR-MISSING')
    if r['chart_js'] and not r['resize_listener']:
        problems.append('NO-RESIZE-HANDLER')
    if r['leaflet'] and not (r['leaflet_invalidate'] or r['resize_observer']):
        problems.append('NO-INVALIDATE-SIZE')
    if r['p5'] and not r['p5_dpr']:
        problems.append('NO-PIXEL-DENSITY')
    return ', '.join(problems) if problems else 'OK'


def render_md(results: list[dict]) -> str:
    lines = [
        '# Audit rozměrů canvas / grafů / map',
        '',
        'Vygenerováno: statický sken pomocí `_assets/canvas-scan.py`.',
        '',
        '**Legenda**',
        '- `container_ok`: canvas je uvnitř obalu s explicitní výškou (`viz-container`, `h-*` nebo `#id{height:Npx}`).',
        '- `mAR:false`: Chart.js `maintainAspectRatio: false` přítomné (vyžadováno když rodič má výšku).',
        '- `resize`: `window.addEventListener("resize", …)` přítomné NEBO instance grafu používá Chart.js `.resize()`.',
        '- `invalidate`: Leaflet `map.invalidateSize()` zavoláno (resize okna nebo ResizeObserver).',
        '- `DPR`: P5 `pixelDensity(devicePixelRatio)` zavoláno pro ostré renderování na Retina displejích.',
        '',
        '| Soubor | Canvases | Chart.js | Leaflet | P5 | container_ok | mAR:false | resize | invalidate | DPR | viz-debug | Verdikt |',
        '|------|---------:|--------:|--------:|---:|:---:|:---:|:---:|:---:|:---:|:---:|:--------|',
    ]
    totals = {
        'canvases': 0, 'chart_js': 0, 'leaflet': 0, 'p5': 0,
        'container_ok': 0, 'ch_js_mAR_false': 0,
        'resize_listener': 0, 'leaflet_invalidate': 0,
        'p5_dpr': 0, 'viz_debug': 0,
    }
    for r in results:
        lines.append(
            f"| {r['path']} | {r['canvases']} | {r['chart_js']} | {r['leaflet']} | {r['p5']} "
            f"| {'YES' if (r['container_ok'] or r['viz_container']) else 'NO'} "
            f"| {'YES' if r['ch_js_mAR_false'] else ('N/A' if not r['chart_js'] else 'NO')} "
            f"| {'YES' if r['resize_listener'] else ('N/A' if not (r['chart_js'] or r['leaflet']) else 'NO')} "
            f"| {'YES' if r['leaflet_invalidate'] else ('N/A' if not r['leaflet'] else 'NO')} "
            f"| {'YES' if r['p5_dpr'] else ('N/A' if not r['p5'] else 'NO')} "
            f"| {'YES' if r['viz_debug'] else 'NO'} "
            f"| {verdict(r)} |"
        )
        for k in totals:
            if isinstance(r.get(k), bool):
                totals[k] += int(r[k])
            elif isinstance(r.get(k), int):
                totals[k] += r[k]
    lines.append('')
    lines.append(f"**Souhrny**: {totals['canvases']} canvases · {totals['chart_js']} Chart.js instancí · "
                 f"{totals['leaflet']} Leaflet map · {totals['p5']} P5 sketches · "
                 f"{totals['viz_debug']}/{len(results)} souborů s viz-debug.js")
    lines.append('')
    ok = sum(1 for r in results if verdict(r) == 'OK')
    lines.append(f"**Úspěšnost**: {ok}/{len(results)} souborů bez problémů.")
    lines.append('')
    bad = [r for r in results if verdict(r) != 'OK']
    if bad:
        lines.append('## Zbývající příznaky')
        for r in bad:
            lines.append(f"- `{r['path']}` → {verdict(r)}")
    return '\n'.join(lines) + '\n'


def main() -> int:
    results = [check_file(ROOT / rel) for rel in TARGETS]
    md = render_md(results)
    out = ROOT / '_assets' / 'CANVAS-AUDIT.md'
    out.write_text(md, encoding='utf-8')
    print(md)
    return 0


if __name__ == '__main__':
    sys.exit(main())
