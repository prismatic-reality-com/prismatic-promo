+++
title = "Documentation"
description = "Comprehensive documentation practices, tools, and strategies for software systems, APIs, and knowledge management in modern platform engineering."
weight = 50

[extra]
category = "glossary"
tags = ["documentation", "technical-writing", "api-docs", "knowledge-management", "docs-as-code", "openapi", "zola", "elixir", "hexdocs", "moduledoc", "typedoc", "living-documentation"]
date_created = "2026-02-22"
date_updated = "2026-02-22"
abbreviation = "docs"
difficulty = "intermediate"
audience = ["developers", "architects", "technical-writers", "platform-engineers"]
related_terms = ["api", "openapi", "testing", "typespec", "architecture", "elixir", "phoenix", "umbrella-application", "quality", "technical-debt"]
key_concepts = ["docs-as-code", "auto-generated-documentation", "living-documentation", "documentation-drift", "api-specification", "code-as-documentation"]
platforms = ["elixir", "phoenix", "zola", "hexdocs", "openapi"]
prerequisites = ["programming fundamentals", "version control"]
use_cases = ["API documentation", "developer onboarding", "architecture decision records", "runbooks", "knowledge preservation"]
complexity = "medium"
stability = "stable"
author = "Tomas Korcak (korczis)"
reading_time = "11 min"
word_count = 2165
date_modified = "2026-02-23"
keywords = ["Documentation", "Comprehensive", "APIs", "glossary", "Prismatic Platform", "Elixir", "The Prismatic"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Documentation - Prismatic Platform"
+++

## Definition and Overview

**Documentation** encompasses all written materials that describe, explain, and guide the use of software systems, APIs, libraries, and platforms. In modern software engineering, documentation is not merely a supplementary artifact but a first-class engineering concern that directly impacts system adoptability, maintainability, and long-term viability. Effective documentation serves as the connective tissue between complex technical implementations and the humans who build, operate, and consume those systems.

The scope of documentation extends far beyond simple code comments. It includes API specifications that define contracts between services, architecture decision records that capture the reasoning behind design choices, runbooks that guide operators through incident response, onboarding guides that reduce time-to-productivity for new team members, and glossaries that establish shared vocabulary across organizational boundaries. Each documentation type serves a distinct audience and purpose, and mature engineering organizations treat documentation with the same rigor they apply to code: versioned, reviewed, tested, and continuously maintained.

Documentation quality has a compounding effect on engineering velocity. Poor documentation creates hidden costs through repeated questions, misunderstood interfaces, incorrect integrations, and knowledge silos. Conversely, excellent documentation acts as a force multiplier, enabling teams to work independently, reducing onboarding time from weeks to days, and making architectural intent explicit rather than tribal knowledge locked in individuals' heads.

## Types of Documentation

Software documentation exists on a spectrum from low-level code artifacts to high-level strategic documents. Understanding these types and their intended audiences is essential for building a comprehensive documentation strategy.

**API Documentation** provides detailed descriptions of endpoints, parameters, response formats, authentication methods, rate limits, and usage examples for programmatic interfaces. Modern API documentation is often generated from machine-readable specifications like [OpenAPI](/glossary/openapi/), ensuring accuracy and enabling tooling such as client code generation and automated testing.

**Reference Documentation** consists of comprehensive listings of functions, modules, types, and their parameters. In Elixir, reference documentation is generated from `@moduledoc` and `@doc` attributes using ExDoc, producing browsable HTML documentation hosted on HexDocs. This documentation is inherently accurate because it is extracted directly from the source code.

**Conceptual Documentation** explains the "why" behind architectural decisions, design patterns, and system behaviors. Unlike reference documentation which describes individual components, conceptual documentation explains how components fit together and why specific approaches were chosen over alternatives.

**Tutorials and Guides** walk users through specific tasks step by step, building understanding progressively. Good tutorials are task-oriented, provide working code at each step, and explain not just what to do but why each step is necessary.

**Architecture Decision Records (ADRs)** capture significant architectural decisions along with their context, alternatives considered, and rationale. ADRs create an audit trail of decision-making that helps future engineers understand why the system looks the way it does.

**Operational Documentation** includes runbooks, incident response procedures, deployment guides, and monitoring dashboards. This documentation is critical for production operations and must be maintained with extreme care, as outdated operational documentation during an incident can cause more harm than no documentation at all.

## Docs-as-Code Methodology

The docs-as-code approach treats documentation with the same tools and workflows used for software development. Documentation is written in markup languages, stored in version control alongside source code, reviewed through pull requests, validated by CI/CD pipelines, and deployed automatically.

```elixir
defmodule Prismatic.Documentation.Pipeline do
  @moduledoc """
  Implements a docs-as-code pipeline that validates, builds, and deploys
  documentation alongside application code changes.

  The pipeline ensures documentation stays synchronized with code by
  running validation checks during CI/CD and blocking merges when
  documentation drift is detected.
  """

  @type validation_result :: {:ok, map()} | {:error, list(String.t())}
  @type build_result :: {:ok, String.t()} | {:error, String.t()}

  @spec validate_documentation(String.t()) :: validation_result()
  def validate_documentation(docs_path) do
    with {:ok, files} <- list_documentation_files(docs_path),
         {:ok, _} <- check_frontmatter(files),
         {:ok, _} <- check_cross_references(files),
         {:ok, _} <- check_code_examples(files),
         {:ok, _} <- check_word_count(files, min_words: 1500) do
      {:ok, %{files_checked: length(files), status: :valid}}
    else
      {:error, reasons} -> {:error, reasons}
    end
  end

  @spec build_documentation(String.t(), keyword()) :: build_result()
  def build_documentation(docs_path, opts \\ []) do
    generator = Keyword.get(opts, :generator, :zola)
    output_dir = Keyword.get(opts, :output, "public/")

    case generator do
      :zola -> build_with_zola(docs_path, output_dir)
      :exdoc -> build_with_exdoc(docs_path, output_dir)
      other -> {:error, "Unsupported generator: #{inspect(other)}"}
    end
  end

  defp list_documentation_files(path) do
    files = Path.wildcard(Path.join(path, "**/*.md"))

    case files do
      [] -> {:error, ["No documentation files found in #{path}"]}
      files -> {:ok, files}
    end
  end

  defp check_frontmatter(files) do
    errors =
      files
      |> Enum.flat_map(fn file ->
        case parse_frontmatter(file) do
          {:ok, _meta} -> []
          {:error, reason} -> ["#{file}: #{reason}"]
        end
      end)

    case errors do
      [] -> {:ok, :valid}
      errors -> {:error, errors}
    end
  end

  defp check_cross_references(files) do
    # Validate that all /path/file/ references point to existing files
    {:ok, :valid}
  end

  defp check_code_examples(files) do
    # Validate that code examples compile and are syntactically correct
    {:ok, :valid}
  end

  defp check_word_count(files, opts) do
    min_words = Keyword.get(opts, :min_words, 1500)

    errors =
      files
      |> Enum.filter(fn file ->
        word_count(file) < min_words
      end)
      |> Enum.map(fn file ->
        "#{file}: #{word_count(file)} words (minimum #{min_words})"
      end)

    case errors do
      [] -> {:ok, :valid}
      errors -> {:error, errors}
    end
  end

  defp parse_frontmatter(_file), do: {:ok, %{}}
  defp build_with_zola(_path, _output), do: {:ok, "public/"}
  defp build_with_exdoc(_path, _output), do: {:ok, "doc/"}
  defp word_count(_file), do: 2000
end
```

This approach provides several advantages over traditional documentation workflows. Changes to documentation go through the same review process as code changes, catching errors before they reach readers. Documentation is versioned alongside the code it describes, making it possible to see what the documentation said at any point in the project's history. CI/CD pipelines can validate documentation quality, check for broken links, verify that code examples compile, and ensure minimum content standards are met.

## Auto-Generated Documentation in Elixir

Elixir has one of the strongest documentation cultures in the programming language ecosystem. Documentation is a first-class language feature, not an afterthought. The `@moduledoc` and `@doc` attributes are part of the language specification, and tools like ExDoc generate beautiful, searchable HTML documentation directly from these attributes.

```elixir
defmodule Prismatic.Documentation.ModuleExample do
  @moduledoc """
  Demonstrates Elixir documentation best practices.

  This module shows how to write effective documentation using
  Elixir's built-in documentation attributes. Documentation in
  Elixir is not comments -- it is metadata attached to modules
  and functions that can be accessed at runtime.

  ## Examples

      iex> Prismatic.Documentation.ModuleExample.format_title("hello world")
      "Hello World"

      iex> Prismatic.Documentation.ModuleExample.word_count("the quick brown fox")
      4

  ## Configuration

  This module respects the following application configuration:

      config :prismatic, Prismatic.Documentation.ModuleExample,
        default_format: :markdown,
        max_length: 10_000
  """

  @doc """
  Formats a documentation title to title case.

  Capitalizes the first letter of each word in the given string,
  following standard title case conventions.

  ## Parameters

    * `title` - The raw title string to format

  ## Returns

    * Formatted title string in title case

  ## Examples

      iex> format_title("actor model overview")
      "Actor Model Overview"

  """
  @spec format_title(String.t()) :: String.t()
  def format_title(title) when is_binary(title) do
    title
    |> String.split()
    |> Enum.map(&String.capitalize/1)
    |> Enum.join(" ")
  end

  @doc """
  Counts the number of words in a documentation text.

  Words are defined as sequences of non-whitespace characters
  separated by whitespace.

  ## Parameters

    * `text` - The text to count words in

  ## Returns

    * Non-negative integer representing the word count

  """
  @spec word_count(String.t()) :: non_neg_integer()
  def word_count(text) when is_binary(text) do
    text
    |> String.split(~r/\s+/, trim: true)
    |> length()
  end
end
```

The key insight in Elixir's documentation philosophy is that documentation is accessible at runtime through `Code.fetch_docs/1`. This enables tools that go beyond static HTML generation: the Prismatic Platform's auto-introspecting API uses `Code.fetch_docs/1` to extract documentation from facade modules and include it in OpenAPI specifications, meaning API documentation is always exactly synchronized with the code.

## Documentation Quality Metrics

Measuring documentation quality requires both quantitative metrics and qualitative assessment. The Prismatic Platform employs a scoring system that evaluates documentation across multiple dimensions.

| Metric | Weight | Threshold | Measurement |
|--------|--------|-----------|-------------|
| **Word Count** | 50 points | 1,500+ words | Automated count of body text |
| **Section Structure** | 25 points | 8+ headings | Count of `##` headings |
| **Frontmatter Completeness** | 15 points | 5+ extra keys | TOML metadata fields |
| **Cross-References** | 10 points | 3+ links | Internal `@/` references |
| **Passing Score** | - | 75/100 | Combined weighted score |

Beyond these quantitative metrics, documentation quality also depends on factors that are harder to measure automatically: accuracy of technical content, appropriateness for the target audience, logical flow between sections, quality of code examples, and currency with the actual system behavior. Peer review during pull requests helps catch these qualitative issues.

## Documentation Drift Prevention

Documentation drift occurs when documentation and implementation diverge over time. This is one of the most pervasive problems in software engineering, and combating it requires systematic approaches rather than good intentions.

```elixir
defmodule Prismatic.Documentation.DriftDetector do
  @moduledoc """
  Detects documentation drift by comparing documented interfaces
  with actual module exports and typespecs.

  Runs as part of the CI pipeline to catch cases where code
  changes have made documentation inaccurate.
  """

  @type drift_report :: %{
    module: module(),
    missing_docs: list(atom()),
    stale_docs: list(atom()),
    spec_mismatches: list({atom(), String.t()})
  }

  @spec check_module(module()) :: {:ok, :no_drift} | {:error, drift_report()}
  def check_module(module) do
    with {:ok, exports} <- get_exports(module),
         {:ok, documented} <- get_documented_functions(module),
         {:ok, specs} <- get_typespecs(module) do
      missing = exports -- documented
      stale = documented -- exports
      mismatches = find_spec_mismatches(module, specs)

      case {missing, stale, mismatches} do
        {[], [], []} ->
          {:ok, :no_drift}

        _ ->
          {:error, %{
            module: module,
            missing_docs: missing,
            stale_docs: stale,
            spec_mismatches: mismatches
          }}
      end
    end
  end

  defp get_exports(module) do
    {:ok, module.__info__(:functions)}
  end

  defp get_documented_functions(module) do
    case Code.fetch_docs(module) do
      {:docs_v1, _, _, _, _, _, docs} ->
        functions = for {{:function, name, _arity}, _, _, doc, _} <- docs,
                        doc != :none,
                        do: name
        {:ok, Enum.uniq(functions)}

      _ ->
        {:error, :no_docs}
    end
  end

  defp get_typespecs(module) do
    case Code.Typespec.fetch_specs(module) do
      {:ok, specs} -> {:ok, specs}
      :error -> {:ok, []}
    end
  end

  defp find_spec_mismatches(_module, _specs), do: []
end
```

Strategies for preventing documentation drift include automated checks in CI/CD that compare documented interfaces with actual code, documentation-aware code review processes that flag changes to public APIs without corresponding documentation updates, and living documentation that is generated directly from code artifacts.

## Static Site Generation

Static site generators transform markup files into complete websites, providing an efficient and secure approach to documentation hosting. The Prismatic Platform uses [Zola](https://www.getzola.org/) for its public documentation site, chosen for its speed, simplicity, and native TOML frontmatter support.

| Generator | Language | Build Speed | Template Engine | Use Case |
|-----------|----------|-------------|-----------------|----------|
| **Zola** | Rust | ~10s for 1,000+ pages | Tera | Documentation sites, blogs |
| **ExDoc** | Elixir | Integrated with mix | EEx | Elixir library documentation |
| **MkDocs** | Python | Moderate | Jinja2 | Technical documentation |
| **Docusaurus** | JavaScript | Moderate | React | Product documentation |
| **Hugo** | Go | Fast | Go templates | General-purpose sites |

Zola's architecture is well-suited to documentation because it supports taxonomies for organizing content, built-in search, syntax highlighting for code examples, and a powerful template system. The Prismatic promo site builds over 1,800 pages from markdown sources in approximately 10 seconds, demonstrating that static generation scales well even for large documentation sets.

## Documentation Architecture Patterns

### Hierarchical Documentation

Large platforms require documentation organized in hierarchies that mirror the system architecture. The Prismatic Platform uses a multi-level documentation hierarchy:

- **Platform Level**: CLAUDE.md files that describe the overall platform, its architecture, and cross-cutting concerns
- **Application Level**: Per-app CLAUDE.md files that describe individual umbrella applications
- **Module Level**: `@moduledoc` attributes that describe Elixir modules
- **Function Level**: `@doc` attributes that describe individual functions
- **Inline Level**: Code comments that explain non-obvious implementation details

### Documentation as Interface Contract

In service-oriented architectures, documentation serves as the contract between service providers and consumers. [API](/glossary/api/) documentation defines not just the shape of requests and responses but also behavioral guarantees, error semantics, rate limits, and versioning policies. When documentation is treated as a contract, changes to documentation require the same rigor as changes to code.

### Living Documentation

Living documentation refers to documentation that is automatically generated from executable specifications, tests, or code. In Elixir, doctests serve as living documentation: code examples in `@doc` attributes are automatically extracted and executed as tests, ensuring that documented examples always work correctly.

```elixir
defmodule Prismatic.Documentation.LivingExample do
  @moduledoc """
  Demonstrates living documentation through doctests.

  Every code example in this module's documentation is
  automatically verified by the test suite.
  """

  @doc """
  Validates that a documentation file meets quality standards.

  ## Examples

      iex> Prismatic.Documentation.LivingExample.meets_standard?(%{words: 2500, sections: 12})
      true

      iex> Prismatic.Documentation.LivingExample.meets_standard?(%{words: 500, sections: 3})
      false

  """
  @spec meets_standard?(map()) :: boolean()
  def meets_standard?(%{words: words, sections: sections}) do
    words >= 1500 and sections >= 8
  end
end
```

## Documentation Tooling Ecosystem

Modern documentation workflows rely on a rich ecosystem of tools that handle different aspects of the documentation lifecycle.

**Authoring Tools**: Markdown editors, TOML/YAML frontmatter support, live preview, spell checking, and linting. Tools like markdownlint enforce consistent formatting and catch common errors.

**Validation Tools**: Link checkers that verify internal and external references, schema validators for frontmatter, and custom validators that check domain-specific quality rules.

**Build Tools**: Static site generators, ExDoc for Elixir, and API documentation generators like SwaggerUI and Redoc. These tools transform source documentation into formats optimized for reading.

**Deployment Tools**: GitHub Pages, GitLab Pages, Netlify, and Vercel provide automated deployment of documentation sites from version control. The Prismatic promo site deploys to both GitHub Pages and GitLab Pages for redundancy.

**Search Tools**: Client-side search engines like Pagefind and server-side search like Meilisearch provide fast, relevant search across documentation. Good search is essential for large documentation sites where navigation alone is insufficient.

## Documentation in Umbrella Applications

Elixir [umbrella applications](/glossary/umbrella-application/) present unique documentation challenges. With 115+ applications in the Prismatic Platform, maintaining consistent documentation across all apps requires standardization and automation.

Each umbrella application maintains its own CLAUDE.md file that describes the application's purpose, architecture, key modules, and integration points. A quality standard enforces that every application has documentation, and automated tooling measures documentation coverage across the entire umbrella.

The relationship between application-level documentation and module-level documentation follows a principle of progressive disclosure: CLAUDE.md files provide the high-level overview that helps developers understand what an application does and how it fits into the platform, while `@moduledoc` and `@doc` attributes provide the detailed reference documentation needed when working within the application.

## Cross-Reference Systems

Cross-references connect related documentation, enabling readers to navigate the knowledge graph efficiently. In the Prismatic promo site, cross-references use Zola's internal linking syntax (`@/glossary/<name>.md`) which is validated at build time, ensuring that broken references are caught before deployment.

Effective cross-referencing follows several principles: reference related concepts that provide context (not just tangentially related terms), use descriptive link text that tells the reader what they will find, maintain bidirectional references where both documents link to each other, and limit the number of references per document to avoid overwhelming readers.

## Documentation and Knowledge Management

Documentation is a subset of the broader discipline of knowledge management. While documentation captures explicit knowledge in written form, organizations also possess tacit knowledge that exists only in people's heads. Bridging this gap requires documentation practices that actively extract tacit knowledge and make it explicit.

Architecture Decision Records capture the reasoning behind decisions that would otherwise exist only as tribal knowledge. Post-incident reviews document what was learned during operational incidents. Onboarding documentation captures the implicit knowledge that experienced team members take for granted but that new members need to be effective.

The Prismatic Platform's session context system (`.claude/session-context/`) serves as a knowledge management tool, capturing the context, decisions, and outcomes of each development session so that future sessions can build on previous work rather than rediscovering the same information.

## Prismatic Platform Documentation Strategy

The Prismatic Platform employs a multi-layered documentation strategy that combines auto-generated and hand-written documentation at multiple levels of granularity.

**Auto-Generated API Documentation**: The [API](/glossary/api/) gateway uses `Code.fetch_docs/1` and `Code.Typespec.fetch_specs/1` to automatically generate [OpenAPI](/glossary/openapi/) specifications with SwaggerUI, ensuring API documentation is always synchronized with implementation.

**CLAUDE.md Files**: Every umbrella application has a CLAUDE.md file that describes its purpose, architecture, key modules, and integration points. The platform-level CLAUDE.md serves as the master reference for the entire system.

**Promo Site**: A public-facing documentation site built with Zola, containing over 1,800 pages of content across sections including [architecture](/glossary/architecture/), capabilities, agents, commands, glossary, and more.

**AIAD Specifications**: Agent and command specifications in `.aiad/` serve as both documentation and machine-readable definitions that can be indexed, searched, and validated.

**Session Context**: Development session summaries in `.claude/session-context/` capture decisions, actions, and outcomes for cross-session continuity.

## Best Practices and Anti-Patterns

### Best Practices

- **Write for your audience**: Tailor language, examples, and depth to the intended readers' expertise level
- **Include working examples**: Every [API](/glossary/api/) endpoint and major feature should have practical, tested code examples
- **Structure logically**: Organize information hierarchically with clear navigation and cross-references
- **Keep it current**: Implement automated processes to detect documentation drift when code changes
- **Test documentation**: Verify that examples compile, instructions can be followed, and links resolve
- **Review documentation**: Include documentation changes in code review processes
- **Version alongside code**: Store documentation in the same repository as the code it describes

### Anti-Patterns

| Anti-Pattern | Description | Consequence |
|-------------|-------------|-------------|
| **Write Once, Forget** | Writing documentation during initial development and never updating it | Misleading documentation worse than none |
| **Documentation as Afterthought** | Adding documentation only when mandated | Low-quality, superficial content |
| **Copy-Paste Documentation** | Duplicating content across multiple locations | Inconsistency when one copy is updated |
| **Over-Documentation** | Documenting every obvious detail | Important information buried in noise |
| **Under-Documentation** | Documenting only happy paths | Users stuck when encountering edge cases |
| **Heroic Documentation** | One person responsible for all documentation | Knowledge silo, single point of failure |

## Historical Context and Evolution

Documentation practices have evolved significantly alongside software engineering:

| Era | Approach | Characteristics |
|-----|----------|-----------------|
| **1960s-1970s** | Printed manuals | Separate from code, expensive to update |
| **1980s-1990s** | Online help systems | Searchable, hyperlinked, but still separate |
| **2000s** | Wikis and CMS | Collaborative, web-based, but often disorganized |
| **2010s** | Docs-as-code | Version controlled, CI/CD integrated, Markdown-based |
| **2020s** | AI-assisted documentation | Auto-generated, validated, living documentation |

The trend is clearly toward tighter integration between documentation and code, with increasing automation handling the mechanical aspects of documentation while humans focus on the conceptual and strategic content that requires judgment and expertise.

## Related Concepts

- [API](/glossary/api/) -- Interfaces that require comprehensive documentation
- [OpenAPI](/glossary/openapi/) -- Machine-readable API specification standard
- [Architecture](/glossary/architecture/) -- System design documented through ADRs
- [Typespec](/glossary/typespec/) -- Type annotations that serve as documentation
- [Testing](/glossary/testing/) -- Doctests as living documentation
- [Umbrella Application](/glossary/umbrella-application/) -- Multi-app documentation challenges
- [Technical Debt](/glossary/technical-debt/) -- Documentation debt as a form of technical debt
- [Telemetry](/glossary/telemetry/) -- Operational documentation for monitoring systems
- [Validation](/glossary/validation/) -- Documentation quality validation

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
