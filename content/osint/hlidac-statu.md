+++
title = "Hlidac statu"
weight = 11
[extra]
icon = "scale"
color = "blue"
category = "czech"
type = "company"
module = "HlidacStatu"
source_type = "company"
description = "Czech Government Watchdog - aggregated analytics on public contracts, subsidies, and political connections"
has_api = true
url = "https://www.hlidacstatu.cz"
rate_limit = "API key required, 100 req/min"
capabilities = ["Contract Analytics", "Company Ratings", "Political Connection Mapping", "Subsidy Tracking", "Public Procurement Analysis", "Media Monitoring"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1405
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Hlidac", "statu", "Czech", "Government", "Watchdog", "osint", "Prismatic Platform", "Political"]
tags = ["osint", "czech", "hlidac-statu", "prismatic"]
quality_score = 77
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "Hlidac statu - Prismatic Platform"
+++

## Overview

Hlidac statu (Watchdog of the State) is the most comprehensive Czech civic-tech platform for monitoring government transparency, public spending accountability, and political-business connections. Founded by Michal Blaha, the platform represents one of the most sophisticated open-data analytics initiatives in Central Europe, aggregating data from dozens of Czech public registries and applying advanced analytics to expose patterns in public spending, political connections, potential corruption, and government accountability failures.

For [OSINT](/glossary/osint/) analysts, Hlidac statu is an indispensable source for Czech entity intelligence. It provides pre-computed relationship graphs linking companies to politicians, risk ratings for government suppliers, and cross-referenced datasets that would otherwise require manual aggregation from multiple Czech registries. The platform processes millions of contracts, subsidies, procurement records, and media references into actionable intelligence products that significantly accelerate due diligence, anti-corruption investigation, and competitive intelligence operations focused on Czech entities.

The platform's significance extends beyond pure data aggregation. Hlidac statu applies proprietary analytics algorithms that compute risk ratings for companies doing business with the state, detect statistical anomalies in procurement patterns, map networks of political influence and business relationships, and identify patterns suggestive of corruption or conflicts of interest. These analytics transform raw registry data into intelligence-ready assessments that save analysts substantial time and effort.

Hlidac statu has played a role in numerous Czech investigative journalism stories and has been cited in parliamentary proceedings, making it not just a data source but an active participant in Czech public accountability infrastructure. Its data quality is generally high because it draws from authoritative government sources and applies validation logic during aggregation.

## Data Sources and Aggregation

Hlidac statu aggregates data from an extensive network of Czech government registries and public databases:

| Source Registry | Data Type | Update Frequency | Key Intelligence |
|----------------|-----------|------------------|------------------|
| **Registr smluv** | Public contracts above CZK 50,000 | Near real-time | Contract values, counterparties, terms |
| **ARES** | Business entity registration | Daily | Company identity, legal form, status |
| **Justice.cz** | Commercial register | Weekly | Directors, ownership, beneficial owners |
| **CEDR** | Subsidies register | Monthly | EU and national subsidies received |
| **Vestnik VZ** | Public procurement | Daily | Tenders, bids, awards, pricing |
| **UOHS** | Competition authority decisions | Weekly | Antitrust findings, merger approvals |
| **Insolvencni rejstrik** | Insolvency proceedings | Daily | Bankruptcy filings, creditor claims |
| **CZSO** | Statistical data | Quarterly | Economic indicators, sector classifications |
| **Media Sources** | News articles, press releases | Continuous | Media coverage, sentiment, mentions |
| **Political Data** | Party registrations, declarations | Variable | Political affiliations, declared assets |

### Analytics Products

| Analytics Product | Description | Use Case |
|-------------------|------------|----------|
| **Company Risk Rating** | 0-100 score based on transparency indicators, contract patterns, political connections | Due diligence screening, supplier risk assessment |
| **Political Connection Graph** | Network visualization of links between companies and political figures | Anti-corruption investigation, conflict of interest detection |
| **Contract Analytics** | Trend analysis, price comparison, award pattern detection | Procurement oversight, competitive intelligence |
| **Subsidy Mapping** | Visualization of subsidy flows from EU and national sources to entities | Public funding analysis, grant intelligence |
| **Media Sentiment** | Aggregated media coverage with sentiment analysis | Reputation monitoring, brand intelligence |
| **Beneficial Ownership Network** | Cross-registry mapping of ultimate beneficial owners | KYC/AML compliance, ownership transparency |

## API Integration

Hlidac statu provides a [REST API](/glossary/rest-api/) at `https://www.hlidacstatu.cz/api/v2/` with comprehensive access to contracts, companies, persons, datasets, and full-text search. A free API key is obtained through registration on the website.

```elixir
defmodule Prismatic.Osint.HlidacStatu do
  @moduledoc """
  Hlidac statu OSINT adapter for Czech government transparency intelligence.

  Provides structured access to Hlidac statu's aggregated analytics
  including company risk ratings, political connection graphs, contract
  analytics, and subsidy mapping. Requires API key registration.
  """

  @base_url "https://www.hlidacstatu.cz/api/v2"

  @doc """
  Retrieve comprehensive company profile with risk rating and analytics.
  Returns aggregated intelligence from multiple Czech registries.
  """
  @spec company(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def company(ico, opts \\ []) do
    headers = auth_headers()

    with {:ok, response} <- http_get("#{@base_url}/firmy/#{ico}", headers),
         {:ok, parsed} <- Jason.decode(response.body) do
      {:ok, %{
        ico: ico,
        name: parsed["jmeno"],
        risk_rating: parsed["hodnoceni"],
        political_connections: parsed["politickeVazby"],
        contract_summary: parsed["smlouvy"],
        subsidy_summary: parsed["dotace"],
        insolvency_status: parsed["insolvence"],
        source: :hlidac_statu,
        collected_at: DateTime.utc_now()
      }}
    end
  end

  @doc """
  Search across all public contracts with full-text query.
  Returns contracts matching the query with counterparty and value data.
  """
  @spec search_contracts(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def search_contracts(query, opts \\ []) do
    page = Keyword.get(opts, :page, 1)
    order = Keyword.get(opts, :order, :relevance)
    headers = auth_headers()
    params = %{dotaz: query, strana: page, razeni: order_param(order)}

    with {:ok, response} <- http_get("#{@base_url}/smlouvy/hledat", headers, params),
         {:ok, parsed} <- Jason.decode(response.body) do
      {:ok, %{
        query: query,
        total: parsed["total"],
        contracts: normalize_contracts(parsed["results"]),
        source: :hlidac_statu,
        collected_at: DateTime.utc_now()
      }}
    end
  end

  @doc """
  Retrieve political connection graph for an entity.
  Maps relationships between company directors/owners and political figures.
  """
  @spec political_connections(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def political_connections(ico, opts \\ []) do
    depth = Keyword.get(opts, :depth, 2)
    headers = auth_headers()

    with {:ok, response} <- http_get("#{@base_url}/firmy/#{ico}/vazby", headers),
         {:ok, parsed} <- Jason.decode(response.body) do
      {:ok, %{
        ico: ico,
        connections: parsed["vazby"],
        connection_count: length(parsed["vazby"]),
        political_parties: extract_parties(parsed["vazby"]),
        risk_indicators: assess_connection_risk(parsed["vazby"]),
        source: :hlidac_statu,
        collected_at: DateTime.utc_now()
      }}
    end
  end

  @doc """
  Analyze contract history for a specific entity.
  Returns trend analysis, counterparty mapping, and anomaly detection.
  """
  @spec contract_analytics(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def contract_analytics(ico, opts \\ []) do
    since = Keyword.get(opts, :since, ~D[2016-07-01])
    headers = auth_headers()

    with {:ok, response} <- http_get("#{@base_url}/firmy/#{ico}/smlouvy", headers),
         {:ok, parsed} <- Jason.decode(response.body) do
      contracts = normalize_contracts(parsed["results"])

      {:ok, %{
        ico: ico,
        total_contracts: length(contracts),
        total_value: sum_contract_values(contracts),
        counterparties: extract_counterparties(contracts),
        yearly_trend: calculate_yearly_trend(contracts),
        anomalies: detect_contract_anomalies(contracts),
        source: :hlidac_statu,
        collected_at: DateTime.utc_now()
      }}
    end
  end

  @doc """
  Full-text search across all Hlidac statu datasets.
  Searches contracts, companies, persons, and documents.
  """
  @spec search(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def search(query, opts \\ []) do
    dataset = Keyword.get(opts, :dataset, :all)
    headers = auth_headers()
    params = %{dotaz: query}

    with {:ok, response} <- http_get("#{@base_url}/hledat", headers, params),
         {:ok, parsed} <- Jason.decode(response.body) do
      {:ok, %{
        query: query,
        results: parsed["results"],
        total: parsed["total"],
        source: :hlidac_statu,
        collected_at: DateTime.utc_now()
      }}
    end
  end

  defp auth_headers do
    [{"Authorization", "Token #{api_key()}"}]
  end

  defp api_key, do: Application.get_env(:prismatic, :hlidac_statu_api_key)
end
```

### API Endpoints Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v2/firmy/{ico}` | GET | Company profile with risk rating |
| `/api/v2/firmy/{ico}/vazby` | GET | Political connection graph |
| `/api/v2/firmy/{ico}/smlouvy` | GET | Company contract history |
| `/api/v2/smlouvy/hledat` | GET | Full-text contract search |
| `/api/v2/osoby/{nameId}` | GET | Person profile and connections |
| `/api/v2/datasety/{dataset}` | GET | Custom dataset access |
| `/api/v2/hledat` | GET | Cross-dataset full-text search |

## Query Examples

Practical intelligence collection scenarios using the Hlidac statu adapter:

```elixir
# Get comprehensive company intelligence with risk rating
{:ok, company} = Prismatic.Osint.HlidacStatu.company("25672541")
IO.puts("Company: #{company.name}")
IO.puts("Risk Rating: #{company.risk_rating}")
IO.puts("Political Connections: #{length(company.political_connections)}")

# Search for contracts mentioning a specific topic
{:ok, contracts} = Prismatic.Osint.HlidacStatu.search_contracts("kyberneticka bezpecnost",
  order: :value_desc
)
IO.puts("Cybersecurity contracts: #{contracts.total}")

# Map political connections for due diligence
{:ok, connections} = Prismatic.Osint.HlidacStatu.political_connections("12345678")
IO.puts("Connection count: #{connections.connection_count}")
IO.puts("Political parties: #{inspect(connections.political_parties)}")
IO.puts("Risk indicators: #{inspect(connections.risk_indicators)}")

# Analyze contract patterns for anomaly detection
{:ok, analytics} = Prismatic.Osint.HlidacStatu.contract_analytics("12345678")
IO.puts("Total contracts: #{analytics.total_contracts}")
IO.puts("Total value: CZK #{analytics.total_value}")
IO.puts("Anomalies detected: #{length(analytics.anomalies)}")

# Multi-source Czech entity enrichment
{:ok, hs_data} = Prismatic.Osint.HlidacStatu.company("12345678")
{:ok, ares_data} = Prismatic.Osint.Ares.lookup("12345678")
{:ok, nbu_data} = Prismatic.Osint.CzechNbu.verify_clearance(ico: "12345678")

enriched = %{
  identity: ares_data,
  risk_rating: hs_data.risk_rating,
  political_connections: hs_data.political_connections,
  government_contracts: hs_data.contract_summary,
  security_clearance: nbu_data,
  composite_risk: calculate_composite_czech_risk(hs_data, ares_data, nbu_data)
}
```

## Use Cases

### Due Diligence on Government Suppliers

The primary OSINT use case for Hlidac statu is conducting due diligence on companies that receive public funds or compete for government contracts. The platform's [risk score](/glossary/risk-score/) provides an immediate screening indicator, while the detailed analytics enable deeper investigation into contract patterns, pricing anomalies, political connections, and subsidy dependencies that may indicate elevated risk.

For compliance teams, Hlidac statu data supports anti-corruption assessments required under Czech law and EU directives. The political connection mapping is particularly valuable for identifying potential conflicts of interest that would not be visible through standard registry searches.

### Anti-Corruption Investigation

Investigative analysts use Hlidac statu to identify patterns suggestive of corruption or undue political influence in public spending. The platform's analytics can reveal companies with statistically anomalous win rates in government procurement, entities whose contract volumes correlate with political cycles, networks of related companies that systematically win contracts from the same contracting authorities, and pricing patterns that suggest bid coordination or non-competitive awards.

### Competitive Intelligence in Government Markets

For companies competing in Czech public procurement, Hlidac statu provides intelligence on competitor contract portfolios, pricing strategies, and government client relationships. By analyzing a competitor's contract history, companies can understand their pricing patterns and competitiveness, identify their primary government clients and relationship depth, assess their dependency on government revenue, and track shifts in their government contract portfolio over time.

### Journalism and Public Accountability

Czech investigative journalists rely heavily on Hlidac statu as a primary research tool for stories on public spending, political corruption, and government accountability. The platform's pre-computed analytics save significant research time and its cross-registry data aggregation enables rapid discovery of connections that would otherwise require days of manual research.

### Third-Party Risk Monitoring

For organizations with Czech supply chain exposure, Hlidac statu provides continuous monitoring of supplier risk through political connection changes, new insolvency proceedings, contract pattern shifts, and media sentiment changes that may indicate emerging risks.

## Limitations and Constraints

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **Czech entities only** | Limited to companies registered in Czech Republic | Supplement with international sources for cross-border entities |
| **Risk rating methodology opaque** | Proprietary algorithm not fully transparent | Use as one input among multiple risk indicators |
| **Historical data limited to Registr smluv era** | Contract data only from July 2016 onwards | Supplement with procurement portal data for earlier periods |
| **API rate limits** | 100 requests per minute | Implement rate-aware batching, cache frequently accessed data |
| **Political connection definitions broad** | May flag distant or irrelevant connections | Manual review of flagged connections for materiality |
| **Czech language content** | All data in Czech language | Automated translation with domain-specific terminology handling |

## Legal and Ethical Considerations

Hlidac statu aggregates publicly available government data and provides it through a legitimate civic-tech platform. All data accessed through the Prismatic Platform integration represents information that is publicly available under Czech freedom of information and open data laws. The Registr smluv (Contract Registry) is a mandatory public register under Act No. 340/2015 Sb., and all contracts published there are intended for public scrutiny.

The platform processes personal data of public officials and company directors in their capacity as public actors, which is consistent with legitimate interest processing under GDPR. The Prismatic Platform applies appropriate data protection controls when processing personal information derived from Hlidac statu, including purpose limitation, data minimization, and appropriate retention periods.

Political connection data is handled with particular care, as connections flagged by the platform do not necessarily indicate wrongdoing. The Prismatic Platform clearly labels political connection data as analytical indicators requiring human assessment rather than definitive evidence of impropriety.

## Platform Integration

Hlidac statu serves as a core analytics enrichment layer in the Prismatic Platform's Czech entity intelligence pipeline, sitting between raw registry data from ARES and Justice.cz and the composite risk scoring used for final intelligence products.

```elixir
defmodule Prismatic.Pipeline.CzechEntityRisk do
  @moduledoc """
  Czech entity risk assessment pipeline combining Hlidac statu analytics
  with authoritative registry data for comprehensive risk scoring.
  """

  def assess_entity_risk(ico) do
    with {:ok, hs} <- Prismatic.Osint.HlidacStatu.company(ico),
         {:ok, ares} <- Prismatic.Osint.Ares.lookup(ico),
         {:ok, contracts} <- Prismatic.Osint.HlidacStatu.contract_analytics(ico),
         {:ok, connections} <- Prismatic.Osint.HlidacStatu.political_connections(ico) do
      %{
        ico: ico,
        entity_name: ares.name,
        hlidac_risk_rating: hs.risk_rating,
        political_connection_count: connections.connection_count,
        government_contract_value: contracts.total_value,
        contract_anomalies: contracts.anomalies,
        composite_risk: calculate_composite_risk(hs, contracts, connections),
        risk_factors: identify_risk_factors(hs, contracts, connections),
        recommendation: generate_risk_recommendation(hs, contracts, connections)
      }
    end
  end
end
```

## Best Practices

When using Hlidac statu for Czech entity intelligence, treat the risk rating as a screening indicator rather than a definitive assessment. High-risk ratings warrant deeper investigation but do not themselves prove wrongdoing, while low-risk ratings do not guarantee absence of issues. Always cross-reference Hlidac statu analytics with authoritative data from [ARES](/osint/ares/) for entity verification, [Justice.cz](/osint/justice-cz/) for ownership structure, and [Registr smluv](/osint/registr-smluv/) for raw contract data.

Political connection data should be assessed for materiality. The platform may flag connections through shared board memberships, family relationships, or other linkages that may or may not be relevant to the specific investigation. Human judgment is essential for determining whether flagged connections represent genuine risk factors.

For continuous monitoring, configure the Prismatic Platform to periodically refresh Hlidac statu data for entities on active watchlists and alert on significant changes in risk ratings, new political connections, or unusual contract patterns.

## Related Sources

- [Registr smluv](/osint/registr-smluv/) - Raw contract data that Hlidac statu analyzes and enriches
- [ARES](/osint/ares/) - Czech business [registry](/glossary/registry-otp/) for authoritative entity identification
- [CEDR](/osint/cedr/) - Central Register of Subsidies for public funding data
- [Verejne zakazky](/osint/verejne-zakazky/) - Public procurement portal for tender and award data
- [Justice.cz](/osint/justice-cz/) - Commercial Register with ownership and beneficial owner data
- [UOHS](/osint/uohs/) - Competition authority decisions for regulatory intelligence
- [Databaze firem](/osint/databaze-firem/) - Business directory for supplementary contact data

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)