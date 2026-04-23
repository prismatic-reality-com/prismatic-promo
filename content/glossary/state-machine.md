+++
title = "State Machine"
weight = 50
[extra]
tags = ["glossary", "state-machine", "otp", "gen-statem", "finite-automata", "workflow", "elixir", "concurrency", "behaviour"]
description = "A computational model that transitions between a finite set of states based on inputs and conditions. In Elixir/OTP: gen_statem provides battle-tested state machine behaviour with callback modes for complex stateful workflows."
category = "core"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "Computation & OTP"
related_concepts = ["finite automata", "gen_statem", "GenServer", "OTP behaviours", "event sourcing", "workflow engines", "Mealy machines", "Moore machines"]
implementation_status = "production"
authority_level = "platform-core"
difficulty_rating = 7
prerequisites = ["elixir", "genserver", "otp", "behaviour"]
learning_path = ["elixir", "genserver", "behaviour", "gen-statem", "state-machine", "workflow"]
interactive_demos = ["/labs/glossary/state-machine"]
code_examples = ["CircuitBreakerStateMachine", "WorkflowStateMachine", "AgentLifecycleStateMachine", "ComplianceAssessmentStateMachine"]
external_resources = ["https://www.erlang.org/doc/design_principles/statem.html", "https://hexdocs.pm/elixir/GenServer.html", "https://en.wikipedia.org/wiki/Finite-state_machine"]
version_introduced = "gen-3"
stability_level = "stable"
testing_scenarios = ["state transition validation", "invalid transition rejection", "timeout handling", "concurrent state access", "state persistence and recovery"]
keywords = ["state machine", "finite automata", "gen_statem", "FSM", "state transition", "Mealy machine", "Moore machine", "OTP behaviour", "workflow"]
related_terms = ["gen-statem", "genserver", "otp", "behaviour", "event-sourcing", "workflow", "circuit-breaker", "supervision", "fault-tolerance", "backpressure"]
word_count = 1702
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "State Machine - Prismatic Platform"
+++

## Definition

A **State Machine** (formally, a finite-state machine or finite automaton) is a mathematical model of computation that consists of a finite set of states, a set of inputs (events), a transition function mapping (state, input) pairs to new states, an initial state, and optionally a set of accepting/final states. At any moment, the machine occupies exactly one state; upon receiving an input, it transitions to a new state determined by the transition function. In the Elixir/OTP ecosystem, state machines are implemented through the `gen_statem` [behaviour](/glossary/behaviour/) -- OTP's dedicated state machine abstraction that supersedes the older `gen_fsm`. Within the Prismatic Platform, state machines govern [circuit breaker](/glossary/circuit-breaker/) logic, agent lifecycle management, [workflow](/glossary/workflow/) orchestration, compliance assessment pipelines, and quality gate enforcement.

## Overview

State machines are among the most fundamental concepts in computer science, originating from the theoretical work of Alan Turing, Warren McCulloch, and Walter Pitts in the 1940s. They provide a precise, analyzable model for systems that must respond to sequences of events while maintaining well-defined behavioral contracts.

Two classical variants define the landscape:

- **Mealy Machines** -- Outputs depend on both the current state AND the input event. This maps naturally to OTP's `gen_statem` with `:handle_event_function` callback mode, where the handler receives both the current state and the event.

- **Moore Machines** -- Outputs depend only on the current state, not the triggering event. This maps to `gen_statem`'s `:state_functions` callback mode, where each state has its own dedicated callback function.

In practice, Elixir developers work with state machines at three levels of abstraction:

1. **Implicit State Machines** -- [GenServer](/glossary/genserver/) processes that encode state transitions in `handle_call`/`handle_cast` clauses using pattern matching on state fields. Simple but lacks formal transition validation.

2. **Explicit gen_statem** -- OTP's [gen_statem](/glossary/gen-statem/) behaviour provides first-class state machine semantics: named states, typed transitions, state enter calls, timeouts, and postponement of events that cannot be handled in the current state.

3. **Declarative State Machines** -- Libraries that allow defining state machines through data structures (transition tables, state charts) that are compiled into runtime behaviour. This enables visualization, formal verification, and automatic test generation.

