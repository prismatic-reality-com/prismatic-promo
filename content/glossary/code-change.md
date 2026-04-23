+++
title = "Code Change"
weight = 50
[extra]
description = "Any modification to source code including additions, deletions, refactoring, and configuration updates, subject to validation through pre-commit hooks, quality gates, and automated testing before acceptance into the codebase"
category = "development"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate"
domain_category = "Software Development"
related_concepts = ["change-management", "version-control", "atomic-commits", "continuous-delivery", "software-configuration-management"]
implementation_status = "production"
authority_level = "platform-core"
difficulty_rating = 4
prerequisites = ["git-basics", "testing-fundamentals", "code-review-concepts"]
learning_path = ["code-quality", "code-change", "pre-commit-hooks", "continuous-integration", "quality-gate"]
interactive_demos = ["/labs/glossary/code-change"]
code_examples = ["elixir", "bash", "yaml"]
external_resources = ["https://trunkbaseddevelopment.com/", "https://www.conventionalcommits.org/"]
version_introduced = "gen-3"
stability_level = "stable"
testing_scenarios = ["pre-commit-validation", "quality-gate-passage", "regression-detection", "change-impact-analysis", "rollback-verification"]
keywords = ["code-change", "commit", "pull-request", "pre-commit", "quality-gate", "atomic-commit", "change-validation", "regression"]
tags = ["glossary", "development", "git", "quality"]
related_terms = ["continuous-integration", "pre-commit-hooks", "quality-gate", "regression-testing", "code-reviews", "refactoring", "technical-debt", "code-quality", "clean-run", "git-trees", "autoevolve", "no-mercy-no-doubts"]
word_count = 1587
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Code Change - Prismatic Platform"
+++

## Definition

A code change is any modification to the source code of a software system, encompassing additions of new code, deletions of existing code, modifications to existing logic, refactoring of structure without behavioral change, configuration updates, dependency version changes, and migration scripts. In engineering-mature organizations, code changes are not informal edits but formalized units of work that pass through defined validation stages -- authoring, testing, reviewing, gating, and recording -- before being accepted into the canonical codebase.

## Overview

Code changes are the fundamental unit of software evolution. Every feature, bug fix, performance optimization, security patch, and documentation update manifests as one or more code changes. The quality, discipline, and traceability of how code changes are managed directly determines the reliability, maintainability, and velocity of a software project.

In modern software engineering, code changes flow through a pipeline that transforms an idea into a verified, recorded modification. This pipeline typically includes local development, automated testing, static analysis, peer review, integration testing, and deployment. Each stage applies different validation criteria, and the change must satisfy all of them before acceptance.

The distinction between a casual edit and a disciplined code change lies in the surrounding process. A casual edit modifies a file. A disciplined code change is an atomic, tested, reviewed, and traceable modification with a clear purpose, a defined scope, and evidence that it does not break existing functionality. The Prismatic Platform enforces the disciplined model through an 11-phase pre-commit hook system, mandatory [quality gates](@/glossary/quality-gate.md), [regression testing](@/glossary/regression-testing.md) requirements, and the [No Mercy No Doubts](@/glossary/no-mercy-no-doubts.md) doctrine that permits zero exceptions.

The cost of undisciplined code changes compounds over time. A change that skips testing may introduce a bug that takes hours to diagnose. A change that skips review may introduce an architectural violation that takes weeks to untangle. A change that skips quality gates may introduce a security vulnerability that takes months to discover. The validation pipeline exists to catch these problems at the lowest possible cost -- before they reach production.

## Technical Details

### Anatomy of a Code Change

Every code change has structural components that determine its quality and traceability:

