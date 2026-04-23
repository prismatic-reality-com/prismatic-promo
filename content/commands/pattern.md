+++
title = "/pattern"
weight = 1980
[extra]
category = "Framework"
description = "AI pattern lookup and pattern library access"
syntax = "/pattern [options]"
authority = "L2+"
agent = "pattern-lookup-specialist"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1174
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["pattern", "lookup", "library", "access", "commands", "Framework", "Prismatic Platform", "GARDEN", "Patterns"]
tags = ["commands", "framework", "pattern", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/pattern - Prismatic Platform"
+++

## Overview

**/pattern** is a production command in the **Framework** category of the Prismatic Platform that provides AI-powered pattern lookup and access to the platform's comprehensive pattern library. The pattern library encodes over 55 architectural, design, and implementation patterns extracted from the platform's 20+ year development history across the GARDEN knowledge base and the current Prismatic Platform codebase. Each pattern is formally documented with its context, forces, solution structure, consequences, known uses, and relationship to other patterns.

The command serves two primary functions. First, it enables developers and agents to query the pattern library by name, category, problem description, or architectural context, retrieving structured pattern definitions that guide implementation decisions. Second, it performs pattern detection against existing code, identifying where established patterns are already in use and where they could be beneficially applied. This dual capability -- lookup and detection -- bridges the gap between documented architectural knowledge and live codebase practice.

This command operates under the **L2+** authority level and is executed by the `pattern-lookup-specialist` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The pattern lookup specialist agent maintains an in-memory index of all patterns, enabling sub-millisecond lookups by name and rapid semantic search by description.

The pattern library represents the platform's accumulated architectural wisdom -- lessons learned across two decades of software development, encoded in a form that is both human-readable and machine-queryable. Patterns are not merely documentation; they are active knowledge assets that influence code generation, quality assessment, and architectural decision-making throughout the platform. The /pattern command is the primary access point to this knowledge.

## Syntax and Usage

```bash
/pattern [options]
```

The command supports multiple query modes: exact name lookup, semantic search, category browsing, pattern detection, and catalog export.

```bash
# Look up pattern by name
/pattern --name="Supervision Tree"

# Search patterns by problem description
/pattern --search="how to handle concurrent state across distributed nodes"

# List all patterns in a category
/pattern --category=otp

# Detect patterns in specific application
/pattern --detect --app=prismatic_perimeter

# Show pattern relationships and dependencies
/pattern --name="GenServer State Machine" --show-related

# List all available patterns
/pattern --list

# Show pattern with implementation examples
/pattern --name="Event Sourcing" --with-examples

# Export pattern catalog
/pattern --export --format=json --output=/tmp/patterns.json

# Search GARDEN legacy patterns
/pattern --search="blackboard architecture" --include-garden
```

## Parameters and Options

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--name` | string | none | Exact pattern name lookup |
| `--search` | string | none | Semantic search across pattern descriptions |
| `--category` | enum | all | Pattern category: `otp`, `architectural`, `behavioral`, `structural`, `integration`, `security`, `performance` |
| `--detect` | boolean | false | Enable pattern detection mode |
| `--app` | string | all | Target application for detection |
| `--show-related` | boolean | false | Display related patterns |
| `--list` | boolean | false | List all patterns with summaries |
| `--with-examples` | boolean | false | Include implementation examples from codebase |
| `--export` | boolean | false | Export pattern catalog |
| `--format` | enum | text | Output format: `text`, `json`, `markdown` |
| `--output` | path | stdout | Output destination |
| `--include-garden` | boolean | false | Include GARDEN legacy patterns |
| `--confidence` | float | 0.7 | Minimum confidence for pattern detection |
| `--verbose` | boolean | false | Detailed output with full pattern descriptions |

The `--confidence` parameter controls the sensitivity of pattern detection. Higher values (0.8+) report only definite pattern matches, reducing false positives but potentially missing variant implementations. Lower values (0.3-0.5) capture more patterns but may include coincidental structural similarities. The default of 0.7 balances precision and recall for production use.

## Implementation Architecture

The pattern system is built on a three-layer architecture separating storage, indexing, and query processing.

```
Pattern Library (55+ patterns)
    |
    v
[Storage Layer]
    +---> AIAD Pattern Files (.aiad/patterns/*.pattern.md)
    +---> GARDEN Legacy Patterns (.aiad/patterns/garden-patterns.library.md)
    +---> Runtime Pattern Cache (ETS)
    |
    v
[Index Layer]
    +---> Name Index (exact match, O(1))
    +---> Category Index (grouped by domain)
    +---> Semantic Index (embedding-based similarity)
    +---> Usage Index (codebase occurrence tracking)
    |
    v
[Query Engine]
    +---> Exact Lookup (--name)
    +---> Semantic Search (--search)
    +---> Pattern Detection (--detect + AST analysis)
    +---> Relationship Traversal (--show-related)
    |
    v
Structured Pattern Response
```

Each pattern in the library follows a standardized structure derived from the Gang of Four format, extended with Elixir/OTP-specific sections:

| Section | Content |
|---------|---------|
| **Name** | Pattern identifier |
| **Category** | Domain classification (OTP, architectural, behavioral, etc.) |
| **Intent** | One-sentence summary of purpose |
| **Context** | When to apply this pattern |
| **Problem** | The forces and tensions that motivate the pattern |
| **Solution** | Structural and behavioral description |
| **Consequences** | Trade-offs and side effects |
| **Known Uses** | Real examples from the platform codebase (minimum two) |
| **Related Patterns** | Relationships with other patterns (with type) |
| **Implementation Guidance** | Prismatic Platform-specific implementation notes |

Pattern detection operates at the Elixir AST level, analyzing module structures, function signatures, supervision tree shapes, and GenServer callback patterns to identify which architectural patterns are present in a given codebase section. The detector uses configurable confidence thresholds to distinguish between definite pattern usage and coincidental structural similarity.

## Examples

### OTP Pattern Lookup

```bash
/pattern --name="Circuit Breaker"
# Returns: Full pattern definition including OTP-specific implementation
# with GenServer state machine, telemetry integration, and health monitoring
```

### Semantic Search

```bash
/pattern --search="preventing cascading failures in distributed systems"
# Returns: Circuit Breaker, Bulkhead, Timeout, Retry with Backoff patterns
# ranked by relevance to the query
```

### Pattern Detection Report

```bash
/pattern --detect --app=prismatic_perimeter --verbose
# Detected Patterns:
#   Facade Pattern (confidence: 0.95) - PrismaticPerimeter module
#   Strategy Pattern (confidence: 0.88) - Scanner implementations
#   Observer Pattern (confidence: 0.92) - Telemetry event handlers
#   Repository Pattern (confidence: 0.85) - Asset storage layer
```

### Cross-Reference Discovery

```bash
/pattern --name="Adapter Pattern" --show-related --with-examples
# Shows: Adapter Pattern definition with related patterns
# (Strategy, Bridge, Decorator) and real implementation examples
# from PrismaticStorage adapter modules
```

## Integration with Platform

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `pattern-lookup-specialist` | Pattern expertise |
| AIAD Registry | Pattern catalog | Patterns registered as AIAD components |
| [GARDEN](/glossary/garden/) | Legacy patterns | 55+ patterns from 20+ years |
| [/inject](/commands/inject/) | Pattern deployment | Inject applies patterns to code |
| [/mycelialize](/commands/mycelialize/) | Pattern propagation | Biological-inspired pattern spreading |
| [/analyze](/commands/analyze/) | Architecture analysis | Pattern detection informs analysis |
| [Telemetry](/glossary/telemetry/) | Usage metrics | Pattern lookup and detection tracking |
| [/architect](/commands/architect/) | Architecture design | Patterns guide design recommendations |
| [/quality-evolve](/commands/quality-evolve/) | Quality improvement | Anti-patterns drive evolution targets |

## Workflow Integration

The `/pattern` command plays a central role in the platform's knowledge-driven development workflow:

1. **Architectural Decision Making**: When a developer or agent encounters an architectural decision point, they invoke `/pattern --search` to discover applicable patterns from the library. The retrieved patterns provide proven solutions with documented consequences, reducing the risk of ad-hoc architectural decisions that may introduce technical debt.

2. **Code Review**: In the code review workflow, `/pattern --detect` identifies which patterns are used in submitted code, enabling reviewers to verify that patterns are correctly implemented and consistently applied. The detection capability also supports the platform's quality evolution by identifying areas where beneficial patterns could be applied but are currently absent.

3. **SEADF Evolution**: During [SEADF](/glossary/seadf/) evolution cycles, the pattern library is consulted to evaluate proposed changes against established architectural conventions. Changes that introduce patterns not present in the library trigger a review process to determine whether a new pattern should be added or whether the change represents an architectural deviation that requires justification.

4. **Onboarding**: New team members use `/pattern --list` and `/pattern --category` to build understanding of the platform's architectural vocabulary. Each pattern's known uses section provides concrete examples from the codebase, connecting abstract concepts to real implementations.

5. **Quality Campaigns**: Anti-pattern detection via `/pattern --detect` with focus on known problematic patterns identifies code that should be refactored. These findings feed directly into [/quality-evolve](/commands/quality-evolve/) campaigns.

## NABLA Compliance

The pattern library adheres to [NABLA](/glossary/nabla-infinity/) epistemic axioms throughout its operation:

| Axiom | Enforcement |
|-------|-------------|
| **Provenance Mandatory** | Origin of each pattern tracked (GARDEN legacy, Prismatic evolution, or external catalog) |
| **Signal Plurality** | Each pattern requires minimum two independent known uses before promotion |
| **Time Decay** | Pattern version history and last-verified date; periodic re-validation required |
| **Unknown Valid** | Detection confidence below threshold reported as uncertain, not suppressed |
| **Source Independence** | Independent implementations weighted higher than copied implementations |
| **Contradiction Preservation** | Patterns with conflicting consequences documented without resolution |

Pattern detection results include confidence scores that directly support the **Unknown Valid** axiom -- when detection confidence is below the threshold, the result is reported as uncertain rather than being silently suppressed or artificially elevated. This ensures operators receive honest assessments of pattern presence rather than false certainty.

## Performance

| Metric | Target | Typical |
|--------|--------|---------|
| Exact name lookup | < 1ms | ~0.1ms (ETS) |
| Semantic search | < 500ms | ~200ms |
| Pattern detection (per app) | < 5s | ~2s |
| Full catalog listing | < 100ms | ~30ms |
| GARDEN pattern search | < 2s | ~800ms |
| Relationship traversal | < 100ms | ~30ms |
| Catalog export (JSON) | < 1s | ~300ms |

The sub-millisecond exact lookup time is achieved through ETS-backed indexing. Semantic search leverages pre-computed embeddings for the pattern descriptions, enabling vector similarity search without real-time embedding computation. Pattern detection is the most expensive operation as it requires AST parsing and structural comparison for each module in the target application.

## Related Commands

- [/seadf](/commands/seadf/) - Self-Evolving Autonomous Development Framework control and monitoring
- [/inject](/commands/inject/) - AIAD injection coordination for pattern and agent deployment
- [/analyze](/commands/analyze/) - System architecture analysis with dependency mapping
- [/mycelialize](/commands/mycelialize/) - Biological-inspired pattern propagation at 500K patterns/sec
- [/pack](/commands/pack/) - Unified source archive command for AI/LLM context sharing
- [/integrate](/commands/integrate/) - Cross-system integration design and implementation
- [/architect](/commands/architect/) - Architecture design and recommendation generation
- [/scan-mycelium](/commands/scan-mycelium/) - Mycelial pattern scanning across documentation and code

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)