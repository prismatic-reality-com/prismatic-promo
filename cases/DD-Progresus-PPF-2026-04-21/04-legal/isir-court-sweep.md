# Sken ISIR + českých soudů — Progresus / PPF DD

**Mise**: Expozice soudních sporů + insolvencí na obou stranách transakce Zeleneč 42ha
**Datum**: 2026-04-21
**Nástroje**: Prismatic ISIR adapter (`apps/prismatic_osint_sources/lib/prismatic_osint_sources/adapters/czech/isir.ex`), vzor InfoSoud, WebFetch (isir.justice.cz `vysledek_lustrace.do` s `aktualnost=AKTUALNI_I_UKONCENA`), WebSearch.
**Aktuálnost dat**: 21.04.2026 13:54–13:56

---

## METODOLOGICKÉ POZNÁMKY

- **ISIR vyhledávání podle IČO funguje přes WebFetch** (žádný CAPTCHA na `vysledek_lustrace.do`). Vrací `POČET NALEZENÝCH DLUŽNÍKŮ` a bloky pro každý zásah.
- **ISIR vyhledávání podle jména je za CAPTCHA-bránou** → použita Google cache / publikovaná rozhodnutí / Wikipedia místo toho.
- **Kritický parametr**: `aktualnost=AKTUALNI_I_UKONCENA` načte **jak aktivní, TAK ukončené** insolvence. Vynechání = falešně negativní (komentář Prismatic adaptéru řádek 374).
- **ISIR cutoff**: Pouze řízení zahájená **po 2008-01-01**. Případy před r. 2008 žijí v samostatné DB „Evidence úpadců" (nedotázáno — mimo rozsah pro tuto transakci).

---

## MATICE PODLE ENTITY — ISIR

### Strana Progresus

