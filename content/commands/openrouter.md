+++
title = "/openrouter"
weight = 1660
[extra]
category = "LLM Operations"
description = "OpenRouter LLM provider operations and management"
syntax = "/openrouter [options]"
authority = "L2+"
agent = "openrouter-llm-specialist"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1058
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["openrouter", "commands", "LLM Operations", "Prismatic Platform", "Subcommand", "PrismaticLLM"]
tags = ["commands", "llm-operations", "openrouter", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/openrouter - Prismatic Platform"
+++

## Overview

**/openrouter** is a production command in the **LLM Operations** category of the Prismatic Platform. It manages OpenRouter LLM provider operations, providing a unified interface to access hundreds of large language models from multiple providers through OpenRouter's aggregation API, with intelligent model selection, cost optimization, and quality monitoring.

OpenRouter serves as a meta-provider in the Prismatic LLM infrastructure, offering access to models from OpenAI, Anthropic, Google, Meta, Mistral, and dozens of other providers through a single API endpoint. The `/openrouter` command manages this integration, handling model discovery, routing configuration, usage tracking, and cost optimization. It enables the platform to dynamically select the optimal model for each task based on quality requirements, latency constraints, and budget parameters.

The command plays a critical role in the platform's multi-provider LLM strategy. While Claude serves as the primary AI engine and [Ollama](/commands/ollama/) provides local model capabilities, OpenRouter fills the gap for specialized models, experimental providers, and cost-sensitive bulk operations. The routing intelligence ensures that each request reaches the most appropriate model without manual provider management.

This command operates under the **L2+** authority level and is executed by the `openrouter-llm-specialist` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. Its low usage frequency reflects its management-oriented nature -- configuration happens infrequently while the configured routing operates continuously.

## Architecture

The `/openrouter` command interfaces with the OpenRouter API through a provider abstraction layer that integrates with the platform's multi-provider LLM routing system.

### Provider Architecture

```
/openrouter Command --> OpenRouter Provider Manager
                              |
              +---------------+---------------+
              |               |               |
        Model Registry   Cost Tracker    Quality Monitor
              |               |               |
        +-----+-----+   +----+----+     +----+----+
        |     |     |   |    |    |     |    |    |
      Disc  Select Route Usage Budget  Score Bench Compare
      overy tion   Config Track Alerts  card  mark  Models
              |               |               |
              +---------------+---------------+
                              |
                    OpenRouter API (openrouter.ai/api)
```

### Core Components

| Component | Module | Responsibility |
|-----------|--------|----------------|
| **Provider Manager** | `PrismaticLLM.OpenRouter.Manager` | Lifecycle management and configuration |
| **Model Registry** | `PrismaticLLM.OpenRouter.ModelRegistry` | Available model catalog with capabilities |
| **Cost Tracker** | `PrismaticLLM.OpenRouter.CostTracker` | Usage metering and budget management |
| **Quality Monitor** | `PrismaticLLM.OpenRouter.QualityMonitor` | Output quality assessment and tracking |
| **Router** | `PrismaticLLM.OpenRouter.Router` | Intelligent model selection and routing |
| **Rate Limiter** | `PrismaticLLM.OpenRouter.RateLimiter` | Request rate management per model |

## Usage

### Service Management

```bash
# Check OpenRouter connection status and API health
/openrouter status

# View account information and credits
/openrouter account

# Test API connectivity
/openrouter test-connection
```

### Model Operations

```bash
# List available models
/openrouter models

# List models filtered by provider
/openrouter models --provider anthropic

# List models filtered by capability
/openrouter models --capability code-generation --max-cost 0.01

# Get detailed model information
/openrouter info anthropic/claude-3.5-sonnet

# Compare models on specific benchmark
/openrouter compare meta-llama/llama-3.1-70b openai/gpt-4o --benchmark code-quality
```

### Routing Configuration

```bash
# Set default routing rules
/openrouter route --task code-generation --model anthropic/claude-3.5-sonnet
/openrouter route --task summarization --model meta-llama/llama-3.1-70b
/openrouter route --task translation --model openai/gpt-4o-mini

# Configure cost-optimized routing
/openrouter route --mode cost-optimized --max-cost-per-1k 0.005

# Configure quality-first routing
/openrouter route --mode quality-first --min-quality 0.9

# View routing table
/openrouter routes

# Remove a routing rule
/openrouter route --remove --task summarization
```

### Cost Management

```bash
# View current usage and costs
/openrouter usage

# View usage by model
/openrouter usage --by model --period monthly

# Set budget alerts
/openrouter budget --monthly-limit 50.00 --alert-threshold 0.8

# Export usage report
/openrouter usage --export csv --file openrouter-usage.csv
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | Subcommand | - | Check API status and connectivity |
| `models` | Subcommand | - | List available models |
| `info` | Subcommand | - | Get detailed model information |
| `compare` | Subcommand | - | Compare models on benchmarks |
| `route` | Subcommand | - | Configure routing rules |
| `routes` | Subcommand | - | Display routing table |
| `usage` | Subcommand | - | View usage statistics and costs |
| `budget` | Subcommand | - | Configure budget limits and alerts |
| `account` | Subcommand | - | View account information |
| `--provider` | String | All | Filter by model provider |
| `--capability` | String | All | Filter by model capability |
| `--max-cost` | Float | - | Maximum cost per 1K tokens |
| `--task` | String | - | Task type for routing rules |
| `--model` | String | - | Target model identifier |
| `--mode` | Enum | `balanced` | Routing mode: `cost-optimized`, `balanced`, `quality-first` |
| `--min-quality` | Float | `0.7` | Minimum acceptable quality score |
| `--period` | Enum | `daily` | Reporting period: `daily`, `weekly`, `monthly` |
| `--by` | Enum | `total` | Group usage by: `total`, `model`, `task`, `day` |
| `--monthly-limit` | Float | - | Monthly budget limit in USD |
| `--alert-threshold` | Float | `0.8` | Budget alert at this fraction of limit |

## Execution Flow

**Phase 1 -- Authentication** (0-1s): The command validates the OpenRouter API key from the environment configuration (`OPENROUTER_API_KEY`). Invalid or expired keys result in immediate rejection with remediation instructions.

**Phase 2 -- API Health Check** (1-3s): A lightweight health check verifies that the OpenRouter API is accessible and responding within acceptable latency bounds. This check runs before any subcommand execution to provide early failure detection.

**Phase 3 -- Subcommand Execution** (3s-variable): The specific subcommand is dispatched to the appropriate manager component. Model listing queries the OpenRouter API catalog. Routing configuration updates the local routing table. Usage queries aggregate cost and volume data from the tracking database.

**Phase 4 -- Data Enrichment** (variable): For model operations, response data is enriched with platform-specific metadata including quality scores from previous usage, compatibility ratings with platform tasks, and cost-efficiency calculations. This enrichment transforms raw API data into actionable intelligence.

**Phase 5 -- Result Presentation** (1-2s): Results are formatted and displayed according to the specified output format. Tables include sortable columns, and model comparisons include visual quality indicators.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Execution | Managed by `openrouter-llm-specialist` agent |
| [AIAD Registry](/glossary/aiad/) | Discovery | Registered command with AIAD metadata |
| [Telemetry](/glossary/telemetry/) | Observability | Request latency, cost, and quality [metrics](/glossary/metrics/) |
| [Ollama](/commands/ollama/) | Fallback partner | Local models as fallback when cloud unavailable |
| LLM Router | Routing system | OpenRouter models as routing targets |
| [Quality Gates](/glossary/quality-gates/) | Quality validation | Output quality gates for model responses |
| [ETS Storage](/glossary/ets/) | Caching | Model catalog and routing table cached in ETS |
| Budget Manager | Cost control | Budget enforcement and alert system |

## Best Practices

**Model Selection Strategy**: Do not default to the most expensive model. Many tasks -- summarization, classification, simple code generation -- perform equally well on smaller, cheaper models. Use `/openrouter compare` to benchmark models against your specific use cases before configuring routing rules.

**Cost Monitoring**: Set budget alerts at 80% of your monthly limit using `/openrouter budget`. Review usage patterns weekly with `/openrouter usage --by model --period weekly` to identify cost optimization opportunities.

**Routing Granularity**: Define routing rules at the task level rather than using a single default model. Different tasks have different quality-cost trade-off profiles. Code generation may justify premium models while log summarization works fine with economy models.

**Quality Baselines**: Before configuring quality-first routing, establish baseline quality scores for your target models using `/openrouter compare`. The `--min-quality` parameter is only meaningful when calibrated against measured model performance on your specific tasks.

**Failover Configuration**: Configure at least two routing targets per task type. If the primary model is unavailable or rate-limited, the router automatically fails over to the secondary. This prevents workflow interruptions due to transient provider issues.

## Error Handling

| Error Condition | Handling Strategy | User Impact |
|----------------|-------------------|-------------|
| Invalid API key | Clear error with configuration instructions | All operations blocked |
| API rate limiting | Automatic backoff with queue management | Delayed responses |
| Model unavailable | Failover to next routing target | Transparent model switch |
| Budget exceeded | Requests blocked with notification | Operations paused until budget reset |
| Network timeout | Retry with exponential backoff (3 attempts) | Delayed response |
| Quality below threshold | Model flagged, routing adjusted | Warning, alternative model used |

## Advanced Usage

### Bulk Operations

For high-volume operations, configure batch processing:

```bash
# Configure batch processing parameters
/openrouter config --batch-size 10 --batch-delay 100ms

# Run batch quality assessment across models
/openrouter benchmark --models "anthropic/*,openai/*" --benchmark-suite standard
```

### Provider Health Monitoring

Track provider reliability over time:

```bash
# View provider uptime statistics
/openrouter providers --health --period 30d

# Set provider preference based on reliability
/openrouter config --prefer-provider anthropic --fallback openai
```

### Cost Forecasting

Project future costs based on usage patterns:

```bash
# Forecast monthly costs based on current usage
/openrouter forecast --period monthly

# Model cost impact of routing changes
/openrouter simulate-cost --new-route "code-gen -> openai/gpt-4o-mini"
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. API interactions must complete or fail explicitly. Budget limits are hard limits, not suggestions. Quality thresholds are enforced without exception.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Model selection decisions are backed by benchmark data. Cost projections are based on measured usage patterns. Routing configurations are validated before activation.

## Related Commands

- [/llm](/commands/llm/) - Primary LLM operation management and orchestration
- [/local-llm](/commands/local-llm/) - Execute LLM requests using local providers with zero API cost
- [/ollama](/commands/ollama/) - Local AI Ollama model management, installation and optimization
- [/chatgpt-bridge](/commands/chatgpt-bridge/) - ChatGPT bridge operations for cross-LLM coordination
- [/code](/commands/code/) - Core coding implementation and feature development
- [/fix](/commands/fix/) - Bug fix implementation with mandatory [regression tests](/capabilities/regression-tests/)

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)