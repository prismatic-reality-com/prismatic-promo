+++
title = "/red-team"
weight = 1160
[extra]
category = "Color Teams"
description = "Red team adversarial simulation scenario execution"
syntax = "/red-team [options]"
authority = "L3"
agent = "red-commander"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1206
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["red-team", "adversarial", "simulation", "scenario", "execution", "commands", "Color Teams", "Prismatic Platform", "Red Team", "Team"]
tags = ["commands", "color-teams", "red-team", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/red-team - Prismatic Platform"
+++

## Overview

**/red-team** is a production command in the **[Color Teams](/glossary/color-teams/)** category of the Prismatic Platform that executes adversarial simulation scenarios against the platform's epistemic infrastructure. The Red Team operates as one of six color teams in the platform's security architecture, specifically responsible for simulating epistemic attacks using five defined primitives: truth distortion, confidence manipulation, signal poisoning, drift induction, and salience hijacking.

The purpose of Red Team operations is not to break things but to discover how they could break. By systematically probing the platform's reasoning infrastructure with adversarial scenarios, the Red Team reveals vulnerabilities that would remain invisible to purely defensive analysis. These findings flow through the [Purple Team](/commands/purple-team/) synthesis loop to inform defensive improvements by the [Blue Team](/commands/blue-team/), creating a continuous cycle of adversarial-defensive strengthening.

All Red Team operations execute exclusively within sandboxed environments using synthetic data. No real data, no production state, and no actual system modifications are involved. The attack primitives are epistemic in nature, targeting the platform's reasoning and decision-making processes rather than its runtime infrastructure. This distinction is fundamental: Red Team work tests whether the platform can be deceived, not whether it can be crashed.

The Red Team's 329-entry attack taxonomy provides a comprehensive library of known epistemic attack patterns, organized by technique, target, and severity. Each taxonomy entry includes the attack description, expected impact, detection method, and recommended countermeasure. The [/red-team](/commands/red-team/) command provides automated execution of scenarios drawn from this taxonomy.

This command operates under the **L3** authority level and is executed by the `red-commander` agent, the strategic commander of all Red Team operations. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard.

## Architecture

The Red Team architecture follows a strict isolation model that prevents adversarial simulation from affecting the production platform.

```
Red Commander (L3)
    |
    v
[Scenario Generator] --> Compose from 329-entry taxonomy
    |
    +---> [Epistemic Attacker] --> Truth distortion, source poisoning
    |
    +---> [Drift Inducer] --> Sub-threshold drift, cascade propagation
    |
    +---> [Scenario Generator] --> Multi-technique composition
    |
    v
[Sandbox Execution] --> PrismaticDark.Sandbox (isolated)
    |
    v
[Finding Emission] --> Structured findings to Purple/Blue
    |
    v
[Audit Logger] --> Immutable audit trail
```

The five attack primitives form the foundation of all Red Team operations:

| Primitive | Description | Target |
|-----------|-------------|--------|
| Truth Distortion | Alter factual claims in evidence chains | NABLA belief networks |
| Confidence Manipulation | Inflate or deflate confidence scores | Trinity Gate thresholds |
| Signal Poisoning | Inject false signals into evidence streams | Signal Plurality axiom |
| Drift Induction | Introduce gradual sub-threshold changes | Drift detection systems |
| Salience Hijacking | Redirect attention to irrelevant signals | Pattern recognition engines |

## Usage

```bash
# Execute a standard adversarial scenario
/red-team scenario --type=truth-distortion

# Run a multi-technique composite scenario
/red-team scenario --composite --techniques=truth-distortion,confidence-manipulation

# Execute scenarios from specific taxonomy entries
/red-team scenario --taxonomy=T-042,T-089,T-156

# Drift induction campaign (sub-threshold attack simulation)
/red-team drift --target=quality-metrics --duration=simulated-30d

# Full Red Team exercise against NABLA axioms
/red-team exercise --target=nabla --scope=all-axioms

# Red Team status and findings report
/red-team status

# Review findings from last exercise
/red-team findings --last

# Generate scenario for specific Blue Team defense
/red-team scenario --counter=blue-drift-detector
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `scenario` | subcommand | - | Execute an adversarial simulation scenario |
| `drift` | subcommand | - | Execute a drift induction campaign |
| `exercise` | subcommand | - | Execute a full Red Team exercise |
| `status` | subcommand | - | Show Red Team status and metrics |
| `findings` | subcommand | - | Review findings from previous exercises |
| `--type` | enum | - | Attack primitive type (truth-distortion, confidence-manipulation, signal-poisoning, drift-induction, salience-hijacking) |
| `--composite` | boolean | false | Enable multi-technique scenario composition |
| `--techniques` | string | - | Comma-separated list of techniques for composite scenarios |
| `--taxonomy` | string | - | Specific taxonomy entry IDs to execute |
| `--target` | string | all | Target subsystem for the exercise |
| `--scope` | string | limited | Exercise scope: `limited`, `focused`, `all-axioms` |
| `--duration` | string | single | Simulated duration for drift campaigns |
| `--intensity` | enum | medium | Attack intensity: `low`, `medium`, `high`, `maximum` |
| `--counter` | string | - | Target specific Blue Team defense for evaluation |

## Execution Flow

Red Team operations follow a rigorous execution flow with mandatory safety checks at every stage.

**Step 1 - Authorization Verification**: The command verifies L3 authority and confirms that the sandbox environment is available and properly isolated. No Red Team operation can execute outside the PrismaticDark.Sandbox.

**Step 2 - Scenario Construction**: The scenario generator composes the attack scenario from the specified parameters and taxonomy entries. Composite scenarios are assembled by combining multiple techniques with defined sequencing and timing relationships.

**Step 3 - Ethics Check**: An automated ethics check validates that the scenario operates within approved boundaries. This check runs every 10-15 seconds during execution to ensure continuous compliance.

**Step 4 - Sandbox Execution**: The scenario executes within the isolated sandbox against synthetic data. All state changes are confined to the sandbox and are automatically cleaned up after execution completes.

**Step 5 - Finding Extraction**: Results are analyzed to identify vulnerabilities, weaknesses, and unexpected behaviors. Findings are structured with severity, affected subsystem, evidence, and recommended countermeasure.

**Step 6 - Finding Emission**: Structured findings are emitted to the [Purple Team](/commands/purple-team/) for synthesis with Blue Team defensive posture. Findings are also recorded in the immutable audit log.

**Step 7 - Sandbox Cleanup**: All sandbox state is destroyed. No residual attack artifacts remain in the system.

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Red Commander](/agents/red-commander/) | L3 Strategic Commander | Orchestrates all adversarial scenarios |
| [Red Epistemic Attacker](/agents/red-epistemic-attacker/) | L2 Tactical Specialist | Truth distortion and source poisoning |
| [Red Drift Inducer](/agents/red-drift-inducer/) | L2 Tactical Specialist | Sub-threshold drift attacks |
| [Red Scenario Generator](/agents/red-scenario-generator/) | L2 Tactical Specialist | Multi-technique scenario composition |
| [Purple Team](/commands/purple-team/) | Finding consumer | Synthesizes Red findings with Blue defense |
| [Blue Team](/commands/blue-team/) | Defensive counterpart | Implements defenses against Red findings |
| [Color Team](/commands/color-team/) | Status overview | Cross-team visibility and coordination |
| PrismaticDark.Sandbox | Execution environment | Isolated sandbox for adversarial operations |

## Best Practices

Design scenarios that test the boundaries of detection systems rather than attempting to overwhelm them. The most valuable Red Team findings reveal gaps in detection coverage, not capacity limitations. A scenario that introduces subtle drift below detection thresholds provides more actionable intelligence than a brute-force attack that triggers every alarm.

Use composite scenarios to test the interaction between defensive systems. Individual attack primitives may be well-defended, but combinations can reveal gaps in the seams between detection systems. For example, combining confidence manipulation with drift induction tests whether the drift detector can function accurately when confidence scores are artificially inflated.

Coordinate with the [Blue Team](/commands/blue-team/) through the [Purple Team](/commands/purple-team/) rather than directly. The Purple Team's synthesis function ensures that Red findings are properly contextualized and prioritized before defensive resources are allocated. Direct Red-Blue communication can create reactive fire-fighting rather than systematic defense improvement.

Run regular regression scenarios to verify that previously identified vulnerabilities remain patched. The `--taxonomy` flag enables precise re-execution of specific attack patterns to confirm that defenses implemented in response to prior findings remain effective.

## Error Handling

Red Team operations handle errors with extreme caution to prevent sandbox escape or unintended side effects. If the sandbox environment fails to initialize, the command aborts immediately without attempting any adversarial operations. If an ethics check fails during execution, the scenario is terminated and all sandbox state is destroyed.

```
RED TEAM SAFETY HALT
Reason: Ethics check failed at timestamp T+45s
Violation: Scenario attempted to access production data source
Action: Immediate termination, sandbox destroyed
Audit: Finding logged to immutable audit trail (RT-2026-0142)
Required: Review scenario configuration before re-execution
```

Network access violations, memory boundary violations, and execution time limit breaches all trigger immediate termination with full audit logging.

## Advanced Usage

Advanced Red Team operations support campaign-level exercises that simulate sophisticated, multi-phase adversarial campaigns.

```bash
# Multi-phase campaign simulation
/red-team exercise --campaign=apt-simulation --phases=reconnaissance,staging,execution,persistence

# Automated regression suite of all taxonomy entries
/red-team exercise --taxonomy=all --regression-mode

# Red Team exercise targeting specific NABLA axiom
/red-team exercise --target=nabla --axiom=signal-plurality --intensity=maximum

# Generate novel scenario variations from existing taxonomy
/red-team scenario --generate --base=T-042 --variations=10
```

Campaign-level exercises simulate the progression of a sophisticated adversary over simulated time, testing the platform's ability to detect and respond to evolving threats. These exercises are particularly valuable for evaluating the drift detection and anomaly correlation capabilities of the [Blue Team](/commands/blue-team/).

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Red Team exercises execute completely with full finding documentation. No vulnerability is left unreported, no scenario is abandoned mid-execution, and no finding is downgraded without evidence.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every finding includes the complete evidence chain from scenario input through attack execution to observed vulnerability. No finding is accepted without reproducible evidence.

All Red Team operations additionally comply with the [Red Team Safety Policy](/glossary/red-team/), which mandates sandbox isolation, synthetic data only, zero network access, and continuous ethics monitoring.

## Related Commands

- [/color-team](/commands/color-team/) - Color team status overview across all 6 teams
- [/blue-team](/commands/blue-team/) - [Blue team](/glossary/blue-team/) epistemic defense posture assessment
- [/purple-team](/commands/purple-team/) - [Purple team](/glossary/purple-team/) Red-Blue synthesis and closure analysis
- [/manipulation-detect](/commands/manipulation-detect/) - Detect manipulation attempts using epistemic analysis
- [/manipulation-protect](/commands/manipulation-protect/) - Activate manipulation protection defenses
- [/manipulation-techniques](/commands/manipulation-techniques/) - View manipulation technique taxonomy and counter-measures

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)