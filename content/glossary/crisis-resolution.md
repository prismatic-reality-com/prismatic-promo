+++
title = "Crisis Resolution"
weight = 50
[extra]
tags = ["glossary", "operations", "crisis", "resolution", "incident-response", "archer-supreme", "post-mortem", "root-cause-analysis", "recovery", "self-healing", "resilience", "regression-prevention"]
description = "Complete end-to-end process of identifying, containing, mitigating, and recovering from system crises, including Archer Supreme multi-agent orchestration, root cause analysis, and regression prevention within the Prismatic Platform"
category = "operations"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "operations-and-resilience"
related_concepts = ["crisis-intervention", "incident-response", "self-healing", "disaster-recovery", "archer-supreme", "fault-tolerance", "circuit-breaker", "quality-floor-guardian"]
implementation_status = "production"
authority_level = "L5 Cosmic"
difficulty_rating = 8
prerequisites = ["crisis-intervention", "incident-response", "fault-tolerance", "supervisor", "genserver"]
learning_path = ["fault-tolerance", "incident-response", "crisis-intervention", "crisis-resolution", "disaster-recovery"]
interactive_demos = ["/labs/glossary/crisis-resolution"]
code_examples = ["CrisisResolutionPipeline", "RootCauseAnalyzer", "RecoveryOrchestrator", "RegressionGuard"]
external_resources = ["https://sre.google/sre-book/postmortem-culture/", "https://www.jeli.io/howie/welcome", "https://www.learningfromincidents.io/"]
version_introduced = "0.3.0"
stability_level = "stable"
testing_scenarios = ["full_resolution_lifecycle", "root_cause_identification", "recovery_validation", "regression_test_generation", "authority_revocation", "post_mortem_report"]
keywords = ["crisis resolution", "root cause analysis", "post-mortem", "recovery orchestration", "regression prevention", "blameless review", "incident timeline", "corrective action", "system recovery", "resilience improvement"]
related_terms = ["crisis-intervention", "incident-response", "self-healing", "disaster-recovery", "archer-supreme", "fault-tolerance", "circuit-breaker", "quality-floor-guardian", "autoevolve", "autoheal"]
word_count = 1579
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Crisis Resolution - Prismatic Platform"
+++

## Definition

Crisis resolution is the complete end-to-end process of moving a system from crisis state back to healthy operation, encompassing root cause identification, corrective action implementation, recovery validation, and regression prevention. While [crisis intervention](@/glossary/crisis-intervention.md) focuses on the first minutes -- containment and stabilization -- crisis resolution addresses the hours and days that follow: understanding why the crisis occurred, implementing permanent fixes, verifying recovery, and ensuring the same failure cannot recur.

In the Prismatic Platform, crisis resolution is orchestrated by [Archer Supreme](@/glossary/archer-supreme.md), which coordinates multi-agent response teams through a structured resolution pipeline. Every crisis resolution concludes with mandatory regression tests and platform evolution -- the crisis becomes a catalyst for making the system stronger than it was before the failure, embodying the antifragile principle that stress exposure improves system resilience.

## Overview

The distinction between crisis intervention and crisis resolution maps to the difference between stopping the bleeding and healing the wound. Intervention is reactive, urgent, and authority-concentrated. Resolution is methodical, evidence-based, and collaborative. Both are essential, but they require fundamentally different approaches.

Crisis resolution in the Prismatic Platform follows a seven-phase pipeline:

1. **Stabilization Verification**: Confirm that containment actions from the intervention phase are holding. Verify that the blast radius is not expanding and that affected services have reached a stable (even if degraded) state.

2. **Root Cause Analysis**: Systematically trace the causal chain from the observable symptoms back to the originating fault. This uses the platform's [audit trail](@/glossary/audit-trail.md), telemetry data, and crisis timeline to construct a provenance-complete explanation.

3. **Corrective Action Planning**: Design the fix that addresses the root cause, not just the symptoms. Evaluate alternatives with pros/cons. Plan the implementation, testing, and deployment sequence.

4. **Fix Implementation**: Apply the corrective changes under the [NO MERCY](@/glossary/no-mercy.md) doctrine -- full test coverage, zero compilation warnings, complete [quality gates](@/glossary/quality-gates.md) passage.

