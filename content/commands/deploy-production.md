+++
title = "/deploy-production"
weight = 930
[extra]
category = "Operations"
description = "Production deployment to Fly.io with safety checks"
syntax = "/deploy-production [options]"
authority = "L4"
agent = "fly-io-deployment-agent"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 811
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["deploy-production", "Production", "Flyio", "commands", "Operations", "Prismatic Platform", "Deployment", "Post", "Rollback"]
tags = ["commands", "operations", "deploy-production", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/deploy-production - Prismatic Platform"
+++

## Overview

The **/deploy-production** command executes safe, validated production deployments of the Prismatic Platform to [Fly.io](@/glossary/fly-io.md) infrastructure. Production deployment is the highest-stakes operation in the platform lifecycle -- a failed deployment can result in service downtime, data inconsistency, or user impact. This command wraps the deployment process in comprehensive safety checks, mandatory quality gates, automatic health validation, and prepared rollback procedures to minimize risk.

The command enforces a strict deployment protocol: all staging tests must have passed, the working directory must be clean (no uncommitted changes), quality gates must report green across all 13 domains, database migrations must be validated, and a rollback path must be tested and ready before any production deployment begins. Only after these prerequisites are satisfied does the actual deployment proceed, followed by continuous health monitoring for the first 10 seconds with automatic rollback if health checks fail.

This command operates under the **L4** authority level -- the highest non-SUPREME authority in the platform hierarchy -- reflecting the critical nature of production deployments. It is executed by the `fly-io-deployment-agent` agent and is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The L4 authority requirement ensures that only authorized operators can trigger production deployments, and that every deployment is traceable and auditable.

The Prismatic Platform runs on Fly.io's global edge infrastructure, with the production application accessible at `prismatic-prod.fly.dev` and the staging environment at `prismatic-staging.fly.dev`. Deployments use Fly.io's rolling update strategy by default, which replaces instances gradually to maintain availability during the transition. The command also supports manual rollback control for situations where automatic rollback is insufficient.

## Architecture

### Deployment Pipeline

```
/deploy-production [version]
    |
    v
PRE-DEPLOYMENT GATES
    +-- Clean working directory verification
    +-- Quality gates pass (all 13 domains)
    +-- Staging deployment verified
    +-- Database migrations validated
    +-- Rollback tested and ready
    +-- Explicit operator confirmation
    |
    v
DEPLOYMENT EXECUTION
    +-- Fly.io deployment trigger
    +-- Rolling update strategy
    +-- Instance replacement
    +-- Health check monitoring
    |
    v
POST-DEPLOYMENT VALIDATION
    +-- Health endpoint verification (10s window)
    +-- Response time validation (< 250ms)
    +-- Error rate monitoring (0% tolerance)
    +-- Database connectivity check
    |
    v
STABILIZATION MONITORING
    +-- 24-hour monitoring window
    +-- Performance metric tracking
    +-- Error rate alerting
    +-- Auto-rollback on degradation
```

### Infrastructure Topology

| Component | Staging | Production |
|-----------|---------|------------|
| **App Name** | prismatic-staging | prismatic |
| **URL** | prismatic-staging.fly.dev | prismatic-prod.fly.dev |
| **Config** | fly.staging.toml | fly.toml |
| **Health Endpoint** | /health | /health |
| **Deploy Strategy** | Rolling | Rolling |
| **Min Instances** | 1 | 2 |

## Usage

### Standard Production Deployment

```bash
# Deploy specific version to production with auto-rollback
/deploy-production v2.1.0

# Deploy with manual rollback control
/deploy-production v2.1.0 manual

# Deploy latest (from current branch state)
/deploy-production latest
```

### Dry Run

```bash
# Preview what production deploy would do
/deploy-production v2.1.0 --dry-run
```

### Rollback

```bash
# Rollback to previous version
/deploy-production rollback

# Rollback to specific version
/deploy-production rollback v2.0.9
```

## Options & Parameters

| Parameter | Position | Required | Type | Default | Description |
|-----------|----------|----------|------|---------|-------------|
| **version** | $1 | Yes | string | -- | Version to deploy (e.g., v2.1.0, latest) |
| **rollback_strategy** | $2 | No | string | `auto` | Rollback strategy: auto (automatic on failure) or manual |
| **--dry-run** | flag | No | boolean | false | Show what would be done without executing |
| **--skip-staging-check** | flag | No | boolean | false | Skip staging verification (requires explicit confirmation) |
| **--monitoring-window** | flag | No | integer | 10 | Post-deploy health check window in seconds |

## Execution Flow

```
/deploy-production [version] [rollback_strategy]
    |
    v
PHASE 1: PRE-FLIGHT VALIDATION (< 30s)
    +-- Verify clean working directory (git status)
    +-- Confirm version exists and is tagged
    +-- Validate Fly.io credentials and access
    +-- Check staging deployment status
    +-- Run quality gates (mix quality.gates --quick)
    +-- Verify database migration compatibility
    |
    v
PHASE 2: OPERATOR CONFIRMATION (manual)
    +-- Display deployment summary
    +-- Show diff from current production version
    +-- List database migrations to run
    +-- Request explicit "yes" confirmation
    |
    v
PHASE 3: DEPLOYMENT EXECUTION (30-120s)
    +-- Trigger Fly.io deployment (fly deploy)
    +-- Monitor build progress
    +-- Track instance replacement
    +-- Wait for healthy instances
    |
    v
PHASE 4: HEALTH VALIDATION (10s window)
    +-- Poll /health endpoint every second
    +-- Verify response time < 250ms
    +-- Check error rate = 0%
    +-- Validate database connectivity
    +-- Confirm LiveView WebSocket connectivity
    |
    v
PHASE 5: POST-DEPLOYMENT (ongoing)
    +-- Log deployment event to telemetry
    +-- Record deployment in GitLab
    +-- Begin 24-hour monitoring window
    +-- Enable auto-rollback triggers
    +-- Notify stakeholders of successful deployment
```

### Quality Gates Checklist

```
PRE-DEPLOYMENT QUALITY GATES
=============================
[ ] Compilation: zero warnings
[ ] Credo: zero violations (strict mode)
[ ] Dialyzer: zero warnings
[ ] Tests: all passing
[ ] Coverage: at or above baseline
[ ] Performance: all pages < 250ms
[ ] Database: migrations validated
[ ] Staging: deployment verified healthy
[ ] Rollback: previous version tested
```

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Executed by `fly-io-deployment-agent` | Agent manages Fly.io deployment lifecycle |
| [AIAD](@/glossary/aiad.md) Registry | Command specification | Operations category, L4 authority |
| [Quality Gates](@/glossary/quality-gates.md) | Mandatory pre-deployment validation | All 13 quality domains must pass |
| [Telemetry](@/glossary/telemetry.md) | Deployment [metrics](@/glossary/metrics.md) | Deployment time, health status, rollback events |
| [GitLab CI](@/glossary/gitlab-ci.md)/CD | Pipeline integration | Deployment triggered from CI pipeline |
| Fly.io | Infrastructure provider | Application hosting and scaling |
| Page Load Performance | Post-deployment validation | All pages must load under 250ms |

### Fly.io Deployment Configuration

```toml
# fly.toml (production)
app = "prismatic"
primary_region = "fra"

[build]
  dockerfile = "Dockerfile"

[http_service]
  internal_port = 4000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true

[[services]]
  protocol = "tcp"
  internal_port = 4000

  [[services.ports]]
    port = 80
    handlers = ["http"]

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

  [[services.tcp_checks]]
    grace_period = "30s"
    interval = "15s"
    timeout = "10s"

  [[services.http_checks]]
    interval = 10000
    grace_period = "30s"
    method = "get"
    path = "/health"
    protocol = "http"
    timeout = 2000
```

## Best Practices

1. **Always deploy to staging first** -- Verify the exact same build on staging before promoting to production. Never deploy untested code directly to production.

2. **Deploy during low-traffic windows** -- Schedule production deployments during off-peak hours to minimize user impact in case of issues.

3. **Monitor continuously for 24 hours** -- The first 24 hours after deployment are critical. Monitor response times, error rates, and resource usage closely.

4. **Have the team on standby** -- Ensure someone is available to respond to issues during and after production deployment.

5. **Use version tags, not branch references** -- Always deploy tagged versions (v2.1.0) rather than branch tips to ensure reproducibility.

6. **Document deployment notes** -- Record any notable changes, migration impacts, or configuration updates in the deployment log for post-incident reference.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `DIRTY_WORKING_DIRECTORY` | Uncommitted changes present | Commit or stash changes before deploying |
| `QUALITY_GATES_FAILED` | One or more quality domains failing | Fix quality violations before deployment |
| `STAGING_NOT_VERIFIED` | Staging deployment not confirmed healthy | Deploy and verify staging first |
| `FLY_AUTH_FAILED` | Fly.io authentication failure | Run `fly auth login` to refresh credentials |
| `HEALTH_CHECK_FAILED` | Post-deployment health check failure | Automatic rollback triggers; investigate root cause |
| `MIGRATION_CONFLICT` | Database migration incompatibility | Resolve migration conflicts before deployment |
| `ROLLBACK_FAILED` | Rollback to previous version failed | Manual intervention required; check Fly.io dashboard |

### Automatic Rollback Triggers

```
ROLLBACK TRIGGERS
=================
- Health endpoint returns non-200 for > 10 seconds
- Average response time exceeds 500ms for > 30 seconds
- Error rate exceeds 1% for > 60 seconds
- Database connection failures detected
- Memory usage exceeds 90% sustained for > 5 minutes
```

## Advanced Usage

### CI/CD Pipeline Integration

```yaml
# .gitlab-ci.yml
deploy_production:
  stage: deploy
  script:
    - flyctl deploy --config fly.toml --strategy rolling
  environment:
    name: production
    url: https://prismatic-prod.fly.dev
  when: manual
  only:
    - tags
  dependencies:
    - deploy_staging
    - quality_gates
```

### Manual Fly.io Operations

```bash
# Check current production status
fly status --app prismatic

# View production logs
fly logs --app prismatic

# SSH into production instance
fly ssh console --app prismatic

# Scale production instances
fly scale count 3 --app prismatic

# View deployment history
fly releases --app prismatic
```

### Performance Validation

```elixir
# Post-deployment performance check
defmodule PrismaticDeploy.PerformanceCheck do
  def validate_production do
    endpoints = ["/", "/perimeter", "/dashboard", "/health"]

    Enum.each(endpoints, fn path ->
      {time_ms, _response} = :timer.tc(fn ->
        HTTPoison.get!("https://prismatic-prod.fly.dev#{path}")
      end)

      time_ms = div(time_ms, 1000)

      if time_ms > 250 do
        raise "Performance violation: #{path} took #{time_ms}ms (limit: 250ms)"
      end
    end)
  end
end
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for production deployments that bypass quality gates. Every deployment must pass all 13 quality domains. Every deployment must be health-validated. Automatic rollback is mandatory, not optional. Page load performance under 250ms is enforced, not suggested.
- **NO DOUBTS**: Full pre-deployment verification through quality gates, staging confirmation, and migration validation. Post-deployment health checks use active probing, not cached state. Evidence-based deployment decisions with measurable metrics at every stage.

## Related Commands

- [/deploy](@/commands/deploy.md) - Deployment to staging environment via [GitLab CI](@/glossary/gitlab-ci.md)/CD
- [/deploy-unified](@/commands/deploy-unified.md) - Safe validated traceable deployment for all environments
- [/deploy-meilisearch](@/commands/deploy-meilisearch.md) - Meilisearch instance deployment and configuration
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/commit](@/commands/commit.md) - Smart commit with quality gates and conventional format
- [/emergency](@/commands/emergency.md) - Emergency response and crisis management activation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)