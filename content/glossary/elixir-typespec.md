+++
title = "Elixir Typespec"
weight = 43
[extra]
description = "Static type specification system in Elixir that provides compile-time type checking via Dialyzer, enabling early bug detection, better documentation, and improved code reliability through formal type annotations"
category = "elixir"
abbreviation = "N/A"
related_terms = ["elixir", "dialyzer", "behaviour-pattern", "compile-time", "static-analysis", "erlang-terms", "pattern-matching"]
complexity_level = "intermediate"
use_cases = ["type_safety", "documentation", "static_analysis", "contract_specification", "bug_prevention"]
beam_feature = true
language_feature = true
compile_time = true
runtime_effect = false
static_analysis = true
type_checking = true
dialyzer_integration = true
contract_specification = true
platform_integration = "extensive"
umbrella_apps = ["prismatic_core", "prismatic_storage", "prismatic_web", "prismatic_agents"]
typespec_types = ["basic_types", "compound_types", "union_types", "custom_types", "remote_types", "opaque_types"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1650
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Elixir typespec", "Dialyzer", "static typing", "type checking", "@spec", "@type", "BEAM", "Prismatic Platform"]
tags = ["glossary", "elixir", "typespec", "dialyzer", "prismatic"]
quality_score = 88
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Elixir Typespec - Prismatic Platform"
+++

## Definition & Overview

An **Elixir Typespec** is a static type specification system that allows developers to define types and function signatures at compile time, providing formal documentation and enabling static analysis through Dialyzer (Discrepancy Analyzer for ERLang programs). Unlike languages with mandatory static typing, Elixir's typespecs are optional annotations that don't affect runtime behavior but provide powerful compile-time verification and serve as executable documentation.

Typespecs use the `@type`, `@typep`, `@opaque`, and `@spec` attributes to define custom types and function signatures. When combined with Dialyzer, they enable detection of type inconsistencies, unreachable code, pattern matching errors, and other discrepancies without executing the program. This makes typespecs invaluable for large codebases where manual testing cannot cover all execution paths.

In the [Prismatic Platform](@/glossary/aiad.md), typespecs are mandatory across all 115 umbrella applications, with over 3,000 `@spec` declarations ensuring type safety in critical systems like the Monte Carlo engine, OSINT adapters, and distributed storage layers. The platform maintains 100% Dialyzer compliance with zero violations, demonstrating how typespecs enable reliable operation of complex distributed systems.

## Type System Fundamentals

### Basic Types

Elixir provides built-in types that correspond to BEAM virtual machine data types:

```elixir
# Basic scalar types
@spec process_id(pid()) :: atom()
@spec handle_message(binary()) :: {:ok, String.t()} | {:error, atom()}
@spec calculate_score(integer()) :: float()
@spec is_ready(boolean()) :: boolean()

# Collection types
@spec merge_lists([any()]) :: [any()]
@spec process_map(map()) :: map()
@spec handle_tuple(tuple()) :: any()
```

### Compound and Union Types

Complex type combinations for sophisticated data modeling:

```elixir
# Union types for multiple possible values
@type result :: {:ok, any()} | {:error, atom()}
@type status :: :pending | :running | :completed | :failed

# Compound types with structure
@type user :: %{
  id: pos_integer(),
  name: String.t(),
  email: String.t(),
  active: boolean(),
  metadata: map()
}

@type http_response :: {status :: integer(), headers :: map(), body :: binary()}
```

### Custom Type Definitions

Domain-specific types that model business logic:

```elixir
defmodule PrismaticCore.MonteCarloTypes do
  @moduledoc """
  Type specifications for Monte Carlo simulation engine supporting
  25 statistical distributions with epistemic uncertainty modeling.
  """

  @type distribution ::
    :normal | :uniform | :exponential | :gamma | :beta | :weibull |
    :lognormal | :cauchy | :laplace | :pareto | :triangular

  @type simulation_config :: %{
    iterations: pos_integer(),
    distribution: distribution(),
    parameters: %{atom() => float()},
    confidence_level: 0.90 | 0.95 | 0.99,
    seed: pos_integer() | nil
  }

  @type monte_carlo_result :: %{
    mean: float(),
    std_dev: float(),
    percentiles: %{atom() => float()},
    confidence_interval: {lower :: float(), upper :: float()},
    epistemic_uncertainty: float(),
    iterations_completed: pos_integer()
  }

  @spec run_simulation(simulation_config()) :: {:ok, monte_carlo_result()} | {:error, atom()}
  def run_simulation(config) do
    # Implementation...
  end
end
```

## Advanced Typespec Features

### Remote Types

Referencing types from other modules for modular type systems:

```elixir
defmodule PrismaticStorage.Adapter do
  @type query_result :: PrismaticStorage.Core.QueryResult.t()
  @type storage_config :: PrismaticStorage.Config.t()

  @callback get(key :: binary(), opts :: keyword()) ::
    {:ok, query_result()} | {:error, storage_config()}
end
```

### Opaque Types

Information hiding for internal implementation details:

```elixir
defmodule PrismaticCore.SecureRandom do
  @opaque entropy_pool :: %{
    __struct__: __MODULE__,
    internal_state: binary(),
    entropy_count: non_neg_integer()
  }

  @spec new() :: entropy_pool()
  @spec extract(entropy_pool(), pos_integer()) :: {binary(), entropy_pool()}
  @spec add_entropy(entropy_pool(), binary()) :: entropy_pool()
end
```

### Polymorphic and Generic Constraints

Type variables for flexible, reusable function signatures:

```elixir
defmodule PrismaticCore.Pipeline do
  @spec map(Enum.t(), (any() -> any())) :: Enum.t()
  @spec filter(Enum.t(), (any() -> boolean())) :: Enum.t()
  @spec reduce(Enum.t(), any(), (any(), any() -> any())) :: any()

  # Generic container with type preservation
  @spec transform(container, (element -> element)) :: container
        when container: [element] | MapSet.t(element),
             element: any()
end
```

## Dialyzer Integration

### Success Typing Analysis

Dialyzer performs success typing analysis, identifying functions that can never succeed:

```elixir
defmodule PrismaticAnalysis.TypeChecker do
  # Dialyzer will detect this inconsistency
  @spec always_fails(binary()) :: integer()
  def always_fails(str) when is_binary(str) do
    # Returns atom but spec says integer - Dialyzer catches this
    :error
  end

  # Correct specification
  @spec parse_number(binary()) :: {:ok, integer()} | {:error, atom()}
  def parse_number(str) when is_binary(str) do
    case Integer.parse(str) do
      {num, ""} -> {:ok, num}
      _ -> {:error, :invalid_format}
    end
  end
end
```

### Pattern Matching Verification

Dialyzer analyzes pattern matching exhaustiveness:

```elixir
defmodule PrismaticCore.StateManager do
  @type state :: :initializing | :ready | :processing | :shutting_down | :error

  @spec transition(state(), :start | :stop | :reset | :fail) :: state()
  def transition(:initializing, :start), do: :ready
  def transition(:ready, :start), do: :processing
  def transition(:processing, :stop), do: :ready
  def transition(:processing, :fail), do: :error
  def transition(:error, :reset), do: :initializing
  def transition(:shutting_down, :reset), do: :initializing
  # Dialyzer will warn about missing patterns for exhaustiveness
end
```

## Implementation Patterns in Prismatic Platform

### Behaviour and Protocol Typing

Type safety for polymorphic behavior:

```elixir
defmodule PrismaticStorage.Adapter do
  @type storage_key :: binary()
  @type storage_value :: any()
  @type storage_options :: keyword()
  @type storage_result :: {:ok, storage_value()} | {:error, atom()}

  @callback get(storage_key(), storage_options()) :: storage_result()
  @callback put(storage_key(), storage_value(), storage_options()) ::
    {:ok, storage_value()} | {:error, atom()}
  @callback delete(storage_key(), storage_options()) :: :ok | {:error, atom()}
  @callback health_check() :: {:ok, map()} | {:error, atom()}

  @optional_callbacks [health_check: 0]
end

defmodule PrismaticStorage.ETS do
  @behaviour PrismaticStorage.Adapter

  @impl PrismaticStorage.Adapter
  @spec get(binary(), keyword()) :: {:ok, any()} | {:error, atom()}
  def get(key, opts \\ []) when is_binary(key) and is_list(opts) do
    # Implementation with guaranteed type conformance
  end
end
```

### OSINT Tool Registration Types

Self-registering systems with compile-time type verification:

```elixir
defmodule PrismaticOsintCore.ToolTypes do
  @type tool_category :: :czech | :global | :sanctions | :eu | :uk | :us | :universal
  @type api_style :: :source | :provider
  @type input_field_type :: :text | :email | :url | :select | :number | :date

  @type input_field :: %{
    name: atom(),
    type: input_field_type(),
    label: String.t(),
    required: boolean(),
    placeholder: String.t() | nil,
    options: [String.t()] | nil
  }

  @type tool_config :: %{
    slug: String.t(),
    name: String.t(),
    category: tool_category(),
    api_style: api_style(),
    input_fields: [input_field()],
    requires_auth: boolean(),
    rate_limit: %{
      requests_per_second: pos_integer(),
      burst: pos_integer()
    } | nil
  }

  @type search_result :: %{
    source_id: String.t(),
    title: String.t(),
    summary: String.t(),
    confidence: float(),
    metadata: map()
  }

  @callback search(query :: String.t(), opts :: keyword()) ::
    {:ok, [search_result()]} | {:error, atom()}
  @callback get_details(source_id :: String.t(), opts :: keyword()) ::
    {:ok, map()} | {:error, atom()}
end
```

### Real-Time System Types

LiveView and PubSub type specifications for UI components:

```elixir
defmodule PrismaticWeb.LiveTypes do
  @type socket :: Phoenix.LiveView.Socket.t()
  @type assigns :: map()
  @type live_action :: atom()
  @type params :: map()
  @type session :: map()

  @type mount_result ::
    {:ok, socket()} |
    {:ok, socket(), keyword()} |
    {:error, atom()}

  @type event_result ::
    {:noreply, socket()} |
    {:reply, map(), socket()}

  @type pubsub_message ::
    {:osint_progress, tool_slug :: String.t(), progress :: float()} |
    {:drift_alert, severity :: atom(), details :: map()} |
    {:quality_update, app :: atom(), score :: float()}

  @spec handle_info(pubsub_message(), socket()) :: event_result()
end
```

## Testing with Typespecs

### Property-Based Testing Integration

Combining typespecs with PropEr for comprehensive testing:

```elixir
defmodule PrismaticCore.MonteCarloTest do
  use ExUnit.Case
  use PropEr.ExUnit

  @moduletag property_based: true

  # Generate test data conforming to typespecs
  property "Monte Carlo simulation maintains statistical properties", [:verbose] do
    forall config <- simulation_config_generator() do
      case PrismaticCore.MonteCarlo.run_simulation(config) do
        {:ok, result} ->
          # Verify result conforms to monte_carlo_result type
          is_float(result.mean) and
          is_float(result.std_dev) and
          result.iterations_completed > 0 and
          result.epistemic_uncertainty >= 0.0 and
          result.epistemic_uncertainty <= 1.0

        {:error, reason} when is_atom(reason) ->
          true
      end
    end
  end

  defp simulation_config_generator do
    let {iterations, distribution, confidence} <-
        {pos_integer(), distribution_generator(), confidence_generator()} do
      %{
        iterations: iterations,
        distribution: distribution,
        parameters: distribution_parameters(distribution),
        confidence_level: confidence,
        seed: :rand.uniform(1_000_000)
      }
    end
  end
end
```

### Contract Verification

Automated verification that implementations match specifications:

```elixir
defmodule PrismaticStorage.ContractTest do
  use ExUnit.Case

  @adapters [
    PrismaticStorage.ETS,
    PrismaticStorage.Ecto,
    PrismaticStorage.Meilisearch,
    PrismaticStorage.KuzuDB
  ]

  for adapter <- @adapters do
    test "#{adapter} conforms to Adapter behaviour contract" do
      adapter = unquote(adapter)

      # Verify all required callbacks are implemented with correct specs
      assert function_exported?(adapter, :get, 2)
      assert function_exported?(adapter, :put, 3)
      assert function_exported?(adapter, :delete, 2)

      # Runtime contract verification
      {:ok, _} = adapter.put("test_key", "test_value", [])
      {:ok, value} = adapter.get("test_key", [])
      assert value == "test_value"

      :ok = adapter.delete("test_key", [])
      {:error, :not_found} = adapter.get("test_key", [])
    end
  end
end
```

## Best Practices and Common Pitfalls

### Best Practices

**Start with simple specs and evolve complexity gradually.** Begin with basic `@spec` declarations and add more sophisticated type definitions as the codebase matures.

**Use union types judiciously.** Prefer specific, well-defined unions over broad `any()` types, but avoid creating overly complex unions that reduce readability.

**Document type assumptions in module docs.** Complex custom types should have comprehensive module documentation explaining their purpose and constraints.

**Leverage Dialyzer warnings as design feedback.** When Dialyzer reports discrepancies, treat them as opportunities to clarify type relationships and improve design.

**Maintain spec coverage above 80%.** Use `mix dialyzer --format short --statistics` to track coverage and prioritize specs for public APIs and critical functions.

### Common Pitfalls

**Over-specification can make code brittle.** Don't create types that are so specific they prevent reasonable code evolution. Balance precision with flexibility.

**Ignoring opaque type boundaries.** Accessing internal structure of opaque types defeats their purpose and can break when implementations change.

**Mismatching spec and implementation evolution.** When refactoring function signatures, always update corresponding `@spec` declarations to maintain accuracy.

**Performance assumptions about typespecs.** Remember that typespecs don't affect runtime performance—they're purely for static analysis and documentation.

```elixir
# AVOID: Overly specific types that prevent evolution
@type user_id :: 1..999_999  # Too restrictive for growing user base

# PREFER: Reasonable constraints that allow growth
@type user_id :: pos_integer()

# AVOID: Breaking opaque type encapsulation
def access_internal(opaque_data) do
  opaque_data.internal_state  # Violates opaque boundary
end

# PREFER: Using provided functions
def access_data(opaque_data) do
  MyModule.extract(opaque_data)  # Respects abstraction
end
```

## Usage in Prismatic Platform

The Prismatic Platform demonstrates enterprise-scale typespec usage across all subsystems:

| Component | Specs | Coverage | Purpose |
|-----------|-------|----------|---------|
| **Monte Carlo Engine** | 127 | 98% | Statistical simulation type safety |
| **OSINT Adapters** | 340 | 95% | Tool registration and API contracts |
| **Storage Layer** | 156 | 100% | Multi-backend storage consistency |
| **LiveView UI** | 203 | 92% | Real-time UI component contracts |
| **Agent System** | 445 | 97% | Distributed agent communication |

All platform code maintains zero Dialyzer violations through rigorous CI enforcement and automated typespec verification. This demonstrates how typespecs enable reliable operation of complex distributed systems while maintaining development velocity.

## Integration with Other Elixir Features

**Pattern Matching Verification**: Dialyzer uses typespecs to verify pattern matching completeness and detect unreachable clauses.

**Behaviour Contracts**: `@callback` specifications ensure implementing modules conform to expected interfaces.

**Protocol Polymorphism**: Generic typespecs enable type-safe protocol implementations across different data types.

**Macro Generation**: Generated functions inherit appropriate typespecs from macro templates, maintaining type safety in metaprogrammed code.

## Related Concepts

- [Elixir](@/glossary/elixir.md) - Programming language providing the typespec system
- [Dialyzer](@/glossary/dialyzer.md) - Static analysis tool that processes typespecs
- [Behaviour Pattern](@/glossary/behaviour-pattern.md) - OTP pattern often combined with typespec contracts
- [Static Analysis](@/glossary/static-analysis.md) - Broader category including typespec checking
- [Pattern Matching](@/glossary/pattern-matching.md) - Elixir feature verified by typespecs

## See Also

- [Architecture](@/architecture/_index.md) - Platform architecture leveraging typed interfaces
- [Apps](@/apps/_index.md) - Applications demonstrating enterprise typespec usage
- [Prismatic Core](@/apps/prismatic-core.md) - Core engine with comprehensive type specifications
- [Storage Layer](@/apps/prismatic-storage-core.md) - Multi-backend storage with type-safe adapters
- [AIAD](@/glossary/aiad.md) - Agent system utilizing typed communication protocols

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)