+++
title = "Gray Team"
weight = 1
[extra]
color = "gray"
agent_count = 3
commander = "gray-explorer-commander"
role = "Boundary Exploration"
description = "Boundary exploration, edge case discovery, affordance drift detection"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1337
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Gray", "Team", "Boundary", "teams", "Prismatic Platform", "Gray Team", "FULL"]
tags = ["teams", "gray-team", "prismatic"]
quality_score = 80
see_also = ["agents", "capabilities", "architecture"]
image = "/images/sections/teams.png"
image_alt = "Gray Team - Prismatic Platform"
+++

## Overview

The Gray Team operates as the reconnaissance and boundary exploration arm of the Prismatic Platform's six-team color-team security architecture. Positioned at the frontier between defined and undefined system behavior, Gray Team systematically discovers specification gaps, edge cases, implicit assumptions, and affordance drift — surfacing ambiguity without resolving it. This raw intelligence feeds directly into [Red Team](@/teams/red.md) adversarial scenario development, [Blue Team](@/teams/blue.md) defensive gap awareness, and [Purple Team](@/teams/purple.md) synthesis operations.

The Gray Team's operational philosophy is fundamentally different from the other color teams. While Red attacks, Blue defends, and Purple synthesizes, Gray explores. All Gray operations enforce zero state changes — pure observation and documentation with no writes, no modifications, and no resource allocations. This read-only constraint ensures that exploration never inadvertently introduces the vulnerabilities it seeks to discover. The distinction between Gray's boundary exploration and [Black Team](@/teams/black.md)'s theoretical threat modeling is enforced by the gray-escalation-guard agent, which has override authority to halt any Gray operation that approaches weaponization territory.

The theoretical foundation of Gray Team operations draws from boundary value analysis in software testing, specification gap analysis in formal methods, and affordance theory from human-computer interaction research. By treating system boundaries as first-class objects of investigation rather than assumed constraints, Gray Team provides the platform with continuous visibility into the frontier of its own behavior — the zone where assumptions meet reality and where most vulnerabilities originate.

## Mission and Doctrine

The Gray Team mission is to systematically explore and document the boundaries of the platform's defined behavior, identifying areas where specifications are incomplete, assumptions are implicit, edge cases are unhandled, and usage patterns have drifted from design intent.

### Mission Principles

| Principle | Description | Enforcement |
|-----------|-------------|-------------|
| **Read-Only Exploration** | Zero state changes in all operations | Process-level enforcement |
| **Surface, Don't Resolve** | Document ambiguity without making resolution decisions | Output format constraints |
| **Comprehensive Coverage** | All specification boundaries systematically explored | Exploration campaign tracking |
| **Provenance Trail** | Every finding traces to specific boundary observation | Immutable logging |
| **Escalation Awareness** | Constant monitoring for drift toward Black Team territory | gray-escalation-guard |

