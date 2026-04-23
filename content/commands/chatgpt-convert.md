+++
title = "/chatgpt-convert"
weight = 1690
[extra]
category = "LLM Operations"
description = "Convert content between LLM-specific formats and prompts"
syntax = "/chatgpt-convert [options]"
authority = "L2+"
agent = "chatgpt-prompt-engineer"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1246
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["chatgpt-convert", "Convert", "LLM-specific", "commands", "LLM Operations", "Prismatic Platform", "ChatGPT", "Claude", "OpenAI"]
tags = ["commands", "llm-operations", "chatgpt-convert", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/chatgpt-convert - Prismatic Platform"
+++

## Overview

The **/chatgpt-convert** command provides bidirectional format conversion between Claude and ChatGPT/OpenAI representations for prompts, tool schemas, API responses, conversation histories, and JSON schemas. In a multi-model AI platform where different LLM providers use incompatible formats for structurally equivalent concepts -- Claude's XML-based thinking blocks versus ChatGPT's step-by-step prefixes, MCP tool schemas versus OpenAI function definitions, different role naming conventions in conversation histories -- this command eliminates the manual format translation burden that would otherwise impede cross-provider workflows.

The practical significance of format interoperability cannot be understated in the context of the Prismatic Platform's multi-model architecture. The platform maintains active integrations with Claude (primary development), ChatGPT (analysis and consultation), Ollama (local cost-free inference), and OpenRouter (specialized model access). Each provider has evolved its own conventions for prompts, tool calling, and response structures. When a prompt engineered for Claude needs to be tested on ChatGPT, or when MCP tool definitions need to be exposed through ChatGPT's function calling interface, the **/chatgpt-convert** command handles the structural transformation while preserving semantic content. Beyond mechanical translation, the command applies format-specific optimizations -- restructuring XML-heavy Claude prompts into the markdown patterns that ChatGPT processes more efficiently, or converting ChatGPT's flat conversation format into Claude's richer role-based structure.

The command is executed by the `chatgpt-prompt-engineer` agent within the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) framework. This agent specializes in prompt optimization and format translation across LLM providers, understanding the nuances of how different models interpret structural patterns. It supports five conversion actions -- prompt, tools, response, conversation, and schema -- with auto-detection of source format, optional optimization passes, and structure preservation modes. The command is part of the platform's 216-command slash command [registry](/glossary/registry-otp/) and integrates with [/chatgpt-bridge](/commands/chatgpt-bridge/), [/chatgpt-pack](/commands/chatgpt-pack/), and the unified [/llm](/commands/llm/) orchestrator.

## Usage

```bash
/chatgpt-convert <action> [--source <format>] --target <format> [--input <content>] [--file <path>] [--output <path>] [--optimize] [--preserve-structure] [--verbose]
```

### Prompt Conversion

```bash
# Convert Claude prompt to ChatGPT format (auto-detect source)
/chatgpt-convert prompt --target chatgpt "Claude prompt with <thinking> tags and <artifact> blocks"

# Convert ChatGPT prompt to Claude format from file
/chatgpt-convert prompt --target claude --file gpt_prompt.txt

# Convert with optimization enabled
/chatgpt-convert prompt --target chatgpt --optimize --file claude_prompt.md

# Preserve original structure during conversion
/chatgpt-convert prompt --target chatgpt --preserve-structure --file prompt.xml
```

### Tool Schema Conversion

```bash
# Convert MCP tools to OpenAI function definitions
/chatgpt-convert tools --source claude --target chatgpt --file mcp_tools.json

# Convert OpenAI functions to MCP tools
/chatgpt-convert tools --source chatgpt --target claude --file openai_functions.json

# Convert single tool definition inline
/chatgpt-convert tools --target chatgpt '{"name": "search_files", "inputSchema": {...}}'
```

### Response and Conversation Conversion

```bash
# Convert Claude API response to OpenAI format
/chatgpt-convert response --source claude --target chatgpt --file claude_response.json

# Convert full conversation history
/chatgpt-convert conversation --target chatgpt --file claude_conv.json --output gpt_conv.json

# Verbose mode to see all transformations applied
/chatgpt-convert response --target chatgpt --verbose --file response.json
```

### Schema Conversion

```bash
# Convert MCP tool schema to OpenAI function schema
/chatgpt-convert schema --target chatgpt --file mcp_schema.json

# Inline schema conversion
/chatgpt-convert schema --target claude '{"type": "object", "properties": {...}}'
```

