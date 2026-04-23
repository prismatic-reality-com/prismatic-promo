+++
title = "/perimeter-assets"
weight = 1430
[extra]
category = "Perimeter"
description = "Asset inventory with domain, IP, certificate discovery"
syntax = "/perimeter-assets [options]"
authority = "L2+"
agent = "perimeter-scanner"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1123
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["perimeter-assets", "Asset", "commands", "Perimeter", "Prismatic Platform", "Discovery", "OSINT"]
tags = ["commands", "perimeter", "perimeter-assets", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/perimeter-assets - Prismatic Platform"
+++

## Overview

**/perimeter-assets** is a production command in the **Perimeter** category of the Prismatic Platform that manages the comprehensive asset inventory for External Attack Surface Management (EASM). The command discovers, catalogs, and monitors an organization's external-facing digital assets including domains, subdomains, IP addresses, SSL/TLS certificates, cloud resources, exposed services, and web applications. It serves as the foundational data layer for the Prismatic Perimeter module, which competes with commercial EASM platforms such as BitSight, Black Kite, and SecurityScorecard.

Asset discovery operates through multiple complementary techniques: DNS enumeration (forward and reverse), certificate transparency log analysis, WHOIS correlation, web crawling with link extraction, cloud resource fingerprinting, and port scanning. These discovery methods are orchestrated in parallel to build a comprehensive inventory that represents the organization's true external attack surface -- including assets that the organization may not be aware of (shadow IT, forgotten subdomains, expired certificates still resolving).

This command operates under the **L2+** authority level and is executed by the `perimeter-scanner` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The perimeter scanner agent specializes in network reconnaissance and asset classification, leveraging the platform's OSINT capabilities for comprehensive external surface mapping.

The asset inventory produced by this command feeds into the security rating engine ([/perimeter](/commands/perimeter/)), compliance assessment framework ([/perimeter-compliance](/commands/perimeter-compliance/)), and the advanced EASM dashboard ([/perimeter-easm](/commands/perimeter-easm/)). Each discovered asset is assigned a risk score based on its configuration, exposure level, and known vulnerability status. The inventory represents the ground truth of an organization's external exposure -- the foundation upon which all subsequent security assessment and compliance checking is built.

## Syntax and Usage

```bash
/perimeter-assets [options]
```

The command supports multiple operational modes: discovery, listing, monitoring, enrichment, and export.

```bash
# Discover assets for a domain
/perimeter-assets --discover example.com

# List all known assets
/perimeter-assets --list

# List assets filtered by type
/perimeter-assets --list --type=domain

# Discover with specific techniques
/perimeter-assets --discover example.com --techniques=dns,certs,whois

# Deep subdomain enumeration
/perimeter-assets --discover example.com --deep --max-depth=5

# Discover and assess risk
/perimeter-assets --discover example.com --assess-risk

# Monitor assets for changes
/perimeter-assets --monitor --interval=24h

# Export asset inventory
/perimeter-assets --export --format=csv --output=/tmp/assets.csv

# Enrich existing assets with additional data
/perimeter-assets --enrich --type=certificates
```

## Parameters and Options

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--discover` | string | none | Target domain for asset discovery |
| `--list` | boolean | false | List known assets |
| `--type` | enum | all | Asset type filter: `domain`, `ip`, `certificate`, `service`, `cloud`, `webapp` |
| `--techniques` | string | all | Discovery techniques: `dns`, `certs`, `whois`, `crawl`, `cloud`, `ports` |
| `--deep` | boolean | false | Enable deep enumeration with recursive subdomain discovery |
| `--max-depth` | integer | 3 | Maximum recursion depth for deep enumeration |
| `--assess-risk` | boolean | false | Calculate risk scores for discovered assets |
| `--monitor` | boolean | false | Enable continuous monitoring mode |
| `--interval` | string | 24h | Monitoring check interval |
| `--export` | boolean | false | Export asset inventory |
| `--format` | enum | table | Output format: `table`, `json`, `csv`, `markdown` |
| `--output` | path | stdout | Output destination |
| `--enrich` | boolean | false | Enrich existing assets with additional data |
| `--confidence` | float | 0.6 | Minimum confidence for asset inclusion |
| `--include-inactive` | boolean | false | Include assets that no longer resolve |
| `--tag` | string | none | Tag discovered assets for organization |
| `--scope` | enum | external | Discovery scope: `external`, `full` |

The `--confidence` parameter controls the threshold for including assets in the inventory. Assets confirmed through multiple discovery techniques receive higher confidence scores. A confidence of 0.6 (default) requires at least moderate evidence; increasing to 0.8 filters to high-confidence assets only. Lowering to 0.3 includes speculative discoveries for investigation.

## Implementation Architecture

The asset discovery system implements a parallel pipeline architecture with multiple specialized scanners feeding into a unified asset correlation engine.

```
Target Domain
    |
    v
[Discovery Orchestrator]
    |
    +---> [DNS Scanner]
    |     +---> Forward DNS (A, AAAA, CNAME, MX, NS, TXT, SRV)
    |     +---> Reverse DNS (PTR records for IP ranges)
    |     +---> Zone transfer attempts (AXFR)
    |     +---> Subdomain brute-force (wordlist-based)
    |
    +---> [Certificate Scanner]
    |     +---> CT Log analysis (crt.sh, Censys)
    |     +---> Certificate chain validation
    |     +---> SAN (Subject Alternative Name) extraction
    |     +---> Expiration monitoring
    |
    +---> [WHOIS Correlator]
    |     +---> Domain registration data
    |     +---> IP allocation (ASN, netblock)
    |     +---> Registrant correlation
    |
    +---> [Web Crawler]
    |     +---> Link extraction and following
    |     +---> Technology fingerprinting
    |     +---> Form and API endpoint discovery
    |
    +---> [Cloud Scanner]
    |     +---> S3 bucket enumeration
    |     +---> Azure blob detection
    |     +---> GCP resource fingerprinting
    |
    +---> [Port Scanner]
          +---> Common service ports
          +---> Service version detection
          +---> Protocol identification
    |
    v
[Asset Correlator]
    +---> Deduplication (same asset, different discovery paths)
    +---> Relationship mapping (domain -> IP -> certificate)
    +---> Confidence scoring (multi-source confirmation)
    +---> Risk assessment (exposure + vulnerability)
    |
    v
Asset Inventory (PostgreSQL + ETS cache)
```

The Asset Correlator is particularly important for avoiding duplicate entries and establishing relationships between assets. A single web server may be discovered through DNS resolution, certificate transparency, and web crawling -- the correlator recognizes these as the same asset and merges the discovery evidence while preserving the provenance of each discovery path. The correlation algorithm uses multiple identity signals (IP address, hostname, certificate fingerprint) to match assets discovered through different techniques.

The risk assessment module evaluates each asset against a comprehensive set of risk indicators: SSL/TLS configuration quality, HTTP security headers, known vulnerability exposure, certificate expiration proximity, DNS configuration issues, and cloud resource access controls. Each indicator contributes to a composite risk score that categorizes the asset as HIGH, MEDIUM, or LOW risk.

## Examples

### Initial Asset Discovery

```bash
/perimeter-assets --discover example.com --deep --assess-risk
# Discovered 47 assets:
#   Domains: 23 (12 subdomains, 8 MX, 3 NS)
#   IP Addresses: 15 (3 IPv6, 12 IPv4)
#   Certificates: 6 (2 expiring within 30 days)
#   Services: 18 (HTTP, HTTPS, SMTP, DNS)
#   Cloud Resources: 3 (2 S3 buckets, 1 Azure blob)
# Risk Assessment: 4 HIGH, 12 MEDIUM, 31 LOW
```

### Continuous Monitoring

```bash
/perimeter-assets --monitor --interval=6h --discover example.com
# Monitors for: new subdomains, certificate changes, service exposure changes
# Alerts on: new assets, disappeared assets, risk score changes
```

### Targeted Certificate Audit

```bash
/perimeter-assets --list --type=certificate --format=json
# Lists all discovered certificates with expiration dates, chain validity,
# cipher suites, and compliance status
```

### Export for Executive Reporting

```bash
/perimeter-assets --export --format=csv --output=/tmp/asset-inventory.csv
# Produces a CSV suitable for import into spreadsheet tools or executive reports
```

## Integration with Platform

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `perimeter-scanner` | Network reconnaissance expertise |
| [/perimeter](/commands/perimeter/) | Parent command | Security rating dashboard |
| [/perimeter-compliance](/commands/perimeter-compliance/) | Compliance assessment | Asset data feeds compliance checks |
| [/perimeter-easm](/commands/perimeter-easm/) | Advanced dashboard | Full EASM visualization |
| [/investigate](/commands/investigate/) | OSINT enrichment | Deep investigation of discovered assets |
| [Telemetry](/glossary/telemetry/) | Discovery metrics | Scan timing, asset counts, coverage |
| PostgreSQL | Persistent storage | Asset inventory database |
| ETS | Runtime cache | Fast asset lookup and correlation |

## Workflow Integration

The `/perimeter-assets` command is the entry point for the Prismatic Perimeter EASM workflow:

1. **Initial Discovery**: Run `/perimeter-assets --discover` for a target domain to establish the baseline asset inventory. Deep enumeration with risk assessment provides the comprehensive initial view.

2. **Inventory Review**: Export the inventory for stakeholder review and asset classification. Tag assets by business unit, criticality, or ownership using the `--tag` parameter.

3. **Risk Assessment**: Assess risk scores for all discovered assets to prioritize remediation efforts. High-risk assets (expired certificates, misconfigured services, exposed cloud resources) are flagged for immediate attention.

4. **Compliance Checking**: Feed the asset inventory into [/perimeter-compliance](/commands/perimeter-compliance/) for NIS2 and ZKB compliance assessment. The compliance framework evaluates each asset against regulatory requirements.

5. **Continuous Monitoring**: Establish ongoing monitoring with configurable intervals to detect changes in the attack surface. New assets, disappeared assets, and risk score changes trigger alerts.

6. **Incident Investigation**: When suspicious assets are discovered, use [/investigate](/commands/investigate/) for deep OSINT enrichment to determine whether the asset is legitimate or represents a security concern.

## NABLA Compliance

Asset discovery adheres to [NABLA](/glossary/nabla-infinity/) epistemic axioms rigorously:

| Axiom | Enforcement |
|-------|-------------|
| **Signal Plurality** | Assets must be confirmed through multiple discovery techniques for high confidence |
| **Provenance Mandatory** | Discovery method, timestamp, and raw evidence tracked for every asset |
| **Contradiction Preservation** | Both current and historical asset states maintained in the evidence chain |
| **Time Decay** | Recency weights assigned; stale entries flagged for re-verification |
| **Source Independence** | DNS, certificate, WHOIS, and crawl scanners operate independently |
| **Unknown Valid** | Uncertain assets reported with confidence scores rather than suppressed |

The multi-technique discovery approach directly implements Signal Plurality: an asset discovered only through DNS is marked with lower confidence than one confirmed through both DNS and certificate transparency. This graduated confidence model ensures that the inventory's reliability is transparent to downstream consumers.

## Performance

| Metric | Target | Typical |
|--------|--------|---------|
| DNS enumeration | < 30s | ~15s (per domain) |
| Certificate scan | < 60s | ~25s (CT log query) |
| WHOIS correlation | < 15s | ~5s (per domain) |
| Full discovery | < 5min | ~2min (standard depth) |
| Deep discovery | < 15min | ~8min (max depth) |
| Asset listing | < 500ms | ~100ms (ETS cached) |
| Monitoring cycle | < 2min | ~45s (incremental) |
| Export generation | < 10s | ~3s |

Discovery performance depends on the target domain's complexity (number of subdomains, IP ranges, certificates) and the selected techniques. DNS enumeration is typically the fastest component, while certificate transparency log queries involve external API calls that introduce network latency. The monitoring cycle is faster than initial discovery because it performs incremental checking against the known inventory rather than full enumeration.

## Related Commands

- [/perimeter](/commands/perimeter/) - External [attack surface](/glossary/attack-surface/) management dashboard and overview
- [/perimeter-compliance](/commands/perimeter-compliance/) - [NIS2](/glossary/nis2/) and [ZKB](/glossary/zkb/) compliance assessment with gap analysis
- [/perimeter-easm](/commands/perimeter-easm/) - Advanced EASM dashboard with [security rating](/glossary/security-rating/)s (A-F)
- [/investigate](/commands/investigate/) - Launch comprehensive [OSINT](/glossary/osint/) investigation across 121+ sources
- [/email-osint](/commands/email-osint/) - Email-based OSINT gathering with breach correlation and social profiling
- [/google-hacking](/commands/google-hacking/) - Google dorking and advanced search intelligence extraction

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)