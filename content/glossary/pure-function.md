+++
title = "Pure Function"
weight = 28
[extra]
category = "architecture"
description = "Function with no side effects whose output depends only on its inputs, enabling referential transparency"
related_terms = ["immutability", "pattern-matching", "pipe-operator", "property-based-testing", "behaviour", "cqrs", "event-sourcing"]
tags = ["functional-programming", "testability", "referential-transparency", "determinism", "architecture"]
difficulty = "intermediate"
importance = "critical"
ecosystem = "elixir"
use_cases = ["business-logic", "data-transformation", "scoring-algorithms", "validation", "testing"]
prerequisites = ["immutability"]
reading_time_minutes = 12
version = "2.0.0"
last_updated = "2026-02-22"
author = "Tomas Korcak"
platform_relevance = "core"
beam_specific = false
otp_pattern = false
production_tested = true
prismatic_usage = "pervasive"
formal_property = "referential-transparency"
testing_benefit = "trivial"
reading_time = "6 min"
word_count = 1262
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Pure", "Function", "glossary", "architecture", "Prismatic Platform", "Side", "Move"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Pure Function - Prismatic Platform"
+++

## Definition

A pure function is a function that satisfies two invariants: it always produces the same output for the same inputs (determinism), and it produces no observable side effects (referential transparency). Pure functions do not read from or write to external state, perform I/O operations, modify global variables, mutate their arguments, or depend on any information other than their explicit parameters. The return value of a pure function is entirely determined by its arguments, making it equivalent to a mathematical function -- a mapping from domain to codomain.

Referential transparency, the formal property underlying purity, means that a pure function call can be replaced with its return value anywhere in a program without changing the program's behavior. This property enables equational reasoning about code, aggressive compiler optimizations, safe memoization, trivial parallelization, and fundamentally simpler testing. When a function is pure, testing it requires no setup, no teardown, no mocking of external services, and no concern about execution order.

In Elixir and functional programming more broadly, pure functions serve as the primary building blocks of computation. Complex systems are constructed by composing small pure functions through the [pipe operator](/glossary/pipe-operator/) and higher-order functions, with side effects (database writes, network calls, file I/O) confined to the outermost layers of the application through architectural patterns like ports and adapters. This separation creates systems where the vast majority of code is pure, testable, and predictable, with side effects managed at well-defined boundaries.

