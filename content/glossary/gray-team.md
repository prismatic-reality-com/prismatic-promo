+++
title = "Gray Team"
weight = 22
[extra]
category = "security"
description = "Boundary exploration team for specification gaps, edge cases, and affordance drift"
related_terms = ["color-teams", "red-team", "nabla-infinity", "black-team", "blue-team", "purple-team"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1536
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Gray", "Team", "Boundary", "glossary", "security", "Prismatic Platform", "Gray Team", "Color Team", "Red Team"]
tags = ["glossary", "security", "gray-team", "prismatic"]
quality_score = 87
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Gray Team - Prismatic Platform"
+++

## Definition and Overview

The Gray Team is a specialized Color Team of 3 agents that performs read-only exploration of specification gaps, edge cases, and affordance drift within the Prismatic Platform's adversarial-defensive security ecosystem. Operating at the earliest stage of the Color Team signal flow, Gray Team surfaces ambiguity without resolving it, feeding boundary seeds into the Red Team pipeline for adversarial scenario generation and informing Blue Team defensive posture assessment. All Gray operations enforce strict zero state changes to the systems under analysis, ensuring that exploration never introduces risk or side effects.

Gray Team represents a fundamental insight in security engineering: the most dangerous vulnerabilities often exist not in code that is clearly wrong, but in specifications that are ambiguously defined. A function that "should validate input" may have no specification for what happens when input is null, empty, partially valid, or encoding-ambiguous. These specification gaps create affordances -- unintended capabilities that emerge from the interaction between ambiguous specifications and implementation choices. Gray Team systematically discovers these affordances before adversaries exploit them.

The team's read-only constraint is both a safety measure and a philosophical position. Gray Team does not fix problems, exploit vulnerabilities, or even categorize findings as "good" or "bad." It catalogs ambiguity in its raw form, preserving the NABLA Infinity axiom of contradiction preservation. A specification gap might be a vulnerability, a feature, or both simultaneously. By preserving this ambiguity, Gray Team ensures that downstream teams (Red, Blue, Purple) receive unbiased boundary intelligence.

Affordance drift is Gray Team's most sophisticated detection capability. Affordance drift occurs when the practical capabilities of a system gradually diverge from its intended capabilities through accumulated small changes, dependency updates, configuration modifications, or environmental changes. Each individual change is too small to trigger security review, but the cumulative effect creates an attack surface that no one designed or authorized. Gray Team detects this drift by comparing current system behavior against historical specifications, identifying capabilities that exist in implementation but not in design documents.

## Technical Deep Dive

### Agent Architecture

Gray Team consists of three agents with distinct roles and authority levels:

| Agent | Authority Level | Role | Key Capability |
|-------|----------------|------|----------------|
| `gray-explorer-commander` | L3 Strategic Commander | Campaign orchestration | Routes findings to Red/Blue/Purple, prioritizes exploration targets |
| `gray-edge-finder` | L4 Specialist | Boundary analysis | Specification gap identification, edge case discovery, boundary value analysis |
| `gray-escalation-guard` | L4 Safety-Critical | Scope enforcement | Override authority to halt any Gray operation approaching Black territory |

The L3/L4 authority levels are significant. The commander (L3) has strategic decision-making authority for campaign planning and finding routing, while the specialists (L4) have focused execution authority within their domains. The escalation guard's L4 safety-critical designation gives it override authority over both the commander and the edge finder, ensuring that safety constraints cannot be circumvented by command authority.

### Exploration Methodology

Gray Team exploration follows a structured five-phase methodology:

```
Phase 1: Target Selection
┌──────────────────────┐
│ Identify exploration  │
│ targets from:         │
│ - API boundaries      │
│ - Type interfaces     │
│ - Configuration edges │
│ - Dependency surfaces │
└──────────┬───────────┘
           │
Phase 2: Specification Analysis
┌──────────┴───────────┐
│ Compare implemented   │
│ behavior against:     │
│ - @spec declarations  │
│ - @doc descriptions   │
│ - @moduledoc purpose  │
│ - Test assertions     │
└──────────┬───────────┘
           │
Phase 3: Gap Discovery
┌──────────┴───────────┐
│ Identify:             │
│ - Unspecified inputs  │
│ - Ambiguous behaviors │
│ - Missing error cases │
│ - Implicit assumptions│
└──────────┬───────────┘
           │
Phase 4: Affordance Mapping
┌──────────┴───────────┐
│ Map capabilities that │
│ exist in code but not │
│ in specification:     │
│ - Unintended features │
│ - Emergent behaviors  │
│ - Side-channel access │
└──────────┬───────────┘
           │
Phase 5: Finding Emission
┌──────────┴───────────┐
│ Emit structured       │
│ findings to:          │
│ → Red Team (seeds)    │
│ → Blue Team (intel)   │
│ → Purple (synthesis)  │
└──────────────────────┘
```

### Finding Structure

Gray Team findings follow a structured format that preserves ambiguity while providing actionable intelligence:

```elixir
defmodule PrismaticGray.Finding do
  @moduledoc """
  Structured boundary finding emitted by Gray Team exploration.
  Preserves ambiguity per NABLA contradiction preservation axiom.
  """

  @type severity :: :informational | :notable | :significant | :critical
  @type category :: :specification_gap | :edge_case | :affordance_drift | :boundary_condition

  @type t :: %__MODULE__{
    id: String.t(),
    category: category(),
    severity: severity(),
    target: String.t(),
    description: String.t(),
    specification: String.t() | nil,
    actual_behavior: String.t(),
    ambiguity_note: String.t(),
    discovered_at: DateTime.t(),
    discovered_by: atom(),
    escalation_risk: float()
  }

  defstruct [
    :id, :category, :severity, :target,
    :description, :specification, :actual_behavior,
    :ambiguity_note, :discovered_at, :discovered_by,
    escalation_risk: 0.0
  ]

  @spec emit(t()) :: :ok | {:error, :escalation_blocked}
  def emit(%__MODULE__{escalation_risk: risk} = finding) when risk > 0.8 do
    # High escalation risk triggers the escalation guard
    PrismaticGray.EscalationGuard.review(finding)
  end

  def emit(%__MODULE__{} = finding) do
    :telemetry.execute(
      [:prismatic, :gray_team, :finding],
      %{severity: finding.severity, category: finding.category},
      %{target: finding.target}
    )

    PrismaticGray.Commander.route_finding(finding)
  end
end
```

### Boundary Value Analysis

The edge finder agent performs systematic boundary value analysis on platform interfaces:

```elixir
defmodule PrismaticGray.EdgeFinder do
  @moduledoc """
  L4 Specialist agent performing boundary value analysis
  and specification gap identification.
  """

  @spec analyze_function_boundary(module(), atom(), non_neg_integer()) :: list(PrismaticGray.Finding.t())
  def analyze_function_boundary(module, function, arity) do
    spec = fetch_typespec(module, function, arity)
    docs = fetch_documentation(module, function, arity)
    tests = find_test_assertions(module, function)

    boundary_gaps =
      identify_type_boundaries(spec) ++
      identify_doc_ambiguities(docs) ++
      identify_untested_boundaries(spec, tests) ++
      identify_implicit_assumptions(module, function, arity)

    Enum.map(boundary_gaps, fn gap ->
      %PrismaticGray.Finding{
        id: generate_finding_id(module, function, gap),
        category: gap.category,
        severity: assess_gap_severity(gap),
        target: "#{inspect(module)}.#{function}/#{arity}",
        description: gap.description,
        specification: format_spec(spec),
        actual_behavior: gap.observed_behavior,
        ambiguity_note: gap.ambiguity,
        discovered_at: DateTime.utc_now(),
        discovered_by: :gray_edge_finder,
        escalation_risk: calculate_escalation_risk(gap)
      }
    end)
  end

  defp identify_type_boundaries(nil), do: []
  defp identify_type_boundaries(spec) do
    # Analyze typespec for edge cases
    # e.g., String.t() - what about empty string? Unicode? Very long strings?
    # e.g., integer() - what about negative? Zero? Very large?
    # e.g., map() - what about empty map? Nested? Circular reference?
    extract_boundary_conditions(spec)
  end

  defp identify_untested_boundaries(spec, tests) do
    specified_types = extract_types_from_spec(spec)
    tested_values = extract_values_from_tests(tests)

    specified_types
    |> Enum.flat_map(&boundary_values_for_type/1)
    |> Enum.reject(fn boundary -> covered_by_test?(boundary, tested_values) end)
    |> Enum.map(fn boundary ->
      %{
        category: :specification_gap,
        description: "Boundary value #{inspect(boundary.value)} not covered by tests",
        observed_behavior: "Unknown - untested boundary",
        ambiguity: "Behavior at boundary #{boundary.description} is unverified"
      }
    end)
  end
end
```

### Escalation Guard

The escalation guard is the safety-critical component that prevents Gray Team exploration from crossing into Black Team territory:

```elixir
defmodule PrismaticGray.EscalationGuard do
  @moduledoc """
  L4 Safety-Critical agent preventing Gray-to-Black escalation.
  Has override authority to halt any Gray operation.
  """
  use GenServer

  @escalation_threshold 0.7
  @block_threshold 0.9

  @type escalation_level :: :safe | :caution | :warning | :blocked
  @type review_result :: {:ok, :approved} | {:ok, :modified} | {:error, :blocked}

  defstruct [:blocked_count, :approved_count, :modified_count, audit_log: []]

  @spec review(PrismaticGray.Finding.t()) :: review_result()
  def review(finding) do
    GenServer.call(__MODULE__, {:review, finding})
  end

  @spec halt_operation(String.t()) :: :ok
  def halt_operation(reason) do
    GenServer.cast(__MODULE__, {:halt, reason})
  end

  @impl GenServer
  def handle_call({:review, finding}, _from, state) do
    level = classify_escalation_level(finding)

    {result, new_state} =
      case level do
        :safe ->
          {{:ok, :approved}, %{state | approved_count: state.approved_count + 1}}

        :caution ->
          modified = sanitize_finding(finding)
          {{:ok, :modified}, %{state | modified_count: state.modified_count + 1}}

        :warning ->
          modified = heavily_sanitize_finding(finding)
          log_warning(finding, state)
          {{:ok, :modified}, %{state | modified_count: state.modified_count + 1}}

        :blocked ->
          log_blocked(finding, state)
          {{:error, :blocked}, %{state | blocked_count: state.blocked_count + 1}}
      end

    audit_entry = %{
      finding_id: finding.id,
      level: level,
      result: result,
      timestamp: DateTime.utc_now()
    }

    {:reply, result, %{new_state | audit_log: [audit_entry | state.audit_log]}}
  end

  defp classify_escalation_level(%{escalation_risk: risk}) when risk >= @block_threshold, do: :blocked
  defp classify_escalation_level(%{escalation_risk: risk}) when risk >= @escalation_threshold, do: :warning
  defp classify_escalation_level(%{escalation_risk: risk}) when risk >= 0.4, do: :caution
  defp classify_escalation_level(_), do: :safe
end
```

## Architecture and Implementation

### Signal Flow Integration

Gray Team operates at the entry point of the Color Team signal flow:

```
Gray Team (Boundary Seeds)
    │
    ├──────────────────────────> Red Team (Adversarial Scenarios)
    │                               │
    │                               v
    ├──────────────────────────> Purple Team (Synthesis & Closure)
    │                               │
    │                               v
    └──────────────────────────> Blue Team (Defensive Posture)
                                    │
                                    v
                               Platform Defense
```

Every finding emitted by Gray Team flows into the Color Team ecosystem. The commander decides routing based on finding characteristics: specification gaps typically route to Red Team for adversarial exploitation analysis, edge cases route to Blue Team for defensive hardening, and affordance drift routes to Purple Team for synthesis and trend analysis.

### Campaign Management

Gray Team organizes exploration into campaigns -- structured investigations of specific platform areas:

| Campaign Type | Duration | Scope | Output |
|--------------|----------|-------|--------|
| **Module Audit** | 1-4 hours | Single module or application | Function-level boundary findings |
| **Interface Survey** | 4-8 hours | Cross-application boundaries | Protocol and API gap inventory |
| **Drift Assessment** | Periodic (weekly) | Platform-wide | Affordance drift trend report |
| **Dependency Scan** | On dependency update | Changed dependency surface | New boundary introduction report |

## Usage in Prismatic Platform

Within the Prismatic Platform's 434-agent ecosystem, Gray Team provides foundational boundary intelligence that informs all security operations. The team's findings are particularly valuable for:

### Quality Gate Enhancement

Gray Team findings identify gaps in quality gate coverage. When a specification gap is discovered, it often indicates a missing test case or an incomplete type specification. These findings feed back into the quality enforcement system:

```elixir
defmodule PrismaticGray.QualityFeedback do
  @moduledoc """
  Converts Gray Team findings into quality gate improvement suggestions.
  """

  @spec findings_to_quality_suggestions(list(PrismaticGray.Finding.t())) :: list(map())
  def findings_to_quality_suggestions(findings) do
    findings
    |> Enum.filter(&quality_relevant?/1)
    |> Enum.map(fn finding ->
      %{
        target: finding.target,
        suggestion_type: map_to_quality_domain(finding.category),
        description: "Add #{finding.category} coverage for #{finding.target}",
        priority: severity_to_priority(finding.severity),
        source: "gray-team-#{finding.id}"
      }
    end)
  end

  defp quality_relevant?(%{category: :specification_gap}), do: true
  defp quality_relevant?(%{category: :boundary_condition}), do: true
  defp quality_relevant?(_), do: false

  defp map_to_quality_domain(:specification_gap), do: :typespec_coverage
  defp map_to_quality_domain(:boundary_condition), do: :test_coverage
end
```

### NABLA Compliance

Gray Team operations are governed by the NABLA Infinity epistemic framework. The contradiction preservation axiom is particularly relevant: Gray Team preserves ambiguous findings in their raw form rather than resolving them prematurely. A finding that could be either a vulnerability or a feature is emitted as ambiguous, allowing downstream teams to evaluate it from their respective perspectives.

### Telemetry and Monitoring

All Gray Team operations emit telemetry events for observability:

| Event | Measurements | Metadata |
|-------|-------------|----------|
| `[:prismatic, :gray_team, :exploration, :start]` | `%{target_count: n}` | `%{campaign: name}` |
| `[:prismatic, :gray_team, :finding]` | `%{severity: s, category: c}` | `%{target: t}` |
| `[:prismatic, :gray_team, :escalation, :review]` | `%{risk: r}` | `%{level: l, result: r}` |
| `[:prismatic, :gray_team, :exploration, :complete]` | `%{duration: d, findings: n}` | `%{campaign: name}` |

## Best Practices

**Maintain strict read-only discipline.** Gray Team must never modify the systems it explores. Even seemingly harmless state changes (creating test records, writing logs) can alter system behavior and contaminate findings. Read-only enforcement should be verified through process isolation and access control.

**Preserve ambiguity in findings.** Resist the urge to classify findings as "vulnerabilities" or "non-issues" at the Gray Team level. The ambiguity note field exists for a reason. Premature classification introduces bias that can cause downstream teams to miss important signals.

**Rotate exploration targets systematically.** Avoid the tendency to repeatedly explore familiar areas. Use the campaign management system to ensure comprehensive coverage across all platform applications, interfaces, and dependency surfaces.

**Document specification sources.** When identifying a gap, document what specification the gap is relative to. A gap between code behavior and documentation is different from a gap between code behavior and type specifications. The source of the specification affects how downstream teams evaluate the finding.

**Calibrate escalation thresholds conservatively.** The escalation guard should block liberally rather than conservatively. A blocked finding that was actually safe costs nothing; a passed finding that crosses into Black territory compromises the safety model.

## Common Pitfalls

**Confusing exploration with exploitation.** Gray Team discovers boundaries; it does not cross them. If an edge case causes a crash, Gray Team reports the crash boundary. It does not attempt to craft inputs that reliably trigger the crash, as that is Red Team's domain.

**Overwhelming downstream teams with low-severity findings.** Comprehensive boundary analysis can produce hundreds of informational findings. Without severity filtering and prioritization, downstream teams cannot process the volume. Use the commander's routing intelligence to filter noise.

**Neglecting affordance drift detection.** Specification gap analysis is more immediately satisfying than drift detection, but drift is often more dangerous because it represents silent, gradual degradation of the security posture. Ensure drift assessment campaigns run regularly.

**Underestimating the escalation guard's authority.** The escalation guard has override authority over the commander. Attempts to circumvent the guard (splitting findings to reduce individual risk scores, reframing findings to avoid trigger patterns) undermine the safety model and should be treated as violations.

**Static exploration without temporal context.** Boundaries change over time as code evolves. Gray Team findings should include temporal context: when was this boundary introduced, has it changed recently, is it trending toward or away from specification compliance.

## Integration with Platform Systems

Gray Team findings integrate with multiple platform systems beyond the Color Team ecosystem. The discovery of specification gaps triggers updates to the Quality DNA system, which tracks quality trends across sessions. Boundary conditions identified by Gray Team become inputs for property-based testing frameworks, ensuring that edge cases are systematically tested in future development cycles.

The platform's autoheal system consumes Gray Team findings to identify self-healing opportunities. If Gray Team discovers that a function gracefully handles a boundary condition that is not formally specified, the autoheal system may propose formalizing that behavior through specification updates and test coverage enhancement.

Gray Team also contributes to the SEADF (Scanner, Pipeline, Quality Guardian, Knowledge Sync, Cross-Domain Innovator, Autonomous Reporter, Enhanced Healing) framework's knowledge synchronization component. Boundary discoveries feed into cross-domain pattern recognition, helping identify when similar specification gaps exist across different applications or modules.

## Performance and Scalability Characteristics

Gray Team exploration is designed to scale with the platform's growth. The current 3-agent configuration handles the analysis of 115 umbrella applications effectively, but the architecture supports horizontal scaling. Additional edge finder agents can operate in parallel on different modules or application domains, with the commander coordinating assignment and deduplication.

Exploration performance varies by campaign type. Module audits typically complete in 1-4 hours for applications with 10-50 modules. Interface surveys require 4-8 hours to comprehensively map cross-application boundaries. The weekly affordance drift assessment completes overnight, analyzing the entire platform for accumulated behavioral changes.

The escalation guard introduces minimal overhead -- less than 50ms per finding review. However, its audit trail provides valuable telemetry for understanding Gray Team effectiveness and calibrating escalation thresholds over time.

## Related Concepts

- [Color Teams](/glossary/color-teams/) -- Full overview of all 6 adversarial-defensive security teams
- [Red Team](/glossary/red-team/) -- Consumes Gray boundary seeds for adversarial scenario generation
- [Blue Team](/glossary/blue-team/) -- Defensive team informed by Gray boundary discoveries
- [Purple Team](/glossary/purple-team/) -- Synthesis team incorporating Gray findings into closure analysis
- [Black Team](/glossary/black-team/) -- Isolated team whose access Gray's escalation guard protects
- [NABLA Infinity](/glossary/nabla-infinity/) -- Epistemic framework governing boundary exploration methodology
- [Quality Gates](/glossary/quality-gates/) -- Quality enforcement enhanced by Gray Team findings

## See Also

- [Architecture](/architecture/) -- Platform architecture overview
- [Technologies](/technologies/) -- Technology stack details
- [Agents](/agents/) -- AIAD agents including Gray Team members

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)