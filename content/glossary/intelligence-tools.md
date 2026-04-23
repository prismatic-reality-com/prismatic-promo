+++
title = "Intelligence Tools"
description = "Comprehensive guide to intelligence tools -- the specialized software instruments, frameworks, and platforms used for collecting, processing, analyzing, and disseminating intelligence from open sources, technical systems, and adversarial environments."
weight = 50

[extra]
category = "security"
tags = ["intelligence-tools", "osint", "security", "reconnaissance", "threat-intelligence", "data-collection", "analysis", "automation", "prismatic-platform"]
status = "active"
author = "Tomas Korcak (korczis)"
date_created = "2026-02-22"
date_updated = "2026-02-22"
reading_time = "20 min"
difficulty = "intermediate"
quality_score = 95
key_takeaway = "Intelligence tools are specialized software systems that automate the collection, processing, enrichment, correlation, and analysis of data from diverse sources to produce actionable intelligence for security operations, due diligence, threat assessment, and strategic decision-making."
related_terms = ["osint", "threat-intelligence", "security", "shodan", "censys", "greynoise", "whois", "dns-enumeration", "vulnerability-assessment", "cyber-threat-intelligence"]
aliases = ["intel-tools", "osint-tools", "reconnaissance-tools", "intelligence-software"]
prerequisites = ["osint", "security", "intelligence"]
see_also = ["osint", "threat-intelligence", "cyber-threat-intelligence", "intelligence"]
word_count = 1887
date_modified = "2026-02-23"
keywords = ["Intelligence", "Tools", "Comprehensive", "glossary", "security", "Prismatic Platform", "The Prismatic", "Platform"]
image = "/images/sections/glossary.png"
image_alt = "Intelligence Tools - Prismatic Platform"
+++

## Definition

Intelligence tools are purpose-built software systems designed to collect, process, enrich, correlate, and analyze data from open sources, technical infrastructure, proprietary databases, and adversarial environments to produce structured, actionable intelligence. These tools span the entire intelligence lifecycle: from passive data collection (scraping public registries, querying DNS records, harvesting metadata) through processing and normalization (parsing diverse data formats, deduplication, entity extraction) to analysis and dissemination (correlation, scoring, visualization, reporting). Intelligence tools serve security operations centers, due diligence teams, compliance departments, investigative journalists, law enforcement, and strategic planning functions. The Prismatic Platform integrates 120+ intelligence tools across 7 categories, exposed through a unified LiveView interface and a standardized adapter architecture.

## Overview

The intelligence tools landscape has evolved from ad-hoc manual research using web browsers and command-line utilities into a sophisticated ecosystem of automated collection platforms, enrichment APIs, analysis frameworks, and dissemination systems. Modern intelligence operations require tools that can operate at scale (millions of records), at speed (real-time or near-real-time), across sources (hundreds of data providers), and with reliability (fault-tolerant, rate-limited, legally compliant).

Intelligence tools are categorized by their function within the intelligence cycle:

**Collection Tools** gather raw data from diverse sources. These include web scrapers, API clients, DNS resolvers, certificate transparency log monitors, social media harvesters, and network scanners. Examples in the Prismatic Platform include ARES (Czech Business Registry), Shodan (Internet of Things search), Censys (Internet-wide scanning), and VirusTotal (malware analysis).

**Processing Tools** transform raw data into structured, normalized formats suitable for analysis. Raw HTML is parsed into structured records. Diverse date formats are normalized to ISO 8601. Entity names are canonicalized for deduplication. Addresses are geocoded. Processing tools handle the data engineering that makes analysis possible.

**Enrichment Tools** add context to existing data by cross-referencing against additional sources. An IP address is enriched with geolocation data, ASN information, reputation scores, and historical ownership records. A company name is enriched with registration details, beneficial ownership, financial filings, and litigation history. Enrichment transforms isolated data points into multidimensional intelligence.

