+++
title = "ARES"
weight = 2
[extra]
category = "czech"
type = "company"
module = "Ares"
description = "Access Register of Economic Subjects - the central Czech business registry"
has_api = true
url = "https://ares.gov.cz"
rate_limit = "No official limit, recommended 1 req/sec"
capabilities = ["Company Search", "ICO Lookup", "DIC Validation", "Company Details", "Statutory Bodies", "Address Verification"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1516
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ARES", "Access", "Register", "Economic", "Subjects", "Czech", "osint", "Prismatic Platform"]
tags = ["osint", "czech", "ares", "prismatic"]
quality_score = 90
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "ARES - Prismatic Platform"
+++

## Overview

ARES (Administrativni registr ekonomickych subjektu -- Administrative Register of Economic Subjects) is the central information system of the Czech Republic that aggregates data from multiple public registers into a unified query interface. Operated by the Czech Ministry of Finance (Ministerstvo financi CR), ARES serves as the authoritative meta-registry for all economic subjects registered in the Czech Republic, encompassing approximately 3 million active entities including commercial companies, sole proprietors, non-profit organizations, and government bodies.

The system was launched in 2004 and underwent a major modernization in 2022, transitioning from legacy XML-based SOAP services to a modern REST API with JSON responses. The new ARES API (ares.gov.cz/ekonomicke-subjekty-v-be/rest) provides structured access to company identification data, statutory bodies, registered addresses, business activities, and cross-references to source registries. This modernization significantly improved data quality, response times, and integration capabilities.

For [OSINT](/glossary/osint/) analysts and compliance professionals, ARES is the essential starting point for any investigation involving Czech entities. It provides the canonical ICO (Identifikacni cislo osoby -- company identification number) and DIC (Danove identifikacni cislo -- tax identification number) that serve as primary keys across all Czech public registries. A single ARES query returns aggregated information from the Commercial Register (obchodni rejstrik), Trade Licensing Register (zivnostensky rejstrik), Statistical Register (RES), VAT payer registry (DPH), and other source systems, eliminating the need to query each registry independently for basic entity verification.

ARES data is updated in near-real-time as source registries propagate changes, though synchronization delays of up to 24 hours can occur for certain data types. The system processes millions of queries daily from government agencies, financial institutions, legal firms, and compliance departments conducting KYC (Know Your Customer) and AML (Anti-Money Laundering) verification.

## Data Sources and Coverage

ARES aggregates data from the following Czech public registries and information systems, each contributing specific data categories to the unified entity profile.

| Source Registry | Czech Name | Data Contributed |
|----------------|------------|------------------|
| **Commercial Register** | Obchodni rejstrik | Company name, legal form, registered capital, statutory bodies, seat address |
| **Trade Licensing Register** | Zivnostensky rejstrik (RZP) | Trade licenses, business activities, responsible representatives |
| **Statistical Register** | Registr ekonomickych subjektu (RES) | CZ-NACE codes, employee count ranges, turnover categories |
| **VAT Payer Registry** | Registr platcu DPH | VAT registration status, DIC number, unreliable payer flag |
| **Excise Duty Registry** | Registr platcu spotrebni dane | Excise duty payer registrations |
| **RVPO** | Registr verejnych vyzkumnych instituci | Public research institutions |
| **RCNS** | Registr celne-neprimych subjektu | Customs subjects |
| **Register of Foundations** | Evidence nadaci a nadacnich fondu | Foundations and endowment funds |
| **Register of Institutes** | Evidence ustavu | Registered institutes |

### Coverage Statistics

| Metric | Value |
|--------|-------|
| **Total Registered Entities** | ~3,000,000 |
| **Active Commercial Companies** | ~600,000 |
| **Active Sole Proprietors** | ~1,800,000 |
| **Non-Profit Organizations** | ~150,000 |
| **Government Bodies** | ~20,000 |
| **Daily Query Volume** | ~5,000,000 |
| **Data Freshness** | Near-real-time (up to 24h delay for some sources) |

## API Integration

### New REST API (2022+)

The modernized ARES API provides RESTful endpoints with JSON responses, replacing the legacy XML/SOAP services.

**Base URL**: `https://ares.gov.cz/ekonomicke-subjekty-v-be/rest`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/vyhledat` | POST | Full-text search for economic subjects |
| `/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/{ico}` | GET | Lookup by ICO (company ID) |
| `/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/overeni-dic/{dic}` | GET | DIC (tax ID) verification |
| `/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/{ico}/statisticke-udaje` | GET | Statistical data for entity |
| `/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/{ico}/vazby` | GET | Cross-registry references |

### Rate Limits

| Access Type | Limit | Authentication |
|-------------|-------|----------------|
| **Public API** | Recommended 1 req/sec | None required |
| **Burst Tolerance** | ~5 req/sec | None required |
| **Bulk Downloads** | Available via open data portal | Registration |

### curl Examples

```bash
# Lookup company by ICO
curl -s "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/00000001" \
  -H "Accept: application/json"

# Search by company name
curl -s -X POST "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/vyhledat" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"obchodniJmeno": "Prismatic", "start": 0, "pocet": 10}'

