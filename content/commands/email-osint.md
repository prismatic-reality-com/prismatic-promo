+++
title = "/email-osint"
weight = 600
[extra]
category = "Intelligence"
description = "Email-based OSINT gathering with breach correlation and social profiling"
syntax = "/email-osint [options]"
authority = "L2+"
agent = "email-intelligence-specialist"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1208
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["email-osint", "Email-based", "OSINT", "commands", "Intelligence", "Prismatic Platform", "Email"]
tags = ["commands", "intelligence", "email-osint", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/email-osint - Prismatic Platform"
+++

## Overview

**/email-[osint](/glossary/osint/)** is a production command in the **Intelligence** category of the Prismatic Platform that performs comprehensive Open Source Intelligence gathering centered on email addresses. Given one or more email addresses as input, the command orchestrates a multi-source intelligence collection pipeline that correlates data from breach databases, social media platforms, domain registration records, professional networks, and public data repositories to build a comprehensive profile of the email owner's digital footprint.

This command operates under the **L2+** authority level and is executed by the `email-intelligence-specialist` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The intelligence gathering process adheres to strict ethical guidelines: all data sources are publicly accessible, no authentication boundaries are bypassed, and collection activities leave minimal footprint on target systems.

Email addresses serve as uniquely powerful pivot points for OSINT investigations because they function as persistent digital identifiers that bridge multiple online ecosystems. A single email address can unlock connections between social media accounts, professional profiles, code repositories, forum posts, domain registrations, and data breach records. The `/email-osint` command automates this correlation work, transforming hours of manual research into structured intelligence products delivered in seconds.

## Architecture

The email OSINT system is built on a parallel collection pipeline with source-specific adapters and a correlation engine that links discoveries across sources.

### Collection Pipeline

```
Email Input -> Validator -> Splitter -> Parallel Collectors -> Correlator -> Report Generator
                 |                          |                     |
                 v                          v                     v
          Format Check              Source Adapters         Entity Resolution
          Domain Check              Rate Limiters          Link Analysis
          MX Verification           Response Parsers       Confidence Scoring
```

### Source Adapters

Each intelligence source has a dedicated adapter that handles authentication, rate limiting, request formatting, and response parsing.

| Source Category | Sources | Data Provided |
|----------------|---------|--------------|
| **Breach Databases** | HaveIBeenPwned, DeHashed | Breach history, exposed data types |
| **Social Networks** | LinkedIn, Twitter/X, GitHub | Profiles, connections, activity |
| **Domain Intelligence** | WHOIS, DNS, crt.sh | Registration, certificates, subdomains |
| **Professional Networks** | LinkedIn, Crunchbase | Employment history, company affiliations |
| **Code Repositories** | GitHub, GitLab, Bitbucket | Commits, projects, collaborators |
| **Public Records** | Court records, company registries | Legal filings, business registrations |
| **Search Engines** | Google, Bing, DuckDuckGo | Web mentions, cached pages |

### Correlation Engine

The correlation engine uses entity resolution techniques to link discoveries across sources. When the same individual appears under different usernames or profiles across platforms, the engine identifies these connections through shared attributes (name, avatar hash, location, timestamps).

| Correlation Method | Strength | Description |
|-------------------|----------|-------------|
| **Exact match** | HIGH | Same email found across multiple sources |
| **Username derivation** | MEDIUM | Email local part matches platform username |
| **Name correlation** | MEDIUM | Full name from one source matches another |
| **Avatar hash** | HIGH | Identical profile images across platforms |
| **Temporal correlation** | LOW | Account creation dates cluster together |

## Usage

```bash
# Basic email investigation
/email-osint target@example.com

# Investigate multiple emails
/email-osint target1@example.com target2@example.com

# Full investigation with all sources
/email-osint target@example.com --depth=full

# Quick breach check only
/email-osint target@example.com --mode=breach-check

# Social media focused investigation
/email-osint target@example.com --mode=social

# Domain-focused investigation
/email-osint target@example.com --mode=domain

# Export results in structured format
/email-osint target@example.com --format=json --output=intel-report.json

# Investigate with specific source selection
/email-osint target@example.com --sources="hibp,github,linkedin"

# Batch investigation from file
/email-osint --batch=email-list.txt --output-dir=results/
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `email` | string | required | Target email address(es) (positional) |
| `--depth` | string | standard | Investigation depth: quick, standard, full |
| `--mode` | string | all | Focus mode: all, breach-check, social, domain, professional |
| `--sources` | string | all | Comma-separated list of specific sources |
| `--format` | string | text | Output format: text, json, markdown, html |
| `--output` | string | stdout | Output file path |
| `--batch` | string | none | File containing email addresses (one per line) |
| `--output-dir` | string | none | Directory for batch output files |
| `--timeout` | integer | 60 | Per-source timeout in seconds |
| `--parallel` | integer | 5 | Maximum parallel source queries |
| `--verify-mx` | flag | true | Verify MX records before investigation |
| `--include-historical` | flag | false | Include archived/cached data |
| `--confidence-threshold` | float | 0.6 | Minimum confidence for reported correlations |

## Execution Flow

1. **Input Validation**: Email addresses are validated for syntactic correctness (RFC 5322 compliance) and domain existence (DNS MX record verification). Invalid addresses are reported and skipped.

2. **Domain Decomposition**: The email domain is extracted and analyzed separately to provide organizational context. Domain WHOIS, DNS records, SSL certificates, and known subdomains are collected.

3. **Parallel Source Collection**: Intelligence sources are queried in parallel, respecting per-source rate limits and the configured parallelism ceiling. Each source adapter handles its own authentication and error recovery.

4. **Breach Correlation**: Breach database results are correlated to identify the severity and recency of data exposures. The types of data exposed in each breach (passwords, personal information, financial data) are categorized and scored.

5. **Social Profile Discovery**: Social media and professional network profiles associated with the email or derived usernames are discovered and their public data extracted.

6. **Entity Resolution**: The correlation engine links discoveries across sources, identifying connections that suggest the same individual operates multiple accounts or profiles.

7. **Confidence Scoring**: Each discovery and correlation is assigned a confidence score based on the strength of the evidence. Low-confidence correlations are flagged but included for completeness.

8. **Report Generation**: All findings are compiled into a structured intelligence report organized by category, with an executive summary highlighting the most significant discoveries.

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `email-intelligence-specialist` | Manages collection pipeline |
| [/investigate](/commands/investigate/) | Parent command | Email OSINT is a subcommand of the investigation suite |
| [/ghost-recon](/commands/ghost-recon/) | Passive collection | Ghost recon provides zero-footprint alternative |
| [/intel-export](/commands/intel-export/) | Report packaging | Exports findings for external analysis |
| [NABLA Framework](/glossary/nabla-infinity/) | Epistemic validation | Signal plurality enforced across sources |
| [Quality Gates](/glossary/quality-gates/) | Result validation | Intelligence quality scoring |
| [Telemetry](/glossary/telemetry/) | Execution [metrics](/glossary/metrics/) | Source response times and success rates |

## Best Practices

**Start with breach checks.** The quickest path to actionable intelligence is often through breach databases. A compromised email address reveals not just the breaches themselves but also the services the target uses, password patterns, and associated personal data.

**Verify before acting.** Social profile correlations based on username derivation can produce false positives, especially for common names. Always verify correlations through multiple independent signals before incorporating them into intelligence assessments.

**Respect rate limits.** Sources like HaveIBeenPwned enforce strict rate limits. Use `--parallel` conservatively and avoid repeated queries against the same source within short intervals.

**Use depth appropriately.** The `quick` depth is sufficient for routine checks and returns results in seconds. Reserve `full` depth for cases where comprehensive intelligence is genuinely needed, as it consumes more time and API quotas.

**Document your authorization.** Email OSINT should only be conducted under proper authorization (corporate security assessments, authorized penetration testing, personal account verification). Maintain documentation of your authorization for every investigation.

**Combine with other intelligence.** Email OSINT is most powerful when combined with [/google-hacking](/commands/google-hacking/) for web presence discovery and [/ghost-recon](/commands/ghost-recon/) for passive infrastructure reconnaissance.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `invalid_email_format` | Email does not conform to RFC 5322 | Correct the email address format |
| `mx_verification_failed` | Domain has no MX records | Use `--verify-mx=false` if investigating historical addresses |
| `source_rate_limited` | API rate limit exceeded | Wait and retry, or reduce `--parallel` |
| `source_unavailable` | Intelligence source is down or unreachable | Source skipped; partial results still generated |
| `batch_file_not_found` | `--batch` file does not exist | Verify the file path |
| `low_confidence_results` | All correlations below confidence threshold | Lower `--confidence-threshold` or add more sources |
| `authentication_required` | Source API requires credentials | Configure API keys in environment variables |

## Advanced Usage

### Pivot Investigation

Use discoveries from one email to pivot into investigating related entities.

```bash
# Initial investigation
/email-osint target@example.com --format=json --output=initial.json

# Extract related emails and investigate them
/email-osint --batch=<(jq -r '.related_emails[]' initial.json)
```

### Custom Source Definitions

Define additional intelligence sources through the AIAD adapter system.

```elixir
defmodule CustomSource do
  @behaviour PrismaticIntelligence.SourceAdapter

  @impl true
  def query(email, opts) do
    # Custom source query logic
    {:ok, %{findings: [], confidence: 0.8}}
  end
end
```

### Automated Monitoring

Set up continuous monitoring for specific email addresses to detect new breach exposures.

```bash
# Register email for monitoring
/email-osint target@example.com --monitor --interval=daily

# Check monitoring alerts
/email-osint --alerts
```

### Integration with M&A Operations

Email OSINT is frequently used during M&A due diligence to assess target company security posture.

```bash
# Investigate executive team
/email-osint --batch=executive-emails.txt --depth=full --format=markdown --output=ma-intel-report.md
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. All available sources are queried; partial failures are reported but do not stop the investigation.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every finding includes provenance, confidence scoring, and source attribution per [NABLA](/glossary/nabla-infinity/) requirements.

## Related Commands

- [/investigate](/commands/investigate/) - Launch comprehensive OSINT investigation across 121+ sources
- [/google-hacking](/commands/google-hacking/) - Google dorking and advanced search intelligence extraction
- [/ghost-recon](/commands/ghost-recon/) - Ghost reconnaissance for passive zero-footprint intelligence gathering
- [/intel-export](/commands/intel-export/) - Generate comprehensive intelligence packages for external LLM analysis
- [/osint-engines](/commands/osint-engines/) - Multi-engine OSINT source coordination and parallel querying
- [/ma-analyze](/commands/ma-analyze/) - Comprehensive M&A analysis including financial, legal and operational review

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)