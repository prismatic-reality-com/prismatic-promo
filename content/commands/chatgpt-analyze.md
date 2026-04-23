+++
title = "/chatgpt-analyze"
weight = 1680
[extra]
category = "LLM Operations"
description = "Launch ChatGPT ANALYZE conversation for deep code analysis"
syntax = "/chatgpt-analyze [options]"
authority = "L2+"
agent = "chatgpt-analyze"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1161
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["chatgpt-analyze", "Launch", "ChatGPT", "ANALYZE", "commands", "LLM Operations", "Prismatic Platform", "Claude", "Claude Code", "Analysis"]
tags = ["commands", "llm-operations", "chatgpt-analyze", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/chatgpt-analyze - Prismatic Platform"
+++

## Overview

The **/chatgpt-analyze** command launches a specialized ChatGPT ANALYZE conversation session for deep code analysis within the Prismatic Platform. This command leverages OpenAI's GPT-4 family of models to perform comprehensive code review, pattern detection, quality metric assessment, and architectural analysis of Elixir/Phoenix/OTP codebases. By delegating analysis to a purpose-configured ChatGPT conversation with platform-specific context, the command provides a second-opinion intelligence layer that complements the platform's primary Claude-based development workflow.

Modern software platforms of significant scale -- and the Prismatic Platform with its 90 umbrella applications and 6,652 Elixir source files is firmly in this category -- benefit from multi-model analysis strategies. Different large language models exhibit different strengths in code comprehension: Claude excels at implementation and context-aware reasoning, while ChatGPT's ANALYZE mode brings particular strength in pattern recognition across large codebases and systematic metric generation. The **/chatgpt-analyze** command operationalizes this multi-model advantage by providing a structured interface for routing analysis tasks to ChatGPT with optimally prepared context, then optionally converting the results into an implementation package that Claude Code can execute directly.

The command is executed by the `chatgpt-analyze` agent within the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) framework. It supports multiple analysis modes -- from quick pre-commit checks that complete in minutes to deep architectural audits that may run for an hour or more. The output can be formatted as markdown reports, structured JSON for automation pipelines, condensed summaries for rapid review, or Claude handoff packages that bridge the gap between ChatGPT's analysis and Claude's implementation capabilities. As part of the Prismatic Platform's 216-command slash command [registry](@/glossary/registry-otp.md), it integrates with the broader LLM Operations command family including [/chatgpt-bridge](@/commands/chatgpt-bridge.md), [/chatgpt-convert](@/commands/chatgpt-convert.md), and the unified [/llm](@/commands/llm.md) orchestrator.

## Usage

```bash
/chatgpt-analyze [file_path] [--mode <analysis_mode>] [--focus <areas>] [--output <format>]
```

### Basic Analysis

```bash
# Open interactive ANALYZE conversation for the current context
/chatgpt-analyze

# Analyze a specific file
/chatgpt-analyze apps/prismatic/lib/prismatic/llm/client.ex

# Analyze an entire application directory
/chatgpt-analyze apps/prismatic_web/
```

### Analysis Modes

```bash
# Quick pre-commit check for critical issues
/chatgpt-analyze --mode quick lib/my_module.ex

# Standard analysis with full metrics and recommendations
/chatgpt-analyze --mode standard apps/prismatic_agents/

# Deep architectural audit with line-by-line review
/chatgpt-analyze --mode deep apps/prismatic_web/
```

### Focused Analysis

```bash
# Focus on pattern detection and security concerns
/chatgpt-analyze --focus patterns,security lib/auth/

# Architecture-focused analysis
/chatgpt-analyze --focus architecture apps/prismatic_storage_core/

# Metrics-only analysis for quality dashboards
/chatgpt-analyze --focus metrics --output json apps/prismatic/
```

### Claude Handoff Workflow

```bash
# Generate implementation package for Claude Code
/chatgpt-analyze --output claude_handoff lib/my_module.ex
# Then in Claude: "Implement the fixes from handoff.md"
```

