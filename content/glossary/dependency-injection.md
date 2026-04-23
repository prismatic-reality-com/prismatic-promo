+++
title = "Dependency Injection"
weight = 29
[extra]
category = "architecture"
description = "Design pattern providing dependencies externally rather than creating them internally"
related_terms = ["adapter-pattern", "behaviour", "protocol", "bounded-context", "property-based-testing"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1122
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Dependency", "Injection", "Design", "glossary", "architecture", "Prismatic Platform", "Elixir", "Application", "Behaviour"]
tags = ["glossary", "architecture", "dependency-injection", "prismatic"]
quality_score = 72
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Dependency Injection - Prismatic Platform"
+++

## Definition and Overview

Dependency Injection (DI) is a design pattern and architectural principle in which a software component receives its dependencies from external sources rather than creating or locating them internally. This inversion of control decouples components from their concrete dependencies, enabling loose coupling, improved testability (dependencies can be replaced with test doubles), flexible configuration, and clear separation of concerns. The pattern addresses a fundamental tension in software design: components need to collaborate with other components, but hard-coding those collaborations creates rigid, untestable, and inflexible systems.

In object-oriented languages (Java, C#, TypeScript), dependency injection is typically achieved through constructor injection, setter injection, or interface injection, often managed by IoC (Inversion of Control) containers like Spring, Guice, or InversifyJS. In functional languages like Elixir, the pattern takes different forms that align with the language's paradigm. Rather than objects with constructors, Elixir uses module attributes, application configuration, behaviour callbacks, higher-order functions, and protocol dispatch to achieve the same decoupling goals without the ceremony of dedicated DI frameworks.

The key insight of dependency injection is that the decision of which concrete implementation to use should be made at a higher level of abstraction than the code that uses the dependency. A module that processes payments should not know whether it is using a Stripe adapter, a PayPal adapter, or a test stub -- it should receive that adapter as a parameter and interact with it through a defined contract. This separation enables the same business logic to operate against different implementations in different contexts (development, testing, production, staging).

## Technical Deep Dive

### DI Patterns in Elixir

Elixir offers several mechanisms for dependency injection, each with distinct tradeoffs:

| Pattern | Mechanism | Configuration Time | Use Case |
|---------|-----------|-------------------|----------|
| **Application config** | `Application.get_env/3` | Boot time | Environment-based switching (dev/test/prod) |
| **Module attribute** | `@adapter Application.compile_env/3` | Compile time | Performance-critical paths (inlined by compiler) |
| **Function parameter** | `def process(data, adapter \\ DefaultAdapter)` | Call time | Per-call flexibility, easy testing |
| **Behaviour callback** | `@behaviour StorageAdapter` | Definition time | Contract enforcement with compiler warnings |
| **Protocol dispatch** | `defprotocol Storable` | Type-based runtime | Polymorphism across data types |
| **Higher-order function** | `def process(data, fetch_fn)` | Call time | Maximum flexibility, functional style |

### Compile-Time vs. Runtime Injection

A critical distinction in Elixir DI is between compile-time and runtime injection:

```elixir
# Compile-time injection (via Application.compile_env)
# Resolved during compilation, inlined for performance
defmodule PaymentProcessor do
  @adapter Application.compile_env(:my_app, :payment_adapter, StripeAdapter)

  def process(payment) do
    @adapter.charge(payment)
  end
end

# Runtime injection (via Application.get_env)
# Resolved on each call, flexible but slightly slower
defmodule PaymentProcessor do
  def process(payment) do
    adapter = Application.get_env(:my_app, :payment_adapter, StripeAdapter)
    adapter.charge(payment)
  end
end

# Parameter injection (most explicit and testable)
defmodule PaymentProcessor do
  def process(payment, adapter \\ default_adapter()) do
    adapter.charge(payment)
  end

  defp default_adapter do
    Application.get_env(:my_app, :payment_adapter, StripeAdapter)
  end
end
```

Compile-time injection (`Application.compile_env/3`) produces the fastest code because the adapter module is resolved during compilation and can be inlined. However, it requires recompilation when the adapter changes. Runtime injection (`Application.get_env/3`) adds a small overhead per call but allows hot-swapping adapters without recompilation.

### Behaviour-Based Contracts

Behaviours are Elixir's primary mechanism for defining dependency contracts. A behaviour specifies the callbacks (function signatures) that any implementation must provide:

```elixir
defmodule StorageAdapter do
  @moduledoc """
  Defines the contract for all storage backend implementations.
  """

  @type key :: term()
  @type value :: term()
  @type opts :: keyword()

  @callback get(key(), opts()) :: {:ok, value()} | {:error, term()}
  @callback put(key(), value(), opts()) :: :ok | {:error, term()}
  @callback delete(key(), opts()) :: :ok | {:error, term()}
  @callback list(opts()) :: {:ok, list(value())} | {:error, term()}
end
```

Any module implementing this behaviour must provide all four callbacks. The compiler warns if callbacks are missing, and [Dialyzer](/glossary/dialyzer/) verifies that implementations conform to the specified type signatures. This compile-time enforcement ensures that dependency injection failures are caught before runtime.

### Testing with Injected Dependencies

The primary motivation for DI in many codebases is testability. By injecting dependencies, tests can replace real implementations with controlled test doubles:

```elixir
defmodule PaymentProcessorTest do
  use ExUnit.Case

  defmodule MockPaymentAdapter do
    @behaviour PaymentAdapter

    @impl PaymentAdapter
    def charge(%{amount: amount}) when amount > 0, do: {:ok, %{id: "mock_123"}}
    def charge(%{amount: amount}) when amount <= 0, do: {:error, :invalid_amount}
    def charge(_), do: {:error, :invalid_payment}
  end

  test "processes valid payment" do
    payment = %{amount: 1000, currency: :usd}

    assert {:ok, %{id: "mock_123"}} =
             PaymentProcessor.process(payment, MockPaymentAdapter)
  end

  test "rejects invalid payment amount" do
    payment = %{amount: -100, currency: :usd}

    assert {:error, :invalid_amount} =
             PaymentProcessor.process(payment, MockPaymentAdapter)
  end
end
```

This approach avoids the need for mocking libraries in most cases -- Elixir's pattern matching and module system make it natural to define lightweight test implementations inline.

## Architecture and Implementation

### Multi-Layer DI Architecture

The Prismatic Platform implements dependency injection at multiple architectural layers:

```
Layer 4: Application Configuration
         (config/dev.exs, config/test.exs, config/prod.exs)
         Selects concrete implementations per environment
              |
              v
Layer 3: Behaviour Definitions
         (prismatic_storage_core/lib/behaviours/)
         Defines contracts that implementations must satisfy
              |
              v
Layer 2: Adapter Implementations
         (prismatic_storage_ets/, prismatic_storage_ecto/, ...)
         Concrete implementations for each backend
              |
              v
Layer 1: Business Logic
         (prismatic_perimeter/, prismatic_agents/, ...)
         Consumes adapters through behaviour interfaces
```

This architecture ensures that business logic modules never import concrete adapter modules directly. They depend only on behaviour definitions from `prismatic_storage_core`, and the application configuration selects which concrete adapter runs in each environment.

### Configuration-Driven Injection

```elixir
# config/dev.exs
config :prismatic_supervisor, :registry_backend, PrismaticSupervisor.Registry.ETS

# config/prod.exs
config :prismatic_supervisor, :registry_backend, PrismaticSupervisor.Registry.Horde

# config/test.exs
config :prismatic_supervisor, :registry_backend, PrismaticSupervisor.Registry.InMemory
```

The PrismaticSupervisor reads this configuration to determine which registry backend to use:

```elixir
defmodule PrismaticSupervisor.AppRegistry do
  @moduledoc """
  Application registry using injected backend implementation.
  Backend is selected via application configuration.
  """

  @spec backend() :: module()
  def backend do
    Application.get_env(:prismatic_supervisor, :registry_backend, Registry.ETS)
  end

  @spec register(atom(), map()) :: :ok | {:error, term()}
  def register(app_name, metadata) do
    backend().register(app_name, metadata)
  end

  @spec lookup(atom()) :: {:ok, map()} | {:error, :not_found}
  def lookup(app_name) do
    backend().lookup(app_name)
  end

  @spec list_all() :: {:ok, list(map())}
  def list_all do
    backend().list_all()
  end
end
```

## Usage in Prismatic Platform

The Prismatic Platform implements dependency injection through Elixir behaviours and application configuration across its 89 umbrella applications. The pattern is most visible in the storage layer, supervisor infrastructure, and agent system.

### Storage Adapter Injection

The storage layer exemplifies DI at scale. Business logic depends on the `PrismaticStorageCore` behaviour contract, and the deployment configuration selects the backend:

```elixir
defmodule PrismaticPerimeter.AssetStore do
  @moduledoc """
  Asset storage for Prismatic Perimeter using injected storage backend.
  """

  @adapter Application.compile_env(
    :prismatic_perimeter,
    :asset_storage_adapter,
    PrismaticStorageEts
  )

  @spec store_asset(map()) :: {:ok, map()} | {:error, term()}
  def store_asset(asset) do
    @adapter.put({:asset, asset.id}, asset, ttl: :infinity)
  end

  @spec get_asset(String.t()) :: {:ok, map()} | {:error, :not_found}
  def get_asset(asset_id) do
    @adapter.get({:asset, asset_id}, [])
  end

  @spec list_assets(keyword()) :: {:ok, list(map())}
  def list_assets(opts \\ []) do
    @adapter.list(Keyword.merge([prefix: :asset], opts))
  end
end
```

### Contract Test Macro

The platform ensures all injected adapters satisfy the same contract through a macro that generates standardized test suites:

```elixir
defmodule PrismaticStorage.AdapterContractTest do
  @moduledoc """
  Generates contract tests ensuring all storage adapters satisfy identical guarantees.
  Usage: `use PrismaticStorage.AdapterContractTest, adapter_module: MyAdapter`
  """

  defmacro __using__(opts) do
    adapter = Keyword.fetch!(opts, :adapter_module)

    quote do
      use ExUnit.Case

      @adapter unquote(adapter)

      describe "#{inspect(@adapter)} contract compliance" do
        test "put and get round-trip" do
          assert :ok = @adapter.put(:test_key, "test_value", [])
          assert {:ok, "test_value"} = @adapter.get(:test_key, [])
        end

        test "get returns error for missing key" do
          assert {:error, :not_found} = @adapter.get(:nonexistent, [])
        end

        test "delete removes stored value" do
          :ok = @adapter.put(:delete_key, "value", [])
          :ok = @adapter.delete(:delete_key, [])
          assert {:error, :not_found} = @adapter.get(:delete_key, [])
        end

        test "list returns all stored values" do
          :ok = @adapter.put(:list_1, "a", [])
          :ok = @adapter.put(:list_2, "b", [])
          {:ok, values} = @adapter.list([])
          assert length(values) >= 2
        end
      end
    end
  end
end
```

### Supervisor Backend Injection

The PrismaticSupervisor uses behaviour-based registry backends with runtime switching:

```elixir
defmodule PrismaticSupervisor.Registry.Behaviour do
  @moduledoc """
  Defines the contract for pluggable registry backends.
  """

  @callback register(atom(), map()) :: :ok | {:error, term()}
  @callback lookup(atom()) :: {:ok, map()} | {:error, :not_found}
  @callback list_all() :: {:ok, list(map())}
  @callback unregister(atom()) :: :ok
end

defmodule PrismaticSupervisor.Registry.ETS do
  @moduledoc "ETS-backed registry for development and testing."
  @behaviour PrismaticSupervisor.Registry.Behaviour

  @impl true
  def register(name, metadata) do
    :ets.insert(:app_registry, {name, metadata})
    :ok
  end

  @impl true
  def lookup(name) do
    case :ets.lookup(:app_registry, name) do
      [{^name, metadata}] -> {:ok, metadata}
      [] -> {:error, :not_found}
    end
  end

  @impl true
  def list_all do
    {:ok, :ets.tab2list(:app_registry) |> Enum.map(fn {_k, v} -> v end)}
  end

  @impl true
  def unregister(name) do
    :ets.delete(:app_registry, name)
    :ok
  end
end
```

## Best Practices

**Prefer behaviour-based injection over ad hoc module parameters.** Behaviours provide compile-time verification that all implementations satisfy the contract. Ad hoc module parameters work but lack the safety net of compiler and Dialyzer checking.

**Use `Application.compile_env/3` for performance-critical paths.** When the adapter is determined once at startup and does not change, compile-time injection eliminates the runtime lookup overhead. This matters in hot code paths that execute thousands of times per second.

**Define contracts in a separate core module.** Place behaviour definitions in a `*_core` module that has no concrete dependencies. This prevents circular dependencies and makes the contract available to all implementations without coupling them to each other.

**Write contract tests, not just unit tests.** Contract test macros (like `PrismaticStorage.AdapterContractTest`) verify that all implementations of a behaviour exhibit identical behavior. This is more valuable than testing each implementation in isolation, because it guarantees substitutability.

**Document environment-specific configurations.** When different adapters are used in different environments, document the mapping clearly in configuration files. Developers should be able to understand which adapter is active in each environment without reading source code.

## Common Pitfalls

**Over-engineering DI in simple applications.** Not every dependency needs injection. If a module will only ever have one implementation and testing it with the real implementation is feasible, adding DI abstraction creates unnecessary complexity. Apply DI where the benefits (testability, flexibility) justify the indirection cost.

**Leaking implementation details through the contract.** Behaviour contracts should be defined in terms of business operations, not implementation details. A storage behaviour should define `get/2` and `put/3`, not `execute_sql_query/1` -- the latter leaks the relational database implementation through the contract.

**Forgetting to test the wiring.** DI separates component implementation from component composition. It is possible for all components to pass their unit tests individually while the overall system fails because components are wired to the wrong implementations. Integration tests that exercise the actual composition (not just mocked components) are essential.

**Runtime injection in hot loops.** Calling `Application.get_env/3` inside a tight loop adds measurable overhead. If the adapter is constant for the process lifetime, resolve it once during initialization (e.g., in `GenServer.init/1`) and store the reference in process state.

**Mixing injection strategies inconsistently.** Using compile-time injection in some modules, runtime injection in others, and parameter injection in still others creates confusion. Establish a project convention and document when each pattern is appropriate.

## Related Concepts

- [Adapter Pattern](/glossary/adapter-pattern/) -- Pattern providing interchangeable implementations via DI
- [Behaviour](/glossary/behaviour/) -- Elixir mechanism defining injectable dependency contracts
- [Protocol](/glossary/protocol/) -- Type-based dispatch complementing behaviour-based injection
- [Property-Based Testing](/glossary/property-based-testing/) -- Testing approach benefiting from injectable dependencies
- [OTP](/glossary/otp/) -- Framework providing supervision and process architecture for DI
- [Prismatic Storage](/glossary/prismatic-storage/) -- Platform storage layer exemplifying DI at scale
- [GenServer](/glossary/genserver/) -- Stateful processes that commonly hold injected adapter references

## See Also

- [Architecture](/architecture/) -- Dependency management architecture
- [Technologies](/technologies/) -- Elixir dependency patterns
- [Apps](/apps/) -- Umbrella applications using DI patterns

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)