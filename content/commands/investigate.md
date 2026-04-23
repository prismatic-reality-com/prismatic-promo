+++
title = "/investigate"
weight = 590
[extra]
category = "Intelligence"
description = "Launch comprehensive OSINT investigation across 121+ sources"
syntax = "/investigate [options]"
authority = "L3+"
agent = "sig-osint-commander"
status = "Production"
usage = "high"
keywords = ["OSINT investigation command", "multi-source intelligence gathering", "comprehensive entity investigation", "121 OSINT sources", "automated intelligence collection", "domain email IP investigation", "sig-osint-commander agent", "open source intelligence automation"]
tags = ["intelligence", "osint", "investigation", "commands"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1145
date_created = "2026-02-23"
date_modified = "2026-02-23"
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/investigate - Prismatic Platform"
+++

## Overview

**/investigate** is a production command in the **Intelligence** category of the Prismatic Platform that launches comprehensive Open Source Intelligence ([OSINT](@/glossary/osint.md)) investigations across 121+ data sources simultaneously. This is the platform's primary intelligence collection command, orchestrating a fleet of specialized collection agents to build a complete intelligence picture of any target entity -- whether a person, organization, domain, email address, IP address, or phone number.

This command operates under the **L3+** authority level and is executed by the `sig-osint-commander` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The L3+ authority level requires elevated clearance and reflects the power and sensitivity of comprehensive intelligence collection. The sig-osint-commander agent inherits capabilities from the GARDEN legacy's Sig project, which pioneered multi-source OSINT orchestration with over 250 provider adapters.

The `/investigate` command is the highest-level entry point for intelligence operations. It automatically selects and coordinates specialized sub-commands ([/email-osint](@/commands/email-osint.md), [/ghost-recon](@/commands/ghost-recon.md), [/google-hacking](@/commands/google-hacking.md)) based on the target type and investigation scope, eliminating the need for operators to manually compose collection pipelines.

## Architecture

The investigation system is architected as a hierarchical command structure with the sig-osint-commander at the apex coordinating specialized collection teams.

### Command Hierarchy

```
/investigate (sig-osint-commander)
    |
    +-- /email-osint (email-intelligence-specialist)
    |     |-- Breach databases
    |     |-- Social media
    |     +-- Professional networks
    |
    +-- /ghost-recon (ghost-recon-operator)
    |     |-- DNS intelligence
    |     |-- Certificate transparency
    |     +-- Infrastructure scanning
    |
    +-- /google-hacking (google-hacking-specialist)
    |     |-- Search engine dorking
    |     |-- Cached content
    |     +-- Exposed documents
    |
    +-- /osint-engines (osint-engine-coordinator)
          |-- Multi-engine coordination
          |-- Parallel querying
          +-- Result aggregation
```

### Source Categories

| Category | Source Count | Key Sources | Data Types |
|----------|-------------|-------------|------------|
| **Social Media** | 25+ | LinkedIn, Twitter/X, Facebook, GitHub | Profiles, posts, connections |
| **Breach Databases** | 10+ | HIBP, DeHashed, LeakCheck | Credentials, PII exposure |
| **Domain/DNS** | 15+ | WHOIS, DNS, crt.sh, Shodan | Infrastructure, certificates |
| **Search Engines** | 8+ | Google, Bing, DuckDuckGo, Yandex | Web mentions, cached content |
| **Public Records** | 20+ | Court records, company registries | Legal, financial, corporate |
| **Code Repositories** | 5+ | GitHub, GitLab, Bitbucket | Code, commits, issues |
| **Dark Web** | 10+ | Monitoring services, paste sites | Leaked data, threat indicators |
| **Geolocation** | 8+ | IP geolocation, cell tower data | Physical location estimates |
| **Financial** | 10+ | SEC filings, company registries | Financial data, ownership |
| **Specialized** | 10+ | IoT search, certificate logs | Domain-specific intelligence |

### Collection Orchestration

The commander orchestrates collection in three waves.

| Wave | Priority | Sources | Duration |
|------|----------|---------|----------|
| **Wave 1** | Critical | Breach DBs, DNS, WHOIS, certificates | 5-15 seconds |
| **Wave 2** | Standard | Social media, search engines, repositories | 15-45 seconds |
| **Wave 3** | Extended | Public records, financial, specialized | 45-120 seconds |

## Usage

```bash
# Investigate a person by name
/investigate "John Doe" --type=person

# Investigate an organization
/investigate "Acme Corporation" --type=organization

# Investigate a domain
/investigate example.com --type=domain

# Investigate an email address
/investigate target@example.com --type=email

# Full investigation with all sources
/investigate target@example.com --depth=full

# Quick triage investigation
/investigate example.com --depth=quick

# Investigation with specific focus
/investigate example.com --focus=security
/investigate example.com --focus=infrastructure
/investigate example.com --focus=social

# Export results for external analysis
/investigate example.com --format=json --output=investigation.json

# Investigation with monitoring
/investigate example.com --monitor --interval=weekly
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `target` | string | required | Investigation target (positional argument) |
| `--type` | string | auto-detect | Target type: person, organization, domain, email, ip, phone |
| `--depth` | string | standard | Investigation depth: quick, standard, full, exhaustive |
| `--focus` | string | all | Investigation focus: all, security, infrastructure, social, financial, legal |
| `--format` | string | text | Output format: text, json, markdown, html |
| `--output` | string | stdout | Output file path |
| `--sources` | string | all | Comma-separated source list |
| `--exclude-sources` | string | none | Sources to exclude |
| `--timeout` | integer | 120 | Overall investigation timeout in seconds |
| `--parallel` | integer | 10 | Maximum parallel source queries |
| `--monitor` | flag | false | Enable ongoing monitoring |
| `--interval` | string | weekly | Monitoring interval: daily, weekly, monthly |
| `--confidence-threshold` | float | 0.5 | Minimum confidence for reported findings |

## Execution Flow

1. **Target Analysis**: The target input is analyzed to determine its type (person, domain, email, etc.) if not explicitly specified. The type determines which source categories and collection agents are activated.

2. **Collection Plan**: The sig-osint-commander develops a collection plan based on the target type, requested depth, and focus area. The plan specifies which sources to query, in what order, and with what parameters.

3. **Wave 1 Execution**: Critical sources are queried first in parallel. These are the sources most likely to provide pivotal initial findings that inform subsequent collection.

4. **Pivot Discovery**: Wave 1 results are analyzed for pivot points -- additional identifiers (email addresses, usernames, phone numbers, domains) that can be used to expand the investigation in subsequent waves.

5. **Wave 2 Execution**: Standard sources are queried using both the original target and any pivot points discovered in Wave 1. This expands the investigation's coverage.

6. **Wave 3 Execution**: Extended sources are queried for deep background information. These sources are slower but provide comprehensive context.

7. **Entity Resolution**: All findings are correlated through the entity resolution engine, which links discoveries across sources to build a unified target profile.

8. **Confidence Scoring**: Each finding receives a NABLA-calibrated confidence score based on source reliability, corroboration, and data freshness.

9. **Report Generation**: The complete investigation results are compiled into a structured report with executive summary, categorized findings, confidence assessments, and recommended follow-up actions.

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Executed by `sig-osint-commander` | Coordinates all collection agents |
| [/email-osint](@/commands/email-osint.md) | Email collection | Specialized email intelligence |
| [/ghost-recon](@/commands/ghost-recon.md) | Passive collection | Zero-footprint infrastructure intel |
| [/google-hacking](@/commands/google-hacking.md) | Search intel | Advanced search engine dorking |
| [/intel-export](@/commands/intel-export.md) | Report export | Packages for external analysis |
| [NABLA Framework](@/glossary/nabla-infinity.md) | Epistemic validation | Source plurality and confidence |
| [Quality Gates](@/glossary/quality-gates.md) | Intelligence quality | Finding validation and scoring |
| [Telemetry](@/glossary/telemetry.md) | Execution [metrics](@/glossary/metrics.md) | Collection timing and success rates |
| [GARDEN Legacy](@/glossary/garden.md) | Heritage | 250+ providers from Sig project |

## Best Practices

**Start with auto-detection.** Let the command automatically detect the target type rather than specifying it manually. The auto-detection uses pattern matching and validation to correctly classify targets in most cases.

**Use quick depth for triage.** The `quick` depth completes in 5-15 seconds and provides enough information to determine whether a full investigation is warranted. Reserve `full` and `exhaustive` depths for cases that justify the additional time and API usage.

**Review pivot points.** After Wave 1 completes, the investigation may discover additional identifiers (alternate email addresses, associated domains, usernames) that significantly expand the scope. Review these pivots to ensure the expanded scope is appropriate.

**Export for team analysis.** Use [/intel-export](@/commands/intel-export.md) to generate structured packages that can be shared with team members or fed into other analysis tools without granting them direct platform access.

**Combine with EASM.** For domain and organization investigations, complement the OSINT findings with [Prismatic Perimeter](@/apps/prismatic-perimeter.md) External Attack Surface Management data for a complete security picture.

**Monitor high-value targets.** Use the `--monitor` flag for targets that require ongoing awareness. The monitoring system automatically detects changes in the target's digital footprint and alerts on significant developments.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `target_type_ambiguous` | Cannot auto-detect target type | Specify explicitly with `--type` |
| `no_sources_available` | All sources unavailable or rate limited | Wait and retry, or check API credentials |
| `investigation_timeout` | Overall timeout exceeded | Increase `--timeout` or reduce `--depth` |
| `source_auth_required` | Source requires API credentials | Configure credentials in environment variables |
| `pivot_explosion` | Too many pivot points discovered | Use `--focus` to constrain investigation scope |
| `empty_results` | No findings across all sources | Target may have minimal digital presence |

## Advanced Usage

### Multi-Target Correlation

Investigate relationships between multiple entities.

```bash
# Investigate two entities and correlate findings
/investigate entity-a@example.com --output=entity-a.json --format=json
/investigate entity-b@example.com --output=entity-b.json --format=json
/intel-export --compare=entity-a.json,entity-b.json --output=correlation.md
```

### Automated Intelligence Pipeline

Build automated investigation workflows.

```bash
# Automated daily triage for a list of targets
/investigate --batch=targets.txt --depth=quick --format=json --output-dir=daily-intel/
```

### M&A Due Diligence Integration

Integrate OSINT findings with M&A analysis workflows.

```bash
# Investigate acquisition target
/investigate "Target Corp" --type=organization --depth=full \
  --focus=financial,legal --format=json --output=dd-osint.json

# Feed into M&A analysis
/ma-analyze --intel-source=dd-osint.json --target="Target Corp"
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. All available sources are queried within the configured scope. Partial failures do not prevent the investigation from completing with available data.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every finding includes full provenance, multi-source corroboration where possible, and NABLA-calibrated confidence scoring.

## Related Commands

- [/email-osint](@/commands/email-osint.md) - Email-based OSINT gathering with breach correlation and social profiling
- [/ghost-recon](@/commands/ghost-recon.md) - Ghost reconnaissance for passive zero-footprint intelligence gathering
- [/google-hacking](@/commands/google-hacking.md) - Google dorking and advanced search intelligence extraction
- [/intel-export](@/commands/intel-export.md) - Generate comprehensive intelligence packages for external LLM analysis
- [/osint-engines](@/commands/osint-engines.md) - Multi-engine OSINT source coordination and parallel querying
- [/ma-analyze](@/commands/ma-analyze.md) - Comprehensive M&A analysis including financial, legal and operational review

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)