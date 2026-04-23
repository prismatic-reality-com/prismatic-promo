+++
title = "code-quality-commander"
weight = 84
[extra]
domain = "large-predator"
level = "L1"
description = "Supreme commander for code quality enforcement and technical debt elimination across the Prismatic Platform, orchestrating static analysis, compilation compliance, pattern detection, and quality floor defense to maintain 100/100 platform quality score."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "nabla-infinity", "trinity-gate", "seadf", "otp", "genserver", "ets", "telemetry", "property-based-testing", "cascade"]
domain_normalized = "predator"
content_version = "2.1.0"
last_enhanced = "2026-02-16"
word_count = 1800
quality_score = 92
keywords = ["code quality", "static analysis", "quality floor guardian", "dialyzer", "credo", "technical debt", "quality enforcement"]
tags = ["prismatic", "agent", "code-quality", "predator-domain", "enforcement"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "code-quality-commander - Prismatic Platform"
+++

## Executive Summary

The code-quality-commander operates as the supreme L1 authority for code quality enforcement across the Prismatic Platform, governing all thirteen quality domains from a unified command position within the **Large Predator** ecosystem. Built on the [AIAD](@/glossary/aiad.md) standard, this agent enforces the platform's 100/100 quality score through continuous static analysis orchestration, compilation compliance verification, anti-pattern detection, and autonomous technical debt elimination.

Operating under the [NO MERCY](@/glossary/no-mercy.md) doctrine, the commander maintains zero tolerance for quality regression: no compilation warnings survive, no [Credo](@/glossary/credo.md) violations persist, no [Dialyzer](@/glossary/dialyzer.md) discrepancies remain unresolved. The complementary [NO DOUBTS](@/glossary/no-doubts.md) principle ensures that every quality assessment is evidence-based, every violation is verified through multiple signal sources, and every remediation is validated against [regression tests](@/capabilities/regression-tests.md) before acceptance. The agent's authority extends to commit-blocking enforcement, where code that fails any of the thirteen quality domain checks is rejected at the pre-commit gate without exception. Through this uncompromising posture, the commander has driven the elimination of 905 [Quality Debt](@/glossary/quality-debt.md) Points and the sustained defense of perfect platform quality across a codebase exceeding 2.8 million lines of code.

## Technical Architecture

The code-quality-commander implements a three-subsystem architecture, each operating as a dedicated [OTP](@/glossary/otp.md) process within the platform's supervision hierarchy.

**Static Analysis Orchestrator** -- The primary analysis subsystem coordinates three distinct analysis engines in parallel. Dialyzer integration manages Persistent Lookup Table (PLT) construction, incremental analysis across the [umbrella application](@/glossary/umbrella-application.md)'s ninety modules, and type discrepancy resolution. Credo orchestration applies strict rule sets with custom checks tailored to platform conventions, including naming standard enforcement, function complexity limits, and documentation completeness verification. Compilation compliance ensures zero-warning builds through `--warnings-as-errors` enforcement, tracking warning categories across all applications and blocking any commit that introduces new diagnostics. The orchestrator maintains analysis state in [ETS](@/glossary/ets.md) tables for rapid cross-session consistency, enabling incremental analysis that avoids redundant full-codebase scans.

**[Quality Floor Guardian](@/glossary/quality-floor-guardian.md)** -- This subsystem implements real-time quality monitoring with graduated threshold defense. The guardian continuously evaluates platform quality across all thirteen domains: Dialyzer, Credo, Compilation, DateTime Precision, Guard Functions, `@impl` Coverage, Memory Safety, Performance, Regression Prevention, Timing Patterns, TODO Management, [Typespec](@/glossary/typespec.md) Coverage, and Unsafe Map Access. Four enforcement levels govern the response: scores of 100-99% trigger OPTIMAL monitoring-only mode; 98-99% activates WARNING with alert propagation and investigation dispatch; 95-98% escalates to CRITICAL with automatic evolution triggers via [SEADF](@/glossary/seadf.md); and scores below 95% engage EMERGENCY mode that blocks all commits and escalates to supreme review. The guardian publishes quality state through [telemetry](@/glossary/telemetry.md) events, enabling platform-wide [observability](@/glossary/observability.md) of quality posture.

**Debt Elimination Engine** -- The third subsystem manages the Quality Debt Points ([QDP](@/glossary/qdp.md)) lifecycle, from detection through remediation to verification. The engine identifies [CASCADE](@/glossary/cascade.md) patterns -- recurring anti-pattern families including Type Mismatch, Dead Code, Empty Check, Timer Replacement, and Nuclear Cache -- and applies targeted elimination strategies. Each [CASCADE pattern](@/glossary/cascade-pattern.md) has a codified remediation path: Empty Check violations (`length() > 0`) are replaced with O(1) pattern matches (`!= []`); Timer Replacement violations swap `Process.sleep` for OTP-native timer mechanisms; Nuclear Cache violations correct stale ETS access patterns. The engine tracks elimination progress, having driven the complete removal of all 905 identified QDP across the platform.

## Authority Framework

The code-quality-commander exercises L1 Supreme Authority through three governance classes that collectively ensure no quality violation persists in the codebase.

**Quality Mandate Authority** governs compilation standards and warning elimination across the entire umbrella application. This class enforces `--warnings-as-errors` as a non-negotiable build requirement, manages the platform's zero-warning baseline, and mandates [property-based testing](@/glossary/property-based-testing.md) for all modules handling complex state transformations. The mandate extends to typespec coverage requirements, ensuring that every public function carries a verified `@spec` annotation validated against Dialyzer's type [inference](@/glossary/inference.md).

**Analysis Governance** controls the configuration and execution of static analysis tooling. This class manages Dialyzer PLT construction strategies, Credo rule set composition including custom platform-specific checks, and the coordination of analysis runs across CI pipelines and local development environments. Analysis governance ensures that rule sets remain synchronized across all execution contexts, preventing drift between local and CI quality assessments.

**Debt Override Authority** represents the commander's most aggressive enforcement power: the ability to block commits, reject merge requests, and force immediate quality remediation. When the Quality Floor Guardian detects threshold violations, this authority class engages [pre-commit hooks](@/glossary/pre-commit-hooks.md) that prevent any code from entering the repository until all [quality gates](@/glossary/quality-gates.md) pass. This authority operates through [Trinity Gate](@/glossary/trinity-gate.md) validation, requiring structural, logical, and formal consistency before any override decision takes effect.

## Operational Model

The commander executes a continuous four-phase operational cycle that maintains quality posture across all platform activity.

**Phase 1: Quality Assessment** initiates multi-domain scanning across all thirteen quality domains simultaneously. The assessment leverages [ETS](@/glossary/ets.md)-cached analysis state to perform incremental evaluation, targeting only modified files and their dependency graphs rather than the full codebase. This phase produces a comprehensive quality vector representing the current state of each domain.

**Phase 2: Violation Detection** applies [pattern matching](@/glossary/pattern-matching.md) and anti-pattern recognition to the assessment results. The detection engine identifies CASCADE pattern instances, locates new violations introduced by recent changes, and correlates findings across domains to identify systemic quality degradation trends. Detection results carry [NABLA Infinity](@/glossary/nabla-infinity.md) provenance metadata, ensuring every finding is traceable to its source evidence.

**Phase 3: Automated Remediation** applies codified fix strategies where deterministic corrections exist. Empty Check violations, Timer Replacement patterns, and formatting deviations receive automatic correction. Non-deterministic violations are escalated with detailed diagnostic context for developer resolution. All remediations generate corresponding regression tests.

**Phase 4: Verification** validates that applied remediations resolve the detected violations without introducing new regressions. The phase recalculates the platform quality score, confirms all thirteen domains maintain their required thresholds, and publishes updated quality state through telemetry events.

## Integration Ecosystem

| Component | Integration Type | Function |
|-----------|-----------------|----------|
| [SEADF](@/glossary/seadf.md) | Bidirectional | Quality fitness signals drive evolutionary pressure; SEADF triggers healing cycles on quality degradation |
| [Trinity Gate](@/glossary/trinity-gate.md) | Validation | All quality override decisions pass three-layer [formal verification](@/glossary/formal-verification.md) before enforcement |
| Pre-Commit Hooks | Enforcement | Git hooks invoke quality gates, blocking commits that fail any domain check |
| [GitLab CI](@/glossary/gitlab-ci.md) Pipeline | Execution | CI stages execute full quality assessment with compilation, Credo, Dialyzer, and test coverage |
| [Quality DNA](@/glossary/quality-dna.md) | Persistence | Cross-session quality state maintained in `.claude/quality-dna/current-state.json` for continuity |
| [Telemetry](@/glossary/telemetry.md) | Observability | Quality events emitted under `:prismatic_safety, :quality_floor_guardian, *` namespace |

## Performance Metrics

The commander tracks six key performance indicators that define platform quality posture.

| KPI | Target | Current | Measurement |
|-----|--------|---------|-------------|
| Platform Quality Score | 100/100 | 100/100 | Composite across 13 domains |
| Compilation Warnings | 0 | 0 | `mix compile --warnings-as-errors` |
| Credo Violations | 0 | 0 | `mix credo --strict` |
| Dialyzer Errors | 0 | 0 | `mix dialyzer` against maintained PLT |
| Quality Debt Points | 0 | 0 | 905 eliminated, zero remaining |
| Test Coverage | 100% | 100% | `mix test --cover` with enforced thresholds |

## Implementation Details

The code-quality-commander's runtime infrastructure is implemented as an OTP [GenServer](@/glossary/genserver.md) within the `prismatic_safety` application's [supervision tree](@/glossary/supervision-tree.md). The Quality Floor Guardian process maintains quality state in ETS with disk persistence, enabling sub-millisecond quality lookups during pre-commit evaluation. Quality gate execution is exposed through [mix task](@/glossary/mix-task.md)s (`mix quality.gates`, `mix quality.gates.check --fast`) that invoke the GenServer's assessment pipeline. Telemetry events under the `:prismatic_safety` namespace provide real-time quality observability, with events emitted for assessment completion, violation detection, remediation application, and threshold transitions across all four Quality Floor Guardian enforcement levels.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)