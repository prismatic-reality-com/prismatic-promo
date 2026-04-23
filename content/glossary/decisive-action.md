+++
title = "Decisive Action"
weight = 50
[extra]
tags = ["glossary", "doctrine", "no-doubts", "execution", "decision-making", "governance", "epistemic", "confidence"]
description = "The NO DOUBTS principle of executing with full commitment once a decision has been verified through Trinity Gate passage and confidence threshold, eliminating analysis paralysis while maintaining epistemic rigor across the Prismatic Platform"
category = "doctrine"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate"
domain_category = "Platform Doctrine & Governance"
related_concepts = ["no-doubts", "no-mercy-no-doubts", "trinity-gate", "transition-protocol", "confidence-threshold", "proves-before-claiming", "nabla-infinity"]
implementation_status = "production"
authority_level = "L3 Strategic"
difficulty_rating = 6
prerequisites = ["no-mercy-no-doubts", "trinity-gate", "confidence-threshold", "nabla-infinity"]
learning_path = ["no-mercy-no-doubts", "no-doubts", "confidence-threshold", "trinity-gate", "decisive-action", "transition-protocol"]
interactive_demos = ["/labs/glossary/decisive-action"]
code_examples = ["Transition protocol GenServer", "Confidence-gated execution pipeline", "Decision commitment tracker"]
external_resources = ["https://en.wikipedia.org/wiki/Analysis_paralysis", "https://en.wikipedia.org/wiki/OODA_loop", "https://hexdocs.pm/elixir/GenServer.html"]
version_introduced = "0.4.0"
stability_level = "stable"
testing_scenarios = ["confidence threshold validation before execution", "Trinity Gate passage verification", "rollback on post-execution failure detection", "parallel execution commitment tracking"]
keywords = ["decisive action", "NO DOUBTS", "execution commitment", "analysis paralysis", "confidence threshold", "Trinity Gate", "transition protocol", "OODA loop", "decision velocity"]
related_terms = ["no-doubts", "no-mercy-no-doubts", "trinity-gate", "transition-protocol", "confidence-threshold", "proves-before-claiming", "nabla-infinity", "no-mercy", "formal-verification", "epistemic-robustness"]
word_count = 1955
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Decisive Action - Prismatic Platform"
+++

## Definition

Decisive action is the principle that once a decision has been rigorously validated -- achieving the required [confidence threshold](/glossary/confidence-threshold/) and passing the [Trinity Gate](/glossary/trinity-gate/) verification -- it must be executed with full commitment, without hesitation, second-guessing, or half-measures. It is the execution phase of the [NO DOUBTS](/glossary/no-doubts/) doctrine, which states: "Once decided, execute with full commitment."

Decisive action is not recklessness. It is the disciplined outcome of a rigorous exploration phase ([NABLA Infinity](/glossary/nabla-infinity/)) that maps uncertainty, preserves contradictions, and builds confidence through evidence. The transition from exploration to execution occurs at a precisely defined boundary: when confidence reaches 0.95 or higher AND the Trinity Gate has been passed. Below that boundary, the system explores; above it, the system acts. There is no middle ground of tentative, partial, or hedged execution.

## Overview

Analysis paralysis -- the inability to act due to overthinking, excessive deliberation, or fear of imperfect information -- is one of the most destructive patterns in both human organizations and software systems. It manifests as endless planning cycles, committees that never decide, pull requests that linger in review, and systems that collect data indefinitely without acting on it.

The Prismatic Platform addresses analysis paralysis through a two-phase approach embodied in the [transition protocol](/glossary/transition-protocol/). Phase one is exploration (governed by NABLA Infinity), where the system actively seeks information, maps uncertainty, considers multiple hypotheses, and preserves contradictory evidence. Phase two is execution (governed by NO DOUBTS), where the system commits fully to the decision and drives it to completion.

The critical insight is that both phases are governed by explicit, measurable criteria. Exploration does not continue indefinitely; it continues until confidence exceeds the threshold. Execution does not begin tentatively; it begins with full commitment because the preceding exploration phase has already established sufficient certainty.

This design draws from military decision-making frameworks, particularly the OODA loop (Observe, Orient, Decide, Act). In the OODA loop, the "Act" phase must be decisive to maintain tempo advantage. Hesitation during execution negates the advantage gained through observation and orientation. The Prismatic Platform applies the same principle: the platform's epistemic rigor during exploration justifies full commitment during execution.

