+++
title = "Prismatic for Security & Risk"
weight = 4

[extra]
description = "Color Teams in your IDE -- adversarial simulation, epistemic defense, formal proofs, and audit trails for every security decision."
audience = "security"
difficulty = "advanced"
glossary_terms = ["color-teams", "red-team", "blue-team", "purple-team", "gray-team", "white-team", "black-team", "easm"]
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
word_count = 1794
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Security", "Risk", "Color", "Teams", "about", "Prismatic Platform", "Agent", "Blue", "Operational Specialist"]
tags = ["about", "prismatic-for-security--risk", "prismatic"]
quality_score = 82
see_also = ["capabilities", "architecture", "teams"]
image = "/images/sections/about.png"
image_alt = "Prismatic for Security & Risk - Prismatic Platform"
+++

## Color Teams That Never Sleep

Most organizations run penetration tests quarterly. Some run them monthly. A few exceptional teams run continuous red-blue exercises. Prismatic runs **6 color teams with 20 specialized agents continuously** -- not as a separate security engagement, but as an integrated part of the development process.

These are not token scanners or vulnerability databases with a team-colored label. Each team has a distinct epistemic function in a structured signal flow that produces formally verified security conclusions.

## The Six Teams

### Gray Team -- Boundary Exploration (3 agents)

The [Gray Team](@/glossary/gray-team.md) is the starting point. It explores specification gaps, edge cases, and affordance drift -- the gradual expansion of how a system is used beyond its original design intent.

| Agent | Role | Function |
|-------|------|----------|
| `gray-explorer-commander` | L3 Strategic Commander | Orchestrates Gray campaigns, routes findings to Red/Blue/Purple |
| `gray-edge-finder` | L4 Specialist | Boundary value analysis, specification gap identification |
| `gray-escalation-guard` | L4 Safety-Critical | Prevents Gray-to-Black escalation, override authority to halt any Gray operation |

Gray Team operates in **read-only mode**. It identifies ambiguity without resolving it. It surfaces questions without answering them. This is deliberate: premature resolution of ambiguity is one of the most common sources of security vulnerabilities. By keeping ambiguity visible, Gray Team ensures that downstream teams (Red, Blue, Purple) work with the full picture.

The `gray-escalation-guard` deserves special attention. It monitors all Gray Team operations and has override authority to immediately halt any operation that approaches Black Team territory (theoretical threat modeling). This prevents exploratory boundary analysis from inadvertently producing weapizable insights.

### Red Team -- Adversarial Simulation (4 agents)

The [Red Team](@/glossary/red-team.md) simulates epistemic attacks using five attack primitives:

1. **Truth Distortion**: Manipulating the accuracy of signals entering the epistemic pipeline
2. **Confidence Manipulation**: Artificially inflating or deflating confidence scores
3. **Signal Poisoning**: Injecting false signals to corrupt evidence formation
4. **Drift Induction**: Gradually shifting system behavior below detection thresholds
5. **Salience Hijacking**: Drawing attention to irrelevant signals to mask critical ones

| Agent | Role | Function |
|-------|------|----------|
| `red-commander` | L3 Strategic Commander | Orchestrates adversarial scenarios, emits findings to Purple/Blue |
| `red-epistemic-attacker` | L2 Tactical Specialist | Truth distortion and source poisoning simulation |
| `red-drift-inducer` | L2 Tactical Specialist | Sub-threshold drift attacks, cascade propagation analysis |
| `red-scenario-generator` | L2 Tactical Specialist | Composes multi-technique scenarios from 329-entry taxonomy |

All Red Team operations execute in `PrismaticDark.Sandbox`. No real data. No production state. No network access. The `red-scenario-generator` draws from a taxonomy of 329 documented attack scenarios, composing multi-technique attacks that test the platform's epistemic defenses under realistic conditions.

### Blue Team -- Epistemic Defense (4 agents)

The [Blue Team](@/glossary/blue-team.md) synthesizes defensive evidence. It does not produce alerts or notifications -- it produces **structured evidence** grounded in NABLA axioms.

| Agent | Role | Function |
|-------|------|----------|
| `blue-commander` | L3 Strategic Commander | Synthesizes evidence from specialists into unified defensive posture |
| `blue-auth-sentinel` | L2 Operational Specialist | Authentication boundary monitoring, privilege escalation detection |
| `blue-drift-detector` | L2 Operational Specialist | Behavioral, configuration, dependency, and performance drift detection |
| `blue-signal-aggregator` | L2 Operational Specialist | Cross-domain signal correlation with NABLA plurality enforcement |

The `blue-signal-aggregator` is architecturally significant. It correlates signals across domains -- a configuration change in one application combined with a behavioral change in another might be benign individually but concerning together. The aggregator enforces NABLA signal plurality: no security conclusion is based on a single signal. Minimum two independent sources are required.

The `blue-drift-detector` monitors four drift dimensions continuously:

- **Behavioral drift**: Agent behavior deviating from AIAD specifications
- **Configuration drift**: Parameters changing from recorded baselines
- **Dependency drift**: Undeclared or circular dependencies appearing
- **Performance drift**: Gradual degradation in key operation metrics

### Purple Team -- Synthesis & Closure (4 agents)

The [Purple Team](@/glossary/purple-team.md) is the central hub. Its function: close the loop between Red and Blue, and determine when a security concern is genuinely resolved versus merely suppressed.

| Agent | Role | Function |
|-------|------|----------|
| `purple-coordinator` | L3 Strategic Commander | Synthesis hub, closure authority, anti-metric enforcement |
| `purple-mapper` | L4 Operational Specialist | Bidirectional mapping: Red findings to Blue defenses |
| `purple-closure-analyst` | L4 Operational Specialist | 4-condition closure evaluation, false closure detection |
| `purple-regression-guard` | L4 Safety-Critical | Regression trap management, deployment gate enforcement |

The `purple-closure-analyst` evaluates four conditions before declaring a security concern closed:

1. The Red Team's attack scenario has been reproduced and understood
2. The Blue Team's defense demonstrably addresses the attack
3. The defense does not introduce new attack surfaces
4. The defense is robust under variations (Monte Carlo testing via QEVE)

False closure detection is critical. A security concern that appears resolved but is actually suppressed (the symptoms are hidden but the root cause persists) is worse than an unresolved concern -- because it provides false confidence. The closure analyst specifically looks for this pattern.

The `purple-regression-guard` prevents a closed security concern from re-emerging after system changes. It maintains regression traps: automated checks that detect if a resolved vulnerability is inadvertently reintroduced by later modifications.

### White Team -- Constructive Verification (3 agents)

The [White Team](@/glossary/white-team.md) proves that systems hold. Not "tests indicate they probably hold" -- **proves**, using progressive methodology from basic property testing to full Lean4 formal proofs.

| Agent | Role | Function |
|-------|------|----------|
| `white-verifier-commander` | L3 Strategic Commander | Orchestrates verification campaigns, composite proof construction |
| `white-contract-validator` | L4 Operational Specialist | Interface contract testing, behavior/protocol/API validation |
| `white-invariant-prover` | L4 Operational Specialist | Property-based testing, formal Lean4 proofs, fault injection analysis |

The verification progression follows 6 levels:

- **L0**: Basic property-based testing (QuickCheck-style)
- **L1**: Contract testing (does the implementation match the specification?)
- **L2**: Invariant testing (do the invariants hold under all observed conditions?)
- **L3**: Boundary proof (do the invariants hold at boundary conditions?)
- **L4**: Formal specification in Lean4
- **L5**: Full formal proof in Lean4 with completeness verification

Not every security property requires L5 proof. The verification level is determined by the criticality of the property. Authentication invariants get L5. Logging format consistency gets L1. The resource allocation is proportional to the risk.

All White Team output passes through the [Trinity Gate](@/glossary/trinity-gate.md). A proof is not accepted until it satisfies structural consistency, logical consistency, and formal necessity.

### Black Team -- Theoretical Threat Modeling (2 agents)

The [Black Team](@/glossary/black-team.md) operates under **maximum isolation**. It models theoretical worst-case adversarial optimization -- what would a sophisticated, motivated attacker do with unlimited resources and deep system knowledge?

| Agent | Role | Function |
|-------|------|----------|
| `black-theorist-commander` | L3 Strategic Commander (ISOLATED) | Abstract threat models, malicious optimization analysis |
| `black-abstraction-enforcer` | L3 Safety-Critical (ISOLATED) | L1-L4 output abstraction enforcement, executable content detection |

Black Team produces **abstract threat models only**. Never executable content. Never specific exploit instructions. Never concrete attack code. The `black-abstraction-enforcer` monitors all output and filters it through a 4-level abstraction filter (L1-L4). Any output that approaches executable specificity is blocked.

This team exists because understanding worst-case scenarios is essential for effective defense, but producing exploitable outputs is irresponsible. The abstraction enforcer ensures the line is never crossed.

## Signal Flow Architecture

The six teams do not operate in isolation. They form a structured signal flow:

```
Gray (boundary seeds)
    |
    +---> Red (adversarial scenarios)
    |         |
    |         +---> Purple (synthesis & closure)
    |         |         |
    |         |         +---> Blue (defense evidence)
    |         |         |         |
    |         |         |         +---> Platform Defense
    |         |         |
    |         |         +---> White (formal proofs)
    |         |
    +---> Blue (direct boundary evidence)
    |
Black (threat models) ---> Purple (abstract threat context)
```

Gray discovers boundaries. Red translates boundaries into adversarial scenarios. Purple maps Red findings to Blue defenses. Blue synthesizes defensive evidence. White proves the defenses are correct. Black provides abstract threat context that informs Red's scenario design without producing anything executable.

This is not a one-shot process. It runs continuously. New code, new configurations, new dependencies -- all trigger re-evaluation through the signal flow.

## EASM: External Attack Surface Management

