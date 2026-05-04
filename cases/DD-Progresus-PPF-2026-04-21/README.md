# Projekt Mycelium — DD velitelství

**Progresus → PPF | Nový Zeleneč 42 ha | Cíl 5–6 mld. CZK | Minimální cena 3,7 mld. | Kotva 6,5 mld.**

Pracovní prostor pro M&A due diligence na straně prodávajícího. Offline-schopná PWA · 7stránkový manažerský briefing · triangulace ocenění 4 metodami · 30 aktivních red flags · akční plán na 132 položek.

Klasifikace: **DŮVĚRNÉ — pouze tým prodávajícího.** Verze 2.1 · 2026-04-21.

---

## 🚀 Jak prohlížet tento pracovní prostor

**Možnost A: Statické prohlížení souboru (omezené)**
Otevřete `index.html` přímo v moderním prohlížeči. Renderování Markdownu přes reader je vestavěné (md-store.js obsahuje celý korpus), ale některé dynamické fetche mohou být blokovány restrikcemi `file://` v prohlížeči.

**Možnost B: Lokální HTTP server (doporučeno) — plná funkcionalita**

```bash
cd ~/dev/prismatic-platform/cases/DD-Progresus-PPF-2026-04-21
./serve.sh              # Mac/Linux
serve.bat               # Windows
```

Pak otevřete <http://localhost:8000/index.html>. Výchozí port je `8000`; vlastní port předejte jako první argument (`./serve.sh 8080`).

**Možnost C: Instalace jako PWA**
V Chrome/Edge otevřete `index.html` a poté použijte akci „Install Mycelium DD…" v adresním řádku — nainstaluje se jako samostatná desktopová aplikace, plně offline.

**Audit cest + testy ploch**

```bash
python3 _assets/test-routes.py         # statická integrita odkazů → _assets/ROUTE-AUDIT.md
open test-all.html                     # in-browser load/iframe test ploch
```

---

## Rychlé odkazy

- 📖 [Markdown Reader](./reader.html) — **univerzální renderer** (vybráno v Pass 10) — libovolný `.md` přes `?file=PATH`
- 📚 [Index dokumentů](./md-index.html) — všech 67 markdown dokumentů, seskupené, prohledávatelné
- 🖨️ [Předrenderovaný balík](./rendered/index.html) — 5 předrenderovaných HTML, offline/k tisku
- 📦 [All-in-One HTML](./rendered/all-in-one.html) — jeden přenosný soubor (e-mailovatelný)
- 🏠 [Interaktivní portál](./index.html) — Flowbite přehled, mapa stakeholderů, živý ticker
- 🕸️ [Znalostní graf](./knowledge-graph.html) — **Force-directed mapa 189 uzlů × 460 hran** (vybráno v Pass 9)
- 🔲 [Matice vztahů](./06-reports/relationships-matrix.html) — mřížka sousedství entita × entita
- 🗺️ [Geo mapa parcel](./02-entity/geo-parcel-map.html) — Leaflet katastrální vrstva (Mstětice, 42 ha)
- 🏢 [Mapa sídel entit](./02-entity/entity-offices-map.html) — Leaflet mapa všech zapsaných sídel
- 🌍 [Mapa přehledu transakci](./06-reports/geo-deal-overview.html) — Leaflet roll-up (parcely + sídla)
- ⌨️ [Klávesové zkratky](./keyboard-help.html) — paleta ⌘K, g-nav, náhledy, synchronizace stavu
- 🔍 [Hledání](./search.html) — fulltext nad pracovním prostorem
- 🗺️ [Mapa stránek](./sitemap.html) — každý soubor, každá cesta
- 📋 [Manažerský briefing](./executive-briefing.html) — **7stránkový A4 briefing pro Zrůsta připravený k tisku**
- 🚨 [Přehled red flags](./06-reports/red-flags-dashboard.html) — interaktivní matice 30 flagů
- 💰 [Kalkulačka ocenění](./06-reports/valuation-calculator.html) — živý DCF + posuvníky scénářů
- 📂 [Hlavní index (`00-INDEX.md`)](./reader.html?file=00-INDEX.md) — všech 67 MD souborů uspořádaných podle případu užití
- 📦 [Exportní balík](./export-pack.html) — bezpečné dodací balíky (5 variant)

