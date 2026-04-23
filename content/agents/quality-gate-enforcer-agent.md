+++
title = "Quality Gate Enforcer Agent"
weight = 329
[extra]
domain = "general"
level = "L3"
description = "Zero-warning compilation enforcement achieving 100/100 quality score Success Evidence: 16"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "seadf", "telemetry"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 1800
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Quality", "Gate", "Enforcer", "Agent", "Zero-warning", "100100", "Success", "Evidence", "agents", "Prismatic Platform"]
tags = ["agents", "agent", "quality-gate-enforcer-agent", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "Quality Gate Enforcer Agent - Prismatic Platform"
+++

## Overview

The Quality Gate Enforcer Agent operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform, responsible for zero-warning compilation enforcement and the execution of individual [quality gate](@/glossary/quality-gates.md) checks that collectively achieve the platform's 100/100 quality score. While the [quality-enforcement-commander](@/agents/quality-enforcement-commander.md) coordinates the overall enforcement strategy, this agent executes the specific gate checks that determine whether code transitions are permitted.

Quality gates are the enforcement mechanism through which the platform's quality standards become operationally binding. Without gates, quality standards remain aspirational guidelines. With gates, quality standards become hard requirements that code must satisfy before it can advance through the development pipeline. This agent implements and maintains those gates, ensuring they are accurate, performant, and resistant to false positives that would impede legitimate development velocity.

Built on the [AIAD](@/glossary/aiad.md) standard, this agent enforces the [NO MERCY](@/glossary/no-mercy.md) doctrine through gate execution: code that fails a quality gate is blocked unconditionally. The [NO DOUBTS](@/glossary/no-doubts.md) principle applies to gate results -- every pass or fail decision is backed by specific evidence, enabling developers to understand exactly what must be corrected and why.

## Gate Architecture

The quality gate system implements a multi-stage verification pipeline where each gate performs a specific quality assessment.

**Compilation gates** verify zero-warning compilation across the entire umbrella application. The `--warnings-as-errors` flag is mandatory, and the `--force` flag ensures that cached compilation results do not mask newly introduced warnings. Compilation gates catch type mismatches, unused variables, unreachable code, deprecated function usage, and module naming conflicts.

**Static analysis gates** execute [Dialyzer](@/glossary/dialyzer.md) for success typing verification and [Credo](@/glossary/credo.md) in strict mode for code style and pattern compliance. Dialyzer gates verify that function calls match declared typespecs, that pattern matches are exhaustive, and that return types are consistent. Credo gates enforce code complexity limits, naming conventions, documentation requirements, and anti-pattern detection.

**Pattern verification gates** detect specific anti-patterns that the platform has identified as recurring quality risks. These include unsafe map access (using `map.key` instead of `Map.get/2` or `Map.fetch/2`), length-greater-than-zero comparisons (which should use `!= []`), Process.sleep usage in production code, and missing `@impl` annotations on behaviour callbacks.

**Test gates** verify that all tests pass with zero failures and that test coverage meets the required threshold. The test gate also verifies that mandatory regression tests accompany bug fixes, enforcing the platform's regression prevention protocol.

## Key Capabilities

- **Zero-warning compilation enforcement** -- Executes `mix compile --warnings-as-errors --force` across the entire umbrella, blocking any code with compilation warnings from entering the repository
- **Static type verification** -- Runs [Dialyzer](@/glossary/dialyzer.md) analysis to verify type consistency across module boundaries, catching type mismatches that compilation alone cannot detect
- **Code pattern analysis** -- Executes [Credo](@/glossary/credo.md) strict mode analysis for code style, complexity, naming, and anti-pattern checks with zero-violation requirement
- **Anti-pattern detection** -- Identifies and blocks specific known anti-patterns including unsafe map access, Process.sleep, and length comparisons through custom pattern analyzers
- **Test verification** -- Executes the full test suite and verifies coverage thresholds, blocking code that introduces test failures or coverage regression
- **Gate performance optimization** -- Maintains gate execution performance to minimize developer wait time while ensuring thorough verification
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with automatic gate execution triggered by code transition events
- **[Telemetry integration](@/capabilities/telemetry-integration.md)** for gate execution timing, failure rate tracking, and false positive monitoring

## Gate Execution Pipeline

```elixir
defmodule PrismaticSafety.GateEnforcer do
  @moduledoc """
  Executes individual quality gate checks with evidence-based
  pass/fail decisions and detailed failure diagnostics.
  """

  @type gate_result :: %{
    gate: atom(),
    status: :pass | :fail,
    duration_ms: non_neg_integer(),
    violations: [violation()],
    evidence: String.t()
  }

  @type violation :: %{
    file: String.t(),
    line: non_neg_integer(),
    message: String.t(),
    severity: :error | :warning | :info
  }

  @gates [
    {:compilation, &run_compilation_gate/0},
    {:dialyzer, &run_dialyzer_gate/0},
    {:credo, &run_credo_gate/0},
    {:pattern_checks, &run_pattern_gate/0},
    {:test_suite, &run_test_gate/0}
  ]

  @spec run_all_gates() :: {:ok, [gate_result()]} | {:error, [gate_result()]}
  def run_all_gates do
    results = Enum.map(@gates, fn {name, gate_fn} ->
      {duration, result} = :timer.tc(gate_fn)
      %{gate: name, duration_ms: div(duration, 1000)} |> Map.merge(result)
    end)

    case Enum.any?(results, &(&1.status == :fail)) do
      true -> {:error, results}
      false -> {:ok, results}
    end
  end

  defp run_compilation_gate do
    case System.cmd("mix", ["compile", "--warnings-as-errors", "--force"],
           stderr_to_stdout: true) do
      {_output, 0} -> %{status: :pass, violations: [], evidence: "Zero warnings"}
      {output, _} -> %{status: :fail, violations: parse_warnings(output),
                        evidence: "Compilation warnings detected"}
    end
  end
end
```

## Gate Performance Metrics

| Gate | Typical Duration | Blocking | False Positive Rate |
|------|-----------------|----------|-------------------|
| **Compilation** | 15-45 seconds | Yes | <0.1% |
| **Dialyzer** | 30-120 seconds | Yes | <1% |
| **Credo Strict** | 5-15 seconds | Yes | <0.5% |
| **Pattern Checks** | 2-5 seconds | Yes | <0.1% |
| **Test Suite** | 60-300 seconds | Yes | N/A (deterministic) |
| **Total Pipeline** | 2-8 minutes | Yes | Composite |

## Gate Failure Response Protocol

| Failure Type | Response | Developer Action |
|-------------|----------|-----------------|
| **Compilation Warning** | Block commit, show warning location | Fix warning at source |
| **Dialyzer Type Error** | Block commit, show type mismatch | Add or correct @spec |
| **Credo Violation** | Block commit, show rule and suggestion | Refactor per Credo guidance |
| **Pattern Anti-Pattern** | Block commit, show replacement pattern | Apply safe pattern |
| **Test Failure** | Block commit, show failing test | Fix implementation or test |
| **Coverage Regression** | Block commit, show coverage delta | Add missing tests |

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination with authority to execute quality gates, block code transitions, and report gate results to the enforcement commander.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/quality-gate run` | Execute all quality gates and report results | L3+ |
| `/quality-gate status` | Display gate health, recent results, and performance metrics | L3+ |
| `/quality-gate diagnose` | Analyze a specific gate failure with detailed diagnostics | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [quality-enforcement-commander](@/agents/quality-enforcement-commander.md) | Receives gate execution directives and reports results |
| [quality-bypass-enforcer-agent](@/agents/quality-bypass-enforcer-agent.md) | Ensures gates cannot be circumvented or disabled |
| [quality-gates-specialist](@/agents/quality-gates-specialist.md) | Provides specialized static analysis expertise for gate implementation |
| [quality-intelligence-commander](@/agents/quality-intelligence-commander.md) | Gate failure patterns inform quality intelligence analysis |

## Enforcement

Gate enforcement operates under absolute [NO MERCY](@/glossary/no-mercy.md) discipline: no gate failure results in a pass decision, regardless of the failure's perceived severity. The [NO DOUBTS](@/glossary/no-doubts.md) principle ensures that every gate result is deterministic and reproducible -- running the same gate on the same code produces the same result every time. The [Trinity Gate](@/glossary/trinity-gate.md) validates the gate system's own correctness, verifying that gate implementations accurately detect the violations they target.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)