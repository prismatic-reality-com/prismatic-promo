+++
title = "Bulkhead Pattern"
weight = 18
[extra]
category = "architecture"
description = "Failure isolation through resource compartmentalization preventing cascade failures across system boundaries"
related_terms = ["circuit-breaker", "supervision-tree", "fault-tolerance", "process-isolation", "let-it-crash", "backpressure", "genserver", "beam"]
tags = ["resilience", "fault-tolerance", "distributed-systems", "OTP", "architecture-pattern"]
difficulty = "advanced"
importance = "critical"
ecosystem = "elixir"
use_cases = ["microservices", "resource-isolation", "failure-containment", "capacity-management"]
prerequisites = ["supervision-tree", "process-isolation", "genserver"]
reading_time_minutes = 12
version = "2.0.0"
last_updated = "2026-02-22"
author = "Tomas Korcak"
platform_relevance = "core"
beam_specific = true
otp_pattern = true
production_tested = true
prismatic_usage = "extensive"
reading_time = "7 min"
word_count = 1486
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Bulkhead", "Pattern", "Failure", "glossary", "architecture", "Prismatic Platform", "Bulkheads", "BEAM", "Without"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Bulkhead Pattern - Prismatic Platform"
+++

## Definition and Overview

The Bulkhead pattern isolates system components into independent compartments so that a failure in one compartment does not cascade to others. Named after ship hull bulkheads that contain flooding to individual compartments, the pattern applies resource limits (thread pools, connection pools, process budgets) to prevent a failing component from consuming all shared resources. Bulkheads complement circuit breakers: while circuit breakers stop requests to failing services, bulkheads ensure a failing service cannot starve healthy services of resources.

The pattern originates from naval architecture, where watertight compartments in a ship's hull prevent a breach in one section from flooding the entire vessel. The Titanic, for example, had 16 watertight compartments and could survive flooding in up to four of them. Software systems face analogous risks: a single failing component can consume all available threads, connections, memory, or CPU, effectively sinking the entire system even though most components are healthy.

In distributed systems and microservice architectures, bulkheads are essential because failure is not a possibility but an inevitability. Network partitions, database overloads, third-party API timeouts, and resource exhaustion occur regularly. Without bulkheads, these localized failures propagate through shared resource pools, turning minor incidents into system-wide outages. The Bulkhead pattern accepts that failures will occur and focuses on containing their blast radius.

The BEAM virtual machine provides a uniquely powerful foundation for implementing bulkheads. Every BEAM process has its own heap, its own garbage collector, and its own failure domain. When a process crashes, it affects nothing else -- no shared memory is corrupted, no locks are orphaned, no file descriptors are leaked. This process-level isolation is far stronger than what thread-based systems offer, where a single segmentation fault can bring down the entire operating system process.

## Technical Deep Dive

### Types of Bulkheads

| Type | Mechanism | Isolation Level | Overhead | BEAM Support |
|------|-----------|----------------|----------|--------------|
| Thread Pool | Dedicated thread pools per component | Moderate | Memory for threads | N/A (BEAM uses schedulers) |
| Process Pool | Dedicated BEAM processes per component | Strong | Minimal (lightweight processes) | Native |
| Connection Pool | Separate connection pools per service | Moderate | Connection slots | Via Poolboy/NimblePool |
| Semaphore | Bounded concurrency permits per component | Light | Counter overhead | Via GenServer/Agent |
| Container | Separate OS containers per component | Complete | Full container overhead | Docker/Fly.io |
| Node | Separate BEAM nodes per component | Complete | Full VM overhead | Native distribution |
| Supervisor | Separate supervision subtrees per domain | Strong | Process overhead | OTP core |

### Resource Isolation Strategies

The bulkhead pattern can be applied at multiple granularity levels, forming a hierarchy from coarse-grained node isolation down to fine-grained individual process limits:

```
System Level
  |
  +-- Node Bulkheads (separate BEAM VMs)
       |
       +-- Application Bulkheads (separate OTP apps)
            |
            +-- Supervision Bulkheads (separate supervisor subtrees)
                 |
                 +-- Pool Bulkheads (separate connection/task pools)
                      |
                      +-- Process Bulkheads (individual process limits)
```

Each level provides progressively stronger isolation at progressively higher resource cost. The art of bulkhead design is choosing the right granularity for each component based on its failure characteristics, resource requirements, and criticality to the overall system.

