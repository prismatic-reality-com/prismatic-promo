+++
title = "Intelligence Platform"
weight = 50
[extra]
description = "A comprehensive software system designed to collect, process, analyze, and disseminate intelligence from multiple sources, integrating OSINT, threat intelligence, and compliance automation into a unified operational environment."
category = "intelligence"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "intelligence-operations"
related_concepts = ["intelligence cycle", "multi-source fusion", "OSINT architecture", "threat intelligence platform", "compliance automation", "entity resolution", "attack surface management"]
implementation_status = "production"
authority_level = "domain-expert"
difficulty_rating = 8
prerequisites = ["osint", "intelligence-analysis", "entity-resolution"]
learning_path = ["osint", "intelligence-analysis", "intelligence-fusion", "intelligence-platform", "easm"]
interactive_demos = ["/labs/glossary/intelligence-platform"]
code_examples = ["Elixir OTP intelligence platform architecture", "Multi-adapter collection framework", "Assessment dissemination pipeline"]
external_resources = ["https://www.mitre.org/sites/default/files/publications/pr-13-1028-mitre-10-strategies-cyber-ops-center.pdf", "https://www.recordedfuture.com/threat-intelligence-platforms", "https://www.gartner.com/reviews/market/security-threat-intelligence-products-and-services"]
version_introduced = "0.10.0"
stability_level = "stable"
testing_scenarios = ["end-to-end collection pipeline", "multi-source fusion accuracy", "assessment latency under load", "fault tolerance during source failures"]
keywords = ["intelligence platform definition", "threat intelligence platform", "OSINT platform architecture", "intelligence collection system", "multi-source intelligence fusion", "security intelligence platform", "compliance intelligence automation", "intelligence dissemination framework"]
tags = ["intelligence", "osint", "platform", "security", "architecture", "compliance"]
related_terms = ["osint", "intelligence-fusion", "intelligence-analysis", "easm", "hawkeye", "prismatic-perimeter", "entity-resolution", "risk-score", "cyber-threat-intelligence", "knowledge-graph"]
word_count = 1303
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Intelligence Platform - Prismatic Platform"
+++

## Definition

An Intelligence Platform is a comprehensive software system that orchestrates the entire intelligence lifecycle -- collection, processing, analysis, and dissemination -- across multiple data sources, analytic methods, and consumer channels. Unlike point solutions that address a single intelligence function (such as a threat feed aggregator or a WHOIS lookup tool), an intelligence platform provides an integrated operational environment where data flows seamlessly from raw collection through enrichment, correlation, and analysis to produce actionable intelligence products.

The defining characteristics of an intelligence platform are: multi-source ingestion (the ability to collect from diverse source types through a unified adapter framework), data normalization (converting heterogeneous source data into a common entity model), automated enrichment (augmenting collected data with contextual information), analytic processing (applying structured analytic techniques to produce assessments), and controlled dissemination (delivering intelligence products to authorized consumers in appropriate formats).

## Overview

Intelligence platforms have evolved from classified government systems (like CIA's Intellipedia or NSA's XKeyscore) into commercially available products serving corporate security, compliance, and risk management functions. The market segments into several categories:

### Platform Categories

| Category | Focus | Examples | Typical Users |
|----------|-------|----------|---------------|
| **Threat Intelligence Platforms (TIP)** | Cyber threat indicator management | MISP, OpenCTI, Anomali | SOC analysts, threat hunters |
| **Security Intelligence Platforms** | Broad security monitoring | Splunk, IBM QRadar, Elastic | Security operations teams |
| **OSINT Platforms** | Open source intelligence collection | Maltego, SpiderFoot, Prismatic | Intelligence analysts, investigators |
| **Risk Intelligence Platforms** | Business risk assessment | Recorded Future, Flashpoint | Risk managers, compliance teams |
| **Due Diligence Platforms** | Entity investigation | Refinitiv, LexisNexis, Prismatic | Compliance officers, legal teams |
| **EASM Platforms** | External attack surface discovery | BitSight, SecurityScorecard, Prismatic | CISOs, security architects |

The Prismatic Platform spans multiple categories -- it is simultaneously an OSINT platform, a due diligence platform, and an EASM platform, unified by a common entity model and analytic framework.

### Architecture Principles

Modern intelligence platforms share several architectural principles:

