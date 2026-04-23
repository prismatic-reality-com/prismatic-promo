+++
title = "/scan-mycelium"
weight = 1220
[extra]
category = "Documentation"
description = "Mycelial pattern scanning across documentation and code"
syntax = "/scan-mycelium [options]"
authority = "L2+"
agent = "mycelium-scanner"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1221
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["scan-mycelium", "Mycelial", "commands", "Documentation", "Prismatic Platform", "Phase", "Downstream", "Scan"]
tags = ["commands", "documentation", "scan-mycelium", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/scan-mycelium - Prismatic Platform"
+++

## Overview

**/scan-mycelium** is a production command in the **Documentation** category of the Prismatic Platform. It performs comprehensive pattern scanning across both documentation and source code, identifying recurring structures, anti-patterns, improvement opportunities, and cross-cutting concerns that the [mycelial network](@/glossary/mycelial-network.md) can propagate. The scanner bridges the gap between code patterns and their documentation, ensuring that improvements discovered in one domain are visible to and actionable by the propagation system.

This command operates under the **L2+** authority level and is executed by the `mycelium-scanner` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The mycelium-scanner agent has read access to the entire codebase and documentation corpus, enabling it to identify patterns that span multiple applications and documentation sections.

The scanning process is the discovery phase of the mycelial lifecycle. Before patterns can be propagated (via [/mycelialize](@/commands/mycelialize.md)), evolved (via [/mycelialize-living](@/commands/mycelialize-living.md)), or verified (via [/mycelialize-formal](@/commands/mycelialize-formal.md)), they must first be identified and catalogued. `/scan-mycelium` serves this critical role, feeding the mycelial network with fresh pattern discoveries.

The biological metaphor behind the mycelial network is deliberate: just as fungal mycelium networks discover and transport nutrients through soil ecosystems, the platform's mycelial scanning discovers valuable patterns and routes them to the systems that can propagate and apply them. The scanner is the sensory apparatus of this network -- constantly probing the codebase for new patterns, changed patterns, and degraded patterns that require attention.

## Syntax and Usage

```bash
/scan-mycelium [options]
```

The command supports multiple scan modes, focus areas, and output formats.

```bash
# Full scan across code and documentation
/scan-mycelium

# Scan code patterns only
/scan-mycelium --mode code

# Scan documentation patterns only
/scan-mycelium --mode docs

# Scan for anti-patterns specifically
/scan-mycelium --focus anti-patterns

# Scan specific application
/scan-mycelium --app prismatic_web

# Scan with verbose pattern details
/scan-mycelium --verbose

# Output as JSON for pipeline integration
/scan-mycelium --format json

# Scan recently changed files only
/scan-mycelium --since 7d

# Export discovered patterns
/scan-mycelium --export ./patterns/

# Dry run showing scan plan
/scan-mycelium --dry-run

# Find patterns suitable for propagation
/scan-mycelium --propagation-candidates --export ./candidates/

# Full documentation consistency scan
/scan-mycelium --mode docs --cross-reference --verbose
```

## Parameters and Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--mode` | enum | `all` | Scan mode: `code`, `docs`, `cross`, `all` |
| `--focus` | enum | `all` | Focus area: `patterns`, `anti-patterns`, `improvements`, `consistency`, `all` |
| `--app` | string | all | Specific application to scan |
| `--since` | duration | all | Scan only files modified within period |
| `--format` | enum | `text` | Output format: `text`, `json`, `markdown` |
| `--verbose` | flag | false | Detailed pattern descriptions and examples |
| `--export` | path | none | Export patterns to directory |
| `--dry-run` | flag | false | Show scan plan without executing |
| `--min-confidence` | float | 0.5 | Minimum confidence for reported patterns |
| `--max-results` | integer | 100 | Maximum patterns to report |
| `--cross-reference` | flag | false | Enable code-documentation cross-referencing |
| `--propagation-candidates` | flag | false | Filter to patterns suitable for propagation |
| `--parallel` | integer | 4 | Number of parallel scan workers |
| `--custom-patterns` | path | none | Load custom pattern definitions from file |
| `--incremental` | flag | false | Scan only changes since last scan |
| `--trend-analysis` | flag | false | Analyze pattern frequency trends over time |

## Implementation Architecture

The scanner operates as a multi-pass analysis system that examines code and documentation through different analytical lenses.

```
             /scan-mycelium
                    |
           Scan Orchestrator
                    |
          +--------+--------+
          |        |        |
       Code      Doc      Cross
       Scanner   Scanner   Scanner
          |        |        |
    +-----+---+ +--+--+ +--+--+
    |     |   | |  |  | |  |  |
   AST  Regex Doc  MD  Code Doc
   Scan  Scan Parse Scan Link Link
    |     |   | |  |  | |  |  |
    +-----+---+-+--+--+-+--+--+
                    |
           Pattern Classifier
                    |
          +--------+--------+
          |        |        |
       Known    Novel    Anti
       Patterns Patterns Patterns
          |        |        |
          +--------+--------+
                    |
           Pattern Registry Update
```

### Scan Modes

| Mode | Target | Analysis Type | Performance |
|------|--------|---------------|-------------|
| **AST Scan** | Elixir source files | Abstract syntax tree pattern matching | 1,000 files/sec |
| **Regex Scan** | All text files | Regular expression pattern detection | 5,000 files/sec |
| **Doc Parse** | Markdown/documentation | Structure and content pattern analysis | 2,000 files/sec |
| **Cross-Reference** | Code + documentation pairs | Consistency and coverage analysis | 500 pairs/sec |

### Pattern Classification

Discovered patterns are classified into three categories:

- **Known Patterns**: Match existing entries in the pattern library with confidence scores. These patterns confirm that established architectural decisions are being followed (or violated, in the case of anti-patterns).
- **Novel Patterns**: New structures appearing frequently enough to warrant cataloguing. These represent emerging conventions that may deserve formalization in the pattern library.
- **Anti-Patterns**: Structures matching known problematic patterns. These are flagged for remediation through [/quality-evolve](@/commands/quality-evolve.md) or manual intervention.

### Execution Phases

**Phase 1 -- File Discovery**: The scanner enumerates target files using the Git tree index for performance. Files are categorized by type (Elixir source, test, documentation, configuration) and queued for appropriate scan modes.

**Phase 2 -- Code Pattern Scanning**: Elixir source files are parsed into ASTs and analyzed for structural patterns. The scanner maintains a library of known patterns (both positive and anti-patterns) and uses fuzzy matching to identify variants. Novel structures that appear frequently across the codebase are flagged as potential new patterns.

**Phase 3 -- Documentation Pattern Scanning**: Documentation files are parsed for structural patterns: heading hierarchies, cross-reference density, content coverage, and terminology consistency. Documentation that diverges from platform conventions is flagged for review.

**Phase 4 -- Cross-Reference Analysis**: When enabled, the scanner correlates code modules with their documentation. Missing documentation for public modules, outdated documentation that does not match current code, and undocumented public functions are all identified.

**Phase 5 -- Pattern Classification**: Discovered patterns are classified against the pattern library. Confidence scores are assigned based on structural similarity, frequency, and context matching.

**Phase 6 -- Registry Update**: Classified patterns are submitted to the mycelial network registry. Known patterns have their occurrence counts updated. Novel patterns are queued for human review. Anti-patterns are flagged for remediation.

## Examples

### Quality-Focused Anti-Pattern Scan

```bash
/scan-mycelium --focus anti-patterns --since 7d --format json
# Discovers anti-patterns introduced in the last week:
# - 3 instances of unsafe map access (map[:key] instead of Map.get)
# - 2 instances of Process.sleep in production code
# - 1 God module exceeding 500 lines
```

### Documentation Consistency Audit

```bash
/scan-mycelium --mode docs --cross-reference --verbose
# Cross-references code modules with documentation:
# - 12 public modules lack documentation
# - 5 documentation files reference removed functions
# - 3 documentation files have outdated code examples
```

### Propagation Candidate Discovery

```bash
/scan-mycelium --propagation-candidates --export ./candidates/
# Identifies patterns suitable for mycelial propagation:
# - GenServer health check pattern (found in 8 modules, missing from 15)
# - Telemetry event pattern (found in 12 modules, missing from 23)
# - Circuit breaker pattern (found in 3 modules, applicable to 7 more)
```

## Integration with Platform

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/mycelialize](@/commands/mycelialize.md) | Downstream | Discovered patterns feed into propagation |
| [/mycelialize-living](@/commands/mycelialize-living.md) | Downstream | Novel patterns become evolution candidates |
| [/mycelialize-formal](@/commands/mycelialize-formal.md) | Downstream | Critical patterns queued for formal verification |
| [/propagate-pattern](@/commands/propagate-pattern.md) | Downstream | Positive patterns propagated across codebase |
| [/quality-evolve](@/commands/quality-evolve.md) | Downstream | Anti-patterns trigger quality evolution cycles |
| [/chronic](@/commands/chronic.md) | Peer | Documentation hygiene scan results feed into mycelium |
| [Git Trees](@/glossary/git-trees.md) | Infrastructure | Fast file enumeration |
| [Telemetry](@/glossary/telemetry.md) | Monitoring | Scan metrics and pattern discovery rates |
| [/pattern](@/commands/pattern.md) | Pattern library | Known patterns sourced from pattern library |