The [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine governs Gray operations with particular emphasis: NO MERCY demands thoroughness in boundary exploration — no specification gap is left undocumented due to inconvenience or perceived low risk. NO DOUBTS requires that every finding is grounded in observable boundary behavior, not speculation about what might be problematic.

## Team Composition

The Gray Team comprises three agents with a unique safety-critical architecture: the escalation guard has override authority over the commander, reflecting the principle that safety constraints take precedence over operational objectives.

| Agent | Level | Role | Primary Function | Authority |
|-------|-------|------|------------------|-----------|
| **gray-explorer-commander** | L3 | Strategic Commander | Orchestrates exploration campaigns, routes findings | Operational command |
| **gray-edge-finder** | L4 | Boundary Specialist | Boundary value analysis, specification gap identification | Tactical execution |
| **gray-escalation-guard** | L4 | Safety-Critical | Prevents Gray-to-Black escalation, halt authority | Safety override |

### gray-explorer-commander

The Explorer Commander orchestrates systematic exploration campaigns across the platform's specification boundaries. The commander maintains an exploration map that tracks which boundaries have been investigated, what findings emerged, and which areas require deeper analysis. Campaign planning considers both the coverage requirements (ensuring all boundaries receive periodic attention) and the priority signals from Red and Blue teams about where vulnerabilities are most likely.

### gray-edge-finder

The Edge Finder conducts the tactical work of boundary analysis — examining input validation limits, state transition boundaries, error condition behavior, type coercion edge cases, and resource limit boundaries. This agent applies formal boundary value analysis techniques to identify the specific values, states, and conditions where system behavior transitions from defined to undefined.

### gray-escalation-guard

The Escalation Guard provides continuous safety monitoring over all Gray operations, with override authority to halt any operation immediately. This agent detects when exploration approaches Black Team territory — when boundary analysis begins to resemble threat modeling, when edge case discovery starts to produce attack vectors, or when specification gaps suggest exploitable vulnerabilities. The guard ensures that Gray findings remain descriptive (documenting what is) rather than prescriptive (suggesting how to exploit).

## Operational Methodology

Gray Team follows a structured exploration methodology that systematically covers the platform's specification boundaries while maintaining strict read-only constraints.

### Exploration Domains

| Domain | Focus | Techniques | Output Type |
|--------|-------|------------|-------------|
| **Specification Gaps** | Undefined behavior in docs/code | Doc-code comparison, interface analysis | Gap inventory |
| **Edge Cases** | Boundary conditions, type limits | Boundary value analysis, equivalence partitioning | Test candidates |
| **Affordance Drift** | Unintended use patterns | Usage pattern analysis, API call tracing | Risk assessment |
| **Implicit Assumptions** | Undocumented dependencies | Dependency graph analysis, config archaeology | Assumption log |
| **State Transitions** | Unstated state machine paths | State machine extraction, transition enumeration | Transition map |

### Boundary Value Analysis Framework

```elixir
defmodule PrismaticDark.GrayTeam.BoundaryAnalyzer do
  @moduledoc """
  Systematic boundary value analysis for specification gap discovery.
  All operations are read-only — no state modifications permitted.
  """

  @type boundary :: %{
    domain: atom(),
    parameter: String.t(),
    min_value: term(),
    max_value: term(),
    transition_points: [term()],
    undefined_zones: [Range.t()]
  }

  @spec analyze_module(module()) :: {:ok, [boundary()]}
  def analyze_module(target_module) do
    specs = Code.Typespec.fetch_specs(target_module)
    docs = Code.fetch_docs(target_module)

    boundaries =
      specs
      |> extract_parameter_boundaries()
      |> cross_reference_docs(docs)
      |> identify_specification_gaps()
      |> classify_edge_cases()

    :telemetry.execute(
      [:prismatic, :gray_team, :analysis, :complete],
      %{boundary_count: length(boundaries), module: target_module},
      %{domains: Enum.map(boundaries, & &1.domain) |> Enum.uniq()}
    )

    {:ok, boundaries}
  end

  defp extract_parameter_boundaries(specs) do
    Enum.flat_map(specs, fn {:ok, type_specs} ->
      Enum.flat_map(type_specs, &analyze_type_boundaries/1)
    end)
  end

  defp identify_specification_gaps(boundaries) do
    Enum.map(boundaries, fn boundary ->
      gaps = find_undefined_zones(boundary.min_value, boundary.max_value, boundary.transition_points)
      %{boundary | undefined_zones: gaps}
    end)
  end
end
```

### Specification Gap Discovery Process

```
1. Documentation Audit
   └── Compare stated behavior vs actual implementation
   └── Identify undocumented functions, parameters, return values

2. Interface Analysis
   └── Examine all public API contracts (@spec, @doc)
   └── Identify missing type specifications
   └── Catalog implicit parameter constraints

3. State Machine Mapping
   └── Extract state machines from GenServer implementations
   └── Identify unstated state transitions
   └── Document error/recovery paths

4. Error Condition Enumeration
   └── Catalog all possible failure modes
   └── Identify unhandled error conditions
   └── Document error propagation paths
```

## Technical Architecture

Gray Team operations are implemented with strict read-only enforcement at the process level, ensuring that exploration cannot inadvertently modify system state.

### System Architecture

```
Gray Explorer Commander (L3)
├── Campaign Planner
│   ├── Coverage Tracker (which boundaries explored)
│   ├── Priority Selector (Red/Blue signal integration)
│   └── Schedule Manager (rotation across domains)
├── Edge Finder (L4)
│   ├── Boundary Value Analyzer
│   ├── Specification Gap Scanner
│   ├── State Machine Extractor
│   └── Affordance Drift Monitor
├── Escalation Guard (L4, SAFETY-CRITICAL)
│   ├── Scope Monitor (continuous)
│   ├── Weaponization Detector
│   ├── State Change Detector
│   └── Override Controller (halt authority)
└── Output Pipeline
    ├── Finding Formatter
    ├── Provenance Logger
    └── Team Router (Red/Blue/Purple)
```

### Read-Only Enforcement

```elixir
defmodule PrismaticDark.GrayTeam.ReadOnlyEnforcer do
  @moduledoc """
  Enforces zero state changes for all Gray Team operations.
  Wraps all external calls in read-only transaction contexts.
  """

  @forbidden_operations [:insert, :update, :delete, :write, :put, :send]

  @spec enforce(fun()) :: {:ok, term()} | {:error, :write_attempted}
  def enforce(exploration_fn) do
    Process.put(:gray_team_read_only, true)

    try do
      result = exploration_fn.()
      {:ok, result}
    catch
      :throw, {:write_attempted, operation} ->
        :telemetry.execute(
          [:prismatic, :gray_team, :violation, :write_attempt],
          %{},
          %{operation: operation}
        )
        {:error, :write_attempted}
    after
      Process.delete(:gray_team_read_only)
    end
  end
end
```

### Telemetry Events

| Event | Measurements | Metadata |
|-------|-------------|----------|
| `[:prismatic, :gray_team, :analysis, :complete]` | boundary_count, module | domains |
| `[:prismatic, :gray_team, :campaign, :start]` | target_count | campaign_id, domains |
| `[:prismatic, :gray_team, :campaign, :complete]` | findings_count, duration | campaign_id |
| `[:prismatic, :gray_team, :escalation, :detected]` | severity | operation_type |
| `[:prismatic, :gray_team, :escalation, :halted]` | — | reason, operation_id |
| `[:prismatic, :gray_team, :violation, :write_attempt]` | — | operation |
| `[:prismatic, :gray_team, :finding, :routed]` | — | team, finding_type |

## Safety Protocols

### Escalation Guard

The gray-escalation-guard agent has override authority to halt any Gray operation that:

- **Approaches Black Team territory** — boundary analysis begins to resemble theoretical threat modeling or weaponization
- **Risks state modification** — any detected attempt to write, modify, or allocate resources
- **Exceeds exploration scope** — investigation extends beyond approved campaign parameters
- **Touches production data** — any access to non-synthetic, non-public data sources

### Escalation Detection Criteria

| Trigger | Threshold | Response |
|---------|-----------|----------|
| Weaponization language in findings | Any instance | Immediate halt, finding redacted |
| State modification attempt | Any instance | Immediate halt, session review |
| Scope boundary violation | Any instance | Operation pause, scope review |
| Production data access | Any instance | Immediate halt, security notification |
| Extended exploration without findings | > 30 minutes | Efficiency review |

### Audit Requirements

Every Gray operation produces:

1. **Timestamped activity log** — immutable record of all exploration steps
2. **Scope boundary certificate** — confirmation that exploration stayed within approved parameters
3. **Escalation decision trace** — log of all escalation guard evaluations
4. **Handoff documentation** — structured finding reports for downstream teams

## NABLA Compliance

Gray Team operations embody several NABLA axioms that are central to boundary exploration.

| Axiom | Gray Team Application | Compliance Level |
|-------|----------------------|-----------------|
| Signal Plurality | Multiple exploration techniques per boundary domain | FULL |
| Contradiction Preservation | Conflicting boundary behaviors preserved as findings | FULL |
| Absence Informative | Missing specifications documented as gaps | FULL — primary output |
| Time Decay | Exploration findings timestamped, boundaries re-explored periodically | FULL |
| Unknown Valid | Undefined behavior zones explicitly cataloged as knowledge gaps | FULL — core function |
| Source Independence | Cross-references docs, code, tests as independent sources | FULL |
| Provenance Mandatory | Every finding traces to specific code location/doc section | FULL |

## Performance Metrics

| Metric | Typical Value | Notes |
|--------|---------------|-------|
| Boundaries explored per campaign | 20-100 | Depends on domain scope |
| Specification gaps found per module | 2-8 | Average across codebase |
| Edge cases identified per boundary | 5-15 | Including null/empty/limit cases |
| Exploration campaign duration | 1-4 hours | Full domain sweep |
| Escalation guard trigger rate | < 2% | Of all exploration operations |
| Finding routing latency | < 1 minute | From discovery to team handoff |
| Coverage per quarter | 60-80% | Of platform boundary surface |
| False finding rate | < 5% | Findings confirmed as actual gaps |

## Integration Points

| Component | Direction | Content | Purpose |
|-----------|-----------|---------|---------|
| [Red Team](@/teams/red.md) | Gray → Red | Boundary findings, specification gaps | Adversarial scenario seeds |
| [Blue Team](@/teams/blue.md) | Gray → Blue | Defensive gaps, unhandled edges | Defensive coverage improvement |
| [Purple Team](@/teams/purple.md) | Gray → Purple | Boundary definitions, ambiguity reports | Synthesis and closure |
| [White Team](@/teams/white.md) | Gray → White | Edge cases, formal spec candidates | Formal verification targets |
| Platform Codebase | Gray ← Platform | Source code, docs, tests (read-only) | Exploration targets |

### Signal Flow

```
Platform Codebase (read-only)
         ↓
    Gray Team Exploration
         ↓
    ┌────┼────┬──────────┐
    ↓    ↓    ↓          ↓
   Red  Blue  Purple   White
   Team Team  Team     Team
```

## Outputs

| Artifact | Purpose | Consumers | Frequency |
|----------|---------|-----------|-----------|
| Gap Inventory | Specification holes and undefined zones | Purple, White, Architecture | Per campaign |
| Edge Case Catalog | Boundary conditions and transition points | Red, Test Generators | Per campaign |
| Drift Report | Affordance drift and usage pattern changes | Blue, Security | Continuous |
| Assumption Log | Implicit dependencies and undocumented constraints | Architecture, All Teams | Per campaign |
| Exploration Map | Coverage tracking across boundary domains | Gray (internal), Purple | Continuous |
| Escalation Log | Guard decisions and scope evaluations | Security, Audit | Continuous |

## Related Resources

- [Red Team](@/teams/red.md) — Consumes Gray findings for adversarial scenario development
- [Blue Team](@/teams/blue.md) — Uses Gray findings for defensive gap awareness
- [Purple Team](@/teams/purple.md) — Synthesizes Gray findings with Red/Blue outputs
- [White Team](@/teams/white.md) — Formally verifies edge cases identified by Gray
- [Black Team](@/teams/black.md) — Separated from Gray by escalation guard (no direct integration)
- [Quality Gates](@/capabilities/quality-gates.md) — Quality enforcement informed by specification coverage
- [Telemetry Integration](@/capabilities/telemetry-integration.md) — Observability infrastructure explored by Gray

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)