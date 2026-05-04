# Finanční analýza — Progresus DD

**Stav**: v0.1 (2026-04-21) — částečné, kvůli překážce v načtení zdrojových dokumentů

---

## Analýza intervalu ocenění

### Na bázi GDV (shora-dolů)
- **Projektové GDV**: 37,5 mld. CZK (dle developerské-projekty.cz)
- **Náklady na dokončení projektu**: 15,9 mld. CZK
- **Teoretický hrubý zisk**: 21,6 mld. CZK (57% hrubá marže)
- **Časový rámec dokončení**: 2028-2037 (9 let)
- **PV diskont @ 10% WACC za 9 let**: 0,424
- **PV hrubého zisku**: 21,6 mld. × 0,424 = **9,16 mld. CZK**

### Riziko-upravená PV
| Rizikový faktor | Diskont |
|-------------|----------|
| Riziko povolovacího řízení / administrativních procesů | -15 % |
| Stavební / dodavatelské riziko | -20 % |
| Tržní / absorpční riziko | -10 % |
| Politické / regulatorní riziko (petice, EU) | -5 % |
| **Agregovaný rizikový diskont** | **-50 % kumulativně (přibližně)** |
| **Riziko-upravená PV** | **~4,5 mld. CZK** |

### Komparativ surového pozemku (zdola-nahoru, aktuální stav)
- Surový greenfield CZ, Praha-východ: 1 500-3 000 CZK/m² (před územním plánem)
- Územně schválený rezidenční, s ÚP: 4 000-8 000 CZK/m²
- S plným stavebním povolením: 10 000-15 000 CZK/m²

**42 ha = 420 000 m²**
- Nízký scénář (zónováno + částečná povolení): 420 000 × 4 000 = **1,68 mld. CZK**
- Střední scénář: 420 000 × 7 500 = **3,15 mld. CZK**
- Vysoký scénář (plná povolení + inženýrské sítě): 420 000 × 12 000 = **5,04 mld. CZK**

### Triangulace ocenění
| Metoda | Nízký | Střední | Vysoký |
|--------|-----|-----|------|
| DCF na bázi GDV (50% rizikový diskont) | 3,5 mld. | 4,5 mld. | 5,5 mld. |
| Komparativ surového pozemku (zdola-nahoru) | 1,7 mld. | 3,2 mld. | 5,0 mld. |
| **Konsenzuální rozpětí** | **3-5 mld. CZK** | | |

**Strategický cíl prodávajícího**: 5-8 mld. CZK (kotva nahoře)
**Pravděpodobné rozpětí nabídky PPF**: 3-4,5 mld. CZK (kotva dole)
**Vyjednávací střed**: 4-6 mld. CZK
**Formulace „vyšší miliardy CZK"** odpovídá očekávání 5-8 mld.

### ⚠️ Zjištění DD intervaly stáhnou
Každý materiální red flag v RED-FLAGS.md se promítá do cenové slevy:
- Otázka zástavy dluhopisů Pro Věřitele → -5-10 % (potenciální re-trading / opětovné vyjednávání)
- Petice Zeleneč / napadení ÚP → -3-5 % (rezerva na regulatorní riziko)
- Komplexita duální SPV struktury → -2-3 % (strukturální náklad)
- Každé zjištění soudního sporu → -1-2 %
- Pozdní účetní závěrky → -2-3 % (důvěrnostní diskont)

**Nezhojená zjištění DD** mohou stáhnout transakci na **3-3,5 mld. CZK** (~30-40 % cenového sestřihu z optimistického scénáře).

---

## Dluhová struktura — co víme

### Dluhopisový program (3 série)

| Série | Emitent | Stav | Maximum | Vydáno |
|--------|--------|--------|-----|-------------|
| 1 | RD Rýmařov Invest Develop a.s. | Uzavřeno 2022-06-29 | Neznámé | Neznámé — vyžaduje Sbírku listin |
| 2 | PROGRESUS RD Rýmařov III a.s. (IČO 21515841) | Uzavřeno 2026-01-02 | Neznámé | Neznámé — vyžaduje Sbírku listin |
| 3 | PROGRESUS RD Rýmařov IV a.s. | Aktivní (2026+) | 2 mld. CZK po dobu 10 let | Počáteční emise — malá |

