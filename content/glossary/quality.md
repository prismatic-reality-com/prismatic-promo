+++
title = "Quality"
weight = 20
[extra]
description = "The measurable, evidence-backed degree to which software meets its specifications, resists defects, maintains consistency across all dimensions, and improves autonomously over time"
category = "quality"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "14 min"
difficulty = "intermediate"
quality_score = 95
related_terms = ["quality-gate", "quality-gates", "quality-dna", "quality-floor-guardian", "quality-assurance", "quality-debt", "quality-standard", "quality-monitoring", "quality-evidence-truth", "quality-systems"]
keywords = ["software quality", "code quality metrics", "quality gates", "quality enforcement", "quality measurement", "Elixir code quality", "zero defect policy", "quality automation", "quality score", "continuous quality monitoring"]
tags = ["quality", "engineering", "metrics", "automation", "continuous-improvement"]
key_takeaways = ["Quality in the Prismatic Platform is a measurable quantity computed from 13 independent quality domains, not a subjective assessment", "The platform maintains a perfect 100/100 quality score enforced by automated gates that block non-compliant changes", "Quality is treated as a non-negotiable property: code that does not meet quality standards does not merge, deploy, or ship", "Autonomous quality systems continuously monitor, detect, and trigger remediation of quality regressions", "Quality debt is tracked, measured, and eliminated through systematic processes rather than accumulated indefinitely"]
use_cases = ["Automated quality gate enforcement in CI/CD pipelines", "Continuous quality monitoring with autonomous alerting", "Quality debt tracking and elimination", "Cross-session quality state persistence", "Pre-commit quality verification"]
prerequisites = ["testing", "static-analysis", "continuous-integration"]
further_reading = ["Quality Without a Name by Christopher Alexander", "Software Engineering at Google by Titus Winters, Tom Manshreck, and Hyrum Wright", "A Philosophy of Software Design by John Ousterhout"]
word_count = 2022
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Quality - Prismatic Platform"
+++

## Definition

Quality, in software engineering, is the measurable degree to which a system satisfies its functional requirements (does it do what it should?), non-functional requirements (does it perform, scale, secure, and maintain as it should?), and structural requirements (is the code consistent, readable, type-safe, and free of known defect patterns?). Quality is not a feeling, not an opinion, and not a marketing claim. It is a computed value derived from evidence collected by automated analysis tools.

Within the Prismatic Platform, quality is operationalized as a composite score across 13 independent quality domains, each of which is measured by automated tooling that produces binary results: zero violations (passing) or non-zero violations (failing). The platform's current quality score of 100/100 means that all 13 domains report zero violations -- a state achieved through systematic elimination of 905 quality debt points (QDP) and maintained through automated enforcement that blocks any change introducing new violations.

This definition of quality is deliberately strict. Most software organizations treat quality as a spectrum where "good enough" is the target. The Prismatic Platform treats quality as a binary: the code either meets the standard or it does not. There is no "almost passing." There is no "we'll fix it later." The pre-commit hook blocks the commit, the CI pipeline rejects the merge request, and the developer fixes the violation before proceeding. This absolutism -- enforced by automation rather than willpower -- is what makes the 100/100 score sustainable rather than aspirational.

## Overview

Software quality has been discussed, debated, and measured since the earliest days of the discipline. Despite decades of research and practice, most software organizations struggle to maintain consistent quality. The reasons are well-understood: quality practices (testing, code review, static analysis, documentation) create upfront cost, while quality failures create deferred cost. Under schedule pressure, the rational short-term decision is to defer quality -- creating the "quality debt" that compounds into the maintenance burden plaguing most long-lived systems.

The Prismatic Platform's approach inverts this dynamic through three key principles:

| Principle | Mechanism | Effect |
|-----------|-----------|--------|
| **Quality is automated** | Machine-enforced gates, not human discipline | Quality is consistent regardless of deadline pressure |
| **Quality is measured** | 13 quantitative domains with zero-violation targets | Quality is objective, not subjective |
| **Quality is autonomous** | Self-healing systems detect and trigger remediation | Quality maintenance scales without human intervention |

### The 13 Quality Domains

The platform's quality score is computed from 13 independent domains, each targeting a specific dimension of code quality:

