# ČÚZK Paid Pull — Request Package (Pass-12)

**Pracovní prostor**: DD-Progresus-PPF-2026-04-21
**Verze**: v1.0
**Datum**: 2026-04-28
**Vlastník**: Tomáš Korčák (Discovery Lead, Able Group)
**Klasifikace**: DŮVĚRNÉ — Sell-side DD support
**Priorita**: P0 (72 h)
**Rozpočet**: CZK ~50 000 (~€2 000)

> 📌 **Účel**: Uzavřít vlastnické vrstvy nedostupné přes RÚIAN/ArcGIS (vlastnictví, zástavy, věcná břemena, omezení) pro 42 ha cíle transakce + 11 kandidátních parcel z analýzy `cuzk-cadastre-forensics.md` v k.ú. Mstětice (792764).

---

## I. Executive summary

| Pole | Hodnota |
|------|---------|
| **Mezera** | LV 927 + LV 1326 + 11 kandidátních parcel — vlastnické vrstvy KN za captcha-zdí (Radware Bot Manager) |
| **Cíl** | Plný výpis listů vlastnictví + omezení vlastnického práva (oddíl C) + věcná břemena (oddíl D) + plomby (oddíl E) + nabývací tituly (oddíl F) |
| **Metoda** | Placený dálkový přístup ČÚZK (`dalkovypristup.cuzk.cz`) — DD účet `~€2 000` |
| **Doba dodání** | T+5 pracovních dnů od aktivace účtu |
| **Validace** | Hash + archive + cross-link na `evidence-manifest.md` |
| **Risk vs cost** | RF-11 (zatížení LV), RF-26 (DANCORE titulní řetězec), RF-27 (Nový Zeleneč filing gap) — všechny vyžadují tento pull jako prerequisite |

---

## II. Identifikace dotazů (parcels + vlastníci)

### II.1 Konkrétní LV výpisy

| LV | Katastrální území | Kód k.ú. | Důvod požadavku |
|----|------------------|----------|-----------------|
| **927** | Mstětice | 792764 | Předpokládaný hlavní list cíle 42 ha; identifikace v dluhopisovém prospektu Progresus RD Rýmařov III |
| **1326** | Mstětice | 792764 | Sekundární LV ze stejného prospektu — pravděpodobně doplňková parcela |

> ⚠️ **Pokud LV 927 / 1326 nejsou v k.ú. Mstětice**, ale v k.ú. Zeleneč (792781) — viz `cuzk-cadastre-forensics.md` §2 — duplikujte dotaz pro obě k.ú. Cost-wise ~CZK 80 navíc.

### II.2 Kandidátní parcely (z RÚIAN ArcGIS analýzy)

Všech 11 parcel `≥ 5 ha` v k.ú. Mstětice (kombinovaně 135,1 ha):

| # | Parcela | Výměra (ha) | Druh | LV (k zjištění) |
|---|---------|------------|------|-----------------|
| 1 | **73/1** | 24,846 | orná půda | TBD |
| 2 | **178/1** | 16,842 | orná půda | TBD |
| 3 | **170** | 16,256 | orná půda | TBD |
| 4 | **182/1** | 13,413 | orná půda | TBD |
| 5 | **256/3** | 12,028 | orná půda | TBD |
| 6 | **80/2** | 10,974 | orná půda | TBD |
| 7 | **103/3** | 10,741 | orná půda | TBD |
| 8 | **260/1** | 10,502 | orná půda | TBD |
| 9 | **94/1** | 7,789 | orná půda | TBD |
| 10 | **121** | 6,263 | orná půda | TBD |
| 11 | **190/5** | 5,488 | orná půda | TBD |

**Pro každou parcelu vyžadovat**: aktuální LV číslo, vlastník, druh pozemku, způsob využití, oddíly C/D/E/F kompletně.

### II.3 Dotazy podle vlastníka

| # | Subjekt | IČO | Cíl dotazu |
|---|---------|-----|------------|
| O-1 | **Nový Zeleneč a.s.** | 27825981 | Všechny LV držené napříč ČR (NEJEN k.ú. Mstětice — odhalí scattered holdings) |
| O-2 | **RD Rýmařov Invest III. alpha s.r.o.** | 10800123 | Všechny LV — sesterské SPV, podezření na rozdělení 130 ha schématu |
| O-3 | **Nuka Estates s.r.o. „v likvidaci"** | 27890104 | Reziduální LV — likvidace nedokončena, parcely mohly zůstat |
| O-4 | **MARSEA MIA s.r.o.** | 03454029 | LV držená jako jištění — ověření vyvázání zástav |
| O-5 | **Modransky Haj s.r.o.** | (TBD ARES) | Paralelní vehikl Quinlan 2008-09-17 — historic tail check |