**Analysis Tools** identify patterns, anomalies, relationships, and trends within enriched data. Graph analysis reveals hidden connections between entities. Statistical analysis detects anomalous behavior. Machine learning classifies risk levels. Timeline analysis establishes chronological patterns. The Prismatic Platform's entity resolution engine, powered by KuzuDB graph queries, represents a sophisticated analysis tool that identifies when seemingly distinct entities are actually the same real-world person, company, or asset.

**Dissemination Tools** package intelligence into consumable formats for decision-makers. Dashboards provide real-time operational visibility. Reports summarize findings for executive audiences. Alerts notify teams of critical discoveries. APIs enable integration with downstream systems. The Prismatic Platform's LiveView dashboard at `/osint/toolbox` provides interactive access to all 120+ tools with real-time result rendering.

Within the Prismatic Platform, intelligence tools are implemented as Elixir adapter modules that conform to standardized behaviours, enabling consistent error handling, rate limiting, caching, and telemetry across all tools regardless of their underlying data source.

## Technical Details

### Unified Intelligence Tool Architecture

The Prismatic Platform implements intelligence tools through a behaviour-based adapter pattern that standardizes interaction across 120+ diverse data sources:

```elixir
defmodule Prismatic.Intelligence.Tool do
  @moduledoc """
  Behaviour specification for intelligence tools.
  All 120+ OSINT adapters implement this behaviour, providing
  a unified interface for collection, enrichment, and analysis.
  """

  @type tool_id :: atom()
  @type category :: :czech | :global | :sanctions | :eu | :uk | :us | :universal
  @type query :: String.t() | map()
  @type result :: %{
          tool: tool_id(),
          category: category(),
          query: query(),
          data: map() | list(map()),
          confidence: float(),
          timestamp: DateTime.t(),
          metadata: map()
        }
  @type tool_info :: %{
          id: tool_id(),
          name: String.t(),
          category: category(),
          description: String.t(),
          capabilities: [atom()],
          rate_limit: pos_integer(),
          requires_api_key: boolean()
        }

  @callback info() :: tool_info()
  @callback search(query(), keyword()) :: {:ok, result()} | {:error, term()}
  @callback validate_query(query()) :: :ok | {:error, String.t()}
  @callback health_check() :: :ok | {:error, term()}

  @optional_callbacks [health_check: 0]
end
```

### Tool Orchestration with Rate Limiting and Circuit Breaking

Intelligence tools must be orchestrated carefully to respect rate limits, handle failures gracefully, and maximize throughput:

```elixir
defmodule Prismatic.Intelligence.Orchestrator do
  @moduledoc """
  Orchestrates intelligence tool execution with rate limiting,
  circuit breaking, result caching, and parallel execution.
  """

  use GenServer
  require Logger

  alias Prismatic.Intelligence.{Tool, RateLimiter, CircuitBreaker, Cache}

  @type execution_plan :: %{
          tools: [Tool.tool_id()],
          query: Tool.query(),
          strategy: :parallel | :sequential | :waterfall,
          timeout: pos_integer(),
          cache_ttl: pos_integer()
        }

  @type orchestration_result :: %{
          results: %{Tool.tool_id() => Tool.result()},
          failures: %{Tool.tool_id() => term()},
          duration_ms: float(),
          cache_hits: non_neg_integer()
        }

  @default_timeout :timer.seconds(30)
  @default_cache_ttl :timer.minutes(15)

  defstruct [:tools_registry, :rate_limiters, :circuit_breakers, :cache]

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec execute(execution_plan()) :: {:ok, orchestration_result()} | {:error, term()}
  def execute(plan) do
    GenServer.call(__MODULE__, {:execute, plan}, plan.timeout + 5_000)
  end

  @impl true
  def init(_opts) do
    state = %__MODULE__{
      tools_registry: discover_tools(),
      rate_limiters: initialize_rate_limiters(),
      circuit_breakers: initialize_circuit_breakers(),
      cache: Cache.new(:intelligence_cache)
    }

    {:ok, state}
  end

  @impl true
  def handle_call({:execute, plan}, _from, state) do
    start_time = System.monotonic_time(:millisecond)

    {cached_results, uncached_tools} = check_cache(state.cache, plan)

    tool_results =
      case plan.strategy do
        :parallel -> execute_parallel(uncached_tools, plan.query, state)
        :sequential -> execute_sequential(uncached_tools, plan.query, state)
        :waterfall -> execute_waterfall(uncached_tools, plan.query, state)
      end

    merged_results = Map.merge(cached_results, tool_results.successes)

    cache_new_results(state.cache, tool_results.successes, plan.cache_ttl)

    duration_ms = System.monotonic_time(:millisecond) - start_time

    result = %{
      results: merged_results,
      failures: tool_results.failures,
      duration_ms: duration_ms,
      cache_hits: map_size(cached_results)
    }

    emit_telemetry(result)
    {:reply, {:ok, result}, state}
  end

  defp execute_parallel(tools, query, state) do
    tools
    |> Task.async_stream(
      fn tool_id -> execute_single(tool_id, query, state) end,
      max_concurrency: 10,
      timeout: @default_timeout,
      on_timeout: :kill_task
    )
    |> Enum.reduce(%{successes: %{}, failures: %{}}, fn
      {:ok, {:ok, tool_id, result}}, acc ->
        %{acc | successes: Map.put(acc.successes, tool_id, result)}

      {:ok, {:error, tool_id, reason}}, acc ->
        %{acc | failures: Map.put(acc.failures, tool_id, reason)}

      {:exit, reason}, acc ->
        Logger.warning("Tool execution timed out: #{inspect(reason)}")
        acc
    end)
  end

  defp execute_single(tool_id, query, state) do
    with :ok <- RateLimiter.acquire(state.rate_limiters, tool_id),
         :ok <- CircuitBreaker.check(state.circuit_breakers, tool_id),
         {:ok, module} <- Map.fetch(state.tools_registry, tool_id),
         :ok <- module.validate_query(query),
         {:ok, result} <- module.search(query, []) do
      CircuitBreaker.record_success(state.circuit_breakers, tool_id)
      {:ok, tool_id, result}
    else
      {:error, :rate_limited} ->
        {:error, tool_id, :rate_limited}

      {:error, :circuit_open} ->
        {:error, tool_id, :circuit_open}

      {:error, reason} ->
        CircuitBreaker.record_failure(state.circuit_breakers, tool_id)
        {:error, tool_id, reason}
    end
  end

  defp discover_tools do
    :code.all_loaded()
    |> Enum.filter(fn {module, _} ->
      function_exported?(module, :__info__, 1) and
        function_exported?(module, :info, 0) and
        function_exported?(module, :search, 2)
    end)
    |> Enum.map(fn {module, _} -> {module.info().id, module} end)
    |> Map.new()
  end
end
```

### Czech Registry Integration Example

A concrete intelligence tool implementation for querying the Czech ARES business registry:

