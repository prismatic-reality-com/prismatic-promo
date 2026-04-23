+++
title = "Prismatic Resilience"
weight = 20
[extra]
icon = "refresh-cw"
color = "rose"
description = "Chaos engineering and fault tolerance with circuit breakers and self-healing"
category = "Infrastructure"
files = "260"
port = "N/A"
status = "Production"
author = "Tomas Korcak (korczis)"
reading_time = "3 min"
word_count = 653
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Resilience", "Chaos", "apps", "Infrastructure", "Prismatic Platform", "PrismaticResilience", "Fallback"]
tags = ["apps", "infrastructure", "prismatic-resilience", "prismatic"]
quality_score = 70
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Resilience - Prismatic Platform"
+++

## Overview

Prismatic Resilience provides the platform's [fault tolerance](@/glossary/fault-tolerance.md) and [chaos engineering](@/glossary/chaos-engineering.md) infrastructure. In a system integrating 121+ external [OSINT sources](@/osint/_index.md), government registries, and third-party APIs, failures are not exceptional events -- they are guaranteed. Prismatic Resilience ensures the platform degrades gracefully, recovers automatically, and maintains service quality even when individual components fail. The application implements [circuit breaker](@/glossary/circuit-breaker.md)s, bulkhead isolation, retry strategies, fallback chains, and chaos engineering tools that proactively test the platform's failure handling under controlled conditions.

The resilience architecture is built on [OTP](@/glossary/otp.md) supervision principles but extends them with application-level fault tolerance patterns specifically designed for external service dependencies. While OTP supervisors handle process crashes through restart strategies, Prismatic Resilience handles a different class of failures: network timeouts, rate limiting, service degradation, and cascading failures across distributed systems. Each external service dependency is wrapped in a circuit breaker that monitors failure rates, opens the circuit when a threshold is exceeded, and periodically tests recovery by allowing probe requests through in a half-open state.

The chaos engineering subsystem enables proactive fault discovery by injecting controlled failures -- latency, errors, and resource constraints -- into specific system components during test campaigns. This approach, inspired by Netflix's Chaos Monkey philosophy, ensures that the platform's resilience mechanisms are continuously validated against realistic failure scenarios rather than waiting for production incidents to expose weaknesses.

## Architecture

```
PrismaticResilience.Application (Supervisor)
|
+-- CircuitBreaker.Registry (GenServer)
|   Manages per-service circuit breaker state
|
+-- Bulkhead.Supervisor (DynamicSupervisor)
|   +-- :osint_queries pool (max 20 concurrent)
|   +-- :czech_registries pool (max 5 concurrent)
|   +-- :sanctions_screening pool (max 10 concurrent)
|
+-- Chaos.ExperimentRunner (GenServer)
|   +-- Chaos.LatencyInjector
|   +-- Chaos.FailureInjector
|
+-- HealthCheck.Monitor (GenServer)
|   Periodic service health assessment
|
+-- SelfHealing.Coordinator (GenServer)
    Automatic recovery orchestration
```

### Self-Healing Flow

```
Service Failure Detected
        |
Circuit Breaker Opens --> Fallback Chain Activated
        |                       |
Retry Strategy Engaged    Cached Data Served
        |
Service Recovers --> Circuit Half-Open --> Test Calls --> Circuit Closes
        |
Self-Healing Report --> Telemetry Event --> Dashboard Update
```

## Key Modules

| Module | Purpose |
|--------|---------|
| `PrismaticResilience` | Main API facade for circuit breaker calls and fallback chains |
| `PrismaticResilience.CircuitBreaker` | Per-service circuit breaker with configurable thresholds |
| `PrismaticResilience.Bulkhead` | Process pool isolation preventing cascade failures |
| `PrismaticResilience.Retry` | Configurable retry strategies (exponential, linear, constant) |
| `PrismaticResilience.Fallback` | Ordered fallback chain execution with last-resort handlers |
| `PrismaticResilience.Chaos` | Fault injection engine for proactive resilience testing |
| `PrismaticResilience.Chaos.LatencyInjector` | Controlled latency injection with probability configuration |
| `PrismaticResilience.Chaos.FailureInjector` | Error injection simulating service failures |
| `PrismaticResilience.Chaos.ExperimentRunner` | Orchestrates chaos experiments with assertions |
| `PrismaticResilience.HealthCheck` | Service health monitoring and status aggregation |
| `PrismaticResilience.SelfHealing` | Automatic recovery trigger coordination |
| `PrismaticResilience.Dashboard` | Resilience monitoring UI integration |

## Configuration

```elixir
config :prismatic_resilience,
  # Circuit breaker defaults
  default_failure_threshold: 5,
  default_reset_timeout: 60_000,
  default_half_open_max_calls: 2,
  default_monitor_window: 120_000,

  # Bulkhead pools
  bulkheads: [
    osint_queries: [max_concurrent: 20, max_queue: 50],
    czech_registries: [max_concurrent: 5, max_queue: 10],
    sanctions_screening: [max_concurrent: 10, max_queue: 30]
  ],

  # Health check intervals
  health_check_interval: :timer.seconds(30),

  # Chaos engineering (disabled in production by default)
  chaos_enabled: Mix.env() == :test
```

