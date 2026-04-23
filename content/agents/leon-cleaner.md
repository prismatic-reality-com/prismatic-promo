+++
title = "leon-cleaner"
weight = 217
[extra]
domain = "tactical-specialist"
level = "L4"
description = "Surgical code cleanup and technical debt elimination specialist with precision refactoring and zero-trace remediation capabilities"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "seadf", "telemetry", "lean4", "cascade", "qdp"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["leon-cleaner", "Surgical", "agents", "agent", "Prismatic Platform", "CASCADE", "Complexity", "AIAD", "MERCY"]
tags = ["agents", "agent", "leon-cleaner", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "leon-cleaner - Prismatic Platform"
+++

## Overview

The leon-cleaner is an L4 tactical specialist agent operating within the Prismatic Platform's code maintenance domain. Named after the concept of a professional cleaner who leaves no trace, this agent specializes in surgical code cleanup operations -- removing dead code, eliminating technical debt, refactoring anti-patterns, and sanitizing codebases with the precision and thoroughness that leaves the codebase in measurably better condition than before intervention. Every cleanup operation is designed to be invisible in its execution (no behavioral changes to the system) while being clearly beneficial in its outcome (reduced complexity, improved maintainability, better performance).

Built on the [AIAD](/glossary/aiad/) standard and operating under the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine, the leon-cleaner embodies the principle that code hygiene is not optional -- it is a continuous obligation. Technical debt accumulates through rushed implementations, evolving requirements, abandoned features, and incremental patches that address symptoms rather than root causes. Left unaddressed, this debt compounds into a maintenance burden that progressively degrades development velocity and system reliability. The leon-cleaner prevents this accumulation through systematic, evidence-based cleanup campaigns.

## Cleanup Operation Categories

The leon-cleaner operates across several categories of code cleanup, each with specialized detection heuristics and remediation strategies.

**Dead code elimination** identifies and removes code that is never executed. This includes unreachable branches (code after unconditional returns, impossible pattern matches), unused functions (functions with no callers in the current codebase), abandoned feature implementations (code behind permanently disabled feature flags), and obsolete test fixtures (test helpers and factories for removed features). Detection combines static analysis (call graph analysis, reachability analysis) with dynamic analysis (runtime coverage measurement) to minimize false positive identification of dead code.

**Anti-pattern remediation** identifies code patterns that, while functional, violate the platform's coding standards or represent suboptimal implementations. Common anti-patterns include the [CASCADE](/glossary/cascade/) patterns (Type Mismatch, Dead Code, Empty Check, Timer Replacement, Nuclear Cache), unsafe map access patterns (`map.field` instead of `Map.get/2`), missing `@spec` annotations, `Process.sleep` usage in non-test code, and `length() > 0` checks that should be `Enum.any?/1` or pattern matches against `[_ | _]`.

**Duplication reduction** identifies functionally equivalent code blocks that should be consolidated into shared abstractions. The agent distinguishes between incidental duplication (code that happens to look similar but serves different purposes) and essential duplication (code that is genuinely redundant and should be unified), using semantic analysis rather than purely syntactic comparison.

**Complexity reduction** identifies functions, modules, and workflows that exceed complexity thresholds and could benefit from decomposition. Complexity is measured through multiple lenses: cyclomatic complexity (control flow branching), cognitive complexity (nesting depth and mental effort to understand), and coupling complexity (dependency count and fan-out).

## Key Capabilities

- **Dead code detection and removal** -- Identifies unreachable code, unused functions, abandoned features, and obsolete test fixtures using combined static and dynamic analysis
- **[CASCADE](/glossary/cascade/) pattern elimination** -- Detects and remediates all five CASCADE anti-pattern categories with automated fix application
- **Code duplication analysis** -- Identifies semantically redundant code blocks and generates consolidation proposals with shared abstraction designs
- **Complexity reduction** -- Decomposes complex functions and modules into smaller, focused components that improve readability and testability
- **Safe refactoring** -- Applies behavior-preserving transformations with automated test validation to ensure zero behavioral regression
- **[Quality debt](/glossary/quality-debt/) tracking** -- Maintains an inventory of identified cleanup opportunities with prioritization based on maintenance impact and remediation effort
- **Batch cleanup campaigns** -- Executes coordinated cleanup operations across multiple modules or applications with progress tracking and rollback capability
- **[Autonomous operation](/capabilities/autonomous-self-healing/)** with continuous code quality scanning
- **[Telemetry integration](/capabilities/telemetry-integration/)** for cleanup impact measurement and quality trend tracking

## Cleanup Methodology

The leon-cleaner follows a rigorous methodology for every cleanup operation to ensure that beneficial intent never produces harmful outcomes.

**Assessment phase**: The agent analyzes the target code to identify cleanup opportunities, classify them by category and severity, and estimate the remediation effort and risk for each. The assessment produces a prioritized cleanup plan that balances impact against risk.

**Isolation phase**: Before making changes, the agent ensures that the cleanup target has adequate test coverage. If test coverage is insufficient to validate behavioral preservation, the agent either generates supplementary tests or flags the cleanup as requiring manual intervention. No cleanup proceeds without a validation mechanism.

**Execution phase**: Changes are applied incrementally, with each individual transformation small enough to be independently reviewed and tested. The agent commits changes in logical units that each preserve system behavior, enabling fine-grained rollback if any transformation produces unexpected effects.

**Verification phase**: After cleanup, the agent runs the full test suite for affected modules, verifies that compilation produces zero warnings, checks that static analysis (Dialyzer, Credo) reports no regressions, and confirms that performance benchmarks show no degradation. Only cleanups that pass all verification checks are retained.

## Authority Level

**L4** - Domain Authority - Specialized domain expertise for tactical code cleanup operations. The L4 designation reflects the agent's role as a tactical specialist that operates within defined scope boundaries, executing cleanup operations directed by higher-authority agents or user requests.

## Integration Architecture

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Runtime execution and lifecycle management |
| Quality Gates | Cleanup verification through static analysis and compilation checks |
| Prismatic Safety | Quality floor guardian integration for cleanup impact tracking |
| [GitLab CI](/glossary/gitlab-ci/)/CD | Automated cleanup validation in CI/CD pipelines |
| Prismatic Telemetry | Cleanup [metrics](/glossary/metrics/): lines removed, complexity reduced, debt eliminated |
| [SEADF](/glossary/seadf/) | Autonomous evolution of cleanup detection heuristics |
| AIAD [Registry](/glossary/registry-otp/) | Agent specification and discovery |

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/clean scan <path>` | Scan code at the specified path for cleanup opportunities | L4+ |
| `/clean execute <plan_id>` | Execute a cleanup plan generated by a previous scan | L4+ |
| `/clean cascade <path>` | Run CASCADE pattern elimination on the specified path | L4+ |
| `/clean dead-code <app>` | Identify and remove dead code in the specified application | L4+ |
| `/clean report` | Generate cleanup campaign report with impact metrics | L3+ |

## Coordination with Quality Agents

| Agent | Relationship |
|-------|-------------|
| [**cascade-quality-specialist**](/agents/cascade-quality-specialist/) (L3) | Coordinates CASCADE pattern elimination campaigns across the platform |
| [**hbfs-quality-evolution**](/agents/hbfs-quality-evolution/) (L3) | Drives quality evolution that generates cleanup targets for the leon-cleaner |
| [**documentation-verifier**](/agents/documentation-verifier/) (L3) | Verifies that cleanup operations do not invalidate existing documentation |
| [**ir-linter**](/agents/ir-linter/) (L3) | Provides quality analysis that identifies cleanup opportunities in IR workflows |

## Impact Measurement

The leon-cleaner tracks comprehensive impact metrics for every cleanup campaign. Lines of code removed (LOC reduction), cyclomatic complexity reduction, coupling coefficient improvement, and test coverage changes are captured and reported. These metrics demonstrate the concrete value of code hygiene and justify the investment in cleanup operations. Historical trends show cumulative improvement trajectories that reflect the platform's commitment to sustainable code quality.

## Enforcement

The [NO MERCY](/glossary/no-mercy/) doctrine requires that identified cleanup opportunities are addressed, not deferred. The leon-cleaner tracks cleanup backlog size and escalates when the backlog exceeds configurable thresholds. The [NO DOUBTS](/glossary/no-doubts/) principle requires that every cleanup operation is verified to be behavior-preserving -- no cleanup is applied without evidence that system behavior is unchanged.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)