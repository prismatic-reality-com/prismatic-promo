+++
title = "Typespec"
weight = 11
[extra]
category = "quality"
description = "Elixir type specification annotations (@spec, @type) that document function signatures and enable static analysis via Dialyzer."
related_terms = ["dialyzer", "qdp", "behaviour", "beam", "exunit", "code-coverage", "clean-run", "mix"]
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 822
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Typespec", "Elixir", "Dialyzer", "glossary", "quality", "Prismatic Platform", "Phase"]
tags = ["glossary", "quality", "typespec", "prismatic"]
quality_score = 77
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Typespec - Prismatic Platform"
+++

## Definition

Typespecs are Elixir's annotation system for declaring types and function signatures at the module level. The `@spec` attribute documents a function's parameter types and return type; `@type` and `@typep` define public and private named types; `@callback` declares the type signatures required by a [Behaviour](/glossary/behaviour/). While Elixir remains dynamically typed at runtime -- the [BEAM](/glossary/beam/) virtual machine does not enforce type annotations during execution -- typespecs enable [Dialyzer](/glossary/dialyzer/) to perform static analysis at compile time, catching type mismatches, unreachable code, and contract violations without false positives through its "success typing" approach.

Typespecs serve a dual purpose: they are machine-readable contracts consumed by static analysis tools, and they are human-readable documentation rendered by ExDoc in generated API documentation. This dual role means that comprehensive typespec coverage simultaneously improves code safety (through Dialyzer analysis) and developer experience (through clear API documentation). Unlike type systems in languages like Haskell or Rust, Elixir typespecs are optional and advisory -- they guide tooling without constraining the runtime, providing a pragmatic middle ground between fully dynamic and fully static typing.

The typespec system supports a rich vocabulary of built-in types (atoms, integers, floats, binaries, lists, tuples, maps, structs, pids, references, ports), union types (`String.t() | atom()`), parameterized types (`list(integer())`), and special types like `no_return()` for functions that always raise or loop. Custom types compose these primitives into domain-specific vocabulary that makes function signatures self-documenting.

## Context in Prismatic

Typespec coverage is one of the 13 quality domains tracked to zero violations in the Prismatic Platform. The NO MERCY doctrine mandates `@spec` annotations on all public functions across all 90 umbrella applications. Missing typespecs are counted as [QDP](/glossary/qdp/) (Quality Debt Points) and blocked by quality gates -- the platform currently maintains 0 QDP across all domains. The `mix quality.gates` command validates typespec coverage as part of the [Clean Run](/glossary/clean-run/) standard, and CI pipelines reject code that introduces public functions without corresponding `@spec` annotations.

Dialyzer analysis depends on comprehensive typespecs for accurate cross-module type checking. The platform's PLT (Persistent Lookup Table) cache includes type information for all 90 apps and their dependencies, enabling Dialyzer to detect type mismatches across module boundaries. Custom types defined in `prismatic_storage_core` (like `entity_id()`, `confidence_score()`, `risk_rating()`) propagate through the entire codebase, creating a consistent type vocabulary across all platform components.

## Type Declaration Syntax

Elixir provides three module attributes for type declarations:

```elixir
defmodule PrismaticPerimeter.Types do
  @moduledoc "Shared type definitions for the Perimeter domain."

  # Public type -- visible in documentation and to Dialyzer
  @type security_grade :: :A | :B | :C | :D | :F

  @type security_rating :: %{
    grade: security_grade(),
    score: 300..900,
    confidence: float(),
    assessed_at: DateTime.t()
  }

  @type asset_type :: :domain | :ip | :certificate | :cloud_resource | :service

  @type discovery_result :: {:ok, [asset()]} | {:error, discovery_error()}

  @type asset :: %{
    type: asset_type(),
    identifier: String.t(),
    risk_score: float(),
    metadata: map()
  }

  # Private type -- only visible within this module
  @typep discovery_error :: :timeout | :dns_failure | :rate_limited | {:http_error, pos_integer()}

  # Opaque type -- callers cannot pattern match on internal structure
  @opaque rating_state :: %__MODULE__{
    assets: [asset()],
    cache: map(),
    last_scan: DateTime.t() | nil
  }
end
```

