+++
title = "Code Review Specialist Agent v2.0"
weight = 86
[extra]
domain = "primary-producer"
level = "L3"
description = "Provides comprehensive automated code review capabilities with multi-dimensional analysis spanning correctness, security, performance, maintainability, and OTP pattern compliance for all Elixir code changes across the 90-application umbrella architecture."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "professional"
glossary_terms = ["aiad", "seadf", "mycelial-network", "otp", "no-doubts", "genstage", "telemetry", "phoenix", "no-mercy", "liveview", "credo", "dialyzer", "genserver", "pattern-matching"]
domain_normalized = "primary"
content_version = "2.1.0"
last_enhanced = "2026-02-16"
word_count = 2100
quality_score = 92
keywords = ["code review", "automated review", "security analysis", "OTP compliance", "correctness verification", "multi-dimensional analysis"]
tags = ["prismatic", "agent", "code-review", "primary-domain", "quality-assurance"]
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "Code Review Specialist Agent v2.0 - Prismatic Platform"
+++

## Executive Summary

The Code Review Specialist Agent v2.0 operates as an L3 [strategic command](/glossary/strategic-command/) agent within the Primary Producer domain of the Prismatic Platform. This agent provides comprehensive automated code review capabilities with multi-dimensional analysis spanning correctness verification, security vulnerability detection, performance assessment, maintainability evaluation, and [OTP](/glossary/otp/) pattern compliance checking. As the v2.0 evolution, this agent represents a significant advancement over basic lint-and-format review, incorporating semantic analysis that understands Elixir/OTP conventions, Prismatic Platform patterns, and the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) quality expectations.

In a platform generating hundreds of code changes daily across 90 umbrella applications, automated code review is essential for maintaining quality velocity. Manual review cannot scale to the platform's change rate while providing the deep, consistent analysis that complex Elixir/OTP code requires. The Code Review Specialist v2.0 provides instant, comprehensive feedback on every code change, identifying issues that range from compilation warnings (caught by Credo) through type errors (caught by Dialyzer) to semantic problems (incorrect OTP patterns, missing supervision tree integration, unsafe map access) that require platform-specific knowledge.

## Architecture

The Code Review Specialist v2.0 implements a five-dimensional review architecture.

```
+----------------------------------------------------------------------+
|         Code Review Specialist v2.0 (L3)                             |
+----------------------------------------------------------------------+
|  Correctness Dimension                                                |
|  +--------------------+  +--------------------+  +------------------+ |
|  | Type Analysis      |  | Logic Verification |  | Edge Case Detect | |
|  | (Dialyzer + specs) |  | (Pattern coverage) |  | (Boundary check) | |
|  +--------+-----------+  +--------+-----------+  +--------+---------+ |
|                                                                       |
|  Security Dimension                                                   |
|  +--------------------+  +--------------------+  +------------------+ |
|  | Input Validation   |  | Secret Detection   |  | Injection Check  | |
|  +--------+-----------+  +--------+-----------+  +--------+---------+ |
|                                                                       |
|  Performance Dimension                                                |
|  +--------------------+  +--------------------+  +------------------+ |
|  | Complexity Check   |  | Memory Analysis    |  | Concurrency Rev. | |
|  +--------+-----------+  +--------+-----------+  +--------+---------+ |
|                                                                       |
|  Maintainability Dimension                                            |
|  +--------------------+  +--------------------+  +------------------+ |
|  | Naming Standards   |  | Documentation Cov. |  | Test Companion   | |
|  +--------+-----------+  +--------+-----------+  +--------+---------+ |
|                                                                       |
|  OTP Compliance Dimension                                             |
|  +--------------------+  +--------------------+  +------------------+ |
|  | Pattern Verify     |  | Supervision Check  |  | Error Handling   | |
|  +--------+-----------+  +--------+-----------+  +--------+---------+ |
+----------------------------------------------------------------------+
```

Each dimension provides independent review signals that are aggregated into a comprehensive review report. The multi-dimensional approach ensures that no single quality aspect dominates the review, and that changes are evaluated holistically.

## Operational Domain

The Primary Producer domain covers agents that generate direct value through code production and quality assurance. The Code Review Specialist v2.0 serves as the quality assurance gate for all code changes, providing the review layer between code generation (by human developers or AI agents) and code acceptance into the codebase.

The review domain understands the platform's unique quality requirements. The platform's meta-rule -- "if the same solution could be written identically in Node.js, it's wrong" -- guides review of OTP pattern usage. Generic imperative solutions that do not leverage BEAM concurrency, supervision, or pattern matching are flagged for redesign. This platform-specific intelligence distinguishes the v2.0 specialist from generic code review tools.

## Core Capabilities

**Correctness Verification** combines [Dialyzer](/glossary/dialyzer/) type analysis, [pattern matching](/glossary/pattern-matching/) coverage assessment, and edge case detection. Type analysis identifies type mismatches that would cause runtime errors. Pattern matching coverage ensures that function clause heads cover all expected input shapes. Edge case detection identifies boundary conditions (empty lists, nil values, large inputs) that are not handled.

