+++
title = "purple-mapper"
weight = 320
[extra]
domain = "epistemic-synthesis"
level = "L4"
description = "Maps each Red team finding to corresponding Blue defense capability. Maintains the bidirectional index between adversarial findings and defensive controls. Detects unmapped find..."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["nabla-infinity", "trinity-gate", "3nl", "aiad", "color-teams", "lean4", "property-based-testing", "no-doubts", "seadf", "telemetry"]
domain_normalized = "epistemic"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2150
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["purple-mapper", "Maps", "Blue", "Maintains", "Detects", "agents", "agent", "Prismatic Platform"]
tags = ["agents", "agent", "purple-mapper", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "purple-mapper - Prismatic Platform"
+++

## Overview

The purple-mapper operates as an L4 Domain Authority within the Prismatic Platform's epistemic-synthesis domain, maintaining the critical bidirectional index between [Red](/teams/red/) team adversarial findings and [Blue](/teams/blue/) team defensive capabilities. This agent maps each Red team finding to the corresponding Blue defense that addresses it, and conversely maps each Blue defensive control to the Red findings it mitigates. This bidirectional mapping is the structural foundation of the Purple synthesis process -- without it, the platform cannot determine which attacks are defended, which defenses are exercised, or where coverage gaps exist. The purple-mapper detects unmapped findings (attacks without defenses) and unmapped controls (defenses without adversarial validation), ensuring that neither the adversarial nor defensive perspective contains blind spots.

The mapping function extends beyond simple one-to-one correspondence. A single Red finding may require multiple Blue defensive controls for complete mitigation, and a single Blue control may address aspects of multiple Red findings. The purple-mapper maintains these many-to-many relationships as a bipartite graph, enabling sophisticated coverage analysis that accounts for partial overlaps, defense-in-depth configurations, and interdependent control structures. Under the [NABLA Infinity](/glossary/nabla-infinity/) framework, the mapping is treated as an epistemic artifact subject to the same evidence standards as any platform belief -- mappings carry confidence scores, source attributions, and temporal validity windows.

## Bidirectional Mapping Architecture

The core data structure maintained by the purple-mapper is a weighted bipartite graph where Red findings form one vertex partition and Blue defensive controls form the other. Edges represent mitigation relationships, weighted by coverage strength (how completely the defense addresses the finding) and confidence level (how certain the mapping assessment is).

**Finding-to-Defense Mapping** (forward direction) answers the question: "For each identified attack, what defenses exist?" The mapper decomposes each Red finding into individual attack vectors and evaluates each Blue control's ability to mitigate each vector. A finding is considered fully mapped when the combined coverage of all mapped defenses addresses every identified attack vector. Partially mapped findings are flagged with specific gap descriptions identifying which vectors lack defensive coverage.

**Defense-to-Finding Mapping** (reverse direction) answers the question: "For each defensive control, which attacks validate it?" This reverse mapping identifies defenses that have never been tested against adversarial scenarios -- controls that exist in the defensive posture but have no corresponding Red team validation. Untested defenses carry reduced confidence because their effectiveness is assumed rather than demonstrated.

**Coverage Metrics** are derived from the mapping graph through computational analysis. Attack coverage measures the proportion of Red findings with complete defensive mappings. Defense utilization measures the proportion of Blue controls with at least one mapped finding. Coverage depth measures the average number of independent defenses per finding (defense-in-depth metric). These metrics provide quantitative insight into the platform's epistemic security posture.

## Mapping Methodology

The purple-mapper applies a structured methodology for establishing and maintaining mappings that aligns with the [NO DOUBTS](/glossary/no-doubts/) principle.

**Semantic Analysis** examines the technical substance of both findings and controls to determine whether a genuine mitigation relationship exists. The mapper goes beyond surface-level keyword matching to assess whether the defense actually addresses the mechanism of the attack. A defense that blocks one exploitation technique does not map to a finding about a different technique targeting the same vulnerability, even though both relate to the same system component.

**Coverage Assessment** quantifies the degree to which a defense addresses a finding. Full coverage means the defense completely eliminates the attack vector. Partial coverage means the defense reduces but does not eliminate the attack's effectiveness. Conditional coverage means the defense is effective only under specific operational conditions. The mapper assigns coverage categories and scores based on technical analysis of the defense mechanism against the attack specification.

**Confidence Scoring** reflects the mapper's certainty in the mapping assessment. High-confidence mappings are based on direct testing (the defense was observed to block the specific attack). Medium-confidence mappings are based on architectural analysis (the defense should block the attack based on its design). Low-confidence mappings are based on logical inference (the defense operates in the relevant domain but has not been specifically validated against the finding). Confidence scores inform closure evaluation priorities -- low-confidence mappings trigger additional verification.

## Gap Detection and Analysis

The purple-mapper's highest-value output is the identification and characterization of coverage gaps -- areas where the adversarial-defensive mapping reveals incomplete protection.

**Unmapped Findings** are Red team discoveries with no corresponding defensive control. These represent known attack vectors against which the platform has no defense. The mapper classifies unmapped findings by severity (based on the original Red finding severity) and difficulty of remediation (based on the nature of the required defense). Critical unmapped findings are escalated to the [purple-coordinator](/agents/purple-coordinator/) for priority defensive action.

**Unmapped Controls** are Blue team defensive measures with no corresponding Red team validation. These represent defenses whose effectiveness is unverified. The mapper distinguishes between controls that are genuinely untested (no relevant Red team activity has occurred) and controls that should have been exercised by existing Red campaigns but were not (indicating potential Red team blind spots). Untested controls are recommended for adversarial validation in future Red team campaigns.

**Mapping Degradation** monitors the temporal validity of existing mappings. As the platform evolves, defensive controls may be modified, removed, or rendered ineffective by architectural changes. The mapper periodically reviews existing mappings against current system state and flags mappings that may be stale -- where the defense or finding has changed since the mapping was established.

## Visualization and Reporting

The purple-mapper produces visualization outputs that communicate mapping status to both operational and strategic consumers. Coverage heat maps display the mapping density across platform domains, highlighting areas of strong defense and areas of weakness. Bipartite graph visualizations show the specific relationships between findings and controls, enabling detailed analysis of defense-in-depth configurations. Gap reports list unmapped findings and controls with prioritized remediation recommendations.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/purple map` | Display the current finding-to-defense mapping for a specified domain | L4+ |
| `/purple gaps` | List all unmapped findings and controls with severity rankings | L4+ |
| `/purple coverage` | Generate coverage metrics across all mapped domains | L4+ |
| `/purple stale` | Identify mappings that may be degraded due to system changes | L4+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [purple-coordinator](/agents/purple-coordinator/) | Receives mapping reports and gap analyses for strategic synthesis |
| [purple-closure-analyst](/agents/purple-closure-analyst/) | Provides mapping data for closure coverage evaluation |
| [purple-regression-guard](/agents/purple-regression-guard/) | Supplies mapping context for regression detection in closed findings |
| [red-commander](/agents/red-commander/) | Receives unmapped control notifications for adversarial campaign planning |
| [blue-commander](/agents/blue-commander/) | Receives unmapped finding notifications for defensive prioritization |

## Integration Architecture

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Runtime execution and lifecycle management |
| Prismatic Telemetry | Mapping coverage [metrics](/glossary/metrics/) and gap trend tracking |
| [AIAD](/glossary/aiad/) [Registry](/glossary/registry-otp/) | Color team agent capability and coverage registry |
| [SEADF](/glossary/seadf/) Pipeline | Mapping quality assessment within epistemic evolution cycles |

## Enforcement

All mapping operations comply with the [NO MERCY](/glossary/no-mercy/) doctrine -- mappings without evidence-based coverage assessments are rejected, and gap reports are never suppressed regardless of how unfavorable the coverage picture may be. The [NABLA Infinity](/glossary/nabla-infinity/) signal plurality axiom requires that mapping assessments draw on multiple evidence types (technical analysis, test results, architectural review) rather than relying on a single assessment methodology. The [Trinity Gate](/glossary/trinity-gate/) validates critical mapping determinations through structural consistency (mapping graph is acyclic and well-formed), logical consistency (coverage assessments are internally coherent), and formal necessity (gap conclusions follow from the mapping data).

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)