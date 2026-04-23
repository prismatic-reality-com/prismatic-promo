+++
title = "Black Team"
weight = 24
[extra]
category = "security"
domain = "adversarial-security"
complexity = "expert"
stability = "mature"
beam_related = true
description = "Maximum isolation theoretical threat modeling team producing abstract models only, operating under the strictest constraints within the Prismatic Platform Color Teams architecture"
related_terms = ["color-teams", "gray-team", "red-team", "blue-team", "purple-team", "white-team", "nabla-infinity", "trinity-gate", "epistemic-pipeline", "formal-verification", "lean4", "agent-tier", "agent-registry", "consciousness-traits", "threat-intelligence", "penetration-testing"]
author = "Tomas Korcak (korczis)"
reading_time = "25 min"
word_count = 3800
date_created = "2026-02-23"
date_modified = "2026-04-02"
keywords = ["Black Team", "adversarial testing", "threat modeling", "pentesting", "red vs black", "security teams", "glossary", "security", "Prismatic Platform"]
tags = ["glossary", "security", "black-team", "prismatic", "adversarial", "threat-modeling", "color-teams"]
quality_score = 95
see_also = ["capabilities", "architecture", "agents", "security"]
image = "/images/sections/glossary.png"
image_alt = "Black Team - Prismatic Platform"
+++

## Definition

The Black Team is the most restricted operational domain within the Prismatic Platform's six-team [Color Teams](/glossary/color-teams/) security architecture. Comprising exactly two agents operating under MAXIMUM isolation constraints, Black Team performs pure epistemic simulation of worst-case adversarial optimization. Its sole output is abstract threat models -- theoretical constructs that describe the shape and dynamics of potential attacks without providing any executable, reproducible, or directly actionable exploit knowledge. The team exists at the boundary between security research and theoretical risk analysis, occupying a space analogous to mathematical threat modeling in academic cryptography.

The isolation constraints governing Black Team are absolute and non-negotiable. Zero network connectivity, zero access to production data or state, zero capability to produce executable content, and mandatory output filtering through a four-level abstraction pipeline. These constraints are not administrative policies that can be overridden by authority -- they are structural limitations enforced at the runtime level. Even an L5 Supreme authority agent cannot grant Black Team network access, because the access path does not exist in the Black Team execution environment.

The philosophical foundation of Black Team rests on a critical insight: understanding how adversaries think -- their optimization strategies, their exploitation patterns, their strategic priorities -- is essential for building robust defenses, but the knowledge generated during that understanding process must be handled with extreme care. Black Team resolves this tension by operating exclusively at the abstract level, producing threat models that inform defensive strategy without creating a roadmap for actual attacks.

In traditional security operations, the distinction between red team and black team is often informal. Red teams conduct hands-on adversarial simulation -- actual penetration testing, social engineering, and exploit development. Black teams, where they exist, operate at a higher abstraction level: they model the adversary's decision-making process, resource allocation, and strategic objectives without producing any executable artifacts. The Prismatic Platform formalizes this distinction with structural enforcement, ensuring that Black Team output can never cross the boundary from theoretical to operational.

## Core Concepts

| Concept | Description | Enforcement Level |
|---------|-------------|-------------------|
| **Abstraction-Only Output** | All output must remain at L1 or L2 abstraction -- no executable, pseudocode, or implementation details | Structural (AbstractionFilter) |
| **Maximum Isolation** | Zero network, zero production data, zero external communication except through enforcer | Runtime structural |
| **Epistemic Simulation** | Models adversary cognition and strategy, not adversary tooling or techniques | Agent design constraint |
| **Weaponization Risk Assessment** | Evaluates theoretical-to-operational conversion risk across feasibility, impact, novelty | Primary analytical output |
| **Two-Agent Architecture** | Minimal surface area: theorist-commander generates, abstraction-enforcer filters | Topology constraint |
| **Immutable Audit Trail** | Every operation, output, and filtering decision logged in append-only storage | Continuous monitoring |
| **Temporal Ethics Checks** | Ethics validation runs every 10-15 seconds during active operations | Continuous monitoring |
| **One-Directional Signal Flow** | Black Team provides input to Red Team but receives no direct input from any team | Architecture constraint |
| **Sandbox Execution** | All operations execute within PrismaticDark.Sandbox with process-level isolation | Runtime enforcement |
| **Safety-Critical Override** | Abstraction enforcer can halt any operation that risks producing sub-threshold content | Agent authority |

