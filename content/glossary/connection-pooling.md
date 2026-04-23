+++
title = "Connection Pooling"
weight = 49
[extra]
category = "storage"
description = "Managed database connection reuse for performance and resource efficiency across heterogeneous storage backends"
acronym = ""
domain = "infrastructure"
complexity = "intermediate"
stability = "stable"
since_version = "1.0.0"
enforcement_level = "mandatory"
related_terms = ["adapter-pattern", "ets", "genserver", "supervision-tree", "redis", "duckdb", "postgresql", "ecto", "circuit-breaker", "process-isolation", "observability", "backpressure"]
platforms = ["elixir", "erlang", "otp"]
use_cases = ["database-access", "http-client", "cache-management", "search-indexing"]
libraries = ["db_connection", "nimble_pool", "finch", "redix"]
tags = ["performance", "resource-management", "concurrency", "fault-tolerance", "otp"]
see_also = ["connection-pooling", "postgresql", "ecto", "redis", "adapter-pattern"]
difficulty = "intermediate"
audience = ["backend-engineers", "database-administrators", "platform-architects"]
prerequisites = ["genserver", "supervision-tree", "otp"]
date_created = "2026-02-22"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 972
date_modified = "2026-02-23"
keywords = ["Connection", "Pooling", "Managed", "glossary", "storage", "Prismatic Platform", "DBConnection", "PostgreSQL"]
quality_score = 80
image = "/images/sections/glossary.png"
image_alt = "Connection Pooling - Prismatic Platform"
+++

## Definition

Connection pooling is a resource management technique in which a set of pre-established database connections is maintained and reused across multiple client requests, rather than creating and destroying a connection for each individual operation. A pool manager allocates idle connections to requesting processes, tracks their usage, enforces timeouts, and returns connections to the pool after use. This eliminates the significant overhead of connection establishment -- TCP handshake, TLS negotiation, authentication exchange, and server-side session initialization -- transforming per-request costs into a one-time pool initialization cost.

