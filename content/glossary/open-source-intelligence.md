+++
title = "Open Source Intelligence"
weight = 50
[extra]
tags = ["glossary", "community", "osint", "intelligence", "security", "reconnaissance", "adapters", "elixir", "data-collection", "threat-intelligence", "prismatic-platform", "due-diligence"]
description = "Comprehensive guide to Open Source Intelligence (OSINT) covering the intelligence cycle, collection disciplines, 120+ Prismatic OSINT adapters, ethical frameworks, and practical implementation of intelligence gathering in Elixir/OTP systems"
category = "community"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "20 min"
difficulty = "advanced"
quality_score = 95
related_terms = ["osint", "intelligence", "intelligence-analysis", "intelligence-fusion", "intelligence-platform", "intelligence-tools", "cyber-threat-intelligence", "threat-intelligence", "attack-surface", "beneficial-ownership", "aml", "audit-trail", "assessment", "analytics"]
learning_outcomes = ["Define OSINT and distinguish it from other intelligence disciplines", "Describe the intelligence cycle and its application to OSINT operations", "Understand the architecture of Prismatic's 120+ OSINT adapters across 7 categories", "Implement OSINT data collection pipelines in Elixir using GenServer and supervision trees", "Apply ethical and legal frameworks to OSINT collection activities", "Design adapter patterns for integrating heterogeneous data sources"]
prerequisites = ["intelligence", "adapter-pattern", "elixir", "genserver"]
use_cases = ["Corporate due diligence investigations", "Threat intelligence gathering", "Beneficial ownership verification", "Attack surface discovery", "Compliance monitoring", "AML/KYC verification"]
key_technologies = ["Elixir", "OTP", "GenServer", "HTTP clients", "JSON parsing", "Rate limiting", "Circuit breakers"]
complexity = "advanced"
see_also = ["osint", "intelligence-analysis", "cyber-threat-intelligence", "attack-surface", "beneficial-ownership"]
date_created = "2026-02-22"
date_updated = "2026-02-22"
version = "2.0.0"
word_count = 3000
date_modified = "2026-02-23"
keywords = ["Open", "Source", "Intelligence", "Comprehensive", "OSINT", "Prismatic", "glossary", "community", "Prismatic Platform", "The Prismatic"]
image = "/images/sections/glossary.png"
image_alt = "Open Source Intelligence - Prismatic Platform"
+++

## Definition

Open Source Intelligence (OSINT) is the practice of collecting, processing, and analyzing information from publicly available sources to produce actionable intelligence. Unlike classified intelligence disciplines (HUMINT, SIGINT, IMINT), OSINT draws exclusively from sources that any person could legally access: public records, commercial databases, social media, academic publications, government filings, domain registration records, certificate transparency logs, and network scan data. The term originated in military intelligence communities but has expanded to encompass corporate due diligence, cybersecurity threat intelligence, investigative journalism, and compliance verification.

The defining characteristic of OSINT is not the type of information collected but the legality and accessibility of its sources. A company's annual report is OSINT. Its leaked internal emails are not -- even though both might contain useful intelligence. This distinction is critical for operational and legal compliance, particularly under European frameworks like GDPR where the method of collection matters as much as the information itself.

In the context of software engineering, OSINT has evolved from a manual research activity into a highly automated discipline. Modern OSINT platforms like the Prismatic Platform integrate dozens of data sources through programmatic APIs, applying the same software engineering principles -- abstraction, composability, fault tolerance -- to intelligence collection that are applied to any other data processing pipeline.

## The Intelligence Cycle

OSINT operations follow the intelligence cycle, a structured methodology that transforms raw information into actionable intelligence through iterative refinement.

### Planning and Direction

Every OSINT operation begins with a clearly defined intelligence requirement. "Tell me everything about Company X" is not an intelligence requirement. "Identify the beneficial owners of Company X, their other corporate affiliations, and any regulatory actions against those affiliates" is. The specificity of the requirement determines which sources to query, which adapters to invoke, and what constitutes a complete answer.

In the Prismatic Platform, intelligence requirements are encoded as structured query objects that specify the target entity, the information categories of interest, the acceptable source categories, and the confidence thresholds for inclusion in the final product.

### Collection

Collection is the acquisition of raw data from designated sources. In automated OSINT systems, this involves invoking APIs, scraping structured data, parsing document formats, and handling the inevitable failures -- rate limits, timeouts, format changes, and authentication requirements -- that characterize real-world data sources.

The collection phase must balance completeness against timeliness. Querying every possible source for every investigation is impractical; intelligent source selection based on the target entity's jurisdiction, industry, and the specific intelligence requirement ensures efficient collection.

### Processing

