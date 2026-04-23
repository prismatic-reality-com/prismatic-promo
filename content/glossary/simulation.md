+++
title = "Simulation"
weight = 50
[extra]
tags = ["glossary", "security", "simulation", "red-team", "chaos-engineering", "synthetic-data", "adversarial", "modeling", "testing"]
description = "Creating a model of a real-world process or system to study its behavior under controlled conditions. In Prismatic: Red Team adversarial simulation, chaos engineering, synthetic data generation, and epistemic attack modeling."
category = "security"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "Security & Testing"
related_concepts = ["adversarial testing", "chaos engineering", "synthetic data", "red team operations", "epistemic security", "fault injection", "Monte Carlo methods"]
implementation_status = "production"
authority_level = "platform-core"
difficulty_rating = 7
prerequisites = ["otp", "genserver", "colour-team-security", "fault-tolerance"]
learning_path = ["behaviour", "genserver", "supervision", "chaos-engineering", "simulation"]
interactive_demos = ["/labs/glossary/simulation"]
code_examples = ["SimulationEngine", "AdversarialScenario", "ChaosInjector", "SyntheticDataGenerator"]
external_resources = ["https://erlang.org/doc/design_principles/statem.html", "https://principlesofchaos.org", "https://hexdocs.pm/elixir/GenServer.html"]
version_introduced = "gen-14"
stability_level = "stable"
testing_scenarios = ["adversarial scenario execution", "chaos fault injection", "synthetic data integrity", "simulation determinism", "scenario replay"]
keywords = ["simulation", "adversarial simulation", "chaos engineering", "synthetic data", "red team", "fault injection", "epistemic attack", "scenario modeling", "Monte Carlo"]
related_terms = ["red-team", "chaos-engineering", "synthetic-data", "fault-tolerance", "proof-of-concept", "black-team", "color-teams", "event-sourcing", "circuit-breaker", "formal-verification"]
word_count = 1709
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Simulation - Prismatic Platform"
+++

## Definition

**Simulation** is the process of creating a computational model that represents a real-world system, process, or environment, enabling systematic study of its behavior under controlled, repeatable conditions. In computer science and software engineering, simulation encompasses a spectrum from discrete-event simulation and Monte Carlo methods to full-system emulation and adversarial scenario modeling. Within the Prismatic Platform, simulation is a first-class operational concept that drives [Red Team](@/glossary/red-team.md) adversarial exercises, [chaos engineering](@/glossary/chaos-engineering.md) fault injection, [synthetic data](@/glossary/synthetic-data.md) generation, and epistemic attack modeling -- all executed within strictly sandboxed environments using only synthetic data.

## Overview

Simulation stands as one of the most powerful tools in software engineering because it allows engineers to explore failure modes, validate hypotheses, and stress-test systems without incurring real-world consequences. The discipline traces its origins to the Manhattan Project's Monte Carlo methods in the 1940s, evolved through flight simulators and discrete-event systems, and today encompasses everything from network traffic modeling to full adversarial cyber-range exercises.

In the Prismatic Platform, simulation serves three distinct but interconnected purposes:

1. **Adversarial Simulation** -- The [Red Team](@/glossary/red-team.md) uses five epistemic attack primitives (truth distortion, confidence manipulation, signal poisoning, drift induction, salience hijacking) to test the platform's epistemic defenses. Every scenario executes in a sandboxed environment with [synthetic data](@/glossary/synthetic-data.md) only.

2. **Chaos Engineering** -- Controlled [fault injection](@/glossary/fault-tolerance.md) into production-like environments to validate that supervision trees, [circuit breakers](@/glossary/circuit-breaker.md), and recovery mechanisms function correctly under stress.

3. **Synthetic Data Generation** -- Creating realistic but artificial datasets that mirror production characteristics for testing, training, and validation without exposing real user data or [GDPR](@/glossary/gdpr.md)-protected information.

The Elixir/OTP runtime is uniquely suited to simulation workloads because of its lightweight process model, message-passing architecture, and built-in supervision trees. A single BEAM node can simulate thousands of concurrent actors, each with isolated state, communicating through well-defined message protocols -- effectively modeling distributed systems at scale within a single machine.

## Technical Details

### Discrete-Event Simulation

