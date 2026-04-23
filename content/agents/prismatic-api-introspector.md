+++
title = "prismatic-api-introspector"
weight = 310
[extra]
domain = "api-infrastructure"
level = "L3"
description = "Runtime discovery of all Prismatic* facade modules and their public functions"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ets", "dynamic-supervisor", "circuit-breaker", "umbrella-application", "postgresql", "aiad"]
domain_normalized = "infrastructure"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 1850
quality_score = 83
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["prismatic-api-introspector", "Runtime", "Prismatic", "agents", "agent", "Prismatic Platform", "OpenAPI", "Code"]
tags = ["agents", "agent", "prismatic-api-introspector", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "prismatic-api-introspector - Prismatic Platform"
+++

## Overview

The prismatic-api-introspector operates as an L3 [Strategic Command](/glossary/strategic-command/) authority within the Prismatic Platform's api-infrastructure domain, responsible for runtime discovery of all `Prismatic*` facade modules and their public functions. This agent leverages the [BEAM](/glossary/beam/) virtual machine's introspection capabilities to automatically discover, catalog, and expose the platform's entire public API surface without manual configuration. In a platform comprising 90 umbrella applications and thousands of modules, manual API documentation becomes unsustainable -- automated introspection ensures that the API catalog is always accurate and complete.

The introspector scans all loaded modules at boot time, identifies those matching the `Prismatic*` namespace pattern, extracts their public function signatures through `Module.__info__(:functions)`, retrieves typespecs via `Code.Typespec.fetch_specs/1`, and parses documentation through `Code.fetch_docs/1`. The discovered API surface is cached in [ETS](/glossary/ets/) for sub-millisecond lookup performance and serves as the foundation for the platform's auto-generated OpenAPI 3.0 specification and generic dispatch controller.

Built on the [AIAD](/glossary/aiad/) standard and governed by the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine, the introspector enforces strict accuracy requirements: every discovered endpoint must have a valid typespec, documentation, and a verified dispatch path. Modules that lack proper specifications are flagged rather than silently included with incomplete metadata.

## Introspection Architecture

The introspection pipeline operates in four sequential phases during application startup, with results cached for the lifetime of the application.

The **discovery phase** scans all modules loaded in the BEAM runtime, filtering for those matching the `Prismatic*` namespace convention. This uses `:code.all_loaded/0` combined with pattern matching to identify facade modules. The discovery excludes internal implementation modules (those containing `.Impl.`, `.Private.`, or `.Internal.` in their names) to ensure only public-facing APIs are cataloged.

The **extraction phase** processes each discovered module to extract its public interface. Function signatures are obtained from `Module.__info__(:functions)`, typespecs from `Code.Typespec.fetch_specs/1`, and documentation from `Code.fetch_docs/1`. The extraction handles edge cases including modules without typespecs, functions with multiple clause specs, and deprecated functions marked for future removal.

The **mapping phase** transforms Elixir typespec AST representations into OpenAPI 3.0 JSON Schema types. This involves recursive AST traversal to handle complex types including unions, structs, keyword lists, and nested map types. The mapper produces schema definitions that accurately represent the Elixir type system within OpenAPI's type constraints.

The **registration phase** stores the complete API catalog in an [ETS](/glossary/ets/) table optimized for read-heavy access patterns, indexed by application name, module name, and function name for efficient multi-dimensional lookup.

## Key Capabilities

- **Zero-configuration API discovery** -- Automatically discovers all public facade functions across the 90-application [umbrella](/glossary/umbrella-application/) without requiring manual route definitions, annotations, or configuration files
- **Typespec-to-schema mapping** -- Converts Elixir `@spec` AST representations into OpenAPI 3.0 JSON Schema definitions, supporting complex types including unions, maps, structs, and keyword lists
- **Live documentation extraction** -- Pulls `@doc` and `@moduledoc` content directly from compiled beam files, ensuring API documentation always reflects the current codebase state
- **ETS-cached catalog** -- Stores the complete API surface in an [ETS](/glossary/ets/) table with sub-millisecond lookup performance, supporting the generic dispatch controller's real-time routing decisions
- **Hot-reload awareness** -- Detects module recompilation events via [hot code reload](/glossary/hot-code-reload/) notifications and updates the API catalog without requiring application restart
- **[Autonomous operation](/capabilities/autonomous-self-healing/)** with periodic rescan cycles to detect newly loaded modules
- **[Telemetry integration](/capabilities/telemetry-integration/)** for introspection timing, catalog size metrics, and discovery event tracking

## Implementation Details

```elixir
defmodule PrismaticApi.Introspector do
  @moduledoc """
  Runtime introspection engine for automatic API surface discovery.
  Scans all Prismatic* facade modules and extracts public function
  signatures, typespecs, and documentation for OpenAPI generation.
  """

  use GenServer
  require Logger

  @ets_table :prismatic_api_catalog
  @rescan_interval :timer.minutes(5)

  @type endpoint :: %{
    module: module(),
    function: atom(),
    arity: non_neg_integer(),
    spec: term(),
    doc: String.t() | nil,
    schema: map()
  }

  @spec discover_all() :: {:ok, non_neg_integer()}
  def discover_all do
    modules = scan_prismatic_modules()
    endpoints = Enum.flat_map(modules, &extract_endpoints/1)

    Enum.each(endpoints, fn endpoint ->
      :ets.insert(@ets_table, {{endpoint.module, endpoint.function, endpoint.arity}, endpoint})
    end)

    {:ok, length(endpoints)}
  end

  @spec lookup(atom(), atom()) :: {:ok, [endpoint()]} | {:error, :not_found}
  def lookup(app, action) do
    case :ets.match_object(@ets_table, {{:_, action, :_}, :_}) do
      [] -> {:error, :not_found}
      results -> {:ok, Enum.map(results, &elem(&1, 1))}
    end
  end

  defp scan_prismatic_modules do
    :code.all_loaded()
    |> Enum.map(&elem(&1, 0))
    |> Enum.filter(&prismatic_facade?/1)
    |> Enum.sort()
  end

  defp prismatic_facade?(module) do
    name = Atom.to_string(module)
    String.starts_with?(name, "Elixir.Prismatic") and
      not String.contains?(name, [".Impl.", ".Private.", ".Internal."])
  end
end
```

## Type Mapping Reference

| Elixir Type | OpenAPI Schema | Notes |
|-------------|---------------|-------|
| `String.t()` | `{type: "string"}` | Direct mapping |
| `integer()` | `{type: "integer"}` | Direct mapping |
| `float()` | `{type: "number", format: "float"}` | Format annotation |
| `boolean()` | `{type: "boolean"}` | Direct mapping |
| `atom()` | `{type: "string", enum: [...]}` | Known atoms enumerated |
| `list(t)` | `{type: "array", items: schema(t)}` | Recursive mapping |
| `map()` | `{type: "object"}` | Generic object |
| `%Struct{}` | `{$ref: "#/components/schemas/Struct"}` | Schema reference |
| `t1 \| t2` | `{oneOf: [schema(t1), schema(t2)]}` | Union types |
| `keyword()` | `{type: "object"}` | Key-value pairs |

## API Dispatch Architecture

```
HTTP Request
    |
    v
DispatchController.call(app, action, params)
    |
    v
Introspector.lookup(app, action)
    |
    v
ETS Catalog --> {module, function, arity, spec}
    |
    v
TypeValidator.validate_params(params, spec)
    |
    v
safe_apply(module, function, validated_params)
    |
    v
JSON Response
```

## Discovery Statistics

| Metric | Value | Description |
|--------|-------|-------------|
| **Scanned Modules** | ~2,400 | Total Prismatic* modules evaluated |
| **Facade Modules** | ~180 | Public facade modules with exposed APIs |
| **Discovered Endpoints** | ~1,200 | Total public function endpoints |
| **Type-Mapped Specs** | ~1,100 | Endpoints with full OpenAPI schema |
| **Scan Duration** | <500ms | Full discovery cycle time |
| **Lookup Latency** | <1ms | ETS-cached endpoint resolution |

## Authority Level

**L3** - [Strategic Command](/glossary/strategic-command/) - Multi-domain coordination with authority to scan all platform modules, maintain the API catalog, and control which endpoints are exposed through the generic dispatch system.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/api rescan` | Trigger immediate full API surface rescan | L3+ |
| `/api endpoints` | List all discovered endpoints with metadata | L3+ |
| `/api spec` | Generate current OpenAPI 3.0 specification | L3+ |
| `/api status` | Display introspection health and catalog statistics | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [prismatic-supreme-commander](/agents/prismatic-supreme-commander/) | Strategic oversight of API surface evolution |
| [quality-gates-specialist](/agents/quality-gates-specialist/) | Validates that all exposed endpoints have proper typespecs and documentation |
| [route-testing-supreme](/agents/route-testing-supreme/) | Tests all discovered routes for correct dispatch and response formatting |

## Enforcement

API introspection operates under strict [NO MERCY](/glossary/no-mercy/) enforcement: modules without `@spec` annotations on public functions are flagged as non-compliant and excluded from the API catalog until specifications are added. The [NO DOUBTS](/glossary/no-doubts/) principle requires that every type mapping is verified for accuracy through round-trip validation. The [Trinity Gate](/glossary/trinity-gate/) validates the structural consistency of the generated OpenAPI specification, ensuring that all schema references resolve and all endpoint definitions are complete.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)