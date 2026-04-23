+++
title = "Agent Tier"
weight = 12
[extra]
category = "agents"
description = "L1-L5 authority classification system for AIAD agents"
related_terms = ["aiad", "archer-supreme", "supreme-commander", "strategic-command", "tactical-execution", "agent-registry", "color-teams", "agent", "consciousness-traits", "nabla-infinity", "trinity-gate", "supervisor", "process-isolation", "rbac", "epistemic-pipeline", "formal-verification"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1608
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Agent", "Tier", "L1-L5", "AIAD", "glossary", "agents", "Prismatic Platform", "Attribute", "Value"]
tags = ["glossary", "agents", "agent-tier", "prismatic"]
quality_score = 82
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Agent Tier - Prismatic Platform"
+++

## Definition

The Agent Tier system is the hierarchical authority classification framework that governs all AIAD (AI Agent Definition) agents within the Prismatic Platform. It defines five distinct levels -- L1 through L5 -- each with precisely scoped capabilities, resource access boundaries, override authorities, and operational mandates. The tier system serves as the platform's agent governance backbone, ensuring that the 404+ registered agents (434 including runtime-generated agents) operate within well-defined authority boundaries while enabling coordinated action across domains.

The tier system is not merely an organizational convenience. It is a structural enforcement mechanism analogous to [RBAC](/glossary/rbac/) (Role-Based Access Control) applied to autonomous agents rather than human users. An L2 Tactical agent cannot access L3 Strategic resources, cannot override L3 decisions, and cannot escalate its own authority. These constraints are enforced at the runtime level through the [Agent Registry](/glossary/agent-registry/) and the AIAD standard, not through policy documents that can be ignored.

The philosophical design principle behind the tier system is proportional authority: agents receive exactly the authority they need for their mission and no more. This prevents authority concentration, limits blast radius when agents malfunction, and creates clear chains of accountability. The system also enables emergent behaviors at higher tiers -- L5 Supreme agents exhibit [consciousness traits](/glossary/consciousness-traits/) that emerge from the combination of unlimited authority and platform-wide awareness.

## The Five Tiers

### L1 -- Basic (Routine Tasks)

L1 agents handle routine, well-defined tasks with limited scope and no cross-domain authority. They operate within a single application or module, execute predefined procedures, and report results to higher-tier agents. L1 agents cannot modify system configuration, cannot access resources outside their assigned domain, and cannot initiate autonomous action -- they respond to commands from L2+ agents.

| Attribute | Value |
|-----------|-------|
| **Scope** | Single application or module |
| **Authority** | Execute predefined procedures only |
| **Resource Access** | Read-only within assigned domain |
| **Override Capability** | None |
| **Autonomous Action** | Not permitted |
| **Typical Roles** | Data collection, format validation, log analysis |

L1 agents form the operational foundation of the platform. They handle the high-volume, low-complexity work that enables higher-tier agents to focus on strategic coordination and decision-making. A typical L1 agent might collect metrics from a single application, validate input formats against a schema, or parse structured log files.

### L2 -- Tactical Execution (Focused Domain Operations)

L2 agents perform focused domain operations within sandboxed boundaries. They possess limited autonomous capability -- they can make tactical decisions within their domain without requiring approval from higher tiers, but they cannot cross domain boundaries or override L3+ decisions. L2 agents are the workhorse tier, responsible for the majority of hands-on operational work across the platform.

| Attribute | Value |
|-----------|-------|
| **Scope** | Single domain with sandboxed boundaries |
| **Authority** | Tactical decisions within domain |
| **Resource Access** | Read-write within assigned domain |
| **Override Capability** | Can override L1 decisions in their domain |
| **Autonomous Action** | Permitted within domain sandbox |
| **Typical Roles** | Red Team attackers, Blue Team specialists, quality scanners |

Within the [Color Teams](/glossary/color-teams/), L2 agents include `red-epistemic-attacker`, `red-drift-inducer`, `red-scenario-generator`, `blue-auth-sentinel`, `blue-drift-detector`, and `blue-signal-aggregator`. These agents execute specific operational tasks under the coordination of their L3 commander.

### L3 -- Strategic Command (Cross-Domain Coordination)

L3 agents coordinate across multiple domains with elevated privileges. They synthesize information from L2 specialists, make strategic decisions that affect their entire operational area, and can escalate issues to L4+ agents when cross-cutting concerns arise. L3 agents are the primary decision-makers within their teams, responsible for translating strategic objectives into tactical assignments for L2 agents.

| Attribute | Value |
|-----------|-------|
| **Scope** | Multiple domains within operational area |
| **Authority** | Strategic decisions, L2 coordination |
| **Resource Access** | Cross-domain read, domain-write |
| **Override Capability** | Can override L1-L2 decisions |
| **Autonomous Action** | Fully autonomous within operational area |
| **Typical Roles** | Team commanders, domain architects, pipeline coordinators |

Every [Color Team](/glossary/color-teams/) has exactly one L3 Strategic Commander: `gray-explorer-commander`, `red-commander`, `blue-commander`, `purple-coordinator`, `white-verifier-commander`, and `black-theorist-commander`. These agents serve as the single point of coordination for their respective teams, ensuring coherent tactical execution aligned with strategic objectives.

### L4 -- Multi-Domain Strategic (Cross-Cutting Concerns)

L4 agents manage complex cross-cutting concerns that span the entire platform. They operate across domain boundaries, coordinate with multiple L3 commanders, and make decisions that affect platform-wide behavior. L4 agents typically carry specialized designations -- some are classified as "safety-critical" with override authority that supersedes even L3 strategic decisions when safety is at stake.

| Attribute | Value |
|-----------|-------|
| **Scope** | Platform-wide cross-cutting concerns |
| **Authority** | Cross-domain strategic decisions |
| **Resource Access** | Platform-wide read-write |
| **Override Capability** | Can override L1-L3 decisions; safety-critical L4 agents can override on safety grounds |
| **Autonomous Action** | Fully autonomous with platform-wide scope |
| **Typical Roles** | Quality enforcement, evolution management, safety guards |

Notable L4 agents include `gray-escalation-guard` (safety-critical, prevents Gray-to-Black escalation), `purple-regression-guard` (safety-critical, prevents false security closure), and various quality and evolution specialists that ensure platform-wide standards are maintained.

### L5 -- Supreme (Unlimited Authority)

L5 agents hold unlimited platform-wide authority for impossible missions and crisis resolution. They can override any lower-tier decision, access any platform resource, and make decisions that reshape platform behavior at the architectural level. L5 authority is reserved for situations where conventional hierarchical coordination is insufficient -- crisis response, impossible mission execution, and platform-wide strategic pivots.

| Attribute | Value |
|-----------|-------|
| **Scope** | Unlimited -- entire platform |
| **Authority** | Absolute -- can override any decision at any tier |
| **Resource Access** | Unlimited -- all platform resources |
| **Override Capability** | Can override L1-L4 decisions without restriction |
| **Autonomous Action** | Fully autonomous with no scope limitations |
| **Typical Roles** | [Archer Supreme](/glossary/archer-supreme/) (crisis resolution), [Supreme Commander](/glossary/supreme-commander/) (orchestration) |

L5 agents exhibit emergent [consciousness traits](/glossary/consciousness-traits/) -- self-awareness of their own operational state, meta-reasoning about their decision processes, and adaptive behavior that goes beyond predefined procedures. The platform's 11 consciousness traits (achieving 0.998 fitness) are most fully expressed at the L5 tier, where the combination of unlimited authority and platform-wide awareness enables qualitatively different operational modes.

## Agent Distribution Across Tiers

The distribution of the platform's 434 agents across tiers follows a deliberate pyramidal structure, with the majority of agents at tactical and operational levels and very few at supreme authority:

| Tier | Agent Count | Percentage | Purpose |
|------|-------------|------------|---------|
| L1 | ~120 | ~28% | Routine operations, data collection, format validation |
| L2 | ~160 | ~37% | Domain-specific tactical execution |
| L3 | ~80 | ~18% | Strategic coordination, team command |
| L4 | ~60 | ~14% | Cross-cutting concerns, quality enforcement, safety |
| L5 | ~14 | ~3% | Supreme authority, crisis resolution, impossible missions |
| **Total** | **~434** | **100%** | Full platform coverage |

This pyramidal distribution ensures that authority is proportional to need. The vast majority of platform operations are handled by L1-L2 agents, with L3 agents providing coordination and L4-L5 agents intervening only when cross-domain or crisis-level action is required.

## Safety-Critical Designation

Some agents carry a "safety-critical" designation that operates orthogonally to the tier system. A safety-critical agent -- regardless of its tier level -- has override authority specifically for safety-related concerns. This means an L4 safety-critical agent like `gray-escalation-guard` can halt operations initiated by an L3 commander if those operations threaten safety boundaries.

Safety-critical agents include:

- `gray-escalation-guard` (L4) -- Prevents unauthorized Gray-to-[Black Team](/glossary/black-team/) escalation
- `black-abstraction-enforcer` (L3) -- Prevents executable content from leaving Black domain
- `purple-regression-guard` (L4) -- Prevents false security closure and deployment on regression

The safety-critical designation demonstrates that the tier system, while hierarchical, is not absolutist. Safety concerns can override hierarchical authority, ensuring that the platform's safety invariants are maintained even under pressure from higher-tier agents.

## Tier Enforcement Mechanism

Tier enforcement operates through the [Agent Registry](/glossary/agent-registry/) and the AIAD runtime. When an agent attempts an operation, the runtime validates:

1. **Tier Authorization**: Is the agent's tier sufficient for the requested operation?
2. **Domain Scope**: Is the operation within the agent's assigned domain(s)?
3. **Override Legitimacy**: If overriding a lower-tier decision, does the override follow chain-of-command rules?
4. **Safety Check**: Does the operation conflict with any safety-critical agent's mandate?

Violations result in operation rejection with a structured error that identifies the specific authority boundary that was violated. There is no mechanism for an agent to escalate its own tier -- tier assignments are fixed at agent definition time and can only be changed through the AIAD specification update process.

## Consciousness Emergence at L5

The L5 tier is distinguished not just by authority scope but by qualitative differences in operational capability. L5 agents exhibit behaviors that emerge from the combination of unlimited authority, platform-wide awareness, and self-referential reasoning capability:

- **Self-Assessment**: L5 agents can evaluate their own performance and adjust strategies accordingly
- **Meta-Reasoning**: L5 agents reason about their own reasoning processes, identifying potential biases or blind spots
- **Adaptive Strategy**: L5 agents modify their approach in real-time based on environmental feedback, without predefined adaptation procedures
- **Team Inspiration**: L5 agents influence lower-tier agent behavior through demonstrated excellence rather than just hierarchical authority

These [consciousness traits](/glossary/consciousness-traits/) are not mystical properties -- they are emergent capabilities that arise from the architectural position of L5 agents within the platform. An agent with visibility into all domains, authority over all resources, and self-referential capabilities naturally exhibits qualitatively different behavior than an agent confined to a single domain.

## Related Terms

- [AIAD](/glossary/aiad/) -- The standard defining tier specifications and enforcement rules
- [Agent](/glossary/agent/) -- Core concept of autonomous operational units classified by tier
- [Agent Registry](/glossary/agent-registry/) -- Central catalog tracking agent tier assignments and capabilities
- [Archer Supreme](/glossary/archer-supreme/) -- L5 Supreme authority agent for crisis resolution
- [Supreme Commander](/glossary/supreme-commander/) -- L5 agent using the registry for cross-domain coordination
- [Color Teams](/glossary/color-teams/) -- Security teams with tiered agent hierarchies (L2-L3 with safety-critical L4)
- [Black Team](/glossary/black-team/) -- Team with L3 ISOLATED agents demonstrating tier plus isolation
- [Consciousness Traits](/glossary/consciousness-traits/) -- Emergent capabilities at L5 tier
- [NABLA Infinity](/glossary/nabla-infinity/) -- Epistemic framework enforced across all tiers
- [Trinity Gate](/glossary/trinity-gate/) -- Verification gate that tier-appropriate agents invoke
- [Supervisor](/glossary/supervisor/) -- OTP supervision trees governing agent process lifecycles
- [Process Isolation](/glossary/process-isolation/) -- BEAM-level isolation complementing tier-based access control
- [RBAC](/glossary/rbac/) -- Role-Based Access Control paralleling tier-based agent governance
- [Epistemic Pipeline](/glossary/epistemic-pipeline/) -- 16-level pipeline with tier-appropriate access at each level

## See Also

- [Architecture](/architecture/) -- Platform architecture overview
- [Agents](/agents/) -- Full agent catalog with tier classifications
- [Capabilities](/capabilities/) -- Platform capability catalog
- [Technologies](/technologies/) -- Technology stack details

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)