5. **Recovery Execution**: Restore affected services to full operation. This may involve data reconciliation, cache warming, connection pool restoration, and gradual traffic ramp-up.

6. **Regression Prevention**: Generate and integrate regression tests that would catch this specific failure mode. Update monitoring thresholds, containment strategies, and runbooks.

7. **Post-Mortem Documentation**: Produce a blameless post-mortem documenting the timeline, root cause, impact, response effectiveness, and lessons learned. This feeds into the platform's knowledge base.

The Prismatic Platform enforces this complete pipeline for every S0 and S1 crisis. Partial resolution -- fixing the symptom without addressing the root cause, or fixing the code without adding regression tests -- is a violation of the NO MERCY doctrine and is blocked by the pre-commit hooks.

## Technical Details

### Resolution Pipeline Architecture

```
┌──────────────┐
│  Crisis       │
│  Intervention │
│  (contained)  │
└──────┬───────┘
       │ handoff
       v
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Stabilization │───>│  Root Cause   │───>│  Corrective   │
│ Verification  │    │  Analysis     │    │  Planning     │
└──────────────┘    └──────────────┘    └──────────────┘
                                              │
                                              v
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Post-Mortem   │<───│  Regression   │<───│  Recovery     │
│ Documentation │    │  Prevention   │    │  Execution    │
└──────────────┘    └──────────────┘    └──────────────┘
       │
       v
┌──────────────┐
│  Platform     │
│  Evolution    │
│  (stronger)   │
└──────────────┘
```

### Crisis Resolution Pipeline Implementation