Prismatic includes a dedicated [EASM](@/glossary/easm.md) capability through the Prismatic Perimeter module. This provides:

### Asset Discovery

Continuous discovery of externally exposed assets:

- **Domains**: DNS enumeration, subdomain discovery, zone transfer analysis
- **IP Addresses**: Port scanning, service identification, banner grabbing
- **Certificates**: Certificate Transparency log monitoring, expiration tracking
- **Cloud Resources**: S3 buckets, Azure blobs, GCP storage, CDN endpoints
- **Services**: API endpoints, web applications, email servers

### Security Ratings

Evidence-based security ratings from A (excellent) to F (critical), with numeric scores from 300 to 900:

```elixir
{:ok, rating} = PrismaticPerimeter.security_rating("example.com")
# => %{grade: :B, score: 780, industry_percentile: 72}
```

Each rating comes with a complete evidence chain: which assets were discovered, which vulnerabilities were assessed, what scoring methodology was applied, and what confidence level the rating carries. An auditor can trace the grade back to individual signals.

### Compliance Assessment

Built-in assessment against NIS2 (EU 2022/2555) and ZKB (264/2025 Sb.):

```elixir
{:ok, assessment} = PrismaticPerimeter.assess_compliance("example.com", [:nis2, :zkb])
```

The compliance assessment maps technical findings to regulatory requirements, identifying gaps with specific remediation guidance.

## Safety Protocols

Security tooling that is itself insecure defeats its purpose. Prismatic enforces strict safety protocols across all Color Team operations:

| Protocol | Enforcement |
|----------|-------------|
| **Sandbox Isolation** | All Red/Black operations execute in `PrismaticDark.Sandbox` only |
| **Synthetic Data Only** | No real data, no PII, no production state in any simulation |
| **No Network Access** | Zero network connectivity for Red/Black operations |
| **Ethics Checks** | Automated validation every 10-15 seconds across all teams |
| **Escalation Guards** | Gray Escalation Guard and Black Abstraction Enforcer prevent scope creep |
| **Audit Logging** | Immutable audit trail for every operation across all teams |
| **No Executable Output** | Black domain never produces executable code or exploit instructions |
| **Abstraction Filtering** | All Black output filtered through L1-L4 AbstractionFilter |

These are not configurable. They are structural constraints enforced at the architecture level. You cannot disable sandbox isolation any more than you can disable the BEAM scheduler.

## QEVE for Security Decisions

When Prismatic makes a security decision, the result is not "probably risky" or "high confidence." It is a formally verified conclusion with quantified robustness:

The [QEVE](@/glossary/qeve.md) pipeline for security decisions:

1. **Evidence Gathering**: Multi-source signal collection (Color Team findings, EASM results, drift detection, external feeds)
2. **Hypothesis Formation**: Candidate security conclusions generated from evidence
3. **Formal Verification**: Critical hypotheses verified through Lean4 proofs
4. **Robustness Testing**: Monte Carlo sampling tests sensitivity to evidence variations
5. **Trinity Gate Validation**: Three-layer verification before conclusion is established

The output includes:

- The conclusion (e.g., "the authentication boundary is sound")
- The confidence level with uncertainty bounds
- The complete evidence chain
- The formal proof artifacts (for L4+ verification)
- The robustness assessment (sensitivity to evidence variations)
- The provenance trail (which signals, sources, and transformations produced this conclusion)

This is the difference between a vulnerability scanner that says "HIGH RISK" and a verification engine that says "the authentication boundary is sound, verified through Lean4 proof with 97% robustness under evidence variation, based on 14 independent signals from 6 sources, with complete provenance chain available for audit."

## For Security Professionals

If you are evaluating Prismatic from a security perspective, here is what matters:

1. **The adversarial testing is continuous.** Not quarterly. Not monthly. Continuous. Every code change triggers re-evaluation through the Color Team signal flow.

2. **The proofs are formal.** White Team produces Lean4 proofs for critical security properties. These are independently verifiable mathematical proofs, not test results.

3. **The attack surface is monitored.** EASM discovers exposed assets as they appear, not when someone runs a scan.

4. **The audit trail is immutable.** Every security decision, every Color Team operation, every rating change is logged with provenance.

5. **The safety protocols are structural.** Sandbox isolation, synthetic data requirements, and abstraction filtering are architecture constraints, not configuration options.

6. **The AI is governed.** 20 security agents operate within formal AIAD specifications with defined authority levels and behavioral contracts. No uncontrolled AI making security decisions.

## Next Steps

- [QEVE Deep Dive](@/about/qeve-deep-dive.md) -- Technical architecture of the verification engine
- [For Executives](@/about/for-executives.md) -- Business case and compliance readiness
- [For Architects](@/about/for-architects.md) -- The epistemic pipeline and drift detection architecture
- [Color Teams](@/teams/_index.md) -- Full documentation of all 6 teams
- [Glossary: EASM](@/glossary/easm.md) -- External Attack Surface Management explained
- [Glossary: Color Teams](@/glossary/color-teams.md) -- Team definitions and protocols

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)