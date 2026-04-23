+++
title = "Claude AI"
weight = 50
[extra]
tags = ["glossary", "ai", "llm", "anthropic", "claude", "claude-code", "inference", "agent", "integration"]
description = "Anthropic's large language model that powers the Prismatic Platform's AI capabilities through Claude Code CLI integration, API access, and 530+ AIAD agent orchestration"
category = "ai"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate-to-advanced"
domain_category = "AI & Machine Learning"
related_concepts = ["claude-code", "llm", "ai-model", "ai-inference", "prompt-engineering", "ollama", "ai-agent"]
implementation_status = "production"
authority_level = "L3 Strategic"
difficulty_rating = 5
prerequisites = ["llm", "ai-model", "agent"]
learning_path = "ai-fundamentals -> llm -> claude-ai -> claude-code -> agent-orchestration"
interactive_demos = ["/labs/glossary/claude-ai"]
code_examples = ["elixir"]
external_resources = ["https://docs.anthropic.com/", "https://claude.ai/", "https://github.com/anthropics/claude-code"]
version_introduced = "0.1.0"
stability_level = "stable"
testing_scenarios = ["api-integration", "response-validation", "fallback-to-ollama", "agent-delegation"]
keywords = ["Claude AI", "Anthropic", "LLM", "large language model", "Claude Code", "AI integration", "Claude Opus", "agent system", "AI-powered development"]
related_terms = ["claude-code", "llm", "ai-model", "ai-inference", "prompt-engineering", "ollama", "ai-agent", "agent-orchestration", "aiad", "no-mercy-no-doubts"]
word_count = 1589
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Claude AI - Prismatic Platform"
+++

## Definition

**Claude AI** is a family of large language models (LLMs) developed by Anthropic, designed with a focus on safety, helpfulness, and honesty. Within the Prismatic Platform, Claude AI -- specifically the Claude Opus 4.6 model -- serves as the primary intelligence engine powering 530+ [AIAD](@/glossary/aiad.md) agents, the [Claude Code](@/glossary/claude-code.md) CLI development interface, automated code generation, quality enforcement, and epistemic reasoning through the [NABLA Infinity](@/glossary/nabla-infinity.md) framework.

Claude AI is not merely an integration point in the platform -- it is the cognitive substrate upon which the entire agent ecosystem operates. Every agent specification, every quality gate evaluation, every strategic decision, and every code modification flows through Claude's reasoning capabilities, governed by the [No Mercy, No Doubts](@/glossary/no-mercy-no-doubts.md) doctrine and the chain of command authority structure.

## Overview

Anthropic's Claude represents a distinct approach to large language model development, prioritizing Constitutional AI (CAI) training methodology where the model is guided by a set of principles (a "constitution") rather than purely human feedback. This results in a model that is less likely to produce harmful content while maintaining strong performance on reasoning, coding, analysis, and creative tasks.

The Prismatic Platform leverages Claude AI across multiple dimensions:

1. **Development Interface**: Claude Code CLI provides the primary developer interaction model, enabling natural language-driven development, code review, debugging, and architecture exploration.

2. **Agent Intelligence**: All 530+ AIAD agents use Claude's reasoning capabilities as their cognitive engine. When an agent needs to analyze code, evaluate quality, assess security, or make architectural decisions, Claude provides the underlying intelligence.

3. **Quality Enforcement**: The [quality gate](@/glossary/quality-gate.md) system uses Claude for nuanced evaluation that goes beyond pattern matching -- understanding code intent, identifying subtle bugs, and assessing architectural fit.

4. **Epistemic Reasoning**: The NABLA Infinity framework relies on Claude's ability to maintain multiple hypotheses, preserve contradictions, and reason under uncertainty -- capabilities that align with Anthropic's focus on honest reasoning.

5. **Local AI Fallback**: When Claude API is unavailable or for privacy-sensitive operations, the platform falls back to local [Ollama](@/glossary/ollama.md) models (qwen3-coder, deepseek-coder) while maintaining the same agent interfaces.

### Claude Model Family

| Model | Capability | Use in Prismatic | Typical Latency |
|-------|-----------|-----------------|-----------------|
| **Claude Opus 4.6** | Flagship reasoning model | Primary agent intelligence, complex analysis | 5-15s |
| **Claude Sonnet** | Balanced speed/quality | Standard development tasks, code review | 2-5s |
| **Claude Haiku** | Fast, efficient | Quick lookups, simple transformations | <1s |

The Prismatic Platform primarily uses Claude Opus 4.6 for its superior reasoning, code understanding, and multi-step planning capabilities. The model ID `claude-opus-4-6` is explicitly referenced in the platform configuration.