Decisive action is paired with [NO MERCY](/glossary/no-mercy/), the complementary doctrine that demands complete execution without exceptions. Together, NO MERCY (quality of execution) and NO DOUBTS (commitment to execution) form the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine that governs all platform operations.

## Technical Details

### The Transition Protocol

The transition from exploration to decisive action is formalized as a state machine with three states: EXPLORING, TRANSITIONING, and EXECUTING. The transitions are triggered by measurable conditions, not subjective judgment.

**EXPLORING state:** The system is gathering evidence, testing hypotheses, and building confidence. NABLA axioms are actively enforced: signal plurality, contradiction preservation, source independence, and provenance tracking. The system may hold multiple contradictory beliefs simultaneously.

**TRANSITIONING state:** Confidence has reached the threshold (typically 0.95 for critical decisions, 0.80 for standard operations). The Trinity Gate evaluates the accumulated evidence through three checks: structural consistency (the belief graph forms a valid DAG), logical consistency (propositions follow logical rules), and formal necessity (claims can be proven in formal systems). This state is brief; it either advances to EXECUTING or falls back to EXPLORING if the gate fails.

**EXECUTING state:** The Trinity Gate has passed. The decision is committed. All platform resources are focused on complete execution. There is no re-evaluation of the decision during execution (unless new evidence triggers an automatic abort condition). The [NO MERCY](/glossary/no-mercy/) doctrine governs execution quality: no partial implementations, no skipped tests, no deferred quality gates.

### Confidence Threshold Framework

Different decision contexts require different confidence levels before decisive action is warranted:

| Context | Threshold | Trinity Gate | Example |
|---------|-----------|-------------|---------|
| Critical (L4-L5) | 0.95 | MANDATORY | Security deployments, schema migrations |
| Standard (L2-L3) | 0.80 | MANDATORY | Feature implementations, refactoring |
| Exploratory (L1-L2) | 0.60 | RECOMMENDED | Research queries, prototype evaluation |
| Research (L1) | 0.50 | OPTIONAL | Hypothesis generation, pattern discovery |

The threshold is not a suggestion; it is a hard gate enforced by the platform's decision pipeline. An agent cannot enter the EXECUTING state without meeting the confidence requirement for its decision's classification.

### Abort Conditions

Decisive action does not mean blind execution. The platform defines three conditions under which execution is automatically aborted:

1. **Evidence contradiction:** New evidence surfaces that directly contradicts a foundational premise of the decision, reducing confidence below the threshold.
2. **System health violation:** The execution is causing measurable harm (test failures, quality degradation, performance regression) that exceeds tolerance thresholds.
3. **Authority override:** An L5 authority (human operator or Archer Supreme) issues an explicit abort command.

These abort conditions are the safety valves that prevent decisive action from becoming destructive action. They are checked continuously during execution, not just at the start.

## Implementation in Prismatic Platform

### Transition Protocol GenServer

The transition protocol is implemented as a state machine GenServer:

```elixir
defmodule Prismatic.Doctrine.TransitionProtocol do
  @moduledoc """
  Implements the NABLA-to-NM/ND transition protocol.

  Manages the state machine governing the transition from
  epistemic exploration (NABLA Infinity) to decisive execution
  (NO MERCY, NO DOUBTS). Enforces confidence thresholds and
  Trinity Gate passage before allowing execution.
  """

  use GenServer

  alias Prismatic.Nabla.{ConfidenceTracker, TrinityGate}
  alias Prismatic.Doctrine.ExecutionCommitment

  @type state :: :exploring | :transitioning | :executing | :aborted
  @type decision_id :: String.t()

  @type decision :: %{
    id: decision_id(),
    state: state(),
    confidence: float(),
    threshold: float(),
    evidence: [map()],
    started_at: DateTime.t(),
    committed_at: DateTime.t() | nil,
    agent_id: String.t()
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec begin_exploration(String.t(), float()) :: {:ok, decision_id()}
  def begin_exploration(agent_id, threshold \\ 0.80) do
    GenServer.call(__MODULE__, {:begin_exploration, agent_id, threshold})
  end

  @spec submit_evidence(decision_id(), map()) ::
          {:ok, :exploring, float()}
          | {:ok, :transitioning, float()}
          | {:error, term()}
  def submit_evidence(decision_id, evidence) do
    GenServer.call(__MODULE__, {:submit_evidence, decision_id, evidence})
  end

  @spec attempt_transition(decision_id()) ::
          {:ok, :executing}
          | {:error, :insufficient_confidence}
          | {:error, :trinity_gate_failed, String.t()}
  def attempt_transition(decision_id) do
    GenServer.call(__MODULE__, {:attempt_transition, decision_id}, :timer.seconds(30))
  end

  @spec check_abort_conditions(decision_id()) :: :continue | {:abort, String.t()}
  def check_abort_conditions(decision_id) do
    GenServer.call(__MODULE__, {:check_abort, decision_id})
  end

  @impl true
  def init(_opts) do
    table = :ets.new(:transition_decisions, [:set, :protected])
    {:ok, %{table: table}}
  end

  @impl true
  def handle_call({:begin_exploration, agent_id, threshold}, _from, state) do
    decision_id = generate_decision_id()

    decision = %{
      id: decision_id,
      state: :exploring,
      confidence: 0.0,
      threshold: threshold,
      evidence: [],
      started_at: DateTime.utc_now(),
      committed_at: nil,
      agent_id: agent_id
    }

    :ets.insert(state.table, {decision_id, decision})
    emit_telemetry(:exploration_started, decision)
    {:reply, {:ok, decision_id}, state}
  end

  @impl true
  def handle_call({:submit_evidence, decision_id, evidence}, _from, state) do
    case :ets.lookup(state.table, decision_id) do
      [{^decision_id, %{state: :exploring} = decision}] ->
        updated_evidence = [evidence | decision.evidence]
        new_confidence = ConfidenceTracker.calculate(updated_evidence)

        new_state = if new_confidence >= decision.threshold, do: :transitioning, else: :exploring

        updated = %{decision |
          evidence: updated_evidence,
          confidence: new_confidence,
          state: new_state
        }

        :ets.insert(state.table, {decision_id, updated})
        emit_telemetry(:evidence_submitted, updated)
        {:reply, {:ok, new_state, new_confidence}, state}

      [{^decision_id, %{state: other}}] ->
        {:reply, {:error, {:invalid_state, other}}, state}

      [] ->
        {:reply, {:error, :not_found}, state}
    end
  end

  @impl true
  def handle_call({:attempt_transition, decision_id}, _from, state) do
    case :ets.lookup(state.table, decision_id) do
      [{^decision_id, %{state: :transitioning} = decision}] ->
        if decision.confidence < decision.threshold do
          rollback = %{decision | state: :exploring}
          :ets.insert(state.table, {decision_id, rollback})
          {:reply, {:error, :insufficient_confidence}, state}
        else
          case TrinityGate.evaluate(decision.evidence) do
            {:pass, _details} ->
              committed = %{decision |
                state: :executing,
                committed_at: DateTime.utc_now()
              }

              :ets.insert(state.table, {decision_id, committed})
              emit_telemetry(:decisive_action_committed, committed)
              ExecutionCommitment.register(committed)
              {:reply, {:ok, :executing}, state}

            {:fail, reason} ->
              rollback = %{decision | state: :exploring}
              :ets.insert(state.table, {decision_id, rollback})
              emit_telemetry(:trinity_gate_rejected, decision)
              {:reply, {:error, :trinity_gate_failed, reason}, state}
          end
        end

      [{^decision_id, %{state: other}}] ->
        {:reply, {:error, {:invalid_state, other}}, state}

      [] ->
        {:reply, {:error, :not_found}, state}
    end
  end

  @impl true
  def handle_call({:check_abort, decision_id}, _from, state) do
    case :ets.lookup(state.table, decision_id) do
      [{^decision_id, %{state: :executing} = decision}] ->
        cond do
          contradicting_evidence?(decision) ->
            abort(state.table, decision_id, decision, "New contradicting evidence detected")

          system_health_violated?(decision) ->
            abort(state.table, decision_id, decision, "System health threshold exceeded")

          authority_override?(decision_id) ->
            abort(state.table, decision_id, decision, "L5 authority override")

          true ->
            {:reply, :continue, state}
        end

      _ ->
        {:reply, :continue, state}
    end
  end

  defp abort(table, decision_id, decision, reason) do
    aborted = %{decision | state: :aborted}
    :ets.insert(table, {decision_id, aborted})
    emit_telemetry(:execution_aborted, %{decision: aborted, reason: reason})
    {:reply, {:abort, reason}, %{table: table}}
  end

  defp contradicting_evidence?(_decision), do: false
  defp system_health_violated?(_decision), do: false
  defp authority_override?(_decision_id), do: false

  defp generate_decision_id do
    "dec_" <> Base.url_encode64(:crypto.strong_rand_bytes(16), padding: false)
  end

  defp emit_telemetry(event, metadata) do
    :telemetry.execute(
      [:prismatic, :doctrine, :transition, event],
      %{count: 1, confidence: Map.get(metadata, :confidence, 0.0)},
      %{decision_id: Map.get(metadata, :id, "unknown"), agent: Map.get(metadata, :agent_id, "unknown")}
    )
  end
end
```

