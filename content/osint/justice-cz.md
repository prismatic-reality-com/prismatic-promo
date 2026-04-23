+++
title = "Justice.cz"
weight = 20
[extra]
category = "czech"
type = "company"
module = "JusticeCz"
description = "Czech Commercial Register (Obchodni rejstrik) with company filings and statutory body records"
has_api = true
url = "https://or.justice.cz"
rate_limit = "No official limit, recommended 1 req/sec"
capabilities = ["Company Search", "Filing History", "Statutory Bodies", "Financial Statements", "Insolvency Cross-Reference", "Court Documents"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1432
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Justicecz", "Czech", "Commercial", "Register", "Obchodni", "osint", "Prismatic Platform", "Justice", "Coll", "Commercial Register"]
tags = ["osint", "czech", "justicecz", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "Justice.cz - Prismatic Platform"
+++

## Overview

Justice.cz hosts the official Czech Commercial Register (Obchodni rejstrik), the authoritative legal record of all companies incorporated in the Czech Republic. Maintained by regional courts (krajske soudy) under the supervision of the Ministry of Justice, the Commercial Register is the definitive source for company existence, legal form, statutory bodies (directors, board members, supervisory board), shareholders, registered capital, and complete filing histories. Unlike [ARES](@/osint/ares.md), which aggregates data from multiple registers for convenience, Justice.cz provides direct access to the primary source data including full filing histories, court decisions, and the document collection (Sbirka listin).

The Czech Commercial Register traces its origins to the Austro-Hungarian commercial code and has been modernized through multiple legislative iterations. The current legal framework is established by Act No. 304/2013 Coll. (Zakon o verejnych rejstricich pravnickych a fyzickych osob -- Act on Public Registers of Legal and Natural Persons), which replaced the earlier commercial register provisions of the Commercial Code. This act governs not only the Commercial Register but also the Foundations Register, Institute Register, Association Register, and Register of Unit Owners' Associations, all accessible through the Justice.cz portal.

The register is organized by court jurisdiction (Prague, Brno, Ostrava, Ceske Budejovice, Hradec Kralove, Usti nad Labem, and Plzen), with each court maintaining records for companies registered in its territory. Each company entry is identified by a section letter (A for sole traders, B for joint-stock companies, C for limited liability companies, etc.) and an insert number, forming a unique reference within that court.

For [OSINT](@/glossary/osint.md) practitioners, Justice.cz is the single most important Czech data source for corporate intelligence. It provides legally binding information that cannot be obtained with the same authority from any aggregator. The filing collection (Sbirka listin) is particularly valuable, containing annual financial statements, articles of association, shareholder meeting minutes, expert valuations, and transformation project documents that reveal corporate strategy, financial health, and governance decisions.

## Data Sources and Coverage

Justice.cz is the primary source -- all data originates from court filings submitted by companies as required by law. Coverage is comprehensive for all registered legal entities in the Czech Republic.

| Data Type | Description | OSINT Relevance |
|-----------|-------------|-----------------|
| **Company Details** | Name, ICO, legal form, registered address, incorporation date | Entity identification and verification |
| **Statutory Bodies** | Directors (jednatele), board members (clenove predstavenstva), supervisory board | Leadership mapping and PEP screening |
| **Shareholders** | Ownership structure, share capital, voting rights | UBO identification and corporate control analysis |
| **Filing History** | All documents filed with the court (Sbirka listin) | Financial analysis and governance review |
| **Financial Statements** | Annual reports, balance sheets, profit and loss statements | Financial due diligence and health assessment |
| **Court Decisions** | Liquidation, bankruptcy, mergers, transformations | Corporate distress and M&A tracking |
| **Branch Offices** | Registered branch locations | Geographic footprint mapping |
| **Trade Restrictions** | Limitations on statutory body authority | Risk assessment for contractual counterparties |
| **Prokura** | Power of attorney (prokura) holders | Authorized representatives identification |
| **Legal Form Changes** | Transformations, mergers, demergers, cross-border conversions | Corporate restructuring intelligence |

### Document Collection (Sbirka listin)

The filing collection is a uniquely valuable OSINT resource with no equivalent in many other jurisdictions:

| Document Type | Czech Name | Intelligence Value |
|--------------|------------|-------------------|
| **Annual Financial Statements** | Ucetni zaverky | Revenue, assets, liabilities, profitability |
| **Articles of Association** | Zakladatelska listina / Spolecenska smlouva | Governance rules, voting mechanisms, restrictions |
| **Shareholder Meeting Minutes** | Zapisy z valnych hromad | Strategic decisions, disputes, dividend policies |
| **Court Decisions** | Soudni rozhodnuti | Judicial interventions, forced changes |
| **Expert Valuations** | Znalecke posudky | Asset valuations for mergers/transformations |
| **Transformation Projects** | Projekty premeny | Merger and demerger documentation |
| **Annual Reports** | Vyrocni zpravy | Management commentary and outlook |

### Temporal and Geographic Scope

The digital Commercial Register contains records dating back to the 1990s, with progressively more complete digital filings from the mid-2000s onward. Geographic coverage is the entire Czech Republic through seven regional courts. Historical paper records predating digitization can be accessed through court archive requests.

## Technical Architecture

Justice.cz does not provide a structured REST API for the Commercial Register. Data access is through the web interface at or.justice.cz, which requires HTML parsing for programmatic access. The Insolvency Register (ISIR), however, provides a separate structured API.

### Web Interface Structure

```
or.justice.cz
  |-- /ias/ui/rejstrik-$firma    # Company search
  |-- /ias/ui/vypis-sl-firma     # Filing collection (Sbirka listin)
  |-- /ias/ui/rejstrik-$osoba    # Person search (statutory bodies)
  |-- /ias/ui/vypis-sl-detail    # Document detail and download
```

### Data Formats

| Access Method | Format | Structured | Notes |
|--------------|--------|-----------|-------|
| **Web Interface** | HTML | No -- requires parsing | Primary access method |
| **Filing Documents** | PDF, occasionally XBRL | PDF unstructured; XBRL structured | Financial statements increasingly in XBRL |
| **ISIR API** | JSON/XML | Yes | Insolvency register only |
| **Open Data Dumps** | CSV/XML | Yes | Periodic bulk exports via data.gov.cz |

### Search Capabilities

| Search Type | Parameters | Returns |
|------------|-----------|---------|
| **By Company Name** | Full or partial name | List of matching entities |
| **By ICO** | 8-digit identification number | Direct company record |
| **By Person Name** | First name, last name, date of birth | Companies where person serves |
| **By Court and Section** | Court + section letter + insert number | Specific company record |
| **By Address** | Street, city | Companies at that address |

## API Integration

The Prismatic Platform provides a structured adapter for Justice.cz that handles HTML parsing, document extraction, and data normalization.

```elixir
defmodule Prismatic.Osint.JusticeCz do
  @moduledoc """
  Adapter for the Czech Commercial Register (Obchodni rejstrik) at Justice.cz.
  Provides structured access to company data, statutory bodies, and filing histories.
  """

  @base_url "https://or.justice.cz"

  @spec search(keyword()) :: {:ok, list(map())} | {:error, term()}
  def search(opts) do
    with {:ok, html} <- fetch_search(opts),
         {:ok, results} <- parse_search_results(html) do
      {:ok, results}
    end
  end

  @spec get_company(String.t()) :: {:ok, map()} | {:error, term()}
  def get_company(ico) do
    with {:ok, html} <- fetch_company_detail(ico),
         {:ok, company} <- parse_company_detail(html) do
      {:ok, company}
    end
  end

  @spec filings(String.t()) :: {:ok, list(map())} | {:error, term()}
  def filings(ico) do
    with {:ok, html} <- fetch_filings(ico),
         {:ok, filing_list} <- parse_filings(html) do
      {:ok, filing_list}
    end
  end

  @spec statutory_body_history(String.t()) :: {:ok, list(map())} | {:error, term()}
  def statutory_body_history(ico) do
    with {:ok, html} <- fetch_company_history(ico),
         {:ok, history} <- parse_statutory_history(html) do
      {:ok, history}
    end
  end

  @spec check_insolvency(String.t()) :: {:ok, map()} | {:error, term()}
  def check_insolvency(ico) do
    with {:ok, response} <- fetch_isir(ico),
         {:ok, status} <- parse_insolvency_status(response) do
      {:ok, status}
    end
  end
end
```

### Usage Examples

```elixir
# Search for a company by name
{:ok, results} = JusticeCz.search(name: "Prismatic")
# => [%{ico: "12345678", name: "Prismatic s.r.o.", court: "Praha", section: "C", insert: "123456"}]

# Get full company details including statutory bodies and shareholders
{:ok, company} = JusticeCz.get_company("12345678")
# => %{
#   ico: "12345678",
#   name: "Prismatic s.r.o.",
#   legal_form: "spolecnost s rucenim omezenym",
#   registered_address: "Vaclavske namesti 1, Praha 1, 110 00",
#   date_of_incorporation: ~D[2020-01-15],
#   statutory_bodies: [
#     %{name: "Jan Novak", function: "jednatel", since: ~D[2020-01-15]},
#     %{name: "Eva Svobodova", function: "jednatel", since: ~D[2022-06-01]}
#   ],
#   share_capital: %{amount: 200_000, currency: "CZK", paid_up: true},
#   shareholders: [
#     %{name: "Jan Novak", share: "100%", type: "physical_person"}
#   ]
# }

# Get complete filing history
{:ok, filings} = JusticeCz.filings("12345678")
# => [
#   %{type: :annual_report, date: ~D[2024-06-30], document_url: "..."},
#   %{type: :articles_of_association, date: ~D[2020-01-15], document_url: "..."}
# ]

# Get statutory body change history
{:ok, history} = JusticeCz.statutory_body_history("12345678")

# Cross-reference with insolvency register (ISIR)
{:ok, insolvency} = JusticeCz.check_insolvency("12345678")
```

## Use Cases

### Corporate Due Diligence

Justice.cz is the cornerstone of any Czech corporate due diligence process. Investigators verify company existence and legal standing, review the complete statutory body composition including historical changes (detecting rapid director turnover as a red flag), analyze financial statements from the filing collection, check for liquidation or bankruptcy proceedings, and examine shareholder structures to identify ultimate beneficial owners. The filing collection provides access to articles of association that reveal governance mechanisms, voting thresholds, and restrictions on director authority -- critical information for assessing counterparty risk.

### KYC/AML Compliance

For Know Your Customer and Anti-Money Laundering compliance, Justice.cz provides essential data: ultimate beneficial owner identification through shareholder structures, Politically Exposed Person screening through statutory body records, cross-referencing with [EU Sanctions](@/osint/eu-sanctions.md) and [OFAC](@/osint/ofac.md) lists, and corporate structure analysis to detect layered ownership typical of money laundering schemes. Czech AML legislation (Act No. 253/2008 Coll.) requires obligated entities to verify client identity using official register data, making Justice.cz an authoritative source for compliance.

### Corporate Intelligence and M&A Monitoring

Justice.cz enables tracking of competitor corporate structure changes, monitoring mergers and acquisitions activity through transformation project filings, identifying related companies through shared statutory bodies (a director serving on multiple company boards reveals corporate networks), and analyzing financial trajectories through year-over-year financial statement comparison.

### Insolvency and Credit Risk

Cross-referencing with the Insolvency Register (ISIR) via the Justice.cz portal enables early detection of financial distress. Monitoring for insolvency petition filings, reorganization plans, and creditor committee compositions provides critical signals for credit risk assessment and supply chain stability analysis.

## Data Quality and Reliability

| Quality Factor | Assessment | Details |
|---------------|------------|---------|
| **Completeness** | Very High | Legal mandate requires filing; non-compliance has legal consequences |
| **Accuracy** | Very High | Court-reviewed data; errors can be corrected through judicial process |
| **Timeliness** | High | Statutory changes registered within days; financial statements within legal deadlines |
| **Authority** | Authoritative | Primary legal source; data has evidentiary value in court proceedings |
| **Standardization** | Medium | Structured court records; PDF filings vary in format |

### Czech Legal Context

- **Act No. 304/2013 Coll.** (Zakon o verejnych rejstricich) -- Primary legislation governing public registers
- **Act No. 90/2012 Coll.** (Zakon o obchodnich korporacich) -- Business Corporations Act defining corporate governance
- **Act No. 89/2012 Coll.** (Novy obcansky zakonik) -- New Civil Code providing foundational legal framework
- **Act No. 563/1991 Coll.** (Zakon o ucetnictvi) -- Accounting Act mandating financial statement filing
- **Act No. 253/2008 Coll.** (Zakon o AML) -- Anti-Money Laundering Act requiring register verification
- **Directive (EU) 2017/1132** -- EU Company Law Directive influencing register interoperability (BRIS)

## Platform Integration

Justice.cz serves as the authoritative company data source within the Prismatic Platform, integrated into the comprehensive Czech entity intelligence pipeline.

```elixir
defmodule PrismaticPerimeter.DueDiligence.CzechCompanyReport do
  @moduledoc """
  Generates comprehensive Czech company due diligence reports
  by combining data from Justice.cz, ARES, RZP, and Insolvency Register.
  """

  @spec generate_report(String.t()) :: {:ok, map()} | {:error, term()}
  def generate_report(ico) do
    tasks = [
      Task.async(fn -> JusticeCz.get_company(ico) end),
      Task.async(fn -> Ares.get_full_details(ico) end),
      Task.async(fn -> Rzp.get_licenses(ico) end),
      Task.async(fn -> InsolvencniRejstrik.check(ico) end),
      Task.async(fn -> NespolehlivyPlatce.check("CZ#{ico}") end)
    ]

    [justice, ares, rzp, insolvency, vat_reliability] = Task.await_many(tasks, 30_000)

    with {:ok, justice_data} <- justice,
         {:ok, ares_data} <- ares,
         {:ok, rzp_data} <- rzp,
         {:ok, insolvency_data} <- insolvency,
         {:ok, vat_data} <- vat_reliability do
      {:ok, %{
        company: justice_data,
        business_activities: ares_data.predmety_podnikani,
        trade_licenses: rzp_data,
        insolvency_status: insolvency_data,
        vat_reliability: vat_data,
        risk_score: calculate_risk(justice_data, insolvency_data, vat_data),
        filings_complete: check_filing_compliance(justice_data),
        generated_at: DateTime.utc_now()
      }}
    end
  end
end
```

## NABLA Compliance

| Axiom | Implementation |
|-------|---------------|
| **Signal Plurality** | Justice.cz data cross-referenced with ARES, RZP, insolvency register, and DPH registry |
| **Contradiction Preservation** | Discrepancies between Justice.cz and ARES data preserved with both versions and timestamps |
| **Provenance Mandatory** | All data tagged with source (or.justice.cz), court jurisdiction, extraction timestamp |
| **Time Decay** | Registration dates and filing dates enable temporal confidence assessment |
| **Source Independence** | Justice.cz is the primary court source, independent from ARES aggregation layer |

## Performance Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| **Company Detail Extraction** | 1-3s | HTML parsing with HTTP request |
| **Filing List Retrieval** | 2-5s | Depends on filing count |
| **Document Download** | 3-15s | PDF size dependent |
| **Insolvency Check (ISIR API)** | < 1s | Structured API, fastest access method |
| **Cache TTL** | 6 hours | Balances freshness with rate consideration |
| **Coverage** | ~700,000+ active entities | All registered Czech legal entities |

## Related Resources

- [ARES](@/osint/ares.md) -- Aggregated Czech business register providing faster lookups across multiple registers
- [RZP](@/osint/rzp.md) -- Czech Trade Licensing Register for business activity verification
- [Insolvencni Rejstrik](@/osint/insolvencni-rejstrik.md) -- Czech insolvency register with structured API
- [Nespolehlivy Platce](@/osint/nespolehlivy-platce.md) -- Unreliable VAT payer list for financial risk signals
- [EU Sanctions](@/osint/eu-sanctions.md) -- EU sanctions list for cross-referencing statutory body members
- [OFAC](@/osint/ofac.md) -- US sanctions list for international compliance screening
- [Registr smluv](@/osint/registr-smluv.md) -- Public contracts revealing business relationships with state entities
- [Podnikatel.cz](@/osint/podnikatel.md) -- Business aggregator providing quick consolidated company views

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)