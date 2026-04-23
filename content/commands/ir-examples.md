+++
title = "/ir-examples"
weight = 1850
[extra]
category = "PVM"
description = "Interactive examples, templates and learning resources for IR workflows"
syntax = "/ir-examples [options]"
authority = "L2+"
agent = "ir-generator"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1275
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ir-examples", "Interactive", "commands", "PVM", "Prismatic Platform", "Description"]
tags = ["commands", "pvm", "ir-examples", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/ir-examples - Prismatic Platform"
+++

## Overview

**/ir-examples** is a production command in the **[PVM](@/glossary/pvm.md)** category of the Prismatic Platform that provides interactive examples, ready-to-use templates, and structured learning resources for Intermediate Representation (IR) workflows. This command serves as the primary onboarding tool for developers and agents who need to understand IR syntax, semantics, and best practices before building production workflows.

The Prismatic IR layer is the bridge between high-level intent expressed in natural language or structured specifications and the low-level [PVM](@/glossary/pvm.md) bytecode that executes within the platform's agent runtime. Understanding IR is fundamental to building efficient, correct, and maintainable agent workflows. The `/ir-examples` command addresses the learning curve by providing categorized examples that progress from basic constructs to advanced patterns including DAG composition, conditional branching, parallel execution, and error recovery.

This command operates under the **L2+** authority level and is executed by the `ir-generator` agent, which possesses comprehensive knowledge of IR syntax, semantics, and idiomatic patterns. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The generator agent curates examples from the platform's production workflows, ensuring that all examples reflect real-world usage patterns rather than synthetic toy scenarios.

Beyond static code samples, the command supports an interactive mode where users can modify example parameters, observe the effects on IR structure and validation, and experiment with alternative approaches. This interactive learning environment is backed by the same validation engine used in production, so learners receive immediate feedback on correctness and quality.

## Architecture

The example delivery system is structured around a content repository with indexed access and interactive execution capabilities.

```
+---------------------+     +-------------------+     +---------------------+
|  Example Repository | --> | Category Indexer  | --> | Interactive Runner  |
| (Versioned Content) |     | (Tag + Difficulty)|     | (Live IR Execution) |
+---------------------+     +-------------------+     +---------------------+
         |                          |                           |
         v                          v                           v
+---------------------+     +-------------------+     +---------------------+
| Template Engine     |     | Search Engine     |     | Validation Feedback |
| (Parameterized IR)  |     | (Full-Text + Tags)|     | (Real-Time Checks)  |
+---------------------+     +-------------------+     +---------------------+
```

The **Example Repository** stores versioned IR examples organized by category, difficulty level, and applicable patterns. The **Category Indexer** maintains a searchable index with tags for quick discovery. The **Template Engine** supports parameterized examples where users can substitute values to generate customized IR workflows. The **Interactive Runner** executes examples in a sandboxed environment with real-time validation feedback.

## Usage

### Browsing Examples

```bash
# List all available example categories
/ir-examples --list

# Show examples in a specific category
/ir-examples --category basics

# Show examples filtered by difficulty level
/ir-examples --difficulty beginner

# Search examples by keyword
/ir-examples --search "parallel execution"
```

### Viewing and Running Examples

```bash
# Display a specific example with full documentation
/ir-examples --show data-pipeline-basic

# Run an example in the interactive sandbox
/ir-examples --run data-pipeline-basic

# Run with modified parameters
/ir-examples --run data-pipeline-basic --param source=api --param format=json

# Show example with validation annotations
/ir-examples --show dag-composition --annotate
```

### Template Generation

```bash
# Generate a new IR workflow from a template
/ir-examples --template etl-pipeline --output my_pipeline.ir

# List available templates
/ir-examples --templates

# Generate with custom parameters
/ir-examples --template agent-workflow --param agents=3 --param retry=true --output agent_flow.ir

# Generate and immediately validate
/ir-examples --template etl-pipeline --output my_pipeline.ir --validate
```

### Learning Paths

```bash
# Start the beginner learning path
/ir-examples --learning-path beginner

# Continue from a specific lesson
/ir-examples --learning-path intermediate --lesson 5

# Show learning path progress
/ir-examples --learning-path --progress
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--list` | boolean | false | List all example categories with counts |
| `--category` | string | all | Filter by category: `basics`, `dag`, `parallel`, `error-handling`, `optimization`, `advanced` |
| `--difficulty` | string | all | Filter by difficulty: `beginner`, `intermediate`, `advanced`, `expert` |
| `--search` | string | - | Full-text search across example names, descriptions, and content |
| `--show` | string | - | Display a specific example by name with documentation |
| `--run` | string | - | Execute an example in the interactive sandbox |
| `--param` | key=value | - | Parameter substitution for templates and parameterized examples |
| `--template` | string | - | Generate IR from a named template |
| `--templates` | boolean | false | List all available templates |
| `--output` | string | stdout | Output file for generated templates |
| `--validate` | boolean | false | Validate generated output immediately |
| `--annotate` | boolean | false | Show validation and type annotations on examples |
| `--learning-path` | string | - | Start or continue a structured learning path |
| `--lesson` | integer | 1 | Starting lesson number within a learning path |
| `--progress` | boolean | false | Show learning path completion progress |
| `--format` | string | colored | Output format: `colored`, `plain`, `markdown`, `json` |
| `--verbose` | boolean | false | Include detailed explanations with each example |

## Execution Flow

1. **Command Parsing**: The command parser validates all provided options and resolves any conflicts between mutually exclusive flags (e.g., `--list` and `--run` cannot be combined).

2. **Repository Loading**: The example repository is loaded from the platform's bundled content. If a project-local `.ir-examples/` directory exists, custom examples are merged into the repository with project-local examples taking precedence.

3. **Index Consultation**: The category indexer is queried with the specified filters (category, difficulty, search terms) to produce a filtered set of matching examples.

4. **Content Resolution**: For `--show` and `--run` operations, the specific example content is resolved from the repository. Template parameters are substituted if `--param` options are provided.

5. **Interactive Execution** (for `--run`): The example is executed in a sandboxed IR environment. The sandbox provides full IR parsing, validation, and type-checking capabilities but prevents side effects. Execution results including timing, validation status, and generated PVM bytecode statistics are displayed.

6. **Template Generation** (for `--template`): The template engine processes the selected template with provided parameters, generating a complete IR workflow file. If `--validate` is specified, the generated file is passed through [/ir-validate](@/commands/ir-validate.md) before writing.

7. **Output Rendering**: Results are formatted according to the `--format` option and written to the specified output destination.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Execution | Executed by the `ir-generator` agent |
| [IR Validator](@/commands/ir-validate.md) | Validation | Real-time validation of examples and generated templates |
| [IR Linter](@/commands/ir-lint.md) | Quality | Linting annotations shown in `--annotate` mode |
| PVM Compiler | Compilation | Examples can be compiled to PVM bytecode for inspection |
| [Quality Gates](@/glossary/quality-gates.md) | Enforcement | Generated templates must pass quality gates |
| [Telemetry](@/glossary/telemetry.md) | Observability | Example usage tracked for popularity and learning analytics |
| [AIAD Registry](@/glossary/aiad.md) | Discovery | Command registered via AIAD standard |

## Example Categories

| Category | Count | Description | Difficulty Range |
|----------|-------|-------------|-----------------|
| **basics** | 12 | IR syntax fundamentals, node declarations, edge definitions | Beginner |
| **dag** | 8 | DAG composition patterns, topological ordering, dependency management | Beginner - Intermediate |
| **parallel** | 6 | Parallel execution, fan-out/fan-in, work distribution | Intermediate |
| **error-handling** | 7 | Error recovery, retry strategies, circuit breakers in IR | Intermediate - Advanced |
| **optimization** | 5 | IR optimization hints, node fusion, dead code elimination | Advanced |
| **advanced** | 9 | Meta-programming in IR, dynamic workflow generation, conditional compilation | Expert |
| **templates** | 15 | Production-ready parameterized templates for common patterns | All levels |

## Best Practices

**Start with the beginner learning path** before attempting to build production IR workflows. The learning path is structured to introduce concepts incrementally, and each lesson builds on previous ones. Skipping lessons often leads to misunderstanding of foundational concepts that manifest as subtle bugs in complex workflows.

**Use templates for production workflows.** Rather than writing IR from scratch, start with the closest matching template and customize it. Templates encode best practices, error handling patterns, and optimization hints that are easy to miss when writing from scratch.

**Annotate examples when studying them.** The `--annotate` flag adds validation status, type information, and quality scores to each node and edge in the example, providing deeper insight into why the IR is structured the way it is.

**Create project-local examples** for patterns specific to your domain. Place them in a `.ir-examples/` directory at your project root to make them discoverable alongside platform examples.

**Validate generated templates immediately.** Always use the `--validate` flag when generating from templates to catch parameter substitution errors before they propagate into downstream pipeline stages.

## Error Handling

| Error Condition | Response | Recovery |
|----------------|----------|----------|
| Example not found | Suggests similar example names | Use `--search` to find the correct name |
| Invalid template parameter | Lists valid parameters with types | Correct parameter name or value |
| Template generation failure | Shows template with error markers | Fix parameter conflicts |
| Validation failure on generated output | Displays validation errors with line numbers | Edit generated file or adjust parameters |
| Repository corrupted | Falls back to bundled defaults | Reinstall platform or clear cache |

## Advanced Usage

### Custom Example Repository

```bash
# Initialize a project-local example repository
/ir-examples --init-local

# Add a custom example to the local repository
/ir-examples --add my-pattern --file my_pattern.ir --category custom --difficulty intermediate

# Export examples as a shareable package
/ir-examples --export --category custom --output custom-examples.tar.gz
```

### Batch Template Generation

```bash
# Generate multiple workflows from a parameter matrix
/ir-examples --template etl-pipeline --param-file matrix.json --output-dir generated/

# Generate with all parameter combinations
/ir-examples --template agent-workflow --param agents=1,2,4,8 --param retry=true,false --output-dir sweep/
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. All examples in the repository are validated against the current IR specification at build time. Examples that fail validation are automatically quarantined and excluded from user-facing results. Generated templates must pass all quality gates before being written to disk.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Each example includes provenance information indicating its source (production extraction, manual authoring, or template generation), its validation history, and its compatibility with the current IR specification version.

The example repository adheres to the [NABLA Infinity](@/glossary/nabla-infinity.md) framework by maintaining multiple independent examples for each concept (Signal Plurality), timestamping all examples with their creation and last-validation dates (Time Decay), and tracing each example to its source workflow or design decision (Provenance Mandatory).

## Related Commands

- [/ir-generate](@/commands/ir-generate.md) - Generate IR workflows from natural language descriptions
- [/ir-validate](@/commands/ir-validate.md) - Comprehensive validation of IR workflows with DAG analysis and type safety
- [/ir-lint](@/commands/ir-lint.md) - Static analysis and code quality enforcement for IR workflows
- [/ir-benchmark](@/commands/ir-benchmark.md) - Comprehensive performance benchmarking with Benchee integration for IR workflows
- [/pvm-compile](@/commands/pvm-compile.md) - Compile validated IR to optimized PVM bytecode
- [/pvm-execute](@/commands/pvm-execute.md) - Execute compiled PVM programs with [fault tolerance](@/glossary/fault-tolerance.md) and [real-time monitoring](@/capabilities/real-time-monitoring.md)
- [/pvm-trace](@/commands/pvm-trace.md) - Real-time execution tracing and debugging for PVM programs
- [/doc](@/commands/doc.md) - Technical documentation and API reference generation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)