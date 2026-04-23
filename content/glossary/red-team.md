+++
title = "Red Team"
weight = 19
[extra]
description = "Adversarial simulation team using 5 epistemic attack primitives in sandboxed environments for security validation"
category = "security"
tags = ["adversarial-security", "epistemic-attacks", "color-teams", "threat-simulation", "sandbox-isolation", "penetration-testing", "attack-taxonomy"]
related_terms = ["color-teams", "blue-team", "purple-team", "nabla-infinity", "black-team", "gray-team", "tactical-execution", "white-team", "signal-plurality", "trinity-gate"]
difficulty = "advanced"
importance = "critical"
platform_relevance = "core"
date_created = "2025-06-15"
date_updated = "2026-02-22"
version = "3.0.0"
audience = ["security-engineers", "platform-architects", "ai-safety-researchers", "compliance-officers"]
prerequisites = ["color-teams", "nabla-infinity", "nm-nd", "aiad"]
domain = "security-operations"
related_patterns = ["adversarial-synthesis", "sandbox-isolation", "attack-taxonomy", "campaign-orchestration", "epistemic-validation"]
see_also = ["architecture/_index.md", "agents/_index.md", "technologies/_index.md", "capabilities/_index.md"]
acronyms = ["AIAD", "NM/ND", "NABLA", "OSINT", "CTF"]
standards = ["MITRE-ATT&CK", "OWASP", "NIST-CSF", "ISO-27001"]
tools = ["PrismaticDark.Sandbox", "PrismaticDark.RedTeam.Taxonomy", "PrismaticDark.RedTeam.Campaign"]
platforms = ["prismatic-platform", "beam-vm", "fly-io"]
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
word_count = 2346
date_modified = "2026-02-23"
keywords = ["Red", "Team", "Adversarial", "glossary", "security", "Prismatic Platform", "Red Team", "Purple Team"]
quality_score = 90
image = "/images/sections/glossary.png"
image_alt = "Red Team - Prismatic Platform"
+++

## Definition and Overview

The Red Team is a specialized security operations unit within the Prismatic Platform's six-team Color Team architecture that conducts adversarial simulation exercises to identify vulnerabilities, weaknesses, and failure modes in systems, processes, and epistemic defenses. Originating from Cold War military exercises where a dedicated "red" force simulated enemy tactics against defending "blue" forces, the concept has evolved into a cornerstone of modern cybersecurity, AI safety, and epistemic security practices. In the Prismatic Platform, the Red Team extends this tradition into the domain of epistemic security, targeting the integrity of knowledge systems, reasoning pipelines, and decision-making processes rather than just network infrastructure.

The Prismatic Platform's Red Team operates as one of six color teams -- alongside [Gray Team](@/glossary/gray-team.md), [Blue Team](@/glossary/blue-team.md), [Purple Team](@/glossary/purple-team.md), [White Team](@/glossary/white-team.md), and [Black Team](@/glossary/black-team.md) -- forming a comprehensive adversarial-defensive synthesis architecture governed by the [NO MERCY, NO DOUBTS](@/glossary/nm-nd.md) doctrine. The Red Team consists of 4 agents operating in a hierarchical command structure, simulating epistemic attacks using five defined primitives and generating adversarial scenarios from a comprehensive 329-entry attack taxonomy. All operations are sandboxed with synthetic data and zero network access, ensuring that adversarial simulations cannot affect production systems or real data.

The distinction between traditional Red Teaming and epistemic Red Teaming is fundamental to understanding the platform's security model. Traditional Red Teams target network infrastructure, applications, and physical security perimeters. Epistemic Red Teams target the integrity of belief formation, evidence evaluation, and confidence calibration -- areas where subtle manipulation can have outsized impact on system behavior without triggering conventional security alarms.

