+++
title = "/emergency"
weight = 1080
[extra]
category = "Crisis"
description = "Emergency response and crisis management activation"
syntax = "/emergency [options]"
authority = "SUPREME"
agent = "emergency-responder"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1187
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["emergency", "commands", "Crisis", "Prismatic Platform", "SUPREME"]
tags = ["commands", "crisis", "emergency", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/emergency - Prismatic Platform"
+++

## Overview

**/emergency** is a production command in the **Crisis** category of the Prismatic Platform that activates the platform's emergency response and crisis management protocols. When invoked, this command elevates the operator's authority to SUPREME level, bypasses normal workflow gates, and activates all available crisis response agents to address an active emergency. This is the platform's highest-priority operational mode, designed for situations where normal operational procedures are insufficient and immediate, decisive action is required.

This command operates under the **SUPREME** authority level and is executed by the `emergency-responder` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The SUPREME authority level grants unrestricted access to all platform resources and overrides all standard quality gates, rate limits, and approval workflows.

Emergency situations in the Prismatic Platform context include production outages, security breaches, data integrity failures, cascading system failures, and critical performance degradation. The `/emergency` command provides a structured framework for responding to these events that is faster and more reliable than ad-hoc crisis management, while maintaining full audit trails for post-incident review.

## Architecture

The emergency response system is architected as a priority-escalation pipeline that can activate in under 500 milliseconds and coordinate multiple response agents simultaneously.

### Response Architecture

```
/emergency -> Authority Escalation -> Situation Assessment -> Response Coordination
                   |                        |                        |
                   v                        v                        v
            SUPREME Grant           Multi-agent Scan          Parallel Actions
            Audit Trail             Severity Classification   Resource Allocation
            Notification            Root Cause Hypothesis     Recovery Execution
```

### Emergency Classification

| Severity | Trigger | Response Time | Authority |
|----------|---------|---------------|-----------|
| **SEV-1** | Production down, data loss active | < 1 minute | SUPREME + all agents |
| **SEV-2** | Production degraded, security breach | < 5 minutes | SUPREME + specialist agents |
| **SEV-3** | Non-production critical failure | < 15 minutes | L3+ elevated authority |
| **SEV-4** | Quality regression, performance degradation | < 1 hour | L2+ standard authority |

### Agent Mobilization

When an emergency is declared, the emergency-responder agent coordinates with other crisis-capable agents based on the emergency type.

| Agent | Emergency Role | Specialty |
|-------|---------------|-----------|
| `emergency-responder` | Incident Commander | Overall coordination |
| `archer-supreme` | Supreme Authority | Platform-wide decisions |
| `blue-commander` | Defensive Posture | Security incident defense |
| `red-commander` | Attack Analysis | Adversarial scenario assessment |
| `purple-coordinator` | Synthesis | Red-Blue loop closure |
| `cicd-tooling-specialist` | Deployment | Rollback and hotfix deployment |
| `quality-floor-guardian` | Quality | Regression prevention during fix |

## Usage

```bash
# Declare a production emergency
/emergency --severity=1 --type=outage --description="Production API unresponsive"

# Declare a security emergency
/emergency --severity=2 --type=security --description="Suspected unauthorized access"

# Declare with automatic severity detection
/emergency --auto-detect

# Emergency with immediate rollback
/emergency --severity=1 --action=rollback --target=production

# Check emergency status
/emergency --status

# End emergency and begin post-mortem
/emergency --resolve --post-mortem

# Escalate existing emergency
/emergency --escalate --severity=1

# Emergency drill (non-destructive simulation)
/emergency --drill --scenario=database-failure
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--severity` | integer | auto-detect | Emergency severity: 1 (critical) to 4 (minor) |
| `--type` | string | general | Emergency type: outage, security, data, performance, general |
| `--description` | string | required | Description of the emergency situation |
| `--auto-detect` | flag | false | Automatically detect severity from system state |
| `--action` | string | assess | Immediate action: assess, rollback, isolate, scale, restart |
| `--target` | string | production | Target environment: production, staging, all |
| `--status` | flag | false | Show current emergency status |
| `--resolve` | flag | false | Resolve the active emergency |
| `--post-mortem` | flag | false | Generate post-mortem template |
| `--escalate` | flag | false | Escalate current emergency severity |
| `--drill` | flag | false | Run emergency drill (simulation only) |
| `--scenario` | string | none | Drill scenario identifier |
| `--notify` | string | all | Notification targets: all, ops, security, management |

## Execution Flow

The emergency response follows a structured incident management lifecycle based on industry-standard practices adapted for the Prismatic Platform.

1. **Declaration**: The operator declares an emergency with severity, type, and description. A unique incident ID is generated and the emergency timeline begins.

2. **Authority Escalation**: The operator's authority is immediately elevated to SUPREME level. All standard quality gates, rate limits, and approval workflows are suspended for the duration of the emergency.

3. **Situation Assessment**: The emergency-responder agent performs an immediate automated assessment by querying system health endpoints, checking error logs, verifying service availability, and scanning telemetry for anomalies.

4. **Severity Validation**: If `--auto-detect` is used, the automated assessment determines severity. Otherwise, the declared severity is validated against the assessed situation and adjusted if necessary with operator notification.

5. **Agent Mobilization**: Crisis-capable agents are mobilized based on the emergency type and severity. SEV-1 mobilizes all available agents; lower severities activate relevant specialists only.

6. **Response Coordination**: The incident commander (emergency-responder agent) coordinates parallel response actions. Multiple agents work simultaneously on different aspects of the response.

7. **Action Execution**: Immediate actions (rollback, isolation, scaling) are executed with full audit logging. Every action taken during the emergency is recorded with timestamp, agent, rationale, and result.

8. **Stabilization Verification**: After response actions are taken, the system is verified for stability. Health checks, test suite execution, and quality gate verification confirm that the emergency is resolved.

9. **Resolution and Post-Mortem**: The emergency is formally resolved, normal authority levels are restored, and a post-mortem template is generated containing the full timeline, actions taken, and root cause analysis framework.

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Multi-agent coordination | All crisis-capable agents mobilized |
| [/archer-supreme](/commands/archer-supreme/) | Supreme authority | Activated for SEV-1 and SEV-2 |
| [Color Team](/glossary/color-teams/) | Security response | Blue/Red/Purple teams for security emergencies |
| [Quality Gates](/glossary/quality-gates/) | Suspended during emergency | Restored upon resolution |
| [Telemetry](/glossary/telemetry/) | Enhanced monitoring | Telemetry collection rate increased during emergency |
| [/cicd-unified](/commands/cicd-unified/) | Deployment actions | Rollback and hotfix deployment |
| [Session Lifecycle](/glossary/session-discipline/) | Audit trail | Full emergency timeline persisted |
| [AIAD Registry](/glossary/aiad/) | Agent discovery | Crisis-capable agent identification |

## Best Practices

**Declare early, resolve cleanly.** It is better to declare an emergency that turns out to be minor than to delay declaration while a situation escalates. The resolution process is lightweight and the audit trail documents the response regardless of final severity.

**Provide clear descriptions.** The description field is critical for coordinating response across multiple agents and for post-mortem analysis. Include observable symptoms, affected systems, and timeline of events.

**Use auto-detect for ambiguous situations.** When the severity is unclear, let the automated assessment inform the classification. The system checks multiple health indicators simultaneously and can detect cascading failures that might not be obvious from a single symptom.

**Always generate post-mortems.** Even for quickly resolved emergencies, the post-mortem process captures valuable lessons. The `--post-mortem` flag generates a structured template that ensures all relevant aspects of the incident are documented.

**Practice with drills.** Regular emergency drills using `--drill` keep the response procedures fresh and identify gaps in the emergency response process before a real incident occurs.

**Avoid over-escalation.** SUPREME authority bypasses all quality gates. While necessary during genuine emergencies, unnecessary escalation introduces risk. Use the lowest severity level that addresses the actual situation.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `emergency_already_active` | An emergency is already declared | Use `--escalate` or `--resolve` the existing emergency first |
| `no_active_emergency` | Attempting to resolve when none is active | No action needed |
| `rollback_target_unavailable` | Rollback target has no previous release | Manual intervention required |
| `agent_mobilization_failed` | One or more agents failed to respond | Remaining agents continue; failed agents logged |
| `assessment_timeout` | Automated assessment exceeded timeout | Proceed with declared severity |
| `authority_escalation_failed` | Authority system unreachable | Emergency operates with current authority level |
| `drill_in_progress` | Cannot declare real emergency during drill | End drill first with `--drill --end` |

## Advanced Usage

### Custom Emergency Playbooks

Define organization-specific emergency response playbooks that automate response sequences.

```yaml
# .aiad/playbooks/database-failure.yaml
name: database-failure
severity: 1
type: outage
steps:
  - action: isolate
    target: database
    agent: emergency-responder
  - action: failover
    target: database-replica
    agent: cicd-tooling-specialist
  - action: verify
    check: database-health
    agent: quality-floor-guardian
```

```bash
# Execute playbook
/emergency --playbook=database-failure
```

### Automated Escalation Rules

Configure automatic escalation when specific conditions are detected.

```bash
# Configure escalation: SEV-3 to SEV-2 if not resolved in 30 minutes
/emergency --configure-escalation --from=3 --to=2 --after=30m

# Configure automatic declaration from monitoring alerts
/emergency --configure-trigger --source=telemetry --condition="error_rate > 10%"
```

### Post-Mortem Templates

The post-mortem generator creates a structured document with pre-populated timeline data.

```bash
# Generate detailed post-mortem
/emergency --resolve --post-mortem --format=markdown --output=postmortem-2026-02-15.md
```

The generated template includes: Incident Timeline, Impact Assessment, Root Cause Analysis, Contributing Factors, Corrective Actions, Lessons Learned, and Follow-up Items.

### Emergency Communication

Automated notification to configured channels during emergency lifecycle.

```bash
# Configure notification channels
/emergency --configure-notify --channel=slack --webhook=https://hooks.slack.com/...
/emergency --configure-notify --channel=email --recipients=ops@example.com
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Emergency response is total and immediate. All resources are mobilized without reservation.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Automated assessment provides evidence-based severity classification. Every action during the emergency is logged with rationale and outcome.

## Related Commands

- [/archer-supreme](/commands/archer-supreme/) - Supreme authority activation for platform-wide operations
- [/dark-ops](/commands/dark-ops/) - NABLA structural crisis detection and dark operations analysis
- [/manipulation-detect](/commands/manipulation-detect/) - Detect manipulation attempts using epistemic analysis
- [/manipulation-protect](/commands/manipulation-protect/) - Activate manipulation protection defenses
- [/cicd-unified](/commands/cicd-unified/) - Unified CI/CD workflow actions for pipeline management
- [/agents](/commands/agents/) - List and manage agent ecosystem with status monitoring

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)