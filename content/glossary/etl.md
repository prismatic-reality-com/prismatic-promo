+++
title = "ETL"
weight = 38
[extra]
category = "architecture"
description = "Extract-Transform-Load pattern for moving data between systems with transformation, normalization, and enrichment"
acronym = "ETL"
domain = "data-engineering"
complexity = "intermediate"
stability = "stable"
since_version = "2.0.0"
enforcement_level = "standard"
related_terms = ["data-pipeline", "stream-processing", "broadway", "ecto", "postgresql", "genstage", "backpressure", "adapter-pattern", "shodan", "censys", "greynoise", "meilisearch", "kuzudb"]
platforms = ["elixir", "broadway", "genstage"]
use_cases = ["osint-intelligence", "data-warehousing", "search-indexing", "security-analysis", "compliance-reporting"]
tags = ["data-integration", "data-pipeline", "etl", "elt", "batch-processing", "stream-processing", "backpressure"]
see_also = ["broadway", "genstage", "backpressure", "data-pipeline", "stream-processing"]
difficulty = "intermediate"
audience = ["data-engineers", "backend-engineers", "platform-architects"]
prerequisites = ["broadway", "genstage", "ecto", "postgresql"]
pipeline_stages = ["extraction", "transformation", "loading"]
data_formats = ["json", "xml", "csv", "binary", "protobuf"]
date_created = "2026-02-22"
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
word_count = 1746
date_modified = "2026-02-23"
keywords = ["ETL", "Extract-Transform-Load", "glossary", "architecture", "Prismatic Platform", "Broadway", "Transform", "Load", "OSINT"]
quality_score = 90
image = "/images/sections/glossary.png"
image_alt = "ETL - Prismatic Platform"
+++

## Definition

ETL (Extract-Transform-Load) is a data integration pattern that moves data from source systems to destination systems through three distinct phases: extraction reads raw data from heterogeneous sources (APIs, databases, files, streams), transformation cleanses, normalizes, enriches, and restructures the data into a target schema, and loading writes the transformed data into a destination system (data warehouse, search index, graph database). ETL pipelines are the backbone of data warehousing, business intelligence, and any system that must integrate data from multiple sources into a unified analytical or operational store.

The ETL pattern has evolved significantly since its origins in mainframe batch processing. Classical ETL operates in overnight batch windows, processing accumulated data in bulk. Modern ETL encompasses streaming ETL (continuous micro-batch processing), ELT (load raw data first, transform in place using the destination's compute), and hybrid approaches that combine batch and streaming for different data freshness requirements. The choice between ETL and ELT often depends on where compute is cheapest and most capable: ETL is preferred when transformation logic is complex and benefits from application-level processing (as in Elixir's pattern matching and functional pipelines), while ELT is preferred when the destination system has powerful transformation capabilities (as in modern data warehouses with SQL-based transformation).

For intelligence platforms like Prismatic, ETL is not merely a data engineering concern but a core capability. The quality and completeness of intelligence assessments depends directly on the fidelity of the extraction (capturing all relevant data from [OSINT](@/glossary/osint.md) sources), the correctness of transformation (normalizing heterogeneous data formats into unified representations), and the reliability of loading (ensuring no data loss or duplication in the destination stores). Errors at any stage propagate downstream, potentially leading to incorrect security ratings, missed vulnerabilities, or flawed compliance assessments in [Prismatic Perimeter](@/glossary/prismatic-perimeter.md).

## Historical Context

The ETL pattern emerged in the 1970s alongside the first data warehousing initiatives. Early implementations were handwritten scripts that read flat files, applied transformations in COBOL or PL/I, and loaded results into relational databases. The 1990s saw the rise of commercial ETL tools (Informatica PowerCenter, IBM DataStage, Microsoft SSIS) that provided visual pipeline designers and pre-built connectors for common data sources.

The big data revolution of the 2010s challenged traditional ETL architectures. Hadoop ecosystem tools (Sqoop, Pig, Hive) enabled ETL at petabyte scale, but with higher latency. The rise of streaming platforms (Apache Kafka, Apache Flink) introduced the concept of streaming ETL, where data is processed continuously in near-real-time rather than in batch windows. Apache Spark unified batch and streaming ETL under a single programming model.

