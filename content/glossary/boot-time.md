+++
title = "Boot Time"
weight = 50
[extra]
tags = ["glossary", "performance", "otp", "startup", "supervision", "elixir", "beam"]
description = "System boot time encompasses the full lifecycle of application startup in OTP-based systems, from BEAM VM initialization through supervision tree construction to full operational readiness, including dependency-aware startup orchestration in the Prismatic Platform"
category = "performance"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
difficulty = "advanced"
quality_score = 95
related_terms = ["supervision-tree", "otp", "beam-vm", "genserver", "dynamic-supervisor", "health-monitoring", "fault-tolerance", "performance", "latency", "application", "elixir", "erlang", "process-isolation", "telemetry"]
learning_outcomes = ["Understand OTP application start phases and boot sequence mechanics", "Implement dependency-aware startup with PrismaticSupervisor", "Measure and optimize boot time in production Elixir releases", "Design supervision trees that minimize startup latency", "Apply boot-time health checks and readiness probes"]
prerequisites = ["otp", "supervision-tree", "genserver", "elixir"]
key_concepts = ["OTP application callback", "start phases", "dependency graph resolution", "supervision tree construction", "readiness probes", "boot telemetry"]
see_also = ["supervision-tree", "fault-tolerance", "health-monitoring", "telemetry", "performance"]
date_created = "2026-02-22"
date_updated = "2026-02-22"
version = "2.0.0"
platform_relevance = "critical"
elixir_version = "1.19+"
otp_version = "27+"
word_count = 1785
date_modified = "2026-02-23"
keywords = ["Boot", "Time", "System", "OTP-based", "BEAM", "Prismatic", "Platform", "glossary", "performance", "Prismatic Platform"]
image = "/images/sections/glossary.png"
image_alt = "Boot Time - Prismatic Platform"
+++

## Definition

Boot time refers to the total elapsed duration from the moment a system begins its initialization sequence until it reaches full operational readiness and can serve its intended workload. In the context of OTP-based Elixir applications, boot time encompasses BEAM VM startup, application loading and dependency resolution, supervision tree construction, process spawning, state initialization, and health check validation. Unlike simple process start time, boot time in distributed systems must account for ordered dependency graphs, external service connectivity, data preloading, and coordinated multi-node startup sequences.

In the Prismatic Platform, boot time is a first-class performance metric governed by the [performance](@/glossary/performance.md) standards that mandate sub-250ms page loads and sub-100ms server-side rendering. The platform's 115-application umbrella architecture makes boot-time optimization particularly challenging, requiring sophisticated dependency-aware startup orchestration through the PrismaticSupervisor system.

## Historical Context and Evolution

The concept of boot time has evolved significantly across computing eras. Early mainframe systems measured boot time in minutes as hardware self-tests, firmware loading, and operating system initialization consumed substantial wall-clock time. The advent of microservices and container orchestration shifted the conversation toward application-level boot time, where individual service instances must start quickly to support elastic scaling, rolling deployments, and fault recovery.

In the Erlang/OTP ecosystem, boot time has always held special significance. The BEAM virtual machine was designed for telecommunications systems where uptime requirements of 99.999% (five nines) meant that even restart scenarios during failure recovery needed to be extraordinarily fast. OTP applications leverage a structured startup sequence that separates concerns: the VM boots first, then applications start in dependency order, each constructing its supervision tree before signaling readiness. This phased approach provides both reliability and observability during the boot process.

The Prismatic Platform's evolution from a single application to a 115-app umbrella ecosystem forced a fundamental rethinking of boot-time management. Early generations used simple linear startup, but as the application count grew, boot times degraded to unacceptable levels. Generation 12 introduced PrismaticSupervisor with dependency-aware parallel startup, reducing boot time by approximately 60% while maintaining correctness guarantees.

## OTP Application Start Phases

Every OTP [application](@/glossary/application.md) follows a well-defined startup lifecycle managed by the Application behaviour. Understanding these phases is essential for optimizing boot time.

### Phase 1: Application Loading

The BEAM VM reads the `.app` resource file for each application, building an in-memory representation of the application specification. This includes the application name, version, registered processes, included applications, and critically, the list of dependent applications that must start first. The dependency graph is validated at this stage, and circular dependencies cause immediate failure.

### Phase 2: Dependency Resolution

