+++
title = "/garden-extract"
weight = 1320
[extra]
category = "Infrastructure"
description = "Extract and integrate patterns from GARDEN repositories"
syntax = "/garden-extract [options]"
authority = "L2+"
agent = "garden-cultivator"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1236
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["garden-extract", "Extract", "GARDEN", "commands", "Infrastructure", "Prismatic Platform", "Elixir"]
tags = ["commands", "infrastructure", "garden-extract", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/garden-extract - Prismatic Platform"
+++

## Overview

**/garden-extract** is a production command in the **Infrastructure** category of the Prismatic Platform that extracts reusable patterns, components, and knowledge from [GARDEN](@/glossary/garden.md) (Growing Archive of Reusable Development and Engineering Nuggets) repositories and integrates them into the active platform codebase. While [/garden-explore](@/commands/garden-explore.md) discovers what exists in the GARDEN ecosystem, `/garden-extract` performs the actual knowledge transfer -- transforming historical implementations into production-ready components that conform to current platform standards.

The command operates under the **L2+** authority level and is executed by the `garden-cultivator` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The garden-cultivator agent manages the complex process of adapting code from diverse technology stacks and coding conventions into the platform's standardized Elixir/OTP architecture, ensuring that extracted components meet all quality gates and doctrine requirements.

The GARDEN ecosystem contains 116 repositories with over 3,050 files spanning 20+ years of engineering practice. Much of this knowledge exists in older technology stacks (Python, JavaScript, Ruby) or in Elixir code that predates the platform's current quality standards. The `/garden-extract` command handles the translation layer, converting patterns into idiomatic Elixir that passes compilation with zero warnings, Credo strict mode, Dialyzer analysis, and the full battery of quality gates.

Extraction is not mere copying. The command performs pattern analysis to identify the essential algorithm or architectural concept, strips away implementation-specific details tied to the source technology, and generates a new implementation that leverages Elixir/OTP idioms such as GenServer state management, supervision trees, and the `{:ok, result} | {:error, reason}` return pattern. This ensures that extracted knowledge genuinely improves the platform rather than introducing technical debt from legacy codebases.

## Architecture

The extraction pipeline operates as a multi-stage transformation process.

```
Source Repo --> Pattern Analyzer --> Transformer --> Generator --> Quality Gate --> Integration
     |               |                   |              |              |              |
  Raw Code      Essential         Technology       Elixir/OTP    Compilation     Target App
  (any lang)    Pattern ID        Translation      Code Gen      + Credo + Tests  Placement
```

### Pipeline Stages

| Stage | Component | Responsibility |
|-------|-----------|---------------|
| **Analysis** | `Garden.PatternAnalyzer` | Identifies the essential pattern, separating algorithm from implementation details |
| **Translation** | `Garden.Transformer` | Converts technology-specific constructs to Elixir/OTP equivalents |
| **Generation** | `Garden.CodeGenerator` | Produces idiomatic Elixir modules with typespecs, docs, and tests |
| **Validation** | `Garden.QualityValidator` | Runs quality gates on generated code before integration |
| **Integration** | `Garden.Integrator` | Places generated code in the target application with proper module naming |

### Supported Source Technologies

| Technology | Pattern Types | Translation Complexity |
|-----------|--------------|----------------------|
| **Elixir** | Direct port, GenServer patterns, Phoenix patterns | Low (same ecosystem) |
| **Python** | Data pipelines, ML patterns, OSINT providers | Medium (paradigm shift) |
| **JavaScript** | Async patterns, API clients, event handlers | Medium (async model differs) |
| **Rust** | Performance patterns, systems patterns | High (ownership model) |
| **Go** | Concurrency patterns, service patterns | Medium (goroutines to processes) |
| **Ruby** | OOP patterns, DSL patterns, Rails patterns | Medium (OOP to FP) |

## Usage

### Basic Usage

```bash
# Extract a specific pattern from a repository
/garden-extract sig --pattern osint-provider

# Extract and place in a specific target application
/garden-extract sig --pattern osint-provider --target apps/prismatic_agents/

# Extract all patterns from a repository
/garden-extract kuzu-ex --all

# Dry-run extraction to preview what would be generated
/garden-extract prismatic-legacy --pattern blackboard --dry-run
```

### Selective Extraction

```bash
# Extract only the core algorithm, skip tests and docs
/garden-extract sig --pattern provider-registry --components core

# Extract with full test suite generation
/garden-extract sig --pattern provider-registry --components core,tests,docs

# Extract and adapt to a specific module namespace
/garden-extract crisstal --pattern event-pipeline --namespace PrismaticAgents.Events
```

### Cross-Language Extraction

```bash
# Extract a Python OSINT provider and convert to Elixir
/garden-extract sig --pattern shodan-provider --source-lang python --target apps/prismatic_agents/

# Extract a Go service pattern and convert to GenServer
/garden-extract comtesse --pattern worker-pool --source-lang rust --target apps/prismatic/
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `REPO` | string | required | Source GARDEN repository name |
| `--pattern` | string | none | Specific pattern name to extract |
| `--all` | boolean | false | Extract all patterns from the repository |
| `--target` | string | auto | Target application directory for placement |
| `--namespace` | string | auto | Elixir module namespace for generated code |
| `--components` | string | all | Components to extract: core, tests, docs, config |
| `--source-lang` | string | auto | Source language hint for cross-language extraction |
| `--dry-run` | boolean | false | Preview extraction without writing files |
| `--force` | boolean | false | Overwrite existing files at the target location |
| `--format` | string | elixir | Output format: elixir, markdown (for documentation extraction) |
| `--quality-level` | string | strict | Quality gate level: strict, standard, relaxed |
| `--verbose` | boolean | false | Show detailed extraction steps and transformations |

## Execution Flow

1. **Source Resolution**: Locate the source repository in the GARDEN submodule directory (`garden/REPO_NAME/`). Verify the submodule is initialized and contains the expected files.

2. **Pattern Identification**: If `--pattern` is specified, locate the pattern definition in the repository's pattern index. If `--all` is specified, enumerate all extractable patterns.

3. **Source Analysis**: The PatternAnalyzer examines the source code to identify the essential pattern -- the core algorithm, data structures, and architectural decisions that constitute reusable knowledge. Implementation-specific details (database drivers, HTTP clients, framework bindings) are separated from the essential pattern.

4. **Translation Planning**: Based on the source language and target Elixir environment, the Transformer creates a translation plan that maps source constructs to Elixir/OTP equivalents. For example, Python classes become Elixir modules, async/await becomes Task/GenServer, and mutable state becomes GenServer state.

5. **Code Generation**: The CodeGenerator produces Elixir modules following platform conventions: proper module documentation with `@moduledoc`, function documentation with `@doc`, type specifications with `@spec`, and the `{:ok, result} | {:error, reason}` return pattern.

6. **Test Generation**: Companion test modules are generated with property-based tests (using StreamData) and example-based tests that verify the extracted pattern behaves correctly.

7. **Quality Validation**: Generated code is validated against the platform's quality gates: zero compilation warnings, Credo strict compliance, Dialyzer success, and typespec coverage.

8. **Integration**: Validated code is placed in the target application directory with proper file naming and module structure. Existing files are never overwritten unless `--force` is specified.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Execution | Invoked by `garden-cultivator` agent |
| [GARDEN Ecosystem](@/glossary/garden.md) | Source | Reads from 116 GARDEN repositories |
| [/garden-explore](@/commands/garden-explore.md) | Workflow | Exploration typically precedes extraction |
| [/garden-search](@/commands/garden-search.md) | Discovery | Search results identify extraction targets |
| [/garden-sync](@/commands/garden-sync.md) | Prerequisite | Sync ensures source repositories are current |
| [Quality Gates](@/glossary/quality-gates.md) | Validation | Extracted code must pass all quality gates |
| [Credo](@/glossary/credo.md) | Static Analysis | Generated code checked for Credo compliance |
| [Telemetry](@/glossary/telemetry.md) | Metrics | Extraction events and success rates tracked |

## Best Practices

**Always explore before extracting.** Use [/garden-explore](@/commands/garden-explore.md) to understand what a pattern contains and which repositories implement it before running extraction. Blind extraction may pull in inappropriate patterns or miss better alternatives.

**Use dry-run for complex extractions.** Cross-language extractions and large pattern sets benefit from `--dry-run` to preview the generated code before it is written to disk. This prevents quality issues from reaching the codebase.

**Specify a target namespace.** The auto-generated namespace may not match the platform's module organization conventions. Use `--namespace` to place extracted code in the correct module hierarchy.

**Extract incrementally.** For repositories with many patterns, extract one pattern at a time and verify its integration before proceeding to the next. This makes it easier to identify and resolve integration issues.

**Review generated tests carefully.** While the CodeGenerator produces functional tests, the generated tests may not cover all edge cases specific to the platform's usage context. Supplement generated tests with domain-specific assertions.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `{:error, :repo_not_found}` | Source repository does not exist in GARDEN | Verify repository name; run [/garden-explore](@/commands/garden-explore.md) to list available repos |
| `{:error, :pattern_not_found}` | Specified pattern does not exist in the repository | Check pattern name; use `--verbose` to see available patterns |
| `{:error, :translation_failed}` | Cross-language translation encountered unsupported constructs | Use `--source-lang` to hint the correct language; some patterns require manual adaptation |
| `{:error, :quality_gate_failed}` | Generated code did not pass quality validation | Use `--quality-level relaxed` for initial extraction, then fix violations manually |
| `{:error, :target_exists}` | Target file already exists and `--force` is not specified | Use `--force` to overwrite or specify a different `--namespace` |
| `{:error, :submodule_missing}` | GARDEN submodule is not initialized | Run `git submodule update --init garden/REPO_NAME` |

## Advanced Usage

### Batch Extraction with Quality Pipeline

```bash
# Extract all OSINT providers from sig repository
/garden-extract sig --pattern "osint-*" --target apps/prismatic_agents/lib/providers/

# Extract and immediately verify integration
/garden-extract sig --pattern shodan-provider --target apps/prismatic_agents/ && \
  mix compile --warnings-as-errors && \
  mix credo --strict && \
  mix test apps/prismatic_agents/test/
```

### Pattern Composition

Combine multiple extracted patterns to build higher-level components:

```bash
# Extract the base provider pattern
/garden-extract sig --pattern base-provider --namespace PrismaticAgents.Providers.Base

# Extract specific provider implementations
/garden-extract sig --pattern shodan-provider --namespace PrismaticAgents.Providers.Shodan
/garden-extract sig --pattern censys-provider --namespace PrismaticAgents.Providers.Censys

# Extract the registry pattern that ties them together
/garden-extract sig --pattern provider-registry --namespace PrismaticAgents.Providers.Registry
```

### Documentation Extraction

Extract documentation and knowledge without code:

```bash
# Extract architectural documentation from a repository
/garden-extract prismatic-legacy --pattern blackboard --format markdown --target docs/architecture/

# Extract pattern descriptions for the promo site
/garden-extract sig --all --format markdown --components docs --target sites/promo/content/
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Extracted code must pass all quality gates before integration. No stubs, no TODOs, no incomplete implementations.
- **NO DOUBTS**: Full investigation before action, evidence-based results. The analysis phase ensures that the essential pattern is fully understood before translation begins. Extraction never proceeds on partial understanding.

The command enforces the platform's meta-rule: if the extracted code could be written identically in Node.js, the extraction has failed. All extracted patterns must leverage Elixir/OTP idioms -- processes, supervision, pattern matching, and functional composition.

## Related Commands

- [/gardener](@/commands/gardener.md) - GARDEN legacy knowledge repository management across 116 repos
- [/garden-explore](@/commands/garden-explore.md) - Explore GARDEN repositories for patterns and knowledge
- [/garden-search](@/commands/garden-search.md) - Fast pattern search across all GARDEN reference repositories
- [/garden-sync](@/commands/garden-sync.md) - Synchronize GARDEN submodules to latest remote commits
- [/propagate-pattern](@/commands/propagate-pattern.md) - Propagate successful patterns across the ecosystem
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)