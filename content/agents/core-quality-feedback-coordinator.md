+++
title = "core-quality-feedback-coordinator"
weight = 98
[extra]
domain = "general"
level = "L3"
description = "Per-change | 0 warnings | | Credo | Per-change | 0 violations | | Dialyzer | Daily | 0 errors | |"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "telemetry", "3nl"]
domain_normalized = "general"
content_version = "2.1.0"
last_enhanced = "2026-02-16"
word_count = 1650
quality_score = 92
keywords = ["quality feedback", "multi-domain assessment", "compilation compliance", "remediation guidance", "quality scoring", "13 quality domains"]
tags = ["prismatic", "agent", "quality-assurance", "general-domain", "feedback-loop"]
author = "Tomas Korcak (korczis)"
reading_time = "3 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "core-quality-feedback-coordinator - Prismatic Platform"
+++

## Overview

The Core Quality Feedback Coordinator operates as an L3 strategic command agent within the General domain of the Prismatic Platform. This agent orchestrates the continuous quality feedback loop that ensures every code change, configuration update, and agent specification modification meets the platform's zero-tolerance quality standards. By aggregating feedback from compilation, [Credo](@/glossary/credo.md), [Dialyzer](@/glossary/dialyzer.md), test coverage, and runtime [telemetry](@/glossary/telemetry.md), the coordinator produces unified quality assessments that gate all deployments.

In a platform with 90 [umbrella application](@/glossary/umbrella-application.md)s and over 6,600 Elixir source files, quality feedback must be fast, precise, and actionable. The Core Quality Feedback Coordinator collects quality signals from multiple static analysis tools, synthesizes them into a single quality score per change, and provides specific remediation guidance when violations are detected. This agent is the enforcement backbone that maintains the platform's 100/100 quality score across all 13 quality domains.

## Quality Feedback Pipeline

The feedback pipeline operates as a multi-stage analysis system that evaluates every change against the platform's quality standards.

| Stage | Tool | Frequency | Target | Current Status |
|---|---|---|---|---|
| Compilation | `mix compile --warnings-as-errors` | Per-change | 0 warnings | 0 violations |
| Static Analysis | `mix credo --strict` | Per-change | 0 violations | 0 violations |
| Type Checking | `mix dialyzer` | Daily / Per-MR | 0 errors | 0 violations |
| Test Coverage | `mix test --cover` | Per-change | 100% critical paths | Active |
| Runtime Checks | Telemetry aggregation | Continuous | 0 runtime warnings | Active |
| Security Scan | Dependency audit | Weekly | 0 known vulnerabilities | Active |

```elixir
defmodule PrismaticAgents.QualityFeedbackCoordinator do
  use GenServer

  @quality_domains [
    :compilation, :credo, :dialyzer, :test_coverage,
    :datetime_precision, :guard_functions, :impl_coverage,
    :memory_safety, :performance, :timing_patterns,
    :todo_management, :typespec_coverage, :unsafe_map_access
  ]

  @spec assess_change(changeset :: map()) :: {:ok, quality_report()} | {:error, term()}
  def assess_change(changeset) do
    GenServer.call(__MODULE__, {:assess, changeset}, :timer.minutes(5))
  end

  @impl true
  def handle_call({:assess, changeset}, _from, state) do
    results = @quality_domains
      |> Task.async_stream(&run_domain_check(&1, changeset), timeout: :timer.minutes(2))
      |> Enum.reduce(%{}, fn {:ok, {domain, result}}, acc ->
        Map.put(acc, domain, result)
      end)

    report = synthesize_report(results, changeset)
    {:reply, {:ok, report}, update_feedback_history(state, report)}
  end

  defp synthesize_report(results, changeset) do
    violations = Enum.filter(results, fn {_domain, result} -> result.status == :violation end)
    score = calculate_composite_score(results)

    %{
      score: score,
      violations: violations,
      passed: score == 100,
      remediation: generate_remediation(violations),
      changeset_ref: changeset.ref
    }
  end
end
```

## Quality Domain Coverage

The coordinator monitors all 13 quality domains that collectively define the platform's quality posture.

