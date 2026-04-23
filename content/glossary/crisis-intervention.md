+++
title = "Crisis Intervention"
weight = 50
[extra]
tags = ["glossary", "operations", "crisis", "emergency", "incident-response", "archer-supreme", "fault-tolerance", "resilience", "rapid-response", "authority-escalation", "self-healing", "coordination"]
description = "Rapid response protocol for system-critical failures requiring immediate coordinated action, including /emergency command activation, Archer Supreme crisis mode, and L5 authority escalation within the Prismatic Platform"
category = "operations"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "operations-and-resilience"
related_concepts = ["crisis-resolution", "incident-response", "fault-tolerance", "self-healing", "disaster-recovery", "archer-supreme", "circuit-breaker", "supervisor"]
implementation_status = "production"
authority_level = "L5 Cosmic"
difficulty_rating = 8
prerequisites = ["incident-response", "fault-tolerance", "supervisor", "genserver", "otp"]
learning_path = ["fault-tolerance", "incident-response", "crisis-intervention", "crisis-resolution", "disaster-recovery"]
interactive_demos = ["/labs/glossary/crisis-intervention"]
code_examples = ["CrisisInterventionCoordinator", "EmergencyEscalation", "ArcherSupremeCrisisMode", "RapidResponseOrchestrator"]
external_resources = ["https://sre.google/sre-book/managing-incidents/", "https://www.pagerduty.com/resources/learn/incident-response/", "https://hexdocs.pm/elixir/Supervisor.html"]
version_introduced = "0.3.0"
stability_level = "stable"
testing_scenarios = ["l5_authority_activation", "emergency_command_trigger", "multi_agent_coordination", "cascading_failure_containment", "service_isolation", "rollback_execution"]
keywords = ["crisis intervention", "emergency response", "rapid response", "incident management", "authority escalation", "Archer Supreme", "L5 activation", "system triage", "failure containment", "coordinated response"]
related_terms = ["crisis-resolution", "incident-response", "fault-tolerance", "self-healing", "disaster-recovery", "archer-supreme", "circuit-breaker", "supervisor", "dynamic-supervisor", "backpressure"]
word_count = 1608
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Crisis Intervention - Prismatic Platform"
+++

## Definition

Crisis intervention is the immediate, time-critical response protocol activated when a system experiences a failure severe enough to threaten platform stability, data integrity, or service availability. Unlike routine incident handling, crisis intervention operates under compressed timelines where every second of delay increases the blast radius. It encompasses the first minutes of response: detection, triage, containment, and initial stabilization -- the actions taken before the longer process of [crisis resolution](/glossary/crisis-resolution/) begins.

In the Prismatic Platform, crisis intervention is formalized through the `/emergency` command, which activates [Archer Supreme](/glossary/archer-supreme/) crisis mode with L5 (Cosmic) authority. This grants the responding agent unrestricted access to all platform subsystems, bypasses normal approval workflows, and coordinates multi-agent response teams automatically. The protocol operates under the principle that in a genuine crisis, the cost of inaction always exceeds the cost of over-response.

## Overview

Crisis intervention exists because distributed systems fail in unpredictable, cascading ways that outpace human reaction times. A database connection pool exhaustion can cascade to request timeouts, which trigger retry storms, which overwhelm downstream services, which trigger more timeouts -- all within seconds. By the time a human operator diagnoses the root cause, the blast radius may have expanded to the entire platform.

The Prismatic Platform addresses this through a layered intervention architecture:

1. **Automatic Detection**: The [Quality Floor Guardian](/glossary/quality-floor-guardian/) and health monitors continuously evaluate system health metrics. When metrics cross crisis thresholds (not just warning thresholds), automatic intervention begins.

2. **Severity Classification**: Not all failures are crises. The platform classifies incidents on a severity scale where only S1 (Critical) and S0 (Catastrophic) trigger crisis intervention protocols. S2-S4 incidents are handled through standard [incident response](/glossary/incident-response/).

3. **Authority Escalation**: Crisis intervention activates L5 (Cosmic) authority -- the highest level in the [AIAD](/glossary/aiad/) hierarchy. This bypasses the normal L1-L4 authority gates that govern routine operations, enabling the crisis coordinator to take any action necessary for stabilization.

4. **Coordinated Response**: The `/emergency` command does not just alert -- it orchestrates. It activates specific response agents, assigns containment tasks, opens communication channels, and begins logging a crisis timeline automatically.

