# RF-25 — Memo zveřejnění UBO (Restrikce přístupu k ESM 2025-12-17)

**Připraveno**: 2026-04-21
**Průchod**: 7 (Vyřešení)
**Status**: **POTVRZENO — materiální změna českého režimu zveřejnění UBO; obchozí cesta dostupná pro DD PPF**
**Závažnost**: CRITICAL → **Revidováno: MEDIUM (standardní legální obchozí cesta; načasování přidává 2-4 týdny k DD)**

---

## 1. Manažerské shrnutí

Česká Evidence skutečných majitelů (ESM / Registr skutečných majitelů) se stala **neveřejnou 2025-12-17** na základě opatření Ministerstva spravedlnosti reagujícího na rozsudek SDEU 2022 (C-37/20, C-601/20). Veřejný volný přístup je pryč. PPF si zachovává tři životaschopné cesty pro ověření UBO řetězce Progresus:

1. **Přístup povinných osob AML** přes PPF banku / interní (in-house) právní firmu PPF (banky si zachovávají přístup pro AML)
2. **Žádost s oprávněným zájmem** ke krajskému soudu — ~3-6 týdnů
3. **Přímé prohlášení** (prohlášení skutečného majitele) od každé entity skupiny Progresus v datové místnosti, s notářským ověřením

**Dopad na časovou osu DD**: +2-4 týdny, pokud jsou použity cesty 2 nebo 3. Nulový dopad, pokud je použita cesta 1 (PPF banka nebo externí AML-povinný právní zástupce).

---

## 2. Co se změnilo 2025-12-17

### 2.1 Právní základ
- **Rozsudek SDEU 2022-11-22 (C-37/20, C-601/20 — WM a Sovim SA)** zrušil část směrnice EU AML 2018/843 vyžadující neomezený veřejný přístup k registrům UBO jako nepřiměřenou podle čl. 7 a 8 Listiny (soukromí + ochrana osobních údajů)
- **Český Nejvyšší správní soud** a **Nejvyšší soud** následně rozhodly, že režim free-public-access české ESM byl nepřiměřený
- **Ministerstvo spravedlnosti ČR** administrativně omezilo veřejný přístup k ESM od **2025-12-17**
- Formální legislativní novela zákona č. 37/2021 Sb. o evidenci skutečných majitelů projednávána v Parlamentu (návrh inkorporující 6. směrnici AML)

### 2.2 Rozsah omezení
**Před 2025-12-17**: Kterákoli osoba mohla dotazovat ESM přes https://esm.justice.cz/ zdarma a bez autentizace. Data zahrnovala jméno UBO, datum narození (rok), občanství, zemi pobytu, řetězec vlastnictví (% + typ kontroly) a přímou/nepřímou identifikaci.

**Po 2025-12-17**: Veřejné webové rozhraní **vyřazeno**. Přístup k datům omezen na vyjmenované kategorie. Veřejné webové dotazy vrátí „neoprávněno".

### 2.3 Kdo si zachovává přístup
| Kategorie | Přístup | Použitelné pro PPF? |
|----------|--------|-------------------|
| Státní orgány | Plný | Ne přímo — vyžadovala by státní žádost o data |
| Povinné osoby AML (banky, advokáti, notáři, auditoři, daňoví poradci) | Plný | **ANO přes PPF Banku** nebo **externího právního zástupce PPF** |
| Zadavatelé veřejných zakázek | Plný | Neaplikovatelné (soukromé M&A) |
| Osoby s oprávněným zájmem | Na žádost | **ANO — M&A DD je výslovně uveden jako oprávněný zájem** |
| Široká veřejnost | Žádný | Ne |

---

## 3. Možnosti PPF pro ověření UBO Progresus

### 3.1 Cesta 1 — Přístup AML PPF banky (NEJRYCHLEJŠÍ)
**Mechanismus**: PPF banka a.s. je „povinná osoba" dle zákona č. 253/2008 Sb. o AML. Zachovává si elektronický přístup k ESM pro AML zákaznické due diligence (KYC/CDD).