The Prismatic Platform uses all three levels depending on complexity: GenServer for simple two-state components, gen_statem for [circuit breakers](/glossary/circuit-breaker/) and workflow engines, and declarative machines for compliance assessment pipelines where audit traceability requires a formal state transition log.

## Technical Details

### gen_statem Callback Modes

OTP's `gen_statem` offers two callback modes that map to the Mealy/Moore distinction:

**State Functions Mode** (`:state_functions`) -- Each state is a separate callback function. The function name IS the state name. This provides excellent pattern matching and code organization for machines with well-known, stable state sets:

```elixir
defmodule Prismatic.StateMachine.CircuitBreaker do
  @moduledoc """
  A circuit breaker implemented as a gen_statem state machine.
  States: :closed (normal), :open (failing), :half_open (testing).
  Uses state_functions callback mode for clarity.
  """

  @behaviour :gen_statem

  @type state :: :closed | :open | :half_open
  @type data :: %{
    failure_count: non_neg_integer(),
    success_count: non_neg_integer(),
    failure_threshold: pos_integer(),
    success_threshold: pos_integer(),
    reset_timeout_ms: pos_integer(),
    last_failure: integer() | nil
  }

  @spec start_link(keyword()) :: :gen_statem.start_ret()
  def start_link(opts \\ []) do
    name = Keyword.get(opts, :name, __MODULE__)
    config = %{
      failure_count: 0,
      success_count: 0,
      failure_threshold: Keyword.get(opts, :failure_threshold, 5),
      success_threshold: Keyword.get(opts, :success_threshold, 3),
      reset_timeout_ms: Keyword.get(opts, :reset_timeout_ms, 30_000),
      last_failure: nil
    }
    :gen_statem.start_link({:local, name}, __MODULE__, config, [])
  end

  @spec call(term()) :: {:ok, term()} | {:error, :circuit_open}
  def call(request) do
    :gen_statem.call(__MODULE__, {:request, request})
  end

  @spec report_success() :: :ok
  def report_success, do: :gen_statem.cast(__MODULE__, :success)

  @spec report_failure() :: :ok
  def report_failure, do: :gen_statem.cast(__MODULE__, :failure)

  @spec get_state() :: {state(), data()}
  def get_state, do: :gen_statem.call(__MODULE__, :get_state)

  # gen_statem callbacks

  @impl true
  def callback_mode, do: [:state_functions, :state_enter]

  @impl true
  def init(data), do: {:ok, :closed, data}

  # CLOSED state -- circuit is functioning normally
  @spec closed(:gen_statem.event_type(), term(), data()) :: :gen_statem.event_handler_result(state())
  def closed(:enter, _old_state, data) do
    {:keep_state, %{data | failure_count: 0, success_count: 0}}
  end

  def closed({:call, from}, {:request, _request}, data) do
    {:keep_state, data, [{:reply, from, {:ok, :allowed}}]}
  end

  def closed({:call, from}, :get_state, data) do
    {:keep_state, data, [{:reply, from, {:closed, data}}]}
  end

  def closed(:cast, :success, data) do
    {:keep_state, %{data | failure_count: 0}}
  end

  def closed(:cast, :failure, data) do
    new_count = data.failure_count + 1
    new_data = %{data | failure_count: new_count, last_failure: System.monotonic_time(:millisecond)}

    if new_count >= data.failure_threshold do
      {:next_state, :open, new_data}
    else
      {:keep_state, new_data}
    end
  end

  # OPEN state -- circuit is broken, rejecting requests
  @spec open(:gen_statem.event_type(), term(), data()) :: :gen_statem.event_handler_result(state())
  def open(:enter, _old_state, data) do
    {:keep_state, data, [{:state_timeout, data.reset_timeout_ms, :try_reset}]}
  end

  def open({:call, from}, {:request, _request}, data) do
    {:keep_state, data, [{:reply, from, {:error, :circuit_open}}]}
  end

  def open({:call, from}, :get_state, data) do
    {:keep_state, data, [{:reply, from, {:open, data}}]}
  end

  def open(:state_timeout, :try_reset, data) do
    {:next_state, :half_open, data}
  end

  def open(:cast, _event, data) do
    {:keep_state, data}
  end

  # HALF_OPEN state -- testing if the circuit can close
  @spec half_open(:gen_statem.event_type(), term(), data()) :: :gen_statem.event_handler_result(state())
  def half_open(:enter, _old_state, data) do
    {:keep_state, %{data | success_count: 0}}
  end

  def half_open({:call, from}, {:request, _request}, data) do
    {:keep_state, data, [{:reply, from, {:ok, :testing}}]}
  end

  def half_open({:call, from}, :get_state, data) do
    {:keep_state, data, [{:reply, from, {:half_open, data}}]}
  end

  def half_open(:cast, :success, data) do
    new_count = data.success_count + 1

    if new_count >= data.success_threshold do
      {:next_state, :closed, %{data | success_count: new_count}}
    else
      {:keep_state, %{data | success_count: new_count}}
    end
  end

  def half_open(:cast, :failure, data) do
    {:next_state, :open, %{data | last_failure: System.monotonic_time(:millisecond)}}
  end
end
```

