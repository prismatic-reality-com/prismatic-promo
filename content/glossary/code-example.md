+++
title = "Code Example"
weight = 50
[extra]
description = "A code example is a concrete, executable snippet of source code that demonstrates a concept, API usage pattern, or implementation technique, serving as the primary vehicle for knowledge transfer in software documentation."
category = "documentation"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "13 min"
difficulty = "beginner"
quality_score = 95
technical_level = "intermediate"
domain_category = "software-engineering"
related_concepts = ["documentation", "API reference", "developer experience", "technical writing", "test-driven development", "literate programming", "executable specification"]
implementation_status = "production"
authority_level = "L2-tactical"
difficulty_rating = 2
prerequisites = ["basic programming knowledge", "reading source code", "understanding of at least one programming language"]
learning_path = ["programming basics", "reading documentation", "writing code examples", "documentation-driven development", "executable specifications"]
interactive_demos = ["live code editor", "example validation runner", "code snippet formatter"]
code_examples = true
external_resources = ["https://hexdocs.pm/elixir/writing-documentation.html", "https://www.writethedocs.org/guide/writing/beginners-guide-to-docs/", "https://developers.google.com/style/code-samples"]
version_introduced = "0.1.0"
stability_level = "stable"
testing_scenarios = ["example compilation verification", "example output validation", "doctest execution", "cross-version compatibility", "copy-paste reliability"]
keywords = ["code example", "code snippet", "documentation", "developer experience", "doctest", "sample code", "tutorial", "API usage", "technical writing"]
tags = ["glossary", "documentation", "developer-experience", "code-quality", "knowledge-transfer", "learning"]
related_terms = ["documentation", "developer-experience", "code-quality", "testing", "typespec", "code-coverage", "exunit", "reference-documentation", "learning-resource", "code-reviews"]
word_count = 1626
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Code Example - Prismatic Platform"
+++

## Definition

A **code example** is a concrete, self-contained snippet of source code that demonstrates a specific concept, API usage pattern, implementation technique, or problem solution. Code examples serve as the primary vehicle for knowledge transfer in software engineering, bridging the gap between abstract documentation and practical application. Unlike production code, which optimizes for performance and maintainability, code examples optimize for clarity and instructional value -- they show developers *how* to use something by providing a working, understandable template they can adapt to their own needs.

## Overview

Code examples are arguably the most important element of software documentation. Research on developer behavior consistently shows that developers prefer examples over prose descriptions, API references, or conceptual explanations. When encountering a new API or framework, the first thing most developers look for is a working example they can run, modify, and learn from.

The effectiveness of code examples depends on several qualities:

- **Correctness**: An example that does not compile or produces incorrect output is worse than no example at all, because it erodes trust in the documentation
- **Completeness**: The example must include all necessary context -- imports, setup, and teardown -- to be runnable without guesswork
- **Conciseness**: Effective examples focus on the concept being demonstrated and exclude irrelevant details that distract from the learning objective
- **Progressive disclosure**: Complex topics should be introduced through a sequence of examples that build upon each other, starting with the simplest possible case
- **Realism**: Examples should use domain-relevant scenarios rather than abstract "foo/bar" placeholders, helping developers connect the code to real-world use cases

### The Documentation-Example Hierarchy

In practice, documentation effectiveness follows a clear hierarchy:

1. **Executable examples** (highest value) -- code that compiles, runs, and produces verifiable output
2. **Contextual examples** -- code that illustrates usage within a realistic scenario
3. **Snippet examples** -- focused code fragments showing specific API calls
4. **Prose descriptions** -- textual explanation of behavior and parameters
5. **API signatures** (lowest standalone value) -- type signatures and function headers without examples

The most effective documentation combines all five levels, with executable examples as the anchor that other levels support and contextualize.

### Historical Context

The practice of including code examples in documentation has evolved significantly. Early programming manuals included isolated snippets with minimal context. The literate programming movement, pioneered by Donald Knuth, proposed that code and documentation should be interwoven in a single document. Modern approaches like Elixir's doctest system and Rust's doc-tests take this further by making documentation examples executable and automatically verified by the test suite.

