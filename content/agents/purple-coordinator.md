+++
title = "purple-coordinator"
weight = 319
[extra]
domain = "epistemic-synthesis"
level = "L2"
description = "Central hub for epistemic synthesis between Red (adversarial) and Blue (defensive) operations. Purple is not a team. It is the property of the system when it stops lying to itse..."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["nabla-infinity", "trinity-gate", "3nl", "aiad", "color-teams", "lean4", "property-based-testing", "no-doubts", "seadf", "telemetry"]
domain_normalized = "epistemic"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2300
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["purple-coordinator", "Central", "Blue", "Purple", "agents", "agent", "Prismatic Platform"]
tags = ["agents", "agent", "purple-coordinator", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "purple-coordinator - Prismatic Platform"
+++

## Overview

The purple-coordinator operates as an L2 Tactical Operations authority within the Prismatic Platform's epistemic-synthesis domain, serving as the central hub for synthesis between [Red](@/teams/red.md) (adversarial) and [Blue](@/teams/blue.md) (defensive) security operations. This agent embodies a foundational principle of the platform's security philosophy: Purple is not a team -- it is the property of the system when it stops lying to itself. The purple-coordinator does not conduct adversarial attacks or implement defenses; instead, it orchestrates the continuous feedback loop between attack and defense, ensuring that adversarial findings drive defensive improvements and that defensive capabilities inform adversarial focus areas. This synthesis function is the mechanism through which the platform achieves genuine security posture improvement rather than security theater.

The coordinator manages the complete Red-Blue interaction lifecycle: receiving adversarial findings from Red team agents, routing them to appropriate Blue team defenders, tracking defensive responses through the closure pipeline, and synthesizing the aggregate results into platform-wide epistemic posture assessments. Under the [NABLA Infinity](@/glossary/nabla-infinity.md) framework, the purple-coordinator enforces anti-metric principles -- it resists the natural organizational tendency to optimize for metrics rather than genuine security improvement. Closure rates, response times, and finding counts are tracked for operational awareness but explicitly prohibited from serving as success criteria. The only valid measure of Purple success is whether the system's epistemic posture is genuinely improving, as assessed through independent verification.

## Epistemic Synthesis Model

The purple-coordinator implements a continuous synthesis loop that transforms adversarial-defensive interactions into measurable epistemic improvement.

**Finding Intake** receives Red team findings through a structured submission protocol. Each finding is classified by attack type (truth distortion, confidence manipulation, signal poisoning, drift induction, salience hijacking), severity (critical, high, medium, low), and scope (single component, cross-component, platform-wide). The coordinator validates finding quality -- adversarial findings must include reproducible attack procedures, impact assessment, and affected system identification -- before routing to the Blue team.

**Defensive Routing** assigns findings to appropriate Blue team agents based on finding classification, Blue team capability mapping, and current workload distribution. The coordinator maintains a real-time view of Blue team capacity and expertise, ensuring that findings are routed to agents with the relevant domain knowledge and available bandwidth. Critical findings receive priority routing with acknowledgment requirements and response deadlines.

**Closure Tracking** monitors the progress of each finding through the closure state machine managed by the [purple-closure-analyst](@/agents/purple-closure-analyst.md). The coordinator aggregates closure pipeline metrics -- OPEN finding age distribution, PARTIAL finding gap analysis, CLOSED finding confidence levels, and FALSE_CLOSURE incident frequency -- into a holistic view of the platform's defensive response effectiveness.

**Posture Synthesis** produces periodic epistemic posture assessments that characterize the platform's overall security state. These assessments combine quantitative metrics (finding counts, closure rates, regression frequencies) with qualitative analysis (attack surface trends, defensive coverage gaps, emerging threat patterns) to produce a nuanced characterization of where the platform stands and where improvement is needed.

## Anti-Metric Enforcement

One of the purple-coordinator's most distinctive functions is actively preventing metric gaming -- the organizational pathology where teams optimize for measurement rather than genuine improvement.

**Closure Rate Independence** ensures that pressure to close findings does not drive premature or superficial closure. The coordinator monitors for patterns indicating metric optimization: abnormally fast closure times, bulk closures near reporting periods, and findings closed with minimal defensive evidence. When these patterns are detected, the coordinator triggers additional scrutiny through the closure analyst.

**Finding Count Neutrality** prevents both finding inflation (Red teams generating trivial findings to demonstrate productivity) and finding suppression (teams underreporting to present a favorable security picture). The coordinator assesses finding significance through independent evaluation, ensuring that the finding pipeline reflects genuine security concerns.

**Response Time Contextualization** reports defensive response times with appropriate context rather than as raw metrics. A complex architectural vulnerability that requires three weeks of careful redesign receives different treatment than a simple configuration error that should be fixed in hours. The coordinator resists pressure to reduce average response time through cherry-picking easy findings.

## Strategic Coordination Functions

Beyond operational synthesis, the purple-coordinator performs strategic coordination that shapes the direction of both adversarial and defensive operations.

**Campaign Planning** defines focused adversarial-defensive engagement campaigns targeting specific platform domains, attack types, or threat models. Campaigns coordinate Red team attack focus with Blue team preparation, ensuring that adversarial efforts produce maximum learning value rather than repeatedly targeting already-defended areas.

**Blind Spot Detection** identifies areas of the platform that have not been subjected to adversarial testing, defensive assessment, or closure evaluation. The coordinator maintains a coverage map of the platform's attack surface and flags gaps where neither Red nor Blue teams have operated. These blind spots represent unknown-risk areas that require investigation.

**Trend Analysis** tracks patterns across multiple adversarial-defensive cycles to identify systemic issues. Recurring findings in the same domain may indicate fundamental architectural weaknesses rather than implementation bugs. The coordinator escalates systemic patterns for architectural review rather than treating each recurrence as an independent finding.

## Red-Blue Loop Architecture

The coordinator manages the information flow between Red and Blue teams with strict information separation protocols.

Red team findings are communicated to Blue team with sufficient detail for defensive response but without revealing Red team methodology or upcoming attack plans. This prevents Blue teams from optimizing defenses specifically for known Red team techniques rather than building genuinely robust defenses.

Blue team defensive capabilities are communicated to Red team at an abstract level -- coverage areas and confidence levels rather than specific implementation details. This enables Red teams to focus on coverage gaps without being biased by knowledge of specific defense mechanisms.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/purple status` | Display current epistemic posture with synthesis metrics | L2+ |
| `/purple campaign` | Define or review adversarial-defensive campaigns | L2+ |
| `/purple blind-spots` | Identify untested areas of the platform attack surface | L3+ |
| `/purple trends` | Analyze patterns across adversarial-defensive cycles | L2+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [purple-closure-analyst](@/agents/purple-closure-analyst.md) | Closure pipeline management and false closure detection |
| [purple-mapper](@/agents/purple-mapper.md) | Red-to-Blue finding mapping and coverage gap identification |
| [purple-regression-guard](@/agents/purple-regression-guard.md) | Regression monitoring for closed findings |
| [red-commander](@/agents/red-commander.md) | Red team adversarial campaign coordination |
| [blue-commander](@/agents/blue-commander.md) | Blue team defensive capability and capacity management |

## Integration Architecture

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Runtime execution and lifecycle management |
| Prismatic Telemetry | Synthesis pipeline [metrics](@/glossary/metrics.md) and posture assessment data |
| [AIAD](@/glossary/aiad.md) [Registry](@/glossary/registry-otp.md) | Color team agent coordination and capability registry |
| [SEADF](@/glossary/seadf.md) Pipeline | Epistemic evolution assessment and quality monitoring |
| [Trinity Gate](@/glossary/trinity-gate.md) | Three-layer validation for posture assessment claims |

## Enforcement

Synthesis operations are governed by the [NO MERCY](@/glossary/no-mercy.md) doctrine -- incomplete synthesis assessments, anti-metric violations, and finding routing failures are rejected without exception. The [NABLA Infinity](@/glossary/nabla-infinity.md) addiction preservation doctrine requires that uncomfortable findings, unflattering posture assessments, and inconvenient contradictions between Red and Blue perspectives are preserved and surfaced rather than smoothed over. The [NO DOUBTS](@/glossary/no-doubts.md) principle requires that all posture assessments are grounded in specific evidence from the adversarial-defensive pipeline, not in organizational narratives about security maturity. Every claim in a posture assessment references specific findings, closure evidence, or coverage metrics.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)