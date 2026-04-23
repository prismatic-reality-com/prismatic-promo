+++
title = "Registr smluv"
weight = 10
[extra]
icon = "document-text"
color = "blue"
category = "czech"
type = "company"
module = "RegistrSmluv"
source_type = "company"
description = "Czech Contract Registry - mandatory publication of public-sector contracts above CZK 50,000"
has_api = true
url = "https://smlouvy.gov.cz"
rate_limit = "No official limit, recommended 1 req/sec"
capabilities = ["Contract Search", "Counterparty Lookup", "Contract Value Analysis", "Public Spending Tracking", "ICO Cross-Reference", "Full-Text Search"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1349
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Registr", "smluv", "Czech", "Contract", "Registry", "50000", "osint", "Prismatic Platform", "Complete", "Description"]
tags = ["osint", "czech", "registr-smluv", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "Registr smluv - Prismatic Platform"
+++

## Overview

Registr smluv (Czech Contract [Registry](@/glossary/registry-otp.md)) is a legally mandated public database where Czech state bodies, municipalities, state-owned enterprises, and other public entities must publish contracts valued above CZK 50,000. Established by Act No. 340/2015 Sb., contracts that are not published within 30 days are considered void. This makes it one of the most complete sources of public-sector financial relationships in the Czech Republic.

For [OSINT](@/glossary/osint.md) investigations, the registry reveals business relationships between private companies and state entities, contract values, counterparty networks, and patterns of public spending. The legal requirement for publication and the void sanction for non-compliance ensure nearly complete coverage of public-sector contracting above the threshold.

The registry has been operational since July 1, 2016, and has accumulated over 5 million published contracts. It covers all ministries, government agencies, regional authorities, municipalities with extended competence, state-owned enterprises, public universities, public hospitals, and other entities subject to the publication obligation. Certain contracts are exempt from publication -- those involving intelligence services, military procurement classified for security reasons, and contracts with natural persons concerning their personal property.

The transparency provided by Registr smluv has transformed Czech public procurement oversight. Independent watchdog organizations like [Hlidac statu](@/osint/hlidac-statu.md) systematically analyze registry data to identify procurement anomalies, political connections in contracting, and spending patterns. For OSINT analysts, this creates a rich ecosystem of both raw data and analytical tools for investigating public-sector financial relationships.

## Data Sources and Coverage

| Data Category | Description | Completeness |
|--------------|-------------|-------------|
| **Contract Parties** | Full legal identification of all signatories (name, ICO, address) | Complete (required by law) |
| **Contract Value** | Total contract value in CZK, including VAT treatment | Required for all contracts |
| **Subject Matter** | Description of contracted goods, services, or works | Free-text, quality varies |
| **Contract Documents** | Full-text PDF/DOC attachments of signed contracts | Mandatory attachments |
| **Effective Dates** | Signing date, publication date, effectiveness date, validity period | Complete |
| **Amendments** | Linked amendments, addenda, and supplementary agreements | Complete with cross-references |
| **Contract ID** | Unique identifier in the registry system | System-generated |
| **Publication Metadata** | Publishing entity, publication timestamp, format | System-generated |
| **Linked Contracts** | References to related framework agreements or parent contracts | Where applicable |

### Entity Types Subject to Publication

| Entity Category | Examples | Coverage |
|----------------|----------|----------|
| **State Administration** | Ministries, central agencies, regulatory bodies | Complete |
| **Regional Authorities** | Kraje (regions), statutory cities | Complete |
| **Municipalities** | Cities and towns with extended competence | Varies by size |
| **State-Owned Enterprises** | CEZ, Czech Railways, Czech Post | Complete |
| **Public Healthcare** | University hospitals, state health institutes | Complete |
| **Public Education** | Public universities, research institutions | Complete |
| **State Funds** | SZIF, SFDI, State Environmental Fund | Complete |
| **Constitutional Bodies** | Courts, Constitutional Court, Supreme Audit Office | Complete |

## API Integration

The registry provides an open data API at `https://smlouvy.gov.cz/api/v1/` with JSON responses. No authentication is required. The API supports search, filtering, and structured data retrieval.

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/smlouvy/vyhledavani` | GET | Full-text search across contracts |
| `/api/v1/smlouvy/{id}` | GET | Get specific contract by ID |
| `/api/v1/smlouvy/ico/{ico}` | GET | Get all contracts for a specific ICO |
| `/api/v1/prilohy/{id}` | GET | Download contract attachment |

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `dotaz` | string | Full-text search query |
| `ico` | string | Filter by party ICO |
| `datumOd` | date | Contract date from (YYYY-MM-DD) |
| `datumDo` | date | Contract date to (YYYY-MM-DD) |
| `hodnotaOd` | number | Minimum contract value |
| `hodnotaDo` | number | Maximum contract value |
| `strana` | integer | Page number for pagination |
| `velikostStranky` | integer | Results per page (max 100) |

## Query Examples

### curl Examples

```bash
# Full-text search for contracts
curl "https://smlouvy.gov.cz/api/v1/smlouvy/vyhledavani?dotaz=IT%20services&strana=1&velikostStranky=50"

# Get all contracts for a specific company by ICO
curl "https://smlouvy.gov.cz/api/v1/smlouvy/vyhledavani?ico=12345678&strana=1"

# Search with date range and value filter
curl "https://smlouvy.gov.cz/api/v1/smlouvy/vyhledavani?datumOd=2025-01-01&datumDo=2025-12-31&hodnotaOd=1000000"

# Get specific contract details
curl "https://smlouvy.gov.cz/api/v1/smlouvy/12345678"

# Search for contracts between two specific entities
curl "https://smlouvy.gov.cz/api/v1/smlouvy/vyhledavani?ico=12345678&dotaz=Ministerstvo%20financi"

# Download contract attachment
curl -O "https://smlouvy.gov.cz/api/v1/prilohy/attachment-id"
```

### Elixir Integration

```elixir
# Search contracts by keyword
{:ok, results} = PrismaticOsint.RegistrSmluv.search("cybersecurity consulting",
  date_from: ~D[2025-01-01],
  date_to: ~D[2025-12-31],
  min_value: 500_000
)
# => %{
#   total: 47,
#   contracts: [
#     %{id: "12345", subject: "Cybersecurity audit services",
#       value: 2_500_000, currency: "CZK",
#       parties: [
#         %{name: "Ministerstvo vnitra", ico: "00007064", role: :contracting_authority},
#         %{name: "Security Firm s.r.o.", ico: "87654321", role: :contractor}
#       ],
#       signed: ~D[2025-03-15], published: ~D[2025-03-20]}
#   ]
# }

# Get all contracts for a specific company
{:ok, contracts} = PrismaticOsint.RegistrSmluv.by_ico("12345678",
  date_from: ~D[2020-01-01]
)
# => %{total: 23, total_value: 45_000_000, contracts: [...]}

# Map government supplier network
{:ok, network} = PrismaticOsint.RegistrSmluv.supplier_network("12345678",
  depth: 2,
  include_subcontractors: true
)
# => %{
#   central_entity: "Example Corp s.r.o.",
#   government_clients: [%{name: "Min. dopravy", contracts: 5, total: 12_000_000}],
#   co_suppliers: [%{name: "Partner s.r.o.", shared_clients: 3}],
#   total_government_revenue: 45_000_000
# }

# Analyze contracting patterns for anomaly detection
{:ok, analysis} = PrismaticOsint.RegistrSmluv.analyze_patterns("12345678",
  checks: [:concentration, :timing, :value_clustering, :amendment_frequency]
)
# => %{
#   concentration_risk: :medium,  # 60% revenue from single client
#   timing_anomalies: [],
#   value_clustering: :none,
#   amendment_frequency: :elevated  # 40% of contracts amended
# }

# Cross-reference with beneficial ownership data
{:ok, enriched} = PrismaticOsint.Pipeline.contract_investigation("12345678",
  sources: [:registr_smluv, :ares, :justice_cz, :verejne_zakazky, :hlidac_statu]
)
```

## Data Schema

| Field | Type | Description |
|-------|------|-------------|
| `identifikator.idSmlouvy` | string | Unique contract identifier |
| `identifikator.idVerze` | integer | Version number (for amendments) |
| `casZverejneni` | datetime | Publication timestamp |
| `schpiloha` | object | Contract document attachments |
| `smlouva.subjekt.nazev` | string | Publishing entity name |
| `smlouva.subjekt.ico` | string | Publishing entity ICO |
| `smlouva.smluvniStrana[].nazev` | string | Counterparty name |
| `smlouva.smluvniStrana[].ico` | string | Counterparty ICO |
| `smlouva.smluvniStrana[].adresa` | string | Counterparty address |
| `smlouva.predmet` | string | Contract subject description |
| `smlouva.hodnotaBezDph` | number | Value without VAT |
| `smlouva.hodnotaVcetneDph` | number | Value including VAT |
| `smlouva.datumUzavreni` | date | Contract signing date |
| `smlouva.cisloSmlouvy` | string | Internal contract reference number |
| `smlouva.navlesniCjPrislusneSmlouvy` | string | Reference to parent contract |
| `smlouva.odkpiloha[].nazevSouboru` | string | Attachment filename |

## Use Cases

### Government Supplier Intelligence

By aggregating all contracts for a target company, analysts build comprehensive profiles of government supplier relationships. This reveals which ministries and agencies are clients, the volume and frequency of contracts, and whether the company is dependent on public-sector revenue. Companies with highly concentrated government revenue face significant business risk from political changes.

### Conflict of Interest Detection

Cross-referencing contract parties with company ownership data from [Justice.cz](@/osint/justice-cz.md) reveals potential conflicts of interest -- such as companies owned by relatives of government officials winning contracts from the official's agency. [Hlidac statu](@/osint/hlidac-statu.md) automates much of this analysis.

### Public Spending Analysis

Aggregate analysis of contract data reveals spending patterns across government sectors, identifies the largest suppliers, tracks year-over-year spending trends, and highlights agencies with unusual contracting practices. This supports budget oversight, policy analysis, and investigative journalism.

### Shell Company Detection

Companies that exist primarily to win public contracts while having minimal staff, no public presence, and recent registration dates may be shell entities used for corruption or tax optimization. The combination of Registr smluv contract data with [ARES](@/osint/ares.md) financial data and [Nahlizeni do KN](@/osint/nahlizeni-kn.md) property records helps identify these patterns.

### Supply Chain Mapping

For companies that provide critical services to the state (IT infrastructure, energy, healthcare), contract analysis reveals their role in national supply chains and identifies potential single points of failure or concentration risks.

## Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **CZK 50,000 threshold** | Contracts below threshold are not published | Use [Verejne zakazky](@/osint/verejne-zakazky.md) for smaller procurements |
| **Security exemptions** | Intelligence and classified military contracts excluded | These represent a small fraction of total spending |
| **Subject description quality** | Free-text descriptions vary in detail and accuracy | Use full-text search combined with ICO-based filtering |
| **Natural person contracts** | Some contracts with individuals exempt from full publication | Limited impact for corporate investigation |
| **Attachment format variety** | PDFs may be scanned images requiring OCR | PDF extraction pipeline with OCR fallback |
| **No price breakdown** | Only total value published; no line-item detail | Request detailed pricing through FOI (Act 106/1999 Sb.) |

## Legal and Ethical Considerations

**Public Data by Law**: All data in Registr smluv is published pursuant to Act No. 340/2015 Sb. and is explicitly intended for public access. There are no legal restrictions on accessing, analyzing, or redistributing this data.

**Contract Transparency**: The registry was created to enhance transparency in public spending. Using it for investigative, analytical, and oversight purposes aligns with its legislative intent.

**Personal Data in Contracts**: While contract text may contain personal data of signatories, the publication is authorized by law. Downstream processing of personal data extracted from contracts must comply with GDPR.

**Commercial Sensitivity**: Published contracts may contain commercially sensitive information. While this data is public by law, responsible use includes considering the impact of analysis on competitive dynamics.

## Integration with Prismatic Platform

Within the [Prismatic Platform](@/apps/prismatic.md), Registr smluv serves as the primary Czech public-sector financial intelligence source.

- **Supplier Network Mapping**: Contract data is analyzed to build supplier relationship graphs showing connections between companies and government entities.
- **Anomaly Detection**: Statistical analysis of contracting patterns identifies unusual behaviors -- concentration, timing patterns, value clustering, and amendment frequency.
- **Cross-Registry Enrichment**: Contract parties are automatically enriched with [ARES](@/osint/ares.md) company data, [Justice.cz](@/osint/justice-cz.md) ownership information, and [UOHS](@/osint/uohs.md) competition authority decisions.
- **Financial Intelligence**: Contract values feed into entity financial profiles alongside [CEDR](@/osint/cedr.md) subsidy data and [Verejne zakazky](@/osint/verejne-zakazky.md) procurement records.
- **Watchdog Integration**: Platform findings are cross-referenced with [Hlidac statu](@/osint/hlidac-statu.md) analytics for enhanced insight.

## Best Practices

1. **Search by ICO, not name**: Company names may vary across contracts. ICO provides precise entity matching.

2. **Check amendments**: Many contracts are modified through amendments that change value, scope, or duration. Always retrieve the complete amendment chain.

3. **Analyze temporal patterns**: Plot contract signing dates to identify suspicious clustering (e.g., many contracts signed just before elections or budget deadlines).

4. **Cross-reference with procurement**: Contracts often result from formal procurement procedures. Cross-reference with [Verejne zakazky](@/osint/verejne-zakazky.md) to understand the competitive context.

5. **Download attachments**: The contract text in attachments often contains more detail than the structured metadata. Parse PDFs for pricing, scope, and penalty clauses.

6. **Track subcontractors**: Some contracts specify subcontractors. Map the full supply chain by analyzing contract text for subcontractor references.

7. **Use open data exports**: For large-scale analysis, download bulk data exports rather than paginating through the API.

## Related Providers

- [ARES](@/osint/ares.md) - Czech business registry for company identification
- [Justice.cz](@/osint/justice-cz.md) - Commercial Register with beneficial owners
- [Hlidac statu](@/osint/hlidac-statu.md) - Government watchdog with contract analytics
- [Verejne zakazky](@/osint/verejne-zakazky.md) - Public procurement portal
- [CEDR](@/osint/cedr.md) - Central Register of Subsidies
- [UOHS](@/osint/uohs.md) - Competition authority reviewing procurement
- [Nahlizeni do KN](@/osint/nahlizeni-kn.md) - Property records for asset correlation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)