OTP resolves the full transitive closure of application dependencies, constructing a directed acyclic graph (DAG) that determines start order. For the Prismatic Platform, this DAG includes approximately 85 OTP applications (both platform and library applications). The resolution algorithm is deterministic: given the same dependency declarations, the same start order is always produced.

### Phase 3: Sequential Application Start

By default, OTP starts applications sequentially in dependency order. Each application's `start/2` callback is invoked, which typically starts the root [supervisor](@/glossary/supervisor.md). The callback must return `{:ok, pid}` or `{:ok, pid, state}` before the next application can begin. This sequential guarantee ensures that when an application starts, all its dependencies are already operational.

### Phase 4: Supervision Tree Construction

Within each application, the [supervision tree](@/glossary/supervision-tree.md) is constructed recursively. The root supervisor starts its children according to their `child_spec` definitions, respecting the configured strategy (`:one_for_one`, `:one_for_all`, `:rest_for_one`). Each child process initializes its state via `init/1` before the supervisor proceeds to the next child.

### Phase 5: Post-Start Initialization

Some processes require asynchronous initialization after the supervision tree is running. This includes connecting to external databases, warming caches, loading configuration from remote sources, or establishing cluster connections. These operations run concurrently with the rest of the boot sequence and are tracked through readiness probes.

## Prismatic Platform Boot Architecture

The Prismatic Platform implements a sophisticated boot architecture through PrismaticSupervisor that extends standard OTP application startup with dependency-aware parallelization, health monitoring, and boot telemetry.

```elixir
defmodule PrismaticSupervisor do
  @moduledoc """
  Dependency-aware compositional supervisor that orchestrates startup
  across the Prismatic Platform's 115-application umbrella ecosystem.

  Implements parallel startup within dependency layers, ensuring that
  applications start as early as possible while respecting ordering
  constraints from the dependency graph.
  """

  use Supervisor

  @spec start_link(keyword()) :: Supervisor.on_start()
  def start_link(opts) do
    Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec init(keyword()) :: {:ok, {Supervisor.sup_flags(), [Supervisor.child_spec()]}}
  def init(opts) do
    boot_config = Keyword.get(opts, :boot_config, default_boot_config())

    children =
      boot_config
      |> PrismaticSupervisor.DependencyResolver.resolve()
      |> PrismaticSupervisor.BootPlanner.plan()
      |> Enum.map(&child_spec_for_domain/1)

    Supervisor.init(children, strategy: :one_for_one)
  end
end
```

### Dependency Graph Resolution

PrismaticSupervisor constructs a dependency graph that goes beyond OTP's application-level dependencies. It models domain-level dependencies between logical groupings of applications, enabling parallel startup of independent domains.

```elixir
defmodule PrismaticSupervisor.DependencyResolver do
  @moduledoc """
  Resolves dependency ordering for domain supervisors by constructing
  a directed acyclic graph and computing topological layers for
  maximum parallelism during boot.
  """

  @type dependency_graph :: %{domain_name() => [domain_name()]}
  @type domain_name :: atom()
  @type layer :: [domain_name()]

  @spec resolve(map()) :: [layer()]
  def resolve(boot_config) do
    boot_config
    |> build_graph()
    |> validate_acyclic!()
    |> compute_layers()
  end

  @spec compute_layers(dependency_graph()) :: [layer()]
  defp compute_layers(graph) do
    graph
    |> topological_sort()
    |> group_by_depth()
  end

  @spec validate_acyclic!(dependency_graph()) :: dependency_graph()
  defp validate_acyclic!(graph) do
    case detect_cycles(graph) do
      [] -> graph
      cycles -> raise "Circular dependencies detected: #{inspect(cycles)}"
    end
  end
end
```

### Parallel Layer Startup

Applications within the same dependency layer have no ordering constraints between them and can start concurrently. PrismaticSupervisor uses `Task.async_stream/3` with configurable concurrency to start entire layers in parallel while maintaining sequential ordering between layers.

