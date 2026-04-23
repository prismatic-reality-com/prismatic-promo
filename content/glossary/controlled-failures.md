+++
title = "Controlled Failures"
weight = 50
[extra]
tags = ["glossary", "resilience", "fault-tolerance", "chaos-engineering", "testing"]
description = "Controlled failures are intentionally introduced or carefully managed failure conditions used to validate system resilience, test recovery mechanisms, harden fault-tolerance capabilities, and ensure that when real failures occur, the system responds predictably and gracefully rather than catastrophically."
category = "resilience"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "13 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "reliability-engineering"
related_concepts = ["chaos engineering", "fault injection", "resilience testing", "graceful degradation", "failure modes", "blast radius", "game days", "failure budgets"]
implementation_status = "production"
authority_level = "platform-core"
difficulty_rating = "advanced"
prerequisites = ["fault-tolerance", "supervision-tree", "testing", "chaos-engineering"]
learning_path = ["fault-tolerance", "let-it-crash", "chaos-engineering", "circuit-breaker", "disaster-recovery"]
interactive_demos = ["fault-injection-simulator", "supervisor-crash-recovery", "circuit-breaker-trip-demo"]
code_examples = true
external_resources = ["https://principlesofchaos.org/", "https://erlang.org/doc/design_principles/sup_princ.html", "https://hexdocs.pm/elixir/Supervisor.html"]
version_introduced = "gen-6"
stability_level = "stable"
testing_scenarios = ["process kill and restart validation", "network partition simulation", "resource exhaustion handling", "cascading failure prevention", "timeout and deadline enforcement"]
keywords = ["controlled failures", "chaos engineering", "fault injection", "resilience testing", "graceful degradation", "failure modes", "blast radius", "supervision", "let it crash", "recovery testing"]
related_terms = ["chaos-engineering", "fault-tolerance", "let-it-crash", "circuit-breaker", "supervision-tree", "self-healing", "disaster-recovery", "backpressure", "process-isolation", "reliability"]
word_count = 1446
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Controlled Failures - Prismatic Platform"
+++

## Definition

Controlled failures are failure conditions that are either intentionally introduced into a system for testing and hardening purposes, or that occur naturally but are handled through predetermined, well-tested recovery pathways. The concept encompasses two complementary practices: proactive fault injection (deliberately crashing components, dropping connections, exhausting resources) to validate resilience mechanisms, and defensive failure management (circuit breakers, bulkheads, timeouts) that constrain the blast radius of inevitable production failures.

The distinction between a controlled failure and an uncontrolled failure lies not in the nature of the fault but in the system's preparedness for it. A database connection timeout is a controlled failure when the system has a circuit breaker, retry logic, and fallback behavior; the same timeout is an uncontrolled failure when it causes a cascading crash. Controlled failures philosophy asserts that every failure mode should be anticipated, tested, and handled before it occurs in production.

## Overview

### The Philosophy of Controlled Failures

Traditional software engineering treats failures as bugs to be eliminated. Controlled failures philosophy inverts this: failures are not bugs but features of the operational environment. Networks partition, disks fill, processes crash, and dependencies become unavailable. The question is not "how do we prevent failures?" but "how do we ensure failures are controlled?"

This philosophy has deep roots in the Erlang/OTP tradition. Joe Armstrong, co-creator of Erlang, articulated the principle that software should be designed for the failures that will happen, not the successes that are expected. The "let it crash" philosophy is the purest expression of controlled failures: rather than writing defensive code to handle every error condition, design a supervision structure that can recover from any crash.

### Controlled Failures Taxonomy

**Injected Failures**: Deliberately introduced faults used for testing:
- Process kills (`Process.exit(pid, :kill)`)
- Network partition simulation
- Resource exhaustion (memory, file descriptors, connections)
- Clock skew and time manipulation
- Dependency unavailability

**Managed Failures**: Production failures handled through predetermined pathways:
- Circuit breaker trips for failed dependencies
- Timeout enforcement on external calls
- Bulkhead isolation preventing cross-domain impact
- Graceful degradation reducing functionality under stress
- Controlled shutdown when recovery is impossible

**Structural Failures**: Architectural patterns that accept and contain failures:
- Process isolation preventing fault propagation
- Supervision trees defining restart strategies
- Message queue overflow policies
- Connection pool exhaustion handling

### Why Controlled Failures Matter

Systems that have never experienced failure in testing will experience it first in production, at the worst possible time, with the least prepared team. Controlled failures inoculate a system against catastrophic production incidents by exercising recovery pathways regularly. Netflix's Chaos Monkey, Google's DiRT (Disaster Recovery Testing), and Amazon's Game Days are all expressions of this principle at scale.