In the Elixir ecosystem, ETL evolved along a different path. [GenStage](@/glossary/genstage.md) (2016) introduced demand-driven data exchange between producer and consumer processes, providing backpressure management without external infrastructure. [Broadway](@/glossary/broadway.md) (2019) built on GenStage to provide a high-level ETL pipeline framework with concurrent processing, automatic batching, and acknowledgment-based delivery guarantees. This BEAM-native approach to ETL leverages lightweight processes and supervision trees for fault tolerance without requiring external orchestration systems like Apache Airflow or Luigi.

## ETL vs ELT

The distinction between ETL and ELT reflects different architectural philosophies about where transformation should occur.

| Dimension | ETL | ELT |
|-----------|-----|-----|
| **Transform location** | Application layer (before load) | Destination system (after load) |
| **Data in destination** | Clean, structured, ready to query | Raw initially, transformed via SQL/scripts |
| **Compute model** | Application processes ([BEAM](@/glossary/beam.md), JVM) | Destination engine ([PostgreSQL](@/glossary/postgresql.md), BigQuery) |
| **Schema evolution** | Requires pipeline changes | Re-transform from raw data |
| **Latency** | Higher (transform before load) | Lower initial load, deferred transform |
| **Data lineage** | Clear (each stage documented) | Complex (multiple transformation layers) |
| **Storage cost** | Lower (only transformed data stored) | Higher (raw + transformed data stored) |
| **Best for** | Complex transformations, enrichment, NLP | SQL-expressible transforms, data lakes |

The Prismatic Platform primarily uses ETL because OSINT data transformation involves complex operations that benefit from Elixir's pattern matching, protocol dispatch, and concurrent processing: entity resolution across multiple data sources, natural language processing of vulnerability descriptions, confidence scoring based on source reliability, and provenance tracking that requires application-level metadata attachment.

## The Three Phases

### Phase 1: Extraction

Extraction reads data from source systems, handling protocol differences, authentication, rate limiting, pagination, and error recovery. The extraction phase must be resilient to source failures and capable of producing partial results when some sources are unavailable.

```elixir
defmodule PrismaticOsint.Extractors.Shodan do
  @moduledoc """
  Extracts host intelligence from the Shodan API.
  Handles paginated search, rate limiting, and partial failure recovery.
  Produces ExtractionResult structs for downstream transformation.
  """

  @behaviour PrismaticOsint.Extractor

  @type extraction_opts :: [
    api_key: String.t(),
    max_pages: pos_integer(),
    timeout: pos_integer()
  ]

  @impl true
  @spec extract(String.t(), extraction_opts()) :: {:ok, map()} | {:error, term()}
  def extract(query, opts \\ []) do
    with {:ok, client} <- build_client(opts),
         {:ok, results} <- paginated_search(client, query),
         :ok <- validate_response_schema(results) do
      {:ok, %{
        source: :shodan,
        records: results,
        extracted_at: DateTime.utc_now(),
        query: query,
        page_count: length(results)
      }}
    end
  end

  defp paginated_search(client, query) do
    Stream.unfold(1, fn
      nil -> nil
      page ->
        case Shodan.Client.search(client, query, page: page) do
          {:ok, %{matches: matches, total: total}} when page * 100 < total ->
            {matches, page + 1}

          {:ok, %{matches: matches}} ->
            {matches, nil}

          {:error, :rate_limited} ->
            Process.sleep(1_000)
            {[], page}

          {:error, _reason} ->
            {[], nil}
        end
    end)
    |> Enum.to_list()
    |> List.flatten()
    |> then(&{:ok, &1})
  end
end
```

Key extraction challenges in the OSINT domain include:

| Challenge | Description | Prismatic Solution |
|-----------|-------------|-------------------|
| **Rate limiting** | API providers impose request quotas | Token bucket rate limiter per provider |
| **Pagination** | Large result sets split across pages | Stream-based lazy pagination |
| **Authentication** | Diverse auth mechanisms (API key, OAuth, cert) | Per-provider auth adapter |
| **Schema variance** | Each provider returns different formats | Provider-specific extraction modules |
| **Partial failure** | Some pages succeed, others fail | Retry with exponential backoff, partial results |
| **Data freshness** | Stale data from slow providers | Timestamp tracking, freshness metadata |

### Phase 2: Transformation

