+++
title = "red-scenario-generator"
weight = 342
[extra]
domain = "adversarial-epistemics"
level = "L4"
description = "Red Scenario Generator creates adversarial epistemic scenarios by combining techniques from the 329-entry Red Team taxonomy"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["nabla-infinity", "trinity-gate", "3nl", "aiad", "color-teams", "lean4", "property-based-testing", "no-doubts", "seadf", "telemetry"]
domain_normalized = "epistemic"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2050
quality_score = 83
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["red-scenario-generator", "Scenario", "Generator", "329-entry", "Team", "agents", "agent", "Prismatic Platform", "Domain Authority"]
tags = ["agents", "agent", "red-scenario-generator", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "red-scenario-generator - Prismatic Platform"
+++

## Overview

The red-scenario-generator operates as an L4 Domain Authority specialist within the Prismatic Platform's adversarial-epistemics domain, creating composite adversarial epistemic scenarios by combining techniques from the 329-entry [Red Team](/teams/red/) taxonomy. While the [red-epistemic-attacker](/agents/red-epistemic-attacker/) and [red-drift-inducer](/agents/red-drift-inducer/) execute individual attack primitives, this agent designs multi-technique scenarios that model realistic adversarial campaigns where attackers combine multiple methods simultaneously. Real-world epistemic threats rarely use a single technique in isolation; effective adversarial campaigns layer multiple attack vectors to create synergistic effects that exceed the sum of individual technique impacts.

The 329-entry taxonomy provides the building blocks from which the scenario generator constructs adversarial campaigns. Each taxonomy entry describes an attack technique with its mechanism, target vulnerability, prerequisite conditions, expected impact, and interaction effects with other techniques. The generator uses these interaction profiles to identify technique combinations that produce amplified effects -- for example, confidence manipulation that makes the platform more susceptible to subsequent truth distortion, or drift induction that establishes conditions favorable for salience hijacking.

Built on the [AIAD](/glossary/aiad/) standard, the scenario generator operates under the [red-commander](/agents/red-commander/)'s strategic direction within `PrismaticDark.Sandbox` safety constraints. All scenarios use synthetic data exclusively and cannot access production systems.

## Scenario Composition Framework

The scenario generator employs a compositional framework that transforms individual attack techniques into coherent multi-stage adversarial campaigns. The framework models three types of technique interactions.

**Sequential amplification** occurs when one technique creates conditions that increase the effectiveness of a subsequent technique. For example, a drift induction phase that gradually erodes confidence in a particular evidence source creates favorable conditions for a truth distortion attack that introduces fabricated evidence to replace the discredited source. The generator identifies these amplification chains within the taxonomy.

**Parallel convergence** describes scenarios where multiple techniques operate simultaneously against different aspects of the same analytical process, creating a multi-front attack that overwhelms defensive resources. While the [Blue Team](/teams/blue/) responds to signal poisoning on one evidence stream, confidence manipulation on a different stream may go undetected due to resource allocation constraints.

**Masking interaction** occurs when one technique's effects obscure the indicators of another technique's operation. High-frequency noise injection, for example, can mask the statistical signatures of low-frequency drift, preventing detection algorithms from identifying the drift component of a combined attack.

The generator evaluates all pairwise and higher-order technique interactions within the taxonomy to identify the most potent combinations, prioritizing scenarios that represent realistic adversarial capabilities and test meaningful defensive boundaries.

## Key Capabilities

- **Taxonomy-driven scenario composition** -- Constructs multi-technique adversarial scenarios from the 329-entry taxonomy, selecting technique combinations based on interaction profiles and target vulnerability assessments
- **Hypothesis template instantiation** -- Generates specific adversarial hypotheses from parameterized scenario templates, producing concrete attack plans with defined techniques, timelines, and success criteria
- **Interaction effect modeling** -- Predicts the synergistic effects of technique combinations, estimating whether combined impact exceeds individual technique impacts and identifying optimal technique sequencing
- **Scenario difficulty calibration** -- Adjusts scenario complexity and sophistication to match the current defensive posture, ensuring that scenarios provide meaningful challenge without being trivially detected or impossibly sophisticated
- **Coverage analysis** -- Tracks which taxonomy techniques and technique combinations have been tested, identifying untested areas that represent potential defensive blind spots
- **Scenario library management** -- Maintains a library of proven scenario templates with measured outcomes, enabling rapid deployment of pre-validated scenarios and systematic coverage of the attack taxonomy
- **[Autonomous operation](/capabilities/autonomous-self-healing/)** with automated scenario generation cycles tuned to defensive improvement pace
- **[Telemetry integration](/capabilities/telemetry-integration/)** for scenario execution monitoring and taxonomy coverage tracking

## Scenario Generation Process

The generation process follows a structured methodology. The **targeting phase** identifies which defensive capabilities should be tested, based on recent Blue Team posture assessments, previous scenario findings, and taxonomy coverage gaps. The **composition phase** selects techniques from the taxonomy that target identified capabilities, arranging them into coherent scenarios with defined interaction patterns.

The **parameterization phase** instantiates scenario templates with specific parameters: attack magnitudes, timing schedules, target evidence streams, and success criteria. Parameters are calibrated against current detection thresholds to ensure scenarios provide meaningful defensive challenge. The **validation phase** reviews the composed scenario for internal consistency, safety constraint compliance, and expected informational value before execution approval.

Upon [red-commander](/agents/red-commander/) approval, the **dispatch phase** distributes scenario components to the appropriate specialist agents for execution. The scenario generator monitors execution progress, coordinating timing dependencies between sequential and parallel components.

## Authority Level

**L4** - Domain Authority - Specialized domain expertise in adversarial scenario composition, operating under the [red-commander](/agents/red-commander/)'s strategic direction with autonomy in technique selection and combination within approved scenario parameters.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/scenario generate` | Generate a new adversarial scenario targeting specified defensive capabilities | L4+ |
| `/scenario library` | Browse the scenario template library with filtering and search | L4+ |
| `/scenario coverage` | Display taxonomy coverage analysis showing tested and untested technique combinations | L4+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [red-commander](/agents/red-commander/) | Strategic direction, scenario approval, and execution authorization |
| [red-epistemic-attacker](/agents/red-epistemic-attacker/) | Executes truth distortion and source poisoning components of composed scenarios |
| [red-drift-inducer](/agents/red-drift-inducer/) | Executes drift induction components of composed scenarios |
| [purple-coordinator](/agents/purple-coordinator/) | Scenario outcomes feed into Purple Team synthesis for systemic defensive improvement |
| [blue-commander](/agents/blue-commander/) | Defensive posture assessments inform scenario targeting decisions |

## Taxonomy Structure

The 329-entry taxonomy is organized hierarchically by attack primitive (truth distortion, confidence manipulation, signal poisoning, drift induction, salience hijacking), with sub-categories for specific technique variants. Each entry includes metadata on technique complexity, required preconditions, expected detection difficulty, historical success rate in simulations, and documented interaction effects with other techniques.

The taxonomy is a living document that evolves as new attack techniques are discovered, existing techniques are refined, and defensive improvements render certain techniques obsolete. The scenario generator participates in taxonomy maintenance by identifying technique gaps revealed through scenario composition analysis and proposing new entries based on observed interaction effects.

## Safety Protocols

All generated scenarios are constrained to sandbox execution with synthetic data. Scenario parameters are validated against safety boundaries before execution approval. Ethics checks verify that scenarios remain within authorized simulation scope. The scenario library is access-controlled, and scenario templates are sanitized to prevent repurposing outside the defensive improvement context.

## Enforcement

Scenario design and execution comply with the [NO MERCY](/glossary/no-mercy/) doctrine: scenarios are designed to genuinely challenge defenses rather than confirm existing capabilities. The [NO DOUBTS](/glossary/no-doubts/) principle requires reproducible scenario execution and verifiable outcome measurement. [Trinity Gate](/glossary/trinity-gate/) validates scenario findings before they enter the defensive improvement pipeline.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)