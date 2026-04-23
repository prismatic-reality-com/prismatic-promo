+++
title = "/debug-types"
weight = 2140
[extra]
category = "Development"
description = "Troubleshoot Dialyzer type inference issues and detect conflicting typespecs"
syntax = "/debug-types [options]"
authority = "L2+"
agent = "type-inference-debugger"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 834
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["debug-types", "Troubleshoot", "Dialyzer", "commands", "Development", "Prismatic Platform", "Type", "Issue", "Medium"]
tags = ["commands", "development", "debug-types", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/debug-types - Prismatic Platform"
+++

## Overview

**/debug-types** is a production command in the **Development** category of the Prismatic Platform that troubleshoots [Dialyzer](@/glossary/dialyzer.md) type [inference](@/glossary/inference.md) issues, detects conflicting typespecs, identifies vague type declarations, and optimizes type system usage across the codebase. The command automates what is traditionally one of the most time-consuming debugging tasks in Elixir development: understanding and resolving Dialyzer warnings that arise from conflicting or overly vague `@spec` declarations.

Dialyzer warnings are notoriously difficult to interpret. A single vague typespec (`@spec run(term(), term(), term()) :: term()`) can mask the precise type information from a more specific typespec on the same function, causing Dialyzer to infer the least useful type. The `/debug-types` command systematically detects these conflicts, identifies the authoritative typespec (the most specific one), removes the conflicting vague spec, and verifies that Dialyzer produces zero warnings after the fix.

This command operates under the **L2+** authority level and is executed by the `type-inference-debugger` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The command was developed from the learnings of the Operation Type Inference Fix, where systematic type analysis resolved multiple Dialyzer warnings that had persisted across several development sessions.

The type debugging approach follows a five-phase pipeline: capture Dialyzer output, analyze conflicts, recommend fixes, implement changes, and verify results. Each phase produces structured output that documents the analysis decisions, ensuring that type system changes are transparent and auditable.

## Architecture

The type debugging system follows a diagnostic pipeline from Dialyzer capture through verified fix.

```
Target (file/module/all)
    |
    v
Dialyzer Runner
    |-- Capture all warnings
    |-- Parse warning structure
    |-- Classify warning types
    |
    v
Conflict Analyzer
    |-- Find multiple @spec for same function
    |-- Detect term() :: term() patterns
    |-- Identify override relationships
    |-- Trace delegation chains
    |
    v
Fix Recommender
    |-- Determine authoritative typespec
    |-- Identify vague specs to remove
    |-- Suggest specific union types
    |-- Plan fix strategy
    |
    v
Fix Implementer
    |-- Remove conflicting vague typespecs
    |-- Preserve specific union types
    |-- Update delegation chain types
    |-- Add @typedoc for complex types
    |
    v
Verifier
    |-- Re-run Dialyzer
    |-- Confirm zero warnings
    |-- Validate type inference correct
    |-- Generate fix report
```

### Common Issue Categories

| Category | Pattern | Severity | Frequency |
|----------|---------|----------|-----------|
| **Conflicting Typespecs** | Multiple @spec for same function | High | Common |
| **Vague Public API Types** | `term() :: term()` in public functions | Medium | Common |
| **Delegation Chain Type Loss** | Type info lost through internal calls | Medium | Moderate |
| **Missing @spec** | Public function without typespec | Low | Moderate |
| **Overly Restrictive Types** | Types too narrow for actual usage | Medium | Rare |

## Usage

### Basic Type Debugging

```bash
# Analyze specific module
/debug-types apps/prismatic_agents/lib/llm_client.ex

# Analyze entire application
/debug-types apps/prismatic_agents/

# Analyze all modules platform-wide
/debug-types

# Quick analysis of specific file
/debug-types apps/prismatic_web/lib/prismatic_web/live/dashboard_live.ex
```

### Targeted Analysis

```bash
# Focus on public API types only
/debug-types apps/prismatic/lib/prismatic.ex --public-only

# Check delegation chains
/debug-types apps/prismatic_agents/ --trace-delegations

# Analyze with verbose output
/debug-types apps/prismatic_storage_core/ --verbose
```

### Fix Operations

```bash
# Analyze and fix automatically
/debug-types apps/prismatic_agents/ --fix

# Fix with manual review
/debug-types apps/prismatic_agents/ --fix --interactive

# Dry run showing proposed fixes
/debug-types apps/prismatic_agents/ --fix --dry-run
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `target` | string | all modules | File path, app directory, or module name |
| `--fix` | boolean | false | Automatically apply recommended fixes |
| `--interactive` | boolean | false | Interactive fix review mode |
| `--dry-run` | boolean | false | Show proposed fixes without applying |
| `--public-only` | boolean | false | Analyze only public function types |
| `--trace-delegations` | boolean | false | Trace type info through delegation chains |
| `--verbose` | boolean | false | Show detailed analysis steps |

## Execution Flow

```
PHASE 1: DIALYZER CAPTURE (5-10s)
    |-- Run Dialyzer on target
    |-- Capture all warnings
    |-- Parse warning structure
    |-- Classify by type (conflicting, vague, missing)
    |
PHASE 2: CONFLICT ANALYSIS (2-5s per module)
    |-- Scan for multiple @spec on same function
    |-- Detect term() :: term() patterns
    |-- Identify override relationships
    |-- Trace delegation chains for type loss
    |-- Map specificity hierarchy
    |
PHASE 3: FIX RECOMMENDATION
    |-- For conflicting specs:
    |     - Keep most specific typespec
    |     - Remove vague overriding spec
    |-- For vague public APIs:
    |     - Infer types from function body
    |     - Suggest specific union types
    |-- For delegation chains:
    |     - Propagate types through chain
    |     - Add missing intermediate specs
    |
PHASE 4: FIX IMPLEMENTATION (if --fix)
    |-- Remove conflicting vague typespecs
    |-- Add or update specific typespecs
    |-- Add @typedoc for complex types
    |-- Update delegation chain types
    |
PHASE 5: VERIFICATION
    |-- Re-run Dialyzer on modified files
    |-- Confirm zero new warnings
    |-- Verify no existing tests broken
    |-- Generate fix report
```

## Common Issues and Fixes

### Issue 1: Conflicting Typespecs

```elixir
# DETECTED: Two specs for same function, one vague
@spec run(provider(), prompt(), options()) :: result()
@spec run(term(), term(), term()) :: term()  # Conflict!

# FIX: Remove vague typespec, keep specific one
@spec run(provider(), prompt(), options()) :: result()
```

### Issue 2: Vague Public API Types

```elixir
# DETECTED: Public function with uninformative types
@spec public_function(term()) :: term()

# FIX: Replace with specific types
@spec public_function(String.t()) :: {:ok, result()} | {:error, atom()}
```

### Issue 3: Delegation Chain Type Loss

```elixir
# DETECTED: Type info lost through private delegation
@spec run(provider(), prompt()) :: result()
def run(provider, prompt), do: do_run(provider, prompt)

# Private function with vague types
defp do_run(term(), term()) :: term()  # Type info lost!

# FIX: Preserve types through delegation
@spec run(provider(), prompt()) :: result()
def run(provider, prompt), do: do_run(provider, prompt)

@spec do_run(provider(), prompt()) :: result()
defp do_run(provider, prompt) do
  # ...
end
```

### Issue 4: Missing @spec on Public Function

```elixir
# DETECTED: No @spec on public function
def calculate_score(data, options) do
  # ...
end

# FIX: Add inferred @spec
@spec calculate_score(map(), keyword()) :: {:ok, float()} | {:error, atom()}
def calculate_score(data, options) do
  # ...
end
```

## Output Format

```
TYPE INFERENCE DEBUG: LLMClient

DIALYZER WARNINGS FOUND:
  1. Function run/3 has conflicting typespecs
     Line 51: @spec run(provider(), prompt(), options()) :: result()
     Line 54: @spec run(term(), term(), term()) :: term()

ROOT CAUSE ANALYSIS:
  Vague typespec at line 54 overrides specific typespec at line 51.
  Dialyzer infers most restrictive type (term() :: term()).

RECOMMENDED FIX:
  Action: Remove vague typespec at line 54
  Keep: Specific typespec at line 51
  Reason: Preserve type information for callers

IMPLEMENTATION:
  Removing conflicting typespec...
  Fixed: apps/prismatic_agents/lib/llm_client.ex:54

VERIFICATION:
  Running Dialyzer...
  Zero warnings!
  Type inference now correct

FIX SUMMARY:
  Removed: 1 vague typespec
  Preserved: 1 specific typespec
  Warnings: 1 -> 0
```

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Executed by `type-inference-debugger` | Primary debugging agent |
| AIAD Registry | Command specification and discovery | Standard AIAD interface |
| [Quality Gates](@/glossary/quality-gates.md) | Pre/post execution quality validation | Dialyzer as quality gate |
| [Telemetry](@/glossary/telemetry.md) | Command execution [metrics](@/glossary/metrics.md) | Type fix event tracking |
| Dialyzer | Type analysis tool | Core analysis engine |
| Mix Tasks | `mix dialyzer` | PLT building and analysis |

## Quality Requirements

All type fixes must satisfy:

| Requirement | Description | Enforcement |
|-------------|-------------|-------------|
| Zero Dialyzer warnings | No new warnings introduced | Blocking |
| One @spec per function | No duplicate specs for same function | Blocking |
| No `term() :: term()` in public APIs | Public functions must have specific types | Warning |
| Delegation chains type-safe | Types preserved through internal calls | Warning |
| @typedoc for complex types | Custom types documented | Recommended |

## Best Practices

1. **Run After Adding New Functions**: Execute `/debug-types` after adding public functions to ensure type coverage and catch conflicts early.

2. **Focus on Public APIs First**: Public function types are the most impactful because they affect all callers. Use `--public-only` for initial analysis.

3. **Always Verify After Fixes**: Dialyzer operates on the PLT (Persistent Lookup Table), which can cache stale information. Always re-run Dialyzer after fixes to confirm resolution.

4. **Document Type Decisions**: Add `@typedoc` for complex custom types, especially union types that represent multiple valid states.

5. **Trace Delegation Chains**: Use `--trace-delegations` to find type information loss through private function chains, a common source of vague Dialyzer inference.

6. **Combine with /debug-investigation**: For issues where type problems are symptoms of deeper architectural issues, follow up with `/debug-investigation` for root cause analysis.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `PLT_NOT_FOUND` | Dialyzer PLT not built | Run `mix dialyzer --plt` first |
| `PLT_STALE` | PLT needs rebuilding | Run `mix dialyzer --plt --force` |
| `MODULE_NOT_FOUND` | Target module does not exist | Verify module path |
| `FIX_BROKE_TESTS` | Type fix caused test failures | Review fix, may need broader changes |
| `NUCLEAR_CACHE_NEEDED` | Stale compilation artifacts | `rm -rf _build/dev/lib/*/ebin && mix compile` |

## Performance

| Metric | Value | Notes |
|--------|-------|-------|
| Per-Module Analysis | < 2 seconds | Excluding PLT build |
| Per-Typespec Fix | < 1 second | Including file write |
| Dialyzer Verification | ~10 seconds | Full Dialyzer run |
| Total (Typical Module) | ~15 seconds | End-to-end |
| PLT Build (Cold) | 5-15 minutes | First run only |

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero Dialyzer warnings tolerated. Every type fix must result in zero warnings for the affected modules. Vague `term() :: term()` typespecs on public APIs are treated as quality violations.
- **NO DOUBTS**: Full analysis of type inference chain before any fix. Conflicting specs are resolved based on specificity analysis, not arbitrary removal.

## Related Commands

- [/code](@/commands/code.md) - Core coding implementation and feature development
- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)
- [/debug-investigation](@/commands/debug-investigation.md) - Comprehensive debugging investigation
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/cascade](@/commands/cascade.md) - Execute CASCADE pattern fix for systematic anti-pattern removal
- [/coordinate](@/commands/coordinate.md) - Orchestrate complex multi-agent operations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)