**Vše ručeno PROGRESUS Group a.s.**

### Zjištění 2026-04-01: ~1 mld. CZK agregovaný dluh
Toto číslo odpovídá 2-3 sériím při typické emisi 300-500M každá. Pro potvrzení nutné Sbírka listin.

### Bankovní dluh, akcionářské půjčky, ručení
**Neznámo** — nutný intercompany rozvrh + rozvrh bankovního dluhu.

### Riziko změny kontroly (VŠECHNY série dluhopisů)
Typické české dluhopisy se strukturou ručitele:
- **Putovní právo investora** v případě materiální nepříznivé změny (MAC) — přítomné ve všech retailových emisích
- **Spouštěč CoC** — často přítomný, s prahem materiality
- **Křížové prohlášení splatnosti (cross-default)**: typicky napříč skupinovým dluhem > [X] CZK
- **Akcelerace**: při insolvenci ručitele nebo materiálním selhání

**Pokud PPF akvíruje Nový Zeleneč**, pravděpodobné spouštěče:
1. MAC analýza dluhopisovými investory (Progresus ztrácí významné aktivum)
2. Analýza úvěrového ratingu ručitele (PROGRESUS Group a.s. čistá hodnota aktiv klesá)
3. Náklady žádosti o souhlas dluhopisových investorů (odhad 1-3 % ze zůstatku k prosazení souhlasů)

---

## Finanční zjištění z 2026-04-01 (vyžaduje opětovné načtení zdrojových dokumentů)

### C1: rozpor CASPER 800M vs 229M
**Hypotéza prostoru** pro tento rozdíl:
1. **Účetní hodnota vs reálná hodnota** — historická pořizovací cena 229M, přeceněno na 800M
2. **Hodnota zástavy vs transakční hodnota** — 800M je zastavená částka, 229M je rozvahový náklad
3. **Konsolidované vs samostatné** — 800M dopad na úrovni skupiny, 229M na úrovni entity
4. **Brutto vs netto** — 800M brutto pohledávka, 229M netto po započtení
5. **Různá aktiva v rozsahu** — CASPER může v obou dokumentech odkazovat na různé věci
6. **Chyba** — jedno číslo prostě špatně, vyžaduje korekci

**Zájem PPF**: Cokoli z #1-#5 je vysvětlitelné; #6 je trapné, ale přežitelné. Nebezpečným případem je, pokud byla čísla prezentována různým publikům (dluhopisovým investorům, věřitelům, právníkům prodávajícího) s různým záměrem = zkreslené prohlášení (misrepresentation).

**Cesta k řešení**:
- Znovu načíst zdrojové dokumenty
- Trasovat každou zmínku 800M / 229M ke zdroji
- Sesouhlasit s expertní pomocí
- Vyrobit čisté memo o sesouhlasení

### C4: transakce DANCORE 209,6M
**Hypotéza prostoru**:
1. Vnitropodniková půjčka mezi entitami skupiny
2. Akviziční cena DANCORE (nějaké aktivum nebo entita)
3. Poplatek za služby propojené osoby
4. Nasazení výnosu z dluhopisů

**Zájem PPF**: Pokud transakce s propojenou osobou (RPT) bez dokumentace dle obvyklé ceny → expozice transferových cen (TP) + potenciální skrytá dividenda.

**Cesta k řešení**:
- Identifikovat DANCORE (vyhledávání entity, ARES)
- Vytáhnout transakční dokumenty
- Vyrobit memo o cenách dle obvyklé ceny
- Zdokumentovat schválení představenstva + bankovní potvrzení

### C3: ~1 mld. CZK agregovaný dluh
Pravděpodobně konsolidováno napříč dluhopisovým programem. Viz sekce dluhové struktury výše.

---

## Finanční DD podklady vyžadované pro PPF

### Vrstva 1 (okamžitě)
1. **Auditované účetní závěrky** (posledních 3-5 FY) pro každou entitu v rozsahu transakce
2. **Manažerské účetnictví** (aktuální FY měsíčně)
3. **Rozvrh dluhu**: každý nástroj, emitent, ručitel, zůstatek jistiny, splatnost, kovenanty
4. **Matice CoC kovenantů**: které dluhové nástroje se spouští při akvizici PPF
5. **Registr vnitropodnikových transakcí**
6. **Dokumentace transakcí s propojenými osobami (RPT)**
7. **Normalizace pracovního kapitálu**