### Handle Event Function Mode

The `:handle_event_function` callback mode provides a single callback that receives the state as a parameter. This is more flexible for machines with dynamic state sets or when the same logic applies across multiple states:

```elixir
defmodule Prismatic.StateMachine.AgentLifecycle do
  @moduledoc """
  Manages the lifecycle of an AIAD agent through its
  operational phases using handle_event_function mode.
  """

  @behaviour :gen_statem

  @type state ::
          :initializing
          | :idle
          | :executing
          | :awaiting_input
          | :error_recovery
          | :terminated

  @type data :: %{
    agent_id: String.t(),
    tier: 1..5,
    task_queue: :queue.queue(map()),
    error_count: non_neg_integer(),
    max_errors: pos_integer(),
    started_at: integer()
  }

  @spec start_link(String.t(), pos_integer()) :: :gen_statem.start_ret()
  def start_link(agent_id, tier) do
    data = %{
      agent_id: agent_id,
      tier: tier,
      task_queue: :queue.new(),
      error_count: 0,
      max_errors: 3,
      started_at: System.monotonic_time(:millisecond)
    }
    :gen_statem.start_link(__MODULE__, data, [])
  end

  @impl true
  def callback_mode, do: [:handle_event_function, :state_enter]

  @impl true
  def init(data), do: {:ok, :initializing, data}

  @impl true
  @spec handle_event(:gen_statem.event_type(), term(), state(), data()) ::
          :gen_statem.event_handler_result(state())
  def handle_event(:enter, _old_state, :initializing, data) do
    actions = [{:state_timeout, 5_000, :init_timeout}]
    {:keep_state, data, actions}
  end

  def handle_event(:enter, _old_state, :idle, data) do
    case :queue.is_empty(data.task_queue) do
      true -> {:keep_state, data}
      false -> {:next_state, :executing, data}
    end
  end

  def handle_event(:enter, _old_state, :executing, data) do
    actions = [{:state_timeout, 60_000, :execution_timeout}]
    {:keep_state, data, actions}
  end

  def handle_event(:enter, _old_state, :error_recovery, data) do
    if data.error_count >= data.max_errors do
      {:next_state, :terminated, data}
    else
      actions = [{:state_timeout, 5_000 * data.error_count, :recovery_complete}]
      {:keep_state, data, actions}
    end
  end

  def handle_event(:enter, _old_state, :terminated, data) do
    :telemetry.execute(
      [:prismatic, :agent, :terminated],
      %{lifetime_ms: System.monotonic_time(:millisecond) - data.started_at},
      %{agent_id: data.agent_id, tier: data.tier}
    )
    {:keep_state, data}
  end

  # Initialization complete
  def handle_event(:cast, :initialized, :initializing, data) do
    {:next_state, :idle, data}
  end

  def handle_event(:state_timeout, :init_timeout, :initializing, data) do
    {:next_state, :error_recovery, %{data | error_count: data.error_count + 1}}
  end

  # Task submission (any non-terminated state)
  def handle_event(:cast, {:submit_task, task}, state, data) when state != :terminated do
    new_queue = :queue.in(task, data.task_queue)
    new_data = %{data | task_queue: new_queue}

    case state do
      :idle -> {:next_state, :executing, new_data}
      _ -> {:keep_state, new_data}
    end
  end

  # Task completion
  def handle_event(:cast, {:task_complete, _result}, :executing, data) do
    {_task, new_queue} = :queue.out(data.task_queue)
    {:next_state, :idle, %{data | task_queue: new_queue, error_count: 0}}
  end

  # Task failure
  def handle_event(:cast, {:task_failed, _reason}, :executing, data) do
    {_task, new_queue} = :queue.out(data.task_queue)
    {:next_state, :error_recovery, %{data | task_queue: new_queue, error_count: data.error_count + 1}}
  end

  # Recovery timeout
  def handle_event(:state_timeout, :recovery_complete, :error_recovery, data) do
    {:next_state, :idle, data}
  end

  # Execution timeout
  def handle_event(:state_timeout, :execution_timeout, :executing, data) do
    {:next_state, :error_recovery, %{data | error_count: data.error_count + 1}}
  end

  # State query (any state)
  def handle_event({:call, from}, :get_state, state, data) do
    {:keep_state, data, [{:reply, from, {state, data}}]}
  end

  # Catch-all for unhandled events
  def handle_event(_type, _event, _state, data) do
    {:keep_state, data}
  end
end
```

