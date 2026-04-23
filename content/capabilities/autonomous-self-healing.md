+++
title = "Autonomous Self-Healing"
weight = 8
[extra]
icon = "heart"
color = "emerald"
description = "Platform capability for automatic detection, diagnosis, and resolution of quality degradation and system issues through five escalation levels without human intervention"
category = "resilience"
status = "active"
reading_time = "14 min"
author = "Tomas Korcak (korczis)"
word_count = 1191
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Autonomous", "Self-Healing", "Platform", "capabilities", "resilience", "Prismatic Platform", "Quality DNA", "Cross"]
tags = ["capabilities", "resilience", "autonomous-self-healing", "prismatic"]
quality_score = 80
see_also = ["glossary", "agents", "architecture"]
image = "/images/sections/capabilities.png"
image_alt = "Autonomous Self-Healing - Prismatic Platform"
+++

## Overview

Autonomous Self-Healing enables the Prismatic Platform to detect, diagnose, and resolve quality degradation and system issues without human intervention. The system maintains a quality floor of 100/100 through continuous monitoring and automated correction. This capability spans five escalation levels, from instant pattern fixes to architectural improvements, creating a platform that actively resists entropy and quality decay.

The self-healing infrastructure builds on OTP's foundational "let it crash" philosophy but extends it far beyond process restart. Where OTP supervisors restart failed processes, the Prismatic self-healing system detects quality degradation patterns, diagnoses root causes, generates corrective patches, applies them with full test verification, and reports outcomes -- all without human intervention. This is the difference between recovering from failure and preventing degradation.

Self-healing is not an optional enhancement. In a platform with 99 umbrella applications, 6,652 Elixir source files, and 400+ autonomous agents, manual quality maintenance is infeasible. The volume of code, the frequency of changes, and the interconnected nature of the component ecosystem demand automated quality preservation. Every session, every commit, every deployment triggers self-healing processes that verify, correct, and evolve the platform's quality posture.

## Core Architecture

The self-healing architecture consists of four interconnected subsystems: detection, diagnosis, remediation, and knowledge persistence. Each subsystem is implemented as an OTP application with its own supervision tree, ensuring that the healing infrastructure itself is fault-tolerant.

```elixir
defmodule PrismaticSafety.SelfHealing.Supervisor do
  @moduledoc """
  Root supervisor for the self-healing subsystem.
  Manages detection, diagnosis, remediation, and knowledge workers.
  """
  use Supervisor

  def start_link(opts) do
    Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    children = [
      {PrismaticSafety.QualityFloorGuardian, []},
      {PrismaticSafety.AutoHeal.Detector, []},
      {PrismaticSafety.AutoHeal.Diagnostician, []},
      {PrismaticSafety.AutoHeal.Remediator, []},
      {PrismaticSafety.QualityDNA.Persistence, []},
      {DynamicSupervisor, name: PrismaticSafety.HealingWorkers, strategy: :one_for_one}
    ]

    Supervisor.init(children, strategy: :rest_for_one)
  end
end
```

The `:rest_for_one` strategy ensures that if the detector crashes, the diagnostician and remediator (which depend on detection output) are also restarted, maintaining a consistent healing pipeline state.

## Healing Levels

The five-level hierarchy ensures proportionate response to issues of varying scope and complexity. Each level has defined authority, response time expectations, and verification requirements.

| Level | Scope | Response Time | Trigger | Authority | Example |
|-------|-------|---------------|---------|-----------|---------|
| **L1 - Pattern Fix** | Individual code patterns | Immediate (< 1s) | Known anti-pattern detected | Automatic | `length(list) > 0` replaced with `list != []` |
| **L2 - Module Heal** | Module-level issues | Minutes | Module quality gate failure | Automatic | Missing typespec, Credo violation |
| **L3 - App Recovery** | Application-level problems | Minutes to hours | App compilation failure, test regression | Semi-automatic | Dependency conflict, breaking API change |
| **L4 - System Heal** | Cross-app systemic issues | Hours | Platform-wide quality score drop | Coordinated | Shared dependency upgrade cascade |
| **L5 - Architecture** | Architectural improvements | Planned cycles | Structural optimization opportunity | Review required | Module extraction, supervision tree redesign |

