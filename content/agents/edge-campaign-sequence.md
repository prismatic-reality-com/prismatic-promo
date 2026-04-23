+++
title = "EDGE-{campaign}-{sequence}"
weight = 200
[extra]
domain = "boundary-exploration"
level = "L4"
description = "Specialist agent for boundary value and edge case detection within Gray Hacking campaigns. Systematically identifies specification gaps, boundary conditions, corner cases, and a..."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["nabla-infinity", "trinity-gate", "3nl", "aiad", "color-teams", "lean4", "property-based-testing", "no-doubts", "telemetry", "no-mercy"]
domain_normalized = "epistemic"
content_version = "1.0.0"
last_enhanced = "2026-02-01"
word_count = 211
quality_score = 42
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["EDGE-campaign-sequence", "Specialist", "Gray", "Hacking", "Systematically", "agents", "agent", "Prismatic Platform", "EDGE", "Phase"]
tags = ["agents", "agent", "edge-campaign-sequence", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "EDGE-{campaign}-{sequence} - Prismatic Platform"
+++

## Overview

The EDGE-{campaign}-{sequence} agent operates as an L4 domain specialist within the Boundary Exploration domain of the Prismatic Platform's [Gray Team](@/teams/gray.md) color-team security operations. This agent specializes in systematic boundary value and edge case detection within Gray Hacking campaigns, identifying specification gaps, boundary conditions, corner cases, and affordance drift that could be exploited by adversarial actors or that reveal undocumented system behaviors.

Each EDGE agent instance is parameterized by a campaign identifier and a sequence number, enabling multiple concurrent boundary exploration operations to run independently while feeding findings into a shared analysis pipeline. The campaign parameter ties the agent to a specific exploration objective (a module boundary, a protocol edge, an API surface), while the sequence number enables ordered parallel exploration of different boundary dimensions within the same campaign scope.

Boundary exploration occupies the critical space between known behavior and unknown behavior. While unit tests verify that systems handle expected inputs correctly, and property-based tests explore random inputs within declared types, the EDGE agent deliberately targets the spaces between types -- the null-to-non-null transitions, the maximum-to-overflow boundaries, the encoding-switch thresholds where implementations most commonly harbor undocumented behavior. This systematic approach to boundary hunting draws from formal methods in boundary value analysis while adapting for the practical realities of a large-scale [OTP](@/glossary/otp.md) platform.

## Architecture

The EDGE agent implements a campaign-driven exploration architecture where each instance operates as an independent boundary probe within a coordinated campaign framework.

```
Gray Explorer Commander (L3)
         |
         +-- Campaign Definition
         |   (target, scope, constraints)
         |
         v
    EDGE-{campaign}-001 ---+
    EDGE-{campaign}-002 ---+---> Finding Aggregator
    EDGE-{campaign}-003 ---+         |
    EDGE-{campaign}-N   ---+         v
                              Purple Team Synthesis
                                     |
                                     v
                              Blue Team Defense
```

**Campaign Initialization.** Each EDGE instance receives a campaign definition from the Gray Explorer Commander specifying the exploration target (module, API endpoint, protocol boundary), the exploration scope (input types, state transitions, configuration parameters), and safety constraints (read-only operations, no state mutations, bounded resource consumption).

**Parallel Boundary Probing.** Multiple EDGE instances explore different boundary dimensions simultaneously. Instance 001 might explore numeric overflow boundaries while instance 002 explores string encoding transitions and instance 003 explores concurrent access patterns. This parallel approach maximizes coverage within bounded campaign durations.

**Finding Aggregation.** Individual boundary findings from all campaign instances are aggregated into a structured report that classifies each finding by type (specification gap, undocumented behavior, boundary violation, affordance drift) and severity (informational, concerning, critical). Aggregated findings are forwarded to the Purple Team for synthesis with Red and Blue team observations.

## Core Capabilities

**Boundary Value Analysis.** The agent systematically tests values at type boundaries: minimum and maximum integer values, empty and maximum-length strings, nil-to-non-nil transitions, list boundary sizes (empty, single-element, maximum), and map key count limits. Each boundary is tested both at the exact limit and at positions immediately adjacent to the limit (boundary - 1, boundary, boundary + 1).

**Specification Gap Detection.** By comparing documented behavior (from `@doc`, `@spec`, and AIAD specifications) against observed behavior at boundary conditions, the agent identifies gaps where the specification does not define expected behavior. These gaps represent potential security vulnerabilities or reliability risks because they leave implementation-specific behavior undocumented and therefore unstable across refactoring.

**Corner Case Discovery.** The agent explores multi-dimensional corners where multiple inputs simultaneously occupy boundary positions. While single-dimension boundary testing catches many issues, the most subtle bugs occur at the intersection of multiple boundary conditions -- for example, when both a timeout and a buffer size simultaneously reach their limits.

**Affordance Drift Detection.** Over evolutionary generations, the actual behavior of a system can drift from its originally designed affordances. The EDGE agent compares current system behavior against historical behavioral records (from earlier campaign findings and test suite expectations) to detect where functionality has silently changed without corresponding specification updates.

**[Property-Based Testing](@/glossary/property-based-testing.md) Integration.** The agent generates targeted [property-based tests](@/glossary/property-based-testing.md) from discovered boundaries. When a boundary condition reveals interesting behavior, the agent automatically generates a StreamData-based property test that exercises that boundary space, ensuring that future regressions at the boundary are caught by the test suite.

**Safe Exploration Enforcement.** All boundary exploration operates under strict safety constraints. The agent performs only read-only operations by default. State-mutating explorations are sandboxed in isolated processes with rollback capability. Resource consumption is bounded by configurable limits. The Gray Escalation Guard agent monitors all EDGE operations and can halt any exploration that approaches unsafe territory.

## Implementation

```elixir
defmodule PrismaticAgents.ColorTeams.Gray.Edge do
  @moduledoc """
  L4 EDGE-{campaign}-{sequence} agent - systematic boundary
  value and edge case detection within Gray Team campaigns.
  Parameterized by campaign ID and sequence number.
  """
  use GenServer

  alias PrismaticAgents.ColorTeams.Gray.{
    BoundaryProber,
    SpecificationAnalyzer,
    CornerCaseGenerator,
    AffordanceDriftDetector,
    FindingAggregator
  }

  @type edge_config :: %{
    campaign_id: String.t(),
    sequence: non_neg_integer(),
    target: exploration_target(),
    scope: exploration_scope(),
    constraints: safety_constraints()
  }

  @type finding :: %{
    type: :spec_gap | :undocumented | :boundary_violation | :affordance_drift,
    severity: :informational | :concerning | :critical,
    location: String.t(),
    description: String.t(),
    evidence: [term()],
    discovered_at: DateTime.t()
  }

  def start_link(%{campaign_id: campaign, sequence: seq} = config) do
    name = :"edge_#{campaign}_#{seq}"
    GenServer.start_link(__MODULE__, config, name: name)
  end

  @impl true
  def init(config) do
    {:ok, %{
      config: config,
      findings: [],
      status: :initialized,
      probe_count: 0
    }}
  end

  @spec explore(pid() | atom()) :: {:ok, [finding()]} | {:error, term()}
  def explore(agent) do
    GenServer.call(agent, :explore, 300_000)
  end

  @impl true
  def handle_call(:explore, _from, state) do
    %{config: config} = state

    findings =
      []
      |> add_findings(BoundaryProber.probe(config.target, config.scope))
      |> add_findings(SpecificationAnalyzer.find_gaps(config.target))
      |> add_findings(CornerCaseGenerator.discover(config.target, config.scope))
      |> add_findings(AffordanceDriftDetector.detect(config.target))

    FindingAggregator.submit(config.campaign_id, config.sequence, findings)

    {:reply, {:ok, findings}, %{state |
      findings: findings,
      status: :completed,
      probe_count: length(findings)
    }}
  end
end
```

## Integration Points

| Component | Integration Type | Purpose |
|-----------|-----------------|---------|
| [Gray Team](@/teams/gray.md) | Campaign Framework | Campaign definition, coordination, and findings aggregation |
| [gray-explorer-commander](@/agents/gray-explorer-commander.md) | Command Authority | Issues campaign directives and receives exploration results |
| [gray-escalation-guard](@/agents/gray-escalation-guard.md) | Safety Monitor | Monitors EDGE operations for safety constraint violations and prevents escalation |
| [Purple Team](@/teams/purple.md) | Finding Synthesis | Receives aggregated findings for Red-Blue loop closure synthesis |
| [Prismatic Safety](@/apps/prismatic-safety.md) | Escalation Prevention | Platform-wide safety monitoring for boundary exploration operations |
| [Telemetry](@/glossary/telemetry.md) | Observability | Campaign progress, finding rates, and safety constraint metrics |

## Operational Workflow

**Phase 1: Campaign Deployment.** The Gray Explorer Commander defines a campaign with a specific target, scope, and safety constraints. Multiple EDGE instances are spawned under a DynamicSupervisor, each assigned a unique sequence number and a specific boundary dimension to explore. Campaign metadata is registered in the Gray Team coordination state.

**Phase 2: Boundary Exploration.** Each EDGE instance independently probes its assigned boundary dimension. Probing follows a systematic pattern: identify type boundaries from specifications, test at exact boundaries, test adjacent to boundaries, test multi-dimensional corners, and compare behavior against documentation. Each probe records its input, observed output, and expected output.

**Phase 3: Finding Classification.** Discovered boundary behaviors are classified by type and severity. Behaviors that match documentation are recorded as "confirmed." Behaviors that differ from documentation are classified as specification gaps. Behaviors with no applicable documentation are classified as undocumented. Behaviors that have changed since previous campaigns are classified as affordance drift.

**Phase 4: Finding Aggregation.** Individual findings from all campaign instances are aggregated into a unified campaign report. The aggregator identifies patterns across findings -- for example, multiple instances discovering related boundary issues in different dimensions of the same module, suggesting a systematic implementation weakness.

**Phase 5: Finding Distribution.** Aggregated campaign findings are forwarded to the Purple Team for synthesis with Red and Blue team observations. Critical findings trigger immediate notification to the Blue Team for defensive posture assessment. Property-based tests generated from findings are proposed for inclusion in the test suite.

## NABLA Compliance

| Axiom | Boundary Exploration Enforcement |
|-------|----------------------------------|
| **Signal Plurality** | Boundary findings require reproduction across at least two independent probes before classification as confirmed |
| **Contradiction Preservation** | When specification and behavior contradict at boundaries, both the documented and observed behaviors are preserved as a finding pair |
| **Provenance Mandatory** | Every finding includes the exact input, observed output, expected output, and the specification or documentation being tested |
| **Time Decay** | Previous campaign findings carry timestamps and are re-validated in subsequent campaigns to detect affordance drift |
| **Unknown Valid** | Boundary behaviors with insufficient context for classification are labeled as "undetermined" and queued for manual review |

## Configuration

```elixir
config :prismatic_agents, PrismaticAgents.ColorTeams.Gray.Edge,
  # Safety constraints
  max_exploration_duration_ms: 300_000,
  read_only_default: true,
  max_resource_consumption_mb: 256,
  sandbox_process_isolation: true,

  # Campaign parameters
  max_instances_per_campaign: 10,
  probe_timeout_ms: 5_000,
  max_probes_per_dimension: 1_000,

  # Finding classification
  min_reproductions_for_confirmed: 2,
  auto_generate_property_tests: true,
  critical_finding_immediate_notify: true
```

## Performance

| Metric | Target | Description |
|--------|--------|-------------|
| **Single Probe** | < 100ms | Individual boundary value test execution |
| **Campaign Instance** | < 5 min | Complete boundary exploration for one dimension |
| **Full Campaign** | < 30 min | All instances completing with finding aggregation |
| **Finding Rate** | > 0.5/min | Average boundary findings per minute per instance |
| **Safety Compliance** | 100% | Zero safety constraint violations across all campaigns |
| **False Finding Rate** | < 5% | Findings confirmed as genuine boundary behaviors on review |

## Related Resources

- [**gray-explorer-commander**](@/agents/gray-explorer-commander.md) (L3) - Supreme commander for Gray Hacking boundary-exploration operations
- [**gray-escalation-guard**](@/agents/gray-escalation-guard.md) (L4) - Safety-critical specialist preventing Gray operations from escalating into unsafe territory
- [Color Teams](@/glossary/color-teams.md) - Six-team security operations framework within which EDGE agents operate
- [Property-Based Testing](@/glossary/property-based-testing.md) - Testing methodology that EDGE agents generate tests for discovered boundaries
- [NABLA Infinity](@/glossary/nabla-infinity.md) - Epistemic framework governing finding classification and evidence requirements

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)