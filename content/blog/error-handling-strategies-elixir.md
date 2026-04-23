+++
title = "Structured Error Handling in Elixir: The ZERO Doctrine"
date = 2026-03-18
description = "A comprehensive guide to error handling strategies in Elixir covering ok/error tuples, with chains, specific rescue clauses, and why bare rescue is banned."

[extra]
author = "Tomas Korcak (korczis)"
category = "tutorial"
tags = ["elixir", "error-handling", "zero-doctrine", "patterns", "best-practices"]
reading_time = "11 min"
keywords = ["elixir error handling", "zero doctrine", "bare rescue", "ok error tuple", "with clause"]
image = "/images/blog/error-handling-strategies-elixir.png"
word_count = 1380
date_created = "2026-03-18"
date_modified = "2026-03-18"
quality_score = 91
see_also = ["architecture", "developers", "genserver-patterns"]
image_alt = "Structured Error Handling in Elixir - Prismatic Platform"
+++

Error handling in Elixir follows a philosophy fundamentally different from exception-heavy languages. The primary mechanism is return values: `{:ok, value}` and `{:error, reason}`. Exceptions exist but are reserved for truly exceptional situations. The Prismatic Platform's ZERO doctrine (Zero Error Runtime Operations) codifies this philosophy into enforceable rules.

## The {:ok, value} / {:error, reason} Convention

Every function that can fail should return a tagged tuple:

```elixir
@spec fetch_entity(String.t()) :: {:ok, Entity.t()} | {:error, fetch_error()}
@type fetch_error :: :not_found | :unauthorized | {:database_error, term()}

def fetch_entity(id) when is_binary(id) do
  case Repo.get(Entity, id) do
    nil -> {:error, :not_found}
    entity -> {:ok, entity}
  end
end
```

This pattern makes errors explicit in the type signature and forces callers to handle both cases:

```elixir
case fetch_entity(id) do
  {:ok, entity} -> process(entity)
  {:error, :not_found} -> {:error, :entity_missing}
  {:error, :unauthorized} -> {:error, :access_denied}
  {:error, {:database_error, reason}} -> {:error, {:internal, reason}}
end
```

## The `with` Chain

For operations that depend on multiple steps, each of which can fail, the `with` construct avoids deeply nested case statements:

```elixir
@spec create_dd_case(map()) :: {:ok, Case.t()} | {:error, term()}
def create_dd_case(params) do
  with {:ok, validated} <- validate_params(params),
       {:ok, user} <- authorize_user(validated.user_id),
       {:ok, case_struct} <- build_case(validated, user),
       {:ok, saved} <- Repo.insert(case_struct),
       :ok <- notify_subscribers(saved) do
    {:ok, saved}
  else
    {:error, %Ecto.Changeset{} = changeset} ->
      {:error, {:validation, changeset}}

    {:error, :unauthorized} ->
      {:error, :access_denied}

    {:error, reason} ->
      Logger.error("Failed to create DD case: #{inspect(reason)}")
      {:error, {:internal, reason}}
  end
end
```

Each step in the `with` chain must return `{:ok, value}` for execution to continue. Any `{:error, reason}` short-circuits to the `else` block.

### Tagged `with` Steps

When multiple steps can return the same error shape, tag them:

```elixir
with {:validate, {:ok, params}} <- {:validate, validate(input)},
     {:fetch, {:ok, entity}} <- {:fetch, fetch_entity(params.id)},
     {:score, {:ok, score}} <- {:score, compute_score(entity)} do
  {:ok, %{entity: entity, score: score}}
else
  {:validate, {:error, reason}} -> {:error, {:validation_failed, reason}}
  {:fetch, {:error, :not_found}} -> {:error, :entity_not_found}
  {:score, {:error, reason}} -> {:error, {:scoring_failed, reason}}
end
```

## Why Bare Rescue Is Banned

The ZERO doctrine explicitly bans bare rescue:

```elixir
# BANNED - bare rescue swallows ALL errors
try do
  dangerous_operation()
rescue
  _ -> :error
end

# BANNED - catches everything including system errors
try do
  dangerous_operation()
rescue
  _e -> {:error, :unknown}
end
```

Why this matters:

1. **Lost information**: The actual error type and message are discarded
2. **Hidden bugs**: Programming errors (typos, bad arguments) are silently swallowed
3. **Debugging nightmare**: Production issues become impossible to diagnose
4. **System errors masked**: `SystemLimitError`, `TokenMissingError` get caught and ignored

The correct approach catches specific exceptions:

```elixir
# CORRECT - catches only expected exceptions
try do
  Jason.decode!(payload)
rescue
  e in [Jason.DecodeError] ->
    Logger.warning("JSON decode failed", error: Exception.message(e), payload_size: byte_size(payload))
    {:error, {:invalid_json, Exception.message(e)}}
end

# CORRECT - multiple specific exceptions
try do
  HTTPoison.get!(url)
rescue
  e in [HTTPoison.Error] ->
    {:error, {:http_error, e.reason}}

  e in [URI.Error] ->
    {:error, {:invalid_url, Exception.message(e)}}
end
```

