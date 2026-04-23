+++
title = "/ma-enforce"
weight = 790
[extra]
category = "M&A Operations"
description = "M&A enforcement actions for deal compliance and deadline tracking"
syntax = "/ma-enforce [options]"
authority = "L3"
agent = "ma-enforcement-commander"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1268
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ma-enforce", "enforcement", "actions", "compliance", "deadline", "tracking", "commands", "M&A Operations", "Prismatic Platform", "BLOCK"]
tags = ["commands", "m&a-operations", "ma-enforce", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/ma-enforce - Prismatic Platform"
+++

## Overview

**/ma-enforce** is a production command in the **M&A Operations** category of the Prismatic Platform that manages compliance enforcement, deadline tracking, and escalation actions across the M&A deal pipeline. While [/ma-analyze](@/commands/ma-analyze.md) performs the analytical work and [/ma-dashboard](@/commands/ma-dashboard.md) provides visibility, the `/ma-enforce` command ensures that deals progress according to their defined timelines, that compliance requirements are met at each lifecycle stage, and that violations trigger appropriate escalation actions.

This command operates under the **L3** authority level and is executed by the `ma-enforcement-commander` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The L3 authority level grants the enforcement commander sufficient authority to issue warnings, block state transitions, and escalate to L4 deal commanders when compliance violations are detected.

M&A enforcement in the Prismatic Platform operates on the principle that unmonitored processes degrade. Every deal has a defined lifecycle with expected timelines, required deliverables at each stage, and mandatory quality checks before stage transitions. The `/ma-enforce` command continuously monitors these requirements and takes automated action when deviations are detected. This automated enforcement prevents the common M&A failure mode where deals stall in due diligence, deadlines slip unnoticed, and critical compliance requirements are overlooked.

The enforcement engine integrates with the platform's [Quality Gates](@/glossary/quality-gates.md) system to validate that each deal stage transition meets defined quality criteria. A deal cannot move from SCREENING to ACTIVE without completed financial screening. A deal cannot enter NEGOTIATION without legal due diligence sign-off. These gates are configurable per deal type and can be customized through enforcement rule sets.

## Architecture

The enforcement system operates as a continuous monitoring engine with rule-based escalation.

### Enforcement Architecture

```
/ma-enforce -> Rule Engine -> Monitor Loop -> Action Dispatcher
                   |              |                  |
                   v              v                  v
             Rule Registry    Deal Scanner      Warnings
             Rule Compiler    Deadline Check     Blocks
             Rule Validator   Compliance Check   Escalations
                              Quality Gate       Notifications
                              Intel Completeness State Transitions
```

### Enforcement Rule Categories

| Category | Rules | Enforcement Level | Description |
|----------|-------|-------------------|-------------|
| **Timeline** | 12 | WARNING -> BLOCK | Deadline proximity and overdue detection |
| **Deliverable** | 18 | BLOCK | Required documents and analysis at each stage |
| **Quality** | 8 | BLOCK | Minimum quality scores for stage transitions |
| **Compliance** | 15 | BLOCK -> ESCALATE | Regulatory and policy compliance requirements |
| **Intelligence** | 6 | WARNING | OSINT collection completeness requirements |
| **Financial** | 10 | BLOCK -> ESCALATE | Financial analysis completeness and thresholds |

### Escalation Levels

| Level | Trigger | Action | Authority |
|-------|---------|--------|-----------|
| **INFO** | Approaching deadline (>7 days) | Log + dashboard indicator | Automatic |
| **WARNING** | Approaching deadline (3-7 days) | Notification to deal team | Automatic |
| **ALERT** | Deadline imminent (<3 days) | Notification to deal lead + team | Automatic |
| **BLOCK** | Deadline passed or quality gate failed | State transition blocked | Automatic |
| **ESCALATE** | Block unresolved for >48 hours | Escalation to L4 commander | Automatic |
| **CRITICAL** | Compliance violation detected | Immediate freeze + L4 notification | Automatic |

## Usage

```bash
# Check enforcement status across all deals
/ma-enforce status

# Check specific deal compliance
/ma-enforce check DEAL-2026-001

# View active warnings and blocks
/ma-enforce warnings
/ma-enforce blocks

# View enforcement rules
/ma-enforce rules
/ma-enforce rules --category=timeline

# Manually trigger enforcement scan
/ma-enforce scan --scope=all

# Override a block (requires L3+ authority)
/ma-enforce override DEAL-2026-001 --rule=timeline-screening --reason="Extension approved"

# Set custom deadline for a deal
/ma-enforce deadline DEAL-2026-001 --stage=screening --date="2026-04-15"

# Configure enforcement rules for a deal
/ma-enforce configure DEAL-2026-001 --rules=strict
/ma-enforce configure DEAL-2026-001 --rules=relaxed

# View escalation history
/ma-enforce history DEAL-2026-001

# Create custom enforcement rule
/ma-enforce create-rule --name="custom-financial-check" \
  --condition="financial_confidence < 0.7" --action=block \
  --stage=negotiation --message="Financial confidence too low"

# Disable specific rule for a deal
/ma-enforce disable-rule DEAL-2026-001 --rule=intel-completeness \
  --reason="Target has minimal digital presence"

# Export compliance report
/ma-enforce report --format=pdf --output=compliance-report.pdf
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `action` | string | status | Action: status, check, warnings, blocks, rules, scan, override, deadline, configure, history, create-rule, disable-rule, report |
| `deal_id` | string | none | Target deal identifier |
| `--scope` | string | active | Scan scope: active, all, specific deal |
| `--category` | string | all | Rule category filter |
| `--rule` | string | none | Specific rule identifier |
| `--reason` | string | required for overrides | Justification for override or disable |
| `--stage` | string | none | Deal lifecycle stage |
| `--date` | string | none | Deadline date for custom deadlines |
| `--rules` | string | standard | Rule set: strict, standard, relaxed, custom |
| `--condition` | string | none | Rule condition expression |
| `--action-type` | string | block | Rule action: info, warning, alert, block, escalate |
| `--message` | string | none | Custom message for rule actions |
| `--format` | string | text | Output format: text, json, markdown, pdf |
| `--output` | string | stdout | Output file path |
| `--notify` | string | auto | Notification targets: team, lead, all |

## Execution Flow

1. **Rule Loading**: The enforcement engine loads the active rule set for the specified scope. Rules are loaded from the rule registry and compiled into executable check functions. Custom rules and rule overrides are applied.

2. **Deal Scanning**: Each deal in scope is scanned against all applicable rules. The scanner checks deal state, timeline adherence, deliverable completeness, quality gate status, compliance posture, and intelligence collection status.

3. **Violation Detection**: When a rule condition is met (deadline approaching, quality gate failing, deliverable missing), a violation record is created with the violation type, severity, affected deal, triggering rule, and recommended remediation.

4. **Action Dispatch**: Each violation triggers the appropriate action based on the rule's configured escalation level. INFO violations are logged. WARNING violations generate notifications. BLOCK violations prevent state transitions. ESCALATE violations notify L4 authority.

5. **State Gate Enforcement**: When a deal team attempts a state transition (e.g., SCREENING to ACTIVE), the enforcement engine evaluates all blocking rules for the target state. If any blocking rules are triggered, the transition is rejected with a detailed explanation of what must be resolved.

6. **Override Processing**: When an override is requested, the enforcement engine validates that the requesting operator has sufficient authority (L3+), records the override reason, applies the override to the specific rule-deal combination, and logs the action for audit.

7. **Continuous Monitoring**: The enforcement engine runs continuously on a configurable interval (default: every 15 minutes). Each scan evaluates all active deals against all applicable rules, detecting new violations and resolving previous violations that have been addressed.

8. **Compliance Reporting**: Compliance status is aggregated and made available to [/ma-dashboard](@/commands/ma-dashboard.md) for real-time display. Periodic compliance reports can be generated for stakeholder review.

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Executed by `ma-enforcement-commander` | Rule evaluation and action dispatch |
| [/ma-create](@/commands/ma-create.md) | Deal lifecycle | Enforcement begins at deal creation |
| [/ma-analyze](@/commands/ma-analyze.md) | Quality triggers | Analysis completeness feeds enforcement |
| [/ma-dashboard](@/commands/ma-dashboard.md) | Status display | Enforcement indicators shown in dashboard |
| [/ma-status](@/commands/ma-status.md) | Status tracking | Enforcement status included in deal status |
| [/ma-report](@/commands/ma-report.md) | Compliance reports | Enforcement data feeds compliance reporting |
| [Quality Gates](@/glossary/quality-gates.md) | Gate enforcement | Quality criteria for stage transitions |
| [Telemetry](@/glossary/telemetry.md) | Audit trail | All enforcement actions logged |
| [NABLA Framework](@/glossary/nabla-infinity.md) | Confidence checks | Confidence threshold enforcement |

## Best Practices

**Use standard rule sets for most deals.** The standard rule set provides balanced enforcement that catches genuine issues without generating excessive false alarms. Reserve the strict rule set for high-value or high-risk deals where additional oversight is justified.

**Document override reasons thoroughly.** Every override creates an audit trail. Clear, specific reasons ("Board approved 30-day extension per meeting 2026-02-10") are essential for compliance auditing and stakeholder confidence.

**Review blocks promptly.** Blocked state transitions indicate genuine issues that need resolution. Leaving blocks unresolved for extended periods triggers automatic escalation and signals process dysfunction.

**Monitor enforcement scan frequency.** The default 15-minute scan interval is appropriate for most pipelines. For time-critical deals approaching closing, consider increasing scan frequency to detect issues faster.

**Create custom rules for deal-specific requirements.** Regulatory requirements vary by jurisdiction, industry, and deal type. Custom enforcement rules ensure that deal-specific compliance requirements are tracked alongside standard requirements.

**Export compliance reports before stakeholder meetings.** Pre-generated compliance reports provide evidence-based status updates that reduce meeting time and improve stakeholder confidence in the process.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `deal_not_found` | Deal ID does not exist | Verify deal ID with `/ma-status` |
| `authority_insufficient` | Operator lacks authority for requested action | Request authority elevation for overrides |
| `rule_not_found` | Specified rule does not exist | List rules with `/ma-enforce rules` |
| `override_requires_reason` | Override requested without justification | Provide `--reason` parameter |
| `rule_compilation_failed` | Custom rule condition has syntax errors | Review condition expression syntax |
| `scan_timeout` | Enforcement scan exceeded time limit | Reduce scan scope or investigate system health |
| `conflicting_rules` | Two rules produce contradictory requirements | Review and reconcile conflicting rules |

## Advanced Usage

### Automated Compliance Workflows

Create enforcement-triggered automated workflows.

```bash
# Auto-trigger analysis when intel is complete
/ma-enforce create-rule --name="auto-analyze-on-intel" \
  --condition="intel_complete AND NOT analysis_started" \
  --action=trigger --trigger-command="/ma-analyze ${deal_id} --scope=full"

# Auto-generate report at stage transition
/ma-enforce create-rule --name="auto-report-on-active" \
  --condition="state_transition:screening->active" \
  --action=trigger --trigger-command="/ma-report ${deal_id} --type=screening-summary"
```

### Multi-Jurisdiction Compliance

Configure jurisdiction-specific enforcement rules.

```bash
# EU regulatory requirements
/ma-enforce configure DEAL-2026-001 --rules=eu-regulatory \
  --jurisdictions="DE,FR,CZ" --regulations="antitrust,data-protection"

# SEC filing requirements
/ma-enforce configure DEAL-2026-002 --rules=sec-compliance \
  --filing-thresholds --hsr-review
```

### Enforcement Analytics

Analyze enforcement patterns across the deal portfolio.

```bash
# Most common violation types
/ma-enforce analytics --metric=violations --period=quarter

# Average time to resolve blocks
/ma-enforce analytics --metric=resolution-time --group-by=category

# Override frequency analysis
/ma-enforce analytics --metric=overrides --group-by=team
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Enforcement rules execute without exception. Blocks cannot be silently bypassed. Every override is logged with full audit trail. Compliance is not optional.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Enforcement decisions are based on quantifiable criteria, not subjective judgment. Rule conditions are explicit, measurable, and verifiable.

## Related Commands

- [/ma-create](@/commands/ma-create.md) - Create new M&A deal with target profiling and initial assessment
- [/ma-analyze](@/commands/ma-analyze.md) - Comprehensive M&A analysis including financial, legal and operational review
- [/ma-report](@/commands/ma-report.md) - Generate detailed M&A analysis report with visualizations
- [/ma-dashboard](@/commands/ma-dashboard.md) - M&A deal pipeline dashboard with real-time status tracking
- [/ma-status](@/commands/ma-status.md) - M&A deal pipeline status overview and progress tracking
- [/investigate](@/commands/investigate.md) - Launch comprehensive [OSINT](@/glossary/osint.md) investigation across 121+ sources
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)