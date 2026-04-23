+++
title = "Prismatic Tidewave"
weight = 69
[extra]
icon = "rocket-launch"
color = "cyan"
description = "AI-powered development acceleration with automatic API and test generation"
category = "DevOps"
files = "85"
status = "Development"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1284
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Tidewave", "AI-powered", "apps", "DevOps", "Prismatic Platform", "OpenAPI", "Generated"]
tags = ["apps", "devops", "prismatic-tidewave", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Tidewave - Prismatic Platform"
+++

## Overview

Prismatic Tidewave integrates the Tidewave library for AI-accelerated development workflows within the Prismatic Platform. By combining large language model capabilities with deep knowledge of the platform's architecture, Tidewave automates the most time-consuming aspects of application development: [REST API](/glossary/rest-api/) scaffolding, test suite generation, and iterative code review. Rather than generating generic boilerplate, Tidewave produces code that already conforms to the platform's [NO MERCY NO DOUBTS](/glossary/no-mercy-no-doubts/) quality standards, including proper `{:ok, _}` / `{:error, _}` return patterns, [supervision tree](/glossary/supervision-tree/) integration, and [typespec](/glossary/typespec/) annotations.

The module operates as an [OTP](/glossary/otp/) application with a pool of AI worker processes, each capable of analyzing [Elixir](/glossary/elixir/) AST, inspecting module documentation via `Code.fetch_docs/1`, and reading `@spec` annotations to understand function contracts. This introspection-first approach means Tidewave generates endpoints and tests that accurately reflect actual module behavior rather than relying on naming conventions alone. The [BEAM](/glossary/beam/) virtual machine's [hot code reload](/glossary/hot-code-reload/) capability enables Tidewave to regenerate and reload modules in a running development environment without restarting the application.

Tidewave is particularly valuable when onboarding new [umbrella application](/glossary/umbrella-application/)s into the platform. A single command can produce a complete REST API layer with [OpenAPI](/glossary/openapi/) documentation, a [property-based testing](/glossary/property-based-testing/) suite, and integration test scaffolding -- reducing what typically takes days to under an hour. This acceleration compounds across the platform's 90+ applications, where consistent patterns and [quality gates](/glossary/quality-gates/) must be maintained without manual enforcement bottlenecks.

## Architecture

```
Module Introspection -> Semantic Model -> Code Generation -> Validation -> Output
        |                    |                |                |           |
   Code.fetch_docs/1    Function Map     Template Engine    Credo +      File Write
   @spec Analysis       Arity/Type       AI Expansion       Compile      + Format
   @moduledoc Parse     Documentation    Pattern Match      Test Run     Reload
   Behaviour Detection  Dependency Map   Style Conform      Dialyzer     Notify
```

Tidewave follows a pipeline architecture with three stages. The **Analyzer** stage introspects target modules using Elixir's reflection capabilities to build a semantic model of available functions, their arities, specs, and documentation. The **Generator** stage transforms this model into code artifacts using configurable templates and AI-assisted expansion. The **Validator** stage compiles generated code, runs [Credo](/glossary/credo/) checks, and executes the generated tests to ensure correctness before writing files to disk.

### Process Topology

```
PrismaticTidewave.Application (Supervisor, :one_for_one)
+-- PrismaticTidewave.Analyzer (GenServer)
|     Module introspection and semantic model construction
+-- PrismaticTidewave.Generator (DynamicSupervisor)
|     Concurrent code generation workers
+-- PrismaticTidewave.Validator (GenServer)
|     Compilation, Credo, Dialyzer, and test execution
+-- PrismaticTidewave.TemplateRegistry (GenServer)
|     ETS-cached generation templates with versioning
+-- PrismaticTidewave.Telemetry (setup)
      Generation metrics and output tracking
```

All three stages are supervised under a `DynamicSupervisor`, allowing concurrent generation across multiple target modules with automatic restart on failure. Each worker process is monitored by [Telemetry](/glossary/telemetry/) events that report generation times, validation pass rates, and output artifact counts for [observability](/glossary/observability/).

## Introspection-First Design

The fundamental design principle of Tidewave is that code generation should be informed by actual module behavior rather than assumptions based on naming conventions. The Analyzer stage uses four Elixir reflection mechanisms to build a complete semantic model of each target module.

**`Code.fetch_docs/1`** retrieves the module's documentation, including `@moduledoc`, `@doc`, and `@typedoc` attributes. This documentation provides semantic context that guides API endpoint naming, test description generation, and OpenAPI documentation content.

**`Code.Typespec.fetch_specs/1`** retrieves function type specifications. These specs define the input types, output types, and error conditions for each function, enabling Tidewave to generate accurate request validation, response serialization, and property-based test generators without manual type annotation.

**`Module.__info__(:functions)`** lists all exported functions with their arities. Combined with the documentation and specs, this provides a complete catalog of the module's public interface.

**Behaviour detection** identifies which behaviours the module implements (GenServer, Supervisor, Application, custom behaviours). This information guides the generation of supervision tree integration, process lifecycle tests, and GenServer-specific API patterns.

```elixir
defmodule PrismaticTidewave.SemanticModel do
  @type t :: %__MODULE__{
    module: module(),
    functions: [%{name: atom(), arity: non_neg_integer(), spec: term(), doc: String.t()}],
    behaviours: [module()],
    moduledoc: String.t() | nil,
    types: [%{name: atom(), definition: term()}],
    dependencies: [module()]
  }
end
```

The semantic model produced by the Analyzer is a structured representation of the module's public interface that the Generator stage uses as input. This model captures function signatures, return types, documentation strings, callback implementations, and dependency relationships in a format that is independent of the generation templates.

## Key Features

### API Generation
- Automatic REST endpoint scaffolding from [Ecto](/glossary/ecto/) schemas and facade modules
- OpenAPI 3.0 specification generation with accurate type mappings from `@spec` annotations
- Request validation and response serialization derived from [behaviour](/glossary/behaviour/) contracts
- [Phoenix](/glossary/phoenix/) router integration with proper scope and pipeline configuration

### Test Automation
- [Property-based testing](/glossary/property-based-testing/) generation using StreamData for exhaustive input coverage
- Integration test scaffolding with database sandbox and [Phoenix LiveView](/glossary/phoenix-liveview/) endpoint setup
- Edge case identification through boundary value analysis of type specs
- Coverage gap detection by comparing generated tests against module function lists

### Development Workflow
- AI-assisted code review with platform-specific [quality gates](/glossary/quality-gates/) awareness
- Refactoring suggestions that preserve OTP supervision tree integrity and [process isolation](/glossary/process-isolation/)
- Documentation generation from module source and `@moduledoc` attributes
- Architecture recommendations based on existing [umbrella application](/glossary/umbrella-application/) patterns

### Quality Integration
- Generated code automatically validated against [Dialyzer](/glossary/dialyzer/) type specifications
- [Pattern matching](/glossary/pattern-matching/) completeness verification for generated function clauses
- [AIAD](/glossary/aiad/) compliance checking for generated agent modules
- Output artifacts tracked by [Quality DNA](/glossary/quality-dna/) for cross-session continuity

## Generation Templates

The Generator stage uses configurable templates that encode the platform's coding patterns. Templates are version-controlled and updated as platform conventions evolve, ensuring that generated code always reflects current standards.

The API generation template produces a Phoenix controller with proper error handling, a router scope with authentication pipeline, an OpenAPI operation spec, and request/response serialization modules. The test generation template produces a comprehensive test file with unit tests for each function, property-based tests for data transformation functions, and integration tests with proper test setup and teardown.

Templates are extensible through a hook system. Before and after each generation step, hooks can modify the generated code to add application-specific logic. This extensibility enables domain teams to customize generated code for their specific requirements while inheriting the base quality standards from the platform templates.

| Template | Output | Quality Checks |
|----------|--------|----------------|
| **API Endpoint** | Controller + Router + OpenAPI spec | Credo, Dialyzer, compilation |
| **Test Suite** | Unit + property + integration tests | Coverage, assertion completeness |
| **Documentation** | Moduledoc + function docs + README | Spell check, link validation |
| **Agent Module** | AIAD-compliant agent definition | AIAD schema validation |
| **Storage Adapter** | Adapter module + contract tests | Contract test suite execution |

## Configuration

```elixir
config :prismatic_tidewave,
  # AI model settings
  model: :qwen3_coder,
  fallback_model: :claude,
  temperature: 0.3,
  max_tokens: 4000,

  # Generation settings
  template_path: "priv/templates/",
  output_format: true,
  validation_enabled: true,

  # Concurrency
  max_concurrent_generators: 4,
  generation_timeout: 60_000,

  # Quality gates
  credo_strict: true,
  dialyzer_check: true,
  compile_check: true
```

## Usage

```elixir
# Generate API endpoints from a facade module
{:ok, endpoints} = PrismaticTidewave.generate_api(PrismaticPerimeter, router: PrismaticApiWeb.Router)

# Generate a full test suite for a module
{:ok, tests} = PrismaticTidewave.generate_tests(PrismaticDeduction.InferenceEngine,
  types: [:unit, :property, :integration])

# AI-assisted code review with platform standards
{:ok, review} = PrismaticTidewave.review("apps/prismatic_agents/lib/prismatic_agents/registry.ex",
  checks: [:otp_patterns, :naming, :typespecs, :error_handling])

# Batch generation for a new umbrella app
{:ok, artifacts} = PrismaticTidewave.scaffold(:prismatic_new_app,
  facades: [NewApp.Facade],
  generate: [:api, :tests, :docs])

# Analyze a module to inspect its semantic model
{:ok, model} = PrismaticTidewave.analyze(PrismaticPerimeter.SecurityRating)
# => %SemanticModel{functions: [...], behaviours: [...], types: [...]}
```

## Testing

```bash
mix test apps/prismatic_tidewave/test
mix test apps/prismatic_tidewave/test --cover
```

| Test Category | Tests | What It Verifies |
|--------------|-------|------------------|
| Module Introspection | 10 | Spec extraction, doc parsing, behaviour detection |
| API Generation | 8 | Endpoint correctness, router integration, OpenAPI accuracy |
| Test Generation | 8 | Property test validity, integration test setup, coverage |
| Validation Pipeline | 6 | Credo compliance, Dialyzer pass, compilation success |
| Template System | 4 | Hook execution, customization, version compatibility |
| Semantic Model | 6 | Model completeness, dependency resolution, type mapping |

## Integration Points

| Application | Relationship |
|-------------|--------------|
| [Prismatic Credo](/apps/prismatic-credo/) | Validates generated code against platform quality rules before writing output |
| [Prismatic API](/apps/prismatic-api/) | Module introspection capabilities to understand existing endpoint patterns |
| [Prismatic Safety](/apps/prismatic-safety/) | Quality Floor Guardian verifies generated code meets platform minimums |
| [Prismatic Storage Core](/apps/prismatic-storage-core/) | Generated tests integrate with `PrismaticStorage.AdapterContractTest` |
| [Prismatic Ollama](/apps/prismatic-ollama/) | Local AI model for code generation without cloud dependency |
| [Prismatic Claude](/apps/prismatic-claude/) | Cloud AI fallback for complex generation tasks |

## NABLA Compliance

Generated code carries provenance metadata in module attributes that trace each generated artifact back to the source module, generation timestamp, and template version, satisfying the Provenance Mandatory axiom. The validation pipeline ensures that generated code meets the same quality standards as hand-written code, preventing quality degradation from automated generation. The introspection-first approach satisfies the Signal Plurality axiom by deriving code from multiple independent sources (specs, docs, behaviours, function signatures) rather than relying on a single convention.

| NABLA Axiom | Tidewave Enforcement | Implementation |
|-------------|---------------------|----------------|
| Provenance Mandatory | Generated artifacts carry source module, timestamp, template version | Module attributes with generation metadata |
| Signal Plurality | Multiple introspection sources inform generation | Specs + docs + behaviours + function signatures |
| Unknown Valid | Generation confidence reported per artifact | Validation results include confidence scores |

## Performance

| Metric | Value | Notes |
|--------|-------|-------|
| Module analysis | < 100ms | Per module AST introspection |
| API endpoint generation | 2-5s | Including AI expansion |
| Test suite generation | 3-8s | Including property test generators |
| Validation pipeline | 5-30s | Compile + Credo + Dialyzer + test run |
| Full scaffold (1 app) | 30-60s | API + tests + docs + validation |

## Related Components

- [Prismatic Credo](/apps/prismatic-credo/) -- Quality checks applied to generated code
- [Prismatic Labs](/apps/prismatic-labs/) -- Experimental generation templates tested before promotion
- [Prismatic API](/apps/prismatic-api/) -- Target for generated REST endpoints
- [Prismatic Claude](/apps/prismatic-claude/) -- LLM integration for code generation and review

## Related Agents

- [Elixir Architect](/agents/elixir-architect/) -- Validates that generated code follows OTP patterns and Elixir best practices
- [API Design Specialist](/agents/api-design-specialist-agent/) -- Reviews generated API endpoints for REST design compliance
- [Architecture Review Specialist](/agents/architecture-review-specialist/) -- Ensures generated scaffolding aligns with platform architecture decisions

## Related Capabilities

- [Quality Gates](/capabilities/quality-gates/) -- Generated code must pass all quality gate checks before acceptance
- [AIAD Standard](/capabilities/aiad-standard/) -- Generated agent modules conform to AIAD specification format
- [Autonomous Self-Healing](/capabilities/autonomous-self-healing/) -- Tidewave regeneration as part of automated quality repair cycles

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)