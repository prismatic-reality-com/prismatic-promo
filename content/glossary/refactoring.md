+++
title = "Refactoring"
weight = 50
[extra]
category = "engineering"
description = "The disciplined practice of restructuring existing code without changing its external behavior, improving internal quality, readability, and maintainability -- a core engineering discipline enforced by the Prismatic Platform's quality gates and NO MERCY doctrine."
related_terms = ["technical-debt", "code-quality", "static-analysis", "credo", "dialyzer", "testing", "quality-gate", "clean-run", "continuous-integration", "code-reviews"]
tags = ["glossary", "engineering", "code-quality", "refactoring", "elixir", "quality", "maintainability"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "17 min"
difficulty = "intermediate"
quality_score = 95
date_created = "2026-02-22"
version = "2.0.0"
platform_relevance = "critical"
use_cases = ["code improvement", "technical debt reduction", "architecture evolution", "performance optimization", "test improvement"]
word_count = 1235
date_modified = "2026-02-23"
keywords = ["Refactoring", "Prismatic", "Platforms", "MERCY", "glossary", "engineering", "Prismatic Platform", "Credo", "Refactor", "Check"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Refactoring - Prismatic Platform"
+++

## Definition

Refactoring is the disciplined practice of restructuring existing code without changing its external behavior. The term was formalized by Martin Fowler in his 1999 book "Refactoring: Improving the Design of Existing Code," but the practice is as old as programming itself. The key constraint is behavioral preservation: the system must do exactly the same thing after refactoring as it did before. What changes is the internal structure -- readability, modularity, testability, performance characteristics, or adherence to design principles.

Refactoring is not bug fixing (which changes behavior to correct errors), not feature development (which adds new behavior), and not optimization (which may change timing characteristics). Refactoring changes how the code is organized, not what it does. This distinction is critical because it means refactoring can be verified mechanically: if the test suite passes before and after the change, and the test suite has adequate coverage, the refactoring is correct.

In the Prismatic Platform, refactoring is not an occasional cleanup activity but a continuous engineering discipline. The platform's [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine treats code that "works but is poorly structured" as a quality violation equivalent to code that does not work at all. The [quality gates](@/glossary/quality-gate.md) enforce structural quality through [Credo](@/glossary/credo.md) analysis, [Dialyzer](@/glossary/dialyzer.md) type checking, and cyclomatic complexity thresholds.

## Why Refactoring Matters

Code is read far more often than it is written. A function written once will be read by every developer who touches the module, every reviewer who examines a pull request, and every debugger who traces an issue through the codebase. The cost of poorly structured code is not paid once at writing time but continuously at reading time.

The economics of refactoring follow a clear pattern:

| Time Horizon | Cost of Not Refactoring | Cost of Refactoring |
|-------------|------------------------|---------------------|
| **Immediate** | None (code works) | Developer time for restructuring |
| **1 month** | Increased time to understand code | Amortized across all readers |
| **6 months** | New features take 2-3x longer | Code remains easy to modify |
| **1 year** | [Technical debt](@/glossary/technical-debt.md) compounds exponentially | Debt stays near zero |
| **2+ years** | Rewrite becomes cheaper than modification | Continuous evolution remains viable |

The Prismatic Platform's 141 umbrella applications and approximately 2.8 million lines of code make refactoring essential for platform sustainability. Without continuous refactoring, the codebase would become unmaintainable within months.

## Refactoring Techniques in Elixir

[Elixir](@/glossary/elixir.md) has unique refactoring patterns that differ from object-oriented languages. The absence of mutable state, the use of [pattern matching](@/glossary/pattern-matching.md), and the [pipe operator](@/glossary/pipe-operator.md) create refactoring opportunities that do not exist in imperative languages.

### Extract Function

The most common refactoring: extracting a block of code into a named function. In Elixir, this is especially powerful because pure functions can be extracted without worrying about shared state.

```elixir
# Before: monolithic function
defmodule PrismaticWeb.SecurityRatingController do
  def calculate_rating(domain) do
    # Fetch assets
    assets = PrismaticPerimeter.AssetDiscovery.discover(domain)
    filtered_assets = Enum.filter(assets, &(&1.status == :active))

    # Score each category
    ssl_score = filtered_assets
      |> Enum.filter(&(&1.type == :certificate))
      |> Enum.map(&score_certificate/1)
      |> average()

    dns_score = filtered_assets
      |> Enum.filter(&(&1.type == :dns_record))
      |> Enum.map(&score_dns_record/1)
      |> average()

    header_score = filtered_assets
      |> Enum.filter(&(&1.type == :http_header))
      |> Enum.map(&score_header/1)
      |> average()

    # Compute weighted average
    total = ssl_score * 0.4 + dns_score * 0.3 + header_score * 0.3
    grade = cond do
      total >= 90 -> :A
      total >= 80 -> :B
      total >= 70 -> :C
      total >= 60 -> :D
      true -> :F
    end

    %{score: total, grade: grade}
  end
end

# After: extracted functions with clear responsibilities
defmodule PrismaticPerimeter.SecurityRating do
  @moduledoc """
  Computes security ratings for domains based on discovered assets.
  Each scoring category is an independent function that can be
  tested, modified, and weighted independently.
  """

  @category_weights %{ssl: 0.4, dns: 0.3, headers: 0.3}

  @spec calculate(String.t()) :: {:ok, rating()} | {:error, term()}
  def calculate(domain) do
    with {:ok, assets} <- discover_active_assets(domain),
         {:ok, category_scores} <- score_categories(assets),
         {:ok, rating} <- compute_rating(category_scores) do
      {:ok, rating}
    end
  end

  defp discover_active_assets(domain) do
    assets =
      domain
      |> PrismaticPerimeter.AssetDiscovery.discover()
      |> Enum.filter(&(&1.status == :active))

    {:ok, assets}
  end

  defp score_categories(assets) do
    scores = %{
      ssl: score_by_type(assets, :certificate, &score_certificate/1),
      dns: score_by_type(assets, :dns_record, &score_dns_record/1),
      headers: score_by_type(assets, :http_header, &score_header/1)
    }

    {:ok, scores}
  end

  defp score_by_type(assets, type, scorer) do
    assets
    |> Enum.filter(&(&1.type == type))
    |> Enum.map(scorer)
    |> average()
  end

  defp compute_rating(category_scores) do
    total =
      @category_weights
      |> Enum.map(fn {category, weight} ->
        Map.get(category_scores, category, 0) * weight
      end)
      |> Enum.sum()

    {:ok, %{score: Float.round(total, 2), grade: score_to_grade(total)}}
  end

  defp score_to_grade(score) when score >= 90, do: :A
  defp score_to_grade(score) when score >= 80, do: :B
  defp score_to_grade(score) when score >= 70, do: :C
  defp score_to_grade(score) when score >= 60, do: :D
  defp score_to_grade(_score), do: :F

  defp average([]), do: 0.0
  defp average(values), do: Enum.sum(values) / length(values)
end
```

### Replace Conditional with Pattern Matching

Elixir's pattern matching eliminates complex conditional chains. This refactoring replaces `cond`, `case`, or nested `if` expressions with function clauses:

```elixir
# Before: nested conditionals
def process_event(event) do
  if event.type == :security_alert do
    if event.severity >= 8 do
      escalate_to_commander(event)
    else
      if event.severity >= 5 do
        notify_team(event)
      else
        log_and_archive(event)
      end
    end
  else
    if event.type == :performance_alert do
      analyze_performance(event)
    else
      archive(event)
    end
  end
end

# After: pattern matching with function clauses
def process_event(%{type: :security_alert, severity: severity} = event)
    when severity >= 8 do
  escalate_to_commander(event)
end

def process_event(%{type: :security_alert, severity: severity} = event)
    when severity >= 5 do
  notify_team(event)
end

def process_event(%{type: :security_alert} = event) do
  log_and_archive(event)
end

def process_event(%{type: :performance_alert} = event) do
  analyze_performance(event)
end

def process_event(event) do
  archive(event)
end
```

### Introduce Pipe Chain

Replace nested function calls with the [pipe operator](@/glossary/pipe-operator.md) for readable data transformation:

```elixir
# Before: nested calls (read inside-out)
def analyze_codebase(path) do
  generate_report(
    compute_metrics(
      filter_elixir_files(
        list_all_files(path)
      )
    )
  )
end

# After: pipe chain (read top-to-bottom)
def analyze_codebase(path) do
  path
  |> list_all_files()
  |> filter_elixir_files()
  |> compute_metrics()
  |> generate_report()
end
```

### Extract Behaviour

When multiple modules share a common interface, extract a [behaviour](@/glossary/behaviour.md) to formalize the contract:

```elixir
# Before: implicit interface across multiple modules
defmodule PrismaticStorage.EtsAdapter do
  def store(key, value), do: # ...
  def fetch(key), do: # ...
  def delete(key), do: # ...
end

defmodule PrismaticStorage.EctoAdapter do
  def store(key, value), do: # ...
  def fetch(key), do: # ...
  def delete(key), do: # ...
end

# After: explicit behaviour contract
defmodule PrismaticStorage.Adapter do
  @moduledoc """
  Behaviour defining the storage adapter contract.
  All storage backends must implement these callbacks.
  """

  @callback store(key :: term(), value :: term()) :: {:ok, term()} | {:error, term()}
  @callback fetch(key :: term()) :: {:ok, term()} | {:error, :not_found}
  @callback delete(key :: term()) :: :ok | {:error, term()}
end

defmodule PrismaticStorage.EtsAdapter do
  @behaviour PrismaticStorage.Adapter

  @impl PrismaticStorage.Adapter
  def store(key, value), do: # ...

  @impl PrismaticStorage.Adapter
  def fetch(key), do: # ...

  @impl PrismaticStorage.Adapter
  def delete(key), do: # ...
end
```

### Replace Process Dictionary with GenServer State

The process dictionary is a source of hidden state. Refactoring to explicit [GenServer](@/glossary/genserver.md) state makes the state visible and testable:

```elixir
# Before: hidden state in process dictionary
def track_metric(name, value) do
  current = Process.get({:metric, name}, [])
  Process.put({:metric, name}, [value | current])
end

def get_metric(name) do
  Process.get({:metric, name}, [])
end

# After: explicit GenServer state
defmodule PrismaticMetrics.Tracker do
  use GenServer

  def start_link(opts) do
    GenServer.start_link(__MODULE__, %{}, opts)
  end

  @impl GenServer
  def init(_opts), do: {:ok, %{}}

  def track(server, name, value) do
    GenServer.cast(server, {:track, name, value})
  end

  def get(server, name) do
    GenServer.call(server, {:get, name})
  end

  @impl GenServer
  def handle_cast({:track, name, value}, state) do
    updated = Map.update(state, name, [value], &[value | &1])
    {:noreply, updated}
  end

  @impl GenServer
  def handle_call({:get, name}, _from, state) do
    {:reply, Map.get(state, name, []), state}
  end
end
```

## Refactoring Safety Net: Testing

Refactoring without tests is surgery without anesthesia: technically possible but irresponsible. The Prismatic Platform enforces comprehensive [test coverage](@/glossary/test-coverage.md) as a prerequisite for refactoring safety.

The refactoring workflow:

1. **Verify existing tests pass**: `mix test` must be green before starting
2. **Add missing tests**: If the code to be refactored lacks tests, add them first
3. **Refactor in small steps**: Each step should be independently verifiable
4. **Run tests after each step**: `mix test --failed` catches regressions immediately
5. **Run static analysis**: `mix credo --strict` and `mix dialyzer` verify structural quality
6. **Run quality gates**: `mix quality.gates` ensures all platform standards are met

```elixir
defmodule PrismaticPerimeter.SecurityRatingTest do
  use ExUnit.Case, async: true

  alias PrismaticPerimeter.SecurityRating

  describe "calculate/1" do
    test "returns A grade for high-security domains" do
      assert {:ok, %{grade: :A, score: score}} =
               SecurityRating.calculate("secure-example.com")

      assert score >= 90.0
    end

    test "returns F grade for domains with no security controls" do
      assert {:ok, %{grade: :F, score: score}} =
               SecurityRating.calculate("insecure-example.com")

      assert score < 60.0
    end

    test "handles discovery failures gracefully" do
      assert {:error, :discovery_failed} =
               SecurityRating.calculate("nonexistent.invalid")
    end

    test "weighted scores sum to total" do
      assert {:ok, %{score: score}} =
               SecurityRating.calculate("example.com")

      assert score >= 0.0 and score <= 100.0
    end
  end
end
```

## Automated Refactoring Detection

The platform's [Credo](@/glossary/credo.md) analysis automatically detects code that needs refactoring:

| Credo Check | Refactoring Indicated | Threshold |
|-------------|----------------------|-----------|
| `Credo.Check.Refactor.CyclomaticComplexity` | Extract function, simplify logic | > 9 |
| `Credo.Check.Refactor.Nesting` | Extract function, early return | > 2 levels |
| `Credo.Check.Refactor.LongQuoteBlocks` | Extract module | > 150 lines |
| `Credo.Check.Refactor.FunctionArity` | Introduce options struct | > 5 parameters |
| `Credo.Check.Refactor.PipeChainStart` | Restructure pipe chain | pipe starts with literal |
| `Credo.Check.Design.DuplicatedCode` | Extract shared function | > 5 lines duplicated |

The platform also uses custom Credo checks in the `prismatic_credo` application for platform-specific patterns like hardcoded CI values, unsafe function references, and CSS custom property usage.

## When to Refactor

Refactoring should be continuous, not batched. The "refactoring sprint" anti-pattern creates cycles of degradation followed by expensive cleanup. Instead, refactoring should be embedded in every development activity:

| Activity | Refactoring Approach |
|----------|---------------------|
| **Adding a feature** | Refactor the area you are modifying to accommodate the feature cleanly |
| **Fixing a bug** | Refactor the code around the bug to make similar bugs impossible |
| **Code review** | Identify refactoring opportunities and address them in the same PR |
| **Performance optimization** | Refactor for clarity first, then optimize the clear code |
| **Onboarding** | Document confusion points and refactor them for the next reader |

The Boy Scout Rule: "Leave the code better than you found it." Every interaction with the codebase is an opportunity to improve its structure.

## Refactoring and the Umbrella Architecture

The Prismatic Platform's [umbrella application](@/glossary/umbrella-application.md) architecture creates specific refactoring patterns:

### Move Function Between Applications

When a function belongs in a different application than where it was originally written, it must be moved across the umbrella boundary. This requires updating all callers and their `mix.exs` dependencies:

```elixir
# Before: function in wrong application
# apps/prismatic_web/lib/prismatic_web/helpers/security_helpers.ex
defmodule PrismaticWeb.SecurityHelpers do
  def hash_password(password) do
    Bcrypt.hash_pwd_salt(password)
  end
end

# After: moved to correct application
# apps/prismatic/lib/prismatic/security/password.ex
defmodule Prismatic.Security.Password do
  @moduledoc """
  Password hashing and verification.
  Belongs in the core application, not the web layer,
  because password operations are used by API, CLI, and
  background job contexts.
  """

  @spec hash(String.t()) :: {:ok, String.t()}
  def hash(password) when is_binary(password) do
    {:ok, Bcrypt.hash_pwd_salt(password)}
  end

  @spec verify(String.t(), String.t()) :: boolean()
  def verify(password, hash) do
    Bcrypt.verify_pass(password, hash)
  end
end
```

### Extract New Umbrella Application

When a module grows large enough to warrant its own application, extract it from the parent:

The platform's 141 applications are the result of this refactoring pattern applied consistently over the project's lifetime. Each application has a focused responsibility, its own test suite, and explicit dependencies.

## Refactoring Anti-Patterns

| Anti-Pattern | Description | Risk |
|-------------|-------------|------|
| **Big Bang Refactoring** | Rewriting everything at once | High regression risk, long feedback loop |
| **Refactoring Without Tests** | Restructuring code without verification | Undetected behavioral changes |
| **Premature Abstraction** | Creating abstractions before patterns are clear | Wrong abstractions that must be undone |
| **Refactoring During Feature Work** | Mixing behavior changes with structural changes | Impossible to verify correctness |
| **Refactoring for Refactoring's Sake** | Restructuring code that is already clear | Wasted effort, churn, risk without benefit |

## The Strangler Fig Pattern

For large-scale refactoring, the Prismatic Platform uses the Strangler Fig pattern: the new implementation grows around the old one, gradually taking over functionality until the old implementation can be removed entirely. This approach avoids the Big Bang anti-pattern by enabling incremental migration:

1. Create the new module alongside the old one
2. Route new callers to the new module
3. Gradually migrate existing callers
4. Monitor both implementations in parallel
5. Remove the old module when all callers have migrated

## Integration with CI/CD

The platform's [continuous integration](@/glossary/continuous-integration.md) pipeline enforces refactoring quality:

- `mix compile --warnings-as-errors --force` -- zero compilation warnings
- `mix credo --strict` -- all Credo checks pass
- `mix dialyzer` -- all type specifications verified
- `mix test --cover` -- test coverage maintained or improved
- `mix quality.gates` -- all quality gates pass
- `mix quality.forbidden_patterns` -- no forbidden patterns introduced

A refactoring that introduces warnings, fails Credo checks, or reduces test coverage is rejected by the pipeline. This ensures that refactoring improves quality rather than merely changing structure.

## Related Terms

- [Technical Debt](@/glossary/technical-debt.md) -- The cost of not refactoring accumulated over time
- [Code Quality](@/glossary/code-quality.md) -- The measurable outcome of consistent refactoring
- [Static Analysis](@/glossary/static-analysis.md) -- Automated detection of refactoring opportunities
- [Credo](@/glossary/credo.md) -- Elixir static analysis tool enforcing code quality
- [Dialyzer](@/glossary/dialyzer.md) -- Type checker catching type-related refactoring errors
- [Testing](@/glossary/testing.md) -- Safety net enabling confident refactoring
- [Quality Gate](@/glossary/quality-gate.md) -- Automated enforcement of refactoring standards
- [Clean Run](@/glossary/clean-run.md) -- Zero-warning compilation after refactoring
- [Continuous Integration](@/glossary/continuous-integration.md) -- Pipeline verifying refactoring correctness
- [Code Reviews](@/glossary/code-reviews.md) -- Human verification of refactoring decisions

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture patterns
- [Capabilities](@/capabilities/_index.md) -- Quality assurance capabilities
- Glossary -- Complete glossary index

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
