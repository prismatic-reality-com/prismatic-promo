+++
title = "/local-llm"
weight = 1650
[extra]
category = "LLM Operations"
description = "Execute LLM requests using local providers with zero API cost"
syntax = "/local-llm [options]"
authority = "L2+"
agent = "local-llm-coordinator"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 930
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["local-llm", "Execute", "commands", "LLM Operations", "Prismatic Platform", "Ollama", "Model", "Local"]
tags = ["commands", "llm-operations", "local-llm", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/local-llm - Prismatic Platform"
+++

## Overview

**/local-llm** is a production command in the **LLM Operations** category of the Prismatic Platform that executes language model requests exclusively through local providers, primarily [Ollama](@/glossary/ollama.md), at zero API cost. While the [/llm](@/commands/llm.md) command routes requests across all available providers based on optimization criteria, the `/local-llm` command guarantees that no external API calls are made, ensuring complete data privacy, zero latency variability from network conditions, and zero per-token costs.

This command operates under the **L2+** authority level and is executed by the `local-llm-coordinator` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. Local LLM execution is essential for scenarios where data sensitivity prevents sending content to external APIs, where network connectivity is unreliable, or where cost management requires eliminating per-token charges.

The Prismatic Platform integrates with Ollama as its primary local LLM provider, supporting models including qwen3-coder (7B parameters, < 3 second response), gpt-oss (20B parameters, < 5 second response), and deepseek-coder (6.7B parameters, < 3 second response). These models run entirely on the local machine's hardware, providing inference capabilities that are adequate for many platform operations including code generation, analysis, and formatting tasks.

## Architecture

The local LLM system operates through the Ollama runtime, which manages model loading, inference, and memory.

### Local Inference Architecture

```
/local-llm -> Ollama Client -> Ollama Server -> Model Runtime
                   |                |                |
                   v                v                v
             Request Format    API (port 11434)   GPU/CPU Inference
             Response Parse    Model Manager      Memory Management
             Token Count       Health Monitor     Quantization
```

### Model Registry

| Model | Parameters | VRAM Required | Response Time | Strength |
|-------|-----------|--------------|---------------|----------|
| **qwen3-coder** | 7B | ~4GB | < 3s | Code generation, refactoring |
| **deepseek-coder** | 6.7B | ~4GB | < 3s | Code analysis, completion |
| **gpt-oss** | 20B | ~12GB | < 5s | General reasoning, analysis |
| **codellama** | 7B | ~4GB | < 3s | Code-specific tasks |
| **llama3** | 8B | ~5GB | < 4s | General purpose |

### Performance Characteristics

| Metric | Target | Typical |
|--------|--------|---------|
| **Response time** | < 5s | 1-3s (7B), 3-5s (20B) |
| **Memory usage** | < 8GB | 4-6GB (7B), 10-14GB (20B) |
| **Uptime** | > 99% | > 99.5% |
| **Accuracy** | > 85% | 85-92% |
| **Throughput** | > 30 tok/s | 35-50 tok/s (7B) |

## Usage

```bash
# Send a prompt to the default local model
/local-llm "Refactor this function to use pattern matching"

# Use a specific local model
/local-llm "Generate a GenServer for caching" --model=qwen3-coder

# Use the larger model for complex reasoning
/local-llm "Analyze this architecture decision" --model=gpt-oss

# Check local model availability
/local-llm status

# List installed models
/local-llm models

# Install a new model
/local-llm install codellama

# Remove a model
/local-llm remove codellama

# Run a benchmark
/local-llm benchmark --model=qwen3-coder

# Configure default model
/local-llm config --default-model=qwen3-coder

# Check Ollama server health
/local-llm health

# Stream response tokens
/local-llm "Write a comprehensive module" --stream

# Process from file input
/local-llm --input=prompt.txt --output=response.md
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `prompt` | string | none | Prompt text (positional, or from stdin) |
| `action` | string | prompt | Action: prompt, status, models, install, remove, benchmark, config, health |
| `--model` | string | qwen3-coder | Model name |
| `--stream` | flag | false | Stream response tokens |
| `--max-tokens` | integer | 4096 | Maximum response tokens |
| `--temperature` | float | 0.7 | Sampling temperature |
| `--system` | string | none | System prompt |
| `--format` | string | text | Output format: text, json, markdown |
| `--input` | string | none | Read prompt from file |
| `--output` | string | stdout | Write response to file |
| `--timeout` | integer | 30 | Request timeout in seconds |
| `--verbose` | flag | false | Show model loading and inference details |
| `--gpu` | boolean | auto | Force GPU or CPU inference |

## Execution Flow

1. **Ollama Health Check**: The command verifies that the Ollama server is running and responsive at `http://localhost:11434`. If the server is not running, a helpful error message is displayed with instructions to start it.

2. **Model Verification**: The requested model is verified as installed. If not installed and the action is `prompt`, the command offers to pull the model automatically.

3. **Model Loading**: If the model is not already loaded in memory, Ollama loads it from disk. First-use loading takes 5-15 seconds depending on model size; subsequent requests reuse the loaded model.

4. **Prompt Construction**: The prompt is constructed with the optional system prompt, user prompt, and any formatting parameters. The prompt format follows the model's expected chat template.

5. **Local Inference**: The request is sent to the Ollama API. Inference runs entirely on local hardware (GPU if available, CPU otherwise). No data leaves the machine.

6. **Response Collection**: The response is collected either as a complete response or as a token stream, depending on the `--stream` flag. Token counts are extracted for usage tracking.

7. **Quality Check**: The response is checked for basic quality: non-empty content, absence of degenerate output patterns (repetition, truncation), and reasonable length relative to the prompt.

8. **Output Formatting**: The response is formatted and delivered according to the `--format` and `--output` options.

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Executed by `local-llm-coordinator` | Local model management |
| [/llm](@/commands/llm.md) | Parent orchestrator | Local LLM as one provider option |
| [Ollama](@/glossary/ollama.md) | Inference runtime | Model serving and management |
| [Telemetry](@/glossary/telemetry.md) | Usage tracking | Response times, token counts, model usage |
| [Quality Gates](@/glossary/quality-gates.md) | Response quality | Output quality validation |
| [AIAD Registry](@/glossary/aiad.md) | Command specification | Local LLM command configuration |
| [/chatgpt-workflow](@/commands/chatgpt-workflow.md) | Workflow integration | Local models as workflow step targets |

## Best Practices

**Start Ollama before the platform.** Ensure the Ollama server is running before starting development sessions. The command checks Ollama availability but cannot start the server itself.

**Use appropriate models for the task.** The 7B models (qwen3-coder, deepseek-coder) are fast and adequate for most code-related tasks. Reserve the 20B model (gpt-oss) for tasks requiring stronger reasoning or more complex analysis.

**Monitor GPU memory.** Local models consume significant GPU memory. Running multiple models simultaneously can cause out-of-memory errors. Use `/local-llm models` to see which models are currently loaded and unload unused ones.

**Leverage zero cost for iteration.** The zero-cost nature of local inference encourages rapid iteration. Use local models to draft prompts and refine them before sending to more capable (and expensive) cloud models.

**Keep models updated.** Periodically check for model updates with `ollama pull model-name`. Newer model versions often include quality improvements and bug fixes.

**Use streaming for long outputs.** The `--stream` flag provides real-time feedback during generation, which is particularly valuable for long code generation tasks where early output can indicate whether the model is on the right track.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `ollama_not_running` | Ollama server not started | Run `ollama serve` in a separate terminal |
| `model_not_found` | Requested model not installed | Use `/local-llm install model-name` to download |
| `out_of_memory` | Insufficient GPU/system memory | Close other applications or use a smaller model |
| `model_loading_timeout` | Model loading exceeded timeout | Increase `--timeout` or pre-load the model |
| `inference_timeout` | Generation exceeded timeout | Increase `--timeout` or reduce `--max-tokens` |
| `degenerate_output` | Model produced repetitive/empty output | Adjust temperature, rephrase prompt, or try different model |
| `gpu_not_available` | No compatible GPU detected | Use `--gpu=false` for CPU-only inference (slower) |

## Advanced Usage

### Model Performance Comparison

Benchmark models to find the best option for specific task types.

```bash
# Benchmark all installed models
/local-llm benchmark --all --task=code-generation

# Benchmark specific model with detailed metrics
/local-llm benchmark --model=qwen3-coder --iterations=10 --verbose
```

### Custom Model Configuration

Configure model-specific parameters through Modelfiles.

```bash
# Create a custom model configuration
/local-llm config --create-modelfile --base=qwen3-coder \
  --system="You are an Elixir expert" --temperature=0.3

# Use the custom configuration
/local-llm "Generate a Supervisor module" --model=custom-elixir-expert
```

### Batch Processing

Process multiple prompts efficiently.

```bash
# Process a batch of prompts from file
/local-llm --batch=prompts.txt --output-dir=responses/ --model=qwen3-coder

# Process with parallel execution
/local-llm --batch=prompts.txt --parallel=2 --model=qwen3-coder
```

### Integration with Platform Agents

Configure agents to prefer local models for specific operations.

```bash
# Set agent-level model preferences
/local-llm config --agent=code-specialist --model=qwen3-coder
/local-llm config --agent=analysis-specialist --model=gpt-oss
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Local model responses are quality-checked before delivery. Degenerate outputs are detected and rejected.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Model selection is based on benchmarked performance data. Usage metrics provide evidence for optimization decisions.

## Related Commands

- [/llm](@/commands/llm.md) - Primary LLM operation management and orchestration
- [/openrouter](@/commands/openrouter.md) - OpenRouter LLM provider operations and management
- [/chatgpt-bridge](@/commands/chatgpt-bridge.md) - ChatGPT bridge operations for cross-LLM coordination
- [/chatgpt-workflow](@/commands/chatgpt-workflow.md) - Multi-step workflow coordination across AI assistants
- [/code](@/commands/code.md) - Core coding implementation and feature development
- [/agents](@/commands/agents.md) - List and manage agent ecosystem with status monitoring

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)