### Mathematical Model

The effectiveness of bulkheads can be modeled probabilistically. Given:
- `P(f)` = probability of a single component failure
- `n` = number of components
- `k` = number of bulkhead compartments

Without bulkheads (shared resources):
- `P(system_failure) = 1 - (1 - P(f))^n` (any failure affects all)

With bulkheads (isolated compartments):
- `P(total_failure) = P(f)^k` (all compartments must fail)
- `P(partial_failure) = 1 - (1 - P(f))^(n/k)` (per compartment)

For a system with 10 components and `P(f) = 0.01`:
- Without bulkheads: `P(total) = 9.6%` chance any failure affects everything
- With 5 bulkheads: `P(total) = 0.0000001%` chance all bulkheads fail simultaneously

This exponential improvement in system reliability is why bulkheads are considered a foundational resilience pattern.

### Bulkhead Sizing

Properly sizing bulkheads requires balancing isolation against resource efficiency:

| Factor | Consideration | Guidance |
|--------|--------------|----------|
| Max Concurrency | Maximum simultaneous requests a component should handle | Measure peak throughput + 25% headroom |
| Failure Rate | Historical failure rate determines compartment size | Higher failure rate = smaller compartment |
| Recovery Time | Time to recover from failure affects minimum pool size | Longer recovery = larger pool buffer |
| Dependencies | Components sharing dependencies may need coordinated limits | Map dependency graph first |
| Cost | More granular bulkheads cost more resources | Balance isolation vs. efficiency |
| Latency Budget | Queuing in full bulkheads adds latency | Size to keep P99 within budget |

## Architecture and Implementation

### BEAM Process Bulkheads

The BEAM virtual machine provides natural bulkhead semantics through its process model. Each process has its own heap, garbage collector, and failure domain:

```elixir
defmodule PrismaticPerimeter.BulkheadedScanner do
  @moduledoc """
  EASM scanner with bulkhead isolation per scan type.
  Each scan type runs in its own Task.Supervisor with bounded concurrency,
  preventing failures or overload in one scan type from affecting others.
  """

  @spec start_link(keyword()) :: Supervisor.on_start()
  def start_link(_opts) do
    children = [
      # Each scanner type gets its own Task.Supervisor (bulkhead)
      {Task.Supervisor, name: __MODULE__.DNSScanner, max_children: 50},
      {Task.Supervisor, name: __MODULE__.CertScanner, max_children: 20},
      {Task.Supervisor, name: __MODULE__.PortScanner, max_children: 30},
      {Task.Supervisor, name: __MODULE__.WebScanner, max_children: 25}
    ]

    Supervisor.start_link(children, strategy: :one_for_one)
  end

  @spec scan_dns(String.t()) :: {:ok, Task.t()} | {:error, :bulkhead_full}
  def scan_dns(target) do
    # DNS scans are isolated in their own bulkhead
    # If DNS scanning fails, cert/port/web scanning continues
    case count_active(__MODULE__.DNSScanner) do
      count when count < 50 ->
        task = Task.Supervisor.async_nolink(__MODULE__.DNSScanner, fn ->
          PrismaticPerimeter.DNS.enumerate(target)
        end)
        {:ok, task}

      _full ->
        {:error, :bulkhead_full}
    end
  end

  @spec scan_certificates(String.t()) :: {:ok, Task.t()} | {:error, :bulkhead_full}
  def scan_certificates(target) do
    case count_active(__MODULE__.CertScanner) do
      count when count < 20 ->
        task = Task.Supervisor.async_nolink(__MODULE__.CertScanner, fn ->
          PrismaticPerimeter.Certificates.query_ct_logs(target)
        end)
        {:ok, task}

      _full ->
        {:error, :bulkhead_full}
    end
  end

  defp count_active(supervisor) do
    %{active: active} = Task.Supervisor.count_children(supervisor)
    active
  end
end
```

### Connection Pool Bulkheads

Connection pools are a critical bulkhead boundary because database connections are a finite, shared resource. Without pool isolation, a single misbehaving service can exhaust all connections and starve the entire system:

```elixir
# config/config.exs
# Each service gets its own connection pool - failure in one
# cannot exhaust connections for others

config :prismatic, Prismatic.Repo,
  pool_size: 20  # PostgreSQL bulkhead

config :prismatic, :redis_pool,
  pool_size: 10  # Redis bulkhead

config :prismatic, :meilisearch_pool,
  pool_size: 5   # Meilisearch bulkhead

config :prismatic, :ollama_pool,
  pool_size: 3   # Ollama inference bulkhead

config :prismatic, :osint_pool,
  pool_size: 15  # OSINT provider bulkhead
```

### NimblePool-Based Bulkheads

For fine-grained resource management, NimblePool provides lightweight connection pooling with configurable limits:

```elixir
defmodule PrismaticPerimeter.HttpPool do
  @moduledoc """
  HTTP connection pool with bulkhead isolation per target domain.
  Each domain gets a separate pool to prevent one slow domain
  from blocking requests to others.
  """

  @behaviour NimblePool

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    pool_size = Keyword.get(opts, :pool_size, 10)
    NimblePool.start_link(worker: {__MODULE__, opts}, pool_size: pool_size)
  end

  @spec checkout(pid(), String.t(), keyword()) ::
          {:ok, term()} | {:error, :timeout | :bulkhead_full}
  def checkout(pool, url, opts \\ []) do
    timeout = Keyword.get(opts, :timeout, 5_000)

    NimblePool.checkout!(pool, :checkout, fn _from, conn ->
      result = Mint.HTTP.request(conn, "GET", url, [], nil)
      {result, conn}
    end, timeout)
  rescue
    e in RuntimeError ->
      {:error, :bulkhead_full}
  end

  @impl NimblePool
  def init_worker(opts) do
    host = Keyword.fetch!(opts, :host)
    {:ok, conn} = Mint.HTTP.connect(:https, host, 443)
    {:ok, conn, opts}
  end

  @impl NimblePool
  def terminate_worker(_reason, conn, _pool_state) do
    Mint.HTTP.close(conn)
    {:ok, nil}
  end
end
```

### Supervision Tree Bulkheads

```elixir
defmodule PrismaticSupervisor.DomainSupervisor do
  @moduledoc """
  Groups related applications into isolated domain supervisors.
  Each domain is a bulkhead that cannot affect other domains.
  A crash in the security domain cannot propagate to the storage domain.
  """

  use Supervisor

  @spec start_link(map()) :: Supervisor.on_start()
  def start_link(domain_config) do
    Supervisor.start_link(__MODULE__, domain_config,
      name: :"#{domain_config.name}_supervisor"
    )
  end

  @impl true
  def init(domain_config) do
    children = domain_config.applications
    |> Enum.map(fn app ->
      %{
        id: app,
        start: {app, :start_link, [[]]},
        restart: :permanent,
        shutdown: 30_000
      }
    end)

    # rest_for_one: if a foundational app crashes,
    # dependent apps in this domain restart too,
    # but other domains are unaffected
    Supervisor.init(children, strategy: :rest_for_one)
  end
end
```

## Monitoring Bulkhead Health

Effective bulkhead implementation requires continuous monitoring. Without visibility into bulkhead utilization, teams discover capacity issues only when users report errors:

```elixir
defmodule PrismaticSupervisor.BulkheadMonitor do
  @moduledoc """
  Monitors bulkhead utilization and emits telemetry events for alerting.
  Tracks capacity across all bulkhead compartments and raises warnings
  when utilization approaches critical thresholds.
  """

  use GenServer

  @warning_threshold 0.8   # 80% utilization triggers warning
  @critical_threshold 0.95  # 95% utilization triggers alert

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec check_bulkhead(atom()) ::
          {:ok, float(), String.t()}
          | {:warning, float(), String.t()}
          | {:critical, float(), String.t()}
  def check_bulkhead(supervisor_name) do
    info = Supervisor.count_children(supervisor_name)
    specs = info[:specs]
    active = info[:active]

    utilization = if specs > 0, do: active / specs, else: 0.0

    :telemetry.execute(
      [:prismatic, :bulkhead, :utilization],
      %{value: utilization, active: active, capacity: specs},
      %{bulkhead: supervisor_name}
    )

    cond do
      utilization >= @critical_threshold ->
        {:critical, utilization,
         "Bulkhead #{supervisor_name} at #{Float.round(utilization * 100, 1)}% capacity"}

      utilization >= @warning_threshold ->
        {:warning, utilization,
         "Bulkhead #{supervisor_name} approaching capacity"}

      true ->
        {:ok, utilization,
         "Bulkhead #{supervisor_name} healthy"}
    end
  end

  @spec check_all() :: [
          {atom(), {:ok | :warning | :critical, float(), String.t()}}
        ]
  def check_all do
    GenServer.call(__MODULE__, :check_all)
  end

  @impl true
  def init(opts) do
    bulkheads = Keyword.get(opts, :bulkheads, [])
    interval = Keyword.get(opts, :check_interval, 10_000)
    Process.send_after(self(), :periodic_check, interval)
    {:ok, %{bulkheads: bulkheads, interval: interval}}
  end

  @impl true
  def handle_call(:check_all, _from, state) do
    results = Enum.map(state.bulkheads, fn bulkhead ->
      {bulkhead, check_bulkhead(bulkhead)}
    end)
    {:reply, results, state}
  end

  @impl true
  def handle_info(:periodic_check, state) do
    Enum.each(state.bulkheads, &check_bulkhead/1)
    Process.send_after(self(), :periodic_check, state.interval)
    {:noreply, state}
  end
end
```