### II.4 Historie vlastnictví (P1)

Pro LV 927 + LV 1326: kompletní `archivní výpis` všech historických vlastníků od 2007 (vznik Nuka Estates) do 2026-04-28. Slouží jako důkaz `land-title-chain.md`:

```
Quinlan/Golub (IRL/USA) → Nuka Estates 2007 → Lébr → Progresus 2021
```

> Cíl: identifikovat jakékoliv mezery v řetězci vlastnictví, které by mohly podpořit DANCORE nárok (RF-26).

---

## III. Dodávané položky (deliverables)

| ID | Item | Formát | Validation |
|----|------|--------|-----------|
| D-1 | Plný výpis LV 927 | PDF + machine-readable XML | SHA-256 hash do `evidence-manifest.md` |
| D-2 | Plný výpis LV 1326 | PDF + XML | dtto |
| D-3 | Per-parcela mini-výpis (11×) | PDF | dtto |
| D-4 | Owner search Nový Zeleneč 27825981 | CSV (LV list) | dtto |
| D-5 | Owner search RD Rýmařov Invest III. alpha 10800123 | CSV | dtto |
| D-6 | Owner search Nuka Estates 27890104 | CSV | dtto |
| D-7 | Owner search MARSEA MIA 03454029 | CSV | dtto |
| D-8 | Historie LV 927 + 1326 (P1) | Archivní výpis PDF | dtto |
| D-9 | Konsolidovaná matrix `parcel_schedule.md` | Markdown | Naplnit `cuzk-cadastre-forensics.md §4` |

---

## IV. Procesní postup (operational sequence)

### Step 1 — Account activation (T+0)
- Otevřít DD účet u ČÚZK na `dalkovypristup.cuzk.cz`
- Identifikace: Able Group s.r.o. (Tomáš Korčák, statutární zástupce)
- Předplatba CZK 30 000 (na ~750 výpisů × CZK 40)
- Kontakt: ČÚZK metodické oddělení dálkového přístupu (info@cuzk.cz)
- **Time**: 1 pracovní den

### Step 2 — Concrete LV pulls (T+1)
- D-1, D-2, D-3 (LV 927 + 1326 + 11 parcel) → 13 výpisů × CZK 40 = CZK 520
- **Time**: < 1 hodina (online interface)

### Step 3 — Owner searches (T+2)
- D-4 až D-7: každý owner search vrátí seznam LV → následně pulled per LV
- Estimate: 4 vlastníci × ~20 LV avg = 80 výpisů × CZK 40 = CZK 3 200
- **Time**: 2-3 hodiny

### Step 4 — Historic chains (T+3)
- D-8: archivní výpis pro 2 LV × ~20 historických zápisů = ~40 výpisů × CZK 40 = CZK 1 600
- **Time**: 1 pracovní den (manual ČÚZK staff request)

### Step 5 — Consolidation (T+5)
- Zpracovat všechna data do `02-entity/cuzk-cadastre-forensics.md` §4 (parcel schedule)
- Cross-validate proti `RED-FLAGS.md` (RF-11, RF-26, RF-27)
- Update `MASTER-FINDINGS.md` (C6, H5)
- Notify counsel pokud DANCORE-relevant data v historii LV
- **Time**: 1 pracovní den

**Celkový rozpočet**: CZK ~5 500 utility + CZK 30 000 předplatba (rezerva pro doplňující dotazy) = **CZK ~50 000 cap**.

---

## V. Information requested from sell-side

Před aktivací DD účtu vyžadovat od prodávajícího (Progresus) tyto **pre-confirmed facts**:

1. **Schedule of LV** — autoritativní seznam všech LV, ke kterým se transakce vztahuje (kupní smlouva by měla obsahovat).
2. **Parcel mapping** — která konkrétní parcelní čísla v k.ú. Mstětice jsou součástí 42 ha cíle.
3. **Encumbrance disclosure** — všechny zástavy, věcná břemena, předkupní práva, omezení vlastnictví — ve formě prohlášení a záruk.
4. **Bond pledge cross-reference** — pro každou tranšu Progresus dluhopisů uvést, které parcely (LV) jsou předmětem zástavního práva ve prospěch věřitelů (oddíl C výpisu).

Pokud sell-side toto nedodá ≤T+3, **PPF DD má nárok na cost-recovery** za samostatný ČÚZK pull (negociovat při NDA).

---

