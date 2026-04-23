+++
title = "OpenCorporates"
weight = 40
[extra]
icon = "building"
color = "cyan"
category = "global"
type = "company"
module = "OpenCorporates"
source_type = "company"
description = "Global company data aggregator - the largest open database of companies with 200M+ entities across 140+ jurisdictions"
has_api = true
url = "https://opencorporates.com"
rate_limit = "Free: 200 req/day, API plans from $500/mo"
capabilities = ["Company Search", "Officer Lookup", "Jurisdiction Coverage", "Corporate Relationships", "Filing History", "Bulk Data Access"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1159
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["OpenCorporates", "Global", "200M", "osint", "Prismatic Platform", "Czech", "Variable"]
tags = ["osint", "global", "opencorporates", "prismatic"]
quality_score = 74
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "OpenCorporates - Prismatic Platform"
+++

## Overview

OpenCorporates is the largest open database of companies in the world, aggregating official corporate [registry](/glossary/registry-otp/) data from over 140 jurisdictions into a single searchable platform. With records on over 200 million companies and 300 million officer appointments, OpenCorporates provides a unified interface to discover corporate entities, their directors, and corporate structures across countries. Data is sourced directly from official government registries and updated regularly, making it the most comprehensive cross-jurisdictional corporate intelligence resource available.

For [OSINT](/glossary/osint/) investigators, OpenCorporates is the go-to source for cross-jurisdictional corporate research. It enables analysts to trace corporate structures across borders, identify common directors between entities in different countries, and discover shell company networks that span multiple jurisdictions. The platform's officer search capability is particularly powerful for beneficial ownership investigations, where identifying the same individual serving as director of companies in multiple countries can reveal hidden corporate relationships and control structures.

The platform operates on the principle that corporate data should be openly accessible to promote transparency and accountability. While individual national registries may charge for access or present data in inconsistent formats, OpenCorporates normalizes this data into a consistent schema with standardized company types, officer roles, and status classifications. This normalization is essential for cross-jurisdictional analysis where comparing a Czech s.r.o. with a UK Limited or German GmbH requires understanding equivalent legal forms.

## Data Sources and Coverage

OpenCorporates aggregates data from official government company registries across 140+ jurisdictions. Each jurisdiction's data is updated on a schedule determined by the registry's publication frequency and data access methods. Major jurisdictions (UK, US states, EU countries) are updated frequently, while smaller or more restrictive jurisdictions may have less frequent updates.

| Data Type | Description | Coverage |
|-----------|-------------|----------|
| **Company Details** | Name, registration number, jurisdiction, status, incorporation date | 200M+ companies |
| **Registered Address** | Official registered address and business addresses | Where available |
| **Officers/Directors** | Names, roles, appointment and resignation dates | 300M+ appointments |
| **Company Type** | Legal form (limited, LLC, AG, s.r.o., etc.) | Standardized taxonomy |
| **Filing History** | Annual returns, accounts, and other filed documents | Major jurisdictions |
| **Corporate Links** | Parent companies, subsidiaries, and branch offices | Where registered |
| **Industry Codes** | SIC/NACE classifications where available | Variable by jurisdiction |
| **Previous Names** | Historical company name changes | Where tracked by registry |

### Jurisdiction Coverage Highlights

| Region | Key Jurisdictions | Coverage Depth |
|--------|-------------------|----------------|
| **Europe** | UK, Ireland, France, Germany, Netherlands, Czech Republic | Deep -- officers, filings |
| **North America** | US (all 50 states), Canada | Deep -- officers, filings |
| **Asia-Pacific** | Hong Kong, Singapore, Australia, New Zealand | Good -- core data |
| **Offshore** | BVI, Cayman, Panama, Jersey, Guernsey | Variable -- limited data |
| **Africa** | South Africa, Kenya, Nigeria | Growing coverage |
| **Latin America** | Brazil, Mexico, Colombia | Growing coverage |

## Technical Architecture

The Prismatic Platform integrates OpenCorporates through a REST API adapter with intelligent caching and rate limit management. The integration follows a tiered query strategy: for Czech entities, the platform first queries authoritative Czech registries (ARES, Justice.cz) for maximum data depth, then uses OpenCorporates for international corporate links and cross-jurisdictional officer searches.

The adapter implements a reconciliation engine that matches internal entity records against the OpenCorporates database using registration numbers, company names, and jurisdiction codes. This reconciliation capability is essential for large-scale due diligence operations where thousands of internal counterparty records need to be verified against official registry data.

Officer data normalization handles the significant variation in how different jurisdictions record officer names, roles, and appointment details. The normalization pipeline standardizes name formats, translates role titles into a common taxonomy, and resolves date format inconsistencies to enable accurate cross-jurisdictional officer matching.

The caching layer uses a jurisdiction-aware TTL strategy, with data from frequently updated jurisdictions (UK Companies House, US SEC) refreshed more often than data from jurisdictions with less frequent registry updates. This balances API quota consumption against data freshness requirements.

## API Integration

Prismatic Platform integrates OpenCorporates as the primary global corporate intelligence source for cross-jurisdictional investigations.

```elixir
# Search for a company by name
{:ok, results} = OpenCorporates.search_companies("Prismatic",
  jurisdiction: "cz",
  status: "active"
)
# => %{
#   total: 3,
#   companies: [
#     %{name: "Prismatic s.r.o.",
#       company_number: "12345678",
#       jurisdiction: "cz",
#       status: "active",
#       incorporation_date: ~D[2020-01-15],
#       registered_address: "Vaclavske namesti 1, Praha 1",
#       company_type: "spolecnost s rucenim omezenym",
#       opencorporates_url: "https://opencorporates.com/companies/cz/12345678"}
#   ]
# }

# Search for officers across jurisdictions
{:ok, officers} = OpenCorporates.search_officers("Jan Novak",
  jurisdiction: nil  # Search all jurisdictions
)

# Get company details with officers
{:ok, company} = OpenCorporates.get_company("cz", "12345678")

# Find companies sharing officers
{:ok, related} = OpenCorporates.companies_by_officer(officer_id)

# Reconcile entity list against OpenCorporates
{:ok, matches} = OpenCorporates.reconcile([
  %{name: "Prismatic s.r.o.", jurisdiction: "cz"},
  %{name: "Prismatic UK Ltd", jurisdiction: "gb"}
])

# Get filing history
{:ok, filings} = OpenCorporates.filings("cz", "12345678")

# Cross-jurisdictional director search
{:ok, directorships} = OpenCorporates.director_network("Jan Novak",
  jurisdictions: ["cz", "gb", "de", "sk"]
)
```

### Cross-Jurisdictional Due Diligence Pipeline

```elixir
defmodule PrismaticPerimeter.Compliance.CrossBorderDueDiligence do
  @moduledoc """
  Performs cross-jurisdictional corporate due diligence by combining
  OpenCorporates global data with local registry intelligence.
  """

  def investigate_corporate_network(company_name, home_jurisdiction) do
    with {:ok, company} <- OpenCorporates.search_companies(company_name, jurisdiction: home_jurisdiction),
         {:ok, officers} <- get_all_officers(company),
         {:ok, related} <- find_related_companies(officers),
         {:ok, sanctions} <- screen_all_entities(company, officers, related) do
      {:ok, %{
        primary_entity: company,
        officers: officers,
        related_companies: related,
        jurisdictions_involved: extract_jurisdictions(related),
        sanctions_exposure: sanctions,
        network_risk: assess_network_risk(related, sanctions),
        investigated_at: DateTime.utc_now()
      }}
    end
  end
end
```

## Use Cases

### Cross-Jurisdictional Due Diligence
- Verify company existence and status across 140+ jurisdictions from a single platform
- Identify common directors serving across entities in multiple countries
- Trace corporate structures and beneficial ownership chains through parent-subsidiary relationships
- Detect shell company networks used for money laundering, sanctions evasion, or tax avoidance

### Officer Intelligence
- Discover all companies where a specific individual serves as director globally
- Track appointment and resignation patterns to identify professional nominee directors
- Cross-reference with PEP databases and sanctions lists for compliance screening
- Map director networks to identify hidden control relationships

### Corporate Verification
- Validate entity existence and registration status for KYC/AML compliance
- Reconcile internal counterparty databases against official registry records
- Verify company type and legal form consistency across jurisdictions
- Confirm registered addresses for anti-fraud screening

### Competitive and Market Intelligence
- Map competitor corporate structures including subsidiaries and branch offices
- Track new company registrations in specific jurisdictions and sectors
- Identify market entry patterns through branch office and subsidiary formation

## Data Quality

OpenCorporates data quality is directly tied to the quality and timeliness of the source government registries. The platform adds value through normalization and cross-jurisdictional linking, but the underlying data authority comes from official registries.

| Quality Dimension | Assessment | Notes |
|-------------------|------------|-------|
| **Source Authority** | High -- official government registry data | 140+ jurisdictions |
| **Normalization** | Excellent -- consistent schema across jurisdictions | Standardized entity types |
| **Officer Data** | Good -- 300M+ appointments with role standardization | Variable by jurisdiction |
| **Currency** | Variable -- depends on registry update frequency | Major jurisdictions weekly+ |
| **Offshore Coverage** | Limited -- restricted data from secretive jurisdictions | BVI, Cayman less complete |
| **Historical Data** | Good -- company lifecycle events tracked | From registry digitization |

### API Access

| Tier | Queries/Day | Features |
|------|------------|----------|
| **Free** | 200 | Basic company and officer search |
| **API Standard** | Higher | Full API, reconciliation |
| **API Premium** | Unlimited | Bulk data, advanced features |
| **Enterprise** | Custom | Data licensing, offline analysis |

Authentication via API token. Free tier available with registration.

## Platform Integration

Within the Prismatic Platform, OpenCorporates serves as the primary global corporate intelligence source for cross-jurisdictional investigations. The adapter integrates with the Czech registry ecosystem (ARES, Justice.cz, VR.cz) to provide a layered approach: deep local intelligence for Czech entities complemented by broad international coverage through OpenCorporates.

The integration supports corporate network visualization, mapping relationships between entities across jurisdictions based on shared officers, registered addresses, and corporate link data. This visualization capability is essential for complex due diligence investigations involving multi-jurisdictional corporate structures.

## NABLA Compliance

OpenCorporates integration satisfies NABLA requirements through its direct sourcing from official government registries. The Provenance Mandatory axiom is met through attribution to specific registry sources with company numbers and jurisdiction codes. Signal Plurality is enforced by cross-referencing OpenCorporates data with local registry data (ARES for Czech entities, Companies House for UK entities) to validate consistency.

Source Independence is inherently strong since OpenCorporates aggregates from hundreds of independent government registries, providing natural multi-source validation when the same entity appears in multiple jurisdictions.

## Performance

| Metric | Target | Typical |
|--------|--------|---------|
| **Company search** | < 1s | 300-700ms |
| **Officer search** | < 1s | 400-800ms |
| **Company detail fetch** | < 500ms | 200-400ms |
| **Reconciliation (100 entities)** | < 60s | 20-40s |
| **Cross-jurisdictional officer search** | < 2s | 800ms-1.5s |
| **Cache hit ratio** | > 70% | 75-85% |

## Related Resources

- [ARES](/osint/ares/) - Czech business registry for domestic entity data
- [Companies House](/osint/companies-house/) - UK company registry
- [SEC EDGAR](/osint/sec-edgar/) - US corporate filings
- [Crunchbase](/osint/crunchbase/) - Business and startup intelligence
- [Justice.cz](/osint/justice-cz/) - Czech Commercial Register
- [OSINT Core](/apps/prismatic-osint-core/) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](/apps/prismatic-perimeter/) - Corporate entity risk assessment

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)