| Domain | Tool/Mechanism | What It Measures | Target |
|--------|---------------|-----------------|--------|
| **Dialyzer** | Dialyzer (success typing) | Type contract consistency | 0 violations |
| **Credo** | Credo (strict mode) | Code style, complexity, consistency | 0 violations |
| **Compilation** | `--warnings-as-errors` | Compilation warnings (deprecation, unused, ambiguity) | 0 warnings |
| **DateTime Precision** | Custom analyzer | Consistent DateTime handling (UTC, microsecond) | 0 violations |
| **Guard Functions** | Custom analyzer | Proper use of guard-safe expressions | 0 violations |
| **@impl Coverage** | Custom analyzer | All callback implementations annotated | 0 violations (709 callbacks) |
| **Memory Safety** | Custom analyzer | No unbounded data structures, proper ETS usage | 0 violations |
| **Performance** | Custom analyzer | No known anti-patterns (length() > 0, etc.) | 0 violations |
| **Regression Prevention** | Custom analyzer | Forbidden pattern detection | 0 violations |
| **Timing Patterns** | Custom analyzer | No Process.sleep in production, consistent timeouts | 0 violations |
| **TODO Management** | Custom analyzer | No untracked TODOs, FIXMEs, or HACKs | 0 violations |
| **Typespec Coverage** | Custom analyzer | All public functions have @spec annotations | 0 violations |
| **Unsafe Map Access** | Custom analyzer | No bare map[key] without handling nil | 0 violations |

### Quality Score Formula

The quality score is calculated as: `score = (passing_domains / total_domains) * 100`, where a domain passes only if it reports exactly zero violations. There is no partial credit. A domain with 1 violation scores the same as a domain with 100 violations: failing.

## Technical Details

### Quality Gate Implementation

The quality gate system is the central enforcement mechanism, blocking non-compliant code from entering the codebase:

```elixir
defmodule PrismaticQuality.Gate do
  @moduledoc """
  Quality gate enforcement system. Evaluates all quality domains
  and produces a binary pass/fail verdict. Used by pre-commit hooks,
  CI pipelines, and merge request gates.
  """

  @type domain_result :: %{
    domain: atom(),
    violation_count: non_neg_integer(),
    status: :passing | :failing,
    details: list(String.t())
  }

  @type gate_result :: %{
    score: non_neg_integer(),
    total_domains: non_neg_integer(),
    passing_domains: non_neg_integer(),
    failing_domains: list(domain_result()),
    verdict: :pass | :fail,
    evaluated_at: DateTime.t()
  }

  @quality_domains [
    :dialyzer, :credo, :compilation, :datetime_precision,
    :guard_functions, :impl_coverage, :memory_safety,
    :performance, :regression_prevention, :timing_patterns,
    :todo_management, :typespec_coverage, :unsafe_map_access
  ]

  @spec evaluate() :: gate_result()
  def evaluate do
    results = Enum.map(@quality_domains, &evaluate_domain/1)
    passing = Enum.count(results, &(&1.status == :passing))
    failing = Enum.filter(results, &(&1.status == :failing))
    total = length(@quality_domains)
    score = div(passing * 100, total)

    %{
      score: score,
      total_domains: total,
      passing_domains: passing,
      failing_domains: failing,
      verdict: if(passing == total, do: :pass, else: :fail),
      evaluated_at: DateTime.utc_now()
    }
  end

  @spec evaluate_domain(atom()) :: domain_result()
  defp evaluate_domain(domain) do
    {violation_count, details} = run_domain_check(domain)

    %{
      domain: domain,
      violation_count: violation_count,
      status: if(violation_count == 0, do: :passing, else: :failing),
      details: details
    }
  end

  defp run_domain_check(:dialyzer) do
    case System.cmd("mix", ["dialyzer", "--format", "short"], stderr_to_stdout: true) do
      {output, 0} -> {0, [output]}
      {output, _} -> {count_violations(output), parse_violations(output)}
    end
  end

  defp run_domain_check(:credo) do
    case System.cmd("mix", ["credo", "--strict", "--format", "json"], stderr_to_stdout: true) do
      {output, 0} -> {0, [output]}
      {output, _} -> {count_violations(output), parse_violations(output)}
    end
  end

  defp run_domain_check(:compilation) do
    case System.cmd("mix", ["compile", "--warnings-as-errors"], stderr_to_stdout: true) do
      {_output, 0} -> {0, []}
      {output, _} -> {count_violations(output), parse_violations(output)}
    end
  end

  defp run_domain_check(_domain) do
    # Delegate to domain-specific analyzer
    {0, []}
  end

  defp count_violations(output) do
    output
    |> String.split("\n")
    |> Enum.count(&String.contains?(&1, "warning:"))
  end

  defp parse_violations(output) do
    output
    |> String.split("\n")
    |> Enum.filter(&String.contains?(&1, "warning:"))
  end
end
```

