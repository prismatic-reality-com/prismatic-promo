+++
title = "/siege-master"
weight = 680
[extra]
category = "Intelligence"
description = "Comprehensive intelligence siege with full-spectrum coverage"
syntax = "/siege-master [options]"
authority = "L3"
agent = "siege-master-operator"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1161
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["siege-master", "Comprehensive", "commands", "Intelligence", "Prismatic Platform", "PrismaticOsint", "Collection Vector"]
tags = ["commands", "intelligence", "siege-master", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/siege-master - Prismatic Platform"
+++

## Overview

**/siege-master** is a production command in the **Intelligence** category of the Prismatic Platform that executes comprehensive intelligence siege operations with full-spectrum coverage. Unlike targeted intelligence commands such as [/investigate](@/commands/investigate.md) or [/email-osint](@/commands/email-osint.md) that focus on specific data types, `/siege-master` orchestrates a coordinated multi-vector intelligence collection campaign that simultaneously queries all available data sources, cross-correlates findings in real time, and produces a unified intelligence product that would require dozens of individual queries to assemble manually.

The "siege" metaphor reflects the command's operational philosophy: rather than probing a target through a single vector and hoping for results, it surrounds the target with overlapping collection methodologies that leave no information gap unexplored. DNS records, WHOIS data, certificate transparency logs, web archives, social media footprints, code repositories, breach databases, dark web mentions, and infrastructure fingerprints are all queried in parallel, with findings from each source used to generate new queries for other sources in a recursive enrichment loop.

This command operates under the **L3** authority level and is executed by the `siege-master-operator` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The L3 authority requirement ensures that siege operations, which can be resource-intensive and produce large volumes of data, are initiated only by operators with strategic command authority.

The command produces structured intelligence reports in multiple formats, suitable for security assessments, competitive intelligence briefings, due diligence investigations, and attack surface mapping. All operations are conducted through publicly available and authorized data sources, with strict adherence to ethical intelligence collection standards and applicable privacy regulations.

## Architecture

The siege master system coordinates multiple intelligence collection agents through a central orchestration layer that manages query scheduling, result correlation, and report generation.

```
Target Specification
       |
       v
  [Target Decomposition]     -- Extract queryable identifiers
       |
       v
  [Collection Orchestrator]   -- Parallel multi-vector queries
       |                |                |              |
       v                v                v              v
  [DNS/Infra]     [Web/Social]    [Code/Tech]    [Dark/Breach]
       |                |                |              |
       v                v                v              v
  [Cross-Correlation Engine]  -- Link findings across vectors
       |
       v
  [Enrichment Loop]           -- Generate new queries from findings
       |
       v
  [Report Generator]          -- Structured intelligence product
```

| Component | Purpose | Implementation |
|-----------|---------|----------------|
| **Target Decomposition** | Breaks target identifiers into queryable components (domains, IPs, emails, names) | `PrismaticOsint.TargetDecomposer` |
| **Collection Orchestrator** | Manages parallel query execution across all intelligence vectors | `PrismaticOsint.SiegeOrchestrator` |
| **Cross-Correlation Engine** | Links findings from different sources to build unified entity profiles | `PrismaticOsint.Correlator` |
| **Enrichment Loop** | Uses initial findings to generate secondary queries for deeper coverage | `PrismaticOsint.EnrichmentEngine` |
| **Report Generator** | Produces structured reports in multiple formats with confidence scoring | `PrismaticOsint.ReportGenerator` |

## Usage

### Basic Siege Operations

```bash
# Full siege on a domain target
/siege-master target:example.com

# Siege on an organization
/siege-master target:"Acme Corporation" type:organization

# Siege on a person
/siege-master target:"John Doe" type:person context:cybersecurity

# Quick siege with reduced depth (faster, less comprehensive)
/siege-master target:example.com --quick
```

### Scoped Operations

```bash
# Infrastructure-focused siege
/siege-master target:example.com --vectors infrastructure,dns,certificates

# Social and web presence siege
/siege-master target:"@username" --vectors social,web,code

# Security-focused siege (attack surface mapping)
/siege-master target:example.com --profile security

# Competitive intelligence siege
/siege-master target:"Competitor Corp" --profile competitive
```

### Advanced Operations

```bash
# Siege with maximum enrichment depth
/siege-master target:example.com --depth maximum --enrich 3

# Siege with specific output format
/siege-master target:example.com --output json --file siege-report.json

# Siege with progress streaming
/siege-master target:example.com --stream

# Resume an interrupted siege
/siege-master --resume siege-2026-02-15-001
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `target` | string | required | Target identifier: domain, email, organization name, person name, IP address |
| `type` | string | auto-detect | Target type: `domain`, `organization`, `person`, `email`, `ip`, `username` |
| `--vectors` | string | `all` | Comma-separated collection vectors to use |
| `--profile` | string | `comprehensive` | Preset profile: `comprehensive`, `security`, `competitive`, `due-diligence`, `quick` |
| `--depth` | string | `standard` | Collection depth: `shallow`, `standard`, `deep`, `maximum` |
| `--enrich` | integer | `2` | Number of enrichment loop iterations (0-5) |
| `--output` | string | `markdown` | Output format: `markdown`, `json`, `html`, `pdf` |
| `--file` | string | auto-generated | Output file path |
| `--stream` | flag | false | Stream results as they are collected |
| `--quick` | flag | false | Quick mode: reduced depth, no enrichment loops |
| `--resume` | string | - | Resume a previously interrupted siege by ID |
| `--timeout` | duration | `10m` | Maximum execution time per vector |
| `context` | string | - | Additional context to guide collection focus |

## Execution Flow

1. **Target Decomposition** -- Parse the target specification and extract all queryable identifiers. A domain target yields: domain name, potential subdomains, associated email patterns, organization name, registrant information. A person target yields: name variations, potential email addresses, social media username patterns.

2. **Vector Selection** -- Based on the target type and selected profile, determine which collection vectors to activate. The `comprehensive` profile activates all available vectors; focused profiles activate subsets.

3. **Parallel Collection** -- Launch concurrent queries across all selected vectors. Each vector operates independently with its own timeout and retry logic. Partial results are available as soon as any vector completes.

4. **Cross-Correlation (Round 1)** -- As initial results arrive, the correlation engine links findings across vectors. An IP address found in DNS records is linked to infrastructure data; an email found in WHOIS is linked to breach database results.

5. **Enrichment Loop** -- Findings from Round 1 generate new queries. A previously unknown subdomain triggers additional DNS and certificate queries. A discovered email address triggers breach and social media lookups. This loop repeats up to `--enrich` iterations.

6. **Confidence Scoring** -- Each finding is assigned a confidence score based on source reliability, corroboration across vectors, and data freshness. Findings confirmed by 3+ independent sources receive high confidence; single-source findings receive low confidence.

7. **Report Generation** -- Compile all findings into a structured intelligence report organized by entity, with cross-references, confidence scores, and collection metadata.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/investigate](@/commands/investigate.md) | Collection Vector | Leverages the investigation engine for deep-dive queries |
| [/email-osint](@/commands/email-osint.md) | Collection Vector | Email-specific intelligence gathering |
| [/google-hacking](@/commands/google-hacking.md) | Collection Vector | Advanced search engine intelligence |
| [/web-crawler](@/commands/web-crawler.md) | Collection Vector | Automated web content extraction |
| [Prismatic Perimeter](@/apps/prismatic-perimeter.md) | Attack Surface | Feeds findings into EASM asset inventory |
| [Telemetry](@/glossary/telemetry.md) | Observability | Collection progress and performance metrics |
| [Quality Gates](@/glossary/quality-gates.md) | Validation | Report quality validation before delivery |

## Best Practices

**Target Specification Precision**: Provide the most specific target identifier available. `target:example.com` produces more focused results than `target:"Example Company"`. When investigating organizations, start with the primary domain and let enrichment discover related assets.

**Profile Selection**: Use focused profiles (`security`, `competitive`) rather than `comprehensive` when you know what you need. Comprehensive sieges are resource-intensive and produce large reports that may contain more information than is actionable for a specific use case.

**Enrichment Depth**: The default enrichment depth of 2 provides good coverage without excessive runtime. Increase to 3-5 only when investigating complex organizations with many subsidiaries or when mapping large infrastructure footprints.

**Result Verification**: Always verify critical findings through independent channels before acting on them. The confidence scoring helps prioritize which findings need manual verification, but automated intelligence collection can produce false positives, especially in cross-correlation.

**Ethical Considerations**: Only conduct siege operations against targets where you have authorization or legitimate purpose. The command operates through publicly available data sources, but the aggregation of public information can still raise privacy concerns.

## Error Handling

| Error Condition | Response | Recovery |
|----------------|----------|----------|
| Target not resolvable | Attempt alternative interpretations, report if none succeed | Refine target specification with type and context |
| Vector timeout | Mark vector as incomplete, continue with available results | Use `--resume` to retry timed-out vectors |
| Rate limiting on data source | Back off and retry, mark findings as potentially incomplete | Wait and retry, or exclude the rate-limited source |
| Enrichment loop explosion | Cap at maximum iteration count, warn about breadth | Reduce `--enrich` depth or scope with `--vectors` |
| Report generation failure | Save raw findings for manual report assembly | Export raw data with `--output json` |
| Network connectivity loss | Save progress, enable resume | Use `--resume` with the siege ID |

## Advanced Usage

### Continuous Monitoring Siege

```bash
# Set up recurring siege for ongoing monitoring
/siege-master target:example.com --profile security --schedule weekly

# Compare current siege with previous results
/siege-master target:example.com --diff siege-2026-02-08-001

# Generate delta report (changes since last siege)
/siege-master target:example.com --delta --since 2026-02-01
```

### Multi-Target Campaigns

```bash
# Siege multiple targets in a coordinated campaign
/siege-master --campaign targets.txt --profile security

# targets.txt format:
# example.com domain
# 192.168.1.0/24 network
# "Acme Corp" organization
```

### Integration with Perimeter

```bash
# Feed siege results directly into Perimeter asset inventory
/siege-master target:example.com --profile security --feed-perimeter

# Generate Perimeter-compatible asset manifest
/siege-master target:example.com --output perimeter-manifest
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Intelligence siege operations execute against all selected vectors without skipping difficult or slow sources. Every vector must complete or explicitly time out. Partial results are clearly marked as incomplete so that consumers know where coverage gaps exist.
- **NO DOUBTS**: All findings include confidence scores, source attribution, and collection timestamps. The [NABLA Infinity](@/glossary/nabla-infinity.md) axioms of Signal Plurality and Provenance Mandatory are enforced -- no finding is reported without source attribution, and high-confidence assessments require corroboration from multiple independent sources.

## Related Commands

- [/investigate](@/commands/investigate.md) - Launch comprehensive [OSINT](@/glossary/osint.md) investigation across 121+ sources
- [/email-osint](@/commands/email-osint.md) - Email-based OSINT gathering with breach correlation and social profiling
- [/google-hacking](@/commands/google-hacking.md) - Google dorking and advanced search intelligence extraction
- [/web-crawler](@/commands/web-crawler.md) - Automated web crawling and structured data extraction
- [/ghost-recon](@/commands/ghost-recon.md) - Stealth reconnaissance and passive intelligence collection
- [/delta-force](@/commands/delta-force.md) - Precision tactical intelligence operations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)