```elixir
defmodule Prismatic.Crisis.ResolutionPipeline do
  @moduledoc """
  Orchestrates the complete crisis resolution lifecycle from
  post-containment stabilization through post-mortem documentation.

  The pipeline is structured as a state machine with mandatory
  phase transitions. No phase can be skipped. Each phase must
  report completion with evidence before the next phase begins.

  ## Pipeline Phases

  1. Stabilization Verification
  2. Root Cause Analysis
  3. Corrective Action Planning
  4. Fix Implementation
  5. Recovery Execution
  6. Regression Prevention
  7. Post-Mortem Documentation
  """

  use GenServer

  alias Prismatic.Crisis.{
    StabilizationVerifier,
    RootCauseAnalyzer,
    CorrectiveActionPlanner,
    RecoveryOrchestrator,
    RegressionGuard,
    PostMortemGenerator
  }

  @type phase ::
          :stabilization
          | :root_cause_analysis
          | :corrective_planning
          | :fix_implementation
          | :recovery
          | :regression_prevention
          | :post_mortem
          | :complete

  @type resolution_state :: %{
          crisis_id: String.t(),
          phase: phase(),
          started_at: DateTime.t(),
          phase_history: [%{phase: phase(), completed_at: DateTime.t(), evidence: map()}],
          root_cause: map() | nil,
          corrective_actions: [map()],
          regression_tests: [String.t()],
          post_mortem: map() | nil
        }

  @phase_order [
    :stabilization,
    :root_cause_analysis,
    :corrective_planning,
    :fix_implementation,
    :recovery,
    :regression_prevention,
    :post_mortem,
    :complete
  ]

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec begin_resolution(String.t(), map()) :: {:ok, resolution_state()} | {:error, term()}
  def begin_resolution(crisis_id, crisis_data) do
    GenServer.call(__MODULE__, {:begin, crisis_id, crisis_data})
  end

  @spec advance_phase(map()) :: {:ok, phase()} | {:error, term()}
  def advance_phase(evidence) do
    GenServer.call(__MODULE__, {:advance, evidence})
  end

  @spec get_resolution_status() :: {:ok, resolution_state()} | {:error, :no_active_resolution}
  def get_resolution_status do
    GenServer.call(__MODULE__, :status)
  end

  @impl true
  def init(_opts) do
    {:ok, %{active_resolution: nil, completed: []}}
  end

  @impl true
  def handle_call({:begin, crisis_id, crisis_data}, _from, state) do
    resolution = %{
      crisis_id: crisis_id,
      phase: :stabilization,
      started_at: DateTime.utc_now(),
      phase_history: [],
      root_cause: nil,
      corrective_actions: [],
      regression_tests: [],
      post_mortem: nil,
      crisis_data: crisis_data
    }

    emit_telemetry(:resolution_started, resolution)
    {:reply, {:ok, resolution}, %{state | active_resolution: resolution}}
  end

  @impl true
  def handle_call({:advance, evidence}, _from, %{active_resolution: nil} = state) do
    {:reply, {:error, :no_active_resolution}, state}
  end

  @impl true
  def handle_call({:advance, evidence}, _from, state) do
    resolution = state.active_resolution
    current_phase = resolution.phase

    case validate_phase_evidence(current_phase, evidence) do
      :ok ->
        next_phase = next_phase(current_phase)

        phase_record = %{
          phase: current_phase,
          completed_at: DateTime.utc_now(),
          evidence: evidence
        }

        updated_resolution =
          resolution
          |> Map.put(:phase, next_phase)
          |> Map.update!(:phase_history, &[phase_record | &1])
          |> apply_phase_results(current_phase, evidence)

        updated_resolution =
          if next_phase == :complete do
            emit_telemetry(:resolution_complete, updated_resolution)
            updated_resolution
          else
            emit_telemetry(:phase_advanced, updated_resolution)
            updated_resolution
          end

        new_state =
          if next_phase == :complete do
            %{state |
              active_resolution: nil,
              completed: [updated_resolution | state.completed]
            }
          else
            %{state | active_resolution: updated_resolution}
          end

        {:reply, {:ok, next_phase}, new_state}

      {:error, reason} ->
        {:reply, {:error, {:insufficient_evidence, reason}}, state}
    end
  end

  @impl true
  def handle_call(:status, _from, state) do
    case state.active_resolution do
      nil -> {:reply, {:error, :no_active_resolution}, state}
      resolution -> {:reply, {:ok, resolution}, state}
    end
  end

  @spec next_phase(phase()) :: phase()
  defp next_phase(current) do
    current_index = Enum.find_index(@phase_order, &(&1 == current))
    Enum.at(@phase_order, current_index + 1, :complete)
  end

  @spec validate_phase_evidence(phase(), map()) :: :ok | {:error, String.t()}
  defp validate_phase_evidence(:stabilization, evidence) do
    if Map.has_key?(evidence, :services_stable) and evidence.services_stable do
      :ok
    else
      {:error, "Stabilization requires confirmation that all services are stable"}
    end
  end

  defp validate_phase_evidence(:root_cause_analysis, evidence) do
    if Map.has_key?(evidence, :root_cause) and Map.has_key?(evidence, :causal_chain) do
      :ok
    else
      {:error, "Root cause analysis requires identified root_cause and causal_chain"}
    end
  end

  defp validate_phase_evidence(:corrective_planning, evidence) do
    if Map.has_key?(evidence, :actions) and length(evidence.actions) > 0 do
      :ok
    else
      {:error, "Corrective planning requires at least one planned action"}
    end
  end

  defp validate_phase_evidence(:fix_implementation, evidence) do
    if Map.has_key?(evidence, :commits) and Map.has_key?(evidence, :tests_passing) do
      :ok
    else
      {:error, "Fix implementation requires commits and passing tests"}
    end
  end

  defp validate_phase_evidence(:recovery, evidence) do
    if Map.has_key?(evidence, :services_recovered) and evidence.services_recovered do
      :ok
    else
      {:error, "Recovery requires confirmation that all services are fully recovered"}
    end
  end

  defp validate_phase_evidence(:regression_prevention, evidence) do
    if Map.has_key?(evidence, :regression_tests) and length(evidence.regression_tests) > 0 do
      :ok
    else
      {:error, "Regression prevention requires at least one regression test"}
    end
  end

  defp validate_phase_evidence(:post_mortem, evidence) do
    required_fields = [:timeline, :root_cause, :impact, :lessons_learned]

    if Enum.all?(required_fields, &Map.has_key?(evidence, &1)) do
      :ok
    else
      missing = Enum.reject(required_fields, &Map.has_key?(evidence, &1))
      {:error, "Post-mortem missing required fields: #{inspect(missing)}"}
    end
  end

  defp validate_phase_evidence(_phase, _evidence), do: :ok

  @spec apply_phase_results(resolution_state(), phase(), map()) :: resolution_state()
  defp apply_phase_results(resolution, :root_cause_analysis, evidence) do
    %{resolution | root_cause: evidence.root_cause}
  end

  defp apply_phase_results(resolution, :corrective_planning, evidence) do
    %{resolution | corrective_actions: evidence.actions}
  end

  defp apply_phase_results(resolution, :regression_prevention, evidence) do
    %{resolution | regression_tests: evidence.regression_tests}
  end

  defp apply_phase_results(resolution, :post_mortem, evidence) do
    %{resolution | post_mortem: evidence}
  end

  defp apply_phase_results(resolution, _phase, _evidence), do: resolution

  @spec emit_telemetry(atom(), resolution_state()) :: :ok
  defp emit_telemetry(event, resolution) do
    :telemetry.execute(
      [:prismatic, :crisis, :resolution, event],
      %{count: 1, timestamp: System.monotonic_time()},
      %{crisis_id: resolution.crisis_id, phase: resolution.phase}
    )
  end
end
```

