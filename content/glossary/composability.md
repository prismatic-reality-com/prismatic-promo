+++
title = "Composability"
weight = 50
[extra]
tags = ["glossary", "architecture", "functional-programming", "design-pattern", "pipe-operator", "protocols", "behaviours", "modularity"]
description = "Property allowing system components to be combined in various configurations to create new functionality, enabled in Elixir through pipe operators, protocols, behaviours, and functional composition"
category = "architecture"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate"
domain_category = "software-architecture"
related_concepts = ["functional composition", "pipe operator", "protocols", "behaviours", "adapter pattern", "middleware pattern", "plug architecture", "command composition"]
implementation_status = "production"
authority_level = "platform-wide"
difficulty_rating = 6
prerequisites = ["functional programming basics", "Elixir syntax", "OTP fundamentals", "design patterns"]
learning_path = ["functional-programming-language", "pipe-operator", "protocol", "behaviour", "composability"]
interactive_demos = ["/labs/glossary/composability"]
code_examples = ["elixir"]
external_resources = ["https://hexdocs.pm/elixir/Kernel.html#%7C%3E/2", "https://hexdocs.pm/elixir/Protocol.html", "https://hexdocs.pm/plug/Plug.html"]
version_introduced = "0.1.0"
stability_level = "stable"
testing_scenarios = ["pipeline composition", "protocol dispatch", "behaviour contract compliance", "adapter interchangeability", "middleware ordering"]
keywords = ["composability", "pipe operator", "functional composition", "protocols", "behaviours", "adapter pattern", "plug", "middleware", "modularity", "Elixir"]
related_terms = ["modularity", "pipe-operator", "protocol", "behaviour", "adapter-pattern", "functional-programming-language", "otp", "genserver"]
word_count = 1634
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Composability - Prismatic Platform"
+++

## Definition

Composability is the design property that allows system components to be freely combined in various configurations to create new functionality without modifying the components themselves. A composable system is one where individual pieces can be connected, chained, nested, and rearranged like building blocks, with the output of one component serving as the input of another. The resulting composition exhibits predictable behavior derived from the behaviors of its constituent parts.

In Elixir and the BEAM ecosystem, composability is a first-class architectural principle enabled by the [pipe operator](/glossary/pipe-operator/) (`|>`), [protocols](/glossary/protocol/) for polymorphic dispatch, [behaviours](/glossary/behaviour/) for contract-based composition, and the functional programming paradigm that treats data transformation as the fundamental unit of computation. Prismatic Platform's 115-app umbrella architecture is designed from the ground up around composability, allowing any combination of applications, adapters, and pipelines to be assembled into domain-specific solutions.

## Overview

Composability has been a central concern of software engineering since the earliest days of the discipline. Doug McIlroy's 1978 Unix philosophy -- "Write programs that do one thing and do it well. Write programs to work together." -- articulated the principle that has guided system design for nearly five decades. The Unix pipe (`|`) is the prototypical composability mechanism: it connects the output of one program to the input of another, enabling users to build complex data processing pipelines from simple, focused utilities.

Functional programming languages elevate composability from a convention to a structural guarantee. In a purely functional system, functions are composable by definition: if function `f` produces output of type `B` and function `g` accepts input of type `B`, then `g(f(x))` is a valid composition. This composability is guaranteed because functions have no side effects that could invalidate the composition -- the behavior of the composed system is entirely determined by the behaviors of its parts.

Elixir occupies a unique position in the composability landscape. As a functional language running on the BEAM virtual machine, it inherits the mathematical composability of functional programming. As a language with first-class support for protocols (similar to Haskell typeclasses or Rust traits), it provides polymorphic composability where the same operation works with different data types. And as an OTP ecosystem language, it provides process-level composability through supervision trees, GenServer composition, and message-passing architectures.

The dimensions of composability in software systems include:

- **Sequential Composition**: Components execute in order, each transforming the output of the previous one (pipes, chains)
- **Parallel Composition**: Components execute simultaneously on shared or partitioned inputs (concurrent pipelines)
- **Conditional Composition**: Component selection depends on runtime conditions (strategy pattern, protocol dispatch)
- **Recursive Composition**: Components contain instances of themselves (tree structures, recursive data types)
- **Algebraic Composition**: Components follow mathematical laws (monoids, functors) that guarantee composition validity

