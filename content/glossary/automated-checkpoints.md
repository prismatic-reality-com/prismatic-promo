+++
title = "Automated Checkpoints"
weight = 50
[extra]
tags = ["glossary", "quality", "automation", "verification", "ci-cd", "pre-commit", "quality-gates", "devops"]
description = "Programmatic verification points inserted into workflows that validate state, quality, or compliance before allowing progression -- ensuring every transition in code, data, or deployment meets predefined correctness criteria"
category = "quality-assurance"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate-to-advanced"
domain_category = "Software Quality Engineering"
related_concepts = ["quality-gate", "pre-commit-hooks", "continuous-integration", "verification-gate", "clean-run", "regression-testing", "static-analysis"]
implementation_status = "production"
authority_level = "platform-wide"
difficulty_rating = 6
prerequisites = ["ci-cd", "quality-gate", "testing", "static-analysis"]
learning_path = ["quality-gate", "pre-commit-hooks", "automated-checkpoints", "continuous-integration", "clean-run"]
interactive_demos = ["/labs/glossary/automated-checkpoints"]
code_examples = ["Elixir pre-commit checkpoint", "Quality gate GenServer", "Pipeline checkpoint validation"]
external_resources = ["https://martinfowler.com/articles/continuousIntegration.html", "https://hexdocs.pm/mix/Mix.Task.html"]
version_introduced = "Generation 4"
stability_level = "stable"
testing_scenarios = ["checkpoint pass/fail", "phase ordering", "timeout recovery", "partial failure rollback"]
keywords = ["checkpoint", "verification", "gate", "pre-commit", "quality", "pipeline", "validation", "guard", "enforcement"]
related_terms = ["quality-gate", "pre-commit-hooks", "continuous-integration", "verification-gate", "clean-run", "regression-testing", "static-analysis", "credo", "dialyzer", "trinity-gate"]
word_count = 1664
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Automated Checkpoints - Prismatic Platform"
+++

## Definition

Automated checkpoints are programmatic verification points inserted into software development workflows that validate state, quality, or compliance before allowing progression to the next phase. Unlike manual code reviews or ad-hoc testing, automated checkpoints execute deterministically -- the same input conditions always produce the same pass/fail outcome. They function as non-negotiable gates in a pipeline, ensuring that code, data, or deployment artifacts meet predefined correctness criteria before any transition is permitted.

In formal terms, an automated checkpoint is a function `C: State -> {pass, fail(reasons)}` that evaluates a snapshot of system state against a set of invariants. When all invariants hold, progression is authorized. When any invariant fails, progression is blocked and diagnostic information is emitted to guide remediation.

## Overview

The concept of automated checkpoints emerged from the convergence of continuous integration practices, formal verification methods, and the DevOps movement's emphasis on fast, reliable feedback loops. In traditional software development, quality assurance was a phase -- something that happened after code was written. Automated checkpoints invert this model: quality assurance happens continuously, at every meaningful transition point in the development lifecycle.

The value proposition is straightforward. Human reviewers miss things. Manual processes are inconsistent. Automated checkpoints are neither. They execute the same checks with the same rigor every time, regardless of deadline pressure, fatigue, or cognitive load. The cost of a defect rises exponentially the later it is discovered -- a bug caught at commit time costs minutes to fix; the same bug found in production costs hours, reputation, and potentially revenue.

Modern platforms implement checkpoints at multiple granularities: pre-commit (before code enters the repository), pre-merge (before code joins the main branch), pre-deploy (before code reaches production), and runtime (before critical operations execute). Each layer catches a different class of defect, and together they form a defense-in-depth strategy for software quality.

## Technical Details

### Checkpoint Architecture

An automated checkpoint system consists of four fundamental components:

| Component | Responsibility | Example |
|-----------|---------------|---------|
| **Trigger** | Determines when the checkpoint fires | Git hook, CI event, cron schedule |
| **Evaluator** | Executes the actual checks against current state | Compiler, linter, test runner, custom validator |
| **Gate Logic** | Decides pass/fail based on evaluator results | All-pass required, threshold-based, weighted scoring |
| **Reporter** | Communicates results and remediation guidance | Console output, CI annotations, Slack notifications |

### Checkpoint Classification

Checkpoints can be classified along several dimensions:

**By Timing:**
- **Synchronous checkpoints** block the triggering operation until evaluation completes. Pre-commit hooks are synchronous -- the commit does not proceed until all checks pass.
- **Asynchronous checkpoints** run in parallel with the workflow and report results after completion. CI pipeline checks are often asynchronous -- the code is already pushed, but merge is blocked until checks finish.

