+++
title = "dx-brutalist-analyst"
weight = 143
[extra]
domain = "developer-experience"
level = "L3"
description = "Transform git commit history into brutal reality assessment for DX-related work (AIAD, AI, Claude, agents, CI/CD, git hooks)."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ecto", "phoenix", "liveview", "aiad", "ets", "hot-code-reload"]
domain_normalized = "development"
content_version = "1.1.0"
last_enhanced = "2026-02-14"
word_count = 400
quality_score = 62
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["dx-brutalist-analyst", "Transform", "DX-related", "AIAD", "Claude", "CICD", "agents", "agent", "Prismatic Platform", "Phase"]
tags = ["agents", "agent", "dx-brutalist-analyst", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "dx-brutalist-analyst - Prismatic Platform"
+++

## Overview

The DX Brutalist Analyst operates as an L3 [strategic command](@/glossary/strategic-command.md) agent within the Developer Experience domain of the Prismatic Platform. This agent transforms raw git commit history, CI/CD pipeline [metrics](@/glossary/metrics.md), and developer workflow [telemetry](@/glossary/telemetry.md) into uncompromising reality assessments of developer experience quality. No optimistic spin, no vanity metrics -- only evidence-based evaluation of how developers actually interact with platform tooling, [AIAD](@/glossary/aiad.md) agents, Claude Code sessions, and automated quality enforcement infrastructure.

Brutalist analysis rejects the temptation to present flattering interpretations. The agent examines commit patterns to detect friction points: excessive fix-up commits indicating unclear APIs, long gaps between commits suggesting tooling confusion, and repetitive patterns that reveal missing abstractions. By correlating git history with CI/CD outcomes and hook execution times, the DX Brutalist Analyst produces assessments that expose the gap between intended developer experience and actual developer experience.

In a platform where over 430 autonomous agents interact with developer workflows through git hooks, pre-commit quality gates, and CI/CD pipelines, the cumulative impact on developer velocity is significant. A single poorly-tuned pre-commit hook that adds 5 seconds to every commit costs hours across a development week. The DX Brutalist Analyst quantifies these costs with precision, providing the evidence base for DX optimization decisions.

## Architecture

The DX Brutalist Analyst implements a data pipeline architecture that ingests raw developer activity signals, correlates them across multiple dimensions, and produces structured brutalist assessment reports.

```
Git History ----+
                |
CI/CD Logs -----+--> Signal Aggregator --> Correlation Engine --> Brutalist Scorer
                |                                                        |
Hook Metrics ---+                                                        v
                |                                              Assessment Report
Session Logs --+                                              (evidence-backed,
                                                               no euphemisms)
```

**Signal Aggregation Layer.** Raw signals are collected from four primary sources: git commit history (commit frequency, message quality, fix-up ratios), CI/CD pipeline logs (build times, failure rates, retry patterns), pre-commit hook metrics (execution times, failure rates per hook phase), and Claude Code session logs (command usage, agent invocation patterns, error rates). Each signal source feeds into a unified time-series model.

**Correlation Engine.** The correlation engine identifies statistically significant relationships between signals. For example, it detects when pre-commit hook failure rates spike correlate with increased fix-up commit frequency, suggesting that the hooks are catching real issues but the error messages may not be guiding developers to correct fixes efficiently. These correlations form the basis of brutalist assessment findings.

**Brutalist Scoring Model.** Correlated signals are evaluated against DX quality benchmarks to produce numeric scores across multiple dimensions. Scores are deliberately conservative -- the brutalist philosophy assumes that developer experience is worse than it appears until proven otherwise. This contrasts with traditional DX measurement approaches that tend toward optimistic interpretation of ambiguous signals.

## Core Capabilities

**Git History Forensics.** The analyst performs deep analysis of commit patterns, measuring commit frequency distributions, message quality scores, fix-up ratios (commits containing "fix", "oops", "revert" in messages relative to total commits), and time-between-commits distributions. Long commit gaps in otherwise active sessions indicate tooling confusion or blocked workflows. High fix-up ratios indicate API clarity problems or inadequate error messages.

**CI/CD Pipeline Assessment.** Build times, failure rates, retry patterns, and hook execution overhead are measured and trended over time. The agent identifies specific pipeline stages that contribute disproportionately to developer wait time. Pipeline flakiness -- tests that intermittently fail without code changes -- is quantified as a DX cost rather than treated as an acceptable nuisance.

**AIAD Workflow Analysis.** Agent interaction patterns, command usage frequency, and error rates across the autonomous agent ecosystem are analyzed to evaluate the developer-facing quality of AIAD tooling. Agents with high error rates, commands with low usage despite high relevance, and workflows with excessive step counts are flagged as DX friction sources.

**Pre-Commit Hook Impact Analysis.** Each phase of the pre-commit hook system is individually measured for execution time, failure rate, and developer-time cost. The analysis balances hook strictness against developer velocity: hooks that catch many real issues justify their time cost, while hooks with high false-positive rates are identified as net-negative DX investments.

**Brutalist Reporting.** Assessment reports are written without euphemism. Rather than reporting "build times could be improved," the analyst reports "average build time is 47 seconds, costing 12.5 developer-hours per week across the team." Rather than "some hooks may be strict," the analyst reports "Phase 4 Credo hook fails on 23% of commits with false positives, consuming 3.2 hours/week in unnecessary correction cycles."

**Trend Detection.** The agent identifies degradation patterns in DX metrics before they become critical, enabling proactive intervention. Gradually increasing build times, slowly climbing hook failure rates, and declining commit frequency are all detected through statistical trend analysis with configurable sensitivity thresholds.

## Implementation

```elixir
defmodule PrismaticAgents.DXBrutalist.Analyst do
  @moduledoc """
  L3 DX Brutalist Analyst - transforms developer activity
  signals into uncompromising reality assessments of developer
  experience quality.
  """
  use GenServer

  alias PrismaticAgents.DXBrutalist.{
    GitForensics,
    CICDAssessor,
    HookAnalyzer,
    AIADWorkflowAnalyzer,
    BrutalistScorer,
    ReportGenerator
  }

  @type assessment :: %{
    period: {Date.t(), Date.t()},
    git_analysis: git_findings(),
    cicd_analysis: cicd_findings(),
    hook_analysis: hook_findings(),
    aiad_analysis: aiad_findings(),
    brutalist_scores: %{atom() => float()},
    overall_dx_score: float(),
    findings: [brutalist_finding()],
    generated_at: DateTime.t()
  }

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec assess(Date.t(), Date.t(), keyword()) ::
    {:ok, assessment()} | {:error, term()}
  def assess(from_date, to_date, opts \\ []) do
    GenServer.call(__MODULE__, {:assess, from_date, to_date, opts}, 120_000)
  end

  @impl true
  def handle_call({:assess, from, to, opts}, _from, state) do
    period = {from, to}

    with {:ok, git} <- GitForensics.analyze(period),
         {:ok, cicd} <- CICDAssessor.evaluate(period),
         {:ok, hooks} <- HookAnalyzer.measure(period),
         {:ok, aiad} <- AIADWorkflowAnalyzer.review(period) do
      scores = BrutalistScorer.compute(git, cicd, hooks, aiad)
      report = ReportGenerator.brutalist_report(period, scores)
      {:reply, {:ok, report}, state}
    else
      error -> {:reply, error, state}
    end
  end
end
```

## Integration Points

| Component | Integration Type | Purpose |
|-----------|-----------------|---------|
| [archer-supreme-dx-commander](@/agents/archer-supreme-dx-commander.md) | Command Authority | Receives brutalist assessments for DX strategic decisions |
| [commit-coordinator](@/agents/commit-coordinator.md) | Data Source | Provides structured commit workflow data for analysis |
| Git Repository | Data Source | Raw commit history, branch activity, and merge patterns |
| GitLab CI/CD | Data Source | Pipeline execution logs, timing data, and failure records |
| Pre-Commit Hooks | Data Source | Hook execution metrics per phase and commit |
| [ETS](@/glossary/ets.md) | Cache Layer | Assessment results and intermediate signal aggregations |
| [Telemetry](@/glossary/telemetry.md) | Observability | Assessment execution metrics and DX trend events |

## Operational Workflow

**Phase 1: Signal Collection.** The analyst collects raw signals from all data sources for the assessment period. Git history is extracted using `git log` analysis. CI/CD data is pulled from GitLab API endpoints. Hook metrics are read from the telemetry event store. Session logs are aggregated from the Claude Code session context directory.

**Phase 2: Signal Normalization.** Raw signals are normalized to a common time-series format enabling cross-source correlation. Timestamps are aligned, outliers are identified but preserved (brutalist philosophy retains outliers as potentially important signals), and missing data points are explicitly marked rather than interpolated.

**Phase 3: Correlation Analysis.** The correlation engine identifies relationships between signal dimensions. Key correlations include: hook failure rate vs. fix-up commit frequency, build time trends vs. commit frequency trends, agent error rates vs. command abandonment rates, and session duration vs. task completion rates.

**Phase 4: Brutalist Scoring.** Correlated findings are scored using deliberately conservative benchmarks. DX dimensions scored include: Velocity (commits/hour adjusted for complexity), Friction (time spent on non-productive activities), Reliability (CI/CD success rate, hook stability), Clarity (fix-up ratio as proxy for API clarity), and Tooling ROI (bugs caught per hour of developer time consumed by tooling).

**Phase 5: Report Generation.** The final report presents findings without softening language. Each finding includes: the measured metric, the benchmark it fails to meet, the quantified developer-time cost, and a prioritized recommendation. Reports are structured for consumption by both technical operators and strategic decision-makers.

## NABLA Compliance

| Axiom | DX Enforcement |
|-------|----------------|
| **Signal Plurality** | DX assessments require corroboration from at least two independent signal sources before findings are reported |
| **Contradiction Preservation** | When different signal sources produce contradictory DX quality indicators, both signals are preserved and the contradiction is highlighted |
| **Provenance Mandatory** | Every finding links to specific git commits, CI/CD pipeline runs, or hook execution records |
| **Time Decay** | Historical DX assessments are weighted by recency, with older assessments contributing less to trend analysis |
| **Source Independence** | Git history analysis, CI/CD assessment, and hook analysis use independent data collection methods |

## Configuration

```elixir
config :prismatic_agents, PrismaticAgents.DXBrutalist.Analyst,
  # Assessment parameters
  default_assessment_period_days: 14,
  minimum_commits_for_assessment: 50,
  trend_sensitivity_threshold: 0.05,

  # Brutalist scoring benchmarks
  target_commits_per_hour: 3.0,
  max_acceptable_fixup_ratio: 0.10,
  max_acceptable_build_time_seconds: 60,
  max_acceptable_hook_time_seconds: 15,
  max_acceptable_hook_false_positive_rate: 0.05,

  # Signal collection
  git_log_max_depth: 5_000,
  cicd_api_timeout_ms: 30_000,
  session_log_directory: ".claude/session-context/"
```

## Performance

| Metric | Target | Description |
|--------|--------|-------------|
| **Signal Collection** | < 30s | Aggregate all signal sources for a 14-day period |
| **Correlation Analysis** | < 10s | Cross-source correlation computation |
| **Full Assessment** | < 2 min | Complete brutalist assessment including report generation |
| **Trend Detection** | < 5s | Statistical trend identification across historical assessments |
| **Report Generation** | < 3s | Structured report compilation from scored findings |

## Related Resources

- [**archer-supreme-dx-commander**](@/agents/archer-supreme-dx-commander.md) - Strategic DX command authority consuming brutalist assessments
- [**commit-coordinator**](@/agents/commit-coordinator.md) - Structured commit workflow data provider
- [**code-review-specialist-agent-v20**](@/agents/code-review-specialist-agent-v20.md) - Code review operations producing DX-relevant quality signals
- [Quality Gates](@/glossary/quality-gates.md) - Pre-commit enforcement pipeline measured by brutalist analysis
- [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) - Doctrine governing the uncompromising nature of brutalist assessments

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)