| Domain | Check Type | Threshold | Enforcement |
|---|---|---|---|
| Dialyzer | Type consistency | 0 errors | Blocking |
| Credo | Code style and patterns | 0 violations | Blocking |
| Compilation | Warning-free builds | 0 warnings | Blocking |
| DateTime Precision | Microsecond precision | 0 violations | Blocking |
| Guard Functions | Proper guard usage | 0 violations | Blocking |
| @impl Coverage | Callback annotation | 100% coverage | Blocking |
| Memory Safety | Safe memory patterns | 0 violations | Blocking |
| Performance | Response time limits | < 250ms pages | Blocking |
| Regression Prevention | Regression tests exist | Per bug fix | Blocking |
| Timing Patterns | OTP-native timers | 0 Process.sleep | Blocking |
| TODO Management | No deferred work | 0 TODOs | Blocking |
| Typespec Coverage | @spec annotations | 100% public functions | Blocking |
| Unsafe Map Access | Safe access patterns | 0 violations | Blocking |

## Feedback Synthesis

The coordinator synthesizes individual domain results into actionable feedback that developers can immediately act upon. Each violation includes the exact file location, the violated rule, and a specific remediation recommendation.

```elixir
defmodule PrismaticAgents.QualityFeedback.Remediation do
  @spec generate(violation()) :: remediation()
  def generate(%{domain: :unsafe_map_access, location: loc}) do
    %{
      location: loc,
      message: "Replace map[key] with Map.get(map, key) or pattern match",
      severity: :blocking,
      auto_fixable: true,
      fix_command: "mix quality.enforce_standard --fix"
    }
  end

  def generate(%{domain: :timing_patterns, location: loc}) do
    %{
      location: loc,
      message: "Replace Process.sleep with GenServer timer or :timer",
      severity: :blocking,
      auto_fixable: true,
      fix_command: "mix quality.enforce_standard --fix"
    }
  end
end
```

## Key Capabilities

- **Multi-domain quality aggregation** collecting and synthesizing feedback from 13 independent quality domains into unified quality assessments with composite scoring
- **Actionable remediation guidance** providing specific, file-level fix recommendations for every detected violation, including auto-fix commands where available
- **Quality trend analysis** tracking quality scores over time to detect gradual degradation trends before they trigger threshold violations
- **Cross-domain correlation** identifying quality issues that span multiple domains, such as a missing typespec that causes both a Dialyzer error and a coverage violation
- **Quality gate enforcement** blocking deployments and merge requests that fail any quality domain check, with no bypass capability
- **Quality DNA integration** updating the platform's Quality DNA state after every assessment to maintain cross-session quality continuity

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md). Multi-domain coordination and specialized operational command. The coordinator has authority to block merges, reject deployments, and escalate persistent quality violations to supreme-level agents.

## Coordination

| Agent | Relationship | Purpose |
|---|---|---|
| [cascade-quality-specialist](@/agents/cascade-quality-specialist.md) | CASCADE Partner | Provides CASCADE pattern detection and elimination for common quality issues |
| [quality-enforcement-commander](@/agents/quality-enforcement-commander.md) | Enforcement Authority | Escalation path for persistent quality violations requiring enforcement action |
| [hbfs-quality-evolution](@/agents/hbfs-quality-evolution.md) | Evolution Partner | Drives continuous quality improvement through evolutionary optimization |
| [documentation-verifier](@/agents/documentation-verifier.md) | Documentation Check | Verifies code-comment consistency and documentation completeness |

## Integration

| Component | Relationship |
|---|---|
| [Quality Gates](@/glossary/quality-gates.md) | Primary enforcement mechanism for quality standards |
| [GitLab CI](@/glossary/gitlab-ci.md)/CD | Automated quality pipeline execution in merge requests |
| Quality DNA | Cross-session quality state persistence |
| Platform Telemetry | Runtime quality metric collection and aggregation |
| Pre-commit Hooks | Local quality enforcement before code reaches CI |

## Enforcement

All quality feedback operations are governed by the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. Every quality domain must report zero violations for a change to proceed. There is no mechanism for bypassing quality gates, and no manual override exists at any authority level for quality violations. The coordinator maintains the platform's current perfect quality score of 100/100 across all domains through continuous, automated enforcement. Quality regressions trigger immediate investigation and remediation without exception.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)