For the Prismatic Platform, with 530+ agents, 115 umbrella apps, and production deployments serving security-critical OSINT and EASM workloads, controlled failures are not optional -- they are a survival requirement.

## Technical Details

### Fault Injection Framework

A systematic approach to controlled failures requires tooling that can inject faults at various system layers:

```elixir
defmodule Prismatic.ControlledFailures.FaultInjector do
  @moduledoc """
  Fault injection framework for controlled failure testing.

  Provides mechanisms to deliberately introduce failures
  at process, network, resource, and timing layers to
  validate system resilience.
  """

  use GenServer
  require Logger

  @type fault_type :: :process_crash | :timeout | :resource_exhaustion |
                      :message_loss | :slow_response | :error_response

  @type fault_config :: %{
    type: fault_type(),
    target: pid() | atom() | {atom(), atom()},
    duration_ms: non_neg_integer(),
    probability: float()
  }

  defstruct active_faults: %{}, fault_history: []

  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @doc """
  Injects a fault into the system.

  Returns {:ok, fault_id} that can be used to cancel the fault.
  Faults auto-expire after duration_ms.
  """
  @spec inject(fault_config()) :: {:ok, String.t()}
  def inject(fault_config) do
    GenServer.call(__MODULE__, {:inject, fault_config})
  end

  @doc """
  Cancels an active fault injection.
  """
  @spec cancel(String.t()) :: :ok | {:error, :not_found}
  def cancel(fault_id) do
    GenServer.call(__MODULE__, {:cancel, fault_id})
  end

  @doc """
  Lists all currently active faults.
  """
  @spec active_faults() :: list(fault_config())
  def active_faults do
    GenServer.call(__MODULE__, :list_active)
  end

  @doc """
  Checks if a specific operation should fail under current fault injection.
  Called from instrumented code paths.
  """
  @spec should_fail?(atom()) :: boolean()
  def should_fail?(operation) do
    GenServer.call(__MODULE__, {:check_fault, operation})
  end

  # --- Server Callbacks ---

  @impl GenServer
  def init(_opts) do
    {:ok, %__MODULE__{}}
  end

  @impl GenServer
  def handle_call({:inject, config}, _from, state) do
    fault_id = generate_fault_id()

    Logger.warning("Fault injected: #{fault_id} - #{inspect(config)}")

    # Schedule auto-expiry
    Process.send_after(self(), {:expire_fault, fault_id}, config.duration_ms)

    # Apply the fault
    apply_fault(config)

    new_state = %{state |
      active_faults: Map.put(state.active_faults, fault_id, config),
      fault_history: [{fault_id, config, DateTime.utc_now()} | state.fault_history]
    }

    {:reply, {:ok, fault_id}, new_state}
  end

  def handle_call({:cancel, fault_id}, _from, state) do
    case Map.pop(state.active_faults, fault_id) do
      {nil, _} ->
        {:reply, {:error, :not_found}, state}

      {_config, remaining} ->
        {:reply, :ok, %{state | active_faults: remaining}}
    end
  end

  def handle_call(:list_active, _from, state) do
    {:reply, Map.values(state.active_faults), state}
  end

  def handle_call({:check_fault, operation}, _from, state) do
    should_fail =
      state.active_faults
      |> Map.values()
      |> Enum.any?(fn config ->
        matches_operation?(config, operation) and
          :rand.uniform() <= config.probability
      end)

    {:reply, should_fail, state}
  end

  @impl GenServer
  def handle_info({:expire_fault, fault_id}, state) do
    Logger.info("Fault expired: #{fault_id}")
    {:noreply, %{state | active_faults: Map.delete(state.active_faults, fault_id)}}
  end

  defp apply_fault(%{type: :process_crash, target: target}) when is_pid(target) do
    Process.exit(target, :fault_injection)
  end

  defp apply_fault(%{type: :process_crash, target: name}) when is_atom(name) do
    case Process.whereis(name) do
      nil -> Logger.warning("Fault target #{name} not found")
      pid -> Process.exit(pid, :fault_injection)
    end
  end

  defp apply_fault(_config), do: :ok

  defp matches_operation?(%{target: target}, operation) when is_atom(target) do
    target == operation
  end

  defp matches_operation?(_, _), do: false

  defp generate_fault_id do
    :crypto.strong_rand_bytes(8) |> Base.hex_encode32(case: :lower, padding: false)
  end
end
```

### Supervision-Based Controlled Failures

The BEAM's supervision model is the most mature implementation of controlled failures in any runtime. Supervisors define exactly how the system recovers from process crashes:

```elixir
defmodule Prismatic.ControlledFailures.ResilientPipeline do
  @moduledoc """
  A data processing pipeline designed for controlled failures.

  Each stage is an independent process under supervision.
  Stage failures are isolated and recovered automatically.
  Failed items are routed to a dead letter queue for later retry.
  """

  use Supervisor

  def start_link(opts \\ []) do
    Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl Supervisor
  def init(_opts) do
    children = [
      # Dead letter queue -- must survive all other crashes
      {Prismatic.ControlledFailures.DeadLetterQueue, []},

      # Processing stages -- independent, restartable
      %{
        id: :ingestion_stage,
        start: {Prismatic.ControlledFailures.Stage, :start_link,
                [%{name: :ingestion, next: :validation}]},
        restart: :permanent,
        shutdown: 5_000
      },
      %{
        id: :validation_stage,
        start: {Prismatic.ControlledFailures.Stage, :start_link,
                [%{name: :validation, next: :enrichment}]},
        restart: :permanent,
        shutdown: 5_000
      },
      %{
        id: :enrichment_stage,
        start: {Prismatic.ControlledFailures.Stage, :start_link,
                [%{name: :enrichment, next: :output}]},
        restart: :permanent,
        shutdown: 5_000
      },
      %{
        id: :output_stage,
        start: {Prismatic.ControlledFailures.Stage, :start_link,
                [%{name: :output, next: nil}]},
        restart: :permanent,
        shutdown: 5_000
      }
    ]

    # :one_for_one ensures a single stage failure only restarts that stage
    Supervisor.init(children, strategy: :one_for_one, max_restarts: 20, max_seconds: 60)
  end
end

defmodule Prismatic.ControlledFailures.Stage do
  @moduledoc """
  Individual pipeline stage with controlled failure handling.

  Processes items with timeout enforcement and dead letter routing
  for items that cannot be processed.
  """

  use GenServer
  require Logger

  @processing_timeout_ms 5_000

  defstruct [:name, :next, processed: 0, failed: 0]

  def start_link(config) do
    GenServer.start_link(__MODULE__, config, name: config.name)
  end

  @doc "Submit an item for processing."
  @spec process(atom(), map()) :: {:ok, map()} | {:error, term()}
  def process(stage_name, item) do
    GenServer.call(stage_name, {:process, item}, @processing_timeout_ms)
  end

  @impl GenServer
  def init(config) do
    {:ok, %__MODULE__{name: config.name, next: config.next}}
  end

  @impl GenServer
  def handle_call({:process, item}, _from, state) do
    case do_process(state.name, item) do
      {:ok, result} ->
        forward_or_complete(state.next, result)
        {:reply, {:ok, result}, %{state | processed: state.processed + 1}}

      {:error, reason} ->
        Prismatic.ControlledFailures.DeadLetterQueue.enqueue(
          item,
          %{stage: state.name, reason: reason, timestamp: DateTime.utc_now()}
        )

        {:reply, {:error, reason}, %{state | failed: state.failed + 1}}
    end
  end

  defp do_process(stage_name, item) do
    case stage_name do
      :ingestion -> {:ok, Map.put(item, :ingested_at, DateTime.utc_now())}
      :validation -> validate_item(item)
      :enrichment -> {:ok, Map.put(item, :enriched, true)}
      :output -> {:ok, item}
      _ -> {:error, {:unknown_stage, stage_name}}
    end
  end

  defp validate_item(item) do
    if Map.has_key?(item, :data) do
      {:ok, Map.put(item, :validated, true)}
    else
      {:error, :missing_data_field}
    end
  end

  defp forward_or_complete(nil, _result), do: :ok
  defp forward_or_complete(next_stage, result) do
    process(next_stage, result)
  end
end

defmodule Prismatic.ControlledFailures.DeadLetterQueue do
  @moduledoc """
  Dead letter queue for items that failed processing.

  Stores failed items with failure metadata for later
  retry or manual investigation.
  """

  use GenServer

  defstruct items: :queue.new(), count: 0

  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec enqueue(map(), map()) :: :ok
  def enqueue(item, failure_metadata) do
    GenServer.cast(__MODULE__, {:enqueue, item, failure_metadata})
  end

  @spec drain() :: list({map(), map()})
  def drain do
    GenServer.call(__MODULE__, :drain)
  end

  @spec count() :: non_neg_integer()
  def count do
    GenServer.call(__MODULE__, :count)
  end

  @impl GenServer
  def init(_opts), do: {:ok, %__MODULE__{}}

  @impl GenServer
  def handle_cast({:enqueue, item, metadata}, state) do
    new_queue = :queue.in({item, metadata}, state.items)
    {:noreply, %{state | items: new_queue, count: state.count + 1}}
  end

  @impl GenServer
  def handle_call(:drain, _from, state) do
    items = :queue.to_list(state.items)
    {:reply, items, %{state | items: :queue.new(), count: 0}}
  end

  def handle_call(:count, _from, state) do
    {:reply, state.count, state}
  end
end
```