1. **Adapter-Based Collection**: Source-specific adapters behind a common interface enable adding new sources without modifying the core platform
2. **Event-Driven Processing**: Asynchronous event streams decouple collection from processing and analysis
3. **Entity-Centric Data Model**: All data is organized around entities (persons, organizations, domains, IPs) rather than source-specific records
4. **Graph-Based Relationships**: Entity relationships are modeled as graphs, enabling link analysis and path discovery
5. **Confidence-Calibrated Output**: All intelligence products carry confidence ratings and source provenance

## Technical Details

### Intelligence Platform Architecture Layers

A production intelligence platform comprises several architectural layers:

```
┌─────────────────────────────────────────────────────────────┐
│                    Dissemination Layer                       │
│  (LiveView dashboards, API endpoints, reports, alerts)      │
├─────────────────────────────────────────────────────────────┤
│                    Analysis Layer                            │
│  (ACH engine, risk scoring, threat assessment, SATs)        │
├─────────────────────────────────────────────────────────────┤
│                    Correlation Layer                         │
│  (Entity resolution, link analysis, graph traversal)        │
├─────────────────────────────────────────────────────────────┤
│                    Processing Layer                          │
│  (Normalization, enrichment, deduplication, classification) │
├─────────────────────────────────────────────────────────────┤
│                    Collection Layer                          │
│  (120+ OSINT adapters, API integrations, web crawlers)      │
├─────────────────────────────────────────────────────────────┤
│                    Infrastructure Layer                      │
│  (PostgreSQL, ETS, KuzuDB, Meilisearch, OTP supervision)   │
└─────────────────────────────────────────────────────────────┘
```

### Multi-Source Collection Framework

The collection layer must handle heterogeneous sources with varying reliability, latency, rate limits, and data formats:

```elixir
defmodule PrismaticIntelligence.CollectionFramework do
  @moduledoc """
  Multi-source intelligence collection framework with adapter-based
  backend selection, rate limiting, circuit breaking, and automatic
  retry with exponential backoff.

  Each source adapter implements the `SourceAdapter` behaviour,
  providing a uniform interface across 120+ OSINT sources.
  """

  @type source_config :: %{
    adapter: module(),
    priority: :critical | :high | :normal | :low,
    rate_limit: pos_integer(),
    timeout_ms: pos_integer(),
    retry_count: non_neg_integer(),
    circuit_breaker: %{
      threshold: pos_integer(),
      reset_interval_ms: pos_integer()
    }
  }

  @type collection_task :: %{
    id: String.t(),
    target: String.t(),
    sources: list(atom()),
    started_at: DateTime.t(),
    status: :pending | :collecting | :complete | :failed
  }

  @callback collect(target :: String.t(), opts :: keyword()) ::
              {:ok, list(map())} | {:error, term()}

  @callback source_reliability() :: float()

  @callback source_category() :: atom()

  @spec collect_all(String.t(), list(source_config()), keyword()) ::
          {:ok, list(map())} | {:error, term()}
  def collect_all(target, source_configs, opts \\ []) do
    max_concurrency = Keyword.get(opts, :max_concurrency, 20)
    timeout = Keyword.get(opts, :timeout, 30_000)

    results =
      source_configs
      |> Enum.sort_by(& &1.priority, :asc)
      |> Task.async_stream(
        fn config -> collect_from_source(config, target) end,
        max_concurrency: max_concurrency,
        timeout: timeout,
        on_timeout: :kill_task
      )
      |> Enum.reduce({[], []}, fn
        {:ok, {:ok, data}}, {successes, failures} ->
          {[data | successes], failures}

        {:ok, {:error, reason}}, {successes, failures} ->
          {successes, [reason | failures]}

        {:exit, reason}, {successes, failures} ->
          {successes, [{:timeout, reason} | failures]}
      end)

    case results do
      {successes, _failures} when length(successes) > 0 ->
        {:ok, List.flatten(successes)}

      {[], failures} ->
        {:error, {:all_sources_failed, failures}}
    end
  end

  defp collect_from_source(config, target) do
    case check_circuit_breaker(config.adapter) do
      :open ->
        {:error, {:circuit_open, config.adapter}}

      :closed ->
        with_retry(config.retry_count, fn ->
          config.adapter.collect(target, timeout: config.timeout_ms)
        end)
    end
  end

  defp with_retry(0, fun), do: fun.()

  defp with_retry(retries, fun) do
    case fun.() do
      {:ok, result} ->
        {:ok, result}

      {:error, _reason} when retries > 0 ->
        backoff = trunc(:math.pow(2, 3 - retries) * 1_000)
        Process.sleep(backoff)
        with_retry(retries - 1, fun)

      error ->
        error
    end
  end

  defp check_circuit_breaker(adapter) do
    case :ets.lookup(:circuit_breakers, adapter) do
      [{^adapter, :open, reset_at}] ->
        if DateTime.compare(DateTime.utc_now(), reset_at) == :gt, do: :closed, else: :open

      _ ->
        :closed
    end
  end
end
```

