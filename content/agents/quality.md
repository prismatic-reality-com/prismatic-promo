+++
title = "Quality Assurance Agents"
weight = 4
[extra]
icon = "check-circle"
color = "emerald"
agent_count = 45
commands = ["/quality-gates", "/evolve", "/quality-enforce", "/cascade"]
description = "Autonomous quality monitoring and self-healing"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 1800
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Quality", "Assurance", "Agents", "Autonomous", "Prismatic Platform", "Custom", "CASCADE", "Strategic Command"]
tags = ["agents", "quality-assurance-agents", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "Quality Assurance Agents - Prismatic Platform"
+++

## Overview

Quality Assurance agents maintain the platform's 100/100 quality score through continuous monitoring, automated fixing, and self-evolution. The [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) ensures no regression ever reaches production. This domain represents one of the Prismatic Platform's most critical agent clusters, comprising 45 specialized agents that collectively enforce, monitor, analyze, and improve code quality across all 90 umbrella applications and 13 quality domains.

The quality assurance domain operates on a fundamental principle: quality is not a periodic audit activity but a continuous, automated process integrated into every development operation. From pre-commit hooks that block non-compliant code to autonomous evolution cycles that proactively improve the codebase, quality agents ensure that the platform's perfect quality score is maintained without manual intervention. This architecture has driven the elimination of 905 [Quality Debt Points](@/glossary/quality-debt.md) (QDP) through systematic [CASCADE](@/glossary/cascade-pattern.md) pattern campaigns and brought the platform to its current zero-violation state.

## Agent Hierarchy

The quality assurance domain is organized into a multi-level hierarchy that separates strategic intelligence, operational enforcement, and tactical execution.

| Agent | Level | Role | Specialization |
|-------|-------|------|----------------|
| [qdp-enforcement-supreme](@/agents/qdp-enforcement-supreme.md) | L1 | Supreme Authority | QDP monotonic decrease invariant |
| [quality-enforcement-commander](@/agents/quality-enforcement-commander.md) | L3 | Strategic Command | 13-domain quality enforcement |
| [quality-intelligence-commander](@/agents/quality-intelligence-commander.md) | L3 | Strategic Command | Quality trend analysis and Lean4 verification |
| [quality-gates-specialist](@/agents/quality-gates-specialist.md) | L3 | Strategic Command | Static analysis toolchain management |
| [quality-gate-enforcer-agent](@/agents/quality-gate-enforcer-agent.md) | L3 | Strategic Command | Gate execution and result management |
| [quality-bypass-enforcer-agent](@/agents/quality-bypass-enforcer-agent.md) | L3 | Strategic Command | Bypass prevention and hook integrity |
| **quality-floor-guardian** | L4 | Domain Authority | Autonomous quality monitoring |
| **cascade-eliminator** | L3 | Pattern Fixer | Systematic anti-pattern removal |
| **evolution-engine** | L3 | Self-Evolution | Autonomous codebase improvement |
| **test-architect** | L3 | Test Design | Comprehensive test generation |
| **debt-hunter** | L2 | Tech Debt | Quality debt elimination |

## Quality Domains (13/13 Perfect)

The platform's quality assessment spans thirteen independent domains, each monitoring a specific aspect of code quality. Every domain must report zero violations for the platform to maintain its 100/100 quality score.

| Domain | Description | Tool | Status |
|--------|-------------|------|--------|
| **Compilation** | Zero warnings (--force) | `mix compile --warnings-as-errors` | 0 violations |
| **[Dialyzer](@/glossary/dialyzer.md)** | Static type analysis | `mix dialyzer` | 0 violations |
| **[Credo](@/glossary/credo.md)** | Code style and patterns | `mix credo --strict` | 0 violations |
| **DateTime Precision** | Microsecond timestamps | Custom analyzer | 0 violations |
| **Guard Functions** | [Pattern matching](@/glossary/pattern-matching.md) hygiene | Custom analyzer | 0 violations |
| **@impl Coverage** | Callback documentation | Custom analyzer | 709 callbacks |
| **Memory Safety** | Bounded data structures | Custom analyzer | 0 violations |
| **Performance** | O(1) pattern compliance | Custom analyzer | 0 violations |
| **Regression Prevention** | Mandatory [regression tests](@/capabilities/regression-tests.md) | Test framework | 0 violations |
| **Timing Patterns** | Process.sleep elimination | Custom analyzer | 0 violations |
| **TODO Management** | TODO/FIXME removal | Custom analyzer | 0 violations |
| **[Typespec](@/glossary/typespec.md) Coverage** | @spec documentation | Custom analyzer | 0 violations |
| **Unsafe Map Access** | Map.fetch/Map.get safety | Custom analyzer | 0 violations |

## CASCADE Pattern Elimination

[CASCADE](@/glossary/cascade-pattern.md) patterns represent systemic quality anti-patterns that propagate across the codebase if not immediately eliminated. The quality assurance domain maintains specialized detection and elimination capabilities for each CASCADE type.

```
CASCADE Fix Types:
  Type Mismatch     -> Dialyzer-driven type corrections
  Dead Code         -> Unused function removal
  Empty Check       -> length() > 0 -> != [] optimization
  Timer Replacement -> Process.sleep -> receive after
  Nuclear Cache     -> _build/ebin corruption recovery
```

The CASCADE elimination campaign has been one of the platform's most significant quality improvements, systematically identifying and resolving anti-patterns that would otherwise propagate through developer imitation. Each CASCADE type targets a specific anti-pattern that tends to replicate across the codebase: developers who see existing code using `length(list) > 0` replicate that pattern rather than using the more efficient `list != []`. By eliminating all instances of each CASCADE pattern, the quality agents break the replication cycle.

## Quality Floor Guardian Enforcement

The Quality Floor Guardian implements a tiered response system that escalates enforcement actions based on the severity of quality score deviations.

| Level | Score | Action |
|-------|-------|--------|
| OPTIMAL | 100-99% | Monitor only |
| WARNING | 98-99% | Alert + investigation |
| CRITICAL | 95-98% | Auto-evolution trigger |
| EMERGENCY | <95% | Block commits + escalate |

The guardian operates continuously, sampling quality metrics across all applications and triggering appropriate responses within seconds of detecting deviations. At the CRITICAL level, the guardian activates autonomous self-healing through the [SEADF](@/glossary/seadf.md) framework, which generates, verifies, and applies corrective code changes without human intervention.

## Self-Healing Pipeline

The self-healing pipeline implements the autonomous quality improvement capability that enables the platform to fix quality issues without manual intervention.

```
Detection -> Analysis -> Generation -> Verification -> Application
    |          |           |             |            |
 Credo     Root Cause   Fix Code    Test Suite   Hot Swap
 Dialyzer  Pattern ID   New Tests   Trinity Gate Commit
 Compile                            0.95+ Conf
```

Each stage of the pipeline is independently verified. Detection identifies the quality violation through static analysis tooling. Analysis determines the root cause and classification of the violation. Generation produces the corrective code change and associated regression tests. Verification ensures the change passes all quality gates and achieves confidence above 0.95 through [Trinity Gate](@/glossary/trinity-gate.md) validation. Application commits the verified change to the codebase through the standard git workflow.

## Formal Verification Foundation

The quality intelligence domain maintains five core [Lean4](@/glossary/lean4.md) theorems that provide mathematical guarantees about quality system properties: Quality Monotonicity (quality score never decreases under valid operations), Regression Completeness (all historical failures covered by regression tests), Gate Consistency (gate results are environment-independent), Evolution Safety (self-evolution preserves all invariants), and Composition Preservation (quality composes correctly across umbrella apps).

## Integration Points

- **Git Hooks**: Pre-commit quality enforcement via `.githooks/pre-commit`
- **CI/CD**: Pipeline [quality gates](@/glossary/quality-gates.md) with blocking enforcement
- **[AIAD](@/glossary/aiad.md)**: Agent-level quality requirements in every agent specification
- **[Trinity Gate](@/glossary/trinity-gate.md)**: 3-layer verification for all quality-critical decisions
- **[SEADF](@/glossary/seadf.md)**: Evolutionary quality improvement through autonomous healing cycles
- **Quality DNA**: Cross-session quality state persistence in `.claude/quality-dna/current-state.json`

## Commands

| Command | Description | Authority |
|---------|-------------|-----------|
| `/quality-gates` | Run all quality checks across 13 domains | L2+ |
| `/evolve` | Trigger self-evolution cycle with quality improvement | L3 |
| `/cascade` | Execute [CASCADE pattern](@/glossary/cascade-pattern.md) fix campaign | L3 |
| `/quality-enforce` | Systematic enforcement across all applications | L3 |
| `/tech-debt` | Analyze technical debt and QDP status | L2+ |
| `/qdp status` | Display current QDP count with per-domain breakdown | L4+ |

## Enforcement

Quality assurance operates under the [NO MERCY](@/glossary/no-mercy.md) doctrine at its most absolute level. Zero quality violations are accepted, zero exceptions are granted, and zero deferrals are permitted. The [QDP enforcement supreme](@/agents/qdp-enforcement-supreme.md) maintains the monotonic decrease invariant as an L1 Supreme Authority -- no other agent in the platform hierarchy can override quality enforcement decisions. The [NO DOUBTS](@/glossary/no-doubts.md) principle requires that all quality assessments are based on deterministic, reproducible measurements rather than subjective evaluation.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)