## Technical Details

### Integration Architecture

Claude AI integrates with the Prismatic Platform through multiple channels:

```
Claude Code CLI ──── Direct developer interaction
       │
       ├── API (Anthropic) ──── Cloud-hosted inference
       │        │
       │        └── 530+ AIAD Agents ──── Distributed intelligence
       │
       └── Ollama (Local) ──── Privacy-sensitive / offline fallback
                │
                └── Local Agent Operations ──── Reduced latency
```

### Elixir API Client

The platform wraps Claude's API in an Elixir client with retry logic, rate limiting, and telemetry:

```elixir
defmodule PrismaticAI.ClaudeClient do
  @moduledoc """
  HTTP client for Anthropic's Claude API with automatic retry,
  rate limiting, circuit breaker pattern, and transparent fallback
  to local Ollama models when the cloud API is unavailable.

  All requests are instrumented with telemetry events for monitoring
  latency, token usage, and error rates.
  """

  use GenServer

  alias PrismaticAI.{OllamaFallback, RateLimiter, CircuitBreaker}

  @type model :: :opus | :sonnet | :haiku
  @type message :: %{role: String.t(), content: String.t()}
  @type completion_result :: {:ok, response()} | {:error, term()}
  @type response :: %{
          content: String.t(),
          model: String.t(),
          usage: %{input_tokens: non_neg_integer(), output_tokens: non_neg_integer()},
          stop_reason: String.t()
        }

  @default_model :opus
  @max_retries 3
  @base_retry_delay_ms 1_000
  @api_base_url "https://api.anthropic.com/v1"

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @doc """
  Sends a completion request to Claude API with automatic retry and fallback.
  """
  @spec complete(String.t(), keyword()) :: completion_result()
  def complete(prompt, opts \\ []) do
    model = Keyword.get(opts, :model, @default_model)
    system = Keyword.get(opts, :system, default_system_prompt())
    max_tokens = Keyword.get(opts, :max_tokens, 4096)

    messages = [%{role: "user", content: prompt}]

    request = %{
      model: model_id(model),
      max_tokens: max_tokens,
      system: system,
      messages: messages
    }

    GenServer.call(__MODULE__, {:complete, request}, 120_000)
  end

  @doc """
  Sends a multi-turn conversation to Claude API.
  """
  @spec converse([message()], keyword()) :: completion_result()
  def converse(messages, opts \\ []) do
    model = Keyword.get(opts, :model, @default_model)
    system = Keyword.get(opts, :system, default_system_prompt())
    max_tokens = Keyword.get(opts, :max_tokens, 4096)

    request = %{
      model: model_id(model),
      max_tokens: max_tokens,
      system: system,
      messages: messages
    }

    GenServer.call(__MODULE__, {:complete, request}, 120_000)
  end

  @doc """
  Returns current client status including circuit breaker state,
  rate limit headroom, and fallback availability.
  """
  @spec status() :: %{
          circuit_breaker: :closed | :open | :half_open,
          rate_limit_remaining: non_neg_integer(),
          ollama_available: boolean(),
          model: String.t()
        }
  def status do
    GenServer.call(__MODULE__, :status)
  end

  # --- Server Callbacks ---

  @impl GenServer
  def init(opts) do
    api_key = Keyword.get(opts, :api_key, System.get_env("ANTHROPIC_API_KEY"))

    state = %{
      api_key: api_key,
      base_url: Keyword.get(opts, :base_url, @api_base_url),
      circuit_breaker: CircuitBreaker.new(failure_threshold: 3, reset_timeout_ms: 60_000),
      request_count: 0,
      total_tokens: 0
    }

    {:ok, state}
  end

  @impl GenServer
  def handle_call({:complete, request}, _from, state) do
    start_time = System.monotonic_time(:millisecond)

    :telemetry.execute(
      [:prismatic_ai, :claude, :request_start],
      %{model: request.model},
      %{request: sanitize_request(request)}
    )

    result =
      case CircuitBreaker.allow?(state.circuit_breaker) do
        true ->
          attempt_with_retry(request, state, @max_retries)

        false ->
          attempt_fallback(request)
      end

    elapsed = System.monotonic_time(:millisecond) - start_time

    updated_state =
      case result do
        {:ok, response} ->
          :telemetry.execute(
            [:prismatic_ai, :claude, :request_complete],
            %{elapsed_ms: elapsed, tokens: response.usage.input_tokens + response.usage.output_tokens},
            %{model: request.model}
          )

          circuit = CircuitBreaker.record_success(state.circuit_breaker)

          %{state |
            circuit_breaker: circuit,
            request_count: state.request_count + 1,
            total_tokens: state.total_tokens + response.usage.input_tokens + response.usage.output_tokens
          }

        {:error, reason} ->
          :telemetry.execute(
            [:prismatic_ai, :claude, :request_error],
            %{elapsed_ms: elapsed},
            %{reason: reason, model: request.model}
          )

          circuit = CircuitBreaker.record_failure(state.circuit_breaker)
          %{state | circuit_breaker: circuit}
      end

    {:reply, result, updated_state}
  end

  @impl GenServer
  def handle_call(:status, _from, state) do
    status = %{
      circuit_breaker: CircuitBreaker.state(state.circuit_breaker),
      rate_limit_remaining: RateLimiter.remaining(),
      ollama_available: OllamaFallback.available?(),
      model: model_id(@default_model),
      total_requests: state.request_count,
      total_tokens: state.total_tokens
    }

    {:reply, status, state}
  end

  # --- Private Functions ---

  defp attempt_with_retry(_request, _state, 0) do
    attempt_fallback(_request)
  end

  defp attempt_with_retry(request, state, retries_left) do
    case send_api_request(request, state) do
      {:ok, response} ->
        {:ok, response}

      {:error, :rate_limited} ->
        Process.sleep(@base_retry_delay_ms * (@max_retries - retries_left + 1))
        attempt_with_retry(request, state, retries_left - 1)

      {:error, :server_error} ->
        Process.sleep(@base_retry_delay_ms * (@max_retries - retries_left + 1))
        attempt_with_retry(request, state, retries_left - 1)

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp attempt_fallback(request) do
    case OllamaFallback.available?() do
      true ->
        OllamaFallback.complete(request)

      false ->
        {:error, :no_inference_available}
    end
  end

  defp send_api_request(request, state) do
    url = "#{state.base_url}/messages"

    headers = [
      {"x-api-key", state.api_key},
      {"anthropic-version", "2023-06-01"},
      {"content-type", "application/json"}
    ]

    body = Jason.encode!(request)

    case :hackney.post(url, headers, body, [:with_body]) do
      {:ok, 200, _headers, response_body} ->
        parse_response(response_body)

      {:ok, 429, _headers, _body} ->
        {:error, :rate_limited}

      {:ok, status, _headers, _body} when status >= 500 ->
        {:error, :server_error}

      {:ok, status, _headers, body} ->
        {:error, {:api_error, status, body}}

      {:error, reason} ->
        {:error, {:connection_error, reason}}
    end
  end

  defp parse_response(body) do
    case Jason.decode(body) do
      {:ok, %{"content" => [%{"text" => text} | _], "model" => model, "usage" => usage, "stop_reason" => stop}} ->
        {:ok, %{
          content: text,
          model: model,
          usage: %{
            input_tokens: Map.get(usage, "input_tokens", 0),
            output_tokens: Map.get(usage, "output_tokens", 0)
          },
          stop_reason: stop
        }}

      {:ok, other} ->
        {:error, {:unexpected_response, other}}

      {:error, reason} ->
        {:error, {:json_parse_error, reason}}
    end
  end

  defp model_id(:opus), do: "claude-opus-4-6"
  defp model_id(:sonnet), do: "claude-sonnet-4-20250514"
  defp model_id(:haiku), do: "claude-haiku-3-5-20241022"

  defp default_system_prompt do
    "You are an AI assistant integrated into the Prismatic Platform. " <>
      "Follow the NO MERCY, NO DOUBTS doctrine. " <>
      "Provide production-ready, fully tested Elixir code. " <>
      "Use {:ok, _} / {:error, _} return patterns. Include @spec and @moduledoc."
  end

  defp sanitize_request(request) do
    # Remove sensitive content from telemetry metadata
    %{model: request.model, max_tokens: request.max_tokens}
  end
end
```

