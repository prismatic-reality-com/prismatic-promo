# 05-osint — Zpravodajství z otevřených zdrojů + governance PPF

[← Zpět na 00-INDEX.md](../reader.html?file=00-INDEX.md) | [🏠 Portál](../index.html) | [📊 Mapa governance](../01-intel/ppf-governance.html)

> **Účel** — Surová stopa OSINT + architektonické vzorce. Mapuje akviziční trychtýř v insolvenci (Konreo → Casper → Progresus — precedent Vitrablok) a interní reorganizaci governance PPF po Šmejcovi.

---

## 📂 Soubory v tomto adresáři

| Soubor | Účel | Jednořádkové shrnutí | Nadřazený index |
|------|---------|----------------|--------------|
| [osint-findings-2026-04-21.md](../reader.html?file=05-osint/osint-findings-2026-04-21.md) | Surový denní OSINT log | Surový log pull-ů z pass-4 ARES + Hlídač + justice.cz + ISIR | [00-INDEX](../reader.html?file=00-INDEX.md) |
| [insolvency-acquisition-pattern.md](../reader.html?file=05-osint/insolvency-acquisition-pattern.md) | 🟠 Architektonický vzorec | Vzorec akvizic v insolvenci Konreo → Casper → Progresus (precedent Vitrablok) | [RED-FLAGS RF-16](../reader.html?file=RED-FLAGS.md) |
| [ppf-side-deep/PPF-GOVERNANCE-MAP.md](../reader.html?file=05-osint/ppf-side-deep/PPF-GOVERNANCE-MAP.md) | 🔴 Mapa governance PPF | Interní reorganizace PPF (červen 2025+, redomicil NL→CZ 2026-04-01), 20 entit PPF + 22 entit Progresus | [RED-FLAGS RF-32](../reader.html?file=RED-FLAGS.md) |
| `ppf-side-deep/` | Surové ARES JSONy | 13 pull-ů entit ARES + 3 výpisy z českého rejstříku (Tošek, Jirásková, Kellnerová) + screeny | — |
| `ppf-side-deep/extended/` | Rozšířené pully | Dodatečná hloubka OSINT (artefakty rozšířeného výzkumu) | — |

---

## 🔑 Klíčová zjištění

- 🟠 **Vzorec akvizic vycházejících z insolvence je architektonický, nikoli náhodný** (RF-16). Principálové Progresu (historicky Zrůst jako insolvenční správce) získávají aktiva s distressed původem prostřednictvím struktur, jež extrahují hodnotu napříč zastřešením Konreo/Casper/Progresus. Vitrablok je publikovaným precedentem.
- 🔴 **Redomicil PPF NL→CZ účinný k 2026-04-01** (RF-32) — trvalá strukturální událost shodující se s reorganizací představenstva. Vytváří éru nových co-CEO (Jirásková + Stoessel), kteří přebírají dealovou tezi éry Šmejce. **Páka**: nové vedení je pod interním tlakem realizovat první principální transakci.
- 🔴 **22 entit Progresu + 20 entit PPF** zmapováno s potvrzenými IČO — umožňuje čistý sken konfliktů mezi entitami.
- 🔴 **Výpisy Tošek, Jirásková, Kellnerová z českého rejstříku** shromážděny — křížová reference proti hn.cz potvrdila RF-30 (manželský vztah Jirásková ↔ Jirásko).
- 🟠 **AMALAR Czech s.r.o. (IČO 19696477) staženo** — podporuje RF-31 (stopa zdroje financí pro výplatu Kellnera Jr. ve výši USD 1,9 mld.).

---

## 🔗 Křížové odkazy

- Konzumenti struktury entit → [02-entity/entity-structure.md](../reader.html?file=02-entity/entity-structure.md), [02-entity/confirmed-entities.md](../reader.html?file=02-entity/confirmed-entities.md)
- Dossiery na úrovni osob postavené na tomto OSINT → [01-intel/ppf-people-dossiers.md](../reader.html?file=01-intel/ppf-people-dossiers.md), [01-intel/principals-deep-osint.md](../reader.html?file=01-intel/principals-deep-osint.md)
- Precedent Vitrablok → [03-financial/financial-analysis.md](../reader.html?file=03-financial/financial-analysis.md) (rekonciliace CASPER 800M/229M)
- Výstup soudních dokumentů → [04-legal/isir-court-sweep.md](../reader.html?file=04-legal/isir-court-sweep.md), [04-legal/DANCORE-FORENSIC-DOSSIER.md](../reader.html?file=04-legal/DANCORE-FORENSIC-DOSSIER.md)
- Stopa toku financování → [01-intel/ppf-deal-financing-analysis.md](../reader.html?file=01-intel/ppf-deal-financing-analysis.md)
- Evidence-manifest URL + archivní zachycení → [07-sources/evidence-manifest.md](../reader.html?file=07-sources/evidence-manifest.md)
- OSINT k paralelnímu uchazeči Karlín Group → [01-intel/karlin-group-parallel-bidder-dossier.md](../reader.html?file=01-intel/karlin-group-parallel-bidder-dossier.md)

---

## ❓ Otevřené otázky / mezery

