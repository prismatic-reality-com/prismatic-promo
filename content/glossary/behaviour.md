+++
title = "Behaviour"
weight = 42
[extra]
category = "elixir"
description = "Elixir callback specification for polymorphic module contracts enabling compile-time verified pluggable architectures"
related_terms = ["protocol", "genserver", "otp", "adapter-pattern", "sparkline", "dialyzer", "typespec", "supervisor", "broadway", "plug", "process-isolation", "let-it-crash"]
keywords = ["Elixir behaviour callback", "OTP behaviour pattern", "module contract specification", "@callback @impl", "behaviour vs protocol Elixir", "pluggable architecture Elixir", "compile-time verification", "adapter pattern behaviour"]
tags = ["behaviour", "elixir", "otp", "contracts", "polymorphism", "compile-time-safety"]
difficulty = "intermediate"
audience = ["elixir-developers", "backend-engineers", "software-architects"]
version = "2.0.0"
last_updated = "2026-02-22"
tldr = "Behaviours define module-level contracts via @callback declarations that implementing modules must satisfy, enabling pluggable architectures with compile-time and Dialyzer verification."
prerequisites = ["basic-elixir", "modules", "typespecs"]
use_cases = ["storage-adapters", "agent-contracts", "pipeline-stages", "registry-backends", "authentication-strategies"]
platform_usage = "critical"
platform_components = ["PrismaticStorage.Core", "PrismaticAgents.AgentBehaviour", "PrismaticSupervisor.Registry.Behaviour", "PrismaticOsint.Extractor", "PrismaticOsint.Transformer"]
callback_count = "709+"
quality_enforcement = "zero-violations"
elixir_version = "1.19+"
estimated_reading_time = "13 minutes"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1273
date_created = "2026-02-23"
date_modified = "2026-02-23"
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Behaviour - Prismatic Platform"
+++

## Definition and Overview

A Behaviour in Elixir is a module-level contract specification that defines a set of function signatures (callbacks) a conforming module must implement. Behaviours provide compile-time guarantees: when a module declares `@behaviour SomeBehaviour`, the compiler and [Dialyzer](@/glossary/dialyzer.md) verify that all required callbacks are implemented with the correct arity and type signatures. This mechanism enables polymorphism at the module level, where different modules can be used interchangeably as long as they satisfy the same behaviour contract.

Behaviours serve a fundamentally different role from [protocols](@/glossary/protocol.md) in Elixir's type system. Protocols dispatch on the data type of their first argument (similar to type classes in Haskell or interfaces in Go), making them ideal for defining operations on different data shapes. Behaviours dispatch on the module itself, making them ideal for defining pluggable subsystem interfaces where the implementation is a module, not a data type. The choice between protocol and behaviour depends on whether "what varies" is the data (protocol) or the implementation strategy (behaviour).

The [OTP](@/glossary/otp.md) framework is built on behaviours: [GenServer](@/glossary/genserver.md), [Supervisor](@/glossary/supervisor.md), Application, GenStage, and Broadway all define behaviours that application modules implement. This architecture separates the generic (process lifecycle management, message handling boilerplate, fault tolerance) from the specific (business logic, domain rules, application state). Custom behaviours extend this principle to domain-specific contracts, enabling the same separation of generic infrastructure from specific implementation across the entire platform.

## Historical Context and Design Rationale

The behaviour mechanism in Erlang predates Elixir by decades, originating in the earliest OTP libraries developed at Ericsson. The gen_server, gen_event, and supervisor modules were the first behaviours, encoding common patterns observed in telephone switching software into reusable, well-tested abstractions.

The design rationale is rooted in a key insight from Ericsson's experience: the majority of bugs in concurrent systems occurred not in business logic but in infrastructure code -- process loops, message handling, timeout management, and error recovery. By extracting infrastructure into behaviours, these bug-prone concerns were written once, tested exhaustively, and reused across thousands of modules. Application developers focused exclusively on callbacks containing business logic, dramatically reducing the surface area for concurrency bugs.