### Formal State Machine Properties

State machines in the Prismatic Platform are validated against formal properties:

- **Determinism** -- For every (state, input) pair, exactly one transition is defined. Non-determinism in state machines leads to unpredictable behavior.
- **Reachability** -- Every state must be reachable from the initial state through some sequence of inputs. Unreachable states indicate dead code.
- **Liveness** -- The machine must eventually leave every non-terminal state. States without outgoing transitions (other than terminal states) indicate deadlocks.
- **Safety** -- The machine must never enter a forbidden state. This is enforced through pattern matching and the type system.

```elixir
defmodule Prismatic.StateMachine.Validator do
  @moduledoc """
  Validates state machine definitions against formal
  properties: determinism, reachability, liveness, safety.
  """

  @type transition :: {atom(), atom(), atom()}
  @type machine_def :: %{
    states: MapSet.t(atom()),
    initial: atom(),
    terminal: MapSet.t(atom()),
    transitions: [transition()],
    forbidden: MapSet.t(atom())
  }

  @spec validate(machine_def()) :: {:ok, :valid} | {:error, [String.t()]}
  def validate(machine) do
    errors =
      []
      |> check_initial_state(machine)
      |> check_reachability(machine)
      |> check_determinism(machine)
      |> check_liveness(machine)
      |> check_safety(machine)

    case errors do
      [] -> {:ok, :valid}
      errs -> {:error, errs}
    end
  end

  @spec check_initial_state([String.t()], machine_def()) :: [String.t()]
  defp check_initial_state(errors, %{states: states, initial: initial}) do
    if MapSet.member?(states, initial) do
      errors
    else
      ["Initial state #{initial} not in state set" | errors]
    end
  end

  @spec check_reachability([String.t()], machine_def()) :: [String.t()]
  defp check_reachability(errors, %{states: states, initial: initial, transitions: transitions}) do
    reachable = compute_reachable(initial, transitions, MapSet.new([initial]))
    unreachable = MapSet.difference(states, reachable)

    case MapSet.to_list(unreachable) do
      [] -> errors
      list -> ["Unreachable states: #{inspect(list)}" | errors]
    end
  end

  @spec compute_reachable(atom(), [transition()], MapSet.t(atom())) :: MapSet.t(atom())
  defp compute_reachable(current, transitions, visited) do
    next_states =
      transitions
      |> Enum.filter(fn {from, _event, _to} -> from == current end)
      |> Enum.map(fn {_from, _event, to} -> to end)
      |> Enum.reject(&MapSet.member?(visited, &1))

    Enum.reduce(next_states, MapSet.union(visited, MapSet.new(next_states)), fn state, acc ->
      compute_reachable(state, transitions, acc)
    end)
  end

  @spec check_determinism([String.t()], machine_def()) :: [String.t()]
  defp check_determinism(errors, %{transitions: transitions}) do
    duplicates =
      transitions
      |> Enum.group_by(fn {from, event, _to} -> {from, event} end)
      |> Enum.filter(fn {_key, group} -> length(group) > 1 end)

    case duplicates do
      [] -> errors
      dups ->
        msgs = Enum.map(dups, fn {{from, event}, _} ->
          "Non-deterministic transition from #{from} on #{event}"
        end)
        msgs ++ errors
    end
  end

  @spec check_liveness([String.t()], machine_def()) :: [String.t()]
  defp check_liveness(errors, %{states: states, terminal: terminal, transitions: transitions}) do
    non_terminal = MapSet.difference(states, terminal)

    dead_ends =
      non_terminal
      |> Enum.filter(fn state ->
        not Enum.any?(transitions, fn {from, _event, _to} -> from == state end)
      end)

    case dead_ends do
      [] -> errors
      list -> ["Dead-end non-terminal states: #{inspect(list)}" | errors]
    end
  end

  @spec check_safety([String.t()], machine_def()) :: [String.t()]
  defp check_safety(errors, %{forbidden: forbidden, transitions: transitions}) do
    violations =
      transitions
      |> Enum.filter(fn {_from, _event, to} -> MapSet.member?(forbidden, to) end)

    case violations do
      [] -> errors
      list ->
        msgs = Enum.map(list, fn {from, event, to} ->
          "Transition #{from} --#{event}--> #{to} enters forbidden state"
        end)
        msgs ++ errors
    end
  end
end
```