Raw collected data requires normalization before it can be analyzed. A company name might appear as "Prismatic s.r.o.", "PRISMATIC S.R.O.", "Prismatic, s.r.o.", or "Prismatic sro" across different registries. Processing standardizes entity names, resolves identifiers, deduplicates records, and structures unstructured data into a common schema.

### Analysis

Analysis transforms processed information into intelligence by applying reasoning, cross-referencing, and contextual interpretation. A company appearing in three different registries is information. The fact that its registered address changed three times in six months, each time to a jurisdiction with weaker beneficial ownership disclosure requirements, is intelligence.

### Dissemination

The final product must be delivered in a format appropriate for its consumer. A compliance officer needs a structured report with citations. A security analyst needs machine-readable indicators. A researcher needs a knowledge graph with provenance chains. The Prismatic Platform supports multiple output formats through its reporting infrastructure.

## OSINT Collection Disciplines

OSINT encompasses several sub-disciplines, each focused on a specific category of publicly available information.

**WEBINT** (Web Intelligence) covers information available on the public internet: websites, forums, paste sites, code repositories, and cached/archived content. Search engine dorking (using advanced search operators) and web archival services like the Wayback Machine are primary WEBINT techniques.

**SOCMINT** (Social Media Intelligence) focuses on social media platforms. Profile analysis, network mapping, geolocation from posted images, and sentiment analysis fall under SOCMINT. This discipline raises the most significant ethical concerns due to the personal nature of social media data.

**GEOINT** (Geospatial Intelligence) in the OSINT context uses publicly available satellite imagery, mapping services, and geotagged data to derive location-based intelligence. Services like Google Earth, OpenStreetMap, and commercial satellite providers make GEOINT accessible to non-state actors.

**TECHINT** (Technical Intelligence) encompasses network scanning (Shodan, Censys), certificate transparency logs, DNS records, BGP routing data, and other technical infrastructure information. This discipline is central to attack surface discovery and cybersecurity OSINT.

**FININT** (Financial Intelligence) covers public financial records: company filings, stock exchange disclosures, sanctions lists, regulatory actions, and beneficial ownership registries. FININT is the backbone of due diligence and AML/KYC compliance.

## Platform Context: Prismatic OSINT Architecture

The Prismatic Platform implements OSINT collection through a unified adapter architecture that abstracts the heterogeneity of 120+ data sources behind a consistent interface. Each adapter encapsulates the complexity of a single data source -- its authentication mechanism, API format, rate limits, and data schema -- while presenting a standardized `search/2` or `run/2` interface to consuming applications.

### Adapter Categories

The platform organizes adapters into seven categories reflecting jurisdictional and functional boundaries:

| Category | Adapter Count | Key Sources | Interface |
|----------|--------------|-------------|-----------|
| **Czech** | 28 | ARES, Justice, ISIR, Commercial Register, Trade Register | `search/2` |
| **Global** | 84 | Shodan, VirusTotal, Censys, Hunter.io, Have I Been Pwned | `run/2` |
| **Sanctions** | 3 | EU Sanctions, OFAC SDN, UN Sanctions | `search/2` |
| **EU** | 1 | European Business Register | `search/2` |
| **UK** | 1 | Companies House | `search/2` |
| **US** | 1 | SEC EDGAR | `search/2` |
| **Universal** | 2 | EmailIntelligence, EmailIntelligenceRateLimited | `search/2` |

### Adapter Architecture

```elixir
defmodule Prismatic.OSINT.Adapter do
  @moduledoc """
  Behaviour definition for OSINT data source adapters.

  Every adapter in the Prismatic OSINT ecosystem implements this
  behaviour, ensuring consistent interfaces regardless of the
  underlying data source's API design, authentication mechanism,
  or data format.

  ## Implementation Requirements

  Adapters MUST:
  - Handle rate limiting gracefully (exponential backoff)
  - Return structured results with source attribution
  - Include confidence scores for extracted entities
  - Respect the adapter's configured timeout
  - Log all API interactions for audit trail compliance

  ## Example

      defmodule Prismatic.OSINT.Czech.ARES do
        @behaviour Prismatic.OSINT.Adapter

        @impl true
        def search(query, opts) do
          # Query the Czech ARES business registry
          # Returns {:ok, [%Result{}]} or {:error, reason}
        end

        @impl true
        def source_metadata do
          %{
            name: "ARES",
            jurisdiction: :czech_republic,
            category: :business_registry,
            reliability: :high,
            update_frequency: :daily
          }
        end
      end
  """

  @type query :: String.t() | map()
  @type opts :: keyword()
  @type result :: %{
          source: String.t(),
          data: map(),
          confidence: float(),
          collected_at: DateTime.t(),
          raw_response: map() | nil
        }

  @callback search(query(), opts()) ::
              {:ok, [result()]} | {:error, term()}

  @callback source_metadata() :: %{
              name: String.t(),
              jurisdiction: atom(),
              category: atom(),
              reliability: atom(),
              update_frequency: atom()
            }

  @optional_callbacks [source_metadata: 0]
end
```

