+++
title = "Crunchbase"
weight = 41
[extra]
icon = "building"
color = "cyan"
category = "global"
type = "company"
module = "Crunchbase"
source_type = "company"
description = "Business and startup intelligence - funding rounds, acquisitions, key personnel, and company profiles"
has_api = true
url = "https://www.crunchbase.com"
rate_limit = "Basic: limited, Pro: $49/mo, Enterprise: custom"
capabilities = ["Company Profiles", "Funding Rounds", "Acquisition Tracking", "People Search", "Industry Analysis", "Investment Chains"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1585
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Crunchbase", "Business", "osint", "global", "Prismatic Platform", "Basic", "Companies"]
tags = ["osint", "global", "crunchbase", "prismatic"]
quality_score = 90
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "Crunchbase - Prismatic Platform"
+++

## Overview

Crunchbase is the leading platform for business and startup intelligence, tracking information on over 2 million companies, 1 million funding rounds, and 700,000 key personnel worldwide. Originally launched in 2007 as a community-curated database associated with TechCrunch, Crunchbase spun off as an independent company in 2015 and has since evolved into a comprehensive business intelligence platform that combines user contributions with AI-powered data collection, news monitoring, and partnerships with venture capital firms, accelerators, corporate development teams, and news organizations.

The platform provides the most comprehensive publicly available view of the startup and technology investment ecosystem, tracking the complete lifecycle of companies from incorporation through seed funding, growth rounds, acquisitions, IPOs, and closures. Each company profile aggregates data from multiple sources: direct submissions from company representatives, contributions from the investor community, automated news monitoring, SEC filings analysis, press release parsing, and partnership data from venture capital limited partner networks.

For [OSINT](@/glossary/osint.md) analysts, Crunchbase reveals the financial backing, leadership networks, acquisition histories, and competitive positioning of technology companies and startups. This intelligence supports multiple analytical objectives. Corporate due diligence benefits from understanding a company's funding trajectory and investor quality. Competitive intelligence leverages funding data and hiring patterns to assess strategic direction. Investigative analysis uses personnel records and board connections to map influence networks. And market intelligence teams use Crunchbase to identify emerging companies, track sector investment trends, and assess market dynamics.

Crunchbase data is particularly valuable for understanding the power dynamics within technology ecosystems. Investor-company relationships reveal influence networks: a venture capital firm's portfolio companies may share board members, strategic partnerships, and competitive interests that are not obvious from public corporate filings alone. Similarly, tracking personnel movement between companies reveals talent flows and knowledge transfer patterns that inform competitive and strategic analysis.

The platform's data quality is maintained through a combination of automated validation, community verification, and editorial review. Key data points (funding amounts, acquisition terms) are cross-validated against SEC filings, press releases, and direct company confirmations. However, as with any crowdsourced platform, data completeness and accuracy vary, particularly for companies outside the US technology ecosystem.

## Data Sources and Coverage

### Data Collection Methods

| Method | Data Types | Reliability |
|--------|-----------|-------------|
| **Direct Submissions** | Company profiles, funding rounds, personnel | High (company-verified) |
| **AI-Powered Collection** | News mentions, press releases, SEC filings | High (multi-source validated) |
| **Community Contributions** | Profile updates, corrections, new entries | Medium (community-reviewed) |
| **Partner Data** | VC portfolio data, accelerator cohorts | High (institutional data) |
| **SEC Filing Analysis** | IPO data, Form D filings, proxy statements | High (regulatory source) |
| **News Monitoring** | Funding announcements, acquisitions, launches | Medium (publication-dependent) |

### Coverage Statistics

| Metric | Coverage |
|--------|----------|
| **Total Companies** | 2,000,000+ |
| **Active Companies** | 800,000+ |
| **Funding Rounds** | 1,000,000+ |
| **Total Investors** | 200,000+ |
| **Key Personnel** | 700,000+ |
| **Acquisitions** | 100,000+ |
| **IPOs** | 5,000+ |
| **Geographic Coverage** | 200+ countries |
| **Industry Categories** | 700+ |
| **Data Updates** | Daily (AI), continuous (community) |

### Geographic and Sector Distribution

| Region | Companies | Coverage Depth |
|--------|-----------|---------------|
| **North America** | 1,000,000+ | Comprehensive |
| **Europe** | 400,000+ | Strong |
| **Asia-Pacific** | 300,000+ | Good (varies by country) |
| **Latin America** | 100,000+ | Moderate |
| **Middle East & Africa** | 100,000+ | Growing |
| **Czech Republic** | ~5,000 | Moderate (tech-focused) |

## API Integration

### Authentication

Crunchbase API uses API key authentication passed as a query parameter (`user_key`) or via header. Keys are tied to subscription plans.

**Base URL**: `https://api.crunchbase.com/api/v4/`

### API Endpoints

| Endpoint | Method | Description | Plan |
|----------|--------|-------------|------|
| `/entities/organizations/{id}` | GET | Organization profile | Basic+ |
| `/entities/people/{id}` | GET | Person profile | Basic+ |
| `/entities/funding_rounds/{id}` | GET | Funding round details | Basic+ |
| `/entities/acquisitions/{id}` | GET | Acquisition details | Basic+ |
| `/searches/organizations` | POST | Search organizations | Pro+ |
| `/searches/people` | POST | Search people | Pro+ |
| `/searches/funding_rounds` | POST | Search funding rounds | Pro+ |
| `/autocompletes` | GET | Entity autocomplete | Basic+ |
| `/bulk/organizations` | POST | Bulk organization data | Enterprise |

### Pricing and Rate Limits

| Plan | Price | API Calls | Features |
|------|-------|-----------|----------|
| **Basic** | Free | 200/min | Limited fields, entity lookups |
| **Pro** | $49/mo | 200/min | Full fields, search, export |
| **Enterprise** | Custom | Custom | Bulk data, webhooks, SLA |

### curl Examples

```bash
# Get organization profile
curl "https://api.crunchbase.com/api/v4/entities/organizations/prismatic?user_key=YOUR_API_KEY"

# Search organizations by name and location
curl -X POST "https://api.crunchbase.com/api/v4/searches/organizations" \
  -H "Content-Type: application/json" \
  -H "X-cb-user-key: YOUR_API_KEY" \
  -d '{
    "field_ids": ["name", "short_description", "location_identifiers", "funding_total"],
    "query": [
      {"type": "predicate", "field_id": "location_identifiers",
       "operator_id": "includes", "values": ["czech-republic"]},
      {"type": "predicate", "field_id": "category_groups",
       "operator_id": "includes", "values": ["cybersecurity"]}
    ],
    "limit": 25
  }'

# Get funding rounds for a company
curl "https://api.crunchbase.com/api/v4/entities/organizations/prismatic/funding_rounds?user_key=YOUR_API_KEY"

# Search people by organization
curl -X POST "https://api.crunchbase.com/api/v4/searches/people" \
  -H "Content-Type: application/json" \
  -H "X-cb-user-key: YOUR_API_KEY" \
  -d '{
    "field_ids": ["first_name", "last_name", "title", "organization_identifier"],
    "query": [
      {"type": "predicate", "field_id": "organization_identifier",
       "operator_id": "includes", "values": ["prismatic"]}
    ]
  }'

# Autocomplete entity search
curl "https://api.crunchbase.com/api/v4/autocompletes?query=prismatic&collection_ids=organizations&user_key=YOUR_API_KEY"
```

## Query Examples

```elixir
# Get comprehensive company profile
{:ok, company} = Crunchbase.organization("prismatic")
# => %{
#   name: "Prismatic",
#   short_description: "AI-powered intelligence platform",
#   headquarters: "Prague, Czech Republic",
#   founded_on: ~D[2020-01-15],
#   num_employees: "11-50",
#   funding_total: %{value: 5_000_000, currency: "USD"},
#   last_funding_type: "Series A",
#   categories: ["Artificial Intelligence", "Cybersecurity"],
#   website: "https://prismatic.io",
#   status: "operating"
# }

# Search for Czech cybersecurity startups
{:ok, results} = Crunchbase.search_organizations(%{
  location: "czech-republic",
  categories: ["cybersecurity"],
  funding_status: "funded",
  sort: {:funding_total, :desc}
})

# Get funding round details
{:ok, rounds} = Crunchbase.funding_rounds("prismatic")
# => [%{type: "Series A", amount: 5_000_000, currency: "USD",
#       date: ~D[2023-06-15], lead_investors: ["Credo Ventures"],
#       investors: ["Credo Ventures", "Presto Ventures"]}]

# Track acquisitions in a sector
{:ok, acquisitions} = Crunchbase.search_acquisitions(%{
  acquirer_categories: ["cybersecurity"],
  announced_on: {:gte, ~D[2024-01-01]},
  sort: {:price, :desc}
})

# Personnel search and connection mapping
{:ok, people} = Crunchbase.search_people(%{
  organization: "prismatic",
  fields: [:name, :title, :linkedin, :previous_organizations]
})

# Investment chain analysis
{:ok, chain} = Crunchbase.investment_chain("credo-ventures")
# => %{investor: "Credo Ventures", portfolio_companies: 45,
#      total_invested: 150_000_000, sectors: [...],
#      co_investors: ["Presto Ventures", "Keiretsu Forum", ...]}

# Track company lifecycle events
{:ok, timeline} = Crunchbase.company_timeline("prismatic")
# => [%{date: ~D[2020-01-15], event: :founded},
#      %{date: ~D[2021-03-01], event: :seed_round, amount: 500_000},
#      %{date: ~D[2023-06-15], event: :series_a, amount: 5_000_000}]
```

## Data Schema

### Organization Profile

```elixir
%Crunchbase.Organization{
  uuid: "org-uuid-12345",
  name: "Example Corp",
  permalink: "example-corp",
  short_description: "AI-powered platform for enterprise automation",
  description: "Detailed company description...",
  founded_on: ~D[2020-01-15],
  closed_on: nil,
  status: "operating",
  legal_name: "Example Corporation s.r.o.",
  operating_status: "active",
  headquarters: %{
    city: "Prague",
    region: "Prague",
    country: "Czech Republic"
  },
  num_employees_enum: "c_00011_00050",
  funding_total: %{value: 5_000_000, currency: "USD"},
  funding_rounds_count: 2,
  last_funding_type: "series_a",
  last_funding_at: ~D[2023-06-15],
  categories: ["Artificial Intelligence", "Cybersecurity", "SaaS"],
  category_groups: ["Software", "Data and Analytics"],
  investor_count: 5,
  website: %{url: "https://example.com"},
  social_media: %{
    linkedin: "https://linkedin.com/company/example",
    twitter: "https://twitter.com/example"
  },
  ipo_status: "private",
  revenue_range: "r_01000000_10000000"
}
```

### Key Entity Relationships

| Relationship | Description | OSINT Value |
|-------------|-------------|-------------|
| `funding_rounds` | All funding events with amounts and investors | Financial trajectory analysis |
| `investors` | All investor entities with investment details | Influence and network mapping |
| `acquisitions` | Acquisition history (as acquirer and target) | Corporate strategy analysis |
| `key_people` | Executives, founders, board members | Personnel intelligence |
| `competitors` | Named competitors and market context | Competitive landscape |
| `partner_organizations` | Strategic partnerships | Alliance and dependency mapping |

## Use Cases

### Corporate Due Diligence

Before entering business relationships, partnerships, or investment transactions, organizations use Crunchbase to assess the financial health, funding trajectory, and investor quality of counterparties. A company's funding history reveals its financial runway, growth trajectory, and the caliber of institutional backing. Companies that have raised only small amounts from unknown investors present different risk profiles than those backed by tier-one venture capital firms.

### Competitive Intelligence

Product and strategy teams use Crunchbase to monitor competitor funding, acquisitions, and executive hires. A competitor raising a large growth round signals market expansion plans. Acquisition of specific technology companies reveals product strategy. Executive hires from particular industries indicate new market focus areas.

### Investment Network Mapping

Analysts map the investment networks connecting companies, investors, and board members. These networks reveal influence relationships, potential conflicts of interest, and strategic alignment patterns that are not apparent from individual company filings. A venture capital firm's portfolio concentration in a specific sector may indicate strategic interests that affect portfolio company behavior.

### M&A Intelligence

Corporate development teams and investment banks use Crunchbase to identify acquisition targets, assess market valuations, and track deal activity in specific sectors. Historical acquisition data provides benchmarks for pricing and identifies active acquirers whose strategic interests may affect market dynamics.

### Talent Intelligence

HR teams and executive recruiters use Crunchbase personnel data to identify candidates, map career trajectories, and understand the leadership landscape in specific sectors. Board member connections across portfolio companies reveal advisory relationships and expertise clusters.

## Limitations

**US-Centric Coverage**: While Crunchbase has expanded globally, its coverage is deepest for US technology companies and progressively thinner for non-US markets. Czech companies are represented but with less detail than US equivalents.

**Funding Data Accuracy**: Not all funding rounds are publicly disclosed. Companies may announce rounds without specifying amounts, or not announce rounds at all. Reported valuations may be estimates rather than confirmed figures.

**Survivorship Bias**: Crunchbase profiles tend to persist for successful companies while failed companies may have incomplete or outdated profiles, creating a survivorship bias in historical analysis.

**Revenue Data Scarcity**: Revenue figures are available only for a small fraction of companies and are typically presented as ranges rather than precise figures. Financial statement data is not available through Crunchbase.

**Personnel Data Currency**: Personnel records may lag behind actual organizational changes. Executives who have departed may still appear in current roles until profiles are updated.

**Sector Classification**: Crunchbase's category taxonomy is community-driven and may not align with formal industry classification systems (NACE, SIC, NAICS). Companies may be categorized inconsistently.

## Legal and Ethical Considerations

Crunchbase data is compiled from publicly available sources and direct contributions. The platform's terms of service govern acceptable use of its data, including restrictions on bulk scraping, redistribution, and competitive data aggregation.

When using Crunchbase data for investigative purposes, analysts should be aware that company profiles contain self-reported information that may be optimistic or incomplete. Funding amounts, employee counts, and revenue ranges should be treated as approximate indicators rather than verified facts unless cross-referenced with regulatory filings.

Personnel data from Crunchbase includes professional information (name, title, organizational affiliations) that constitutes personal data under [GDPR](@/glossary/gdpr.md). Automated processing of this data for profiling purposes requires a lawful basis and may trigger data subject rights obligations.

Organizations using Crunchbase data for commercial intelligence should ensure compliance with the platform's API terms of service, which restrict certain uses including competitive product development and bulk data redistribution.

## Integration with Prismatic Platform

Prismatic Platform integrates Crunchbase as a business intelligence enrichment source, augmenting entity profiles from ARES, OpenCorporates, and other corporate registries with funding data, investor networks, and key personnel information.

### Entity Enrichment Pipeline

```elixir
defmodule Prismatic.Intel.CrunchbaseEnricher do
  @moduledoc """
  Enriches entity profiles with Crunchbase business intelligence data
  including funding history, investor networks, and personnel.
  """

  def enrich(entity) when entity.type in [:company, :organization] do
    with {:ok, cb_profile} <- Crunchbase.organization(entity.permalink),
         {:ok, funding} <- Crunchbase.funding_rounds(entity.permalink),
         {:ok, people} <- Crunchbase.search_people(%{organization: entity.permalink}) do
      {:ok, %EnrichedEntity{
        entity: entity,
        funding_history: funding,
        total_funding: cb_profile.funding_total,
        investor_network: extract_investors(funding),
        key_personnel: people,
        acquisition_history: cb_profile.acquisitions,
        competitive_landscape: cb_profile.competitors,
        enrichment_confidence: calculate_match_confidence(entity, cb_profile)
      }}
    end
  end
end
```

### Cross-Registry Correlation

Company profiles from ARES and OpenCorporates are matched to Crunchbase profiles using company name similarity, domain matching, and geographic proximity. When matches are confirmed, Crunchbase funding data, investor networks, and key personnel information are integrated into the platform's unified entity model. The correlation engine flags notable funding events, acquisitions, or personnel changes for analyst review.

### Investment Network Analysis

The platform constructs investment network graphs from Crunchbase data, revealing connections between companies, investors, and board members. These networks are analyzed for influence patterns, potential conflicts of interest, and strategic alignment indicators that inform risk assessment and due diligence conclusions.

## Best Practices

**Cross-Validate Funding Data**: Always cross-reference Crunchbase funding amounts with SEC filings (Form D for US companies), press releases, and direct company confirmations. Community-contributed funding data may be estimated or outdated.

**Use Permalink for Stable References**: Crunchbase entity UUIDs and permalinks provide stable references. Company names may change but permalinks remain consistent. Always store the permalink as the primary identifier.

**Monitor Portfolio Companies**: When investigating an investor, examine their full portfolio rather than individual investments. Portfolio composition reveals strategic focus, sector expertise, and potential conflicts of interest.

**Track Personnel Movement**: Personnel changes are often leading indicators of strategic shifts. Executive departures, board member additions, and advisor appointments signal organizational direction before public announcements.

**Assess Data Freshness**: Check the last update timestamp on Crunchbase profiles. Stale profiles (not updated in 6+ months) may contain outdated information that should be verified through other sources.

**Combine with Corporate Registries**: Crunchbase provides business intelligence context; corporate registries (ARES, Companies House, SEC) provide legal and regulatory facts. Use both together for comprehensive entity assessment.

## Related Providers

- [OpenCorporates](@/osint/open-corporates.md) - Global company registry data with legal entity details
- [SEC EDGAR](@/osint/sec-edgar.md) - US corporate filings and financial statements
- [Companies House](@/osint/companies-house.md) - UK company registry with financial statements
- [ARES](@/osint/ares.md) - Czech business registry for legal entity verification
- [Hunter.io](@/osint/hunter-io.md) - Email discovery for Crunchbase contact outreach
- LinkedIn - Professional network for personnel verification
- [Hlidac statu](@/osint/hlidac-statu.md) - Czech government watchdog for public contract intelligence

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)