+++
title = "QDP"
weight = 11
[extra]
category = "quality"
description = "Quality Debt Points - metric tracking code quality issues where each violation counts as debt. Current platform total: 0 QDP (complete elimination)."
acronym = "QDP"
technical_domain = "Quality Engineering"
complexity_level = "Advanced"
platform_relevance = "Critical"
related_terms = ["cascade", "cascade-pattern", "clean-run", "autoheal", "autoevolve", "code-coverage", "typespec", "dialyzer", "qdp"]
elixir_libraries = ["credo", "dialyxir", "ex_unit", "stream_data"]
phoenix_integration = "Indirect - quality gates run before deployment of Phoenix applications"
beam_specific = false
prismatic_modules = ["PrismaticSafety.QualityFloorGuardian", "Mix.Tasks.Quality.Gates", "Mix.Tasks.Quality.ForbiddenPatterns"]
total_qdp = 0
total_eliminated = 905
quality_domains = 13
quality_score = "100/100"
enforcement_layers = 6
cascade_phases = 4
industry_comparison = "SonarQube, Code Climate, Coveralls"
first_introduced = "Gen 3"
last_updated = "2026-02-22"
tags = ["qdp", "quality", "debt", "metrics", "enforcement", "cascade", "zero-tolerance", "code-quality"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1494
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["QDP", "Quality", "Debt", "Points", "Current", "glossary", "Prismatic Platform", "Missing", "High", "Medium"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "QDP - Prismatic Platform"
+++

## Definition

QDP (Quality Debt Points) is the Prismatic Platform's quantitative metric for tracking code quality debt. Each quality violation -- a missing [typespec](@/glossary/typespec.md), an unsafe map access, a `length() > 0` anti-pattern, a missing `@impl` annotation, a compilation warning, a [Credo](@/glossary/clean-run.md) violation -- counts as one or more QDP depending on severity. The metric provides a single numeric score representing the total accumulated quality debt in the codebase, making quality debt visible, measurable, and actionable. Unlike vague qualitative assessments ("the code needs some cleanup"), QDP provides a precise, reproducible number that can be tracked over time, compared across sessions, and used as a gate condition for continuous integration pipelines.

QDP is modeled after financial technical debt: each violation represents a "loan" taken from code quality that must eventually be "repaid." Unlike financial debt, quality debt compounds silently and non-linearly -- a missing typespec today means a type error tomorrow, a missing `@impl` annotation means a callback regression next week, an unsafe map access means a production crash next month. The compounding nature means that 100 QDP is not merely twice as bad as 50 QDP; the interaction effects between violations create emergent failure modes that are worse than the sum of individual issues. A missing typespec on a function that uses unsafe map access creates a double-blind spot where neither static analysis nor runtime safety can protect against errors. QDP quantifies this accumulated risk as a single number, enabling data-driven quality management, trend analysis, and enforcement.

The Prismatic Platform's current QDP count is **0**, representing complete elimination of all tracked quality debt categories across all 115 umbrella applications and approximately 2.8 million lines of code. This achievement was accomplished through the systematic application of [CASCADE](@/glossary/cascade-pattern.md) patterns, which eliminated 905 QDP in a structured, measurable campaign spanning four phases. The zero-QDP state is now enforced through pre-commit hooks, CI/CD gates, and the Quality Floor Guardian -- making it structurally impossible to introduce new quality debt without explicit acknowledgment and immediate remediation.

## QDP Scoring Methodology

Each quality domain contributes QDP according to violation severity and potential impact on production reliability:

| Severity | QDP per Violation | Examples | Rationale |
|----------|------------------|---------|-----------|
| **Critical (P0)** | 5 QDP | Unsafe map access in production path, memory leak pattern, missing error handling on external calls | Can cause production crashes or data loss |
| **High (P1)** | 3 QDP | Missing typespec on public function, compilation warning, missing regression test | Blocks static analysis or hides defects |
| **Medium (P2)** | 2 QDP | Missing @impl annotation, Credo complexity violation, DateTime precision issue | Reduces maintainability or correctness |
| **Low (P3)** | 1 QDP | Style violation, minor Credo issue, TODO without context, guard function missing | Reduces readability or creates minor risk |

The scoring is additive within a domain but multiplicative across related domains. When a function has both a missing typespec (3 QDP) and unsafe map access (5 QDP), the effective debt is higher than 8 QDP because [Dialyzer](@/glossary/dialyzer.md) cannot protect the unsafe access without the typespec. This interaction effect is captured through the Quality Floor Guardian's composite scoring algorithm.

## Quality Domains (All at 0 Violations)

The 13 quality domains tracked by QDP cover the complete spectrum of code quality, from type safety through runtime behavior to documentation:

| Domain | What It Tracks | Detection Method | QDP Impact | Violations |
|--------|----------------|-----------------|-----------|------------|
| **[Dialyzer](@/glossary/dialyzer.md)** | Type system violations | Static analysis (Dialyzer PLT) | Critical/High | 0 |
| **Credo** | Code style and complexity | Credo analyzer (`--strict`) | Medium/Low | 0 |
| **Compilation** | Compiler warnings | `--warnings-as-errors` | High | 0 |
| **DateTime Precision** | Incorrect time handling | Pattern detection | Medium | 0 |
| **Guard Functions** | Missing or incorrect guards | AST analysis | Medium | 0 |
| **@impl Coverage** | Missing implementation annotations | Module analysis (709 checked) | Medium | 0 |
| **Memory Safety** | Potential memory leaks | Pattern detection | Critical | 0 |
| **Performance** | O(n) where O(1) is possible | Pattern detection (90-250x speedup potential) | High | 0 |
| **Regression Prevention** | Missing regression tests | Test coverage analysis | High | 0 |
| **Timing Patterns** | `Process.sleep` anti-patterns | AST pattern matching | Medium | 0 |
| **TODO Management** | Outstanding TODOs/FIXMEs | Comment scanning | Low | 0 |
| **[Typespec](@/glossary/typespec.md) Coverage** | Missing @spec annotations | Module introspection | High | 0 |
| **Unsafe Map Access** | `map.key` instead of `Map.get` | AST pattern matching | Critical | 0 |

## The 905 QDP Elimination Campaign

The elimination of 905 QDP represents one of the platform's signature quality achievements. The campaign used CASCADE patterns -- systematic, category-by-category elimination with verification at each stage. Each phase targeted specific violation categories, measured progress quantitatively, and verified that fixes did not introduce regressions:

| CASCADE Pattern | QDP Eliminated | Description |
|----------------|---------------|-------------|
| **Type Mismatch** | ~200 QDP | Resolved Dialyzer warnings across all apps, added missing typespecs |
| **Dead Code** | ~150 QDP | Removed unreachable code, unused functions, and orphaned modules |
| **Empty Check** | ~180 QDP | Replaced `length() > 0` with `Enum.any?/1` and pattern matching |
| **Timer Replacement** | ~75 QDP | Replaced `Process.sleep` with proper timer patterns and GenServer timeouts |
| **Nuclear Cache** | ~100 QDP | Fixed stale cache patterns in _build directory causing phantom warnings |
| **Other Patterns** | ~200 QDP | Typespec additions, @impl annotations, guard fixes, map access safety |

```
QDP Timeline:
905 QDP ----[CASCADE Phase 1]----> 600 QDP   (Type Mismatch + Dead Code)
600 QDP ----[CASCADE Phase 2]----> 300 QDP   (Empty Check + Timer Replacement)
300 QDP ----[CASCADE Phase 3]----> 100 QDP   (Nuclear Cache + Typespecs)
100 QDP ----[CASCADE Phase 4]---->  25 QDP   (@impl + Guards + Memory Safety)
 25 QDP ----[Final Sprint]------->   0 QDP   (COMPLETE ELIMINATION)
```

Each phase followed a strict protocol: identify all violations in the target category, create regression tests for the most critical ones, apply fixes, verify zero regressions, and update Quality DNA with the new baseline. The Nuclear Cache phase was particularly noteworthy -- approximately 100 QDP were phantom violations caused by stale compilation artifacts in the `_build` directory. The fix was the "nuclear cache" command: `rm -rf _build/dev/lib/prismatic_claude/ebin && rm -rf priv/plts/dialyzer.plt`, which forced a clean rebuild and revealed the true violation count.

## Enforcement Infrastructure

QDP is enforced at multiple levels, creating a defense-in-depth strategy that makes quality regression effectively impossible:

| Enforcement Layer | Mechanism | Trigger | Bypass Allowed |
|------------------|-----------|---------|----------------|
| **Pre-commit hooks** | `.githooks/pre-commit-quality-protection` (11 phases) | Every `git commit` | Never |
| **CI/CD pipeline** | `mix quality.gates` in GitLab CI | Every merge request | Never |
| **Quality Floor Guardian** | `prismatic_safety/quality_floor_guardian.ex` | Continuous monitoring | Never |
| **Session protocols** | QDP quota per Claude session | Every development session | Never |
| **[Autoheal](@/glossary/autoheal.md)** | `mix autoheal.cycle` | Automatic on regression detection | N/A (auto) |
| **[Autoevolve](@/glossary/autoevolve.md)** | `mix autoevolve.mega` | Session end protocol | N/A (auto) |

### Quality Gate Check Implementation

```elixir
defmodule Mix.Tasks.Quality.Gates do
  @moduledoc """
  Comprehensive quality gate check that validates all 13 quality domains.
  Returns non-zero exit code on any violation, blocking CI/CD pipelines.
  """

  use Mix.Task

  @spec run(list(String.t())) :: :ok | no_return()
  def run(args) do
    fast_mode = "--fast" in args

    results = [
      {:compilation, check_compilation()},
      {:dialyzer, check_dialyzer(fast_mode)},
      {:credo, check_credo()},
      {:typespecs, check_typespecs()},
      {:impl_coverage, check_impl_coverage()},
      {:memory_safety, check_memory_safety()},
      {:unsafe_map_access, check_unsafe_map_access()},
      {:timing_patterns, check_timing_patterns()},
      {:todo_management, check_todo_management()},
      {:datetime_precision, check_datetime_precision()},
      {:guard_functions, check_guard_functions()},
      {:performance, check_performance()},
      {:regression_prevention, check_regression_prevention()}
    ]

    qdp = calculate_qdp(results)

    case qdp do
      0 ->
        Mix.shell().info("QDP: 0 - all quality gates passed")
        :ok

      total ->
        Mix.shell().error("QDP: #{total} violations detected")
        report_violations(results)
        Mix.raise("Quality gates failed with #{total} QDP")
    end
  end

  defp calculate_qdp(results) do
    Enum.reduce(results, 0, fn {domain, count}, acc ->
      acc + count * severity_weight(domain)
    end)
  end

  defp severity_weight(:unsafe_map_access), do: 5
  defp severity_weight(:memory_safety), do: 5
  defp severity_weight(:dialyzer), do: 3
  defp severity_weight(:compilation), do: 3
  defp severity_weight(:typespecs), do: 3
  defp severity_weight(:regression_prevention), do: 3
  defp severity_weight(:impl_coverage), do: 2
  defp severity_weight(:credo), do: 2
  defp severity_weight(:datetime_precision), do: 2
  defp severity_weight(:guard_functions), do: 2
  defp severity_weight(:timing_patterns), do: 2
  defp severity_weight(:performance), do: 3
  defp severity_weight(:todo_management), do: 1

  defp report_violations(results) do
    results
    |> Enum.filter(fn {_domain, count} -> count > 0 end)
    |> Enum.each(fn {domain, count} ->
      Mix.shell().error("  #{domain}: #{count} violations (#{count * severity_weight(domain)} QDP)")
    end)
  end
end
```

## Forbidden Patterns Enforcement

Beyond the 13 quality domains, the platform enforces a comprehensive set of forbidden patterns that prevent quality debt from being introduced in the first place:

```elixir
defmodule Mix.Tasks.Quality.ForbiddenPatterns do
  @moduledoc """
  Scans the codebase for forbidden patterns that indicate quality debt,
  placeholder code, or incomplete implementations.
  """

  @forbidden_categories %{
    mocks: ~r/Mox\.defmock/,
    stubs: ~r/raise\s+"not implemented"|raise\s+:not_implemented/,
    placeholders: ~r/#\s*(PLACEHOLDER|STUB|MOCK|FIXME|HACK|WORKAROUND|XXX)/,
    naive: ~r/#\s*(naive|temporary|quick and dirty)/i,
    todos: ~r/#\s*TODO(?!\([a-zA-Z]+\))/
  }

  @spec run(list(String.t())) :: :ok | no_return()
  def run(args) do
    count_only = "--count-only" in args
    category_filter = extract_category(args)

    violations =
      scan_codebase()
      |> filter_whitelisted()
      |> filter_category(category_filter)

    total = length(violations)

    if count_only do
      Mix.shell().info("#{total}")
    else
      report_violations(violations)
    end

    if total > 0 do
      Mix.raise("#{total} forbidden patterns detected")
    end

    :ok
  end
end
```

| Category | Scope | Severity | Patterns | QDP Impact |
|----------|-------|----------|----------|------------|
| **Mocks** | lib/ | BLOCK | `Mox.defmock` in production code | 5 QDP |
| **Stubs** | lib/ | BLOCK | `raise "not implemented"` | 5 QDP |
| **Placeholders** | all | BLOCK | `# PLACEHOLDER`, `# STUB`, `# FIXME`, `# HACK` | 3 QDP |
| **Naive** | lib/ | BLOCK | `# naive`, `# temporary`, `# quick and dirty` | 3 QDP |
| **Localhost** | lib/ | WARN | `"http://localhost..."` in non-config | 1 QDP |
| **Test Skips** | test/ | WARN | `@tag :skip` without issue reference | 1 QDP |

## QDP and the NO MERCY Doctrine

QDP enforcement is a core expression of the [NO MERCY, NO DOUBTS](@/glossary/clean-run.md) doctrine. The doctrine demands zero tolerance for quality violations, and QDP provides the quantitative enforcement mechanism:

| Doctrine Principle | QDP Expression |
|-------------------|---------------|
| **Zero Tolerance** | QDP must be 0; any non-zero QDP blocks commits |
| **Complete Execution** | All 13 domains checked; no partial quality assessment |
| **Quality First** | Quality gates run before any merge is allowed |
| **No Excuses** | QDP violations must be fixed immediately, not deferred |
| **100% Test Coverage** | Missing tests count as QDP in the regression prevention domain |
| **Zero Stubs** | Placeholder code counts as QDP through forbidden patterns |
| **Production-Ready** | Every commit must maintain 0 QDP state |
| **Mandatory Regression Tests** | Every bug fix must include tests that count against QDP |

## Quality DNA Integration

QDP state is persisted across sessions through the Quality DNA system, which stores quality metric snapshots in JSON format at `.claude/quality-dna/current-state.json` in each application directory:

```json
{
  "quality_score": 100,
  "qdp_total": 0,
  "qdp_history": [
    {"session": 1, "qdp": 905, "date": "2025-11-01"},
    {"session": 15, "qdp": 600, "date": "2025-12-01"},
    {"session": 28, "qdp": 300, "date": "2025-12-15"},
    {"session": 35, "qdp": 100, "date": "2026-01-05"},
    {"session": 38, "qdp": 25, "date": "2026-01-15"},
    {"session": 42, "qdp": 0, "date": "2026-01-31"}
  ],
  "domains": {
    "dialyzer": {"violations": 0, "trend": "stable", "weight": 3},
    "credo": {"violations": 0, "trend": "stable", "weight": 2},
    "compilation": {"violations": 0, "trend": "stable", "weight": 3},
    "typespecs": {"violations": 0, "trend": "stable", "weight": 3},
    "impl_coverage": {"violations": 0, "trend": "stable", "weight": 2},
    "memory_safety": {"violations": 0, "trend": "stable", "weight": 5},
    "unsafe_map_access": {"violations": 0, "trend": "stable", "weight": 5},
    "timing_patterns": {"violations": 0, "trend": "stable", "weight": 2},
    "todo_management": {"violations": 0, "trend": "stable", "weight": 1},
    "datetime_precision": {"violations": 0, "trend": "stable", "weight": 2},
    "guard_functions": {"violations": 0, "trend": "stable", "weight": 2},
    "performance": {"violations": 0, "trend": "stable", "weight": 3},
    "regression_prevention": {"violations": 0, "trend": "stable", "weight": 3}
  },
  "last_updated": "2026-02-14T10:30:00Z",
  "session_count": 42,
  "apps_tracked": 115
}
```

The Quality DNA enables cross-session analysis: trend detection (is a domain degrading over sessions?), velocity tracking (how fast are QDP being eliminated?), and regression alerting (did a session introduce new QDP after a period of zero?). This historical dimension transforms QDP from a point-in-time measurement into a quality trajectory.

## Quality Floor Guardian

The Quality Floor Guardian is an autonomous monitoring system that detects quality regression and triggers remediation:

```elixir
defmodule PrismaticSafety.QualityFloorGuardian do
  @moduledoc """
  Autonomous quality monitoring that detects score degradation
  and triggers automatic evolution before issues impact the platform.
  Enforcement levels: OPTIMAL (100-99%), WARNING (98-99%),
  CRITICAL (95-98%), EMERGENCY (<95%).
  """

  use GenServer

  @enforcement_levels %{
    optimal: {99, 100},
    warning: {98, 99},
    critical: {95, 98},
    emergency: {0, 95}
  }

  @spec current_score() :: {:ok, non_neg_integer()} | {:error, term()}
  def current_score do
    GenServer.call(__MODULE__, :current_score)
  end

  @spec enforcement_level() :: :optimal | :warning | :critical | :emergency
  def enforcement_level do
    GenServer.call(__MODULE__, :enforcement_level)
  end
end
```

| Score Range | Level | Action |
|-------------|-------|--------|
| **100-99%** | OPTIMAL | Monitor only, log status |
| **98-99%** | WARNING | Alert, investigate cause |
| **95-98%** | CRITICAL | Auto-evolution trigger, block non-critical changes |
| **< 95%** | EMERGENCY | Block all commits, escalate to supreme review |

## Comparison with Industry Approaches

| Approach | Scope | Enforcement | Granularity | Zero-Tolerance |
|----------|-------|-------------|-------------|----------------|
| **QDP (Prismatic)** | 13 quality domains, all code | Pre-commit + CI + Guardian | Per-violation scoring with severity weights | Yes |
| **SonarQube** | Code smells, bugs, vulnerabilities | CI integration, quality gates | Issue severity (blocker/critical/major/minor) | Configurable |
| **Code Climate** | Maintainability, test coverage | GitHub integration | GPA-style scoring (A-F) | No |
| **Coveralls** | Test coverage only | CI integration | Coverage percentage per file | Configurable |
| **Technical Debt Ratio** | Estimated time to fix all issues | Advisory only | Time-based estimate | No |
| **ESLint/Prettier** | Style and syntax | Pre-commit hooks | Per-rule severity | Configurable |

QDP differs from these approaches in three fundamental ways. First, its enforcement model is not advisory -- it is a hard gate that blocks code from reaching the repository when violations exist. Second, it spans multiple analysis dimensions simultaneously (type safety, runtime behavior, documentation, performance, memory safety) rather than focusing on a single concern. Third, it integrates with autonomous remediation systems (autoheal, autoevolve) that can fix certain categories of QDP automatically without human intervention. This is the practical expression of the NO MERCY doctrine.

## Related Terms

- [CASCADE](@/glossary/cascade.md) - Systematic methodology that eliminated 905 QDP
- [Clean Run](@/glossary/clean-run.md) - Zero-warning compilation as a QDP enforcement mechanism
- [Autoheal](@/glossary/autoheal.md) - Automatic healing triggered by QDP regression
- [Autoevolve](@/glossary/autoevolve.md) - Platform evolution driven by QDP trend analysis
- [Dialyzer](@/glossary/dialyzer.md) - Static analysis tool detecting type-level QDP violations
- [Typespec](@/glossary/typespec.md) - Type specifications whose absence contributes to QDP
- [Code Coverage](@/glossary/code-coverage.md) - Test coverage metrics contributing to QDP assessment
- [Property-Based Testing](@/glossary/property-based-testing.md) - Testing approach that reduces QDP through exhaustive verification
- [Metrics](@/glossary/metrics.md) - QDP as a quantitative metric in the observability stack
- [Trinity Gate](@/glossary/trinity-gate.md) - Verification system ensuring quality claim integrity
- [Observability](@/glossary/observability.md) - Infrastructure providing visibility into QDP trends

## See Also

- [Architecture](@/architecture/_index.md) - Platform quality architecture and enforcement
- [Capabilities](@/capabilities/_index.md) - Quality management capabilities
- [Technologies](@/technologies/_index.md) - Static analysis and quality tooling

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
