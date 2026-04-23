+++
title = "Development Agents"
weight = 5
[extra]
icon = "code"
color = "cyan"
agent_count = 58
commands = ["/code", "/test", "/refactor", "/fix", "/doc"]
description = "Intelligent code generation, testing, and documentation"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1163
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Development", "Agents", "Intelligent", "Prismatic Platform", "Every", "Blocking", "Minutes"]
tags = ["agents", "development-agents", "prismatic"]
quality_score = 80
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "Development Agents - Prismatic Platform"
+++

## Overview

Development agents constitute the largest and most actively utilized agent cohort within the Prismatic Platform, handling all software engineering tasks from code generation to testing, refactoring, documentation, and debugging. These 58 specialized agents collectively form an autonomous software engineering pipeline that produces production-ready code meeting the platform's exacting quality standards. Every agent in this domain operates under the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine, meaning zero tolerance for incomplete implementations, untested code, or quality shortcuts. The development domain is not a code suggestion engine -- it is a complete software engineering team operating as a coordinated autonomous system.

The Prismatic Platform's codebase spans over 6,600 [Elixir](/glossary/elixir/) source files across 90 [umbrella application](/glossary/umbrella-application/)s, totaling approximately 2.8 million lines of code. Managing a codebase of this scale requires development agents that understand not just syntax but architectural context, dependency graphs, naming conventions, [OTP](/glossary/otp/) patterns, and cross-application interfaces. Development agents maintain deep contextual awareness of the entire codebase through the platform's Git Tree indexing system, enabling them to generate code that is consistent with existing patterns and correctly integrated with surrounding modules.

## Agent Roster

The development domain organizes its agents into functional specializations, each operating at the appropriate authority level for its scope of impact.

| Agent | Level | Role | Specialization |
|-------|-------|------|----------------|
| **code-architect** | L3 | Code Generation | Production-ready code synthesis with architectural awareness |
| **test-generator** | L3 | Test Creation | Comprehensive test suites including property-based testing |
| **refactor-master** | L3 | Refactoring | Safe code transformation with three-stage verification |
| **bug-hunter** | L3 | Debugging | Root cause analysis with mandatory regression tests |
| **doc-writer** | L2 | Documentation | API docs, inline comments, module-level documentation |
| **fofr-commando** | L2 | Low-Hanging Fruit | Quick wins, obvious fixes, immediate improvements |
| **code-specialist** | L3 | Advanced Generation | Multi-phase requirement refinement and code synthesis |
| **explain-specialist** | L3 | Code Explanation | Multi-level analysis with pattern recognition |
| **fix-specialist** | L3 | Bug Remediation | Targeted fix application with verification |

## Code Generation Pipeline

The code generation pipeline transforms user intent into production-ready implementations through a structured multi-stage process. Each stage has explicit quality gates that must pass before the pipeline advances.

```
Specification --> Analysis --> Generation --> Verification --> Delivery
     |               |            |              |              |
 User Intent     Codebase     Elixir/TS      Tests Pass    Production
 Requirements    Context      Phoenix        Dialyzer      Ready
                 Patterns     LiveView       Credo
                 Git Trees    OTP            Coverage
```

The specification stage captures user intent through structured requirement analysis. The analysis stage examines the existing codebase for relevant patterns, interfaces, and constraints using Git Tree indexing for rapid file discovery. Generation produces code following [OTP](/glossary/otp/) principles, functional programming patterns, and platform naming conventions. Verification runs the complete quality gate suite. Only code that passes all gates reaches delivery.

Every generated module includes `@moduledoc`, `@doc`, and `@spec` annotations. Every public function has explicit type specifications. Every module compiles with `--warnings-as-errors`. This is not optional -- it is enforced at the pipeline level.

## Test Generation Strategy

Testing is treated as a first-class engineering discipline, not an afterthought. The test generator agent produces comprehensive test suites that exercise both happy paths and edge cases, using multiple testing methodologies appropriate to the code under test.

| Test Type | Coverage Target | Generator | Description |
|-----------|-----------------|-----------|-------------|
| **Unit** | All public functions | test-generator | Individual function verification with explicit inputs and outputs |
| **Integration** | Cross-module flows | test-generator | Multi-module interaction verification including GenServer protocols |
| **Property-Based** | Edge cases, invariants | test-generator | StreamData-based property testing for boundary conditions |
| **Regression** | Every bug fix | MANDATORY | Tests that reproduce the exact failure mode before the fix |
| **E2E** | Critical user flows | test-generator | Full LiveView interaction testing through browser simulation |
| **Contract** | Adapter interfaces | test-generator | Behavior compliance verification for pluggable components |

The mandatory regression test protocol requires that every bug fix includes a test that fails with the unfixed code and passes with the fix applied. This is enforced at the pre-commit hook level -- commits that fix bugs without regression tests are rejected.

## Refactoring Operations

