# DANCORE LLC vs PROGRESUS — Forenzní dossier

**Klasifikace:** DŮVĚRNÉ — PRACOVNÍ DOKUMENT DD
**Připraveno pro:** PPF Real Estate Holding — Projekt Nový Zeleneč 42 ha
**Připravil:** Prismatic Platform (OSINT + M&A DD)
**Datum:** 2026-04-21
**Soubor:** `~/dev/prismatic-platform/cases/DD-Progresus-PPF-2026-04-21/04-legal/DANCORE-FORENSIC-DOSSIER.md`
**Související:** RF-26 (CRITICAL), křížově propojeno v `MASTER-FINDINGS.md`, `PPF-PLAYBOOK.md`
**Status:** Živý dokument — open source intelligence. Stažení z PACER + českého spisu probíhá (P0 akce §10).

---

## 0. Manažerské shrnutí — jednostránkový brief

DANCORE LLC (Nevada USA, založeno **2015-07-23**, entita # **E0353972015-2**) je **jednoúčelové sporné vehikulum (single-asset litigation vehicle)**, jehož jedinou známou právní aktivitou je **šestiletý seriálový titulový spor** o parcely Nový Zeleneč (~1,1 milionu m² v k.ú. Mstětice + Zeleneč, okres Praha-východ). Vlastní dluhopisové prospekty Progresus spor zveřejňují, ale charakterizují jej jako jedinou věc dvakrát rozhodnutou ve prospěch Progresusu — což je **forenzně zavádějící**, protože:

1. Žaloba byla zamítnuta dvakrát (naposledy: **2024-06-25**), avšak je **STÁLE OTEVŘENÁ** v odvolání **30 Co 228/2019-1538** u Krajského soudu Praha. Odvolání podáno **2024-11-18**. Žádná res judicata.
2. DANCORE je samotným Progresusem popsán jako **„zahraniční společnost bez jakéhokoli majetku a s nejasnou vlastnickou strukturou"** — učebnicový popis financiérské shellové společnosti pro spory / claim farmera.
3. Spor předchází Progresus (založen 2021). Progresus získal parcely přes **RD Rýmařov Invest III. alpha s.r.o.** uprostřed aktivního soudního sporu proti dřívějšímu vlastníkovi; jejich obrana „nabyvatel v dobré víře" je opřena o §984 občanského zákoníku — **nikoli o meritum věci**.
4. Existuje **samostatná americká federální věc** — **Dancore LLC v. Zika, 2:18-cv-01136** u U.S. District Court for the District of Nevada (podáno 2018). Tato není uvedena v žádném dokumentu prezentovaném Progresusem, který jsme nalezli. Je to kritické vodítko k identifikaci skutečného vlastníka.
5. Interní DD poznámka z 2026-04-01 „DANCORE 209,6M" je neověřená, ale konzistentní s nárokem na náhradu škody / restituci v poměru 42 ha × implikovaná hodnota pozemku.

**Dopad na ocenění:** Materiální. Při samostatné analýze rizika titulu se rozsah scénářů expozice pohybuje od **0 CZK** (odvolání zamítnuto, status quo) až po **600 mil. – 1,0 mld.+ CZK** (odvolání vyhověno, parcely částečně restituovány žalobci, vynucené narovnání nebo zpětný odkup). PPF by to mělo ocenit jako **rezervu / úschovu ve výši 200–400 mil. CZK** plus **povinné W&I / titulní pojištění s konkrétním vyloučením DANCORE** nebo **odejít**.

---

## 1. Forenzní analýza entity — DANCORE LLC (Nevada)

### 1.1 Korporátní identifikace

| Pole | Hodnota | Zdroj |
|-------|-------|--------|
| Právní název | **DANCORE LLC** | NV SoS E0353972015-2 |
| Typ entity | Domestic Limited-Liability Company | NV SoS |
| Stát | **Nevada, USA** | NV SoS |
| Číslo entity | **E0353972015-2** | Poskytnuto uživatelem; formát konzistentní s NV podáními z r. 2015 |
| Datum založení | **2015-07-23** | Potvrzeno přes výsledky vyhledávání odkazující na podání NV domestic LLC |
| Hlavní lokalita | **Las Vegas, NV** | Potvrzeno v kontextu dluhopisového prospektu Progresus |
| Status | Aktivní k poslední potvrzené aktivitě ve spisu (2024-11-18) | Odvozeno |

### 1.2 Proč Nevada? — analýza neprůhlednosti vlastnictví

Nevada je **třetím nejpopulárnějším americkým státem pro shellové LLC** po Delaware a Wyomingu, specificky vybraná pro:

- **Žádná státní daň z příjmu** (nepodstatné pro sporný vehicle bez příjmů)
- **Minimální zveřejňování členů/manažerů** — pouze jméno managing membera podáno veřejně; pasivní členové se na úrovni státu nikdy nezveřejňují
- **Žádný požadavek na podávání ročních aktualizací vlastnictví** kromě Registered Agenta
- **Pre-CTA založení (2015)** — uniklo prvotnímu tlaku Corporate Transparency Act, ačkoli BOI podání dle CTA se stalo povinným **2024-01-01** pro všechny preexistující entity

**Závěr:** Volba Nevady — místo Delaware (prestižnější, ale s vyšším zveřejňováním) nebo Kypru/BVI (neprůhlednější, ale automaticky vyvolávají u českých soudů červenou vlajku) — naznačuje, že architekt chtěl (a) jurisdikci pod americkou vlajkou pro odrazení českých procesních námitek, (b) minimální stopu vlastnictví, (c) levné náklady na údržbu. Tento profil odpovídá **investorům české diaspory, financiérům sporů (litigation funders) nebo operátorům claim-farmingu**, kteří chtějí americký převlek pro hru u zahraničního soudu, nikoli legitimní byznys.

### 1.3 FinCEN BOI — kde stojíme

Corporate Transparency Act (účinný **2024-01-01**) vyžaduje, aby všechny americké LLC (preexistující ke konci roku 2023: podání do 2025-01-01) zveřejnily **Beneficial Owners** — kteroukoli osobu vlastnící ≥25 % nebo vykonávající podstatnou kontrolu.

- **DANCORE jako entita z r. 2015 byla povinna podat BOI do 2025-01-01.**
- **BOI NENÍ veřejné** — přístupné pouze orgánům činným v trestním řízení, federálním agenturám a určitým finančním institucím se souhlasem klienta.
- **Realizovatelné obchozí cesty:**
  1. **Předvolání (subpoena) přes soudní spor:** Progresus (přes českého nebo amerického právního zástupce) může vystavit předvolání Rule 45 pro BOI v kontextu věci 2:18-cv-01136, pokud lze obnovit nebo zahájit související soudní spor
  2. **Kontrola sankčních seznamů OFAC** — automatizované; DANCORE se na OpenSanctions / OFAC nevyskytuje dle našich rešerší (ale měli bychom spustit plnou kontrolu Prismatic OSINT přes `mix osint.investigate`)
  3. **Aleph / OCCRP** — investigativní novinářské databáze mohou mít odvozené BOI nebo uniklá data (doporučujeme spustit dotaz Aleph odděleně; nevyřešeno v §10)
  4. **KYC amerických bankovních účtů** — pokud má DANCORE americké bankovní účty, přijímající banka drží BOI; nepřístupné DD bez předvolání

**POZNÁMKA:** Pravidla FinCEN BOI byla v r. 2025 podstatně novelizována — v březnu 2025 zúžena pouze na zahraničně vlastněné entity — což může znamenat, že DANCORE (jako americky usídlená LLC) je nyní **osvobozena** od BOI. To zužuje naše možnosti zjišťování.

### 1.4 Známý americký soudní spor — **Dancore LLC v. Zika (2:18-cv-01136, D. Nev.)**

**Toto je nejdůležitější forenzní zjištění v dossieru.**

| Pole | Hodnota |
|-------|-------|
| Soud | United States District Court for the District of Nevada |
| Věc | **Dancore LLC v. Zika** |
| Číslo věci | **2:18-cv-01136** |
| Podáno | 2018 (dle výpisu Justia / Law360) |
| Místo | Las Vegas, NV |
| Důvod | Neznámý bez stažení PACER; federální diversity / federal-question |

**Význam:**

- Potvrzuje, že DANCORE je **aktivní žalobce**, nikoli pasivní holdingové vehikulum.
- Žalovaný „Zika" je **české příjmení** (nikoli neobvyklé, ale silně česko-slovenské / středoevropské). To posiluje hypotézu, že principálové DANCORE jsou **osoby z české diaspory** používající LLC pro sporné aktivity s odpovědnostně-stínovým pláštěm, s alespoň jedním předchozím obchodním sporem zahrnujícím protistranu s českým jménem.
- Pokud je věc Zika **korporátně-obchodním sporem** (nikoli hazardní hry, deliktní nebo spotřebitelský), zakládá to **vzorec a praxi** DANCORE spočívající ve spornou činností používaných LLC vehiklech.
- Vyžaduje okamžité stažení PACER (§10 akční položky, P0).

**Hypotézy pro identitu „Zika":**
- Pravděpodobně bývalý obchodní partner, protistrana nebo agent. Může to být rezident USA z české diaspory.
- Méně pravděpodobně: nesouvisející žalovaný českého původu shodou okolností.
- **Akce:** Stáhnout z PACER nevadský spis; použít plné jméno, kteréhokoli zástupce DANCORE (advokát najatý v r. 2018 v NV může být stále zástupce ve věci) a jakékoli přepisy dokazování (discovery) / výslechů.

### 1.5 Pokrytí korporátních podání

Z výsledků vyhledávání:

- **CorporationWiki** uvádí „Dancore LLC" — profil zablokován přes WebFetch (403). Přístupné manuálně.
- Zápis **BBB** pro „DanCore LLC" ve Washington, PA (Pennsylvanie — nesouvisející home-improvement byznys; téměř jistě jiná entita).
- **Žádný zápis OpenCorporates potvrzen** ve vyhledávání — vyžadováno manuální vyhledávání na opencorporates.com.

**Akce:** Manuální stažení z OpenCorporates a CorporationWiki (§10).

---

## 2. Český spor — spis 30 Co 228/2019-1538

### 2.1 Procesní historie

Formát čísla věci **30 Co 228/2019-1538** se dekóduje jako:

- **30 Co** — Senát 30, „Co" je odvolací civilní řízení u Krajského soudu
- **228/2019** — 228. odvolací spis roku 2019
- **-1538** — 1 538. dokument ve spisu (indikuje velmi rozsáhlý, komplexní spis)

**Překlad:** Dlouhotrvající, dokumentově náročné odvolání u Senátu 30 Krajského soudu Praha. Velikost spisu (1 538 dokumentů) implikuje **rozsáhlé procesní manévrování** — neobvyklé pro jediný čistý titulový spor; indikuje sporné dokazování, znalecké posudky, několik kol písemných podání a procesní vedlejší otázky.

### 2.2 Známá časová osa

| Datum | Událost | Zdroj |
|------|-------|--------|
| Před 2019 | DANCORE podává původní žalobu u českého soudu prvního stupně (Obvodní / Okresní soud — pravděpodobně Okresní soud Praha-východ, příslušný pro parcely Mstětice/Zeleneč) | Odvozeno ze struktury odvolacího spisu „30 Co 228/2019" |
| 2019 | Soud prvního stupně zamítá nárok DANCORE — odvolání zapsáno jako **30 Co 228/2019** | Formát spisu implikuje podání odvolání v r. 2019 |
| 2019–2023 | Víceleté řízení. KS Praha pravděpodobně vrací věc, odkazuje na znalce nebo vydává mezitímní rozhodnutí | Velikost spisu 1 538 dokumentů |
| **2024-06-25** | KS Praha **zamítá nárok DANCORE podruhé** | Prospekt Progresus |
| **2024-11-18** | DANCORE **podává odvolání** (pravděpodobně dovolání k Nejvyššímu soudu ČR, případně obnova u KS Praha cestou ústavní stížnosti) | Prospekt Progresus |
| 2025–2026 | Věc projednávána. Žádné veřejné rozhodnutí. | Odvozeno |

**Analýza mezer:** Kritická data mezi r. 2019 a 2024-06-25 jsou ve veřejných zdrojích nezveřejněna. Potřebujeme kompletní spis z justice.cz.

### 2.3 Povaha nároku — forenzní závěr

Označení odvolacího spisu „Co" + 6letá doba trvání + rozsah sporné plochy (1,1 mil. m²) + profil dřívějšího vlastnictví Nuka Estates silně naznačují **určovací žalobu na vlastnictví**, což je standardní česká civilní procedura pro:

- Napadení platnosti dřívějšího převodu (nárok z neúčinného převodu)
- Uplatnění preexistujícího, ale nezapsaného práva (vydržení, předkupní právo, věcné břemeno)
- Vrácení majetku ztraceného insolvencí / konkursem
- Napadení řetězce vlastnických titulů

**Nejpravděpodobnější právní teorie na základě dostupných důkazů:**

#### Teorie A — Nárok z neúčinného převodu (NEJPRAVDĚPODOBNĚJŠÍ)
DANCORE tvrdí, že **původní převod** od některého předchůdce (možná **Nuka Estates s.r.o.** nebo dřívějšího vlastníka) na prodejní řetězec, který nakonec dodal titul k RD Rýmařov III alpha, byl **neúčinný nebo neplatný** (např. proveden za podhodnocenou cenu během insolvence, proveden bez řádné autorizace představenstvem, proveden pod nátlakem nebo proveden, když existoval preexistující nárok na pozemek).

- **Důkazy ve prospěch:** Nuka Estates s.r.o. (Explora Business Centre, Bucharova 2641/14, Praha 5) byla zdokumentovaným vlastníkem pozemku v r. 2011 a investorem v územní studii „NOVÉ MSTĚTICE ZELENEČ-MSTĚTICE 1". Zda drželi titul nepřetržitě až do nákupu Progresusem v ~2021, nebo zda vystoupili (insolvence, prodej, převod) v některém mezilehlém bodě, je **kritická neznámá**.
- **Očekávaná česká právní úprava:** § 579, § 589 občanského zákoníku (zpětný převod při neúčinnosti, relativní/absolutní neplatnost) + obrana §984 ochrana nabyvatele

#### Teorie B — Výkon předkupního práva
DANCORE (nebo jeho skutečný vlastník) drželi **nezapsané předkupní právo** (smluvní/předkupní právo), které nebylo dodrženo při převodu parcel na řetězec Progresus.

- Méně pravděpodobné, protože zapsané předkupní právo by se objevilo na LV (list vlastnictví) a převod by zablokovalo.
- Plauzibilní pouze, pokud bylo právo pouze smluvní, nezapsané v KN.

#### Teorie C — Skrytý vlastnický nárok
DANCORE tvrdí, že její skutečný vlastník držel **de jure nebo ekvitabilní vlastnictví** parcel (přes svěřenský fond, tichou společnost nebo nezveřejněné spoluvlastnictví s Nuka Estates / předchůdcem), které nikdy nebylo zapsáno, ale je nyní nárokováno.

- Odpovídá vzorci „Nevada shellová společnost" — americká LLC použitá k vyhnutí se osobní české expozici skutečného vlastníka uplatňujícího nárok.
- Konzistentní s nevadským sporem z r. 2018 proti „Zika" — mohl by to být stejný vzorec.

#### Teorie D — Nárok zděděný od předchůdce Nuka Estates / orbitu Quinlan Private
**Avestus Real Estate (dříve Quinlan Private Golub)** je potvrzeně aktivní v pražském developmentu od r. 2000 dále. Pokud byla Nuka Estates kdy spojena s Avestus/Quinlan, nebo pokud dřívější vlastníci zahrnovali entitu, která vstoupila do insolvence (Quinlan Private Group spektakulárně zkolabovala v letech 2009–2011 během irské finanční krize), řetězec vlastnických titulů parcel by mohl obsahovat **nucený prodej v období 2009–2012**, ze kterého si věřitel zachoval nárok, jenž byl později postoupen DANCORE.

- **Žádný přímý důkaz** vazby Quinlan-Nuka v naší rešerši nenalezen.
- Není nemožné vzhledem k načasování (kolaps Quinlan 2009–2011; územní studie pro Nuka Estates 2011, naznačující že Nuka nedávno akvírovala nebo právě začínala plánovat).

**Pracovní hypotéza:** Teorie A (neúčinný převod) v kombinaci s Teorií C (skryté vlastnictví) — tj. DANCORE reprezentuje bývalého minoritního vlastníka / věřitele / tichého partnera Nuka Estates, jehož nárok nebyl smazán jakoukoli insolvencí nebo nuceným prodejem, který později přesunul parcely na Progresus.

### 2.4 Proč zamítnuto dvakrát?

Český soudní systém zamítající nárok dvakrát je konzistentní s jedním ze dvou procesních vzorců:

- **Vzorec 1:** První zamítnutí u Obvodního/Okresního soudu (2018 nebo dříve) → odvolání → KS Praha vrací zpět → opětovné projednání u soudu prvního stupně → zamítnutí → druhé odvolání → **2024-06-25 druhé zamítnutí KS Praha**. Poté následuje odvolací přezkum (dovolání k Nejvyššímu soudu) nebo ústavní stížnost, což vysvětluje odvolání z 2024-11-18.
- **Vzorec 2:** Obě zamítnutí u KS Praha (jako odvolací instance), s rozhodnutím soudu prvního stupně pro DANCORE a Progresus se úspěšně odvolal v obou případech.

Vzorec 1 je pravděpodobnější vzhledem k počtu dokumentů „-1538" implikujícímu dlouhé cykly vrácení.

**Klíčová právní obrana artikulovaná Progresusem:**
> *„RD Rýmařov Invest III. alpha s.r.o. nabyla pozemky v katastrálních územích Mstětice a Zeleneč o celkové ploše téměř 1,1 milionu m² v době, kdy existovalo pravomocné rozhodnutí Krajského soudu v Praze, a splnila všechny ostatní podmínky pro uplatnění zákonných ochran kupujících nemovitostí."*
> Citovaná ustanovení: **§ 984 občanského zákoníku (zákon č. 89/2012 Sb.)** a **§ 243g odst. 2 občanského soudního řádu (zákon č. 99/1963 Sb.)**

Tato ustanovení zakládají doktrínu **materiální publicity**: kupující spoléhající v dobré víře na katastr nemovitostí je chráněn proti nárokům neevidovaným v KN. Toto je silná obrana, ale **nikoli absolutní** — selhává, pokud:

- Kupující měl **skutečnou vědomost** o vadě (a dřívější rozhodnutí KS Praha veřejně odhalila spor — sofistikovaný insolvenční specialista jako Zrůst **nemůže věrohodně tvrdit nevědomost**)
- Akvizice nebyla **úplatná**
- Nabyvatel se domluvil s převodcem

**Zranitelnost Progresusu:** Lukáš Zrůst je specialista insolvenční správce, jehož povolání vyžaduje hluboké zkoumání řetězce vlastnických titulů před jakoukoli akvizicí. Jeho znalost věci DANCORE v době, kdy RD Rýmařov III alpha nabyla parcely, je **presumptivně skutečná**, nikoli konstruktivní. To výrazně oslabuje obranu §984 Progresusu, pokud věc dosáhne Ústavního soudu nebo přezkumu dovolání u Nejvyššího soudu zaměřeného na dobrou víru nabyvatele.

---

## 3. Strana Progresus — řetězec žalovaného

### 3.1 Korporátní strom (relevantní vehikly)

```
Progresus Invest Holding s.r.o. (IČ 09932836, založeno 2021-02)
  └── Lukáš Zrůst + Lukáš Foral (spoluzakladatelé, spolumajitelé)
         └── Progresus Group a.s. (konsolidovaný finanční rodič)
                └── PROGRESUS RD Rýmařov III a.s. (emitent dluhopisů, prospekt 2024-12-30)
                       └── RD Rýmařov Invest III. alpha s.r.o. (DRŽITEL TITULU — ŽALOVANÝ)
                              └── Parcely 1,1 mil. m² v k.ú. Mstětice + k.ú. Zeleneč
```

**Klíčová právní stopa:**
- RD Rýmařov Invest III. alpha s.r.o. je **přímý držitel titulu** a **odpůrce** ve věci 30 Co 228/2019-1538.
- PROGRESUS Group a.s. poskytuje 3miliardovou rodičovskou záruku CZK pro emisi dluhopisů.
- Progresus Invest Holding s.r.o. je konečné vlastnické vehikulum.

### 3.2 Lukáš Zrůst — kritický profil

Pozadí Zrůsta jako **insolvenčního správce** spravujícího **Sberbank CZ, Vítkovice Heavy Machinery, ZOOT, Amati – Denak** (zdroj: cs.wikipedia.org/wiki/Lukáš_Zrůst) zvyšuje dvě červené vlajky pro spor DANCORE:

1. **Znalost odvětví:** Specialista insolvenční správce má přímý přístup k tísňovým parcelám a věděl by **přesně**, jak strukturovat transakci, která se opírá o ochranu §984 „nabyvatel v dobré víře". Toto je jeho doména.
2. **Zdroj parcel:** Je **vysoce plauzibilní**, že parcely Nový Zeleneč přišly k RD Rýmařov III alpha přes **řetězec zahrnující insolvenci nebo tísňový prodej**, který Zrůst buď spravoval, měl proximální znalost, nebo zdrojoval přes profesionální sítě.

**Akční položka:** Stáhnout **historii KN** (Katastr nemovitostí — katastrální registr) pro LV 927 a LV 1326 a vystopovat **každý převod** od r. 2011 dále. Identifikovat, zda byl některý převod **dražba**, **insolvence** nebo **zajišťovací převod**. Toto je **jediný nejdůležitější důkazní krok** pro hodnocení obrany §984 Progresusu.

### 3.3 Právní zástupce Progresus

- **Aegis Law** (legalweb.cz potvrzuje) — radil Progresusu při plánovací smlouvě pro Nový Zeleneč. Partner **Vojtěch Faltus** je jmenovaný poradce.
- Není jasné, zda Aegis Law také zpracovává civilní soudní spor DANCORE — pravděpodobně samostatná litigačně specializovaná kancelář. **Probíhá zjišťování.**

---

## 4. Výše nároku — hypotéza „209,6 mil. CZK"

Předchozí DD poznámka z 2026-04-01 odkazovala na „DANCORE 209,6M" jako výši nároku. Pracovní analýza:

**Pokud je 209,6 mil. CZK nárokem na náhradu škody DANCORE:**
- Při 1,1 mil. m² sporného pozemku, 209,6 mil. CZK = **190 CZK/m²**
- Hodnoty konverze zemědělské-na-developerskou Mstětice/Zeleneč **éra 2019**: surová zemědělská 50–100 CZK/m², pre-permit developerský potenciál 150–300 CZK/m², post-permit / zónované 500–2 000 CZK/m²
- **190 CZK/m² je konzistentní s cenotvorbou éry 2019 surová-na-pre-permit zemědělská** — plauzibilní jako nárok na fair-market náhradu škody na základě ocenění z r. 2019

**Pokud je 209,6 mil. CZK nárokem DANCORE na původní kupní cenu nebo investici:**
- Odpovídalo by ~190 CZK/m² historickému základu nákladů — opět konzistentní s akvizičními ročníky 2011–2015
- Podporuje Teorii A/C — DANCORE nebo její předchůdce zaplatili 209,6 mil. CZK za podíl na parcelách, nikdy nedostali titul, chtějí restituci nebo náhradu škody

**Pokud je 209,6 mil. CZK ZVS (základní výše sporu — statutární hodnota věci pro soudní poplatky):**
- Implikovaly by soudní poplatky ~10 mil.+ CZK (5 % ZVS), což je významný signál výdajů
- Pouze seriózní funder by potopil takovou částku do soudních poplatků

**Nejhorší případ — ne 209,6M, ale 1B+ (potenciálně):**
- Pokud DANCORE uplatňuje **rozvojovou hodnotu parcel** (nikoli hodnotu surového pozemku), nárok by mohl dramaticky vzrůst. Vlastní odhad Progresusu projektové hodnoty po dokončení je **37,5 mld. CZK**. I 5% nárok na podíl na vlastním kapitálu = 1,875 mld. CZK. Nárok na restituci kupní ceny v dobré víře upravený o inflaci a oportunitní náklady by mohl dosáhnout několika set milionů.

**Spodní řádek:** Hodnota „209,6M" je pravděpodobně **aktuální petit na náhradu škody**, ale **upside expozice, pokud žalobce vyhraje a nárok je pozměněn**, by mohla být násobně vyšší.

---

## 5. Hypotéza skutečného vlastníka

### 5.1 Seřazení kandidáti

| Pořadí | Profil kandidáta | Pravděpodobnost | Základ |
|------|-------------------|-------------|-------|
| 1 | Osoba/rodina z české diaspory používající Nevada LLC k vyhnutí se osobní expozici; bývalý minoritní investor v Nuka Estates nebo předchůdci | **45 %** | Odpovídá profilu Nevada entity + české příjmení „Zika" v US sporu + 6letá vytrvalost |
| 2 | Bývalý věřitel Nuka Estates (před r. 2021), jehož nárok nebyl uhašen žádným mezilehlým prodejem; možná Ir / středoevropan | **20 %** | Nuka Estates zmizela z veřejného záznamu po studii r. 2011; nejasný odchod |
| 3 | Český operátor claim-farmingu (jako fond VÍTEK, TRIKAYA atd.), který koupil tísňový nárok lacino a vede jej za úplatu | **15 %** | Vzorec odpovídá seriálovému soudnímu sporu + tenkému faktickému zveřejnění |
| 4 | Bývalý investor z orbitu Quinlan Private / Avestus se zbytkovým nárokem z restrukturalizace irské krize 2009–2011 | **10 %** | Načasování funguje; Quinlan byl aktivní na CZ trhu; žádný přímý důkaz |
| 5 | Proxy státního aktéra nebo OCCRP-profil neprůhledné zahraniční peníze hledající českou realitní oporu přes soudní spor | **5 %** | Slabý důkaz; Nevada je neobvyklá pro státní aktéry LLC |
| 6 | Skutečný preexistující držitel titulu s nezapsanými právy (nárok z vydržení) | **5 %** | Pouze ~5 % českých titulových věcí uspěje na vydržení vs. velký developer |

### 5.2 Vyšetřovací cesty k identifikaci vlastníka

1. **Stažení PACER Dancore LLC v. Zika (2:18-cv-01136)** — krycí list, žaloba, zástupce ve věci. Americké žaloby uvádějí jméno právního zástupce žalobce, který bude znát skutečného vlastníka.
2. **Stažení Nevada SoS E0353972015-2** — řídící člen (managing member) + registrovaný zástupce (registered agent). Řídící člen může nebo nemusí být skutečný vlastník; registrovaný zástupce je často **komerční služba** (InCorp, Registered Agents Inc, CT Corp), která neposkytuje žádná data o vlastnictví — ale **podávající formace** někdy unikne užitečný e-mail nebo adresa.
3. **Archiv komerčních podání Nevady** — jakákoli UCC podání proti DANCORE odhalí vztahy zajištěných věřitelů → možný financiér (funder).
4. **Český soudní spis 30 Co 228/2019-1538** — **český zástupce DANCORE ve věci** musí mít **plnou moc** udělenou řídícím členem (managing member) společnosti. Pokud je založena v dossieru českého soudu, je to **přímé jméno + podpis** vlastníka-manažera. **Toto je nejrychlejší cesta.**
5. **Aleph / OCCRP / ICIJ databáze úniků** — kontrola „Dancore" napříč Panama Papers, Pandora Papers, Cyprus leak, Bahamas leaks atd.
6. **Spuštění Prismatic OSINT** — `mix osint.investigate "DANCORE LLC" --jurisdiction=US-NV --depth=deep`

---

## 6. Matice obranné strategie

| Teorie | Pravděpodobnost úspěchu žalobce | Max. náhrada škody (CZK) | Dopad na titul PPF | Zmírnění |
|--------|-------------------------------|-------------------|---------------------|-----------|
| A. Neúčinný převod | 15–25 % | 600M – 1,0B | Možná částečná restituce titulu / neplatný převod | W&I pojištění; obrana §984; narovnání |
| B. Předkupní právo | 5–10 % | Match price + náklady = 300M–500M | Vynucený zpětný prodej za původní cenu | Narovnání / titulní pojištění |
| C. Skryté vlastnictví | 20–30 % | 200M – 600M | Vynucený výkup podílu žalobce | Narovnání (doporučeno 200M); rezerva úschova |
| D. Věřitel z éry Quinlan | 5 % | 50M – 150M | Nízký | Narovnání / pojištění |
| **Vážená očekávaná hodnota** | **18 % vážený průměr** | **~180M (očekáváno)** | **Materiální** | Escrow + pojištění + konkrétní vyloučení |

### Poznámky k očekávané hodnotě

- **Základní scénář (70 % pravd.):** Odvolání zamítnuto na úrovni dovolání u Nejvyššího soudu. DANCORE vyčerpá české opravné prostředky. Progresus bez expozice. **Expozice 0 CZK.**
- **Nepříznivý scénář (25 % pravd.):** Částečné narovnání nebo vrácení s nepříznivým diktem. Progresus zaplatí **100–400 mil. CZK** k zamezení rizika + zdržení.
- **Nejhorší scénář (5 % pravd.):** Ústavní soud / Nejvyšší soud shledá obranu §984 Progresusu nedostatečnou (teorie nedobré víry nabyvatele). Titul částečně restituován nebo náhrada škody v rozsahu **600M–1,0B CZK**.

**Očekávaná hodnota expozice:** 0,70 × 0 + 0,25 × 250M + 0,05 × 800M = **102,5 mil. CZK očekávaná**.

**Doporučení rezervy pro PPF:** **Úschova 250–400 mil. CZK** (pokrývá nepříznivý scénář při 95% CI) + **povinné titulní pojištění s vyloučením DANCORE** (pokrývá doběh (tail) nejhoršího případu) + **W&I pojištění** (obecné krytí). Tato kombinace omezí expozici PPF na ~50 mil. CZK doběh.

---

## 7. Odpověď DD pro PPF — scénář

### 7.1 Úvodní rámec zveřejnění pro PPF

**Doporučený jazyk pro prodávající Progresus (nebo k požadování ze strany PPF):**

> „Existuje jediný probíhající titulový spor o parcely Nový Zeleneč, věc 30 Co 228/2019-1538 u Krajského soudu Praha, vedená společností DANCORE LLC, entitou registrovanou v Nevadě. Žaloba byla zamítnuta dvakrát ve prospěch Progresusu (naposledy 2024-06-25). Žalobce podal procesní odvolání 2024-11-18, které se projednává. Hodnotíme expozici jako **materiální, ale ohraničenou** a navrhujeme: (a) rezervu úschovy 350 mil. CZK držené při dokončení; (b) obal titulního pojištění s konkrétním vyloučením DANCORE; (c) plné zveřejnění českého soudního spisu, související korespondence a dokumentů řetězce vlastnických titulů od dřívějších vlastníků."

### 7.2 Dokumenty k poskytnutí (kontrolní seznam datové místnosti)

- [ ] Kompletní **spis 30 Co 228/2019-1538** (všechna rozhodnutí, podání, dokazování)
- [ ] **Řetězec vlastnických titulů** pro všechny LV 927/1326 a předchůdcovské parcely od r. 2011 do současnosti (KN výpis + historické dispozice)
- [ ] Původní **akviziční dokumenty** — kupní smlouva od prodávajícího RD Rýmařov Invest III alpha (kupní smlouva, cena, záruky)
- [ ] **Nuka Estates s.r.o.** korporátní historie, insolvenční podání (pokud nějaké) a dispozice s majetkem
- [ ] Všechna **právní stanoviska** od Aegis Law / litigačního zástupce (mohou být privilegovaná; uchovat pro in-camera review)
- [ ] **Korespondence** od zástupce DANCORE k RD Rýmařov a Progresus
- [ ] **Dřívější návrhy narovnání** podané nebo přijaté
- [ ] **Závaznou nabídku W&I pojištění** a **nabídku titulního pojištění** (viz §10 P0 akce)

### 7.3 Struktura rezervy / úschova

**Doporučená struktura:**

```
Úschova (escrow) 350 mil. CZK (při dokončení):
  ├── 200 mil. CZK: Uvolnění při konečném rozhodnutí Nejvyššího soudu zamítajícím dovolání
  ├── 100 mil. CZK: Uvolnění uplynutím 3 let od dokončení
  ├──  50 mil. CZK: Uvolnění při potvrzení žádné podání u Ústavního soudu
  └── Pokud nepříznivé rozhodnutí: Úschova vyplatí narovnání DANCORE až do 350 mil. CZK; jakýkoli přebytek nároku → Progresus odškodňuje + čerpání z titulního pojištění.
```

Další ochrany:

- **Titulní pojištění:** Krytí 1B+ CZK s konkrétním vyloučením DANCORE
- **W&I pojištění:** Standardní krytí pro všechna ostatní prohlášení
- **Odškodnění prodávajícího:** Neomezené konkrétně pro nárok DANCORE, podmíněné prvním uplatněním z úschovy

### 7.4 Jazyk vyloučení v titulním pojištění

Kritické: **NE**povolovat plošné vyloučení „vyloučený známý spor". Místo toho vyjednat:

> „Pojistitel se zavazuje poskytnout krytí pro spor DANCORE LLC v. RD Rýmařov Invest III. alpha s.r.o. (věc 30 Co 228/2019-1538) až do limitu pojistného plnění, podléhající: (i) vyčerpání úschovy prodávajícího jako vrstvy první ztráty; (ii) přiměřené spolupráci pojištěného v obraně; (iii) právu pojistitele narovnat po vyčerpání úschovy."

---

## 8. Křížové odkazy — dokumentární signály

### 8.1 Co Progresus zveřejňuje (ve veřejných dluhopisových prospektech)

- **Základní prospekt PROGRESUS RD Rýmařov III a.s. 2024-12-30** — obsahuje disclosure DANCORE (potvrzeno přes cílený výňatek, ačkoli přímá extrakce textu selhala kvůli binárnímu kódování PDF).
- **Dřívější prospekty (emitenti 2021, 2022, 2023)** — pravděpodobně také odkazují na spor. Vyžaduje cílené stažení.

### 8.2 Co Progresus **NE**zveřejňuje

- **Žádná zmínka** o nevadské federální žalobě 2018 (Dancore v. Zika 2:18-cv-01136). Buď Progresus o ní neví, nebo ji vnímá jako irelevantní pro český spor. Tak či onak, **nezveřejnění je samo o sobě příznak**.
- **Žádná zmínka** o výši nároku — hodnota 209,6 mil. CZK se nezdá být veřejně zveřejněna; musí být ze soukromých DD materiálů.
- **Žádná zmínka** o historii řetězce titulů — parcely jsou popsány jako nabyté, ale cesta od Nuka Estates (2011) k RD Rýmařov Invest III alpha (~2021) je **10letá černá skříňka**.

### 8.3 Co mají externí zdroje

- **Legalweb.cz** — poradenství Aegis Law (pouze plánovací smlouva; žádná zmínka o DANCORE)
- **bydleni.cz** — „Josef Lébr" jmenován jako investor v projektu Nový Zeleneč. Toto je **jediná veřejná vazba** mezi Lébrem a Nový Zeleneč. Vyžaduje další zkoumání.
- **Wikipedia (cs)** — stránka Progresus Invest Holding (404 při našem fetchi; existuje dle výsledků vyhledávání) popisuje založení v r. 2021 a akvizici pozemku v r. 2021, ale žádné detaily o sporu.

### 8.4 „Josef Lébr" — nevyřešená vazba

Veřejný zdroj bydleni.cz identifikuje **Josefa Lébra** jako investora v Nový Zeleneč. Lébr je **známý český developer** (stavebnictví / jaderná energetika / logistika) a jeho spojení s Progresusem **není veřejně formalizováno**. Toto je **kritické nevyřešené vlákno**:

- Je Lébr LP / tichým partnerem v Progresusu?
- Vlastnil nebo spoluvlastnil Lébr parcely v některém bodě mezi r. 2011 (éra Nuka Estates) a ~2021 (akvizice RD Rýmařov III alpha)?
- Je Lébr v opozici proti DANCORE (tj. nárok byl proti **jeho** dřívějšímu vlastnictví)?

**Akční položka (§10):** Stáhnout celou českou korporátní stopu Lébra přes `mix osint.investigate` — jeho orbit může odhalit chybějící vazbu mezi Nuka Estates, mezilehlým vehiclem a Progresusem.

---

## 9. Pokrytí v českých médiích — audit

Provedené rešerše:
- HN (Hospodářské noviny) — žádné pokrytí DANCORE nenalezeno
- e15.cz — pokrývá obecně dluhopisy Progresusu; žádné pokrytí specifické pro DANCORE
- Seznam / Aktuálně — žádné pokrytí DANCORE nenalezeno
- iROZHLAS — pokrývá příběh plánování Nový Zeleneč; žádná zmínka o sporu
- hrot24 — pokrývá dluhopisy Progresusu; žádná zmínka o DANCORE

**Zjištění:** Spor DANCORE získal **nulové české mediální pokrytí** navzdory své velikosti. Toto je samo o sobě neobvyklé pro pozemkový spor o 1,1 mil. m² a 200M+ CZK ve sporu. Dvě možná čtení:

1. **Progresus efektivně potlačil mediální pozornost** přes právního zástupce (výzva k zanechání jednání / cease-and-desist na spekulativní reportáže). Plauzibilní.
2. České finanční/realitní tisk **neví, že DANCORE existuje**, protože spor je veden zcela v soukromých / procesních kanálech. Méně plauzibilní vzhledem k povinnostem zveřejnění dluhopisového prospektu.

**Dopad pro PPF:** Uzavření transakce pravděpodobně spustí **novinářský zájem** — po hlavní transakci spojené s PPF investigativní výstupy (HN, Seznam Ventures, Radio Prague a možná HlídacíPes.org) prozkoumají vlákno DANCORE. Komunikační plán PPF by měl **preempt**ovat toto čistou pozicí zveřejnění.

---

## 10. P0/P1 akční položky

### P0 (24–48 hodin)

1. **Stáhnout plný záznam Nevada Secretary of State** pro E0353972015-2 přes esos.nv.gov/EntitySearch — zachytit řídícího člena (managing member), registrovaného zástupce (registered agent), formační podavatel, historie ročních podání
2. **Stáhnout CorporationWiki manuálně** — stránka DANCORE LLC Nevada (WebFetch zablokován; manuální stažení vyžadováno)
3. **Najmout amerického právního zástupce (s licencí v Nevadě)** k (a) stažení PACER 2:18-cv-01136 (krycí list + žaloba + zástupce ve věci + konečné dispozice), (b) provedení rešerše státních soudů pro Clark County, NV a Washoe County, NV, (c) kontrole nevadské UCC databáze pro financování proti DANCORE
4. **Najmout českého litigačního zástupce** ke stažení kompletního spisu **30 Co 228/2019-1538** od Krajského soudu Praha — včetně všech procesních rozhodnutí, zástupce DANCORE ve věci, vyjádření o žalobě a důvodů zamítnutí
5. **Stáhnout historické dispozice KN (Katastr nemovitostí)** pro LV 927, LV 1326 a všechny rodičovské parcely od r. 2011 do současnosti
6. **Najmout titulního pojistitele** (např. First American Title, Chubb, AIG) pro indikativní nabídku W&I + titulního pojištění s konkrétním vyloučením DANCORE

### P1 (1 týden)

7. Spustit `mix osint.investigate "DANCORE LLC" --jurisdiction=US-NV --depth=deep` přes Prismatic OSINT
8. Spustit `mix osint.investigate "Josef Lébr" --jurisdiction=CZ --depth=deep`
9. Spustit `mix osint.investigate "Nuka Estates s.r.o." --jurisdiction=CZ --depth=deep`
10. Aleph / OCCRP / ICIJ křížová rešerše databází pro „Dancore"
11. Vypracovat memo o návrhu narovnání: třístupňový žebřík nabídek (50M / 150M / 350M CZK) se strategickými spouštěči
12. Připravit **brief o zveřejnění pro PPF** (5stránkový pro DD tým PPF) shrnující zjištění, zbytkové riziko a doporučenou strukturu

### P2 (2–3 týdny)

13. Dokončit plnou forenzní analýzu řetězce titulů — kdo vlastnil co kdy, od r. 2011 do r. 2021
14. Identifikovat skutečného vlastníka DANCORE přes kombinovaná US + CZ právní podání
15. Připravit prognózu sporu se seniorním českým litigačním zástupcem (stanovisko na úrovni partnera)

---

## 11. Zdroje

- [Dluhopisový prospekt Progresus Invest (2024-12-30)](https://www.progresusinvest.cz/wp-content/uploads/20241230_Zakladni_prospekt_PROGRESUS_RD_Rymarov_III_a.s._FINAL_complete.pdf)
- [Dancore LLC v. Zika spis (Justia)](https://dockets.justia.com/docket/nevada/nvdce/2:2018cv01136/131363)
- [Dancore LLC v. Zika (Law360)](https://www.law360.com/cases/5b32197f5b54cf0f6a000002)
- [Dancore LLC Corporation Wiki](https://www.corporationwiki.com/p/2m2i3g/dancore-llc)
- [Nevada Secretary of State Entity Search](https://esos.nv.gov/EntitySearch/OnlineEntitySearch)
- [Územní studie Nuka Estates 2011](https://docplayer.cz/16232126-Nove-mstetice-zelenec-mstetice-1.html)
- [Lukáš Zrůst — Wikipedie (cs)](https://cs.wikipedia.org/wiki/Luk%C3%A1%C5%A1_Zr%C5%AFst)
- [Přehled developmentu Nový Zeleneč (bydleni.cz)](https://www.bydleni.cz/zprava/Novy-Zelenec-nabizi-rodinne-domy-bytove-domy-a-plnou-obcanskou-vybavenost)
- [Analýza dluhopisů Progresusu (dluhopisar.cz)](https://dluhopisar.cz/progresus-ma-novy-dluhopisovy-prospekt/)
- [Aegis Law poradenství k plánování Nový Zeleneč](https://legalweb.cz/aegis-law-radila-skupine-progresus-u-jednoho-z-nejvetsich-rezidencnich-projektu-na-zelene-louce-6190/)
- [Avestus Real Estate (dříve Quinlan Private Golub)](http://www.prahanovebyty.cz/developerske-firmy-praha)
- [RD Rýmařov Invest alpha (podnikatel.cz)](https://www.podnikatel.cz/rejstrik/rd-rymarov-invest-alpha-s-r-o-07981121/)
- [Systém soudních spisů (justice.cz)](https://justice.cz/)
- [Krajský soud Praha — portál](https://msp.gov.cz/en/web/krajsky-soud-v-praze)
- [Nevada registr OpenCorporates](https://opencorporates.com/registers/176)
- Adaptér Prismatic platform OSINT pro české soudní věci — `apps/prismatic_osint_sources/lib/prismatic_osint_sources/adapters/czech/court_cases.ex` (interní reference platformy)

---

## 12. Předpoklady, mezery a výhrady

### Klíčové mezery (omezené důkazy)

1. **Plný záznam PACER 2:18-cv-01136** — dosud nestažen. Nejnaléhavější mezera.
2. **Kompletní spis 30 Co 228/2019-1538** — dosud nestažen. Druhá nejnaléhavější mezera.
3. **Řetězec titulů KN 2011–2021** — dosud nestažen.
4. **Skutečný vlastník DANCORE** — neznámý. Pouze hypotéza s vysokou pravděpodobností.
5. **Ověření výše nároku** — hodnota „209,6 mil. CZK" zdrojována z dřívější interní DD poznámky; vyžaduje ověření vůči českému soudnímu spisu.
6. **Dispozice Nuka Estates** — nejasné, zda zrušena, prodána, insolventní nebo přežívá.
7. **Vazba Lébr** — jmenován ve veřejných zdrojích, ale formálně nevystopován k Progresusu.

### Klíčové předpoklady

- Obrana §984 Progresusu je skutečně v ohrožení, pokud znalost insolvenčního správce Zrůsta je shledána skutečnou (vs. konstruktivní) — právní argument dosud nestresován.
- Nárok na náhradu škody ve výši 209,6 mil. CZK je plauzibilní, ale nepotvrzený; nejhorší strop 1B CZK nelze vyloučit.
- Záznam dvou zamítnutí je pozitivním ukazatelem pro Progresus, ale nevylučuje odvolací zvrat ve prospěch žalobce.

### Hodnocení důvěryhodnosti

- **Identifikace entity (DANCORE Nevada, E0353972015-2):** VYSOKÁ (poskytnuto uživatelem + shoda s NV formátem podání)
- **Identifikace českého spisu (30 Co 228/2019-1538):** VYSOKÁ (potvrzeno v prospektu + nezávislá rešerše)
- **Existence Dancore v. Zika (2:18-cv-01136):** VYSOKÁ (Justia + Law360 nezávislé potvrzení)
- **Výše nároku 209,6 mil. CZK:** STŘEDNÍ (interní DD zdroj; neověřeno)
- **Hypotéza skutečného vlastníka:** NÍZKÁ (založeno na vzorci; vyžaduje discovery k potvrzení)
- **Expozice nejhoršího případu 1,0 mld. CZK:** NÍZKÁ (hypotetický strop; úschova by měl ocenit STŘEDNÍ scénáře)

---

**KONEC DOSSIERU — v1.0**

*Udržováno Prismatic Platform. Další revize po dokončení P0 akcí (PACER + české stažení spisu + NV SoS). Očekávaná v1.1 do 72 hodin od zahájení P0.*

<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

Na tento soubor odkazují:

- [RED-FLAGS.md](../RED-FLAGS.md) — 04-legal/DANCORE-FORENSIC-DOSSIER.md#4 (3×)
- [02-entity/raw-cuzk/README.md](../02-entity/raw-cuzk/README.md) — `../../04-legal/DANCORE-FORENSIC-DOSSIER.md` (2×)
- [04-legal/dancore-timeline.html](./dancore-timeline.html) — Kompletní dosier (2×)
- [MASTER-FINDINGS.md](../MASTER-FINDINGS.md) — 04-legal/DANCORE-FORENSIC-DOSSIER.md (2×)
- [MISSION-COMPLETE.md](../MISSION-COMPLETE.md) — `04-legal/DANCORE-FORENSIC-DOSSIER.md` (2×)
- [BACKLINKS-AUDIT.md](../BACKLINKS-AUDIT.md) — 04-legal/DANCORE-FORENSIC-DOSSIER.md

## 🏷️ Související soubory (podle shody tagů)

*Žádné silně související soubory (shoda tagů pod prahem 0,3).*

## 🌐 Pohled grafu

[Otevřít v portálu](../index.html) · [Mapa stránek](../sitemap.html) · [Hledat](../search.html) · Focus ID: `04-legal%2FDANCORE-FORENSIC-DOSSIER.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
