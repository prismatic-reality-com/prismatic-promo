+++
title = "Security Ratings and EASM: How Prismatic Perimeter Scores Your Attack Surface"
date = 2026-02-19
description = "A technical breakdown of how Prismatic Perimeter computes security ratings (A-F), discovers external assets, and assesses NIS2/ZKB compliance. Transparent methodology with evidence-based scoring."

[extra]
author = "Tomáš Korcak (korczis)"
category = "product"
tags = ["easm", "security-ratings", "perimeter", "nis2", "compliance", "attack-surface"]
reading_time = "8 min"
keywords = ["external attack surface management", "security ratings methodology", "EASM tool", "NIS2 compliance tool", "security scorecard alternative", "BitSight alternative", "attack surface discovery"]
image = "/images/blog/easm-security-ratings.png"
word_count = 408
date_created = "2026-02-23"
date_modified = "2026-02-23"
quality_score = 42
see_also = ["easm", "attack-surface", "risk-score", "security-assessment", "nis2"]
image_alt = "Security Ratings and EASM: How Prismatic Perimeter Scores Your Attack Surface - Prismatic Platform"
+++

External Attack Surface Management (EASM) is the practice of continuously discovering, monitoring, and assessing an organization's internet-facing assets. [Prismatic Perimeter](/capabilities/easm/) is our EASM capability, designed to provide transparent, evidence-based security ratings that compete with established vendors like BitSight, Black Kite, and SecurityScorecard.

This post explains how the scoring methodology works.

## The Rating Scale

Prismatic Perimeter assigns letter grades from A (best) to F (worst) with numeric scores on a 300-900 scale:

| Grade | Score Range | Description |
|-------|-----------|-------------|
| A | 800-900 | Excellent security posture |
| B | 700-799 | Good, minor improvements needed |
| C | 600-699 | Average, notable gaps exist |
| D | 400-599 | Below average, significant risks |
| F | 300-399 | Critical security failures |

## Asset Discovery

The first step is enumerating the external attack surface. Perimeter discovers:

- **Domains and subdomains** -- DNS enumeration, certificate transparency logs
- **IP addresses** -- Reverse DNS, ASN mapping, BGP route analysis
- **TLS certificates** -- Certificate chain validation, expiry tracking
- **Cloud resources** -- S3 buckets, Azure blobs, GCP storage
- **Exposed services** -- Port scanning, service fingerprinting
- **Web applications** -- Technology detection, security header analysis

## Scoring Dimensions

The security rating is computed across multiple dimensions, each contributing a weighted score:

### DNS Security (15%)
- DNSSEC validation
- SPF, DKIM, DMARC configuration
- DNS zone transfer protection
- Nameserver diversity

### TLS/Certificate Health (20%)
- Certificate validity and chain completeness
- Protocol version (TLS 1.2+ required)
- Cipher suite strength
- HSTS deployment

### Web Application Security (25%)
- Security headers (CSP, X-Frame-Options, X-Content-Type-Options)
- Cookie security flags
- Mixed content detection
- Open redirect vulnerabilities

### Network Exposure (20%)
- Unnecessary open ports
- Service version currency
- Known vulnerability correlation (CVE matching)
- Default credential exposure

### Compliance Alignment (20%)
- NIS2 Directive (EU 2022/2555) requirement mapping
- ZKB 264/2025 Sb. (Czech cybersecurity regulation)
- Evidence of incident response capability
- Supply chain risk documentation

## Evidence-Based Transparency

Every factor contributing to a rating is traceable to specific evidence:

```elixir
{:ok, rating} = PrismaticPerimeter.security_rating("example.com")

# rating.grade => :B
# rating.score => 780
# rating.factors => [
#   %{dimension: :tls, finding: "TLS 1.2+ on all endpoints", impact: +40},
#   %{dimension: :dns, finding: "Missing DNSSEC", impact: -25},
#   %{dimension: :web, finding: "CSP header present", impact: +30},
#   ...
# ]
```

No black-box scores. Every point gain or deduction is explainable.

## NIS2 Compliance Assessment

The EU NIS2 Directive (2022/2555) requires essential and important entities to implement specific cybersecurity measures. Perimeter maps discovered assets against NIS2 requirements:

- **Article 21** -- Cybersecurity risk-management measures
- **Article 23** -- Reporting obligations
- **Article 24** -- Supply chain security

The compliance assessment produces a gap analysis with remediation guidance, not just a pass/fail result.

## Getting Started

Assess any domain's attack surface with a single API call:

```bash
curl -X POST https://api.prismatic-reality.com/v1/perimeter/discover \
  -H "Content-Type: application/json" \
  -d '{"domain": "your-company.com"}'
```

Or use the [SDK](/developers/sdk/):

```typescript
const surface = await prismatic.perimeter.discover("your-company.com");
console.log(`Grade: ${surface.rating.grade}, Score: ${surface.rating.score}`);
```

## Further Reading

- **[Perimeter Dashboard](/capabilities/easm/)** -- Interactive EASM overview
- **[Due Diligence](/dd/)** -- How EASM integrates with DD workflows
- **[Compliance](/capabilities/compliance/)** -- NIS2 and ZKB regulatory details
- **[API Reference](/api/)** -- Full Perimeter API endpoints

---

*Prismatic Perimeter is available as part of the enterprise platform. Contact us for a security assessment of your organization.*
