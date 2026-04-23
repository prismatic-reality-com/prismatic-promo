+++
title = "Adapter"
description = "The Adapter pattern provides a standardized interface abstraction that allows interchangeable backend implementations, forming the foundation of the Prismatic Platform's pluggable storage, API, and integration architecture."
weight = 30

[extra]
category = "design-patterns"
tags = ["glossary", "adapter", "design-pattern", "elixir", "behaviour", "storage", "architecture", "platform", "protocol", "pluggable"]
related_terms = ["adapter-pattern", "behaviour", "protocol", "storage-pattern", "dependency-injection", "composability", "modularity", "ecto", "ets", "meilisearch"]
difficulty = "intermediate"
importance = "critical"
date_created = "2026-02-22"
date_modified = "2026-02-22"
version = "2.0.0"
platforms = ["prismatic", "elixir"]
domain = "software-architecture"
audience = ["developers", "architects"]
prerequisite_knowledge = ["elixir-behaviours", "protocol-basics", "otp-fundamentals", "functional-programming-concepts"]
learning_outcomes = ["Understand the Adapter pattern in Elixir using behaviours and protocols", "Implement pluggable storage backends with contract testing", "Design configuration-driven backend selection for different environments", "Build adapter registries for dynamic backend resolution"]
quality_score = 95
word_count_target = 2500
cross_references = 10
section_count = 14
has_code_examples = true
has_diagrams = false
review_status = "comprehensive"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "17 min"
technical_level = "intermediate-to-advanced"
domain_category = "software-architecture"
implementation_status = "production"
authority_level = "L3-strategic"
code_examples = true
version_introduced = "0.1.0"
stability_level = "stable"
keywords = ["adapter", "behaviour", "protocol", "storage", "pluggable", "backend", "abstraction", "interface", "dependency-inversion", "hexagonal-architecture"]
word_count = 1461
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Adapter - Prismatic Platform"
+++

## Overview

An **Adapter** is a structural design pattern that provides a standardized interface between two incompatible interfaces, enabling components to collaborate without modifying their existing code. In the [Prismatic Platform](@/glossary/application.md), the Adapter pattern is elevated to an architectural principle: every external dependency, storage backend, and integration point is accessed through a well-defined adapter abstraction backed by Elixir [behaviours](@/glossary/behaviour.md) and [protocols](@/glossary/protocol.md). This enables hot-swappable backends, comprehensive testing through contract test suites, and seamless evolution of the platform's infrastructure without breaking application code.

The platform's architecture is fundamentally built on adapters. The `prismatic_storage_core` application defines abstract behaviours that describe what a storage backend must do, while concrete implementations in `prismatic_storage_ecto`, `prismatic_storage_ets`, `prismatic_storage_meilisearch`, and `prismatic_storage_kuzu` provide the how. This separation means that application code never directly depends on [PostgreSQL](@/glossary/postgresql.md), [ETS](@/glossary/ets.md), or any specific technology -- it depends only on the contract.

---

## Definition and Origins

The Adapter pattern originates from the Gang of Four (GoF) design patterns, published in 1994, where it serves as a bridge between interfaces that cannot directly communicate. In object-oriented languages, adapters typically involve class inheritance or composition. In [Elixir](@/glossary/elixir.md) and the BEAM ecosystem, the Adapter pattern takes a more elegant form through behaviours (compile-time contracts) and protocols (runtime polymorphic dispatch).

The pattern is also known as "Wrapper" in some contexts, and it is closely related to the Ports and Adapters (Hexagonal) architecture proposed by Alistair Cockburn. In hexagonal architecture, the application core defines "ports" (interfaces) and "adapters" translate between the application core and external systems (databases, APIs, UI).

This architectural decision has profound implications for the Prismatic Platform:

