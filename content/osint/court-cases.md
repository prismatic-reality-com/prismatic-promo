+++
title = "Court Cases (Czech)"
weight = 65
[extra]
category = "czech"
type = "legal"
module = "CourtCases"
description = "Czech court decision database covering civil, criminal, administrative, and constitutional rulings"
has_api = false
url = "https://rozhodnuti.justice.cz"
rate_limit = "Public web access, no official rate limit"
capabilities = ["Decision Search", "Case Law Lookup", "Judge Identification", "Legal Reasoning Analysis", "Penalty Records", "Appeal Tracking"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1501
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Court", "Cases", "Czech", "osint", "Prismatic Platform", "Decisions", "Supreme Court", "Constitutional Court"]
tags = ["osint", "czech", "court-cases-czech", "prismatic"]
quality_score = 90
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "Court Cases (Czech) - Prismatic Platform"
+++

## Overview

The Czech Court Decisions database (rozhodnuti.justice.cz) is the official public repository of court decisions maintained by the Czech Ministry of Justice. It provides access to decisions from the Supreme Court (Nejvyssi soud), Supreme Administrative Court (Nejvyssi spravni soud), Constitutional Court (Ustavni soud), and selected lower court decisions from regional and district courts. The database is searchable by case number, subject matter, judge, date, and full-text content, providing comprehensive access to Czech judicial output.

For [OSINT](/glossary/osint/) purposes, Czech court decisions reveal critical intelligence about entities and individuals: criminal convictions, civil disputes, commercial litigation, administrative sanctions, insolvency proceedings, intellectual property disputes, and constitutional complaints. This data is essential for comprehensive due diligence, litigation risk assessment, and compliance verification. Decisions often name parties, their legal representatives, and contain detailed factual findings that provide investigative leads beyond what corporate registry data alone can reveal.

The database covers decisions from the highest Czech courts comprehensively, while lower court coverage is selective. Supreme Court decisions include civil and criminal cassation rulings with detailed legal reasoning. Supreme Administrative Court decisions cover tax disputes, regulatory challenges, asylum cases, and administrative law. Constitutional Court decisions address constitutional complaints, abstract judicial review, and competence disputes. This hierarchical coverage means that significant cases are reliably captured, while routine lower court matters may not be fully indexed.

Within the Prismatic platform, the Court Cases module provides legal intelligence that complements corporate data from [ARES](/osint/ares/), competition decisions from [UOHS](/osint/uohs/), insolvency data from the [Insolvency Registry](/osint/insolvencni-rejstrik/), and enforcement data from the [Executors](/osint/executors/) registry.

## Data Sources and Coverage

The Court Decisions database aggregates judicial output from multiple Czech court tiers, each with distinct jurisdiction and coverage characteristics.

| Data Type | Description | Coverage Level |
|-----------|-------------|---------------|
| **Supreme Court Decisions** | Civil and criminal cassation rulings | Comprehensive |
| **Supreme Administrative Court** | Administrative law, tax, and regulatory disputes | Comprehensive |
| **Constitutional Court** | Constitutional complaints and abstract review | Comprehensive |
| **High Court Decisions** | Selected appellate decisions from Prague and Olomouc | Selective |
| **Regional Court Decisions** | Selected first-instance and appellate decisions | Selective |
| **Case Metadata** | Case numbers, dates, judges, parties, subject codes | All indexed decisions |
| **Legal Reasoning** | Full-text decision rationale and legal analysis | All indexed decisions |

### Decision Record Fields

| Field | Description | Intelligence Value |
|-------|-------------|-------------------|
| **Case Number** | Court identifier (e.g., 29 Cdo 1234/2024) | Unique case reference |
| **Court** | Issuing court name and division | Jurisdiction analysis |
| **Date** | Decision date | Temporal analysis |
| **Judge/Senate** | Deciding judge or senate composition | Judge pattern analysis |
| **Subject Area** | Legal domain (civil, criminal, admin, constitutional) | Risk categorization |
| **Decision Type** | Judgment, resolution, ruling, order | Outcome classification |
| **Parties** | Named parties (may be anonymized in criminal cases) | Entity identification |
| **Outcome** | Granted, dismissed, reversed, remanded | Success rate analysis |
| **Full Text** | Complete decision text with reasoning | Deep content analysis |

### Case Number Format

Czech case numbers encode court, division, and sequence information. For example, "29 Cdo 1234/2024" indicates senate number 29, commercial division (Cdo), case sequence 1234, filed in 2024. Division codes include Cdo (commercial), Tdo (criminal), As (administrative), and others. Understanding this format enables targeted searches for specific legal areas.

## Technical Architecture

The Court Decisions database operates as a web application with server-side search, without a structured public API. Data access requires web scraping or manual search through the HTML interface.

The search interface supports structured queries by case number, court, date range, subject area, and judge name, as well as full-text search across decision content. Results are returned as HTML pages with pagination, requiring parsing for programmatic access.

The Prismatic adapter implements a scraping-based integration that respects the site's implicit rate expectations. HTML responses are parsed using a DOM parser to extract structured decision metadata and full-text content. Results are cached locally to minimize repeated requests and stored in the Prismatic knowledge graph for cross-referencing with other Czech data sources.

Full-text indexing of downloaded decisions enables advanced analysis capabilities including entity mention extraction (identifying companies and individuals named in decisions), legal concept classification using natural language processing, outcome pattern analysis across judges and courts, and temporal trend detection for specific legal areas.

## API Integration

Since the Court Decisions database lacks a formal API, the Prismatic adapter implements structured data extraction through web scraping with robust error handling and rate management.

```elixir
defmodule PrismaticOsint.Adapters.CourtCases do
  @moduledoc """
  Czech Court Decisions adapter for legal intelligence within
  the Prismatic OSINT pipeline. Implements web scraping with
  respectful crawling practices.
  """

  @base_url "https://rozhodnuti.justice.cz"

  # Search court decisions by entity name
  def search(opts \\ []) do
    params = build_search_params(opts)

    with {:ok, html} <- fetch_search_results(params) do
      decisions = parse_search_results(html)
      {:ok, decisions}
    end
  end

  # Search by case number
  def by_case_number(case_number) do
    with {:ok, html} <- fetch_decision(case_number) do
      {:ok, parse_full_decision(html)}
    end
  end

  # Search criminal decisions for a person
  def search_criminal(person_name) do
    search(person: person_name, area: :criminal)
  end

  # Full-text search in decision reasoning
  def fulltext_search(query, opts \\ []) do
    params = %{fulltext: query} |> Map.merge(Map.new(opts))

    with {:ok, html} <- fetch_search_results(params) do
      {:ok, parse_search_results(html)}
    end
  end

  # Get decisions by court and date range
  def by_court(court_name, opts \\ []) do
    from_date = Keyword.get(opts, :from)
    to_date = Keyword.get(opts, :to)
    params = %{court: court_name, from: from_date, to: to_date}

    with {:ok, html} <- fetch_search_results(params) do
      {:ok, parse_search_results(html)}
    end
  end

  # Track appeal chain for a case
  def appeal_chain(case_number) do
    with {:ok, decision} <- by_case_number(case_number) do
      related = extract_referenced_cases(decision.full_text)
      chain = build_appeal_chain(decision, related)
      {:ok, chain}
    end
  end
end
```

### Legal Risk Assessment Pipeline

```elixir
defmodule PrismaticPerimeter.Risk.LegalRiskAssessment do
  @moduledoc """
  Assesses legal risk for entities by analyzing court decision history
  combined with corporate, competition, and insolvency data.
  """

  alias PrismaticOsint.Adapters.{CourtCases, Ares, InsolvencniRejstrik, Uohs}

  def assess_legal_risk(ico) do
    with {:ok, company} <- Ares.get_full_details(ico),
         {:ok, court_decisions} <- CourtCases.search(entity: company.nazev),
         {:ok, insolvency} <- InsolvencniRejstrik.search(ico: ico),
         {:ok, competition} <- Uohs.search_decisions(entity: company.nazev) do
      {:ok, %{
        entity: company,
        court_history: court_decisions,
        insolvency_status: insolvency,
        competition_decisions: competition,
        risk_score: calculate_legal_risk(court_decisions, insolvency, competition),
        criminal_flags: filter_criminal(court_decisions),
        active_litigation: filter_active(court_decisions),
        assessed_at: DateTime.utc_now()
      }}
    end
  end

  defp calculate_legal_risk(decisions, insolvency, competition) do
    criminal_weight = decisions |> filter_criminal() |> length() |> min(5) |> Kernel.*(20)
    insolvency_weight = if insolvency != [], do: 30, else: 0
    competition_weight = length(competition) |> min(3) |> Kernel.*(15)
    civil_weight = decisions |> filter_civil() |> length() |> min(10) |> Kernel.*(5)

    min(criminal_weight + insolvency_weight + competition_weight + civil_weight, 100)
  end
end
```

## Use Cases

### Legal Due Diligence

Court decisions provide essential intelligence for comprehensive entity due diligence. Key applications include searching for litigation history of target entities and their officers, identifying criminal proceedings involving company directors or beneficial owners, assessing patterns of commercial disputes that may indicate contractual reliability issues, cross-referencing case parties with [Justice.cz](/osint/justice-cz/) corporate data for entity identification, and analyzing the nature and outcomes of past litigation to assess future legal risk.

### Compliance and Risk Assessment

Court decision analysis supports regulatory compliance and risk assessment workflows. Specific capabilities include checking for criminal convictions of company directors relevant to fit-and-proper assessments, identifying entities involved in fraud, corruption, or economic crime cases, monitoring administrative sanctions and their appeal outcomes for regulatory compliance history, assessing regulatory compliance track records through administrative court decisions, and identifying tax disputes that may indicate aggressive tax planning or evasion.

### Litigation Intelligence

Legal professionals and investigators use court decision analysis for strategic intelligence. Applications include tracking judicial interpretation trends across specific legal areas, monitoring case law developments relevant to ongoing investigations, identifying successful legal strategies and arguments used in similar cases, mapping judge assignment patterns and decision tendencies in specialized courts, and analyzing sentencing patterns in criminal cases for penalty benchmarking.

### Competition and Antitrust Intelligence

Court decisions from the Supreme Administrative Court that review UOHS (competition authority) decisions provide intelligence about competition law enforcement. This includes cartel investigation outcomes and penalty levels, merger control decisions and remedies, abuse of dominance findings, and bid-rigging cases in public procurement.

## Data Quality and Validation

Court decision data quality varies by source court and decision type. Supreme Court and Constitutional Court decisions have the highest coverage and consistency, with comprehensive metadata and full-text availability. Lower court decisions have selective coverage that may not represent the complete judicial record for a given entity.

Party anonymization in criminal cases limits the direct identification of individuals. While company names are typically included in full, natural persons may be identified only by initials in published criminal decisions. Cross-referencing with other data sources is often necessary to confirm individual identities.

Temporal coverage has improved significantly in recent years. Decisions from 2000 onward have good coverage for higher courts, while earlier decisions may have gaps. The database is continuously expanded as historical decisions are digitized and indexed.

Full-text search accuracy depends on the quality of OCR processing for older decisions that were scanned from paper originals. Newer electronically filed decisions have higher text accuracy. Boolean search operators are supported but may behave differently from standard search engine conventions.

## Platform Integration

Within the Prismatic ecosystem, the Court Cases module feeds legal intelligence into the comprehensive entity risk assessment pipeline. Court decision data is correlated with [ARES](/osint/ares/) entity data for company identification, [Insolvency Registry](/osint/insolvencni-rejstrik/) data for financial distress correlation, [Executors](/osint/executors/) data for enforcement action correlation, [UOHS](/osint/uohs/) competition decisions for regulatory risk assessment, and [EU Sanctions](/osint/eu-sanctions/) data for sanctions-related legal proceedings.

The [Prismatic Perimeter](/apps/prismatic-perimeter/) security rating engine incorporates legal risk indicators from court decision analysis, with criminal proceedings and competition violations contributing negatively to entity security ratings.

## NABLA Compliance

**Signal Plurality**: Court decision data is always combined with corporate registry data and other legal sources. A single court decision is not used as the sole basis for risk assessment without corroborating evidence from registry data or sanctions screening.

**Contradiction Preservation**: When court decisions contain factual findings that contradict information from corporate registries (for example, regarding company activities or officer roles), both data points are preserved for analyst review.

**Time Decay**: Decision dates are tracked and freshness weights applied. Recent decisions carry higher weight in risk assessments than historical cases, with configurable decay curves based on decision type (criminal convictions decay more slowly than civil disputes).

**Provenance Mandatory**: All court decision data includes the case number, court identifier, decision date, and data retrieval timestamp. Full decision text is stored with its original source URL for verification.

**Unknown Valid**: When court decision searches return no results for an entity, the absence is explicitly recorded rather than interpreted as a clean record, acknowledging the selective coverage of lower courts.

## Performance and Rate Limits

| Aspect | Details |
|--------|---------|
| **Authentication** | None required (public access) |
| **API** | Web scraping only (no structured API) |
| **Rate Limit** | No official limit; respectful crawling at 1 request/second recommended |
| **Data Format** | HTML (web interface) |
| **Cost** | Free public access |
| **Coverage** | Supreme Court, SAC, Constitutional Court comprehensive; lower courts selective |
| **Language** | Czech only (decisions not translated) |
| **Response Time** | 1-5 seconds for search queries |

The Prismatic adapter caches search results with 7-day TTL and full decision texts with 90-day TTL, reflecting the relatively static nature of published court decisions. Incremental crawling checks for new decisions weekly for monitored entities.

## Related Resources

- [Justice.cz](/osint/justice-cz/) - Commercial register and corporate details
- [Insolvency Registry](/osint/insolvencni-rejstrik/) - Insolvency proceedings
- [UOHS](/osint/uohs/) - Competition law decisions
- [Executors](/osint/executors/) - Execution proceedings
- [ARES](/osint/ares/) - Entity identification for case parties
- [OSINT Core](/apps/prismatic-osint-core/) - Core OSINT framework and adapter layer

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)