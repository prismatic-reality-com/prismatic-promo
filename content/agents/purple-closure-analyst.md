+++
title = "purple-closure-analyst"
weight = 318
[extra]
domain = "epistemic-synthesis"
level = "L4"
description = "Evaluates whether Red findings have been adequately addressed by Blue defenses. Manages the closure state machine with four states: OPEN, PARTIAL, CLOSED, FALSE_CLOSURE. Perform..."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["nabla-infinity", "trinity-gate", "3nl", "aiad", "color-teams", "lean4", "property-based-testing", "no-doubts", "seadf", "telemetry"]
domain_normalized = "epistemic"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2200
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["purple-closure-analyst", "Evaluates", "Blue", "Manages", "OPEN", "PARTIAL", "CLOSED", "agents", "agent", "Prismatic Platform"]
tags = ["agents", "agent", "purple-closure-analyst", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "purple-closure-analyst - Prismatic Platform"
+++

## Overview

The purple-closure-analyst operates as an L4 Domain Authority within the Prismatic Platform's epistemic-synthesis domain, serving as the sole authority for evaluating whether [Red](/teams/red/) team adversarial findings have been adequately addressed by [Blue](/teams/blue/) team defensive measures. This agent manages the closure state machine -- the formal mechanism that tracks the lifecycle of every epistemic finding from initial discovery through defensive response to verified resolution or identified false closure. Without the purple-closure-analyst's verification, no finding can transition to the CLOSED state, ensuring that the platform never prematurely declares a vulnerability resolved while the underlying risk persists.

The agent implements a four-state closure machine (OPEN, PARTIAL, CLOSED, FALSE_CLOSURE) governed by strict transition conditions that prevent both premature closure and indefinite deferral. Operating under the [NABLA Infinity](/glossary/nabla-infinity/) framework and the [NO DOUBTS](/glossary/no-doubts/) doctrine, closure decisions are based exclusively on measured evidence -- defensive coverage metrics, regression test results, and formal verification proofs -- never on subjective assessment or time-based expiration. The agent's most critical function is detecting false closure: situations where a finding appears resolved but the defensive measure is incomplete, incorrectly targeted, or vulnerable to variant attacks.

## Closure State Machine

The four-state closure machine models the complete lifecycle of adversarial findings within the [color team](/glossary/color-teams/) security framework.

**OPEN** is the initial state assigned to every new Red team finding. An OPEN finding indicates that an adversarial scenario has been identified, documented, and communicated to the Blue team, but no defensive response has been validated. OPEN findings carry urgency classifications (critical, high, medium, low) that influence Blue team prioritization. Findings remain OPEN until the closure analyst receives and validates a defensive response.

**PARTIAL** indicates that a defensive response has been submitted but does not fully address the finding. The closure analyst transitions findings to PARTIAL when the defensive measure addresses some but not all attack vectors identified in the Red finding, or when the defense is correct but lacks sufficient test coverage to confirm effectiveness. PARTIAL findings include specific gap descriptions identifying what additional defensive work is required.

**CLOSED** represents verified resolution. A finding transitions to CLOSED only when four conditions are simultaneously satisfied: (1) the defensive measure addresses all identified attack vectors, (2) regression tests exist that would detect reintroduction of the vulnerability, (3) the defense has been verified through independent testing (not self-assessed by the implementing team), and (4) the [Trinity Gate](/glossary/trinity-gate/) validation confirms structural, logical, and formal consistency of the closure evidence. CLOSED is the only terminal state, and even CLOSED findings are subject to regression monitoring by the [purple-regression-guard](/agents/purple-regression-guard/).

**FALSE_CLOSURE** is the most critical state, indicating that a finding was previously transitioned toward closure but the closure analyst has determined that the resolution is inadequate. FALSE_CLOSURE can be triggered by several conditions: the defensive measure does not actually mitigate the attack (incorrect fix), the defense is bypassable through a variant attack vector, regression tests are insufficient to detect reintroduction, or the evidence supporting closure has been invalidated. FALSE_CLOSURE findings receive elevated priority and require a complete new defensive response.

## Closure Evaluation Methodology

The purple-closure-analyst applies a structured evaluation methodology to every closure request, implementing the [NO DOUBTS](/glossary/no-doubts/) principle through systematic evidence examination.

**Attack Vector Coverage Analysis** compares the set of attack vectors identified in the original Red finding against the attack vectors addressed by the proposed defense. The analyst decomposes each Red finding into individual attack vectors and verifies that the defense provides mitigation for each one. Missing coverage on any vector prevents transition to CLOSED.

**Regression Test Adequacy** evaluates whether the defensive tests would detect reintroduction of the vulnerability if the defense were accidentally removed or degraded. The analyst assesses test specificity (does the test target the actual vulnerability?), sensitivity (would the test fail if the defense were weakened?), and independence (is the test decoupled from implementation details that might change?). Tests that are too tightly coupled to implementation or too loosely coupled to the vulnerability are flagged as inadequate.

**Independent Verification** confirms that closure evidence comes from a source independent of the team that implemented the defense. Self-certification is explicitly prohibited -- the Blue team cannot validate its own defensive measures. The closure analyst coordinates with [White team](/glossary/color-teams/) verification agents when formal proof is required.

**Variant Analysis** assesses whether the defense is robust against variations of the original attack. The analyst applies mutation testing principles to the attack vector: if small modifications to the attack parameters could bypass the defense, the defense is considered incomplete. This prevents the common failure mode where a defense addresses the specific attack demonstrated by the Red team but fails against structurally similar attacks.

## False Closure Detection

Detecting false closure is the agent's highest-value capability, preventing the dangerous condition where the system believes a vulnerability is resolved while it remains exploitable.

The analyst maintains a taxonomy of common false closure patterns: fixes that address symptoms rather than root causes, defenses that work in testing but fail under production conditions, mitigations that block one attack path while leaving equivalent paths open, and test suites that pass through coincidence rather than genuine coverage. Each closure evaluation is cross-referenced against these patterns.

Historical false closure data informs the analyst's evaluation priorities. Findings in domains that have previously exhibited false closure receive heightened scrutiny. Teams that have historically produced inadequate defenses trigger additional verification requirements.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/purple closure-status` | Display all findings with their current closure states | L4+ |
| `/purple evaluate` | Trigger closure evaluation for a specific finding | L4+ |
| `/purple false-closure` | List all findings in FALSE_CLOSURE state with analysis | L4+ |
| `/purple metrics` | Display closure pipeline metrics and health indicators | L4+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [purple-coordinator](/agents/purple-coordinator/) | Reports closure status and escalates false closures for strategic response |
| [purple-mapper](/agents/purple-mapper/) | Receives Red-to-Blue mapping data for coverage analysis |
| [purple-regression-guard](/agents/purple-regression-guard/) | Hands off CLOSED findings for ongoing regression monitoring |
| [white-contract-validator](/agents/white-contract-validator/) | Requests formal verification for critical closure evaluations |

## Integration Architecture

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Runtime execution and lifecycle management |
| Prismatic Telemetry | Closure pipeline [metrics](/glossary/metrics/) and state transition tracking |
| [AIAD](/glossary/aiad/) [Registry](/glossary/registry-otp/) | Agent specification and color team coordination |
| [SEADF](/glossary/seadf/) Pipeline | Closure quality assessment within epistemic evolution cycles |
| [Trinity Gate](/glossary/trinity-gate/) | Three-layer validation for closure evidence verification |

## Enforcement

Closure decisions are governed by the [NO MERCY](/glossary/no-mercy/) doctrine with absolute zero tolerance for premature or unverified closure. No finding transitions to CLOSED without satisfying all four closure conditions. Self-certification is prohibited -- defensive teams cannot validate their own work. The [NABLA Infinity](/glossary/nabla-infinity/) provenance axiom requires that every closure decision includes the complete evidence chain supporting the determination. False closures that are detected after the fact trigger immediate investigation and are tracked as epistemic failure metrics that inform future closure evaluation rigor.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)