# Validate DIC (tax identification number)
curl -s "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/overeni-dic/CZ12345678" \
  -H "Accept: application/json"

# Get statistical data
curl -s "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/00000001/statisticke-udaje" \
  -H "Accept: application/json"
```

## Query Examples

```elixir
# Search by company name
{:ok, results} = Ares.search(name: "Prismatic")
# => %{total: 3, entities: [%{ico: "12345678", nazev: "Prismatic s.r.o.", ...}, ...]}

# Lookup by ICO (company identification number)
{:ok, company} = Ares.get_by_ico("12345678")
# => %Ares.Entity{
#   ico: "12345678",
#   dic: "CZ12345678",
#   nazev: "Prismatic s.r.o.",
#   pravni_forma: %{kod: "112", nazev: "Spolecnost s rucenim omezenym"},
#   datum_vzniku: ~D[2020-01-15],
#   adresa: %{ulice: "Vaclavske namesti", cislo: "1", obec: "Praha", psc: "11000"},
#   ...
# }

# Validate DIC (tax identification number)
{:ok, valid?} = Ares.validate_dic("CZ12345678")
# => true

# Get full details including statutory bodies
{:ok, details} = Ares.get_full_details("12345678")
# => %{entity: %{...}, statutory_bodies: [...], business_activities: [...]}

# Batch lookup for compliance screening
{:ok, batch_results} = Ares.batch_lookup(["12345678", "87654321", "11111111"])

# Search by address
{:ok, results} = Ares.search(address: %{obec: "Praha", ulice: "Vaclavske namesti"})

