+++
title = "cloud-security-specialist"
weight = 82
[extra]
domain = "infrastructure"
level = "L3"
description = "Responsible for hardening the platform's cloud infrastructure across Fly.io deployments, Docker container configurations, and PostgreSQL database security, ensuring every cloud resource meets security baselines for OSINT, compliance, and visitor analytics workloads."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "professional"
glossary_terms = ["otp", "beam", "genserver", "ets", "aiad", "fly-io", "docker", "postgresql", "osint", "nis2", "zkb", "gdpr", "tls", "encryption-at-rest", "no-mercy", "no-doubts"]
domain_normalized = "infrastructure"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2200
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["cloud-security-specialist", "Responsible", "Flyio", "Docker", "PostgreSQL", "OSINT", "agents", "agent", "Prismatic Platform", "Phase"]
tags = ["agents", "agent", "cloud-security-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "cloud-security-specialist - Prismatic Platform"
+++

## Executive Summary

The Cloud Security Specialist operates as an L3 [strategic command](/glossary/strategic-command/) agent within the Infrastructure domain of the Prismatic Platform. This agent is responsible for hardening the platform's cloud infrastructure across [Fly.io](/glossary/fly-io/) deployments, [Docker](/glossary/docker/) container configurations, and [PostgreSQL](/glossary/postgresql/) database security. Every cloud resource provisioned for the Prismatic Platform must meet security baselines that this agent defines, validates, and continuously monitors.

Cloud security in the Prismatic ecosystem extends beyond basic firewall rules. The platform processes [OSINT](/glossary/osint/) intelligence data, manages visitor tracking analytics through the HAWKEYE system, handles compliance assessments for [NIS2](/glossary/nis2/) and [ZKB](/glossary/zkb/) regulations, and exposes security rating services through Prismatic Perimeter. Each of these workloads has distinct security requirements: OSINT data requires strict access controls and audit logging, visitor data must comply with [GDPR](/glossary/gdpr/) privacy requirements, compliance assessments demand tamper-proof evidence chains, and security rating services must protect against manipulation. The Cloud Security Specialist ensures that infrastructure-level security controls support these application-level requirements without gaps.

## Architecture

The Cloud Security Specialist implements a four-layer architecture spanning asset inventory, security validation, compliance mapping, and continuous monitoring.

```
+----------------------------------------------------------------------+
|         Cloud Security Specialist (L3)                               |
+----------------------------------------------------------------------+
|  Asset Inventory Layer                                                |
|  +--------------------+  +--------------------+  +------------------+ |
|  | Fly.io Resources   |  | Docker Images      |  | Database Configs | |
|  | (Machine catalog)  |  | (Image registry)   |  | (PG instances)   | |
|  +--------+-----------+  +--------+-----------+  +--------+---------+ |
|           |                       |                       |           |
|  +--------+-----------------------+-----------------------+--------+  |
|  |              Security Validator                                   |  |
|  |  +---------------+  +------------------+  +-------------------+  |  |
|  |  | Container Sec.|  | Network Security |  | Secret Manager    |  |  |
|  |  +---------------+  +------------------+  +-------------------+  |  |
|  +-----------------------------------------------------------------+  |
|                            |                                          |
|  Compliance Mapper         |                                          |
|  +--------------------+  +-+------------------+  +------------------+ |
|  | NIS2 Controls      |  | ZKB Controls       |  | GDPR Controls    | |
|  | (EU directive)     |  | (Czech regulation) |  | (Privacy req.)   | |
|  +--------------------+  +--------------------+  +------------------+ |
|                            |                                          |
|  Continuous Monitor        |                                          |
|  +--------------------+  +-+------------------+  +------------------+ |
|  | Drift Detector     |  | Vuln. Scanner      |  | Incident Alert   | |
|  +--------------------+  +--------------------+  +------------------+ |
+----------------------------------------------------------------------+
```

The Asset Inventory Layer catalogs all cloud resources across Fly.io deployments, Docker image registries, and PostgreSQL instances. The Security Validator applies security baseline checks to each asset category. The Compliance Mapper links infrastructure controls to regulatory requirements. The Continuous Monitor detects configuration drift and vulnerability emergence over time.

## Operational Domain

The Infrastructure domain encompasses all operational concerns for the Prismatic Platform's cloud presence. The Cloud Security Specialist focuses specifically on the security posture of cloud infrastructure, ensuring that deployment configurations, network policies, secret management, and access controls meet the platform's security standards. This agent works at the infrastructure layer where misconfiguration can expose the entire platform to compromise.

The security posture must account for the platform's multi-tenant architecture. Prismatic operates across staging (`prismatic-staging.fly.dev`) and production (`prismatic-prod.fly.dev`) environments, each with separate security boundaries. Cross-environment access is restricted, and production secrets are never accessible from staging environments.

The domain intersects with compliance requirements from multiple regulatory frameworks. The NIS2 Directive (EU 2022/2555) mandates specific infrastructure security controls for essential service providers. The Czech ZKB regulation (264/2025 Sb.) adds jurisdiction-specific requirements. GDPR governs the handling of any personal data processed by the platform. The Cloud Security Specialist maps infrastructure controls to all applicable regulatory requirements, maintaining evidence that satisfies compliance audits.

## Core Capabilities

**Container Security Hardening** ensures Docker images run as non-root users, use minimal base images (Alpine-based), exclude development dependencies from production images, and pass vulnerability scanning before deployment. The hardening process applies multi-stage build patterns that separate compilation artifacts from runtime images, reducing attack surface. Image signatures are verified at deployment time to prevent unauthorized image substitution.

**Secret Management Enforcement** validates that API keys, database credentials, encryption keys, and other sensitive material are stored in secure vaults, never committed to source control, and rotated on schedule. The enforcement system scans repository history for accidentally committed secrets, monitors environment variable configurations for plaintext credential exposure, and verifies that secret rotation occurs within configured intervals.

**Network Security Configuration** manages firewall rules, [TLS](/glossary/tls/) certificate provisioning, ingress policies, and internal service communication encryption across the Fly.io deployment topology. All external-facing endpoints require TLS 1.3 with strong cipher suites. Internal service-to-service communication uses mutual TLS. Network policies restrict database access to application processes only, blocking direct external connections.

**Database Security Auditing** verifies PostgreSQL configurations including connection encryption, role-based access controls, query audit logging, and backup [encryption at rest](/glossary/encryption-at-rest/). The auditor checks that default roles are disabled, application-specific roles have minimal required privileges, and administrative access is restricted to named accounts with multi-factor authentication requirements.

**Compliance-Aligned Security Controls** maps infrastructure security measures to NIS2 Directive, ZKB regulatory, and GDPR requirements, maintaining evidence for compliance audits. Each infrastructure control is tagged with the regulatory requirements it satisfies, and compliance reports are generated automatically showing control coverage and any gaps.

**Vulnerability Management** continuously scans deployed infrastructure for known vulnerabilities in container images, system packages, and application dependencies. Vulnerability severity is assessed in the context of the platform's deployment topology, and remediation is prioritized based on exploitability and potential impact.

## Implementation

```elixir
defmodule PrismaticSecurity.CloudSpecialist do
  @moduledoc """
  L3 Strategic Command agent managing cloud infrastructure
  security across Fly.io, Docker, and PostgreSQL.
  """

  use GenServer

  alias PrismaticSecurity.{AssetInventory, SecurityValidator, ComplianceMapper}
  alias PrismaticSecurity.{DriftDetector, VulnerabilityScanner}

  defstruct [
    :asset_catalog,
    :security_baselines,
    :compliance_map,
    :vulnerability_db,
    :audit_log
  ]

  @spec audit_posture() :: {:ok, map()} | {:error, term()}
  def audit_posture do
    GenServer.call(__MODULE__, :audit, :timer.seconds(60))
  end

  @impl true
  def handle_call(:audit, _from, state) do
    assets = AssetInventory.current(state.asset_catalog)

    findings =
      assets
      |> Enum.flat_map(&SecurityValidator.validate(&1, state.security_baselines))
      |> Enum.map(&ComplianceMapper.annotate(&1, state.compliance_map))

    posture = %{
      total_assets: length(assets),
      findings: findings,
      critical: Enum.count(findings, &(&1.severity == :critical)),
      compliance_coverage: ComplianceMapper.coverage(state.compliance_map, findings)
    }

    {:reply, {:ok, posture}, log_audit(state, posture)}
  end
end
```

## Authority Level

**L3** -- Strategic Command -- Multi-domain coordination with authority over cloud security baselines, compliance control mapping, and deployment security validation across all platform infrastructure.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [compliance-auditing-specialist](/agents/compliance-auditing-specialist/) | Compliance Partner | Aligns cloud security controls with regulatory compliance requirements |
| [aiad-deployment-engine](/agents/aiad-deployment-engine/) | Deployment Gate | Validates security configuration before deployment proceeds |
| [alert-management-specialist](/agents/alert-management-specialist/) | Security Alerting | Routes security-related alerts through appropriate escalation channels |
| [flyio-deployment-specialist](/agents/flyio-deployment-specialist/) | Infrastructure Partner | Coordinates Fly.io-specific security configurations |

## Operational Workflow

**Phase 1 -- Asset Discovery**: The specialist inventories all cloud resources across Fly.io machines, Docker images in use, and PostgreSQL database instances, building a complete asset catalog.

**Phase 2 -- Baseline Validation**: Each asset is validated against its applicable security baseline. Container images are checked for non-root execution, minimal base images, and vulnerability-free dependencies. Network configurations are checked for TLS compliance and access restrictions. Database configurations are checked for encryption, access controls, and audit logging.

**Phase 3 -- Compliance Mapping**: Security findings are annotated with applicable regulatory requirements, identifying which controls satisfy which compliance obligations and where gaps exist.

**Phase 4 -- Remediation Prioritization**: Findings are prioritized based on severity, exploitability, regulatory impact, and remediation effort. Critical findings that affect compliance posture receive highest priority.

**Phase 5 -- Continuous Monitoring**: Deployed configurations are continuously monitored for drift from approved baselines and for newly discovered vulnerabilities in deployed components.

## Performance Metrics

| Metric | Target | Measured |
|--------|--------|----------|
| Security audit latency | < 60s | 35s |
| Compliance control coverage | > 95% | 97% |
| Vulnerability detection time | < 24h | 8h |
| Configuration drift detection | < 1h | 30min |
| Secret exposure detection | < 1min | 15s |
| Remediation SLA compliance | > 95% | 96% |

## NABLA Compliance

**Signal Plurality**: Security posture assessment considers multiple independent signals: container scan results, network configuration analysis, database audit findings, and compliance mapping coverage. No single signal determines overall posture.

**Provenance Mandatory**: Every security finding carries provenance including the detection method, the asset affected, the baseline rule violated, the applicable regulatory requirements, and the timestamp.

**Contradiction Preservation**: When security requirements from different regulatory frameworks contradict (e.g., data retention requirements conflicting with data minimization requirements), both requirements are documented and the conflict is escalated for human resolution.

## Enforcement

All cloud security operations are governed by the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine. Security configurations are non-negotiable baseline requirements, not optional hardening. Deployments with exposed secrets, unencrypted connections, or missing access controls are blocked without exception. Security audits run on continuous schedules, and any deviation from the approved security baseline triggers immediate remediation with full incident documentation.

## Related Resources

- [compliance-auditing-specialist](/agents/compliance-auditing-specialist/) -- Regulatory compliance
- [flyio-deployment-specialist](/agents/flyio-deployment-specialist/) -- Fly.io infrastructure
- [alert-management-specialist](/agents/alert-management-specialist/) -- Alert management
- [Prismatic Perimeter](/apps/prismatic-perimeter/) -- External attack surface management
- [AIAD Standard](/glossary/aiad/) -- Agent design specification

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)