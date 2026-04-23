+++
title = "Code Quality"
weight = 50
[extra]
description = "Measurable characteristics of source code including readability, maintainability, correctness, performance, and security, enforced in the Prismatic Platform through Credo, Dialyzer, quality gates, and a 100/100 quality score across 13 domains"
category = "quality"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate-to-advanced"
domain_category = "Software Quality"
related_concepts = ["software-craftsmanship", "maintainability-index", "cyclomatic-complexity", "technical-debt-ratio", "defect-density"]
implementation_status = "production"
authority_level = "platform-core"
difficulty_rating = 5
prerequisites = ["programming-fundamentals", "testing-basics", "static-analysis-concepts"]
learning_path = ["code-quality", "credo", "dialyzer", "quality-gate", "clean-run", "formal-verification"]
interactive_demos = ["/labs/glossary/code-quality"]
code_examples = ["elixir", "bash"]
external_resources = ["https://www.sonarsource.com/learn/code-quality/", "https://hexdocs.pm/credo/overview.html"]
version_introduced = "gen-1"
stability_level = "stable"
testing_scenarios = ["quality-gate-passage", "credo-compliance", "dialyzer-validation", "coverage-verification", "forbidden-pattern-detection", "performance-standard"]
keywords = ["code-quality", "quality-score", "static-analysis", "credo", "dialyzer", "quality-gates", "clean-run", "code-coverage", "maintainability"]
tags = ["glossary", "quality", "core", "static-analysis"]
related_terms = ["credo", "dialyzer", "static-analysis", "quality-gate", "clean-run", "code-coverage", "code-reviews", "pre-commit-hooks", "regression-testing", "typespec", "no-mercy-no-doubts", "technical-debt"]
word_count = 1543
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Code Quality - Prismatic Platform"
+++

## Definition

Code quality is the aggregate measure of how well source code meets defined standards for readability, maintainability, correctness, performance, security, and adherence to established conventions. It is not a subjective aesthetic judgment but a collection of measurable properties that can be quantified through static analysis, dynamic testing, and structural metrics. High code quality means the code is easy to read, safe to modify, demonstrably correct, efficient in execution, and secure against known attack vectors. Low code quality means the code is fragile, opaque, bug-prone, and expensive to maintain.

## Overview

Code quality occupies a unique position in software engineering: everyone agrees it matters, but teams routinely disagree about what it means and how to measure it. This disagreement often leads to quality being treated as a subjective preference rather than an engineering discipline. The Prismatic Platform resolves this by defining code quality as a measurable score (currently 100/100) computed across 13 distinct quality domains, each with automated enforcement.

The economic argument for code quality is well established. Studies from IBM, Microsoft, and the DORA research program consistently show that high-quality codebases experience 2-10x fewer production incidents, 3-5x faster onboarding for new developers, and 2-4x faster feature delivery velocity compared to low-quality codebases. The reason is straightforward: in a high-quality codebase, developers spend most of their time writing new code; in a low-quality codebase, they spend most of their time understanding, debugging, and working around existing code.

Code quality is not binary (good/bad) but multi-dimensional. Code can have excellent readability but poor performance, or strong type safety but missing documentation. A comprehensive quality system must measure all dimensions independently and provide aggregate scoring that weights dimensions according to their importance for the specific project.

The philosophical foundation of code quality in the Prismatic Platform rests on two complementary principles: [Code as Truth](/glossary/code-as-truth/) (the code is the authoritative representation of system behavior) and [Code as Hypothesis](/glossary/code-as-hypothesis/) (every implementation is provisional until validated). Together, these principles mean that code must be both the definitive record and a rigorously tested proposition. Code quality is the measure of how well the code fulfills both roles.

## Technical Details

### Quality Dimensions

Code quality decomposes into distinct dimensions, each measurable through specific techniques:

