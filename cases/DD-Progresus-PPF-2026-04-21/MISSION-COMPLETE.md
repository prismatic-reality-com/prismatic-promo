# Mise dokončena — DD pracovní prostor Projekt Mycelium

**Komu**: JUDr. Lukáš Zrůst
**Od**: Tomáš Korčák (Discovery Lead & Chief Solution Architect, Able Group)
**Datum**: 2026-04-21
**Klasifikace**: DŮVĚRNÉ — Podpora DD na straně prodávajícího

---

## Co bylo postaveno

V 10 sekvenčních průchodech (jeden den) sestavil Able discovery tým kompletní DD pracovní prostor na straně prodávajícího pro **Projekt Mycelium** — zamýšlený prodej 42ha greenfieldu Nový Zeleneč (přes akciový obchod na RD Rýmařov Invest III. alpha s.r.o., cílem Nový Zeleneč a.s.) společnosti **PPF reality 2 s.r.o.** (IČO 24654744, jednatel Jiří Tošek).

Pracovní prostor je **offline-schopný (PWA)**, **odkazově auditovaný (0 nefunkčních / 1 590 odkazů + 335 cest čtečky)**, **křížově indexovaný** (graf + manifest hledání) a **vizuálně navigovatelný** přes 29plošný Tools Hub na `index.html` (22 interaktivních přehledů + 1 univerzální čtečka markdownu + 1 index dokumentů + 5 předrenderovaných statických HTML + 1 přenosný balík v jednom souboru).

**Tvrdá čísla** (viz [`WORKSPACE-STATS.md`](./WORKSPACE-STATS.md)):

- 68 markdown souborů · 87 HTML souborů · ~290 položek celkem
- 29 ploch renderování (22 interaktivních přehledů + Pass-10 pipeline pro markdown)
- 132 sledovaných akcí (32 P0 · 42 P1 · 58 P2)
- 30 red flags (18 KRITICKÝCH · 12 VYSOKÝCH · 6 VYŘEŠENÝCH)
- 25+ entit Progresus + 20+ entit PPF zmapováno
- 16 klíčových osob s plnými dossiery
- 8 tematických adresářů (`01-intel` … `08-comms-templates`), každý s README
- Plný křížový referenční graf (`.graph.json`, 189 uzlů × 460 hran) + globální manifest hledání (`.manifest.json`, 155 souborů)
- 28 vendorovaných JS/CSS knihoven (~6,5 MB v `_assets/`, vč. markdown-it + mermaid + highlight.js + DOMPurify) — žádná závislost na CDN

---

## Historie průchodů (stručně)

| Pass | Zaměření | Klíčové výstupy |
|-----:|-------|------------------------|
| 1 | Základ a vstupní průzkum | `METHODOLOGY.md`, `RED-FLAGS.md` v1, kostra 8 adresářů |
| 2 | Finanční a strukturální | `sbirka-listin-audit.md`, `TAX-STRUCTURE-MEMO.md`, TSV nesrovnalostí |
| 3 | Právní a entity | `DANCORE-FORENSIC-DOSSIER.md`, `isir-court-sweep.md`, `cuzk-cadastre-forensics.md` |
| 4 | Multiagentní sběr informací | `consolidated-intel-2026-04-21-pass4.md`, `ppf-people-dossiers.md`, dossier Karlín |
| 5 | Konsolidace MASTER | `MASTER-DD-REPORT-v1.0.md`, `PPF-PLAYBOOK.md` v2.0, `VALUATION-DEFENSE-MEMO.md` |
| 6 | Finální sestava a audit | `EXECUTIVE-ONE-PAGER.md`, `LINK-AUDIT.md`, `00-INDEX.md` v2.0 |
| 7 | Interaktivní přehledy + PWA | 16 HTML přehledů, service worker, manifest, Chart.js všude |
| 8 | Zpevnění a Tools Hub | Tools Hub na `index.html`, `CHANGELOG.md`, `WORKSPACE-STATS.md`, tento soubor |
| 9 | Znalostní graf + Geo mapy + UX pro pokročilé | p5.js graf 189×460, Leaflet parcely + sídla, ⌘K paleta, zpětné odkazy na 66 MD |
| 10 | Pipeline pro renderování Markdownu | `reader.html` (941 LOC) + markdown-it balík (~3,5 MB) + `md-index.html` + 5 předrenderovaných + all-in-one |