**Provedení**:
- PPF Real Estate Holding pověří compliance PPF banky ke spuštění AML kontroly na:
  - Nový Zeleneč a.s. (IČO 27825981)
  - Ravantino a.s. / Ravantino Invest s.r.o.
  - Progresus Invest Holding a.s. (nebo relevantní holdingové entity)
  - DANCORE a.s. (dle 04-legal/DANCORE-FORENSIC-DOSSIER)
  - 17 známých skupinových entit Progresus z dřívějších průchodů
- PPF banka může poskytnout výpis UBO (bez zveřejnění) pro interní DD použití PPF pod důvěrností banka-klient

**Časová osa**: 5-10 obchodních dnů
**Náklady**: Interní (již v nákladovém středisku PPF)
**Riziko**: PPF banka může mít AML rezervační požadavky, pokud Progresus/Ravantino jsou aktuální bankovní zákazníci — drobná procesní koordinace

**Doporučení**: **PRIMÁRNÍ CESTA**

### 3.2 Cesta 2 — Žádost s oprávněným zájmem k Městskému soudu v Praze
**Mechanismus**: Dle zákona č. 37/2021 Sb. v platném znění může PPF podat žádost s oprávněným zájmem u soudu spravujícího ESM. Oprávněný zájem pro M&A DD je výslovně uznán.

**Provedení**:
- Žádost podaná elektronicky u Městského soudu v Praze (nebo příslušného Krajského soudu)
- Důkaz o M&A transakci: podepsaná NDA + LOI mezi PPF RE Holding a Progresus (nebo minimálně osvědčení advokáta, že skutečná transakce je v pokročilém vyjednávání)
- Soud vydá rozhodnutí o přístupu za 3-6 týdnů standardně; zrychleně možné
- PPF obdrží časově omezený přístup k dotazu na specifikované entity

**Časová osa**: 3-6 týdnů (nejhorší případ)
**Náklady**: Soudní poplatek (~500 CZK) + čas právního zástupce PPF (~40-80 tis. CZK)

**Doporučení**: **ZÁLOHA**, pokud je Cesta 1 politicky citlivá (kontakt PPF banky s konkurentem Progresus by mohl uniknout)

### 3.3 Cesta 3 — Přímé prohlášení UBO od každé skupinové entity
**Mechanismus**: Žádost PPF v datové místnosti na Progresus: **notářsky ověřené prohlášení UBO** (prohlášení skutečného majitele úředně ověřené) pro každou entitu ve struktuře skupiny.

**Provedení**:
- Právní tým PPF žádá od Progresus Group přes datovou místnost:
  - **L-60**: Pro každou ze 17+ skupinových entit Progresus, notářsky ověřené prohlášení UBO s:
    - Plným jménem UBO, datem narození, občanstvím, adresou trvalého pobytu
    - Plným přímým + nepřímým řetězcem vlastnictví s %
    - Povahou kontroly (vlastnictví, hlasování, zvláštní práva)
    - Prohlášením o žádných změnách od 2025-12-17
  - **L-61**: Srovnávací tabulka ukazující UBO řetězec pro Progresus Invest Holding, Ravantino Invest s.r.o., Nový Zeleneč a.s., DANCORE a.s. a jakékoli svěřence/svěřenské fondy
  - **L-62**: Pokud je jakýkoli UBO ne-český (rodina Kellner? jiný?), odpovídající zahraniční výpisy z registru UBO (Lucembursko, Nizozemsko, Kypr, Malta, BVI) s apostilou

**Časová osa**: 2-3 týdny po žádosti datové místnosti
**Náklady**: Minimální (nese prodávající dle etikety vyjednávání SPA)

**Doporučení**: **DOPLŇKOVÉ** k Cestě 1 — vždy vyžadovat přímé prohlášení k zafixování v prohlášení a záruky SPA

### 3.4 Cesta 4 — FAÚ (Finanční analytický úřad) zveřejnění
**Neaplikovatelné** — FAÚ zpracovává hlášení o podezřelých transakcích (STR), nikoli obecné DD dotazy. Zmíněno pouze pro úplnost.

---

## 4. Strategie symetrické transparentnosti

### 4.1 Co může Progresus legitimně odmítnout
Dle nového režimu může Progresus odmítnout poskytnutí UBO informací, které:
- Nebyly uloženy v ESM (např. nové holdingy vytvořené za posledních 30 dní)
- Týkají se příjemců pod prahem 25 % (ohlašovací práh)
- Týkají se svěřenců / správců svěřenských fondů jednajících za nezveřejněné zakladatele (úzká výjimka)

