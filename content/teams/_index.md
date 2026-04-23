+++
title = "Color Teams"
description = "Six color-coded security teams with 20 specialized agents providing adversarial-defensive epistemic security through simulation-based threat modeling"
sort_by = "weight"
template = "teams/list.html"
page_template = "teams/detail.html"

[extra]
author = "Tomas Korcak (korczis)"
reading_time = "17 min"
word_count = 2700
difficulty = "advanced"
image = "/images/sections/teams.png"
image_alt = "Prismatic Platform color team security architecture"
og_type = "article"
twitter_card = "summary_large_image"
academic_tier = "whitepaper"
content_version = "2.0.0"
last_enhanced = "2026-02-06"
quality_score = 95
related_articles = ["red-team", "blue-team", "purple-team"]
glossary_terms = ["epistemic-security", "adversarial-simulation", "NABLA", "Trinity-Gate"]
keywords = ["color team security operations", "adversarial-defensive synthesis", "red team epistemic attacks", "blue team defense posture", "purple team synthesis closure", "security simulation framework", "threat modeling agents", "epistemic security architecture"]
tags = ["security", "color-teams", "adversarial", "defense", "simulation"]
see_also = ["agents", "capabilities", "architecture"]
total_teams = 6
total_agents = 20
date_modified = "2026-02-23"
+++

Six color-coded [security teams](@/glossary/color-teams.md) with 20 specialized [agents](@/glossary/agent.md) implement [adversarial-defensive](@/glossary/adversarial-architecture.md) [epistemic security](@/glossary/epistemic-robustness.md) through simulation-based [threat modeling](@/glossary/threat-intelligence.md), [formal verification](@/glossary/formal-verification.md), and continuous synthesis. Every operation executes in [sandboxed](@/glossary/process-isolation.md) environments with synthetic data only -- no production access, no real data, no network connectivity for adversarial operations.

<!-- more -->

## Abstract

The Prismatic Platform's color team architecture implements epistemic security through adversarial-defensive synthesis: a coordinated system of six specialized teams comprising 20 autonomous agents that continuously probe, defend, verify, and synthesize the platform's cognitive integrity. Unlike traditional security operations that focus on infrastructure vulnerabilities and network perimeters, the color team framework targets a deeper class of threats -- epistemic attacks that degrade the quality of beliefs, decisions, and inferences made by AI-driven systems.