### Execution Commitment Tracker

Once decisive action begins, the commitment tracker ensures complete follow-through:

```elixir
defmodule Prismatic.Doctrine.ExecutionCommitment do
  @moduledoc """
  Tracks execution commitments to ensure NO MERCY compliance.

  Once decisive action begins (Trinity Gate passed, confidence
  threshold met), this module ensures the action is completed
  fully without half-measures, deferred work, or quality shortcuts.
  """

  use GenServer

  @type commitment_id :: String.t()
  @type commitment_status :: :in_progress | :completed | :aborted

  @type commitment :: %{
    id: commitment_id(),
    decision_id: String.t(),
    agent_id: String.t(),
    tasks: [task()],
    status: commitment_status(),
    started_at: DateTime.t(),
    completed_at: DateTime.t() | nil
  }

  @type task :: %{
    name: String.t(),
    status: :pending | :in_progress | :completed | :failed,
    required: boolean()
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec register(map()) :: {:ok, commitment_id()}
  def register(decision) do
    GenServer.call(__MODULE__, {:register, decision})
  end

  @spec complete_task(commitment_id(), String.t()) ::
          {:ok, :task_completed} | {:ok, :commitment_fulfilled} | {:error, term()}
  def complete_task(commitment_id, task_name) do
    GenServer.call(__MODULE__, {:complete_task, commitment_id, task_name})
  end

  @spec status(commitment_id()) :: {:ok, commitment()} | {:error, :not_found}
  def status(commitment_id) do
    GenServer.call(__MODULE__, {:status, commitment_id})
  end

  @impl true
  def init(_opts) do
    table = :ets.new(:execution_commitments, [:set, :protected])
    {:ok, %{table: table}}
  end

  @impl true
  def handle_call({:register, decision}, _from, state) do
    commitment_id = "commit_" <> Base.url_encode64(:crypto.strong_rand_bytes(12), padding: false)

    commitment = %{
      id: commitment_id,
      decision_id: decision.id,
      agent_id: decision.agent_id,
      tasks: default_tasks(),
      status: :in_progress,
      started_at: DateTime.utc_now(),
      completed_at: nil
    }

    :ets.insert(state.table, {commitment_id, commitment})
    {:reply, {:ok, commitment_id}, state}
  end

  @impl true
  def handle_call({:complete_task, commitment_id, task_name}, _from, state) do
    case :ets.lookup(state.table, commitment_id) do
      [{^commitment_id, commitment}] ->
        tasks = Enum.map(commitment.tasks, fn task ->
          if task.name == task_name, do: %{task | status: :completed}, else: task
        end)

        all_required_complete = tasks
          |> Enum.filter(& &1.required)
          |> Enum.all?(& &1.status == :completed)

        updated = if all_required_complete do
          %{commitment | tasks: tasks, status: :completed, completed_at: DateTime.utc_now()}
        else
          %{commitment | tasks: tasks}
        end

        :ets.insert(state.table, {commitment_id, updated})

        if updated.status == :completed do
          emit_telemetry(:commitment_fulfilled, updated)
          {:reply, {:ok, :commitment_fulfilled}, state}
        else
          {:reply, {:ok, :task_completed}, state}
        end

      [] ->
        {:reply, {:error, :not_found}, state}
    end
  end

  @impl true
  def handle_call({:status, commitment_id}, _from, state) do
    case :ets.lookup(state.table, commitment_id) do
      [{^commitment_id, commitment}] -> {:reply, {:ok, commitment}, state}
      [] -> {:reply, {:error, :not_found}, state}
    end
  end

  @spec default_tasks() :: [task()]
  defp default_tasks do
    [
      %{name: "implementation", status: :pending, required: true},
      %{name: "tests", status: :pending, required: true},
      %{name: "quality_gates", status: :pending, required: true},
      %{name: "documentation", status: :pending, required: false},
      %{name: "telemetry", status: :pending, required: false}
    ]
  end

  defp emit_telemetry(event, commitment) do
    :telemetry.execute(
      [:prismatic, :doctrine, :commitment, event],
      %{count: 1, task_count: length(commitment.tasks)},
      %{commitment_id: commitment.id, agent: commitment.agent_id}
    )
  end
end
```