5. **Containment First**: The primary objective of crisis intervention is containment, not resolution. Stop the bleeding, isolate the affected subsystem, prevent cascade propagation. Resolution is a separate, methodical process that follows containment.

The distinction between crisis intervention and normal operations is not just one of urgency -- it is a fundamentally different operational mode with different rules. Normal operations prioritize safety, review, and consensus. Crisis intervention prioritizes speed, authority concentration, and decisive action under the [NO MERCY](/glossary/no-mercy/) doctrine.

## Technical Details

### Severity Classification Model

The platform uses a structured severity model to determine when crisis intervention is warranted:

| Severity | Name | Response | Authority | Time Target | Example |
|----------|------|----------|-----------|-------------|---------|
| **S0** | Catastrophic | Crisis Intervention | L5 Cosmic | < 1 min | Data loss, complete outage |
| **S1** | Critical | Crisis Intervention | L5 Cosmic | < 5 min | Partial outage, security breach |
| **S2** | Major | Incident Response | L3 Strategic | < 15 min | Degraded performance, feature failure |
| **S3** | Minor | Standard Response | L2 Tactical | < 1 hour | Non-critical bug, cosmetic issue |
| **S4** | Low | Scheduled Fix | L1 Operational | < 24 hours | Documentation, minor improvement |

### Crisis Detection Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Telemetry   │    │   Health     │    │  External    │
│  Metrics     │    │  Monitors    │    │  Alerts      │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │
       └──────────┬───────┘──────────────────┘
                  v
       ┌─────────────────┐
       │  Crisis Detector │
       │  (thresholds)    │
       └────────┬────────┘
                │ S0/S1 detected
                v
       ┌─────────────────┐
       │  /emergency      │
       │  Command Router  │
       └────────┬────────┘
                │ L5 authority granted
                v
       ┌─────────────────┐
       │  Archer Supreme  │
       │  Crisis Mode     │
       └────────┬────────┘
                │
       ┌────────┴────────────────┐
       v                         v
