+++
title = "Agent Pool"
weight = 50

[extra]
description = "An Agent Pool is a managed collection of pre-initialized, concurrent agent processes that handle task execution, resource sharing, and load distribution across the Prismatic Platform's 530+ AIAD agent ecosystem."
category = "agent-systems"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "17 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "concurrent-systems"
related_concepts = ["process pooling", "worker pool", "task scheduling", "backpressure management", "supervision trees", "GenServer pools", "agent lifecycle management", "resource allocation"]
implementation_status = "production"
authority_level = "L3-strategic"
difficulty_rating = 8
prerequisites = ["otp-fundamentals", "genserver-basics", "supervision-trees", "elixir-concurrency", "aiad-agent-model"]
learning_path = ["beam-process-model", "genserver-pooling", "supervisor-strategies", "agent-lifecycle-design", "distributed-agent-pools"]
interactive_demos = ["pool-utilization-dashboard", "agent-lifecycle-visualizer", "backpressure-simulator"]
code_examples = true
external_resources = ["https://hexdocs.pm/nimble_pool/NimblePool.html", "https://hexdocs.pm/poolboy/readme.html", "https://www.erlang.org/doc/design_principles/sup_princ"]
version_introduced = "0.3.0"
stability_level = "stable"
testing_scenarios = ["pool-exhaustion-handling", "agent-crash-recovery", "concurrent-checkout", "pool-resize-under-load", "graceful-shutdown-draining"]
keywords = ["agent pool", "process pool", "worker pool", "concurrency", "OTP", "supervision", "backpressure", "resource management", "AIAD", "agent management"]
tags = ["glossary", "agents", "pool", "concurrency", "otp", "beam", "supervision", "resource-management"]
related_terms = ["agent", "genserver", "supervisor", "dynamic-supervisor", "backpressure", "concurrency", "process-isolation", "fault-tolerance", "agent-registry", "multi-agent-system"]
word_count = 1351
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Agent Pool - Prismatic Platform"
+++

## Definition

An **Agent Pool** is a managed collection of pre-initialized, concurrent processes (agents) that are ready to accept and execute tasks on demand. Rather than creating new processes for each incoming request -- which incurs initialization overhead and makes resource control difficult -- an agent pool maintains a fixed or dynamically sized set of worker processes. Callers check out agents from the pool, execute their work, and return agents for reuse. In the Prismatic Platform, agent pools are the execution substrate for the 530+ AIAD agent ecosystem, managing everything from OSINT data collection to security rating calculations, AI inference, and autonomous quality enforcement.

## Overview

Process pooling is a fundamental pattern in concurrent systems, originating from thread pool implementations in operating systems and later adopted across virtually every server-side runtime. In the BEAM virtual machine, where individual processes are extraordinarily lightweight (approximately 2KB initial heap), the motivation for pooling differs from traditional systems. BEAM processes are cheap to create, but the resources they manage -- database connections, HTTP clients, AI model inference sessions, external API rate limits -- are not.

The Prismatic Platform's agent pool architecture serves three critical purposes:

1. **Resource bounding**: Limiting the number of concurrent database connections, API calls, or inference sessions to prevent resource exhaustion.
2. **Backpressure propagation**: When all agents in a pool are busy, callers receive immediate feedback rather than creating unbounded work queues.
3. **Lifecycle management**: Pre-initialization of agents with configuration, credentials, and state that would be expensive to reconstruct per-request.

The platform operates multiple specialized agent pools, each tuned for its domain:

- **OSINT Agent Pool**: Manages concurrent queries across 120+ intelligence providers with per-provider rate limiting.
- **Security Rating Pool**: Handles parallel security assessment calculations with bounded concurrency to avoid overloading target systems.
- **AI Inference Pool**: Controls access to Ollama model inference sessions, preventing GPU memory exhaustion.
- **Quality Enforcement Pool**: Runs parallel code analysis, Credo checks, and Dialyzer verification across the 115-application codebase.
- **Color Team Pool**: Manages adversarial simulation (Red), defensive analysis (Blue), and synthesis (Purple) agents with strict isolation.

