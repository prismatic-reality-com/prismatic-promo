+++
title = "EASM: Automating External Attack Surface Discovery"
date = 2026-03-17
description = "How Prismatic Perimeter discovers and monitors an organization's internet-facing assets using DNS enumeration, certificate transparency, port scanning, and continuous monitoring."

[extra]
author = "Tomas Korcak (korczis)"
category = "product"
tags = ["easm", "perimeter", "security", "attack-surface", "monitoring", "discovery"]
reading_time = "9 min"
keywords = ["external attack surface management", "EASM discovery", "attack surface monitoring", "asset discovery automation", "security posture management", "continuous security monitoring"]
image = "/images/blog/easm-discovery.png"
word_count = 1600
date_created = "2026-03-17"
date_modified = "2026-03-17"
quality_score = 84
see_also = ["capabilities", "architecture", "osint"]
image_alt = "EASM: Automating External Attack Surface Discovery - Prismatic Platform"
+++

Your attack surface is everything an adversary can see from the internet. Most organizations do not know the full extent of theirs. Shadow IT, forgotten subdomains, test environments left running, third-party services with your data -- the external attack surface grows faster than security teams can track.

Prismatic Perimeter is our External Attack Surface Management (EASM) system. It discovers, catalogs, and continuously monitors internet-facing assets. This post explains the discovery process.

## Discovery Pipeline

Asset discovery operates in six phases:

### Phase 1: DNS Enumeration

Starting from a root domain, we enumerate subdomains through multiple methods:

- **Zone transfer attempts** -- rarely successful but worth trying
- **Dictionary brute-forcing** -- common subdomain names (www, mail, api, staging, dev)
- **Certificate Transparency logs** -- CT logs contain every certificate ever issued, including subdomain names
- **Passive DNS** -- historical DNS resolution data from public datasets

CT logs are the most productive source. A single query can reveal hundreds of subdomains that would take hours to discover through brute-forcing.

### Phase 2: IP Resolution

Each discovered hostname resolves to one or more IP addresses. We map the IP space:

- **A/AAAA records** -- direct IP resolution
- **CNAME chains** -- following aliases to final destinations
- **ASN mapping** -- identifying which autonomous system owns the IP
- **Reverse DNS** -- discovering other hostnames on the same IP
- **BGP route analysis** -- understanding IP block ownership

### Phase 3: Service Discovery

For each IP address, we identify running services:

- **Port scanning** -- TCP SYN scan on common ports (top 1000)
- **Service fingerprinting** -- identify the software behind each port
- **Version detection** -- determine software versions for CVE matching
- **TLS inspection** -- cipher suites, protocol versions, certificate chains

### Phase 4: Web Application Analysis

For HTTP/HTTPS services, deeper analysis:

- **Technology detection** -- frameworks, CMS, server software
- **Security headers** -- CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- **Cookie security** -- HttpOnly, Secure, SameSite flags
- **Mixed content** -- HTTP resources loaded on HTTPS pages
- **Open redirects** -- unvalidated redirect parameters

### Phase 5: Cloud Asset Discovery

Modern attack surfaces extend into cloud providers:

- **S3 bucket enumeration** -- checking for publicly accessible buckets
- **Azure blob storage** -- similar enumeration for Azure
- **API endpoint discovery** -- identifying exposed API gateways
- **Container registries** -- checking for public Docker images

### Phase 6: Continuous Monitoring

Discovery is not a one-time event. The attack surface changes daily:

- **Scheduled rescans** -- full discovery runs weekly
- **CT log monitoring** -- real-time alerts for new certificates
- **DNS change detection** -- alerts when DNS records change
- **Port change detection** -- alerts when new services appear
- **Expiry tracking** -- alerts before certificates or domains expire

## Scoring Methodology

Each discovered asset contributes to the overall security rating (A-F scale, 300-900 score):

| Dimension | Weight | What It Measures |
|-----------|--------|-----------------|
| DNS Security | 15% | DNSSEC, SPF, DKIM, DMARC |
| TLS Health | 20% | Protocol versions, cipher strength, HSTS |
| Web Security | 25% | Security headers, cookie flags, CSP |
| Network Exposure | 20% | Open ports, service versions, CVEs |
| Compliance | 20% | NIS2, ZKB alignment, incident readiness |

Every factor is traceable to specific evidence. If your score drops, you can see exactly which finding caused the change and what to fix.

## NIS2 Compliance Mapping

The EU NIS2 Directive (2022/2555) requires essential and important entities to implement specific cybersecurity measures. Perimeter maps findings to NIS2 articles:

- **Article 21** -- risk management measures (mapped from security posture findings)
- **Article 23** -- reporting obligations (mapped from incident detection capabilities)
- **Article 24** -- supply chain security (mapped from third-party service analysis)

For Czech organizations, we also map against ZKB 264/2025 Sb. requirements, providing a gap analysis with remediation guidance.

## Architecture

Perimeter is implemented as a dedicated umbrella application:

```
prismatic_perimeter/
├── lib/
│   ├── discovery/          # Asset discovery modules
│   ├── analysis/           # Security analysis modules
│   ├── scoring/            # Rating calculation
│   ├── monitoring/         # Continuous monitoring
│   └── compliance/         # NIS2/ZKB mapping
└── test/

prismatic_perimeter_web/
├── lib/
│   └── live/
│       ├── dashboard_live.ex    # Main EASM dashboard
│       ├── asset_detail_live.ex # Individual asset view
│       └── compliance_live.ex   # Compliance gap analysis
└── test/
```

The dashboard at `/perimeter` provides real-time visibility into your attack surface with drill-down into individual assets.

## Getting Started

Discover your organization's attack surface:

```bash
# API
curl -X POST https://api.prismatic-reality.com/v1/perimeter/discover \
  -H "Content-Type: application/json" \
  -d '{"domain": "your-company.com"}'

# SDK
result = await prismatic.perimeter.discover("your-company.com")
```

The initial discovery typically completes within 5-15 minutes depending on the size of the attack surface. Continuous monitoring starts automatically after the first discovery.

---

*Explore the [EASM Dashboard](/capabilities/easm/) or read the [Security Ratings methodology](/blog/security-ratings-easm-explained/) for scoring details.*
