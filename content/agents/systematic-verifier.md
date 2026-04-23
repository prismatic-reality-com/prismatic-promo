+++
title = "systematic-verifier"
weight = 392
[extra]
domain = "quality"
level = "L3"
description = "Platform-wide impact analysis, three-stage verification protocol, regression detection, and comprehensive audit reporting with genetic enhancements for advanced verification capabilities."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["qdp", "cascade", "no-mercy", "no-doubts", "trinity-gate", "aiad", "property-based-testing", "telemetry", "seadf", "ecto"]
domain_normalized = "quality"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2150
quality_score = 84
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["systematic-verifier", "Platform-wide", "agents", "agent", "Prismatic Platform", "Stage", "Blocking", "Systematic Verifier"]
tags = ["agents", "agent", "systematic-verifier", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "systematic-verifier - Prismatic Platform"
+++

## Overview

The Systematic Verifier is an L3 strategic command agent operating within the Prismatic Platform's quality domain, providing platform-wide impact analysis, a three-stage verification protocol, regression detection, and comprehensive audit reporting. Genetically enhanced through the platform's evolutionary process, this agent represents one of the most sophisticated verification capabilities in the ecosystem, capable of assessing the ripple effects of changes across 90+ applications and 430+ agents with deterministic thoroughness.

In a platform where zero quality defects is the standard (current [QDP](@/glossary/qdp.md) count: 0), the Systematic Verifier serves as the primary guardian against quality regression. Every code change, configuration update, and evolutionary modification passes through this agent's verification pipeline before reaching production. Operating under the [AIAD](@/glossary/aiad.md) standard and the [No Mercy, No Doubts](@/glossary/no-mercy.md) doctrine, the agent treats any verification shortcut or incomplete analysis as a categorical violation that blocks the change pipeline.

## Theoretical Foundations

Systematic verification draws from formal methods, software testing theory, and quality assurance engineering. The theoretical basis combines Dijkstra's structured programming verification concepts with modern property-based testing approaches pioneered by Claessen and Hughes in QuickCheck. The agent's three-stage verification protocol reflects the complementary relationship between static analysis (proving absence of certain defect classes), dynamic testing (detecting defects through execution), and runtime verification (monitoring for violations during operation).

Impact analysis theory, developed in the software maintenance research community, provides the framework for understanding how changes propagate through complex systems. The agent implements dependence analysis at multiple granularity levels: module-level dependencies (which applications are affected), function-level dependencies (which call chains are impacted), and data-level dependencies (which data flows are modified). This multi-granularity analysis ensures that verification effort is focused on the areas most likely to be affected by a given change.

The [CASCADE](@/glossary/cascade.md) pattern library captures verified solutions for recurring quality defect patterns. The Systematic Verifier maintains expertise in all CASCADE pattern categories (Type Mismatch, Dead Code, Empty Check, Timer Replacement, Nuclear Cache) and applies targeted verification for each pattern type when changes touch areas with historical susceptibility.

The [Trinity Gate](@/glossary/trinity-gate.md) verification system provides the formal framework for the agent's three-stage protocol, mapping directly to structural consistency, logical consistency, and formal necessity checks.

## Core Capabilities

**Platform-Wide Impact Analysis** traces the effects of proposed changes through the platform's dependency graph, identifying all applications, modules, and functions that may be directly or transitively affected. The analysis produces an impact report that categorizes affected components by risk level and recommends the scope of verification effort required.

**Three-Stage Verification Protocol** implements a structured verification approach that proceeds through increasingly rigorous stages.

Stage 1 (Static Analysis) applies compile-time checks, Dialyzer type analysis, Credo style enforcement, and custom static analysis rules to detect defects that can be identified without execution. This stage catches type mismatches, unreachable code, missing implementations, and specification violations.

Stage 2 (Dynamic Testing) executes relevant test suites with coverage tracking, targeting both the changed code and all code identified as impacted by the change analysis. This stage includes unit tests, integration tests, and [property-based tests](@/glossary/property-based-testing.md) that verify behavioral invariants across randomized input spaces.

Stage 3 (Audit Verification) conducts a comprehensive audit of the verification results, checking for coverage gaps, untested edge cases, and quality metric regressions. This stage produces the final verification report that determines whether the change is approved for production.

**Regression Detection** continuously monitors quality metrics across the platform, detecting when changes cause previously passing quality checks to fail. The regression detection system maintains a baseline of all quality indicators and flags any degradation, regardless of how minor, for immediate investigation.

**Comprehensive Audit Reporting** generates detailed reports that document the verification process, results, and decision rationale for every verified change. These reports serve as audit artifacts for quality compliance and as learning data for the [SEADF](@/glossary/seadf.md) evolution framework.

## Architecture and Implementation

The Systematic Verifier operates as a supervised [OTP](@/glossary/otp.md) process with a pipeline architecture that implements the three-stage verification protocol.

| Component | Function | Implementation |
|-----------|----------|---------------|
| Impact Analyzer | Dependency graph traversal and risk assessment | Graph analysis engine |
| Static Verifier | Compile-time and type-level checking | Dialyzer + Credo integration |
| Dynamic Verifier | Test execution and coverage analysis | ExUnit runner with coverage |
| Audit Engine | Result synthesis and report generation | Structured report builder |
| Regression Monitor | Continuous quality metric tracking | ETS-backed baseline comparison |
| CASCADE Detector | Known defect pattern identification | Pattern matching engine |

The impact analyzer maintains a precomputed dependency graph derived from the platform's compilation artifacts. When a change is submitted for verification, the analyzer performs reachability analysis from the changed modules to identify the full impact zone. The graph is updated incrementally as the platform evolves, avoiding the cost of full recomputation for each verification cycle.

The dynamic verifier employs test selection algorithms that determine the minimum set of tests required to achieve coverage of the identified impact zone. This optimization reduces verification time while maintaining comprehensive coverage of affected code paths.

## Verification Protocol Detail

The three-stage protocol follows a strict progression where each stage must pass before the next begins.

| Stage | Checks Performed | Pass Criteria |
|-------|-----------------|---------------|
| Stage 1: Static | Compilation (zero warnings), Dialyzer (zero violations), Credo (strict mode) | All checks pass |
| Stage 2: Dynamic | Unit tests, integration tests, property tests, coverage analysis | All tests pass, coverage threshold met |
| Stage 3: Audit | Quality metric regression check, completeness verification, report generation | No regressions, complete audit trail |

The protocol includes mandatory regression test verification for bug fixes, enforcing the platform's absolute requirement that every bug fix includes tests that would have caught the original defect. This enforcement prevents the accumulation of untested fix-only patches that could silently regress in future changes.

## Quality Metric Tracking

The Systematic Verifier tracks a comprehensive set of quality metrics that define the platform's quality floor.

| Metric | Current Value | Threshold | Enforcement |
|--------|--------------|-----------|-------------|
| Compilation Warnings | 0 | 0 | Blocking |
| Dialyzer Violations | 0 | 0 | Blocking |
| Credo Violations | 0 | 0 | Blocking |
| QDP Count | 0 | 0 | Blocking |
| Test Pass Rate | 100% | 100% | Blocking |
| Type Specification Coverage | 100% | 95% | Warning at threshold |
| @impl Coverage | 709 callbacks | Monotonically increasing | Blocking on decrease |

The quality floor guardian integration ensures that no change can decrease any metric below its established threshold. Metrics that reach their target value establish a ratchet that prevents future regression, creating a monotonically improving quality trajectory.

## Integration Points

| System | Integration Purpose | Data Flow |
|--------|-------------------|-----------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Agent verification and lifecycle | Bidirectional |
| [Trinity Gate](@/glossary/trinity-gate.md) | Formal verification framework | Mandatory passage |
| [SEADF](@/glossary/seadf.md) | Evolution verification and quality tracking | Bidirectional |
| [Prismatic Telemetry](@/glossary/telemetry.md) | Verification metrics and events | Write |
| [AIAD Registry](@/glossary/registry-otp.md) | Agent specification verification | Read |
| [Ecto](@/glossary/ecto.md) | Database migration verification | Schema validation |
| Git Hooks | Pre-commit verification pipeline | Blocking gate |

## Operational Deployment

The Systematic Verifier operates in two modes: interactive (triggered by explicit verification requests) and continuous (background monitoring of quality metrics). In interactive mode, developers or other agents submit changes for verification and receive structured pass/fail results with detailed findings. In continuous mode, the agent monitors the platform's quality metrics stream and immediately flags any regression for investigation.

The agent's verification pipeline is integrated into the platform's git hook infrastructure, where pre-commit hooks trigger Stage 1 verification and pre-push hooks trigger the full three-stage protocol. This integration ensures that quality gates are enforced at every code submission point.

## Related Agents

The Systematic Verifier works closely with the [technical-debt-reduction-specialist](@/agents/technical-debt-reduction-specialist.md) to ensure that debt elimination does not introduce regressions. The [test-generator-agent](@/agents/test-generator-agent.md) produces tests that the verifier executes, and the [type-inference-debugger](@/agents/type-inference-debugger.md) resolves type-level issues identified during Stage 1 verification. The [swarm-evolution-coordinator-agent](@/agents/swarm-evolution-coordinator-agent.md) depends on the verifier to validate evolutionary changes.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)