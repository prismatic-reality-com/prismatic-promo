+++
title = "Behaviour Pattern"
weight = 50
[extra]
description = "A contract mechanism in Elixir/OTP where a module defines callback specifications that implementing modules must satisfy, enabling polymorphism and dependency injection in the Prismatic Platform"
category = "architecture"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate"
domain_category = "design-patterns"
related_concepts = ["behaviour", "protocol", "adapter-pattern", "genserver", "otp-behaviour"]
implementation_status = "production"
authority_level = "platform-core"
difficulty_rating = 6
prerequisites = ["elixir", "otp", "genserver", "module-attributes"]
learning_path = ["elixir", "otp", "genserver", "behaviour-pattern", "adapter-pattern", "protocol"]
interactive_demos = ["/labs/glossary/behaviour-pattern"]
code_examples = ["storage adapter behaviour", "agent behaviour with callbacks", "behaviour-based dependency injection"]
external_resources = ["https://hexdocs.pm/elixir/behaviours.html", "https://hexdocs.pm/elixir/typespecs.html", "https://www.erlang.org/doc/design_principles/des_princ.html"]
version_introduced = "gen-3"
stability_level = "stable"
testing_scenarios = ["callback implementation completeness", "typespec compliance verification", "behaviour-based mock injection", "runtime dispatch correctness"]
keywords = ["Elixir behaviour pattern", "OTP behaviour callbacks", "behaviour contract", "callback specification", "behaviour-based polymorphism", "Elixir dependency injection", "adapter pattern behaviour", "behaviour vs protocol"]
tags = ["architecture", "elixir", "otp", "design-patterns", "contracts", "polymorphism"]
related_terms = ["behaviour", "protocol", "adapter-pattern", "genserver", "otp-behaviour", "dependency-injection", "supervision-tree", "gen-statem", "elixir", "otp"]
word_count = 1462
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Behaviour Pattern - Prismatic Platform"
+++

## Definition

A **Behaviour Pattern** is a contract mechanism in [Elixir](/glossary/elixir/)/[OTP](/glossary/otp/) where a module defines a set of callback function specifications (`@callback` declarations with typespecs) that implementing modules must satisfy. When a module declares `@behaviour SomeBehaviour`, the Elixir compiler verifies at compile time that the module implements all required callbacks with correct arities. This provides a form of structural typing that enables polymorphism, dependency injection, and runtime module swapping without sacrificing compile-time safety.

The behaviour pattern is distinct from [protocols](/glossary/protocol/) in Elixir, which dispatch based on data type. Behaviours dispatch based on module identity -- you choose which implementation module to use, and all implementations share the same function signatures. This makes behaviours ideal for infrastructure contracts (storage adapters, authentication strategies, communication transports) where the choice of implementation is a configuration decision, not a data-driven dispatch.

In the [Prismatic Platform](/glossary/aiad/), the behaviour pattern is the primary mechanism for defining contracts between umbrella applications. Storage adapters, agent definitions, protocol engines, quality checkers, and OSINT tool adapters all use behaviours to specify their contracts, enabling clean separation between interface and implementation across 115 umbrella applications.

## Overview

The behaviour pattern in Elixir has its roots in Erlang's OTP design principles, where behaviours like `gen_server`, `gen_event`, and `supervisor` define the callback interfaces that application modules must implement. Elixir elevates this pattern from a convention to a compiler-enforced contract through `@behaviour` and `@callback` attributes.

Understanding the behaviour pattern requires grasping three key ideas:

1. **Separation of generic and specific logic.** The behaviour module contains the generic infrastructure (process management, message routing, error handling), while the implementing module contains only the domain-specific callbacks. [GenServer](/glossary/genserver/) is the canonical example: it handles process lifecycle and message dispatch; the implementing module handles business logic in `handle_call/3`, `handle_cast/2`, etc.

2. **Compile-time contract verification.** When a module declares `@behaviour MyBehaviour`, the compiler checks that all required `@callback` functions are implemented. Missing callbacks produce compilation warnings (or errors with `--warnings-as-errors`). This catches interface violations before runtime.