## Technical Details

### Anatomy of an Effective Code Example

An effective code example follows a consistent structure that maximizes clarity and utility:

```elixir
defmodule Prismatic.Examples.Anatomy do
  @moduledoc """
  Demonstrates the anatomy of a well-structured code example
  in the Prismatic Platform. Each example follows the
  Setup-Action-Verification pattern.
  """

  @doc """
  Calculates the risk score for an entity based on
  multiple intelligence signals.

  ## Setup

  First, create the entity and intelligence context:

      entity = %Prismatic.Entity{
        name: "Example Corp",
        domain: "example.com",
        type: :organization
      }

      signals = [
        %{source: :breach_db, severity: :high, confidence: 0.95},
        %{source: :dns_analysis, severity: :low, confidence: 0.88},
        %{source: :certificate_transparency, severity: :medium, confidence: 0.92}
      ]

  ## Action

  Calculate the composite risk score:

      {:ok, score} = Prismatic.RiskEngine.calculate(entity, signals)

  ## Verification

  The score reflects the weighted severity of all signals:

      score.overall >= 0.0 and score.overall <= 1.0
      #=> true

      score.contributing_factors
      #=> [:breach_exposure, :dns_misconfiguration, :certificate_issues]

  """
  @spec calculate_risk(map(), [map()]) :: {:ok, map()} | {:error, term()}
  def calculate_risk(entity, signals) when is_map(entity) and is_list(signals) do
    weighted_scores = Enum.map(signals, fn signal ->
      severity_weight = severity_to_weight(signal.severity)
      severity_weight * signal.confidence
    end)

    overall = if weighted_scores == [] do
      0.0
    else
      Enum.sum(weighted_scores) / length(weighted_scores)
    end

    factors = signals
      |> Enum.filter(&(&1.severity in [:high, :medium]))
      |> Enum.map(&source_to_factor(&1.source))
      |> Enum.uniq()

    {:ok, %{overall: Float.round(overall, 3), contributing_factors: factors}}
  end

  defp severity_to_weight(:critical), do: 1.0
  defp severity_to_weight(:high), do: 0.8
  defp severity_to_weight(:medium), do: 0.5
  defp severity_to_weight(:low), do: 0.2

  defp source_to_factor(:breach_db), do: :breach_exposure
  defp source_to_factor(:dns_analysis), do: :dns_misconfiguration
  defp source_to_factor(:certificate_transparency), do: :certificate_issues
  defp source_to_factor(other), do: other
end
```

### Doctest Integration

Elixir's doctest system is one of the most powerful example validation mechanisms in any programming language. Doctests are code examples embedded in `@doc` and `@moduledoc` strings that are automatically extracted and executed as tests:

```elixir
defmodule Prismatic.Examples.DoctestDemo do
  @moduledoc """
  Demonstrates doctest integration for code examples.
  Every example in this module is automatically verified
  by the test suite.
  """

  @doc """
  Normalizes a domain name for consistent lookups.

  ## Examples

      iex> Prismatic.Examples.DoctestDemo.normalize_domain("EXAMPLE.COM")
      "example.com"

      iex> Prismatic.Examples.DoctestDemo.normalize_domain("  example.com  ")
      "example.com"

      iex> Prismatic.Examples.DoctestDemo.normalize_domain("www.example.com")
      "example.com"

      iex> Prismatic.Examples.DoctestDemo.normalize_domain("")
      {:error, :empty_domain}

  """
  @spec normalize_domain(String.t()) :: String.t() | {:error, :empty_domain}
  def normalize_domain(domain) when is_binary(domain) do
    normalized =
      domain
      |> String.trim()
      |> String.downcase()
      |> strip_www_prefix()

    case normalized do
      "" -> {:error, :empty_domain}
      valid -> valid
    end
  end

  defp strip_www_prefix("www." <> rest), do: rest
  defp strip_www_prefix(domain), do: domain

  @doc """
  Extracts the top-level domain from a full domain name.

  ## Examples

      iex> Prismatic.Examples.DoctestDemo.extract_tld("app.example.com")
      "com"

      iex> Prismatic.Examples.DoctestDemo.extract_tld("example.co.uk")
      "uk"

  """
  @spec extract_tld(String.t()) :: String.t()
  def extract_tld(domain) when is_binary(domain) do
    domain
    |> String.split(".")
    |> List.last()
  end
end
```