| Aspect | Traditional Red Team | Epistemic Red Team (Prismatic) |
|--------|--------------------|--------------------|
| **Target** | Network infrastructure, applications | Knowledge systems, reasoning pipelines |
| **Attack Surface** | Ports, APIs, authentication | Evidence sources, confidence scores, belief formation |
| **Primitives** | Exploit, pivot, exfiltrate, persist | Distort, manipulate, poison, induce drift, hijack |
| **Success Metric** | System compromise | Epistemic integrity degradation |
| **Safety Controls** | Network isolation | Sandbox + synthetic data + zero network |
| **Taxonomy Size** | Varies by framework | 329 entries, systematically organized |
| **Integration** | Standalone assessments | Continuous Purple Team synthesis loop |

## The Five Epistemic Attack Primitives

The Red Team's operations are structured around five fundamental attack primitives that cover the full spectrum of epistemic manipulation. These primitives were derived from analysis of historical epistemic failures in AI systems, intelligence analysis, and decision-support platforms, and represent the minimal complete set needed to model adversarial behavior against knowledge systems.

**1. Truth Distortion**: Modifying the factual content of information sources to introduce inaccuracies. This includes subtle alterations that pass surface-level verification but corrupt downstream reasoning. The `red-epistemic-attacker` agent specializes in crafting distortions that exploit the gap between syntactic validity and semantic correctness. For example, modifying a security rating calculation by 2% -- small enough to avoid threshold alerts but sufficient to change a grade boundary from B to C when aggregated across multiple data points.

**2. Confidence Manipulation**: Inflating or deflating confidence scores associated with beliefs or evidence without changing the underlying facts. This attack exploits systems that use confidence thresholds for decision-making, pushing marginal decisions across threshold boundaries. In the context of [NABLA Infinity](@/glossary/nabla-infinity.md), confidence manipulation targets the transition point between exploration (confidence < 0.95) and execution (confidence >= 0.95), potentially causing premature commitment or indefinite deferral.

**3. Signal Poisoning**: Injecting false or misleading signals into evidence streams to corrupt the [Signal Plurality](@/glossary/signal-plurality.md) axiom that requires minimum two independent signals for belief formation. Poisoned signals appear to originate from independent sources, undermining the plurality requirement by creating the appearance of multi-source corroboration from a single adversarial origin.

**4. Drift Induction**: Introducing sub-threshold changes that individually pass detection but collectively shift system behavior over time. The `red-drift-inducer` agent specializes in cascade propagation analysis, identifying how small perturbations compound through interconnected systems. Drift induction is particularly dangerous because each individual change is within normal variance, making detection dependent on tracking cumulative divergence rather than individual anomalies.

**5. Salience Hijacking**: Manipulating which information receives attention in reasoning processes. By elevating irrelevant signals or suppressing critical ones, salience hijacking corrupts prioritization without altering the underlying data. This primitive targets attention mechanisms in both automated systems and human analysts, exploiting the finite bandwidth of reasoning processes.

## The 329-Entry Attack Taxonomy

The Red Team maintains a comprehensive taxonomy of adversarial scenarios organized by attack primitive, target subsystem, and complexity level. This taxonomy serves as both a testing framework and a knowledge base of known epistemic attack patterns.

