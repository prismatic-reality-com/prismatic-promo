+++
title = "/delta-force"
weight = 640
[extra]
category = "Intelligence"
description = "Precision strike intelligence with targeted collection and analysis"
syntax = "/delta-force [options]"
authority = "L3"
agent = "delta-force-operator"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 894
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["delta-force", "Precision", "commands", "Intelligence", "Prismatic Platform", "OSINT", "Delta Force", "Multi", "Zero"]
tags = ["commands", "intelligence", "delta-force", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/delta-force - Prismatic Platform"
+++

## Overview

The **/delta-force** command executes precision [OSINT](@/glossary/osint.md) (Open Source Intelligence) operations with surgical accuracy and zero collateral damage. While the broader `/investigate` command provides comprehensive multi-source intelligence gathering, Delta Force specializes in targeted, high-precision intelligence extraction against specific subjects -- individuals, companies, or entities -- where accuracy, evidence quality, and operational security take precedence over breadth of coverage.

The command draws its operational philosophy from precision intelligence doctrine: identify the target with absolute certainty, collect only relevant intelligence through verified sources, cross-reference all findings through multi-source validation, and deliver court-admissible evidence with 95%+ confidence thresholds. Every piece of intelligence produced by Delta Force carries a confidence score and source provenance chain, enabling operators to distinguish between verified facts, corroborated claims, and unconfirmed indicators.

This command operates under the **L3** authority level and is executed by the `delta-force-operator` agent, with support from the `intel-osint-specialist` and `elixir-core-specialist` agents for multi-source coordination. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The L3 authority level reflects the sensitive nature of precision intelligence operations, which require demonstrated competence and authorization.

Delta Force operations are organized around five core capabilities: Executive Background Analysis (leadership profiling), Company Financial Forensics (financial intelligence), Legal Entity Deep Dive (ownership structure analysis), Regulatory Compliance Audit (compliance verification), and Risk Assessment Matrix (threat profile development). Each capability follows a structured execution protocol with defined phases, quality standards, and deliverable requirements.

## Architecture

### Precision Intelligence Pipeline

```
TARGET ACQUISITION
    |
    v
PHASE 1: TARGET VERIFICATION (15-30 min)
    +-- Precise target identification
    +-- Intelligence requirements specification
    +-- Operational security protocol activation
    +-- Evidence chain initialization
    |
    v
PHASE 2: SURGICAL COLLECTION (30-90 min)
    +-- Multi-source precision gathering
    +-- Real-time data verification
    +-- Cross-reference validation
    +-- Evidence quality assurance
    |
    v
PHASE 3: PRECISION ANALYSIS (30-60 min)
    +-- Advanced analytical processing
    +-- Pattern recognition and correlation
    +-- Risk assessment and evaluation
    +-- Confidence scoring
    |
    v
PHASE 4: REPORT GENERATION (15-30 min)
    +-- Comprehensive intelligence report
    +-- Court-admissible evidence compilation
    +-- Strategic recommendations
    +-- Mission success verification
```

### Multi-Engine Search Architecture

```
SEARCH ENGINE ORCHESTRATION
============================

Primary Engines:
    +-- Google (Western results, broad coverage)
    +-- DuckDuckGo (Unfiltered, privacy-focused)
    +-- Bing (Microsoft ecosystem integration)
    +-- Yandex (Eastern European sources)

Specialized Engines:
    +-- Shodan (Infrastructure intelligence)
    +-- Wayback Machine (Historical snapshots)
    +-- Business registries (Corporate data)
    +-- Patent databases (Intellectual property)

Czech-Specific Sources:
    +-- ARES (Administrative Register)
    +-- Justice.cz (Commercial Register)
    +-- CUZK (Cadastral Registry)
    +-- Jobs.cz / LMC.eu (Employment records)
```

## Usage

### Executive Background Check

```bash
# Comprehensive executive profiling
/delta-force "John Smith CEO" background-check

# Quick executive verification
/delta-force "Jane Doe CTO" executive-verify

# Leadership team analysis
/delta-force "Acme Corp leadership" executive-analysis
```

### Company Financial Analysis

```bash
# Full financial forensics
/delta-force "Acme Corporation" financial-analysis

# Ownership structure investigation
/delta-force "ICO:12345678" ownership-investigation

# Financial health assessment
/delta-force "Target Company s.r.o." financial-health
```

### Legal Entity Investigation

```bash
# Complex ownership structure analysis
/delta-force "Offshore Holdings Ltd" beneficial-ownership

# Multi-jurisdictional entity analysis
/delta-force "Cross-Border Corp" legal-entity-deep-dive

# Regulatory filing analysis
/delta-force "Target Entity" regulatory-compliance
```

### Risk Assessment

```bash
# Complete risk profile development
/delta-force "potential-partner-company" risk-assessment

# Due diligence investigation
/delta-force "acquisition-target" due-diligence

# Default operation (background check)
/delta-force "target-subject"
```

## Options & Parameters

| Parameter | Position | Required | Type | Default | Description |
|-----------|----------|----------|------|---------|-------------|
| **target** | $1 | Yes | string | -- | Target subject (person, company, entity identifier) |
| **operation** | $2 | No | string | `background-check` | Operation type (see Surgical Operation Types below) |

### Surgical Operation Types

| Operation | Target Profile | Deliverable |
|-----------|---------------|-------------|
| `background-check` | Individual executive or decision maker | Comprehensive executive intelligence profile |
| `executive-verify` | Individual executive (quick verification) | Verification report with confidence scores |
| `financial-analysis` | Corporate entity | Complete financial intelligence assessment |
| `ownership-investigation` | Complex corporate structures | Beneficial ownership transparency report |
| `legal-entity-deep-dive` | Legal entity across jurisdictions | Multi-jurisdictional entity analysis |
| `regulatory-compliance` | Regulated entity | Compliance verification report |
| `risk-assessment` | Any target subject | Complete risk profile with threat evaluation |
| `due-diligence` | Acquisition or partnership target | Comprehensive due diligence package |

## Execution Flow

```
/delta-force [target] [operation]
    |
    v
PHASE 1: TARGET ACQUISITION AND VERIFICATION (15-30 min)
    +-- Parse target identifier
    +-- Determine target type (person/company/entity)
    +-- Verify target existence across primary sources
    +-- Establish operational security protocols
    +-- Initialize evidence chain with provenance tracking
    +-- Define intelligence collection requirements
    |
    v
PHASE 2: SURGICAL INTELLIGENCE COLLECTION (30-90 min)
    +-- Multi-engine search orchestration
    +-- Business registry queries (ARES, Justice.cz, CUZK)
    +-- Professional network analysis (LinkedIn, XING)
    +-- Financial data gathering (filings, reports)
    +-- Property and asset searches
    +-- Real-time cross-reference verification
    +-- Source credibility assessment
    |
    v
PHASE 3: PRECISION ANALYSIS AND SYNTHESIS (30-60 min)
    +-- Pattern recognition across collected data
    +-- Relationship mapping and correlation analysis
    +-- Risk indicator identification
    +-- Confidence scoring per data point
    +-- Gap analysis (what is missing and why)
    +-- Anomaly detection (inconsistencies in data)
    |
    v
PHASE 4: SURGICAL STRIKE REPORT GENERATION (15-30 min)
    +-- Compile verified intelligence into structured report
    +-- Generate evidence appendix with source citations
    +-- Produce strategic recommendations
    +-- Calculate overall confidence score
    +-- Validate report against quality standards
    +-- Deliver mission success verification
```

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Multi-agent coordination | delta-force-operator, intel-osint-specialist, elixir-core-specialist |
| [AIAD](@/glossary/aiad.md) Registry | Command specification | Intelligence category, L3 authority |
| [Quality Gates](@/glossary/quality-gates.md) | Evidence quality validation | Court-admissible evidence standards |
| [Telemetry](@/glossary/telemetry.md) | Operation [metrics](@/glossary/metrics.md) | Collection time, source count, confidence scores |
| Czech Registries | Business intelligence | ARES, Justice.cz, CUZK integration |
| [OSINT](@/glossary/osint.md) Pipeline | Intelligence integration | Feeds into and from broader OSINT ecosystem |

### Integration with Universal Investigation

```bash
# Delta Force can be invoked through the universal investigation command
/investigate target-subject comprehensive

# Or directly for maximum precision
/delta-force target-subject surgical-precision
```

The `/investigate` command automatically applies precision protocols when surgical accuracy is required, while `/delta-force` provides maximum precision capabilities for targeted intelligence extraction.

## Best Practices

1. **Define precise targets** -- The more specific the target identifier, the higher the precision. Use full names with organizational context, or entity identifiers like ICO numbers for Czech companies.

2. **Start with background-check** -- The default operation establishes a baseline profile before deeper investigations. Use it to verify target identity before investing in financial or legal analysis.

3. **Cross-reference all findings** -- Delta Force automatically applies multi-source verification, but review the confidence scores. Findings below 90% confidence warrant additional investigation.

4. **Maintain operational security** -- Delta Force implements stealth protocols automatically. Do not supplement with additional visible searches that could alert the target.

5. **Preserve evidence chains** -- Every finding includes source provenance. Maintain these chains for any intelligence that may be used in decision-making or legal proceedings.

6. **Use appropriate operation types** -- Financial analysis and ownership investigation require different source access and processing. Choose the operation type that matches your intelligence requirement.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `TARGET_NOT_FOUND` | Target cannot be verified in any primary source | Refine target description; check spelling; try alternative identifiers |
| `INSUFFICIENT_SOURCES` | Fewer than 3 independent sources available | Expand search scope; check source availability |
| `CONFIDENCE_BELOW_THRESHOLD` | Overall confidence below 95% | Flag low-confidence findings; request manual verification |
| `OPSEC_COMPROMISE` | Operational security risk detected | Halt collection; assess exposure; switch collection vectors |
| `SOURCE_RATE_LIMIT` | External source rate limiting triggered | Automatic backoff; retry with staggered timing |
| `AUTHORITY_INSUFFICIENT` | Operator below L3 authority | Escalate to authorized operator |

## Advanced Usage

### Precision Intelligence Configuration

```elixir
# Configure precision operation parameters
{:ok, result} = PrismaticIntelligence.DeltaForce.execute(%{
  target: "Acme Corporation s.r.o.",
  operation: :ownership_investigation,
  precision_level: :surgical,
  confidence_threshold: 0.95,
  max_collection_time: :timer.hours(2),
  sources: [:ares, :justice, :cuzk, :linkedin, :google],
  evidence_standard: :court_admissible
})
```

### Quality Assurance Standards

| Standard | Requirement |
|----------|-------------|
| **Evidence Quality** | Court admissible with full provenance |
| **Source Verification** | Multi-source cross-reference (3+ independent sources) |
| **Operational Security** | Zero attribution risk |
| **Precision Level** | Surgical accuracy on all data points |
| **Confidence Threshold** | 95%+ overall, flagged if individual points below 90% |
| **Collateral Damage** | Zero -- no exposure of non-target subjects |

### Success Metrics

| Metric | Target |
|--------|--------|
| **Precision Accuracy** | 100% verified data points |
| **Collateral Damage** | 0% non-target exposure |
| **Evidence Quality** | Court admissible standard |
| **Operation Speed** | Within phase time windows |
| **Security Compromise** | Zero attribution |

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for unverified intelligence. Every finding must meet court-admissible evidence standards. No approximations, no assumptions presented as facts, no intelligence gaps hidden in vague language.
- **NO DOUBTS**: Full multi-source verification before any finding is reported. Confidence scoring on every data point. Source provenance tracking from collection through analysis to delivery. NABLA signal plurality enforced through independent source requirements.

## Related Commands

- [/investigate](@/commands/investigate.md) - Launch comprehensive [OSINT](@/glossary/osint.md) investigation across 121+ sources
- [/email-osint](@/commands/email-osint.md) - Email-based OSINT gathering with breach correlation and social profiling
- [/google-hacking](@/commands/google-hacking.md) - Google dorking and advanced search intelligence extraction
- [/ghost-recon](@/commands/ghost-recon.md) - Maximum stealth intelligence operations
- [/osint-engines](@/commands/osint-engines.md) - Multi-engine OSINT source coordination and parallel querying
- [/czech-autocrawler-supreme](@/commands/czech-autocrawler-supreme.md) - Czech Registry intelligence with 3NL processing

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)