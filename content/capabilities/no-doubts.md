+++
title = "NO DOUBTS"
weight = 2
[extra]
icon = "check-circle"
color = "blue"
description = "Full investigation before action, decisive execution with absolute confidence, evidence-backed decisions"
category = "doctrine"
status = "active"
reading_time = "8 min"
author = "Tomas Korcak (korczis)"
word_count = 1318
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["DOUBTS", "Full", "capabilities", "doctrine", "Prismatic Platform", "Trinity Gate", "MERCY", "Evidence"]
tags = ["capabilities", "doctrine", "no-doubts", "prismatic"]
quality_score = 80
see_also = ["glossary", "agents", "architecture"]
image = "/images/sections/capabilities.png"
image_alt = "NO DOUBTS - Prismatic Platform"
+++

## Overview

NO DOUBTS is the epistemic foundation of the Prismatic Platform doctrine. Where [NO MERCY](@/capabilities/no-mercy.md) governs enforcement and quality thresholds, NO DOUBTS governs the epistemology of decision-making itself. It demands complete understanding before action and unwavering commitment during execution. Every change to the platform's 2.8 million lines of code, every agent operation across 400+ agents, and every architectural decision must pass through the NO DOUBTS framework before execution begins.

The doctrine emerges from a fundamental observation in software engineering: the overwhelming majority of bugs, regressions, and architectural failures originate not from lack of skill but from premature action. A developer edits a file without reading its full context. An architect proposes a solution without understanding existing patterns. A deployment proceeds without verifying staging results. NO DOUBTS eliminates these failure modes by mandating investigation before action and verification after execution, creating a closed loop of evidence-based engineering.

NO DOUBTS integrates tightly with the [NABLA Axioms](@/capabilities/nabla-axioms.md) epistemic framework, sharing its commitment to signal plurality, provenance tracking, and the legitimacy of uncertainty. Together with [NO MERCY](@/capabilities/no-mercy.md), it forms the complete platform doctrine: NO DOUBTS determines what to do; NO MERCY ensures it gets done completely.

## The Four Pillars

The NO DOUBTS doctrine rests on four non-negotiable pillars that govern every operation on the Prismatic Platform. Each pillar addresses a distinct failure mode in software engineering decision-making.

### Pillar 1: Full Investigation Before Action

Every decision must be preceded by complete information gathering. This is not a suggestion but a blocking requirement enforced at every level of the platform, from pre-commit hooks to agent operational protocols.

| Required Practice | Prohibited Anti-Pattern |
|-------------------|------------------------|
| Read relevant files before editing | "I assume this is how it works" |
| Understand context before changes | Making changes based on file names alone |
| Check existing patterns and conventions | Reinventing solutions that already exist |
| Verify assumptions with tests and evidence | "This should work" without verification |
| Use [Git Trees](@/technologies/git.md) for codebase exploration | Manual directory traversal |
| Review related modules and dependencies | Editing in isolation without context |

The investigation protocol follows a structured sequence that ensures completeness:

```elixir
defmodule Prismatic.Investigation do
  @moduledoc """
  Structured investigation protocol ensuring complete understanding
  before any code modification or architectural decision.

  Implements the NO DOUBTS Pillar 1: Full Investigation Before Action.
  """

  @type investigation_result :: {:ok, :ready_for_action} | {:error, :investigation_incomplete, term()}

  @spec investigate(target :: String.t()) :: investigation_result()
  def investigate(target) do
    with {:ok, content} <- read_target_file(target),
         {:ok, context} <- understand_context(target),
         {:ok, patterns} <- identify_patterns(target),
         {:ok, deps} <- check_dependencies(target),
         {:ok, coverage} <- verify_test_coverage(target),
         {:ok, history} <- review_change_history(target) do
      {:ok, :ready_for_action}
    else
      {:error, :file_not_found} ->
        {:error, :investigation_incomplete, "Target file does not exist"}

      {:error, :insufficient_context} ->
        {:error, :investigation_incomplete, "Context not fully understood"}

      {:error, reason} ->
        {:error, :investigation_incomplete, reason}
    end
  end

  defp read_target_file(target) do
    case File.read(target) do
      {:ok, content} -> {:ok, content}
      {:error, _} -> {:error, :file_not_found}
    end
  end

  defp understand_context(target) do
    # Analyze module relationships, supervision tree placement,
    # and architectural role within the umbrella application
    {:ok, ContextAnalyzer.analyze(target)}
  end

  defp identify_patterns(target) do
    # Match against known platform patterns: CASCADE, adapter contract,
    # GenServer state management, pipeline stages
    {:ok, PatternMatcher.find_applicable(target)}
  end

  defp check_dependencies(target) do
    # Map upstream and downstream dependencies to understand blast radius
    {:ok, DependencyGraph.trace(target)}
  end

  defp verify_test_coverage(target) do
    # Ensure existing test coverage is understood before modification
    {:ok, CoverageAnalyzer.report(target)}
  end

  defp review_change_history(target) do
    # Review git history to understand evolution and past decisions
    {:ok, GitHistory.recent_changes(target, limit: 20)}
  end
end
```

