# Changelog — DD-Progresus-PPF-2026-04-21

**Pracovní prostor**: `~/dev/prismatic-platform/cases/DD-Progresus-PPF-2026-04-21/`
**Vlastník**: Tomáš Korčák (Able Group) — Discovery Lead & Chief Solution Architect
**Projekt**: Mycelium — 42 ha Nový Zeleneč, akciový obchod Progresus → PPF
**Stav**: 11 průchodů dokončeno · Pass-11 = český překlad + 13 portů kvant/viz/UX

---

## Pass 11 — Český překlad + 13 portů z prismatic-platform (2026-04-27)

**Zaměření**: Lokalizace celého workspace do češtiny + portování pokročilých analytických / vizualizačních / UX komponent z `~/dev/prismatic-platform` do statických HTML stránek běžících přes file://.

### Stopa A — Lokalizace (3 commity)
- **Překlad obsahu**: 65 .md + 27 .html souborů přeloženo do češtiny formálním obchodně-právním registrem. Zachovány: jména entit, IČO/HE/ISIN/k.ú./parcelní/LV čísla, DR-* IDs, soudní spisy, §-reference, URL, code bloky, datumy, měna.
- **4 čistící passy** odstranily zbývající anglické idiomy (262 doplňkových replacementů — share deal → akciový obchod, escrow → úschova, playbook → scénář, Master Index → Hlavní index, R&W → prohlášení a záruky).
- **Bug fixy v reader.html**: dvojité kódování URL (`reader.html?file=reader.html?file=...`), join cest pro kořenové soubory (`MISSION-COMPLETE.md/X.md`), guard pro `*.html(\?|#|$)`.
- **Cache invalidation**: sw.js v1.0.0 → v1.2.0; md-store / manifest-store / graph-store regenerovány.
- **Validace**: 914 interních linků funguje; 17/17 kritických ID zachováno.

### Stopa B — Kvantitativní porty (Iterace 1: A, B, C)
- **Port A — Monte Carlo valuation** (`06-reports/monte-carlo-valuation.html`, 900 řádků)
  - Box-Muller normal + lognormal + triangular distribuce
  - 1k / 10k / 100k iterací, weighted triangulace 4 metod
  - Histogram + fan chart + CDF + tornado sensitivity (Chart.js)
  - KPI: P10/P25/P50/P75/P90, P(<floor), VaR 95%
  - Default scénář: P50 = 4,46 mld., P(<3,7 mld) = 3,6%
- **Port B — PageRank + komunity + betweenness** (`knowledge-graph.html` + `_assets/knowledge-graph.js`)
  - PageRank (damping 0,85, 50 iter), label-propagation komunity, Brandes betweenness
  - <100 ms na 189 nodes / 460 edges
  - 3 panely výsledků: Top 10 vlivu / Komunity / Top 3 brokeři
- **Port C — Bayesian red-flags** (`06-reports/red-flags-dashboard.html`)
  - Per-flag prior 0,02–0,60 podle severity
  - Slider síly důkazů (0..1) → posterior odds × LR
  - Top-10 bar chart prior vs posterior, localStorage persist

### Stopa C — Vizualizační porty (Iterace 2: D, E, F)
- **Port D — Sankey bond stack** (`03-financial/bond-stack.html`)
  - Pure Canvas 2D (žádné externí knihovny)
  - 3 módy: Použití výtěžku / Splatnost / Status CoC
  - Bezier ribbons, tooltips, derive z existujícího `prospectuses` array
- **Port E — Globální ⌘K command palette** (`_assets/cmdk.js`, 682 řádků)
  - Self-contained vanilla JS, žádné závislosti
  - Fuzzy search napříč DD_MD_STORE + 24 HTML stránek + 9 vestavěných akcí
  - Diakritika (NFD strip), Czech locale sort, recents v localStorage
  - API: `window.DD_CMDK = { open, close, addAction, rebuild }`
  - Injektován do 24 HTML stránek (sjednoceno z původního command-palette.js)
- **Port F — Geo choropleth ČR krajů** (`02-entity/geo-parcel-map.html`)
  - 14 krajů s bbox approximation + centroid markery
  - ColorBrewer YlOrRd paleta, 4 módy (none/PPF/Progresus/kombinovaný)
  - Top-3 ranking podle metriky, click popups

### Stopa D — Linking porty (Iterace 3: G, H, I)
- **Port G — Sdílený URL state** (`_assets/dd-scenario.js`, 551 řádků + integrace ve 3 kalkulátorech)
  - Schema: floor / target / anchor / DCF/land/precedent/liquidation distribuce / weights / escrow / consent / dancore / structure / §19 / §54 / iterations
  - 4 presety: Default / Base case / PPF anchor / Walk-away test
  - Permalink sharing (`?floor=3.5&dcfMu=4.9&...`), base64 fallback >2000 znaků
  - Cross-tab sync přes `storage` event