Each pool is supervised by dedicated OTP supervisors, ensuring that crashed agents are automatically restarted and returned to the pool without human intervention.

## Technical Details

### Pool Architecture

The pool architecture in the Prismatic Platform follows OTP principles, using DynamicSupervisor for worker management and ETS for O(1) checkout/checkin operations.

```elixir
defmodule Prismatic.AgentPool do
  @moduledoc """
  Generic agent pool implementation using OTP primitives.
  Manages a fixed-size pool of agent processes with checkout/checkin
  semantics, overflow support, and health monitoring.
  """

  use GenServer

  require Logger

  @type pool_config :: %{
          name: atom(),
          size: pos_integer(),
          max_overflow: non_neg_integer(),
          worker_module: module(),
          worker_args: keyword(),
          checkout_timeout: pos_integer(),
          idle_timeout: pos_integer() | :infinity
        }

  @type pool_state :: %{
          config: pool_config(),
          available: :queue.queue(pid()),
          checked_out: %{pid() => {pid(), reference()}},
          overflow_count: non_neg_integer(),
          waiting: :queue.queue({pid(), reference(), reference()}),
          monitors: %{reference() => pid()},
          supervisor: pid()
        }

  @spec start_link(pool_config()) :: GenServer.on_start()
  def start_link(config) do
    GenServer.start_link(__MODULE__, config, name: config.name)
  end

  @spec checkout(atom(), timeout()) :: {:ok, pid()} | {:error, :pool_exhausted}
  def checkout(pool_name, timeout \\ 5_000) do
    GenServer.call(pool_name, :checkout, timeout)
  end

  @spec checkin(atom(), pid()) :: :ok
  def checkin(pool_name, worker) do
    GenServer.cast(pool_name, {:checkin, worker})
  end

  @spec with_agent(atom(), (pid() -> result), timeout()) ::
          {:ok, result} | {:error, :pool_exhausted}
        when result: any()
  def with_agent(pool_name, fun, timeout \\ 5_000) do
    case checkout(pool_name, timeout) do
      {:ok, worker} ->
        try do
          result = fun.(worker)
          {:ok, result}
        after
          checkin(pool_name, worker)
        end

      {:error, reason} ->
        {:error, reason}
    end
  end

  @spec pool_status(atom()) :: %{
          size: non_neg_integer(),
          available: non_neg_integer(),
          checked_out: non_neg_integer(),
          overflow: non_neg_integer(),
          waiting: non_neg_integer()
        }
  def pool_status(pool_name) do
    GenServer.call(pool_name, :status)
  end

  @impl true
  def init(config) do
    {:ok, supervisor} =
      DynamicSupervisor.start_link(strategy: :one_for_one)

    workers =
      for _i <- 1..config.size do
        {:ok, pid} =
          DynamicSupervisor.start_child(
            supervisor,
            {config.worker_module, config.worker_args}
          )

        Process.monitor(pid)
        pid
      end

    state = %{
      config: config,
      available: :queue.from_list(workers),
      checked_out: %{},
      overflow_count: 0,
      waiting: :queue.new(),
      monitors: %{},
      supervisor: supervisor
    }

    {:ok, state}
  end

  @impl true
  def handle_call(:checkout, {caller_pid, _} = from, state) do
    case :queue.out(state.available) do
      {{:value, worker}, remaining} ->
        ref = Process.monitor(caller_pid)

        new_state = %{
          state
          | available: remaining,
            checked_out: Map.put(state.checked_out, worker, {caller_pid, ref}),
            monitors: Map.put(state.monitors, ref, worker)
        }

        {:reply, {:ok, worker}, new_state}

      {:empty, _} when state.overflow_count < state.config.max_overflow ->
        {:ok, worker} =
          DynamicSupervisor.start_child(
            state.supervisor,
            {state.config.worker_module, state.config.worker_args}
          )

        Process.monitor(worker)
        ref = Process.monitor(caller_pid)

        new_state = %{
          state
          | overflow_count: state.overflow_count + 1,
            checked_out: Map.put(state.checked_out, worker, {caller_pid, ref}),
            monitors: Map.put(state.monitors, ref, worker)
        }

        {:reply, {:ok, worker}, new_state}

      {:empty, _} ->
        {:reply, {:error, :pool_exhausted}, state}
    end
  end

  @impl true
  def handle_call(:status, _from, state) do
    status = %{
      size: state.config.size,
      available: :queue.len(state.available),
      checked_out: map_size(state.checked_out),
      overflow: state.overflow_count,
      waiting: :queue.len(state.waiting)
    }

    {:reply, status, state}
  end

  @impl true
  def handle_cast({:checkin, worker}, state) do
    case Map.pop(state.checked_out, worker) do
      {{_caller_pid, ref}, remaining_checked_out} ->
        Process.demonitor(ref, [:flush])

        new_state = %{
          state
          | checked_out: remaining_checked_out,
            available: :queue.in(worker, state.available),
            monitors: Map.delete(state.monitors, ref)
        }

        {:noreply, new_state}

      {nil, _} ->
        {:noreply, state}
    end
  end

  @impl true
  def handle_info({:DOWN, ref, :process, _pid, _reason}, state) do
    case Map.get(state.monitors, ref) do
      nil ->
        {:noreply, state}

      worker ->
        # Caller crashed while holding a worker -- return worker to pool
        new_state = %{
          state
          | checked_out: Map.delete(state.checked_out, worker),
            available: :queue.in(worker, state.available),
            monitors: Map.delete(state.monitors, ref)
        }

        {:noreply, new_state}
    end
  end
end
```

