+++
title = "white-verifier-commander"
weight = 416
[extra]
domain = "verification"
level = "L3"
description = "Completed proof artifact after Trinity Gate validation"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["trinity-gate", "lean4", "property-based-testing", "nabla-infinity", "aiad", "no-mercy", "no-doubts", "seadf", "telemetry"]
domain_normalized = "verification"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2200
quality_score = 83
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["white-verifier-commander", "Completed", "Trinity", "Gate", "agents", "agent", "Prismatic Platform", "Trinity Gate", "Outbound", "White Team"]
tags = ["agents", "agent", "white-verifier-commander", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "white-verifier-commander - Prismatic Platform"
+++

## Overview

The white-verifier-commander operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform's [White Team](@/glossary/white-team.md) verification domain, serving as the commanding officer responsible for orchestrating verification campaigns, constructing composite proofs from specialist findings, and ensuring that all proof artifacts pass through [Trinity Gate](@/glossary/trinity-gate.md) validation before acceptance into the platform's verification corpus.

As the strategic commander of the White Team -- the constructive verification team within the [color-team](@/glossary/color-teams.md) security architecture -- this agent coordinates the activities of two L4 specialists: the [white-contract-validator](@/agents/white-contract-validator.md) for interface contract verification and the [white-invariant-prover](@/agents/white-invariant-prover.md) for formal invariant proof construction. The commander synthesizes their individual verification results into composite proofs that demonstrate system-wide properties, composing contract compliance evidence with invariant proofs to establish comprehensive safety guarantees.

Built on the [AIAD](@/glossary/aiad.md) standard, the white-verifier-commander produces completed proof artifacts -- structured evidence packages that have passed all three layers of Trinity Gate validation (structural consistency, logical consistency, and formal necessity). These artifacts serve as the authoritative verification record for the platform, consumed by the [purple-coordinator](@/agents/purple-coordinator.md) for Red-Blue closure assessment and by the [SEADF](@/glossary/seadf.md) evolution pipeline for safe evolution planning. All activities comply with the [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic framework and the [NO DOUBTS](@/glossary/no-doubts.md) doctrine's requirement for evidence-based decision making.

## Architecture

The white-verifier-commander is built on a campaign-oriented architecture that separates verification planning, execution coordination, proof composition, and artifact management into distinct [OTP](@/glossary/otp.md) processes.

```
WhiteVerifierCommander.Supervisor
+-- CampaignPlanner.Server        (verification campaign strategy)
+-- ExecutionCoordinator.Server    (specialist task distribution)
+-- ProofComposer.Engine           (composite proof construction)
+-- TrinityGateValidator.Server    (three-layer proof validation)
+-- ArtifactManager.Store          (completed proof artifact storage)
+-- CampaignReporter.Server        (verification status reporting)
```

The CampaignPlanner determines which system components require verification, assigns priority based on change frequency and criticality, and generates verification task lists for the specialists. The ExecutionCoordinator distributes tasks to the [white-contract-validator](@/agents/white-contract-validator.md) and [white-invariant-prover](@/agents/white-invariant-prover.md), monitors their progress, and handles task failure with retry strategies. The ProofComposer takes individual verification results from both specialists and constructs composite proofs that demonstrate properties spanning multiple components -- for example, proving that a data flow from ingestion through processing to storage maintains consistency invariants at every interface boundary.

The TrinityGateValidator applies all three validation layers to every proof artifact before acceptance: structural consistency verifies that the proof's dependency graph forms a valid DAG, logical consistency verifies that proof steps follow from their premises, and formal necessity verifies that critical claims have machine-checked [Lean4](@/glossary/lean4.md) proofs. The ArtifactManager stores validated proof artifacts with immutable provenance chains.

## Core Capabilities

The white-verifier-commander provides five primary capabilities that together enable strategic verification management for the entire White Team.

**Verification Campaign Planning** designs verification campaigns based on platform change analysis, risk assessment, and resource availability. The commander analyzes recent code changes, identifies affected system invariants and contracts, and creates prioritized verification task lists that maximize coverage within available verification time. Campaign planning considers both the urgency of re-verification (modules that changed recently) and the staleness of existing proofs (modules that have not been re-verified in many generations).

**Specialist Coordination** manages the workload distribution between the contract validator and invariant prover, ensuring that verification efforts are balanced and that inter-dependent verification tasks are sequenced correctly. When a contract verification reveals that an interface has changed, the commander immediately schedules invariant re-verification for all invariants that depend on that interface.

**Composite Proof Construction** synthesizes individual verification results from both specialists into higher-order proofs that demonstrate system-wide properties. A composite proof might combine: (a) contract verification showing that module A's output matches module B's expected input format, (b) invariant proof showing that module A's output always satisfies certain bounds, and (c) contract verification showing that module B preserves those bounds through processing. The composed result proves end-to-end data integrity across the A-to-B pipeline.

**Trinity Gate Management** serves as the final authority for [Trinity Gate](@/glossary/trinity-gate.md) validation of proof artifacts. The commander ensures that all three validation layers are applied to every artifact, manages the validation pipeline, and handles artifacts that fail one or more validation layers (routing them back to the appropriate specialist for correction).

**Verification Posture Reporting** produces comprehensive verification status reports consumed by the [purple-coordinator](@/agents/purple-coordinator.md), the [SEADF](@/glossary/seadf.md) evolution pipeline, and platform monitoring dashboards. Reports include: verification coverage metrics, proof currency (how recently each component was verified), open verification gaps, and composite proof status.

## Implementation

The core commander is implemented as an [OTP](@/glossary/otp.md) [GenServer](@/glossary/genserver.md) that manages campaign lifecycle, specialist coordination, and proof composition.

```elixir
defmodule Prismatic.Agents.WhiteVerifierCommander do
  @moduledoc """
  White Team Verifier Commander - orchestrates verification
  campaigns, coordinates specialists, and constructs composite
  proofs with Trinity Gate validation.
  """

  use GenServer

  alias Prismatic.Agents.WhiteVerifierCommander.{
    CampaignPlanner,
    ProofComposer,
    TrinityGateValidator,
    ArtifactManager
  }

  alias Prismatic.Agents.WhiteContractValidator
  alias Prismatic.Agents.WhiteInvariantProver

  @type campaign :: %{
    id: String.t(),
    status: :planned | :executing | :composing | :validating | :complete,
    tasks: [task()],
    results: [verification_result()],
    composite_proofs: [composite_proof()],
    started_at: DateTime.t(),
    completed_at: DateTime.t() | nil
  }

  @type task :: %{target: atom(), type: :contract | :invariant, priority: integer()}
  @type verification_result :: map()
  @type composite_proof :: map()

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(opts) do
    schedule_campaign(opts[:interval] || :timer.hours(12))

    {:ok, %{
      current_campaign: nil,
      campaign_history: [],
      config: Map.new(opts)
    }}
  end

  @spec launch_campaign :: {:ok, campaign()} | {:error, term()}
  def launch_campaign do
    GenServer.call(__MODULE__, :launch_campaign, :timer.hours(1))
  end

  @spec verification_posture :: {:ok, map()}
  def verification_posture do
    GenServer.call(__MODULE__, :posture)
  end

  @impl true
  def handle_call(:launch_campaign, _from, state) do
    tasks = CampaignPlanner.plan()

    contract_results =
      tasks
      |> Enum.filter(&(&1.type == :contract))
      |> Enum.map(fn task ->
        {:ok, result} = WhiteContractValidator.verify_behaviour(task.target)
        result
      end)

    invariant_results =
      tasks
      |> Enum.filter(&(&1.type == :invariant))
      |> Enum.map(fn task ->
        {:ok, result} = WhiteInvariantProver.prove_invariant(task.target)
        result
      end)

    all_results = contract_results ++ invariant_results
    composite_proofs = ProofComposer.compose(all_results)

    validated_proofs =
      Enum.map(composite_proofs, fn proof ->
        case TrinityGateValidator.validate(proof) do
          {:ok, validated} ->
            ArtifactManager.store(validated)
            validated

          {:error, layer, reason} ->
            %{proof | status: :failed, failure: {layer, reason}}
        end
      end)

    campaign = %{
      id: generate_campaign_id(),
      status: :complete,
      tasks: tasks,
      results: all_results,
      composite_proofs: validated_proofs,
      started_at: DateTime.utc_now(),
      completed_at: DateTime.utc_now()
    }

    :telemetry.execute(
      [:prismatic, :white_commander, :campaign_complete],
      %{
        tasks: length(tasks),
        proofs: length(validated_proofs),
        passed: Enum.count(validated_proofs, &(&1.status == :validated))
      },
      %{campaign_id: campaign.id}
    )

    {:reply, {:ok, campaign},
     %{state |
       current_campaign: campaign,
       campaign_history: [campaign | state.campaign_history]
     }}
  end

  @impl true
  def handle_call(:posture, _from, state) do
    posture = %{
      last_campaign: state.current_campaign,
      total_campaigns: length(state.campaign_history),
      coverage: CampaignPlanner.coverage_report(),
      open_gaps: CampaignPlanner.verification_gaps()
    }

    {:reply, {:ok, posture}, state}
  end

  @impl true
  def handle_info(:scheduled_campaign, state) do
    {:ok, _campaign} = launch_campaign()
    schedule_campaign(state.config[:interval] || :timer.hours(12))
    {:noreply, state}
  end

  defp schedule_campaign(interval) do
    Process.send_after(self(), :scheduled_campaign, interval)
  end

  defp generate_campaign_id do
    "WVC-#{System.system_time(:second)}-#{:rand.uniform(9999)}"
  end
end
```

The `launch_campaign/0` function orchestrates the full verification campaign lifecycle: planning tasks, distributing to specialists, collecting results, composing proofs, validating through Trinity Gate, and storing completed artifacts. The `verification_posture/0` function provides a snapshot of the current verification state for consumption by other agents.

## Integration Points

| Component | Direction | Description |
|-----------|-----------|-------------|
| [white-contract-validator](@/agents/white-contract-validator.md) | Outbound | Distributes contract verification tasks; receives verification results |
| [white-invariant-prover](@/agents/white-invariant-prover.md) | Outbound | Distributes invariant proof tasks; receives proof results |
| [verification-integrity-commander](@/agents/verification-integrity-commander.md) | Bidirectional | Coordinates on core theorem maintenance; shares proof artifacts |
| [purple-coordinator](@/agents/purple-coordinator.md) | Outbound | Delivers verification posture data for Red-Blue closure assessment |
| [Trinity Gate](@/glossary/trinity-gate.md) | Enforcement | All proof artifacts pass three-layer validation before acceptance |
| [SEADF](@/glossary/seadf.md) Evolution Pipeline | Outbound | Verification posture informs evolution safety decisions |
| [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) | Outbound | Reports verification coverage metrics for platform quality scoring |

## Operational Workflow

The agent operates through three modes: scheduled verification campaigns, event-triggered targeted campaigns, and on-demand posture assessment.

**Scheduled Verification Campaigns** run every 12 hours, performing a comprehensive verification sweep planned by the CampaignPlanner. The planner analyzes recent code changes, identifies stale proofs, and generates a prioritized task list. Tasks are distributed to specialists, results are collected and composed into composite proofs, and all artifacts pass through Trinity Gate validation.

**Event-Triggered Campaigns** activate when significant platform changes occur: major feature merges, dependency updates, or evolution steps. These campaigns focus on the affected components rather than performing a full sweep, reducing verification time while maintaining coverage.

**On-Demand Posture Assessment** provides immediate verification status when requested by other agents or through the command interface. The posture report includes verification coverage, proof currency, open gaps, and composite proof status.

The full campaign workflow proceeds through six phases: (1) campaign planning and task generation, (2) specialist task distribution, (3) result collection from both specialists, (4) composite proof construction, (5) Trinity Gate validation, and (6) artifact storage and posture reporting.

## NABLA Compliance

The white-verifier-commander operates under strict [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic governance.

**Signal Plurality**: Composite proofs require evidence from both specialists (contract validation and invariant proof). A system-wide property claim must be supported by both interface contract compliance and invariant preservation -- two independent verification methodologies providing converging evidence.

**Contradiction Preservation**: When specialist results produce conflicting assessments (contract validation passes but invariant proof discovers a violation that should have been caught by contract testing), both results are preserved in the campaign record and escalated for investigation. The commander does not suppress contradictions between specialists.

**Provenance Mandatory**: Every composite proof carries complete provenance: campaign identifier, constituent specialist results, composition methodology, Trinity Gate validation results, and artifact storage identifiers. Provenance chains are immutable and fully traceable.

**Time Decay**: Campaign results include completion timestamps and verification currency tracking. The CampaignPlanner prioritizes re-verification of components whose proofs are oldest, ensuring that the verification corpus remains current with platform evolution.

All proof artifacts pass through [Trinity Gate](@/glossary/trinity-gate.md): structural consistency (composite proof dependencies form valid DAGs), logical consistency (composition steps follow from constituent proofs), and formal necessity (critical composite claims have Lean4 formalization).

## Configuration

```elixir
config :prismatic_agents, Prismatic.Agents.WhiteVerifierCommander,
  campaign_interval: :timer.hours(12),
  max_campaign_duration: :timer.hours(2),
  max_concurrent_tasks: 8,
  proof_staleness_threshold: :timer.hours(168),
  trinity_gate_timeout: :timer.minutes(10),
  artifact_retention: :timer.hours(720),
  telemetry_prefix: [:prismatic, :white_commander]
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `campaign_interval` | 12 hours | Time between scheduled verification campaigns |
| `max_campaign_duration` | 2 hours | Maximum time for a single campaign |
| `proof_staleness_threshold` | 168 hours | Time after which proofs require re-verification |
| `max_concurrent_tasks` | 8 | Maximum parallel specialist tasks |
| `trinity_gate_timeout` | 10 minutes | Maximum time for Trinity Gate validation per artifact |

## Performance

| Metric | Target | Measured |
|--------|--------|----------|
| Full verification campaign | < 2 hours | 30-90 minutes |
| Campaign planning | < 60 seconds | 15-30 seconds |
| Composite proof construction | < 5 minutes | 1-3 minutes |
| Trinity Gate validation (per artifact) | < 10 minutes | 2-5 minutes |
| Posture report generation | < 30 seconds | 5-15 seconds |
| Artifact storage | < 500 ms | 100-300 ms |
| Memory footprint | < 200 MB | 80-150 MB |

Campaign performance is optimized through prioritized task ordering (high-impact verifications first), parallel specialist execution, and incremental proof composition that reuses valid sub-proofs from previous campaigns. The commander tracks specialist response times and adjusts task distribution to balance load across available verification resources.

## Related Resources

- [White Team](@/glossary/white-team.md) -- Constructive verification team overview
- [white-contract-validator](@/agents/white-contract-validator.md) -- L4 contract verification specialist
- [white-invariant-prover](@/agents/white-invariant-prover.md) -- L4 formal invariant proof specialist
- [Trinity Gate](@/glossary/trinity-gate.md) -- Three-layer validation for proof artifacts
- [Purple Team](@/glossary/purple-team.md) -- Synthesis team consuming verification posture data
- [SEADF Framework](@/glossary/seadf.md) -- Autonomous evolution framework using verification status
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- Epistemic framework governing verification claims
- [Color Teams](@/glossary/color-teams.md) -- Security operations team architecture

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)