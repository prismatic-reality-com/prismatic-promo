# Warranty & Indemnity Insurance — Strukturální memo (Pass-12)

**Pracovní prostor**: DD-Progresus-PPF-2026-04-21
**Verze**: v1.0
**Datum**: 2026-04-28
**Pro**: JUDr. Lukáš Zrůst + Lukáš Foral (sell-side); externí poradci (KŠB / JŠK / White & Case)
**Vlastník**: Tomáš Korčák (Discovery Lead, Able Group)
**Klasifikace**: DŮVĚRNÉ — Sell-side DD support
**Priorita**: P1 (14 dnů draft, 30 dnů carrier engagement)
**Závislosti**: DANCORE-DEFENSE-MEMO v1.0, UZ-BACKFILE-PREP v1.0, GOVERNANCE-CONTINUITY-MEMO v1.0, RED-FLAGS v1.1

> 📌 **Účel**: Vyhodnotit strukturální požadavky na W&I (warranty & indemnity) policy pro Progresus → PPF transakci. Definovat coverage limits, exclusions, retention/cap, broker shortlist a interface s D&O policy + title insurance.

---

## I. Executive Summary

| Pole | Hodnota |
|------|---------|
| **Deal value** | 4,5-5,5 mld. CZK target (PPF) / 3,7 mld. floor / 6,5 mld. anchor |
| **Coverage typ** | Sell-side W&I primary (transaction-as-stand-alone insurance) + buyer-side flip (preferred PPF style) |
| **Recommended limit** | 10-15 % deal value = **CZK 500-800 mil.** |
| **Retention** | 0,5-1,0 % deal value = **CZK 25-50 mil.** |
| **Premium** | 1,0-1,5 % limit = **CZK 5-12 mil. one-time** |
| **Survival period** | General warranties 18-24 m; Tax/title 5-7 yr; Fundamental warranties 7-10 yr |
| **Critical carve-outs** | DANCORE (RF-26); ÚZ filing breach (RF-27/28); Bond CoC failure |
| **Broker shortlist** | Marsh ČR primary; Aon ČR backup; AIG / Liberty / Beazley carriers |

---

## II. Why W&I — strategic rationale

### II.1 Sell-side benefits

1. **Clean exit** — zástavní záruky proti nárokům po closing transferovány na pojistitele
2. **Reduced escrow** — escrow se sníží z typických 10-15 % na 1-2 % retention
3. **Co-CEO bandwidth** — Zrůst po closing není v řetězci pro 5-7 yr warranty claims
4. **Bondholder confidence** — jasná insurance struktura snižuje cross-default risk per bondholders

### II.2 Buyer-side benefits (PPF perspective)

1. **Faster closing** — PPF DD lze ukončit s confidence i nedotažené evidence chain
2. **Strategic certainty** — PPF reality 2 jako SPV nemá deep balance sheet pro indemnification claims
3. **W&I substitutes for sell-side guarantees** — PPF nedostane personal guarantees Zrůsta/Forala (red line v one-pager) → W&I je substitute mechanism

### II.3 Trade-off: cost vs deal certainty

W&I premium CZK 5-12M je 0,1-0,3 % deal value. **Bez W&I** by escrow musel být ~CZK 500-800M (10-15 % deal) na 18-24 měsíců = working capital lock-up s nákladem opportunity 3-5 % p.a. = CZK 30-80M lost yield. **W&I je čistě levnější.**

---

## III. Coverage scope

### III.1 Standard cover