- **Delta dealové teze éry Šmejce vs. Jirásková-Stoessel** — schválilo představenstvo akvizici Nového Zelenče skutečně za Šmejce, nebo jde o iniciativu nového vedení? Určuje páku interního tlaku.
- **Hlasovací blok Kellnerová + 3 dcery vs. management Stoessel/Jirásková** — existuje veřejně pozorovatelné interní napětí?
- **Trasa financování AMALAR USD 1,9 mld.** — mezera ve veřejných podáních. Potřeba stopa souhlasu ČNB dle § 23a ZoB.
- **Důsledky Vitrabloku** — návazná data o uspokojení věřitelů poté, co Casper/Progresus aktivum vytěžil; precedent pro agresivní covenant postoj PPF.
- **Rozsah mandátu PPF reality 2** — single-asset vs. multi-asset SPV (otevřená otázka sdílená s 01-intel).

---

## ⚡ Rychlé akce

- Pokud potřebujete **pochopit interní politiku PPF** → přečtěte [ppf-side-deep/PPF-GOVERNANCE-MAP.md](../reader.html?file=05-osint/ppf-side-deep/PPF-GOVERNANCE-MAP.md) (celé).
- Pokud potřebujete **vysvětlit obavy z „insolvenčního vzorce"** → přečtěte [insolvency-acquisition-pattern.md](../reader.html?file=05-osint/insolvency-acquisition-pattern.md) + [../PPF-PLAYBOOK.md](../reader.html?file=PPF-PLAYBOOK.md) (scénář), dotaz k architektuře.
- Pokud potřebujete **ověřit IČO** → ARES JSONy v [ppf-side-deep/](./ppf-side-deep/).
- Pokud potřebujete **zpětně vysledovat surový OSINT z Pass-4** → [osint-findings-2026-04-21.md](../reader.html?file=05-osint/osint-findings-2026-04-21.md) (denní log).
- Pokud potřebujete **citovat OSINT zdroj při zveřejnění v SPA** → křížově odkažte do [07-sources/evidence-manifest.md](../reader.html?file=07-sources/evidence-manifest.md) jako první.

---

📊 **Interaktivní přehledy** → [../01-intel/ppf-governance.html](../01-intel/ppf-governance.html) (organizační schéma governance PPF) · [../01-intel/stakeholder-map.html](../01-intel/stakeholder-map.html) (mezisubjektová síť Progresus-PPF, schéma trychtýře insolvenčního vzorce)

---

*Naposledy aktualizováno: 2026-04-21 | Verze 1.0 | Připravenost: 3/3 markdown + 13 ARES JSONů + 3 výpisy z českého rejstříku*

<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

Na tento soubor odkazují:

- [01-intel/README.md](../01-intel/README.md) — 05-osint/README.md (2×)
- [02-entity/README.md](../02-entity/README.md) — 05-osint/README.md (2×)
- [02-entity/raw-cuzk/README.md](../02-entity/raw-cuzk/README.md) — 05-osint/README.md (2×)
- [03-financial/README.md](../03-financial/README.md) — 05-osint/README.md (2×)
- [04-legal/README.md](../04-legal/README.md) — 05-osint/README.md (2×)
- [05-osint/ppf-side-deep/README.md](./ppf-side-deep/README.md) — ← Zpět na 05-osint (2×)
- [07-sources/README.md](../07-sources/README.md) — 05-osint/README.md (2×)
- [00-INDEX.md](../00-INDEX.md) — 05-osint/README.md
- [01-intel/karlin-group-parallel-bidder-dossier.md](../01-intel/karlin-group-parallel-bidder-dossier.md) — 05-osint/README.md
- [01-intel/ppf-deal-financing-analysis.md](../01-intel/ppf-deal-financing-analysis.md) — 05-osint/README.md
- [01-intel/ppf-people-dossiers.md](../01-intel/ppf-people-dossiers.md) — 05-osint/README.md
- [01-intel/principals-deep-osint.md](../01-intel/principals-deep-osint.md) — 05-osint/README.md
- [02-entity/confirmed-entities.md](../02-entity/confirmed-entities.md) — 05-osint/README.md
- [02-entity/entity-structure.md](../02-entity/entity-structure.md) — 05-osint/README.md
- [03-financial/financial-analysis.md](../03-financial/financial-analysis.md) — 05-osint/README.md

## 🏷️ Související soubory (podle shody tagů)

- [07-sources/README.md](../07-sources/README.md) — podobnost 1.00 · 07-sources — Manifest důkazů a řetězec původu
- [01-intel/README.md](../01-intel/README.md) — podobnost 1.00 · 01-intel — Kontext transakce, stakeholdeři, komunikace
- [02-entity/README.md](../02-entity/README.md) — podobnost 1.00 · 02-entity — Korporátní struktura, katastr, řetězec vlastnických titulů
- [03-financial/README.md](../03-financial/README.md) — podobnost 1.00 · 03-financial — Dluhopisy, listiny, daňová struktura
- [04-legal/README.md](../04-legal/README.md) — podobnost 1.00 · 04-legal — Soudní spory, Povolení, Životní prostředí, UBO

## 🌐 Pohled grafu

[Otevřít v portálu](../index.html) · [Mapa stránek](../sitemap.html) · [Hledat](../search.html) · Focus ID: `05-osint%2FREADME.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
