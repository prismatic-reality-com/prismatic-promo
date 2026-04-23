+++
title = "manipulation-forensics"
weight = 245
[extra]
domain = "security"
level = "L3"
description = "Incident details"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["easm", "attack-surface", "rbac", "color-teams", "trinity-gate", "aiad", "nabla-infinity", "nis2", "zkb", "no-doubts"]
domain_normalized = "security"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2200
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["manipulation-forensics", "Incident", "agents", "agent", "Prismatic Platform", "Phase", "Forensic", "Evidence", "Attribution"]
tags = ["agents", "agent", "manipulation-forensics", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "manipulation-forensics - Prismatic Platform"
+++

## Overview

The manipulation-forensics agent serves as the L3 [Strategic Command](@/glossary/strategic-command.md) authority for post-incident analysis of information manipulation events within the Prismatic Platform's security domain. When manipulation campaigns are detected or suspected, this agent conducts rigorous forensic examination to determine the origin, methodology, scope, and impact of the operation. Its forensic findings establish the evidentiary chain required for attribution, remediation planning, and defensive posture updates across the platform's [color-team](@/glossary/color-teams.md) security architecture.

Built on the [AIAD](@/glossary/aiad.md) standard and enforced by the [NO MERCY, NO DOUBTS](@/glossary/no-mercy.md) doctrine, the manipulation-forensics agent operates with strict evidence chain preservation. Every forensic artifact maintains full provenance in compliance with [NABLA Infinity](@/glossary/nabla-infinity.md) axioms, and all attribution conclusions must pass [Trinity Gate](@/glossary/trinity-gate.md) validation across structural, logical, and formal consistency layers. The agent refuses to produce speculative attribution without meeting the 0.95 [confidence threshold](@/glossary/confidence-threshold.md) required for critical security decisions.

The forensic analysis function is essential to the platform's epistemic defense architecture because it closes the feedback loop between detection and prevention. By thoroughly analyzing manipulation events after detection, the forensics agent produces actionable intelligence that strengthens detection signatures, validates defensive posture assumptions, and identifies previously unknown attack vectors. This retrospective analysis transforms individual incidents into systematic improvements across the entire security infrastructure.

## Architecture

The manipulation-forensics agent implements a structured investigation architecture that processes manipulation incidents through progressive analytical stages.

```
Incident Trigger              Forensic Pipeline                Investigation Output
+------------------+        +--------------------+           +------------------+
| Detection Alert  |---+    | Evidence Collector |           | Forensic Report  |
+------------------+   |    | (Artifact Gather)  |---+       | (Findings)       |
| Suspected Event  |---+--->+--------------------+   |   +-->+------------------+
+------------------+   |    | Timeline Builder   |   |   |   | Attribution      |
| External Report  |---+    | (Event Sequence)   |---+---+   | Assessment       |
+------------------+        +--------------------+   |   |   +------------------+
                            | Technique Matcher  |   |   |   | Mitigation       |
                            | (Taxonomy Lookup)  |---+   +-->| Recommendations  |
                            +--------------------+   |       +------------------+
                            | Attribution Engine |   |       | Detection Model  |
                            | (Actor Profiling)  |---+       | Updates          |
                            +--------------------+           +------------------+
```

The pipeline processes incidents through four progressive stages: evidence collection (gathering and preserving all relevant artifacts), timeline reconstruction (establishing the chronological sequence of manipulation events), technique identification (matching observed patterns against the manipulation taxonomy), and attribution analysis (correlating indicators to establish actor profiles). Each stage maintains strict evidence chain integrity.

## Core Capabilities

The manipulation-forensics agent provides comprehensive post-incident analysis through several specialized capability domains.

**Evidence Chain Reconstruction** rebuilds the complete timeline of manipulation events from initial injection point through propagation paths to observed impact. All evidence artifacts maintain cryptographic integrity verification, ensuring that forensic findings cannot be challenged on chain-of-custody grounds. The reconstruction engine handles both digital evidence (content timestamps, network logs, metadata) and behavioral evidence (engagement patterns, audience response metrics).

**Technique Fingerprinting** matches observed manipulation patterns against the platform's technique taxonomy maintained by the [manipulation-research](@/agents/manipulation-research.md) agent. Fingerprinting identifies known methodologies (narrative distortion variants, coordinated amplification patterns, source poisoning techniques) and flags novel approaches that do not match existing taxonomy entries. Novel technique identification triggers taxonomy update requests to the research agent.

**Attribution Analysis** correlates behavioral patterns, timing signatures, infrastructure indicators, and technique preferences to establish actor profiles with quantified confidence levels. Attribution operates at multiple levels: technique attribution (what methods were used), infrastructure attribution (what platforms and tools were employed), and actor attribution (who conducted the operation). Each level carries independent confidence scoring, and attribution conclusions require the 0.95 confidence threshold for critical security decisions.

**Impact Scope Assessment** determines the reach and effectiveness of detected manipulation, measuring narrative penetration (how far the manipulated content spread), audience exposure (how many people encountered the content), behavioral influence (measurable changes in audience behavior), and institutional impact (effects on organizational decisions or public perception).

**Defensive Intelligence Production** translates forensic findings into actionable intelligence for other security agents. This includes detection signature updates for the manipulation-detection agent, adversarial scenario inputs for the red-team, defensive posture recommendations for the blue-team, and technique taxonomy updates for the research agent.

**Sandbox Isolation** ensures that all forensic analysis of potentially adversarial content occurs within strict sandbox isolation. No forensic operation can modify platform state, access production data, or execute external network operations. Sandbox boundaries are enforced at the [OTP](@/glossary/otp.md) supervision level.

## Implementation

```elixir
defmodule Prismatic.Security.ManipulationForensics do
  @moduledoc """
  L3 Strategic Command agent for manipulation event forensic investigation.
  Post-incident analysis with strict evidence chain preservation.
  """

  use GenServer
  require Logger

  alias Prismatic.Security.Forensics.{EvidenceCollector, TimelineBuilder}
  alias Prismatic.Security.Forensics.{TechniqueMatcher, AttributionEngine, ImpactAssessor}

  @attribution_confidence_threshold 0.95
  @max_investigation_duration_hours 72

  defstruct [:investigation_id, :incident, :evidence_chain, :timeline, :attribution, :phase]

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: via_tuple(opts[:investigation_id]))
  end

  @spec investigate(String.t(), map()) :: {:ok, map()} | {:error, term()}
  def investigate(investigation_id, incident) do
    GenServer.call(via_tuple(investigation_id), {:investigate, incident}, 300_000)
  end

  @impl true
  def handle_call({:investigate, incident}, _from, state) do
    :telemetry.execute(
      [:prismatic, :security, :forensics, :investigation_start],
      %{timestamp: System.monotonic_time()},
      %{investigation_id: state.investigation_id}
    )

    with {:ok, evidence} <- EvidenceCollector.collect(incident),
         {:ok, timeline} <- TimelineBuilder.reconstruct(evidence),
         {:ok, techniques} <- TechniqueMatcher.identify(evidence, timeline),
         {:ok, attribution} <- AttributionEngine.analyze(evidence, timeline, techniques),
         {:ok, impact} <- ImpactAssessor.assess(incident, timeline) do
      report = build_forensic_report(evidence, timeline, techniques, attribution, impact)
      {:reply, {:ok, report}, %{state | phase: :complete, evidence_chain: evidence}}
    else
      {:error, reason} ->
        {:reply, {:error, reason}, %{state | phase: :blocked}}
    end
  end
end
```

## Integration Points

| Integration Target | Relationship | Data Flow |
|-------------------|-------------|-----------|
| [manipulation-detection](@/agents/manipulation-detection.md) | Receives detection alerts that trigger forensic investigations | Inbound |
| [manipulation-research](@/agents/manipulation-research.md) | Consumes technique taxonomy for incident classification | Inbound |
| [manipulation-detector](@/agents/manipulation-detector.md) | Receives detailed artifact analysis for investigation context | Inbound |
| [purple-closure-analyst](@/agents/purple-closure-analyst.md) | Forensic findings feed closure evaluation for Red-Blue synthesis | Outbound |
| [blue-commander](@/agents/blue-commander.md) | Investigation results update defensive posture assessments | Outbound |
| [red-scenario-generator](@/agents/red-scenario-generator.md) | Forensic findings inform adversarial simulation scenarios | Outbound |
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Runtime execution and lifecycle management | Infrastructure |
| Prismatic Telemetry | Investigation progress tracking and [metrics](@/glossary/metrics.md) | Outbound |

## Operational Workflow

**Phase 1 -- Investigation Initiation**: Forensic investigation is triggered by detection alerts, external reports, or manual requests. The agent initializes a sandboxed investigation context with unique tracking identifiers.

**Phase 2 -- Evidence Collection**: All available evidence artifacts are gathered and preserved with cryptographic integrity verification. Evidence sources include content streams, network metadata, behavioral data, and temporal signals.

**Phase 3 -- Timeline Reconstruction**: Evidence is organized into a chronological event sequence, establishing the manipulation campaign's lifecycle from initiation through execution to observed impact.

**Phase 4 -- Technique Identification**: Observed manipulation patterns are matched against the technique taxonomy. Known techniques are classified; novel patterns are flagged for taxonomy extension.

**Phase 5 -- Attribution Analysis**: Multi-dimensional correlation analysis produces actor profiles with quantified confidence levels. Attribution conclusions at or above the 0.95 threshold are published; lower-confidence assessments are documented but clearly marked as provisional.

**Phase 6 -- Reporting and Intelligence Distribution**: Forensic report is generated and distributed to all dependent agents. Detection model updates, defensive posture recommendations, and taxonomy extensions are published through the platform's intelligence distribution channels.

## NABLA Compliance

| Axiom | Forensic Investigation Application |
|-------|-------------------------------------|
| Signal Plurality | Attribution requires corroboration from minimum three independent evidence sources |
| Contradiction Preservation | Conflicting evidence is preserved and analyzed rather than discarded |
| Absence Informative | Missing evidence is documented as an investigation gap, not overlooked |
| Time Decay | Evidence timestamps are verified; temporal integrity gaps are flagged |
| Unknown Valid | Inconclusive findings are reported as unknown rather than forced into categories |
| Source Independence | Independent evidence streams are weighted higher than correlated indicators |
| Provenance Mandatory | Complete evidence chain from collection through analysis to conclusion |

Forensic conclusions are held to the highest evidentiary standard under the [NO DOUBTS](@/glossary/no-doubts.md) principle. No attribution is published without meeting the 0.95 confidence threshold.

## Configuration

```elixir
config :prismatic_security, Prismatic.Security.ManipulationForensics,
  attribution_confidence_threshold: 0.95,
  max_investigation_duration_hours: 72,
  evidence_retention_days: 365,
  sandbox_isolation: :strict,
  concurrent_investigations: 5,
  telemetry_prefix: [:prismatic, :security, :forensics]
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `attribution_confidence_threshold` | 0.95 | Minimum confidence for attribution publication |
| `max_investigation_duration_hours` | 72 | Maximum investigation duration before escalation |
| `evidence_retention_days` | 365 | Evidence artifact retention period |
| `sandbox_isolation` | `:strict` | Isolation level for forensic analysis |

## Performance

| Metric | Target | Measured |
|--------|--------|----------|
| Evidence collection | < 30s | 14s (P95) |
| Timeline reconstruction | < 60s | 28s (P95) |
| Technique identification | < 20s | 9s (P95) |
| Attribution analysis | < 120s | 55s (P95) |
| Full investigation | < 5min | 2.8min (P95) |
| Concurrent investigations | 5+ | 8 tested |

## Related Resources

- [manipulation-detection](@/agents/manipulation-detection.md) -- Detection alert source
- [manipulation-research](@/agents/manipulation-research.md) -- Technique taxonomy for classification
- [manipulation-detector](@/agents/manipulation-detector.md) -- Artifact analysis inputs
- [blue-commander](@/agents/blue-commander.md) -- Defensive posture updates
- [purple-closure-analyst](@/agents/purple-closure-analyst.md) -- Red-Blue synthesis integration
- [Color Teams](@/glossary/color-teams.md) -- Security operations architecture
- [AIAD Standard](@/glossary/aiad.md) -- Agent specification framework
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- Epistemic framework for evidence-based investigation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)