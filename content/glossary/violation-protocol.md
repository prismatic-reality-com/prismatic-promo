+++
title = "Violation Protocol"
weight = 4
[extra]
description = "L1-L4 escalation levels for NM/ND doctrine breaches with deterministic enforcement, audit trails, and automated resolution workflows"
category = "doctrine"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
difficulty = "intermediate"
quality_score = 97
abbreviation = "VP"
date_created = "2026-02-22"
date_updated = "2026-02-22"
importance = "critical"
related_terms = ["nm-nd", "no-mercy", "no-doubts", "quality-gates", "regression-test", "archer-supreme", "violation-protocol", "pre-commit-hooks", "credo", "dialyzer", "clean-run", "zero-warning-policy"]
keywords = ["violation protocol", "escalation levels", "quality enforcement", "NM/ND doctrine", "L1 L2 L3 L4 violations", "automated enforcement", "audit trail", "violation state machine", "supreme review"]
tags = ["doctrine", "enforcement", "quality", "security", "compliance"]
platforms = ["elixir", "phoenix", "prismatic"]
use_cases = ["quality-enforcement", "violation-detection", "audit-compliance", "pre-commit-validation", "ci-pipeline-gating"]
prerequisites = ["nm-nd", "quality-gates", "pre-commit-hooks"]
key_takeaway = "The Violation Protocol transforms quality enforcement from an informal process into a formal state machine with four deterministic escalation levels, ensuring every deviation receives a proportional, auditable response."
word_count = 2226
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Violation Protocol - Prismatic Platform"
+++

## Definition & Overview

The Violation Protocol is the formal escalation and enforcement framework governing responses to breaches of the [NO MERCY, NO DOUBTS (NM/ND) Doctrine](/glossary/nm-nd/) within the Prismatic Platform. It defines four precisely calibrated escalation levels---L1 through L4---each mapping to a specific category of violation severity, a prescribed enforcement response, and a resolution authority. The protocol ensures that every quality deviation, incomplete delivery, or doctrine compromise receives a proportional, deterministic, and auditable response.

In traditional software engineering, quality violations are handled informally: code review comments, Jira tickets, or at best, CI pipeline failures that developers can retry or override. The Violation Protocol fundamentally rejects this approach. It treats quality enforcement as a formal system with defined states, transitions, and invariants. Every violation has exactly one correct escalation level, one prescribed response, and one resolution pathway. There is no ambiguity, no negotiation, and no bypass.

The protocol operates across three enforcement domains simultaneously: automated tooling (pre-commit hooks, CI pipelines, quality gates), agent oversight (AIAD agents monitoring code quality in real time), and supreme authority review (L5 agents such as [Archer Supreme](/glossary/archer-supreme/) for the most severe violations). This layered enforcement ensures that violations are caught at the earliest possible point and escalated only when the violation severity warrants elevated authority.

The four escalation levels form a strict hierarchy:

| Level | Classification | Trigger | Response | Authority |
|-------|---------------|---------|----------|-----------|
| **L1** | Minor Deviation | Style issues, naming inconsistencies | Warning + Immediate correction | Agent |
| **L2** | Quality Violation | Compilation warnings, failed tests, Credo violations | Block + Required correction | System |
| **L3** | Incomplete Delivery | Stubs, placeholders, TODOs, missing tests | Rejection + Restart | Pipeline |
| **L4** | Doubt-Compromised | Hook bypass attempts, `--no-verify`, falsified results | Rejection + Supreme Review | L5 Supreme |

## Historical Context and Motivation

The Violation Protocol was formalized in Generation 6 of the Prismatic Platform's evolution, during the period when [quality gates](/glossary/quality-gates/) were being introduced systematically. Before the protocol's existence, quality enforcement was binary: checks either passed or failed, with no distinction between a minor formatting issue and a deliberate hook bypass attempt. This lack of granularity created two problems.

First, developers treated all failures equally, applying minimal effort to pass the gate regardless of the underlying issue's severity. A compilation warning received the same attention as a stub implementation, despite the fact that the latter represents a fundamentally different category of quality risk. Second, there was no escalation pathway for systemic violations. When a pattern of repeated failures indicated a deeper process problem rather than an isolated coding mistake, the enforcement system had no mechanism to escalate beyond the immediate blocking action.

