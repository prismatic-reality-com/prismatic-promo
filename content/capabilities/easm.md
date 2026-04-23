+++
title = "External Attack Surface Management"
weight = 13
[extra]
icon = "shield"
color = "red"
description = "Continuous external attack surface discovery, security ratings (A-F), asset inventory, and NIS2/ZKB compliance assessment"
category = "security"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1029
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["External", "Attack", "Surface", "Management", "Continuous", "NIS2ZKB", "capabilities", "security", "Prismatic Platform", "None"]
tags = ["capabilities", "security", "external-attack-surface-management", "prismatic"]
quality_score = 75
see_also = ["glossary", "agents", "architecture"]
image = "/images/sections/capabilities.png"
image_alt = "External Attack Surface Management - Prismatic Platform"
+++

## Overview

External Attack Surface Management (EASM) is the Prismatic Platform's capability for continuously discovering, inventorying, and assessing an organization's externally visible digital assets. The EASM module -- implemented as [Prismatic Perimeter](/apps/prismatic-perimeter/) -- provides security ratings on an A-F grading scale, automated asset discovery across domains, IP ranges, certificates, cloud resources, and services, and real-time compliance assessment against NIS2 and ZKB regulatory frameworks. It operates as a competitive alternative to commercial platforms such as BitSight, SecurityScorecard, and Black Kite, with the architectural advantage of deep integration into the Prismatic intelligence and epistemic verification stack.

EASM addresses a fundamental problem in modern cybersecurity: organizations cannot defend what they do not know they have. Shadow IT, forgotten subdomains, expired certificates, misconfigured cloud storage, and unmonitored third-party services all represent attack surface that adversaries actively enumerate and exploit. The Prismatic EASM module automates the discovery and continuous monitoring of this surface, transforming it from an unknown risk into a measured, scored, and managed security domain.

## Security Ratings

### A-F Grading System

The EASM module produces a security rating for every assessed entity using a dual-scale system: a letter grade (A through F) for executive communication and a numeric score (300-900) for granular tracking and trend analysis.

| Grade | Score Range | Interpretation | Risk Level |
|-------|-----------|----------------|------------|
| **A** | 810-900 | Excellent security posture, minimal exposure | Low |
| **B** | 720-809 | Good posture, minor issues identified | Low-Moderate |
| **C** | 630-719 | Acceptable posture, notable gaps present | Moderate |
| **D** | 540-629 | Below average, significant exposure detected | High |
| **F** | 300-539 | Critical failures, immediate remediation required | Critical |

Ratings are computed from evidence-based findings across multiple assessment categories, each weighted according to its contribution to overall risk:

| Category | Weight | Assessment Scope |
|----------|--------|-----------------|
| **Network Security** | 25% | Open ports, exposed services, firewall posture |
| **DNS & Email Security** | 20% | SPF, DKIM, DMARC, DNSSEC, zone transfer exposure |
| **Certificate Management** | 15% | Validity, chain integrity, algorithm strength, CT log presence |
| **Application Security** | 15% | HTTP headers, TLS configuration, known vulnerabilities |
| **Cloud & Infrastructure** | 15% | Misconfigured storage, exposed APIs, metadata endpoints |
| **Compliance Alignment** | 10% | Regulatory framework adherence (NIS2, ZKB) |

### Rating Computation

```elixir
# Security rating assessment
{:ok, rating} = PrismaticPerimeter.security_rating("target-organization.com")
# => %{
#   grade: :B,
#   score: 780,
#   industry_percentile: 72,
#   categories: %{
#     network_security: 82,
#     dns_email: 91,
#     certificate_management: 85,
#     application_security: 68,
#     cloud_infrastructure: 72,
#     compliance: 78
#   },
#   trend: :improving,
#   last_assessed: ~U[2026-02-14 10:30:00Z]
# }
```

Every score component carries provenance metadata tracing it back to specific discovered assets and identified findings, satisfying the [Provenance Mandatory](/glossary/provenance-mandatory/) NABLA axiom.

## Asset Discovery