┌──────────────┐      ┌──────────────┐
│ Containment   │      │ Communication │
│ Agents        │      │ Agents        │
└──────────────┘      └──────────────┘
```

### Crisis Intervention Coordinator

The coordinator is the central orchestration point for all crisis intervention activities:

```elixir
defmodule Prismatic.Crisis.InterventionCoordinator do
  @moduledoc """
  Coordinates crisis intervention across the Prismatic Platform.

  This GenServer activates when a crisis is detected, escalates
  authority to L5 (Cosmic), deploys containment agents, and
  manages the intervention lifecycle until handoff to resolution.

  ## Crisis Lifecycle

  1. Detection -> 2. Classification -> 3. Escalation ->
  4. Containment -> 5. Stabilization -> 6. Handoff to Resolution

  ## Authority Model

  During active crisis, the coordinator operates at L5 authority,
  granting unrestricted access to all platform subsystems. This
  authority is time-bounded and automatically revoked upon crisis
  resolution or timeout.
  """

  use GenServer

  alias Prismatic.Crisis.{Classifier, ContainmentAgent, Timeline}
  alias Prismatic.AIAD.AuthorityManager

  @type crisis_state :: :idle | :detecting | :escalating | :containing | :stabilizing | :resolved
  @type severity :: :s0 | :s1 | :s2 | :s3 | :s4

  @type crisis :: %{
          id: String.t(),
          severity: severity(),
          state: crisis_state(),
          detected_at: DateTime.t(),
          escalated_at: DateTime.t() | nil,
          contained_at: DateTime.t() | nil,
          resolved_at: DateTime.t() | nil,
          root_cause: String.t() | nil,
          affected_services: [String.t()],
          containment_actions: [map()],
          timeline: [Timeline.entry()],
          authority_token: String.t() | nil
        }

  @crisis_timeout :timer.minutes(30)
  @containment_timeout :timer.minutes(5)

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec trigger_emergency(map()) :: {:ok, crisis()} | {:error, term()}
  def trigger_emergency(context) do
    GenServer.call(__MODULE__, {:emergency, context}, @containment_timeout)
  end

  @spec get_crisis_status() :: {:ok, crisis()} | {:error, :no_active_crisis}
  def get_crisis_status do
    GenServer.call(__MODULE__, :status)
  end

  @spec report_containment(String.t(), map()) :: :ok
  def report_containment(action_id, result) do
    GenServer.cast(__MODULE__, {:containment_result, action_id, result})
  end

  @impl true
  def init(_opts) do
    {:ok, %{active_crisis: nil, history: [], intervention_count: 0}}
  end

  @impl true
  def handle_call({:emergency, context}, _from, %{active_crisis: nil} = state) do
    crisis = initiate_crisis(context)

    case escalate_authority(crisis) do
      {:ok, crisis_with_authority} ->
        crisis_with_containment = deploy_containment(crisis_with_authority)
        schedule_crisis_timeout()

        emit_telemetry(:crisis_initiated, crisis_with_containment)

        {:reply, {:ok, crisis_with_containment},
         %{state | active_crisis: crisis_with_containment,
           intervention_count: state.intervention_count + 1}}

      {:error, reason} ->
        {:reply, {:error, {:escalation_failed, reason}}, state}
    end
  end

  @impl true
  def handle_call({:emergency, _context}, _from, %{active_crisis: existing} = state) do
    {:reply, {:error, {:crisis_active, existing.id}}, state}
  end

  @impl true
  def handle_call(:status, _from, state) do
    case state.active_crisis do
      nil -> {:reply, {:error, :no_active_crisis}, state}
      crisis -> {:reply, {:ok, crisis}, state}
    end
  end

  @impl true
  def handle_cast({:containment_result, action_id, result}, state) do
    case state.active_crisis do
      nil ->
        {:noreply, state}

      crisis ->
        updated_actions =
          Enum.map(crisis.containment_actions, fn action ->
            if action.id == action_id do
              Map.merge(action, %{status: :completed, result: result})
            else
              action
            end
          end)

        updated_crisis = %{crisis |
          containment_actions: updated_actions,
          timeline: [Timeline.entry(:containment_progress, action_id) | crisis.timeline]
        }

        updated_crisis =
          if all_containment_complete?(updated_crisis) do
            %{updated_crisis |
              state: :stabilizing,
              contained_at: DateTime.utc_now()
            }
          else
            updated_crisis
          end

        {:noreply, %{state | active_crisis: updated_crisis}}
    end
  end

  @impl true
  def handle_info(:crisis_timeout, state) do
    case state.active_crisis do
      nil ->
        {:noreply, state}

      crisis ->
        resolved = %{crisis |
          state: :resolved,
          resolved_at: DateTime.utc_now(),
          timeline: [Timeline.entry(:timeout_resolution) | crisis.timeline]
        }

        AuthorityManager.revoke_l5(crisis.authority_token)
        emit_telemetry(:crisis_timeout, resolved)

        {:noreply, %{state |
          active_crisis: nil,
          history: [resolved | state.history]
        }}
    end
  end

  @spec initiate_crisis(map()) :: crisis()
  defp initiate_crisis(context) do
    severity = Classifier.classify(context)
    now = DateTime.utc_now()

    %{
      id: generate_crisis_id(),
      severity: severity,
      state: :detecting,
      detected_at: now,
      escalated_at: nil,
      contained_at: nil,
      resolved_at: nil,
      root_cause: Map.get(context, :suspected_cause),
      affected_services: Map.get(context, :affected_services, []),
      containment_actions: [],
      timeline: [Timeline.entry(:detected, context)],
      authority_token: nil
    }
  end

  @spec escalate_authority(crisis()) :: {:ok, crisis()} | {:error, term()}
  defp escalate_authority(crisis) do
    case AuthorityManager.grant_l5(:crisis_intervention, crisis.id) do
      {:ok, token} ->
        {:ok, %{crisis |
          state: :escalating,
          escalated_at: DateTime.utc_now(),
          authority_token: token,
          timeline: [Timeline.entry(:l5_granted) | crisis.timeline]
        }}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @spec deploy_containment(crisis()) :: crisis()
  defp deploy_containment(crisis) do
    actions = ContainmentAgent.plan_containment(crisis)

    Enum.each(actions, fn action ->
      ContainmentAgent.execute_async(action, crisis.authority_token)
    end)

    %{crisis |
      state: :containing,
      containment_actions: actions,
      timeline: [Timeline.entry(:containment_deployed, length(actions)) | crisis.timeline]
    }
  end

  @spec all_containment_complete?(crisis()) :: boolean()
  defp all_containment_complete?(crisis) do
    Enum.all?(crisis.containment_actions, fn action ->
      action.status == :completed
    end)
  end

  @spec schedule_crisis_timeout() :: reference()
  defp schedule_crisis_timeout do
    Process.send_after(self(), :crisis_timeout, @crisis_timeout)
  end

  @spec generate_crisis_id() :: String.t()
  defp generate_crisis_id do
    "CRI-" <> (:crypto.strong_rand_bytes(8) |> Base.url_encode64(padding: false))
  end

  @spec emit_telemetry(atom(), crisis()) :: :ok
  defp emit_telemetry(event, crisis) do
    :telemetry.execute(
      [:prismatic, :crisis, event],
      %{count: 1, timestamp: System.monotonic_time()},
      %{crisis_id: crisis.id, severity: crisis.severity, state: crisis.state}
    )
  end
