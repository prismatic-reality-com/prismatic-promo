# Statistiky pracovního prostoru — DD-Progresus-PPF-2026-04-21

**Snapshot**: 2026-04-21 (uzávěrka Pass 10)
**Kořen pracovního prostoru**: `~/dev/prismatic-platform/cases/DD-Progresus-PPF-2026-04-21/`
**Klasifikace**: DŮVĚRNÉ — Podpora DD na straně prodávajícího

---

## Soubory

| Kategorie                   | Počet | Poznámky |
|----------------------------|------:|-------|
| Markdown (`.md`)           |    68 | Briefy, memo, README, scénáře |
| HTML (`.html`)             |    87 | Portál + 22 interaktivních přehledů + 1 univerzální čtečka + 1 index dokumentů + 5 předrenderovaných + 1 all-in-one + tisku-čisté dvojče + nápověda klávesnice |
| PWA balík                  |     1 | `manifest.json` + `sw.js` + `_assets/icon-192.png` + icon-512 |
| JS/CSS knihovny (vendorované)|    28 | Tailwind, Flowbite CSS+JS, Alpine.js, Chart.js, p5.js, three.js, Leaflet CSS+JS, command-palette, hover-previews, keyboard-shortcuts, state-sync, knowledge-graph, connections, relationships-matrix, **markdown-it + 7 plugins (Pass 10)**, **highlight.js (Pass 10)**, **mermaid (Pass 10)**, **DOMPurify (Pass 10)**, md-embed, inline-md-autoload |
| Velikost `_assets/`        | ~6,5 MB | Vše offline, žádná závislost na CDN |
| Velikost `_assets/markdown/`   | ~3,5 MB | markdown-it + 8 plugins + highlight.js + mermaid + DOMPurify + custom.css **(Pass 10)** |
| Velikost `_assets/leaflet/`    | ~176 KB | Leaflet 1.x + ikony markerů |
| Velikost balíku `rendered/`    | ~372 KB | 5 předrenderovaných HTML + styles + build.py **(Pass 10)** |
| **Celková velikost pracovního prostoru**   | **~12 MB** | |
| **Celkem souborů**            | **~290** | Včetně syrových důkazních dumpů a přírůstků Pass-10 |

---

## Sledovaný obsah

| Metrika                                | Počet | Rozpis |
|---------------------------------------|------:|-----------|
| Sledované akce                        |   132 | 32 P0 · 42 P1 · 58 P2 |
| Red flags                             |    30 | 18 KRITICKÝCH · 12 VYSOKÝCH · 6 VYŘEŠENÝCH/degradovaných |
| Zmapované entity strany Progresus     |   25+ | Provozní společnosti, SPV, holdingy, emitenti dluhopisů |
| Zmapované entity strany PPF           |   20+ | PPF reality 2 plus mateřský řetězec až k CY holdingu |
| Klíčové osoby s plnými dossiery       |    16 | 8 principálů PPF + 8 principálů prodávajícího/poradců |
| Tematické adresáře (s README.md)      |     8 | `01-intel` … `08-comms-templates` |
| Interaktivní přehledy                 |    22 | JS-náročné přehledy (Chart.js / Leaflet / p5.js / Alpine) |
| Pass-10 markdown plochy               |     7 | Reader + Index dokumentů + 5 předrenderovaných + all-in-one |
| **Celkem ploch renderování**          |  **29** | 22 interaktivních + 1 reader + 1 md-index + 5 předrenderovaných (+ 1 all-in-one balík) |
| **Znalostní graf — uzly**             |   189 | Entity, lidé, dokumenty, rozhodovací artefakty |
| **Znalostní graf — hrany**            |   460 | Křížové reference, důkazní odkazy, vlastnictví, workflow |

---

## Infrastruktura křížových referencí a hledání

| Aktivum                               | Účel |
|---------------------------------------|---------|
| `.graph.json` (284 KB)                | Plný křížový referenční graf — uzly = soubory + entity, hrany = vztahy |
| `.manifest.json` (132 KB)             | Index hledání s úryvky napříč 146 MD+HTML soubory |
| `knowledge-graph.html` (Pass 9)       | Interaktivní p5.js force-directed prohlížeč grafu |
| `06-reports/relationships-matrix.html` (Pass 9) | Mřížka sousedství entita × entita |
| `search.html`                         | Klientské fuzzy-search UI nad `.manifest.json` |
| `sitemap.html`                        | Vizuální adresářový strom |
| `keyboard-help.html` (Pass 9)         | Plná reference klávesové mapy (⌘K, g-nav, /-fokus, ?-nápověda) |
| Offline PWA                           | Všechny nástroje fungují offline po první návštěvě; service worker cachuje `_assets/`, top-level HTML a nedávné MD |

---

## Systém zpětných odkazů / navigace (Pass 9)

| Metrika                                | Počet |
|---------------------------------------|------:|
| Markdown soubory s auto-generovanými sekcemi `<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

Na tento soubor odkazují:

- [LINK-AUDIT.md](./LINK-AUDIT.md) — WORKSPACE-STATS.md (2×)
- [MASTER-FINDINGS.md](./MASTER-FINDINGS.md) — WORKSPACE-STATS.md (2×)
- [MISSION-COMPLETE.md](./MISSION-COMPLETE.md) — `WORKSPACE-STATS.md` (2×)
- [_assets/CANVAS-AUDIT.md](./_assets/CANVAS-AUDIT.md) — WORKSPACE-STATS.md (2×)

## 🏷️ Související soubory (podle shody tagů)

- [LINK-AUDIT.md](./LINK-AUDIT.md) — podobnost 0.33 · AUDIT ODKAZŮ
- [_assets/CANVAS-AUDIT.md](./_assets/CANVAS-AUDIT.md) — podobnost 0.31 · Audit rozměrů canvas / grafů / map

## 🌐 Pohled grafu

[Otevřít v portálu](./index.html) · [Mapa stránek](./sitemap.html) · [Hledat](./search.html) · Focus ID: `WORKSPACE-STATS.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