Transformation converts extracted data into the platform's canonical representation, applying cleaning, normalization, enrichment, and validation. This phase is where Elixir's pattern matching and functional composition provide the most significant advantages over imperative transformation logic.

```elixir
defmodule PrismaticOsint.Transformers.SecurityAsset do
  @moduledoc """
  Transforms raw OSINT extraction results into canonical SecurityAsset
  representations. Applies normalization, cleaning, enrichment, and
  confidence scoring across heterogeneous source formats.
  """

  @behaviour PrismaticOsint.Transformer

  @type security_asset :: %{
    ip: String.t() | nil,
    ports: list(pos_integer()),
    hostnames: list(String.t()),
    os: String.t() | nil,
    vulns: list(String.t()),
    last_seen: DateTime.t() | nil,
    confidence: float(),
    provenance: map()
  }

  @impl true
  @spec transform(map()) :: {:ok, list(security_asset())} | {:error, term()}
  def transform(%{source: source, records: records}) do
    assets =
      records
      |> Stream.map(&normalize_schema(source, &1))
      |> Stream.map(&clean_and_validate/1)
      |> Stream.map(&enrich_with_geolocation/1)
      |> Stream.map(&compute_confidence_score/1)
      |> Stream.map(&attach_provenance(source, &1))
      |> Stream.reject(&invalid?/1)
      |> Enum.to_list()
      |> deduplicate_by_identity()

    {:ok, assets}
  end

  defp normalize_schema(:shodan, raw) do
    %{
      ip: raw["ip_str"],
      ports: raw["ports"] || [],
      hostnames: raw["hostnames"] || [],
      os: raw["os"],
      vulns: Map.get(raw, "vulns", %{}) |> Map.keys(),
      last_seen: parse_timestamp(raw["timestamp"]),
      raw_data: raw
    }
  end

  defp normalize_schema(:censys, raw) do
    %{
      ip: get_in(raw, ["ip"]),
      ports: extract_ports(raw["services"]),
      hostnames: get_in(raw, ["dns", "names"]) || [],
      os: get_in(raw, ["operating_system", "product"]),
      vulns: extract_cves(raw["services"]),
      last_seen: parse_timestamp(raw["last_updated_at"]),
      raw_data: raw
    }
  end

  defp compute_confidence_score(asset) do
    score =
      [
        if(asset.ip, do: 0.3, else: 0.0),
        if(length(asset.hostnames) > 0, do: 0.2, else: 0.0),
        if(asset.last_seen && fresh?(asset.last_seen), do: 0.3, else: 0.1),
        if(length(asset.vulns) > 0, do: 0.2, else: 0.1)
      ]
      |> Enum.sum()

    Map.put(asset, :confidence, score)
  end
end
```

Transformation operations in the Prismatic Platform include:

| Operation | Description | Example |
|-----------|-------------|---------|
| **Schema normalization** | Map provider-specific fields to canonical schema | Shodan `ip_str` to `ip` |
| **Data cleaning** | Remove invalid, incomplete, or malformed records | Drop records with no IP and no hostname |
| **Deduplication** | Identify and merge duplicate entities | Same IP from Shodan and Censys |
| **Enrichment** | Add derived data from additional sources | Geolocation from IP, ASN lookup |
| **Confidence scoring** | Compute reliability score based on source and data quality | Multi-factor score 0.0-1.0 |
| **Provenance attachment** | Record data origin, transformation steps, timestamps | Source, extraction time, transform chain |
| **Entity resolution** | Link related entities across sources | IP, domain, certificate to same organization |

### Phase 3: Loading

Loading writes transformed data to destination systems, handling idempotency, conflict resolution, and multi-destination fanout. The Prismatic Platform loads into multiple backends simultaneously to serve different access patterns.

