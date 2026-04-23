+++
title = "/google-hacking"
weight = 610
[extra]
category = "Intelligence"
description = "Google dorking and advanced search intelligence extraction"
syntax = "/google-hacking [options]"
authority = "L2+"
agent = "google-hacking-specialist"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1205
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["google-hacking", "Google", "commands", "Intelligence", "Prismatic Platform", "OSINT", "Google Hacking", "Prismatic Perimeter"]
tags = ["commands", "intelligence", "google-hacking", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/google-hacking - Prismatic Platform"
+++

## Overview

**/google-hacking** is a production command in the **Intelligence** category of the Prismatic Platform that leverages Google dorking techniques and advanced search operator combinations to extract intelligence from publicly indexed web resources. The command automates the construction and execution of sophisticated search queries using Google's advanced operators (site:, inurl:, intitle:, filetype:, intext:, and others) to discover exposed information, misconfigurations, data leaks, and intelligence artifacts across the open web.

This command operates under the **L2+** authority level and is executed by the `google-hacking-specialist` agent, which maintains an internal database of proven Google dork patterns organized by category (exposed credentials, directory listings, configuration files, database dumps, login portals, error messages, and technology fingerprints). The agent constructs targeted queries based on investigation objectives, executes them within ethical and legal boundaries, and processes results into structured intelligence reports. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard.

Google Hacking, also known as Google Dorking, originated from Johnny Long's Google Hacking Database (GHDB) and has become a foundational technique in [OSINT](/glossary/osint/) (Open Source Intelligence) methodology. The Prismatic Platform's implementation extends classical dorking with intelligent query generation, result correlation, temporal analysis, and integration with the platform's broader intelligence gathering pipeline. Discovered artifacts feed into the [/investigate](/commands/investigate/) command's evidence chain and contribute to attack surface assessment through [Prismatic Perimeter](/apps/prismatic-perimeter/).

The command operates exclusively within ethical and legal boundaries. All queries target publicly indexed information that search engines have already crawled and cached. No exploitation, intrusion, or unauthorized access is performed. The command includes built-in rate limiting to respect search engine terms of service and configurable scope restrictions to prevent accidental queries against unauthorized targets.

## Architecture

```
/google-hacking Command
    |
    +-- Query Generator
    |       +-- Dork Template Library (500+ patterns)
    |       +-- Operator Combiner
    |       +-- Target Scoper
    |       +-- Query Optimizer
    |
    +-- Search Executor
    |       +-- Rate Limiter
    |       +-- Result Parser
    |       +-- Cache Manager
    |       +-- Pagination Handler
    |
    +-- Result Processor
    |       +-- URL Classifier
    |       +-- Content Extractor
    |       +-- Confidence Scorer
    |       +-- Duplicate Detector
    |
    +-- Intelligence Synthesizer
    |       +-- Finding Aggregator
    |       +-- Risk Categorizer
    |       +-- Temporal Analyzer
    |       +-- Report Generator
    |
    +-- Safety Controls
            +-- Scope Validator
            +-- Ethics Checker
            +-- Rate Limiter
            +-- Audit Logger
```

The Query Generator maintains a library of 500+ dork templates organized into categories that map to common intelligence objectives. Templates are parameterized, allowing the operator combiner to construct queries tailored to specific targets (domains, technologies, file types) while maintaining effectiveness. The Safety Controls layer ensures all operations remain within defined scope and ethical boundaries.

## Usage

### Target-Specific Searches

```bash
# Search for exposed configuration files on a domain
/google-hacking --target=example.com --category=config-files

# Find directory listings
/google-hacking --target=example.com --category=directory-listings

# Discover login portals
/google-hacking --target=example.com --category=login-portals

# Comprehensive scan across all categories
/google-hacking --target=example.com --category=all
```

### Technology Discovery

```bash
# Identify technology stack from search results
/google-hacking --target=example.com --tech-fingerprint

# Find specific technology instances
/google-hacking --target=example.com --technology=wordpress

# Discover API endpoints
/google-hacking --target=example.com --category=api-endpoints
```

### Custom Dork Queries

```bash
# Execute custom dork query
/google-hacking --dork='site:example.com filetype:pdf "confidential"'

# Combine multiple operators
/google-hacking --dork='site:example.com inurl:admin -inurl:blog'

# Search for specific file types
/google-hacking --target=example.com --filetypes=pdf,doc,xls,csv
```

### Intelligence Package Generation

```bash
# Generate comprehensive intelligence package
/google-hacking --target=example.com --full-report

# Export findings in structured format
/google-hacking --target=example.com --format=json --output=findings.json

# Time-bounded search (find recently indexed items)
/google-hacking --target=example.com --timeframe=30d
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--target` | string | required | Target domain or organization for scoped searches |
| `--category` | string | all | Dork category (config-files, directory-listings, login-portals, credentials, databases, api-endpoints, error-messages, tech-fingerprint, all) |
| `--dork` | string | none | Custom dork query string |
| `--filetypes` | string | none | Comma-separated file type filter |
| `--technology` | string | none | Specific technology to search for |
| `--tech-fingerprint` | flag | false | Run technology fingerprinting analysis |
| `--timeframe` | string | all | Time restriction for results (7d, 30d, 90d, 1y) |
| `--full-report` | flag | false | Generate comprehensive intelligence report |
| `--format` | string | text | Output format (text, json, markdown, html) |
| `--output` | string | stdout | File path for report output |
| `--max-results` | integer | 100 | Maximum results per query |
| `--rate-limit` | integer | 10 | Requests per minute (prevents throttling) |
| `--exclude` | string | none | Domains or patterns to exclude from results |
| `--confidence` | float | 0.5 | Minimum confidence threshold for findings |

## Execution Flow

1. **Scope Validation**: Validate the target domain or organization. Ensure the target is within authorized investigation scope. Check against the platform's ethics policy for restricted targets.

2. **Query Generation**: Based on the selected category, generate a set of dork queries from the template library. Apply target scoping (site: operator), file type filters, and time restrictions. Optimize query count to minimize API usage.

3. **Rate-Limited Execution**: Execute queries with configurable rate limiting (default 10 requests/minute) to respect search engine terms of service. Parse search result pages to extract URLs, snippets, and metadata.

4. **Result Processing**: For each result, classify the URL by type (file, page, API endpoint), extract relevant content snippets, score confidence based on query specificity and result relevance, and detect duplicates across queries.

5. **Intelligence Synthesis**: Aggregate findings across all queries. Categorize by risk level (critical, high, medium, low, informational). Perform temporal analysis to identify recently exposed items versus long-standing findings. Cross-reference with known vulnerability patterns.

6. **Report Generation**: Produce structured intelligence report with findings organized by category and risk level. Include evidence links, confidence scores, and recommended actions for each finding.

7. **Integration**: Feed findings into the platform's intelligence pipeline for correlation with other [OSINT](/glossary/osint/) sources. Update [Prismatic Perimeter](/apps/prismatic-perimeter/) attack surface data if the target is a monitored entity.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Agent Execution | Executed by `google-hacking-specialist` at L2+ authority |
| [/investigate](/commands/investigate/) | Intelligence Pipeline | Findings feed into comprehensive OSINT investigations |
| [/email-osint](/commands/email-osint/) | Cross-Reference | Email addresses discovered via dorking feed into email OSINT |
| [Prismatic Perimeter](/apps/prismatic-perimeter/) | Attack Surface | Discoveries update external attack surface assessments |
| [/intel-export](/commands/intel-export/) | Export | Findings packaged for external analysis |
| [Telemetry](/glossary/telemetry/) | Metrics | Query counts, result volumes, and finding rates tracked |
| [OSINT Engines](/glossary/osint/) | Source Correlation | Results correlated with other OSINT source findings |
| GHDB (Google Hacking Database) | Reference | Dork patterns sourced and updated from community databases |

## Best Practices

**Scope First**: Always define a clear target scope before executing searches. Unfocused searches produce noise and may inadvertently query unauthorized domains. Use the `--target` parameter to restrict all queries to the authorized domain.

**Category Selection**: Start with specific categories relevant to your investigation objective rather than `--category=all`. Targeted searches produce higher-quality results and reduce false positives. Expand scope only after reviewing initial findings.

**Rate Limiting**: Respect the default rate limit of 10 requests/minute. Excessive query rates may trigger CAPTCHA challenges or temporary blocks from search engines. For large investigations, spread queries across multiple sessions.

**Result Verification**: Google dork results are indicators, not confirmations. Always verify findings by examining the actual URLs. Cached results may reflect historical states that no longer exist. Use the confidence score as a triage guide, not a definitive assessment.

**Temporal Context**: Use `--timeframe` to focus on recently indexed items for incident response scenarios. Historical findings are valuable for understanding long-term exposure patterns but may no longer represent current state.

**Ethical Boundaries**: The command is designed for authorized security assessments and OSINT research only. Never use findings to exploit vulnerabilities or access unauthorized systems. Report discovered exposures to asset owners through responsible disclosure channels.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `Target not specified` | Missing `--target` parameter | Provide a target domain for scoped searches |
| `Rate limit triggered` | Exceeded search engine request limits | Reduce `--rate-limit` value or wait before retrying |
| `CAPTCHA challenge` | Search engine anti-automation defense | Wait 30+ minutes before retrying; reduce query rate |
| `Empty results` | No indexed content matching dork | Verify target domain is indexed; try different categories |
| `Scope violation` | Query targets unauthorized domain | Review `--target` and `--exclude` parameters |
| `Ethics check failed` | Query matches restricted pattern | Modify query to comply with platform ethics policy |

## Advanced Usage

### Dork Chaining

```bash
# Chain multiple dork categories for comprehensive coverage
/google-hacking --target=example.com --category=config-files,credentials,databases --chain

# Progressive dork refinement based on initial findings
/google-hacking --target=example.com --adaptive
```

### Integration with Perimeter Assessment

```bash
# Feed findings directly into Perimeter security rating
/google-hacking --target=example.com --feed-perimeter

# Generate attack surface overlay from dork findings
/google-hacking --target=example.com --attack-surface-overlay
```

### Custom Dork Library Management

```bash
# Add custom dork to library
/google-hacking --add-dork='intitle:"index of" "database.sql"' --category=databases

# Update dork library from GHDB
/google-hacking --update-library

# Export dork library
/google-hacking --export-library --format=json
```

## Doctrine Compliance

All Google Hacking operations enforce the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine.

- **NO MERCY**: Every configured dork category is executed completely. Partial scans due to errors trigger automatic retry. Results are comprehensively analyzed with no findings dismissed without explicit confidence scoring.
- **NO DOUBTS**: All findings include provenance (source query, timestamp, confidence score). Results are verified against actual URLs before inclusion in reports. The command never presents unverified information as confirmed intelligence.

The command additionally complies with the NABLA axiom of Signal Plurality by correlating findings across multiple dork categories and search engines to establish multi-source confidence.

## Related Commands

- [/investigate](/commands/investigate/) - Launch comprehensive [OSINT](/glossary/osint/) investigation across 121+ sources
- [/email-osint](/commands/email-osint/) - Email-based OSINT gathering with breach correlation and social profiling
- [/osint-engines](/commands/osint-engines/) - Multi-engine OSINT source coordination and parallel querying
- [/intel-export](/commands/intel-export/) - Generate comprehensive intelligence packages for external analysis
- [/green-beret](/commands/green-beret/) - Unconventional intelligence with adaptive investigation techniques
- [/agents](/commands/agents/) - List and manage agent ecosystem with status monitoring
- [/commit](/commands/commit/) - Smart commit with quality gates and conventional format

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)