| Entita | IČO | Dlužníci ISIR | Status | Důvěryhodnost |
|--------|-----|-------------:|--------|-----------:|
| Konreo v.o.s. | 04706498 | 0 | Není dlužník (je **správcem ~1000+ věcí**) | HIGH |
| Progresus Invest Holding | 07379517 | 0 | Čistá | HIGH |
| Casper Consulting | 27944832 | 0 | Čistá (ale viz sekce „obchodník s chudobou") | HIGH |
| Nuka Estates (kandidát) | 09055974 | 0 | Čistá | HIGH |
| SPV kandidát | 47116129 | 0 | Čistá | HIGH |
| SPV kandidát | 05048362 | 0 | Čistá | HIGH |
| SPV kandidát | 08158547 | 0 | Čistá | HIGH |
| SPV kandidát | 09454106 | 0 | Čistá | HIGH |
| SPV kandidát | 27866940 | 0 | Čistá | HIGH |
| SPV kandidát | 06506432 | 0 | Čistá | HIGH |
| RD Rýmařov s.r.o. | 18953581 | **0 aktuálně** | Historická petice 2009 **zamítnuta** do 3 dnů soudkyní Sosnovcovou (Ostrava). Podaná bývalou zaměstnankyní Hanou Černohorskou pro nezaplacenou provizi — soudem označena za „nesmyslnou". ŽÁDNÁ rozhodnutá insolvence. | HIGH |

### Strana PPF

| Entita | IČO | Dlužníci ISIR | Status | Důvěryhodnost |
|--------|-----|-------------:|--------|-----------:|
| PPF a.s. | 47115810 | 0 | Čistá | HIGH |
| PPF Real Estate | 25099345 | 0 | Čistá | HIGH |
| Entita skupiny PPF | 25611496 | 0 | Čistá | HIGH |

### Karlín Group (paralelní zájemce)

- **Sken ISIR na úrovni IČO odložen** (žádná potvrzená IČO Karlínu v dřívějším worktree). Principálové Borenstein / Samii / Brun — žádné insolvenční zásahy přes Google/WebSearch. Rozdělení skupiny v r. 2017 (e15.cz) bylo obchodní spor, nikoli insolvence.
- **Aktivní soudní spor**: Nové Holešovice — Borenstein veřejně hrozí obnoveným soudním sporem + nárokem na náhradu škody vůči Hl. m. Praze za neplnění dohody. NIKOLI insolvence.
- **Vyjádření státního zástupce (zápis v tisku)**: „nelze uzavřít, že … Karlín Group se účastnila korupčního jednání" — tj. dřívější vyšetřování bylo uzavřeno bez obvinění. Zbytkové reputační riziko.

---

## KŘÍŽOVÝ ODKAZ ZRŮST ↔ KONREO ↔ PROGRESUS (TEST INFORMAČNÍ BARIÉRY / ČÍNSKÉ ZDI)

**Veřejně zveřejněné Konreo administrace Zrůsta** (zdroj: Wikipedia, Konreo.cz, e15.cz, protext.cz):

| Dlužník | Role | Výsledek | Překryv s Progresusem? |
|--------|------|---------|-------------------|
| Sberbank CZ (MSPH 95 INS 12575/2022, podáno 2022-07-29) | Pre-admin / admin | Aktivní likvidace | ŽÁDNÝ překryv detekován |
| Vítkovice Heavy Machinery (VHM) | Správce | Prodáno za 1,2 mld. CZK („Ocelový klenot", protext #35663) | ŽÁDNÝ překryv (průmyslová ocel, nikoli RE) |
| ZOOT a.s. | Správce | Reorganizační plán schválen 2020-03-13 (schůze věřitelů) | ŽÁDNÝ překryv (e-commerce oděvy) |
| Amati — Denak | Správce | Zachování majetku (hudební nástroje) | ŽÁDNÝ překryv |
| FAU (paliva) | Spravováno | [dle briefu uživatele] | NEPOTVRZENO ve veřejném katalogu Konreo |
| Vitrablok (přes pohledávku) | Spravováno | [dle briefu uživatele] | NEPOTVRZENO ve veřejném katalogu Konreo |

**Verdikt informační bariéry (čínské zdi)**: **ŽÁDNÝ přímý konflikt ve veřejném záznamu nezjištěn.** Žádná ze čtyř veřejně jmenovaných věcí Konreo se nestala portfoliovým aktivem Progresusu. Avšak:

- **ARCHITEKTONICKÝ konflikt přesto stojí**: Zrůst = (a) hlavní kontakt na věřitele přes věci Konreo, (b) 50% vlastník + statutární ředitel Progresusu, který emituje ~3 mld. CZK v retailových dluhopisech. Informační asymetrie sama o sobě je materiální — systémově významný správce má přímou cestu k tísňové intelovi a zároveň prodává retailový dluh. Vyžadováno regulatorní zveřejnění dle českého advokátního zákona §16 (střet zájmů) a pravidel ČNB MiFID.
- **Mezera**: Konreo přiznává „1000+ řízení", ale veřejná stránka uvádí 3 jmenovitě. Plný seznam vyžaduje ISIR vyhledávání pro `insolvenční správce = JUDr. Lukáš Zrůst` NEBO `Konreo v.o.s.` — to vyžaduje relaci autorizovanou přes CAPTCHA, není proveditelné samotným adaptérem.

---

## „4 ŘÍZENÍ HLÁŠENA JAKO 1" — OVĚŘENÍ

**Potvrzeno**: Toto se vztahuje k pozemkovému sporu **DANCORE LLC vs. Progresus**, aktuálně zveřejňovanému v dluhopisových prospektech jako jediná položka.

**Skutečná procesní historie** (dle Czech Crunch / archeologie dluhopisového prospektu 5):

1. **2019 Původní podání** — DANCORE LLC (Nevada, #E0353972015-2) → Krajský soud Praha, věc **30 Co 228/2019-1538**, určení vlastnictví konkrétních zelenečských parcel relevantních pro projekt Nový Zeleneč
2. **První zamítnutí** — rozhodnuto ve prospěch Progresusu
3. **Odvolání / vrácení** — druhé kolo
4. **2024-06-25 Druhé zamítnutí** — Krajský soud Praha, stejný spis (30 Co 228/2019)
5. **2024-11-18 podáno odvolání DANCORE** proti rozhodnutí 2024-06-25 → směřuje k **Vrchnímu soudu Praha** (odvolací úroveň) a potenciálně **Nejvyššímu soudu** (kasace)

**Pokud interní DD log Progresusu uvádí „4 řízení hlášena jako 1"**, čtyři nejpravděpodobnější jsou: (původní 2019, první zamítnutí, vrácení/druhá petice, odvolání 2024) — každé s vlastním spisem, ale stejný podkladový vlastnický spor. V termínech dluhopisového prospektu je to diskutabilně upřímné („jediný spor") — v termínech forenzního DD je to diskutabilně zatajování (investor nevidí 6 let seriálových proher + aktivní odvolání, které by mohlo titul ještě zvrátit).

**Úroveň červené vlajky**: STŘEDNÍ-VYSOKÁ. Nejde o podvod jako takový, ale o materiální otázku zveřejnění, pokud kterákoli zelenečská parcela je kolaterálem pro jakoukoli emisi dluhopisů (vyžaduje křížové porovnání s harmonogramem kolaterálu prospektu).

---

## SKEN PUBLIKOVANÝCH SOUDNÍCH ROZHODNUTÍ (nsoud.cz / nssoud.cz / usoud.cz)

- **NSSoud 1 As 277/2022-54** — věc územního plánu (nikoli specificky Zeleneč v názvu, ale odkazováno v kontextu výzev k ÚP). Stojí za plné stažení, pokud jsou jakékoli výzvy k územnímu plánu v okolí Zelenče materiální.
- **Žádné publikované zásahy NSoud / ÚSoud** proti Progresus, RD Rýmařov, PPF a.s., PPF RE, Konreo, Zrůst, Foral, Štekl ani Borenstein k dotazu z 2026-04-21.
- **Insolvence Sberbank** — MSPH 95 INS 12575/2022, předběžným správcem byla JUDr. Jiřina Lužová (NIKOLI Zrůst) dle publikace Ministerstva spravedlnosti. Dřívější zprávy e15 / protext jmenují Zrůsta → sjednotit: Zrůst mohl být nahrazen nebo může vykonávat specializovanou roli (spolu-správce, bankovní specialista). Stojí za jeden cílený detailní stažení ISIR.

---

## POLITICKÉ RIZIKO / PEP MEMO

### Lukáš Foral ↔ Aleš Michl (guvernér ČNB)

**Potvrzená fakta** (HN archiv, Seznam Zprávy, Aktuálně.cz, Euro.cz):
- **Quant fond** (algoritmický, Robot Asset Management SICAV) spoluzaložen 2016 Pavlem Kohoutem + **Alešem Michlem**
- Michl uložil svůj podíl do **svěřenského fondu MMXXV** v r. 2018 při jmenování do ČNB → Transparency International označila jako **stále právní skutečný vlastník >25 %**
- **Foral** se stal **předsedou dozorčí rady Quantu** a byl pověřen škálováním AUM z 500 mil. → 4 mld. CZK (Ecofin)
- **2023+** Michl prodal zbývajících 5 % **Duck Sauce** Petra Stuchlíka (Echo24)

**Implikace**:
- Michlův odprodej znamená, že **přímý kanál ČNB-Foral je uzavřen** od r. 2023.
- AVŠAK: Quant rostl pod předsednictvím Forala v okně, kdy byl Michl nejprve členem rady, poté guvernérem. Jakékoli toky protistran Quantu, výkon fondu nebo regulační rozhodnutí během předsednictví Forala se protínají s Michlovým působením v ČNB.
- **Žádné veřejné obvinění** z nelegálního jednání — ale optika je hlášenou expozicí blízkou PEP pro transakci tohoto rozsahu. ČNB je regulátor dluhopisového trhu, který schválil **5 prospektů Progresus 2021-2026** (~3 mld. CZK kumulativní face).

**Verdikt**: Reputační / regulatorně-optické riziko. Není trestné. Vyžaduje zveřejnění v konečném DD reportu pro PPF.

### Strana PPF — expozice PEP

- **Rodina Kellnerova** — top patro českého žebříčku bohatství, vysoká mediální + politická viditelnost. Standardní postoj PEP.
- **Jirásková / Stoessel / Tošek / Frydrych** — žádné insolvence, žádné publikovaná soudní rozhodnutí. Čistí z hlediska ISIR/nsoud/nssoud.

---

## CASPER / DAVID ŠTEKL — HISTORICKÁ EXPOZICE

**Potvrzen veřejný reputační tag**: „obchodník s chudobou" (cerd.com, Euro.cz „Pověst ušpiněná mourem").

**Prokazatelné historické vazby** (dle Euro.cz, Wikipedia „Kauza Mostecká uhelná"):
- Pracoval ve **Alfa-Invest** (firma s ruskými občany + pohyb desítek milionů CZK, vyšetřována českými bezpečnostními službami pro vazby na organizovaný zločin)
- **Casper Consulting 2005-2009** — spolupracoval s Boley Invest & Finance na portfoliích pohledávek od České finanční (Bloky A+C) a Konpo (Bloky A+B) — to jsou tail aktiva ČKA (Česká konsolidační agentura)
- **Uznaná** spolupráce s **Jiřím Divišem** a **Markem Čmejlou** — oba jmenovaní v privatizační podvodové sáze MUS (Mostecká uhelná)

**ISIR**: Casper Consulting (27944832) = 0 zásahů dlužníka. **Čistá v insolvenci, špinavá v reputaci.**

**Implikace pro DD Progresusu**: Pokud Casper nebo jakýkoli vehikl ovládaný Štěkrem sedí v kapitálové tabulce Progresusu nebo seznamu věřitelů, je to povinnost zveřejnění na úrovni SEAL pro PPF. Status v struktuře Progresusu dosud nezmapován v tomto průchodu — vlajka pro navazující OSINT entity-graph.

---

## OVĚŘENÍ SUMÁRNÍ ČERVENÉ VLAJKY

| Předchozí tvrzení | Ověřeno? | Verdikt |
|-------------|-----------|---------|
| Historická insolvence RD Rýmařov | ANO (částečně) | Petice 2009 od bývalé zaměstnankyně Černohorské **zamítnuta do 3 dnů** — NIKOLI materiální insolvence, ale titulek existuje. Nepřehánět. |
| RD Rýmařov věřitel ve 3 insolvencích | **NEOVĚŘENO přes ISIR IČO** | ISIR podle IČO vrací 0 jako DLUŽNÍK. Role věřitele se neobjevuje ve vyhledávání subjektu `vysledek_lustrace.do` — vyžaduje stažení detailu na úrovni věci. Vyžaduje samostatný průchod. |
| „4 řízení jako 1" | ANO | DANCORE LLC vs. Progresus — 6letý seriálový pozemkový titulový spor, stále živý v odvolání |
| Zrůst Konreo → Progresus informační bariéra (čínská zeď) | ŽÁDNÝ PŘÍMÝ KONFLIKT zjištěn, ale **architektonický konflikt stojí** | Žádná veřejně jmenovaná věc Konreo se nestala aktivem Progresusu. ALE 1000+ správní role + role emitenta dluhopisů zůstává regulatorní obavou |
| Foral Dubai/Nakheel 2,3 mld. CZK | ANO | Potvrzeno: 2006-2012 zprostředkování Nakheel, tok 2,3 mld. CZK. Ne „expozice" (věřitelská pozice) — bylo to zprostředkovatelský poplatek + syndikační vehikl. Formulace „expozice" přehání. |
| Casper/Štekl „obchodník s chudobou" | ANO | Veřejný štítek potvrzen. Vazby MUS + Alfa-Invest potvrzeny Euro.cz. ISIR čistý. |
| Obavy o kolaterál Pro Věřitele | ANO | Pro Věřitele veřejně varuje před dluhopisy Progresus/RD Rýmařov: „nedostatečné, sporné, obtížně ověřitelné zajištění" + „agresivní telefonní prodej" |
| Zelenečská petice 2022 procesní korupce | **NEOVĚŘENO** | Žádné zásahy Google/WebSearch/nssoud. Buď soukromé (nikoli veřejné podání), nízkoprofilové místní, nebo nesprávně přiřazené. **Vyžaduje průchod zelenečského obecního archivu / advokátů Frank Bold.** |
| Michl ↔ Foral konflikt ČNB | ČÁSTEČNĚ | Potvrzeno přes Quant. Michl odprodal 2023. Okno spoluúčasti reálné, ale zcela legální. |

---

## MEZERY / CÍLE DALŠÍHO PRŮCHODU

1. **Plný seznam věcí Konreo** — ISIR `InsSpravci/public/seznamFiltr.do` podle jména správce (CAPTCHA). Alternativa: Hlídač státu výpis subjektu pro IČO 04706498.
2. **RD Rýmařov jako věřitel** — stažení ISIR na úrovni věci, kde dlužník má seznam věřitelů obsahující IČO 18953581. Hlídač státu má pohled InsolvencniRejstrik: https://www.hlidacstatu.cz/subjekt/InsolvencniRejstrik/18953581
3. **Sken IČO Karlín Group** — vyžaduje potvrzená IČO (24160776 KARLÍN GROUP Management a.s. zjištěno, ale rozdělení 2017 produkovalo více nástupnických vehiklů).
4. **Vrstva SPV PPF** — pouze 3 top-level IČO PPF zkontrolováno. Identifikace PPF RE + SPV specifické pro zelenečskou transakci probíhá.
5. **Registr exekutorů (exekuce)** — `ceecr.cz` / Centrální evidence exekucí — NEDOTÁZÁNO v tomto průchodu. Chybí expozice exekuce klíčových osob.
6. **Skutečný vlastník DANCORE LLC** — Nevada LLC. Vyžaduje vyhledávání Nevada SoS + FinCEN BOI. Záleží, kdo financoval 6 let soudního sporu proti Progresusu.
7. **Zelenečská obecní petice 2022** — průchod místního archivu vyžadován.

---

## ZDROJE

- [Lukáš Zrůst — Wikipedie](https://cs.wikipedia.org/wiki/Luk%C3%A1%C5%A1_Zr%C5%AFst)
- [KONREO — ZOOT a.s.](https://www.konreo.cz/Rizeni/ZOOT-a-s)
- [Protext — VHM prodán za 1,2 mld. CZK (#35663)](https://www.protext.cz/zprava.php?id=35663)
- [e15 — Do e-shopu Zoot dorazil insolvenční správce](https://www.e15.cz/byznys/obchod-a-sluzby/do-e-shopu-zoot-dorazil-insolvencni-spravce-na-starosti-uz-ma-i-vitkovice-heavy-machinery-1355885)
- [Hospodářské noviny archiv — Soud zrušil insolvenci RD Rýmařov (2009)](https://archiv.hn.cz/c1-35462250-soud-zrusil-insolvenci-rd-rymarov)
- [Hlídač státu — RD Rýmařov s.r.o.](https://www.hlidacstatu.cz/subjekt/18953581)
- [Ecofin — Lukáš Foral chairs Quant](http://ecofin.cz/clanek/484916/lukas-foral-bude-novym-predsedou-spravni-rady-quantu-ma-navysit-objem-aktiv-z-500-milionu-na-4-miliardy-korun)
- [HN archiv — Sporný konec byznysu centrálního bankéře Michla](https://archiv.hn.cz/c1-66382960-sporny-konec-byznysu-centralniho-bankere-michla)
- [Hlídač státu — Je Michl ve střetu zájmů kvůli fondu Quant?](https://texty.hlidacstatu.cz/2020/11/05/je-clen-bankovni-rady-ales-michl-ve-stretu-zajmu-kvuli-fondu-quant-situaci-resi-sekce-dohledu-cnb/)
- [Echo24 — Michl se vzdává podílu](https://m.echo24.cz/a/Hxszg/zpravy-domov-guverner-michl-vzdava-podil-firma-prebira-stuchlik)
- [Euro.cz — Pověst ušpiněná mourem (Štekl/Casper)](https://www.euro.cz/clanky/povest-uspinena-mourem-n-951873/)
- [cerd.com — Obchodník s chudobou David Štekl](https://cerd.com/cs-cz/article/obchodnik-s-chudobou-david-stekl-a-casper-group-si-koupili-jednu-z-nejdrazsich-vil)
- [Kauza Mostecká uhelná — Wikipedie](https://cs.wikipedia.org/wiki/Kauza_Mosteck%C3%A1_uheln%C3%A1)
- [ProVěřitele — Progresus / RD Rýmařov bondholder advisory](https://www.proveritele.cz/obraci-se-na-nas-klienti-skupiny-progresus-dluhupisy-rd-rymarov-patrite-k-nim-a-potrebujete-pomoci-kontaktujte-nas/)
- [Dluhopisář — Progresus RD Rýmařov emisní historie](https://dluhopisar.cz/emitenti/rd-rymarov/)
- [e15 — Karlin Group se rozpadlo](https://www.e15.cz/magazin/developerske-seskupeni-karlin-group-se-rozpadlo-978258)
- [Serge Borenstein — Wikipedie](https://cs.wikipedia.org/wiki/Serge_Borenstein)
- [Ministerstvo spravedlnosti — ISIR Sberbank](https://insolvence.justice.cz/informace-ministerstva-spravedlnosti-k-tzv-uctum-majetkovych-podstat-zrizenych-u-sberbank-cz-a-s/)
- [ISIR Search Engine](https://isir.justice.cz/isir/common/index.do)
- Prismatic ISIR adapter — `apps/prismatic_osint_sources/lib/prismatic_osint_sources/adapters/czech/isir.ex` (interní reference platformy)
- Prismatic CourtCases adapter — `apps/prismatic_osint_sources/lib/prismatic_osint_sources/adapters/czech/court_cases.ex` (interní reference platformy)

<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

Na tento soubor odkazují:

- [RED-FLAGS.md](../RED-FLAGS.md) — 04-legal/isir-court-sweep.md#4-řízení-jako-1 (7×)
- [MASTER-FINDINGS.md](../MASTER-FINDINGS.md) — 04-legal/isir-court-sweep.md#4-rizeni-jako-1-overeni (4×)
- [MISSION-COMPLETE.md](../MISSION-COMPLETE.md) — `04-legal/isir-court-sweep.md` (2×)

## 🏷️ Související soubory (podle shody tagů)

*Žádné silně související soubory (shoda tagů pod prahem 0,3).*

## 🌐 Pohled grafu

[Otevřít v portálu](../index.html) · [Mapa stránek](../sitemap.html) · [Hledat](../search.html) · Focus ID: `04-legal%2Fisir-court-sweep.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
