# Governance Continuity Memo — Co-CEO + D&O + Incapacity (Pass-12)

**Pracovní prostor**: DD-Progresus-PPF-2026-04-21
**Verze**: v1.0
**Datum**: 2026-04-28
**Pro**: JUDr. Lukáš Zrůst (50% spoluzakladatel Progresus); Lukáš Foral (50% spoluzakladatel)
**Vlastník**: Tomáš Korčák (Discovery Lead, Able Group)
**Klasifikace**: DŮVĚRNÉ — Sell-side governance restructuring
**Priorita**: P1 (7 dnů draft, 21 dnů execute)
**RF mitigation**: RF-29 (key-person dependency Zrůst), H3 (key-person risk)

> 📌 **Účel**: Adresovat single-stakeholder concentration risk identifikovaný v PPF DD jako H3/RF-29. Zrůst je „veřejná tvář" (Discovery 237 vazeb, 13 státních organizací, 1000+ insolvenčních mandátů); jeho neschopnost rozhodovat = deal kill switch. PPF bude tlačit na governance hardening jako podmínku closing.

---

## I. Executive Summary

### Tři risk vectors

1. **Key-person dependency** — Zrůstova osobní reputační/litigační expozice (insolvenční mandáty Casper, vztah k DANCORE) může vést k recusal, ban, či zdravotní inkapacitaci. Bez náhradního statutáře je transakce paralyzována.
2. **Decision-making bottleneck** — všechny strategické rozhodnutí Progresu (50% vlastník) procházejí přes Zrůsta osobně; Foral je 50% partner ale s nižším public profile.
3. **D&O insurance gap** — žádná evidence existující D&O policy; PPF DD bude požadovat coverage on existující management před closing + run-off coverage post-closing.

### Cíl Pass-12 governance work

- **T+7d**: Draft Co-CEO mandátu + interim authority delegation + D&O specifikace
- **T+14d**: Engagement s D&O brokerem (Marsh / Aon / Renomia ČR)
- **T+21d**: Sign-off Co-CEO + D&O policy effective + incapacity protokol uložen u notáře

---

## II. Context — Současný governance state

### II.1 Vlastnická struktura Progresus (zjednodušeno)

```
JUDr. Lukáš Zrůst (50%) ─┐
                          ├── PROGRESUS Invest Holding s.r.o. (09932836)
Lukáš Foral (50%) ───────┘     │
                                ├─→ PROGRESUS Group a.s. (10978216)
                                ├─→ PROGRESUS Invest Holding Core a.s. (13995758)
                                ├─→ Bond emitenti (RD Rýmařov I, II, III, IV)
                                └─→ RD Rýmařov Invest III. alpha s.r.o. (10800123)
                                       └─→ Nový Zeleneč a.s. (27825981) ← TRANSACTION TARGET
```

### II.2 Zrůst exposure (zdroj: `01-intel/principals-deep-osint.md`)

| Vector | Detail | Risk |
|--------|--------|------|
| **Public profile** | „Veřejná tvář" Progresu; primary spokesperson | Reputational shock = price renegotiation |
| **Insolvency practice** | 1000+ řízení, partner v Žižlavský&Zrůst v.o.s. | Conflict-of-interest investigation risk |
| **Casper relationship** | „Repeating commercial relationship with serial buyer of distressed assets he managed" — text-book conflict | EU/CZ regulator scrutiny since 2022 (`principals-deep-osint.md`) |
| **State contracts** | 480M CZK přes 193 government contracts napříč affiliated entities | Lobbying disclosure exposure |
| **Insolvency lawyer ban risk** | Czech bar disciplinary proceedings možné | Statutory disqualification → forced replacement |

### II.3 Foral exposure (zdroj: `01-intel/principals-deep-osint.md`)

| Vector | Detail | Risk |
|--------|--------|------|
| **UAE/Dubai PE history** | 2006-2012 claimed 2,3 mld Kč brokered with thin public disclosure | AML source-of-funds chase |
| **Lower public profile** | Less press exposure, may step up if Zrůst recusal | Could stabilize, but lacks institutional relationships |

---

## III. Co-CEO Mandate — Draft Structure

### III.1 Role & authority

**Title**: Co-CEO / Druhý jednatel (depending on entity form)

