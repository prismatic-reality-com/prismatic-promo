+++
title = "/ghost-recon"
weight = 630
[extra]
category = "Intelligence"
description = "Ghost reconnaissance for passive zero-footprint intelligence gathering"
syntax = "/ghost-recon [options]"
authority = "L3"
agent = "ghost-recon-operator"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1210
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ghost-recon", "Ghost", "commands", "Intelligence", "Prismatic Platform", "Source", "Zero", "Public"]
tags = ["commands", "intelligence", "ghost-recon", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/ghost-recon - Prismatic Platform"
+++

## Overview

**/ghost-recon** is a production command in the **Intelligence** category of the Prismatic Platform that performs passive, zero-footprint intelligence gathering against specified targets. Unlike active reconnaissance that probes target systems directly, ghost reconnaissance collects intelligence exclusively from third-party sources, cached data, and passive observation channels. The target never receives a single packet, request, or query from the investigation, making the reconnaissance completely undetectable.

This command operates under the **L3** authority level and is executed by the `ghost-recon-operator` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The L3 authority level reflects the sensitivity of intelligence operations and ensures that only authorized operators can invoke passive reconnaissance capabilities.

Zero-footprint intelligence gathering is essential in scenarios where the target must not be alerted to the investigation. This includes competitive intelligence, pre-engagement reconnaissance for authorized penetration testing, threat actor research, and due diligence investigations where premature disclosure could compromise the assessment. The ghost reconnaissance approach guarantees that no fingerprint is left on the target's access logs, intrusion detection systems, or monitoring infrastructure.

## Architecture

The ghost recon system is architected around the principle of strict source isolation: all data collection occurs through intermediary services that query targets on behalf of millions of users, making individual investigations indistinguishable from normal traffic.

### Collection Architecture

```
Target (NO DIRECT CONTACT)
         |
         | (queried by third-party services independently)
         v
Third-Party Sources -> Cache Layer -> Ghost Collector -> Correlator -> Report
    |                    |                |                  |
    v                    v                v                  v
  DNS Caches        Archive.org      Parallel Fetch     Entity Resolution
  CT Logs           Google Cache     Rate Limiting      Link Analysis
  Shodan/Censys     Wayback          Source Tracking     Timeline Construction
  BGP Tables        Social Caches    Provenance          Confidence Scoring
```

### Passive Source Categories

| Category | Sources | Zero-Footprint Method |
|----------|---------|----------------------|
| **DNS Intelligence** | PassiveDNS, SecurityTrails, DNSdumpster | Historical DNS resolution records |
| **Certificate Transparency** | crt.sh, Censys, Google CT | Public CT log queries (no target contact) |
| **Infrastructure Scanning** | Shodan, Censys, BinaryEdge | Pre-scanned internet-wide data |
| **Web Archives** | Wayback Machine, Archive.org, Google Cache | Cached versions of target web properties |
| **BGP/Routing** | RIPE, BGPView, HurricaneElectric | Public routing table data |
| **WHOIS History** | DomainTools, WHOIS History | Historical registration records |
| **Social Intelligence** | Cached profiles, public APIs | Publicly available profile data |
| **Code Repositories** | GitHub, GitLab (public) | Public repository metadata and commits |

### Footprint Guarantee

The zero-footprint guarantee is enforced through several architectural safeguards.

| Safeguard | Implementation | Purpose |
|-----------|---------------|---------|
| **Source whitelist** | Only approved passive sources used | Prevent accidental direct contact |
| **DNS resolution bypass** | No DNS queries to target nameservers | Avoid DNS log entries |
| **TLS verification skip** | No TLS handshakes with target | Avoid connection log entries |
| **Referrer suppression** | No referrer headers in source requests | Prevent referrer tracking |
| **User-agent rotation** | Generic user-agents for source queries | Prevent fingerprinting |

## Usage

```bash
# Passive reconnaissance on a domain
/ghost-recon example.com

# Investigate an IP address
/ghost-recon 203.0.113.42

# Full passive profile of an organization
/ghost-recon --target=example.com --depth=full

# Quick infrastructure overview
/ghost-recon example.com --mode=infrastructure

# Certificate transparency focused
/ghost-recon example.com --mode=certificates

# Historical web presence analysis
/ghost-recon example.com --mode=historical

# Export structured intelligence
/ghost-recon example.com --format=json --output=ghost-intel.json

# Multiple target investigation
/ghost-recon example.com secondary.com --correlate

# Continuous passive monitoring
/ghost-recon example.com --monitor --interval=daily
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `target` | string | required | Target domain, IP address, or organization name |
| `--depth` | string | standard | Investigation depth: quick, standard, full |
| `--mode` | string | all | Focus mode: all, infrastructure, certificates, historical, social, code |
| `--format` | string | text | Output format: text, json, markdown, html |
| `--output` | string | stdout | Output file path |
| `--correlate` | flag | false | Correlate findings across multiple targets |
| `--monitor` | flag | false | Enable continuous monitoring |
| `--interval` | string | weekly | Monitoring interval: daily, weekly, monthly |
| `--timeout` | integer | 120 | Per-source timeout in seconds |
| `--sources` | string | all | Comma-separated list of specific sources |
| `--historical-depth` | string | 5y | How far back to search archives |
| `--confidence-threshold` | float | 0.5 | Minimum confidence for reported findings |

## Execution Flow

1. **Target Classification**: The target input is classified as a domain, IP address, CIDR range, or organization name. This classification determines which source categories are applicable and how source queries are constructed.

2. **Source Selection**: Based on the target type and requested mode, the ghost-recon-operator selects the appropriate subset of passive sources. Each source is validated for availability before collection begins.

3. **Parallel Passive Collection**: Selected sources are queried in parallel with strict rate limiting to avoid triggering abuse detection on the source services themselves. All queries go to third-party services, never to the target.

4. **Data Normalization**: Raw responses from different sources are normalized into a common intelligence schema with consistent field names, data types, and provenance records.

5. **Temporal Reconstruction**: Historical data points are organized into a timeline showing how the target's infrastructure, certificates, DNS records, and web presence have changed over time.

6. **Entity Resolution**: Discovered assets (subdomains, IP addresses, services, certificates) are linked through shared attributes to build a comprehensive asset map.

7. **Infrastructure Mapping**: Network relationships between discovered assets are mapped, including shared hosting, CDN usage, load balancer distribution, and geographic distribution.

8. **Confidence Assessment**: Each finding is assigned a confidence score based on source reliability, data freshness, and corroboration across multiple sources.

9. **Report Generation**: Findings are compiled into a structured intelligence report with sections for infrastructure overview, certificate analysis, historical changes, and identified risks.

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `ghost-recon-operator` | Specialized passive collection agent |
| [/investigate](/commands/investigate/) | Parent investigation suite | Ghost recon is one collection mode |
| [/email-osint](/commands/email-osint/) | Email-centric variant | Complementary email-focused collection |
| [/intel-export](/commands/intel-export/) | Report packaging | Exports findings for external analysis |
| [NABLA Framework](/glossary/nabla-infinity/) | Epistemic validation | Source plurality enforced |
| [Quality Gates](/glossary/quality-gates/) | Intelligence quality | Confidence scoring and validation |
| [Telemetry](/glossary/telemetry/) | Execution [metrics](/glossary/metrics/) | Source response times and coverage |
| [Prismatic Perimeter](/apps/prismatic-perimeter/) | Attack surface context | EASM data enriches ghost recon findings |

## Best Practices

**Always start passive.** Begin any investigation with ghost reconnaissance before considering active techniques. Passive collection reveals the target's visible attack surface without any risk of detection, providing the foundation for subsequent investigation phases.

**Validate source freshness.** Passive sources often contain stale data. Certificate transparency logs are near-real-time, but Shodan scan data might be days or weeks old. Always check timestamps on findings before making assessments based on them.

**Cross-reference multiple sources.** A finding from a single source should be treated with lower confidence than one corroborated by multiple independent sources. The `--correlate` option helps identify findings supported by multiple data points.

**Use temporal analysis.** Changes in infrastructure over time often reveal more than a point-in-time snapshot. Historical DNS changes can indicate infrastructure migrations, certificate rotations can reveal organizational structure, and web archive changes can show feature deployments.

**Combine with EASM.** Ghost recon findings feed naturally into the [Prismatic Perimeter](/apps/prismatic-perimeter/) External Attack Surface Management system, providing the passive foundation for ongoing security monitoring.

**Document your authorization.** Even passive reconnaissance should be conducted under proper authorization. While zero-footprint collection does not touch the target, organizational policies and legal frameworks may still govern intelligence collection activities.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `target_classification_failed` | Cannot determine target type | Specify explicitly with `--type=domain` or `--type=ip` |
| `source_unavailable` | Passive source is temporarily down | Source skipped; remaining sources continue |
| `rate_limit_exceeded` | Source rate limit hit | Automatic backoff and retry |
| `no_passive_data` | No data found for target in passive sources | Target may have minimal internet presence |
| `correlation_timeout` | Entity resolution exceeded timeout | Reduce number of targets or increase `--timeout` |
| `historical_archive_gap` | Wayback Machine has no data for period | Gap noted in timeline; other sources may fill it |

## Advanced Usage

### Attack Surface Enumeration

Use ghost recon for comprehensive passive attack surface enumeration.

```bash
# Full attack surface discovery
/ghost-recon example.com --depth=full --mode=infrastructure --format=json

# Enumerate subdomains passively
/ghost-recon example.com --mode=certificates --extract=subdomains

# Map IP ranges
/ghost-recon example.com --mode=infrastructure --extract=ip-ranges
```

### Change Detection

Monitor targets for infrastructure changes over time.

```bash
# Set up baseline
/ghost-recon example.com --format=json --output=baseline.json

# Compare against baseline later
/ghost-recon example.com --compare=baseline.json
```

### Multi-Target Correlation

Investigate relationships between multiple organizations or domains.

```bash
# Correlate infrastructure overlap between two organizations
/ghost-recon company-a.com company-b.com --correlate --mode=infrastructure

# Find shared hosting, shared certificates, or DNS overlap
/ghost-recon target1.com target2.com target3.com --correlate --extract=shared-assets
```

### Integration with Perimeter EASM

Feed ghost recon findings directly into the Prismatic Perimeter for ongoing monitoring.

```bash
/ghost-recon example.com --format=json | /perimeter import --source=ghost-recon
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. All available passive sources are queried; the investigation is thorough and complete within the zero-footprint constraint.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every finding includes source attribution, confidence scoring, and temporal context per [NABLA](/glossary/nabla-infinity/) axioms.

## Related Commands

- [/investigate](/commands/investigate/) - Launch comprehensive [OSINT](/glossary/osint/) investigation across 121+ sources
- [/email-osint](/commands/email-osint/) - Email-based OSINT gathering with breach correlation and social profiling
- [/google-hacking](/commands/google-hacking/) - Google dorking and advanced search intelligence extraction
- [/intel-export](/commands/intel-export/) - Generate comprehensive intelligence packages for external LLM analysis
- [/git-forensics](/commands/git-forensics/) - Cynical git history analysis distinguishing signal from noise
- [/perimeter](/commands/perimeter/) - External Attack Surface Management dashboard

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)