The four-level classification system emerged from analyzing historical violations across the platform's first five generations. The analysis revealed four natural clusters of violation severity: cosmetic deviations that did not affect correctness (L1), functional quality failures caught by tooling (L2), fundamental completeness failures requiring rework (L3), and integrity violations that undermined the enforcement system itself (L4). Each cluster required a distinct response strategy, and the protocol formalized these responses into a deterministic framework.

The decision to make the protocol a formal state machine rather than a set of guidelines was deliberate. State machines provide verifiable correctness properties: every state has defined transitions, every transition has preconditions, and the system's behavior is deterministic and auditable. This formality aligns with the platform's broader commitment to treating quality enforcement as an engineering discipline rather than a social convention.

## Technical Deep Dive

### Escalation Level Semantics

Each violation level carries precise semantic meaning that determines both the enforcement response and the resolution pathway.

**L1 - Minor Deviation** represents cosmetic or stylistic departures from platform standards. These include variable naming inconsistencies, suboptimal but functional code patterns, missing documentation on internal helper functions, or minor formatting deviations. L1 violations do not affect correctness or security. The response is a warning with immediate correction expected in the same commit or work session. L1 violations are tracked but do not block progress.

**L2 - Quality Violation** represents functional quality failures detected by automated tooling. Compilation warnings (under `--warnings-as-errors`), [Credo](/glossary/credo/) strict violations, [Dialyzer](/glossary/dialyzer/) type errors, failed unit tests, and coverage regressions all trigger L2. The response is a hard block: the commit, merge, or deployment is rejected until the violation is corrected. L2 violations require the developer or agent to fix the issue and re-submit through the full quality gate pipeline.

**L3 - Incomplete Delivery** represents work product that fails to meet the NM/ND completeness standard. Stub implementations, placeholder functions returning hardcoded values, TODO or FIXME comments left in production code, mock implementations where real ones are required, and missing regression tests for bug fixes all trigger L3. The response is rejection with restart: the entire deliverable is rejected, and the work must be redone from scratch rather than patched incrementally. This ensures that incomplete work is never built upon.

**L4 - Doubt-Compromised** represents the most severe category: violations that undermine the integrity of the enforcement system itself. Using `git commit --no-verify` to bypass pre-commit hooks, using `git push --no-verify`, falsifying test results, disabling quality gates, or any attempt to circumvent the enforcement pipeline triggers L4. The response is rejection plus Supreme Review by L5 authority agents. L4 violations indicate a systemic threat to platform integrity and require investigation by [Archer Supreme](/glossary/archer-supreme/) or the Supreme Commander.

### Violation Detection Mechanisms

The Violation Protocol relies on multiple detection layers operating at different stages of the development lifecycle:

```
Developer Action
    |
    v
[Pre-Commit Hook] -----> L1/L2 Detection (compile, credo, format)
    |
    v
[Commit-Msg Hook] -----> L1 Detection (conventional commits format)
    |
    v
[Pre-Push Hook] -------> L2/L3 Detection (tests, coverage, quality gates)
    |
    v
[CI Pipeline] ----------> L2/L3/L4 Detection (full quality suite)
    |
    v
[Agent Review] ----------> L1-L4 Detection (semantic analysis)
    |
    v
[Supreme Review] --------> L4 Investigation (integrity analysis)
```

### Violation Classification Algorithm

The classification algorithm uses pattern matching to deterministically assign violation levels based on the violation type. The algorithm is designed to be exhaustive, covering every known violation category with no ambiguity:

```elixir
defmodule PrismaticSafety.ViolationClassifier do
  @moduledoc """
  Classifies detected issues into violation levels using deterministic
  pattern matching. Ensures every violation type maps to exactly one level.
  """

  @type violation_type ::
    :style_deviation | :naming_inconsistency | :missing_doc |
    :compilation_warning | :test_failure | :credo_violation |
    :dialyzer_error | :coverage_regression |
    :stub_implementation | :missing_regression_test |
    :todo_in_production | :placeholder_code | :mock_in_production |
    :hook_bypass | :no_verify_flag | :falsified_results |
    :quality_gate_disabled

  @l1_types [:style_deviation, :naming_inconsistency, :missing_doc]
  @l2_types [:compilation_warning, :test_failure, :credo_violation,
             :dialyzer_error, :coverage_regression]
  @l3_types [:stub_implementation, :missing_regression_test,
             :todo_in_production, :placeholder_code, :mock_in_production]
  @l4_types [:hook_bypass, :no_verify_flag, :falsified_results,
             :quality_gate_disabled]

  @spec classify(violation_type()) :: {:ok, :l1 | :l2 | :l3 | :l4}
  def classify(type) when type in @l1_types, do: {:ok, :l1}
  def classify(type) when type in @l2_types, do: {:ok, :l2}
  def classify(type) when type in @l3_types, do: {:ok, :l3}
  def classify(type) when type in @l4_types, do: {:ok, :l4}
end
```

