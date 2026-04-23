+++
title = "/navy-seal"
weight = 650
[extra]
category = "Intelligence"
description = "Deep-dive investigation with multi-source intelligence fusion"
syntax = "/navy-seal [options]"
authority = "L3"
agent = "navy-seal-operator"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1224
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["navy-seal", "Deep-dive", "commands", "Intelligence", "Prismatic Platform", "PrismaticIntelligence", "Phase", "NavySeal"]
tags = ["commands", "intelligence", "navy-seal", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/navy-seal - Prismatic Platform"
+++

## Overview

**/navy-seal** is a production command in the **Intelligence** category of the Prismatic Platform. It performs deep-dive investigation with multi-source [intelligence fusion](@/glossary/intelligence-fusion.md), combining advanced [OSINT](@/glossary/osint.md) techniques with tactical precision to deliver comprehensive intelligence products on high-value targets.

Unlike lighter-weight reconnaissance commands, `/navy-seal` operates at the deepest investigation tier within the Prismatic intelligence hierarchy. The command marshals multiple intelligence collection disciplines -- open source intelligence, domain intelligence, infrastructure analysis, and social graph mapping -- into a unified analytical product. Each investigation thread runs concurrently through the platform's [OTP](@/glossary/otp.md)-based supervision tree, ensuring fault tolerance even when individual collection sources fail or timeout.

The command derives its name from its operational philosophy: methodical preparation, decisive execution, and comprehensive post-operation analysis. Every `/navy-seal` invocation follows a structured intelligence cycle that begins with target enumeration, progresses through multi-source collection, applies correlation analysis to eliminate noise, and produces a finalized intelligence assessment with confidence ratings aligned to the [NABLA](@/glossary/nabla-infinity.md) epistemic framework.

This command operates under the **L3** authority level and is executed by the `navy-seal-operator` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The L3 authority level reflects the command's access to sensitive intelligence sources and its ability to initiate cross-domain correlation operations that may touch multiple external services.

## Architecture

The `/navy-seal` command implements a multi-layered intelligence collection architecture built on Elixir's concurrency primitives and the platform's [GenServer](@/glossary/genserver.md) infrastructure.

### Collection Pipeline

```
Target Input --> Target Validator --> Collection Orchestrator
                                          |
                    +---------------------+---------------------+
                    |                     |                     |
              Domain Intel          Infrastructure        Social Graph
              (DNS, WHOIS,          (IP ranges, ASN,      (Profiles,
               certificates)        services, ports)       connections)
                    |                     |                     |
                    +---------------------+---------------------+
                                          |
                                  Correlation Engine
                                          |
                                  Confidence Scoring
                                          |
                                Intelligence Product
```

### Core Components

| Component | Module | Responsibility |
|-----------|--------|----------------|
| **Collection Orchestrator** | `PrismaticIntelligence.NavySeal.Orchestrator` | Coordinates parallel collection tasks |
| **Source Manager** | `PrismaticIntelligence.NavySeal.SourceManager` | Manages 121+ intelligence sources |
| **Correlation Engine** | `PrismaticIntelligence.NavySeal.Correlator` | Cross-references findings across sources |
| **Confidence Scorer** | `PrismaticIntelligence.NavySeal.ConfidenceScorer` | NABLA-compliant confidence assessment |
| **Report Generator** | `PrismaticIntelligence.NavySeal.Reporter` | Structured intelligence product output |

The architecture leverages [Task.async_stream/3](@/glossary/task-module.md) for parallel source querying with configurable concurrency limits, ensuring that no single slow source blocks the overall investigation. Each source adapter implements the `PrismaticIntelligence.Source` behaviour, providing a consistent interface for data collection, normalization, and error handling.

## Usage

### Basic Investigation

```bash
# Full deep-dive investigation on a domain
/navy-seal --target example.com

# Investigation with specific focus areas
/navy-seal --target example.com --focus infrastructure,certificates

# Quick tactical assessment (reduced source set)
/navy-seal --target example.com --mode tactical
```

### Advanced Operations

```bash
# Multi-target investigation with correlation
/navy-seal --targets targets.txt --correlate

# Investigation with custom source selection
/navy-seal --target example.com --sources shodan,censys,crtsh --depth full

# Time-bounded investigation with deadline
/navy-seal --target example.com --timeout 300s --priority high

# Export results in structured format
/navy-seal --target example.com --output json --file investigation-report.json
```

### Integration with Other Commands

```bash
# Feed results into perimeter assessment
/navy-seal --target example.com --pipe-to perimeter

# Chain with email OSINT for comprehensive profiling
/navy-seal --target example.com && /email-osint --domain example.com

# Use with Google hacking for expanded coverage
/navy-seal --target example.com --augment google-hacking
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--target` | String | Required | Primary investigation target (domain, IP, organization) |
| `--targets` | File path | - | File containing multiple targets, one per line |
| `--mode` | Enum | `full` | Investigation depth: `tactical`, `operational`, `full` |
| `--focus` | List | All | Focus areas: `infrastructure`, `certificates`, `dns`, `social`, `code` |
| `--sources` | List | All | Specific intelligence sources to query |
| `--depth` | Enum | `standard` | Collection depth: `shallow`, `standard`, `deep`, `exhaustive` |
| `--timeout` | Duration | `600s` | Maximum investigation duration |
| `--correlate` | Boolean | `true` | Enable cross-source correlation analysis |
| `--confidence-threshold` | Float | `0.6` | Minimum confidence for included findings |
| `--output` | Enum | `text` | Output format: `text`, `json`, `html`, `markdown` |
| `--file` | Path | - | Write results to file instead of stdout |
| `--priority` | Enum | `normal` | Execution priority: `low`, `normal`, `high`, `critical` |
| `--pipe-to` | Command | - | Forward results to another command |

## Execution Flow

The `/navy-seal` command follows a structured six-phase execution model that mirrors professional intelligence collection methodologies.

**Phase 1 -- Target Validation** (0-5s): The target input is parsed, validated, and enriched with initial metadata. Domain targets undergo DNS resolution to confirm existence. IP targets are validated for format and routability. Organization names are normalized and mapped to known entities in the platform's knowledge base.

**Phase 2 -- Source Selection** (5-10s): Based on the target type and specified focus areas, the Collection Orchestrator selects the optimal set of intelligence sources. Source health is verified before inclusion, and sources with recent failures are deprioritized. The selection algorithm considers source coverage, latency characteristics, and data freshness requirements.

**Phase 3 -- Parallel Collection** (10-120s): All selected sources are queried concurrently using supervised [Task](@/glossary/task-module.md) processes. Each source adapter handles its own rate limiting, authentication, and response parsing. Failed queries are retried up to three times with exponential backoff before being marked as unavailable.

**Phase 4 -- Correlation Analysis** (120-180s): Raw findings from all sources are fed into the Correlation Engine, which identifies connections, contradictions, and patterns across the dataset. Entity resolution merges duplicate references to the same infrastructure components, organizations, or individuals.

**Phase 5 -- Confidence Scoring** (180-200s): Each finding and correlation receives a confidence score based on source reliability, corroboration count, data freshness, and internal consistency. Scores follow the [NABLA](@/glossary/nabla-infinity.md) Signal Plurality axiom, requiring at minimum two independent sources for high-confidence assessments.

**Phase 6 -- Report Generation** (200-240s): The finalized intelligence product is assembled with executive summary, detailed findings organized by category, confidence assessments, and recommended follow-up actions.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Execution | Managed by `navy-seal-operator` agent with L3 authority |
| [Prismatic Perimeter](@/apps/prismatic-perimeter.md) | Data flow | Feeds asset discovery data to perimeter monitoring |
| [AIAD Registry](@/glossary/aiad.md) | Discovery | Registered command with full AIAD metadata |
| [Quality Gates](@/glossary/quality-gates.md) | Validation | Pre/post execution quality checks on output |
| [Telemetry](@/glossary/telemetry.md) | Observability | Execution [metrics](@/glossary/metrics.md), source latency, correlation statistics |
| [ETS Storage](@/glossary/ets.md) | Caching | Investigation results cached for cross-session access |
| [KuzuDB](@/glossary/kuzudb.md) | Graph storage | Entity relationships stored in knowledge graph |
| [Meilisearch](@/glossary/meilisearch.md) | Search index | Findings indexed for full-text search |

## Best Practices

**Target Scoping**: Always define the investigation scope before execution. Unbounded investigations against large organizations can generate excessive data volume and extended execution times. Use `--focus` to constrain collection to relevant domains.

**Source Management**: Not all intelligence sources are equally reliable or fast. For time-sensitive investigations, use `--mode tactical` to limit collection to high-speed, high-reliability sources. Reserve `--depth exhaustive` for cases where completeness outweighs speed.

**Correlation Thresholds**: The default confidence threshold of 0.6 provides a balanced view of findings. Raise to 0.8 or higher for executive-level reporting where only well-corroborated findings are acceptable. Lower to 0.4 for exploratory investigations where leads are more valuable than certainty.

**Result Persistence**: Always use `--file` for significant investigations. Terminal output can be lost, but file-based reports integrate with the platform's knowledge management system and can be referenced in future sessions.

**Operational Security**: Be aware that some intelligence sources log queries. For sensitive investigations, consider using `--sources` to explicitly control which external services receive your query terms.

## Error Handling

The command implements comprehensive error handling at every stage of the intelligence pipeline.

| Error Condition | Handling Strategy | User Impact |
|----------------|-------------------|-------------|
| Invalid target format | Immediate rejection with format guidance | Command does not execute |
| Source timeout | Graceful degradation, other sources continue | Partial results with source status |
| Rate limiting | Automatic backoff and retry (3 attempts) | Delayed but complete results |
| Network failure | Source marked unavailable, investigation continues | Reduced source coverage noted in report |
| Correlation overflow | Batch processing with memory-bounded windows | Slightly longer execution time |
| All sources failed | Error report with diagnostic information | No results, actionable error message |

All errors emit structured [telemetry](@/glossary/telemetry.md) events under the `[:prismatic, :intelligence, :navy_seal, :error]` event path, enabling automated monitoring and alerting through the platform's observability infrastructure.

## Advanced Usage

### Custom Source Chains

Advanced operators can define custom source chains that specify collection order, dependency relationships, and enrichment pipelines:

```bash
# Define a custom chain: DNS first, then use results for certificate lookup
/navy-seal --target example.com --chain "dns -> crtsh -> shodan" --chain-mode sequential

# Parallel chains with merge point
/navy-seal --target example.com --chain "dns,whois|censys,shodan -> correlate"
```

### Investigation Templates

For recurring investigation types, templates can be defined and reused:

```bash
# Use a predefined investigation template
/navy-seal --target example.com --template infrastructure-audit

# List available templates
/navy-seal --list-templates
```

### Batch Operations

For large-scale intelligence collection across multiple targets:

```bash
# Process target list with concurrency control
/navy-seal --targets targets.csv --batch-concurrency 5 --output json --file batch-results/

# Resume interrupted batch investigation
/navy-seal --resume batch-id-12345
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Every intelligence source must return data or explicitly report failure. No silent omissions. No partial reports without clear status indicators for each collection phase.
- **NO DOUBTS**: Full investigation before action, evidence-based results. All findings carry confidence scores. Contradictory evidence is preserved per the [Addiction Preservation](@/glossary/contradiction-preservation.md) principle. No finding is presented without traceable provenance to its source.

The command additionally enforces [NABLA](@/glossary/nabla-infinity.md) axioms at the correlation layer: Signal Plurality (minimum two sources for high-confidence claims), Contradiction Preservation (conflicting findings are both reported), and Provenance Mandatory (every data point traces to its origin).

## Related Commands

- [/investigate](@/commands/investigate.md) - Launch comprehensive [OSINT](@/glossary/osint.md) investigation across 121+ sources
- [/email-osint](@/commands/email-osint.md) - Email-based OSINT gathering with breach correlation and social profiling
- [/google-hacking](@/commands/google-hacking.md) - Google dorking and advanced search intelligence extraction
- [/ghost-recon](@/commands/ghost-recon.md) - Passive reconnaissance with zero-footprint collection
- [/delta-force](@/commands/delta-force.md) - Rapid tactical intelligence for time-critical targets
- [/osint-engines](@/commands/osint-engines.md) - Multi-engine OSINT source coordination and parallel querying
- [/perimeter](@/commands/perimeter.md) - External [attack surface](@/glossary/attack-surface.md) management dashboard and overview

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)