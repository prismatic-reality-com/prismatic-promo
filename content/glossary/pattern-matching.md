+++
title = "Pattern Matching"
weight = 12
[extra]
category = "technology"
description = "Language feature matching data structures against patterns for destructuring and control flow"
related_terms = ["pipe-operator", "pure-function", "immutability", "behaviour", "ecto", "pattern-matching"]
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 803
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Pattern", "Matching", "Language", "glossary", "technology", "Prismatic Platform", "Elixir", "Ecto", "Multi"]
tags = ["glossary", "technology", "pattern-matching", "prismatic"]
quality_score = 77
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Pattern Matching - Prismatic Platform"
+++

## Definition

Pattern matching is a language feature that checks a value against a structural pattern and, if successful, destructures the value by binding its components to variables. In Elixir, pattern matching replaces most conditional logic with declarative multi-clause function definitions, case expressions, and the match operator (`=`). It is the primary control flow mechanism in the language, enabling concise, self-documenting code that handles different data shapes explicitly through separate function clauses rather than nested if/else chains.

Unlike equality checks or switch statements in imperative languages, pattern matching simultaneously performs three operations: it tests whether data conforms to an expected shape, it extracts components from the data by binding them to variables, and it selects the appropriate code path based on the match result. This unification of testing, extraction, and dispatch into a single syntactic construct makes Elixir code remarkably dense yet readable. A function with five clauses communicates five distinct cases and their handling in a format that is both machine-checkable and human-readable.

Pattern matching interacts deeply with Elixir's other core features. [Immutability](@/glossary/immutability.md) guarantees that matched data will not change during or after the match. The [pipe operator](@/glossary/pipe-operator.md) chains functions that use pattern matching internally. [Behaviours](@/glossary/behaviour.md) define callback signatures that are implemented through multi-clause pattern-matched functions. [Ecto](@/glossary/ecto.md) queries use pattern matching for result destructuring. Pattern matching is not merely a feature of Elixir -- it is the idiom through which all Elixir code is organized.

## The Match Operator

The `=` operator in Elixir is the match operator, not an assignment operator. It attempts to match the left-hand side pattern against the right-hand side value:

```elixir
# Simple binding (trivially matches any value)
x = 42

# Structure matching -- binds 'name' and 'role' from the map
%{name: name, role: role} = %{name: "Alice", role: :admin, id: 1}
# name = "Alice", role = :admin

# Tuple matching -- the standard Elixir result convention
{:ok, result} = {:ok, %{score: 850}}
# result = %{score: 850}

# Failure case -- MatchError raised when pattern doesn't match
# {:ok, result} = {:error, :not_found}
# ** (MatchError) no match of right hand side value: {:error, :not_found}

# Nested matching -- extracts deeply nested values
%{security: %{rating: %{grade: grade}}} = assessment
# grade bound to whatever value is at that path
```

## The Pin Operator

The pin operator (`^`) forces a variable to be treated as its current value rather than a new binding. This is essential for matching against existing values:

```elixir
expected_domain = "example.com"

# Without pin: 'domain' would be rebound to whatever value is in the map
%{domain: domain} = %{domain: "other.com"}
# domain = "other.com" (rebound)

# With pin: matches ONLY if domain equals "example.com"
%{domain: ^expected_domain} = %{domain: "example.com"}
# Succeeds -- value matches pinned variable

# %{domain: ^expected_domain} = %{domain: "other.com"}
# ** (MatchError) -- fails because "other.com" != "example.com"
```

## Multi-Clause Function Definitions

Pattern matching's most powerful application is multi-clause function definitions, where different clauses handle different input shapes:

```elixir
defmodule SecurityGrade do
  @spec assign(float()) :: atom()
  def assign(score) when score >= 800.0, do: :A
  def assign(score) when score >= 650.0, do: :B
  def assign(score) when score >= 500.0, do: :C
  def assign(score) when score >= 350.0, do: :D
  def assign(_score), do: :F
end

defmodule ResultHandler do
  # Each clause handles a different result shape
  def handle({:ok, %{data: data, meta: meta}}) do
    process_success(data, meta)
  end

  def handle({:ok, data}) when is_list(data) do
    process_batch(data)
  end

  def handle({:error, %{code: :not_found, resource: resource}}) do
    log_missing(resource)
    {:error, :not_found}
  end

  def handle({:error, %{code: :timeout}}) do
    {:retry, :exponential_backoff}
  end

  def handle({:error, reason}) do
    log_error(reason)
    {:error, reason}
  end
end
```

## Guards

Guards extend pattern matching with additional constraints that go beyond structural shape. Guards appear in `when` clauses and support a restricted set of expressions that are guaranteed to be side-effect-free:

```elixir
defmodule Validator do
  # Guards refine matches with type checks and comparisons
  def validate_score(score) when is_float(score) and score >= 300.0 and score <= 900.0 do
    {:ok, score}
  end

  def validate_score(score) when is_float(score) do
    {:error, :out_of_range}
  end

  def validate_score(_), do: {:error, :invalid_type}

  # Custom guard (defined with defguard for reuse)
  defguard is_valid_port(port) when is_integer(port) and port >= 1 and port <= 65535

  def validate_endpoint(host, port) when is_binary(host) and is_valid_port(port) do
    {:ok, {host, port}}
  end
end
```

| Guard Category | Examples | Use Case |
|---------------|----------|----------|
| **Type Checks** | `is_atom/1`, `is_binary/1`, `is_map/1`, `is_list/1` | Dispatch on type |
| **Comparisons** | `>`, `<`, `>=`, `<=`, `==`, `!=` | Range validation |
| **Boolean** | `and`, `or`, `not` | Combining conditions |
| **Arithmetic** | `+`, `-`, `*`, `/`, `rem/2`, `abs/1` | Numeric constraints |
| **Map/Tuple** | `map_size/1`, `tuple_size/1`, `elem/2` | Structure size checks |
| **String** | `byte_size/1`, `bit_size/1` | Binary constraints |
| **Custom** | `defguard` macros | Domain-specific guards |

## Pattern Matching in Case and With

Beyond function clauses, pattern matching drives `case` and `with` expressions:

```elixir
# Case expression -- pattern matching on a single value
defmodule AssetClassifier do
  def classify(asset) do
    case asset do
      %{type: :domain, tld: tld} when tld in [".com", ".org", ".net"] ->
        {:standard_domain, asset}

      %{type: :domain} ->
        {:exotic_domain, asset}

      %{type: :ip, version: 4, address: addr} ->
        {:ipv4, addr}

      %{type: :ip, version: 6, address: addr} ->
        {:ipv6, addr}

      %{type: :certificate, expired: true} ->
        {:expired_cert, asset}

      _ ->
        {:unknown, asset}
    end
  end
end

# With expression -- chaining pattern-matched operations (happy path)
defmodule ScanPipeline do
  def execute(domain) do
    with {:ok, assets} <- discover_assets(domain),
         {:ok, rated_assets} <- rate_assets(assets),
         {:ok, report} <- generate_report(rated_assets),
         {:ok, _} <- store_report(report) do
      {:ok, report}
    else
      {:error, :dns_timeout} -> {:error, "DNS resolution timed out for #{domain}"}
      {:error, :no_assets} -> {:error, "No assets discovered for #{domain}"}
      {:error, reason} -> {:error, "Scan failed: #{inspect(reason)}"}
    end
  end
end
```

## Context in Prismatic

Pattern matching is pervasive throughout the Prismatic Platform's 6,652 source files, serving as the primary mechanism for control flow, error handling, and data transformation across all 89 umbrella applications.

