+++
title = "Sparkline"
weight = 74
[extra]
category = "architecture"
description = "Contract-locked integration component with canonicalized interfaces ensuring compile-time and runtime verification across all platform subsystems"
abbreviation = "SPARKLINE"
domain = "contract-engineering"
complexity = "advanced"
maturity = "production"
platform_version = "8.0.0"
generation = 19
enforcement_level = "mandatory"
related_terms = ["behaviour", "protocol", "quality-gates", "white-team", "regression-test", "property-based-testing", "adapter-pattern", "typespec"]
platforms = ["elixir", "otp", "beam"]
use_cases = ["inter-application-contracts", "storage-adapter-verification", "agent-communication", "api-boundary-enforcement"]
tags = ["contract-first", "immutable-contracts", "property-based-testing", "formal-verification", "sparkline-next"]
milestones = ["MS-6253645"]
verification_levels = ["L0-type-checking", "L1-unit-testing", "L2-property-testing", "L3-integration-testing", "L4-fuzzing", "L5-formal-proof"]
teams_involved = ["white-team", "purple-team"]
contract_domains = ["storage", "agent-communication", "api-endpoints", "security-operations", "quality-systems"]
date_created = "2025-06-15"
date_updated = "2026-02-22"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1427
date_modified = "2026-02-23"
keywords = ["Sparkline", "Contract-locked", "glossary", "architecture", "Prismatic Platform", "Contract", "Locked", "White Team"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Sparkline - Prismatic Platform"
+++

## Definition and Overview

Sparkline is a contract-locked integration framework within the Prismatic Platform that enforces strict interface canonicalization and comprehensive contract testing between platform subsystems. The term "sparkline" evokes the concept of a small, dense visual representation of data -- similarly, a Sparkline contract is a compact, precise specification of exactly how two systems interact, leaving no room for ambiguity, drift, or unverified assumptions. In the broader landscape of software engineering, Sparkline represents an opinionated synthesis of design-by-contract, behaviour-driven specification, and property-based verification tailored specifically for large-scale Elixir umbrella applications.

In a platform with 115 umbrella applications and 530 runtime agents, the number of potential inter-system interaction points grows combinatorially. Without formal contracts, these interactions become fragile: a change in one application's return type silently breaks a consumer in another application, a renamed field causes runtime crashes that unit tests in either application would not catch, and behavioral guarantees that exist only as developer assumptions erode during refactoring. Sparkline contracts address this by formalizing every inter-application boundary into an explicit, tested, and verified specification that is immutable once locked.

The SPARKLINE NEXT initiative (Milestone MS-6253645) established the current generation of immutable API contracts across the platform. Once locked, these contracts cannot change without explicit renegotiation -- a deliberate process requiring [White Team](/glossary/white-team/) formal verification and Purple Team closure approval. This immutability prevents the "gradual drift" problem where small, individually-reasonable changes accumulate into incompatible interfaces over time. The initiative achieved complete canonicalization of all inter-application boundaries, transforming what was previously an implicit web of assumptions into a formally verified contract graph.

Sparkline contracts operate at two verification levels: compile-time through Elixir [Behaviour](/glossary/behaviour/) callbacks that enforce function signatures, and runtime through [property-based testing](/glossary/property-based-testing/) that verifies behavioral guarantees under diverse input conditions. This dual-level approach catches both structural errors (wrong types, missing functions) and behavioral errors (correct types but wrong semantics) that single-level approaches miss. The framework draws inspiration from Bertrand Meyer's Design by Contract, Haskell's type classes, and Erlang's OTP behaviour system, combining the strengths of each into a cohesive verification framework.

## Historical Context and Motivation

The Sparkline framework emerged from a specific class of failures that plagued the early Prismatic Platform. As the umbrella grew from a handful of applications to dozens, interface drift became the primary source of production incidents. A storage adapter would change its error return format from `{:error, :not_found}` to `{:error, "not found"}`, and consumers expecting the atom form would crash at runtime. These failures were invisible to unit tests because each application tested in isolation with its own assumptions about the interface.

The first attempt to solve this problem used documentation -- each application maintained a README describing its public API. This approach failed because documentation diverges from code over time, and no automated tooling enforced documentation accuracy. The second attempt used shared type specifications, which improved compile-time checking but could not verify behavioral semantics. A function could satisfy the type `(String.t()) -> {:ok, term()} | {:error, atom()}` while violating the behavioral invariant that `get(key)` after `put(key, value)` must return `{:ok, value}`.

Sparkline was designed to close this gap permanently. By combining compile-time type enforcement through [Behaviour](/glossary/behaviour/) callbacks, runtime behavioral verification through [property-based testing](/glossary/property-based-testing/), and immutability through contract locking, Sparkline ensures that contracts are correct at every level of abstraction. The framework was named after the data visualization concept because, like a sparkline chart, a Sparkline contract packs maximum information into minimum space -- a complete specification of a system boundary in a single, compact module.

## Technical Deep Dive

### Contract Specification Format

Sparkline contracts are specified as Elixir Behaviours with comprehensive type specifications and documented behavioral guarantees:

```elixir
defmodule PrismaticStorageCore.Traits.StorageAdapter do
  @moduledoc """
  Sparkline contract for storage adapters.
  All storage implementations must satisfy this contract.
  Verified by White Team at L0-L5 progressive methodology.

  ## Behavioral Guarantees

  1. get after put returns the same value (roundtrip invariant)
  2. get after delete returns {:error, :not_found} (deletion invariant)
  3. exists? after put returns true (existence invariant)
  4. exists? after delete returns false (absence invariant)
  5. list includes key after put (enumeration invariant)
  6. list excludes key after delete (exclusion invariant)
  """

  @type key :: String.t() | atom()
  @type value :: term()
  @type opts :: keyword()
  @type error :: {:error, :not_found | :conflict | :timeout | term()}

  @callback get(key(), opts()) :: {:ok, value()} | error()
  @callback put(key(), value(), opts()) :: :ok | error()
  @callback delete(key(), opts()) :: :ok | error()
  @callback list(opts()) :: {:ok, [key()]} | error()
  @callback exists?(key(), opts()) :: boolean()

  @callback __sparkline_contract__() :: :v1
end
```

### Contract Compliance Verification

Sparkline contracts are verified at both compile time and runtime through a dedicated verification engine:

```elixir
defmodule Prismatic.Sparkline.ContractVerifier do
  @moduledoc """
  Verifies that implementations comply with Sparkline contracts.
  Runs compile-time structural checks and runtime behavioral checks.
  Integrates with White Team progressive verification methodology.
  """

  @type verification_result :: %{
    contract: module(),
    implementation: module(),
    compile_check: :pass | {:fail, [String.t()]},
    runtime_check: :pass | {:fail, [String.t()]},
    property_check: :pass | {:fail, [String.t()]},
    overall: :compliant | :non_compliant
  }

  @spec verify(module(), module()) :: verification_result()
  def verify(contract, implementation) do
    compile = verify_compile_time(contract, implementation)
    runtime = verify_runtime(contract, implementation)
    property = verify_properties(contract, implementation)

    %{
      contract: contract,
      implementation: implementation,
      compile_check: compile,
      runtime_check: runtime,
      property_check: property,
      overall: if(all_pass?([compile, runtime, property]), do: :compliant, else: :non_compliant)
    }
  end

  @spec verify_compile_time(module(), module()) :: :pass | {:fail, [String.t()]}
  defp verify_compile_time(contract, implementation) do
    required = contract.behaviour_info(:callbacks)
    implemented = implementation.__info__(:functions)

    missing =
      required
      |> Enum.reject(fn {name, arity} ->
        Enum.member?(implemented, {name, arity})
      end)

    case missing do
      [] -> :pass
      fns -> {:fail, Enum.map(fns, fn {n, a} -> "#{n}/#{a} not implemented" end)}
    end
  end

  @spec verify_properties(module(), module()) :: :pass | {:fail, [term()]}
  defp verify_properties(contract, implementation) do
    properties = contract.__sparkline_properties__()

    results =
      Enum.map(properties, fn property ->
        case StreamData.check_all(property.generator, fn input ->
          property.assertion.(implementation, input)
        end) do
          {:ok, _} -> :pass
          {:error, failure} -> {:fail, failure}
        end
      end)

    case Enum.filter(results, &match?({:fail, _}, &1)) do
      [] -> :pass
      failures -> {:fail, failures}
    end
  end

  defp all_pass?(results), do: Enum.all?(results, &(&1 == :pass))
end
```

### Property-Based Contract Testing

The runtime behavioral guarantees are verified through property-based testing using StreamData, which generates thousands of random inputs to verify that invariants hold universally:

```elixir
defmodule Prismatic.Sparkline.PropertyTests do
  @moduledoc """
  Property-based tests for Sparkline contract compliance.
  Generates random inputs to verify behavioral guarantees hold
  under diverse conditions, catching edge cases that example-based
  tests miss.
  """

  use ExUnit.Case
  use ExUnitProperties

  @doc """
  Verifies the put-get roundtrip property:
  For any key and value, get(key) after put(key, value) returns {:ok, value}.
  This is the fundamental consistency invariant.
  """
  property "put-get roundtrip" do
    check all key <- string(:alphanumeric, min_length: 1),
              value <- term() do
      adapter = PrismaticStorage.ETS
      adapter.put(key, value, [])
      assert {:ok, ^value} = adapter.get(key, [])
    end
  end

  @doc """
  Verifies the delete-get property:
  For any key, get(key) after delete(key) returns {:error, :not_found}.
  """
  property "delete removes entry" do
    check all key <- string(:alphanumeric, min_length: 1),
              value <- term() do
      adapter = PrismaticStorage.ETS
      adapter.put(key, value, [])
      adapter.delete(key, [])
      assert {:error, :not_found} = adapter.get(key, [])
    end
  end

  @doc """
  Verifies the exists?-put consistency property:
  exists?(key) returns true if and only if key was put and not deleted.
  """
  property "exists? consistency" do
    check all key <- string(:alphanumeric, min_length: 1),
              value <- term() do
      adapter = PrismaticStorage.ETS
      refute adapter.exists?(key, [])
      adapter.put(key, value, [])
      assert adapter.exists?(key, [])
      adapter.delete(key, [])
      refute adapter.exists?(key, [])
    end
  end
end
```

## Contract Locking Mechanism

Once verified through all White Team progressive levels, contracts are locked to prevent uncontrolled changes. The locking mechanism uses cryptographic hashing to detect any modification to a locked contract, creating an immutable baseline that all consumers can depend upon:

```elixir
defmodule Prismatic.Sparkline.ContractLock do
  @moduledoc """
  Manages Sparkline contract locking.
  Locked contracts cannot be modified without explicit renegotiation.
  Renegotiation requires White Team verification and Purple Team closure.
  """

  @type lock_record :: %{
    contract: module(),
    version: String.t(),
    locked_at: DateTime.t(),
    locked_by: String.t(),
    hash: String.t(),
    consumers: [module()]
  }

  @spec lock(module(), keyword()) :: {:ok, lock_record()} | {:error, term()}
  def lock(contract, opts \\ []) do
    hash = compute_contract_hash(contract)

    record = %{
      contract: contract,
      version: Keyword.get(opts, :version, "1.0.0"),
      locked_at: DateTime.utc_now(),
      locked_by: Keyword.get(opts, :locked_by, "system"),
      hash: hash,
      consumers: discover_consumers(contract)
    }

    persist_lock(record)
    {:ok, record}
  end

  @spec verify_lock(module()) :: :valid | {:broken, String.t()}
  def verify_lock(contract) do
    case load_lock(contract) do
      {:ok, record} ->
        current_hash = compute_contract_hash(contract)
        if current_hash == record.hash do
          :valid
        else
          {:broken, "Contract #{contract} has been modified since locking"}
        end

      {:error, :not_found} ->
        {:broken, "Contract #{contract} is not locked"}
    end
  end

  @spec compute_contract_hash(module()) :: String.t()
  defp compute_contract_hash(contract) do
    callbacks = contract.behaviour_info(:callbacks)
    :crypto.hash(:sha256, :erlang.term_to_binary(callbacks)) |> Base.encode16()
  end

  defp persist_lock(record), do: :ok
  defp load_lock(_contract), do: {:error, :not_found}
  defp discover_consumers(_contract), do: []
end
```

## Architecture and Implementation

### Contract Coverage Across the Platform

Sparkline contracts cover all major inter-application boundaries, ensuring that every cross-cutting interaction is formally specified and verified:

| Contract Domain | Applications | Contracts | Status |
|----------------|-------------|-----------|--------|
| Storage Adapters | Core, ETS, Ecto, Meilisearch, KuzuDB | 5 | Locked |
| Agent Communication | prismatic_agents, domain apps | 12 | Locked |
| API Endpoints | prismatic_api, facade modules | 8 | Locked |
| Security Operations | Color Team agents | 6 | Locked |
| Quality Systems | prismatic_safety, prismatic_claude | 4 | Locked |
| OSINT Adapters | prismatic_osint_*, providers | 15 | Locked |
| Perimeter Systems | prismatic_perimeter, scanners | 7 | Locked |

### White Team Verification

The [White Team](/glossary/white-team/) validates Sparkline contracts through progressive L0-L5 methodology, where each level provides stronger guarantees than the previous:

| Level | Verification Method | What It Proves | Tooling |
|-------|-------------------|----------------|---------|
| L0 | Type checking ([Dialyzer](/glossary/dialyzer/)) | Structural type compliance | dialyxir |
| L1 | Unit testing | Individual function correctness | ExUnit |
| L2 | Property-based testing | Behavioral invariants under random input | StreamData |
| L3 | Integration testing | Cross-application contract compliance | Contract test suites |
| L4 | Contract fuzzing | Edge case and boundary condition handling | Custom fuzzer |
| L5 | Formal proof (Lean4) | Mathematical correctness guarantees | Lean 4 |

### Contract Versioning Strategy

When contracts must evolve, Sparkline supports versioned contracts that allow gradual migration rather than breaking all consumers simultaneously:

```elixir
defmodule PrismaticStorageCore.Traits.StorageAdapterV2 do
  @moduledoc """
  Version 2 of the StorageAdapter contract.
  Adds batch operations while maintaining backward compatibility
  with V1 consumers during the migration period.
  """

  @callback get(key :: term(), opts :: keyword()) :: {:ok, term()} | {:error, term()}
  @callback put(key :: term(), value :: term(), opts :: keyword()) :: :ok | {:error, term()}
  @callback delete(key :: term(), opts :: keyword()) :: :ok | {:error, term()}
  @callback list(opts :: keyword()) :: {:ok, [term()]} | {:error, term()}
  @callback exists?(key :: term(), opts :: keyword()) :: boolean()

  # V2 additions
  @callback batch_get(keys :: [term()], opts :: keyword()) :: {:ok, map()} | {:error, term()}
  @callback batch_put(entries :: [{term(), term()}], opts :: keyword()) :: :ok | {:error, term()}

  @callback __sparkline_contract__() :: :v2
end
```

## Contract-First Development Workflow

The Sparkline framework enforces a contract-first development workflow where the interface specification precedes the implementation. This inverts the traditional approach where interfaces are extracted from implementations after the fact:

```
1. DEFINE CONTRACT
   └─> Write Behaviour with @callback and @type definitions
   └─> Document behavioral invariants as properties
   └─> White Team review at L0 (structural verification)

2. WRITE CONTRACT TESTS
   └─> Property-based tests for each behavioral invariant
   └─> Edge case generators for boundary conditions
   └─> White Team review at L2 (property verification)

3. IMPLEMENT
   └─> Write implementation satisfying @behaviour
   └─> Compile-time verification of structural compliance
   └─> Run property-based tests for behavioral compliance

4. LOCK CONTRACT
   └─> White Team progressive verification L0-L5
   └─> Purple Team closure approval
   └─> Cryptographic hash computed and persisted

5. MAINTAIN
   └─> CI verifies lock integrity on every commit
   └─> Changes require formal renegotiation process
   └─> All consumers notified of renegotiation requests
```

## Usage in Prismatic Platform

### Implementing a Contract-Compliant Module

```elixir
defmodule PrismaticStorage.ETS do
  @moduledoc """
  ETS-backed storage adapter implementing the StorageAdapter Sparkline contract.
  Provides in-memory key-value storage with O(1) read and write operations.
  """

  @behaviour PrismaticStorageCore.Traits.StorageAdapter

  @impl true
  @spec get(term(), keyword()) :: {:ok, term()} | {:error, :not_found}
  def get(key, opts) do
    table = Keyword.get(opts, :table, :default_store)
    case :ets.lookup(table, key) do
      [{^key, value}] -> {:ok, value}
      [] -> {:error, :not_found}
    end
  end

  @impl true
  @spec put(term(), term(), keyword()) :: :ok
  def put(key, value, opts) do
    table = Keyword.get(opts, :table, :default_store)
    :ets.insert(table, {key, value})
    :ok
  end

  @impl true
  @spec delete(term(), keyword()) :: :ok
  def delete(key, opts) do
    table = Keyword.get(opts, :table, :default_store)
    :ets.delete(table, key)
    :ok
  end

  @impl true
  @spec list(keyword()) :: {:ok, [term()]}
  def list(opts) do
    table = Keyword.get(opts, :table, :default_store)
    keys = :ets.foldl(fn {key, _}, acc -> [key | acc] end, [], table)
    {:ok, keys}
  end

  @impl true
  @spec exists?(term(), keyword()) :: boolean()
  def exists?(key, opts) do
    table = Keyword.get(opts, :table, :default_store)
    :ets.member(table, key)
  end

  @impl true
  def __sparkline_contract__, do: :v1
end
```

### Verifying Contract Compliance

```elixir
# Verify a single implementation against its contract
result = Prismatic.Sparkline.ContractVerifier.verify(
  PrismaticStorageCore.Traits.StorageAdapter,
  PrismaticStorage.ETS
)

# Check all locked contracts for integrity
Prismatic.Sparkline.ContractLock.verify_all_locks()

# Run property-based verification for a specific contract
Prismatic.Sparkline.PropertyRunner.verify_contract(
  PrismaticStorageCore.Traits.StorageAdapter,
  iterations: 10_000
)
```

## Integration with Quality Gates

Sparkline contract verification is integrated into the platform's [quality gates](/glossary/quality-gates/) pipeline, ensuring that every commit maintains contract compliance:

```elixir
defmodule Prismatic.Quality.SparklineGate do
  @moduledoc """
  Quality gate for Sparkline contract compliance.
  Blocks commits that break locked contracts or introduce
  non-compliant implementations.
  """

  @spec check() :: :pass | {:fail, [String.t()]}
  def check do
    lock_violations = verify_all_locks()
    compliance_violations = verify_all_implementations()

    case lock_violations ++ compliance_violations do
      [] -> :pass
      violations -> {:fail, violations}
    end
  end

  @spec verify_all_locks() :: [String.t()]
  defp verify_all_locks do
    Prismatic.Sparkline.ContractLock.all_locked_contracts()
    |> Enum.flat_map(fn contract ->
      case Prismatic.Sparkline.ContractLock.verify_lock(contract) do
        :valid -> []
        {:broken, reason} -> [reason]
      end
    end)
  end
end
```

## Best Practices

1. **Define contracts before implementations**. Contract-first design ensures that interfaces are designed for consumers rather than shaped by implementation details. The contract represents the agreement between producer and consumer, not the producer's internal structure.

2. **Include behavioral properties in every contract**. Function signatures alone do not specify behavior. A function matching `(String.t()) -> {:ok, term()}` could return any value. Property-based testing verifies that implementations behave correctly under diverse conditions.

3. **Lock contracts as early as possible**. Unlocked contracts drift. Lock them as soon as they are verified to prevent unintentional changes. Every day a contract remains unlocked is a day where silent drift can occur.

4. **Renegotiate rather than silently modify**. When a contract needs to change, create a new version through explicit renegotiation with all consumers rather than modifying the existing contract. This preserves backward compatibility during migration.

5. **Run contract verification in CI**. Contract compliance should be checked on every commit, not just during periodic audits. The quality gate integration ensures continuous compliance.

6. **Document behavioral invariants explicitly**. Each contract should include a `@moduledoc` section listing all behavioral guarantees. These guarantees are the source of truth for property-based test generation.

7. **Test the contract tests**. A property-based test that never fails is likely not testing anything meaningful. Verify that tests fail when given deliberately non-compliant implementations as a meta-validation of test quality.

## Common Pitfalls

- **Treating Behaviour callbacks as sufficient contracts**: Callbacks define function signatures but not behavioral semantics. Property-based testing is essential for complete contract verification. A module can implement all callbacks with the correct types while violating every behavioral invariant.

- **Over-specifying contracts**: Contracts that are too specific constrain implementations unnecessarily. Specify the minimum behavioral guarantees required by consumers, not the complete internal behavior of the producer. Over-specification creates fragile contracts that break when implementations are optimized.

- **Ignoring contract versioning**: When contracts must change, versioned contracts allow gradual migration rather than breaking all consumers simultaneously. Avoid the temptation to "just fix it everywhere at once" -- coordinated changes across 115 applications are error-prone.

- **Not testing the contract test itself**: A property-based test that never fails is likely not testing anything meaningful. Verify that tests fail when given deliberately non-compliant implementations. This meta-testing catches vacuous properties.

- **Locking too late**: The longer a contract remains unlocked, the more opportunity for silent drift. Lock contracts immediately after White Team verification completes. Postponing locking "until the API stabilizes" often means it never gets locked.

## Sparkline Metrics and Monitoring

| Metric | Current Value | Target |
|--------|--------------|--------|
| Total contracts | 57 | 60+ |
| Locked contracts | 57 | 100% |
| Property tests per contract (avg) | 6.2 | 5+ |
| White Team verification level (avg) | L3 | L3+ |
| Contract violations (last 30 days) | 0 | 0 |
| Renegotiations (last 30 days) | 2 | <5 |

## Related Concepts

- [Behaviour](/glossary/behaviour/) -- Compile-time contract mechanism underlying Sparkline
- [Protocol](/glossary/protocol/) -- Type-based dispatch complementing module contracts
- [White Team](/glossary/white-team/) -- Verification team validating contracts formally
- [Property-Based Testing](/glossary/property-based-testing/) -- Runtime contract validation methodology
- [Quality Gates](/glossary/quality-gates/) -- Pipeline enforcing contract compliance on every commit
- [Regression Test](/glossary/regression-test/) -- Tests preventing contract drift
- [Adapter Pattern](/glossary/adapter-pattern/) -- Pattern enabling pluggable contract implementations
- [Typespec](/glossary/typespec/) -- Type annotations powering compile-time contract checks
- [Dialyzer](/glossary/dialyzer/) -- Static analysis tool for L0 contract verification

## See Also

- [Architecture](/architecture/) -- Platform architecture overview
- [Technologies](/technologies/) -- Technology stack details
- [Apps](/apps/) -- Application directory

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