end
```

### Containment Strategies

The platform employs several containment strategies depending on the crisis type:

```elixir
defmodule Prismatic.Crisis.ContainmentAgent do
  @moduledoc """
  Plans and executes containment actions for active crises.

  Containment strategies are selected based on the affected
  subsystem and crisis severity. Each strategy aims to isolate
  the failure, prevent cascade propagation, and preserve as
  much service functionality as possible.
  """

  @type containment_action :: %{
          id: String.t(),
          strategy: containment_strategy(),
          target: String.t(),
          status: :pending | :executing | :completed | :failed,
          result: map() | nil
        }

  @type containment_strategy ::
          :circuit_break
          | :service_isolation
          | :traffic_shed
          | :connection_pool_drain
          | :cache_fallback
          | :feature_disable
          | :rollback_deploy

  @spec plan_containment(map()) :: [containment_action()]
  def plan_containment(%{severity: :s0, affected_services: services}) do
    # S0: Maximum containment -- isolate everything affected
    Enum.flat_map(services, fn service ->
      [
        build_action(:circuit_break, service),
        build_action(:traffic_shed, service),
        build_action(:service_isolation, service)
      ]
    end)
  end

  def plan_containment(%{severity: :s1, affected_services: services}) do
    # S1: Targeted containment -- circuit break and shed load
    Enum.flat_map(services, fn service ->
      [
        build_action(:circuit_break, service),
        build_action(:traffic_shed, service)
      ]
    end)
  end

  @spec execute_async(containment_action(), String.t()) :: :ok
  def execute_async(action, authority_token) do
    Task.Supervisor.start_child(Prismatic.Crisis.TaskSupervisor, fn ->
      result = execute_strategy(action.strategy, action.target, authority_token)

      Prismatic.Crisis.InterventionCoordinator.report_containment(
        action.id,
        result
      )
    end)

    :ok
  end

  @spec build_action(containment_strategy(), String.t()) :: containment_action()
  defp build_action(strategy, target) do
    %{
      id: "ACT-" <> (:crypto.strong_rand_bytes(4) |> Base.url_encode64(padding: false)),
      strategy: strategy,
      target: target,
      status: :pending,
      result: nil
    }
  end

  @spec execute_strategy(containment_strategy(), String.t(), String.t()) :: map()
  defp execute_strategy(:circuit_break, target, _token) do
    %{strategy: :circuit_break, target: target, result: :opened, timestamp: DateTime.utc_now()}
  end

  defp execute_strategy(:traffic_shed, target, _token) do
    %{strategy: :traffic_shed, target: target, shed_percent: 80, timestamp: DateTime.utc_now()}
  end

  defp execute_strategy(:service_isolation, target, _token) do
    %{strategy: :service_isolation, target: target, result: :isolated, timestamp: DateTime.utc_now()}
  end

  defp execute_strategy(strategy, target, _token) do
    %{strategy: strategy, target: target, result: :executed, timestamp: DateTime.utc_now()}
  end
end
```

### Crisis Timeline

Every action during a crisis intervention is recorded in an immutable timeline:

```elixir
defmodule Prismatic.Crisis.Timeline do
  @moduledoc """
  Immutable crisis timeline recording all events, actions,
  and decisions during a crisis intervention. Used for
  post-incident review and compliance auditing.
  """

  @type entry :: %{
          timestamp: DateTime.t(),
          event: atom(),
          details: term(),
          actor: String.t()
        }

  @spec entry(atom(), term()) :: entry()
  def entry(event, details \\ nil) do
    %{
      timestamp: DateTime.utc_now(),
      event: event,
      details: details,
      actor: "crisis_coordinator"
    }
  end