- **Backend portability**: Switching from ETS to PostgreSQL requires zero application code changes.
- **Testing isolation**: Tests run against in-memory ETS adapters, eliminating database setup overhead.
- **Gradual migration**: New storage backends can be introduced alongside existing ones, with traffic gradually shifted.
- **Performance optimization**: Hot paths can use ETS adapters while cold paths use [Ecto](@/glossary/ecto.md), all through the same interface.

The platform currently maintains adapters across multiple domains: storage (5 backends), search ([Meilisearch](@/glossary/meilisearch.md)), graph ([KuzuDB](@/glossary/kuzudb.md)), AI inference ([Ollama](@/glossary/ollama.md)), and external integrations (120+ OSINT providers).

---

## Technical Deep Dive

### Elixir Behaviours as Adapter Contracts

Behaviours in Elixir define a set of function signatures that implementing modules must provide. The compiler verifies compliance at compile time, catching missing implementations before runtime:

```elixir
defmodule PrismaticStorageCore.Adapter do
  @moduledoc """
  Core behaviour defining the contract all storage adapters must implement.
  This is the foundational adapter interface for the Prismatic Platform.
  """

  @type entity :: map()
  @type id :: binary() | integer()
  @type opts :: keyword()
  @type error :: {:error, term()}

  @callback get(id(), opts()) :: {:ok, entity()} | {:error, :not_found} | error()
  @callback list(opts()) :: {:ok, [entity()]} | error()
  @callback create(map(), opts()) :: {:ok, entity()} | error()
  @callback update(id(), map(), opts()) :: {:ok, entity()} | {:error, :not_found} | error()
  @callback delete(id(), opts()) :: {:ok, entity()} | {:error, :not_found} | error()
  @callback count(opts()) :: {:ok, non_neg_integer()} | error()
end
```

### Protocol-Based Polymorphism

While behaviours enforce contracts at the module level, Elixir protocols enable polymorphic dispatch based on data types. The platform uses protocols for serialization, rendering, and cross-format conversion:

```elixir
defprotocol PrismaticStorageCore.Serializable do
  @moduledoc """
  Protocol for entities that can be serialized across different
  storage backends. Each adapter may serialize differently.
  """

  @spec to_storage(t(), keyword()) :: {:ok, map()} | {:error, term()}
  def to_storage(entity, opts \\ [])

  @spec from_storage(t(), map(), keyword()) :: {:ok, t()} | {:error, term()}
  def from_storage(entity, data, opts \\ [])
end

defimpl PrismaticStorageCore.Serializable, for: Prismatic.Domain.Asset do
  def to_storage(asset, _opts) do
    {:ok, %{
      id: asset.id,
      type: Atom.to_string(asset.type),
      value: asset.value,
      metadata: Jason.encode!(asset.metadata),
      discovered_at: asset.discovered_at
    }}
  end

  def from_storage(_asset, data, _opts) do
    {:ok, %Prismatic.Domain.Asset{
      id: data["id"],
      type: String.to_existing_atom(data["type"]),
      value: data["value"],
      metadata: Jason.decode!(data["metadata"]),
      discovered_at: data["discovered_at"]
    }}
  end
end
```

### Adapter Registry and Dynamic Dispatch

The platform maintains a runtime registry of available adapters, enabling dynamic backend selection:

