+++
title = "/falcon-strike"
weight = 670
[extra]
category = "Intelligence"
description = "Rapid aerial-perspective intelligence sweep operations"
syntax = "/falcon-strike [options]"
authority = "L3"
agent = "falcon-strike-operator"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1221
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["falcon-strike", "Rapid", "commands", "Intelligence", "Prismatic Platform", "OSINT"]
tags = ["commands", "intelligence", "falcon-strike", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/falcon-strike - Prismatic Platform"
+++

## Overview

**/falcon-strike** is a production command in the **Intelligence** category of the Prismatic Platform. It executes rapid aerial-perspective intelligence sweep operations, providing a high-altitude reconnaissance view of intelligence targets before committing to deep-dive investigation. The command is designed for speed and breadth rather than depth, producing actionable intelligence summaries that inform whether further investigation is warranted.

The falcon metaphor captures the operational philosophy precisely: a falcon circles at high altitude, surveys the landscape with exceptional visual acuity, identifies targets of interest, and then commits to a rapid, precise strike on the highest-value target. The `/falcon-strike` command replicates this pattern in the [OSINT](@/glossary/osint.md) domain -- sweeping across multiple intelligence sources simultaneously, correlating surface-level signals, and producing a prioritized target assessment that guides subsequent investigation with commands like [/investigate](@/commands/investigate.md) or [/email-osint](@/commands/email-osint.md).

The falcon-strike-operator agent executes these sweeps using the platform's OSINT infrastructure, which includes access to 121+ intelligence sources spanning domain registration databases, certificate transparency logs, social media platforms, code repositories, breach databases, and dark web monitors. The operator agent is optimized for parallel source querying and rapid signal correlation, typically completing a full sweep in seconds rather than the minutes required by deep investigation.

This command operates under the **L3** authority level, reflecting the sensitivity of intelligence operations. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard.

## Architecture

The falcon-strike system implements a parallel sweep architecture optimized for speed and breadth:

```
Target Input --> Target Analyzer --> Parallel Source Sweep --> Signal Correlator
      |               |                      |                       |
 Domain/Email    Type Detection         121+ Sources            Correlation
 IP/Handle/Org   Scope Planning        Parallel Queries         Engine
      |               |                      |                       |
 Target Profile   Source Selection     Raw Signals              Priority Score
      \               |                      /                       |
       --> Sweep Orchestrator --> Assessment Generator --> Strike Report
                    |
              Timing Controller
              (speed optimization)
```

**Target Analyzer**: Classifies the input target (domain, email address, IP address, social handle, organization name) and determines the appropriate source selection strategy. Different target types activate different source combinations for optimal coverage.

**Parallel Source Sweep**: Queries multiple intelligence sources simultaneously using Elixir's concurrency model. Each source query runs as an independent Task, with configurable timeout and fallback behavior. The sweep typically queries 15-30 sources in parallel, depending on target type.

**Signal Correlator**: Cross-references signals from multiple sources to identify convergent intelligence. A domain appearing in both certificate transparency logs and breach databases is more significant than its appearance in either alone. The correlator applies the [NABLA Infinity](@/glossary/nabla-infinity.md) signal plurality axiom -- claims backed by multiple independent sources receive higher confidence scores.

**Assessment Generator**: Synthesizes correlated signals into a prioritized assessment report. The report includes target classification, threat indicators, exposure level, and recommended follow-up actions. High-priority findings are flagged for immediate attention.

## Usage

### Basic Sweep Operations

```bash
# Domain intelligence sweep
/falcon-strike example.com

# Email address intelligence sweep
/falcon-strike user@example.com

# IP address intelligence sweep
/falcon-strike 192.168.1.100

# Organization intelligence sweep
/falcon-strike --org="Example Corporation"
```

### Scoped Sweeps

```bash
# Sweep with specific source categories
/falcon-strike example.com --sources=dns,certificates,breaches

# Sweep with increased depth on specific sources
/falcon-strike example.com --deep-sources=certificates --shallow-sources=social

# Rapid sweep (minimal sources, maximum speed)
/falcon-strike example.com --rapid

# Comprehensive sweep (all sources, slower)
/falcon-strike example.com --comprehensive
```

### Intelligence Operations

```bash
# Sweep with threat assessment
/falcon-strike example.com --threat-assessment

# Sweep with exposure scoring
/falcon-strike example.com --exposure-score

# Multi-target sweep
/falcon-strike --targets="example.com,example.org,example.net"

# Generate sweep report
/falcon-strike example.com --report --format=markdown
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--org` | string | none | Target organization name for organizational sweep |
| `--sources` | string | auto | Comma-separated source categories to query |
| `--deep-sources` | string | none | Sources to query with increased depth |
| `--shallow-sources` | string | none | Sources to query at surface level only |
| `--rapid` | flag | false | Minimal source set for maximum speed |
| `--comprehensive` | flag | false | All available sources for maximum coverage |
| `--threat-assessment` | flag | false | Include threat indicator analysis |
| `--exposure-score` | flag | false | Compute target exposure score |
| `--targets` | string | none | Comma-separated list for multi-target sweep |
| `--report` | flag | false | Generate structured sweep report |
| `--format` | string | text | Output format (text, json, markdown, table) |
| `--verbose` | flag | false | Include raw signal data in output |
| `--timeout` | integer | 30 | Maximum sweep duration in seconds |
| `--min-confidence` | float | 0.6 | Minimum confidence threshold for reported signals |
| `--follow-up` | flag | false | Generate recommended follow-up actions |

## Execution Flow

The `/falcon-strike` command follows a structured 6-phase sweep pipeline optimized for speed:

1. **Target Classification**: The input is analyzed to determine target type (domain, email, IP, handle, organization). The classification determines which intelligence sources are relevant and how queries should be structured.

2. **Source Selection**: Based on target classification and operator options, the optimal source set is selected. Rapid mode selects the top 5-10 highest-yield sources. Comprehensive mode activates all 121+ sources. Auto mode selects sources based on target type heuristics.

3. **Parallel Sweep Execution**: All selected sources are queried simultaneously using Elixir Task.async_stream for controlled parallelism. Each query has an independent timeout. Failed queries are logged but do not block the sweep.

4. **Signal Collection**: Raw signals from all successful queries are collected and normalized into a common schema. Each signal includes source attribution, timestamp, confidence level, and raw data payload.

5. **Correlation Analysis**: Signals from multiple sources are cross-referenced to identify convergent intelligence. The correlator applies source independence scoring -- signals from independent sources receive higher combined confidence than signals from correlated sources.

6. **Assessment Synthesis**: Correlated signals are synthesized into a prioritized assessment. The output includes a target summary, key findings ranked by significance, threat indicators (if enabled), exposure score (if enabled), and recommended follow-up actions.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Execution | Falcon-strike-operator agent conducts sweeps |
| [OSINT Infrastructure](@/glossary/osint.md) | Data Source | 121+ intelligence sources |
| [NABLA Infinity](@/glossary/nabla-infinity.md) | Framework | Signal plurality and source independence scoring |
| [Prismatic Perimeter](@/apps/prismatic-perimeter.md) | Integration | Attack surface correlation with sweep results |
| [Telemetry](@/glossary/telemetry.md) | Monitoring | Sweep [metrics](@/glossary/metrics.md), source response times |
| [Quality Gates](@/glossary/quality-gates.md) | Validation | Intelligence quality assessment |
| AIAD Registry | Discovery | Command specification and agent binding |
| [Color Teams](@/glossary/color-teams.md) | Security | Red team scenario input, Blue team defense posture |

## Best Practices

**Start with falcon-strike before deep investigation**: Use `/falcon-strike` to identify the highest-value targets before committing resources to deep investigation with [/investigate](@/commands/investigate.md). This prevents wasted effort on low-yield targets.

**Use rapid mode for time-sensitive operations**: When response time is critical, `--rapid` queries only the highest-yield sources. The speed-coverage trade-off is favorable for initial triage.

**Set appropriate confidence thresholds**: The default 0.6 confidence threshold balances signal coverage with noise reduction. Lower thresholds (0.3-0.5) for exploratory sweeps where false positives are acceptable. Higher thresholds (0.8+) for actionable intelligence.

**Correlate with Perimeter data**: When sweeping targets that overlap with [Prismatic Perimeter](@/apps/prismatic-perimeter.md) monitored assets, cross-reference sweep results with Perimeter security ratings for enriched threat context.

**Log sweep results for trend analysis**: Regular sweeps of monitored targets build a longitudinal intelligence profile. Changes in sweep results over time may indicate evolving threats or exposure changes.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `TARGET_CLASSIFICATION_FAILED` | Input does not match any known target type | Verify input format; use explicit type flag if needed |
| `SOURCE_TIMEOUT` | Intelligence source did not respond within timeout | Source excluded from results; increase `--timeout` if needed |
| `ALL_SOURCES_FAILED` | No intelligence sources returned results | Check network connectivity; verify source availability |
| `CORRELATION_INSUFFICIENT` | Too few signals for meaningful correlation | Increase source coverage with `--comprehensive` |
| `RATE_LIMIT_EXCEEDED` | Source API rate limit reached | Wait and retry; reduce sweep frequency |

## Advanced Usage

### Automated Sweep Campaigns

```bash
# Schedule periodic sweeps for monitored targets
/falcon-strike --campaign="weekly-perimeter" \
  --targets-file=monitored-domains.txt \
  --interval=7d --report

# Compare sweep results across time periods
/falcon-strike example.com --compare-with=last-sweep --highlight-changes
```

### Integration with Investigation Workflow

```bash
# Chain falcon-strike with deep investigation
/falcon-strike example.com --follow-up --auto-investigate=high-priority

# Feed sweep results into Perimeter EASM
/falcon-strike example.com --feed-perimeter --asset-type=domain
```

### Custom Source Configurations

```bash
# Define a custom source profile for financial sector targets
/falcon-strike --profile=fintech \
  --sources="sec-filings,finra,certificates,dns,breaches" \
  --timeout=60

# Exclude specific source categories
/falcon-strike example.com --exclude-sources=social,forums
```

### Multi-Target Correlation

When sweeping multiple related targets, the falcon-strike system performs cross-target correlation, identifying shared infrastructure, common vulnerabilities, and organizational relationships that would not be visible in single-target sweeps.

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Every sweep must produce actionable output. No partial results accepted as complete. Failed sources are logged and retried. The sweep either delivers a comprehensive assessment or explicitly reports what intelligence is missing and why.
- **NO DOUBTS**: All reported intelligence is attributed to specific sources with confidence scores. The signal plurality axiom is enforced -- single-source claims are flagged as low-confidence. The sweep never presents unverified intelligence as established fact.

Intelligence operations carry particular epistemic responsibility. The `/falcon-strike` command enforces [NABLA Infinity](@/glossary/nabla-infinity.md) axioms rigorously: provenance mandatory (every signal traceable to its source), signal plurality (multi-source corroboration required for high confidence), and time decay (intelligence freshness tracked and reported).

## Related Commands

- [/investigate](@/commands/investigate.md) - Launch comprehensive [OSINT](@/glossary/osint.md) investigation across 121+ sources
- [/email-osint](@/commands/email-osint.md) - Email-based OSINT gathering with breach correlation and social profiling
- [/google-hacking](@/commands/google-hacking.md) - Google dorking and advanced search intelligence extraction
- [/ghost-recon](@/commands/ghost-recon.md) - Stealth reconnaissance operations
- [/delta-force](@/commands/delta-force.md) - Precision intelligence operations
- [/navy-seal](@/commands/navy-seal.md) - Deep-dive intelligence extraction
- [/agents](@/commands/agents.md) - List and manage agent ecosystem with status monitoring

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)