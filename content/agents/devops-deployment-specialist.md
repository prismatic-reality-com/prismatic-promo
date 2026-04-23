+++
title = "devops-deployment-specialist"
weight = 134
[extra]
domain = "primary-producer"
level = "L2"
description = "Specialized agent for DevOps operations and service deployment"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "seadf", "mycelial-network", "otp", "no-doubts", "genstage", "telemetry", "phoenix", "no-mercy", "liveview"]
domain_normalized = "primary"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1850
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["devops-deployment-specialist", "Specialized", "DevOps", "agents", "agent", "Prismatic Platform", "The DevOps", "Deployment Specialist"]
tags = ["agents", "agent", "devops-deployment-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "devops-deployment-specialist - Prismatic Platform"
+++

## Overview

The DevOps Deployment Specialist operates as an L2 tactical authority within the Primary Producer domain of the Prismatic Platform. This agent manages the complete deployment lifecycle for the platform's services, encompassing build pipeline orchestration, container image management, infrastructure provisioning, release coordination, and post-deployment validation. In a platform comprising 90 [umbrella application](@/glossary/umbrella-application.md)s deployed across [Fly.io](@/glossary/fly-io.md) edge infrastructure, deployment operations require meticulous coordination to ensure zero-downtime releases, configuration consistency, and immediate rollback capability.

The agent operates within the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard and follows the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. In deployment operations, NO MERCY means that every deployment either succeeds completely or rolls back entirely -- partial deployments are never tolerated. NO DOUBTS means that every deployment decision is backed by evidence: health checks pass, database migrations complete, configuration validation succeeds, and smoke tests confirm operational readiness before traffic is routed to new instances.

The Prismatic Platform runs on [Elixir](@/glossary/elixir.md) releases compiled into [Docker](@/glossary/docker.md) container images, deployed to Fly.io's global edge network. The deployment pipeline transforms source code through compilation, asset bundling, container image building, registry pushing, infrastructure provisioning, migration execution, and instance startup. Each stage has explicit success criteria and failure handling. The DevOps Deployment Specialist automates and orchestrates this entire pipeline while maintaining the safety guarantees required for production operations.

## Operational Domain

The Primary Producer domain encompasses agents that provide core platform functionality with direct user-facing impact. The DevOps Deployment Specialist ensures that all other agents' work -- code generation, intelligence analysis, compliance checking -- actually reaches production users. Without reliable deployment, the entire agent ecosystem produces work that never delivers value. This positions deployment operations as a critical path dependency for the entire platform.

The agent manages deployments across multiple environments: development (local Docker Compose), staging (prismatic-staging.fly.dev), and production (prismatic-prod.fly.dev). Each environment has distinct configuration requirements, database connections, secret management, and scaling parameters. The specialist maintains environment parity while respecting the differences that each tier demands.

## Key Capabilities

The DevOps Deployment Specialist provides six core capability areas that together cover the complete deployment lifecycle.

**Build pipeline orchestration** manages the multi-stage build process from source compilation through container image creation. The agent coordinates [Elixir](@/glossary/elixir.md) release compilation with `mix release`, TailwindCSS asset compilation, static asset digesting, and multi-stage Docker builds that produce minimal production images. Build stages execute in dependency order with explicit success validation at each stage boundary.

**Container image management** handles Docker image building, tagging, scanning, and registry operations. Images follow multi-stage build patterns that separate compilation dependencies from runtime requirements, producing production images that contain only the compiled release and its runtime dependencies. Image scanning detects known vulnerabilities before any image reaches the deployment pipeline.

**Infrastructure provisioning** manages Fly.io machine allocation, network configuration, volume mounting, and scaling parameters. The agent translates platform scaling requirements into Fly.io configuration, managing instance counts, memory allocation, CPU allocation, and geographic placement to meet performance targets while controlling infrastructure costs.

**Release coordination** orchestrates the sequenced steps required for safe production releases: pre-deployment health checks, database migration execution, rolling instance replacement, post-deployment smoke tests, and traffic routing updates. Each step has explicit success criteria and timeout handling that prevents hung deployments.

**Rollback execution** provides immediate reversion capability when post-deployment validation detects issues. The agent maintains rollback targets -- the previous known-good release, its database migration state, and its configuration snapshot -- enabling single-command reversion that restores the previous deployment state within minutes.

**Post-deployment validation** runs comprehensive health checks after deployment completion, including HTTP endpoint verification, database connectivity testing, background job processing confirmation, and application-specific smoke tests. Validation failures trigger automatic rollback without human intervention.

## Deployment Pipeline Architecture

The deployment pipeline implements a linear stage progression with explicit gate conditions between stages.

```
Source Code --> Compilation --> Asset Build --> Docker Build --> Image Push
     |              |              |              |              |
  git tag      mix release     tailwind       multi-stage     registry
  validation   --warnings=0   --minify       Dockerfile      push + tag

     --> Migration --> Instance Deploy --> Health Check --> Traffic Route
           |               |                  |                |
        Ecto.migrate    fly deploy         /health 200      DNS update
        --step 1       --rolling          all endpoints     zero-downtime
```

Each stage reports its outcome through [telemetry](@/glossary/telemetry.md) events under the `[:prismatic_deploy, :pipeline, *]` namespace. Failed stages halt the pipeline and trigger the appropriate recovery action: build failures abort, migration failures roll back the migration, deployment failures revert to the previous release.

## Configuration Management

Deployment configuration follows a strict hierarchy that prevents configuration drift between environments.

| Configuration Layer | Source | Scope |
|-------------------|--------|-------|
| Application defaults | `config/config.exs` | All environments |
| Environment overrides | `config/{env}.exs` | Per-environment |
| Runtime configuration | `config/runtime.exs` | Instance-specific |
| Secrets | Fly.io secrets | Per-environment, encrypted |
| Feature flags | Database-backed | Dynamic, per-tenant |

The agent validates configuration completeness before every deployment, ensuring that all required environment variables are set, all secrets are accessible, and all database connection parameters resolve correctly. Configuration validation failures block deployment with explicit error messages identifying the missing or invalid configuration.

## Authority Level

**L2** - Tactical Operations - The DevOps Deployment Specialist operates at the tactical level with domain-specific execution authority. It can initiate deployments, execute migrations, and manage infrastructure within the Primary Producer domain. Cross-domain impacts -- such as deployments that affect multiple applications simultaneously -- require coordination with L3 strategic command agents.

## Integration Architecture

The DevOps Deployment Specialist integrates with both platform infrastructure and the broader agent ecosystem.

| Component | Relationship | Mechanism |
|-----------|-------------|-----------|
| Prismatic Core | Central coordination | Receives deployment directives and reports outcomes |
| [Prismatic Web](@/glossary/prismatic-web.md) | Dashboard integration | Deployment status displayed in [LiveView](@/glossary/liveview.md) admin panels |
| AIAD Commands | Command dispatch | `/deploy`, `/rollback`, `/release` command handling |
| GitLab CI/CD | Pipeline integration | Triggered by CI pipeline stages for automated deployment |
| [Fly.io](@/glossary/fly-io.md) | Infrastructure provider | Machine management, scaling, and network configuration |
| Docker Registry | Image storage | Container image versioning and distribution |
| [PostgreSQL](@/glossary/postgresql.md) | Migration management | [Ecto](@/glossary/ecto.md) migration execution and rollback |

## Monitoring and Observability

Post-deployment monitoring is not optional -- it is a mandatory part of every deployment operation.

| Metric | Threshold | Action on Breach |
|--------|-----------|-----------------|
| Health check response time | < 10ms | Alert + investigation |
| Page load time (P95) | < 250ms | Alert + potential rollback |
| Error rate increase | < 0.1% delta | Automatic rollback |
| Database connection pool | < 80% utilization | Alert + scaling review |
| Memory usage | < 85% allocated | Alert + resource review |

## Operational Procedures

**Standard deployment**: Triggered by merged pull requests to the main branch. The agent runs the full pipeline from compilation through traffic routing, with human approval required only for production deployments during defined change windows.

**Hotfix deployment**: Emergency procedure that bypasses standard change windows. The agent executes an abbreviated pipeline focused on speed while maintaining safety gates: compilation verification, minimal smoke testing, and immediate rollback readiness.

**Rollback procedure**: Single-command reversion to the previous known-good release. The agent reverts instance images, rolls back database migrations if applicable, and restores the previous configuration state. Rollback completion is verified through the same health check suite used for forward deployments.

## Enforcement

The DevOps Deployment Specialist operates under strict NO MERCY enforcement. Deployments that fail health checks are rolled back automatically. Deployments that introduce compilation warnings are rejected at the build stage. Database migrations that cannot be reversed are flagged for manual review before execution. Configuration drift between environments triggers investigation and remediation. No deployment proceeds without passing every stage gate.

## Related Agents

- [**docker-build-specialist**](@/agents/docker-build-specialist.md) (L3) - Container image optimization and multi-stage build expertise
- [**aiad-deployment-engine**](@/agents/aiad-deployment-engine.md) (L4) - Core deployment engine with formal verification
- [**infrastructure-specialist**](@/agents/archer-supreme.md) (L3) - Infrastructure provisioning and capacity planning

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)