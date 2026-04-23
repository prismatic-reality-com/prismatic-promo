+++
title = "/cicd-unified"
weight = 1780
[extra]
category = "DevOps"
description = "Unified CI/CD workflow actions for pipeline management"
syntax = "/cicd-unified [options]"
authority = "L2+"
agent = "cicd-tooling-specialist"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1075
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["cicd-unified", "Unified", "CICD", "commands", "DevOps", "Prismatic Platform", "GitLab", "Pipeline", "HARD BLOCK"]
tags = ["commands", "devops", "cicd-unified", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/cicd-unified - Prismatic Platform"
+++

## Overview

**/cicd-unified** is a production command in the **DevOps** category of the Prismatic Platform that provides a single entry point for all continuous integration and continuous deployment workflow actions. Instead of managing separate commands for pipeline triggering, status monitoring, artifact retrieval, and deployment control, this command unifies the entire CI/CD lifecycle under one interface. It abstracts away the differences between [GitLab CI](@/glossary/gitlab-ci.md) pipeline syntax, deployment targets (Fly.io staging and production), and quality gate enforcement into a cohesive workflow.

This command operates under the **L2+** authority level and is executed by the `cicd-tooling-specialist` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The unified approach ensures that all CI/CD operations are subject to the same quality enforcement, telemetry tracking, and doctrine compliance as every other platform command.

The Prismatic Platform's CI/CD infrastructure manages a complex pipeline that must compile nearly 100 umbrella applications, run thousands of tests, enforce zero-warning compilation, execute Credo static analysis, verify Dialyzer type specifications, and deploy to multiple environments. The `/cicd-unified` command tames this complexity by providing intelligent defaults, automatic pipeline stage detection, and integration with the platform's quality gate system.

## Architecture

The command is architected as a facade over the platform's CI/CD subsystem, which itself integrates with GitLab CI, Fly.io deployment, and the internal quality gate infrastructure.

### Pipeline Model

The platform uses a multi-stage pipeline model defined in `.gitlab-ci.yml`. Each stage corresponds to a quality level that must be satisfied before proceeding.

| Stage | Purpose | Gate |
|-------|---------|------|
| **compile** | Zero-warning compilation with `--warnings-as-errors` | HARD BLOCK |
| **lint** | Credo strict analysis and formatting checks | HARD BLOCK |
| **typecheck** | Dialyzer type specification verification | HARD BLOCK |
| **test** | Full test suite execution with coverage | HARD BLOCK |
| **quality** | Quality gate composite score verification | HARD BLOCK |
| **build** | Docker image construction (multi-stage) | HARD BLOCK |
| **deploy-staging** | Fly.io staging environment deployment | SOFT (manual trigger) |
| **deploy-production** | Fly.io production environment deployment | SOFT (manual trigger) |

### Component Topology

```
/cicd-unified
    |
    +-- PipelineController
    |     |-- GitLabClient (REST API)
    |     |-- PipelineMonitor (polling/webhook)
    |     +-- ArtifactManager (download/cache)
    |
    +-- DeploymentController
    |     |-- FlyClient (fly.io CLI wrapper)
    |     |-- HealthChecker (post-deploy verification)
    |     +-- RollbackManager (automatic rollback)
    |
    +-- QualityGateEnforcer
          |-- CompilationChecker
          |-- CredoRunner
          |-- DialyzerRunner
          +-- TestRunner
```

## Usage

```bash
# Trigger a new pipeline for the current branch
/cicd-unified trigger

# Check the status of the current pipeline
/cicd-unified status

# View detailed pipeline logs for a specific stage
/cicd-unified logs --stage=test

# Deploy to staging after pipeline passes
/cicd-unified deploy --target=staging

# Deploy to production with approval workflow
/cicd-unified deploy --target=production --approve

# Rollback production to previous release
/cicd-unified rollback --target=production

# List recent pipeline runs with results
/cicd-unified history --limit=10

# Download build artifacts
/cicd-unified artifacts --pipeline=latest --stage=build

# Retry a failed pipeline stage
/cicd-unified retry --stage=test --pipeline=latest

# Run quality gates locally before triggering remote pipeline
/cicd-unified preflight
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `action` | string | required | Action: trigger, status, logs, deploy, rollback, history, artifacts, retry, preflight |
| `--target` | string | staging | Deployment target: staging, production |
| `--stage` | string | all | Pipeline stage to operate on |
| `--pipeline` | string | latest | Pipeline ID or "latest" |
| `--branch` | string | current | Git branch for pipeline trigger |
| `--approve` | flag | false | Require explicit approval for deployment |
| `--limit` | integer | 5 | Number of history entries to display |
| `--format` | string | text | Output format: text, json, table |
| `--wait` | flag | false | Block until pipeline completes |
| `--timeout` | integer | 1800 | Timeout for `--wait` in seconds |
| `--verbose` | flag | false | Show detailed output including job logs |
| `--dry-run` | flag | false | Show what would happen without executing |

## Execution Flow

The execution flow varies by action, but all actions share a common preamble of authentication, context resolution, and quality pre-checks.

1. **Authentication**: GitLab API token and Fly.io credentials are validated from environment variables (`GITLAB_TOKEN`, `FLY_API_TOKEN`).

2. **Context Resolution**: The current git branch, latest commit SHA, and pipeline state are resolved to establish the operational context.

3. **Pre-Check**: Quality gates are verified locally to catch obvious issues before triggering remote operations. This prevents wasting CI minutes on pipelines that will fail in the first stage.

4. **Action Dispatch**: The requested action is dispatched to the appropriate controller (PipelineController for trigger/status/logs/history/retry, DeploymentController for deploy/rollback).

5. **Execution**: The action executes with full telemetry instrumentation. Pipeline triggers use the GitLab REST API, deployments use the Fly.io CLI, and quality checks use local mix tasks.

6. **Result Reporting**: Results are formatted and presented with clear status indicators. Failed operations include diagnostic information and suggested remediation steps.

7. **Post-Action Hooks**: Session lifecycle hooks record the CI/CD action for audit trail purposes. Deployment actions additionally trigger health checks on the target environment.

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Executed by `cicd-tooling-specialist` | Agent manages pipeline lifecycle |
| [GitLab CI](@/glossary/gitlab-ci.md) | Pipeline backend | REST API for trigger, status, logs, artifacts |
| [Quality Gates](@/glossary/quality-gates.md) | Pre/post execution validation | Local preflight and remote stage gates |
| [Telemetry](@/glossary/telemetry.md) | Execution [metrics](@/glossary/metrics.md) | Pipeline duration, stage timing, deployment frequency |
| [AIAD Registry](@/glossary/aiad.md) | Command specification | CI/CD command configuration |
| Fly.io | Deployment target | Staging and production hosting |
| Docker | Image building | Multi-stage builds for production |
| [/guardrails](@/commands/guardrails.md) | Deployment safety | Pre-deployment safety checks |

## Best Practices

**Run preflight before triggering.** The `preflight` action runs all quality checks locally in under 60 seconds. This catches compilation warnings, Credo violations, and test failures before consuming CI minutes on the remote pipeline.

**Use staging before production.** Always deploy to staging first and verify the application health before promoting to production. The command enforces this by requiring `--approve` for production deployments.

**Monitor pipeline duration trends.** Use `history` to track pipeline duration over time. A gradually increasing pipeline time often indicates growing test suites or dependency resolution issues that should be addressed.

**Pin pipeline references.** When discussing specific pipelines in issues or documentation, use the pipeline ID rather than "latest" to ensure the reference remains stable over time.

**Configure timeout appropriately.** The full pipeline for the Prismatic Platform with nearly 100 umbrella apps takes 15-25 minutes. Set `--timeout` accordingly when using `--wait`.

**Use atomic deployments.** The Fly.io deployment strategy uses blue-green deployment with health checks. If the new version fails health checks, the deployment automatically rolls back without operator intervention.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `gitlab_auth_failure` | Invalid or expired `GITLAB_TOKEN` | Regenerate token in GitLab settings |
| `pipeline_trigger_failed` | Branch protection or CI configuration error | Verify branch permissions and `.gitlab-ci.yml` |
| `stage_timeout` | Pipeline stage exceeded time limit | Check for hanging tests or resource contention |
| `deploy_health_check_failed` | Application failed post-deploy health check | Automatic rollback triggered, investigate logs |
| `fly_auth_failure` | Invalid `FLY_API_TOKEN` | Re-authenticate with `fly auth token` |
| `quality_gate_blocked` | Pre-flight quality check failed | Fix reported issues before triggering pipeline |
| `artifact_not_found` | Requested artifact expired or never created | Check pipeline configuration for artifact retention |
| `rollback_failed` | No previous release available | Manual intervention required via Fly.io dashboard |

## Advanced Usage

### Pipeline Scheduling

Schedule pipelines for off-peak execution to optimize CI resource utilization.

```bash
# Schedule pipeline for 2 AM
/cicd-unified trigger --schedule="02:00" --branch=main

# Trigger nightly full pipeline
/cicd-unified trigger --full --schedule="nightly"
```

### Custom Pipeline Variables

Pass custom variables to pipeline runs for conditional stage execution.

```bash
# Skip deployment stages
/cicd-unified trigger --var="SKIP_DEPLOY=true"

# Run extended test suite
/cicd-unified trigger --var="TEST_SUITE=extended"
```

### Multi-Environment Deployment

Deploy specific commits to specific environments with environment-specific configuration.

```bash
# Deploy specific SHA to staging
/cicd-unified deploy --target=staging --sha=abc1234

# Promote staging to production (uses staging's verified image)
/cicd-unified deploy --target=production --promote-from=staging
```

### GitLab CI YAML Compliance

The platform enforces strict GitLab CI YAML patterns. The command validates YAML before submission.

```bash
# Validate CI configuration
/cicd-unified validate-yaml

# Lint CI configuration with platform standards
/cicd-unified lint-yaml --strict
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Every pipeline stage must pass before deployment is permitted. No bypass flags.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Pipeline results are fully auditable with complete logs and artifact preservation.

## Related Commands

- [/guardrails](@/commands/guardrails.md) - CI/CD guardrails enforcement for deployment safety
- [/gitlab-ci](@/commands/gitlab-ci.md) - [GitLab CI](@/glossary/gitlab-ci.md)/CD pipeline management and configuration
- [/gitlab-api](@/commands/gitlab-api.md) - GitLab API operations for project and repository management
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/commit](@/commands/commit.md) - Smart commit with quality gates and conventional format
- [/connect](@/commands/connect.md) - MCP server connection management across 14+ servers

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)