3. **Runtime module dispatch.** Because the implementing module is selected at runtime (via configuration, function parameters, or process state), the system can swap implementations without changing the calling code. This is the foundation of dependency injection in Elixir.

### Behaviour vs. Protocol vs. Interface

| Feature | Behaviour | Protocol | Interface (OOP) |
|---------|-----------|----------|-----------------|
| **Dispatch** | Module-based (explicit) | Data type-based (implicit) | Object type-based (vtable) |
| **Compile-time check** | Yes (@callback) | Yes (defimpl) | Yes (abstract methods) |
| **Polymorphism type** | Ad hoc (choose module) | Data-driven (type decides) | Inheritance-based |
| **Multiple implementations** | Via configuration | Via data type | Via subclassing |
| **Extension** | New module implementing behaviour | defimpl for new type | Subclass or mixin |
| **Typical use** | Infrastructure contracts | Data transformation | Object hierarchies |
| **Elixir idiom** | `@behaviour` + `@callback` | `defprotocol` + `defimpl` | N/A (not OOP) |

## Technical Details

### Defining a Behaviour

A behaviour is defined by a module that declares `@callback` specifications using the same typespec syntax as `@spec`:

```elixir
defmodule Prismatic.StorageCore.Adapter do
  @moduledoc """
  Behaviour defining the contract for storage adapters in the
  Prismatic Platform. All storage backends (ETS, Ecto, Meilisearch,
  KuzuDB) must implement this behaviour.
  """

  @type key :: term()
  @type value :: term()
  @type query :: map()
  @type opts :: keyword()

  @doc "Initialize the storage adapter with configuration."
  @callback init(config :: map()) :: {:ok, state :: term()} | {:error, reason :: term()}

  @doc "Store a value under the given key."
  @callback put(key(), value(), opts()) :: {:ok, key()} | {:error, term()}

  @doc "Retrieve a value by key."
  @callback get(key(), opts()) :: {:ok, value()} | {:error, :not_found} | {:error, term()}

  @doc "Delete a value by key."
  @callback delete(key(), opts()) :: :ok | {:error, term()}

  @doc "Query the storage with a structured query."
  @callback query(query(), opts()) :: {:ok, [value()]} | {:error, term()}

  @doc "Return storage health and statistics."
  @callback health_check() :: {:ok, map()} | {:error, term()}

  @optional_callbacks [health_check: 0]
end
```

### Implementing a Behaviour

Implementing modules declare `@behaviour` and provide all required callbacks:

```elixir
defmodule Prismatic.StorageEts.Adapter do
  @moduledoc """
  ETS-backed storage adapter implementing the Prismatic storage contract.
  Uses ETS tables for high-performance in-memory storage with
  concurrent read access.
  """

  @behaviour Prismatic.StorageCore.Adapter

  @impl Prismatic.StorageCore.Adapter
  def init(config) do
    table_name = Map.get(config, :table_name, :prismatic_storage)
    opts = [:set, :public, :named_table, read_concurrency: true]

    case :ets.new(table_name, opts) do
      ^table_name -> {:ok, %{table: table_name}}
      _ -> {:error, :table_creation_failed}
    end
  rescue
    ArgumentError -> {:error, :table_already_exists}
  end

  @impl Prismatic.StorageCore.Adapter
  def put(key, value, opts) do
    table = Keyword.get(opts, :table, :prismatic_storage)
    ttl = Keyword.get(opts, :ttl, :infinity)

    entry = case ttl do
      :infinity -> {key, value, nil}
      seconds -> {key, value, System.monotonic_time(:second) + seconds}
    end

    :ets.insert(table, entry)
    {:ok, key}
  end

  @impl Prismatic.StorageCore.Adapter
  def get(key, opts) do
    table = Keyword.get(opts, :table, :prismatic_storage)

    case :ets.lookup(table, key) do
      [{^key, value, nil}] ->
        {:ok, value}

      [{^key, value, expiry}] ->
        if System.monotonic_time(:second) < expiry do
          {:ok, value}
        else
          :ets.delete(table, key)
          {:error, :not_found}
        end

      [] ->
        {:error, :not_found}
    end
  end

  @impl Prismatic.StorageCore.Adapter
  def delete(key, opts) do
    table = Keyword.get(opts, :table, :prismatic_storage)
    :ets.delete(table, key)
    :ok
  end

  @impl Prismatic.StorageCore.Adapter
  def query(query_params, opts) do
    table = Keyword.get(opts, :table, :prismatic_storage)
    match_spec = build_match_spec(query_params)

    results = :ets.select(table, match_spec)
    {:ok, results}
  end

  @impl Prismatic.StorageCore.Adapter
  def health_check do
    tables = :ets.all()
    prismatic_tables = Enum.filter(tables, &is_atom/1)

    {:ok, %{
      table_count: length(prismatic_tables),
      memory_bytes: Enum.sum(Enum.map(prismatic_tables, fn t ->
        try do
          :ets.info(t, :memory) * :erlang.system_info(:wordsize)
        rescue
          _ -> 0
        end
      end)),
      status: :healthy
    }}
  end

  @spec build_match_spec(map()) :: list()
  defp build_match_spec(%{prefix: prefix}) do
    [{
      {:"$1", :"$2", :"$3"},
      [{:andalso,
        {:is_binary, :"$1"},
        {:==, {:binary_part, :"$1", {0, byte_size(prefix)}}, prefix}
      }],
      [:"$2"]
    }]
  end

  defp build_match_spec(_), do: [{{:_, :"$1", :_}, [], [:"$1"]}]
end
```