**Security Vulnerability Detection** scans for common Elixir security issues including unsafe atom creation from user input, SQL injection through string interpolation in Ecto queries, secret material in source code, and insecure external HTTP calls. The security review layer maintains awareness of OWASP Top 10 vulnerabilities adapted to the Elixir ecosystem.

**Performance Assessment** evaluates code changes for performance implications: unnecessary enumeration of large collections, missing database query optimization, excessive process spawning, inefficient ETS access patterns, and the platform's known CASCADE anti-patterns (`length() > 0` instead of `!= []`, `Process.sleep` instead of OTP timers).

**OTP Pattern Compliance** verifies that code changes follow proper OTP conventions: GenServer implementations with correct callback structures, Supervisor child spec definitions, proper use of Task and Agent abstractions, and correct error handling with `{:ok, _}` / `{:error, _}` tuples. Code that could be written identically in a non-OTP language is flagged for OTP-native redesign.

**Maintainability Evaluation** checks naming conventions (no Manager/Handler/Utils/Helper names), documentation completeness (@doc and @moduledoc presence), test companion existence, function complexity limits, and module cohesion. The evaluation ensures that accepted code maintains the platform's long-term maintainability standards.

## Implementation

```elixir
defmodule PrismaticCode.ReviewSpecialist do
  @moduledoc """
  L3 Strategic Command agent providing comprehensive
  multi-dimensional automated code review.
  """

  use GenServer

  alias PrismaticCode.Review.{Correctness, Security, Performance}
  alias PrismaticCode.Review.{Maintainability, OTPCompliance}

  defstruct [:review_config, :rule_registry, :review_history]

  @spec review(map()) :: {:ok, map()} | {:error, term()}
  def review(change_set) do
    GenServer.call(__MODULE__, {:review, change_set}, :timer.minutes(2))
  end

  @impl true
  def handle_call({:review, change_set}, _from, state) do
    dimensions = [
      Task.async(fn -> Correctness.analyze(change_set) end),
      Task.async(fn -> Security.scan(change_set) end),
      Task.async(fn -> Performance.assess(change_set) end),
      Task.async(fn -> Maintainability.evaluate(change_set) end),
      Task.async(fn -> OTPCompliance.verify(change_set) end)
    ]

    results = Enum.map(dimensions, &Task.await(&1, :timer.seconds(30)))

    report = aggregate_review(results, change_set)
    {:reply, {:ok, report}, log_review(state, report)}
  end
end
```

## Authority Level

**L3** -- Strategic Command -- Multi-domain coordination with authority over code acceptance decisions, review standard enforcement, and quality gate integration across the platform.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [code-quality-commander](/agents/code-quality-commander/) | Quality Authority | Defines quality standards that the review specialist enforces |
| [code-specialist](/agents/code-specialist/) | Generation Partner | Reviews code produced by the code generation specialist |
| [code-consolidation-specialist-agent](/agents/code-consolidation-specialist-agent/) | Consolidation Review | Reviews consolidation refactoring for correctness |
| [code-reconnaissance-specialist](/agents/code-reconnaissance-specialist/) | Context Provider | Provides architectural context for review assessments |

## Operational Workflow

**Phase 1 -- Change Analysis**: The review specialist receives a change set (files modified, diff content) and classifies changes by type (new code, modification, refactoring, deletion).

**Phase 2 -- Parallel Dimensional Review**: All five review dimensions execute in parallel on the change set, each producing independent findings.

**Phase 3 -- Finding Aggregation**: Dimensional findings are aggregated, deduplicated, and prioritized by severity and impact.

**Phase 4 -- Report Generation**: A comprehensive review report is produced with categorized findings, suggested fixes, and an overall review verdict (approve, request changes, block).

**Phase 5 -- Feedback Integration**: Review findings are formatted for integration with GitLab merge request comments, pre-commit hook output, and developer tooling.

## Performance Metrics

| Metric | Target | Measured |
|--------|--------|----------|
| Review latency | < 30s | 18s |
| Security finding accuracy | > 95% | 97% |
| False positive rate | < 5% | 3.2% |
| OTP pattern detection | > 90% | 94% |
| Review coverage (files reviewed) | 100% | 100% |
| Developer satisfaction | > 80% | 85% |

## NABLA Compliance

**Signal Plurality**: Review verdicts draw from five independent analysis dimensions. No single dimension can override the aggregate assessment. This multi-signal approach prevents narrow review perspectives from missing cross-cutting issues.

**Provenance Mandatory**: Every review finding carries provenance linking it to the specific review rule, the code location, and the analysis algorithm that detected it.

## Enforcement

Code review operates under [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine. All code changes undergo review before acceptance. Security findings of medium severity or higher block code acceptance. OTP pattern violations require remediation before merge. No code enters the repository without passing all five review dimensions.

## Related Resources

- [code-quality-commander](/agents/code-quality-commander/) -- Quality enforcement
- [code-specialist](/agents/code-specialist/) -- Code generation
- [code-reconnaissance-specialist](/agents/code-reconnaissance-specialist/) -- Codebase intelligence
- [Quality Gates](/capabilities/quality-gates/) -- Quality enforcement
- [AIAD Standard](/glossary/aiad/) -- Agent design specification

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)