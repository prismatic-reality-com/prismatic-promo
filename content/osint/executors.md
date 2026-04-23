+++
title = "Executors"
weight = 39
[extra]
category = "czech"
type = "legal"
module = "Executors"
description = "Czech Bailiff Proceedings Registry (Centralni evidence exekuci) - database of enforcement proceedings against debtors"
has_api = false
url = "https://www.ceecr.cz"
rate_limit = "Paid access per query, no bulk API"
capabilities = ["Execution Search", "Debtor Check", "Proceeding Status", "Executor Identification", "Amount Lookup", "Historical Records"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1033
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Executors", "Czech", "Bailiff", "Proceedings", "Registry", "Centralni", "osint", "Prismatic Platform", "Coll", "Description"]
tags = ["osint", "czech", "executors", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "Executors - Prismatic Platform"
+++

## Overview

The Czech Executors [Registry](/glossary/registry-otp/) (Centralni evidence exekuci, CEE) is the central database of all bailiff enforcement proceedings in the Czech Republic, maintained by the Chamber of Executors (Exekutorska komora CR) under Act No. 120/2001 Coll. (Execution Code). When a creditor obtains an enforceable court decision or arbitration award, they may initiate execution proceedings through a court-appointed executor (soudni exekutor). All such proceedings are registered in CEE.

For [OSINT](/glossary/osint/) purposes, execution proceedings are among the most critical negative indicators for entity and individual risk assessment. The presence of active executions against a company or individual signals severe financial distress, failed debt obligations, and potential inability to fulfill contractual commitments. Unlike [insolvency proceedings](/osint/insolvencni-rejstrik/), which are collective and typically result in a structured process, executions represent individual creditor enforcement actions and can accumulate -- an entity may have dozens of simultaneous execution proceedings.

The CEE registry was established to bring transparency to the historically fragmented landscape of Czech enforcement proceedings. Prior to its creation, creditors and investigators had no centralized mechanism to determine the total enforcement burden on a debtor. Today, the registry provides a single point of inquiry for all bailiff proceedings across the country, regardless of which executor or court is handling the case.

## Data Coverage

| Data Type | Description |
|-----------|-------------|
| **Debtor** | Name, ICO/birth date of person or entity under execution |
| **Executor** | Appointed bailiff (soudni exekutor) name and office |
| **Court** | Authorizing court and case number |
| **Creditor** | Original creditor seeking enforcement |
| **Amount** | Claimed amount (where available) |
| **Status** | Active, completed, stayed, terminated |
| **Type** | Monetary, property seizure, eviction |
| **Date** | Commencement and completion dates |

### Execution Methods

Czech law provides executors with a range of enforcement methods, each suited to different asset types and debtor situations. The executor selects the appropriate method based on the debtor's asset profile and the nature of the obligation being enforced.

| Method | Czech | Description |
|--------|-------|-------------|
| **Wage Garnishment** | Srazky ze mzdy | Employer redirects portion of salary |
| **Bank Account Seizure** | Prikaz k uhrade | Bank account frozen and debited |
| **Property Seizure** | Prodej nemovitosti | Real property auctioned |
| **Movable Seizure** | Prodej movitych veci | Movable property seized and sold |
| **Business Sale** | Prodej podniku | Entire business sold |
| **License Suspension** | Pozastaveni opravneni | Licenses suspended |

### Execution Lifecycle

Every execution proceeding follows a defined lifecycle within the Czech legal framework:

| Phase | Description | Typical Duration |
|-------|-------------|-----------------|
| **Filing** | Creditor files execution petition with court | 1-7 days |
| **Court Approval** | Court issues execution order (povereni) | 15-30 days |
| **Executor Assignment** | Specific executor appointed to the case | Immediate |
| **Asset Discovery** | Executor investigates debtor's assets | 30-90 days |
| **Enforcement** | Actual seizure/garnishment executed | Variable |
| **Distribution** | Recovered funds distributed to creditor | 30-60 days |
| **Completion** | Proceeding closed and archived | Upon satisfaction |

## Integration with Prismatic

The Executors registry provides the enforcement proceedings intelligence layer within the Prismatic platform, critical for credit risk assessment alongside [Insolvency Register](/osint/insolvencni-rejstrik/) data.

```elixir
# Check executions by ICO
{:ok, executions} = Executors.check("12345678")
# => %{
#   has_executions: true,
#   active_count: 3,
#   total_count: 7,
#   proceedings: [
#     %{
#       executor: "Mgr. Jan Novak, Exekutorsky urad Praha 5",
#       court: "Okresni soud v Praze 4",
#       case_number: "123 EX 456/24",
#       creditor: "CreditBank a.s.",
#       amount: 450_000,
#       status: :active,
#       commenced: ~D[2024-03-15]
#     }
#   ]
# }

# Check by person name and birth date
{:ok, result} = Executors.check_person(
  first_name: "Jan",
  last_name: "Novak",
  birth_date: ~D[1985-03-15]
)

# Get execution count (quick check)
{:ok, count} = Executors.count("12345678")

# Search by executor
{:ok, cases} = Executors.by_executor("Mgr. Jan Novak")
```

### Credit Risk Pipeline

The execution data pipeline combines enforcement data with insolvency, company registry, and property information to produce comprehensive credit risk assessments. This multi-source approach ensures that no single data gap can obscure the true financial health of an entity.

```elixir
defmodule PrismaticPerimeter.Risk.ExecutionRiskAssessment do
  @moduledoc """
  Assesses execution-based credit risk by combining bailiff data
  with insolvency and company registry information.
  """

  def assess_execution_risk(ico) do
    with {:ok, executions} <- Executors.check(ico),
         {:ok, insolvency} <- InsolvencniRejstrik.check(ico),
         {:ok, company} <- Ares.get_full_details(ico),
         {:ok, properties} <- Cuzk.search_by_owner(ico) do
      {:ok, %{
        entity: company,
        execution_summary: %{
          active: executions.active_count,
          total: executions.total_count,
          total_claimed: sum_amounts(executions.proceedings)
        },
        insolvency_status: insolvency,
        property_assets: length(properties),
        asset_coverage: estimate_asset_coverage(properties, executions),
        risk_level: calculate_execution_risk(executions, insolvency),
        recommendation: risk_recommendation(executions, insolvency)
      }}
    end
  end
end
```

### Risk Scoring Model

The execution risk scoring model considers multiple dimensions to produce an aggregate risk assessment:

| Factor | Weight | Scoring Logic |
|--------|--------|--------------|
| **Active Execution Count** | 30% | 0 = no penalty, 1-3 = moderate, 4+ = critical |
| **Total Claimed Amount** | 25% | Relative to company assets/revenue |
| **Execution Velocity** | 15% | New executions per quarter (trend analysis) |
| **Insolvency Overlap** | 15% | Concurrent insolvency = maximum risk |
| **Asset Coverage Ratio** | 15% | Property assets vs. total claimed amounts |

## Rate Limits and Access

| Aspect | Details |
|--------|---------|
| **Authentication** | Account required |
| **API** | No public API; web interface at ceecr.cz |
| **Rate Limit** | Per-query basis |
| **Data Format** | HTML (web results) |
| **Cost** | 60 CZK per query (approx. EUR 2.50) |
| **Coverage** | All execution proceedings in Czech Republic |

### Access Notes

- Unlike most Czech registers, CEE requires paid access per query
- Queries for entities require ICO; person queries require name + birth date
- Results show active and historical proceedings
- No bulk download or API available for automated processing
- The Chamber of Executors provides no structured data export mechanism, requiring the Prismatic adapter to perform web scraping with careful session management

## Legal Framework

The Czech execution system operates under several key legal instruments:

| Law | Description |
|-----|-------------|
| **Act No. 120/2001 Coll.** | Execution Code (Exekucni rad) - primary legislation |
| **Act No. 99/1963 Coll.** | Civil Procedure Code (OSR) - judicial enforcement |
| **Act No. 119/2001 Coll.** | Rules governing execution proceedings |
| **Act No. 286/2021 Coll.** | Amendment introducing creditor concentration rules |

Recent legislative changes have introduced the principle of "territorial concentration" -- new executions against a debtor are assigned to the executor already handling existing proceedings for that debtor. This consolidation aims to reduce costs and improve efficiency, and it has significant implications for OSINT analysis because it means a single executor often holds a complete view of a debtor's enforcement landscape.

## Use Cases

### Credit Risk Assessment
- Pre-contract screening for business partners
- Ongoing monitoring of key customers and suppliers
- Credit decisioning input for financial institutions
- Combine with [Insolvency Register](/osint/insolvencni-rejstrik/) for complete distress picture

### Due Diligence
- M&A target execution history assessment
- Employee screening for financial positions (with consent)
- Cross-reference with [ARES](/osint/ares/) and [Justice.cz](/osint/justice-cz/)
- Property encumbrance verification with [CUZK](/osint/cuzk/)

### Asset Recovery
- Identify assets available for enforcement
- Track executor handling of debtor's property
- Monitor completion of execution proceedings
- Analyze execution success rates by executor for strategic creditor decisions

### Regulatory Compliance
- Anti-money laundering checks for financial institutions
- [NIS2](/glossary/nis2/) supply chain risk assessment for critical infrastructure operators
- Insurance underwriting risk evaluation
- Public procurement disqualification screening

## Analytical Insights

Execution data reveals patterns that go beyond individual case assessment. Aggregate analysis across the CEE registry provides macro-economic intelligence:

- **Sector distress indicators**: Rising execution volumes in specific NACE sectors signal emerging economic stress
- **Regional concentration**: Geographic clustering of executions highlights local economic downturns
- **Creditor patterns**: Frequent filings by specific creditors may indicate predatory lending practices
- **Executor performance**: Completion rates and recovery amounts vary significantly between executors
- **Seasonal patterns**: Execution filings show predictable seasonal variation tied to business cycles

## Related Sources

- [Insolvency Register](/osint/insolvencni-rejstrik/) - Complementary insolvency data
- [CUZK](/osint/cuzk/) - Property records (execution liens visible)
- [ARES](/osint/ares/) - Entity identification for debtors
- [Justice.cz](/osint/justice-cz/) - Court records and corporate data
- [Court Cases](/osint/court-cases/) - Underlying court decisions
- [Nespolehlivy Platce](/osint/nespolehlivy-platce/) - VAT non-compliance correlation
- [VR.cz](/osint/vr-cz/) - Unified public registry for entity verification

## Related Platform Components

- [OSINT Core](/apps/prismatic-osint-core/) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](/apps/prismatic-perimeter/) - Execution data in [EASM](/glossary/easm/) risk scoring

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)