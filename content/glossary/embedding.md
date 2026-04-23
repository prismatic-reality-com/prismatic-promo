+++
title = "Embedding"
weight = 26
[extra]
category = "technology"
description = "Dense vector representation of data for semantic similarity computation"
keywords = ["embedding", "vector", "semantic search", "neural network", "transformer", "similarity", "NLP"]
abbreviation = "N/A"
related_terms = ["vector-database", "meilisearch", "ollama", "knowledge-graph", "entity-resolution", "osint", "cosine-similarity"]
related_apps = ["prismatic_ollama", "prismatic_storage_meilisearch", "prismatic_storage_kuzudb", "prismatic_osint_core", "prismatic_mycelial_nx"]
domain = "artificial-intelligence"
complexity = "intermediate"
stability = "stable"
since_generation = 8
beam_related = false
otp_behaviour = false
elixir_module = "PrismaticIntelligence.Embedding"
phoenix_component = false
security_relevant = false
compliance_relevant = false
osint_relevant = true
performance_critical = true
date_created = "2025-06-15"
date_updated = "2026-02-22"
version = "2.0.0"
author = "Tomas Korcak (korczis)"
reading_time = "10 min"
word_count = 1958
date_modified = "2026-02-23"
tags = ["glossary", "technology", "embedding", "prismatic"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Embedding - Prismatic Platform"
+++

## Definition

An embedding is a dense vector representation of data -- text, images, code, audio, or structured records -- in a continuous, high-dimensional space where semantic similarity maps to geometric proximity. Embedding models, typically neural networks built on the transformer architecture, transform discrete input tokens into fixed-length floating-point vectors (commonly 256 to 4096 dimensions), enabling mathematical operations that capture meaning rather than surface form. Two pieces of text with similar meaning produce vectors that are close together in the embedding space, even if they share no common words. This property enables semantic search, clustering, recommendation systems, anomaly detection, and [entity resolution](/glossary/entity-resolution/) without requiring exact keyword matching.

The mathematical foundation of embeddings rests on the distributional hypothesis: words (or concepts) that appear in similar contexts have similar meanings. Modern transformer-based models extend this principle beyond individual words to sentences, paragraphs, and entire documents, producing embeddings that capture complex semantic relationships including negation, analogy, and compositional meaning. The training process optimizes model parameters so that semantically related inputs map to nearby points in the vector space while unrelated inputs map to distant points, creating a continuous geometry of meaning that supports algebraic operations like analogy reasoning (king - man + woman = queen).

## Overview

Embeddings represent a fundamental shift from symbolic to distributed representations of meaning. In traditional information retrieval, documents are represented as sparse vectors in a vocabulary-sized space (bag-of-words, TF-IDF), where each dimension corresponds to a specific word. This representation suffers from the vocabulary mismatch problem: "automobile" and "car" occupy entirely different dimensions despite being synonyms. Embeddings solve this by learning dense representations where synonyms, paraphrases, and semantically related concepts cluster together.

The embedding pipeline typically operates in three phases:

| Phase | Operation | Output |
|-------|-----------|--------|
| **Encoding** | Input text/data processed by embedding model | Fixed-length float vector (e.g., 768 dimensions) |
| **Indexing** | Vectors stored in specialized index structures (HNSW, IVF) | Searchable vector index with sub-linear lookup time |
| **Retrieval** | Query vector compared against index using distance metric | Ranked list of nearest neighbors by semantic similarity |

The quality of embeddings depends on three factors: the model architecture (number of transformer layers, attention heads, hidden dimensions), the training data (domain coverage, diversity, quality), and the training objective (contrastive learning, masked language modeling, next-sentence prediction). Models trained on general web text produce embeddings suitable for broad semantic search, while domain-specific fine-tuning produces embeddings optimized for specialized vocabulary and relationships.

## Distance Metrics and Similarity

The choice of distance metric determines how similarity is measured in the embedding space. Different metrics capture different notions of similarity, and the choice affects both retrieval quality and computational efficiency:

| Metric | Formula | Range | Best For |
|--------|---------|-------|----------|
| **Cosine similarity** | cos(a,b) = a . b / (\|a\| \|b\|) | [-1, 1] | Text similarity (direction matters, not magnitude) |
| **Euclidean (L2)** | sqrt(sum((a_i - b_i)^2)) | [0, inf) | Spatial clustering, anomaly detection |
| **Dot product** | sum(a_i * b_i) | (-inf, inf) | When vectors are normalized (equivalent to cosine) |
| **Manhattan (L1)** | sum(\|a_i - b_i\|) | [0, inf) | Sparse embeddings, robust to outliers |

[Cosine similarity](/glossary/cosine-similarity/) is the default choice for text embeddings because it focuses on the direction of vectors (semantic orientation) rather than their magnitude, making it robust to differences in document length and embedding normalization. When embeddings are pre-normalized to unit length, cosine similarity reduces to the dot product, enabling faster computation without loss of ranking quality.

## Technical Details

### Embedding Model Architecture

Modern embedding models are based on the transformer architecture, typically using the encoder portion of the transformer. The process works as follows:

1. **Tokenization**: Input text is split into subword tokens using BPE (Byte Pair Encoding) or SentencePiece
2. **Token embedding**: Each token is mapped to a learnable vector
3. **Positional encoding**: Position information is added to preserve word order
4. **Transformer layers**: Multiple self-attention layers capture contextual relationships
5. **Pooling**: Token-level representations are aggregated into a single vector (mean pooling, CLS token, or attention-weighted)

| Model | Dimensions | Context Window | Speed | Quality |
|-------|-----------|----------------|-------|---------|
| **all-MiniLM-L6** | 384 | 256 tokens | Very fast | Good |
| **all-mpnet-base-v2** | 768 | 384 tokens | Fast | Very good |
| **e5-large-v2** | 1024 | 512 tokens | Medium | Excellent |
| **text-embedding-3-large** | 3072 | 8191 tokens | Slow (API) | State-of-art |
| **nomic-embed-text** | 768 | 8192 tokens | Fast (local) | Very good |

### Vector Indexing Algorithms

Exact nearest-neighbor search in high-dimensional space is computationally expensive (O(n*d) for n vectors of dimension d). Approximate Nearest Neighbor (ANN) algorithms trade a small accuracy loss for dramatic speedup:

| Algorithm | Approach | Build Time | Query Time | Memory | Accuracy |
|-----------|----------|------------|------------|--------|----------|
| **HNSW** | Hierarchical graph | Medium | O(log n) | High | 95-99% |
| **IVF** | Inverted file index | Fast | O(n/k) | Medium | 90-98% |
| **Product Quantization** | Vector compression | Fast | O(n/k) | Low | 85-95% |
| **Flat (brute force)** | Exhaustive scan | None | O(n*d) | Medium | 100% |

HNSW (Hierarchical Navigable Small World) is the dominant algorithm for production embedding search, offering the best balance of accuracy and query speed. It constructs a multi-layered graph where each layer provides a progressively coarser approximation of the neighborhood structure, enabling efficient greedy traversal from coarse to fine resolution.

## Embedding Operations

Embeddings support algebraic operations that capture semantic relationships. The Prismatic Platform implements these operations through dedicated modules that handle vector arithmetic, similarity scoring, and nearest-neighbor retrieval:

```elixir
defmodule PrismaticIntelligence.Embedding do
  @moduledoc """
  Embedding operations for semantic similarity computation.
  Provides vector arithmetic, similarity scoring, and clustering.
  Used across OSINT entity resolution, document search, and
  knowledge graph enrichment pipelines.
  """

  @type vector :: [float()]

  @spec cosine_similarity(vector(), vector()) :: float()
  def cosine_similarity(vec_a, vec_b) when length(vec_a) == length(vec_b) do
    dot = dot_product(vec_a, vec_b)
    norm_a = :math.sqrt(dot_product(vec_a, vec_a))
    norm_b = :math.sqrt(dot_product(vec_b, vec_b))

    case norm_a * norm_b do
      0.0 -> 0.0
      denominator -> dot / denominator
    end
  end

  @spec dot_product(vector(), vector()) :: float()
  def dot_product(vec_a, vec_b) do
    vec_a
    |> Enum.zip(vec_b)
    |> Enum.reduce(0.0, fn {a, b}, acc -> acc + a * b end)
  end

  @spec find_nearest(vector(), [{term(), vector()}], non_neg_integer()) ::
          {:ok, [{term(), float()}]} | {:error, term()}
  def find_nearest(query_vec, candidates, k \\ 10) do
    results =
      candidates
      |> Enum.map(fn {id, vec} ->
        {id, cosine_similarity(query_vec, vec)}
      end)
      |> Enum.sort_by(fn {_id, sim} -> sim end, :desc)
      |> Enum.take(k)

    {:ok, results}
  end

  @spec centroid([vector()]) :: {:ok, vector()} | {:error, :empty_vectors}
  def centroid([]), do: {:error, :empty_vectors}

  def centroid(vectors) do
    dim = length(hd(vectors))
    count = length(vectors)

    result =
      vectors
      |> Enum.reduce(List.duplicate(0.0, dim), fn vec, acc ->
        Enum.zip_with(acc, vec, &(&1 + &2))
      end)
      |> Enum.map(&(&1 / count))

    {:ok, result}
  end

  @spec normalize(vector()) :: {:ok, vector()} | {:error, :zero_vector}
  def normalize(vec) do
    norm = :math.sqrt(dot_product(vec, vec))

    case norm do
      0.0 -> {:error, :zero_vector}
      n -> {:ok, Enum.map(vec, &(&1 / n))}
    end
  end
end
```

## Implementation in Prismatic Platform

The Prismatic Platform uses embeddings across multiple intelligence and search capabilities, integrating local model inference through [Ollama](/glossary/ollama/) with indexed search through [Meilisearch](/glossary/meilisearch/) and graph enrichment through [KuzuDB](/glossary/kuzudb/).

### Meilisearch Hybrid Search

[Meilisearch](/glossary/meilisearch/) provides hybrid keyword-vector search over the platform's documentation files, combining traditional BM25 keyword scoring with semantic embedding similarity:

```elixir
defmodule PrismaticStorage.Meilisearch.EmbeddingSearch do
  @moduledoc """
  Hybrid search combining keyword matching with embedding similarity.
  Configurable semantic ratio allows tuning between keyword precision
  and semantic recall based on query characteristics.
  """

  @spec hybrid_search(String.t(), keyword()) :: {:ok, [map()]} | {:error, term()}
  def hybrid_search(query, opts \\ []) do
    limit = Keyword.get(opts, :limit, 20)
    semantic_ratio = Keyword.get(opts, :semantic_ratio, 0.5)

    body = %{
      q: query,
      limit: limit,
      hybrid: %{
        semanticRatio: semantic_ratio,
        embedder: "default"
      }
    }

    case PrismaticStorage.Meilisearch.Client.search("documents", body) do
      {:ok, %{"hits" => hits}} -> {:ok, hits}
      {:error, reason} -> {:error, {:search_failed, reason}}
    end
  end
end
```

### OSINT Entity Resolution

The [OSINT](/glossary/osint/) framework generates entity embeddings for cross-source intelligence correlation. Embedding-based entity resolution identifies matching entities across different data sources even when names, addresses, or identifiers are written differently:

| Embedding Use Case | Model | Dimensions | Purpose |
|-------------------|-------|-----------|---------|
| Document search | nomic-embed-text | 768 | Semantic search over documentation |
| Code similarity | qwen3-coder | 768 | Finding similar Elixir patterns |
| Entity resolution | e5-large-v2 | 1024 | Cross-source entity matching |
| Knowledge graph | node2vec (custom) | 128 | Graph node embeddings for KuzuDB |
| Anomaly detection | all-MiniLM-L6 | 384 | Detecting unusual OSINT signals |

### Ollama Local Embedding

The platform runs local embedding models through [Ollama](/glossary/ollama/), avoiding external API dependencies and maintaining data privacy for sensitive OSINT operations:

```elixir
defmodule PrismaticAI.Ollama.Embeddings do
  @moduledoc """
  Local embedding generation through Ollama.
  Supports multiple models for different use cases.
  Provides batch embedding with configurable concurrency.
  """

  @spec embed(String.t(), keyword()) :: {:ok, [float()]} | {:error, term()}
  def embed(text, opts \\ []) do
    model = Keyword.get(opts, :model, "nomic-embed-text")

    body = %{model: model, prompt: text}

    case Req.post("#{ollama_url()}/api/embeddings", json: body) do
      {:ok, %{status: 200, body: %{"embedding" => vector}}} ->
        {:ok, vector}

      {:ok, %{status: status}} ->
        {:error, {:unexpected_status, status}}

      {:error, reason} ->
        {:error, {:embedding_failed, reason}}
    end
  end

  @spec embed_batch([String.t()], keyword()) :: {:ok, [[float()]]} | {:error, term()}
  def embed_batch(texts, opts \\ []) do
    texts
    |> Task.async_stream(
      fn text -> embed(text, opts) end,
      max_concurrency: Keyword.get(opts, :concurrency, 4),
      timeout: :timer.seconds(30)
    )
    |> Enum.reduce_while({:ok, []}, fn
      {:ok, {:ok, vec}}, {:ok, acc} -> {:cont, {:ok, [vec | acc]}}
      {:ok, {:error, reason}}, _ -> {:halt, {:error, reason}}
      {:exit, reason}, _ -> {:halt, {:error, {:task_exit, reason}}}
    end)
    |> case do
      {:ok, vecs} -> {:ok, Enum.reverse(vecs)}
      error -> error
    end
  end

  defp ollama_url do
    Application.get_env(:prismatic_ai, :ollama_url, "http://localhost:11434")
  end
end
```

## Embedding Dimensionality and Quality Trade-offs

The number of dimensions in an embedding vector determines both the representational capacity and the computational cost of working with it. Higher-dimensional embeddings capture finer semantic distinctions but require more memory, longer computation times, and larger index structures.

| Dimensions | Memory per Vector | Index Size (1M vectors) | Query Latency | Semantic Resolution |
|-----------|-------------------|------------------------|---------------|---------------------|
| 128 | 512 bytes | ~512 MB | Very low | Coarse |
| 384 | 1.5 KB | ~1.5 GB | Low | Good |
| 768 | 3 KB | ~3 GB | Medium | High |
| 1024 | 4 KB | ~4 GB | Medium-High | Very High |
| 3072 | 12 KB | ~12 GB | High | Maximum |

Dimensionality reduction techniques like PCA or Matryoshka embeddings allow using the same model at different dimension counts, trading quality for efficiency at query time. The Prismatic Platform typically operates at 768 dimensions for general-purpose search and 1024 dimensions for entity resolution where higher precision justifies the additional cost.

## Embedding Caching and Lifecycle

Embedding computation is expensive relative to storage and retrieval. The platform implements a multi-tier caching strategy to minimize redundant computation:

| Tier | Storage | Latency | Capacity | Eviction |
|------|---------|---------|----------|----------|
| **L1: ETS** | In-memory process table | Microseconds | Hot set (~10K vectors) | LRU with TTL |
| **L2: Meilisearch** | On-disk with memory-mapped index | Milliseconds | Full corpus | None (persistent) |
| **L3: PostgreSQL** | Relational storage with pgvector | Low milliseconds | Archive | None (persistent) |

Embeddings are recomputed only when the source content changes, detected through content hashing. A SHA-256 hash of the input text serves as the cache key, ensuring that unchanged documents reuse their existing embeddings across pipeline runs. This caching strategy reduces embedding computation costs by approximately 95% during incremental updates.

## Comparison with Alternatives

| Representation | Semantic Awareness | Storage Size | Query Speed | Best For |
|---------------|-------------------|--------------|-------------|----------|
| **Dense embeddings** | High (learned) | Medium (768-4096 floats) | Fast (ANN) | Semantic search, similarity |
| **Sparse embeddings (TF-IDF)** | None (keyword) | Large (vocabulary-sized) | Fast (inverted index) | Exact keyword matching |
| **Hybrid (BM25 + embeddings)** | High | Large | Medium | Production search systems |
| **Knowledge graph** | Structured | Variable | Medium (traversal) | Explicit relationships |
| **Bag of words** | None | Large | Fast | Simple classification |

The Prismatic Platform favors hybrid approaches wherever possible. [Meilisearch](/glossary/meilisearch/) hybrid search combines BM25 keyword scoring with embedding similarity, capturing both exact matches (when a user searches for a specific function name or error code) and semantic matches (when a user describes a concept in different words). This hybrid approach consistently outperforms either pure keyword or pure semantic search in retrieval benchmarks.

## Best Practices

1. **Choose Models by Use Case**: Use smaller, faster models (MiniLM, 384 dimensions) for real-time search and larger models (e5-large, 1024 dimensions) for batch entity resolution where accuracy matters more than latency. The model selection should match the latency and quality requirements of the specific pipeline stage.

2. **Normalize Vectors**: Always normalize embeddings to unit length before storing in vector indices. This ensures cosine similarity equals dot product, simplifying computation and enabling use of optimized dot-product kernels.

3. **Chunk Long Documents**: Embedding models have context window limits. Split long documents into overlapping chunks (512-1024 tokens with 10-20% overlap) and embed each chunk separately. Maintain metadata linking chunks to their parent document for result deduplication.

4. **Cache Embeddings**: Embedding computation is expensive. Cache vectors in [ETS](/glossary/ets/) or [Meilisearch](/glossary/meilisearch/) and re-embed only when source content changes. Use content hashing to detect changes efficiently.

5. **Monitor Embedding Quality**: Track retrieval precision and recall metrics. Embedding quality degrades for domains far from the model's training data distribution. Monitor semantic search relevance and retrain or fine-tune when quality drops below acceptable thresholds.

6. **Use Local Models for Privacy**: [Ollama](/glossary/ollama/) enables local embedding generation without sending data to external APIs, critical for [OSINT](/glossary/osint/) and security-sensitive content where data sovereignty requirements prohibit external processing.

7. **Batch for Throughput**: When embedding large document collections, use batch processing with configurable concurrency. The `embed_batch/2` function processes multiple texts in parallel, saturating available compute resources without overwhelming the embedding model.

8. **Version Embeddings**: When switching embedding models, re-embed the entire corpus. Embeddings from different models are not compatible -- their vector spaces have different geometries. Track which model produced each embedding to prevent cross-model comparison.

## Use Cases

- **Semantic Documentation Search**: Finding relevant documentation using meaning-based queries rather than exact keyword matching. Users can search for "how to handle failed requests" and find documentation about error handling, retry logic, and circuit breakers even if those exact words do not appear in the query.

- **OSINT Entity Resolution**: Matching entities across intelligence sources (company names, person names, addresses) that may be written differently but refer to the same entity. "Acme Corp.", "ACME Corporation", and "Acme" all produce similar embeddings, enabling automated deduplication.

- **Code Similarity Detection**: Finding similar Elixir patterns and implementations across the platform's source files for refactoring and deduplication. Code embeddings capture functional similarity beyond syntactic similarity, identifying semantically equivalent implementations with different coding styles.

- **Anomaly Detection**: Identifying unusual signals in OSINT data streams by measuring distance from cluster centroids in the embedding space. Entities or documents that fall far from any established cluster warrant investigation as potential novel threats or data quality issues.

- **Knowledge Graph Enrichment**: Generating node embeddings for [KuzuDB](/glossary/kuzudb/) graph nodes to predict missing relationships and detect anomalous graph structures. Node2vec-style embeddings capture graph topology in a way that supports link prediction and community detection.

- **Cross-Lingual Intelligence**: Multilingual embedding models map text in different languages to the same vector space, enabling intelligence correlation across Czech, English, and other language sources without explicit translation.

## Related Concepts

- [Vector Database](/glossary/vector-database/) - Storage system optimized for embedding similarity search
- [Meilisearch](/glossary/meilisearch/) - Search engine providing hybrid keyword-vector retrieval
- [Ollama](/glossary/ollama/) - Local AI runtime generating embeddings from platform models
- [Knowledge Graph](/glossary/knowledge-graph/) - Graph structure enriched by entity embeddings
- [Entity Resolution](/glossary/entity-resolution/) - Identity matching using embedding similarity
- [OSINT](/glossary/osint/) - Intelligence operations leveraging embedding-based correlation
- [KuzuDB](/glossary/kuzudb/) - Graph database with node embedding integration
- [Cosine Similarity](/glossary/cosine-similarity/) - Primary distance metric for embedding comparison
- [ETS](/glossary/ets/) - In-memory cache for hot embedding vectors
- [Broadway](/glossary/broadway/) - Pipeline framework for batch embedding processing
- [Data Pipeline](/glossary/data-pipeline/) - Infrastructure for moving embeddings through processing stages

## See Also

- [Architecture](/architecture/) -- Platform architecture and embedding integration patterns
- [Technologies](/technologies/) -- Embedding model and vector search technology stack
- [Capabilities](/capabilities/) -- Intelligence and search capabilities powered by embeddings

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
