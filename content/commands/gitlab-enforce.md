+++
title = "/gitlab-enforce"
weight = 1570
[extra]
category = "GitLab"
description = "GitLab enforcement for compliance and workflow standards"
syntax = "/gitlab-enforce [options]"
authority = "L3"
agent = "brutal-gitlab-enforcer"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1194
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["gitlab-enforce", "GitLab", "commands", "Prismatic Platform", "GitLab API", "DOUBTS"]
tags = ["commands", "gitlab", "gitlab-enforce", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/gitlab-enforce - Prismatic Platform"
+++

## Overview

**/gitlab-enforce** is a production command in the **GitLab** category of the Prismatic Platform that enforces compliance standards, workflow policies, and development practices across all GitLab-hosted repositories and projects. The command operates as the platform's primary mechanism for ensuring that merge request workflows, branch protection rules, issue management practices, and CI/CD configurations conform to the Prismatic Platform's stringent quality and process requirements.

This command operates under the **L3** authority level and is executed by the `brutal-gitlab-enforcer` agent, whose name reflects its zero-tolerance approach to compliance violations. The agent name is deliberate: enforcement within the Prismatic Platform is absolute, with no exceptions permitted for incomplete implementations, missing tests, bypassed hooks, or non-conforming configurations. Every violation is detected, reported, and blocked until remediation is complete.

The enforcement scope covers multiple dimensions of GitLab project governance. At the repository level, it verifies branch protection rules, merge request approval requirements, and push restrictions. At the workflow level, it validates that issues are properly labeled, milestones are assigned, and merge requests follow the platform's conventional format. At the CI/CD level, it ensures pipelines include all mandatory quality stages and that deployment guardrails are properly configured.

The command integrates with the platform's [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine as its primary enforcement mechanism. Where other commands focus on development productivity, `/gitlab-enforce` focuses exclusively on ensuring that productivity does not come at the cost of quality, traceability, or process integrity. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard.

## Architecture

The enforcement architecture operates on a policy-driven model where compliance rules are defined declaratively and evaluated against the current state of GitLab resources.

```
/gitlab-enforce Command
    |
    +-- Policy Engine
    |       +-- Branch Protection Policies
    |       +-- Merge Request Policies
    |       +-- Issue Management Policies
    |       +-- CI/CD Configuration Policies
    |       +-- Label & Milestone Policies
    |
    +-- GitLab State Collector
    |       +-- Project Configuration Reader
    |       +-- Branch Rule Analyzer
    |       +-- MR Compliance Scanner
    |       +-- Pipeline Config Validator
    |
    +-- Violation Detector
    |       +-- Rule Evaluator
    |       +-- Severity Classifier (L1-L4)
    |       +-- Violation Aggregator
    |       +-- Trend Analyzer
    |
    +-- Remediation Engine
    |       +-- Auto-Fix Applicator
    |       +-- Manual Fix Generator
    |       +-- Compliance Report Builder
    |       +-- Block/Warn Decision Maker
    |
    +-- Notification System
            +-- Telemetry Reporter
            +-- Session Context Logger
            +-- Issue Comment Writer
```

The Policy Engine loads enforcement rules from the platform's `.aiad/policies/` directory, where each policy is defined as a structured YAML document specifying conditions, severity levels, and remediation actions. The GitLab State Collector queries the GitLab API to gather the current configuration state, which is then evaluated by the Violation Detector against loaded policies. Violations are classified by severity (L1 warning through L4 supreme review) and either auto-remediated or reported for manual action.

## Usage

### Compliance Scanning

```bash
# Run full compliance scan on the current project
/gitlab-enforce scan

# Scan specific compliance domain
/gitlab-enforce scan --domain=branch-protection

# Scan merge request compliance for open MRs
/gitlab-enforce scan --domain=merge-requests --status=open

# Quick compliance check (critical violations only)
/gitlab-enforce scan --quick
```

### Policy Enforcement

```bash
# Enforce branch protection rules
/gitlab-enforce protect --branches=main,staging --min-approvals=1

# Enforce merge request templates
/gitlab-enforce mr-template --require-description --require-labels

# Enforce CI/CD pipeline requirements
/gitlab-enforce pipeline --require-stages=compile,test,quality

# Apply all enforcement policies
/gitlab-enforce apply --all
```

### Compliance Reporting

```bash
# Generate compliance report
/gitlab-enforce report --format=markdown

# Export compliance metrics to JSON
/gitlab-enforce report --format=json --output=compliance-report.json

# Show compliance trend over time
/gitlab-enforce trend --days=30
```

### Auto-Remediation

```bash
# Auto-fix all remediable violations
/gitlab-enforce fix --auto

# Preview fixes without applying
/gitlab-enforce fix --dry-run

# Fix specific violation category
/gitlab-enforce fix --category=labels
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--domain` | string | all | Compliance domain to scan (branch-protection, merge-requests, issues, pipeline, labels) |
| `--status` | string | all | Filter resources by status (open, closed, merged) |
| `--quick` | flag | false | Scan critical violations only (L3-L4) |
| `--branches` | string | main | Comma-separated branch list for protection rules |
| `--min-approvals` | integer | 1 | Minimum required approvals for merge requests |
| `--require-stages` | string | compile,test | Mandatory CI/CD pipeline stages |
| `--format` | string | text | Output format (text, markdown, json) |
| `--output` | string | stdout | File path for report output |
| `--auto` | flag | false | Apply auto-remediation for fixable violations |
| `--dry-run` | flag | false | Preview changes without applying |
| `--severity` | string | all | Minimum severity to report (L1, L2, L3, L4) |
| `--days` | integer | 7 | Time window for trend analysis |

## Execution Flow

1. **Policy Loading**: Load all enforcement policies from `.aiad/policies/` directory. Parse policy definitions and build evaluation rules. Validate policy compatibility and detect conflicts.

2. **State Collection**: Query the GitLab API for current project configuration including branch protection rules, open merge requests, issue states, CI/CD configurations, labels, and milestones. Cache results in ETS for efficient re-evaluation.

3. **Compliance Evaluation**: Evaluate each collected resource against applicable policies. Classify violations by severity level. Aggregate results into a compliance score.

4. **Severity Classification**: Assign severity to each violation according to the platform's violation protocol. L1 violations receive warnings, L2 violations block operations, L3 violations trigger rejection, and L4 violations escalate to supreme review.

5. **Remediation Decision**: For each violation, determine whether auto-remediation is possible and permitted. Generate fix instructions for manual violations. Apply auto-fixes when the `--auto` flag is set.

6. **Reporting**: Generate compliance report in the requested format. Emit [telemetry](/glossary/telemetry/) events for tracking compliance trends over time. Update session context with enforcement results.

7. **Enforcement Action**: For blocking violations (L2+), set the appropriate enforcement flags that prevent merge requests from being approved, pipelines from deploying, or commits from being pushed until violations are resolved.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Agent Execution | Executed by `brutal-gitlab-enforcer` agent with L3 authority |
| [Quality Gates](/glossary/quality-gates/) | Bidirectional | Enforces quality gate compliance in CI/CD configurations |
| [Telemetry](/glossary/telemetry/) | Event Emission | Reports compliance metrics and violation trends |
| GitLab API | External Service | Reads and modifies project settings, branch rules, and MR configurations |
| [/gitlab-ci](/commands/gitlab-ci/) | Pipeline Validation | Validates CI/CD configurations against mandatory stage requirements |
| [/gitlab-mr](/commands/gitlab-mr/) | MR Compliance | Enforces merge request standards on created MRs |
| [/guardrails](/commands/guardrails/) | Safety Enforcement | Coordinates deployment guardrails with compliance requirements |
| Session Lifecycle | Automation Hook | Triggered as part of mandatory session discipline protocol |

## Best Practices

**Regular Scanning**: Run `/gitlab-enforce scan` at the start of every development session to ensure the project remains in compliance. Integrate scanning into session lifecycle hooks for automatic enforcement.

**Policy Versioning**: All enforcement policies in `.aiad/policies/` should be version-controlled alongside the codebase. Policy changes should go through the same review process as code changes to prevent accidental relaxation of standards.

**Gradual Remediation**: When onboarding a new project or introducing stricter policies, use the `--severity=L3` flag to focus on critical violations first. Gradually lower the severity threshold as compliance improves.

**Trend Monitoring**: Use `/gitlab-enforce trend --days=30` regularly to track compliance improvements over time. Declining trends indicate process drift that should be addressed immediately.

**Auto-Remediation Safety**: Always preview auto-fixes with `--dry-run` before applying them with `--auto`. While auto-remediation is designed to be safe, reviewing changes before application follows the NO DOUBTS principle of evidence-based action.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `GITLAB_TOKEN not set` | Missing authentication | Set `GITLAB_TOKEN` environment variable |
| `Insufficient permissions (403)` | Token lacks admin scope | Use a token with `api` and `admin` scopes for enforcement |
| `Policy parse error` | Malformed policy YAML | Validate policy files against the AIAD policy schema |
| `Auto-remediation blocked` | Violation requires manual intervention | Follow the manual fix instructions in the compliance report |
| `Rate limit exceeded` | Too many GitLab API requests | Wait for rate limit reset or use `--quick` for reduced API calls |
| `Conflicting policies` | Two policies contradict each other | Review and resolve policy conflicts in `.aiad/policies/` |

## Advanced Usage

### Custom Policy Definition

```yaml
# .aiad/policies/custom-branch-protection.policy.md
enforcement:
  doctrine: "no-mercy-no-doubts"
  version: "2.0.0"
  compliance: mandatory

rules:
  - name: "main-branch-protection"
    resource: "branch"
    target: "main"
    conditions:
      push_access_level: "no_one"
      merge_access_level: "maintainer"
      approvals_required: 1
    severity: "L3"
    auto_fix: true
```

### Multi-Project Enforcement

```bash
# Enforce across multiple projects
/gitlab-enforce scan --project=prismatic-platform,prismatic-promo

# Generate cross-project compliance dashboard
/gitlab-enforce report --multi-project --format=markdown
```

### Integration with Pre-Commit Hooks

The enforcement system integrates with the platform's pre-commit hooks to block commits that would introduce compliance violations. The `.githooks/pre-commit` script includes an enforcement phase that runs quick compliance checks against pending changes.

## Doctrine Compliance

All enforcement operations embody the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine at its most literal level.

- **NO MERCY**: The `brutal-gitlab-enforcer` agent applies zero tolerance to compliance violations. There are no warnings for critical violations -- only blocks and rejections. The enforcement is absolute, with no bypass mechanisms and no exception processes.
- **NO DOUBTS**: Every enforcement decision is evidence-based, backed by specific policy definitions, current project state, and traceable audit trails. The command never enforces based on assumptions -- it queries actual GitLab state and evaluates against defined rules.

Enforcement levels follow the platform's violation protocol: L1 (minor deviation, warning + correction), L2 (quality violation, block + correction), L3 (incomplete delivery, rejection + restart), L4 (doubt-compromised, rejection + supreme review).

## Related Commands

- [/gitlab-api](/commands/gitlab-api/) - GitLab API operations for project and repository management
- [/gitlab-auto-sync](/commands/gitlab-auto-sync/) - Automatic GitLab integration for all AIAD workflows
- [/gitlab-ci](/commands/gitlab-ci/) - [GitLab CI](/glossary/gitlab-ci/)/CD pipeline management and configuration
- [/gitlab-mr](/commands/gitlab-mr/) - GitLab merge request creation and management
- [/gitlab-sync](/commands/gitlab-sync/) - GitLab issue synchronization and tracking operations
- [/gitlab-supreme-sync](/commands/gitlab-supreme-sync/) - Comprehensive GitLab synchronization with commit forensics
- [/guardrails](/commands/guardrails/) - CI/CD guardrails enforcement for deployment safety
- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation
- [/agents](/commands/agents/) - List and manage agent ecosystem with status monitoring
- [/commit](/commands/commit/) - Smart commit with quality gates and conventional format

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)