### Agent Worker Implementation

Individual agents within a pool are standard GenServer processes with domain-specific initialization:

```elixir
defmodule Prismatic.AgentPool.OSINTWorker do
  @moduledoc """
  OSINT agent worker for the agent pool. Pre-initializes HTTP clients,
  rate limiters, and provider credentials for efficient query execution.
  """

  use GenServer

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts)
  end

  @spec execute(pid(), atom(), binary(), keyword()) ::
          {:ok, [map()]} | {:error, term()}
  def execute(worker, provider, query, opts \\ []) do
    GenServer.call(worker, {:execute, provider, query, opts}, 30_000)
  end

  @impl true
  def init(opts) do
    state = %{
      http_client: initialize_http_client(opts),
      rate_limiter: initialize_rate_limiter(opts),
      credentials: load_credentials(opts),
      stats: %{queries: 0, errors: 0, last_query_at: nil}
    }

    {:ok, state}
  end

  @impl true
  def handle_call({:execute, provider, query, opts}, _from, state) do
    with :ok <- check_rate_limit(state.rate_limiter, provider),
         {:ok, results} <- do_query(state, provider, query, opts) do
      new_stats = %{
        state.stats
        | queries: state.stats.queries + 1,
          last_query_at: System.monotonic_time(:millisecond)
      }

      {:reply, {:ok, results}, %{state | stats: new_stats}}
    else
      {:error, _reason} = error ->
        new_stats = %{state.stats | errors: state.stats.errors + 1}
        {:reply, error, %{state | stats: new_stats}}
    end
  end

  defp initialize_http_client(opts), do: Keyword.get(opts, :http_client, Prismatic.HTTP)
  defp initialize_rate_limiter(opts), do: Keyword.get(opts, :rate_limiter, nil)
  defp load_credentials(opts), do: Keyword.get(opts, :credentials, %{})
  defp check_rate_limit(nil, _provider), do: :ok
  defp check_rate_limit(limiter, provider), do: Prismatic.RateLimiter.check(limiter, provider)
  defp do_query(state, provider, query, opts), do: Prismatic.OSINT.dispatch(provider, query, opts)
end
```

