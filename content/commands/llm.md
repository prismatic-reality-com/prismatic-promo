+++
title = "/llm"
weight = 1640
[extra]
category = "LLM Operations"
description = "Primary LLM operation management and orchestration"
syntax = "/llm [options]"
authority = "L2+"
agent = "llm-unified-orchestrator"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1068
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["llm", "Primary", "commands", "LLM Operations", "Prismatic Platform", "Ollama", "Provider", "Local"]
tags = ["commands", "llm-operations", "llm", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/llm - Prismatic Platform"
+++

## Overview

**/llm** is a production command in the **LLM Operations** category of the Prismatic Platform that serves as the primary interface for managing and orchestrating Large Language Model operations across all available providers. The platform supports multiple LLM backends -- local [Ollama](/glossary/ollama/) instances, Claude via the Anthropic API, OpenRouter for multi-model access, and ChatGPT through the bridge interface -- and this command provides a unified control plane for routing requests, managing provider health, tracking token usage, and optimizing cost-performance tradeoffs.

This command operates under the **L2+** authority level and is executed by the `llm-unified-orchestrator` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The unified orchestrator eliminates the complexity of managing multiple LLM providers by presenting a single interface that automatically routes requests to the optimal provider based on task requirements, model capabilities, cost constraints, and availability.

LLM operations are central to the Prismatic Platform's agent ecosystem. Over 400 AIAD agents rely on language model capabilities for code generation, analysis, reasoning, and natural language processing. The `/llm` command ensures these agents always have access to appropriate model capabilities, whether through cloud APIs or local inference.

## Architecture

The LLM orchestration system is structured as a multi-provider routing layer with intelligent request dispatch.

### Provider Architecture

```
/llm command -> Request Router -> Provider Selector -> Provider Client -> Response Handler
                     |                   |                   |                  |
                     v                   v                   v                  v
              Task Analysis         Cost/Quality          HTTP/Local        Token Counting
              Model Matching        Optimization          Auth/Rate         Quality Check
              Priority Queue        Fallback Chain        Retry Logic       Cache Update
```

### Provider Registry

| Provider | Models | Latency | Cost | Local |
|----------|--------|---------|------|-------|
| **Ollama** | qwen3-coder (7B), deepseek-coder (6.7B), gpt-oss (20B) | < 3s | Free | Yes |
| **Anthropic** | Claude Opus 4.6, Claude Sonnet | 2-10s | Per-token | No |
| **OpenRouter** | 100+ models | 2-15s | Per-token | No |
| **ChatGPT Bridge** | GPT-4, GPT-3.5 | 3-20s | Per-token | No |

### Routing Strategy

The request router uses a multi-factor scoring model to select the optimal provider.

| Factor | Weight | Measurement |
|--------|--------|-------------|
| **Task Fitness** | 35% | Model capability match for task type |
| **Latency** | 25% | Expected response time |
| **Cost** | 20% | Token cost for estimated response size |
| **Availability** | 15% | Provider health and rate limit headroom |
| **Quality** | 5% | Historical quality score for similar tasks |

## Usage

```bash
# Send a prompt to the optimal provider
/llm "Explain the OTP supervision tree pattern"

# Route to a specific provider
/llm "Generate a GenServer module" --provider=ollama --model=qwen3-coder

# Use cloud provider for complex reasoning
/llm "Analyze this architecture for security vulnerabilities" --provider=anthropic

# Check provider status
/llm status

# View token usage statistics
/llm usage --period=today

# List available models across all providers
/llm models

# Configure provider priorities
/llm configure --priority="ollama,anthropic,openrouter"

# Test all provider connections
/llm health

# Switch default provider
/llm default --provider=ollama --model=qwen3-coder

# Stream response
/llm "Write comprehensive tests for this module" --stream
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `prompt` | string | none | Prompt text (positional, or from stdin) |
| `action` | string | prompt | Action: prompt, status, usage, models, configure, health, default |
| `--provider` | string | auto | Provider: ollama, anthropic, openrouter, chatgpt |
| `--model` | string | auto | Specific model within provider |
| `--stream` | flag | false | Stream response tokens |
| `--max-tokens` | integer | 4096 | Maximum response tokens |
| `--temperature` | float | 0.7 | Sampling temperature |
| `--system` | string | none | System prompt |
| `--format` | string | text | Output format: text, json, markdown |
| `--priority` | string | auto | Provider priority list |
| `--period` | string | today | Usage statistics period: today, week, month, all |
| `--cost-limit` | float | none | Maximum cost per request in USD |
| `--timeout` | integer | 60 | Request timeout in seconds |

## Execution Flow

1. **Request Analysis**: The prompt is analyzed to determine its complexity, expected response size, and task category (code generation, reasoning, analysis, creative writing). This analysis informs provider selection.

2. **Provider Selection**: The routing engine evaluates all available providers against the multi-factor scoring model. The highest-scoring provider is selected, with a fallback chain of alternative providers.

3. **Rate Limit Check**: The selected provider's rate limit status is checked. If the rate limit would be exceeded, the next provider in the fallback chain is selected automatically.

4. **Request Dispatch**: The prompt is formatted according to the selected provider's API specification and dispatched with appropriate authentication headers, model parameters, and timeout settings.

5. **Response Collection**: The response is collected (streaming or complete) and parsed. Token counts are extracted for usage tracking and cost calculation.

6. **Quality Validation**: The response is checked for basic quality indicators: non-empty content, appropriate length, absence of obvious error patterns, and format compliance.

7. **Usage Recording**: Token usage, response time, provider, model, and cost are recorded in the usage tracking system for later analysis and budget management.

8. **Output Formatting**: The response is formatted according to the `--format` option and presented to the operator.

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `llm-unified-orchestrator` | Central LLM coordination |
| [/local-llm](/commands/local-llm/) | Local provider | Zero-cost Ollama provider |
| [/openrouter](/commands/openrouter/) | Cloud provider | Multi-model cloud access |
| [/chatgpt-bridge](/commands/chatgpt-bridge/) | Bridge provider | ChatGPT session-based access |
| [Ollama](/glossary/ollama/) | Local inference | Local model management |
| [Telemetry](/glossary/telemetry/) | Usage tracking | Token counts, costs, latencies |
| [Quality Gates](/glossary/quality-gates/) | Response quality | Quality validation |
| [AIAD Registry](/glossary/aiad/) | Command specification | LLM command configuration |

## Best Practices

**Let the router decide.** The automatic routing engine makes better provider selections than manual overrides in most cases. It accounts for factors (rate limits, current latency, model availability) that are difficult to track manually.

**Use local models for routine tasks.** Ollama models running locally provide zero-cost, low-latency responses for code generation, formatting, and simple analysis. Reserve cloud providers for tasks that genuinely require larger model capabilities.

**Monitor token usage.** Use `/llm usage` regularly to track consumption patterns. Unexpected spikes in token usage often indicate inefficient prompts or unnecessary complexity in agent workflows.

**Set cost limits for exploration.** When experimenting with prompts or testing new workflows, use `--cost-limit` to prevent accidentally expensive requests. This is especially important when using pay-per-token cloud providers.

**Configure fallback chains.** Ensure that the provider priority list includes both local and cloud options so that requests succeed even when individual providers are unavailable.

**Use streaming for long responses.** The `--stream` flag provides immediate feedback for long-running requests, reducing perceived latency and allowing early termination if the response is going in the wrong direction.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `no_providers_available` | All providers are down or rate limited | Wait for rate limit reset or start local Ollama instance |
| `provider_auth_failed` | Invalid API key for selected provider | Update API credentials in environment variables |
| `rate_limit_exceeded` | Provider rate limit hit | Automatic fallback to next provider in chain |
| `response_timeout` | Request exceeded configured timeout | Increase `--timeout` or switch to faster provider |
| `cost_limit_exceeded` | Request would exceed `--cost-limit` | Increase limit or use local provider |
| `model_not_available` | Specified model not found at provider | Check model name or use `--model=auto` |
| `ollama_not_running` | Local Ollama instance not started | Start Ollama with `ollama serve` |

## Advanced Usage

### Provider Performance Benchmarking

Compare provider performance for specific task types.

```bash
# Benchmark code generation across providers
/llm "Generate a GenServer for rate limiting" --benchmark --providers=all

# Compare quality scores
/llm benchmark --task=code-generation --iterations=10 --format=json
```

### Custom Provider Configuration

Configure provider-specific settings.

```bash
# Configure Ollama settings
/llm configure --provider=ollama --base-url=http://localhost:11434 --default-model=qwen3-coder

# Configure Anthropic settings
/llm configure --provider=anthropic --max-retries=3 --timeout=120

# Set global cost budget
/llm configure --monthly-budget=50.00 --alert-threshold=80%
```

### Agent-Specific Routing

Configure different routing strategies for different agent types.

```bash
# Route code agents to local models
/llm configure --agent-type=code --provider=ollama

# Route analysis agents to Claude
/llm configure --agent-type=analysis --provider=anthropic
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Every LLM request is validated, routed optimally, and quality-checked before delivery. Failed requests trigger automatic fallback.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Provider selection is based on quantitative scoring, not assumptions. Usage tracking provides evidence for cost optimization decisions.

## Related Commands

- [/local-llm](/commands/local-llm/) - Execute LLM requests using local providers with zero API cost
- [/openrouter](/commands/openrouter/) - OpenRouter LLM provider operations and management
- [/chatgpt-bridge](/commands/chatgpt-bridge/) - ChatGPT bridge operations for cross-LLM coordination
- [/chatgpt-workflow](/commands/chatgpt-workflow/) - Multi-step workflow coordination across AI assistants
- [/code](/commands/code/) - Core coding implementation and feature development
- [/agents](/commands/agents/) - List and manage agent ecosystem with status monitoring

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)