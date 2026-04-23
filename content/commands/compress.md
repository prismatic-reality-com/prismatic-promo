+++
title = "/compress"
weight = 1260
[extra]
category = "Documentation"
description = "Intelligent document compression with 4-level ratios and 80%+ information retention"
syntax = "/compress [options]"
authority = "L2+"
agent = "compressor"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1026
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["compress", "Intelligent", "4-level", "commands", "Documentation", "Prismatic Platform", "Compression", "Self", "Retention"]
tags = ["commands", "documentation", "compress", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/compress - Prismatic Platform"
+++

## Overview

**/compress** is a production command in the **Documentation** category of the Prismatic Platform that provides intelligent document compression with four configurable compression levels and a guaranteed minimum of 80% information retention. Unlike mechanical text truncation, this command uses semantic analysis to identify and preserve the most information-dense portions of documents while removing redundancy, verbosity, and low-value content.

The compression system addresses a fundamental challenge in large-scale platform management: context documents, session files, and reports grow continuously, consuming storage and degrading retrieval speed. The `/compress` command reduces document sizes by ratios from 2:1 (light) to 20:1 (extreme) while preserving the essential information content, enabling efficient storage of historical context and rapid loading of session state.

This command operates under the **L2+** authority level and is executed by the `compressor` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The command features a self-referential capability -- it can compress its own specification as a demonstration of effectiveness -- and supports batch processing for compressing entire directories of documents in parallel.

Every compression operation is validated against three quality thresholds: information retention must exceed 80%, processing time must be under 500ms for typical documents, and the actual compression ratio must be within 10% of the target ratio. If any threshold is violated, the compression is rejected with detailed diagnostics.

## Architecture

The compression system uses a semantic analysis pipeline that operates on document structure rather than raw bytes.

```
Input Document
    |
    v
Structure Analyzer (sections, headers, code blocks)
    |
    v
Information Density Scorer (per section)
    |
    v
Compression Engine (level-specific strategy)
    |-- Light: Remove redundancy, keep details
    |-- Medium: Summarize sections, keep structure
    |-- Heavy: Extract key concepts, compress structure
    |-- Extreme: Core essence, maximum reduction
    |
    v
Quality Validator (retention, ratio, performance)
    |
    v
Output Document + Metrics Report
```

### Core Components

| Component | Responsibility |
|-----------|---------------|
| Structure Analyzer | Parse document into semantic sections |
| Density Scorer | Rank sections by information value |
| Compression Engine | Apply level-specific compression strategies |
| Quality Validator | Verify retention, ratio, and performance |
| Batch Processor | Parallel compression of multiple documents |

## Usage

### Basic Compression

```bash
# Compress a file with default medium level
/compress apps/prismatic/README.md

# Aggressive compression of session context
/compress .claude/session-context/2025-11-19-latest-session.md heavy

# Maximum compression for archival
/compress .claude/reports/2025-11-19-mission-complete.md extreme

# Light compression preserving details
/compress docs/architecture/STORAGE_ARCHITECTURE.md light
```

### Inline Document Compression

```bash
# Compress inline text
/compress "This is a very long technical document with extensive details about system architecture, implementation patterns, performance metrics, and deployment strategies..." extreme
```

### Batch Processing

```bash
# Compress all session contexts
/compress .claude/session-context/*.md medium --batch

# Compress knowledge base
/compress .claude/knowledge/*.md medium --batch

# Compress with custom retention
/compress README.md medium --min-retention 90
```

### Self-Referential Compression

```bash
# Compress this command's own specification (dogfooding)
/compress --self medium

# Extreme self-compression
/compress --self extreme
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `document` | string | required | File path, inline text, or `--self` |
| `level` | string | `medium` | Compression level: light, medium, heavy, extreme |
| `--batch` | boolean | false | Enable batch processing for glob patterns |
| `--min-retention` | float | 80 | Minimum information retention percentage |
| `--profile` | boolean | false | Show detailed performance breakdown |
| `--quiet` | boolean | false | Minimal output (save only, no report) |
| `--self` | boolean | false | Compress this command's specification |
| `--output` | string | auto-generated | Custom output file path |

## Compression Levels

| Level | Target Ratio | Retention | Strategy | Best For |
|-------|-------------|-----------|----------|----------|
| **light** | 2:1 | ~95% | Remove redundancy, preserve details | Gentle summarization |
| **medium** | 5:1 | ~90% | Balanced section summarization | Standard compression |
| **heavy** | 10:1 | ~85% | Extract key concepts, compress structure | Aggressive reduction |
| **extreme** | 20:1 | ~80% | Core essence only, maximum reduction | Archival storage |

### Compression Strategy Details

**Light (2:1)**: Removes redundant phrases, compresses verbose explanations, and eliminates filler content while preserving all technical details, code examples, and structural hierarchy.

**Medium (5:1)**: Summarizes individual sections into key points, preserves code examples and tables, compresses narrative explanations into concise statements, and maintains document structure.

**Heavy (10:1)**: Extracts key concepts and relationships, removes most prose, preserves only critical code examples, compresses tables into key data points, and flattens document hierarchy.

**Extreme (20:1)**: Distills the document to its absolute core essence -- the minimum representation that preserves the document's primary purpose and critical information. Suitable for archival or quick-reference use.

## Execution Flow

```
PHASE 1: INPUT PROCESSING
    |-- Parse document (file, inline, or self)
    |-- Determine compression level
    |-- Load configuration
    |
PHASE 2: STRUCTURE ANALYSIS
    |-- Parse into sections (headers, paragraphs, code, tables)
    |-- Calculate per-section information density
    |-- Identify redundant content
    |-- Map cross-references
    |
PHASE 3: COMPRESSION
    |-- Apply level-specific strategy
    |-- Process sections in priority order
    |-- Maintain structural coherence
    |-- Track compression metrics
    |
PHASE 4: QUALITY VALIDATION
    |-- Measure information retention (>= 80%)
    |-- Verify compression ratio (within 10% of target)
    |-- Check processing time (< 500ms for 50KB)
    |-- REJECT if any threshold violated
    |
PHASE 5: OUTPUT
    |-- Save compressed document
    |-- Generate metrics report
    |-- Emit telemetry events
```

## Output Format

```
COMPRESSION COMPLETE

COMPRESSION METRICS:
Level: medium (5:1 target ratio)
Original Size: 15,234 bytes
Compressed Size: 3,047 bytes
Actual Ratio: 5.0:1
Retention: 92.3%
Duration: 287ms

COMPRESSED DOCUMENT:
[Compressed content here...]

VALIDATION:
Information Retention: PASS 92.3% (target: >= 80%)
Performance: PASS 287ms (target: < 500ms)
Compression Ratio: PASS 5.0:1 (target: 5:1)

SAVED TO:
.claude/compressed/2025-11-19-compressed-medium.md
```

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Executed by `compressor` agent | Primary compression agent |
| AIAD Registry | Command specification and discovery | Standard AIAD interface |
| [Quality Gates](@/glossary/quality-gates.md) | Pre/post execution quality validation | Retention and ratio gates |
| [Telemetry](@/glossary/telemetry.md) | Command execution [metrics](@/glossary/metrics.md) | Compression event tracking |
| MCP Integration | File read/write operations | Storage adapter integration |
| PrismaticCompression | Core compression module | `apps/prismatic_compression/` |
| Session Context | Session file compression | `.claude/session-context/` management |

### Elixir API

```elixir
# Core compression API
{:ok, result} = PrismaticCompression.compress(document, :medium)

# Self-referential compression
{:ok, result} = PrismaticCompression.compress_self(:heavy)

# Batch compression
{:ok, results} = PrismaticCompression.compress_batch(documents, :medium)

# Metrics estimation (without actual compression)
{:ok, estimate} = PrismaticCompression.estimate(document, :extreme)
```

## Best Practices

1. **Choose the Right Level**: Light for working documents you will reference frequently. Medium for archival with occasional access. Heavy and extreme for long-term storage or quick reference indices.

2. **Validate Retention for Critical Documents**: For documents containing critical configuration or decisions, use `--min-retention 95` to ensure important details are preserved.

3. **Use Batch Mode for Collections**: When compressing multiple session files or reports, use `--batch` for parallel processing rather than individual commands.

4. **Self-Referential Testing**: Run `/compress --self` periodically to verify the compression system is functioning correctly. The self-referential test serves as a built-in health check.

5. **Profile Large Documents**: For documents over 50KB, use `--profile` to see the performance breakdown and ensure processing stays within time limits.

6. **Review Before Discarding Originals**: Always review compressed output before discarding source documents. Automated compression may miss context that is important for specific use cases.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `RETENTION_BELOW_THRESHOLD` | Compressed document lost too much information | Reduce compression level or increase threshold |
| `RATIO_OUT_OF_RANGE` | Actual ratio differs >10% from target | Adjust level or review document structure |
| `PERFORMANCE_EXCEEDED` | Compression took >500ms | Break document into smaller segments |
| `FILE_NOT_FOUND` | Input document path invalid | Verify file path exists |
| `BATCH_PARTIAL_FAILURE` | Some batch files failed compression | Review individual failure reports |

## Advanced Usage

### Self-Referential Demonstration

The command specification itself can be compressed as a demonstration:

| Level | Original | Compressed | Ratio | Retention |
|-------|----------|-----------|-------|-----------|
| Light | 4,823 bytes | 2,412 bytes | 2.0:1 | 96.1% |
| Medium | 4,823 bytes | 965 bytes | 5.0:1 | 91.2% |
| Heavy | 4,823 bytes | 482 bytes | 10.0:1 | 86.4% |
| Extreme | 4,823 bytes | 241 bytes | 20.0:1 | 81.3% |

### Use Cases

1. **Session Context Management**: Compress large session contexts for efficient storage and quick review.
2. **Documentation Summarization**: Create executive summaries of long technical documents.
3. **Knowledge Base Optimization**: Compress historical knowledge for faster retrieval.
4. **Report Generation**: Convert verbose reports into concise summaries.
5. **Context Window Optimization**: Compress documents to fit within LLM context limits.

## Performance

| Metric | Value | Notes |
|--------|-------|-------|
| Light Compression | ~100ms per 50KB | Minimal processing |
| Medium Compression | ~200ms per 50KB | Balanced processing |
| Heavy Compression | ~350ms per 50KB | Intensive analysis |
| Extreme Compression | ~450ms per 50KB | Maximum processing |
| Batch Overhead | ~50ms per file | Parallel scheduling |

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for quality violations. Compression operations that fail retention, ratio, or performance thresholds are rejected entirely rather than delivering degraded output.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every compression includes a detailed metrics report with validation status for all quality thresholds.

## Related Commands

- [/chronic](@/commands/chronic.md) - Chronic documentation scan and technical hygiene maintenance
- [/find-lowfruit](@/commands/find-lowfruit.md) - Identify low-hanging fruit improvements across codebase
- [/debrief](@/commands/debrief.md) - Comprehensive session debrief with platform state analysis
- [/session-compress](@/commands/session-compress.md) - Advanced session context compression with multi-session pattern detection
- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)
- [/optimize](@/commands/optimize.md) - Performance optimization with measurement validation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)