```elixir
defmodule PrismaticOsint.Loaders.MultiBackend do
  @moduledoc """
  Multi-backend loader supporting concurrent writes to PostgreSQL,
  Meilisearch, and KuzuDB. Handles batch upserts, conflict resolution,
  and partial failure reporting.
  """

  @behaviour PrismaticOsint.Loader

  @type load_result :: %{
    postgresql: {:ok, non_neg_integer()} | {:error, term()},
    meilisearch: {:ok, non_neg_integer()} | {:error, term()},
    kuzudb: {:ok, non_neg_integer()} | {:error, term()},
    total_loaded: non_neg_integer()
  }

  @impl true
  @spec load(list(map()), keyword()) :: {:ok, load_result()} | {:error, term()}
  def load(assets, opts \\ []) when is_list(assets) do
    tasks = [
      Task.async(fn -> {:postgresql, load_to_postgresql(assets)} end),
      Task.async(fn -> {:meilisearch, load_to_meilisearch(assets)} end),
      Task.async(fn -> {:kuzudb, load_to_kuzudb(assets)} end)
    ]

    results =
      Task.await_many(tasks, :timer.seconds(30))
      |> Enum.into(%{})

    total = Enum.sum(for {_, {:ok, n}} <- results, do: n)

    {:ok, Map.put(results, :total_loaded, total)}
  end

  defp load_to_postgresql(assets) do
    assets
    |> Enum.chunk_every(500)
    |> Enum.reduce({:ok, 0}, fn batch, {:ok, count} ->
      case PrismaticStorage.Ecto.bulk_upsert(batch, conflict_target: :identity_hash) do
        {:ok, inserted} -> {:ok, count + inserted}
        error -> error
      end
    end)
  end

  defp load_to_meilisearch(assets) do
    case PrismaticStorageMeilisearch.bulk_index("security_assets", assets) do
      {:ok, task} -> {:ok, length(assets)}
      error -> error
    end
  end

  defp load_to_kuzudb(assets) do
    case PrismaticStorageKuzu.bulk_create_nodes(assets) do
      {:ok, count} -> {:ok, count}
      error -> error
    end
  end
end
```

## Broadway-Based ETL Pipeline

The Prismatic Platform implements its primary ETL pipelines using [Broadway](@/glossary/broadway.md), which provides concurrent processing, automatic batching, and [backpressure](@/glossary/backpressure.md) management built on the [BEAM](@/glossary/beam.md) process model.

```elixir
defmodule PrismaticOsint.EtlPipeline do
  @moduledoc """
  Broadway-based ETL pipeline for OSINT intelligence processing.
  Provides concurrent extraction, parallel transformation, and
  batched multi-destination loading with automatic backpressure.
  """

  use Broadway

  @spec start_link(keyword()) :: {:ok, pid()} | {:error, term()}
  def start_link(opts) do
    Broadway.start_link(__MODULE__,
      name: __MODULE__,
      producer: [
        module: {PrismaticOsint.OsintProducer, provider: opts[:provider]},
        concurrency: 2
      ],
      processors: [
        default: [concurrency: 8, max_demand: 10]
      ],
      batchers: [
        postgresql: [concurrency: 2, batch_size: 100, batch_timeout: 5_000],
        meilisearch: [concurrency: 1, batch_size: 50, batch_timeout: 10_000],
        kuzudb: [concurrency: 1, batch_size: 25, batch_timeout: 10_000]
      ]
    )
  end

  @impl true
  def handle_message(_processor, message, _context) do
    with {:ok, extracted} <- extract(message.data),
         {:ok, transformed} <- transform(extracted) do
      message
      |> Broadway.Message.update_data(fn _ -> transformed end)
      |> Broadway.Message.put_batcher(select_destination(transformed))
    else
      {:error, reason} ->
        Broadway.Message.failed(message, reason)
    end
  end

  @impl true
  def handle_batch(:postgresql, messages, _info, _context) do
    records = Enum.map(messages, & &1.data)

    case PrismaticStorage.Ecto.bulk_upsert(records) do
      {:ok, _count} -> messages
      {:error, reason} -> Enum.map(messages, &Broadway.Message.failed(&1, reason))
    end
  end

  @impl true
  def handle_batch(:meilisearch, messages, _info, _context) do
    records = Enum.map(messages, & &1.data)
    PrismaticStorageMeilisearch.bulk_index("security_assets", records)
    messages
  end

  defp select_destination(transformed) do
    cond do
      transformed.type in [:vulnerability, :finding] -> :postgresql
      transformed.type in [:asset, :service] -> :postgresql
      true -> :meilisearch
    end
  end
end
```

This architecture achieves concurrent extraction, parallel transformation, and batched multi-destination loading with automatic backpressure propagation from destination to source.

