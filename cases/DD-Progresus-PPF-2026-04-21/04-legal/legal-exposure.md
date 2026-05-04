# Analýza právní expozice — DD Progresus

**Status**: v0.1 (2026-04-21)

---

## Aktivní a hrozící právní expozice

### Kategorie A — Soudní spory (současné + doběh / tail)
Z DD skenu z 2026-04-01: **„4 řízení hlášena jako 1"** = zjištění C5.

**Vyžadováno vyřešení**:
- Stáhnout justice.cz plnotextově pro všechny entity Progresus (každé IČO)
- Stáhnout Insolvenční rejstřík (isir.justice.cz) pro každou entitu a oba partnery
- Zkontrolovat NSS + Ústavní soud (nssoud.cz, nalus.usoud.cz) pro jakékoli ústavní/správní věci

**Očekávané kategorie**:
- Smluvní spory s dodavateli / subdodavateli
- Realitní spory (sousedská práva, věcná břemena, odvodnění)
- Pracovněprávní záležitosti
- Nároky držitelů dluhopisů (pokud jsou)
- Daňové spory s Finančním úřadem
- Správní řízení (stavební úřad, životní prostředí)

### Kategorie B — Regulatorní
Z OSINT 2026-04-21:

**B1. ČNB (cenné papíry)**
- Progresus je aktivní emitent dluhopisů → dohled ČNB nad souladem prospektů, distribučními praktikami, průběžnými zveřejněními
- Pro Věřitele a newstream.cz označili **distribuční taktiky** — potenciálně v zorném poli ČNB
- **NALÉHAVÉ**: Potvrdit žádné aktivní vyšetřování ČNB, žádná dřívější vynucovací opatření, žádné probíhající dotazy
- Zkontrolovat: Rozhodnutí ČNB (veřejná databáze)

**B2. Stavební úřad (Zeleneč)**
- Aktivní EIA (EIA_STC2258 CENIA)
- Probíhající stavební řízení pro jednotlivé fáze výstavby
- Korespondence s obcí — vyžádat z obecních záznamů

**B3. Finanční úřad**
- Daňové záležitosti neznámé — zkontrolovat Registr plátců DPH; jakákoli daňová řízení?

**B4. ÚOHS (antimonopol)**
- Irelevantní pro typickou realitní transakci této velikosti (pokud Progresus nemá obavy o tržní podíl v segmentu RD Rýmařov)