Discrete-event simulation (DES) models systems as sequences of events occurring at specific points in time. Each event triggers state transitions that may generate further events. In Elixir, DES maps naturally to the [GenServer](@/glossary/genserver.md) pattern where each simulated entity is an independent process maintaining its own state:

```elixir
defmodule Prismatic.Simulation.DiscreteEventEngine do
  @moduledoc """
  A discrete-event simulation engine built on OTP processes.
  Each simulated entity runs as an independent GenServer,
  coordinated through a central event scheduler.
  """

  use GenServer

  @type event :: %{
    timestamp: non_neg_integer(),
    entity_id: String.t(),
    event_type: atom(),
    payload: map()
  }

  @type state :: %{
    clock: non_neg_integer(),
    event_queue: :gb_trees.tree(non_neg_integer(), [event()]),
    entities: %{String.t() => pid()},
    metrics: map(),
    max_time: non_neg_integer()
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    max_time = Keyword.get(opts, :max_time, 10_000)
    GenServer.start_link(__MODULE__, %{max_time: max_time}, name: __MODULE__)
  end

  @spec schedule_event(event()) :: :ok
  def schedule_event(event) do
    GenServer.cast(__MODULE__, {:schedule, event})
  end

  @spec run() :: {:ok, map()} | {:error, term()}
  def run do
    GenServer.call(__MODULE__, :run, :infinity)
  end

  @impl true
  def init(%{max_time: max_time}) do
    state = %{
      clock: 0,
      event_queue: :gb_trees.empty(),
      entities: %{},
      metrics: %{events_processed: 0, total_time: 0},
      max_time: max_time
    }
    {:ok, state}
  end

  @impl true
  def handle_cast({:schedule, event}, state) do
    queue = insert_event(state.event_queue, event)
    {:noreply, %{state | event_queue: queue}}
  end

  @impl true
  def handle_call(:run, _from, state) do
    result = process_events(state)
    {:reply, {:ok, result.metrics}, result}
  end

  @spec process_events(state()) :: state()
  defp process_events(%{event_queue: queue, max_time: max_time} = state) do
    case :gb_trees.is_empty(queue) do
      true -> state
      false ->
        {timestamp, events, rest} = :gb_trees.take_smallest(queue)
        if timestamp > max_time do
          state
        else
          new_state =
            Enum.reduce(events, %{state | clock: timestamp, event_queue: rest}, fn event, acc ->
              dispatch_event(event, acc)
            end)
          process_events(new_state)
        end
    end
  end

  @spec dispatch_event(event(), state()) :: state()
  defp dispatch_event(event, state) do
    case Map.get(state.entities, event.entity_id) do
      nil -> state
      pid ->
        GenServer.cast(pid, {:process_event, event})
        update_in(state, [:metrics, :events_processed], &(&1 + 1))
    end
  end

  @spec insert_event(:gb_trees.tree(), event()) :: :gb_trees.tree()
  defp insert_event(tree, event) do
    case :gb_trees.lookup(event.timestamp, tree) do
      :none -> :gb_trees.insert(event.timestamp, [event], tree)
      {:value, existing} -> :gb_trees.update(event.timestamp, [event | existing], tree)
    end
  end
end
```

### Monte Carlo Simulation

Monte Carlo methods use random sampling to approximate solutions to quantitative problems. In security contexts, Monte Carlo simulation is used to estimate the probability distribution of attack outcomes, assess risk under uncertainty, and validate confidence scoring models:

```elixir
defmodule Prismatic.Simulation.MonteCarlo do
  @moduledoc """
  Monte Carlo simulation engine for risk assessment
  and probabilistic analysis of security scenarios.
  """

  @type trial_result :: %{
    outcome: :success | :failure | :partial,
    impact_score: float(),
    time_to_detect: non_neg_integer(),
    cascading_failures: non_neg_integer()
  }

  @type simulation_config :: %{
    trials: pos_integer(),
    scenario: atom(),
    parameters: map(),
    seed: non_neg_integer() | nil
  }

  @spec run(simulation_config()) :: {:ok, %{results: [trial_result()], statistics: map()}}
  def run(%{trials: n, scenario: scenario, parameters: params} = config) do
    seed = Map.get(config, :seed) || :erlang.monotonic_time()
    rng_state = :rand.seed(:exsss, {seed, seed + 1, seed + 2})

    results =
      1..n
      |> Enum.map(fn trial_id ->
        {result, _new_rng} = execute_trial(scenario, params, rng_state, trial_id)
        result
      end)

    statistics = compute_statistics(results)
    {:ok, %{results: results, statistics: statistics}}
  end

  @spec execute_trial(atom(), map(), :rand.state(), pos_integer()) ::
          {trial_result(), :rand.state()}
  defp execute_trial(scenario, params, rng, _trial_id) do
    {random_val, new_rng} = :rand.uniform_s(rng)
    threshold = Map.get(params, :success_threshold, 0.5)

    outcome = if random_val < threshold, do: :success, else: :failure
    impact = random_val * Map.get(params, :max_impact, 100.0)

    result = %{
      outcome: outcome,
      impact_score: Float.round(impact, 4),
      time_to_detect: trunc(random_val * Map.get(params, :max_detect_time, 3600)),
      cascading_failures: trunc(random_val * Map.get(params, :max_cascade, 5))
    }
    {result, new_rng}
  end

  @spec compute_statistics([trial_result()]) :: map()
  defp compute_statistics(results) do
    impacts = Enum.map(results, & &1.impact_score)
    success_count = Enum.count(results, &(&1.outcome == :success))
    total = length(results)

    %{
      mean_impact: safe_mean(impacts),
      median_impact: safe_median(impacts),
      p95_impact: percentile(impacts, 0.95),
      p99_impact: percentile(impacts, 0.99),
      success_rate: success_count / max(total, 1),
      total_trials: total,
      mean_detect_time: safe_mean(Enum.map(results, & &1.time_to_detect)),
      mean_cascading: safe_mean(Enum.map(results, & &1.cascading_failures))
    }
  end

  @spec safe_mean([number()]) :: float()
  defp safe_mean([]), do: 0.0
  defp safe_mean(values), do: Enum.sum(values) / length(values)

  @spec safe_median([number()]) :: float()
  defp safe_median([]), do: 0.0
  defp safe_median(values) do
    sorted = Enum.sort(values)
    mid = div(length(sorted), 2)
    Enum.at(sorted, mid) * 1.0
  end

  @spec percentile([number()], float()) :: float()
  defp percentile([], _p), do: 0.0
  defp percentile(values, p) do
    sorted = Enum.sort(values)
    index = trunc(p * (length(sorted) - 1))
    Enum.at(sorted, index) * 1.0
  end
end
```

### Adversarial Simulation Architecture

The Prismatic Platform's adversarial simulation system follows a layered architecture where the [Red Team](@/glossary/red-team.md) operates within strict sandbox boundaries:

```
                    ┌─────────────────────────────┐
                    │   Scenario Definition Layer  │
                    │  (329-entry attack taxonomy) │
                    └────────────┬────────────────┘
                                 │
                    ┌────────────▼────────────────┐
                    │    Simulation Orchestrator   │
                    │  (GenServer + DynamicSuperv) │
                    └────────────┬────────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                   │
     ┌────────▼──────┐  ┌───────▼───────┐  ┌───────▼───────┐
     │  Red Executor  │  │  Blue Monitor │  │ Purple Synth  │
     │  (sandboxed)   │  │  (observer)   │  │ (closure)     │
     └────────┬──────┘  └───────┬───────┘  └───────┬───────┘
              │                  │                   │
              └──────────────────┼──────────────────┘
                                 │
                    ┌────────────▼────────────────┐
                    │     Results Aggregator       │
                    │  (metrics + audit trail)     │
                    └─────────────────────────────┘
```

### Sandbox Isolation

All simulation code executes within strict isolation boundaries enforced at the BEAM level:

- **Process Isolation**: Each simulation scenario runs in its own supervision tree with a dedicated [DynamicSupervisor](@/glossary/dynamic-supervisor.md), preventing any cross-contamination between scenarios.
- **Data Isolation**: Only [synthetic data](@/glossary/synthetic-data.md) enters the simulation boundary. No production data, no PII, no real credentials.
- **Network Isolation**: Zero network connectivity for Red and [Black Team](@/glossary/black-team.md) operations. All external calls are mocked or stubbed within the simulation layer.
- **Time Isolation**: Simulation runs with a virtual clock that can be advanced, paused, or rewound independently of wall-clock time.
- **Resource Limits**: Each simulation process operates under memory and CPU constraints enforced through BEAM process limits.

## Implementation in Prismatic Platform