### Entity Resolution and Graph Model

The correlation layer uses [entity resolution](@/glossary/entity-resolution.md) to unify records from different sources into a coherent entity graph:

```elixir
defmodule PrismaticIntelligence.EntityGraph do
  @moduledoc """
  Entity-centric graph model for intelligence platform data.
  All collected data is organized around entities (persons,
  organizations, domains, IPs) with typed relationships.
  Backed by KuzuDB for graph queries and PostgreSQL for persistence.
  """

  @type entity_type :: :person | :organization | :domain | :ip_address |
                       :email | :certificate | :service | :document

  @type relationship_type :: :owns | :operates | :associated_with |
                             :subsidiary_of | :registered_by | :hosted_on |
                             :signed_by | :employed_at | :beneficial_owner_of

  @type entity :: %{
    id: String.t(),
    type: entity_type(),
    canonical_name: String.t(),
    aliases: list(String.t()),
    attributes: map(),
    confidence: float(),
    sources: list(atom()),
    first_seen: DateTime.t(),
    last_seen: DateTime.t()
  }

  @type relationship :: %{
    source_id: String.t(),
    target_id: String.t(),
    type: relationship_type(),
    confidence: float(),
    evidence: list(map()),
    discovered_at: DateTime.t()
  }

  @spec add_entity(entity()) :: {:ok, entity()} | {:error, term()}
  def add_entity(entity) do
    case resolve_existing(entity) do
      {:ok, existing} -> merge_entities(existing, entity)
      {:error, :not_found} -> insert_entity(entity)
    end
  end

  @spec add_relationship(relationship()) :: {:ok, relationship()} | {:error, term()}
  def add_relationship(relationship) do
    with :ok <- validate_endpoints(relationship),
         :ok <- check_duplicate(relationship) do
      insert_relationship(relationship)
    end
  end

  @spec find_paths(String.t(), String.t(), keyword()) :: {:ok, list(list(entity()))}
  def find_paths(source_id, target_id, opts \\ []) do
    max_depth = Keyword.get(opts, :max_depth, 5)
    min_confidence = Keyword.get(opts, :min_confidence, 0.5)

    query = """
    MATCH path = (source:Entity {id: $source})-[*1..#{max_depth}]-(target:Entity {id: $target})
    WHERE ALL(r IN relationships(path) WHERE r.confidence >= $min_confidence)
    RETURN path
    ORDER BY length(path)
    LIMIT 10
    """

    PrismaticStorageKuzu.query(query, %{
      source: source_id,
      target: target_id,
      min_confidence: min_confidence
    })
  end

  @spec neighborhood(String.t(), keyword()) :: {:ok, list(entity())}
  def neighborhood(entity_id, opts \\ []) do
    depth = Keyword.get(opts, :depth, 2)

    query = """
    MATCH (center:Entity {id: $id})-[r*1..#{depth}]-(neighbor:Entity)
    RETURN DISTINCT neighbor, r
    ORDER BY neighbor.last_seen DESC
    """

    PrismaticStorageKuzu.query(query, %{id: entity_id})
  end

  defp resolve_existing(entity) do
    # Entity resolution using canonical name, aliases, and attribute matching
    PrismaticIntelligence.EntityResolution.resolve(entity)
  end

  defp merge_entities(existing, new_data) do
    merged = %{
      existing
      | aliases: Enum.uniq(existing.aliases ++ new_data.aliases),
        attributes: Map.merge(existing.attributes, new_data.attributes),
        confidence: max(existing.confidence, new_data.confidence),
        sources: Enum.uniq(existing.sources ++ new_data.sources),
        last_seen: DateTime.utc_now()
    }

    {:ok, merged}
  end

  defp insert_entity(entity), do: {:ok, entity}
  defp validate_endpoints(_rel), do: :ok
  defp check_duplicate(_rel), do: :ok
  defp insert_relationship(rel), do: {:ok, rel}
end
```

### Assessment Dissemination

Intelligence products must reach the right consumers in the right format at the right time:

```elixir
defmodule PrismaticIntelligence.Dissemination do
  @moduledoc """
  Intelligence assessment dissemination engine.
  Delivers intelligence products to authorized consumers
  via multiple channels: LiveView dashboards, API endpoints,
  email alerts, and structured reports.
  """

  @type channel :: :liveview | :api | :email | :report | :webhook

  @type dissemination_config :: %{
    channels: list(channel()),
    classification: :unclassified | :internal | :confidential | :restricted,
    urgency: :routine | :priority | :immediate | :flash,
    recipients: list(String.t())
  }

  @spec disseminate(map(), dissemination_config()) :: {:ok, map()} | {:error, term()}
  def disseminate(assessment, config) do
    results =
      config.channels
      |> Task.async_stream(fn channel ->
        deliver(channel, assessment, config)
      end)
      |> Enum.map(fn {:ok, result} -> result end)

    {:ok, %{assessment_id: assessment.assessment_id, delivery_results: results}}
  end

  defp deliver(:liveview, assessment, _config) do
    Phoenix.PubSub.broadcast(
      PrismaticWeb.PubSub,
      "intelligence:assessments",
      {:new_assessment, assessment}
    )
  end

  defp deliver(:api, assessment, _config) do
    {:ok, %{channel: :api, status: :available, endpoint: "/api/v1/assessments/#{assessment.assessment_id}"}}
  end

  defp deliver(:webhook, assessment, config) do
    Enum.map(config.recipients, fn url ->
      PrismaticIntelligence.WebhookClient.post(url, assessment)
    end)
  end

  defp deliver(channel, _assessment, _config) do
    {:ok, %{channel: channel, status: :queued}}
  end
end
```

## Implementation in Prismatic Platform

The Prismatic Platform is itself an intelligence platform -- it embodies the architecture described above as a production Elixir/OTP system. Key implementation characteristics:

### Platform Statistics

| Metric | Value |
|--------|-------|
| **OSINT Adapters** | 120+ across 7 categories |
| **Czech Registry Sources** | 28 (ARES, Justice.cz, ISIR, Commercial Register, etc.) |
| **Global OSINT Sources** | 84 (Shodan, VirusTotal, Censys, Hunter.io, etc.) |
| **Sanctions Lists** | 3 (EU Consolidated, OFAC SDN, UN Security Council) |
| **Umbrella Applications** | 115 OTP applications |
| **AIAD Agents** | 530+ autonomous intelligence agents |
| **Entity Types** | Persons, organizations, domains, IPs, certificates, services |

### OTP Supervision Architecture

The intelligence platform runs as a supervision tree where each major subsystem is an independently supervised OTP application:

- **Collection Supervisors**: One per source category, with circuit breakers and rate limiters
- **Processing Workers**: Broadway-style pipeline workers for normalization and enrichment
- **Analysis Engines**: GenServer-based analysis sessions with task supervision
- **Dissemination Channels**: PubSub-based real-time updates to LiveView dashboards

### Integration Points

The platform integrates intelligence capabilities with:

- **[Hawkeye](@/glossary/hawkeye.md)**: Visitor intelligence using OSINT analysis for website visitor profiling
- **[Prismatic Perimeter](@/glossary/prismatic-perimeter.md)**: External attack surface management with security ratings (A-F grades)
- **[EASM](@/glossary/easm.md)**: Continuous external attack surface discovery and monitoring
- **[Due Diligence](@/glossary/due-diligence.md)**: Automated investigative workflows for KYC/AML compliance

## Comparison with Alternatives

| Platform | Architecture | OSINT Sources | Pricing | Key Differentiator |
|----------|-------------|---------------|---------|-------------------|
| **Prismatic** | Elixir/OTP umbrella | 120+ | Open source | Fault-tolerant OTP architecture, Czech registry specialization |
| **Palantir Gotham** | Java distributed | Classified | $millions/yr | Government-scale, classified data handling |
| **Recorded Future** | Cloud SaaS | 1M+ sources | $100K+/yr | Machine learning, real-time threat feeds |
| **Maltego** | Desktop Java | 300+ transforms | $999+/yr | Visual graph analysis, community transforms |
| **SpiderFoot** | Python | 200+ modules | Free/OSS | Easy setup, broad module ecosystem |
| **MISP** | PHP/Python | Community feeds | Free/OSS | Indicator sharing, community standard |
| **OpenCTI** | Node.js/Python | STIX/TAXII feeds | Free/OSS | STIX2 native, knowledge graph |

Prismatic's unique position: an Elixir/OTP intelligence platform combining OSINT collection, [entity resolution](@/glossary/entity-resolution.md), compliance automation, and attack surface management in a single umbrella application with 530+ autonomous agents.