- **Port H — Bidirectional entity ↔ document linking**
  - `_assets/build-entity-index.py` — Python build script (76 entit × 64 .md = 5503 zmínek)
  - `_assets/entity-mentions.json` — generated index (417 KB)
  - `_assets/dd-entity-index.js` — loader + API (`entitiesIn / mentionsOf / highlight`)
  - knowledge-graph: panel "Zmíněno v dokumentech" (top 10) → `reader.html?file=X&highlight=ENTITY`
  - reader: panel "Entity v dokumentu" + auto-highlight + autoscroll
- **Port I — Temporal replay 2007→2026** (`06-reports/deal-journey.html`)
  - 240-měsíční slider, 4 rychlosti (1×/2×/5×/10×)
  - 14 narrace milníků (Nuka 2007 → ÚP 2025 → PPF reality 2 2026)
  - `event-future` CSS (grayscale + opacity 0,3) na události po currentDate
  - Auto-pause na milníku, dismissable card overlay

### Stopa E — Operational porty (Iterace 4: J, K, L, M)
- **Port J — Cleanup duplicate palette**
  - 24 HTML stránek sjednoceno na cmdk.js (16 stránek získalo cmdk.js poprvé)
  - `_assets/inject-ux.py` aktualizován; starý `command-palette.js` orphaned
- **Port K — Live ticker** (`06-reports/live-ticker.html` + `_assets/ticker-feed.json`)
  - 30s polling + cross-tab sync přes storage event
  - Filtry (severity / autor / časové období), stats sidebar
  - Modal form, Czech relativní čas (před X min / před chvílí / včera)
- **Port L — Print/PDF pack** (`print-pack.html`, 635 řádků)
  - 7 sekcí: cover + one-pager + red-flags + DD exec summary + valuation summary + playbook Q1-Q10 + action plan P0
  - ~13–17 A4 stran, page-break + running header, runtime markdown-it z DD_MD_STORE
- **Port M — AB scenario compare** (`06-reports/scenario-compare.html`, 855 řádků)
  - 3-column grid (A / B / Diff) s color-coded borders
  - MC 10k iter + tax model (share/asset/hybrid + §19/§54)
  - Combined score, per-metric Vítězí A/B/Remíza pills
  - Permalink: `?a=Default&b=PPF anchor`
  - Příklad: Default vs PPF anchor → 5/5 metrik pro Default

### Stopa F — Maintenance (Iterace 5: N, O, P)
- **Port N — Service worker + manifest update**
  - sw.js cache version v1.1.0 → v1.2.0
  - SHELL_URLS rozšířen o nové dashboardy + asset knihovny + JSON indexy
  - manifest.json shortcuts: +Monte Carlo / +Porovnání scénářů / +Živý ticker / +Tiskový balík
- **Port O — Index regeneration**
  - `.manifest.json`: 162 souborů, 6 critical / 11 high / 1 medium severity
  - `.graph.json`: 214 nodes, 909 edges, 9 clusters
  - `_assets/md-store.js` (1,28 MB), `manifest-store.js` (128 KB), `graph-store.js` (291 KB)
  - `print-pack.html` + `live-ticker.html` injected with offline stores
- **Port P — CHANGELOG documentation** (tato sekce)

### Statistiky Pass-11
- **6 commitů**: 1b420dd → 0ab06d9 → 2991c47 → 9d1099b → 0b0c0c0 → ca9b919 → 90566b8
- **13 portů** (A–M) + 3 maintenance (N/O/P)
- **4 nové dashboardy**: Monte Carlo / Live ticker / Scenario compare / Print pack
- **9 nových asset souborů**: cmdk.js, dd-scenario.js, dd-entity-index.js, entity-mentions.json, build-entity-index.py, ticker-feed.json, knowledge-graph.js (rozšířený)
- **Workspace footprint**: 65 .md, 30 .html, 162 indexovaných souborů, 5503 entity mentions
- **Rollback**: `git reset --hard 1b420dd` (pre-translation baseline)

---

## Pass 10 — Pipeline pro renderování Markdownu (2026-04-21, večer/noc)

**Zaměření**: Aby se každý `.md` soubor renderoval pěkně v prohlížeči. Čtyři paralelní stopy doručující univerzální čtečku, podporu vkládání in-HTML, přepis směrování napříč 16 plochami a předrenderovaný statický balík pro offline/tisk.

- **Stopa A — Univerzální čtečka Markdownu + vendorovaný balík**
  - `reader.html` (941 řádků) — jednostránková čtečka, čte `?file=PATH`, renderuje s markdown-it + 8 pluginy + mermaid + highlight.js + sanitizace DOMPurify. ToC, přepínač raw/rendered (<kbd>R</kbd>), hluboké propojení.
  - `_assets/markdown/` (15 souborů, ~3,5 MB v balíku) — `markdown-it.min.js` + markdown-it-anchor + markdown-it-task-lists + markdown-it-footnote + markdown-it-mark + markdown-it-attrs + markdown-it-deflist + markdown-it-emoji + `highlight.js` + `mermaid.min.js` + `DOMPurify.min.js` + `custom.css`