> **Tip:** Stiskněte <kbd>⌘K</kbd> kdekoli v portálu pro globální paletu příkazů. Stiskněte <kbd>?</kbd> pro plnou klávesovou mapu.

## Začněte zde (tradiční pohled na soubory)

- 📄 **Podkladový list A4**: [`EXECUTIVE-ONE-PAGER.md`](./reader.html?file=EXECUTIVE-ONE-PAGER.md) — k tisku, klíčová fakta + otázky PPF + červené linie
- 🎯 **Protiútočné otázky a odpovědi pro PPF**: [`PPF-PLAYBOOK.md`](./reader.html?file=PPF-PLAYBOOK.md) v2.0 — 20 předem zodpovězených otázek + skripty
- 🚨 **Aktivní flagy**: [`RED-FLAGS.md`](./reader.html?file=RED-FLAGS.md) — 18 KRITICKÝCH + 12 VYSOKÝCH + 6 vyřešených

## Stack baseline memo pro představenstvo

1. [`06-reports/MASTER-DD-REPORT-v1.0.md`](./reader.html?file=06-reports/MASTER-DD-REPORT-v1.0.md)
2. [`06-reports/VALUATION-DEFENSE-MEMO.md`](./reader.html?file=06-reports/VALUATION-DEFENSE-MEMO.md) — triangulace 4 metodami
3. [`06-reports/MASTER-ACTION-PLAN.md`](./reader.html?file=06-reports/MASTER-ACTION-PLAN.md) — 32 P0 / 42 P1 / 58 P2
4. [`06-reports/DATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md`](./reader.html?file=06-reports/DATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md)

## Adresáře

| Adresář | Účel |
|-----|---------|
| [`01-intel/`](./reader.html?file=01-intel/README.md) | PPF dossiery, lavička poradců, Karlín Group, komunikační stopa |
| [`02-entity/`](./reader.html?file=02-entity/README.md) | Katastrální forenzika, řetězec titulu, ověřené entity |
| [`03-financial/`](./reader.html?file=03-financial/README.md) | Soubor dluhopisů (7,6 mld. / 68 tranší), sbírka listin, daně |
| [`04-legal/`](./reader.html?file=04-legal/README.md) | DANCORE forenzika, ISIR, povolování, environmentální, UBO |
| [`05-osint/`](./reader.html?file=05-osint/README.md) | ARES / Hlídač / mapa governance PPF |
| [`06-reports/`](./reader.html?file=06-reports/README.md) | Memo pro představenstvo, ocenění, akční plán, dataroom |
| [`07-sources/`](./reader.html?file=07-sources/README.md) | Důkazní manifest + archive.org snímky |
| [`08-comms-templates/`](./reader.html?file=08-comms-templates/README.md) | NDA, ČNB §23a, DANCORE dopis, žádost o souhlas držitelů dluhopisů |

---

## Adresářová struktura