**Effective entities**:
- PROGRESUS Invest Holding s.r.o. (parent)
- Nový Zeleneč a.s. (target — already under sole director Chytilová since 2021-01-18)
- PROGRESUS Group a.s.
- PROGRESUS Bonds s.r.o. (Zrůst sole director per `sbirka-listin-audit.md`)

**Authority levels**:

| Decision | Sole authority | Joint authority | Board approval |
|----------|---------------|-----------------|----------------|
| Day-to-day operations < CZK 5M | Either CEO | — | — |
| Capital expenditure 5-25M | — | Both CEOs | — |
| Strategic decisions (M&A, debt issuance, dividend) | — | Both CEOs | Shareholder consent |
| External communications (media, regulator) | — | Designated CEO + dual review | — |
| Litigation strategy (DANCORE, ÚZ filings) | — | Both CEOs + counsel | — |

**Default**: 4-eyes principle for all >5M decisions.

### III.2 Co-CEO candidate profile

**Selection criteria** (in priority order):
1. **Czech law qualified** + **>15 yrs M&A / RE / capital markets experience**
2. **No conflicts** with Casper, Aegis, DANCORE, or insolvency network
3. **PPF-acceptable** (avoid publicly antagonistic figures vs. PPF)
4. **Available bandwidth** — ideally interim engagement until closing (~6-12 months)
5. **Reputation premium** — ex-Big-4 partner, ex-CFO listed company, ex-bank board

**Shortlist hypothesis** (need confirmation):

| Candidate type | Pros | Cons |
|----------------|------|------|
| **Ex-Big-4 partner (KPMG/Deloitte/PwC retired)** | Brand premium, governance discipline | Cost CZK 200-400k/m |
| **Ex-listed CFO (e.g., ČEZ alumni, O2 alumni)** | Capital markets credibility | Bandwidth tight |
| **Independent corporate director (Czech IoD)** | Pre-vetted governance experience | Smaller bench |
| **Interim management firm** (Alvarez & Marsal CZ, FTI) | Plug-and-play, time-bound | Premium cost CZK 600k-1M/m |

**Recommendation**: Engage Alvarez & Marsal Czech Republic interim CEO desk — provides licensed Czech-resident interim director with public profile + institutional acceptance. Cost ~CZK 800k/m × 6m = **CZK 4,8M** budget reserve.

### III.3 Engagement structure

```
Phase 1 (T+0..T+7): Mandate scoping, candidate vetting
Phase 2 (T+7..T+14): Engagement letter + statutory appointment
Phase 3 (T+14..T+21): Cross-onboard, transition meetings, public announcement (post-Closing or pre-Closing depending on PPF preference)
Phase 4 (T+21..closing): Active co-management; PPF DD interface
Phase 5 (post-closing): Run-off → either continue under PPF management or transition out
```

---

## IV. D&O Insurance Plan

### IV.1 Current state

**Evidence search status**: žádný D&O policy dokument zatím odhalen v evidence files. **Předpoklad**: chybí nebo je sub-scaled.

### IV.2 Required coverage

| Coverage type | Limit (CZK) | Why |
|---------------|------------|-----|
| **Side A** (executive personal liability) | 500M | Zrůst exposure to securities/AML claims |
| **Side B** (corporate reimbursement) | 500M | Reimburses Progresus pro indemnification of executives |
| **Side C** (entity coverage) | 250M | Securities claims against entity itself (bondholder suits) |
| **Run-off / Tail coverage** | 6 yrs post-closing | DANCORE-style claims may emerge years later |
| **Specific extensions** | — | (a) Outside Directorship Liability for Zrůst's other boards (b) Investigation costs (c) Pre-claim inquiry costs |

### IV.3 Broker shortlist

| Broker | Pros | Cons |
|--------|------|------|
| **Marsh ČR** | Largest globally, deep cap markets D&O book | High premium (~CZK 1,5-2,5M/yr for 500M coverage) |
| **Aon ČR** | Strong RE sector D&O experience | Smaller CZ bench |
| **WTW ČR** | Mid-tier alternative | Less senior placement |
| **Renomia (CZ-domestic)** | Cheapest, fastest | Less leverage on hard-to-place risks |