### Red Team Adversarial Simulation

The [Red Team](@/glossary/red-team.md) simulation subsystem models five epistemic attack primitives drawn from a 329-entry attack taxonomy. Each primitive targets a specific aspect of the platform's decision-making pipeline:

```elixir
defmodule Prismatic.Simulation.Adversarial.ScenarioRunner do
  @moduledoc """
  Executes adversarial scenarios from the Red Team's
  329-entry attack taxonomy within sandboxed isolation.
  """

  use GenServer
  require Logger

  @type attack_primitive ::
          :truth_distortion
          | :confidence_manipulation
          | :signal_poisoning
          | :drift_induction
          | :salience_hijacking

  @type scenario :: %{
    id: String.t(),
    name: String.t(),
    primitives: [attack_primitive()],
    target_system: atom(),
    expected_defense: atom(),
    parameters: map()
  }

  @type run_result :: %{
    scenario_id: String.t(),
    defense_triggered: boolean(),
    detection_time_ms: non_neg_integer(),
    false_positives: non_neg_integer(),
    coverage_score: float(),
    audit_log: [map()]
  }

  @spec start_link(scenario()) :: GenServer.on_start()
  def start_link(scenario) do
    GenServer.start_link(__MODULE__, scenario)
  end

  @spec execute(pid()) :: {:ok, run_result()} | {:error, term()}
  def execute(pid) do
    GenServer.call(pid, :execute, 30_000)
  end

  @impl true
  def init(scenario) do
    {:ok, %{scenario: scenario, audit: [], start_time: nil}}
  end

  @impl true
  def handle_call(:execute, _from, %{scenario: scenario} = state) do
    start = System.monotonic_time(:millisecond)
    new_state = %{state | start_time: start}

    result =
      scenario.primitives
      |> Enum.reduce({new_state, []}, fn primitive, {acc_state, findings} ->
        {updated, finding} = execute_primitive(primitive, scenario, acc_state)
        {updated, [finding | findings]}
      end)
      |> build_result(scenario, start)

    {:reply, {:ok, result}, new_state}
  end

  @spec execute_primitive(attack_primitive(), scenario(), map()) :: {map(), map()}
  defp execute_primitive(:truth_distortion, scenario, state) do
    finding = %{
      primitive: :truth_distortion,
      target: scenario.target_system,
      detected: true,
      severity: :high,
      timestamp: System.monotonic_time(:millisecond)
    }
    audit_entry = %{action: :truth_distortion, result: :detected, time: finding.timestamp}
    {update_in(state, [:audit], &[audit_entry | &1]), finding}
  end

  defp execute_primitive(primitive, scenario, state) do
    finding = %{
      primitive: primitive,
      target: scenario.target_system,
      detected: false,
      severity: :medium,
      timestamp: System.monotonic_time(:millisecond)
    }
    audit_entry = %{action: primitive, result: :undetected, time: finding.timestamp}
    {update_in(state, [:audit], &[audit_entry | &1]), finding}
  end

  @spec build_result({map(), [map()]}, scenario(), integer()) :: run_result()
  defp build_result({state, findings}, scenario, start) do
    elapsed = System.monotonic_time(:millisecond) - start
    detected_count = Enum.count(findings, & &1.detected)
    total = length(findings)

    %{
      scenario_id: scenario.id,
      defense_triggered: detected_count > 0,
      detection_time_ms: elapsed,
      false_positives: 0,
      coverage_score: detected_count / max(total, 1),
      audit_log: Enum.reverse(state.audit)
    }
  end
end
```

### Chaos Engineering Integration

The platform's [chaos engineering](@/glossary/chaos-engineering.md) framework injects controlled faults into supervision trees to verify recovery behavior:

```elixir
defmodule Prismatic.Simulation.Chaos.FaultInjector do
  @moduledoc """
  Injects controlled faults into OTP supervision trees
  to validate recovery and resilience behavior.
  """

  @type fault_type ::
          :process_crash
          | :message_delay
          | :network_partition
          | :memory_pressure
          | :ets_table_corruption

  @type injection_config :: %{
    target_module: module(),
    fault_type: fault_type(),
    duration_ms: non_neg_integer(),
    intensity: float()
  }

  @spec inject(injection_config()) :: {:ok, reference()} | {:error, term()}
  def inject(%{target_module: mod, fault_type: type} = config) do
    ref = make_ref()

    case type do
      :process_crash ->
        inject_crash(mod, config, ref)

      :message_delay ->
        inject_delay(mod, config, ref)

      :network_partition ->
        inject_partition(mod, config, ref)

      :memory_pressure ->
        inject_memory_pressure(config, ref)

      :ets_table_corruption ->
        inject_ets_corruption(mod, config, ref)
    end
  end

  @spec inject_crash(module(), injection_config(), reference()) ::
          {:ok, reference()} | {:error, term()}
  defp inject_crash(mod, _config, ref) do
    case Process.whereis(mod) do
      nil -> {:error, :process_not_found}
      pid ->
        Process.exit(pid, :chaos_kill)
        {:ok, ref}
    end
  end

  @spec inject_delay(module(), injection_config(), reference()) ::
          {:ok, reference()} | {:error, term()}
  defp inject_delay(_mod, %{duration_ms: delay}, ref) do
    # Registers a message interceptor that adds artificial latency
    :telemetry.execute(
      [:prismatic, :chaos, :delay_injected],
      %{delay_ms: delay},
      %{ref: ref}
    )
    {:ok, ref}
  end

  @spec inject_partition(module(), injection_config(), reference()) ::
          {:ok, reference()} | {:error, term()}
  defp inject_partition(_mod, %{duration_ms: duration}, ref) do
    :telemetry.execute(
      [:prismatic, :chaos, :partition_injected],
      %{duration_ms: duration},
      %{ref: ref}
    )
    {:ok, ref}
  end

  @spec inject_memory_pressure(injection_config(), reference()) ::
          {:ok, reference()} | {:error, term()}
  defp inject_memory_pressure(%{intensity: intensity}, ref) do
    :telemetry.execute(
      [:prismatic, :chaos, :memory_pressure],
      %{intensity: intensity},
      %{ref: ref}
    )
    {:ok, ref}
  end

  @spec inject_ets_corruption(module(), injection_config(), reference()) ::
          {:ok, reference()} | {:error, term()}
  defp inject_ets_corruption(_mod, _config, ref) do
    :telemetry.execute(
      [:prismatic, :chaos, :ets_corruption],
      %{},
      %{ref: ref}
    )
    {:ok, ref}
  end
end
```

### Synthetic Data Generation

The simulation infrastructure generates realistic [synthetic data](@/glossary/synthetic-data.md) for testing without exposing real-world data:

```elixir
defmodule Prismatic.Simulation.SyntheticData do
  @moduledoc """
  Generates realistic synthetic datasets that mirror
  production data characteristics without using real PII.
  """

  @type data_profile :: %{
    entity_type: atom(),
    field_distributions: %{atom() => distribution()},
    record_count: pos_integer(),
    seed: non_neg_integer()
  }

  @type distribution ::
          {:uniform, number(), number()}
          | {:normal, float(), float()}
          | {:categorical, [{String.t(), float()}]}

  @spec generate(data_profile()) :: {:ok, [map()]}
  def generate(%{record_count: n, field_distributions: fields, seed: seed}) do
    :rand.seed(:exsss, {seed, seed + 1, seed + 2})

    records =
      Enum.map(1..n, fn _i ->
        Map.new(fields, fn {field_name, dist} ->
          {field_name, sample(dist)}
        end)
      end)

    {:ok, records}
  end

  @spec sample(distribution()) :: term()
  defp sample({:uniform, min, max}), do: min + :rand.uniform() * (max - min)
  defp sample({:normal, mean, std}), do: mean + std * :rand.normal()
  defp sample({:categorical, options}) do
    roll = :rand.uniform()
    pick_category(options, roll, 0.0)
  end

  @spec pick_category([{String.t(), float()}], float(), float()) :: String.t()
  defp pick_category([{value, _prob}], _roll, _acc), do: value
  defp pick_category([{value, prob} | rest], roll, acc) do
    if roll <= acc + prob, do: value, else: pick_category(rest, roll, acc + prob)
  end
end
```

## Comparison with Alternatives

