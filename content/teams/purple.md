+++
title = "Purple Team"
weight = 4
[extra]
color = "purple"
agent_count = 4
commander = "purple-coordinator"
role = "Synthesis & Closure"
description = "Synthesis & closure, Red-Blue loop coordination"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1376
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Purple", "Team", "Synthesis", "Red-Blue", "teams", "Prismatic Platform", "Blue", "Purple Team"]
tags = ["teams", "purple-team", "prismatic"]
quality_score = 80
see_also = ["agents", "capabilities", "architecture"]
image = "/images/sections/teams.png"
image_alt = "Purple Team - Prismatic Platform"
+++

## Overview

The Purple Team serves as the central synthesis hub of the Prismatic Platform's six-team color-team security architecture. As the sole authority for closure state transitions, Purple Team receives adversarial findings from [Red Team](/teams/red/), defensive assessments from [Blue Team](/teams/blue/), boundary discoveries from [Gray Team](/teams/gray/), formal verifications from [White Team](/teams/white/), and theoretical threat models from [Black Team](/teams/black/) — synthesizing these into actionable improvements and verified closure decisions. Purple Team is where the platform stops lying to itself.

> "Purple is the property of the system when it stops lying to itself."

The theoretical foundation of Purple Team operations draws from feedback loop theory, closure verification in formal methods, and the adversarial-defensive synthesis model pioneered in military red team/blue team doctrine. The Prismatic Platform extends these foundations with a rigorous four-condition closure framework, anti-metric enforcement that prevents gaming of security metrics, and regression trap management that ensures resolved vulnerabilities never resurface. Purple's authority is unique: it has deployment veto power and can block any release that contains unresolved critical findings or active regressions.

Within the color-team architecture, Purple occupies the convergence point — every team's output flows through Purple for synthesis, and Purple's closure decisions determine the platform's security posture. This centralized synthesis model ensures that adversarial findings are matched with defensive responses, that defensive claims are verified against adversarial evidence, and that no finding falls through the cracks between Red attack and Blue defense.

## Mission and Doctrine

The Purple Team mission is to close the adversarial-defensive feedback loop by synthesizing Red findings with Blue defenses into verified, documented improvements. Purple ensures that every identified vulnerability has a corresponding defense, that every defense is verified against the original attack, and that no regression reintroduces previously resolved vulnerabilities.

### Mission Principles

| Principle | Description | Enforcement |
|-----------|-------------|-------------|
| **Closure Authority** | Purple is the sole authority for closing findings | No other team can close |
| **Four-Condition Requirement** | All four closure conditions must be met | HARD — no partial closure |
| **Anti-Metric Gaming** | Actively detects and resists security metric inflation | Anti-pattern detection |
| **Regression Prevention** | Maintains trap catalog of all resolved vulnerabilities | Automated regression checks |
| **Deployment Veto** | Can block any deployment for security reasons | Binding authority |

