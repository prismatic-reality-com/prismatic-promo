+++
title = "Sparkline: Building a Content Analysis SaaS in Elixir"
date = 2026-03-24
description = "Inside Sparkline's NLP pipeline: sentiment analysis, entity extraction, topic modeling, and API integration for content intelligence at scale."

[extra]
author = "Tomas Korcak (korczis)"
category = "product"
tags = ["sparkline", "nlp", "content-analysis", "sentiment", "entity-extraction"]
reading_time = "10 min"
keywords = ["content analysis saas", "nlp pipeline elixir", "sentiment analysis", "entity extraction", "topic modeling", "sparkline"]
image = "/images/blog/sparkline-content-analysis.png"
word_count = 1350
date_created = "2026-03-24"
date_modified = "2026-03-24"
quality_score = 85
see_also = ["sparkline", "full-text-search", "meilisearch", "llm", "rag"]
image_alt = "Sparkline Content Analysis - Prismatic Platform"
+++

Content analysis is one of those domains where the gap between a demo and a production system is enormous. A demo can run sentiment analysis on a single paragraph in a Jupyter notebook. A production system needs to process thousands of documents per hour, handle multiple languages, extract structured entities, model topics across a corpus, and expose results through a stable API. Sparkline is Prismatic's content analysis subsystem, running as a standalone Phoenix application on port 4002.

## The Pipeline

Every document entering Sparkline passes through a five-stage pipeline:

```
Ingestion → Preprocessing → Analysis → Enrichment → Storage/API
```

Each stage is implemented as a separate module with a consistent interface, allowing stages to be composed, replaced, or parallelized independently.

### Stage 1: Ingestion

Documents enter through either the REST API or internal PubSub messages. The ingestion stage normalizes input format and creates a processing context:

```elixir
defmodule Sparkline.Pipeline.Ingestion do
  @moduledoc """
  Document ingestion with format normalization
  and processing context creation.
  """

  @spec ingest(map()) :: {:ok, Sparkline.Document.t()} | {:error, term()}
  def ingest(params) do
    with {:ok, content} <- extract_content(params),
         {:ok, language} <- detect_language(content),
         {:ok, doc} <- create_document(content, language, params) do
      {:ok, doc}
    end
  end

  defp detect_language(content) do
    case Lingua.detect(content) do
      {:ok, lang} -> {:ok, lang}
      :error -> {:ok, :en}  # default fallback
    end
  end

  defp extract_content(%{"text" => text}) when is_binary(text), do: {:ok, text}
  defp extract_content(%{"url" => url}) when is_binary(url), do: fetch_and_extract(url)
  defp extract_content(%{"html" => html}) when is_binary(html), do: {:ok, strip_html(html)}
  defp extract_content(_), do: {:error, :invalid_content}
end
```

### Stage 2: Preprocessing

Preprocessing prepares the raw text for analysis. This includes tokenization, sentence splitting, and normalization:

```elixir
defmodule Sparkline.Pipeline.Preprocessing do
  @moduledoc """
  Text preprocessing: tokenization, sentence splitting,
  stopword removal, and normalization.
  """

  @spec preprocess(Sparkline.Document.t()) :: {:ok, Sparkline.Document.t()}
  def preprocess(doc) do
    sentences = split_sentences(doc.content)
    tokens = Enum.flat_map(sentences, &tokenize/1)
    normalized = normalize_tokens(tokens, doc.language)

    {:ok, %{doc |
      sentences: sentences,
      tokens: tokens,
      normalized_tokens: normalized,
      stats: %{
        sentence_count: length(sentences),
        token_count: length(tokens),
        unique_tokens: tokens |> MapSet.new() |> MapSet.size()
      }
    }}
  end

  defp split_sentences(text) do
    text
    |> String.split(~r/(?<=[.!?])\s+(?=[A-Z\p{Lu}])/, trim: true)
    |> Enum.map(&String.trim/1)
    |> Enum.reject(&(&1 == ""))
  end

  defp tokenize(sentence) do
    sentence
    |> String.downcase()
    |> String.split(~r/[\s\p{P}]+/, trim: true)
  end
end
```

### Stage 3: Analysis

The analysis stage runs multiple analyzers in parallel using `Task.async_stream`:

```elixir
defmodule Sparkline.Pipeline.Analysis do
  @moduledoc """
  Parallel analysis orchestrator. Runs sentiment, entity,
  and topic analyzers concurrently.
  """

  @analyzers [
    Sparkline.Analyzer.Sentiment,
    Sparkline.Analyzer.Entity,
    Sparkline.Analyzer.Topic,
    Sparkline.Analyzer.Readability
  ]

  @spec analyze(Sparkline.Document.t()) :: {:ok, Sparkline.Document.t()}
  def analyze(doc) do
    results =
      @analyzers
      |> Task.async_stream(
        fn analyzer -> {analyzer, analyzer.analyze(doc)} end,
        max_concurrency: 4,
        timeout: :timer.seconds(30)
      )
      |> Enum.reduce(%{}, fn
        {:ok, {analyzer, {:ok, result}}}, acc ->
          Map.put(acc, analyzer.key(), result)
        {:ok, {analyzer, {:error, reason}}}, acc ->
          Map.put(acc, analyzer.key(), %{error: reason})
        {:exit, _reason}, acc ->
          acc
      end)

    {:ok, %{doc | analysis: results}}
  end
end
```

## Sentiment Analysis

The sentiment analyzer operates at both document and sentence level. Document-level sentiment provides an overall tone, while sentence-level analysis reveals where opinions shift:

```elixir
defmodule Sparkline.Analyzer.Sentiment do
  @moduledoc """
  Multi-level sentiment analysis with lexicon-based scoring
  and contextual adjustments.
  """

  @spec analyze(Sparkline.Document.t()) :: {:ok, map()}
  def analyze(doc) do
    sentence_sentiments =
      Enum.map(doc.sentences, fn sentence ->
        tokens = tokenize(sentence)
        raw_score = compute_lexicon_score(tokens, doc.language)
        adjusted = apply_modifiers(tokens, raw_score)

        %{
          text: sentence,
          score: adjusted,
          label: classify_score(adjusted),
          confidence: compute_confidence(tokens)
        }
      end)

    doc_score =
      sentence_sentiments
      |> Enum.map(& &1.score)
      |> weighted_average()

    {:ok, %{
      document: %{score: doc_score, label: classify_score(doc_score)},
      sentences: sentence_sentiments,
      distribution: compute_distribution(sentence_sentiments)
    }}
  end

  defp apply_modifiers(tokens, score) do
    negation_count = count_negations(tokens)
    intensifier_factor = compute_intensifier_factor(tokens)

    adjusted = if rem(negation_count, 2) == 1, do: -score, else: score
    adjusted * intensifier_factor
  end
end
```

The lexicon-based approach uses language-specific sentiment dictionaries with ~8,000 entries per language. We currently support Czech, English, German, and Slovak. The modifier system handles negations ("not good" = negative) and intensifiers ("very good" = more positive than "good").

## Entity Extraction

Entity extraction identifies named entities -- people, organizations, locations, dates, and monetary amounts -- within the text:

```elixir
defmodule Sparkline.Analyzer.Entity do
  @moduledoc """
  Named entity recognition using pattern matching
  and contextual classification.
  """

  @entity_types [:person, :organization, :location, :date, :money, :ico]

  @spec analyze(Sparkline.Document.t()) :: {:ok, map()}
  def analyze(doc) do
    entities =
      doc.sentences
      |> Enum.flat_map(fn sentence ->
        extract_pattern_entities(sentence) ++
        extract_capitalized_sequences(sentence) ++
        extract_czech_business_ids(sentence)
      end)
      |> deduplicate()
      |> classify()

    {:ok, %{
      entities: entities,
      entity_count: length(entities),
      by_type: Enum.group_by(entities, & &1.type)
    }}
  end

  defp extract_czech_business_ids(text) do
    Regex.scan(~r/\bI[CČ]O[:\s]*(\d{8})\b/, text)
    |> Enum.map(fn [_full, ico] ->
      %{text: ico, type: :ico, confidence: 0.95}
    end)
  end
end
```

Czech business IDs (ICO) are particularly important for our due diligence workflows. When Sparkline extracts an ICO from a document, it can automatically trigger an ARES lookup through the OSINT pipeline.

## Topic Modeling

Topic modeling uses a TF-IDF approach to identify the dominant themes in a document or corpus:

```elixir
defmodule Sparkline.Analyzer.Topic do
  @moduledoc """
  TF-IDF based topic extraction with corpus-aware weighting.
  """

  @spec analyze(Sparkline.Document.t()) :: {:ok, map()}
  def analyze(doc) do
    tf = compute_term_frequency(doc.normalized_tokens)
    idf = get_inverse_document_frequency()

    tf_idf =
      tf
      |> Enum.map(fn {term, freq} ->
        {term, freq * Map.get(idf, term, 1.0)}
      end)
      |> Enum.sort_by(fn {_term, score} -> score end, :desc)
      |> Enum.take(20)

    topics = cluster_terms(tf_idf)

    {:ok, %{
      top_terms: tf_idf,
      topics: topics,
      topic_count: length(topics)
    }}
  end
end
```

## API Integration

Sparkline exposes a REST API on port 4002 for external consumers:

```elixir
# POST /api/v1/analyze
%{
  "text" => "Navigara s.r.o., ICO 12345678, reported revenue of 50M CZK...",
  "analyzers" => ["sentiment", "entity", "topic"],
  "language" => "cs"
}

# Response
%{
  "document_id" => "doc_abc123",
  "language" => "cs",
  "analysis" => %{
    "sentiment" => %{"score" => -0.15, "label" => "slightly_negative"},
    "entities" => [
      %{"text" => "Navigara s.r.o.", "type" => "organization"},
      %{"text" => "12345678", "type" => "ico"},
      %{"text" => "50M CZK", "type" => "money"}
    ],
    "topics" => [
      %{"label" => "financial_performance", "terms" => ["revenue", "czk", "reported"]}
    ]
  },
  "processing_time_ms" => 145
}
```

The API supports both synchronous processing (for small documents) and asynchronous processing via webhooks (for large documents or batch operations). Async requests return immediately with a `document_id` and call the configured webhook URL when processing completes.

## Performance Characteristics

Sparkline is designed for throughput. The parallel analyzer architecture means that adding a new analyzer does not increase latency -- it runs concurrently with existing analyzers:

- **Small documents** (< 1,000 words): ~100ms end-to-end
- **Medium documents** (1,000-10,000 words): ~500ms end-to-end
- **Large documents** (10,000+ words): ~2s end-to-end
- **Batch throughput**: ~500 documents/minute on a single node

The bottleneck is typically entity extraction for long documents, as the pattern matching scales with document length. We mitigate this by processing sentences in parallel within the entity analyzer.

Sparkline runs as a standalone Phoenix application within the Prismatic umbrella. It can be deployed independently for teams that need content analysis without the full intelligence platform, or it integrates seamlessly with the OSINT and DD pipelines for automated document intelligence.