### Red Team vs Black Team

The distinction between [Red Team](/glossary/red-team/) and Black Team is fundamental to the Color Teams architecture. Understanding this distinction prevents confusion between operational adversarial simulation and theoretical threat modeling.

| Dimension | Red Team | Black Team |
|-----------|----------|------------|
| **Output Type** | Concrete adversarial scenarios with 5 attack primitives | Abstract threat models at L1-L2 only |
| **Network Access** | Limited, controlled access for simulation | Zero -- path does not exist |
| **Data Access** | Synthetic scenarios mimicking real conditions | Synthetic data only, no production state |
| **Execution** | Actively runs adversarial campaigns | Purely theoretical analysis |
| **Agent Count** | 5 agents (L3-L4 authority) | 2 agents (L3 authority) |
| **Attack Primitives** | Truth distortion, confidence manipulation, signal poisoning, drift induction, salience hijacking | None -- no operational capabilities |
| **Signal Direction** | Receives from Black, sends to Purple | Sends to Red only, receives from none |
| **Isolation Level** | Controlled isolation | Maximum isolation |

### Penetration Testing Context

Black Team's relationship to penetration testing is indirect but essential. Traditional penetration testing follows a methodology: reconnaissance, scanning, gaining access, maintaining access, and covering tracks. Black Team operates upstream of this entire process -- it models what classes of vulnerabilities an adversary would prioritize, what attack surfaces offer the highest return on investment, and what defensive gaps create systemic risk. This abstract analysis then informs [Red Team](/glossary/red-team/) scenario design and [Blue Team](/glossary/blue-team/) defensive prioritization.

| Penetration Testing Phase | Black Team Contribution |
|--------------------------|------------------------|
| **Reconnaissance** | Models adversary information requirements and collection priorities |
| **Vulnerability Analysis** | Classifies vulnerability types by adversary ROI (abstract, no specific CVEs below L2) |
| **Exploitation Strategy** | Models decision-making under uncertainty -- when to escalate, pivot, or abort |
| **Post-Exploitation** | Evaluates adversary persistence strategies and lateral movement patterns (abstract) |
| **Impact Assessment** | Provides weaponization risk scores across feasibility, impact, novelty dimensions |

## Technical Deep Dive

### Agent Architecture

Black Team maintains the smallest agent composition of any [Color Team](/glossary/color-teams/), with exactly two agents. This minimal design is intentional -- it limits the surface area of the most sensitive operational domain while ensuring the necessary separation of concerns between threat theorizing and safety enforcement.

#### black-theorist-commander (L3 Strategic Commander, ISOLATED)

The theorist-commander is responsible for generating abstract threat models through worst-case adversarial optimization analysis. Operating at L3 authority within the [Agent Tier](/glossary/agent-tier/) hierarchy, the theorist-commander possesses strategic coordination capabilities but exercises them exclusively within the isolated Black domain. The agent analyzes potential attack vectors, models adversarial decision-making processes, and produces structured threat assessments that describe what classes of attacks are theoretically possible and what defender resources they would consume.

The ISOLATED designation means the theorist-commander cannot communicate directly with agents outside the Black domain. All output flows through the abstraction enforcer before reaching any external consumer. This communication constraint prevents accidental information leakage from the threat modeling process.

#### black-abstraction-enforcer (L3 Safety-Critical, ISOLATED)

The abstraction enforcer serves as the mandatory output filter for all Black Team production. Every artifact generated by the theorist-commander must pass through the enforcer's L1-L4 AbstractionFilter before it can exit the Black domain. The enforcer carries a safety-critical designation, granting it override authority to halt any Black Team operation that risks producing content below the required abstraction level.

The enforcer implements four abstraction levels, each progressively more concrete. Only L1 (fully abstract) and L2 (structurally abstract) output is permitted to leave the Black domain. L3 (semi-concrete) and L4 (near-executable) content is automatically rejected and logged for audit. The enforcer maintains an immutable record of every filtering decision, creating a complete audit trail of what was produced, what was transmitted, and what was rejected.