## Architecture & Implementation

### Violation State Machine

The Violation Protocol implements a formal state machine where each violation transitions through defined states:

```elixir
defmodule PrismaticSafety.ViolationProtocol do
  @moduledoc """
  Implements the L1-L4 violation escalation protocol for NM/ND doctrine enforcement.
  Each violation follows a deterministic state machine from detection through resolution.
  """

  @type level :: :l1 | :l2 | :l3 | :l4
  @type state :: :detected | :blocked | :rejected | :under_review | :resolved | :escalated

  @type violation :: %{
    id: String.t(),
    level: level(),
    state: state(),
    source: String.t(),
    description: String.t(),
    detected_at: DateTime.t(),
    detected_by: atom(),
    resolution: map() | nil
  }

  @spec classify(map()) :: {:ok, level()} | {:error, :unclassifiable}
  def classify(%{type: :style_deviation}), do: {:ok, :l1}
  def classify(%{type: :compilation_warning}), do: {:ok, :l2}
  def classify(%{type: :test_failure}), do: {:ok, :l2}
  def classify(%{type: :credo_violation}), do: {:ok, :l2}
  def classify(%{type: :stub_implementation}), do: {:ok, :l3}
  def classify(%{type: :missing_regression_test}), do: {:ok, :l3}
  def classify(%{type: :todo_in_production}), do: {:ok, :l3}
  def classify(%{type: :hook_bypass}), do: {:ok, :l4}
  def classify(%{type: :no_verify_flag}), do: {:ok, :l4}
  def classify(%{type: :falsified_results}), do: {:ok, :l4}
  def classify(_), do: {:error, :unclassifiable}

  @spec enforce(violation()) :: {:ok, state()} | {:error, term()}
  def enforce(%{level: :l1} = violation) do
    violation
    |> log_warning()
    |> request_correction()
    |> transition(:detected, :resolved)
  end

  def enforce(%{level: :l2} = violation) do
    violation
    |> block_progress()
    |> require_correction()
    |> transition(:detected, :blocked)
  end

  def enforce(%{level: :l3} = violation) do
    violation
    |> reject_deliverable()
    |> require_restart()
    |> transition(:detected, :rejected)
  end

  def enforce(%{level: :l4} = violation) do
    violation
    |> reject_deliverable()
    |> escalate_to_supreme()
    |> transition(:detected, :under_review)
  end
end
```

### Enforcement Pipeline Integration

The Violation Protocol integrates with the platform's multi-stage enforcement pipeline. Each enforcement point is responsible for detecting specific violation categories and escalating appropriately:

```elixir
defmodule PrismaticSafety.EnforcementPipeline do
  @moduledoc """
  Multi-stage enforcement pipeline integrating violation detection
  across pre-commit, CI, and agent review stages.
  """

  @spec run_pre_commit_checks(list(String.t())) :: :pass | {:violations, list(violation())}
  def run_pre_commit_checks(staged_files) do
    violations =
      staged_files
      |> Enum.flat_map(fn file ->
        []
        |> check_compilation_warnings(file)
        |> check_credo_strict(file)
        |> check_formatting(file)
        |> check_no_todos(file)
        |> check_no_stubs(file)
      end)
      |> Enum.map(&ViolationProtocol.classify/1)
      |> Enum.filter(&match?({:ok, _}, &1))

    case violations do
      [] -> :pass
      found -> {:violations, found}
    end
  end

  @spec check_bypass_attempt(map()) :: :clean | {:l4_violation, violation()}
  def check_bypass_attempt(%{flags: flags}) do
    if "--no-verify" in flags or "--no-gpg-sign" in flags do
      {:l4_violation, %{
        type: :hook_bypass,
        description: "Attempted to bypass enforcement hooks",
        severity: :critical
      }}
    else
      :clean
    end
  end
end
```

