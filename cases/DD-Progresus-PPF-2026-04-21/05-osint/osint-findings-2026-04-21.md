# Zjištění OSINT — 2026-04-21

**Metoda**: Webové vyhledávání ve veřejných českých zdrojích (Wikipedia, obchodní rejstříky, média, dluhopisář.cz, ČNB)

## Potvrzené entity ve skupině Progresus

| Entita | Role | Zdroj |
|--------|------|--------|
| **Progresus Invest Holding a.s.** | Mateřská skupina (marketingově orientovaná) | progresus.cz, Wikipedia |
| **Progresus Invest Holding core a.s.** (IČO 13995758) | Samostatná právní entita — účel nejasný | Kurzy.cz rejstřík |
| **PROGRESUS Group a.s.** | Vrcholový holding, **ručitel dluhopisového programu** | Prospekt schválený ČNB |
| **Nový Zeleneč a.s.** | **SPV vlastnící pozemek (část z 42 ha)** | Článek Aegis Law |
| **RD Rýmařov Invest III. alpha s.r.o.** | **Spoluvlastník pozemku 42 ha** | Článek Aegis Law |
| **PROGRESUS RD Rýmařov IV a.s.** | Emitent dluhopisů 2026 (program 2 mld. CZK, 10 let) | Prospekt ČNB |
| **PROGRESUS RD Rýmařov III a.s.** | Emitent dluhopisů 2024 (uzavřeno 2026-01-02) | dluhopisář.cz |
| **RD Rýmařov Invest Develop a.s.** | Emitent dluhopisů 2021 (uzavřeno 2022-06-29) | progresusinvest.cz |
| **RD Rýmařov** | Největší český výrobce dřevostaveb, provozní entita | Wikipedia |
| **Vitrablok / Seves Glass Block** | Akvírovaný byznys se skleněnými tvárnicemi | ČeskéNoviny.cz |

