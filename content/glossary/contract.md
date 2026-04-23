+++
title = "Contract"
weight = 50
[extra]
description = "A behavioral specification that defines the expected interface, types, and invariants of a module or function, enforced at compile-time by Dialyzer or at runtime by contract tests"
category = "code-quality"
related_terms = ["compilation", "code-quality", "consistency", "counterexample", "credo"]
complexity_level = "advanced"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["contract", "Dialyzer", "type specification", "behavioral contract", "contract testing", "spec", "glossary", "Prismatic Platform"]
tags = ["glossary", "code-quality", "testing"]
quality_score = 80
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Contract - Prismatic Platform"
+++

## Definition & Overview

A contract, in software engineering, is a formal specification that defines the expected behavior of a module, function, or service -- including its input types, output types, preconditions, postconditions, and invariants. Contracts serve as machine-verifiable documentation that captures not just "what" a function does but "what it promises" to callers and "what it expects" from them. Design by Contract (DbC), originated by Bertrand Meyer for Eiffel, establishes that contracts are as important as implementations.

In the Elixir/BEAM ecosystem, contracts manifest in two primary forms: type specifications (`@spec`) verified by Dialyzer at compile-time, and behavioral contracts (`@behaviour`, `@callback`) enforced at compilation. Dialyzer uses success typing to detect contract violations -- it proves that a function can never return a type matching its spec, rather than proving it always returns the correct type. This approach produces zero false positives at the cost of potentially missing some violations.

The Prismatic Platform enforces contracts rigorously. Every public function must have an `@spec` annotation (enforced by Credo and quality gates), all behaviours must have `@callback` definitions, and the White Team's `white-contract-validator` agent performs contract validation as part of the Color Team security operations. The SPARKLINE NEXT Contract Lock milestone established contract canonicalization as a P0 priority, ensuring that all inter-module contracts are formally defined and tested.

## Technical Deep Dive

### Contract Types in Elixir

| Contract Type | Mechanism | Verification | Enforcement |
|---------------|-----------|-------------|-------------|
| **Type Spec** | `@spec` annotation | Dialyzer (compile-time) | Quality gates |
| **Behaviour** | `@behaviour` + `@callback` | Compiler | Compile error |
| **Protocol** | `defprotocol` | Compiler + runtime | Protocol dispatch |
| **Guard** | `when is_type(arg)` | Runtime | FunctionClauseError |
| **Pattern Match** | Function clauses | Runtime | MatchError |
| **Contract Test** | `AdapterContractTest` | Test suite | CI pipeline |

### Dialyzer Contract Example

```elixir
defmodule PrismaticOsintCore.ToolContract do
  @moduledoc """
  Defines the contract for all OSINT tools.
  Every tool implementing this behaviour must satisfy these
  type specifications and callback contracts.
  """

  @type tool_config :: %{
    slug: String.t(),
    name: String.t(),
    category: atom(),
    api_style: :provider | :source,
    input_fields: [input_field()],
    requires_auth: boolean()
  }

  @type input_field :: %{
    name: atom(),
    type: :text | :number | :select | :boolean,
    label: String.t(),
    required: boolean()
  }

  @type tool_result :: %{
    status: :ok | :error,
    data: map(),
    confidence: float(),
    source: String.t(),
    timestamp: DateTime.t()
  }

  @callback config() :: tool_config()
  @callback search(map()) :: {:ok, tool_result()} | {:error, atom()}
  @callback run(map()) :: {:ok, tool_result()} | {:error, atom()}
end
```

### Contract Testing Pattern

```elixir
defmodule PrismaticStorage.AdapterContractTest do
  @moduledoc """
  Shared contract test suite for all storage adapters.
  Any module claiming to implement the storage adapter contract
  must pass all tests in this suite. This ensures behavioral
  consistency across ETS, Ecto, Meilisearch, and KuzuDB adapters.
  """

  defmacro __using__(opts) do
    adapter_module = Keyword.fetch!(opts, :adapter_module)

    quote do
      use ExUnit.Case, async: true

      @adapter unquote(adapter_module)

      describe "#{inspect(@adapter)} contract compliance" do
        test "implements store/2 returning {:ok, record}" do
          record = build_test_record()
          assert {:ok, stored} = @adapter.store(:test_collection, record)
          assert stored.id != nil
        end

        test "implements fetch/2 returning {:ok, record} or {:error, :not_found}" do
          record = build_test_record()
          {:ok, stored} = @adapter.store(:test_collection, record)

          assert {:ok, fetched} = @adapter.fetch(:test_collection, stored.id)
          assert fetched.id == stored.id
        end

        test "implements delete/2 returning :ok" do
          record = build_test_record()
          {:ok, stored} = @adapter.store(:test_collection, record)

          assert :ok = @adapter.delete(:test_collection, stored.id)
          assert {:error, :not_found} = @adapter.fetch(:test_collection, stored.id)
        end

        test "implements list/1 returning {:ok, [record]}" do
          assert {:ok, records} = @adapter.list(:test_collection)
          assert is_list(records)
        end

        test "fetch returns {:error, :not_found} for non-existent id" do
          assert {:error, :not_found} = @adapter.fetch(:test_collection, "nonexistent")
        end
      end

      defp build_test_record do
        %{id: nil, data: %{test: true}, inserted_at: DateTime.utc_now()}
      end
    end
  end
end
```

