+++
title = "Companies House"
weight = 43
[extra]
category = "uk"
type = "company"
module = "CompaniesHouse"
description = "UK Companies House - the official registry of companies and directors in England, Wales, Scotland, and Northern Ireland"
has_api = true
url = "https://developer.company-information.service.gov.uk"
rate_limit = "600 requests per 5 minutes (authenticated)"
capabilities = ["Company Search", "Director Lookup", "Filing History", "Annual Accounts", "PSC Register", "Insolvency Status", "Disqualified Directors"]
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
word_count = 1752
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Companies", "House", "England", "Wales", "Scotland", "Northern", "osint", "Prismatic Platform", "Companies House"]
tags = ["osint", "uk", "companies-house", "prismatic"]
quality_score = 90
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "Companies House - Prismatic Platform"
+++

## Overview

Companies House is the official UK company [registry](/glossary/registry-otp/), maintaining records of over 5 million companies incorporated in England, Wales, Scotland, and Northern Ireland. Under the Companies Act 2006, all limited companies, limited liability partnerships (LLPs), and certain other business entities must register with Companies House and file annual returns, accounts, and notification of changes including director appointments, share transfers, and registered office moves. The registry serves as the primary source of truth for UK corporate entity data and is legally authoritative.

For [OSINT](/glossary/osint/) purposes, Companies House provides one of the most comprehensive and accessible company registries globally. Its free [REST API](/glossary/rest-api/) and bulk data downloads make it a model for open corporate data. The registry includes company details, director appointments and resignations, filing histories, annual accounts, Persons with Significant Control (PSC) data, and insolvency indicators. This makes it indispensable for due diligence on UK entities, cross-border investigations, and beneficial ownership tracing.

The PSC (Persons with Significant Control) register is particularly valuable for OSINT investigations. Introduced in 2016, it requires companies to disclose individuals who hold more than 25% of shares or voting rights, have the right to appoint or remove the majority of directors, or otherwise exercise significant influence or control. This beneficial ownership data is publicly searchable, making the UK one of the most transparent jurisdictions for ownership intelligence.

Companies House data is updated in near real-time as filings are processed, with most electronic filings reflected within 24 hours. The registry's API supports structured queries for company search, officer search, filing history, and PSC data, all accessible with a free API key. For the Prismatic platform, Companies House provides the UK entity intelligence layer essential for cross-border due diligence involving British companies or individuals with UK corporate connections.

## Data Sources and Coverage

Companies House maintains multiple data registers that collectively provide comprehensive UK corporate intelligence.

| Data Type | Description | Legal Basis |
|-----------|-------------|-------------|
| **Company Details** | Name, number, type, status, incorporation date, SIC codes | Companies Act 2006 |
| **Registered Office** | Current and previous registered addresses with change dates | CA 2006 s.86-87 |
| **Directors/Officers** | Current and resigned officers with appointment dates and DOB | CA 2006 s.162-167 |
| **Company Secretary** | Secretary details where appointed | CA 2006 s.271-280 |
| **PSC Register** | Persons with Significant Control (beneficial owners >25%) | CA 2006 Part 21A |
| **Filing History** | All filed documents including annual returns and accounts | CA 2006 s.1078 |
| **Annual Accounts** | Financial statements filed by companies | CA 2006 s.441-453 |
| **SIC Codes** | Standard Industrial Classification activity codes | Registration |
| **Insolvency** | Liquidation, administration, receivership indicators | Insolvency Act 1986 |
| **Charges** | Registered charges (mortgages, debentures, security interests) | CA 2006 Part 25 |
| **Disqualified Directors** | Directors banned from acting by court order | CDDA 1986 |

### Company Types

| Type | Description | Typical Count |
|------|-------------|--------------|
| **Ltd** | Private limited by shares (most common) | ~4M active |
| **PLC** | Public limited company | ~7,000 active |
| **LLP** | Limited liability partnership | ~70,000 active |
| **UC** | Unlimited company | ~5,000 active |
| **SE** | Societas Europaea (European Company) | Rare |
| **LP** | Limited partnership (including Scottish LP) | ~50,000 |
| **OC** | Overseas company (branch registration) | ~12,000 |

### PSC Nature of Control Categories