### Vrstva 2 (do 1-2 týdnů)
8. **Daňové sesouhlasení** napříč skupinou
9. **Dokumentace transferových cen (TP)**
10. **Registr dluhopisových investorů** s plánem žádosti o souhlas
11. **Bonusy managementu / výplaty při změně kontroly** rozvrh
12. **Historické výkazy peněžních toků**
13. **Rozvrh investičních výdajů (capex)**
14. **Rozpočet + 5letý výhled**

### Vrstva 3 (DD-specifické)
15. **Memo k obraně ocenění** (náš pohled vs pravděpodobný pohled PPF)
16. **Normalizační úpravy** (jednorázové položky)
17. **Analýza kvality výnosů (QoE)** — obvykle vede auditor PPF
18. **Stanovení cíle pracovního kapitálu** pro closing

---

## Finanční mluvící body před hovorem (pro Lukáše)

### Úvodní narativ
> „Nový Zeleneč je vzácné aktivum — 42 ha souvislého greenfieldu poblíž Prahy s historicky prvním přijatým územním plánem z února 2025, schválenou EIA, GDV potenciálem 37,5 mld. CZK a seriózním rozvojovým plánem zaštítěným RD Rýmařov, největším českým výrobcem dřevostaveb. Naše cenové očekávání odráží podkladovou kvalitu aktiva a budoucí potenciál peněžních toků, vhodně rizikově upravený o rozvojová a tržní rizika."

### K odporu vůči ocenění
> „Provedli jsme vlastní PV analýzu při riziko-upraveném WACC a interval reálné hodnoty se pohybuje mezi 4,5 a 6 mld. CZK. Jsme otevřeni diskuzi o strukturálních mechanismech — earn-out doplatky navázané na milníky povolovacího řízení, úschova proti specifickým zjištěním DD — namísto tupého ostřihu ceny."

### K dluhu / dluhopisům
> „Náš dluhopisový program je transparentní, schválený ČNB a dobře distribuovaný. Zůstatek jistiny napříč všemi sériemi je [X] mld. CZK. Zmapovali jsme dopady změny kontroly a máme plán zapojení dluhopisových investorů. Nežádáme vás, abyste tento dluh převzali — souhlasy dluhopisových investorů řešíme my."

### K Pro Věřitele / proveritele.cz
> „O článku víme. Naše prospektová struktura zástav je schválená ČNB a přesná. Specifická obvinění jsme prošli a máme připravenou faktickou odpověď."

### K finančnímu reportingu
> „Náš plán podání odpovídá zákonným lhůtám. Pokud existují konkrétní podání, o kterých si PPF myslí, že jsou opožděná, podělte se o reference a my potvrdíme načasování. Nejsme si vědomi žádných materiálních porušení."

---

*Tento soubor bude aktualizován po opětovném načtení zdrojových dokumentů a sesouhlasení skutečných finančních rozvrhů.*

<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

Na tento soubor odkazují:

- [MASTER-FINDINGS.md](../MASTER-FINDINGS.md) — 03-financial/financial-analysis.md#c1-rozpor-casper-800m-vs-229m (5×)
- [RED-FLAGS.md](../RED-FLAGS.md) — 03-financial/financial-analysis.md#C1 (4×)
- [MISSION-COMPLETE.md](../MISSION-COMPLETE.md) — `03-financial/financial-analysis.md` (2×)
- [03-financial/UZ-BACKFILE-PREP.md](./UZ-BACKFILE-PREP.md) — financial-analysis.md
- [03-financial/bond-stack.html](./bond-stack.html) — financial-analysis.md

## 🏷️ Související soubory (podle shody tagů)

*Žádné silně související soubory (shoda tagů pod prahem 0,3).*

## 🌐 Pohled grafu

[Otevřít v portálu](../index.html) · [Mapa stránek](../sitemap.html) · [Hledat](../search.html) · Focus ID: `03-financial%2Ffinancial-analysis.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
