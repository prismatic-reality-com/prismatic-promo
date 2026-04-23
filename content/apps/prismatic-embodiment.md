+++
title = "Prismatic Embodiment"
weight = 65
[extra]
icon = "cube"
color = "indigo"
description = "Physical-digital bridge for IoT integration and sensor data processing"
category = "Intelligence"
files = "90"
status = "Development"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1026
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Embodiment", "Physical-digital", "apps", "Intelligence", "Prismatic Platform", "PrismaticEmbodiment", "Broadway", "Protocol", "Device"]
tags = ["apps", "intelligence", "prismatic-embodiment", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Embodiment - Prismatic Platform"
+++

## Overview

Prismatic Embodiment bridges the physical and digital worlds by providing IoT sensor integration, physical infrastructure monitoring, and real-world data collection capabilities. While the majority of the Prismatic Platform operates on digital data sources, many intelligence and security use cases require correlation with physical-world events -- building access logs, environmental sensor readings, network hardware locations, and physical perimeter monitoring. Embodiment provides the ingestion, normalization, and correlation layer that makes physical data a first-class citizen in the platform's intelligence pipeline. In the context of [EASM](@/glossary/easm.md), physical infrastructure monitoring is essential because digital [attack surface](@/glossary/attack-surface.md) exposure often originates from physical access vectors.

The module supports standard IoT protocols including MQTT, CoAP, and AMQP, allowing it to collect data from a wide variety of commercial sensor hardware without custom driver development. Incoming sensor readings are normalized into a unified time-series format with device metadata, measurement type, and [confidence scoring](@/glossary/confidence-scoring.md) annotations before being stored in [TimescaleDB](@/glossary/timescaledb.md) hypertables optimized for time-range queries. The [Elixir](@/glossary/elixir.md) [BEAM](@/glossary/beam.md) runtime's lightweight process model is particularly well-suited for this domain -- each sensor connection runs as an isolated [process](@/glossary/process-isolation.md), meaning a failure in one sensor's data stream cannot cascade to affect others.

Beyond simple data collection, Embodiment provides anomaly detection on sensor streams. By establishing baseline behavioral profiles for each sensor, the module can detect deviations -- unexpected temperature spikes in a server room, after-hours motion in a restricted area, or environmental conditions suggesting physical tampering with infrastructure. These anomalies are emitted as platform events that downstream modules like [Prismatic Influence](@/apps/prismatic-influence.md) and [Prismatic Override](@/apps/prismatic-override.md) can act upon, following the platform's [event sourcing](@/glossary/event-sourcing.md) pattern for full traceability.

## Architecture

```
IoT Devices --> Protocol Adapters --> Broadway Pipeline --> Storage + PubSub
     |              |                     |                 |
  MQTT/CoAP    Normalization         Window Functions    TimescaleDB
  AMQP/BLE     Validation           Anomaly Detection    ETS Cache
  RFID/GPIO    Enrichment           Baseline Compare     PubSub Events
  Custom       Device Registry      Multi-Sensor Fuse    Dashboard Feed
```

Embodiment is structured around a **Device [Registry](@/glossary/registry-otp.md)** and a **Stream Processor**. The Device Registry is an [ETS](@/glossary/ets.md)-backed [GenServer](@/glossary/genserver.md) that maintains metadata for all connected sensors -- device ID, [protocol](@/glossary/protocol.md), location, measurement types, and health status. The Stream Processor is a [Broadway](@/glossary/broadway.md) pipeline that consumes messages from protocol-specific producers (MQTT, CoAP, AMQP), normalizes readings, applies anomaly detection, and writes results to both TimescaleDB for persistence and [PubSub](@/glossary/pubsub.md) for real-time distribution.

Each protocol adapter runs as a supervised child under the Embodiment [supervisor](@/glossary/supervisor.md), and new protocols can be added by implementing the `PrismaticEmbodiment.Protocol` [behaviour](@/glossary/behaviour.md) without modifying existing code -- a clean application of the [adapter pattern](@/glossary/adapter-pattern.md).

## Key Modules

| Module | Responsibility |
|--------|----------------|
| `PrismaticEmbodiment` | Public facade: `register_device/1`, `subscribe/2`, `query/2`, `anomalies/1` |
| `PrismaticEmbodiment.Application` | OTP application entry point and supervision tree initialization |
| `PrismaticEmbodiment.DeviceRegistry` | ETS-backed registry of connected sensors with health tracking |
| `PrismaticEmbodiment.StreamProcessor` | Broadway pipeline for sensor data ingestion and processing |
| `PrismaticEmbodiment.AnomalyEngine` | Rolling baseline comparison with adaptive threshold detection |
| `PrismaticEmbodiment.Protocol` | Behaviour definition for protocol adapter implementations |
| `PrismaticEmbodiment.Protocol.Mqtt` | MQTT 5.0 adapter with automatic reconnection and QoS management |
| `PrismaticEmbodiment.Protocol.Coap` | CoAP adapter for constrained IoT devices |
| `PrismaticEmbodiment.Protocol.Amqp` | AMQP adapter for enterprise message broker integration |

## Key Features

### Sensor Integration
- IoT protocol support for MQTT 5.0, CoAP, and AMQP with automatic reconnection and [circuit breaker](@/glossary/circuit-breaker.md)
- Sensor data normalization into unified `%Reading{}` structs with metadata
- Time-series ingestion pipeline using Broadway for [backpressure](@/glossary/backpressure.md)-aware processing
- Device health monitoring with automatic stale-device detection and alerting via [Telemetry](@/glossary/telemetry.md)

### Physical Intelligence
- Geospatial correlation of digital events with physical sensor data using PostGIS
- Physical access point monitoring integrated with building management systems
- Environmental condition tracking for server rooms, offices, and restricted areas
- Asset location intelligence through BLE beacon and RFID reader integration

### Anomaly Detection
- Real-time sensor data [stream processing](@/glossary/stream-processing.md) with configurable window functions
- Anomaly detection using rolling baseline comparison with adaptive thresholds
- Historical trend analysis with automatic downsampling for long-range queries
- Multi-sensor data fusion combining readings from co-located sensors for higher confidence

### Data Management
- [Data pipeline](@/glossary/data-pipeline.md) with configurable retention policies per sensor type
- Compressed archival for historical sensor data via [Prismatic Compression](@/apps/prismatic-compression.md)
- [Structured logging](@/glossary/structured-logging.md) of all device lifecycle events for [audit trail](@/glossary/audit-trail.md)
- [GDPR](@/glossary/gdpr.md)-compliant handling of location data tied to individuals

## Protocol Adapter Design

The protocol adapter system follows a behaviour-based architecture that enables adding new IoT protocols without modifying the core ingestion pipeline. Each adapter implements the `PrismaticEmbodiment.Protocol` behaviour, which defines callbacks for connection management, message parsing, and health reporting.

```elixir
defmodule PrismaticEmbodiment.Protocol do
  @doc "Behaviour for IoT protocol adapters"
  @callback connect(config :: map()) :: {:ok, connection()} | {:error, term()}
  @callback disconnect(connection()) :: :ok
  @callback parse_message(raw :: binary(), connection()) :: {:ok, Reading.t()} | {:error, term()}
  @callback health_check(connection()) :: :healthy | :degraded | :disconnected

  @type connection :: term()
end

defmodule PrismaticEmbodiment.Protocol.Mqtt do
  @behaviour PrismaticEmbodiment.Protocol

  @impl true
  def connect(%{broker: broker, port: port, topics: topics} = config) do
    with {:ok, client} <- Tortoise311.Connection.start_link(config),
         :ok <- subscribe_topics(client, topics) do
      {:ok, %{client: client, topics: topics}}
    end
  end

  @impl true
  def parse_message(raw, _conn) do
    with {:ok, decoded} <- Jason.decode(raw),
         {:ok, reading} <- normalize_reading(decoded) do
      {:ok, reading}
    end
  end
end
```

## Broadway Pipeline Configuration

The stream processor uses Broadway for reliable, acknowledgment-based message processing with automatic batching and rate limiting. The pipeline configuration controls throughput, concurrency, and error handling for each protocol:

```elixir
defmodule PrismaticEmbodiment.StreamProcessor do
  use Broadway

  @impl true
  def start_link(opts) do
    Broadway.start_link(__MODULE__,
      name: __MODULE__,
      producer: [module: {PrismaticEmbodiment.Producer, opts}],
      processors: [default: [concurrency: 10, max_demand: 50]],
      batchers: [
        timescaledb: [concurrency: 5, batch_size: 100, batch_timeout: 1_000],
        pubsub: [concurrency: 2, batch_size: 50, batch_timeout: 500]
      ]
    )
  end
end
```

## Usage

```elixir
# Register a new sensor device
{:ok, device} = PrismaticEmbodiment.register_device(%{
  id: "temp_sensor_dc1_rack3",
  protocol: :mqtt,
  location: %{building: "DC1", floor: 2, rack: "R3"},
  measurements: [:temperature, :humidity]
})

# Subscribe to real-time sensor data with filtering
PrismaticEmbodiment.subscribe(:temperature, location: "DC1", fn reading ->
  if reading.value > 35.0, do: trigger_cooling_alert(reading)
end)

# Query historical sensor data with downsampling
{:ok, data} = PrismaticEmbodiment.query("temp_sensor_dc1_rack3",
  from: ~U[2026-01-01 00:00:00Z],
  to: ~U[2026-01-31 23:59:59Z],
  resolution: :hour)

# Get anomaly report for a location
{:ok, anomalies} = PrismaticEmbodiment.anomalies(location: "DC1", period: :last_24h)

# List all registered devices with health status
{:ok, devices} = PrismaticEmbodiment.list_devices(status: :all)
# => [%{id: "temp_sensor_dc1_rack3", status: :healthy, last_reading: ~U[...]}, ...]
```

## NABLA Compliance

| NABLA Axiom | Embodiment Enforcement | Implementation |
|-------------|----------------------|----------------|
| Provenance Mandatory | Every sensor reading carries device ID, protocol, timestamp, and location | Full provenance chain from physical sensor to storage |
| Signal Plurality | Multi-sensor fusion requires multiple independent readings | Co-located sensors provide independent signals for anomaly confirmation |
| Time Decay | Sensor readings carry precise timestamps with TTL-based retention | TimescaleDB hypertables with configurable retention policies |
| Source Independence | Each protocol adapter operates independently | Independent supervised processes per adapter prevent cross-contamination |
| Absence Informative | Missing sensor readings trigger stale-device alerts | Device health monitor tracks expected reading frequency |

## Testing

Protocol adapter tests verify connection management, message parsing, and reconnection behavior using mock IoT broker implementations. Anomaly detection tests verify baseline computation accuracy and threshold sensitivity using synthetic sensor data with known anomaly points. Broadway pipeline tests verify backpressure handling, message ordering, and error recovery.

Integration tests exercise the full pipeline from protocol adapter through normalization, anomaly detection, and storage. Property-based tests generate random sensor readings to verify normalization consistency and anomaly detection stability under varied input distributions.

## Integration Points

| Application | Relationship |
|-------------|--------------|
| [Prismatic Override](@/apps/prismatic-override.md) | Emergency responses triggered by physical anomalies |
| [Prismatic Property Intelligence](@/apps/prismatic-property-intelligence.md) | Location data enrichment for property analysis |
| [Prismatic Perimeter](@/apps/prismatic-perimeter.md) | Physical sensor anomalies contribute to attack surface assessment |
| [Prismatic Compression](@/apps/prismatic-compression.md) | High-volume sensor data compression for archival |
| [Prismatic Narrative](@/apps/prismatic-narrative.md) | Timeline construction from correlated physical and digital events |

## Performance

| Operation | Latency | Notes |
|-----------|---------|-------|
| Sensor reading ingestion | < 10ms | Broadway pipeline processing |
| Anomaly detection | < 50ms | Rolling baseline comparison |
| Historical query (1 month) | < 200ms | TimescaleDB hypertable with downsampling |
| Device registration | < 5ms | ETS-backed registry |
| Multi-sensor fusion | < 100ms | Concurrent sensor data aggregation |

[Telemetry](@/glossary/telemetry.md) events: `[:prismatic, :embodiment, :reading_ingested]`, `[:prismatic, :embodiment, :anomaly_detected]`, `[:prismatic, :embodiment, :device_stale]`.

## Related Resources

- [Prismatic Override](@/apps/prismatic-override.md) -- Emergency response triggered by physical anomalies
- [Prismatic Suppression](@/apps/prismatic-suppression.md) -- Noise filtering for high-volume sensor alerts
- [Alert Management Specialist](@/agents/alert-management-specialist.md) -- Manages sensor anomaly alert routing and escalation
- [Adapter Pattern Specialist](@/agents/adapter-pattern-specialist.md) -- Reviews IoT protocol adapter implementations
- [Elixir Architect](@/agents/elixir-architect.md) -- Ensures Broadway pipeline and OTP supervision design follows best practices
- [Real-Time Monitoring](@/capabilities/real-time-monitoring.md) -- Sensor data feeds into platform-wide monitoring dashboards
- [Telemetry Integration](@/capabilities/telemetry-integration.md) -- Device health and pipeline metrics instrumented through Telemetry
- [Intelligence Synthesis](@/capabilities/intelligence-synthesis.md) -- Physical-digital data fusion for comprehensive situational awareness

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)