| Component | Description | Prismatic Requirement |
|-----------|-------------|----------------------|
| **Scope** | Files and lines modified | Atomic -- single concern per change |
| **Intent** | Why the change was made | Conventional Commits message format |
| **Evidence** | Proof the change is correct | Tests pass, quality gates clear |
| **Context** | Related issues, discussions | GitLab issue reference mandatory |
| **Author** | Who made the change | Git author + co-author attribution |
| **Timestamp** | When the change was recorded | Git commit timestamp |
| **Parent** | What state the change applies to | Git parent commit hash |
| **Diff** | Exact content modification | Git diff (additions, deletions, context) |

### Change Classification

Code changes are classified by their nature, which determines the validation requirements:

```elixir
defmodule Prismatic.ChangeClassifier do
  @moduledoc """
  Classifies code changes by their nature and risk level.
  Risk classification determines validation requirements --
  higher-risk changes require more extensive validation.
  """

  @type change_type ::
    :feature        # New functionality
    | :bugfix       # Correction of incorrect behavior
    | :refactor     # Structural improvement without behavioral change
    | :performance  # Optimization of resource usage
    | :security     # Security improvement or vulnerability fix
    | :dependency   # External dependency version change
    | :config       # Configuration modification
    | :docs         # Documentation-only change
    | :test         # Test addition or modification
    | :chore        # Build, CI, or tooling change

  @type risk_level :: :low | :medium | :high | :critical

  @spec classify(map()) :: {:ok, %{type: change_type(), risk: risk_level()}}
  def classify(%{files: files, diff_stats: stats} = change) do
    type = determine_type(change)
    risk = assess_risk(type, files, stats)
    {:ok, %{type: type, risk: risk}}
  end

  @spec assess_risk(change_type(), [String.t()], map()) :: risk_level()
  defp assess_risk(:security, _files, _stats), do: :critical
  defp assess_risk(:dependency, _files, %{additions: a}) when a > 100, do: :high
  defp assess_risk(:feature, files, _stats) do
    if Enum.any?(files, &core_module?/1), do: :high, else: :medium
  end
  defp assess_risk(:bugfix, _files, _stats), do: :medium
  defp assess_risk(:refactor, files, %{modifications: m}) do
    if m > 50 or Enum.any?(files, &core_module?/1), do: :high, else: :medium
  end
  defp assess_risk(:docs, _files, _stats), do: :low
  defp assess_risk(:test, _files, _stats), do: :low
  defp assess_risk(:chore, _files, _stats), do: :low
  defp assess_risk(_type, _files, _stats), do: :medium

  defp core_module?(path) do
    String.contains?(path, [
      "prismatic_storage_core",
      "prismatic_supervisor",
      "prismatic_safety"
    ])
  end

  defp determine_type(%{message: msg}) do
    cond do
      String.starts_with?(msg, "feat") -> :feature
      String.starts_with?(msg, "fix") -> :bugfix
      String.starts_with?(msg, "refactor") -> :refactor
      String.starts_with?(msg, "perf") -> :performance
      String.starts_with?(msg, "security") -> :security
      String.starts_with?(msg, "deps") -> :dependency
      String.starts_with?(msg, "config") -> :config
      String.starts_with?(msg, "docs") -> :docs
      String.starts_with?(msg, "test") -> :test
      String.starts_with?(msg, "chore") -> :chore
      true -> :feature
    end
  end
end
```

### Conventional Commits Format

All code changes in the Prismatic Platform use the Conventional Commits format, providing machine-readable structure to change descriptions:

```
type(scope): subject

[optional body explaining what and why]

[optional footer with references and co-authors]
```

| Type | Meaning | Example |
|------|---------|---------|
| `feat` | New feature | `feat(perimeter): add NIS2 compliance scoring` |
| `fix` | Bug fix | `fix(auth): prevent token expiry race condition` |
| `refactor` | Code restructuring | `refactor(storage): extract adapter protocol` |
| `perf` | Performance improvement | `perf(query): add composite index for scan lookup` |
| `test` | Test addition/modification | `test(rating): add property tests for score calculation` |
| `docs` | Documentation | `docs(api): update endpoint discovery guide` |
| `chore` | Tooling/build | `chore(ci): add Dialyzer cache to pipeline` |
| `security` | Security change | `security(auth): upgrade bcrypt to v3.1` |

