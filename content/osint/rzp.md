+++
title = "RZP"
weight = 21
[extra]
category = "czech"
type = "company"
module = "Rzp"
description = "Czech Trade Licensing Register (Zivnostensky rejstrik) for business license verification"
has_api = true
url = "https://www.rzp.cz"
rate_limit = "No official limit, recommended 1 req/sec"
capabilities = ["License Search", "ICO Lookup", "License Type Verification", "Person Search", "License History", "Business Activity Classification"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1212
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["RZP", "Czech", "Trade", "Licensing", "Register", "Zivnostensky", "osint", "Prismatic Platform", "ARES", "License"]
tags = ["osint", "czech", "rzp", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "RZP - Prismatic Platform"
+++

## Overview

RZP (Rejstrik zivnostenskeho podnikani) is the Czech Republic's Trade Licensing Register, maintained by the Ministry of Industry and Trade (Ministerstvo prumyslu a obchodu) as the authoritative source for all trade licenses (zivnostenska opravneni) issued to natural and legal persons conducting business in the Czech Republic. The register operates under Act No. 455/1991 Coll., the Trade Licensing Act (Zivnostensky zakon), as amended, which defines the legal framework for trade licensing in the Czech Republic.

While [ARES](/osint/ares/) aggregates trade license data alongside other registry sources, RZP is the primary authoritative source maintained by the licensing authorities themselves. It provides detailed information about license types, validity periods, scope of authorized activities, responsible persons for regulated trades, and any restrictions, suspensions, or revocations. The register contains records for approximately 3.5 million trade licenses across both active and historical entries.

Czech trade licensing law distinguishes four categories of trade licenses, each with different qualification requirements and regulatory oversight. This classification system is fundamental to understanding the Czech business landscape: a company's trade licenses define the scope of activities it is legally authorized to perform. Any business activity conducted without the appropriate trade license constitutes an administrative offense under Czech law.

For [OSINT](/glossary/osint/) analysts, RZP provides critical verification intelligence. Claims about business capabilities can be validated against registered licenses, responsible persons for regulated activities can be identified, and the licensing history of entities reveals patterns of business expansion, contraction, or regulatory issues.

## Data Sources and Coverage

RZP receives data from local trade licensing offices (zivnostenske urady) across all 205 Czech municipalities with extended competence, which process license applications and maintain local records.

| Data Type | Description | Source |
|-----------|-------------|--------|
| **License Holder** | Name, ICO, registered address | Application records |
| **License Type** | Volna, Remeslna, Vazana, Koncesovana | Licensing authority classification |
| **Business Activities** | Authorized scope of trade activities | License application |
| **Validity Period** | Issue date, expiry date, current status | Licensing authority |
| **Responsible Person** | Named representative for regulated trades | Qualification verification |
| **Suspensions** | License suspensions, restrictions, revocations | Enforcement records |
| **Licensing Authority** | Issuing trade licensing office | Administrative records |
| **Establishment Addresses** | Physical business locations (provozovny) | License registration |

### Czech Trade License Types

| Type | Czech Name | Requirements | Examples |
|------|-----------|-------------|----------|
| **Free Trade** | Volna zivnost | Registration only, no special qualifications | General trade and services, IT consulting |
| **Craft Trade** | Remeslna zivnost | Professional qualification (education + practice) | Plumbing, electrical work, bakery |
| **Regulated Trade** | Vazana zivnost | Specific education or professional certification | Accounting, tax advisory, geodesy |
| **Concession Trade** | Koncesovana zivnost | State approval + qualifications + background check | Weapons trade, taxi services, private security |

### Czech Legal Context

RZP operates within a comprehensive legal framework:

- **Act No. 455/1991 Coll.** (Trade Licensing Act) - primary legislation governing trade licenses
- **Act No. 570/1991 Coll.** (on Trade Licensing Offices) - administrative authority structure
- **Government Decree No. 278/2008 Coll.** - defines content areas for free trades
- **Annexes 1-3 of the Trade Licensing Act** - enumerate craft, regulated, and concession trades
- **Act No. 89/2012 Coll.** (Civil Code) - general legal framework for business entities
- **EU Services Directive 2006/123/EC** - harmonized requirements for cross-border service provision

## Technical Architecture

RZP is accessible through a web interface at `www.rzp.cz` and through data integration with the ARES system. The technical architecture reflects the distributed nature of Czech trade licensing administration.

```
Local Trade Offices (205 municipalities)
         |
         v
+---------------------------+
| Central RZP Database      |
| (Ministry of Industry)    |
+---------------------------+
         |
    +----+----+
    |         |
    v         v
+-------+  +--------+
| Web   |  | ARES   |
| rzp.cz|  | Integ. |
+-------+  +--------+
```

| Component | Description |
|-----------|-------------|
| **Local Offices** | 205 trade licensing offices process applications and maintain records |
| **Central Database** | Consolidated register at the Ministry of Industry and Trade |
| **Web Interface** | Public search at www.rzp.cz with entity and person search |
| **ARES Integration** | RZP data available through ARES XML API alongside other registers |
| **Open Data** | Bulk exports available through Czech Open Data portal |

## API Integration

RZP does not provide a standalone REST API. Data access is available through the web interface and through the ARES XML service. The Prismatic adapter supports both access paths.

```elixir
defmodule Prismatic.Osint.Rzp do
  @moduledoc """
  Adapter for the Czech Trade Licensing Register (RZP).
  Provides trade license verification, license history, and
  responsible person lookup for Czech business entities.
  """

  @doc """
  Get all trade licenses for an entity by ICO.
  Returns active and historical licenses with full details.
  """
  @spec get_licenses(String.t()) :: {:ok, list(map())} | {:error, term()}
  def get_licenses(ico) when is_binary(ico) do
    with {:ok, response} <- fetch_licenses(ico),
         {:ok, parsed} <- parse_license_response(response) do
      {:ok, Enum.map(parsed, &normalize_license/1)}
    end
  end

  @doc """
  Search by person name to find associated trade licenses.
  """
  @spec search_person(keyword()) :: {:ok, list(map())} | {:error, term()}
  def search_person(opts) do
    first_name = Keyword.fetch!(opts, :first_name)
    last_name = Keyword.fetch!(opts, :last_name)

    with {:ok, response} <- search_by_person(first_name, last_name) do
      {:ok, Enum.map(response, &normalize_person_result/1)}
    end
  end

  @doc """
  Verify whether an entity holds a specific license type for a given activity.
  """
  @spec verify_license(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def verify_license(ico, opts \\ []) do
    activity = Keyword.get(opts, :activity)

    with {:ok, licenses} <- get_licenses(ico) do
      matching = Enum.filter(licenses, fn license ->
        (is_nil(activity) or String.contains?(license.activity, activity)) and
        license.status == :active
      end)

      {:ok, %{
        valid: length(matching) > 0,
        matching_licenses: matching,
        type: List.first(matching)[:type],
        status: if(length(matching) > 0, do: :active, else: :not_found)
      }}
    end
  end

  @doc """
  Get complete license history including expired and suspended licenses.
  """
  @spec license_history(String.t()) :: {:ok, list(map())} | {:error, term()}
  def license_history(ico) do
    with {:ok, licenses} <- get_licenses(ico) do
      sorted = Enum.sort_by(licenses, & &1.valid_from, {:desc, Date})
      {:ok, sorted}
    end
  end

  @doc """
  Check for any active suspensions or restrictions on an entity's licenses.
  """
  @spec check_suspensions(String.t()) :: {:ok, map()} | {:error, term()}
  def check_suspensions(ico) do
    with {:ok, licenses} <- get_licenses(ico) do
      suspended = Enum.filter(licenses, &(&1.status == :suspended))
      restricted = Enum.filter(licenses, &(&1.status == :restricted))

      {:ok, %{
        has_suspensions: length(suspended) > 0,
        suspended_licenses: suspended,
        restricted_licenses: restricted,
        total_issues: length(suspended) + length(restricted)
      }}
    end
  end
end
```

### Entity Verification Pipeline

```elixir
defmodule PrismaticPerimeter.Verification.CzechEntityVerifier do
  @moduledoc """
  Verifies Czech business entity legitimacy by cross-referencing
  ARES, Justice.cz, and RZP data. Identifies discrepancies between
  declared activities and held licenses.
  """

  @spec verify_entity(String.t()) :: {:ok, map()} | {:error, term()}
  def verify_entity(ico) do
    tasks = [
      Task.async(fn -> Ares.get_by_ico(ico) end),
      Task.async(fn -> Rzp.get_licenses(ico) end),
      Task.async(fn -> JusticeCz.get_company(ico) end),
      Task.async(fn -> Rzp.check_suspensions(ico) end)
    ]

    [ares, licenses, justice, suspensions] = Task.await_many(tasks, 15_000)

    with {:ok, ares_data} <- ares,
         {:ok, license_data} <- licenses,
         {:ok, justice_data} <- justice do
      {:ok, %{
        entity_exists: true,
        name_consistent: ares_data.nazev == justice_data.name,
        active_licenses: Enum.count(license_data, &(&1.status == :active)),
        has_required_licenses: verify_required_licenses(ares_data, license_data),
        statutory_bodies_current: check_statutory_bodies(justice_data),
        suspensions: extract_ok(suspensions),
        risk_indicators: identify_risk_indicators(ares_data, license_data, justice_data),
        verified_at: DateTime.utc_now()
      }}
    end
  end

  defp verify_required_licenses(ares, licenses) do
    required = extract_regulated_activities(ares.predmety_podnikani)
    held = Enum.map(licenses, & &1.activity)
    Enum.all?(required, &(&1 in held))
  end
end
```

## Use Cases

### Business License Verification

The primary use case for RZP is verifying that entities hold the required licenses for their claimed business activities. This is essential for due diligence, regulatory compliance, and supply chain verification.

- Verify that a company holds required licenses for claimed activities
- Check for suspended or revoked licenses that indicate regulatory issues
- Identify responsible persons for regulated trades (craft, regulated, concession)
- Validate that establishment addresses match operational locations

### Due Diligence and KYC/AML Compliance

RZP is an integral component of Czech entity verification workflows, providing license-level verification that complements corporate registration data.

- Cross-reference with [ARES](/osint/ares/) and [Justice.cz](/osint/justice-cz/) for comprehensive entity verification
- Verify business scope matches claimed operations and revenue sources
- Cross-reference license data with [Insolvencni rejstrik](/osint/insolvencni-rejstrik/) for distressed entities
- Support KYC verification of Czech business entities for banking and financial services

### Regulatory Compliance and NIS2

For organizations subject to NIS2 requirements, RZP data enables supply chain vendor verification for critical service providers.

- KYC verification of Czech business entities across all regulated sectors
- Supply chain vendor verification for [NIS2](/glossary/nis2/) compliance obligations
- Anti-money laundering checks focusing on concession trades (financial services, security)
- Verify that healthcare, pharmaceutical, and food industry suppliers hold required licenses

### Competitive Intelligence

License data reveals the authorized activity scope of competitors, enabling market analysis and competitive positioning.

- Map competitor capabilities based on held license types
- Track new license acquisitions that signal business expansion
- Analyze sector-level licensing patterns for market entry planning
- Identify entities entering regulated markets through concession approvals

## Data Quality and Reliability

| Quality Dimension | Assessment | Notes |
|------------------|------------|-------|
| **Completeness** | High | All issued trade licenses recorded |
| **Timeliness** | Good | Updates within days of licensing authority decisions |
| **Accuracy** | Authoritative | Direct from licensing authorities |
| **Accessibility** | Moderate | Web interface; structured data via ARES |
| **Authority** | Definitive | Ministry of Industry and Trade is the sole authority |
| **Historical Depth** | Excellent | Includes expired and historical licenses |

Key data quality considerations:

- **License scope**: Free trade licenses cover broad activity categories; specific activity within scope cannot always be verified
- **Responsible persons**: Required only for craft, regulated, and concession trades; not all entities have named responsible persons
- **Establishment addresses**: May differ from registered company address; cross-reference for complete location intelligence
- **ARES integration**: ARES includes RZP data but may have slight delay compared to direct RZP access

## Platform Integration

| Component | Integration | Purpose |
|-----------|-------------|---------|
| **Entity Resolution** | License data enrichment | Attach trade licenses to entity profiles |
| **Due Diligence** | License verification | Verify authorized business activities |
| **Perimeter EASM** | Vendor verification | Supply chain license compliance for NIS2 |
| **Risk Scoring** | License risk indicators | Suspensions and missing licenses as risk signals |
| **Compliance** | KYC/AML pipeline | Regulatory license verification for financial services |

## NABLA Compliance

| Axiom | Implementation |
|-------|---------------|
| **Signal Plurality** | RZP cross-referenced with ARES and Justice.cz for multi-source verification |
| **Contradiction Preservation** | Discrepancies between declared activities and held licenses preserved as risk indicators |
| **Provenance Mandatory** | All license data tagged with RZP source and extraction timestamp |
| **Time Decay** | License validity dates tracked; expired licenses flagged with temporal context |
| **Unknown Valid** | Missing responsible person data explicitly represented, not assumed |
| **Source Independence** | RZP treated as independent licensing authority distinct from commercial register data |

## Performance Metrics

| Metric | Target | Typical |
|--------|--------|---------|
| **ICO License Lookup** | < 1s | ~400ms (via ARES cache) |
| **Person Search** | < 2s | ~1.2s |
| **License Verification** | < 1s | ~500ms |
| **Suspension Check** | < 1s | ~400ms |
| **Cache Hit Rate** | > 80% | ~85% (24h TTL) |
| **Data Freshness** | < 3 days | ~1 day (licensing office update cycle) |

## Related Resources

### Czech Entity Registers
- [ARES](/osint/ares/) - Aggregated Czech business register (includes RZP data)
- [Justice.cz](/osint/justice-cz/) - Commercial Register with corporate filings
- [VR.cz](/osint/vr-cz/) - Unified public registry portal
- [RES](/osint/res/) - Statistical register with NACE classifications

### Compliance and Verification
- [Insolvencni rejstrik](/osint/insolvencni-rejstrik/) - Insolvency proceedings
- [EU Sanctions](/osint/eu-sanctions/) - EU sanctions list for compliance screening
- [SUKL](/osint/sukl/) - Pharmaceutical licensing for healthcare sector

### Platform Components
- [OSINT Core](/apps/prismatic-osint-core/) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](/apps/prismatic-perimeter/) - EASM with supply chain verification

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)