## Workflow Integration

The /scan-mycelium command participates in the platform's continuous improvement workflow:

1. **Post-Feature Scanning**: After major feature additions, scanning discovers new patterns introduced by the feature. Positive patterns are candidates for propagation; anti-patterns are candidates for remediation.

2. **Pre-Evolution Preparation**: Before [/quality-evolve](@/commands/quality-evolve.md) cycles, anti-pattern scanning provides a fresh list of targets. This ensures evolution efforts address real, current problems rather than stale data.

3. **Documentation Maintenance**: Weekly cross-reference scans catch documentation drift before it accumulates. Code changes without corresponding documentation updates are a persistent quality issue that this scanning addresses systematically.

4. **Pattern Library Growth**: Novel pattern discovery feeds the [/pattern](@/commands/pattern.md) library with new candidates. Patterns that appear consistently across the codebase may be formalized into the library after review.

5. **Quality Monitoring**: Trend analysis (`--trend-analysis`) tracks pattern frequency over time, revealing whether quality improvement efforts are having their intended effect.

## NABLA Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Anti-patterns are flagged without exception. No scan results are suppressed or minimized.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Patterns are reported with confidence scores and evidence locations. Every finding is traceable to specific files and line numbers.

NABLA axiom compliance:

| Axiom | Enforcement |
|-------|-------------|
| **Signal Plurality** | Multiple scan modes (AST, regex, doc parse) provide independent signals |
| **Provenance Mandatory** | Every pattern finding includes file path, line numbers, and scan mode |
| **Unknown Valid** | Uncertain patterns reported with confidence scores, not suppressed |
| **Time Decay** | Pattern freshness tracked; stale patterns flagged for re-verification |
| **Contradiction Preservation** | Conflicting pattern classifications preserved for human resolution |