### Level Escalation Protocol

Escalation follows a strict protocol: if L1 cannot resolve an issue within its scope, it escalates to L2. If L2 fails, L3 takes over. At each level, the full diagnostic context is preserved and passed to the next level, ensuring no information is lost during escalation.

```
L1 (Pattern) --> L2 (Module) --> L3 (App) --> L4 (System) --> L5 (Architecture)
     |                |              |             |                |
  Auto-fix        Auto-fix       Diagnose      Coordinate      Plan + Review
  + Verify        + Test         + Plan         + Execute       + Approve
  (instant)       (minutes)      (hours)        (hours)         (planned)
```

The escalation model also supports de-escalation. When an L3 investigation reveals that the root cause is actually a simple pattern issue, the fix is delegated back to L1 for immediate application. This bidirectional flow ensures that fixes are applied at the most efficient level.

## Quality Floor Guardian

The Quality Floor Guardian is the central monitoring process that continuously evaluates platform quality and triggers healing when scores deviate from the floor.

| Score Range | Status | Guardian Response | Healing Level |
|-------------|--------|-------------------|---------------|
| **100%** | OPTIMAL | Monitor only | None |
| **99%** | WARNING | Alert + investigation | L1-L2 auto-fix |
| **98%** | CAUTION | Active healing triggered | L2-L3 diagnosis |
| **95-97%** | CRITICAL | Auto-evolution cycle | L3-L4 coordinated healing |
| **< 95%** | EMERGENCY | Block commits + escalate | L4-L5 full intervention |

```elixir
defmodule PrismaticSafety.QualityFloorGuardian do
  @moduledoc """
  Continuous quality monitoring with automated healing triggers.
  Maintains platform quality floor at 100/100 through proactive
  detection and proportionate response.
  """
  use GenServer

  @check_interval :timer.seconds(30)
  @quality_floor 100

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    schedule_check()
    {:ok, %{status: :optimal, last_score: @quality_floor, healing_active: false}}
  end

  @impl true
  def handle_info(:check_quality, state) do
    score = PrismaticSafety.QualityScorer.current_score()
    :telemetry.execute(
      [:prismatic_safety, :quality_floor, :check],
      %{score: score},
      %{previous: state.last_score}
    )

    new_state =
      case score do
        @quality_floor ->
          %{state | status: :optimal, healing_active: false}

        99 ->
          trigger_investigation(state, score)

        s when s >= 95 ->
          trigger_autoheal(state, score)

        _ ->
          trigger_emergency(state, score)
      end

    schedule_check()
    {:noreply, %{new_state | last_score: score}}
  end

  defp trigger_investigation(state, score) do
    PrismaticSafety.AutoHeal.Detector.investigate(score)
    %{state | status: :warning, healing_active: true}
  end

  defp trigger_autoheal(state, score) do
    PrismaticSafety.AutoHeal.cycle(%{trigger: :quality_drop, score: score})
    %{state | status: :critical, healing_active: true}
  end

  defp trigger_emergency(state, score) do
    PrismaticSafety.AutoHeal.emergency(%{score: score, block_commits: true})
    %{state | status: :emergency, healing_active: true}
  end

  defp schedule_check, do: Process.send_after(self(), :check_quality, @check_interval)
end
```

## OTP Supervision Integration

Self-healing deeply integrates with OTP supervision trees for process-level fault tolerance. The platform's supervision tree spans all 99 umbrella applications with domain-specific supervisors coordinating cross-app recovery.

| Supervision Strategy | Platform Application | Recovery Pattern |
|---------------------|---------------------|-----------------|
| **`:one_for_one`** | Independent agent workers | Restart failed agent only |
| **`:one_for_all`** | Coordinated agent teams | Restart entire team on failure |
| **`:rest_for_one`** | Pipeline stage workers | Restart failed stage and downstream |
| **DynamicSupervisor** | On-demand investigation workers | Spawn/terminate as needed |