Plný changelog s výstupy podle průchodů: [`CHANGELOG.md`](./CHANGELOG.md).

---

## Klíčová průlomová zjištění

Toto jsou položky, které musíte při schůzce s PPF umět obhájit nebo přerámovat:

1. **Nesrovnalost ocenění CASPER** — 800M vs. 229M napříč dvěma prospekty. Zdroj: [`03-financial/contradictions-critical-high.tsv`](./03-financial/contradictions-critical-high.tsv).
2. **Skrytá entita RONDAX** — neobjevuje se ve standardním řetězci titulu. Viz [`02-entity/cuzk-cadastre-forensics.md`](./02-entity/cuzk-cadastre-forensics.md).
3. **~1 mld. CZK nezveřejněného dluhu** v konsolidovaném pohledu před transakcí — [`03-financial/financial-analysis.md`](./03-financial/financial-analysis.md).
4. **Expozice DANCORE 209,6M** — Nevadská LLC s aktivním českým sporem — [`04-legal/DANCORE-FORENSIC-DOSSIER.md`](./04-legal/DANCORE-FORENSIC-DOSSIER.md).
5. **Čtyři insolvenční řízení** zarámována jako jedno v dřívějších zveřejněních — [`04-legal/isir-court-sweep.md`](./04-legal/isir-court-sweep.md).
6. **Vyřešení HP zákazu sdílení** — dřívější průchody klauzuli chybně přečetly; aktuální výklad je v [`02-entity/HP-sharing-ban-resolution.md`](./02-entity/HP-sharing-ban-resolution.md).
7. **Mýtus Studio Perspektiv** — nikoli vítězný architekt, třetí místo. Viz [`04-legal/studio-perspektiv-resolution.md`](./04-legal/studio-perspektiv-resolution.md).
8. **5. dluhopisový prospekt** schválen 2026-01-28 **během jednání s PPF** — přidává 1,5 mld. CZK do stacku těsně před DD. Časový flag v [`03-financial/sbirka-listin-audit.md`](./03-financial/sbirka-listin-audit.md).
9. **4/5 emitentů dluhopisů** má **NULU podání ve Sbírce listin** od 2021 — strukturální neprůhlednost dluhopisového stacku.

Kupující na ně dříve či později přijde. Naším úkolem je vynést je nahoru jako první, s ostrým narativem ke každému.

---

## Posouzení připravenosti

| Osa                     | Dnes | Cíl k 2026-05-19 |
|-------------------------|------:|---------------------:|
| Entita a titul          |   70 % |                  95 % |
| Finanční a dluhopisový stack  |   50 % |                  90 % |
| Právní (DANCORE, ISIR)  |   55 % |                  90 % |
| Povolování a EIA        |   65 % |                  95 % |
| UBO / governance        |   45 % |                  90 % |
| **Agregátní připravenost** | **~55 %** |              **≥90 %** |

**Nejsme** připraveni absolvovat živé jednání s PPF dnes. **Budeme** připraveni do 2026-05-19, pokud nedořešené P0 akce níže budou uzavřeny v plánu.

---

## Nedořešené akce P0 (musíte si přečíst před jednáním)

Plný seznam (32 P0 položek) je v [`06-reports/MASTER-ACTION-PLAN.md`](./06-reports/MASTER-ACTION-PLAN.md) a vizualizován v [`06-reports/roadmap-gantt.html`](./06-reports/roadmap-gantt.html). Ty kritické pro první jednání s PPF:

- **P0-01** — Uzavřít nesrovnalost CASPER 800M/229M do jediného vysvětlitelného čísla.
- **P0-02** — Vyřešit status RONDAX (živá entita, schránka, nebo historická?) + dopad na řetězec titulu.
- **P0-05** — Připravit zveřejňovací dopis DANCORE (šablona připravena v [`08-comms-templates/DANCORE-DISCLOSURE-LETTER.md`](./08-comms-templates/DANCORE-DISCLOSURE-LETTER.md)).
- **P0-07** — Dokončit žádost o souhlas §23a ČNB (šablona v [`08-comms-templates/CNB-23A-CLEARANCE-REQUEST.md`](./08-comms-templates/CNB-23A-CLEARANCE-REQUEST.md)).
- **P0-09** — Zajistit balíček souhlasů držitelů dluhopisů — 68 tranší, 5 emitentů — pro změnu kontroly.
- **P0-11** — Potvrdit plán nápravy podání ve Sbírce listin pro 4 opožděné emitenty.
- **P0-15** — Zafixovat narativ ocenění: minimální cena **3,7 mld.**, cíl 5 mld., kotva 6,5 mld. Viz [`06-reports/valuation-calculator.html`](./06-reports/valuation-calculator.html) pro živou triangulaci.
- **P0-18** — Podepsat NDA + návrh exkluzivity s PPF před věcným přístupem do datové místnosti ([`08-comms-templates/NDA-EXCLUSIVITY-DRAFT.md`](./08-comms-templates/NDA-EXCLUSIVITY-DRAFT.md)).

---

## Jak používat tento pracovní prostor

**Den jednání s PPF** — přečtěte si tyto tři, v tomto pořadí, pak otevřete portál:
1. [`EXECUTIVE-ONE-PAGER.md`](./EXECUTIVE-ONE-PAGER.md) (5 minut) — A4 podkladový list.
2. [`PPF-PLAYBOOK.md`](./PPF-PLAYBOOK.md) (20 minut) — 20 předem zodpovězených otázek, 5 zlatých pravidel, červené linie.
3. [`06-reports/MASTER-DD-REPORT-v1.0.md`](./06-reports/MASTER-DD-REPORT-v1.0.md) (30 minut) — baseline připravený pro představenstvo.

**Během jednání** — otevřete [`index.html`](./index.html) a mějte viditelný **Tools Hub** + **Přehled red flagů**. Klikněte na libovolnou entitu nebo flag pro podkladové důkazy.

**Po jednání** — zaznamenejte v [`08-comms-templates/POST-MEETING-DEBRIEF-TEMPLATE.md`](./08-comms-templates/POST-MEETING-DEBRIEF-TEMPLATE.md) a znovu spusťte Pass-9 nad tím, co PPF vynese.

**Offline** — celý pracovní prostor funguje bez internetu po první návštěvě `index.html` (PWA service worker).

**Hledání** — `./search.html` na cokoli. Manifest indexuje ~136 souborů.

---

## Poděkování týmu

**Principál a vlastník** — JUDr. Lukáš Zrůst (Progresus)
**Spolupříncipál** — Lukáš Foral
**Vedení DD Progresus** — Michal Dvořák
**CFO** — Ing. Petr Heyduk

**Able Group**
- **Tomáš Korčák** — Discovery Lead & Chief Solution Architect (architekt pracovního prostoru, orchestrátor 8 průchodů)
- **Karel Duchoň** — AI Lead (multi-agent sweepy, OSINT nástroje)
- **Václav Faraga** — Key Account Manager (koordinace stakeholderů, šablony komunikace)

**Agenti a nástroje** — 4 paralelní analytičtí agenti v Pass 4, automatizovaný auditor odkazů, renderování přehledů Chart.js/Alpine, PWA service worker pro offline provoz.

---

## Závěrečná poznámka

