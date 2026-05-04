# ppf-side-deep — governance PPF + průzkum OSINT na exekutivu

[← Zpět na 05-osint](../README.md) | [📘 Mapa governance](./PPF-GOVERNANCE-MAP.md) | [🏠 Portál](../../index.html)

> **Účel** — OSINT na straně kupujícího: kdo zasedá kde v governance řetězci PPF Real Estate, kdo podepisuje SPA, kdo vlastní koho a jakou historickou expozici nese každý exekutivec. Syntéza v [`PPF-GOVERNANCE-MAP.md`](./PPF-GOVERNANCE-MAP.md). Surové materiály níže napájejí [`../../01-intel/ppf-people-dossiers.md`](../../01-intel/ppf-people-dossiers.md).

---

## 📂 Struktura

```
ppf-side-deep/
├── README.md                               ← jste zde
├── PPF-GOVERNANCE-MAP.md                   ← syntetizovaná mapa governance (KLÍČOVÝ výstup)
│
├── ares-amalar-holding-19696477.json       ← 13 surových ARES výpisů (per IČO)
├── ares-karlin-06974830.json
├── ares-karlin-24160776.json
├── ares-karlin-26184338.json
├── ares-karlin-27894053.json
├── ares-ppf-10907718.json
├── ares-ppf-24225657.json
├── ares-ppf-24654744.json
├── ares-ppf-24908151.json
├── ares-ppf-24908487.json
├── ares-ppf-25099345.json
├── ares-ppf-27638987.json
├── ares-ppf-29030072.json
│
├── extended/                               ← Záznamy z Veřejného rejstříku (VR) — rozšířené
│   ├── vr-06974830.json                    (koncern Karlín Group)
│   ├── vr-10907718.json                    (PPF Financial Holdings a.s.)
│   ├── vr-19696477.json                    (AMALAR HOLDING s.r.o.)
│   ├── vr-24160776.json                    (Karlín Group Real Estate)
│   ├── vr-24225657.json                    (PPF RE Consulting s.r.o.)
│   ├── vr-24654744.json                    (PPF reality 2 s.r.o.)
│   ├── vr-24908151.json                    (PPF Holdings a.s.)
│   ├── vr-24908487.json                    (PPF Group a.s.)
│   ├── vr-25099345.json                    (PPF a.s. — mateřská loď)
│   ├── vr-27894053.json                    (sesterská entita Karlín Group)
│   ├── vr-29030072.json                    (PPF reality a.s.)
│   └── vr-47116129.json                    (historická entita PPF, 238 KB)
│
├── jiri-tosek-czech-registry.txt           (HLAVNÍ vedoucí transakce — CEO PPF RE)
├── katerina-jiraskova-czech-registry.txt   (Co-CEO PPF)
├── renata-kellnerova-czech-registry.txt    (UBO — Renáta Kellnerová)
├── ppf-re-holding-business.txt             (593 KB agregovaný digest tisku + ARES)
└── tosek-screen.json                       (51 KB strojově čitelný screening profil Tošek)
```

---

## 🧭 K čemu slouží jednotlivé sady souborů

### Surový ARES (13 souborů)

Strukturovaný JSON z `ares.gov.cz/ekonomicke-subjekty-v-be` — pro každé IČO v perimetru PPF + Karlín Group: název společnosti, právní forma, sídlo, IČO, DIČ, registrační historie, seznam statutárního orgánu.

**Pokrytí**:
- **9 entit PPF** — sladěno s `../../03-financial/raw/ppf/` (stejná IČO)
- **4 entity Karlín Group** — 06974830, 24160776, 26184338, 27894053

Karlín Group je sledována jako **paralelní uchazeč** — viz `../../01-intel/karlin-group.md` a `../../04-legal/` pro analýzu rizika paralelního uchazeče.

### Rozšířené záznamy z Veřejného rejstříku (VR) — `extended/`