### Discovery Pipeline

The asset discovery process enumerates an organization's external attack surface through multiple reconnaissance techniques:

```
Seed Domain --> DNS Enumeration --> Certificate Transparency --> Port Scanning --> Service Fingerprinting --> Cloud Discovery --> Asset Inventory
     |               |                      |                       |                    |                       |                  |
  target.com    Subdomains            SSL/TLS Certs            Open Ports          Service Versions         S3/GCS/Azure        Unified
               A/AAAA/MX/NS        CT Log Mining              TCP/UDP              Banner Grab             Blob Detection       Registry
```

### Asset Categories

| Asset Type | Discovery Method | Metadata Captured |
|------------|-----------------|-------------------|
| **Domains & Subdomains** | DNS brute-force, certificate transparency, zone transfers | IP resolution, registrar, WHOIS, DNS records |
| **IP Addresses** | Reverse DNS, BGP prefix analysis, historical records | Geolocation, ASN, hosting provider, reputation |
| **Certificates** | CT log monitoring, direct TLS probing | Issuer, validity, SANs, key algorithm, chain |
| **Cloud Resources** | Provider-specific enumeration, DNS CNAME patterns | Service type, region, access configuration |
| **Web Applications** | HTTP probing, technology fingerprinting | Server, framework, CMS, response headers |
| **Email Infrastructure** | MX/SPF/DKIM/DMARC record analysis | Provider, authentication policy, relay configuration |
| **Exposed Services** | Port scanning, service identification | Protocol, version, known vulnerabilities |

### Continuous Monitoring

Asset discovery is not a one-time scan but a continuous process. The platform maintains a living inventory that detects changes in real time:

| Change Type | Detection Method | Response |
|-------------|-----------------|----------|
| **New asset appears** | Delta comparison against previous inventory | Classify, score, alert if unmanaged |
| **Asset configuration changes** | Configuration drift detection | Re-assess, update score, flag if degradation |
| **Asset disappears** | Presence verification failure | Investigate, update inventory, check for decommission |
| **Vulnerability disclosed** | CVE feed correlation with asset inventory | Match to affected assets, recalculate scores |
| **Certificate approaching expiry** | Temporal monitoring with configurable thresholds | Alert at 30/14/7/1 day intervals |

## NIS2 and ZKB Compliance

### NIS2 Directive (EU 2022/2555)

The Network and Information Security Directive 2 is the European Union's comprehensive cybersecurity regulation. The EASM module maps discovered assets and findings to NIS2 requirements:

| NIS2 Article | EASM Assessment | Automated Check |
|-------------|----------------|----------------|
| **Art. 21(2)(a)** | Risk analysis and IS policies | Policy evidence from DNS/header configuration |
| **Art. 21(2)(b)** | Incident handling | Contact and abuse reporting mechanisms |
| **Art. 21(2)(d)** | Supply chain security | Third-party asset and dependency tracking |
| **Art. 21(2)(e)** | Network security | Exposed service audit, segmentation evidence |
| **Art. 21(2)(g)** | Cybersecurity practices | Encryption enforcement, authentication evidence |
| **Art. 21(2)(h)** | Cryptography and encryption | TLS version, cipher suite, certificate strength |
| **Art. 21(2)(j)** | Multi-factor authentication | MFA evidence from exposed authentication endpoints |

### ZKB 264/2025 Sb. (Czech Republic)

The Czech cybersecurity decree (Zakon o kyberneticke bezpecnosti) imposes specific requirements on operators of essential services. The EASM module assesses compliance with:

| ZKB Requirement | EASM Mapping | Assessment |
|-----------------|-------------|------------|
| **Asset inventory** | Complete external asset enumeration | Coverage completeness score |
| **Risk assessment** | Evidence-based scoring per asset | Risk score with provenance |
| **Access control** | Exposed authentication endpoints | Administrative panel detection |
| **Network security** | Open port and service analysis | Segmentation and exposure audit |
| **Cryptographic controls** | TLS/certificate assessment | Algorithm and configuration review |
| **Incident reporting** | Contact availability verification | Abuse contact and SOC presence |

