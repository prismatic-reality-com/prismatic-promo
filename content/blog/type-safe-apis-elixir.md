+++
title = "Building Type-Safe APIs in Elixir with Specs and Dialyzer"
date = 2026-03-06
description = "How to leverage @spec, @type, and Dialyzer to build robust type-safe API layers in Elixir, with practical examples from API response types and domain models."

[extra]
author = "Tomas Korcak (korczis)"
category = "engineering"
tags = ["elixir", "types", "dialyzer", "api-design", "specs"]
reading_time = "10 min"
keywords = ["elixir type safety", "dialyzer", "typespec", "api response types", "type system"]
image = "/images/blog/type-safe-apis-elixir.png"
word_count = 1380
date_created = "2026-03-06"
date_modified = "2026-03-06"
quality_score = 91
see_also = ["architecture", "developers", "error-handling-strategies"]
image_alt = "Building Type-Safe APIs in Elixir - Prismatic Platform"
+++

Elixir is dynamically typed, but that does not mean you should abandon type safety. The `@type`, `@spec`, and `@typedoc` attributes combined with Dialyzer's static analysis provide a powerful system for catching type errors at compile time, documenting interfaces precisely, and enabling IDE tooling.

This post covers the type architecture used in the Prismatic Platform for API responses, domain models, and cross-module contracts.

## Defining Domain Types

Types should be defined close to their domain. In the Prismatic Platform, each major domain has a dedicated types module:

```elixir
defmodule PrismaticWeb.Types.APIResponseTypes do
  @moduledoc """
  Type definitions for all API response envelopes.
  Provides compile-time safety for API layer contracts.
  """

  @typedoc "Standard API response envelope"
  @type api_response(data_type) :: %{
    data: data_type,
    meta: response_meta(),
    version: String.t()
  }

  @typedoc "Response metadata"
  @type response_meta :: %{
    request_id: String.t(),
    timestamp: DateTime.t(),
    duration_ms: non_neg_integer()
  }

  @typedoc "Paginated response envelope"
  @type paginated_response(data_type) :: %{
    data: [data_type],
    meta: response_meta(),
    pagination: pagination_info(),
    version: String.t()
  }

  @typedoc "Pagination metadata"
  @type pagination_info :: %{
    page: pos_integer(),
    page_size: pos_integer(),
    total_pages: non_neg_integer(),
    total_count: non_neg_integer(),
    has_next: boolean(),
    has_prev: boolean()
  }

  @typedoc "Standardized error response"
  @type error_response :: %{
    error: %{
      code: error_code(),
      message: String.t(),
      details: map() | nil
    },
    meta: response_meta()
  }

  @typedoc "Canonical error codes"
  @type error_code ::
    :not_found
    | :unauthorized
    | :forbidden
    | :validation_error
    | :rate_limited
    | :internal_error
    | :service_unavailable
end
```

## Parameterized Types

Notice the `api_response(data_type)` pattern above. This is a parameterized type: the response envelope is generic over its payload. This lets controller specs be precise about what they return:

```elixir
defmodule PrismaticWeb.DDCaseController do
  @moduledoc """
  REST API controller for DD cases.
  """

  alias PrismaticWeb.Types.APIResponseTypes

  @spec show(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def show(conn, %{"id" => id}) do
    case Prismatic.DD.get_case(id) do
      {:ok, dd_case} ->
        conn
        |> put_status(200)
        |> json(build_response(dd_case))

      {:error, :not_found} ->
        conn
        |> put_status(404)
        |> json(build_error(:not_found, "Case not found"))
    end
  end

  @spec build_response(Prismatic.DD.Case.t()) :: APIResponseTypes.api_response(map())
  defp build_response(dd_case) do
    %{
      data: serialize_case(dd_case),
      meta: build_meta(),
      version: "v1"
    }
  end
end
```

Dialyzer will flag any mismatch between `build_response/1`'s declared return type and its actual implementation.

## Struct-Based Types

For domain entities, define types through structs with enforced keys:

```elixir
defmodule Prismatic.DD.Case do
  @moduledoc """
  Core DD case domain entity.
  """

  @type t :: %__MODULE__{
    id: String.t(),
    name: String.t(),
    status: status(),
    priority: priority(),
    entities: [Prismatic.DD.Entity.t()],
    confidence_score: float() | nil,
    created_at: DateTime.t(),
    updated_at: DateTime.t()
  }

  @type status :: :draft | :active | :review | :completed | :archived
  @type priority :: :low | :medium | :high | :critical

  @enforce_keys [:id, :name, :status, :priority]
  defstruct [
    :id,
    :name,
    :status,
    :priority,
    :confidence_score,
    :created_at,
    :updated_at,
    entities: []
  ]
end
```