## Error Handling in ETL Pipelines

ETL pipelines must handle errors at every stage without losing data or corrupting destination state. The Prismatic Platform implements a comprehensive error handling strategy.

| Error Type | Stage | Handling Strategy |
|-----------|-------|-------------------|
| **Source unavailable** | Extract | Retry with backoff, [circuit breaker](@/glossary/circuit-breaker.md) after N failures |
| **Rate limit exceeded** | Extract | Back off, respect Retry-After header |
| **Invalid data format** | Transform | Log, route to dead-letter queue, continue pipeline |
| **Schema violation** | Transform | Reject record, emit validation error metric |
| **Destination unavailable** | Load | Retry with backoff, buffer in memory (bounded) |
| **Duplicate key conflict** | Load | Upsert with conflict resolution (update or skip) |
| **Partial batch failure** | Load | Retry failed records individually, ack successful |
| **Pipeline crash** | Any | OTP supervisor restarts, resume from last checkpoint |

Broadway's built-in acknowledgment mechanism ensures that messages are only acknowledged after successful processing. If a message fails at any stage, it is not acknowledged, and the source (depending on the producer) can re-deliver it.

## OSINT ETL Architecture

The Prismatic Platform's OSINT ETL architecture processes intelligence from 120+ external providers through standardized pipelines.

```
                    +-------------+
                    |   Shodan    |
                    |  API (REST) |
                    +------+------+
                           |
+-------------+    +-------v-------+    +--------------+    +-------------+
|   Censys    |---+|  Extraction   |---+|Transformation|---+|   Loading    |
|  API (REST) |    |  (per-source) |    | (normalize,  |    | (PostgreSQL, |
+-------------+    |               |    |  enrich,     |    |  Meilisearch,|
                   |  Rate limit   |    |  score,      |    |  KuzuDB)     |
+-------------+    |  Pagination   |    |  deduplicate)|    |  Upsert      |
|  GreyNoise  |---+|  Auth         |    |              |    |  Batched     |
|  API (REST) |    +---------------+    +--------------+    +-------------+
+-------------+
                   Broadway Pipeline with Backpressure
```

| Provider | Data Type | Volume | Extraction Method | Update Frequency |
|----------|-----------|--------|-------------------|-----------------|
| [Shodan](@/glossary/shodan.md) | Host intelligence | ~10K records/query | Paginated REST API | On-demand + scheduled |
| [Censys](@/glossary/censys.md) | Internet-wide scan data | ~50K records/query | Paginated REST API | Weekly full, daily delta |
| [GreyNoise](@/glossary/greynoise.md) | Internet noise/scanner data | ~5K records/query | REST API | Real-time + daily |
| Certificate Transparency | TLS certificates | ~100K/day | Log streaming | Continuous |
| Passive DNS | DNS resolution history | ~50K/day | Bulk file + API | Daily |

## Pipeline Monitoring

ETL pipeline health requires monitoring at each stage to detect degradation before it impacts downstream consumers.

| Metric | Stage | Alert Threshold |
|--------|-------|-----------------|
| Records extracted per minute | Extract | < 50% of expected rate |
| Extraction error rate | Extract | > 5% of attempts |
| Transform rejection rate | Transform | > 10% of records |
| Enrichment latency | Transform | > 2 seconds per record |
| Load batch duration | Load | > 30 seconds per batch |
| Destination queue depth | Load | > 1000 pending records |
| End-to-end latency | Pipeline | > 5 minutes (extract to queryable) |
| Dead letter queue size | All | > 100 records |

## Data Quality and Lineage

Data quality in ETL pipelines is enforced through validation rules applied at each stage. The Prismatic Platform tracks data lineage through the entire pipeline, recording the origin, transformation steps, and destination for every record.

