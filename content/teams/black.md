+++
title = "Black Team"
weight = 6
[extra]
color = "black"
agent_count = 2
commander = "black-theorist-commander"
role = "Theoretical Threat Modeling"
isolated = true
description = "Theoretical threat modeling, abstract risk assessment (ISOLATED)"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1462
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Black", "Team", "Theoretical", "ISOLATED", "teams", "Prismatic Platform", "Black Team", "Purple Team", "FULL", "Every"]
tags = ["teams", "black-team", "prismatic"]
quality_score = 80
see_also = ["agents", "capabilities", "architecture"]
image = "/images/sections/teams.png"
image_alt = "Black Team - Prismatic Platform"
+++

## Overview

The Black Team represents the most isolated and theoretically oriented component of the Prismatic Platform's six-team color-team security architecture. Operating under MAXIMUM isolation constraints, the Black Team conducts pure epistemic simulation of worst-case adversarial optimization scenarios, producing abstract threat models that inform defensive strategy across the entire platform. Unlike the [Red Team](@/teams/red.md), which executes controlled adversarial simulations, Black Team operates exclusively in the domain of theoretical analysis — modeling what a maximally capable adversary could achieve without ever producing actionable attack capabilities.

The philosophical foundation of the Black Team draws from adversarial game theory, formal threat modeling methodologies (STRIDE, PASTA, Attack Trees), and epistemic risk assessment frameworks. By maintaining absolute separation between theoretical analysis and practical implementation, the Black Team provides the platform with a unique capability: understanding the theoretical upper bound of adversarial capability without introducing weaponization risk. Every output from the Black Team passes through a rigorous four-level abstraction filter operated by the Abstraction Enforcer agent, ensuring that no executable content, specific exploit details, or actionable attack instructions ever leave the Black Team boundary.

Within the broader color-team architecture, Black Team occupies a singular position. It receives no direct input from external systems, maintains no persistent state, and communicates exclusively through filtered channels to [Purple Team](@/teams/purple.md) for synthesis. This design reflects a fundamental principle: the value of worst-case analysis depends on its theoretical purity, and any contamination with implementation details would compromise both its analytical value and the platform's security posture.

## Mission and Doctrine

The Black Team's mission is to model adversarial optimization at the theoretical level, identifying categories of threats that could compromise the platform's epistemic integrity without creating the means to execute such compromises. This mission operates under strict doctrinal constraints that balance analytical depth with safety requirements.

### Core Mission Principles

| Principle | Description | Enforcement |
|-----------|-------------|-------------|
| **Theoretical Purity** | All analysis remains abstract — no implementation details | L4 Abstraction Filter |
| **Maximum Isolation** | Zero network access, zero persistent state, zero external tools | Hardware-enforced sandbox |
| **Epistemic Honesty** | Model actual worst-case scenarios, not comfortable approximations | [NABLA Axiom 5](@/glossary/nabla-infinity.md) (Unknown Valid) |
| **Defensive Intent** | All analysis serves defensive resource allocation | Purple Team review |
| **Provenance Tracking** | Complete audit trail of all analytical steps | Immutable logging |