The PSC register uses standardized control descriptions that enable programmatic analysis of ownership structures. Categories include ownership of shares (25-50%, 50-75%, 75-100%), voting rights (same bands), right to appoint/remove directors, and significant influence or control. These structured categories enable automated beneficial ownership analysis across the entire UK corporate registry.

## Technical Architecture

Companies House operates a modern API infrastructure that provides programmatic access to all public register data.

The API follows REST conventions with JSON responses, supporting both individual record retrieval and search operations. The search endpoints use an Elasticsearch-based backend optimized for company name matching, with support for exact match, starts-with, and fuzzy matching. Officer search supports name-based queries across all company appointments, enabling cross-company director network analysis.

The filing history endpoint provides chronological access to all documents filed by a company, with document metadata including filing type, date, description, and links to the actual document images (typically PDF or TIFF). Financial statements filed as iXBRL (inline XBRL) are also available for programmatic extraction of financial data.

The bulk data products include daily snapshots of the full company register, monthly PSC data extracts, and officer appointment data. These bulk datasets enable offline analysis without API rate limit constraints and support large-scale network analysis across the entire UK corporate registry.

The streaming API provides real-time event notifications for company changes, enabling continuous monitoring of target entities without polling. Events include new filings, officer changes, PSC updates, and status changes.

## API Integration

Companies House provides a comprehensive free API for programmatic access to UK corporate data.

```elixir
defmodule PrismaticOsint.Adapters.CompaniesHouse do
  @moduledoc """
  UK Companies House adapter for the Prismatic OSINT pipeline.
  Provides company search, officer lookup, PSC data, and filing history.
  """

  @base_url "https://api.company-information.service.gov.uk"

  # Search by company name
  def search(query, opts \\ []) do
    params = %{q: query, items_per_page: Keyword.get(opts, :limit, 20)}

    with {:ok, response} <- api_get("/search/companies", params) do
      {:ok, Enum.map(response["items"], &parse_company/1)}
    end
  end

  # Get full company profile
  def get_company(number) do
    with {:ok, response} <- api_get("/company/#{number}") do
      {:ok, %{
        company_number: response["company_number"],
        company_name: response["company_name"],
        company_type: response["type"],
        company_status: response["company_status"],
        date_of_creation: response["date_of_creation"],
        registered_office: response["registered_office_address"],
        sic_codes: response["sic_codes"],
        accounts: response["accounts"],
        has_charges: response["has_charges"],
        has_insolvency_history: response["has_insolvency_history"]
      }}
    end
  end

  # Get officers (directors)
  def officers(number) do
    with {:ok, response} <- api_get("/company/#{number}/officers") do
      {:ok, Enum.map(response["items"], &parse_officer/1)}
    end
  end

  # Get Persons with Significant Control
  def psc(number) do
    with {:ok, response} <- api_get("/company/#{number}/persons-with-significant-control") do
      {:ok, Enum.map(response["items"], &parse_psc/1)}
    end
  end

  # Get filing history
  def filings(number, opts \\ []) do
    params = %{items_per_page: Keyword.get(opts, :limit, 25)}

    with {:ok, response} <- api_get("/company/#{number}/filing-history", params) do
      {:ok, Enum.map(response["items"], &parse_filing/1)}
    end
  end

  # Get charges (mortgages)
  def charges(number) do
    with {:ok, response} <- api_get("/company/#{number}/charges") do
      {:ok, Enum.map(response["items"], &parse_charge/1)}
    end
  end

  # Search for director across all companies
  def director_search(name) do
    with {:ok, response} <- api_get("/search/officers", %{q: name}) do
      {:ok, Enum.map(response["items"], &parse_officer_search/1)}
    end
  end

  # Check disqualified directors register
  def check_disqualified(name) do
    with {:ok, response} <- api_get("/search/disqualified-officers", %{q: name}) do
      {:ok, Enum.map(response["items"], &parse_disqualified/1)}
    end
  end

  defp api_get(path, params \\ %{}) do
    api_key = Application.get_env(:prismatic_osint, :companies_house_api_key)
    headers = [{"Authorization", "Basic #{Base.encode64(api_key <> ":")}"}]
    PrismaticOsint.Http.get(@base_url <> path, params, headers)
  end
end
```