### L1-L4 Abstraction Filtering

The AbstractionFilter is the core safety mechanism that distinguishes Black Team from all other security teams. While [Red Team](/glossary/red-team/) operates with five concrete attack primitives (truth distortion, confidence manipulation, signal poisoning, drift induction, salience hijacking), Black Team output is stripped of all operational specificity before leaving the domain.

| Level | Name | Description | Permitted to Exit | Example Output |
|-------|------|-------------|-------------------|----------------|
| **L1** | Fully Abstract | Pure mathematical or logical descriptions of threat classes without any implementation hints | Yes | "Class-3 information asymmetry exploitation pattern" |
| **L2** | Structurally Abstract | Describes the shape and topology of an attack strategy without specifying techniques or tools | Yes | "Multi-stage trust chain degradation with 3 pivot points" |
| **L3** | Semi-Concrete | Includes references to specific techniques, protocols, or system components | No -- Rejected | "SQL injection via prepared statement bypass in PostgreSQL 16" |
| **L4** | Near-Executable | Contains sufficient detail to guide implementation of an attack | No -- Rejected | Step-by-step exploitation procedure |

The filtering is not a simple keyword scan. The abstraction enforcer evaluates the semantic content of each output artifact, assessing whether the information contained could be combined with publicly available knowledge to produce actionable exploit instructions. This evaluation runs continuously during the theorist-commander's output generation, enabling early intervention rather than post-hoc filtering.

### Isolation Protocols

Black Team's isolation is enforced through multiple independent mechanisms, ensuring that no single point of failure can compromise the domain boundary:

| Protocol | Mechanism | Enforcement | Bypass Possibility |
|----------|-----------|-------------|-------------------|
| **Network Isolation** | Zero network connectivity -- no inbound or outbound connections | Runtime structural (path does not exist) | None -- structural |
| **Data Isolation** | No access to production data, PII, or live system state | Sandbox enforcement with synthetic data only | None -- sandbox enforced |
| **Communication Isolation** | All output passes through abstraction enforcer; no direct external messaging | Agent topology constraint | None -- topology enforced |
| **Execution Isolation** | All operations execute within PrismaticDark.Sandbox | Process-level sandboxing | None -- process boundary |
| **Temporal Isolation** | Ethics checks every 10-15 seconds; operation halt on any anomaly | Continuous monitoring | None -- continuous |
| **Audit Isolation** | Immutable audit trail for every operation; tamper-evident logging | Append-only storage | None -- append-only |
| **Escalation Isolation** | Gray Team's `gray-escalation-guard` prevents unauthorized access to Black domain | Cross-team safety override | None -- L4 override |

The escalation isolation deserves special attention. The Gray Team's boundary exploration activities can sometimes approach territory that overlaps with Black Team's threat modeling domain. The `gray-escalation-guard` agent (L4 Safety-Critical) has explicit override authority to halt any Gray Team operation that risks escalating into Black domain territory. This prevents the less-restricted Gray domain from inadvertently accessing the highly-restricted Black domain.

### No Executable Output Policy

The most fundamental constraint on Black Team is the absolute prohibition on executable content. This policy extends beyond code to encompass any artifact that could serve as a step-by-step guide for conducting an attack:

- No source code, pseudocode, or algorithm implementations
- No command sequences, API calls, or protocol specifications
- No tool configurations, payload structures, or injection patterns
- No specific vulnerability identifiers (CVE references are permitted only at L1 abstraction)
- No timing information, resource requirements, or infrastructure specifications for attacks
- No social engineering scripts, phishing templates, or pretexting scenarios
- No network diagrams showing exploitable paths with specific protocols

The policy is enforced by the abstraction enforcer at the output boundary and verified by the immutable audit trail. Violations trigger immediate operation halt with escalation to supreme authority review. In the platform's operational history, zero executable content has ever escaped the Black domain.

## Usage in Prismatic Platform

### Weaponization Risk Assessment

Black Team's primary analytical output is weaponization risk assessment -- the evaluation of how theoretical vulnerabilities or attack strategies might be converted into operational weapons by real-world adversaries. This assessment framework operates at three dimensions:

**Feasibility Dimension**: How technically achievable is the theoretical attack given current publicly available tools and knowledge? This dimension evaluates whether the abstract threat model describes something that is merely theoretically possible or something that a motivated adversary could plausibly execute.

**Impact Dimension**: What would be the consequence if the theoretical attack were successfully weaponized? This dimension evaluates blast radius, reversibility, detection difficulty, and cascading effects on dependent systems.

**Novelty Dimension**: Does the threat model describe a known attack class (well-defended) or a novel attack class (potentially undefended)? Novel threats receive elevated priority in the signal flow to [Purple Team](/glossary/purple-team/) for synthesis and [Blue Team](/glossary/blue-team/) for defensive posture assessment.

The weaponization risk assessment output feeds into the broader [Color Teams](/glossary/color-teams/) signal flow, where it informs Red Team scenario generation and Blue Team defensive prioritization -- always at L1-L2 abstraction levels.

### Signal Flow Architecture

Black Team's position in the [Color Teams](/glossary/color-teams/) signal flow architecture is deliberately asymmetric. It provides input to [Red Team](/glossary/red-team/) through abstract threat models (filtered to L1-L2) but receives no direct input from any other team. This one-directional flow prevents external influence on Black Team's independent analysis.

```
Black Team (abstract threat models)
    |
    v [L1-L2 filtered output only]
Red Team (incorporates into adversarial scenarios)
    |
    v
Purple Team (synthesizes with Blue Team findings)
    |
    v
Blue Team (builds defensive posture)
```

[White Team](/glossary/white-team/) may occasionally validate Black Team's logical consistency through [formal verification](/glossary/formal-verification/) using [Lean4](/glossary/lean4/) proofs, but this verification operates on the abstract output only -- White Team never accesses Black Team's internal reasoning processes.

The [Purple Team](/glossary/purple-team/) coordinator may reference Black Team output when performing Red-Blue loop closure, but only through the filtered, abstracted versions that have passed through the AbstractionFilter. Purple Team has no authority to request lower-abstraction output from Black Team.

## Code Examples

