+++
title = "Insolvency Register"
weight = 22
[extra]
category = "czech"
type = "company"
module = "InsolvencniRejstrik"
description = "Czech Insolvency Register (ISIR) tracking bankruptcy and insolvency proceedings"
has_api = true
url = "https://isir.justice.cz"
rate_limit = "No official limit, ISIR REST API available"
capabilities = ["Insolvency Search", "Proceeding Status", "Creditor Lists", "Debtor Information", "Court Documents", "Real-Time Updates"]
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 761
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Insolvency", "Register", "Czech", "ISIR", "osint", "Prismatic Platform", "Description", "Justice", "Konkurs"]
tags = ["osint", "czech", "insolvency-register", "prismatic"]
quality_score = 65
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "Insolvency Register - Prismatic Platform"
+++

## Overview

The Czech Insolvency Register (Insolvencni rejstrik, ISIR) is the official public register maintained by the Ministry of Justice of the Czech Republic. It provides comprehensive information about all insolvency proceedings conducted by Czech courts, including bankruptcies (konkurs), reorganizations (reorganizace), and debt relief proceedings (oddluzeni).

ISIR is critical for due diligence, credit risk assessment, and compliance workflows. Any entity -- natural or legal person -- subject to insolvency proceedings in the Czech Republic will be recorded here with full procedural history. The register is updated in near real-time as courts publish decisions, making it one of the most timely public data sources in the Czech legal system.

The Czech insolvency framework, governed by Act No. 182/2006 Coll. (Insolvency Act), provides three resolution paths: liquidation bankruptcy (konkurs), where assets are sold and proceeds distributed to creditors; reorganization (reorganizace), where the business continues under a restructuring plan; and debt relief (oddluzeni), an individual debt discharge mechanism available to natural persons. The choice of path and the progression through each phase is fully documented in ISIR.

## Data Coverage

| Data Type | Description |
|-----------|-------------|
| **Debtor Information** | Name, ICO/birth number, address |
| **Proceeding Type** | Konkurs, reorganizace, oddluzeni |
| **Proceeding Status** | Filed, approved, active, completed, dismissed |
| **Insolvency Administrator** | Appointed administrator details |
| **Creditor Claims** | Filed claims with amounts and status |
| **Court Decisions** | All decisions, orders, and resolutions |
| **Key Dates** | Filing, approval, distribution, completion |
| **Distribution Schedule** | Creditor payment schedule and fulfillment |

### Proceeding Types

| Type | Czech | Description | Typical Duration |
|------|-------|-------------|-----------------|
| **Bankruptcy** | Konkurs | Liquidation of debtor's assets | 1-3 years |
| **Reorganization** | Reorganizace | Business restructuring plan | 1-2 years |
| **Debt Relief** | Oddluzeni | Individual debt relief (5-year plan) | 3-5 years |
| **Moratorium** | Moratorium | Temporary protection from creditors | 3 months max |

### Proceeding Status Lifecycle

Each insolvency proceeding follows a structured lifecycle tracked in ISIR:

| Status | Description | Significance |
|--------|-------------|-------------|
| **Filed** | Petition submitted to court | Earliest warning signal |
| **Under Review** | Court evaluating petition | Proceeding may be dismissed |
| **Approved** | Insolvency declared by court | Entity confirmed insolvent |
| **Method Selected** | Konkurs/reorganizace/oddluzeni chosen | Resolution path determined |
| **Active** | Claims being filed and resolved | Creditor claims period |
| **Distribution** | Assets distributed to creditors | Recovery phase |
| **Completed** | Proceeding officially closed | Historical record |
| **Dismissed** | Petition rejected by court | No insolvency confirmed |

## Integration with Prismatic

The Insolvency Register is a core data source for the Prismatic platform's risk assessment and due diligence pipelines, integrated with the Czech [registry](@/glossary/registry-otp.md) intelligence layer.

```elixir
# Search by company ICO
{:ok, proceedings} = InsolvencniRejstrik.search(ico: "12345678")
# => [
#   %{
#     case_number: "KSBR 44 INS 12345/2024",
#     debtor: "Example s.r.o.",
#     ico: "12345678",
#     type: :konkurs,
#     status: :active,
#     filed_date: ~D[2024-01-15],
#     administrator: "JUDr. Jana Novakova",
#     court: "Krajsky soud v Brne"
#   }
# ]

# Search by person name
{:ok, results} = InsolvencniRejstrik.search(
  first_name: "Jan",
  last_name: "Novak",
  birth_date: ~D[1985-03-15]
)

# Get full proceeding details
{:ok, detail} = InsolvencniRejstrik.get_proceeding("KSBR 44 INS 12345/2024")
# => %{
#   case_number: "KSBR 44 INS 12345/2024",
#   debtor: %{name: "Example s.r.o.", ico: "12345678", address: "..."},
#   type: :konkurs,
#   status: :active,
#   creditor_claims: [
#     %{creditor: "Bank A", amount: 5_000_000, status: :accepted},
#     %{creditor: "Supplier B", amount: 1_200_000, status: :disputed}
#   ],
#   court_decisions: [...],
#   key_dates: %{filed: ~D[2024-01-15], approved: ~D[2024-03-01]}
# }

# Quick insolvency check (boolean)
{:ok, check} = InsolvencniRejstrik.check("12345678")
# => %{has_proceedings: true, active_count: 1, historical_count: 0}

# Monitor for new proceedings (webhook-style)
{:ok, _} = InsolvencniRejstrik.subscribe(ico: "12345678", callback: &notify/1)
```

