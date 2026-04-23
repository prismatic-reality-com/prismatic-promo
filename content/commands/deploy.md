+++
title = "/deploy"
weight = 920
[extra]
category = "Operations"
description = "Deployment to staging environment via GitLab CI/CD"
syntax = "/deploy [options]"
authority = "L3"
agent = "deploy-specialist"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1094
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["deploy", "Deployment", "GitLab", "CICD", "commands", "Operations", "Prismatic Platform", "Post"]
tags = ["commands", "operations", "deploy", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/deploy - Prismatic Platform"
+++

## Overview

The **/deploy** command orchestrates application deployment to target environments with comprehensive health validation and automatic rollback capabilities. As the foundational deployment command in the Prismatic Platform, it provides the core deployment workflow that is extended by specialized commands like [/deploy-production](/commands/deploy-production/) for production-specific safety gates and [/deploy-unified](/commands/deploy-unified/) for consolidated multi-environment management.

The command implements a five-phase deployment protocol: pre-deployment validation (quality gates, clean working directory, dependency checks), database migration execution (with rollback preparation), application deployment (via [GitLab CI](/glossary/gitlab-ci/)/CD pipeline or direct Fly.io deployment), health check execution (endpoint probing, response time validation, error rate monitoring), and post-deployment monitoring (continuous health surveillance with automatic alert triggers).

This command operates under the **L3** authority level and is executed by the `deploy-specialist` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The deploy specialist agent coordinates with infrastructure agents for environment-specific operations while maintaining a consistent deployment protocol across all target environments.

Deployment strategy selection is a key capability. The command supports three strategies: **rolling** (default -- instances replaced gradually with zero-downtime), **blue-green** (new version deployed alongside old, traffic switched atomically), and **canary** (new version receives a fraction of traffic for validation before full rollout). Strategy selection depends on the risk profile of the changes being deployed and the criticality of the target environment. The choice of strategy represents a fundamental trade-off between deployment speed, risk mitigation, and resource utilization that the deploy specialist agent helps operators navigate.

## Syntax and Usage

```bash
/deploy <environment> [version] [strategy]
```

The command requires a target environment and optionally accepts a version identifier and deployment strategy. When version is omitted, the latest committed state is deployed. When strategy is omitted, rolling deployment is used as the safest default.

### Standard Deployment

```bash
# Deploy latest to staging (most common)
/deploy staging

# Deploy specific version to staging
/deploy staging v2.1.0

# Deploy to production (redirects to /deploy-production for safety)
/deploy production v2.1.0
```

### Strategy Selection

```bash
# Rolling deployment (default)
/deploy staging v2.1.0 rolling

# Blue-green deployment
/deploy staging v2.1.0 blue-green

# Canary deployment
/deploy staging latest canary
```

### Monitoring and Rollback

```bash
# Check deployment status
/deploy status

# Rollback last deployment
/deploy rollback staging

# View deployment logs
/deploy logs staging
```

## Parameters and Options

| Parameter | Position | Required | Type | Default | Description |
|-----------|----------|----------|------|---------|-------------|
| **environment** | $1 | Yes | string | -- | Target environment: `staging`, `production` |
| **version** | $2 | No | string | `latest` | Version to deploy (tag or "latest") |
| **strategy** | $3 | No | string | `rolling` | Deployment strategy: `rolling`, `blue-green`, `canary` |
| **--skip-migrations** | -- | No | boolean | `false` | Skip database migrations (use with caution) |
| **--force** | -- | No | boolean | `false` | Override pre-deployment quality gate failures |
| **--monitor-duration** | -- | No | string | `5m` | Post-deployment monitoring window |
| **--health-retries** | -- | No | integer | `3` | Number of health check retry attempts |

## Implementation Architecture

### Deployment Pipeline

```
/deploy [environment] [version] [strategy]
    |
    v
PHASE 1: PRE-DEPLOYMENT VALIDATION (< 30s)
    +-- Clean working directory (git status)
    +-- Quality gates pass
    +-- Dependencies resolved
    +-- Version tag verified
    +-- Rollback path prepared
    |
    v
PHASE 2: DATABASE MIGRATIONS (variable)
    +-- Migration compatibility check
    +-- Backup current state
    +-- Execute pending migrations
    +-- Verify migration success
    |
    v
PHASE 3: APPLICATION DEPLOYMENT (30-120s)
    +-- Build release (mix release)
    +-- Deploy via selected strategy
    +-- Monitor deployment progress
    +-- Wait for healthy instances
    |
    v
PHASE 4: HEALTH CHECK EXECUTION (10-30s)
    +-- Endpoint availability verification
    +-- Response time validation (< 250ms)
    +-- Error rate check (0% target)
    +-- Database connectivity confirmation
    +-- LiveView WebSocket verification
    |
    v
PHASE 5: POST-DEPLOYMENT MONITORING (ongoing)
    +-- Continuous health surveillance
    +-- Performance metric collection
    +-- Auto-rollback trigger monitoring
    +-- Deployment event logging
```

### Deployment Strategies

| Strategy | Description | Use Case | Risk Level |
|----------|-------------|----------|------------|
| **Rolling** | Instances replaced gradually | Standard deployments, backward-compatible changes | Low |
| **Blue-Green** | Full parallel deployment, atomic switch | Database schema changes, major version updates | Medium |
| **Canary** | Gradual traffic shift to new version | High-risk changes, new feature validation | Low-Medium |

The rolling strategy replaces instances one at a time, maintaining service availability throughout the deployment. At any point during the rollout, a mix of old and new versions serves traffic. This requires backward compatibility between versions. The blue-green strategy deploys the new version alongside the old, then switches all traffic atomically. This eliminates the mixed-version window but requires double the infrastructure resources during deployment. The canary strategy routes a small percentage of traffic (typically 5-10%) to the new version for a validation period before gradually increasing to 100%.

### Health Check Implementation

```elixir
defmodule PrismaticWeb.HealthController do
  use PrismaticWeb, :controller

  def check(conn, _params) do
    health = %{
      status: "available",
      database: check_database(),
      uptime: System.uptime(),
      version: Application.spec(:prismatic, :vsn)
    }

    json(conn, health)
  end
end
```

## Examples

### Staging Deployment with Quality Gates

```bash
/deploy staging
```

This is the most common deployment operation. The command validates the working directory is clean, runs quick quality gates, builds a Docker image, deploys via Fly.io rolling strategy, and validates health within 30 seconds of deployment completion.

### Blue-Green Deployment for Schema Changes

```bash
/deploy staging v2.1.0 blue-green
```

When database migrations change column types or add NOT NULL constraints, blue-green deployment ensures that the old version never serves traffic against the new schema. The atomic traffic switch happens only after the new version passes all health checks.

### Emergency Rollback

```bash
/deploy rollback staging
```

Triggers an immediate rollback to the previously deployed version. The rollback procedure restores the previous Docker image and, if database migrations were executed, runs the corresponding down migrations to restore the previous schema state.

## Integration with Platform

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `deploy-specialist` agent | Agent coordinates deployment workflow |
| [AIAD](/glossary/aiad/) Registry | Command specification | Operations category, L3 authority |
| [Quality Gates](/glossary/quality-gates/) | Pre-deployment validation | Blocking gate -- deployment aborted on failure |
| [Telemetry](/glossary/telemetry/) | Deployment [metrics](/glossary/metrics/) | Build time, deploy time, health check results |
| [GitLab CI](/glossary/gitlab-ci/)/CD | Pipeline integration | CI/CD triggered deployments |
| [Fly.io](/glossary/fly-io/) | Infrastructure provider | Application hosting platform |
| Page Load Performance | Post-deployment check | All pages must load < 250ms |
| [/deploy-production](/commands/deploy-production/) | Specialized variant | Production-specific safety gates |
| [/deploy-unified](/commands/deploy-unified/) | Unified interface | Multi-environment management |

### CI/CD Pipeline Integration

```yaml
# .gitlab-ci.yml
deploy_staging:
  stage: deploy
  script:
    - 'flyctl deploy --config fly.staging.toml'
  environment:
    name: staging
    url: https://prismatic-staging.fly.dev
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'
```

## Workflow Integration

The /deploy command occupies a central position in the platform's release workflow. The typical deployment progression follows a strict staging-first policy:

1. **Development Completion**: Code changes pass local quality gates (`mix compile --warnings-as-errors`, `mix test`, `mix credo --strict`).
2. **Staging Deployment**: `/deploy staging` validates the build in a production-like environment.
3. **Staging Validation**: Manual or automated testing against the staging environment confirms expected behavior.
4. **Production Deployment**: After staging validation, [/deploy-production](/commands/deploy-production/) handles the production deployment with enhanced safety gates.
5. **Post-Deployment Monitoring**: Both staging and production deployments trigger continuous monitoring for performance regressions.

The command also integrates with the platform's emergency response workflow. When [/emergency](/commands/emergency/) identifies a production issue, the rollback capability provides a rapid remediation path while the root cause is investigated.

### Quality Gate Integration

```bash
# Automatic pre-deployment quality validation
mix compile --warnings-as-errors --force  # Zero warnings
mix credo --strict                         # All style checks
mix test                                   # All tests passing
mix quality.gates --quick                  # Fast quality check
```

## NABLA Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for deployment without quality validation. Quality gates must pass before any deployment proceeds. Health checks are mandatory, not optional. Failed deployments trigger automatic investigation, not silent acceptance. No partial deployments are permitted.
- **NO DOUBTS**: Full pre-deployment verification through quality gates and clean working directory checks. Post-deployment health validated through active endpoint probing. Every deployment creates a traceable audit trail with timestamps, versions, and outcomes.

NABLA axiom compliance in deployment operations:

| Axiom | Enforcement |
|-------|-------------|
| **Provenance Mandatory** | Every deployment traceable to specific commit, version, and operator |
| **Time Decay** | Stale deployments flagged; monitoring data expires and refreshes |
| **Signal Plurality** | Multiple health check signals (endpoint, response time, error rate) required |
| **Source Independence** | Quality gates and health checks operate as independent verification paths |

## Performance

| Metric | Target | Typical |
|--------|--------|---------|
| Pre-deployment validation | < 30s | ~15s |
| Docker build | < 5min | ~2min |
| Rolling deployment | < 2min | ~45s |
| Blue-green deployment | < 3min | ~90s |
| Canary deployment | < 10min | ~5min (includes validation period) |
| Health check execution | < 30s | ~10s |
| Rollback execution | < 2min | ~30s |
| Total staging deployment | < 8min | ~4min |

The deployment pipeline is optimized for speed without sacrificing safety. Docker layer caching reduces build times for incremental changes. Fly.io's infrastructure enables sub-minute rolling deployments for typical releases. Health check retries use exponential backoff to handle transient startup delays without premature failure declarations.

## Related Commands

- [/deploy-production](/commands/deploy-production/) - Production deployment with enhanced safety checks
- [/deploy-unified](/commands/deploy-unified/) - Unified deployment control for all environments
- [/deploy-meilisearch](/commands/deploy-meilisearch/) - Meilisearch search engine deployment
- [/quality-gates](/commands/quality-gates/) - Quality gate enforcement
- [/commit](/commands/commit/) - Smart commit with quality gates and conventional format
- [/emergency](/commands/emergency/) - Emergency response for deployment failures
- [/benchmark](/commands/benchmark/) - Comprehensive performance benchmarking with P95/P99 analysis

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)