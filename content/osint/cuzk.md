+++
title = "CUZK"
weight = 12
[extra]
icon = "document-text"
color = "blue"
category = "czech"
type = "company"
module = "Cuzk"
source_type = "registry"
description = "Czech Cadastral Office - land and property ownership registry for the Czech Republic"
has_api = true
url = "https://www.cuzk.cz"
rate_limit = "DPMR/WSDP services, registered access required"
capabilities = ["Property Search", "Ownership Lookup", "Parcel Information", "Building Registry", "Title Deed Access", "Geospatial Data"]
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
word_count = 1735
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["CUZK", "Czech", "Cadastral", "Office", "Republic", "osint", "Prismatic Platform", "Property", "DPMR"]
tags = ["osint", "czech", "cuzk", "prismatic"]
quality_score = 90
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "CUZK - Prismatic Platform"
+++

## Overview

CUZK (Cesky urad zememericky a katastralni -- Czech Office for Surveying, Mapping, and Cadastre) is the central state administration authority responsible for maintaining the official land [registry](@/glossary/registry-otp.md) (katastr nemovitosti) of the Czech Republic. The cadastral system represents one of the most comprehensive and authoritative property registries in Central Europe, containing records of all real estate ownership, encumbrances, liens, easements, mortgages, and other rights and obligations attached to approximately 23 million parcels across the entire territory of the Czech Republic.

The Czech cadastral system traces its origins to the Austrian Empress Maria Theresa's 1749 land registry reforms, making it one of the oldest continuously maintained property registries in Europe. The modern system was significantly reformed after 1989 during the property restitution process following the end of communist rule, when millions of property rights were re-established, creating one of the most complex cadastral transitions in European history. Today, the cadastre operates under Act No. 256/2013 Sb. (the Cadastral Act) and is maintained by 14 regional cadastral offices (katastralni urady) coordinated by CUZK.

For [OSINT](@/glossary/osint.md) investigations, CUZK is an indispensable resource for asset tracing, wealth profiling, beneficial ownership analysis, and financial crime investigation. Property ownership records reveal the real estate holdings of individuals and companies, enabling investigators to assess declared wealth against observable asset positions, identify property transfers that may indicate asset hiding or money laundering, and discover undisclosed connections between entities through shared property ownership or co-located addresses.

The cadastral system provides two complementary views of property data. The descriptive component (popisne udaje) records ownership, rights, restrictions, and property attributes in structured database form. The geodetic component (geometricky plan) provides precise spatial definitions of parcel boundaries, building footprints, and geographic context through digital cadastral maps available through the CUZK geoportal.

CUZK data access operates on a tiered model. Basic lookups are available for free through the nahlizeni.cuzk.cz web portal, providing read-only access to current ownership and basic property information. Detailed access to title deeds (listy vlastnictvi), historical records, and bulk data requires registration with the DPMR (Dalkovy pristup k udajum katastru nemovitosti) remote access service, which charges per-query fees. Professional users (banks, law firms, notaries) typically maintain DPMR subscriptions for continuous access.

## Data Sources and Coverage

### Cadastral Database

The cadastral database is the single authoritative source for all real estate ownership and rights in the Czech Republic. It is maintained in real-time by 14 regional cadastral offices processing approximately 1 million transactions annually.

| Metric | Coverage |
|--------|----------|
| **Total Parcels** | ~23,000,000 |
| **Total Buildings** | ~5,500,000 |
| **Ownership Records** | ~15,000,000 active entries |
| **Cadastral Territories** | 13,027 |
| **Title Deeds (LV)** | ~10,000,000 active |
| **Annual Transactions** | ~1,000,000 |
| **Data Accuracy** | >99.5% (legal guarantee) |
| **Geographic Coverage** | 100% of Czech territory |

### Data Categories

| Category | Data Elements | OSINT Value |
|----------|--------------|-------------|
| **Ownership Records** | Owner name/ICO, acquisition date, acquisition type, share | Asset tracing, wealth profiling |
| **Encumbrances** | Mortgages, liens, easements, pre-emptive rights | Financial exposure assessment |
| **Parcel Data** | Area, land use, cadastral territory, protection status | Property valuation context |
| **Building Data** | Type, purpose, address, floor count, LV reference | Property identification |
| **Title Deeds (LV)** | Complete rights and obligations for property unit | Comprehensive ownership analysis |
| **Transaction History** | Transfers, encumbrance changes, corrections | Ownership chain investigation |
| **Cadastral Maps** | Parcel boundaries, building footprints, coordinates | Spatial analysis |
| **BPEJ** | Agricultural land quality classification | Land value assessment |

### Access Tiers

