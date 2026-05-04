# raw-cuzk — Surové ArcGIS staženiny ČÚZK (Mstětice + Zeleneč)

[← Zpět na 02-entity](../README.md) | [🔴 Cadastre forensics](../cuzk-cadastre-forensics.md) | [🏠 Portál](../../index.html)

> **Účel** — Surový ArcGIS REST JSON stažený z veřejných WMS/WFS endpointů ČÚZK. Vstup pro [`cuzk-cadastre-forensics.md`](../cuzk-cadastre-forensics.md) (seznam parcel, výměry, příznak digitální mapy). Není náhradou za placený pull LV 927 / LV 1326 přes dálkový přístup.

---

## 📂 Soubory

| Soubor | Velikost | Typ | Co reprezentuje |
|--------|---------:|-----|-----------------|
| `ku-mstetice-metadata.json` | 2.2 KB | ArcGIS feature | **k.ú. Mstětice — kód 792764**. Schéma polí + 1 feature: object ID 17593, nadřazená obec 539066 (Zeleneč), výměra ≈ 4 288 152 m² (428,8 ha), obvod ≈ 11,34 km, příznak digitální mapy = "1", platné od 2015-08-14 |
| `ku-zelenec-metadata.json` | 0.5 KB | ArcGIS feature | **k.ú. Zeleneč** — záložní reference. Použito pouze k potvrzení, že Mstětice (792764), **NIKOLI** 693685, je správné katastrální území pro perimetr transakce |
| `mstetice-all-parcels-2026-04-21.json` | 160 KB | ArcGIS feature collection | Plný dump na úrovni parcel pro k.ú. 792764 — každý feature obsahuje ID parcely, číslo LV (list vlastnictví), výměru, druh pozemku, způsob využití. Zdroj pro tvrzení „135,1 ha orné půdy v 11 parcelách“ a identifikaci 73/1 + 178/1 = 41,69 ha |

---

## 🔑 Co je zde (s křížovými odkazy)

- **k.ú. Mstětice je 792764** — nikoli 693685, nikoli Zeleneč. Toto je základní skutečnost, která fixuje perimetr transakce. Viz [`../cuzk-cadastre-forensics.md`](../cuzk-cadastre-forensics.md) §1.
- **Celková výměra katastrálního území** — 428,8 ha podle `ku-mstetice-metadata.json` (`st_area(shape) = 4,288,152 m²`).
- **11 kandidátních parcel orné půdy** — extrahováno z `mstetice-all-parcels-2026-04-21.json`, celkem 135,1 ha orné půdy. Dokumentováno s výměrami a druhem pozemku v [`../cuzk-cadastre-forensics.md`](../cuzk-cadastre-forensics.md) §3.
- **Kandidát rozsahu transakce 42 ha** — parcela 73/1 (24,85 ha) + parcela 178/1 (16,84 ha) = **41,69 ha**. Odpovídá cíli zveřejněné výměře v rámci 0,31 ha.
- **Příznak digitální mapy = 1** — Mstětice mají digitální katastrální mapu, takže LV pully jsou strojově čitelné. Snižuje náklad na pull na cca 50 tis. Kč za oba LV.

---

## 🔄 Jak znovu načíst / obnovit

Veřejný ArcGIS endpoint ČÚZK použitý pro tyto pully:

```
https://services.cuzk.cz/arcgis/rest/services/RUIAN/RUIAN_KU_I/MapServer/0/query
```

Příklad (k.ú. Mstětice, všechna pole, JSON):

```bash
curl -sS --get 'https://services.cuzk.cz/arcgis/rest/services/RUIAN/RUIAN_KU_I/MapServer/0/query' \
  --data-urlencode 'where=kod=792764' \
  --data-urlencode 'outFields=*' \
  --data-urlencode 'f=pjson' \
  > /Users/korczis/dev/prismatic-platform/cases/DD-Progresus-PPF-2026-04-21/02-entity/raw-cuzk/ku-mstetice-metadata.json
```

Pull na úrovni parcel (všechny parcely v k.ú. 792764):

```bash
curl -sS --get 'https://services.cuzk.cz/arcgis/rest/services/RUIAN/Parcely/MapServer/0/query' \
  --data-urlencode 'where=katuzekod=792764' \
  --data-urlencode 'outFields=*' \
  --data-urlencode 'f=pjson' \
  --data-urlencode 'resultRecordCount=2000' \
  > /Users/korczis/dev/prismatic-platform/cases/DD-Progresus-PPF-2026-04-21/02-entity/raw-cuzk/mstetice-all-parcels-2026-04-21.json
```

Pokud endpoint vrátí kurzor stránkování (`exceededTransferLimit: true`), opakujte dotaz s `resultOffset`.

---

## 🔒 Známé mezery — vyžadován placený pull

ČÚZK má **data o vlastnictví (LV — list vlastnictví) blokovaná captchou** za placeným portálem dálkového přístupu. Veřejný ArcGIS feed poskytuje parcely, výměry a kódy využití, ale **nikoli vlastníka, věcná břemena ani zástavy**.

