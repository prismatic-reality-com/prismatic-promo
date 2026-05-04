# DD Progresus → PPF — Hlavní index

> 💻 **Interaktivní přehled**: [Otevřít `index.html` v prohlížeči](./index.html) — portál Flowbite/Alpine/Chart.js/Leaflet/p5.js se znalostním grafem, maticí adresářů, mapou stakeholderů, geo mapami, časovou osou, Tools Hub a živým tickerem red flagů. Stiskněte <kbd>⌘K</kbd> kdekoliv pro globální paletu příkazů.

> 📖 **Tip pro čtenáře**: Všechny odkazy `.md` níže směřují přes **[reader](./reader.html)** pro pěkné renderování Markdownu (zvýraznění syntaxe, ToC, vyvolávky, inline náhledy). Klikněte na libovolný odkaz pro čtení v rendereru, nebo přidejte k URL `?raw=1` pro zdrojový Markdown. V readeru můžete kdykoli stisknout <kbd>R</kbd> pro přepnutí raw/rendered.

---

## 🎛️ Interaktivní přehledy (22 nástrojů + 7 ploch Pass-10 = 29)

**Začněte zde pro jakékoli živé prozkoumávání.** Vše funguje offline po prvním načtení (PWA). Stiskněte <kbd>⌘K</kbd> pro paletu příkazů, <kbd>?</kbd> pro klávesovou nápovědu.

### Pass 10 — Pipeline pro renderování Markdownu (nové, 7 ploch)

- [`reader.html`](./reader.html) — **Univerzální čtečka Markdownu** — otevře libovolný `.md` přes `?file=PATH`, plné markdown-it + mermaid + highlight.js + DOMPurify, ToC, přepínač raw/rendered
- [`md-index.html`](./md-index.html) — **Index dokumentů** — procházet všech 67 markdown dokumentů, seskupené podle složek, deep-linkované do readeru
- [`rendered/index.html`](./rendered/index.html) — **Předrenderovaný balík** — statická HTML rozcestník pro 5 předrenderovaných klíčových dokumentů
- [`rendered/one-pager.html`](./rendered/one-pager.html) — Statický manažerský one-pager A4 (offline, připravený k tisku, bez JS)
- [`rendered/red-flags.html`](./rendered/red-flags.html) — Statický report red flagů (offline, k tisku)
- [`rendered/playbook.html`](./rendered/playbook.html) — Statický scénář PPF (offline, k tisku)
- [`rendered/master-report.html`](./rendered/master-report.html) — Statický konsolidovaný master report (offline, k tisku)
- [`rendered/valuation.html`](./rendered/valuation.html) — Statické memo k ocenění (offline, k tisku)
- [`rendered/all-in-one.html`](./rendered/all-in-one.html) — **Přenosný balík v jednom souboru** — všech 5 renderovaných dokumentů v jednom HTML (e-mailovatelné)

### Vybrané (Pass 9)
- [`knowledge-graph.html`](./knowledge-graph.html) — **Force-directed znalostní graf · 189 uzlů × 460 hran** — každá entita, osoba, dokument a vztah
- [`06-reports/relationships-matrix.html`](./06-reports/relationships-matrix.html) — Mřížka sousedství entita × entita
- [`02-entity/geo-parcel-map.html`](./02-entity/geo-parcel-map.html) — Leaflet mapa katastrálních parcel (Mstětice 792764, 42 ha)
- [`02-entity/entity-offices-map.html`](./02-entity/entity-offices-map.html) — Leaflet mapa všech zapsaných sídel Progresus + PPF
- [`06-reports/geo-deal-overview.html`](./06-reports/geo-deal-overview.html) — Leaflet roll-up: parcely + sídla + jurisdikce
- [`keyboard-help.html`](./keyboard-help.html) — Reference klávesových zkratek (⌘K · g-nav · náhledy · synchronizace stavu)