Elixir inherited and enhanced the behaviour mechanism with several improvements: `@callback` declarations use the same typespec syntax as `@spec`, making callback signatures self-documenting; `@impl` annotations enable compile-time verification that a function is indeed a callback implementation; and `@optional_callbacks` explicitly marks callbacks that may be omitted, replacing the implicit convention of providing default implementations.

## Anatomy of a Behaviour

A behaviour is defined in a module using `@callback` attributes and consumed by implementing modules using `@behaviour` and `@impl` annotations.

### Defining a Behaviour

```elixir
defmodule PrismaticAgents.AgentBehaviour do
  @moduledoc """
  Contract for all Prismatic AIAD agents.
  Defines the interface that every agent implementation must satisfy.
  Used across all 530+ agents in the platform.
  """

  @type agent_id :: binary()
  @type context :: map()
  @type result :: {:ok, term()} | {:error, term()}

  @doc "Initialize the agent with its configuration."
  @callback init(config :: map()) :: {:ok, state :: term()} | {:error, reason :: term()}

  @doc "Execute the agent's primary capability."
  @callback execute(context(), state :: term()) :: result()

  @doc "Return the agent's metadata (name, tier, domain)."
  @callback metadata() :: %{
    name: binary(),
    tier: atom(),
    domain: atom(),
    capabilities: [atom()]
  }

  @doc "Optional: Handle agent-specific cleanup."
  @callback terminate(reason :: term(), state :: term()) :: :ok

  @optional_callbacks [terminate: 2]
end
```

### Implementing a Behaviour

```elixir
defmodule PrismaticAgents.SecurityScanner do
  @moduledoc """
  Security scanning agent implementing the AgentBehaviour contract.
  Performs port scanning, TLS analysis, and vulnerability detection.
  """

  @behaviour PrismaticAgents.AgentBehaviour

  @impl PrismaticAgents.AgentBehaviour
  def init(config) do
    {:ok, %{
      scan_targets: config.targets,
      scan_depth: config[:depth] || :standard,
      findings: []
    }}
  end

  @impl PrismaticAgents.AgentBehaviour
  def execute(context, state) do
    findings =
      state.scan_targets
      |> Enum.flat_map(&scan_target(&1, state.scan_depth, context))
      |> Enum.map(&score_finding/1)

    {:ok, %{findings: findings, scanned_at: DateTime.utc_now()}}
  end

  @impl PrismaticAgents.AgentBehaviour
  def metadata do
    %{
      name: "security-scanner",
      tier: :l2_operational,
      domain: :security,
      capabilities: [:port_scan, :tls_analysis, :vulnerability_detection]
    }
  end

  # terminate/2 not implemented - uses default (optional callback)
end
```

## @callback Declarations

The `@callback` attribute defines the function signature that implementing modules must provide. It uses the same [typespec](@/glossary/typespec.md) syntax as `@spec` but declares an expectation rather than a description.

| Attribute | Purpose | Enforcement |
|-----------|---------|-------------|
| `@callback` | Required function signature | Compiler warning if missing |
| `@optional_callbacks` | List of callbacks that may be omitted | No warning if absent |
| `@macrocallback` | Required macro signature | Compile-time macro expansion |

### Callback Types and Guards

```elixir
defmodule PrismaticStorage.Core do
  @moduledoc """
  Core storage behaviour defining the contract for all storage adapters.
  Implemented by ETS, Ecto, Meilisearch, Redis, and KuzuDB adapters.
  """

  # Simple callback with union return type
  @callback get(key :: binary()) :: {:ok, term()} | {:ok, nil} | {:error, term()}

  # Callback with complex return type
  @callback query(filters :: map(), opts :: keyword()) ::
    {:ok, [map()]} | {:error, :not_supported | :timeout | term()}

  # Callback with guard-like type constraints
  @callback bulk_put(entries :: [{binary(), term()}], opts :: keyword()) ::
    {:ok, non_neg_integer()} | {:error, term()}

  # Callback returning structured data
  @callback health_check() :: {:ok, %{status: :healthy | :degraded, latency_ms: non_neg_integer()}}

  # Optional callback for adapters supporting transactions
  @callback transaction((-> term())) :: {:ok, term()} | {:error, term()}

  @optional_callbacks [transaction: 1]
end
```