| LV | k.ú. | Stav | Vyžadováno pro |
|----|------|------|----------------|
| **LV 927** | 792764 | ⛔ blokováno captchou — placený pull ZATÍM NEPROVEDEN | Potvrzení aktuálního vlastníka cílových 42 ha parcel + seznam zástav/věcných břemen (status MARSEA MIA) |
| **LV 1326** | 792764 | ⛔ blokováno captchou — placený pull ZATÍM NEPROVEDEN | Potvrzení rozdělení titulu mezi SPV III. alpha a případné ponechané parcely |

**Akce**: položka P0, cca 50 tis. Kč, 72 h. Objednat přes [ČÚZK dálkový přístup](https://nahlizenidokn.cuzk.cz/VyberKatastralniUzemi.aspx) s autorizovanou identitou. Viz [`../cuzk-cadastre-forensics.md`](../cuzk-cadastre-forensics.md) §9 (seznam mezer v data-roomu).

**Bez těchto LV jsou title reps v SPA nepokryté.** Memo pro představenstvo ([`../../06-reports/MASTER-ACTION-PLAN.md`](../../06-reports/MASTER-ACTION-PLAN.md) P0-08) vede toto jako blokátor před podpisem.

---

## 🔗 Křížové odkazy

- **Syntetizovaná analýza** → [`../cuzk-cadastre-forensics.md`](../cuzk-cadastre-forensics.md)
- **Řetězec titulu** (kdo komu prodal, Quinlan → Nuka → Lébr → Progresus) → [`../land-title-chain.md`](../land-title-chain.md)
- **Expozice DANCORE na těchto parcelách** → [`../../04-legal/DANCORE-FORENSIC-DOSSIER.md`](../../04-legal/DANCORE-FORENSIC-DOSSIER.md)
- **Red flags týkající se LV 927/1326** → [`../../RED-FLAGS.md`](../../RED-FLAGS.md) RF-9..12
- **Dashboard katastru** → [`../entity-graph.html`](../entity-graph.html)

---

## 📜 Poznámka k licenci

Veřejná REST data ČÚZK ArcGIS jsou uvolněna pod [CC-BY 4.0 / OpenData ČÚZK](https://cuzk.gov.cz/). Redistribuce je povolena; atribuce ČÚZK je vyžadována u jakéhokoli odvozeného mapového produktu. Tyto surové JSON dumpy jsou informační staženiny a pro interní DD použití nemají žádné licenční omezení pro další šíření.

---

*Naposledy aktualizováno: 2026-04-21 | 3 soubory, 162 KB celkem | Datum pullu: 2026-04-21 ~13:55 místního času*

<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

Na tento soubor odkazují:

- [_assets/README.md](../../_assets/README.md) — 02-entity/raw-cuzk/README.md (2×)
- [01-intel/README.md](../../01-intel/README.md) — 02-entity/raw-cuzk/README.md
- [02-entity/README.md](../README.md) — 02-entity/raw-cuzk/README.md
- [02-entity/cuzk-cadastre-forensics.md](../cuzk-cadastre-forensics.md) — 02-entity/raw-cuzk/README.md
- [02-entity/land-title-chain.md](../land-title-chain.md) — 02-entity/raw-cuzk/README.md
- [03-financial/README.md](../../03-financial/README.md) — 02-entity/raw-cuzk/README.md
- [04-legal/DANCORE-FORENSIC-DOSSIER.md](../../04-legal/DANCORE-FORENSIC-DOSSIER.md) — 02-entity/raw-cuzk/README.md
- [05-osint/README.md](../../05-osint/README.md) — 02-entity/raw-cuzk/README.md
- [06-reports/MASTER-ACTION-PLAN.md](../../06-reports/MASTER-ACTION-PLAN.md) — 02-entity/raw-cuzk/README.md
- [07-sources/README.md](../../07-sources/README.md) — 02-entity/raw-cuzk/README.md
- [BACKLINKS-AUDIT.md](../../BACKLINKS-AUDIT.md) — 02-entity/raw-cuzk/README.md
- [RED-FLAGS.md](../../RED-FLAGS.md) — 02-entity/raw-cuzk/README.md

## 🏷️ Související soubory (podle shody tagů)

- [07-sources/README.md](../../07-sources/README.md) — podobnost 0.33 · 07-sources — Manifest důkazů a řetězec původu
- [01-intel/README.md](../../01-intel/README.md) — podobnost 0.33 · 01-intel — Kontext transakce, stakeholdeři, komunikace
- [02-entity/README.md](../README.md) — podobnost 0.33 · 02-entity — Korporátní struktura, katastr, řetězec vlastnických titulů
- [03-financial/README.md](../../03-financial/README.md) — podobnost 0.33 · 03-financial — Dluhopisy, listiny, daňová struktura
- [05-osint/README.md](../../05-osint/README.md) — podobnost 0.33 · 05-osint — Zpravodajství z otevřených zdrojů + governance PPF

## 🌐 Pohled grafu

[Otevřít v portálu](../../index.html) · [Mapa stránek](../../sitemap.html) · [Hledat](../../search.html) · Focus ID: `02-entity%2Fraw-cuzk%2FREADME.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