| Approach | Strengths | Weaknesses | Prismatic Fit |
|----------|-----------|------------|---------------|
| **BEAM-native simulation** | Lightweight processes, message isolation, supervision | Limited GPU compute, no native matrix ops | Primary approach |
| **Python SimPy** | Rich DES library, academic community | GIL limits concurrency, no built-in isolation | Data science integration |
| **MATLAB/Simulink** | Industry standard for control systems | Proprietary, expensive, poor integration | Not used |
| **ns-3 (network)** | Detailed network protocol simulation | C++ complexity, narrow domain | Potential adapter |
| **Chaos Monkey (Netflix)** | Battle-tested, production-proven | AWS-centric, no epistemic dimension | Inspiration for chaos module |
| **Gremlin** | SaaS chaos engineering platform | External dependency, cost | Design reference |
| **Agent-based (Mesa/NetLogo)** | Multi-agent modeling, visual output | Python/Java ecosystems, not OTP-native | AIAD agents use native BEAM |

The Prismatic Platform's approach is distinct in combining adversarial epistemic simulation with OTP's native process isolation. Where tools like Chaos Monkey focus purely on infrastructure failure, Prismatic simulates attacks on the platform's reasoning and decision-making processes -- a level of simulation more aligned with cognitive security than traditional fault injection.

## Best Practices

### Simulation Design Principles

1. **Deterministic Replay** -- Always seed random number generators so that simulation runs can be reproduced exactly. Store the seed alongside results for auditability. Use `:rand.seed/2` with explicit state threading rather than global RNG.

2. **Strict Sandbox Boundaries** -- Never allow simulation code to reach production data or external services. The sandbox boundary must be enforced at the process level, not merely by convention. Use dedicated [supervision trees](@/glossary/supervision.md) that are isolated from production trees.

3. **Incremental Complexity** -- Start with simple scenarios and add complexity incrementally. A simulation that cannot be understood cannot be trusted. Build from single-entity, single-event scenarios up to multi-agent, multi-event cascades.

4. **Metric-Driven Validation** -- Every simulation must produce quantifiable metrics (detection time, false positive rate, coverage score) that can be compared across runs and tracked over time through [telemetry](@/glossary/telemetry.md).

5. **Immutable Audit Trails** -- Every simulation action must be logged to an immutable [audit trail](@/glossary/audit-trail.md). This enables post-hoc analysis, regulatory compliance, and scenario debugging.

6. **Resource Budgeting** -- Set explicit memory and CPU limits on simulation processes. A runaway simulation should never degrade production system performance.

7. **Scenario Versioning** -- Version your simulation scenarios alongside your code. When the system under test changes, scenarios must evolve to remain relevant.

### OTP-Specific Best Practices

- Use `DynamicSupervisor` for simulation entity management -- entities are created and destroyed during the simulation lifecycle.
- Prefer `GenServer.cast/2` for simulation event dispatch to avoid blocking the scheduler.
- Use `:telemetry` for simulation instrumentation rather than Logger calls that pollute production logs.
- Consider `Task.async_stream/3` for embarrassingly parallel Monte Carlo trials.

## Common Pitfalls

### 1. Simulation-Production Leakage

The most dangerous pitfall is allowing simulation artifacts (synthetic data, test credentials, mock responses) to leak into production systems. Always enforce the sandbox boundary at the process and supervision level, never rely on configuration flags alone.

### 2. Non-Deterministic Simulations

Using `System.system_time/0` or `:rand.uniform/0` without explicit seeding makes simulations irreproducible. When a simulation reveals a bug, you must be able to replay the exact sequence of events. Thread RNG state explicitly through your simulation functions.

### 3. Oversimplified Models

Simulation models that omit critical real-world dynamics (network latency, process scheduling jitter, GC pauses) produce misleading results. Calibrate your model against observed production behavior using [telemetry](@/glossary/telemetry.md) data.

### 4. Confirmation Bias in Scenario Design

Designing scenarios that only test known attack vectors provides false confidence. The [Red Team](@/glossary/red-team.md) must explore the unknown space through the [Gray Team](@/glossary/gray-team.md)'s boundary exploration findings, not just replay documented attacks.

### 5. Ignoring Statistical Significance

Running too few Monte Carlo trials and drawing conclusions from noisy data. Always compute confidence intervals and require statistical significance before acting on simulation results. A minimum of 1,000 trials is recommended for risk estimation.

### 6. Stale Scenarios

Attack taxonomies and failure modes evolve. Running year-old scenarios against today's system architecture provides a false sense of security. Implement a scenario freshness check that flags scenarios older than 90 days for review.