### Portál a vyhledávání v rootu
- [`index.html`](./index.html) — Master portál s Tools Hub, vybraným znalostním grafem, kartami živých signálů, maticí adresářů
- [`search.html`](./search.html) — Globální fuzzy hledání napříč všemi soubory MD+HTML
- [`sitemap.html`](./sitemap.html) — Kompletní vizuální strom souborů
- [`executive-briefing.html`](./executive-briefing.html) — Tisku připravený one-pager pro Zrůsta
- [`export-pack.html`](./export-pack.html) — Kurátované balíky (PPF pack / legal pack / financial pack)

### Intelligence a stakeholdeři
- [`01-intel/stakeholder-map.html`](./01-intel/stakeholder-map.html) — Graf Prodávající × Kupující × Právní zástupci × Regulátoři
- [`01-intel/ppf-governance.html`](./01-intel/ppf-governance.html) — Vlastnický strom PPF reality 2 s.r.o. → trust Kellnerové

### Entity a katastr
- [`02-entity/entity-graph.html`](./02-entity/entity-graph.html) — Křížový graf 25+ Progresus + 20+ PPF entit
- [`02-entity/parcel-map.html`](./02-entity/parcel-map.html) — Mstětice 792764 katastrální překryv (42 ha, statické SVG)

### Finanční
- [`03-financial/bond-stack.html`](./03-financial/bond-stack.html) — Drill-down 7,6 mld. CZK / 68 tranší se stavem souhlasů CoC
- [`03-financial/tax-calculator.html`](./03-financial/tax-calculator.html) — Scénáře po zdanění share vs. majetkový obchod

### Právní
- [`04-legal/dancore-timeline.html`](./04-legal/dancore-timeline.html) — Oblouk DANCORE Nevada LLC → CZ spor

### Reporty (přehledy)
- [`06-reports/red-flags-dashboard.html`](./06-reports/red-flags-dashboard.html) — Filtrovatelný přehled 30 flagů (18 KRITICKÝCH / 12 VYSOKÝCH / 6 vyřešených)
- [`06-reports/valuation-calculator.html`](./06-reports/valuation-calculator.html) — Živá triangulace 4 metodami, rozsah 3,7–6,5 mld.
- [`06-reports/roadmap-gantt.html`](./06-reports/roadmap-gantt.html) — Gantt 132 akcí, kritická cesta k 2026-05-20
- [`06-reports/deal-journey.html`](./06-reports/deal-journey.html) — Časová osa 2007 Nuka → 2026-07 podpis

### Šablony komunikace
- [`08-comms-templates/comms-hub.html`](./08-comms-templates/comms-hub.html) — NDA · §23a · DANCORE dopis · souhlas držitelů dluhopisů

---

**Pracovní prostor**: `~/dev/prismatic-platform/cases/DD-Progresus-PPF-2026-04-21/`
**Projekt**: Mycelium (42 ha greenfield Nový Zeleneč)
**Vlastník**: Tomáš Korčák (Discovery Lead & Chief Solution Architect, Able Group)
**Klasifikace**: DŮVĚRNÉ — Podpora DD na straně prodávajícího
**Verze indexu**: v2.0 (2026-04-21, po Pass-4)
**Připravenost**: ~55 % | Cíl pro první jednání s PPF: ≥90 %

---

## Transakce