### Credit Risk Assessment Pipeline

```elixir
defmodule PrismaticPerimeter.Risk.CzechCreditAssessment do
  @moduledoc """
  Assesses credit risk for Czech entities by combining insolvency data
  with company registry information and execution proceedings.
  """

  def assess_credit_risk(ico) do
    with {:ok, insolvency} <- InsolvencniRejstrik.check(ico),
         {:ok, company} <- Ares.get_full_details(ico),
         {:ok, filings} <- JusticeCz.filings(ico),
         {:ok, executions} <- Executors.check(ico) do
      risk_factors = []

      risk_factors =
        if insolvency.has_proceedings do
          [{:insolvency, :critical, "Active insolvency proceeding"} | risk_factors]
        else
          risk_factors
        end

      risk_factors =
        if executions.active_count > 0 do
          [{:executions, :high, "#{executions.active_count} active executions"} | risk_factors]
        else
          risk_factors
        end

      risk_factors =
        if missing_financial_statements?(filings) do
          [{:missing_filings, :high, "Missing annual financial statements"} | risk_factors]
        else
          risk_factors
        end

      {:ok, %{
        ico: ico,
        company_name: company.nazev,
        risk_level: calculate_overall_risk(risk_factors),
        risk_factors: risk_factors,
        insolvency_status: insolvency,
        execution_status: executions,
        recommendation: generate_recommendation(risk_factors)
      }}
    end
  end
end
```

### Creditor Recovery Analysis

For creditors monitoring their claims in active proceedings, ISIR data enables recovery tracking:

| Recovery Metric | Description | Typical Range |
|----------------|-------------|--------------|
| **Konkurs Recovery** | Percentage of claims satisfied in liquidation | 5-25% |
| **Reorganizace Recovery** | Percentage under restructuring plan | 30-70% |
| **Oddluzeni Recovery** | Individual debt relief satisfaction | 30-100% |
| **Administrative Costs** | Portion consumed by process costs | 10-30% |
| **Time to Distribution** | Duration from filing to first payment | 6-24 months |

## Rate Limits and Access

| Aspect | Details |
|--------|---------|
| **Authentication** | None required (public register) |
| **API** | ISIR [REST API](@/glossary/rest-api.md) available (isir.justice.cz) |
| **Rate Limit** | No official limit; responsible use expected |
| **Data Format** | JSON (REST API), HTML (web interface) |
| **Cost** | Free access |
| **Real-Time** | Near real-time updates as courts publish decisions |

### ISIR REST API

Unlike most Czech public registers, ISIR provides a proper REST API:
- `GET /isir/doc/isir_ws.html` - API documentation
- Structured JSON responses
- Event-based updates for monitoring
- Support for incremental data synchronization

### Event-Based Monitoring

ISIR supports event-based monitoring, enabling the Prismatic platform to detect changes as they occur rather than polling:

| Event Type | Description | Use Case |
|-----------|-------------|----------|
| **New Filing** | New insolvency petition submitted | Early warning detection |
| **Status Change** | Proceeding status updated | Progress tracking |
| **Claim Filed** | New creditor claim registered | Claim monitoring |
| **Decision Published** | Court decision issued | Legal event tracking |
| **Administrator Changed** | New administrator appointed | Contact update |

## Use Cases

### Credit Risk Assessment
- Pre-contract insolvency screening for business partners
- Ongoing monitoring of key suppliers and customers
- Credit decisioning input for financial institutions
- Combine with [Executors](@/osint/executors.md) for complete financial distress picture

### Due Diligence
- Part of comprehensive Czech entity checks with [ARES](@/osint/ares.md), [Justice.cz](@/osint/justice-cz.md), and [RZP](@/osint/rzp.md)
- M&A target insolvency history verification
- Vendor qualification for [NIS2](@/glossary/nis2.md) supply chain requirements
- Cross-reference with [VR.cz](@/osint/vr-cz.md) for complete entity intelligence

### Legal and Compliance
- Creditor claim filing monitoring
- Insolvency administrator identification
- Court decision tracking for ongoing proceedings
- Automated compliance monitoring for financial institutions

### Market Intelligence
- Sector-wide insolvency trend analysis
- Early warning indicators for economic stress in specific industries
- Geographic distribution of insolvency proceedings
- Seasonal patterns in bankruptcy filings

## Related Sources

- [ARES](@/osint/ares.md) - Czech business register aggregator
- [Justice.cz](@/osint/justice-cz.md) - Commercial Register with filings
- [RZP](@/osint/rzp.md) - Trade Licensing Register
- [VR.cz](@/osint/vr-cz.md) - Czech Business Registry
- [Executors](@/osint/executors.md) - Enforcement proceedings data
- [EU Sanctions](@/osint/eu-sanctions.md) - [Sanctions screening](@/glossary/sanctions-screening.md) for compliance

## Related Platform Components

- [OSINT Core](@/apps/prismatic-osint-core.md) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](@/apps/prismatic-perimeter.md) - Insolvency data in credit risk ratings

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)