### Audit Trail

Every violation generates an immutable audit record. The audit trail captures the full lifecycle of the violation from detection through resolution, providing traceability for compliance and post-incident analysis:

| Field | Description | Example |
|-------|-------------|---------|
| `violation_id` | Unique identifier | `VP-2026-00847` |
| `level` | Escalation level | `:l2` |
| `detected_at` | UTC timestamp | `2026-02-15T10:32:18Z` |
| `detected_by` | Detection mechanism | `:pre_commit_hook` |
| `source_file` | File triggering violation | `apps/prismatic_web/lib/router.ex` |
| `description` | Human-readable description | `Unused variable warning on line 47` |
| `resolution` | How it was resolved | `Variable removed in commit abc123` |
| `resolved_at` | Resolution timestamp | `2026-02-15T10:35:42Z` |

## Violation Resolution Workflows

Each violation level has a distinct resolution workflow, codified into the platform's process documentation and enforced by the state machine:

### L1 Resolution Flow

L1 violations follow an immediate correction workflow. The developer receives a warning message identifying the issue and its location. Correction is expected within the same work session. L1 violations are tracked for pattern detection but do not block the current commit. If an L1 violation recurs more than three times in the same file, the system automatically escalates it to L2, reflecting a persistent quality discipline issue.

### L2 Resolution Flow

L2 violations block the current action (commit, merge, or deployment). The developer must fix the specific issue, verify the fix passes all quality checks locally, and resubmit. The fix is re-validated through the full quality gate pipeline. There is no "force push past L2" capability -- the block is absolute until the underlying issue is resolved.

### L3 Resolution Flow

L3 violations require a complete restart of the deliverable. The key distinction from L2 is that L3 violations indicate fundamental incompleteness rather than isolated errors. Patching an incomplete implementation incrementally tends to produce fragmented, poorly integrated code. The restart requirement forces a fresh approach, often resulting in a cleaner design. The rejected deliverable is preserved in the audit trail for reference but is not used as a starting point.

### L4 Resolution Flow

L4 violations trigger the most extensive workflow. The deliverable is rejected, and a Supreme Review is initiated. The L5 authority agent (typically [Archer Supreme](/glossary/archer-supreme/)) investigates the violation to determine whether it was accidental (developer error) or intentional (process circumvention). The investigation examines the git history, the specific flags used, and the context of the violation. Resolution requires both fixing the immediate issue and addressing the root cause that led to the integrity violation.

## Usage in Prismatic Platform

The Violation Protocol is deeply integrated into every aspect of the Prismatic Platform's development workflow. It operates continuously across all 115 umbrella applications and the full codebase.

### Pre-Commit Hook Enforcement

The `.githooks/pre-commit` script implements multi-phase quality checking. Each phase maps to specific violation levels:

- **Phase 1**: Format checking (L1 violations)
- **Phase 2**: Compilation with `--warnings-as-errors` (L2 violations)
- **Phase 3**: Credo strict analysis (L2 violations)
- **Phase 4**: Test execution for changed files (L2 violations)
- **Phase 5**: Stub and placeholder detection (L3 violations)
- **Phase 8**: Template validation (L2 violations)
- **Phase 10**: Design consistency (L1 violations)

### Quality Gates Integration

The `mix quality.gates` task orchestrates the full violation detection suite. It runs all checks in sequence and produces a consolidated violation report. Any L2+ violation causes the gate to fail with a non-zero exit code, blocking the merge pipeline.

### Agent Enforcement

AIAD agents continuously monitor code changes and classify violations in real time. The [Quality Floor Guardian](/glossary/quality-gates/) agent maintains a baseline quality score and triggers violations when the score drops below defined thresholds. Agent-detected violations follow the same L1-L4 escalation pathway as automated tooling violations.

## Code Examples

### Handling Violation Responses