**By Scope:**
- **Local checkpoints** run on the developer's machine (pre-commit hooks, editor linters).
- **Remote checkpoints** run on shared infrastructure (CI servers, deployment pipelines).
- **Distributed checkpoints** require consensus across multiple systems (multi-region deployment gates).

**By Enforcement:**
- **Hard gates** block progression entirely on failure. No bypass is possible without fixing the violation.
- **Soft gates** emit warnings but allow progression. Used for advisory checks or gradual rollouts of new standards.
- **Escalation gates** allow bypass only with explicit authorization from a higher authority level.

### Checkpoint Composition

Complex checkpoint systems compose simpler checks into phases, where each phase groups related evaluations:

```elixir
defmodule Prismatic.Checkpoint.Pipeline do
  @moduledoc """
  Composes multiple checkpoint phases into an ordered pipeline.
  Each phase must pass before the next phase begins execution.
  Phases within a group may execute concurrently.
  """

  @type phase :: {atom(), [check_fn()]}
  @type check_fn :: (state() -> {:ok, state()} | {:error, reason()})
  @type state :: map()
  @type reason :: String.t()

  @spec run([phase()], state()) :: {:ok, state()} | {:error, {atom(), [reason()]}}
  def run(phases, initial_state) do
    Enum.reduce_while(phases, {:ok, initial_state}, fn {phase_name, checks}, {:ok, state} ->
      case execute_phase(phase_name, checks, state) do
        {:ok, new_state} -> {:cont, {:ok, new_state}}
        {:error, reasons} -> {:halt, {:error, {phase_name, reasons}}}
      end
    end)
  end

  @spec execute_phase(atom(), [check_fn()], state()) :: {:ok, state()} | {:error, [reason()]}
  defp execute_phase(phase_name, checks, state) do
    results =
      checks
      |> Task.async_stream(fn check -> check.(state) end, timeout: 30_000)
      |> Enum.map(fn {:ok, result} -> result end)

    errors = for {:error, reason} <- results, do: reason

    case errors do
      [] ->
        :telemetry.execute(
          [:checkpoint, :phase, :passed],
          %{duration: System.monotonic_time()},
          %{phase: phase_name}
        )
        {:ok, state}

      _ ->
        :telemetry.execute(
          [:checkpoint, :phase, :failed],
          %{error_count: length(errors)},
          %{phase: phase_name, errors: errors}
        )
        {:error, errors}
    end
  end
end
```

### Checkpoint State Machine

A checkpoint transitions through well-defined states:

```
PENDING -> EVALUATING -> PASSED
                      -> FAILED -> REMEDIATION -> PENDING (retry)
                      -> TIMEOUT -> ESCALATION
```

Each transition is observable via telemetry, enabling monitoring and alerting on checkpoint health itself -- not just the code being checked.

## Implementation in Prismatic Platform

### 11-Phase Pre-Commit Checkpoint System

The Prismatic Platform implements one of the most comprehensive pre-commit checkpoint systems in any Elixir codebase. The `.githooks/pre-commit` script executes 11 ordered phases, each targeting a distinct class of defect:

| Phase | Name | What It Checks |
|-------|------|----------------|
| 1 | **Compilation** | `mix compile --warnings-as-errors --force` |
| 2 | **Dialyzer** | Static type analysis via `mix dialyzer` |
| 3 | **Credo** | Code style and consistency via `mix credo --strict` |
| 4 | **Tests** | Full test suite via `mix test` |
| 5 | **Quality Gates** | `mix quality.gates` -- 13 quality domains |
| 6 | **Forbidden Patterns** | Scans for mocks, stubs, placeholders, hardcoded values |
| 7 | **Typespec Coverage** | Ensures all public functions have `@spec` |
| 8 | **Template Validation** | Validates Zola/HEEx templates |
| 9 | **Security Scan** | Checks for secrets, credentials, API keys |
| 10 | **Design Consistency** | Flowbite sidebar enforcement, responsive patterns |
| 11 | **Regression Prevention** | QDP scan, warning count validation |

Each phase is a hard gate -- failure in any phase blocks the commit entirely. There is no `--no-verify` bypass permitted under platform policy.

### Quality Gate GenServer

The platform's quality gate system is implemented as an OTP process that maintains checkpoint state:

```elixir
defmodule Prismatic.Quality.GateKeeper do
  @moduledoc """
  OTP process managing quality gate evaluation and enforcement.
  Maintains a registry of active gates and their current status.
  Integrates with telemetry for observability.
  """

  use GenServer

  @type gate :: %{
    name: atom(),
    evaluator: (map() -> {:ok, map()} | {:error, String.t()}),
    enforcement: :hard | :soft | :escalation,
    timeout: pos_integer()
  }

  @type gate_result :: %{
    gate: atom(),
    status: :passed | :failed | :timeout,
    duration_ms: non_neg_integer(),
    details: map()
  }

  @spec evaluate_all([gate()], map()) :: {:ok, [gate_result()]} | {:error, [gate_result()]}
  def evaluate_all(gates, context) do
    GenServer.call(__MODULE__, {:evaluate_all, gates, context}, :infinity)
  end

  @impl GenServer
  def init(_opts) do
    {:ok, %{results: [], active_evaluations: 0}}
  end

  @impl GenServer
  def handle_call({:evaluate_all, gates, context}, _from, state) do
    results =
      gates
      |> Enum.map(fn gate -> evaluate_gate(gate, context) end)

    hard_failures =
      results
      |> Enum.filter(fn r -> r.status == :failed and r.enforcement == :hard end)

    response =
      case hard_failures do
        [] -> {:ok, results}
        _ -> {:error, results}
      end

    {:reply, response, %{state | results: results}}
  end

  @spec evaluate_gate(gate(), map()) :: gate_result()
  defp evaluate_gate(gate, context) do
    start_time = System.monotonic_time(:millisecond)

    result =
      try do
        case gate.evaluator.(context) do
          {:ok, details} -> %{status: :passed, details: details}
          {:error, reason} -> %{status: :failed, details: %{reason: reason}}
        end
      catch
        :exit, {:timeout, _} -> %{status: :timeout, details: %{timeout_ms: gate.timeout}}
      end

    duration = System.monotonic_time(:millisecond) - start_time

    Map.merge(result, %{
      gate: gate.name,
      enforcement: gate.enforcement,
      duration_ms: duration
    })
  end
end
```

### Trinity Gate Integration

The highest-level checkpoint in the Prismatic Platform is the [Trinity Gate](@/glossary/trinity-gate.md), which requires three independent verification passes before any claim or decision is accepted:

1. **Structural Consistency** -- the belief graph forms a valid directed acyclic graph
2. **Logical Consistency** -- propositions follow established logical rules
3. **Formal Necessity** -- claims are provable in formal verification systems

This three-layer checkpoint ensures that no single verification methodology's blind spots can cause a false positive.

### Session Lifecycle Checkpoints

Every Claude Code session on the Prismatic Platform triggers checkpoints at defined lifecycle points:

- **Session Start**: `mix autoheal.baseline` establishes the quality floor
- **Pre-Command**: `mix quality.gates.check --fast` validates platform health
- **Post-Command**: `mix autoevolve.scan --quick` checks for regression
- **Session End**: `mix autoheal.cycle` and `mix autoevolve.mega` run full evaluation

## Comparison with Alternatives

| Approach | Determinism | Coverage | Developer Friction | Feedback Speed |
|----------|-------------|----------|--------------------|----------------|
| **Manual code review** | Low (subjective) | Variable | Low | Slow (hours/days) |
| **Ad-hoc testing** | Medium | Partial | Low | Medium |
| **CI-only checks** | High | Broad | Low | Medium (minutes) |
| **Pre-commit checkpoints** | High | Focused | Medium | Fast (seconds) |
| **Prismatic 11-phase system** | Absolute | Complete | High (by design) | Fast (30-90s) |

The Prismatic approach deliberately accepts higher developer friction in exchange for absolute quality assurance. The philosophy is that the friction of fixing a violation at commit time is always less than the friction of debugging a production incident.

**Compared to GitHub Actions / GitLab CI alone**: CI checks run after code is pushed, meaning broken code can exist in the repository temporarily. Pre-commit checkpoints prevent broken code from ever entering the repository.

**Compared to IDE-only linting**: IDE checks are advisory and easily ignored. Automated checkpoints are enforcement mechanisms that cannot be bypassed without deliberate policy violation.

## Best Practices

1. **Order phases by speed**: Fast checks (compilation, linting) should run before slow checks (full test suite, dialyzer). This provides rapid feedback for common errors.

2. **Make checkpoints idempotent**: Running the same checkpoint twice with the same input must produce the same result. Non-deterministic checkpoints erode developer trust.

3. **Provide actionable error messages**: A checkpoint that says "failed" without explaining why or how to fix it is worse than no checkpoint at all. Include the specific violation, file, line number, and remediation guidance.