```
PrismaticSupervisor (root)
  +-- StorageDomain.Supervisor
  |     +-- ETS.Supervisor
  |     +-- Ecto.Supervisor
  |     +-- Redis.Supervisor
  +-- IntelligenceDomain.Supervisor
  |     +-- OSINT.Supervisor
  |     +-- Analysis.Supervisor
  +-- SecurityDomain.Supervisor
  |     +-- Perimeter.Supervisor
  |     +-- ColorTeam.Supervisor
  +-- QualityDomain.Supervisor
        +-- QualityFloorGuardian
        +-- AutoHeal.Supervisor
        +-- AutoEvolve.Supervisor
```

## AutoHeal Cycle

The AutoHeal cycle is the primary automated healing mechanism, executing a full diagnostic-and-repair loop through seven phases.

```
Monitor --> Detect --> Diagnose --> Plan --> Execute --> Verify --> Report
   |           |          |          |         |          |          |
 Quality    Issue      Root       Fix      Apply     Tests       Quality
 Metrics   Found     Cause     Strategy   Patch     Pass         DNA
```

Each phase is instrumented with telemetry events and produces structured output that feeds the Quality DNA for cross-session continuity.

| Phase | Output | Persistence | Telemetry Event |
|-------|--------|-------------|-----------------|
| **Monitor** | Quality score snapshot | Session log | `[:autoheal, :monitor, :score]` |
| **Detect** | Issue description, affected files, severity | Session log | `[:autoheal, :detect, :issue]` |
| **Diagnose** | Root cause analysis, dependency chain | Quality DNA | `[:autoheal, :diagnose, :cause]` |
| **Plan** | Fix strategy, affected modules, test requirements | Quality DNA | `[:autoheal, :plan, :strategy]` |
| **Execute** | Applied patches, modified files | Git commit | `[:autoheal, :execute, :patch]` |
| **Verify** | Test results, quality score delta | Quality DNA + report | `[:autoheal, :verify, :result]` |
| **Report** | Summary with before/after metrics | Session context | `[:autoheal, :report, :complete]` |

## CASCADE Pattern Elimination

The CASCADE system automates fixing of known anti-patterns with pre-verified transformations. Each CASCADE pattern has been validated across hundreds of instances to ensure zero false positives.

| CASCADE Pattern | Detection | Fix | Verification | Instances Fixed |
|-----------------|-----------|-----|-------------|-----------------|
| **Type Mismatch** | Dialyzer warning analysis | Type annotation correction | Dialyzer re-check | 200+ |
| **Dead Code** | Unreachable code detection | Safe removal with dependency check | Compilation + tests | 150+ |
| **Empty Check** | `length(list) > 0` pattern | Replace with `list != []` | Semantic equivalence test | 180+ |
| **Timer Replacement** | `Process.sleep` detection | Replace with `:timer`-based patterns | Timing behavior test | 75+ |
| **Nuclear Cache** | Stale build artifact detection | `rm -rf _build/dev/lib/*/ebin` | Full recompilation | 300+ |

```elixir
defmodule PrismaticSafety.Cascade.EmptyCheck do
  @moduledoc """
  CASCADE pattern: Replace length(list) > 0 with list != []
  Performance improvement: O(n) -> O(1) comparison.
  """

  @pattern ~r/length\((\w+)\)\s*>\s*0/

  @spec detect(String.t()) :: [{non_neg_integer(), String.t()}]
  def detect(source_code) do
    source_code
    |> String.split("\n")
    |> Enum.with_index(1)
    |> Enum.filter(fn {line, _idx} -> Regex.match?(@pattern, line) end)
    |> Enum.map(fn {line, idx} -> {idx, line} end)
  end

  @spec fix(String.t()) :: String.t()
  def fix(source_code) do
    Regex.replace(@pattern, source_code, "\\1 != []")
  end
end
```

## SEADF Integration

The Self-Evolving Autonomous Development Framework (SEADF) provides the higher-order evolution capability that complements AutoHeal.

| SEADF Subsystem | Self-Healing Role | Interaction |
|-----------------|-------------------|-------------|
| **Scanner** | Discovers quality issues and improvement opportunities | Feeds AutoHeal detection |
| **Pipeline** | Orchestrates multi-stage healing workflows | Coordinates L3+ healing |
| **Quality Guardian** | Maintains quality floor enforcement | Triggers healing cycles |
| **Knowledge Sync** | Preserves healing patterns across sessions | Quality DNA persistence |
| **Cross-Domain Innovator** | Applies patterns from one domain to others | L5 architectural patterns |
| **Autonomous Reporter** | Generates healing reports and metrics | Compliance documentation |
| **Enhanced Healing** | 5-level healing execution engine | Core healing implementation |