### Compliance Dashboard

```elixir
# Assess compliance against both frameworks
{:ok, assessment} = PrismaticPerimeter.assess_compliance("target.com", [:nis2, :zkb])
# => %{
#   nis2: %{
#     overall: :partially_compliant,
#     score: 72,
#     articles_assessed: 10,
#     articles_compliant: 7,
#     gaps: [
#       %{article: "21(2)(d)", finding: "No supply chain monitoring detected"},
#       %{article: "21(2)(j)", finding: "MFA not enforced on admin panels"}
#     ]
#   },
#   zkb: %{
#     overall: :compliant,
#     score: 85,
#     requirements_assessed: 8,
#     requirements_met: 8
#   }
# }
```

## Competitive Positioning

The Prismatic EASM module occupies the same market segment as established commercial platforms but differentiates through its architectural integration with the broader intelligence stack:

| Capability | Prismatic Perimeter | BitSight | SecurityScorecard | Black Kite |
|-----------|-------------------|----------|-------------------|------------|
| **Security Ratings** | A-F (300-900) | 250-900 | 0-100 | 0-100 |
| **Asset Discovery** | Continuous, multi-method | Daily scans | Daily-weekly | Daily |
| **EU Compliance** | NIS2 + ZKB native | Limited EU | General compliance | GDPR focus |
| **Czech Registry** | Native integration (ARES, ISIR) | None | None | None |
| **Intelligence Fusion** | 121+ OSINT sources via NABLA | Proprietary feeds | Proprietary feeds | Limited OSINT |
| **Epistemic Verification** | Trinity Gate + NABLA axioms | None | None | None |
| **Self-Hosted Option** | Full control, on-premise capable | SaaS only | SaaS only | SaaS only |
| **Evidence Provenance** | Full chain per finding | Summary only | Summary only | Summary only |

The key differentiator is epistemic rigor: every EASM finding passes through the same [NABLA axiom](/capabilities/nabla-axioms/) verification and [Trinity Gate](/capabilities/trinity-gate/) validation that governs all platform intelligence products. Ratings are not opaque numbers but fully traceable evidence chains that analysts can inspect, challenge, and verify.

## Architecture

### LiveView Dashboard

The EASM dashboard is built with Phoenix LiveView, providing real-time updates as discovery scans complete and findings are scored:

```
/perimeter           -- Main dashboard with overview metrics and rating summary
/perimeter/assets    -- Full asset inventory with filtering and search
/perimeter/compliance -- NIS2/ZKB compliance assessment detail
/perimeter/easm      -- Advanced EASM dashboard with scan management
```

### OTP Process Architecture

```
PrismaticPerimeter.Supervisor
  |-- DiscoveryWorker (GenServer pool -- parallel asset enumeration)
  |-- ScoringEngine (GenServer -- rating computation and caching)
  |-- ComplianceAssessor (GenServer -- regulatory framework mapping)
  |-- AssetRegistry (ETS-backed -- real-time asset inventory)
  |-- AlertManager (GenServer -- threshold monitoring and notification)
```

Each component runs as an independent OTP process with supervision, ensuring that a failure in one assessment domain does not cascade to others.

## Integration

- Scores feed into [Intelligence Synthesis](/capabilities/intelligence-synthesis/) for holistic entity risk assessment
- Monitored through [Real-Time Monitoring](/capabilities/real-time-monitoring/) infrastructure
- Verified by [Trinity Gate](/capabilities/trinity-gate/) epistemic validation
- Governed by [NABLA Axioms](/capabilities/nabla-axioms/) for evidence-based scoring
- Quality enforced by [NO MERCY](/capabilities/no-mercy/) zero-tolerance standards
- Agent operations tracked via [Telemetry Integration](/capabilities/telemetry-integration/)
- Supports [Color Teams](/capabilities/color-teams/) with external threat surface data
- Automated through [AIAD Standard](/capabilities/aiad-standard/) agent orchestration

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)