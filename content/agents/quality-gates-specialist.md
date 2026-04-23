+++
title = "quality-gates-specialist"
weight = 330
[extra]
domain = "development"
level = "L3"
description = "Static analysis enforcement with quality gates, Credo, Dialyzer, pattern verification, UnsafeMapAccess elimination, and custom rule validation"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ecto", "phoenix", "liveview", "aiad", "ets", "hot-code-reload"]
domain_normalized = "development"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 1850
quality_score = 83
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["quality-gates-specialist", "Static", "Credo", "Dialyzer", "UnsafeMapAccess", "agents", "agent", "Prismatic Platform", "Strict"]
tags = ["agents", "agent", "quality-gates-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "quality-gates-specialist - Prismatic Platform"
+++

## Overview

The quality-gates-specialist operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform's development domain, providing deep expertise in static analysis enforcement through [quality gates](@/glossary/quality-gates.md), [Credo](@/glossary/credo.md) configuration, [Dialyzer](@/glossary/dialyzer.md) management, pattern verification, UnsafeMapAccess elimination, and custom rule validation. While the [quality-gate-enforcer-agent](@/agents/quality-gate-enforcer-agent.md) executes gate checks and the [quality-enforcement-commander](@/agents/quality-enforcement-commander.md) coordinates enforcement strategy, this specialist provides the static analysis knowledge required to design effective gates and resolve complex analysis findings.

Static analysis in the Elixir/[OTP](@/glossary/otp.md) ecosystem involves unique challenges not found in conventional statically-typed languages. Dialyzer operates through success typing rather than traditional type checking, meaning it reports definite type violations while permitting some ambiguity. Credo provides opinionated code quality analysis that must be tuned to the platform's specific conventions. Custom pattern checks target Prismatic-specific anti-patterns that no generic tool detects. This specialist understands these tools deeply and maintains the configuration, rules, and patterns that make them effective.

Built on the [AIAD](@/glossary/aiad.md) standard and governed by the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine, every static analysis finding is treated as a real issue requiring resolution. The specialist maintains zero tolerance for suppression comments, ignore annotations, or configuration relaxation as mechanisms for avoiding quality compliance.

## Static Analysis Toolchain

The platform's static analysis infrastructure combines multiple tools, each targeting different aspects of code quality.

**Dialyzer** performs success typing analysis across the entire umbrella application, detecting type mismatches, unreachable code, and pattern match failures that compile successfully but contain logical errors. The specialist maintains the PLT (Persistent Lookup Table) configuration, manages PLT rebuild strategies for the 90-application umbrella, and resolves false positives through proper typespec annotations rather than suppression.

**Credo** enforces code style, complexity, naming, and pattern conventions through configurable rules. The specialist maintains the `.credo.exs` configuration that defines the platform's specific quality requirements, including strict mode enforcement with zero-tolerance for any check category. Custom Credo checks developed specifically for the platform complement the standard rule set.

**Custom pattern analyzers** detect anti-patterns specific to the Prismatic Platform's architecture. The UnsafeMapAccess analyzer identifies direct map key access that could raise KeyError exceptions and recommends safe alternatives. The TimingPattern analyzer detects Process.sleep usage that should be replaced with receive-after patterns. The GuardFunction analyzer ensures that guard clauses use only guard-safe functions.

## Key Capabilities

- **Dialyzer PLT management** -- Maintains and optimizes the Persistent Lookup Table configuration for efficient type analysis across the 90-application umbrella, managing incremental PLT updates and full rebuild strategies
- **Credo configuration design** -- Develops and maintains the platform's [Credo](@/glossary/credo.md) configuration including custom rules, severity mappings, and exclusion patterns that balance thoroughness with development velocity
- **Custom rule development** -- Creates platform-specific analysis rules targeting anti-patterns unique to the Prismatic architecture, including unsafe map access, timing patterns, and guard function violations
- **UnsafeMapAccess elimination** -- Systematically identifies and resolves all instances of direct map key access, replacing them with safe alternatives (`Map.get/2`, `Map.fetch/2`, or pattern matching)
- **False positive resolution** -- Investigates and resolves static analysis false positives through proper typespec annotation and code restructuring rather than suppression, maintaining zero-suppression policy
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with continuous analysis rule refinement based on violation patterns
- **[Telemetry integration](@/capabilities/telemetry-integration.md)** for analysis coverage, violation trend, and tool performance monitoring

## Pattern Verification Rules

| Pattern | Detection | Replacement | Auto-Fix |
|---------|-----------|-------------|----------|
| `map.key` direct access | AST analysis for dot-access on map type | `Map.get(map, :key)` or `Map.fetch!(map, :key)` | Yes |
| `length(list) > 0` | AST pattern match on `length/1` comparison | `list != []` or match on `[_ \| _]` | Yes |
| `Process.sleep(n)` | Call graph analysis | `receive do after n -> :ok end` | Yes |
| Missing `@impl` | Behaviour callback detection without annotation | Add `@impl true` | Yes |
| Missing `@spec` | Public function without typespec | Generate spec from usage analysis | No |
| `String.to_atom/1` | Unsafe atom creation detection | `String.to_existing_atom/1` | No |

## Implementation Architecture

```elixir
defmodule PrismaticSafety.GatesSpecialist do
  @moduledoc """
  Static analysis specialist providing deep expertise in
  Dialyzer, Credo, and custom pattern verification rules.
  """

  alias PrismaticSafety.Analyzers.{
    UnsafeMapAccess,
    TimingPattern,
    GuardFunction,
    TypespecCoverage
  }

  @type analysis_result :: %{
    tool: atom(),
    violations: [violation()],
    auto_fixable: non_neg_integer(),
    manual_required: non_neg_integer()
  }

  @spec comprehensive_analysis(String.t()) :: {:ok, [analysis_result()]}
  def comprehensive_analysis(app_path) do
    results = [
      UnsafeMapAccess.analyze(app_path),
      TimingPattern.analyze(app_path),
      GuardFunction.analyze(app_path),
      TypespecCoverage.analyze(app_path)
    ]

    {:ok, results}
  end

  @spec apply_auto_fixes(String.t(), [atom()]) :: {:ok, non_neg_integer()}
  def apply_auto_fixes(app_path, categories \\ :all) do
    fixable = categories
      |> list_auto_fixable(app_path)
      |> Enum.map(&apply_fix/1)
      |> Enum.count(&(&1 == :ok))

    {:ok, fixable}
  end
end
```

## Dialyzer Management

| Aspect | Configuration | Impact |
|--------|--------------|--------|
| **PLT Location** | `priv/plts/dialyzer.plt` | Shared across development team |
| **PLT Build Time** | ~10 minutes (full), ~2 minutes (incremental) | CI optimization critical |
| **Warning Types** | All enabled, zero suppressions | Maximum detection coverage |
| **Apps Analyzed** | All 90 umbrella applications | Complete type safety |
| **Nuclear Cache Fix** | `rm -rf _build/dev/lib/*/ebin` + PLT rebuild | Corruption recovery |

## Credo Configuration Overview

| Category | Strictness | Violations Allowed |
|----------|-----------|-------------------|
| **Consistency** | Strict | 0 |
| **Readability** | Strict | 0 |
| **Refactoring Opportunities** | Strict | 0 |
| **Software Design** | Strict | 0 |
| **Warnings** | Strict | 0 |
| **Custom Rules** | Strict | 0 |

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination with authority to define analysis rules, maintain tool configurations, and provide expert guidance on static analysis findings resolution.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/quality-gates analyze` | Run comprehensive static analysis on specified application | L3+ |
| `/quality-gates fix` | Apply auto-fixes for detected violations | L3+ |
| `/quality-gates rules` | List all active analysis rules with detection criteria | L3+ |
| `/quality-gates plt` | Manage Dialyzer PLT operations (build, update, verify) | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [quality-gate-enforcer-agent](@/agents/quality-gate-enforcer-agent.md) | Gates execute the rules defined and maintained by this specialist |
| [quality-enforcement-commander](@/agents/quality-enforcement-commander.md) | Enforcement strategy informed by analysis capability assessment |
| [refactor-specialist](@/agents/refactor-specialist.md) | Refactoring operations guided by static analysis findings |
| [quality-intelligence-commander](@/agents/quality-intelligence-commander.md) | Analysis patterns inform quality intelligence models |

## Enforcement

Static analysis enforcement follows [NO MERCY](@/glossary/no-mercy.md) doctrine: zero violations permitted, zero suppression comments accepted, zero configuration relaxation granted. The [NO DOUBTS](@/glossary/no-doubts.md) principle requires that every analysis rule is validated against known true positive and true negative cases, ensuring rule accuracy. The [Trinity Gate](@/glossary/trinity-gate.md) validates that the analysis toolchain configuration is self-consistent and that rule interactions do not create conflicting requirements.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)