### The 11-Phase Pre-Commit Pipeline

Every code change passes through the Prismatic Platform's 11-phase validation pipeline before it can be committed:

```
Phase 1:  ┌─ Compilation (--warnings-as-errors --force)
Phase 2:  ├─ Credo strict mode analysis
Phase 3:  ├─ Dialyzer type checking
Phase 4:  ├─ Test execution (affected tests)
Phase 5:  ├─ Coverage verification (threshold check)
Phase 6:  ├─ Forbidden pattern scan (mocks, stubs, placeholders)
Phase 7:  ├─ DateTime precision check
Phase 8:  ├─ Template validation (promo site)
Phase 9:  ├─ Performance check (page load standards)
Phase 10: ├─ Design consistency validation
Phase 11: └─ Quality gate summary (pass/fail verdict)
```

If any phase fails, the commit is rejected. There is no `--no-verify` bypass. The pre-commit hook is installed in `.githooks/pre-commit` and configured via `git config core.hooksPath .githooks`.

### Change Impact Analysis

Before validation, the system analyzes which parts of the codebase are affected by a change to run targeted tests:

```elixir
defmodule Prismatic.ChangeImpact do
  @moduledoc """
  Analyzes the impact of code changes to determine which tests
  need to run and which quality checks are relevant.
  Uses the dependency graph to trace transitive impacts.
  """

  @spec analyze(list(String.t())) :: {:ok, impact_report()} | {:error, term()}
  def analyze(changed_files) do
    with {:ok, direct} <- identify_direct_impacts(changed_files),
         {:ok, transitive} <- trace_transitive_dependencies(direct),
         {:ok, tests} <- find_relevant_tests(direct ++ transitive),
         {:ok, risk} <- assess_aggregate_risk(changed_files) do
      {:ok, %{
        changed_files: changed_files,
        directly_impacted: direct,
        transitively_impacted: transitive,
        tests_to_run: tests,
        risk_level: risk,
        estimated_test_time: estimate_test_duration(tests)
      }}
    end
  end

  @spec identify_direct_impacts([String.t()]) :: {:ok, [String.t()]}
  defp identify_direct_impacts(files) do
    modules = Enum.flat_map(files, &extract_module_names/1)

    dependents =
      modules
      |> Enum.flat_map(&find_dependents/1)
      |> Enum.uniq()

    {:ok, dependents}
  end

  @spec trace_transitive_dependencies([String.t()]) :: {:ok, [String.t()]}
  defp trace_transitive_dependencies(direct_impacts) do
    # BFS through the dependency graph to find all affected modules
    {:ok, graph} = build_dependency_graph()

    transitive =
      direct_impacts
      |> Enum.flat_map(&Graph.reachable(graph, &1))
      |> Enum.uniq()
      |> Kernel.--(direct_impacts)

    {:ok, transitive}
  end

  defp find_relevant_tests(impacted_modules) do
    test_files =
      impacted_modules
      |> Enum.flat_map(fn module ->
        test_path = module_to_test_path(module)
        if File.exists?(test_path), do: [test_path], else: []
      end)

    {:ok, test_files}
  end
end
```

### Atomic Commits

The platform enforces atomic commits -- each commit represents exactly one logical change. This is critical for:

- **Bisectability**: `git bisect` can pinpoint exactly when a regression was introduced
- **Revertability**: A problematic change can be reverted without collateral damage
- **Reviewability**: Each commit can be understood independently
- **Traceability**: Each change maps to exactly one purpose

