+++
title = "/manipulation-techniques"
weight = 1130
[extra]
category = "Defensive Security"
description = "View manipulation technique taxonomy and counter-measures"
syntax = "/manipulation-techniques [options]"
authority = "L2+"
agent = "manipulation-detector"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1308
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["manipulation-techniques", "View", "commands", "Defensive Security", "Prismatic Platform", "String", "Red Team", "Blue Team"]
tags = ["commands", "defensive-security", "manipulation-techniques", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/manipulation-techniques - Prismatic Platform"
+++

## Overview

**/manipulation-techniques** is a production command in the **Defensive Security** category of the Prismatic Platform. It provides comprehensive access to the platform's manipulation technique taxonomy, a structured catalogue of known epistemic attack vectors alongside their corresponding counter-measures. In an era where AI systems face increasingly sophisticated adversarial inputs -- from prompt injection to subtle confidence manipulation -- this command serves as the primary reference interface for understanding and defending against such threats.

The taxonomy maintained by this command draws from both academic research in adversarial machine learning and practical threat intelligence gathered through the platform's [Color-Team Security](@/glossary/color-teams.md) operations. Each technique entry includes a classification identifier, attack vector description, severity rating, detection signatures, and one or more validated counter-measures. The taxonomy currently covers five major attack primitives: truth distortion, confidence manipulation, signal poisoning, drift induction, and salience hijacking, with over 300 individual technique entries catalogued.

This command operates under the **L2+** authority level and is executed by the `manipulation-detector` agent, a specialized defensive security agent that maintains continuous awareness of the threat landscape. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The command integrates directly with the Blue Team epistemic defense infrastructure and provides structured output suitable for both human review and automated pipeline consumption.

Understanding the manipulation technique taxonomy is essential for any operator working with the platform's epistemic security subsystems. Whether configuring detection thresholds, analyzing post-incident reports, or designing new defensive postures, this command provides the foundational reference material that underpins all defensive security operations across the Prismatic Platform.

## Architecture

The `/manipulation-techniques` command is built on a layered architecture that separates taxonomy storage, retrieval logic, and presentation formatting into distinct components.

```
+---------------------+     +----------------------+     +-------------------+
|  Taxonomy Registry  |---->|  Technique Resolver  |---->|  Output Formatter |
|  (ETS-backed store) |     |  (Query + Filter)    |     |  (Table / JSON)   |
+---------------------+     +----------------------+     +-------------------+
         |                           |                            |
         v                           v                            v
+---------------------+     +----------------------+     +-------------------+
|  Red Team Findings  |     |  Blue Team Posture   |     |  Telemetry Sink   |
|  (Attack primitives)|     |  (Defense mapping)   |     |  (Usage metrics)  |
+---------------------+     +----------------------+     +-------------------+
```

The **Taxonomy Registry** stores all technique entries in an ETS table for sub-millisecond lookup performance. Each entry conforms to a standardized schema containing fields for technique identifier, category, severity, attack vector description, detection signatures, counter-measures, and last-updated timestamp. The registry is populated at application startup from YAML-based technique definition files and refreshed whenever new findings are contributed by the Red Team or external threat intelligence feeds.

The **Technique Resolver** handles query parsing, filtering, and sorting. It supports compound queries across multiple taxonomy dimensions, enabling operators to find techniques by category, severity, attack primitive, or counter-measure type. The resolver implements efficient index-based lookups against the ETS store, ensuring that even full taxonomy scans complete within single-digit milliseconds.

The **Output Formatter** renders results in the operator's preferred format. The default table format provides human-readable output with aligned columns, while the JSON format supports programmatic consumption by downstream automation, reporting pipelines, and the [Prismatic API](@/apps/prismatic-api.md) gateway.

## Usage

### Basic Taxonomy Display

```bash
# Display the complete manipulation technique taxonomy
/manipulation-techniques

# Display techniques in a specific category
/manipulation-techniques --category=truth-distortion

# Display techniques by severity level
/manipulation-techniques --severity=critical
```

### Filtered Queries

```bash
# Find techniques related to prompt injection
/manipulation-techniques --search="prompt injection"

# List all counter-measures for confidence manipulation
/manipulation-techniques --category=confidence-manipulation --show=countermeasures

# Display techniques added in the last 30 days
/manipulation-techniques --recent=30d
```

### Output Formats

```bash
# JSON output for pipeline consumption
/manipulation-techniques --format=json

# Compact summary with technique counts per category
/manipulation-techniques --summary

# Export full taxonomy for external analysis
/manipulation-techniques --export=csv --output=taxonomy-export.csv
```

### Integration with Color-Team Operations

```bash
# Show techniques relevant to a specific Red Team scenario
/manipulation-techniques --scenario=red-2024-0147

# Display techniques with active Blue Team defenses
/manipulation-techniques --defended

# List techniques without current counter-measures (gaps)
/manipulation-techniques --undefended
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--category` | String | all | Filter by technique category (truth-distortion, confidence-manipulation, signal-poisoning, drift-induction, salience-hijacking) |
| `--severity` | String | all | Filter by severity level (low, medium, high, critical) |
| `--search` | String | none | Full-text search across technique descriptions |
| `--format` | String | table | Output format (table, json, csv, markdown) |
| `--show` | String | all | Fields to display (countermeasures, signatures, vectors, metadata) |
| `--recent` | Duration | none | Show techniques added or updated within the specified period |
| `--defended` | Flag | false | Show only techniques with active counter-measures |
| `--undefended` | Flag | false | Show only techniques without counter-measures (security gaps) |
| `--scenario` | String | none | Filter techniques relevant to a specific Red Team scenario ID |
| `--summary` | Flag | false | Show category-level summary statistics only |
| `--export` | String | none | Export format for file output |
| `--output` | String | stdout | Output file path for exports |
| `--verbose` | Flag | false | Include full technique details including provenance and timestamps |

## Execution Flow

The command follows a structured execution pipeline that ensures consistent, auditable results across all invocations.

1. **Authority Validation** -- The system verifies the operator holds L2+ clearance. Lower authority levels receive a permission-denied response with guidance on requesting elevated access.

2. **Parameter Parsing** -- All command-line options are parsed and validated against the option schema. Invalid combinations (for example, `--defended` and `--undefended` simultaneously) are rejected with descriptive error messages.

3. **Taxonomy Load** -- The Technique Resolver queries the ETS-backed Taxonomy Registry, applying any filters specified by the operator. If the taxonomy has not been loaded for the current session, a fresh load from the YAML definitions is triggered.

4. **Query Execution** -- Filters are applied in order of selectivity: category first, then severity, then full-text search. This ordering minimizes the working set at each stage for optimal performance.

5. **Counter-Measure Enrichment** -- For each matched technique, the corresponding counter-measures are resolved from the Blue Team defense mapping. This enrichment step adds active defense status indicators.

6. **Output Rendering** -- Results are formatted according to the `--format` parameter and emitted to the specified output destination. Telemetry events are recorded for audit trail purposes.

7. **Telemetry Emission** -- A `[:manipulation_techniques, :query, :complete]` telemetry event is emitted with metadata including query parameters, result count, and execution duration.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Agent Execution | Executed by the `manipulation-detector` agent with full AIAD lifecycle |
| [Blue Team](@/glossary/color-teams.md) | Defense Mapping | Counter-measures linked to active Blue Team defensive postures |
| [Red Team](@/glossary/color-teams.md) | Threat Intelligence | Technique entries sourced from Red Team adversarial simulation findings |
| [Purple Team](@/glossary/color-teams.md) | Closure Analysis | Techniques tracked through Red-Blue closure loop for gap identification |
| [NABLA Infinity](@/glossary/nabla-infinity.md) | Epistemic Framework | Technique classification follows NABLA axiom compliance requirements |
| [Quality Gates](@/glossary/quality-gates.md) | Pre/Post Validation | Quality validation enforced before and after taxonomy operations |
| [Telemetry](@/glossary/telemetry.md) | Observability | All command executions emit structured telemetry events |
| [Prismatic API](@/apps/prismatic-api.md) | REST Exposure | Taxonomy available via `/api/v1/manipulation-techniques` endpoint |

## Best Practices

**Regular Taxonomy Review**: Schedule periodic reviews of the complete taxonomy (recommended monthly) to maintain awareness of newly catalogued techniques. Use the `--recent=30d` flag to focus on additions since the last review.

**Gap Analysis**: Run `/manipulation-techniques --undefended` regularly to identify techniques without active counter-measures. Each undefended technique represents a potential blind spot in the platform's epistemic defense posture.

**Scenario Correlation**: When designing new Red Team scenarios, use `--category` filtering to ensure the scenario exercises techniques across multiple attack primitives rather than concentrating on a single category.

**Export and Archive**: Export the full taxonomy before and after major updates using the `--export=json` option. This creates a versioned record that supports differential analysis and regression detection.

**Severity-Based Prioritization**: Focus defensive development effort on critical and high-severity techniques first. Use `--severity=critical --undefended` to identify the highest-priority gaps.

## Error Handling

| Error Condition | Response | Recovery |
|----------------|----------|----------|
| Insufficient authority (below L2+) | Permission denied with authority requirements | Request elevated access through standard channels |
| Taxonomy registry unavailable | Error with diagnostic details and retry guidance | Registry auto-recovers; retry after 5 seconds |
| Invalid filter combination | Descriptive validation error | Correct the filter parameters per documentation |
| Empty result set | Informational message with broadened search suggestions | Relax filters or check category/severity spelling |
| Export write failure | File system error with path details | Verify output path permissions and disk space |
| Stale taxonomy data (>24h since refresh) | Warning appended to output with last-refresh timestamp | Trigger manual refresh via `/manipulation-techniques --refresh` |

## Advanced Usage

### Taxonomy Diffing

Compare taxonomy versions to identify newly added or modified techniques between time periods:

```bash
# Show techniques added since a specific date
/manipulation-techniques --added-after=2026-01-15

# Compare two exported taxonomy snapshots
/manipulation-techniques --diff=taxonomy-v1.json,taxonomy-v2.json
```

### Custom Counter-Measure Development

When developing new counter-measures, use the taxonomy as a specification reference:

```bash
# Get detailed attack vector for a specific technique
/manipulation-techniques --id=TM-2024-0291 --verbose

# List all techniques sharing a common attack primitive
/manipulation-techniques --primitive=signal-poisoning --show=vectors,signatures
```

### Pipeline Integration

Integrate taxonomy queries into automated security pipelines:

```bash
# Check for undefended critical techniques in CI/CD
/manipulation-techniques --severity=critical --undefended --format=json | jq '.count'

# Generate weekly security gap report
/manipulation-techniques --undefended --format=markdown --output=weekly-gaps.md
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete taxonomy entries. Every technique must have a complete schema including category, severity, attack vector, detection signatures, and counter-measures (or explicit acknowledgment of gaps). Incomplete entries are rejected at ingestion time.
- **NO DOUBTS**: Full investigation of each technique before cataloguing. Evidence-based classification with provenance tracking ensures every taxonomy entry is traceable to its source -- whether Red Team simulation, academic research, or production incident analysis.

The taxonomy itself embodies the [NABLA Infinity](@/glossary/nabla-infinity.md) principle of **Contradiction Preservation**: when multiple sources provide conflicting severity assessments for a technique, both assessments are preserved with their respective provenance rather than being collapsed into a single value.

## Related Commands

- [/manipulation-detect](@/commands/manipulation-detect.md) - Detect manipulation attempts using epistemic analysis
- [/manipulation-protect](@/commands/manipulation-protect.md) - Activate manipulation protection defenses
- [/manipulation-dashboard](@/commands/manipulation-dashboard.md) - Manipulation detection dashboard with threat indicators
- [/emergency](@/commands/emergency.md) - Emergency response and crisis management activation
- [/archer-supreme](@/commands/archer-supreme.md) - Supreme authority activation for platform-wide operations
- [/dark-ops](@/commands/dark-ops.md) - NABLA structural crisis detection and dark operations analysis

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)