## Technical Details

### The Pipe Operator as Composition Primitive

Elixir's pipe operator (`|>`) is the most visible expression of composability in the language. It transforms nested function calls into readable, left-to-right data transformation pipelines:

```elixir
defmodule PrismaticPipeline.DataTransform do
  @moduledoc """
  Demonstrates composability through Elixir's pipe operator,
  showing how complex data transformations are built from
  simple, focused functions.
  """

  @type raw_record :: map()
  @type validated_record :: %{data: map(), valid: boolean(), errors: [String.t()]}
  @type enriched_record :: %{data: map(), metadata: map()}
  @type normalized_record :: %{data: map(), metadata: map(), normalized_at: DateTime.t()}

  @spec process_records([raw_record()]) :: {:ok, [normalized_record()]} | {:error, String.t()}
  def process_records(records) do
    results =
      records
      |> Enum.map(&validate/1)
      |> Enum.filter(&(&1.valid))
      |> Enum.map(&enrich/1)
      |> Enum.map(&normalize/1)
      |> Enum.sort_by(& &1.normalized_at, DateTime)

    {:ok, results}
  end

  @spec validate(raw_record()) :: validated_record()
  def validate(record) do
    errors =
      []
      |> maybe_add_error(record, :name, "Name is required")
      |> maybe_add_error(record, :email, "Email is required")

    %{data: record, valid: errors == [], errors: errors}
  end

  @spec enrich(validated_record()) :: enriched_record()
  def enrich(%{data: data}) do
    metadata = %{
      processed_at: DateTime.utc_now(),
      source: "prismatic_pipeline",
      version: "1.0.0"
    }

    %{data: data, metadata: metadata}
  end

  @spec normalize(enriched_record()) :: normalized_record()
  def normalize(%{data: data, metadata: metadata}) do
    normalized_data =
      data
      |> Map.update(:name, "", &String.trim/1)
      |> Map.update(:email, "", &String.downcase/1)

    %{data: normalized_data, metadata: metadata, normalized_at: DateTime.utc_now()}
  end

  @spec maybe_add_error([String.t()], map(), atom(), String.t()) :: [String.t()]
  defp maybe_add_error(errors, record, field, message) do
    if Map.get(record, field) in [nil, ""] do
      [message | errors]
    else
      errors
    end
  end
end
```

Each function in this pipeline does exactly one thing: validate, enrich, or normalize. The pipe operator composes them into a complex transformation without any function needing to know about the others. This is composability at its most direct.

### Protocol-Based Polymorphic Composition

[Protocols](/glossary/protocol/) enable composability across data types. A single operation can work with any type that implements the protocol, allowing new types to participate in existing compositions without modifying the original code:

```elixir
defprotocol PrismaticStorage.Serializable do
  @moduledoc """
  Protocol enabling composable serialization across diverse
  data types. Any type implementing this protocol can participate
  in serialization pipelines.
  """

  @doc "Serialize the data structure to a storable format"
  @spec serialize(t()) :: {:ok, binary()} | {:error, String.t()}
  def serialize(data)

  @doc "Estimate the serialized size in bytes"
  @spec estimated_size(t()) :: non_neg_integer()
  def estimated_size(data)
end

defimpl PrismaticStorage.Serializable, for: Map do
  @spec serialize(map()) :: {:ok, binary()} | {:error, String.t()}
  def serialize(data) do
    case Jason.encode(data) do
      {:ok, json} -> {:ok, json}
      {:error, reason} -> {:error, "JSON encoding failed: #{inspect(reason)}"}
    end
  end

  @spec estimated_size(map()) :: non_neg_integer()
  def estimated_size(data), do: map_size(data) * 64
end

defimpl PrismaticStorage.Serializable, for: List do
  @spec serialize(list()) :: {:ok, binary()} | {:error, String.t()}
  def serialize(data) do
    case Jason.encode(data) do
      {:ok, json} -> {:ok, json}
      {:error, reason} -> {:error, "JSON encoding failed: #{inspect(reason)}"}
    end
  end

  @spec estimated_size(list()) :: non_neg_integer()
  def estimated_size(data), do: length(data) * 48
end
```

With this protocol, any pipeline that serializes data works with maps, lists, or any future type that implements `Serializable` -- without changing the pipeline code. This is open composition: the set of composable types is extensible without modification.