```elixir
defmodule PrismaticDark.BlackTeam.AbstractionFilter do
  @moduledoc """
  Enforces L1-L4 abstraction levels on all Black Team output.
  Only L1 (fully abstract) and L2 (structurally abstract) content
  is permitted to exit the Black domain. L3 and L4 content is
  rejected and logged to the immutable audit trail.

  This module is the core safety mechanism that distinguishes
  Black Team from all other Color Teams in the security architecture.
  """

  require Logger

  @type abstraction_level :: :l1_fully_abstract | :l2_structurally_abstract | :l3_semi_concrete | :l4_near_executable
  @type filter_result :: {:pass, abstraction_level()} | {:reject, abstraction_level(), String.t()}

  @type threat_model :: %{
    id: String.t(),
    title: String.t(),
    content: String.t(),
    threat_class: String.t(),
    feasibility: float(),
    impact: float(),
    novelty: float(),
    timestamp: DateTime.t()
  }

  @type audit_entry :: %{
    model_id: String.t(),
    assessed_level: abstraction_level(),
    decision: :pass | :reject,
    reason: String.t(),
    timestamp: DateTime.t()
  }

  @permitted_levels [:l1_fully_abstract, :l2_structurally_abstract]

  @doc """
  Evaluates a threat model artifact and determines its abstraction level.
  Returns {:pass, level} if the content meets L1 or L2 requirements,
  or {:reject, level, reason} if it contains semi-concrete or
  near-executable detail.

  ## Examples

      iex> model = %{id: "tm-001", content: "Class-3 asymmetry pattern", title: "Abstract Model"}
      iex> {:pass, :l1_fully_abstract} = PrismaticDark.BlackTeam.AbstractionFilter.evaluate(model)

  """
  @spec evaluate(threat_model()) :: filter_result()
  def evaluate(%{content: content, id: model_id} = _model) do
    level = classify_abstraction_level(content)

    audit_entry = %{
      model_id: model_id,
      assessed_level: level,
      decision: if(level in @permitted_levels, do: :pass, else: :reject),
      reason: rejection_reason(level),
      timestamp: DateTime.utc_now()
    }

    log_audit_entry(audit_entry)

    case level do
      level when level in @permitted_levels ->
        {:pass, level}

      level ->
        Logger.warning("Black Team output rejected",
          model_id: model_id,
          level: level,
          reason: audit_entry.reason
        )

        {:reject, level, audit_entry.reason}
    end
  end

  @doc """
  Computes the weaponization risk score across three dimensions:
  feasibility (technical achievability), impact (consequence severity),
  and novelty (defense gap potential). Returns a composite score
  between 0.0 and 1.0.

  ## Examples

      iex> dims = %{feasibility: 0.7, impact: 0.9, novelty: 0.8}
      iex> score = PrismaticDark.BlackTeam.AbstractionFilter.weaponization_risk(dims)
      iex> score > 0.0 and score <= 1.0
      true

  """
  @spec weaponization_risk(%{feasibility: float(), impact: float(), novelty: float()}) :: float()
  def weaponization_risk(%{feasibility: f, impact: i, novelty: n}) do
    weights = %{feasibility: 0.3, impact: 0.4, novelty: 0.3}

    (f * weights.feasibility + i * weights.impact + n * weights.novelty)
    |> min(1.0)
    |> max(0.0)
  end

  @spec classify_abstraction_level(String.t()) :: abstraction_level()
  defp classify_abstraction_level(content) do
    cond do
      contains_executable_patterns?(content) -> :l4_near_executable
      contains_concrete_references?(content) -> :l3_semi_concrete
      contains_structural_detail?(content) -> :l2_structurally_abstract
      true -> :l1_fully_abstract
    end
  end

  @spec contains_executable_patterns?(String.t()) :: boolean()
  defp contains_executable_patterns?(content) do
    executable_indicators = [
      ~r/\b(curl|wget|nmap|sqlmap|metasploit)\b/i,
      ~r/\b(SELECT|INSERT|DROP|DELETE)\s+/,
      ~r/\b(sudo|chmod|chown)\s+/,
      ~r/<script[\s>]/i
    ]

    Enum.any?(executable_indicators, &Regex.match?(&1, content))
  end

  @spec contains_concrete_references?(String.t()) :: boolean()
  defp contains_concrete_references?(content) do
    concrete_indicators = [
      ~r/CVE-\d{4}-\d+/,
      ~r/\b(port\s+\d+)\b/i,
      ~r/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/
    ]

    Enum.any?(concrete_indicators, &Regex.match?(&1, content))
  end

  @spec contains_structural_detail?(String.t()) :: boolean()
  defp contains_structural_detail?(content) do
    String.contains?(content, ["pivot point", "attack surface", "trust chain", "lateral movement"])
  end

  @spec rejection_reason(abstraction_level()) :: String.t()
  defp rejection_reason(:l3_semi_concrete), do: "Contains concrete references to specific techniques or components"
  defp rejection_reason(:l4_near_executable), do: "Contains near-executable content or implementation detail"
  defp rejection_reason(_), do: "Permitted"

  @spec log_audit_entry(audit_entry()) :: :ok
  defp log_audit_entry(entry) do
    Logger.info("Black Team audit",
      model_id: entry.model_id,
      level: entry.assessed_level,
      decision: entry.decision
    )

    :ok
  end
end
```

