+++
title = "Prismatic Signals"
weight = 29
[extra]
icon = "signal"
color = "rose"
description = "Real-time signal processing and event stream analysis for threat detection"
category = "Intelligence"
files = "195"
status = "Production"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1109
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Signals", "Real-time", "apps", "Intelligence", "Prismatic Platform", "PrismaticSignals", "Pipeline", "Signal", "GenStage"]
tags = ["apps", "intelligence", "prismatic-signals", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Signals - Prismatic Platform"
+++

## Overview

Prismatic Signals processes real-time event streams for threat detection, anomaly identification, and pattern recognition across the entire platform. It provides a streaming pipeline that ingests signals from [OSINT](/glossary/osint/) sources, network monitoring, security tools, and internal platform events, applying rule-based and statistical detection to identify threats as they emerge. The signal processing pipeline is built on [GenStage](/glossary/genstage/), [Elixir](/glossary/elixir/)'s demand-driven data processing framework, providing automatic [backpressure](/glossary/backpressure/) management that naturally slows ingestion when downstream consumers cannot keep pace.

Signals flow through a multi-stage pipeline: ingestion with [rate limiting](/glossary/rate-limiting/), normalization to a common schema, enrichment from context sources, detection through rule and anomaly engines, cross-source correlation, and alert generation for signals that exceed severity thresholds. Each stage runs as an independent supervised process, enabling horizontal scaling of bottleneck stages without redesigning the pipeline. The architecture leverages [OTP](/glossary/otp/) supervision for [fault tolerance](/glossary/fault-tolerance/) -- if any processing stage crashes, it restarts independently without affecting other stages.

The platform depends on `phoenix_pubsub` for internal event distribution, `circular_buffer` for fixed-size signal history windows, and the `statistics` library for anomaly detection computations. Signal state is checkpointed to [ETS](/glossary/ets/) for fast recovery, ensuring at-least-once processing guarantees. Integration with [Prismatic Bifurcation](/apps/prismatic-bifurcation/) and [Prismatic Blackboard](/apps/prismatic-blackboard/) enables cross-domain signal correlation through shared epistemic state.

## Architecture

```
Sources --> Ingestion --> Normalization --> Enrichment --> Detection --> Correlation --> Alert
                |             |              |            |            |
           Rate Limit    Dedup/Schema    Context      Rule Engine  Multi-Source
           Backpressure  Mapping         Lookup       Anomaly Det  Temporal
           Ordering      Type Coerce     Trait Data   Pattern      Windowing
```

The pipeline leverages GenStage producer-consumer topology with configurable fan-out/fan-in at each stage. The ingestion stage acts as the producer, metering incoming signals through rate limiters and ordering buffers. Normalization and enrichment stages operate as producer-consumers, transforming and augmenting signals before passing them downstream. The detection stage runs rule engines and anomaly detectors in parallel, and the correlation stage performs multi-source temporal windowing to identify complex threat patterns spanning multiple signal sources.

### Process Topology

```
PrismaticSignals.Application (Supervisor, :one_for_one)
+-- PrismaticSignals.Pipeline.Ingestion (GenStage Producer)
|     Rate-limited signal intake with ordering
+-- PrismaticSignals.Pipeline.Normalization (GenStage ProducerConsumer)
|     Schema normalization and deduplication
+-- PrismaticSignals.Pipeline.Enrichment (GenStage ProducerConsumer)
|     Context lookup from trait data and threat intel
+-- PrismaticSignals.Pipeline.Detection (GenStage ProducerConsumer)
|     Rule matching and anomaly detection (parallel)
+-- PrismaticSignals.Pipeline.Correlation (GenStage ProducerConsumer)
|     Multi-source temporal windowing
+-- PrismaticSignals.Pipeline.Alert (GenStage Consumer)
|     Alert generation and routing
+-- PrismaticSignals.StateCheckpointer (GenServer)
      Periodic ETS state checkpoint for recovery
```

## Key Modules

| Module | Purpose |
|--------|---------|
| `PrismaticSignals` | Main API for signal emission, subscription, and querying |
| `PrismaticSignals.Application` | OTP Application with supervised pipeline stages |
| `PrismaticSignals.Pipeline.Ingestion` | GenStage producer with rate limiting and backpressure |
| `PrismaticSignals.Pipeline.Normalization` | Schema normalization, deduplication, and type coercion |
| `PrismaticSignals.Pipeline.Enrichment` | Context lookup from trait data, geolocation, and threat intel |
| `PrismaticSignals.Pipeline.Detection` | Rule-based and statistical anomaly detection engine |
| `PrismaticSignals.Pipeline.Correlation` | Multi-source temporal windowing and pattern correlation |
| `PrismaticSignals.Pipeline.Alert` | Alert generation, routing, and severity classification |
| `PrismaticSignals.Rules` | YAML-defined detection rules with Sigma compatibility |
| `PrismaticSignals.Anomaly` | Statistical anomaly detection (z-score, CUSUM, Holt-Winters) |
| `PrismaticSignals.Window` | Tumbling, sliding, and session window implementations |
| `PrismaticSignals.StateCheckpointer` | Periodic state persistence for crash recovery |

## Signal Schema and Normalization

All signals flowing through the pipeline conform to a common schema that ensures consistent processing regardless of the source. Raw events from diverse sources (OSINT APIs, network monitors, security scanners) are normalized to this schema during the normalization stage.

```elixir
defmodule PrismaticSignals.Signal do
  @type t :: %__MODULE__{
    id: String.t(),
    source: atom(),
    type: atom(),
    severity: :low | :medium | :high | :critical,
    entity: String.t(),
    data: map(),
    metadata: %{
      timestamp: DateTime.t(),
      provenance: map(),
      confidence: float(),
      enrichments: map()
    }
  }
end
```

The normalization stage handles schema mapping from source-specific formats, field type coercion (string dates to DateTime, numeric strings to integers), and deduplication using content-hash-based identity. Signals that cannot be normalized are routed to a dead letter topic for manual review rather than being silently discarded.

## Detection Engine

The detection stage applies two complementary analysis approaches in parallel: rule-based matching and statistical anomaly detection.

### Rule-Based Detection

Detection rules are defined in YAML format compatible with the Sigma detection standard, enabling rule sharing with the broader security community. Rules specify conditions on signal fields, temporal constraints, and severity classifications.

```elixir
# Define a detection rule
PrismaticSignals.Rules.define(%{
  name: "exposed_elasticsearch",
  condition: %{type: :exposed_service, data: %{port: 9200}},
  severity: :high,
  action: :alert,
  description: "Elasticsearch instance exposed without authentication"
})
```

### Statistical Anomaly Detection

The anomaly detection module implements three algorithms for different signal characteristics:

| Algorithm | Use Case | Detection Method |
|-----------|----------|-----------------|
| **Z-Score** | Point anomalies in numeric metrics | Standard deviation from rolling mean |
| **CUSUM** | Drift detection in time series | Cumulative sum of deviations |
| **Holt-Winters** | Seasonal pattern deviation | Triple exponential smoothing forecast |

## Windowing Strategies

The correlation stage uses three windowing strategies to group related signals for pattern analysis.

**Tumbling windows** divide the signal stream into fixed, non-overlapping time intervals. Each window processes signals independently, making them suitable for periodic aggregation (e.g., hourly threat summaries).

**Sliding windows** maintain a moving time range that advances with each new signal. This enables continuous correlation without the boundary effects of tumbling windows, at the cost of higher memory usage for overlapping signal sets.

**Session windows** group signals by activity bursts separated by configurable inactivity gaps. When signals arrive in rapid succession, they are grouped into a single session. A gap exceeding the configured timeout closes the session. This strategy is ideal for detecting coordinated attack sequences where individual signals arrive in bursts.

## Configuration

```elixir
config :prismatic_signals,
  # Pipeline configuration
  ingestion_rate_limit: 10_000,  # signals per second
  normalization_concurrency: 4,
  detection_concurrency: 8,
  correlation_window: :timer.minutes(5),

  # Detection thresholds
  anomaly_z_score_threshold: 3.0,
  rule_match_severity_minimum: :medium,

  # Retention
  signal_ttl: :timer.hours(24),
  archive_after: :timer.days(7),

  # State management
  checkpoint_interval: :timer.seconds(30),
  pubsub_name: PrismaticSignals.PubSub
```

## API Reference

```elixir
# Subscribe to high-severity threat signals
PrismaticSignals.subscribe(:high_severity, fn signal ->
  Logger.warning("Threat detected: #{signal.description}")
end)

# Emit a signal into the processing pipeline
PrismaticSignals.emit(%Signal{
  source: :shodan,
  type: :exposed_service,
  severity: :medium,
  entity: "example.com",
  data: %{port: 9200, service: "elasticsearch"}
})

# Query signal history with filtering
{:ok, signals} = PrismaticSignals.query(
  entity: "example.com",
  from: ~U[2026-01-01 00:00:00Z],
  severity: [:high, :critical],
  limit: 100
)

# Aggregate signal statistics over time windows
{:ok, stats} = PrismaticSignals.stats("example.com", window: :last_24h)
# => %{total: 1247, by_severity: %{low: 980, medium: 210, high: 52, critical: 5}}

# Get active detection rules
{:ok, rules} = PrismaticSignals.Rules.list(severity: :high)
```

## Testing

```bash
mix test apps/prismatic_signals/test
mix test apps/prismatic_signals/test --cover
mix test apps/prismatic_signals/test --only property
```

| Test Category | Tests | What It Verifies |
|--------------|-------|------------------|
| Pipeline Flow | 15 | End-to-end signal processing through all stages |
| Backpressure | 8 | GenStage demand management under load |
| Detection Rules | 20 | Rule matching accuracy, Sigma compatibility |
| Anomaly Detection | 12 | Z-score, CUSUM, Holt-Winters statistical accuracy |
| Windowing | 10 | Tumbling, sliding, session window correctness |
| Correlation | 8 | Multi-source temporal pattern identification |
| State Recovery | 6 | Checkpoint persistence and crash recovery |

## Integration Points

| Application | Relationship |
|-------------|--------------|
| [Prismatic Detection Engine](/apps/prismatic-detection-engine/) | Detection rules applied during signal processing |
| [Prismatic OSINT Monitoring](/apps/prismatic-osint-monitoring/) | OSINT change events ingested as signals |
| [Prismatic Traits](/apps/prismatic-traits/) | Trait data used for signal enrichment and context |
| [Prismatic Perimeter Core](/apps/prismatic-perimeter-core/) | Security-relevant signals feed rating adjustments |
| [Prismatic Bifurcation](/apps/prismatic-bifurcation/) | Epistemic branching when contradictory signals arrive |
| [Prismatic Blackboard](/apps/prismatic-blackboard/) | Shared state for cross-domain signal correlation |
| [Prismatic Telemetry](/apps/prismatic-telemetry/) | Pipeline throughput and latency metrics |

## NABLA Compliance

Signal processing operates under strict NABLA epistemic constraints. The Signal Plurality axiom is enforced at the correlation stage -- no threat conclusion is established from a single signal source. Cross-source correlation requires at least two independent signals before elevating severity. Contradiction Preservation is maintained when conflicting signals arrive (e.g., one source reports a port open while another reports it closed); both signals are preserved with timestamps and the contradiction is surfaced to analysts rather than being silently resolved. Provenance is Mandatory for every signal: source identifier, collection timestamp, and processing chain are attached as immutable metadata. Time Decay is implemented through configurable TTLs ensuring that stale signals lose influence in correlation computations.

| NABLA Axiom | Signals Enforcement | Implementation |
|-------------|-------------------|----------------|
| Signal Plurality | Cross-source correlation requires 2+ independent signals | Correlation stage enforces minimum source count |
| Contradiction Preservation | Conflicting signals preserved as parallel records | Both signals retained with contradiction flag |
| Provenance Mandatory | Source, timestamp, processing chain immutable | Signal metadata attached at ingestion, never modified |
| Time Decay | Configurable TTLs reduce stale signal influence | Exponential decay in correlation scoring |

## Performance

| Metric | Value |
|--------|-------|
| Ingestion throughput | 10,000+ signals/second |
| Detection latency (P99) | < 50ms per signal |
| Correlation window | 5-minute sliding window |
| Alert generation latency | < 100ms from detection |
| Signal retention | 24 hours hot, 7 days archive |
| Backpressure activation | Automatic under load |
| State checkpoint | Every 30 seconds |

## Related Resources

- [Prismatic Storage DuckDB](/apps/prismatic-storage-duckdb/) -- Analytical queries over historical signal data
- [Prismatic Hawkeye](/apps/prismatic-hawkeye/) -- Visitor behavior signals from web traffic analysis
- [Prismatic Suppression](/apps/prismatic-suppression/) -- Alert noise reduction for high-volume signal streams
- [Alert Management Specialist](/agents/alert-management-specialist/) -- Manages severity-graded alerts from signal detection
- [Architecture Review Specialist](/agents/architecture-review-specialist/) -- Reviews GenStage pipeline topology for throughput
- [Real-Time Monitoring](/capabilities/real-time-monitoring/) -- Signal pipeline throughput and detection latency monitoring
- [Intelligence Synthesis](/capabilities/intelligence-synthesis/) -- Cross-source signal correlation for comprehensive threat assessment
- [NABLA Axioms](/capabilities/nabla-axioms/) -- Signal plurality and provenance enforcement in the processing pipeline

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)