| Warranty kategorie | Coverage | Survival | Comment |
|--------------------|----------|----------|---------|
| **Title to shares** | YES | 7-10 yr | Fundamental — capacity & ownership of Nový Zeleneč shares |
| **Capacity** | YES | 7-10 yr | Foundational |
| **Tax** | YES | 5-7 yr | Match Czech tax statute of limitations |
| **Title to real property** | YES (carve-outs apply) | 5-7 yr | DANCORE carve-out — see §IV |
| **Compliance with laws** | YES | 18-24 m | General compliance basket |
| **Litigation** | YES (carve-outs apply) | 18-24 m | DANCORE excluded — see §IV |
| **Financial statements** | YES (carve-outs apply) | 18-24 m | ÚZ backfile breach excluded — see §IV |
| **Material contracts** | YES | 18-24 m | Bond covenants disclosed |
| **Employment** | YES | 12-18 m | Std SME |
| **Environmental** | YES + sub-limit | 5-7 yr | Match Czech CERCLA-equivalent statute |
| **IP** | YES | 18-24 m | Limited scope (RE asset, not operating biz) |
| **Cyber/data** | YES | 12-18 m | Standard |

### III.2 Excluded by default

| Exclusion | Reason | Mitigation |
|-----------|--------|-----------|
| **Known issues disclosed** | W&I covers UNKNOWN issues only; disclosed in DD = excluded | Sell-side specific indemnity (carve-out v SPA) |
| **Forward-looking warranties** | Not insurable | Standard SPA reps |
| **Pension underfunding** | Specific exclusion in CZ market | n/a (Nový Zeleneč nemá zaměstnance s pension scheme) |
| **Bribery/anti-corruption** | Excluded (ABC) | Sell-side standard rep |
| **Sanctions** | Excluded | Sell-side standard rep |
| **Criminal acts** | Excluded | Sell-side standard rep |

---

## IV. Critical carve-outs (Pass-12 specific)

### IV.1 DANCORE LLC dispute (RF-26)

**Status**: Active 6-yr CZ dispute (spis 30 Co 228/2019-1538) + parallel US (Dancore v. Zika 2:18-cv-01136). Dovolání 2024-11-18 ŽIVÉ. Prismatic forensic exposure: most-likely CZK 102,5M / cap CZK 1,0 mld.

**W&I treatment**: **EXCLUDED** from W&I (known issue, disclosed).

**Replacement coverage**:
- **Specific indemnity** in SPA — sell-side carries DANCORE liability
- **Title insurance carve-out** — separate title policy s carve-in pro DANCORE risk (see §V)
- **Escrow segregation** — CZK 250-400M escrow specific pro DANCORE outcomes (per `EXECUTIVE-ONE-PAGER.md` red line)
- **Run-off** — DANCORE indemnity survives 5-7 yr (longer than W&I survival)

**Cross-reference**: `04-legal/DANCORE-DEFENSE-MEMO-v1.0.md` §VI

### IV.2 ÚZ filing breach (RF-27, RF-28)

**Status**: 4-yr filing gap pro Nový Zeleneč a.s. + 4 SPV bond emitents. Backfile T+45 plán in `UZ-BACKFILE-PREP.md`.

**W&I treatment**:
- **Pre-closing breach EXCLUDED** (known issue) — sell-side specific indemnity
- **Post-closing breach COVERED** — pokud se zjistí nepřesnosti v doplněných ÚZ po closing
- **Tax exposure from non-filing** — covered subject to general tax warranty cap

**Replacement coverage**:
- **Specific indemnity** for pre-closing filing-related liabilities (CZK 100-200M cap)
- **Disclosure schedule** carries the filing gap

### IV.3 Bond CoC failure (RF-1, RF-3, RF-4)

**Status**: 7,6 mld bond program; 68 tranší; consent strategy in `BONDHOLDER-PRE-CONSENT-STRATEGY-v1.0.md`. Sériový-5 (RD Rýmařov IV) marked for par redemption rather than consent.

**W&I treatment**:
- **CoC trigger event EXCLUDED** if disclosed at signing
- **Bondholder claims EXCLUDED** if foreseeable
- **Cross-default cascade EXCLUDED**