## Usage in Prismatic Platform

The Prismatic Platform implements bulkhead isolation at multiple levels through OTP's process model and the umbrella application architecture.

### Application-Level Bulkheads

Each of the 115 umbrella applications runs under its own [supervision tree](@/glossary/supervision-tree.md), creating natural bulkheads that prevent failures in one application from affecting others:

| Domain | Applications | Isolation | Max Concurrency |
|--------|-------------|-----------|-----------------|
| Storage | prismatic_storage_core, _ets, _ecto, _meilisearch, _kuzu | Per-backend pools | 20 connections each |
| Security | prismatic_perimeter, prismatic_dark, prismatic_safety | Per-scanner limits | 50 tasks per scanner |
| Intelligence | prismatic_agents, prismatic_osint | Per-provider pools | 15 concurrent providers |
| Web | prismatic_web, prismatic_api | Per-endpoint limits | 100 concurrent requests |
| Infrastructure | prismatic_supervisor, prismatic_claude | Per-service pools | 10 sessions each |

### Ollama Inference Bulkhead

The Ollama AI inference pipeline uses bounded task supervisors as bulkheads, preventing a flood of AI requests from consuming all BEAM schedulers:

```elixir
defmodule PrismaticAgents.OllamaBulkhead do
  @moduledoc """
  Bulkhead for Ollama AI inference requests.
  Limits concurrent inference operations to prevent resource exhaustion.
  """

  @max_concurrent_inferences 3
  @max_queue_depth 10

  @spec infer(String.t(), keyword()) ::
          {:ok, Task.t()} | {:error, :bulkhead_full}
  def infer(prompt, opts \\ []) do
    case check_capacity() do
      :available ->
        task = Task.Supervisor.async_nolink(
          __MODULE__.TaskSupervisor,
          fn -> PrismaticAgents.Ollama.complete(prompt, opts) end
        )
        {:ok, task}

      :at_capacity ->
        {:error, :bulkhead_full}
    end
  end

  @spec check_capacity() :: :available | :at_capacity
  defp check_capacity do
    children = Supervisor.count_children(__MODULE__.TaskSupervisor)
    if children[:active] < @max_concurrent_inferences, do: :available, else: :at_capacity
  end
end
```

### OSINT Provider Bulkheads

Each OSINT data provider operates within its own bulkhead, preventing a slow or failing provider from blocking intelligence collection from other sources:

