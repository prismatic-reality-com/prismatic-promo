+++
title = "Learning Resource"
weight = 50
[extra]
tags = ["glossary", "education", "documentation", "developer-experience", "knowledge-management", "training", "tutorials", "onboarding", "content-strategy", "technical-writing"]
description = "A Learning Resource is any discrete unit of educational content -- documentation, tutorial, code example, video, or interactive exercise -- designed to transfer specific knowledge or skills to a learner within a structured or self-directed context."
category = "education"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "beginner"
quality_score = 95
related_terms = ["learning-path", "documentation", "curriculum", "developer-experience", "code-example", "reference-documentation", "developer-portal", "knowledge-graph", "mentorship", "progressive-disclosure"]
key_concepts = ["content types", "quality scoring", "discoverability", "metadata enrichment", "adaptive difficulty", "content lifecycle"]
use_cases = ["developer onboarding", "self-directed learning", "team training", "open-source documentation", "API reference"]
see_also = ["educational content strategy", "technical documentation", "developer relations", "knowledge base"]
date_created = "2026-02-22"
date_updated = "2026-02-22"
word_count = 1709
date_modified = "2026-02-23"
keywords = ["Learning", "Resource", "glossary", "education", "Prismatic Platform", "Learning Resource"]
image = "/images/sections/glossary.png"
image_alt = "Learning Resource - Prismatic Platform"
+++

## Definition

A Learning Resource is any self-contained unit of educational material that conveys specific knowledge, demonstrates a technique, or builds a skill. Learning resources encompass a broad taxonomy of content types: written documentation, step-by-step tutorials, annotated code examples, video walkthroughs, interactive exercises, quizzes, reference cards, architectural diagrams, and recorded conference talks. Each resource targets a specific learning objective at a defined difficulty level, and carries metadata that enables discovery, sequencing, and quality assessment. In the Prismatic Platform ecosystem, learning resources form the atomic building blocks from which learning paths, curricula, and documentation portals are constructed.

## Overview

Software platforms generate an enormous volume of knowledge: API signatures, architectural decisions, operational procedures, debugging techniques, performance tuning strategies, and domain-specific patterns. Without deliberate effort to package this knowledge into accessible, reusable learning resources, it remains trapped in the minds of experienced contributors or buried in commit messages and pull request descriptions.

The Prismatic Platform's promo site hosts over 1,800 markdown files across 18 sections, each functioning as a learning resource. These range from glossary definitions (like this one) to in-depth architectural analyses, agent documentation, command references, and OSINT tool guides. Each file carries structured metadata -- tags, categories, difficulty levels, reading times, quality scores, and cross-references -- that transforms raw content into a searchable, filterable, interconnected knowledge base.

The value of a learning resource is determined not by its mere existence but by its **discoverability** (can learners find it?), **quality** (is it accurate, current, and well-written?), **actionability** (can learners apply what they learn?), and **connectedness** (does it link to related resources that deepen understanding?). A brilliant tutorial that nobody can find provides zero value. A discoverable tutorial with outdated information provides negative value.

Effective learning resource management requires treating content as a first-class product with its own lifecycle: creation, review, publication, maintenance, deprecation, and archival. The Prismatic Platform applies the same engineering rigor to its educational content that it applies to its code -- quality gates, automated validation, cross-reference integrity checks, and regular refresh cycles.

## Technical Details

### Resource Data Model

Each learning resource in the platform is modeled with rich metadata that enables programmatic discovery and quality assessment:

```elixir
defmodule Prismatic.Education.Resource do
  @moduledoc """
  Represents a single learning resource with full metadata
  for discovery, quality scoring, and path integration.
  """

  @type resource_type ::
    :documentation
    | :tutorial
    | :code_example
    | :video
    | :exercise
    | :quiz
    | :reference_card
    | :diagram
    | :conference_talk
    | :blog_post

  @type difficulty :: :beginner | :intermediate | :advanced | :expert

  @type t :: %__MODULE__{
    id: String.t(),
    title: String.t(),
    description: String.t(),
    type: resource_type(),
    difficulty: difficulty(),
    tags: [String.t()],
    category: String.t(),
    author: String.t(),
    reading_time_minutes: non_neg_integer(),
    quality_score: non_neg_integer(),
    prerequisites: [String.t()],
    related_resources: [String.t()],
    content_path: String.t(),
    url: String.t() | nil,
    created_at: DateTime.t(),
    updated_at: DateTime.t(),
    status: :draft | :review | :published | :deprecated | :archived
  }

  defstruct [
    :id, :title, :description, :type, :difficulty,
    :tags, :category, :author, :reading_time_minutes,
    :quality_score, :prerequisites, :related_resources,
    :content_path, :url, :created_at, :updated_at, :status
  ]

  @doc """
  Calculates a composite quality score based on multiple criteria.
  Used by the promo content enhancer to prioritize resources for improvement.
  """
  @spec calculate_quality(t(), String.t()) :: non_neg_integer()
  def calculate_quality(%__MODULE__{} = resource, content) do
    word_count_score = score_word_count(content)
    section_score = score_sections(content)
    metadata_score = score_metadata(resource)
    xref_score = score_cross_references(content)

    word_count_score + section_score + metadata_score + xref_score
  end

  defp score_word_count(content) do
    word_count = content |> String.split(~r/\s+/) |> length()
    min(div(word_count, 30), 50)
  end

  defp score_sections(content) do
    section_count = content |> String.split(~r/^## /m) |> length() |> Kernel.-(1)
    min(section_count * 3, 25)
  end

  defp score_metadata(%{tags: tags, related_resources: related}) do
    tag_score = min(length(tags || []) * 2, 10)
    related_score = min(length(related || []) * 1, 5)
    tag_score + related_score
  end

  defp score_cross_references(content) do
    xref_count = Regex.scan(~r/@\//, content) |> length()
    min(xref_count * 2, 10)
  end
end
```

### Resource Registry with ETS-Backed Search

A registry enables fast lookup and filtering of resources across the entire content corpus:

```elixir
defmodule Prismatic.Education.ResourceRegistry do
  @moduledoc """
  ETS-backed registry for fast learning resource discovery.
  Supports filtering by type, difficulty, category, and tags.
  Rebuilds from content directory on application start.
  """

  use GenServer

  @table_name :learning_resources

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl GenServer
  def init(opts) do
    table = :ets.new(@table_name, [
      :set,
      :named_table,
      :protected,
      read_concurrency: true
    ])

    content_dir = Keyword.get(opts, :content_dir, "sites/promo/content")
    resource_count = index_content(table, content_dir)

    {:ok, %{table: table, content_dir: content_dir, count: resource_count}}
  end

  @spec search(keyword()) :: [Prismatic.Education.Resource.t()]
  def search(filters \\ []) do
    type_filter = Keyword.get(filters, :type)
    difficulty_filter = Keyword.get(filters, :difficulty)
    category_filter = Keyword.get(filters, :category)
    tag_filter = Keyword.get(filters, :tag)
    min_quality = Keyword.get(filters, :min_quality, 0)

    :ets.tab2list(@table_name)
    |> Enum.map(&elem(&1, 1))
    |> Enum.filter(fn resource ->
      (is_nil(type_filter) or resource.type == type_filter) and
      (is_nil(difficulty_filter) or resource.difficulty == difficulty_filter) and
      (is_nil(category_filter) or resource.category == category_filter) and
      (is_nil(tag_filter) or tag_filter in (resource.tags || [])) and
      resource.quality_score >= min_quality
    end)
    |> Enum.sort_by(& &1.quality_score, :desc)
  end

  @spec count_by_type() :: %{atom() => non_neg_integer()}
  def count_by_type do
    :ets.tab2list(@table_name)
    |> Enum.map(&elem(&1, 1))
    |> Enum.group_by(& &1.type)
    |> Enum.map(fn {type, resources} -> {type, length(resources)} end)
    |> Map.new()
  end

  defp index_content(table, content_dir) do
    Path.wildcard(Path.join(content_dir, "**/*.md"))
    |> Enum.reject(&String.ends_with?(&1, "_index.md"))
    |> Enum.map(&parse_resource/1)
    |> Enum.reject(&is_nil/1)
    |> Enum.each(fn resource ->
      :ets.insert(table, {resource.id, resource})
    end)
    |> then(fn _ -> :ets.info(table, :size) end)
  end
end
```

### Quality Gate for Content

