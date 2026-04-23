+++
title = "security-operations-specialist"
weight = 364
[extra]
domain = "infrastructure"
level = "L3"
description = "Security monitoring, threat detection, and incident response coordination"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ets", "dynamic-supervisor", "circuit-breaker", "umbrella-application", "postgresql", "aiad"]
domain_normalized = "infrastructure"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2150
quality_score = 84
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["security-operations-specialist", "Security", "agents", "agent", "Prismatic Platform", "High", "Strategic Command"]
tags = ["agents", "agent", "security-operations-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "security-operations-specialist - Prismatic Platform"
+++

## Overview

The security-operations-specialist operates as an L3 Strategic Command authority within the Prismatic Platform's infrastructure domain, responsible for continuous security monitoring, real-time threat detection, [incident response](@/glossary/incident-response.md) coordination, and operational security posture management across the platform's production and staging environments. While the [security-audit-specialist](@/agents/security-audit-specialist.md) focuses on proactive vulnerability discovery, this agent handles the operational reality of defending a running system against active threats, misconfigurations, and anomalous behavior.

Built on the [AIAD](@/glossary/aiad.md) standard and operating within the [OTP](@/glossary/otp.md) supervision framework, the security-operations-specialist maintains continuous awareness of the platform's security state through [telemetry](@/glossary/telemetry.md) event streams, log analysis, and behavioral monitoring. The [BEAM](@/glossary/beam.md) virtual machine provides unique advantages for security operations: process isolation enables fine-grained containment, [supervision trees](@/glossary/supervision-tree.md) provide automatic recovery from security-related crashes, and [ETS](@/glossary/ets.md) tables enable high-performance security event correlation without external dependencies.

## Operational Domain

The infrastructure domain for security operations encompasses the runtime security posture of all deployed platform components. This includes network-level monitoring (ingress and egress traffic patterns), application-level monitoring (authentication events, authorization decisions, data access patterns), and infrastructure-level monitoring (container health, resource utilization anomalies, deployment integrity verification). The agent maintains visibility across both the Fly.io production environment and staging environments, correlating events across boundaries to detect multi-stage attack patterns.

The domain extends to the security of the platform's own intelligence operations. When [Prismatic Perimeter](@/glossary/prismatic-perimeter.md) conducts EASM assessments or OSINT agents gather intelligence, the security operations specialist ensures these activities do not create exploitable attack surfaces or expose operational details to monitoring targets.

## Key Capabilities

- **Real-time threat detection** -- Processes security-relevant [telemetry](@/glossary/telemetry.md) events in real-time to identify indicators of compromise, brute force attempts, credential stuffing, and anomalous access patterns using [GenServer](@/glossary/genserver.md)-based event processing pipelines
- **Incident response coordination** -- Manages the incident response lifecycle from detection through containment, eradication, recovery, and post-incident analysis, coordinating with relevant specialist agents at each phase
- **Log analysis and correlation** -- Aggregates and correlates log data across all 90 umbrella applications to identify patterns that individual application logs would not reveal, such as distributed probing or lateral movement attempts
- **Configuration drift detection** -- Monitors security-relevant configurations for unauthorized changes, including firewall rules, TLS settings, authentication parameters, and access control lists
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with automated containment actions for high-confidence threat detections
- **[Circuit breaker](@/glossary/circuit-breaker.md) management** for security-sensitive external service connections, preventing compromise propagation through degraded integrations

## Threat Detection Architecture

The security operations specialist implements a multi-layered detection architecture that operates at different abstraction levels.

| Detection Layer | Data Source | Detection Method | Response Time |
|----------------|------------|-----------------|---------------|
| **Network** | Traffic patterns, connection metadata | Statistical anomaly detection | Sub-second |
| **Application** | Authentication events, API calls | Rule-based pattern matching | Seconds |
| **Behavioral** | User session patterns, data access | Baseline deviation analysis | Minutes |
| **Intelligence** | External threat feeds, CVE databases | Indicator matching | Hours |
| **Strategic** | Cross-layer correlation | Multi-signal synthesis | Continuous |

## Incident Response Protocol

The agent follows a structured incident response protocol aligned with industry frameworks and adapted for the [OTP](@/glossary/otp.md) ecosystem's unique capabilities.

| Phase | Activities | OTP-Specific Actions |
|-------|-----------|---------------------|
| **Preparation** | Runbook maintenance, tool readiness, team coordination | Supervision tree health verification, circuit breaker calibration |
| **Identification** | Event triage, scope assessment, severity classification | Process isolation analysis, message queue inspection |
| **Containment** | Limit damage, prevent spread, preserve evidence | Process termination via supervisor, ETS table snapshots |
| **Eradication** | Remove threat, patch vulnerability, harden defenses | [Hot code reload](@/glossary/hot-code-reload.md) for emergency patching |
| **Recovery** | Restore services, verify integrity, monitor for recurrence | Supervisor restart strategies, health check validation |
| **Lessons Learned** | Post-incident review, detection improvement, documentation | Telemetry rule updates, correlation pattern refinement |

## Security Event Classification

Security events are classified by severity and confidence to enable appropriate automated and manual responses.

| Severity | Confidence Required | Automated Response | Human Action |
|----------|-------------------|-------------------|--------------|
| **Critical** | High (>0.9) | Immediate containment, L1 alert | Emergency response activation |
| **Critical** | Medium (0.6-0.9) | Elevated monitoring, L2 alert | Investigation within 15 minutes |
| **High** | High (>0.9) | Rate limiting, access restriction | Investigation within 1 hour |
| **Medium** | Any | Event logging, metric increment | Review within 24 hours |
| **Low** | Any | Passive logging | Weekly review cycle |

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination authority for security operations with emergency powers to initiate containment actions that may affect service availability when security threats demand immediate response.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/secops status` | Display current security posture and active threat indicators | L3+ |
| `/secops incidents` | List active and recent security incidents with status | L3+ |
| `/secops threats` | Show current threat landscape assessment | L3+ |
| `/secops contain <target>` | Initiate containment protocol for specified threat | L3+ |
| `/secops report` | Generate security operations report for specified period | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [security-audit-specialist](@/agents/security-audit-specialist.md) | Audit findings become detection rules in operational monitoring |
| [secrets-management-specialist](@/agents/secrets-management-specialist.md) | Credential compromise events trigger immediate rotation coordination |
| [blue-commander](@/agents/blue-commander.md) | Blue Team defensive posture informed by operational threat intelligence |
| [red-commander](@/agents/red-commander.md) | Red Team simulation findings validate detection coverage |
| [purple-coordinator](@/agents/purple-coordinator.md) | Purple Team synthesis closes gaps between detection and defense |

## Color-Team Integration

The security operations specialist serves as a primary consumer of Color-Team outputs, translating simulation findings into operational security improvements.

| Team | Integration |
|------|------------|
| **Red Team** | Adversarial simulation results validate detection rule effectiveness |
| **Blue Team** | Defensive posture assessments inform monitoring priority allocation |
| **Purple Team** | Synthesis findings identify detection blind spots for remediation |
| **Gray Team** | Boundary exploration results reveal edge cases in security monitoring |

## Enforcement

The [NO MERCY](@/glossary/no-mercy.md) doctrine requires that all security events receive appropriate attention within their defined response timelines. No critical security event may be deferred, dismissed, or downgraded without documented justification and L1 approval. All incident response activities maintain full audit trails with provenance tracking per [NABLA Infinity](@/glossary/nabla-infinity.md) requirements. Post-incident reviews are mandatory for all severity levels above Low, ensuring that every security event contributes to the platform's defensive improvement.

## Related Agents

Agents in the **infrastructure** domain collaborate with the security-operations-specialist to maintain a defensive posture that evolves in response to the changing threat landscape. The agent ensures that the platform's production environment remains secure, monitored, and capable of rapid response to security events at any scale.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)