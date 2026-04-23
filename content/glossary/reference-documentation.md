+++
title = "Reference Documentation"
weight = 50
[extra]
category = "documentation"
description = "Authoritative, comprehensive technical documentation that serves as the single source of truth for APIs, modules, configurations, and behaviors in the Prismatic Platform, generated from code annotations and enforced by quality gates."
related_terms = ["documentation", "openapi-spec", "typespec", "credo", "developer-experience", "api", "modularity", "introspection", "developer-portal", "code-quality"]
tags = ["glossary", "documentation", "developer-experience", "api", "elixir", "quality", "reference"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "16 min"
difficulty = "intermediate"
quality_score = 95
date_created = "2026-02-22"
version = "2.0.0"
platform_relevance = "critical"
use_cases = ["API documentation", "module reference", "developer onboarding", "code navigation", "compliance auditing"]
word_count = 1172
date_modified = "2026-02-23"
keywords = ["Reference", "Documentation", "Authoritative", "APIs", "Prismatic", "Platform", "glossary", "Prismatic Platform", "Code", "Architecture"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Reference Documentation - Prismatic Platform"
+++

## Definition

Reference documentation is the authoritative, comprehensive technical specification of a software system's public interfaces, behaviors, configurations, and data structures. Unlike tutorials (which teach through guided examples), conceptual guides (which explain architectural decisions), or how-to guides (which solve specific problems), reference documentation provides the complete, unambiguous specification needed to use a system correctly.

Reference documentation answers the question "what does this function accept, return, and do?" -- not "why does this function exist?" or "how should I use this function in practice?" It is the dictionary of a codebase: consulted when you need to know the exact signature, the precise behavior in edge cases, the complete list of options, or the specific error conditions.

In the Prismatic Platform, reference documentation is not a separate artifact maintained alongside the code but is generated directly from the code itself. [Typespecs](/glossary/typespec/), `@moduledoc` and `@doc` annotations, [OpenAPI](/glossary/openapi-spec/) specifications, and runtime [introspection](/glossary/introspection/) produce documentation that is always synchronized with the actual implementation. The platform's [quality gates](/glossary/quality-gate/) enforce that every public function has a typespec and every public module has a moduledoc.

## The Documentation Quadrant

Reference documentation occupies a specific position in the documentation landscape. The Diataxis framework classifies documentation into four types:

| Type | Orientation | Purpose | Prismatic Platform Example |
|------|-------------|---------|---------------------------|
| **Tutorials** | Learning-oriented | Guide newcomers through first steps | Getting Started guide |
| **How-To Guides** | Task-oriented | Solve specific problems | "How to add a storage adapter" |
| **Explanation** | Understanding-oriented | Explain design decisions | Architecture decision records |
| **Reference** | Information-oriented | Provide complete specifications | Module docs, API specs, glossary |

Reference documentation is distinct because it optimizes for completeness and accuracy over readability. A tutorial can omit edge cases. A how-to guide can skip rarely-used options. Reference documentation cannot: it must document every parameter, every return value, every error condition, and every behavioral nuance.

## Reference Documentation in Elixir

Elixir has first-class support for reference documentation through its documentation system. Every module and function can carry structured documentation that is compiled into the beam file and accessible at runtime.

### Module Documentation

```elixir
defmodule PrismaticPerimeter.SecurityRating do
  @moduledoc """
  Computes security ratings for domains based on asset discovery
  and vulnerability assessment.

  ## Overview

  Security ratings provide a quantitative assessment of a domain's
  security posture, expressed as a letter grade (A-F) and numeric
  score (0-100). Ratings are computed by discovering assets (certificates,
  DNS records, HTTP headers, cloud resources) and scoring each asset
  against security best practices.

  ## Rating Categories

  | Category | Weight | Description |
  |----------|--------|-------------|
  | SSL/TLS | 40% | Certificate validity, protocol version, cipher strength |
  | DNS | 30% | DNSSEC, SPF, DKIM, DMARC configuration |
  | Headers | 30% | Security headers (CSP, HSTS, X-Frame-Options) |

  ## Grade Scale

  | Grade | Score Range | Description |
  |-------|-------------|-------------|
  | A | 90-100 | Excellent security posture |
  | B | 80-89 | Good security posture with minor gaps |
  | C | 70-79 | Adequate security with notable gaps |
  | D | 60-69 | Below average, significant improvements needed |
  | F | 0-59 | Poor security posture, critical issues present |

  ## Usage

      iex> PrismaticPerimeter.SecurityRating.calculate("example.com")
      {:ok, %{grade: :B, score: 82.5, categories: %{ssl: 90, dns: 75, headers: 80}}}

  ## Error Handling

  Returns `{:error, reason}` when:
  - Domain does not resolve (`:dns_resolution_failed`)
  - Asset discovery times out (`:discovery_timeout`)
  - No scoreable assets found (`:no_assets`)

  ## Configuration

  Rating weights and thresholds are configurable:

      config :prismatic_perimeter, PrismaticPerimeter.SecurityRating,
        category_weights: %{ssl: 0.4, dns: 0.3, headers: 0.3},
        discovery_timeout: :timer.seconds(30),
        max_assets_per_category: 1000
  """

  @typedoc """
  A security rating result containing the letter grade, numeric score,
  and per-category breakdown.
  """
  @type rating :: %{
    grade: grade(),
    score: float(),
    categories: %{atom() => float()},
    assessed_at: DateTime.t(),
    asset_count: non_neg_integer()
  }

  @typedoc "Letter grade from A (best) to F (worst)"
  @type grade :: :A | :B | :C | :D | :F

  @doc """
  Calculates the security rating for a domain.

  ## Parameters

  - `domain` - The fully qualified domain name to assess (e.g., "example.com")
  - `opts` - Optional keyword list:
    - `:timeout` - Discovery timeout in milliseconds (default: 30_000)
    - `:categories` - List of categories to score (default: all)
    - `:force_refresh` - Bypass cache and re-discover (default: false)

  ## Returns

  - `{:ok, rating()}` - Successful rating computation
  - `{:error, :dns_resolution_failed}` - Domain does not resolve
  - `{:error, :discovery_timeout}` - Asset discovery exceeded timeout
  - `{:error, :no_assets}` - No scoreable assets discovered

  ## Examples

      iex> SecurityRating.calculate("example.com")
      {:ok, %{grade: :B, score: 82.5, ...}}

      iex> SecurityRating.calculate("example.com", timeout: 60_000)
      {:ok, %{grade: :B, score: 82.5, ...}}

      iex> SecurityRating.calculate("nonexistent.invalid")
      {:error, :dns_resolution_failed}
  """
  @spec calculate(String.t(), keyword()) :: {:ok, rating()} | {:error, atom()}
  def calculate(domain, opts \\ []) do
    # Implementation
  end
end
```

### Function Documentation Standards

The Prismatic Platform enforces documentation standards for all public functions:

| Requirement | Enforcement | Tool |
|-------------|-------------|------|
| `@moduledoc` on every public module | BLOCKING | Credo `Credo.Check.Readability.ModuleDoc` |
| `@doc` on every public function | WARNING | Credo custom check |
| `@spec` on every public function | BLOCKING | [Dialyzer](/glossary/dialyzer/) + custom check |
| `@typedoc` on every public type | WARNING | Credo custom check |
| `## Examples` section in `@doc` | RECOMMENDED | Code review |
| `## Parameters` section for multi-arg functions | RECOMMENDED | Code review |
| `## Returns` section documenting all return shapes | RECOMMENDED | Code review |

## ExDoc: Generating Reference Documentation

Elixir's ExDoc tool generates HTML reference documentation from code annotations. The Prismatic Platform uses ExDoc to produce navigable, searchable documentation for all 141 umbrella applications:

```elixir
# In mix.exs of each umbrella application
defp docs do
  [
    main: "readme",
    extras: ["README.md", "CHANGELOG.md"],
    groups_for_modules: [
      "Public API": [
        PrismaticPerimeter,
        PrismaticPerimeter.SecurityRating,
        PrismaticPerimeter.AssetDiscovery
      ],
      "Internal": [
        PrismaticPerimeter.Internal.Scanner,
        PrismaticPerimeter.Internal.Scorer
      ]
    ],
    nest_modules_by_prefix: [
      PrismaticPerimeter.Internal
    ]
  ]
end
```

ExDoc extracts:
- Module documentation (`@moduledoc`)
- Function documentation (`@doc`)
- Type specifications (`@type`, `@typedoc`)
- Callback specifications (`@callback`)
- Code examples from documentation (and optionally runs them as doctests)

## OpenAPI Reference Documentation

The [Prismatic API](/glossary/prismatic-api/) generates [OpenAPI](/glossary/openapi-spec/) 3.0 reference documentation automatically by introspecting facade modules at boot time. This reference documentation describes every REST endpoint with:

- HTTP method and URL pattern
- Request parameters with types and validation rules
- Request body schema (for POST/PUT/PATCH)
- Response schemas for success and error cases
- Authentication requirements
- Rate limiting parameters

```elixir
defmodule PrismaticApi.Scanner do
  @moduledoc """
  Scans all Prismatic* facade modules at boot time and builds
  the API endpoint registry. Each public function with a @spec
  becomes a REST endpoint.

  The scanner extracts:
  - Function name and arity -> endpoint path
  - @spec type AST -> OpenAPI request/response schemas
  - @doc annotations -> endpoint descriptions
  - Module @moduledoc -> tag group descriptions
  """

  @spec scan_all_modules() :: {:ok, list(endpoint_definition())}
  def scan_all_modules do
    modules =
      :code.all_loaded()
      |> Enum.map(&elem(&1, 0))
      |> Enum.filter(&facade_module?/1)
      |> Enum.flat_map(&extract_endpoints/1)

    {:ok, modules}
  end

  defp facade_module?(module) do
    module
    |> Atom.to_string()
    |> String.starts_with?("Elixir.Prismatic")
  end

  defp extract_endpoints(module) do
    case Code.fetch_docs(module) do
      {:docs_v1, _, :elixir, _, module_doc, _, function_docs} ->
        function_docs
        |> Enum.filter(&public_function?/1)
        |> Enum.map(&build_endpoint(module, &1, module_doc))

      _ ->
        []
    end
  end
end
```

The generated OpenAPI spec is served at `/api/openapi` as JSON and rendered through SwaggerUI at `/api/swaggerui`, providing interactive reference documentation that developers can use to explore and test API endpoints directly from the browser.

## CLAUDE.md as Reference Documentation

Each of the 141 umbrella applications in the Prismatic Platform has a `CLAUDE.md` file that serves as both human-readable reference documentation and machine-readable context for AI-assisted development:

| Section | Purpose | Content |
|---------|---------|---------|
| **Overview** | What the application does | Module list, dependency graph |
| **Public API** | Functions available to other apps | Signatures, examples |
| **Configuration** | Application config options | Config keys, types, defaults |
| **Architecture** | Internal structure | Module relationships, data flow |
| **Testing** | Test approach and patterns | Test file locations, strategies |
| **Dependencies** | What this app depends on | Other umbrella apps, hex packages |

This dual-purpose approach ensures that reference documentation is useful for both human developers reading the codebase and AI agents working within it.

## Typespec as Executable Reference Documentation

[Typespecs](/glossary/typespec/) serve as reference documentation that is checked by [Dialyzer](/glossary/dialyzer/). Unlike comments or markdown documentation, typespecs are verified against the actual implementation:

```elixir
defmodule PrismaticStorage.Adapter do
  @moduledoc """
  Behaviour defining the storage adapter contract.
  Implementations must handle all callback specifications.
  """

  @type key :: String.t() | atom()
  @type value :: term()
  @type store_opts :: [ttl: pos_integer(), namespace: String.t()]
  @type fetch_opts :: [default: term()]

  @doc """
  Stores a value under the given key.

  ## Options

  - `:ttl` - Time-to-live in milliseconds. After this duration,
    the entry may be evicted. Not all adapters support TTL.
  - `:namespace` - Logical namespace for key isolation.
    Keys in different namespaces do not collide.
  """
  @callback store(key(), value(), store_opts()) ::
    {:ok, value()} | {:error, :write_failed | :capacity_exceeded}

  @doc """
  Fetches the value stored under the given key.

  Returns `{:error, :not_found}` if the key does not exist or has expired.
  """
  @callback fetch(key(), fetch_opts()) ::
    {:ok, value()} | {:error, :not_found | :read_failed}

  @doc """
  Deletes the entry stored under the given key.

  Returns `:ok` regardless of whether the key existed.
  Idempotent by design.
  """
  @callback delete(key()) :: :ok | {:error, :delete_failed}

  @doc """
  Lists all keys in the given namespace.

  Returns an empty list if the namespace does not exist or contains no keys.
  """
  @callback list_keys(String.t()) :: {:ok, list(key())} | {:error, :list_failed}
end
```

This typespec documentation is simultaneously:
1. Human-readable specification of the adapter contract
2. Machine-checkable type constraints verified by Dialyzer
3. Self-documenting code that eliminates the need for separate documentation

## Documentation Quality Enforcement

The platform enforces documentation quality through automated checks:

```elixir
defmodule PrismaticCredo.Check.Documentation.ModuleDocCompleteness do
  @moduledoc """
  Custom Credo check that verifies module documentation meets
  platform quality standards.

  Checks for:
  - @moduledoc presence and minimum length
  - ## sections covering Overview, Usage, and Examples
  - @doc on all public functions
  - @spec on all public functions
  """

  use Credo.Check,
    base_priority: :high,
    category: :readability

  @min_moduledoc_length 100

  @impl Credo.Check
  def run(%SourceFile{} = source_file, params) do
    issue_meta = IssueMeta.for(source_file, params)

    source_file
    |> Credo.Code.prewalk(&analyze_module/2)
    |> Enum.map(&to_issue(&1, issue_meta))
  end

  defp analyze_module({:defmodule, meta, _} = ast, issues) do
    moduledoc = extract_moduledoc(ast)

    issues =
      cond do
        is_nil(moduledoc) ->
          [{meta[:line], "Missing @moduledoc"} | issues]

        String.length(moduledoc) < @min_moduledoc_length ->
          [{meta[:line], "Module doc too short (#{String.length(moduledoc)} chars, minimum #{@min_moduledoc_length})"} | issues]

        true ->
          issues
      end

    {ast, issues}
  end

  defp analyze_module(ast, issues), do: {ast, issues}
end
```

## Documentation Versioning and Staleness

Reference documentation that is out of sync with the code is worse than no documentation at all because it misleads readers into making incorrect assumptions. The Prismatic Platform prevents staleness through several mechanisms:

| Mechanism | How It Prevents Staleness |
|-----------|--------------------------|
| **Code-generated docs** | Documentation is extracted from code, not maintained separately |
| **Doctests** | Code examples in `@doc` are executed during `mix test` |
| **Dialyzer** | `@spec` annotations are verified against implementation |
| **CI/CD enforcement** | Missing docs block the pipeline |
| **ExDoc versioning** | Each release generates versioned documentation |

## Documentation Architecture

The Prismatic Platform's documentation architecture has three layers:

### Layer 1: In-Code Reference (Always Current)

- `@moduledoc`, `@doc`, `@spec`, `@typedoc` annotations
- CLAUDE.md files in each application
- Inline comments explaining "why" (not "what")

### Layer 2: Generated Reference (Built from Code)

- ExDoc HTML output
- OpenAPI/Swagger specifications
- [Git Trees](/glossary/git-trees/) codebase indexes

### Layer 3: Curated Reference (Human-Maintained)

- This glossary
- Architecture decision records
- [AIAD](/glossary/aiad/) agent and command specifications
- Session context documents

Each layer serves different needs: Layer 1 is for developers reading source code, Layer 2 is for developers using APIs, and Layer 3 is for understanding the platform at a conceptual level.

## The Documentation-First Development Pattern

In the Prismatic Platform, reference documentation is written before implementation for public APIs. This "documentation-first" approach ensures that the API is designed from the consumer's perspective:

1. Write the `@moduledoc` describing what the module does and why
2. Write `@doc` and `@spec` for each public function
3. Write doctests demonstrating expected usage
4. Implement the functions to satisfy the documentation
5. Run `mix test` to verify doctests pass
6. Run `mix dialyzer` to verify specs are correct

This approach catches design problems early: if the documentation is awkward to write, the API is awkward to use. If the examples are convoluted, the interface needs simplification.

## Glossary as Reference Documentation

This glossary is itself a form of reference documentation. Each entry defines a term precisely, explains its role in the platform, provides code examples, and links to related concepts. The glossary serves as the conceptual reference layer that connects implementation-level documentation (typespecs, moduledocs) to architectural-level understanding.

The glossary's cross-referencing system (using `@/glossary/<name>.md` links) creates a navigable knowledge graph where each concept connects to its prerequisites, alternatives, and related patterns. This structure enables both sequential reading (following a topic through related terms) and random access (looking up a specific term).

## Related Terms

- [Documentation](/glossary/documentation/) -- Broader category encompassing all documentation types
- [OpenAPI Spec](/glossary/openapi-spec/) -- REST API reference documentation standard
- [Typespec](/glossary/typespec/) -- Elixir type annotations serving as executable reference
- [Credo](/glossary/credo/) -- Static analysis enforcing documentation standards
- [Developer Experience](/glossary/developer-experience/) -- Quality of developer interaction with documentation
- [API](/glossary/api/) -- Interfaces described by reference documentation
- [Modularity](/glossary/modularity/) -- Architecture enabling focused, modular documentation
- [Introspection](/glossary/introspection/) -- Runtime capability enabling auto-generated documentation
- [Developer Portal](/glossary/developer-portal/) -- Platform hub hosting reference documentation
- [Code Quality](/glossary/code-quality/) -- Measurable outcome of well-documented code

## See Also

- [Architecture](/architecture/) -- Platform architecture documentation
- [Capabilities](/capabilities/) -- Platform documentation capabilities
- Glossary -- Complete glossary index

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
