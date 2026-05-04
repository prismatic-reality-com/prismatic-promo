# Účetní závěrky FY2021-2024 — Backfile Preparation Pack (Pass-12)

**Pracovní prostor**: DD-Progresus-PPF-2026-04-21
**Verze**: v1.0
**Datum**: 2026-04-28
**Vlastník**: Tomáš Korčák (Discovery Lead, Able Group)
**Klasifikace**: DŮVĚRNÉ — Sell-side DD support
**Priorita**: P0 (72 h plán + 3-4 týdny exekuce)
**RF mitigation**: RF-27 (NZ filing gap), RF-28 (bond emitter ÚZ gaps), H1 (prospekt nesoulad)

> 📌 **Účel**: Naplánovat retroaktivní podání chybějících ÚZ pro Nový Zeleneč a.s. + 4 SPV emitenty Progresus dluhopisů, aby PPF DD obdrželo verifikovatelná čísla **před** první žádostí o disclosure.

---

## I. Executive Summary

| Metrika | Hodnota |
|---------|---------|
| **Entit s gap** | 6 (1 cíl + 5 emitentů + 1 holding + 1 parent SPV) |
| **Chybějících ÚZ celkem** | **~14** (FY21-24, krajový vzorec) |
| **Dluhopis program ohrožen** | 7,6 mld. CZK schválené, ~2-3 mld. umístěno (68 tranší) |
| **Reg. risk** | §21a zákona o účetnictví — pokuta až 6 % aktiv; trestněprávní výhružky pro statutáry |
| **PPF DD risk** | RF-27/28 přímý zabiják ceny; bez ÚZ nelze ocenit ručitele dluhopisů |
| **Doba dohnání** | 3-4 týdny pokud účetnictví existuje, 8-12 týdnů pokud rekonstrukce |
| **Cost estimate** | CZK 350-700k externí účetní + CZK 50-150k auditor (kde vyžadováno) |

---

## II. Filing Gap Inventory

### II.1 Cílová entita

| Entita | IČO | FY21 | FY22 | FY23 | FY24 | Note |
|--------|-----|------|------|------|------|------|
| **Nový Zeleneč a.s.** | 27825981 | ❌ | ❌ | ❌ | ❌ | Posl. podání FY2020 (2021-06-28). 4leté porušení §21a. Jediná aktivita 2024 = rozhodnutí jediného akcionáře. |

### II.2 Aktivní emitenti dluhopisů

| Emitent | IČO | Prospekt | Tranší | FY21 | FY22 | FY23 | FY24 | ČNB approval |
|---------|-----|----------|--------|------|------|------|------|--------------|
| RD Rýmařov Invest Develop a.s. | 10722696 | 1. (2021) | 18 | ✅ retro | ✅ retro | ✅ retro | ❌ | 2021-06-29 |
| PROGRESUS RD Rýmařov a.s. | 17053161 | 2. (2022) | 22 | n/a | ❌ | ❌ | ❌ | 2022-07-04 |
| PROGRESUS RD Rýmařov II a.s. | 19287518 | 3. (2023) | 15 | n/a | n/a | ❌ | ❌ | 2023-08-10 |
| PROGRESUS RD Rýmařov III a.s. | 21515841 | 4. (2024) | 7 | n/a | n/a | n/a | ❌ | 2024-12-18 |
| PROGRESUS RD Rýmařov IV a.s. | 23983922 | 5. (2026) | 7 | n/a | n/a | n/a | n/a (period not closed) | 2026-01-28 |

**Pro RD Rýmařov Invest Develop**: FY21-23 podány 2025-03-13 (mass retroactive) — **vzor regulátorního dohánění už existuje uvnitř skupiny**. Lze opakovat.

### II.3 Holding & SPV vrstva

| Entita | IČO | Role | FY21 | FY22 | FY23 | FY24 |
|--------|-----|------|------|------|------|------|
| PROGRESUS Bonds s.r.o. | 14066661 | Holding 3 emitentů, jednatel L. Zrůst | ❌ | ❌ | ❌ | ❌ |
| RD Rýmařov Invest III. alpha s.r.o. | 10800123 | Přímý vlastník Nový Zeleneč | ❌ | ❌ | ❌ | ❌ |
| PROGRESUS Group a.s. | 10978216 | Skupinový ručitel | ❌ | ❌ | ❌ | ✅ FY24 konsolid 2026-02 |
| Progresus invest holding core a.s. | 13995758 | Mezičlánek | n/a | ✅ kratké období | ❌ | ❌ |