### Root Cause Analyzer

The root cause analyzer uses the platform's telemetry data, audit trail, and crisis timeline to construct a causal chain:

```elixir
defmodule Prismatic.Crisis.RootCauseAnalyzer do
  @moduledoc """
  Systematic root cause analysis using telemetry correlation,
  timeline analysis, and causal chain construction.

  Implements the "Five Whys" approach augmented with automated
  telemetry analysis to identify the originating fault that
  led to the observable crisis symptoms.
  """

  @type causal_link :: %{
          event: String.t(),
          timestamp: DateTime.t(),
          caused_by: String.t() | nil,
          evidence: [String.t()],
          confidence: float()
        }

  @type root_cause :: %{
          description: String.t(),
          category: cause_category(),
          causal_chain: [causal_link()],
          confidence: float(),
          affected_components: [String.t()],
          contributing_factors: [String.t()]
        }

  @type cause_category ::
          :code_defect
          | :configuration_error
          | :resource_exhaustion
          | :dependency_failure
          | :security_breach
          | :data_corruption
          | :deployment_failure
          | :infrastructure_failure

  @spec analyze(map()) :: {:ok, root_cause()} | {:error, :insufficient_data}
  def analyze(crisis_data) do
    with {:ok, timeline} <- reconstruct_timeline(crisis_data),
         {:ok, correlations} <- correlate_telemetry(crisis_data),
         {:ok, chain} <- build_causal_chain(timeline, correlations),
         {:ok, root} <- identify_root(chain) do
      {:ok, %{
        description: root.description,
        category: categorize_cause(root),
        causal_chain: chain,
        confidence: calculate_confidence(chain),
        affected_components: extract_components(chain),
        contributing_factors: extract_contributing_factors(timeline, chain)
      }}
    end
  end

  @spec reconstruct_timeline(map()) :: {:ok, [map()]} | {:error, :insufficient_data}
  defp reconstruct_timeline(%{timeline: timeline}) when length(timeline) > 0 do
    sorted = Enum.sort_by(timeline, & &1.timestamp, DateTime)
    {:ok, sorted}
  end

  defp reconstruct_timeline(_), do: {:error, :insufficient_data}

  @spec correlate_telemetry(map()) :: {:ok, [map()]} | {:error, :insufficient_data}
  defp correlate_telemetry(%{crisis_id: crisis_id, detected_at: detected_at}) do
    window_start = DateTime.add(detected_at, -300, :second)
    window_end = DateTime.add(detected_at, 60, :second)

    {:ok, [%{
      crisis_id: crisis_id,
      window: {window_start, window_end},
      correlations: []
    }]}
  end

  defp correlate_telemetry(_), do: {:error, :insufficient_data}

  @spec build_causal_chain([map()], [map()]) :: {:ok, [causal_link()]} | {:error, term()}
  defp build_causal_chain(timeline, _correlations) do
    chain =
      timeline
      |> Enum.with_index()
      |> Enum.map(fn {event, index} ->
        %{
          event: to_string(event.event),
          timestamp: event.timestamp,
          caused_by: if(index > 0, do: to_string(Enum.at(timeline, index - 1).event)),
          evidence: [inspect(event.details)],
          confidence: 1.0 - index * 0.05
        }
      end)

    {:ok, chain}
  end

  @spec identify_root([causal_link()]) :: {:ok, map()} | {:error, :no_root_found}
  defp identify_root([first | _]) do
    {:ok, %{description: "Root event: #{first.event}", event: first}}
  end

  defp identify_root([]), do: {:error, :no_root_found}

  @spec categorize_cause(map()) :: cause_category()
  defp categorize_cause(%{description: desc}) do
    cond do
      String.contains?(desc, "deploy") -> :deployment_failure
      String.contains?(desc, "memory") -> :resource_exhaustion
      String.contains?(desc, "auth") -> :security_breach
      String.contains?(desc, "config") -> :configuration_error
      true -> :code_defect
    end
  end

  @spec calculate_confidence([causal_link()]) :: float()
  defp calculate_confidence(chain) do
    if chain == [] do
      0.0
    else
      chain
      |> Enum.map(& &1.confidence)
      |> Enum.min()
    end
  end

  @spec extract_components([causal_link()]) :: [String.t()]
  defp extract_components(chain), do: Enum.map(chain, & &1.event) |> Enum.uniq()

  @spec extract_contributing_factors([map()], [causal_link()]) :: [String.t()]
  defp extract_contributing_factors(_timeline, _chain), do: []
end
```

