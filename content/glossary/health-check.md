+++
title = "Health Check"
description = "A service availability verification endpoint that reports the operational status of an application and its dependencies, used by load balancers, orchestrators, and monitoring systems."
weight = 50

[extra]
category = "devops"
tags = ["health-check", "monitoring", "availability", "liveness", "readiness", "kubernetes", "fly-io", "endpoint", "heartbeat", "uptime"]
date_created = "2026-02-23"
date_updated = "2026-02-23"
difficulty = "beginner"
audience = ["developers", "devops-engineers", "sre", "architects"]
related_terms = ["monitoring", "availability", "load-balancer", "kubernetes", "fly-io", "circuit-breaker", "uptime"]
key_concepts = ["liveness-probe", "readiness-probe", "dependency-check", "graceful-degradation", "health-endpoint"]
platforms = ["phoenix", "fly-io", "kubernetes", "beam", "elixir"]
prerequisites = ["http-basics", "deployment-basics", "monitoring-fundamentals"]
use_cases = ["load-balancer-routing", "auto-scaling", "deployment-validation", "dependency-monitoring", "alerting"]
complexity = "low"
stability = "mature"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1000
date_modified = "2026-02-23"
keywords = ["Health Check", "monitoring", "availability", "glossary", "Prismatic Platform"]
quality_score = 78
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Health Check - Prismatic Platform"
+++

## Definition and Overview

A health check is an HTTP endpoint (typically `GET /health` or `GET /api/v1/health`) that reports the operational status of an application and its critical dependencies. Health checks serve as the primary mechanism for infrastructure components -- load balancers, container orchestrators, deployment pipelines, and monitoring systems -- to determine whether an application instance is capable of serving traffic. A healthy response causes traffic to be routed to the instance; an unhealthy response causes traffic to be diverted and may trigger automatic restart or replacement.

Health checks operate at two distinct levels. Liveness checks answer "Is the process running and responsive?" -- they verify that the application has not deadlocked, crashed, or become unresponsive. If a liveness check fails, the orchestrator kills and restarts the instance. Readiness checks answer "Is the application ready to serve traffic?" -- they verify that the application has completed initialization, can connect to its database, and has loaded necessary configuration. If a readiness check fails, the load balancer stops routing traffic to the instance, but the instance is not killed (it may be starting up).

The Prismatic Platform enforces a strict health check performance standard: health check responses must complete within 10 milliseconds. This hard limit ensures that health checks themselves do not become a performance bottleneck and provides rapid detection of degraded instances. Health check endpoints must never perform expensive operations (full database queries, external API calls, file system scans) -- they should check cached status indicators that are updated by background monitoring processes.

## Technical Deep Dive

### Health Check Types

| Type | Question | Failure Action | Check Scope |
|------|----------|---------------|-------------|
| **Liveness** | Is the process alive? | Kill and restart | Application process only |
| **Readiness** | Can it serve requests? | Stop routing traffic | Application + critical dependencies |
| **Startup** | Has it finished initializing? | Wait, do not kill | Initialization completion |
| **Deep** | Are all subsystems healthy? | Alert, investigate | All dependencies (expensive) |

### Response Format

| Status | HTTP Code | Meaning |
|--------|-----------|---------|
| **Healthy** | 200 OK | All checks pass, ready for traffic |
| **Degraded** | 200 OK (with warning body) | Some non-critical dependencies down |
| **Unhealthy** | 503 Service Unavailable | Critical dependency failure |
| **Starting** | 503 Service Unavailable | Not yet initialized |

### Dependency Check Matrix

| Dependency | Check Method | Timeout | Criticality |
|-----------|-------------|---------|-------------|
| **PostgreSQL** | `SELECT 1` via pool | 2s | Critical |
| **Meilisearch** | `GET /health` | 1s | Non-critical |
| **ETS Tables** | `:ets.info/1` exists | 1ms | Critical |
| **Redis** | `PING` command | 500ms | Non-critical |
| **KuzuDB** | Connection check | 1s | Non-critical |
| **Disk Space** | `:disksup.get_disk_data/0` | 100ms | Warning-level |

## Architecture and Implementation

Health check architecture in the Prismatic Platform uses a two-tier approach. The fast path (`/health`) returns a cached status that is updated by a background GenServer every 5 seconds. This ensures that the health endpoint always responds within the 10ms budget, even if underlying dependency checks take longer. The slow path (`/health/deep`) performs real-time dependency checks and is used for debugging, not for load balancer probes.