| Dimension | What It Measures | Measurement Technique | Tool |
|-----------|-----------------|----------------------|------|
| **Correctness** | Code does what it claims | Automated testing, property tests | ExUnit, StreamData |
| **Readability** | Humans can understand the code | Naming analysis, complexity metrics | Credo |
| **Maintainability** | Code can be safely modified | Coupling, cohesion, dependency depth | Credo, custom checks |
| **Type Safety** | Types are consistent and specified | Success typing analysis | Dialyzer |
| **Performance** | Meets time/space requirements | Benchmarks, profiling | Benchee, :fprof |
| **Security** | Resistant to known attack vectors | Vulnerability scanning, input validation | SAST, custom checks |
| **Documentation** | Public APIs are documented | @moduledoc/@doc/@spec presence | Credo, Dialyzer |
| **Consistency** | Follows uniform conventions | Style checking | Credo, Formatter |
| **Coverage** | Code paths are tested | Line and branch coverage | ExCoveralls |
| **Reliability** | Handles errors gracefully | Error pattern analysis | Custom checks |

### The 13 Quality Domains

The Prismatic Platform tracks code quality across 13 specific domains, each scored independently:

```
Domain                      Status    Violations
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dialyzer                    PERFECT   0
Credo                       PERFECT   0
Compilation                 PERFECT   0
DateTime Precision          PERFECT   0
Guard Functions             PERFECT   0
@impl Coverage              PERFECT   0 (709 callbacks)
Memory Safety               PERFECT   0
Performance                 PERFECT   0
Regression Prevention       PERFECT   0
Timing Patterns             PERFECT   0
TODO Management             PERFECT   0
Typespec Coverage           PERFECT   0
Unsafe Map Access           PERFECT   0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall Score:              100/100
```

Each domain represents a specific class of defects that has been driven to zero through automated detection and enforcement.

### Static Analysis with Credo

[Credo](/glossary/credo/) provides the foundation of code quality measurement through five check categories:

```elixir
defmodule Prismatic.Quality.CredoAnalysis do
  @moduledoc """
  Integrates Credo static analysis into the quality measurement system.
  Runs in strict mode, treating all check priorities as violations.
  Custom checks extend Credo's built-in categories with
  platform-specific quality rules.
  """

  @type check_category :: :consistency | :readability | :refactoring | :warning | :design
  @type violation :: %{
    category: check_category(),
    check: module(),
    message: String.t(),
    file: String.t(),
    line: non_neg_integer(),
    priority: :A | :B | :C | :D | :F
  }

  @spec analyze(keyword()) :: {:ok, [violation()]} | {:error, term()}
  def analyze(opts \\ []) do
    mode = Keyword.get(opts, :mode, :strict)

    case run_credo(mode) do
      {:ok, %{issues: issues}} ->
        violations = Enum.map(issues, &format_violation/1)
        {:ok, violations}

      {:error, reason} ->
        {:error, {:credo_failed, reason}}
    end
  end

  @spec compliant?() :: boolean()
  def compliant? do
    case analyze() do
      {:ok, []} -> true
      {:ok, _violations} -> false
      {:error, _} -> false
    end
  end

  @spec custom_checks() :: [module()]
  def custom_checks do
    [
      PrismaticCredo.Check.Regression.HardcodedCiValues,
      PrismaticCredo.Check.Regression.HeexCssCustomProperties,
      PrismaticCredo.Check.Regression.JavascriptRegexFlags,
      PrismaticCredo.Check.Regression.SuggestUnusedVariablePrefix,
      PrismaticCredo.Check.Regression.UnsafeFunctionReferences
    ]
  end

  defp run_credo(:strict) do
    # Strict mode: all priorities treated as violations
    Credo.run(["--strict", "--format", "json"])
  end

  defp run_credo(:normal) do
    Credo.run(["--format", "json"])
  end

  defp format_violation(issue) do
    %{
      category: issue.category,
      check: issue.check,
      message: issue.message,
      file: issue.filename,
      line: issue.line_no,
      priority: issue.priority
    }
  end
end
```

### Type Safety with Dialyzer

[Dialyzer](/glossary/dialyzer/) performs success typing analysis, catching type-level inconsistencies that unit tests typically miss:

```elixir
defmodule Prismatic.Quality.DialyzerAnalysis do
  @moduledoc """
  Integrates Dialyzer success typing analysis into the quality system.
  Validates that all @spec annotations are consistent with implementations
  and that no type mismatches exist across module boundaries.
  """

  @type warning_type ::
    :no_return
    | :no_match
    | :pattern_match
    | :guard_fail
    | :contract_supertype
    | :callback_type_mismatch
    | :unknown_type

  @type warning :: %{
    type: warning_type(),
    file: String.t(),
    line: non_neg_integer(),
    message: String.t()
  }

  @spec check() :: {:ok, :clean} | {:error, [warning()]}
  def check do
    case System.cmd("mix", ["dialyzer", "--format", "short"], stderr_to_stdout: true) do
      {output, 0} ->
        {:ok, :clean}

      {output, _exit_code} ->
        warnings = parse_warnings(output)
        {:error, warnings}
    end
  end

  @spec typespec_coverage() :: {:ok, %{total: non_neg_integer(), with_spec: non_neg_integer(), percentage: float()}}
  def typespec_coverage do
    modules = discover_all_modules()
    total = count_public_functions(modules)
    with_spec = count_functions_with_specs(modules)
    percentage = if total > 0, do: with_spec / total * 100.0, else: 100.0

    {:ok, %{total: total, with_spec: with_spec, percentage: percentage}}
  end

  defp discover_all_modules do
    :application.loaded_applications()
    |> Enum.flat_map(fn {app, _, _} ->
      case :application.get_key(app, :modules) do
        {:ok, modules} -> modules
        _ -> []
      end
    end)
    |> Enum.filter(&String.starts_with?(Atom.to_string(&1), "Elixir.Prismatic"))
  end
end
```

### Forbidden Patterns

The quality system detects and blocks known anti-patterns through automated scanning:

```elixir
defmodule Prismatic.Quality.ForbiddenPatterns do
  @moduledoc """
  Detects forbidden patterns in the codebase that violate
  platform quality standards. These patterns are blocked
  at pre-commit time with zero tolerance.
  """

  @type pattern_category :: :mocks | :stubs | :placeholders | :naive | :localhost | :test_skips
  @type severity :: :block | :warn

  @patterns [
    # Mocks in production code
    %{pattern: ~r/Mox\.defmock/, category: :mocks, scope: "lib/", severity: :block},

    # Stub implementations
    %{pattern: ~r/raise\s+"not implemented"/, category: :stubs, scope: "lib/", severity: :block},
    %{pattern: ~r/raise\s+:not_implemented/, category: :stubs, scope: "lib/", severity: :block},

    # Placeholder comments
    %{pattern: ~r/#\s*PLACEHOLDER/i, category: :placeholders, scope: "all", severity: :block},
    %{pattern: ~r/#\s*STUB/i, category: :placeholders, scope: "all", severity: :block},
    %{pattern: ~r/#\s*FIXME/i, category: :placeholders, scope: "all", severity: :block},
    %{pattern: ~r/#\s*HACK/i, category: :placeholders, scope: "all", severity: :block},
    %{pattern: ~r/#\s*WORKAROUND/i, category: :placeholders, scope: "all", severity: :block},
    %{pattern: ~r/#\s*XXX/i, category: :placeholders, scope: "all", severity: :block},

    # Naive implementations
    %{pattern: ~r/#\s*naive/i, category: :naive, scope: "lib/", severity: :block},
    %{pattern: ~r/#\s*temporary/i, category: :naive, scope: "lib/", severity: :block},
    %{pattern: ~r/#\s*quick and dirty/i, category: :naive, scope: "lib/", severity: :block},

    # Hardcoded localhost in production code
    %{pattern: ~r/"http:\/\/localhost/, category: :localhost, scope: "lib/", severity: :warn},

    # Skipped tests without issue reference
    %{pattern: ~r/@tag\s+:skip(?!\s*#\s*\w+-\d+)/, category: :test_skips, scope: "test/", severity: :warn}
  ]

  @spec scan() :: {:ok, non_neg_integer()} | {:error, [map()]}
  def scan do
    violations =
      @patterns
      |> Enum.flat_map(&scan_pattern/1)
      |> Enum.filter(&in_scope?/1)
      |> Enum.reject(&whitelisted?/1)

    blocking = Enum.filter(violations, &(&1.severity == :block))

    case blocking do
      [] -> {:ok, length(violations)}
      _ -> {:error, blocking}
    end
  end

  @spec whitelisted?(map()) :: boolean()
  defp whitelisted?(%{file: file}) do
    whitelisted_paths = [
      "lib/mix/tasks/quality/",
      "prismatic_credo/",
      "config/",
      "garden/",
      "deps/",
      "_build/"
    ]

    Enum.any?(whitelisted_paths, &String.contains?(file, &1))
  end
end
```

### Quality Score Computation

The aggregate quality score is computed from domain scores with configurable weights:

```elixir
defmodule Prismatic.Quality.Score do
  @moduledoc """
  Computes the aggregate quality score from individual domain scores.
  Each domain contributes proportionally based on its weight.
  A perfect score (100) requires zero violations across all domains.
  """

  @type domain :: atom()
  @type domain_score :: %{domain: domain(), violations: non_neg_integer(), weight: float()}

  @domain_weights %{
    dialyzer: 12.0,
    credo: 10.0,
    compilation: 10.0,
    typespec_coverage: 8.0,
    impl_coverage: 8.0,
    regression_prevention: 8.0,
    memory_safety: 7.0,
    performance: 7.0,
    guard_functions: 6.0,
    datetime_precision: 6.0,
    timing_patterns: 6.0,
    todo_management: 6.0,
    unsafe_map_access: 6.0
  }

  @spec compute([domain_score()]) :: {:ok, float()}
  def compute(domain_results) do
    total_weight = @domain_weights |> Map.values() |> Enum.sum()

    weighted_score =
      domain_results
      |> Enum.map(fn %{domain: domain, violations: v} ->
        weight = Map.get(@domain_weights, domain, 5.0)
        domain_score = if v == 0, do: 1.0, else: max(0.0, 1.0 - v * 0.1)
        weight * domain_score
      end)
      |> Enum.sum()

    score = weighted_score / total_weight * 100.0
    {:ok, Float.round(score, 1)}
  end

  @spec perfect?([domain_score()]) :: boolean()
  def perfect?(domain_results) do
    Enum.all?(domain_results, &(&1.violations == 0))
  end
end
```

## Implementation in Prismatic Platform

### Zero-Violation Achievement

The Prismatic Platform has achieved and maintains a 100/100 quality score with zero violations across all 13 domains. This required:

- **905 Quality Debt Points (QDP) eliminated**: Every existing violation was fixed, not suppressed
- **CASCADE pattern resolution**: Complex multi-domain violations that cascaded across modules
- **Memory Safety fixes**: Unsafe memory patterns identified and replaced with safe alternatives
- **IP Leakage Prevention**: 4-phase program to prevent intellectual property exposure
- **O(1) pattern detection**: Pattern matching optimized for 90-250x speedup

### Quality Floor Guardian

An autonomous monitoring system prevents quality regression:

```elixir
defmodule PrismaticSafety.QualityFloorGuardian do
  @moduledoc """
  Autonomous quality monitoring that detects and responds to
  quality degradation in real-time. Operates as a GenServer
  that periodically samples quality metrics and triggers
  appropriate responses based on enforcement levels.
  """

  use GenServer

  @enforcement_levels %{
    100..99 => :optimal,     # Monitor only
    98..98  => :warning,     # Alert + investigation
    95..97  => :critical,    # Auto-evolution trigger
    0..94   => :emergency    # Block commits + escalate
  }

  @spec current_score() :: {:ok, float()}
  def current_score do
    GenServer.call(__MODULE__, :current_score)
  end

  @spec enforcement_level() :: {:ok, atom()}
  def enforcement_level do
    {:ok, score} = current_score()
    level = determine_level(score)
    {:ok, level}
  end

  @impl true
  def handle_info(:periodic_check, state) do
    {:ok, score} = measure_quality()
    level = determine_level(score)

    new_state =
      state
      |> Map.put(:last_score, score)
      |> Map.put(:last_check, DateTime.utc_now())

    case level do
      :optimal -> :ok
      :warning -> emit_warning(score)
      :critical -> trigger_auto_evolution(score)
      :emergency -> block_commits_and_escalate(score)
    end

    schedule_next_check()
    {:noreply, new_state}
  end
end
```

### Quality DNA

Each application maintains a quality fingerprint in `.claude/quality-dna/current-state.json` that tracks its quality metrics over time. This enables cross-session continuity and trend detection:

```json
{
  "app": "prismatic_perimeter",
  "quality_score": 100,
  "domains": {
    "dialyzer": {"violations": 0, "last_checked": "2026-02-22T10:00:00Z"},
    "credo": {"violations": 0, "last_checked": "2026-02-22T10:00:00Z"},
    "compilation": {"violations": 0, "last_checked": "2026-02-22T10:00:00Z"}
  },
  "trends": {
    "score_7d": [100, 100, 100, 100, 100, 100, 100],
    "violations_30d": 0,
    "qdp_eliminated_total": 905
  }
}
```

