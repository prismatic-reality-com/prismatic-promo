+++
title = "Prismatic Credo"
weight = 77
[extra]
icon = "check-circle"
color = "green"
description = "Enhanced Credo integration with custom checks and quality rule management"
category = "DevOps"
files = "70"
status = "Production"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1197
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Credo", "Enhanced", "apps", "DevOps", "Prismatic Platform", "PrismaticCredo", "Checks"]
tags = ["apps", "devops", "prismatic-credo", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Credo - Prismatic Platform"
+++

## Overview

Prismatic [Credo](/glossary/credo/) provides enhanced Credo integration with custom quality checks specific to the Prismatic Platform. It extends the standard Credo linter with platform-specific rules, enforces coding standards across all 90+ [umbrella application](/glossary/umbrella-application/)s, and manages the evolution of quality rules as the platform grows. Where stock Credo catches generic [Elixir](/glossary/elixir/) anti-patterns, Prismatic Credo enforces the architectural decisions and [OTP](/glossary/otp/) conventions that define the platform's [NO MERCY NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine. The module is central to maintaining the platform's perfect 100/100 quality score across 13 quality domains.

The module currently ships 28 custom checks covering areas that standard Credo does not address: [supervision tree](/glossary/supervision-tree/) topology, storage adapter [protocol](/glossary/protocol/) compliance, [NABLA](/glossary/nabla-infinity/) axiom annotation requirements, and naming conventions specific to the [AIAD](/glossary/aiad/) agent framework. Each check includes a detailed explanation and suggested fix, making it actionable rather than merely informative. The checks are designed to catch violations at development time rather than discovering them through runtime failures.

Prismatic Credo also manages rule evolution over time. As the platform introduces new patterns, Credo rules are versioned and updated to enforce the new standard while providing a grace period for migration of existing code. This evolution tracking ensures that quality standards advance with the platform rather than becoming stale.

## Architecture

```
.credo.exs Config --> CheckRegistry (GenServer) --> Check Execution --> Result Aggregation
       |                    |                          |                   |
  Umbrella Root        Active Checks Set           AST Analysis       Per-App Scores
  App Overrides        Priority Ordering           Pattern Match      Trend Tracking
  Version Tags         Category Groups             Source Location    Regression Alert
  Exception Rules      Override Resolution         Fix Suggestions    Dashboard Feed
```

The module wraps Credo's plugin architecture with a `PrismaticCredo.CheckRegistry` [GenServer](/glossary/genserver/) that maintains the active set of checks, their priorities, and per-application overrides. Checks are organized into four categories: Consistency (naming, formatting), Design (OTP patterns, protocol compliance), Readability (documentation, module structure), and Warning (potential bugs, unsafe patterns).

Check execution is parallelized across available CPU cores via [BEAM](/glossary/beam/) process spawning, with results aggregated by a collector process. [Telemetry](/glossary/telemetry/) events are emitted for each check run, feeding into the platform's quality observability pipeline.

## Key Modules

| Module | Responsibility |
|--------|----------------|
| `PrismaticCredo` | Public facade: `analyze/1`, `check_status/0`, check management API |
| `PrismaticCredo.Application` | OTP application entry point, supervisor tree initialization |
| `PrismaticCredo.CheckRegistry` | GenServer tracking active checks, priorities, and overrides |
| `PrismaticCredo.Checks.NoManagerSuffix` | Enforces forbidden naming patterns (Manager, Handler, Utils, Helper) |
| `PrismaticCredo.Checks.OtpPatternCompliance` | Validates proper GenServer, Supervisor, and Task usage |
| `PrismaticCredo.Checks.StorageAdapterCompliance` | Verifies storage adapters implement required PrismaticStorageCore behaviours |
| `PrismaticCredo.Checks.NablaAnnotation` | Ensures epistemic pipeline modules carry NABLA provenance annotations |
| `PrismaticCredo.RuleEvolution` | Versioned rule management with grace period tracking |

Custom checks enforce Prismatic naming conventions (no `Manager`, `Handler`, `Utils`, or `Helper` suffixes), OTP pattern compliance for proper GenServer, [Supervisor](/glossary/supervisor/), and Task usage, storage adapter protocol compliance against `PrismaticStorageCore` [behaviour](/glossary/behaviour/)s, and NABLA axiom annotation verification on [epistemic pipeline](/glossary/epistemic-pipeline/) modules.

## Custom Check Categories

The 28 custom checks are organized across four enforcement categories, each targeting a distinct quality dimension of the platform:

| Category | Checks | Focus Area | Severity |
|----------|--------|------------|----------|
| Consistency | 8 | Naming conventions, module structure, import ordering | High |
| Design | 10 | OTP patterns, supervision topology, protocol compliance | Critical |
| Readability | 5 | Documentation coverage, function length, module organization | Normal |
| Warning | 5 | Unsafe patterns, potential runtime errors, deprecated usage | High |

### Consistency Checks

Consistency checks enforce the platform's coding standards at the syntactic level. The `NoManagerSuffix` check prevents the proliferation of meaningless naming patterns that obscure module purpose. The `ImportOrdering` check ensures consistent module import structure across the codebase, making it easier for developers to navigate unfamiliar modules.

### Design Checks

Design checks represent the highest-value category, enforcing architectural decisions that would be difficult or impossible to catch through testing alone. The `OtpPatternCompliance` check verifies that stateful modules properly implement GenServer, Supervisor, or Agent behaviours rather than using raw process primitives. The `StorageAdapterCompliance` check ensures every storage adapter correctly implements the `PrismaticStorageCore.Adapter` behaviour, preventing runtime crashes from missing callback implementations.

### Warning Checks

Warning checks identify code patterns that are technically valid but likely to cause problems. These include unsafe [map](/glossary/pattern-matching/) access patterns (using `map.key` instead of `Map.get/2`), missing error handling on external service calls, and use of deprecated platform APIs that will be removed in future versions.

## Configuration

```elixir
# .credo.exs at umbrella root
%{
  configs: [
    %{
      name: "default",
      strict: true,
      checks: [
        # Prismatic custom checks
        {PrismaticCredo.Checks.NoManagerSuffix, priority: :high},
        {PrismaticCredo.Checks.OtpPatternCompliance, priority: :high},
        {PrismaticCredo.Checks.StorageAdapterCompliance, priority: :normal},
        {PrismaticCredo.Checks.NablaAnnotation, priority: :normal},
        {PrismaticCredo.Checks.ImportOrdering, priority: :normal},
        {PrismaticCredo.Checks.UnsafeMapAccess, priority: :high},
        {PrismaticCredo.Checks.MissingErrorHandling, priority: :high},
        {PrismaticCredo.Checks.SupervisionTopology, priority: :high}
      ]
    }
  ]
}
```

Per-application overrides are supported through app-level `.credo.exs` files. Rule exceptions require mandatory expiry dates preventing permanent waivers. This ensures that technical debt from exceptions is always time-bounded and revisited.

## API Reference

```elixir
# Run full Credo analysis with platform-specific checks
# mix credo --strict

# Programmatic access to check results
{:ok, results} = PrismaticCredo.analyze(:prismatic_perimeter)
# => %{issues: 0, checks_passed: 28, category_scores: %{consistency: 100, design: 100}}

# List all active custom checks
PrismaticCredo.CheckRegistry.list_checks()
# => [%Check{name: :no_manager_suffix, category: :consistency, priority: :high}, ...]

# Check status across all umbrella apps
{:ok, status} = PrismaticCredo.check_status()
# => %{apps_clean: 90, apps_with_issues: 0, total_issues: 0}

# Run only Prismatic-specific custom checks
# mix credo --checks-with-tag prismatic

# Generate JSON quality report for CI pipeline
# mix credo --strict --format json > quality_report.json

# Evolve a rule to a new version with grace period
PrismaticCredo.RuleEvolution.evolve(:no_manager_suffix, "2.0.0",
  grace_period: :timer.hours(168))
```

## Rule Evolution System

The rule evolution system addresses a practical challenge in large codebases: how to raise quality standards without breaking existing code. When a new check is introduced or an existing check is tightened, the evolution system provides a configurable grace period during which violations produce warnings instead of errors. This allows teams to migrate incrementally while ensuring that new code immediately adheres to the stricter standard.

```elixir
# Rule evolution lifecycle
# Phase 1: Introduction (grace period active, violations are warnings)
# Phase 2: Enforcement (grace period expired, violations are errors)
# Phase 3: Established (rule is permanent, no grace period metadata)

{:ok, evolution} = PrismaticCredo.RuleEvolution.status(:no_manager_suffix)
# => %{version: "2.0.0", phase: :enforcement, violations_remaining: 0}
```

Each rule version is tracked with its introduction date, grace period duration, and the count of remaining violations across the codebase. This data feeds into the platform's quality trend analysis, enabling predictions about when full compliance will be achieved for newly introduced rules.

## Testing

Check implementation tests verify that each custom check correctly identifies violations in crafted source code fixtures and does not false-positive on compliant code. CheckRegistry tests verify priority ordering, override resolution, and version tracking. Each check has a dedicated test module containing both positive (violation detected) and negative (clean code passes) test cases.

Integration tests run the full Credo suite against the actual platform codebase to verify zero violations. Regression tests ensure that previously clean modules remain clean across code changes. Property-based tests generate random valid Elixir modules to verify that no custom check produces false positives on syntactically valid code.

## Integration Points

| Application | Relationship |
|-------------|--------------|
| [Prismatic Safety](/apps/prismatic-safety/) | [Quality Floor Guardian](/glossary/quality-floor-guardian/) monitors Credo violation counts |
| [Prismatic Tidewave](/apps/prismatic-tidewave/) | AI-generated code validated against all 28 custom checks |
| [Prismatic Claude](/apps/prismatic-claude/) | Session lifecycle hooks run Credo on changed files |
| [Prismatic Quality Intelligence](/apps/prismatic-quality-intelligence/) | Credo scores feed into cross-domain quality correlation |
| [Prismatic Labs](/apps/prismatic-labs/) | Experimental checks prototyped before promotion |

Pre-commit hook enforcement blocks commits with any Credo violations. [GitLab CI](/glossary/gitlab-ci/) pipeline stage produces JSON quality reports for trend analysis. The quality enforcement pipeline ensures that no code with Credo violations reaches the main branch.

## NABLA Compliance

| NABLA Axiom | Credo Enforcement | Implementation |
|-------------|------------------|----------------|
| Provenance Mandatory | Custom check verifies NABLA annotation on epistemic modules | NablaAnnotation check enforces provenance metadata |
| Signal Plurality | Multiple independent checks provide quality signals | 28 checks across 4 categories provide independent assessment |
| Source Independence | Per-app overrides ensure independent evaluation | Application-level configuration isolation prevents cross-app contamination |
| Time Decay | Rule evolution tracks version timestamps | Every rule version carries introduction date and grace period metadata |
| Contradiction Preservation | Conflicting check results preserved in reports | Category-level and check-level results maintained independently |

Prismatic Credo serves as a quality enforcement mechanism that helps maintain NABLA compliance indirectly by catching code patterns that would violate epistemic framework requirements. The NablaAnnotation check specifically ensures that modules participating in the [epistemic pipeline](/glossary/epistemic-pipeline/) carry the required provenance metadata.

## Performance

| Operation | Latency | Notes |
|-----------|---------|-------|
| Full platform analysis | 30-60s | All 90+ apps in parallel |
| Single app analysis | 2-5s | Depends on codebase size |
| Check registry lookup | < 1ms | ETS-backed |
| Rule evolution query | < 1ms | In-memory state |
| CI pipeline integration | < 90s | Full analysis with JSON report generation |

Telemetry events: `[:prismatic, :credo, :check_run]`, `[:prismatic, :credo, :violation_found]`, `[:prismatic, :credo, :evolution_phase_change]`.

## Related Resources

- [Prismatic Safety](/apps/prismatic-safety/) -- Quality Floor Guardian monitors Credo compliance
- [Prismatic Tidewave](/apps/prismatic-tidewave/) -- Generated code validated against Credo rules
- [Prismatic Labs](/apps/prismatic-labs/) -- Experimental checks prototyped before promotion
- [Elixir Architect](/agents/elixir-architect/) -- Defines OTP and naming conventions that Credo custom checks enforce
- [CI/CD Guardrails Enforcer](/agents/cicd-guardrails-enforcer/) -- Ensures Credo gates are active in all CI pipeline configurations
- [DX Brutalist Analyst](/agents/dx-brutalist-analyst/) -- Developer experience analysis of Credo check messages
- [Quality Gates](/capabilities/quality-gates/) -- Credo as a mandatory quality gate in the pre-commit pipeline
- [AIAD Compliance](/capabilities/aiad-compliance/) -- Custom checks verify AIAD agent specification compliance
- [Regression Tests](/capabilities/regression-tests/) -- Every new Credo check includes regression test coverage

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)