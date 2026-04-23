+++
title = "EU Business Registry"
weight = 45
[extra]
category = "eu"
type = "company"
module = "Ebr"
description = "European Business Registry (EBR) and BRIS - interconnected European company registers providing cross-border entity verification"
has_api = true
url = "https://e-justice.europa.eu/489/EN/business_registers__search_for_a_company_in_the_eu.html"
rate_limit = "Public access through e-Justice portal"
capabilities = ["Cross-Border Company Search", "EU-Wide Entity Verification", "Interconnected Register Access", "Branch Registration Data", "Cross-Border Merger Tracking", "Disqualified Director Sharing"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1187
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Business", "Registry", "European", "BRIS", "osint", "Prismatic Platform", "High", "Compliant"]
tags = ["osint", "eu", "eu-business-registry", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "EU Business Registry - Prismatic Platform"
+++

## Overview

The European Business [Registry](@/glossary/registry-otp.md) (EBR) and its successor system, the Business Registers Interconnection System (BRIS), represent the European Union's foundational infrastructure for cross-border corporate intelligence. Mandated by EU Directive 2012/17/EU (the Interconnection Directive) and subsequently strengthened by Directive 2019/1151/EU (the Digitalization Directive), BRIS provides a unified interface through which all national business registers of EU and EEA member states are interconnected, enabling seamless cross-border company searches, automated branch registration notifications, and sharing of disqualified director information.

The system addresses a fundamental challenge in European corporate intelligence: the fragmentation of company registration data across 30 independent national registers, each with its own data formats, access procedures, legal frameworks, and languages. Before BRIS, verifying a company's existence and status across European borders required navigating each national register individually, often requiring language expertise and understanding of local registration conventions. BRIS consolidates this fragmented landscape into a single access point through the European e-Justice portal.

BRIS became fully operational on June 8, 2017, connecting the business registers of all 27 EU member states plus Iceland, Liechtenstein, and Norway (EEA). The system processes cross-border company searches, delivers automated notifications when branches are registered in other member states, shares information about cross-border mergers, and enables the exchange of disqualified director data across jurisdictions. Each company accessible through BRIS receives a standardized European Unique Identifier (EUID) in the format `{country_code}.{register_code}.{registration_number}`, enabling unambiguous cross-border entity identification.

For [OSINT](@/glossary/osint.md) practitioners and due diligence professionals, BRIS/EBR provides the critical capability to trace corporate structures across European borders. When a Czech s.r.o. operates a branch in Germany, or a French SA has a subsidiary registered in Austria, BRIS connects these registrations and enables investigators to build complete multi-jurisdictional corporate group maps. This is essential for pan-European due diligence, beneficial ownership tracing, anti-money laundering compliance, and understanding multi-jurisdictional corporate groups.

## Data Sources and Coverage

BRIS aggregates data from national business registers across 30 countries, with coverage depth varying by member state. All member states provide the minimum required dataset specified by the Interconnection Directive, while many provide substantially more.

| Data Category | Description | Availability |
|---------------|-------------|-------------|
| **Company Name** | Official registered name in national register | All member states |
| **Registration Number** | National company identifier | All member states |
| **EUID** | European Unique Identifier | All member states |
| **Legal Form** | National legal form with EU classification | All member states |
| **Registered Office** | Address in home member state | All member states |
| **Status** | Active, dissolved, in liquidation, struck off | All member states |
| **Directors/Officers** | Company directors and authorized representatives | Most member states |
| **Branch Registrations** | Cross-border branch registrations in other EU states | Automatic notification via BRIS |
| **Cross-Border Mergers** | Merger notifications between EU entities | Automatic notification via BRIS |
| **Disqualified Directors** | Directors disqualified in any member state | Shared across all member states |
| **Winding Up Proceedings** | Cross-border winding-up and insolvency notifications | Where applicable |
| **Financial Statements** | Annual accounts where publicly filed | Varies by member state |

### Connected National Registers

| Country | Register | National ID Format | Data Depth |
|---------|----------|-------------------|------------|
| **Czech Republic** | [Justice.cz](@/osint/justice-cz.md) / Obchodni rejstrik | ICO (8 digits) | High (full filings) |
| **Germany** | Handelsregister | HRB/HRA + number | High |
| **United Kingdom** | [Companies House](@/osint/companies-house.md) | 8-digit number | Very High |
| **France** | Registre du Commerce (RCS) | SIREN (9 digits) | High |
| **Netherlands** | Kamer van Koophandel (KvK) | KvK number (8 digits) | High |
| **Austria** | Firmenbuch | FN + number | High |
| **Slovakia** | Obchodny register | ICO (8 digits) | High |
| **Poland** | Krajowy Rejestr Sadowy (KRS) | KRS number (10 digits) | High |

### EUID Format and Usage

The European Unique Identifier (EUID) provides a standardized format for unambiguous cross-border entity reference:

```
EUID Format: {country_code}.{register_code}.{registration_number}

Examples:
  CZ.OR.12345678     -- Czech company in Obchodni rejstrik
  DE.HRB.123456      -- German GmbH in Handelsregister
  FR.RCS.123456789   -- French SA in Registre du Commerce
  UK.CH.12345678     -- UK company in Companies House
```

## Technical Architecture

BRIS operates as a distributed system connecting national registers through a central European platform maintained by the European Commission's DG JUSTICE.

### System Architecture

```
National Business Registers (30 countries)
    |
    +-- Czech Republic: Justice.cz / Obchodni rejstrik
    +-- Germany: Handelsregister (16 Laender courts)
    +-- France: RCS (Tribunaux de Commerce)
    +-- ... (27 more national registers)
    |
    v
BRIS Central Platform (European Commission)
    +-- Search Gateway (unified query interface)
    +-- Notification System (branch registrations, mergers)
    +-- EUID Resolution (cross-border entity linking)
    +-- Disqualified Director Exchange
    |
    v
Access Layer
    +-- European e-Justice Portal (web interface)
    +-- National register integrations
    +-- Authorized third-party access (via national APIs)
```

### Access Methods

The primary public access point for BRIS is the European e-Justice portal. Programmatic access is not directly available through BRIS itself but is available through individual national register APIs, which are backed by BRIS data for cross-border queries. The Prismatic adapter aggregates both direct national register access and e-Justice portal queries.

## API Integration

```elixir
defmodule PrismaticOsint.Adapters.Ebr do
  @moduledoc """
  European Business Registry (BRIS) adapter for pan-European
  entity verification and cross-border corporate intelligence.
  Aggregates data from the e-Justice portal and direct national
  register APIs.
  """

  @behaviour PrismaticOsint.Adapter

  @doc """
  Search for entities across all EU/EEA business registers.
  """
  def search(query, opts \\ []) do
    country = Keyword.get(opts, :country, :all)
    case search_ejustice(query, country) do
      {:ok, results} ->
        normalized = Enum.map(results, &normalize_result/1)
        {:ok, %{query: query, results: normalized, total: length(normalized)}}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @doc """
  Get detailed company information using EUID.
  """
  def get_company(euid) do
    {country, register, number} = parse_euid(euid)
    case fetch_from_national_register(country, register, number) do
      {:ok, company} ->
        {:ok, %{
          euid: euid,
          name: company.name,
          legal_form: company.legal_form,
          status: company.status,
          registered_office: company.address,
          directors: company.directors,
          registration_date: company.registered_since,
          country: country
        }}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @doc """
  Find all cross-border branches of a company.
  """
  def branches(euid) do
    case query_bris_branches(euid) do
      {:ok, branches} ->
        {:ok, %{parent_euid: euid, branches: branches, count: length(branches)}}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @doc """
  Check disqualified directors across all EU member states.
  """
  def check_disqualified(name, opts \\ []) do
    country = Keyword.get(opts, :country, :all)
    case query_disqualified_directors(name, country) do
      {:ok, results} ->
        {:ok, %{name: name, matches: results, total: length(results)}}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @doc """
  Trace corporate group structure across EU borders.
  """
  def trace_corporate_group(euid) do
    with {:ok, parent} <- get_company(euid),
         {:ok, branches} <- branches(euid),
         {:ok, subsidiaries} <- find_subsidiaries(euid) do
      {:ok, %{
        parent: parent,
        branches: branches.branches,
        subsidiaries: subsidiaries,
        jurisdiction_count: count_jurisdictions(parent, branches, subsidiaries),
        group_structure: build_group_tree(parent, branches, subsidiaries)
      }}
    end
  end
end
```

### Pan-European Due Diligence Pipeline

```elixir
defmodule PrismaticPerimeter.DueDiligence.PanEuropean do
  @moduledoc """
  Pan-European due diligence combining BRIS data with national
  registers and sanctions screening for comprehensive cross-border
  entity assessment.
  """

  def eu_entity_check(euid) do
    with {:ok, entity} <- Ebr.get_company(euid),
         {:ok, branches} <- Ebr.branches(euid),
         {:ok, eu_sanctions} <- EuSanctions.search(entity.name),
         {:ok, ofac_sanctions} <- Ofac.search(entity.name) do
      national_data = case entity.country do
        :CZ -> fetch_czech_data(entity.registration_number)
        :UK -> fetch_uk_data(entity.registration_number)
        :DE -> fetch_german_data(entity.registration_number)
        _ -> %{source: :bris_only}
      end

      {:ok, %{
        entity: entity,
        branches: branches,
        national_enrichment: national_data,
        sanctions: %{eu: eu_sanctions, ofac: ofac_sanctions},
        cross_border_risk: assess_cross_border_risk(entity, branches),
        jurisdiction_count: count_jurisdictions(entity, branches)
      }}
    end
  end

  defp fetch_czech_data(ico) do
    with {:ok, ares} <- Ares.get_full_details(ico),
         {:ok, justice} <- JusticeCz.get_company(ico),
         {:ok, insolvency} <- InsolvencniRejstrik.check(ico) do
      %{ares: ares, justice: justice, insolvency: insolvency}
    end
  end
end
```

## Use Cases

### Cross-Border Due Diligence

BRIS enables comprehensive entity verification across EU member states from a single access point. Investigators can verify entity existence, confirm registration status, identify directors, and discover cross-border branch registrations without navigating individual national registers. This capability is essential for KYC/AML compliance, supply chain due diligence, and partner verification in multinational business relationships.

### Corporate Group Structure Mapping

By following branch registration notifications and subsidiary links through BRIS, analysts can map complete corporate group structures spanning multiple European jurisdictions. This is critical for understanding the full operational footprint of entities under investigation, identifying potential shell company structures, and tracing beneficial ownership across borders.

### Disqualified Director Screening

BRIS's disqualified director sharing mechanism enables screening of proposed directors against disqualification records from all EU member states. This is a valuable compliance tool for corporate governance, preventing individuals banned from holding directorships in one member state from assuming director roles in another.

### NIS2 Supply Chain Compliance

The [NIS2](@/glossary/nis2.md) Directive requires covered entities to conduct supply chain due diligence, including verification of EU suppliers. BRIS provides the foundational entity verification capability for this compliance requirement, confirming the existence and status of suppliers registered in any EU member state.

## Data Quality and Reliability

| Quality Dimension | Assessment | Notes |
|-------------------|------------|-------|
| **Authority** | Authoritative | Official EU system backed by national registers |
| **Completeness** | Variable by state | Minimum dataset guaranteed; depth varies |
| **Currency** | Near real-time | Depends on national register update frequency |
| **Accuracy** | High | Direct from official national sources |
| **Cross-Border Linking** | Good | EUID system enables unambiguous identification |
| **Language** | Multi-language | National language data; limited translation |

## Platform Integration

BRIS/EBR provides the pan-European entity intelligence layer within the Prismatic Platform, enabling cross-border corporate structure tracing and multi-jurisdictional due diligence. The adapter aggregates BRIS portal queries with direct national register API access (where available) to maximize data depth and coverage.

Results feed into the platform's entity resolution engine, linking BRIS entities with data from national registers ([ARES](@/osint/ares.md), [Companies House](@/osint/companies-house.md)), sanctions lists ([EU Sanctions](@/osint/eu-sanctions.md), [OFAC](@/osint/ofac.md)), and commercial intelligence sources.

## NABLA Compliance

| NABLA Axiom | Compliance | Implementation |
|-------------|------------|----------------|
| **Signal Plurality** | Compliant | BRIS data cross-referenced with national register APIs and commercial sources |
| **Contradiction Preservation** | Compliant | Discrepancies between BRIS and direct national register queries preserved |
| **Absence Informative** | Compliant | Missing BRIS data for expected entities flagged as investigation lead |
| **Time Decay** | Compliant | All queries timestamped with BRIS retrieval time |
| **Unknown Valid** | Compliant | Partial national register data acknowledged as incomplete |
| **Source Independence** | Compliant | BRIS is independent of commercial data aggregators |
| **Provenance Mandatory** | Compliant | Full provenance from national register through BRIS to platform |

## Performance Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| **Response Time** | 2-10 seconds | Cross-border queries slower than direct national access |
| **Coverage** | 30 countries | 27 EU + 3 EEA member states |
| **Data Freshness** | Hours to days | Depends on national register update frequency |
| **Entity Count** | 20M+ companies | Registered entities across all member states |
| **EUID Resolution** | Sub-second | Standardized identifier lookup |
| **Branch Notifications** | Real-time | Automated BRIS notifications |
| **Availability** | ~99% | e-Justice portal with scheduled maintenance |

## Related Resources

- [ARES](@/osint/ares.md) - Czech national register connected via BRIS
- [Justice.cz](@/osint/justice-cz.md) - Czech Commercial Register (BRIS source register)
- [Companies House](@/osint/companies-house.md) - UK register connected via BRIS
- [SEC EDGAR](@/osint/sec-edgar.md) - US filings for EU companies listed in US markets
- [EU Sanctions](@/osint/eu-sanctions.md) - EU [sanctions screening](@/glossary/sanctions-screening.md) for BRIS entities
- [OFAC](@/osint/ofac.md) - US sanctions for entities with US nexus
- [Open Corporates](@/osint/open-corporates.md) - Commercial aggregator of global company data

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)