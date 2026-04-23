+++
title = "osint-engines-specialist"
weight = 283
[extra]
domain = "intelligence"
level = "L3"
description = "Orchestrate parallel OSINT searches across multiple search engines with query optimization"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["osint", "entity-resolution", "nabla-infinity", "trinity-gate", "aiad", "kuzudb", "postgresql", "no-doubts", "seadf", "telemetry"]
domain_normalized = "intelligence"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2200
quality_score = 85
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["osint-engines-specialist", "Orchestrate", "OSINT", "agents", "agent", "Prismatic Platform", "Exposed"]
tags = ["agents", "agent", "osint-engines-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "osint-engines-specialist - Prismatic Platform"
+++

## Overview

The osint-engines-specialist operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform's intelligence domain, responsible for orchestrating parallel [OSINT](@/glossary/osint.md) searches across multiple search engines, specialty databases, and indexed archives with query optimization and result deduplication. This agent abstracts away the complexity of multi-engine search by providing a unified query interface that automatically translates intelligence requirements into engine-specific queries, manages rate limiting across providers, and synthesizes results into coherent intelligence products.

Built on the [AIAD](@/glossary/aiad.md) standard, this agent manages a registry of search engine adapters -- each implementing a common behaviour contract -- that can be dynamically added, removed, or reconfigured without modifying the orchestration logic. The [NO MERCY](@/glossary/no-mercy.md) doctrine ensures comprehensive search coverage: no intelligence query is considered complete until all relevant engines have been queried and results have been deduplicated and scored for relevance.

## Operational Domain

The search engine orchestration domain covers general-purpose search engines, specialized OSINT databases, academic and patent search systems, social media search APIs, dark web indexers, and cached/archived content repositories. The agent maintains engine-specific profiles that track result quality, latency characteristics, rate limit budgets, and coverage overlap with other engines. This metadata drives intelligent query routing that maximizes coverage while minimizing redundant queries and rate limit consumption.

| Engine Category | Examples | Intelligence Value |
|----------------|---------|-------------------|
| General Search | Google, Bing, DuckDuckGo | Broad surface-level discovery |
| People Search | Pipl, Whitepages, social APIs | Entity identification and location |
| Domain Intelligence | Shodan, Censys, SecurityTrails | Infrastructure and attack surface |
| Code Search | GitHub Search, Searchcode, Sourcegraph | Technical footprint and code exposure |
| Archive Search | Wayback Machine, Common Crawl | Historical content and change tracking |
| Academic/Patent | Google Scholar, EPO, USPTO | Research activity and IP ownership |

## Key Capabilities

- **Multi-engine query orchestration** -- Translates high-level intelligence queries into engine-specific search syntax, executes queries in parallel across multiple providers, and aggregates results with source attribution
- **Query optimization** -- Applies search engine-specific operators (Google dorks, Bing advanced operators, Shodan filters) to maximize result relevance and minimize noise
- **Rate limit management** -- Tracks per-engine rate limit budgets, implements adaptive throttling, and distributes query load across engines to prevent blocking while maintaining search velocity
- **Result deduplication** -- Identifies duplicate results returned by multiple engines using URL normalization, content fingerprinting, and fuzzy matching to produce clean, non-redundant result sets
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with self-directed search campaigns that expand queries based on initial findings
- **[Telemetry integration](@/capabilities/telemetry-integration.md)** publishing query throughput, engine response times, result quality scores, and rate limit utilization

## Search Engine Orchestration

```elixir
defmodule Prismatic.OSINT.EngineOrchestrator do
  @moduledoc """
  Orchestrates parallel OSINT searches across multiple search engines
  with query optimization, rate limiting, and result deduplication.
  """

  alias Prismatic.OSINT.{EngineRegistry, QueryTranslator, RateLimiter, Deduplicator}

  @type query :: %{
    terms: String.t(),
    type: :general | :person | :domain | :code | :archive,
    engines: [atom()] | :all,
    max_results: pos_integer(),
    depth: :shallow | :standard | :deep
  }

  @spec search(query()) :: {:ok, [result()]} | {:error, term()}
  def search(query) do
    engines = resolve_engines(query)

    results =
      engines
      |> Task.async_stream(fn engine ->
        with :ok <- RateLimiter.acquire(engine),
             {:ok, translated} <- QueryTranslator.translate(query, engine),
             {:ok, raw_results} <- EngineRegistry.execute(engine, translated) do
          {:ok, {engine, raw_results}}
        else
          {:error, :rate_limited} -> {:skip, engine}
          error -> error
        end
      end, timeout: 15_000, max_concurrency: 8)
      |> collect_results()

    deduplicated = Deduplicator.process(results)
    scored = score_and_rank(deduplicated, query)

    emit_search_telemetry(query, engines, scored)
    {:ok, Enum.take(scored, query.max_results)}
  end

  defp resolve_engines(%{engines: :all, type: type}) do
    EngineRegistry.engines_for_type(type)
  end

  defp resolve_engines(%{engines: engines}), do: engines

  defp score_and_rank(results, query) do
    results
    |> Enum.map(fn result ->
      relevance = calculate_relevance(result, query.terms)
      freshness = calculate_freshness(result)
      source_quality = EngineRegistry.quality_score(result.source_engine)

      %{result | score: relevance * 0.5 + freshness * 0.3 + source_quality * 0.2}
    end)
    |> Enum.sort_by(& &1.score, :desc)
  end
end
```

## Google Dorking Query Patterns

| Dork Pattern | Purpose | Example |
|-------------|---------|---------|
| `site:domain.com filetype:pdf` | Find documents on specific domain | Exposed internal documents |
| `inurl:admin intitle:login` | Discover admin panels | Exposed management interfaces |
| `"password" filetype:env` | Find exposed credentials | Configuration file leaks |
| `ext:sql intext:CREATE TABLE` | Database dumps | Exposed database schemas |
| `intitle:"index of" inurl:backup` | Directory listings | Exposed backup files |
| `site:github.com "api_key"` | Code repository secrets | Hardcoded credentials |

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination with authority to orchestrate multi-engine search campaigns and manage search engine adapter registry.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/osint-search query` | Execute multi-engine OSINT search with specified parameters | L3+ |
| `/osint-search engines` | Display available search engines with health status and rate limits | L3+ |
| `/osint-search optimize` | Analyze and optimize query for maximum engine coverage | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [osint-digital-profile-specialist](@/agents/osint-digital-profile-specialist.md) | Provides search results for digital profile construction |
| [osint-intelligence-operative](@/agents/osint-intelligence-operative.md) | Supplies engine results for tactical intelligence operations |
| [risk-intelligence-commander](@/agents/risk-intelligence-commander.md) | Search findings feed into risk assessment intelligence products |
| [code-quality-commander](@/agents/code-quality-commander.md) | Enforces quality standards on search engine adapter implementations |

## Result Storage

Search results are persisted in [PostgreSQL](@/glossary/postgresql.md) for historical query replay and trend analysis, with entity linkages stored in [KuzuDB](@/glossary/kuzudb.md) graph structures for relationship traversal. The dual-storage architecture enables both efficient keyword-based result retrieval and graph-based intelligence correlation across multiple search campaigns.

## Engine Adapter Architecture

The osint-engines-specialist manages search engines through a behaviour-based adapter system where each engine is encapsulated behind a common interface contract. This architecture enables adding new search engines without modifying the orchestration logic -- new adapters simply implement the required callbacks and register themselves with the engine registry.

### Adapter Behaviour Contract

Each engine adapter must implement three callbacks: `translate_query/2` (converting a generic query into engine-specific syntax), `execute/2` (sending the query and parsing the response), and `health_check/0` (verifying engine availability). Adapters also declare their `capabilities/0` -- which query types they support (general, domain, code, person, archive) -- and their `rate_limits/0` -- the maximum query frequency allowed by the engine's terms of service.

### Query Translation

Query translation is the process of converting a high-level intelligence query into engine-specific search syntax. Each search engine supports different advanced operators: Google uses `site:`, `filetype:`, `intitle:`, and `inurl:` operators; Shodan uses `port:`, `org:`, `country:`, and `product:` filters; GitHub Search uses `filename:`, `language:`, and `org:` qualifiers. The translator maintains operator maps for each engine and composes queries that maximize each engine's unique capabilities. When an engine does not support a specific operator, the translator degrades gracefully by expanding the query to capture a broader result set that is then filtered locally.

### Result Normalization

Results from different engines arrive in different formats with different metadata schemas. The orchestrator normalizes all results into a common schema that includes: URL (normalized to canonical form), title, snippet (first 500 characters of content), source engine, discovery timestamp, and relevance score (engine-specific ranking normalized to 0.0-1.0). This normalization enables fair comparison and deduplication across engines.

## Deduplication Strategy

Result deduplication is critical for producing clean intelligence products. The osint-engines-specialist implements a multi-stage deduplication pipeline. The first stage performs URL normalization -- stripping tracking parameters, resolving redirects, and canonicalizing URLs to a standard form. The second stage applies content fingerprinting using SimHash, which identifies documents with similar content even when hosted at different URLs. The third stage uses title and snippet similarity for results where URL and content fingerprinting produce ambiguous matches. Results that survive all three deduplication stages are considered unique and included in the final result set.

## Adaptive Query Routing

The specialist implements adaptive query routing that learns which engines produce the best results for different query types. Over time, the routing engine builds a model of engine effectiveness per query category based on result quality scores, response times, and downstream consumer feedback. Queries are routed preferentially to engines with higher historical effectiveness for the query category, while maintaining a minimum query distribution to all capable engines to prevent knowledge gaps. This adaptive approach continuously improves search efficiency without requiring manual configuration of engine preferences.

## Enforcement

All search operations comply with the [NO MERCY](@/glossary/no-mercy.md) doctrine: no search campaign is marked complete without querying all relevant engines, results include mandatory source attribution, and rate limits are strictly respected to maintain long-term access. The [NO DOUBTS](@/glossary/no-doubts.md) principle requires that search results carry accuracy indicators and are validated against [NABLA Infinity](@/glossary/nabla-infinity.md) provenance requirements. Deduplication algorithms are tested against known benchmark datasets to verify correctness.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)