### White Team Contract Verification

```elixir
defmodule PrismaticDark.WhiteTeam.ContractValidator do
  @moduledoc """
  White Team contract validation agent.
  Verifies that module implementations satisfy their declared contracts.
  Produces structured evidence for the Color Team pipeline.
  """

  @type validation_result :: %{
    module: atom(),
    contract_type: atom(),
    status: :valid | :violation,
    violations: [String.t()],
    evidence: map()
  }

  @spec validate_module(atom()) :: {:ok, validation_result()} | {:error, validation_result()}
  def validate_module(module) do
    violations = []

    violations = violations ++ check_spec_coverage(module)
    violations = violations ++ check_behaviour_compliance(module)
    violations = violations ++ check_impl_annotations(module)

    result = %{
      module: module,
      contract_type: :comprehensive,
      status: if(violations == [], do: :valid, else: :violation),
      violations: violations,
      evidence: %{checked_at: DateTime.utc_now()}
    }

    if violations == [], do: {:ok, result}, else: {:error, result}
  end

  defp check_spec_coverage(module) do
    functions = module.__info__(:functions)
    specs = get_specs(module)

    missing = Enum.reject(functions, fn {name, arity} ->
      {name, arity} in specs or name in [:__info__, :module_info]
    end)

    Enum.map(missing, fn {name, arity} ->
      "Missing @spec for #{inspect(module)}.#{name}/#{arity}"
    end)
  end

  defp check_behaviour_compliance(module) do
    behaviours = module.__info__(:attributes)
    |> Keyword.get_values(:behaviour)
    |> List.flatten()

    Enum.flat_map(behaviours, fn behaviour ->
      required = behaviour.behaviour_info(:callbacks)
      implemented = module.__info__(:functions)

      Enum.reject(required, fn {name, arity} ->
        {name, arity} in implemented
      end)
      |> Enum.map(fn {name, arity} ->
        "Missing callback #{name}/#{arity} from #{inspect(behaviour)}"
      end)
    end)
  end

  defp check_impl_annotations(module) do
    module.__info__(:attributes)
    |> Keyword.get_values(:impl)
    |> case do
      [] -> []
      _ -> []
    end
  end

  defp get_specs(module) do
    case Code.Typespec.fetch_specs(module) do
      {:ok, specs} -> Enum.map(specs, fn {{name, arity}, _} -> {name, arity} end)
      :error -> []
    end
  end
end
```

## Architecture & Implementation

The Prismatic Platform implements a multi-layered contract enforcement architecture. At the type level, `@spec` annotations on all public functions define the type contract, verified by Dialyzer during the pre-commit hook (Phase 3) and CI pipeline. At the behaviour level, `@behaviour` and `@callback` definitions enforce structural contracts at compilation -- a module that claims to implement a behaviour but is missing a callback will not compile.

At the testing level, the `AdapterContractTest` pattern provides shared test suites that verify behavioral contracts. Any storage adapter that passes the contract test suite is guaranteed to exhibit the same observable behavior, regardless of its underlying implementation (ETS, Ecto, Meilisearch, KuzuDB). This enables the platform to swap storage backends without breaking higher-level code.

At the security level, the White Team's `white-contract-validator` performs runtime contract verification as part of Color Team operations, ensuring that modules continue to satisfy their contracts even as the codebase evolves. This catches contract drift -- subtle changes that pass compilation but alter observable behavior.

## Usage in Prismatic Platform

The SPARKLINE NEXT milestone established contract canonicalization as a foundational requirement. All inter-module interfaces were formally specified with `@spec` annotations, tested with contract test suites, and verified with Dialyzer. This investment in contract infrastructure enables the platform to evolve rapidly with confidence that interface changes are caught immediately.

The 709 `@impl` annotations across the codebase explicitly mark which functions implement behaviour callbacks, providing documentation and enabling compiler verification. The quality gates enforce 100% `@impl` coverage -- every callback implementation must be annotated.

The API gateway uses contracts (specifically `@spec` annotations) as the foundation for its auto-introspection capabilities. `Code.Typespec.fetch_specs/1` reads the compiled spec information to generate OpenAPI schema definitions, making contracts not just a correctness tool but a documentation and API design tool.

## Cross-References

- [Compilation](/glossary/compilation/) - build phase where contracts are verified
- [Code Quality](/glossary/code-quality/) - contracts as quality enforcement
- **Counterexample** - property test failures revealing contract violations
- [Credo](/glossary/credo/) - enforces @spec annotation requirements
- [Consistency](/glossary/consistency/) - behavioral consistency ensured by contracts
- **Livebooks**: `livebooks/domains/quality_testing/` - contract testing experiments
- **Academy**: Type systems and contract design topics

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
