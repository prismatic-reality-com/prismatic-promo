+++
title = "Connection Pool"
weight = 50
[extra]
description = "A managed collection of pre-established database or network connections that are reused across requests, eliminating per-request connection overhead"
category = "architecture"
related_terms = ["connection-pooling", "cache", "configuration", "circuit-breaker", "concurrency"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["connection pool", "database pool", "DBConnection", "Ecto pool", "pool management", "glossary", "Prismatic Platform"]
tags = ["glossary", "architecture", "database"]
quality_score = 78
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Connection Pool - Prismatic Platform"
+++

## Definition & Overview

A connection pool is a cache of pre-established database or network connections maintained in a ready-to-use state, enabling application code to check out a connection, use it for a request, and return it to the pool rather than creating and destroying connections for each operation. Connection pooling eliminates the significant overhead of TCP handshake, TLS negotiation, and authentication that occurs with each new connection, typically reducing per-request latency by 10-100x for database operations.

Connection pools manage a fixed or dynamic number of connections, handling checkout (borrowing a connection), checkin (returning a connection), timeout (reclaiming stale connections), and overflow (temporarily exceeding the pool size under load). The pool size is a critical tuning parameter: too small causes request queuing; too large wastes server resources and can exceed database connection limits.

The Prismatic Platform uses Elixir's DBConnection library (via Ecto) for PostgreSQL connection pooling across all database-backed apps. The umbrella architecture presents a unique pooling challenge -- with 115 apps potentially requiring database access, connection pool sizing must account for the total connection budget across all apps while respecting PostgreSQL's `max_connections` limit. The platform configures pool sizes via `config/runtime.exs`, reading the `POOL_SIZE` environment variable for production deployments on Fly.io.

## Technical Deep Dive

### Pool Configuration Matrix

| Environment | Pool Size | Queue Target | Queue Interval | Overflow |
|-------------|-----------|-------------|----------------|----------|
| **Development** | 10 | 50ms | 1000ms | 0 |
| **Test** | 1 | N/A | N/A | 0 (sandbox) |
| **Staging** | 5 | 50ms | 1000ms | 2 |
| **Production** | 10-20 | 50ms | 1000ms | 5 |

### Ecto Pool Configuration

```elixir
# config/runtime.exs
if config_env() == :prod do
  database_url = System.fetch_env!("DATABASE_URL")
  pool_size = String.to_integer(System.get_env("POOL_SIZE") || "10")

  config :prismatic, PrismaticStorage.Repo,
    url: database_url,
    pool_size: pool_size,
    queue_target: 50,
    queue_interval: 1000,
    ssl: true,
    ssl_opts: [verify: :verify_peer],
    socket_options: [:inet6]
end
```

### Pool Monitoring Implementation

```elixir
defmodule PrismaticStorage.PoolMonitor do
  @moduledoc """
  Monitors database connection pool health across all Ecto repos.
  Publishes telemetry events for dashboard visualization and alerting.
  Detects pool exhaustion before it causes request failures.
  """

  use GenServer

  @check_interval :timer.seconds(15)

  @type pool_stats :: %{
    repo: atom(),
    size: non_neg_integer(),
    checked_out: non_neg_integer(),
    available: non_neg_integer(),
    overflow: non_neg_integer(),
    queue_length: non_neg_integer(),
    utilization_pct: float()
  }

  @spec get_stats(atom()) :: {:ok, pool_stats()} | {:error, atom()}
  def get_stats(repo) do
    case DBConnection.Pool.get_info(repo) do
      info when is_map(info) ->
        stats = %{
          repo: repo,
          size: Map.get(info, :pool_size, 0),
          checked_out: Map.get(info, :checked_out, 0),
          available: Map.get(info, :available, 0),
          overflow: Map.get(info, :overflow, 0),
          queue_length: Map.get(info, :queue_length, 0),
          utilization_pct: calculate_utilization(info)
        }
        {:ok, stats}

      _ ->
        {:error, :unavailable}
    end
  end

  @spec all_repo_stats() :: [pool_stats()]
  def all_repo_stats do
    repos()
    |> Enum.map(fn repo ->
      case get_stats(repo) do
        {:ok, stats} -> stats
        {:error, _} -> nil
      end
    end)
    |> Enum.reject(&is_nil/1)
  end

  @impl GenServer
  def init(_opts) do
    schedule_check()
    {:ok, %{}}
  end

  @impl GenServer
  def handle_info(:check_pools, state) do
    stats = all_repo_stats()

    Enum.each(stats, fn stat ->
      :telemetry.execute(
        [:prismatic, :db, :pool],
        %{utilization: stat.utilization_pct, queue_length: stat.queue_length},
        %{repo: stat.repo}
      )

      if stat.utilization_pct > 0.85 do
        :telemetry.execute(
          [:prismatic, :db, :pool, :warning],
          %{utilization: stat.utilization_pct},
          %{repo: stat.repo, reason: :high_utilization}
        )
      end
    end)

    schedule_check()
    {:noreply, state}
  end

  defp calculate_utilization(%{pool_size: size, checked_out: out}) when size > 0 do
    out / size
  end
  defp calculate_utilization(_), do: 0.0

  defp schedule_check, do: Process.send_after(self(), :check_pools, @check_interval)

  defp repos do
    Application.get_env(:prismatic, :ecto_repos, [PrismaticStorage.Repo])
  end
end
```

### Connection Lifecycle

| Phase | Action | Duration | Resource |
|-------|--------|----------|----------|
| **Establish** | TCP + TLS + Auth | 10-100ms | One-time per connection |
| **Checkout** | Borrow from pool | < 1ms | Per request |
| **Execute** | Run query | 1-100ms | Per query |
| **Checkin** | Return to pool | < 1ms | Per request |
| **Idle Timeout** | Close idle connections | Configurable | Background |
| **Health Check** | Verify connection alive | Periodic | Background |

## Architecture & Implementation

The Prismatic Platform uses DBConnection (Elixir's database connection library) which provides a process-per-connection model aligned with OTP principles. Each connection in the pool is an Erlang process, enabling the BEAM scheduler to manage connections efficiently alongside other platform processes. The process-per-connection model also provides natural isolation -- a crashed connection process does not affect other connections.

For the umbrella architecture, connection pools are configured at the repository level. The main `PrismaticStorage.Repo` handles the majority of database operations, but specialized repos exist for DD operations (`PrismaticDd.Repo`) and heavy-read workloads. Each repo has its own pool, and the sum of all pool sizes must not exceed PostgreSQL's `max_connections` setting.

The PoolMonitor GenServer provides continuous observability into pool health. When pool utilization exceeds 85%, telemetry warnings are emitted, which the monitoring dashboard surfaces as alerts. This early warning system prevents pool exhaustion from causing cascading request failures.

## Usage in Prismatic Platform

The DD pipeline's batch loading operations are the most pool-intensive workload. When the Loader processes entity batches from multiple sources simultaneously, it can temporarily exhaust the pool. The Scheduler implements backpressure by limiting concurrent load operations to prevent pool starvation.

The OSINT toolbox's async execution model uses pool connections efficiently. Each tool execution that requires database access (for caching, audit logging, or result storage) checks out a connection for the minimum necessary duration, returning it immediately after the transaction completes. The ETS-backed ToolRegistry handles most read operations without database access.

Production deployments on Fly.io configure pool sizes based on the VM size and PostgreSQL plan. The `POOL_SIZE` environment variable allows dynamic tuning without redeployment, and the PoolMonitor's telemetry data informs pool sizing decisions based on actual utilization patterns.

## Cross-References

- [Connection Pooling](@/glossary/connection-pooling.md) - related concept with pooling strategies
- [Cache](@/glossary/cache.md) - complementary performance optimization
- [Configuration](@/glossary/configuration.md) - pool configuration management
- [Circuit Breaker](@/glossary/circuit-breaker.md) - failure protection for connections
- [Concurrency](@/glossary/concurrency.md) - concurrent connection usage patterns
- **Livebooks**: `livebooks/domains/storage_data/` - pool performance benchmarking
- **Academy**: Database optimization and connection management

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