4. **Version your checkpoint configuration**: Checkpoint rules should be tracked in version control alongside the code they protect. This ensures that checkpoint evolution is auditable.

5. **Monitor checkpoint performance**: Track how long each phase takes. Slow checkpoints reduce developer velocity and encourage bypass attempts.

6. **Implement circuit breakers**: If a checkpoint depends on an external service (API, database), implement timeout and fallback behavior to prevent infrastructure issues from blocking all development.

7. **Test your checkpoints**: Checkpoints are code. They can have bugs. Write tests that verify checkpoints correctly identify known-good and known-bad inputs.

## Common Pitfalls

1. **Over-gating**: Adding too many checkpoints or making them too slow drives developers to find workarounds. Every checkpoint must justify its existence through the defects it catches.

2. **False positives**: A checkpoint that frequently fails for reasons unrelated to actual code quality trains developers to ignore checkpoint results. False positive rate must be kept near zero.

3. **Missing the forest for the trees**: Having 50 style checks but no integration tests means the checkpoints catch cosmetic issues while missing functional defects. Balance checkpoint types across the defect spectrum.

4. **Inconsistent enforcement**: If checkpoints can be bypassed in "emergencies," they will be bypassed routinely. Either enforce consistently or remove the checkpoint.

5. **Stale checkpoints**: Checkpoints that check for patterns no longer relevant waste developer time and erode confidence in the system. Regularly audit and prune checkpoint rules.

6. **No observability**: Without metrics on checkpoint execution (pass rate, failure reasons, duration), you cannot optimize the system or identify emerging patterns.

7. **Coupling to specific tools**: Checkpoints should validate outcomes, not implementations. Check "are there type violations?" not "does dialyzer exit with code 0 on this specific version."

## Use Cases

### Pre-Commit Quality Enforcement
Every developer commit passes through the 11-phase checkpoint pipeline. This catches compilation warnings, type errors, style violations, test failures, and forbidden patterns before code enters the repository. The result: the main branch is always in a deployable state.

### Deployment Gate Control
Before any deployment to production, checkpoints verify that all tests pass, performance benchmarks meet thresholds, security scans are clean, and the deployment manifest is valid. This prevents broken releases from reaching users.

### Data Pipeline Validation
ETL pipelines use checkpoints to validate data quality at each transformation stage. Schema conformance, null rate thresholds, referential integrity, and business rule compliance are checked before data moves to the next stage.

### Agent Authority Verification
In the Prismatic Platform's multi-agent system, checkpoints verify that an agent's requested action falls within its authority level before execution. An L2 agent cannot perform L3 operations, enforced by automated authority checkpoints.

### Compliance Auditing
Regulatory frameworks (NIS2, GDPR, ZKB) require evidence of control effectiveness. Automated checkpoints produce audit trails that demonstrate continuous compliance, replacing periodic manual audits with continuous automated verification.

## Related Concepts

- [Quality Gate](@/glossary/quality-gate.md) -- the decision-point pattern that checkpoints implement
- [Pre-Commit Hooks](@/glossary/pre-commit-hooks.md) -- the Git mechanism used to trigger local checkpoints
- [Continuous Integration](@/glossary/continuous-integration.md) -- the broader practice within which checkpoints operate
- [Verification Gate](@/glossary/verification-gate.md) -- formal verification checkpoints in epistemic pipelines
- [Clean Run](@/glossary/clean-run.md) -- the state achieved when all checkpoints pass with zero warnings
- [Trinity Gate](@/glossary/trinity-gate.md) -- the three-layer epistemic checkpoint in Prismatic
- [Static Analysis](@/glossary/static-analysis.md) -- automated code examination that powers many checkpoints
- [Credo](@/glossary/credo.md) -- the Elixir static analysis tool used in Phase 3
- [Dialyzer](@/glossary/dialyzer.md) -- the BEAM type checker used in Phase 2
- [Regression Testing](@/glossary/regression-testing.md) -- tests that prevent previously fixed bugs from recurring
- [Quality Gates](@/glossary/quality-gates.md) -- the platform's 13-domain quality enforcement system
- [Telemetry](@/glossary/telemetry.md) -- the observability system that monitors checkpoint execution

## See Also

- [Continuous Integration](@/glossary/continuous-integration.md) for the broader CI/CD context
- [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) for autonomous quality monitoring
- [Quality DNA](@/glossary/quality-dna.md) for cross-session quality continuity
- [Autoevolve](@/glossary/autoevolve.md) for automated platform evolution checkpoints
- [Session Discipline](@/glossary/session-discipline.md) for mandatory session checkpoint protocols

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