### 4.2 Co by PPF měl bez ohledu vyžadovat
- **Přímé prohlášení** od každé entity (Cesta 3) — toto je pro prodávajícího zavazující v rámci prohlášení a záruky SPA, nezávislé na přístupu do registru
- **Notářské ověření** prohlášení (nikoli pouze podpis úředníka společnosti)
- **5letá historie UBO** — jakékoli změny UBO od r. 2021 (kdy byla ESM zavedena), pro zachycení nedávných promíchání vlastnictví
- **Osvědčení daňové rezidence** pro každého UBO (pro WHT / FATCA / CRS koordinaci)

### 4.3 Text prohlášení a záruky SPA (doporučený)
> „Prodávající prohlašuje a zaručuje, že UBO informace poskytnuté v Příloze [X] plně zveřejňují všechny skutečné vlastníky každé skupinové společnosti k Datu podpisu, konzistentně s definicemi evidence skutečných majitelů dle zákona č. 37/2021 Sb. a 6. směrnice AML. Prodávající zveřejnil všechny změny UBO za posledních pět (5) let. Jakýkoli nezveřejněný UBO představuje materiální porušení spouštějící právo kupujícího na ukončení a plné odškodnění."

### 4.4 Ochrana před odstoupením před podpisem (pre-signing walk-back)
Pokud je Cesta 1 (PPF banka) nebo Cesta 2 (soudní žádost) dokončena **před Podpisem** a je nalezen rozpor vs. Cesta 3 (prohlášení prodávajícího), PPF má důvody:
- Vyžadovat plné zveřejnění před pokračováním
- Ukončit DD a odejít bez poplatku za odstoupení (break-fee)
- Vyjednat sníženou cenu

---

## 5. Matice rizik

| Riziko | Pravděpodobnost | Dopad | Zmírnění |
|------|-------------|--------|------------|
| Progresus odmítne přímé prohlášení UBO | 10 % | HIGH — hlavní transakční riziko | Cesta 1 nebo 2 jako záloha + právní tlak |
| Cesta 1 (PPF banka) kompromitována konkurenčním vztahem | 25 % | MEDIUM | Přepnout na Cestu 2 brzy |
| Cesta 2 (soud) zpožděna >6 týdnů | 30 % | MEDIUM | Podat současně s Cestou 1 |
| Skrytý UBO se objeví po podpisu | 15 % | HIGH | Odškodnění SPA + 5letý doběh (tail) + úprava ceny |
| UBO Progresus zahrnuje sankcionované osoby (nízká pravděpodobnost) | 3 % | KATASTROFICKÉ | AML kontrola (Cesta 1) toto zachytí brzy |
| UBO Progresus zahrnuje PEP (politicky exponovaná osoba) | 20 % | MEDIUM — vyžadováno zesílené AML | Zveřejnit PPF banka AML; není transakční zabiják |

---

## 6. Akční plán

### Týden 1
- [ ] Žádosti L-60 / L-61 / L-62 datové místnosti odeslány Progresusu
- [ ] AML compliance PPF banky informováno o DD — zahájit dotazy Cesty 1
- [ ] Externí právní zástupce informován o přípravě Cesty 2 (pohotovost)

### Týden 2-3
- [ ] Obdržena přímá UBO prohlášení Progresus (Cesta 3)
- [ ] PPF banka vrací ESM výpisy (Cesta 1)
- [ ] Křížově ověřit Cestu 3 vs. Cestu 1 — označit jakýkoli rozpor

### Týden 3-4
- [ ] Pokud rozpor nebo Cesta 1 nekompletní → podat soudní žádost Cesty 2
- [ ] Zahraniční výpisy z registru UBO obdrženy (LU/NL/CY/MT/BVI dle aplikovatelnosti)

### Týden 4-6
- [ ] Plný UBO řetězec ověřen
- [ ] AML/sankční screening dokončen (OFAC, EU, UK, ČR)
- [ ] UBO sekce DD reportu uzavřena