```elixir
defmodule PrismaticDark.RedTeam.Taxonomy do
  @moduledoc """
  329-entry adversarial scenario taxonomy for systematic
  epistemic security testing. All scenarios execute in
  sandboxed environments with synthetic data only.

  The taxonomy is organized into four complexity levels:
  - :basic - Single primitive, single target
  - :intermediate - Single primitive, multiple targets
  - :advanced - Multiple primitives, coordinated attack
  - :composite - Full campaign with chained primitives
  """

  @type attack_primitive ::
    :truth_distortion
    | :confidence_manipulation
    | :signal_poisoning
    | :drift_induction
    | :salience_hijacking

  @type complexity :: :basic | :intermediate | :advanced | :composite

  @type scenario :: %{
    id: String.t(),
    primitive: attack_primitive(),
    target: String.t(),
    complexity: complexity(),
    description: String.t(),
    preconditions: [String.t()],
    expected_impact: String.t(),
    detection_difficulty: float(),
    mitre_mapping: String.t() | nil,
    created_at: DateTime.t()
  }

  @spec scenarios_by_primitive(attack_primitive()) :: [scenario()]
  def scenarios_by_primitive(primitive) do
    taxonomy()
    |> Enum.filter(&(&1.primitive == primitive))
    |> Enum.sort_by(&(&1.complexity))
  end

  @spec composite_scenarios() :: [scenario()]
  def composite_scenarios do
    taxonomy()
    |> Enum.filter(&(&1.complexity == :composite))
  end

  @spec scenarios_targeting(String.t()) :: [scenario()]
  def scenarios_targeting(subsystem) do
    taxonomy()
    |> Enum.filter(&(subsystem in &1.targets))
  end

  @spec scenarios_by_detection_difficulty(float(), float()) :: [scenario()]
  def scenarios_by_detection_difficulty(min_difficulty, max_difficulty) do
    taxonomy()
    |> Enum.filter(fn s ->
      s.detection_difficulty >= min_difficulty and s.detection_difficulty <= max_difficulty
    end)
    |> Enum.sort_by(& &1.detection_difficulty, :desc)
  end

  @spec taxonomy_statistics() :: map()
  def taxonomy_statistics do
    all = taxonomy()
    %{
      total: length(all),
      by_primitive: Enum.frequencies_by(all, & &1.primitive),
      by_complexity: Enum.frequencies_by(all, & &1.complexity),
      avg_detection_difficulty: Enum.map(all, & &1.detection_difficulty) |> then(&(Enum.sum(&1) / length(&1)))
    }
  end
end
```

The taxonomy is not static. The `red-scenario-generator` agent continuously expands it based on emerging threats, new platform capabilities, findings from [Black Team](@/glossary/black-team.md) theoretical threat models, and real-world epistemic attack patterns observed in the cybersecurity and AI safety communities. Each new scenario undergoes validation through the [Trinity Gate](@/glossary/trinity-gate.md) before inclusion.

## Agent Architecture

The Red Team consists of four agents operating in a hierarchical command structure defined by the [AIAD](@/glossary/aiad.md) standard. Each agent has a specific role, authority level, and specialization that determines its operational scope and interaction patterns.

| Agent | Role | Level | Specialization | Primary Output |
|-------|------|-------|----------------|----------------|
| `red-commander` | Strategic Commander | L3 | Campaign orchestration, finding routing to Purple/Blue | Campaign reports, strategic findings |
| `red-epistemic-attacker` | Tactical Specialist | L2 | Truth distortion, source poisoning simulation | Attack results, evidence artifacts |
| `red-drift-inducer` | Tactical Specialist | L2 | Sub-threshold drift attacks, cascade propagation | Drift traces, cascade analysis |
| `red-scenario-generator` | Tactical Specialist | L2 | Multi-technique scenario composition from taxonomy | New scenarios, taxonomy updates |

The `red-commander` operates at L3 (Strategic Commander) level, orchestrating multi-scenario campaigns and routing findings to the [Purple Team](@/glossary/purple-team.md) for synthesis and the [Blue Team](@/glossary/blue-team.md) for defensive posture updates. The three L2 tactical specialists execute specific attack primitives under the commander's direction, each producing structured finding artifacts that feed into the platform's adversarial-defensive synthesis loop.

## Signal Flow Architecture

Red Team operations follow a defined signal flow within the broader [Color Teams](@/glossary/color-teams.md) architecture. Understanding this flow is essential for comprehending how adversarial findings drive defensive improvements.

```
Gray Team (boundary seeds) --> Red Team (adversarial scenarios)
                                    |
                                    +--> Purple Team (synthesis with Blue findings)
                                    |
                                    +--> Blue Team (defensive posture update)
                                    |
                              Black Team (theoretical threat models feed Red scenarios)
```

The [Gray Team](@/glossary/gray-team.md) provides boundary exploration seeds -- specification gaps, edge cases, and ambiguity zones -- that the Red Team transforms into concrete adversarial scenarios. The [Black Team](@/glossary/black-team.md) provides theoretical threat models that inform Red Team strategy at the abstract level. Red Team findings flow to both the Purple Team (for synthesis with Blue Team defensive findings) and directly to the Blue Team (for immediate defensive posture updates). The [White Team](@/glossary/white-team.md) subsequently validates that remediation efforts have actually addressed the vulnerabilities the Red Team identified.

