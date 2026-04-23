+++
title = "Pipe Operator"
weight = 13
[extra]
category = "technology"
description = "Elixir operator (|>) passing the result of one expression as the first argument to the next function call"
related_terms = ["pure-function", "pattern-matching", "immutability", "data-pipeline", "ecto", "broadway", "genstage", "plug"]
tags = ["elixir", "functional-programming", "composition", "syntax", "code-style"]
difficulty = "beginner"
importance = "critical"
ecosystem = "elixir"
use_cases = ["data-transformation", "query-building", "request-processing", "pipeline-composition"]
prerequisites = ["pure-function", "immutability"]
reading_time_minutes = 12
version = "2.0.0"
last_updated = "2026-02-22"
author = "Tomas Korcak"
platform_relevance = "core"
beam_specific = true
otp_pattern = false
production_tested = true
prismatic_usage = "pervasive"
elixir_version = "1.0+"
operator_symbol = "|>"
reading_time = "6 min"
word_count = 1268
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Pipe", "Operator", "Elixir", "glossary", "technology", "Prismatic Platform", "Data", "Ecto", "Stable"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Pipe Operator - Prismatic Platform"
+++

## Definition

The pipe operator (`|>`) is an Elixir syntactic feature that passes the result of the expression on its left as the first argument to the function on its right. It transforms deeply nested function calls into readable, top-to-bottom data transformation pipelines. Rather than writing `output(transform(validate(parse(input))))` -- which must be read inside-out to understand data flow -- the pipe operator lets developers write `input |> parse() |> validate() |> transform() |> output()`, where data flow reads naturally from top to bottom, left to right.

The pipe operator embodies the functional programming principle of transformation over mutation. Instead of modifying data in place through sequential imperative statements, piped code expresses computation as a series of pure transformations applied to [immutable](@/glossary/immutability.md) data. Each function in a pipe chain receives data, produces new data, and passes it forward. There are no side channels, no hidden state modifications, and no implicit dependencies between pipeline stages. This makes pipe chains inherently transparent: the data entering each stage and the data leaving it are both visible in the code structure.

Beyond readability, the pipe operator has deep architectural implications. It encourages developers to design functions with a consistent "data-first" argument convention (the primary data structure is always the first argument), to keep functions small and focused on a single transformation, and to compose complex behavior from simple building blocks. In Elixir codebases, the pipe operator is not merely a convenience -- it is the primary code organization pattern, influencing how modules are designed, how APIs are structured, and how developers think about data flow through the system.

The operator was inspired by similar constructs in other functional languages, notably F#'s pipe-forward operator and Unix shell pipes. Its inclusion in Elixir from version 1.0 onward has had a profound impact on the language's ecosystem, establishing the data-first convention that pervades the standard library and virtually all third-party packages.

## Syntax and Mechanics

The pipe operator has simple semantics: `x |> f(y, z)` is rewritten by the compiler to `f(x, y, z)`. The left-hand expression becomes the first argument to the right-hand function:

```elixir
# These are equivalent:
String.trim(String.downcase(String.replace(input, "\n", " ")))

input
|> String.replace("\n", " ")
|> String.downcase()
|> String.trim()

# Multi-stage pipeline with named steps
defmodule DomainNormalizer do
  @moduledoc """
  Normalizes domain names through a series of pure transformation steps.
  Each step in the pipeline handles one normalization concern.
  """

  @spec normalize(String.t()) :: {:ok, String.t()} | {:error, String.t()}
  def normalize(domain) do
    domain
    |> String.trim()
    |> String.downcase()
    |> strip_protocol()
    |> strip_trailing_dot()
    |> strip_port()
    |> validate_format()
  end

  defp strip_protocol("http://" <> rest), do: rest
  defp strip_protocol("https://" <> rest), do: rest
  defp strip_protocol(domain), do: domain

  defp strip_trailing_dot(domain), do: String.trim_trailing(domain, ".")

  defp strip_port(domain) do
    case String.split(domain, ":") do
      [host, _port] -> host
      [host] -> host
    end
  end

  defp validate_format(domain) do
    if String.match?(domain, ~r/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/),
      do: {:ok, domain},
      else: {:error, "Invalid domain format: #{domain}"}
  end
end
```

