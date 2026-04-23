+++
title = "Attack Surface"
weight = 45
[extra]
category = "security"
description = "The sum of all points where an attacker can attempt to enter or extract data from a system, including exposed services, APIs, domains, certificates, and cloud resources."
related_terms = ["easm", "shodan", "censys", "greynoise", "risk-score", "color-teams", "tls", "rest-api", "rate-limiting", "encryption-at-rest"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1221
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Attack", "Surface", "APIs", "glossary", "security", "Prismatic Platform", "EASM"]
tags = ["glossary", "security", "attack-surface", "prismatic"]
quality_score = 77
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Attack Surface - Prismatic Platform"
+++

## Definition

An attack surface is the total set of points (attack vectors) where an unauthorized user can attempt to enter data into, extract data from, or otherwise interact with a system without authorization. It encompasses all externally reachable infrastructure: exposed network services and open ports, API endpoints, web applications, domain names and subdomains, SSL/[TLS](@/glossary/tls.md) certificates, DNS records, cloud resources (storage buckets, serverless functions, container registries), email servers, VPN gateways, remote access interfaces, and any other component accessible from outside the organizational perimeter. The attack surface also includes the human dimension -- employees susceptible to phishing, social engineering, or credential theft.

Attack surface management (ASM) is the discipline of continuously discovering, inventorying, classifying, prioritizing, and monitoring these exposure points. Unlike vulnerability management (which focuses on known software flaws), ASM addresses the fundamental question: "What can an attacker see and reach?" A smaller, well-monitored attack surface reduces security risk not by eliminating vulnerabilities but by reducing the number of places where vulnerabilities can exist and be exploited. Conversely, an unknown or unmanaged attack surface -- shadow IT, forgotten subdomains, expired certificates, misconfigured cloud resources -- represents uncontrolled risk that no amount of vulnerability scanning can address.

The modern attack surface extends far beyond traditional network perimeters. Cloud adoption, SaaS integrations, third-party supply chains, remote work infrastructure, and the proliferation of APIs have expanded the typical organization's attack surface by orders of magnitude. External Attack Surface Management ([EASM](@/glossary/easm.md)) specifically addresses the externally visible portion of this surface -- what an attacker can discover and target from the public internet, without any insider access or credentials.

## Context in Prismatic

The Prismatic Platform's [EASM](@/glossary/easm.md) module, part of Prismatic Perimeter, automates attack surface discovery and continuous monitoring for organizations. The scanner probes domains, IP ranges, certificates, DNS records, cloud resources, and third-party integrations to build a comprehensive inventory of an organization's external exposure. Each discovered asset is classified by type, assigned a [risk score](@/glossary/risk-score.md), monitored for changes, and mapped into the platform's [knowledge graph](@/glossary/knowledge-graph.md) for relationship analysis. The system competes with commercial tools like BitSight, Black Kite, and SecurityScorecard, providing security ratings (A-F grades with numeric scores 300-900) and compliance assessment against NIS2 and ZKB frameworks.

The platform's own attack surface is minimized through architectural decisions: only two Phoenix [endpoints](@/glossary/endpoint.md) are exposed (port 4000 for the dashboard, port 4004 for the [REST API](@/glossary/rest-api.md)), all traffic is [TLS](@/glossary/tls.md)-encrypted, authentication uses [JWT](@/glossary/jwt.md) tokens with [RBAC](@/glossary/rbac.md), and [rate limiting](@/glossary/rate-limiting.md) prevents abuse. The [Color Teams](@/glossary/color-teams.md) continuously assess the platform's own security posture through adversarial simulation.

## Attack Surface Categories

The attack surface is typically categorized into three domains:

### Network Attack Surface

All externally reachable network endpoints:

| Asset Type | Discovery Method | Risk Factor | Example |
|-----------|-----------------|-------------|---------|
| **Open Ports** | Port scanning ([Shodan](@/glossary/shodan.md)) | Exposed services | SSH on 22, HTTP on 80/443 |
| **DNS Records** | DNS enumeration | Subdomain exposure | dev.example.com, staging.example.com |
| **IP Ranges** | WHOIS, BGP analysis | Network footprint | 203.0.113.0/24 |
| **TLS Certificates** | CT log monitoring ([Censys](@/glossary/censys.md)) | Domain discovery | *.internal.example.com |
| **Email Servers** | MX record lookup | Phishing entry point | mail.example.com |
| **VPN Endpoints** | Service scanning | Remote access vector | vpn.example.com:443 |

### Software Attack Surface

All software components exposed to external input:

| Component | Exposure | Risk Factor | Prismatic Response |
|-----------|---------|-------------|-------------------|
| **Web Applications** | HTTP/HTTPS interfaces | Injection, XSS, CSRF | Phoenix CSRF protection, input validation |
| **API Endpoints** | [REST](@/glossary/rest-api.md)/[GraphQL](@/glossary/graphql.md) interfaces | Auth bypass, data exposure | [OpenAPI](@/glossary/openapi.md) validation, RBAC |
| **Dependencies** | Third-party libraries | Supply chain attacks | [Hex](@/glossary/hex.md) audit, lockfile verification |
| **Containers** | [Docker](@/glossary/docker.md) images | Base image vulnerabilities | Minimal images, regular updates |
| **Runtime** | [BEAM](@/glossary/beam.md) VM, ERTS | Runtime exploits | Current Erlang/Elixir versions |

### Human Attack Surface

The organizational dimension of security exposure:

| Vector | Method | Mitigation |
|--------|--------|-----------|
| **Phishing** | Deceptive emails/sites | Employee training, email filtering |
| **Credential Theft** | Password reuse, breaches | MFA, password managers, breach monitoring |
| **Social Engineering** | Impersonation, pretexting | Verification procedures, security awareness |
| **Insider Threat** | Malicious or negligent insiders | Least privilege, audit logging, DLP |
| **Supply Chain** | Compromised vendor access | Vendor security assessment, access controls |

## EASM Discovery Pipeline

The Prismatic Perimeter scanner discovers attack surface assets through a multi-stage pipeline:

```
Target Domain (e.g., example.com)
      |
      v
  1. DNS Enumeration
      |  A/AAAA, MX, TXT, NS, CNAME records
      |  Subdomain brute-force and permutation
      v
  2. Certificate Transparency
      |  CT log monitoring for *.example.com certs
      |  Historical certificate analysis
      v
  3. Service Discovery
      |  Port scanning across discovered IPs
      |  Service fingerprinting and version detection
      v
  4. Cloud Resource Discovery
      |  S3 bucket enumeration, Azure blob, GCP storage
      |  Serverless function discovery
      v
  5. Web Application Analysis
      |  Technology fingerprinting, header analysis
      |  WAF detection, CDN identification
      v
  6. Third-Party Integration Discovery
      |  SaaS integrations, API dependencies
      |  Supply chain mapping
      v
  Asset Inventory --> Risk Scoring --> Security Rating --> Compliance Assessment
```

## Risk Scoring and Security Ratings

Each discovered asset contributes to the organization's overall security rating:

| Factor | Weight | Scoring Criteria | Impact |
|--------|--------|-----------------|--------|
| **Vulnerability Exposure** | 30% | Known CVEs in exposed services | Higher CVE severity = lower score |
| **TLS Configuration** | 20% | Protocol version, cipher strength, cert validity | Weak TLS = significant penalty |
| **DNS Security** | 15% | DNSSEC, SPF, DKIM, DMARC configuration | Missing records = moderate penalty |
| **Exposed Services** | 15% | Unnecessary open ports, admin interfaces | Each unnecessary service = penalty |
| **Patch Cadence** | 10% | Time to patch known vulnerabilities | Slow patching = score decay |
| **Cloud Configuration** | 10% | Public buckets, misconfigured resources | Each misconfiguration = penalty |

```elixir
defmodule PrismaticPerimeter.SecurityRating do
  @moduledoc "Calculate A-F security ratings from attack surface analysis."

  @type grade :: :A | :B | :C | :D | :F
  @type rating :: %{grade: grade(), score: 300..900, confidence: float()}

  @spec calculate(map()) :: {:ok, rating()} | {:error, atom()}
  def calculate(%{assets: assets, vulnerabilities: vulns, tls: tls_config}) do
    score =
      base_score()
      |> apply_vulnerability_penalty(vulns)
      |> apply_tls_assessment(tls_config)
      |> apply_exposure_assessment(assets)
      |> clamp(300, 900)

    {:ok, %{grade: score_to_grade(score), score: score, confidence: 0.92}}
  end

  defp score_to_grade(score) when score >= 850, do: :A
  defp score_to_grade(score) when score >= 700, do: :B
  defp score_to_grade(score) when score >= 550, do: :C
  defp score_to_grade(score) when score >= 400, do: :D
  defp score_to_grade(_score), do: :F
end
```

| Grade | Score Range | Interpretation | Industry Percentile |
|-------|-----------|----------------|-------------------|
| **A** | 850-900 | Excellent security posture | Top 10% |
| **B** | 700-849 | Good with minor gaps | Top 30% |
| **C** | 550-699 | Average, improvement needed | Middle 40% |
| **D** | 400-549 | Below average, significant gaps | Bottom 30% |
| **F** | 300-399 | Critical security issues | Bottom 10% |

## Compliance Mapping

Attack surface findings map directly to regulatory compliance requirements:

| Regulation | Relevant Requirements | Attack Surface Coverage |
|-----------|----------------------|------------------------|
| **NIS2 (EU 2022/2555)** | Risk management, incident reporting, supply chain security | Full: asset inventory, vulnerability tracking, third-party assessment |
| **ZKB 264/2025 Sb.** | Critical infrastructure protection, cyber hygiene | Full: Czech-specific compliance mapping |
| **GDPR** | Data protection, breach notification | Partial: data exposure detection, certificate monitoring |
| **ISO 27001** | ISMS, risk assessment, asset management | Full: continuous asset inventory and risk assessment |

## Attack Surface Reduction Strategies

| Strategy | Implementation | Impact |
|----------|---------------|--------|
| **Minimize Exposed Services** | Close unnecessary ports, disable unused APIs | Fewer entry points |
| **Network Segmentation** | Isolate internal services from public access | Reduced blast radius |
| **Default Deny** | Whitelist-only firewall rules | Only explicitly allowed traffic |
| **Certificate Management** | Automated renewal, CT monitoring | No expired/mismatched certs |
| **DNS Hygiene** | Remove stale records, enable DNSSEC | Reduced subdomain takeover risk |
| **Dependency Auditing** | Regular `mix hex.audit`, lockfile review | Reduced supply chain risk |
| **[Encryption at Rest](@/glossary/encryption-at-rest.md)** | Encrypt all stored data | Data protection if storage breached |
| **API Hardening** | Schema validation, [rate limiting](@/glossary/rate-limiting.md), auth | Reduced API abuse surface |

## OSINT Sources for Attack Surface Discovery

The platform integrates multiple OSINT sources for comprehensive discovery:

| Source | Data Provided | Update Frequency | Coverage |
|--------|-------------|------------------|----------|
| **[Shodan](@/glossary/shodan.md)** | Open ports, service banners, vulnerabilities | Continuous scanning | Global IPv4 |
| **[Censys](@/glossary/censys.md)** | Certificates, hosts, protocols | Weekly full scan | Global internet |
| **[GreyNoise](@/glossary/greynoise.md)** | Internet noise classification | Real-time | IP intelligence |
| **Certificate Transparency** | All publicly issued TLS certificates | Real-time | All public CAs |
| **DNS Datasets** | Zone files, passive DNS | Daily to weekly | Major TLDs |
| **BGP Routing** | IP prefix announcements | Real-time | Global routing |
| **WHOIS** | Domain registration details | On-demand | All registrars |

## Continuous Monitoring

Attack surfaces change constantly. Continuous monitoring detects changes in real-time:

| Change Type | Detection Method | Alert Priority |
|------------|-----------------|---------------|
| **New subdomain** | DNS monitoring, CT logs | Medium |
| **New open port** | Periodic port scanning | High |
| **Certificate expiry** | Certificate monitoring | Critical (< 30 days) |
| **New vulnerability** | CVE database correlation | Severity-dependent |
| **Configuration change** | Header/response monitoring | Medium |
| **New cloud resource** | Cloud API monitoring | High |
| **Domain expiry** | WHOIS monitoring | Critical (< 30 days) |

## Related Terms

- [EASM](@/glossary/easm.md) - External Attack Surface Management system
- [Shodan](@/glossary/shodan.md) - Internet-wide port and service scanner
- [Censys](@/glossary/censys.md) - Certificate and host discovery platform
- [GreyNoise](@/glossary/greynoise.md) - Internet noise and scanner classification
- [Risk Score](@/glossary/risk-score.md) - Quantified risk assessment per asset
- [Color Teams](@/glossary/color-teams.md) - Security teams analyzing attack surfaces
- [TLS](@/glossary/tls.md) - Transport encryption assessed in attack surface analysis
- [REST API](@/glossary/rest-api.md) - API endpoints constituting software attack surface
- [Rate Limiting](@/glossary/rate-limiting.md) - Protection reducing API attack surface exposure
- [Encryption at Rest](@/glossary/encryption-at-rest.md) - Data protection for stored assets

## See Also

- [prismatic_perimeter](../../../apps/prismatic_perimeter/README.md) -- EASM application mapping external attack surfaces
- [prismatic_perimeter_core](../../../apps/prismatic_perimeter_core/README.md) -- Attack surface discovery and classification logic
- [prismatic_osint_network](../../../apps/prismatic_osint_network/README.md) -- Network reconnaissance for surface enumeration
- [prismatic_detection_engine](../../../apps/prismatic_detection_engine/README.md) -- Detection engine for attack surface anomalies
- [Architecture](@/architecture/_index.md) -- Platform security architecture

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)