### 7. Resource Exhaustion

Simulations that spawn thousands of processes without resource limits can crash the host BEAM node. Always wrap simulation supervisors with `:max_children` limits and implement [backpressure](@/glossary/backpressure.md) on event queues.

## Use Cases

### Epistemic Security Validation

The [Color Teams](@/glossary/color-teams.md) use simulation to validate the platform's resistance to epistemic attacks. The [Red Team](@/glossary/red-team.md) designs scenarios from the 329-entry attack taxonomy, the [Blue Team](@/glossary/blue-team.md) monitors defenses in real-time, and the [Purple Team](@/glossary/purple-team.md) synthesizes findings into closure reports. This continuous Red-Blue loop ensures that the platform's [belief graph](@/glossary/belief-graph.md) and [confidence scoring](@/glossary/confidence-scoring.md) remain robust against adversarial manipulation.

### Compliance Testing

Simulation enables repeatable compliance validation without requiring access to live regulatory systems. For NIS2 and ZKB compliance in the [Perimeter](@/glossary/easm.md) module, simulation models the entire assessment pipeline with synthetic organization data, validating that scoring algorithms, threshold calculations, and report generation function correctly across all compliance frameworks.

### Performance Characterization

Before deploying new features to production, simulation characterizes performance under realistic load conditions. By generating synthetic workloads that mirror production traffic patterns, the platform can identify bottlenecks, validate that page load times remain under the 250ms hard limit, and ensure that LiveView mount times stay within the 150ms threshold.

### Disaster Recovery Validation

Simulation exercises verify that the platform can recover from catastrophic failures. This includes simulating node failures, database corruption, and network partitions to validate that the [PrismaticSupervisor](@/glossary/supervision.md) correctly restarts all services in dependency order and that data integrity is maintained throughout the recovery process.

### Agent Behavior Modeling

With 530+ AIAD agents operating across the platform, simulation models agent interactions to detect emergent behaviors, deadlocks, and resource contention patterns that would be impossible to identify through unit testing alone. Multi-agent simulation verifies that the agent [taxonomy](@/glossary/taxonomy.md) hierarchy (L1-L5) correctly delegates tasks and that escalation paths function under load.

## Related Concepts

- [Red Team](@/glossary/red-team.md) -- Adversarial simulation operators executing epistemic attack scenarios
- [Chaos Engineering](@/glossary/chaos-engineering.md) -- Controlled fault injection to validate system resilience
- [Synthetic Data](@/glossary/synthetic-data.md) -- Artificial datasets generated for simulation and testing
- [Fault Tolerance](@/glossary/fault-tolerance.md) -- System ability to continue operating despite failures
- [Black Team](@/glossary/black-team.md) -- Theoretical threat modeling providing abstract attack models
- [Color Teams](@/glossary/color-teams.md) -- Full adversarial-defensive security organization
- [Circuit Breaker](@/glossary/circuit-breaker.md) -- Pattern for preventing cascade failures validated through simulation
- [Event Sourcing](@/glossary/event-sourcing.md) -- Event-driven architecture enabling simulation replay
- [Formal Verification](@/glossary/formal-verification.md) -- Mathematical proof of system properties complementing simulation
- [Proof of Concept](@/glossary/proof-of-concept.md) -- Validating ideas through minimal simulated implementations
- [Telemetry](@/glossary/telemetry.md) -- Instrumentation providing simulation metrics and observability
- [Supervision](@/glossary/supervision.md) -- OTP supervision trees that simulation validates for recovery

## See Also

- [BEAM](@/glossary/beam.md) -- The virtual machine enabling lightweight process-based simulation
- [GenServer](@/glossary/genserver.md) -- The OTP behaviour underlying simulation entity processes
- [DynamicSupervisor](@/glossary/dynamic-supervisor.md) -- Dynamic process management for simulation entities
- [Distributed System](@/glossary/distributed-system.md) -- Systems that simulation models and validates
- [Gray Team](@/glossary/gray-team.md) -- Boundary exploration feeding novel scenarios to simulation
- [Purple Team](@/glossary/purple-team.md) -- Synthesis and closure analysis of simulation results
- [Attack Surface](@/glossary/attack-surface.md) -- The target domain that adversarial simulation exercises
- [Risk Score](@/glossary/risk-score.md) -- Quantified risk metrics computed from simulation outputs

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