### Claude Code CLI Integration

[Claude Code](@/glossary/claude-code.md) is Anthropic's official CLI tool that provides the primary developer interface for the Prismatic Platform:

| Feature | Description | Platform Usage |
|---------|-------------|---------------|
| **Interactive Development** | Natural language code editing | Primary development workflow |
| **CLAUDE.md** | Project-level instruction files | 8,000+ word platform context |
| **Tool Use** | File operations, bash, search | All 530+ agent operations |
| **Memory** | Persistent context across sessions | Session continuity, quality DNA |
| **Worktrees** | Isolated development environments | Feature isolation |
| **MCP Integration** | Model Context Protocol servers | 14+ MCP servers connected |
| **Agent Mode** | Autonomous multi-step operations | Agent execution backbone |

### Ollama Fallback Architecture

The platform maintains local AI capability through [Ollama](@/glossary/ollama.md) as a transparent fallback:

```
Request ──> Claude API Available? ──YES──> Claude Opus 4.6
                │
                NO (circuit breaker open)
                │
                └──> Ollama Available? ──YES──> qwen3-coder / deepseek-coder
                         │
                         NO
                         │
                         └──> {:error, :no_inference_available}
```

| Scenario | Primary | Fallback | Latency Impact |
|----------|---------|----------|----------------|
| Normal operation | Claude Opus 4.6 | N/A | 5-15s |
| API rate limited | Claude (retry) | Ollama after 3 retries | +3-9s |
| API outage | Ollama qwen3-coder | N/A | <3s (local) |
| Offline development | Ollama | N/A | <3s (local) |
| Privacy-sensitive | Ollama (explicit) | N/A | <3s (local) |