JUDr. Zrůste — tento pracovní prostor je plný produkt jednoho dne soustředěné, multiagentní forenzní sestavy. Je **opřený o názor**: každá karta přehledu odkazuje jak na živý interaktivní nástroj, tak na zdrojový markdown, takže můžete vrtat z titulkového čísla až k důkaznímu odkazu jedním kliknutím.

Red flagy jsou reálné. Rozsah ocenění je obhájen. Scénář anticipuje 20 z pravděpodobných otázek PPF. Naše práce ze strany Able na **sestavovací** straně je hotová — zbývajících 35 % připravenosti je **vaše** rozhodnutí o strategii zveřejňování, výběru právních zástupců a tempu.

Jsme v pohotovosti pro jakýkoli další průchod.

— **Tomáš Korčák**, Able Group
2026-04-21

---

*Viz [`CHANGELOG.md`](./CHANGELOG.md) pro výstupy podle průchodů · [`WORKSPACE-STATS.md`](./WORKSPACE-STATS.md) pro tvrdá čísla · [`LINK-AUDIT.md`](./LINK-AUDIT.md) pro integritu odkazů · [`00-INDEX.md`](./00-INDEX.md) pro master navigaci.*

<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

Na tento soubor odkazují:

- [00-INDEX.md](./00-INDEX.md) — MISSION-COMPLETE.md
- [02-entity/HP-sharing-ban-resolution.md](./02-entity/HP-sharing-ban-resolution.md) — MISSION-COMPLETE.md
- [02-entity/cuzk-cadastre-forensics.md](./02-entity/cuzk-cadastre-forensics.md) — MISSION-COMPLETE.md
- [03-financial/financial-analysis.md](./03-financial/financial-analysis.md) — MISSION-COMPLETE.md
- [03-financial/sbirka-listin-audit.md](./03-financial/sbirka-listin-audit.md) — MISSION-COMPLETE.md
- [04-legal/DANCORE-FORENSIC-DOSSIER.md](./04-legal/DANCORE-FORENSIC-DOSSIER.md) — MISSION-COMPLETE.md
- [04-legal/isir-court-sweep.md](./04-legal/isir-court-sweep.md) — MISSION-COMPLETE.md
- [04-legal/studio-perspektiv-resolution.md](./04-legal/studio-perspektiv-resolution.md) — MISSION-COMPLETE.md
- [06-reports/MASTER-ACTION-PLAN.md](./06-reports/MASTER-ACTION-PLAN.md) — MISSION-COMPLETE.md
- [06-reports/MASTER-DD-REPORT-v1.0.md](./06-reports/MASTER-DD-REPORT-v1.0.md) — MISSION-COMPLETE.md
- [08-comms-templates/CNB-23A-CLEARANCE-REQUEST.md](./08-comms-templates/CNB-23A-CLEARANCE-REQUEST.md) — MISSION-COMPLETE.md
- [08-comms-templates/DANCORE-DISCLOSURE-LETTER.md](./08-comms-templates/DANCORE-DISCLOSURE-LETTER.md) — MISSION-COMPLETE.md
- [08-comms-templates/NDA-EXCLUSIVITY-DRAFT.md](./08-comms-templates/NDA-EXCLUSIVITY-DRAFT.md) — MISSION-COMPLETE.md
- [08-comms-templates/POST-MEETING-DEBRIEF-TEMPLATE.md](./08-comms-templates/POST-MEETING-DEBRIEF-TEMPLATE.md) — MISSION-COMPLETE.md
- [BACKLINKS-AUDIT.md](./BACKLINKS-AUDIT.md) — MISSION-COMPLETE.md

## 🏷️ Související soubory (podle shody tagů)

*Žádné silně související soubory (shoda tagů pod prahem 0,3).*

## 🌐 Pohled grafu

[Otevřít v portálu](./index.html) · [Mapa stránek](./sitemap.html) · [Hledat](./search.html) · Focus ID: `MISSION-COMPLETE.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