## Performance

| Metric | Target | Typical |
|--------|--------|---------|
| AST scan | 1,000 files/sec | ~1,200 files/sec |
| Regex scan | 5,000 files/sec | ~6,000 files/sec |
| Doc parse | 2,000 files/sec | ~2,500 files/sec |
| Cross-reference | 500 pairs/sec | ~600 pairs/sec |
| Full platform scan | < 5min | ~2min |
| Incremental scan (7d) | < 30s | ~10s |
| Pattern classification | < 10s | ~3s |
| Registry update | < 5s | ~1s |

The scanner leverages Git Trees for file enumeration and parallel workers for concurrent scanning. The default parallelism of 4 workers balances throughput with system load. Incremental scanning (using `--since` or `--incremental`) dramatically reduces scan time by processing only recently changed files.

## Related Commands

- [/mycelialize](@/commands/mycelialize.md) - Biological-inspired pattern propagation at 500K patterns/sec with emergence detection
- [/mycelialize-formal](@/commands/mycelialize-formal.md) - [Lean4](@/glossary/lean4.md) + Prolog [formal verification](@/glossary/formal-verification.md) for mathematically proven pattern propagation
- [/chronic](@/commands/chronic.md) - Chronic documentation scan and technical hygiene maintenance
- [/find-lowfruit](@/commands/find-lowfruit.md) - Identify low-hanging fruit improvements across codebase
- [/propagate-pattern](@/commands/propagate-pattern.md) - Propagate successful patterns across the ecosystem
- [/quality-evolve](@/commands/quality-evolve.md) - Quality-focused evolution targeting specific quality domains
- [/optimize](@/commands/optimize.md) - Performance optimization with measurement validation
- [/pattern](@/commands/pattern.md) - AI pattern lookup and pattern library access

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)