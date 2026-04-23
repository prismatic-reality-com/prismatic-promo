+++
title = "Prerequisite"
weight = 50
[extra]
description = "Learning path dependency defining required knowledge or skill mastery before advancing to a topic"
category = "academy"
related_terms = ["progress", "semantic-link", "semantic-linking", "quality-floor", "process"]
complexity_level = "beginner"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-24"
keywords = ["prerequisite", "learning path", "dependency", "academy", "education", "glossary", "Prismatic Platform"]
tags = ["glossary", "academy", "learning", "education"]
quality_score = 76
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Prerequisite - Prismatic Platform"
+++

## Definition & Overview

A prerequisite is a dependency relationship in a learning system that specifies which topics, skills, or competencies a learner must have mastered before they can meaningfully engage with a subsequent topic. Prerequisites encode the logical ordering of knowledge acquisition -- you cannot understand supervision trees without first understanding processes, and you cannot grasp property-based testing without understanding conventional unit testing.

In educational theory, prerequisites serve two functions: they ensure learners have the cognitive scaffolding needed to absorb new material, and they prevent frustration and disengagement that results from attempting material beyond current capability. Well-designed prerequisite chains create a directed acyclic graph (DAG) of learning progression, where each node represents a topic and each edge represents a "must precede" relationship.

The Prismatic Academy implements prerequisites as first-class metadata in its self-registering topic system. Each topic module declares its prerequisites as a list of topic slugs, and the InterconnectionEngine validates that these prerequisites form a valid DAG (no circular dependencies). The prerequisite graph drives the Academy's adaptive learning paths, where learners are guided through topics in an order that respects dependency relationships while allowing flexibility for parallel topics with no dependency between them.

## Technical Deep Dive

Prerequisites in the Prismatic Academy are declared within the topic registration configuration. The `@after_compile` hook in the `PrismaticAcademy.Topic` behaviour validates that all referenced prerequisites exist in the TopicRegistry, catching dangling references at compile time rather than runtime.

```elixir
defmodule PrismaticAcademy.Topics.AdvancedThreatHunting do
  use PrismaticAcademy.Topic

  register_topic(%{
    slug: "advanced-threat-hunting",
    title: "Advanced Threat Hunting",
    category: :security,
    difficulty: :advanced,
    duration_minutes: 90,
    prerequisites: ["osint-signal-synthesis", "social-media-osint"],
    learning_objectives: [
      "Apply the HUNTER framework to identify advanced persistent threats",
      "Correlate multi-source intelligence for threat attribution",
      "Develop hunting hypotheses from behavioral indicators"
    ],
    skills_gained: ["threat-hunting", "indicator-correlation", "hypothesis-driven-analysis"]
  })

  @impl true
  def content do
    # Topic content implementation
  end
end
```

The InterconnectionEngine builds and validates the prerequisite graph using Erlang's `:digraph` module. The graph is maintained in memory and supports queries like "what are all transitive prerequisites for topic X" and "what topics become available after completing topic Y".