| Service | Access Level | Cost | Data Scope |
|---------|-------------|------|------------|
| **nahlizeni.cuzk.cz** | Free web portal | Free | Basic ownership, parcel info |
| **DPMR** | Registered remote access | Per-query fees | Full title deeds, detailed data |
| **WSDP** | Web service API | Per-query fees | Structured queries, bulk |
| **VFK** | Bulk data export | License fee | Complete cadastral data |
| **RUIN** | Address registry | Free/registered | Building addresses |
| **Geoportal** | Map services | Free | Cadastral maps, WMS/WFS |

## API Integration

### DPMR and WSDP Services

Programmatic access to CUZK data is available through the WSDP (Web Service for Remote Access) for registered users. The service provides structured queries returning XML responses.

| Service | Protocol | Authentication | Description |
|---------|----------|----------------|-------------|
| **WSDP** | SOAP/XML | Certificate + credentials | Structured property queries |
| **DPMR Web** | HTTPS | Login credentials | Interactive web access |
| **Geoportal WMS** | OGC WMS | None (public) | Cadastral map layers |
| **Geoportal WFS** | OGC WFS | None (public) | Vector cadastral data |
| **RUIN** | REST | None (public) | Address point queries |
| **VFK** | Bulk download | Licensed | Complete cadastral export |

### Rate Limits and Pricing

| Service | Rate | Cost |
|---------|------|------|
| **nahlizeni.cuzk.cz** | Reasonable use | Free |
| **DPMR/WSDP queries** | No hard limit | CZK 50/query (approx) |
| **DPMR annual subscription** | Unlimited | CZK 500-50,000/year (by tier) |
| **VFK bulk export** | One-time | CZK 1,000-100,000 (by scope) |
| **Geoportal WMS/WFS** | Reasonable use | Free |

### curl Examples

```bash
# Free nahlizeni.cuzk.cz lookup (web scraping approach)
curl "https://nahlizenidokn.cuzk.cz/VyberParcelu/CelaCR.aspx?typ=1&stav=1&katastr=praha"

# Geoportal WMS - get cadastral map tile
curl "https://services.cuzk.cz/wms/wms_kn/MapServer/WMSServer?service=WMS&request=GetMap&layers=KN&bbox=14.4,50.0,14.5,50.1&width=800&height=600&srs=EPSG:4326&format=image/png"

# RUIN address point lookup
curl "https://vdp.cuzk.cz/vdp/ruian/adresnimista/vyhledej?obec=Praha&ulice=Vaclavske+namesti&cislo=846"
```

## Query Examples

```elixir
# Search property by owner name
{:ok, properties} = Cuzk.search_by_owner("Jan Novak", municipality: "Praha")
# => [%{lv_number: 12345, cadastral_territory: "Nove Mesto",
#       parcels: [%{number: "846/1", area_m2: 350, land_use: :zastavena_plocha}],
#       ownership_share: "1/1", acquisition_date: ~D[2018-05-15],
#       acquisition_type: :purchase}]

# Lookup property ownership by ICO (company)
{:ok, portfolio} = Cuzk.company_properties(ico: "12345678")
# => %{company: "Example s.r.o.", ico: "12345678",
#      properties: [
#        %{lv: 5678, territory: "Vinohrady", type: :commercial,
#          area_m2: 1200, encumbrances: [%{type: :mortgage, creditor: "KB a.s."}]},
#        %{lv: 9012, territory: "Smichov", type: :residential,
#          area_m2: 85, encumbrances: []}
#      ],
#      total_properties: 2, estimated_value: 45_000_000}

# Get full title deed (list vlastnictvi)
{:ok, lv} = Cuzk.title_deed(lv_number: 12345, territory: "Nove Mesto")
# => %{lv_number: 12345, cadastral_territory: "Nove Mesto",
#      section_a: %{owners: [%{name: "Jan Novak", share: "1/1", ...}]},
#      section_b: %{parcels: [...], buildings: [...]},
#      section_c: %{encumbrances: [%{type: :mortgage, ...}]},
#      section_d: %{notes: [%{type: :plomba, ...}]}}

# Track ownership history of a parcel
{:ok, history} = Cuzk.ownership_history(parcel: "846/1", territory: "Nove Mesto")
# => [%{owner: "Jan Novak", from: ~D[2018-05-15], to: nil, type: :purchase},
#      %{owner: "Marie Dvorakova", from: ~D[2005-01-01], to: ~D[2018-05-14],
#        type: :inheritance}]

# Search by address
{:ok, property} = Cuzk.search_by_address("Vaclavske namesti 846/1, Praha 1")

# Check for encumbrances (mortgages, liens)
{:ok, encumbrances} = Cuzk.encumbrances(lv_number: 12345, territory: "Nove Mesto")
# => [%{type: :mortgage, creditor: "Komercni banka a.s.",
#       amount: 5_000_000, currency: "CZK", registered: ~D[2018-05-20]}]

# Geospatial query - properties within area
{:ok, parcels} = Cuzk.parcels_in_area(
  bbox: %{min_lat: 50.08, min_lon: 14.42, max_lat: 50.09, max_lon: 14.43}
)
```