VR je **rozšířený** pohled na OR. Zahrnuje:
- Historii exekutivy (každá osoba, každá funkce, každé od/do datum)
- Složení tříd akcií (kapitál, vklad, splacení)
- Historické změny (každý dodatek stanov / společenské smlouvy)
- Zveřejnění dceřiných společností (pokud konsolidováno)

Použito pro **úplný governance řetězec** zpět do roku 2002 (AMALAR Holding s.r.o. byl založen teprve 2022-05-20 — jakákoli SPA bude podepsána touto novou entitou, která má nulovou historickou stopu. Označeno.).

VR pulleno přes:
```bash
curl -sS -H 'Accept: application/json' \
  "https://or.justice.cz/api/rejstrik/search/$ICO/extended" \
  > extended/vr-$ICO.json
```

(Endpoint je neoficiální, ale stabilní scrape; schéma se mění zřídka.)

### Snímky rejstříku exekutivy (3 × `.txt`)

Strojově sebrané výpisy všech entit-držených-X pro každého exekutivce PPF:

| Soubor | Subjekt | Proč nás zajímá |
|------|---------|-------------|
| `jiri-tosek-czech-registry.txt` | Jiří Tošek (CEO PPF RE) | **Vedoucí transakce** — bude podepisovat SPA |
| `katerina-jiraskova-czech-registry.txt` | Kateřina Jirásková (Co-CEO PPF) | Signatář na úrovni skupiny, eskalační cesta |
| `renata-kellnerova-czech-registry.txt` | Renáta Kellnerová | UBO — skutečný majitel |

Každý soubor uvádí každou českou entitu, kde jednotlivec držel statutární pozici (historicky + aktuálně), s daty od/do. Napájí dossiery v [`../../01-intel/ppf-people-dossiers.md`](../../01-intel/ppf-people-dossiers.md).

### `ppf-re-holding-business.txt` (593 KB)

Agregovaný tiskový + ARES + zpravodajský přehled pokrývající aktivity PPF Real Estate Holding (odprodeje, akvizice, dluhopisy, jmenování ředitelů). **Prohledávejte tento soubor** pro jakoukoli ověřovací kontrolu. Příklad:
```bash
grep -n 'Zeleneč\|Mstětice\|Progresus' /Users/korczis/dev/prismatic-platform/cases/DD-Progresus-PPF-2026-04-21/05-osint/ppf-side-deep/ppf-re-holding-business.txt
```

### `tosek-screen.json` (51 KB)

Strukturovaný OSINT prověřovací profil specificky pro Jiřího Tošek: tiskové zmínky, předchozí transakce, citované valuace, kontroverzní transakce. Formát:

```json
{
  "subject": "Jiří Tošek",
  "sources": [ {"url": "...", "date": "...", "quote": "..."} ],
  "entities": [ ... ],
  "flags": [ ... ]
}
```

Použito pro sestavení předjednávacího briefingu v [`../../PPF-PLAYBOOK.md`](../../PPF-PLAYBOOK.md) (scénář).

---

## 🧠 `PPF-GOVERNANCE-MAP.md` — syntetizovaný výstup

[`PPF-GOVERNANCE-MAP.md`](./PPF-GOVERNANCE-MAP.md) je jednostránková odpověď na „kdo podepisuje, kdo kontroluje, kdo eskaluje". Postavena z:

1. ARES (kdo je kde registrován)
2. Rozšířený VR (kdo držel jakou roli v čase)
3. Rejstřík exekutivy (jaké další klobouky každý exekutivec nosí)
4. Tiskový digest (historické chování v transakcích)

**Přečtěte tento soubor jako první**, surové výpisy používejte pouze k validaci nebo hloubkovému prozkoumání. Mapa je verzí přívětivou pro zpracování LLM.

---

## 🔗 Křížové odkazy

