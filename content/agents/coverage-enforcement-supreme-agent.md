+++
title = "Coverage Enforcement Supreme Agent"
weight = 101
[extra]
domain = "general"
level = "L3"
description = "Management: GitLab-backed baseline tracking per branch - Trend Analysis**: Statistical analysis"
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
keywords = ["test coverage", "baseline tracking", "trend analysis", "merge gating", "statistical analysis", "coverage enforcement"]
tags = ["prismatic", "agent", "testing", "general-domain", "coverage-enforcement"]
author = "Tomas Korcak (korczis)"
reading_time = "3 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "Coverage Enforcement Supreme Agent - Prismatic Platform"
+++

## Overview

The Coverage Enforcement Supreme Agent operates as an L3 strategic command authority within the General domain of the Prismatic Platform. This agent enforces comprehensive test coverage requirements across the entire codebase, managing GitLab-backed baseline tracking per branch and providing statistical trend analysis that detects coverage regression before it impacts quality scores. In a platform with over 5,500 test files and 90 umbrella applications, coverage enforcement requires centralized coordination with per-application granularity.

Test coverage in the Prismatic ecosystem is not a vanity metric. It serves as a proxy for code reliability and change safety. The Coverage Enforcement Supreme Agent maintains per-branch coverage baselines, blocks merge requests that reduce coverage below thresholds, and produces trend analysis reports that highlight applications trending toward coverage degradation. This agent works in conjunction with the quality gate pipeline to ensure that coverage enforcement is automated, consistent, and impossible to bypass.

## Coverage Baseline Management

The agent maintains coverage baselines for every branch in the repository, enabling accurate detection of coverage changes introduced by individual merge requests.

| Baseline Scope | Tracking Granularity | Storage | Update Trigger |
|---|---|---|---|
| Per-application | Module-level coverage % | GitLab CI artifacts | Merge to protected branch |
| Per-branch | Application-level coverage % | GitLab CI variables | Every pipeline run |
| Global | Platform-wide aggregate | Quality DNA | Daily scheduled pipeline |
| Historical | Weekly snapshots | `.claude/quality-dna/` | Weekly cron |

```elixir
defmodule PrismaticAgents.CoverageEnforcement do
  @moduledoc """
  Coverage baseline management and enforcement engine.
  Tracks per-application, per-branch coverage baselines
  and blocks regressions.
  """

  use GenServer

  @coverage_threshold 80.0
  @regression_tolerance 0.5

  @type coverage_report :: %{
    application: String.t(),
    branch: String.t(),
    current_coverage: float(),
    baseline_coverage: float(),
    delta: float(),
    status: :passing | :regression | :improvement
  }

  @spec check_coverage(String.t(), String.t()) :: {:ok, coverage_report()} | {:error, term()}
  def check_coverage(application, branch) do
    GenServer.call(__MODULE__, {:check, application, branch})
  end

  @impl true
  def handle_call({:check, application, branch}, _from, state) do
    with {:ok, current} <- measure_current_coverage(application),
         {:ok, baseline} <- fetch_baseline(application, branch, state) do
      delta = current - baseline
      status = classify_coverage_change(current, baseline, delta)

      report = %{
        application: application,
        branch: branch,
        current_coverage: current,
        baseline_coverage: baseline,
        delta: delta,
        status: status
      }

      {:reply, {:ok, report}, update_state(state, report)}
    end
  end

  defp classify_coverage_change(current, _baseline, delta) do
    cond do
      current < @coverage_threshold -> :regression
      delta < -@regression_tolerance -> :regression
      delta > @regression_tolerance -> :improvement
      true -> :passing
    end
  end
end
```

## Trend Analysis

The Coverage Enforcement Supreme Agent performs statistical trend analysis on coverage data to detect gradual degradation patterns that individual commit-level checks might miss.

### Statistical Methods