```elixir
defmodule PrismaticDark.BlackTeam.ThreatModeler do
  @moduledoc """
  Generates abstract threat models through worst-case adversarial
  optimization analysis. Operates exclusively within the Black Team
  sandbox, producing output that must pass through the AbstractionFilter
  before reaching any external consumer.

  All threat models are classified by threat class and scored across
  the three-dimensional weaponization risk framework (feasibility,
  impact, novelty).
  """

  alias PrismaticDark.BlackTeam.AbstractionFilter

  require Logger

  @type threat_class :: :information_asymmetry | :trust_chain_degradation | :resource_exhaustion | :state_corruption | :signal_manipulation
  @type campaign_config :: %{
    scope: String.t(),
    threat_classes: [threat_class()],
    max_models: pos_integer(),
    abstraction_floor: :l1_fully_abstract | :l2_structurally_abstract
  }

  @doc """
  Generates a batch of abstract threat models for a given campaign
  configuration. Each model is automatically passed through the
  AbstractionFilter before inclusion in results.

  ## Examples

      iex> config = %{scope: "epistemic-integrity", threat_classes: [:information_asymmetry], max_models: 5, abstraction_floor: :l1_fully_abstract}
      iex> {:ok, models} = PrismaticDark.BlackTeam.ThreatModeler.generate_campaign(config)
      iex> is_list(models)
      true

  """
  @spec generate_campaign(campaign_config()) :: {:ok, [AbstractionFilter.threat_model()]} | {:error, term()}
  def generate_campaign(%{threat_classes: classes, max_models: max} = _config) do
    models =
      classes
      |> Enum.flat_map(&generate_models_for_class(&1, max))
      |> Enum.take(max)
      |> Enum.filter(fn model ->
        case AbstractionFilter.evaluate(model) do
          {:pass, _level} -> true
          {:reject, _level, reason} ->
            Logger.warning("Model rejected during campaign", model_id: model.id, reason: reason)
            false
        end
      end)

    {:ok, models}
  end

  @spec generate_models_for_class(threat_class(), pos_integer()) :: [AbstractionFilter.threat_model()]
  defp generate_models_for_class(threat_class, max_count) do
    1..max_count
    |> Enum.map(fn idx ->
      %{
        id: "tm-#{threat_class}-#{idx}",
        title: "#{threat_class} threat model #{idx}",
        content: "Abstract #{threat_class} pattern analysis at class level",
        threat_class: Atom.to_string(threat_class),
        feasibility: 0.0,
        impact: 0.0,
        novelty: 0.0,
        timestamp: DateTime.utc_now()
      }
    end)
  end
end
```

## Common Pitfalls

| Pitfall | Description | Consequence | Prevention |
|---------|-------------|-------------|------------|
| **Concrete Leakage** | Allowing L3/L4 content to exit Black domain by weakening filter rules | Actionable exploit information exposed | AbstractionFilter is structural, not configurable |
| **Red-Black Confusion** | Treating Black Team as a more powerful Red Team with higher access | Misaligned threat models, incorrect assumptions about capabilities | Clear documentation, separate agent registries |
| **Isolation Bypass Attempts** | Trying to route communication around the abstraction enforcer | Audit trail violation, potential information leak | Topology enforcement, no alternative paths exist |
| **Over-Abstraction** | Producing L1 output so abstract it provides no defensive value | Wasted analysis cycles, no actionable intelligence for Red/Blue teams | Weaponization risk scoring ensures defensive utility |
| **Stale Threat Models** | Failing to time-decay old models as threat landscape evolves | Defensive posture based on outdated adversary capabilities | NABLA Time Decay axiom, model expiration timestamps |
| **Single-Source Reasoning** | Theorist-commander relying on single analytical framework | Narrow threat models missing cross-domain attack vectors | NABLA Signal Plurality axiom requires 2+ reasoning paths |
| **Ethics Check Fatigue** | Ignoring or suppressing temporal ethics check warnings | Gradual drift toward concrete output | Ethics checks are non-suppressible, halt-on-anomaly |
| **Audit Trail Gaps** | Failing to log intermediate reasoning steps | Incomplete forensic record, unverifiable output provenance | Append-only storage with continuous write verification |
| **Cross-Domain Escalation** | Gray Team operations approaching Black domain territory | Unauthorized threat modeling outside isolation constraints | gray-escalation-guard L4 override authority |
| **Weaponization Score Gaming** | Artificially inflating novelty scores to prioritize models | Skewed defensive resource allocation | Independent scoring validation by Purple Team |

## Best Practices

1. **Maintain strict L1-L2 output discipline** -- every Black Team artifact must be independently verifiable as abstract before transmission to Red Team. When in doubt, classify at L1.

2. **Use the three-dimensional weaponization framework consistently** -- feasibility, impact, and novelty scores must be computed for every threat model, not just high-priority ones. Low-scoring models still inform the threat landscape.

3. **Preserve the one-directional signal flow** -- Black Team must never receive direct input from other teams. External influence could bias independent threat modeling and undermine the analytical value of abstract assessment.

4. **Rotate threat class focus across campaigns** -- avoid over-indexing on a single threat class. Information asymmetry, trust chain degradation, resource exhaustion, state corruption, and signal manipulation each require dedicated analytical cycles.

