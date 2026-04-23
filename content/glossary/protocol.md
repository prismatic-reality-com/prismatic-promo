+++
title = "Protocol"
weight = 43
[extra]
description = "Elixir mechanism for type-based polymorphic dispatch"
category = "elixir"
related_terms = ["behaviour", "adapter-pattern", "otp", "sparkline", "elixir", "umbrella-application"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1483
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Protocol", "Elixir", "glossary", "Prismatic Platform", "Dispatches", "Storable", "Protocols"]
tags = ["glossary", "elixir", "protocol", "prismatic"]
quality_score = 72
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Protocol - Prismatic Platform"
+++

## Definition and Overview

A Protocol in Elixir is the language's mechanism for achieving polymorphism based on data types. Protocols define a set of functions that can be implemented for any data type, enabling different structs, maps, lists, atoms, and other types to respond to the same function calls with type-specific behavior. Unlike object-oriented languages where polymorphism is achieved through class inheritance and method overriding, Elixir protocols provide open extension -- new implementations can be added for existing protocols without modifying any original source code, and protocols can be implemented for types defined in entirely separate libraries or applications.

The distinction between protocols and behaviours is fundamental to Elixir's design philosophy. Behaviours define contracts at the module level: a module declares that it implements a behaviour by providing callback functions matching the behaviour's specification. The dispatch target is the module itself, known at compile time. Protocols, by contrast, dispatch based on the runtime type of the first argument. When code calls `Storable.serialize(entity)`, the BEAM runtime examines the type of `entity` and dispatches to the appropriate implementation. This type-based dispatch enables truly polymorphic code that operates uniformly over heterogeneous data without requiring the caller to know or care about the concrete type.

Protocols solve the expression problem -- the fundamental challenge of extending both data types and operations independently. In traditional OOP, adding a new type is easy (create a subclass) but adding a new operation requires modifying every existing class. In traditional functional programming, adding a new operation is easy (write a new function with pattern matching) but adding a new type requires modifying every existing function. Protocols elegantly resolve this tension: new types can implement existing protocols (adding types without modifying operations), and new protocols can be defined that existing types implement (adding operations through `defimpl` without modifying type definitions).

The BEAM virtual machine's support for protocols operates at the compiled bytecode level. When a protocol is consolidated (a compile-time optimization enabled in production), the dispatch lookup is compiled into a direct function call, eliminating the runtime overhead of dynamic dispatch. In development mode, protocols remain unconsolidated for flexibility, allowing implementations to be added or modified without recompilation. This dual-mode behavior provides the best of both worlds: development-time flexibility and production-time performance.

## Technical Deep Dive

### Protocol Definition

Protocols are defined using `defprotocol`, which creates a module containing function specifications that implementations must provide:

```elixir
defprotocol PrismaticStorage.Storable do
  @moduledoc """
  Protocol for types that can be stored through the Prismatic storage layer.
  Provides consistent serialization, key generation, and validation
  across all storable entity types in the platform.
  """

  @doc "Generate a unique storage key for the entity"
  @spec storage_key(t()) :: term()
  def storage_key(entity)

  @doc "Serialize the entity to a storable map representation"
  @spec serialize(t()) :: map()
  def serialize(entity)

  @doc "Validate the entity meets storage requirements"
  @spec validate(t()) :: :ok | {:error, list(String.t())}
  def validate(entity)

  @doc "Deserialize a stored map back into the entity type"
  @spec deserialize(t(), map()) :: {:ok, t()} | {:error, term()}
  def deserialize(entity, data)
end
```

The `t()` type in protocol specs refers to any type that implements the protocol. The protocol module itself is a regular Elixir module that can be used in `@spec` annotations, `import` statements, and function calls.

### Protocol Implementation

Implementations are defined using `defimpl`, which connects a concrete type to a protocol:

```elixir
defimpl PrismaticStorage.Storable, for: PrismaticPerimeter.Asset do
  @moduledoc """
  Storable implementation for Perimeter assets.
  Enables uniform storage of DNS records, certificates, IPs, and services.
  """

  def storage_key(asset) do
    {:asset, asset.domain, asset.type, asset.identifier}
  end

  def serialize(asset) do
    asset
    |> Map.from_struct()
    |> Map.put(:__stored_at__, DateTime.utc_now())
    |> Map.put(:__schema_version__, 1)
  end

  def validate(asset) do
    errors =
      []
      |> validate_required(asset, :domain, "domain is required")
      |> validate_required(asset, :type, "asset type is required")
      |> validate_required(asset, :identifier, "identifier is required")
      |> validate_type_enum(asset)

    case errors do
      [] -> :ok
      errors -> {:error, Enum.reverse(errors)}
    end
  end

  def deserialize(_asset, data) do
    case data do
      %{domain: domain, type: type, identifier: id} when is_binary(domain) ->
        {:ok, struct(PrismaticPerimeter.Asset, data)}

      _ ->
        {:error, :invalid_asset_data}
    end
  end

  defp validate_required(errors, entity, field, message) do
    if Map.get(entity, field) in [nil, ""] do
      [message | errors]
    else
      errors
    end
  end

  defp validate_type_enum(errors, asset) do
    valid_types = [:dns_record, :ip_address, :certificate, :service, :cloud_resource, :subdomain]

    if asset.type in valid_types do
      errors
    else
      ["invalid asset type: #{inspect(asset.type)}" | errors]
    end
  end
end
```

Multiple implementations can coexist for the same protocol across different types:

```elixir
defimpl PrismaticStorage.Storable, for: PrismaticAgents.AgentSpec do
  def storage_key(agent) do
    {:agent, agent.id, agent.version}
  end

  def serialize(agent) do
    %{
      id: agent.id,
      name: agent.name,
      authority_level: agent.authority_level,
      capabilities: agent.capabilities,
      constraints: agent.constraints,
      __stored_at__: DateTime.utc_now(),
      __schema_version__: 1
    }
  end

  def validate(agent) do
    errors =
      []
      |> then(fn e -> if is_nil(agent.id), do: ["agent id required" | e], else: e end)
      |> then(fn e -> if is_nil(agent.name), do: ["agent name required" | e], else: e end)
      |> then(fn e ->
        if agent.authority_level not in 1..5 do
          ["authority_level must be 1-5" | e]
        else
          e
        end
      end)

    case errors do
      [] -> :ok
      errors -> {:error, errors}
    end
  end

  def deserialize(_agent, data) do
    {:ok, struct(PrismaticAgents.AgentSpec, data)}
  end
end

defimpl PrismaticStorage.Storable, for: PrismaticPerimeter.Finding do
  def storage_key(finding) do
    {:finding, finding.domain, finding.category, finding.hash}
  end

  def serialize(finding), do: Map.from_struct(finding)

  def validate(finding) do
    if is_nil(finding.severity) do
      {:error, ["severity is required"]}
    else
      :ok
    end
  end

  def deserialize(_finding, data) do
    {:ok, struct(PrismaticPerimeter.Finding, data)}
  end
end
```

### Protocol Dispatch Mechanics

When a protocol function is called, the BEAM runtime performs type-based dispatch through a deterministic resolution order:

| Priority | Type Check | Description |
|----------|-----------|-------------|
| 1 | Struct module | Checks if value is a struct, dispatches to struct's module implementation |
| 2 | Atom | Dispatches to the `Atom` implementation |
| 3 | BitString | Dispatches to `BitString` implementation |
| 4 | Float | Dispatches to `Float` implementation |
| 5 | Function | Dispatches to `Function` implementation |
| 6 | Integer | Dispatches to `Integer` implementation |
| 7 | List | Dispatches to `List` implementation |
| 8 | Map | Dispatches to `Map` implementation (non-struct maps) |
| 9 | PID | Dispatches to `PID` implementation |
| 10 | Port | Dispatches to `Port` implementation |
| 11 | Reference | Dispatches to `Reference` implementation |
| 12 | Tuple | Dispatches to `Tuple` implementation |
| 13 | Any | Fallback implementation if `@fallback_to_any true` |

Structs are checked first because they are the most common dispatch target. The `Any` fallback provides a default implementation when `@fallback_to_any true` is declared in the protocol definition:

```elixir
defprotocol PrismaticDisplay.Renderable do
  @fallback_to_any true

  @doc "Render the entity as a displayable string for dashboard presentation"
  @spec render(t()) :: String.t()
  def render(entity)
end

defimpl PrismaticDisplay.Renderable, for: Any do
  def render(entity) do
    inspect(entity, pretty: true, limit: 50)
  end
end
```

### Protocol Consolidation

Protocol consolidation is a compile-time optimization that converts dynamic dispatch into direct function calls:

```elixir
# In mix.exs - consolidation is enabled by default in :prod
def project do
  [
    app: :prismatic,
    consolidate_protocols: Mix.env() != :dev
  ]
end
```

Without consolidation, each protocol call requires a runtime lookup to find the correct implementation module. With consolidation, the compiler analyzes all available implementations at compile time and generates optimized dispatch code. The performance difference is significant for hot paths:

| Mode | Dispatch Cost | Use Case |
|------|--------------|----------|
| **Unconsolidated** | ~200ns per call (module lookup) | Development, testing |
| **Consolidated** | ~5ns per call (direct call) | Production deployment |

The consolidation report can be examined during compilation:

```bash
mix compile --verbose 2>&1 | grep "Consolidated"
# Consolidated PrismaticStorage.Storable
# Consolidated PrismaticDisplay.Renderable
# Consolidated String.Chars
# ...
```

### Built-in Protocols

Elixir ships with several built-in protocols that the Prismatic Platform leverages extensively:

| Protocol | Purpose | Platform Usage |
|----------|---------|---------------|
| `String.Chars` | Convert to string via `to_string/1` | Agent names, rating grades, error messages |
| `Inspect` | Custom `inspect/2` representation | Debug output for complex structs |
| `Enumerable` | Enable `Enum` and `for` comprehensions | Custom collection types |
| `Collectable` | Enable `Enum.into/2` and comprehension collection | Building result sets |
| `List.Chars` | Convert to charlist | Erlang interop for NIF bindings |
| `Jason.Encoder` | JSON serialization | API response serialization |

```elixir
defimpl String.Chars, for: PrismaticPerimeter.Rating do
  def to_string(rating) do
    "#{rating.grade} (#{rating.score}/900)"
  end
end

defimpl Inspect, for: PrismaticPerimeter.Asset do
  import Inspect.Algebra

  def inspect(asset, opts) do
    concat([
      "#Asset<",
      to_doc(asset.type, opts),
      " ",
      to_doc(asset.identifier, opts),
      " @ ",
      to_doc(asset.domain, opts),
      ">"
    ])
  end
end

defimpl Jason.Encoder, for: PrismaticPerimeter.Rating do
  def encode(rating, opts) do
    Jason.Encode.map(
      %{
        grade: Atom.to_string(rating.grade),
        score: rating.score,
        industry_percentile: rating.industry_percentile,
        assessed_at: DateTime.to_iso8601(rating.assessed_at)
      },
      opts
    )
  end
end
```

## Architecture and Implementation

### Protocol vs. Behaviour Decision Framework

The Prismatic Platform applies a clear decision framework for choosing between protocols and behaviours:

| Criterion | Protocol | Behaviour |
|-----------|----------|-----------|
| **Dispatch target** | Data type (struct, map, list, etc.) | Module |
| **Resolution time** | Runtime (type of first argument) | Compile time (configured module) |
| **Extension model** | `defimpl` for each type | `@behaviour` + callback implementations |
| **Primary use** | "What can this data do?" | "What must this module provide?" |
| **Platform example** | `Storable` -- different types serialize differently | `KeyValue` -- different backends store differently |
| **Testability** | Test each implementation independently | Contract test macro across implementations |
| **Open/closed** | Open -- anyone can add implementations | Semi-closed -- implementations require full callback set |

In the storage layer, both mechanisms work together. The `PrismaticStorage.KeyValue` behaviour defines the backend contract (ETS, Ecto, Redis), while the `PrismaticStorage.Storable` protocol defines how individual data types prepare themselves for storage. Business logic calls `Storable.serialize(entity)` to convert data, then passes the result to the configured `KeyValue` backend:

```elixir
defmodule PrismaticStorage.Pipeline do
  @moduledoc """
  Storage pipeline combining protocol-based serialization
  with behaviour-based backend dispatch.
  """

  alias PrismaticStorage.{Storable, KeyValue}

  @backend Application.compile_env(:prismatic, :storage_backend, PrismaticStorage.ETS)

  @spec store(Storable.t()) :: :ok | {:error, term()}
  def store(entity) do
    with :ok <- Storable.validate(entity),
         key <- Storable.storage_key(entity),
         data <- Storable.serialize(entity) do
      @backend.put(key, data)
    end
  end

  @spec retrieve(Storable.t(), term()) :: {:ok, Storable.t()} | {:error, term()}
  def retrieve(entity_template, key) do
    with {:ok, data} <- @backend.get(key) do
      Storable.deserialize(entity_template, data)
    end
  end
end
```

### Protocol Composition Patterns

The platform uses protocol composition to build layered capabilities on data types:

```elixir
defprotocol PrismaticSafety.Auditable do
  @doc "Generate an audit trail entry for the entity"
  @spec audit_entry(t(), atom()) :: map()
  def audit_entry(entity, action)
end

defprotocol PrismaticSafety.Classifiable do
  @doc "Return the security classification level of the entity"
  @spec classification(t()) :: :public | :internal | :confidential | :restricted
  def classification(entity)
end

# A single struct can implement multiple protocols
defimpl PrismaticSafety.Auditable, for: PrismaticPerimeter.Finding do
  def audit_entry(finding, action) do
    %{
      entity_type: :finding,
      entity_id: finding.hash,
      action: action,
      domain: finding.domain,
      severity: finding.severity,
      timestamp: DateTime.utc_now()
    }
  end
end

defimpl PrismaticSafety.Classifiable, for: PrismaticPerimeter.Finding do
  def classification(finding) do
    case finding.severity do
      :critical -> :restricted
      :high -> :confidential
      :medium -> :internal
      _ -> :public
    end
  end
end
```

### Cross-Application Protocol Definitions

In the 90-app umbrella architecture, protocols are defined in shared core applications and implemented across dependent applications:

```
prismatic_storage_core/          # Defines Storable protocol
    |
    +-- prismatic_perimeter/     # Implements Storable for Asset, Finding, Rating
    +-- prismatic_agents/        # Implements Storable for AgentSpec, TaskResult
    +-- prismatic_osint/         # Implements Storable for IntelRecord, Entity
    +-- prismatic_hawkeye/       # Implements Storable for Visitor, Session
```

This architecture ensures that the protocol definition has no knowledge of its implementations, maintaining clean dependency boundaries. Each application adds its own implementations without creating circular dependencies.

## Usage in Prismatic Platform

Within the 90-app umbrella, protocols serve as the primary mechanism for type-level polymorphism across application boundaries.

### Platform Protocol Registry

| Protocol | Defined In | Implementations | Purpose |
|----------|-----------|----------------|---------|
| `Storable` | `prismatic_storage_core` | 12 types | Uniform storage serialization |
| `Renderable` | `prismatic_web` | 8 types | Dashboard display rendering |
| `Auditable` | `prismatic_safety` | 15 types | Audit trail generation |
| `Classifiable` | `prismatic_safety` | 10 types | Security classification |
| `Scoreable` | `prismatic_perimeter` | 5 types | Security rating calculation |
| `Indexable` | `prismatic_storage_meilisearch` | 7 types | Search index preparation |

### Protocol Usage Statistics

| Metric | Value |
|--------|-------|
| **Custom protocols defined** | 6 |
| **Protocol implementations** | 57 |
| **Built-in protocol implementations** | 30+ (`String.Chars`, `Inspect`, `Jason.Encoder`) |
| **Cross-application implementations** | 42 (implementations in apps different from protocol definition) |
| **Consolidation enabled** | Production and staging environments |

## Best Practices

**Define protocols in core/shared applications.** Protocol definitions should live in applications with minimal dependencies (like `prismatic_storage_core`), not in applications that implement them. This prevents circular dependencies and enables any downstream application to add implementations.

**Keep protocol functions focused and minimal.** Each protocol should define the smallest set of functions needed for its purpose. A protocol with ten functions is harder to implement correctly than three focused protocols with three functions each. Prefer protocol composition over monolithic protocols.

**Always implement `@fallback_to_any` deliberately.** Decide explicitly whether unimplemented types should raise a `Protocol.UndefinedError` (the default, which catches bugs early) or fall through to a default implementation. For display protocols like `Renderable`, a fallback to `inspect/2` is reasonable. For storage protocols like `Storable`, failing loudly on unimplemented types prevents silent data corruption.

**Use `@derive` for simple implementations.** When a struct's protocol implementation follows a standard pattern, use `@derive` to generate it automatically rather than writing `defimpl` blocks:

```elixir
defmodule PrismaticAgents.TaskResult do
  @derive {Jason.Encoder, only: [:task_id, :status, :result, :completed_at]}
  @derive {Inspect, only: [:task_id, :status]}
  defstruct [:task_id, :status, :result, :agent_id, :completed_at]
end
```

**Test each implementation independently.** Protocol implementations for different types can have subtly different behavior. Test each `defimpl` block with type-specific test cases rather than relying solely on generic protocol tests.

## Common Pitfalls

**Confusing protocols with behaviours.** Protocols dispatch on data type; behaviours dispatch on module. Using a protocol where a behaviour is needed (or vice versa) leads to awkward APIs. If the question is "which backend should handle this?", use a behaviour. If the question is "how should this data type be processed?", use a protocol.

**Missing implementations in production.** If protocol consolidation is enabled and an implementation is defined in a dependency that is not loaded, calls will fail with `Protocol.UndefinedError`. Ensure all applications defining implementations are included in the release.

**Performance assumptions in unconsolidated mode.** Protocol calls in development (unconsolidated) are significantly slower than in production (consolidated). Do not benchmark protocol dispatch performance in dev mode and assume it reflects production behavior.

**Implementing protocols for built-in types carelessly.** Implementing a protocol for `Map` or `List` affects all maps and lists in the application, not just the ones you intend. Prefer implementing for specific structs rather than generic types unless the implementation is genuinely universal.

**Circular protocol dependencies.** If protocol A's implementation for type X calls protocol B, and protocol B's implementation for type Y calls protocol A, the system can enter infinite recursion. Keep protocol implementations self-contained and avoid cross-protocol calls within implementations.

**Not consolidating in production.** Forgetting to enable protocol consolidation in production releases leaves significant performance on the table. The default Mix configuration consolidates in `:prod` but custom build configurations may inadvertently disable it.

## Related Concepts

- [Behaviour](@/glossary/behaviour.md) -- Module-level callback specifications complementing protocols
- [Adapter Pattern](@/glossary/adapter-pattern.md) -- Storage abstraction using both protocols and behaviours
- [OTP](@/glossary/otp.md) -- Framework providing the runtime infrastructure for protocol dispatch
- [Elixir](@/glossary/elixir.md) -- The language providing the protocol mechanism
- [Umbrella Application](@/glossary/umbrella-application.md) -- Cross-app protocol definitions for shared contracts
- [Prismatic Storage](@/glossary/prismatic-storage.md) -- Primary consumer of the Storable protocol
- [SPARKLINE](@/glossary/sparkline.md) -- Contract system leveraging protocol-based type dispatch

## See Also

- [Technologies](@/technologies/_index.md) -- Technology stack details
- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Apps](@/apps/_index.md) -- Umbrella applications implementing protocols across boundaries

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)