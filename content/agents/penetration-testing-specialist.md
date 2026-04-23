+++
title = "penetration-testing-specialist"
weight = 292
[extra]
domain = "infrastructure"
level = "L3"
description = "Ethical hacking and security assessment expert"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ets", "dynamic-supervisor", "circuit-breaker", "umbrella-application", "postgresql", "aiad"]
domain_normalized = "infrastructure"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2200
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["penetration-testing-specialist", "Ethical", "agents", "agent", "Prismatic Platform", "Penetration Testing", "Testing", "Security"]
tags = ["agents", "agent", "penetration-testing-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "penetration-testing-specialist - Prismatic Platform"
+++

## Overview

The Penetration Testing Specialist operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform's infrastructure domain, providing authorized security assessment through systematic vulnerability discovery and exploitation verification. This agent conducts ethical hacking operations against platform infrastructure, web applications, APIs, and network services to identify security weaknesses before they can be exploited by adversaries. All operations are conducted within strictly defined authorization boundaries and documented engagement rules.

Built on the [AIAD](@/glossary/aiad.md) standard and integrated with the platform's [OTP](@/glossary/otp.md)-based [supervision tree](@/glossary/supervision-tree.md) architecture, the agent executes security assessment campaigns as supervised processes with [circuit breaker](@/glossary/circuit-breaker.md) patterns preventing assessment activities from impacting production service availability. The [NO DOUBTS](@/glossary/no-doubts.md) principle governs all findings: no vulnerability is reported without a verified proof-of-concept demonstrating exploitability, and all risk ratings include quantified confidence levels based on testing depth and environmental factors.

## Theoretical Foundations

Penetration testing methodology follows a structured approach derived from industry frameworks including OWASP Testing Guide, PTES (Penetration Testing Execution Standard), and NIST SP 800-115 (Technical Guide to Information Security Testing and Assessment). The agent implements a five-phase testing methodology: reconnaissance, vulnerability identification, exploitation verification, post-exploitation analysis, and remediation guidance.

The formal security model employed by the agent maps the platform's [attack surface](@/glossary/attack-surface.md) as a directed graph where nodes represent system components and edges represent potential attack vectors. Penetration testing campaigns systematically traverse this graph, testing each edge for exploitability while tracking the cumulative risk exposure of successful attack chains. This graph-based model enables the agent to identify multi-step attack scenarios that individual vulnerability scanners would miss.

Security findings are classified using CVSS v3.1 (Common Vulnerability Scoring System) for severity quantification, supplemented with platform-specific risk factors that account for the sensitivity of affected components and the availability of compensating controls. The agent maintains a vulnerability knowledge base that maps discovered weaknesses to CWE (Common Weakness Enumeration) categories for systematic classification.

## Operational Domain

The infrastructure domain coverage for penetration testing spans the platform's entire technical stack: [Phoenix](@/glossary/phoenix.md) web application endpoints, [LiveView](@/glossary/liveview.md) WebSocket connections, REST API authentication and authorization mechanisms, [PostgreSQL](@/glossary/postgresql.md) database access controls, [ETS](@/glossary/ets.md) table access patterns, inter-process [message passing](@/glossary/message-passing.md) security, deployment infrastructure (Fly.io), and CI/CD pipeline integrity.

Testing environments are isolated from production through dedicated staging infrastructure that mirrors production configuration. The agent never performs destructive testing against production systems, using staging environments for exploitation verification and production systems only for non-invasive reconnaissance and configuration analysis.

## Key Capabilities

- **Web application security testing** -- Assesses [Phoenix](@/glossary/phoenix.md) web applications for OWASP Top 10 vulnerabilities including injection, broken authentication, sensitive data exposure, XML external entities, broken access control, security misconfiguration, cross-site scripting, insecure deserialization, known vulnerable components, and insufficient logging

- **API security assessment** -- Tests REST and WebSocket API endpoints for authentication bypass, authorization escalation, rate limit evasion, injection vulnerabilities, and improper input validation with focus on the platform's auto-introspecting API architecture

- **Infrastructure security evaluation** -- Assesses network configuration, TLS implementations, container security (Docker), deployment platform configuration (Fly.io), and secrets management practices for configuration weaknesses

- **[BEAM](@/glossary/beam.md) runtime security** -- Evaluates Erlang distribution protocol security, cookie-based authentication, remote code execution risks through node connections, and hot-code-reload security implications unique to the BEAM ecosystem

- **Authentication and authorization testing** -- Verifies that authentication mechanisms resist credential stuffing, session hijacking, and token manipulation, and that authorization controls enforce proper access boundaries across all protected resources

- **Automated vulnerability scanning** -- Executes automated scanning tools against platform infrastructure with results validated through manual verification to eliminate false positives before reporting

- **Social engineering assessment** -- Evaluates organizational resilience against social engineering vectors including phishing simulation and pretexting scenarios (simulation-only, with explicit authorization)

## Authority Level

**L3** - Strategic Command - Multi-domain coordination with authority to initiate authorized security assessments across platform infrastructure and publish findings that trigger security remediation workflows.

## Assessment Methodology

Each penetration testing engagement follows a standardized methodology:

1. **Scope Definition** -- Establish testing boundaries, authorized targets, excluded systems, and rules of engagement
2. **Reconnaissance** -- Gather information about target systems through passive and active enumeration
3. **Vulnerability Identification** -- Discover potential security weaknesses through automated scanning and manual analysis
4. **Exploitation Verification** -- Confirm exploitability of discovered vulnerabilities with controlled proof-of-concept demonstrations
5. **Impact Assessment** -- Evaluate the business impact of confirmed vulnerabilities including data exposure, service disruption, and lateral movement potential
6. **Reporting** -- Produce structured findings with severity ratings, reproduction steps, and remediation recommendations
7. **Remediation Verification** -- Re-test after fixes are applied to confirm successful vulnerability resolution

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/pentest engage` | Initiate authorized penetration testing campaign | L3+ |
| `/pentest status` | Display current assessment progress and preliminary findings | L3+ |
| `/pentest report` | Generate detailed penetration testing report | L3+ |
| `/pentest retest` | Verify remediation of previously identified vulnerabilities | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [osint-technical-security-specialist](@/agents/osint-technical-security-specialist.md) | OSINT reconnaissance provides initial attack surface intelligence |
| [performance-monitoring-specialist](@/agents/performance-monitoring-specialist.md) | Monitors infrastructure during testing to detect unintended impacts |
| [code-quality-commander](@/agents/code-quality-commander.md) | Security findings inform code quality assessment of affected components |
| [prismatic-supreme-commander](@/agents/prismatic-supreme-commander.md) | Critical vulnerability escalation and strategic security response |

## Safety Protocols

All penetration testing operations execute within strict safety boundaries:

| Protocol | Enforcement |
|----------|-------------|
| **Authorization Required** | No testing without explicit scope authorization document |
| **Staging First** | Exploitation testing conducted in staging, never production |
| **Circuit Breakers** | Automatic halt if testing impacts service availability |
| **Audit Logging** | Immutable audit trail for every testing action |
| **Time Boundaries** | Testing campaigns have defined start/end times |
| **Rollback Capability** | All testing modifications reversible to pre-test state |

## Enforcement

Penetration testing findings are enforced under the [NO MERCY](@/glossary/no-mercy.md) doctrine: confirmed vulnerabilities with CVSS scores above 7.0 (High) trigger mandatory remediation timelines, and Critical (9.0+) vulnerabilities block deployment until resolved. All findings carry full reproduction evidence per [NO DOUBTS](@/glossary/no-doubts.md) requirements, enabling development teams to verify and remediate issues efficiently. Security assessment results are tracked through the platform's [telemetry](@/glossary/telemetry.md) system for trend analysis and organizational security maturity measurement.

## Related Agents

Agents in the **infrastructure** domain collaborate with security-focused agents across multiple domains to provide layered security coverage, with the Penetration Testing Specialist contributing active security validation that complements passive monitoring, configuration analysis, and OSINT-based security assessment.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)