- **Dossiery osob PPF** (úplný biografický detail) → [`../../01-intel/ppf-people-dossiers.md`](../../01-intel/ppf-people-dossiers.md)
- **Lavička poradců PPF** (kdo bude pravděpodobně v právním/finančním týmu na straně kupujícího) → [`../../01-intel/advisor-bench-research.md`](../../01-intel/advisor-bench-research.md)
- **Karlín Group** (paralelní uchazeč, považujte za konfrontačního) → [`../../01-intel/karlin-group-parallel-bidder-dossier.md`](../../01-intel/karlin-group-parallel-bidder-dossier.md)
- **Scénář PPF** (20 předzodpovězených otázek pro jednání) → [`../../PPF-PLAYBOOK.md`](../../PPF-PLAYBOOK.md)
- **Surové finance** — stejná IČO stažená z pohledu OR/SL → [`../../03-financial/raw/ppf/`](../../03-financial/raw/ppf/)
- **Stáří AMALAR Holding (varování)** (založeno 2022-05, pravděpodobně signatář SPA) → [`../../RED-FLAGS.md`](../../RED-FLAGS.md) + [`../osint-findings-2026-04-21.md`](../osint-findings-2026-04-21.md)

---

## 🔒 Známé mezery

- **V datovém pokoji zatím není dopis o vypořádání UBO** — naše rozšířená VR stažení zobrazují Renátu Kellnerovou jako UBO přes mateřskou entitu, ale SPA bude vyžadovat čerstvou UBO deklaraci načasovanou k podpisu.
- **Záměr Karlín Group jako uchazeče není potvrzen** — máme strukturu entity, ale žádnou uniknutou transakční tezi. Považujte za „vysoce pravděpodobného paralelního uchazeče", dokud nebude vyvráceno.
- **AMALAR Holding je dvouletá schránková společnost** (IČO 19696477) — pravděpodobně SPV pro transakci. Žádná stopa, žádná historická podání podstaty. Očekávejte pojištění prohlášení a záruk vstřícné k prodávajícímu.

---

## 📜 Poznámka k licenci

Data ARES / VR jsou veřejná dle českého práva (zák. 304/2013 Sb.). Tiskový přehled v `ppf-re-holding-business.txt` agreguje citace z více zdrojů — jednotlivá přiřazení jsou zachována přímo s každým citovaným blokem. Použití pro interní DD je neomezené; externí publikace by vyžadovala přezkoumání zdroj po zdroji.

---

*Naposledy aktualizováno: 2026-04-21 | 13 ARES + 12 VR + 3 rejstříky + 1 přehled + 1 prověření = 30 surových artefaktů | Datum stažení: 2026-04-21 ~13:17–13:25 místního času*

<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

Na tento soubor odkazují:

- [01-intel/advisor-bench-research.md](../../01-intel/advisor-bench-research.md) — 05-osint/ppf-side-deep/README.md
- [01-intel/karlin-group-parallel-bidder-dossier.md](../../01-intel/karlin-group-parallel-bidder-dossier.md) — 05-osint/ppf-side-deep/README.md
- [01-intel/ppf-people-dossiers.md](../../01-intel/ppf-people-dossiers.md) — 05-osint/ppf-side-deep/README.md
- [05-osint/README.md](../README.md) — 05-osint/ppf-side-deep/README.md
- [05-osint/osint-findings-2026-04-21.md](../osint-findings-2026-04-21.md) — 05-osint/ppf-side-deep/README.md
- [05-osint/ppf-side-deep/PPF-GOVERNANCE-MAP.md](./PPF-GOVERNANCE-MAP.md) — 05-osint/ppf-side-deep/README.md
- [BACKLINKS-AUDIT.md](../../BACKLINKS-AUDIT.md) — 05-osint/ppf-side-deep/README.md
- [PPF-PLAYBOOK.md](../../PPF-PLAYBOOK.md) — 05-osint/ppf-side-deep/README.md
- [RED-FLAGS.md](../../RED-FLAGS.md) — 05-osint/ppf-side-deep/README.md

## 🏷️ Související soubory (podle shody tagů)

*Žádné silně související soubory (shoda tagů pod prahem 0,3).*

## 🌐 Pohled grafu

[Otevřít v portálu](../../index.html) · [Mapa stránek](../../sitemap.html) · [Hledat](../../search.html) · Focus ID: `05-osint%2Fppf-side-deep%2FREADME.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
