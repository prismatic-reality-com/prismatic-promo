+++
title = "/nmnd"
weight = 2090
[extra]
category = "Framework"
description = "NO MERCY NO DOUBTS doctrine activation and enforcement"
syntax = "/nmnd [options]"
authority = "L2+"
agent = "nmnd-specialist"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1127
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["nmnd", "MERCY", "DOUBTS", "commands", "Framework", "Prismatic Platform", "AIAD", "Subcommand", "Doctrine"]
tags = ["commands", "framework", "nmnd", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/nmnd - Prismatic Platform"
+++

## Overview

**/nmnd** is a production command in the **Framework** category of the Prismatic Platform. It handles [NO MERCY](@/glossary/no-mercy.md) [NO DOUBTS](@/glossary/no-doubts.md) doctrine activation and enforcement, serving as the primary command interface for managing the platform's foundational governance framework that governs every aspect of development, deployment, and operational behavior.

The NO MERCY, NO DOUBTS doctrine is not merely a quality guideline -- it is the constitutional law of the Prismatic Platform. "No Mercy" mandates zero tolerance for incomplete implementations, quality violations, untested code, stubs, mocks, placeholders, and deferred fixes. "No Doubts" requires full investigation before action, evidence-based decision making, verified results, and traceable provenance for every claim. Together, they establish an absolute standard that transforms aspirational quality goals into enforceable operational requirements.

The `/nmnd` command provides the operational interface for this doctrine. It can activate enforcement modes, configure violation responses, inject enforcement blocks into AIAD components, and manage the doctrine's lifecycle across the platform's 99 umbrella applications and 403 agents. When invoked, it ensures that every subsequent operation within the session adheres to the doctrine's requirements without exception.

This command operates under the **L2+** authority level and is executed by the `nmnd-specialist` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The L2+ authority level provides sufficient access to modify enforcement configurations while requiring escalation for structural doctrine changes.

## Architecture

The `/nmnd` command interfaces with the doctrine enforcement layer that permeates every level of the Prismatic Platform architecture.

### Enforcement Architecture

```
/nmnd Command --> Doctrine Controller
                       |
         +-------------+-------------+
         |             |             |
    Enforcement     Violation     Compliance
    Engine          Tracker       Reporter
         |             |             |
    +----+----+   +----+----+   +----+----+
    |    |    |   |    |    |   |    |    |
   Pre  Post Git  L1  L2  L3  Dash  CI  Audit
   Cmd  Cmd  Hook Warn Block Rej  board Gate Trail
```

### Doctrine Enforcement Layers

| Layer | Scope | Enforcement Mechanism |
|-------|-------|----------------------|
| **Session** | Current Claude session | Real-time command validation |
| **Pre-commit** | Git commit operations | `.githooks/pre-commit` quality gates |
| **CI/CD** | Pipeline execution | GitLab CI mandatory stages |
| **Agent** | AIAD agent operations | Enforcement YAML in agent specs |
| **Runtime** | Application execution | Telemetry-driven violation detection |

### Core Components

| Component | Module | Responsibility |
|-----------|--------|----------------|
| **Doctrine Controller** | `PrismaticClaude.DoctrineController` | Central enforcement orchestration |
| **Enforcement Engine** | `PrismaticClaude.Enforcement` | Rule evaluation and violation detection |
| **Violation Tracker** | `PrismaticClaude.ViolationTracker` | Violation persistence and trend analysis |
| **Compliance Reporter** | `PrismaticClaude.ComplianceReporter` | Report generation and metric export |
| **AIAD Injector** | `PrismaticClaude.AIADInjector` | Enforcement block injection into components |

## Usage

### Doctrine Activation

```bash
# Activate full NM/ND enforcement for current session
/nmnd activate

# Activate with specific enforcement level
/nmnd activate --level strict

# Activate for specific domain only
/nmnd activate --domain code-quality

# Show current activation status
/nmnd status
```

### Enforcement Configuration

```bash
# Set violation response levels
/nmnd configure --l1-action warn --l2-action block --l3-action reject

# Enable automatic violation remediation
/nmnd configure --auto-remediate minor

# Configure enforcement for specific app
/nmnd configure --app prismatic_perimeter --level maximum

# Reset to default enforcement configuration
/nmnd configure --reset
```

### AIAD Integration

```bash
# Inject enforcement blocks into all AIAD agents
/nmnd inject --target agents --all

# Inject enforcement into specific agent
/nmnd inject --target agents --agent navy-seal-operator

# Validate enforcement blocks across all AIAD components
/nmnd validate --target all

# Generate enforcement report
/nmnd report --format markdown --file doctrine-report.md
```

### Operational Commands

```bash
# Temporarily elevate enforcement (requires justification)
/nmnd elevate --reason "production deployment" --duration 2h

# View violation history
/nmnd violations --since "2026-02-01"

# Clear resolved violations
/nmnd clear --resolved --before "2026-02-10"

# Export doctrine configuration
/nmnd export --format yaml --file nmnd-config.yaml
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `activate` | Subcommand | - | Activate NM/ND enforcement |
| `status` | Subcommand | - | Display current enforcement status |
| `configure` | Subcommand | - | Modify enforcement configuration |
| `inject` | Subcommand | - | Inject enforcement blocks into AIAD components |
| `validate` | Subcommand | - | Validate enforcement compliance |
| `report` | Subcommand | - | Generate compliance report |
| `violations` | Subcommand | - | View violation history |
| `--level` | Enum | `standard` | Enforcement level: `standard`, `strict`, `maximum` |
| `--domain` | String | All | Specific enforcement domain |
| `--app` | String | All | Target umbrella application |
| `--auto-remediate` | Enum | `none` | Auto-fix level: `none`, `minor`, `all` |
| `--format` | Enum | `text` | Output format: `text`, `json`, `yaml`, `markdown` |
| `--file` | Path | - | Write output to file |
| `--since` | Date | - | Filter by date for violation history |
| `--target` | Enum | - | AIAD target: `agents`, `commands`, `policies`, `all` |
| `--all` | Boolean | `false` | Apply to all components of target type |

## Execution Flow

**Phase 1 -- Context Assessment** (0-2s): The command evaluates the current enforcement state, including active session parameters, loaded configurations, and any pending violations from previous operations. This assessment establishes the baseline against which new enforcement actions are measured.

**Phase 2 -- Configuration Resolution** (2-5s): Based on the subcommand and parameters, the Doctrine Controller resolves the target configuration. This involves merging default settings, application-specific overrides, and command-line parameters into a unified enforcement configuration. Conflicts are resolved by the strictest-wins principle.

**Phase 3 -- Enforcement Application** (5-15s): The resolved configuration is applied across the relevant enforcement layers. For `activate`, this means installing enforcement hooks in the session's command pipeline. For `inject`, this involves modifying AIAD component files to include enforcement YAML blocks. For `configure`, this updates the persistent enforcement configuration.

**Phase 4 -- Validation** (15-25s): After application, the command validates that enforcement is correctly installed and operational. This includes verifying hook installation, checking AIAD component structure, and confirming that violation detection is active for all configured domains.

**Phase 5 -- Reporting** (25-30s): A summary report is generated showing the enforcement state, any changes made, current violation counts, and compliance metrics. For CI integration, this report can be output in machine-readable formats.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Execution | Managed by `nmnd-specialist` agent |
| [AIAD Registry](@/glossary/aiad.md) | Enforcement injection | YAML blocks injected into all AIAD components |
| [Quality Gates](@/glossary/quality-gates.md) | Gate enforcement | Doctrine compliance as mandatory gate |
| [Telemetry](@/glossary/telemetry.md) | Event monitoring | Doctrine events under `[:prismatic, :doctrine, *]` |
| [Pre-commit hooks](@/glossary/pre-commit-hooks.md) | Git integration | Doctrine checks in pre-commit pipeline |
| [GitLab CI](@/glossary/gitlab-ci.md) | Pipeline integration | Doctrine gate in CI/CD pipeline |
| Session Lifecycle | Session management | Doctrine activation on session start |
| [SEADF](@/glossary/seadf.md) | Framework alignment | Doctrine feeds into self-evolving framework |

## Best Practices

**Session Initialization**: Always run `/nmnd activate` at the start of development sessions. While the doctrine is theoretically always active, explicit activation ensures that session-level enforcement hooks are properly installed and that any configuration updates from previous sessions are loaded.

**Graduated Enforcement**: Use `--level standard` for exploratory development and `--level strict` for production-bound code. The `maximum` level is reserved for critical deployments and applies the most aggressive violation detection, including warnings for code patterns that are technically compliant but stylistically suboptimal.

**AIAD Consistency**: Run `/nmnd validate --target all` after creating new AIAD components. This catches missing enforcement blocks early, before they become compliance violations in CI pipelines.

**Violation Triage**: Review violations regularly with `/nmnd violations`. L1 warnings should be addressed within the current session. L2 blocks must be resolved before committing. L3 rejections require restarting the affected operation. L4 violations trigger supreme-level review.

**Configuration as Code**: Export enforcement configurations with `/nmnd export` and commit them to version control. This ensures that enforcement settings are reproducible across team members and CI environments.

## Error Handling

| Error Condition | Handling Strategy | User Impact |
|----------------|-------------------|-------------|
| Invalid enforcement level | Rejected with valid options displayed | Command does not modify state |
| AIAD component parse failure | Component skipped with warning | Partial injection, re-run recommended |
| Conflicting configurations | Strictest-wins resolution applied | Warning about conflict resolution |
| Missing enforcement dependencies | Dependencies auto-installed | Slightly longer activation time |
| Violation tracker corruption | Tracker rebuilt from audit trail | Historical violations may be incomplete |
| Session state inconsistency | State reset to clean baseline | Warning, manual verification suggested |

## Advanced Usage

### Doctrine Policy Customization

Organizations can extend the standard NM/ND doctrine with domain-specific policies:

```bash
# Load custom doctrine extension
/nmnd load-policy --file custom-security-policy.yaml

# List active policies
/nmnd list-policies

# Disable a specific policy check (requires justification)
/nmnd disable-check --check stub-detection --reason "prototyping phase" --expires "2026-02-20"
```

### Enforcement Metrics and Analytics

```bash
# Generate enforcement analytics
/nmnd analytics --period monthly --format chart

# Export metrics for external dashboards
/nmnd metrics --format prometheus --endpoint /metrics/nmnd

# Compliance heatmap by application
/nmnd heatmap --by app --output html --file compliance-heatmap.html
```

### Batch Operations

```bash
# Inject enforcement across all 403 agents
/nmnd inject --target agents --all --batch --parallel 10

# Validate all 216 commands
/nmnd validate --target commands --all --verbose
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. The `/nmnd` command is the doctrine's own enforcement interface and therefore operates under the strictest possible interpretation. No partial activations. No enforcement gaps. No configuration states that would weaken doctrine compliance.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every enforcement action is logged with full context, rationale, and expected impact. Configuration changes produce before/after diffs for review. Violation classifications are evidence-based with file references and rule identifiers.

As the doctrine's primary command interface, `/nmnd` is self-referentially bound to its own standards. Any failure in the command itself represents a doctrine violation of the highest severity.

## Related Commands

- [/nmnd-status](@/commands/nmnd-status.md) - NO MERCY NO DOUBTS doctrine compliance verification
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](@/commands/quality-enforce.md) - Mandatory progressive [quality debt](@/glossary/quality-debt.md) elimination with AIAD enforcement
- [/seadf](@/commands/seadf.md) - Self-Evolving Autonomous Development Framework control and monitoring
- [/rc1-orchestrate](@/commands/rc1-orchestrate.md) - Complete RC1 delivery pipeline execution with ROC optimization
- [/inject](@/commands/inject.md) - AIAD injection coordination for pattern and agent deployment

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)