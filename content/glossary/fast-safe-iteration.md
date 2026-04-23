+++
title = "Fast Safe Iteration"
weight = 50
[extra]
tags = ["glossary", "development-methodology", "quality", "testing", "continuous-integration", "agile", "devops", "elixir"]
description = "Fast safe iteration is a development methodology that maximizes the speed of feature delivery and experimentation while maintaining rigorous quality standards, achieved through comprehensive automation, instant feedback loops, and fail-fast mechanisms."
category = "methodology"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "13 min"
difficulty = "intermediate"
quality_score = 95
date_created = "2026-02-22"
date_updated = "2026-02-22"
related_terms = ["ci-cd", "quality-gates", "pre-commit-hooks", "regression-testing", "automate-relentlessly", "continuous-integration", "test-coverage", "code-quality", "autoheal", "autoevolve"]
key_takeaway = "Fast safe iteration eliminates the false dichotomy between speed and quality by embedding automated quality checks so deeply into the workflow that they become invisible guardrails rather than obstacles to velocity."
version = "2.0.0"
word_count = 1923
date_modified = "2026-02-23"
keywords = ["Fast", "Safe", "Iteration", "glossary", "methodology", "Prismatic Platform", "Quality DNA", "Step", "High"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Fast Safe Iteration - Prismatic Platform"
+++

## Definition

Fast safe iteration is a development methodology in which the speed of experimentation, prototyping, and feature delivery is maximized under the constraint that quality standards are never compromised. It rejects the common assumption that speed and quality are opposing forces on a spectrum. Instead, it treats quality automation as the mechanism that enables speed -- the more comprehensive the automated quality infrastructure, the faster developers can iterate because they receive instant feedback on whether their changes are correct.

The "fast" component refers to short cycle times: small changes, frequent commits, rapid feedback, and minimal ceremony. The "safe" component refers to automated guardrails: comprehensive test suites, static analysis, quality gates, pre-commit hooks, and continuous integration pipelines that catch errors before they reach production. Together, they create a development rhythm where each iteration takes minutes rather than hours, and the risk of any individual iteration introducing a defect approaches zero.

## Overview

Traditional software development often forces a choice between speed and safety. "Move fast and break things" optimizes for velocity at the cost of stability. "Move slowly and verify everything" optimizes for correctness at the cost of responsiveness. Fast safe iteration demonstrates that this trade-off is an artifact of insufficient automation, not a fundamental law of software engineering.

The key insight is that manual quality processes are slow, error-prone, and scale poorly. Code reviews take hours. Manual testing takes days. Regression testing takes weeks. When quality depends on human effort, increasing speed necessarily decreases quality because humans cannot scale their attention linearly with velocity.

Automated quality processes, by contrast, scale perfectly. A pre-commit hook runs in seconds regardless of whether the developer commits once a day or once an hour. A CI pipeline processes 100 commits per day with the same reliability as 10. Static analysis checks every line of code whether the codebase has 1,000 lines or 2,800,000 lines.

The Prismatic Platform's approach to fast safe iteration is built on several reinforcing systems:

### The Speed Stack

1. **Instant local feedback** (< 1 second): Compiler warnings, editor diagnostics, type checking
2. **Pre-commit validation** (< 30 seconds): 11-phase pre-commit hooks covering formatting, compilation, quality patterns, forbidden patterns, and more
3. **Local test execution** (< 2 minutes): Targeted test runs for changed files
4. **CI pipeline** (< 10 minutes): Full test suite, Dialyzer, Credo, quality gates
5. **Deploy verification** (< 5 minutes): Staging deployment with health checks

Each layer catches different classes of errors. The earlier a layer catches an error, the faster the iteration cycle completes. The goal is to push error detection as early as possible -- ideally to the pre-commit phase, so that developers never push broken code.

### The Safety Stack

1. **Type specifications** (compile-time): Dialyzer catches type mismatches before the code runs
2. **Static analysis** (pre-commit): Credo strict mode, forbidden pattern detection, quality gates
3. **Unit tests** (pre-commit): Property-based and example-based tests for business logic
4. **Integration tests** (CI): Cross-module contract verification
5. **Quality DNA** (cross-session): Persistent quality tracking that prevents regressions across development sessions
6. **Quality Floor Guardian** (continuous): Autonomous monitoring that alerts when quality metrics drift

## Technical Details

### The 11-Phase Pre-Commit Pipeline

The Prismatic Platform's pre-commit hook is the primary mechanism for fast safe iteration. It runs in under 30 seconds and catches the vast majority of potential issues before code leaves the developer's machine:

```bash
# Phase 1: Formatting verification
mix format --check-formatted

# Phase 2: Compilation with warnings as errors
mix compile --warnings-as-errors

# Phase 3: Credo strict analysis
mix credo --strict

# Phase 4: Quality gates check
mix quality.gates.check --fast

# Phase 5: Forbidden patterns scan
mix quality.forbidden_patterns

# Phase 6: Typespec coverage verification
# Ensures all public functions have @spec

# Phase 7: TODO/FIXME audit
# Blocks commits containing untracked TODOs

# Phase 8: Template validation (promo site)
# Validates HTML template structure

# Phase 9: Security scan
# Checks for hardcoded secrets, unsafe patterns

# Phase 10: Design consistency validation
# Verifies UI component patterns

# Phase 11: Regression test for changed files
mix test --only changed
```

### Elixir Tooling for Fast Iteration

Elixir provides exceptional tooling for fast safe iteration. The language's compiler catches many errors that would be runtime failures in dynamic languages, and OTP's supervision model means that even when errors slip through, the system recovers automatically.

```elixir
defmodule Prismatic.Quality.FastIteration do
  @moduledoc """
  Automated quality checking infrastructure that enables fast safe iteration.
  Provides rapid feedback on code changes by running targeted checks
  against only the modified files while maintaining comprehensive coverage.
  """

  @type check_result :: %{
    phase: atom(),
    status: :pass | :fail | :warn,
    duration_ms: non_neg_integer(),
    details: String.t()
  }

  @spec run_targeted_checks([String.t()]) :: {:ok, [check_result()]} | {:error, [check_result()]}
  def run_targeted_checks(changed_files) do
    checks = [
      {:compilation, &check_compilation/1},
      {:formatting, &check_formatting/1},
      {:credo, &check_credo/1},
      {:typespecs, &check_typespecs/1},
      {:tests, &run_related_tests/1}
    ]

    results =
      checks
      |> Enum.map(fn {phase, check_fn} ->
        {duration, result} = :timer.tc(fn -> check_fn.(changed_files) end)
        Map.put(result, :phase, phase)
        |> Map.put(:duration_ms, div(duration, 1_000))
      end)

    if Enum.all?(results, &(&1.status in [:pass, :warn])) do
      {:ok, results}
    else
      {:error, results}
    end
  end

  @spec check_compilation([String.t()]) :: check_result()
  defp check_compilation(_changed_files) do
    case System.cmd("mix", ["compile", "--warnings-as-errors"], stderr_to_stdout: true) do
      {_output, 0} -> %{status: :pass, details: "Compilation clean"}
      {output, _} -> %{status: :fail, details: "Compilation failed: #{output}"}
    end
  end

  @spec check_formatting([String.t()]) :: check_result()
  defp check_formatting(files) do
    elixir_files = Enum.filter(files, &String.ends_with?(&1, [".ex", ".exs"]))

    case System.cmd("mix", ["format", "--check-formatted" | elixir_files],
           stderr_to_stdout: true
         ) do
      {_output, 0} -> %{status: :pass, details: "Formatting OK"}
      {output, _} -> %{status: :fail, details: "Formatting issues: #{output}"}
    end
  end

  @spec check_credo([String.t()]) :: check_result()
  defp check_credo(files) do
    elixir_files = Enum.filter(files, &String.ends_with?(&1, [".ex", ".exs"]))

    case System.cmd("mix", ["credo", "--strict" | elixir_files], stderr_to_stdout: true) do
      {_output, 0} -> %{status: :pass, details: "Credo clean"}
      {output, _} -> %{status: :fail, details: "Credo issues: #{output}"}
    end
  end

  @spec check_typespecs([String.t()]) :: check_result()
  defp check_typespecs(files) do
    lib_files = Enum.filter(files, &String.contains?(&1, "/lib/"))
    missing = Enum.filter(lib_files, &missing_specs?/1)

    if Enum.empty?(missing) do
      %{status: :pass, details: "All public functions have typespecs"}
    else
      %{status: :fail, details: "Missing typespecs in: #{Enum.join(missing, ", ")}"}
    end
  end

  @spec run_related_tests([String.t()]) :: check_result()
  defp run_related_tests(changed_files) do
    test_files = find_related_tests(changed_files)

    if Enum.empty?(test_files) do
      %{status: :warn, details: "No related tests found"}
    else
      case System.cmd("mix", ["test" | test_files], stderr_to_stdout: true) do
        {_output, 0} -> %{status: :pass, details: "#{length(test_files)} test files passed"}
        {output, _} -> %{status: :fail, details: "Test failures: #{output}"}
      end
    end
  end

  defp find_related_tests(changed_files) do
    changed_files
    |> Enum.filter(&String.ends_with?(&1, ".ex"))
    |> Enum.flat_map(fn file ->
      test_file = String.replace(file, "/lib/", "/test/") |> String.replace(".ex", "_test.exs")
      if File.exists?(test_file), do: [test_file], else: []
    end)
  end

  defp missing_specs?(file) do
    case File.read(file) do
      {:ok, content} ->
        public_fns = Regex.scan(~r/^\s+def\s+\w+/, content) |> length()
        specs = Regex.scan(~r/^\s+@spec\s+/, content) |> length()
        public_fns > specs

      {:error, _} ->
        false
    end
  end
end
```

### Quality DNA: Cross-Session Memory

Fast safe iteration extends beyond individual development sessions through the Quality DNA system. This persistent state tracks quality metrics across sessions, ensuring that improvements are not lost and regressions are detected immediately when a new session begins:

```elixir
defmodule Prismatic.Quality.DNA do
  @moduledoc """
  Persistent quality state that survives across development sessions.
  Enables fast iteration by maintaining institutional memory of quality
  baselines, known issues, and improvement trajectories.
  """

  @type quality_state :: %{
    score: non_neg_integer(),
    domains: %{atom() => :perfect | :warning | :critical},
    last_updated: DateTime.t(),
    session_count: non_neg_integer(),
    regression_count: non_neg_integer()
  }

  @dna_path ".claude/quality-dna/current-state.json"

  @spec load() :: {:ok, quality_state()} | {:error, term()}
  def load do
    case File.read(@dna_path) do
      {:ok, content} -> Jason.decode(content, keys: :atoms)
      {:error, reason} -> {:error, reason}
    end
  end

  @spec check_regression(quality_state(), quality_state()) :: :ok | {:regression, [atom()]}
  def check_regression(previous, current) do
    regressions =
      previous.domains
      |> Enum.filter(fn {domain, prev_status} ->
        curr_status = Map.get(current.domains, domain)
        status_degraded?(prev_status, curr_status)
      end)
      |> Enum.map(fn {domain, _} -> domain end)

    if Enum.empty?(regressions) do
      :ok
    else
      {:regression, regressions}
    end
  end

  defp status_degraded?(:perfect, status) when status != :perfect, do: true
  defp status_degraded?(:warning, :critical), do: true
  defp status_degraded?(_, _), do: false
end
```

## Implementation

### Building a Fast Safe Iteration Culture

Implementing fast safe iteration is as much a cultural shift as a technical one. The following steps describe the implementation path:

**Step 1: Establish baseline metrics.** Before improving iteration speed, measure the current state: average time from code change to production, percentage of changes that cause incidents, average time to detect and fix defects.

**Step 2: Automate the longest feedback loops first.** Identify the slowest quality checks and automate them. In many organizations, code review is the bottleneck -- augmenting it with automated checks can reduce review time from hours to minutes.

**Step 3: Push checks leftward.** Move automated checks from CI to pre-commit, from pre-commit to editor integration, from editor to compiler. Each leftward shift reduces the feedback loop duration.

**Step 4: Make passing checks the default.** The system should be configured so that a developer writing idiomatic code passes all checks automatically. Checks should catch deviations, not require ceremony.

**Step 5: Invest in test infrastructure.** Fast tests enable fast iteration. Invest in test parallelization, database sandboxing, and mock elimination. The Prismatic Platform runs its full test suite in under 2 minutes through aggressive parallelization.

**Step 6: Build institutional memory.** Quality DNA, session context, and regression databases ensure that quality improvements persist across sessions and team members.

## Comparison

### Fast Safe Iteration vs. Other Methodologies

| Methodology | Speed | Safety | Key Mechanism | Limitation |
|-------------|-------|--------|---------------|------------|
| **Fast Safe Iteration** | High | High | Automation eliminates the trade-off | Requires significant upfront investment in automation |
| **Move Fast, Break Things** | Very High | Low | Accept breakage as cost of speed | Unsuitable for consequential systems |
| **Waterfall** | Low | Medium | Sequential phases with gates | Feedback loops measured in months |
| **Agile/Scrum** | Medium | Medium | Sprint cycles with retrospectives | Safety depends on team discipline |
| **TDD** | Medium | High | Tests drive implementation | Can slow initial exploration |
| **Continuous Delivery** | High | Medium-High | Automated pipeline to production | Safety depends on pipeline quality |
| **NO MERCY, NO DOUBTS** | High | Very High | Absolute quality enforcement | Extends fast safe iteration with zero-tolerance |

### Iteration Speed Comparison

| Check Type | Manual | Automated (CI) | Automated (Pre-commit) | Editor Integration |
|------------|--------|----------------|------------------------|--------------------|
| Code formatting | 5-30 min | 1 min | 2 sec | Instant |
| Static analysis | 30-60 min | 3 min | 10 sec | 1 sec |
| Type checking | Not feasible | 5 min | 15 sec | 3 sec |
| Unit tests | 10-30 min | 2 min | 15 sec | N/A |
| Security scan | 1-4 hours | 5 min | 20 sec | N/A |
| Code review | 1-24 hours | N/A (augmented) | N/A | N/A |

## Best Practices

1. **Make the fast path the safe path.** Developers will take shortcuts when the safe path is slow. Ensure that the fastest way to develop is also the safest -- by making quality checks fast and automatic.

2. **Fail fast and loud.** When a check fails, the developer should know immediately, with a clear message explaining what failed and how to fix it. Silent failures or delayed feedback undermine the entire methodology.

3. **Commit early, commit often.** Small, frequent commits are easier to review, test, and roll back. The Prismatic Platform enforces atomic commits -- each commit should represent one logical change.

4. **Automate everything that can be automated.** If a quality check requires human judgment, invest in tooling that automates the routine cases and surfaces only the genuinely ambiguous cases for human review.

5. **Track iteration metrics.** Measure cycle time (change to production), change failure rate, mean time to detection, and mean time to recovery. These metrics reveal where the iteration pipeline has bottlenecks.

6. **Eliminate flaky tests aggressively.** A flaky test that fails intermittently trains developers to ignore test failures. This erodes trust in the entire safety system. Fix or remove flaky tests immediately.

7. **Invest in developer experience.** Fast safe iteration requires good tooling. Editor integrations, clear error messages, helpful documentation, and responsive feedback loops all contribute to developer velocity.

8. **Use feature flags for large changes.** When a change is too large for a single commit, use feature flags to merge incomplete features behind a flag. This maintains the small-commit discipline while supporting larger feature development.

## Pitfalls

### Common Anti-Patterns

1. **Security theater automation.** Automated checks that run but do not actually catch meaningful issues. This creates a false sense of safety while adding latency to the iteration cycle. Every automated check must justify its existence with evidence of defects caught.

2. **Over-automation.** Automating checks that are so restrictive they prevent legitimate code patterns, forcing developers to work around the automation. The checks should encode best practices, not arbitrary rules.

3. **Ignoring the human loop.** Fast safe iteration is not "remove all humans from the process." Certain decisions (architectural changes, security-critical modifications, API contract changes) require human review. Automation augments human judgment; it does not replace it.

4. **Optimizing for the wrong metric.** Measuring "commits per day" instead of "value delivered per day." Fast iteration is not about generating activity -- it is about delivering working software quickly.

5. **Neglecting the safety infrastructure.** As the codebase grows, automated checks become slower. If not maintained, they become bottlenecks that force developers to bypass them. Continuously invest in check performance.

6. **Batch everything despite the philosophy.** Claiming to practice fast iteration while actually batching many changes into large pull requests. The practice requires discipline to keep changes small.

7. **No rollback capability.** Fast iteration requires fast rollback. If deploying takes 30 minutes and rolling back takes 2 hours, the "fast" part of the methodology collapses when something goes wrong.

## Use Cases

### Platform-Specific Applications

**Session-Based Development.** Every Claude Code session on the Prismatic Platform follows the fast safe iteration methodology. The session starts by loading Quality DNA, runs pre-commit hooks on every commit, and saves session context at the end. This structure ensures that each session's iterations are both fast and safe.

**Quality Gate Evolution.** The platform's quality gates themselves evolve through fast safe iteration. New checks are added, tested against the existing codebase, and integrated into the pre-commit pipeline -- all within a single session.

**Multi-App Refactoring.** When refactoring code that spans multiple umbrella apps, fast safe iteration enables confidence: change one app, run its tests, commit; change the next app, run its tests, commit. Each step is independently verified.

**Promo Site Content Enhancement.** Even non-code assets like glossary entries follow fast safe iteration: write content, validate with Zola build, verify cross-references, commit. The Zola build serves as the "test suite" for content quality.

**Incident Response.** When a production issue is detected, fast safe iteration enables rapid response: diagnose the issue, write a regression test that reproduces it, fix the code, verify the test passes, commit with full pre-commit validation, deploy. The entire cycle can complete in under 30 minutes.

## Related Concepts

Fast safe iteration connects to several foundational concepts in the Prismatic Platform:

- [CI/CD](/glossary/ci-cd/) provides the automated pipeline infrastructure that enables fast safe iteration at scale
- [Quality Gates](/glossary/quality-gates/) are the automated checkpoints that maintain safety during rapid iteration
- [Pre-Commit Hooks](/glossary/pre-commit-hooks/) implement the earliest and fastest layer of automated quality checking
- [Regression Testing](/glossary/regression-testing/) ensures that fast iteration does not introduce regressions in existing functionality
- [Automate Relentlessly](/glossary/automate-relentlessly/) is the philosophical principle that drives fast safe iteration's automation investment
- [Continuous Integration](/glossary/continuous-integration/) validates every commit against the full test suite
- [Test Coverage](/glossary/test-coverage/) measures the completeness of the safety net that enables fast iteration
- [Code Quality](/glossary/code-quality/) defines the standards that automated checks enforce
- [Autoheal](/glossary/autoheal/) extends fast safe iteration by automatically detecting and correcting quality degradation
- [Autoevolve](/glossary/autoevolve/) uses fast safe iteration to autonomously improve the platform's quality infrastructure

## See Also

- [No Mercy No Doubts](/glossary/no-mercy-no-doubts/) -- the enforcement doctrine that ensures quality standards are never compromised
- [Quality DNA](/glossary/quality-dna/) -- the persistent quality state that maintains institutional memory across sessions
- [Quality Floor Guardian](/glossary/quality-floor-guardian/) -- the autonomous monitor that alerts when quality metrics drift
- [Clean Run](/glossary/clean-run/) -- the zero-warning compilation standard that fast safe iteration enforces
- [Disciplined Approach](/glossary/disciplined-approach/) -- the development philosophy that frames quality automation as enablement rather than restriction

---

**Connect & Contribute**: Fast safe iteration is the development heartbeat of the Prismatic Platform. Visit the [Prismatic Platform repository](https://github.com/korczis/prismatic-platform) to explore the 11-phase pre-commit pipeline, review the Quality DNA system, or connect with the community through [GitHub Discussions](https://github.com/korczis/prismatic-platform/discussions). Created by [Tomas Korcak (korczis)](https://github.com/korczis).