| Pole | Hodnota |
|-------|-------|
| **Cíl** | Nový Zeleneč a.s. (IČO 27825981) přes akciový obchod na RD Rýmařov Invest III. alpha s.r.o. (IČO 10800123) |
| **Aktivum** | 42 ha orné půdy, k.ú. Mstětice (kód **792764**) — pravděpodobně parcely 73/1 + 178/1 |
| **Prodávající** | Skupina Progresus (50/50 Zrůst / Foral) |
| **Kupující SPV** | **PPF reality 2 s.r.o.** (IČO 24654744, 2026-03-19, jednatel Jiří Tošek, vlastněna z CY) |
| **Ocenění** | Kotva 6,5 mld. | Cíl 5–6 mld. | Minimální cena **3,7 mld.** | Likvidace 1,3 mld. |
| **Struktura** | Akciový obchod (zachovává ÚP + EIA + plánovací smlouvu) |
| **Časová osa** | DD fáze blízko — PPF se připravuje na tvrdé jednání |
| **Principálové prodávajícího** | JUDr. Lukáš Zrůst, Lukáš Foral |
| **Vedení DD Progresus** | Michal Dvořák |
| **Tým Able** | Tomáš Korčák (Architekt), Karel Duchoň (AI Lead), Václav Faraga (KAM) |
| **Aktivní red flags** | 18 KRITICKÝCH + 12 VYSOKÝCH + 6 vyřešených/degradovaných = **30 aktivních** |

---

## ČTĚTE NEJDŘÍVE — Top 10 souborů

1. **`EXECUTIVE-ONE-PAGER.md`** — A4 podkladový list pro Zrůsta. Klíčová fakta + otázky PPF + červené linie + páky + nouzové kontakty.
2. **`06-reports/MASTER-DD-REPORT-v1.0.md`** — Memo připravené pro představenstvo. Nahrazuje `executive-summary.md` + briefy pass3/pass4.
3. **`PPF-PLAYBOOK.md`** — v2.0 protiútočná otázky a odpovědi (20 předem zodpovězených otázek, 5 zlatých pravidel, skripty pro živé jednání, červené linie). **Nahrazuje v0.1.**
4. **`06-reports/VALUATION-DEFENSE-MEMO.md`** — Triangulace 4 metodami, architektura nabídky PPF, 6 protipák, inženýrství struktury transakce.
5. **`RED-FLAGS.md`** — Přehled 30 aktivních flagů (18 KRITICKÝCH / 12 VYSOKÝCH).
6. **`06-reports/consolidated-intel-2026-04-21-pass4.md`** — Nejnovější intel pass (4 paralelní agenti, 1000+ řádků).
7. **`01-intel/ppf-people-dossiers.md`** — Hluboké dossiery na principály PPF (Tošek, Ševela, Jirásková, Stoessel, Frydrych, Verhoeff, Minx, Jirásko).
8. **`02-entity/cuzk-cadastre-forensics.md`** — Analýza parcel k.ú. Mstětice (135,1 ha → 42 ha hypotéza).
9. **`06-reports/DATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md`** — Layout dataroomu + disclosure schedule pro prohlášení a záruky.
10. **`03-financial/sbirka-listin-audit.md`** — 4letá prodleva v podání + reality check dluhopisového stacku.

---

## Rychlé hledání podle případu užití

### „Jdu zítra na jednání s PPF" — čtěte tyto 3 v pořadí
1. `EXECUTIVE-ONE-PAGER.md` (5 minut)
2. `PPF-PLAYBOOK.md` §II (briefing protivníka) + §III (Q1–Q20) (45 minut)
3. `RED-FLAGS.md` (15 minut)

### „Cenotvorba transakce"
1. `06-reports/VALUATION-DEFENSE-MEMO.md` (celé — kotva 6,5, minimální cena 3,7)
2. `03-financial/financial-analysis.md` (podpůrné finanční detaily)
3. `02-entity/cuzk-cadastre-forensics.md` (vstup pro pozemkový základ)

### „Mapování protistrany PPF"
1. `01-intel/ppf-people-dossiers.md`
2. `01-intel/principals-deep-osint.md`
3. `05-osint/ppf-side-deep/PPF-GOVERNANCE-MAP.md`
4. `01-intel/advisor-bench-research.md`
5. `01-intel/comms-footprint.md`

### „Obhajoba titulu k 42 ha"
1. `02-entity/land-title-chain.md`
2. `02-entity/cuzk-cadastre-forensics.md`
3. `04-legal/isir-court-sweep.md` (DANCORE RF-26)
4. `04-legal/legal-exposure.md`

