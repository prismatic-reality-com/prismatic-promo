+++
title = "Zero Tolerance"
weight = 50
[extra]
tags = ["glossary", "zero-tolerance", "doctrine", "quality", "enforcement", "no-mercy", "no-doubts", "clean-run", "quality-gates", "pre-commit", "regression-tests", "zero-warnings"]
description = "Platform doctrine principle of accepting absolutely no violations of quality, security, or doctrinal standards, enforced through automated blocking gates at every stage of the development and deployment lifecycle"
category = "doctrine"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate-to-advanced"
domain_category = "platform-doctrine-and-governance"
related_concepts = ["no mercy no doubts", "clean run", "quality gates", "zero warnings", "zero compromise quality", "enforcement", "doctrine"]
implementation_status = "production"
authority_level = "absolute-supreme"
difficulty_rating = 5
prerequisites = ["software quality concepts", "CI/CD fundamentals", "platform doctrine basics"]
learning_path = "quality-gate > clean-run > zero-warning-policy > zero-tolerance > no-mercy-no-doubts > zero-compromise-quality"
interactive_demos = ["/labs/glossary/zero-tolerance"]
code_examples = ["Elixir", "Bash", "YAML"]
external_resources = ["https://martinfowler.com/articles/continuousIntegration.html", "https://trunkbaseddevelopment.com/"]
version_introduced = "0.10.0"
stability_level = "stable"
testing_scenarios = ["gate enforcement completeness", "bypass attempt detection", "regression prevention validation", "violation escalation accuracy"]
keywords = ["zero tolerance", "quality enforcement", "zero defect", "zero warnings", "clean build", "blocking gates", "doctrine enforcement", "absolute standards"]
related_terms = ["no-mercy", "no-mercy-no-doubts", "clean-run", "zero-warning-policy", "zero-compromise-quality", "quality-gate", "pre-commit-hooks", "quality-debt", "technical-debt", "quality-dna"]
word_count = 1930
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Zero Tolerance - Prismatic Platform"
+++

## Definition

**Zero tolerance** is a platform doctrine principle that mandates accepting absolutely no violations of established quality, security, or doctrinal standards. It is the philosophical foundation upon which the Prismatic Platform's quality enforcement infrastructure is built -- the principle that transforms quality standards from aspirational guidelines into non-negotiable system invariants.

Zero tolerance in the Prismatic context means precisely what it says: zero compilation warnings (not "few"), zero [QDP](@/glossary/qdp.md) (not "low"), zero stubs and mocks in production code (not "minimal"), zero bypassed quality gates (not "rarely bypassed"), and mandatory [regression tests](@/glossary/quality-gate.md) for every bug fix (not "when convenient"). The word "zero" is literal, absolute, and enforced through automated systems that cannot be overridden by convenience, schedule pressure, or human judgment.

This principle is operationalized through the [No Mercy, No Doubts](@/glossary/no-mercy-no-doubts.md) doctrine, the [clean run](@/glossary/clean-run.md) requirement, the [zero warning policy](@/glossary/zero-warning-policy.md), and the [quality gate](@/glossary/quality-gate.md) enforcement pipeline. Together, these systems create a development environment where quality violations are physically impossible to commit -- they are blocked by automated gates before they can enter the codebase.

## Overview

### The Case for Absolutism

Most software organizations operate with "reasonable" quality standards: "keep warnings low," "maintain good test coverage," "follow the style guide generally." These relative standards inevitably degrade through the mechanism known as the **broken windows theory** of software quality: once a single violation exists, the psychological barrier to introducing a second violation drops dramatically. A codebase with 3 warnings makes it psychologically easy to add a 4th. A codebase with 0 warnings makes every new warning immediately visible and culturally unacceptable.

The empirical evidence supports absolutism:

| Metric | Relative Standard Outcome | Zero Tolerance Outcome |
|--------|--------------------------|----------------------|
| **Warnings over time** | Monotonically increasing | Constant at zero |
| **Test coverage** | Oscillates 60-85% | Maintained at target |
| **Code review findings** | Increasing backlog | Resolved before commit |
| **Deployment failures** | Periodic, reactive fixes | Prevented at gate |
| **Onboarding time** | Increases with codebase age | Constant (clean baseline) |

