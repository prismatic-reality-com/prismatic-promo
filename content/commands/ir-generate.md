+++
title = "/ir-generate"
weight = 1830
[extra]
category = "PVM"
description = "Generate Information Retrieval workflows from natural language descriptions"
syntax = "/ir-generate [options]"
authority = "L2+"
agent = "ir-generator"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1322
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ir-generate", "Generate", "Information", "Retrieval", "commands", "PVM", "Prismatic Platform", "Generated", "Post"]
tags = ["commands", "pvm", "ir-generate", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/ir-generate - Prismatic Platform"
+++

## Overview

**/ir-generate** is a production command in the **[PVM](/glossary/pvm/)** category of the Prismatic Platform that transforms natural language descriptions into fully structured Intermediate Representation (IR) workflows. This command bridges the gap between human intent and machine-executable workflow specifications by leveraging the `ir-generator` agent's deep understanding of IR syntax, semantics, and optimization patterns.

The ability to generate IR from natural language descriptions is a cornerstone of the Prismatic Platform's accessibility philosophy. Rather than requiring developers to learn the complete IR specification before building workflows, `/ir-generate` allows them to describe their desired data flow, processing steps, and error handling requirements in plain English and receive a valid, optimized IR workflow as output. The generated IR is not a rough draft -- it is production-quality code that passes all validation and linting checks.

This command operates under the **L2+** authority level and is executed by the `ir-generator` agent, which combines natural language understanding capabilities with comprehensive knowledge of the IR specification, PVM execution semantics, and platform best practices. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard.

The generation process is not a simple template fill -- it involves semantic analysis of the natural language input, identification of required processing stages, construction of an optimal DAG topology, type inference for all data flows, and insertion of appropriate error handling and retry logic. The result is a complete IR workflow that would be indistinguishable from one authored by an expert IR developer.

## Architecture

The generation pipeline processes natural language input through multiple transformation stages, each adding structure and refinement.

```
+---------------------+     +-------------------+     +------------------+
| NL Parser           | --> | Intent Extractor  | --> | DAG Builder      |
| (Tokenize + Parse)  |     | (Semantic Analysis)|    | (Topology Design)|
+---------------------+     +-------------------+     +------------------+
         |                          |                          |
         v                          v                          v
+---------------------+     +-------------------+     +------------------+
| Context Resolver    |     | Type Inferencer   |     | IR Emitter       |
| (Platform Entities) |     | (Flow Analysis)   |     | (Code Generation)|
+---------------------+     +-------------------+     +------------------+
                                                               |
                                                               v
                                                      +------------------+
                                                      | Post-Processing  |
                                                      | (Validate + Lint)|
                                                      +------------------+
```

The **NL Parser** tokenizes and parses the natural language input, identifying key concepts, relationships, and constraints. The **Intent Extractor** performs semantic analysis to determine the user's intended workflow structure, including data sources, transformations, and outputs. The **DAG Builder** constructs an optimal directed acyclic graph topology based on the extracted intent, considering parallelization opportunities and dependency ordering. The **Type Inferencer** analyzes data flows through the DAG to assign types to all edges, ensuring type safety. The **IR Emitter** generates syntactically correct IR code from the enriched DAG, and the **Post-Processing** stage runs validation and linting to ensure the output meets production quality standards.

## Usage

### Basic Generation

```bash
# Generate from a natural language description
/ir-generate "Fetch data from the REST API, transform JSON to CSV, and upload to S3"

# Generate with explicit output file
/ir-generate "Process user events in parallel, aggregate by session, and store results" --output event_pipeline.ir

# Generate from a description file
/ir-generate --from-file requirements.txt
```

### Guided Generation

```bash
# Interactive guided generation with prompts
/ir-generate --interactive

# Generate with constraints
/ir-generate "Build ETL pipeline for financial data" --max-parallelism 4 --error-strategy retry

# Generate with specific node types
/ir-generate "Data validation pipeline" --prefer-nodes validator,transformer,aggregator
```

### Generation with Context

```bash
# Generate using existing workflows as style reference
/ir-generate "Similar to data_pipeline but for user analytics" --reference workflows/data_pipeline.ir

# Generate with platform entity resolution
/ir-generate "Use the OSINT investigator to analyze domain, then score with perimeter agent"

# Generate with explicit type constraints
/ir-generate "Process image batch" --input-type "list(binary)" --output-type "list(map)"
```

### Iterative Refinement

```bash
# Generate initial version
/ir-generate "Build monitoring workflow" --output monitor.ir

# Refine generated workflow with additional requirements
/ir-generate --refine monitor.ir "Add alerting when metrics exceed thresholds"

# Optimize generated workflow for performance
/ir-generate --optimize monitor.ir --target latency
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| (positional) | string | required | Natural language description of the desired workflow |
| `--output` | string | stdout | Output file path for the generated IR |
| `--from-file` | string | - | Read description from a file instead of command line |
| `--interactive` | boolean | false | Enable interactive guided generation mode |
| `--reference` | string | - | Existing IR file to use as style and pattern reference |
| `--refine` | string | - | Existing IR file to refine with additional requirements |
| `--optimize` | string | - | Existing IR file to optimize for a specific target |
| `--target` | string | balanced | Optimization target: `latency`, `throughput`, `memory`, `balanced` |
| `--max-parallelism` | integer | auto | Maximum parallel execution paths in generated DAG |
| `--error-strategy` | string | retry | Error handling strategy: `retry`, `fallback`, `abort`, `circuit-breaker` |
| `--prefer-nodes` | string | auto | Comma-separated list of preferred node types |
| `--input-type` | string | auto | Explicit input type specification |
| `--output-type` | string | auto | Explicit output type specification |
| `--validate` | boolean | true | Run validation on generated output |
| `--lint` | boolean | true | Run linting on generated output |
| `--format` | string | standard | IR output format: `standard`, `compact`, `annotated` |
| `--dry-run` | boolean | false | Show generation plan without producing output |
| `--verbose` | boolean | false | Show detailed generation process and decisions |

## Execution Flow

1. **Input Acquisition**: The natural language description is acquired from the command line, a file (`--from-file`), or through interactive prompts (`--interactive`). Multi-sentence descriptions are supported and encouraged for complex workflows.

2. **Semantic Parsing**: The NL parser breaks the description into semantic units, identifying verbs (operations), nouns (data entities), adjectives (constraints), and connectors (flow relationships). Domain-specific terminology is resolved against the platform's glossary.

3. **Intent Resolution**: The intent extractor maps semantic units to IR concepts: operations become nodes, data flows become edges, constraints become node parameters, and connectors become DAG topology decisions.

4. **Context Resolution**: Platform entities mentioned in the description (agent names, app references, data sources) are resolved against the live platform registry. Ambiguous references trigger clarification prompts in interactive mode or best-match selection in batch mode.

5. **DAG Construction**: The DAG builder constructs the workflow topology, optimizing for the specified target (latency, throughput, memory, or balanced). Parallelization opportunities are identified and exploited up to the `--max-parallelism` limit.

6. **Type Inference**: Data flow types are inferred from node input/output signatures, explicit type constraints, and contextual analysis. Type mismatches are resolved through automatic coercion insertion or reported as errors.

7. **Error Handling Insertion**: Error handling logic is inserted according to the specified `--error-strategy`, including retry policies, fallback paths, circuit breakers, and dead letter queues as appropriate.

8. **IR Emission**: The complete IR workflow is emitted in the specified format. The `annotated` format includes inline comments explaining each generation decision.

9. **Post-Processing**: If `--validate` and `--lint` are enabled (default), the generated IR is passed through [/ir-validate](/commands/ir-validate/) and [/ir-lint](/commands/ir-lint/). Any issues are reported, and in interactive mode, the user is offered the opportunity to refine.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Execution | Executed by the `ir-generator` agent |
| [IR Validator](/commands/ir-validate/) | Post-Processing | Generated IR is validated automatically |
| [IR Linter](/commands/ir-lint/) | Post-Processing | Generated IR is linted for quality |
| PVM Compiler | Downstream | Generated IR feeds into the PVM compilation pipeline |
| [AIAD Registry](/glossary/aiad/) | Entity Resolution | Platform entities referenced in descriptions are resolved |
| [Quality Gates](/glossary/quality-gates/) | Enforcement | Generated IR must pass all quality gates |
| [Telemetry](/glossary/telemetry/) | Observability | Generation events and quality metrics tracked |

## Best Practices

**Be specific in your descriptions.** The more detail you provide about data sources, transformations, error handling requirements, and output formats, the more accurate the generated IR will be. Vague descriptions produce valid but generic workflows that may require significant refinement.

**Use the `--reference` flag** when generating workflows similar to existing ones. The generator uses the reference file to match coding style, node selection patterns, and error handling conventions, producing output that is consistent with your project's existing codebase.

**Leverage iterative refinement** rather than trying to specify everything in a single description. Start with the core data flow, generate, then use `--refine` to add error handling, monitoring, and optimization in subsequent passes. This produces better results than monolithic descriptions.

**Always review generated IR before deploying to production.** While the generator produces high-quality output that passes all validation and linting checks, it cannot fully understand business-specific constraints or performance requirements that were not expressed in the natural language description.

**Use `--dry-run` for complex workflows** to preview the generation plan before committing to output. The dry-run shows the identified intent, proposed DAG topology, and type assignments without generating the full IR.

## Error Handling

| Error Condition | Response | Recovery |
|----------------|----------|----------|
| Ambiguous description | Lists possible interpretations for clarification | Refine description or use `--interactive` mode |
| Unknown platform entity | Reports unresolved references with suggestions | Correct entity name or use explicit node types |
| Type conflict in inferred flow | Shows conflicting types with source analysis | Add explicit `--input-type` or `--output-type` |
| Unsatisfiable constraints | Explains which constraints conflict | Relax constraints or restructure description |
| Validation failure on output | Shows validation errors with generation context | Refine description or manually edit output |
| Reference file not found | Exits with path suggestion | Verify reference file path |

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Generated IR must pass all validation and linting checks. The generator never produces "draft" or "skeleton" output -- every generated workflow is complete and production-ready. Incomplete generation due to ambiguity results in explicit error reporting rather than best-guess output.
- **NO DOUBTS**: Full investigation before action, evidence-based results. The generator performs full semantic analysis before emitting any IR. All generation decisions are traceable through the `--verbose` flag, and the `annotated` format includes inline justification for each decision.

## Related Commands

- [/ir-validate](/commands/ir-validate/) - Comprehensive validation of IR workflows with DAG analysis and type safety
- [/ir-lint](/commands/ir-lint/) - Static analysis and code quality enforcement for IR workflows
- [/ir-benchmark](/commands/ir-benchmark/) - Comprehensive performance benchmarking with Benchee integration for IR workflows
- [/ir-examples](/commands/ir-examples/) - Interactive examples, templates and learning resources for IR workflows
- [/pvm-compile](/commands/pvm-compile/) - Compile validated IR to optimized PVM bytecode
- [/pvm-execute](/commands/pvm-execute/) - Execute compiled PVM programs with [fault tolerance](/glossary/fault-tolerance/) and [real-time monitoring](/capabilities/real-time-monitoring/)
- [/pvm-trace](/commands/pvm-trace/) - Real-time execution tracing and debugging for PVM programs
- [/doc](/commands/doc/) - Technical documentation and API reference generation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)