### Behaviour-Based Dependency Injection

The behaviour pattern enables clean dependency injection through compile-time configuration:

```elixir
defmodule Prismatic.Storage do
  @moduledoc """
  Storage facade that delegates to the configured adapter module.
  The adapter is determined at compile time from application config,
  enabling environment-specific implementations (ETS for dev/test,
  Ecto for production).
  """

  @adapter Application.compile_env(:prismatic, :storage_adapter, Prismatic.StorageEts.Adapter)

  @spec put(term(), term(), keyword()) :: {:ok, term()} | {:error, term()}
  def put(key, value, opts \\ []) do
    @adapter.put(key, value, opts)
  end

  @spec get(term(), keyword()) :: {:ok, term()} | {:error, :not_found} | {:error, term()}
  def get(key, opts \\ []) do
    @adapter.get(key, opts)
  end

  @spec delete(term(), keyword()) :: :ok | {:error, term()}
  def delete(key, opts \\ []) do
    @adapter.delete(key, opts)
  end

  @spec query(map(), keyword()) :: {:ok, [term()]} | {:error, term()}
  def query(query_params, opts \\ []) do
    @adapter.query(query_params, opts)
  end
end
```

Configuration in `config/config.exs`:

```elixir
# config/config.exs (development)
config :prismatic, :storage_adapter, Prismatic.StorageEts.Adapter

# config/prod.exs (production)
config :prismatic, :storage_adapter, Prismatic.StorageEcto.Adapter

# config/test.exs (testing)
config :prismatic, :storage_adapter, Prismatic.StorageEts.Adapter
```

### Runtime Module Dispatch

For cases where the implementation must be selected at runtime (not compile time), pass the module as a parameter:

```elixir
defmodule Prismatic.Agent.Runtime do
  @moduledoc """
  Runtime dispatch for agent behaviours. The implementing module
  is resolved at runtime based on agent configuration, enabling
  dynamic agent loading and hot swapping.
  """

  @spec execute(module(), command :: term(), state :: map()) ::
    {:ok, result :: term(), map()} | {:error, term()}
  def execute(agent_module, command, state) do
    with :ok <- verify_behaviour(agent_module),
         {:ok, result, new_state} <- agent_module.handle_command(command, state) do
      {:ok, result, new_state}
    end
  end

  @spec verify_behaviour(module()) :: :ok | {:error, :missing_behaviour}
  defp verify_behaviour(module) do
    behaviours =
      module.module_info(:attributes)
      |> Keyword.get_values(:behaviour)
      |> List.flatten()

    if Prismatic.Agent.Behaviour in behaviours do
      :ok
    else
      {:error, :missing_behaviour}
    end
  end
end
```

### Behaviour Composition

