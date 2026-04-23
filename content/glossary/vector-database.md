+++
title = "Vector Database"
weight = 48
[extra]
category = "storage"
description = "Database optimized for storing and querying high-dimensional vector embeddings for semantic search, similarity matching, and retrieval-augmented generation"
abbreviation = "VecDB"
related_app = "prismatic_storage_meilisearch"
platform_layer = "storage"
difficulty = "advanced"
domain = "machine-learning"
stability = "stable"
since_version = "0.12.0"
elixir_module = "PrismaticSearch.Embeddings"
otp_compliant = true
tags = ["embeddings", "semantic-search", "similarity", "ANN", "HNSW", "pgvector", "meilisearch", "RAG", "cosine-similarity", "hybrid-search"]
related_terms = ["knowledge-graph", "ontology", "ollama", "postgresql", "entity-resolution", "confidence-scoring", "agent", "shodan", "censys", "attack-surface", "meilisearch", "ets-table"]
date_created = "2025-08-15"
date_updated = "2026-02-22"
use_cases = ["OSINT semantic search", "agent similarity matching", "semantic deduplication", "retrieval-augmented generation", "intelligence corpus indexing"]
compliance_frameworks = ["GDPR"]
performance_impact = "medium"
dependencies = ["ollama", "meilisearch", "postgresql"]
author = "Tomas Korcak (korczis)"
reading_time = "10 min"
word_count = 2027
date_modified = "2026-02-23"
keywords = ["Vector", "Database", "glossary", "storage", "Prismatic Platform", "Meilisearch", "OSINT"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Vector Database - Prismatic Platform"
+++

## Definition

A vector database is a specialized storage system optimized for indexing and querying high-dimensional vector embeddings -- dense numeric arrays that encode the semantic meaning of text, images, code, or other data into a geometric space where similar items are located near each other. In a vector space, the sentence "the server is vulnerable to SQL injection" is represented as a point in (typically) 384 to 4,096 dimensional space. Other sentences about SQL injection vulnerabilities will be nearby in this space, even if they use completely different words. This property -- that semantic similarity maps to geometric proximity -- is what makes vector databases transformative for search, recommendation, and retrieval-augmented generation (RAG).

Traditional keyword-based search engines match exact terms: a query for "SQL injection" finds documents containing those exact words. Vector search operates on meaning: a query about "database input sanitization flaws" would find documents about SQL injection even without the exact term, because the embeddings of semantically related concepts are geometrically close. This semantic matching is particularly valuable for OSINT intelligence synthesis, where the same vulnerability, threat actor, or infrastructure pattern may be described using vastly different terminology across sources.

The Prismatic Platform integrates vector capabilities through two complementary systems. Meilisearch provides hybrid search combining keyword matching (BM25) with semantic vector similarity, enabling searches that benefit from both exact term matching and semantic understanding. [PostgreSQL](/glossary/postgresql/) with the pgvector extension provides vector storage and similarity search within the relational database, enabling combined relational-and-vector queries. The [Ollama](/glossary/ollama/) integration generates embeddings locally using models like qwen3-coder, enabling privacy-preserving semantic search without sending data to external APIs.

Vector databases have become a foundational infrastructure component in the age of large language models. As organizations deploy LLM-powered assistants, chatbots, and analysis tools, vector databases serve as the "long-term memory" that grounds LLM responses in factual, domain-specific knowledge. This pattern, known as retrieval-augmented generation (RAG), retrieves semantically relevant documents from a vector database and includes them in the LLM's context window, dramatically reducing hallucination and improving response accuracy for domain-specific queries.

## Historical Context and Evolution

The concept of similarity search in high-dimensional spaces predates modern vector databases by decades. The k-nearest neighbors algorithm was first described by Fix and Hodges in 1951, and locality-sensitive hashing (LSH) emerged in the late 1990s as a practical approach to approximate nearest neighbor search. However, the practical need for purpose-built vector databases only became acute with the explosion of deep learning and transformer architectures in the 2010s, which produced high-quality embeddings for text, images, audio, and code at scale.

The first generation of vector search systems (2017-2019) were standalone libraries like Facebook's FAISS (Facebook AI Similarity Search) and Annoy (Approximate Nearest Neighbors Oh Yeah), which provided fast similarity search but required developers to handle persistence, indexing, and API layers themselves. The second generation (2019-2022) brought purpose-built vector databases -- Pinecone, Weaviate, Milvus, Qdrant, and Chroma -- that provided managed persistence, real-time indexing, metadata filtering, and RESTful APIs. The third generation (2022-present) integrates vector capabilities into existing databases: PostgreSQL gained pgvector, Elasticsearch added dense vector search, MongoDB introduced Atlas Vector Search, and Meilisearch integrated hybrid keyword-plus-vector search.

The Prismatic Platform's approach belongs to this third generation: rather than deploying a standalone vector database, the platform integrates vector capabilities into its existing storage infrastructure through Meilisearch and pgvector, gaining vector search without adding operational complexity or data synchronization challenges.

## Vector Embeddings

### How Embeddings Work

An embedding model (a neural network) transforms input data into a fixed-length vector. The model is trained so that semantically similar inputs produce similar vectors:

```
Input: "HTTPS certificate expired"     -> [0.12, -0.34, 0.78, ..., 0.56]  (384 dims)
Input: "SSL cert past expiry date"     -> [0.11, -0.33, 0.79, ..., 0.55]  (similar!)
Input: "Elixir GenServer pattern"      -> [-0.45, 0.67, -0.12, ..., 0.89] (different)
```

The training process uses contrastive learning: the model is shown pairs of similar texts (positive pairs) and dissimilar texts (negative pairs), and it learns to produce embeddings where positive pairs are close and negative pairs are distant. The resulting embedding space captures rich semantic relationships: analogies ("king" - "man" + "woman" = "queen"), hierarchies (hypernym-hyponym relationships), and domain-specific associations (security vulnerability taxonomies).

### Embedding Models in Prismatic

| Model | Dimensions | Speed | Use Case |
|-------|-----------|-------|----------|
| `nomic-embed-text` | 768 | ~50ms | General text embedding |
| `all-minilm` | 384 | ~20ms | Lightweight semantic search |
| `qwen3-coder` (embedding mode) | 1,024 | ~100ms | Code and technical content |
| `mxbai-embed-large` | 1,024 | ~80ms | High-quality multilingual |

All embedding generation runs locally through [Ollama](/glossary/ollama/), ensuring that sensitive OSINT data, security assessments, and agent specifications never leave the platform's infrastructure.

### Embedding Generation Pipeline

```elixir
defmodule PrismaticSearch.Embeddings do
  @moduledoc """
  Generate vector embeddings using local Ollama models.

  This module provides the primary interface for transforming text content
  into high-dimensional vector representations suitable for semantic search,
  similarity matching, and retrieval-augmented generation workflows.
  All embedding generation runs locally through Ollama, ensuring data
  privacy and eliminating external API dependencies.
  """

  @default_model "nomic-embed-text"

  @spec embed(String.t(), keyword()) :: {:ok, [float()]} | {:error, term()}
  def embed(text, opts \\ []) do
    model = Keyword.get(opts, :model, @default_model)

    case Ollama.embeddings(model, text) do
      {:ok, %{embedding: vector}} -> {:ok, vector}
      {:error, reason} -> {:error, {:embedding_failed, reason}}
    end
  end

  @spec embed_batch([String.t()], keyword()) :: {:ok, [[float()]]} | {:error, term()}
  def embed_batch(texts, opts \\ []) do
    texts
    |> Task.async_stream(&embed(&1, opts), max_concurrency: 4)
    |> Enum.reduce_while({:ok, []}, fn
      {:ok, {:ok, vec}}, {:ok, acc} -> {:cont, {:ok, [vec | acc]}}
      {:ok, {:error, _} = err}, _acc -> {:halt, err}
    end)
    |> case do
      {:ok, vecs} -> {:ok, Enum.reverse(vecs)}
      error -> error
    end
  end

  @spec embedding_dimensions(String.t()) :: {:ok, pos_integer()} | {:error, term()}
  def embedding_dimensions(model \\ @default_model) do
    case embed("dimension probe", model: model) do
      {:ok, vector} -> {:ok, length(vector)}
      {:error, reason} -> {:error, reason}
    end
  end
end
```

## Similarity Metrics

Vector databases support multiple distance/similarity metrics for comparing embeddings. The choice of metric significantly impacts search quality and must align with how the embedding model was trained:

| Metric | Formula | Properties | When to Use |
|--------|---------|-----------|-------------|
| **Cosine similarity** | cos(A,B) = (A.B) / (\|A\|\|B\|) | Direction-based; magnitude-invariant | Most text embeddings (default) |
| **Euclidean distance** | L2(A,B) = sqrt(sum((ai-bi)^2)) | Magnitude-sensitive | When vector magnitude matters |
| **Dot product** | A.B = sum(ai*bi) | Fastest; assumes normalized vectors | Pre-normalized embeddings |
| **Manhattan distance** | L1(A,B) = sum(\|ai-bi\|) | Robust to outlier dimensions | Sparse feature vectors |

The Prismatic Platform uses cosine similarity as its default metric because most text embedding models are trained to optimize cosine similarity between semantically related texts. For specialized use cases (e.g., comparing embedding magnitudes for [confidence scoring](/glossary/confidence-scoring/)), Euclidean distance is available.

Cosine similarity has an important mathematical property for information retrieval: it measures the angle between two vectors, ignoring their magnitudes. This means that a short document and a long document about the same topic will have similar cosine similarity scores, even though the longer document's embedding might have a larger magnitude. This magnitude invariance makes cosine similarity robust for comparing documents of varying lengths, which is common in OSINT intelligence corpora where sources range from brief social media posts to lengthy technical reports.

## Approximate Nearest Neighbor (ANN) Algorithms

Exact nearest neighbor search in high-dimensional spaces is computationally prohibitive (O(n*d) for n vectors of d dimensions). Vector databases use approximate algorithms that trade a small accuracy loss for dramatic speed improvements:

| Algorithm | Approach | Speed | Accuracy | Memory |
|-----------|----------|-------|----------|--------|
| **HNSW** | Hierarchical navigable small world graph | Very fast | ~95-99% recall | High (graph overhead) |
| **IVF** | Inverted file index with quantization | Fast | ~90-95% recall | Medium |
| **PQ** | Product quantization | Moderate | ~85-90% recall | Low (compressed) |
| **Flat** | Brute-force exact search | Slow | 100% recall | Low (no index) |

### HNSW in Detail

HNSW (Hierarchical Navigable Small World) is the dominant ANN algorithm used in modern vector databases, including Meilisearch and pgvector. It constructs a multi-layer graph where each layer is a "navigable small world" -- a graph where any node can reach any other node in O(log n) hops. The algorithm works as follows:

1. **Construction**: Each new vector is inserted into the graph starting from the top layer. At each layer, the algorithm greedily navigates to the nearest neighbors and creates edges. The number of layers a vector appears in is determined by a random exponential distribution, creating a natural hierarchy.

2. **Search**: A query vector enters at the top layer and greedily navigates to the closest nodes. At each layer, the search expands to explore more neighbors (controlled by the `ef` parameter). The search descends to lower layers, progressively refining the result set.

3. **Parameters**: `M` controls the maximum number of connections per node (higher = more accurate but more memory). `ef_construction` controls build-time search quality. `ef_search` controls query-time accuracy-speed tradeoff.

Meilisearch uses HNSW internally for its vector search, providing sub-millisecond query times on collections of millions of documents. PostgreSQL's pgvector extension supports both HNSW and IVF-Flat index types:

```sql
-- Create a vector column in PostgreSQL
ALTER TABLE osint_documents ADD COLUMN embedding vector(768);

-- Create HNSW index for fast similarity search
CREATE INDEX ON osint_documents
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Find 10 most similar documents
SELECT id, title, 1 - (embedding <=> query_embedding) AS similarity
FROM osint_documents
ORDER BY embedding <=> query_embedding
LIMIT 10;
```

## Hybrid Search Architecture

The Prismatic Platform combines vector similarity with keyword matching for optimal search quality. Pure vector search excels at semantic understanding but can miss exact matches that keyword search handles trivially. Pure keyword search misses semantic relationships. Hybrid search combines both approaches:

```
Query: "expired SSL certificates on example.com"
    |
    +---> Keyword Search (BM25)
    |     Matches: "SSL", "certificates", "example.com"
    |     Score: relevance based on term frequency
    |
    +---> Vector Search (Cosine Similarity)
    |     Matches: semantically similar documents
    |     Score: embedding distance to query embedding
    |
    +---> Fusion (Reciprocal Rank Fusion)
          Combines both rankings into final result set
          Benefits: exact matches + semantic understanding
```

### Reciprocal Rank Fusion

The platform uses Reciprocal Rank Fusion (RRF) to combine keyword and vector search results. RRF assigns each result a score based on its rank in each result list: `score(d) = sum(1 / (k + rank_i(d)))` where `k` is a constant (typically 60) and `rank_i(d)` is the rank of document `d` in result list `i`. RRF is robust to score distribution differences between search methods and consistently outperforms simple score averaging or weighted combinations.

### Meilisearch Hybrid Search Integration

```elixir
defmodule PrismaticSearch.Hybrid do
  @moduledoc """
  Hybrid keyword + semantic search via Meilisearch.

  Combines BM25 keyword matching with vector cosine similarity
  using configurable semantic ratio. The semantic_ratio parameter
  controls the balance: 0.0 = pure keyword, 1.0 = pure semantic,
  0.5 = equal weight to both methods.
  """

  @spec search(String.t(), String.t(), keyword()) ::
          {:ok, map()} | {:error, term()}
  def search(index, query, opts \\ []) do
    with {:ok, query_vector} <- PrismaticSearch.Embeddings.embed(query) do
      Meilisearch.search(index, query,
        vector: query_vector,
        hybrid: %{
          semantic_ratio: Keyword.get(opts, :semantic_ratio, 0.5),
          embedder: "default"
        },
        limit: Keyword.get(opts, :limit, 20),
        filter: Keyword.get(opts, :filter, nil)
      )
    end
  end

  @spec search_with_reranking(String.t(), String.t(), keyword()) ::
          {:ok, [map()]} | {:error, term()}
  def search_with_reranking(index, query, opts \\ []) do
    with {:ok, initial_results} <- search(index, query, Keyword.put(opts, :limit, 100)),
         {:ok, query_vec} <- PrismaticSearch.Embeddings.embed(query) do
      reranked =
        initial_results.hits
        |> Enum.map(fn hit ->
          {:ok, doc_vec} = PrismaticSearch.Embeddings.embed(hit["content"])
          similarity = cosine_similarity(query_vec, doc_vec)
          Map.put(hit, "_rerank_score", similarity)
        end)
        |> Enum.sort_by(& &1["_rerank_score"], :desc)
        |> Enum.take(Keyword.get(opts, :limit, 20))

      {:ok, reranked}
    end
  end

  defp cosine_similarity(a, b) do
    dot = Enum.zip(a, b) |> Enum.reduce(0.0, fn {ai, bi}, acc -> acc + ai * bi end)
    norm_a = :math.sqrt(Enum.reduce(a, 0.0, fn x, acc -> acc + x * x end))
    norm_b = :math.sqrt(Enum.reduce(b, 0.0, fn x, acc -> acc + x * x end))
    if norm_a == 0.0 or norm_b == 0.0, do: 0.0, else: dot / (norm_a * norm_b)
  end
end
```

## Retrieval-Augmented Generation (RAG)

One of the most impactful applications of vector databases is retrieval-augmented generation, where semantically relevant documents are retrieved from the vector store and injected into an LLM's context window to ground its responses in factual, domain-specific knowledge. The Prismatic Platform uses RAG to enable natural language querying of the OSINT intelligence corpus, agent specifications, and security assessment data.

```elixir
defmodule PrismaticSearch.RAG do
  @moduledoc """
  Retrieval-Augmented Generation pipeline combining vector search
  with LLM inference for grounded, factual responses to natural
  language queries over the platform's intelligence corpus.
  """

  @spec query(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def query(question, opts \\ []) do
    index = Keyword.get(opts, :index, "intelligence")
    top_k = Keyword.get(opts, :top_k, 5)

    with {:ok, results} <- PrismaticSearch.Hybrid.search(index, question, limit: top_k),
         context <- format_context(results.hits),
         {:ok, response} <- generate_response(question, context, opts) do
      {:ok, %{
        answer: response,
        sources: Enum.map(results.hits, & &1["_source"]),
        confidence: calculate_rag_confidence(results.hits)
      }}
    end
  end

  defp format_context(hits) do
    hits
    |> Enum.map_join("\n\n---\n\n", fn hit ->
      "Source: #{hit["source"]}\n#{hit["content"]}"
    end)
  end

  defp calculate_rag_confidence(hits) do
    if Enum.empty?(hits) do
      0.0
    else
      avg_score = Enum.reduce(hits, 0.0, & &1["_score"] + &2) / length(hits)
      min(1.0, avg_score)
    end
  end
end
```

## Use Cases in Prismatic

### OSINT Intelligence Search

Vector search enables analysts to find relevant intelligence using natural language queries rather than exact keyword matching:

| Query | Keyword Result | Vector Result |
|-------|---------------|---------------|
| "database injection vulnerabilities" | Documents with those exact terms | Also finds SQLi, NoSQLi, LDAP injection docs |
| "expired cryptographic certificates" | Documents with "expired certificates" | Also finds TLS expiry, SSL renewal, cert rotation docs |
| "suspicious network traffic patterns" | Exact term matches only | Also finds anomaly detection, C2 communication, beaconing docs |

### Agent Specification Similarity

With 530+ [agents](/glossary/agent/) in the platform, vector search enables finding agents with similar capabilities:

```elixir
defmodule PrismaticSearch.AgentSimilarity do
  @moduledoc """
  Finds agents with similar capabilities using vector embeddings
  of agent specifications and descriptions.
  """

  @spec find_similar(String.t(), pos_integer()) ::
          {:ok, [map()]} | {:error, term()}
  def find_similar(agent_id, top_k \\ 5) do
    with {:ok, agent_spec} <- load_agent_spec(agent_id),
         {:ok, _embedding} <- PrismaticSearch.Embeddings.embed(agent_spec.description) do
      PrismaticSearch.Hybrid.search("agents",
        agent_spec.description,
        limit: top_k + 1,
        filter: "id != #{agent_id}"
      )
    end
  end
end
```

### Semantic Deduplication

Vector similarity detects near-duplicate content that keyword matching misses, supporting [entity resolution](/glossary/entity-resolution/):

```elixir
defmodule PrismaticSearch.Deduplication do
  @moduledoc """
  Detects near-duplicate documents using vector similarity,
  identifying content that is semantically equivalent even when
  using different wording or structure.
  """

  @spec detect_near_duplicates([map()], float()) :: {:ok, [{String.t(), String.t(), float()}]}
  def detect_near_duplicates(documents, threshold \\ 0.92) do
    embeddings = Enum.map(documents, fn doc ->
      {:ok, vec} = PrismaticSearch.Embeddings.embed(doc.content)
      {doc.id, vec}
    end)

    duplicates =
      for {id_a, vec_a} <- embeddings,
          {id_b, vec_b} <- embeddings,
          id_a < id_b,
          sim = cosine_similarity(vec_a, vec_b),
          sim >= threshold do
        {id_a, id_b, sim}
      end

    {:ok, duplicates}
  end
end
```

### Intelligence Corpus Indexing

The platform indexes OSINT intelligence products, security assessments, and threat reports into vector-searchable corpora, enabling analysts to query the entire intelligence base using natural language rather than structured query syntax.

## Vector Storage Architecture

```
+-------------------------------------------------+
|              Prismatic Vector Layer               |
|                                                   |
|  +-------------+  +-----------+  +-------------+ |
|  | Meilisearch |  | pgvector  |  |   Ollama    | |
|  | (Hybrid     |  | (SQL +    |  | (Embedding  | |
|  |  Search)    |  |  Vector)  |  |  Generation)| |
|  +------+------+  +-----+-----+  +------+------+ |
|         |               |               |         |
|  Full-text +      Relational +     Local AI       |
|  semantic search  vector queries   embedding      |
+-------------------------------------------------+
```

| Component | Role | Strengths |
|-----------|------|-----------|
| **Meilisearch** | Primary search engine | Hybrid search, typo tolerance, faceted filtering |
| **pgvector** | Relational vector queries | SQL joins with vector similarity, ACID transactions |
| **Ollama** | Embedding generation | Local execution, privacy preservation, multiple models |

This three-component architecture provides flexibility that no single vector database offers. Meilisearch handles user-facing search where typo tolerance and faceted filtering matter. pgvector handles analytical queries where vector similarity must be combined with relational predicates (e.g., "find similar documents published in the last 7 days by source X"). Ollama keeps embedding generation local, ensuring that sensitive OSINT data never traverses external APIs.

## Performance Characteristics

| Operation | Meilisearch | pgvector (HNSW) | pgvector (IVF) |
|-----------|-------------|-----------------|----------------|
| Index build (100K docs) | ~30s | ~120s | ~60s |
| Single query (768d) | <5ms | <10ms | <15ms |
| Batch query (100) | <50ms | <200ms | <300ms |
| Memory (100K docs, 768d) | ~800MB | ~600MB | ~400MB |
| Incremental insert | <1ms | <5ms | Requires rebuild |
| Concurrent reads | Excellent | Good | Good |

## Trade-offs and Limitations

| Trade-off | Description | Mitigation |
|-----------|-------------|------------|
| **Embedding quality** | Results are only as good as the embedding model | Use domain-appropriate models; fine-tune if needed |
| **Dimensionality curse** | High dimensions make distance metrics less discriminative | Dimensionality reduction (PCA); appropriate dimension count |
| **Index build time** | HNSW index construction is expensive | Incremental updates; offline index rebuilding |
| **Memory overhead** | 768-dim float32 vectors: ~3KB per document | Quantization; pgvector's halfvec (float16) |
| **Semantic drift** | Embedding models have training cutoffs | Regular model updates; domain-specific fine-tuning |
| **Cold start** | New domains with no training data produce poor embeddings | Transfer learning from general models; few-shot fine-tuning |
| **Multilingual gaps** | Embedding quality varies across languages | Use multilingual models (mxbai-embed-large) for non-English content |

## Comparison with Knowledge Graphs

Vector databases and [knowledge graphs](/glossary/knowledge-graph/) serve complementary roles in the Prismatic Platform's intelligence infrastructure:

| Dimension | Vector Database | Knowledge Graph |
|-----------|----------------|-----------------|
| **Representation** | Dense numeric vectors | Nodes, edges, properties |
| **Query type** | "Find similar items" | "Find connected items" |
| **Relationships** | Implicit (geometric proximity) | Explicit (typed edges) |
| **Reasoning** | Statistical similarity | Logical traversal and inference |
| **Best for** | Semantic search, deduplication | Relationship discovery, path analysis |
| **Update cost** | Re-embed changed documents | Add/modify edges and nodes |
| **Explainability** | Low (black-box similarity scores) | High (explicit relationship paths) |

The Prismatic Platform uses both: vector search for finding semantically relevant intelligence, and knowledge graphs for mapping structural relationships between entities. The [intelligence fusion](/glossary/intelligence-fusion/) engine combines outputs from both systems, using vector similarity to identify candidate relationships and knowledge graph traversal to validate and contextualize them.

## Related Terms

- [Knowledge Graph](/glossary/knowledge-graph/) -- Complementary structured knowledge representation using explicit relationships
- [Ontology](/glossary/ontology/) -- Formal entity type definitions that guide vector embedding strategies
- [Ollama](/glossary/ollama/) -- Local AI runtime generating vector embeddings for privacy-preserving search
- [PostgreSQL](/glossary/postgresql/) -- Relational database with pgvector extension for combined SQL and vector queries
- [Entity Resolution](/glossary/entity-resolution/) -- Deduplication enhanced by vector similarity detection
- [Confidence Scoring](/glossary/confidence-scoring/) -- Similarity scores used as confidence signals in entity matching
- [Agent](/glossary/agent/) -- AIAD agents whose specifications are vector-indexed for similarity search
- [Shodan](/glossary/shodan/) -- OSINT source whose intelligence is vector-indexed for semantic search
- [Censys](/glossary/censys/) -- OSINT source feeding the vector-searchable intelligence corpus
- [Attack Surface](/glossary/attack-surface/) -- Security domain whose intelligence benefits from semantic search
- [Intelligence Fusion](/glossary/intelligence-fusion/) -- Multi-source correlation consuming vector similarity signals
- [Meilisearch](/glossary/meilisearch/) -- Primary hybrid search engine with built-in vector capabilities

## See Also

- [Technologies](/technologies/) -- Storage technology stack including vector capabilities
- [Architecture](/architecture/) -- Search and retrieval architecture design
- [Capabilities](/capabilities/) -- Platform search and intelligence capabilities

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