```elixir
defmodule PrismaticSafety.ViolationHandler do
  @moduledoc """
  Handles violation responses according to escalation level.
  Emits telemetry events and routes to appropriate resolution workflow.
  """

  alias PrismaticSafety.ViolationProtocol

  @spec handle(ViolationProtocol.violation()) :: :ok | {:error, term()}
  def handle(%{level: :l1} = v) do
    Logger.warning("L1 Violation: #{v.description}")
    Telemetry.emit([:violation, :l1], %{file: v.source})
    :ok
  end

  def handle(%{level: :l2} = v) do
    Logger.error("L2 Violation - BLOCKED: #{v.description}")
    Telemetry.emit([:violation, :l2], %{file: v.source})
    {:error, {:blocked, v}}
  end

  def handle(%{level: :l3} = v) do
    Logger.error("L3 Violation - REJECTED: #{v.description}")
    Telemetry.emit([:violation, :l3], %{file: v.source})
    AuditLog.record(:rejection, v)
    {:error, {:rejected, v}}
  end

  def handle(%{level: :l4} = v) do
    Logger.critical("L4 Violation - SUPREME REVIEW: #{v.description}")
    Telemetry.emit([:violation, :l4], %{file: v.source})
    AuditLog.record(:supreme_review, v)
    SupremeReview.request(v)
    {:error, {:supreme_review, v}}
  end
end
```

### Violation Metrics Collection

```elixir
defmodule PrismaticSafety.ViolationMetrics do
  @moduledoc """
  Collects and reports violation metrics for platform health monitoring.
  Tracks trends, repeat offenders, and escalation rates across time windows.
  """

  @spec summary(Date.Range.t()) :: map()
  def summary(date_range) do
    violations = AuditLog.query(date_range)

    %{
      total: length(violations),
      by_level: Enum.frequencies_by(violations, & &1.level),
      mean_resolution_time: calculate_mean_resolution(violations),
      repeat_offenders: find_repeat_sources(violations),
      escalation_rate: calculate_escalation_rate(violations)
    }
  end

  @spec trend_analysis(non_neg_integer()) :: list(map())
  def trend_analysis(weeks_back \\ 12) do
    Enum.map(1..weeks_back, fn week_offset ->
      end_date = Date.utc_today() |> Date.add(-7 * (week_offset - 1))
      start_date = Date.add(end_date, -7)
      range = Date.range(start_date, end_date)

      %{
        week: week_offset,
        range: range,
        summary: summary(range)
      }
    end)
  end
end
```

### Violation Telemetry Dashboard

```elixir
defmodule PrismaticSafety.ViolationDashboard do
  @moduledoc """
  LiveView dashboard component for real-time violation monitoring.
  Displays current violation state across all enforcement layers.
  """

  @spec current_state() :: map()
  def current_state do
    %{
      active_violations: count_active_violations(),
      by_level: %{
        l1: count_by_level(:l1),
        l2: count_by_level(:l2),
        l3: count_by_level(:l3),
        l4: count_by_level(:l4)
      },
      enforcement_layers: %{
        pre_commit: layer_status(:pre_commit),
        ci_pipeline: layer_status(:ci_pipeline),
        agent_review: layer_status(:agent_review),
        supreme_review: layer_status(:supreme_review)
      },
      last_violation: last_violation_timestamp(),
      streak_days: violation_free_streak()
    }
  end
end
```

## Comparison with Industry Approaches

The Violation Protocol's formal state machine approach contrasts sharply with how most software organizations handle quality enforcement:

| Approach | Enforcement Model | Escalation | Auditability | Bypass Resistance |
|----------|------------------|------------|--------------|-------------------|
| **Violation Protocol (Prismatic)** | Formal state machine | L1-L4 deterministic | Full audit trail | L4 triggers Supreme Review |
| **Code Review Comments** | Social convention | Ad-hoc, reviewer-dependent | Comment history only | Easily dismissed |
| **CI Pipeline Failures** | Binary pass/fail | None -- all failures equal | Build logs | Retry/re-run |
| **Jira Tickets** | Manual tracking | Priority labels (P1-P4) | Ticket history | Can be deferred indefinitely |
| **Sonar Quality Gates** | Threshold-based | Severity levels | Dashboard metrics | Configurable exceptions |
| **GitHub Required Checks** | Status check pass/fail | None | Check run logs | Admin bypass available |

The key differentiator is that the Violation Protocol combines deterministic classification, proportional response, audit traceability, and bypass resistance into a single integrated framework. Most industry approaches implement only one or two of these properties.

## Best Practices

1. **Fix violations immediately**: Never defer an L2 violation to a later commit. The enforcement pipeline blocks progress specifically to prevent quality debt accumulation.

2. **Treat L1 warnings seriously**: While L1 violations do not block, a pattern of L1 violations suggests declining code discipline that will eventually produce L2+ violations.