### Compiler Transformation

The pipe operator is a compile-time transformation, not a runtime operation. The Elixir compiler rewrites pipe chains into nested function calls before code generation, meaning there is zero runtime overhead from using pipes. The compiled BEAM bytecode for piped and non-piped versions is identical:

```elixir
# These produce identical BEAM bytecode:

# Version 1: Pipe chain
result = data |> step_a() |> step_b() |> step_c()

# Version 2: Nested calls
result = step_c(step_b(step_a(data)))

# Version 3: Intermediate variables
temp1 = step_a(data)
temp2 = step_b(temp1)
result = step_c(temp2)
```

## Pipeline Design Patterns

### Data Transformation Pipeline

The most common pattern chains [pure transformation functions](@/glossary/pure-function.md):

```elixir
defmodule SecurityAssessment do
  @moduledoc """
  Composes security assessment from individual scoring functions.
  Each function in the pipeline is pure and independently testable.
  """

  @spec assess(map()) :: {:ok, map()} | {:error, term()}
  def assess(raw_scan_data) do
    raw_scan_data
    |> parse_scan_results()
    |> classify_vulnerabilities()
    |> calculate_risk_scores()
    |> apply_compensating_controls()
    |> aggregate_by_severity()
    |> generate_rating()
  end
end
```

### Pipeline with Error Handling

Pipes combine with `with` expressions for error-aware pipelines. The `with` macro handles the error branching while pipes handle the happy-path transformations:

```elixir
defmodule AssetDiscovery do
  @moduledoc """
  Discovers and enriches attack surface assets for a domain.
  Uses `with` for fallible operations and pipes for transformations.
  """

  @spec discover(String.t()) :: {:ok, [map()]} | {:error, term()}
  def discover(domain) do
    with {:ok, dns_records} <- resolve_dns(domain),
         {:ok, certificates} <- fetch_certificates(domain),
         {:ok, subdomains} <- enumerate_subdomains(domain) do
      assets =
        %{dns: dns_records, certs: certificates, subdomains: subdomains}
        |> merge_asset_data()
        |> deduplicate()
        |> enrich_metadata()
        |> sort_by_risk()

      {:ok, assets}
    end
  end
end
```

### Enum/Stream Pipeline

Pipes integrate naturally with Elixir's collection processing. The Stream module provides lazy evaluation, making pipes suitable for processing large datasets without loading everything into memory:

```elixir
defmodule QualityAnalyzer do
  @moduledoc """
  Analyzes code quality violations using lazy stream pipelines.
  Stream operations defer execution until the final Enum call.
  """

  @spec analyze_violations(String.t()) :: map()
  def analyze_violations(codebase_path) do
    codebase_path
    |> list_source_files()
    |> Stream.map(&parse_file/1)
    |> Stream.flat_map(&extract_violations/1)
    |> Stream.filter(&above_severity_threshold?/1)
    |> Enum.group_by(& &1.category)
    |> Enum.map(fn {category, violations} ->
      {category, %{count: length(violations), severity: max_severity(violations)}}
    end)
    |> Map.new()
  end
end
```

### Ecto Query Pipeline

[Ecto](@/glossary/ecto.md) query building is one of the most powerful applications of the pipe operator. Queries are built incrementally, with each pipe adding a constraint:

```elixir
defmodule PrismaticPerimeter.AssetQuery do
  @moduledoc """
  Composable query builder for attack surface assets.
  Each function adds one constraint to the query.
  """

  import Ecto.Query

  @spec build(map()) :: Ecto.Query.t()
  def build(filters) do
    Asset
    |> maybe_filter_domain(filters[:domain])
    |> maybe_filter_type(filters[:type])
    |> maybe_filter_score(filters[:min_score], filters[:max_score])
    |> maybe_filter_grade(filters[:grade])
    |> order_by([a], desc: a.risk_score)
    |> limit(^Map.get(filters, :limit, 100))
  end

  defp maybe_filter_domain(query, nil), do: query
  defp maybe_filter_domain(query, domain) do
    where(query, [a], a.domain == ^domain)
  end

  defp maybe_filter_type(query, nil), do: query
  defp maybe_filter_type(query, type) do
    where(query, [a], a.type == ^type)
  end

  defp maybe_filter_score(query, nil, nil), do: query
  defp maybe_filter_score(query, min, max) do
    query
    |> then(fn q -> if min, do: where(q, [a], a.risk_score >= ^min), else: q end)
    |> then(fn q -> if max, do: where(q, [a], a.risk_score <= ^max), else: q end)
  end

  defp maybe_filter_grade(query, nil), do: query
  defp maybe_filter_grade(query, grade) do
    where(query, [a], a.grade == ^grade)
  end
end
```

### Plug Pipeline

[Phoenix](@/glossary/phoenix.md) request processing uses pipes through the [Plug](@/glossary/plug.md) architecture, where each plug transforms the connection struct:

```elixir
defmodule PrismaticWeb.Router do
  use PrismaticWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
    plug PrismaticWeb.Plugs.APIAuth
    plug PrismaticWeb.Plugs.RateLimiter
    plug PrismaticWeb.Plugs.RequestLogger
  end

  # Each plug in the pipeline transforms conn:
  # conn |> accepts(["json"]) |> APIAuth.call() |> RateLimiter.call() |> RequestLogger.call()
end
```

## The Data-First Convention

The pipe operator works because Elixir follows a consistent convention: the primary data structure is always the first argument to a function. This convention pervades the standard library and the broader ecosystem:

| Module | Convention | Example |
|--------|-----------|---------|
| **String** | String is first arg | `String.downcase(str)` |
| **Enum** | Enumerable is first arg | `Enum.map(list, fun)` |
| **Map** | Map is first arg | `Map.put(map, key, val)` |
| **Ecto.Changeset** | Changeset is first arg | `Changeset.validate_required(cs, fields)` |
| **Ecto.Query** | Query is first arg | `Query.where(query, expr)` |
| **Plug.Conn** | Conn is first arg | `Conn.put_resp_header(conn, k, v)` |
| **Phoenix.Socket** | Socket is first arg | `Socket.assign(socket, key, val)` |
| **Jason** | Data is first arg | `Jason.encode!(data)` |
| **NimbleCSV** | Data is first arg | `NimbleCSV.RFC4180.parse_string(csv)` |

This consistency means that virtually any function in the Elixir ecosystem can participate in a pipe chain without wrapper functions or argument reordering. Libraries that violate this convention are considered poorly designed.

## Context in Prismatic

The pipe operator is the dominant code style across the Prismatic Platform's source files. It appears in virtually every module and serves as the primary means of expressing data flow:

- **Quality Gate Pipelines**: Validation chains: `code |> compile_check() |> credo_check() |> dialyzer_check() |> typespec_check()`. Each check is a [pure function](@/glossary/pure-function.md) that produces a report without side effects.
- **Storage Adapter Chains**: Data normalization before persistence: `raw_data |> validate() |> normalize() |> encode() |> store()`.
- **OSINT Processing**: Intelligence data flows through transformation pipelines: `raw_intel |> parse() |> deduplicate() |> correlate() |> score() |> classify()`.
- **Security Rating Calculations**: The [Perimeter](@/glossary/easm.md) module computes ratings through piped scoring functions: `asset_data |> vulnerability_score() |> config_score() |> patch_score() |> combine() |> grade()`.
- **[Ecto](@/glossary/ecto.md) Query Building**: Database queries are built through pipe chains: `Asset |> where(type: :domain) |> order_by(:score) |> limit(100) |> Repo.all()`.
- **Phoenix Request Handling**: HTTP request processing flows through [plug](@/glossary/plug.md) pipelines composed with pipes.
- **[Broadway](@/glossary/broadway.md) Message Processing**: Data pipeline stages use pipes for message transformation within each processing stage.
- **Mix Task Composition**: Custom [Mix](@/glossary/mix.md) tasks compose operations through pipe chains for quality enforcement workflows.