```
DD-Progresus-PPF-2026-04-21/
├── README.md                              ← jste zde
├── 00-INDEX.md                            ← master index (všechny soubory)
├── index.html                             ← interaktivní portál (vstup PWA)
├── manifest.json                          ← PWA manifest
├── sw.js                                  ← offline service worker
├── executive-briefing.html                ← 7stránkový briefing k tisku
├── export-pack.html                       ← sestavovač bezpečných dodacích balíků
├── search.html · sitemap.html             ← navigační pomocníci
├── EXECUTIVE-ONE-PAGER.md                 ← podkladový list A4
├── PPF-PLAYBOOK.md                        ← protiútočné Q&A v2.0
├── RED-FLAGS.md                           ← 30 aktivních flagů
├── MASTER-FINDINGS.md · METHODOLOGY.md    ← původ + metoda
├── LINK-AUDIT.md                          ← integrita interních odkazů
├── _assets/                               ← JS/CSS knihovny, ikony
│   ├── flowbite.min.{css,js}
│   ├── tailwind.min.js · alpine.min.js
│   ├── chart.min.js · p5.min.js · three.min.js
│   └── icon-192.png · icon-512.png
├── 01-intel/       PPF dossiery, lavička poradců, Karlín Group, komunikační stopa
├── 02-entity/      Katastrální forenzika, řetězec titulu, ověřené entity
├── 03-financial/   Soubor dluhopisů (7,6 mld. / 68 tranší), sbírka listin, daně
├── 04-legal/       DANCORE forenzika, ISIR, povolování, environmentální, UBO
├── 05-osint/       ARES / Hlídač / mapa governance PPF
├── 06-reports/     Memo pro představenstvo, ocenění, akční plán, dataroom
├── 07-sources/     Důkazní manifest + archive.org snímky
└── 08-comms-templates/ NDA, ČNB §23a, DANCORE dopis, žádost o souhlas držitelů dluhopisů
```

## Kompatibilita prohlížečů

- **Interaktivní portál, briefing, exportní balík, přehledy**: Chrome 100+, Firefox 100+, Safari 15+, Edge 100+.
- **Režim offline PWA**: vyžaduje HTTPS nebo `file://` — service worker se automaticky registruje při první návštěvě; následné návštěvy fungují bez sítě.
- **Tiskový export**: všechny HTML stránky jsou optimalizovány pro tisk A4. Použijte Chrome / Firefox → Soubor → Tisk → Uložit jako PDF (okraje „Default", papír „A4", tisk pozadí **zapnut**).

## Instalace jako lokální aplikace (volitelné)

V Chrome/Edge s otevřeným `index.html`: menu → **Install Mycelium DD…** — nainstaluje jako samostatnou desktopovou aplikaci s DD pracovním prostorem v balíku, plně offline.

## Licence / Klasifikační upozornění

Tento pracovní prostor je **proprietární a důvěrný**. Neoprávněná reprodukce, distribuce nebo zveřejnění jsou zakázány. Každý export je zaznamenán v `07-sources/export-ledger.md` a podléhá doložce o uchovávání/zničení v [Exportním balíku](./export-pack.html).

---

*Autor: Tomáš Korčák (Discovery Lead & Chief Solution Architect, Able Group). Plný kontext viz [`00-INDEX.md`](./reader.html?file=00-INDEX.md).*

<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

Na tento soubor odkazují:

- [_assets/README.md](./_assets/README.md) — ← Zpět na README (2×)
- [00-INDEX.md](./00-INDEX.md) — README.md
- [06-reports/DATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md](./06-reports/DATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md) — README.md
- [06-reports/MASTER-ACTION-PLAN.md](./06-reports/MASTER-ACTION-PLAN.md) — README.md
- [06-reports/MASTER-DD-REPORT-v1.0.md](./06-reports/MASTER-DD-REPORT-v1.0.md) — README.md
- [06-reports/VALUATION-DEFENSE-MEMO.md](./06-reports/VALUATION-DEFENSE-MEMO.md) — README.md
- [EXECUTIVE-ONE-PAGER.md](./EXECUTIVE-ONE-PAGER.md) — README.md
- [PPF-PLAYBOOK.md](./PPF-PLAYBOOK.md) — README.md
- [RED-FLAGS.md](./RED-FLAGS.md) — README.md

## 🏷️ Související soubory (podle shody tagů)

*Žádné silně související soubory (shoda tagů pod prahem 0,3).*

## 🌐 Pohled grafu

[Otevřít v portálu](./index.html) · [Mapa stránek](./sitemap.html) · [Hledat](./search.html) · Focus ID: `README.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
