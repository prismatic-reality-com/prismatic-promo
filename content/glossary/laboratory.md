+++
title = "Laboratory"
weight = 50
[extra]
description = "An experimental environment for testing hypotheses, running simulations, and validating concepts before production deployment through interactive sandboxed workspaces"
category = "infrastructure"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "advanced"
domain_category = "Development Infrastructure"
related_concepts = ["experimental validation", "hypothesis testing", "sandboxed execution", "pre-production verification", "interactive development"]
implementation_status = "production"
authority_level = "standard"
difficulty_rating = 6
prerequisites = ["phoenix", "liveview", "elixir", "otp", "telemetry"]
learning_path = ["elixir", "phoenix", "liveview", "sandbox", "laboratory"]
interactive_demos = ["/labs/glossary/laboratory"]
code_examples = ["Phoenix LiveView", "Elixir GenServer", "Property-Based Testing"]
external_resources = ["https://hexdocs.pm/phoenix_live_view/Phoenix.LiveView.html", "https://hexdocs.pm/stream_data/StreamData.html"]
version_introduced = "0.7.0"
stability_level = "stable"
testing_scenarios = ["experiment lifecycle management", "resource isolation validation", "result persistence", "concurrent experiment handling", "rollback on failure"]
keywords = ["laboratory", "labs", "experimentation", "sandbox", "hypothesis testing", "simulation", "interactive", "validation", "pre-production"]
tags = ["glossary", "infrastructure", "experimentation", "labs", "development", "sandbox", "validation"]
related_terms = ["proof-of-concept", "simulation", "property-based-testing", "chaos-engineering", "sandbox", "feature-flag", "liveview", "phoenix", "telemetry", "observability", "monitoring", "quality-gate", "formal-verification", "agent", "circuit-breaker", "fault-tolerance"]
word_count = 1689
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Laboratory - Prismatic Platform"
+++

## Definition

A Laboratory in the Prismatic Platform context is a controlled, isolated environment designed for experimentation, hypothesis validation, simulation execution, and concept verification before changes reach production systems. Accessible through the `/labs` route, the laboratory provides interactive workspaces where developers and agents can test ideas against real platform infrastructure without risking production stability. It is the bridge between theoretical design and production deployment -- every significant platform feature passes through the laboratory before it becomes part of the production codebase.