### Behaviour-Based Contract Composition

[Behaviours](/glossary/behaviour/) define contracts that modules must implement, enabling interchangeable components in composed systems:

```elixir
defmodule PrismaticStorage.AdapterBehaviour do
  @moduledoc """
  Defines the contract for storage adapters, enabling composable
  storage backends. Any module implementing this behaviour can
  be used interchangeably in storage pipelines.
  """

  @type key :: String.t()
  @type value :: term()
  @type opts :: keyword()

  @callback init(opts()) :: {:ok, term()} | {:error, String.t()}
  @callback get(term(), key()) :: {:ok, value()} | {:error, :not_found}
  @callback put(term(), key(), value()) :: :ok | {:error, String.t()}
  @callback delete(term(), key()) :: :ok | {:error, String.t()}
  @callback list(term(), keyword()) :: {:ok, [key()]} | {:error, String.t()}
end

defmodule PrismaticStorage.ComposableStore do
  @moduledoc """
  Composes storage operations across multiple backends using
  the adapter behaviour for interchangeability. Demonstrates
  how behaviours enable composable architecture.
  """

  @type store_config :: %{
    primary: module(),
    cache: module() | nil,
    fallback: module() | nil,
    primary_state: term(),
    cache_state: term() | nil,
    fallback_state: term() | nil
  }

  @spec init(keyword()) :: {:ok, store_config()} | {:error, String.t()}
  def init(opts) do
    primary = Keyword.fetch!(opts, :primary)
    cache = Keyword.get(opts, :cache)
    fallback = Keyword.get(opts, :fallback)

    with {:ok, primary_state} <- primary.init(opts),
         {:ok, cache_state} <- maybe_init(cache, opts),
         {:ok, fallback_state} <- maybe_init(fallback, opts) do
      {:ok, %{
        primary: primary,
        cache: cache,
        fallback: fallback,
        primary_state: primary_state,
        cache_state: cache_state,
        fallback_state: fallback_state
      }}
    end
  end

  @spec get(store_config(), String.t()) :: {:ok, term()} | {:error, :not_found}
  def get(config, key) do
    with {:error, :not_found} <- try_cache(config, key),
         {:error, :not_found} <- config.primary.get(config.primary_state, key),
         {:error, :not_found} <- try_fallback(config, key) do
      {:error, :not_found}
    else
      {:ok, value} ->
        maybe_cache_put(config, key, value)
        {:ok, value}
    end
  end

  @spec put(store_config(), String.t(), term()) :: :ok | {:error, String.t()}
  def put(config, key, value) do
    with :ok <- config.primary.put(config.primary_state, key, value) do
      maybe_cache_put(config, key, value)
      :ok
    end
  end

  @spec try_cache(store_config(), String.t()) :: {:ok, term()} | {:error, :not_found}
  defp try_cache(%{cache: nil}, _key), do: {:error, :not_found}
  defp try_cache(%{cache: mod, cache_state: state}, key), do: mod.get(state, key)

  @spec try_fallback(store_config(), String.t()) :: {:ok, term()} | {:error, :not_found}
  defp try_fallback(%{fallback: nil}, _key), do: {:error, :not_found}
  defp try_fallback(%{fallback: mod, fallback_state: state}, key), do: mod.get(state, key)

  @spec maybe_init(module() | nil, keyword()) :: {:ok, term() | nil}
  defp maybe_init(nil, _opts), do: {:ok, nil}
  defp maybe_init(mod, opts), do: mod.init(opts)

  @spec maybe_cache_put(store_config(), String.t(), term()) :: :ok
  defp maybe_cache_put(%{cache: nil}, _key, _value), do: :ok
  defp maybe_cache_put(%{cache: mod, cache_state: state}, key, value), do: mod.put(state, key, value)
end
```

This demonstrates how behaviours enable composable architectures: the `ComposableStore` works with any combination of storage backends that implement the `AdapterBehaviour`. Swapping ETS for Redis for PostgreSQL requires no changes to the composition logic.

### Plug: Composability as Architecture

Phoenix's Plug library is the canonical example of composability as an architectural pattern in the Elixir ecosystem. A Plug is simply a module that transforms a connection struct -- and plugs compose by chaining these transformations:

```elixir
defmodule PrismaticWeb.Pipeline.SecurityPipeline do
  @moduledoc """
  Demonstrates Plug-style composability where each middleware
  component transforms the connection independently, and the
  pipeline is built by composing these components.
  """

  @type conn :: map()
  @type plug_result :: {:ok, conn()} | {:halt, conn()}

  @spec run(conn(), [module()]) :: {:ok, conn()} | {:halt, conn()}
  def run(conn, plugs) do
    Enum.reduce_while(plugs, {:ok, conn}, fn plug, {:ok, current_conn} ->
      case plug.call(current_conn) do
        {:ok, updated_conn} -> {:cont, {:ok, updated_conn}}
        {:halt, halted_conn} -> {:halt, {:halt, halted_conn}}
      end
    end)
  end
end

defmodule PrismaticWeb.Plugs.RateLimiter do
  @moduledoc "Rate limiting plug composable with other security plugs."

  @spec call(map()) :: {:ok, map()} | {:halt, map()}
  def call(conn) do
    client_ip = Map.get(conn, :remote_ip, "unknown")
    limit = 100

    case check_rate(client_ip, limit) do
      :ok -> {:ok, Map.put(conn, :rate_limited, false)}
      :exceeded -> {:halt, Map.merge(conn, %{status: 429, rate_limited: true})}
    end
  end

  @spec check_rate(String.t(), non_neg_integer()) :: :ok | :exceeded
  defp check_rate(_ip, _limit), do: :ok
end

defmodule PrismaticWeb.Plugs.Authentication do
  @moduledoc "Authentication plug composable with other security plugs."

  @spec call(map()) :: {:ok, map()} | {:halt, map()}
  def call(conn) do
    case Map.get(conn, :authorization) do
      nil -> {:halt, Map.merge(conn, %{status: 401, authenticated: false})}
      token -> {:ok, Map.put(conn, :authenticated, valid_token?(token))}
    end
  end

  @spec valid_token?(String.t()) :: boolean()
  defp valid_token?(_token), do: true
end
```

The security pipeline composes rate limiting, authentication, and any number of additional plugs without any plug needing to know about the others. Adding CORS handling, request logging, or input sanitization requires adding a module to the list -- the existing plugs are untouched.

### Functional Composition Combinators

At the most abstract level, Elixir supports function composition through higher-order functions and closures:

```elixir
defmodule PrismaticCore.Compose do
  @moduledoc """
  Provides function composition combinators for building
  complex transformations from simple functions.
  """

  @spec compose((term() -> term()), (term() -> term())) :: (term() -> term())
  def compose(f, g) do
    fn x -> g.(f.(x)) end
  end

  @spec pipe([(term() -> term())]) :: (term() -> term())
  def pipe(functions) do
    Enum.reduce(functions, &Function.identity/1, fn f, acc ->
      compose(acc, f)
    end)
  end

  @spec map_compose((term() -> term()), (term() -> term())) :: ([term()] -> [term()])
  def map_compose(f, g) do
    fn list ->
      list
      |> Enum.map(f)
      |> Enum.map(g)
    end
  end

  @spec filter_then_map((term() -> boolean()), (term() -> term())) :: ([term()] -> [term()])
  def filter_then_map(predicate, transform) do
    fn list ->
      list
      |> Enum.filter(predicate)
      |> Enum.map(transform)
    end
  end
end
```

## Implementation in Prismatic Platform

### Umbrella Application Composition

Prismatic Platform's 115-app umbrella architecture is the largest-scale expression of composability in the platform. Each application is an independent, self-contained unit that exposes well-defined interfaces. Applications compose through explicit dependencies declared in `mix.exs`:

```elixir
defmodule PrismaticPerimeter.MixProject do
  use Mix.Project

  def project do
    [
      app: :prismatic_perimeter,
      version: "0.1.0",
      build_path: "../../_build",
      deps_path: "../../deps",
      deps: deps()
    ]
  end

  defp deps do
    [
      # Composable dependency on storage core traits
      {:prismatic_storage_core, in_umbrella: true},
      # Composable dependency on ETS adapter
      {:prismatic_storage_ets, in_umbrella: true},
      # Composable dependency on web components
      {:prismatic_web, in_umbrella: true}
    ]
  end
end
```