Refactoring in a 2.8-million-line codebase demands extreme discipline. The refactor-master agent implements a three-stage verification protocol that ensures refactoring operations never introduce regressions.

```elixir
# Safe refactoring with three-stage verification
{:ok, changes} = Prismatic.Refactor.execute(
  target: "apps/prismatic_api/lib/",
  operation: :extract_function,
  verify: true,     # Stage 1: Run tests after refactoring
  typecheck: true,  # Stage 2: Run Dialyzer for type safety
  backup: true      # Stage 3: Create restore point for rollback
)
```

Supported refactoring operations include function extraction, module decomposition, pattern consolidation, naming normalization, dead code elimination, and dependency restructuring. Each operation is implemented as an atomic transformation with full rollback capability. The refactoring agent never modifies code that it cannot verify through automated testing.

## Code Quality Enforcement

Every piece of code generated or modified by development agents must pass the platform's complete quality gate pipeline. There are no exceptions, no waivers, and no deferrals.

| Quality Gate | Tool | Threshold | Enforcement |
|--------------|------|-----------|-------------|
| Compilation | `mix compile --warnings-as-errors` | Zero warnings | Blocking |
| Static Analysis | `mix credo --strict` | Zero violations | Blocking |
| Type Checking | `mix dialyzer` | Zero type errors | Blocking |
| Test Coverage | `mix test --cover` | 100% on new code | Blocking |
| Documentation | @spec and @doc | All public functions | Blocking |
| Naming | Credo naming checks | No Manager/Handler/Utils | Blocking |

The quality enforcement pipeline runs automatically on every code generation and modification operation. Development agents do not produce "draft" or "prototype" code -- every output is production-ready from the moment of creation. This aligns with the NO MERCY principle: complete execution or no delivery.

## Debugging and Root Cause Analysis

The bug-hunter agent implements a systematic debugging methodology derived from the platform's NO DOUBTS doctrine: understand completely before acting.

The debugging process follows five sequential stages: reproduction, isolation, hypothesis formation, hypothesis testing, and fix verification. The agent first creates a reliable reproduction of the reported issue, then isolates the failure to the smallest possible code region. It forms explicit hypotheses about the root cause, tests each hypothesis against the reproduction, and only after confirming the root cause does it implement a fix. The fix is verified through the regression test that was written during the reproduction phase.

This methodology eliminates shotgun debugging, where developers make speculative changes hoping to fix the issue. Every fix produced by the bug-hunter agent is targeted at a confirmed root cause and verified through automated testing.

## Integration Points

Development agents integrate with every layer of the Prismatic Platform, serving as the primary interface between human developers and the codebase.

| Integration | Purpose | Mechanism |
|-------------|---------|-----------|
| [AIAD](/glossary/aiad/) Commands | Direct agent invocation | Command dispatch through AIAD registry |
| [Quality Gates](/glossary/quality-gates/) | Automatic verification | Pre-commit hooks and CI pipeline |
| Git Integration | Atomic commits | Co-authored commits with conventional format |
| Git Trees | Codebase navigation | Rapid file discovery and pattern matching |
| [Telemetry](/glossary/telemetry/) | Performance tracking | Code generation metrics and timing |
| [SEADF](/glossary/seadf/) | Ecosystem evolution | Quality improvements feeding evolutionary cycles |

## Commands

Development agents are invoked through the [AIAD](/glossary/aiad/) command system, providing a consistent interface for all software engineering operations.

| Command | Description | Authority | Typical Duration |
|---------|-------------|-----------|-----------------|
| `/code` | Generate production code | L2+ | Minutes to hours |
| `/test` | Generate test suites | L2+ | Minutes |
| `/refactor` | Safe code refactoring | L2+ | Minutes to hours |
| `/fix` | Bug investigation and fix | L2+ | Minutes to hours |
| `/doc` | Documentation generation | L2+ | Minutes |
| `/fofr` | Quick low-hanging fruit fixes | L2+ | Seconds to minutes |
| `/explain` | Code explanation and analysis | L1+ | Seconds to minutes |

## Operational Metrics

Development agent effectiveness is measured through quantitative metrics that track both throughput and quality.

| Metric | Target | Description |
|--------|--------|-------------|
| Code generation success rate | >98% | Percentage of generated code passing all quality gates on first attempt |
| Test coverage on generated code | 100% | All generated public functions covered by automated tests |
| Regression test compliance | 100% | Every bug fix includes mandatory regression test |
| Compilation warning rate | 0 | Zero warnings across all generated code |
| Refactoring regression rate | 0% | No regressions introduced by refactoring operations |

## Related Domains

- [**Architecture**](/agents/architecture-decision-specialist/) - Provides architectural constraints that guide code generation decisions
- [**Quality**](/agents/cascade-quality-specialist/) - Monitors quality metrics and triggers development agent interventions
- [**Evolution**](/agents/evolution-orchestrator-supreme/) - Feeds development patterns into evolutionary improvement cycles

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)