## Options and Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `action` | enum | Yes | -- | Conversion type: `prompt`, `tools`, `response`, `conversation`, `schema` |
| `--source` | enum | No | `auto` | Source format: `claude`, `chatgpt`, `auto` (auto-detect) |
| `--target` | enum | Yes | -- | Target format: `claude`, `chatgpt` |
| `--input` | string | No | -- | Inline content to convert (alternative to `--file`) |
| `--file` | path | No | -- | Input file path for conversion |
| `--output` | path | No | stdout | Output file path; defaults to standard output |
| `--optimize` | boolean | No | `true` | Apply format-specific optimizations during conversion |
| `--preserve-structure` | boolean | No | `false` | Keep original structure intact for lossless round-trip conversion |
| `--verbose` | boolean | No | `false` | Show detailed conversion report including all transformations applied |

## Authority and Access

| Property | Value |
|----------|-------|
| **Authority Level** | L2+ |
| **Executing Agent** | `chatgpt-prompt-engineer` |
| **Agent Classification** | L2 Prompt Engineering Specialist |
| **Status** | Production |
| **Usage Frequency** | Low |
| **Category** | LLM Operations |
| **Domain** | Cross-Provider Format Translation |
| **AIAD Version** | 1.0.0 |
| **Related Agents** | `chatgpt-tool-executor`, `llm-unified-orchestrator` |

## Technical Implementation

The **/chatgpt-convert** command delegates to the `chatgpt-prompt-engineer` agent, which maintains a registry of bidirectional conversion rules for each supported format pair. The conversion engine operates in three phases: source format detection and parsing, structural transformation, and target format rendering with optional optimization.

```elixir
defmodule Prismatic.LLM.Bridges.FormatConverter do
  @moduledoc """
  Bidirectional format converter between Claude and ChatGPT/OpenAI formats.
  Handles prompts, tool schemas, responses, conversations, and JSON schemas.
  """

  @conversion_rules %{
    prompt: %{
      claude_to_chatgpt: [
        {:replace_tag, "<thinking>", "Let's think step by step:"},
        {:replace_tag, "</thinking>", ""},
        {:convert_artifacts, :to_code_fences},
        {:replace_role, "Human:", "User:"},
        {:optimize_for_gpt_tokenization, true}
      ],
      chatgpt_to_claude: [
        {:replace_prefix, "Let's think step by step", "<thinking>"},
        {:convert_code_fences, :to_artifacts},
        {:replace_role, "User:", "Human:"},
        {:add_claude_formatting, true}
      ]
    },
    tools: %{
      claude_to_chatgpt: &ToolSchemaConverter.mcp_to_openai/1,
      chatgpt_to_claude: &ToolSchemaConverter.openai_to_mcp/1
    }
  }

  @spec convert(atom(), keyword()) :: {:ok, String.t(), ConversionReport.t()} | {:error, term()}
  def convert(action, opts \\ []) do
    source = Keyword.get(opts, :source, :auto)
    target = Keyword.fetch!(opts, :target)
    optimize = Keyword.get(opts, :optimize, true)

    with {:ok, input} <- read_input(opts),
         {:ok, detected_source} <- detect_source_format(input, source),
         {:ok, converted} <- apply_conversion(action, detected_source, target, input),
         {:ok, optimized} <- maybe_optimize(converted, target, optimize) do
      report = build_conversion_report(input, optimized, detected_source, target)
      {:ok, optimized, report}
    end
  end

  defp apply_conversion(:tools, :claude, :chatgpt, input) do
    converted =
      input
      |> Jason.decode!()
      |> Enum.map(&ToolSchemaConverter.mcp_to_openai/1)
      |> Jason.encode!(pretty: true)

    {:ok, converted}
  end
end
```

The prompt conversion rules handle the structural differences between Claude and ChatGPT prompt conventions. Claude's `<thinking>` tags are converted to ChatGPT's "Let's think step by step" prefix pattern. Claude's `<artifact>` blocks with type metadata are converted to standard markdown code fences. Role names are mapped (`Human:` to `User:` and vice versa). When optimization is enabled, the converter also restructures deeply nested XML into flatter markdown patterns that ChatGPT's tokenizer processes more efficiently.

The tool schema conversion handles the structural differences between MCP (Model Context Protocol) tool definitions used by Claude and OpenAI function definitions used by ChatGPT. The primary differences are the container structure (`inputSchema` versus `parameters`), the wrapping pattern (OpenAI wraps functions in a `type: "function"` container), and function name sanitization (OpenAI restricts names to alphanumeric characters and underscores, maximum 64 characters).

Response conversion maps field names between the two API formats -- `stop_reason` to `finish_reason`, `input_tokens` to `prompt_tokens`, `tool_use` blocks to `tool_calls` arrays -- preserving the semantic content while transforming the structural representation.