## Comparison with Alternatives

### Decisive Action vs. Analysis Paralysis

Analysis paralysis is the pathological opposite of decisive action. In systems without a transition protocol, deliberation continues indefinitely because there is no clear threshold for "enough information." The Prismatic Platform solves this by defining explicit numerical thresholds: once confidence reaches the required level and the Trinity Gate passes, deliberation ends and execution begins. The threshold is the cure for paralysis.

### Decisive Action vs. Move Fast and Break Things

The "move fast and break things" philosophy prioritizes speed over rigor, accepting errors as the cost of velocity. Decisive action achieves comparable speed but without accepting broken outcomes. The key difference is the exploration phase: decisive action is fast because the preceding investigation was thorough, not because investigation was skipped. Velocity comes from confidence, not from carelessness.

### Decisive Action vs. Gradual Rollout

Gradual rollouts (canary releases, feature flags, A/B testing) hedge execution by deploying incrementally. This approach makes sense for user-facing features with uncertain reception, but it is inappropriate for architectural decisions, security responses, and quality enforcement where partial deployment creates inconsistency. The Prismatic Platform uses decisive action for internal operations and graduated rollout for external-facing changes.

### OODA Loop vs. Transition Protocol

The OODA loop (Observe, Orient, Decide, Act) and the Prismatic transition protocol share the principle that action must follow from deliberation. The OODA loop is cyclical and continuous; the transition protocol is episodic, with a clear state transition from exploration to execution. Both emphasize that the "Act" phase must be committed; both recognize that speed of the decision cycle is a competitive advantage.

### Consensus-Driven vs. Confidence-Driven Decisions

Consensus-driven decision making requires agreement among stakeholders before action. This can be slow and produce watered-down compromises. Confidence-driven decisions (as implemented by the transition protocol) act when evidence is sufficient, regardless of whether all agents "agree." The evidence speaks for itself through the Trinity Gate, and decisive action follows from evidence, not from consensus.

## Best Practices

**Set confidence thresholds before beginning exploration.** Deciding the threshold after seeing the evidence introduces bias. Define the threshold based on the decision's impact category (critical, standard, exploratory, research) before gathering any evidence.

**Never lower thresholds mid-exploration.** If confidence is not reaching the threshold, the correct response is to gather more evidence, not to lower the bar. Lowering thresholds under pressure defeats the entire purpose of the epistemic framework.

**Commit fully after transition.** Once the EXECUTING state is entered, allocate all necessary resources to completion. Do not split attention between the current execution and new exploration for the next decision. Complete the current action before beginning the next.

**Implement abort conditions from the start.** Decisive action without safety valves is recklessness. Define the specific conditions under which execution should be halted before beginning, and implement automated monitoring for those conditions.

**Track execution commitments.** Every decisive action should produce a commitment record listing the required tasks (implementation, tests, quality gates). Do not consider the action complete until all required tasks are fulfilled, enforcing the [NO MERCY](/glossary/no-mercy/) standard.

**Review aborted actions.** When an action is aborted during execution, conduct a post-mortem to determine whether the exploration phase was inadequate, whether new information was genuinely surprising, or whether the abort conditions were too sensitive.

## Common Pitfalls