### Cross-Border Due Diligence Pipeline

```elixir
defmodule PrismaticPerimeter.DueDiligence.CrossBorder do
  @moduledoc """
  Cross-border due diligence combining UK Companies House
  data with Czech registry and sanctions screening.
  """

  alias PrismaticOsint.Adapters.{CompaniesHouse, Ares, EuSanctions, Ofac}

  def uk_entity_check(company_number) do
    with {:ok, company} <- CompaniesHouse.get_company(company_number),
         {:ok, officers} <- CompaniesHouse.officers(company_number),
         {:ok, pscs} <- CompaniesHouse.psc(company_number),
         {:ok, eu_sanctions} <- EuSanctions.search(company.company_name),
         {:ok, ofac_sanctions} <- Ofac.search(company.company_name) do
      czech_connections = check_czech_connections(officers, pscs)

      {:ok, %{
        uk_entity: company,
        officers: officers,
        beneficial_owners: pscs,
        sanctions_screening: %{eu: eu_sanctions, ofac: ofac_sanctions},
        czech_connections: czech_connections,
        risk_assessment: assess_cross_border_risk(company, officers, pscs),
        assessed_at: DateTime.utc_now()
      }}
    end
  end

  defp check_czech_connections(officers, pscs) do
    all_names = Enum.map(officers, & &1.name) ++ Enum.map(pscs, & &1.name)

    Enum.flat_map(all_names, fn name ->
      case Ares.search_by_name(name) do
        {:ok, results} when results != [] -> [{name, results}]
        _ -> []
      end
    end)
  end
end
```

## Use Cases

### Cross-Border Due Diligence

Companies House is essential for any investigation involving UK entities or individuals with UK corporate connections. Key workflows include verifying UK entities referenced in Czech business relationships by cross-referencing with [ARES](/osint/ares/), tracing beneficial ownership through PSC data to identify ultimate controllers of UK-registered companies, screening directors against the disqualified directors register to identify individuals banned from acting as company officers, combining Companies House data with [EU Sanctions](/osint/eu-sanctions/) and [OFAC](/osint/ofac/) for comprehensive sanctions screening, and identifying UK subsidiaries or branches of Czech companies through overseas company registrations.

### Corporate Structure Analysis

Companies House data enables comprehensive mapping of corporate structures and director networks. Analysts can map multi-jurisdictional corporate groups by tracing director appointments across companies, identify dormant and shell company patterns through analysis of filing history and account type, trace director networks across companies to identify common control patterns, cross-reference with [EBR](/osint/ebr/) for European group structures extending beyond the UK, and analyze PSC data to identify complex beneficial ownership chains involving trusts and corporate vehicles.

### Financial Intelligence

The financial data available through Companies House supports detailed financial analysis of UK entities. Applications include accessing filed annual accounts for ratio analysis, trend assessment, and benchmarking, tracking charge registrations (mortgages, debentures) for secured lending intelligence, monitoring insolvency indicators for early warning of financial distress, cross-referencing with [SEC EDGAR](/osint/sec-edgar/) for US-listed UK entities with dual reporting obligations, and analyzing filing patterns (late filings, missing accounts) as indicators of governance quality.

### Scottish Limited Partnerships

Scottish Limited Partnerships (SLPs) have been identified by law enforcement and anti-corruption organizations as vehicles frequently used for money laundering due to their legal personality, limited disclosure requirements, and low formation costs. Companies House data enables targeted analysis of SLP registration patterns, nominee structures, and connection to high-risk jurisdictions.

## Data Quality and Validation

Companies House data quality is generally high given its legal authority, but several considerations apply to OSINT usage.

Timeliness varies by filing type. Electronic filings are typically reflected within 24 hours, while paper filings may take 5-10 business days to process. Annual accounts have filing deadlines of 9 months (private) or 6 months (public) after the accounting period end, meaning financial data may be up to 21 months old when first available.

Name accuracy depends on the filing entity. Company names are verified against naming rules but director and PSC names are self-declared and may contain errors, variations, or deliberately obfuscated spellings. Cross-referencing director names across multiple sources is essential for reliable identification.

PSC data completeness has improved since the register's introduction but enforcement gaps remain. Some companies fail to file PSC statements, and nominee arrangements can obscure true beneficial ownership. The UK government has announced plans to verify PSC data more rigorously through identity verification requirements.

