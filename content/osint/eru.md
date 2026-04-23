+++
title = "ERU"
weight = 35
[extra]
category = "czech"
type = "company"
module = "Eru"
description = "Energy Regulatory Office (ERU) - registry of licensed energy market participants, pricing decisions, and regulatory data"
has_api = true
url = "https://www.eru.cz"
rate_limit = "Public license holder database"
capabilities = ["License Holder Search", "Price Decision Lookup", "Market Participant Verification", "Supported Source Registry", "Penalty Records", "Statistical Reports"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1108
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ERU", "Energy", "Regulatory", "Office", "osint", "czech", "Prismatic Platform", "License", "Compliant"]
tags = ["osint", "czech", "eru", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "ERU - Prismatic Platform"
+++

## Overview

ERU (Energeticky regulacni urad -- Energy Regulatory Office) is the Czech Republic's independent energy regulatory authority established under Act No. 458/2000 Coll. (the Energy Act, Energeticky zakon). ERU operates as an autonomous administrative authority responsible for regulating the electricity, gas, and heat supply markets within the Czech Republic. The office licenses and supervises all participants in these energy markets, making its [registry](/glossary/registry-otp/) the authoritative source for energy sector entity verification and the definitive database of licensed energy market operators.

Every entity that generates, transmits, distributes, trades, or supplies electricity or gas in the Czech Republic must hold an ERU license. This licensing requirement extends to renewable energy installations receiving feed-in tariffs or green bonuses under the supported energy sources (POZE) framework. The licensing database is publicly accessible and provides a comprehensive map of the Czech energy market's participant landscape, including information about license types, validity periods, licensed capacities, and regulatory compliance status.

For [OSINT](/glossary/osint/) purposes, ERU data reveals the complete structure of the Czech energy market. The registry identifies all licensed operators across the generation, transmission, distribution, trading, and supply segments. When combined with [ARES](/osint/ares/) corporate data, [CUZK](/osint/cuzk/) property records, and [Hlidac statu](/osint/hlidac-statu/) public contract analytics, ERU data enables comprehensive energy sector intelligence covering ownership structures, regulatory compliance history, renewable energy portfolios, and government procurement relationships.

ERU's data is particularly significant in the context of the European [NIS2](/glossary/nis2/) Directive implementation, which designates energy sector operators as essential entities requiring enhanced cybersecurity measures. ERU's licensing database effectively serves as the registry of NIS2-covered entities in the Czech energy sector, making it a critical data source for compliance assessment workflows.

### Czech Legal Context

| Legal Instrument | Relevance |
|-----------------|-----------|
| **Act No. 458/2000 Coll.** | Energy Act -- primary legislation establishing ERU and licensing framework |
| **Act No. 165/2012 Coll.** | Supported Energy Sources Act (POZE) -- renewable energy subsidies |
| **Decree No. 8/2016 Coll.** | ERU price regulation methodology |
| **EU Directive 2019/944** | EU electricity market design (Clean Energy Package) |
| **EU Directive 2022/2555** | NIS2 Directive -- energy sector as essential entities |
| **Act No. 181/2014 Coll.** | Cybersecurity Act (ZKB) -- Czech NIS2 transposition |

## Data Sources and Coverage

ERU provides several distinct data categories covering the full spectrum of energy regulatory intelligence.

| Data Category | Description | Update Frequency |
|---------------|-------------|-----------------|
| **Licenses** | All energy market license holders with details | Continuous (as issued/revoked) |
| **License Types** | Generation, transmission, distribution, trade, supply, storage | Complete categorization |
| **Supported Sources (OZE)** | Renewable energy installations with subsidy details | Updated with new registrations |
| **Pricing Decisions** | Regulated price rulings for electricity, gas, heat | Annual (with interim adjustments) |
| **Penalties** | Regulatory penalties and sanctions imposed by ERU | Published upon finality |
| **Market Reports** | Annual and quarterly reports on energy market state | Periodic publication |
| **POZE Contributions** | Contributions to supported energy sources fund | Annual calculation |

### License Categories and NIS2 Mapping

| License | Description | NIS2 Classification |
|---------|-------------|-------------------|
| **Generation** | Electricity and/or heat production | Essential entity (>50MW) |
| **Transmission** | High-voltage grid operation (CEPS a.s.) | Essential entity |
| **Distribution** | Regional grid operation (CEZ, E.ON, PRE) | Essential entity |
| **Trade** | Wholesale electricity/gas trading | Important entity |
| **Supply** | Retail supply to end customers | Important entity |
| **Gas Storage** | Underground gas storage facilities | Essential entity |
| **Gas Transit** | International gas pipeline operation | Essential entity |

## Technical Architecture

ERU publishes data through its public website and a searchable license holder database. The primary access points are web-based with structured data available through specific endpoints.

### Data Access Points

| Access Point | Format | Description |
|-------------|--------|-------------|
| License database (web) | HTML | Searchable license holder database at eru.cz |
| Pricing decisions | PDF | Published regulatory decisions |
| Statistical reports | XLS/PDF | Annual and quarterly market data |
| Supported sources registry | HTML/XLS | OZE installation database |
| Open data portal | CSV/XLS | Structured datasets for analysis |

## API Integration

```elixir
defmodule PrismaticOsint.Adapters.Eru do
  @moduledoc """
  Energy Regulatory Office (ERU) adapter for energy sector
  entity verification, license management, and NIS2 compliance
  assessment in the Czech Republic.
  """

  @behaviour PrismaticOsint.Adapter

  @doc """
  Search license holders by name or ICO.
  """
  def search(query) do
    case fetch_license_database(query) do
      {:ok, results} ->
        {:ok, Enum.map(results, &normalize_license_holder/1)}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @doc """
  Verify a specific license by number.
  """
  def verify_license(license_number) do
    case fetch_license_detail(license_number) do
      {:ok, detail} ->
        {:ok, %{
          license_number: license_number,
          holder: detail.holder_name,
          ico: detail.ico,
          type: detail.license_type,
          valid_from: detail.valid_from,
          valid_to: detail.valid_to,
          status: detail.status,
          nis2_classification: classify_nis2(detail)
        }}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @doc """
  Get all license holders by license type.
  """
  def by_license_type(type) do
    case fetch_license_database(%{type: type}) do
      {:ok, results} ->
        {:ok, %{
          license_type: type,
          holders: results,
          count: length(results),
          nis2_category: nis2_category_for_type(type)
        }}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @doc """
  Search supported (renewable) energy sources.
  """
  def supported_sources(opts \\ []) do
    type = Keyword.get(opts, :type)
    region = Keyword.get(opts, :region)
    fetch_supported_sources(%{type: type, region: region})
  end

  @doc """
  Get pricing decisions for a sector and year.
  """
  def pricing_decisions(opts \\ []) do
    year = Keyword.get(opts, :year, Date.utc_today().year)
    sector = Keyword.get(opts, :sector, :electricity)
    fetch_pricing_decisions(year, sector)
  end

  @doc """
  Check penalty history for an entity.
  """
  def penalty_history(ico) do
    fetch_penalties(ico)
  end

  defp classify_nis2(%{license_type: type, capacity_mw: cap}) do
    case {type, cap} do
      {:generation, mw} when mw >= 50 -> :essential
      {:transmission, _} -> :essential
      {:distribution, _} -> :essential
      {:gas_storage, _} -> :essential
      {:trade, _} -> :important
      {:supply, _} -> :important
      _ -> :not_classified
    end
  end
end
```

### Energy Sector NIS2 Assessment Pipeline

```elixir
defmodule PrismaticPerimeter.NIS2.EnergySectorAssessment do
  @moduledoc """
  Assesses NIS2 compliance for Czech energy sector entities
  by combining ERU licensing data with security ratings and
  corporate intelligence.
  """

  def assess_energy_entity(ico) do
    with {:ok, licenses} <- Eru.search(ico),
         {:ok, company} <- Ares.get_full_details(ico),
         {:ok, security_rating} <- PrismaticPerimeter.security_rating(company.nazev) do
      nis2_category = classify_nis2_entity(licenses)

      {:ok, %{
        entity: company,
        energy_licenses: licenses,
        nis2_classification: nis2_category,
        security_rating: security_rating,
        compliance_gaps: identify_nis2_gaps(nis2_category, security_rating),
        critical_infrastructure: critical_infrastructure?(licenses),
        assessed_at: DateTime.utc_now()
      }}
    end
  end

  defp classify_nis2_entity(licenses) do
    license_types = Enum.map(licenses, & &1.type)

    cond do
      :transmission in license_types -> :essential
      :distribution in license_types -> :essential
      :generation in license_types -> :essential
      :trade in license_types -> :important
      :supply in license_types -> :important
      true -> :not_covered
    end
  end
end
```

## Use Cases

### Critical Infrastructure Identification

ERU's licensing database serves as the definitive source for identifying Czech energy critical infrastructure operators. Security analysts, government agencies, and compliance teams use this data to map the complete landscape of licensed energy operators, categorize them by NIS2 classification, and identify entities requiring enhanced cybersecurity measures under the Czech Cybersecurity Act (ZKB).

### Energy Sector Due Diligence

Investors, M&A advisors, and corporate intelligence teams use ERU data for comprehensive energy sector due diligence. License verification confirms that an entity holds valid authorization to operate in its claimed energy market segment. Penalty history reveals regulatory compliance issues. Supported source registry data quantifies renewable energy portfolios and subsidy exposure.

### Renewable Energy Market Intelligence

The supported sources (OZE) registry provides detailed intelligence on Czech renewable energy installations, including solar, wind, biomass, and hydroelectric facilities. This data supports market analysis, investment assessment, and policy research by quantifying installed capacity, geographic distribution, and subsidy frameworks across renewable energy technologies.

### Regulatory Compliance Monitoring

Organizations with energy sector operations or supply chain dependencies use ERU data for ongoing compliance monitoring. License status changes, new penalty decisions, and pricing regulation updates all represent material compliance events that may affect business operations or risk assessments.

## Data Quality and Reliability

| Quality Dimension | Assessment | Notes |
|-------------------|------------|-------|
| **Authority** | Authoritative | Official government regulator; definitive license status |
| **Currency** | Near real-time for licenses | Published promptly after administrative decisions |
| **Accuracy** | Very High | Direct from ERU administrative databases |
| **Completeness** | Complete for licensed entities | All energy market participants must be licensed |
| **Historical Data** | Limited | Current status emphasis; historical penalties available |
| **Data Format** | Mixed | HTML, PDF, XLS requiring normalization |

## Platform Integration

ERU provides the energy sector intelligence layer within the Prismatic Platform, critical for NIS2 compliance assessment through [Prismatic Perimeter](/apps/prismatic-perimeter/). License data feeds into entity classification workflows that determine NIS2 coverage, and penalty history contributes to regulatory risk scoring.

## NABLA Compliance

| NABLA Axiom | Compliance | Implementation |
|-------------|------------|----------------|
| **Signal Plurality** | Compliant | ERU data combined with ARES, CUZK, and Hlidac statu for entity assessment |
| **Contradiction Preservation** | Compliant | Discrepancies between ERU and ARES entity data flagged |
| **Absence Informative** | Compliant | Missing ERU license for claimed energy operator flagged as anomaly |
| **Time Decay** | Compliant | License validity periods tracked; expired licenses flagged |
| **Unknown Valid** | Compliant | Entities with unclear NIS2 classification reported as unknown |
| **Source Independence** | Compliant | ERU is independent government authority |
| **Provenance Mandatory** | Compliant | All results traced to ERU database with retrieval timestamp |

## Performance Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| **Response Time** | 1-5 seconds | Web scraping-based access |
| **Rate Limit** | No official limit | Fair use expected |
| **Data Freshness** | Days | License changes published promptly |
| **Coverage** | All CZ energy licensees | Complete coverage of regulated entities |
| **License Types** | 7 categories | Generation through storage |
| **Availability** | ~99% | Government website with occasional maintenance |

## Related Resources

- [ARES](/osint/ares/) - Entity identification for energy companies
- [CTU](/osint/ctu/) - Telecom regulatory data (complementary Czech regulator)
- [CUZK](/osint/cuzk/) - Property records for energy infrastructure locations
- [CEDR](/osint/cedr/) - Energy sector subsidies and grants tracking
- [Hlidac statu](/osint/hlidac-statu/) - Public contract analysis for energy sector procurement
- [UOHS](/osint/uohs/) - Competition authority cases in energy markets
- [EU Sanctions](/osint/eu-sanctions/) - Sanctions screening for energy sector entities

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)