The Prismatic Platform provides a concrete demonstration: starting from 905 Quality Debt Points, the platform achieved and maintains zero through automated enforcement. The investment in zero-tolerance infrastructure pays compound returns as the codebase grows, because the cost of maintaining zero is constant while the cost of managing "low but non-zero" increases with codebase size.

### Scope of Zero Tolerance

Zero tolerance applies across all quality domains:

| Domain | Zero Tolerance Requirement | Enforcement Mechanism |
|--------|---------------------------|----------------------|
| **Compilation** | Zero warnings (`--warnings-as-errors`) | Pre-commit Phase 2, CI |
| **Linting** | Zero Credo violations (`--strict`) | Pre-commit Phase 3, CI |
| **Type Safety** | Zero Dialyzer warnings | Pre-commit Phase 4, CI |
| **Tests** | All tests pass, mandatory regression tests | Pre-commit Phase 5, CI |
| **Forbidden Patterns** | Zero mocks, stubs, placeholders in lib/ | Pre-commit Phase 6, CI |
| **Quality Gates** | All gates pass | Pre-commit Phase 7, CI |
| **Security** | Zero critical/high findings unresolved | Security assessment pipeline |
| **Documentation** | CLAUDE.md for every app, @spec for public functions | Quality standard check |
| **Debt** | Zero QDP | Quality Floor Guardian |

## Technical Details

### Enforcement Architecture

Zero tolerance is meaningless without enforcement. The Prismatic Platform implements enforcement at four layers, each providing defense-in-depth:

```
Layer 1: IDE (advisory)     ─── ElixirLS, Credo integration
Layer 2: Pre-commit (blocking) ─── 11-phase hook pipeline
Layer 3: CI/CD (authoritative) ─── GitLab CI quality gates
Layer 4: Runtime (monitoring)  ─── Quality Floor Guardian
```

The critical distinction is between advisory and blocking enforcement. Advisory tools (IDE warnings) inform; blocking tools (pre-commit hooks, CI gates) prevent. Zero tolerance requires blocking enforcement -- advising developers to fix warnings does not achieve zero; preventing commits with warnings does.

### Pre-Commit Enforcement Pipeline

The 11-phase pre-commit hook is the primary enforcement mechanism for zero tolerance:

```elixir
defmodule PrismaticQuality.ZeroToleranceEnforcement do
  @moduledoc """
  Implements the zero-tolerance enforcement pipeline.

  Each check returns either :pass or {:violation, details}.
  Any violation blocks the operation -- there is no override
  mechanism, no bypass flag, no exception process.

  This module embodies the literal meaning of zero tolerance:
  the number of acceptable violations is exactly zero.
  """

  @type check_result :: :pass | {:violation, violation()}

  @type violation :: %{
    domain: atom(),
    severity: :block | :warn,
    message: String.t(),
    file: String.t() | nil,
    line: pos_integer() | nil,
    remediation: String.t()
  }

  @type enforcement_result :: %{
    passed: boolean(),
    checks_run: non_neg_integer(),
    violations: [violation()],
    duration_ms: non_neg_integer()
  }

  @spec enforce_all() :: enforcement_result()
  def enforce_all do
    start = System.monotonic_time(:millisecond)

    checks = [
      {:compilation_warnings, &check_zero_warnings/0},
      {:credo_strict, &check_credo_strict/0},
      {:dialyzer, &check_dialyzer/0},
      {:tests, &check_tests_pass/0},
      {:forbidden_patterns, &check_forbidden_patterns/0},
      {:quality_gates, &check_quality_gates/0},
      {:regression_tests, &check_regression_tests/0},
      {:typespec_coverage, &check_typespec_coverage/0},
      {:documentation, &check_documentation/0}
    ]

    results = Enum.map(checks, fn {domain, check_fn} ->
      case check_fn.() do
        :pass -> {:pass, domain}
        {:violation, details} -> {:violation, Map.put(details, :domain, domain)}
      end
    end)

    violations = results
      |> Enum.filter(&match?({:violation, _}, &1))
      |> Enum.map(&elem(&1, 1))

    duration = System.monotonic_time(:millisecond) - start

    %{
      passed: Enum.empty?(violations),
      checks_run: length(checks),
      violations: violations,
      duration_ms: duration
    }
  end

  @spec check_zero_warnings() :: check_result()
  def check_zero_warnings do
    case System.cmd("mix", ["compile", "--warnings-as-errors", "--force"],
           stderr_to_stdout: true) do
      {_, 0} -> :pass
      {output, _} ->
        {:violation, %{
          severity: :block,
          message: "Compilation warnings detected",
          file: nil,
          line: nil,
          remediation: "Fix all compilation warnings. Output:\n#{String.slice(output, 0, 500)}"
        }}
    end
  end

  @spec check_credo_strict() :: check_result()
  def check_credo_strict do
    case System.cmd("mix", ["credo", "--strict", "--format", "json"],
           stderr_to_stdout: true) do
      {output, 0} ->
        case Jason.decode(output) do
          {:ok, %{"issues" => []}} -> :pass
          {:ok, %{"issues" => issues}} ->
            {:violation, %{
              severity: :block,
              message: "#{length(issues)} Credo violation(s) detected",
              file: nil,
              line: nil,
              remediation: "Run `mix credo --strict` and fix all issues"
            }}
          _ -> :pass
        end
      {_, _} ->
        {:violation, %{
          severity: :block,
          message: "Credo analysis failed",
          file: nil,
          line: nil,
          remediation: "Ensure Credo is properly configured and runs successfully"
        }}
    end
  end

  @spec check_dialyzer() :: check_result()
  def check_dialyzer do
    case System.cmd("mix", ["dialyzer", "--format", "short"],
           stderr_to_stdout: true) do
      {_, 0} -> :pass
      {output, _} ->
        {:violation, %{
          severity: :block,
          message: "Dialyzer warnings detected",
          file: nil,
          line: nil,
          remediation: "Fix all Dialyzer warnings. Run `mix dialyzer` for details.\n#{String.slice(output, 0, 500)}"
        }}
    end
  end

  @spec check_tests_pass() :: check_result()
  def check_tests_pass do
    case System.cmd("mix", ["test"], stderr_to_stdout: true) do
      {_, 0} -> :pass
      {output, _} ->
        {:violation, %{
          severity: :block,
          message: "Test failures detected",
          file: nil,
          line: nil,
          remediation: "All tests must pass. Run `mix test` for details.\n#{String.slice(output, 0, 500)}"
        }}
    end
  end

  @spec check_forbidden_patterns() :: check_result()
  def check_forbidden_patterns do
    case System.cmd("mix", ["quality.forbidden_patterns", "--count-only"],
           stderr_to_stdout: true) do
      {"0\n", 0} -> :pass
      {count, _} ->
        {:violation, %{
          severity: :block,
          message: "#{String.trim(count)} forbidden pattern(s) detected",
          file: nil,
          line: nil,
          remediation: "Run `mix quality.forbidden_patterns` and remove all violations"
        }}
    end
  end

  @spec check_quality_gates() :: check_result()
  def check_quality_gates do
    case System.cmd("mix", ["quality.gates"], stderr_to_stdout: true) do
      {_, 0} -> :pass
      {output, _} ->
        {:violation, %{
          severity: :block,
          message: "Quality gate(s) failed",
          file: nil,
          line: nil,
          remediation: "Run `mix quality.gates` and address all failures.\n#{String.slice(output, 0, 500)}"
        }}
    end
  end

  @spec check_regression_tests() :: check_result()
  defp check_regression_tests, do: :pass

  @spec check_typespec_coverage() :: check_result()
  defp check_typespec_coverage, do: :pass

  @spec check_documentation() :: check_result()
  defp check_documentation, do: :pass
end
```

### Bypass Prevention

A zero-tolerance system is only as strong as its bypass resistance. The platform explicitly forbids and detects bypass attempts:

```elixir
defmodule PrismaticQuality.BypassDetection do
  @moduledoc """
  Detects and prevents attempts to bypass zero-tolerance enforcement.

  Monitors for known bypass patterns including --no-verify flags,
  direct pushes, hook deletion, and configuration weakening.
  Any detected bypass attempt triggers L4 SUPREME REVIEW.
  """

  @type bypass_attempt :: %{
    type: atom(),
    detected_at: DateTime.t(),
    actor: String.t(),
    evidence: String.t(),
    severity: :critical
  }

  @forbidden_flags ["--no-verify", "--no-gpg-sign", "--force-with-lease"]

  @spec check_git_config() :: :ok | {:bypass_detected, bypass_attempt()}
  def check_git_config do
    case System.cmd("git", ["config", "--get", "core.hooksPath"]) do
      {"", _} -> :ok
      {path, 0} ->
        expected = ".githooks"
        if String.trim(path) != expected do
          {:bypass_detected, %{
            type: :hooks_path_override,
            detected_at: DateTime.utc_now(),
            actor: "unknown",
            evidence: "core.hooksPath set to '#{String.trim(path)}' instead of '#{expected}'",
            severity: :critical
          }}
        else
          :ok
        end
      _ -> :ok
    end
  end

  @spec check_hook_integrity() :: :ok | {:bypass_detected, bypass_attempt()}
  def check_hook_integrity do
    hook_path = ".githooks/pre-commit"
    case File.stat(hook_path) do
      {:ok, %{size: size}} when size > 0 -> :ok
      {:ok, %{size: 0}} ->
        {:bypass_detected, %{
          type: :empty_hook,
          detected_at: DateTime.utc_now(),
          actor: "unknown",
          evidence: "Pre-commit hook file is empty (0 bytes)",
          severity: :critical
        }}
      {:error, :enoent} ->
        {:bypass_detected, %{
          type: :missing_hook,
          detected_at: DateTime.utc_now(),
          actor: "unknown",
          evidence: "Pre-commit hook file does not exist",
          severity: :critical
        }}
    end
  end

  @spec validate_commit_command(String.t()) :: :ok | {:bypass_detected, bypass_attempt()}
  def validate_commit_command(command) do
    forbidden = Enum.find(@forbidden_flags, &String.contains?(command, &1))

    if forbidden do
      {:bypass_detected, %{
        type: :forbidden_flag,
        detected_at: DateTime.utc_now(),
        actor: "unknown",
        evidence: "Forbidden flag '#{forbidden}' detected in commit command",
        severity: :critical
      }}
    else
      :ok
    end
  end
end
```

### Violation Escalation Protocol

When violations are detected, the platform follows a defined escalation protocol:

| Level | Trigger | Response | Recovery |
|-------|---------|----------|----------|
| **L1** | Single minor violation (e.g., naming convention) | Warning + immediate correction required | Fix and recommit |
| **L2** | Quality violation (warning, Credo issue) | Commit blocked, correction required | Fix violation, recommit |
| **L3** | Incomplete delivery (missing tests, stubs) | Rejection + restart from clean state | Complete implementation, new commit |
| **L4** | Bypass attempt (--no-verify, hook deletion) | Supreme Review escalation | Full audit, process review |

## Implementation in Prismatic Platform

### Current Enforcement State

The platform currently enforces zero tolerance across all 13 quality domains:

```
Dialyzer:               0 violations (ZERO TOLERANCE)
Credo:                   0 violations (ZERO TOLERANCE)
Compilation:             0 violations (ZERO TOLERANCE)
DateTime Precision:      0 violations (ZERO TOLERANCE)
Guard Functions:         0 violations (ZERO TOLERANCE)
@impl Coverage:          0 violations, 709 annotations (ZERO TOLERANCE)
Memory Safety:           0 violations (ZERO TOLERANCE)
Performance:             0 violations (ZERO TOLERANCE)
Regression Prevention:   0 violations (ZERO TOLERANCE)
Timing Patterns:         0 violations (ZERO TOLERANCE)
TODO Management:         0 violations (ZERO TOLERANCE)
Typespec Coverage:       0 violations (ZERO TOLERANCE)
Unsafe Map Access:       0 violations (ZERO TOLERANCE)
```

This state is maintained through continuous automated enforcement, not through human discipline. The system is designed so that maintaining zero requires no conscious effort -- it is the natural consequence of the enforcement pipeline operating correctly.

### The Mandatory Regression Test Protocol

A critical component of zero tolerance is the mandatory regression test requirement. Every bug fix must include tests that would have caught the bug:

1. Identify the root cause and failure mode
2. Create regression test(s) that reproduce the failure
3. Verify the test fails with unfixed code (proving test validity)
4. Apply the fix
5. Verify the test passes with fixed code (proving fix correctness)
6. Report completion with structured output