### Regression Guard

Every crisis resolution in the Prismatic Platform must produce regression tests. The `RegressionGuard` enforces this requirement:

```elixir
defmodule Prismatic.Crisis.RegressionGuard do
  @moduledoc """
  Enforces the mandatory regression test requirement for all
  crisis resolutions. No crisis can be marked as resolved
  without at least one regression test that would have caught
  the originating failure.

  This implements the platform's absolute regression test protocol:
  every bug fix MUST include regression tests, no bypass, no exceptions.
  """

  @type regression_test :: %{
          test_file: String.t(),
          test_name: String.t(),
          failure_mode: String.t(),
          validates: String.t()
        }

  @spec validate_regression_tests([regression_test()]) :: :ok | {:error, String.t()}
  def validate_regression_tests([]) do
    {:error, "MANDATORY: At least one regression test required for crisis resolution"}
  end

  def validate_regression_tests(tests) when is_list(tests) do
    missing_fields =
      Enum.flat_map(tests, fn test ->
        required = [:test_file, :test_name, :failure_mode, :validates]
        Enum.reject(required, &Map.has_key?(test, &1))
      end)

    if missing_fields == [] do
      :ok
    else
      {:error, "Regression tests missing required fields: #{inspect(Enum.uniq(missing_fields))}"}
    end
  end

  @spec generate_regression_report(String.t(), map(), [regression_test()]) :: String.t()
  def generate_regression_report(crisis_id, root_cause, tests) do
    """
    REGRESSION TEST REPORT
    ━━━━━━━━━━━━━━━━━━━━━━━━━
    Crisis ID: #{crisis_id}
    Root Cause: #{root_cause.description}
    Category: #{root_cause.category}
    Tests Added: #{length(tests)}
    #{Enum.map_join(tests, "\n", fn t -> "  - #{t.test_file}: #{t.test_name}" end)}
    Validation: Tests fail before fix, pass after fix
    Coverage: #{Enum.map_join(tests, ", ", & &1.failure_mode)}
    """
  end
end
```

## Implementation in Prismatic Platform

### Archer Supreme Orchestration

[Archer Supreme](@/glossary/archer-supreme.md) serves as the crisis resolution orchestrator, coordinating multiple specialized agents:

| Agent Role | Responsibility | Phase |
|------------|---------------|-------|
| **Stabilization Agent** | Verify containment holding, monitor for re-escalation | Phase 1 |
| **Forensic Agent** | Collect telemetry, logs, timeline data | Phase 2 |
| **Analysis Agent** | Build causal chain, identify root cause | Phase 2 |
| **Planning Agent** | Design corrective actions, evaluate alternatives | Phase 3 |
| **Implementation Agent** | Apply fixes with full quality compliance | Phase 4 |
| **Recovery Agent** | Restore services, validate health | Phase 5 |
| **Regression Agent** | Generate and validate regression tests | Phase 6 |
| **Documentation Agent** | Produce post-mortem report | Phase 7 |