3. **Never attempt bypass**: L4 violations carry the most severe consequences. Using `--no-verify` does not save time; it triggers Supreme Review, which costs significantly more time and undermines trust.

4. **Write regression tests preemptively**: The mandatory [regression test](/glossary/regression-test/) protocol exists to prevent repeat violations. Every bug fix must include a test that would have caught the original issue.

5. **Understand the classification**: Before addressing a violation, understand why it was classified at its specific level. An L3 rejection means the deliverable needs fundamental rework, not incremental patching.

6. **Monitor violation trends**: Use `ViolationMetrics.summary/1` to track patterns. A rising L2 count in a specific application signals systemic issues requiring architectural attention.

7. **Use the audit trail for learning**: The violation audit trail is not just a compliance artifact. It is a learning resource. Analyzing historical violations reveals recurring patterns that can be addressed through tooling improvements, documentation, or architectural changes.

## Common Pitfalls

- **Patching L3 violations incrementally**: L3 (Incomplete Delivery) requires restart, not patching. Developers who try to add missing pieces to a rejected deliverable without restarting often produce fragmented, poorly integrated code.

- **Ignoring L1 accumulation**: L1 violations are individually harmless but collectively indicate declining quality discipline. Teams that tolerate persistent L1 violations eventually experience L2 and L3 spikes.

- **Confusing violation level with effort required**: An L2 violation (compilation warning) may take 30 seconds to fix. An L1 violation (naming inconsistency) may require renaming across 50 files. The level reflects severity to platform integrity, not effort to resolve.

- **Assuming CI catches everything**: [Pre-commit hooks](/glossary/pre-commit-hooks/) are the first line of defense. Relying solely on CI for violation detection introduces delay between violation and feedback, reducing developer productivity.

- **Treating the protocol as punitive**: The Violation Protocol is a quality assurance mechanism, not a punishment system. It exists to maintain the platform's [zero-warning](/glossary/zero-warning-policy/), zero-debt state across the entire codebase.

- **Failing to distinguish root cause from symptom**: A compilation warning (L2) might be a symptom of a deeper architectural issue. Fixing the warning without investigating the root cause leads to repeated violations in the same area.

## Integration with Session Discipline

The Violation Protocol works in concert with the platform's [Session Discipline Protocol](/glossary/session-discipline/) to ensure violations are addressed within the session where they occur. Session discipline requires continuous commits, immediate pushes, and local test verification before every commit. When a violation is detected during a session, the session discipline protocol prevents the developer from deferring the fix to a later session.

This integration creates a closed feedback loop: violations are detected immediately (through pre-commit hooks), fixed immediately (through session discipline), and verified immediately (through re-running quality gates). The loop eliminates the gap between violation detection and resolution that plagues most development workflows.

## Related Concepts

- [NM/ND Doctrine](/glossary/nm-nd/) - The governing framework that the Violation Protocol enforces
- [NO MERCY](/glossary/no-mercy/) - Zero tolerance enforcement principle triggering violations
- [NO DOUBTS](/glossary/no-doubts/) - Evidence-based decision principle preventing L4 doubt-compromised states
- [Quality Gates](/glossary/quality-gates/) - Automated enforcement pipeline detecting L2+ violations
- [Pre-Commit Hooks](/glossary/pre-commit-hooks/) - First enforcement point in the violation detection chain
- [Archer Supreme](/glossary/archer-supreme/) - L5 agent conducting Supreme Review for L4 violations
- [Regression Test](/glossary/regression-test/) - Mandatory test preventing repeat violations
- [Quality Debt](/glossary/quality-debt/) - Accumulated violations tracked as Quality Debt Points before elimination
- [Credo](/glossary/credo/) - Static analysis tool detecting L2 violations
- [Dialyzer](/glossary/dialyzer/) - Type analysis tool detecting L2 violations
- [Clean Run](/glossary/clean-run/) - The compilation and test state required by enforcement
- [Zero Warning Policy](/glossary/zero-warning-policy/) - The policy that makes compilation warnings L2 violations

## See Also

- [Architecture](/architecture/) - Platform architecture overview
- [Technologies](/technologies/) - Technology stack details
- [Apps](/apps/) - Application ecosystem governed by the Violation Protocol
- [Capabilities](/capabilities/) - Platform enforcement capabilities

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