| Method | Application | Detection Capability |
|---|---|---|
| Linear regression | Coverage over time per app | Sustained downward trends |
| Moving average | Weekly coverage windows | Short-term regression patterns |
| Standard deviation | Cross-app coverage variance | Applications falling behind |
| Change point detection | Historical coverage timelines | Sudden coverage drops |

```elixir
defmodule PrismaticAgents.CoverageEnforcement.TrendAnalyzer do
  @spec analyze_trends(String.t(), non_neg_integer()) :: {:ok, trend_report()}
  def analyze_trends(application, lookback_days \\ 30) do
    data_points = fetch_historical_coverage(application, lookback_days)
    slope = linear_regression_slope(data_points)
    moving_avg = calculate_moving_average(data_points, window: 7)

    trend = cond do
      slope < -0.1 -> :declining
      slope > 0.1 -> :improving
      true -> :stable
    end

    {:ok, %{
      application: application,
      trend: trend,
      slope: slope,
      current_moving_avg: List.last(moving_avg),
      data_points: length(data_points),
      recommendation: generate_recommendation(trend, slope)
    }}
  end
end
```

## Enforcement Levels

The agent enforces coverage requirements at multiple levels with escalating severity.

| Level | Trigger | Action | Bypass |
|---|---|---|---|
| Warning | Coverage delta -0.1% to -0.5% | MR comment with coverage report | None |
| Block | Coverage delta > -0.5% | MR merge blocked | None |
| Critical | Application below 80% threshold | Pipeline failure + escalation | None |
| Emergency | Platform-wide average drop > 1% | Supreme agent notification | None |

## Key Capabilities

- **GitLab-backed baseline tracking** maintaining per-branch, per-application coverage baselines using GitLab CI artifacts and variables for persistent, cross-pipeline state
- **Statistical trend analysis** applying regression analysis and change point detection to historical coverage data for early degradation detection
- **Merge request gating** automatically blocking merge requests that introduce coverage regressions beyond configured tolerance thresholds
- **Per-application granularity** tracking coverage at the individual umbrella application level rather than relying on aggregate metrics that mask local regressions
- **Coverage gap identification** pinpointing specific modules and functions lacking test coverage to guide targeted test writing efforts
- **Quality DNA integration** persisting coverage state in the platform's Quality DNA system for cross-session coverage continuity

## Authority Level

**L3** - [Strategic Command](/glossary/strategic-command/). Multi-domain coordination and specialized operational command. The Coverage Enforcement Supreme Agent has authority to block merges across all applications and escalate persistent coverage violations to supreme-level agents.

## Coordination

| Agent | Relationship | Purpose |
|---|---|---|
| [cascade-quality-specialist](/agents/cascade-quality-specialist/) | Quality Partner | Coordinates CASCADE pattern elimination with coverage improvement efforts |
| [quality-enforcement-commander](/agents/quality-enforcement-commander/) | Enforcement Authority | Escalation path for persistent coverage violations |
| [test-specialist](/agents/test-specialist/) | Test Generation | Collaborates on generating tests for uncovered code paths |
| [mandatory-regression-prevention-commander](/agents/mandatory-regression-prevention-commander/) | Regression Partner | Ensures bug fixes include regression tests that contribute to coverage |

## Integration

| Component | Relationship |
|---|---|
| [Quality Gates](/glossary/quality-gates/) | Coverage check as mandatory quality gate |
| [GitLab CI](/glossary/gitlab-ci/)/CD | Pipeline integration for automated coverage measurement |
| Quality DNA | Cross-session coverage baseline persistence |
| Platform [Telemetry](/glossary/telemetry/) | Coverage metrics emission for monitoring dashboards |

## Enforcement

All coverage enforcement operates under the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine. Coverage regressions are blocked without exception. There is no manual override for coverage gate failures. Applications that fall below the 80% threshold are flagged for immediate remediation. The Coverage Enforcement Supreme Agent maintains an immutable audit trail of all coverage measurements, baseline updates, and enforcement decisions for full traceability and accountability.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)