**Recommendation**: Marsh ČR primary; Renomia parallel quote pro price benchmark.

### IV.4 Premium budget

| Component | Annual premium (CZK) |
|-----------|---------------------|
| Standard 500M Side A/B + 250M Side C | 1,500,000 |
| Run-off (6 yrs prepaid) | 4,500,000 (one-time) |
| Specific extensions | 200,000 |
| **Total Year 1** | **~6,200,000 CZK** |

**Borne by**: Sell-side until closing, then PPF post-closing per SPA.

---

## V. Incapacity Protocol

### V.1 Trigger events

Following ANY of these = automatic activation:

1. **Medical incapacity** — Zrůst or Foral certified by physician as unable to perform duties >7 days
2. **Legal proceedings** — formal indictment, arrest, or public investigation (excluding routine civil matters)
3. **Bar disciplinary action** — initiation of proceedings by Česká advokátní komora vs. Zrůst
4. **Reputation event** — material adverse press requiring dual-counsel review (joint Korczák + outside counsel)
5. **Voluntary stand-down** — written notice from principal

### V.2 Authority cascade

```
Trigger event
   ↓
Notify Co-CEO + outside counsel within 24h
   ↓
Co-CEO assumes sole authority for affected entity
   ↓
Notice to PPF (if pre-closing) or PPF management (post-closing) within 48h
   ↓
Notice to bondholder agent within 72h (if material to debt service)
   ↓
ČNB notification if §23a relevant
   ↓
Public statement (only if material to market — joint counsel approval)
```

### V.3 Notarized standby documents

Pre-position with Czech notary (recommend JUDr. Petr Hampel, Praha; alternatively notář klienta):

1. **Power of attorney** (Plná moc) — Zrůst → Co-CEO + Foral, contingent on incapacity trigger
2. **Resignation letter** (Odstoupení) — Zrůst → Progresus entities, executable on stand-down
3. **Replacement statutory appointment** — pre-signed entry to OR for substitute statutář
4. **Bondholder communication** — pre-drafted statement for trustee communication
5. **Banking authority addendum** — bank signatories updated for affected entities

**All under sealed envelope, dual-keyed (notary + Foral copy + Korczák Able copy).**

---

## VI. PPF DD Disclosure Strategy

### VI.1 Pre-disclosure framing

When PPF raises H3/RF-29 in DD Q&A, sell-side response framework:

```
"We acknowledge the founder concentration as a known governance characteristic.
We have implemented a Co-CEO arrangement effective [DATE], augmented by a
notarized incapacity protocol and a [500M CZK] D&O policy. Additionally, the
incoming PPF management will benefit from full management continuity through
the closing process via [Co-CEO NAME]'s active role."
```

### VI.2 Disclosure schedule items

Add to `06-reports/DATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md`:

| ID | Item | Status | Deadline |
|----|------|--------|----------|
| GC-1 | Co-CEO engagement letter | TBD | T+14d |
| GC-2 | D&O insurance certificate | TBD | T+21d |
| GC-3 | Incapacity protocol notarization | TBD | T+21d |
| GC-4 | Authority schedule (4-eyes principle matrix) | TBD | T+10d |
| GC-5 | Disclosure of Zrůst external mandates (insolvency cases) | TBD | T+14d (sensitive) |

### VI.3 W&I carve-out coordination

Coordinate with W&I broker to ensure governance items are NOT carved out (PPF will want them covered):

- D&O policy MUST cover acts pre-closing for warranty period
- Co-CEO engagement letter terms must NOT trigger termination on change of control (would break continuity)
- Run-off coverage MUST extend beyond W&I claims period

---

## VII. Cost Summary

| Item | One-time CZK | Recurring CZK/yr |
|------|-------------|------------------|
| Co-CEO interim engagement (6 m) | 4,800,000 | — |
| D&O Year 1 premium | 1,500,000 | 1,500,000 |
| D&O run-off (6 yr prepaid) | 4,500,000 | — |
| Notary + standby docs | 50,000 | — |
| Outside counsel review | 250,000 | — |
| Broker fees | 100,000 | — |
| **TOTAL Pass-12 budget** | **~11,200,000 CZK** | 1,500,000 (post-Y1) |

**Funding**: Pre-closing — sell-side balance sheet (negotiate as deal expense). Post-closing — included in SPA expenses.

