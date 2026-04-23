+++
title = "Interconnection"
weight = 50
[extra]
description = "Semantic linking system that discovers and maintains relationships between topics, concepts, and knowledge nodes in a knowledge graph."
category = "ai-ml"
related_terms = ["knowledge-graph", "topic", "academy", "graph-database"]
complexity_level = "advanced"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["interconnection", "semantic linking", "knowledge graph", "topic relationships", "glossary", "Prismatic Platform"]
tags = ["glossary", "ai-ml"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Interconnection - Prismatic Platform"
+++

## Definition & Overview

Interconnection refers to the semantic linking of knowledge nodes, topics, or concepts within a structured knowledge system. Unlike simple hyperlinks or foreign key relationships, semantic interconnections carry meaning about the nature, strength, and directionality of relationships between entities. An interconnection says not just that A relates to B, but how they relate (prerequisite, extension, complement, contradiction) and with what confidence.

In knowledge management and educational systems, interconnections enable learning path generation, prerequisite validation, knowledge gap identification, and concept clustering. They transform a flat collection of topics into a navigable knowledge graph where learners can discover related material, understand dependencies, and build mental models of complex domains. The quality of interconnections directly determines the usefulness of the knowledge system.

The Prismatic Platform's Academy module implements a sophisticated interconnection engine that automatically discovers relationships between topics based on shared keywords, category proximity, difficulty progression, and content similarity. This engine powers the Academy's learning path recommendations, prerequisite chains, and the visual knowledge map that helps learners navigate 50+ security and OSINT topics.

## Technical Deep Dive

The InterconnectionEngine in PrismaticAcademy is a GenServer that maintains a directed graph of topic relationships using Erlang's `:digraph` module. Each edge in the graph carries metadata including the relationship type (prerequisite, extension, complement, alternative), a weight indicating relationship strength (0.0 to 1.0), and the discovery method (manual, keyword-based, category-based, or content-similarity).

The discovery algorithm operates in three phases. First, keyword overlap analysis compares each topic pair's keyword sets using Jaccard similarity, creating edges for pairs exceeding a configurable threshold. Second, category and difficulty analysis links topics within the same category by difficulty progression (beginner -> intermediate -> advanced creates prerequisite edges). Third, content-based analysis uses TF-IDF vectors to identify semantically similar topics that may not share explicit keywords.

```elixir
defmodule PrismaticAcademy.InterconnectionEngine do
  @moduledoc """
  Discovers and maintains semantic interconnections between
  Academy topics using graph-based analysis.
  """

  use GenServer

  @type interconnection :: %{
    from: String.t(),
    to: String.t(),
    type: :prerequisite | :extension | :complement | :alternative,
    weight: float(),
    method: :keyword | :category | :content | :manual
  }

  # Client API

  @spec discover_interconnections() :: {:ok, non_neg_integer()}
  def discover_interconnections do
    GenServer.call(__MODULE__, :discover, 30_000)
  end

  @spec get_related(String.t(), keyword()) :: {:ok, [interconnection()]}
  def get_related(topic_slug, opts \\ []) do
    GenServer.call(__MODULE__, {:get_related, topic_slug, opts})
  end

  @spec shortest_path(String.t(), String.t()) :: {:ok, [String.t()]} | {:error, :no_path}
  def shortest_path(from_slug, to_slug) do
    GenServer.call(__MODULE__, {:shortest_path, from_slug, to_slug})
  end

  # Server Implementation

  @impl GenServer
  def init(_opts) do
    graph = :digraph.new([:acyclic])
    {:ok, %{graph: graph, interconnections: %{}}, {:continue, :initial_discovery}}
  end

  @impl GenServer
  def handle_continue(:initial_discovery, state) do
    topics = PrismaticAcademy.TopicRegistry.all()
    new_state = build_graph(state, topics)
    {:noreply, new_state}
  end

  defp build_graph(state, topics) do
    # Phase 1: Add all topics as vertices
    Enum.each(topics, fn topic ->
      :digraph.add_vertex(state.graph, topic.slug, topic)
    end)

    # Phase 2: Discover keyword-based interconnections
    keyword_edges = discover_keyword_interconnections(topics)

    # Phase 3: Discover category-progression interconnections
    category_edges = discover_category_interconnections(topics)

    all_edges = keyword_edges ++ category_edges

    Enum.each(all_edges, fn edge ->
      :digraph.add_edge(state.graph, edge.from, edge.to, edge)
    end)

    %{state | interconnections: Map.new(all_edges, &{{&1.from, &1.to}, &1})}
  end

  defp discover_keyword_interconnections(topics) do
    for t1 <- topics,
        t2 <- topics,
        t1.slug != t2.slug,
        similarity = jaccard_similarity(t1.keywords, t2.keywords),
        similarity > 0.3 do
      %{
        from: t1.slug,
        to: t2.slug,
        type: :complement,
        weight: similarity,
        method: :keyword
      }
    end
  end

  defp jaccard_similarity(set_a, set_b) do
    a = MapSet.new(set_a)
    b = MapSet.new(set_b)
    intersection = MapSet.intersection(a, b) |> MapSet.size()
    union = MapSet.union(a, b) |> MapSet.size()

    if union == 0, do: 0.0, else: intersection / union
  end
end
```

The graph structure enables powerful queries: finding all prerequisites for a topic (transitive closure of prerequisite edges), identifying knowledge clusters (connected components), computing the shortest learning path between any two topics, and detecting circular dependencies (which indicate modeling errors).

## Architecture & Implementation

The InterconnectionEngine is part of the Academy's OTP supervision tree, started after the TopicRegistry to ensure all topics are available before interconnection discovery begins. It uses `:digraph` with the `:acyclic` option for prerequisite relationships (preventing circular prerequisites) while maintaining a separate unrestricted graph for complement and alternative relationships.

Interconnection data is persisted in ETS for sub-millisecond access during LiveView rendering. The discovery process runs at startup and can be triggered on-demand when new topics are registered. The engine emits telemetry events for monitoring discovery performance and interconnection graph statistics.

The Academy LiveView dashboard consumes interconnection data to render visual topic maps, prerequisite chains, and "related topics" sidebars. The interconnection navigator Alpine.js component provides client-side graph exploration with expand/collapse behavior, making it possible to explore the full knowledge graph interactively without server round-trips for each navigation step.

## Usage in Prismatic Platform

LiveView integration consumes interconnections for navigation:

```elixir
defmodule PrismaticWeb.Academy.TopicDetailLive do
  use PrismaticWeb, :live_view

  alias PrismaticAcademy.InterconnectionEngine
  alias PrismaticAcademy.TopicRegistry

  @impl Phoenix.LiveView
  def mount(%{"slug" => slug}, _session, socket) do
    case TopicRegistry.get(slug) do
      {:ok, topic} ->
        {:ok, related} = InterconnectionEngine.get_related(slug, limit: 10)

        prerequisites =
          related
          |> Enum.filter(&(&1.type == :prerequisite))
          |> Enum.sort_by(& &1.weight, :desc)

        complements =
          related
          |> Enum.filter(&(&1.type == :complement))
          |> Enum.sort_by(& &1.weight, :desc)
          |> Enum.take(5)

        socket =
          socket
          |> assign(topic: topic)
          |> assign(prerequisites: prerequisites)
          |> assign(complements: complements)
          |> assign(page_title: topic.name)

        {:ok, socket}

      {:error, :not_found} ->
        {:ok, push_navigate(socket, to: ~p"/academy")}
    end
  end
end
```

The interconnection system bridges the Academy, OSINT, and Glossary subsystems, creating a unified knowledge layer across the platform. Glossary terms link to Academy topics they explain, OSINT tools link to topics that teach their usage, and Academy topics reference specific tools and terminology, forming a rich interconnected learning ecosystem.

## Cross-References

- [Knowledge Graph](@/glossary/knowledge-graph.md) - Underlying data structure for interconnections
- **Topic** - Academy knowledge units connected by interconnections
- [Graph Database](@/glossary/graph-database.md) - Persistent storage for complex relationship graphs
- **Academy** - Primary consumer of interconnection data
- [ETS](@/glossary/ets.md) - In-memory storage for fast interconnection lookups

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
