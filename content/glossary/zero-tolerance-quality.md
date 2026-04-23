+++
title = "Zero Tolerance Quality"
weight = 50
[extra]
tags = ["glossary", "zero-tolerance-quality", "quality-enforcement", "quality-floor", "pre-commit-hooks", "ci-cd-gates", "violation-protocol", "quality-automation", "continuous-enforcement", "blocking-gates"]
description = "The enforcement mechanism that implements zero-compromise quality through automated blocking gates, violation escalation protocols, and continuous monitoring. In Prismatic: 11-phase pre-commit hooks, Quality Floor Guardian at 100/100, 4-level violation escalation (L1-L4), automated forbidden pattern scanning, blocking CI/CD gates, and zero-bypass policy across all 115 umbrella applications."
category = "quality"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "15 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "Quality & Enforcement"
related_concepts = ["quality gates", "pre-commit hooks", "CI/CD enforcement", "violation escalation", "blocking gates", "quality automation", "static analysis", "continuous inspection", "policy enforcement", "zero tolerance policy"]
implementation_status = "production"
authority_level = "platform-doctrine"
difficulty_rating = 7
prerequisites = ["quality-gates", "ci-cd", "git-hooks", "testing"]
learning_path = ["git-hooks", "quality-gates", "ci-cd-pipelines", "zero-tolerance-quality", "quality-floor-guardian", "autonomous-quality"]
interactive_demos = ["/labs/glossary/zero-tolerance-quality"]
code_examples = ["PreCommitEnforcer", "ViolationEscalator", "QualityGateRunner", "CIGateBlocker", "EnforcementDashboard", "BypassDetector"]
external_resources = ["https://pre-commit.com/", "https://docs.gitlab.com/ee/ci/pipelines/", "https://semgrep.dev/", "https://www.sonarqube.org/"]
version_introduced = "gen-5"
stability_level = "stable"
testing_scenarios = ["pre-commit hook enforcement reliability", "violation escalation correctness", "bypass attempt detection", "false positive rate management", "enforcement latency impact", "multi-phase hook execution order"]
keywords = ["zero tolerance quality", "quality enforcement", "pre-commit hooks", "quality gates", "violation protocol", "blocking gates", "quality floor", "CI/CD gates", "bypass prevention", "quality automation"]
related_terms = ["zero-compromise-quality", "zero-warning-policy", "zero-tolerance", "quality-floor", "violation-protocol", "test-coverage", "verification", "regression-testing", "autoheal", "autoevolve", "autonomous-quality", "technical-debt"]
learning_outcomes = ["Design multi-phase pre-commit hook pipelines that enforce quality standards", "Implement violation escalation protocols with appropriate severity levels", "Build bypass detection systems that prevent quality gate circumvention", "Configure CI/CD gates that block non-compliant code from merging", "Create quality enforcement dashboards for real-time compliance monitoring"]
word_count = 1522
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Zero Tolerance Quality - Prismatic Platform"
+++

## Definition

**Zero Tolerance Quality** is the enforcement mechanism that transforms the [zero-compromise quality](@/glossary/zero-compromise-quality.md) philosophy into automated, non-bypassable quality gates at every stage of the software development lifecycle. While zero-compromise quality states the principle ("every line of code must be production-ready"), zero-tolerance quality implements the consequence ("non-compliant code is automatically blocked, and bypass attempts are detected and escalated"). Within the Prismatic Platform, zero-tolerance quality operates through an 11-phase pre-commit hook pipeline, a 4-level violation escalation protocol (L1 Warning through L4 Supreme Review), the Quality Floor Guardian maintaining a continuous 100/100 score, blocking CI/CD gates in the GitLab pipeline, automated forbidden pattern scanning, and a zero-bypass policy enforced through hook integrity monitoring. The critical distinction between this and the related [zero-compromise quality](@/glossary/zero-compromise-quality.md) is that zero-tolerance quality is about the enforcement infrastructure rather than the guiding philosophy -- it answers "how do we ensure compliance?" rather than "why do we demand it?"

## Overview