## Data Schema

### Title Deed Structure (List Vlastnictvi)

```elixir
%Cuzk.TitleDeed{
  lv_number: 12345,
  cadastral_territory: %{
    code: 727181,
    name: "Nove Mesto",
    municipality: "Praha",
    district: "Praha 1"
  },
  section_a: %{
    owners: [
      %{name: "Jan Novak", birth_number_hash: "xxx",
        address: "Vaclavske namesti 1, Praha 1",
        share: "1/1", acquisition: :purchase,
        acquisition_date: ~D[2018-05-15],
        legal_basis: "Kupni smlouva V-12345/2018-101"}
    ]
  },
  section_b: %{
    parcels: [
      %{number: "846/1", area_m2: 350, land_use: :zastavena_plocha,
        protection: [:pamatková_zona]}
    ],
    buildings: [
      %{type: :bytovy_dum, purpose: :bydleni,
        address: "Vaclavske namesti 846/1", floors: 5,
        part_of_parcel: "846/1"}
    ]
  },
  section_c: %{
    encumbrances: [
      %{type: :zastavni_pravo_smluvni,
        creditor: "Komercni banka, a.s.",
        amount: 5_000_000, currency: "CZK",
        registration: "Z-56789/2018-101",
        registered_date: ~D[2018-05-20]}
    ]
  },
  section_d: %{
    notes: [
      %{type: :plomba, content: "Probihajici rizeni V-98765/2025-101",
        date: ~D[2025-06-01]}
    ]
  }
}
```

### Key Fields

| Section | Content | OSINT Significance |
|---------|---------|-------------------|
| **Section A (Vlastnictvi)** | Owners, shares, acquisition basis | Core ownership intelligence |
| **Section B (Nemovitosti)** | Parcels, buildings, addresses | Property identification |
| **Section C (Omezeni)** | Mortgages, liens, easements | Financial exposure |
| **Section D (Jine zapisy)** | Plomba (pending), notes | Transaction activity indicator |

## Use Cases

### Asset Tracing and Wealth Profiling

Investigators use CUZK to map the complete real estate portfolio of individuals and companies under investigation. By searching property records by name or ICO, analysts build comprehensive asset profiles that reveal declared vs. observable wealth positions. Property acquisition dates, values, and funding sources (visible through mortgage records) provide evidence for financial crime investigations.

### Beneficial Ownership Investigation

Property ownership analysis reveals connections between entities that may not be apparent from corporate registry data alone. When multiple companies share the same registered address, when an individual's property holdings are inconsistent with declared income, or when property transfers occur at below-market values between related parties, CUZK data provides the evidence for beneficial ownership analysis.

### Money Laundering Detection

Real estate is a primary vehicle for money laundering in the Czech Republic and globally. CUZK records enable detection of suspicious patterns including rapid sequential purchases, purchases at significantly above or below market value, cash purchases of high-value property, and ownership structures involving offshore entities or nominee arrangements.

### Mortgage and Collateral Verification

Banks and financial institutions use CUZK to verify the status and encumbrance history of property offered as collateral for loans. The title deed's Section C reveals existing mortgages, liens, and other encumbrances that affect the available equity in a property.

### Environmental and Planning Due Diligence

Property developers and environmental consultants use CUZK parcel data (land use classifications, protection status, BPEJ agricultural quality ratings) for site assessment and development planning. Protection designations (heritage zones, nature reserves, flood plains) directly affect development potential and property value.

## Limitations

**Paid Access for Detailed Data**: While basic ownership information is available for free through nahlizeni.cuzk.cz, detailed title deeds, historical records, and bulk data require paid DPMR access. Per-query fees can accumulate quickly for large-scale investigations.

**No Full-Text Search**: CUZK search requires specific identifiers (parcel number, LV number, owner name) rather than supporting full-text search across all property records. Investigating entities with common names may require geographic filtering.

**Beneficial Ownership Opacity**: While CUZK records the direct legal owner of property, it does not track ultimate beneficial owners. Property held through companies requires cross-referencing with Justice.cz beneficial ownership records and ARES company data.

**Historical Data Limitations**: Ownership history is available through the title deed but may not extend to the full historical chain for properties with complex restitution or privatization histories from the post-1989 period.

**Language**: CUZK data and the nahlizeni portal are available only in Czech. Property descriptions, legal terms, and land use classifications require Czech language capability for accurate interpretation.

**Data Format Complexity**: VFK bulk data exports use a complex proprietary format that requires specialized parsing. The WSDP web service uses SOAP/XML protocols that may be challenging to integrate with modern REST-based systems.