| Attribute | Visibility | Use Case |
|-----------|-----------|----------|
| `@type` | Public | Domain types used across modules |
| `@typep` | Private | Implementation types within a module |
| `@opaque` | Public name, hidden structure | Types where callers should not depend on internals |

## Function Specifications

The `@spec` attribute declares the type contract for a function:

```elixir
defmodule PrismaticPerimeter.SecurityRating do
  alias PrismaticPerimeter.Types

  @spec calculate(map()) :: {:ok, Types.security_rating()} | {:error, atom()}
  def calculate(%{} = assets) do
    score = compute_score(assets)
    grade = score_to_grade(score)
    {:ok, %{grade: grade, score: score, confidence: 0.95, assessed_at: DateTime.utc_now()}}
  end

  def calculate(_invalid), do: {:error, :invalid_assets}

  @spec score_to_grade(300..900) :: Types.security_grade()
  defp score_to_grade(score) when score >= 850, do: :A
  defp score_to_grade(score) when score >= 700, do: :B
  defp score_to_grade(score) when score >= 550, do: :C
  defp score_to_grade(score) when score >= 400, do: :D
  defp score_to_grade(_score), do: :F

  # Multiple clauses with different arities
  @spec discover(String.t()) :: Types.discovery_result()
  @spec discover(String.t(), keyword()) :: Types.discovery_result()
  def discover(domain, opts \\ []) do
    # ...
  end

  # Function that never returns normally
  @spec raise_invalid!(term()) :: no_return()
  def raise_invalid!(value) do
    raise ArgumentError, "Invalid value: #{inspect(value)}"
  end
end
```

## Callback Specifications

Behaviours use `@callback` to declare the type contracts that implementing modules must satisfy:

```elixir
defmodule PrismaticStorage.Adapter do
  @moduledoc "Behaviour for storage adapter implementations."

  @type key :: String.t()
  @type value :: term()
  @type error :: {:error, :not_found | :connection_failed | :timeout}

  @callback get(key()) :: {:ok, value()} | error()
  @callback put(key(), value()) :: :ok | error()
  @callback delete(key()) :: :ok | error()
  @callback list(prefix :: String.t()) :: {:ok, [key()]} | error()

  # Optional callback with default implementation
  @callback health_check() :: :ok | {:error, term()}
  @optional_callbacks health_check: 0
end
```

When a module uses `@behaviour PrismaticStorage.Adapter`, [Dialyzer](/glossary/dialyzer/) verifies that the implementing module's function specs are compatible with the callback declarations. Missing callbacks produce compilation warnings; incompatible types produce Dialyzer warnings.

## Built-in Type Reference

Elixir's typespec system provides a comprehensive set of built-in types:

| Category | Types | Examples |
|----------|-------|---------|
| **Basic** | `atom()`, `integer()`, `float()`, `boolean()` | `:ok`, `42`, `3.14`, `true` |
| **Binary** | `binary()`, `String.t()`, `bitstring()` | `"hello"`, `<<1, 2, 3>>` |
| **Collections** | `list()`, `map()`, `tuple()`, `keyword()` | `[1, 2]`, `%{}`, `{:ok, v}` |
| **Process** | `pid()`, `reference()`, `port()` | `self()`, `make_ref()` |
| **Structs** | `%Module{}`, `struct()` | `%DateTime{}`, `%URI{}` |
| **Functions** | `(arg -> ret)`, `fun()` | `(integer() -> boolean())` |
| **Special** | `term()`, `any()`, `no_return()`, `as_boolean()` | Catch-all, never returns |
| **Ranges** | `1..100`, `non_neg_integer()`, `pos_integer()` | Numeric constraints |
| **Union** | `type1 \| type2` | `String.t() \| atom()` |
| **Literal** | `:specific_atom`, `1`, `true` | Exact value types |

## Dialyzer Integration