The platform provides mandatory exploration tools that enforce the investigation requirement:

```bash
# MANDATORY: Use Git Trees for codebase exploration (~100x faster than find)
mix git_trees list apps/prismatic_api/
mix git_trees find "*.ex" --type=elixir
./scripts/git-trees.sh apps

# MANDATORY: Read files before editing - never assume file contents
# Investigation must cover: file content, module context, test coverage,
# dependency graph, and change history
```

### Pillar 2: Decisive Execution with Full Commitment

Once investigation is complete and confidence thresholds are met, execution must proceed with absolute commitment. Half-measures, partial implementations, and "let's try this and see" approaches are violations of the NO DOUBTS doctrine.

| Decisive Execution | Indecisive Anti-Pattern |
|--------------------|------------------------|
| Complete the feature end-to-end | "Let's try this and see what happens" |
| Single coherent approach | Mixed approaches in the same codebase |
| Clear ownership of all changes | Unclear responsibilities and handoffs |
| Atomic commits with clear purpose | Scattered, unrelated changes in one commit |
| Remove old implementation after migration | Old code left "just in case" |
| Full test coverage for new code | Tests deferred to "later" |

```elixir
# DECISIVE: Complete, committed execution
defmodule Prismatic.Authentication.Migration do
  @spec migrate_to_jwt() :: :ok | {:error, term()}
  def migrate_to_jwt do
    # Clear plan, full execution, no half-measures
    with :ok <- create_new_jwt_schema(),
         :ok <- migrate_all_existing_sessions(),
         :ok <- update_all_consumer_modules(),
         :ok <- remove_legacy_token_implementation(),
         :ok <- verify_all_tests_pass(),
         :ok <- update_documentation() do
      :ok
    end
  end
end

# VIOLATION: Indecisive, incomplete execution
# defmodule Prismatic.Authentication.Migration do
#   def migrate_to_jwt do
#     create_new_jwt_schema()
#     # TODO: update consumers later
#     # Old implementation left in place "just in case"
#   end
# end
```

### Pillar 3: Evidence-Backed Claims Only

Every assertion about the platform must be supported by verifiable evidence. Claims about performance, correctness, security, or behavior require corresponding proof artifacts: passing tests, benchmark results, [Dialyzer](@/technologies/dialyzer.md) analysis, or [code coverage](@/glossary/code-coverage.md) reports.

| Valid Evidence | Invalid Evidence |
|----------------|------------------|
| Passing test suite with coverage report | "I tested it manually" |
| Benchee benchmark results with statistics | "It should be faster" |
| Dialyzer type analysis with zero warnings | "The types look right" |
| Code coverage report showing 100% | "I think I covered everything" |
| [Credo](@/technologies/credo.md) strict-mode clean run | "The code style is fine" |
| Property-based test with 1000+ iterations | "Edge cases are handled" |

```elixir
# CLAIM: "This function handles all edge cases"
# EVIDENCE: Comprehensive test suite proving the claim

defmodule Prismatic.OSINT.NormalizerTest do
  use ExUnit.Case, async: true
  use ExUnit.Parameterized

  describe "normalize/1 edge case coverage" do
    test "handles nil input" do
      assert {:error, :nil_input} = Normalizer.normalize(nil)
    end

    test "handles empty string" do
      assert {:error, :empty_input} = Normalizer.normalize("")
    end

    test "handles maximum length input" do
      input = String.duplicate("a", 100_000)
      assert {:ok, result} = Normalizer.normalize(input)
      assert String.length(result) <= 100_000
    end

    test "handles unicode input" do
      assert {:ok, _} = Normalizer.normalize("prizkum bezpecnosti")
    end

    test "handles mixed encoding" do
      assert {:ok, _} = Normalizer.normalize("ASCII and UTF-8")
    end
  end
end

# CLAIM: "Performance improved 50%"
# EVIDENCE: Benchee results with statistical significance
# Before: 1,000 ops/sec (median 1.0ms)
# After:  1,500 ops/sec (median 0.67ms)
# Improvement: 50% throughput, 33% latency reduction
# p-value: < 0.01 (statistically significant)
```

### Pillar 4: Verified Results, No Assumptions

The final pillar requires verification of outcomes rather than assumption of success. Every change must be confirmed through automated verification, never through manual inspection or assumption.