### Blast Radius Containment with Bulkheads

Bulkhead isolation ensures that a failure in one subsystem cannot exhaust resources shared with other subsystems:

```elixir
defmodule Prismatic.ControlledFailures.BulkheadPool do
  @moduledoc """
  Bulkhead pattern implementation using process pools.

  Each subsystem gets a dedicated pool of worker processes.
  If one pool is exhausted (all workers busy or crashed),
  other pools continue operating independently.
  """

  use DynamicSupervisor

  def start_link(opts) do
    DynamicSupervisor.start_link(__MODULE__, opts, name: opts[:name])
  end

  @impl DynamicSupervisor
  def init(_opts) do
    DynamicSupervisor.init(strategy: :one_for_one, max_children: 100)
  end

  @doc """
  Executes work within a bulkhead-isolated pool.

  Returns {:ok, result} on success, {:error, :pool_exhausted}
  if the bulkhead has reached capacity.
  """
  @spec execute(atom(), (-> term()), keyword()) ::
          {:ok, term()} | {:error, :pool_exhausted | :timeout | term()}
  def execute(pool_name, work_fn, opts \\ []) do
    timeout = Keyword.get(opts, :timeout, 5_000)

    task =
      Task.Supervisor.async_nolink(pool_name, fn ->
        work_fn.()
      end)

    case Task.yield(task, timeout) || Task.shutdown(task) do
      {:ok, result} -> {:ok, result}
      {:exit, reason} -> {:error, reason}
      nil -> {:error, :timeout}
    end
  rescue
    _ -> {:error, :pool_exhausted}
  end
end
```

## Implementation in Prismatic Platform

### Process Isolation Across 115 Apps

Every umbrella application runs under its own supervision tree. A crash in `prismatic_perimeter` (EASM) cannot affect `prismatic_web` (LiveView dashboard) or `prismatic_agents` (agent runtime). The `PrismaticSupervisor` application manages this isolation through domain supervisors that group related applications.

### Circuit Breaker for OSINT Sources

The 120+ OSINT adapters (Shodan, VirusTotal, ARES, etc.) each have circuit breaker protection. When an external source becomes unavailable, the circuit opens and the platform continues operating with data from other sources. The circuit breaker state is monitored through the health monitoring dashboard.

### Pre-Commit as Controlled Failure

The 11-phase pre-commit pipeline is itself a controlled failure mechanism: it causes commits to fail in a controlled manner when quality standards are not met. Rather than allowing defective code to enter the repository and cause uncontrolled failures in production, the pre-commit pipeline fails fast with clear diagnostic output.

### Quality Floor Guardian

The Quality Floor Guardian monitors the platform's quality score and triggers automatic recovery mechanisms when quality degrades. If the score drops below 95%, commits are blocked and the autoHeal system activates to identify and repair the regression.

## Comparison with Alternatives

| Approach | Failure Detection | Recovery | Blast Radius | Proactive Testing |
|----------|------------------|----------|--------------|-------------------|
| OTP Supervision (Prismatic) | Immediate (process link) | Automatic restart | Process-level | Yes (fault injection) |
| Kubernetes Liveness Probes | Seconds (probe interval) | Pod restart | Container-level | Limited |
| Try-Catch Defensive Code | Immediate (in-process) | None (manual handling) | Function-level | No |
| External Monitoring | Minutes (polling) | Manual/Automated | Service-level | No |
| Chaos Engineering Platforms | Varies | Validates existing mechanisms | Configurable | Yes (primary purpose) |

### OTP vs Chaos Engineering

OTP supervision and chaos engineering are complementary, not competing. OTP provides the built-in controlled failure mechanisms (supervision, process isolation, link/monitor). Chaos engineering validates that these mechanisms work correctly under realistic failure scenarios. The Prismatic Platform uses both: OTP for the recovery infrastructure and fault injection for verification.

## Best Practices

1. **Start with the smallest blast radius**: Begin fault injection at the process level before escalating to service-level or system-level failures. Understand micro-failures before testing macro-failures.

2. **Always have a kill switch**: Every fault injection experiment must be immediately cancellable. Use time-bounded faults with auto-expiry as a safety net.

