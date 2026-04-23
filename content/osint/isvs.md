+++
title = "ISVS"
weight = 42
[extra]
category = "czech"
type = "company"
module = "Isvs"
description = "Information System Registry of Public Administration (ISVS) - catalogue of Czech government information systems and their operators"
has_api = true
url = "https://www.isvs.cz"
rate_limit = "Public access, no official rate limit"
capabilities = ["IS Registry Search", "Operator Lookup", "System Classification", "Data Category Mapping", "Compliance Status", "Integration Points"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1522
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ISVS", "Information", "System", "Registry", "Public", "Administration", "osint", "czech", "Prismatic Platform", "Coll"]
tags = ["osint", "czech", "isvs", "prismatic"]
quality_score = 90
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "ISVS - Prismatic Platform"
+++

## Overview

ISVS (Informacni systemy verejne spravy -- Information Systems of Public Administration) is the official registry of information systems operated by public administration entities in the Czech Republic. Established and maintained under Act No. 365/2000 Coll. on Public Administration Information Systems (Zakon o informacnich systemech verejne spravy), ISVS mandates that every government body operating an information system that processes citizen or business data must register that system with the Ministry of Interior. The registry catalogs system names, purposes, data categories processed, operating authorities, legal bases, and interconnections with other government systems.

The legal foundation for ISVS traces back to the broader Czech e-government reform initiated in the early 2000s. Act 365/2000 Coll. was among the first legislative instruments in Central Europe to impose systematic registration requirements on government IT systems. Subsequent amendments, particularly those aligned with the EU Regulation on electronic identification and trust services (eIDAS) and the Czech Act No. 111/2009 Coll. on Basic Registers, reinforced ISVS as the authoritative catalogue of the Czech digital government infrastructure. The registry is operated under the supervision of the Ministry of Interior (Ministerstvo vnitra CR), which also oversees the Basic Register system (ROB, ROS, RUIAN, RPP).

For [OSINT](/glossary/osint/) practitioners, ISVS provides a unique intelligence layer that is absent in most other jurisdictions: a complete map of the digital infrastructure of an entire national public administration. Analysts can identify which systems exist, who operates them, what data they process, and how they interconnect. This is critical for understanding government data flows, identifying potential data sources for investigations, and assessing government digital maturity. For [NIS2](/glossary/nis2/) compliance purposes, ISVS reveals critical information infrastructure operated by essential government services, making it indispensable for supply chain security assessments involving Czech public sector entities.

The registry currently catalogs hundreds of information systems across all tiers of Czech public administration -- from central ministries to regional authorities and municipalities. Each entry provides structured metadata that enables systematic analysis of government data processing capabilities and dependencies.

## Data Sources and Coverage

ISVS draws its data from mandatory registration submissions by public administration operators. Every entity operating an information system under the scope of Act 365/2000 Coll. must provide registration data to the Ministry of Interior. Coverage extends across the entire Czech public administration hierarchy.

| Data Type | Description | OSINT Relevance |
|-----------|-------------|-----------------|
| **System Name** | Official name and unique identifier of the information system | Target identification for data source discovery |
| **Operator** | Public administration body operating the system (name, ICO) | Maps government organizational structure |
| **Purpose** | Legal purpose and functional description of the system | Identifies what data is available and where |
| **Data Categories** | Types of personal/business data processed | Reveals data holdings for investigative targeting |
| **Legal Basis** | Enabling legislation for the system | Determines legal access pathways |
| **Classification** | Critical infrastructure classification (where applicable) | NIS2 essential services identification |
| **Integration Points** | Connections to other government systems | Maps inter-system data flows |
| **Accessibility** | Public access level (public, restricted, internal) | Determines data acquisition feasibility |
| **Technical Parameters** | Technology stack, hosting, security classification | Infrastructure assessment for EASM |

### System Categories

The registry organizes systems into several broad categories that reflect the layered architecture of Czech e-government:

| Category | Examples | OSINT Relevance |
|----------|----------|-----------------|
| **Core Basic Registers** | ROB (inhabitants), ROS (persons), RUIAN (addresses), RPP (rights/duties) | Foundation of Czech e-government, authoritative data |
| **Sector-Specific Registers** | [ARES](/osint/ares/), Cadastre, ISIR, health registries | Primary OSINT data sources for domain investigations |
| **Administrative Systems** | Data boxes (Datove schranky), CzechPOINT | Government communication and service channels |
| **Specialized Databases** | Education, health, transport, environment | Sector-specific intelligence sources |
| **Infrastructure Systems** | PKI, identity management, security monitoring | Government cybersecurity posture assessment |

### Geographic and Temporal Scope

ISVS covers all public administration information systems across the Czech Republic with no geographic limitations within the jurisdiction. Temporal coverage begins from the registry's establishment under Act 365/2000 Coll. and includes both currently active systems and decommissioned entries. The registry is continuously updated as new systems are registered, existing systems are modified, and obsolete systems are retired.

## Technical Architecture

ISVS operates primarily through a web-based interface hosted at isvs.cz with supplementary data available through the Czech open data portal (data.gov.cz). The technical architecture reflects the registry's role as a metadata catalog rather than an operational data store.

### Data Model

The ISVS data model centers on the Information System entity with relationships to operators, data categories, legal bases, and integration points:

```
InformationSystem
  |-- id: ISVS identifier (e.g., "ISVS-001234")
  |-- name: Official system name
  |-- operator: Reference to public administration body
  |     |-- name: Organization name
  |     |-- ico: Company identification number
  |     |-- type: Ministry / Region / Municipality / Agency
  |-- purpose: Legal purpose description
  |-- data_categories: List of processed data types
  |     |-- personal_data, addresses, financial, health, etc.
  |-- legal_basis: Reference to enabling legislation
  |-- classification: Critical infrastructure flag
  |-- integration_points: Connected systems list
  |-- accessibility: public | restricted | internal
  |-- registration_date: Date of ISVS registration
  |-- last_updated: Most recent metadata update
```

### Access Methods

| Method | Endpoint | Format | Authentication |
|--------|----------|--------|----------------|
| **Web Interface** | isvs.cz | HTML | None (public) |
| **Open Data Portal** | data.gov.cz | CSV, XML, JSON | None (public) |
| **SPARQL Endpoint** | Linked data portal | RDF/SPARQL | None (public) |
| **Direct Export** | Registry bulk export | XML | None (public) |

### Data Freshness

Registration data is updated as operators submit changes. The Ministry of Interior reviews and publishes updates on an ongoing basis. For critical systems, updates are typically reflected within days of submission. For less critical systems, processing may take weeks.

## API Integration

While ISVS does not provide a dedicated REST API in the traditional sense, data is accessible through the web interface, open data exports, and the Czech linked data infrastructure. The Prismatic Platform wraps these access methods in a unified adapter.

```elixir
defmodule Prismatic.Osint.Isvs do
  @moduledoc """
  Adapter for the Czech Information Systems of Public Administration (ISVS) registry.
  Provides structured access to government information system metadata.
  """

  @base_url "https://www.isvs.cz"

  @spec search(String.t()) :: {:ok, list(map())} | {:error, term()}
  def search(query) do
    with {:ok, response} <- fetch_search_results(query),
         {:ok, systems} <- parse_systems(response) do
      {:ok, systems}
    end
  end

  @spec get_system(String.t()) :: {:ok, map()} | {:error, term()}
  def get_system(isvs_id) do
    with {:ok, response} <- fetch_system_detail(isvs_id),
         {:ok, detail} <- parse_system_detail(response) do
      {:ok, detail}
    end
  end

  @spec by_operator(String.t()) :: {:ok, list(map())} | {:error, term()}
  def by_operator(ico) do
    with {:ok, response} <- fetch_by_operator(ico),
         {:ok, systems} <- parse_systems(response) do
      {:ok, systems}
    end
  end

  @spec by_data_category(atom()) :: {:ok, list(map())} | {:error, term()}
  def by_data_category(category) do
    with {:ok, response} <- fetch_by_category(category),
         {:ok, systems} <- parse_systems(response) do
      {:ok, systems}
    end
  end

  @spec integration_map(String.t()) :: {:ok, list(map())} | {:error, term()}
  def integration_map(isvs_id) do
    with {:ok, system} <- get_system(isvs_id),
         integration_points <- Map.get(system, :integration_points, []) do
      connected = Enum.map(integration_points, fn point_id ->
        {:ok, connected_system} = get_system(point_id)
        connected_system
      end)
      {:ok, connected}
    end
  end
end
```

### Usage Examples

```elixir
# Search information systems by name or keyword
{:ok, systems} = Isvs.search("evidence obyvatel")
# => [
#   %{
#     id: "ISVS-001234",
#     name: "Register of Inhabitants (ROB)",
#     operator: %{name: "Ministry of Interior", ico: "00007064"},
#     purpose: "Basic register of inhabitants",
#     data_categories: [:personal_data, :addresses, :citizenship],
#     legal_basis: "Act 111/2009 Coll.",
#     classification: :critical_infrastructure,
#     public_access: :restricted
#   }
# ]

# Search by operating authority ICO
{:ok, systems} = Isvs.by_operator("00007064")

# Get full system details including integration points
{:ok, detail} = Isvs.get_system("ISVS-001234")

# List all systems processing specific data category
{:ok, systems} = Isvs.by_data_category(:personal_data)

# Get integration map showing connected systems
{:ok, integrations} = Isvs.integration_map("ISVS-001234")
```

## Use Cases

### Government Infrastructure Mapping

ISVS enables comprehensive mapping of Czech government digital infrastructure. Analysts can catalogue all registered information systems, identify data sources for specific investigation domains, map system interconnections and data flows between government bodies, and assess critical information infrastructure for NIS2 compliance. This capability is particularly valuable for understanding which government data stores exist and how they relate to each other -- a prerequisite for effective multi-source intelligence gathering across Czech public registers.

### Data Source Discovery for Investigations

When conducting investigations involving Czech entities, ISVS serves as the master index for identifying which government systems hold specific data types. Investigators can determine the legal basis for data access, distinguish between public and restricted systems, and plan data acquisition strategies. For example, an investigator seeking property ownership data would discover through ISVS that the Cadastral Information System (operated by CUZK) holds this data under Act 256/2013 Coll. with public access through the [Nahlizeni do KN](/osint/nahlizeni-kn/) interface.

### NIS2 Critical Infrastructure Assessment

For organizations conducting NIS2 supply chain due diligence on Czech public sector partners, ISVS reveals which information systems are classified as critical infrastructure. This classification maps directly to NIS2 essential services requirements and enables risk assessment of government digital dependencies.

### Digital Maturity and Modernization Analysis

ISVS data supports analysis of government digitalization levels by tracking system registration trends, technology evolution, and decommissioning patterns. This intelligence is valuable for IT vendors targeting public sector modernization contracts and for policy analysts assessing e-government progress.

## Data Quality and Reliability

ISVS data quality is enforced through the legal mandate of Act 365/2000 Coll. Operators are legally obligated to register their systems and maintain current metadata. However, several quality considerations apply:

| Quality Factor | Assessment | Impact |
|---------------|------------|--------|
| **Completeness** | High -- legal mandate ensures registration | Minor gaps possible for newer or smaller systems |
| **Accuracy** | Medium-High -- self-reported by operators | Metadata may lag behind actual system changes |
| **Timeliness** | Medium -- updates depend on operator submissions | Critical systems updated promptly; others may lag |
| **Standardization** | Medium -- structured fields but variable detail | Description quality varies by operator diligence |
| **Provenance** | High -- direct from operating authorities | Authoritative source with legal backing |

### Czech Legal Context

ISVS operates within a well-defined legal framework:

- **Act No. 365/2000 Coll.** (Zakon o informacnich systemech verejne spravy) -- primary legal basis establishing the registry and registration obligations
- **Act No. 111/2009 Coll.** (Zakon o zakladnich registrech) -- governs the Basic Register system referenced within ISVS
- **Act No. 12/2020 Coll.** (Zakon o pravu na digitalni sluzby) -- Right to Digital Services Act extending the digital government framework
- **EU Regulation 910/2014 (eIDAS)** -- European electronic identification framework influencing ISVS interoperability requirements
- **NIS2 Directive (EU 2022/2555)** -- Network and Information Security directive referencing national critical infrastructure registries

## Platform Integration

The Prismatic Platform integrates ISVS as part of the Czech government infrastructure intelligence layer, enabling automated mapping of public administration IT systems and their data holdings.

```elixir
defmodule PrismaticPerimeter.NIS2.GovernmentInfrastructure do
  @moduledoc """
  Maps government information infrastructure for NIS2 assessment
  using ISVS registry data combined with ARES operator details.
  """

  @spec map_critical_systems() :: {:ok, map()} | {:error, term()}
  def map_critical_systems do
    with {:ok, all_systems} <- Isvs.search(classification: :critical_infrastructure) do
      systems = Enum.map(all_systems, fn sys ->
        {:ok, operator} = Ares.get_by_ico(sys.operator.ico)
        {:ok, integrations} = Isvs.integration_map(sys.id)

        %{
          system: sys,
          operator_details: operator,
          integration_count: length(integrations),
          data_sensitivity: classify_data_sensitivity(sys.data_categories),
          risk_assessment: assess_system_risk(sys, integrations)
        }
      end)

      {:ok, %{
        total_critical: length(systems),
        by_operator: group_by_operator(systems),
        integration_density: calculate_integration_density(systems),
        highest_risk: Enum.take(sort_by_risk(systems), 10)
      }}
    end
  end

  defp classify_data_sensitivity(categories) do
    cond do
      :health in categories or :biometric in categories -> :critical
      :personal_data in categories or :financial in categories -> :high
      :addresses in categories -> :medium
      true -> :low
    end
  end
end
```

### Adapter Configuration

```elixir
# config/config.exs
config :prismatic_osint, Prismatic.Osint.Isvs,
  base_url: "https://www.isvs.cz",
  open_data_url: "https://data.gov.cz",
  cache_ttl: :timer.hours(24),
  request_timeout: 15_000
```

## NABLA Compliance

ISVS integration within the Prismatic Platform adheres to the NABLA epistemic framework:

| Axiom | Implementation |
|-------|---------------|
| **Signal Plurality** | ISVS data cross-referenced with ARES operator records and open data portal exports |
| **Contradiction Preservation** | Discrepancies between ISVS metadata and actual system capabilities are preserved and flagged |
| **Provenance Mandatory** | All ISVS-sourced data carries provenance metadata including registry ID and extraction timestamp |
| **Time Decay** | System registration and last-update timestamps enable temporal confidence assessment |
| **Source Independence** | ISVS data is independently sourced from operator registrations, separate from ARES aggregation |

## Performance Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| **Data Extraction Time** | < 2s per system detail | Web scraping with caching |
| **Bulk Export Processing** | < 30s for full registry | Open data portal CSV/XML |
| **Cache TTL** | 24 hours | Government data changes infrequently |
| **Coverage** | ~100% of registered systems | Mandated by law |
| **Update Latency** | Days to weeks | Depends on operator submission timing |

## Related Resources

- [ARES](/osint/ares/) -- Czech business registry, one of the key systems registered in ISVS
- [Datove Schranky](/osint/datove-schranky/) -- Government data box communication infrastructure
- [CUZK](/osint/cuzk/) -- Land registry information system, major ISVS component
- [Hlidac Statu](/osint/hlidac-statu/) -- Watchdog analytics including IT procurement contracts
- [Verejne Zakazky](/osint/verejne-zakazky/) -- Public procurement portal for government IT systems
- [Nahlizeni do KN](/osint/nahlizeni-kn/) -- Public interface to the cadastral information system
- [Justice.cz](/osint/justice-cz/) -- Commercial register system within the ISVS catalogue

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)