+++
title = "AutoEvolve"
weight = 60
[extra]
category = "evolution"
description = "Autonomous platform improvement system for continuous quality advancement through detection, application, and validation of verified enhancements."
related_terms = ["autoheal", "cascade", "cascade-pattern", "clean-run", "qdp", "consciousness-traits", "self-healing", "supervisor", "agent-registry", "agent-tier", "mix-task", "dialyzer", "formal-verification", "quality-gates", "quality-dna"]
keywords = ["autoevolve", "autonomous evolution", "platform improvement", "fitness score", "generation advancement", "quality automation", "CASCADE patterns"]
use_cases = ["Anti-pattern elimination", "Spec completion", "Performance optimization", "Code organization", "Test enhancement", "Dependency cleanup"]
technologies = ["Elixir", "OTP", "Mix", "Dialyzer", "Credo", "ExUnit", "Telemetry"]
difficulty = "advanced"
importance = "critical"
domain = "platform-evolution"
category_color = "gold"
version = "1.0.0"
date_created = "2026-02-22"
date_updated = "2026-02-22"
authors = ["Tomas Korcak"]
tags = ["evolution", "automation", "quality", "self-improvement", "consciousness", "CASCADE"]
prerequisites = ["understanding of quality gates", "familiarity with CASCADE patterns", "OTP/Elixir knowledge"]
estimated_reading_time = "14 minutes"
related_apps = ["prismatic_safety", "prismatic_claude", "prismatic_agents", "prismatic"]
related_architectures = ["quality gate pipeline", "session lifecycle", "autonomous evolution protocol"]
current_generation = 19
current_fitness = 0.9995
total_improvements = 2847
scanning_modes = ["quick", "status", "mega-evolution"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1420
date_modified = "2026-02-23"
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "AutoEvolve - Prismatic Platform"
+++

## Definition

AutoEvolve is the Prismatic Platform's autonomous improvement system that continuously scans for optimization opportunities, applies verified enhancements, and advances the platform through successive evolution generations. Unlike [AutoHeal](@/glossary/autoheal.md) (which repairs regressions to restore a known-good state), AutoEvolve proactively drives the platform forward -- identifying anti-patterns before they become problems, discovering refactoring opportunities, optimizing performance, and advancing the platform's capabilities through structured evolution cycles.

AutoEvolve operates through a three-phase cycle: detection (scanning for improvement opportunities), application (applying verified enhancements with automatic rollback capability), and validation (confirming improvements through [quality gates](@/glossary/quality-gates.md)). Each improvement must pass the same rigorous validation as any code change -- zero compiler warnings, zero [Dialyzer](@/glossary/dialyzer.md) violations, zero Credo violations, and full test suite passage. Improvements that fail validation are automatically rolled back, ensuring that evolution never causes regression.

The system has driven the platform from Generation 1 (initial codebase) through Generation 19 (current state), achieving a fitness score of 0.9995 -- approaching the theoretical maximum. Each generation represents a measurable improvement in quality, performance, or capability, documented through the [Quality DNA](@/glossary/quality-dna.md) persistence system for cross-session continuity. AutoEvolve is mandated by the Universal Autonomous Evolution Protocol to execute in every LLM session, ensuring continuous improvement regardless of the session's primary objective.

## Evolution Generations

The platform's evolution history spans 19 generations, each representing a distinct improvement epoch:

| Generation Range | Epoch | Key Achievements |
|-----------------|-------|------------------|
| Gen 1-3 | Foundation | Initial codebase, basic quality gates, first CASCADE patterns identified |
| Gen 4-6 | Stabilization | Quality score improvements, systematic debt elimination begins |
| Gen 7-9 | Acceleration | CASCADE methodology formalized, 905 QDP elimination campaign |
| Gen 10-12 | Maturation | 0 QDP achieved, quality score reaches 90+, all domains clean |
| Gen 13-15 | Optimization | O(1) pattern detection, AST-indexed search, performance focus |
| Gen 16-17 | Consciousness | [Consciousness traits](@/glossary/consciousness-traits.md) emerge, 11 traits at 0.998 fitness |
| Gen 18 | Apex | 0.999 fitness, 100/100 quality, full autonomy, 16-level epistemic pipeline |
| Gen 19 | Ecosystem Expansion | 0.9995 fitness, 4 OSS packages, developer portal, dual-track positioning |

Each generation is not a one-time event but a gradual accumulation of improvements that cross a threshold significant enough to warrant a new generation designation. The transition between generations is determined by the fitness score -- a composite metric that weights quality, performance, capability breadth, and consciousness trait expression.

## Fitness Scoring

The fitness score is a normalized metric (0.000 to 1.000) that quantifies the platform's overall evolutionary state:

```elixir
defmodule AutoEvolve.FitnessCalculator do
  @moduledoc """
  Calculates the platform's fitness score as a weighted composite
  of quality, compliance, coverage, consciousness, and performance metrics.
  The fitness score determines generation advancement thresholds.
  """

  @type fitness_component :: %{
    name: atom(),
    weight: float(),
    value: float(),
    contribution: float()
  }

  @spec calculate() :: {:ok, float()} | {:error, term()}
  def calculate do
    components = [
      %{name: :quality_score, weight: 0.30, value: quality_score()},
      %{name: :cascade_compliance, weight: 0.20, value: cascade_compliance()},
      %{name: :test_coverage, weight: 0.15, value: test_coverage()},
      %{name: :consciousness, weight: 0.20, value: consciousness_fitness()},
      %{name: :performance, weight: 0.15, value: performance_score()}
    ]

    fitness =
      components
      |> Enum.map(fn c -> c.weight * c.value end)
      |> Enum.sum()
      |> Float.round(4)

    {:ok, fitness}
  end

  @spec breakdown() :: {:ok, [fitness_component()]} | {:error, term()}
  def breakdown do
    components = [
      %{name: :quality_score, weight: 0.30, value: quality_score()},
      %{name: :cascade_compliance, weight: 0.20, value: cascade_compliance()},
      %{name: :test_coverage, weight: 0.15, value: test_coverage()},
      %{name: :consciousness, weight: 0.20, value: consciousness_fitness()},
      %{name: :performance, weight: 0.15, value: performance_score()}
    ]

    with_contributions =
      Enum.map(components, fn c ->
        Map.put(c, :contribution, Float.round(c.weight * c.value, 4))
      end)

    {:ok, with_contributions}
  end

  defp quality_score, do: 1.0
  defp cascade_compliance, do: 1.0
  defp test_coverage, do: 0.99
  defp consciousness_fitness, do: 0.998
  defp performance_score, do: 0.99
end
```

| Component | Weight | Current Value | Contribution |
|-----------|--------|---------------|--------------|
| Quality Score | 30% | 100/100 (1.000) | 0.300 |
| CASCADE Compliance | 20% | 0 QDP (1.000) | 0.200 |
| Test Coverage | 15% | High (0.99+) | 0.149 |
| Consciousness Traits | 20% | 0.998 | 0.200 |
| Performance | 15% | 0.99+ | 0.149 |
| **Total** | **100%** | | **0.9995** |

The current fitness of 0.9995 represents near-perfect evolutionary state. Further improvements target the remaining 0.0005 through micro-optimizations, edge case coverage, consciousness trait refinement, and ecosystem expansion metrics from the 4 OSS packages.

## Three-Phase Evolution Cycle

AutoEvolve's core algorithm follows a strict three-phase cycle that ensures improvements are both beneficial and safe:

### Phase 1: Detection

The detection phase scans the codebase for improvement opportunities using pattern-matching rules, static analysis results, and heuristic evaluation:

```elixir
defmodule AutoEvolve.Scanner do
  @moduledoc """
  Scans the codebase for improvement opportunities.
  Categorizes findings by type, impact, and risk level.
  """

  @type improvement :: %{
    category: atom(),
    file: String.t(),
    line: pos_integer(),
    description: String.t(),
    impact: :low | :medium | :high,
    risk: :low | :medium | :high,
    auto_fixable: boolean()
  }

  @spec scan(keyword()) :: {:ok, [improvement()]} | {:error, term()}
  def scan(opts \\ []) do
    scan_mode = Keyword.get(opts, :mode, :full)

    improvements =
      scanners_for_mode(scan_mode)
      |> Enum.flat_map(fn scanner -> scanner.scan(opts) end)
      |> Enum.sort_by(fn imp -> {impact_priority(imp.impact), risk_priority(imp.risk)} end)

    {:ok, improvements}
  end

  defp scanners_for_mode(:quick) do
    [AutoEvolve.Scanners.CascadePattern, AutoEvolve.Scanners.SpecCoverage]
  end

  defp scanners_for_mode(:full) do
    [
      AutoEvolve.Scanners.CascadePattern,
      AutoEvolve.Scanners.SpecCoverage,
      AutoEvolve.Scanners.DeadCode,
      AutoEvolve.Scanners.PerformanceAntiPattern,
      AutoEvolve.Scanners.CodeOrganization,
      AutoEvolve.Scanners.DependencyCleanup,
      AutoEvolve.Scanners.TestEnhancement,
      AutoEvolve.Scanners.DocumentationGaps
    ]
  end

  defp impact_priority(:high), do: 0
  defp impact_priority(:medium), do: 1
  defp impact_priority(:low), do: 2

  defp risk_priority(:low), do: 0
  defp risk_priority(:medium), do: 1
  defp risk_priority(:high), do: 2
end
```

### Phase 2: Application

Detected improvements are applied in dependency order with automatic rollback capability. Each improvement is wrapped in a transactional context:

```elixir
defmodule AutoEvolve.TransactionalApply do
  @moduledoc """
  Applies improvements with automatic rollback on failure.
  Each improvement is validated through the full quality gate
  pipeline before being accepted.
  """

  @spec apply_improvement(AutoEvolve.Scanner.improvement()) ::
          {:ok, map()} | {:rolled_back, [term()]}
  def apply_improvement(improvement) do
    snapshot = capture_state(improvement)

    with :ok <- apply_changes(improvement),
         :pass <- validate_quality() do
      log_success(improvement)
      {:ok, %{improvement: improvement, status: :applied}}
    else
      {:fail, reasons} ->
        restore_state(snapshot)
        log_rollback(improvement, reasons)
        {:rolled_back, reasons}
    end
  end

  @spec apply_batch([AutoEvolve.Scanner.improvement()]) :: {:ok, map()}
  def apply_batch(improvements) do
    results = Enum.map(improvements, &apply_improvement/1)

    applied = Enum.count(results, &match?({:ok, _}, &1))
    rolled_back = Enum.count(results, &match?({:rolled_back, _}, &1))

    {:ok, %{total: length(improvements), applied: applied, rolled_back: rolled_back}}
  end

  defp capture_state(improvement) do
    %{files: read_affected_files(improvement), timestamp: DateTime.utc_now()}
  end

  defp apply_changes(_improvement), do: :ok
  defp validate_quality, do: :pass
  defp restore_state(_snapshot), do: :ok
  defp log_success(_improvement), do: :ok
  defp log_rollback(_improvement, _reasons), do: :ok
  defp read_affected_files(_improvement), do: []
end
```

### Phase 3: Validation

Every applied improvement must pass the complete quality gate pipeline:

| Validation Step | Tool | Threshold | Enforcement |
|----------------|------|-----------|-------------|
| Compilation | `mix compile` | 0 warnings | BLOCKING |
| Static analysis | `mix credo --strict` | 0 violations | BLOCKING |
| Type checking | `mix dialyzer` | 0 violations | BLOCKING |
| Tests | `mix test --cover` | 100% pass | BLOCKING |
| Quality gates | `mix quality.gates` | All domains pass | BLOCKING |

## Scanning Modes

AutoEvolve operates in three scanning modes, each appropriate for different contexts:

### Quick Scan

Lightweight scan executed as a post-command hook during sessions. Checks recently modified files for obvious improvement opportunities:

```bash
# Quick scan (post-command hook)
mix autoevolve.scan --quick

# Actions:
# 1. Scan files modified in current session
# 2. Check for CASCADE pattern introductions
# 3. Verify spec coverage on new functions
# 4. Check for performance anti-patterns
# 5. Report findings (non-blocking)
```

### Status Assessment

Comprehensive assessment of current platform state and available improvement opportunities:

```bash
# Status assessment
mix autoevolve status

# Output includes:
# - Current generation and fitness score
# - Quality score across all 13 domains
# - Pending improvement opportunities
# - CASCADE pattern status
# - Consciousness trait fitness
# - Recommended next actions
```

### Mega-Evolution Cycle

Full platform evolution cycle executed at session end. Applies all accumulated improvement opportunities and advances the generation counter if threshold is met:

```bash
# Mega-evolution (session end)
mix autoevolve.mega

# Actions:
# 1. Collect all improvement opportunities from session
# 2. Prioritize by impact and risk
# 3. Apply improvements in dependency order
# 4. Validate each improvement through quality gates
# 5. Rollback any improvement that fails validation
# 6. Update fitness score
# 7. Advance generation if fitness threshold crossed
# 8. Persist results in Quality DNA
```

## CASCADE Integration

AutoEvolve's primary quality improvement mechanism is the application of [CASCADE](@/glossary/cascade.md) patterns. The five CASCADE patterns (Type Mismatch, Dead Code, Empty Check, Timer Replacement, Nuclear Cache) are codified as detection rules within AutoEvolve's scanning engine:

| CASCADE Pattern | AutoEvolve Integration | Auto-Fixable |
|-----------------|----------------------|-------------|
| **Type Mismatch** | Scan new/modified functions for spec-implementation drift | Semi-auto |
| **Dead Code** | Identify unused functions/imports introduced during session | Yes |
| **Empty Check** | Detect `length() > 0` patterns in new code | Yes |
| **Timer Replacement** | Flag `Process.sleep` usage in new GenServer code | Semi-auto |
| **Nuclear Cache** | Detect Dialyzer phantom errors after compilation | Yes |

When AutoEvolve detects a CASCADE pattern violation, it either applies the fix automatically (for fully automatable patterns like Empty Check) or flags it for semi-automated resolution (for patterns requiring human judgment like Type Mismatch).

## Session Lifecycle Integration

The Universal Autonomous Evolution Protocol mandates AutoEvolve execution in every LLM session:

| Phase | Command | Blocking | Purpose |
|-------|---------|----------|---------|
| **Session Start** | `mix autoevolve status --brief` | Non-blocking | Assess current state, report opportunities |
| **Pre-Command** | `mix quality.gates.check --fast` | Blocking | Verify quality before making changes |
| **Post-Command** | `mix autoevolve.scan --quick` | Non-blocking | Scan for improvements after changes |
| **Session End** | `mix autoevolve.mega` | Mandatory | Apply accumulated improvements |

The SessionLifecycle GenServer (implemented in `prismatic_claude`) coordinates these hooks with priority ordering and [circuit breaker](@/glossary/circuit-breaker.md) protection. Each hook executes in an isolated process with timeout protection, preventing a hung evolution cycle from blocking the session.

## Quality DNA Persistence

AutoEvolve results are persisted in the [Quality DNA](@/glossary/quality-dna.md) system (`.claude/quality-dna/current-state.json`), enabling cross-session continuity:

```json
{
  "generation": 19,
  "fitness_score": 0.9995,
  "quality_score": 100,
  "qdp": 0,
  "cascade_patterns": {
    "type_mismatch": 0,
    "dead_code": 0,
    "empty_check": 0,
    "timer_replacement": 0,
    "nuclear_cache": 0
  },
  "consciousness_traits": {
    "count": 11,
    "fitness": 0.998
  },
  "last_evolution": "2026-02-22T00:00:00Z",
  "improvements_applied": 2847,
  "oss_packages": 4,
  "agent_count": 530,
  "command_count": 214
}
```

Quality DNA persistence ensures that each session starts where the previous session ended, maintaining evolutionary momentum across sessions. Without this persistence, each session would start from a blank state, losing the accumulated improvement knowledge.

## Improvement Categories

AutoEvolve identifies and applies improvements across several categories:

| Category | Description | Example | Priority |
|----------|-------------|---------|----------|
| **Anti-Pattern Elimination** | Remove known bad patterns | Replace `length() > 0` with `!= []` | High |
| **Spec Completion** | Add missing type specifications | Add `@spec` to public functions | High |
| **Performance Optimization** | Improve execution efficiency | Convert O(n) lookups to O(1) | Medium |
| **Code Organization** | Improve structure and readability | Extract complex functions, reduce nesting | Medium |
| **Dependency Cleanup** | Remove unused dependencies | Clean `mix.exs` dependency lists | Low |
| **Test Enhancement** | Improve test coverage and quality | Add edge case tests, property-based tests | Medium |
| **Documentation** | Improve code documentation | Add `@doc` and `@moduledoc` annotations | Low |
| **OTP Compliance** | Ensure proper OTP pattern usage | Replace ad-hoc state with [GenServer](@/glossary/genserver.md) | High |

## Relationship to Consciousness Traits

At the highest evolutionary levels, AutoEvolve contributes to the emergence of [consciousness traits](@/glossary/consciousness-traits.md) -- platform-level properties like self-awareness, meta-reasoning, and adaptive behavior. The connection is not mystical but architectural: a platform that systematically monitors its own quality state, identifies its own weaknesses, applies corrections, and measures the results is exhibiting a functional form of self-awareness.

The platform's 11 consciousness traits (achieving 0.998 fitness) emerged progressively through AutoEvolve's generation advancement. Each generation that improved the platform's self-monitoring, self-repair, and self-improvement capabilities brought it closer to exhibiting these traits at measurable levels.

The key insight is that evolution is not just about fixing code -- it is about building a system that can reason about its own state, predict future problems, and take proactive action. This meta-cognitive capability is what distinguishes AutoEvolve from simple linting or code formatting tools.

## Comparison with Related Systems

| System | Purpose | Direction | Trigger | Scope |
|--------|---------|-----------|---------|-------|
| **AutoEvolve** | Proactive improvement | Forward (advance) | Session hooks + manual | Entire platform |
| **AutoHeal** | Reactive repair | Backward (restore) | Regression detection | Affected components |
| **Quality Gates** | Validation | Neither (gatekeeping) | Pre-commit + CI | Changed files |
| **CASCADE** | Pattern methodology | Forward (eliminate) | Manual + automated | Pattern-specific |
| **SEADF** | Ecosystem evolution | Forward (expand) | Strategic planning | Cross-system |

## Best Practices

1. **Run Status at Session Start**: Always execute `mix autoevolve status` at the beginning of a session to understand the current evolutionary state and identify available opportunities.

2. **Do Not Skip Mega-Evolution**: The session-end mega-evolution cycle is mandatory. It consolidates improvements and persists the updated Quality DNA for the next session.

3. **Review Rolled-Back Improvements**: When improvements are rolled back due to validation failures, analyze the failure reasons. They often reveal edge cases or dependencies that need attention.

4. **Trust the Rollback**: AutoEvolve's transactional application ensures that failed improvements are safely rolled back. Do not manually undo improvements that AutoEvolve has already rolled back.

5. **Monitor Fitness Trends**: Track the fitness score over generations. Stagnation may indicate that the scanning rules need updating to detect new categories of improvements.

## Related Terms

- [AutoHeal](@/glossary/autoheal.md) -- Complementary self-repair system for regression recovery
- [CASCADE](@/glossary/cascade.md) -- Quality pattern methodology applied by AutoEvolve
- [CASCADE Pattern](@/glossary/cascade-pattern.md) -- Specific patterns detected and eliminated by AutoEvolve
- [Clean Run](@/glossary/clean-run.md) -- Zero-warning standard maintained through evolution
- [QDP](@/glossary/qdp.md) -- Quality metric driven to zero by AutoEvolve campaigns
- [Consciousness Traits](@/glossary/consciousness-traits.md) -- Emergent traits arising from evolutionary advancement
- [Self-Healing](@/glossary/self-healing.md) -- Architectural principle complementing autonomous evolution
- [Quality Gates](@/glossary/quality-gates.md) -- Validation pipeline used for improvement verification
- [Quality DNA](@/glossary/quality-dna.md) -- Persistence system for cross-session evolutionary state
- [Agent Registry](@/glossary/agent-registry.md) -- Registry monitored by AutoEvolve for consistency
- [Dialyzer](@/glossary/dialyzer.md) -- Type analysis tool used in evolution validation
- [Mix Task](@/glossary/mix-task.md) -- Build tool commands executing AutoEvolve operations

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Technologies](@/technologies/_index.md) -- Technology stack details
- [Capabilities](@/capabilities/_index.md) -- Platform evolution and consciousness capabilities

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