### Týden 8+
- [ ] Vyjednávání prohlášení a záruky SPA zahrnuje záruku UBO
- [ ] Potvrzení UBO v den podpisu (15denní aktualizační okno)

---

## 7. Rozpočet

| Položka | Náklady (CZK) |
|------|-----------|
| Dotazy AML PPF banky (Cesta 1) | Interní |
| Externí právní zástupce — žádost Cesty 2 | 40-80 tis. |
| Soudní poplatek (Cesta 2) | 500-2 000 |
| Notářské ověření prohlášení prodávajícího (nese prodávající) | 0 |
| Poplatky zahraničních registrů UBO (LU, NL, CY dle aplikovatelnosti) | 20-50 tis. |
| AML screening (seznamy OFAC/EU/UK) | 20-30 tis. interní |
| **Celkem** | **80-160 tis. CZK** (~3 200-6 400 €) |

---

## 8. Citace

- [KPMG Česká republika — ESM bude od 17. prosince 2025 neveřejná](https://danovky.cz/cs/evidence-skutecnych-majitelu-bude-od-17-prosince-2025-neverejna)
- [KŠB — Co přinese znepřístupnění od 17. prosince 2025](https://www.ksb.cz/en/clanky/evidence-skutecnych-majitelu-co-prinese-znepristupneni-od-17-prosince-2025)
- [Ministerstvo spravedlnosti ČR — oficiální oznámení znepřístupnění ESM](https://msp.gov.cz/en/web/msp/rozcestnik/-/clanek/ministerstvo-spravedlnosti-znep%C5%99%C3%ADstupn%C3%AD-17.-prosince-2025-ve%C5%99ejnou-%C4%8D%C3%A1st-evidence-skute%C4%8Dn%C3%BDch-majitel%C5%AF-esm-1)
- [FAÚ — Souhrnné informace k ESM](https://www.fau.gov.cz/assets/cs/cmsmedia/Souhrnn%C3%A9%20informace%20k%20ESM.pdf)
- [Advokátní deník — 2025-12-08 — Od 17.12. bude nepřístupná ESM](https://advokatnidenik.cz/2025/12/08/od-17-12-bude-nepristupna-evidence-skutecnych-majitelu-siroke-verejnosti/)
- [Chrenek Toman Kotrba — Transparentnost vs soukromí](https://www.chrenektomankotrba.cz/clanky/kdyz-se-transparentnost-stretne-s-pravem-na-soukromi-proc-se-evidence-skutecnych-majitelu)
- [EPRAVO.cz — Znepřístupnění ESM veřejnosti](https://www.epravo.cz/top/clanky/znepristupneni-evidence-skutecnych-majitelu-verejnosti-120384.html)
- [JŠK — Konec nejistoty u ESM](https://www.jsk.cz/clanek/konec-nejistoty-u-evidence-skutecnych-majitelu)
- SDEU 2022-11-22 spojené věci C-37/20 a C-601/20 (WM v Luxembourg Business Registers; Sovim SA v Luxembourg Business Registers)
- Zákon č. 37/2021 Sb. o evidenci skutečných majitelů, v platném znění
- Zákon č. 253/2008 Sb. o AML (české transponování směrnic AML)

---

**Uzavření**: Změna režimu přístupu k UBO přidává 2-4 týdny k DD PPF a ~100 tis. CZK k rozpočtu. Cesta 1 (AML PPF banky) + Cesta 3 (přímé prohlášení prodávajícího) zkombinovaně splňují plné ověření UBO. Cesta 2 (soudní žádost) je záloha. Standardní M&A prohlášení a záruky + 5letý doběh (tail) odškodnění chrání proti překvapením UBO po uzavření.

<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

Na tento soubor odkazují:

- [MASTER-FINDINGS.md](../MASTER-FINDINGS.md) — 04-legal/ubo-disclosure-memo.md
- [RED-FLAGS.md](../RED-FLAGS.md) — 04-legal/ubo-disclosure-memo.md

## 🏷️ Související soubory (podle shody tagů)

*Žádné silně související soubory (shoda tagů pod prahem 0,3).*

## 🌐 Pohled grafu

[Otevřít v portálu](../index.html) · [Mapa stránek](../sitemap.html) · [Hledat](../search.html) · Focus ID: `04-legal%2Fubo-disclosure-memo.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