```elixir
defmodule PrismaticStorageCore.AdapterRegistry do
  @moduledoc """
  Runtime registry for storage adapters. Enables dynamic backend
  selection and hot-swapping without application restart.
  """

  use GenServer

  @type adapter_config :: %{
          module: module(),
          priority: non_neg_integer(),
          capabilities: [atom()],
          health: :healthy | :degraded | :unavailable
        }

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec register(atom(), module(), keyword()) :: :ok
  def register(name, module, opts \\ []) do
    GenServer.call(__MODULE__, {:register, name, module, opts})
  end

  @spec resolve(atom()) :: {:ok, module()} | {:error, :not_found}
  def resolve(name) do
    GenServer.call(__MODULE__, {:resolve, name})
  end

  @spec resolve_by_capability(atom()) :: {:ok, module()} | {:error, :no_capable_adapter}
  def resolve_by_capability(capability) do
    GenServer.call(__MODULE__, {:resolve_capability, capability})
  end

  @impl true
  def init(_opts) do
    {:ok, %{adapters: %{}}}
  end

  @impl true
  def handle_call({:register, name, module, opts}, _from, state) do
    config = %{
      module: module,
      priority: Keyword.get(opts, :priority, 50),
      capabilities: Keyword.get(opts, :capabilities, []),
      health: :healthy
    }

    {:reply, :ok, put_in(state, [:adapters, name], config)}
  end

  @impl true
  def handle_call({:resolve, name}, _from, state) do
    case Map.get(state.adapters, name) do
      %{module: module, health: health} when health != :unavailable ->
        {:reply, {:ok, module}, state}

      _ ->
        {:reply, {:error, :not_found}, state}
    end
  end

  @impl true
  def handle_call({:resolve_capability, capability}, _from, state) do
    result =
      state.adapters
      |> Enum.filter(fn {_name, config} ->
        capability in config.capabilities and config.health != :unavailable
      end)
      |> Enum.sort_by(fn {_name, config} -> config.priority end)
      |> List.first()

    case result do
      {_name, %{module: module}} -> {:reply, {:ok, module}, state}
      nil -> {:reply, {:error, :no_capable_adapter}, state}
    end
  end
end
```

### Contract Testing

Every adapter must pass the same contract test suite, ensuring behavioural equivalence across backends:

```elixir
defmodule PrismaticStorageCore.AdapterContractTest do
  @moduledoc """
  Shared contract test suite for all storage adapters.
  Include in adapter-specific test modules to verify compliance.
  """

  defmacro __using__(opts) do
    adapter_module = Keyword.fetch!(opts, :adapter_module)

    quote do
      use ExUnit.Case, async: true

      @adapter unquote(adapter_module)

      describe "#{inspect(@adapter)} contract compliance" do
        test "create/2 returns {:ok, entity} on success" do
          assert {:ok, entity} = @adapter.create(%{name: "test"}, [])
          assert is_map(entity)
        end

        test "get/2 returns {:error, :not_found} for missing entity" do
          assert {:error, :not_found} = @adapter.get("nonexistent-id", [])
        end

        test "create then get returns the same entity" do
          {:ok, created} = @adapter.create(%{name: "roundtrip"}, [])
          {:ok, fetched} = @adapter.get(created.id, [])
          assert created.name == fetched.name
        end

        test "delete/2 removes the entity" do
          {:ok, entity} = @adapter.create(%{name: "to-delete"}, [])
          assert {:ok, _} = @adapter.delete(entity.id, [])
          assert {:error, :not_found} = @adapter.get(entity.id, [])
        end
      end
    end
  end
end
```

---

## Implementation in Prismatic Platform

### Storage Adapter Hierarchy

The platform's storage layer follows a strict hierarchy of abstractions:

```
PrismaticStorageCore (behaviours, protocols, contracts)
    |
    +-- PrismaticStorageEcto (PostgreSQL via Ecto)
    +-- PrismaticStorageEts (in-memory ETS tables)
    +-- PrismaticStorageMeilisearch (full-text search)
    +-- PrismaticStorageKuzu (graph database via KuzuDB)
    +-- PrismaticStorageRedis (caching and pub/sub)
```

Each adapter implements the same `PrismaticStorageCore.Adapter` behaviour, passes the same contract test suite, and can be swapped at configuration time.

### OSINT Provider Adapters

The 120+ OSINT tool integrations each follow the adapter pattern. Czech registry adapters (ARES, Justice, ISIR), global providers (Shodan, VirusTotal, Censys), and sanctions screening (EU, OFAC, UN) all implement a common `Provider` behaviour:

```elixir
defmodule Prismatic.OSINT.Provider do
  @callback search(query :: binary(), opts :: keyword()) ::
              {:ok, [map()]} | {:error, term()}

  @callback capabilities() :: [atom()]

  @callback rate_limit() :: %{
              requests_per_second: pos_integer(),
              burst_limit: pos_integer()
            }
end
```