Address data for directors and PSCs may use service addresses rather than residential addresses, limiting geographic intelligence. The registered office address is always the company's official address but may be a registered agent's office rather than the operational location.

## Platform Integration

Within the Prismatic ecosystem, Companies House provides the UK entity intelligence layer, integrated with the cross-border due diligence pipeline alongside Czech registries ([ARES](/osint/ares/), [Justice.cz](/osint/justice-cz/)) and sanctions databases ([EU Sanctions](/osint/eu-sanctions/), [OFAC](/osint/ofac/)).

The director network analysis capability maps individuals across multiple UK companies and cross-references with Czech registry data to identify connections between UK and Czech corporate structures. This is particularly valuable for tracing beneficial ownership across jurisdictions.

The [Prismatic Perimeter](/apps/prismatic-perimeter/) security rating engine uses Companies House data to verify the corporate identity of UK entities in security assessments, validate organizational claims, and check for adverse indicators such as insolvency history or disqualified directors.

Filing monitoring enables continuous tracking of target UK entities, with automated alerts for new filings, officer changes, PSC updates, charges, and insolvency events.

## NABLA Compliance

The Companies House integration adheres to the NABLA epistemic framework.

**Signal Plurality**: Companies House data is cross-validated against at least one independent source. Company existence is verified through both the API and public web search. Director information is cross-referenced with LinkedIn, [FullContact](/osint/fullcontact/), and relevant national registries.

**Contradiction Preservation**: When Companies House data conflicts with other registry data (for example, different director names or addresses between UK and Czech records), both records are preserved with source attribution for analyst review.

**Time Decay**: Filing dates and last-updated timestamps are explicitly tracked. The platform applies freshness weights that account for the inherent lag in Companies House data, with reduced confidence for companies whose most recent filing is overdue.

**Provenance Mandatory**: All Companies House data includes the company number as authoritative identifier, the API endpoint used for retrieval, the query timestamp, and the filing date for document-level data. This enables complete audit trails.

**Source Independence**: Companies House is treated as an independent authoritative source separate from commercial data aggregators. Its data carries higher weight than commercial sources due to its legal authority.

## Performance and Rate Limits

| Aspect | Details |
|--------|---------|
| **Authentication** | API key required (free registration at developer.company-information.service.gov.uk) |
| **Rate Limit** | 600 requests per 5 minutes per API key |
| **Data Format** | JSON (REST API), XML and CSV (bulk downloads) |
| **Cost** | Free API access; bulk data downloads available at no cost |
| **Coverage** | 5M+ UK companies, LLPs, and overseas registrations |
| **Response Time** | 100-500ms typical for single record retrieval |

### API Endpoints

| Endpoint | Description | Rate Impact |
|----------|-------------|-------------|
| `/search/companies` | Company name search | 1 request |
| `/company/{number}` | Company profile | 1 request |
| `/company/{number}/officers` | Officer list (paginated) | 1 request per page |
| `/company/{number}/persons-with-significant-control` | PSC data | 1 request |
| `/company/{number}/filing-history` | Filed documents (paginated) | 1 request per page |
| `/company/{number}/charges` | Registered charges | 1 request |
| `/search/officers` | Officer name search | 1 request |
| `/search/disqualified-officers` | Disqualified directors search | 1 request |

The Prismatic adapter implements response caching with 24-hour TTL for company profiles and 7-day TTL for filing history, with cache invalidation triggered by streaming API events for monitored entities.

## Related Resources

- [EBR](/osint/ebr/) - European Business Registry for cross-EU lookups
- [SEC EDGAR](/osint/sec-edgar/) - US filings for dual-listed UK companies
- [ARES](/osint/ares/) - Czech entity cross-referencing
- [EU Sanctions](/osint/eu-sanctions/) - Sanctions screening for UK entities
- [OFAC](/osint/ofac/) - US sanctions for UK entities with US exposure
- [Justice.cz](/osint/justice-cz/) - Czech corporate details for UK-CZ connections
- [OSINT Core](/apps/prismatic-osint-core/) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](/apps/prismatic-perimeter/) - Corporate entity verification in security ratings

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)