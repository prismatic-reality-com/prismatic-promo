+++
title = "SZIF"
weight = 61
[extra]
category = "czech"
type = "financial"
module = "Szif"
description = "Czech State Agricultural Intervention Fund - EU agricultural subsidies and grants"
has_api = false
url = "https://szif.cz"
rate_limit = "Public website, open data available"
capabilities = ["Subsidy Recipients", "Payment Data", "CAP Payments", "Rural Development", "Market Intervention", "Cross-Compliance Data"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1654
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["SZIF", "Czech", "State", "Agricultural", "Intervention", "Fund", "osint", "Prismatic Platform", "Cross", "Justice"]
tags = ["osint", "czech", "szif", "prismatic"]
quality_score = 90
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "SZIF - Prismatic Platform"
+++

## Overview

SZIF (Statni zemedelsky intervencni fond) is the Czech State Agricultural Intervention Fund, the national paying agency responsible for distributing European Union Common Agricultural Policy (CAP) funds and Czech national agricultural subsidies. As the sole accredited paying agency for EU agricultural funds in the Czech Republic, SZIF processes and distributes billions of CZK annually in direct payments, rural development grants, market intervention measures, and specialized agricultural support programs. The fund publishes beneficiary data as required by EU transparency regulations (Regulation EU 2021/2116), making it a valuable [OSINT](@/glossary/osint.md) source for agricultural sector intelligence, subsidy fraud detection, and financial due diligence on agricultural entities.

For OSINT analysts investigating Czech agricultural companies, SZIF data reveals the financial dependency of agricultural entities on public subsidies, the distribution of EU funds across regions and sectors, and potential indicators of subsidy fraud or misuse. When cross-referenced with land registry data from [Nahlizeni do KN](@/osint/nahlizeni-kn.md) and company data from [ARES](@/osint/ares.md), SZIF payment records provide a comprehensive picture of agricultural business models and their reliance on public funding.

SZIF administers two major EU funds: the European Agricultural Guarantee Fund (EAGF), which finances direct payments and market measures, and the European Agricultural Fund for Rural Development (EAFRD), which co-finances rural development programs. Together, these funds represent approximately CZK 40-50 billion annually in payments to Czech agricultural entities. The transparency requirement means that every payment above certain thresholds must be publicly disclosed with the recipient's name, municipality, payment amount, and program details.

The fund's data is particularly valuable for investigating land concentration, agricultural holding structures, and the relationship between subsidy receipts and actual agricultural activity. Large agricultural conglomerates in the Czech Republic often structure their operations across multiple legal entities to optimize subsidy receipts, creating complex corporate structures that SZIF data helps map when combined with commercial register information from [Justice.cz](@/osint/justice-cz.md).

## Data Sources and Coverage

SZIF publishes payment data through its transparency portal, covering all major EU and national agricultural support programs.

| Program | Description | Annual Budget (approx.) |
|---------|-------------|------------------------|
| **SAPS (Single Area Payment Scheme)** | Per-hectare direct payments to farmers | CZK 20+ billion |
| **Greening** | Environmental compliance top-up payments | CZK 7+ billion |
| **Young Farmer Support** | Additional payments for farmers under 40 | CZK 500+ million |
| **Voluntary Coupled Support** | Payments linked to specific crops or livestock | CZK 3+ billion |
| **Rural Development Programme** | Investment grants, agri-environment measures | CZK 8+ billion |
| **Market Intervention** | Wine, fruit, vegetable sector support, school schemes | CZK 1+ billion |
| **Cross-Compliance Sanctions** | Reductions for regulatory non-compliance | Negative adjustments |
| **National Top-Ups** | Czech national co-financing supplements | CZK 2+ billion |

### Data Fields Published

| Field | Type | Description |
|-------|------|-------------|
| **Recipient Name** | string | Legal name of the subsidy recipient |
| **Recipient ICO** | string | Company identification number (for legal entities) |
| **Municipality** | string | Municipality of the recipient's registered address |
| **District** | string | Administrative district (okres) |
| **Payment Amount** | number | Total payment in CZK for the reporting period |
| **Program** | string | Specific subsidy program and measure |
| **Fund Source** | enum | EAGF, EAFRD, or national funds |
| **Financial Year** | integer | EU financial year of the payment |
| **Payment Date** | date | Date of payment disbursement |

### Entity Types Receiving Payments

| Entity Category | Description | Typical Payment Range |
|----------------|-------------|----------------------|
| **Large Agricultural Holdings** | Agrofert, Priban a.s., major conglomerates | CZK 100M - 1B+ |
| **Medium Farms** | Cooperatives, medium enterprises | CZK 1M - 100M |
| **Small Farmers** | Individual farmers, family farms | CZK 50K - 1M |
| **Agricultural Companies** | s.r.o. and a.s. entities | CZK 100K - 50M |
| **Research Institutions** | Agricultural research organizations | CZK 1M - 50M |
| **Municipal Entities** | Municipalities managing agricultural land | CZK 50K - 5M |
| **NGOs and Associations** | Environmental and rural development organizations | CZK 100K - 10M |

## API Integration

SZIF does not provide an official REST API. Data access is through the transparency portal web interface and periodic open data publications. The Prismatic adapter handles structured extraction from these sources.

### Access Methods

| Method | Description | Data Freshness |
|--------|-------------|---------------|
| **Transparency Portal** | Web-based search at szif.cz | Updated quarterly |
| **Open Data Exports** | CSV/Excel downloads from data.gov.cz | Annual publications |
| **EU Transparency** | Data submitted to EU Financial Transparency System | Annual, 6-month delay |
| **Annual Reports** | SZIF annual activity reports with aggregate statistics | Annual |
| **FOI Requests** | Information Act (106/1999 Sb.) for detailed data | On request |

## Query Examples

### curl Examples

```bash
# SZIF transparency portal search (web scraping required)
# Note: No official API - these are illustrative extraction patterns

# Download open data from Czech national data catalogue
curl -O "https://data.gov.cz/datova-sada/szif-prijemci-dotaci-2025.csv"

# EU Financial Transparency System (EAGF + EAFRD)
curl "https://ec.europa.eu/budget/fts/index_en.htm" \
  -d "country=CZ&fund=EAGF"

# Search SZIF website (requires web scraping)
curl "https://www.szif.cz/cs/seznam-prijemcu-dotaci?query=ExampleFarm"
```

### Elixir Integration

```elixir
# Search subsidy recipients by name
{:ok, recipients} = PrismaticOsint.Szif.search("Agrofert",
  year: 2025
)
# => %{
#   total: 15,
#   recipients: [
#     %{name: "AGROFERT, a.s.", ico: "26185610",
#       municipality: "Praha", district: "Praha",
#       total_payment: 2_350_000_000,
#       programs: [
#         %{name: "SAPS", amount: 1_200_000_000},
#         %{name: "Greening", amount: 450_000_000},
#         %{name: "Voluntary Coupled Support", amount: 350_000_000},
#         %{name: "Rural Development", amount: 350_000_000}
#       ]}
#   ]
# }

# Get payment history for a specific entity by ICO
{:ok, payments} = PrismaticOsint.Szif.payments(ico: "12345678",
  year_from: 2020,
  year_to: 2025
)
# => %{
#   entity: "Example Farm s.r.o.",
#   ico: "12345678",
#   total_all_years: 45_000_000,
#   by_year: [
#     %{year: 2025, total: 8_500_000, programs: [...]},
#     %{year: 2024, total: 7_800_000, programs: [...]},
#     %{year: 2023, total: 7_200_000, programs: [...]}
#   ]
# }

# Regional subsidy analysis
{:ok, region} = PrismaticOsint.Szif.by_region("CZ064",
  year: 2025,
  top_recipients: 20
)
# => %{
#   region: "CZ064 - Jihomoravsky kraj",
#   total_payments: 5_200_000_000,
#   recipient_count: 4_230,
#   top_recipients: [
#     %{name: "Large Agro a.s.", total: 120_000_000},
#     %{name: "Regional Coop", total: 85_000_000}
#   ],
#   by_program: %{
#     saps: 2_800_000_000,
#     greening: 1_100_000_000,
#     rural_development: 800_000_000,
#     other: 500_000_000
#   }
# }

# Cross-reference with land registry for subsidy-per-hectare analysis
{:ok, analysis} = PrismaticOsint.Pipeline.agricultural_analysis("12345678",
  sources: [:szif, :nahlizeni_kn, :ares, :justice_cz],
  checks: [:subsidy_per_hectare, :land_ownership, :corporate_structure]
)
# => %{
#   entity: "Example Farm s.r.o.",
#   total_subsidies: 8_500_000,
#   registered_land_area_ha: 850,
#   subsidy_per_hectare: 10_000,
#   land_ownership: :mixed,  # Own + leased
#   beneficial_owners: ["Jan Novak", "Marie Novakova"],
#   related_entities: [
#     %{name: "Farm Services s.r.o.", relationship: :common_owner}
#   ],
#   risk_indicators: [:high_subsidy_dependency]
# }

# Detect potential subsidy structuring across related entities
{:ok, network} = PrismaticOsint.Szif.subsidy_network("12345678",
  include_related: true,
  depth: 2
)
# => %{
#   central_entity: "Example Farm s.r.o.",
#   related_recipients: [
#     %{name: "Farm B s.r.o.", ico: "87654321", shared_owners: 2,
#       subsidies: 6_200_000, relationship: :common_beneficial_owner}
#   ],
#   aggregate_subsidies: 14_700_000,
#   structuring_risk: :medium
# }
```

## Data Schema

| Field | Type | Description |
|-------|------|-------------|
| `recipient.name` | string | Legal name of the subsidy recipient |
| `recipient.ico` | string | Company identification number |
| `recipient.municipality` | string | Registered municipality |
| `recipient.district` | string | Administrative district |
| `recipient.region` | string | NUTS3 region code |
| `payment.amount` | number | Payment amount in CZK |
| `payment.fund` | enum | EAGF, EAFRD, national |
| `payment.program` | string | Specific program or measure |
| `payment.measure_code` | string | EU measure code |
| `payment.financial_year` | integer | EU financial year |
| `payment.date` | date | Payment disbursement date |
| `compliance.sanctions` | number | Cross-compliance reduction amount |
| `compliance.violation_type` | string | Type of compliance violation (if any) |

## Use Cases

### Financial Intelligence and Due Diligence

SZIF data reveals the subsidy dependency of agricultural entities. Companies deriving a large percentage of their revenue from public subsidies face business risk from policy changes, CAP reforms, or compliance failures. Due diligence on agricultural entities should always include SZIF payment analysis to understand revenue composition and subsidy dependency ratios.

### Subsidy Fraud Detection

Analysis of SZIF payment patterns can reveal potential fraud indicators including entities receiving disproportionately high payments relative to their registered land area, networks of related entities that may be structured to circumvent payment caps, sudden increases in payment amounts without corresponding changes in agricultural activity, and recipients in municipalities with no significant agricultural activity.

### Land Concentration Analysis

The Czech Republic experienced significant land concentration after privatization, with large agricultural conglomerates controlling substantial portions of arable land. SZIF payment data, when cross-referenced with [Nahlizeni do KN](@/osint/nahlizeni-kn.md) land registry records, reveals the extent of land concentration and the subsidy flows to major agricultural holdings.

### Political Connection Investigation

Large agricultural subsidies create potential for political influence and conflict of interest. Cross-referencing top SZIF recipients with company ownership data from [Justice.cz](@/osint/justice-cz.md) and political office databases reveals connections between agricultural subsidy recipients and political actors -- a pattern that has been the subject of significant public scrutiny in Czech politics.

### Market Analysis and Agricultural Intelligence

Aggregate SZIF data reveals agricultural production patterns by region, the adoption rates of different support programs, and trends in Czech agricultural sector structure. This intelligence supports market analysis for agricultural input suppliers, food processors, and agricultural service providers.

### EU Fund Utilization Monitoring

SZIF data enables tracking of Czech utilization rates for EU agricultural funds. Under-utilization may indicate administrative barriers, while complete utilization may indicate unmet demand. This analysis supports policy recommendations and EU fund programming decisions.

## Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **No official API** | Data extraction requires web scraping or open data downloads | Use Prismatic adapter for automated extraction |
| **Publication delay** | Payment data published quarterly or annually with delay | Use most recent available data; note publication date |
| **Individual farmer privacy** | Natural person recipients may have limited detail published | Focus on legal entities (s.r.o., a.s.) with ICO |
| **Program complexity** | Over 30 different measures with varying rules | Map measures to simplified categories for analysis |
| **No land area data** | SZIF publishes payments but not the claimed land area | Cross-reference with [Nahlizeni do KN](@/osint/nahlizeni-kn.md) for land data |
| **Corporate structures** | Related entities may not be obvious in SZIF data alone | Cross-reference with [Justice.cz](@/osint/justice-cz.md) for ownership networks |

## Legal and Ethical Considerations

**EU Transparency Requirement**: Publication of CAP beneficiary data is mandated by EU Regulation 2021/2116. This data is explicitly intended for public scrutiny and accountability. There are no legal restrictions on analyzing published beneficiary data.

**Privacy of Natural Persons**: While legal entities' payment data is fully public, natural person (individual farmer) data is subject to GDPR considerations. The ECJ ruling in Schecke and Eifert (2010) limited some transparency requirements for individuals. Analysts should handle individual farmer data with appropriate privacy awareness.

**Agricultural Policy Context**: SZIF payment data should be interpreted in the context of CAP rules. High subsidies do not necessarily indicate fraud -- they may reflect large agricultural operations, participation in multiple support programs, or investment grants with legitimate business purposes.

**Investigative Journalism**: Czech media regularly use SZIF data for investigative reporting on agricultural subsidy distribution. The Agrofert/Babis case demonstrates the public interest in understanding who benefits from agricultural subsidies and whether political connections influence fund distribution.

## Integration with Prismatic Platform

Within the [Prismatic Platform](@/apps/prismatic.md), SZIF serves as a specialized financial intelligence source for the Czech agricultural sector.

- **Entity Financial Profiles**: SZIF payment data is integrated into entity financial profiles alongside [CEDR](@/osint/cedr.md) subsidy data, [Registr smluv](@/osint/registr-smluv.md) contract data, and [Verejne zakazky](@/osint/verejne-zakazky.md) procurement records.
- **Subsidy Network Analysis**: The platform maps subsidy flows across related entities using [Justice.cz](@/osint/justice-cz.md) ownership data, detecting potential structuring patterns.
- **Land-Subsidy Correlation**: SZIF payments are cross-referenced with [Nahlizeni do KN](@/osint/nahlizeni-kn.md) land records to calculate subsidy-per-hectare ratios and identify anomalies.
- **Risk Scoring**: Agricultural entity risk scores incorporate subsidy dependency ratios, compliance history, and network complexity from SZIF data.
- **Regional Analytics**: Aggregate SZIF data feeds the platform's regional intelligence dashboards for agricultural sector analysis.

## Best Practices

1. **Always use ICO for matching**: Company names may vary across databases. Use the ICO (company identification number) for precise entity matching between SZIF and other registries.

2. **Check related entities**: Large agricultural operations often span multiple legal entities. Use [Justice.cz](@/osint/justice-cz.md) to map corporate structures before analyzing aggregate subsidy receipts.

3. **Compare year-over-year**: Sudden changes in payment amounts may indicate land acquisition, program changes, compliance issues, or potential anomalies worth investigating.

4. **Cross-reference with CEDR**: [CEDR](@/osint/cedr.md) (Central Register of Subsidies) provides a broader view of all public subsidies, not just agricultural ones. Combining SZIF and CEDR data reveals total public funding dependency.

5. **Understand program rules**: Different subsidy programs have different eligibility criteria and payment mechanics. Familiarize yourself with basic CAP structure to interpret payment patterns correctly.

6. **Use regional benchmarks**: Compare an entity's subsidy-per-hectare ratio against regional averages to identify statistical outliers that may warrant investigation.

7. **Track compliance sanctions**: Cross-compliance reductions indicate regulatory violations. Repeated sanctions may signal systemic compliance issues.

## Related Providers

- [CEDR](@/osint/cedr.md) - Central Register of Subsidies (all sectors, not just agriculture)
- [ARES](@/osint/ares.md) - Czech business registry for entity identification
- [Nahlizeni do KN](@/osint/nahlizeni-kn.md) - Land registry for property and land area verification
- [Justice.cz](@/osint/justice-cz.md) - Commercial Register for ownership structure
- [Registr smluv](@/osint/registr-smluv.md) - Agricultural public contracts
- [Hlidac statu](@/osint/hlidac-statu.md) - Government watchdog with subsidy analytics
- [Verejne zakazky](@/osint/verejne-zakazky.md) - Public procurement for agricultural tenders

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)