The concept of purity is not unique to functional programming -- it appears in mathematics, formal verification, and even hardware design -- but functional languages make it a first-class concern. In Elixir, [immutability](/glossary/immutability/) is enforced at the language level (all data is immutable by default), and the [pipe operator](/glossary/pipe-operator/) encourages composing pure transformations. While Elixir does not enforce purity at the type system level (unlike Haskell's IO monad), the community convention is strong: business logic should be pure, and side effects should be isolated at system boundaries.

## Formal Properties

A function `f` is pure if and only if both of the following conditions hold:

| Property | Formal Statement | Practical Meaning |
|----------|-----------------|-------------------|
| **Determinism** | For all inputs `x`, `f(x)` always returns the same value | No dependency on time, random state, global variables, or external systems |
| **No Side Effects** | Evaluating `f(x)` produces no observable changes to the world | No database writes, no file I/O, no network calls, no process messages, no state mutation |

Together these properties yield **referential transparency**: the expression `f(x)` can be replaced by its result value `v` in any context without changing program behavior. This is the foundation of equational reasoning in functional programming.

### Degrees of Purity

In practice, purity exists on a spectrum. Some functions are strictly pure, while others have controlled impurities:

| Level | Description | Example | Testability |
|-------|-------------|---------|-------------|
| **Strictly Pure** | No side effects, deterministic | `String.downcase/1` | Trivial |
| **Referentially Transparent** | May use memoization internally | Cached computation | Trivial |
| **Deterministic with Logging** | Same output, but emits telemetry | Function with Logger calls | Easy (ignore logs) |
| **Externally Pure** | Side effects contained within process | GenServer with internal state | Moderate |
| **Impure** | Reads/writes external state | Database queries, HTTP calls | Requires mocks/stubs |

## Pure vs. Impure Functions in Elixir

The distinction between pure and impure functions has direct architectural implications:

```elixir
# PURE: Output depends only on input, no side effects
defmodule SecurityRating do
  @moduledoc """
  Pure scoring algorithms for security rating calculation.
  All functions in this module are referentially transparent --
  the same inputs always produce the same outputs.
  """

  @spec calculate(map()) :: {:ok, float()} | {:error, String.t()}
  def calculate(%{vulnerabilities: vulns, patches: patches, config: config}) do
    base_score = 900.0
    vuln_penalty = Enum.reduce(vulns, 0.0, &(&2 + severity_weight(&1)))
    patch_bonus = length(patches) * 2.5
    config_factor = config_score(config)

    score = base_score - vuln_penalty + patch_bonus + config_factor
    clamped = max(300.0, min(900.0, score))
    {:ok, clamped}
  end

  def calculate(_invalid_input) do
    {:error, "Missing required fields: vulnerabilities, patches, config"}
  end

  @spec severity_weight(map()) :: float()
  defp severity_weight(%{severity: :critical}), do: 100.0
  defp severity_weight(%{severity: :high}), do: 50.0
  defp severity_weight(%{severity: :medium}), do: 20.0
  defp severity_weight(%{severity: :low}), do: 5.0
  defp severity_weight(_), do: 0.0

  @spec config_score(map()) :: float()
  defp config_score(%{mfa_enabled: true, encryption: true}), do: 50.0
  defp config_score(%{mfa_enabled: true}), do: 25.0
  defp config_score(_), do: 0.0
end

# IMPURE: Reads from database, writes logs -- side effects present
defmodule SecurityRatingService do
  @moduledoc """
  Impure service layer that orchestrates side effects around pure scoring logic.
  Database reads and writes happen here; scoring logic delegates to SecurityRating.
  """

  @spec assess(String.t()) :: {:ok, float()} | {:error, term()}
  def assess(domain) do
    # Side effect: database read
    with {:ok, asset_data} <- AssetRepo.fetch_by_domain(domain),
         # Pure core: all logic is in the pure function
         {:ok, score} <- SecurityRating.calculate(asset_data),
         # Side effect: database write
         {:ok, _} <- RatingRepo.insert(%{domain: domain, score: score}) do
      # Side effect: logging
      Logger.info("Security rating calculated", domain: domain, score: score)
      {:ok, score}
    end
  end
end
```

| Characteristic | Pure Function | Impure Function |
|---------------|--------------|-----------------|
| **Testability** | Test with inputs/outputs only | Requires mocks, stubs, test databases |
| **Parallelization** | Safe to run concurrently | May have race conditions |
| **Memoization** | Safe to cache results | Cache may become stale |
| **Reasoning** | Local reasoning sufficient | Must consider global state |
| **Composition** | Compose freely via pipe | Ordering and error handling critical |
| **Refactoring** | Move anywhere safely | Sensitive to context and timing |
| **Determinism** | Guaranteed | Dependent on external state |
| **Reproducibility** | Always reproducible | May vary between runs |

## Referential Transparency in Practice

Referential transparency enables several powerful programming techniques:

```elixir
# Because SecurityRating.calculate/1 is pure, these are ALL equivalent:
input = %{vulnerabilities: [%{severity: :high}], patches: [1, 2], config: %{mfa_enabled: true}}

# Direct call
result = SecurityRating.calculate(input)

# Cached result (memoization is safe)
cached = {:ok, 855.0}
# 'cached' can replace 'SecurityRating.calculate(input)' anywhere

# Parallel execution (safe -- no shared state to coordinate)
tasks = Enum.map(inputs, fn input ->
  Task.async(fn -> SecurityRating.calculate(input) end)
end)
results = Enum.map(tasks, &Task.await/1)

# Property-based testing (safe -- deterministic behavior)
property "score is always between 300 and 900" do
  check all input <- input_generator() do
    {:ok, score} = SecurityRating.calculate(input)
    assert score >= 300.0 and score <= 900.0
  end
end
```

### Memoization Safety

Pure functions can be safely memoized because the same inputs always produce the same outputs. This enables significant performance optimizations:

```elixir
defmodule PrismaticPerimeter.MemoizedRating do
  @moduledoc """
  Memoized wrapper around pure rating calculations.
  Safe because the underlying function is referentially transparent.
  """

  use Agent

  @spec start_link(keyword()) :: Agent.on_start()
  def start_link(_opts) do
    Agent.start_link(fn -> %{} end, name: __MODULE__)
  end

  @spec calculate(map()) :: {:ok, float()} | {:error, String.t()}
  def calculate(input) do
    cache_key = :erlang.phash2(input)

    case Agent.get(__MODULE__, &Map.get(&1, cache_key)) do
      nil ->
        result = SecurityRating.calculate(input)
        Agent.update(__MODULE__, &Map.put(&1, cache_key, result))
        result

      cached ->
        cached
    end
  end
end
```

## Context in Prismatic

The Prismatic Platform enforces functional purity as a core architectural principle, following the Elixir meta-rule: "if the same solution could be written identically in Node.js, it is WRONG." Business logic across all 115 umbrella applications is implemented as pure functions, with side effects pushed to system edges through the port/adapter pattern.

Key areas where purity is enforced:

- **Security Rating Calculations**: All scoring algorithms in the [Perimeter](/glossary/easm/) module are pure functions mapping asset data to numeric scores, enabling deterministic compliance assessments.
- **Quality Gate Checks**: The 13 quality domain validators are pure functions that accept code analysis results and return pass/fail verdicts with violation details.
- **Data Transformations**: ETL pipelines, OSINT data normalization, and entity resolution logic use pure transformation functions composed through [pipe operators](/glossary/pipe-operator/).
- **[NABLA](/glossary/nabla-infinity/) Epistemic Operations**: Belief graph calculations, [confidence scoring](/glossary/confidence-scoring/), and [Trinity Gate](/glossary/trinity-gate/) verification are pure functions operating on immutable evidence structures.
- **Agent Decision Logic**: The decision-making core of each [agent](/glossary/agent/) is a pure function, with I/O operations handled by the surrounding [GenServer](/glossary/genserver/) shell.
- **Compliance Assessment**: NIS2 and ZKB compliance checks are pure functions that map asset properties to compliance verdicts.
- **Credo Custom Checks**: The custom Credo checks in `prismatic_credo` are pure functions that analyze AST nodes and return issue lists.

## The Functional Core / Imperative Shell Pattern

Prismatic follows the established pattern of maintaining a pure functional core surrounded by a thin imperative shell that handles side effects:

```
+--------------------------------------------------+
|  Imperative Shell (thin)                         |
|  - Database reads/writes (Ecto)                  |
|  - HTTP requests (network I/O)                   |
|  - File system operations                        |
|  - Process messaging (GenServer callbacks)        |
|  - Telemetry emission                            |
|  - PubSub broadcasting                           |
|                                                  |
|  +--------------------------------------------+  |
|  |  Functional Core (thick)                   |  |
|  |  - Security scoring algorithms             |  |
|  |  - Quality gate validation logic           |  |
|  |  - Data transformation pipelines           |  |
|  |  - Compliance assessment rules             |  |
|  |  - Epistemic confidence calculations       |  |
|  |  - Entity resolution matching              |  |
|  |  - OSINT data normalization                |  |
|  |  - Agent decision functions                |  |
|  +--------------------------------------------+  |
+--------------------------------------------------+
```

This architecture means the majority of the codebase is pure and testable with simple input/output assertions, while the smaller shell layer handles integration with the outside world.

### Implementing the Pattern

```elixir
defmodule PrismaticPerimeter.Compliance do
  @moduledoc """
  Compliance assessment module demonstrating functional core / imperative shell.
  The public API (shell) handles I/O; internal functions (core) are pure.
  """

  # SHELL: Impure public API
  @spec assess(String.t(), [atom()]) :: {:ok, map()} | {:error, term()}
  def assess(domain, frameworks) do
    with {:ok, assets} <- PrismaticPerimeter.Assets.fetch(domain),
         {:ok, scan_data} <- PrismaticPerimeter.Scanner.latest(domain) do
      # CORE: Pure computation
      result =
        %{assets: assets, scans: scan_data, frameworks: frameworks}
        |> build_assessment_context()
        |> evaluate_frameworks()
        |> calculate_scores()
        |> determine_grades()
        |> format_report()

      # SHELL: Persist results
      {:ok, _} = PrismaticPerimeter.Reports.save(result)
      {:ok, result}
    end
  end

  # CORE: All pure functions below
  @spec build_assessment_context(map()) :: map()
  defp build_assessment_context(%{assets: assets, scans: scans, frameworks: frameworks}) do
    %{
      asset_count: length(assets),
      vulnerability_count: count_vulnerabilities(scans),
      patch_status: assess_patch_status(scans),
      config_status: assess_configuration(scans),
      frameworks: frameworks
    }
  end

  @spec evaluate_frameworks(map()) :: map()
  defp evaluate_frameworks(context) do
    evaluations = Enum.map(context.frameworks, fn framework ->
      {framework, evaluate_single_framework(context, framework)}
    end)
    Map.put(context, :evaluations, Map.new(evaluations))
  end

  defp evaluate_single_framework(context, :nis2) do
    # Pure NIS2 compliance logic
    %{
      incident_reporting: context.vulnerability_count < 10,
      risk_management: context.patch_status == :current,
      supply_chain: true,
      score: calculate_nis2_score(context)
    }
  end

  defp evaluate_single_framework(context, :zkb) do
    # Pure ZKB compliance logic
    %{
      security_measures: context.config_status == :hardened,
      incident_handling: context.vulnerability_count < 5,
      score: calculate_zkb_score(context)
    }
  end

  defp evaluate_single_framework(_context, _framework), do: %{score: 0}
end
```

## Composition of Pure Functions

Pure functions compose naturally because they have no hidden dependencies or ordering constraints:

```elixir
defmodule ComplianceAssessment do
  @moduledoc """
  Demonstrates pure function composition for compliance scoring.
  Each function is independently testable and composable.
  """

  # Each function is pure -- takes data in, returns data out
  @spec assess(map()) :: map()
  def assess(asset_data) do
    asset_data
    |> normalize_fields()
    |> calculate_vulnerability_score()
    |> calculate_configuration_score()
    |> calculate_patch_score()
    |> combine_scores()
    |> assign_grade()
    |> format_report()
  end

  @spec assign_grade(map()) :: map()
  defp assign_grade(%{score: score} = assessment) when score >= 800,
    do: Map.put(assessment, :grade, :A)
  defp assign_grade(%{score: score} = assessment) when score >= 650,
    do: Map.put(assessment, :grade, :B)
  defp assign_grade(%{score: score} = assessment) when score >= 500,
    do: Map.put(assessment, :grade, :C)
  defp assign_grade(%{score: score} = assessment) when score >= 350,
    do: Map.put(assessment, :grade, :D)
  defp assign_grade(assessment),
    do: Map.put(assessment, :grade, :F)
end
```

## Benefits for Testing

Pure functions dramatically simplify testing because they eliminate the need for complex test infrastructure:

| Testing Aspect | Pure Functions | Impure Functions |
|---------------|--------------|-----------------|
| **Setup** | None -- just provide inputs | Database seeding, mock configuration, state initialization |
| **Assertions** | Compare output to expected value | Verify state changes, mock call counts, side effect ordering |
| **Isolation** | Automatic -- no external dependencies | Manual -- requires mocking/stubbing external services |
| **Determinism** | Guaranteed -- same inputs = same outputs | Fragile -- depends on test database state, timing, network |
| **Speed** | Microseconds (no I/O) | Milliseconds to seconds (database, network) |
| **[Property-Based Testing](/glossary/property-based-testing/)** | Natural fit -- generate random inputs | Difficult -- side effects complicate generators |
| **Parallelism** | Tests run in parallel safely | Shared state causes test interference |
| **Debugging** | Reproduce with same inputs | Must reproduce entire environment state |

### Property-Based Testing of Pure Functions

Pure functions are ideal candidates for [property-based testing](/glossary/property-based-testing/), where properties hold for all possible inputs:

```elixir
defmodule SecurityRatingPropertyTest do
  use ExUnit.Case
  use ExUnitProperties

  property "rating score is always between 300 and 900" do
    check all vulns <- list_of(vulnerability_generator(), max_length: 20),
              patches <- list_of(integer(), max_length: 50),
              config <- config_generator() do
      input = %{vulnerabilities: vulns, patches: patches, config: config}
      {:ok, score} = SecurityRating.calculate(input)
      assert score >= 300.0
      assert score <= 900.0
    end
  end

  property "more vulnerabilities never increase the score" do
    check all base_vulns <- list_of(vulnerability_generator(), min_length: 1),
              extra_vuln <- vulnerability_generator(),
              patches <- list_of(integer()),
              config <- config_generator() do
      base_input = %{vulnerabilities: base_vulns, patches: patches, config: config}
      more_input = %{vulnerabilities: [extra_vuln | base_vulns], patches: patches, config: config}

      {:ok, base_score} = SecurityRating.calculate(base_input)
      {:ok, more_score} = SecurityRating.calculate(more_input)
      assert more_score <= base_score
    end
  end

  defp vulnerability_generator do
    gen all severity <- member_of([:critical, :high, :medium, :low]) do
      %{severity: severity}
    end
  end

  defp config_generator do
    gen all mfa <- boolean(),
            encryption <- boolean() do
      %{mfa_enabled: mfa, encryption: encryption}
    end
  end
end
```

## Common Purity Violations

Recognizing impure patterns helps maintain the functional core:

| Violation | Why It Breaks Purity | Fix |
|-----------|---------------------|-----|
| `DateTime.utc_now()` | Non-deterministic (returns different value each call) | Pass timestamp as parameter |
| `Enum.random/1` | Non-deterministic (depends on PRNG state) | Pass seed or selected value as parameter |
| `Repo.get/2` | Side effect (database I/O) | Move to shell, pass data as parameter |
| `Logger.info/1` | Side effect (writes to log) | Move to shell, or accept as controlled impurity |
| `Process.send/2` | Side effect (sends message) | Move to shell layer |
| `System.get_env/1` | Non-deterministic (depends on environment) | Pass config as parameter |
| `File.read/1` | Side effect (file I/O) | Move to shell, pass contents as parameter |

```elixir
# IMPURE: depends on current time
def expired?(%{expires_at: expires_at}) do
  DateTime.compare(expires_at, DateTime.utc_now()) == :lt
end

# PURE: time is a parameter
@spec expired?(map(), DateTime.t()) :: boolean()
def expired?(%{expires_at: expires_at}, now) do
  DateTime.compare(expires_at, now) == :lt
end
```

## Related Terms

- [Immutability](/glossary/immutability/) - Data property that enables and reinforces function purity
- [Pattern Matching](/glossary/pattern-matching/) - Declarative input destructuring in pure function clauses
- [Pipe Operator](/glossary/pipe-operator/) - Composition operator for chaining pure function calls
- [Property-Based Testing](/glossary/property-based-testing/) - Testing technique that exploits function purity and determinism
- [Idempotency](/glossary/idempotency/) - Related property where repeated application yields the same result
- [CQRS](/glossary/cqrs/) - Pattern that separates pure queries from side-effectful commands
- [Event Sourcing](/glossary/event-sourcing/) - Pattern using pure projection functions over immutable event logs
- [Data Pipeline](/glossary/data-pipeline/) - Architectural pattern composed of pure transformation stages
- [Behaviour](/glossary/behaviour/) - OTP contracts often implemented with pure callback functions
- [Formal Verification](/glossary/formal-verification/) - Proof techniques that benefit from referential transparency

## See Also

- [Architecture](/architecture/) - Functional core / imperative shell design principles
- [Technologies](/technologies/) - Elixir functional programming foundations
- [Capabilities](/capabilities/) - Platform capabilities built on pure function composition

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