- **GenServer Callbacks**: Multi-clause `handle_call/3`, `handle_cast/2`, and `handle_info/2` definitions dispatch on message shape. Agent GenServers use pattern matching to route commands to appropriate handlers.
- **Result Convention**: The universal `{:ok, result}` / `{:error, reason}` convention relies on pattern matching for error handling. Every function boundary in the platform uses this pattern.
- **Storage Adapters**: Storage protocol implementations use pattern matching on adapter configuration and query parameters to dispatch to the correct backend (ETS, Ecto, Meilisearch, KuzuDB).
- **[AIAD](@/glossary/agent.md) Agent Dispatch**: Agent command routing uses pattern matching on agent specifications to direct commands to the correct handler module.
- **Quality Gate Logic**: The 13 quality domain checkers use multi-clause functions to classify violations by severity, type, and remediation strategy.
- **[Ecto](@/glossary/ecto.md) Changeset Handling**: Schema validation and changeset processing use pattern matching to handle valid and invalid states.
- **Phoenix Controllers**: Request routing and parameter extraction rely on pattern matching in controller actions and plug pipelines.
- **[Broadway](@/glossary/broadway.md) Message Processing**: Pipeline message handlers use pattern matching to dispatch on message type and content.

## Pattern Matching vs. Alternatives

| Approach | Pattern Matching (Elixir) | Switch/Case (Imperative) | If/Else Chains |
|----------|--------------------------|--------------------------|----------------|
| **Dispatch** | Multi-clause functions | Single function with switch | Single function with if/else |
| **Extraction** | Simultaneous with match | Manual after dispatch | Manual after condition |
| **Exhaustiveness** | Compiler warnings for unmatched | No compiler help | No compiler help |
| **Nested Data** | Deep destructuring in one expression | Multiple accessor calls | Multiple accessor calls |
| **Readability** | Declarative (what, not how) | Procedural | Procedural |
| **Extensibility** | Add a clause | Add a case branch | Add an else-if |

## Common Patterns

| Pattern | Example | Use Case |
|---------|---------|----------|
| **Head/Tail** | `[head \| tail] = list` | Recursive list processing |
| **Tagged Tuple** | `{:ok, value}` / `{:error, reason}` | Result type convention |
| **Struct Match** | `%User{role: :admin} = user` | Type-safe destructuring |
| **Map Subset** | `%{name: name} = big_map` | Extract specific fields |
| **Binary** | `<<header::16, payload::binary>> = packet` | Protocol parsing |
| **String Prefix** | `"https://" <> rest = url` | String pattern extraction |
| **Ignore** | `{:ok, _meta, data}` | Discard unneeded values |

## Related Terms

- [Pipe Operator](@/glossary/pipe-operator.md) - Composition operator complementing pattern-matched functions
- [Pure Function](@/glossary/pure-function.md) - Multi-clause pure functions enabled by pattern matching
- [Immutability](@/glossary/immutability.md) - Immutable data structures matched without defensive copying
- [Behaviour](@/glossary/behaviour.md) - OTP callback contracts implemented via pattern-matched clauses
- [Ecto](@/glossary/ecto.md) - Database library using pattern matching for query results and changesets
- [Typespec](@/glossary/typespec.md) - Type specifications documenting pattern-matched function signatures
- [Dialyzer](@/glossary/dialyzer.md) - Static analysis that verifies pattern match exhaustiveness
- [GenStage](@/glossary/genstage.md) - Pipeline stages dispatching on message patterns
- [Property-Based Testing](@/glossary/property-based-testing.md) - Testing that generates inputs for pattern-matched functions
- [Formal Verification](@/glossary/formal-verification.md) - Verification of pattern match completeness and correctness

## See Also

- [Technologies](@/technologies/_index.md) - Elixir language features and idioms
- [Architecture](@/architecture/_index.md) - Pattern matching in platform design patterns
- [Capabilities](@/capabilities/_index.md) - Platform capabilities leveraging declarative dispatch

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)