```elixir
defmodule Prismatic.Intelligence.Czech.ARES do
  @moduledoc """
  Intelligence tool adapter for the Czech ARES Business Registry.
  Provides company information lookup by ICO (company ID),
  name search, and economic activity classification.
  """

  @behaviour Prismatic.Intelligence.Tool

  @base_url "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest"

  @impl true
  def info do
    %{
      id: :ares,
      name: "ARES - Administrative Register of Economic Subjects",
      category: :czech,
      description: "Czech Ministry of Finance business registry with company details, addresses, and economic activities",
      capabilities: [:company_lookup, :name_search, :ico_validation],
      rate_limit: 10,
      requires_api_key: false
    }
  end

  @impl true
  def validate_query(%{ico: ico}) when is_binary(ico) do
    if Regex.match?(~r/^\d{8}$/, ico), do: :ok, else: {:error, "ICO must be 8 digits"}
  end

  def validate_query(%{name: name}) when is_binary(name) and byte_size(name) > 0, do: :ok
  def validate_query(_query), do: {:error, "Query must include :ico (8 digits) or :name (non-empty string)"}

  @impl true
  def search(%{ico: ico}, opts) do
    url = "#{@base_url}/ekonomicke-subjekty/#{ico}"
    execute_request(url, ico, opts)
  end

  def search(%{name: name}, opts) do
    url = "#{@base_url}/ekonomicke-subjekty?obchodniJmeno=#{URI.encode(name)}"
    execute_request(url, name, opts)
  end

  defp execute_request(url, query, _opts) do
    case Req.get(url, headers: [{"accept", "application/json"}], receive_timeout: 15_000) do
      {:ok, %Req.Response{status: 200, body: body}} ->
        {:ok, %{
          tool: :ares,
          category: :czech,
          query: query,
          data: normalize_response(body),
          confidence: 0.95,
          timestamp: DateTime.utc_now(),
          metadata: %{source_url: url}
        }}

      {:ok, %Req.Response{status: 404}} ->
        {:error, :not_found}

      {:ok, %Req.Response{status: status}} ->
        {:error, {:http_error, status}}

      {:error, reason} ->
        {:error, {:connection_error, reason}}
    end
  end

  defp normalize_response(body) when is_map(body) do
    %{
      ico: body["ico"],
      name: body["obchodniJmeno"],
      legal_form: body["pravniForma"],
      address: normalize_address(body["sidlo"]),
      economic_activities: body["czNace"] || [],
      registration_date: body["datumVzniku"],
      status: body["stavSubjektu"]
    }
  end

  defp normalize_address(nil), do: nil
  defp normalize_address(address) do
    %{
      street: address["nazevUlice"],
      city: address["nazevObce"],
      postal_code: address["psc"],
      country: "CZ"
    }
  end
end
```

## Implementation

Implementing an intelligence tool ecosystem requires careful architectural decisions across several dimensions.

**Adapter Registration**: Tools are discovered at application startup through code introspection. Every module implementing the `Prismatic.Intelligence.Tool` behaviour is automatically registered in an ETS-backed registry. This enables dynamic tool discovery without manual configuration, ensuring that new tools are available immediately upon deployment.

**Rate Limiting**: Each tool has configurable rate limits that respect the upstream provider's terms of service. A token bucket algorithm distributes request capacity evenly across time windows. When a tool's rate limit is exhausted, requests are queued rather than rejected, with configurable backpressure strategies (block, drop, or queue with timeout).

**Circuit Breaking**: Tools that experience repeated failures trigger circuit breakers that temporarily halt requests to the failing provider. This prevents cascading failures where a single unresponsive API degrades the entire intelligence pipeline. Circuit breakers follow the standard states: closed (normal operation), open (requests blocked), half-open (test request sent to check recovery).

**Caching**: Intelligence query results are cached with configurable TTLs appropriate to each data source's update frequency. Business registry data changes infrequently and can be cached for hours; threat intelligence feeds update frequently and should be cached for minutes. Cache keys incorporate the tool ID and query parameters to prevent stale data from different queries.

**Telemetry**: Every tool execution emits telemetry events capturing query latency, success/failure rates, cache hit ratios, and result sizes. These metrics feed into the platform's observability stack, enabling operational monitoring of intelligence pipeline health.

**Error Normalization**: Each tool adapter normalizes upstream errors into a consistent error taxonomy: `:not_found`, `:rate_limited`, `:authentication_failed`, `:connection_error`, `:parse_error`, `:timeout`. This enables consistent error handling in the orchestration layer regardless of the upstream provider's error format.

## Comparison