### „Dluhopisový program / CoC / covenants"
1. `03-financial/sbirka-listin-audit.md`
2. `RED-FLAGS.md` (RF-1, RF-3, RF-4, RF-27, RF-28)
3. `PPF-PLAYBOOK.md` Q2 + Q7 + Q14

### „Obrana DANCORE"
1. `04-legal/isir-court-sweep.md`
2. `RED-FLAGS.md` (RF-26)
3. `PPF-PLAYBOOK.md` Q12
4. `05-osint/insolvency-acquisition-pattern.md`

### „Struktura entit (obě strany)"
1. `02-entity/entity-structure.md`
2. `02-entity/confirmed-entities.md`
3. `05-osint/ppf-side-deep/PPF-GOVERNANCE-MAP.md`

### „Důkazy / zdroje / původ"
1. `07-sources/evidence-manifest.md`
2. `METHODOLOGY.md`

---

## Inventář souborů pracovního prostoru (29 souborů)

### Root
| Soubor | Role | Stav |
|------|------|--------|
| `00-INDEX.md` | Tento soubor — master navigace v2.0 | **AKTUÁLNÍ** |
| `EXECUTIVE-ONE-PAGER.md` | Podkladový list A4 (≤80 řádků) pro Zrůsta | **AKTUÁLNÍ v1.0** |
| `MASTER-FINDINGS.md` | Konsolidovaná tabulka zjištění (baseline 2026-04-21) | Aktivní — čeká aktualizace Pass-5 |
| `METHODOLOGY.md` | Jak je toto DD vedeno | Stabilní |
| `PPF-PLAYBOOK.md` | Protiútočné otázky a odpovědi + skripty + červené linie | **v2.0 — nahrazuje v0.1** |
| `RED-FLAGS.md` | Přehled 30 aktivních flagů | **AKTUÁLNÍ** |

### 01-intel/ (Kontext transakce, stakeholdeři, komunikace)
| Soubor | Role |
|------|------|
| `transaction-context.md` | Parametry transakce, pozicování Able |
| `ppf-dd-profile.md` | Veřejná DD metodika a vzorce PPF |
| `ppf-people-dossiers.md` | Hluboké dossiery — Tošek, Ševela, Jirásková, Stoessel, Frydrych, Verhoeff, Minx, Jirásko |
| `principals-deep-osint.md` | Rozšířený OSINT na jmenované principály |
| `advisor-bench-research.md` | Lavička poradců PPF (BBH / KŠB / DLA / EY / Savills) |
| `comms-footprint.md` | Analýza veřejné komunikační stopy |

### 02-entity/ (Korporátní struktura, řetězec titulu, katastr)
| Soubor | Role |
|------|------|
| `entity-structure.md` | Stromy skupiny Progresus + PPF |
| `confirmed-entities.md` | Ověřená IČO všech entit |
| `cuzk-cadastre-forensics.md` | k.ú. Mstětice 792764 — 11 kandidátních parcel, 135,1 ha orné půdy, 42 ha hypotéza |
| `land-title-chain.md` | Řetězec Quinlan → Nuka → Lébr → Progresus |

### 03-financial/ (Dluhopisy, podání, CASPER/Vitrablok)
| Soubor | Role |
|------|------|
| `financial-analysis.md` | Finanční tok + sladění CASPER 800M/229M |
| `sbirka-listin-audit.md` | 4letá prodleva v podání + dluhopisový stack (7,6 mld. / 68 tranší) |

### 04-legal/ (Spory, regulace)
| Soubor | Role |
|------|------|
| `isir-court-sweep.md` | Průzkum ISIR + justice.cz; spis DANCORE 30 Co 228/2019-1538 |
| `legal-exposure.md` | Regulatorní povrch, rozsah prohlášení a záruky |