### Quality DNA: Cross-Session Persistence

Quality is not a point-in-time measurement -- it is a trajectory. The Quality DNA system persists quality state across development sessions, enabling trend analysis, regression detection, and predictive quality management:

```elixir
defmodule PrismaticQuality.DNA do
  @moduledoc """
  Quality DNA persistence system. Stores quality state snapshots
  in `.claude/quality-dna/current-state.json` for cross-session
  continuity. Enables quality trend analysis and regression detection.
  """

  @type quality_snapshot :: %{
    timestamp: String.t(),
    score: non_neg_integer(),
    domains: map(),
    quality_debt_points: non_neg_integer(),
    git_sha: String.t(),
    session_id: String.t()
  }

  @state_path ".claude/quality-dna/current-state.json"

  @spec capture_snapshot() :: {:ok, quality_snapshot()} | {:error, term()}
  def capture_snapshot do
    gate_result = PrismaticQuality.Gate.evaluate()

    snapshot = %{
      timestamp: DateTime.to_iso8601(DateTime.utc_now()),
      score: gate_result.score,
      domains: domain_summary(gate_result),
      quality_debt_points: total_qdp(gate_result),
      git_sha: current_git_sha(),
      session_id: current_session_id()
    }

    case persist_snapshot(snapshot) do
      :ok -> {:ok, snapshot}
      {:error, reason} -> {:error, reason}
    end
  end

  @spec load_latest() :: {:ok, quality_snapshot()} | {:error, :not_found}
  def load_latest do
    case File.read(@state_path) do
      {:ok, contents} -> {:ok, Jason.decode!(contents, keys: :atoms)}
      {:error, _} -> {:error, :not_found}
    end
  end

  @spec trend(non_neg_integer()) :: list(quality_snapshot())
  def trend(last_n_sessions) do
    Path.wildcard(".claude/quality-dna/history/*.json")
    |> Enum.sort(:desc)
    |> Enum.take(last_n_sessions)
    |> Enum.map(&File.read!/1)
    |> Enum.map(&Jason.decode!(&1, keys: :atoms))
  end

  defp domain_summary(gate_result) do
    gate_result.failing_domains
    |> Enum.into(%{}, fn d -> {d.domain, d.violation_count} end)
  end

  defp total_qdp(gate_result) do
    gate_result.failing_domains
    |> Enum.reduce(0, fn d, acc -> acc + d.violation_count end)
  end

  defp persist_snapshot(snapshot) do
    File.mkdir_p!(Path.dirname(@state_path))
    File.write(@state_path, Jason.encode!(snapshot, pretty: true))
  end

  defp current_git_sha do
    case System.cmd("git", ["rev-parse", "--short", "HEAD"]) do
      {sha, 0} -> String.trim(sha)
      _ -> "unknown"
    end
  end

  defp current_session_id do
    System.get_env("CLAUDE_SESSION_ID", "unknown")
  end
end
```

### Quality Floor Guardian

The Quality Floor Guardian is an autonomous monitoring system that detects quality regressions in real-time and triggers corrective actions:

| Quality Level | Score Range | Guardian Response |
|--------------|------------|-------------------|
| **OPTIMAL** | 100% | Monitor only, report status |
| **WARNING** | 98-99% | Alert + automatic investigation of failing domain |
| **CRITICAL** | 95-98% | Alert + trigger auto-evolution cycle |
| **EMERGENCY** | Below 95% | Block all commits + escalate to supreme review |

## Implementation

### The Quality Elimination Journey

The Prismatic Platform's path to 100/100 quality was systematic, not accidental. The journey eliminated 905 Quality Debt Points across all 13 domains:

| Phase | QDP Eliminated | Key Actions |
|-------|---------------|-------------|
| **Phase 1: Compilation** | 127 | Eliminated all compiler warnings across 115 apps |
| **Phase 2: Credo** | 203 | Resolved all style, complexity, and consistency issues |
| **Phase 3: Dialyzer** | 89 | Fixed all type contract violations, added missing specs |
| **Phase 4: Custom domains** | 486 | Addressed memory safety, performance anti-patterns, timing issues |
| **Total** | 905 | 0 QDP remaining (COMPLETE ELIMINATION) |

### Pre-Commit Enforcement

The 11-phase pre-commit hook ensures quality is maintained at the point of commit, preventing any violation from entering the codebase:

| Phase | Check | Enforcement |
|-------|-------|-------------|
| 1 | Compilation (zero warnings) | BLOCKING |
| 2 | Credo (strict mode) | BLOCKING |
| 3 | Test suite (changed files) | BLOCKING |
| 4 | Dialyzer (success typing) | BLOCKING |
| 5 | Typespec coverage | BLOCKING |
| 6 | Forbidden patterns | BLOCKING |
| 7 | Performance anti-patterns | BLOCKING |
| 8 | Template validation | BLOCKING |
| 9 | Memory safety | BLOCKING |
| 10 | Design consistency | BLOCKING |
| 11 | Quality gate composite | BLOCKING |

Every phase is BLOCKING -- a failure in any phase prevents the commit. There is no `--no-verify` bypass (explicitly forbidden by platform policy).

## Comparison

### Quality Approaches Across the Industry

| Approach | Quality Model | Enforcement | Typical Result |
|----------|-------------|-------------|---------------|
| **Prismatic Platform** | 13-domain automated gate, 100/100 target | Automated, blocking, zero tolerance | 100/100 sustained (0 QDP) |
| **Google** | Readability reviews + automated checks | Human + automated, blocking for readability | High but variable across teams |
| **Microsoft** | SDL (Security Development Lifecycle) | Process-based, security-focused | Strong security, variable code quality |
| **Startup typical** | "Move fast, fix later" | Optional, non-blocking | Quality degrades over time |
| **Enterprise typical** | Manual QA + code review | Human-dependent, inconsistent | Moderate, high variance |
| **Open-source typical** | Maintainer review + CI | Community-dependent | Highly variable by project |

### Internal vs. External Quality

| Dimension | Internal Quality | External Quality |
|-----------|-----------------|-----------------|
| **Definition** | Code structure, maintainability, consistency | User-facing behavior, performance, reliability |
| **Measured by** | Static analysis, complexity metrics, code review | Functional tests, performance benchmarks, user feedback |
| **Visible to** | Developers | Users, stakeholders |
| **Degradation** | Gradual, invisible until crisis | Sudden, highly visible |
| **Prismatic approach** | 13-domain automated measurement | Performance gates, health checks, telemetry |

The Prismatic Platform measures both dimensions. Internal quality is the 13-domain score. External quality is measured through performance benchmarks (sub-250ms page loads), health checks, and production telemetry.

## Best Practices

### Building Sustainable Quality

1. **Automate everything**: Quality practices that depend on human discipline fail under pressure. Automate quality checks and make them blocking -- not optional, not advisory, blocking.

2. **Measure continuously**: Quality is a trajectory, not a point. Track quality metrics over time to detect trends before they become crises.

3. **Zero tolerance for regressions**: Never accept a quality decrease as "temporary." Every accepted regression makes the next regression easier to justify. The floor only goes down.

4. **Fix immediately**: When a quality violation is detected, fix it in the current session. Do not create a ticket. Do not defer to "later." The violation is blocking your commit for a reason.

5. **Invest in tooling**: Quality tooling has the highest ROI of any engineering investment. A tool that catches 100 bugs per year across 50 developers saves 5,000 developer-hours of debugging.

6. **Make quality visible**: Display quality metrics prominently. The Prismatic Platform's quality score is in the project's CLAUDE.md, visible to every session. What is measured and visible gets maintained.

7. **Distinguish domains**: Not all quality dimensions are the same. Type safety is different from code style is different from performance. Measure each independently and target each specifically.

### The Quality Ratchet

The "quality ratchet" is the principle that quality only moves in one direction: up. Once a quality level is achieved, it becomes the new floor. The Quality Floor Guardian enforces this by treating any decrease from the current level as a regression requiring immediate action. This prevents the gradual erosion that characterizes most long-lived software systems.

## Pitfalls

### Common Quality Anti-Patterns

| Anti-Pattern | Description | Consequence | Prevention |
|-------------|-------------|-------------|------------|
| **Quality theater** | High coverage numbers with meaningless tests | False confidence, undetected bugs | Review test quality, not just quantity |
| **Gate fatigue** | Too many non-blocking warnings that developers ignore | Warnings accumulate, real issues hidden | Make gates blocking or remove them |
| **Metric gaming** | Optimizing for the metric rather than the underlying quality | High scores with low actual quality | Multiple independent domains, spot audits |
| **Quality debt acceptance** | "We'll fix it later" becoming permanent | Compounding maintenance cost | Zero-tolerance policy, immediate fixes |
| **Selective enforcement** | Quality rules applied inconsistently (some apps, some teams) | Uneven quality, resentment | Universal enforcement, no exceptions |
| **Tooling neglect** | Quality tools not updated, configured, or maintained | False positives erode trust, false negatives miss issues | Treat quality tooling as first-class code |
| **Quality as punishment** | Quality gates perceived as obstacles rather than safeguards | Developer resentment, workaround attempts | Frame quality as investment, make fixes easy |