```elixir
defmodule PrismaticSupervisor.BootPlanner do
  @moduledoc """
  Plans the boot sequence by organizing domain supervisors into
  parallel execution layers. Each layer completes before the next begins.
  """

  @spec plan([DependencyResolver.layer()]) :: [domain_spec()]
  def plan(layers) do
    layers
    |> Enum.with_index()
    |> Enum.flat_map(fn {layer, index} ->
      Enum.map(layer, &%{domain: &1, layer: index, parallel: true})
    end)
  end

  @spec execute_layer([domain_spec()], keyword()) :: [:ok | {:error, term()}]
  def execute_layer(domains, opts \\ []) do
    timeout = Keyword.get(opts, :timeout, 30_000)
    max_concurrency = Keyword.get(opts, :max_concurrency, System.schedulers_online())

    domains
    |> Task.async_stream(
      fn domain -> start_domain(domain, timeout) end,
      max_concurrency: max_concurrency,
      timeout: timeout
    )
    |> Enum.map(fn
      {:ok, result} -> result
      {:exit, reason} -> {:error, {:boot_timeout, reason}}
    end)
  end
end
```

## Boot Time Measurement and Telemetry

Accurate boot-time measurement requires instrumentation at multiple levels. The Prismatic Platform uses the [telemetry](@/glossary/telemetry.md) library to emit boot events that are captured by monitoring infrastructure.

```elixir
defmodule PrismaticSupervisor.BootTelemetry do
  @moduledoc """
  Emits telemetry events during the boot sequence for observability
  and performance tracking. Events are consumed by the platform's
  monitoring infrastructure for alerting and dashboarding.
  """

  @spec emit_boot_start(map()) :: :ok
  def emit_boot_start(metadata) do
    :telemetry.execute(
      [:prismatic, :boot, :start],
      %{system_time: System.system_time(:millisecond)},
      metadata
    )
  end

  @spec emit_boot_complete(map(), non_neg_integer()) :: :ok
  def emit_boot_complete(metadata, duration_ms) do
    :telemetry.execute(
      [:prismatic, :boot, :complete],
      %{
        duration_ms: duration_ms,
        system_time: System.system_time(:millisecond)
      },
      metadata
    )
  end

  @spec emit_domain_start(atom(), non_neg_integer()) :: :ok
  def emit_domain_start(domain, layer) do
    :telemetry.execute(
      [:prismatic, :boot, :domain, :start],
      %{system_time: System.system_time(:millisecond)},
      %{domain: domain, layer: layer}
    )
  end
end
```

### Key Boot Metrics

| Metric | Description | Target | Alert Threshold |
|--------|-------------|--------|-----------------|
| `boot.total_duration_ms` | Full boot sequence time | < 5,000 ms | > 10,000 ms |
| `boot.domain.duration_ms` | Per-domain startup time | < 2,000 ms | > 5,000 ms |
| `boot.layer.duration_ms` | Per-layer parallel start time | < 3,000 ms | > 7,000 ms |
| `boot.dependency_resolution_ms` | Graph resolution time | < 50 ms | > 200 ms |
| `boot.readiness_probe_ms` | Time to first healthy probe | < 8,000 ms | > 15,000 ms |

## Optimization Strategies

### Strategy 1: Lazy Initialization

Not all state needs to be available at boot time. Processes can defer expensive initialization until first use, reporting themselves as "started but warming" during the boot phase.

```elixir
defmodule PrismaticStorage.CacheWarmer do
  @moduledoc """
  Demonstrates lazy initialization pattern where the GenServer
  starts immediately but defers cache warming to a background task,
  reducing boot-time impact while ensuring eventual readiness.
  """

  use GenServer

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl GenServer
  @spec init(keyword()) :: {:ok, map()}
  def init(opts) do
    # Start immediately, warm cache asynchronously
    send(self(), :warm_cache)
    {:ok, %{status: :warming, opts: opts, cache: %{}}}
  end

  @impl GenServer
  def handle_info(:warm_cache, state) do
    cache = load_cache_data(state.opts)
    {:noreply, %{state | status: :ready, cache: cache}}
  end
end
```

### Strategy 2: Parallel ETS Table Creation

[ETS](@/glossary/ets.md) table creation is a synchronous operation that blocks the creating process. When multiple applications need ETS tables, creating them in parallel within a dedicated boot phase significantly reduces aggregate boot time.

### Strategy 3: Connection Pool Pre-warming

Database connection pools, HTTP client pools, and other resource pools can start with minimum connections and scale up asynchronously rather than blocking boot while establishing the full pool.

### Strategy 4: Configuration Caching

Loading configuration from external sources (environment variables, config files, remote config servers) can be expensive. The platform caches resolved configuration in ETS during the first boot, allowing subsequent restarts to use cached values while asynchronously refreshing.

## Boot Time in Distributed Systems