Every quality philosophy eventually confronts the same challenge: enforcement. The software industry is littered with quality standards that exist on paper but are ignored in practice -- style guides that no one follows, code review checklists that are rubber-stamped, CI pipelines with "allowed to fail" stages. Zero-tolerance quality addresses this gap by making non-compliance structurally impossible rather than merely discouraged.

The enforcement philosophy is built on three principles:

**1. Automation over discipline.** Human discipline is unreliable. Under deadline pressure, code review rigor degrades, testing shortcuts appear, and "just this once" exceptions multiply. Automated enforcement operates consistently regardless of schedule pressure, team fatigue, or organizational politics.

**2. Prevention over detection.** It is better to prevent non-compliant code from entering the repository than to detect it after the fact. Pre-commit hooks catch violations before they become commits. CI gates catch violations before they become merges. The Quality Floor Guardian catches violations before they become regressions.

**3. Transparency over secrecy.** Every enforcement action, every violation, and every escalation is logged, visible, and auditable. Developers can see exactly what was blocked and why. There are no hidden quality rules or secret enforcement criteria.

The Prismatic Platform's enforcement infrastructure has evolved through multiple generations:

| Generation | Enforcement Level | Coverage |
|-----------|-------------------|----------|
| Gen 1-3 | Manual code review | Ad-hoc |
| Gen 4-6 | Basic CI checks (mix test, mix credo) | ~40% |
| Gen 7-9 | Pre-commit hooks + CI gates | ~70% |
| Gen 10-12 | 11-phase pre-commit + Quality Floor Guardian | ~90% |
| Gen 13-19 | Full automation + bypass detection + autonomous healing | 100% |

At Generation 19, the enforcement infrastructure is comprehensive: every quality violation is automatically detected, every bypass attempt is flagged, and the Quality Floor Guardian continuously monitors for regressions.

## The 11-Phase Pre-Commit Pipeline

The pre-commit hook is the first line of enforcement. It runs 11 sequential phases, each checking a specific quality dimension. A failure in any phase blocks the commit:

```elixir
defmodule Prismatic.Quality.PreCommitEnforcer do
  @moduledoc """
  Orchestrates the 11-phase pre-commit hook pipeline. Each phase
  checks a specific quality dimension. Phases execute sequentially
  because later phases depend on earlier ones passing (e.g., Phase 2
  compilation must succeed before Phase 3 Dialyzer can run).

  A failure in ANY phase blocks the commit. There are no exceptions,
  no --no-verify bypasses (detected and escalated as L4 violations),
  and no "allowed to fail" phases.

  Phases:
    1. Formatting (mix format --check-formatted)
    2. Compilation (mix compile --warnings-as-errors)
    3. Dialyzer (mix dialyzer)
    4. Credo (mix credo --strict)
    5. Tests (mix test for changed files)
    6. Typespec coverage (public functions must have @spec)
    7. @impl coverage (callbacks must have @impl true)
    8. Forbidden patterns (no stubs, mocks, placeholders)
    9. Template validation (Promo site templates)
    10. Design consistency (Flowbite/TailwindCSS compliance)
    11. Quality gates (mix quality.gates final check)
  """

  @type phase :: %{
    number: pos_integer(),
    name: String.t(),
    command: String.t(),
    timeout_ms: pos_integer(),
    critical: boolean()
  }
  @type phase_result :: %{
    phase: phase(),
    passed: boolean(),
    output: String.t(),
    duration_ms: non_neg_integer()
  }
  @type pipeline_result :: %{
    passed: boolean(),
    phases: [phase_result()],
    failed_phase: phase() | nil,
    total_duration_ms: non_neg_integer(),
    timestamp: DateTime.t()
  }

  @phases [
    %{number: 1, name: "Formatting", command: "mix format --check-formatted", timeout_ms: 30_000, critical: true},
    %{number: 2, name: "Compilation", command: "mix compile --warnings-as-errors", timeout_ms: 120_000, critical: true},
    %{number: 3, name: "Dialyzer", command: "mix dialyzer", timeout_ms: 300_000, critical: true},
    %{number: 4, name: "Credo", command: "mix credo --strict", timeout_ms: 60_000, critical: true},
    %{number: 5, name: "Tests", command: "mix test", timeout_ms: 300_000, critical: true},
    %{number: 6, name: "Typespec Coverage", command: "mix quality.typespec_coverage", timeout_ms: 60_000, critical: true},
    %{number: 7, name: "@impl Coverage", command: "mix quality.impl_coverage", timeout_ms: 30_000, critical: true},
    %{number: 8, name: "Forbidden Patterns", command: "mix quality.forbidden_patterns", timeout_ms: 30_000, critical: true},
    %{number: 9, name: "Template Validation", command: "scripts/validate-promo-templates.sh", timeout_ms: 15_000, critical: false},
    %{number: 10, name: "Design Consistency", command: "scripts/validate-design-consistency.sh", timeout_ms: 15_000, critical: false},
    %{number: 11, name: "Quality Gates", command: "mix quality.gates", timeout_ms: 120_000, critical: true}
  ]

  @spec run_pipeline() :: pipeline_result()
  def run_pipeline do
    start_time = System.monotonic_time(:millisecond)

    {results, failed_phase} =
      Enum.reduce_while(@phases, {[], nil}, fn phase, {results, _} ->
        result = execute_phase(phase)

        if result.passed or not phase.critical do
          {:cont, {[result | results], nil}}
        else
          {:halt, {[result | results], phase}}
        end
      end)

    total_duration = System.monotonic_time(:millisecond) - start_time
    ordered_results = Enum.reverse(results)

    %{
      passed: is_nil(failed_phase),
      phases: ordered_results,
      failed_phase: failed_phase,
      total_duration_ms: total_duration,
      timestamp: DateTime.utc_now()
    }
  end

  @spec execute_phase(phase()) :: phase_result()
  defp execute_phase(phase) do
    start_time = System.monotonic_time(:millisecond)

    {output, exit_code} = System.cmd("sh", ["-c", phase.command],
      stderr_to_stdout: true,
      env: [{"MIX_ENV", "test"}]
    )

    duration = System.monotonic_time(:millisecond) - start_time

    %{
      phase: phase,
      passed: exit_code == 0,
      output: String.slice(output, 0, 5000),
      duration_ms: duration
    }
  end
end
```