### AIAD Agent Integration

Every AIAD agent specification includes Claude AI configuration:

```yaml
agent-spec:
  id: "quality-guardian"
  name: "Quality Floor Guardian"
  authority_level: "L3"
  ai_config:
    primary_model: "claude-opus-4-6"
    fallback_model: "qwen3-coder"
    max_tokens: 8192
    temperature: 0.1  # Low temperature for deterministic quality analysis
    system_prompt_path: ".aiad/prompts/quality-guardian-system.md"
  capabilities:
    - code_analysis
    - quality_assessment
    - regression_detection
    - pattern_recognition
  enforcement:
    doctrine: "no-mercy-no-doubts"
    version: "2.0.0"
    compliance: mandatory
```

### Session Context and Memory

Claude AI maintains context across sessions through the platform's session management system:

| Component | Location | Purpose |
|-----------|----------|---------|
| **CLAUDE.md** | `/CLAUDE.md` | 8,000+ word platform instructions loaded on every session |
| **Session Context** | `.claude/session-context/` | Per-session state with objectives, decisions, next steps |
| **Quality DNA** | `.claude/quality-dna/` | Cross-session quality metrics continuity |
| **Auto-Memory** | `.claude/projects/*/memory/MEMORY.md` | Persistent facts and patterns |
| **Stack Conversation** | `.claude/stack-conversation/` | Frame-based conversation state |

## Implementation in Prismatic Platform

Claude AI is the foundational intelligence layer of the entire platform:

**Development Workflow**: Every code change in the platform is created through Claude Code sessions. The developer describes intent in natural language, Claude generates production-ready Elixir code with `@spec`, `@moduledoc`, and `{:ok, _}/{:error, _}` patterns, and the 11-phase pre-commit system validates the output.

**Agent Orchestration**: The 530+ AIAD agents use Claude's reasoning for their cognitive operations. When the `quality-guardian` agent evaluates code quality, it constructs a prompt from the agent specification, sends it to Claude, and interprets the structured response to make quality decisions.

**Epistemic Framework**: The [NABLA Infinity](@/glossary/nabla-infinity.md) framework's axiom enforcement relies on Claude's ability to reason about evidence, preserve contradictions, and maintain multiple hypotheses -- capabilities that are central to Anthropic's model design philosophy.

**Continuous Evolution**: The platform's `autoevolve` system uses Claude to analyze codebase patterns, identify improvement opportunities, and generate evolution proposals. Each proposal passes through the [Trinity Gate](@/glossary/trinity-gate.md) before execution.

**Documentation Generation**: All 1,800+ promo site pages, agent specifications, and policy documents are authored through Claude Code sessions, ensuring consistency with platform standards.

## Comparison with Alternatives

| Model | Reasoning | Coding | Safety | Prismatic Integration | Local Fallback |
|-------|-----------|--------|--------|----------------------|----------------|
| **Claude Opus 4.6** (Primary) | Excellent | Excellent | Constitutional AI | Native (Claude Code) | Via Ollama |
| **GPT-4o** | Excellent | Excellent | RLHF | API only | No |
| **Gemini Ultra** | Very Good | Very Good | Safety layers | API only | No |
| **Llama 3.1 70B** | Good | Good | Community guardrails | Via Ollama | Yes |
| **qwen3-coder** (Fallback) | Good for code | Excellent for code | Basic | Via Ollama | Native |
| **DeepSeek Coder** (Fallback) | Good for code | Very Good | Basic | Via Ollama | Native |

