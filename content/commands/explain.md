+++
title = "/explain"
weight = 120
[extra]
category = "Development"
description = "Code explanation and architecture walkthrough"
syntax = "/explain [options]"
authority = "L2+"
agent = "code-explainer"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1174
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["explain", "Code", "commands", "Development", "Prismatic Platform", "Include"]
tags = ["commands", "development", "explain", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/explain - Prismatic Platform"
+++

## Overview

**/explain** is a production command in the **Development** category of the Prismatic Platform. It provides comprehensive code explanation and architecture walkthrough capabilities, enabling developers to rapidly understand unfamiliar modules, complex logic patterns, and architectural decisions across the platform's 2.8 million lines of code. The command transforms opaque code into clear, structured explanations with context-appropriate depth.

Understanding code in a system of this scale is a non-trivial challenge. The Prismatic Platform spans 100+ umbrella applications, 6,652 Elixir source files, and implements patterns ranging from standard OTP supervision trees to exotic meta-evolutionary algorithms. The `/explain` command provides a structured approach to code comprehension that goes beyond simple documentation lookup -- it analyzes code structure, traces dependencies, identifies patterns, and produces explanations calibrated to the requester's technical context.

The code-explainer agent powers this command, combining AST analysis, dependency graph traversal, and natural language generation to produce explanations that are both technically accurate and pedagogically effective. The agent understands Elixir idioms, OTP patterns, Phoenix conventions, and Prismatic-specific architectural patterns, enabling it to explain not just what code does but why it was structured that way.

This command operates under the **L2+** authority level, making it accessible to any operational agent or developer. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. As a read-only command that does not modify code, it carries minimal risk and is designed for frequent use.

## Architecture

The explanation system operates through a multi-phase analysis and synthesis pipeline:

```
Target Selection --> Code Parser --> Analysis Engine --> Explanation Generator
       |                 |                |                      |
  Module/Function   AST Analysis    Pattern Matcher         Natural Language
  File/Directory    Dependency Map   Complexity Eval         Structured Output
       |                 |                |                      |
  Scope Resolution  Structure Map   Design Rationale        Depth Calibration
       \                 |                /                      |
        --> Context Assembler --> Explanation Synthesizer --> Output
                    |
              Documentation Index
              (11,308 docs)
```

**Code Parser**: Parses the target code using Elixir's AST representation. Extracts function signatures, type specifications, module attributes, callback declarations, and structural patterns. For GenServer modules, it identifies the state shape, callback structure, and message protocol.

**Analysis Engine**: Performs multi-dimensional code analysis including cyclomatic complexity computation, dependency mapping (both compile-time and runtime), pattern recognition (OTP patterns, functional patterns, platform-specific patterns), and design rationale inference based on structural cues.

**Explanation Generator**: Synthesizes analysis results into human-readable explanations. The generator adapts output depth and vocabulary based on the requested explanation level -- from brief summaries for experienced developers to detailed walkthroughs for newcomers.

**Documentation Index**: Cross-references the 11,308 documentation files in the platform to enrich explanations with relevant documentation links, usage examples, and architectural context.

## Usage

### Basic Explanations

```bash
# Explain a specific module
/explain PrismaticPerimeter.SecurityRating

# Explain a specific function
/explain PrismaticStorage.Ecto.Repo.get/2

# Explain a file
/explain apps/prismatic_perimeter/lib/prismatic_perimeter/scanner.ex
```

### Architecture Walkthroughs

```bash
# Explain an entire application's architecture
/explain --app=prismatic_perimeter --architecture

# Explain the supervision tree of an application
/explain --app=prismatic_agents --supervision-tree

# Explain cross-application dependencies
/explain --deps=prismatic_storage_core --depth=2
```

### Targeted Explanations

```bash
# Explain with focus on OTP patterns
/explain PrismaticClaude.StackConversation --focus=otp

# Explain data flow through a module
/explain PrismaticPerimeter.Pipeline --focus=data-flow

# Explain error handling strategy
/explain PrismaticApi.DispatchController --focus=error-handling

# Brief summary for quick understanding
/explain PrismaticSupervisor.DependencyResolver --brief
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--app` | string | none | Target entire umbrella application |
| `--architecture` | flag | false | Provide architectural overview of the target |
| `--supervision-tree` | flag | false | Explain OTP supervision tree structure |
| `--deps` | string | none | Explain dependency relationships for a module |
| `--depth` | integer | 1 | Dependency traversal depth |
| `--focus` | string | general | Explanation focus (otp, data-flow, error-handling, performance, security) |
| `--brief` | flag | false | Produce brief summary instead of detailed explanation |
| `--verbose` | flag | false | Include implementation details and line-level analysis |
| `--format` | string | text | Output format (text, markdown, json) |
| `--include-tests` | flag | false | Include test file analysis in explanation |
| `--include-specs` | flag | false | Include type specification analysis |
| `--history` | flag | false | Include git history context for design rationale |
| `--level` | string | intermediate | Explanation depth (beginner, intermediate, expert) |

## Execution Flow

The `/explain` command follows a structured 5-phase explanation pipeline:

1. **Target Resolution**: The input target (module name, function reference, file path, or application name) is resolved to specific source files. For module names, the resolver uses the platform's module-to-file mapping. For applications, the resolver identifies all constituent modules.

2. **AST Analysis**: The target source code is parsed into AST representation. The analyzer extracts structural elements: module attributes, function definitions, type specifications, callbacks, imports, aliases, and use macros. For GenServer modules, the state shape and message protocol are identified.

3. **Pattern Recognition**: The extracted structure is matched against known patterns from the platform's 55+ pattern library. Identified patterns include supervision tree structures, GenServer state machines, pipeline compositions, behaviour implementations, and platform-specific patterns like quality gate checkers.

4. **Context Assembly**: The explanation context is assembled from multiple sources: the parsed AST, identified patterns, dependency graph position, documentation cross-references, and optionally git history for design rationale. The context is filtered based on the requested focus and depth level.

5. **Explanation Synthesis**: The assembled context is synthesized into a structured explanation. The output includes a summary, structural breakdown, pattern identification, dependency context, and design rationale. The synthesis adapts vocabulary and depth to the requested explanation level.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Execution | Code-explainer agent performs analysis |
| [Git Trees](/glossary/git-trees/) | Navigation | Codebase traversal for target resolution |
| [Quality Gates](/glossary/quality-gates/) | Context | Quality profile of explained code |
| [Telemetry](/glossary/telemetry/) | Monitoring | Explanation request [metrics](/glossary/metrics/) |
| AIAD Registry | Discovery | Command specification and agent binding |
| Documentation Index | Enrichment | 11,308 docs for cross-reference |
| [GARDEN](/glossary/garden/) | History | Legacy patterns for design rationale context |

## Best Practices

**Start with architecture before diving into code**: For unfamiliar applications, use `--architecture` first to understand the high-level structure before drilling into specific modules. This provides the context needed to understand individual design decisions.

**Use focus modes for targeted understanding**: When investigating a specific concern (performance, security, error handling), use `--focus` to filter the explanation to relevant aspects. This avoids information overload.

**Include git history for design rationale**: The `--history` flag enriches explanations with commit messages and change patterns that reveal why code was structured a particular way. This is especially valuable for code that appears unusual or counter-intuitive.

**Match explanation level to audience**: Use `--level=beginner` for onboarding new team members, `--level=intermediate` for cross-team knowledge sharing, and `--level=expert` for deep technical analysis.

**Explain supervision trees for OTP understanding**: When learning a new OTP application, `--supervision-tree` provides the most effective entry point. The supervision tree reveals the application's process architecture, fault tolerance strategy, and state management approach.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `MODULE_NOT_FOUND` | Target module does not exist in the codebase | Verify module name with tab completion or use `mix git_trees find` |
| `FILE_NOT_FOUND` | Target file path does not exist | Verify file path; use absolute paths for clarity |
| `APP_NOT_FOUND` | Target application not in umbrella | Check application name against `mix git_trees apps` |
| `AST_PARSE_ERROR` | Source file has syntax errors preventing AST analysis | Fix syntax errors before requesting explanation |
| `DEPENDENCY_RESOLUTION_TIMEOUT` | Dependency graph traversal exceeded timeout | Reduce `--depth` parameter or target a specific module |

## Advanced Usage

### Comparative Explanations

```bash
# Compare two modules' approaches
/explain --compare PrismaticStorage.ETS PrismaticStorage.Ecto --focus=api-surface

# Explain differences between two implementations
/explain --diff PrismaticPerimeter.Scanner.V1 PrismaticPerimeter.Scanner.V2
```

### Batch Explanations

```bash
# Explain all modules in a directory
/explain --batch apps/prismatic_perimeter/lib/prismatic_perimeter/compliance/ --brief

# Generate documentation draft from code explanation
/explain PrismaticApi.Scanner --format=markdown --verbose --include-specs
```

### Integration with Development Workflow

The `/explain` command integrates naturally with the development workflow. Before modifying unfamiliar code, run `/explain` to build understanding. After implementing changes, run `/explain` on the modified module to verify that the explanation matches your intent -- a discrepancy may indicate an implementation that does not clearly express its purpose.

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Explanations must be complete and accurate. No hand-waving, no glossing over complex sections, no "this is straightforward" dismissals. Every aspect of the target code receives thorough analysis.
- **NO DOUBTS**: Full investigation before explanation. The code-explainer agent traces all dependencies, identifies all patterns, and cross-references all documentation before producing an explanation. Incomplete understanding is acknowledged explicitly rather than papered over.

The `/explain` command embodies the NO DOUBTS principle by ensuring that developers have complete understanding before making changes, preventing doubt-driven modifications that introduce subtle bugs.

## Related Commands

- [/code](/commands/code/) - Core coding implementation and feature development
- [/fix](/commands/fix/) - Bug fix implementation with mandatory [regression tests](/capabilities/regression-tests/)
- [/test](/commands/test/) - Comprehensive test generation and verification
- [/analyze](/commands/analyze/) - System architecture analysis with dependency mapping
- [/refactor](/commands/refactor/) - Safe refactoring with zero-regression guarantee
- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/estimate](/commands/estimate/) - Task estimation with AI-powered complexity analysis

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)