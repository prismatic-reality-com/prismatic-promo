# 06-reports — Konsolidované reporty a scénáře

[← Zpět na 00-INDEX.md](../reader.html?file=00-INDEX.md) | [🏠 Portál](../index.html) | [🚩 Red Flags](./red-flags-dashboard.html) | [💰 Kalkulačka ocenění](./valuation-calculator.html)

> **Účel** — Vrstva pro představenstvo. Vše nad tímto adresářem jsou surové zjištění; vše zde je syntetizovaný, manažersky připravený stack. **MASTER-DD-REPORT-v1.0** je aktuální baseline; dřívější `executive-summary.md` / `pass3` / `pass4` jsou pouze historický kontext.

---

## 📂 Soubory v tomto adresáři (řazeno dle nahrazení)

| Soubor | Stav | 1řádkové shrnutí | Priorita čtení |
|------|--------|----------------|---------------|
| [MASTER-DD-REPORT-v1.0.md](../reader.html?file=06-reports/MASTER-DD-REPORT-v1.0.md) | 🟢 **AKTUÁLNÍ BASELINE** | Memo pro představenstvo. Nahrazuje executive-summary + pass3 + pass4. | **ČTĚTE NEJDŘÍVE** |
| [VALUATION-DEFENSE-MEMO.md](../reader.html?file=06-reports/VALUATION-DEFENSE-MEMO.md) | 🟢 **v1.0 AKTUÁLNÍ** | Triangulace 4 metodami (DCF/komparativa/precedenty/likvidace), kotva 6,5 / floor 3,7, 6 protipák | **PRIORITA 2** |
| [DATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md](../reader.html?file=06-reports/DATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md) | 🟢 Aktivní | Layout dataroomu + prohlášení a záruky disclosure schedule (71 KB, kompletní mapování DR-xxx) | **PRIORITA 3** |
| [MASTER-ACTION-PLAN.md](../reader.html?file=06-reports/MASTER-ACTION-PLAN.md) | 🟢 **SSOT pro akce** | Jediný zdroj pravdy — nahrazuje ad-hoc worklisty v MASTER-DD, PPF-PLAYBOOK §VI/§XI, DATAROOM Část 3, DANCORE §10 | **OPERATIVNÍ** |
| [ALTERNATIVE-BUYERS-WARM-POOL.md](../reader.html?file=06-reports/ALTERNATIVE-BUYERS-WARM-POOL.md) | 🟢 v1.0 | 18 alternativních kupců zmapováno (Central Group, Penta, Karlín, CPIPG, Crestyl tier 1) | **POKUD PPF < 4,5 mld** |
| [consolidated-intel-2026-04-21-pass4.md](../reader.html?file=06-reports/consolidated-intel-2026-04-21-pass4.md) | 🟡 NAHRAZENO | Pass-4 paralelní agentní zjištění (historický kontext) | Pouze referenční |
| [consolidated-intel-2026-04-21-pass3.md](../reader.html?file=06-reports/consolidated-intel-2026-04-21-pass3.md) | 🟡 NAHRAZENO | Zjištění Pass-3 (historický kontext) | Pouze referenční |
| [executive-summary.md](../reader.html?file=06-reports/executive-summary.md) | 🟡 NAHRAZENO | Raný manažerský brief — **NAHRAZENO MASTER-DD-REPORT-v1.0** | Pouze referenční |

### Řetězec nahrazování
```
executive-summary.md  →  pass3  →  pass4  →  MASTER-DD-REPORT-v1.0.md  (aktuální)
                                           +  VALUATION-DEFENSE-MEMO.md v1.0
                                           +  DATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md
                                           +  MASTER-ACTION-PLAN.md
                                           +  ALTERNATIVE-BUYERS-WARM-POOL.md
```

> ⚠️ **Pravidlo**: Pokud je soubor označen 🟡 NAHRAZENO, citujte pouze z 🟢 AKTUÁLNÍCH baseline dokumentů.

