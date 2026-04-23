+++
title = "/rc1-orchestrate"
weight = 1940
[extra]
category = "Framework"
description = "Complete RC1 delivery pipeline execution with ROC optimization"
syntax = "/rc1-orchestrate [options]"
authority = "SUPREME"
agent = "archer-supreme"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1235
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["rc1-orchestrate", "Complete", "commands", "Framework", "Prismatic Platform", "Phase", "AIAD"]
tags = ["commands", "framework", "rc1-orchestrate", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/rc1-orchestrate - Prismatic Platform"
+++

## Overview

**/rc1-orchestrate** is a production command in the **Framework** category of the Prismatic Platform that orchestrates the complete Release Candidate 1 delivery pipeline with integrated ROC (Release Optimization Cycle) processing. This command represents one of the most comprehensive automation capabilities in the platform, coordinating dozens of subsystems, quality gates, and validation steps into a single, deterministic delivery pipeline that transforms a development branch into a production-ready release candidate.

The RC1 orchestration pipeline was designed to eliminate the fragility and human error inherent in manual release processes. In a platform comprising over 90 umbrella applications, 6,652 Elixir source files, and approximately 2.8 million lines of code, manual release coordination is not merely impractical but fundamentally incompatible with the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine. Every release candidate must pass through an identical, reproducible pipeline that enforces quality standards without exception or deviation.

The ROC optimization layer adds intelligent resource allocation and execution ordering to the pipeline. Rather than executing all validation steps sequentially, ROC analyzes dependency graphs between pipeline stages, identifies parallelizable work, and optimizes the critical path to minimize total delivery time. This optimization can reduce RC1 delivery from hours to minutes while maintaining complete verification coverage. The ROC engine continuously learns from previous pipeline executions, refining its optimization strategies based on observed timings and failure patterns.

This command operates under the **SUPREME** authority level and is executed by the `archer-supreme` agent, the platform's elite tactical commander with unlimited authority for mission-critical operations. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard.

## Architecture

The RC1 orchestration pipeline follows a multi-phase architecture with checkpoint validation between each stage. The architecture ensures that failures are detected early and that no resources are wasted on downstream stages when an upstream validation fails.

```
Pipeline Entry
    |
    v
[Phase 1: Pre-flight Checks] --> Compilation, Dependencies, Config
    |
    v
[Phase 2: Quality Gates] --> Credo, Dialyzer, Warnings, Coverage
    |
    v
[Phase 3: Test Execution] --> Unit, Integration, Property-Based, E2E
    |
    v
[Phase 4: ROC Optimization] --> Dependency Analysis, Parallel Planning
    |
    v
[Phase 5: Build Artifacts] --> Release Build, Asset Compilation
    |
    v
[Phase 6: Deployment Validation] --> Staging Deploy, Smoke Tests
    |
    v
[Phase 7: RC1 Certification] --> Sign-off, Tagging, Documentation
    |
    v
RC1 Delivery Complete
```

Each phase reports its results to the [telemetry](/glossary/telemetry/) subsystem and updates the pipeline state in ETS for real-time monitoring. The [Quality Floor Guardian](/glossary/quality-gates/) monitors all phases and can halt the pipeline if quality metrics drop below the configured threshold.

## Usage

```bash
# Full RC1 delivery pipeline
/rc1-orchestrate

# RC1 with specific milestone target
/rc1-orchestrate --milestone=M46

# Dry-run mode to preview pipeline execution
/rc1-orchestrate --dry-run

# RC1 with custom quality threshold
/rc1-orchestrate --quality-floor=98

# Resume a previously interrupted pipeline
/rc1-orchestrate --resume --checkpoint=phase-3

# RC1 targeting specific applications
/rc1-orchestrate --apps=prismatic_perimeter,prismatic_web

# Full pipeline with verbose ROC optimization logging
/rc1-orchestrate --roc-verbose --timing-report
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--milestone` | string | latest | Target milestone for RC1 delivery |
| `--dry-run` | boolean | false | Preview pipeline without executing changes |
| `--quality-floor` | integer | 100 | Minimum quality score required for certification |
| `--resume` | boolean | false | Resume from last successful checkpoint |
| `--checkpoint` | string | - | Specific checkpoint to resume from |
| `--apps` | string | all | Comma-separated list of target applications |
| `--roc-verbose` | boolean | false | Enable detailed ROC optimization logging |
| `--timing-report` | boolean | false | Generate execution timing report |
| `--skip-staging` | boolean | false | Skip staging deployment (local validation only) |
| `--parallel` | integer | auto | Maximum parallel execution threads |
| `--tag-prefix` | string | rc1 | Version tag prefix for the release candidate |
| `--notify` | boolean | true | Send completion notifications via telemetry |

## Execution Flow

The RC1 orchestration follows a strict execution flow with checkpoint persistence at each transition point. This ensures that interrupted pipelines can be resumed without re-executing completed stages.

**Phase 1 - Pre-flight Checks**: The pipeline begins by verifying all prerequisites. This includes checking that the working directory is clean (no uncommitted changes), all dependencies are resolved and up to date, the Elixir and OTP versions match the project requirements, and the configuration files parse without errors. Any failure in pre-flight checks halts the pipeline immediately.

**Phase 2 - Quality Gates**: The comprehensive quality gate battery runs, including zero-warning compilation (`mix compile --warnings-as-errors --force`), [Credo](/glossary/credo/) strict analysis, Dialyzer type checking, and custom regression checks. The platform's 25 custom Credo checks must all pass with zero violations.

**Phase 3 - Test Execution**: The complete test suite executes across all target applications. This includes unit tests, integration tests, property-based tests, and end-to-end tests. Coverage must meet the configured threshold (default 100%).

**Phase 4 - ROC Optimization**: The ROC engine analyzes the build dependency graph, identifies the optimal execution order for artifact generation, and allocates parallel work streams based on available system resources.

**Phase 5 - Build Artifacts**: Release artifacts are generated using `mix release`, assets are compiled via the TailwindCSS pipeline, and all static resources are fingerprinted and compressed.

**Phase 6 - Deployment Validation**: The release candidate is deployed to the staging environment and subjected to smoke tests, route verification, and performance benchmarks.

**Phase 7 - RC1 Certification**: Upon successful completion of all prior phases, the release candidate is tagged, signed, and documented. A certification report is generated summarizing all quality metrics and test results.

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `archer-supreme` agent | SUPREME authority enables unrestricted pipeline control |
| [AIAD](/glossary/aiad/) Registry | Command specification and discovery | Pipeline stages registered as AIAD sub-commands |
| [Quality Gates](/glossary/quality-gates/) | Phase 2 enforcement | All 13 quality domains must achieve perfect scores |
| [Telemetry](/glossary/telemetry/) | Pipeline-wide event tracking | Real-time progress monitoring and alerting |
| [SEADF](/commands/seadf/) | Framework integration | Self-evolving capabilities applied to pipeline optimization |
| [Prismatic Perimeter](/apps/prismatic-perimeter/) | Security validation | EASM checks during deployment validation |
| Git Trees | Codebase analysis | Optimized file discovery for change detection |

## Best Practices

When executing the RC1 orchestration pipeline, several best practices ensure reliable and efficient delivery. Always run a `--dry-run` first when executing the pipeline for the first time on a new branch or after significant codebase changes. This preview mode reveals potential issues without consuming resources on build artifacts or deployment operations.

Maintain a clean git working directory before invoking the pipeline. The pre-flight checks will reject any uncommitted changes, but resolving this upfront avoids wasted time on the pre-flight phase. Use the `--apps` flag to scope the pipeline to specific applications when working on isolated features, which significantly reduces execution time.

Monitor the ROC timing reports across multiple runs to identify bottleneck stages. If a particular quality gate or test suite consistently dominates the critical path, investigate optimization opportunities in that specific area before attempting to optimize the pipeline itself.

## Error Handling

The RC1 pipeline implements comprehensive error handling with automatic recovery where possible and clear failure reporting where not. Each phase captures structured error context including the exact failure point, relevant log output, and suggested remediation steps.

```
RC1-ORCHESTRATE ERROR REPORT
Phase: Quality Gates (Phase 2)
Stage: Credo Strict Analysis
Error: 3 violations detected in prismatic_web
Details:
  - apps/prismatic_web/lib/router.ex:45 - Readability.ParenthesesInCondition
  - apps/prismatic_web/lib/router.ex:89 - Consistency.ExceptionNames
  - apps/prismatic_web/lib/router.ex:112 - Design.AliasUsage
Remediation: Fix Credo violations and re-run pipeline
Checkpoint saved: phase-2-quality-gates
Resume with: /rc1-orchestrate --resume --checkpoint=phase-2
```

Pipeline failures never leave the system in an inconsistent state. If a deployment validation fails, the staging environment is automatically rolled back to its previous state before the pipeline reports the failure.

## Advanced Usage

Advanced operators can customize the RC1 pipeline through configuration overlays and hook injection points. Custom validation steps can be inserted at any phase boundary using the AIAD hook mechanism. This enables project-specific requirements such as compliance checks, third-party API validation, or custom performance benchmarks.

```bash
# RC1 with custom hook at phase boundary
/rc1-orchestrate --hook=phase-3:custom-compliance-check

# RC1 with environment-specific configuration
/rc1-orchestrate --env=production --config=release.config.exs

# RC1 with artifact export for external CI/CD
/rc1-orchestrate --export-artifacts=/tmp/rc1-artifacts
```

The ROC optimization engine exposes tuning parameters for advanced scenarios. The `--parallel` flag controls the maximum concurrency level, which is useful when running on resource-constrained systems or when other workloads must share the same hardware.

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. The RC1 pipeline enforces every quality gate without exception. No stage can be skipped, no threshold can be lowered, and no failure can be bypassed. Every release candidate meets the same absolute standard.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every pipeline decision is logged with full provenance. The certification report provides complete traceability from source commit to deployed artifact.

The SUPREME authority level grants the `archer-supreme` agent unrestricted access to all pipeline resources, ensuring that no permission boundary or resource constraint can prevent a legitimate RC1 delivery from completing.

## Related Commands

- [/seadf](/commands/seadf/) - Self-Evolving Autonomous Development Framework control and monitoring
- [/inject](/commands/inject/) - AIAD injection coordination for pattern and agent deployment
- [/ecosystem](/commands/ecosystem/) - Platform ecosystem overview and status monitoring
- [/analyze](/commands/analyze/) - System architecture analysis with dependency mapping
- [/migrate](/commands/migrate/) - Safe migration planning with rollback strategies
- [/integrate](/commands/integrate/) - Cross-system integration design and implementation
- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/regression-check](/commands/regression-check/) - Execute 25 custom Credo regression checks preventing 700+ violations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)