## Options and Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `file_path` | string | No | Current context | File or directory path to analyze |
| `--mode` | enum | No | `standard` | Analysis depth: `quick` (5-10 min), `standard` (15-30 min), `deep` (45-60 min) |
| `--focus` | array | No | All areas | Comma-separated focus areas: `patterns`, `metrics`, `architecture`, `security` |
| `--output` | enum | No | `markdown` | Output format: `markdown`, `json`, `summary`, `claude_handoff` |

## Authority and Access

| Property | Value |
|----------|-------|
| **Authority Level** | L2+ |
| **Executing Agent** | `chatgpt-analyze` |
| **Agent Classification** | L2 Analysis Specialist |
| **Status** | Production |
| **Usage Frequency** | Low |
| **Category** | LLM Operations |
| **Domain** | Code Analysis / Multi-Model Intelligence |
| **AIAD Version** | 1.0.0 |
| **Conversation Type** | ANALYZE (purpose-configured ChatGPT session) |

## Technical Implementation

The **/chatgpt-analyze** command orchestrates a multi-phase analysis pipeline: context preparation, ChatGPT session management, analysis execution, and output formatting. The `chatgpt-analyze` agent manages the lifecycle of the ANALYZE conversation, including context window optimization to maximize the analytical value within ChatGPT's token limits.

```elixir
defmodule Prismatic.LLM.ChatGPT.Analyze do
  @moduledoc """
  ChatGPT ANALYZE conversation manager for deep code analysis.
  Prepares context, manages analysis sessions, and formats output.
  """

  @modes %{
    quick: %{duration: {5, 10}, focus: [:critical_issues, :anti_patterns]},
    standard: %{duration: {15, 30}, focus: [:structure, :metrics, :patterns, :recommendations]},
    deep: %{duration: {45, 60}, focus: [:line_by_line, :architecture, :refactoring_roadmap]}
  }

  @spec analyze(keyword()) :: {:ok, AnalysisResult.t()} | {:error, term()}
  def analyze(opts \\ []) do
    mode = Keyword.get(opts, :mode, :standard)
    file_path = Keyword.get(opts, :file_path)
    focus = Keyword.get(opts, :focus, [:all])
    output_format = Keyword.get(opts, :output, :markdown)

    with {:ok, context} <- prepare_context(file_path, mode),
         {:ok, session} <- start_analyze_session(context, mode, focus),
         {:ok, results} <- execute_analysis(session),
         {:ok, formatted} <- format_output(results, output_format) do
      {:ok, formatted}
    end
  end

  defp prepare_context(file_path, mode) do
    files = resolve_target_files(file_path)
    platform_context = load_platform_metadata()

    context =
      files
      |> Enum.map(&read_with_metadata/1)
      |> optimize_for_token_limit(mode)
      |> merge_platform_context(platform_context)

    {:ok, context}
  end

  defp start_analyze_session(context, mode, focus) do
    system_prompt = build_analyze_prompt(mode, focus)

    Prismatic.LLM.ChatGPT.Bridge.create_session(%{
      conversation: :analyze,
      system: system_prompt,
      context: context,
      model: select_model(mode)
    })
  end
end
```

The context preparation phase is critical to analysis quality. The engine reads target files along with their metadata (module attributes, typespecs, test coverage data, Credo findings), then optimizes the context package to fit within the selected model's context window. For `quick` mode, only the target files and essential platform metadata are included. For `deep` mode, the context expands to include dependent modules, supervision tree structure, and historical change data from git.

The model selection strategy defaults to `gpt-4o` for standard and deep analyses (prioritizing reasoning quality) and `gpt-4o-mini` for quick checks (prioritizing response speed). The Claude handoff output format structures analysis findings as an implementation specification that Claude Code can parse and execute, bridging the analysis-to-implementation gap between the two LLM providers.

## Workflow Integration

The **/chatgpt-analyze** command fits into several development workflow patterns. In the **pre-commit review workflow**, developers run a `quick` analysis on modified files before committing to catch anti-patterns and critical issues that might not be flagged by static analysis tools like Credo or Dialyzer. This provides a natural language review perspective that complements rule-based linting.

In the **architectural review workflow**, team leads use `deep` mode analysis on entire application directories to generate comprehensive architectural assessments. The resulting reports identify structural issues, coupling problems, and refactoring opportunities that would require significant manual effort to discover through code reading alone.