### Collection Pipeline

The OSINT collection pipeline orchestrates multiple adapters in parallel, managing rate limits, circuit breakers, and result aggregation through OTP supervision patterns.

```elixir
defmodule Prismatic.OSINT.CollectionPipeline do
  @moduledoc """
  Orchestrates parallel OSINT collection across multiple adapters.

  Given an intelligence requirement (target entity + information
  categories), the pipeline selects appropriate adapters, executes
  them in parallel within rate limit constraints, and aggregates
  results into a unified intelligence product.

  Uses Task.Supervisor for parallel execution with configurable
  timeouts per adapter category. Circuit breakers prevent cascade
  failures when individual data sources experience outages.
  """

  alias Prismatic.OSINT.{AdapterRegistry, ResultAggregator}

  @spec collect(target :: map(), requirements :: keyword()) ::
          {:ok, map()} | {:error, term()}
  def collect(target, requirements \\ []) do
    adapters = AdapterRegistry.select_adapters(target, requirements)
    timeout = Keyword.get(requirements, :timeout, :timer.seconds(30))

    results =
      adapters
      |> Enum.map(fn adapter ->
        Task.Supervisor.async_nolink(
          Prismatic.OSINT.TaskSupervisor,
          fn ->
            case adapter.search(target.query, target.opts) do
              {:ok, data} -> {:ok, adapter, data}
              {:error, reason} -> {:error, adapter, reason}
            end
          end
        )
      end)
      |> Task.yield_many(timeout)
      |> Enum.map(fn
        {_task, {:ok, result}} -> result
        {task, nil} -> Task.shutdown(task, :brutal_kill); {:timeout, nil, :timeout}
        {_task, {:exit, reason}} -> {:error, nil, reason}
      end)

    successful = Enum.filter(results, &match?({:ok, _, _}, &1))
    failed = Enum.reject(results, &match?({:ok, _, _}, &1))

    aggregated = ResultAggregator.merge(successful)

    {:ok, %{
      results: aggregated,
      sources_queried: length(adapters),
      sources_successful: length(successful),
      sources_failed: length(failed),
      collection_timestamp: DateTime.utc_now()
    }}
  end
end
```

## Czech Registry Adapters

The Prismatic Platform has particularly deep coverage of Czech public registries, reflecting its origin in the Czech Republic. The 28 Czech adapters cover the complete landscape of publicly mandated corporate transparency.

**ARES** (Access to Registers of Economic Subjects) is the Czech Ministry of Finance's unified interface to business registration data. The Prismatic ARES adapter queries company details by ICO (identification number), name, or address, returning registered name, legal form, registered address, NACE classification codes, and links to subsidiary registers.

**Justice.cz** provides access to the Commercial Register (Obchodni rejstrik) and the Insolvency Register (ISIR). The Commercial Register adapter extracts corporate structure data including board members, shareholders, registered capital, and historical changes. The ISIR adapter monitors insolvency proceedings, providing early warning of financial distress for due diligence investigations.

**Trade Register** (Zivnostensky rejstrik) adapters query the database of sole traders and trade licenses, complementing the Commercial Register's coverage of corporate entities.

## Global OSINT Adapters

The 84 global adapters span cybersecurity, corporate intelligence, and technical infrastructure domains.

**Cybersecurity adapters** include Shodan (internet-connected device search), Censys (certificate and host scanning), VirusTotal (malware and URL analysis), and Have I Been Pwned (credential breach monitoring). These adapters form the technical intelligence layer of the Prismatic Perimeter EASM capability.