- **Stopa B — Vkládání markdownu inline (HTML mimo čtečku)**
  - `_assets/md-embed.js` (422 řádků) — vkládat markdown bloky inline v libovolné HTML stránce
  - `_assets/hover-previews.js` v2 (364 řádků) — markdown náhledy při najetí nad libovolným odkazem `.md`
  - `_assets/inline-md-autoload.js` (319 řádků) — automatické líné načtení při rolování
  - **Injektováno do 23 HTML souborů** přes `_assets/inject-markdown-support.py`
- **Stopa C — Přepojení směrování + index dokumentů**
  - Všechny `.md` odkazy napříč 16 soubory přepojeny → `reader.html?file=PATH` (portál, mapa stránek, hledání, paleta příkazů, 8 README, manažerský briefing, 00-INDEX, kořenové README)
  - `md-index.html` (419 řádků) — procházet všech 67 markdown dokumentů, seskupené podle složek, vyhledávací pole, hluboce propojené do čtečky
  - `_assets/rewire-md-links.py` — jednorázový skript pro přepojení
- **Stopa D — Předrenderovaný statický balík (offline/tisk)**
  - `rendered/index.html` — statická úvodní stránka odkazující na 5 předrenderovaných dokumentů
  - `rendered/one-pager.html` — statický manažerský přehled A4 (8 KB)
  - `rendered/red-flags.html` — statický report red flags (16 KB)
  - `rendered/playbook.html` — statický scénář PPF (96 KB)
  - `rendered/master-report.html` — statický konsolidovaný master (140 KB)
  - `rendered/valuation.html` — statické memo k ocenění (68 KB)
  - `rendered/styles.css` — sdílený stylesheet připravený k tisku
  - `rendered/build.py` — regenerátor
  - `rendered/all-in-one.html` — **NOVÉ** přenosný balík v jednom souboru spojující všech 5 renderovaných dokumentů (e-mailovatelný)

**Audit odkazů**: `python3 /tmp/link_audit.py` → `TOTAL_LINKS=1590 · BROKEN_LINKS=0 · OK_LINKS=1590 · FILES=96`. Audit skript rozšířen o porozumění sémantice `reader.html?file=X` — 335 cest čtečky validováno proti souborovému systému (5 falešně pozitivních shod v šablonových řetězcích v Python zdrojích, přeskočeno).
**Manifest**: `python3 _assets/build-manifest.py` → 155 souborů indexováno, 143 KB.
**Tools Hub**: rostl z 22 → **29 ploch renderování** (22 interaktivních + 1 čtečka + 1 index + 5 předrenderovaných + all-in-one). Velikost pracovního prostoru: **~12 MB** / ~290 souborů.

---

## Pass 9 — Znalostní graf + Geo mapy + Power UX (2026-04-21, pozdní večer)

**Zaměření**: Proměnit pracovní prostor v navigovatelný analytický produkt. Čtyři paralelní stopy: vizuální znalostní graf, Leaflet geo vrstva, plný systém zpětných odkazů a UX pro pokročilé uživatele (paleta příkazů + klávesové zkratky + náhledy při najetí).

- **9A — Znalostní graf (vybráno)**
  - `knowledge-graph.html` + `_assets/knowledge-graph.js` (751 řádků) — p5.js silově orientovaný graf
  - `.graph.json` obohacen — **189 uzlů × 460 hran** (entity, lidé, dokumenty, vztahy)
  - `06-reports/relationships-matrix.html` + `_assets/relationships-matrix.js` — mřížka sousedství entita × entita
  - Portál `index.html`: vybraná hlavní karta pro Znalostní graf na vrcholu Tools Hub
- **9B — Leaflet Geo vrstva** (~167 KB v balíku)
  - `02-entity/geo-parcel-map.html` — k.ú. Mstětice 792764 katastrální parcelová vrstva (42 ha)
  - `02-entity/entity-offices-map.html` — každé zapsané sídlo Progresus + PPF (geokódováno z ARES)
  - `06-reports/geo-deal-overview.html` — souhrn kombinující parcely + sídla + jurisdikce
  - `_assets/leaflet/` — `leaflet.min.{css,js}` + ikony značek (bez CDN)
- **9C — Zpětné odkazy + drobečková navigace**
  - `_assets/build-backlinks.py` · `_assets/add-breadcrumbs.py` · `_assets/add-related-sidebar.py`
  - **66 markdown souborů** nyní obsahuje automaticky generované sekce `<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

Na tento soubor odkazují:

- [MISSION-COMPLETE.md](./MISSION-COMPLETE.md) — `CHANGELOG.md` (2×)
- [LINK-AUDIT.md](./LINK-AUDIT.md) — CHANGELOG.md
- [MASTER-FINDINGS.md](./MASTER-FINDINGS.md) — CHANGELOG.md

## 🏷️ Související soubory (podle shody tagů)

*Žádné silně související soubory (shoda tagů pod prahem 0,3).*

## 🌐 Pohled grafu

[Otevřít v portálu](./index.html) · [Mapa stránek](./sitemap.html) · [Hledat](./search.html) · Focus ID: `CHANGELOG.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