## @impl Annotations

The `@impl` attribute marks a function as a behaviour callback implementation. This serves three purposes: documentation (clearly signals which functions are callbacks), compile-time validation ([Dialyzer](@/glossary/dialyzer.md) verifies the function matches a declared callback), and error prevention (catches accidental callback name mismatches).

```elixir
# Without @impl - works but fragile
def init(config) do
  # Is this a callback implementation or a regular function?
  # No way to tell without checking the behaviour definition
  {:ok, config}
end

# With @impl - clear, verified, enforced
@impl true
def init(config) do
  # Clearly a callback. Dialyzer verifies it matches @callback init/1
  {:ok, config}
end

# @impl with behaviour name (for modules implementing multiple behaviours)
@impl GenServer
def handle_call(:status, _from, state) do
  {:reply, state, state}
end

@impl PrismaticAgents.AgentBehaviour
def execute(context, state) do
  {:ok, process(context, state)}
end
```

The Prismatic Platform enforces `@impl` annotations on all 709+ callback implementations with zero violations. This is tracked as a quality metric and enforced by the pre-commit quality gate.

## Compile-Time Verification

Behaviours provide two levels of compile-time verification.

### Compiler Warnings

The Elixir compiler generates warnings when a module declares `@behaviour` but does not implement all required callbacks.

```
warning: function init/1 required by behaviour PrismaticAgents.AgentBehaviour
  is not implemented (in module PrismaticAgents.SecurityScanner)
```

With `--warnings-as-errors` (enforced across all Prismatic apps), this warning becomes a compilation error, preventing incomplete implementations from entering the codebase.

### Dialyzer Verification

[Dialyzer](@/glossary/dialyzer.md) goes further, verifying that the implementation's typespec is compatible with the callback's declared type.

```elixir
# This would be caught by Dialyzer:
@impl true
def get(key, _opts) do
  # Callback declares return {:ok, value} | {:ok, nil} | {:error, term()}
  # But this returns a bare value -- type violation!
  Map.get(@store, key)
end
```

| Check Level | What It Catches | When It Runs |
|-------------|----------------|--------------|
| **Compiler** | Missing callbacks, wrong arity | `mix compile` |
| **Dialyzer** | Type mismatches, spec violations | `mix dialyzer` |
| **Contract tests** | Behavioral violations (logic errors) | `mix test` |
| **Quality gates** | Missing `@impl`, missing `@spec` | `mix quality.gates` |

## OTP Behaviours

The OTP framework defines the foundational behaviours that underpin the Prismatic Platform's process architecture.

| Behaviour | Purpose | Key Callbacks | Prismatic Usage |
|-----------|---------|---------------|-----------------|
| **GenServer** | Stateful server process | `init/1`, `handle_call/3`, `handle_cast/2`, `handle_info/2` | Agents, registries, coordinators |
| **Supervisor** | Process supervision | `init/1` (child specs) | Application trees, pool supervisors |
| **Application** | OTP application lifecycle | `start/2`, `stop/1` | 115 umbrella app entry points |
| **GenStage** | Demand-driven data exchange | `init/1`, `handle_demand/2`, `handle_events/3` | Stream processing pipelines |
| **Broadway** | Production data pipelines | `handle_message/3`, `handle_batch/4` | OSINT ETL, security feeds |
| **Plug** | HTTP request processing | `init/1`, `call/2` | Middleware, authentication |
| **Phoenix.LiveView** | Real-time UI | `mount/3`, `handle_event/3`, `render/1` | Dashboards at `/perimeter` |

