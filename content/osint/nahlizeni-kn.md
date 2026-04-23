+++
title = "Nahlizeni do KN"
weight = 48
[extra]
category = "czech"
type = "property"
module = "NahlizeniKn"
description = "Czech Land Registry remote access - property ownership and encumbrances"
has_api = false
url = "https://nahlizenidokn.cuzk.cz"
rate_limit = "Web interface, no official API"
capabilities = ["Property Search", "Ownership Lookup", "Encumbrance Check", "Parcel Information", "Building Data", "Map Integration"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1528
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Nahlizeni", "Czech", "Land", "Registry", "osint", "Prismatic Platform", "Complete", "CUZK"]
tags = ["osint", "czech", "nahlizeni-do-kn", "prismatic"]
quality_score = 90
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "Nahlizeni do KN - Prismatic Platform"
+++

## Overview

Nahlizeni do katastru nemovitosti (Remote Access to the Land [Registry](@/glossary/registry-otp.md)) is the public web interface to the Czech Cadastral Office (CUZK) database. It provides free access to basic property information including ownership, encumbrances, property descriptions, and geographic data. For [OSINT](@/glossary/osint.md) purposes, it reveals who owns specific properties, what liens or mortgages exist, and the history of ownership transfers. The complete dataset is the authoritative source for all real estate intelligence in the Czech Republic.

The Czech land registry system traces its origins to the Habsburg cadastral reforms of the 18th century and has been continuously maintained since. The modern digitized version contains records for approximately 22 million parcels across 13 regions (kraje) and 6,258 cadastral territories (katastralni uzemi). Every real estate transaction, mortgage, easement, and ownership change in the Czech Republic must be registered with CUZK to have legal effect, making this the single source of truth for property intelligence.

The "Nahlizeni" (viewing) interface provides a subset of the full cadastral data free of charge. While the free interface shows current ownership and basic encumbrances, the full paid service (CUZK Dalkovy pristup) provides complete historical records, certified extracts, and machine-readable data exports. For OSINT investigations, the free interface typically provides sufficient data for ownership verification and asset mapping, while deep investigations may require paid access for historical ownership chains and detailed encumbrance records.

## Data Sources and Coverage

| Data Category | Description | Completeness |
|--------------|-------------|-------------|
| **Ownership Records** | Current owner name, ownership share, acquisition date and title | Complete for all registered property |
| **Property Descriptions** | Parcel number, area in square meters, land use type, building descriptions | Complete with geometric data |
| **Encumbrances (Tarchy)** | Mortgages, liens, easements, pre-emption rights, construction bans | Complete for registered encumbrances |
| **Legal Relations** | Co-ownership, community property, trust holdings, corporate ownership | Complete |
| **Active Proceedings** | Pending ownership transfers, ongoing cadastral proceedings | Real-time |
| **Cadastral Maps** | Digital cadastral maps with parcel boundaries, building footprints | Complete nationwide |
| **Building Records** | Building type, purpose, number of floors, connection to parcels | Complete for registered buildings |
| **Unit Ownership** | Individual apartment units within buildings (bytove jednotky) | Complete since 2014 reform |
| **Historical Data** | Previous owners and transfer history (paid service) | Complete since digitization |

### Search Methods

| Method | Input | Returns | Free Access |
|--------|-------|---------|------------|
| **By Address** | Street name, house number, city | Parcels and buildings at address | Yes |
| **By Parcel Number** | Cadastral territory + parcel number | Full property detail | Yes |
| **By Owner Name** | Full name of natural or legal person | All owned properties | Yes |
| **By ICO** | Company identification number | All properties owned by entity | Yes |
| **By Proceeding** | Proceeding reference number (rizeni) | Proceeding status and details | Yes |
| **By Map** | Interactive map click/search | Parcel identification and details | Yes |
| **By LV Number** | List vlastnictvi (ownership sheet) number | All properties on the sheet | Yes |

## API Integration

CUZK does not provide a public REST API for the Nahlizeni service. Data access is through the web interface or the paid "Dalkovy pristup" (Remote Access) service which provides structured data exports.

### Access Methods

| Method | Description | Cost | Format |
|--------|-------------|------|--------|
| **Nahlizeni Web** | Free public web interface | Free | HTML (requires parsing) |
| **Dalkovy pristup** | Paid remote access service | From 50 CZK/query | XML/PDF |
| **ISKN Export** | Bulk data exports | Subscription | VFK/XML |
| **WMS/WFS Services** | Geospatial web services | Free for viewing | OGC WMS/WFS |
| **RUIAN** | Address point registry (separate system) | Free API | XML/JSON |

### Geospatial Services

| Service | URL | Protocol | Description |
|---------|-----|----------|-------------|
| Cadastral WMS | `https://services.cuzk.cz/wms/wms_kn` | OGC WMS | Cadastral map layers |
| RUIAN WFS | `https://services.cuzk.cz/wfs/inspire-cp` | OGC WFS | Cadastral parcels as vector features |
| Orthophoto WMS | `https://services.cuzk.cz/wms/wms_ortofoto` | OGC WMS | Aerial imagery |

## Query Examples

### Elixir Integration

```elixir
# Search property by address
{:ok, parcels} = PrismaticOsint.NahlizeniKn.search_address("Praha", "Vinohradska 12")
# => [%{parcel_number: "1234", cadastral_territory: "Vinohrady",
#       area_sqm: 450, land_type: :zastavena_plocha,
#       address: "Vinohradska 1850/12, Praha 2"}]

# Get ownership details for a parcel
{:ok, ownership} = PrismaticOsint.NahlizeniKn.ownership(
  cadastral_area: "Vinohrady",
  parcel: "1234"
)
# => %{
#   lv_number: 5678,
#   owners: [
#     %{name: "Example s.r.o.", ico: "12345678",
#       share: "1/1", type: :legal_entity,
#       acquisition: "Kupni smlouva ze dne 15.3.2020"}
#   ],
#   encumbrances: [
#     %{type: :zastavni_pravo, beneficiary: "Ceska sporitelna a.s.",
#       amount: "15,000,000 CZK", registered: ~D[2020-03-20]}
#   ]
# }

# Check encumbrances on a property
{:ok, liens} = PrismaticOsint.NahlizeniKn.encumbrances(property_id)
# => [%{type: :zastavni_pravo, beneficiary: "Bank a.s.",
#       amount: "10,000,000 CZK"},
#     %{type: :vecne_bremeno, description: "Right of way",
#       beneficiary: "Praha municipality"}]

# Full property portfolio for a legal entity
{:ok, portfolio} = PrismaticOsint.NahlizeniKn.portfolio_by_ico("12345678")
# => %{
#   entity: "Example Holdings s.r.o.",
#   total_properties: 15,
#   total_area_sqm: 125_000,
#   properties: [
#     %{type: :parcel, territory: "Praha - Vinohrady", area: 450},
#     %{type: :building, territory: "Brno - Kralovo Pole", floors: 5}
#   ],
#   total_encumbrances: 3,
#   mortgage_exposure: "45,000,000 CZK"
# }

# Cross-reference ownership with ARES business data
{:ok, enriched} = PrismaticOsint.Pipeline.property_investigation("12345678",
  sources: [:nahlizeni_kn, :ares, :justice_cz, :insolvencni_rejstrik]
)
```

### curl Examples (Geospatial Services)

```bash
# Get cadastral map layer via WMS
curl "https://services.cuzk.cz/wms/wms_kn?SERVICE=WMS&REQUEST=GetMap&LAYERS=dalsi_prvky_mapy,obrazy_parcel,parcelni_cisla&BBOX=14.4,50.0,14.5,50.1&WIDTH=800&HEIGHT=600&FORMAT=image/png&SRS=EPSG:4326"

# Query RUIAN address registry
curl "https://vdp.cuzk.cz/vdp/ruian/adresnimista/vyhledej?obec=Praha&ulice=Vinohradska&cisloOrientacni=12"

# WFS feature query for cadastral parcels
curl "https://services.cuzk.cz/wfs/inspire-cp?SERVICE=WFS&REQUEST=GetFeature&TYPENAMES=cp:CadastralParcel&BBOX=14.4,50.0,14.5,50.1&SRSNAME=urn:ogc:def:crs:EPSG::4326"
```

## Data Schema

| Field | Type | Description |
|-------|------|-------------|
| `lv_number` | integer | List vlastnictvi (ownership sheet) number |
| `cadastral_territory` | string | Katastralni uzemi name and code |
| `parcel_number` | string | Parcel number (kmenove cislo / poddelen) |
| `parcel_type` | enum | `stavebni` (building plot), `pozemkova` (land parcel) |
| `area_sqm` | integer | Area in square meters |
| `land_use` | enum | Land use category (arable, forest, built-up, water, etc.) |
| `building_type` | enum | Building classification (residential, commercial, industrial) |
| `owner_name` | string | Owner full name (natural person) or entity name |
| `owner_ico` | string | Company ICO (for legal entities) |
| `owner_birth_id` | string | Birth number (for natural persons, partially redacted) |
| `ownership_share` | string | Fractional ownership share (e.g., "1/2") |
| `acquisition_title` | string | Legal basis of acquisition (purchase, inheritance, etc.) |
| `encumbrance_type` | enum | Mortgage, lien, easement, pre-emption right |
| `encumbrance_beneficiary` | string | Party benefiting from the encumbrance |
| `proceeding_status` | enum | `active`, `completed`, `suspended` |

## Use Cases

### Asset Investigation

For investigators tracing the assets of persons or entities of interest, the land registry reveals property holdings that may not appear in financial disclosures or corporate records. Properties registered under personal names, family members, or shell companies can be systematically mapped to build comprehensive asset profiles. Cross-referencing with [ARES](@/osint/ares.md) company data reveals corporate property portfolios and identifies entities that hold real estate through layered ownership structures.

### Financial Due Diligence

Lenders, investors, and acquirers use cadastral data to verify collateral claims, identify undisclosed encumbrances, and assess the real estate component of an entity's balance sheet. The mortgage registry reveals existing debt secured against properties, while active proceedings may indicate pending ownership disputes or forced sales.

### Corporate Intelligence

Real estate holdings reveal organizational scale, geographic footprint, and capital allocation patterns. By mapping all properties owned by a company and its subsidiaries, analysts assess whether disclosed real estate portfolios match public records. Discrepancies may indicate undisclosed subsidiaries, nominee holdings, or asset concealment.

### Anti-Money Laundering (AML)

Czech real estate has historically been a vehicle for money laundering. Unusual patterns such as rapid sequential purchases, purchases significantly above market value, properties acquired by newly formed shell companies, or properties with no apparent economic use may indicate proceeds laundering. The cadastral record provides the transactional evidence needed to identify these patterns.

### Insolvency and Debt Recovery

When entities enter insolvency, their real estate assets become relevant to creditor claims. Cross-referencing cadastral data with the [Insolvency Registry](@/osint/insolvencni-rejstrik.md) reveals which properties are part of insolvency estates and which creditors hold secured claims.

## Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **No official API** | Requires web scraping or paid Dalkovy pristup | Structured scraping with CAPTCHA handling |
| **Historical data paywalled** | Free interface shows only current ownership | Purchase Dalkovy pristup access for historical chains |
| **Natural person privacy** | Birth numbers partially redacted in free view | Cross-reference with other identity sources |
| **No market value data** | Registry contains no price/value information | Combine with market data providers and tax assessments |
| **Delay in registration** | Proceedings may take days to weeks to process | Check for active proceedings (plomba) indicating pending changes |
| **Czech language only** | All interface and data in Czech | Translation layer in Prismatic adapter |
| **CAPTCHA protection** | Automated access may trigger CAPTCHA | Rate limiting and session management |

## Legal and Ethical Considerations

**Public Record Status**: Czech cadastral data is a public record under Act No. 256/2013 Sb. (the Cadastral Act). Anyone may access basic ownership and encumbrance information without stating a reason. This provides strong legal basis for OSINT use.

**Privacy of Natural Persons**: While ownership is public, combining property data with other personal information must comply with GDPR. Birth numbers and detailed personal information of natural person owners are partially protected.

**Professional Use**: Real estate professionals, lawyers, and financial institutions routinely access cadastral data for legitimate business purposes. OSINT use for investigation, due diligence, and compliance falls within accepted practice.

**Data Accuracy**: The cadastral record has legal effect -- it is presumed correct unless proven otherwise. However, investigators should be aware that pending proceedings may not yet be reflected in the visible record. Always check the "plomba" (proceedings marker) indicator.

## Integration with Prismatic Platform

Within the [Prismatic Platform](@/apps/prismatic.md), CUZK data forms a core component of the Czech entity intelligence pipeline, providing the property dimension of comprehensive entity profiles.

- **Asset Mapping**: Property holdings are automatically aggregated across natural persons and legal entities, building complete real estate portfolios for investigated subjects.
- **Encumbrance Monitoring**: Active mortgages and liens are tracked as financial obligations, contributing to entity risk scoring and credit assessment.
- **Cross-Registry Correlation**: Property ownership is cross-referenced with [ARES](@/osint/ares.md) company records, [Insolvency Registry](@/osint/insolvencni-rejstrik.md) proceedings, and [Registr smluv](@/osint/registr-smluv.md) government contracts.
- **Geospatial Integration**: Cadastral map data integrates with the platform's geographic visualization layer, enabling spatial analysis of property portfolios.
- **AML Patterns**: The platform's analytical engine applies pattern detection to property transaction sequences, flagging indicators consistent with money laundering typologies.

## Best Practices

1. **Search by ICO for companies**: ICO-based searches return all properties registered to a specific legal entity, providing the most complete corporate property view.

2. **Check the plomba**: A proceedings marker (plomba) on a property indicates a pending change. Do not treat current ownership as final when a plomba is present.

3. **Map ownership chains**: For properties owned by companies, trace the corporate ownership chain through [Justice.cz](@/osint/justice-cz.md) to identify ultimate beneficial owners.

4. **Cross-reference area data**: Compare registered area with actual use through satellite imagery to identify discrepancies that may indicate unauthorized construction or land use changes.

5. **Use cadastral territory codes**: Properties are identified by cadastral territory and parcel number, not by address. Learn to navigate the territorial structure for precise searches.

6. **Cache ownership snapshots**: Take timestamped snapshots of ownership records for evidentiary purposes, as the web interface shows only current state.

7. **Combine with RUIAN**: The RUIAN address registry provides structured address data that supplements cadastral records with precise geolocation.

## Related Providers

- [CUZK](@/osint/cuzk.md) - Czech Office for Surveying, Mapping and Cadastre (parent organization)
- [ARES](@/osint/ares.md) - Czech business registry for entity identification
- [Insolvencni rejstrik](@/osint/insolvencni-rejstrik.md) - Insolvency proceedings affecting property
- [Justice.cz](@/osint/justice-cz.md) - Court decisions on property disputes
- [Registr smluv](@/osint/registr-smluv.md) - Public contracts involving state property
- [CEDR](@/osint/cedr.md) - Subsidies linked to property development
- [Verejne zakazky](@/osint/verejne-zakazky.md) - Public procurement for construction projects

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)