## Legal and Ethical Considerations

CUZK cadastral data is public information under Czech law (Act No. 256/2013 Sb.). Anyone can access basic ownership information for any property in the Czech Republic without restriction. However, several legal considerations apply to the use of cadastral data for intelligence purposes.

Personal data in cadastral records (owner names, addresses, birth numbers) is subject to [GDPR](@/glossary/gdpr.md) protection. While the data is publicly available, its systematic collection, aggregation, and profiling constitute processing of personal data that requires a lawful basis under Article 6 GDPR. Birth numbers (rodna cisla) are particularly sensitive identifiers under Czech law and their processing requires specific justification.

The DPMR service terms of use prohibit bulk downloading for the purpose of creating competing databases and restrict redistribution of detailed title deed data. Users must agree to use data for legitimate purposes related to property transactions, legal proceedings, or authorized investigations.

Property investigations involving politically exposed persons (PEPs) should follow established due diligence procedures and document the legitimate purpose and proportionality of the investigation.

## Integration with Prismatic Platform

Prismatic Platform integrates CUZK data for asset intelligence and property-based [entity resolution](@/glossary/entity-resolution.md), enabling comprehensive wealth profiling and financial crime investigation.

### Asset Intelligence Pipeline

```elixir
defmodule Prismatic.Intel.AssetIntelligence do
  @moduledoc """
  Combines CUZK property data with corporate registry data and financial
  intelligence to produce comprehensive asset profiles for entities
  under investigation.
  """

  def build_asset_profile(target) do
    with {:ok, properties} <- Cuzk.search_by_owner(target.name),
         {:ok, company_props} <- search_company_properties(target),
         {:ok, ares_data} <- Ares.get_by_ico(target.ico),
         {:ok, justice_data} <- get_beneficial_ownership(target.ico) do
      {:ok, %AssetProfile{
        target: target,
        direct_properties: properties,
        company_properties: company_props,
        total_estimated_value: estimate_portfolio_value(properties ++ company_props),
        encumbrance_exposure: calculate_encumbrance_total(properties),
        ownership_network: build_ownership_graph(properties, ares_data, justice_data),
        risk_indicators: assess_risk_indicators(properties),
        timeline: build_acquisition_timeline(properties)
      }}
    end
  end
end
```

### Cross-Registry Property Analysis

Property ownership records are cross-referenced with ARES company data, Justice.cz beneficial ownership records, Insolvency Register proceedings, and Hlidac statu risk analytics to build comprehensive asset profiles. The platform detects patterns such as property held through shell companies, rapid transfers between related parties, and ownership inconsistent with declared business activities.

### Geospatial Integration

CUZK cadastral maps are integrated with the platform's geospatial analysis capabilities, enabling spatial queries, proximity analysis, and visual mapping of property portfolios. The geoportal WMS/WFS services provide real-time cadastral boundary data for interactive investigation dashboards.

## Best Practices

**Start with nahlizeni.cuzk.cz**: For initial reconnaissance, use the free portal to verify property existence and basic ownership before committing DPMR query fees for detailed title deed access.

**Use ICO for Company Properties**: When investigating company property holdings, search by ICO rather than company name to avoid ambiguity. CUZK allows direct ICO-based ownership searches.

**Check Section D for Activity**: The plomba (Section D notation) on a title deed indicates pending cadastral proceedings -- a property transfer, mortgage registration, or other transaction is in progress. This provides real-time intelligence about property activity.

**Cross-Reference Encumbrances**: Compare mortgage amounts in CUZK Section C with company financial data from ARES and Justice.cz to assess financial leverage and identify potential distress indicators.

**Track Cadastral Territory Codes**: Czech cadastral territory codes (katastralni uzemi) are essential identifiers. Maintain a mapping table between territory codes, names, and geographic coordinates for efficient geographic analysis.

**Document Investigation Trail**: CUZK DPMR access is logged. Maintain proper documentation of the legitimate purpose for each query to satisfy potential audit requirements and GDPR accountability obligations.

## Related Providers

- [ARES](@/osint/ares.md) - Czech business registry for owner company identification
- [Justice.cz](@/osint/justice-cz.md) - Commercial Register with beneficial ownership data
- [Insolvencni rejstrik](@/osint/insolvencni-rejstrik.md) - Insolvency proceedings affecting property
- [Registr smluv](@/osint/registr-smluv.md) - Public contracts related to property transactions
- [VR.cz](@/osint/vr-cz.md) - Czech public registers with beneficial owners
- [Hlidac statu](@/osint/hlidac-statu.md) - Government watchdog for contract and subsidy analytics
- [CNB](@/osint/cnb.md) - Czech National Bank for mortgage creditor verification

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)