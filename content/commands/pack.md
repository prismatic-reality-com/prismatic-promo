+++
title = "/pack"
weight = 2010
[extra]
category = "Framework"
description = "Unified source archive command for AI/LLM context sharing across providers"
syntax = "/pack [options]"
authority = "L2+"
agent = "source-archive-specialist"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1244
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["pack", "Unified", "AILLM", "commands", "Framework", "Prismatic Platform", "Token", "Include"]
tags = ["commands", "framework", "pack", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/pack - Prismatic Platform"
+++

## Overview

**/pack** is a production command in the **Framework** category of the Prismatic Platform that creates unified source archives optimized for AI and LLM context sharing across multiple providers. The command aggregates source code, documentation, configuration files, and structural metadata from the platform's umbrella architecture into a single, context-rich archive that can be consumed by language models including Claude, GPT, Gemini, and locally-hosted models via Ollama.

The fundamental challenge that `/pack` addresses is the impedance mismatch between large codebases and LLM context windows. A platform with over 6,600 Elixir source files, 11,300 documentation files, and 89 umbrella applications cannot be naively loaded into a language model's context. The pack command applies intelligent selection, prioritization, and compression strategies to produce an archive that maximizes the useful information density within a given token budget. It understands the platform's dependency graph, module relationships, and file importance rankings to select the most relevant subset of files for a given task context.

This command operates under the **L2+** authority level and is executed by the `source-archive-specialist` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The source archive specialist agent is optimized for understanding codebase topology and producing archives that preserve structural context while respecting token constraints.

The pack command represents a meta-capability: it enables the platform to describe itself to AI systems in a way that maximizes the quality of AI-assisted development. By producing context-aware, token-budget-optimized archives, it transforms the interaction between developers and AI tools from "give the AI some files and hope for the best" to "provide the AI with precisely the information it needs for this specific task."

## Syntax and Usage

```bash
/pack [options]
```

The command operates without required parameters, defaulting to a full codebase archive. Options control scoping, provider targeting, and output format.

```bash
# Basic pack - full codebase archive
/pack

# Pack specific application
/pack --app=prismatic_perimeter

# Pack with token budget for Claude
/pack --provider=claude --budget=200000

# Pack for specific task context
/pack --context="security audit of perimeter module"

# Pack with file type filtering
/pack --include="*.ex,*.exs" --exclude="*_test.exs"

# Pack recent changes only
/pack --changed-since=HEAD~5

# Pack with dependency resolution
/pack --app=prismatic_web --with-deps

# Pack to specific output format
/pack --format=markdown --output=/tmp/context.md

# Pack for Ollama local model
/pack --provider=ollama --model=qwen3-coder --budget=8192
```

## Parameters and Options

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--app` | string | all | Target specific umbrella application |
| `--provider` | enum | auto | Target LLM provider: `claude`, `gpt`, `gemini`, `ollama`, `auto` |
| `--budget` | integer | provider-default | Token budget for the archive |
| `--model` | string | provider-default | Specific model within provider |
| `--context` | string | none | Task context for intelligent file selection |
| `--include` | string | `*` | Glob patterns for file inclusion |
| `--exclude` | string | `test,deps` | Glob patterns for file exclusion |
| `--changed-since` | string | none | Only include files changed since reference |
| `--with-deps` | boolean | false | Include dependency applications |
| `--format` | enum | `archive` | Output format: `archive`, `markdown`, `json`, `xml` |
| `--output` | path | stdout | Output destination |
| `--compress` | boolean | true | Enable token-aware compression |
| `--include-docs` | boolean | true | Include documentation files |
| `--include-tests` | boolean | false | Include test files |
| `--include-config` | boolean | true | Include configuration files |
| `--priority` | enum | auto | File priority strategy: `auto`, `recent`, `central`, `custom` |
| `--max-files` | integer | unlimited | Maximum number of files to include |
| `--strip-comments` | boolean | false | Remove comments to save tokens |

The `--provider` parameter selects the target LLM and configures provider-specific optimizations. Each provider has different tokenization behavior and context window sizes. The `auto` setting detects the active provider from the current session environment. The `--budget` parameter sets the maximum token count for the archive; when not specified, the provider's recommended context budget is used.

## Implementation Architecture

The pack command implements a multi-stage pipeline architecture that transforms a raw codebase into an optimized context archive.

```
Codebase (37,000+ files)
    |
    v
[Scope Resolution]
    +---> App filtering (--app)
    +---> File type filtering (--include/--exclude)
    +---> Change filtering (--changed-since)
    +---> Dependency resolution (--with-deps)
    |
    v
[Importance Ranking]
    +---> Centrality analysis (dependency graph)
    +---> Recency weighting (git history)
    +---> Context relevance (--context NLP matching)
    +---> File type priority (source > config > docs)
    |
    v
[Token Budget Allocation]
    +---> Provider tokenizer (Claude, GPT, etc.)
    +---> File-level token counting
    +---> Greedy knapsack allocation
    +---> Structural metadata reservation
    |
    v
[Archive Assembly]
    +---> File ordering (dependency-aware)
    +---> Structural annotations
    +---> Cross-reference preservation
    +---> Provider-specific formatting
    |
    v
Optimized Context Archive
```

The **Scope Resolution** phase narrows the 37,000+ file codebase to the relevant subset based on application boundaries, file types, and recency. This typically reduces the candidate set by 80-95% before any token-based selection occurs.

The **Importance Ranking** phase assigns a priority score to each candidate file using multiple signals. Centrality analysis uses the module dependency graph to identify hub modules that are imported or aliased by many other modules. Recency weighting prioritizes recently modified files that are likely relevant to current work. Context relevance uses NLP matching against the `--context` string to identify files semantically related to the task.

The **Token Budget Allocation** phase solves a variant of the knapsack problem: select the highest-priority subset of files that fits within the token budget. The algorithm reserves tokens for structural metadata (directory tree, module relationships) and then greedily allocates remaining tokens to files in priority order.

The **Archive Assembly** phase orders selected files for optimal LLM comprehension. Files are arranged in dependency order (dependencies before dependents) with structural annotations that describe the relationship between files. Cross-references are preserved as explicit comments, helping the consuming model understand how modules relate to each other.

## Examples

### Pack for Code Review

```bash
/pack --changed-since=main --include-tests --format=markdown \
  --context="code review of perimeter security rating feature" \
  --output=/tmp/review-context.md
```

Creates a review-optimized context containing all files changed on the feature branch, their dependencies, and related test files. The context description focuses the importance ranking on security-related modules.

### Pack for Architecture Analysis

```bash
/pack --priority=central --budget=150000 \
  --context="architecture analysis and dependency mapping" \
  --include="**/lib/**/*.ex" --exclude="**/test/**"
```

Selects the most architecturally central modules across the entire platform, producing a high-level structural overview within the token budget. The centrality-based priority ensures hub modules are included first.

### Pack for Local AI

```bash
/pack --app=prismatic_perimeter --provider=ollama \
  --model=qwen3-coder --budget=8192 --strip-comments
```

Creates a minimal context for fast local model inference. Comment stripping and tight budget constraints produce a dense, focused archive suitable for smaller model context windows.

### Pack for Bug Investigation

```bash
/pack --app=prismatic_web --with-deps \
  --context="LiveView dashboard rendering bug in perimeter assets" \
  --include-tests --format=markdown
```

Includes the target application and all its dependencies, with test files for understanding expected behavior. The bug-specific context description prioritizes files related to LiveView rendering and the perimeter assets feature.

## Integration with Platform

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `source-archive-specialist` | Codebase topology expertise |
| [Git Trees](/glossary/git-trees/) | File discovery | Optimized file enumeration (~100x faster) |
| AIAD Registry | Command specification | Registered in command catalog |
| [Telemetry](/glossary/telemetry/) | Execution metrics | Pack size, token counts, compression ratios |
| [Quality Gates](/glossary/quality-gates/) | Pre/post validation | Archive integrity verification |
| Ollama Integration | Local AI support | Token budget calibration for local models |
| Module Dependency Graph | Centrality analysis | File importance ranking |
| Session Lifecycle | Context preparation | Automatic context generation on session start |

## Workflow Integration

The `/pack` command integrates into several platform workflows:

1. **AI-Assisted Development**: Developers invoke `/pack` before engaging an LLM with a complex task, ensuring the model receives optimally selected context rather than random file selections.

2. **Code Review**: `/pack --changed-since=main` creates a reviewable context that includes both the changed files and their most important dependencies, enabling AI-assisted code review with full context.

3. **Architecture Exploration**: `/pack --priority=central` produces a high-level overview of the platform's structural backbone, ideal for architectural analysis sessions.

4. **Session Initialization**: Session lifecycle hooks can automatically invoke `/pack` to prepare an initial context archive when a Claude Code session begins, reducing the manual effort required to orient the model within the codebase.

5. **Documentation Generation**: By packing specific modules with their documentation and tests, the command provides complete context for generating or updating documentation.

## NABLA Compliance

The `/pack` command adheres to [NABLA](/glossary/nabla-infinity/) epistemic axioms in its archive construction:

| Axiom | Enforcement |
|-------|-------------|
| **Provenance Mandatory** | File paths, git commit hashes, and modification timestamps in archive metadata |
| **Source Independence** | Files referenced by multiple independent modules prioritized over single-consumer files |
| **Time Decay** | Recency weighting prefers recently modified files over stale files |
| **Signal Plurality** | Both source code and documentation included for multi-representation coverage |
| **Contradiction Preservation** | TODO comments, FIXME markers, and deprecation warnings preserved in output |

The archive assembly phase maintains **Signal Plurality** by including both source code and documentation for selected modules, ensuring the consuming LLM has access to multiple representations of the same concept. **Contradiction Preservation** is maintained by not suppressing unresolved tensions in the codebase.

## Performance

| Metric | Target | Typical |
|--------|--------|---------|
| Scope resolution | < 500ms | ~200ms (Git Trees) |
| Importance ranking | < 2s | ~800ms |
| Token counting | < 5s | ~2s (cached tokenizer) |
| Archive assembly | < 3s | ~1.5s |
| Total execution | < 10s | ~5s |
| Output size | Provider budget | 100K-200K tokens |
| Compression ratio | 3-5x | ~4x average |

The command leverages Git Trees for file discovery, achieving approximately 100x faster enumeration compared to filesystem scanning. Token counting uses cached tokenizer instances specific to each provider, avoiding repeated tokenizer initialization overhead.

## Related Commands

- [/seadf](/commands/seadf/) - Self-Evolving Autonomous Development Framework control and monitoring
- [/registry-sync](/commands/registry-sync/) - AIAD registry synchronization and indexing
- [/inject](/commands/inject/) - AIAD injection coordination for pattern and agent deployment
- [/analyze](/commands/analyze/) - System architecture analysis with dependency mapping
- [/pattern](/commands/pattern/) - AI pattern lookup and pattern library access
- [/integrate](/commands/integrate/) - Cross-system integration design and implementation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)