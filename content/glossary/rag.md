+++
title = "RAG"
weight = 48
[extra]
category = "technology"
description = "Retrieval-Augmented Generation combining search with LLM generation"
related_terms = ["ollama", "vector-database", "meilisearch", "knowledge-graph", "osint", "data-pipeline"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1321
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["RAG", "Retrieval-Augmented", "Generation", "glossary", "technology", "Prismatic Platform", "README", "Retrieval", "Hybrid"]
tags = ["glossary", "technology", "rag", "prismatic"]
quality_score = 77
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "RAG - Prismatic Platform"
+++

## Definition & Overview

RAG (Retrieval-Augmented Generation) is an AI architecture pattern that enhances Large Language Model (LLM) responses by first retrieving relevant documents from a knowledge base and injecting them into the model's context window before generation. Rather than relying solely on a model's parametric knowledge -- frozen at training time -- RAG grounds outputs in specific, verifiable, and up-to-date information retrieved dynamically at inference time.

The pattern was formalized by Lewis et al. in their 2020 paper "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks," which demonstrated that combining a pre-trained sequence-to-sequence model with a dense retrieval mechanism significantly improved performance on knowledge-intensive benchmarks. Since then, RAG has become the dominant architecture for building production AI systems that require factual accuracy, domain specificity, and auditability.

RAG pipelines consist of three fundamental stages: **indexing** (embedding and storing documents into a searchable format), **retrieval** (finding the most relevant document chunks via similarity search, keyword matching, or hybrid approaches), and **generation** (producing answers conditioned on the retrieved context). The quality of each stage directly determines the overall system's accuracy, latency, and reliability.

| Component | Function | Key Technologies |
|-----------|----------|-----------------|
| **Indexer** | Converts documents into searchable representations | Embedding models, chunking strategies, vector stores |
| **Retriever** | Finds relevant documents for a given query | Dense retrieval, BM25, hybrid search, reranking |
| **Generator** | Produces responses conditioned on retrieved context | LLMs (local or cloud), prompt engineering, output parsing |
| **Orchestrator** | Coordinates the pipeline end-to-end | Query routing, fallback chains, caching |

## Technical Deep Dive

### Retrieval Mechanisms

The retrieval stage is the most critical component in a RAG pipeline, as generation quality is bounded by retrieval quality. Several retrieval strategies exist, each with distinct tradeoffs:

**Dense Retrieval** encodes both queries and documents into high-dimensional vector representations using embedding models. Similarity is computed via cosine distance or dot product in the embedding space. Dense retrieval excels at semantic matching -- understanding that "BEAM virtual machine" and "Erlang runtime" refer to related concepts -- but can miss exact keyword matches.

**Sparse Retrieval** (BM25, TF-IDF) uses traditional information retrieval algorithms based on term frequency and inverse document frequency. Sparse methods excel at exact keyword matching and are computationally efficient but fail to capture semantic relationships between terms that differ lexically.

**Hybrid Retrieval** combines dense and sparse approaches, typically using reciprocal rank fusion (RRF) or learned score combination to merge results from both retrieval pipelines. Hybrid approaches consistently outperform either method alone across diverse benchmarks.

**Reranking** applies a cross-encoder model to re-score the top-K retrieved documents, improving precision at the cost of additional latency. Cross-encoders see the query and document simultaneously, enabling deeper interaction modeling than bi-encoder retrieval.

### Chunking Strategies

Document chunking -- how source documents are segmented into retrievable units -- has an outsized impact on RAG quality:

```elixir
defmodule Prismatic.RAG.Chunker do
  @moduledoc """
  Document chunking strategies for RAG indexing pipelines.
  Supports fixed-size, semantic, and recursive chunking approaches.
  """

  @default_chunk_size 512
  @default_overlap 64

  @spec chunk(String.t(), keyword()) :: [%{content: String.t(), metadata: map()}]
  def chunk(document, opts \\ []) do
    strategy = Keyword.get(opts, :strategy, :recursive)
    chunk_size = Keyword.get(opts, :chunk_size, @default_chunk_size)
    overlap = Keyword.get(opts, :overlap, @default_overlap)

    case strategy do
      :fixed -> fixed_chunks(document, chunk_size, overlap)
      :semantic -> semantic_chunks(document)
      :recursive -> recursive_chunks(document, chunk_size, overlap)
    end
  end

  defp recursive_chunks(document, chunk_size, overlap) do
    separators = ["\n\n", "\n", ". ", " "]

    document
    |> split_by_separators(separators, chunk_size)
    |> add_overlap(overlap)
    |> Enum.with_index()
    |> Enum.map(fn {content, idx} ->
      %{
        content: content,
        metadata: %{chunk_index: idx, strategy: :recursive, size: String.length(content)}
      }
    end)
  end

  defp split_by_separators(text, [separator | rest], max_size) do
    chunks = String.split(text, separator)

    if Enum.all?(chunks, &(String.length(&1) <= max_size)) do
      chunks
    else
      Enum.flat_map(chunks, fn chunk ->
        if String.length(chunk) > max_size do
          split_by_separators(chunk, rest, max_size)
        else
          [chunk]
        end
      end)
    end
  end

  defp split_by_separators(text, [], max_size) do
    text
    |> String.graphemes()
    |> Enum.chunk_every(max_size)
    |> Enum.map(&Enum.join/1)
  end

  defp add_overlap(chunks, overlap_size) do
    chunks
    |> Enum.with_index()
    |> Enum.map(fn {chunk, idx} ->
      prefix = if idx > 0, do: String.slice(Enum.at(chunks, idx - 1), -overlap_size..-1), else: ""
      prefix <> chunk
    end)
  end
end
```

### Context Window Management

Managing the context window budget is essential for RAG effectiveness. Each retrieved chunk consumes tokens, and overfilling the context window dilutes attention across irrelevant content. Effective RAG systems implement token budgeting:

```elixir
defmodule Prismatic.RAG.ContextBuilder do
  @moduledoc """
  Builds optimized context windows from retrieved chunks,
  respecting token budgets and relevance thresholds.
  """

  @max_context_tokens 4096
  @min_relevance_score 0.7

  @spec build_context([%{content: String.t(), score: float()}], keyword()) ::
          {:ok, String.t()} | {:error, :insufficient_context}
  def build_context(ranked_chunks, opts \\ []) do
    max_tokens = Keyword.get(opts, :max_tokens, @max_context_tokens)
    min_score = Keyword.get(opts, :min_relevance, @min_relevance_score)

    context =
      ranked_chunks
      |> Enum.filter(&(&1.score >= min_score))
      |> Enum.reduce_while({[], 0}, fn chunk, {acc, token_count} ->
        chunk_tokens = estimate_tokens(chunk.content)

        if token_count + chunk_tokens <= max_tokens do
          {:cont, {[chunk.content | acc], token_count + chunk_tokens}}
        else
          {:halt, {acc, token_count}}
        end
      end)
      |> elem(0)
      |> Enum.reverse()
      |> Enum.join("\n\n---\n\n")

    if String.length(context) > 0 do
      {:ok, context}
    else
      {:error, :insufficient_context}
    end
  end

  defp estimate_tokens(text) do
    # Approximate: 1 token per 4 characters for English text
    # Code tokens are typically shorter, ~3 characters per token
    div(String.length(text), 4)
  end
end
```

## Architecture & Implementation

A production RAG system requires careful architectural design across indexing, retrieval, and generation subsystems. The following diagram illustrates the end-to-end flow:

```
Documents --> Chunker --> Embedder --> Vector Store (Index)
                                           |
Query --> Query Encoder --------> Retriever --> Reranker --> Context Builder --> LLM --> Response
                |                                                                  |
                +-- Query Expansion/Rewriting ----+                               +-- Citation Extraction
```

### Indexing Pipeline

The indexing pipeline runs asynchronously, processing new documents as they arrive. Key considerations include incremental indexing (avoiding full re-index on updates), deduplication (preventing duplicate chunks from inflating retrieval results), and metadata preservation (maintaining source file paths, timestamps, and authorship for provenance tracking).

### Retrieval Pipeline

At query time, the retrieval pipeline must balance latency against recall. Production systems typically implement a two-stage retrieval architecture: a fast initial retrieval using approximate nearest neighbor (ANN) search to fetch top-100 candidates, followed by a precise reranking step that re-scores the top-K using a cross-encoder model.

### Generation Pipeline

The generation stage constructs a prompt combining the user's query, retrieved context, and system instructions. Effective prompts instruct the model to cite specific retrieved passages, acknowledge when retrieved context is insufficient, and avoid fabricating information not present in the provided context.

## Usage in Prismatic Platform

The Prismatic Platform implements RAG patterns across multiple subsystems for context-aware AI operations:

**Knowledge Base Indexing**: The platform's 11,308 documentation files and 6,652 Elixir source files serve as the knowledge base, indexed through [Meilisearch](@/glossary/meilisearch.md)'s hybrid search engine. This provides both dense semantic search and sparse keyword matching in a single retrieval call, eliminating the need for separate retrieval pipelines.

**Local Model Integration**: [Ollama](@/glossary/ollama.md) local models (qwen3-coder 7B, gpt-oss:20b, deepseek-coder 6.7B) receive retrieved context for code generation and analysis tasks. The RAG pipeline manages token budgets across models with different context window sizes, automatically adjusting retrieval depth based on the target model's capacity.

**AIAD Agent Context**: The AIAD agent system uses RAG to ground agent responses in platform-specific knowledge from CLAUDE.md files, session contexts, and quality DNA state. When an agent processes a request, relevant documentation is retrieved and injected into the agent's context, ensuring responses reflect current platform state rather than stale training data.

**OSINT Intelligence Synthesis**: The OSINT intelligence pipeline uses RAG to synthesize findings from multiple data sources into coherent intelligence reports. Retrieved documents from sanctions lists, domain registration records, and certificate transparency logs are combined with analytical prompts to generate structured intelligence assessments.

**Session Continuity**: The SessionLifecycle system stores and retrieves session context from `.claude/session-context/`, enabling RAG-based continuity across development sessions. Previous session findings, decisions, and open questions are retrieved and provided as context for new sessions.

## Code Examples

### Complete RAG Pipeline

```elixir
defmodule Prismatic.RAG.Pipeline do
  @moduledoc """
  End-to-end RAG pipeline coordinating retrieval and generation
  for platform knowledge queries.
  """

  alias Prismatic.RAG.{Chunker, ContextBuilder}

  @spec query(String.t(), keyword()) :: {:ok, %{answer: String.t(), sources: [map()]}} | {:error, term()}
  def query(question, opts \\ []) do
    model = Keyword.get(opts, :model, "qwen3-coder")
    max_chunks = Keyword.get(opts, :max_chunks, 10)
    collection = Keyword.get(opts, :collection, "platform_docs")

    with {:ok, retrieved} <- retrieve(question, collection, max_chunks),
         {:ok, context} <- ContextBuilder.build_context(retrieved),
         {:ok, response} <- generate(question, context, model) do
      {:ok, %{
        answer: response,
        sources: Enum.map(retrieved, &Map.take(&1, [:source, :score])),
        model: model,
        chunks_used: length(retrieved)
      }}
    end
  end

  defp retrieve(question, collection, max_chunks) do
    case Prismatic.Search.hybrid_search(collection, question, limit: max_chunks) do
      {:ok, results} when results != [] ->
        {:ok, Enum.map(results, fn r ->
          %{content: r.content, score: r.score, source: r.metadata.source}
        end)}

      {:ok, []} ->
        {:error, :no_relevant_documents}

      {:error, reason} ->
        {:error, {:retrieval_failed, reason}}
    end
  end

  defp generate(question, context, model) do
    prompt = """
    Based on the following documentation context, answer the question accurately.
    If the context doesn't contain enough information, say so explicitly.
    Cite specific sections when possible.

    Context:
    #{context}

    Question: #{question}
    """

    Prismatic.Ollama.generate(model, prompt, temperature: 0.1)
  end
end
```

### Indexing Documents

```elixir
defmodule Prismatic.RAG.Indexer do
  @moduledoc """
  Indexes platform documentation for RAG retrieval.
  Processes Elixir source files, markdown docs, and AIAD specs.
  """

  alias Prismatic.RAG.Chunker

  @spec index_directory(String.t(), keyword()) :: {:ok, non_neg_integer()} | {:error, term()}
  def index_directory(path, opts \\ []) do
    collection = Keyword.get(opts, :collection, "platform_docs")
    extensions = Keyword.get(opts, :extensions, [".ex", ".md", ".yaml"])

    files =
      path
      |> Path.join("**/*")
      |> Path.wildcard()
      |> Enum.filter(fn f -> Path.extname(f) in extensions end)

    results =
      files
      |> Task.async_stream(
        fn file -> index_file(file, collection) end,
        max_concurrency: System.schedulers_online(),
        timeout: 30_000
      )
      |> Enum.reduce({0, []}, fn
        {:ok, {:ok, count}}, {total, errors} -> {total + count, errors}
        {:ok, {:error, reason}}, {total, errors} -> {total, [reason | errors]}
        {:exit, reason}, {total, errors} -> {total, [{:exit, reason} | errors]}
      end)

    case results do
      {total, []} -> {:ok, total}
      {total, errors} -> {:ok, total}  # Log errors but don't fail
    end
  end

  defp index_file(file_path, collection) do
    with {:ok, content} <- File.read(file_path) do
      chunks = Chunker.chunk(content, strategy: chunk_strategy(file_path))

      indexed =
        chunks
        |> Enum.map(fn chunk ->
          Map.put(chunk, :metadata, Map.merge(chunk.metadata, %{
            source: file_path,
            extension: Path.extname(file_path),
            indexed_at: DateTime.utc_now()
          }))
        end)

      Prismatic.Search.index_documents(collection, indexed)
      {:ok, length(indexed)}
    end
  end

  defp chunk_strategy(path) do
    case Path.extname(path) do
      ".ex" -> :semantic
      ".md" -> :recursive
      _ -> :fixed
    end
  end
end
```

## Best Practices

1. **Chunk Size Calibration**: Test multiple chunk sizes (256, 512, 1024 tokens) against your specific query patterns. Smaller chunks improve precision but may lose context; larger chunks preserve context but reduce retrieval granularity.

2. **Hybrid Retrieval by Default**: Always combine dense and sparse retrieval unless profiling proves one method sufficient. Hybrid approaches consistently outperform single-method retrieval.

3. **Metadata-Enriched Chunks**: Attach source file paths, timestamps, section headers, and document types as metadata. This enables filtered retrieval and proper citation in generated responses.

4. **Evaluation-Driven Development**: Measure retrieval quality (recall@K, MRR) and generation quality (faithfulness, relevance) separately. A generation problem may actually be a retrieval problem.

5. **Token Budget Management**: Reserve at least 30% of the context window for the model's response generation. Overfilling with retrieved context leaves insufficient room for reasoning.

6. **Incremental Indexing**: Implement change detection to re-index only modified documents. Full re-indexing becomes prohibitively expensive as knowledge bases grow.

7. **Query Preprocessing**: Apply query expansion, spelling correction, and entity recognition before retrieval. The quality of the retrieval query directly bounds the quality of retrieved documents.

## Common Pitfalls

- **Lost in the Middle**: LLMs tend to underweight information in the middle of long contexts. Place the most relevant chunks at the beginning and end of the context window.

- **Chunk Boundary Artifacts**: Fixed-size chunking can split sentences, code blocks, or logical units mid-thought. Use recursive or semantic chunking to respect natural document boundaries.

- **Retrieval-Generation Mismatch**: The retrieved documents may be relevant to the topic but not to the specific question asked. Implement query-aware reranking to bridge this gap.

- **Stale Indexes**: Knowledge bases that update frequently require near-real-time indexing. Stale indexes return outdated information that the model presents as current.

- **Hallucination Despite Context**: Even with retrieved context, models may fabricate details not present in the provided documents. Instruct models explicitly to only use provided context and implement faithfulness checks.

- **Over-Retrieval**: Retrieving too many chunks dilutes the signal-to-noise ratio. Implement relevance score thresholds and adaptive retrieval depth based on query confidence.

## Related Concepts

- [Ollama](@/glossary/ollama.md) - Local AI runtime powering RAG generation with platform models
- [Vector Database](@/glossary/vector-database.md) - Storage enabling similarity-based document retrieval
- [Meilisearch](@/glossary/meilisearch.md) - Search engine providing hybrid retrieval for RAG pipelines
- [Knowledge Graph](@/glossary/knowledge-graph.md) - Structured knowledge complementing document-based RAG
- [Data Pipeline](@/glossary/data-pipeline.md) - Processing infrastructure feeding RAG knowledge bases
- [Tokenization](@/glossary/tokenization.md) - Text-to-token conversion underlying RAG context management
- [SEADF](@/glossary/seadf.md) - Self-evolving framework using RAG for knowledge synthesis

## See Also

- [prismatic_ollama](../../../apps/prismatic_ollama/README.md) -- Local AI runtime powering RAG generation
- [prismatic_storage_meilisearch](../../../apps/prismatic_storage_meilisearch/README.md) -- Hybrid search engine for RAG retrieval
- [prismatic_storage_kuzudb](../../../apps/prismatic_storage_kuzudb/README.md) -- Graph-based knowledge retrieval for RAG
- [prismatic_claude](../../../apps/prismatic_claude/README.md) -- Session context retrieval for RAG continuity
- [prismatic_agents](../../../apps/prismatic_agents/README.md) -- Agent system using RAG for grounded responses
- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Apps](@/apps/_index.md) -- Application catalog

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)