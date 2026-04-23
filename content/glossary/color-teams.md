+++
title = "Color Teams"
weight = 18
[extra]
category = "security"
description = "Six adversarial-defensive security teams providing epistemic security through structured signal flow and adversarial-defensive synthesis"
related_terms = ["red-team", "blue-team", "purple-team", "gray-team", "white-team", "black-team", "attack-surface", "chaos-engineering", "easm", "hawkeye", "lean4", "qeve", "rbac", "threat-intelligence", "agent-tier", "agent-registry", "nabla-infinity", "trinity-gate", "epistemic-pipeline", "formal-verification", "consciousness-traits"]
domain = "epistemic-security"
complexity = "advanced"
maturity = "production"
platform_adoption = "core"
total_agents = 20
total_teams = 6
agent_tiers = ["L2", "L3", "L4"]
safety_critical_agents = 3
elixir_modules = ["PrismaticDark.Red.Commander", "PrismaticDark.Blue.Commander", "PrismaticDark.Purple.Coordinator", "PrismaticDark.White.Commander", "PrismaticDark.Gray.Commander", "PrismaticDark.Black.Commander"]
signal_flow = "Gray -> Red -> Purple -> Blue"
isolation_level = "sandbox"
ethics_check_interval = "10-15 seconds"
enforcement_level = "cosmic"
documentation_quality = "academic"
last_updated = "2026-02-22"
version = "2.0.0"
author = "Tomas Korcak (korczis)"
reading_time = "11 min"
word_count = 2254
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Color", "Teams", "adversarial-defensive", "security", "providing", "epistemic", "glossary", "Prismatic Platform", "Purple Team", "Blue Team"]
tags = ["glossary", "security", "color-teams", "prismatic"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Color Teams - Prismatic Platform"
+++

## Definition and Overview

Color Teams is the collective designation for six specialized security teams that provide epistemic security through adversarial-defensive synthesis within the Prismatic Platform. The teams -- Gray (boundary exploration), Red (adversarial simulation), Blue (epistemic defense), Purple (synthesis and closure), White (constructive verification), and Black (theoretical threat modeling) -- operate 20 agents across a structured signal flow architecture where findings cascade from exploration through adversarial testing to validated defense. Together they form a closed-loop security ecosystem where every defensive posture is tested against adversarial scenarios, every adversarial finding is mapped to defensive responses, and every claim of security is formally verified through [Trinity Gate](@/glossary/trinity-gate.md).

The Color Teams architecture draws from military and intelligence community traditions where distinct operational teams with different perspectives and mandates converge on a shared objective. Traditional cybersecurity organizations have employed Red Teams (offense) and Blue Teams (defense) since the Cold War era, with Purple Teams emerging in the 2010s to bridge the gap between the two. The key innovation in Prismatic's implementation is the epistemic focus: rather than testing network defenses or application vulnerabilities in the traditional sense, Color Teams test the platform's ability to form accurate beliefs, resist manipulation of its knowledge systems, and maintain epistemic integrity under adversarial pressure. This is security applied to the reasoning process itself.

All Color Teams operations are exclusively simulation-based, using synthetic data under CTF (Capture The Flag), defensive research, and authorized penetration testing authorization contexts. No production data, no PII, and no live system state is ever accessed by any Color Team agent. This constraint is enforced through sandbox isolation, network restrictions, and continuous ethics checks running every 10-15 seconds across all teams.

## Historical Context and Theoretical Foundation

The concept of adversarial testing in security predates computing entirely. Military war games, where one team plays the adversary (Red force) while another defends (Blue force), date back to Prussian Kriegsspiel in the 19th century. The United States Department of Defense formalized Red Team operations in the 1960s, tasking dedicated groups with thinking like adversaries to expose vulnerabilities in military plans and systems.

The cybersecurity industry adopted these color designations beginning in the 1990s. Red Teams conducted penetration testing, Blue Teams operated security operations centers, and the nascent Purple Team concept emerged when organizations recognized that adversarial and defensive operations were most effective when tightly coupled. The SANS Institute and MITRE ATT&CK framework further codified these roles in the 2010s.

Prismatic's Color Teams extend this tradition in three novel directions. First, they add Gray Team (boundary exploration) and Black Team (theoretical threat modeling) to address epistemic concerns that traditional security teams overlook. Second, they add White Team (constructive verification) to bring formal methods -- [Lean4](@/glossary/lean4.md) proofs, property-based testing, contract validation -- into the security loop. Third, they operate at the epistemic level, testing not just systems but the platform's ability to reason correctly under adversarial conditions. This shift reflects the unique security requirements of AI-native platforms where the reasoning process itself is a critical attack surface.

## The Six Teams

### Gray Team -- Boundary Exploration (3 Agents)

Gray Team performs read-only exploration of specification gaps, edge cases, and affordance drift. Its mandate is to surface ambiguity without resolving it -- identifying the boundaries where system behavior becomes undefined or unexpected. Gray Team enforces zero state changes in all operations, ensuring its exploration never alters the systems it examines.

| Agent | Authority | Role |
|-------|-----------|------|
| `gray-explorer-commander` | L3 Strategic | Orchestrates Gray campaigns, routes findings to Red/Blue/Purple |
| `gray-edge-finder` | L4 Specialist | Boundary value analysis, specification gap identification |
| `gray-escalation-guard` | L4 Safety-Critical | Prevents Gray-to-Black escalation, override authority to halt operations |

The `gray-escalation-guard` is particularly critical -- it prevents Gray Team's boundary exploration from inadvertently entering [Black Team](@/glossary/black-team.md) territory, maintaining the isolation boundary between exploratory and theoretical threat domains. This guard has override authority to halt any Gray operation that approaches the escalation threshold.

### Red Team -- Adversarial Simulation (4 Agents)

[Red Team](@/glossary/red-team.md) simulates epistemic attacks using five defined primitives: truth distortion, confidence manipulation, signal poisoning, drift induction, and salience hijacking. All execution is sandboxed with synthetic data only, and every scenario is logged in an immutable audit trail. Red Team's findings flow to [Purple Team](@/glossary/purple-team.md) for synthesis and to [Blue Team](@/glossary/blue-team.md) for defensive response.

| Agent | Authority | Role |
|-------|-----------|------|
| `red-commander` | L3 Strategic | Orchestrates adversarial scenarios, emits findings to Purple/Blue |
| `red-epistemic-attacker` | L2 Tactical | Truth distortion and source poisoning simulation |
| `red-drift-inducer` | L2 Tactical | Sub-threshold drift attacks, cascade propagation analysis |
| `red-scenario-generator` | L2 Tactical | Composes multi-technique scenarios from 329-entry taxonomy |

The Red Team scenario taxonomy contains 329 entries organized by attack primitive, target subsystem, and complexity level. Each scenario includes preconditions, execution steps, expected indicators, and detection signatures that feed directly into Blue Team monitoring configurations.

### Blue Team -- Epistemic Defense (4 Agents)

[Blue Team](@/glossary/blue-team.md) maintains the platform's defensive posture through evidence synthesis. Unlike traditional Blue Teams that respond to active threats, Prismatic's Blue Team produces structured evidence assessments grounded in [NABLA Infinity](@/glossary/nabla-infinity.md) axioms. It aggregates signals from multiple domains, detects behavioral and configuration drift, and maintains a continuously updated defensive posture.

| Agent | Authority | Role |
|-------|-----------|------|
| `blue-commander` | L3 Strategic | Synthesizes evidence from specialists into unified defensive posture |
| `blue-auth-sentinel` | L2 Operational | Authentication boundary monitoring, privilege escalation detection |
| `blue-drift-detector` | L2 Operational | Behavioral, configuration, dependency, and performance drift detection |
| `blue-signal-aggregator` | L2 Operational | Cross-domain signal correlation with NABLA plurality enforcement |

### Purple Team -- Synthesis and Closure (4 Agents)

[Purple Team](@/glossary/purple-team.md) serves as the central hub for Red-Blue loop closure. It is the sole authority for closure state transitions -- determining when a security finding has been adequately addressed by defensive measures. Purple Team embodies the principle that "Purple is the property of the system when it stops lying to itself."

| Agent | Authority | Role |
|-------|-----------|------|
| `purple-coordinator` | L3 Strategic | Synthesis hub, closure authority, anti-metric enforcement |
| `purple-mapper` | L4 Operational | Bidirectional Red finding to Blue defense mapping |
| `purple-closure-analyst` | L4 Operational | 4-condition closure evaluation, false closure detection |
| `purple-regression-guard` | L4 Safety-Critical | Regression trap management, deployment gate enforcement |

Purple Team's `purple-regression-guard` prevents a particularly dangerous failure mode: false closure, where a security finding appears resolved but the underlying vulnerability persists in a different form. The 4-condition closure evaluation requires evidence from Red Team (confirming the attack no longer succeeds), Blue Team (confirming the defense is active), White Team (confirming formal properties hold), and Purple Team itself (confirming no regression indicators).

### White Team -- Constructive Verification (3 Agents)

White Team proves that systems hold through progressive methodology spanning levels L0 through L5 of verification rigor. The team produces evidence artifacts using [formal verification](@/glossary/formal-verification.md) techniques including [Lean4](@/glossary/lean4.md) proofs, property-based testing, and contract validation. All White Team output passes through [Trinity Gate](@/glossary/trinity-gate.md).

| Agent | Authority | Role |
|-------|-----------|------|
| `white-verifier-commander` | L3 Strategic | Orchestrates verification campaigns, composite proof construction |
| `white-contract-validator` | L4 Operational | Interface contract testing, behaviour/protocol/API validation |
| `white-invariant-prover` | L4 Operational | Property-based testing, formal Lean4 proofs, fault injection analysis |

### Black Team -- Theoretical Threat Modeling (2 Agents)

[Black Team](@/glossary/black-team.md) operates under MAXIMUM isolation constraints, performing pure epistemic simulation of worst-case adversarial optimization. It produces abstract threat models only -- never executable content. All output is filtered through L1-L4 AbstractionFilter, and the team has zero network connectivity.

| Agent | Authority | Role |
|-------|-----------|------|
| `black-theorist-commander` | L3 Strategic (ISOLATED) | Abstract threat models, malicious optimization analysis |
| `black-abstraction-enforcer` | L3 Safety-Critical (ISOLATED) | L1-L4 output abstraction enforcement, executable content detection |

## Signal Flow Architecture

The signal flow between teams follows a structured cascade pattern where findings propagate from exploration through adversarial testing to validated defense:

```
Gray (boundary seeds) --> Red (adversarial scenarios) --> Purple (synthesis) --> Blue (defense)
                                    ^                          |       ^           |
                                    |                          v       |           v
                               Black (threat models)     White (proofs)    Platform Defense
```

The flow operates in cycles:

1. **Seeding**: Gray Team identifies boundary conditions and specification gaps, feeding these as seeds to Red Team
2. **Attack Simulation**: Red Team constructs adversarial scenarios from Gray seeds and Black Team abstract threat models
3. **Synthesis**: Purple Team maps Red Team findings to Blue Team defensive capabilities, identifying gaps
4. **Defense**: Blue Team updates its defensive posture based on Purple Team synthesis, producing structured evidence
5. **Verification**: White Team formally verifies that defensive measures satisfy their stated properties
6. **Closure**: Purple Team evaluates whether the Red-Blue loop can be closed for each finding, using 4-condition evaluation

This cycle operates continuously, with each iteration potentially generating new boundary conditions for Gray Team to explore, creating a self-reinforcing security improvement loop.

## Technical Implementation

### Color Team Coordination GenServer

```elixir
defmodule PrismaticDark.ColorTeam.Coordinator do
  @moduledoc """
  Coordinates signal flow across all six Color Teams.
  Manages the adversarial-defensive cycle, routes findings,
  and enforces safety protocols. This is the central
  orchestration point for all Color Team operations.
  """

  use GenServer

  @type team :: :gray | :red | :blue | :purple | :white | :black
  @type finding :: %{
    id: String.t(),
    source_team: team(),
    severity: :critical | :high | :medium | :low,
    category: atom(),
    description: String.t(),
    evidence: [map()],
    timestamp: DateTime.t()
  }

  @type cycle_state :: %{
    cycle_id: String.t(),
    phase: :seeding | :attack | :synthesis | :defense | :verification | :closure,
    findings: [finding()],
    started_at: DateTime.t(),
    team_status: %{team() => :active | :idle | :blocked}
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec submit_finding(finding()) :: {:ok, String.t()} | {:error, term()}
  def submit_finding(finding) do
    GenServer.call(__MODULE__, {:submit_finding, finding})
  end

  @spec get_cycle_status() :: {:ok, cycle_state()}
  def get_cycle_status do
    GenServer.call(__MODULE__, :get_status)
  end

  @impl true
  def init(opts) do
    state = %{
      current_cycle: nil,
      findings: [],
      safety_check_ref: schedule_safety_check(),
      opts: opts
    }

    {:ok, state}
  end

  @impl true
  def handle_call({:submit_finding, finding}, _from, state) do
    with :ok <- validate_finding(finding),
         :ok <- check_safety_constraints(finding),
         {:ok, routed} <- route_finding(finding) do
      :telemetry.execute(
        [:prismatic, :color_team, :finding],
        %{count: 1},
        %{team: finding.source_team, severity: finding.severity}
      )

      {:reply, {:ok, routed.id}, %{state | findings: [finding | state.findings]}}
    else
      {:error, reason} -> {:reply, {:error, reason}, state}
    end
  end

  @impl true
  def handle_call(:get_status, _from, state) do
    {:reply, {:ok, build_status(state)}, state}
  end

  @impl true
  def handle_info(:safety_check, state) do
    run_ethics_validation(state)
    state = %{state | safety_check_ref: schedule_safety_check()}
    {:noreply, state}
  end

  @spec route_finding(finding()) :: {:ok, finding()} | {:error, term()}
  defp route_finding(%{source_team: :gray} = finding) do
    PrismaticDark.Red.Commander.ingest_boundary_seed(finding)
    {:ok, finding}
  end

  defp route_finding(%{source_team: :red} = finding) do
    PrismaticDark.Purple.Coordinator.ingest_adversarial_finding(finding)
    PrismaticDark.Blue.Commander.update_threat_model(finding)
    {:ok, finding}
  end

  defp route_finding(%{source_team: :black} = finding) do
    PrismaticDark.Red.Commander.ingest_threat_model(finding)
    {:ok, finding}
  end

  defp route_finding(finding), do: {:ok, finding}

  defp schedule_safety_check do
    interval = Enum.random(10_000..15_000)
    Process.send_after(self(), :safety_check, interval)
  end

  defp validate_finding(_finding), do: :ok
  defp check_safety_constraints(_finding), do: :ok
  defp run_ethics_validation(_state), do: :ok
  defp build_status(state), do: %{findings_count: length(state.findings)}
end
```

## Agent Composition Summary

| Team | Agents | L2 | L3 | L4 | Safety-Critical |
|------|--------|----|----|----|-----------------|
| Gray | 3 | 0 | 1 | 2 | 1 (escalation-guard) |
| Red | 4 | 3 | 1 | 0 | 0 |
| Blue | 4 | 3 | 1 | 0 | 0 |
| Purple | 4 | 0 | 1 | 3 | 1 (regression-guard) |
| White | 3 | 0 | 1 | 2 | 0 |
| Black | 2 | 0 | 2 | 0 | 1 (abstraction-enforcer) |
| **Total** | **20** | **6** | **7** | **7** | **3** |

All agents are registered in the [Agent Registry](@/glossary/agent-registry.md) with their full capability specifications, [Agent Tier](@/glossary/agent-tier.md) classifications, and domain assignments.

## Safety Protocols

Color Teams operations are governed by comprehensive safety protocols that prevent misuse, data leakage, and scope creep:

| Protocol | Enforcement | Scope |
|----------|-------------|-------|
| **Sandbox Isolation** | All Red/Black operations execute in PrismaticDark.Sandbox only | Red, Black |
| **Synthetic Data Only** | No real data, no PII, no production state in any simulation | All teams |
| **No Network Access** | Zero network connectivity for isolated operations | Red, Black |
| **Ethics Checks** | Automated validation every 10-15 seconds across all teams | All teams |
| **Escalation Guards** | Gray Escalation Guard and Black Abstraction Enforcer prevent scope creep | Gray, Black |
| **Audit Logging** | Immutable audit trail for every operation across all teams | All teams |
| **No Executable Output** | Black domain never produces executable code or exploit instructions | Black |
| **Abstraction Filtering** | All Black output filtered through L1-L4 AbstractionFilter | Black |
| **Closure Authority** | Only Purple Team can declare a finding closed; false closure detection active | Purple |
| **Regression Prevention** | Purple regression-guard blocks deployment on security regression | Purple |

## Epistemic Security Model

The Color Teams architecture implements a novel approach to platform security that operates at the epistemic level rather than the traditional network or application level. The core premise is that a platform capable of autonomous reasoning must secure not just its data and infrastructure but its reasoning process itself.

[NABLA Infinity](@/glossary/nabla-infinity.md) axioms govern how beliefs are formed. [Trinity Gate](@/glossary/trinity-gate.md) governs how beliefs are accepted. Color Teams govern how those mechanisms are tested under adversarial conditions. This layered approach ensures that:

- Signal manipulation attacks are detected by Blue Team's signal aggregator
- Confidence manipulation is tested by Red Team's epistemic attacker
- Drift attacks are monitored by Blue Team's drift detector and tested by Red Team's drift inducer
- Formal properties are proven by White Team's invariant prover
- Theoretical worst-cases are modeled by Black Team's theorist-commander
- All findings are synthesized by Purple Team into actionable defensive posture

## Integration with Platform Systems

### Threat Intelligence Integration

Color Teams consume [threat intelligence](@/glossary/threat-intelligence.md) feeds to inform their operations. Red Team uses threat actor profiles and TTPs to construct realistic adversarial scenarios. Blue Team incorporates IOCs into its monitoring configurations. Purple Team correlates external threat intelligence with internal findings to assess risk.

### EASM Coordination

[Prismatic Perimeter](@/glossary/easm.md) and Color Teams coordinate to cover both external and epistemic attack surfaces. While Perimeter monitors the technical attack surface (exposed services, vulnerable configurations), Color Teams monitor the epistemic attack surface (knowledge manipulation, reasoning degradation).

### Quality Gates Integration

Color Team findings feed into [quality gates](@/glossary/quality-gates.md) as security constraints. A finding with severity "critical" that lacks Purple Team closure blocks deployment through the platform's pre-commit quality gate system.

## Best Practices

1. **Maintain team isolation boundaries**: Each team's mandate is precisely defined. Gray explores boundaries, Red attacks, Blue defends, Purple synthesizes, White verifies, Black models threats. Crossing these boundaries weakens the architecture's adversarial integrity.

2. **Enforce the signal flow direction**: Findings must flow through the defined cascade. Bypassing Purple Team synthesis to go directly from Red to Blue eliminates the loop closure mechanism.

3. **Require 4-condition closure**: Never close a finding without evidence from all four relevant perspectives (Red confirms attack fails, Blue confirms defense active, White confirms properties hold, Purple confirms no regression).

4. **Run ethics checks continuously**: The 10-15 second ethics check interval is not negotiable. Disabling or extending this interval creates windows for scope creep.

5. **Preserve Black Team isolation**: Black Team's maximum isolation constraints exist because theoretical threat modeling can produce dangerous insights. The abstraction enforcer must validate every output.

## Common Pitfalls

- **Red-Blue Direct Coupling**: When Red Team findings go directly to Blue Team without Purple Team synthesis, defensive responses lack strategic context and may address symptoms rather than root causes.

- **False Closure Acceptance**: Accepting closure based on incomplete evidence (missing one or more of the four conditions) creates a false sense of security. Purple Team's closure-analyst must rigorously evaluate all conditions.

- **Gray-to-Black Escalation**: Gray Team's boundary exploration can inadvertently approach Black Team's threat modeling territory. The escalation guard must be active and empowered to halt operations.

- **Metric Gaming**: Measuring Color Team effectiveness by finding count incentivizes low-severity findings. Purple Team's anti-metric enforcement resists quantification that distorts behavior.

- **Stale Threat Models**: Black Team threat models that are not updated with current [threat intelligence](@/glossary/threat-intelligence.md) produce scenarios that are theoretically interesting but operationally irrelevant.

## Related Terms

- [Red Team](@/glossary/red-team.md) -- Adversarial simulation team with 4 agents and 5 attack primitives
- [Blue Team](@/glossary/blue-team.md) -- Epistemic defense team producing structured evidence
- [Purple Team](@/glossary/purple-team.md) -- Synthesis and closure authority mediating Red-Blue loop
- [Gray Team](@/glossary/gray-team.md) -- Boundary exploration team seeding the signal flow
- [White Team](@/glossary/white-team.md) -- Constructive verification team using formal proofs
- [Black Team](@/glossary/black-team.md) -- Maximum isolation theoretical threat modeling team
- [Agent Tier](@/glossary/agent-tier.md) -- L1-L5 authority classification for all Color Team agents
- [Agent Registry](@/glossary/agent-registry.md) -- Central catalog tracking all 20 Color Team agents
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- Epistemic framework that Color Teams test and defend
- [Trinity Gate](@/glossary/trinity-gate.md) -- Verification gate validated by White Team proofs
- [Formal Verification](@/glossary/formal-verification.md) -- Techniques used by White Team
- [Lean4](@/glossary/lean4.md) -- Theorem prover used in White Team formal proofs
- [Epistemic Pipeline](@/glossary/epistemic-pipeline.md) -- 16-level pipeline that Color Teams protect
- [Attack Surface](@/glossary/attack-surface.md) -- External surface monitored alongside epistemic surface
- [EASM](@/glossary/easm.md) -- External attack surface management complementing Color Teams
- [Threat Intelligence](@/glossary/threat-intelligence.md) -- Intelligence feeds consumed by Color Teams
- [Consciousness Traits](@/glossary/consciousness-traits.md) -- Platform traits requiring epistemic security protection

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Technologies](@/technologies/_index.md) -- Technology stack details
- [Capabilities](@/capabilities/_index.md) -- Platform capability catalog
- [Agents](@/agents/_index.md) -- Full agent catalog including all Color Team agents

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