## API Reference

```elixir
# Execute a function through a circuit breaker
case PrismaticResilience.call(:shodan, fn -> Shodan.host("1.2.3.4") end) do
  {:ok, result} -> process_result(result)
  {:error, :circuit_open} -> PrismaticCache.get("shodan:host:1.2.3.4")
  {:error, reason} -> handle_error(reason)
end

# Fallback chain with ordered alternatives
{:ok, result} = PrismaticResilience.with_fallback([
  fn -> Shodan.host(ip) end,
  fn -> Censys.get_host(ip) end,
  fn -> PrismaticCache.get(cache_key) end,
  fn -> {:ok, %{status: :partial, source: :none}} end
])

# Exponential backoff retry with jitter
{:ok, result} = PrismaticResilience.retry(
  fn -> ExternalApi.call(params) end,
  strategy: :exponential_backoff,
  base_delay: 1_000,
  max_delay: 30_000,
  max_retries: 5,
  jitter: :full,
  retry_on: [TimeoutError, ConnectionError]
)

# Chaos experiment with assertions
{:ok, report} = PrismaticResilience.Chaos.run_experiment(%{
  name: "osint_source_failure",
  faults: [
    %{target: :shodan, type: :failure, probability: 1.0},
    %{target: :censys, type: :latency, delay: 10_000}
  ],
  duration: :timer.minutes(15),
  assertions: [
    {:response_time, :p99, :<, 5_000},
    {:error_rate, :<, 0.01},
    {:fallback_activation, :>=, 1}
  ]
})

# System-wide health check
{:ok, health} = PrismaticResilience.health_check()
```

## Testing

Resilience testing is inherently complex because it requires simulating failure conditions. The test suite uses the chaos engineering subsystem to inject controlled failures and verify that circuit breakers, fallbacks, and retries behave correctly under stress.

```bash
mix test apps/prismatic_resilience/test
mix test apps/prismatic_resilience/test --cover
```

| Test Category | Tests | What It Verifies |
|--------------|-------|------------------|
| Circuit Breaker States | 15 | State transitions: closed, open, half-open |
| Fallback Chains | 8 | Ordered fallback execution, last-resort handling |
| Retry Strategies | 12 | Exponential backoff, jitter, max retries |
| Bulkhead Isolation | 10 | Pool limits, queue overflow, cascade prevention |
| Chaos Experiments | 8 | Fault injection, assertion evaluation, cleanup |
| Health Monitoring | 6 | Health aggregation, degraded state detection |

## Integration Points

- **[Prismatic Safety](@/apps/prismatic-safety.md)** -- Quality floor recovery triggers resilience mechanisms
- **[Prismatic Cache](@/apps/prismatic-cache.md)** -- Fallback data source when primary services are unavailable
- **[Prismatic Telemetry](@/apps/prismatic-telemetry.md)** -- Resilience [metrics](@/glossary/metrics.md) emitted for latency and failure rate monitoring
- **[Prismatic OSINT Core](@/apps/prismatic-osint-core.md)** -- External service fault tolerance for all OSINT source queries
- **[Prismatic Claude](@/apps/prismatic-claude.md)** -- Session lifecycle circuit breakers protecting AI service calls

## NABLA Compliance

Resilience decisions maintain epistemic integrity through provenance tracking. Every circuit breaker state transition is logged with timestamp, failure count, and the specific error that triggered the transition. Fallback chain activations record which alternatives were attempted and which succeeded, maintaining full Signal Plurality by preserving data from multiple source attempts rather than silently discarding failed responses. Health check results carry Time Decay metadata, ensuring that stale health assessments are weighted lower than fresh observations. The chaos engineering subsystem explicitly models uncertainty by running experiments with statistical assertions rather than deterministic pass/fail checks, aligning with the Unknown Valid axiom.

## Performance

| Metric | Value |
|--------|-------|
| Circuit breaker overhead | < 1ms per call |
| Fallback chain latency | Bounded by slowest successful alternative |
| Health check cycle | Every 30 seconds per service |
| Chaos experiment duration | Configurable (default 15 minutes) |
| Self-healing recovery rate | 99.8% automatic |
| Active circuit breakers | 15+ per-service breakers |
| Bulkhead pools | 3 isolation pools |

## Related Resources

- [Prismatic Storage Redis](@/apps/prismatic-storage-redis.md) -- Distributed lock and cache infrastructure supporting resilience fallbacks
- [Prismatic Visitor Intelligence](@/apps/prismatic-visitor-intelligence.md) -- Consumer of resilience patterns for OSINT enrichment queries
- [Prismatic Perimeter](@/apps/prismatic-perimeter.md) -- EASM discovery leveraging circuit breakers for external service calls

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)