+++
title = "red-commander"
weight = 339
[extra]
domain = "adversarial-epistemics"
level = "L2"
description = "Red Team Commander is the strategic authority for adversarial epistemics simulation within the Prismatic Platform, orchestrating epistemic attack scenarios using five attack primitives"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["nabla-infinity", "trinity-gate", "3nl", "aiad", "color-teams", "lean4", "property-based-testing", "no-doubts", "seadf", "telemetry"]
domain_normalized = "epistemic"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2200
quality_score = 85
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["red-commander", "Team", "Commander", "Prismatic", "Platform", "agents", "agent", "Prismatic Platform", "Red Team", "Blue Team"]
tags = ["agents", "agent", "red-commander", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "red-commander - Prismatic Platform"
+++

## Overview

The red-commander operates as an L2 Tactical Operations authority within the Prismatic Platform's adversarial-epistemics domain, serving as the strategic commander of the [Red Team](/teams/red/) -- the adversarial simulation force within the platform's [color-team](/glossary/color-teams/) security architecture. This agent orchestrates epistemic attack scenarios using five fundamental attack primitives: truth distortion, confidence manipulation, signal poisoning, drift induction, and salience hijacking. Every Red Team operation is designed to probe the platform's epistemic defenses, identify vulnerabilities in belief formation processes, and generate actionable findings that strengthen the platform's resistance to adversarial manipulation.

The Red Team exists because epistemic systems cannot be hardened through defensive analysis alone. Just as network security requires penetration testing, epistemic security requires adversarial simulation that actively attempts to subvert belief formation, corrupt evidence chains, and manipulate confidence assessments. The red-commander plans these campaigns, coordinates the specialized Red Team agents that execute individual attack techniques, and ensures that findings flow to the [Purple Team](/teams/purple/) for synthesis and the [Blue Team](/teams/blue/) for defensive posture improvement.

Built on the [AIAD](/glossary/aiad/) standard, all Red Team operations execute within strict safety boundaries: synthetic data only, sandboxed execution environments, zero production access, and mandatory ethics checks every 10-15 seconds. The red-commander enforces these constraints across all subordinate agents, maintaining the critical distinction between adversarial simulation for defensive improvement and actual adversarial action.

## Five Attack Primitives

The Red Team's operational taxonomy centers on five epistemic attack primitives, each targeting a different aspect of belief formation and maintenance within the platform's intelligence systems.

**Truth Distortion** attacks introduce false or misleading information into evidence streams, testing the platform's ability to detect fabricated evidence, manipulated data, and deceptive source material. These simulations evaluate how effectively the [NABLA Infinity](/glossary/nabla-infinity/) [signal plurality](/glossary/signal-plurality/) axiom prevents single-source falsehoods from contaminating analytical conclusions.

**Confidence Manipulation** attacks target the confidence scoring mechanisms that the platform attaches to beliefs and assessments. By introducing evidence that artificially inflates or deflates confidence levels, these attacks test whether the platform's confidence calibration remains accurate under adversarial conditions.

**Signal Poisoning** attacks corrupt the data streams that feed the platform's analytical pipelines. Unlike truth distortion, which introduces entirely false information, signal poisoning subtly alters legitimate data to shift analytical outcomes. These attacks are particularly insidious because the poisoned signals may pass individual validity checks while systematically biasing aggregate conclusions.

**Drift Induction** attacks simulate slow, incremental shifts in belief systems that individually fall below detection thresholds but cumulatively produce significant epistemic drift. The [red-drift-inducer](/agents/red-drift-inducer/) specialist executes these scenarios under the commander's strategic direction.

**Salience Hijacking** attacks manipulate the perceived importance of different evidence streams, causing the platform to over-weight certain signals and under-weight others. These attacks test whether the platform's evidence weighting mechanisms are robust against adversarial manipulation of attention and priority.

## Key Capabilities

- **Campaign orchestration** -- Plans and coordinates multi-technique adversarial campaigns that combine attack primitives to test complex epistemic defense scenarios
- **Attack scenario design** -- Creates realistic adversarial scenarios based on the 329-entry Red Team taxonomy, selecting techniques appropriate to specific intelligence domain vulnerabilities
- **Finding synthesis** -- Aggregates results from individual attack executions into strategic findings that identify systemic epistemic vulnerabilities
- **Safety boundary enforcement** -- Maintains strict operational boundaries across all subordinate Red Team agents, ensuring synthetic-data-only operation and sandbox isolation
- **Cross-team communication** -- Publishes structured findings to [Purple Team](/teams/purple/) for Red-Blue synthesis and to [Blue Team](/teams/blue/) for defensive posture adjustment
- **Technique evolution** -- Evolves attack techniques based on defensive improvements, ensuring that Red Team capabilities advance in response to strengthened defenses
- **[Autonomous operation](/capabilities/autonomous-self-healing/)** with self-directed adversarial campaign cycles tuned to current defensive posture
- **[Telemetry integration](/capabilities/telemetry-integration/)** for attack execution monitoring and finding quality tracking

## Operational Methodology

Red Team campaigns follow a structured operational methodology. The **reconnaissance phase** analyzes current defensive posture reports from the Blue Team, identifying areas where defenses may have weakened or where new capabilities create untested attack surfaces. The **planning phase** designs attack scenarios that target identified vulnerabilities, selecting appropriate primitives and configuring attack parameters.

The **execution phase** deploys specialized agents -- [red-epistemic-attacker](/agents/red-epistemic-attacker/), [red-drift-inducer](/agents/red-drift-inducer/), and [red-scenario-generator](/agents/red-scenario-generator/) -- to carry out planned attacks within sandboxed environments. Each execution produces detailed logs of attack actions, observed system responses, and outcome measurements.

The **analysis phase** evaluates attack outcomes against expected defensive responses, identifying gaps between intended defensive behavior and actual system reactions. Findings are classified by severity, exploitation complexity, and potential impact on platform epistemic integrity.

## Authority Level

**L2** - Tactical Operations - Domain-specific [tactical execution](/glossary/tactical-execution/) with authority to orchestrate all Red Team operations, coordinate subordinate attack agents, and publish adversarial findings to cross-team synthesis channels.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/red-team campaign` | Plan and initiate a multi-technique adversarial campaign | L2+ |
| `/red-team scenario` | Execute a specific attack scenario from the Red Team taxonomy | L2+ |
| `/red-team findings` | Display current Red Team findings with severity classifications | L2+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [red-epistemic-attacker](/agents/red-epistemic-attacker/) | Executes truth distortion and source poisoning attack scenarios |
| [red-drift-inducer](/agents/red-drift-inducer/) | Executes slow drift induction campaigns under strategic direction |
| [red-scenario-generator](/agents/red-scenario-generator/) | Generates multi-technique adversarial scenarios from the taxonomy |
| [purple-coordinator](/agents/purple-coordinator/) | Receives Red Team findings for Red-Blue synthesis and closure analysis |
| [blue-commander](/agents/blue-commander/) | Red Team findings inform defensive posture adjustments |

## Safety Protocols

Red Team operations are subject to the most stringent safety constraints in the platform. All operations execute in `PrismaticDark.Sandbox` with zero network connectivity, zero production data access, and synthetic-data-only constraints. Ethics checks run automatically every 10-15 seconds, and the commander maintains override authority to halt any subordinate operation that approaches safety boundary violations. Immutable audit logging captures every Red Team action for retrospective review.

## Enforcement

Red Team operations comply with the [NO MERCY](/glossary/no-mercy/) doctrine: adversarial testing is thorough, comprehensive, and uncompromising in its pursuit of defensive weaknesses. The [NO DOUBTS](/glossary/no-doubts/) principle ensures that all findings are evidence-based and reproducible. The [Trinity Gate](/glossary/trinity-gate/) validates Red Team findings before they enter the platform's defensive improvement pipeline, ensuring that remediation efforts address genuine vulnerabilities rather than testing artifacts.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)