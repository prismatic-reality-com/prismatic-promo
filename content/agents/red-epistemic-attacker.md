+++
title = "red-epistemic-attacker"
weight = 341
[extra]
domain = "adversarial-epistemics"
level = "L4"
description = "Red Epistemic Attacker simulates truth distortion and source poisoning attacks against epistemic systems using synthetic data in sandboxed environments"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["nabla-infinity", "trinity-gate", "3nl", "aiad", "color-teams", "lean4", "property-based-testing", "no-doubts", "seadf", "telemetry"]
domain_normalized = "epistemic"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2100
quality_score = 84
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["red-epistemic-attacker", "Epistemic", "Attacker", "agents", "agent", "Prismatic Platform", "NABLA Infinity", "Truth", "Source"]
tags = ["agents", "agent", "red-epistemic-attacker", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "red-epistemic-attacker - Prismatic Platform"
+++

## Overview

The red-epistemic-attacker operates as an L4 Domain Authority specialist within the Prismatic Platform's adversarial-epistemics domain, simulating truth distortion and source poisoning attacks against the platform's epistemic systems. This agent measures the impact of fabricated evidence, corrupted source material, and manipulated data streams on the platform's analytical conclusions, testing whether the [NABLA Infinity](/glossary/nabla-infinity/) axioms and [Trinity Gate](/glossary/trinity-gate/) validation effectively protect against adversarial information injection.

Truth distortion and source poisoning represent two of the five fundamental epistemic attack primitives coordinated by the [red-commander](/agents/red-commander/). Truth distortion introduces wholly fabricated information into evidence streams, while source poisoning corrupts legitimate sources to produce subtly altered data. Both attack types target the integrity of the evidence foundation upon which all analytical conclusions rest. If false information can enter the platform's analytical pipeline undetected, every downstream conclusion built on that evidence becomes unreliable.

Built on the [AIAD](/glossary/aiad/) standard, all operations execute within `PrismaticDark.Sandbox` using synthetic data exclusively. The agent never accesses production data or production analytical systems. Ethics checks run at 10-15 second intervals to ensure operational safety boundaries are maintained throughout attack simulations.

## Attack Vector Taxonomy

The red-epistemic-attacker maintains a structured taxonomy of truth distortion and source poisoning techniques, categorized by attack mechanism, target vulnerability, and detection difficulty.

**Fabrication attacks** introduce entirely invented evidence into analytical pipelines. These range from simple false data injection to sophisticated fabrication that includes internally consistent metadata, realistic temporal patterns, and corroborating cross-references designed to pass automated validation checks. The complexity spectrum tests the depth of the platform's fabrication detection capabilities.

**Modification attacks** alter legitimate data in transit or at rest, changing values, dates, relationships, or contextual metadata while preserving the overall structure and apparent authenticity of the original source. These attacks are particularly challenging to detect because the modified data retains most properties of legitimate evidence.

**Impersonation attacks** create synthetic sources that mimic the characteristics of trusted sources, attempting to inject fabricated information through channels that receive elevated trust due to source reputation. These attacks test whether the platform's source authentication mechanisms correctly identify impersonated sources.

**Contextual manipulation attacks** present legitimate data in misleading contexts -- accurate information stripped of qualifying context, cherry-picked data points presented as representative samples, or temporal ordering manipulations that create false causal narratives. These attacks test whether the platform's analytical processes consider contextual integrity alongside data accuracy.

## Key Capabilities

- **Truth distortion simulation** -- Designs and executes fabrication, modification, and contextual manipulation attacks against synthetic evidence streams, measuring detection rates and analytical impact
- **Source poisoning campaigns** -- Corrupts simulated source feeds with calibrated alterations, testing the platform's ability to detect compromised sources through behavioral analysis and cross-source validation
- **Impact measurement** -- Quantifies the downstream impact of successful attacks on analytical conclusions, measuring how far false information propagates through the analytical pipeline before detection
- **Detection gap identification** -- Maps the specific detection mechanisms that fail to catch each attack variant, producing targeted improvement recommendations for the [Blue Team](/teams/blue/)
- **Attack complexity scaling** -- Adjusts attack sophistication from simple injection to elaborate multi-layer fabrication, characterizing the relationship between attack investment and defensive capability
- **Cross-source correlation testing** -- Tests whether the platform's [signal plurality](/glossary/signal-plurality/) enforcement effectively catches fabricated information that lacks independent corroboration
- **[Autonomous operation](/capabilities/autonomous-self-healing/)** with self-directed attack campaign cycles and automated outcome measurement
- **[Telemetry integration](/capabilities/telemetry-integration/)** for attack simulation monitoring and detection rate tracking

## Attack Execution Methodology

Attack simulations follow a structured methodology that ensures scientific rigor in measuring defensive effectiveness. The **baseline phase** establishes the platform's analytical output under clean (unattacked) conditions, providing the reference against which attack impact is measured. The **injection phase** introduces adversarial content according to the designed attack scenario, varying attack parameters systematically to characterize defensive response curves.

The **propagation phase** monitors how injected content moves through the analytical pipeline, tracking which validation checkpoints it passes, which agents process the corrupted data, and how far downstream the corruption propagates before detection or consumption. The **impact phase** compares analytical outputs under attack conditions against the clean baseline, quantifying the degree of conclusion corruption.

For each attack variant, the agent produces a **detection profile** that maps which defensive mechanisms engaged, their response timing, and their effectiveness in preventing or limiting impact. These profiles inform targeted defensive improvements and contribute to the Red Team's understanding of overall defensive posture.

## Authority Level

**L4** - Domain Authority - Specialized domain expertise in truth distortion and source poisoning simulation, operating under the [red-commander](/agents/red-commander/)'s strategic direction with autonomy in attack technique selection and execution within approved campaign parameters.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/epistemic-attack simulate` | Execute a truth distortion or source poisoning attack scenario | L4+ |
| `/epistemic-attack impact` | Measure the downstream impact of a completed attack simulation | L4+ |
| `/epistemic-attack taxonomy` | Display the current attack technique taxonomy with detection profiles | L4+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [red-commander](/agents/red-commander/) | Strategic direction, campaign approval, and resource allocation |
| [red-drift-inducer](/agents/red-drift-inducer/) | Combined operations where truth distortion precedes or accompanies drift campaigns |
| [red-scenario-generator](/agents/red-scenario-generator/) | Multi-technique scenarios that incorporate truth distortion components |
| [blue-auth-sentinel](/agents/blue-auth-sentinel/) | Source authentication attacks directly test Blue Team authentication defenses |
| [blue-signal-aggregator](/agents/blue-signal-aggregator/) | Signal poisoning attacks test the aggregator's cross-source validation capabilities |

## NABLA Infinity Targeting

The red-epistemic-attacker specifically targets the [NABLA Infinity](/glossary/nabla-infinity/) axioms that are designed to prevent the very attacks it simulates. [Signal plurality](/glossary/signal-plurality/) is tested by fabricating multiple apparently independent sources that actually share a common adversarial origin. Source independence is tested by creating fabricated corroboration that mimics independent confirmation. [Provenance mandatory](/glossary/provenance-mandatory/) is tested by constructing fabricated provenance chains that pass automated validation.

Each axiom-targeting attack is documented with its success or failure against the specific defensive mechanism, creating a detailed map of the platform's epistemic resilience that guides continuous defensive improvement.

## Safety Protocols

All attack simulations execute within `PrismaticDark.Sandbox` with complete network isolation, synthetic data exclusively, and zero production system access. Ethics checks run at 10-15 second intervals throughout simulation execution. Attack outputs are sanitized to prevent repurposing for actual adversarial operations, and all simulation artifacts are logged to an immutable audit trail.

## Enforcement

Attack findings comply with the [NO MERCY](/glossary/no-mercy/) doctrine: defensive weaknesses are reported comprehensively regardless of their implications. The [NO DOUBTS](/glossary/no-doubts/) principle mandates that all findings are reproducible within the simulation environment. [Trinity Gate](/glossary/trinity-gate/) validates findings before they enter the defensive improvement pipeline.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)