### Configuration-Driven Backend Selection

Adapter selection is configuration-driven, enabling different backends per environment:

```elixir
# config/dev.exs
config :prismatic_storage_core,
  default_adapter: PrismaticStorageEts

# config/test.exs
config :prismatic_storage_core,
  default_adapter: PrismaticStorageEts,
  async_compatible: true

# config/prod.exs
config :prismatic_storage_core,
  default_adapter: PrismaticStorageEcto,
  fallback_adapter: PrismaticStorageEts
```

---

## Comparison with Alternatives

| Approach | Language Support | Compile-Time Safety | Runtime Flexibility | Prismatic Usage |
|----------|-----------------|--------------------|--------------------|-----------------|
| Elixir Behaviours | Native | Full | Module-level | Primary contract mechanism |
| Elixir Protocols | Native | Partial | Data-type dispatch | Serialization, rendering |
| Interface (Java/Go) | Language feature | Full | Instance-level | N/A |
| Duck Typing (Python) | Convention | None | Full | N/A |
| Strategy Pattern (OOP) | Manual | Varies | Instance-level | Conceptual basis |
| [Dependency Injection](@/glossary/dependency-injection.md) | Framework | Framework-dependent | Full | Complementary |

### Behaviours vs Protocols

Behaviours and protocols serve complementary roles in the adapter architecture:

- **Behaviours**: Define what a module must implement. Used for backend contracts (storage, API, provider). Resolved at compile time or via module reference.
- **Protocols**: Define what a data type can do. Used for serialization, formatting, comparison. Resolved at runtime via data-type dispatch.

---

## Best Practices

1. **Define behaviours in the core application.** Never define adapter contracts in the implementing application. The contract lives in `prismatic_storage_core`, implementations live in `prismatic_storage_ecto`, etc.

2. **Use @callback with full typespecs.** Every callback must have complete type specifications. This enables [Dialyzer](@/glossary/dialyzer.md) to verify implementations at compile time.

3. **Implement contract test suites.** Every adapter must pass the same test suite. Use `PrismaticStorageCore.AdapterContractTest` as a shared test macro.

4. **Return tagged tuples consistently.** Every adapter function returns `{:ok, result}` or `{:error, reason}`. Never raise exceptions for expected failure modes.

5. **Keep adapters stateless.** Adapters should not maintain internal state. State management belongs in the caller or in dedicated [GenServer](@/glossary/genserver.md) processes.

6. **Support capability queries.** Adapters should expose their capabilities (transactions, full-text search, graph queries) so the registry can route requests appropriately.

7. **Version adapter interfaces carefully.** Adding new callbacks to a behaviour is a breaking change for all implementations. Use optional callbacks (`@optional_callbacks`) for non-critical extensions.

8. **Benchmark across backends.** Regular performance benchmarking ensures that adapter abstractions do not introduce unacceptable overhead.

---

## Common Pitfalls

1. **Leaky abstractions.** Exposing backend-specific features through the adapter interface. The interface must represent the lowest common denominator, with backend-specific features accessed through separate extension modules.

2. **God adapter.** Creating a single massive behaviour with dozens of callbacks. Split into focused behaviours (CRUD, search, batch, transaction) and compose them.

3. **Missing contract tests.** Assuming that if one adapter works, all adapters work. Each backend has different edge cases around null handling, encoding, [concurrency](@/glossary/concurrency.md), and error modes.

4. **Configuration coupling.** Hardcoding adapter modules instead of reading from configuration. This prevents runtime switching and complicates testing.

5. **Ignoring adapter health.** Not monitoring adapter availability. If a backend goes down, the registry should route to healthy alternatives rather than returning errors.

6. **Inconsistent error semantics.** Different adapters returning different error atoms for the same failure mode. Normalize error types at the adapter level.

---

## Use Cases

