+++
title = "Prismatic Tracking"
weight = 51
[extra]
icon = "map-pin"
color = "green"
description = "Entity tracking and change monitoring across intelligence sources"
category = "Intelligence"
files = "155"
status = "Production"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1070
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Tracking", "Entity", "apps", "Intelligence", "Prismatic Platform", "Diff Engine"]
tags = ["apps", "intelligence", "prismatic-tracking", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Tracking - Prismatic Platform"
+++

## Overview

Prismatic Tracking provides continuous entity monitoring and change tracking across all intelligence sources within the platform. It maintains entity state snapshots at configurable intervals, computes semantic diffs between consecutive states, and generates severity-graded alerts when tracked entities exhibit notable behavioral changes or status transitions.

The system operates on a pull-based scheduling model where monitoring profiles define which sources to query, at what frequency, and which change types warrant notification. This design allows analysts to configure fine-grained tracking for high-priority targets while applying lighter monitoring to the broader entity population, ensuring efficient allocation of [OSINT](/glossary/osint/) query budgets and API rate limits.

Tracking state is persisted in [PostgreSQL](/apps/prismatic-storage-ecto/) for durability and historical analysis, while active tracking schedules and recent snapshots are held in [ETS](/apps/prismatic-storage-ets/) for low-latency access by the scheduling engine.

## Architecture

```
Tracking Scheduler (GenServer)
       |
  Priority Queue (ordered by next_check_at)
       |
  +----+----+----+
  |         |         |
Source    Source    Source
Adapter   Adapter   Adapter
(Shodan)  (Censys)  (DNS)
  |         |         |
  +----+----+----+
       |
  Snapshot Engine
       |
  +----+----+
  |         |
Diff      Alert
Engine    Generator
  |         |
History   Notification
Store     Router
```

The Tracking Scheduler is a [GenServer](/glossary/genserver/) that maintains a priority queue of entity monitoring tasks ordered by their next scheduled check time. When a check fires, the scheduler dispatches source-specific adapter queries as supervised tasks. Results are fed into the Snapshot Engine, which persists the new state and invokes the Diff Engine to compare against the previous snapshot.

## Scheduling and Priority Management

The scheduling engine implements a priority-based task queue that balances monitoring urgency against available resources. Each tracked entity has a monitoring profile that specifies the check interval, the sources to query, and the priority level. High-priority entities (those under active investigation or with recently detected anomalies) receive shorter check intervals and preferential scheduling, while routine monitoring operates on longer cycles.

The scheduler respects per-source API rate limits through a token bucket mechanism. Each OSINT source has a configured rate limit (requests per minute, requests per day), and the scheduler defers checks that would exceed these limits. Deferred checks are rescheduled with exponential backoff to prevent rate limit thrashing, and the scheduler logs the deferral as a telemetry event so that analysts can observe when rate limits are constraining monitoring coverage.

When source queries fail (network errors, API errors, authentication failures), the scheduler applies automatic backoff. The first failure doubles the next check interval; subsequent failures continue doubling up to a configurable maximum (default: 24 hours). When a check succeeds after failures, the interval resets to the monitoring profile's configured value. This backoff mechanism prevents the scheduler from wasting resources on persistently unavailable sources while automatically resuming monitoring when the source recovers.

## Change Detection and Semantic Diffing

The Diff Engine is the analytical core of the Tracking system. Rather than performing simple field-by-field comparison between snapshots, it implements semantic diffing that understands the significance of changes in the intelligence context.

Semantic significance scoring weights changes by their intelligence relevance. A change in an entity's open port list has higher significance than a change in DNS TTL values, because port changes may indicate infrastructure modifications while TTL changes are typically routine. The scoring weights are configurable per entity type and can be tuned based on analyst feedback.

The Diff Engine also performs historical pattern analysis. When a change occurs, the engine checks whether similar changes have occurred previously for the same entity. Recurring changes (such as daily certificate rotation or periodic IP address changes) are scored lower because they represent normal operational patterns rather than genuine state transitions. Novel changes (never before observed for this entity) receive elevated significance scores.

Anomalous change detection uses statistical deviation from entity baselines. Each entity accumulates a baseline profile over time, recording the typical rate and type of changes. When the current change pattern deviates significantly from the baseline (measured by standard deviation), the Diff Engine flags the change as anomalous and elevates its severity.

## Key Features

### Entity Monitoring
- Multi-source entity state tracking with configurable source combinations
- Monitoring profiles per entity type (domain, IP, organization, person)
- Priority-based scheduling with respect for API rate limits per source
- Resource-aware [load balancing](/glossary/load-balancing/) across monitoring cycles
- Automatic backoff on source failures with exponential retry

### Change Detection
- State diff computation between consecutive snapshots using structural comparison
- Semantic significance scoring that weights changes by intelligence relevance
- Historical change pattern analysis for trend identification and baseline deviation
- Anomalous change detection using statistical deviation from entity baselines

### Alerting
- Severity-based alert generation: informational, warning, high, critical
- Configurable alert rules per entity with threshold and pattern triggers
- Alert routing to appropriate handlers (email, webhook, dashboard, [PubSub](/glossary/pubsub/))
- Alert lifecycle management with acknowledgment, escalation, and resolution tracking

## Usage

```elixir
# Start tracking an entity across multiple sources
{:ok, tracker} = PrismaticTracking.track(%{
  entity: "example.com",
  sources: [:shodan, :censys, :dns],
  profile: :high_priority,
  interval: :timer.hours(6),
  notify: [:email, :webhook]
})
# => {:ok, %Tracker{id: "trk-a1b2", status: :active, next_check: ~U[...]}}

# Get tracking history with time-bounded queries
{:ok, history} = PrismaticTracking.history("example.com",
  from: ~D[2025-12-01],
  sources: [:dns]
)
# => {:ok, [%Snapshot{timestamp: ~U[...], state: %{...}}, ...]}

# List significant changes with severity filtering
{:ok, changes} = PrismaticTracking.changes("example.com",
  significance: :high,
  limit: 20
)
# => {:ok, [%Change{field: "open_ports", old: [80, 443], new: [80, 443, 8080], severity: :high}]}

# Bulk tracking for organization-wide monitoring
{:ok, trackers} = PrismaticTracking.track_organization("Example Corp",
  sources: [:shodan, :censys],
  auto_discover: true
)
```

## Testing

```bash
mix test apps/prismatic_tracking/test
mix test apps/prismatic_tracking/test --cover
```

| Test Category | Tests | What It Verifies |
|--------------|-------|------------------|
| Scheduler | 10 | Priority queue ordering, rate limit compliance, backoff |
| Snapshot Engine | 8 | State persistence, snapshot compression, retrieval |
| Diff Engine | 12 | Semantic scoring, pattern analysis, anomaly detection |
| Alert Generation | 8 | Severity classification, routing, lifecycle management |
| Integration | 6 | End-to-end tracking cycle from schedule to alert |

## Integration Points

Tracking data feeds directly into [Prismatic HAWKEYE](/apps/prismatic-hawkeye/) for visitor correlation -- when a tracked domain's infrastructure changes, HAWKEYE reassesses [risk score](/glossary/risk-score/)s for associated traffic. The [KuzuDB graph store](/apps/prismatic-storage-kuzudb/) receives entity relationship updates from tracking snapshots, maintaining a temporal graph of entity state evolution. Alerts generated by the tracking system are surfaced in [Prismatic Web](/apps/prismatic-web/) dashboards and can trigger automated response workflows through the [agent system](/apps/prismatic-agents/).

## NABLA Compliance

Tracking operations maintain comprehensive provenance through timestamped snapshots and change records, satisfying the Provenance Mandatory axiom. Each snapshot records the sources queried, the timestamps of each query, and the raw responses, enabling complete reconstruction of how entity state was determined. The multi-source monitoring model implements Signal Plurality by querying independent intelligence sources for the same entity, and the Diff Engine preserves contradictory observations (different sources reporting different states) as parallel records rather than resolving them silently. Time Decay is implemented through the recency-weighted significance scoring, where recent changes receive higher scores than historical baselines.

## Performance

| Metric | Value |
|--------|-------|
| Scheduling latency | Sub-millisecond (ETS priority queue) |
| Snapshot persistence | Milliseconds (PostgreSQL) |
| Diff computation | Microseconds for typical entity states |
| Alert generation | Sub-millisecond |
| Concurrent tracked entities | 10,000+ |

## Related Components

- [Prismatic OSINT Core](/apps/prismatic-osint-core/) -- Source adapters for intelligence queries
- [Prismatic Storage Ecto](/apps/prismatic-storage-ecto/) -- Snapshot and history persistence
- [Prismatic Storage ETS](/apps/prismatic-storage-ets/) -- Active schedule caching
- [Prismatic Telemetry](/apps/prismatic-telemetry/) -- Tracking cycle [metrics](/glossary/metrics/)

## Related Agents

- [Alert Management Specialist](/agents/alert-management-specialist/) -- Manages severity-graded alerts generated by entity change detection
- [Competitor Researcher](/agents/competitor-researcher/) -- Leverages tracking infrastructure for competitive entity monitoring
- [Evidence Enforcement Agent](/agents/evidence-enforcement-agent/) -- Ensures tracking-based conclusions carry full snapshot provenance

## Related Capabilities

- [Real-Time Monitoring](/capabilities/real-time-monitoring/) -- Continuous entity state monitoring with configurable check intervals
- [Intelligence Synthesis](/capabilities/intelligence-synthesis/) -- Multi-source tracking data fusion for comprehensive entity profiles
- [Telemetry Integration](/capabilities/telemetry-integration/) -- Tracking cycle performance metrics emitted through the telemetry pipeline

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)