```bash
# FORBIDDEN: Batching unrelated changes
git add -A
git commit -m "various fixes and features"

# REQUIRED: Atomic, focused commits
git add apps/prismatic_perimeter/lib/prismatic_perimeter/security_rating.ex
git commit -m "fix(perimeter): correct NIS2 compliance weight calculation"

git add apps/prismatic_perimeter/test/prismatic_perimeter/security_rating_test.exs
git commit -m "test(perimeter): add regression test for NIS2 weight edge case"
```

## Implementation in Prismatic Platform

### Session Discipline Protocol

Every code change originates within a [Claude Code](@/glossary/claude-code.md) session governed by the Session Discipline Protocol:

```yaml
# MANDATORY for every session that produces code changes
session_requirements:
  gitlab_issue: required        # Every change traces to a ticket
  continuous_commits: required  # Commit immediately when tests pass
  push_to_remote: required      # All commits pushed to origin
  local_testing: required       # Tests verified before commit
  all_hooks_pass: required      # Pre-commit, commit-msg, pre-push
  guard_rails: required         # All safety systems active

forbidden_actions:
  - "git commit --no-verify"    # ABSOLUTELY FORBIDDEN
  - "git push --no-verify"      # ABSOLUTELY FORBIDDEN
  - "Batching multiple changes"  # Atomic commits only
  - "Commit without tests"       # Tests mandatory
  - "Session without ticket"     # Tracking mandatory
  - "Session end without push"   # Push mandatory
```

### Quality Gate Integration

Code changes must pass the comprehensive quality gate system before acceptance:

```elixir
defmodule Prismatic.Quality.Gates do
  @moduledoc """
  Quality gate system that validates code changes against
  platform standards. All gates must pass for a change
  to be accepted. No exceptions, no bypass.
  """

  @type gate_result :: :passed | {:failed, String.t()}
  @type gate_report :: %{gate: atom(), result: gate_result(), duration_ms: non_neg_integer()}

  @gates [
    :compilation,
    :credo_strict,
    :dialyzer,
    :test_suite,
    :coverage_threshold,
    :forbidden_patterns,
    :datetime_precision,
    :template_validation,
    :performance_check,
    :design_consistency
  ]

  @spec check_all() :: {:ok, [gate_report()]} | {:error, [gate_report()]}
  def check_all do
    results = Enum.map(@gates, &run_gate/1)

    case Enum.filter(results, &gate_failed?/1) do
      [] -> {:ok, results}
      failures -> {:error, failures}
    end
  end

  @spec run_gate(atom()) :: gate_report()
  defp run_gate(gate) do
    start = System.monotonic_time(:millisecond)
    result = execute_gate(gate)
    duration = System.monotonic_time(:millisecond) - start

    %{gate: gate, result: result, duration_ms: duration}
  end

  defp execute_gate(:compilation) do
    case System.cmd("mix", ["compile", "--warnings-as-errors", "--force"], stderr_to_stdout: true) do
      {_, 0} -> :passed
      {output, _} -> {:failed, "Compilation failed: #{String.slice(output, 0, 200)}"}
    end
  end

  defp execute_gate(:credo_strict) do
    case System.cmd("mix", ["credo", "--strict"], stderr_to_stdout: true) do
      {_, 0} -> :passed
      {output, _} -> {:failed, "Credo violations: #{String.slice(output, 0, 200)}"}
    end
  end

  defp execute_gate(:forbidden_patterns) do
    case System.cmd("mix", ["quality.forbidden_patterns", "--count-only"], stderr_to_stdout: true) do
      {"0\n", 0} -> :passed
      {count, _} -> {:failed, "Forbidden patterns found: #{String.trim(count)}"}
    end
  end

  defp execute_gate(gate) do
    case System.cmd("mix", ["quality.gate.#{gate}"], stderr_to_stdout: true) do
      {_, 0} -> :passed
      {output, _} -> {:failed, "Gate #{gate} failed: #{String.slice(output, 0, 200)}"}
    end
  end

  defp gate_failed?(%{result: :passed}), do: false
  defp gate_failed?(%{result: {:failed, _}}), do: true
end
```