### Kategorie C — Správní / plánovací
**C1. Petice k územnímu plánu Zeleneč 2022**
- 138 podpisů (prosinec 2022) — „V Zelenči jsme doma, z.s."
- Jádrové tvrzení: **procesní integrita** („nepatřičná spojení mezi zástupcem plánu a zpracovatelem")
- **Status**: Petice NEZABRÁNILA přijetí (ÚP schválen 2025-02-18)
- **Zbytkové riziko**: Jakákoli skupina by mohla podat správní žalobu v zákonné lhůtě po přijetí ÚP
- **Zákonná lhůta**: 2 měsíce pro přímé napadení dle českého správního práva, ale širší důvody možné
- **KRITICKÉ**: Ověřit žádnou podanou věc u KS Praha (krajský správní soud)

**C2. Status stavebního řízení**
- Fáze 1 cílí dokončení 2030 → příprava pravděpodobně v r. 2026-2028
- Stavební povolení pravděpodobně NEZÍSKÁNO pro většinu parcel
- **PPF bude pečlivě oceňovat**, pokud je územní plán jediným základem povolení

### Kategorie D — Smluvní
**D1. Akviziční smlouvy (2021)**
- Progresus akvíroval Nový Zeleneč a.s. ~leden 2021
- Vyžadováno: SPA + jakékoli vedlejší dohody, earn-out doplatky, tag-along/drag-along, předkupní právo
- Původní prodávající — zkontrolovat zbytková práva

**D2. Dluhopisová dokumentace**
- Tři dluhopisové programy s různými emitenty, všechny zaručené PROGRESUS Group a.s.
- Vyžadováno: každý prospekt + konečné podmínky (final terms) + záruční listina + rozhodnutí ČNB o schválení

**D3. Dodavatelské / subdodavatelské smlouvy**
- Pro 42ha rozvoj: smlouvy o sítích (voda, kanalizace, elektřina, plyn), dohody o přístupu silnic, dedikační závazky inženýrských sítí

**D4. Smlouvy o službách**
- Aegis Law angažmá pro plánování
- Architekt / projektant angažmá (Studio Perspektiv?)
- Stavební management (po vydání povolení)

### Kategorie E — IP & data
**E1. Projektové IP**
- Práva k značce / designu „Nový Zeleneč"
- Architektonické návrhy (Studio Perspektiv odkazováno ve zjištění z 2026-04-01 jako „3. místo, nikoli vítěz" — vyžaduje vyjasnění smluvního řetězce)
- Marketingové materiály (záznam novostavby.com, doména novyzelenec.com)

**E2. GDPR / ochrana osobních údajů**
- Data držitelů dluhopisů (osobní údaje tisíců retailových investorů)
- Data zaměstnanců
- Data zákazníků (budoucích kupujících domů)
- **NALÉHAVÉ**: Ověřit jmenovaného pověřence pro ochranu osobních údajů (DPO) + DPIA pro oslovení držitelů dluhopisů

### Kategorie F — Obavy ohledně insolvenčního správce (Zrůst)
**F1. Historicky vedená insolvenční řízení**
- Tisíce věcí, včetně ZOOT + Vítkovice Heavy Machinery
- **Obava PPF**: Jakékoli aktivum získané z insolvenční praxe nyní v portfoliu Progresus?
- **Zmírnění**: Čisté prohlášení „bez překryvu" + křížová kontrola proti isir.justice.cz

**F2. Současné profesní postavení**
- Ověřit: Registrovaný insolvenční správce (zvláštní povolení) — aktivní nebo pozastavený?
- Zkontrolovat: Jakákoli disciplinární řízení přes Ministerstvo spravedlnosti / Komoru insolvenčních správců
- Zkontrolovat: Jakékoli trestní řízení (nepravděpodobné, ale standardní screen)

### Kategorie G — Odpovědnost zakladatele / principála
**G1. D&O pojištění (pojištění odpovědnosti statutárů)**
- Krytí pro Zrůsta + Forala v jejich představenských kapacitách
- Limity krytí + výluky
- **PPF bude vyžadovat udržení doběhového (tail) krytí po uzavření**

**G2. Osobní záruky / zástavy**
- Jakékoli osobní záruky Zrůsta / Forala na skupinovém dluhu?
- Jakékoli zástavy nad jejich podíly v Progresusu?

---

## Studio Perspektiv „3. místo, nikoli vítěz" (C7)

Zjištění z 2026-04-01: Tvrzení, že Studio Perspektiv je prezentováno jako „vítěz" nějaké soutěže, když byli „3. místo".

**Hypotéza**: Toto se může vztahovat k:
- Architektonické soutěži obce Zeleneč (odkazováno v r. 2020-21 na České komoře architektů)
- Jakékoli jiné soutěži související s projektem

**Obava PPF**: Pokud marketingové materiály nebo prezentace pro investory (pitch decks) tvrdí „oceňovaný design", ale architekti ve skutečnosti nebyli oceněni → zkreslené prohlášení, potenciální podvod na trhu (fraud-on-market), pokud použito v dluhopisovém prospektu.

**Cesta vyřešení**:
1. Identifikovat konkrétní soutěž
2. Stáhnout záznamy ze soutěže z ČKA nebo obce
3. Ověřit skutečné umístění Studia Perspektiv
4. Zkontrolovat, zda tvrzení figuruje v dluhopisovém prospektu nebo marketingu → pokud ano, připravit korekci
5. Ověřit smluvní řetězec k aktuálnímu designu (jsou stále angažováni?)

---

## „Zákaz sdílení" HP (C6)

Zjištění z 2026-04-01: Nějaká forma omezení spolubydlení/sdílení na „HP".

**Hypotéza**:
- „HP" = Hospodářské Pozemky (zemědělská/pomocná půda) — v českém právu existují omezení na převod zemědělské půdy na stavební pozemky
- Zákaz sdílení může odkazovat na **sekci ÚP, která omezuje rezidenční hustotu** v určitých částech
- Nebo **individuální věcné břemeno/omezení** na konkrétních parcelách

**Cesta vyřešení**:
- Vyjasnit význam (pravděpodobně interní žargon pro konkrétní omezení parcely)
- Získat právní stanovisko k rozsahu + nákladům na sanaci
- Pokud materiální → memo dopadu na ocenění

---

## Doporučený protokol právního DD pro fázi PPF

### Fáze 0 — Příprava prodávajícího (týden -4 až 0)
- Najmout nezávislého externího právního zástupce (nikoli Aegis) pro nezávislou (adversarial) kontrolu
- Plné stažení ARES / OR pro všechny skupinové entity
- Plná rešerše justice.cz
- Plný screen ČNB pro jakékoli vynucování
- Plné stažení ČÚZK pro 42ha LV + všechny ostatní skupinové nemovitosti
- Datová místnost DD naplněna každou uzavřenou smlouvou, každou regulatorní korespondencí

### Fáze 1 — Právní DD PPF (týden 1-3)
- Očekávat 150-250 specifických právních požadavků
- Standardní kategorie: korporátní, realitní, soudní spory, IP, pracovněprávní, daňové, GDPR, regulatorní, pojištění
- SLA odpovědi: 48-72 hodin na požadavek typicky; eskalovat na nové/komplexní
- Použít strukturovaný otázky a odpovědi log, aby nic nevypadlo

### Fáze 2 — Návštěvy lokality + odborná kontrola (týden 3-5)
- Návštěva lokality 42ha
- Environmentální procházka s konzultantem
- Hodnocení sítí / infrastruktury
- Setkání s obcí (volitelné, se souhlasem prodávajícího)

### Fáze 3 — Vyjednávání SPA (týden 5-8+)
- Rozsah prohlášení a záruk
- Harmonogramy zveřejnění (využít tento workspace)
- Limity (cap) odškodnění, časové limity
- Struktura úschovy
- Vzdání práv (waiver) ke změně kontroly (CoC) od držitelů dluhopisů (pokud vyžadováno)

---

## Červené čáry v právních termínech (nediskutovatelné)

1. **Limit (cap) odškodnění prohlášení a záruky**: 10-15 % protiplnění; standardní prohlášení 18 měsíců, daňové 5 let, environmentální 7 let
2. **Vyloučení podvodu**: neomezené, ale vyžadovat skutečný podvod, nikoli nedbalost
3. **Žádné osobní záruky**, pokud nejsou specificky dohodnuté + úzké
4. **Doběhové (tail) D&O pojištění** poskytované Progresusem nebo kupujícím, nikoli osobně principály
5. **Důvěrnost** 5 let po uzavření
6. **Konkurenční doložka** úzký rozsah (pouze v 42ha rozvoji + přilehlých), 2 roky
7. **Žádné právo kupujícího na odstoupení** mimo konkrétních prohlášení / podvodu
8. **Rozhodné právo CZ**, arbitráž CZ

---

*Tato analýza bude aktualizována, jak se buduje harmonogram soudních sporů a dokončuje review externího právního zástupce.*

<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

Na tento soubor odkazují:

- [MASTER-FINDINGS.md](../MASTER-FINDINGS.md) — 04-legal/legal-exposure.md#kategorie-a-soudni-spory (6×)
- [RED-FLAGS.md](../RED-FLAGS.md) — 04-legal/legal-exposure.md (3×)
- [04-legal/dancore-timeline.html](./dancore-timeline.html) — legal-exposure.md

## 🏷️ Související soubory (podle shody tagů)

*Žádné silně související soubory (shoda tagů pod prahem 0,3).*

## 🌐 Pohled grafu

[Otevřít v portálu](../index.html) · [Mapa stránek](../sitemap.html) · [Hledat](../search.html) · Focus ID: `04-legal%2Flegal-exposure.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
