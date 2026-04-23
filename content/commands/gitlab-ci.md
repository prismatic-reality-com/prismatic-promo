+++
title = "/gitlab-ci"
weight = 1560
[extra]
category = "GitLab"
description = "GitLab CI/CD pipeline management and configuration"
syntax = "/gitlab-ci [options]"
authority = "L2+"
agent = "gitlab-ci-specialist"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1254
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["gitlab-ci", "GitLab", "CICD", "commands", "Prismatic Platform", "YAML", "GitLab API", "Pipeline"]
tags = ["commands", "gitlab", "gitlab-ci", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/gitlab-ci - Prismatic Platform"
+++

## Overview

**/gitlab-ci** is a production command in the **GitLab** category of the Prismatic Platform that provides comprehensive GitLab CI/CD pipeline management, configuration generation, and real-time monitoring capabilities. The command serves as the primary interface for all continuous integration and continuous delivery operations within the platform's development lifecycle, covering pipeline creation, stage management, job configuration, artifact handling, and deployment orchestration across staging and production environments.

The command is executed by the `gitlab-ci-specialist` agent operating at the **L2+** authority level, which grants it permissions to read pipeline state, trigger manual jobs, modify configuration files, and interact with the GitLab API for pipeline operations. As part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard, the command integrates directly with the platform's quality infrastructure to enforce zero-warning compilation, test coverage requirements, and deployment safety checks before any code reaches production.

Pipeline management within the Prismatic Platform is not a simple wrapper around GitLab's built-in CI/CD features. The `/gitlab-ci` command adds an intelligent layer that understands the platform's umbrella architecture with its 89+ applications, manages cross-application dependency ordering for builds, enforces the platform's strict quality gates at every pipeline stage, and provides real-time feedback to developers about pipeline status through the [telemetry](@/glossary/telemetry.md) subsystem. The command also handles the platform's unique requirement of maintaining a 10-level YAML nesting limit in all generated configuration, automatically extracting complex logic into shell scripts when necessary.

The command supports both interactive and automated modes. In interactive mode, developers use it to inspect pipeline status, trigger specific jobs, retry failed stages, and review artifact outputs. In automated mode, it integrates with session lifecycle hooks to ensure that every commit pushed to GitLab triggers the appropriate pipeline configuration and that quality gates are enforced before merges are permitted.

## Architecture

The `/gitlab-ci` command is built on a multi-layer architecture that separates concerns between configuration generation, pipeline orchestration, and status monitoring.

```
/gitlab-ci Command
    |
    +-- Configuration Generator
    |       +-- Stage Builder (compile, test, quality, deploy)
    |       +-- Job Template Engine
    |       +-- Script Extractor (10-level nesting compliance)
    |       +-- Variable Manager (CI/CD variables)
    |
    +-- Pipeline Orchestrator
    |       +-- GitLab API Client
    |       +-- Job Trigger Manager
    |       +-- Artifact Handler
    |       +-- Environment Manager (staging, production)
    |
    +-- Status Monitor
    |       +-- Real-time Pipeline Tracker
    |       +-- Job Log Streamer
    |       +-- Failure Analyzer
    |       +-- Telemetry Reporter
    |
    +-- Quality Integration
            +-- Pre-pipeline Gate Check
            +-- Post-pipeline Validation
            +-- Coverage Reporter
            +-- Warning Detector
```

The Configuration Generator produces `.gitlab-ci.yml` content that adheres to the platform's mandatory YAML patterns. All script blocks use the `- command` or `- 'cmd; cmd'` format, with literal blocks (`- |`), folded blocks (`- >-`), and heredocs (`<< EOF`) strictly forbidden per platform policy. Complex build logic is automatically extracted to `scripts/*.sh` files to maintain nesting compliance.

The Pipeline Orchestrator communicates with the GitLab API using the configured `GITLAB_TOKEN` and `GITLAB_PROJECT_ID` environment variables, providing programmatic control over pipeline lifecycle operations including creation, cancellation, retry, and manual job triggering.

## Usage

### Basic Pipeline Status

```bash
# Check current pipeline status
/gitlab-ci status

# View detailed pipeline for a specific branch
/gitlab-ci status --branch=feature/perimeter-mvp

# Show running jobs across all active pipelines
/gitlab-ci jobs --status=running
```

### Pipeline Configuration

```bash
# Generate CI/CD configuration for the umbrella project
/gitlab-ci generate --apps=all

# Generate configuration for specific applications
/gitlab-ci generate --apps=prismatic_perimeter,prismatic_web

# Validate existing .gitlab-ci.yml against platform standards
/gitlab-ci validate

# Lint YAML for nesting depth and forbidden patterns
/gitlab-ci lint --strict
```

### Pipeline Operations

```bash
# Trigger a new pipeline on the current branch
/gitlab-ci trigger

# Retry all failed jobs in the latest pipeline
/gitlab-ci retry --failed

# Cancel running pipeline
/gitlab-ci cancel --pipeline=12345

# Download artifacts from a specific job
/gitlab-ci artifacts --job=test --pipeline=12345
```

### Advanced Operations

```bash
# Generate multi-stage pipeline with dependency ordering
/gitlab-ci generate --multi-stage --deps=auto

# Create child pipeline configuration for parallel testing
/gitlab-ci generate --child-pipeline --split=4

# Export pipeline metrics to telemetry
/gitlab-ci metrics --export
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--branch` | string | current | Target branch for pipeline operations |
| `--apps` | string | all | Comma-separated list of umbrella apps to include |
| `--status` | string | all | Filter jobs by status (running, failed, success, pending) |
| `--pipeline` | integer | latest | Specific pipeline ID to target |
| `--multi-stage` | flag | false | Generate multi-stage pipeline with ordered dependencies |
| `--deps` | string | manual | Dependency resolution mode (auto, manual, none) |
| `--strict` | flag | false | Enable strict validation against all platform standards |
| `--child-pipeline` | flag | false | Generate child pipeline for parallel execution |
| `--split` | integer | 2 | Number of parallel groups for test splitting |
| `--export` | flag | false | Export results to telemetry subsystem |
| `--format` | string | text | Output format (text, json, yaml) |
| `--dry-run` | flag | false | Preview changes without applying them |

## Execution Flow

The command follows a structured execution flow that ensures quality compliance at every stage.

1. **Initialization**: Load GitLab configuration from environment variables (`GITLAB_TOKEN`, `GITLAB_PROJECT_ID`). Validate API connectivity and authentication. Initialize the `gitlab-ci-specialist` agent context.

2. **Context Analysis**: Determine the current branch, detect modified files using `git diff`, identify affected umbrella applications through dependency graph analysis. Load existing `.gitlab-ci.yml` if present.

3. **Quality Pre-Check**: Execute `mix quality.gates.check --fast` to verify the codebase is in a deployable state. Check for compilation warnings, Credo violations, and test failures that would block the pipeline.

4. **Operation Dispatch**: Route the command to the appropriate handler based on the subcommand (status, generate, trigger, validate, lint, retry, cancel, artifacts, metrics).

5. **Execution**: Perform the requested operation, interacting with the GitLab API as needed. For configuration generation, build the YAML structure respecting all platform constraints.

6. **Validation**: Post-execution validation ensures that generated configurations are syntactically correct, within nesting limits, and compliant with platform YAML patterns. For pipeline triggers, verify the pipeline was created successfully.

7. **Reporting**: Emit [telemetry](@/glossary/telemetry.md) events for the operation. Report results to the user with relevant status information. Log the operation in the session context.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Agent Execution | Executed by `gitlab-ci-specialist` agent with L2+ authority |
| [Quality Gates](@/glossary/quality-gates.md) | Pre/Post Validation | Enforces compilation, test, and Credo checks before pipeline operations |
| [Telemetry](@/glossary/telemetry.md) | Event Emission | Reports pipeline metrics, job durations, and failure rates |
| GitLab API | External Service | Communicates with GitLab for pipeline CRUD operations |
| [Prismatic Web](@/apps/prismatic-web.md) | Dashboard Display | Pipeline status displayed in LiveView monitoring dashboards |
| Session Lifecycle | Automation Hook | Triggered automatically during session start and end phases |
| [SEADF](@/glossary/seadf.md) | Evolution Integration | Pipeline data feeds into autonomous evolution metrics |

## Best Practices

**Configuration Management**: Always use `/gitlab-ci validate` before committing changes to `.gitlab-ci.yml`. The platform's strict YAML requirements (no literal blocks, no heredocs, maximum 10-level nesting) differ from standard GitLab CI/CD practices and must be enforced consistently.

**Pipeline Optimization**: Use the `--multi-stage` flag with `--deps=auto` to generate pipelines that respect the umbrella application dependency graph. This ensures that foundational apps like `prismatic_storage_core` compile before dependent apps, reducing pipeline failures from dependency ordering issues.

**Artifact Management**: Configure artifact expiration appropriately. Test coverage reports and compilation artifacts should expire after 7 days, while release artifacts should be retained indefinitely. Use the `artifacts` subcommand to audit and clean up expired artifacts.

**Branch Strategy**: Configure pipeline rules that match the platform's branching strategy. Feature branches should run compile and test stages only. The main branch should run the full pipeline including quality gates, Dialyzer analysis, and deployment stages.

**Parallel Execution**: For large test suites, use `--child-pipeline --split=4` to generate child pipelines that distribute tests across parallel jobs. This can reduce pipeline duration from 15+ minutes to under 5 minutes for the platform's 5,500+ test files.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `GITLAB_TOKEN not set` | Missing environment variable | Set `GITLAB_TOKEN` with a valid personal access token |
| `Pipeline creation failed (403)` | Insufficient permissions | Verify token has `api` and `read_repository` scopes |
| `YAML nesting depth exceeded` | Generated config exceeds 10 levels | Use `--extract-scripts` to move complex logic to shell scripts |
| `Forbidden YAML pattern detected` | Literal or folded blocks in config | Replace with `- command` or `- 'cmd; cmd'` format |
| `Quality gate blocked` | Pre-pipeline quality check failed | Fix compilation warnings or test failures before triggering |
| `Pipeline timeout` | Job exceeded maximum duration | Increase timeout in job configuration or optimize the operation |

When errors occur during pipeline operations, the command provides structured error output with specific remediation steps. All errors are logged to the [telemetry](@/glossary/telemetry.md) subsystem for trend analysis and proactive issue detection.

## Advanced Usage

### Custom Pipeline Templates

```bash
# Create a reusable pipeline template for a specific app
/gitlab-ci template --app=prismatic_perimeter --output=.gitlab/templates/perimeter.yml

# Include templates in main configuration
/gitlab-ci generate --include=.gitlab/templates/*.yml
```

### Pipeline Scheduling

```bash
# View scheduled pipelines
/gitlab-ci schedules --list

# Create a nightly quality pipeline
/gitlab-ci schedules --create --cron="0 2 * * *" --branch=main --description="Nightly quality"
```

### Cross-Project Pipelines

```bash
# Trigger pipeline in related project (e.g., promo site deployment)
/gitlab-ci trigger --project=prismatic-promo --branch=main

# Monitor cross-project pipeline status
/gitlab-ci status --project=prismatic-promo
```

## Doctrine Compliance

All pipeline operations enforce the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine.

- **NO MERCY**: Pipelines that produce compilation warnings, test failures, or Credo violations are automatically blocked. No pipeline is permitted to deploy code that does not pass all quality gates. Every generated configuration includes mandatory quality stages.
- **NO DOUBTS**: Pipeline status is always verified through the GitLab API before reporting results. Configuration is validated against the platform's YAML standards before being written to disk. All operations produce evidence-based results with full traceability.

The command enforces the platform's Mandatory Session Discipline Protocol by ensuring all CI/CD operations are tracked through GitLab issues and that pipeline results are pushed to the remote repository immediately upon completion.

## Related Commands

- [/gitlab-api](@/commands/gitlab-api.md) - GitLab API operations for project and repository management
- [/gitlab-auto-sync](@/commands/gitlab-auto-sync.md) - Automatic GitLab integration for all AIAD workflows
- [/gitlab-enforce](@/commands/gitlab-enforce.md) - GitLab enforcement for compliance and workflow standards
- [/gitlab-mr](@/commands/gitlab-mr.md) - GitLab merge request creation and management
- [/gitlab-sync](@/commands/gitlab-sync.md) - GitLab issue synchronization and tracking operations
- [/gitlab-supreme-sync](@/commands/gitlab-supreme-sync.md) - Comprehensive GitLab synchronization with commit forensics
- [/guardrails](@/commands/guardrails.md) - CI/CD guardrails enforcement for deployment safety
- [/commit](@/commands/commit.md) - Smart commit with quality gates and conventional format
- [/agents](@/commands/agents.md) - List and manage agent ecosystem with status monitoring

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)