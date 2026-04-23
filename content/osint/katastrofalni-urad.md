+++
title = "ERU / Czech Energy Regulator"
weight = 54
[extra]
category = "czech"
type = "regulatory"
module = "Eru"
description = "Czech Energy Regulatory Office - license holders and energy market data"
has_api = false
url = "https://eru.cz"
rate_limit = "Public website, no official API"
capabilities = ["License Search", "Market Data", "Price Regulation", "Consumer Protection", "Operator Registry", "Energy Statistics"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1335
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ERU", "Czech", "Energy", "Regulator", "Regulatory", "Office", "osint", "Prismatic Platform", "License", "ARES"]
tags = ["osint", "czech", "eru---czech-energy-regulator", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "ERU / Czech Energy Regulator - Prismatic Platform"
+++

## Overview

The Energy Regulatory Office (ERU -- Energeticky regulacni urad) is the Czech national authority for energy market regulation, established by Act No. 458/2000 Sb. (the Energy Act). It maintains a public [registry](/glossary/registry-otp/) of all licensed energy operators in the Czech Republic including electricity generators, distributors, and traders as well as gas and heating companies. For [OSINT](/glossary/osint/) purposes, ERU data reveals the energy sector landscape, operator licenses, and regulatory compliance status.

ERU operates under the authority of Czech energy legislation and EU energy directives, making it the definitive source for energy sector intelligence in the Czech Republic. The office regulates electricity, gas, and heat supply markets, sets regulated prices for monopoly segments (distribution, transmission), and oversees consumer protection in energy markets. Its publicly available data covers approximately 1,500 licensed energy operators across all segments of the Czech energy market.

For analysts conducting due diligence on energy companies or investigating energy sector financial flows, ERU provides authoritative verification of operating licenses, regulatory compliance status, and market participation history. The energy sector's strategic importance to national security and its intersection with critical infrastructure protection make ERU data relevant to both corporate intelligence and national security investigations.

## Data Sources and Coverage

ERU maintains several interconnected databases that collectively provide comprehensive energy sector intelligence.

| Data Source | Description | Update Frequency |
|-------------|-------------|-----------------|
| **License Registry** | All licensed energy operators with license scope and conditions | Real-time (as issued) |
| **Operator Details** | Company name, ICO, registered address, license categories | Updated with changes |
| **Regulated Prices** | Price decisions for distribution, transmission, system services | Annually (price decisions) |
| **Market Reports** | Annual and quarterly energy market reports with statistics | Quarterly/Annual |
| **Regulatory Decisions** | Enforcement actions, compliance rulings, penalty decisions | As issued |
| **Consumer Statistics** | Complaint volumes, supplier switching rates, market quality | Annual |
| **Energy Balance** | National electricity and gas balance sheets, import/export | Monthly/Annual |
| **Renewable Energy** | Supported source registrations, feed-in tariff recipients | Updated with changes |
| **REMIT Monitoring** | Wholesale energy market integrity monitoring data | Continuous |

### License Categories

| License Type | Code | Description | Count (approx.) |
|-------------|------|-------------|----------------|
| Electricity Generation | 11 | All generation facilities including renewables | 600+ |
| Electricity Distribution | 12 | Regional and local distribution operators | 300+ |
| Electricity Trading | 13 | Licensed electricity traders | 200+ |
| Electricity Transmission | 14 | Transmission system operator (CEPS) | 1 |
| Gas Distribution | 22 | Gas distribution operators | 100+ |
| Gas Trading | 23 | Licensed gas traders | 100+ |
| Gas Transmission | 24 | Gas transmission operator (NET4GAS) | 1 |
| Gas Storage | 25 | Underground gas storage operators | 5 |
| Heat Production | 31 | District heating producers | 200+ |
| Heat Distribution | 32 | District heating distributors | 150+ |

## API Integration

ERU does not provide an official REST API. Data access is through the public website at `https://eru.cz` and the license registry at `https://licence.eru.cz`. The Prismatic Platform uses structured web scraping with appropriate request throttling to extract data.

### Access Methods

| Method | URL | Description |
|--------|-----|-------------|
| License Registry | `https://licence.eru.cz/` | Searchable license database |
| Price Decisions | `https://eru.cz/cenova-rozhodnuti` | Regulated price decisions (PDF) |
| Annual Reports | `https://eru.cz/rocni-zpravy` | Market reports and statistics |
| Open Data | `https://data.gov.cz` (filtered by ERU) | Machine-readable datasets |
| REMIT Data | Via ACER REMIT portal | Wholesale market monitoring |

## Query Examples

### Elixir Integration

```elixir
# Search energy operators by keyword
{:ok, operators} = PrismaticOsint.Eru.search_operators("solar",
  license_type: :electricity_generation
)
# => [%{name: "Solar Farm s.r.o.", ico: "12345678",
#       license: "111234567", scope: "Electricity generation - photovoltaic",
#       valid_from: ~D[2020-01-15], valid_to: ~D[2045-01-14]}]

# Get operator details by ICO
{:ok, detail} = PrismaticOsint.Eru.operator(ico: "12345678")
# => %{name: "Example Energy a.s.", ico: "12345678",
#       address: "Praha 1, Vodickova 123",
#       licenses: [
#         %{type: :electricity_generation, number: "111234567",
#           scope: "Combined cycle gas turbine, 450 MW",
#           valid_from: ~D[2015-06-01], valid_to: ~D[2040-05-31]},
#         %{type: :electricity_trading, number: "131234567",
#           scope: "Electricity trading within Czech Republic",
#           valid_from: ~D[2018-03-15], valid_to: ~D[2043-03-14]}
#       ]}

# List all licenses by type with filtering
{:ok, licenses} = PrismaticOsint.Eru.licenses(
  type: :electricity_generation,
  region: "Praha",
  active_only: true
)

# Get regulated prices for distribution
{:ok, prices} = PrismaticOsint.Eru.regulated_prices(
  segment: :electricity_distribution,
  year: 2025
)

# Cross-reference with ARES business registry
{:ok, enriched} = PrismaticOsint.Pipeline.enrich_energy_operator("12345678",
  sources: [:eru, :ares, :registr_smluv, :cedr]
)
```

### curl Examples (Web Scraping Endpoints)

```bash
# License registry search (HTML response, requires parsing)
curl "https://licence.eru.cz/Licence/Search?SearchText=solar&LicenceType=11"

# Download annual report
curl -O "https://eru.cz/documents/annual-report-2025.pdf"

# Open data catalog search for ERU datasets
curl "https://data.gov.cz/api/v2/package_list?q=eru+energy"
```

## Data Schema

The Prismatic adapter normalizes ERU data into the following entity model:

| Field | Type | Description |
|-------|------|-------------|
| `ico` | string | Company identification number (8 digits) |
| `name` | string | Legal entity name |
| `address` | object | Registered address (street, city, postal code) |
| `license_number` | string | ERU license identifier |
| `license_type` | enum | License category code |
| `license_scope` | string | Detailed description of licensed activity |
| `installed_capacity` | float | Generation capacity in MW (if applicable) |
| `fuel_type` | enum | Primary energy source (solar, wind, gas, coal, nuclear, biomass) |
| `valid_from` | date | License validity start date |
| `valid_to` | date | License validity end date |
| `status` | enum | `active`, `suspended`, `revoked`, `expired` |
| `regulatory_actions` | array | History of enforcement actions |
| `price_decisions` | array | Applicable regulated price decisions |

## Use Cases

### Energy Sector Intelligence

ERU data enables comprehensive mapping of the Czech energy market. Analysts can identify all active operators in any segment, track market entry and exit through license grants and revocations, and assess the competitive landscape across electricity, gas, and heating markets. This intelligence supports investment analysis, market entry strategy, and competitive benchmarking.

### Due Diligence on Energy Companies

Before engaging with energy sector entities -- as investors, lenders, partners, or customers -- analysts verify that the entity holds valid licenses for their claimed activities. ERU data reveals whether licenses are current, whether conditions or restrictions apply, and whether the entity has faced regulatory action. This verification is particularly important given the regulated nature of energy markets where operating without a valid license is illegal.

### Subsidy and Grant Verification

Czech energy companies, particularly renewable energy operators, receive substantial subsidies through feed-in tariffs and green certificates. Cross-referencing ERU license data with [SZIF](/osint/szif/) agricultural subsidies and [CEDR](/osint/cedr/) general subsidies reveals the total public funding received by energy entities and potential double-dipping across programs.

### Critical Infrastructure Assessment

Energy infrastructure operators are classified as critical infrastructure under Czech and EU regulations. ERU data identifies these operators, enabling assessment of critical infrastructure concentration, single points of failure, and supply chain dependencies in the energy sector.

### Environmental and Climate Intelligence

By mapping generation license types and installed capacities, analysts can assess the Czech energy mix, track the transition from fossil fuels to renewables, and identify operators whose assets may become stranded as climate regulations tighten.

## Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **No official API** | Requires web scraping with parsing overhead | Structured scraping with caching |
| **Czech language only** | All data and documents in Czech | Automated translation and bilingual entity matching |
| **PDF-heavy documents** | Price decisions and reports published as PDFs | PDF extraction pipeline with OCR fallback |
| **Limited historical data online** | Older regulatory decisions may not be available | Request historical data through FOI (Act 106/1999 Sb.) |
| **License scope text unstructured** | Free-text descriptions of licensed activities | NLP-based scope classification |
| **No beneficial ownership** | ERU tracks license holders, not ultimate owners | Cross-reference with [Justice.cz](/osint/justice-cz/) for ownership chains |

## Legal and Ethical Considerations

ERU data is publicly available under Czech law. The license registry is explicitly designed for public access, and using this data for research, due diligence, and regulatory compliance purposes is both legal and encouraged. However, analysts should consider:

**Data Currency**: ERU website data may not reflect the most recent license changes. For time-critical decisions, verify directly with ERU or request official extracts.

**Commercial Use**: While the data itself is public, systematic commercial redistribution may be subject to database protection rights under EU Directive 96/9/EC. Confirm licensing terms for commercial derivative products.

**Combining with Personal Data**: When cross-referencing ERU corporate data with personal data (e.g., linking companies to natural person directors), GDPR obligations apply to the personal data component.

## Integration with Prismatic Platform

Within the [Prismatic Platform](/apps/prismatic/), ERU data feeds into the Czech entity intelligence pipeline alongside [ARES](/osint/ares/), [Justice.cz](/osint/justice-cz/), and financial registries.

- **Entity Enrichment**: Energy sector licenses are automatically linked to ARES company profiles, enriching business entities with their energy market activities.
- **Regulatory Risk Scoring**: Enforcement actions and license conditions contribute to the entity risk score in the platform's compliance assessment module.
- **Sector Mapping**: ERU data powers sector-level dashboards showing energy market structure, concentration, and trends within [Prismatic Perimeter](/apps/prismatic-perimeter/).
- **Cross-Registry Correlation**: License holder ICOs are automatically cross-referenced with [Registr smluv](/osint/registr-smluv/) contracts, [CEDR](/osint/cedr/) subsidies, and [Verejne zakazky](/osint/verejne-zakazky/) procurement to build comprehensive financial profiles.

## Best Practices

1. **Verify license currency**: Always check that a license is currently active before relying on it for compliance or due diligence purposes.

2. **Map the full license portfolio**: Companies may hold multiple licenses across different energy segments. Query by ICO rather than license number to get the complete picture.

3. **Cross-reference with ARES**: ERU identifies license holders but ARES provides corporate structure, financial data, and beneficial ownership context.

4. **Monitor license changes**: Track license grants, revocations, and modifications to detect market entry/exit signals and regulatory issues.

5. **Parse scope carefully**: License scope descriptions contain critical details about capacity, technology, and geographic limitations that are not available in structured fields.

6. **Throttle requests**: Although no rate limit is officially published, maintain responsible scraping practices with 1-2 second delays between requests.

## Related Providers

- [ARES](/osint/ares/) - Business registry for operator identification
- [Registr smluv](/osint/registr-smluv/) - Energy sector public contracts
- [Verejne zakazky](/osint/verejne-zakazky/) - Energy procurement tenders
- [CEDR](/osint/cedr/) - Subsidies for energy projects
- [Hlidac statu](/osint/hlidac-statu/) - Watchdog analytics on energy sector
- [SZIF](/osint/szif/) - Agricultural fund (bioenergy subsidies)
- [Nahlizeni do KN](/osint/nahlizeni-kn/) - Property records for energy infrastructure sites

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)