## Error Types Hierarchy

Define explicit error types for your domain:

```elixir
defmodule Prismatic.DD.Error do
  @moduledoc """
  Structured error types for the DD domain.
  """

  @type t ::
    validation_error()
    | authorization_error()
    | not_found_error()
    | scoring_error()
    | storage_error()

  @type validation_error :: {:validation, field :: atom(), message :: String.t()}
  @type authorization_error :: {:unauthorized, user_id :: String.t(), action :: atom()}
  @type not_found_error :: {:not_found, entity_type :: atom(), id :: String.t()}
  @type scoring_error :: {:scoring_failed, reason :: term()}
  @type storage_error :: {:storage_error, operation :: atom(), reason :: term()}
end
```

Functions throughout the DD domain return `{:error, Prismatic.DD.Error.t()}`, making error handling consistent and typed.

## Error Context Enrichment

When propagating errors up the call stack, add context at each level:

```elixir
defmodule Prismatic.DD.CaseService do
  @spec analyze_case(String.t()) :: {:ok, Analysis.t()} | {:error, term()}
  def analyze_case(case_id) do
    with {:ok, dd_case} <- fetch_case(case_id),
         {:ok, entities} <- fetch_entities(dd_case),
         {:ok, analysis} <- run_analysis(entities) do
      {:ok, analysis}
    else
      {:error, reason} ->
        enriched = %{
          original_error: reason,
          case_id: case_id,
          step: determine_failed_step(reason),
          timestamp: DateTime.utc_now()
        }

        Logger.error("Case analysis failed", enriched)
        {:error, {:analysis_failed, enriched}}
    end
  end
end
```

## The `!` Convention

Elixir's convention: functions ending in `!` raise on error, functions without `!` return tuples:

```elixir
# Returns {:ok, value} or {:error, reason}
Repo.insert(changeset)

# Raises Ecto.InvalidChangesetError on failure
Repo.insert!(changeset)
```

Use `!` variants only when:
- You are in a context where failure should crash the process (let it crash philosophy)
- You have already validated inputs and failure is truly unexpected
- You are in a script or migration, not production request handling

## Pattern: Error Middleware

For APIs, centralize error formatting:

```elixir
defmodule PrismaticWeb.ErrorHandler do
  @moduledoc """
  Translates domain errors to HTTP responses.
  """

  @spec handle_error(Plug.Conn.t(), term()) :: Plug.Conn.t()
  def handle_error(conn, {:error, :not_found}) do
    conn |> put_status(404) |> json(%{error: %{code: "not_found", message: "Resource not found"}})
  end

  def handle_error(conn, {:error, :unauthorized}) do
    conn |> put_status(401) |> json(%{error: %{code: "unauthorized", message: "Authentication required"}})
  end

  def handle_error(conn, {:error, {:validation, changeset}}) do
    errors = format_changeset_errors(changeset)
    conn |> put_status(422) |> json(%{error: %{code: "validation_error", details: errors}})
  end

  def handle_error(conn, {:error, {:internal, _reason}}) do
    conn |> put_status(500) |> json(%{error: %{code: "internal_error", message: "An unexpected error occurred"}})
  end
end
```

## ZERO Doctrine Enforcement

The pre-commit hook scans for banned patterns:

| Pattern | Detection | Severity |
|---|---|---|
| `rescue _` or `rescue _ ->` | Grep in staged files | BLOCKING |
| `rescue _e ->` (unused variable) | Grep in staged files | BLOCKING |
| `String.to_atom/1` | Grep in staged files | BLOCKING |
| `:erlang.binary_to_term/1` without `:safe` | Grep in staged files | BLOCKING |
| `Process.sleep` in GenServer | AST analysis | ADVISORY |

The CI pipeline runs a deeper check via `mix validate-zero` that uses AST analysis to find bare rescue blocks even when formatted unconventionally.

## Testing Error Paths

Every error path should have test coverage:

```elixir
describe "fetch_entity/1" do
  test "returns {:error, :not_found} for missing entities" do
    assert {:error, :not_found} = DDService.fetch_entity("nonexistent")
  end

  test "returns {:error, :unauthorized} for restricted entities" do
    entity = insert(:entity, restricted: true)
    assert {:error, :unauthorized} = DDService.fetch_entity(entity.id)
  end
end
```

The TACH doctrine requires test files for all modules, and the ZERO doctrine requires that error paths specifically are tested, not just happy paths.

## Summary

| Approach | When to Use | Example |
|---|---|---|
| `{:ok, val}/{:error, reason}` | Any fallible operation | Database queries, validation |
| `with` chain | Multi-step operations | Service functions |
| Tagged `with` | Ambiguous error sources | Complex pipelines |
| Specific rescue | External library calls | JSON parsing, HTTP clients |
| `!` functions | Crash-on-failure contexts | Scripts, migrations |
| Error middleware | API boundaries | Controller error handling |

Treat errors as data, not exceptions. The ZERO doctrine ensures this discipline is maintained across the entire codebase through automated enforcement.