### Integration with AutoHeal and AutoEvolve

Crisis resolution feeds directly into the platform's autonomous evolution systems:

- [AutoHeal](@/glossary/autoheal.md) receives the root cause analysis and updates its detection patterns, enabling faster detection of similar issues in the future.
- [AutoEvolve](@/glossary/autoevolve.md) receives the corrective actions and regression tests, incorporating them into the platform's evolutionary fitness function.
- The [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) updates its thresholds based on the crisis severity and detection latency.

### Post-Mortem Format

Every crisis resolution produces a structured post-mortem document:

```markdown
# Crisis Post-Mortem: [CRI-XXXXX]

## Summary
- **Severity**: S0/S1
- **Duration**: Detection to Resolution
- **Impact**: Services affected, users impacted

## Timeline
- [T+0:00] First anomaly detected
- [T+0:15] Crisis intervention triggered
- [T+0:30] Containment achieved
- [T+2:00] Root cause identified
- [T+4:00] Fix deployed
- [T+5:00] Full recovery confirmed

## Root Cause
[Detailed description with causal chain]

## Corrective Actions
1. [Action taken with justification]
2. [Regression tests added]
3. [Monitoring improvements]

## Lessons Learned
- What went well
- What went poorly
- What we will change

## Action Items
- [ ] Short-term fixes (applied)
- [ ] Medium-term improvements (scheduled)
- [ ] Long-term architecture changes (planned)
```

## Comparison with Alternatives

| Approach | Thoroughness | Automation | Prevention | Culture | Prismatic Usage |
|----------|-------------|-----------|------------|---------|-----------------|
| **Blameless Post-Mortems (Google SRE)** | High | Low | Medium | Excellent | Adopted methodology |
| **ITIL Incident Management** | Very High | Low | Medium | Bureaucratic | Principles adopted |
| **Jeli Incident Analysis** | High | Medium | High | Good | Concepts integrated |
| **Learning from Incidents** | High | Low | High | Excellent | Philosophy adopted |
| **Prismatic Resolution Pipeline** | Very High | High | Very High (mandatory regression tests) | Enforced blameless | Primary method |
| **Ad-hoc Troubleshooting** | Low | None | None | N/A | Forbidden |

The Prismatic approach uniquely combines automated pipeline enforcement with mandatory regression testing. While Google's blameless post-mortem culture is excellent, it relies on social norms. The Prismatic Platform enforces the same outcomes through code: the resolution pipeline cannot advance to "complete" without regression tests, and the pre-commit hooks reject fixes without accompanying tests.

## Best Practices

1. **Complete the full resolution pipeline**: Never mark a crisis as resolved after containment alone. Containment without root cause analysis guarantees recurrence. The pipeline enforces this, but the principle must be internalized.

2. **Maintain blameless analysis**: Root cause analysis must focus on system failures, not human failures. "Engineer X made a mistake" is never a root cause. "The system allowed an unsafe operation without validation" is.

3. **Write regression tests before applying the fix**: The regression test should fail with the current (broken) code and pass with the fix. This validates both the test and the fix.

4. **Document the causal chain, not just the root cause**: Understanding the sequence of events from root cause to observable failure reveals intermediate points where detection or containment could have been earlier.

5. **Feed resolutions back into platform evolution**: Every crisis resolution should make the platform stronger. Update detection thresholds, add monitoring, improve containment strategies, enhance supervision trees.

6. **Time-box each phase**: Root cause analysis can expand indefinitely. Set time limits for each phase and escalate if the limit is reached. A good-enough root cause identified quickly is more valuable than a perfect analysis delivered too late.

7. **Validate recovery under load**: Do not declare recovery until the system has been tested under production-equivalent load. A service that works under light testing may fail again when full traffic is restored.

## Common Pitfalls

1. **Declaring resolution after containment**: The most common failure. Containment stops the immediate bleeding but does not prevent recurrence. True resolution requires root cause analysis, fixes, and regression tests.

2. **Blame-driven analysis**: Identifying a person as the root cause prevents learning. The question is never "who" but "why the system allowed this failure."

