+++
title = "AutoHeal"
weight = 59
[extra]
category = "evolution"
description = "Automatic platform self-repair mechanism for quality regression recovery"
related_terms = ["autoevolve", "cascade", "cascade-pattern", "clean-run", "qdp", "self-healing", "supervisor", "circuit-breaker", "fault-tolerance", "let-it-crash", "mix", "dialyzer"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1193
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["AutoHeal", "Automatic", "glossary", "evolution", "Prismatic Platform", "Level", "AutoEvolve", "Cross"]
tags = ["glossary", "evolution", "autoheal", "prismatic"]
quality_score = 77
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "AutoHeal - Prismatic Platform"
+++

## Definition

AutoHeal is the Prismatic Platform's autonomous self-repair mechanism that detects and resolves quality regressions, broken dependencies, configuration drift, and compilation failures without human intervention. It operates through a five-level intervention hierarchy -- from lightweight baseline establishment through targeted repair to full platform recovery -- applying progressively more aggressive corrective actions as the severity of the detected issue demands. AutoHeal embodies the platform's commitment to [self-healing](@/glossary/self-healing.md) capability: the principle that a system should not merely detect its own failures but actively repair them.

AutoHeal is conceptually distinct from [AutoEvolve](@/glossary/autoevolve.md), though the two systems work in close coordination. AutoHeal is reactive -- it responds to detected regressions and restores the platform to its known-good state. AutoEvolve is proactive -- it scans for optimization opportunities and advances the platform beyond its current state. Together they form the platform's autonomous quality maintenance system: AutoHeal prevents regression while AutoEvolve drives improvement.

The system runs at session boundaries (mandatory invocation at session start and end per the Universal Autonomous Evolution Protocol) and on-demand when quality monitoring detects anomalies. Each repair action is validated through quality gates before acceptance, ensuring that fixes do not introduce new problems. A [circuit breaker](@/glossary/circuit-breaker.md) pattern prevents cascading failures from repeated repair attempts, auto-opening after three consecutive failures and auto-resetting after 60 seconds.

## The Five Healing Levels

AutoHeal's intervention hierarchy ensures proportional response -- minor issues receive lightweight fixes, while critical failures trigger comprehensive recovery. Each level subsumes the actions of all lower levels.

### Level 1: Baseline Establishment

The foundation of AutoHeal's operation. Baseline establishment captures the platform's current quality state at the beginning of each session, creating a reference point against which regressions can be detected.

```bash
# Level 1: Baseline establishment (session start)
mix autoheal.baseline

# Actions performed:
# 1. Capture current compilation state (warnings, errors)
# 2. Record current quality score across all 13 domains
# 3. Snapshot Dialyzer PLT state
# 4. Record test suite pass/fail status
# 5. Store baseline in .claude/quality-dna/current-state.json
```

The baseline is stored in the [Quality DNA](@/glossary/quality-dna.md) persistence system, enabling cross-session comparison. If the baseline at session start is worse than the baseline at the previous session's end, AutoHeal immediately escalates to Level 2 for targeted investigation.

### Level 2: Targeted Repair

When a specific regression is detected -- a new compiler warning, a Dialyzer violation, a failing test -- Level 2 applies a targeted fix to the specific issue without disturbing the rest of the platform.

| Detection | Response |
|-----------|----------|
| New compiler warning | Identify source, apply [CASCADE](@/glossary/cascade.md) fix pattern |
| Dialyzer violation | Check for Nuclear Cache; if phantom, apply cache fix; if real, identify type mismatch |
| Failing test | Identify changed code, check for regression, restore if needed |
| Credo violation | Apply automated formatting/refactoring fix |

Targeted repairs are the most common AutoHeal action. Most quality regressions are localized to specific files or modules and can be resolved without broader intervention.

### Level 3: Pattern-Based Healing

When multiple related issues are detected, Level 3 recognizes them as instances of a known [CASCADE Pattern](@/glossary/cascade-pattern.md) and applies the pattern-level fix across all affected locations simultaneously.

```elixir
# Level 3: Pattern-based healing example
# Detection: Multiple length() > 0 checks introduced across 3 modules
# Recognition: Empty Check CASCADE pattern
# Action: Apply O(1) replacement across all instances

defmodule AutoHeal.PatternHealer do
  @doc "Apply CASCADE pattern fix across all affected locations"
  def heal_pattern(:empty_check, locations) do
    Enum.each(locations, fn {file, line} ->
      apply_empty_check_fix(file, line)
    end)
    validate_all_fixes(locations)
  end
end
```

Pattern-based healing is more efficient than individual targeted repairs because it addresses the root cause (a recurring anti-pattern) rather than individual symptoms.

### Level 4: Cross-Domain Repair

When issues span multiple umbrella applications or affect shared dependencies, Level 4 coordinates repairs across domain boundaries. This level handles situations where fixing an issue in one application requires corresponding changes in dependent applications.

Cross-domain repair is particularly important in the Prismatic Platform's umbrella architecture, where 89+ applications share common protocols, behaviors, and storage adapters. A type change in `prismatic_storage_core` may require spec updates across dozens of dependent applications.

### Level 5: Full Platform Recovery

The most aggressive intervention level, triggered when the platform's quality score drops below the EMERGENCY threshold (<95%) or when lower-level repairs have failed repeatedly. Full platform recovery performs:

1. Complete cache invalidation ([CASCADE](@/glossary/cascade.md) Nuclear Cache fix across all applications)
2. Full platform recompilation with `--force`
3. Complete Dialyzer PLT rebuild
4. Full test suite execution
5. Quality score recalculation across all 13 domains
6. Comparison against stored baseline
7. Escalation to human review if recovery fails

Level 5 is expensive in terms of time and computation, but it guarantees restoration to a known-good state. It is the equivalent of a clean restart for the platform's quality infrastructure.

## Circuit Breaker Protection

AutoHeal incorporates a [circuit breaker](@/glossary/circuit-breaker.md) pattern to prevent cascading failures from repeated repair attempts. Without this protection, a persistent failure could trigger an infinite loop of repair attempts, each consuming resources and potentially worsening the situation.

```elixir
# Circuit breaker behavior in AutoHeal
defmodule AutoHeal.CircuitBreaker do
  @failure_threshold 3      # Open after 3 consecutive failures
  @reset_timeout_ms 60_000  # Auto-reset after 60 seconds

  # States:
  # :closed    - Normal operation, repairs attempted
  # :open      - Repairs blocked, waiting for reset
  # :half_open - Testing single repair to see if issue resolved
end
```

| State | Behavior | Transition |
|-------|----------|------------|
| **Closed** | Normal operation; repairs attempted on detection | Opens after 3 consecutive failures |
| **Open** | Repairs blocked; failures logged but not acted on | Half-opens after 60 seconds |
| **Half-Open** | Single repair attempt allowed as probe | Closes on success; re-opens on failure |

The circuit breaker ensures that AutoHeal degrades gracefully when facing persistent issues that cannot be automatically resolved, rather than consuming unlimited resources in futile repair attempts.

## Session Lifecycle Integration

AutoHeal is integrated into the SessionLifecycle GenServer (905 lines in `prismatic_claude`), which manages hooks for all mandatory session operations:

```elixir
# Session lifecycle AutoHeal integration
defmodule PrismaticClaude.SessionLifecycle do
  # Session start: establish baseline
  def handle_cast(:session_start, state) do
    AutoHeal.establish_baseline()
    {:noreply, state}
  end

  # Session end: run healing cycle
  def handle_cast(:session_end, state) do
    AutoHeal.run_cycle()
    {:noreply, state}
  end
end
```

| Session Phase | AutoHeal Action | Command |
|---------------|----------------|---------|
| **Start** | Baseline establishment | `mix autoheal.baseline` |
| **During** | On-demand repair (triggered by quality monitoring) | `mix autoheal.repair` |
| **End** | Full healing cycle | `mix autoheal.cycle` |

The SessionLifecycle GenServer manages hook execution with priority ordering, circuit breaker protection, and telemetry emission. Hooks execute mix tasks in isolated processes with timeout protection, preventing a hung AutoHeal operation from blocking the session.

## SEADF Integration

AutoHeal operates as one of seven subsystems within the SEADF (Self-Evolving Autonomous Development Framework):

| SEADF Subsystem | Role | Relationship to AutoHeal |
|-----------------|------|--------------------------|
| **Scanner** | Opportunity detection | Identifies issues for AutoHeal to repair |
| **Pipeline** | Execution coordination | Orchestrates AutoHeal repair sequences |
| **Quality Guardian** | Continuous monitoring | Triggers AutoHeal on quality regression |
| **Knowledge Sync** | Cross-session persistence | Stores AutoHeal baselines and repair history |
| **Cross-Domain Innovator** | Novel solution discovery | Proposes new repair strategies |
| **Autonomous Reporter** | Status communication | Reports AutoHeal actions and outcomes |
| **Enhanced Healing** | AutoHeal itself | 5-level intervention hierarchy |

AutoHeal's repair history is persisted in [Quality DNA](@/glossary/quality-dna.md), enabling cross-session learning. If a specific repair action consistently resolves a specific type of regression, AutoHeal prioritizes that action for similar future regressions.

## Repair Validation

Every AutoHeal repair, regardless of level, must pass validation before being accepted:

1. **Compilation Check**: `mix compile --warnings-as-errors` passes with zero warnings
2. **Type Check**: `mix dialyzer` reports zero violations
3. **Style Check**: `mix credo --strict` reports zero violations
4. **Test Check**: Affected tests pass (Level 2) or full suite passes (Level 4-5)
5. **Quality Score**: Platform quality score is equal to or better than baseline

Repairs that fail validation are rolled back and escalated to the next healing level. If Level 5 recovery fails validation, the system escalates to human review with a detailed diagnostic report.

## Telemetry and Observability

AutoHeal emits structured telemetry events for every operation:

```elixir
# Telemetry events emitted by AutoHeal
:telemetry.execute(
  [:prismatic_claude, :autoheal, :baseline_established],
  %{quality_score: 100, domains_clean: 13},
  %{session_id: session_id}
)

:telemetry.execute(
  [:prismatic_claude, :autoheal, :repair_applied],
  %{level: 2, duration_ms: 1500},
  %{pattern: :type_mismatch, file: "lib/some_module.ex"}
)

:telemetry.execute(
  [:prismatic_claude, :autoheal, :circuit_breaker_opened],
  %{failures: 3},
  %{reason: :persistent_dialyzer_failure}
)
```

These events integrate with the platform's [observability](@/glossary/observability.md) and [metrics](@/glossary/metrics.md) systems, providing visibility into AutoHeal's operation and enabling historical analysis of repair patterns.

## Related Terms

- [AutoEvolve](@/glossary/autoevolve.md) -- Complementary proactive improvement system
- [CASCADE](@/glossary/cascade.md) -- Quality pattern methodology providing AutoHeal's fix procedures
- [CASCADE Pattern](@/glossary/cascade-pattern.md) -- Specific patterns applied during Level 3 healing
- [Clean Run](@/glossary/clean-run.md) -- Zero-warning standard that AutoHeal maintains
- [QDP](@/glossary/qdp.md) -- Quality metric that AutoHeal prevents from accumulating
- [Self-Healing](@/glossary/self-healing.md) -- Architectural principle that AutoHeal implements
- [Circuit Breaker](@/glossary/circuit-breaker.md) -- Pattern protecting AutoHeal from cascading failures
- [Fault Tolerance](@/glossary/fault-tolerance.md) -- OTP principle underlying AutoHeal's design
- [Let It Crash](@/glossary/let-it-crash.md) -- Erlang philosophy complementing AutoHeal's approach
- [Supervisor](@/glossary/supervisor.md) -- OTP behavior managing AutoHeal's process lifecycle
- [Dialyzer](@/glossary/dialyzer.md) -- Type analysis tool used in repair validation
- [Mix](@/glossary/mix.md) -- Build tool executing AutoHeal commands

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Technologies](@/technologies/_index.md) -- Technology stack details
- [Capabilities](@/capabilities/_index.md) -- Platform self-healing capabilities

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)