## Implementation in Prismatic Platform

### Workflow Engine

The platform's [workflow](/glossary/workflow/) engine uses state machines to manage multi-step processes such as OSINT investigation pipelines, compliance assessments, and quality gate evaluations:

```elixir
defmodule Prismatic.StateMachine.Workflow do
  @moduledoc """
  A declarative workflow engine backed by gen_statem.
  Workflows are defined as state transition tables and
  executed with full audit logging.
  """

  @type workflow_def :: %{
    name: String.t(),
    states: [atom()],
    initial: atom(),
    terminal: [atom()],
    transitions: %{{atom(), atom()} => atom()},
    guards: %{{atom(), atom()} => (map() -> boolean())}
  }

  @type workflow_instance :: %{
    id: String.t(),
    definition: workflow_def(),
    current_state: atom(),
    context: map(),
    history: [{atom(), atom(), atom(), integer()}],
    created_at: integer()
  }

  @spec create_instance(workflow_def(), map()) :: {:ok, workflow_instance()}
  def create_instance(definition, initial_context \\ %{}) do
    instance = %{
      id: generate_id(),
      definition: definition,
      current_state: definition.initial,
      context: initial_context,
      history: [{:created, :none, definition.initial, System.monotonic_time(:millisecond)}],
      created_at: System.monotonic_time(:millisecond)
    }
    {:ok, instance}
  end

  @spec transition(workflow_instance(), atom()) ::
          {:ok, workflow_instance()} | {:error, :invalid_transition | :guard_failed}
  def transition(instance, event) do
    %{definition: def, current_state: current, context: ctx} = instance
    key = {current, event}

    case Map.get(def.transitions, key) do
      nil ->
        {:error, :invalid_transition}

      next_state ->
        guard = Map.get(def.guards, key, fn _ctx -> true end)

        if guard.(ctx) do
          now = System.monotonic_time(:millisecond)
          entry = {current, event, next_state, now}
          updated = %{instance |
            current_state: next_state,
            history: [entry | instance.history]
          }
          {:ok, updated}
        else
          {:error, :guard_failed}
        end
    end
  end

  @spec is_terminal?(workflow_instance()) :: boolean()
  def is_terminal?(%{definition: def, current_state: state}) do
    state in def.terminal
  end

  @spec generate_id() :: String.t()
  defp generate_id do
    :crypto.strong_rand_bytes(16) |> Base.url_encode64(padding: false)
  end
end
```

### Compliance Assessment State Machine

The [Perimeter](/glossary/easm/) module uses a state machine for compliance assessment workflows, tracking each assessment through defined phases:

```
                      ┌──────────────┐
                      │  :initiated  │
                      └──────┬───────┘
                             │ :begin_discovery
                      ┌──────▼───────┐
              ┌───────│ :discovering │───────┐
              │       └──────┬───────┘       │
              │ :discovery   │ :discovery    │ :discovery
              │ _failed      │ _complete     │ _timeout
              │              │               │
        ┌─────▼────┐  ┌─────▼──────┐  ┌─────▼────┐
        │ :failed  │  │ :analyzing │  │ :failed  │
        └──────────┘  └─────┬──────┘  └──────────┘
                            │ :analysis_complete
                      ┌─────▼──────┐
                      │  :scoring  │
                      └─────┬──────┘
                            │ :scoring_complete
                      ┌─────▼──────────┐
                      │ :report_ready  │
                      └────────────────┘
```

## Comparison with Alternatives

| Approach | Strengths | Weaknesses | Prismatic Usage |
|----------|-----------|------------|----------------|
| **gen_statem** | OTP-native, state enter, timeouts, postpone | Erlang API surface, learning curve | Primary for complex machines |
| **GenServer with state field** | Simple, familiar, widely used | No formal transition validation | Simple two-state processes |
| **Fsmx library** | Declarative, Ecto integration | External dependency, limited features | Not used -- prefer OTP native |
| **Machinery library** | DSL for state machines, guard support | Macro-heavy, debugging difficulty | Not used -- prefer explicit code |
| **Broadway stages** | Pipeline-oriented, backpressure | Not general-purpose state machines | [Data pipelines](/glossary/data-pipeline/) |
| **Ecto Multi** | Database transaction state management | Limited to DB operations | Storage layer only |
| **Oban job states** | Persistent, reliable, distributed | Coupled to job processing | Background job lifecycle |

The Prismatic Platform favors `gen_statem` for any process with more than two states or where formal transition validation is required. For simpler cases, a GenServer with well-documented state transitions suffices. The platform avoids third-party state machine libraries to maintain full control over the state machine semantics and ensure compatibility with OTP's supervision and hot-code-upgrade facilities.

## Best Practices

### Design Principles

1. **Enumerate States Explicitly** -- Use a `@type state` union type to list all possible states. This enables [Dialyzer](/glossary/dialyzer/) to catch unhandled states at compile time and makes the machine self-documenting.

2. **Draw the Diagram First** -- Before writing code, draw the state transition diagram. If the diagram is too complex to fit on a single page, the machine needs decomposition into hierarchical or concurrent sub-machines.

3. **Use State Enter Actions** -- The `:state_enter` callback mode in gen_statem triggers actions when entering a state, regardless of which transition brought you there. This centralizes state initialization logic and prevents duplication.

4. **Prefer state_functions for Static Machines** -- When the set of states is known at compile time and each state has distinct behavior, use `:state_functions` mode. The Elixir compiler will warn about missing function clauses.

5. **Log Every Transition** -- Emit a [telemetry](/glossary/telemetry/) event on every state transition with the old state, event, and new state. This creates an auditable trail for debugging and compliance.

6. **Guard Transitions, Not States** -- Place validation logic on transitions (guards) rather than in state entry handlers. This ensures invalid transitions are rejected before any side effects occur.

7. **Use Timeouts for Liveness** -- Every non-terminal state should have a timeout that prevents the machine from getting stuck. gen_statem's `:state_timeout` and `:generic_timeout` provide this capability natively.

8. **Test Transition Tables Exhaustively** -- For every (state, event) pair, write a test case. Generate test cases from the transition table definition to ensure complete coverage.

### Anti-Patterns to Avoid

- **Boolean State Encoding** -- Using `%{is_active: true, is_processing: false}` instead of named states creates a combinatorial explosion of possible configurations, most of which are invalid.
- **String States** -- Using strings (`"processing"`) instead of atoms (`:processing`) sacrifices compile-time checking and pattern matching efficiency.
- **Implicit Transitions** -- Allowing state changes through direct field mutation rather than through defined transition functions breaks the state machine contract.

## Common Pitfalls

### 1. State Explosion

Complex domains with many interacting dimensions (e.g., user authentication state x subscription state x feature flag state) can lead to an exponential number of combined states. Solve this through hierarchical state machines or concurrent state machines that manage orthogonal dimensions independently.

### 2. Missing Error States

Failing to model error and recovery states means that errors cause the machine to get stuck or crash. Every state machine should have explicit error states and recovery transitions. The gen_statem `:state_enter` callback is ideal for triggering recovery timers.