## Workflow Integration

The **/chatgpt-convert** command enables several cross-provider workflow patterns. In the **prompt portability workflow**, prompts developed and tested with one provider can be deployed to another. A system prompt optimized for Claude can be converted to ChatGPT format for A/B testing, or a ChatGPT prompt library can be adapted for Claude deployment, without manual reformatting.

In the **tool schema integration workflow**, MCP tool definitions registered in the platform's tool registry are converted to OpenAI function definitions on demand, enabling ChatGPT to call the same platform tools that Claude accesses natively through MCP. This eliminates the need to maintain parallel tool definitions for different providers.

The **conversation migration workflow** enables moving conversation histories between providers. When a consultation started in ChatGPT needs to continue in Claude (or vice versa), the conversation converter translates the message history while preserving the semantic content of each turn.

Bulk conversion is supported through file input/output, enabling batch processing of prompt libraries, tool schema collections, or conversation archives through shell scripting.

## Integration Points

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `chatgpt-prompt-engineer` agent |
| [/chatgpt-bridge](/commands/chatgpt-bridge/) | Converted prompts and tools used in bridge operations |
| [/chatgpt-analyze](/commands/chatgpt-analyze/) | Analysis outputs converted for cross-model consumption |
| [/chatgpt-pack](/commands/chatgpt-pack/) | Archive content converted for target provider compatibility |
| [/llm](/commands/llm/) | Unified LLM orchestration uses converter for provider switching |
| AIAD Registry | Command specification and discovery |
| [Quality Gates](/glossary/quality-gates/) | Pre/post execution quality validation |
| [Telemetry](/glossary/telemetry/) | Conversion [metrics](/glossary/metrics/): token count changes, optimization ratios |
| MCP Tool Registry | Source of Claude-format tool schemas for conversion |
| OpenAI Function Registry | Target format for tool schema conversions |

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Conversions must be complete and accurate. No content is silently dropped during conversion. If a source feature has no equivalent in the target format, the conversion fails with an explicit `unsupported_feature` error rather than producing a degraded output. Token count changes are reported explicitly so users can assess the impact of conversion on context window utilization.
- **NO DOUBTS**: Source format auto-detection is evidence-based, using structural analysis of the input content (XML tags for Claude, JSON message arrays for ChatGPT, etc.) rather than heuristic guessing. When auto-detection confidence is below threshold, the command requests explicit `--source` specification rather than proceeding with an uncertain assumption. Verbose mode provides a complete conversion report detailing every transformation applied.
- **Regression Protection**: Conversion rules include bidirectional round-trip test suites. Converting Claude-to-ChatGPT and back must produce semantically equivalent output. Any change to conversion rules triggers mandatory round-trip validation against the reference test corpus.

## Best Practices

1. **Use auto-detection for single conversions**: The `auto` source detection works reliably for most inputs. Specify `--source` explicitly only when converting ambiguous or hybrid formats.
2. **Enable optimization for production prompts**: The `--optimize` flag (enabled by default) applies target-format-specific improvements. Disable it only when exact structural preservation is required.
3. **Use preserve-structure for round-trips**: When you need to convert content back later, use `--preserve-structure` to ensure lossless round-trip conversion at the cost of some target-format optimization.
4. **Review verbose output for complex conversions**: For tool schema and conversation conversions, use `--verbose` to review every transformation applied and verify correctness.
5. **Batch convert with shell scripting**: For prompt libraries, iterate over files with shell loops and pipe through the converter for efficient bulk processing.
6. **Test converted prompts before deployment**: Format conversion preserves semantics but may affect LLM behavior due to tokenization differences. Always test converted prompts against the target model before production use.

## Related Commands

- [/llm](/commands/llm/) - Primary LLM operation management and orchestration
- [/chatgpt-bridge](/commands/chatgpt-bridge/) - ChatGPT bridge operations for cross-LLM coordination
- [/chatgpt-analyze](/commands/chatgpt-analyze/) - Launch ChatGPT ANALYZE conversation for deep code analysis
- [/chatgpt-pack](/commands/chatgpt-pack/) - Context packing for ChatGPT collaboration and knowledge transfer
- [/chatgpt-sync](/commands/chatgpt-sync/) - Synchronize context and progress between Claude and ChatGPT
- [/local-llm](/commands/local-llm/) - Execute LLM requests using local providers with zero API cost
- [/openrouter](/commands/openrouter/) - OpenRouter LLM provider operations and management
- [/code](/commands/code/) - Core coding implementation and feature development
- [/refactor](/commands/refactor/) - Safe refactoring with zero-regression guarantee

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)