In database-backed applications, connection pooling is not merely an optimization but a necessity. Database servers impose hard limits on concurrent connections (PostgreSQL's default `max_connections` is 100), and each connection consumes server-side memory (typically 5-10 MB per PostgreSQL connection for work_mem, temp_buffers, and session state). Without pooling, a high-concurrency application would either exhaust connection limits (causing connection refusals) or require the database server to allocate excessive memory (causing OOM conditions or swap thrashing). Connection pooling bounds resource consumption to a configurable maximum while multiplexing application-level concurrency across a smaller set of persistent connections.

The Elixir ecosystem addresses connection pooling through the `DBConnection` library, which provides a behaviour-based pooling framework that integrates with [Ecto](@/glossary/ecto.md), Redix, and other database client libraries. DBConnection's pool is implemented as a set of supervised processes, leveraging [OTP](@/glossary/otp.md)'s fault tolerance to automatically recover from connection failures, handle process crashes, and maintain pool health without manual intervention.

## Historical Context

Connection pooling emerged as a necessity in the mid-1990s when web applications began serving hundreds or thousands of concurrent users. Early web architectures established a fresh database connection for every HTTP request, a pattern that worked at low concurrency but collapsed under load. The overhead of establishing a TCP connection, performing TLS negotiation, and completing the database authentication handshake added 20-50ms per request -- latency that dwarfed the actual query execution time for simple operations.

The first connection pool implementations appeared in Java application servers (WebLogic, JBoss) and later in standalone libraries like Apache Commons DBCP and HikariCP. These pools managed a fixed set of JDBC connections, checking them out to request-handling threads and returning them after use. The pattern proved so effective that it became a default feature of every major application framework.

In the Erlang and Elixir ecosystem, connection pooling took a different form due to the process-based concurrency model. Rather than sharing connections across threads (with all the locking complexity that entails), Elixir pools manage connections as independent processes, each owning its own database socket. The pool itself is a process that coordinates checkout and checkin operations through message passing, eliminating the need for mutexes, semaphores, or other locking primitives. This process-based approach aligns naturally with [OTP](@/glossary/otp.md) supervision trees, enabling automatic recovery from connection failures.

## Connection Lifecycle

Understanding the lifecycle of a pooled connection is essential for proper configuration and debugging.

### Without Pooling (Per-Request)

```
Request 1: [TCP connect -> TLS -> Auth -> Query -> Close] = ~50ms overhead
Request 2: [TCP connect -> TLS -> Auth -> Query -> Close] = ~50ms overhead
Request 3: [TCP connect -> TLS -> Auth -> Query -> Close] = ~50ms overhead
Total overhead: ~150ms for 3 requests
```

### With Pooling (Reused Connections)

```
Pool init:  [TCP connect -> TLS -> Auth] x pool_size  (one-time cost)
Request 1:  [Checkout -> Query -> Checkin]              = ~0.1ms overhead
Request 2:  [Checkout -> Query -> Checkin]              = ~0.1ms overhead
Request 3:  [Checkout -> Query -> Checkin]              = ~0.1ms overhead
Total overhead: ~0.3ms for 3 requests (500x reduction)
```

### Checkout/Checkin Lifecycle

| Phase | Description | Duration | Failure Mode |
|-------|-------------|----------|--------------|
| **Checkout** | Pool allocates idle connection to requesting process | Microseconds (idle available) or blocks (all busy) | Timeout if pool exhausted |
| **Validation** | Optional health check (ping) before use | < 1ms | Connection recycled if unhealthy |
| **Execution** | Client performs database operations | Variable | Connection marked as failed |
| **Checkin** | Connection returned to idle pool | Microseconds | Automatic on process exit |
| **Recycling** | Connection destroyed and replaced after max lifetime | Background | Transparent to clients |

## DBConnection Architecture

DBConnection is the standard Elixir library for connection pooling, providing a behaviour that database adapters implement. It serves as the pooling layer for [Ecto](@/glossary/ecto.md) (PostgreSQL, MySQL), Redix ([Redis](@/glossary/redis.md)), and other database clients.

```elixir
defmodule PrismaticStorage.PooledConnection do
  @moduledoc """
  Behaviour-based connection pool implementation using DBConnection.
  Manages the full lifecycle of database connections including
  establishment, health checking, checkout/checkin, and teardown.
  """

  @behaviour DBConnection

  @type state :: %{
    socket: :gen_tcp.socket(),
    buffer: binary(),
    connected_at: DateTime.t(),
    queries_executed: non_neg_integer()
  }

  @impl true
  @spec connect(keyword()) :: {:ok, state()} | {:error, term()}
  def connect(opts) do
    host = Keyword.fetch!(opts, :hostname)
    port = Keyword.get(opts, :port, 5432)

    case :gen_tcp.connect(String.to_charlist(host), port, [:binary, active: false]) do
      {:ok, socket} ->
        {:ok, %{
          socket: socket,
          buffer: <<>>,
          connected_at: DateTime.utc_now(),
          queries_executed: 0
        }}

      {:error, reason} ->
        {:error, {:connection_failed, reason}}
    end
  end

  @impl true
  @spec checkout(state()) :: {:ok, state()} | {:disconnect, term(), state()}
  def checkout(state) do
    {:ok, state}
  end

  @impl true
  @spec checkin(state()) :: {:ok, state()} | {:disconnect, term(), state()}
  def checkin(state) do
    {:ok, state}
  end

  @impl true
  @spec ping(state()) :: {:ok, state()} | {:disconnect, term(), state()}
  def ping(state) do
    case :gen_tcp.send(state.socket, <<0>>) do
      :ok -> {:ok, state}
      {:error, reason} -> {:disconnect, reason, state}
    end
  end

  @impl true
  @spec disconnect(term(), state()) :: :ok
  def disconnect(_error, state) do
    :gen_tcp.close(state.socket)
    :ok
  end
end
```

### Pool Implementation Details

DBConnection uses a queue-based pool where checkout requests are served in FIFO order when all connections are busy. The internal architecture consists of several cooperating processes.

```
Pool (size=5):
  +-------------------------------------+
  |  Idle: [conn1, conn2, conn3]        |
  |  Busy: [conn4 -> ProcA, conn5 -> ProcB] |
  |  Queue: [ProcC waiting, ProcD waiting] |
  +-------------------------------------+

  ProcA completes -> conn4 returned to idle
  ProcC dequeued -> conn4 checked out to ProcC
```

The pool monitors every process that checks out a connection. If a process crashes or exits without explicitly returning the connection, the pool detects the EXIT signal via process monitoring and automatically reclaims the connection. This prevents connection leaks that are a common problem in thread-based pool implementations where a thread exception can leave a connection in an indeterminate state.

## Pool Sizing Strategies

Choosing the correct pool size is critical: too small causes checkout timeouts and request queuing, too large wastes database server resources and may exceed `max_connections`.

### Sizing Formula

A practical starting point for [PostgreSQL](@/glossary/postgresql.md) pool sizing:

```
pool_size = (2 x cpu_cores) + spindle_count
```

For SSD-based systems (no spindles), the simplified formula is:

```
pool_size = 2 x cpu_cores + 1
```

### Factors Affecting Pool Size

| Factor | Impact | Recommendation |
|--------|--------|----------------|
| **Query duration** | Longer queries hold connections longer | Increase pool for slow queries |
| **Concurrency** | More concurrent processes need more connections | pool_size >= expected concurrent queries |
| **Transaction scope** | Transactions hold connections for their duration | Minimize transaction scope |
| **DB max_connections** | Hard server-side limit (sum of all pools) | Sum of all pool sizes < max_connections |
| **Memory per connection** | ~5-10MB per PostgreSQL connection | Balance pool size vs server memory |
| **Network latency** | Remote databases increase checkout duration | Increase pool for high-latency links |

### Prismatic Multi-Pool Configuration

The Prismatic Platform operates 115 umbrella applications, each potentially configuring its own pool. The total connection budget must be managed across all applications.

```elixir
defmodule PrismaticStorage.PoolConfig do
  @moduledoc """
  Centralized pool configuration management for the Prismatic Platform.
  Ensures total connection count across all applications stays within
  the database server's max_connections limit.
  """

  @type pool_config :: %{
    pool_size: pos_integer(),
    queue_target: pos_integer(),
    queue_interval: pos_integer(),
    idle_interval: pos_integer()
  }

  @spec config_for(atom()) :: {:ok, pool_config()} | {:error, term()}
  def config_for(:prismatic_perimeter) do
    {:ok, %{
      pool_size: 10,
      queue_target: 50,
      queue_interval: 1000,
      idle_interval: 1000
    }}
  end

  def config_for(:prismatic_storage_ecto) do
    {:ok, %{
      pool_size: 20,
      queue_target: 50,
      queue_interval: 1000,
      idle_interval: 1000
    }}
  end

  def config_for(:prismatic_web) do
    {:ok, %{
      pool_size: 15,
      queue_target: 100,
      queue_interval: 1000,
      idle_interval: 1000
    }}
  end

  @spec total_connections() :: non_neg_integer()
  def total_connections do
    all_configs()
    |> Enum.map(fn {_app, config} -> config.pool_size end)
    |> Enum.sum()
  end

  @spec validate_budget(non_neg_integer()) :: :ok | {:error, :budget_exceeded}
  def validate_budget(max_connections) do
    total = total_connections()

    if total < max_connections * 0.9 do
      :ok
    else
      {:error, :budget_exceeded}
    end
  end
end
```

### Queue Management

DBConnection implements adaptive queue management using `queue_target` and `queue_interval` parameters. If the median checkout time exceeds `queue_target` within `queue_interval`, the pool enters a degraded mode and begins rejecting new checkout requests to prevent cascading latency.

| Parameter | Default | Purpose |
|-----------|---------|---------|
| `pool_size` | 10 | Maximum concurrent connections |
| `queue_target` | 50ms | Target checkout queue time |
| `queue_interval` | 1000ms | Measurement window for queue health |
| `idle_interval` | 1000ms | How often to ping idle connections |
| `pool_overflow` | 0 | Additional connections allowed beyond pool_size |
| `timeout` | 15000ms | Maximum time to wait for checkout |

## NimblePool

For non-database connection pools (HTTP clients, gRPC channels), the Prismatic Platform uses NimblePool, a lightweight pool implementation from the Elixir core team that provides lower overhead than DBConnection for simpler use cases.

```elixir
defmodule PrismaticOsint.HttpPool do
  @moduledoc """
  HTTP connection pool for OSINT provider API calls.
  Uses NimblePool for lightweight connection management
  with Mint HTTP client for HTTP/2 support.
  """

  @behaviour NimblePool

  @impl true
  @spec init_worker(map()) :: {:ok, Mint.HTTP.t(), map()}
  def init_worker(pool_state) do
    {:ok, conn} = Mint.HTTP.connect(:https, pool_state.host, 443)
    {:ok, conn, pool_state}
  end

  @impl true
  def handle_checkout(:checkout, {_pid, _ref}, conn, pool_state) do
    {:ok, conn, conn, pool_state}
  end

  @impl true
  def handle_checkin(conn, _old_conn, pool_state) do
    {:ok, conn, pool_state}
  end

  @impl true
  def terminate_worker(_reason, conn, pool_state) do
    Mint.HTTP.close(conn)
    {:ok, pool_state}
  end
end
```

### DBConnection vs NimblePool

| Dimension | DBConnection | NimblePool |
|-----------|-------------|------------|
| **Use case** | Database connections | General resource pooling |
| **Transaction support** | Full (begin/commit/rollback) | None |
| **Prepared statements** | Supported | N/A |
| **Overhead** | Moderate (full lifecycle) | Minimal |
| **Queue management** | Adaptive (queue_target) | Simple FIFO |
| **Ecosystem integration** | [Ecto](@/glossary/ecto.md), Redix, etc. | Finch, custom pools |
| **Process monitoring** | Automatic | Manual |
| **Health checking** | Built-in ping | Manual implementation |

## Multi-Backend Pool Architecture

The Prismatic Platform's [adapter pattern](@/glossary/adapter-pattern.md) means multiple storage backends each maintain independent connection pools, supervised within the OTP application tree.

```
Application Supervisor
+-- PostgreSQL Pool (DBConnection, pool_size: 20)
|   +-- Connection 1..20
|   +-- Queue Manager
+-- Redis Pool (Redix, pool_size: 5)
|   +-- Connection 1..5
|   +-- Sentinel Monitor
+-- HTTP Client Pool (NimblePool via Finch, pool_size: 50)
|   +-- Connection 1..50 (keep-alive)
|   +-- Per-Host Sub-Pools
+-- Meilisearch Pool (HTTP, pool_size: 5)
    +-- Connection 1..5
```

Each pool is supervised independently, meaning a [PostgreSQL](@/glossary/postgresql.md) connection failure triggers pool recovery without affecting [Redis](@/glossary/redis.md) or HTTP pools. This isolation is a direct consequence of [process isolation](@/glossary/process-isolation.md) in the [BEAM](@/glossary/beam.md) runtime.

## Fault Tolerance and Recovery

Connection pools in Elixir benefit from OTP's [supervision tree](@/glossary/supervision-tree.md) model for automatic failure recovery.

| Failure Scenario | Pool Behavior | Recovery Mechanism |
|-----------------|---------------|-------------------|
| Single connection crash | Connection removed from pool | Supervisor restarts connection process |
| Database server restart | All connections fail | Pool detects via ping, reconnects |
| Network partition | Connections timeout | Connections recycled, new ones established |
| Pool process crash | Entire pool restarts | Supervisor restarts pool with initial configuration |
| Client process crash | Checked-out connection orphaned | DBConnection monitors client process, auto-checkin on exit |

The client process monitoring is particularly important: if a process checks out a connection and then crashes (due to an unhandled exception, for example), DBConnection detects the process exit via monitoring and automatically returns the connection to the pool. This prevents connection leaks that plague connection pool implementations in languages without process monitoring.

## External Pool Proxies

In production deployments, application-level connection pools often work in conjunction with external connection pool proxies like PgBouncer or Odyssey. These proxies sit between the application and the database server, providing an additional layer of connection multiplexing.

| Component | Role | Connection Management |
|-----------|------|----------------------|
| **Application Pool (DBConnection)** | Per-application connection management | Pools within each BEAM node |
| **PgBouncer** | Cross-application connection multiplexing | Pools across all applications |
| **PostgreSQL** | Database server | Manages actual server-side sessions |

The combination of application-level pooling (DBConnection) and proxy-level pooling (PgBouncer) enables architectures where hundreds of application instances each maintain small pools (5-10 connections) that are multiplexed through PgBouncer into a smaller number of actual database connections. This is particularly relevant for the Prismatic Platform's [Fly.io](@/glossary/fly-io.md) deployment where multiple instances run simultaneously.

## Monitoring and Diagnostics

Connection pool health is a critical operational concern. The Prismatic Platform monitors pool metrics through Telemetry events emitted by DBConnection.

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| `pool.checkout.duration` | Time waiting for a connection | > 100ms (P95) |
| `pool.checkout.queue_time` | Time spent in queue specifically | > 50ms (P95) |
| `pool.size` | Current pool utilization (busy/idle) | > 90% busy sustained |
| `pool.timeouts` | Checkout timeout count | > 0 per minute |
| `pool.disconnects` | Connection failure count | > 5 per minute |
| `pool.idle_time` | How long connections sit idle | < 1s (pool oversized) |

```elixir
defmodule PrismaticStorage.PoolTelemetry do
  @moduledoc """
  Telemetry handler for connection pool monitoring.
  Emits alerts when pool health degrades beyond configured thresholds.
  """

  @spec attach() :: :ok
  def attach do
    :telemetry.attach(
      "pool-monitor",
      [:prismatic, :repo, :query],
      &handle_event/4,
      nil
    )
  end

  @spec handle_event(atom(), map(), map(), term()) :: :ok
  def handle_event(_name, measurements, metadata, _config) do
    if measurements.queue_time > 50_000_000 do
      Logger.warning("Pool queue time elevated",
        repo: metadata.repo,
        queue_time_ms: System.convert_time_unit(measurements.queue_time, :native, :millisecond)
      )
    end

    :ok
  end
end
```

## Connection Pooling Anti-Patterns

| Anti-Pattern | Problem | Solution |
|-------------|---------|----------|
| Pool size = max_connections | No room for admin connections | Reserve 10-20% for admin/monitoring |
| Long-held transactions | Starves other processes | Minimize transaction scope, use advisory locks |
| No checkout timeout | Process blocks indefinitely | Set explicit timeout (15s default) |
| Pooling for [ETS](@/glossary/ets.md) | Unnecessary overhead (no connections) | Use ETS directly (no pool needed) |
| Same pool size for all apps | Over/under provisioning | Tune per-app based on actual concurrency |
| Ignoring pool metrics | Silent degradation | Monitor checkout times and queue depth |
| No connection recycling | Stale connections accumulate | Set max_lifetime to periodically refresh |
| Unbounded overflow | Memory exhaustion under load | Cap pool_overflow or use adaptive queuing |

## Best Practices

1. **Size pools based on actual concurrency measurements.** Start with the formula `2 * cpu_cores + 1` and adjust based on observed checkout queue times and pool utilization metrics. Over-provisioning wastes database resources; under-provisioning causes request queuing.

2. **Monitor pool health continuously.** Attach Telemetry handlers to track checkout duration, queue depth, and timeout frequency. Set alerts at P95 checkout time > 100ms and any timeout events.

3. **Use separate pools for different workloads.** Long-running analytical queries should not share a pool with fast transactional queries. Separate pools prevent slow queries from starving fast queries of connections.

4. **Set explicit checkout timeouts.** The default 15-second timeout is appropriate for most workloads. For latency-sensitive operations, reduce the timeout and handle the timeout error gracefully rather than waiting indefinitely.

5. **Validate total connection budget across all applications.** Sum the pool_size of every application's configuration and verify it stays below the database's max_connections minus a 10-20% reserve for administrative connections.

6. **Recycle connections periodically.** Even healthy connections can accumulate server-side state (temporary tables, prepared statements, session variables) that leaks memory. Set a maximum connection lifetime to periodically replace connections with fresh ones.

## Common Pitfalls

- **Assuming pool size equals concurrency capacity.** The actual concurrency capacity depends on query duration. A pool of 10 connections handling 1ms queries supports 10,000 queries/second, but the same pool handling 100ms queries supports only 100 queries/second.

- **Ignoring connection establishment cost during pool startup.** When the application starts, all pool connections are established simultaneously, which can overwhelm the database if multiple application instances start concurrently (as in a rolling deployment). Stagger connection establishment or use lazy initialization.

- **Not accounting for transaction duration.** Transactions hold connections for their entire duration. A transaction that performs an HTTP call to an external service holds a database connection idle for the entire network round-trip, effectively reducing pool capacity.

- **Using connection pooling for ETS or in-memory stores.** [ETS](@/glossary/ets.md) tables are accessed directly from the calling process's memory space. There is no connection to pool. Wrapping ETS access in a pool adds unnecessary overhead and serialization.

## Related Terms

- [PostgreSQL](@/glossary/postgresql.md) - Primary relational database requiring connection pooling
- [Ecto](@/glossary/ecto.md) - Database wrapper integrating with DBConnection pooling
- [Redis](@/glossary/redis.md) - Cache and pub/sub backend using Redix connection pools
- [Adapter Pattern](@/glossary/adapter-pattern.md) - Storage abstraction where each adapter manages its own connection pool
- [ETS](@/glossary/ets.md) - In-memory storage that avoids connection overhead entirely
- [GenServer](@/glossary/genserver.md) - Process model underlying pool management and connection tracking
- [Supervision Tree](@/glossary/supervision-tree.md) - Fault tolerance ensuring connection pools recover from failures
- [Circuit Breaker](@/glossary/circuit-breaker.md) - Complementary pattern preventing cascading failures from database outages
- [Process Isolation](@/glossary/process-isolation.md) - BEAM property enabling independent pool failure recovery
- [Observability](@/glossary/observability.md) - Monitoring infrastructure for pool health metrics
- [BEAM](@/glossary/beam.md) - Virtual machine providing process-based concurrency for pool implementation
- [Backpressure](@/glossary/backpressure.md) - Flow control mechanism complementing pool queue management

## See Also

- [Architecture](@/architecture/_index.md) - Platform architecture and multi-backend storage topology
- [Technologies](@/technologies/_index.md) - Technology stack details for database and caching backends
- [Apps](@/apps/_index.md) - Umbrella applications with per-app pool configurations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