### Doplňkový soubor v rodičovském adresáři
- [`../PPF-PLAYBOOK.md`](../reader.html?file=PPF-PLAYBOOK.md) — v2.0 anti-grilling otázky a odpovědi (otázky a odpovědi) (20 otázek, 5 zlatých pravidel, live-grilling skripty). **Nahrazuje v0.1.** Žije v rootu pracovního prostoru (ne v tomto adresáři), protože jde o runtime scénář, ne report.

---

## 🔑 Klíčová zjištění

- 🟢 **Triangulace ocenění**: DCF 5,4–7,5 mld | Komparace pozemků 2,5–5,5 mld | Precedenty 3,3–5,2 mld | Likvidace 1,3–3,2 mld → **midpoint čistého aktiva 4,5 mld CZK**. Kotva 6,5, floor 3,7.
- 🔴 **Agregátní cenový protivítr 18–33 %**, pokud všech 30 red flags zasáhne PPF DD bez přípravy prodávajícího.
- 🟢 **Cíl pro první call s PPF: 90%+ připravenost** (aktuálně 55 % po Pass-4).
- 🟢 **18 alternativních kupců Tier-1** identifikováno a tierováno (5 realistických, 7 oportunistických, 3 industriální, 3 zahraniční wild cards) — aukční páka k dispozici, pokud PPF nabídne pod 4,5 mld.
- 🟢 **Matrix obhajoby ocenění 4 metodami** s 6 protipákami + blueprinty pro engineering struktury transakce.

---

## 🔗 Křížové odkazy

- Zdrojový přehled red flags → [../RED-FLAGS.md](../reader.html?file=RED-FLAGS.md) (30 aktivních flagů)
- Carry-sheet pro Zrůsta → [../EXECUTIVE-ONE-PAGER.md](../reader.html?file=EXECUTIVE-ONE-PAGER.md)
- Anti-grilling skripty → [../PPF-PLAYBOOK.md](../reader.html?file=PPF-PLAYBOOK.md)
- Podkladové datové zdroje → [01-intel/](../01-intel/), [02-entity/](../02-entity/), [03-financial/](../03-financial/), [04-legal/](../04-legal/), [05-osint/](../05-osint/)
- Šablony připravené k odeslání → [08-comms-templates/](../08-comms-templates/)
- Důkazy + provenience → [07-sources/evidence-manifest.md](../reader.html?file=07-sources/evidence-manifest.md)
- Metodologická stopa → [../METHODOLOGY.md](../reader.html?file=METHODOLOGY.md)

---

## ❓ Otevřené otázky / mezery

- **Pass-5 refresh MASTER-FINDINGS.md** čeká (baseline 2026-04-21 zamčen, aktualizace tečou přes RED-FLAGS.md).
- **Finalizace choreografie paralelních zájemců** — ALTERNATIVE-BUYERS-WARM-POOL je zmapován, ale Savills/JLL light-touch outreach sekvence ještě nebyla spuštěna.
- **DATAROOM-INDEX DR-xxx mapování vs. doručení surových dokumentů** — kadence uploadů P0/P1/P2 v MASTER-ACTION-PLAN §3.
- **VALUATION-DEFENSE §6 (protipáky) vyjednávací nácvik** — potřeba dry-run se Zrůstem před schůzkou 1.
- **MASTER-DD-REPORT v2.0 trigger** — kdy data Pass-5 odůvodňují v2? Návrh: pouze pokud se objeví 3+ nové KRITICKÉ flagy nebo se midpoint ocenění posune o >10 %.

---

## ⚡ Rychlé akce