# Search with NACE code filter
{:ok, results} = Ares.search(name: "software", nace: "62.01")
```

## Data Schema

### Entity Response Structure

```elixir
%Ares.Entity{
  ico: "12345678",
  dic: "CZ12345678",
  nazev: "Example s.r.o.",
  pravni_forma: %{
    kod: "112",
    nazev: "Spolecnost s rucenim omezenym"
  },
  datum_vzniku: ~D[2020-01-15],
  datum_zaniku: nil,
  adresa: %{
    ulice: "Vaclavske namesti",
    cislo_domovni: "846",
    cislo_orientacni: "1",
    obec: "Praha",
    cast_obce: "Nove Mesto",
    mestska_cast: "Praha 1",
    psc: "11000",
    stat: "CZ"
  },
  predmety_podnikani: [
    %{kod: "62.01", nazev: "Programovani pocitacu"},
    %{kod: "62.02", nazev: "Poradenstvi v oblasti IT"}
  ],
  statutarni_organ: %{
    nazev: "Jednatel",
    clenove: [
      %{jmeno: "Jan", prijmeni: "Novak", funkce: "jednatel",
        datum_vzniku_funkce: ~D[2020-01-15]}
    ]
  },
  zakladni_kapital: %{
    vyse: 200_000,
    mena: "CZK",
    splaceno: 200_000
  },
  velikostni_kategorie: "10-19 zamestnancu",
  zdroj: ["or", "rzp", "res", "dph"]
}
```

### Key Data Fields

| Field | Czech Name | Type | Description |
|-------|-----------|------|-------------|
| `ico` | ICO | String(8) | Unique company identification number |
| `dic` | DIC | String(12) | Tax identification number (CZ + ICO) |
| `nazev` | Nazev | String | Official legal name |
| `pravni_forma` | Pravni forma | Code | Legal form (s.r.o., a.s., etc.) |
| `datum_vzniku` | Datum vzniku | Date | Date of incorporation |
| `datum_zaniku` | Datum zaniku | Date | Date of dissolution (nil if active) |
| `adresa` | Sidlo | Struct | Registered seat address |
| `predmety_podnikani` | Predmety podnikani | List | Business activities (CZ-NACE codes) |
| `statutarni_organ` | Statutarni organ | Struct | Directors, board members |
| `zakladni_kapital` | Zakladni kapital | Struct | Registered capital |

## Use Cases

### KYC/AML Compliance Verification

Financial institutions and obligated entities under Czech AML law (Act No. 253/2008 Sb.) use ARES as the primary source for customer identification and verification. ARES queries confirm entity existence, verify ICO/DIC numbers, identify statutory representatives, and establish the legal form and business activities of counterparties. Automated ARES integration enables real-time KYC checks during customer onboarding.

### Corporate Due Diligence

Before entering business relationships, organizations query ARES to verify company details, assess business activity scope, and identify management personnel. The cross-registry aggregation provides a comprehensive initial screening that would otherwise require separate queries to five or more registries.

### Investigative Entity Profiling

OSINT analysts use ARES as the foundation for Czech entity investigations, establishing canonical identifiers (ICO, DIC) that enable efficient pivoting across other registries such as Justice.cz, CUZK, Registr smluv, and Hlidac statu. The statutory body data reveals personal connections that can be mapped into relationship graphs.

### Tax Compliance Monitoring

Automated DIC validation through ARES ensures that business partners maintain valid VAT registrations. Combined with the DPH unreliable payer registry, this prevents joint liability exposure from transactions with non-compliant counterparties.

### Statistical and Market Analysis

Researchers and market analysts use ARES's CZ-NACE classifications and size categories to segment the Czech business landscape, analyze industry composition, and track new company formation trends.

## Limitations

**Data Synchronization Delays**: While ARES aims for near-real-time updates, some source registries propagate changes with delays of up to 24 hours. For time-critical verification (e.g., same-day incorporation), direct queries to source registries may be necessary.

**Historical Data**: ARES provides current state only; it does not maintain full historical records. For historical company data (former names, previous addresses, past directors), the Commercial Register at Justice.cz provides the complete audit trail.

**No Beneficial Ownership**: ARES does not include beneficial ownership (skutecny vlastnik) data. This information is available through the Evidence skutecnych vlastniku accessible via Justice.cz.

**Sole Proprietor Limitations**: Data for sole proprietors (OSVC) is less comprehensive than for commercial companies, often limited to name, ICO, and registered address without detailed business activity descriptions.

**No Financial Statements**: ARES does not include financial statements or annual reports. These are filed with the Commercial Register (Sbirka listin) at Justice.cz.

## Legal and Ethical Considerations

ARES data is public information under Czech law (Act No. 111/2009 Sb., on basic registers). All information available through ARES is considered public and its use does not require consent from data subjects. However, users should be aware of several legal considerations.

The processing of personal data obtained from ARES (names, addresses of statutory representatives) must comply with [GDPR](/glossary/gdpr/) requirements. While the data is publicly available, its aggregation, profiling, or use for purposes incompatible with the original collection purpose may trigger GDPR obligations, including the requirement to establish a lawful basis for processing under Article 6.

Automated bulk collection from ARES should respect the recommended rate limits and terms of service. The Czech Ministry of Finance provides bulk data exports through the open data portal (data.gov.cz) for analytical use cases that would otherwise require excessive API queries.

Commercial redistribution of ARES data is generally permitted under Czech open data legislation, provided appropriate attribution is maintained and the data is not misrepresented as coming from an unauthorized source.

## Integration with Prismatic Platform

Prismatic Platform integrates ARES as the foundational Czech entity identification and verification source. The integration architecture ensures that ARES serves as the canonical starting point for all Czech entity investigations and compliance checks.

### Entity Resolution Pipeline

```elixir
defmodule Prismatic.Czech.EntityResolver do
  @moduledoc """
  Resolves Czech entities starting from ARES, then enriching
  from specialized registries based on entity type and
  investigation requirements.
  """

  def resolve(ico) when is_binary(ico) do
    with {:ok, ares_entity} <- Ares.get_by_ico(ico),
         {:ok, enriched} <- enrich_from_registries(ares_entity) do
      {:ok, %ResolvedEntity{
        canonical: ares_entity,
        justice: enriched[:justice],
        dph: enriched[:dph],
        rzp: enriched[:rzp],
        hlidac: enriched[:hlidac],
        cuzk: enriched[:cuzk],
        confidence: calculate_confidence(enriched)
      }}
    end
  end