## Pipe Operator vs. Alternatives

| Approach | Pipe Operator (Elixir) | Method Chaining (OOP) | Nested Calls (Functional) | Imperative Sequence |
|----------|----------------------|----------------------|--------------------------|-------------------|
| **Syntax** | `x \|> f() \|> g()` | `x.f().g()` | `g(f(x))` | `a = f(x); b = g(a)` |
| **Data Flow** | Top to bottom | Left to right | Inside out | Top to bottom |
| **Coupling** | Functions are independent | Methods tied to object | Functions are independent | Variables couple steps |
| **Adding Steps** | Insert a line | Chain another method | Wrap another call | Add variable + call |
| **Removing Steps** | Delete a line | Remove from chain | Unwrap a call | Delete variable + call |
| **Reusability** | Any function with matching first arg | Only methods on the type | Any matching function | Any function |
| **Debugging** | Insert `IO.inspect()` or `tap/2` | Insert logging method | Introduce temp variable | Insert print statement |
| **Type Safety** | Via `@spec` annotations | Via type system | Via type system | Via type system |

## Advanced Pipe Techniques

### Using `then/2` for Non-Standard Arguments

When a function does not follow the data-first convention, `then/2` provides an escape hatch:

```elixir
# When the data is not the first argument
"hello world"
|> String.split(" ")
|> then(fn words -> Enum.join(words, "-") end)
|> String.upcase()
# => "HELLO-WORLD"
```

### Using `tap/2` for Side Effects

`tap/2` executes a function for its side effects and returns the original value, keeping the pipeline flowing:

```elixir
defmodule PrismaticPerimeter.Discovery do
  @spec execute(String.t()) :: {:ok, map()}
  def execute(domain) do
    domain
    |> normalize_domain()
    |> tap(&Logger.info("Starting discovery for #{&1}"))
    |> discover_assets()
    |> tap(fn assets -> Logger.info("Found #{length(assets)} assets") end)
    |> enrich_metadata()
    |> calculate_ratings()
    |> tap(&emit_telemetry/1)
    |> format_results()
  end
end
```

### Pipeline Debugging with IO.inspect

`IO.inspect/2` is pipe-friendly by design -- it returns the value it receives, making it perfect for debugging pipe chains:

```elixir
data
|> step_a()
|> IO.inspect(label: "after step_a")
|> step_b()
|> IO.inspect(label: "after step_b")
|> step_c()
```

## Anti-Patterns and Best Practices

| Anti-Pattern | Problem | Better Approach |
|-------------|---------|----------------|
| **Single-function pipe** | `x \|> f()` adds noise | Just write `f(x)` |
| **Side effects in pipe** | `data \|> IO.inspect() \|> process()` hides side effects | Use `tap/2` for debugging: `data \|> tap(&IO.inspect/1) \|> process()` |
| **Pipe to anonymous fn** | `x \|> (fn y -> y + 1 end).()` is hard to read | Extract to named function |
| **Inconsistent first arg** | Function where data is not first arg breaks pipes | Wrap with `then/2`: `x \|> then(&f(&1, opts))` |
| **Over-long pipelines** | 15+ stages become hard to follow | Split into named sub-pipelines |
| **Pattern match in pipe** | Cannot pattern match pipe results directly | Use `then/2` or `tap/2` for intermediate checks |
| **Pipe starting with literal** | `"hello" \|> String.upcase()` is less clear | Reserve pipes for multi-step transformations |
| **Mixed abstraction levels** | Mixing low-level and high-level operations | Group by abstraction level |

