+++
title = "Human Intervention"
weight = 50
[extra]
tags = ["glossary", "automation", "operations", "ai-safety", "oversight", "decision-making", "autonomous-systems", "governance"]
description = "Human intervention refers to the deliberate injection of human judgment, oversight, and decision-making authority into automated and autonomous system workflows at critical control points where algorithmic processing alone is insufficient or unacceptable"
category = "operations"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "13 min"
difficulty = "intermediate"
quality_score = 95
related_terms = ["autonomous-operation", "autonomous-decision-making", "automated-decision-making", "crisis-intervention", "decisive-action", "chain-of-command", "authority-level", "explainability", "bias-detection", "audit-trail"]
key_concepts = ["human-in-the-loop", "human-on-the-loop", "human-out-of-the-loop", "escalation protocols", "override authority"]
platform_relevance = "critical"
date_created = "2026-02-22"
date_updated = "2026-02-22"
aliases = ["human-in-the-loop", "manual override", "human oversight"]
word_count = 1895
date_modified = "2026-02-23"
keywords = ["Human", "Intervention", "glossary", "operations", "Prismatic Platform", "Platform", "The Prismatic"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Human Intervention - Prismatic Platform"
+++

## Definition

Human intervention is the practice of inserting human judgment, review, and decision-making authority into automated or autonomous system workflows at predetermined control points where the consequences of errors are severe, the decision context exceeds algorithmic capability, or regulatory requirements mandate human oversight. Within the Prismatic Platform, human intervention is a carefully engineered control mechanism that balances the efficiency of autonomous agents (530+ in the AIAD ecosystem) with the irreplaceable judgment that humans bring to novel situations, ethical considerations, and high-stakes decisions. Rather than treating human intervention as a failure of automation, the platform architects it as a complementary capability that strengthens the overall system's reliability and trustworthiness.

The concept encompasses three operational modes along a spectrum of autonomy. At one extreme, "human-in-the-loop" systems require explicit human approval before every significant action. At the other extreme, "human-out-of-the-loop" systems operate fully autonomously with human review only after the fact. Between these extremes, "human-on-the-loop" systems operate autonomously but with continuous human monitoring and the ability to intervene at any point. The Prismatic Platform implements all three modes, selecting the appropriate level based on the risk profile of each operation, the confidence level of the autonomous system, and the regulatory context.

## Overview

The tension between automation efficiency and human oversight is one of the defining challenges of modern software systems. Fully autonomous systems can operate at machine speed, processing thousands of decisions per second without fatigue or emotional bias. However, they lack the contextual understanding, ethical reasoning, and creative problem-solving that humans bring to complex situations. Conversely, human-in-the-loop systems benefit from human judgment but operate at human speed, creating bottlenecks in time-critical workflows.

The Prismatic Platform resolves this tension through a tiered intervention architecture. The NO MERCY, NO DOUBTS doctrine governs automated execution: once a decision passes the Trinity Gate with confidence above 0.95, the system executes with full commitment. However, the doctrine also mandates "full investigation" before acting and "evidence-based" decision-making -- principles that naturally create intervention points where human judgment is valuable.

In practice, the platform's 530+ AIAD agents operate across five authority levels (L1 Operational through L5 Supreme), with human intervention requirements increasing at higher authority levels. L1 and L2 agents execute autonomously within well-defined parameters. L3 agents (Strategic Commanders) can request human review when confidence is below threshold. L4 and L5 agents require human authorization for destructive or irreversible operations.

The NABLA Infinity epistemic framework further informs human intervention design. The "Unknown Valid" axiom recognizes that legitimate uncertainty exists, and the "Contradiction Preservation" axiom ensures that conflicting signals are surfaced rather than suppressed. When the system encounters genuine uncertainty that it cannot resolve through additional evidence gathering, human intervention becomes the appropriate resolution mechanism.

## Technical Details

The Prismatic Platform implements human intervention through a structured escalation system built on OTP GenServer patterns and telemetry events.

```elixir
defmodule Prismatic.Intervention.Coordinator do
  @moduledoc """
  Coordinates human intervention requests across the platform.
  Manages escalation queues, notification channels, and response tracking.
  """

  use GenServer

  require Logger

  @intervention_timeout :timer.minutes(30)
  @escalation_levels [:informational, :advisory, :approval_required, :emergency]

  defstruct [
    :pending_requests,
    :completed_requests,
    :notification_channels,
    :timeout_policies
  ]

  @type intervention_request :: %{
          id: String.t(),
          level: atom(),
          agent: atom(),
          context: map(),
          options: [String.t()],
          requested_at: DateTime.t(),
          deadline: DateTime.t() | nil,
          status: :pending | :approved | :rejected | :timeout | :escalated
        }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec request_intervention(atom(), atom(), map(), keyword()) ::
          {:ok, String.t()} | {:error, term()}
  def request_intervention(agent, level, context, opts \\ []) do
    GenServer.call(__MODULE__, {:request, agent, level, context, opts})
  end

  @spec respond(String.t(), :approve | :reject, map()) :: :ok | {:error, term()}
  def respond(request_id, decision, metadata \\ %{}) do
    GenServer.call(__MODULE__, {:respond, request_id, decision, metadata})
  end

  @spec pending_requests() :: [intervention_request()]
  def pending_requests do
    GenServer.call(__MODULE__, :list_pending)
  end

  @impl true
  def init(opts) do
    state = %__MODULE__{
      pending_requests: %{},
      completed_requests: :queue.new(),
      notification_channels: Keyword.get(opts, :channels, [:logger]),
      timeout_policies: build_timeout_policies()
    }

    schedule_timeout_check()
    {:ok, state}
  end

  @impl true
  def handle_call({:request, agent, level, context, opts}, _from, state) do
    request_id = generate_request_id()
    deadline = calculate_deadline(level, opts)

    request = %{
      id: request_id,
      level: level,
      agent: agent,
      context: context,
      options: Keyword.get(opts, :options, ["approve", "reject"]),
      requested_at: DateTime.utc_now(),
      deadline: deadline,
      status: :pending
    }

    :telemetry.execute(
      [:prismatic, :intervention, :requested],
      %{count: 1},
      %{agent: agent, level: level}
    )

    notify_channels(request, state.notification_channels)

    updated_pending = Map.put(state.pending_requests, request_id, request)
    {:reply, {:ok, request_id}, %{state | pending_requests: updated_pending}}
  end

  @impl true
  def handle_call({:respond, request_id, decision, metadata}, _from, state) do
    case Map.pop(state.pending_requests, request_id) do
      {nil, _} ->
        {:reply, {:error, :not_found}, state}

      {request, remaining} ->
        completed = %{request | status: decision_to_status(decision)}
        latency = DateTime.diff(DateTime.utc_now(), request.requested_at, :second)

        :telemetry.execute(
          [:prismatic, :intervention, :resolved],
          %{latency_seconds: latency},
          %{agent: request.agent, level: request.level, decision: decision}
        )

        updated_completed = enqueue_limited(state.completed_requests, {completed, metadata}, 500)
        {:reply, :ok, %{state | pending_requests: remaining, completed_requests: updated_completed}}
    end
  end

  @impl true
  def handle_call(:list_pending, _from, state) do
    {:reply, Map.values(state.pending_requests), state}
  end

  @impl true
  def handle_info(:check_timeouts, state) do
    now = DateTime.utc_now()

    {timed_out, remaining} =
      Enum.split_with(state.pending_requests, fn {_id, req} ->
        req.deadline && DateTime.compare(now, req.deadline) == :gt
      end)

    Enum.each(timed_out, fn {_id, req} ->
      Logger.warning("Intervention request #{req.id} timed out for agent #{req.agent}")

      :telemetry.execute(
        [:prismatic, :intervention, :timeout],
        %{count: 1},
        %{agent: req.agent, level: req.level}
      )
    end)

    schedule_timeout_check()
    {:noreply, %{state | pending_requests: Map.new(remaining)}}
  end

  defp generate_request_id do
    Base.encode16(:crypto.strong_rand_bytes(8), case: :lower)
  end

  defp calculate_deadline(level, opts) do
    timeout = Keyword.get(opts, :timeout, default_timeout(level))
    DateTime.add(DateTime.utc_now(), timeout, :millisecond)
  end

  defp default_timeout(:emergency), do: :timer.minutes(5)
  defp default_timeout(:approval_required), do: :timer.minutes(30)
  defp default_timeout(:advisory), do: :timer.hours(4)
  defp default_timeout(:informational), do: :timer.hours(24)

  defp decision_to_status(:approve), do: :approved
  defp decision_to_status(:reject), do: :rejected

  defp notify_channels(request, channels) do
    Enum.each(channels, fn channel ->
      notify_channel(channel, request)
    end)
  end

  defp notify_channel(:logger, request) do
    Logger.info("Intervention requested: #{request.level} from #{request.agent} [#{request.id}]")
  end

  defp notify_channel(:telemetry, request) do
    :telemetry.execute(
      [:prismatic, :intervention, :notification],
      %{count: 1},
      %{channel: :telemetry, request_id: request.id}
    )
  end

  defp notify_channel(_, _request), do: :ok

  defp build_timeout_policies do
    %{
      emergency: :timer.minutes(5),
      approval_required: :timer.minutes(30),
      advisory: :timer.hours(4),
      informational: :timer.hours(24)
    }
  end

  defp schedule_timeout_check do
    Process.send_after(self(), :check_timeouts, :timer.seconds(30))
  end

  defp enqueue_limited(queue, item, max_size) do
    queue = :queue.in(item, queue)

    if :queue.len(queue) > max_size do
      {_, queue} = :queue.out(queue)
      queue
    else
      queue
    end
  end
end
```

### Agent-Level Intervention Integration

Individual AIAD agents integrate with the intervention system through a behaviour callback that determines when human intervention is required:

```elixir
defmodule Prismatic.AIAD.InterventionPolicy do
  @moduledoc """
  Behaviour for agents to define their intervention requirements.
  """

  @callback requires_intervention?(map()) :: boolean()
  @callback intervention_level(map()) :: atom()
  @callback build_intervention_context(map()) :: map()
end
```

## Implementation

Implementing human intervention in an autonomous platform requires careful design of three interconnected systems: the escalation trigger, the decision interface, and the response integration.

### Escalation Triggers

Escalation triggers determine when autonomous processing should pause for human review. The Prismatic Platform uses a multi-signal approach:

**Confidence-based triggers.** When the NABLA Infinity framework evaluates a decision and the confidence score falls below the configured threshold for the operation's risk level, the system automatically escalates to human review. Critical decisions require 0.95 confidence; if the system can only achieve 0.80, human intervention is triggered.

**Anomaly-based triggers.** Statistical anomaly detection identifies situations that deviate significantly from historical patterns. If an agent's proposed action is statistically unusual (for example, deleting significantly more records than typical), the system pauses for human review.

**Rule-based triggers.** Explicit rules define situations that always require human intervention regardless of system confidence. Examples include production deployments, database schema changes, security policy modifications, and any operation classified as irreversible.

### Decision Interface

The Prismatic Platform provides multiple interfaces for human decision-makers:

**LiveView dashboard.** A real-time dashboard displays pending intervention requests with full context, recommended actions, and historical precedents. Decision-makers can approve, reject, or modify proposed actions.

**CLI interface.** For operators working in terminal environments, mix tasks provide command-line access to the intervention queue.

**Structured notifications.** Intervention requests are pushed to configured channels (Slack, email, PagerDuty) with escalation policies that increase urgency if requests remain unresolved past their deadline.

### Timeout and Fallback Policies

Not all intervention requests can wait indefinitely for human response. The platform implements graduated timeout policies:

```elixir
defmodule Prismatic.Intervention.TimeoutPolicy do
  @moduledoc """
  Defines fallback behavior when intervention requests time out.
  """

  @spec on_timeout(map()) :: :proceed_with_default | :abort | :escalate
  def on_timeout(%{level: :emergency}), do: :escalate
  def on_timeout(%{level: :approval_required}), do: :abort
  def on_timeout(%{level: :advisory}), do: :proceed_with_default
  def on_timeout(%{level: :informational}), do: :proceed_with_default
end
```

## Comparison

| Model | Human Role | System Speed | Error Coverage | Scalability | Prismatic Usage |
|-------|-----------|-------------|----------------|-------------|-----------------|
| **Human-in-the-loop** | Approves every action | Slowest | Highest | Lowest | L4/L5 destructive operations |
| **Human-on-the-loop** | Monitors, intervenes when needed | Fast | High | Moderate | L3 strategic decisions |
| **Human-out-of-the-loop** | Reviews after the fact | Fastest | Moderate | Highest | L1/L2 routine operations |
| **Adaptive autonomy** | Role varies by confidence | Variable | Highest | High | Platform default mode |
| **No human oversight** | None | Maximum | Lowest | Maximum | Not used in Prismatic |

### Human Intervention vs. Automated Rollback

Automated rollback is a form of machine-driven intervention that detects failures and reverses changes without human involvement. While faster than human intervention, automated rollback can only address anticipated failure modes. Human intervention handles novel situations, ambiguous signals, and decisions with ethical or business implications that no automated system can evaluate. The Prismatic Platform uses automated rollback for routine operational failures and human intervention for situations that require judgment.

### Human Intervention vs. Circuit Breakers

Circuit breakers automatically halt operations when failure rates exceed thresholds, providing a mechanical form of intervention. They protect systems from cascading failures but cannot make nuanced decisions about whether to retry, modify the approach, or abandon the operation entirely. Human intervention complements circuit breakers by providing the decision-making layer that determines what happens after a circuit opens.

## Best Practices

**1. Define intervention points before deployment, not after incidents.** Reactive intervention design means that the first time a particular failure mode occurs, there is no mechanism for human involvement. Proactive design identifies all decision points where human judgment may be needed and instruments them before the system goes live.

**2. Provide complete context in intervention requests.** A human decision-maker presented with "Agent X requests approval for Action Y" cannot make an informed decision. Include the full context: what triggered the request, what data was considered, what alternatives were evaluated, what the expected impact is, and what the system recommends.

**3. Set appropriate timeouts with clear fallback behavior.** An intervention request that waits indefinitely blocks the system. Define timeouts proportional to the urgency and risk of the decision, with explicit fallback policies (abort, proceed with default, escalate) when timeouts expire.

**4. Record all intervention decisions with rationale.** Every human intervention creates a decision record that includes who decided, what they decided, why they decided it, and what information they considered. This audit trail supports compliance requirements and enables the system to learn from human decisions over time.

**5. Minimize intervention fatigue.** If operators receive too many intervention requests, they begin approving without careful review -- "alarm fatigue" applied to human-in-the-loop systems. Continuously tune escalation thresholds to ensure that only genuinely ambiguous or high-risk decisions reach human reviewers.

**6. Enable rapid intervention response.** The value of human intervention depends on response latency. If a critical decision requires 4 hours of human review, the system may need to be redesigned to either operate autonomously or pre-compute decisions.

**7. Track intervention patterns to improve autonomy.** Every human intervention represents either a gap in the automated system's capability or a situation where human judgment is genuinely required. Analyzing intervention patterns reveals which gaps can be closed through better algorithms and which situations inherently require human involvement.

## Pitfalls

**Over-reliance on human intervention as a safety net.** If the system escalates too frequently, it is not truly autonomous -- it is a recommendation engine with human execution. This defeats the purpose of automation and creates bottlenecks at human decision points.

**Under-specified intervention context.** Presenting a human decision-maker with insufficient context forces them to spend time investigating before they can decide, dramatically increasing response latency. Worse, they may make poor decisions based on incomplete information.

**Missing timeout policies.** An intervention request without a timeout can block an entire processing pipeline indefinitely if no human responds. Always define timeout behavior, especially for requests generated during off-hours when response teams may not be immediately available.

**Treating all decisions as equally requiring intervention.** Not all decisions carry equal risk. A system that requires human approval for both "delete production database" and "change button color" quickly trains operators to approve without reading, undermining the safety that intervention is meant to provide.

**Ignoring intervention latency in system design.** If a real-time system requires sub-second response times, introducing human intervention with minutes or hours of latency is architecturally incompatible. Design the system so that intervention points occur at natural batch boundaries or asynchronous decision points.

**Failure to close the learning loop.** If human decisions never feed back into the automated system's decision model, the same types of intervention requests will recur indefinitely. Implement mechanisms to analyze intervention decisions and update autonomous decision policies accordingly.

## Use Cases

**Production deployment authorization.** The Prismatic Platform requires human approval for production deployments through the CI/CD pipeline. The intervention request includes the full diff, test results, quality gate status, and risk assessment. An authorized operator must explicitly approve before the deployment proceeds.

**Security incident escalation.** When the Blue Team agents detect potential security incidents, they classify the severity and escalate to human security analysts when the incident exceeds the autonomous response threshold. The analyst receives a structured incident report with recommended containment actions.

**Quality gate override.** In exceptional circumstances, a deployment may need to proceed despite a quality gate failure (for example, a hotfix that introduces a known Credo warning). The system requires explicit human override with documented justification, which is recorded in the audit trail.

**OSINT investigation approval.** Certain OSINT operations that involve querying paid APIs or accessing rate-limited resources require human approval to prevent unnecessary costs. The intervention request shows the estimated cost, expected value, and alternative free sources.

**Agent authority escalation.** When an L2 Tactical Specialist agent determines that an operation requires L3 Strategic Commander authority, the escalation passes through the human intervention system to ensure that authority elevation is intentional and appropriate.

**Data deletion confirmation.** Any operation that permanently deletes data (as opposed to soft-deletion) requires human confirmation regardless of the initiating agent's authority level. The confirmation request includes the scope of deletion and estimated recovery difficulty.

## Related Concepts

Human intervention connects to autonomy, safety, and governance concepts throughout the Prismatic Platform:

- [Autonomous Operation](@/glossary/autonomous-operation.md) is the mode that human intervention complements and constrains
- [Autonomous Decision-Making](@/glossary/autonomous-decision-making.md) describes the algorithmic processes that may trigger intervention
- [Crisis Intervention](@/glossary/crisis-intervention.md) is the most urgent form of human intervention in emergency scenarios
- [Chain of Command](@/glossary/chain-of-command.md) defines who has authority to make intervention decisions at each level
- [Authority Level](@/glossary/authority-level.md) determines the threshold at which human intervention is required
- [Explainability](@/glossary/explainability.md) ensures that intervention requests include understandable context
- [Bias Detection](@/glossary/bias-detection.md) identifies situations where automated systems may require human correction
- [Audit Trail](@/glossary/audit-trail.md) records all intervention decisions for compliance and analysis
- [Decisive Action](@/glossary/decisive-action.md) describes the execution mode after human intervention approves an action
- [Automated Decision-Making](@/glossary/automated-decision-making.md) is the counterpart that operates without human involvement

## See Also

- [Circuit Breaker](@/glossary/circuit-breaker.md) -- automated intervention mechanism for cascading failure prevention
- [Violation Protocol](@/glossary/violation-protocol.md) -- defines responses when automated systems detect policy violations
- [No Mercy No Doubts](@/glossary/no-mercy-no-doubts.md) -- doctrine governing execution after human intervention approves
- [Confidence Threshold](@/glossary/confidence-threshold.md) -- determines when confidence is insufficient for autonomous operation
- [Trinity Gate](@/glossary/trinity-gate.md) -- verification gate that must pass before autonomous execution

---

**Built with precision. Ready for the future.**

*Created by [Tomas Korcak (korczis)](https://github.com/korczis) | [Prismatic Platform](https://github.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis)*