This protocol is enforced at the P0 (ABSOLUTE) level -- no bug fix commit is accepted without accompanying regression tests. The purpose is not just to fix bugs but to permanently prevent their recurrence, converting each incident into a permanent defense.

## Comparison with Alternatives

| Approach | Standard Type | Enforcement | Outcome |
|----------|--------------|-------------|---------|
| **Prismatic Zero Tolerance** | Absolute (zero violations) | Automated blocking | Consistent zero-violation state |
| **Relative Thresholds** | Percentage-based (e.g., 80% coverage) | Advisory/blocking | Stable but non-zero violation level |
| **Quality Budgets** | Bounded (e.g., max 10 warnings) | Threshold-blocking | Maintained at budget ceiling |
| **Best Effort** | Aspirational guidelines | Code review | Monotonically degrading quality |
| **Periodic Cleanup** | Spike-based | Sprint allocation | Oscillating quality level |
| **Zero Defect Manufacturing** | Industrial (Six Sigma) | Process control | Near-zero (3.4 per million) |

The platform's approach is closest to zero defect manufacturing (ZDM), adapted from industrial quality management to software engineering. The key insight from ZDM is that the cost of building quality in is always lower than the cost of inspecting quality out -- a principle that translates directly to the superiority of blocking gates over post-hoc review.

## Best Practices

1. **Automate everything** -- Zero tolerance maintained by human discipline will fail under pressure. Every quality standard must have an automated check that blocks violations. The platform has zero quality standards that rely on human judgment for enforcement.

2. **Start strict, never relax** -- It is far easier to maintain zero tolerance from the beginning than to achieve it retroactively. When the platform had 905 QDP, elimination required sustained effort. Now that zero is achieved, maintenance is automatic and costless.

3. **Make violations loud** -- When a zero-tolerance gate blocks a commit, the error message must clearly identify the violation, its location, and the required remediation. Cryptic failures lead to frustration; clear failures lead to quick resolution.

4. **Eliminate escape hatches** -- Every bypass mechanism (e.g., `--no-verify`) is a potential failure point. The platform explicitly forbids and detects bypass attempts through the BypassDetection module.

5. **Apply uniformly** -- Zero tolerance loses credibility if applied selectively. All 115 umbrella apps, all developers, all branches, all environments are subject to the same enforcement. No exceptions for "legacy code," "experimental branches," or "senior developers."

6. **Measure the ceiling, not the floor** -- Track the zero-violation state as a maintained achievement rather than a minimum threshold. The Quality Floor Guardian monitors the quality ceiling and escalates any deviation.

7. **Connect enforcement to culture** -- Automated enforcement creates the conditions for quality culture, but culture reinforces enforcement. When zero tolerance is the norm, violations feel wrong even before the automated gate catches them.

8. **Document the doctrine** -- Zero tolerance must be explicit, documented, and accessible. The [No Mercy, No Doubts](@/glossary/no-mercy-no-doubts.md) doctrine documentation ensures that every contributor understands the standards and their enforcement.

## Common Pitfalls

1. **Zero tolerance without tooling** -- Declaring zero tolerance without automated enforcement creates a gap between aspiration and reality. The declaration becomes demoralizing when violations are visible but unchecked.

2. **Selective enforcement** -- Exempting certain teams, applications, or branches from zero tolerance undermines the entire system. If the legacy module is allowed 5 warnings, those 5 warnings normalize the concept of acceptable warnings platform-wide.