### Autoevolve Integration

Code changes trigger the platform's autonomous evolution system. After a commit passes all gates, the [autoevolve](@/glossary/autoevolve.md) scanner examines whether the change reveals improvement opportunities:

```bash
# Post-commit hook triggers evolution scan
mix autoevolve.scan --quick

# Session-end triggers comprehensive evolution
mix autoevolve.mega
```

This creates a feedback loop: code changes improve the platform, and the evolution system uses those changes to discover further improvements.

### Change Tracking and Metrics

The platform tracks code change metrics to monitor development health:

| Metric | Description | Target |
|--------|-------------|--------|
| **Commit frequency** | Commits per session | 5+ per session |
| **Change size** | Lines added/removed per commit | <200 lines preferred |
| **Gate pass rate** | Percentage of commits that pass gates on first attempt | >90% |
| **Regression rate** | Bug fixes as percentage of total commits | <10% |
| **Review turnaround** | Time from commit to merge | <24 hours |
| **Revert rate** | Percentage of commits reverted | <2% |

## Comparison with Alternatives

| Approach | Change Validation | Review Model | Risk Management |
|----------|-------------------|-------------|-----------------|
| **Prismatic (11-phase)** | Full automated pipeline + human review | Mandatory pre-commit + PR review | Automated risk assessment |
| **Trunk-Based Development** | CI/CD pipeline post-commit | Short-lived branches, rapid review | Feature flags for risk isolation |
| **GitFlow** | Branch-specific CI | PR review + release branch testing | Multi-branch isolation |
| **Ship/Show/Ask** | Variable by change type | Self-classified review requirement | Author risk assessment |
| **Pair Programming** | Real-time review during authoring | Continuous two-person review | Shared responsibility |
| **No Process** | Manual testing (if any) | Optional or absent | No formal management |

The Prismatic approach is the most rigorous, with validation happening before the commit is even recorded (pre-commit hooks) rather than after (CI/CD pipeline). This means defective changes never enter the repository history, providing a cleaner truth record and preventing accumulation of broken commits that complicate bisection.

## Best Practices

### Keep Changes Small and Focused

Small changes are easier to review, test, and revert. Each change should address exactly one concern:

```bash
# Good: Focused changes
git commit -m "feat(rating): add SSL certificate expiry check"
git commit -m "test(rating): verify SSL expiry edge cases"
git commit -m "docs(rating): document SSL scoring algorithm"

# Bad: Mixed concerns
git commit -m "add SSL check, fix auth bug, update deps"
```

### Write the Test Before or With the Change

Never commit a behavioral change without corresponding test changes. If you are fixing a bug, the regression test should be part of the same logical change or the commit immediately preceding the fix.

### Use Meaningful Commit Messages

The commit message is the permanent record of why a change was made. Follow the Conventional Commits format and include enough context for someone reading the history months later:

```
fix(perimeter): prevent nil score when domain has no DNS records

The security_rating/1 function crashed with a NilError when
the DNS resolver returned an empty record set. This occurred
for newly registered domains that haven't propagated yet.

Added a guard clause that returns {:ok, %{grade: :F, score: 300}}
for domains with no discoverable DNS records, following the
principle that absence of evidence indicates maximum risk.

Closes #1287
```

### Verify Locally Before Committing

Run the relevant validation steps locally before attempting to commit. The pre-commit hooks will catch failures, but running tests proactively reduces iteration time:

```bash
# Verify before committing
mix compile --warnings-as-errors
mix credo --strict
mix test apps/prismatic_perimeter/test/
mix quality.gates --fast
```

### Review Your Own Diff Before Committing

Read the `git diff --staged` output before committing. This catches unintended changes (debug logging, commented-out code, temporary modifications) that would otherwise enter the repository.

## Common Pitfalls

### Large, Unfocused Changes