## Sandbox Isolation Architecture

All Red Team operations execute within the `PrismaticDark.Sandbox` isolation boundary. This architecture ensures that adversarial simulations cannot affect production systems, real data, or external networks. The sandbox enforces three invariants: synthetic data only, zero network access, and immutable audit logging.

```elixir
defmodule PrismaticDark.Sandbox do
  @moduledoc """
  Isolated execution environment for Red Team adversarial
  simulations. Enforces synthetic-only data, zero network
  access, and immutable audit logging.

  Safety invariants (NEVER bypassed):
  1. network_access: false (zero network connectivity)
  2. data_source: :synthetic_only (no real data, no PII)
  3. audit_log: append-only (immutable audit trail)
  """

  @enforce_keys [:session_id, :team, :operator]
  defstruct [
    :session_id,
    :team,
    :operator,
    network_access: false,
    data_source: :synthetic_only,
    audit_log: [],
    ethics_check_interval: 10_000,
    max_duration: :timer.hours(1),
    started_at: nil
  ]

  @type t :: %__MODULE__{}
  @type audit_entry :: %{timestamp: DateTime.t(), action: String.t(), details: map()}

  @spec execute(t(), (t() -> term())) :: {:ok, term(), [audit_entry()]} | {:error, :safety_violation, String.t()}
  def execute(%__MODULE__{} = sandbox, operation) when is_function(operation, 1) do
    with :ok <- verify_safety_constraints(sandbox),
         :ok <- verify_synthetic_data_only(sandbox),
         :ok <- verify_network_isolation(sandbox),
         :ok <- verify_duration_limit(sandbox) do
      sandbox = %{sandbox | started_at: DateTime.utc_now()}
      result = operation.(sandbox)
      {:ok, result, sandbox.audit_log}
    else
      {:error, violation} ->
        {:error, :safety_violation, violation}
    end
  end

  defp verify_safety_constraints(sandbox) do
    if sandbox.network_access == false and sandbox.data_source == :synthetic_only do
      :ok
    else
      {:error, "Safety constraints violated: network=#{sandbox.network_access}, data=#{sandbox.data_source}"}
    end
  end

  defp verify_synthetic_data_only(%{data_source: :synthetic_only}), do: :ok
  defp verify_synthetic_data_only(_), do: {:error, "Non-synthetic data source detected"}

  defp verify_network_isolation(%{network_access: false}), do: :ok
  defp verify_network_isolation(_), do: {:error, "Network access not permitted for Red Team operations"}

  defp verify_duration_limit(%{max_duration: max}) when is_integer(max) and max > 0, do: :ok
  defp verify_duration_limit(_), do: {:error, "Invalid or missing duration limit"}
end
```

The sandbox isolation is not merely a best practice -- it is a non-negotiable safety requirement enforced at the infrastructure level. Even "read-only" network access could leak information about adversarial capabilities or internal platform structure. The ethics check interval ensures that automated ethical validation runs every 10 seconds during active operations, preventing scope creep from adversarial thinking into genuinely harmful territory.

## Campaign Execution

Red Team operations are organized into campaigns -- structured sequences of adversarial scenarios designed to test specific aspects of platform defenses. Campaigns provide the organizational structure for multi-scenario testing, producing structured findings that the [Purple Team](@/glossary/purple-team.md) uses for adversarial-defensive synthesis.