**Replacement coverage**:
- **Closing condition** — minimum consent threshold (e.g., 75 % outstanding by value)
- **Consent fee** as deal expense (escalation up to 200 bps)
- **Deal break fee** payable if consent fails

### IV.4 Co-CEO / D&O policy interface

**Status**: Co-CEO appointment in `GOVERNANCE-CONTINUITY-MEMO-v1.0.md`. D&O 500M Side A.

**W&I treatment**:
- **Pre-closing D&O claims** flow through D&O run-off policy, NOT W&I
- **Post-closing breach of governance reps** covered by W&I (e.g., undisclosed conflicts)

**Coordination**:
- D&O run-off carrier ≠ W&I carrier (no double dip)
- **Notification protocol** — single counsel coordinates W&I / D&O / specific indemnity claims

---

## V. Title insurance integration

### V.1 Why separate title policy

- **DANCORE carve-out** from W&I requires title-specific coverage
- Czech market: title insurance je rare ale dostupné (Stewart Title, First American, Allianz Trade — všichni mají CZ desk přes London)
- **Coverage**: známé risks (DANCORE) + neznámé title defects discovered post-closing

### V.2 Title coverage scope

| Coverage | Limit (CZK) | Notes |
|----------|------------|-------|
| **Title defects (general)** | 200-400M | Match deal value 5-10 % |
| **DANCORE-specific carve-in** | 250-400M | Match expected exposure cap |
| **Survey errors** | 50-100M | Cadastral-related risks |
| **Encumbrances unknown** | included | Hidden liens, easements |
| **Forgery / fraud in chain** | included | Critical for Quinlan/Nuka chain |

### V.3 Premium

Title premium ~0,3-0,8 % limit = **CZK 1,2-3M one-time** for 400M coverage.

---

## VI. Premium budget

### VI.1 W&I primary premium

| Component | Amount (CZK) |
|-----------|-------------|
| W&I 500M limit, 1 % retention | 5,000,000 |
| W&I 800M limit, 1 % retention | 9,500,000 |
| **Recommended (700M limit, 1 %)** | **7,500,000** |
| Underwriting fees | 200,000 |
| Broker fees | 100,000 |
| Legal coordination | 250,000 |
| **Total W&I one-time** | **~8,050,000 CZK** |

### VI.2 Title insurance premium

| Component | Amount (CZK) |
|-----------|-------------|
| Title 400M coverage | 1,800,000 |
| DANCORE carve-in 350M | 1,500,000 (additional) |
| **Total title one-time** | **~3,300,000 CZK** |

### VI.3 Combined Pass-12 insurance budget

| Item | One-time CZK |
|------|-------------|
| W&I + title | 11,350,000 |
| D&O coverage (per GOVERNANCE memo) | 11,200,000 |
| **Total Pass-12 insurance** | **~22,550,000 CZK** |

**Cost as % of deal**: 22,55M / 4,500M = **0,5 %** — well below industry standard 1-2 % insurance load.

**Funding**: Pre-closing — sell-side or split per SPA (typical: 60/40 buyer/seller for W&I). D&O run-off pre-paid by sell-side.

---

## VII. Carrier shortlist

### VII.1 W&I primary carriers (CZ market)

| Carrier | Pros | Cons | Min/Max coverage |
|---------|------|------|------------------|
| **AIG (CZ via London)** | Largest globally, deep RE book | Premium pricing | CZK 50M-2bn |
| **Liberty Specialty (London)** | Mid-market sweet spot | Smaller bench | CZK 100M-1bn |
| **Beazley (London)** | Real estate specialty | Fewer Czech deals done | CZK 100M-500M |
| **Allianz Global** | Czech presence | Conservative underwriting | CZK 100M-1bn |
| **Generali Global** | Czech presence | Lower retention threshold | CZK 50M-500M |

**Recommendation**: AIG primary (largest book, most flexibility on carve-outs) + Liberty as backup quote for price benchmarking.

### VII.2 Broker

