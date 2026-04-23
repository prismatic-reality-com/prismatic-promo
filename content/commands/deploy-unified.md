+++
title = "/deploy-unified"
weight = 950
[extra]
category = "Operations"
description = "Safe validated traceable deployment for all environments"
syntax = "/deploy-unified [options]"
authority = "L3"
agent = "deployment-coordinator"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 832
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["deploy-unified", "Safe", "commands", "Operations", "Prismatic Platform", "Production", "Rollback"]
tags = ["commands", "operations", "deploy-unified", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/deploy-unified - Prismatic Platform"
+++

## Overview

The **/deploy-unified** command serves as the single entry point for all deployment operations across the Prismatic Platform, replacing the need to remember multiple deployment commands, scripts, and procedures. Whether deploying to staging, promoting to production, executing an emergency rollback, streaming logs, or checking system health, this command provides a consistent interface with built-in safety gates, health validation, and traceable audit trails for every operation.

The unified deployment philosophy addresses a common operational anti-pattern: scattered deployment procedures across mix tasks, shell scripts, CI/CD pipelines, and manual Fly.io commands. By consolidating all deployment operations under a single command with consistent parameter conventions, the platform eliminates the cognitive overhead of remembering which tool to use for which scenario, reduces the risk of using the wrong procedure, and ensures that every deployment follows the same safety protocol regardless of the operator's familiarity with the infrastructure.

This command operates under the **L3** authority level and is executed by the `deployment-coordinator` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The deployment coordinator agent orchestrates all deployment-related operations, delegating to specialized agents for environment-specific tasks while maintaining a unified audit trail.

Safety is the primary design principle. Every deployment passes through mandatory quality gates. Production deployments require explicit confirmation. Health checks run automatically after every deployment. Rollback procedures are prepared and tested before any forward deployment. The `--dry-run` option allows operators to preview exactly what a deployment would do before committing to execution, and the `--force` flag is available for non-production environments when prompt bypassing is needed during automated CI/CD flows.

## Architecture

### Unified Deployment Control Center

```
/deploy-unified [command] [target] [options]
    |
    v
COMMAND ROUTER
    +-- status   -> Display all environment status
    +-- staging  -> Deploy to staging environment
    +-- production -> Deploy to production (with gates)
    +-- rollback -> Rollback specified environment
    +-- logs     -> Stream logs from environment
    +-- ssh      -> SSH into environment instance
    +-- health   -> Health check environment
    +-- config   -> Show deployment configuration
    |
    v
SAFETY GATE ENGINE
    +-- Clean working directory check
    +-- Quality gates validation
    +-- Environment-specific confirmation
    +-- Rollback preparation
    |
    v
DEPLOYMENT EXECUTOR
    +-- Fly.io deployment (staging/production)
    +-- Health check monitoring
    +-- Telemetry event emission
    +-- Audit trail recording
```

### Environment Protection Matrix

| Environment | Confirmation Required | Quality Gates | Health Check | Rollback Ready |
|-------------|:---------------------:|:-------------:|:------------:|:--------------:|
| **Staging** | No | Yes | Yes | Yes |
| **Production** | YES (explicit) | Yes | Yes (10s window) | Yes |
| **Rollback (staging)** | Yes | No | Yes | N/A |
| **Rollback (production)** | YES (explicit) | No | Yes | N/A |

## Usage

### Status and Monitoring

```bash
# Show deployment status for all environments
/deploy-unified status

# Health check specific environment
/deploy-unified health staging
/deploy-unified health production

# Stream logs from environment
/deploy-unified logs staging
/deploy-unified logs production

# Show deployment configuration
/deploy-unified config
```

### Staging Deployment

```bash
# Deploy to staging (with quality gates)
/deploy-unified staging

# Quick staging deploy (skip confirmation prompts)
/deploy-unified staging --force

# Dry run -- preview without executing
/deploy-unified staging --dry-run

# Verbose output
/deploy-unified staging --verbose
```

### Production Deployment

```bash
# Deploy to production (full safety gates)
/deploy-unified production

# Preview production deployment
/deploy-unified production --dry-run

# Production with verbose output
/deploy-unified production --verbose
```

### Rollback Operations

```bash
# Rollback staging
/deploy-unified rollback staging

# Rollback production (requires explicit confirmation)
/deploy-unified rollback production
```

### SSH and Debugging

```bash
# SSH into staging instance
/deploy-unified ssh staging

# SSH into production instance
/deploy-unified ssh production
```

## Options & Parameters

| Parameter | Position | Required | Type | Default | Description |
|-----------|----------|----------|------|---------|-------------|
| **command** | $1 | No | enum | `status` | Operation: status, staging, production, rollback, logs, ssh, health, config |
| **target** | $2 | No | enum | -- | Target environment for rollback, logs, ssh, health |
| **--dry-run** | flag | No | boolean | false | Preview without executing |
| **--skip-quality** | flag | No | boolean | false | Skip quality gates (requires confirmation) |
| **--force** | flag | No | boolean | false | Skip confirmation prompts |
| **--verbose** | flag | No | boolean | false | Show detailed output |

## Execution Flow

### Staging Deployment Flow

```
/deploy-unified staging
    |
    v
GATE 1: WORKING DIRECTORY (< 1s)
    +-- git status check
    +-- Uncommitted changes? -> BLOCK
    |
    v
GATE 2: QUALITY (< 30s)
    +-- mix quality.gates --quick
    +-- Any failures? -> BLOCK
    |
    v
DEPLOY (30-120s)
    +-- fly deploy --config fly.staging.toml
    +-- Monitor build and deployment
    |
    v
HEALTH CHECK (< 10s)
    +-- GET https://prismatic-staging.fly.dev/health
    +-- Status != 200? -> ALERT (no auto-rollback for staging)
    |
    v
COMPLETE
    +-- Log deployment event
    +-- Display success message
```

### Production Deployment Flow

```
/deploy-unified production
    |
    v
GATE 1: WORKING DIRECTORY
    +-- Clean check required
    |
    v
GATE 2: QUALITY GATES
    +-- All 13 domains must pass
    |
    v
GATE 3: CONFIRMATION
    +-- "Deploy to PRODUCTION? Type 'yes': "
    +-- Anything other than 'yes' -> ABORT
    |
    v
DEPLOY
    +-- fly deploy --config fly.toml
    +-- Rolling update strategy
    |
    v
HEALTH CHECK (10s window)
    +-- Continuous polling every second
    +-- Failure -> AUTO-ROLLBACK
    |
    v
COMPLETE
    +-- Deployment recorded
    +-- 24-hour monitoring begins
```

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `deployment-coordinator` agent | Central orchestrator for all deployment operations |
| [AIAD](/glossary/aiad/) Registry | Command specification | Operations category |
| [Quality Gates](/glossary/quality-gates/) | Mandatory pre-deployment validation | `mix quality.gates --quick` execution |
| [Telemetry](/glossary/telemetry/) | Deployment [metrics](/glossary/metrics/) | Deploy time, health status, rollback events |
| Fly.io | Infrastructure provider | Staging and production hosting |
| [GitLab CI](/glossary/gitlab-ci/) | Pipeline integration | Automated deployment triggers |

### Multiple Invocation Paths

The unified deployment command can be invoked through several equivalent paths:

```bash
# Slash command (interactive)
/deploy-unified staging

# Mix task (programmatic)
mix deploy.staging

# Shell script (CI/CD)
./scripts/deploy.sh staging
```

### CI/CD Integration

```yaml
# .gitlab-ci.yml
deploy_staging:
  script:
    - './scripts/deploy.sh staging --force'
  environment:
    name: staging
    url: https://prismatic-staging.fly.dev

deploy_production:
  script:
    - './scripts/deploy.sh production --force'
  environment:
    name: production
    url: https://prismatic-prod.fly.dev
  when: manual
```

### Deployment Targets

| Environment | App | Config | URL |
|-------------|-----|--------|-----|
| **Staging** | prismatic-staging | fly.staging.toml | https://prismatic-staging.fly.dev |
| **Production** | prismatic | fly.toml | https://prismatic-prod.fly.dev |

## Best Practices

1. **Use status before deploying** -- Run `/deploy-unified status` to understand the current state of all environments before initiating any deployment.

2. **Prefer dry-run for production** -- Always run `/deploy-unified production --dry-run` first to preview the deployment plan before committing.

3. **Deploy staging before production** -- The staging-first workflow catches issues in a low-risk environment. Never deploy untested code to production.

4. **Monitor health after every deployment** -- Use `/deploy-unified health <env>` immediately after deployment and periodically throughout the first 24 hours.

5. **Keep rollback procedures tested** -- Periodically perform rollback operations on staging to ensure the procedure works when needed in production.

6. **Use force flag only in CI/CD** -- The `--force` flag bypasses confirmation prompts and should only be used in automated pipelines where human confirmation is provided through pipeline approval gates.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `DIRTY_WORKING_DIRECTORY` | Uncommitted changes | Commit or stash before deploying |
| `QUALITY_GATES_FAILED` | Quality check failures | Fix violations before deployment |
| `CONFIRMATION_REJECTED` | Operator did not type 'yes' | Re-run and confirm, or use --dry-run to preview |
| `DEPLOY_FAILED` | Fly.io deployment error | Check build logs; verify Dockerfile and config |
| `HEALTH_CHECK_FAILED` | Post-deploy health failure | Auto-rollback triggers for production; investigate |
| `ROLLBACK_FAILED` | Cannot rollback to previous version | Manual intervention via Fly.io dashboard |

### Exit Codes

| Code | Meaning |
|------|---------|
| **0** | Deployment successful, health check passed |
| **1** | Deployment failed or health check failed |

## Advanced Usage

### Programmatic Deployment

```elixir
# Trigger deployment from Elixir code
{:ok, result} = PrismaticDeploy.execute(%{
  environment: :staging,
  force: true,
  verbose: false
})

# Check deployment status
{:ok, status} = PrismaticDeploy.status(:production)

# Execute health check
{:ok, health} = PrismaticDeploy.health(:staging)
```

### Custom Quality Gate Integration

```bash
# Pre-deployment quality validation
./scripts/quality.sh pre-commit
mix quality.gates --quick

# Full quality suite (for production)
mix compile --warnings-as-errors --force
mix credo --strict
mix test --cover
```

### Multi-Region Deployment

```bash
# Deploy to specific Fly.io region
fly deploy --config fly.toml --region fra

# Scale across regions
fly scale count 2 --region fra
fly scale count 1 --region iad
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for unvalidated deployments. Quality gates are mandatory, not optional. Health checks are automatic, not manual. Rollback procedures are prepared before deployment, not improvised after failure. Production confirmation is explicit, not assumed.
- **NO DOUBTS**: Full pre-deployment verification through automated quality gates. Post-deployment health validated through active probing. Every deployment produces a traceable audit trail. Evidence-based deployment decisions with measurable pass/fail criteria.

## Related Commands

- [/deploy](/commands/deploy/) - Deployment to staging environment via [GitLab CI](/glossary/gitlab-ci/)/CD
- [/deploy-production](/commands/deploy-production/) - Production deployment to [Fly.io](/glossary/fly-io/) with safety checks
- [/deploy-meilisearch](/commands/deploy-meilisearch/) - Meilisearch instance deployment and configuration
- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints
- [/commit](/commands/commit/) - Smart commit with quality gates and conventional format
- [/emergency](/commands/emergency/) - Emergency response and crisis management activation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)