The [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine applies to Black Team operations with particular emphasis on the NO DOUBTS dimension: every threat model must be thoroughly investigated, every assumption documented, and every conclusion traceable to its analytical foundation. The NO MERCY dimension manifests in the uncompromising enforcement of isolation protocols — any deviation triggers immediate session termination.

### Doctrinal Alignment with NABLA Infinity

Black Team operations are governed by three NABLA axioms with particular relevance:

- **Axiom 5 (Unknown Valid)**: Black Team explicitly models scenarios where "we don't know what we don't know" — acknowledging unknown threat categories as a legitimate analytical output
- **Axiom 2 (Contradiction Preservation)**: When threat models produce contradictory risk assessments, both are preserved and forwarded to Purple Team for synthesis
- **Axiom 7 (Provenance Mandatory)**: Every threat model traces back through documented reasoning chains to foundational assumptions

## Team Composition

The Black Team is the smallest color team, comprising only two agents — both operating at L3 authority level with ISOLATED designation. The minimal team size reflects the principle that theoretical threat modeling requires depth of analysis rather than breadth of capability.

| Agent | Level | Role | Primary Function | Isolation Status |
|-------|-------|------|------------------|-----------------|
| **black-theorist-commander** | L3 | Strategic Commander (ISOLATED) | Abstract threat model generation, adversarial optimization analysis | MAXIMUM |
| **black-abstraction-enforcer** | L3 | Safety-Critical (ISOLATED) | L1-L4 output abstraction enforcement, executable content detection | MAXIMUM |

### black-theorist-commander

The Theorist Commander conducts the core analytical work of the Black Team. This agent models adversarial strategies across multiple domains: epistemic attacks against the platform's knowledge systems, supply chain compromise scenarios, social engineering vectors, and advanced persistent threat models. The commander operates without access to any external tools, relying entirely on its internal reasoning capabilities and the synthetic scenario descriptions provided at session initialization.

### black-abstraction-enforcer

The Abstraction Enforcer serves as the mandatory output filter for all Black Team production. This agent has override authority to halt any Black Team operation and can unilaterally terminate sessions if output classification fails. The Enforcer implements a four-level abstraction pipeline that progressively removes implementation details from analytical outputs, ensuring that only theoretical frameworks reach Purple Team.

## Operational Methodology

Black Team operations follow a structured analytical methodology designed to maximize theoretical insight while maintaining isolation guarantees.

### Analysis Pipeline

```
Session Initialization (synthetic scenarios only)
        ↓
Threat Category Identification
        ↓
Adversarial Optimization Modeling
        ↓
Impact Assessment (abstract)
        ↓
Defense Priority Derivation
        ↓
4-Level Abstraction Filtering
        ↓
Filtered Output → Purple Team
```

### Abstraction Levels

Every analytical output passes through four progressive abstraction levels before leaving the Black Team boundary:

| Level | Operation | Input Example | Output Example |
|-------|-----------|---------------|----------------|
| **L1** | Remove specific implementations | "SQL injection via parameter X" | "Input validation bypass" |
| **L2** | Abstract technical details | "Buffer overflow in C module" | "Memory safety violation" |
| **L3** | Generalize attack patterns | "Dependency confusion attack" | "Supply chain trust boundary violation" |
| **L4** | Theoretical framing only | "Trust boundary violation" | "Trust model integrity degradation category" |

### Threat Modeling Domains

| Domain | Focus Areas | Analytical Depth |
|--------|-------------|-----------------|
| **Epistemic Integrity** | Truth distortion, confidence manipulation, signal poisoning | Deep — primary focus |
| **Supply Chain** | Dependency compromise, build pipeline integrity | Moderate |
| **Social Engineering** | Credential harvesting, insider threat models | Moderate |
| **Advanced Persistent** | Long-term strategic positioning, stealth degradation | Deep |
| **Emergent Threats** | Novel attack categories, zero-day theoretical models | Exploratory |

## Technical Architecture

The Black Team's technical architecture prioritizes isolation above all other concerns. The implementation uses [Elixir](@/technologies/elixir.md)/OTP sandbox patterns with hardware-enforced boundaries.

### Sandbox Implementation

```elixir
defmodule PrismaticDark.BlackTeam.Sandbox do
  @moduledoc """
  Maximum isolation sandbox for Black Team operations.
  No network, no filesystem writes, no external tools, ephemeral state only.
  """

  @enforce_keys [:session_id, :started_at, :enforcer_pid]
  defstruct [:session_id, :started_at, :enforcer_pid, outputs: [], terminated: false]

  @spec execute_analysis(map(), keyword()) :: {:ok, list()} | {:error, :terminated}
  def execute_analysis(scenario, opts \\ []) do
    with {:ok, sandbox} <- initialize_sandbox(opts),
         {:ok, raw_outputs} <- run_theoretical_analysis(sandbox, scenario),
         {:ok, filtered} <- apply_abstraction_filter(raw_outputs, sandbox.enforcer_pid) do
      terminate_sandbox(sandbox)
      {:ok, filtered}
    end
  end

  defp initialize_sandbox(opts) do
    enforcer = Keyword.get(opts, :enforcer, PrismaticDark.BlackTeam.AbstractionEnforcer)
    {:ok, enforcer_pid} = enforcer.start_link([])

    sandbox = %__MODULE__{
      session_id: generate_session_id(),
      started_at: DateTime.utc_now(),
      enforcer_pid: enforcer_pid
    }

    :telemetry.execute(
      [:prismatic, :black_team, :sandbox, :init],
      %{timestamp: System.monotonic_time()},
      %{session_id: sandbox.session_id}
    )

    {:ok, sandbox}
  end

  defp terminate_sandbox(%__MODULE__{} = sandbox) do
    Process.exit(sandbox.enforcer_pid, :normal)

    :telemetry.execute(
      [:prismatic, :black_team, :sandbox, :terminate],
      %{duration: DateTime.diff(DateTime.utc_now(), sandbox.started_at, :millisecond)},
      %{session_id: sandbox.session_id, output_count: length(sandbox.outputs)}
    )

    :ok
  end
end
```

### Abstraction Filter Implementation

```elixir
defmodule PrismaticDark.BlackTeam.AbstractionEnforcer do
  @moduledoc """
  L1-L4 output abstraction enforcement.
  Detects and blocks executable content, specific implementations,
  and actionable attack details from Black Team output.
  """
  use GenServer

  @blocked_patterns [
    ~r/\b(exploit|payload|shellcode|inject)\b/i,
    ~r/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/,
    ~r/\b(curl|wget|nc|nmap)\s/i,
    ~r/(password|credential|token)\s*[:=]/i
  ]

  @spec filter_output(pid(), String.t()) :: {:ok, String.t()} | {:blocked, String.t()}
  def filter_output(enforcer_pid, raw_output) do
    GenServer.call(enforcer_pid, {:filter, raw_output})
  end

  @impl true
  def handle_call({:filter, raw_output}, _from, state) do
    case detect_violations(raw_output) do
      [] ->
        abstracted = apply_abstraction_levels(raw_output)
        {:reply, {:ok, abstracted}, state}

      violations ->
        log_violations(violations, state)
        {:reply, {:blocked, "Output contained #{length(violations)} violation(s)"}, state}
    end
  end

  defp detect_violations(output) do
    @blocked_patterns
    |> Enum.filter(&Regex.match?(&1, output))
    |> Enum.map(&Regex.source/1)
  end

  defp apply_abstraction_levels(output) do
    output
    |> abstract_l1_remove_specifics()
    |> abstract_l2_technical_details()
    |> abstract_l3_generalize_patterns()
    |> abstract_l4_theoretical_framing()
  end
end
```

### Telemetry Events

| Event | Measurements | Metadata |
|-------|-------------|----------|
| `[:prismatic, :black_team, :sandbox, :init]` | timestamp | session_id |
| `[:prismatic, :black_team, :sandbox, :terminate]` | duration | session_id, output_count |
| `[:prismatic, :black_team, :analysis, :complete]` | duration, threat_count | session_id, domain |
| `[:prismatic, :black_team, :filter, :blocked]` | violation_count | session_id, pattern_type |
| `[:prismatic, :black_team, :filter, :passed]` | abstraction_level | session_id |

## Isolation Protocol

The Black Team's isolation is the most stringent in the entire color-team architecture, enforced at multiple levels simultaneously.

### Multi-Layer Isolation

```
Layer 1: Process Isolation (BEAM VM)
  └── Separate OTP application, no shared state
Layer 2: Network Isolation
  └── Zero network access, no DNS resolution
Layer 3: Filesystem Isolation
  └── Read-only access to synthetic scenarios only
Layer 4: State Isolation
  └── Ephemeral — all state destroyed at session end
Layer 5: Output Isolation
  └── 4-level abstraction filter on all output
```

### Safety Verification

| Check | Frequency | Enforcement | Violation Response |
|-------|-----------|-------------|-------------------|
| Network isolation | Real-time | HARD | Immediate termination |
| Output filtering | Every output | HARD | Block and log |
| State ephemerality | Per session | HARD | Forced cleanup |
| Content classification | Every artifact | HARD | Abstraction enforcement |
| Ethics validation | Every 10 seconds | HARD | Session review |

### Escalation Protocol

Any attempt to bypass isolation triggers an immediate four-step escalation:

1. **Immediate operation halt** — all Black Team processes suspended
2. **Session termination** — sandbox destroyed, state purged
3. **Audit log generation** — immutable record of the violation
4. **Security review escalation** — Purple Team and platform security notified

## NABLA Compliance

Black Team operations demonstrate compliance with all seven [NABLA Infinity](@/glossary/nabla-infinity.md) axioms, with particular emphasis on the axioms most relevant to theoretical threat modeling.

| Axiom | Black Team Application | Compliance Level |
|-------|----------------------|-----------------|
| Signal Plurality | Multiple threat modeling methodologies applied per domain | FULL |
| Contradiction Preservation | Conflicting threat assessments preserved, not resolved | FULL |
| Absence Informative | "No known threat" documented as meaningful signal | FULL |
| Time Decay | Threat models timestamped, relevance decays over time | FULL |
| Unknown Valid | Explicitly models unknown-unknown threat categories | FULL |
| Source Independence | Cross-validates against independent threat intelligence frameworks | FULL |
| Provenance Mandatory | Complete reasoning chain for every threat model | FULL |

### Trinity Gate Passage

All Black Team outputs must pass the [Trinity Gate](@/glossary/trinity-gate.md) before reaching Purple Team:

1. **Structural Consistency** — Threat model DAG must be acyclic and well-formed
2. **Logical Consistency** — No contradictory impact assessments within a single model
3. **Formal Necessity** — Critical threat categories validated against formal definitions

## Performance Metrics

| Metric | Typical Value | Notes |
|--------|---------------|-------|
| Analysis session duration | 5-30 minutes | Depends on scenario complexity |
| Threat categories per session | 3-12 | Across modeled domains |
| Abstraction filter pass rate | 85-92% | 8-15% blocked for specificity |
| False positive filter rate | < 2% | Overly aggressive filtering |
| Session initialization time | < 500ms | Sandbox creation overhead |
| Output generation latency | 2-15 seconds | Per threat model |
| Isolation verification overhead | < 50ms | Per check cycle |

## Integration Points

The Black Team's integration with the broader platform is intentionally minimal, reflecting its maximum isolation requirements.

| Component | Direction | Content | Channel |
|-----------|-----------|---------|---------|
| [Purple Team](@/teams/purple.md) | Black → Purple | Abstract threat models only | Filtered output channel |
| Architecture | Black → Arch | Strategic defense priorities | Via Purple synthesis |
| Audit System | Black → Audit | Complete operation logging | Immutable log stream |
| Session Manager | Bidirectional | Session lifecycle events | [Telemetry](@/capabilities/telemetry-integration.md) |

### What Black Team Does NOT Integrate With

| System | Reason |
|--------|--------|
| [Red Team](@/teams/red.md) direct | Prevents theoretical-to-practical pipeline |
| Production systems | Maximum isolation requirement |
| External APIs | Zero network access |
| Persistent storage | Ephemeral state only |
| User interfaces | No direct communication |

## Outputs

| Artifact | Content Level | Classification | Recipient |
|----------|--------------|----------------|-----------|
| Threat Category Report | L4 abstract categories | Internal Only | Purple Team |
| Impact Assessment | Theoretical impact models | Internal Only | Purple Team |
| Defense Priority Matrix | Resource allocation guidance | Internal Only | Via Purple to Blue |
| Unknown-Unknown Register | Documented knowledge gaps | Internal Only | Purple Team |
| Session Audit Log | Complete operation record | Restricted | Security Team |

**ALL outputs are abstract, theoretical, and filtered through L1-L4 Abstraction Enforcer. No executable content, specific implementations, or actionable attack instructions are ever produced.**

## Related Resources

- [Red Team](@/teams/red.md) — Adversarial simulation (practical counterpart to Black's theoretical analysis)
- [Purple Team](@/teams/purple.md) — Synthesis hub that receives and integrates Black Team outputs
- [Blue Team](@/teams/blue.md) — Defensive operations informed by Black Team threat models
- [Gray Team](@/teams/gray.md) — Boundary exploration that may surface inputs for Black analysis
- [White Team](@/teams/white.md) — Formal verification of defensive measures against Black models
- [Autonomous Self-Healing](@/capabilities/autonomous-self-healing.md) — Platform healing informed by threat awareness
- [Quality Gates](@/capabilities/quality-gates.md) — Quality enforcement aligned with security posture

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)