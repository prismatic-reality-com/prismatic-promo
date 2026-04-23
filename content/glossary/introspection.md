+++
title = "Introspection"
weight = 50
[extra]
tags = ["glossary", "api", "discovery", "automation", "elixir", "reflection", "openapi", "meta-programming"]
description = "Introspection is the capability of a software system to examine its own structure, types, modules, functions, and runtime state at compile-time or runtime, enabling automatic API discovery, documentation generation, schema validation, and self-describing interfaces without manual configuration."
category = "architecture"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "13 min"
difficulty = "advanced"
quality_score = 95
date_created = "2026-02-22"
date_updated = "2026-02-22"
related_terms = ["api-gateway", "openapi", "rest-api", "facade-modules", "typespec", "code-generation", "ast", "macro", "elixir", "documentation"]
aliases = ["reflection", "self-examination", "meta-inspection", "runtime-reflection"]
prerequisites = ["elixir", "api", "typespec"]
use_cases = ["api-discovery", "documentation-generation", "schema-validation", "sdk-generation"]
word_count = 1584
date_modified = "2026-02-23"
keywords = ["Introspection", "glossary", "architecture", "Prismatic Platform", "Elixir", "OpenAPI"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Introspection - Prismatic Platform"
+++

## Definition

**Introspection** is the capability of a software system to programmatically examine its own internal structure, including modules, functions, type specifications, documentation, dependencies, and runtime state. In programming language theory, introspection (often called reflection) allows code to inspect and reason about other code at compile-time or runtime. In platform architecture, introspection enables systems to automatically discover their own API surfaces, generate documentation, validate schemas, and adapt their behavior based on self-knowledge.

Introspection differs from simple configuration reading. Configuration tells a system what external parameters it should use; introspection tells a system what it is. A system with introspection can answer questions like "What functions do I expose?", "What types do my parameters expect?", "What documentation exists for this endpoint?", and "What dependencies exist between my modules?" -- all without any external configuration or manual annotation beyond the code itself.

## Overview

Introspection has deep roots in programming language design. Lisp introduced the concept in the 1960s with its homoiconic representation where code and data share the same structure. Smalltalk formalized reflection as a first-class language feature in the 1970s. Java brought reflection to mainstream programming in the 1990s, and modern languages like Elixir, Python, Ruby, and TypeScript all provide varying degrees of introspective capability.

In the context of platform engineering, introspection solves a fundamental maintenance problem: documentation drift. When API documentation is maintained separately from implementation, the two inevitably diverge over time. Manual documentation updates are forgotten, new endpoints go undocumented, and deprecated endpoints linger in documentation long after removal. Introspection eliminates this drift by deriving documentation directly from implementation.

The Elixir ecosystem is particularly well-suited for introspection because the BEAM virtual machine provides rich runtime access to module information, the language mandates structured documentation through `@moduledoc` and `@doc` attributes, the type specification system (`@spec`) provides machine-readable function signatures, and the Abstract Syntax Tree (AST) is accessible through macros and compile-time hooks. These features combine to make Elixir one of the most introspection-friendly languages in production use.

Within the Prismatic Platform, introspection is not merely a convenience feature but a core architectural principle. The auto-introspecting REST API gateway discovers all facade modules across 115 umbrella applications, extracts their public functions, maps Elixir type specifications to OpenAPI JSON Schema types, and exposes everything as a documented HTTP API -- with zero manual endpoint registration.

## Technical Details

### Elixir's Introspection Primitives

Elixir and the BEAM virtual machine provide several introspection mechanisms that operate at different levels of the system:

```elixir
defmodule Prismatic.Introspection.ModuleAnalyzer do
  @moduledoc """
  Analyzes Elixir modules using BEAM introspection primitives to extract
  function signatures, type specifications, documentation, and metadata.
  """

  @type function_info :: %{
    name: atom(),
    arity: non_neg_integer(),
    specs: [term()],
    doc: String.t() | nil,
    visibility: :public | :private
  }

  @type module_info :: %{
    module: module(),
    functions: [function_info()],
    moduledoc: String.t() | nil,
    behaviours: [module()],
    attributes: keyword()
  }

  @spec analyze(module()) :: {:ok, module_info()} | {:error, term()}
  def analyze(module) when is_atom(module) do
    with true <- Code.ensure_loaded?(module),
         {:ok, functions} <- extract_functions(module),
         {:ok, specs} <- extract_specs(module),
         {:ok, docs} <- extract_docs(module) do
      {:ok, %{
        module: module,
        functions: merge_function_info(functions, specs, docs),
        moduledoc: extract_moduledoc(docs),
        behaviours: extract_behaviours(module),
        attributes: extract_custom_attributes(module)
      }}
    else
      false -> {:error, {:module_not_loaded, module}}
      {:error, reason} -> {:error, reason}
    end
  end

  defp extract_functions(module) do
    public = module.__info__(:functions)
    macros = module.__info__(:macros)

    functions =
      Enum.map(public, fn {name, arity} ->
        %{name: name, arity: arity, visibility: :public, type: :function}
      end) ++
      Enum.map(macros, fn {name, arity} ->
        %{name: name, arity: arity, visibility: :public, type: :macro}
      end)

    {:ok, functions}
  end

  defp extract_specs(module) do
    case Code.Typespec.fetch_specs(module) do
      {:ok, specs} ->
        spec_map =
          Enum.reduce(specs, %{}, fn {{name, arity}, spec_list}, acc ->
            Map.put(acc, {name, arity}, spec_list)
          end)
        {:ok, spec_map}

      :error ->
        {:ok, %{}}
    end
  end

  defp extract_docs(module) do
    case Code.fetch_docs(module) do
      {:docs_v1, _annotation, _beam_lang, _format, moduledoc, _metadata, docs} ->
        {:ok, {moduledoc, docs}}

      {:error, reason} ->
        {:error, {:docs_unavailable, reason}}
    end
  end

  defp extract_moduledoc({%{"en" => doc}, _docs}), do: doc
  defp extract_moduledoc({:none, _docs}), do: nil
  defp extract_moduledoc({:hidden, _docs}), do: nil
  defp extract_moduledoc(_), do: nil

  defp extract_behaviours(module) do
    module.module_info(:attributes)
    |> Keyword.get_values(:behaviour)
    |> List.flatten()
  end

  defp extract_custom_attributes(module) do
    module.module_info(:attributes)
    |> Keyword.drop([:vsn, :behaviour, :compile])
  end

  defp merge_function_info(functions, specs, {_moduledoc, docs}) do
    doc_map =
      Enum.reduce(docs, %{}, fn
        {{:function, name, arity}, _annotation, _signature, doc, _metadata}, acc ->
          doc_text = case doc do
            %{"en" => text} -> text
            :none -> nil
            :hidden -> nil
            _ -> nil
          end
          Map.put(acc, {name, arity}, doc_text)

        _other, acc ->
          acc
      end)

    Enum.map(functions, fn func ->
      key = {func.name, func.arity}
      %{
        name: func.name,
        arity: func.arity,
        visibility: func.visibility,
        specs: Map.get(specs, key, []),
        doc: Map.get(doc_map, key)
      }
    end)
  end
end
```

### Type Specification to Schema Mapping

A critical introspection capability is translating Elixir's type specifications into external schema formats. This enables automatic OpenAPI specification generation:

```elixir
defmodule Prismatic.Introspection.TypeMapper do
  @moduledoc """
  Maps Elixir @spec type AST nodes to OpenAPI JSON Schema types.
  Handles primitives, compound types, custom types, and unions.
  """

  @spec elixir_type_to_json_schema(term()) :: map()
  def elixir_type_to_json_schema({:type, _, :integer, []}),
    do: %{"type" => "integer"}

  def elixir_type_to_json_schema({:type, _, :float, []}),
    do: %{"type" => "number", "format" => "float"}

  def elixir_type_to_json_schema({:type, _, :binary, []}),
    do: %{"type" => "string"}

  def elixir_type_to_json_schema({:type, _, :boolean, []}),
    do: %{"type" => "boolean"}

  def elixir_type_to_json_schema({:type, _, :atom, []}),
    do: %{"type" => "string", "description" => "Elixir atom as string"}

  def elixir_type_to_json_schema({:type, _, :list, [inner_type]}),
    do: %{"type" => "array", "items" => elixir_type_to_json_schema(inner_type)}

  def elixir_type_to_json_schema({:type, _, :map, fields}) do
    properties =
      Enum.reduce(fields, %{}, fn
        {:type, _, :map_field_exact, [{:atom, _, key}, value_type]}, acc ->
          Map.put(acc, Atom.to_string(key), elixir_type_to_json_schema(value_type))

        _other, acc ->
          acc
      end)

    %{"type" => "object", "properties" => properties}
  end

  def elixir_type_to_json_schema({:type, _, :union, types}) do
    schemas = Enum.map(types, &elixir_type_to_json_schema/1)
    %{"oneOf" => schemas}
  end

  def elixir_type_to_json_schema(_unknown),
    do: %{"type" => "string", "description" => "Unknown type mapped to string"}
end
```

### Compile-Time Introspection with Macros

Elixir's macro system enables compile-time introspection, where modules can examine their own structure during compilation and generate additional code based on what they find:

```elixir
defmodule Prismatic.Introspection.AutoDocument do
  @moduledoc """
  Compile-time introspection macro that automatically generates
  a __api_surface__/0 function listing all documented public functions.
  """

  defmacro __before_compile__(env) do
    functions =
      env.module
      |> Module.definitions_in(:def)
      |> Enum.map(fn {name, arity} ->
        doc = Module.get_attribute(env.module, :doc)
        specs = Module.get_attribute(env.module, :spec)
        {name, arity, doc, specs}
      end)

    quote do
      def __api_surface__ do
        unquote(Macro.escape(functions))
      end
    end
  end
end
```

## Implementation

### Step 1: Module Discovery

The introspection pipeline begins with discovering which modules should be examined. In an umbrella application, this means scanning all loaded applications for modules that match specific naming conventions or implement specific behaviours:

```elixir
defmodule Prismatic.Introspection.Discovery do
  @moduledoc """
  Discovers introspectable modules across the umbrella application.
  Filters for facade modules that should be exposed as API endpoints.
  """

  @facade_prefix "Prismatic"
  @excluded_patterns [~r/\.Test\./, ~r/\.Support\./, ~r/\.Fixture\./]

  @spec discover_facades() :: [module()]
  def discover_facades do
    :code.all_loaded()
    |> Enum.map(fn {module, _path} -> module end)
    |> Enum.filter(&facade_module?/1)
    |> Enum.reject(&excluded_module?/1)
    |> Enum.sort()
  end

  defp facade_module?(module) do
    module
    |> Atom.to_string()
    |> String.starts_with?("Elixir.#{@facade_prefix}")
  end

  defp excluded_module?(module) do
    module_string = Atom.to_string(module)
    Enum.any?(@excluded_patterns, &Regex.match?(&1, module_string))
  end
end
```

### Step 2: Build API Registry

Discovered modules are analyzed and their API surfaces are registered in an ETS table for fast runtime lookup:

```elixir
defmodule Prismatic.Introspection.Registry do
  @moduledoc """
  ETS-backed registry of introspected API endpoints.
  Populated at boot time and refreshable on demand.
  """
  use GenServer

  @table_name :api_registry

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    table = :ets.new(@table_name, [:set, :named_table, read_concurrency: true])
    populate_registry(table)
    {:ok, %{table: table}}
  end

  def lookup(app, action) do
    case :ets.lookup(@table_name, {app, action}) do
      [{_key, endpoint}] -> {:ok, endpoint}
      [] -> {:error, :not_found}
    end
  end

  defp populate_registry(table) do
    Prismatic.Introspection.Discovery.discover_facades()
    |> Enum.each(fn module ->
      case Prismatic.Introspection.ModuleAnalyzer.analyze(module) do
        {:ok, info} ->
          register_module_functions(table, info)

        {:error, _reason} ->
          :skip
      end
    end)
  end

  defp register_module_functions(table, module_info) do
    app = derive_app_name(module_info.module)

    Enum.each(module_info.functions, fn func ->
      endpoint = %{
        module: module_info.module,
        function: func.name,
        arity: func.arity,
        specs: func.specs,
        doc: func.doc
      }

      :ets.insert(table, {{app, func.name}, endpoint})
    end)
  end

  defp derive_app_name(module) do
    module
    |> Module.split()
    |> Enum.at(0, "unknown")
    |> Macro.underscore()
    |> String.to_atom()
  end
end
```

### Step 3: Generate OpenAPI Specification

The registry contents are transformed into a complete OpenAPI 3.0 specification that can be served to API consumers and rendered by Swagger UI.

### Step 4: Runtime Dispatch

Incoming HTTP requests are dispatched to the appropriate Elixir function using the registry, with automatic parameter coercion based on introspected type specifications.

## Comparison

| Aspect | Elixir Introspection | Java Reflection | Python Inspection | TypeScript Decorators |
|--------|---------------------|----------------|------------------|---------------------|
| **Type information** | @spec + Code.Typespec | Runtime generics erased | Runtime type hints | Compile-time only (without reflect-metadata) |
| **Documentation** | @doc + Code.fetch_docs | JavaDoc (external) | Docstrings (runtime) | TSDoc (external) |
| **Module discovery** | :code.all_loaded | ClassLoader scanning | importlib + pkgutil | Manual registration |
| **Compile-time** | Macros + __before_compile__ | Annotation processing | Metaclasses | Decorators |
| **Runtime cost** | Minimal (ETS cached) | Moderate (reflection API) | Low (attribute access) | N/A (compile-time) |
| **Safety** | Pattern matching guards | SecurityManager | Unrestricted | Type-safe at compile |

### Introspection vs. Configuration-Driven Discovery

Configuration-driven API discovery (as used by many REST frameworks) requires developers to explicitly register each endpoint in a routing file or configuration object. Introspection-based discovery eliminates this step entirely. The trade-off is that configuration-driven approaches are more explicit and predictable, while introspection-based approaches are more maintainable and eliminate documentation drift. The Prismatic Platform chooses introspection because the 115 umbrella applications would make manual registration impractical.

### Introspection vs. Code Generation

Code generation tools (like protobuf, Thrift, or OpenAPI codegen) produce source code from schema definitions. Introspection works in the opposite direction: it derives schemas from source code. Code generation ensures schema-first consistency; introspection ensures implementation-first accuracy. Both approaches have valid use cases, and they can be combined -- generate server stubs from a schema, then use introspection to verify the implementation matches the schema.

## Best Practices

1. **Invest in type specifications**: Introspection is only as good as the metadata available. Every public function should have a `@spec` annotation. Every module should have `@moduledoc` and `@doc` attributes. This investment pays dividends through automatic documentation, validation, and SDK generation.

2. **Cache introspection results**: Module analysis is computationally inexpensive but not free. Perform introspection once at boot time and cache results in ETS. Provide a mechanism to refresh the cache when modules are hot-reloaded.

3. **Define clear API boundaries**: Not every public function should be exposed through introspection. Use naming conventions (facade modules), behaviours, or custom module attributes to mark which modules are intended for external consumption.

4. **Handle missing metadata gracefully**: Not all modules will have complete type specifications or documentation. The introspection system should degrade gracefully, providing partial information rather than failing entirely.

5. **Version your introspected API**: Introspection discovers the current state of the API. Combine it with versioning strategies to maintain backward compatibility when the underlying implementation changes.

6. **Test the introspection layer**: Write tests that verify the introspection system correctly discovers and maps your API surface. This catches issues where type specifications are incorrect or documentation is missing.

7. **Secure the introspection endpoint**: The API surface information discovered through introspection may reveal implementation details. Apply authentication and authorization to introspection endpoints in production.

8. **Combine with runtime validation**: Use introspected type information not only for documentation but also for runtime request validation, ensuring incoming parameters match expected types.

## Common Pitfalls

1. **Over-exposing internals**: Introspecting all modules without filtering exposes internal implementation details that should not be part of the public API. Always apply inclusion/exclusion filters.

2. **Stale caches**: If modules are recompiled or hot-reloaded but the introspection cache is not refreshed, the API surface becomes inconsistent with the actual implementation.

3. **Complex type mapping failures**: Elixir's type system supports complex constructs (recursive types, parameterized types, opaque types) that may not map cleanly to JSON Schema. Have fallback strategies for unmappable types.

4. **Performance regression from excessive reflection**: Runtime introspection on every request (rather than cached at boot) can introduce measurable latency. Always cache.

5. **Assuming documentation completeness**: Not all developers write comprehensive `@doc` attributes. The introspection system should work with incomplete documentation rather than requiring perfection.

6. **Ignoring private function leakage**: Elixir's `__info__/1` only returns public functions, but some introspection techniques using module attributes or AST analysis might inadvertently expose private function details.

7. **Breaking changes through introspection**: Because the API surface is derived from code, any change to a function signature automatically changes the API. This can cause unintended breaking changes for API consumers.

## Use Cases

### Auto-Introspecting REST API Gateway

The primary use case in the Prismatic Platform: a generic API gateway that discovers all facade modules at boot time, maps their functions to HTTP endpoints, generates OpenAPI documentation, and serves a Swagger UI -- all without a single line of manual endpoint registration.

### GraphQL Schema Generation

Introspecting Elixir modules to automatically generate GraphQL type definitions and resolvers, eliminating the need to maintain separate schema files that must be kept in sync with business logic.

### SDK Generation

Using introspected API surfaces to generate client SDKs in multiple languages. The type specifications provide parameter and return types, the documentation provides descriptions, and the module structure provides namespace organization.

### Compliance Auditing

Introspecting a codebase to verify that all public APIs have documentation, type specifications, and security annotations. This supports regulatory compliance requirements for API documentation completeness.

### Dependency Mapping

Using introspection to build a complete dependency graph between modules, showing which modules call which other modules, what data types flow between them, and where coupling exists.

## Related Concepts

Introspection connects to many fundamental concepts in software architecture and programming language design:

- [API Gateway](/glossary/api-gateway/) -- the infrastructure pattern that benefits most directly from introspection-based endpoint discovery
- [OpenAPI](/glossary/openapi/) -- the specification format that introspection systems generate to describe discovered API surfaces
- [TypeSpec](/glossary/typespec/) -- Elixir's type specification system that provides the machine-readable function signatures introspection relies on
- [AST](/glossary/ast/) -- the Abstract Syntax Tree that enables compile-time introspection through macro analysis
- [Macro](/glossary/macro/) -- Elixir's metaprogramming mechanism used for compile-time code examination and generation
- [Code Generation](/glossary/code-generation/) -- the complementary approach of generating code from schemas, opposite to introspection's schema-from-code
- [Facade Modules](/glossary/facade-modules/) -- the architectural pattern defining which modules are discoverable through introspection
- [REST API](/glossary/rest-api/) -- the HTTP interface pattern that introspection automatically populates with discovered endpoints
- [Documentation](/glossary/documentation/) -- the output artifact that introspection keeps synchronized with implementation
- [Schema](/glossary/schema/) -- the structured data descriptions derived from type specifications through introspection

## See Also

- [Prismatic API](/glossary/prismatic-api/) -- the auto-introspecting REST API gateway that implements these introspection patterns
- [Swagger UI](/glossary/swagger-ui/) -- the interactive API documentation interface powered by introspected OpenAPI specifications
- [Elixir](/glossary/elixir/) -- the programming language providing the introspection primitives used throughout the platform
- [GraphQL](/glossary/graphql/) -- an alternative API paradigm with built-in introspection capabilities
- [Dialyzer](/glossary/dialyzer/) -- the static analysis tool that leverages type specifications for consistency checking

---

*[Prismatic Platform](https://github.com/korczis/prismatic-platform) is an open-source intelligent platform built with Elixir/OTP. Created by [Tomas Korcak (korczis)](https://github.com/korczis). Licensed under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE).*
