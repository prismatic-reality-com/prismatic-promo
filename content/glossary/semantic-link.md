+++
title = "Semantic Link"
weight = 50
[extra]
description = "Typed knowledge graph connection expressing meaningful relationships between concepts with metadata and provenance"
category = "knowledge"
related_terms = ["semantic-linking", "prerequisite", "progress", "provenance", "self-registration"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-24"
keywords = ["semantic link", "knowledge graph", "relationship", "ontology", "connection", "glossary", "Prismatic Platform"]
tags = ["glossary", "knowledge", "graph", "ontology"]
quality_score = 77
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Semantic Link - Prismatic Platform"
+++

## Definition & Overview

A semantic link is a typed, directed connection between two concepts in a knowledge graph that expresses a meaningful relationship beyond simple association. Unlike hyperlinks (which merely connect documents) or foreign keys (which enforce referential integrity), semantic links carry relationship type information, metadata, and provenance that enable reasoning about the connection itself. A semantic link from "OSINT Signal Synthesis" to "Social Media OSINT" with type `prerequisite` and weight `0.9` expresses not just that these topics are connected, but how they are connected, how strongly, and why.

Semantic links form the edges of knowledge graphs used for ontology representation, recommendation systems, and intelligent navigation. In educational platforms, semantic links between topics enable learning path computation, prerequisite validation, and "related topics" recommendations. In intelligence platforms, semantic links between entities enable relationship mapping, network analysis, and pattern discovery.

The Prismatic Platform implements semantic links in the Academy's InterconnectionEngine, where they connect topics based on shared categories, skills, keywords, and explicitly declared prerequisites. The DD pipeline uses semantic links to represent relationships between entities (business ownership, political association, organizational hierarchy). The glossary itself is a network of semantic links, where each cross-reference represents a typed relationship between terms.

## Technical Deep Dive

Semantic links in the Prismatic Platform are represented as typed structs with source, target, relationship type, weight, and metadata. The InterconnectionEngine builds and maintains the link graph using Erlang's `:digraph` module.

```elixir
defmodule PrismaticAcademy.SemanticLink do
  @moduledoc """
  Typed semantic connection between Academy topics
  expressing relationships with weight and metadata.
  """

  @type link_type ::
    :prerequisite
    | :related
    | :extends
    | :complements
    | :applies_to
    | :derived_from
    | :same_category
    | :shared_skill

  @type t :: %__MODULE__{
    source: String.t(),
    target: String.t(),
    type: link_type(),
    weight: float(),
    metadata: map(),
    created_at: DateTime.t()
  }

  defstruct [:source, :target, :type, :weight, :metadata, :created_at]

  @spec new(String.t(), String.t(), link_type(), float(), map()) :: t()
  def new(source, target, type, weight \\ 1.0, metadata \\ %{}) do
    %__MODULE__{
      source: source,
      target: target,
      type: type,
      weight: weight,
      metadata: metadata,
      created_at: DateTime.utc_now()
    }
  end

  @spec bidirectional?(link_type()) :: boolean()
  def bidirectional?(:related), do: true
  def bidirectional?(:complements), do: true
  def bidirectional?(:same_category), do: true
  def bidirectional?(:shared_skill), do: true
  def bidirectional?(_), do: false
end
```

The link graph supports traversal queries that find related topics, compute similarity scores, and discover connection paths between distant concepts.

```elixir
defmodule PrismaticAcademy.LinkGraph do
  @moduledoc """
  Graph operations on semantic links supporting traversal,
  similarity computation, and path discovery.
  """

  @type graph :: :digraph.graph()

  @spec build([PrismaticAcademy.SemanticLink.t()]) :: graph()
  def build(links) do
    graph = :digraph.new()

    vertices = links |> Enum.flat_map(fn l -> [l.source, l.target] end) |> Enum.uniq()
    Enum.each(vertices, &:digraph.add_vertex(graph, &1))

    Enum.each(links, fn link ->
      :digraph.add_edge(graph, link.source, link.target, link)

      if PrismaticAcademy.SemanticLink.bidirectional?(link.type) do
        reverse = %{link | source: link.target, target: link.source}
        :digraph.add_edge(graph, link.target, link.source, reverse)
      end
    end)

    graph
  end

  @spec related(graph(), String.t(), keyword()) :: [{String.t(), float()}]
  def related(graph, topic_slug, opts \\ []) do
    max_depth = Keyword.get(opts, :depth, 2)
    link_types = Keyword.get(opts, :types, :all)

    neighbors = find_reachable(graph, topic_slug, max_depth, link_types)

    neighbors
    |> Enum.reject(fn {slug, _} -> slug == topic_slug end)
    |> Enum.sort_by(fn {_, weight} -> weight end, :desc)
  end

  @spec shortest_path(graph(), String.t(), String.t()) :: [String.t()] | nil
  def shortest_path(graph, source, target) do
    :digraph.get_short_path(graph, source, target)
  end

  @spec similarity(graph(), String.t(), String.t()) :: float()
  def similarity(graph, slug_a, slug_b) do
    neighbors_a = :digraph.out_neighbours(graph, slug_a) |> MapSet.new()
    neighbors_b = :digraph.out_neighbours(graph, slug_b) |> MapSet.new()

    intersection = MapSet.intersection(neighbors_a, neighbors_b) |> MapSet.size()
    union = MapSet.union(neighbors_a, neighbors_b) |> MapSet.size()

    if union > 0, do: intersection / union, else: 0.0
  end

  defp find_reachable(graph, start, max_depth, link_types) do
    do_bfs(graph, [{start, 0, 1.0}], %{}, max_depth, link_types)
  end

  defp do_bfs(_graph, [], visited, _max_depth, _types), do: Map.to_list(visited)

  defp do_bfs(graph, [{current, depth, weight} | rest], visited, max_depth, types) do
    if depth >= max_depth or Map.has_key?(visited, current) do
      do_bfs(graph, rest, visited, max_depth, types)
    else
      visited = Map.put(visited, current, weight)

      next =
        :digraph.out_edges(graph, current)
        |> Enum.map(fn edge ->
          {_, _, target, label} = :digraph.edge(graph, edge)
          {target, depth + 1, weight * label.weight * 0.5}
        end)
        |> Enum.reject(fn {slug, _, _} -> Map.has_key?(visited, slug) end)

      do_bfs(graph, rest ++ next, visited, max_depth, types)
    end
  end
end
```

## Architecture & Implementation

The semantic link architecture in the Prismatic Platform uses a dual representation: in-memory `:digraph` for fast traversal queries and PostgreSQL storage for persistence. The InterconnectionEngine GenServer maintains the in-memory graph and rebuilds it from the database at startup or when links are modified.

Semantic links are generated both explicitly (prerequisite declarations in topic registration) and automatically (shared category, shared skills, keyword overlap). The automatic link generation runs as a batch process after any topic registration change, computing similarity metrics and creating links above a configurable threshold.

## Usage in Prismatic Platform

Semantic links drive the Academy's recommendation engine and the DD pipeline's entity relationship mapping. The Academy dashboard displays related topics based on semantic link traversal.

```elixir
defmodule PrismaticWeb.Academy.RelatedTopicsComponent do
  use Phoenix.Component

  attr :topic_slug, :string, required: true

  def related_topics(assigns) do
    graph = PrismaticAcademy.InterconnectionEngine.get_graph()
    related = PrismaticAcademy.LinkGraph.related(graph, assigns.topic_slug, depth: 2)
    assigns = assign(assigns, :related, Enum.take(related, 5))

    ~H"""
    <div class="space-y-2">
      <h4 class="text-sm font-medium text-gray-400">Related Topics</h4>
      <%= for {slug, weight} <- @related do %>
        <a href={"/academy/topics/#{slug}"} class="block text-indigo-400 hover:text-indigo-300">
          <%= slug %> <span class="text-gray-500">(<%= Float.round(weight, 2) %>)</span>
        </a>
      <% end %>
    </div>
    """
  end
end
```

## Cross-References

- [Semantic Linking](@/glossary/semantic-linking.md) - Engine that generates and maintains semantic links
- [Prerequisite](@/glossary/prerequisite.md) - Specific semantic link type encoding learning dependencies
- [Progress](@/glossary/progress.md) - Completion tracking using semantic link paths
- [Provenance](@/glossary/provenance.md) - Origin tracing for automatically generated semantic links
- [Self-Registration](@/glossary/self-registration.md) - Source of topic metadata used for automatic link generation

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
