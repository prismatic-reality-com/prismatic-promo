+++
title = "Knowledge Representation"
weight = 50
[extra]
tags = ["glossary", "knowledge-management", "ai", "epistemology", "graph-theory", "ontology"]
description = "Knowledge representation encompasses the formal methods, data structures, and computational techniques used to encode, store, reason about, and retrieve knowledge within software systems, enabling machines and humans to share, query, and evolve understanding of complex domains."
category = "knowledge-management"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "20 min"
difficulty = "advanced"
quality_score = 95
related_terms = ["knowledge-graph", "knowledge-hoarding", "ontology", "belief-graph", "graph-database", "kuzu-db", "ets", "embedding", "rag", "machine-learning"]
version = "2.0.0"
date_created = "2026-02-22"
last_updated = "2026-02-22"
domain = "knowledge-engineering"
platform_relevance = "critical"
elixir_specific = true
word_count = 1587
date_modified = "2026-02-23"
keywords = ["Knowledge", "Representation", "glossary", "knowledge management", "Prismatic Platform", "AIAD", "OSINT", "KuzuDB"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Knowledge Representation - Prismatic Platform"
+++

## Definition

Knowledge representation (KR) is the field of artificial intelligence and computer science concerned with how information about the world can be encoded in formal structures that computer programs can use to reason, infer, and solve problems. It encompasses the selection and design of data structures, encoding schemes, inference mechanisms, and query interfaces that allow knowledge to be captured in a form that is both machine-processable and human-comprehensible.

In the context of the Prismatic Platform, knowledge representation is not merely an academic concept but an operational requirement. With 530+ AIAD agents, 115 umbrella applications, 120 OSINT tools, and a 20-year GARDEN legacy of accumulated patterns, the platform must represent knowledge in forms that enable agents to reason autonomously, systems to self-describe, and humans to navigate an ecosystem of 2.8 million lines of code. The platform employs multiple representation paradigms simultaneously: graph-based (KuzuDB), relational (PostgreSQL), key-value (ETS/Redis), search-indexed (Meilisearch), vector (embeddings), and structured-document (AIAD YAML/Markdown).

## Overview

Knowledge representation has a rich intellectual history spanning from Aristotelian logic through the semantic web era to modern graph neural networks. The fundamental challenge remains constant: how do you capture what is known in a form that supports useful computation?

### The Five Roles of Knowledge Representation

Following Randall Davis, Howard Shrobe, and Peter Szolovits' seminal 1993 paper, any KR system serves five distinct roles:

1. **Surrogate**: The representation stands in for the thing itself. A node labeled "Prismatic.Perimeter" in a knowledge graph is a surrogate for the actual Elixir application.

2. **Ontological commitment**: Every KR makes implicit commitments about what exists. Choosing to represent agents as nodes with tier-level properties commits to a hierarchical agent ontology.

3. **Theory of intelligent reasoning**: The representation shapes what inferences are possible. A belief graph with confidence scores enables Bayesian reasoning; a simple key-value store does not.

4. **Medium of computation**: The representation must be efficiently processable. ETS tables enable O(1) lookups; graph databases enable O(V+E) traversals; both are necessary for different reasoning tasks.

5. **Medium of human expression**: Knowledge must be comprehensible to humans who create, maintain, and validate it. AIAD agent definitions in YAML/Markdown serve this role.

### Knowledge Representation in Practice

The Prismatic Platform's approach to knowledge representation reflects a polyglot philosophy: different kinds of knowledge require different representation formats. The platform uses:

- **Graph representation** for relationship-heavy knowledge (entity relationships, attack surfaces, dependency graphs)
- **Relational representation** for structured, transactional knowledge (user data, compliance records, audit trails)
- **Key-value representation** for high-speed lookup knowledge (caching, session state, configuration)
- **Document representation** for human-oriented knowledge (documentation, agent specs, policies)
- **Vector representation** for similarity-based knowledge (semantic search, embedding-based retrieval)
- **Logic representation** for formal verification knowledge (Lean4 proofs, Trinity Gate validation)

## Technical Details

### Graph-Based Knowledge Representation with KuzuDB

The platform uses KuzuDB as its graph database for representing complex relationship knowledge. This is particularly powerful for OSINT intelligence, where entities (people, companies, domains, IPs) have rich interconnections.

```elixir
defmodule Prismatic.Knowledge.GraphStore do
  @moduledoc """
  Graph-based knowledge representation using KuzuDB for complex
  relationship modeling. Supports OSINT entity graphs, dependency
  analysis, and attack surface mapping.
  """

  alias PrismaticStorageKuzu.Connection

  @type entity :: %{
          id: String.t(),
          type: atom(),
          properties: map(),
          provenance: map()
        }

  @type relationship :: %{
          source: String.t(),
          target: String.t(),
          type: atom(),
          properties: map(),
          confidence: float()
        }

  @spec store_entity(entity()) :: {:ok, String.t()} | {:error, atom()}
  def store_entity(%{id: id, type: type, properties: props, provenance: prov}) do
    cypher = """
    CREATE (e:#{normalize_type(type)} {
      id: $id,
      properties: $properties,
      provenance: $provenance,
      created_at: $timestamp
    })
    RETURN e.id
    """

    params = %{
      id: id,
      properties: Jason.encode!(props),
      provenance: Jason.encode!(prov),
      timestamp: DateTime.to_iso8601(DateTime.utc_now())
    }

    case Connection.execute(cypher, params) do
      {:ok, [[entity_id]]} -> {:ok, entity_id}
      {:error, reason} -> {:error, reason}
    end
  end

  @spec store_relationship(relationship()) :: {:ok, :stored} | {:error, atom()}
  def store_relationship(%{source: src, target: tgt, type: type, properties: props, confidence: conf}) do
    cypher = """
    MATCH (a {id: $source}), (b {id: $target})
    CREATE (a)-[r:#{normalize_type(type)} {
      properties: $properties,
      confidence: $confidence,
      created_at: $timestamp
    }]->(b)
    RETURN r
    """

    params = %{
      source: src,
      target: tgt,
      properties: Jason.encode!(props),
      confidence: conf,
      timestamp: DateTime.to_iso8601(DateTime.utc_now())
    }

    case Connection.execute(cypher, params) do
      {:ok, _} -> {:ok, :stored}
      {:error, reason} -> {:error, reason}
    end
  end

  @spec query_neighbors(String.t(), keyword()) :: {:ok, [entity()]} | {:error, atom()}
  def query_neighbors(entity_id, opts \\ []) do
    max_depth = Keyword.get(opts, :depth, 2)
    min_confidence = Keyword.get(opts, :min_confidence, 0.5)

    cypher = """
    MATCH (start {id: $id})-[r*1..#{max_depth}]-(neighbor)
    WHERE ALL(rel IN r WHERE rel.confidence >= $min_confidence)
    RETURN DISTINCT neighbor.id, neighbor.properties, length(r) AS distance
    ORDER BY distance ASC
    """

    Connection.execute(cypher, %{id: entity_id, min_confidence: min_confidence})
  end

  defp normalize_type(type) when is_atom(type) do
    type |> Atom.to_string() |> Macro.camelize()
  end
end
```

### ETS-Based Knowledge Representation

For high-speed operational knowledge, ETS provides constant-time lookups with zero-copy reads:

```elixir
defmodule Prismatic.Knowledge.OperationalStore do
  @moduledoc """
  ETS-backed operational knowledge store for high-frequency read
  patterns. Represents runtime knowledge that agents and processes
  need with microsecond access times.
  """

  @table :operational_knowledge

  @type knowledge_key :: {atom(), atom()}
  @type knowledge_value :: term()
  @type metadata :: %{
          updated_at: DateTime.t(),
          source: atom(),
          ttl_seconds: non_neg_integer() | :infinity,
          version: non_neg_integer()
        }

  @spec init() :: :ok
  def init do
    :ets.new(@table, [
      :named_table,
      :set,
      :public,
      read_concurrency: true,
      write_concurrency: true
    ])

    :ok
  end

  @spec put(knowledge_key(), knowledge_value(), keyword()) :: :ok
  def put(key, value, opts \\ []) do
    metadata = %{
      updated_at: DateTime.utc_now(),
      source: Keyword.get(opts, :source, :unknown),
      ttl_seconds: Keyword.get(opts, :ttl, :infinity),
      version: get_next_version(key)
    }

    :ets.insert(@table, {key, value, metadata})
    :ok
  end

  @spec get(knowledge_key()) :: {:ok, knowledge_value(), metadata()} | {:error, :not_found | :expired}
  def get(key) do
    case :ets.lookup(@table, key) do
      [{^key, value, metadata}] ->
        if expired?(metadata) do
          :ets.delete(@table, key)
          {:error, :expired}
        else
          {:ok, value, metadata}
        end

      [] ->
        {:error, :not_found}
    end
  end

  @spec list_by_domain(atom()) :: [{knowledge_key(), knowledge_value(), metadata()}]
  def list_by_domain(domain) do
    :ets.match_object(@table, {{domain, :_}, :_, :_})
  end

  defp expired?(%{ttl_seconds: :infinity}), do: false

  defp expired?(%{ttl_seconds: ttl, updated_at: updated_at}) do
    DateTime.diff(DateTime.utc_now(), updated_at) > ttl
  end

  defp get_next_version(key) do
    case :ets.lookup(@table, key) do
      [{^key, _, %{version: v}}] -> v + 1
      [] -> 1
    end
  end
end
```

### Structured Document Knowledge Representation

The AIAD standard represents agent knowledge in structured YAML with mandatory fields:

```elixir
defmodule Prismatic.Knowledge.AIADParser do
  @moduledoc """
  Parser for AIAD-compliant knowledge artifacts (agents, commands,
  policies, patterns). Converts structured YAML/Markdown into
  machine-processable knowledge representations.
  """

  @required_fields [:name, :version, :type, :description, :enforcement]

  @spec parse_agent(String.t()) :: {:ok, map()} | {:error, [String.t()]}
  def parse_agent(filepath) do
    with {:ok, content} <- File.read(filepath),
         {:ok, frontmatter, body} <- extract_frontmatter(content),
         {:ok, parsed} <- YamlElixir.read_from_string(frontmatter),
         :ok <- validate_required_fields(parsed) do
      knowledge = %{
        type: :agent,
        metadata: parsed,
        documentation: body,
        source_file: filepath,
        parsed_at: DateTime.utc_now(),
        provenance: %{
          source: :aiad_parser,
          file: filepath,
          checksum: :crypto.hash(:sha256, content) |> Base.encode16(case: :lower)
        }
      }

      {:ok, knowledge}
    end
  end

  defp extract_frontmatter(content) do
    case String.split(content, "---", parts: 3) do
      [_, frontmatter, body] -> {:ok, String.trim(frontmatter), String.trim(body)}
      _ -> {:error, ["Invalid AIAD format: missing frontmatter delimiters"]}
    end
  end

  defp validate_required_fields(parsed) do
    missing = Enum.filter(@required_fields, &(not Map.has_key?(parsed, to_string(&1))))

    case missing do
      [] -> :ok
      fields -> {:error, Enum.map(fields, &"Missing required field: #{&1}")}
    end
  end
end
```

## Implementation

The Prismatic Platform's knowledge representation strategy follows a layered architecture:

### Layer 1: Raw Data Storage

At the base, raw data is stored in appropriate backends: PostgreSQL for structured relational data, KuzuDB for graph data, ETS for ephemeral operational data, Redis for distributed caching, and the filesystem for document-oriented knowledge.

### Layer 2: Schema and Ontology

Above raw storage, schemas and ontologies define what knowledge looks like. Ecto schemas define relational structure, KuzuDB node/relationship schemas define graph structure, and AIAD specifications define document structure.

### Layer 3: Indexing and Search

Knowledge that cannot be found is effectively nonexistent. Meilisearch provides full-text search across all document knowledge. ETS indexes provide key-based lookups. KuzuDB's Cypher queries provide graph traversal. Git-trees provides file-level search.

### Layer 4: Reasoning and Inference

The highest layer supports reasoning over stored knowledge. The NABLA Infinity framework provides epistemic reasoning. The Trinity Gate provides multi-modal verification. Agent orchestration provides distributed inference across specialized knowledge domains.

## Comparison

| Representation | Strengths | Weaknesses | Prismatic Usage |
|---------------|-----------|------------|-----------------|
| **Relational (SQL)** | ACID transactions, mature tooling, standardized | Poor at recursive/graph queries, rigid schema | User data, compliance records, audit trails |
| **Graph (Cypher)** | Natural relationship modeling, flexible schema | Less mature tooling, complex optimization | OSINT entities, dependency graphs, attack surfaces |
| **Key-Value (ETS)** | Microsecond reads, zero-copy, concurrent | No complex queries, node-local | Runtime state, caching, operational knowledge |
| **Document (YAML/MD)** | Human-readable, version-controllable | Not queryable without indexing | Agent specs, policies, documentation |
| **Vector (Embeddings)** | Semantic similarity, cross-modal | Lossy, requires ML pipeline | Semantic search, RAG, similar entity discovery |
| **Logic (Lean4)** | Formal proofs, mathematical certainty | Limited expressiveness, steep learning curve | Trinity Gate verification, formal properties |

## Best Practices

1. **Match representation to reasoning need**: Do not force all knowledge into a single representation. Use graphs for relationships, tables for transactions, ETS for speed, documents for humans.

2. **Maintain provenance**: Every knowledge artifact must carry provenance metadata -- where it came from, when it was created, and what confidence level it carries. This is enforced by NABLA axioms.

3. **Version everything**: Knowledge evolves. Use versioned schemas, timestamped entries, and change tracking so you can always understand how knowledge changed over time.

4. **Build bidirectional bridges**: Knowledge in one store should reference knowledge in another. An OSINT entity in KuzuDB should reference its compliance records in PostgreSQL and its documentation in AIAD files.

5. **Enforce consistency checks**: Run periodic consistency checks across knowledge stores. If the agent registry says 530 agents exist, the AIAD files should contain 530 agent definitions.

6. **Design for query patterns**: Understand how knowledge will be queried before choosing representation. If you need "find all entities within 2 hops of this company with confidence > 0.8", you need a graph database.

7. **Keep humans in the loop**: Every formal representation should have a human-readable counterpart. The promo site glossary serves this purpose for platform concepts.

8. **Test knowledge integrity**: Write property-based tests that verify knowledge representation invariants. If a relationship exists, both endpoints must exist. If confidence is claimed, evidence must be traceable.

## Pitfalls

1. **Representation lock-in**: Choosing a single representation format and forcing all knowledge into it. This leads to awkward modeling, poor performance, and frustrated developers.

2. **Premature formalization**: Formalizing knowledge before understanding it. If you do not yet know the domain well, start with flexible document-based representation and formalize later.

3. **Ignoring the closed-world assumption**: Many KR systems assume that if something is not represented, it is false. In OSINT and security contexts, absence of information is itself informative (NABLA axiom: Absence Informative).

4. **Schema rigidity**: Over-constraining schemas prevents evolution. Use schema migration strategies and flexible property bags alongside structured fields.

5. **Conflating storage with representation**: A PostgreSQL table is not a knowledge representation -- it is storage. The representation includes the schema, the query patterns, the indexing strategy, and the reasoning layer on top.

6. **Neglecting time**: Knowledge has a temporal dimension. Facts that were true yesterday may not be true today. Time decay is a NABLA axiom for good reason.

7. **Scale blindness**: A representation that works for 100 entities may collapse at 100,000. The Prismatic Platform's codebase has grown from a few apps to 115, and knowledge representation choices made early have had to evolve.

## Use Cases

### OSINT Entity Intelligence

The platform's 120 OSINT tools generate knowledge about entities (people, companies, domains, IP addresses) that must be represented in a form supporting complex queries: "Show me all companies connected to this person through beneficial ownership chains with confidence above 0.7." This requires graph-based knowledge representation with confidence-weighted edges.

### Agent Orchestration

With 530+ agents operating across 16 domains, the platform must represent agent capabilities, dependencies, and operational constraints in a form that the orchestration layer can reason about. AIAD-compliant agent definitions serve as the knowledge representation, while the Agent Registry provides runtime lookup.

### Quality Gate Enforcement

The quality gate system must represent rules, thresholds, and violation history in a form that supports automated enforcement. Quality DNA files represent per-app quality state, Credo rules represent coding standards, and Dialyzer PLT files represent type-level knowledge.

### Compliance Mapping

NIS2 Directive and ZKB 264/2025 compliance requirements must be represented as formal rules that can be automatically checked against discovered assets. The Prismatic Perimeter maps compliance frameworks to knowledge representations that enable automated assessment.

## Related Concepts

Knowledge representation connects to a broad set of platform concepts that together form the knowledge engineering infrastructure:

- [Knowledge Graph](@/glossary/knowledge-graph.md) -- the primary graph-based knowledge representation used for entity relationships and OSINT intelligence
- [Knowledge Hoarding](@/glossary/knowledge-hoarding.md) -- the anti-pattern that knowledge representation directly combats by making knowledge explicit and accessible
- [Ontology](@/glossary/ontology.md) -- the formal specification of concepts and relationships within a domain, providing the schema for knowledge representation
- [Belief Graph](@/glossary/belief-graph.md) -- a specialized knowledge representation that tracks beliefs, confidence levels, and evidence chains for epistemic reasoning
- [Graph Database](@/glossary/graph-database.md) -- the storage technology that implements graph-based knowledge representation with query capabilities
- [ETS](@/glossary/ets.md) -- Erlang Term Storage, providing the high-speed key-value knowledge representation for operational data
- [Embedding](@/glossary/embedding.md) -- vector-based knowledge representation enabling semantic similarity computation and retrieval-augmented generation
- [RAG](@/glossary/rag.md) -- retrieval-augmented generation, a technique that combines knowledge representation with language model inference
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- the epistemic framework that defines how knowledge must be represented with provenance, confidence, and temporal decay
- [AIAD](@/glossary/aiad.md) -- the agent standard that provides a structured document-based knowledge representation for all platform agents

## See Also

- [Machine Learning](@/glossary/machine-learning.md) -- uses knowledge representations as training data and produces learned representations as model weights
- [Graph Theory](@/glossary/graph-theory.md) -- the mathematical foundation for graph-based knowledge representation
- [Bayesian Reasoning](@/glossary/bayesian-reasoning.md) -- probabilistic reasoning over knowledge representations with uncertainty
- [KuzuDB](@/glossary/kuzu-db.md) -- the specific graph database used for graph-based knowledge representation in the platform
- [Meilisearch](@/glossary/meilisearch.md) -- the search engine that indexes knowledge representations for full-text retrieval

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Part of the [Prismatic Platform](https://github.com/korczis/prismatic-platform) Glossary

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | Glossary Index