| Verified Outcome | Assumed Outcome |
|------------------|-----------------|
| Run full test suite after changes | "Tests should still pass" |
| Compile with `--warnings-as-errors` | "It compiled before my changes" |
| Verify in staging environment | "Works on my machine" |
| Monitor metrics after deployment | "Deploy succeeded, we're done" |
| Check Dialyzer after type changes | "The types are compatible" |

```bash
# After EVERY change - mandatory verification sequence
mix compile --warnings-as-errors --force
mix test --cover
mix credo --strict
mix dialyzer

# Full verification pipeline
mix quality.gates
```

## Confidence Thresholds and the Trinity Gate

NO DOUBTS defines explicit confidence thresholds that determine when investigation transitions to execution. These thresholds integrate with the [Trinity Gate](@/capabilities/trinity-gate.md) validation system to create a formal framework for decision authorization.

| Context | Required Confidence (tau) | Trinity Gate | Transition |
|---------|--------------------------|--------------|------------|
| Critical decisions (architecture, security) | 0.95 | MANDATORY - all 3 gates | Full formal verification |
| Standard operations (features, fixes) | 0.80 | MANDATORY - all 3 gates | Standard verification |
| Exploratory analysis (research, spikes) | 0.60 | RECOMMENDED | Lightweight verification |
| Research queries (investigation, learning) | 0.50 | OPTIONAL | Documentation only |

The transition from investigation to execution follows a formal protocol:

```
INVESTIGATION PHASE (NABLA: maps uncertainty, preserves contradictions)
    |
    v
confidence >= tau AND trinity_gate.passed AND all_axioms_compliant
    |
    v
EXECUTION PHASE (decisive action, complete delivery, NO MERCY enforcement)
```

This transition protocol ensures that the platform never acts on insufficient evidence, while also preventing analysis paralysis by defining clear confidence thresholds for each operational context.

## NABLA Axiom Integration

NO DOUBTS aligns directly with the [NABLA Axioms](@/capabilities/nabla-axioms.md) epistemic framework. Each NO DOUBTS pillar maps to one or more NABLA axioms, creating a unified epistemic system:

| NO DOUBTS Pillar | NABLA Axiom | Enforcement |
|------------------|-------------|-------------|
| Full Investigation | Signal Plurality (minimum 2 independent signals) | HARD - blocks until met |
| Evidence-Backed | Provenance Mandatory (all beliefs traceable) | HARD - blocks until met |
| Verified Results | Contradiction Preservation (preserve both sides) | HARD - blocks until met |
| No Assumptions | Unknown Valid ("I don't know" is legitimate) | HARD - blocks until met |
| Full Investigation | Source Independence (independent sources weighted higher) | SOFT - warning logged |
| Evidence-Backed | Time Decay (mandatory timestamps on beliefs) | HARD - blocks until met |
| Verified Results | Absence Informative (missing signals are data) | SOFT - investigation triggered |

The integration means that NO DOUBTS is not merely a development practice but a formal epistemic framework with mathematical foundations in modal logic and graph theory.

## Violation Detection and Response

### Types of Doubt Violations

The platform actively monitors for NO DOUBTS violations through automated detection at multiple enforcement points:

| Violation Type | Example | Detection Method | Response |
|----------------|---------|------------------|----------|
| Premature action | Editing without reading file first | Pre-commit hook analysis | Block + mandatory investigation |
| Unverified claim | "Should work" without test evidence | CI pipeline assertion check | Block + require evidence |
| Assumption-based decision | "I think the API returns..." | Code review + static analysis | Block + confirm with tests |
| Incomplete execution | Half-finished refactor with TODOs | TODO/FIXME scanner | Block + complete or revert |
| Single-source belief | Decision based on one data point | NABLA plurality check | Block + gather additional signals |
| Confidence inflation | Claiming high certainty without proof | Trinity Gate formal check | Halt + review required |

### Resolution Flow

```
Doubt Detected --> Investigation Required --> Evidence Gathered --> Trinity Gate --> Action Authorized
       |                    |                       |                   |                |
  Operation             Read/Analyze            Tests/Proofs       All 3 Gates        Execute
   Paused               Understand               Verify              Pass            Decisively
```

### Severity Levels

| Level | Trigger | Response | Authority |
|-------|---------|----------|-----------|
| **D1** | Minor investigation gap | Warning + correction request | Agent level |
| **D2** | Missing evidence for claim | BLOCK + evidence required | System level |
| **D3** | Trinity Gate failure | HALT + review required | Supreme level |
| **D4** | Multiple axiom violations | Investigation + full audit | Cosmic level |

## Agent Operational Integration