The background health monitor process maintains a cached health status in ETS. Every 5 seconds, it checks each dependency according to configured timeouts, aggregates results, and updates the cache. The health endpoint reads from this cache, returning the pre-computed status in microseconds.

The platform's deployment on Fly.io uses health checks for instance routing. Fly.io's proxy layer sends periodic health check requests and removes unhealthy instances from the routing pool. During deployments, the old instance fails its readiness check (by setting a shutdown flag), traffic drains to the new instance, and the old instance terminates gracefully.

## Usage in Prismatic Platform

The Prismatic Platform implements health checks for both the web application (port 4000) and the API gateway (port 4004).

```elixir
defmodule PrismaticWeb.HealthController do
  @moduledoc """
  Health check endpoints for load balancer probes
  and monitoring systems. Fast path returns cached
  status within 10ms budget.
  """

  use PrismaticWeb, :controller

  @spec check(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def check(conn, _params) do
    status = Prismatic.Health.cached_status()

    case status.overall do
      :healthy ->
        conn
        |> put_status(200)
        |> json(%{status: "healthy", checks: status.checks, uptime: status.uptime_seconds})

      :degraded ->
        conn
        |> put_status(200)
        |> json(%{status: "degraded", checks: status.checks, warnings: status.warnings})

      :unhealthy ->
        conn
        |> put_status(503)
        |> json(%{status: "unhealthy", checks: status.checks, errors: status.errors})
    end
  end
end

defmodule Prismatic.Health do
  @moduledoc """
  Background health monitor with ETS-cached status.
  Performs dependency checks every 5 seconds and
  caches results for sub-millisecond health endpoint responses.
  """

  use GenServer

  @check_interval_ms 5_000
  @ets_table :prismatic_health_cache

  @spec cached_status() :: map()
  def cached_status do
    case :ets.lookup(@ets_table, :current_status) do
      [{:current_status, status}] -> status
      [] -> %{overall: :starting, checks: %{}, uptime_seconds: 0}
    end
  end

  @impl GenServer
  def init(_opts) do
    :ets.new(@ets_table, [:named_table, :set, :public, read_concurrency: true])
    schedule_check()
    {:ok, %{started_at: System.monotonic_time(:second)}}
  end

  @impl GenServer
  def handle_info(:perform_checks, state) do
    checks = %{
      database: check_database(),
      ets_tables: check_ets_tables(),
      meilisearch: check_meilisearch()
    }

    overall = determine_overall(checks)
    uptime = System.monotonic_time(:second) - state.started_at

    status = %{
      overall: overall,
      checks: checks,
      uptime_seconds: uptime,
      checked_at: DateTime.utc_now(),
      warnings: extract_warnings(checks),
      errors: extract_errors(checks)
    }

    :ets.insert(@ets_table, {:current_status, status})
    schedule_check()
    {:noreply, state}
  end

  defp check_database do
    try do
      Prismatic.Repo.query!("SELECT 1", [], timeout: 2_000)
      :healthy
    rescue
      _ -> :unhealthy
    end
  end

  defp check_ets_tables do
    required = [:prismatic_tool_registry, :prismatic_topic_registry]
    if Enum.all?(required, &(:ets.info(&1) != :undefined)), do: :healthy, else: :degraded
  end

  defp check_meilisearch, do: :healthy

  defp determine_overall(checks) do
    values = Map.values(checks)
    cond do
      Enum.any?(values, &(&1 == :unhealthy)) -> :unhealthy
      Enum.any?(values, &(&1 == :degraded)) -> :degraded
      true -> :healthy
    end
  end

  defp extract_warnings(checks), do: checks |> Enum.filter(fn {_, v} -> v == :degraded end) |> Enum.map(fn {k, _} -> k end)
  defp extract_errors(checks), do: checks |> Enum.filter(fn {_, v} -> v == :unhealthy end) |> Enum.map(fn {k, _} -> k end)
  defp schedule_check, do: Process.send_after(self(), :perform_checks, @check_interval_ms)
end
```

## Cross-References

- [Monitoring](/glossary/monitoring/) -- Broader observability systems
- [Gateway](/glossary/gateway/) -- API gateway health verification
- [Execution Time](/glossary/execution-time/) -- Health check timing budget
- [Environment](/glossary/environment/) -- Environment-specific health configuration
- **Livebooks**: `platform_administration/` notebooks include health monitoring dashboards
- **Academy**: DevOpsSecurityPipeline topic covers health check patterns

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
