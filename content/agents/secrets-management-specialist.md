+++
title = "secrets-management-specialist"
weight = 362
[extra]
domain = "infrastructure"
level = "L3"
description = "Secrets detection, vault management, and credential rotation across the Prismatic Platform"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ets", "dynamic-supervisor", "circuit-breaker", "umbrella-application", "postgresql", "aiad"]
domain_normalized = "infrastructure"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 83
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["secrets-management-specialist", "Secrets", "Prismatic", "Platform", "agents", "agent", "Prismatic Platform", "Environment", "Within", "Ollama"]
tags = ["agents", "agent", "secrets-management-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "secrets-management-specialist - Prismatic Platform"
+++

## Overview

The secrets-management-specialist operates as an L3 Strategic Command authority within the Prismatic Platform's infrastructure domain, responsible for detecting, managing, rotating, and securing all sensitive credentials, API keys, tokens, and cryptographic material across the platform's 90-application [umbrella architecture](@/glossary/umbrella-application.md). In a system that integrates with databases, external APIs, cloud services, AI models, and third-party intelligence providers, the volume and variety of secrets requiring management is substantial. A single leaked credential can compromise the entire platform, making secrets management a foundational security concern.

Governed by the [AIAD](@/glossary/aiad.md) standard and the [NO MERCY](@/glossary/no-mercy.md) doctrine, this agent enforces a zero-tolerance policy toward secret exposure. No credential may appear in source code, no API key may be hardcoded in configuration, no token may be logged to output streams, and no sensitive material may persist in unencrypted storage. The agent implements defense-in-depth across the entire secret lifecycle: generation, distribution, storage, rotation, and revocation.

## Operational Domain

The infrastructure domain for secrets management spans every layer where sensitive data intersects with the platform. This includes application configuration files (`config/runtime.exs`), environment variable management, CI/CD pipeline secrets, Docker build arguments, Fly.io deployment secrets, database connection strings, external API authentication tokens, MCP server credentials, and [Ollama](@/glossary/ollama.md) integration configurations. The agent also monitors developer environments to prevent accidental secret exposure through shell history, debug output, or development configuration files.

The domain extends to monitoring for secrets that may have been inadvertently introduced into the codebase through commits, including historical analysis of Git history to identify secrets that were committed and later removed but still exist in version control history.

## Key Capabilities

- **Secret detection scanning** -- Performs continuous scanning of the codebase for patterns matching API keys, tokens, passwords, private keys, and other sensitive material using regex-based and entropy-based detection methods. Integrates with Git pre-commit hooks to prevent secrets from entering the repository
- **Vault integration management** -- Manages the interface between the platform and external secret storage systems, ensuring that secrets are retrieved at runtime from secure vaults rather than stored in configuration files. Supports environment-specific vault configurations for development, staging, and production
- **Credential rotation orchestration** -- Coordinates the rotation of secrets according to configurable schedules, ensuring that dependent applications are updated atomically to prevent service disruption during rotation events. Rotation events are logged and auditable
- **Environment variable governance** -- Enforces that all sensitive configuration is delivered through environment variables with proper scoping, preventing cross-environment contamination where a staging secret could accidentally be used in production
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with self-healing detection that responds to newly discovered exposure patterns
- **[Telemetry integration](@/capabilities/telemetry-integration.md)** publishing secret access metrics under the `:prismatic, :secrets` namespace for audit compliance

## Secret Classification Framework

The agent classifies secrets by sensitivity level, which determines storage requirements, rotation frequency, and access controls.

| Classification | Examples | Rotation Period | Storage Requirement |
|---------------|----------|----------------|-------------------|
| **Critical** | Database master passwords, encryption keys | 30 days | HSM or encrypted vault only |
| **High** | API keys for external services, OAuth tokens | 90 days | Environment variables from vault |
| **Medium** | Service account credentials, webhook secrets | 180 days | Encrypted configuration |
| **Low** | Public API keys, non-sensitive tokens | 365 days | Environment variables |

## Detection Architecture

Secret detection operates at multiple checkpoints throughout the development and deployment lifecycle, ensuring that no secret can enter the system undetected.

| Checkpoint | Timing | Detection Method |
|------------|--------|-----------------|
| **Pre-commit hooks** | Before git commit | Pattern matching + entropy analysis on staged changes |
| **CI/CD pipeline** | On push to remote | Full repository scan with historical analysis |
| **Runtime monitoring** | Application startup | Environment variable validation and completeness check |
| **Log stream analysis** | Continuous | Real-time log scanning for accidentally logged secrets |
| **Dependency audit** | Weekly | Third-party dependency review for embedded credentials |

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination authority for secrets management across all platform applications. The agent has authority to block deployments that would expose secrets and to mandate rotation of compromised credentials regardless of downstream impact.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/secrets scan` | Execute comprehensive secret detection scan across the codebase | L3+ |
| `/secrets audit` | Generate audit report of all managed secrets with rotation status | L3+ |
| `/secrets rotate` | Initiate credential rotation for specified secret classification | L3+ |
| `/secrets validate` | Verify that all required secrets are present and correctly configured | L3+ |
| `/secrets history` | Review secret access and rotation history for compliance reporting | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [security-audit-specialist](@/agents/security-audit-specialist.md) | Security audits include secrets management posture assessment |
| [security-operations-specialist](@/agents/security-operations-specialist.md) | Incident response coordination when secret exposure is detected |
| [scripts-infrastructure-supreme](@/agents/scripts-infrastructure-supreme.md) | Infrastructure scripts must never contain embedded secrets |
| [shell-setup-specialist](@/agents/shell-setup-specialist.md) | Developer shell environments must handle secrets securely |

## Platform-Specific Concerns

The Prismatic Platform presents several unique secrets management challenges due to its architecture and operational profile.

**Umbrella Application Isolation**: With 90 applications in the umbrella, secrets must be scoped to specific applications. A database credential for `prismatic_storage_ecto` must not be accessible to `prismatic_web` directly -- access should flow through defined interfaces. The agent enforces application-level secret isolation through configuration namespace management.

**MCP Server Authentication**: The platform integrates 14+ MCP (Model Context Protocol) servers, each requiring authentication credentials. These credentials must be managed separately from application secrets due to their different rotation requirements and access patterns.

**Ollama Integration**: Local AI model integration through [Ollama](@/glossary/ollama.md) requires authentication token management (`ANTHROPIC_AUTH_TOKEN`) that differs between local development (where Ollama tokens are used) and cloud deployment (where Anthropic tokens are needed). The agent manages this environment-specific credential switching.

**CI/CD Pipeline Secrets**: GitLab CI and GitHub Actions pipelines require secrets for deployment, testing, and integration tasks. These pipeline secrets have different lifecycles and access patterns compared to application runtime secrets.

## Incident Response Protocol

When a secret exposure is detected, the agent follows a defined incident response protocol.

| Phase | Action | Timeline |
|-------|--------|----------|
| **Detection** | Alert generation and exposure scope assessment | Immediate |
| **Containment** | Revoke exposed credential, block affected deployment paths | Within 5 minutes |
| **Remediation** | Generate new credential, update all dependent configurations | Within 30 minutes |
| **Verification** | Confirm all services operational with new credentials | Within 1 hour |
| **Post-mortem** | Root cause analysis, detection improvement | Within 24 hours |

## Enforcement

The [NO MERCY](@/glossary/no-mercy.md) doctrine mandates absolute zero tolerance for secret exposure. Any commit containing detected secrets is blocked at the pre-commit hook level. Any deployment with missing or expired credentials is halted before reaching production. The agent maintains an immutable audit trail of all secret access, rotation, and exposure events, satisfying both [NABLA Infinity](@/glossary/nabla-infinity.md) provenance requirements and regulatory compliance obligations under GDPR and NIS2 frameworks.

## Related Agents

Agents in the **infrastructure** domain collaborate with the secrets-management-specialist to maintain a security posture where sensitive credentials are never exposed, always rotated on schedule, and continuously monitored for unauthorized access or accidental disclosure. The agent's vigilance is foundational to the platform's overall security architecture.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)