### 05-osint/ (ARES, Hlídač, soudy, sankce)
| Soubor | Role |
|------|------|
| `osint-findings-2026-04-21.md` | Hrubý OSINT log z dne |
| `insolvency-acquisition-pattern.md` | Architektonická analýza Konreo → Progresus (Vitrablok, ekosystém Casper) |
| `ppf-side-deep/PPF-GOVERNANCE-MAP.md` | Vnitřní reorganizace governance PPF (od června 2025) |

### 06-reports/ (Konsolidované reporty)
| Soubor | Role | Nahrazení |
|------|------|--------------|
| `MASTER-DD-REPORT-v1.0.md` | **Baseline memo pro představenstvo (v1.0)** | **Nahrazuje executive-summary.md + pass3 + pass4** |
| `VALUATION-DEFENSE-MEMO.md` | **Triangulace 4 metodami, 6 pák, struktura transakce** | **v1.0 aktuální** |
| `DATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md` | Index datové místnosti + harmonogram zveřejňování pro prohlášení a záruky |
| `consolidated-intel-2026-04-21-pass4.md` | Intel paralelních agentů Pass-4 | Nahrazeno MASTER-DD-REPORT-v1.0 |
| `consolidated-intel-2026-04-21-pass3.md` | Intel Pass-3 | Nahrazeno pass4 a poté MASTER |
| `executive-summary.md` | Raný exekutivní brief | **Nahrazeno MASTER-DD-REPORT-v1.0** |

### 07-sources/ (Důkazní řetězec)
| Soubor | Role |
|------|------|
| `evidence-manifest.md` | URL, archive.org snímky, data získání, hashe |

---

## Doktrína — Řetězec nahrazení

```
Pass 0 (2026-04-01 počáteční sweep nesrovnalostí, report ztracen) — historický
  ↓
Pass 1 (2026-04-21 dopol.) → pass4 (2026-04-21 odpol., 4 paralelní agenti)
  ↓
executive-summary.md → NAHRAZENO
consolidated-intel-pass3.md → NAHRAZENO
consolidated-intel-pass4.md → NAHRAZENO
  ↓
**MASTER-DD-REPORT-v1.0.md** (aktuální baseline memo pro představenstvo)
**VALUATION-DEFENSE-MEMO.md** v1.0 (autorita pro ocenění)
**PPF-PLAYBOOK.md** v2.0 (NAHRAZUJE v0.1)
**RED-FLAGS.md** (živý dashboard 30 flagů)
**EXECUTIVE-ONE-PAGER.md** v1.0 (podkladový list)
```

**Pravidlo**: Pokud je soubor označen „superseded", čtěte pouze pro historický kontext — citujte z aktuálních baseline dokumentů.

---

## Pořadí čtení — Zcela nový člen týmu

**Den 1 (orientace, 3 hodiny)**:
1. `00-INDEX.md` (tento soubor, 10 min)
2. `EXECUTIVE-ONE-PAGER.md` (10 min)
3. `METHODOLOGY.md` (15 min)
4. `06-reports/MASTER-DD-REPORT-v1.0.md` (90 min — KLÍČOVÝ dokument)
5. `RED-FLAGS.md` (30 min)
6. `PPF-PLAYBOOK.md` §I-II (briefing protivníka, 30 min)

**Den 2 (hloubka, 4 hodiny)**:
7. `PPF-PLAYBOOK.md` §III (Q1–Q20) + §IV (skripty) (2 h)
8. `06-reports/VALUATION-DEFENSE-MEMO.md` (90 min)
9. `01-intel/ppf-people-dossiers.md` (30 min)

**Den 3 (specializace dle domény, 3 hodiny)**:
10. Právní/titulní → `02-entity/*` + `04-legal/*` (90 min)
11. Finanční → `03-financial/*` (60 min)
12. OSINT zdroje → `05-osint/*` + `07-sources/evidence-manifest.md` (30 min)

**Den 4+**: vrtat se do bloků případů užití podle přidělené role.

---

## Škála závažnosti zjištění