Content quality is enforced through automated checks that run during the build process:

```elixir
defmodule Prismatic.Education.QualityGate do
  @moduledoc """
  Validates learning resource quality before publication.
  Enforces minimum standards for word count, metadata completeness,
  cross-reference validity, and structural consistency.
  """

  @type violation :: %{
    rule: String.t(),
    severity: :error | :warning | :info,
    message: String.t(),
    file: String.t()
  }

  @min_word_count 500
  @min_sections 3
  @required_metadata [:title, :description, :category, :status, :author]

  @spec validate(String.t(), map()) :: {:ok, non_neg_integer()} | {:error, [violation()]}
  def validate(content, frontmatter) do
    violations =
      []
      |> check_word_count(content)
      |> check_sections(content)
      |> check_metadata(frontmatter)
      |> check_cross_references(content)
      |> check_broken_links(content)

    errors = Enum.filter(violations, &(&1.severity == :error))

    if Enum.empty?(errors) do
      score = calculate_score(content, frontmatter, violations)
      {:ok, score}
    else
      {:error, violations}
    end
  end

  defp check_word_count(violations, content) do
    word_count = content |> String.split(~r/\s+/) |> length()

    if word_count < @min_word_count do
      [%{rule: "min_word_count", severity: :error,
         message: "Content has #{word_count} words, minimum is #{@min_word_count}"} | violations]
    else
      violations
    end
  end

  defp check_cross_references(violations, content) do
    refs = Regex.scan(~r/@\/glossary\/([^.]+)\.md/, content, capture: :all_but_first)
    |> List.flatten()

    invalid_refs = Enum.reject(refs, &resource_exists?/1)

    Enum.reduce(invalid_refs, violations, fn ref, acc ->
      [%{rule: "valid_xref", severity: :error,
         message: "Cross-reference to non-existent resource: #{ref}"} | acc]
    end)
  end
end
```

### Content Freshness Monitoring

A periodic check ensures resources remain current and accurate:

```elixir
defmodule Prismatic.Education.FreshnessMonitor do
  @moduledoc """
  Monitors learning resource freshness and flags stale content
  for review. Resources older than the configured threshold
  are surfaced in the quality dashboard.
  """

  use GenServer

  @stale_threshold_days 90
  @check_interval_ms :timer.hours(24)

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl GenServer
  def init(_opts) do
    schedule_check()
    {:ok, %{last_check: nil, stale_resources: []}}
  end

  @impl GenServer
  def handle_info(:check_freshness, state) do
    stale = find_stale_resources()

    if length(stale) > 0 do
      :telemetry.execute(
        [:prismatic, :education, :stale_content],
        %{count: length(stale)},
        %{resources: Enum.map(stale, & &1.id)}
      )
    end

    schedule_check()
    {:noreply, %{state | last_check: DateTime.utc_now(), stale_resources: stale}}
  end

  defp find_stale_resources do
    threshold = DateTime.add(DateTime.utc_now(), -@stale_threshold_days * 86400, :second)

    Prismatic.Education.ResourceRegistry.search()
    |> Enum.filter(fn resource ->
      DateTime.compare(resource.updated_at, threshold) == :lt
    end)
  end

  defp schedule_check do
    Process.send_after(self(), :check_freshness, @check_interval_ms)
  end
end
```

## Implementation

### Content Creation Workflow

Creating a high-quality learning resource follows a structured process:

1. **Identify the gap**: Review existing resources to confirm the topic is not already covered. Check the resource registry for related content that might need expansion rather than duplication.

2. **Define the learning objective**: Write a single sentence describing what the learner will know or be able to do after consuming this resource. This becomes the resource's description.

3. **Choose the format**: Select the content type that best serves the learning objective. Complex procedures benefit from step-by-step tutorials. API details suit reference documentation. Architectural concepts are best conveyed through diagrams paired with explanatory text.

4. **Write with metadata first**: Start with the frontmatter (TOML in Zola). Define title, tags, category, difficulty, related terms, and estimated reading time before writing content. This forces clarity of purpose.

5. **Structure with sections**: Use a consistent section structure. For glossary entries: Definition, Overview, Technical Details, Implementation, Comparison, Best Practices, Pitfalls, Use Cases, Related Concepts, See Also. For tutorials: Prerequisites, Goal, Steps, Verification, Next Steps.