**Corporate intelligence adapters** cover OpenCorporates (global company data), Orbis (Bureau van Dijk's corporate database), and various national registry APIs. These support [beneficial ownership](@/glossary/beneficial-ownership.md) verification and corporate structure mapping.

**Infrastructure adapters** query DNS records, WHOIS databases, certificate transparency logs, and BGP routing tables. Combined with the cybersecurity adapters, they provide comprehensive [attack surface](@/glossary/attack-surface.md) discovery.

## Ethical and Legal Framework

OSINT collection operates within a complex legal landscape that varies by jurisdiction. The Prismatic Platform enforces ethical collection practices through technical controls.

**GDPR compliance** requires that personal data collection has a lawful basis. For OSINT, this is typically legitimate interest (Article 6(1)(f)), but the platform implements data minimization -- collecting only what is necessary for the stated intelligence requirement -- and provides audit trails that demonstrate proportionality.

**Rate limiting and access controls** respect the terms of service of data sources. Aggressive scraping that bypasses rate limits or accesses non-public API endpoints is both unethical and potentially illegal under computer fraud statutes.

**Source attribution** is mandatory in all intelligence products. Every data point must be traceable to its source, enabling verification and supporting the [audit trail](@/glossary/audit-trail.md) requirements of regulated industries.

**Proportionality** ensures that collection activities are proportionate to the intelligence requirement. A routine vendor assessment does not justify the same depth of investigation as a fraud investigation.

## Intelligence Fusion and Analysis

Raw OSINT data becomes intelligence through fusion -- the combination of data from multiple sources to produce insights that no single source could provide. The Prismatic Platform's [intelligence fusion](@/glossary/intelligence-fusion.md) capability cross-references entities across all adapter results, building a knowledge graph that reveals relationships invisible in individual data sources.

Entity resolution -- determining that "John Smith, Director at Acme Ltd" in one registry is the same person as "J. Smith, Board Member at Acme Holdings" in another -- is the core challenge of intelligence fusion. The platform uses a combination of deterministic matching (exact identifier matches on tax IDs, registration numbers) and probabilistic matching (name similarity, address proximity, temporal co-occurrence) to resolve entities across sources.

## OSINT in the Prismatic Perimeter

The Prismatic Perimeter EASM capability is the primary consumer of OSINT intelligence within the platform. Attack surface discovery begins with OSINT collection -- querying DNS records, certificate transparency logs, and internet scanning databases to enumerate the publicly visible assets of a target organization.

The Perimeter's security rating system (A-F grades, 300-900 numeric scores) incorporates OSINT findings as evidence for or against security posture. Exposed credentials in breach databases, misconfigured DNS records, expired certificates, and unpatched services all contribute to the security score, with each finding traceable to its OSINT source.

## Operational Security for OSINT Practitioners

OSINT collection is not a one-way activity. The act of querying data sources can itself reveal information about the investigator -- their IP address, query patterns, and areas of interest. The Prismatic Platform mitigates this through several operational security measures: rotating proxy infrastructure for sensitive queries, query pattern randomization to prevent fingerprinting, and strict separation between collection infrastructure and analysis environments.

## Quality Assurance in OSINT

Intelligence quality depends on source reliability and information accuracy. The Prismatic Platform implements a source reliability assessment framework modeled on the NATO Admiralty System, rating each source on a scale from A (completely reliable) to F (reliability cannot be judged) and each piece of information from 1 (confirmed by other sources) to 6 (truth cannot be judged).

Automated quality checks validate returned data against expected schemas, flag stale information based on last-updated timestamps, and cross-reference critical findings against multiple sources before including them in intelligence products.

## Future Directions

The OSINT landscape is evolving rapidly. Large language models are being applied to unstructured OSINT sources -- extracting entities from news articles, classifying sentiment in social media posts, and summarizing lengthy corporate filings. The Prismatic Platform's integration with local AI models through Ollama provides a foundation for on-premises AI-enhanced OSINT processing that maintains data sovereignty.

Graph-based analysis, powered by the platform's [KuzuDB](@/glossary/kuzudb.md) integration, enables relationship-centric intelligence queries that traditional relational databases cannot efficiently support. Questions like "find all companies within two ownership hops of sanctioned entities" become native graph traversals rather than complex SQL joins.

## Cross-References

- [OSINT](@/glossary/osint.md) -- Abbreviated form and quick reference
- [Intelligence Analysis](@/glossary/intelligence-analysis.md) -- Analytical methods applied to OSINT data
- [Intelligence Fusion](@/glossary/intelligence-fusion.md) -- Combining multi-source intelligence
- [Cyber Threat Intelligence](@/glossary/cyber-threat-intelligence.md) -- OSINT applied to cybersecurity
- [Threat Intelligence](@/glossary/threat-intelligence.md) -- Broader threat intelligence context
- [Attack Surface](@/glossary/attack-surface.md) -- OSINT-driven attack surface discovery
- [Beneficial Ownership](@/glossary/beneficial-ownership.md) -- Corporate ownership transparency
- [AML](@/glossary/aml.md) -- Anti-money laundering compliance using OSINT
- [Audit Trail](@/glossary/audit-trail.md) -- Collection provenance tracking
- [Adapter Pattern](@/glossary/adapter-pattern.md) -- Design pattern for OSINT adapters
- [Intelligence Platform](@/glossary/intelligence-platform.md) -- Platform architecture for intelligence
- [KuzuDB](@/glossary/kuzudb.md) -- Graph database for relationship analysis

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
