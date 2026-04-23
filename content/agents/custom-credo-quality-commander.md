+++
title = "custom-credo-quality-commander"
weight = 110
[extra]
domain = "prismatic-specific"
level = "L3"
description = "Custom Credo check development and enforcement, ensuring platform-specific quality rules are maintained through automated static analysis with Lean4 formal verification backing."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "telemetry", "lean4", "credo", "quality-gates", "dialyzer"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1900
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["custom-credo-quality-commander", "Custom", "Credo", "Lean4", "agents", "agent", "Prismatic Platform", "Check"]
tags = ["agents", "agent", "custom-credo-quality-commander", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "custom-credo-quality-commander - Prismatic Platform"
+++

## Overview

The Custom [Credo](/glossary/credo/) Quality Commander operates as an L3 [strategic command](/glossary/strategic-command/) agent within the Prismatic Specific domain of the Prismatic Platform. This agent develops, maintains, and enforces custom Credo checks that encode platform-specific quality rules not covered by the standard Credo rule set. These custom checks are backed by five core [Lean4](/glossary/lean4/) theorems that formally guarantee safe evolution, ensuring that quality rules do not introduce false positives, do not miss known anti-patterns, and maintain consistency across platform updates.

Static analysis through Credo is a cornerstone of the platform's quality enforcement strategy. While standard Credo checks address general Elixir code quality, the Prismatic Platform's 90-app umbrella architecture, OTP-heavy design patterns, and domain-specific conventions require additional rules that understand the platform's unique patterns and anti-patterns. The Custom Credo Quality Commander fills this gap by creating checks that enforce platform-specific conventions such as proper supervision tree structure, correct telemetry event naming, mandatory typespec coverage, and safe map access patterns.

The commander ensures that custom checks evolve alongside the platform. As new anti-patterns are discovered through production incidents or code review, the commander encodes them as automated Credo checks that prevent recurrence. This continuous evolution of the quality rule set transforms individual quality lessons into permanent platform protections.

## Custom Check Architecture

Custom Credo checks in the Prismatic Platform follow a standardized architecture that ensures consistency, testability, and maintainability across the growing check library.

Each custom check is implemented as an Elixir module that implements the `Credo.Check` behavior, providing standardized interfaces for check execution, issue reporting, and configuration management. The commander enforces a module naming convention that groups checks by category: `PrismaticCredo.Check.Safety.*` for safety-critical patterns, `PrismaticCredo.Check.Performance.*` for performance anti-patterns, `PrismaticCredo.Check.Convention.*` for platform conventions, and `PrismaticCredo.Check.Design.*` for design principle enforcement.

Check implementation uses AST (Abstract Syntax Tree) pattern matching to identify code patterns that violate platform rules. The commander maintains a library of AST matching utilities that simplify the development of new checks by providing reusable matchers for common Elixir patterns such as function definitions, pipe chains, module attribute declarations, and OTP callback implementations.

Configuration management allows checks to be customized per application within the umbrella. Some applications may legitimately need exceptions to platform-wide rules, and the configuration system supports targeted overrides while maintaining visibility into which applications deviate from the default rule set and why.

## Core Quality Rules

The commander enforces several categories of platform-specific quality rules that address the most common sources of quality issues in the Prismatic codebase.

Safety checks prevent code patterns that have been identified as sources of runtime failures. Unsafe map access patterns (using `map.key` instead of `Map.get/3` or pattern matching) are flagged because they raise KeyError on missing keys, which is a frequent source of production crashes. Process.sleep usage is flagged because it indicates timing-dependent logic that should use proper OTP mechanisms. String.to_atom and String.to_integer with untrusted input are flagged because they can cause atom table exhaustion or crash on malformed input.

Performance checks identify code patterns that cause unnecessary resource consumption. N+1 query patterns in Ecto are detected through analysis of query construction within enumeration functions. Unbounded list operations that load entire database tables into memory are flagged. Excessive logger calls in hot paths are identified. Missing ETS lookups where repeated database queries could be replaced with cached values are suggested.

Convention checks enforce platform standards that maintain codebase consistency. Module documentation requirements ensure that all public modules include `@moduledoc`. Typespec coverage rules require `@spec` annotations on all public functions. Telemetry event naming conventions ensure consistent event namespaces. Supervision tree structure rules verify that supervisors follow established patterns.

Design checks enforce architectural principles. Direct database access bypassing Ecto repositories is flagged. Cross-application dependencies that violate the umbrella dependency graph are identified. GenServer callbacks that perform blocking operations are detected. Improper error handling patterns that swallow errors or return bare `:ok` from error-prone operations are flagged.

## Lean4 Formal Verification

The five core Lean4 theorems provide formal guarantees about the custom check system's behavior, ensuring that quality rule evolution does not introduce regressions.

The Soundness Theorem proves that every issue reported by a custom check represents a genuine violation of the encoded rule. This guarantee eliminates false positives that would erode developer trust in the quality system. The proof operates over the AST matching logic, verifying that matching patterns correspond precisely to the rule definitions.

The Completeness Theorem proves that for each encoded rule, the corresponding check will detect all violations within its scope. This guarantee ensures that known anti-patterns cannot bypass detection through code restructuring that preserves the problematic behavior while evading the check's AST patterns.

The Monotonicity Theorem proves that adding new checks to the rule set does not invalidate the results of existing checks. This guarantee ensures that quality rule evolution is strictly additive -- new rules provide additional protection without interfering with existing protection.

The Stability Theorem proves that check results are deterministic -- running the same check against the same code always produces the same result regardless of execution context, check ordering, or platform state. This guarantee is essential for CI/CD integration where check results must be reproducible.

The Composability Theorem proves that combining multiple checks does not produce emergent false positives or false negatives that would not occur with individual check execution. This guarantee ensures that the check suite behaves predictably as its size grows.

## Check Development Workflow

The commander manages a structured workflow for developing and deploying new custom checks that ensures quality and reliability.

Check specification begins with a formal description of the anti-pattern or convention to be enforced, including positive examples (code that should pass), negative examples (code that should fail), and edge cases (ambiguous code where the desired behavior must be explicitly defined). This specification serves as the check's requirements document and test suite foundation.

Implementation follows the specification, using the AST matching utilities to create the check logic. The commander requires that implementation preserves the specification's examples as test cases, ensuring that the check behaves as specified for all documented scenarios.

Testing extends beyond the specification examples to include property-based testing that generates random code structures and verifies that the check does not produce false positives on valid code. The testing suite also includes regression tests from previously discovered check defects.

Deployment introduces new checks in warning mode initially, reporting violations without blocking CI/CD pipelines. After a stabilization period during which false positive reports are investigated and addressed, the check is promoted to error mode where violations block pipeline progression. This graduated deployment prevents new checks from disrupting development workflow.

## Integration with Quality Infrastructure

The custom Credo checks integrate with the broader quality infrastructure to provide comprehensive quality enforcement.

CI/CD pipeline integration runs custom checks as part of the `mix credo --strict` phase, ensuring that every code change is evaluated against the full custom rule set before merge. Check failures produce clear, actionable error messages that explain the violation, reference the relevant documentation, and suggest the correct pattern.

[Dialyzer](/glossary/dialyzer/) coordination ensures that custom Credo checks and Dialyzer type analysis provide complementary rather than redundant coverage. The commander maintains a coverage map that identifies which quality aspects are handled by Credo checks, which by Dialyzer, and which require both. This coordination prevents gap and overlap in the quality analysis.

Quality gate integration connects custom check results to the platform's quality gate system, which aggregates quality metrics from multiple sources into composite quality scores. Custom check pass rates contribute to the overall quality score that determines deployment eligibility.

Pre-commit hook integration runs the most critical custom checks during local development, catching violations before code is committed. The hook runs a subset of checks selected for their high violation frequency and low execution time, providing rapid feedback without slowing the development cycle.

## Authority Level

**L3** - [Strategic Command](/glossary/strategic-command/) - Multi-domain coordination and specialized operational command with authority to define custom quality rules, manage the custom check library, and mandate check compliance across all platform applications.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [quality-floor-guardian](/glossary/quality-floor-guardian/) | Quality Monitoring | Monitors aggregate check pass rates and triggers alerts on quality regression |
| [cross-domain-quality-propagator](/agents/cross-domain-quality-propagator/) | Quality Propagation | Ensures quality standards propagate consistently across domain boundaries |
| [elixir-architect](/agents/elixir-architect/) | Architecture Review | Provides architectural context for design-level quality checks |

## Enforcement

All custom Credo quality operations are governed by the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine. No custom check is deployed without formal specification, comprehensive testing, and graduated rollout. Lean4 theorems must be maintained as the check library evolves -- any change that would invalidate a theorem is rejected. Check bypass mechanisms are forbidden. False positive reports are investigated within 24 hours and resolved through check refinement or documented exception. The quality rule set is treated as safety-critical infrastructure and receives the same change management rigor as production code.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)