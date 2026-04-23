+++
title = "/doc"
weight = 100
[extra]
category = "Development"
description = "Technical documentation and API reference generation"
syntax = "/doc [options]"
authority = "L2+"
agent = "documentation-specialist"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 794
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["doc", "Technical", "commands", "Development", "Prismatic Platform", "Documentation", "ExDoc", "Target"]
tags = ["commands", "development", "doc", "prismatic"]
quality_score = 70
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/doc - Prismatic Platform"
+++

## Overview

The **/doc** command generates comprehensive technical documentation automatically from code analysis, producing API references, usage examples, architecture diagrams, and integration guides. Rather than manually writing documentation that inevitably drifts from the implementation, this command analyzes the actual codebase -- module structures, function signatures, typespecs, existing documentation -- and generates or enhances documentation that reflects the code as it truly exists.

The documentation generation process uses intelligent agent discovery to assemble the right team for each target. When documenting a storage adapter, the command recruits the storage architecture expert and the [Elixir](@/glossary/elixir.md) core specialist. When documenting a LiveView component, it brings in the Phoenix LiveView specialist and the UI design expert. This domain-aware agent selection ensures that generated documentation captures not just API surfaces but also architectural context, design rationale, and usage patterns specific to each component's domain.

This command operates under the **L2+** authority level and is executed by the `documentation-specialist` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. Documentation generation is considered a development-category operation because it directly enhances the codebase by improving `@moduledoc`, `@doc`, and `@spec` annotations alongside external documentation artifacts.

The command supports four output formats: inline documentation (embedded in source files as `@moduledoc` and `@doc`), README generation (application-level markdown documentation), ExDoc output (full ExDoc documentation site generation), and integration guides (standalone guides for complex subsystems). Each format follows quality gates that ensure completeness, accuracy, and executability of all code examples.

## Architecture

### Documentation Generation Pipeline

```
USER INPUT: /doc "target"
    |
    v
PHASE 1: CODE ANALYSIS & EXPERT DISCOVERY
    +-- Identify target (app, module, component)
    +-- Parse code structure and public API
    +-- Extract existing documentation
    +-- Discover domain experts
    +-- Select documentation specialists
    |
    v
PHASE 2: API DOCUMENTATION GENERATION
    +-- Module documentation (@moduledoc)
    +-- Function documentation (@doc)
    +-- Typespecs (@spec)
    +-- Code examples (doctests)
    +-- Parameter/return descriptions
    |
    v
PHASE 3: EXAMPLE GENERATION
    +-- Usage examples
    +-- Integration examples
    +-- Common patterns
    +-- Edge cases
    +-- Best practices
    |
    v
PHASE 4: DIAGRAM CREATION
    +-- Architecture diagrams (ASCII)
    +-- Data flow diagrams (Mermaid)
    +-- Component relationships
    +-- Sequence diagrams
    +-- State machines
    |
    v
PHASE 5: INTEGRATION GUIDES
    +-- Getting started guide
    +-- Configuration guide
    +-- Integration steps
    +-- Troubleshooting
    |
    v
PHASE 6: QUALITY VALIDATION
    +-- All public functions documented
    +-- All examples executable
    +-- All links valid
    +-- Typespecs match implementation
```

### Agent Discovery Algorithm

The documentation team is assembled based on three weighted criteria:

| Criterion | Weight | Description |
|-----------|--------|-------------|
| **Domain Matching** | 40% | Match target's domain to domain experts |
| **Documentation Expertise** | 35% | Include doc quality specialists and technical writers |
| **Technology Matching** | 25% | Match implementation technology to tech specialists |

## Usage

### Application Documentation

```bash
# Generate full documentation for an application
/doc "apps/prismatic_storage_ets"

# Document the Perimeter application
/doc "apps/prismatic_perimeter"

# Document the API gateway
/doc "apps/prismatic_api"
```

### Module Documentation

```bash
# Generate inline @moduledoc for a specific module
/doc "PrismaticWeb.DashboardLive"

# Document an OSINT module
/doc "Prismatic.OSINT.Enrichment"

# Document a storage adapter
/doc "PrismaticStorageETS.Adapter"
```

### Customized Output

```bash
# Generate ExDoc format with Mermaid diagrams
/doc "apps/prismatic_web" --format=exdoc --diagrams=mermaid

# Generate 10 usage examples with comprehensive detail
/doc "PrismaticPerimeter.SecurityRating" --examples=10 --depth=comprehensive

# Generate README only
/doc "apps/prismatic_supervisor" --format=readme

# Generate all formats
/doc "apps/prismatic_agents" --format=all
```

## Options & Parameters

| Parameter | Position/Flag | Required | Type | Default | Description |
|-----------|---------------|----------|------|---------|-------------|
| **target** | $1 | Yes | string | -- | Target to document (app path, module name, or component) |
| **--format** | flag | No | enum | `all` | Output: inline, readme, exdoc, all |
| **--diagrams** | flag | No | enum | `both` | Diagram type: ascii, mermaid, both |
| **--examples** | flag | No | integer | 5 | Number of usage examples to generate |
| **--depth** | flag | No | enum | `standard` | Detail level: minimal, standard, comprehensive |

## Execution Flow