---

## VIII. Decision Points for Principálové

| Decision | Owner | By When | Rationale |
|----------|-------|---------|-----------|
| Approve Co-CEO concept | Zrůst + Foral joint | T+3 | Cannot proceed without principal sign-off |
| Approve interim management firm vs individual | Zrůst + Foral | T+5 | Speed (firm) vs cost (individual) |
| Approve D&O coverage limits | Zrůst + Foral | T+7 | 500M Side A is mid-market; could go higher |
| Authorize broker engagement | Zrůst + Foral | T+7 | Marsh primary recommended |
| Approve incapacity protocol | Zrůst + Foral | T+10 | Sensitive — joint counsel preview |
| Sign engagement letter Co-CEO | Zrůst + Foral | T+14 | Concrete commitment |

---

## IX. Open Questions

1. **Existing D&O policy?** — needs disclosure check. If sub-scaled, layer additional coverage.
2. **Zrůst insolvency practice firewall?** — Žižlavský&Zrůst v.o.s. independent counsel? Conflict review needed.
3. **Foral UAE structure** — does it create disclosure obligations for Co-CEO? Pre-disclosure due.
4. **PPF's preferred Co-CEO profile?** — informally sound out before formal engagement.
5. **Bond trustee notice provisions** — review prospekty for incapacity-trigger covenants.
6. **Statutory authority entity-by-entity** — some s.r.o. require single jednatel; co-CEO via Generální plná moc.

---

## X. Cross-references

- **Principálové OSINT**: [01-intel/principals-deep-osint.md](../01-intel/principals-deep-osint.md)
- **PPF DD profile**: [01-intel/ppf-dd-profile.md](../01-intel/ppf-dd-profile.md)
- **Bond emitents**: [03-financial/sbirka-listin-audit.md](../03-financial/sbirka-listin-audit.md)
- **Backfile prep**: [03-financial/UZ-BACKFILE-PREP.md](../03-financial/UZ-BACKFILE-PREP.md) (Pass-12)
- **DANCORE memo**: [04-legal/DANCORE-DEFENSE-MEMO-v1.0.md](./DANCORE-DEFENSE-MEMO-v1.0.md) (Pass-12)
- **Disclosure schedule**: [06-reports/DATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md](../06-reports/DATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md)
- **PPF playbook**: [PPF-PLAYBOOK.md](../PPF-PLAYBOOK.md) (Q-references for PPF Q&A)
- **Red flags**: RF-29 (Zrůst key-person), H3 (deprecated, mapped to RF-29 per Pass-12 MASTER-FINDINGS refresh)

---

## XI. Status tracking

| Stage | Status | Owner | ETA |
|-------|--------|-------|-----|
| Principal sign-off Co-CEO concept | ⏳ Pending | Zrůst + Foral | T+3 |
| Interim management firm shortlist | ⏳ Pending | Korczák | T+5 |
| D&O broker engagement | ⏳ Pending | Korczák | T+7 |
| Co-CEO candidate vetting | ⏳ Pending | Korczák + outside counsel | T+10 |
| D&O policy quotes | ⏳ Pending | Marsh + Renomia | T+10 |
| Incapacity protocol drafting | ⏳ Pending | Outside counsel | T+10 |
| Notarization | ⏳ Pending | JUDr. Hampel | T+21 |
| PPF disclosure | ⏳ Pending | Korczák | T+21 |

---

*Pass-12 governance hardening — adresuje RF-29 (key-person) jako prerequisite pro PPF closing. Závislé na schválení rozpočtu CZK ~11M.*

<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

Na tento soubor odkazují:

- [06-reports/WI-INSURANCE-MEMO.md](../06-reports/WI-INSURANCE-MEMO.md) — 04-legal/GOVERNANCE-CONTINUITY-MEMO-v1.0.md

## 🏷️ Související soubory (podle shody tagů)

*Žádné silně související soubory (shoda tagů pod prahem 0,3).*

## 🌐 Pohled grafu

[Otevřít v portálu](../index.html) · [Mapa stránek](../sitemap.html) · [Hledat](../search.html) · Focus ID: `04-legal%2FGOVERNANCE-CONTINUITY-MEMO-v1.0.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
