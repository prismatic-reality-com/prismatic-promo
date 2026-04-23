+++
title = "RES"
weight = 31
[extra]
category = "czech"
type = "company"
module = "Res"
description = "Register of Economic Subjects (Registr ekonomickych subjektu) - statistical registry maintained by the Czech Statistical Office"
has_api = true
url = "https://apl.czso.cz/irsw/"
rate_limit = "Public web access, no official API rate limit"
capabilities = ["Entity Search", "NACE Classification", "Statistical Data", "Organizational Structure", "Employee Count", "Legal Form Lookup"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1395
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["RES", "Register", "Economic", "Subjects", "Registr", "Czech", "Statistical", "osint", "Prismatic Platform", "NACE"]
tags = ["osint", "czech", "res", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "RES - Prismatic Platform"
+++

## Overview

RES (Registr ekonomickych subjektu) is the statistical register of all economic subjects in the Czech Republic, maintained by the Czech Statistical Office (Cesky statisticky urad, CSU) under Act No. 89/1995 Coll., on the State Statistical Service, as amended. Unlike administrative registers such as [ARES](/osint/ares/) that aggregate data from business registries, RES provides the statistical classification view of the Czech economy. Every entity assigned an ICO (Identification Number of a Person) is recorded in RES with standardized statistical classifications including CZ-NACE economic activity codes, institutional sector classification, organizational form, and employee count categories.

The register contains approximately 2.8 million economic subjects, encompassing both active and inactive entities across all sectors of the Czech economy. RES serves as the authoritative national source for economic activity classification and forms the foundation of the Czech Republic's statistical reporting obligations to Eurostat. For OSINT analysts, RES provides intelligence that no other Czech register delivers: the precise industry classification of entities, their employee count ranges, and their institutional sector positioning within the European System of Accounts (ESA 2010) framework. This data is essential for sector-level competitive analysis, industry mapping, economic research, and due diligence verification of claimed business activities.

The legal basis for RES is established in Section 20 of Act No. 89/1995 Coll., which mandates the CSU to maintain a register of economic subjects for statistical purposes. Data flows into RES from administrative sources including the Commercial Register ([Justice.cz](/osint/justice-cz/)), the Trade Licensing Register ([RZP](/osint/rzp/)), the Tax Administration, and sector-specific registries. The CSU enriches this data with statistical classifications that are standardized across the European Union.

## Data Sources and Coverage

RES aggregates data from multiple authoritative administrative sources and enriches them with standardized statistical classifications. The register covers all legal entities and natural persons engaged in economic activity in the Czech Republic.

| Data Type | Description | Source |
|-----------|-------------|--------|
| **ICO** | Company identification number (8-digit) | Administrative registers |
| **Entity Name** | Official registered name | Commercial Register / RZP |
| **Legal Form** | Standardized legal form code | CSU codelist |
| **CZ-NACE Activities** | Primary and secondary economic activity codes | CSU classification |
| **Employee Category** | Employee count range (0, 1-5, 6-9, ..., 5000+) | CSU statistical surveys |
| **Institutional Sector** | ESA 2010 sector classification | CSU classification |
| **Address** | Registered seat with RUIAN address code | RUIAN address register |
| **Founding Date** | Date of entity creation | Administrative registers |
| **Dissolution Date** | Date of dissolution (if applicable) | Administrative registers |
| **Organizational Form** | Legal organizational structure type | CSU codelist |

### Key Classification Systems

| Classification | Standard | Purpose | Levels |
|---------------|----------|---------|--------|
| **CZ-NACE** | Based on EU NACE Rev. 2 | Economic activity classification | 4 levels (section to class) |
| **CZ-COPNI** | National classification | Non-profit institutions classification | 3 levels |
| **CZ-NUTS** | EU NUTS standard | Regional statistical classification | 4 levels |
| **Legal Form** | CSU codelist | Legal entity type (s.r.o., a.s., etc.) | 3-digit codes |
| **Size Category** | CSU bands | Employee count categorization | 12 categories |
| **Institutional Sector** | ESA 2010 | National accounts sector classification | 4-digit codes |

### Czech Legal Context

RES operates within a well-defined legal framework:

- **Act No. 89/1995 Coll.** (on the State Statistical Service) - primary legislation establishing the register
- **Act No. 563/1991 Coll.** (on Accounting) - defines reporting obligations that feed into RES
- **Regulation (EC) No. 177/2008** - EU regulation on business registers for statistical purposes
- **Czech Statistical Office Decree** - detailed operational rules for register maintenance
- **GDPR compliance** - natural person data in RES subject to Act No. 110/2019 Coll. (on personal data processing)

## Technical Architecture

The RES technical infrastructure operates within the CSU's statistical information system. Data flows from administrative registers through a harmonization pipeline that applies statistical classifications before storage.

```
Administrative Sources                Statistical Classification
+------------------+                 +----------------------+
| Commercial Reg.  |---+             | CZ-NACE Assignment   |
| Trade License    |---+---> RES --> | ESA 2010 Sector      |
| Tax Admin        |---+    Core     | Legal Form Coding    |
| Sector Registries|---+             | Size Category        |
+------------------+                 +----------------------+
                                              |
                                              v
                                     +------------------+
                                     | Public Interface  |
                                     | apl.czso.cz/irsw |
                                     +------------------+
```

The public interface at `apl.czso.cz/irsw` provides web-based search functionality. RES data is also accessible through the ARES aggregation layer, which combines RES statistical classifications with data from other administrative registers into a unified XML response.

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Data Intake** | Batch feeds from administrative registers | Raw entity data collection |
| **Classification Engine** | CSU internal system | Statistical code assignment |
| **Storage** | Relational database | Entity records with classifications |
| **Public Interface** | Web application at apl.czso.cz | User-facing search and lookup |
| **ARES Integration** | XML data exchange | Structured API access via ARES |
| **Open Data** | CSV/XML exports | Bulk data downloads |

## API Integration

RES does not provide a standalone REST API. Data access is available through the web interface at `apl.czso.cz/irsw` and through the ARES XML service, which includes RES classification data in its responses. The Prismatic adapter handles both access methods transparently.

```elixir
defmodule Prismatic.Osint.Res do
  @moduledoc """
  Adapter for the Czech Register of Economic Subjects (RES).
  Provides statistical classification data for Czech economic entities
  including CZ-NACE activity codes, employee categories, and institutional sectors.
  """

  @doc """
  Look up an entity by ICO and retrieve full statistical classification.
  """
  @spec get(String.t()) :: {:ok, map()} | {:error, term()}
  def get(ico) when is_binary(ico) do
    with {:ok, response} <- fetch_entity(ico),
         {:ok, parsed} <- parse_response(response) do
      {:ok, %{
        ico: parsed.ico,
        name: parsed.name,
        legal_form: parsed.legal_form,
        nace_primary: parsed.nace_primary,
        nace_secondary: parsed.nace_secondary,
        employee_category: parsed.employee_category,
        institutional_sector: parsed.institutional_sector,
        address: parsed.address,
        founded: parsed.founded,
        status: parsed.status
      }}
    end
  end

  @doc """
  Search entities by CZ-NACE code with optional geographic filtering.
  Returns all entities classified under the specified activity code.
  """
  @spec by_nace(String.t(), keyword()) :: {:ok, list(map())} | {:error, term()}
  def by_nace(nace_code, opts \\ []) do
    municipality = Keyword.get(opts, :municipality)

    with {:ok, results} <- search_by_classification(nace_code, municipality) do
      {:ok, Enum.map(results, &normalize_entity/1)}
    end
  end

  @doc """
  Get sector-level statistics for a CZ-NACE code.
  """
  @spec sector_stats(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def sector_stats(nace_code, opts \\ []) do
    municipality = Keyword.get(opts, :municipality)

    with {:ok, entities} <- by_nace(nace_code, municipality: municipality) do
      active = Enum.filter(entities, &(&1.status == :active))

      {:ok, %{
        nace_code: nace_code,
        total_entities: length(entities),
        active: length(active),
        by_size: group_by_employee_category(active),
        by_legal_form: group_by_legal_form(active),
        region: municipality
      }}
    end
  end

  @doc """
  Get employee count distribution for a specific NACE sector.
  """
  @spec employee_distribution(String.t()) :: {:ok, map()} | {:error, term()}
  def employee_distribution(nace_code) do
    with {:ok, entities} <- by_nace(nace_code) do
      distribution = entities
        |> Enum.filter(&(&1.status == :active))
        |> Enum.group_by(& &1.employee_category)
        |> Enum.map(fn {category, entities} -> {category, length(entities)} end)
        |> Map.new()

      {:ok, %{nace_code: nace_code, distribution: distribution}}
    end
  end
end
```

### Industry Intelligence Pipeline

```elixir
defmodule PrismaticPerimeter.Intelligence.IndustryAnalysis do
  @moduledoc """
  Analyzes industry sectors using RES statistical data
  combined with financial intelligence from other Czech registers.
  Supports sector concentration analysis, competitor mapping,
  and economic trend tracking.
  """

  @spec sector_analysis(String.t(), String.t() | nil) :: {:ok, map()} | {:error, term()}
  def sector_analysis(nace_code, region \\ nil) do
    with {:ok, entities} <- Res.by_nace(nace_code, municipality: region),
         {:ok, stats} <- Res.sector_stats(nace_code, municipality: region) do
      top_entities = entities
        |> Enum.filter(&(&1.employee_category in ["50-99", "100-249", "250+"]))
        |> Enum.map(fn entity ->
          {:ok, ares} = Ares.get_full_details(entity.ico)
          Map.put(entity, :ares_data, ares)
        end)

      {:ok, %{
        sector: nace_code,
        region: region,
        statistics: stats,
        top_entities: top_entities,
        concentration: calculate_sector_concentration(entities),
        growth_indicators: analyze_founding_trends(entities),
        analyzed_at: DateTime.utc_now()
      }}
    end
  end

  defp calculate_sector_concentration(entities) do
    active = Enum.filter(entities, &(&1.status == :active))
    large = Enum.filter(active, &(&1.employee_category in ["250+", "1000+"]))
    %{total: length(active), large_entities: length(large), ratio: length(large) / max(length(active), 1)}
  end
end
```

## Use Cases

### Competitor Mapping and Industry Intelligence

RES enables systematic identification and analysis of all competitors within a defined industry sector and geographic region. By querying CZ-NACE codes, analysts can enumerate every registered entity in a sector, analyze size distribution, and identify dominant players. This is particularly valuable for market entry assessments and competitive landscape studies.

- Identify all competitors in a NACE sector and region
- Analyze sector size distribution and concentration indices
- Track new entrants and exits in specific industries over time
- Combine with [ARES](/osint/ares/) for financial details on sector leaders

### Economic Research and Statistical Analysis

RES is the primary data source for economic research at the sector and regional levels. Its standardized classifications enable cross-country comparisons within the EU (through NACE harmonization) and longitudinal analysis of Czech economic structure.

- Sector-level employment analysis using employee count categories
- Regional economic structure mapping across CZ-NUTS regions
- Entity creation and dissolution trend tracking for economic cycle analysis
- Cross-reference with [CEDR](/osint/cedr/) subsidy data for sector-specific public support analysis

### Due Diligence and Compliance Verification

RES provides independent verification of business activity claims. If an entity claims to operate in a specific industry, RES records reveal the officially registered CZ-NACE codes, which may differ from marketing claims.

- Verify claimed business activities against registered NACE codes
- Compare entity size claims with registered employee category
- Cross-reference legal form with [Justice.cz](/osint/justice-cz/) commercial register data
- Support KYC/AML processes with verified industry classification

## Data Quality and Reliability

| Quality Dimension | Assessment | Notes |
|------------------|------------|-------|
| **Completeness** | High | All ICO-assigned entities included |
| **Timeliness** | Moderate | Dependent on administrative source updates |
| **Accuracy** | High | Official CSU classification methodology |
| **Consistency** | High | EU-harmonized classification standards |
| **Accessibility** | Moderate | Web interface; structured data via ARES |
| **Authority** | Definitive | CSU is the sole statistical authority |

Data quality considerations specific to RES:

- **NACE codes** may not reflect actual current business activities if the entity has not updated its registration
- **Employee categories** are statistical estimates based on surveys and administrative data, not exact headcounts
- **Inactive entities** remain in the register, which can inflate sector counts if not filtered
- **Update lag** between administrative changes and RES reflection typically spans days to weeks

## Platform Integration

Within the Prismatic Platform, RES serves as the statistical classification layer, enriching entity records from other Czech registers with standardized industry and organizational data.

```
[ARES]          [Justice.cz]      [RZP]
   |                |               |
   v                v               v
+------------------------------------------+
|     Prismatic Entity Resolution Engine    |
|                                          |
|  Entity Record + RES Statistical Layer:  |
|  - CZ-NACE classification               |
|  - Employee category                     |
|  - Institutional sector (ESA 2010)       |
|  - Legal form code                       |
+------------------------------------------+
            |
            v
   [Perimeter Security Rating]
   [Sector Analysis Pipeline]
   [Due Diligence Reports]
```

Integration touchpoints:

| Component | Integration | Data Flow |
|-----------|-------------|-----------|
| **ARES Adapter** | Primary data path | RES data included in ARES XML responses |
| **Entity Resolution** | Classification enrichment | NACE codes attached to entity profiles |
| **Perimeter EASM** | Sector risk context | Industry classification for security ratings |
| **Due Diligence** | Verification layer | Activity and size verification |
| **Analytics** | Sector dashboards | Statistical aggregations and trend analysis |

## NABLA Compliance

RES integration within the Prismatic Platform adheres to NABLA epistemic framework requirements:

| Axiom | Implementation |
|-------|---------------|
| **Signal Plurality** | RES data cross-referenced with ARES and RZP for multi-source verification |
| **Contradiction Preservation** | Discrepancies between RES NACE codes and declared activities preserved and flagged |
| **Provenance Mandatory** | All RES data tagged with CSU source and extraction timestamp |
| **Time Decay** | Entity classifications timestamped; staleness alerts for data older than 90 days |
| **Unknown Valid** | Missing employee categories explicitly represented as unknown, not assumed |
| **Source Independence** | RES treated as independent statistical source distinct from ARES administrative layer |

Trinity Gate compliance for RES-derived claims:

- **Structural**: Entity-sector relationships form valid DAG in knowledge graph
- **Logical**: NACE classification hierarchy enforced (section > division > group > class)
- **Formal**: Employee category ranges validated against CSU codelist definitions

## Performance Metrics

| Metric | Target | Typical |
|--------|--------|---------|
| **ICO Lookup** | < 500ms | ~200ms (via ARES cache) |
| **NACE Sector Query** | < 2s | ~1.2s (depending on sector size) |
| **Sector Statistics** | < 3s | ~2s (aggregation computation) |
| **Employee Distribution** | < 2s | ~1.5s |
| **Cache Hit Rate** | > 80% | ~85% (24h TTL for entity data) |
| **Data Freshness** | < 7 days | ~3 days (administrative source lag) |

Caching strategy: Entity-level data cached with 24-hour TTL. Sector-level aggregations cached with 1-hour TTL due to potential changes from entity updates. Full sector statistics regenerated daily.

## Related Resources

### Czech Administrative Registers
- [ARES](/osint/ares/) - Administrative entity register with financial data (primary RES access path)
- [Justice.cz](/osint/justice-cz/) - Commercial register details and corporate filings
- [RZP](/osint/rzp/) - Trade licensing register for license verification
- [VR.cz](/osint/vr-cz/) - Unified public registry portal

### Financial and Subsidy Intelligence
- [CEDR](/osint/cedr/) - Central subsidy register for sector-level subsidy analysis
- [SZIF](/osint/szif/) - Agricultural subsidy data for primary sector analysis

### Entity Verification
- [Datove Schranky](/osint/datove-schranky/) - Entity existence verification via data boxes
- [Insolvencni rejstrik](/osint/insolvencni-rejstrik/) - Insolvency status cross-reference

### Platform Components
- [OSINT Core](/apps/prismatic-osint-core/) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](/apps/prismatic-perimeter/) - EASM with sector-aware security ratings

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)