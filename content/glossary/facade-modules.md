+++
title = "Facade Modules"
weight = 50
[extra]
tags = ["glossary", "architecture", "design-pattern", "api", "elixir", "modularity", "abstraction", "otp"]
description = "Facade modules are top-level interface modules that provide a simplified, unified API for complex subsystems, hiding internal implementation details while exposing a clean public contract for external consumers."
category = "architecture"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "13 min"
difficulty = "intermediate"
quality_score = 95
date_created = "2026-02-22"
date_updated = "2026-02-22"
related_terms = ["adapter-pattern", "api-gateway", "modularity", "composability", "bounded-context", "dependency-injection", "protocol", "behaviour", "introspection", "openapi"]
key_takeaway = "Facade modules provide a stable, simplified public API that decouples consumers from internal implementation complexity, enabling independent evolution of subsystems while maintaining backward compatibility."
version = "2.0.0"
word_count = 1966
date_modified = "2026-02-23"
keywords = ["Facade", "Modules", "glossary", "architecture", "Prismatic Platform", "Step"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Facade Modules - Prismatic Platform"
+++

## Definition

A facade module is a top-level interface that provides a simplified, unified API to a complex subsystem. It sits at the boundary between a module's public contract and its internal implementation, routing calls to appropriate internal modules while presenting a clean, minimal surface area to external consumers. The facade pattern originates from the Gang of Four design patterns catalog but takes on particular significance in Elixir umbrella applications where each app needs a clear entry point.

In the Prismatic Platform, facade modules serve as the canonical access points for each umbrella application. Rather than requiring consumers to understand the internal module hierarchy of an application (which may contain dozens of modules organized across multiple directories), the facade module exposes a curated set of public functions that represent the application's capabilities. All auto-discovery, API generation, and documentation systems operate through these facade interfaces.

## Overview

The facade pattern solves a fundamental problem in large-scale software systems: as complexity grows, the number of internal modules, their interdependencies, and their individual APIs become overwhelming for consumers. Without facades, a caller must understand which specific internal module handles a particular operation, what its function signatures are, and what preconditions must be satisfied. This creates tight coupling between the consumer and the implementation, making refactoring dangerous and onboarding expensive.

A facade module addresses this by providing a single module that consumers interact with. The facade delegates calls to the appropriate internal modules, translates between public and internal data representations, validates inputs, and handles cross-cutting concerns like telemetry emission and error normalization. The internal modules can be freely reorganized, renamed, or replaced without affecting any consumer -- as long as the facade's public API remains stable.

### The Facade in Elixir's Ecosystem

Elixir's module system and functional nature make facades particularly natural. Since Elixir modules are just namespaces for functions (with no instantiation or inheritance), a facade module is simply a module that delegates to other modules. There are no framework requirements, no base classes to extend, and no configuration files to maintain. The facade is "just code."

However, Elixir adds several powerful mechanisms that enhance the facade pattern:

1. **Behaviours**: A facade can implement a behaviour that defines its contract, enabling compile-time verification that all required functions are implemented.

2. **Protocols**: For polymorphic operations, the facade can dispatch through protocols, allowing new implementations to be added without modifying the facade.

3. **Module attributes and @doc**: The facade serves as the documentation hub, with comprehensive @moduledoc and @doc annotations that describe the public API.

4. **Introspection**: Elixir's Code module can enumerate a module's functions, types, and documentation at runtime, enabling automatic API discovery.

### Why Facades Matter in Umbrella Applications

In the Prismatic Platform's 115-app umbrella architecture, facades are not optional -- they are mandatory. Each umbrella app must expose its capabilities through a single top-level facade module (e.g., `PrismaticPerimeter`, `PrismaticStorage`, `PrismaticAgents`). This convention enables several platform-wide capabilities:

- **Auto-introspecting REST API**: The `prismatic_api` app scans all `Prismatic*` facade modules at boot time, discovers their public functions via `Module.__info__/1` and `Code.fetch_docs/1`, and automatically generates REST endpoints for each function.

- **OpenAPI specification**: Function typespecs from facade modules are automatically translated into OpenAPI 3.0 schemas, producing a complete API specification without manual annotation.

- **Dependency management**: Umbrella apps declare dependencies on other apps' facade modules, creating explicit, auditable dependency graphs.

- **Testing boundaries**: Integration tests validate the facade contract; unit tests validate internal modules. This separation keeps the test suite maintainable as the system grows.

## Technical Details

### Anatomy of a Prismatic Facade Module

```elixir
defmodule PrismaticPerimeter do
  @moduledoc """
  Facade module for External Attack Surface Management (EASM).

  Provides a unified API for asset discovery, security rating,
  compliance assessment, and vulnerability tracking. All EASM
  operations should be accessed through this module rather than
  directly calling internal modules.

  ## Examples

      iex> PrismaticPerimeter.discover("example.com")
      {:ok, %{assets: [...], scan_duration_ms: 1234}}

      iex> PrismaticPerimeter.security_rating("example.com")
      {:ok, %{grade: :B, score: 780, industry_percentile: 72}}
  """

  alias PrismaticPerimeter.{
    AssetDiscovery,
    ComplianceAssessor,
    RiskScorer,
    SecurityRating,
    VulnerabilityTracker
  }

  @doc """
  Discovers the external attack surface for a given domain.
  Scans DNS records, certificate transparency logs, IP ranges,
  cloud resources, and exposed services.
  """
  @spec discover(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def discover(domain, opts \\ []) do
    with {:ok, domain} <- validate_domain(domain),
         {:ok, assets} <- AssetDiscovery.scan(domain, opts) do
      emit_telemetry(:discover, %{domain: domain, asset_count: length(assets)})
      {:ok, %{assets: assets, domain: domain}}
    end
  end

  @doc """
  Calculates a security rating (A-F) for the given domain
  based on discovered assets and their security posture.
  """
  @spec security_rating(String.t()) :: {:ok, map()} | {:error, term()}
  def security_rating(domain) do
    with {:ok, domain} <- validate_domain(domain),
         {:ok, assets} <- AssetDiscovery.cached_scan(domain),
         {:ok, rating} <- SecurityRating.calculate(assets) do
      {:ok, rating}
    end
  end

  @doc """
  Assesses compliance against specified frameworks.
  Supported frameworks: :nis2, :zkb, :gdpr, :iso27001
  """
  @spec assess_compliance(String.t(), [atom()]) :: {:ok, map()} | {:error, term()}
  def assess_compliance(domain, frameworks) when is_list(frameworks) do
    with {:ok, domain} <- validate_domain(domain),
         {:ok, assets} <- AssetDiscovery.cached_scan(domain),
         {:ok, assessment} <- ComplianceAssessor.assess(assets, frameworks) do
      {:ok, assessment}
    end
  end

  @spec risk_score(String.t()) :: {:ok, float()} | {:error, term()}
  def risk_score(domain) do
    with {:ok, domain} <- validate_domain(domain),
         {:ok, vulns} <- VulnerabilityTracker.current_vulnerabilities(domain),
         {:ok, score} <- RiskScorer.calculate(vulns) do
      {:ok, score}
    end
  end

  defp validate_domain(domain) when is_binary(domain) and byte_size(domain) > 0 do
    {:ok, String.downcase(String.trim(domain))}
  end

  defp validate_domain(_), do: {:error, :invalid_domain}

  defp emit_telemetry(operation, metadata) do
    :telemetry.execute(
      [:prismatic_perimeter, :facade, operation],
      %{timestamp: System.monotonic_time()},
      metadata
    )
  end
end
```

### Key Design Principles

The facade module above illustrates several critical design principles:

**Input validation at the boundary.** The facade validates all inputs before delegating to internal modules. Internal modules can assume their inputs are already validated, simplifying their logic.

**Consistent return types.** Every public function returns `{:ok, result} | {:error, reason}`. This consistency enables pipeline composition and predictable error handling.

**Telemetry emission.** Cross-cutting concerns like telemetry are handled at the facade level rather than being scattered across internal modules.

**Aliased internal modules.** The facade's alias block serves as a manifest of its internal dependencies, making the relationship between the facade and its implementation explicit.

**Comprehensive documentation.** Each public function has `@doc` with usage examples. The `@moduledoc` explains the module's purpose and provides quick-start examples.

### Auto-Discovery Through Facades

The Prismatic API's auto-discovery mechanism relies on facade module conventions:

```elixir
defmodule PrismaticApi.Scanner do
  @moduledoc """
  Scans all Prismatic* facade modules at boot time,
  discovering public functions and their type specifications
  for automatic REST API generation.
  """

  @spec discover_facades() :: [module()]
  def discover_facades do
    :code.all_loaded()
    |> Enum.map(fn {mod, _} -> mod end)
    |> Enum.filter(&facade_module?/1)
  end

  @spec discover_endpoints(module()) :: [map()]
  def discover_endpoints(facade_module) do
    facade_module.__info__(:functions)
    |> Enum.reject(fn {name, _} -> hidden_function?(name) end)
    |> Enum.map(fn {name, arity} ->
      %{
        module: facade_module,
        function: name,
        arity: arity,
        spec: fetch_spec(facade_module, name, arity),
        docs: fetch_docs(facade_module, name, arity)
      }
    end)
  end

  defp facade_module?(mod) do
    mod_string = Atom.to_string(mod)
    String.starts_with?(mod_string, "Elixir.Prismatic") and
      not String.contains?(mod_string, ".")
  end

  defp hidden_function?(name) do
    String.starts_with?(Atom.to_string(name), "_")
  end

  defp fetch_spec(mod, name, arity) do
    case Code.Typespec.fetch_specs(mod) do
      {:ok, specs} ->
        Enum.find(specs, fn {{n, a}, _} -> n == name and a == arity end)

      :error ->
        nil
    end
  end

  defp fetch_docs(mod, name, arity) do
    case Code.fetch_docs(mod) do
      {:docs_v1, _, _, _, _, _, docs} ->
        Enum.find_value(docs, fn
          {{:function, ^name, ^arity}, _, _, %{"en" => doc}, _} -> doc
          _ -> nil
        end)

      _ ->
        nil
    end
  end
end
```

## Implementation

### Building a Facade Module: Step by Step

**Step 1: Define the public contract.** Before writing any code, enumerate the operations that external consumers need. Each operation becomes a public function on the facade. Resist the temptation to expose every internal function -- the facade's value comes from its selectivity.

**Step 2: Implement internal modules first.** Build the internal logic in focused, single-responsibility modules. These modules handle the actual computation and can be freely organized by domain concept.

**Step 3: Write the facade as a thin delegation layer.** The facade should contain minimal logic -- primarily input validation, error normalization, telemetry emission, and delegation. If the facade contains significant business logic, it is a sign that an internal module is missing.

**Step 4: Add comprehensive typespecs.** Every public function must have a `@spec`. These specs serve triple duty: they document the API, enable Dialyzer verification, and power the auto-discovery API generation.

**Step 5: Write integration tests against the facade.** Test the facade's public API as a black box. These tests form the contract that protects consumers from internal refactoring.

**Step 6: Register the facade.** In the Prismatic Platform, facade modules are automatically discovered by naming convention (`Prismatic*`). No manual registration is needed.

### Facade Evolution Strategies

As an application grows, its facade must evolve without breaking consumers. Several strategies support this:

**Deprecation annotations**: Mark functions as deprecated using `@deprecated` before removing them. This gives consumers a migration window.

**Version-namespaced facades**: For breaking changes, introduce `PrismaticPerimeterV2` alongside the original, allowing gradual migration.

**Optional parameters**: Extend existing functions with optional keyword lists rather than adding new functions with different arities.

**Internal routing**: When an internal module is split or reorganized, update the facade's delegation targets without changing its public API.

## Comparison

### Facade vs. Related Patterns

| Pattern | Purpose | Key Difference from Facade |
|---------|---------|---------------------------|
| **Facade** | Simplifies complex subsystem access | Provides a new, simpler interface |
| **Adapter** | Converts one interface to another | Adapts an existing interface to match an expected one |
| **Proxy** | Controls access to an object | Same interface as the target, adds access control |
| **Mediator** | Centralizes complex interactions | Manages bidirectional communication between components |
| **Gateway** | Provides entry point to remote system | Focuses on network boundary crossing |
| **API Module** | Defines public API contract | Often synonymous with facade in Elixir |

### When to Use a Facade vs. Direct Access

| Scenario | Recommendation |
|----------|---------------|
| Consumer is in a different umbrella app | Always use facade |
| Consumer is in the same umbrella app | Use facade for public operations, direct access for internal coordination |
| Consumer is an external API client | Always use facade (via API gateway) |
| Consumer is a test module | Use facade for integration tests, direct access for unit tests |
| Performance-critical hot path | Consider direct access if facade overhead is measurable (rare) |

## Best Practices

1. **One facade per umbrella app.** Each app should have exactly one top-level facade module. Multiple facades fragment the API and confuse consumers. If an app needs multiple entry points, use sub-modules under the facade namespace.

2. **Keep facades thin.** A facade function should be 5-15 lines at most: validate, delegate, transform, emit telemetry. If a facade function exceeds 20 lines, extract the logic into an internal module.

3. **Never expose internal types in the facade API.** The facade's public types should be self-contained and not require consumers to alias internal modules. Return maps or well-documented structs defined at the facade level.

4. **Validate all inputs at the facade boundary.** Internal modules should be able to trust their inputs. This is the single-point-of-validation principle: validate once, at the edge.

5. **Use consistent error tuples.** Every facade function should return `{:ok, result} | {:error, reason}`. Never raise exceptions from facade functions (use bang variants if needed: `discover!/1`).

6. **Document with examples.** Every public function should have at least one example in its `@doc`. These examples are both documentation and testable via doctests.

7. **Emit telemetry from the facade.** Centralize observability instrumentation in the facade rather than scattering it across internal modules.

8. **Write a comprehensive @moduledoc.** The facade's module documentation is the first thing a new developer reads. Include purpose, quick-start examples, and architectural context.

## Pitfalls

### Common Facade Anti-Patterns

1. **The God Facade.** A facade that exposes hundreds of functions because "everything should be accessible." This defeats the pattern's purpose. A facade should expose 10-30 functions representing the app's core operations.

2. **The Leaky Facade.** A facade that exposes internal data structures, requiring consumers to understand the internal module hierarchy. Always translate internal representations to public types at the facade boundary.

3. **The Logic Facade.** A facade that contains significant business logic rather than delegating to internal modules. This creates a monolithic module that is difficult to test and maintain.

4. **The Forgotten Facade.** A facade that was created initially but not updated as the application evolved. New features are added to internal modules but never exposed through the facade, leading consumers to bypass it.

5. **The Inconsistent Facade.** A facade where some functions return `{:ok, result}`, others return raw values, and others raise exceptions. Inconsistency forces consumers to handle each function differently.

6. **The Transparent Facade.** A facade that simply re-exports internal module functions via `defdelegate`. While technically correct, this provides no input validation, error normalization, or telemetry -- missing the facade's key responsibilities.

7. **The Coupled Facade.** A facade that depends on other facade modules' internal details rather than going through their public APIs. This creates hidden coupling that undermines the isolation that facades are meant to provide.

## Use Cases

### Platform-Specific Applications

**Auto-Introspecting REST API.** The `prismatic_api` application discovers all facade modules at boot time, extracts their public functions and typespecs, and generates REST endpoints automatically. Without the facade convention, automatic API generation would be impossible -- the scanner would not know which modules represent public interfaces.

**SDK Generation.** The platform's SDK packages (Prismatic SDK, Plugin Kit) are generated from facade module contracts. Each public function becomes an SDK method with typed parameters derived from the facade's typespecs.

**Cross-App Communication.** When `prismatic_web` needs to display security ratings, it calls `PrismaticPerimeter.security_rating/1` -- the facade. It never imports or calls `PrismaticPerimeter.SecurityRating.calculate/1` directly. This means the Perimeter team can completely restructure their internal modules without affecting the web dashboard.

**Documentation Generation.** The platform's documentation system extracts `@moduledoc` and `@doc` from facade modules to generate API reference documentation. The facade is literally the source of truth for what an application does.

**Quality Enforcement.** The platform's quality gates verify that every umbrella app has a facade module with complete typespecs, documentation, and test coverage. Missing facade documentation is a quality gate violation that blocks the commit.

## Related Concepts

Facade modules connect to several architectural concepts in the Prismatic Platform:

- [Adapter Pattern](/glossary/adapter-pattern/) converts between interfaces, often used internally by facade modules to integrate multiple data sources
- [API Gateway](/glossary/api-gateway/) sits in front of facade modules, providing authentication, rate limiting, and routing for HTTP access
- [Modularity](/glossary/modularity/) is the design principle that facades enforce by creating clear module boundaries
- [Composability](/glossary/composability/) is enabled by facade modules that provide clean, composable function signatures
- [Bounded Context](/glossary/bounded-context/) from Domain-Driven Design maps directly to facade module boundaries in the umbrella architecture
- [Dependency Injection](/glossary/dependency-injection/) can be applied at the facade level to make subsystem dependencies configurable
- [Protocol](/glossary/protocol/) defines polymorphic interfaces that facade modules can leverage for extensible dispatch
- [Behaviour](/glossary/behaviour/) defines contracts that facade modules implement for compile-time verification
- [Introspection](/glossary/introspection/) enables runtime discovery of facade module capabilities for auto-API generation
- [OpenAPI](/glossary/openapi/) specifications are automatically generated from facade module typespecs

## See Also

- [Umbrella Application](/glossary/umbrella-application/) -- the project structure where facade modules are most critical
- [Prismatic API](/glossary/prismatic-api/) -- the auto-introspecting REST API built on facade module conventions
- [Typespec](/glossary/typespec/) -- the type specification system that powers facade API contracts
- [Domain-Driven Design](/glossary/domain-driven-design/) -- the architectural philosophy that motivates facade boundaries
- [Layered Architecture](/glossary/layered-architecture/) -- the structural pattern where facades form the outermost layer

---

**Connect & Contribute**: Facade modules are the backbone of the Prismatic Platform's API architecture. Visit the [Prismatic Platform repository](https://github.com/korczis/prismatic-platform) to explore facade implementations across 115 umbrella apps, review the auto-introspecting API system, or connect with the community through [GitHub Discussions](https://github.com/korczis/prismatic-platform/discussions). Created by [Tomas Korcak (korczis)](https://github.com/korczis).