end
```

### Cross-Registry Correlation

ARES ICO numbers serve as the primary join key across all Czech registries in the platform. When a new entity enters the system -- whether from a contract search, property lookup, or compliance screening -- the ARES adapter establishes the canonical entity profile that subsequent enrichment modules build upon. The platform caches ARES responses with a 24-hour TTL, respecting the recommended query rate while ensuring data freshness.

### Automated Compliance Screening

The platform's compliance pipeline automatically queries ARES as part of multi-source KYC checks. ARES entity data is cross-referenced with EU and OFAC sanctions lists, the DPH unreliable payer registry, insolvency proceedings, and Hlidac statu risk ratings to produce composite risk assessments.

## Best Practices

**Cache Aggressively**: ARES data changes infrequently for most entities. Implement a 24-hour cache for ICO lookups and a 1-hour cache for search results to minimize API load and improve response times.

**Use ICO as Primary Key**: Always use ICO for definitive entity lookups. Name-based searches may return multiple results due to common business names and require disambiguation.

**Validate ICO Format**: Czech ICO numbers are 8-digit strings with a check digit (modulo 11 algorithm). Validate format before querying to avoid unnecessary API calls.

**Handle Dissolved Entities**: Check `datum_zaniku` (dissolution date) to confirm entity status. Dissolved entities remain in ARES but are no longer economically active.

**Cross-Reference Source Registries**: For critical decisions, verify ARES data against the source registry (e.g., Justice.cz for statutory bodies, RZP for trade licenses). ARES aggregation introduces potential synchronization gaps.

**Monitor API Changes**: The ARES API underwent a major version change in 2022. Subscribe to the Ministry of Finance technical announcements for advance notice of schema changes or service migrations.

## Related Providers

- [Justice.cz](/osint/justice-cz/) - Commercial Register with detailed filings and beneficial ownership
- [RZP](/osint/rzp/) - Trade Licensing Register with activity details
- [Insolvencni rejstrik](/osint/insolvencni-rejstrik/) - Czech insolvency proceedings
- [VR.cz](/osint/vr-cz/) - Czech Business Registry with beneficial owners
- [DPH](/osint/dph/) - VAT payer registry for tax compliance verification
- [Hlidac statu](/osint/hlidac-statu/) - Government watchdog with risk analytics
- [CUZK](/osint/cuzk/) - Cadastral office for property ownership
- [EU Sanctions](/osint/eu-sanctions/) - EU sanctions list for entity screening

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)