Each OTP behaviour separates the generic (process lifecycle, message routing, supervision strategy) from the specific (application logic). This separation is what enables OTP's legendary reliability: the generic parts are battle-tested framework code, and the specific parts are isolated, replaceable implementations.

## Prismatic's Custom Behaviours

Beyond OTP's standard behaviours, the Prismatic Platform defines domain-specific behaviours for its key subsystems.

### Storage Adapter Behaviour

The `PrismaticStorage.Core` behaviour (detailed in [Adapter Pattern](@/glossary/adapter-pattern.md)) defines the contract for all 7 storage backends. Each adapter implements this behaviour, enabling transparent backend switching and composition.

### Agent Behaviour

The `PrismaticAgents.AgentBehaviour` defines the contract for all 530+ AIAD agents across 16 domains. Every agent, from OSINT extractors to epistemic verifiers, implements this behaviour.

### Registry Backend Behaviour

The `PrismaticSupervisor.Registry.Behaviour` defines the contract for process registry backends, with implementations for ETS (development) and Horde (production distributed).

```elixir
defmodule PrismaticSupervisor.Registry.Behaviour do
  @moduledoc """
  Contract for process registry backends.
  Enables runtime switching between ETS (dev) and Horde (prod).
  """

  @callback register(name :: term(), pid :: pid()) :: :ok | {:error, :already_registered}
  @callback lookup(name :: term()) :: {:ok, pid()} | {:error, :not_found}
  @callback unregister(name :: term()) :: :ok
  @callback list() :: [{term(), pid()}]
  @callback count() :: non_neg_integer()
end

# Development: ETS-backed (single-node, fast)
defmodule PrismaticSupervisor.Registry.ETS do
  @behaviour PrismaticSupervisor.Registry.Behaviour

  @impl true
  def register(name, pid) do
    case :ets.insert_new(:registry, {name, pid}) do
      true -> :ok
      false -> {:error, :already_registered}
    end
  end

  @impl true
  def lookup(name) do
    case :ets.lookup(:registry, name) do
      [{^name, pid}] -> {:ok, pid}
      [] -> {:error, :not_found}
    end
  end

  @impl true
  def unregister(name), do: :ets.delete(:registry, name) && :ok

  @impl true
  def list, do: :ets.tab2list(:registry)

  @impl true
  def count, do: :ets.info(:registry, :size)
end

# Production: Horde-backed (distributed across cluster)
defmodule PrismaticSupervisor.Registry.Horde do
  @behaviour PrismaticSupervisor.Registry.Behaviour
  # ... Horde implementation with CRDT-based distributed registry
end
```

### Pipeline Stage Behaviour

Custom behaviours for OSINT pipeline stages ensure that extractors, transformers, and loaders conform to consistent interfaces.

```elixir
defmodule PrismaticOsint.Extractor do
  @moduledoc """
  Behaviour for OSINT data extraction stages.
  All OSINT providers implement this interface.
  """

  @callback extract(query :: term(), opts :: keyword()) ::
    {:ok, %{source: atom(), records: [map()], extracted_at: DateTime.t()}} |
    {:error, term()}

  @callback supported_query_types() :: [atom()]

  @callback rate_limit() :: %{requests_per_second: pos_integer(), burst: pos_integer()}

  @optional_callbacks [rate_limit: 0]
end

defmodule PrismaticOsint.Transformer do
  @moduledoc """
  Behaviour for OSINT data transformation stages.
  Normalizes raw provider data into platform schema.
  """

  @callback transform(extraction_result :: map()) :: {:ok, [map()]} | {:error, term()}
  @callback output_schema() :: map()
end
```

## Behaviour vs Protocol

Understanding when to use behaviours versus protocols is critical for correct Elixir architecture.