## Credo Enforcement

The Prismatic Platform's [Credo](@/glossary/clean-run.md) configuration enforces consistent pipe operator usage:

```elixir
# Credo check: Prefer pipe chains over nested function calls
# When more than one function call is nested, Credo suggests using pipes

# Triggers Credo warning:
result = Enum.map(Enum.filter(list, &active?/1), &transform/1)

# Credo-compliant:
result =
  list
  |> Enum.filter(&active?/1)
  |> Enum.map(&transform/1)

# Credo also warns about single-pipe usage:
# Triggers warning:
result = data |> process()

# Credo-compliant:
result = process(data)
```

## Relationship to Functional Composition

The pipe operator is Elixir's approach to function composition -- combining simple functions into complex behavior. While some functional languages provide a dedicated composition operator (e.g., Haskell's `.`), Elixir's pipe operator achieves the same goal with the added benefit of explicit data flow visibility:

```elixir
# Function composition through pipes
defmodule CompliancePipeline do
  @moduledoc """
  Composes a full compliance assessment from individual check functions.
  Each stage is a small, testable, pure function.
  The pipeline composes them into complex behavior.
  """

  @spec assess(String.t()) :: {:ok, map()} | {:error, term()}
  def assess(domain) do
    domain
    |> discover_assets()           # Asset discovery
    |> scan_vulnerabilities()       # Vulnerability scanning
    |> check_configurations()       # Configuration audit
    |> evaluate_nis2_compliance()   # NIS2 directive checks
    |> evaluate_zkb_compliance()    # ZKB 264/2025 checks
    |> calculate_composite_score()  # Weighted scoring
    |> assign_grade()               # A-F grading
    |> format_report()              # Report generation
  end
end
```

## Pipe Operator in Other Languages

The success of Elixir's pipe operator has influenced other language ecosystems:

| Language | Operator | Status | Notes |
|----------|----------|--------|-------|
| **Elixir** | `\|>` | Stable (since 1.0) | Data-first convention throughout ecosystem |
| **F#** | `\|>` | Stable | Original inspiration for Elixir's operator |
| **OCaml** | `\|>` | Stable (since 4.01) | Added after F# demonstrated its value |
| **JavaScript** | `\|>` | TC39 Stage 2 proposal | Debated between Hack-style and F#-style |
| **R** | `\|>` | Stable (since 4.1) | Added as native alternative to magrittr's `%>%` |
| **Gleam** | `\|>` | Stable | BEAM language following Elixir's convention |
| **Rust** | N/A | Not planned | Method chaining preferred; macros available |
| **Python** | N/A | Not planned | Method chaining and comprehensions preferred |

## Related Terms

- [Pure Function](@/glossary/pure-function.md) - Functions composed through pipe chains must be pure for predictable behavior
- [Pattern Matching](@/glossary/pattern-matching.md) - Complementary technique for handling pipeline outputs
- [Immutability](@/glossary/immutability.md) - Pipe chains transform immutable data without mutation
- [Data Pipeline](@/glossary/data-pipeline.md) - Architectural pattern embodied by pipe operator usage
- [Ecto](@/glossary/ecto.md) - Database library with pipe-friendly query building API
- [Broadway](@/glossary/broadway.md) - Data processing pipeline using pipe-style stage composition
- [GenStage](@/glossary/genstage.md) - Producer-consumer pipeline stages composed through pipes
- [Stream Processing](@/glossary/stream-processing.md) - Lazy evaluation pipelines using pipe operator with Stream module
- [Plug](@/glossary/plug.md) - HTTP middleware composed through pipe-style function chains
- [ETL](@/glossary/etl.md) - Extract-Transform-Load patterns implemented as pipe chains

## See Also

- [Technologies](@/technologies/_index.md) - Elixir language features and idioms
- [Architecture](@/architecture/_index.md) - Pipeline-oriented design patterns
- [Capabilities](@/capabilities/_index.md) - Platform capabilities built through function composition

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