| Tool Category | Examples | Data Type | Latency | Rate Limits | Cost |
|---------------|----------|-----------|---------|-------------|------|
| **Czech Registries** | ARES, Justice, ISIR | Company records, legal filings | 1-5s | 10-60/min | Free |
| **Network Intelligence** | Shodan, Censys, GreyNoise | IP/port/service data | 0.5-3s | 1-100/min | Freemium |
| **Domain Intelligence** | WHOIS, DNS, Cert Transparency | Domain/certificate records | 0.1-2s | 10-1000/min | Free-Paid |
| **Threat Intelligence** | VirusTotal, AbuseIPDB | Malware/reputation data | 0.5-5s | 4-500/min | Freemium |
| **People/Email** | Hunter.io, Clearbit | Contact/company info | 1-3s | 25-500/min | Paid |
| **Sanctions** | EU, OFAC SDN, UN | Sanctions lists | 0.1-1s | Unlimited (local) | Free |
| **Financial** | SEC EDGAR, Companies House | Financial filings | 1-10s | 10-120/min | Free |

The Prismatic Platform's unified adapter architecture eliminates the need for tool-specific client libraries, configuration formats, and error handling patterns. All 120+ tools share the same interface, enabling consistent orchestration, monitoring, and caching.

## Best Practices

1. **Respect Rate Limits**: Always implement rate limiting that respects upstream provider terms of service. Aggressive scraping can result in IP bans, legal action, and data quality degradation. Use exponential backoff for transient failures.

2. **Validate Before Querying**: Validate input queries before sending requests to upstream providers. Rejecting malformed queries locally is faster and cheaper than receiving error responses from remote APIs. The `validate_query/1` callback exists for this purpose.

3. **Cache Aggressively**: Intelligence data, especially from public registries and DNS, changes infrequently. Caching reduces latency, decreases upstream load, and lowers API costs. Implement cache invalidation based on data freshness requirements, not arbitrary TTLs.

4. **Normalize Data Formats**: Different sources use different date formats, address structures, entity name conventions, and status codes. Normalize all data into canonical formats at the adapter level so that downstream analysis operates on consistent structures.

5. **Handle Partial Failures**: When orchestrating queries across multiple tools, partial failures are normal. Design workflows to produce useful results even when some tools fail. Return available data with clear indication of which sources succeeded and which failed.

6. **Audit All Queries**: Log every intelligence query with the user, timestamp, query parameters, and result summary. This audit trail is essential for legal compliance (especially under GDPR), operational debugging, and abuse detection.

7. **Separate Collection from Analysis**: Keep data collection adapters focused on fetching and normalizing data. Analysis logic (correlation, scoring, classification) belongs in separate modules that consume normalized data. This separation enables independent evolution and testing.

8. **Test with Real Data**: Intelligence tool tests should include integration tests against real (or realistic sandbox) APIs to catch format changes, deprecations, and behavior differences that mock-based tests miss.

## Pitfalls

**API Format Changes**: External intelligence providers change their API formats, authentication mechanisms, and rate limits without notice. Tools that work today may fail tomorrow. Implement health checks that detect format changes and alert operators before failures cascade.

**Data Quality Assumptions**: Not all intelligence sources provide accurate data. Business registries may contain outdated addresses. DNS records may reflect cached values. Threat intelligence feeds may contain false positives. Always assign confidence scores to intelligence results and never treat any single source as ground truth.

**Legal and Ethical Boundaries**: Intelligence collection must respect legal frameworks (GDPR, CCPA, computer fraud laws) and ethical boundaries. Scraping personal data without legal basis, accessing systems without authorization, or using intelligence for harassment or discrimination creates legal liability and reputational damage.

**Tool Proliferation**: Adding tools without governance leads to unmaintained adapters, inconsistent data quality, and operational overhead. Each tool adds configuration, monitoring, rate limiting, and error handling burden. Curate the tool catalog deliberately and retire tools that provide low-value or redundant data.

**Over-Reliance on Automation**: Automated intelligence tools produce data, not insight. Human analysis is essential for interpreting results, assessing context, identifying false positives, and making decisions. Tools augment human intelligence; they do not replace it.