### Predictive Pre-Commit

The pre-commit system includes predictive analysis that identifies risk patterns before they become violations:

| Risk Pattern | Detection Method | Action |
|-------------|-----------------|--------|
| `length() > 0` anti-pattern | AST scan | Suggest `!= []` or `Enum.empty?` |
| New `Process.sleep` | Regex | Flag for review (usually indicates test coupling) |
| Missing `@spec` | Module analysis | Block until spec added |
| Unsafe map access | AST pattern matching | Require `Map.get` or pattern match |
| High-risk file modification | Path matching | Require additional test coverage |

## Comparison with Alternatives

| Approach | Tooling | Enforcement | Score System | Strengths | Weaknesses |
|----------|---------|-------------|-------------|-----------|------------|
| **Prismatic (13 domains)** | Credo + Dialyzer + custom | Pre-commit blocking | 100-point composite | Comprehensive, zero-tolerance | High initial setup cost |
| **SonarQube** | SonarQube platform | CI/CD gating | A-E rating + metrics | Industry standard, multi-language | Requires server, post-commit |
| **CodeClimate** | CodeClimate SaaS | PR checks | GPA (0.0-4.0) | Easy setup, GitHub integration | Limited customization |
| **ESLint/Prettier** | Linter + formatter | Pre-commit optional | Pass/fail per rule | Fast, well-established | JavaScript ecosystem only |
| **Manual Code Review** | Humans | PR approval | Subjective | Catches logic errors | Inconsistent, slow, unscalable |
| **No Formal System** | None | None | None | Zero overhead | Quality degrades rapidly |

The Prismatic approach is distinguished by its pre-commit enforcement (violations never enter the repository), its multi-domain scoring (13 independent quality dimensions), and its integration with autonomous evolution (quality improvements are discovered and applied automatically).

## Best Practices

### Define Quality Objectively

Replace subjective quality discussions with measurable criteria:

```bash
# Instead of "the code should be good quality"
# Define specific, measurable requirements:
mix compile --warnings-as-errors  # Zero compilation warnings
mix credo --strict                 # Zero Credo violations
mix dialyzer                       # Zero type errors
mix test --cover                   # Coverage above threshold
mix quality.forbidden_patterns     # Zero forbidden patterns
```

### Automate Everything

Every quality check that can be automated should be automated. Manual quality processes are inherently inconsistent and do not scale:

```bash
# Automate quality verification in pre-commit hooks
# .githooks/pre-commit (simplified)
#!/bin/bash
set -e

echo "Phase 1: Compilation"
mix compile --warnings-as-errors --force

echo "Phase 2: Static Analysis"
mix credo --strict

echo "Phase 3: Type Checking"
mix dialyzer

echo "Phase 4: Tests"
mix test

echo "Phase 5: Coverage"
mix test --cover

echo "Phase 6: Forbidden Patterns"
mix quality.forbidden_patterns

echo "All quality gates passed"
```

### Invest in Custom Checks

Generic quality tools miss project-specific patterns. The Prismatic Platform extends Credo with custom checks that catch domain-specific anti-patterns:

```elixir
defmodule PrismaticCredo.Check.Regression.UnsafeFunctionReferences do
  @moduledoc """
  Custom Credo check that detects unsafe function references --
  patterns where a function is passed by name without verifying
  the target module exports it. This prevents runtime errors
  from typos in function references.
  """

  use Credo.Check,
    base_priority: :high,
    category: :warning

  @impl true
  def run(%SourceFile{} = source_file, params) do
    issue_meta = IssueMeta.for(source_file, params)

    source_file
    |> Credo.Code.prewalk(&traverse(&1, &2, issue_meta))
    |> Enum.reject(&is_nil/1)
  end
end
```

### Track Quality Trends

A single quality snapshot tells you where you are. Quality trends tell you where you are going. Monitor quality metrics over time to detect drift before it becomes critical:

```elixir
@spec quality_trend(non_neg_integer()) :: {:ok, [%{date: Date.t(), score: float()}]}
def quality_trend(days \\ 30) do
  # Load historical quality DNA snapshots
  snapshots =
    list_quality_snapshots()
    |> Enum.filter(&within_days?(&1.date, days))
    |> Enum.map(fn s -> %{date: s.date, score: s.quality_score} end)
    |> Enum.sort_by(& &1.date, Date)

  {:ok, snapshots}
end
```