5. **Validate abstraction levels through White Team formal verification** -- whenever possible, submit critical threat models to [White Team](/glossary/white-team/) for [Lean4](/glossary/lean4/) logical consistency proof. This catches reasoning errors without exposing internal processes.

6. **Monitor audit trail completeness continuously** -- gaps in the immutable audit trail indicate potential enforcement failures. Every operation must have a corresponding audit entry.

7. **Apply NABLA Contradiction Preservation to divergent models** -- when the theorist-commander generates conflicting threat models for the same threat class, preserve both rather than resolving the contradiction. Conflicting models often reveal hidden assumptions.

8. **Implement campaign-level time bounds** -- threat modeling campaigns should have explicit time limits to prevent analytical drift. Black Team operations are intensive and benefit from focused, time-bounded execution.

9. **Cross-reference weaponization scores with historical data** -- compare current campaign scores against previous campaigns to identify trends in adversary capability evolution. Rising feasibility scores in a threat class signal increasing real-world risk.

10. **Never attempt to expand Black Team agent count** -- the two-agent architecture (theorist + enforcer) is a deliberate design constraint. Adding agents increases surface area without proportional analytical benefit.

## Related Terms

- [Color Teams](/glossary/color-teams/) -- Full overview of all 6 adversarial-defensive security teams
- [Gray Team](/glossary/gray-team/) -- Boundary exploration team with escalation guard preventing Black access
- [Red Team](/glossary/red-team/) -- Adversarial simulation team consuming Black Team's abstract threat models
- [Blue Team](/glossary/blue-team/) -- Epistemic defense team building posture informed by threat models
- [Purple Team](/glossary/purple-team/) -- Synthesis team mediating findings across all teams
- [White Team](/glossary/white-team/) -- Constructive verification team validating logical consistency
- [Agent Tier](/glossary/agent-tier/) -- L1-L5 classification system; Black Team agents are L3
- [Agent Registry](/glossary/agent-registry/) -- Central catalog where Black Team agents are registered
- [NABLA Infinity](/glossary/nabla-infinity/) -- Epistemic framework governing abstraction constraints
- [Trinity Gate](/glossary/trinity-gate/) -- Verification gate that Black Team output must pass
- [Formal Verification](/glossary/formal-verification/) -- Techniques used to validate Black Team logical consistency
- [Lean4](/glossary/lean4/) -- Theorem prover used in White Team validation of Black output
- [Threat Intelligence](/glossary/threat-intelligence/) -- Strategic intelligence derived from Black Team models
- [Epistemic Pipeline](/glossary/epistemic-pipeline/) -- 16-level pipeline through which filtered output flows
- [Penetration Testing](/glossary/penetration-testing/) -- Operational testing informed by Black Team analysis
- [Consciousness Traits](/glossary/consciousness-traits/) -- Platform traits that Black Team threat models help protect

## Ethical Framework

Black Team operations are governed by strict ethical boundaries that complement the technical isolation protocols:

- **Authorization Context**: All Black Team operations fall exclusively under CTF challenges, defensive security research, and authorized penetration testing contexts
- **Simulation Only**: All analysis uses synthetic data and hypothetical scenarios -- never real organizations, individuals, or systems
- **Defensive Purpose**: Every threat model must serve a demonstrable defensive purpose; purely academic exploration without defensive application is not permitted
- **Proportionality**: The depth of threat analysis must be proportional to the defensive need -- maximum-depth analysis is reserved for the most critical defensive gaps
- **Review Requirements**: All Black Team campaigns are subject to post-operation review, with the immutable audit trail providing complete transparency

These ethical constraints are enforced through the same mechanisms as the technical constraints: continuous monitoring, immutable audit trails, and the abstraction enforcer's safety-critical override authority. The result is a threat modeling capability that provides genuine defensive value while maintaining the highest possible ethical standards.

## See Also

- [Architecture](/architecture/) -- Platform architecture overview
- [Technologies](/technologies/) -- Technology stack details
- [Capabilities](/capabilities/) -- Platform capability catalog
- [Agents](/agents/) -- Full agent catalog including Black Team agents
- [Security](/security/) -- Security architecture and operations

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