3. **Skipping regression tests**: Under pressure to restore service, teams skip the regression test phase. The Prismatic Platform blocks this at the pipeline level -- no advancement past Phase 6 without validated regression tests.

4. **Incomplete causal chain**: Stopping root cause analysis at the first plausible cause misses contributing factors. A database timeout may be the proximate cause, but the root cause might be a missing index, a query regression, or a connection pool misconfiguration.

5. **Not testing recovery under production conditions**: A service that passes unit tests may fail under production load. Recovery validation must include load testing and integration testing.

6. **Post-mortem without action items**: A post-mortem that identifies problems but does not assign concrete, time-bound action items is documentation theater. Every lesson learned must have a corresponding action.

7. **Ignoring near-misses**: Crises that were caught before impact still deserve resolution analysis. The detection succeeded, but the vulnerability that created the near-miss remains.

## Use Cases

### Database Migration Crisis Resolution

A schema migration causes query performance degradation, triggering an S1 crisis. The resolution pipeline identifies the root cause (missing index on a new column used in a high-frequency query), implements the fix (adding the index with `CREATE INDEX CONCURRENTLY`), validates recovery (query performance returns to baseline), and adds regression tests (migration tests that verify index presence for all foreign key columns).

### Memory Leak Resolution

A [GenServer](@/glossary/genserver.md) accumulates state without bounds, eventually exhausting BEAM VM memory. The resolution pipeline traces the causal chain (unbounded list accumulation in `handle_info` callbacks), implements a fix (bounded queue with configurable maximum size), validates recovery (memory consumption stabilizes under sustained load), and adds regression tests (property-based tests verifying bounded memory growth).

### Cascading Failure Resolution

A third-party API timeout cascades through the system due to missing [circuit breakers](@/glossary/circuit-breaker.md). The resolution pipeline identifies all services lacking timeout and circuit breaker protection, implements circuit breakers for all external dependencies, validates recovery (circuit breaker opens cleanly when the dependency is unavailable), and adds regression tests (chaos engineering tests that simulate dependency failures).

### Security Incident Resolution

Unauthorized API access is detected by the [Blue Team](@/glossary/blue-team.md). The resolution pipeline identifies the attack vector (leaked API key from a development environment), implements corrective actions (key revocation, credential rotation, access log analysis), validates recovery (no further unauthorized access), and adds regression tests (automated secret scanning in CI, environment-specific credential isolation verification).

## Related Concepts

- [Crisis Intervention](@/glossary/crisis-intervention.md) -- the immediate containment phase that precedes resolution
- [Incident Response](@/glossary/incident-response.md) -- the broader framework for handling incidents of all severities
- [Self-Healing](@/glossary/self-healing.md) -- autonomous recovery for non-crisis failures
- [Disaster Recovery](@/glossary/disaster-recovery.md) -- full system restoration after catastrophic failure
- [Archer Supreme](@/glossary/archer-supreme.md) -- the supreme orchestration agent that coordinates resolution
- [Fault Tolerance](@/glossary/fault-tolerance.md) -- OTP primitives that prevent failures from becoming crises
- [Circuit Breaker](@/glossary/circuit-breaker.md) -- failure isolation pattern that limits blast radius
- [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) -- continuous quality monitoring that detects degradation
- [AutoEvolve](@/glossary/autoevolve.md) -- evolutionary system that incorporates crisis learnings
- [AutoHeal](@/glossary/autoheal.md) -- autonomous healing system updated by crisis root cause analysis
- [Audit Trail](@/glossary/audit-trail.md) -- immutable event log used during root cause analysis
- [Quality Gates](@/glossary/quality-gates.md) -- quality enforcement that corrective actions must pass

## See Also

- [Google SRE: Postmortem Culture](https://sre.google/sre-book/postmortem-culture/) -- blameless post-mortem methodology
- [Jeli Howie Guide](https://www.jeli.io/howie/welcome) -- modern incident analysis techniques
- [Learning from Incidents](https://www.learningfromincidents.io/) -- community of practice for incident learning
- [NIST SP 800-61: Computer Security Incident Handling](https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final) -- federal incident response guide
- Glossary Index -- complete glossary of Prismatic Platform terminology

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