```elixir
defmodule PrismaticDark.RedTeam.Campaign do
  @moduledoc """
  Orchestrates multi-scenario adversarial campaigns.
  Each campaign targets a specific defensive capability
  and produces structured findings for Purple Team synthesis.

  Campaigns follow a graduated complexity approach:
  1. Basic scenarios verify fundamental defenses
  2. Intermediate scenarios test defense depth
  3. Advanced scenarios probe defense interactions
  4. Composite scenarios simulate realistic multi-vector attacks
  """

  alias PrismaticDark.{Sandbox, RedTeam.Taxonomy}

  @type finding :: %{
    scenario_id: String.t(),
    primitive: Taxonomy.attack_primitive(),
    target: String.t(),
    result: :defended | :partial_bypass | :full_bypass | :safety_halt,
    evidence: [map()],
    recommendations: [String.t()],
    detection_time_ms: non_neg_integer() | nil,
    timestamp: DateTime.t()
  }

  @spec run_campaign(String.t(), [Taxonomy.scenario()], keyword()) ::
          {:ok, [finding()]} | {:error, term()}
  def run_campaign(campaign_id, scenarios, opts \\ []) do
    sandbox = %Sandbox{
      session_id: campaign_id,
      team: :red,
      operator: Keyword.get(opts, :operator, "red-commander")
    }

    findings =
      scenarios
      |> Enum.sort_by(& &1.complexity)
      |> Enum.map(fn scenario ->
        case Sandbox.execute(sandbox, fn ctx -> execute_scenario(ctx, scenario) end) do
          {:ok, result, _audit} ->
            %{
              scenario_id: scenario.id,
              primitive: scenario.primitive,
              target: scenario.target,
              result: classify_result(result),
              evidence: result.evidence,
              recommendations: generate_recommendations(result),
              detection_time_ms: result[:detection_time_ms],
              timestamp: DateTime.utc_now()
            }

          {:error, :safety_violation, reason} ->
            %{
              scenario_id: scenario.id,
              primitive: scenario.primitive,
              target: scenario.target,
              result: :safety_halt,
              evidence: [%{reason: reason}],
              recommendations: ["Review safety constraints"],
              detection_time_ms: nil,
              timestamp: DateTime.utc_now()
            }
        end
      end)

    emit_to_purple_team(campaign_id, findings)
    {:ok, findings}
  end

  defp classify_result(%{defenses_bypassed: 0}), do: :defended
  defp classify_result(%{defenses_bypassed: n, total_defenses: t}) when n < t, do: :partial_bypass
  defp classify_result(_), do: :full_bypass

  defp generate_recommendations(%{result: :defended}), do: ["Defense effective - maintain current posture"]
  defp generate_recommendations(%{weaknesses: weaknesses}), do: Enum.map(weaknesses, & &1.recommendation)

  defp emit_to_purple_team(campaign_id, findings) do
    :telemetry.execute(
      [:prismatic_dark, :red_team, :campaign_complete],
      %{findings_count: length(findings), bypasses: Enum.count(findings, &(&1.result != :defended))},
      %{campaign_id: campaign_id, findings: findings}
    )
  end
end
```

## Usage in Prismatic Platform

Within the Prismatic Platform, the Red Team serves several critical functions that directly support the platform's security posture and epistemic integrity.

**Epistemic Security Validation**: Red Team scenarios test the [NABLA Infinity](@/glossary/nabla-infinity.md) framework's seven axioms under adversarial conditions. Signal poisoning attacks validate that the Signal Plurality requirement genuinely prevents single-source epistemic failures. Confidence manipulation attacks verify that [Trinity Gate](@/glossary/trinity-gate.md) catches artificially inflated confidence scores. Truth distortion attacks test the Provenance Mandatory axiom's ability to trace beliefs back to their origins and detect tampering.

**Defense Posture Assessment**: Findings from Red Team campaigns flow to the [Blue Team](@/glossary/blue-team.md) for defensive posture updates and to the [Purple Team](@/glossary/purple-team.md) for synthesis. This creates a continuous improvement loop where adversarial discoveries drive defensive enhancements. The Purple Team's closure analyst tracks whether each Red Team finding has been adequately addressed, preventing findings from being acknowledged but not remediated.

**Drift Detection Calibration**: The `red-drift-inducer` agent generates sub-threshold drift scenarios that calibrate the Blue Team's `blue-drift-detector` sensitivity. By knowing exactly what drift was introduced, the platform can measure detection accuracy and adjust thresholds. This calibration is critical because drift detection sensitivity involves a trade-off: too sensitive causes false positives, too insensitive misses real drift.

**Scenario Library Maintenance**: The `red-scenario-generator` maintains and expands the 329-entry taxonomy based on emerging threats, new platform capabilities, and findings from [Black Team](@/glossary/black-team.md) theoretical threat models. Each new scenario is classified by primitive, complexity, target subsystem, and detection difficulty, ensuring comprehensive coverage of the adversarial landscape.