The laboratory is not a simple staging environment or a test suite runner. It is a first-class platform component with its own [supervision tree](@/glossary/supervision-tree.md), resource isolation, state management, and [telemetry](@/glossary/telemetry.md) integration. Experiments running in the laboratory produce structured results that can be reviewed, compared, and used as evidence in the [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic framework. When an experiment produces results that meet the confidence threshold for the [Trinity Gate](@/glossary/trinity-gate.md), its outputs become eligible for production integration.

## Overview

The concept of a laboratory in software engineering extends beyond traditional test environments. While test suites verify that existing code behaves correctly, laboratories enable exploration of unknown territories -- new algorithms, architectural patterns, integration approaches, and performance characteristics. The distinction is between verification (does the code do what we specified?) and exploration (what should the code do?).

In the Prismatic Platform, the laboratory serves multiple constituencies. Developers use it to prototype [LiveView](@/glossary/liveview.md) interfaces and test new [Phoenix](@/glossary/phoenix.md) features. [Agents](@/glossary/agent.md) use it to run [simulations](@/glossary/simulation.md) of adversarial scenarios, test [chaos engineering](@/glossary/chaos-engineering.md) hypotheses, and validate [property-based testing](@/glossary/property-based-testing.md) strategies. The quality system uses it to evaluate candidate improvements before they pass through [quality gates](@/glossary/quality-gate.md). The evolutionary system uses it to test fitness improvements across generations.

The laboratory architecture follows the scientific method as a software pattern: form a hypothesis, design an experiment, execute under controlled conditions, collect results, analyze, and draw conclusions. Each of these steps is represented as a distinct phase in the experiment lifecycle, with clear state transitions and rollback capabilities.

The `/labs` route in the Prismatic web interface provides an interactive dashboard for managing experiments. Users can create new experiments from templates, monitor running experiments in real-time through [LiveView](@/glossary/liveview.md) streams, compare results across experiment runs, and promote successful experiments to production candidates. The interface is built entirely with TailwindCSS and Flowbite components, following the platform's UI standards.

## Technical Details

### Experiment Lifecycle

Every experiment in the laboratory follows a well-defined lifecycle with explicit state transitions:

```
:draft -> :configured -> :validating -> :running -> :collecting -> :analyzing -> :completed
                                           |                                        |
                                           v                                        v
                                       :failed                                  :promoted
                                           |
                                           v
                                       :rolled_back
```

| State | Description | Allowed Transitions |
|-------|-------------|-------------------|
| `:draft` | Initial creation, parameters not yet set | `:configured` |
| `:configured` | Parameters set, awaiting validation | `:validating` |
| `:validating` | Pre-flight checks running | `:running`, `:failed` |
| `:running` | Experiment executing | `:collecting`, `:failed` |
| `:collecting` | Gathering results and metrics | `:analyzing` |
| `:analyzing` | Processing results, computing statistics | `:completed`, `:failed` |
| `:completed` | Results available for review | `:promoted` |
| `:failed` | Experiment failed at some stage | `:rolled_back`, `:draft` |
| `:promoted` | Results approved for production integration | Terminal |
| `:rolled_back` | Resources cleaned up after failure | Terminal |

### Resource Isolation Model

Laboratory experiments execute within isolated resource boundaries to prevent interference with production systems and with each other:

- **Process Isolation**: Each experiment runs in its own [OTP](@/glossary/otp.md) supervision subtree. A crash in one experiment cannot propagate to another or to the platform.
- **Data Isolation**: Experiments use dedicated [ETS](@/glossary/ets.md) tables or sandboxed database transactions. Production data is accessible read-only through controlled views.
- **Network Isolation**: Experiments that require external network access go through a rate-limited proxy that prevents accidental DoS of external services.
- **Time Isolation**: Experiments can use virtual clocks for time-dependent scenarios, decoupled from wall clock time.
- **Memory Isolation**: Each experiment supervision tree has configurable memory limits enforced through BEAM process monitoring.

### Telemetry Integration

Laboratories emit structured [telemetry](@/glossary/telemetry.md) events at every lifecycle transition, enabling real-time [observability](@/glossary/observability.md) and post-hoc analysis:

```elixir
# Events emitted by the laboratory system
[:prismatic_labs, :experiment, :created]
[:prismatic_labs, :experiment, :state_changed]
[:prismatic_labs, :experiment, :metric_recorded]
[:prismatic_labs, :experiment, :completed]
[:prismatic_labs, :experiment, :failed]
[:prismatic_labs, :experiment, :promoted]
```

## Implementation in Prismatic Platform

### Laboratory Server

The laboratory is backed by an OTP GenServer that manages the experiment registry, lifecycle state machine, and resource allocation:

```elixir
defmodule PrismaticWeb.Labs.LabServer do
  @moduledoc """
  Manages the lifecycle of laboratory experiments including
  creation, execution, result collection, and promotion.
  Each experiment runs in an isolated supervision subtree.
  """

  use GenServer

  alias PrismaticWeb.Labs.{Experiment, ExperimentSupervisor, ResultCollector}

  @type experiment_id :: String.t()
  @type experiment_state :: :draft | :configured | :validating | :running |
                            :collecting | :analyzing | :completed | :failed |
                            :promoted | :rolled_back
  @type lab_state :: %{
    experiments: %{experiment_id() => Experiment.t()},
    running_count: non_neg_integer(),
    max_concurrent: pos_integer()
  }

  @max_concurrent_default 10

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec create_experiment(map()) :: {:ok, Experiment.t()} | {:error, atom()}
  def create_experiment(params) do
    GenServer.call(__MODULE__, {:create, params})
  end

  @spec run_experiment(experiment_id()) :: {:ok, experiment_id()} | {:error, atom()}
  def run_experiment(experiment_id) do
    GenServer.call(__MODULE__, {:run, experiment_id})
  end

  @spec get_results(experiment_id()) :: {:ok, map()} | {:error, atom()}
  def get_results(experiment_id) do
    GenServer.call(__MODULE__, {:results, experiment_id})
  end

  @spec promote_experiment(experiment_id()) :: {:ok, map()} | {:error, atom()}
  def promote_experiment(experiment_id) do
    GenServer.call(__MODULE__, {:promote, experiment_id})
  end

  @impl GenServer
  def init(opts) do
    max_concurrent = Keyword.get(opts, :max_concurrent, @max_concurrent_default)

    state = %{
      experiments: %{},
      running_count: 0,
      max_concurrent: max_concurrent
    }

    {:ok, state}
  end

  @impl GenServer
  def handle_call({:create, params}, _from, state) do
    experiment = Experiment.new(params)

    :telemetry.execute(
      [:prismatic_labs, :experiment, :created],
      %{count: 1},
      %{experiment_id: experiment.id, type: experiment.type}
    )

    updated_experiments = Map.put(state.experiments, experiment.id, experiment)
    {:reply, {:ok, experiment}, %{state | experiments: updated_experiments}}
  end

  @impl GenServer
  def handle_call({:run, experiment_id}, _from, state) do
    with {:ok, experiment} <- fetch_experiment(state, experiment_id),
         :ok <- validate_capacity(state),
         {:ok, experiment} <- transition(experiment, :running),
         {:ok, _pid} <- ExperimentSupervisor.start_experiment(experiment) do
      updated = %{state |
        experiments: Map.put(state.experiments, experiment_id, experiment),
        running_count: state.running_count + 1
      }

      emit_state_change(experiment)
      {:reply, {:ok, experiment_id}, updated}
    else
      {:error, reason} -> {:reply, {:error, reason}, state}
    end
  end

  @impl GenServer
  def handle_call({:results, experiment_id}, _from, state) do
    case fetch_experiment(state, experiment_id) do
      {:ok, %{state: :completed} = experiment} ->
        {:reply, {:ok, experiment.results}, state}

      {:ok, %{state: exp_state}} ->
        {:reply, {:error, {:not_completed, exp_state}}, state}

      error ->
        {:reply, error, state}
    end
  end

  @impl GenServer
  def handle_call({:promote, experiment_id}, _from, state) do
    with {:ok, experiment} <- fetch_experiment(state, experiment_id),
         {:ok, experiment} <- transition(experiment, :promoted) do
      updated_experiments = Map.put(state.experiments, experiment_id, experiment)
      emit_state_change(experiment)
      {:reply, {:ok, %{id: experiment_id, promoted_at: DateTime.utc_now()}}, %{state | experiments: updated_experiments}}
    else
      {:error, reason} -> {:reply, {:error, reason}, state}
    end
  end

  @spec fetch_experiment(lab_state(), experiment_id()) ::
          {:ok, Experiment.t()} | {:error, :not_found}
  defp fetch_experiment(state, experiment_id) do
    case Map.fetch(state.experiments, experiment_id) do
      {:ok, experiment} -> {:ok, experiment}
      :error -> {:error, :not_found}
    end
  end

  @spec validate_capacity(lab_state()) :: :ok | {:error, :at_capacity}
  defp validate_capacity(%{running_count: count, max_concurrent: max}) when count >= max do
    {:error, :at_capacity}
  end

  defp validate_capacity(_state), do: :ok

  @spec transition(Experiment.t(), experiment_state()) ::
          {:ok, Experiment.t()} | {:error, :invalid_transition}
  defp transition(experiment, target_state) do
    if Experiment.valid_transition?(experiment.state, target_state) do
      {:ok, %{experiment | state: target_state, updated_at: DateTime.utc_now()}}
    else
      {:error, :invalid_transition}
    end
  end

  @spec emit_state_change(Experiment.t()) :: :ok
  defp emit_state_change(experiment) do
    :telemetry.execute(
      [:prismatic_labs, :experiment, :state_changed],
      %{count: 1},
      %{experiment_id: experiment.id, state: experiment.state}
    )
  end
end
```

### LiveView Labs Interface

The `/labs` route provides a real-time interactive interface built with Phoenix LiveView:

```elixir
defmodule PrismaticWeb.Labs.IndexLive do
  @moduledoc """
  LiveView dashboard for the Prismatic Laboratory system.
  Displays running experiments, historical results, and
  provides controls for creating and managing experiments.
  """

  use PrismaticWeb, :live_view

  alias PrismaticWeb.Labs.LabServer

  @impl Phoenix.LiveView
  def mount(_params, _session, socket) do
    if connected?(socket) do
      :ok = Phoenix.PubSub.subscribe(PrismaticWeb.PubSub, "labs:updates")
      Process.send_after(self(), :refresh_metrics, 5_000)
    end

    socket =
      socket
      |> assign(:experiments, list_experiments())
      |> assign(:running_count, count_running())
      |> assign(:page_title, "Laboratory")

    {:ok, socket}
  end

  @impl Phoenix.LiveView
  def handle_event("create_experiment", %{"type" => type, "params" => params}, socket) do
    case LabServer.create_experiment(%{type: type, params: params}) do
      {:ok, experiment} ->
        socket =
          socket
          |> assign(:experiments, [experiment | socket.assigns.experiments])
          |> put_flash(:info, "Experiment #{experiment.id} created")

        {:noreply, socket}

      {:error, reason} ->
        {:noreply, put_flash(socket, :error, "Failed: #{inspect(reason)}")}
    end
  end

  @impl Phoenix.LiveView
  def handle_event("run_experiment", %{"id" => id}, socket) do
    case LabServer.run_experiment(id) do
      {:ok, _id} ->
        {:noreply, put_flash(socket, :info, "Experiment #{id} started")}

      {:error, reason} ->
        {:noreply, put_flash(socket, :error, "Failed: #{inspect(reason)}")}
    end
  end

  @impl Phoenix.LiveView
  def handle_info(:refresh_metrics, socket) do
    Process.send_after(self(), :refresh_metrics, 5_000)

    socket =
      socket
      |> assign(:experiments, list_experiments())
      |> assign(:running_count, count_running())

    {:noreply, socket}
  end

  @spec list_experiments() :: [map()]
  defp list_experiments, do: LabServer.list_all() |> elem(1)

  @spec count_running() :: non_neg_integer()
  defp count_running, do: LabServer.running_count() |> elem(1)
end
```

## Comparison with Alternatives

### Laboratory vs. Staging Environment

| Aspect | Prismatic Laboratory | Traditional Staging |
|--------|---------------------|-------------------|
| **Purpose** | Exploration and hypothesis testing | Pre-production validation |
| **Isolation** | Per-experiment process isolation | Environment-level isolation |
| **Lifecycle** | Managed state machine with rollback | Deploy/undeploy cycles |
| **Results** | Structured, queryable, comparable | Typically manual observation |
| **Concurrency** | Multiple experiments simultaneously | Usually single deployment |
| **Integration** | Epistemic framework (NABLA) aware | No epistemic integration |
| **Audience** | Developers, agents, quality system | DevOps, QA teams |

### Laboratory vs. Feature Flags

[Feature flags](@/glossary/feature-flag.md) enable gradual rollout of completed features to production users. Laboratories enable exploration of incomplete or speculative features in controlled environments. Feature flags assume the feature works and control who sees it. Laboratories assume the feature might not work and provide the tools to find out. The two are complementary: a successful laboratory experiment often leads to a feature-flagged production rollout.

### Laboratory vs. Jupyter Notebooks

Jupyter notebooks provide interactive exploration for data science workflows. Prismatic laboratories provide interactive exploration for platform engineering workflows. The key difference is that laboratories are integrated into the platform's OTP supervision tree, telemetry system, and epistemic framework. A laboratory experiment can interact with live platform services (read-only), spawn BEAM processes, and produce results that feed directly into the quality gate system.

### Laboratory vs. Chaos Engineering Frameworks

[Chaos engineering](@/glossary/chaos-engineering.md) tools like Netflix's Chaos Monkey introduce controlled failures into production systems. Prismatic laboratories can run chaos experiments but in isolated environments rather than production. The laboratory approach trades real-world fidelity for safety -- experiments that prove stable in the laboratory can then be promoted to production chaos testing with higher confidence.

## Best Practices

1. **Hypothesis First**: Every experiment should start with a clearly stated hypothesis. "I wonder what happens if..." is exploration, not experimentation. Frame hypotheses as falsifiable statements: "Adding connection pooling will reduce P95 latency below 50ms for the `/api/v1/endpoints` route."

2. **Controlled Variables**: Isolate the variable under test. If you change three things simultaneously, you cannot attribute the result to any single change. Use the laboratory's parameter system to vary one dimension at a time.

3. **Baseline Comparison**: Always run a baseline experiment with no changes before testing the experimental condition. The laboratory stores baseline results for comparison across runs.

4. **Result Persistence**: Do not discard experiment results, even negative ones. Failed experiments provide valuable evidence for the [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic framework. The absence of a result is informative (Axiom 3: Absence Informative).

5. **Resource Limits**: Configure memory and time limits for experiments. An experiment that consumes unbounded resources is not useful -- it reveals that resource consumption is a variable that needs to be tested, not ignored.

6. **Reproducibility**: Ensure experiments can be repeated with identical results. Use deterministic seeds for randomized experiments. Pin dependency versions. Record the exact platform state at experiment start.

7. **Promotion Criteria**: Define clear criteria for promoting an experiment to production before running it. Post-hoc rationalization of what constitutes "success" is a form of [epistemic reasoning](@/glossary/epistemic-reasoning.md) failure.

## Common Pitfalls

1. **Production Data Leakage**: Experiments should not modify production data. The read-only access model exists for a reason. Even read access should be through controlled views that filter sensitive information.

2. **Infinite Experiments**: Experiments that never complete because the success criteria are too vague or continuously moving. Set time bounds and accept the results.

3. **Laboratory as Staging**: Using the laboratory as a de facto staging environment rather than an experimentation platform. Staging has different requirements (full integration testing, deployment pipeline validation) that the laboratory is not designed to satisfy.

4. **Ignoring Negative Results**: Discarding experiments that disprove the hypothesis. In science and in software, negative results are valuable. They prevent others from repeating the same failed approach.

5. **Concurrency Interference**: Running too many experiments simultaneously can cause resource contention that corrupts results. The laboratory enforces a configurable concurrency limit, but experimenters should also consider shared resource dependencies (database connections, CPU cores, network bandwidth).

6. **Skipping Validation**: The `:validating` state exists for pre-flight checks. Skipping directly from `:configured` to `:running` bypasses safety checks that detect misconfigured experiments before they waste resources.

## Use Cases

### Algorithm Comparison

A developer wants to compare three different sorting algorithms for a specific data distribution found in the platform's OSINT data. The laboratory creates three experiments with identical input data, runs them with time and memory instrumentation, collects results, and produces a comparison report that includes not just throughput but also memory allocation patterns and GC pressure.

### LiveView Performance Testing

Before deploying a new [LiveView](@/glossary/liveview.md) page, the laboratory runs load simulations with varying numbers of concurrent WebSocket connections to verify the page meets the platform's <250ms page load and <50ms handle_event requirements. The experiments produce latency distribution data at P50, P95, and P99 that feeds directly into the [performance](@/glossary/performance.md) quality gate.

### Agent Strategy Validation

When developing a new [agent](@/glossary/agent.md) strategy, the laboratory provides a [sandbox](@/glossary/sandbox.md) where the agent can operate against simulated platform state. The agent's decisions are recorded, analyzed for consistency with [NABLA Infinity](@/glossary/nabla-infinity.md) axioms, and compared against the decisions of existing agents facing the same scenarios.

### Chaos Engineering Dry Runs

Before running chaos experiments in production, teams use the laboratory to simulate failure scenarios. Process crashes, network partitions, and resource exhaustion can be injected into the experiment's supervision tree to verify that the system under test handles failures correctly -- testing [fault tolerance](@/glossary/fault-tolerance.md) and [circuit breaker](@/glossary/circuit-breaker.md) behaviors.

### Migration Validation

Database schema migrations are tested in the laboratory against snapshots of production data (anonymized) to verify correctness, measure execution time, and identify potential lock contention before the migration runs against the real database.

## Related Concepts

- [Proof of Concept](@/glossary/proof-of-concept.md) -- A specific type of laboratory experiment focused on validating feasibility
- [Simulation](@/glossary/simulation.md) -- Running models of system behavior within the laboratory environment
- [Property-Based Testing](@/glossary/property-based-testing.md) -- Generating random inputs to test properties, often run as laboratory experiments
- [Chaos Engineering](@/glossary/chaos-engineering.md) -- Controlled failure injection that can be safely prototyped in laboratories
- [Sandbox](@/glossary/sandbox.md) -- The isolation mechanism that underlies laboratory resource boundaries
- [Feature Flag](@/glossary/feature-flag.md) -- Graduated rollout mechanism for experiments promoted from the laboratory
- [LiveView](@/glossary/liveview.md) -- Technology powering the interactive laboratory dashboard at `/labs`
- [Phoenix](@/glossary/phoenix.md) -- Web framework hosting the laboratory routes and real-time updates
- [Telemetry](@/glossary/telemetry.md) -- Instrumentation system collecting experiment metrics
- [Observability](@/glossary/observability.md) -- Platform-wide visibility into laboratory experiment execution
- [Quality Gate](@/glossary/quality-gate.md) -- Gates that laboratory results can inform and satisfy
- [Formal Verification](@/glossary/formal-verification.md) -- Mathematical proofs that complement laboratory empirical validation

## See Also

- [Monitoring](@/glossary/monitoring.md) -- Real-time observation of experiment execution
- [Fault Tolerance](@/glossary/fault-tolerance.md) -- Resilience patterns tested and validated in laboratories
- [Circuit Breaker](@/glossary/circuit-breaker.md) -- Protection pattern verified through laboratory chaos experiments
- [OTP](@/glossary/otp.md) -- The supervision framework enabling laboratory process isolation
- [ETS](@/glossary/ets.md) -- In-memory storage used for experiment state within laboratories

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