The `@enforce_keys` attribute provides runtime safety: attempting to build a `%Prismatic.DD.Case{}` without required fields raises immediately. The `@type t` definition provides compile-time documentation and Dialyzer checking.

## Union Types and Guards

Elixir union types model domain state machines precisely:

```elixir
@type investigation_state ::
  {:pending, pending_metadata()}
  | {:running, running_metadata()}
  | {:completed, completed_metadata()}
  | {:failed, failure_reason()}

@type failure_reason ::
  :timeout
  | :adapter_error
  | :rate_limited
  | {:unexpected, term()}
```

Combined with pattern matching, this creates exhaustive handling:

```elixir
@spec handle_state(investigation_state()) :: :ok
def handle_state({:pending, meta}), do: schedule_start(meta)
def handle_state({:running, meta}), do: check_progress(meta)
def handle_state({:completed, meta}), do: publish_results(meta)
def handle_state({:failed, reason}), do: handle_failure(reason)
```

Dialyzer will warn if you add a new state variant but forget to add a matching clause.

## The DOCS Doctrine and @spec Coverage

The platform's DOCS doctrine requires `@spec` on every public function. This is enforced in CI:

```bash
# Checks for missing @spec on public functions
mix validate-docs
```

The rule is simple: if a function is public (`def`, not `defp`), it must have a `@spec`. Private functions benefit from specs too, but enforcement is only on the public API surface.

| Annotation | Required For | Purpose |
|---|---|---|
| `@moduledoc` | Every module | Module-level documentation |
| `@doc` | Every public function | Function documentation |
| `@spec` | Every public function | Type contract |
| `@typedoc` | Every `@type` | Type documentation |
| `@type` | Domain types | Type definitions |

## Running Dialyzer

Dialyzer uses a PLT (Persistent Lookup Table) built from your project and dependencies:

```bash
# Build the PLT (first time, slow)
mix dialyzer --plt

# Run analysis
mix dialyzer

# Run with specific warnings
mix dialyzer --format dialyxir
```

Common Dialyzer warnings and what they mean:

| Warning | Meaning | Fix |
|---|---|---|
| `no_return` | Function never returns normally | Check for infinite loops or always-raising paths |
| `no_match` | Pattern match will never succeed | Verify your types match actual data |
| `invalid_contract` | @spec contradicts the code | Update spec or implementation |
| `call_without_opaque` | Accessing opaque type internals | Use the type's API functions |

## Opaque Types

For types that should not be pattern-matched outside their module, use `@opaque`:

```elixir
defmodule Prismatic.DD.ConfidenceScore do
  @moduledoc """
  Encapsulated confidence score with validation invariants.
  """

  @opaque t :: %__MODULE__{value: float(), source: atom()}
  defstruct [:value, :source]

  @spec new(float(), atom()) :: {:ok, t()} | {:error, :invalid_score}
  def new(value, source) when is_float(value) and value >= 0.0 and value <= 1.0 do
    {:ok, %__MODULE__{value: value, source: source}}
  end

  def new(_value, _source), do: {:error, :invalid_score}

  @spec value(t()) :: float()
  def value(%__MODULE__{value: v}), do: v

  @spec source(t()) :: atom()
  def source(%__MODULE__{source: s}), do: s
end
```

Code outside this module that tries to access `score.value` directly will trigger a Dialyzer warning. This enforces the invariant that all scores are between 0.0 and 1.0.

## Type-Driven Design

Types document the design before implementation. Writing types first clarifies the API surface:

```elixir
# Step 1: Define the contract
@spec search_entities(search_query()) :: {:ok, paginated_response(entity())} | {:error, search_error()}

# Step 2: Define the input type
@type search_query :: %{
  term: String.t(),
  filters: [filter()],
  sort: sort_option(),
  page: pos_integer(),
  page_size: 1..100
}

# Step 3: Implement against the contract
def search_entities(%{term: term, filters: filters} = query) do
  # Implementation guided by the type contract
end
```

This approach catches interface mismatches before writing any logic and creates self-documenting code that IDEs can leverage for autocomplete and inline documentation.

## Summary

Elixir's type system is opt-in but powerful when used consistently. The combination of `@type` definitions, `@spec` contracts, `@enforce_keys` runtime checks, and Dialyzer static analysis creates multiple layers of type safety without sacrificing Elixir's dynamic flexibility. The DOCS doctrine ensures this is not optional but standard practice across the codebase.
