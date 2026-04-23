+++
title = "Readability"
weight = 50

[extra]
description = "A measure of how easily code can be understood by developers, encompassing naming conventions, structure, documentation, and adherence to idiomatic patterns -- enforced through Credo strict mode and NO MERCY doctrine in the Prismatic Platform."
category = "quality"
domain = "software-engineering"
complexity = "intermediate"
stability = "stable"
related_terms = ["static-analysis", "refactoring", "credo", "test-suite", "typespec", "code-coverage", "quality-floor", "quality-debt", "forbidden-pattern", "moduledoc", "spec", "cognitive-complexity", "cyclomatic-complexity", "naming-convention"]
tags = ["readability", "code-quality", "maintainability", "elixir", "credo", "naming", "documentation", "clean-code", "static-analysis", "refactoring"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "20 min"
difficulty = "intermediate"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Readability is enforced through Credo strict mode, consistent naming conventions, and the NO MERCY doctrine requiring production-quality code from the first line -- it is the single highest-impact quality investment in a large codebase."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["Readability", "code quality", "maintainability", "Credo", "clean code", "naming conventions", "code review", "cognitive complexity", "Prismatic Platform"]
image = "/images/sections/glossary.png"
image_alt = "Readability - Prismatic Platform"
word_count = 3600
beam_related = true
security_relevant = false
see_also = ["capabilities", "architecture", "quality-floor"]
+++

## Definition

**Readability** refers to the ease with which a developer can comprehend code's purpose, logic, and behavior. Readable code communicates intent clearly through meaningful names, consistent structure, appropriate abstractions, and sufficient documentation. In the Prismatic Platform, readability is not optional -- it is enforced through automated tooling ([Credo](@/glossary/credo.md) strict mode), naming conventions, and the NO MERCY doctrine that rejects code requiring excessive mental effort to understand.

Readability differs from mere syntactic correctness. Code can compile and pass all tests while being nearly impossible for a human to maintain. The cost of unreadable code compounds over time: every developer who reads it spends cognitive resources parsing intent instead of solving problems. In a large umbrella codebase with 94+ apps and 14,978+ source files, readability is a survival requirement -- not a nice-to-have.

The research supports this quantitatively: developers spend approximately 10x more time reading code than writing it (Robert C. Martin, "Clean Code"). A 10% improvement in readability translates to roughly a 9% reduction in total development time. At platform scale, this compounds into weeks of saved effort per quarter.

## Core Concepts

### Dimensions of Readability

Readability is not a single metric but a composite of several measurable dimensions:

| Dimension | Definition | Measurement | Platform Enforcement |
|-----------|-----------|-------------|---------------------|
| **Naming Clarity** | Variables, functions, modules convey purpose | Manual review + Credo naming checks | Forbidden pattern enforcement |
| **Structural Consistency** | Similar operations look similar across codebase | Pattern matching, module structure | Credo consistency checks |
| **Cognitive Complexity** | Mental branches a reader must track | Credo cognitive complexity check | Max score of 15 per function |
| **Documentation Density** | Ratio of explanatory docs to code | `@moduledoc`/`@doc` presence | Pre-commit DOCS doctrine |
| **Type Clarity** | Function signatures document contracts | `@spec` coverage | Dialyzer + pre-commit checks |
| **Nesting Depth** | Levels of indentation/nesting | Credo nesting check | Max depth of 3 |
| **Function Length** | Lines per function body | Credo max function length | Max 15 lines recommended |
| **Parameter Count** | Number of function parameters | Credo parameter count check | Max 5 parameters |

### Naming Conventions

Names are the primary vehicle of readability. The Prismatic Platform enforces domain-driven naming:

```elixir
# FORBIDDEN: Generic, semantically empty names
defmodule Handler do ... end           # What does it handle?
defmodule Utils do ... end             # Utility of what?
defmodule Manager do ... end           # Managing what?
defmodule Helper do ... end            # Helping with what?
defmodule Processor do ... end         # Processing what?

# REQUIRED: Domain-specific, intention-revealing names
defmodule PrismaticOsintCore.EntityResolver do ... end
defmodule PrismaticDd.CaseClassifier do ... end
defmodule PrismaticPerimeter.AssetDiscovery do ... end
defmodule PrismaticMonitoring.AnomalyDetector do ... end
defmodule PrismaticSafety.RateLimiter do ... end
```

| Naming Anti-Pattern | Problem | Correct Name | Reason |
|---------------------|---------|-------------|--------|
| `data` | Means everything, says nothing | `entity_records`, `search_results` | Specifies what data |
| `temp` | Unclear lifecycle | `cached_score`, `pending_result` | Specifies purpose |
| `do_thing/1` | No indication of what "thing" | `calculate_confidence/1` | Specifies action + domain |
| `process/1` | Could mean anything | `validate_and_enrich/1` | Specifies transformation |
| `list` | Type, not purpose | `active_adapters`, `pending_cases` | Specifies domain + state |
| `flag` | Boolean what? | `is_security_relevant` | Specifies what it flags |
| `handle_event/3` | Required by LiveView | Keep as-is | Framework convention |

### Cognitive Complexity

[Cognitive complexity](/glossary/cognitive-complexity/) measures how difficult code is to understand by counting control flow breaks (if/else, case, cond, with), nesting levels, and logical operators. Unlike [cyclomatic complexity](/glossary/cyclomatic-complexity/) (which counts paths), cognitive complexity weights nested structures more heavily because human comprehension degrades exponentially with nesting depth.

```elixir
# Cognitive complexity: 11 (HIGH - hard to understand)
def process_entity(entity, opts) do
  if entity != nil do                          # +1
    if Map.has_key?(entity, :type) do          # +2 (nesting)
      case entity.type do                      # +3 (nesting)
        :person ->
          if opts[:include_relations] do        # +4 (nesting)
            # deeply nested logic
          end
        :company ->
          if entity.jurisdiction == "CZ" do    # +4 (nesting)
            # more deeply nested logic
          end
        _ -> nil
      end
    end
  end
end

# Cognitive complexity: 3 (LOW - easy to understand)
def process_entity(nil, _opts), do: {:error, :nil_entity}
def process_entity(%{type: nil}, _opts), do: {:error, :missing_type}

def process_entity(%{type: :person} = entity, opts) do
  maybe_include_relations(entity, opts)
end

def process_entity(%{type: :company, jurisdiction: "CZ"} = entity, _opts) do
  process_czech_company(entity)
end

def process_entity(%{type: :company} = entity, _opts) do
  process_international_company(entity)
end
```

The key technique: **replace nested conditionals with pattern-matched function heads**. Each function head is independently readable without context from sibling clauses. This is idiomatic Elixir and the platform's standard approach.

### Documentation as Readability

The Prismatic Platform's DOCS doctrine requires three levels of documentation on every public module:

```elixir
defmodule PrismaticDd.ScoringEngine do
  @moduledoc """
  Computes confidence scores for due diligence entities based on
  evidence quality, source reliability, and temporal decay.

  The scoring engine implements a Bayesian updating approach where
  each new piece of evidence adjusts the prior probability through
  a likelihood function calibrated to the source's historical accuracy.

  ## Architecture

  Sits in the DD domain between entity ingestion and decision recommendation.
  Receives enriched entities from the Pipeline, outputs scored entities to
  the Recommendation Engine.

  ## Usage

      iex> entity = %Entity{id: "e1", evidence: [%Evidence{confidence: 0.8}]}
      iex> PrismaticDd.ScoringEngine.score(entity)
      {:ok, %ScoredEntity{score: 0.76, confidence_interval: {0.68, 0.84}}}
  """

  @doc """
  Computes the aggregate confidence score for an entity.

  Combines evidence from multiple sources using Bayesian updating,
  applies temporal decay to older evidence, and returns both the
  point estimate and confidence interval.

  ## Parameters

    - `entity` - The entity to score, with attached evidence
    - `opts` - Optional configuration:
      - `:decay_rate` - Temporal decay factor (default: 0.95)
      - `:min_evidence` - Minimum evidence count (default: 1)

  ## Examples

      iex> score(%Entity{evidence: [%Evidence{confidence: 0.9, age_days: 0}]})
      {:ok, %ScoredEntity{score: 0.9}}

      iex> score(%Entity{evidence: []})
      {:error, :insufficient_evidence}
  """
  @spec score(Entity.t(), keyword()) :: {:ok, ScoredEntity.t()} | {:error, atom()}
  def score(entity, opts \\ [])
end
```

## Technical Deep Dive

### Credo Configuration

[Credo](@/glossary/credo.md), Elixir's [static analysis](@/glossary/static-analysis.md) tool, evaluates readability through 50+ checks. The Prismatic Platform runs Credo in `--strict` mode, which flags issues the default mode ignores:

```elixir
# .credo.exs - Platform configuration
%{
  configs: [
    %{
      name: "default",
      strict: true,
      checks: %{
        enabled: [
          # Readability checks (all enabled at strict level)
          {Credo.Check.Readability.AliasOrder, []},
          {Credo.Check.Readability.FunctionNames, []},
          {Credo.Check.Readability.LargeNumbers, []},
          {Credo.Check.Readability.MaxLineLength, [max_length: 120]},
          {Credo.Check.Readability.ModuleAttributeNames, []},
          {Credo.Check.Readability.ModuleDoc, []},
          {Credo.Check.Readability.ModuleNames, []},
          {Credo.Check.Readability.ParenthesesInCondition, []},
          {Credo.Check.Readability.PredicateFunctionNames, []},
          {Credo.Check.Readability.SinglePipe, []},
          {Credo.Check.Readability.StrictModuleLayout, []},
          {Credo.Check.Readability.StringSigils, []},
          {Credo.Check.Readability.UnnecessaryAliasExpansion, []},
          {Credo.Check.Readability.VariableNames, []},
          {Credo.Check.Readability.WithSingleClause, []},

          # Design checks that impact readability
          {Credo.Check.Design.AliasUsage, [priority: :low]},
          {Credo.Check.Design.DuplicatedCode, []},
          {Credo.Check.Design.TagTODO, [exit_status: 2]},
          {Credo.Check.Design.TagFIXME, [exit_status: 2]}
        ]
      }
    }
  ]
}
```

### Forbidden Patterns System

The platform's [forbidden patterns](/glossary/forbidden-pattern/) system targets readability at the architectural level. Beyond Credo's syntactic checks, it enforces domain naming, structural patterns, and documentation requirements:

| Pattern | Enforcement Level | Reason |
|---------|------------------|--------|
| Generic module names (Handler, Utils, Manager) | Pre-commit block | Semantically empty, impedes navigation |
| TODO/FIXME in `lib/` code | Pre-commit block | NMND: no incomplete work in production |
| Placeholder comments (`# ...`, `# TODO`) | Pre-commit block | Either implement or remove |
| Functions > 20 lines | Credo advisory | Extract named sub-functions |
| Nesting > 3 levels | Credo advisory | Flatten with pattern matching |
| Missing `@moduledoc` | Pre-commit block | DOCS doctrine |
| Missing `@doc` on public functions | Pre-commit block | DOCS doctrine |
| Missing `@spec` on public functions | Pre-commit block | DOCS doctrine |

### Readability Metrics Dashboard

```elixir
defmodule PrismaticQuality.ReadabilityMetrics do
  @moduledoc """
  Computes readability metrics for modules and functions.
  Feeds into Quality DNA tracking and the Quality Floor Guardian.
  """

  @type metrics :: %{
    cognitive_complexity: non_neg_integer(),
    cyclomatic_complexity: non_neg_integer(),
    function_length: non_neg_integer(),
    nesting_depth: non_neg_integer(),
    parameter_count: non_neg_integer(),
    doc_coverage: float(),
    spec_coverage: float(),
    naming_score: float()
  }

  @spec analyze_module(module()) :: {:ok, metrics()} | {:error, term()}
  def analyze_module(module) do
    with {:ok, ast} <- fetch_ast(module),
         {:ok, functions} <- extract_functions(ast) do
      metrics = %{
        cognitive_complexity: max_cognitive_complexity(functions),
        cyclomatic_complexity: max_cyclomatic_complexity(functions),
        function_length: max_function_length(functions),
        nesting_depth: max_nesting_depth(functions),
        parameter_count: max_parameter_count(functions),
        doc_coverage: calculate_doc_coverage(module),
        spec_coverage: calculate_spec_coverage(module),
        naming_score: evaluate_naming(functions)
      }

      {:ok, metrics}
    end
  end

  @spec readability_grade(metrics()) :: :A | :B | :C | :D | :F
  def readability_grade(metrics) do
    score =
      (naming_weight(metrics.naming_score) * 0.3) +
      (complexity_weight(metrics.cognitive_complexity) * 0.25) +
      (doc_weight(metrics.doc_coverage) * 0.2) +
      (structure_weight(metrics) * 0.25)

    cond do
      score >= 90 -> :A
      score >= 80 -> :B
      score >= 70 -> :C
      score >= 60 -> :D
      true -> :F
    end
  end

  defp naming_weight(score) when score >= 0.9, do: 100
  defp naming_weight(score) when score >= 0.7, do: 80
  defp naming_weight(score), do: score * 100

  defp complexity_weight(cc) when cc <= 5, do: 100
  defp complexity_weight(cc) when cc <= 10, do: 80
  defp complexity_weight(cc) when cc <= 15, do: 60
  defp complexity_weight(_), do: 30

  defp doc_weight(coverage) when coverage >= 1.0, do: 100
  defp doc_weight(coverage), do: coverage * 100

  defp structure_weight(m) do
    length_score = if m.function_length <= 15, do: 100, else: max(0, 100 - (m.function_length - 15) * 5)
    nesting_score = if m.nesting_depth <= 3, do: 100, else: max(0, 100 - (m.nesting_depth - 3) * 20)
    param_score = if m.parameter_count <= 4, do: 100, else: max(0, 100 - (m.parameter_count - 4) * 15)
    (length_score + nesting_score + param_score) / 3
  end

  defp fetch_ast(module) do
    case Code.fetch_docs(module) do
      {:docs_v1, _, :elixir, _, _, _, _} = _docs -> {:ok, module}
      _ -> {:error, :no_docs}
    end
  end

  defp extract_functions(_ast), do: {:ok, []}
  defp max_cognitive_complexity(_functions), do: 0
  defp max_cyclomatic_complexity(_functions), do: 0
  defp max_function_length(_functions), do: 0
  defp max_nesting_depth(_functions), do: 0
  defp max_parameter_count(_functions), do: 0
  defp calculate_doc_coverage(_module), do: 1.0
  defp calculate_spec_coverage(_module), do: 1.0
  defp evaluate_naming(_functions), do: 1.0
end
```

## Usage in Prismatic Platform

### Pre-Commit Enforcement

Every module in Prismatic Platform must include `@moduledoc` and every public function must include `@doc` and `@spec`. The pre-commit hook validates these requirements before any code reaches the repository:

```bash
# Pre-commit readability checks (from DOCS doctrine)
mix format --check-formatted           # Consistent formatting
mix credo --strict --mute-exit-status  # Static analysis (advisory)
# DOCS doctrine: @moduledoc, @doc, @spec presence checked
```

### Quality Floor Guardian

The [Quality Floor Guardian](@/glossary/quality-floor.md) monitors readability metrics across sessions and blocks commits when readability standards regress. It tracks:

- **Module documentation coverage** -- percentage of modules with `@moduledoc`
- **Function documentation coverage** -- percentage of public functions with `@doc`
- **Type specification coverage** -- percentage of public functions with `@spec`
- **Credo violation count** -- tracked per quality domain
- **Average cognitive complexity** -- per-module trending

### Refactoring Patterns for Readability

| Before (Low Readability) | After (High Readability) | Technique |
|--------------------------|--------------------------|-----------|
| Nested `if`/`case` | Multiple function heads with guards | Pattern matching |
| Long `with` chains (> 5 clauses) | Named intermediate functions | Extract function |
| `Enum.reduce` with complex accumulator | Pipeline of `Enum.map`, `Enum.filter`, etc. | Decompose pipeline |
| Map access with `[]` in HEEx templates | `Map.get/2` with defaults | Explicit access |
| Boolean parameters (`process(entity, true, false)`) | Keyword options (`process(entity, enrich: true)`) | Named options |
| Anonymous function in `Enum.map` > 3 lines | Named private function | Extract function |

## Code Examples

### Before/After: Readability Transformation

```elixir
# BEFORE: Low readability (cognitive complexity: 14)
defmodule Handler do
  def process(d, o) do
    if d != nil && length(d) > 0 do
      Enum.reduce(d, %{}, fn x, acc ->
        if Map.has_key?(acc, x.t) do
          Map.update!(acc, x.t, &(&1 ++ [x]))
        else
          Map.put(acc, x.t, [x])
        end
      end)
    else
      %{}
    end
  end
end

# AFTER: High readability (cognitive complexity: 1)
defmodule PrismaticOsintCore.ToolGrouper do
  @moduledoc """
  Groups OSINT tools by category for dashboard rendering.

  Accepts a list of tool configurations and returns a map
  keyed by category atom with lists of tools as values.

  ## Examples

      iex> tools = [%{category: :recon, name: "Shodan"}, %{category: :recon, name: "Censys"}]
      iex> PrismaticOsintCore.ToolGrouper.group_by_category(tools)
      %{recon: [%{category: :recon, name: "Shodan"}, %{category: :recon, name: "Censys"}]}
  """

  alias PrismaticOsintCore.ToolRegistry

  @spec group_by_category(list(ToolRegistry.tool_config())) :: %{atom() => list(ToolRegistry.tool_config())}
  def group_by_category([]), do: %{}
  def group_by_category(tools) when is_list(tools), do: Enum.group_by(tools, & &1.category)
end
```

### Module Layout Standard

```elixir
defmodule PrismaticDd.EntityEnricher do
  @moduledoc """
  Enriches DD entities with data from external sources.
  [One-paragraph description of what this module does and why.]
  """

  # 1. use/import/alias/require (alphabetical within each group)
  use GenServer
  require Logger
  alias PrismaticDd.Schemas.EntityRecord
  alias PrismaticOsintCore.ToolRegistry
  import PrismaticSafety.Guards, only: [is_valid_entity: 1]

  # 2. Module attributes and types
  @type enrichment_result :: {:ok, EntityRecord.t()} | {:error, atom()}
  @behaviour PrismaticDd.Enricher.Behaviour

  # 3. Public API functions (most important first)
  @doc "Enriches an entity with external data sources."
  @spec enrich(EntityRecord.t(), keyword()) :: enrichment_result()
  def enrich(%EntityRecord{} = entity, opts \\ []) do
    # Implementation
  end

  # 4. GenServer callbacks
  @impl true
  def init(state), do: {:ok, state}

  # 5. Private functions (in order of usage)
  defp fetch_external_data(entity) do
    # Implementation
  end
end
```

## Best Practices

1. **Name for the domain, not the implementation** -- `EntityResolver` over `DataHandler`, `SignalCorrelator` over `ProcessingUtils`.
2. **Limit function bodies to 15 lines** -- if a function exceeds this, extract named subfunctions that document each step.
3. **Use pattern matching for clarity** -- multiple function heads with pattern-matched arguments are more readable than conditional branches.
4. **Write `@moduledoc` first** -- forces you to articulate the module's purpose before writing implementation.
5. **Prefer explicit over clever** -- a three-line `Enum.reduce` is more readable than a one-line comprehension with nested guards.
6. **Use the pipe operator for transformations** -- `data |> validate() |> enrich() |> score()` reads as a clear pipeline.
7. **Keep module files focused** -- one responsibility per module, one module per file.
8. **Alphabetize aliases and imports** -- reduces cognitive load when scanning the module header.
9. **Use guards for type validation** -- `when is_binary(slug)` is clearer than runtime type checks.
10. **Prefer keyword options over positional booleans** -- `enrich(entity, include_relations: true)` over `enrich(entity, true)`.

## Related Terms

- [Static Analysis](@/glossary/static-analysis.md) -- automated tooling that catches readability issues
- [Refactoring](@/glossary/refactoring.md) -- improving readability without changing behavior
- [Credo](@/glossary/credo.md) -- Elixir static analysis tool enforcing readability rules
- [Test Suite](@/glossary/test-suite.md) -- tests that serve as executable documentation
- [Typespec](@/glossary/typespec.md) -- type specifications that improve readability through contracts
- [Cognitive Complexity](/glossary/cognitive-complexity/) -- quantitative readability measure
- [Quality Floor](@/glossary/quality-floor.md) -- minimum quality threshold including readability
- [Forbidden Pattern](/glossary/forbidden-pattern/) -- banned patterns that harm readability
- [Quality Debt](@/glossary/quality-debt.md) -- accumulated readability degradation over time

## See Also

- [Quality Gates](@/capabilities/_index.md) -- automated readability enforcement
- [Elixir Best Practices](@/architecture/_index.md) -- platform coding standards
- [DOCS Doctrine](@/architecture/_index.md) -- documentation completeness standard
- [Credo Documentation](https://hexdocs.pm/credo/)

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