When the Prismatic Platform runs across multiple nodes in a [cluster](@/glossary/cluster.md), boot time takes on additional dimensions. Each node must not only complete its local boot sequence but also discover peers, establish connections, synchronize distributed state, and negotiate leadership for global resources.

### Node Discovery Phase

After local boot completes, nodes use the configured discovery strategy (DNS, Kubernetes API, hardcoded seeds) to find peers. This phase adds variable latency depending on the network environment and discovery mechanism.

### State Synchronization Phase

Distributed data structures like Horde registries, CRDTs, and distributed ETS tables must synchronize their state across the cluster before the node is fully operational. This synchronization period is the primary contributor to distributed boot time variance.

### Rolling Restart Considerations

During rolling deployments, the cluster must maintain availability while individual nodes restart. Boot time directly impacts the deployment speed and the duration of reduced cluster capacity. The platform's target is for any single node to complete its full boot sequence (including cluster join) within 15 seconds.

## Health Checks and Readiness Probes

Boot time measurement alone is insufficient without readiness validation. The platform implements a multi-level health check system that distinguishes between "started" and "ready" states, integrating with [health monitoring](@/glossary/health-monitoring.md) infrastructure.

```elixir
defmodule PrismaticSupervisor.ReadinessProbe do
  @moduledoc """
  Implements readiness probing for the boot sequence. A node is
  considered ready only when all critical domain supervisors report
  healthy status and all readiness conditions are met.
  """

  @type readiness_status :: :not_started | :booting | :warming | :ready | :degraded

  @spec check_readiness() :: {readiness_status(), map()}
  def check_readiness do
    checks = [
      {:supervision_trees, check_supervision_trees()},
      {:database_connections, check_database_pools()},
      {:cache_state, check_cache_warmth()},
      {:cluster_membership, check_cluster_state()}
    ]

    status = derive_status(checks)
    {status, Map.new(checks)}
  end

  @spec derive_status([{atom(), :ok | :degraded | :failed}]) :: readiness_status()
  defp derive_status(checks) do
    cond do
      Enum.all?(checks, fn {_, s} -> s == :ok end) -> :ready
      Enum.any?(checks, fn {_, s} -> s == :failed end) -> :booting
      true -> :degraded
    end
  end
end
```

## Production Boot Time Analysis

The following data represents typical boot-time profiles for the Prismatic Platform in production (Fly.io deployment):

| Boot Phase | Duration (P50) | Duration (P99) | Notes |
|-----------|----------------|-----------------|-------|
| BEAM VM start | 120 ms | 180 ms | Includes scheduler initialization |
| OTP app loading | 450 ms | 620 ms | 85 applications loaded |
| Dependency resolution | 15 ms | 25 ms | Graph with ~200 edges |
| Layer 0 (core) | 280 ms | 410 ms | Storage, config, telemetry |
| Layer 1 (infrastructure) | 520 ms | 780 ms | Database pools, caches |
| Layer 2 (domain) | 380 ms | 550 ms | Business logic domains |
| Layer 3 (presentation) | 190 ms | 290 ms | Web endpoints, API |
| Layer 4 (agents) | 440 ms | 680 ms | AIAD agent initialization |
| Readiness probe pass | 850 ms | 1,400 ms | Full health validation |
| **Total boot time** | **3,245 ms** | **4,935 ms** | **End-to-end** |

## Failure Modes and Recovery

Boot-time failures require careful handling because the system is in a partially initialized state. OTP provides several mechanisms for dealing with boot failures.

### Application Start Failure

If an application's `start/2` callback returns `{:error, reason}`, OTP halts the boot sequence and reports the failure. The platform's deployment orchestrator (Fly.io) detects this as a failed health check and rolls back the deployment.

### Supervision Tree Crash During Boot

If a child process crashes during initialization and the supervisor's restart intensity is exceeded, the supervisor itself crashes, propagating the failure upward. The root supervisor's failure causes the application start to fail, triggering the application start failure path.

### Timeout During Boot

PrismaticSupervisor enforces per-domain boot timeouts. If a domain exceeds its allocated boot time, the boot planner logs a critical telemetry event and can either continue (for non-critical domains) or abort the boot sequence (for critical infrastructure domains).

## Comparison with Other Ecosystems