- Pokud potřebujete **jeden dokument k předání představenstvu** → [MASTER-DD-REPORT-v1.0.md](../reader.html?file=06-reports/MASTER-DD-REPORT-v1.0.md) (90 min čtení).
- Pokud potřebujete **dnešní seznam akcí** → [MASTER-ACTION-PLAN.md](../reader.html?file=06-reports/MASTER-ACTION-PLAN.md) (SSOT, nahrazuje všechny dřívější worklisty).
- Pokud PPF nabídne nízko → [ALTERNATIVE-BUYERS-WARM-POOL.md](../reader.html?file=06-reports/ALTERNATIVE-BUYERS-WARM-POOL.md) (tier-1 pool k aktivaci).
- Pokud potřebujete **obhájit cenu** → [VALUATION-DEFENSE-MEMO.md](../reader.html?file=06-reports/VALUATION-DEFENSE-MEMO.md) (triangulace 4 metodami + 6 pák).
- Pokud potřebujete **strukturovat dataroom** → [DATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md](../reader.html?file=06-reports/DATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md).
- Pokud potřebujete **historický kontext, jak jsme se sem dostali** → čtěte pass3 → pass4 → executive-summary (v tomto pořadí) pro evoluci uvažování.

---

📊 **Interaktivní přehledy** → [red-flags-dashboard.html](./red-flags-dashboard.html) (heatmapa red flagů, Gantt akčního plánu) · [valuation-calculator.html](./valuation-calculator.html) (waterfall ocenění, scénářové přepínače)

---

*Naposledy aktualizováno: 2026-04-21 EOD | Verze 1.0 | Připravenost: 5 aktuálních + 3 nahrazené (archivováno pro stopu) | Připraveno pro představenstvo*

<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

Na tento soubor odkazují:

- [00-INDEX.md](../00-INDEX.md) — 06-reports/README.md
- [01-intel/README.md](../01-intel/README.md) — 06-reports/README.md
- [02-entity/README.md](../02-entity/README.md) — 06-reports/README.md
- [03-financial/README.md](../03-financial/README.md) — 06-reports/README.md
- [05-osint/README.md](../05-osint/README.md) — 06-reports/README.md
- [06-reports/ALTERNATIVE-BUYERS-WARM-POOL.md](./ALTERNATIVE-BUYERS-WARM-POOL.md) — 06-reports/README.md
- [06-reports/DATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md](./DATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md) — 06-reports/README.md
- [06-reports/MASTER-ACTION-PLAN.md](./MASTER-ACTION-PLAN.md) — 06-reports/README.md
- [06-reports/MASTER-DD-REPORT-v1.0.md](./MASTER-DD-REPORT-v1.0.md) — 06-reports/README.md
- [06-reports/VALUATION-DEFENSE-MEMO.md](./VALUATION-DEFENSE-MEMO.md) — 06-reports/README.md
- [06-reports/consolidated-intel-2026-04-21-pass3.md](./consolidated-intel-2026-04-21-pass3.md) — 06-reports/README.md
- [06-reports/consolidated-intel-2026-04-21-pass4.md](./consolidated-intel-2026-04-21-pass4.md) — 06-reports/README.md
- [06-reports/deal-journey.html](./deal-journey.html) — 📊 06-reports
- [06-reports/executive-summary.md](./executive-summary.md) — 06-reports/README.md
- [06-reports/monte-carlo-valuation.html](./monte-carlo-valuation.html) — 📊 06-reports

## 🏷️ Související soubory (podle shody tagů)

- [07-sources/README.md](../07-sources/README.md) — podobnost 0.62 · 07-sources — Manifest důkazů a řetězec původu
- [01-intel/README.md](../01-intel/README.md) — podobnost 0.62 · 01-intel — Kontext transakce, stakeholdeři, komunikace
- [02-entity/README.md](../02-entity/README.md) — podobnost 0.62 · 02-entity — Korporátní struktura, katastr, řetězec vlastnických titulů
- [03-financial/README.md](../03-financial/README.md) — podobnost 0.62 · 03-financial — Dluhopisy, listiny, daňová struktura
- [05-osint/README.md](../05-osint/README.md) — podobnost 0.62 · 05-osint — Zpravodajství z otevřených zdrojů + governance PPF

## 🌐 Pohled grafu

[Otevřít v portálu](../index.html) · [Mapa stránek](../sitemap.html) · [Hledat](../search.html) · Focus ID: `06-reports%2FREADME.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
