+++
title = "SEC EDGAR"
weight = 44
[extra]
category = "us"
type = "financial"
module = "SecEdgar"
description = "US Securities and Exchange Commission EDGAR - electronic database of corporate filings, financial disclosures, and insider transactions"
has_api = true
url = "https://www.sec.gov/edgar"
rate_limit = "10 requests per second"
capabilities = ["Filing Search", "Company Lookup", "Insider Trading Data", "Financial Statement Extraction", "Form Type Filtering", "Full-Text Search", "XBRL Data"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1027
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["SEC", "EDGAR", "Securities", "Exchange", "Commission", "osint", "Prismatic Platform", "Cross", "Annual", "XBRL"]
tags = ["osint", "us", "sec-edgar", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "SEC EDGAR - Prismatic Platform"
+++

## Overview

EDGAR (Electronic Data Gathering, Analysis, and Retrieval) is the SEC's primary system for receiving, processing, and disseminating corporate filings required under the Securities Exchange Act of 1934 and the Securities Act of 1933. All publicly traded companies in the United States, as well as foreign private issuers listed on US exchanges, must file periodic reports, registration statements, proxy materials, and other disclosures through EDGAR. The system processes approximately 3,000 filings per day and maintains an archive of over 21 million filings dating back to 1993.

For [OSINT](@/glossary/osint.md) purposes, EDGAR is among the most valuable financial intelligence sources globally. It provides access to annual reports (10-K), quarterly reports (10-Q), insider trading disclosures (Form 4), beneficial ownership reports (Schedule 13D/G), proxy statements (DEF 14A), and hundreds of other filing types. These filings reveal executive compensation structures, related-party transactions, risk factor assessments, pending legal proceedings, material contracts, and subsidiary structures -- intelligence that is directly relevant to due diligence, competitive analysis, investment research, and cross-border investigations.

The SEC's commitment to transparency means that EDGAR data is freely accessible with no authentication requirements. The 2023 introduction of the EDGAR Full-Text Search System (EFTS) and the expanding XBRL (eXtensible Business Reporting Language) mandate further enhance the platform's value by enabling structured data extraction from financial statements and full-text keyword searches across all filings.

Within the Prismatic Platform, SEC EDGAR provides the US financial disclosure intelligence layer, enabling cross-border financial analysis for entities with US market exposure and complementing Czech registry data for multinational investigations.

## Data Sources and Coverage

EDGAR contains filings from all SEC-registered entities, which includes approximately 8,000+ actively reporting public companies, thousands of investment funds, and numerous other regulated entities.

| Filing Type | Description | OSINT Value | Update Frequency |
|-------------|-------------|-------------|-----------------|
| **10-K** | Annual report | Financial performance, risk factors, legal proceedings | Annual |
| **10-Q** | Quarterly report | Recent financial trends, management discussion | Quarterly |
| **8-K** | Current report | Material events (M&A, bankruptcy, officer changes) | Event-driven |
| **DEF 14A** | Proxy statement | Executive pay, board composition, related-party deals | Annual |
| **Form 4** | Insider transactions | Director/officer buying/selling signals | Within 2 business days |
| **13D** | Beneficial ownership | Activist ownership, hostile takeover indicators | Within 10 days of 5% threshold |
| **13G** | Passive ownership | Institutional holdings above 5% | Annual/amendment |
| **S-1** | IPO registration | Pre-IPO company details, use of proceeds | Pre-IPO |
| **20-F** | Foreign annual | Foreign private issuer comprehensive annual report | Annual |
| **6-K** | Foreign current | Foreign private issuer material event disclosure | Event-driven |
| **SC 13D/A** | Ownership amendment | Changes in activist positions | Amendment-driven |

### XBRL Structured Financial Data

Since 2009, the SEC has progressively mandated XBRL tagging of financial statements, creating machine-readable structured data for:

- Income statements (revenue, expenses, net income)
- Balance sheets (assets, liabilities, equity)
- Cash flow statements (operating, investing, financing activities)
- Individual line items with US-GAAP taxonomy codes

## Technical Architecture

EDGAR provides multiple access methods for different use cases:

| Access Method | Endpoint | Use Case |
|--------------|----------|----------|
| **Company Search** | `/cgi-bin/browse-edgar` | Find companies and filings by name or CIK |
| **Full-Text Search** | `/cgi-bin/srqsb` | Keyword search across all filing content |
| **XBRL API** | `/api/xbrl/companyfacts/` | Structured financial data in JSON |
| **Submissions API** | `/cgi-bin/browse-edgar?action=getcompany` | Company filing history |
| **Bulk Data** | `https://efts.sec.gov/` | Full-text search index downloads |
| **RSS Feeds** | `/cgi-bin/browse-edgar?action=getcurrent` | Real-time filing notifications |

```
Filing Submission                    Public Access
+------------------+                +--------------------+
| Companies submit |                | EDGAR Website      |
| via EDGAR Filing |----> EDGAR --> | XBRL API           |
| System           |     System     | Full-Text Search   |
+------------------+                | Bulk Downloads     |
                                    | RSS Feeds          |
                                    +--------------------+
```

The SEC requires a `User-Agent` header with contact information for all programmatic access. Rate limiting is enforced at 10 requests per second.

## API Integration

```elixir
defmodule Prismatic.Osint.SecEdgar do
  @moduledoc """
  Adapter for SEC EDGAR corporate filing database.
  Provides access to US public company filings, financial data,
  insider transactions, and beneficial ownership disclosures.
  """

  @base_url "https://efts.sec.gov/LATEST"
  @xbrl_url "https://data.sec.gov/api/xbrl"
  @user_agent "PrismaticPlatform/1.0 (contact@prismatic.io)"

  @doc """
  Search for companies by name or ticker symbol.
  """
  @spec search(String.t()) :: {:ok, list(map())} | {:error, term()}
  def search(query) do
    url = "#{@base_url}/search-index?q=#{URI.encode(query)}&dateRange=custom&startdt=2020-01-01"

    with {:ok, response} <- http_get(url) do
      {:ok, parse_company_results(response)}
    end
  end

  @doc """
  Get recent filings for a company by CIK, with optional form type filter.
  """
  @spec filings(String.t(), keyword()) :: {:ok, list(map())} | {:error, term()}
  def filings(cik, opts \\ []) do
    form_type = Keyword.get(opts, :form_type)
    limit = Keyword.get(opts, :limit, 10)

    url = "https://data.sec.gov/submissions/CIK#{pad_cik(cik)}.json"

    with {:ok, response} <- http_get(url) do
      filings = response["filings"]["recent"]
      filtered = if form_type, do: filter_by_form(filings, form_type, limit), else: take_recent(filings, limit)
      {:ok, filtered}
    end
  end

  @doc """
  Get insider trading transactions (Form 4) for a company.
  """
  @spec insider_transactions(String.t()) :: {:ok, list(map())} | {:error, term()}
  def insider_transactions(cik) do
    filings(cik, form_type: "4", limit: 50)
  end

  @doc """
  Get XBRL structured financial data for a company.
  """
  @spec company_facts(String.t()) :: {:ok, map()} | {:error, term()}
  def company_facts(cik) do
    url = "#{@xbrl_url}/companyfacts/CIK#{pad_cik(cik)}.json"

    with {:ok, response} <- http_get(url) do
      {:ok, %{
        cik: response["cik"],
        entity_name: response["entityName"],
        facts: parse_xbrl_facts(response["facts"])
      }}
    end
  end

  @doc """
  Full-text search across all EDGAR filings.
  """
  @spec full_text_search(String.t(), keyword()) :: {:ok, list(map())} | {:error, term()}
  def full_text_search(query, opts \\ []) do
    form_type = Keyword.get(opts, :form_type)
    params = %{q: query, forms: form_type}
    url = "#{@base_url}/search-index?#{URI.encode_query(params)}"

    http_get(url)
  end

  defp http_get(url) do
    headers = [{"User-Agent", @user_agent}]

    case Prismatic.Http.get(url, headers) do
      {:ok, %{status: 200, body: body}} -> {:ok, Jason.decode!(body)}
      {:ok, %{status: status}} -> {:error, {:http_error, status}}
      {:error, reason} -> {:error, reason}
    end
  end

  defp pad_cik(cik), do: String.pad_leading(cik, 10, "0")
end
```

### Financial Intelligence Pipeline

```elixir
defmodule PrismaticPerimeter.Intelligence.USFinancialIntelligence do
  @moduledoc """
  Extracts financial intelligence from SEC filings for cross-border
  analysis and due diligence of entities with US market exposure.
  """

  @spec analyze_us_entity(String.t()) :: {:ok, map()} | {:error, term()}
  def analyze_us_entity(cik) do
    tasks = [
      Task.async(fn -> SecEdgar.filings(cik, form_type: "10-K", limit: 3) end),
      Task.async(fn -> SecEdgar.insider_transactions(cik) end),
      Task.async(fn -> SecEdgar.company_facts(cik) end),
      Task.async(fn -> SecEdgar.filings(cik, form_type: "13D", limit: 5) end)
    ]

    [annual, insider, facts, ownership] = Task.await_many(tasks, 20_000)

    {:ok, %{
      financial_filings: extract_ok(annual),
      insider_activity: summarize_insider(extract_ok(insider)),
      structured_financials: extract_ok(facts),
      major_shareholders: extract_ok(ownership),
      risk_indicators: extract_risk_factors(annual),
      analyzed_at: DateTime.utc_now()
    }}
  end
end
```

## Use Cases

### Financial Due Diligence

EDGAR filings contain the most detailed financial disclosures required by any securities regulator, making them essential for thorough due diligence on US-listed entities.

- Analyze annual and quarterly financial statements with XBRL structured data
- Review risk factor disclosures (Item 1A of 10-K) for identified and emerging risks
- Track executive compensation and related-party transactions in proxy statements
- Cross-reference with [Companies House](@/osint/companies-house.md) for dual-listed companies

### Insider Trading Analysis

Form 4 filings provide near real-time visibility into securities transactions by directors, officers, and 10% shareholders.

- Monitor director and officer securities transactions for buying/selling patterns
- Detect unusual trading activity before major corporate events
- Track beneficial ownership stake changes through 13D/G filings
- Identify activist investor campaigns signaled by 13D filings

### Cross-Border Intelligence

For multinational investigations, EDGAR filings reveal US operations, subsidiaries, and financial exposure of global entities.

- US filings for companies with Czech/EU operations (geographic segment disclosures)
- Subsidiary identification through Exhibit 21 of 10-K filings
- Cross-reference with [EU Sanctions](@/osint/eu-sanctions.md) and [OFAC](@/osint/ofac.md)
- Track foreign private issuer filings (20-F) for US-listed non-US companies

### Competitive and Market Intelligence

Public filings contain rich competitive intelligence including market analysis, customer concentrations, and strategic direction.

- Revenue segmentation by product, geography, and customer
- Risk factors revealing competitive threats and market dynamics
- Material contract disclosures identifying key business relationships
- Management discussion and analysis (MD&A) for strategic direction signals

## Data Quality and Reliability

| Quality Dimension | Assessment | Notes |
|------------------|------------|-------|
| **Authority** | Definitive | SEC-mandated filings with legal liability for accuracy |
| **Completeness** | Very High | All US-registered public companies required to file |
| **Timeliness** | High | Real-time filing availability; insider transactions within 2 days |
| **Accuracy** | Very High | CEO/CFO certification under Sarbanes-Oxley Act |
| **Accessibility** | Excellent | Free, open access with structured XBRL data |
| **Historical Depth** | Excellent | Archive from 1993 to present |

## Platform Integration

| Component | Integration | Purpose |
|-----------|-------------|---------|
| **Due Diligence** | Financial analysis | US entity financial verification and risk assessment |
| **Perimeter** | Cross-border intelligence | US market exposure for entities under assessment |
| **Compliance** | Sanctions screening | Cross-reference filings with sanctions lists |
| **Intelligence** | Insider trading alerts | Monitor insider activity for investigation targets |

## NABLA Compliance

| Axiom | Implementation |
|-------|---------------|
| **Signal Plurality** | EDGAR data cross-referenced with Companies House, ARES, and commercial databases |
| **Provenance Mandatory** | All filing data tagged with CIK, accession number, and filing date |
| **Time Decay** | Financial data timestamped by period and filing date; aging alerts for stale analysis |
| **Contradiction Preservation** | Restatements and amended filings preserved alongside originals |

## Performance Metrics

| Metric | Target | Typical |
|--------|--------|---------|
| **Company Search** | < 1s | ~500ms |
| **Filing Retrieval** | < 2s | ~800ms |
| **XBRL Company Facts** | < 3s | ~1.5s (large JSON payload) |
| **Full-Text Search** | < 3s | ~2s |
| **Insider Transactions** | < 2s | ~1s |
| **Rate Limit Compliance** | 10 req/s | Enforced with token bucket |

## Related Resources

### Financial Intelligence
- [Companies House](@/osint/companies-house.md) - UK company data for dual-listed entities
- [EBR](@/osint/ebr.md) - European Business Registry for EU subsidiaries

### Sanctions and Compliance
- [OFAC](@/osint/ofac.md) - US Treasury sanctions (same jurisdiction)
- [EU Sanctions](@/osint/eu-sanctions.md) - EU sanctions for cross-border screening

### Czech Entity Cross-Reference
- [ARES](@/osint/ares.md) - Czech subsidiary identification
- [Justice.cz](@/osint/justice-cz.md) - Czech entity cross-referencing

### Platform Components
- [OSINT Core](@/apps/prismatic-osint-core.md) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](@/apps/prismatic-perimeter.md) - Cross-border financial intelligence

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)