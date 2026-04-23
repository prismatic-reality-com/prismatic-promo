+++
title = "quality-enforcement-commander"
weight = 328
[extra]
domain = "general"
level = "L3"
description = "The Quality Enforcement Commander ensures ABSOLUTE compliance with AIAD quality standards through"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "seadf", "telemetry"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 1850
quality_score = 83
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["quality-enforcement-commander", "Quality", "Enforcement", "Commander", "ABSOLUTE", "AIAD", "agents", "agent", "Prismatic Platform", "Block"]
tags = ["agents", "agent", "quality-enforcement-commander", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "quality-enforcement-commander - Prismatic Platform"
+++

## Overview

The quality-enforcement-commander operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform, ensuring absolute compliance with [AIAD](@/glossary/aiad.md) quality standards through systematic enforcement across all 90 umbrella applications. This agent is the central command authority for quality enforcement operations, coordinating the platform's quality gate pipeline, managing enforcement escalation, and maintaining the 100/100 quality score that defines the platform's production readiness standard.

Quality enforcement at the Prismatic Platform's scale is not a periodic audit activity but a continuous, automated process woven into every development operation. The enforcement commander maintains real-time quality state awareness across the entire codebase and triggers corrective actions the moment any quality metric deviates from the established standard. This continuous enforcement model has driven the platform from an initial quality score of 68/100 to the current perfect 100/100, eliminating 905 Quality Debt Points ([QDP](@/glossary/quality-debt.md)) through systematic campaigns.

Governed by the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine, the enforcement commander operates with zero tolerance for quality deviations. The [NO MERCY](@/glossary/no-mercy.md) component means no quality violation is deferred, excused, or accepted as temporary technical debt. The [NO DOUBTS](@/glossary/no-doubts.md) component ensures that enforcement decisions are based on objective measurement, not subjective assessment.

## Quality Enforcement Pipeline

The enforcement pipeline operates as a multi-stage verification system that evaluates code quality at every transition point in the development lifecycle.

**Pre-commit enforcement** executes quality checks before code enters the version control system. This includes compilation warning detection, [Credo](@/glossary/credo.md) strict mode analysis, [Dialyzer](@/glossary/dialyzer.md) typespec verification, and pattern-specific checks for known anti-patterns (unsafe map access, Process.sleep usage, length-greater-than-zero patterns). Code that fails any check is blocked from committing.

**Commit message enforcement** validates that commit messages comply with the Conventional Commits format, include required metadata, and reference relevant tracking tickets. Commit messages that fail validation are rejected with specific feedback on the required format.

**Pre-push enforcement** runs the full test suite and quality gate pipeline before code is pushed to the remote repository. This catches any quality issues that pre-commit checks might miss, including integration-level test failures and cross-module type inconsistencies.

**CI/CD enforcement** provides the final quality gate before code reaches production. The CI pipeline executes the complete quality assessment including all 13 quality domains, generating a composite quality score that must meet the 100/100 threshold for deployment approval.

## Key Capabilities

- **13-domain quality assessment** -- Monitors all quality domains simultaneously: compilation, Dialyzer, Credo, DateTime precision, guard functions, @impl coverage, memory safety, performance, regression prevention, timing patterns, TODO management, typespec coverage, and unsafe map access
- **Automatic correction** -- Identifies and applies automatic fixes for common quality violations using [CASCADE](@/glossary/cascade.md) elimination patterns, reducing manual intervention requirements
- **Quality score tracking** -- Maintains real-time quality scores across all applications and the platform aggregate, with historical trend analysis and regression detection
- **Escalation management** -- Classifies quality violations by severity and routes them through appropriate escalation paths, from automated fixing to supreme-level intervention
- **Campaign coordination** -- Plans and executes quality improvement campaigns targeting specific quality domains or anti-pattern categories across the codebase
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with continuous quality monitoring and proactive enforcement
- **[Telemetry integration](@/capabilities/telemetry-integration.md)** for enforcement action tracking and quality trend monitoring

## Quality Domain Matrix

| Domain | Check Type | Tool | Violation Response |
|--------|-----------|------|-------------------|
| **Compilation** | Zero warnings | `mix compile --warnings-as-errors` | Block commit |
| **Dialyzer** | Static type analysis | `mix dialyzer` | Block commit |
| **Credo** | Code style and patterns | `mix credo --strict` | Block commit |
| **DateTime Precision** | Microsecond timestamps | Custom analyzer | Auto-fix |
| **Guard Functions** | Pattern matching hygiene | Custom analyzer | Block commit |
| **@impl Coverage** | Callback documentation | Custom analyzer | Block commit |
| **Memory Safety** | Bounded data structures | Custom analyzer | Block commit |
| **Performance** | O(1) pattern compliance | Custom analyzer | Block commit |
| **Regression Prevention** | Mandatory regression tests | Test framework | Block commit |
| **Timing Patterns** | Process.sleep elimination | Custom analyzer | Auto-fix |
| **TODO Management** | TODO/FIXME removal | Custom analyzer | Block commit |
| **Typespec Coverage** | @spec documentation | Custom analyzer | Block commit |
| **Unsafe Map Access** | Map.fetch/Map.get safety | Custom analyzer | Auto-fix |

## Implementation Architecture

```elixir
defmodule PrismaticSafety.EnforcementCommander do
  @moduledoc """
  Central quality enforcement command authority coordinating
  all quality gate checks across the platform's umbrella.
  """

  use GenServer

  @quality_domains [
    :compilation, :dialyzer, :credo, :datetime_precision,
    :guard_functions, :impl_coverage, :memory_safety,
    :performance, :regression_prevention, :timing_patterns,
    :todo_management, :typespec_coverage, :unsafe_map_access
  ]

  @type quality_report :: %{
    score: non_neg_integer(),
    domains: %{atom() => domain_result()},
    violations: [violation()],
    timestamp: DateTime.t()
  }

  @type domain_result :: %{
    status: :pass | :fail,
    violations: non_neg_integer(),
    details: [String.t()]
  }

  @spec full_assessment() :: {:ok, quality_report()}
  def full_assessment do
    results = @quality_domains
      |> Task.async_stream(&assess_domain/1, timeout: :timer.minutes(5))
      |> Enum.map(fn {:ok, result} -> result end)
      |> Map.new()

    score = calculate_composite_score(results)
    violations = extract_violations(results)

    {:ok, %{
      score: score,
      domains: results,
      violations: violations,
      timestamp: DateTime.utc_now()
    }}
  end

  defp calculate_composite_score(results) do
    passing = Enum.count(results, fn {_domain, result} -> result.status == :pass end)
    round(passing / length(@quality_domains) * 100)
  end
end
```

## Enforcement Escalation Protocol

| Level | Score Range | Response | Timeline |
|-------|-----------|----------|----------|
| **OPTIMAL** | 100/100 | Monitor only | Continuous |
| **WARNING** | 99/100 | Alert + investigation | <1 hour |
| **CRITICAL** | 95-98/100 | Auto-evolution trigger | <30 minutes |
| **EMERGENCY** | <95/100 | Block all commits + supreme escalation | Immediate |

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination with authority to block commits, trigger quality improvement campaigns, and escalate quality emergencies to supreme command.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/quality-enforce assess` | Run full 13-domain quality assessment | L3+ |
| `/quality-enforce status` | Display current quality score and domain status | L3+ |
| `/quality-enforce campaign` | Initiate targeted quality improvement campaign | L3+ |
| `/quality-enforce history` | Display quality score trend and enforcement history | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [quality-bypass-enforcer-agent](@/agents/quality-bypass-enforcer-agent.md) | Prevents circumvention of enforcement mechanisms |
| [quality-gate-enforcer-agent](@/agents/quality-gate-enforcer-agent.md) | Executes specific quality gate checks under commander direction |
| [quality-gates-specialist](@/agents/quality-gates-specialist.md) | Provides static analysis expertise for quality assessment |
| [quality-intelligence-commander](@/agents/quality-intelligence-commander.md) | Quality intelligence informs enforcement strategy |
| [prismatic-supreme-commander](@/agents/prismatic-supreme-commander.md) | Supreme escalation target for quality emergencies |

## Enforcement

The quality-enforcement-commander embodies the [NO MERCY](@/glossary/no-mercy.md) doctrine at its most literal: zero quality violations are accepted, zero exceptions are granted, and zero deferrals are permitted. Every enforcement action is tracked, measured, and auditable. The [Trinity Gate](@/glossary/trinity-gate.md) validates the enforcement system's own consistency, ensuring that quality standards are applied uniformly across all domains and applications.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)