```elixir
defmodule PrismaticOsint.ProviderBulkhead do
  @moduledoc """
  Per-provider bulkheads for OSINT data collection.
  Each provider (Shodan, Censys, VirusTotal, etc.) gets its own
  bounded task pool, preventing one slow provider from blocking others.
  """

  @provider_limits %{
    shodan: 5,
    censys: 5,
    virustotal: 3,
    hunter_io: 5,
    ares: 10,
    justice: 10
  }

  @spec query(atom(), map()) :: {:ok, Task.t()} | {:error, :bulkhead_full}
  def query(provider, params) do
    supervisor = supervisor_name(provider)
    max = Map.get(@provider_limits, provider, 5)

    case count_active(supervisor) do
      count when count < max ->
        task = Task.Supervisor.async_nolink(supervisor, fn ->
          apply_provider(provider, params)
        end)
        {:ok, task}

      _full ->
        {:error, :bulkhead_full}
    end
  end

  defp supervisor_name(provider), do: :"#{__MODULE__}.#{provider}"

  defp count_active(supervisor) do
    %{active: active} = Task.Supervisor.count_children(supervisor)
    active
  end

  defp apply_provider(:shodan, params), do: PrismaticOsint.Shodan.search(params)
  defp apply_provider(:censys, params), do: PrismaticOsint.Censys.search(params)
  defp apply_provider(:virustotal, params), do: PrismaticOsint.VirusTotal.lookup(params)
  defp apply_provider(provider, params), do: PrismaticOsint.GenericProvider.query(provider, params)
end
```

## Bulkhead Pattern with Circuit Breakers

Bulkheads and [circuit breakers](@/glossary/circuit-breaker.md) are complementary patterns that are most effective when used together. Bulkheads limit resource consumption; circuit breakers stop requests to failing dependencies. The combination provides comprehensive failure management:

```elixir
defmodule PrismaticPerimeter.ResilientClient do
  @moduledoc """
  HTTP client combining bulkhead isolation with circuit breaker protection.
  The bulkhead prevents resource exhaustion; the circuit breaker prevents
  repeated calls to failing services.
  """

  @spec request(atom(), String.t(), keyword()) ::
          {:ok, map()} | {:error, :bulkhead_full | :circuit_open | term()}
  def request(service, url, opts \\ []) do
    with :ok <- check_circuit(service),
         {:ok, task} <- checkout_bulkhead(service, url, opts) do
      Task.await(task, Keyword.get(opts, :timeout, 10_000))
    end
  end

  defp check_circuit(service) do
    case CircuitBreaker.status(service) do
      :closed -> :ok
      :half_open -> :ok
      :open -> {:error, :circuit_open}
    end
  end

  defp checkout_bulkhead(service, url, opts) do
    supervisor = :"bulkhead_#{service}"
    max = service_limit(service)

    case Task.Supervisor.count_children(supervisor) do
      %{active: active} when active < max ->
        task = Task.Supervisor.async_nolink(supervisor, fn ->
          perform_request(url, opts)
        end)
        {:ok, task}

      _full ->
        {:error, :bulkhead_full}
    end
  end

  defp service_limit(:dns), do: 50
  defp service_limit(:certificates), do: 20
  defp service_limit(:ports), do: 30
  defp service_limit(_), do: 10

  defp perform_request(url, opts) do
    # Actual HTTP request implementation
    Req.get(url, opts)
  end
end
```

## Testing Bulkhead Behavior

Testing bulkheads requires deliberately saturating compartments and verifying that other compartments remain functional:

```elixir
defmodule PrismaticPerimeter.BulkheadTest do
  use ExUnit.Case, async: true

  describe "bulkhead isolation" do
    test "DNS scanner bulkhead does not affect certificate scanner" do
      # Saturate the DNS bulkhead with slow tasks
      dns_tasks = for _i <- 1..50 do
        {:ok, task} = BulkheadedScanner.scan_dns("slow.example.com")
        task
      end

      # DNS bulkhead should be full
      assert {:error, :bulkhead_full} = BulkheadedScanner.scan_dns("another.example.com")

      # Certificate bulkhead should still be available
      assert {:ok, _task} = BulkheadedScanner.scan_certificates("example.com")

      # Cleanup
      Enum.each(dns_tasks, &Task.shutdown/1)
    end

    test "bulkhead reports utilization metrics" do
      {:ok, utilization, _msg} = BulkheadMonitor.check_bulkhead(BulkheadedScanner.DNSScanner)
      assert utilization >= 0.0 and utilization <= 1.0
    end
  end
end
```

## Best Practices

1. **Size bulkheads based on failure modes** -- Analyze historical failure patterns to determine appropriate compartment sizes. Undersized bulkheads reject legitimate traffic; oversized bulkheads fail to contain failures.

2. **Monitor utilization** -- Track bulkhead utilization metrics via [telemetry](@/glossary/telemetry.md). Consistently high utilization indicates the need for capacity increases or performance optimization.