| Ecosystem | Typical Boot Time | Startup Model | Hot Reload |
|-----------|-------------------|---------------|------------|
| Elixir/OTP | 2-5 seconds | Supervision tree, dependency-ordered | Yes (hot code reload) |
| JVM (Spring Boot) | 5-30 seconds | Classpath scanning, bean wiring | Limited (JRebel) |
| Node.js | 0.5-3 seconds | Module require chain | No (process restart) |
| Go | 10-100 ms | Simple main() initialization | No (process restart) |
| Python (Django) | 1-5 seconds | Module import chain, app registry | No (process restart) |

The Elixir/OTP model trades slightly longer boot time for dramatically better runtime characteristics: process isolation, fault tolerance through [let-it-crash](@/glossary/let-it-crash.md) philosophy, and hot code reload that eliminates most restart scenarios entirely.

## Testing Boot Time

Boot-time regression testing ensures that platform changes do not inadvertently degrade startup performance. The Prismatic Platform includes dedicated boot-time benchmarks in its CI/CD pipeline.

```elixir
defmodule PrismaticSupervisor.BootBenchmarkTest do
  @moduledoc """
  Benchmark tests that validate boot time remains within acceptable
  thresholds. Run as part of CI/CD performance gate.
  """

  use ExUnit.Case, async: false

  @boot_time_threshold_ms 10_000

  test "full platform boot completes within threshold" do
    {time_us, {:ok, _pid}} = :timer.tc(fn ->
      PrismaticSupervisor.start_link(boot_config: test_boot_config())
    end)

    time_ms = div(time_us, 1000)
    assert time_ms < @boot_time_threshold_ms,
      "Boot time #{time_ms}ms exceeds threshold #{@boot_time_threshold_ms}ms"
  end

  test "individual domain boot times are within bounds" do
    results = PrismaticSupervisor.BootPlanner.benchmark_layers()

    for {domain, duration_ms} <- results do
      assert duration_ms < 5_000,
        "Domain #{domain} boot time #{duration_ms}ms exceeds 5000ms threshold"
    end
  end
end
```

## Best Practices

1. **Measure before optimizing**: Instrument boot phases with telemetry before attempting optimization. Without measurement, optimization efforts are guesswork.

2. **Defer non-critical initialization**: Use `send(self(), :init)` patterns to defer expensive operations that are not required for the process to report as started.

3. **Parallel where possible**: Identify independent startup operations and execute them concurrently. PrismaticSupervisor's layer-based approach automates this.

4. **Fail fast on critical dependencies**: If a required database or external service is unavailable, fail immediately rather than retrying during boot. Let the orchestrator handle restarts.

5. **Cache resolved state**: Configuration, schema introspection results, and other boot-time computations should be cached between restarts when possible.

6. **Profile the dependency graph**: Regularly review the application dependency graph for unnecessary transitive dependencies that force sequential startup.

7. **Set boot-time budgets**: Assign time budgets to each domain and enforce them through CI/CD gates to prevent gradual boot-time regression.

## Related Concepts

- [Supervision Tree](@/glossary/supervision-tree.md) -- The hierarchical process structure constructed during boot
- [OTP](@/glossary/otp.md) -- The framework governing application start phases
- [BEAM VM](@/glossary/beam-vm.md) -- The virtual machine that hosts the boot sequence
- [GenServer](@/glossary/genserver.md) -- The primary process abstraction initialized during boot
- [Fault Tolerance](@/glossary/fault-tolerance.md) -- The resilience properties that boot design must preserve
- [Health Monitoring](@/glossary/health-monitoring.md) -- Post-boot readiness validation
- [Telemetry](@/glossary/telemetry.md) -- Instrumentation for boot-time measurement
- [Performance](@/glossary/performance.md) -- The broader performance framework governing boot targets
- [Dynamic Supervisor](@/glossary/dynamic-supervisor.md) -- Runtime child spawning that can defer boot-time work
- [Process Isolation](@/glossary/process-isolation.md) -- The BEAM property enabling independent process startup

## Further Reading

- Armstrong, Joe. "Making Reliable Distributed Systems in the Presence of Software Errors." PhD Thesis, Royal Institute of Technology, Stockholm, 2003.
- Hebert, Fred. "Designing for Scalability with Erlang/OTP." O'Reilly Media, 2016.
- The Erlang/OTP documentation on Application behaviour: `application(3)` man page.
- Prismatic Platform internal documentation: `apps/prismatic_supervisor/CLAUDE.md`

---

**Connect & Contribute**: Created by [Tomas Korcak (korczis)](https://github.com/korczis) | [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)
