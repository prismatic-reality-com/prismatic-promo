+++
title = "/color-team"
weight = 1150
[extra]
category = "Color Teams"
description = "Color team status overview across all 6 teams"
syntax = "/color-team [options]"
authority = "L3+"
agent = "supreme-coordinator"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 896
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["color-team", "Color", "commands", "Color Teams", "Prismatic Platform", "Black", "Blue", "Gray"]
tags = ["commands", "color-teams", "color-team", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/color-team - Prismatic Platform"
+++

## Overview

**/color-team** is a production command in the **[Color Teams](/glossary/color-teams/)** category of the Prismatic Platform that provides a comprehensive status overview across all six color-coded security teams: Gray (boundary exploration), Red (adversarial simulation), Blue (epistemic defense), Purple (synthesis and closure), White (constructive verification), and Black (theoretical threat modeling). The command serves as the central dashboard for the platform's adversarial-defensive security posture.

The color-team framework implements epistemic security through adversarial-defensive synthesis. Rather than relying solely on defensive measures, the platform maintains dedicated teams that probe for weaknesses (Red), explore boundary conditions (Gray), model theoretical threats (Black), and then synthesize these findings into improved defenses (Blue, Purple) with formal verification (White). This six-team structure ensures that security evolves through genuine adversarial pressure rather than assumed robustness.

This command operates under the **L3+** authority level and is executed by the `supreme-coordinator` agent, which has oversight across all color teams. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The L3+ authority requirement reflects the sensitive nature of security operations -- only strategic-level agents can view cross-team status, as individual team operations may contain classified findings.

The command aggregates real-time status from 20 specialized agents distributed across the six teams, providing a unified view of security posture including active campaigns, pending findings, closure status, and safety protocol compliance. All operations are sandboxed, use synthetic data only, and enforce strict isolation between teams to prevent information leakage.

## Architecture

The color-team status system aggregates data from six independent team controllers into a unified security posture dashboard.

```
Supreme Coordinator
    |
    +-- Gray Team Controller (3 agents)
    |       |-- gray-explorer-commander
    |       |-- gray-edge-finder
    |       |-- gray-escalation-guard
    |
    +-- Red Team Controller (4 agents)
    |       |-- red-commander
    |       |-- red-epistemic-attacker
    |       |-- red-drift-inducer
    |       |-- red-scenario-generator
    |
    +-- Blue Team Controller (4 agents)
    |       |-- blue-commander
    |       |-- blue-auth-sentinel
    |       |-- blue-drift-detector
    |       |-- blue-signal-aggregator
    |
    +-- Purple Team Controller (4 agents)
    |       |-- purple-coordinator
    |       |-- purple-mapper
    |       |-- purple-closure-analyst
    |       |-- purple-regression-guard
    |
    +-- White Team Controller (3 agents)
    |       |-- white-verifier-commander
    |       |-- white-contract-validator
    |       |-- white-invariant-prover
    |
    +-- Black Team Controller (2 agents) [ISOLATED]
            |-- black-theorist-commander
            |-- black-abstraction-enforcer
```

### Signal Flow

```
Gray (boundary seeds) --> Red (adversarial scenarios) --> Purple (synthesis)
                                ^                           |       ^
                                |                           v       |
                           Black (threat models)      White (proofs)
                                                            |
                                                            v
                                                    Blue (defense)
                                                            |
                                                            v
                                                    Platform Defense
```

## Usage

### Status Overview

```bash
# Full status across all 6 teams
/color-team

# Status with detailed agent breakdown
/color-team status --detailed

# Summary view with key metrics only
/color-team status --summary
```

### Team-Specific Queries

```bash
# Red team active scenarios
/color-team red --active-scenarios

# Blue team defensive posture
/color-team blue --posture

# Purple team closure status
/color-team purple --closure-status

# Gray team boundary findings
/color-team gray --findings

# White team verification progress
/color-team white --proofs

# Black team threat models (requires L3+ clearance)
/color-team black --models
```

### Campaign Management

```bash
# Launch new security campaign
/color-team campaign --launch "Q1 epistemic security assessment"

# Review campaign progress
/color-team campaign --status

# Close campaign with synthesis
/color-team campaign --close --synthesize
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `action` | string | `status` | Action: status, campaign, findings, posture |
| `team` | string | `all` | Team filter: gray, red, blue, purple, white, black, all |
| `--detailed` | boolean | false | Show agent-level detail |
| `--summary` | boolean | false | Key metrics only |
| `--active-scenarios` | boolean | false | Show active attack scenarios |
| `--posture` | boolean | false | Show defensive posture assessment |
| `--closure-status` | boolean | false | Show Red-Blue closure status |
| `--findings` | boolean | false | Show boundary findings |
| `--proofs` | boolean | false | Show verification proofs |
| `--models` | boolean | false | Show threat models (L3+ required) |

## Team Overview

| Team | Agents | Commander | Primary Function | Isolation |
|------|--------|-----------|-----------------|-----------|
| **Gray** | 3 | `gray-explorer-commander` | Boundary exploration, edge case discovery | Standard |
| **Red** | 4 | `red-commander` | Adversarial simulation, epistemic attacks | Sandbox |
| **Blue** | 4 | `blue-commander` | Epistemic defense, signal aggregation | Standard |
| **Purple** | 4 | `purple-coordinator` | Red-Blue synthesis, closure analysis | Standard |
| **White** | 3 | `white-verifier-commander` | Formal proofs, contract validation | Standard |
| **Black** | 2 | `black-theorist-commander` | Theoretical threat modeling | MAXIMUM |

## Execution Flow

```
PHASE 1: AUTHENTICATION
    |-- Verify L3+ authority level
    |-- Validate supreme-coordinator credentials
    |-- Check team-specific clearances
    |
PHASE 2: STATUS COLLECTION
    |-- Query each team controller
    |-- Aggregate agent status (20 agents)
    |-- Collect active campaign data
    |-- Gather findings and metrics
    |
PHASE 3: POSTURE ASSESSMENT
    |-- Calculate overall security posture
    |-- Identify open findings
    |-- Check closure status (Purple)
    |-- Verify safety protocol compliance
    |
PHASE 4: SYNTHESIS
    |-- Cross-reference team findings
    |-- Identify coverage gaps
    |-- Calculate confidence scores
    |-- Generate recommendations
    |
PHASE 5: DISPLAY
    |-- Render team status dashboard
    |-- Highlight critical findings
    |-- Show action items
    |-- Emit telemetry events
```

## Safety Protocols

All color-team operations enforce strict safety protocols:

| Protocol | Enforcement | Scope |
|----------|-------------|-------|
| **Sandbox Isolation** | All Red/Black operations in PrismaticDark.Sandbox | Red, Black |
| **Synthetic Data Only** | No real data, no PII in any simulation | All teams |
| **No Network Access** | Zero network for Red/Black operations | Red, Black |
| **Ethics Checks** | Automated validation every 10-15 seconds | All teams |
| **Escalation Guards** | Gray and Black escalation prevention | Gray, Black |
| **Audit Logging** | Immutable audit trail | All teams |
| **No Executable Output** | Black domain never produces executable code | Black |
| **Abstraction Filtering** | L1-L4 AbstractionFilter on Black output | Black |

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | 20 agents across 6 teams | Full agent ecosystem |
| AIAD Registry | Agent and command discovery | Standard AIAD interface |
| [Quality Gates](/glossary/quality-gates/) | Pre/post execution validation | Quality-gated findings |
| [Telemetry](/glossary/telemetry/) | Execution [metrics](/glossary/metrics/) | Security posture tracking |
| PrismaticDark.Sandbox | Adversarial operation isolation | Red/Black containment |
| Trinity Gate | Finding validation | 3-gate verification for findings |
| NABLA Framework | Epistemic security integration | Axiom enforcement |

## Best Practices

1. **Regular Posture Reviews**: Run `/color-team status --detailed` at least weekly to maintain awareness of security posture changes and open findings.

2. **Close the Loop**: Ensure Purple team processes all Red findings into Blue defenses. Unclosed loops represent unaddressed attack vectors.

3. **Respect Isolation Boundaries**: Never attempt to access Black team findings without proper L3+ clearance. Isolation exists for safety-critical reasons.

4. **Campaign-Based Operations**: Organize security work into named campaigns rather than ad-hoc queries. Campaigns provide audit trails and measurable outcomes.

5. **Monitor Ethics Compliance**: The automated ethics checks run every 10-15 seconds. Any violations should be investigated immediately.

6. **Cross-Reference with White Team**: All significant findings should be formally verified through White team proofs before being considered established.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `CLEARANCE_INSUFFICIENT` | User lacks L3+ authority | Escalate to supreme coordinator |
| `TEAM_UNAVAILABLE` | Team controller not responding | Check agent health, restart controller |
| `SANDBOX_VIOLATION` | Operation attempted outside sandbox | Immediate halt, investigate breach |
| `ETHICS_VIOLATION` | Ethics check failed | Halt all operations, review and correct |
| `ISOLATION_BREACH` | Cross-team data leakage detected | Emergency protocol, audit investigation |

## Advanced Usage

### Cross-Team Analysis

```bash
# Identify uncovered attack vectors
/color-team analysis --coverage-gaps

# Red-Blue closure metrics
/color-team purple --closure-metrics --timeframe 30d

# Regression analysis across campaigns
/color-team purple --regression-check --campaigns all
```

### Integration with NABLA

The color-team framework operates within the NABLA epistemic framework, enforcing signal plurality and contradiction preservation. Findings from Red team that contradict Blue team assessments are preserved as contradictions per the Addiction Preservation doctrine, not resolved by discarding either perspective.

## Performance

| Metric | Value | Notes |
|--------|-------|-------|
| Status Collection | 2-5 seconds | All 20 agents queried |
| Posture Assessment | 3-10 seconds | Cross-team analysis |
| Campaign Launch | 10-30 seconds | Team initialization |
| Ethics Check | Every 10-15 seconds | Continuous monitoring |

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for security gaps. Every identified vulnerability must be addressed through the full Gray-Red-Purple-Blue-White pipeline. No findings are suppressed or ignored.
- **NO DOUBTS**: Full investigation before action, evidence-based results. All security findings pass through Trinity Gate verification before being considered established.

## Related Commands

- [/red-team](/commands/red-team/) - [Red team](/glossary/red-team/) adversarial simulation scenario execution
- [/blue-team](/commands/blue-team/) - [Blue team](/glossary/blue-team/) epistemic defense posture assessment
- [/purple-team](/commands/purple-team/) - [Purple team](/glossary/purple-team/) Red-Blue synthesis and closure analysis
- [/manipulation-detect](/commands/manipulation-detect/) - Detect manipulation attempts using epistemic analysis
- [/manipulation-protect](/commands/manipulation-protect/) - Activate manipulation protection defenses
- [/manipulation-techniques](/commands/manipulation-techniques/) - View manipulation technique taxonomy and counter-measures
- [/check](/commands/check/) - Verification and integrity checking command

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)