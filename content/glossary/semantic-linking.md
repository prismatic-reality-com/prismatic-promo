+++
title = "Semantic Linking"
weight = 50
[extra]
description = "Topic interconnection engine that automatically discovers and maintains meaningful relationships between Academy content"
category = "knowledge"
related_terms = ["semantic-link", "prerequisite", "progress", "self-registration", "process"]
complexity_level = "advanced"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-24"
keywords = ["semantic linking", "interconnection", "knowledge graph", "topic discovery", "Academy", "glossary", "Prismatic Platform"]
tags = ["glossary", "knowledge", "academy", "graph"]
quality_score = 78
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Semantic Linking - Prismatic Platform"
+++

## Definition & Overview

Semantic linking is the automated process of discovering, creating, and maintaining meaningful connections between knowledge artifacts in a structured content system. Unlike manual cross-referencing (where authors explicitly create links), semantic linking analyzes the metadata, content, and structure of artifacts to identify relationships algorithmically. This automation ensures that the knowledge graph remains comprehensive and current as content evolves, without requiring human curation for every connection.

The Prismatic Academy's InterconnectionEngine is the platform's semantic linking implementation. It operates on the self-registered topic metadata (categories, skills, keywords, prerequisites, difficulty levels) to compute multi-dimensional similarity between topics and generate semantic links above configurable thresholds. The engine maintains its link graph using Erlang's `:digraph` module and exposes traversal queries for the recommendation system, learning path generator, and dashboard navigation.

Semantic linking goes beyond simple keyword matching. The engine considers hierarchical relationships (a topic in the "security" category is semantically closer to "compliance" than to "data visualization"), skill adjacency (topics sharing prerequisite skills are likely related), and difficulty progression (an advanced topic extending a beginner topic has a natural semantic link). These multi-signal similarity computations produce richer, more useful connections than any single-dimension matching could provide.

## Technical Deep Dive

The InterconnectionEngine is a GenServer that builds and maintains the semantic link graph. It listens for topic registration events and recomputes affected links when topics are added, modified, or removed.

```elixir
defmodule PrismaticAcademy.InterconnectionEngine do
  @moduledoc """
  Semantic linking engine that automatically discovers and
  maintains relationships between Academy topics based on
  multi-dimensional similarity analysis.
  """

  use GenServer

  @ets_interconnections :academy_interconnections
  @ets_search_index :academy_search_index

  @similarity_threshold 0.3

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    :ets.new(@ets_interconnections, [:named_table, :bag, :public, read_concurrency: true])
    :ets.new(@ets_search_index, [:named_table, :set, :public, read_concurrency: true])

    graph = :digraph.new()
    build_initial_graph(graph)

    {:ok, %{graph: graph, link_count: 0}}
  end

  @spec compute_links([map()]) :: [PrismaticAcademy.SemanticLink.t()]
  def compute_links(topics) do
    for topic_a <- topics,
        topic_b <- topics,
        topic_a.slug != topic_b.slug,
        link <- compute_pair_links(topic_a, topic_b),
        link.weight >= @similarity_threshold do
      link
    end
    |> Enum.uniq_by(fn l -> {l.source, l.target, l.type} end)
  end

  defp compute_pair_links(topic_a, topic_b) do
    links = []

    # Category similarity
    if topic_a.category == topic_b.category do
      links = [PrismaticAcademy.SemanticLink.new(
        topic_a.slug, topic_b.slug, :same_category, 0.5,
        %{reason: "shared category: #{topic_a.category}"}
      ) | links]
    end

    # Shared skills
    shared_skills = shared_list(
      topic_a[:skills_gained] || [],
      topic_b[:skills_gained] || []
    )

    if length(shared_skills) > 0 do
      weight = min(length(shared_skills) * 0.2, 0.8)
      links = [PrismaticAcademy.SemanticLink.new(
        topic_a.slug, topic_b.slug, :shared_skill, weight,
        %{shared_skills: shared_skills}
      ) | links]
    end

    # Keyword overlap
    keyword_sim = jaccard_similarity(
      topic_a[:keywords] || [],
      topic_b[:keywords] || []
    )

    if keyword_sim > 0.2 do
      links = [PrismaticAcademy.SemanticLink.new(
        topic_a.slug, topic_b.slug, :related, keyword_sim,
        %{reason: "keyword similarity"}
      ) | links]
    end

    # Difficulty progression
    if adjacent_difficulty?(topic_a, topic_b) and topic_a.category == topic_b.category do
      links = [PrismaticAcademy.SemanticLink.new(
        topic_a.slug, topic_b.slug, :extends, 0.6,
        %{reason: "difficulty progression within category"}
      ) | links]
    end

    # Explicit prerequisites
    if topic_a.slug in (topic_b[:prerequisites] || []) do
      links = [PrismaticAcademy.SemanticLink.new(
        topic_a.slug, topic_b.slug, :prerequisite, 1.0,
        %{reason: "explicit prerequisite"}
      ) | links]
    end

    links
  end

  @spec get_graph() :: :digraph.graph()
  def get_graph do
    GenServer.call(__MODULE__, :get_graph)
  end

  @impl true
  def handle_call(:get_graph, _from, state) do
    {:reply, state.graph, state}
  end

  defp shared_list(list_a, list_b) do
    set_a = MapSet.new(list_a)
    set_b = MapSet.new(list_b)
    MapSet.intersection(set_a, set_b) |> MapSet.to_list()
  end

  defp jaccard_similarity(list_a, list_b) when list_a == [] or list_b == [], do: 0.0

  defp jaccard_similarity(list_a, list_b) do
    set_a = MapSet.new(list_a)
    set_b = MapSet.new(list_b)
    intersection = MapSet.intersection(set_a, set_b) |> MapSet.size()
    union = MapSet.union(set_a, set_b) |> MapSet.size()
    if union > 0, do: intersection / union, else: 0.0
  end

  defp adjacent_difficulty?(topic_a, topic_b) do
    order = %{beginner: 0, intermediate: 1, advanced: 2, expert: 3}
    diff = Map.get(order, topic_b.difficulty, 0) - Map.get(order, topic_a.difficulty, 0)
    diff == 1
  end

  defp build_initial_graph(graph) do
    topics = PrismaticAcademy.TopicRegistry.list_all()
    links = compute_links(topics)

    topics_slugs = Enum.map(topics, & &1.slug) |> Enum.uniq()
    Enum.each(topics_slugs, &:digraph.add_vertex(graph, &1))

    Enum.each(links, fn link ->
      :digraph.add_edge(graph, link.source, link.target, link)
    end)
  end
end
```