### Supervision Tree Integration

Agent pools are integrated into the application's supervision tree with appropriate restart strategies:

```elixir
defmodule Prismatic.AgentPool.Supervisor do
  @moduledoc """
  Top-level supervisor for all agent pools in the Prismatic Platform.
  Each pool is supervised independently with :one_for_one strategy.
  """

  use Supervisor

  def start_link(init_arg) do
    Supervisor.start_link(__MODULE__, init_arg, name: __MODULE__)
  end

  @impl true
  def init(_init_arg) do
    children = [
      {Prismatic.AgentPool,
       %{
         name: :osint_pool,
         size: 10,
         max_overflow: 5,
         worker_module: Prismatic.AgentPool.OSINTWorker,
         worker_args: [credentials: load_osint_credentials()],
         checkout_timeout: 5_000,
         idle_timeout: :infinity
       }},
      {Prismatic.AgentPool,
       %{
         name: :security_rating_pool,
         size: 5,
         max_overflow: 3,
         worker_module: Prismatic.AgentPool.SecurityRatingWorker,
         worker_args: [],
         checkout_timeout: 10_000,
         idle_timeout: :infinity
       }},
      {Prismatic.AgentPool,
       %{
         name: :inference_pool,
         size: 2,
         max_overflow: 1,
         worker_module: Prismatic.AgentPool.InferenceWorker,
         worker_args: [model: "qwen3-coder"],
         checkout_timeout: 30_000,
         idle_timeout: 300_000
       }}
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end

  defp load_osint_credentials do
    Application.get_env(:prismatic, :osint_credentials, %{})
  end
end
```

### Pool Telemetry and Monitoring

The platform uses telemetry events for real-time pool monitoring:

```elixir
defmodule Prismatic.AgentPool.Telemetry do
  @moduledoc """
  Telemetry integration for agent pool metrics.
  Emits events for checkout, checkin, pool exhaustion, and worker crashes.
  """

  @spec emit_checkout(atom(), pid(), non_neg_integer()) :: :ok
  def emit_checkout(pool_name, worker_pid, wait_time_us) do
    :telemetry.execute(
      [:prismatic, :agent_pool, :checkout],
      %{duration: wait_time_us},
      %{pool: pool_name, worker: worker_pid}
    )
  end

  @spec emit_checkin(atom(), pid(), non_neg_integer()) :: :ok
  def emit_checkin(pool_name, worker_pid, usage_time_us) do
    :telemetry.execute(
      [:prismatic, :agent_pool, :checkin],
      %{duration: usage_time_us},
      %{pool: pool_name, worker: worker_pid}
    )
  end

  @spec emit_exhaustion(atom(), non_neg_integer()) :: :ok
  def emit_exhaustion(pool_name, waiting_count) do
    :telemetry.execute(
      [:prismatic, :agent_pool, :exhausted],
      %{waiting: waiting_count},
      %{pool: pool_name}
    )
  end
end
```

## Implementation in Prismatic Platform

### AIAD Agent Ecosystem

The Prismatic Platform's 530+ AIAD agents are organized into tiered pools based on their authority level and resource requirements:

| Pool | Size | Overflow | Agents | Purpose |
|------|------|----------|--------|---------|
| L1 Operational | 50 | 20 | L1 workers | High-throughput data processing |
| L2 Tactical | 20 | 10 | L2 specialists | Analysis and investigation |
| L3 Strategic | 5 | 2 | L3 commanders | Orchestration and coordination |
| L5 Supreme | 1 | 0 | L5 authority | Strategic decision-making |
| Color Team | 20 | 0 | Security agents | Adversarial/defensive simulation |

### Dynamic Pool Sizing

The platform monitors pool utilization and adjusts sizes based on load patterns:

```elixir
defmodule Prismatic.AgentPool.AutoScaler do
  @moduledoc """
  Automatically adjusts pool sizes based on utilization metrics.
  Uses exponential moving average to smooth scaling decisions.
  """

  use GenServer

  @check_interval :timer.seconds(30)
  @scale_up_threshold 0.85
  @scale_down_threshold 0.30
  @min_pool_size 2

  @impl true
  def init(opts) do
    pool_name = Keyword.fetch!(opts, :pool)
    schedule_check()

    {:ok, %{pool: pool_name, utilization_history: [], max_size: Keyword.get(opts, :max_size, 50)}}
  end

  @impl true
  def handle_info(:check_utilization, state) do
    status = Prismatic.AgentPool.pool_status(state.pool)
    total = status.size + status.overflow
    utilization = if total > 0, do: status.checked_out / total, else: 0.0

    new_history = Enum.take([utilization | state.utilization_history], 10)
    avg_utilization = Enum.sum(new_history) / length(new_history)

    cond do
      avg_utilization > @scale_up_threshold and total < state.max_size ->
        scale_up(state.pool, min(total + 2, state.max_size))

      avg_utilization < @scale_down_threshold and total > @min_pool_size ->
        scale_down(state.pool, max(total - 1, @min_pool_size))

      true ->
        :ok
    end

    schedule_check()
    {:noreply, %{state | utilization_history: new_history}}
  end

  defp schedule_check, do: Process.send_after(self(), :check_utilization, @check_interval)
  defp scale_up(pool, target_size), do: Prismatic.AgentPool.resize(pool, target_size)
  defp scale_down(pool, target_size), do: Prismatic.AgentPool.resize(pool, target_size)
end
```

## Comparison with Alternatives

| Approach | Process Creation | Resource Control | Backpressure | Fault Isolation | Prismatic Usage |
|----------|-----------------|-----------------|--------------|-----------------|-----------------|
| Agent Pool | Pre-initialized | Bounded by pool size | Queue or reject | Per-worker restart | Primary pattern |
| Task.async | On-demand | Unbounded | None built-in | Caller-linked | Simple one-off work |
| DynamicSupervisor | On-demand | Configurable | Manual | Per-child restart | Pool internals |
| Broadway | Pipeline-based | Stage-level | Built-in | Stage-level | Data pipelines |
| GenStage | Producer/consumer | Demand-driven | Demand-based | Stage-level | Stream processing |
| Poolboy (Erlang) | Pre-initialized | Bounded | Queue or reject | Per-worker restart | Legacy compatibility |
| NimblePool | Pre-initialized | Bounded | Queue or reject | Per-worker restart | Connection pooling |

### Agent Pool vs Task.async_stream

For bounded concurrent work, agent pools outperform `Task.async_stream` because workers maintain persistent state (connections, credentials, caches) across invocations, eliminating per-task initialization overhead.

### Agent Pool vs Broadway

Broadway excels at data pipeline processing with built-in batching and acknowledgement. Agent pools are better suited for request-response patterns where individual tasks require dedicated, stateful workers.

## Best Practices

1. **Size pools based on resource constraints, not CPU cores.** Database connection pools should match PostgreSQL's `max_connections`. API pools should respect provider rate limits.

2. **Always use `with_agent/3` over manual checkout/checkin.** The try/after pattern in `with_agent` guarantees workers are returned even if the caller crashes.

3. **Monitor pool utilization via telemetry.** Set alerts for sustained utilization above 80% and pool exhaustion events.

4. **Use overflow sparingly.** Overflow workers handle burst traffic but should not become the norm. If overflow is consistently used, increase the base pool size.

5. **Implement graceful shutdown.** On pool termination, drain checked-out workers by waiting for in-progress work to complete before stopping workers.

6. **Health-check idle workers.** Periodically verify that pooled agents are still functional (database connections alive, credentials valid, HTTP clients responsive).

7. **Isolate pool failures.** Each pool has its own supervisor. A crash in the OSINT pool must not affect the Security Rating pool.