## Best Practices

1. **Design for Source Failure**: Individual sources will fail. The platform must degrade gracefully, producing assessments from available sources rather than failing entirely
2. **Normalize Early**: Convert source-specific data formats to the common entity model as early as possible in the pipeline
3. **Track Provenance**: Every data point must trace back to its source, collection timestamp, and reliability rating
4. **Implement Circuit Breakers**: Protect the platform from cascading failures when external sources become unavailable
5. **Separate Collection from Analysis**: Maintain architectural boundaries between data collection and analytic processing to prevent bias
6. **Version Your Entity Model**: As the platform evolves, the entity schema will change. Use versioned schemas with migration support
7. **Monitor Collection Health**: Track source availability, response times, and data quality metrics continuously
8. **Implement Access Control**: Intelligence products have varying classification levels. Enforce dissemination controls at the platform level

## Common Pitfalls

1. **Monolithic Collection**: Building a single collection module that handles all sources. Use the adapter pattern with a common behaviour
2. **Ignoring Rate Limits**: Overwhelming external APIs leads to IP blocks and degraded service. Implement per-source rate limiting
3. **Schema Proliferation**: Creating source-specific schemas rather than normalizing to a common entity model
4. **Missing Temporal Context**: Storing data without timestamps or failing to implement temporal decay in analysis
5. **Coupling Analysis to Sources**: Hardcoding source-specific logic in analysis modules rather than operating on normalized entities
6. **Neglecting Dissemination**: Building excellent collection and analysis but delivering results through ad-hoc methods
7. **Ignoring False Positives**: In sanctions screening and threat detection, false positive management is as important as detection
8. **No Feedback Loop**: Failing to implement feedback from intelligence consumers to improve collection and analysis

## Use Cases

### Enterprise Security Operations

An intelligence platform serves as the central nervous system for enterprise security, collecting threat intelligence from external feeds, correlating with internal telemetry, and producing prioritized threat assessments that drive security operations center (SOC) response.

### Regulatory Compliance

Financial institutions use intelligence platforms to automate [KYC](@/glossary/kyc.md)/[AML](@/glossary/aml.md) compliance, screening entities against sanctions lists, assessing beneficial ownership structures, and monitoring for changes in risk profiles. The Prismatic Platform's Czech registry integration (28 adapters) enables comprehensive compliance for entities operating in the Czech Republic.

### Attack Surface Management

Through [Prismatic Perimeter](@/glossary/prismatic-perimeter.md), the intelligence platform continuously discovers and monitors the organization's external attack surface, producing security ratings and NIS2/ZKB compliance assessments.

### Competitive Intelligence

Organizations use intelligence platforms to monitor competitors' digital footprints, track patent filings, analyze hiring patterns, and assess market positioning -- all from publicly available sources within legal and ethical boundaries.

## Related Concepts

- [OSINT](@/glossary/osint.md) -- Open Source Intelligence collection discipline that provides the primary data source
- [Intelligence Analysis](@/glossary/intelligence-analysis.md) -- The analytic processing layer within the platform
- [Intelligence Fusion](@/glossary/intelligence-fusion.md) -- Multi-source data integration methodology
- [EASM](@/glossary/easm.md) -- External Attack Surface Management as a platform capability
- [Entity Resolution](@/glossary/entity-resolution.md) -- Identity consolidation across sources within the entity graph
- [Hawkeye](@/glossary/hawkeye.md) -- Visitor intelligence system built on the platform
- [Prismatic Perimeter](@/glossary/prismatic-perimeter.md) -- Security rating system leveraging the platform
- [Risk Score](@/glossary/risk-score.md) -- Quantified risk output from platform analysis
- [Cyber Threat Intelligence](@/glossary/cyber-threat-intelligence.md) -- Specialized threat-focused intelligence discipline
- [Knowledge Graph](@/glossary/knowledge-graph.md) -- Graph-based knowledge representation underlying the entity model

## See Also

- [OSINT](@/glossary/osint.md) -- Core collection discipline
- [Intelligence Analysis](@/glossary/intelligence-analysis.md) -- Analytic processing methodology
- [Due Diligence](@/glossary/due-diligence.md) -- Investigative use case
- [Sanctions Screening](@/glossary/sanctions-screening.md) -- Compliance use case
- [Attack Surface](@/glossary/attack-surface.md) -- Security monitoring use case
- [AIAD](@/glossary/aiad.md) -- Agent framework powering 530+ platform agents

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