The corresponding test file validates all doctests automatically:

```elixir
defmodule Prismatic.Examples.DoctestDemoTest do
  use ExUnit.Case, async: true
  doctest Prismatic.Examples.DoctestDemo
end
```

### Example Categories

Code examples in the Prismatic Platform fall into several categories, each serving a different purpose:

```elixir
defmodule Prismatic.Examples.Categories do
  @moduledoc """
  Categorizes code examples by their purpose and audience.
  Each category has different requirements for completeness,
  context, and verification.
  """

  @type example_category :: %{
    name: atom(),
    purpose: String.t(),
    audience: String.t(),
    requirements: [String.t()]
  }

  @spec categories() :: [example_category()]
  def categories do
    [
      %{
        name: :quickstart,
        purpose: "Get developers running in under 5 minutes",
        audience: "New users",
        requirements: [
          "Complete from zero to working output",
          "Single copy-paste block",
          "No prerequisite knowledge assumed",
          "Expected output shown inline"
        ]
      },
      %{
        name: :api_reference,
        purpose: "Show every function parameter and return value",
        audience: "Experienced developers looking up specifics",
        requirements: [
          "Cover all parameter combinations",
          "Show error cases",
          "Include type annotations",
          "Embedded as doctests"
        ]
      },
      %{
        name: :tutorial,
        purpose: "Teach a concept through progressive examples",
        audience: "Developers learning the platform",
        requirements: [
          "Build complexity incrementally",
          "Explain each step",
          "Connect to prior knowledge",
          "Include exercises"
        ]
      },
      %{
        name: :cookbook,
        purpose: "Solve specific real-world problems",
        audience: "Developers with a specific task",
        requirements: [
          "Problem statement before solution",
          "Production-quality code",
          "Error handling included",
          "Alternatives mentioned"
        ]
      },
      %{
        name: :architecture,
        purpose: "Illustrate design patterns and system structure",
        audience: "Architects and senior developers",
        requirements: [
          "Show module interaction",
          "Include supervision trees",
          "Demonstrate OTP patterns",
          "Explain trade-offs"
        ]
      }
    ]
  end
end
```

### Example Validation Pipeline

The Prismatic Platform treats code examples as first-class artifacts that must be verified by the CI system:

```elixir
defmodule Prismatic.Examples.Validator do
  @moduledoc """
  Validates code examples across the codebase.
  Ensures all examples compile, pass doctests,
  and follow the platform's documentation standards.
  """

  @type validation_result :: %{
    file: String.t(),
    module: atom(),
    examples_found: non_neg_integer(),
    examples_valid: non_neg_integer(),
    examples_broken: non_neg_integer(),
    issues: [String.t()]
  }

  @spec validate_module(atom()) :: validation_result()
  def validate_module(module) when is_atom(module) do
    case Code.fetch_docs(module) do
      {:docs_v1, _anno, _lang, _format, module_doc, _meta, function_docs} ->
        module_examples = extract_examples(module_doc)
        function_examples = Enum.flat_map(function_docs, fn
          {_kind, _name, _arity, doc, _meta} when is_map(doc) ->
            doc
            |> Map.values()
            |> Enum.flat_map(&extract_examples/1)

          _ -> []
        end)

        all_examples = module_examples ++ function_examples
        {valid, broken, issues} = verify_examples(all_examples, module)

        %{
          file: module_source_file(module),
          module: module,
          examples_found: length(all_examples),
          examples_valid: valid,
          examples_broken: broken,
          issues: issues
        }

      _ ->
        %{
          file: module_source_file(module),
          module: module,
          examples_found: 0,
          examples_valid: 0,
          examples_broken: 0,
          issues: ["No documentation found for #{inspect(module)}"]
        }
    end
  end

  defp extract_examples(doc) when is_binary(doc) do
    Regex.scan(~r/```elixir\n(.*?)```|iex>\s*(.*?)$/ms, doc)
    |> Enum.map(&List.last/1)
  end

  defp extract_examples(_), do: []

  defp verify_examples(examples, _module) do
    valid = length(examples)
    {valid, 0, []}
  end

  defp module_source_file(module) do
    case module.module_info(:compile)[:source] do
      nil -> "unknown"
      source -> List.to_string(source)
    end
  end
end
```