| Broker | Pros | Cons |
|--------|------|------|
| **Marsh ČR** | Largest CZ M&A book; access to all carriers | Premium broker fee |
| **Aon ČR** | Solid alternative | Smaller M&A team |
| **WTW ČR** | Smaller but specialized | Limited carrier access |
| **Renomia (CZ-domestic)** | Cheapest fees | No London relationships, weaker on bespoke W&I |

**Recommendation**: Marsh ČR primary; Aon ČR for parallel quote.

### VII.3 Title carrier

| Carrier | Czech access | Notes |
|---------|--------------|-------|
| **Stewart Title (UK)** | Via London | Long Czech track record |
| **First American (UK)** | Via London | RE specialty |
| **Allianz Trade Czech** | Direct CZ | Newer entrant |

**Recommendation**: Stewart Title primary (deepest Czech experience).

---

## VIII. Process timeline

```
T+0 (Pass-12 commit): Memo finalized + circulated
T+5: Broker engagement letter signed (Marsh ČR)
T+10: Underwriting Q&A package prepared (DD facts dump)
T+14: Carrier quotes received (AIG + Liberty + Beazley)
T+18: Title carrier quote (Stewart Title)
T+21: Quote selection + binding letter
T+28: Policy drafting (binders signed)
T+35: SPA mark-up coordination (W&I → SPA reps mark-up)
T+45: Closing-ready (binding policy effective at signing)
```

---

## IX. SPA mark-up coordination

W&I policy DICTATES SPA representations & warranties. **Counsel must coordinate**:

1. **Reps mirror W&I scope** — W&I excludes XYZ → SPA carves out XYZ as specific indemnity
2. **Disclosure schedule** — must list ALL known issues (DANCORE, ÚZ, CoC) — W&I excludes anything disclosed
3. **Knowledge qualifiers** — „to the seller's knowledge" carries higher premium load; insure with care
4. **Survival periods** — match W&I; SPA cannot survive longer than W&I (gap = uninsured exposure)
5. **Caps** — W&I cap = SPA cap; do not let SPA exceed
6. **Threshold/baskets** — match W&I retention to SPA basket

**Counsel ask**: KŠB / JŠK / White & Case (NOT Aegis) review of SPA template against W&I binder.

---

## X. Risk register

| ID | Risk | Probability | Impact | Mitigation |
|----|------|-------------|--------|-----------|
| WIR-1 | Carrier declines coverage on key risks (DANCORE, ÚZ) | 40 % | Renegotiate; specific indemnity backstop | Escrow + sell-side specific indemnity for declined items |
| WIR-2 | Premium exceeds budget (>CZK 12M) | 30 % | Negotiate down via parallel quote; reduce limit if needed | Multiple carrier quotes; Liberty/Beazley as price competition |
| WIR-3 | Underwriter requires deeper DD before binding | 50 % | Schedule slip; expand DD scope | Pre-emptive DD package (already comprehensive workspace) |
| WIR-4 | PPF rejects W&I structure | 20 % | Renegotiate to escrow-only | Educate PPF DD that W&I = lower escrow |
| WIR-5 | DANCORE escalation post-bind | 15 % | W&I unaffected (already excluded); title carrier handles | Title carve-in is structurally robust |
| WIR-6 | ÚZ backfile reveals fraud → known-issue exclusion | 20 % | Specific indemnity covers; not W&I | Sell-side reserve in escrow; possible criminal exposure |

---

## XI. Decision points for principálové

| Decision | Owner | By When |
|----------|-------|---------|
| Approve W&I structure (vs escrow-only) | Zrůst + Foral | T+5 |
| Approve broker engagement | Zrůst + Foral | T+5 |
| Approve coverage limit (500M / 700M / 800M) | Zrůst + Foral | T+10 |
| Approve title insurance with DANCORE carve-in | Zrůst + Foral + counsel | T+14 |
| Approve premium budget CZK ~11-12M | Zrůst + Foral | T+14 |
| Sign binder | Zrůst + Foral + counsel | T+28 |