**NABLA Axiom Stress Testing**: Each of the seven NABLA axioms (Signal Plurality, Contradiction Preservation, Absence Informative, Time Decay, Unknown Valid, Source Independence, Provenance Mandatory) has dedicated Red Team scenarios designed to probe its enforcement boundaries. This systematic coverage ensures that the epistemic framework is not merely theoretically sound but practically resilient under adversarial pressure.

## Telemetry and Observability

Red Team operations emit comprehensive telemetry events that enable monitoring, alerting, and post-campaign analysis. All events follow the platform's standard telemetry conventions.

```elixir
defmodule PrismaticDark.RedTeam.Telemetry do
  @moduledoc """
  Telemetry event definitions for Red Team operations.
  All events are emitted to [:prismatic_dark, :red_team, *] namespace.
  """

  @spec attach_handlers() :: :ok
  def attach_handlers do
    events = [
      [:prismatic_dark, :red_team, :campaign_start],
      [:prismatic_dark, :red_team, :campaign_complete],
      [:prismatic_dark, :red_team, :scenario_executed],
      [:prismatic_dark, :red_team, :safety_violation],
      [:prismatic_dark, :red_team, :taxonomy_updated],
      [:prismatic_dark, :red_team, :ethics_check]
    ]

    :telemetry.attach_many(
      "red-team-handler",
      events,
      &handle_event/4,
      nil
    )
  end

  defp handle_event([:prismatic_dark, :red_team, :safety_violation], measurements, metadata, _config) do
    Logger.error("RED TEAM SAFETY VIOLATION",
      session_id: metadata.session_id,
      violation: metadata.violation,
      severity: measurements.severity
    )
  end
end
```

## Safety Protocols

The Red Team operates under strict safety protocols that are non-negotiable and non-bypassable. These protocols are enforced at multiple layers -- code, infrastructure, and organizational -- to ensure defense in depth against safety boundary violations.

| Protocol | Enforcement | Verification |
|----------|-------------|-------------|
| **Sandbox Isolation** | All operations in PrismaticDark.Sandbox | Compile-time + runtime checks |
| **Synthetic Data Only** | No real data, no PII, no production state | Data source validation on every operation |
| **Zero Network Access** | No network connectivity for Red operations | Firewall rules + runtime verification |
| **Ethics Checks** | Automated validation every 10 seconds | Periodic timer with escalation on failure |
| **Escalation Guards** | Gray Escalation Guard prevents scope creep | Independent safety agent with override authority |
| **Audit Logging** | Immutable audit trail for every operation | Append-only log with integrity verification |
| **Duration Limits** | Maximum 1-hour campaign duration | Timer-based enforcement with automatic termination |
| **Authorized Context Only** | CTF, defensive research, authorized testing | Context validation at campaign initialization |

The safety protocols are designed with the assumption that adversarial thinking creates cognitive risks even in simulation contexts. The ethics check cadence (every 10 seconds) is deliberately frequent to prevent the gradual normalization of increasingly aggressive attack patterns. The [Gray Team](@/glossary/gray-team.md) escalation guard has independent authority to halt any Red Team operation that shows signs of scope creep beyond the boundaries of epistemic security testing.

## Best Practices

1. **Always Sandbox**: Never execute adversarial scenarios outside the isolation boundary, regardless of perceived safety. One misconfigured scenario can corrupt production data or leak internal structure to external observers.

2. **Synthetic Data Exclusively**: Generate realistic but entirely synthetic test data. Using anonymized production data risks re-identification and introduces real-world consequences that violate the simulation-only mandate.

3. **Structured Findings**: Document every finding with scenario ID, evidence, impact assessment, detection time, and actionable recommendations. Unstructured findings create noise without driving improvement.

4. **Purple Team Integration**: Route all findings through [Purple Team](@/glossary/purple-team.md) synthesis rather than directly to engineering. Purple Team contextualizes findings against existing defenses and prevents duplicate remediation efforts.

5. **Ethics Check Cadence**: Maintain automated ethics validation every 10-15 seconds during active operations. This prevents scope creep from adversarial thinking into genuinely harmful territory.