The [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine governs Purple operations with dual emphasis: NO MERCY demands that closure is never premature — findings remain open until all four conditions are verified, regardless of timeline pressure. NO DOUBTS demands that every closure decision is evidence-based and documented, with complete provenance from initial finding through defense implementation and verification.

## Team Composition

The Purple Team comprises four agents organized around the synthesis lifecycle: coordination, mapping, closure analysis, and regression prevention.

| Agent | Level | Role | Primary Function | Authority |
|-------|-------|------|------------------|-----------|
| **purple-coordinator** | L3 | Strategic Commander | Synthesis hub, closure authority, anti-metric enforcement | Closure decisions, deployment veto |
| **purple-mapper** | L4 | Operational Specialist | Bidirectional Red finding to Blue defense mapping | Finding-defense linkage |
| **purple-closure-analyst** | L4 | Operational Specialist | Four-condition closure evaluation, false closure detection | Closure recommendation |
| **purple-regression-guard** | L4 | Safety-Critical | Regression trap management, deployment gate enforcement | Deployment gate |

### purple-coordinator

The Purple Coordinator serves as the synthesis hub, receiving inputs from all other color teams and orchestrating the closure process. The coordinator maintains the master finding registry, tracks closure state transitions, enforces anti-metric policies, and exercises deployment veto authority when necessary. The coordinator's synthesis role requires understanding both Red's adversarial perspective and Blue's defensive constraints, enabling balanced closure decisions.

### purple-mapper

The Mapper maintains bidirectional linkage between Red findings and Blue defenses. For every Red attack vector, the mapper identifies the corresponding Blue countermeasure; for every Blue defense, the mapper identifies which Red attacks it addresses. This mapping reveals gaps — Red findings without Blue defenses, and Blue defenses without Red validation — which drive prioritization of subsequent Red and Blue activities.

### purple-closure-analyst

The Closure Analyst evaluates findings against the four-condition closure framework, producing structured closure recommendations for the coordinator's decision. The analyst also detects false closure patterns — situations where findings appear closed but one or more conditions are not genuinely satisfied, such as paper defenses that pass tests but don't actually protect, or test suites that verify the wrong properties.

### purple-regression-guard

The Regression Guard maintains a comprehensive catalog of all previously resolved vulnerabilities and their fixes, checking every code change against this catalog for potential regressions. The guard enforces deployment gates, blocking releases that introduce changes to code paths associated with previous vulnerabilities without corresponding verification.

## The Closure Framework

### Four Conditions for Closure

A finding is CLOSED only when ALL four conditions are independently verified:

| # | Condition | Description | Verification Method |
|---|-----------|-------------|-------------------|
| 1 | **Defense Implemented** | Blue has deployed a countermeasure | Code review + automated tests |
| 2 | **Attack Blocked** | Red confirms the attack no longer succeeds | Re-simulation in sandbox |
| 3 | **No Regression** | Fix doesn't break existing defenses | Full regression test suite |
| 4 | **Documented** | Knowledge captured for future reference | Documentation review |

### Closure State Machine

```
OPEN → INVESTIGATING → MITIGATING → VERIFYING → CLOSED
  ↑         ↓              ↓            ↓
  │    ESCALATED      BLOCKED      REGRESSED
  │         ↓              ↓            ↓
  └─────────┴──────────────┴────────────┘
            (return to OPEN)
```

### Closure Implementation

```elixir
defmodule PrismaticDark.PurpleTeam.ClosureAnalyzer do
  @moduledoc """
  Four-condition closure evaluation for Purple Team findings.
  A finding is closed only when all four conditions are independently verified.
  """

  @type finding :: %{
    id: String.t(),
    state: :open | :investigating | :mitigating | :verifying | :closed,
    conditions: %{
      defense_implemented: boolean(),
      attack_blocked: boolean(),
      no_regression: boolean(),
      documented: boolean()
    },
    history: [state_transition()]
  }

  @spec evaluate_closure(finding()) :: {:ready, finding()} | {:not_ready, [atom()]}
  def evaluate_closure(%{conditions: conditions} = finding) do
    missing =
      conditions
      |> Enum.filter(fn {_condition, met} -> not met end)
      |> Enum.map(fn {condition, _} -> condition end)

    case missing do
      [] ->
        closed = %{finding | state: :closed}
        :telemetry.execute(
          [:prismatic, :purple_team, :closure, :complete],
          %{duration: closure_duration(finding)},
          %{finding_id: finding.id}
        )
        {:ready, closed}

      unmet ->
        {:not_ready, unmet}
    end
  end

  @spec detect_false_closure(finding()) :: {:genuine, finding()} | {:false_closure, map()}
  def detect_false_closure(finding) do
    checks = [
      {:paper_defense, check_paper_defense(finding)},
      {:test_mismatch, check_test_mismatch(finding)},
      {:regression_blind, check_regression_blind_spot(finding)},
      {:doc_stale, check_documentation_staleness(finding)}
    ]

    false_patterns = Enum.filter(checks, fn {_type, result} -> result != :ok end)

    case false_patterns do
      [] -> {:genuine, finding}
      patterns -> {:false_closure, %{finding: finding, violations: patterns}}
    end
  end
end
```

## Red-Blue Synthesis

### Bidirectional Mapping

The core synthesis activity maps every Red finding to its Blue defense counterpart and vice versa, revealing coverage gaps and verification needs.

```
Red Finding                    Blue Defense
────────────                   ────────────
Attack Vector  ←── maps to ──► Countermeasure
Success Rate   ←── maps to ──► Defense Efficacy
Impact Level   ←── maps to ──► Priority Level
Attack Chain   ←── maps to ──► Defense Chain
Coverage Gap   ←── maps to ──► Undefended Surface
```

### Anti-Metric Enforcement

Purple actively detects and resists patterns that inflate security metrics without improving actual security posture. This anti-metric enforcement is a core Purple responsibility.

| Anti-Pattern | Detection Method | Response |
|--------------|-----------------|----------|
| **Premature closure** | Incomplete conditions check | Re-open finding |
| **Paper defenses** | Attack re-simulation reveals defense ineffective | Reject defense, return to Blue |
| **Regression hiding** | Test manipulation or coverage gaps | Escalate to deployment gate |
| **False confidence** | Uncalibrated certainty claims | Recalibrate and re-evaluate |
| **Metric gaming** | Closure rate manipulation | Audit + process review |
| **Cherry-picking** | Low-risk findings closed while high-risk remain | Priority rebalancing |

## Technical Architecture

### System Architecture

```
Purple Coordinator (L3)
├── Synthesis Engine
│   ├── Finding Registry (master state)
│   ├── State Machine Manager
│   └── Anti-Metric Monitor
├── Mapper Pipeline
│   ├── Red-to-Blue Mapper
│   ├── Blue-to-Red Mapper
│   ├── Gap Detector
│   └── Coverage Calculator
├── Closure Pipeline
│   ├── Condition Evaluator
│   ├── False Closure Detector
│   ├── Closure Recommender
│   └── State Transition Manager
├── Regression Guard
│   ├── Trap Catalog Manager
│   ├── Code Change Analyzer
│   ├── Regression Detector
│   └── Deployment Gate Controller
└── Output Pipeline
    ├── Closure Decision Emitter
    ├── Synthesis Report Generator
    └── Deployment Gate Status
```

### Regression Guard Implementation

```elixir
defmodule PrismaticDark.PurpleTeam.RegressionGuard do
  @moduledoc """
  Regression trap management and deployment gate enforcement.
  Maintains catalog of resolved vulnerabilities, checks changes for regressions.
  """
  use GenServer

  @spec regression_check(map()) :: {:ok, :clear} | {:error, :regression, map()}
  def regression_check(%{change_set: files} = params) do
    trap_catalog = load_trap_catalog(params[:trap_catalog] || :current)

    regressions =
      files
      |> Enum.flat_map(&check_file_against_traps(&1, trap_catalog))
      |> Enum.reject(&is_nil/1)

    case regressions do
      [] ->
        {:ok, :clear}

      found ->
        :telemetry.execute(
          [:prismatic, :purple_team, :regression, :detected],
          %{regression_count: length(found)},
          %{files: files}
        )
        {:error, :regression, %{regressions: found, change_set: files}}
    end
  end

  @spec deployment_gate(String.t()) :: :pass | {:block, String.t()}
  def deployment_gate(release_id) do
    open_findings = count_open_findings(:critical)
    active_regressions = count_active_regressions()
    incomplete_closures = count_incomplete_closures([:p0, :p1])

    cond do
      open_findings > 0 -> {:block, "#{open_findings} critical finding(s) open"}
      active_regressions > 0 -> {:block, "#{active_regressions} active regression(s)"}
      incomplete_closures > 0 -> {:block, "#{incomplete_closures} incomplete P0/P1 closure(s)"}
      true -> :pass
    end
  end
end
```

### Telemetry Events

| Event | Measurements | Metadata |
|-------|-------------|----------|
| `[:prismatic, :purple_team, :closure, :complete]` | duration | finding_id |
| `[:prismatic, :purple_team, :closure, :rejected]` | missing_conditions | finding_id, reason |
| `[:prismatic, :purple_team, :false_closure, :detected]` | violation_count | finding_id, patterns |
| `[:prismatic, :purple_team, :regression, :detected]` | regression_count | files |
| `[:prismatic, :purple_team, :deployment, :blocked]` | — | release_id, reason |
| `[:prismatic, :purple_team, :deployment, :passed]` | — | release_id |
| `[:prismatic, :purple_team, :synthesis, :complete]` | finding_count, closure_count | cycle_id |

## NABLA Compliance

Purple Team operations enforce NABLA axioms at the synthesis level, where multiple team outputs converge and must be reconciled.

| Axiom | Purple Team Application | Enforcement Level |
|-------|----------------------|-----------------|
| Signal Plurality | Closure requires evidence from both Red and Blue | HARD — bilateral verification |
| Contradiction Preservation | Red-Blue disagreements preserved until resolved | HARD — no premature resolution |
| Absence Informative | Missing Blue defense for Red finding is actionable gap | HARD — gap tracking |
| Time Decay | Open findings accrue urgency over time | HARD — aging escalation |
| Unknown Valid | Incomplete closure acknowledged, not forced | HARD — honest state |
| Source Independence | Red and Blue evidence weighted independently | HARD — no cross-contamination |
| Provenance Mandatory | Complete closure chain from finding to resolution | HARD — immutable history |

## Performance Metrics

| Metric | Typical Value | Notes |
|--------|---------------|-------|
| Mean time to closure | 2-14 days | From Red finding to Purple closure |
| Closure rate per cycle | 60-80% | Of findings entering verification |
| False closure detection rate | 8-15% | Of proposed closures rejected |
| Regression detection rate | > 99% | Against known trap catalog |
| Deployment gate latency | < 5 seconds | Per gate check |
| Synthesis cycle time | 4-8 hours | Full Red-Blue-Purple cycle |
| Anti-metric violation rate | 3-8% | Of proposed closures flagged |
| Open finding aging (median) | 5 days | Before escalation trigger |

## Deployment Gate

Purple Team has **binding veto authority** over all deployments. The deployment gate checks are mandatory and non-bypassable.

| Gate Check | Condition | Authority | Response |
|------------|-----------|-----------|----------|
| Open critical findings | Any critical severity open | BLOCK | Deployment rejected |
| Active regressions | Any regression detected | BLOCK | Deployment rejected |
| Incomplete P0-P1 closure | High-priority items not closed | BLOCK | Deployment rejected |
| Unverified new defenses | New code paths without verification | WARN | Manual review required |

## Integration Points

| Component | Direction | Content | Purpose |
|-----------|-----------|---------|---------|
| [Red Team](/teams/red/) | Red → Purple | Attack findings, vulnerability reports | Input for synthesis |
| [Blue Team](/teams/blue/) | Blue → Purple | Defensive posture, defense implementations | Input for synthesis |
| [Gray Team](/teams/gray/) | Gray → Purple | Boundary findings, specification gaps | Context for closure |
| [White Team](/teams/white/) | White → Purple | Formal verification results | Closure evidence |
| [Black Team](/teams/black/) | Black → Purple (filtered) | Abstract threat models | Strategic context |
| Deployment Pipeline | Purple → Deploy | Gate decisions | Release authority |
| [Quality Gates](/capabilities/quality-gates/) | Purple → Quality | Security posture | Quality integration |

### Signal Flow

```
         Red Findings ──────┐
                            ↓
Blue Posture ──────→  Purple Synthesis  ←──── White Verification
                            ↓
Gray Boundaries ───→  │ Closure │  ←──── Black Models (filtered)
                      │ Engine  │
                            ↓
                   ┌────────┼────────┐
                   ↓        ↓        ↓
              Deployment  Quality   Platform
                Gate      Gates    Improvements
```

## Outputs

| Artifact | Purpose | Authority | Frequency |
|----------|---------|-----------|-----------|
| Closure Decision | Finding resolution with evidence chain | Binding | Per finding |
| Synthesis Report | Red-Blue mapping with gap analysis | Reference | Per cycle |
| Regression Catalog | Trap management database | Critical | Continuous |
| Deployment Gate | Release authority decision | Blocking | Per deployment |
| Anti-Metric Report | Gaming pattern detection | Reference | Per cycle |
| Coverage Map | Red-Blue defense coverage visualization | Reference | Per cycle |

## Related Resources

- [Red Team](/teams/red/) — Adversarial findings that drive the synthesis process
- [Blue Team](/teams/blue/) — Defensive implementations that Purple verifies
- [Gray Team](/teams/gray/) — Boundary findings providing synthesis context
- [White Team](/teams/white/) — Formal verification evidence for closure decisions
- [Black Team](/teams/black/) — Theoretical threat models informing strategic synthesis
- [Quality Gates](/capabilities/quality-gates/) — Quality enforcement incorporating Purple security posture
- [Regression Testing](/capabilities/regression-tests/) — Testing infrastructure supporting regression detection

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)