Changes that modify dozens of files across multiple concerns are difficult to review, test, and revert. If a single logical change truly affects many files (such as a rename), document the mechanical nature of the change clearly.

### Skipping Quality Gates

The temptation to bypass quality gates "just this once" is the beginning of quality erosion. The Prismatic Platform's `--no-verify` prohibition exists because every bypass creates precedent for the next bypass. There are no exceptions.

### Incomplete Regression Testing

Fixing a bug without adding a regression test means the same bug can recur. The mandatory regression test protocol exists because without it, approximately 30% of bug fixes in complex systems eventually regress.

### Breaking Atomic Commit Discipline

Batching unrelated changes in a single commit destroys the ability to bisect regressions, selectively revert changes, and understand the purpose of each modification. It also makes code review less effective because reviewers must mentally separate concerns that should have been separate commits.

### Configuration Changes Without Testing

Configuration changes (environment variables, feature flags, dependency versions) are code changes that affect behavior. They must be tested with the same rigor as application code changes. A dependency version bump can introduce subtle behavioral changes or performance regressions.

### Force-Pushing Over History

Rewriting published history with `git push --force` destroys the truth record. Other developers who have based work on the overwritten commits will experience conflicts and confusion. Never force-push to shared branches, especially `main`.

## Use Cases

### Feature Development

New features are implemented as a series of atomic code changes: data layer changes, business logic, presentation layer, tests, and documentation. Each change is independently validated and traceable.

### Bug Fixing with Regression Prevention

Bug fixes follow the mandatory regression protocol: identify root cause, write failing regression test, apply fix, verify test passes. The change includes both the fix and the test as a self-contained unit.

### Performance Optimization

Performance changes require before/after benchmarks as evidence. The code change includes the optimization and the benchmark that proves its effectiveness.

### Security Patching

Security changes receive the highest risk classification and most stringent validation. They typically include the fix, regression tests, and updated security documentation.

### Dependency Updates

Dependency version changes are code changes with potentially wide impact. They require full test suite execution, Dialyzer re-analysis, and verification that no behavioral regressions were introduced.

## Related Concepts

- [Continuous Integration](@/glossary/continuous-integration.md) -- the system that validates code changes after they enter the repository
- [Pre-commit Hooks](@/glossary/pre-commit-hooks.md) -- the validation pipeline that code changes must pass before committing
- [Quality Gate](@/glossary/quality-gate.md) -- the specific checks each code change must satisfy
- [Regression Testing](@/glossary/regression-testing.md) -- tests that prevent fixed bugs from recurring in future changes
- [Code Reviews](@/glossary/code-reviews.md) -- human evaluation of code changes for correctness and quality
- [Refactoring](@/glossary/refactoring.md) -- a specific type of code change that improves structure without changing behavior
- [Code Quality](@/glossary/code-quality.md) -- the standard that code changes must meet
- [Clean Run](@/glossary/clean-run.md) -- the zero-warning compilation standard for all changes
- [Technical Debt](@/glossary/technical-debt.md) -- the cost of accepting low-quality code changes
- [No Mercy No Doubts](@/glossary/no-mercy-no-doubts.md) -- the doctrine that forbids quality compromises in changes
- [Git Trees](@/glossary/git-trees.md) -- optimized tool for analyzing changes across the codebase
- [Autoevolve](@/glossary/autoevolve.md) -- autonomous evolution triggered by code changes

## See Also

- [Static Analysis](@/glossary/static-analysis.md) -- automated code change analysis without execution
- [Credo](@/glossary/credo.md) -- static analysis tool that validates code change quality
- [Dialyzer](@/glossary/dialyzer.md) -- type checking applied to code changes
- [Session Discipline](@/glossary/session-discipline.md) -- the protocol governing sessions that produce code changes
- [Code Coverage](@/glossary/code-coverage.md) -- metric ensuring code changes are adequately tested
- [Fitness Score](@/glossary/fitness-score.md) -- platform health metric affected by code change quality

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