---

## XII. Open questions for counsel

1. **Czech regulatory** — does insurance binder pre-closing trigger any ČNB notification under §23a? (likely no, but check)
2. **Bond covenants** — do any bond prospekty require lender consent for new insurance arrangements? (likely no for W&I, but check)
3. **Tax treatment of premium** — is W&I premium tax-deductible by sell-side under CZ accounting rules?
4. **AML pre-bind** — carrier UBO check on Progresus group; potential for delays
5. **Notice provisions** — claims notice procedure must align with PPF post-closing process
6. **Subrogation** — carrier's right to recover from sell-side in case of fraud (standard exclusion)
7. **Allocation of legal costs** — W&I covers defense costs? (yes for covered claims, with cap)

---

## XIII. Cross-references

- **DANCORE structural defense**: [04-legal/DANCORE-DEFENSE-MEMO-v1.0.md](../04-legal/DANCORE-DEFENSE-MEMO-v1.0.md)
- **ÚZ backfile plan**: [03-financial/UZ-BACKFILE-PREP.md](../03-financial/UZ-BACKFILE-PREP.md)
- **Bond consent strategy**: [BONDHOLDER-PRE-CONSENT-STRATEGY-v1.0.md](./BONDHOLDER-PRE-CONSENT-STRATEGY-v1.0.md)
- **Governance continuity**: [04-legal/GOVERNANCE-CONTINUITY-MEMO-v1.0.md](../04-legal/GOVERNANCE-CONTINUITY-MEMO-v1.0.md)
- **ČÚZK title evidence**: [02-entity/CUZK-PAID-PULL-REQUEST.md](../02-entity/CUZK-PAID-PULL-REQUEST.md)
- **Disclosure schedule**: [DATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md](./DATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md)
- **Master DD report**: [MASTER-DD-REPORT-v1.0.md](./MASTER-DD-REPORT-v1.0.md)
- **PPF playbook (Pass-12 v2.1)**: [../PPF-PLAYBOOK.md](../PPF-PLAYBOOK.md)
- **Red flags**: RF-26 (DANCORE), RF-27 (ÚZ), RF-28 (bond CoC), RF-29 (Zrůst), H1 (prospekty)

---

## XIV. Status tracking

| Stage | Status | Owner | ETA |
|-------|--------|-------|-----|
| Principal sign-off W&I structure | ⏳ Pending | Zrůst + Foral | T+5 |
| Broker engagement (Marsh ČR) | ⏳ Pending | Korczák | T+5 |
| Underwriting Q&A package | ⏳ Pending | Korczák + counsel | T+10 |
| Carrier quotes (AIG + Liberty + Beazley) | ⏳ Pending | Marsh | T+14 |
| Title carrier quote (Stewart Title) | ⏳ Pending | Marsh | T+18 |
| Quote selection + binding letter | ⏳ Pending | Zrůst + Foral | T+21 |
| Policy drafting | ⏳ Pending | Carriers + counsel | T+28 |
| SPA mark-up coordination | ⏳ Pending | Counsel + Korczák | T+35 |
| Binder signed (closing-ready) | ⏳ Pending | All parties | T+45 |

---

*Pass-12 risk transfer architecture — completes Pass-12 deliverables stack. Závisí na schválení premium budgetu CZK ~11-12M + governance Co-CEO appointment.*

<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

*Žádné příchozí odkazy ve znalostním grafu.*

## 🏷️ Související soubory (podle shody tagů)

*Žádné silně související soubory (shoda tagů pod prahem 0,3).*

## 🌐 Pohled grafu

[Otevřít v portálu](../index.html) · [Mapa stránek](../sitemap.html) · [Hledat](../search.html) · Focus ID: `06-reports%2FWI-INSURANCE-MEMO.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
