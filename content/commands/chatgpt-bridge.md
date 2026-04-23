+++
title = "/chatgpt-bridge"
weight = 1670
[extra]
category = "LLM Operations"
description = "ChatGPT bridge operations for cross-LLM coordination"
syntax = "/chatgpt-bridge [options]"
authority = "L2+"
agent = "chatgpt-bridge-commander"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1166
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["chatgpt-bridge", "ChatGPT", "commands", "LLM Operations", "Prismatic Platform", "OpenAI API"]
tags = ["commands", "llm-operations", "chatgpt-bridge", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/chatgpt-bridge - Prismatic Platform"
+++

## Overview

The **/chatgpt-bridge** command provides direct, unified access to the ChatGPT/OpenAI API through the Prismatic Platform's LLM infrastructure. This command serves as the primary interface for all ChatGPT interactions, supporting chat completion, streaming responses, text embeddings, function calling with tool integration, model discovery, cost tracking, health monitoring, and configuration management. Rather than requiring developers to interact with the OpenAI API directly, the bridge command wraps all operations in a consistent, doctrine-compliant interface with built-in telemetry, rate limiting, circuit breaking, and cost controls.

In a multi-model AI platform architecture, the bridge pattern is essential for maintaining operational coherence. The Prismatic Platform operates with multiple LLM providers -- Claude as the primary development engine, ChatGPT for analytical capabilities and alternative perspectives, local models via Ollama for cost-sensitive operations, and OpenRouter for access to specialized models. The **/chatgpt-bridge** command normalizes the ChatGPT interaction model to conform to the platform's unified LLM interface, enabling seamless provider switching, cost comparison, and multi-model orchestration. This architectural approach ensures that ChatGPT capabilities can be leveraged wherever they provide comparative advantage without introducing provider-specific coupling into the broader codebase.

The command is executed by the `chatgpt-bridge-commander` agent, a strategic-level coordinator within the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) framework. The commander agent manages API credentials, session state, rate limit compliance, and cost budgets across all ChatGPT operations. It delegates specialized tasks to sub-agents including `chatgpt-prompt-engineer` for prompt optimization, `chatgpt-context-manager` for context window management, and `chatgpt-tool-executor` for function calling orchestration. The command is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), forming the foundation layer for higher-level commands like [/chatgpt-analyze](@/commands/chatgpt-analyze.md), [/chatgpt-convert](@/commands/chatgpt-convert.md), and [/chatgpt-consult](@/commands/chatgpt-consult.md).

## Usage

```bash
/chatgpt-bridge <action> [options]
```

### Chat Completion

```bash
# Basic chat with default model (gpt-4o)
/chatgpt-bridge chat "Explain pattern matching in Elixir"

# With specific model and streaming
/chatgpt-bridge chat --model gpt-4o-mini --stream "Write a detailed OTP explanation"

# With system prompt override
/chatgpt-bridge chat --system "You are an Elixir expert" "How do I structure an umbrella app?"

# Multi-turn conversation with session persistence
/chatgpt-bridge chat --session my-session "Let's discuss GenServers"
/chatgpt-bridge chat --session my-session "How do I add state?"
```

### Embeddings and Completions

```bash
# Generate text embeddings for semantic search
/chatgpt-bridge embed "GenServer state management"

# Single completion without conversation context
/chatgpt-bridge complete --max-tokens 100 "Continue this code: def foo do"

# Streaming response for long content
/chatgpt-bridge stream "Write a comprehensive guide to supervision trees"
```

### Operations and Monitoring

```bash
# List available models
/chatgpt-bridge models

# Check API health and connectivity
/chatgpt-bridge health --verbose

# Track API costs
/chatgpt-bridge cost --period week --by-model

# Manage configuration
/chatgpt-bridge config --validate
```

### Function Calling

```bash
# Chat with tool/function calling enabled
/chatgpt-bridge chat --tools file_search,grep_search "Find all GenServer modules"

# List available tools
/chatgpt-bridge tools --list

# Test specific tool execution
/chatgpt-bridge tools --test grep_search --args '{"query": "GenServer"}'
```

