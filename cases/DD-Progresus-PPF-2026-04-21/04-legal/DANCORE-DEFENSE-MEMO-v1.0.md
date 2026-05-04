# DANCORE Defense Memo — Pass-12

**Pracovní prostor**: DD-Progresus-PPF-2026-04-21
**Verze**: v1.0
**Datum**: 2026-04-28
**Pro**: CZ právní zástupce (KŠB / JŠK / White & Case — NIKOLI Aegis Law) + US counsel (Nevada bar admitted)
**Vlastník**: Tomáš Korčák (Discovery Lead & Chief Solution Architect, Able Group)
**Klasifikace**: ATTORNEY-CLIENT PRIVILEGE / WORK PRODUCT — DRAFT pro účely vyžádání právního stanoviska
**Související**: RF-26 (CRITICAL); navazuje na `04-legal/DANCORE-FORENSIC-DOSSIER.md` (forenzní dossier v1.0, 466 řádků); `04-legal/isir-court-sweep.md`; `02-entity/land-title-chain.md`; `RED-FLAGS.md`

---

## I. Executive Brief

### I.1 Pětibodové shrnutí

1. **Předmět sporu**: DANCORE LLC (Nevada, USA, entita # E0353972015-2, založena 2015-07-23) vede u Krajského soudu Praha pod sp. zn. **30 Co 228/2019-1538** šestiletý seriálový spor o určení vlastnictví parcel Nový Zeleneč v k.ú. Mstětice (kód 792764), souvisle ~1,1 milionu m² (z toho 42 ha aktuálně obchodovaný rozsah). Žaloba byla **dvakrát zamítnuta** (poslední rozsudek **2024-06-25**), avšak **odvolání podáno 2024-11-18 je k 2026-04-28 živé** — věc tedy **NENÍ res judicata**.

2. **Rozsah expozice (vážený očekávaný odhad Prismatic)**:
   - **Nejpravděpodobnější vážený výsledek**: **CZK 102,5 mil.** (vážený průměr scénářů ze §VI dossieru)
   - **Doporučená rezerva pro úschovu (95% CI nepříznivého scénáře)**: **CZK 250–400 mil.**
   - **Nepravděpodobný horní limit (5 % pravděpodobnost)**: **CZK 1,0 mld.+** (částečná restituce titulu nebo dorovnání rozvojové hodnoty)
   - **Základní scénář (70 % pravděpodobnost)**: **CZK 0** (odvolání zamítnuto, DANCORE vyčerpá opravné prostředky)

3. **Aktuální procesní stav**: Odvolání žalobce z 2024-11-18 putuje k odvolací instanci. Forma podání není dosud z veřejných zdrojů ověřena (pravděpodobně dovolání k Nejvyššímu soudu ČR nebo opětovné odvolání u KS Praha v jiném senátu, případně paralelně ústavní stížnost). **Toto je jedna z prvních otázek, na které potřebujeme stanovisko CZ counsel** (§ IX, gap G-1).

4. **Defenzivní teze (rank order)**:
   - **Teze A (procesní)**: §984 ObčZ — ochrana nabyvatele v dobré víře dle materiální publicity katastru nemovitostí. **Riziko**: Lukáš Zrůst je profesionální insolvenční správce; jeho znalost dřívějšího sporu může být shledána **skutečnou, nikoli konstruktivní** → §984 oslabeno.
   - **Teze B (věcná)**: Řetězec titulu (Quinlan/Nuka 2007 → Lébr/Ravantino → Progresus 2021) je formálně neporušen; všechny převody zapsány v KN bez závad k datu nabytí RD Rýmařov Invest III. alpha s.r.o.
   - **Teze C (negotiated settlement)**: Pre-trial settlement při horním okraji **CZK 50–150 mil.** výměnou za úplné vzdání se nároku DANCORE → odstraňuje nejistotu a otevírá W&I obal pro PPF.

5. **Klíčový ask na counsel**:
   - **CZ counsel** (KŠB / JŠK / White & Case Praha — **NIKOLI Aegis Law**, která je transakčním poradcem prodávajícího v plánovací smlouvě a nese konflikt zájmů pro adversarial review): T+10 dnů formální right-to-rely opinion na (a) realistické rozpětí expozice, (b) procesní strategii pro odvolací fázi, (c) settlement floor.
   - **US counsel** (admitted Nevada bar; doporučení: Holland & Hart, Snell & Wilmer, Lewis Roca Rothgerber, Brownstein Hyatt — všechny mají Las Vegas office a federal court practice): T+7 dnů Nevada SoS pull pro E0353972015-2, FinCEN BOI compliance check (pokud aplikovatelné po novelizaci 2025), PACER docket pull pro 2:18-cv-01136 (Dancore v. Zika), NV UCC liens search.
   - **Joint deliverable** T+14 dnů: kombinované memo + W&I carve-out structure pro insurance brokera.

### I.2 Doporučená pozice pro PPF disclosure

> *Existuje jediný probíhající titulový spor o parcely Nový Zeleneč, věc 30 Co 228/2019-1538 u Krajského soudu Praha, vedená společností DANCORE LLC, entitou registrovanou v Nevadě. Žaloba byla zamítnuta dvakrát ve prospěch Progresusu (naposledy 2024-06-25). Žalobce podal procesní odvolání 2024-11-18, které se projednává. Hodnotíme expozici jako materiální, ale ohraničenou a navrhujeme: (a) rezervu úschovy 350 mil. CZK držené při dokončení; (b) obal titulního pojištění s konkrétním vyloučením DANCORE; (c) plné zveřejnění českého soudního spisu, související korespondence a dokumentů řetězce vlastnických titulů od dřívějších vlastníků.*

---

## II. Background — Title Chain

### II.1 Chronologie vlastnického řetězce (zkrácená)

Plný výklad a podpůrná evidence: viz `02-entity/cuzk-cadastre-forensics.md` (forenzní analýza ČÚZK / RUIAN, 2026-04-21) a `02-entity/land-title-chain.md`.

| Fáze | Období | Vlastník / vehikl | Klíčové události | Forenzní status |
|---|---|---|---|---|
| **F1 — Quinlan / Golub** | ~2007–2010 | Quinlan Private Residential II Reporting S.à.r.l. (LUX) → **Nuka Estates s.r.o.** (CZ, IČO 27890104, založena 2007-05-16) | Akvizice ~130 ha Mstětic. Zajištěný věřitel: **MARSEA MIA s.r.o.** (IČO 03454029, Olomouc). Globální finanční krize 2008-10 → kolaps Quinlan v Irsku, Derek Quinlan osobně v insolvenci. | Distressed origin. Likvidace Nuka Estates **nikdy nedokončena** k 2026-04-21 — likvidátorka Pavlína Zdařilová od 2017-12-12 / přechod do role likvidátorky 2023-04-19. |
| **F2 — Mezilehlá** | ~2010–2017 | Nuka Estates v likvidaci | Prodejní fáze aktiv v tísni. Konkrétní dispozice s parcelami v tomto okně **nejsou veřejně transparentní**. | **Information gap G-2** — zdrojový materiál pro DANCORE Teorii A (neúčinný převod) leží pravděpodobně zde. |
| **F3 — Lébr / Ravantino** | ~2017–2020 | Josef Lébr (olomoucký podnikatel, ex-vlastník SK Sigma Olomouc, 50% Ravantino Group) | Akvizice podílu v projektu, územní studie „NOVÉ MSTĚTICE ZELENEČ-MSTĚTICE 1" (2011), oznámení projektu Nový Zeleneč (iROZHLAS 2020-03-06). Ravantino Group **stále uvádí projekt na webu k 2026-04-21** (tel. +420 724 01 01 09, info@ravantino.cz). | Otevřená otázka reziduálního zájmu Lébr/Ravantino — `02-entity/land-title-chain.md` Q2 (varianty A–D). Pro DANCORE memo nikoli kritické, pro PPF disclosure ano. |
| **F4 — Akvizice Progresus** | 2021 | **Nový Zeleneč a.s.** (IČO 27825981, založena 2007-12-20) → 100% akcionář **RD Rýmařov Invest III. alpha s.r.o.** (IČO 10800123, založena **2021-04-30**) → mateřská **Progresus Invest Holding s.r.o.** | 2021-01-18: Mgr. Jindřiska Chytilová do představenstva Nový Zeleneč a.s. (2 týdny před založením Progresus = jmenování ze strany Progresu při podpisu). 2021-02: Progresus založen Zrůstem + Foralem (50/50). 2021-04-30: RD Rýmařov Invest III. alpha s.r.o. zapsán — vykupuje Nový Zeleneč a.s. | **Akvizice proběhla v době, kdy spor DANCORE byl již 2 roky veden** (původní žaloba 2019). Sofistikovaný insolvenční správce Zrůst měl nebo měl mít **skutečnou znalost** o sporu — to je centrální zranitelnost obrany §984 v § V níže. |
| **F5 — Nyní (drží žalovaný)** | 2021–dosud | RD Rýmařov Invest III. alpha s.r.o. = **přímý držitel titulu / odpůrce ve sporu 30 Co 228/2019-1538** | Územní plán Zeleneč přijat 2025-02-18; CENIA EIA STC2258 schválena. Souběžně 5 dluhopisových prospektů emitovaných skupinou Progresus 2021–2026 (~7,6+ mld. CZK kumulativní face), každý zveřejňující spor zúženě jako „jediný spor". | Disclosure-quality concern — viz § VII.2. |

### II.2 Identifikace sporných parcel

Z `02-entity/cuzk-cadastre-forensics.md`:

- K.ú. **Mstětice (kód 792764)**, mateřská obec Zeleneč (539066), okres Praha-východ
- Pracovní hypotéza pro 42ha rozsah transakce: **parcely 73/1 (24,85 ha) + 178/1 (16,84 ha) = 41,69 ha** ≈ 42 ha (jediný souvislý pár dle ArcGIS RUIAN)
- **LV 927 a LV 1326** uváděné v dokumentech Progresusu — vlastnictví dosud **NEOVĚŘENO programaticky** (ČÚZK KN za captcha-zdí Radware Bot Manager); vyžaduje placený účet dálkového přístupu nebo on-site DD návštěvu (DD action item, ~50 000 CZK z rozpočtu)
- DANCORE žalobní petit pravděpodobně směřuje na konkrétní parcely v rámci 1,1 mil. m² obvodu — **přesný rozsah žalobního petitu je další information gap pro CZ counsel** (§ IX, gap G-3)

---

## III. CZ Litigation — Spis 30 Co 228/2019-1538

### III.1 Identifikace věci

| Pole | Hodnota | Zdroj |
|---|---|---|
| Soud | **Krajský soud v Praze** (odvolací senát 30) | Prospekt Progresus + struktura spisu |
| Sp. zn. | **30 Co 228/2019-1538** | Prospekt Progresus 2024-12-30 + nezávislé OSINT ověření |
| Žalobce | **DANCORE LLC** (Nevada USA, E0353972015-2) | Prospekt Progresus + Nevada SoS hint (formát konzistentní) |
| Žalovaný | **RD Rýmařov Invest III. alpha s.r.o.** (CZ, IČO 10800123) — současný držitel titulu; **dříve pravděpodobně předchozí držitel titulu** (Nový Zeleneč a.s. nebo předchůdce v řetězci) | Prospekt Progresus + chain-of-title analýza |
| Předmět | **Určovací žaloba** (česká civilní procedura `Co` = odvolací civilní řízení) na vlastnictví parcel Nový Zeleneč k.ú. Mstětice | Forenzní rozluštění formátu sp. zn. + velikost spisu (1 538 dokumentů) implikující rozsáhlé dokazování |
| Velikost spisu | **1 538 dokumentů** (číslo za pomlčkou v sp. zn.) | Veřejně publikované sp. zn. |
| Hodnota sporu (interní DD odhad) | **CZK 209,6 mil.** (interní DD nota 2026-04-01; **NEOVĚŘENO** vůči petitu — viz § IX gap G-4) | Interní DD; vyžaduje ověření CZ counsel |

### III.2 Procesní chronologie (rekonstruovaná z veřejných zdrojů)

| Datum | Událost | Zdroj/důvěryhodnost |
|---|---|---|
| Před 2019 | DANCORE podává původní určovací žalobu u soudu prvního stupně (pravděpodobně Okresní soud Praha-východ, příslušný pro k.ú. Mstětice) | Odvozeno z formátu sp. zn. „30 Co 228/2019" — odvolací zápis 2019 → původní podání nejpozději 2018–2019 |
| 2019 | Soud prvního stupně **zamítá žalobu DANCORE**; odvolání DANCORE zapsáno jako 30 Co 228/2019 u KS Praha | Implikováno formátem |
| 2019–2024 | **Víceleté projednávání** s vrácením věci, pravděpodobně znaleckým dokazováním a několika koly písemných podání. Velikost spisu 1 538 dokumentů indikuje rozsáhlé procesní manévrování. | Forenzní rozluštění |
| **2024-06-25** | KS Praha **zamítá žalobu podruhé** ve prospěch Progresusu | Prospekt Progresus 2024-12-30 (HIGH credibility) |
| **2024-11-18** | DANCORE **podává procesní odvolání** — pravděpodobně dovolání k Nejvyššímu soudu ČR; alternativní hypotézy: (a) opětovné odvolání u KS Praha, (b) souběžně ústavní stížnost k ÚS, (c) obnova řízení | Prospekt Progresus; přesná forma **NEOVĚŘENA** — gap G-1 |
| 2025–2026 | Věc projednávána. **Žádné veřejné rozhodnutí** k 2026-04-28. | Veřejné rejstříky NS / NSS / ÚS (nsoud.cz, nssoud.cz, nalus.usoud.cz) — žádné publikované rozhodnutí proti Progresus k dotazu z 2026-04-21 |

### III.3 Klíčové procesní milníky a rizika

- **Nejvyšší soud ČR (dovolání)**: pokud forma podání 2024-11-18 je dovolání, klíčové bude posouzení přípustnosti dovolání. NS rozhoduje o přípustnosti dle §237 OSŘ — typicky rozhodne v horizontu **6–18 měsíců**. Pokud připustí dovolání meritorně, otázka **dobré víry nabyvatele dle §984 ObčZ** může být přezkoumávána zcela nově (kasační princip).
- **Ústavní soud (ústavní stížnost)**: pokud paralelně podána, harmonogram je **3–24 měsíců**. ÚS by typicky řešil otázku procesní spravedlnosti, nikoli meritu — riziko nižší pro Progresus, ale procesní zdržení vysoké.
- **Materiální publicita**: §984 ObčZ stanoví, že kupující v dobré víře spoléhající na zápis v KN je chráněn proti nezapsaným nárokům. **Ale**: §984 odst. 2 vyžaduje, aby nabyvatel **nebyl ve zlé víře** — což zahrnuje skutečnou znalost o vadě převodu. **To je hlavní zranitelnost** (viz § V Teze A).

### III.4 Identifikace mezer v důkazní pozici DANCORE

Pracovní hypotézy o slabostech žalobce (k testování CZ counsel):

1. **Aktivní legitimace (standing)** — DANCORE jako Nevada LLC s **„nejasnou vlastnickou strukturou"** (vlastní charakteristika z prospektu Progresus) musí prokázat, jak právní nárok nabyla. Pokud nárok nebyl řádně postoupen od původního nositele (zřejmě subjektu z éry Nuka Estates / Quinlan), žaloba má slabou aktivní legitimaci. **Procesní obrana A.1**.

2. **Promlčení / prekluze** — určovací žaloba není sama o sobě promlčitelná (§629 ObčZ pro určovací žaloby), **ALE** nárok na náhradu škody nebo bezdůvodné obohacení **promlčen je** (subjektivní 3letá / objektivní 10letá / 15letá u úmyslné škody dle §636 ObčZ). Pokud podkladové porušení leží před r. 2009 (éra Quinlan/Nuka), objektivní prekluze za 15+ let. **Procesní obrana A.2**.

3. **Dvě pravomocná zamítnutí** — 2024-06-25 zamítnutí KS Praha je druhé v pořadí. To znamená, že soud prvního stupně i odvolací soud shledaly žalobu nedůvodnou v meritu **DVAKRÁT**. Pro připuštění dovolání musí žalobce prokázat zásadní právní otázku dle §237 OSŘ — **vyšší práh než běžný odvolací důvod**.

4. **Důkazní břemeno** — v civilním řízení nese žalobce důkazní břemeno o (a) existenci svého práva, (b) jeho porušení, (c) příčinné souvislosti. DANCORE jako schránková Nevada LLC bez aktiv má **omezený dokumentační substrát** k prokazování faktického vlastnictví v ČR. Velikost spisu 1 538 dokumentů indikuje, že velká část je pravděpodobně procesní obstrukce, nikoli věcné dokazování ze strany žalobce.

5. **Žádné veřejné mediální pokrytí** sporu (audit `04-legal/DANCORE-FORENSIC-DOSSIER.md` § 9) navzdory rozsahu (1,1 mil. m², 200M+ CZK ve sporu) — naznačuje, že DANCORE nehledá tlak na narovnání přes tisk, což je nestandardní pro skutečně silný nárok.

### III.5 Refresh odhadu expozice (vůči DANCORE-FORENSIC-DOSSIER.md § 6)

**Bez nového důkazu od 2026-04-21 dossieru — odhad zůstává:**

| Scénář | Pravděpodobnost | Expozice (CZK) | Cesta |
|---|---|---|---|
| Základní (odvolání zamítnuto / nepřípustné) | 70 % | 0 | NS odmítne dovolání nebo potvrdí KS Praha → res judicata |
| Nepříznivý (částečné settlement / vrácení s nepříznivým diktem) | 25 % | 100–400 mil. | Dovolání připuštěno; otázka §984 přezkoumávána; settlement výhodný oběma stranám |
| Nejhorší (částečná restituce titulu / náhrada na rozvojové hodnotě) | 5 % | 600 mil. – 1,0 mld.+ | NS shledá obranu §984 nedostatečnou (skutečná zlá víra Zrůsta); částečný restituční titul |

**Vážená očekávaná hodnota**: 0,70 × 0 + 0,25 × 250M + 0,05 × 800M = **CZK 102,5 mil.**

Doporučená rezerva (pokrytí 95% CI nepříznivého scénáře): **CZK 250–400 mil. v úschově**.

**Možná aktualizace odhadu po stažení PACER 2:18-cv-01136 (US counsel ask)**:
- Pokud Dancore v. Zika ukáže **vzorec zlomyslné litigace** ze strany žalobce → snížení pravděpodobnosti nepříznivého scénáře (DANCORE shledán claim-farmerem)
- Pokud ukáže **legitimní obchodní dispute** s předchozím partnerem → mohly by existovat dokumenty podporující nárok, který se přesunul na české parcely → mírně zvýšená pravděpodobnost nepříznivého scénáře

---

## IV. US Parallel — Dancore v. Zika 2:18-cv-01136 (D.Nev)

### IV.1 Identifikace federální věci

| Pole | Hodnota | Zdroj |
|---|---|---|
| Soud | United States District Court for the District of Nevada | Justia + Law360 |
| Sp. zn. | **2:18-cv-01136** | Justia docket index |
| Podáno | 2018 | Implikováno z čísla věci (rok 2018) |
| Místo | Las Vegas, NV | Standardní pro D. Nev. |
| Žalobce | Dancore LLC (NV) | Justia |
| Žalovaný | „Zika" — **české / středoevropské příjmení** | Justia |
| Důvod | **Neznámé bez stažení PACER** — pravděpodobně federal diversity jurisdiction (28 U.S.C. § 1332) nebo federal question | — |
| Status | **Neznámý** — vyžaduje docket pull | — |

### IV.2 Forenzní význam

Existence federální věci 2:18-cv-01136 je **nejdůležitější forenzní zjištění** v dossieru DANCORE z následujících důvodů:

1. **Vzorec a praxe**: Potvrzuje, že DANCORE je **aktivní žalobce** (nikoli pasivní holdingové vehikulum). Nárok proti „Zika" zakládá **vzor opakované litigační aktivity** — relevantní pro hodnocení důvěryhodnosti a motivace v české věci.

2. **Vodítko k identifikaci skutečného vlastníka**:
   - „Zika" jako české příjmení silně naznačuje, že DANCORE bylo dříve v obchodním vztahu s osobou české diaspory v USA
   - Pokud dispute s „Zika" zahrnoval převod práv k českým aktivům nebo finanční transakci na CZ trh → **přímý dokumentární substrát** pro hypotézu „skryté preexistující vlastnictví" (Teorie C v dossieru § 5)

3. **Discovery overlap potential**:
   - V US federálním řízení může být DANCORE pod **discovery obligation** dle Federal Rules of Civil Procedure (Rules 26–37)
   - Pokud byl spor 2:18-cv-01136 ukončen settlement nebo summary judgment, settlement agreement / discovery production často obsahuje pojmenování beneficial owners
   - **Možné získání BOI nepřímou cestou** — přes deposition transcripts, complaint/answer, declarations of authority, attorney appearances

4. **Nezveřejněno v žádném dokumentu Progresus**: Toto **není uvedeno v žádném prospektu Progresus, který jsme přezkoumali**. Tak či onak, nezveřejnění je **samo o sobě signál** — Progresus o věci buď neví (slabá due diligence), nebo ji vnímá jako irelevantní (potenciálně chybný úsudek vzhledem k forenzní hodnotě).

### IV.3 US counsel ask — strukturovaný

**T+7 dnů deliverable** (US counsel, Nevada bar admitted; doporučení: Holland & Hart LLP Las Vegas / Snell & Wilmer Las Vegas / Lewis Roca Rothgerber Christie LLP / Brownstein Hyatt Farber Schreck Las Vegas):

#### Ask 1 — Nevada Secretary of State pull pro DANCORE LLC E0353972015-2
- Kompletní formační podání (Articles of Organization)
- Všechny annual lists / annual reports od 2015 do 2026 (Nevada vyžaduje annual list každoročně)
- **Managing member jméno + adresa** (publikované veřejně dle NV Revised Statutes Chapter 86)
- **Registered agent** (komerční služba pravděpodobně InCorp Services / Registered Agents Inc / CT Corp / National Registered Agents — neposkytuje BOI ale potvrzuje validitu entity)
- Statement of Information / amendments — historie jakýchkoli změn members/managers
- **Status entity** (active / default / revoked) k dnešnímu dni
- Doložení adresy hlavního místa podnikání

#### Ask 2 — FinCEN BOI compliance check
- **Kontext**: Corporate Transparency Act účinný 2024-01-01; preexistující entity podání BOI do 2025-01-01.
- **Klíčová poznámka**: Pravidla FinCEN BOI byla v **březnu 2025 podstatně novelizována** — zúžena pouze na zahraničně vlastněné entity. DANCORE jako americky usídlená NV LLC může být nyní **osvobozena**.
- **US counsel ask**: Potvrdit aktuální compliance status DANCORE pod novelizovaným režimem CTA. Pokud BOI bylo podáno v okně 2024-01–2025-01, podání zůstává v FinCEN databázi.
- **Realizovatelná cesta k BOI**: pouze přes (a) Rule 45 subpoena v kontextu obnoveného federálního sporu, (b) federal law enforcement subpoena, (c) FinCEN consent process s pověřenou finanční institucí. **Pasivní DD pull NENÍ možný**.

#### Ask 3 — PACER docket pull pro 2:18-cv-01136 (Dancore LLC v. Zika)
- Krycí list (cover sheet) + civil cover sheet (JS 44)
- Žaloba (Complaint) — KRITICKÉ: identifikuje příčinu, žádané plnění, jurisdikční základ
- Odpovědi (Answer / Motion to Dismiss)
- Veškeré filings docket entries — case management orders, scheduling orders, discovery motions
- Konečné dispozice (settlement / summary judgment / dismissal / verdict)
- **Counsel of record** pro DANCORE — jméno a adresa právního zástupce, který může stále působit nebo poskytnout informace o klientech (s výhradou attorney-client privilege)
- Případné transcripts depositions / hearings
- Pokud sealed, dokumenty pod seal — alespoň existenci a obecnou kategorii

#### Ask 4 — Nevada UCC / liens search
- UCC-1 financing statements podané proti DANCORE LLC
- UCC liens identifikují **zajištěné věřitele** = pravděpodobné funders sporu nebo holdery zástavy nad nárokem DANCORE
- Pokud existuje funding agreement (litigation funding), zajištěný věřitel je **přímý kanál k beneficial owner**

#### Ask 5 — Nevada state courts search (Clark County + Washoe County)
- DANCORE LLC jako žalobce nebo žalovaný v jakémkoli státním soudním řízení v NV
- Jurisdikční přehled jakýchkoli zápisů sporu, které mohou poskytnout další forenzní substrát

### IV.4 Nevada bar admission — proč tato kvalifikace

Proč specificky Nevada-admitted counsel (a nikoli generic CZ-US international firm):

1. **PACER + Nevada SoS access** — ideálně z nevadské kanceláře pro rychlost a místní vztahy
2. **Local rules District of Nevada** — discovery, motion practice, Rule 16/26 conferences vyžadují praktické znalosti
3. **State bar disciplinary history check** pro stávajícího counsel of record DANCORE (pokud v NV bar evidence)
4. **Případná nová litigace** — pokud bude potřeba zahájit subpoena practice nebo intervention v existující věci, lokální admission je nezbytná
5. **Nevada UCC filing system** — manuální + online přístup, nevadský counsel zná interní postupy

**Náklady**: indikativně USD 350–600/hr partner level; T+7 deliverable bude vyžadovat 20–40 hodin práce → **USD 10 000–25 000**. Toto je proporcionální vzhledem k rozsahu CZK 250–400 mil. expozice.

---

## V. Defense Theses (rank order)

### Teze A — Procesní obrana (rank 1, doporučená primární linie)

**Jádro teze**: §984 ObčZ (zákon č. 89/2012 Sb.) — materiální publicita katastru nemovitostí + ochrana nabyvatele v dobré víře.

**Citace ustanovení**:
> *§ 984 ObčZ — (1) Není-li stav zapsaný ve veřejném seznamu v souladu se skutečným právním stavem, svědčí zapsaný stav ve prospěch osoby, která nabyla věcné právo za úplatu v dobré víře od osoby k tomu oprávněné podle zapsaného stavu.*

**Procesní podpora**: § 243g odst. 2 OSŘ (zákon č. 99/1963 Sb.) — pravomocná rozhodnutí katastrálního úřadu o vkladu jsou závazná.

**Vlastní formulace obrany Progresusu** (z prospektu 2024-12-30):
> *„RD Rýmařov Invest III. alpha s.r.o. nabyla pozemky v katastrálních územích Mstětice a Zeleneč o celkové ploše téměř 1,1 milionu m² v době, kdy existovalo pravomocné rozhodnutí Krajského soudu v Praze, a splnila všechny ostatní podmínky pro uplatnění zákonných ochran kupujících nemovitostí."*

**Síla obrany**:
- ✅ Dvě pravomocná zamítnutí žaloby DANCORE (poslední 2024-06-25) — silný precedent
- ✅ KN zápis ve prospěch RD Rýmařov Invest III. alpha s.r.o. nezpochybněn vkladovým řízením
- ✅ Akvizice provedena za úplatu (předpoklad — vyžaduje dokumentační podporu)

**Zranitelnosti**:
- ⚠️ **CENTRÁLNÍ ZRANITELNOST**: §984 odst. 2 vyžaduje, aby nabyvatel **nebyl ve zlé víře** o vadě převodu. **Lukáš Zrůst je profesionální insolvenční správce** (Konreo v.o.s. spravoval Sberbank, Vítkovice Heavy Machinery, ZOOT, Amati-Denak — viz `05-osint/insolvency-acquisition-pattern.md`). Jeho povolání vyžaduje **hlubokou due diligence řetězce titulů**. Argument, že by neznal aktivní 2letý spor v okamžiku akvizice (2021), je **soudně neudržitelný** — přinejmenším při test of „reasonable insolvency professional" standardu.
- ⚠️ Pokud NS připustí dovolání s otázkou „skutečné vědomosti vs. konstruktivní vědomosti" — Progresus se ocitá pod **standardem actual knowledge**, kde i mírná forma znalosti převažuje.
- ⚠️ Akvizice 2021 byla **uprostřed aktivního sporu** (původní žaloba 2019; první zamítnutí 2019/2020; věc živá v odvolacím přezkumu) — Progresus nemůže věrohodně tvrdit, že o existenci sporu nevěděl.

**Doporučení CZ counsel**:
- Připravit **memorandum o standardech dobré víry** dle judikatury NS k §984 (NS 22 Cdo 2999/2017, 22 Cdo 2554/2018 a další)
- **Dokumentační due diligence Progresus 2021** — co konkrétně Zrůst věděl, kdy a jak to dokumentoval. Pokud existuje pre-acquisition legal opinion (např. od Aegis Law nebo jiného firmy), který spor zmínil a doporučil pokračovat → **silný důkaz dobré víry s informovaným úsudkem**. Pokud spor nebyl zmíněn → **slabší pozice**.
- Stress-test obrany v adversarial review s přizvaným externím partnerem (KŠB / JŠK)

### Teze B — Věcná obrana (rank 2, doplňková linie)

**Jádro teze**: Řetězec titulu je formálně neporušen; všechny převody zapsány v KN bez závad k datu nabytí RD Rýmařov Invest III. alpha s.r.o.

**Podpora**: `02-entity/cuzk-cadastre-forensics.md` + plný KN historický výpis (po stažení LV 927, LV 1326 z placeného přístupu ČÚZK).

**Klíčové důkazní body** (k ověření po stažení KN):
1. **Quinlan/Nuka era (2007–2017)**: Žádný nezapsaný nárok DANCORE v KN k datu převodu
2. **Lébr era (2017–2021)**: Akvizice Lébra zapsána, žádné výhrady
3. **Progresus akvizice (2021)**: Vklad RD Rýmařov Invest III. alpha s.r.o. proveden bez závady; KN potvrdilo přechod
4. **Žádný věcně-právní nárok DANCORE v KN nikdy nezapsán** (předkupní právo, věcné břemeno, zástava, omezení dispozice)

**Síla**:
- ✅ Materiální publicita podporuje žalovaného (RD Rýmařov)
- ✅ Žádný formální vad převodu zjištěný v KN

**Zranitelnosti**:
- ⚠️ Pokud DANCORE Teorie A (neúčinný převod ze strany Nuka Estates) je opřena o **nedoložené plnění protihodnoty** ze strany Nuka v okně 2010–2017, věcná obrana je slabá vůči argumentu o **fraudulent conveyance / podvodném převodu**
- ⚠️ Likvidace Nuka Estates **nikdy nedokončena** — zbytkové nároky věřitelů (MARSEA MIA, předchozí Quinlan/Golub) mohou být použity k odůvodnění zpochybnění převodů z období likvidace

**Doporučení**:
- Stáhnout **plný KN historický výpis pro LV 927, LV 1326** (placený ČÚZK účet, ~50 000 CZK)
- Vyžádat od prodávajícího **certifikát od Pavlíny Zdařilové (likvidátorka Nuka Estates)** potvrzující absenci reziduálních nároků (action item z `05-osint/insolvency-acquisition-pattern.md`)
- Vyžádat **discharge letter od MARSEA MIA s.r.o.** potvrzující vyrovnání zástavního nároku
- Připravit **chain-of-title forensic memo** k vložení do dataroom

### Teze C — Negotiated settlement (rank 3, fallback / risk-removal)

**Jádro teze**: Pre-trial settlement při horním okraji **CZK 50–150 mil.** (target CZK 100 mil.) výměnou za úplné vzdání se nároku DANCORE. Odstraňuje nejistotu, otevírá W&I obal pro PPF, zkracuje uzavření transakce.

**Třístupňová nabídková strategie** (k vypracování s CZ counsel):

| Stupeň | Nabídka | Trigger | Důvod |
|---|---|---|---|
| **Stupeň 1** | CZK 50 mil. | Před vydáním rozhodnutí NS o přípustnosti dovolání | Otevírací nabídka — pokud DANCORE má slabou vlastní pozici, může přijmout |
| **Stupeň 2** | CZK 150 mil. | Po vydání rozhodnutí NS, pokud dovolání připuštěno k meritornímu projednání | Eskalace pod tlakem nového rizika |
| **Stupeň 3** | CZK 350 mil. | Před vydáním finálního rozhodnutí v meritu — pouze pokud signály z dokazování jsou nepříznivé pro Progresus | Strop nabídky; nad tímto neprávně-výhodné vzhledem k vážené EV |

**Strategické úvahy**:
- ⚠️ **Settlement riziko reputační**: pokud DANCORE pomocí settlementu signalizuje slabost Progresus, může to spustit **další claim-farmery** — nadále nevyřešené dispute v okolí Quinlan/Nuka chain
- ⚠️ **Settlement triggers PPF disclosure obligation** — settlement pro CZ counsel = transakční podstatná událost
- ✅ **Settlement removes uncertainty** — ideální pro PPF, který platí prémium za clean title
- ✅ **Settlement může být strukturován jako confidential** s NDA → omezuje reputační dopad

**Doporučení**:
- Po stažení PACER 2:18-cv-01136 (US counsel) zhodnotit, zda Dancore v. Zika ukazuje **vzor settlement-driven litigation** (DANCORE jako claim-farmer) → silnější pozice pro nízkou settlement nabídku
- Vést settlement negotiations v **paralelní stopě s litigací**, nikoli jako alternativu — udržet maximum tlaku
- **Settlement se musí strukturálně vejít do W&I carve-out plánu** (§ VI) — settlement amount + W&I retention musí pokrývat full historic exposure

---

## VI. Title Insurance & W&I Carve-Out

### VI.1 Strategie

**Cíl**: Vyřadit DANCORE z generického W&I (Warranties & Indemnity) krytí transakce s PPF a získat **samostatnou title insurance policy** s konkrétním krytím sporu DANCORE. Toto izoluje známé riziko, umožňuje cenu W&I za standardní podmínek a poskytuje PPF kontrolovaný financial backstop.

### VI.2 Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  TRANSAKCE Progresus → PPF (akciový obchod, RD Rýmařov III.alpha) │
└──────────────────────────────────────────────────────────────┘
              │
              ├── W&I Insurance (Standard)
              │   ├── Krytí: Všechna prohlášení a záruky kromě DANCORE
              │   ├── Vyloučení: DANCORE LLC sp. zn. 30 Co 228/2019-1538
              │   └── Limit: 10–15 % protiplnění (standardní)
              │
              ├── Title Insurance (Specific Carve-Out)
              │   ├── Krytí: DANCORE spor specificky pojmenován
              │   ├── Limit: CZK 1 mld.+ (full worst-case)
              │   ├── First-loss: Escrow CZK 350 mil.
              │   └── Second-loss: Title insurance až do limitu
              │
              ├── Escrow (CZK 350 mil. při dokončení)
              │   ├── Tranše 1: CZK 200 mil. — uvolnění při finálním zamítnutí dovolání NS
              │   ├── Tranše 2: CZK 100 mil. — uvolnění uplynutím 3 let
              │   ├── Tranše 3: CZK 50 mil. — uvolnění při potvrzení žádné podání u ÚS
              │   └── Při nepříznivém rozhodnutí: settlement payout DANCORE až do CZK 350 mil.
              │
              └── Seller Indemnity (Specific to DANCORE, no cap)
                  ├── Triggered: až po vyčerpání escrow + title insurance
                  └── Source: Progresus Group a.s. (3B CZK group guarantee)
```

### VI.3 Brokerský přístup

**Doporučené brokery / underwritery**:

| Broker / Carrier | Typ | Důvod |
|---|---|---|
| **Marsh** (Praha + London + NYC) | W&I + Title Insurance | Globální broker s českou kapacitou; dělali PPF transakce historicky |
| **Aon** (Praha) | W&I + Title | Konkurence Marsh, podobná kapacita |
| **First American Title** (NV / globální) | Specialty Title Insurance | Lídr title insurance, US underwriting capacity, zkušenost s cross-border title chains |
| **AIG / Chubb** | Specialty + W&I | Velký underwriter; mohou poskytnout vysoké limity |
| **Stewart Title** | Title specialty | NV underwriting, federal court litigation experience |

**Indikativní pricing**:
- **W&I**: 1,0–1,5 % limit pojištění, deductible 0,5–1 % EV → CZK 50–75 mil. premium pro CZK 5 mld. EV transakci
- **Title insurance specific to DANCORE**: 1,5–3,0 % limit pojištění (vyšší kvůli known dispute), deductible CZK 350 mil. (escrow tier) → CZK 15–30 mil. premium pro CZK 1 mld. limit

**Klíčové vyjednávací body s underwriterem**:
1. **Konkretní vyloučení DANCORE v základní W&I**, NIKOLI plošné vyloučení „all known disputes" — to by ohrozilo i jiné disclosed items
2. **Title insurance language** musí explicitně pojmenovat sp. zn. 30 Co 228/2019-1538 + ID DANCORE LLC E0353972015-2
3. **Stacking provision** — title insurance navazuje POD escrow (escrow first-loss), s automatickou aktivací při nedostatku
4. **Subrogation rights** — pojistitel má právo postoupení po výplatě pro pursuit proti DANCORE (případné counter-claim, sanctions)
5. **Cooperation clause** — Progresus / kupující PPF spolupracují na obraně sporu po uzavření; pokud Progresus selže v cooperation, krytí se snižuje

### VI.4 Forecast nákladů title strategy

| Položka | Náklad (CZK) | Vlastník |
|---|---|---|
| W&I premium (1,2 % na CZK 5B EV) | ~60 mil. | Sdíleno (typicky kupující 50/50 split) |
| Title insurance premium (2 % na CZK 1B limit, DANCORE-specific) | ~20 mil. | Sdíleno nebo seller-paid |
| Escrow setup + agent fees | ~5 mil. | Sdíleno |
| Title forensic memo (CZ counsel + ČÚZK pull) | ~1–2 mil. | Seller (Progresus) |
| **Celkem náklady na title risk mitigation** | **~85–90 mil.** | — |

**Hodnota mitigace**: Title strategy odstraňuje CZK 250–400 mil. value-at-risk z transakce → ROI ~3–5x. **Doporučujeme PROCEED.**

---

## VII. Dataroom Strategy

### VII.1 Princip — full disclosure preferred over discovery later

**ARCHER SUPREME doctrine pro DD disclosure**: Cokoli, co PPF najde sami v T+10 dnů (poradenská lavička: BBH / KŠB / White & Case + EY), bude **2× horší** než to, co Progresus prezentuje pre-emptively s vlastním forensic narrative.

DANCORE je **publicly disclosable** (uvedeno v dluhopisovém prospektu Progresus 2024-12-30), takže žádná NDA-based confidentiality není v ohrožení. **Plná disclosure je defenzivně optimální**.

### VII.2 Dokumenty k disclosure (kontrolní seznam)

Mapováno na strukturu `06-reports/DATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md`:

#### Sekce 4-LEGAL > DANCORE (nová podsekce)

- [ ] **04-LEGAL/DANCORE/01_dossier**:
  - `DANCORE-FORENSIC-DOSSIER.md` (sanitized DD-version, ne attorney work-product version)
  - `DANCORE-DEFENSE-MEMO-v1.0.md` (tento dokument, sanitized)
  - Executive summary 1-page brief

- [ ] **04-LEGAL/DANCORE/02_court_file**:
  - Kompletní spis 30 Co 228/2019-1538 — všechna rozhodnutí, podání, dokazování (T+7d action: CZ counsel pull from Krajský soud Praha)
  - Rozsudek soudu prvního stupně (datum TBD, pravděpodobně 2019/2020)
  - První rozsudek odvolací (datum TBD)
  - **Rozsudek 2024-06-25** (KS Praha druhé zamítnutí)
  - **Odvolání DANCORE 2024-11-18** (forma TBD)
  - Veškerá pleadings DANCORE (žaloba, repliky, doplňky)
  - Veškerá pleadings RD Rýmařov Invest III. alpha s.r.o. (vyjádření, dupliky)
  - Znalecké posudky (pokud byly)

- [ ] **04-LEGAL/DANCORE/03_chain_of_title**:
  - Plný KN historický výpis pro LV 927, LV 1326 (T+7d action: placený ČÚZK pull)
  - Akviziční SPA Progresus 2021 (RD Rýmařov Invest III. alpha kupuje od Lébra/Nový Zeleneč a.s.)
  - Akviziční SPA 2017–2020 (Lébr kupuje od Nuka Estates / dalších)
  - Likvidační dokumentace Nuka Estates (Pavlína Zdařilová, 2017-12-12 jmenování + 2023-04-19 přechod do likvidátorské role)
  - Discharge letter MARSEA MIA s.r.o. (pokud existuje; pokud ne, action item)

- [ ] **04-LEGAL/DANCORE/04_us_parallel**:
  - PACER docket pull pro 2:18-cv-01136 (T+7d action: US counsel)
  - Nevada SoS pull pro E0353972015-2 (T+7d action: US counsel)
  - FinCEN BOI compliance status memo (T+7d action: US counsel)
  - NV UCC search results

- [ ] **04-LEGAL/DANCORE/05_correspondence**:
  - Korespondence DANCORE counsel ↔ RD Rýmařov / Progresus counsel (kompletní, chronologicky)
  - Návrhy narovnání (settlement proposals) — pokud existují
  - Pre-litigation demand letters

- [ ] **04-LEGAL/DANCORE/06_legal_opinions**:
  - **Odsouhlaseno s CZ counsel**: poskytnout sanitized opinion na exposure range a defense theses (NIKOLI plný attorney work-product, pouze conclusion-level)
  - Aegis Law původní pre-acquisition opinion (2021), pokud existuje
  - Adversarial review opinion (KŠB / JŠK / White & Case)

- [ ] **04-LEGAL/DANCORE/07_insurance_terms**:
  - W&I carve-out language draft
  - Title insurance term sheet (DANCORE-specific)
  - Escrow agreement draft

### VII.3 Disclosure schedule item references

V SPA Disclosure Schedule (Annex k SPA), DANCORE bude figurovat pod:

| Sekce SPA | Item | Reference v dataroomu |
|---|---|---|
| **Schedule 5.1.x (Litigation)** | DANCORE LLC v. RD Rýmařov Invest III. alpha s.r.o., sp. zn. 30 Co 228/2019-1538, KS Praha | 04-LEGAL/DANCORE/02_court_file |
| **Schedule 5.2.x (Title to Real Property)** | LV 927, LV 1326 k.ú. Mstětice — title chain ze tří fází (Quinlan→Nuka→Lébr→Progresus) | 04-LEGAL/DANCORE/03_chain_of_title |
| **Schedule 5.3.x (Encumbrances)** | Žádné aktivní zástavy MARSEA MIA k DANCORE období; pending DANCORE litigation as disclosed | 04-LEGAL/DANCORE/03_chain_of_title |
| **Schedule 5.4.x (Reasonable Knowledge Qualifier)** | Veškerá prohlášení vztahující se k řetězci titulu jsou poskytnuta dle „reasonable knowledge of seller after due inquiry" | — |

### VII.4 Reasonable knowledge qualifier framing

Klíčové prohlášení v SPA k vyjednávání:

> *„Seller represents that, to its reasonable knowledge after due inquiry, the title chain to the Property is free from defects other than those specifically disclosed in Schedule 5.2 (DANCORE Litigation). Seller has provided to Buyer all material documents in its possession or control relating to the DANCORE Litigation and the chain of title."*

**Negotiation points**:
- **„Reasonable knowledge after due inquiry"** — vyšší standard než „best knowledge"; signalizuje serious DD ze strany seller
- **„Specifically disclosed"** — DANCORE musí být v disclosure schedule explicitně pojmenován
- **„All material documents"** — seller commits to full disclosure of court file

**Proč Progresus by neměl odolávat tomuto language**: vyšší standard znalosti = silnější pozice ve W&I claims (pokud něco materiálního chybí v disclosure, je to claim-trigger pro buyer). Ale pokud Progresus **podá full disclosure**, tento standard ho ochrání proti pozdějším claims o věcech, které neznal a neměl znát.

---

## VIII. Counsel Ask & Timeline

### VIII.1 Souhrnný harmonogram

| Termín | Vlastník | Deliverable |
|---|---|---|
| **T+0 (2026-04-28)** | Tomáš Korčák | Tento defense memo v1.0 odeslán CZ counsel + US counsel s engagement letter |
| **T+2d** | CZ counsel | Engagement letter podepsán; konflikt-clearance check (NIKOLI Aegis); fee estimate |
| **T+2d** | US counsel | Engagement letter podepsán; conflict check; fee estimate |
| **T+5d** | CZ counsel | Stažení kompletního spisu 30 Co 228/2019-1538 z KS Praha (vyžaduje plnou moc + soudní poplatek) |
| **T+5d** | CZ counsel | Stažení LV 927, LV 1326 historický výpis (placený ČÚZK účet) |
| **T+7d** | US counsel | Nevada SoS E0353972015-2 pull + PACER 2:18-cv-01136 docket pull + FinCEN BOI status check + NV UCC search → memo |
| **T+10d** | CZ counsel | **Formální right-to-rely opinion** na: (a) exposure range, (b) defense theses ranking, (c) settlement floor, (d) procedural strategy pro NS / ÚS |
| **T+12d** | Joint | First strategy call: CZ + US counsel + Progresus management + Tomáš Korčák |
| **T+14d** | Joint | **Combined memo** + W&I carve-out structure draft → broker engagement (Marsh / Aon) |
| **T+21d** | Insurance broker | Indikativní quote pro W&I + Title Insurance s DANCORE carve-out |
| **T+30d** | All | Settlement strategy decision (pursue or hold); settlement counsel engagement (může být separate firm) |
| **T+45d** | Progresus + counsel | Pre-disclosure briefing pro PPF (proactive disclosure před formálním DD) |

### VIII.2 Counsel selection criteria

#### CZ counsel (FORMAL OPINION + LITIGATION DEFENSE)

**Doporučená lavička** (rank order):

1. **Kocián Šolc Balaštík (KŠB)** — Dagmar Dubecká partner; longest CZ M&A track record, real estate practice, opakující se PPF advisor
2. **JŠK (Jindřich Šebesta Kupka)** — silná CZ litigation practice, real estate disputes, regulatory work
3. **White & Case Praha** — international firm, strong M&A + litigation; výhoda pro cross-border angle s US case
4. **Allen & Overy / Shearman (A&O Shearman)** — high-end international; vyšší náklady ale silná litigation kapacita
5. **NIKOLI**: **Aegis Law** (transakční poradce Progresus pro plánovací smlouvu Nový Zeleneč; Vojtěch Faltus partner; **konflikt zájmů pro adversarial review** — viz § VIII.3 níže)

**Kritéria výběru**:
- ✅ NS / ÚS appellate practice
- ✅ Real estate title litigation experience
- ✅ §984 ObčZ judicial precedent expertise
- ✅ Adversarial-grade independence from Aegis Law
- ✅ Engagement transparency — formal right-to-rely opinion structure (PPF + insurer mohou na opinion spoléhat)

#### US counsel (NV BAR ADMITTED)

**Doporučená lavička** (rank order):

1. **Holland & Hart LLP** — Las Vegas office, federal court practice, M&A support for international clients
2. **Snell & Wilmer** — Las Vegas + Reno, federal court, corporate, bankruptcy
3. **Lewis Roca Rothgerber Christie LLP** — Las Vegas, NV state + federal litigation
4. **Brownstein Hyatt Farber Schreck** — Las Vegas, federal practice, government investigations expertise
5. **Local Las Vegas boutique firm** — pokud rozpočet vyžaduje

**Kritéria výběru**:
- ✅ NV bar admitted (admitted to D. Nev. federal bar)
- ✅ Federal civil litigation experience
- ✅ Cross-border discovery support
- ✅ FinCEN BOI compliance expertise
- ✅ Subpoena practice familiarity

### VIII.3 Aegis Law conflict explanation

**Důvod, proč NIKOLI Aegis Law pro tento defense memo**:

1. **Aegis Law (Vojtěch Faltus partner)** je transakčním poradcem Progresus pro **plánovací smlouvu Nový Zeleneč** a regulatorní záležitosti (potvrzeno legalweb.cz, viz `04-legal/DANCORE-FORENSIC-DOSSIER.md` § 3.3)
2. **Adversarial review** vyžaduje **forenzně nezávislého counsel** bez prior engagement v transakci nebo asset
3. **Aegis Law mohla být involved v pre-acquisition due diligence 2021** — pokud ano, jakákoli oslabující obrana vůči §984 by se mohla opírat o jejich vlastní opinion → **circular argument**
4. **PPF will require independent opinion for W&I underwriting** — pojišťovny obvykle nepřijímají opinions od poradců, kteří mají transactional engagement s poskytovatelem reps

**Pokud Aegis Law přesto figuruje v dataroomu**: jejich existing opinions (např. plánovací smlouva memo) jsou disclosure-relevant, ale **nový opinion na DANCORE musí pocházet od nezávislého counsel** (KŠB / JŠK / White & Case).

---

## IX. Information Gaps (for counsel to close)

Strukturováno dle priority pro counsel pull:

### G-1 (P0): Forma podání 2024-11-18 odvolání

**Otázka**: Jakou formu má procesní podání DANCORE z 2024-11-18?
- Hypotézy: (a) dovolání k NS ČR, (b) opětovné odvolání u KS Praha, (c) ústavní stížnost k ÚS, (d) souběžně dovolání + ústavní stížnost
- **Důvod kritičnosti**: Forma podání determinuje procesní strategii, časový horizont a relevantní právní standardy
- **Owner**: CZ counsel
- **Deliverable**: Pull plné kopie podání 2024-11-18 z KS Praha + příslušný NS / ÚS rejstřík

### G-2 (P0): Dispozice s parcelami v období 2010–2017 (Nuka Estates likvidační éra)

**Otázka**: Jak konkrétně přešly parcely od Quinlan/Golub přes Nuka Estates s.r.o. (v likvidaci) na další držitele? Co konkrétně Nuka Estates likvidovala v okně 2010–2017?
- **Důvod kritičnosti**: Pokud DANCORE Teorie A (neúčinný převod) má fakticky podloženou bázi, leží zde
- **Owner**: CZ counsel + Progresus interní
- **Deliverable**: Plný Sbírka listin pro Nuka Estates (IČO 27890104) — všechna podání od 2007; SPA / dispoziční dokumenty parcel 2010–2017

### G-3 (P0): Přesný rozsah žalobního petitu DANCORE

**Otázka**: Jaké konkrétní parcely DANCORE žaluje? Plná hodnota petitu v CZK? Forma žádaného plnění (určení vlastnictví / náhrada škody / restituce)?
- **Důvod kritičnosti**: 209,6 mil. CZK je interní DD odhad — vyžaduje ověření; petit může být širší (rozvojová hodnota) nebo užší (jen restituce)
- **Owner**: CZ counsel
- **Deliverable**: Z plné kopie žaloby DANCORE — petit verbatim

### G-4 (P0): Identifikace skutečného vlastníka DANCORE LLC

**Otázka**: Kdo je beneficial owner DANCORE LLC E0353972015-2? Kdo financuje 6letý spor?
- Hypotézy ranked: (1) CZ diaspora osoba/rodina používající Nevada LLC; (2) Bývalý věřitel Nuka Estates (Quinlan/Golub era); (3) CZ claim-farming operátor; (4) Investor Quinlan Private orbit; (5) Skutečný preexisting holder titulu
- **Důvod kritičnosti**: Identifikace UBO determinuje motivaci, prostředky, settlement willingness
- **Owner**: US counsel (Nevada SoS + PACER + FinCEN) + CZ counsel (CZ counsel ve spisu DANCORE musí mít plnou moc od managing member → jméno + podpis)
- **Deliverable**: Kombinovaný memo s ranked hypotézami + supporting evidence

### G-5 (P1): PACER 2:18-cv-01136 status a obsah

**Otázka**: Co bylo předmětem federálního sporu Dancore v. Zika? Konečná dispozice? Je Zika osobou české diaspory? Settlement amount?
- **Důvod kritičnosti**: Vodítko k beneficial owner; pattern of litigation analysis
- **Owner**: US counsel
- **Deliverable**: Plný PACER docket pull + analytický memo

### G-6 (P1): Nuka Estates discharge / MARSEA MIA discharge

**Otázka**: Jsou všechny zástavní nároky MARSEA MIA s.r.o. (IČO 03454029) k Nuka Estates / parcelám vyplaceny? Existuje formální discharge?
- **Důvod kritičnosti**: Pokud zástavy stále aktivní, bonitní dispute s další zúčastněnou stranou
- **Owner**: CZ counsel + Progresus interní
- **Deliverable**: Discharge letter from MARSEA MIA + KN výpis bez encumbrances

### G-7 (P1): Pre-acquisition Aegis Law (nebo jiná) opinion z 2021

**Otázka**: Existuje pre-acquisition legal opinion z 2021 týkající se Quinlan/Nuka chain a sporu DANCORE?
- **Důvod kritičnosti**: Centrální pro §984 dobrá víra defense — pokud opinion existuje a doporučil pokračovat s informovaným úsudkem, **silně podporuje Tezi A**. Pokud chybí nebo nezmiňuje DANCORE, **oslabuje Tezi A**.
- **Owner**: Progresus interní + Aegis Law (pokud byl engaged)
- **Deliverable**: Plná kopie opinion (pod attorney-client privilege; mohou být shared s defense counsel pod common interest doctrine)

### G-8 (P2): Reziduální vztah Lébr / Ravantino Group

**Otázka**: Pokračuje Ravantino Group (Josef Lébr 50%) v jakémkoli vztahu k projektu Nový Zeleneč? Web stále inzeruje (2026-04-21).
- **Důvod kritičnosti**: Sekundární k DANCORE primárně, ale relevantní pro PPF disclosure obecně
- **Owner**: Progresus interní + CZ counsel
- **Deliverable**: Závěrečný formální dopis od Lébra potvrzující neexistenci reziduálních nároků

### G-9 (P2): Architecturální Chinese-wall mezi Konreo (Zrůst) a Progresus akvizicemi

**Otázka**: Existuje formální Chinese-wall politika mezi insolvenční praxí Zrůsta v Konreo a investiční činností Progresus?
- **Důvod kritičnosti**: Pokud DANCORE argumentuje, že Zrůst získal informace o titulu skrze Konreo praxi a využil je v akvizici, je to argument o **bad faith acquisition**
- **Owner**: Progresus interní + CZ counsel
- **Deliverable**: Formální Chinese-wall policy + log případů Konreo s certifikátem nepřekrývání s Progresus akviziční portfolio

### G-10 (P2): Financování akvizice Progresus 2021 — source of funds

**Otázka**: Odkud pocházely prostředky pro akvizici Nový Zeleneč a.s. v 2021? Bondové výnosy? SIKO/Valový financování? Jiné?
- **Důvod kritičnosti**: Pokud financování bylo z bondových výnosů, retailoví dluhopisoví věřitelé mají nepřímou expozici na DANCORE riziko
- **Owner**: Progresus CFO + CZ counsel
- **Deliverable**: Source-of-funds memo s tracking bond proceeds → akvizice

---

## X. Talking Points — Pokud PPF zvedne RF-26

### X.1 Top-level position

> *„DANCORE je 6letý seriálový spor, dvakrát zamítnutý ve prospěch Progresus, aktuálně v odvolací fázi. Hodnotíme expozici jako materiální, ale ohraničenou — vážená očekávaná hodnota CZK 102,5 mil., doporučená rezerva CZK 250–400 mil. v escrow, plus title insurance s konkrétním vyloučením. Plný spis je v dataroomu, defense memo je k dispozici. Mitigace už běží."*

### X.2 Specifické talking points (3–4 vety per point)

#### Talking Point 1 — Status quo

> *„Žaloba DANCORE byla zamítnuta soudem prvního stupně, pak znovu zamítnuta Krajským soudem v Praze 2024-06-25. Odvolání podáno 2024-11-18 je procesní — věc je živá, ale s velmi silnou pre-existing position pro Progresus. Forma podání (dovolání k NS / ústavní stížnost) je předmětem aktuálního stažení od CZ counsel a bude PPF zveřejněna v dataroomu sekce 04-LEGAL/DANCORE/02_court_file. Naše interní vážená EV je CZK 102,5 mil."*

#### Talking Point 2 — Ohraničená expozice

> *„Triangulujeme expozici přes tři scénáře: základní 70 % (CZK 0 — odvolání zamítnuto), nepříznivý 25 % (CZK 100–400 mil. — settlement nebo částečné rozhodnutí), nejhorší 5 % (CZK 600 mil. – 1,0 mld. — částečná restituce titulu). Vážená EV je CZK 102,5 mil. Doporučujeme úschovu CZK 350 mil. (95% CI nepříznivého scénáře) plus title insurance pro nejhorší doběh. Tato struktura limituje PPF expozici na ~CZK 50 mil. doběh (tail) za běžné premium."*

#### Talking Point 3 — Mitigace už běží

> *„Engagement nezávislého CZ counsel (KŠB / JŠK / White & Case, NIKOLI Aegis) běží od T+0; deliverable T+10d je formální right-to-rely opinion na exposure range a defense theses, který může PPF a underwriter použít jako third-party opinion pro W&I + title insurance underwriting. Souběžně US counsel (Nevada bar) provádí Nevada SoS + PACER + FinCEN check pro identifikaci beneficial owner DANCORE. Title insurance + W&I broker engagement běží od T+14d."*

#### Talking Point 4 — Architektura ochrany

> *„Doporučujeme tříúrovňovou ochranu: (1) **Escrow CZK 350 mil.** držený 24 měsíců s tranše-based release při procesních milestones — first-loss tier; (2) **Title insurance** specificky pro DANCORE s limit CZK 1 mld., navazuje pod escrow — second-loss tier; (3) **Standard W&I** pro všechna ostatní prohlášení s konkrétním vyloučením DANCORE — base coverage. Combined cost mitigation strategy je ~CZK 85–90 mil., což odstraňuje CZK 250–400 mil. value-at-risk z transakce. ROI je 3–5x."*

#### Talking Point 5 — Pre-disclosure thesis

> *„Disclosure DANCORE je proaktivní, nikoli vynucená. Spor je publicly disclosed v dluhopisovém prospektu Progresus 2024-12-30, takže žádná NDA není ohrožena. Plný spis, defense memo, řetězec titulu, US parallel docket — vše je k dispozici v dataroomu sekce 04-LEGAL/DANCORE. Pro vás (PPF) to znamená: viděli jste vše, co bychom my viděli; settlement může být strukturován bez surprise findings později. Pro nás (Progresus) to znamená čistou pozici v post-close litigation tail."*

#### Talking Point 6 — Settlement option (pokud PPF preferuje)

> *„Pokud PPF preferuje pre-close odstranění uncertainty, jsme otevřeni structured settlement negotiation s DANCORE v rozsahu CZK 50–150 mil. (target CZK 100 mil.). Settlement by byl confidential s NDA, payment by mohl pocházet částečně z escrow tranše. Settlement by také odstranil potřebu DANCORE-specific title insurance, snížil W&I premium, a dovolil clean closing without contingent escrow. Decision tree je v defense memo § V Teze C."*

#### Talking Point 7 — Reasonable knowledge qualifier

> *„V SPA Disclosure Schedule budou všechna prohlášení vztahující se k řetězci titulu poskytnuta dle ‚reasonable knowledge of seller after due inquiry'. Plně disclosujeme DANCORE, plně disclosujeme Quinlan/Nuka chain, plně disclosujeme MARSEA MIA historic encumbrance. Po post-close discovery PPF nemůže reklamovat věc, která byla disclosed; ale pokud něco materiální chybí v naší disclosure, je to W&I claim trigger pro PPF. Tento standard nás disciplinuje k full disclosure."*

---

## Závěrečná poznámka

Tento defense memo je **DRAFT v1.0 pro účely vyžádání právního stanoviska**. Není formálním právním doporučením — všechny právní závěry jsou pracovní hypotézy odvozené z OSINT evidence a DD analytical work. **Formální right-to-rely opinion bude poskytnut nezávislým CZ counsel** (T+10d) a **independent US counsel** (T+7d) na podkladě engagement letters a fee arrangements odeslaných paralelně s tímto memorandem.

Před jakýmkoli závazným disclosure k PPF, settlement negotiation nebo regulatory filing musí být tento memo **revidován a co-signed** příslušnými counsel.

**Příští revize**: v1.1 po doručení counsel opinions (cílové datum 2026-05-12 = T+14d).

---

**KONEC DEFENSE MEMO v1.0**

*Připravil: Tomáš Korčák · Discovery Lead & Chief Solution Architect · Able Group*
*Klasifikace: ATTORNEY-CLIENT PRIVILEGE / WORK PRODUCT — DRAFT*
*Distribuce: Limited to: CZ counsel (KŠB / JŠK / White & Case) + US counsel (NV bar) + Progresus management (Zrůst, Dvořák, Pelikán) + Able internal (Faraga, Duchoň)*

<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

Na tento soubor odkazují:

- [02-entity/CUZK-PAID-PULL-REQUEST.md](../02-entity/CUZK-PAID-PULL-REQUEST.md) — 04-legal/DANCORE-DEFENSE-MEMO-v1.0.md
- [04-legal/GOVERNANCE-CONTINUITY-MEMO-v1.0.md](./GOVERNANCE-CONTINUITY-MEMO-v1.0.md) — 04-legal/DANCORE-DEFENSE-MEMO-v1.0.md
- [06-reports/WI-INSURANCE-MEMO.md](../06-reports/WI-INSURANCE-MEMO.md) — 04-legal/DANCORE-DEFENSE-MEMO-v1.0.md

## 🏷️ Související soubory (podle shody tagů)

*Žádné silně související soubory (shoda tagů pod prahem 0,3).*

## 🌐 Pohled grafu

[Otevřít v portálu](../index.html) · [Mapa stránek](../sitemap.html) · [Hledat](../search.html) · Focus ID: `04-legal%2FDANCORE-DEFENSE-MEMO-v1.0.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