| Dimension | Behaviour | Protocol |
|-----------|-----------|----------|
| **Dispatches on** | Module (implementation) | Data type (first argument) |
| **Definition** | `@callback` in a module | `defprotocol` with function specs |
| **Implementation** | `@behaviour` + `@impl` in module | `defimpl` for each type |
| **Compile-time check** | Missing callbacks warned | Missing impl warned (if consolidated) |
| **Use case** | Pluggable backends, strategies | Polymorphic data operations |
| **Example** | Storage adapters, agent contracts | Encoding, string representation |
| **Multiple impls per module** | Yes (module implements many behaviours) | No (one impl per type per protocol) |
| **Runtime selection** | Via module reference | Via data type of argument |
| **Extension** | Requires modifying implementing module | External to data type module |

```elixir
# Behaviour: dispatch on module (which backend?)
adapter = Application.get_env(:app, :storage_adapter)  # PrismaticStorage.ETS
adapter.get("key", opts)  # Module dispatch

# Protocol: dispatch on data type (what is this data?)
Encoder.encode(%SecurityAsset{})  # Dispatches based on %SecurityAsset{} type
Encoder.encode(%Vulnerability{})  # Different dispatch, same function name
```

### Decision Guide

Use a **behaviour** when:
- You need pluggable implementations (storage backends, authentication strategies)
- The implementation is selected at configuration time or startup
- Multiple functions must be implemented together as a coherent contract
- You want compile-time verification of the complete contract

Use a **protocol** when:
- Different data types need the same operation (encoding, serialization, display)
- The operation is a single function, not a multi-function contract
- Third-party code needs to extend the operation for new types
- Dispatch depends on runtime data, not configuration

## Behaviour Composition

Modules can implement multiple behaviours, composing contracts from different domains.

```elixir
defmodule PrismaticAgents.EpistemicVerifier do
  @moduledoc """
  Agent that both runs as a GenServer process and satisfies
  the AgentBehaviour and Transformer contracts simultaneously.
  """

  @behaviour PrismaticAgents.AgentBehaviour
  @behaviour GenServer
  @behaviour PrismaticOsint.Transformer

  # GenServer callbacks
  @impl GenServer
  def init(config), do: {:ok, config}

  @impl GenServer
  def handle_call(:verify, _from, state) do
    result = execute(%{}, state)
    {:reply, result, state}
  end

  # Agent callbacks
  @impl PrismaticAgents.AgentBehaviour
  def execute(context, state) do
    {:ok, verify_claims(context, state)}
  end

  @impl PrismaticAgents.AgentBehaviour
  def metadata do
    %{name: "epistemic-verifier", tier: :l2_operational,
      domain: :epistemic, capabilities: [:trinity_gate, :nabla_check]}
  end

  # Transformer callbacks
  @impl PrismaticOsint.Transformer
  def transform(data), do: {:ok, normalize_for_verification(data)}

  @impl PrismaticOsint.Transformer
  def output_schema, do: %{verified: :boolean, confidence: :float}
end
```

## Default Implementations with __using__

Behaviours can provide default implementations through `__using__/1` macros, reducing boilerplate in implementing modules:

```elixir
defmodule PrismaticAgents.AgentBehaviour do
  @callback init(map()) :: {:ok, term()} | {:error, term()}
  @callback execute(map(), term()) :: {:ok, term()} | {:error, term()}
  @callback metadata() :: map()
  @callback terminate(term(), term()) :: :ok

  @optional_callbacks [terminate: 2]

  defmacro __using__(_opts) do
    quote do
      @behaviour PrismaticAgents.AgentBehaviour

      # Default terminate implementation
      @impl PrismaticAgents.AgentBehaviour
      def terminate(_reason, _state), do: :ok

      defoverridable terminate: 2
    end
  end
end

# Implementing module gets default terminate/2 for free
defmodule PrismaticAgents.SimpleAgent do
  use PrismaticAgents.AgentBehaviour

  @impl PrismaticAgents.AgentBehaviour
  def init(config), do: {:ok, config}

  @impl PrismaticAgents.AgentBehaviour
  def execute(_ctx, state), do: {:ok, state}

  @impl PrismaticAgents.AgentBehaviour
  def metadata, do: %{name: "simple", tier: :l4, domain: :utility, capabilities: []}

  # terminate/2 inherited from default implementation
end
```