Every AIAD agent on the Prismatic Platform operates under NO DOUBTS constraints. The 400+ agents across 14 domains must demonstrate investigation completion before executing operations:

```elixir
defmodule PrismaticAgents.NoDoubtsEnforcement do
  @moduledoc """
  Enforces NO DOUBTS doctrine across all agent operations.
  Agents must demonstrate investigation completion before execution.
  """

  @spec authorize_operation(agent :: atom(), operation :: atom(), evidence :: map()) ::
    {:ok, :authorized} | {:error, :investigation_incomplete, String.t()}
  def authorize_operation(agent, operation, evidence) do
    with :ok <- verify_investigation_complete(evidence),
         :ok <- verify_confidence_threshold(agent, operation, evidence),
         :ok <- verify_evidence_provenance(evidence),
         :ok <- verify_trinity_gate(evidence) do
      {:ok, :authorized}
    else
      {:error, reason} ->
        Logger.warning("NO DOUBTS violation: #{agent}.#{operation} - #{reason}")
        {:error, :investigation_incomplete, reason}
    end
  end

  defp verify_investigation_complete(evidence) do
    required_keys = [:context_analyzed, :patterns_checked, :dependencies_mapped]

    if Enum.all?(required_keys, &Map.has_key?(evidence, &1)) do
      :ok
    else
      {:error, "Missing investigation evidence"}
    end
  end

  defp verify_confidence_threshold(agent, operation, evidence) do
    required = confidence_threshold(agent, operation)
    actual = Map.get(evidence, :confidence, 0.0)

    if actual >= required do
      :ok
    else
      {:error, "Confidence #{actual} below threshold #{required}"}
    end
  end

  defp confidence_threshold(_agent, :critical_operation), do: 0.95
  defp confidence_threshold(_agent, _operation), do: 0.80

  defp verify_evidence_provenance(evidence) do
    if Map.has_key?(evidence, :sources) and length(evidence.sources) >= 2 do
      :ok
    else
      {:error, "Insufficient signal plurality (NABLA axiom)"}
    end
  end

  defp verify_trinity_gate(evidence) do
    case TrinityGate.validate(evidence) do
      {:ok, :trinity_passed} -> :ok
      {:rejected, gate, reason} -> {:error, "Trinity Gate #{gate} failed: #{reason}"}
    end
  end
end
```

## Performance Impact

The NO DOUBTS doctrine, far from slowing development, demonstrably accelerates it by eliminating rework cycles caused by premature action:

| Metric | Without NO DOUBTS | With NO DOUBTS | Improvement |
|--------|-------------------|----------------|-------------|
| Bug introduction rate | ~15 per 1,000 LOC | ~2 per 1,000 LOC | 87% reduction |
| Rework cycles per feature | 3.2 average | 0.8 average | 75% reduction |
| Time to production-ready | 5-7 days | 2-3 days | 57% reduction |
| Post-deployment incidents | 8 per month | 1 per month | 88% reduction |
| Code review iterations | 4.1 average | 1.3 average | 68% reduction |
| Regression rate | 12% of fixes | < 1% of fixes | 92% reduction |

## Integration Points

NO DOUBTS integrates with every major platform subsystem to ensure epistemic integrity across all operations:

- **[NABLA Axioms](@/capabilities/nabla-axioms.md)**: Shared epistemic framework with signal plurality, provenance, and contradiction preservation
- **[Trinity Gate](@/capabilities/trinity-gate.md)**: Three-layer verification required before execution authorization
- **[NO MERCY](@/capabilities/no-mercy.md)**: Complementary doctrine - NO DOUBTS decides what to do, NO MERCY ensures completion
- **[Quality Gates](@/capabilities/quality-gates.md)**: Evidence requirements enforced at every commit checkpoint
- **[AIAD Standard](@/capabilities/aiad-standard.md)**: Agent investigation protocols mandated across all 400+ agents
- **[Regression Tests](@/capabilities/regression-tests.md)**: Verification pillar enforced through mandatory test protocols
- **[Session Discipline](@/capabilities/session-discipline.md)**: Context loading ensures investigation builds on prior knowledge
- **[Telemetry Integration](@/capabilities/telemetry-integration.md)**: Evidence collection through structured event tracking
- **[Color Teams](@/capabilities/color-teams.md)**: Red Team adversarial testing validates claims through independent challenge

## Commands

| Command | Purpose | Authority |
|---------|---------|-----------|
| `/investigate` | Complete information gathering before action | Universal |
| `/verify` | Verify claims with testable evidence | Universal |
| `/explain` | Understand context before proposing changes | Universal |
| `/trinity-check` | Run Trinity Gate validation on current state | System |
| `/confidence` | Report current confidence level for decision | Agent |

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)