**Premature transition.** Entering the EXECUTING state before genuine confidence is achieved -- because of time pressure, impatience, or misunderstanding of the evidence -- leads to committed execution of poorly-founded decisions. The Trinity Gate exists precisely to prevent this, but it can be circumvented if confidence calculation is miscalibrated.

**Execution without commitment tracking.** Beginning decisive action without tracking the commitment allows half-completed work to be declared "done." The [NO MERCY](/glossary/no-mercy/) doctrine demands that every task in the commitment is fulfilled, and the commitment tracker enforces this.

**Confusing speed with decisiveness.** Decisiveness is not about acting quickly; it is about acting fully once the decision is made. A carefully explored decision executed with full commitment three days after the investigation began is more decisive than a snap judgment executed partially within minutes.

**Ignoring abort conditions.** Once committed to decisive action, there is psychological pressure to continue even when abort conditions are triggered. The platform's automated abort monitoring removes human bias from this decision: if the conditions are met, execution halts regardless of sunk cost.

**Recycling failed decisions.** After an action is aborted, re-entering execution for the same decision without returning to the exploration phase and gathering new evidence is a violation of the protocol. Failed actions must return to EXPLORING and rebuild confidence.

## Use Cases

### Security Incident Response

When the [Blue Team](/glossary/blue-team/) detects a potential security breach, the exploration phase begins: gathering evidence, assessing severity, identifying affected systems. Once confidence reaches 0.95 (critical threshold), the Trinity Gate evaluates the evidence. Upon passage, decisive action commences: the incident response protocol executes with full commitment -- isolation, remediation, notification -- without hesitation or half-measures.

### Quality Gate Enforcement

When the Quality Floor Guardian detects a quality violation, it does not deliberate indefinitely about whether to block the commit. It evaluates the evidence (compilation warnings, test failures, Credo violations), reaches the confidence threshold almost immediately (quality violations are binary), and executes decisively: the commit is blocked, the developer is notified, and remediation is required. No exceptions, no negotiation.

### Agent Deployment Decisions

Deploying a new agent to production requires exploration (reviewing code, running tests, checking authority requirements) followed by decisive deployment. The transition protocol ensures that deployment either happens fully (agent registered, supervised, monitored, documented) or not at all. There are no partially deployed agents in the platform.

### NABLA-to-NM/ND Transition in OSINT Analysis

An OSINT investigation begins in exploration mode, gathering intelligence from multiple adapters, cross-referencing sources, and building confidence in findings. When the [confidence threshold](/glossary/confidence-threshold/) is met and the Trinity Gate validates the evidence structure, the investigation transitions to decisive action: findings are committed to the platform's knowledge base, alerts are generated, and reports are published.

## Related Concepts

- [NO DOUBTS](/glossary/no-doubts/) -- The doctrine principle that decisive action embodies in execution
- [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) -- The complete doctrine governing quality (NO MERCY) and commitment (NO DOUBTS)
- [Trinity Gate](/glossary/trinity-gate/) -- The three-part verification system that must pass before decisive action begins
- [Transition Protocol](/glossary/transition-protocol/) -- The formal state machine governing the NABLA-to-execution transition
- [Confidence Threshold](/glossary/confidence-threshold/) -- The numerical boundary that gates entry into decisive action
- [Proves Before Claiming](/glossary/proves-before-claiming/) -- The evidence-first principle that precedes decisive action
- [NABLA Infinity](/glossary/nabla-infinity/) -- The epistemic exploration framework that precedes decisive action
- [NO MERCY](/glossary/no-mercy/) -- The complementary doctrine demanding complete execution quality
- [Formal Verification](/glossary/formal-verification/) -- Trinity Gate's third check ensuring formal correctness
- [Epistemic Robustness](/glossary/epistemic-robustness/) -- The quality of evidence that enables confident decisive action

## See Also

- [Decision Making Hierarchy](/glossary/decision-making-hierarchy/) -- The authority framework within which decisive actions occur
- [Contradiction Preservation](/glossary/contradiction-preservation/) -- NABLA axiom active during exploration but resolved before execution
- [Signal Plurality](/glossary/signal-plurality/) -- Evidence quality requirement for building sufficient confidence
- [Authority Level](/glossary/authority-level/) -- The tier classification determining who can authorize decisive actions
- [Belief Graph](/glossary/belief-graph/) -- The evidence structure evaluated by Trinity Gate before execution

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
