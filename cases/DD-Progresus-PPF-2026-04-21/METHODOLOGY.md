# Metodika DD — Progresus → PPF

## Postoj

**Podpora DD na straně prodávajícího**. Dvojí mandát:
1. **Defenzivní** — chránit ocenění Progresus; vytvořit narativ; vyhnout se překvapením
2. **Etické zveřejnění** — nezatajovat materiální skutečnosti; strukturovat je

> Neetické zatajení materiálních nepříznivých skutečností by zrušilo transakci a aktivovalo osobní odpovědnost. Úkolem je **řízené předzveřejnění**, nikoli **potlačení**.

## DD scénář PPF (co očekávat)

PPF je **proslulé forenzním DD**. Veřejný přehled: O2, Home Credit, Moneta, Sazka, Česká zbrojovka. Nasazují:

- **Externí právní** — pravděpodobně Kocián Šolc Balaštík, Allen & Overy nebo Weil Gotshal
- **Externí finanční** — Big 4 (Deloitte/EY/KPMG/PwC) — PPF historicky využívá EY
- **Externí technický/environmentální** — specializované firmy pro nemovitosti
- **Interní transakční tým** — extrémně senior, 10–20 let zkušeností s transakcemi
- **Taktiky časového tlaku** — krátká DD okna nutí prodávajícího chybovat
- **Dolování rejstříků** — ARES, OR, katastr, justice.cz, insolvence, dotace, Hlídač státu
- **Mediální archeologie** — každý rozhovor, tisková zpráva, příspěvek na LinkedIn principálů
- **Rozhovory s protistranami** — mohou volat dodavatelům, obcím, bývalým zaměstnancům

### Známá citlivá místa DD u PPF (historicky)
1. **Mimobilanční struktury** — SPV, ručení, zástavy
2. **Transakce se spřízněnými stranami** — vnitroskupinové úvěry, servisní poplatky
3. **Ocas sporů** — probíhající + hrozící + promlčené, které se vrací
4. **Regulatorní/povolovací riziko** — zejména pro developerské projekty
5. **Závislost na klíčové osobě** — riziko zakladatele, retence klíčových zaměstnanců
6. **Daňové expozice** — transferové ceny, řetězce DPH, pravidla CFC
7. **ESG kostlivci** — historické environmentální závazky
8. **Finanční covenanty** — křížová selhání na dluhopisech

## Specifické vektory útoku na Progresus

Na základě zjištění z 2026-04-01 + veřejných znalostí:

| # | Vektor | Proč PPF tuto nit potáhne |
|---|--------|-------------------------------|
| 1 | **Nesrovnalost CASPER 800M vs. 229M** | Různé údaje napříč dokumenty → buď chybný report, nebo skryté závazky |
| 2 | **Skrytá entita RONDAX** | Nezveřejněná dceřiná společnost → manipulace se skutečným vlastnictvím, riziko daňové strukturace |
| 3 | **Agregát dluhu 1 mld.** | Riziko covenantů, expozice křížového selhání, riziko refinancování přecházející na kupujícího |
| 4 | **DANCORE 209,6M** | Nejasný tok prostředků mezi entitami skupiny |
| 5 | **4 řízení vykázána jako 1** | Zatajení sporů → materiální porušení prohlášení a záruk |
| 6 | **HP (Hospodářské Pozemky?) zákaz sdílení** | Regulatorní omezení klíčového aktiva — dopad na cenu |
| 7 | **Studio Perspektiv „3. ne vítěz"** | Tendrové tvrzení / spor o design → IP nebo smluvní riziko |
| 8 | **Emise dluhopisů (Progresus Invest)** | Dluhopisová prospekta + podání u ČNB — křížová reference všeho |
| 9 | **Územní plán Nový Zeleneč** | Obec Zeleneč — územní plán + stavební povolení |
| 10 | **Background JUDr. Zrůsta** | Minulost insolvenčního správce → překryvy s klienty/entitami? |

## Datové zdroje (priorita)

### Tier 1 — Autoritativní (povinné)
- **ARES** — ares.gov.cz (obchodní rejstřík, UBO, statutáři)
- **Obchodní rejstřík** — or.justice.cz (účetní závěrky, UBO, zástavy, ručení)
- **Insolvenční rejstřík** — isir.justice.cz (insolvenční podání)
- **ČÚZK / Nahlížení do KN** — cuzk.cz (katastr — LV 927 + 1326 Zeleneč)
- **Sbírka listin** — justice.cz (stanovy, výroční zprávy, audit)

### Tier 2 — Polo-autoritativní (křížová kontrola)
- **Hlídač státu** — hlidacstatu.cz (veřejné zakázky, dotace, politické dary)
- **ČNB** — cnb.cz (dluhopisové prospekty, FX, makro)
- **ESM / CERD** — sankční prověrka
- **Územní plán** — obec Zeleneč (územní plán + usnesení)

### Tier 3 — Média + zpravodajství
- **Hospodářské noviny, Seznam Zprávy, iRozhlas, E15, Forbes CZ**
- **Archivy rozhodnutí soudů** — nalus.usoud.cz, nssoud.cz
- **LinkedIn** — klíčoví lidé, bývalí zaměstnanci
- **Archive.org** — předchozí stavy webů progresusinvest.cz, rdrymarov.cz atd.

## Důkazní standardy

Každé zjištění v MASTER-FINDINGS.md musí mít:
- `severity` (CRITICAL/HIGH/MEDIUM/LOW)
- `finding` (jednořádkové)
- `evidence` (URL zdroje nebo ID dokumentu)
- `retrieval_date` (ISO 8601)
- `status` (OPEN / DISCLOSED / MITIGATED / RESOLVED)
- `owner` (kdo řídí nápravu)
- `PPF_risk` (co PPF udělá, pokud to najde)
- `defense` (náš narativ + dokumenty připravené k použití)

## Důvěrnost

Vše v tomto pracovním prostoru je **ekvivalentem advokátního pracovního produktu** — zacházet jako s privilegovaným materiálem. Nesdílet mimo: Lukáš Zrůst, Michal Dvořák, Tomáš Korčák, Karel Duchoň, Václav Faraga, externí právní zástupci.

<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

*Žádné příchozí odkazy ve znalostním grafu.*

## 🏷️ Související soubory (podle shody tagů)

*Žádné silně související soubory (shoda tagů pod prahem 0,3).*

## 🌐 Pohled grafu

[Otevřít v portálu](./index.html) · [Mapa stránek](./sitemap.html) · [Hledat](./search.html) · Focus ID: `METHODOLOGY.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
