+++
title = "/guardrails"
weight = 1790
[extra]
category = "DevOps"
description = "CI/CD guardrails enforcement for deployment safety"
syntax = "/guardrails [options]"
authority = "L3"
agent = "cicd-guardrails-enforcer"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1155
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["guardrails", "CICD", "commands", "DevOps", "Prismatic Platform", "Guardrail", "MERCY", "DOUBTS"]
tags = ["commands", "devops", "guardrails", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/guardrails - Prismatic Platform"
+++

## Overview

**/guardrails** is a production command in the **DevOps** category of the Prismatic Platform that enforces deployment safety through a comprehensive system of CI/CD guardrails, preventing dangerous or non-compliant changes from reaching production environments. The command implements multiple layers of protection including compilation verification, test coverage enforcement, quality gate validation, performance threshold checking, security scanning, and deployment approval workflows.

This command operates under the **L3** authority level and is executed by the `cicd-guardrails-enforcer` agent, which has the authority to block deployments, reject merge requests, and halt pipeline execution when guardrail violations are detected. The L3 authority level is the minimum required for deployment-blocking operations, reflecting the critical nature of guardrail enforcement in protecting production stability. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard.

The guardrails system goes far beyond simple CI/CD pipeline checks. It implements the platform's defense-in-depth deployment strategy where multiple independent safety checks must all pass before code can progress through the deployment pipeline. Each guardrail is independently evaluated, so a failure in one area (for example, compilation warnings) cannot be compensated by success in another area (for example, test coverage). This ensures that production code meets every quality dimension simultaneously, not just a weighted aggregate.

The platform's guardrails are particularly stringent. Zero compilation warnings are required (`--warnings-as-errors`), all Credo checks must pass (`--strict` mode), test coverage must meet threshold requirements, page load times must remain under 250ms, server-side renders must complete within 100ms, and no known security vulnerabilities can be present in dependencies. These are non-negotiable requirements enforced through the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine.

## Architecture

```
/guardrails Command
    |
    +-- Compilation Guardrail
    |       +-- Warning Detector (--warnings-as-errors)
    |       +-- Deprecation Scanner
    |       +-- Dead Code Analyzer
    |       +-- Type Error Checker
    |
    +-- Test Guardrail
    |       +-- Coverage Calculator
    |       +-- Test Execution Verifier
    |       +-- Regression Test Checker
    |       +-- Property-Based Test Validator
    |
    +-- Quality Guardrail
    |       +-- Credo Analyzer (--strict)
    |       +-- Dialyzer Verifier
    |       +-- Custom Check Runner (25 checks)
    |       +-- Code Hygiene Scanner
    |
    +-- Performance Guardrail
    |       +-- Page Load Timer (< 250ms)
    |       +-- Server Render Timer (< 100ms)
    |       +-- LiveView Mount Timer (< 150ms)
    |       +-- Event Handler Timer (< 50ms)
    |       +-- Health Check Timer (< 10ms)
    |
    +-- Security Guardrail
    |       +-- Dependency Vulnerability Scanner
    |       +-- Secret Detection Scanner
    |       +-- Input Validation Checker
    |       +-- OWASP Compliance Verifier
    |
    +-- Deployment Guardrail
            +-- Environment Readiness Checker
            +-- Rollback Plan Verifier
            +-- Health Check Validator
            +-- Canary Analysis Engine
```

Each guardrail operates independently with its own pass/fail criteria. The Compilation Guardrail uses `mix compile --warnings-as-errors --force` to detect any warnings that would indicate code quality issues. The Test Guardrail verifies both coverage thresholds and the presence of regression tests for bug fixes. The Performance Guardrail enforces the platform's strict page load requirements. The Security Guardrail scans for known vulnerabilities and exposed secrets.

## Usage

### Full Guardrail Check

```bash
# Run all guardrails
/guardrails check

# Run all guardrails with detailed output
/guardrails check --verbose

# Run guardrails for a specific environment
/guardrails check --environment=production

# Quick guardrail check (compilation and tests only)
/guardrails check --quick
```

### Individual Guardrail Checks

```bash
# Check compilation guardrail only
/guardrails check --guardrail=compilation

# Check performance guardrails
/guardrails check --guardrail=performance

# Check security guardrails
/guardrails check --guardrail=security

# Check test coverage guardrails
/guardrails check --guardrail=test
```

### Guardrail Configuration

```bash
# View current guardrail configuration
/guardrails config

# Set performance threshold
/guardrails config --page-load-limit=250ms

# Set coverage threshold
/guardrails config --min-coverage=80

# Enable/disable specific guardrails
/guardrails config --enable=security --disable=canary
```

### Deployment Gating

```bash
# Gate deployment on guardrail results
/guardrails gate --environment=staging

# Check if deployment is permitted
/guardrails gate --environment=production --check-only

# Force deployment with guardrail override (requires SUPREME authority)
/guardrails gate --environment=staging --override --reason="Emergency hotfix"
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--guardrail` | string | all | Specific guardrail to check (compilation, test, quality, performance, security, deployment) |
| `--environment` | string | staging | Target environment (staging, production) |
| `--verbose` | flag | false | Include detailed check output |
| `--quick` | flag | false | Run only critical guardrails (compilation, test) |
| `--check-only` | flag | false | Report results without blocking |
| `--override` | flag | false | Override guardrail block (SUPREME authority required) |
| `--reason` | string | none | Reason for override (required with `--override`) |
| `--page-load-limit` | string | 250ms | Maximum page load time |
| `--min-coverage` | integer | 80 | Minimum test coverage percentage |
| `--format` | string | text | Output format (text, json, markdown) |
| `--output` | string | stdout | File path for report output |
| `--fail-fast` | flag | false | Stop at first guardrail failure |

## Execution Flow

1. **Environment Detection**: Determine the target deployment environment. Load environment-specific guardrail configurations. Production environments enforce stricter thresholds than staging.

2. **Guardrail Selection**: Based on the `--guardrail` and `--quick` parameters, determine which guardrails to evaluate. Build the execution plan with appropriate ordering (compilation before tests, tests before performance).

3. **Sequential Evaluation**: Execute each guardrail in dependency order. Compilation must pass before tests can be meaningful. Quality checks run in parallel where possible. Performance checks require a running application instance.

4. **Result Collection**: Collect pass/fail results from each guardrail along with detailed diagnostic information. For failed guardrails, capture specific violation details and remediation guidance.

5. **Aggregate Assessment**: Compute the aggregate guardrail status. All guardrails must pass for the aggregate to pass -- there is no partial success. Generate a comprehensive report showing each guardrail's status and any violations.

6. **Gate Decision**: Based on the aggregate assessment and the operation mode (`--check-only` vs. active gating), either report results or actively block/permit the deployment. Blocked deployments remain blocked until all violations are resolved.

7. **Telemetry Reporting**: Emit [telemetry](/glossary/telemetry/) events for guardrail results, including individual guardrail pass/fail status, violation counts, and gate decisions. This data feeds into trend analysis for guardrail effectiveness monitoring.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Agent Execution | Executed by `cicd-guardrails-enforcer` at L3 authority |
| [Quality Gates](/glossary/quality-gates/) | Bidirectional | Quality gates are a subset of the guardrails system |
| [/gitlab-ci](/commands/gitlab-ci/) | Pipeline Integration | Guardrails execute as pipeline stages in CI/CD |
| [/gitlab-enforce](/commands/gitlab-enforce/) | Policy Enforcement | Guardrail results feed into enforcement decisions |
| [/cicd-unified](/commands/cicd-unified/) | Unified Pipeline | Guardrails integrate with unified CI/CD workflow |
| [Telemetry](/glossary/telemetry/) | Metrics | Guardrail results, violation rates, and gate decisions tracked |
| [Prismatic Web](/apps/prismatic-web/) | Dashboard | Guardrail status displayed in deployment dashboard |
| Pre-commit Hooks | Local Enforcement | Quick guardrails run as pre-commit checks locally |
| Fly.io | Deployment Target | Gate decisions control deployment to Fly.io instances |

## Best Practices

**Run Locally Before Pushing**: Execute `/guardrails check --quick` before pushing commits to catch compilation and test issues early. This reduces CI/CD pipeline failures and feedback loop time.

**Environment Parity**: Ensure staging guardrail configurations closely match production. Differences between staging and production guardrails can mask issues that only appear during production deployments.

**Performance Baseline**: Establish performance baselines using `/guardrails check --guardrail=performance` before and after significant changes. Performance regressions are easier to identify when baseline data is available.

**Never Override Without Documentation**: The `--override` flag exists for genuine emergencies (critical security patches, data loss prevention). Every override must include a `--reason` and should be followed by a proper remediation plan. Overrides are audited and reviewed.

**Incremental Strictness**: When adding new guardrails, start in `--check-only` mode to understand the impact before enabling active blocking. This allows the team to remediate existing violations before enforcement begins.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `Compilation warnings detected` | Code produces compiler warnings | Fix all warnings; use `--warnings-as-errors` locally to identify them |
| `Coverage below threshold` | Test coverage below minimum | Add tests for uncovered code paths |
| `Performance threshold exceeded` | Page load or render time too slow | Profile and optimize the affected routes |
| `Security vulnerability detected` | Known CVE in dependency | Update the affected dependency |
| `Secret detected in code` | API key or credential in source | Remove secret and rotate the exposed credential |
| `Override requires SUPREME authority` | Attempted override without permission | Escalate to SUPREME authority for emergency overrides |

## Advanced Usage

### Custom Guardrail Definitions

```elixir
# Define a custom guardrail in the platform
defmodule MyApp.CustomGuardrail do
  @behaviour PrismaticSafety.Guardrail

  def check(context) do
    # Custom check logic
    case validate_custom_requirement(context) do
      :ok -> {:pass, %{message: "Custom check passed"}}
      {:error, reason} -> {:fail, %{message: reason, severity: :L2}}
    end
  end
end
```

### Canary Deployment Guardrails

```bash
# Enable canary analysis during deployment
/guardrails gate --environment=production --canary --canary-percentage=5

# Monitor canary health during rollout
/guardrails canary --status

# Promote canary to full deployment
/guardrails canary --promote
```

### Guardrail Trend Analysis

```bash
# View guardrail pass/fail trends over time
/guardrails trend --days=30

# Identify most frequently failing guardrails
/guardrails trend --top-failures=5

# Export trend data for dashboard integration
/guardrails trend --format=json --output=guardrail-trends.json
```

## Doctrine Compliance

All guardrail operations enforce the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine.

- **NO MERCY**: Every guardrail must pass independently. There is no aggregate scoring that could allow a failure in one area to be compensated by excellence in another. Zero tolerance means zero tolerance -- one compilation warning blocks the entire deployment.
- **NO DOUBTS**: Guardrail results are deterministic and reproducible. The same code produces the same guardrail results regardless of when or where the check is executed. All results include specific violation details and remediation guidance so developers can act with confidence.

The command enforces the platform's Page Load Performance Standard (P0 - ABSOLUTE): all pages must load under 250ms, server-side render under 100ms, LiveView mount under 150ms, event handlers under 50ms, and health checks under 10ms. These are BLOCKING guardrails with no bypass.

## Related Commands

- [/cicd-unified](/commands/cicd-unified/) - Unified CI/CD workflow actions for pipeline management
- [/gitlab-ci](/commands/gitlab-ci/) - [GitLab CI](/glossary/gitlab-ci/)/CD pipeline management and configuration
- [/gitlab-enforce](/commands/gitlab-enforce/) - GitLab enforcement for compliance and workflow standards
- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation
- [/hygiene](/commands/hygiene/) - Ultra-fast dependency-free static analysis for code hygiene
- [/health](/commands/health/) - System health check with component-level status reporting
- [/agents](/commands/agents/) - List and manage agent ecosystem with status monitoring
- [/commit](/commands/commit/) - Smart commit with quality gates and conventional format

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)