## VI. Risk scenarios — co může pull odhalit

| Scénář | Pravděpodobnost | Impact | Reakce |
|--------|----------------|--------|--------|
| **A. Čistý titul, žádné překvapení** | 30 % | Pozitivní | Standard DD coverage; close fast |
| **B. Skryté zástavy ve prospěch dluhopisových věřitelů (RF-11)** | 35 % | Cena ↓ 100-300M CZK | Demand vyvázání před closing nebo proporční úschova |
| **C. DANCORE-relevant historie (RF-26)** | 15 % | Cena ↓ 250-400M CZK | Trigger DANCORE defense memo (separátní); W&I carve-out |
| **D. 130 ha schéma rozdrolené přes 3+ subjekty (B+D scenario)** | 15 % | Operational dependency | Vyjednat option/preemption na zbývajících 88 ha |
| **E. Materiální nesoulad s prospekty dluhopisů** | 5 % | Bond default risk + ČNB §23a | Eskalace ke counsel — možná stay deal |

---

## VII. Decision tree pro counsel briefing

```
ČÚZK pull dokončen (T+5)
├── Čistý titul (Scenario A) → standard close
├── Zástavy odhaleny (Scenario B)
│   ├── Vyvázání možné < CZK 100M → úschova
│   └── Vyvázání > CZK 300M → renegotiate price floor
├── DANCORE evidence (Scenario C)
│   ├── Vyhraje status quo → trigger DANCORE-DEFENSE-MEMO
│   └── Posouvá probability → W&I carve-out + title insurance
├── Multi-owner schéma (Scenario D)
│   └── Aktivovat option agreement na 88 ha s Lébrem/obcí
└── Bond mismatch (Scenario E)
    └── ESKALACE — pause DD, ČNB advisory, possibly disclose
```

---

## VIII. Counsel ask & dependencies

| Counsel | Ask | Deadline |
|---------|-----|----------|
| **CZ právní zástupce (KŠB / JŠK / White & Case)** | (a) Verify ČÚZK access right pro Able Group as advisor (NDA + power of attorney); (b) Review výpisů na encumbrance interpretation; (c) §1147 OZ relevance check pro historic chain | T+2 (advance) + T+5 (review) |
| **CZ daňový poradce** | Pokud owner search odhalí scattered holdings, daňové dopady transferu | T+5 (review) |

---

## IX. Cross-references

- **Source forensics**: [cuzk-cadastre-forensics.md](./cuzk-cadastre-forensics.md)
- **Title chain context**: [land-title-chain.md](./land-title-chain.md)
- **Bond pledge linkage**: [03-financial/sbirka-listin-audit.md](../03-financial/sbirka-listin-audit.md)
- **DANCORE defense (RF-26)**: [04-legal/DANCORE-DEFENSE-MEMO-v1.0.md](../04-legal/DANCORE-DEFENSE-MEMO-v1.0.md) (Pass-12)
- **Red flags**: RF-11 (LV encumbrances), RF-26 (DANCORE chain), RF-27 (NZ filing gap)
- **Evidence chain**: [07-sources/evidence-manifest.md](../07-sources/evidence-manifest.md)

---

## X. Status tracking

| Stage | Status | Owner | Date |
|-------|--------|-------|------|
| Account activation | ⏳ Pending | Tomáš Korčák | T+0 |
| LV concrete pulls (D-1..3) | ⏳ Pending | DD analyst | T+1 |
| Owner searches (D-4..7) | ⏳ Pending | DD analyst | T+2 |
| Historic chains (D-8) | ⏳ Pending | DD analyst | T+3 |
| Consolidation (D-9) | ⏳ Pending | Tomáš Korčák | T+5 |
| Cross-validation s RED-FLAGS | ⏳ Pending | Tomáš Korčák | T+5 |
| Counsel review | ⏳ Pending | CZ advisor | T+7 |

---

*Pass-12 production drive — P0 z 00-INDEX.md backlogu. Závisí na schválení rozpočtu CZK 50 000.*

<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

Na tento soubor odkazují:

- [06-reports/WI-INSURANCE-MEMO.md](../06-reports/WI-INSURANCE-MEMO.md) — 02-entity/CUZK-PAID-PULL-REQUEST.md

## 🏷️ Související soubory (podle shody tagů)

*Žádné silně související soubory (shoda tagů pod prahem 0,3).*

## 🌐 Pohled grafu

[Otevřít v portálu](../index.html) · [Mapa stránek](../sitemap.html) · [Hledat](../search.html) · Focus ID: `02-entity%2FCUZK-PAID-PULL-REQUEST.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