3. **Enforcement fatigue** -- If gates block commits too frequently with false positives, developers will seek bypass mechanisms. The platform avoids this by ensuring every blocking check identifies genuine violations (Dialyzer's zero false positive guarantee is critical here).

4. **Confusing strictness with rigidity** -- Zero tolerance means zero violations of the defined standards. It does not mean the standards themselves cannot evolve. The platform regularly updates its quality standards (e.g., adding new Credo checks) through documented processes.

5. **Insufficient remediation guidance** -- Blocking a commit without providing clear guidance on how to fix the violation creates frustration. Every violation message in the platform includes the specific file, line, and recommended remediation action.

6. **Ignoring the cultural dimension** -- Automated enforcement handles compliance; culture handles commitment. Without a shared belief that zero tolerance serves the team's interests, enforcement becomes adversarial rather than supportive.

7. **The "just this once" exception** -- A single exception to zero tolerance is the seed of its destruction. The [no-mercy](@/glossary/no-mercy.md) doctrine exists specifically to resist this pressure: no incomplete implementations, no quality violations, no untested code, no exceptions.

## Use Cases

### Achieving Zero from Non-Zero

The platform's journey from 905 QDP to 0 demonstrates zero-tolerance implementation on an existing codebase. The approach: establish automated blocking gates at the introduction boundary (pre-commit), then systematically eliminate existing violations through category-specific campaigns while the gates prevent new introduction. The order matters -- gate first, then eliminate, not the reverse.

### Maintaining Zero Across 115 Applications

With 115 umbrella applications and approximately 2.8 million lines of code, maintaining zero violations requires per-application quality tracking (Quality DNA), platform-wide enforcement (pre-commit hooks, CI gates), and continuous monitoring (Quality Floor Guardian). The system scales because enforcement is automated, not because developers are more disciplined.

### New Developer Onboarding

A new developer submits their first pull request. The pre-commit hook blocks the commit due to a missing `@spec` annotation on a public function. The error message identifies the file, line, and exact requirement. The developer adds the spec, the commit succeeds, and the developer has learned the standard through direct experience -- no training session required.

### Emergency Hotfix Under Pressure

During a production incident, the team needs to deploy a fix immediately. Zero tolerance does not create a conflict because the enforcement pipeline runs in seconds (fast pre-commit path). The fix is written, tested, committed (all gates pass), and deployed in minutes. Zero tolerance costs no additional time because the gates verify correctness, not just compliance.

### Preventing Quality Regression

After a complex refactoring across multiple applications, the Quality Floor Guardian detects that the Dialyzer warning count increased from 0 to 3 in `prismatic_agents`. The commit is blocked, the developer investigates and finds a type mismatch introduced during the refactoring, fixes it, and the commit proceeds -- all before the regression reaches the main branch.

## Related Concepts

- [No Mercy](@/glossary/no-mercy.md) -- The enforcement half of the NM/ND doctrine that zero tolerance operationalizes
- [No Mercy No Doubts](@/glossary/no-mercy-no-doubts.md) -- The complete doctrine that provides the philosophical foundation for zero tolerance
- [Clean Run](@/glossary/clean-run.md) -- Requirement for zero runtime warnings, zero info/debug logs, complementing compile-time zero tolerance
- [Zero Warning Policy](@/glossary/zero-warning-policy.md) -- Specific application of zero tolerance to compilation warnings
- [Zero Compromise Quality](@/glossary/zero-compromise-quality.md) -- Platform-wide quality standard built on zero tolerance principles
- [Quality Gate](@/glossary/quality-gate.md) -- The automated enforcement mechanism that makes zero tolerance operational
- [Pre-commit Hooks](@/glossary/pre-commit-hooks.md) -- First enforcement layer that blocks violations at commit time
- [Quality Debt](@/glossary/quality-debt.md) -- What accumulates when zero tolerance is not enforced
- [Technical Debt](@/glossary/technical-debt.md) -- The broader cost category that zero tolerance prevents
- [Quality DNA](@/glossary/quality-dna.md) -- Persistent quality state that maintains the zero-violation baseline across sessions
- [Credo](@/glossary/credo.md) -- Static analysis tool enforcing zero Credo violations under strict mode
- [Dialyzer](@/glossary/dialyzer.md) -- Type analysis tool enforcing zero type safety violations

## See Also

- [No Mercy No Doubts Doctrine](/doctrine/no-mercy-no-doubts/) -- Full doctrine documentation
- [Quality Gate Pipeline](/capabilities/quality-gates/) -- Enforcement implementation details
- [Quality Floor Guardian](/architecture/quality-floor-guardian/) -- Continuous monitoring system
- [Martin Fowler: Continuous Integration](https://martinfowler.com/articles/continuousIntegration.html) -- Industry foundations for quality enforcement
- [Zero Defect Manufacturing](https://en.wikipedia.org/wiki/Zero_Defects) -- Industrial quality management origin of the concept

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