3. **Combine with circuit breakers** -- Bulkheads prevent resource exhaustion; [circuit breakers](@/glossary/circuit-breaker.md) prevent repeated calls to failing services. Use both for comprehensive failure management.

4. **Use BEAM processes as natural bulkheads** -- Elixir/OTP's lightweight processes provide built-in isolation. Leverage Task.Supervisor's `max_children` option for bounded concurrency.

5. **Test failure scenarios** -- Deliberately exhaust one bulkhead compartment and verify that other compartments continue operating normally. Automate these tests in CI.

6. **Document bulkhead boundaries** -- Make it clear which components share resources and which have isolated pools. This documentation is critical during incident response.

7. **Implement graceful degradation** -- When a bulkhead is full, return meaningful errors rather than blocking. Allow the system to shed load gracefully.

8. **Use backpressure signals** -- Connect bulkhead utilization to [backpressure](@/glossary/backpressure.md) mechanisms so upstream components reduce their request rate when downstream bulkheads approach capacity.

## Common Pitfalls

- **Shared database connections**: Even with process-level bulkheads, a shared connection pool creates a single point of failure. Use per-service connection pools.

- **Undersized bulkheads**: Setting limits too low causes legitimate requests to be rejected during normal operation. Base limits on measured peak throughput plus headroom.

- **Leaked resources**: A process that crashes within a bulkhead may leak connections or file handles. Ensure resource cleanup in terminate callbacks.

- **Cross-bulkhead dependencies**: If compartment A synchronously calls compartment B, a failure in B can block A's bulkhead. Use async patterns or timeouts for cross-bulkhead communication.

- **Monitoring blind spots**: Not monitoring bulkhead utilization means you discover capacity issues only when users report errors.

- **Static sizing**: Setting bulkhead sizes at deployment time and never adjusting them. Production traffic patterns change; bulkhead sizes should adapt through configuration or auto-scaling.

- **Ignoring queue depth**: A bulkhead that queues unlimited requests when full just moves the problem from resource exhaustion to memory exhaustion. Bound both concurrency and queue depth.

## Bulkhead Pattern in Other Ecosystems

While the pattern applies universally, implementation varies by runtime:

| Ecosystem | Implementation | Isolation Quality |
|-----------|---------------|-------------------|
| **Elixir/BEAM** | Process pools, Task.Supervisor, OTP apps | Excellent (process-level isolation) |
| **Java** | Thread pools (Hystrix, Resilience4j) | Good (thread-level isolation) |
| **Go** | Goroutine pools with semaphores | Good (goroutine-level isolation) |
| **Kubernetes** | Pod resource limits, namespaces | Excellent (container-level isolation) |
| **Node.js** | Worker threads, cluster module | Limited (single-threaded event loop) |
| **Rust** | Tokio task budgets, separate runtimes | Good (task-level isolation) |

The BEAM's advantage is that process creation costs approximately 2 microseconds and 2 KB of memory, making fine-grained bulkheads practical at a scale that would be prohibitively expensive in thread-based systems.

## Related Concepts

- [Circuit Breaker](@/glossary/circuit-breaker.md) -- Complementary pattern that stops requests to failing services
- [Supervision Tree](@/glossary/supervision-tree.md) -- OTP hierarchy providing natural bulkhead boundaries
- [Fault Tolerance](@/glossary/fault-tolerance.md) -- System property that bulkheads help achieve
- [Process Isolation](@/glossary/process-isolation.md) -- BEAM isolation model underlying bulkhead implementation
- [Let It Crash](@/glossary/let-it-crash.md) -- Philosophy that bulkheads make safe by containing crash impact
- [Backpressure](@/glossary/backpressure.md) -- Flow control mechanism complementing bulkhead capacity limits
- [GenServer](@/glossary/genserver.md) -- OTP behaviour used to implement stateful bulkhead monitors
- [BEAM](@/glossary/beam.md) -- Virtual machine providing lightweight process isolation for bulkheads
- [Telemetry](@/glossary/telemetry.md) -- Observability framework for monitoring bulkhead utilization

## Further Reading

- [Release It! by Michael Nystrom](https://pragprog.com/titles/mnee2/release-it-second-edition/) -- Definitive reference for stability patterns including bulkheads
- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Technologies](@/technologies/_index.md) -- Technology stack details
- [Apps](@/apps/_index.md) -- Umbrella applications with bulkhead isolation

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
