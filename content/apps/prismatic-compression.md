+++
title = "Prismatic Compression"
weight = 63
[extra]
icon = "archive-box-arrow-down"
color = "zinc"
description = "Data compression and archival for efficient storage and network transfer"
category = "Infrastructure"
files = "65"
status = "Production"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1272
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Compression", "Data", "apps", "Infrastructure", "Prismatic Platform", "Zstandard", "PrismaticCompression", "High"]
tags = ["apps", "infrastructure", "prismatic-compression", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Compression - Prismatic Platform"
+++

## Overview

Prismatic Compression provides data compression and archival services for the platform. With a continuously growing [OSINT](@/glossary/osint.md) data store, historical intelligence archives, and high-volume inter-node communication, efficient data encoding is essential for both cost control and performance. Compression handles three distinct concerns: reducing storage footprint for historical data, optimizing network transfer between [distributed system](@/glossary/distributed-system.md) components, and managing long-term data retention with configurable archival policies.

The module implements an adaptive algorithm selection strategy. Rather than applying a single compression algorithm uniformly, it profiles incoming data and selects the optimal algorithm based on data characteristics. Structured JSON payloads from [REST API](@/glossary/rest-api.md) responses compress well with Zstandard's dictionary mode, while binary sensor data from [Prismatic Embodiment](@/apps/prismatic-embodiment.md) achieves better ratios with LZ4. The selection is transparent to callers -- they compress and decompress through a unified interface while the module handles algorithm selection, dictionary management, and format versioning internally. This [adapter pattern](@/glossary/adapter-pattern.md) ensures new compression algorithms can be added without modifying consumer code.

For archival, Compression implements a tiered storage strategy aligned with the platform's [compliance framework](@/glossary/compliance-framework.md) requirements. Recent data remains uncompressed in hot storage for fastest access. Data older than a configurable threshold is compressed and moved to warm storage. Data beyond the retention window is either purged or moved to cold storage with maximum compression, depending on regulatory requirements tracked by [Prismatic CER](@/apps/prismatic-cer.md) under [NIS2](@/glossary/nis2.md) and [GDPR](@/glossary/gdpr.md) retention mandates. Across the platform's 90+ applications and millions of accumulated records, Compression saves an estimated 70% of raw storage costs while maintaining sub-millisecond decompression latency for hot data access.

## Architecture

The module is organized around a Codec [Registry](@/glossary/registry-otp.md), an Archival Scheduler, and a Transfer Optimizer.

```
Input Data --> Profiler --> Algorithm Selector --> Codec Engine --> Output
     |           |              |                  |            |
  Type Tag    Data Stats    Zstd/LZ4/Gzip      Parallel      Compressed
  Size Est    Entropy       Dictionary Mgmt     Streaming     + Metadata
  Priority    Pattern       Level Selection     Chunking      + Checksum
  Metadata    Classify      Fallback Chain      Pipeline      + Version
```

The Codec Registry maintains available compression algorithms with their performance profiles and selects the optimal codec per data type. The Archival Scheduler is a periodic [GenServer](@/glossary/genserver.md) that scans storage tables, identifies data eligible for archival or purging, and processes it according to configured retention policies. The Transfer Optimizer wraps inter-node [Erlang](@/glossary/beam.md) distribution with optional compression for large [message passing](@/glossary/message-passing.md) payloads, configurable per message type.

### Process Topology

```
PrismaticCompression.Application (Supervisor, :one_for_one)
+-- PrismaticCompression.CodecRegistry (GenServer)
|     Algorithm registry with performance profiles
+-- PrismaticCompression.ArchivalScheduler (GenServer)
|     Periodic tiered archival processing
+-- PrismaticCompression.DictionaryManager (GenServer)
|     Zstandard dictionary training and management
+-- PrismaticCompression.TransferOptimizer (GenServer)
      Inter-node message compression
```

All operations are instrumented with [Telemetry](@/glossary/telemetry.md) events reporting compression ratios, processing times, and storage savings for [observability](@/glossary/observability.md).

## Key Modules

| Module | Responsibility |
|--------|----------------|
| `PrismaticCompression` | Public facade: `compress/2`, `decompress/1`, `archive/2`, `read_archived/1` |
| `PrismaticCompression.Engine` | Core compression/decompression engine with algorithm dispatch |
| `PrismaticCompression.Application` | OTP application entry point and supervisor |
| `PrismaticCompression.CodecRegistry` | Algorithm registry with performance profiles and selection logic |
| `PrismaticCompression.ArchivalScheduler` | Periodic GenServer for tiered archival processing |
| `PrismaticCompression.TransferOptimizer` | Inter-node message compression for distributed deployments |
| `PrismaticCompression.DictionaryManager` | Zstandard dictionary training, versioning, and distribution |
| `PrismaticCompression.Profiler` | Data profiling for adaptive algorithm selection |

The Engine module handles the actual compression and decompression operations, dispatching to the appropriate algorithm implementation based on the codec selected by the registry. The Application module starts the supervision tree including the ArchivalScheduler for periodic background processing. The DictionaryManager maintains pre-trained Zstandard dictionaries for domain-specific data types, significantly improving compression ratios for small payloads (under 10KB) where standard compression algorithms have insufficient context for effective pattern exploitation.

## Codec Registry and Adaptive Selection

The CodecRegistry maintains a catalog of available compression algorithms with their performance characteristics. When a compression request arrives, the Profiler analyzes the data to determine its type, size, and entropy, then the CodecRegistry selects the optimal algorithm based on these characteristics.

| Algorithm | Best For | Ratio | Speed | Memory |
|-----------|----------|-------|-------|--------|
| **Zstandard** | Structured data (JSON, XML) | High (3-5x) | Fast | Moderate |
| **Zstandard + Dictionary** | Small structured payloads | Very High (5-10x) | Fast | Low |
| **LZ4** | Binary data, streams | Moderate (2-3x) | Very Fast | Low |
| **Gzip** | HTTP responses, compatibility | Good (3-4x) | Moderate | Low |
| **Snappy** | Real-time streams | Moderate (2x) | Very Fast | Low |

The adaptive selection algorithm uses a decision tree based on data size, detected content type, and target latency requirements. For example, data under 1KB with JSON content type selects Zstandard with a trained dictionary, while streaming binary data above 1MB selects LZ4 for its superior throughput.

```elixir
defmodule PrismaticCompression.Profiler do
  @spec profile(binary()) :: %{
    size: non_neg_integer(),
    content_type: atom(),
    entropy: float(),
    recommended_algorithm: atom(),
    recommended_level: pos_integer()
  }
  def profile(data) do
    size = byte_size(data)
    entropy = calculate_entropy(data)
    content_type = detect_content_type(data)

    algorithm = select_algorithm(size, entropy, content_type)
    level = select_level(size, algorithm)

    %{size: size, content_type: content_type, entropy: entropy,
      recommended_algorithm: algorithm, recommended_level: level}
  end
end
```

## Tiered Storage Architecture

The archival system implements a three-tier storage model with automatic data lifecycle management.

| Tier | Age | Compression | Access Latency | Storage Cost |
|------|-----|-------------|----------------|--------------|
| **Hot** | 0-30 days | None | Microseconds (ETS) | High |
| **Warm** | 30-180 days | Zstandard level 3 | Milliseconds | Medium |
| **Cold** | 180+ days | Zstandard level 19 | 10-50ms | Low |

The ArchivalScheduler runs on a configurable interval (default: every 6 hours), scanning storage tables for data that has aged beyond the current tier threshold. Data is compressed in place with the appropriate algorithm and level for the target tier, and metadata is updated to reflect the new storage location and compression format. The scheduler processes data in batches with configurable batch sizes to prevent resource spikes during archival operations.

Cold storage uses maximum compression (Zstandard level 19) to achieve the highest possible compression ratios, trading compression time for storage savings. Since cold data is rarely accessed, the higher decompression latency is acceptable. When cold data is accessed, it is decompressed on demand and cached in warm storage for subsequent accesses within a configurable window.

## Configuration

```elixir
config :prismatic_compression,
  default_algorithm: :zstd,
  zstd_level: 3,
  lz4_acceleration: 1,
  adaptive_selection: true,
  archival_interval: :timer.hours(6),
  hot_threshold_days: 30,
  warm_threshold_days: 180,
  cold_threshold_days: 365,
  dictionary_path: "priv/compression/dictionaries/",
  circuit_breaker_threshold: 5,
  archival_batch_size: 1000
```

Configuration controls the default compression algorithm, algorithm-specific tuning parameters, adaptive selection toggle, archival scheduling interval, and tiered storage thresholds. Dictionary path specifies where trained Zstandard dictionaries are stored for domain-specific compression optimization. The circuit breaker threshold prevents compression pipeline stalls when the engine encounters persistent failures.

## API Reference

```elixir
# Compress data with automatic algorithm selection
{:ok, compressed} = PrismaticCompression.compress(data, profile: :api_response)
# => %Compressed{algorithm: :zstd, ratio: 0.23, original_size: 45_200, compressed_size: 10_396}

# Compress with explicit algorithm and level
{:ok, compressed} = PrismaticCompression.compress(data, algorithm: :zstd, level: 9)

# Decompress data with automatic format detection
{:ok, original} = PrismaticCompression.decompress(compressed)

# Archive old OSINT signals to warm storage
{:ok, stats} = PrismaticCompression.archive(:signals, older_than: ~D[2025-01-01])
# => %{archived: 1_245_000, compressed_size_mb: 340, original_size_mb: 2_100, ratio: 0.16}

# Read archived data with transparent decompression
{:ok, data} = PrismaticCompression.read_archived(archive_id)

# Get compression statistics for capacity planning
{:ok, stats} = PrismaticCompression.storage_stats()
# => %{hot_gb: 45, warm_gb: 120, cold_gb: 890, total_savings_pct: 72}

# Train a new dictionary from sample data
{:ok, dict} = PrismaticCompression.train_dictionary(:osint_responses, samples)
```

## Testing

Unit tests verify round-trip compression/decompression correctness for all supported algorithms across a range of data types and sizes. Archival tests verify correct tier classification, data movement, and transparent decompression on read. Property-based tests using StreamData generate random binary data to verify that compress-then-decompress always returns the original data, regardless of content, size, or algorithm selection.

Integration tests exercise the full archival pipeline with realistic data volumes, verifying that retention policies are correctly enforced and that storage tier transitions maintain data integrity. Performance benchmarks using Benchee validate that compression and decompression meet latency targets. Dictionary training tests verify that trained dictionaries improve compression ratios for domain-specific data compared to generic compression.

## Integration Points

| Application | Relationship |
|-------------|--------------|
| [Prismatic Storage](@/apps/prismatic-storage.md) | Storage adapters use Compression for transparent data encoding |
| [Prismatic CER](@/apps/prismatic-cer.md) | Defines retention policies enforced during archival operations |
| [Prismatic API](@/apps/prismatic-api.md) | HTTP response compression for REST API gateway endpoints |
| [Prismatic Embodiment](@/apps/prismatic-embodiment.md) | High-volume sensor stream processing benefits from streaming compression |
| [Prismatic Signals](@/apps/prismatic-signals.md) | Signal archive compression for historical analysis retention |

## NABLA Compliance

| NABLA Axiom | Compression Enforcement | Implementation |
|-------------|------------------------|----------------|
| Provenance Mandatory | Compressed data retains metadata including algorithm version and checksum | Compression envelope includes algorithm, level, and integrity hash |
| Time Decay | Archival tiers implement time-based data lifecycle management | Hot/warm/cold tier thresholds enforce temporal data handling |
| Unknown Valid | Decompression failures surfaced explicitly rather than returning corrupt data | Integrity checksums verified before returning decompressed content |

Compression is a low-level infrastructure module and does not produce intelligence products directly. NABLA compliance is primarily relevant for data integrity and provenance metadata preservation through compression/decompression cycles.

## Performance

| Operation | Latency | Notes |
|-----------|---------|-------|
| Zstd compress (1MB) | < 5ms | Level 3 default |
| Zstd compress (1MB, level 19) | < 50ms | Maximum compression |
| Zstd decompress (1MB) | < 1ms | Fast decompression path |
| LZ4 compress (1MB) | < 2ms | High-speed mode |
| LZ4 decompress (1MB) | < 0.5ms | Near-memory-bandwidth speed |
| Algorithm selection | < 0.1ms | Profile lookup |
| Archive retrieval | < 10ms | Including decompression |
| Dictionary training | 1-5s | Per dictionary, offline operation |

Storage savings across the platform average 70% with adaptive algorithm selection.

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| Memory | 64 MB | 256 MB (with dictionaries) |
| CPU | 1 core | 2 cores |

Telemetry events: `[:prismatic, :compression, :compress]`, `[:prismatic, :compression, :decompress]`, `[:prismatic, :compression, :archive]`, `[:prismatic, :compression, :dictionary_trained]`. Metrics include compression ratio, processing time, and storage tier utilization.

## Related Resources

- [Prismatic Storage](@/apps/prismatic-storage.md) -- Storage adapters using Compression for transparent encoding
- [Prismatic CER](@/apps/prismatic-cer.md) -- Retention policies governing archival and purge schedules
- [Prismatic Embodiment](@/apps/prismatic-embodiment.md) -- High-volume sensor data benefits from streaming compression
- [Prismatic API](@/apps/prismatic-api.md) -- HTTP response compression for REST endpoints
- [Elixir Architect](@/agents/elixir-architect.md) -- Ensures compression implementations follow OTP patterns
- [Architecture Review Specialist](@/agents/architecture-review-specialist.md) -- Reviews tiered storage architecture decisions
- [Telemetry Integration](@/capabilities/telemetry-integration.md) -- Compression metrics feed into platform-wide observability
- [Real-Time Monitoring](@/capabilities/real-time-monitoring.md) -- Storage tier utilization and compression ratio monitoring
- [Quality Gates](@/capabilities/quality-gates.md) -- Compression correctness verified through round-trip property tests

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)