Complex systems often compose multiple behaviours. A module can implement several behaviours simultaneously, each providing a different facet of its contract:

```elixir
defmodule Prismatic.OsintAdapter.Shodan do
  @moduledoc """
  Shodan OSINT adapter implementing multiple behaviour contracts:
  data source, rate limited, and health monitored.
  """

  @behaviour Prismatic.Osint.DataSource
  @behaviour Prismatic.RateLimiter.Limitable
  @behaviour Prismatic.Health.Monitorable

  # DataSource callbacks
  @impl Prismatic.Osint.DataSource
  def search(query, opts) do
    with {:ok, _} <- check_rate_limit(),
         {:ok, response} <- make_api_call(query, opts) do
      {:ok, parse_response(response)}
    end
  end

  @impl Prismatic.Osint.DataSource
  def source_metadata do
    %{
      name: "Shodan",
      category: :global,
      reliability: 0.85,
      rate_limit: {1, :second}
    }
  end

  # RateLimiter callbacks
  @impl Prismatic.RateLimiter.Limitable
  def rate_limit_config do
    %{requests_per_second: 1, burst: 5, cooldown_ms: 1000}
  end

  # Health callbacks
  @impl Prismatic.Health.Monitorable
  def health_check do
    case make_api_call(%{query: "test"}, timeout: 5000) do
      {:ok, _} -> {:ok, %{status: :healthy, latency_ms: 0}}
      {:error, reason} -> {:error, %{status: :degraded, reason: reason}}
    end
  end

  defp check_rate_limit do
    Prismatic.RateLimiter.check(__MODULE__)
  end

  defp make_api_call(_query, _opts) do
    # Implementation details
    {:ok, %{results: []}}
  end

  defp parse_response(response), do: response
end
```

### Behaviour Contract Testing

The platform uses a contract testing pattern to verify all implementations of a behaviour:

```elixir
defmodule Prismatic.StorageCore.AdapterContractTest do
  @moduledoc """
  Contract test module for storage adapter behaviours.
  Include in any adapter test module to verify contract compliance.
  All implementations must pass these tests identically.
  """

  defmacro __using__(opts) do
    adapter_module = Keyword.fetch!(opts, :adapter_module)

    quote do
      describe "#{inspect(unquote(adapter_module))} contract compliance" do
        setup do
          {:ok, _state} = unquote(adapter_module).init(%{table_name: :test_table})
          on_exit(fn -> :ets.delete_all_objects(:test_table) rescue _ -> :ok end)
          :ok
        end

        test "put/3 returns {:ok, key}" do
          assert {:ok, "key1"} = unquote(adapter_module).put("key1", "value1", table: :test_table)
        end

        test "get/2 returns {:ok, value} for existing key" do
          {:ok, _} = unquote(adapter_module).put("key2", "value2", table: :test_table)
          assert {:ok, "value2"} = unquote(adapter_module).get("key2", table: :test_table)
        end

        test "get/2 returns {:error, :not_found} for missing key" do
          assert {:error, :not_found} = unquote(adapter_module).get("nonexistent", table: :test_table)
        end

        test "delete/2 returns :ok" do
          {:ok, _} = unquote(adapter_module).put("key3", "value3", table: :test_table)
          assert :ok = unquote(adapter_module).delete("key3", table: :test_table)
          assert {:error, :not_found} = unquote(adapter_module).get("key3", table: :test_table)
        end

        test "query/2 returns {:ok, list}" do
          {:ok, _} = unquote(adapter_module).put("a", 1, table: :test_table)
          {:ok, _} = unquote(adapter_module).put("b", 2, table: :test_table)
          assert {:ok, results} = unquote(adapter_module).query(%{}, table: :test_table)
          assert is_list(results)
        end
      end
    end
  end
end
```

Usage in a specific adapter test:

```elixir
defmodule Prismatic.StorageEts.AdapterTest do
  use ExUnit.Case, async: true
  use Prismatic.StorageCore.AdapterContractTest, adapter_module: Prismatic.StorageEts.Adapter
end
```

## Implementation in Prismatic Platform

The behaviour pattern is pervasive across the Prismatic Platform's 115 umbrella applications. Every cross-application contract is defined as a behaviour:

### Storage Layer Behaviours

| Behaviour | Implementations | Purpose |
|-----------|----------------|---------|
| `StorageCore.Adapter` | ETS, Ecto, Meilisearch, KuzuDB | Unified storage interface |
| `StorageCore.Queryable` | ETS, Ecto, Meilisearch | Query execution contract |
| `StorageCore.Indexable` | Meilisearch, KuzuDB | Index management contract |

### Agent Behaviours

| Behaviour | Implementations | Purpose |
|-----------|----------------|---------|
| `Agent.Behaviour` | 530+ agent modules | Agent lifecycle and command handling |
| `Agent.Coordinatable` | L1-L3 commanders | Multi-agent coordination contract |
| `Agent.Reportable` | All agents with reporting | Report generation contract |

### Infrastructure Behaviours

| Behaviour | Implementations | Purpose |
|-----------|----------------|---------|
| `Registry.Behaviour` | ETS, Horde | Process registry abstraction |
| `Health.Monitorable` | All monitored services | Health check contract |
| `RateLimiter.Limitable` | All rate-limited services | Rate limit configuration |
| `Telemetry.Instrumentable` | All instrumented modules | Telemetry event contract |

### PrismaticSupervisor Backend Pattern

The [PrismaticSupervisor](/glossary/supervision/) uses behaviours to abstract the process registry backend, enabling ETS in development and Horde in production:

```elixir
defmodule PrismaticSupervisor.Registry.Behaviour do
  @moduledoc """
  Behaviour defining the contract for process registry backends.
  Enables transparent switching between ETS (single-node) and
  Horde (multi-node) implementations.
  """

  @callback register(name :: term(), pid()) :: {:ok, pid()} | {:error, {:already_registered, pid()}}
  @callback unregister(name :: term()) :: :ok
  @callback lookup(name :: term()) :: {:ok, pid()} | {:error, :not_found}
  @callback list_all() :: [{term(), pid()}]
  @callback count() :: non_neg_integer()
end
```

## Comparison with Alternatives

| Pattern | Compile-Time Safety | Runtime Flexibility | Data-Driven | Module-Driven | OTP Integration |
|---------|--------------------|--------------------|-------------|---------------|-----------------|
| **Behaviour** | Yes (@callback) | Yes (module param) | No | Yes | Native |
| **Protocol** | Yes (defimpl) | Automatic (type dispatch) | Yes | No | None |
| **Mox** | Yes (behaviour-based) | Test-only | No | Yes | None |
| **Pattern matching** | No | Yes | Yes | No | None |
| **Map of functions** | No | Yes | No | No | None |
| **Module attribute** | Compile-time only | No | No | Yes | None |

Behaviours are the correct choice when the implementation is selected by configuration or system context (which storage backend, which authentication strategy). Protocols are the correct choice when the implementation is determined by the data being processed (how to serialize this struct, how to display this value).

## Best Practices

**Always use `@impl` annotations on callback implementations.** The `@impl Behaviour` annotation serves two purposes: it documents which behaviour a function implements, and it triggers a compiler warning if the function does not match any callback in the declared behaviour. This catches typos and arity mismatches at compile time.

**Define typespecs on all callbacks.** The `@callback` declaration should include complete typespecs. This enables [Dialyzer](/glossary/dialyzer/) to verify that implementations return the correct types and that callers handle all possible return values.

**Use `@optional_callbacks` for genuinely optional functionality.** Not every implementation needs every callback. Mark callbacks as optional when a reasonable default exists. The behaviour module can provide a `__using__` macro that supplies default implementations for optional callbacks.

**Prefer compile-time dispatch for performance-critical paths.** When the implementing module is known at compile time (from `Application.compile_env`), use a module attribute rather than a runtime function call. This enables the compiler to inline the dispatch.

**Write contract tests that all implementations share.** Define a test module with `__using__` that generates tests for behaviour compliance. Every implementation should pass the identical set of contract tests, plus its own implementation-specific tests.

**Document the semantic contract, not just the type contract.** A typespec says "returns `{:ok, value} | {:error, reason}`". The `@doc` should explain what constitutes a valid value, under what conditions an error is returned, and what side effects (if any) the callback may produce.