Typespecs feed directly into [Dialyzer](/glossary/dialyzer/)'s static analysis pipeline. Dialyzer uses "success typing" -- rather than proving a program correct, it proves that certain call patterns will definitely fail. This eliminates false positives while still catching genuine type errors.

```
Source Code + @spec annotations
         |
         v
  Compilation to BEAM bytecode
         |
         v
  PLT (Persistent Lookup Table) construction
         |
         v
  Dialyzer analysis (success typing)
         |
         v
  Warnings: type mismatches, unreachable code, missing returns
```

| Dialyzer Warning | Cause | Typespec Fix |
|-----------------|-------|-------------|
| `no_return` | Function always raises/loops | Add `@spec func() :: no_return()` |
| `invalid_contract` | Spec contradicts implementation | Align `@spec` with actual return types |
| `call_without_opaque` | Opaque type accessed directly | Use module's public API |
| `missing_return` | Not all clauses covered in spec | Add union type for all return paths |
| `overlapping_contract` | Multiple specs overlap | Consolidate into single spec with unions |

## Documentation Integration

ExDoc renders typespecs in generated documentation, making them the primary API reference:

```elixir
defmodule PrismaticPerimeter.Scanner do
  @moduledoc """
  Scans domains for attack surface assets.
  """

  @doc """
  Discovers all externally visible assets for a domain.

  Returns a list of discovered assets with risk scores and metadata.
  Requires network access to DNS resolvers and certificate transparency logs.

  ## Parameters

    * `domain` - The target domain to scan (e.g., "example.com")
    * `opts` - Scan options (see below)

  ## Options

    * `:depth` - Maximum subdomain enumeration depth (default: 3)
    * `:timeout` - Per-check timeout in milliseconds (default: 30_000)

  """
  @spec discover(String.t(), keyword()) :: {:ok, [map()]} | {:error, atom()}
  def discover(domain, opts \\ []) do
    # Implementation
  end
end
```

The rendered documentation shows the function signature with linked types, enabling developers to click through to type definitions and understand the complete API contract without reading source code.

## Gradual Typing Strategy

Typespecs support a gradual adoption strategy where teams add type annotations incrementally:

| Phase | Coverage | Dialyzer Impact | Prismatic Status |
|-------|----------|----------------|-----------------|
| **Phase 1** | Public API functions only | Basic cross-module checking | Complete |
| **Phase 2** | All public + key private functions | Deep intra-module analysis | Complete |
| **Phase 3** | Custom domain types (`@type`) | Semantic type vocabulary | Complete |
| **Phase 4** | Behaviour callbacks (`@callback`) | Contract verification | Complete |
| **Phase 5** | 100% coverage including private | Full codebase analysis | Enforced |

The Prismatic Platform operates at Phase 5 -- every public function has a `@spec`, all behaviours have `@callback` declarations, and domain types are defined in shared type modules. This provides maximum Dialyzer coverage and ensures API documentation is always complete and type-accurate.

## Related Terms

- [Dialyzer](/glossary/dialyzer/) - Static analysis tool that consumes typespecs for type checking
- [Behaviour](/glossary/behaviour/) - Module contracts using `@callback` type declarations
- [QDP](/glossary/qdp/) - Quality metric tracking missing typespec annotations
- [Clean Run](/glossary/clean-run/) - Zero-warning standard including typespec completeness
- [ExUnit](/glossary/exunit/) - Test framework complementing typespec static analysis
- [Code Coverage](/glossary/code-coverage/) - Runtime coverage complementing compile-time type analysis
- [BEAM](/glossary/beam/) - Virtual machine whose bytecode Dialyzer analyzes
- [Mix](/glossary/mix/) - Build tool running Dialyzer via `mix dialyzer`
- [Pattern Matching](/glossary/pattern-matching/) - Runtime type discrimination complementing typespecs
- [Immutability](/glossary/immutability/) - Data model enabling reliable type inference

## See Also

- [Architecture](/architecture/) - Platform quality architecture
- [Technologies](/technologies/) - Elixir type system and tooling

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)