### Fix Root Causes, Not Symptoms

When a quality violation is detected, fix the underlying pattern rather than the specific instance. If `length(list) > 0` appears in one place, search for it everywhere and fix all occurrences simultaneously.

## Common Pitfalls

### Optimizing for Metrics Instead of Quality

Teams sometimes game quality metrics (achieving high coverage without meaningful assertions, suppressing warnings instead of fixing them). Metrics should measure quality, not define it. The Prismatic Platform addresses this by measuring multiple dimensions and requiring zero violations, making gaming nearly impossible.

### Quality Gate Fatigue

Overly strict or poorly calibrated quality gates create friction that developers work around rather than comply with. The solution is not relaxing gates but ensuring they catch genuine issues and provide actionable feedback. Every Credo check explains why the pattern is problematic and how to fix it.

### Neglecting Runtime Quality

Static analysis catches structural problems but misses runtime issues (memory leaks, performance degradation, error handling gaps). Complement static analysis with runtime monitoring, property-based testing, and performance benchmarks.

### Treating Quality as a Phase

Quality is not a phase that happens after development ("we'll add tests later," "we'll refactor next sprint"). It is a continuous property of every code change. The pre-commit enforcement model ensures quality is maintained at every step, not deferred.

### Ignoring Quality Debt Accumulation

Even small quality violations compound. A single skipped test becomes a pattern. One suppressed warning becomes twenty. The 905 QDP elimination effort in the Prismatic Platform demonstrated the cost of accumulated debt -- it is always cheaper to fix violations immediately than to batch them.

## Use Cases

### Enterprise Platform Development

Large platforms with many contributors (like the Prismatic Platform with 115 apps) require automated quality enforcement because manual review cannot scale. The 13-domain quality system ensures consistent standards across the entire codebase.

### Regulatory Compliance

Industries with regulatory requirements (fintech, healthcare, security) need demonstrable code quality. The quality gate system produces auditable evidence that every change met defined standards.

### Open Source Projects

Open source projects that accept external contributions need quality gates to maintain consistency. Automated enforcement treats all contributions equally regardless of the author's familiarity with project conventions.

### Legacy System Modernization

When modernizing legacy systems, quality metrics identify the worst areas to address first. The quality scoring system prioritizes remediation by domain weight, focusing effort where it produces the most improvement.

### Team Scaling

As teams grow, quality consistency becomes harder to maintain through culture alone. Automated quality enforcement scales linearly with codebase size regardless of team size.

## Related Concepts

- [Credo](/glossary/credo/) -- the primary static analysis tool for Elixir code quality
- [Dialyzer](/glossary/dialyzer/) -- success typing analysis for type-level quality
- [Static Analysis](/glossary/static-analysis/) -- the broader category of automated code examination
- [Quality Gate](/glossary/quality-gate/) -- the enforcement mechanism for quality standards
- [Clean Run](/glossary/clean-run/) -- the zero-warning compilation standard
- [Code Coverage](/glossary/code-coverage/) -- metric measuring test completeness
- [Code Reviews](/glossary/code-reviews/) -- human evaluation complementing automated quality checks
- [Pre-commit Hooks](/glossary/pre-commit-hooks/) -- the enforcement point for quality validation
- [Regression Testing](/glossary/regression-testing/) -- tests that prevent quality degradation
- [Typespec](/glossary/typespec/) -- type annotations that enable Dialyzer analysis
- [No Mercy No Doubts](/glossary/no-mercy-no-doubts/) -- the doctrine that demands zero quality violations
- [Technical Debt](/glossary/technical-debt/) -- the accumulated cost of deferred quality work

## See Also

- [Code as Truth](/glossary/code-as-truth/) -- the code is the truth, so its quality determines truth readability
- [Code as Hypothesis](/glossary/code-as-hypothesis/) -- quality determines how rigorously hypotheses are validated
- [Code Change](/glossary/code-change/) -- the unit of work that quality gates evaluate
- [Fitness Score](/glossary/fitness-score/) -- platform-level health metric derived from quality
- [Autoevolve](/glossary/autoevolve/) -- autonomous quality improvement system
- [Autoheal](/glossary/autoheal/) -- autonomous quality repair system

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