| Závažnost | Dopad | Akce |
|----------|--------|--------|
| **KRITICKÉ** | Zabiják transakce, pokud nezveřejněno | Nutno zveřejnit + zmírnit; připravit obranný narativ |
| **VYSOKÉ** | Dopad na cenu (>5 % ocenění) | Zveřejnit s vysvětlením; kandidát na rezervu/úschovu |
| **STŘEDNÍ** | Vysvětlitelné s kontextem | Stručně v DD místnosti; krytí prohlášení a záruk |
| **NÍZKÉ** | Kosmetické / standardní DD hygiena | Vyčistit v datové místnosti, pokud levné |

---

## Log sezení

| Datum | Akce | Výstup |
|------|--------|--------|
| 2026-04-01 | Počáteční sweep nesrovnalostí (3 ZIPy z ~/Desktop) | 7 kritických + 11 vysokých + 7 středních zjištění (report ztracen; znovu odvozeno v Pass 2–4) |
| 2026-04-10 | Able injektuje AIAD do repa progresus-ai-transformation | Infrastruktura připravena |
| 2026-04-14 | Brief Able + studie proveditelnosti odevzdány Progresusu | Pozicování týmu potvrzeno |
| 2026-04-21 dopol. | DD pracovní prostor přebudován + Pass 1–3 | Entity, řetězec titulu, finanční, právní, OSINT |
| 2026-04-21 odpol. | **Pass 4 — 4 paralelní agenti** (ČÚZK, Sbírka listin, ISIR, dossiery PPF) | +1000 řádků, 6 nových KRITICKÝCH flagů (RF-26..31), 5 nových VYSOKÝCH (RF-32..36) |
| 2026-04-21 EOD | **MASTER-DD-REPORT-v1.0** + **VALUATION-DEFENSE-MEMO v1.0** + **PPF-PLAYBOOK v2.0** vydány | Stack baseline memo pro představenstvo |
| 2026-04-21 EOD | **EXECUTIVE-ONE-PAGER v1.0** + **INDEX v2.0** | Podkladový list + osvěžená navigace |

---

## Čeká / Další

- **P0 (72 h)**: Placený pull dálkového přístupu ČÚZK — LV 927 + LV 1326 + 11 kandidátních parcel (~CZK 50 tis.)
- **P0 (72 h)**: Podat ÚZ FY21–24 za Nový Zeleneč a.s. + 4 SPV emitentů dluhopisů (Sbírka listin)
- **P0 (7 d)**: Memo k obraně DANCORE (český + americký právní zástupce, Nevada SoS + FinCEN BOI)
- **P1 (7 d)**: Strategie předběžné žádosti u držitelů dluhopisů ohledně CoC (top 10 institucionálních napříč 68 tranšemi)
- **P1 (7 d)**: Zadat nezávislý kontradiktorní přezkum (KŠB / JŠK / White & Case — NIKOLI Aegis)
- **P2 (14 d)**: Mírný paralelní průzkum kupců přes Savills/JLL (Penta, Central Group, Karlín)
- **P2 (14 d)**: Spolujednatel pro Zrůsta + D&O + plán pro nezpůsobilost

---

*Progresivní zjištění — baseline memo pro představenstvo v `06-reports/MASTER-DD-REPORT-v1.0.md`. Podkladový list v `EXECUTIVE-ONE-PAGER.md`. Aktivní přehled flagů v `RED-FLAGS.md`.*

<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

Na tento soubor odkazují:

- [MISSION-COMPLETE.md](./MISSION-COMPLETE.md) — `00-INDEX.md` (2×)
- [BACKLINKS-AUDIT.md](./BACKLINKS-AUDIT.md) — 00-INDEX.md

## 🏷️ Související soubory (podle shody tagů)

*Žádné silně související soubory (shoda tagů pod prahem 0,3).*

## 🌐 Pohled grafu

[Otevřít v portálu](./index.html) · [Mapa stránek](./sitemap.html) · [Hledat](./search.html) · Focus ID: `00-INDEX.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
