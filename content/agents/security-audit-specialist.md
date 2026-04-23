+++
title = "security-audit-specialist"
weight = 363
[extra]
domain = "development"
level = "L3"
description = "Comprehensive security auditing with vulnerability analysis, OWASP compliance, and remediation guidance"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ecto", "phoenix", "liveview", "aiad", "ets", "hot-code-reload"]
domain_normalized = "development"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2200
quality_score = 85
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["security-audit-specialist", "Comprehensive", "OWASP", "agents", "agent", "Prismatic Platform", "Verify", "Audit", "BEAM", "OWASP Top"]
tags = ["agents", "agent", "security-audit-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "security-audit-specialist - Prismatic Platform"
+++

## Overview

The security-audit-specialist operates as an L3 Strategic Command authority within the Prismatic Platform's development domain, responsible for conducting comprehensive security audits that encompass vulnerability analysis, [OWASP](/glossary/owasp/) Top 10 compliance verification, dependency security assessment, and actionable remediation guidance across the entire 90-application umbrella. In a platform that handles intelligence data, implements OSINT operations, and manages external attack surface assessments, the security posture must be exemplary -- the platform cannot credibly assess others' security while harboring its own vulnerabilities.

Built on the [AIAD](/glossary/aiad/) standard, this agent applies systematic security analysis methodologies adapted for the [Elixir](/glossary/elixir/)/[OTP](/glossary/otp/) ecosystem. While OWASP guidelines were developed primarily for web applications, many security principles require reinterpretation for [BEAM](/glossary/beam/) virtual machine applications where process isolation, message passing, and immutable data structures provide inherent security properties that differ from traditional web stacks. The agent understands these distinctions and calibrates its audit methodology accordingly.

## Operational Domain

The development domain for security auditing encompasses the complete application codebase, third-party dependencies (Hex packages), configuration files, deployment manifests, and runtime behavior of all platform applications. The agent performs both static analysis (examining code without execution) and behavioral analysis (assessing how applications handle adversarial inputs during operation). The domain extends to [Phoenix](/glossary/phoenix/) web endpoints, [LiveView](/glossary/liveview/) socket connections, API authentication mechanisms, database query construction, file upload handling, and cross-origin resource sharing configurations.

The scope also includes the platform's own security tools -- [Prismatic Perimeter](/glossary/prismatic-perimeter/) EASM capabilities, Color-Team simulation infrastructure, and intelligence gathering components -- which must themselves be audited to prevent the security assessment tools from becoming attack vectors.

## Key Capabilities

- **OWASP Top 10 compliance assessment** -- Evaluates each application against the current OWASP Top 10 categories, including injection, broken authentication, sensitive data exposure, XML external entities, broken access control, security misconfiguration, cross-site scripting, insecure deserialization, vulnerable components, and insufficient logging
- **Dependency vulnerability scanning** -- Analyzes all Hex package dependencies for known CVEs and security advisories, prioritizing vulnerabilities by exploitability and impact within the platform's specific usage context
- **[Ecto](/glossary/ecto/) query injection analysis** -- Verifies that all database interactions use parameterized queries through Ecto's query DSL rather than string interpolation, preventing SQL injection in [PostgreSQL](/glossary/postgresql/) operations
- **Authentication and authorization review** -- Audits the platform's authentication mechanisms, session management, RBAC (Role-Based Access Control) enforcement, and API key validation across all entry points
- **[LiveView](/glossary/liveview/) security assessment** -- Evaluates LiveView-specific security concerns including socket authentication, event handler input validation, and server-side state management
- **[Autonomous operation](/capabilities/autonomous-self-healing/)** with continuous security monitoring that detects newly introduced vulnerabilities
- **[Telemetry integration](/capabilities/telemetry-integration/)** publishing security audit metrics under the `:prismatic, :security_audit` namespace

## Audit Methodology

The security audit process follows a structured methodology that ensures comprehensive coverage while maintaining reproducibility across audit cycles.

| Phase | Activities | Output |
|-------|-----------|--------|
| **Reconnaissance** | Map application attack surface, identify entry points, catalog data flows | Attack surface inventory |
| **Static Analysis** | Code pattern scanning, dependency checking, configuration review | Vulnerability candidates |
| **Dynamic Analysis** | Input validation testing, authentication boundary probing, error handling verification | Confirmed vulnerabilities |
| **Risk Assessment** | CVSS scoring, exploitability analysis, business impact evaluation | Prioritized risk register |
| **Remediation Planning** | Fix strategy development, code change proposals, verification test creation | Remediation roadmap |
| **Verification** | Post-remediation testing, regression validation, compliance confirmation | Audit completion certificate |

## BEAM-Specific Security Considerations

The [BEAM](/glossary/beam/) virtual machine provides several inherent security properties that the audit methodology accounts for.

| BEAM Property | Security Implication | Audit Focus |
|---------------|---------------------|-------------|
| **Process isolation** | Compromised process cannot directly access other process state | Verify isolation boundaries are maintained, no shared mutable state |
| **Immutable data** | Data cannot be modified after creation | Verify no unsafe use of `:ets` or ports that bypass immutability |
| **Pattern matching** | Input validation through structural matching | Verify exhaustive pattern coverage in security-critical paths |
| **Supervision trees** | Automatic process restart after crashes | Verify crash recovery doesn't skip security checks on restart |
| **[Hot code reload](/glossary/hot-code-reload/)** | Live code updates without downtime | Verify code loading security, prevent unauthorized module injection |

## Authority Level

**L3** - [Strategic Command](/glossary/strategic-command/) - Multi-domain coordination authority for security auditing across all development activities. The agent can mandate security fixes that block release progression and can escalate critical vulnerabilities to L1 Supreme Authority for emergency response.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/security-audit full` | Execute comprehensive security audit across all applications | L3+ |
| `/security-audit owasp` | Run OWASP Top 10 compliance check | L3+ |
| `/security-audit deps` | Scan all dependencies for known vulnerabilities | L2+ |
| `/security-audit app <name>` | Audit a specific umbrella application | L2+ |
| `/security-audit report` | Generate formal security audit report with findings and remediation guidance | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [security-operations-specialist](/agents/security-operations-specialist/) | Audit findings feed into operational security monitoring and incident response |
| [secrets-management-specialist](/agents/secrets-management-specialist/) | Audits verify that secret management practices meet security requirements |
| [code-quality-commander](/agents/code-quality-commander/) | Security quality metrics integrated into overall quality scoring |
| [blue-commander](/agents/blue-commander/) | Audit findings inform Blue Team defensive posture assessments |

## Vulnerability Classification

Discovered vulnerabilities are classified using a severity framework aligned with industry standards.

| Severity | CVSS Range | Response Time | Action Required |
|----------|-----------|---------------|----------------|
| **Critical** | 9.0 - 10.0 | Immediate | Emergency hotfix, L1 escalation |
| **High** | 7.0 - 8.9 | 24 hours | Priority fix, deployment block |
| **Medium** | 4.0 - 6.9 | 7 days | Scheduled remediation |
| **Low** | 0.1 - 3.9 | 30 days | Planned improvement |
| **Informational** | N/A | Next cycle | Best practice recommendation |

## Compliance Framework Integration

The security audit specialist evaluates platform compliance against multiple regulatory frameworks relevant to the platform's operational context.

| Framework | Jurisdiction | Key Requirements Assessed |
|-----------|-------------|--------------------------|
| **OWASP Top 10** | International | Web application security best practices |
| **NIS2 Directive** | European Union | Critical infrastructure cybersecurity |
| **ZKB 264/2025** | Czech Republic | National cybersecurity obligations |
| **GDPR** | European Union | Data protection and privacy |
| **[ISO 27001](/glossary/iso-27001/)** | International | Information Security Management System |

## Enforcement

The [NO MERCY](/glossary/no-mercy/) doctrine requires that all identified security vulnerabilities are remediated according to their severity timelines. No critical or high-severity vulnerability may persist past its response deadline. Security audit findings are tracked with full provenance per [NABLA Infinity](/glossary/nabla-infinity/) requirements, ensuring that every vulnerability has a documented discovery path, assessment rationale, and remediation verification record.

## Related Agents

Agents in the **development** domain collaborate with the security-audit-specialist to ensure that security considerations are embedded throughout the development lifecycle rather than applied as an afterthought. The agent's audit findings propagate to quality gates, deployment pipelines, and operational monitoring to create a continuous security improvement loop.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)