## Pre-Commit Quality Protection

The `.githooks/pre-commit` hook implements predictive quality protection, running checks before code enters the repository. This is the first line of defense that prevents quality degradation from reaching the codebase.

```bash
# Pre-commit quality protection phases
Phase 1: Syntax validation
Phase 2: Compilation (--warnings-as-errors)
Phase 3: Credo strict analysis
Phase 4: Dialyzer type checking
Phase 5: Affected test execution
Phase 6: Quality score verification
Phase 7: CASCADE pattern scan
Phase 8: Template validation
Phase 9: Security scan
Phase 10: Design consistency
```

Each phase has a defined timeout, failure policy, and escalation path. A failure at any phase blocks the commit and provides actionable diagnostic output describing the violation and suggested fix.

## Quality DNA Cross-Session Continuity

Quality DNA enables self-healing to persist knowledge across sessions, preventing the same issues from recurring. The DNA is stored as structured JSON in `.claude/quality-dna/current-state.json` and is loaded at the start of every session.

| DNA Component | Content | Purpose |
|---------------|---------|---------|
| **Current State** | Quality scores per domain, known patterns | Baseline for detection |
| **Fix History** | Applied fixes with outcomes | Pattern library for future healing |
| **Risk Patterns** | Known anti-patterns with detection rules | Proactive prevention |
| **Evolution Log** | Architectural improvements applied | L5 decision history |
| **Session Context** | Latest session's healing actions | Cross-session continuity |

## Performance and Metrics

| Metric | Current Value | Target |
|--------|--------------|--------|
| **Quality Score** | 100/100 | Maintain 100/100 |
| **QDP (Quality Debt Points)** | 0 | Maintain 0 |
| **Mean Time to Detect** | < 10s | < 5s |
| **Mean Time to Heal (L1)** | < 1s | < 500ms |
| **Mean Time to Heal (L2)** | < 5 min | < 2 min |
| **CASCADE Patterns Fixed** | 905+ | Ongoing |
| **False Positive Rate** | < 1% | < 0.5% |
| **Quality Domains at 100%** | 13/13 | 13/13 |
| **Compilation Warnings** | 0 | 0 |

## Configuration

Self-healing behavior is configurable through the platform's configuration system, allowing teams to adjust thresholds, intervals, and automation levels.

```elixir
# config/config.exs
config :prismatic_safety, PrismaticSafety.QualityFloorGuardian,
  check_interval: :timer.seconds(30),
  quality_floor: 100,
  emergency_threshold: 95,
  auto_heal_enabled: true,
  cascade_enabled: true,
  max_concurrent_heals: 5

config :prismatic_safety, PrismaticSafety.AutoHeal,
  l1_auto_apply: true,
  l2_auto_apply: true,
  l3_requires_review: false,
  l4_requires_review: true,
  l5_requires_approval: true,
  heal_timeout: :timer.minutes(10)
```

## Integration

- Works with [Quality Gates](/capabilities/quality-gates/) for multi-stage validation at every healing level
- Enforces [NO MERCY](/capabilities/no-mercy/) doctrine through zero-tolerance quality floor
- Reports through [NABLA Axioms](/capabilities/nabla-axioms/) epistemic framework for evidence-based healing
- Monitored by [Real-Time Monitoring](/capabilities/real-time-monitoring/) for healing operation tracking
- Tracked by [Telemetry Integration](/capabilities/telemetry-integration/) for healing performance metrics
- Supports [AIAD Compliance](/capabilities/aiad-compliance/) through automated compliance recovery
- [Color Teams](/capabilities/color-teams/) Blue Team monitors for drift that triggers healing cycles
- Validated through [Trinity Gate](/capabilities/trinity-gate/) for healing correctness verification
- [AIAD Standard](/capabilities/aiad-standard/) specifications define healing agent contracts
- [Intelligence Synthesis](/capabilities/intelligence-synthesis/) benefits from quality-assured data pipelines

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)