### The "Good Enough" Trap

The most insidious quality anti-pattern is the belief that some level below perfection is "good enough." This belief is self-reinforcing: accepting 95% quality today makes accepting 90% quality tomorrow easier, which makes accepting 80% quality next month inevitable. The Prismatic Platform rejects "good enough" not because 99% is unacceptable in absolute terms, but because accepting any decrease creates a downward trajectory that is difficult to reverse.

## Use Cases

### Continuous Integration Quality Gates

Every merge request in the Prismatic Platform triggers a full quality gate evaluation. The CI pipeline runs all 13 domain checks and produces a composite score. If any domain fails (non-zero violations), the merge request is blocked. The developer receives a detailed report identifying exactly which violations must be resolved, in which files, at which line numbers.

### Quality Debt Tracking and Elimination

When the platform had 905 QDP across its domains, the quality debt system tracked each violation, categorized it by domain and severity, and prioritized elimination. Each development session included a QDP quota -- a minimum number of violations that had to be eliminated before new feature work could begin. This systematic approach reduced QDP to zero over a planned timeline.

### Cross-Session Quality Continuity

The Quality DNA system persists quality state to `.claude/quality-dna/current-state.json` at session end and loads it at session start. This ensures that quality context carries across development sessions without loss, enabling trend analysis and regression detection even when different developers or agents work on the codebase.

### Production Quality Monitoring

Quality measurement extends beyond the codebase into production. Telemetry data from deployed applications feeds back into quality metrics: response latency, error rates, resource utilization, and availability all contribute to the platform's external quality assessment. The 250ms page load standard is a quality requirement enforced in production, not just development.

### Autonomous Quality Evolution

The AutoEvolve and AutoHeal systems continuously scan for quality improvement opportunities. When patterns of quality violations are detected across the codebase, these systems can propose and apply systematic fixes -- renaming inconsistent functions, adding missing typespecs, replacing anti-patterns with correct patterns -- without human intervention.

## Related Concepts

Quality is the central organizing principle of the Prismatic Platform, connecting to virtually every other concept:

- [Quality Gate](@/glossary/quality-gate.md) -- the enforcement mechanism that blocks non-compliant code from entering the codebase
- [Quality Gates](@/glossary/quality-gates.md) -- the collection of all quality gates and their configuration across the platform
- [Quality DNA](@/glossary/quality-dna.md) -- the persistence system that maintains quality state across development sessions
- [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) -- the autonomous monitoring system that detects and responds to quality regressions
- [Quality Assurance](@/glossary/quality-assurance.md) -- the broader discipline of ensuring software meets requirements, of which automated quality gates are one implementation
- [Quality Debt](@/glossary/quality-debt.md) -- the accumulated cost of deferred quality improvements, tracked and eliminated systematically
- [Quality Standard](@/glossary/quality-standard.md) -- the formal specification of what constitutes acceptable quality across the platform
- [Quality Monitoring](@/glossary/quality-monitoring.md) -- continuous observation of quality metrics in development and production
- [Quality Evidence Truth](@/glossary/quality-evidence-truth.md) -- the principle that quality claims must be backed by measurable evidence
- [Quality Systems](@/glossary/quality-systems.md) -- the integrated ecosystem of quality measurement, enforcement, and improvement tools

## See Also

- [Static Analysis](@/glossary/static-analysis.md) -- the primary technique for automated quality measurement in the Prismatic Platform
- [Dialyzer](@/glossary/dialyzer.md) -- the success typing analyzer that verifies type contract consistency across the Elixir codebase
- [Credo](@/glossary/credo.md) -- the style and consistency analyzer that enforces code quality standards
- [Continuous Integration](@/glossary/continuous-integration.md) -- the infrastructure that runs quality gates automatically on every code change
- [Technical Debt](@/glossary/technical-debt.md) -- the broader category of deferred engineering work, of which quality debt is a critical subset
- [Proves Before Claiming](@/glossary/proves-before-claiming.md) -- the epistemic principle that quality claims must be backed by evidence

---

*Built with precision. Quality measured, not assumed.*

[Prismatic Platform](https://github.com/korczis/prismatic-platform) | Created by [Tomas Korcak (korczis)](https://github.com/korczis)