**Vendor Lock-In**: Building intelligence pipelines around a single vendor's API creates dependency risk. The Prismatic Platform's behaviour-based adapter pattern mitigates this by abstracting tool implementations behind a common interface, enabling provider substitution without pipeline changes.

## Use Cases

**Corporate Due Diligence**: Before entering a business partnership, a due diligence team queries Czech registries (ARES, Justice, ISIR), sanctions lists (EU, OFAC, UN), financial databases (SEC EDGAR), and company registries (Companies House) to build a comprehensive profile of the target entity. Intelligence tools automate what would otherwise be days of manual research into minutes of automated collection and correlation.

**External Attack Surface Management**: The Prismatic Perimeter application uses intelligence tools to discover and monitor an organization's external attack surface. DNS enumeration reveals subdomains. Certificate transparency logs identify issued certificates. Shodan and Censys discover exposed services. The tools produce a continuously updated inventory of internet-facing assets with security ratings.

**Threat Intelligence Enrichment**: A SOC analyst receives an alert about a suspicious IP address. Intelligence tools automatically enrich the IP with geolocation data (MaxMind), reputation scores (AbuseIPDB), hosting information (Shodan), historical activity (GreyNoise), and malware associations (VirusTotal). The enriched context enables faster, more accurate triage decisions.

**Sanctions Screening**: A financial institution screens customers and transactions against sanctions lists using intelligence tools that query EU, OFAC SDN, and UN sanctions databases. Fuzzy name matching handles spelling variations and transliterations. The tools produce match scores with supporting evidence for compliance review.

**Investigative Journalism**: A journalist investigating corporate ownership uses intelligence tools to trace beneficial ownership through multiple jurisdictions, identify connections between entities, and discover financial patterns. The entity resolution engine in the Prismatic Platform correlates records from dozens of registries to reveal hidden relationships.

## Related Concepts

Intelligence tools operate within a broader ecosystem of intelligence and security concepts:

- [OSINT](@/glossary/osint.md) -- open source intelligence, the primary methodology for collecting publicly available information using intelligence tools
- [Threat Intelligence](@/glossary/threat-intelligence.md) -- intelligence focused on understanding and mitigating cyber threats
- [Cyber Threat Intelligence](@/glossary/cyber-threat-intelligence.md) -- technical intelligence about threat actors, TTPs, and indicators of compromise
- [Security](@/glossary/security.md) -- the overarching discipline within which intelligence tools operate
- [Shodan](@/glossary/shodan.md) -- a network intelligence tool that scans the internet for connected devices and services
- [Censys](@/glossary/censys.md) -- an internet-wide scanning platform for discovering and monitoring internet assets
- [GreyNoise](@/glossary/greynoise.md) -- a tool that analyzes internet background noise to identify benign versus malicious scanning
- [WHOIS](@/glossary/whois.md) -- the protocol and databases for querying domain and IP registration information
- [DNS Enumeration](@/glossary/dns-enumeration.md) -- techniques for discovering subdomains and DNS records
- [Vulnerability Assessment](@/glossary/vulnerability-assessment.md) -- systematic evaluation of security weaknesses using intelligence tools

## See Also

- [Intelligence](@/glossary/intelligence.md) -- the broader concept of intelligence as structured knowledge for decision-making
- [Intelligence Analysis](@/glossary/intelligence-analysis.md) -- the process of transforming raw data into actionable intelligence
- [Intelligence Fusion](@/glossary/intelligence-fusion.md) -- combining intelligence from multiple tools and sources for comprehensive understanding
- [Intelligence Platform](@/glossary/intelligence-platform.md) -- integrated systems that host and orchestrate intelligence tool ecosystems
- [Due Diligence](@/glossary/due-diligence.md) -- a primary use case for intelligence tools in business and compliance contexts
- [EASM](@/glossary/easm.md) -- external attack surface management, a security discipline powered by intelligence tools

---

**Connect & Contribute**: Created by [Tomas Korcak (korczis)](https://github.com/korczis) | Part of the Prismatic Platform Glossary | Licensed under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)