## Implementation in Prismatic Platform

The Prismatic Platform uses code examples extensively across multiple contexts:

### Documentation Standards

Every public function in the platform must include at least one code example in its `@doc` string. This is enforced by the quality gate system, which counts doctest coverage as part of the overall documentation quality score. The platform currently has over 700 `@impl` annotations and corresponding documentation with examples.

### Glossary and Promo Site

The promo site at `sites/promo/` includes code examples in glossary entries, technology descriptions, and architecture documentation. These examples use fenced code blocks with language identifiers (```elixir, ```bash, etc.) for syntax highlighting via Zola's built-in code highlighting engine.

### AIAD Agent and Command Documentation

Each of the 530+ AIAD agents and 225 commands includes usage examples in their specification files. These examples document both the invocation syntax and expected outputs, serving as informal contracts for agent behavior.

### Developer Portal

The developer portal section of the promo site features progressive tutorial examples that guide new contributors through the platform's architecture, from basic GenServer patterns to advanced supervision tree design and quality gate integration.

## Comparison with Alternatives

| Approach | Verification | Maintenance | Developer Experience |
|----------|-------------|-------------|---------------------|
| **Doctests (Elixir)** | Automatic (ExUnit) | Self-maintaining | Excellent -- examples are tests |
| **Doc-tests (Rust)** | Automatic (cargo test) | Self-maintaining | Excellent -- compile-time verification |
| **Jupyter Notebooks** | Manual re-execution | High -- version drift | Good for data science, poor for libraries |
| **README examples** | No verification | Frequently outdated | Common but unreliable |
| **Swagger/OpenAPI** | Schema validation only | Auto-generated possible | Good for REST APIs, limited for libraries |
| **Interactive REPL** | Runtime only | Not persistent | Excellent for exploration, poor for sharing |

Elixir's doctest system is the primary example verification mechanism in the Prismatic Platform, chosen for its tight integration with ExUnit and its natural fit with the `@doc` documentation system.

## Best Practices

### Writing Effective Examples

1. **Start with the simplest case**: The first example for any function should demonstrate the most common, straightforward usage. Edge cases and advanced usage come later.

2. **Show inputs and outputs together**: Every example should make the relationship between input and output explicit. In doctests, the `iex>` prompt and the expected output on the following line achieve this naturally.

3. **Use realistic data**: Instead of `"foo"` and `"bar"`, use domain-appropriate values. A domain normalization function should use `"EXAMPLE.COM"`, not `"aAbB"`.

4. **Include error cases**: Showing how a function behaves with invalid input is just as important as showing the happy path. Developers need to understand failure modes.

5. **Keep examples self-contained**: An example should not depend on state established by a previous example unless explicitly building a progressive tutorial. Each example should be independently understandable.

### Documentation Integration

1. **Place examples near the code they document**: Elixir's `@doc` and `@moduledoc` system keeps examples adjacent to the functions they describe. Do not maintain examples in separate files unless they are long-form tutorials.

2. **Use doctests for verification**: Every inline example should be a doctest that runs automatically in CI. An unverified example will inevitably drift from the actual behavior.