> ⚠️ **PROGRESUS Group FY24 konsolidovaná je jediný čistý view** ručitelské vrstvy. Ostatní entity bez ÚZ = PPF nemá způsob, jak ocenit ručitelskou kapacitu.

---

## III. Required Documents Inventory (per entita)

Pro každou entitu vyžadováno (per zákon o účetnictví + zákon o auditorech):

1. **Účetní závěrka** (rozvaha + výkaz zisku a ztráty + příloha)
2. **Výroční zpráva** (statutory ÚZ podléhá publikační povinnosti, pokud kritéria překročena)
3. **Zpráva auditora** (povinné pokud splňuje 2 ze 3 kritérií: aktiva > 40M CZK, obrat > 80M CZK, zaměstnanci > 50)
4. **Návrh na rozdělení zisku/úhradu ztráty** (rozhodnutí valné hromady)
5. **Zpráva o vztazích** (povinné pro ovládané osoby)
6. **Účetní doklady & deník** (interní — pro auditní stopu)

### Status per entitu — co existuje vs co chybí

| Entita | Účetnictví vedeno? | Audit potřeba? | Nejhorší blokátor |
|--------|-------------------|----------------|--------------------|
| Nový Zeleneč a.s. | TBD — likely YES (corporate accounting) | TBD — pravděpodobně YES (aktiva pravděpodobně > 40M CZK z LV ocenění) | **4letý audit gap** + možná chybí roční inventarizace |
| RD Rýmařov Invest Develop | YES (retro proven) | TBD | FY24 dohnání zůstává |
| PROGRESUS RD Rýmařov a.s. | TBD — debt-issued bez ÚZ je červená vlajka | YES (bond proceeds = aktiva > 40M) | Možná **chybí celé roky účetnictví** |
| PROGRESUS RD Rýmařov II | TBD | YES | dtto |
| PROGRESUS RD Rýmařov III | TBD | YES | dtto |
| PROGRESUS Bonds s.r.o. | TBD | NO (holding s.r.o. obvykle pod kritérii) | Pravděpodobně technicky možné rychlé dohnání |
| RD Rýmařov Invest III. alpha s.r.o. | TBD | NO (s.r.o. SPV) | Pravděpodobně rychlé dohnání |

---

## IV. Backfile Strategy — 3 scénáře

### Scenario A: „Účetnictví existuje, jen nepodáno" (BEST CASE)
- Externí účetní (např. KPMG / PwC ČR / specialized SME firm) připraví ÚZ z existujících podkladů
- Audit (kde vyžadován) — limited scope review na retro období
- **Doba**: 3-4 týdny
- **Cost**: CZK 50-100k per entita účetní + CZK 30-60k per audit
- **Total estimate**: 6 entit × CZK 80k = **CZK 480k accounting + CZK 180k audit = CZK 660k**

### Scenario B: „Účetnictví částečně rekonstrukce" (MID CASE)
- Některé doklady chybí, je třeba reconstruct from bank statements + invoices + contracts
- Forensic accounting přístup (assume completeness gaps)
- Audit s kvalifikací (qualified opinion možný)
- **Doba**: 6-8 týdnů
- **Cost**: CZK 150-300k per entita rekonstruct + audit
- **Total estimate**: 6 entit × CZK 200k = **CZK 1,2M**

### Scenario C: „No accounting records exist" (WORST CASE)
- Pro emitenty bez podkladů — bond proceeds prošly přes bank účty bez accounting trail
- Forensic + možná opětovné účtování od bank statements zpětně
- Disclaimer of opinion od auditora
- Trestněprávní eskalace risk pro statutáry
- **Doba**: 12+ týdnů
- **Cost**: CZK 400-800k per entita
- **Total estimate**: 4 emitents × CZK 600k = **CZK 2,4M**
- **Severity**: Tato realita znamená dluhopisové prospekty byly vystaveny **bez auditovatelných čísel** — **§43/45 ZoP porušení**, ČNB §23a clearance ohrožena, trestní oznámení reálné.

**Pravděpodobný stav**: směs A+B (~70-80 % A, ~20-30 % B). Scenario C nelze vyloučit pro PROGRESUS RD Rýmařov a.s. (17053161, 22 tranší 2022-2024 bez ÚZ).

---

## V. Operational Sequence

### Phase 0 — Mandate & accountant briefing (T+0 až T+3)
1. Get formal mandate od JUDr. Zrůsta a Forala (sell-side principálové) na backfile.
2. Identify externího účetního:
   - Existující Progresus účetní (kdo vedl FY20 NZ a.s.?) — preferred (cheapest, fastest)
   - Pokud unavailable: KPMG ČR / PwC / BDO Praha (financial restructuring track record)