6. **Add cross-references**: Link to related resources using `@/glossary/<slug>.md` syntax. Each resource should reference at least 8 related resources to build the knowledge graph.

7. **Validate before merge**: Run the quality gate to check word count, section structure, metadata completeness, and cross-reference validity.

### Metadata Schema for Zola

The platform uses TOML frontmatter in Zola markdown files. The standard metadata schema for learning resources is:

```toml
+++
title = "Resource Title"
weight = 50
[extra]
tags = ["tag1", "tag2", "tag3"]
description = "One-sentence description of what this resource teaches"
category = "architecture|education|security|operations|development"
status = "active|draft|deprecated"
author = "Tomas Korcak (korczis)"
reading_time = "N min"
difficulty = "beginner|intermediate|advanced|expert"
quality_score = 95
related_terms = ["slug-1", "slug-2"]
key_concepts = ["concept-1", "concept-2"]
use_cases = ["use-case-1", "use-case-2"]
date_created = "YYYY-MM-DD"
date_updated = "YYYY-MM-DD"
+++
```

### Automated Quality Enhancement

The `mix promo.enhance` task analyzes all learning resources and generates improvement recommendations:

```bash
# Analyze quality across all resources
mix promo.enhance

# Filter by section
mix promo.enhance --section glossary

# Show enhancement priorities
mix promo.enhance --dry-run

# Target minimum quality score
mix promo.enhance --min-quality 75
```

## Comparison

### Learning Resource vs. Documentation

Documentation is the superset; learning resources are the pedagogically structured subset. Raw API documentation lists function signatures and return types. A learning resource wraps that information in context, examples, and guided exercises that build understanding progressively.

### Learning Resource vs. Blog Post

Blog posts are time-bound, opinion-driven, and audience-general. Learning resources are maintained, objective, and audience-specific. A blog post announces a new feature; a learning resource teaches how to use it effectively. Blog posts age; learning resources are updated.

### Learning Resource vs. Code Comment

Code comments explain the "why" of a specific implementation at the point of use. Learning resources explain concepts, patterns, and techniques independently of any single code location. Both are valuable; they serve different contexts of need.

### Learning Resource vs. Stack Overflow Answer

Stack Overflow answers solve specific problems in isolation. Learning resources provide systematic coverage of a topic, connecting individual problems to broader patterns. A Stack Overflow answer tells you how to fix a particular error; a learning resource teaches you why the error occurs and how to prevent it.

### Learning Resource vs. Conference Talk

Conference talks are time-limited, linear presentations optimized for a live audience. Learning resources are self-paced, non-linear, and optimized for reference and re-reading. A conference talk can introduce a concept compellingly; a learning resource provides the depth needed for mastery.

## Best Practices

1. **Write for scanning first, reading second**: Use clear headings, bullet points, code blocks, and tables. Developers scan for relevance before committing to read. If they cannot determine relevance in 10 seconds, they move on.

2. **Lead with a working example**: Start code-heavy resources with a complete, runnable example, then explain it. Developers learn better from concrete examples than from abstract descriptions.

3. **One concept per resource**: Resist the temptation to cover everything. A resource that tries to teach GenServer, ETS, and Telemetry in one page teaches none of them well.

4. **Use consistent terminology**: Define terms precisely and use them consistently. If the platform calls it a "storage adapter," never call it a "data connector" or "persistence driver" in the same resource.

5. **Include error cases**: Show what happens when things go wrong, not just the happy path. Developers spend more time debugging than coding; resources that address failure modes are disproportionately valuable.

6. **Tag exhaustively**: Every relevant tag increases discoverability. A resource about GenServer should be tagged with "genserver," "otp," "concurrency," "state-management," and "elixir" at minimum.

7. **Maintain a freshness schedule**: Set a review date for every resource. Technologies evolve; a resource that was accurate six months ago may be misleading today.

8. **Cross-reference generously**: Every resource should link to at least 8 related resources. This builds the knowledge graph and helps learners discover content they did not know they needed.

## Common Pitfalls

1. **Creating without maintaining**: The most common failure mode. A burst of content creation followed by years of neglect produces a graveyard of stale resources that actively mislead learners.

