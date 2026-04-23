+++
title = "RAG for Internal Knowledge: When the LLM Should Not Make Things Up"
date = 2026-04-09
description = "Retrieval-augmented generation sounds like magic. In practice it is three boring primitives — chunk, embed, retrieve — wired carefully enough that the LLM stops hallucinating about your own codebase."

[extra]
author = "Tomáš Korcak (korczis)"
category = "engineering"
tags = ["rag", "llm", "embeddings", "vector-database", "knowledge"]
reading_time = "7 min"
keywords = ["RAG Elixir", "retrieval augmented generation", "internal knowledge", "LLM grounding"]
image = "/images/blog/rag.png"
word_count = 510
date_created = "2026-04-09"
date_modified = "2026-04-09"
quality_score = 34
see_also = ["rag", "llm", "embedding", "vector-database", "meilisearch"]
image_alt = "RAG for Internal Knowledge"
+++

[RAG](@/glossary/rag.md) is not a model. It is a pipeline that grounds an [LLM](@/glossary/llm.md) in documents it was never trained on. For a Prismatic team member asking "how does the decision envelope seal work?", the answer should come from the actual code and docs — not from what the model guessed. Get the pipeline right and the model stops hallucinating about your own codebase. Get it wrong and RAG is worse than no retrieval at all, because confident wrong answers are worse than "I don't know."

## The three primitives

1. **Chunk.** Split each source document into passages of ~500 tokens with ~50-token overlap. Smaller chunks miss context; larger chunks dilute the relevance score.
2. **Embed.** Turn each chunk into a vector using a stable model. Store the vector plus the source reference in a [vector database](@/glossary/vector-database.md).
3. **Retrieve.** At query time, embed the query, fetch the top-k nearest chunks, and pass them to the LLM with the instruction "answer only from the provided context."

That's it. Every "RAG framework" adds features on top of these three primitives; the primitives themselves do most of the work.

## The step everyone skips: hybrid search

Pure vector search is bad at rare terms. "What does `binary_to_term/2` do?" should return the exact function — but an [embedding](@/glossary/embedding.md) of the question may not put the exact function near the top. The fix is hybrid retrieval: combine BM25-style keyword search (via [Meilisearch](@/glossary/meilisearch.md)) with vector search, then rerank. You keep the semantic recall of vectors and the exact-match precision of keywords.

```elixir
def retrieve(query, k \\ 8) do
  keyword_hits = Meilisearch.search("docs", query, limit: k)
  vector_hits  = VectorStore.nearest(embed(query), limit: k)
  (keyword_hits ++ vector_hits)
  |> dedup_by(& &1.chunk_id)
  |> Enum.sort_by(&score/1, :desc)
  |> Enum.take(k)
end
```

## Prompt: constrain the model

The prompt template matters as much as the retrieval:

```
Answer the question below using ONLY the numbered context passages.
If the context does not contain the answer, say "not found in the docs."
Cite passage numbers in your answer like [1], [2].

CONTEXT:
[1] <chunk>
[2] <chunk>
...

QUESTION: <query>
```

"Say not found" is the load-bearing line. Without it the model invents an answer. With it, a bad retrieval fails loudly instead of silently.

## Where RAG is wrong

RAG is wrong when:

- The question requires reasoning over the entire corpus (e.g. "how many agents are there?"). Retrieval returns 8 chunks; the model cannot count what it does not see.
- The answer changes frequently. Embeddings go stale. Either reindex aggressively or route those queries to a live system.
- The user wants authority. "Can I delete this module?" needs a live dependency analysis, not a retrieved README.

## Where to go next

- **Academy**: [Storage Patterns](/academy/learn/storage-patterns) — where the vector DB fits
- **Glossary**: [RAG](@/glossary/rag.md), [LLM](@/glossary/llm.md), [Embedding](@/glossary/embedding.md), [Vector Database](@/glossary/vector-database.md), [Meilisearch](@/glossary/meilisearch.md)

Three primitives. One hybrid retrieval. One honest prompt. That is RAG.