3. Auditor selection: BDO / Mazars / Crowe (mid-tier, accept retro engagements; bypass Big 4 conflict s PPF advisors).
4. NDA + engagement letter signed — Able Group mediates.

### Phase 1 — Discovery (T+3 až T+7)
- Per entita: extract dostupné podklady (bank statements, invoices, smlouvy, daňová přiznání)
- Map proti standardní účetní osnově (AS 401 — Příloha 4)
- Classify per entitu Scenario A / B / C
- **Output**: Discovery report per entita

### Phase 2 — Preparation (T+7 až T+28)
- Externí účetní zpracuje ÚZ retroaktivně
- For Scenario A: standard turnaround 1-2 týdny per entita
- For Scenario B: 3-4 týdny per entita s forensic helpers
- Internal review by sell-side CFO equivalent (Michal Dvořák — DD lead Progresus)

### Phase 3 — Audit (T+14 až T+35, paralelně s Phase 2)
- Audit firms engagement letter signed
- Limited scope review for retro period (kde audit vyžadován)
- Issue qualified/unqualified opinion per entita

### Phase 4 — Filing (T+30 až T+45)
- Submit through `or.justice.cz` — Sbírka listin
- ČSÚ statistical reports parallel
- Tax filing reconciliation (if FY21-23 daňová přiznání submitted but ÚZ not, gap explanation)
- **Notify ČNB** o doplnění prospektových údajů

### Phase 5 — PPF disclosure (T+45+)
- Disclose updated ÚZ in dataroom
- Pre-empt RF-27/28 in disclosure schedule
- Update VALUATION-DEFENSE-MEMO with verified financials
- Update MASTER-DD-REPORT v1.0 → v1.1

---

## VI. Audit firm shortlist

| Firma | Pros | Cons | Engagement type |
|-------|------|------|-----------------|
| **BDO ČR** | Mid-market expertise; restructuring practice strong; no PPF conflict | Smaller bench than Big 4 | Limited review (LR) for retro; full audit FY24 |
| **Mazars Praha** | Solid REIT expertise; CZK 60-150k per audit | Sometimes booked tight | LR for retro; full FY24 |
| **Crowe ČR** | Specializované na construction & real estate | Smaller staff | LR + advisory blend |
| **Audit Mantis** (lokální Olomouc?) | Existing relationship if Progresus historický auditor | Capacity unknown | Continuation engagement |

**Recommendation**: BDO ČR vede; Mazars zálohu. Vyhnout se KPMG/PwC/EY (PPF využívá EY na 1. linii — `01-intel/advisor-bench-research.md`).

---

## VII. Regulatory disclosure timeline

| Authority | Deadline | Trigger |
|-----------|----------|---------|
| ČNB §23a | T+45 (ihned po podání ÚZ) | Supplement prospekt s aktualizovanými údaji 4 emitentů |
| ČNB CRR | T+45 | Pokud je PROGRESUS Bonds nebo emitent v dohlížecím perimetru |
| FAÚ | T+0 (ihned) | AML risk pokud bond proceeds nemají accounting trail |
| ČSÚ | T+30 | Statistical reports paralel s ÚZ filing |
| Soud (rejstříkový) | Per submission | Standard fee CZK 800-2000 per ÚZ |
| Trestní předběžný screen | T+0 (interní) | Right-of-center counsel review ohledně §254 TZ (zkreslení účetních dat) — to ascertain whether risk exists |

---

## VIII. Risk Register

| ID | Risk | Probability | Impact | Mitigation |
|----|------|-------------|--------|------------|
| R-1 | Discovery odhalí Scenario C u 1+ emitentů | 30 % | Bond default trigger; ČNB sankce; trestní | Forensic accounting; full disclosure ČNB; possibly carve emitter ze deal |
| R-2 | Audit qualifications nutí restate prospekt | 50 % | ČNB §23a delay; bondholder challenge | Pre-empt s ČNB advisory engagement; offer consent fee |
| R-3 | Statutáři odmítnou cooperate s discovery | 10 % | Backfile blocked; deal at risk | Eskalace na principálů (Zrůst/Foral); replacement if needed |
| R-4 | External accountant nestihne timeline | 35 % | Closing delay 3-6 týdnů | Parallel multiple firms (allocate per entitu); buffer schedule |
| R-5 | PPF objeví backfile před formální disclosure | 25 % | Loss of negotiating position | Disclose proactively s explanation memo |
| R-6 | Czech tax authority audit za retro období | 40 % | Tax exposure pro entitu | Reserve in escrow; daňový poradce engagement |

---

## IX. Communication & disclosure framework