3. **Run in production (carefully)**: Testing failures only in staging provides false confidence. Real production environments have characteristics that staging cannot replicate. Start with low-probability, small-blast-radius experiments.

4. **Monitor during injection**: Instrument fault injection experiments with comprehensive telemetry. The value is in observing system behavior, not just the pass/fail outcome.

5. **Document failure modes**: Maintain a catalog of known failure modes and their expected recovery behavior. This catalog becomes the specification against which controlled failure tests validate.

6. **Make recovery observable**: Every recovery action (process restart, circuit breaker trip, fallback activation) should emit telemetry events that can be monitored and alerted on.

7. **Test cascading failures**: Individual component failures are straightforward. The dangerous scenarios are cascading failures where one failure triggers a chain reaction. Test multi-component failure scenarios.

8. **Use dead letter queues**: Items that cannot be processed during a failure should be preserved for later retry, not silently dropped.

## Common Pitfalls

**Injecting faults without monitoring**: Running fault injection without comprehensive monitoring is like running experiments without recording results. Always instrument before injecting.

**Unbounded blast radius**: Fault injection without proper isolation can cause production incidents. Always define and enforce blast radius limits before injecting faults.

**Testing only expected failures**: Real production failures are often unexpected combinations of individually manageable faults. Test compound failure scenarios, not just individual component failures.

**Ignoring slow failures**: Not all failures are crashes. Slow responses, memory leaks, and gradual resource exhaustion are insidious failure modes that require specific testing approaches.

**Recovery that causes more damage**: A poorly designed retry mechanism can amplify a failure (retry storm). Controlled failures testing should verify that recovery mechanisms do not worsen the situation.

**Missing the human factor**: Controlled failures should also test operational procedures: alerting, escalation, runbooks, and communication. Technical recovery is only half the picture.

## Use Cases

- **Supervision Tree Validation**: Deliberately crashing processes to verify restart strategies work correctly
- **Circuit Breaker Testing**: Simulating external service unavailability to test circuit breaker state transitions
- **Load Shedding Verification**: Overwhelming the system with traffic to verify graceful degradation behavior
- **Data Pipeline Resilience**: Injecting corrupt data to verify validation stages catch and isolate bad records
- **Network Partition Testing**: Simulating network splits to verify distributed system consistency
- **Resource Exhaustion Handling**: Filling memory or connection pools to verify exhaustion behavior
- **Deployment Safety**: Controlled rollback testing to verify that deployments can be safely reverted
- **Pre-Commit Pipeline Enforcement**: Rejecting non-conforming commits as a controlled failure of the commit process

## Related Concepts

- [Chaos Engineering](@/glossary/chaos-engineering.md) -- the discipline of experimenting on systems to build confidence in resilience
- [Fault Tolerance](@/glossary/fault-tolerance.md) -- the system's ability to continue operating despite component failures
- [Let It Crash](@/glossary/let-it-crash.md) -- the Erlang philosophy of allowing failures and recovering through supervision
- [Circuit Breaker](@/glossary/circuit-breaker.md) -- a pattern that prevents cascading failures by short-circuiting failed operations
- [Supervision Tree](@/glossary/supervision-tree.md) -- the hierarchical structure that manages process lifecycle and recovery
- [Self-Healing](@/glossary/self-healing.md) -- automated mechanisms that detect and repair system faults
- [Process Isolation](@/glossary/process-isolation.md) -- ensuring process failures do not propagate
- [Backpressure](@/glossary/backpressure.md) -- flow control that prevents resource exhaustion under load
- [Disaster Recovery](@/glossary/disaster-recovery.md) -- recovery from failures that exceed normal resilience capacity
- [Reliability](@/glossary/reliability.md) -- the overall quality attribute that controlled failures testing ensures

## See Also

- [Bulkhead Pattern](@/glossary/bulkhead-pattern.md) -- isolating failure domains through resource partitioning
- [Exponential Backoff](@/glossary/exponential-backoff.md) -- progressive retry delays for failed operations
- [Component Failures](@/glossary/component-failures.md) -- the specific failure types that controlled failures address
- [Incident Response](@/glossary/incident-response.md) -- operational procedures when controlled failures escalate

---

## Connect & Contribute

Prismatic Platform is built by [Tomas Korcak (korczis)](https://github.com/korczis) and the open-source community.

- [GitHub Repository](https://github.com/korczis/prismatic-platform) -- Source code, issues, and contributions
- [GitLab Mirror](https://gitlab.com/korczis/prismatic-platform) -- CI/CD and issue tracking
- [LinkedIn](https://linkedin.com/in/korczis) -- Professional network and updates
- [Contact](mailto:korczis@gmail.com) -- Direct communication
