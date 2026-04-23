+++
title = "/osint-engines"
weight = 620
[extra]
category = "Intelligence"
description = "Multi-engine OSINT source coordination and parallel querying"
syntax = "/osint-engines [options]"
authority = "L3"
agent = "osint-engine-coordinator"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1147
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["osint-engines", "Multi-engine", "OSINT", "commands", "Intelligence", "Prismatic Platform", "Phase", "WHOIS"]
tags = ["commands", "intelligence", "osint-engines", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/osint-engines - Prismatic Platform"
+++

## Overview

**/osint-engines** is a production command in the **Intelligence** category of the Prismatic Platform. It coordinates multiple [OSINT](@/glossary/osint.md) (Open Source Intelligence) engines to execute parallel queries across diverse data sources, aggregating results into unified intelligence reports. The command manages 250+ OSINT providers spanning public records, social media, domain registries, certificate transparency logs, breach databases, and specialized intelligence feeds, orchestrating them through a priority-based scheduling system that maximizes coverage while respecting rate limits and API quotas.

This command operates under the **L3** authority level and is executed by the `osint-engine-coordinator` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The L3 authority level reflects the sensitivity of intelligence operations: while results are derived entirely from publicly available sources, the coordination of multiple engines against a target requires operational awareness and appropriate authorization.

The multi-engine architecture provides resilience through redundancy and accuracy through cross-validation. When multiple engines return information about the same entity, the system applies source independence analysis from the [NABLA Infinity](@/glossary/nabla-infinity.md) framework to weight the results. Corroborating information from independent sources receives higher confidence scores than single-source findings, directly implementing the Signal Plurality axiom.

## Architecture

The OSINT engine coordinator operates a three-tier architecture separating engine management, query execution, and result synthesis.

### System Architecture

```
                /osint-engines
                      |
              Engine Coordinator
                      |
          +-----------+-----------+
          |           |           |
     Engine Pool   Query Router  Result Fuser
          |           |           |
    +-----+-----+ +---+---+ +----+----+
    |     |     | |   |   | |    |    |
   Web   API   DB  Par  Seq  Dedup  Cross
   Scrape Calls Query allel ential  Engine  Valid
    |     |     | |   |   | |    |    |
    +-----+-----+-+---+---+-+----+----+
                      |
              Intelligence Report
```

### Engine Categories

| Category | Engine Count | Examples | Typical Latency |
|----------|-------------|---------|----------------|
| **Domain Intelligence** | 35+ | WHOIS, DNS, subdomain enumeration | 2-10s |
| **Certificate Transparency** | 10+ | crt.sh, Censys certificates | 3-15s |
| **Social Media** | 25+ | Username search, profile correlation | 5-20s |
| **Breach Databases** | 15+ | HIBP, DeHashed, breach compilations | 2-8s |
| **Public Records** | 40+ | Company registries, court records | 5-30s |
| **Network Intelligence** | 30+ | Shodan, Censys hosts, BGP data | 3-15s |
| **Code Repositories** | 20+ | GitHub, GitLab, Bitbucket search | 3-12s |
| **Dark Web Monitoring** | 10+ | Paste sites, forum monitoring | 10-60s |
| **Geolocation** | 15+ | IP geolocation, physical mapping | 1-5s |
| **Metadata Analysis** | 50+ | EXIF, document metadata, headers | 1-3s |

### Engine Health Management

Each engine is continuously monitored for availability, response time, and error rate. The coordinator maintains a health score per engine:

| Health Score | Status | Behavior |
|-------------|--------|----------|
| 0.9 - 1.0 | Healthy | Full priority scheduling |
| 0.7 - 0.9 | Degraded | Reduced scheduling priority |
| 0.5 - 0.7 | Unstable | Used only as fallback |
| 0.0 - 0.5 | Failed | Excluded from queries; recovery checks every 60s |

## Usage

```bash
# List all available engines
/osint-engines --list

# Query all engines for a domain
/osint-engines --target example.com

# Query specific engine categories
/osint-engines --target john.doe@example.com --categories breach,social

# Run with maximum parallelism
/osint-engines --target example.com --parallel max

# Query with specific engines only
/osint-engines --target 192.168.1.1 --engines shodan,censys,whois

# Show engine health status
/osint-engines --status

# Export results in JSON format
/osint-engines --target example.com --format json --output ./results/

# Quiet mode (results only, no progress)
/osint-engines --target example.com --quiet

# Deep scan with all available engines
/osint-engines --target example.com --depth deep
```

### Practical Examples

```bash
# Full domain reconnaissance
/osint-engines --target megacorp.com --categories domain,cert,network --depth deep

# Email-focused intelligence gathering
/osint-engines --target ceo@megacorp.com --categories breach,social,public --format json

# IP address intelligence with geolocation
/osint-engines --target 203.0.113.42 --categories network,geo --verbose

# Company intelligence from public records
/osint-engines --target "MegaCorp Inc" --categories public,code --region EU

# Bulk query from target list
/osint-engines --targets-file ./targets.txt --categories domain --parallel max --output ./bulk-results/
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--target` | `string` | required | Target entity (domain, email, IP, name, company) |
| `--targets-file` | `path` | none | File containing one target per line for bulk queries |
| `--categories` | `string` | all | Comma-separated engine categories to query |
| `--engines` | `string` | all | Comma-separated specific engine names |
| `--depth` | `enum` | `standard` | Query depth: `quick`, `standard`, `deep` |
| `--parallel` | `enum` | `balanced` | Parallelism: `sequential`, `balanced`, `max` |
| `--format` | `enum` | `text` | Output format: `text`, `json`, `markdown`, `csv` |
| `--output` | `path` | stdout | Directory for result files |
| `--list` | `flag` | false | List all available engines |
| `--status` | `flag` | false | Show engine health status |
| `--verbose` | `flag` | false | Detailed output with per-engine results |
| `--quiet` | `flag` | false | Minimal output, results only |
| `--timeout` | `duration` | `60s` | Maximum time per engine query |
| `--region` | `string` | global | Geographic scope filter |
| `--exclude` | `string` | none | Comma-separated engines to exclude |
| `--rate-limit` | `integer` | auto | Maximum queries per second across all engines |
| `--confidence-threshold` | `float` | 0.3 | Minimum confidence score for included results |

## Execution Flow

### Phase 1: Target Analysis and Classification

The input target is analyzed to determine its type (domain, email, IP, person name, organization). This classification determines which engine categories are relevant. For example, a domain target activates DNS, WHOIS, and certificate engines, while an email target prioritizes breach databases and social media searches.

### Phase 2: Engine Selection and Scheduling

Based on target type, selected categories, and current engine health scores, a query plan is generated. Engines are scheduled according to priority:

1. High-confidence, low-latency engines run first
2. Supplementary engines fill in gaps identified by initial results
3. Deep-scan engines run last for comprehensive coverage

### Phase 3: Parallel Query Execution

Queries are dispatched to engines according to the parallelism strategy. The `balanced` strategy (default) runs up to 10 engines simultaneously, respecting per-engine rate limits. The `max` strategy removes concurrency limits but may trigger rate limiting on external services.

### Phase 4: Result Collection and Deduplication

As engine results arrive, they are immediately processed through the deduplication pipeline. Identical findings from different engines are merged, with each contributing engine recorded as a source. This preserves the source plurality required by the NABLA framework.

### Phase 5: Cross-Validation and Confidence Scoring

Findings that are corroborated by multiple independent engines receive elevated confidence scores. Contradictory findings are preserved with both data points and flagged for human review.

### Phase 6: Intelligence Report Assembly

The final report aggregates all findings, organized by category and confidence level. Summary statistics include: engines queried, response rates, unique findings, corroboration rates, and total execution time.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/investigate](@/commands/investigate.md) | Upstream | Full investigation workflow uses engines as data layer |
| [/email-osint](@/commands/email-osint.md) | Peer | Specialized email intelligence sharing |
| [/google-hacking](@/commands/google-hacking.md) | Peer | Google dorking engine integration |
| [/web-crawler](@/commands/web-crawler.md) | Peer | Web crawling results feed into engine data |
| [Prismatic Perimeter](@/apps/prismatic-perimeter.md) | Downstream | Attack surface data from OSINT engines |
| [NABLA Infinity](@/glossary/nabla-infinity.md) | Framework | Source plurality and confidence scoring |
| [Telemetry](@/glossary/telemetry.md) | Monitoring | Engine performance and query statistics |
| [Quality Gates](@/glossary/quality-gates.md) | Enforcement | Result quality validation |