The six teams (Gray, Red, Blue, Purple, White, Black) form a closed-loop security cycle where boundary exploration seeds adversarial scenarios, which generate defensive evidence, which undergoes synthesis and closure verification, which feeds back into refined boundary exploration. This cycle operates continuously under the [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic framework, ensuring that every security assessment meets formal consistency requirements through the [Trinity Gate](@/glossary/trinity-gate.md) validation process.

All color team operations are simulation-only, executing exclusively with synthetic data in [sandboxed](@/glossary/process-isolation.md) environments. No team has production access. No team processes real personally identifiable information. Authorization is limited to CTF challenges, defensive security research, and explicitly authorized [penetration testing](@/glossary/penetration-testing.md) scenarios.

## 1. Introduction

### 1.1 The Epistemic Threat Landscape

Traditional cybersecurity frameworks address well-understood threat categories: network intrusion, malware deployment, data exfiltration, privilege escalation. These threats operate at the infrastructure layer, targeting systems, data, and access controls. The Prismatic Platform faces an additional category of threats that traditional frameworks do not address: epistemic attacks.

An epistemic attack degrades the quality of a system's beliefs without necessarily compromising its infrastructure. Consider a platform that makes decisions based on synthesized intelligence from multiple sources. An adversary need not breach the platform's network -- instead, they can poison upstream data sources, manipulate [confidence scores](@/glossary/confidence-scoring.md) through carefully crafted edge cases, or induce gradual drift in baseline assumptions until the system's decisions diverge from reality while all traditional security indicators remain green.

These threats are particularly dangerous for AI-driven platforms because they exploit the same cognitive mechanisms that provide the system's value. A system that synthesizes intelligence from diverse sources is inherently vulnerable to source manipulation. A system that adapts its behavior based on observed patterns can be led to adapt in adversary-favorable directions. A system that trusts its own confidence metrics can be deceived when those metrics are subtly corrupted.

### 1.2 Adversarial-Defensive Synthesis

The color team architecture addresses epistemic threats through a principle borrowed from military and intelligence doctrine: the most effective defense emerges from continuous adversarial engagement. Rather than attempting to enumerate all possible epistemic attacks and build static defenses, the platform maintains dedicated teams that actively generate adversarial scenarios and test defenses against them.

This approach recognizes a fundamental asymmetry in security: defenders must protect against all possible attack vectors, while attackers need only find one vulnerability. The color team architecture inverts this asymmetry by giving the platform's own adversarial teams the same creative latitude as external attackers, while ensuring that every discovered vulnerability immediately strengthens defenses.

The synthesis aspect is critical. Red team findings without blue team integration create security theater -- impressive attack demonstrations that never translate into improved defenses. Blue team defenses without red team pressure become complacent and brittle. The Purple team exists specifically to close this loop, ensuring that adversarial findings produce measurable defensive improvements and that no finding is marked as "resolved" until the defense has been independently verified.

### 1.3 Authorization and Ethical Boundaries

All color team operations are conducted within strict ethical boundaries:

- **CTF challenges**: Capture-the-flag exercises using purpose-built scenarios with synthetic data
- **Defensive security research**: Analysis of attack patterns to improve platform resilience
- **Authorized penetration testing**: Explicitly scoped assessments with documented authorization

No color team agent has the ability or authorization to conduct operations against external systems, real users, or production data. The Black team, which models theoretical worst-case scenarios, operates under MAXIMUM isolation with additional constraints preventing any executable output.

## 2. Team Architecture

### 2.1 Color Coding Rationale

The six-color framework draws from established security industry conventions while extending them for epistemic operations:

| Color | Traditional Role | Prismatic Extension |
|-------|-----------------|---------------------|
| **[Gray](@/glossary/gray-team.md)** | Not standard | Boundary exploration -- probes the spaces between defined behaviors |
| **[Red](@/glossary/red-team.md)** | Offensive security | Epistemic attack simulation -- targets belief formation, not infrastructure |
| **[Blue](@/glossary/blue-team.md)** | Defensive security | Epistemic defense -- protects cognitive integrity through evidence synthesis |
| **[Purple](@/glossary/purple-team.md)** | Red-Blue integration | Synthesis and closure -- ensures adversarial findings produce defensive improvements |
| **[White](@/glossary/white-team.md)** | Neutral/referee | Constructive verification -- provides formal proofs that systems hold |
| **[Black](@/glossary/black-team.md)** | Hostile/unknown | Theoretical threat modeling -- models worst-case adversarial optimization under MAXIMUM isolation |

The addition of Gray (boundary exploration) and White (constructive verification) teams reflects the platform's emphasis on proactive security. Gray identifies ambiguities before they become vulnerabilities. White proves that defenses hold through formal methods rather than relying solely on the absence of successful attacks.

### 2.2 Signal Flow Architecture

The teams interact through a structured signal flow that ensures findings propagate from discovery through defense:

```
Gray (boundary seeds) --> Red (adversarial scenarios) --> Purple (synthesis) --> Blue (defense)
         ^                         ^                          |       ^           |
         |                         |                          v       |           v
         |                    Black (threat models)     White (proofs)    Platform Defense
         |                                                                       |
         +-----------------------------------------------------------------------+
                              (feedback: new boundaries discovered)
```

This flow is not a rigid pipeline but a continuous cycle. Gray team findings seed Red team scenarios, but Red also generates scenarios independently. Purple synthesizes Red findings with Blue defensive evidence, but also monitors for regression in previously closed findings. White provides formal verification that feeds back into Purple's closure assessments. New boundaries discovered through defensive operations feed back to Gray for further exploration.

### 2.3 Authority and Coordination

Each team has a designated commander ([L3 authority](@/glossary/agent-tier.md)) who coordinates the team's specialists and interfaces with other team commanders. Cross-team coordination follows defined protocols:

```elixir
defmodule PrismaticDark.ColorTeam.Coordinator do
  @moduledoc """
  Coordinates signal flow between color teams.

  All operations execute in sandboxed environments with
  synthetic data only. No production access permitted.
  """

  @type signal :: %{
    source_team: :gray | :red | :blue | :purple | :white | :black,
    finding_id: String.t(),
    severity: :critical | :high | :medium | :low | :informational,
    confidence: float(),
    evidence: [Evidence.t()],
    timestamp: DateTime.t()
  }

  @spec route_finding(signal()) :: {:ok, :routed} | {:error, term()}
  def route_finding(%{source_team: :gray} = signal) do
    with :ok <- validate_signal(signal),
         :ok <- dispatch_to_red(signal),
         :ok <- notify_purple(signal) do
      {:ok, :routed}
    end
  end

  def route_finding(%{source_team: :red} = signal) do
    with :ok <- validate_signal(signal),
         :ok <- dispatch_to_purple(signal),
         :ok <- dispatch_to_blue(signal) do
      {:ok, :routed}
    end
  end

  def route_finding(%{source_team: :blue} = signal) do
    with :ok <- validate_signal(signal),
         :ok <- dispatch_to_purple(signal) do
      {:ok, :routed}
    end
  end

  def route_finding(%{source_team: :black} = signal) do
    with :ok <- validate_abstraction_level(signal),
         :ok <- dispatch_to_red(signal) do
      {:ok, :routed}
    end
  end
end
```

## 3. Gray Team -- Boundary Exploration

### 3.1 Mission

The Gray team conducts read-only exploration of specification gaps, edge cases, and affordance drift. Its purpose is to surface ambiguity without resolving it -- identifying the spaces where system behavior is undefined, underspecified, or diverges from stated invariants. All Gray operations enforce zero state changes to the systems under observation.

### 3.2 Agents

| Agent | Authority | Role | Key Capability |
|-------|-----------|------|----------------|
| `gray-explorer-commander` | L3 Strategic | Team Commander | Orchestrates Gray campaigns, routes findings to Red/Blue/Purple |
| `gray-edge-finder` | L4 Specialist | Boundary Analyst | Boundary value analysis, specification gap identification, edge case enumeration |
| `gray-escalation-guard` | L4 Safety-Critical | Safety Monitor | Prevents Gray-to-Black escalation, holds override authority to halt any Gray operation |

### 3.3 Operational Methodology

Gray operations follow a systematic boundary exploration methodology:

1. **Specification Analysis**: Identify documented system behaviors, invariants, and contracts
2. **Boundary Enumeration**: Map the edges of specified behavior -- inputs at limits, state transitions at thresholds, timing boundaries
3. **Gap Identification**: Discover behaviors that fall between specifications -- the undefined spaces where system behavior is implementation-dependent rather than specification-driven
4. **Affordance Drift Detection**: Monitor for gradual changes in what the system permits versus what it was designed to permit
5. **Finding Emission**: Structured findings are emitted to the signal flow without interpretation or resolution

The Gray team explicitly avoids resolving ambiguities. Resolution is the responsibility of downstream teams (Red for adversarial exploitation assessment, Blue for defensive gap analysis, Purple for prioritization and closure). Gray's value lies in unbiased observation -- once a team begins resolving findings, observation bias corrupts future discovery.

### 3.4 Safety Controls

The `gray-escalation-guard` agent monitors all Gray operations for potential escalation into adversarial territory. If a Gray exploration begins to resemble active exploitation (modifying state, generating attack payloads, or accessing resources beyond read-only scope), the escalation guard halts the operation immediately. This prevents the conceptual boundary between "exploring what could go wrong" and "making things go wrong" from being crossed.

## 4. Red Team -- Adversarial Simulation

### 4.1 Mission

The Red team simulates epistemic attacks using five defined attack primitives. All execution occurs in sandboxed environments with synthetic data only. The team generates adversarial scenarios that test the platform's cognitive resilience -- its ability to maintain accurate beliefs and sound decisions under hostile conditions.

### 4.2 Agents

| Agent | Authority | Role | Key Capability |
|-------|-----------|------|----------------|
| `red-commander` | L3 Strategic | Team Commander | Orchestrates adversarial scenarios, emits findings to Purple/Blue |
| `red-epistemic-attacker` | L2 Tactical | Attack Specialist | Truth distortion and source poisoning simulation |
| `red-drift-inducer` | L2 Tactical | Drift Specialist | Sub-threshold drift attacks, cascade propagation analysis |
| `red-scenario-generator` | L2 Tactical | Scenario Designer | Composes multi-technique scenarios from 329-entry attack taxonomy |

### 4.3 Five Attack Primitives

All Red team operations compose from five fundamental epistemic attack primitives:

| Primitive | Description | Example |
|-----------|-------------|---------|
| **Truth Distortion** | Alter the factual content of information reaching the platform | Inject contradictory signals that cancel out legitimate evidence |
| **Confidence Manipulation** | Inflate or deflate the platform's confidence in its beliefs | Repeatedly confirm a false signal to artificially boost its confidence score |
| **Signal Poisoning** | Corrupt the quality or provenance of information sources | Compromise the apparent independence of corroborating sources |
| **Drift Induction** | Gradually shift baseline assumptions below detection thresholds | Introduce small, consistent biases that accumulate into significant deviation |
| **Salience Hijacking** | Redirect the platform's attention to irrelevant signals | Flood high-priority channels with plausible but strategically misleading alerts |

The `red-scenario-generator` maintains a taxonomy of 329 specific attack techniques derived from these five primitives, enabling composition of complex multi-stage scenarios that combine multiple primitives in sequence or parallel.

### 4.4 Sandbox Constraints

Red team operations execute exclusively within `PrismaticDark.Sandbox`, which enforces:

- Zero network connectivity (no outbound connections of any kind)
- Synthetic data only (generated datasets with no real-world provenance)
- Time-boxed execution (operations automatically terminate after configured duration)
- Full audit logging (every action recorded in immutable log)
- No persistent state changes (sandbox state is discarded after each operation)

## 5. Blue Team -- Epistemic Defense

### 5.1 Mission

The Blue team maintains the platform's epistemic defensive posture through continuous evidence synthesis. Rather than producing alerts (which create noise and alarm fatigue), the Blue team produces structured evidence -- grounded assessments of the platform's cognitive health that can be consumed by both automated systems and human operators.

### 5.2 Agents

| Agent | Authority | Role | Key Capability |
|-------|-----------|------|----------------|
| `blue-commander` | L3 Strategic | Team Commander | Synthesizes evidence from specialists into unified defensive posture assessment |
| `blue-auth-sentinel` | L2 Operational | Authentication Monitor | Authentication boundary monitoring, privilege escalation detection |
| `blue-drift-detector` | L2 Operational | Drift Analyst | Behavioral, configuration, dependency, and performance drift detection |
| `blue-signal-aggregator` | L2 Operational | Signal Analyst | Cross-domain signal correlation with NABLA plurality enforcement |

### 5.3 NABLA Integration

Blue team operations are deeply integrated with the [NABLA Infinity](@/glossary/nabla-infinity.md) [epistemic framework](@/glossary/epistemic-pipeline.md). Every defensive assessment must satisfy NABLA's seven non-negotiable axioms:

- **[Signal Plurality](@/glossary/signal-plurality.md)**: No defensive assessment based on a single signal source. Minimum two independent sources required.
- **[Contradiction Preservation](@/glossary/contradiction-preservation.md)**: When defensive signals contradict each other (e.g., one metric shows health, another shows degradation), both signals are preserved and surfaced rather than one being discarded.
- **Absence Informative**: Missing expected signals are tracked as meaningful -- a sensor that stops reporting is itself a signal.
- **Time Decay**: All defensive assessments carry timestamps and decay functions. A clean security assessment from last week carries less weight than a concerning assessment from today.
- **Provenance Mandatory**: Every defensive claim traces back to originating evidence through a verifiable chain.

The `blue-signal-aggregator` specifically enforces NABLA plurality by correlating signals across authentication, behavioral, configuration, and performance domains. An anomaly detected in only one domain triggers investigation; an anomaly detected across multiple domains triggers escalation.

### 5.4 Defensive Posture Assessment

The Blue team produces a continuous defensive posture assessment -- a structured document that characterizes the platform's current epistemic health across multiple dimensions:

| Dimension | Healthy State | Degraded State | Compromised State |
|-----------|---------------|----------------|-------------------|
| **Belief Accuracy** | Beliefs align with ground truth | Detectable divergence from ground truth | Systematic misalignment |
| **Confidence Calibration** | Confidence matches empirical accuracy | Over/under-confidence detected | Confidence inversely correlated with accuracy |
| **Source Integrity** | All sources independently verified | Some source independence questionable | Source manipulation detected |
| **Drift Rate** | Within baseline variance | Exceeding baseline but sub-threshold | Exceeding detection thresholds |
| **Decision Quality** | Decisions produce expected outcomes | Decisions produce unexpected outcomes | Decisions consistently sub-optimal |

## 6. Purple Team -- Synthesis and Closure

### 6.1 Mission

The Purple team serves as the central hub for Red-Blue loop closure. It is the sole authority for closure state transitions -- determining when a finding has been adequately addressed and when a defense has been sufficiently validated. Purple operates under the principle: "Purple is the property of the system when it stops lying to itself."

### 6.2 Agents

| Agent | Authority | Role | Key Capability |
|-------|-----------|------|----------------|
| `purple-coordinator` | L3 Strategic | Team Commander | Synthesis hub, closure authority, anti-metric enforcement |
| `purple-mapper` | L4 Operational | Finding Mapper | Bidirectional Red finding to Blue defense mapping |
| `purple-closure-analyst` | L4 Operational | Closure Analyst | 4-condition closure evaluation, false closure detection |
| `purple-regression-guard` | L4 Safety-Critical | Regression Monitor | Regression trap management, deployment gate enforcement |

### 6.3 Four Closure Conditions

The `purple-closure-analyst` evaluates four conditions that must ALL be satisfied before a finding is marked as closed:

1. **Attack Reproduced**: The Red team finding has been independently reproduced in a controlled environment, confirming the vulnerability exists
2. **Defense Implemented**: The Blue team has implemented a specific defense that addresses the finding's root cause, not merely its symptoms
3. **Defense Verified**: The implemented defense has been tested against the original attack scenario and prevents the attack from succeeding
4. **Regression Protected**: A regression test has been added that will detect if the vulnerability re-emerges in future changes

False closure -- marking a finding as resolved when it has not been adequately addressed -- is treated as a more dangerous outcome than leaving a finding open. An open finding is visible and can be prioritized. A falsely closed finding creates an invisible vulnerability and a false sense of security.

### 6.4 Anti-Metric Enforcement

The `purple-coordinator` enforces anti-metric principles to prevent Goodhart's Law from corrupting the security process. Common metrics that incentivize wrong behavior are explicitly tracked and counteracted:

- **Closure rate**: High closure rate can incentivize premature or false closure. Purple tracks closure quality alongside closure rate.
- **Finding count**: High finding count can incentivize trivial findings over significant ones. Purple weights findings by impact, not volume.
- **Response time**: Fast response time can incentivize shallow investigation. Purple validates investigation depth independently of speed.

## 7. White Team -- Constructive Verification

### 7.1 Mission

The White team proves that systems hold through progressive formal verification methodology. Unlike Red (which finds failures) and Blue (which defends against them), White provides positive evidence that specific properties are maintained. White produces evidence artifacts but never modifies the systems under verification. All White output passes through the Trinity Gate before being accepted.

### 7.2 Agents

| Agent | Authority | Role | Key Capability |
|-------|-----------|------|----------------|
| `white-verifier-commander` | L3 Strategic | Team Commander | Orchestrates verification campaigns, composite proof construction |
| `white-contract-validator` | L4 Operational | Contract Tester | Interface contract testing, behavior/protocol/API validation |
| `white-invariant-prover` | L4 Operational | Proof Engineer | Property-based testing, formal Lean4 proofs, fault injection analysis |

### 7.3 Progressive Verification Methodology

White team verification follows a progressive methodology (L0 through L5) that increases rigor at each level:

| Level | Method | Confidence | Example |
|-------|--------|------------|---------|
| **L0** | Assertion-based | Low | Runtime assertions that key invariants hold |
| **L1** | Example-based testing | Moderate | Unit tests with representative inputs |
| **L2** | Property-based testing | High | StreamData generators verifying properties across random inputs |
| **L3** | Contract verification | High | Behavior contract testing across module boundaries |
| **L4** | Model checking | Very High | Exhaustive state space exploration for finite-state components |
| **L5** | Formal proof | Maximum | Lean4 formal proofs of critical invariants |

Most platform properties are verified at L1-L3. Critical security properties (authentication invariants, authorization boundaries, data isolation) are verified at L4-L5 where feasible.

### 7.4 Trinity Gate Integration

All White team evidence passes through the Trinity Gate validation process:

1. **Structural Consistency**: The proof's logical structure is validated using graph-theoretic methods -- no circular reasoning, no unsupported premises, no dangling references
2. **Logical Consistency**: The proof's inference steps are verified against known axioms and rules -- each conclusion follows from its premises
3. **Formal Necessity**: Where applicable, the proof is formalized in Lean4 and mechanically verified -- providing the highest achievable confidence

## 8. Black Team -- Theoretical Threat Modeling

### 8.1 Mission

The Black team operates under MAXIMUM isolation, conducting pure epistemic simulation of worst-case adversarial optimization. It produces abstract threat models that describe what a maximally capable adversary could achieve -- not how they would achieve it. The Black team never produces executable content, exploit code, or operational attack instructions.

### 8.2 Agents

| Agent | Authority | Role | Key Capability |
|-------|-----------|------|----------------|
| `black-theorist-commander` | L3 Strategic (ISOLATED) | Team Commander | Abstract threat models, malicious optimization analysis |
| `black-abstraction-enforcer` | L3 Safety-Critical (ISOLATED) | Output Filter | L1-L4 output abstraction enforcement, executable content detection and blocking |

### 8.3 Isolation Protocol

Black team isolation is the most restrictive in the platform:

- **No network access**: Complete network isolation, not even to other platform components
- **No code execution**: The Black team does not execute code -- it reasons about what could happen
- **No production data**: Not even sanitized production data; only abstract models and synthetic scenarios
- **Output filtering**: All Black team output passes through the `black-abstraction-enforcer`, which applies L1-L4 abstraction filters to ensure no executable, operational, or tactically useful content is emitted
- **Separate audit trail**: Black team operations are logged in a separate, restricted audit trail with elevated access controls

### 8.4 Abstraction Levels

The `black-abstraction-enforcer` ensures all Black team output meets abstraction requirements:

| Level | Description | Example (Permitted) | Example (Blocked) |
|-------|-------------|--------------------|--------------------|
| **L1** | Capability class | "An adversary could manipulate confidence scores" | Specific manipulation technique |
| **L2** | Impact assessment | "Confidence manipulation could cause 15% decision degradation" | Steps to achieve the degradation |
| **L3** | Mitigation direction | "Confidence validation at ingestion would address this class" | Specific bypass for the validation |
| **L4** | Strategic context | "This threat class is relevant to multi-source intelligence synthesis" | Identification of specific vulnerable components |

## 9. Signal Flow and Coordination

### 9.1 Operational Cycle

A complete color team operational cycle proceeds through the following phases:

**Phase 1 -- Discovery (Gray)**: Gray team explores system boundaries, identifies specification gaps and behavioral ambiguities. Findings are tagged with severity estimates and emitted to the signal flow.

**Phase 2 -- Threat Assessment (Black)**: Black team receives relevant Gray findings and produces abstract threat models describing worst-case exploitation potential. Models are filtered through abstraction enforcement before emission.

**Phase 3 -- Adversarial Simulation (Red)**: Red team receives Gray findings and Black threat models, then designs and executes adversarial scenarios in sandboxed environments. Successful attacks (demonstrating the vulnerability is exploitable) are documented with full reproduction steps.

**Phase 4 -- Defensive Response (Blue)**: Blue team receives Red findings and updates its defensive posture. New defenses are designed, implemented, and tested against the specific attack scenarios.

**Phase 5 -- Synthesis (Purple)**: Purple team maps Red findings to Blue defenses, evaluates closure conditions, and verifies that each finding has been adequately addressed. Purple also detects regression -- previously closed findings that have re-emerged.

**Phase 6 -- Verification (White)**: White team provides formal verification that implemented defenses hold. Property-based tests and, where warranted, Lean4 proofs confirm that defensive properties are maintained.

**Phase 7 -- Feedback**: New boundaries discovered during the cycle feed back to Gray for the next iteration. The cycle is continuous, not episodic.

### 9.2 Cross-Team Communication Protocol

Teams communicate through structured signals with mandatory fields:

```elixir
defmodule PrismaticDark.ColorTeam.Signal do
  @moduledoc """
  Structured signal format for cross-team communication.
  All fields are mandatory to ensure traceability and
  NABLA provenance compliance.
  """

  @type t :: %__MODULE__{
    id: String.t(),
    source_team: team_color(),
    source_agent: String.t(),
    target_teams: [team_color()],
    finding_type: finding_type(),
    severity: severity(),
    confidence: float(),
    evidence: [Evidence.t()],
    context: map(),
    timestamp: DateTime.t(),
    expiry: DateTime.t(),
    provenance_chain: [String.t()]
  }

  @type team_color :: :gray | :red | :blue | :purple | :white | :black
  @type finding_type :: :boundary_gap | :attack_scenario | :defensive_evidence
                      | :closure_assessment | :verification_proof | :threat_model
  @type severity :: :critical | :high | :medium | :low | :informational

  defstruct [
    :id, :source_team, :source_agent, :target_teams,
    :finding_type, :severity, :confidence, :evidence,
    :context, :timestamp, :expiry, :provenance_chain
  ]
end
```

## 10. Safety Protocols

### 10.1 Comprehensive Safety Framework

The color team architecture enforces multiple layers of safety protocols:

| Protocol | Scope | Enforcement | Bypass |
|----------|-------|-------------|--------|
| **Sandbox Isolation** | Red, Black operations | `PrismaticDark.Sandbox` process isolation | None |
| **Synthetic Data Only** | All teams | Data provenance validation at ingestion | None |
| **No Network Access** | Red, Black operations | OS-level network namespace isolation | None |
| **Ethics Validation** | All teams | Automated checks every 10-15 seconds | None |
| **Escalation Guards** | Gray, Black | `gray-escalation-guard`, `black-abstraction-enforcer` | None |
| **Audit Logging** | All teams | Immutable append-only log | None |
| **No Executable Output** | Black team | L1-L4 abstraction filtering | None |
| **Time-Boxing** | All operations | Automatic termination after configured duration | Commander override only |

### 10.2 Ethics Enforcement

Automated ethics checks run every 10-15 seconds across all active color team operations. These checks validate:

- **Scope compliance**: Operations remain within authorized boundaries
- **Data classification**: No real data, PII, or production state present in any operation
- **Output classification**: No executable exploits, attack tools, or operational attack instructions in any output
- **Intent alignment**: Operations serve defensive security research objectives, not offensive capability development
- **Proportionality**: The scope and intensity of operations are proportionate to the security questions being investigated

Ethics violations trigger immediate operation suspension, with automated notification to the Purple coordinator and the platform's supreme authority agents.

### 10.3 Audit and Accountability

Every color team operation generates an immutable audit record containing:

- Agent identity, authority level, and team assignment
- Operation type, scope, and duration
- Input data sources and their classifications
- Actions taken and their outcomes
- Output produced and its abstraction level
- Ethics check results for the operation's duration
- Resource consumption metrics

Audit records are append-only and cannot be modified or deleted by any agent, including supreme authority agents. This ensures accountability even in scenarios where agent behavior is itself under investigation.

## 11. Conclusion

### 11.1 Synthesis

The Prismatic Platform's color team architecture represents a systematic approach to a class of security threats that traditional frameworks leave unaddressed. By maintaining dedicated teams for boundary exploration (Gray), adversarial simulation (Red), epistemic defense (Blue), synthesis and closure (Purple), constructive verification (White), and theoretical threat modeling (Black), the platform achieves continuous security assessment that targets cognitive integrity alongside infrastructure protection.

The architecture's value lies not in any individual team but in their coordinated interaction. Gray discovers what Red attacks. Red's attacks strengthen Blue's defenses. Purple ensures that Red-Blue interactions produce genuine improvements rather than security theater. White provides formal evidence that defenses hold. Black models the worst cases that ground the entire effort in realistic threat assessment. The closed-loop nature of this cycle means that the platform's epistemic security posture improves with every iteration.

### 11.2 Operational Principles

Three principles govern all color team operations:

1. **Simulation only**: No operation affects production systems, real data, or external entities. The color teams operate in a parallel universe of synthetic data and sandboxed environments.

2. **Evidence over alerts**: Teams produce structured evidence, not alarm signals. Evidence can be composed, weighted, and reasoned about. Alerts create noise and urgency without necessarily creating understanding.

3. **Closure integrity**: A finding is not resolved until four conditions are independently verified. False closure is treated as more dangerous than an open finding, because it creates invisible vulnerabilities behind a facade of resolution.

### 11.3 Epistemic Security as Foundational Capability

As AI-driven platforms become responsible for increasingly consequential decisions, the integrity of their belief-formation processes becomes a first-class security concern. The color team architecture positions epistemic security not as an add-on to traditional security but as a foundational capability -- one that ensures the platform's intelligence remains trustworthy even under adversarial conditions.

The 20 agents across six teams, operating under NABLA Infinity's epistemic framework and the NO MERCY, NO DOUBTS doctrine, provide continuous assurance that the Prismatic Platform's cognitive processes are resilient, calibrated, and honest. In a domain where the primary asset is the quality of intelligence produced, this assurance is the most critical security capability of all.

## References

### Internal Documentation

- [Agent Ecosystem](@/agents/_index.md) -- Complete agent catalog including color team agent specifications
- [Platform Capabilities](@/capabilities/_index.md) -- Doctrines, quality enforcement, and governance framework
- [Architecture](@/architecture/_index.md) -- Technical infrastructure and NABLA epistemic pipeline

### Epistemic Security Resources

- Anderson, R. "Security Engineering: A Guide to Building Dependable Distributed Systems." Wiley, 2020.
- Bostrom, N. and Yudkowsky, E. "The Ethics of Artificial Intelligence." Cambridge Handbook of Artificial Intelligence, 2014.
- Goodhart, C.A.E. "Problems of Monetary Management: The U.K. Experience." Papers in Monetary Economics, Reserve Bank of Australia, 1975.
- Kahneman, D. "Thinking, Fast and Slow." Farrar, Straus and Giroux, 2011.

---

*20 specialized agents. 6 color teams. Continuous adversarial-defensive synthesis for epistemic security.*

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