```elixir
defmodule PrismaticOsint.DataLineage do
  @moduledoc """
  Tracks data lineage through ETL pipelines.
  Records origin, transformation steps, and destination for
  every record processed, enabling provenance queries.
  """

  @type lineage_record :: %{
    record_id: String.t(),
    source: atom(),
    extracted_at: DateTime.t(),
    transformations: list(atom()),
    destinations: list(atom()),
    loaded_at: DateTime.t() | nil,
    checksum: String.t()
  }

  @spec track(map(), atom()) :: {:ok, lineage_record()} | {:error, term()}
  def track(record, stage) do
    lineage = %{
      record_id: generate_id(record),
      source: record.provenance.source,
      extracted_at: record.provenance.extracted_at,
      transformations: record.provenance.transforms ++ [stage],
      destinations: [],
      loaded_at: nil,
      checksum: compute_checksum(record)
    }

    {:ok, lineage}
  end

  defp generate_id(record) do
    :crypto.hash(:sha256, :erlang.term_to_binary(record))
    |> Base.encode16(case: :lower)
    |> binary_part(0, 16)
  end

  defp compute_checksum(record) do
    :crypto.hash(:md5, :erlang.term_to_binary(record))
    |> Base.encode16(case: :lower)
  end
end
```

## Best Practices

1. **Use Broadway for production pipelines.** Broadway provides automatic batching, backpressure, acknowledgment, and supervision. Building custom ETL pipelines from raw GenStage is rarely necessary.

2. **Separate extraction, transformation, and loading concerns.** Each phase should be implemented in separate modules with well-defined interfaces. This enables independent testing, monitoring, and scaling of each phase.

3. **Implement idempotent loading.** Use upserts with conflict resolution rather than plain inserts. This ensures that reprocessing a message (after a retry) does not create duplicates in the destination.

4. **Track data lineage.** Record the origin, transformation steps, and destination for every record. This enables debugging when downstream data quality issues are detected and supports compliance requirements for data provenance.

5. **Handle partial failures gracefully.** A failed record should not block the entire pipeline. Route failures to a dead-letter queue for investigation while the pipeline continues processing valid records.

6. **Monitor all three phases independently.** Each phase can fail independently. Monitor extraction rate, transformation rejection rate, and loading latency separately to isolate problems quickly.

## Common Pitfalls

- **Monolithic ETL scripts.** Combining extraction, transformation, and loading in a single function makes the pipeline impossible to test, monitor, or scale independently. Separate the phases.

- **Ignoring backpressure.** Without backpressure, a fast extractor can overwhelm a slow loader, causing memory exhaustion. Broadway handles this automatically; custom pipelines must implement it explicitly.

- **Schema coupling.** Tightly coupling the transformation to a specific source schema makes the pipeline brittle. Use adapter modules that normalize heterogeneous schemas to a canonical representation.

- **Assuming atomicity across destinations.** Multi-destination loading is not atomic. A record can be loaded to PostgreSQL but fail to load to Meilisearch. Design for eventual consistency and implement reconciliation checks.

- **Not handling timezone differences.** OSINT sources report timestamps in various timezones. Normalize all timestamps to UTC during transformation to prevent incorrect ordering and freshness calculations.

## Related Terms

- [Data Pipeline](@/glossary/data-pipeline.md) - General pipeline pattern encompassing ETL workflows
- [Stream Processing](@/glossary/stream-processing.md) - Real-time alternative to batch ETL
- [Broadway](@/glossary/broadway.md) - Concurrent pipeline library implementing streaming ETL
- [GenStage](@/glossary/genstage.md) - Demand-driven data exchange underlying Broadway
- [Backpressure](@/glossary/backpressure.md) - Flow control preventing ETL pipeline overload
- [PostgreSQL](@/glossary/postgresql.md) - Primary relational destination for ETL-loaded data
- [Ecto](@/glossary/ecto.md) - Database wrapper used for ETL loading operations
- [Adapter Pattern](@/glossary/adapter-pattern.md) - Storage abstraction enabling multi-destination loading
- [Shodan](@/glossary/shodan.md) - OSINT extraction source for host intelligence
- [Censys](@/glossary/censys.md) - OSINT extraction source for internet-wide scan data
- [Meilisearch](@/glossary/meilisearch.md) - Search engine destination for ETL-loaded data
- [BEAM](@/glossary/beam.md) - Runtime providing concurrent processing for ETL pipelines

## See Also

- [Architecture](@/architecture/_index.md) - Data integration architecture and pipeline topology
- [Technologies](@/technologies/_index.md) - ETL implementation stack and library ecosystem
- [Apps](@/apps/_index.md) - Applications implementing ETL pipelines for OSINT and security data
- [OSINT Tools](@/osint/_index.md) - Intelligence tools serving as ETL data sources

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