6. **Graduated Complexity**: Start campaigns with basic scenarios and escalate to composite attacks. This ensures fundamental defenses are verified before testing against sophisticated multi-primitive attacks.

7. **Audit Trail Completeness**: Every Red Team operation must produce an immutable audit entry. Audit gaps create accountability blind spots and undermine the security program's integrity.

8. **Taxonomy Currency**: Review and update the attack taxonomy at least monthly. New platform features create new attack surfaces that existing scenarios may not cover.

## Common Pitfalls

- **Scope Creep**: Adversarial thinking can drift from testing defenses to developing actual attack capabilities. Strict escalation guards and the [Gray Team](@/glossary/gray-team.md) escalation guard prevent this transition. The boundary between "testing a defense" and "developing an attack" requires constant vigilance.

- **False Confidence from Defended Results**: A scenario classified as "defended" only proves the specific attack vector was blocked. Variations may succeed. Composite scenarios test defense robustness against novel combinations that individual basic scenarios cannot reveal.

- **Ignoring Sub-Threshold Findings**: Partial bypasses and near-misses often indicate more significant vulnerabilities than clean failures. The Purple Team's closure analyst specifically watches for patterns in partial results that suggest systemic weaknesses.

- **Network Isolation Violations**: Even "read-only" network access can leak information about adversarial capabilities or internal architecture. Zero network access is non-negotiable for Red and Black Team operations.

- **Taxonomy Staleness**: Attack taxonomies require continuous updates as the platform evolves. New features create new attack surfaces. The 329-entry taxonomy is a living document, not a fixed reference.

- **Premature Campaign Termination**: Stopping a campaign after initial "defended" results misses the graduated complexity that composite scenarios provide. Always complete the full campaign plan.

## Historical Context and Industry Evolution

Red Teaming traces its roots to Cold War military strategy, where NATO forces designated adversary simulation units with the "red" designation. The practice entered cybersecurity through military and intelligence community adoption in the 1990s, became mainstream with the publication of NIST SP 800-115 (Technical Guide to Information Security Testing and Assessment), and evolved further with the MITRE ATT&CK framework's systematic cataloging of adversary tactics, techniques, and procedures.

The extension of Red Teaming to epistemic security represents the Prismatic Platform's contribution to this evolution. As AI systems increasingly participate in decision-making processes, the attack surface expands beyond traditional infrastructure to include the knowledge systems, reasoning pipelines, and confidence calibration mechanisms that AI relies upon. Epistemic Red Teaming addresses this expanded attack surface through the five primitives and 329-entry taxonomy.

## Related Concepts

- [Blue Team](@/glossary/blue-team.md) - Defensive counterpart receiving Red findings for posture assessment
- [Purple Team](@/glossary/purple-team.md) - Synthesis hub for Red-Blue loop closure and regression monitoring
- [Black Team](@/glossary/black-team.md) - Theoretical threat modeling feeding Red Team scenarios
- [Gray Team](@/glossary/gray-team.md) - Boundary exploration providing seeds for Red Team campaigns
- [White Team](@/glossary/white-team.md) - Constructive verification validating Red Team finding remediation
- [Color Teams](@/glossary/color-teams.md) - Full overview of all six color team operations
- [NABLA Infinity](@/glossary/nabla-infinity.md) - Epistemic framework tested through adversarial simulation
- [Trinity Gate](@/glossary/trinity-gate.md) - Three-layer validation gate tested by confidence manipulation attacks
- [Signal Plurality](@/glossary/signal-plurality.md) - Axiom tested by signal poisoning attacks
- [Tactical Execution](@/glossary/tactical-execution.md) - L2 tier of Red Team specialists
- [AIAD](@/glossary/aiad.md) - Agent standard governing Red Team agent definitions

## See Also

- [Architecture](@/architecture/_index.md) - Platform architecture overview
- [Agents](@/agents/_index.md) - Full agent catalog including Red Team agents
- [Technologies](@/technologies/_index.md) - Technology stack details
- [Capabilities](@/capabilities/_index.md) - Security capabilities powered by Color Team operations

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