```elixir
defmodule PrismaticAcademy.PrerequisiteGraph do
  @moduledoc """
  DAG-based prerequisite validation and learning path computation
  using Erlang's :digraph module for cycle detection and
  topological ordering.
  """

  @type topic_slug :: String.t()

  @spec build(list(map())) :: {:ok, :digraph.graph()} | {:error, :cyclic_dependency}
  def build(topics) do
    graph = :digraph.new([:acyclic])

    Enum.each(topics, fn topic ->
      :digraph.add_vertex(graph, topic.slug, topic)
    end)

    result =
      Enum.reduce_while(topics, :ok, fn topic, :ok ->
        prereq_results =
          Enum.map(topic.prerequisites || [], fn prereq_slug ->
            case :digraph.add_edge(graph, prereq_slug, topic.slug) do
              {:error, {:bad_edge, _}} -> {:error, :cyclic_dependency}
              {:error, {:bad_vertex, v}} -> {:error, {:missing_prerequisite, v}}
              _ -> :ok
            end
          end)

        case Enum.find(prereq_results, &match?({:error, _}, &1)) do
          nil -> {:cont, :ok}
          error -> {:halt, error}
        end
      end)

    case result do
      :ok -> {:ok, graph}
      error -> error
    end
  end

  @spec transitive_prerequisites(:digraph.graph(), topic_slug()) :: [topic_slug()]
  def transitive_prerequisites(graph, topic_slug) do
    :digraph_utils.reaching([topic_slug], graph)
    |> List.delete(topic_slug)
    |> topological_sort(graph)
  end

  @spec available_topics(:digraph.graph(), MapSet.t(topic_slug())) :: [topic_slug()]
  def available_topics(graph, completed_topics) do
    :digraph.vertices(graph)
    |> Enum.filter(fn vertex ->
      not MapSet.member?(completed_topics, vertex) and
        prerequisites_met?(graph, vertex, completed_topics)
    end)
  end

  defp prerequisites_met?(graph, vertex, completed) do
    :digraph.in_neighbours(graph, vertex)
    |> Enum.all?(&MapSet.member?(completed, &1))
  end

  defp topological_sort(vertices, graph) do
    full_order = :digraph_utils.topsort(graph)
    vertex_set = MapSet.new(vertices)
    Enum.filter(full_order, &MapSet.member?(vertex_set, &1))
  end
end
```

## Architecture & Implementation

The prerequisite system integrates with the Academy's ProgressTracker and SessionManager GenServers. When a learner attempts to start a topic, the system checks their completion history against the topic's prerequisite chain. If prerequisites are unmet, the UI presents the missing prerequisites as suggested next steps rather than blocking access entirely, supporting self-directed learning.

The prerequisite graph is computed once at application startup and cached in the InterconnectionEngine's state. Topic additions (via the self-registering metaprogramming system) trigger graph recomputation. The graph supports both strict prerequisites (must be completed) and recommended prerequisites (suggested but not required), encoded through a priority field in the dependency edge.

Learning path generation uses topological sorting of the prerequisite DAG to produce valid ordering suggestions. When multiple valid orderings exist (parallel topics), the system considers learner preferences, estimated difficulty, and time constraints to recommend the optimal path.

## Usage in Prismatic Platform

Prerequisites drive the Academy dashboard's topic filtering and recommendation engine. The LiveView interface displays prerequisite status for each topic, showing completed, in-progress, and missing prerequisites with visual indicators.

```elixir
defmodule PrismaticWeb.Academy.TopicPrerequisitesComponent do
  use Phoenix.Component

  attr :topic, :map, required: true
  attr :completed_topics, :any, required: true

  def prerequisite_status(assigns) do
    prereqs = assigns.topic.prerequisites || []

    statuses =
      Enum.map(prereqs, fn slug ->
        completed = MapSet.member?(assigns.completed_topics, slug)
        topic = PrismaticAcademy.TopicRegistry.get_by_slug(slug)
        %{slug: slug, title: topic && topic.title || slug, completed: completed}
      end)

    all_met = Enum.all?(statuses, & &1.completed)

    assigns =
      assigns
      |> assign(:statuses, statuses)
      |> assign(:all_met, all_met)

    ~H"""
    <div class="space-y-2">
      <h4 class="text-sm font-medium text-gray-400">Prerequisites</h4>
      <%= for status <- @statuses do %>
        <div class="flex items-center gap-2">
          <span class={if status.completed, do: "text-green-400", else: "text-yellow-400"}>
            <%= if status.completed, do: "Completed", else: "Required" %>
          </span>
          <span class="text-gray-300"><%= status.title %></span>
        </div>
      <% end %>
    </div>
    """
  end
end
```

## Cross-References

- [Progress](/glossary/progress/) - Completion tracking that validates prerequisite satisfaction
- **Semantic Link** - Knowledge graph connections complementing prerequisite edges
- **Semantic Linking** - Interconnection engine that validates prerequisite DAGs
- **Self-Registration** - Metaprogramming pattern through which topics declare prerequisites
- **Process** - BEAM execution unit -- a common prerequisite topic in the Academy

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