## Quality Enforcement

The Prismatic Platform enforces behaviour usage through multiple quality gates.

| Quality Check | Enforcement | Current Status |
|---------------|-------------|----------------|
| `@impl` on all callbacks | Pre-commit quality gate | 709+ annotations, 0 violations |
| `@spec` on all public functions | Dialyzer + Credo | 0 violations |
| Callback type correctness | Dialyzer PLT analysis | 0 violations |
| Contract test coverage | Per-adapter test suite | All 7 adapters covered |
| Missing callback detection | Compiler warnings-as-errors | 0 warnings |

The `--warnings-as-errors` flag ensures that a missing behaviour callback implementation prevents compilation entirely, catching contract violations at the earliest possible moment.

## Testing Behaviours

Behaviours enable contract testing, where a single test module validates any implementation of the behaviour:

```elixir
defmodule PrismaticStorage.AdapterContractTest do
  @moduledoc """
  Shared contract test for all storage adapter implementations.
  Any module implementing PrismaticStorage.Core must pass these tests.
  """

  defmacro __using__(opts) do
    adapter = Keyword.fetch!(opts, :adapter_module)

    quote do
      use ExUnit.Case, async: true

      @adapter unquote(adapter)

      test "get returns {:ok, nil} for missing key" do
        assert {:ok, nil} = @adapter.get("nonexistent-key")
      end

      test "put and get round-trip" do
        assert :ok = @adapter.put("test-key", "test-value")
        assert {:ok, "test-value"} = @adapter.get("test-key")
      end

      test "bulk_put returns count of inserted entries" do
        entries = [{"k1", "v1"}, {"k2", "v2"}, {"k3", "v3"}]
        assert {:ok, 3} = @adapter.bulk_put(entries, [])
      end

      test "health_check returns structured status" do
        assert {:ok, %{status: status}} = @adapter.health_check()
        assert status in [:healthy, :degraded]
      end
    end
  end
end

# Usage in specific adapter test
defmodule PrismaticStorage.ETS.Test do
  use PrismaticStorage.AdapterContractTest, adapter_module: PrismaticStorage.ETS
end
```

## Related Terms

- [Protocol](@/glossary/protocol.md) -- Type-based dispatch complementing module-based behaviours
- [GenServer](@/glossary/genserver.md) -- Core OTP behaviour for stateful server processes
- [Supervisor](@/glossary/supervisor.md) -- OTP behaviour for process supervision and [fault tolerance](@/glossary/fault-tolerance.md)
- [Adapter Pattern](@/glossary/adapter-pattern.md) -- Storage pattern using behaviours for backend contracts
- [Dialyzer](@/glossary/dialyzer.md) -- Static analysis tool verifying behaviour compliance
- [Typespec](@/glossary/typespec.md) -- Type annotations used in `@callback` definitions
- [Plug](@/glossary/plug.md) -- HTTP middleware behaviour for composable request processing
- [Broadway](@/glossary/broadway.md) -- Data pipeline behaviour for concurrent stream processing
- [Process Isolation](@/glossary/process-isolation.md) -- BEAM property enabling independent behaviour implementations
- [Let It Crash](@/glossary/let-it-crash.md) -- Philosophy enabled by behaviour-based supervision

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture overview and behaviour-based contracts
- [Technologies](@/technologies/_index.md) -- Technology stack details and OTP behaviour usage
- [Agents](@/agents/_index.md) -- Agent specifications implementing PrismaticAgents.AgentBehaviour

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