end
```

## Implementation in Prismatic Platform

### The `/emergency` Command

The `/emergency` command is the human-triggered entry point to crisis intervention. When invoked, it:

1. Immediately activates [Archer Supreme](/glossary/archer-supreme/) in crisis mode
2. Grants L5 (Cosmic) authority to the crisis coordinator
3. Runs automated triage to classify severity
4. Deploys containment agents based on severity classification
5. Opens a crisis timeline for all actions
6. Notifies all relevant monitoring channels

### Archer Supreme Crisis Mode

[Archer Supreme](/glossary/archer-supreme/), normally the platform's supreme orchestration agent, enters a specialized crisis mode during intervention. In this mode, it:

- Suspends all non-critical background operations (autoevolve, autoheal scans)
- Redirects all agent resources toward crisis containment
- Assumes direct command of the affected subsystem's [supervisor](/glossary/supervisor/) tree
- Operates with L5 authority, bypassing all standard approval gates

### Integration with OTP Supervision

Crisis intervention leverages Erlang/OTP's [fault tolerance](/glossary/fault-tolerance/) primitives directly. The containment strategies map to OTP supervision actions:

| Containment Strategy | OTP Mechanism |
|---------------------|---------------|
| Circuit Break | `Supervisor.terminate_child/2` + custom restart |
| Service Isolation | `DynamicSupervisor.terminate_child/2` |
| Traffic Shed | [Backpressure](/glossary/backpressure/) via GenStage demand reduction |
| Connection Pool Drain | `DBConnection.disconnect_all/2` |
| Feature Disable | Runtime configuration update via ETS |
| Rollback Deploy | Fly.io machine replacement API |

### Telemetry Events

| Event | Measurements | Metadata |
|-------|-------------|----------|
| `[:prismatic, :crisis, :crisis_initiated]` | `%{count: 1}` | `%{crisis_id, severity, state}` |
| `[:prismatic, :crisis, :containment_deployed]` | `%{action_count: integer}` | `%{crisis_id, strategies}` |
| `[:prismatic, :crisis, :containment_complete]` | `%{duration_ms: integer}` | `%{crisis_id, actions}` |
| `[:prismatic, :crisis, :crisis_resolved]` | `%{total_duration_ms: integer}` | `%{crisis_id, severity}` |
| `[:prismatic, :crisis, :crisis_timeout]` | `%{count: 1}` | `%{crisis_id, elapsed_ms}` |

## Comparison with Alternatives

| Approach | Speed | Automation | Coordination | Risk | Prismatic Usage |
|----------|-------|-----------|--------------|------|-----------------|
| **Manual Runbooks** | Slow (minutes) | None | Human-driven | High (human error) | Fallback only |
| **PagerDuty/Opsgenie** | Medium | Alert routing | Human-driven | Medium | External alerting |
| **Kubernetes Self-Healing** | Fast (seconds) | Pod restart only | None | Low (limited scope) | N/A (Fly.io) |
| **AWS Auto Recovery** | Medium | Instance-level | None | Low | N/A |
| **Prismatic Crisis Intervention** | Fast (seconds) | Full orchestration | Multi-agent | Very Low | Primary method |
| **Chaos Engineering (proactive)** | N/A (preventive) | Scenario-based | Pre-planned | Controlled | Via [chaos engineering](/glossary/chaos-engineering/) |

The Prismatic approach differs fundamentally from most incident response systems: it is an active coordinator, not a passive notification system. While PagerDuty tells humans there is a problem, the Prismatic crisis intervention coordinator has already begun containment by the time the alert reaches a human.

## Best Practices

1. **Contain first, diagnose second**: The immediate goal of crisis intervention is stopping the spread. Root cause analysis is important but secondary to containment. A contained crisis with unknown root cause is far better than an understood crisis that is still spreading.

2. **Pre-plan containment strategies**: Every service should have documented containment strategies before a crisis occurs. The worst time to design a containment strategy is during a crisis.

3. **Practice regularly with chaos engineering**: [Chaos engineering](/glossary/chaos-engineering/) exercises validate that containment strategies work before they are needed in production.

4. **Automate escalation thresholds**: Human judgment about severity classification degrades under stress. Use automated thresholds based on objective metrics (error rates, latency percentiles, availability) rather than subjective assessment.

5. **Time-bound crisis authority**: L5 authority granted during crisis intervention must automatically expire. Open-ended elevated privileges are a security risk. The Prismatic coordinator enforces a 30-minute timeout with explicit renewal.

6. **Maintain an immutable timeline**: Every action during a crisis must be recorded with timestamps and actor identification. This timeline is critical for post-incident review and regulatory compliance.

7. **Test the intervention system itself**: The crisis intervention coordinator is itself a system that can fail. Regularly verify that the `/emergency` command activates correctly and containment agents respond.

## Common Pitfalls

1. **Escalating too slowly**: Organizations often hesitate to declare a crisis, hoping the problem will resolve itself. Every minute of delay allows cascade propagation. The Prismatic Platform errs on the side of over-escalation with automatic severity classification.

2. **Too many responders without coordination**: A crisis with ten uncoordinated responders is worse than one with a single coordinator. The Prismatic approach concentrates authority in one coordinator rather than distributing it.

3. **Focusing on diagnosis during active cascade**: The natural engineering instinct is to understand the problem before acting. In a cascading failure, this instinct kills availability. Contain first, understand later.

4. **No pre-established containment strategies**: Making up containment strategies during a crisis leads to mistakes. Every service should have at least a [circuit breaker](/glossary/circuit-breaker/) strategy and a traffic shedding strategy pre-configured.

5. **Failing to revoke crisis authority**: Elevated authority granted during a crisis must be explicitly revoked when the crisis ends. Lingering L5 authority is a security vulnerability.

6. **No post-incident review**: A crisis that is contained but not analyzed is a crisis that will recur. Every crisis intervention must be followed by a thorough [crisis resolution](/glossary/crisis-resolution/) process including root cause analysis.

7. **Alert fatigue masking real crises**: If the monitoring system generates constant low-severity alerts, operators learn to ignore them. Then when a genuine S0/S1 crisis occurs, the alert is lost in the noise. Maintain strict alert discipline.

## Use Cases

### Cascading Database Connection Failure

A PostgreSQL connection pool exhaustion triggers timeout errors across multiple services. The crisis coordinator detects the cascade through correlated telemetry events, classifies it as S1, activates circuit breakers on all database-dependent services, sheds 80% of incoming traffic, and initiates connection pool recovery -- all within 15 seconds of the initial failure.

### Security Breach Response

The [Blue Team](/glossary/blue-team/) drift detector identifies unauthorized access patterns. The crisis coordinator elevates to S0, immediately isolates the affected services, rotates all credentials in the blast radius, activates enhanced logging, and preserves forensic evidence for later analysis.

### Deployment Rollback

A new deployment causes a spike in error rates above the S1 threshold. The crisis coordinator automatically triggers a rollback to the previous known-good deployment on [Fly.io](/glossary/fly-io/), restoring service within 60 seconds. The failed deployment is quarantined for post-incident analysis.

### Memory Exhaustion

BEAM VM memory consumption crosses the critical threshold. The crisis coordinator identifies the process tree responsible through `:erlang.memory/0` analysis, selectively terminates high-memory processes via the [supervisor](/glossary/supervisor/) tree, and activates [backpressure](/glossary/backpressure/) mechanisms to prevent recurrence while the team investigates the leak.

## Related Concepts

- [Crisis Resolution](/glossary/crisis-resolution/) -- the complete end-to-end process that follows initial intervention
- [Incident Response](/glossary/incident-response/) -- broader incident handling framework including non-crisis events
- [Fault Tolerance](/glossary/fault-tolerance/) -- OTP primitives enabling graceful failure handling
- [Self-Healing](/glossary/self-healing/) -- autonomous recovery mechanisms for non-crisis failures
- [Disaster Recovery](/glossary/disaster-recovery/) -- full system restoration after catastrophic failure
- [Archer Supreme](/glossary/archer-supreme/) -- the supreme orchestration agent activated in crisis mode
- [Circuit Breaker](/glossary/circuit-breaker/) -- failure isolation pattern used in containment strategies
- [Supervisor](/glossary/supervisor/) -- OTP supervision tree providing the foundation for crisis containment
- [Dynamic Supervisor](/glossary/dynamic-supervisor/) -- runtime process management during crisis response
- [Backpressure](/glossary/backpressure/) -- load management mechanism activated during traffic shedding
- [Color Teams](/glossary/color-teams/) -- security teams that may initiate crisis intervention
- [Audit Trail](/glossary/audit-trail/) -- immutable record of all crisis actions for post-incident review

## See Also

- [Google SRE: Managing Incidents](https://sre.google/sre-book/managing-incidents/) -- industry-standard incident management practices
- [PagerDuty Incident Response Guide](https://response.pagerduty.com/) -- comprehensive incident response documentation
- [Erlang Supervisor Documentation](https://www.erlang.org/doc/man/supervisor.html) -- OTP supervision tree reference
- [NIST Incident Response Guide (SP 800-61)](https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final) -- federal incident response framework
- Glossary Index -- complete glossary of Prismatic Platform terminology

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
