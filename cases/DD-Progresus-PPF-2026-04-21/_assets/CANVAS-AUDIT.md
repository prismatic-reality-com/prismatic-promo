# Audit rozměrů canvas / grafů / map

Vygenerováno: statický sken pomocí `_assets/canvas-scan.py`.

**Legenda**
- `container_ok`: canvas je uvnitř obalu s explicitní výškou (`viz-container`, `h-*` nebo `#id{height:Npx}`).
- `mAR:false`: Chart.js `maintainAspectRatio: false` přítomné (vyžadováno když rodič má výšku).
- `resize`: `window.addEventListener("resize", …)` přítomné NEBO instance grafu používá Chart.js `.resize()`.
- `invalidate`: Leaflet `map.invalidateSize()` zavoláno (resize okna nebo ResizeObserver).
- `DPR`: P5 `pixelDensity(devicePixelRatio)` zavoláno pro ostré renderování na Retina displejích.

| Soubor | Canvases | Chart.js | Leaflet | P5 | container_ok | mAR:false | resize | invalidate | DPR | viz-debug | Verdikt |
|------|---------:|--------:|--------:|---:|:---:|:---:|:---:|:---:|:---:|:---:|:--------|
| index.html | 4 | 4 | 0 | 0 | YES | YES | YES | N/A | N/A | YES | OK |
| executive-briefing.html | 0 | 0 | 0 | 0 | NO | N/A | N/A | N/A | N/A | YES | OK |
| knowledge-graph.html | 0 | 0 | 0 | 0 | NO | N/A | N/A | N/A | N/A | YES | OK |
| 01-intel/ppf-governance.html | 0 | 0 | 0 | 1 | YES | N/A | N/A | N/A | YES | YES | OK |
| 01-intel/stakeholder-map.html | 1 | 1 | 0 | 0 | YES | YES | YES | N/A | N/A | YES | OK |
| 02-entity/entity-graph.html | 0 | 0 | 0 | 1 | YES | N/A | N/A | N/A | YES | YES | OK |
| 02-entity/parcel-map.html | 0 | 0 | 0 | 1 | YES | N/A | N/A | N/A | YES | YES | OK |
| 02-entity/geo-parcel-map.html | 0 | 0 | 1 | 0 | YES | N/A | YES | YES | N/A | YES | OK |
| 02-entity/entity-offices-map.html | 0 | 0 | 1 | 0 | YES | N/A | YES | YES | N/A | YES | OK |
| 03-financial/bond-stack.html | 3 | 3 | 0 | 0 | YES | YES | YES | N/A | N/A | YES | OK |
| 03-financial/tax-calculator.html | 2 | 2 | 0 | 0 | YES | YES | YES | N/A | N/A | YES | OK |
| 04-legal/dancore-timeline.html | 2 | 2 | 0 | 0 | YES | YES | YES | N/A | N/A | YES | OK |
| 06-reports/red-flags-dashboard.html | 2 | 2 | 0 | 0 | YES | YES | YES | N/A | N/A | YES | OK |
| 06-reports/valuation-calculator.html | 2 | 2 | 0 | 0 | YES | YES | YES | N/A | N/A | YES | OK |
| 06-reports/roadmap-gantt.html | 2 | 2 | 0 | 0 | YES | YES | YES | N/A | N/A | YES | OK |
| 06-reports/deal-journey.html | 0 | 0 | 0 | 0 | YES | N/A | N/A | N/A | N/A | YES | OK |
| 06-reports/geo-deal-overview.html | 0 | 0 | 1 | 0 | YES | N/A | YES | YES | N/A | YES | OK |
| 06-reports/relationships-matrix.html | 1 | 0 | 0 | 0 | YES | N/A | N/A | N/A | N/A | YES | OK |
| 08-comms-templates/comms-hub.html | 1 | 1 | 0 | 0 | YES | YES | YES | N/A | N/A | YES | OK |

**Souhrny**: 20 canvases · 19 Chart.js instancí · 3 Leaflet map · 3 P5 sketches · 19/19 souborů s viz-debug.js

**Úspěšnost**: 19/19 souborů bez problémů.

<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

Na tento soubor odkazují:

- [LINK-AUDIT.md](../LINK-AUDIT.md) — _assets/CANVAS-AUDIT.md (2×)
- [MASTER-FINDINGS.md](../MASTER-FINDINGS.md) — _assets/CANVAS-AUDIT.md (2×)
- [WORKSPACE-STATS.md](../WORKSPACE-STATS.md) — _assets/CANVAS-AUDIT.md (2×)
- [01-intel/README.md](../01-intel/README.md) — _assets/CANVAS-AUDIT.md
- [07-sources/README.md](../07-sources/README.md) — _assets/CANVAS-AUDIT.md

## 🏷️ Související soubory (podle shody tagů)

- [LINK-AUDIT.md](../LINK-AUDIT.md) — podobnost 0.43 · AUDIT ODKAZŮ
- [WORKSPACE-STATS.md](../WORKSPACE-STATS.md) — podobnost 0.31 · Statistiky pracovního prostoru — DD-Progresus-PPF-2026-04-21
- [07-sources/README.md](../07-sources/README.md) — podobnost 0.31 · 07-sources — Manifest důkazů a řetězec původu
- [01-intel/README.md](../01-intel/README.md) — podobnost 0.31 · 01-intel — Kontext transakce, stakeholdeři, komunikace
- [02-entity/README.md](../02-entity/README.md) — podobnost 0.31 · 02-entity — Korporátní struktura, katastr, řetězec vlastnických titulů

## 🌐 Pohled grafu

[Otevřít v portálu](../index.html) · [Mapa stránek](../sitemap.html) · [Hledat](../search.html) · Focus ID: `_assets%2FCANVAS-AUDIT.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