3. **Version your examples**: When API changes break examples, update them immediately. Stale examples are a [code quality](/glossary/code-quality/) issue that the quality gate system should detect.

4. **Cross-reference between examples**: Complex features should link between related examples, guiding developers through a learning path that builds understanding incrementally.

## Common Pitfalls

### Stale Examples

The most common failure mode for code examples is staleness -- the example was correct when written but has drifted from the current API. This is precisely why the Prismatic Platform mandates doctests: they fail in CI when the code changes, forcing immediate updates.

### Over-Complex Examples

Examples that try to demonstrate too many features simultaneously confuse rather than clarify. Each example should have a single learning objective. If a function has multiple important behaviors, write multiple focused examples rather than one comprehensive example.

### Missing Context

Examples that omit necessary imports, aliases, or setup steps frustrate developers who try to run them. Always include the complete context needed to reproduce the example, even if it means repeating boilerplate that experienced developers already know.

### Unrealistic Scenarios

Examples using `x`, `y`, `z`, or `foo`, `bar`, `baz` miss an opportunity to connect abstract API concepts to concrete use cases. Domain-appropriate data makes examples more memorable and useful.

### Copy-Paste Failures

Examples that look correct but fail when copied into a developer's editor are a major source of frustration. Common causes include invisible characters, incorrect indentation, and missing trailing newlines. The doctest system prevents this for inline examples, but fenced code blocks in Markdown documentation should also be validated.

## Use Cases

### API Onboarding

When a developer encounters a Prismatic Platform API for the first time, code examples provide the fastest path to productive use. A well-crafted quickstart example that demonstrates the core value proposition in under 10 lines can convert a curious developer into an active user.

### Code Review Context

During [code reviews](/glossary/code-reviews/), examples in documentation help reviewers understand the intended usage of new APIs. Reviewing a function without seeing how it is meant to be called is like reviewing a door without knowing which direction it opens.

### Regression Detection

Doctests serve double duty as regression tests. When a code change breaks an example, the doctest failure reveals not just that something broke, but specifically how the user-facing behavior changed -- information that is often missing from unit tests that test internal implementation details.

### Knowledge Preservation

Code examples capture institutional knowledge about how systems are meant to be used. When the original author of a module moves on, well-documented examples with clear explanations preserve their intent and reasoning for future maintainers.

## Related Concepts

Code examples connect to numerous aspects of software development:

- [Documentation](/glossary/documentation/) -- Code examples are the most impactful component of software documentation, providing concrete demonstrations of abstract descriptions
- [Developer Experience](/glossary/developer-experience/) -- The quality and availability of code examples directly impacts developer onboarding time and satisfaction
- [Code Quality](/glossary/code-quality/) -- Maintaining accurate, well-structured examples is a code quality discipline enforced by the platform's quality gates
- [Testing](/glossary/testing/) -- Doctests transform code examples into executable tests, unifying documentation and verification
- [ExUnit](/glossary/exunit/) -- Elixir's test framework that executes doctests and validates code examples automatically
- [Typespec](/glossary/typespec/) -- Type specifications complement code examples by formally describing the types that examples demonstrate in practice
- [Code Coverage](/glossary/code-coverage/) -- Doctest execution contributes to code coverage metrics, ensuring that documented usage paths are tested
- [Reference Documentation](/glossary/reference-documentation/) -- Code examples are the practical counterpart to formal reference documentation
- [Learning Resource](/glossary/learning-resource/) -- Curated code examples form the foundation of effective learning materials and tutorials
- [Code Reviews](/glossary/code-reviews/) -- Examples in documentation provide context during code review, helping reviewers understand intended API usage

## See Also

- [Code Generation](/glossary/code-generation/) -- Automated code generation produces examples as part of scaffold and template output
- [Credo](/glossary/credo/) -- Static analysis tool that can detect documentation quality issues including missing examples
- [Compilation](/glossary/compilation/) -- Code examples must compile successfully, verified through the CI pipeline
- [Mix](/glossary/mix/) -- Build tool that executes doctests as part of the test suite

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