```
/doc [target] [options]
    |
    v
PHASE 1: TARGET ANALYSIS (1-2s)
    +-- Parse target path or module name
    +-- Load and analyze source code
    +-- Extract public API surface
    +-- Identify module dependencies
    +-- Count existing documentation coverage
    |
    v
PHASE 2: EXPERT ASSEMBLY (< 500ms)
    +-- Domain matching (40% weight)
    +-- Documentation expertise (35% weight)
    +-- Technology matching (25% weight)
    +-- Assemble documentation team
    |
    v
PHASE 3: DOCUMENTATION GENERATION (2-5s)
    +-- Generate @moduledoc and @doc
    +-- Create @spec annotations
    +-- Write usage examples
    +-- Build architecture diagrams
    |
    v
PHASE 4: QUALITY VALIDATION (< 1s)
    +-- Verify all public functions documented
    +-- Validate code examples compile
    +-- Check link validity
    +-- Confirm typespec accuracy
    |
    v
PHASE 5: DELIVERABLE OUTPUT
    +-- Write inline documentation to source files
    +-- Generate README.md
    +-- Create ExDoc configuration
    +-- Produce integration guides
    +-- Generate diagrams
```

### Performance

| Operation | Time |
|-----------|------|
| Code analysis | 1-2s |
| Agent discovery | < 500ms |
| Documentation generation | 2-5s |
| Diagram creation | 1-2s |
| **Total** | **4-10s** |

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Multi-agent documentation team | Domain experts + doc specialists assembled per target |
| [AIAD](@/glossary/aiad.md) Registry | Command specification | Development category |
| [Quality Gates](@/glossary/quality-gates.md) | Documentation quality validation | 4-gate quality check on generated docs |
| [Telemetry](@/glossary/telemetry.md) | Generation [metrics](@/glossary/metrics.md) | Target, format, generation time, coverage delta |
| ExDoc | Documentation site generation | Full ExDoc integration for HTML documentation |
| Source Files | Inline documentation | Direct `@moduledoc`/`@doc` injection |

### Documentation Quality Gates

```
GATE 1: COMPLETENESS
    +-- All public functions documented
    +-- All modules have @moduledoc
    +-- All functions have @doc
    +-- All functions have @spec

GATE 2: EXAMPLES
    +-- Usage examples provided
    +-- Doctests included and executable
    +-- Integration examples present
    +-- Edge cases covered

GATE 3: DIAGRAMS
    +-- Architecture diagram included
    +-- Data flow visualized
    +-- Component relationships shown

GATE 4: ACCURACY
    +-- Examples are valid and compile
    +-- Links are correct and resolvable
    +-- Typespecs match implementation
    +-- No outdated information
```

## Best Practices

1. **Specify scope precisely** -- Use specific module paths or app directories rather than broad targets. `/doc "PrismaticWeb.DashboardLive"` produces better results than `/doc "apps/prismatic_web"`.

2. **Ensure code compiles first** -- The documentation generator analyzes compiled code. Run `mix compile` before documenting to ensure the analysis reflects the current state.

3. **Use comprehensive depth for public APIs** -- Public-facing modules and APIs benefit from comprehensive documentation with many examples. Internal utility modules are well-served by standard depth.

4. **Review generated documentation** -- Always review generated documentation for accuracy. The command enhances existing docs and generates new ones, but domain-specific nuances may need human refinement.

5. **Run iteratively** -- Use `/doc` on individual modules first, then on entire applications. This allows incremental review and correction.

6. **Combine with /test** -- After generating documentation with doctests, run `/test` to verify that all generated examples are valid and executable.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `TARGET_NOT_FOUND` | Module or app path does not exist | Verify target path; check for typos |
| `COMPILATION_REQUIRED` | Target code has not been compiled | Run `mix compile` before documenting |
| `NO_PUBLIC_API` | Module has no public functions | Check module; possibly an internal-only module |
| `DOCTEST_FAILURE` | Generated example does not compile | Review and correct the generated example |
| `DIAGRAM_GENERATION_FAILED` | Cannot generate architecture diagram | Check module structure; ensure dependencies are clear |

## Advanced Usage

### Deliverable Structure

```
documentation-deliverable-{target}-{timestamp}/
+-- inline/
|   +-- module1.ex (with @moduledoc/@doc)
|   +-- module2.ex (with @moduledoc/@doc)
+-- readme/
|   +-- README.md
+-- guides/
|   +-- getting-started.md
|   +-- configuration.md
|   +-- integration.md
|   +-- troubleshooting.md
+-- diagrams/
|   +-- architecture.txt (ASCII)
|   +-- data-flow.mmd (Mermaid)
|   +-- component-relationships.mmd
+-- examples/
|   +-- basic-usage.exs
|   +-- advanced-patterns.exs
+-- DOCUMENTATION-SUMMARY.md
```

### Diagram Types

```
ASCII Architecture Diagram:
+---------------------+
|   Public API        |
+----------+----------+
           |
    +------+------+
    |   Business  |
    |    Logic    |
    +------+------+
           |
    +------+------+
    |   Storage   |
    |    Layer    |
    +-------------+
```

### Command Chaining

```bash
# Implement, then document
/code "new feature" && /doc "apps/target_app"

# Document, then test
/doc "PrismaticWeb.ApiController" && /test "test/prismatic_web/controllers/api_controller_test.exs"

# Refactor, then update docs
/refactor "simplify storage" && /doc "apps/prismatic_storage_core"
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for undocumented public APIs. Every public function must have `@doc`, `@spec`, and at least one usage example. Documentation quality gates must pass before deliverables are finalized. No generated documentation is shipped without quality validation.
- **NO DOUBTS**: Generated documentation is verified against the actual code. Typespecs are validated against implementation. Examples are tested for compilability. No claims made in documentation that are not backed by the codebase.

## Related Commands

- [/code](@/commands/code.md) - Core coding implementation and feature development
- [/test](@/commands/test.md) - Comprehensive test generation and verification
- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)
- [/refactor](@/commands/refactor.md) - Safe refactoring with zero-regression guarantee
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints
- [/quality-enforce](@/commands/quality-enforce.md) - Progressive [quality debt](@/glossary/quality-debt.md) elimination
- [/regression-check](@/commands/regression-check.md) - Execute 25 custom [Credo](@/glossary/credo.md) regression checks

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)