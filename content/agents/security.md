+++
title = "Security Operations Agents"
weight = 3
[extra]
icon = "shield"
color = "red"
agent_count = 38
commands = ["/security-audit", "/perimeter", "/cer-vet", "/cer-screen"]
description = "External attack surface management, compliance assessment, and defensive security operations"
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 705
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Security", "Operations", "Agents", "External", "Prismatic Platform", "EASM", "Color", "Team", "Full"]
tags = ["agents", "security-operations-agents", "prismatic"]
quality_score = 60
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "Security Operations Agents - Prismatic Platform"
+++

## Overview

Security Operations agents handle defensive security, compliance assessment, and external [attack surface](/glossary/attack-surface/) management within the Prismatic Platform. These agents integrate with the Color-Team framework for adversarial-defensive synthesis, forming a comprehensive security operations center that protects the platform while simultaneously providing security assessment capabilities as a core product offering through [Prismatic Perimeter](/glossary/prismatic-perimeter/).

The security domain is unique within the Prismatic agent ecosystem because it serves a dual purpose: protecting the platform itself from security threats while also providing security intelligence and assessment services to external targets. This duality demands that security agents maintain impeccable operational security -- the tools used to assess external attack surfaces must not themselves become attack vectors, and the intelligence gathered through OSINT operations must be handled with appropriate classification and access controls.

With 38 agents spanning vulnerability assessment, compliance verification, incident response, and attack surface management, the security domain represents one of the largest specialized agent groups in the platform. These agents operate under the strictest enforcement of the [NO MERCY](/glossary/no-mercy/) doctrine, where security violations receive zero tolerance regardless of development velocity pressures.

## Agent Roster

| Agent | Level | Role | Specialization |
|-------|-------|------|----------------|
| **perimeter-scanner** | L3 | [EASM](/glossary/easm/) | External attack surface discovery |
| **compliance-auditor** | L3 | Compliance | [NIS2](/glossary/nis2/), [ZKB](/glossary/zkb/), [GDPR](/glossary/gdpr/) assessment |
| **vulnerability-analyst** | L3 | Vuln Assessment | [CVE](/glossary/cve/) correlation, risk scoring |
| **cer-vetter** | L2 | Supplier Risk | CER/NIS2 supplier vetting |
| **security-rater** | L2 | Scoring | A-F security grade calculation |
| **[security-audit-specialist](/agents/security-audit-specialist/)** | L3 | Code Security | OWASP compliance, vulnerability analysis |
| **[security-operations-specialist](/agents/security-operations-specialist/)** | L3 | SecOps | Monitoring, threat detection, incident response |
| **[secrets-management-specialist](/agents/secrets-management-specialist/)** | L3 | Secrets | Credential management, vault integration, rotation |

## Key Capabilities

### External Attack Surface Management (EASM)

[Prismatic Perimeter](/glossary/prismatic-perimeter/) provides comprehensive EASM capabilities that compete with industry leaders such as BitSight, Black Kite, and SecurityScorecard. The EASM module discovers, catalogs, and continuously monitors an organization's externally visible digital assets.

| Component | Function | Output |
|-----------|----------|--------|
| **Asset Discovery** | Enumerate domains, subdomains, IPs | Full asset inventory |
| **Certificate Analysis** | SSL/[TLS](/glossary/tls/) certificate validation | Expiry alerts, misconfigs |
| **Service Detection** | Port scanning, service fingerprinting | Service inventory |
| **Vulnerability Scanning** | CVE detection, misconfig finding | Risk-prioritized vulns |
| **[Security Rating](/glossary/security-rating/)** | Aggregate scoring (A-F) | Comparable industry benchmark |
| **Cloud Asset Discovery** | Cloud resource enumeration | Cloud asset inventory |

### Security Rating Methodology

The platform's security rating system provides quantitative, comparable security assessments using a weighted multi-domain scoring model.

```
Security Score = Sum(Domain Weights * Factor Scores)

Domains:
  Network Security (25%)    - Firewall, ports, protocols
  Application Security (25%) - Headers, cookies, HTTPS
  DNS Security (15%)        - DNSSEC, SPF, DMARC, DKIM
  Email Security (15%)      - Mail server config, encryption
  Reputation (10%)          - Blacklists, malware history
  Patching Cadence (10%)    - Update frequency, CVE response

Grade Mapping:
  A: 850-900 (Excellent)
  B: 700-849 (Good)
  C: 550-699 (Fair)
  D: 400-549 (Poor)
  F: 300-399 (Critical)
```

Each domain score is computed from multiple individual factors, weighted by their reliability and relevance. The methodology emphasizes evidence-based scoring per [NABLA Infinity](/glossary/nabla-infinity/) axioms -- every score component traces back to observable, verifiable evidence collected through automated scanning.

### Compliance Frameworks

Security agents assess compliance against multiple regulatory frameworks relevant to the platform's European operational context.

| Framework | Jurisdiction | Requirements | Agent Coverage |
|-----------|--------------|--------------|----------------|
| **NIS2** | EU | Critical infrastructure security | Full assessment |
| **ZKB 264/2025** | Czech Republic | Cybersecurity obligations | Full assessment |
| **GDPR** | EU | Data protection and privacy | Data handling audit |
| **[ISO 27001](/glossary/iso-27001/)** | International | ISMS certification | Control mapping |
| **OWASP Top 10** | International | Web application security | Continuous monitoring |

### Color-Team Integration

Security operations agents integrate deeply with the platform's six-team Color-Team framework, creating a continuous adversarial-defensive improvement cycle.

| Team | Security Integration |
|------|---------------------|
| **Red Team** | Adversarial simulations test security agent detection capabilities |
| **Blue Team** | Defensive posture feeds from security monitoring agents |
| **Purple Team** | Synthesis of Red-Blue findings improves security agent effectiveness |
| **Gray Team** | Boundary exploration reveals security monitoring edge cases |
| **White Team** | Formal verification of security agent correctness |
| **Black Team** | Theoretical threat models inform security architecture decisions |

## Integration Points

- **[Color Teams](/glossary/color-teams/)**: [Blue Team](/glossary/blue-team/) defensive posture feeds, Red Team validation
- **Perimeter Dashboard**: [LiveView](/glossary/liveview/) [real-time monitoring](/capabilities/real-time-monitoring/) at `/perimeter`
- **Alert System**: Automated notification on rating changes and security events
- **Report Generation**: Compliance documentation and executive summaries
- **Quality Gates**: Security checks integrated into CI/CD deployment pipeline
- **[Telemetry](/glossary/telemetry/)**: Security metrics published under `:prismatic, :security` namespace

## Commands

| Command | Description | Authority |
|---------|-------------|-----------|
| `/perimeter` | EASM dashboard access | L2+ |
| `/security-audit` | Multi-agent security assessment | L3 |
| `/cer-vet` | CER supplier vetting | L2+ |
| `/cer-screen` | Employee/contractor screening | L2+ |
| `/compliance-check` | Framework compliance assessment | L2+ |
| `/secops status` | Security operations center status | L3+ |
| `/secrets scan` | Secret detection scan | L3+ |

## Operational Security

Security agents themselves are subject to stringent operational security requirements. All security scanning operations are logged with full audit trails. Intelligence gathered through OSINT and EASM operations is classified and access-controlled. Security agent configurations are reviewed under the same security audit process applied to application code. No security agent operates outside the [AIAD](/glossary/aiad/) standard's behavioral rules, and all security operations comply with the [NO MERCY](/glossary/no-mercy/) doctrine's zero-tolerance enforcement.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)