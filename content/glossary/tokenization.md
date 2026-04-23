+++
title = "Tokenization"
weight = 55
[extra]
category = "technology"
description = "Converting text into discrete token units for AI model processing"
related_terms = ["ollama", "vector-database", "meilisearch", "data-pipeline", "stream-processing", "etl"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1015
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Tokenization", "Converting", "glossary", "technology", "Prismatic Platform", "Elixir", "SentencePiece", "English"]
tags = ["glossary", "technology", "tokenization", "prismatic"]
quality_score = 72
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Tokenization - Prismatic Platform"
+++

## Definition and Overview

Tokenization is the process of converting raw text into a sequence of discrete tokens -- subword units, words, or characters -- that serve as the fundamental input representation for language models. Tokenizers use algorithms such as Byte Pair Encoding (BPE), WordPiece, or SentencePiece to decompose text into vocabulary-mapped integer IDs that the model can process. Token count determines context window utilization, computational cost, and API pricing, making tokenization a critical factor in both the cost and capability of AI-powered systems.

The evolution of tokenization reflects the broader evolution of natural language processing. Early systems used simple whitespace splitting and dictionary lookup, which failed for agglutinative languages, compound words, and out-of-vocabulary terms. Character-level tokenization solved the vocabulary problem but produced sequences too long for practical model training. Subword tokenization -- pioneered by BPE and refined by SentencePiece -- provides the optimal balance: a fixed vocabulary size (typically 32,000 to 100,000 tokens) that can represent any text, including rare words and neologisms, through composition of learned subword units.

BPE (Byte Pair Encoding) works by iteratively merging the most frequent pair of adjacent characters or character sequences in the training corpus. Starting from individual bytes, the algorithm learns merge rules that combine frequent sequences into single tokens. Common words like "the" become single tokens, while rare words like "defmodule" might split into "def" + "module" or "de" + "f" + "mod" + "ule" depending on the training data. This learned vocabulary captures the statistical structure of the language the model was trained on.

The relationship between tokenization and context windows is direct and quantitative. A model with a 128K token context window can process approximately 96,000 English words (roughly 1.3 tokens per word), but the same window holds far fewer code tokens because programming languages use syntax, naming conventions, and structural patterns that tokenizers trained primarily on English text handle less efficiently. Elixir code, with its distinctive syntax (pipes, pattern matching, module attributes), typically requires 1.5-2.5 tokens per syntactic element.

Within the Prismatic Platform, tokenization intersects multiple systems. Ollama local models apply tokenization to every prompt and response. The AIAD agent system manages token budgets for the 434 runtime agents to optimize context utilization. Meilisearch applies its own tokenization for full-text search indexing across the 11,308 documentation files. The platform's 6,652 Elixir source files present a particular tokenization challenge because Elixir syntax differs significantly from the natural language and Python/JavaScript code that dominates most tokenizer training data.

## Technical Deep Dive

### Tokenization Algorithms

The three dominant tokenization algorithms each make different trade-offs:

```elixir
defmodule PrismaticAI.Tokenization do
  @moduledoc """
  Token counting and budget management for AI operations.
  Supports multiple tokenizer implementations.
  """

  @type tokenizer :: :bpe | :wordpiece | :sentencepiece | :tiktoken
  @type token :: non_neg_integer()

  @type token_count_result :: %{
    text_length: non_neg_integer(),
    token_count: non_neg_integer(),
    tokens_per_char: float(),
    estimated_cost: float()
  }

  @spec count_tokens(String.t(), tokenizer()) :: token_count_result()
  def count_tokens(text, tokenizer \\ :tiktoken) do
    tokens = encode(text, tokenizer)

    %{
      text_length: String.length(text),
      token_count: length(tokens),
      tokens_per_char: length(tokens) / max(String.length(text), 1),
      estimated_cost: calculate_cost(length(tokens))
    }
  end

  @spec encode(String.t(), tokenizer()) :: [token()]
  def encode(text, :tiktoken) do
    # cl100k_base encoding used by GPT-4, Claude
    Tiktoken.encode(text, "cl100k_base")
  end

  def encode(text, :sentencepiece) do
    # SentencePiece encoding used by Llama, Mistral
    SentencePiece.encode(text)
  end

  @spec fits_context?(String.t(), non_neg_integer(), tokenizer()) :: boolean()
  def fits_context?(text, max_tokens, tokenizer \\ :tiktoken) do
    count = count_tokens(text, tokenizer)
    count.token_count <= max_tokens
  end

  defp calculate_cost(token_count) do
    # Cost per million tokens (approximate)
    rate_per_million = 3.00
    token_count / 1_000_000 * rate_per_million
  end
end
```

### Algorithm Comparison

| Algorithm | Vocabulary Size | Training | Use Cases | Models |
|-----------|----------------|----------|-----------|--------|
| BPE | 32K-100K | Iterative merge of frequent pairs | General purpose | GPT-4, Claude |
| WordPiece | 30K-50K | Likelihood-based merge | BERT variants | BERT, DistilBERT |
| SentencePiece | 32K-64K | Unigram language model | Multilingual | Llama, T5 |
| Tiktoken | 100K | Optimized BPE | High performance | GPT-4, Claude |

### Token Budget Management

Managing token budgets across the platform's 434 agents requires systematic tracking:

```elixir
defmodule PrismaticAI.TokenBudget do
  @moduledoc """
  Token budget management for AI agent operations.
  Tracks consumption and enforces limits per agent and session.
  """

  use GenServer

  @type budget :: %{
    agent_id: String.t(),
    session_id: String.t(),
    allocated: non_neg_integer(),
    consumed: non_neg_integer(),
    remaining: non_neg_integer(),
    requests: non_neg_integer()
  }

  @default_budget 128_000
  @warning_threshold 0.80
  @critical_threshold 0.95

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    {:ok, %{budgets: %{}, global_consumed: 0}}
  end

  @spec allocate(String.t(), String.t(), non_neg_integer()) :: {:ok, budget()} | {:error, term()}
  def allocate(agent_id, session_id, amount \\ @default_budget) do
    GenServer.call(__MODULE__, {:allocate, agent_id, session_id, amount})
  end

  @spec consume(String.t(), non_neg_integer()) :: {:ok, budget()} | {:error, :budget_exceeded}
  def consume(agent_id, tokens) do
    GenServer.call(__MODULE__, {:consume, agent_id, tokens})
  end

  @impl true
  def handle_call({:consume, agent_id, tokens}, _from, state) do
    case Map.get(state.budgets, agent_id) do
      nil ->
        {:reply, {:error, :no_budget_allocated}, state}

      budget ->
        new_consumed = budget.consumed + tokens
        utilization = new_consumed / budget.allocated

        cond do
          utilization > 1.0 ->
            {:reply, {:error, :budget_exceeded}, state}

          utilization > @critical_threshold ->
            :telemetry.execute(
              [:prismatic, :ai, :token_budget, :critical],
              %{utilization: utilization, tokens: new_consumed},
              %{agent: agent_id}
            )

            updated = %{budget |
              consumed: new_consumed,
              remaining: budget.allocated - new_consumed,
              requests: budget.requests + 1
            }
            {:reply, {:ok, updated}, put_in(state, [:budgets, agent_id], updated)}

          utilization > @warning_threshold ->
            :telemetry.execute(
              [:prismatic, :ai, :token_budget, :warning],
              %{utilization: utilization},
              %{agent: agent_id}
            )

            updated = %{budget |
              consumed: new_consumed,
              remaining: budget.allocated - new_consumed,
              requests: budget.requests + 1
            }
            {:reply, {:ok, updated}, put_in(state, [:budgets, agent_id], updated)}

          true ->
            updated = %{budget |
              consumed: new_consumed,
              remaining: budget.allocated - new_consumed,
              requests: budget.requests + 1
            }
            {:reply, {:ok, updated}, put_in(state, [:budgets, agent_id], updated)}
        end
    end
  end
end
```

### Code Tokenization Characteristics

Programming language tokenization differs significantly from natural language:

```elixir
defmodule PrismaticAI.CodeTokenizer do
  @moduledoc """
  Analyzes tokenization characteristics of Elixir source code.
  Helps optimize context window usage for code-heavy prompts.
  """

  @type code_analysis :: %{
    file: String.t(),
    lines: non_neg_integer(),
    characters: non_neg_integer(),
    tokens: non_neg_integer(),
    tokens_per_line: float(),
    tokens_per_char: float(),
    token_categories: %{atom() => non_neg_integer()}
  }

  @spec analyze_file(String.t()) :: {:ok, code_analysis()} | {:error, term()}
  def analyze_file(path) do
    with {:ok, content} <- File.read(path) do
      tokens = PrismaticAI.Tokenization.encode(content, :tiktoken)
      lines = content |> String.split("\n") |> length()

      {:ok, %{
        file: path,
        lines: lines,
        characters: String.length(content),
        tokens: length(tokens),
        tokens_per_line: length(tokens) / max(lines, 1),
        tokens_per_char: length(tokens) / max(String.length(content), 1),
        token_categories: categorize_tokens(content, tokens)
      }}
    end
  end

  @spec optimize_for_context(String.t(), non_neg_integer()) :: String.t()
  def optimize_for_context(code, max_tokens) do
    current = PrismaticAI.Tokenization.count_tokens(code)

    if current.token_count <= max_tokens do
      code
    else
      # Progressive reduction strategies
      code
      |> remove_comments()
      |> collapse_whitespace()
      |> abbreviate_module_docs()
      |> truncate_to_token_limit(max_tokens)
    end
  end

  defp categorize_tokens(content, _tokens) do
    %{
      keywords: count_keyword_tokens(content),
      identifiers: count_identifier_tokens(content),
      operators: count_operator_tokens(content),
      strings: count_string_tokens(content),
      whitespace: count_whitespace_tokens(content)
    }
  end
end
```

### Search Engine Tokenization

Meilisearch applies different tokenization optimized for search retrieval:

```elixir
defmodule PrismaticStorageMeilisearch.Tokenization do
  @moduledoc """
  Meilisearch tokenization configuration for platform search.
  Optimized for documentation and code search across 11,308 files.
  """

  @type search_config :: %{
    separator_tokens: [String.t()],
    non_separator_tokens: [String.t()],
    dictionary: [String.t()],
    proximity_precision: :by_word | :by_attribute
  }

  @spec default_config() :: search_config()
  def default_config do
    %{
      separator_tokens: ["@", "::", "->", "|>", "<-", "=>"],
      non_separator_tokens: ["_"],
      dictionary: elixir_keywords() ++ platform_terms(),
      proximity_precision: :by_word
    }
  end

  defp elixir_keywords do
    ~w(defmodule def defp defmacro defprotocol defimpl
       do end if else cond case when with for
       import use require alias)
  end

  defp platform_terms do
    ~w(prismatic perimeter easm hawkeye nabla aiad
       genserver supervisor telemetry liveview)
  end
end
```

## Architecture and Implementation

### Tokenization in the Platform Pipeline

```
Input Text/Code
    |
    +-- AI Operations (Ollama/Cloud)
    |       +-- Tiktoken/BPE encoding
    |       +-- Token budget tracking
    |       +-- Context window management
    |
    +-- Search Indexing (Meilisearch)
    |       +-- Language-aware tokenization
    |       +-- Elixir-specific separators
    |       +-- Full-text index construction
    |
    +-- Agent System (AIAD)
            +-- Per-agent token budgets
            +-- Context optimization
            +-- Code-aware truncation
```

### Context Window Sizes by Model

| Model | Context Window | Approx. English Words | Approx. Elixir Lines | Platform Usage |
|-------|---------------|----------------------|---------------------|----------------|
| Claude Opus 4 | 200K tokens | ~150K words | ~40K lines | Primary AI operations |
| Llama 3.2 (Ollama) | 128K tokens | ~96K words | ~25K lines | Local AI operations |
| Qwen3 Coder (Ollama) | 32K tokens | ~24K words | ~6.5K lines | Code generation |
| GPT-4o | 128K tokens | ~96K words | ~25K lines | Cloud fallback |

### Token Efficiency by Content Type

| Content Type | Tokens per 1000 chars | Relative Efficiency | Notes |
|-------------|----------------------|--------------------|----|
| English prose | ~250 | Baseline (1.0x) | Most efficient |
| Technical documentation | ~280 | 0.89x | More specialized vocabulary |
| Elixir source code | ~350 | 0.71x | Syntax overhead |
| JSON/YAML configuration | ~400 | 0.63x | Structural characters |
| Mixed code + docs | ~300 | 0.83x | Typical platform content |

## Usage in Prismatic Platform

### Token Budget Operations

```elixir
# Allocate budget for an agent session
{:ok, budget} = PrismaticAI.TokenBudget.allocate("red-epistemic-attacker", "session-123", 64_000)

# Check if content fits in context
fits = PrismaticAI.Tokenization.fits_context?(source_code, 32_000)

# Analyze tokenization of a source file
{:ok, analysis} = PrismaticAI.CodeTokenizer.analyze_file("apps/prismatic_perimeter/lib/rating.ex")

# Optimize code for context window
optimized = PrismaticAI.CodeTokenizer.optimize_for_context(large_module, 8_000)
```

### Ollama Integration

```elixir
# Count tokens for Ollama model
count = PrismaticAI.Tokenization.count_tokens(prompt, :sentencepiece)

# Check against model context limit
if count.token_count > 128_000 do
  prompt = PrismaticAI.CodeTokenizer.optimize_for_context(prompt, 120_000)
end

# Send to Ollama with token tracking
{:ok, response} = PrismaticOllama.generate(prompt, model: "qwen3-coder")
PrismaticAI.TokenBudget.consume(agent_id, count.token_count + response.token_count)
```

## Best Practices

1. **Track token budgets at the agent level**. Each of the 434 runtime agents should have an allocated token budget per session. Untracked consumption leads to unexpected costs and context window exhaustion.

2. **Optimize code for context windows before sending to models**. Remove comments, collapse whitespace, and abbreviate module documentation when context space is limited. The CodeTokenizer module provides progressive reduction strategies.

3. **Account for code tokenization overhead**. Elixir code requires approximately 40% more tokens per character than English prose. Budget calculations that assume natural language ratios underestimate actual token usage for code-heavy prompts.

4. **Configure search tokenization for Elixir syntax**. Meilisearch's default tokenization treats Elixir operators (`|>`, `->`, `::`) as word separators, which may not match developer search expectations. Configure separator and non-separator tokens explicitly.

5. **Monitor token consumption with Telemetry**. Emit Telemetry events at warning (80%) and critical (95%) utilization thresholds to prevent budget exhaustion during long-running agent sessions.

## Common Pitfalls

- **Assuming uniform token-to-character ratios**: Different content types tokenize at different rates. Code, configuration files, and natural language all have different token densities. Use actual token counting rather than character-based estimates.

- **Ignoring context window limits**: Exceeding a model's context window causes silent truncation or API errors. Always verify that input plus expected output fits within the context limit, with margin for the model's response.

- **Using a single tokenizer for all models**: Different models use different tokenizers (Tiktoken for GPT-4/Claude, SentencePiece for Llama). Token counts from one tokenizer are not valid for another model.

- **Not implementing token budget controls**: Without budget limits, a single agent can consume disproportionate resources. Per-agent budgets with utilization alerts prevent resource exhaustion.

- **Over-compressing code for context**: Aggressive optimization (removing all comments, collapsing formatting) can remove context that the model needs to understand the code. Apply progressive reduction and verify that optimization does not remove semantically important content.

## Related Concepts

- [Ollama](/glossary/ollama/) -- Local AI runtime applying tokenization to model inputs
- [Meilisearch](/glossary/meilisearch/) -- Search engine using tokenization for full-text indexing
- [Vector Database](/glossary/vector-database/) -- Storage consuming tokenized embeddings for similarity search
- [Data Pipeline](/glossary/data-pipeline/) -- Processing infrastructure where tokenization is a preprocessing stage
- [Stream Processing](/glossary/stream-processing/) -- Real-time processing where incremental tokenization enables streaming
- [ETL](/glossary/etl/) -- Extract-transform-load pipelines including tokenization transforms

## See Also

- [Architecture](/architecture/) -- Platform architecture overview
- [Technologies](/technologies/) -- Technology stack details
- [Apps](/apps/) -- Application directory

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)