## Best Practices

### Engine Selection Strategy

For time-sensitive investigations, use `--depth quick` with specific categories to get actionable intelligence in under 30 seconds. For comprehensive assessments, use `--depth deep` but expect execution times of 2-5 minutes as all engines are queried.

### Rate Limit Management

External OSINT services enforce rate limits. The command manages these automatically, but bulk queries against many targets should use `--rate-limit` to stay within comfortable margins. Running 100+ targets in `--parallel max` mode without rate limiting may result in temporary IP blocks from external services.

### Result Verification

Never act on single-source intelligence findings. The confidence scoring system weights multi-source corroboration heavily; findings with confidence below 0.5 should be treated as hypotheses requiring additional verification.

### Data Freshness

OSINT data has varying freshness. WHOIS records may be hours old, while breach database entries could be months or years old. Always check the timestamp on individual findings before incorporating them into assessments.

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `ENGINE_TIMEOUT` | Engine failed to respond within timeout | Increase `--timeout` or exclude slow engine |
| `RATE_LIMITED` | External service rate limit exceeded | Reduce `--rate-limit` or wait before retrying |
| `AUTH_FAILURE` | API key invalid or expired for engine | Update API credentials in engine configuration |
| `TARGET_INVALID` | Cannot classify target type | Check target format; provide explicit type hint |
| `NO_ENGINES_AVAILABLE` | All engines in selected categories are failed | Check engine health with `--status` |
| `RESULT_OVERFLOW` | Too many results to process in memory | Use `--output` to stream results to disk |

## Advanced Usage

### Custom Engine Integration

Add proprietary or custom OSINT engines by implementing the `OsintEngine` behaviour:

```elixir
defmodule MyCustomEngine do
  @behaviour PrismaticOsint.Engine

  def query(target, opts) do
    # Custom query logic
    {:ok, results}
  end

  def health_check do
    {:ok, %{status: :healthy, latency: 150}}
  end
end
```

### Correlation Analysis

Enable cross-target correlation to discover relationships between entities:

```bash
/osint-engines --targets-file ./targets.txt --correlate --output ./correlation-report/
```

### Scheduled Monitoring

Set up periodic monitoring of targets for changes:

```bash
/osint-engines --target example.com --monitor --interval 24h --alert-on-change
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. All queried engines must return results or explicit errors.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Multi-source corroboration enforced through NABLA Signal Plurality axiom.

## Related Commands

- [/investigate](@/commands/investigate.md) - Launch comprehensive OSINT investigation across 121+ sources
- [/email-osint](@/commands/email-osint.md) - Email-based OSINT gathering with breach correlation and social profiling
- [/google-hacking](@/commands/google-hacking.md) - Google dorking and advanced search intelligence extraction
- [/web-crawler](@/commands/web-crawler.md) - Automated web crawling and structured data extraction
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/agents](@/commands/agents.md) - List and manage agent ecosystem with status monitoring

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)