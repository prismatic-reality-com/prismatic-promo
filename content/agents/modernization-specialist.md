+++
title = "modernization-specialist"
weight = 257
[extra]
domain = "modernization"
level = "L3"
description = "Technology stack modernization and platform upgrades with genetic quality patterns and three-stage verification"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["otp", "beam", "supervision-tree", "genserver", "aiad", "3nl", "umbrella-application", "ecto", "phoenix", "no-doubts"]
domain_normalized = "architecture"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2300
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["modernization-specialist", "Technology", "agents", "agent", "Prismatic Platform", "Elixir", "Phoenix"]
tags = ["agents", "agent", "modernization-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "modernization-specialist - Prismatic Platform"
+++

## Overview

The modernization-specialist operates as an L3 [Strategic Command](/glossary/strategic-command/) authority within the Prismatic Platform's modernization domain, responsible for planning and executing technology stack upgrades, dependency modernization campaigns, and platform-wide migration operations. This agent applies genetic quality patterns -- evolutionary strategies that preserve quality DNA across transformation boundaries -- to ensure that modernization efforts improve the platform without regressing established capabilities. Every modernization operation passes through a three-stage verification pipeline: pre-migration validation, in-flight compatibility testing, and post-migration quality confirmation.

Built on the [AIAD](/glossary/aiad/) standard, the modernization-specialist operates within the [SEADF](/glossary/seadf/) evolutionary framework, treating each modernization as a controlled mutation that must demonstrate fitness improvement before being committed to the platform's genetic lineage. The [NO MERCY](/glossary/no-mercy/) doctrine governs all modernization operations: no upgrade is deployed that introduces compilation warnings, test failures, or quality regressions.

## Operational Domain

The modernization domain covers all technology evolution activities across the platform's 90+ [umbrella applications](/glossary/umbrella-application/). This includes Elixir and [OTP](/glossary/otp/) version upgrades, [Phoenix](/glossary/phoenix/) framework migrations, dependency updates, deprecated API replacements, and database schema modernization through [Ecto](/glossary/ecto/) migrations. The agent maintains a technology debt registry that tracks every outdated dependency, deprecated function call, and legacy pattern across the codebase, prioritizing modernization efforts by risk and impact.

| Modernization Category | Scope | Risk Level | Verification |
|----------------------|-------|------------|-------------|
| Language Version | Elixir/OTP upgrades | High | Full test suite + dialyzer |
| Framework Migration | Phoenix, LiveView | High | E2E + visual regression |
| Dependency Updates | Hex packages | Medium | Contract tests + compatibility |
| API Deprecation | Internal module APIs | Medium | Caller migration + boundary checks |
| Pattern Replacement | Anti-pattern elimination | Low | Unit tests + quality gates |
| Database Evolution | Schema migrations | High | Rollback verification + data integrity |

## Key Capabilities

- **Dependency graph analysis** -- Maps the complete dependency tree across all umbrella applications, identifying version conflicts, security advisories, and deprecated packages that require modernization attention
- **Three-stage verification pipeline** -- Implements pre-migration baseline capture, in-flight compatibility validation, and post-migration quality confirmation to ensure zero-regression modernization
- **Genetic quality preservation** -- Carries forward quality DNA (test coverage, type specifications, documentation) across modernization boundaries, ensuring that upgrades do not erode established quality standards
- **Automated migration code generation** -- Produces migration scripts for deprecated API replacements, pattern updates, and configuration changes across multiple applications simultaneously
- **[Autonomous operation](/capabilities/autonomous-self-healing/)** with self-directed modernization scanning and technology debt assessment
- **[Telemetry integration](/capabilities/telemetry-integration/)** publishing modernization progress, debt reduction metrics, and migration health indicators

## Three-Stage Verification Pipeline

```elixir
defmodule Prismatic.Modernization.VerificationPipeline do
  @moduledoc """
  Three-stage verification pipeline ensuring zero-regression
  technology modernization across the platform.
  """

  alias Prismatic.Modernization.{Baseline, Migration, Validator}

  @type stage_result :: {:ok, report()} | {:error, [failure()]}

  @spec execute(migration_plan()) :: {:ok, verification_report()} | {:error, term()}
  def execute(plan) do
    with {:ok, baseline} <- stage_1_pre_migration(plan),
         {:ok, migration} <- stage_2_in_flight(plan, baseline),
         {:ok, confirmation} <- stage_3_post_migration(plan, baseline, migration) do
      {:ok, %{
        plan: plan,
        baseline: baseline,
        migration: migration,
        confirmation: confirmation,
        status: :verified
      }}
    else
      {:error, stage, failures} ->
        rollback(plan, stage)
        {:error, %{stage: stage, failures: failures, rolled_back: true}}
    end
  end

  defp stage_1_pre_migration(plan) do
    baseline = %{
      test_results: Baseline.capture_test_results(plan.apps),
      quality_score: Baseline.capture_quality_score(plan.apps),
      compilation_warnings: Baseline.capture_warnings(plan.apps),
      dialyzer_status: Baseline.capture_dialyzer(plan.apps),
      type_coverage: Baseline.capture_typespec_coverage(plan.apps)
    }

    {:ok, baseline}
  end

  defp stage_2_in_flight(plan, baseline) do
    Migration.apply(plan)

    compatibility = %{
      compiles: Migration.check_compilation(plan.apps),
      tests_pass: Migration.run_tests(plan.apps),
      no_warnings: Migration.check_warnings(plan.apps)
    }

    if all_passing?(compatibility) do
      {:ok, compatibility}
    else
      {:error, :in_flight, compatibility}
    end
  end

  defp stage_3_post_migration(plan, baseline, _migration) do
    post = %{
      quality_score: Validator.measure_quality(plan.apps),
      regression_check: Validator.compare_baseline(baseline),
      integration_tests: Validator.run_integration(plan.apps)
    }

    if post.quality_score >= baseline.quality_score do
      {:ok, post}
    else
      {:error, :post_migration, post}
    end
  end
end
```

## Authority Level

**L3** - [Strategic Command](/glossary/strategic-command/) - Multi-domain coordination with authority to initiate platform-wide modernization campaigns, approve dependency upgrades, and enforce migration timelines.

## Technology Debt Tracking

| Metric | Description | Current Target |
|--------|-------------|----------------|
| Outdated Dependencies | Packages behind latest major version | 0 critical, < 5 minor |
| Deprecated API Calls | Usage of deprecated Elixir/OTP functions | 0 (zero tolerance) |
| Legacy Patterns | Anti-patterns identified for replacement | Continuous reduction |
| Security Advisories | Dependencies with known vulnerabilities | 0 (immediate remediation) |
| OTP Compatibility | Support for latest OTP release | Current - 1 minimum |
| Phoenix Version Gap | Distance from latest Phoenix release | Current - 1 maximum |

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/modernize scan` | Scan all applications for technology debt and upgrade opportunities | L3+ |
| `/modernize plan` | Generate modernization plan with dependency resolution | L3+ |
| `/modernize execute` | Execute modernization plan with three-stage verification | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [evolution-orchestrator-supreme](/agents/evolution-orchestrator-supreme/) | Aligns modernization campaigns with evolutionary fitness goals |
| [database-migration-specialist](/agents/database-migration-specialist/) | Coordinates database schema modernization with code migrations |
| [code-quality-commander](/agents/code-quality-commander/) | Validates quality preservation across modernization boundaries |
| [security-audit-specialist](/agents/security-audit-specialist/) | Ensures security posture is maintained or improved after upgrades |

## Genetic Quality Preservation

The concept of "genetic quality preservation" is central to the modernization-specialist's approach. In the biological metaphor that underlies the [SEADF](/glossary/seadf/) framework, each application carries "quality DNA" -- the aggregate of its test coverage, type specification completeness, documentation quality, and code style consistency. When a modernization operation modifies application code, this quality DNA must be preserved or improved; it must never degrade.

The modernization-specialist implements quality DNA preservation through baseline capture before any modernization begins. The baseline records every measurable quality attribute across the affected applications: number of passing tests, test coverage percentage, Dialyzer success status, Credo score, documentation coverage, and typespec coverage. After modernization completes, the same measurements are taken and compared against the baseline. Any regression in any dimension blocks the modernization from proceeding.

This preservation extends beyond numeric metrics. The specialist also validates that code patterns established through platform conventions (such as the `{:ok, _} | {:error, _}` return pattern, proper [GenServer](/glossary/genserver/) callback implementation, and supervision tree documentation) remain intact after modernization. Pattern preservation checks use AST analysis to verify that modernized code maintains the same structural patterns as the original.

## Modernization Campaign Types

The modernization-specialist classifies modernization efforts into distinct campaign types, each with its own risk profile and verification requirements.

| Campaign Type | Scope | Duration | Typical Trigger |
|--------------|-------|----------|----------------|
| Point Upgrade | Single dependency version bump | Hours | Security advisory, bug fix |
| Minor Migration | Framework minor version (e.g., Phoenix 1.7.x to 1.7.y) | Days | Feature availability, deprecation warnings |
| Major Migration | Framework major version (e.g., Phoenix 1.7 to 1.8) | Weeks | End-of-life timeline, breaking API changes |
| Language Upgrade | Elixir/OTP version change | Days to weeks | Performance improvements, new language features |
| Pattern Modernization | Codebase-wide anti-pattern elimination | Weeks | Quality gate enforcement, consistency goals |
| Infrastructure Evolution | Database, cache, or search engine upgrades | Days to weeks | Performance requirements, feature needs |

Each campaign type triggers a specific workflow within the three-stage verification pipeline. Major migrations and language upgrades require full regression testing across all 90+ applications, while point upgrades may be scoped to affected applications and their direct dependents.

## Dependency Intelligence

The modernization-specialist maintains continuous awareness of the platform's dependency landscape. This includes monitoring Hex.pm for new package versions and security advisories, tracking Elixir and OTP release schedules for upcoming deprecations, and analyzing the dependency graph for version conflicts that might emerge from independent application upgrades. Dependency intelligence is published through the platform's [telemetry](/glossary/telemetry/) infrastructure, enabling dashboards that display the current modernization status across all applications at a glance.

The specialist also tracks the "dependency health score" for each external package: a composite metric incorporating release frequency, maintainer activity, open issue count, and security advisory history. Packages with declining health scores are flagged for potential replacement before they become unmaintained liabilities.

## Enforcement

All modernization operations comply with the [NO MERCY](/glossary/no-mercy/) doctrine: no upgrade is deployed that introduces compilation warnings, test failures, quality score regressions, or [Dialyzer](/glossary/beam/) violations. The [NO DOUBTS](/glossary/no-doubts/) principle requires that every modernization decision is backed by compatibility analysis and risk assessment. Rollback capability is mandatory for every migration step -- if any stage of the three-stage verification fails, the entire modernization is automatically reverted to the pre-migration baseline.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)