## Options and Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `action` | enum | Yes | -- | Action to perform: `chat`, `complete`, `stream`, `embed`, `models`, `cost`, `health`, `config`, `tools` |
| `prompt` | string | Varies | -- | User prompt for chat/complete/stream actions |
| `--model` | string | No | `gpt-4o` | OpenAI model to use |
| `--temperature` | float | No | `0.7` | Sampling temperature (0.0 to 2.0) |
| `--max-tokens` | integer | No | `4096` | Maximum response tokens |
| `--stream` | boolean | No | `false` | Enable streaming response for chat action |
| `--tools` | array | No | -- | Comma-separated list of tools to enable for function calling |
| `--system` | string | No | -- | System prompt override |
| `--session` | string | No | -- | Session ID for multi-turn conversations |
| `--format` | enum | No | `text` | Output format: `text`, `json`, `markdown` |
| `--period` | enum | No | `today` | Cost reporting period: `today`, `week`, `month` |
| `--by-model` | boolean | No | `false` | Break down cost report by model |
| `--verbose` | boolean | No | `false` | Show detailed output for health and config actions |

## Authority and Access

| Property | Value |
|----------|-------|
| **Authority Level** | L2+ |
| **Executing Agent** | `chatgpt-bridge-commander` |
| **Agent Classification** | L1 Strategic Commander |
| **Status** | Production |
| **Usage Frequency** | Low |
| **Category** | LLM Operations |
| **Domain** | Cross-LLM Coordination / OpenAI API |
| **AIAD Version** | 1.0.0 |
| **Sub-Agents** | `chatgpt-prompt-engineer`, `chatgpt-context-manager`, `chatgpt-tool-executor` |

## Technical Implementation

The **/chatgpt-bridge** command is implemented as a GenServer-based bridge that manages connection pooling, rate limiting, session state, and cost tracking for all OpenAI API interactions. The bridge architecture follows the OTP supervision pattern with circuit breaker protection for API outages.

```elixir
defmodule Prismatic.LLM.Bridges.ChatGPTBridge do
  @moduledoc """
  ChatGPT/OpenAI API bridge with connection pooling, rate limiting,
  circuit breaking, and cost tracking. Conforms to unified LLM interface.
  """

  use GenServer

  @default_model "gpt-4o"
  @rate_limit_rpm 500
  @rate_limit_tpm 30_000

  @spec chat(String.t(), keyword()) :: {:ok, Response.t()} | {:error, term()}
  def chat(prompt, opts \\ []) do
    model = Keyword.get(opts, :model, @default_model)
    temperature = Keyword.get(opts, :temperature, 0.7)
    stream = Keyword.get(opts, :stream, false)

    with :ok <- check_rate_limit(),
         :ok <- check_circuit_breaker(),
         {:ok, response} <- execute_chat(prompt, model, temperature, stream, opts),
         :ok <- track_cost(response) do
      {:ok, response}
    end
  end

  defp execute_chat(prompt, model, temperature, true, opts) do
    messages = build_messages(prompt, opts)

    Prismatic.LLM.OpenAI.Client.stream_chat(%{
      model: model,
      messages: messages,
      temperature: temperature,
      max_tokens: Keyword.get(opts, :max_tokens, 4096),
      tools: resolve_tools(Keyword.get(opts, :tools))
    })
  end

  defp track_cost(%{usage: usage, model: model}) do
    pricing = Prismatic.LLM.Pricing.get(model)
    cost = usage.prompt_tokens * pricing.input + usage.completion_tokens * pricing.output
    Prismatic.LLM.CostTracker.record(model, cost, usage)
    :ok
  end
end
```

The bridge implements three critical operational patterns. First, **rate limiting** enforces OpenAI's per-minute request and token quotas using a sliding window algorithm, preventing 429 errors and ensuring fair resource distribution across concurrent operations. Second, the **circuit breaker** pattern (using a closed/open/half-open state machine) protects the platform from cascading failures when the OpenAI API experiences outages -- after three consecutive failures, the circuit opens and redirects requests to fallback providers. Third, **cost tracking** records every API call's token consumption and dollar cost, enabling budget enforcement and cost optimization analysis.

The session management system maintains multi-turn conversation state in ETS, keyed by session ID. This enables persistent conversations across multiple command invocations without requiring the user to manage conversation history manually. Sessions are garbage-collected after a configurable inactivity timeout.

## Workflow Integration

The **/chatgpt-bridge** command serves as the foundation layer for all ChatGPT interactions within the platform. Higher-level commands -- [/chatgpt-analyze](@/commands/chatgpt-analyze.md), [/chatgpt-consult](@/commands/chatgpt-consult.md), [/chatgpt-convert](@/commands/chatgpt-convert.md) -- all route their API calls through the bridge, inheriting its rate limiting, cost tracking, and circuit breaking capabilities.