### 3. Conflating State and Data

Encoding continuously varying values (counters, timestamps, accumulated results) as states rather than as data attached to states. States should represent qualitatively different behavioral modes; quantitative data belongs in the state machine's data field.

### 4. Synchronous Transition Bottlenecks

Performing expensive operations synchronously within transition handlers blocks the state machine process. Delegate expensive work to separate processes and use events to signal completion, keeping the state machine responsive.

### 5. Testing Only Happy Paths

Testing only the expected transition sequence misses the most dangerous bugs. Test invalid transitions (they should be rejected), timeout paths, concurrent event delivery, and recovery from every error state.

### 6. Ignoring Event Ordering

In concurrent systems, events may arrive in unexpected orders. gen_statem's `postpone` action lets you defer events that cannot be handled in the current state, processing them when the machine reaches an appropriate state.

## Use Cases

### Circuit Breaker Pattern

The [circuit breaker](/glossary/circuit-breaker/) is the canonical state machine use case in distributed systems. The three-state machine (closed/open/half_open) protects downstream services from cascade failures by tracking failure rates and temporarily blocking requests when a failure threshold is reached.

### Agent Lifecycle Management

Each of the 530+ AIAD agents in the Prismatic Platform follows a state machine lifecycle: initializing, idle, executing, awaiting_input, error_recovery, and terminated. The gen_statem implementation ensures that agents cannot receive tasks while in error recovery and that terminated agents are properly cleaned up by the [supervision](/glossary/supervision/) tree.

### Compliance Assessment Pipeline

The [Perimeter](/glossary/easm/) module's compliance assessment (NIS2, ZKB) follows a state machine that tracks each assessment through discovery, analysis, scoring, and reporting phases. The formal state machine ensures that no assessment skips phases and that failures are handled with explicit retry or escalation paths.

### Quality Gate Enforcement

The platform's 11-phase pre-commit hook is managed as a sequential state machine where each phase must complete successfully before the next begins. Failure at any phase transitions to a rejection state that blocks the commit and reports the specific failure.

### Workflow Orchestration

Multi-step OSINT investigations, where each step depends on results from previous steps, are modeled as state machines. This provides clear visibility into investigation progress, enables pause/resume functionality, and ensures that no investigation step is skipped or repeated.

## Related Concepts

- [gen_statem](/glossary/gen-statem/) -- OTP behaviour providing native state machine implementation
- [GenServer](/glossary/genserver/) -- General-purpose server process, simpler alternative for basic state management
- [OTP](/glossary/otp/) -- The framework providing gen_statem and supervision infrastructure
- [Behaviour](/glossary/behaviour/) -- Elixir mechanism defining callback contracts for state machine implementations
- [Event Sourcing](/glossary/event-sourcing/) -- Capturing state changes as append-only events, complementary to state machines
- [Workflow](/glossary/workflow/) -- Multi-step processes managed through state machine orchestration
- [Circuit Breaker](/glossary/circuit-breaker/) -- Classic state machine pattern for resilience in distributed systems
- [Supervision](/glossary/supervision/) -- OTP supervision trees managing state machine process lifecycles
- [Fault Tolerance](/glossary/fault-tolerance/) -- System resilience achieved through state machine recovery paths
- [Backpressure](/glossary/backpressure/) -- Flow control mechanism interacting with state machine event processing

## See Also

- [Elixir](/glossary/elixir/) -- Programming language providing pattern matching for state machine implementation
- [BEAM](/glossary/beam/) -- Virtual machine supporting lightweight stateful processes
- [Pattern Matching](/glossary/pattern-matching/) -- Core mechanism for state machine transition dispatch
- [Telemetry](/glossary/telemetry/) -- Observability framework for monitoring state transitions
- [Distributed System](/glossary/distributed-system/) -- Context where state machines manage distributed coordination
- [Data Pipeline](/glossary/data-pipeline/) -- Pipelines using state machines for stage management
- [Formal Verification](/glossary/formal-verification/) -- Mathematical validation of state machine properties
- [Dynamic Supervisor](/glossary/dynamic-supervisor/) -- Dynamic process management for state machine instances

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
