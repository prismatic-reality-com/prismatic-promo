+++
title = "Real-World Chaos"
weight = 50
[extra]
category = "resilience"
description = "The unpredictable, non-deterministic conditions that production systems face in real deployments -- network partitions, hardware failures, race conditions, and adversarial inputs -- which the Prismatic Platform explicitly designs for through chaos engineering, fault tolerance, and supervision strategies."
related_terms = ["chaos-engineering", "fault-tolerance", "let-it-crash", "adversarial-conditions", "circuit-breaker", "supervision-tree", "backpressure", "self-healing", "distributed-system", "component-failures"]
tags = ["glossary", "resilience", "chaos", "fault-tolerance", "production", "distributed-systems", "testing"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "16 min"
difficulty = "advanced"
quality_score = 95
date_created = "2026-02-22"
version = "2.0.0"
platform_relevance = "critical"
use_cases = ["production resilience", "chaos engineering", "fault injection", "disaster recovery", "adversarial defense"]
word_count = 1559
date_modified = "2026-02-23"
keywords = ["Real-World", "Chaos", "Prismatic", "Platform", "glossary", "resilience", "Prismatic Platform", "The Prismatic", "Medium"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Real-World Chaos - Prismatic Platform"
+++

## Definition

Real-world chaos refers to the full spectrum of unpredictable, non-deterministic, and adversarial conditions that software systems encounter in production environments. Unlike the controlled, deterministic conditions of development and testing, production systems face network partitions, hardware failures, clock skew, memory pressure, disk corruption, race conditions, cascading failures, adversarial inputs, and emergent behaviors that arise from the interaction of independently correct components.

The defining characteristic of real-world chaos is that it cannot be fully enumerated. Any list of failure modes is necessarily incomplete because complex systems produce emergent failures that were not anticipated by their designers. A network partition combined with a garbage collection pause combined with a deployment of a new version creates a failure mode that no individual component was designed to handle and that no test specifically validates.

The Prismatic Platform treats real-world chaos not as an exception to normal operation but as the normal operating condition. Production is chaos. The question is not whether failures will occur but how the system responds when they inevitably do. This perspective drives the platform's design philosophy: every component assumes that its dependencies can fail at any time, every process assumes it can be killed without warning, and every network call assumes the response may never arrive.

## The Taxonomy of Chaos

Real-world chaos can be categorized into several overlapping domains, each requiring different defensive strategies:

### Infrastructure Chaos

Infrastructure chaos originates from the physical and virtual substrate on which software runs:

| Failure Mode | Frequency | Impact | Detection Difficulty |
|-------------|-----------|--------|---------------------|
| Network partition | Monthly | High -- splits cluster, breaks consensus | Medium -- detectable by heartbeat timeout |
| Disk failure | Quarterly | Critical -- data loss if not replicated | Low -- kernel logs, SMART monitoring |
| Memory exhaustion | Weekly | High -- OOM killer terminates processes | Medium -- metrics show gradual pressure |
| CPU saturation | Daily | Medium -- increased latency, timeouts | Low -- straightforward metric |
| Clock skew | Continuous | Medium -- ordering violations, certificate failures | High -- requires NTP monitoring |
| DNS resolution failure | Monthly | High -- breaks all service discovery | Medium -- typically fast to detect |
| Power failure | Yearly | Critical -- unclean shutdown, data corruption | N/A -- immediate |

### Application Chaos

Application chaos emerges from software behavior, including bugs, resource leaks, and configuration errors:

- **Memory leaks**: Gradual consumption that triggers OOM after days or weeks of operation
- **Connection pool exhaustion**: All connections occupied by slow or abandoned requests
- **Deadlocks**: Concurrent processes waiting for each other's resources
- **Race conditions**: Non-deterministic behavior depending on execution timing
- **Configuration drift**: Production config diverging from tested config over time
- **Dependency version conflicts**: Transitive dependencies introducing incompatible behavior

### Adversarial Chaos

Adversarial chaos is intentionally introduced by malicious actors:

- **DDoS attacks**: Overwhelming system capacity with illegitimate requests
- **Injection attacks**: Malformed inputs exploiting parsing vulnerabilities
- **Credential stuffing**: Automated login attempts with stolen credentials
- **Supply chain attacks**: Compromised dependencies introducing malicious code
- **Data exfiltration**: Unauthorized access to sensitive information

The Prismatic Platform's [EASM capabilities](@/glossary/easm.md) and [security operations](@/glossary/security-operations.md) address adversarial chaos through continuous monitoring, [attack surface](@/glossary/attack-surface.md) management, and automated threat detection.

### Emergent Chaos

The most dangerous category: failures that emerge from the interaction of individually correct components. No single component is broken, but the system as a whole behaves incorrectly:

- **Thundering herd**: All clients reconnect simultaneously after an outage, overwhelming the recovered service
- **Cascade failure**: One component's failure causes its dependents to fail, which causes their dependents to fail
- **Metastable failure**: System enters a degraded state that is self-reinforcing -- the recovery actions themselves perpetuate the degraded state
- **Split-brain**: Network partition causes two halves of a cluster to operate independently with diverging state

## Designing for Chaos: The Erlang/OTP Approach

The [Erlang](@/glossary/erlang.md)/[OTP](@/glossary/otp.md) platform, on which the Prismatic Platform is built, was designed from its inception for real-world chaos. Ericsson's telephone switches needed 99.999% uptime (five nines: less than 5.26 minutes of downtime per year), and the only way to achieve that was to assume everything would fail and design accordingly.

```elixir
defmodule PrismaticResilience.ChaosAwareSupervisor do
  @moduledoc """
  Supervision tree designed for real-world chaos conditions.

  Strategy selection is based on the failure characteristics of children:
  - :one_for_one when children are independent
  - :one_for_all when children share critical state
  - :rest_for_one when children have ordered dependencies

  Max restarts are tuned for production chaos patterns:
  high enough to handle transient failures, low enough to
  prevent restart storms during persistent failures.
  """
  use Supervisor

  @max_restarts 5
  @max_seconds 60

  def start_link(opts) do
    Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl Supervisor
  def init(_opts) do
    children = [
      # Critical infrastructure -- must start first, others depend on it
      {PrismaticResilience.CircuitBreakerRegistry, []},

      # Connection pools with chaos-aware configuration
      {PrismaticResilience.ConnectionPool,
       pool_size: System.schedulers_online() * 2,
       overflow: System.schedulers_online(),
       checkout_timeout: :timer.seconds(5),
       idle_timeout: :timer.minutes(10)},

      # Health monitor that detects chaos conditions
      {PrismaticResilience.ChaosDetector,
       check_interval: :timer.seconds(30),
       thresholds: %{
         memory_percent: 85,
         process_count: 500_000,
         message_queue_length: 10_000,
         reductions_per_second: 1_000_000_000
       }},

      # Worker pool with backpressure
      {PrismaticResilience.WorkerPool,
       min_workers: 4,
       max_workers: System.schedulers_online() * 4,
       backpressure_threshold: 0.8}
    ]

    Supervisor.init(children,
      strategy: :rest_for_one,
      max_restarts: @max_restarts,
      max_seconds: @max_seconds
    )
  end
end
```

The key design principles for chaos resilience in OTP:

1. **Process isolation**: Each process has its own heap. One process crashing cannot corrupt another process's memory.
2. **[Let it crash](@/glossary/let-it-crash.md)**: Processes that encounter unexpected states crash and are restarted by their [supervisor](@/glossary/supervisor.md) with clean state.
3. **Supervision trees**: Hierarchical process management provides structured recovery from failures at any level.
4. **Message passing**: Processes communicate through asynchronous messages, decoupling sender and receiver lifecycles.
5. **Hot code reload**: Code can be updated without stopping the system, reducing deployment-related chaos.

## Chaos Engineering in the Prismatic Platform

[Chaos engineering](@/glossary/chaos-engineering.md) is the discipline of experimenting on a production-like system to build confidence in its ability to withstand real-world chaos. Rather than waiting for chaos to find system weaknesses, chaos engineering proactively introduces controlled failures.

```elixir
defmodule PrismaticResilience.ChaosExperiment do
  @moduledoc """
  Framework for running chaos experiments against the platform.

  Experiments follow the scientific method:
  1. Define steady state (what "normal" looks like in metrics)
  2. Hypothesize that steady state will hold during the experiment
  3. Introduce a real-world event (kill process, partition network, etc.)
  4. Observe whether steady state was maintained
  5. If steady state was violated, you found a weakness to fix
  """

  @type experiment :: %{
    name: String.t(),
    hypothesis: String.t(),
    steady_state: steady_state_definition(),
    chaos_action: chaos_action(),
    duration: pos_integer(),
    rollback: (-> :ok)
  }

  @type steady_state_definition :: %{
    metric: atom(),
    operator: :lt | :gt | :eq | :between,
    threshold: number() | {number(), number()}
  }

  @type chaos_action ::
    {:kill_process, pid() | atom()}
    | {:network_partition, node(), node()}
    | {:memory_pressure, float()}
    | {:cpu_saturation, float()}
    | {:slow_dependency, atom(), pos_integer()}

  @spec run(experiment()) :: {:ok, :hypothesis_confirmed} | {:ok, :hypothesis_violated, map()}
  def run(%{} = experiment) do
    steady_state_before = measure_steady_state(experiment.steady_state)

    unless within_threshold?(steady_state_before, experiment.steady_state) do
      {:error, :system_not_in_steady_state}
    end

    :telemetry.execute(
      [:prismatic, :chaos, :experiment_started],
      %{timestamp: System.monotonic_time()},
      %{name: experiment.name, action: experiment.chaos_action}
    )

    inject_chaos(experiment.chaos_action)
    Process.sleep(experiment.duration)

    steady_state_during = measure_steady_state(experiment.steady_state)
    experiment.rollback.()

    if within_threshold?(steady_state_during, experiment.steady_state) do
      {:ok, :hypothesis_confirmed}
    else
      {:ok, :hypothesis_violated, %{
        expected: experiment.steady_state,
        actual: steady_state_during,
        experiment: experiment.name
      }}
    end
  end

  defp inject_chaos({:kill_process, target}) when is_atom(target) do
    case Process.whereis(target) do
      nil -> :ok
      pid -> Process.exit(pid, :chaos_experiment)
    end
  end

  defp inject_chaos({:kill_process, pid}) when is_pid(pid) do
    Process.exit(pid, :chaos_experiment)
  end

  defp inject_chaos({:slow_dependency, name, delay_ms}) do
    PrismaticResilience.FaultInjector.add_latency(name, delay_ms)
  end

  defp inject_chaos({:memory_pressure, target_percent}) do
    PrismaticResilience.FaultInjector.allocate_memory(target_percent)
  end

  defp measure_steady_state(%{metric: metric}) do
    PrismaticResilience.Metrics.current_value(metric)
  end

  defp within_threshold?(value, %{operator: :lt, threshold: threshold}), do: value < threshold
  defp within_threshold?(value, %{operator: :gt, threshold: threshold}), do: value > threshold
  defp within_threshold?(value, %{operator: :eq, threshold: threshold}), do: value == threshold
  defp within_threshold?(value, %{operator: :between, threshold: {low, high}}),
    do: value >= low and value <= high
end
```

## The Chaos Spectrum

Not all chaos is equal. Understanding the spectrum helps prioritize defensive measures:

| Chaos Level | Description | Example | Defense Strategy |
|-------------|-------------|---------|-----------------|
| **L1: Transient** | Brief, self-resolving failures | Network hiccup, GC pause | Retry with [exponential backoff](@/glossary/exponential-backoff.md) |
| **L2: Intermittent** | Recurring but unpredictable | Flaky DNS, sporadic timeouts | [Circuit breaker](@/glossary/circuit-breaker.md), timeout tuning |
| **L3: Persistent** | Ongoing failure of a component | Service outage, disk full | Failover, graceful degradation |
| **L4: Cascading** | Failure spreading across components | Connection pool exhaustion | [Bulkhead pattern](@/glossary/bulkhead-pattern.md), isolation |
| **L5: Byzantine** | Components behaving incorrectly but not failing | Data corruption, split-brain | Consensus protocols, checksums |

## Chaos and Distributed Systems

[Distributed systems](@/glossary/distributed-system.md) amplify real-world chaos. The [CAP theorem](@/glossary/cap-theorem.md) proves that in the presence of network partitions, a system must choose between consistency and availability. The Prismatic Platform makes this choice explicitly at each boundary:

- **Storage layer**: Chooses consistency ([PostgreSQL](@/glossary/postgresql.md) with synchronous replication)
- **Cache layer**: Chooses availability ([ETS](@/glossary/ets.md) with eventual consistency)
- **Search layer**: Chooses availability ([Meilisearch](@/glossary/meilisearch.md) with async indexing)
- **Agent coordination**: Chooses consistency (OTP distributed Erlang with global locks)

Understanding which trade-off each component makes is essential for predicting behavior under chaos conditions. A system that chooses consistency will become unavailable during partitions. A system that chooses availability will serve potentially stale data during partitions. Neither choice is wrong -- the error is not making the choice explicitly.

## Chaos in the BEAM VM

The [BEAM virtual machine](@/glossary/beam-vm.md) provides several chaos-resilient primitives:

- **Preemptive scheduling**: No process can monopolize a scheduler, preventing CPU starvation
- **Per-process garbage collection**: GC pauses affect only the process being collected, not the entire system
- **Soft real-time guarantees**: The scheduler ensures that all processes make progress, even under heavy load
- **Distribution protocol**: Built-in support for clustering, node monitoring, and failover
- **Binary reference counting**: Large binaries are reference-counted and shared between processes without copying

These primitives mean that many forms of chaos that are catastrophic in other runtimes (GC pauses, thread starvation, memory corruption) are structurally prevented or contained by the BEAM.

## Monitoring Chaos

Effective chaos response requires knowing that chaos is happening. The Prismatic Platform monitors several categories of chaos indicators:

```elixir
defmodule PrismaticResilience.ChaosDetector do
  @moduledoc """
  Continuously monitors system health indicators to detect
  chaos conditions before they cause cascading failures.
  """
  use GenServer

  @check_interval :timer.seconds(30)

  defstruct [:thresholds, :check_interval, :timer_ref]

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl GenServer
  def init(opts) do
    state = %__MODULE__{
      thresholds: Keyword.get(opts, :thresholds, default_thresholds()),
      check_interval: Keyword.get(opts, :check_interval, @check_interval)
    }

    timer_ref = Process.send_after(self(), :check, state.check_interval)
    {:ok, %{state | timer_ref: timer_ref}}
  end

  @impl GenServer
  def handle_info(:check, state) do
    indicators = collect_indicators()
    alerts = evaluate_thresholds(indicators, state.thresholds)

    Enum.each(alerts, fn alert ->
      :telemetry.execute(
        [:prismatic, :chaos, :alert],
        %{severity: alert.severity},
        %{indicator: alert.indicator, value: alert.value, threshold: alert.threshold}
      )
    end)

    timer_ref = Process.send_after(self(), :check, state.check_interval)
    {:noreply, %{state | timer_ref: timer_ref}}
  end

  defp collect_indicators do
    memory = :erlang.memory()
    process_count = :erlang.system_info(:process_count)

    %{
      total_memory: memory[:total],
      process_memory: memory[:processes],
      binary_memory: memory[:binary],
      process_count: process_count,
      run_queue: :erlang.statistics(:run_queue),
      io_input: elem(:erlang.statistics(:io), 0) |> elem(1),
      io_output: elem(:erlang.statistics(:io), 1) |> elem(1),
      scheduler_utilization: :scheduler.utilization(1)
    }
  end

  defp evaluate_thresholds(indicators, thresholds) do
    Enum.flat_map(thresholds, fn {indicator, threshold} ->
      value = Map.get(indicators, indicator)

      if value && value > threshold do
        [%{indicator: indicator, value: value, threshold: threshold, severity: :warning}]
      else
        []
      end
    end)
  end

  defp default_thresholds do
    %{
      total_memory: 2_000_000_000,
      process_count: 500_000,
      run_queue: 100,
      binary_memory: 500_000_000
    }
  end
end
```

## Chaos Response Strategies

When chaos is detected, the platform employs graduated response strategies:

| Strategy | When Used | Mechanism |
|----------|----------|-----------|
| **Retry** | Transient failures | Exponential backoff with jitter |
| **Circuit break** | Repeated failures from same source | [Circuit breaker](@/glossary/circuit-breaker.md) pattern |
| **Shed load** | System approaching capacity | [Rate limiting](@/glossary/rate-limiting.md), [backpressure](@/glossary/backpressure.md) |
| **Isolate** | Failure spreading across boundaries | [Bulkhead pattern](@/glossary/bulkhead-pattern.md), process isolation |
| **Degrade gracefully** | Partial system failure | Disable non-essential features, serve cached data |
| **[Self-heal](@/glossary/self-healing.md)** | Persistent but diagnosable failure | Automated diagnosis and remediation |
| **Escalate** | Unrecoverable or undiagnosable failure | Alert human operators, trigger [incident response](@/glossary/incident-response.md) |

The key principle is proportionality: the response should match the severity of the chaos. Killing a service because of a single timeout is as dangerous as ignoring a cascading failure. The graduated response ensures that each level of chaos triggers the minimum intervention necessary.

## Chaos and Quality Gates

The platform's [quality gates](@/glossary/quality-gate.md) include chaos resilience requirements:

- All external calls must have timeouts
- All external calls must have [circuit breakers](@/glossary/circuit-breaker.md)
- All stateful processes must be supervised
- All supervision trees must specify restart strategies
- All connection pools must have overflow limits and checkout timeouts
- All [GenServer](@/glossary/genserver.md) handle_call implementations must handle the timeout case

These gates ensure that chaos resilience is not optional or aspirational but a hard requirement for every component that enters the codebase.

## Lessons from Production Chaos

The Prismatic Platform's resilience architecture has been shaped by specific production incidents:

1. **The compilation timeout cascade**: A `mix compile` operation during a session lifecycle hook timed out, causing the session to hang. The [circuit breaker](@/glossary/circuit-breaker.md) pattern was added to session hooks to prevent this class of failure.

2. **The ETS table limit**: The platform created ETS tables without cleaning them up, eventually hitting the system limit. The fix was to add lifecycle management to all ETS table creation.

3. **The telemetry flood**: A misconfigured telemetry handler emitted events recursively, creating an exponential message flood. The fix was to add circuit breakers to telemetry handlers themselves.

Each incident followed the same pattern: an unanticipated interaction between correct components produced an emergent failure. The response was to add structural defenses (supervision, circuit breakers, resource limits) that prevent the class of failure, not just the specific instance.

## Related Terms

- [Chaos Engineering](@/glossary/chaos-engineering.md) -- Discipline of proactively testing chaos resilience
- [Fault Tolerance](@/glossary/fault-tolerance.md) -- System property of operating correctly despite failures
- [Let It Crash](@/glossary/let-it-crash.md) -- Philosophy embracing failure as normal operation
- [Adversarial Conditions](@/glossary/adversarial-conditions.md) -- Intentionally hostile operational environments
- [Circuit Breaker](@/glossary/circuit-breaker.md) -- Pattern preventing cascading failures from chaos
- [Supervision Tree](@/glossary/supervision-tree.md) -- Hierarchical failure recovery structure
- [Backpressure](@/glossary/backpressure.md) -- Flow control under chaotic load conditions
- [Self-Healing](@/glossary/self-healing.md) -- Automated recovery from persistent chaos
- [Distributed System](@/glossary/distributed-system.md) -- Systems where chaos is amplified by network boundaries
- [Component Failures](@/glossary/component-failures.md) -- Individual failure modes within chaotic systems

## See Also

- [Architecture](@/architecture/_index.md) -- Platform resilience architecture
- [Capabilities](@/capabilities/_index.md) -- Fault tolerance capabilities
- Glossary -- Complete glossary index

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