### Internal (sell-side)
- Weekly steering call: Tomáš Korčák + Zrůst + Foral + Dvořák + lead accountant
- Status doc: `MASTER-FINDINGS.md` H1 + RF-27/28 status update
- Risk escalation: `RED-FLAGS.md` v1.x update

### External (PPF)
- T-day Disclosure: Pre-emptive memo to PPF s framing
   - „Discovered filing gap from prior management period"
   - „Remediation underway, expected completion T+45"
   - „Updated financials will be made available in dataroom Phase 2"
- W&I carve-out: Filing breach jako disclosed item s contractual cap
- Avoid: late-stage „surprise discovery" by PPF DD team — viz `08-comms-templates/PPF-DD-RESPONSE-FRAMEWORK.md`

### External (ČNB)
- Pre-meeting s ČNB §23a před formal supplement
- Letter from CZ counsel: „Issuer remediation in progress; supplement to be filed T+45"

---

## X. Decision points

| Trigger | Decision | Owner | Deadline |
|---------|----------|-------|----------|
| Scenario A confirmed (most entities) | Proceed standard backfile | Zrůst + Foral | T+7 |
| Scenario B for 1+ entity | Engage forensic accountant | Zrůst | T+10 |
| Scenario C for any entity | **Pause deal, eskalovat counsel + ČNB advisory** | Korczák escalation | T+10 |
| Auditor refuses engagement | Move to alternative (parallel shortlist) | Lead accountant | T+12 |
| Cost > CZK 2M | Reassess deal economics with sell-side principálové | Korczák + Zrůst | T+14 |
| Timeline > 60d | Inform PPF; renegotiate closing | Lead counsel | T+30 |

---

## XI. Cross-references

- **Source audit**: [sbirka-listin-audit.md](./sbirka-listin-audit.md)
- **Financial framing**: [financial-analysis.md](./financial-analysis.md)
- **Red flags**: RF-27 (NZ filing gap), RF-28 (bond emitter ÚZ), H1 (prospekt nesoulad)
- **PPF response framework**: [08-comms-templates/PPF-DD-RESPONSE-FRAMEWORK.md](../08-comms-templates/PPF-DD-RESPONSE-FRAMEWORK.md)
- **CNB §23a clearance**: [08-comms-templates/CNB-23A-CLEARANCE-REQUEST.md](../08-comms-templates/CNB-23A-CLEARANCE-REQUEST.md)
- **Disclosure schedule**: [06-reports/DATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md](../06-reports/DATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md)
- **Bond consent strategy**: [06-reports/BONDHOLDER-PRE-CONSENT-STRATEGY-v1.0.md](../06-reports/BONDHOLDER-PRE-CONSENT-STRATEGY-v1.0.md) (Pass-12)
- **Evidence chain**: [07-sources/evidence-manifest.md](../07-sources/evidence-manifest.md)

---

## XII. Status tracking

| Stage | Status | Owner | ETA |
|-------|--------|-------|-----|
| Mandate from sell-side principálové | ⏳ Pending | T. Korčák | T+3 |
| Accountant selection | ⏳ Pending | Zrůst + Korczák | T+5 |
| Auditor shortlist + engagement | ⏳ Pending | Korczák | T+7 |
| Phase 1 Discovery report | ⏳ Pending | External team | T+10 |
| Phase 2 ÚZ preparation | ⏳ Pending | External team | T+28 |
| Phase 3 Audit | ⏳ Pending | Audit firm | T+35 |
| Phase 4 Filing | ⏳ Pending | External team | T+45 |
| Phase 5 PPF disclosure | ⏳ Pending | T. Korčák | T+45+ |
| ČNB supplement | ⏳ Pending | CZ counsel | T+45 |

---

*Pass-12 production drive — P0 z 00-INDEX.md backlogu. Závisí na schválení rozpočtu CZK ~700k-1,2M.*

<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

Na tento soubor odkazují:

- [04-legal/GOVERNANCE-CONTINUITY-MEMO-v1.0.md](../04-legal/GOVERNANCE-CONTINUITY-MEMO-v1.0.md) — 03-financial/UZ-BACKFILE-PREP.md
- [06-reports/WI-INSURANCE-MEMO.md](../06-reports/WI-INSURANCE-MEMO.md) — 03-financial/UZ-BACKFILE-PREP.md

## 🏷️ Související soubory (podle shody tagů)

*Žádné silně související soubory (shoda tagů pod prahem 0,3).*

## 🌐 Pohled grafu

[Otevřít v portálu](../index.html) · [Mapa stránek](../sitemap.html) · [Hledat](../search.html) · Focus ID: `03-financial%2FUZ-BACKFILE-PREP.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
