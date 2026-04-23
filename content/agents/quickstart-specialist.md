+++
title = "quickstart-specialist"
weight = 332
[extra]
domain = "development"
level = "L3"
description = "Rapid feature scaffolding with intelligent code generation, boilerplate automation, and best practice patterns"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ecto", "phoenix", "liveview", "aiad", "ets", "hot-code-reload"]
domain_normalized = "development"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 1800
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["quickstart-specialist", "Rapid", "agents", "agent", "Prismatic Platform", "Generated", "GenServer", "LiveView"]
tags = ["agents", "agent", "quickstart-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "quickstart-specialist - Prismatic Platform"
+++

## Overview

The quickstart-specialist operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform's development domain, providing rapid feature scaffolding with intelligent code generation, boilerplate automation, and best practice pattern application. In a platform comprising 90 umbrella applications with strict quality requirements across 13 quality domains, creating new features from scratch requires generating substantial amounts of boilerplate code that must comply with all platform conventions, quality standards, and architectural patterns from the first commit. This agent eliminates the ramp-up time by generating production-ready scaffolding that satisfies all quality gates immediately.

The quickstart-specialist differs from generic code generators in that it understands the Prismatic Platform's specific architecture, conventions, and quality requirements. Generated code includes proper [supervision tree](@/glossary/supervision-tree.md) integration, [GenServer](@/glossary/genserver.md) implementations with correct state management patterns, [Ecto](@/glossary/ecto.md) schema definitions with proper changesets, [Phoenix](@/glossary/phoenix.md)/[LiveView](@/glossary/liveview.md) components with TailwindCSS styling, comprehensive test suites, and full typespec coverage. Every generated file passes all quality gates without modification.

Built on the [AIAD](@/glossary/aiad.md) standard and governed by the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine, the quickstart-specialist generates code that is production-ready from creation. No stubs, no placeholders, no TODO comments, no incomplete implementations. Generated code meets the same standard as hand-written code that has passed through the full quality enforcement pipeline.

## Scaffolding Architecture

The scaffolding system operates through template-based generation with intelligent customization.

**Template management** maintains a library of validated code templates for common patterns: GenServer processes, [Phoenix](@/glossary/phoenix.md) controllers, LiveView modules, [Ecto](@/glossary/ecto.md) contexts, storage adapters, agent specifications, and test suites. Templates are parameterized and composable, allowing the generator to produce code that combines multiple patterns as required by the feature specification.

**Convention enforcement** ensures that generated code follows all platform naming conventions, module organization patterns, and documentation requirements. Module names follow the umbrella's namespace hierarchy, function signatures follow the `{:ok, result}` / `{:error, reason}` convention, and all public functions include `@doc`, `@spec`, and `@impl` annotations as required.

**Quality pre-validation** runs a virtual quality gate check on generated code before writing it to disk. This prevents the generation of code that would immediately fail quality enforcement, catching template errors or parameter misconfigurations before they create development friction.

**Test generation** produces comprehensive test suites alongside application code. Unit tests cover all public functions, property-based tests verify behavioral invariants, and integration tests validate inter-module interactions. Generated tests follow the Arrange-Act-Assert pattern with clear descriptions.

## Key Capabilities

- **Full-stack feature scaffolding** -- Generates complete feature implementations including GenServer processes, Phoenix controllers, LiveView modules, Ecto schemas, storage adapters, and test suites from a single feature specification
- **Quality-compliant generation** -- All generated code passes every quality gate (compilation, Dialyzer, Credo, pattern checks) without modification, ensuring zero ramp-up quality debt
- **Convention-aware naming** -- Automatically applies platform naming conventions, module hierarchy patterns, and documentation standards to all generated artifacts
- **Test suite generation** -- Produces comprehensive tests including unit, property-based, and integration tests with full coverage of generated functionality
- **Template composition** -- Combines multiple code templates into coherent feature implementations, managing dependencies and imports across generated modules
- **Incremental generation** -- Supports generating additional components for existing features without overwriting or conflicting with previously generated or hand-written code
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with template evolution based on quality gate feedback
- **[Telemetry integration](@/capabilities/telemetry-integration.md)** for generation frequency, quality compliance, and template effectiveness tracking

## Generation Templates

| Template | Generated Artifacts | Quality Gates |
|----------|-------------------|---------------|
| **GenServer** | Module, state struct, callbacks, tests, typespec | All 13 domains |
| **LiveView** | Live module, template, event handlers, tests | All 13 domains |
| **Ecto Context** | Schema, changeset, context module, migration, tests | All 13 domains |
| **Storage Adapter** | Adapter module, behaviour impl, contract tests | All 13 domains |
| **Agent Spec** | AIAD agent markdown, command markdown | Format validation |
| **Mix Task** | Task module, help text, argument parsing, tests | All 13 domains |
| **API Endpoint** | Controller, view, OpenAPI spec, tests | All 13 domains |

## Implementation Architecture

```elixir
defmodule PrismaticDev.QuickstartSpecialist do
  @moduledoc """
  Rapid feature scaffolding engine generating production-ready
  code with full quality gate compliance from creation.
  """

  alias PrismaticDev.{TemplateEngine, ConventionValidator, QualityPrecheck}

  @type scaffold_result :: %{
    files_generated: non_neg_integer(),
    quality_status: :all_passing,
    artifacts: [%{path: String.t(), type: atom()}]
  }

  @spec scaffold(atom(), String.t(), keyword()) ::
    {:ok, scaffold_result()} | {:error, term()}
  def scaffold(template, name, opts \\ []) do
    with {:ok, params} <- validate_params(template, name, opts),
         {:ok, artifacts} <- TemplateEngine.generate(template, params),
         {:ok, _} <- ConventionValidator.validate_all(artifacts),
         {:ok, _} <- QualityPrecheck.verify(artifacts) do
      write_artifacts(artifacts)
      {:ok, %{
        files_generated: length(artifacts),
        quality_status: :all_passing,
        artifacts: Enum.map(artifacts, &%{path: &1.path, type: &1.type})
      }}
    end
  end
end
```

## Scaffolding Workflow

```
Feature Specification
    |
    v
Template Selection + Parameter Resolution
    |
    v
Code Generation (parameterized templates)
    |
    v
Convention Validation (naming, structure, docs)
    |
    v
Quality Pre-check (virtual gate execution)
    |
    v
File Writing (only if all checks pass)
    |
    v
Post-Generation Verification (actual gate run)
```

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination with authority to generate code across application boundaries, create new modules, and produce test suites.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/quickstart scaffold` | Generate feature scaffolding from template specification | L3+ |
| `/quickstart templates` | List available scaffolding templates with descriptions | L3+ |
| `/quickstart verify` | Verify generated code passes all quality gates | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [quality-gates-specialist](@/agents/quality-gates-specialist.md) | Quality gate compliance validated on all generated code |
| [quality-enforcement-commander](@/agents/quality-enforcement-commander.md) | Generated code must satisfy enforcement requirements |
| [refactor-specialist-coordinator](@/agents/refactor-specialist-coordinator.md) | Generated scaffolding follows refactoring-friendly patterns |
| [rapid-feature-specialist](@/agents/rapid-feature-specialist.md) | Feature implementation builds on quickstart scaffolding |

## Enforcement

Generated code must satisfy the [NO MERCY](@/glossary/no-mercy.md) doctrine from creation: no stubs, no placeholders, no incomplete implementations, no TODO markers. The [NO DOUBTS](@/glossary/no-doubts.md) principle requires that generated code is verified through quality gates, not assumed compliant. Every scaffolding operation concludes with actual gate execution confirming full compliance. The [Trinity Gate](@/glossary/trinity-gate.md) validates that generated code maintains structural consistency with the existing codebase.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)