The **cross-model collaboration workflow** leverages the Claude handoff output format. ChatGPT analyzes a module and generates a structured findings report, which is then fed to Claude Code for implementation. This two-model pipeline combines ChatGPT's analytical breadth with Claude's implementation precision, resulting in higher-quality code improvements than either model achieves alone.

The command can also integrate with [quality gates](@/glossary/quality-gates.md) by outputting analysis results in JSON format for automated quality dashboards and CI/CD pipeline integration.

## Integration Points

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Executed by `chatgpt-analyze` agent |
| [/chatgpt-bridge](@/commands/chatgpt-bridge.md) | Underlying ChatGPT API communication |
| [/chatgpt-convert](@/commands/chatgpt-convert.md) | Format conversion for cross-model outputs |
| [/chatgpt-pack](@/commands/chatgpt-pack.md) | Context archive preparation for analysis sessions |
| [/llm](@/commands/llm.md) | Unified LLM operation management |
| AIAD Registry | Command specification and discovery |
| [Quality Gates](@/glossary/quality-gates.md) | Analysis results feed quality validation |
| [Telemetry](@/glossary/telemetry.md) | Command execution [metrics](@/glossary/metrics.md) and event tracking |
| ChatGPT ANALYZE Conversation | Purpose-configured analysis session template |
| Claude Code | Handoff output enables implementation of analysis findings |

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Analysis sessions must complete with actionable findings or explicit declarations of what could not be analyzed and why. No vague recommendations, no unsubstantiated claims about code quality. Every finding includes specific file paths, line numbers, and concrete improvement suggestions. Token limit constraints are handled by explicit context truncation reporting rather than silent omission of files.
- **NO DOUBTS**: Analysis findings are evidence-based. Pattern detections include specific code examples. Metric assessments include the measurement methodology. Architectural recommendations include rationale grounded in established software engineering principles. The [NABLA Infinity](@/glossary/nabla-infinity.md) framework applies to analysis confidence -- when ChatGPT's analysis contradicts Credo or Dialyzer findings, both perspectives are preserved rather than one being silently discarded.
- **Regression Protection**: Analysis session configurations (system prompts, context preparation logic, output formatters) are version-controlled and include test suites that validate output structure against reference analyses.

## Best Practices

1. **Start with standard mode**: The `standard` analysis mode provides the best balance of thoroughness and speed for most use cases. Reserve `quick` for pre-commit checks and `deep` for quarterly architectural reviews.
2. **Use focused analysis for targeted reviews**: When you know the concern area (security, performance, patterns), use `--focus` to direct analytical attention and produce more relevant findings.
3. **Leverage the Claude handoff pipeline**: For maximum implementation velocity, generate analysis in `claude_handoff` format and feed it directly to Claude Code for automated fix implementation.
4. **Combine with static analysis**: Use `/chatgpt-analyze` alongside Credo and Dialyzer, not as a replacement. LLM-based analysis catches semantic and architectural issues that rule-based tools miss, while static tools catch issues that LLMs may overlook.
5. **Analyze at the right granularity**: Single files for detailed review, directories for structural analysis, entire apps for architectural assessment. The analysis quality scales with appropriate scope selection.
6. **Review JSON output for automation**: When integrating analysis into CI/CD pipelines, use `--output json` for structured findings that can be parsed by automated quality gates.

## Related Commands

- [/llm](@/commands/llm.md) - Primary LLM operation management and orchestration
- [/chatgpt-bridge](@/commands/chatgpt-bridge.md) - ChatGPT bridge operations for cross-LLM coordination
- [/chatgpt-convert](@/commands/chatgpt-convert.md) - Convert content between LLM-specific formats and prompts
- [/chatgpt-pack](@/commands/chatgpt-pack.md) - Context packing for ChatGPT collaboration and knowledge transfer
- [/local-llm](@/commands/local-llm.md) - Execute LLM requests using local providers with zero API cost
- [/openrouter](@/commands/openrouter.md) - OpenRouter LLM provider operations and management
- [/code](@/commands/code.md) - Core coding implementation and feature development
- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)
- [/refactor](@/commands/refactor.md) - Safe refactoring with zero-regression guarantee

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)