In the **multi-model development workflow**, developers use the bridge for quick ChatGPT consultations when a different perspective is needed on a design decision or code approach. The session persistence enables iterative exploration without losing conversational context.

In the **cross-model collaboration workflow**, the bridge's `embed` action generates embeddings for semantic search applications, while the `tools` action enables ChatGPT to call platform functions through the function calling protocol, bridging LLM reasoning with platform capabilities.

The `health` and `cost` actions support **operational monitoring workflows**, enabling teams to track API availability, latency, and spending in real-time. Integration with the platform's telemetry system ensures that all bridge metrics are available in monitoring dashboards.

## Integration Points

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Executed by `chatgpt-bridge-commander` agent |
| [/chatgpt-analyze](@/commands/chatgpt-analyze.md) | Provides API layer for analysis sessions |
| [/chatgpt-consult](@/commands/chatgpt-consult.md) | Provides API layer for consultation sessions |
| [/chatgpt-convert](@/commands/chatgpt-convert.md) | Provides API layer for format conversion |
| [/chatgpt-pack](@/commands/chatgpt-pack.md) | Context archives uploaded via bridge |
| [/chatgpt-sync](@/commands/chatgpt-sync.md) | Project synchronization uses bridge API |
| [/llm](@/commands/llm.md) | Unified LLM orchestration across providers |
| AIAD Registry | Command specification and discovery |
| [Quality Gates](@/glossary/quality-gates.md) | Pre/post execution quality validation |
| [Telemetry](@/glossary/telemetry.md) | API latency, token usage, cost [metrics](@/glossary/metrics.md) |
| OpenAI API | Underlying GPT-4, embedding, and function calling endpoints |
| MCP Tools | Function calling integration with platform MCP servers |

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Every API call must succeed or fail explicitly with actionable error information. No silent failures, no swallowed exceptions, no degraded responses presented as successful. Rate limit violations are prevented proactively rather than handled reactively. Cost budget enforcement is hard -- when the budget is exhausted, requests are blocked rather than allowed to proceed with a warning.
- **NO DOUBTS**: API health status is verified before critical operations. Model availability is confirmed, not assumed. Cost tracking provides exact figures based on actual token counts, not estimates. Session state is explicitly managed with deterministic behavior -- no ambiguity about which messages are included in a conversation context.
- **Regression Protection**: Bridge configuration, rate limiting logic, and cost calculation formulas include comprehensive test suites. Changes to OpenAI API integration trigger mandatory regression validation against known request/response pairs.

## Best Practices

1. **Use appropriate models**: Default to `gpt-4o` for quality-sensitive tasks, `gpt-4o-mini` for high-volume or cost-sensitive operations, and reasoning models for complex multi-step problems.
2. **Enable streaming for long responses**: Use `--stream` for any request expected to generate more than a few hundred tokens. Streaming provides real-time feedback and reduces perceived latency.
3. **Leverage sessions for iterative work**: Use `--session` for multi-turn conversations rather than stuffing all context into a single prompt. Sessions maintain conversation history automatically.
4. **Monitor costs proactively**: Run `/chatgpt-bridge cost --period week --by-model` regularly to identify cost optimization opportunities and prevent budget overruns.
5. **Validate health before batch operations**: Run `/chatgpt-bridge health` before launching batch operations to confirm API availability and check rate limit headroom.
6. **Use function calling for platform integration**: The `--tools` parameter enables ChatGPT to call platform functions, creating powerful automation workflows that combine LLM reasoning with platform capabilities.

## Related Commands

- [/llm](@/commands/llm.md) - Primary LLM operation management and orchestration
- [/chatgpt-analyze](@/commands/chatgpt-analyze.md) - Launch ChatGPT ANALYZE conversation for deep code analysis
- [/chatgpt-consult](@/commands/chatgpt-consult.md) - Consult ChatGPT for alternative perspectives and solutions
- [/chatgpt-convert](@/commands/chatgpt-convert.md) - Convert content between LLM-specific formats and prompts
- [/chatgpt-pack](@/commands/chatgpt-pack.md) - Context packing for ChatGPT collaboration and knowledge transfer
- [/chatgpt-sync](@/commands/chatgpt-sync.md) - Synchronize context and progress between Claude and ChatGPT
- [/local-llm](@/commands/local-llm.md) - Execute LLM requests using local providers with zero API cost
- [/openrouter](@/commands/openrouter.md) - OpenRouter LLM provider operations and management

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)