Claude Opus 4.6 was selected as the primary model for its combination of strong reasoning (critical for epistemic operations), excellent code generation (essential for a development platform), and Constitutional AI safety alignment (compatible with the platform's governance model).

## Best Practices

1. **Structured Prompts**: Always provide system prompts that include platform context (NO MERCY doctrine, Elixir conventions, quality standards). The CLAUDE.md file serves as the universal system prompt.

2. **Temperature Tuning**: Use low temperature (0.0-0.2) for deterministic operations (code generation, quality analysis) and moderate temperature (0.3-0.5) for creative tasks (architecture exploration, documentation).

3. **Token Budget Management**: Monitor token usage through telemetry. Set appropriate `max_tokens` limits per agent role -- L1 agents need fewer tokens than L3 agents.

4. **Fallback Testing**: Regularly test Ollama fallback paths to ensure they work when needed. The circuit breaker auto-opens after 3 failures, so fallback must be reliable.

5. **Context Window Management**: Claude's context window is large but finite. Use session context files to maintain continuity across sessions rather than trying to fit everything in a single conversation.

6. **Avoid Prompt Injection**: Never include untrusted user input directly in system prompts. Sanitize all inputs and use structured message formats.

7. **Cache Repeated Queries**: For frequently asked questions or standard analysis patterns, cache Claude's responses to reduce API calls and latency.

## Common Pitfalls

1. **Over-Reliance on Single Model**: Using Claude for everything without considering whether a simpler solution (regex, pattern matching, rule-based logic) would suffice. Use Claude for tasks that require reasoning, not for deterministic operations.

2. **Ignoring Latency**: Claude API calls take 5-15 seconds. Design agent workflows to parallelize independent Claude calls rather than serializing them.

3. **Context Pollution**: Loading too much irrelevant context into Claude's prompt, reducing the quality of responses. Be selective about what context each agent needs.

4. **Stale System Prompts**: Not updating agent system prompts when platform conventions change. The CLAUDE.md versioning system addresses this, but individual agent prompts also need maintenance.

5. **Missing Fallback Handling**: Not implementing graceful degradation when both Claude API and Ollama are unavailable. Every Claude-dependent operation should have an `{:error, :no_inference_available}` handling path.

6. **Token Waste**: Sending the full CLAUDE.md (8,000+ words) to every API call when the agent only needs a subset of the context. Use role-specific system prompts that extract relevant sections.

## Use Cases

### Automated Code Review

When a developer pushes code, the `code-reviewer` agent (L2 Tactical) sends the diff to Claude with a structured review prompt. Claude analyzes the code for correctness, style compliance, security issues, and architectural fit, returning structured feedback that the agent formats into actionable review comments.

### Quality Gate Evaluation

The `quality-guardian` agent (L3 Strategic) uses Claude to evaluate whether a code change meets the platform's quality standards beyond what static analysis can detect. Claude assesses code intent, naming quality, documentation completeness, and architectural consistency.

### Epistemic Analysis

When the NABLA framework needs to evaluate whether evidence supports a claim with sufficient confidence, Claude's reasoning capabilities are used to analyze signal plurality, check for contradiction preservation, and assess provenance completeness -- tasks that require nuanced judgment beyond rule-based systems.

### Architecture Exploration

Developers use Claude Code in interactive sessions to explore the platform's architecture, understand dependency relationships, and plan new features. Claude's ability to read and reason about code across the 115-app umbrella makes it an effective architecture exploration tool.

## Related Concepts

- [Claude Code](@/glossary/claude-code.md) -- Anthropic's CLI tool that provides the developer interface
- [LLM](@/glossary/llm.md) -- Large Language Model: the class of AI models Claude belongs to
- [AI Model](@/glossary/ai-model.md) -- General concept of trained machine learning models
- [AI Inference](@/glossary/ai-inference.md) -- The process of running a trained model to produce outputs
- [Prompt Engineering](@/glossary/prompt-engineering.md) -- Techniques for crafting effective Claude prompts
- [Ollama](@/glossary/ollama.md) -- Local AI runtime used as Claude fallback
- [AI Agent](@/glossary/ai-agent.md) -- Autonomous entities powered by Claude's intelligence
- [Agent Orchestration](@/glossary/agent-orchestration.md) -- Coordinating multiple Claude-powered agents
- [AIAD](@/glossary/aiad.md) -- Agent framework that defines how Claude is used by each agent
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- Epistemic framework leveraging Claude's reasoning

## See Also

- [No Mercy No Doubts](@/glossary/no-mercy-no-doubts.md) -- Doctrine that governs Claude's behavior in the platform
- [Trinity Gate](@/glossary/trinity-gate.md) -- Validation system for Claude-generated claims
- [Quality Gate](@/glossary/quality-gate.md) -- Gates enforced through Claude-powered analysis
- [Autoevolve](@/glossary/autoevolve.md) -- Evolution system using Claude for improvement proposals

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
