+++
title = "/person-investigate"
weight = 700
[extra]
category = "Intelligence"
description = "Czech Registry person investigation with ARCHER SUPREME protocols"
syntax = "/person-investigate [options]"
authority = "L3"
agent = "czech-registry-person-investigator"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1266
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["person-investigate", "Czech", "Registry", "ARCHER", "SUPREME", "commands", "Intelligence", "Prismatic Platform", "Phase"]
tags = ["commands", "intelligence", "person-investigate", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/person-investigate - Prismatic Platform"
+++

## Overview

**/person-investigate** is a production command in the **Intelligence** category of the Prismatic Platform that performs comprehensive person investigations leveraging Czech public registry data with [ARCHER SUPREME](/glossary/archer-supreme/) tactical protocols. This command automates the process of gathering, correlating, and analyzing publicly available information about individuals from Czech business registries, trade registers, insolvency records, and related official data sources to produce structured intelligence reports.

The investigation engine operates by querying multiple Czech public registries -- including the Commercial Register (OR), Trade Register (RZP), Insolvency Register (ISIR), and the Register of Economic Subjects (ARES) -- and correlating results across these sources to build a comprehensive profile of an individual's business activities, corporate roles, and financial status. The cross-referencing capability is particularly valuable for due diligence, compliance verification, and risk assessment in business contexts where understanding an individual's full corporate footprint is essential.

This command operates under the **L3** authority level, reflecting the sensitivity of person-related intelligence operations, and is executed by the `czech-registry-person-investigator` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The elevated authority level ensures that person investigations are conducted only by operators with appropriate clearance, maintaining ethical standards and regulatory compliance.

The [ARCHER SUPREME](/glossary/archer-supreme/) protocol integration means that person investigations follow the platform's tactical excellence framework: thorough reconnaissance, decisive analysis, and confident reporting. The investigation results include confidence scores for each data point, source provenance tracking, and temporal context showing when information was last verified against registry sources.

## Architecture

The person investigation architecture implements a federated query engine that distributes searches across multiple Czech public registry APIs and aggregates results through a correlation layer.

```
Investigation Request
        │
        v
  Query Distributor (OTP Task Supervisor)
        │
        ├── ARES API Adapter ──────> Economic Subject Data
        ├── OR API Adapter ────────> Commercial Register Data
        ├── RZP API Adapter ───────> Trade Register Data
        ├── ISIR API Adapter ──────> Insolvency Data
        ├── Justice.cz Adapter ────> Court Records
        └── DPH Registry Adapter ──> VAT Registration Data
                │
                v
        Entity Correlation Engine
        (Name matching, ICO linking, address correlation)
                │
                v
        Profile Builder
        (Deduplicated, scored, timestamped)
                │
                v
        Intelligence Report Generator
        (Structured output with confidence scores)
```

The correlation engine handles the complexity of matching person records across registries that use different data formats, name representations, and identifier systems. Fuzzy name matching with configurable thresholds accommodates variations in diacritical marks, name ordering, and transliteration. When an ICO (company identification number) is associated with a person in one registry, it is used to pull additional information from other registries, creating a comprehensive corporate footprint.

Each registry adapter is implemented as an independent OTP process with its own supervision, connection pooling, and rate limiting. This isolation ensures that a failure in one registry query does not affect the others, and rate limits imposed by individual registries are respected without slowing down the overall investigation.

## Usage

### Basic Person Investigation

```bash
# Investigate person by name
/person-investigate --name "Jan Novak"

# Investigate with birth date for disambiguation
/person-investigate --name "Jan Novak" --birth-date 1985-03-15

# Investigate by ICO (company ID) association
/person-investigate --ico 12345678

# Quick check with minimal output
/person-investigate --name "Jan Novak" --quick
```

### Advanced Investigation

```bash
# Full investigation with all registry sources
/person-investigate --name "Jan Novak" --depth full --all-registries

# Investigation with corporate network mapping
/person-investigate --name "Jan Novak" --network --depth 2

# Investigation with insolvency and litigation focus
/person-investigate --name "Jan Novak" --focus financial-risk

# Historical investigation including dissolved companies
/person-investigate --name "Jan Novak" --include-historical
```

### Batch Investigation

```bash
# Investigate multiple persons from file
/person-investigate --batch persons.csv --output results/

# Due diligence batch with compliance report
/person-investigate --batch board-members.csv --compliance-report --format pdf
```

### Report Generation

```bash
# Generate detailed PDF report
/person-investigate --name "Jan Novak" --report --format pdf --output investigation.pdf

# Generate structured JSON for system integration
/person-investigate --name "Jan Novak" --format json --output person-data.json

# Executive summary for due diligence
/person-investigate --name "Jan Novak" --report --type executive
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--name` | string | required | Person name to investigate |
| `--birth-date` | date | none | Birth date for disambiguation |
| `--ico` | string | none | Company ICO to find associated persons |
| `--depth` | enum | standard | Investigation depth: quick, standard, full |
| `--all-registries` | flag | false | Query all available registries |
| `--network` | flag | false | Map corporate network connections |
| `--network-depth` | integer | 1 | Network traversal depth (1-3) |
| `--focus` | enum | general | Investigation focus: general, financial-risk, compliance, corporate |
| `--include-historical` | flag | false | Include dissolved/historical entities |
| `--batch` | file | none | CSV file for batch investigation |
| `--compliance-report` | flag | false | Generate compliance-formatted report |
| `--report` | flag | false | Generate formatted report |
| `--type` | enum | detailed | Report type: detailed, executive, compliance |
| `--format` | enum | table | Output: table, json, html, pdf |
| `--output` | path | stdout | Output file path |
| `--quick` | flag | false | Quick check with minimal sources |
| `--confidence-threshold` | float | 0.7 | Minimum confidence for result inclusion |

## Execution Flow

The person investigation follows a structured multi-phase pipeline that ensures thoroughness while maintaining performance.

**Phase 1 -- Query Preparation** (< 1 second): The input name is normalized (diacritical marks standardized, name variants generated) and search parameters are constructed for each registry adapter. If a birth date is provided, it is incorporated into the query to improve precision and reduce false positives.

**Phase 2 -- Federated Registry Query** (2-15 seconds): Queries are dispatched concurrently to all configured registry adapters. Each adapter handles its own connection management, rate limiting, and response parsing. Results are streamed back as they become available, allowing the correlation engine to begin processing before all queries complete.

**Phase 3 -- Entity Correlation** (1-5 seconds): Raw results from multiple registries are correlated using a multi-factor matching algorithm. Matching factors include exact name matches, ICO cross-references, address similarity, date correlations, and role patterns. Each match is assigned a confidence score reflecting the strength of the correlation evidence.

**Phase 4 -- Profile Construction** (< 2 seconds): Correlated data is assembled into a unified person profile that includes all discovered corporate roles (statutory member, shareholder, sole proprietor), active and historical company associations, registered addresses, and financial indicators (insolvency records, VAT registration status).

**Phase 5 -- Network Mapping** (optional, 5-30 seconds): If `--network` is enabled, the investigation expands to discover corporate network connections -- other persons associated with the same companies, shared addresses, and ownership chains. This produces a graph structure showing the individual's position within a broader corporate network.

**Phase 6 -- Report Generation** (< 2 seconds): The final intelligence report is rendered in the requested format with confidence scores, source provenance, and temporal context for each data point.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Execution | `czech-registry-person-investigator` orchestration |
| [/investigate](/commands/investigate/) | Cross-domain | Person data feeds into broader OSINT investigations |
| [/presales](/commands/presales/) | Downstream | Person intelligence informs presales due diligence |
| [Prismatic Storage](/apps/prismatic-storage/) | Persistence | Investigation results, cached registry data |
| [ARCHER SUPREME](/glossary/archer-supreme/) | Protocol | Tactical investigation framework |
| [Telemetry](/glossary/telemetry/) | Observability | Query timing, registry availability, result quality |
| [Quality Gates](/glossary/quality-gates/) | Validation | Result completeness and accuracy checks |
| [AIAD Registry](/glossary/aiad/) | Discovery | Command specification and routing |

## Best Practices

**Provide Disambiguation Data**: Czech names frequently have multiple matches across registries. Always provide birth date or ICO when available to improve result precision and reduce manual disambiguation effort.

**Start with Standard Depth**: The `--depth standard` setting balances thoroughness with speed. Use `--depth full` only when comprehensive due diligence is required, as it queries all registries and may take significantly longer.

**Verify Confidence Scores**: Results with confidence scores below 0.8 should be manually verified. The correlation engine assigns lower scores when matching relies on name similarity alone without corroborating identifiers.

**Use Network Mapping for Due Diligence**: The `--network` option reveals hidden corporate connections that may not be apparent from individual registry lookups. This is particularly valuable for anti-money laundering (AML) and know-your-customer (KYC) compliance requirements.

**Cache Results for Batch Operations**: When investigating multiple persons associated with the same companies, the registry cache significantly reduces query volume and improves performance.

## Error Handling

| Error Condition | Behavior | Recovery |
|----------------|----------|----------|
| Registry API unavailable | Skip with warning, use cached data | Retry after registry recovery |
| Name not found | Empty result with source status | Verify spelling, try name variants |
| Rate limit exceeded | Automatic backoff and retry | Wait or reduce batch size |
| Ambiguous results | All candidates returned with scores | Provide birth date or ICO |
| Network timeout | Partial results with warning | Reduce `--network-depth` |
| Invalid ICO format | Validation error | Verify 8-digit ICO format |

## Advanced Usage

### Compliance-Ready Due Diligence

```bash
# Full KYC investigation with compliance packaging
/person-investigate --name "Jan Novak" --birth-date 1985-03-15 \
  --depth full --network --compliance-report --format pdf \
  --output kyc/jan-novak-due-diligence.pdf
```

### Corporate Network Analysis

```bash
# Map corporate network to depth 3
/person-investigate --name "Jan Novak" --network --network-depth 3 \
  --format json --output network-graph.json

# Visualize network (feeds into dashboard)
/person-investigate --name "Jan Novak" --network --dashboard
```

### Integration with OSINT Pipeline

```bash
# Feed person data into full OSINT investigation
/person-investigate --name "Jan Novak" --format json | /investigate --stdin --type person

# Cross-reference with email intelligence
/person-investigate --name "Jan Novak" --ico 12345678 \
  --cross-reference email --domain example.com
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Every configured registry is queried. Missing or unreachable data sources are explicitly reported rather than silently omitted. Correlation confidence is calculated rigorously without artificial inflation.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every data point in the intelligence report includes source provenance and timestamp. The [NABLA](/glossary/nabla-infinity/) axiom of Signal Plurality is enforced: person profiles require corroboration from multiple independent registry sources before high-confidence assertions are made.

The [ARCHER SUPREME](/glossary/archer-supreme/) protocol adds tactical discipline to investigations: thorough reconnaissance across all available sources, decisive analysis that draws clear conclusions from available evidence, and confident reporting that clearly distinguishes between confirmed facts, probable associations, and speculative connections.

## Related Commands

- [/investigate](/commands/investigate/) - Launch comprehensive [OSINT](/glossary/osint/) investigation across 121+ sources
- [/email-osint](/commands/email-osint/) - Email-based OSINT gathering with breach correlation and social profiling
- [/google-hacking](/commands/google-hacking/) - Google dorking and advanced search intelligence extraction
- [/agents](/commands/agents/) - List and manage agent ecosystem with status monitoring
- [/commit](/commands/commit/) - Smart commit with quality gates and conventional format
- [/connect](/commands/connect/) - MCP server connection management across 14+ servers

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)