### 🚨 KRITICKÉ NOVÉ ZJIŠTĚNÍ — Duální vlastnictví pozemku
Pozemek 42 ha Nový Zeleneč NENÍ vlastněn jediným SPV. Je rozdělen mezi:
- **Nový Zeleneč a.s.** (entita A)
- **RD Rýmařov Invest III. alpha s.r.o.** (entita B — všimněte si „Invest III", což odpovídá pojmenovacímu vzorci emitenta dluhopisů z 2024)

**Proč to záleží pro DD PPF**:
1. **Zámotek kolaterálu**: Pokud je `RD Rýmařov Invest III. alpha s.r.o.` napojen na kolaterální pool dluhopisů → držitelé dluhopisů mohou mít zástavy na části pozemku
2. **Komplexnost struktury transakce**: Kupující musí získat OBĚ entity nebo aktiva odděleně — **možná dvojí daňová událost**
3. **Vyžadováno historické vysvětlení**: Proč dvě entity? Daně, financování nebo akviziční historie?
4. **Interakce s covenanty dluhopisů**: Série dluhopisů RD Rýmařov pravděpodobně obsahuje křížové kolateralizační doložky

**DD akce**: Stáhnout Sbírku listin pro obě entity; ověřit vlastnictví podílů, zástavy úvěrů, zatížení aktiv.

## Profil zakladatele — Lukáš Zrůst

**Pozadí**:
- JUDr. Univerzita Karlova
- **Insolvenční správce** se zvláštní certifikací (zvláštní povolení)
- Vedl velké insolvence: **ZOOT, Vítkovice Machinery**
- Dokončil „tisíce insolvenčních případů"
- Dohlížel na 3 podnikové restrukturalizace, největší s ročními tržbami >3 mld. CZK
- Založil Progresus v **únoru 2021** s Lukášem Foralem (50/50)

**Rizikové vektory, které bude PPF zkoumat**:
1. **Sourcing aktiv**: Pocházela některá aktiva Progresu z insolvenčních podstat, kde byl Zrůst správcem? Jakákoli mezera mezi zaplacenou a tržní cenou by mohla vyvolat **nároky z porušení fiduciárních povinností** (málo pravděpodobné, že by zneplatnily transakci, ale reputačně rizikové).
2. **Klientský konflikt**: Jsou bývalí insolvenční věřitelé/dlužníci nyní protistranami Progresu?
3. **Vazba na ZOOT**: ZOOT byl mediálně vyhrocený případ — jakékoli reziduální nároky?
4. **Vítkovice Machinery**: Věřitelská soudní agenda?

**DD akce**: Zpracovat:
- Seznam každého insolvenčního případu, kde byl Zrůst správcem (pull z isir.justice.cz)
- Křížová kontrola s historií akvizic Progresu
- Zveřejnění jakéhokoli překryvu **proaktivně** v DD pokoji s vysvětlením

## Spolu-zakladatel — Lukáš Foral

**Pozadí** (méně veřejné):
- Investor, investiční partner
- Zaměření: fondy + developerské projekty
- 50% vlastník Progresu

**DD akce**: Mapovat ostatní investice / fondy Forala kvůli související transakční expozici.

## Dluhopisový program — detailně

### Současný (2026)
- **Emitent**: PROGRESUS RD Rýmařov IV a.s.
- **Velikost**: max 2 mld. CZK
- **Doba trvání**: 10 let
- **Ručitel**: PROGRESUS Group a.s.
- **Schválení**: prospekt ČNB schválen

### Ukončený (2024-2026)
- **Emitent**: PROGRESUS RD Rýmařov III a.s.
- **Nabídka skončila**: 2026-01-02
- **Nesplaceno**: neznámé — potřeba podání z OR

### Ukončený (2021-2022)
- **Emitent**: RD Rýmařov Invest Develop a.s.
- **Nabídka skončila**: 2022-06-29
- **Nesplaceno**: neznámé — potřeba podání z OR

### 🚨 KRITICKÉ — Riziko křížových covenantů
Tři emitenti dluhopisů ve stejné skupině, stejný ručitel (PROGRESUS Group a.s.). Akvizice Nového Zelenče ze strany PPF spouští:
1. **Události změny ovládání** potenciálně napříč všemi třemi sériemi dluhopisů
2. **Práva put** pro držitele dluhopisů
3. **Křížové selhání**, pokud jedna série defaultuje

Toto je téměř jistě **~1 miliardový dluh CZK** zmíněný ve zjištění C3. Potřeba úplný harmonogram.

**DD akce (urgentní)**:
- Stáhnout **všechny prospekty dluhopisů** (progresusinvest.cz + ČNB)
- Mapovat **harmonogramy covenantů** vedle sebe
- Identifikovat **spouštěče změny ovládání, práva put, křížová selhání**
- Předjednat **vzdání se práv od držitelů dluhopisů** PŘED DD jednáním s PPF

## Projekt Nový Zeleneč — potvrzené finance

| Metrika | Hodnota | Zdroj |
|--------|-------|--------|
| Plocha | 42 ha (část Mstětice obce Zeleneč) | Více zdrojů |
| Cíl dokončení Fáze 1 | 2030 | bydleni.cz |
| Start Fáze 2 | 2028-2029 (~300 bytů + 100+ RD) | bydleni.cz |
| Start Fáze 3 | ~2031 (~6 let trvání) | bydleni.cz |
| **Celkové náklady projektu** | **15,9 mld. CZK** | developerske-projekty.cz |
| **GDV při dokončení** | **37,5 mld. CZK** | developerske-projekty.cz |
| Potenciál hrubé marže | ~21,6 mld. CZK (57 %) | dopočteno |

### 🚨 KOTVA OCEŇOVÁNÍ
Pokud PPF akviruje **nyní (na zelené louce, před výstavbou)**, hodnota transakce by se měla ukotvit na:
1. **Aktuální hodnota pozemku**: 42 ha × (současná cena za m² zonovaného pozemku v Praze-východ)
2. **Plus prémie za povolení**: pokud je získáno stavební povolení + územní rozhodnutí
3. **Minus diskont za riziko dokončení**: časová osa 2030-2037 = 10+ let exekučního rizika
4. **Minus převzatý dluh** (v případě akciového obchodu)

**Náš model**:
- Surový pozemek 42 ha × 4 000 CZK/m² = 1,68 mld. CZK (konzervativně)
- Surový pozemek 42 ha × 7 000 CZK/m² = 2,94 mld. CZK (agresivně)
- **S kompletním povolením + inženýrskými sítěmi**: 4-8 mld. CZK
- **Valuační ambice Progresu**: „vyšší miliardy" konzistentní s rozpětím 5-8 mld.

**Pravděpodobná valuace PPF**: rozpětí 3-5 mld. CZK, agresivní snížení za zjištění z DD

## Právní poradce — Aegis Law

**Angažmá**: Poradil Progresu při **plánovací smlouvě** pro Nový Zeleneč (jeden z největších rezidenčních developmentů na zelené louce východně od Prahy).

**Vedoucí partner**: Vojtěch Faltus (Partner, Aegis Law)

**DD akce**: Potvrdit rozsah angažmá Aegis; stáhnout pověřovací dopis; ověřit absenci konfliktů.

## Doplňky korporátního portfolia

- **Vitrablok / Seves Glass Block** — akvírováno Progresem; největší světový výrobce skleněných tvárnic. **PPF se zeptá**: Je to v rozsahu transakce? Jaká valuace? Nějaké vynětí?
- **„100+ společností"** — dle rozhovorů se Zrůstem. Zásadní je strukturní schéma.

## Další investice Progresu (dle Wikipedie + rozhovorů)

Dle popisu společnosti: „realitní development prostřednictvím dřevostaveb, udržitelné rezidenční projekty, průmyslové nemovitosti, **IT, doplňky stravy, právo, insolvence, udržitelné stavební materiály**".

### 🚨 NEOBVYKLÉ PORTFOLIO
„Doplňky stravy" a „právo" jsou pro investiční holding neobvyklé. PPF se zeptá:
- Které společnosti v těchto segmentech?
- Proč ve stejné skupině s realitami?
- Jakékoli toky se spřízněnými stranami?

**DD akce**: Mapovat všech 100+ entit; klasifikovat dle segmentu; vytvořit memorandum s vysvětlením.

## Konzultované zdroje (2026-04-21)

- https://cs.wikipedia.org/wiki/Progresus_Invest_Holding
- https://www.progresus.cz/o-nas
- https://www.progresus.cz/dluhopisovy-program
- https://www.progresusinvest.cz/
- https://www.progresusinvest.cz/predchozi-dluhopisove-programy/
- https://rejstrik-firem.kurzy.cz/13995758/progresus-invest-holding-core-as/
- https://dluhopisar.cz/progresus-ma-novy-dluhopisovy-prospekt/
- https://dluhopisar.cz/emitenti/rd-rymarov/
- https://legalweb.cz/aegis-law-radila-skupine-progresus-u-jednoho-z-nejvetsich-rezidencnich-projektu-na-zelene-louce-6190/
- https://www.ravantino-group.cz/en/page/projects/category/122-Projekty/article/862-developersky_projekt_novy_zelene.html
- https://www.bydleni.cz/zprava/Novy-Zelenec-nabizi-rodinne-domy-bytove-domy-a-plnou-obcanskou-vybavenost
- https://www.e15.cz/byznys/finance-a-bankovnictvi/na-trh-miri-dalsi-developersky-dluhopis-progresus-chce-urychlit-expanzi-poptava-dve-miliardy-1430618
- https://www.estate.cz/rozhovory/majitele-spolecnosti-progresus-invest-holding-chteji-se-od-nas-ucit-i-nemci/
- https://www.estate.cz/rozhovory/lukas-zrust-a-lukas-foral-majitele-progresus-invest-holding-budeme-evropskou-jednickou-v-drevostavbach/
- https://www.ceskenoviny.cz/tiskove/zpravy/progresus-nabytim-zavodu-vitrablok-ziskava-znacku-seves-glass-block-nejvetsiho-svetoveho-vyrobce-sklenenych-tvarnic/2541083
- https://www.hrot24.cz/clanek/skupina-progresus-prodava-dluhopisy-za-stovky-milionu-a-laka-na-drevostavby-HCtLq
- https://prazsky.denik.cz/zpravy_region/novy-zelenec-stavba-domy.html
- https://www.newstream.cz/money/rd-rymarov-vydava-dalsi-dluhopisy-ekonomiku-projektu-zatim-firma-nezverejnila
- https://www.seznam.cz/komentare/17178496-rd-rymarov-vydava-dalsi-dluhopisy-slusela-by-jim-transparentnejsi-ekonomika
- https://www.tvarchitect.com/video/tv-architect-predstavuje-rd-rymarov-lukas-zrust/

<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

Na tento soubor odkazují:

- [05-osint/ppf-side-deep/README.md](./ppf-side-deep/README.md) — `../osint-findings-2026-04-21.md` (2×)

## 🏷️ Související soubory (podle shody tagů)

*Žádné silně související soubory (shoda tagů pod prahem 0,3).*

## 🌐 Pohled grafu

[Otevřít v portálu](../index.html) · [Mapa stránek](../sitemap.html) · [Hledat](../search.html) · Focus ID: `05-osint%2Fosint-findings-2026-04-21.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