This structure means that `prismatic_perimeter` composes storage, web, and core capabilities without coupling to specific implementations. Replacing `prismatic_storage_ets` with `prismatic_storage_ecto` requires changing one dependency line.

### AIAD Pipeline Composition

The AIAD standard's pipeline system enables composing commands into complex workflows:

```elixir
defmodule PrismaticAIAD.PipelineComposer do
  @moduledoc """
  Composes AIAD commands into pipelines using functional
  composition principles. Pipelines are first-class values
  that can be further composed, stored, and replayed.
  """

  @type step :: %{
    command: String.t(),
    args: map(),
    transform: (map() -> map()) | nil
  }

  @type pipeline :: [step()]

  @spec compose(pipeline(), pipeline()) :: pipeline()
  def compose(pipeline_a, pipeline_b) do
    pipeline_a ++ pipeline_b
  end

  @spec conditional(pipeline(), (map() -> boolean()), pipeline()) :: pipeline()
  def conditional(base, predicate, branch) do
    base ++ [%{command: "__conditional", args: %{predicate: predicate, branch: branch}, transform: nil}]
  end

  @spec parallel(pipeline(), pipeline()) :: pipeline()
  def parallel(pipeline_a, pipeline_b) do
    [%{command: "__parallel", args: %{branches: [pipeline_a, pipeline_b]}, transform: nil}]
  end

  @spec execute(pipeline(), map()) :: {:ok, [map()]} | {:error, String.t()}
  def execute(pipeline, initial_context) do
    Enum.reduce_while(pipeline, {:ok, [initial_context]}, fn step, {:ok, results} ->
      case dispatch_step(step, List.last(results)) do
        {:ok, result} -> {:cont, {:ok, results ++ [result]}}
        {:error, reason} -> {:halt, {:error, reason}}
      end
    end)
  end

  @spec dispatch_step(step(), map()) :: {:ok, map()} | {:error, String.t()}
  defp dispatch_step(%{command: "__conditional", args: %{predicate: pred, branch: branch}}, context) do
    if pred.(context) do
      execute(branch, context) |> extract_last_result()
    else
      {:ok, context}
    end
  end

  defp dispatch_step(%{command: command, args: args, transform: transform}, _context) do
    case run_command(command, args) do
      {:ok, result} when not is_nil(transform) -> {:ok, transform.(result)}
      {:ok, result} -> {:ok, result}
      error -> error
    end
  end

  @spec run_command(String.t(), map()) :: {:ok, map()} | {:error, String.t()}
  defp run_command(_command, args), do: {:ok, args}

  @spec extract_last_result({:ok, [map()]} | {:error, String.t()}) :: {:ok, map()} | {:error, String.t()}
  defp extract_last_result({:ok, results}), do: {:ok, List.last(results)}
  defp extract_last_result(error), do: error
end
```

### Quality Gate Composition

The platform's quality gate system is inherently composable. Individual gates (compilation, Credo, Dialyzer, tests, forbidden patterns) compose into a comprehensive quality check without any gate knowing about the others:

The 13 quality domains operate as composable checks: each domain produces a pass/fail signal, and the Quality Floor Guardian aggregates them into a composite score. Adding a new quality domain requires implementing one module -- the composition infrastructure handles the rest.

## Comparison with Alternatives

### Composability vs. Inheritance

| Aspect | Composability | Inheritance |
|--------|--------------|-------------|
| Coupling | Loose (interface only) | Tight (parent-child) |
| Flexibility | High (runtime assembly) | Low (compile-time hierarchy) |
| Reusability | Component-level | Hierarchy-level |
| Testability | Individual components | Requires hierarchy |
| Complexity | Linear (N components) | Exponential (deep hierarchies) |
| Elixir Fit | Native (protocols, behaviours) | Not supported |

### Composability vs. Configuration

Configuration-driven systems achieve flexibility through parameters rather than composition. While configuration is simpler for well-understood variation, composability handles novel combinations that the original designer did not anticipate. Prismatic uses both: configuration for expected variation and composability for open-ended extensibility.

### Composability vs. Microservices

Microservices achieve composability at the deployment level through network interfaces. Elixir's BEAM composability operates at the process level with dramatically lower overhead. Prismatic's umbrella architecture provides microservice-like boundaries with in-process communication efficiency.

## Best Practices