## Common Pitfalls

**Ignoring compiler warnings about missing callbacks.** With `--warnings-as-errors` disabled, missing callback implementations produce warnings that are easy to overlook. Always compile with `--warnings-as-errors` (enforced in Prismatic's quality gates) to catch these at compile time.

**Behaviours with too many callbacks.** A behaviour with 20+ callbacks indicates a god interface. Split it into focused behaviours that each address a single concern. Modules can implement multiple behaviours, providing clean separation.

**Using behaviours where protocols are appropriate.** If the dispatch decision depends on the data type being processed, use a protocol. Using a behaviour for type-driven dispatch requires manual case statements, which defeats the purpose.

**Not testing contract compliance across implementations.** Each behaviour implementation must be tested against the same contract tests. Without shared contract tests, implementations drift apart over time, each handling edge cases differently.

**Leaking implementation details through the behaviour.** A behaviour should define callbacks in terms of the domain, not the implementation. `@callback init(config :: map())` is correct; `@callback setup_ets_table(name :: atom())` leaks the ETS implementation detail into the contract.

**Forgetting `@optional_callbacks` for extension points.** When adding new callbacks to an existing behaviour, make them optional to avoid breaking all existing implementations. Existing implementations continue to work; new implementations can opt in to the extended contract.

## Use Cases

### Storage Adapter Abstraction

The platform's storage layer uses behaviours to abstract over ETS, [Ecto](/glossary/ecto/), Meilisearch, and KuzuDB. Application code calls `Prismatic.Storage.get/2` without knowing which backend is active. In development, ETS provides zero-configuration speed; in production, Ecto provides PostgreSQL durability.

### Agent Definition Contracts

Each AIAD agent implements the `Agent.Behaviour` contract, which defines callbacks for initialization, command handling, health reporting, and coordination. This enables the agent runtime to manage any agent uniformly, regardless of its domain-specific logic.

### OSINT Tool Integration

Each of the 120 OSINT tool adapters implements the `Osint.DataSource` behaviour, providing a `search/2` callback with standardized input/output types. The coordinator dispatches queries to adapters without knowing their implementation details, enabling transparent addition of new data sources.

### Quality Check Extensibility

Quality checks in the platform implement the `Quality.Check` behaviour, which defines callbacks for check initialization, execution, and result reporting. New quality checks are added by implementing the behaviour, with automatic discovery and registration.

## Related Concepts

- [Behaviour](/glossary/behaviour/) -- The foundational OTP concept underlying the pattern
- [Protocol](/glossary/protocol/) -- Data-type-driven dispatch complementing module-driven behaviours
- [Adapter Pattern](/glossary/adapter-pattern/) -- Design pattern commonly implemented via behaviours
- [GenServer](/glossary/genserver/) -- The most widely used OTP behaviour
- [OTP Behaviour](/glossary/otp-behaviour/) -- Standard OTP behaviours (gen_server, supervisor, etc.)
- [Dependency Injection](/glossary/dependency-injection/) -- Pattern enabled by behaviour-based module swapping
- [Supervision Tree](/glossary/supervision-tree/) -- Supervisor behaviour defining restart contracts
- [Gen Statem](/glossary/gen-statem/) -- State machine behaviour for explicit state transitions
- [Elixir](/glossary/elixir/) -- Language providing the `@behaviour` and `@callback` syntax
- [Dialyzer](/glossary/dialyzer/) -- Static analysis tool that verifies behaviour implementations

## See Also

- [OTP](/glossary/otp/) -- Framework providing standard behaviours
- [ETS](/glossary/ets/) -- Common backend for behaviour implementations
- [Credo](/glossary/credo/) -- Static analysis checking behaviour usage patterns
- [Process Isolation](/glossary/process-isolation/) -- Process model that behaviours abstract over
- [Registry OTP](/glossary/registry-otp/) -- OTP registry using behaviour-based backends
- [AIAD](/glossary/aiad/) -- Agent standard built on behaviour contracts
- [Architecture](/architecture/) -- Platform architecture overview
- [Apps](/apps/) -- 115 umbrella applications using behaviour patterns

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