## Architecture & Implementation

The semantic linking architecture operates in two modes: batch (computing all links from scratch during initialization or major updates) and incremental (updating affected links when individual topics change). The batch mode runs at startup, building the complete link graph from all registered topics. The incremental mode responds to PubSub events from the TopicRegistry, recomputing links only for the changed topic.

The engine maintains three ETS tables: `interconnections` (bag table for link storage), `search_index` (set table for keyword-to-topic mappings), and the in-memory `:digraph` for traversal queries. This multi-index approach supports both direct link lookups (given topic A, find all links) and reverse lookups (given a keyword, find related topics).

The InterconnectionEngine is part of the Academy's supervision tree, starting after the TopicRegistry to ensure all topics are registered before link computation begins. This ordering guarantees that the initial link graph is complete.

## Usage in Prismatic Platform

The semantic linking engine powers the Academy's recommendation system, learning path generator, and topic navigation. The LiveView dashboard displays interconnection visualizations showing topic clusters and relationship types.

```elixir
defmodule PrismaticWeb.Academy.InterconnectionLive do
  use PrismaticWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    graph = PrismaticAcademy.InterconnectionEngine.get_graph()
    topics = PrismaticAcademy.TopicRegistry.list_all()

    nodes = Enum.map(topics, fn t ->
      %{id: t.slug, label: t.title, category: t.category}
    end)

    edges =
      :digraph.edges(graph)
      |> Enum.map(fn edge ->
        {_, source, target, label} = :digraph.edge(graph, edge)
        %{source: source, target: target, type: label.type, weight: label.weight}
      end)

    socket =
      socket
      |> assign(:nodes, nodes)
      |> assign(:edges, edges)
      |> assign(:total_links, length(edges))

    {:ok, socket}
  end
end
```

## Cross-References

- [Semantic Link](@/glossary/semantic-link.md) - Individual connections created by the semantic linking engine
- [Prerequisite](@/glossary/prerequisite.md) - Explicit link type handled by the interconnection engine
- [Progress](@/glossary/progress.md) - Completion tracking using semantic link-based learning paths
- [Self-Registration](@/glossary/self-registration.md) - Source of topic metadata driving automatic link generation
- [Process](@/glossary/process.md) - GenServer process implementing the InterconnectionEngine

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