1. **Design for the pipe**: Write functions that take data as the first argument and return transformed data, making them naturally composable with `|>`
2. **Use protocols for open extension**: When new types should participate in existing compositions, protocols provide the cleanest mechanism
3. **Define behaviours for interchangeability**: When components need to be swappable, define a behaviour that captures the common interface
4. **Keep components focused**: Each composable unit should do one thing well -- composability fails when components are too coarse-grained
5. **Preserve data structure transparency**: Composable components should transform well-known data structures (maps, structs) rather than opaque types
6. **Test components in isolation**: The value of composability is that each component can be tested independently of its composition context
7. **Document composition contracts**: Specify what a component expects as input and what it produces as output, making valid compositions discoverable
8. **Avoid hidden state**: Components that depend on hidden state break composition because the composition context cannot control the state

## Common Pitfalls

### Over-Composition

Breaking functionality into too many tiny components creates "composition soup" where understanding a pipeline requires tracing through dozens of components. The optimal granularity balances reusability against comprehensibility.

### Type Mismatches in Pipelines

When composing functions through `|>`, type mismatches between a function's output and the next function's expected input cause runtime errors. Elixir's `@spec` annotations and Dialyzer help catch these at compile time, but discipline in maintaining consistent pipeline types is essential.

### Stateful Components Breaking Composition

Components that maintain internal state through process dictionaries, ETS side effects, or external service calls are harder to compose because their behavior depends on hidden context. Prefer pure functions for composable components, confining state to the edges of the system.

### Composition Order Sensitivity

When the order of components matters (e.g., authentication must precede authorization), the composition becomes fragile to reordering. Document ordering constraints explicitly and consider using typed pipeline stages to enforce them at compile time.

### Ignoring Error Propagation

Composable pipelines need consistent error handling. If one component in a pipeline returns `{:error, reason}` but the next expects raw data, the pipeline breaks silently. Use `with` chains or railway-oriented programming patterns for robust error propagation through compositions.

## Use Cases

### Data Processing Pipelines

ETL (Extract, Transform, Load) pipelines are the canonical use case for composability. Prismatic's OSINT intelligence gathering composes extraction from multiple sources, transformation into normalized formats, and loading into storage -- each step a composable unit.

### Web Request Processing

Phoenix's plug pipeline composes authentication, authorization, rate limiting, request parsing, and response formatting into a request processing pipeline. Each plug is independently testable and reusable across different routes.

### Storage Layer Abstraction

Prismatic's storage system composes adapters (ETS, Ecto, Meilisearch, KuzuDB) through the `PrismaticStorage.AdapterBehaviour`, enabling the same application logic to work with different storage backends through composition rather than modification.

### Quality Enforcement

The 13-domain quality gate system composes independent quality checks into a comprehensive quality assessment. Each domain operates independently, and the composite score emerges from their individual results.

### Agent Pipeline Orchestration

The AIAD command pipeline system composes individual commands into multi-step workflows with conditional execution, parallel branches, and error handling -- all through functional composition of command steps.

## Related Concepts

- [Modularity](/glossary/modularity/) -- the structural property enabling composability through well-defined module boundaries
- [Pipe Operator](/glossary/pipe-operator/) -- Elixir's primary syntactic mechanism for sequential composition
- [Protocol](/glossary/protocol/) -- polymorphic dispatch enabling composability across data types
- [Behaviour](/glossary/behaviour/) -- contract-based composition for interchangeable module implementations
- [Adapter Pattern](/glossary/adapter-pattern/) -- design pattern translating interfaces to enable composition of incompatible components
- [Functional Programming Language](/glossary/functional-programming-language/) -- the paradigm providing mathematical foundations for composability
- [OTP](/glossary/otp/) -- the framework enabling process-level composition through supervision trees and GenServers
- [GenServer](/glossary/genserver/) -- the OTP behaviour enabling composable stateful process management

## See Also

- Glossary Index -- complete listing of all platform terminology
- [Supervision Tree](/glossary/supervision-tree/) -- OTP supervision as process-level composition
- [Phoenix Framework](/glossary/phoenix-framework/) -- web framework built on Plug composability
- [LiveView](/glossary/liveview/) -- real-time UI composable through Phoenix Components
- [ETS](/glossary/ets/) -- composable in-memory storage used across platform adapters

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