### Multi-Backend Storage

A single entity type can be stored in PostgreSQL for durability, cached in ETS for performance, and indexed in Meilisearch for full-text search -- all through the same adapter interface with automatic synchronization.

### Test Isolation

Test suites use ETS adapters, eliminating database setup, migrations, and cleanup. Tests run in parallel with complete isolation because each test process gets its own ETS table.

### OSINT Provider Integration

The 120+ OSINT providers each implement the `Provider` behaviour. Application code queries a domain through the adapter interface without knowing whether the data comes from ARES, Shodan, or a cached local result.

### Storage Migration

Migrating from one database to another (e.g., adding KuzuDB for graph queries) requires only implementing the adapter behaviour and updating configuration. Zero application code changes.

### Blue-Green Backend Deployment

New storage backends are deployed alongside existing ones. Traffic is gradually shifted from the old adapter to the new one, with the adapter registry managing the transition.

### Performance Optimization Through Adapter Tiering

The platform employs intelligent adapter tiering to optimize performance without sacrificing functionality. Hot data paths use ETS adapters for sub-millisecond access, while cold storage uses Ecto adapters for durability. The adapter registry can route operations based on access patterns, data age, and performance requirements.

For example, user session data uses ETS for immediate access but persists to PostgreSQL for recovery after restarts. Search queries first check Meilisearch for indexed content, then fall back to database full-text search if no index exists. Graph relationships leverage KuzuDB for complex queries but cache simple lookups in ETS.

This tiering is transparent to application code -- the same interface serves all scenarios, but the underlying implementation varies by performance characteristics and data lifecycle requirements.

### Compliance and Audit Requirements

In regulated environments, different storage backends may have different compliance characteristics. PostgreSQL provides ACID transactions and audit logging required for financial data. ETS offers no persistence guarantees suitable only for cache scenarios. The adapter pattern enables compliance-aware routing where sensitive data automatically uses compliant backends while performance-critical operations use optimized storage.

Each adapter documents its compliance characteristics (persistence guarantees, audit logging, encryption at rest) through the capability system, allowing automatic routing based on data classification.

---

## Related Technologies

| Technology | Relationship to Adapter Pattern |
|---|---|
| [Adapter Pattern](@/glossary/adapter-pattern.md) | The formal design pattern theory behind the Prismatic adapter architecture |
| [Behaviour](@/glossary/behaviour.md) | Elixir's compile-time contract mechanism used to define adapter interfaces |
| [Protocol](@/glossary/protocol.md) | Elixir's data-type polymorphism mechanism complementing behaviours |
| [Composability](@/glossary/composability.md) | Building complex systems from small, interchangeable adapter components |
| [Dependency Injection](@/glossary/dependency-injection.md) | Providing adapter implementations to consuming modules at runtime |
| [Modularity](@/glossary/modularity.md) | Architectural property enabled by clean adapter boundaries |
| [Storage Pattern](@/glossary/storage-pattern.md) | Data persistence patterns implemented through adapter abstraction |
| [Ecto](@/glossary/ecto.md) | The primary database adapter for PostgreSQL interactions |
| [ETS](@/glossary/ets.md) | The in-memory storage adapter for development, testing, and caching |
| [Meilisearch](@/glossary/meilisearch.md) | The full-text search adapter providing indexed search capabilities |

---

## See Also

- [Layered Architecture](@/glossary/layered-architecture.md) -- Architectural style that formalizes the ports-and-adapters approach
- [Microservices](@/glossary/microservices.md) -- Distributed architecture where adapters manage inter-service communication
- [API Gateway](@/glossary/api-gateway.md) -- Gateway pattern using adapters to normalize external API access
- [Circuit Breaker](@/glossary/circuit-breaker.md) -- Resilience pattern often combined with adapters for fault-tolerant backend access
- [KuzuDB](@/glossary/kuzudb.md) -- Graph database adapter for relationship-heavy data queries

---

## Connect & Contribute
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)
- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