2. **Duplicating instead of linking**: Two resources that cover overlapping material will inevitably diverge, leaving learners confused about which is authoritative. Link to existing resources instead of rewriting their content.

3. **Optimizing for completeness over clarity**: A 10,000-word resource that covers every edge case is less useful than a 2,000-word resource that covers the common cases clearly and links to advanced material.

4. **Missing metadata**: A resource without tags, difficulty level, and category is invisible to search and filtering. Metadata is not optional; it is the resource's interface to the discovery system.

5. **Assuming context**: Writing resources that assume the reader has been following a specific learning path. Every resource should be comprehensible independently, even if it links to prerequisite resources.

6. **Code examples that do not compile**: Nothing destroys trust faster than a code example that produces errors when copied into a project. All code examples should be tested against the current platform version.

7. **Ignoring the audience**: Writing for experts when the target audience is beginners, or vice versa. The difficulty metadata exists for a reason -- respect it in the content.

8. **No feedback channel**: Resources without a way for learners to report errors, ask questions, or suggest improvements stagnate. Include a link to the issue tracker or discussion forum.

## Use Cases

### Platform Glossary

The Prismatic Platform glossary contains 400+ learning resources that define technical terms, architectural concepts, and domain-specific vocabulary. Each glossary entry serves as both a reference and a teaching tool, with definitions, code examples, comparisons, and cross-references.

### Agent Documentation

Each of the 530+ AIAD agents has a corresponding learning resource that describes its purpose, capabilities, configuration, usage examples, and relationship to other agents. These resources enable developers to discover and use agents without reading source code.

### Command Reference

The 225 AIAD commands are documented as learning resources with consistent structure: synopsis, description, options, examples, and related commands. This consistency enables both human browsing and programmatic tool integration.

### OSINT Tool Guides

The 120 OSINT tools exposed through the platform UI each have a learning resource explaining the data source, query parameters, response format, rate limits, and practical use cases. These guides transform raw API wrappers into actionable intelligence tools.

### Architecture Decision Records

Architectural decisions are documented as learning resources that explain the context, decision, consequences, and alternatives considered. These serve as both historical record and teaching material for new team members.

## Related Concepts

Learning resources connect to a broad ecosystem of educational and knowledge management concepts:

- [Learning Path](@/glossary/learning-path.md) -- structured sequences of learning resources organized for progressive skill development
- [Documentation](@/glossary/documentation.md) -- the broader category of written technical material that includes learning resources
- [Curriculum](@/glossary/curriculum.md) -- comprehensive educational programs composed of multiple learning paths and resources
- [Developer Experience](@/glossary/developer-experience.md) -- the holistic quality of developer interaction with a platform, heavily shaped by available learning resources
- [Code Example](@/glossary/code-example.md) -- executable code snippets that demonstrate concepts, a key component of effective learning resources
- [Reference Documentation](@/glossary/reference-documentation.md) -- comprehensive API and module documentation serving as authoritative learning resources
- [Developer Portal](@/glossary/developer-portal.md) -- centralized hub where learning resources are organized, searchable, and accessible
- [Knowledge Graph](@/glossary/knowledge-graph.md) -- the interconnected network of concepts that cross-referenced learning resources collectively form
- [Progressive Disclosure](@/glossary/progressive-disclosure.md) -- the principle of revealing complexity gradually, applied to resource difficulty progression
- [Mentorship](@/glossary/mentorship.md) -- human guidance that supplements learning resources with personalized context and feedback

## See Also

- [Technical Vocabulary](@/glossary/technical-vocabulary.md) -- standardized terminology that learning resources must use consistently
- [Quality Assurance](@/glossary/quality-assurance.md) -- processes that ensure learning resources meet minimum quality standards
- [Community Engagement](@/glossary/community-engagement.md) -- community practices that drive learning resource creation and improvement
- [Open Source](@/glossary/open-source.md) -- the model under which Prismatic Platform learning resources are publicly shared
- [Workshop Facilitation](@/glossary/workshop-facilitation.md) -- live teaching sessions that complement written learning resources

---

*Built with precision. Ready for the future.*

**[Prismatic Platform](https://github.com/korczis/prismatic-platform)** | Created by [Tomas Korcak (korczis)](https://github.com/korczis) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