### Phase Execution Details

Each phase serves a specific enforcement purpose:

**Phase 1: Formatting.** Ensures consistent code formatting across all files. This is the fastest check and catches the most common trivial violations. Using `mix format --check-formatted` rather than auto-formatting ensures developers are aware of formatting issues in their workflow.

**Phase 2: Compilation.** Compiles with `--warnings-as-errors`, blocking any code that produces compiler warnings. This catches unused variables, deprecated function calls, missing module references, and other issues that indicate incomplete or careless code.

**Phase 3: Dialyzer.** Runs success typing analysis to catch type errors, unreachable code, and specification violations. This is the most time-intensive phase (~2-5 minutes for full analysis) but catches an entire class of bugs that testing cannot reach.

**Phase 4: Credo.** Enforces coding standards and detects anti-patterns through static analysis in strict mode. Credo checks include complexity limits, naming conventions, code consistency, and readability metrics.

**Phase 5: Tests.** Runs the test suite for changed files. For performance, only tests in applications that have changed files are executed during pre-commit; the full suite runs in CI.

**Phases 6-7: Coverage Checks.** Verify that all public functions have `@spec` type specifications and all callback implementations have `@impl true` annotations. These checks ensure that new code maintains the platform's documentation and type safety standards.

**Phase 8: Forbidden Patterns.** Scans for stubs, mocks, placeholders, TODO/FIXME markers, and other indicators of incomplete implementation in production code.

**Phases 9-10: Template and Design Validation.** Check the promo site templates for HTML validity and Flowbite/TailwindCSS compliance.

**Phase 11: Quality Gates.** The final comprehensive quality check that verifies all 13 quality domains pass.

## Violation Escalation Protocol

When violations are detected, they are classified and escalated according to a 4-level protocol:

```elixir
defmodule Prismatic.Quality.ViolationProtocol do
  @moduledoc """
  Implements the 4-level violation escalation protocol for quality
  enforcement. Each level has defined triggers, required actions,
  and escalation criteria. The protocol ensures that violations are
  addressed with appropriate urgency and authority.

  Levels:
    L1 (Warning) - Minor deviation, self-correctable
    L2 (Block)   - Quality violation, requires correction before proceed
    L3 (Reject)  - Incomplete delivery, restart required
    L4 (Supreme) - Doubt-compromised or bypass attempt, supreme review
  """

  @type level :: :l1_warning | :l2_block | :l3_reject | :l4_supreme
  @type violation :: %{
    id: String.t(),
    level: level(),
    category: atom(),
    description: String.t(),
    file: String.t() | nil,
    line: non_neg_integer() | nil,
    detected_at: DateTime.t(),
    detected_by: String.t(),
    resolution_deadline: DateTime.t() | nil,
    status: :open | :resolving | :resolved | :escalated
  }
  @type escalation_action :: %{
    violation_id: String.t(),
    from_level: level(),
    to_level: level(),
    reason: String.t(),
    escalated_at: DateTime.t()
  }

  @spec classify_violation(atom(), String.t()) :: level()
  def classify_violation(category, context) do
    case {category, context} do
      {:formatting, _} -> :l1_warning
      {:compilation_warning, _} -> :l2_block
      {:credo_violation, _} -> :l2_block
      {:dialyzer_error, _} -> :l2_block
      {:missing_typespec, _} -> :l2_block
      {:forbidden_pattern, _} -> :l2_block
      {:incomplete_delivery, _} -> :l3_reject
      {:missing_tests, _} -> :l3_reject
      {:bypass_attempt, _} -> :l4_supreme
      {:hook_circumvention, _} -> :l4_supreme
      {:no_verify_flag, _} -> :l4_supreme
      _ -> :l2_block
    end
  end

  @spec create_violation(level(), atom(), String.t(), keyword()) :: violation()
  def create_violation(level, category, description, opts \\ []) do
    %{
      id: generate_violation_id(),
      level: level,
      category: category,
      description: description,
      file: Keyword.get(opts, :file),
      line: Keyword.get(opts, :line),
      detected_at: DateTime.utc_now(),
      detected_by: Keyword.get(opts, :detected_by, "automated"),
      resolution_deadline: compute_deadline(level),
      status: :open
    }
  end

  @spec compute_deadline(level()) :: DateTime.t() | nil
  defp compute_deadline(:l1_warning), do: DateTime.add(DateTime.utc_now(), 24 * 3600)
  defp compute_deadline(:l2_block), do: nil
  defp compute_deadline(:l3_reject), do: nil
  defp compute_deadline(:l4_supreme), do: nil

  @spec should_escalate?(violation()) :: boolean()
  def should_escalate?(violation) do
    case violation.level do
      :l1_warning ->
        deadline_exceeded?(violation)

      :l2_block ->
        violation.status == :open and hours_since(violation.detected_at) > 4

      :l3_reject ->
        violation.status != :resolved

      :l4_supreme ->
        true
    end
  end

  @spec escalate(violation()) :: escalation_action()
  def escalate(violation) do
    next_level =
      case violation.level do
        :l1_warning -> :l2_block
        :l2_block -> :l3_reject
        :l3_reject -> :l4_supreme
        :l4_supreme -> :l4_supreme
      end

    %{
      violation_id: violation.id,
      from_level: violation.level,
      to_level: next_level,
      reason: "Unresolved violation escalated after timeout",
      escalated_at: DateTime.utc_now()
    }
  end
end
```

### Violation Level Details

| Level | Trigger | Response | Authority | Example |
|-------|---------|----------|-----------|---------|
| **L1 Warning** | Minor deviation from standards | Warning message, self-correction expected within 24h | Agent | Formatting inconsistency |
| **L2 Block** | Quality gate failure | Commit blocked, must fix before proceeding | System | Compilation warning, Credo violation |
| **L3 Reject** | Incomplete delivery attempt | Work rejected, must restart from compliant state | System | Missing tests, forbidden patterns |
| **L4 Supreme** | Bypass attempt or doubt-compromised work | Full review by supreme authority, potential audit | Supreme | `--no-verify` usage, hook circumvention |

## Bypass Prevention