8. **Log pool exhaustion with context.** When a pool is exhausted, log the caller, requested operation, and current pool status to enable capacity planning.

## Common Pitfalls

1. **Holding workers during blocking I/O.** If a checked-out worker makes a slow HTTP call, the worker is unavailable to the pool for the entire duration. Use async patterns within workers or increase pool size to compensate.

2. **Checkout timeout too short.** Aggressive checkout timeouts cause spurious failures under moderate load. Calibrate timeouts based on actual worker execution time distributions.

3. **Pool size matching connection pool size.** If the agent pool has 20 workers but the database connection pool has only 10 connections, half the agents will block on database access.

4. **Not monitoring overflow.** Overflow workers consume additional memory and resources. Without monitoring, sustained overflow can silently degrade system performance.

5. **Worker state corruption.** If a worker encounters an error but does not reset its state before checkin, the next caller inherits corrupted state. Always validate worker state on checkin or implement explicit reset callbacks.

6. **Deadlock from nested checkout.** If code checked out from Pool A attempts to checkout from Pool B, and vice versa, deadlock can occur. Enforce a consistent checkout ordering across pools.

## Use Cases

### OSINT Intelligence Gathering

The OSINT agent pool manages concurrent queries across 120+ providers (ARES, Shodan, VirusTotal, Censys). Each worker maintains authenticated HTTP sessions and per-provider rate limiters, enabling efficient parallel data collection while respecting API constraints.

### Security Rating Computation

The Prismatic Perimeter module uses a dedicated pool of security rating agents. Each agent handles one domain assessment at a time, performing DNS enumeration, certificate analysis, and vulnerability scanning in isolation.

### AI Model Inference

Ollama inference sessions require significant GPU memory. The inference pool strictly limits concurrent sessions to prevent out-of-memory conditions while queuing excess requests for later execution.

### Color Team Simulations

Red, Blue, and Purple team agents operate in isolated pools with strict resource boundaries. Red team agents cannot access Blue team resources and vice versa, enforced at the pool and supervision level.

### Quality Gate Enforcement

Parallel Credo, Dialyzer, and compilation checks across 115 applications run through a quality enforcement pool, ensuring that quality gate evaluation completes within acceptable time bounds while not consuming all available system resources.

## Related Concepts

- [Agent](/glossary/agent/) -- The fundamental autonomous unit that executes within agent pools
- [GenServer](/glossary/genserver/) -- The OTP abstraction underlying each agent worker in the pool
- [Supervisor](/glossary/supervisor/) -- OTP supervision trees that manage pool lifecycle and automatic recovery
- [Dynamic Supervisor](/glossary/dynamic-supervisor/) -- The mechanism for dynamically adding and removing workers within a pool
- [Backpressure](/glossary/backpressure/) -- Flow control mechanism that agent pools use to prevent system overload
- [Concurrency](/glossary/concurrency/) -- The concurrent execution model that agent pools manage and bound
- [Process Isolation](/glossary/process-isolation/) -- BEAM process isolation that enables safe agent pool worker crashes
- [Fault Tolerance](/glossary/fault-tolerance/) -- System resilience achieved through pool supervision and automatic worker restart
- [Agent Registry](/glossary/agent-registry/) -- The registry tracking all available agents and their pool assignments
- [Multi-Agent System](/glossary/multi-agent-system/) -- The broader multi-agent architecture that agent pools support

## See Also

- [Broadway](/glossary/broadway/) -- Data processing pipeline framework with built-in backpressure
- [GenStage](/glossary/genstage/) -- Producer-consumer abstraction for demand-driven processing
- [Connection Pooling](/glossary/connection-pooling/) -- Related pattern for managing database connection resources
- [Circuit Breaker](/glossary/circuit-breaker/) -- Resilience pattern for handling downstream failures in pooled agents
- [Load Balancing](/glossary/load-balancing/) -- Request distribution across pooled agent workers

---

## Connect & Contribute
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)
- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
