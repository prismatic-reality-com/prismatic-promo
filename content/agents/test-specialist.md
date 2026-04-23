+++
title = "test-specialist"
weight = 399
[extra]
domain = "development"
level = "L3"
description = "Comprehensive testing authority with intelligent test generation, coverage analysis, type-safe tests, pattern verification, and quality validation across the platform."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ecto", "phoenix", "liveview", "aiad", "ets", "hot-code-reload"]
domain_normalized = "development"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 83
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["test-specialist", "Comprehensive", "agents", "agent", "Prismatic Platform", "Testing", "The Test"]
tags = ["agents", "agent", "test-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "test-specialist - Prismatic Platform"
+++

## Overview

The Test Specialist is an L3 strategic command agent operating within the Prismatic Platform's development domain, serving as the comprehensive testing authority for the entire platform ecosystem. This agent provides intelligent test generation, coverage analysis, type-safe test verification, pattern validation, and quality assurance across all 90+ applications and their associated test suites. With over 5,500 test files in the platform, the Test Specialist ensures that testing practices remain consistent, comprehensive, and aligned with the platform's zero-defect quality standard.

Testing in the [BEAM](@/glossary/beam.md)/[OTP](@/glossary/otp.md) ecosystem presents unique challenges and opportunities. The actor model, message-passing concurrency, [supervision trees](@/glossary/supervision-tree.md), and [hot code reloading](@/glossary/hot-code-reload.md) require testing approaches that go beyond conventional unit and integration testing. The Test Specialist maintains expertise in all these areas, ensuring that tests validate not just functional correctness but also OTP behavioral contracts, concurrency safety, and fault tolerance properties. Under the [AIAD](@/glossary/aiad.md) standard and [No Mercy, No Doubts](@/glossary/no-mercy.md) doctrine, every test must be deterministic, meaningful, and production-quality.

## Theoretical Foundations

Software testing theory provides the intellectual foundation for the agent's approach. The testing hierarchy defined by the V-model connects each development phase to a corresponding test level: unit tests validate individual modules, integration tests validate module interactions, system tests validate end-to-end behavior, and acceptance tests validate business requirements. The Test Specialist ensures that each level is adequately represented in the platform's test portfolio.

The theory of structural coverage criteria, formalized by Zhu, Hall, and May, defines the standards for test adequacy. Statement coverage, branch coverage, and path coverage provide progressively stronger guarantees about the thoroughness of testing. The agent monitors coverage metrics across the platform and identifies areas where coverage gaps may conceal defects.

The concept of test oracle, from testing theory, addresses the fundamental question of how to determine whether test output is correct. The Test Specialist leverages multiple oracle types: specification-based oracles derived from type specifications and documentation, metamorphic oracles that verify relationships between different executions, and statistical oracles for property-based tests that verify distributional properties.

For OTP-specific testing, the agent draws from research on testing concurrent systems. The partial order reduction techniques, developed for model checking concurrent programs, inform strategies for test scheduling that expose concurrency defects. The agent generates test configurations that force specific interleaving patterns, increasing the probability of detecting race conditions and deadlocks.

## Core Capabilities

**Test Strategy Design** formulates comprehensive testing strategies for new applications and features, determining the appropriate mix of unit tests, integration tests, property-based tests, and end-to-end tests. Strategy design considers the application's architecture, risk profile, and the nature of its dependencies.

**Coverage Analysis and Gap Detection** continuously monitors test coverage across the platform, identifying modules, functions, and code paths that lack adequate test coverage. The agent distinguishes between meaningful coverage gaps (untested business logic) and acceptable gaps (generated code, boilerplate), focusing remediation efforts where they provide the most quality benefit.

**OTP-Aware Testing** verifies that [GenServer](@/glossary/genserver.md) modules, Supervisors, and other OTP components behave correctly under all lifecycle scenarios. This includes testing initialization, normal operation, error handling, shutdown, and supervision tree restart behavior. The agent generates tests that exercise OTP-specific behaviors such as timeout handling, info message processing, and state recovery after process restart.

**[Phoenix](@/glossary/phoenix.md) and [LiveView](@/glossary/liveview.md) Testing** provides specialized testing support for the platform's web-facing components. This includes controller tests, channel tests, LiveView mount and event handling tests, and end-to-end browser tests using Wallaby or similar tools. The agent ensures that web component tests maintain the platform's performance standard of sub-250ms page loads.

**[Ecto](@/glossary/ecto.md) Data Layer Testing** verifies database interactions including schema validations, changeset logic, query correctness, and migration safety. The agent ensures that data layer tests use sandboxed database connections for isolation and that migration tests verify both forward and rollback paths.

**Pattern Verification** validates that test code itself follows established patterns and best practices. The agent detects testing anti-patterns such as tests that depend on execution order, tests that share mutable state, tests that use excessive mocking, and tests with unclear or misleading names.

## Architecture and Implementation

The Test Specialist operates as a supervised [OTP](@/glossary/otp.md) process within the development domain, maintaining a comprehensive model of the platform's testing landscape.

| Component | Function | Implementation |
|-----------|----------|---------------|
| Coverage Analyzer | Track and analyze test coverage metrics | ExUnit coverage integration |
| Strategy Engine | Design application-appropriate test strategies | Rule-based strategy selection |
| OTP Test Verifier | Validate OTP-specific test patterns | AST analysis of test modules |
| Performance Monitor | Track test execution time and identify slow tests | Telemetry-based timing |
| Quality Assessor | Evaluate test suite quality and effectiveness | Multi-metric quality scoring |
| Pattern Validator | Detect testing anti-patterns | Pattern matching on test ASTs |

The coverage analyzer maintains a real-time coverage map that is updated after every test execution. This map identifies coverage trends, newly introduced gaps, and areas where coverage has improved. The analyzer integrates with ExUnit's built-in coverage tracking and extends it with function-level and branch-level coverage analysis.

## Testing Levels and Standards

The agent enforces testing standards appropriate to each testing level.

| Level | Standard | Enforcement |
|-------|----------|-------------|
| Unit Tests | Every public function tested, edge cases covered | Coverage threshold |
| Integration Tests | Inter-module interactions verified | Integration test suite required |
| Property Tests | Behavioral invariants verified across random inputs | Property tests for stateful modules |
| Performance Tests | Response time benchmarks verified | Benchee tests for critical paths |
| End-to-End Tests | User-facing workflows verified | Wallaby tests for LiveView pages |

Each testing level has defined minimum standards that must be met before changes are accepted. The agent integrates with the platform's quality gates to block changes that reduce test coverage or introduce testing anti-patterns.

## Test Quality Metrics

The agent tracks quantitative metrics that assess the health and effectiveness of the platform's test portfolio.

| Metric | Current Status | Target |
|--------|---------------|--------|
| Test Pass Rate | 100% | 100% (blocking) |
| Line Coverage | Platform-wide tracking | Application-specific thresholds |
| Test Execution Time | Monitored per suite | Under 60 seconds for unit suites |
| Flaky Test Rate | Zero tolerance | 0% (blocking) |
| Test-to-Code Ratio | Monitored per application | Minimum 1:1 for critical modules |

Flaky tests, those that produce non-deterministic results, are treated as critical defects requiring immediate investigation. The agent's flaky test detector identifies tests that produce different results across multiple runs and flags them for root cause analysis and remediation.

## Integration Points

| System | Integration Purpose | Data Flow |
|--------|-------------------|-----------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Agent lifecycle and task dispatch | Bidirectional |
| [Prismatic Telemetry](@/glossary/telemetry.md) | Test execution metrics and events | Write |
| [AIAD Registry](@/glossary/registry-otp.md) | Agent specification and discovery | Read |
| [SEADF](@/glossary/seadf.md) | Testing effectiveness evolution | Bidirectional |
| [ETS](@/glossary/ets.md) | Coverage data caching | Read/Write |
| Git Hooks | Pre-commit test execution | Blocking gate |
| ExUnit | Test framework integration | Bidirectional |

## Related Agents

The Test Specialist works closely with the [test-generator-agent](@/agents/test-generator-agent.md), which produces automated tests that the specialist validates and integrates. The [systematic-verifier](@/agents/systematic-verifier.md) executes the test suites as part of its verification protocol. The [type-inference-debugger](@/agents/type-inference-debugger.md) contributes type-level insights that improve test generation targeting.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)