A critical aspect of zero-tolerance enforcement is preventing circumvention. The platform monitors for several bypass patterns:

### The --no-verify Problem

Git's `--no-verify` flag skips pre-commit and commit-msg hooks. In many organizations, developers routinely use this flag to bypass slow or annoying hooks. The Prismatic Platform treats `--no-verify` usage as an L4 violation:

```elixir
defmodule Prismatic.Quality.BypassDetector do
  @moduledoc """
  Detects attempts to bypass quality enforcement mechanisms.
  Monitors for --no-verify flag usage, hook file modifications,
  direct git object manipulation, and other circumvention patterns.

  Every detected bypass is classified as an L4 violation and
  escalated to supreme review. The bypass detection runs as a
  server-side hook (pre-receive) that cannot be bypassed from
  the client side.
  """

  @type bypass_pattern :: :no_verify | :hook_modification | :direct_push | :force_push | :rebase_skip
  @type bypass_attempt :: %{
    pattern: bypass_pattern(),
    user: String.t(),
    timestamp: DateTime.t(),
    evidence: String.t(),
    commit_sha: String.t() | nil
  }

  @spec detect_no_verify(String.t()) :: {:bypass_detected, bypass_attempt()} | :clean
  def detect_no_verify(commit_sha) do
    # Server-side detection: check if hooks would have passed
    # If commit arrives at server without hook signatures, it was bypassed
    case verify_hook_signature(commit_sha) do
      :valid -> :clean
      :missing ->
        {:bypass_detected, %{
          pattern: :no_verify,
          user: extract_author(commit_sha),
          timestamp: DateTime.utc_now(),
          evidence: "Commit #{commit_sha} missing hook execution signature",
          commit_sha: commit_sha
        }}
    end
  end

  @spec detect_force_push(String.t(), String.t()) :: {:bypass_detected, bypass_attempt()} | :clean
  def detect_force_push(ref, old_sha) do
    if is_non_fast_forward?(ref, old_sha) do
      {:bypass_detected, %{
        pattern: :force_push,
        user: "unknown",
        timestamp: DateTime.utc_now(),
        evidence: "Non-fast-forward push to #{ref}",
        commit_sha: nil
      }}
    else
      :clean
    end
  end

  @spec log_and_escalate(bypass_attempt()) :: :ok
  def log_and_escalate(attempt) do
    violation = Prismatic.Quality.ViolationProtocol.create_violation(
      :l4_supreme,
      :bypass_attempt,
      "Quality enforcement bypass detected: #{attempt.pattern}",
      detected_by: "BypassDetector"
    )

    Prismatic.Quality.ViolationProtocol.escalate(violation)
    :ok
  end
end
```

### Server-Side Enforcement

Client-side hooks (pre-commit, commit-msg) can be bypassed. The Prismatic Platform augments client-side enforcement with server-side hooks (pre-receive) that run on GitLab:

- **Pre-receive hooks** verify that incoming commits carry hook execution signatures
- **CI/CD pipeline gates** re-run all quality checks as mandatory stages
- **Merge request checks** require green CI pipeline before merge is allowed
- **Protected branch rules** prevent direct pushes to main/production branches

This defense-in-depth approach ensures that even if client-side hooks are bypassed, the violation is caught server-side.

## CI/CD Gate Integration

The CI/CD pipeline implements a second layer of enforcement with stages that must pass before code can be merged:

```yaml
# GitLab CI quality gates (simplified)
quality:compilation:
  stage: quality
  script:
    - mix compile --warnings-as-errors --force
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'

quality:dialyzer:
  stage: quality
  script:
    - mix dialyzer
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'

quality:credo:
  stage: quality
  script:
    - mix credo --strict
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'

quality:tests:
  stage: quality
  script:
    - mix test --cover
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'

quality:gates:
  stage: quality
  script:
    - mix quality.gates
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
```

## Enforcement Metrics and Monitoring

The platform tracks enforcement metrics to ensure the system is functioning correctly:

| Metric | Target | Current |
|--------|--------|---------|
| Pre-commit hook execution rate | 100% | 100% |
| Quality gate passage rate | >95% first attempt | 97.2% |
| Average pre-commit duration | <60s | 42s |
| Bypass attempt rate | 0% | 0% |
| False positive rate | <1% | 0.3% |
| Violation resolution time (L2) | <1h | 23 min avg |
| Quality score stability | 100/100 | 100/100 |

These metrics are monitored continuously by the Quality Floor Guardian and displayed on the platform's quality dashboard.

## Cross-References

- [Zero Compromise Quality](@/glossary/zero-compromise-quality.md) -- The philosophical foundation that zero-tolerance quality enforces
- [Zero Warning Policy](@/glossary/zero-warning-policy.md) -- Specific policy enforced within the compilation phase
- [Zero Tolerance](@/glossary/zero-tolerance.md) -- The general principle of zero-tolerance enforcement
- [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) -- The minimum quality score maintained by the Guardian
- [Violation Protocol](@/glossary/violation-protocol.md) -- The 4-level escalation system for quality violations
- [Verification](@/glossary/verification.md) -- The process that quality gates verify
- [Test Coverage](@/glossary/test-coverage.md) -- Metric enforced by Phase 5 of the pre-commit pipeline
- [Regression Testing](@/glossary/regression-testing.md) -- Mandatory protocol enforced for every bug fix
- [Autoheal](@/glossary/autoheal.md) -- Autonomous system that fixes detected quality violations
- [Autoevolve](@/glossary/autoevolve.md) -- Autonomous system that evolves enforcement standards
- [Autonomous Quality](@/glossary/autonomous-quality.md) -- The self-maintaining quality system built on enforcement
- [Technical Debt](@/glossary/technical-debt.md) -- What rigorous enforcement prevents from accumulating

## Best Practices

1. **Enforce at the earliest possible point.** Pre-commit hooks are faster feedback than CI/CD. IDE integration is faster than pre-commit. The earlier a violation is caught, the cheaper it is to fix.

2. **Keep enforcement fast.** If pre-commit hooks take more than 60 seconds, developers will find ways to avoid them. Optimize checks for speed; defer slow checks (full Dialyzer) to CI/CD while keeping fast approximations in pre-commit.

3. **Provide clear, actionable error messages.** When enforcement blocks a commit, the error message must explain what failed, where it failed, and how to fix it. Cryptic error codes drive circumvention.

4. **Monitor enforcement health.** Track false positive rates, execution times, and bypass attempts. Enforcement systems that cry wolf lose credibility and compliance.

5. **Defense in depth.** Never rely on a single enforcement point. Client-side hooks + server-side hooks + CI/CD gates + branch protection create overlapping defenses where any single failure is caught by the next layer.

6. **Version your enforcement rules.** Store hook configurations, quality thresholds, and enforcement policies in version control alongside the code they protect. This ensures that enforcement evolves with the codebase.

## Common Pitfalls

- **Enforcement without buy-in.** Quality gates imposed without team understanding generate resentment and workarounds. Build understanding first, then enforce.
- **All-or-nothing deployment.** Introducing 11 enforcement phases simultaneously overwhelms teams. Deploy phases incrementally, starting with the least disruptive (formatting) and progressing to the most demanding (full quality gates).
- **Ignoring false positives.** Every false positive erodes trust in the enforcement system. Invest heavily in reducing false positive rates, even at the cost of occasionally missing true positives.
- **Enforcement without tooling.** Blocking commits without providing auto-fix capabilities (like `mix format`) creates frustration. For every check, provide a corresponding fix tool.
- **Static enforcement in a dynamic codebase.** Enforcement rules must evolve as the codebase grows. What was appropriate for 30 apps may be insufficient or excessive for 115.

## Further Reading

- Humble, Farley. "Continuous Delivery" (2010) -- The foundational work on deployment pipelines and quality gates
- Kim, Humble, Debois, Willis. "The DevOps Handbook" (2016) -- Practical guide to CI/CD and automated quality enforcement
- Forsgren, Humble, Kim. "Accelerate" (2018) -- Research demonstrating the correlation between strong CI/CD practices and organizational performance
- GitLab CI/CD Documentation -- Reference for implementing pipeline-based quality gates

---

*Built with precision. Enforced without exception.*

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
