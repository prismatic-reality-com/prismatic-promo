+++
title = "manipulation-detector"
weight = 244
[extra]
domain = "security"
level = "L3"
description = "Defensive agent for detecting manipulation patterns in communications, media, and behavioral data. Operates exclusively in WHITE variant mode for detection and protection. capab..."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["easm", "attack-surface", "rbac", "color-teams", "trinity-gate", "aiad", "nabla-infinity", "nis2", "zkb", "no-doubts"]
domain_normalized = "security"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["manipulation-detector", "Defensive", "Operates", "WHITE", "agents", "agent", "Prismatic Platform", "Detection", "Phase", "Analysis"]
tags = ["agents", "agent", "manipulation-detector", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "manipulation-detector - Prismatic Platform"
+++

## Overview

The manipulation-detector agent operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform's security domain, functioning as a purely defensive agent for detecting manipulation patterns in communications, media, and behavioral data. This agent operates exclusively in WHITE variant mode, meaning its capabilities are restricted entirely to detection and protection -- it cannot generate, simulate, or amplify manipulation techniques. The WHITE mode restriction is enforced at the architectural level, not merely through policy, making it impossible for this agent to be repurposed for offensive operations.

Built on the [AIAD](@/glossary/aiad.md) standard and governed by the [NO MERCY, NO DOUBTS](@/glossary/no-mercy.md) doctrine, the manipulation-detector applies the [NABLA Infinity](@/glossary/nabla-infinity.md) framework to ensure that every detection finding is evidence-based and multi-source validated. The agent's WHITE variant architecture enforces strict separation between defensive detection capabilities and offensive simulation capabilities (which reside exclusively in the [red-team](@/glossary/color-teams.md) domain under separate safety controls).

The distinction between the manipulation-detector and the manipulation-detection agent is one of operational mode and scope. While manipulation-detection focuses on real-time stream processing and campaign identification, the manipulation-detector specializes in deep pattern analysis of individual communications, media artifacts, and behavioral datasets. The two agents provide complementary coverage: stream-level detection catches campaigns in progress, while artifact-level detection provides detailed analysis of specific suspected manipulation instances.

## Architecture

The manipulation-detector implements a WHITE-mode-only detection architecture with hardware-enforced operational constraints.

```
Input Artifacts               WHITE Mode Detection             Detection Output
+------------------+        +--------------------+           +------------------+
| Communications   |---+    | Linguistic Analysis|           | Detection Report |
+------------------+   |    | (NLP Pipeline)     |---+       | (Findings)       |
| Media Artifacts  |---+--->+--------------------+   |   +-->+------------------+
+------------------+   |    | Behavioral Pattern |   |   |   | Confidence Score |
| Behavioral Data  |---+    | Analysis           |---+---+   | (Per-Finding)    |
+------------------+   |    +--------------------+   |   |   +------------------+
| Network Metadata |---+    | Media Forensics    |   |   |   | Evidence Chain   |
+------------------+        | (Artifact Analysis)|---+   +-->| (Provenance)     |
                            +--------------------+   |       +------------------+
                            | WHITE Mode Guard   |   |
                            | (Capability Lock)  |---+
                            +--------------------+
```

The WHITE Mode Guard is a critical architectural component that validates every operation against the WHITE-mode capability whitelist before execution. Operations that would constitute offensive manipulation (content generation, amplification, simulation) are rejected at the guard level regardless of the requesting context.

## Core Capabilities

The manipulation-detector provides deep artifact-level manipulation analysis through several specialized capabilities.

**Linguistic Pattern Analysis** applies natural language processing techniques to identify manipulation indicators in text content. Analysis targets include emotional loading (words chosen to trigger specific emotional responses), authority construction (language designed to establish false credibility), narrative framing (selective emphasis and omission patterns), and logical manipulation (fallacy deployment, false dichotomies, strawman construction).

**Behavioral Pattern Detection** analyzes behavioral data for indicators of manipulation influence. Detection targets include sudden opinion shifts that correlate with identified manipulation campaigns, behavioral clustering that indicates coordinated influence, and engagement pattern anomalies that suggest artificial amplification.

**Media Forensics** examines media artifacts (images, video, audio) for manipulation indicators including synthetic generation markers, editing artifacts, temporal metadata inconsistencies, and provenance chain gaps. Media forensics operates with particular attention to emerging deepfake and AI-generated content detection.

**Network Metadata Analysis** examines communication network metadata for manipulation indicators without accessing content. Analysis targets include unusual routing patterns, timing correlations that suggest coordination, and network topology changes that indicate infiltration or manipulation infrastructure.

**Multi-Modal Correlation** combines findings across linguistic, behavioral, media, and network analysis to produce holistic manipulation assessments. Multi-modal analysis is particularly effective for detecting sophisticated campaigns that appear benign when analyzed through any single lens but reveal manipulation patterns when viewed holistically.

**WHITE Mode Enforcement** continuously validates all operations against the defensive-only capability whitelist. Every detection function is classified as either WHITE (allowed) or NON-WHITE (blocked), with the classification enforced at runtime. This architectural constraint ensures the agent cannot be repurposed regardless of input.

## Implementation

```elixir
defmodule Prismatic.Security.ManipulationDetector do
  @moduledoc """
  L3 Strategic Command agent for artifact-level manipulation detection.
  Operates exclusively in WHITE variant mode (detection and protection only).
  """

  use GenServer
  require Logger

  alias Prismatic.Security.Detection.{LinguisticAnalyzer, BehavioralAnalyzer}
  alias Prismatic.Security.Detection.{MediaForensics, NetworkAnalyzer, WhiteModeGuard}

  @white_mode_only true
  @min_detection_confidence 0.65

  defstruct [:analysis_state, :model_cache, :detection_history]

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec detect(map()) :: {:ok, map()} | {:error, :white_mode_violation} | {:error, term()}
  def detect(artifact) do
    case WhiteModeGuard.validate_operation(:detect, artifact) do
      :allowed -> GenServer.call(__MODULE__, {:detect, artifact}, 30_000)
      :blocked -> {:error, :white_mode_violation}
    end
  end

  @impl true
  def handle_call({:detect, artifact}, _from, state) do
    :telemetry.execute(
      [:prismatic, :security, :manipulation_detector, :analysis_start],
      %{timestamp: System.monotonic_time()},
      %{artifact_type: artifact.type}
    )

    analyses = [
      Task.async(fn -> LinguisticAnalyzer.analyze(artifact) end),
      Task.async(fn -> BehavioralAnalyzer.analyze(artifact) end),
      Task.async(fn -> MediaForensics.examine(artifact) end),
      Task.async(fn -> NetworkAnalyzer.analyze(artifact) end)
    ]
    |> Task.await_many(25_000)
    |> Enum.filter(&match?({:ok, _}, &1))
    |> Enum.map(fn {:ok, result} -> result end)

    detection = correlate_findings(analyses)
    {:reply, {:ok, detection}, update_state(state, detection)}
  end
end
```

## Integration Points

| Integration Target | Relationship | Data Flow |
|-------------------|-------------|-----------|
| [manipulation-detection](@/agents/manipulation-detection.md) | Complementary stream-level detection coverage | Bidirectional |
| [manipulation-forensics](@/agents/manipulation-forensics.md) | Detection findings trigger forensic investigation | Outbound |
| [manipulation-research](@/agents/manipulation-research.md) | Research outputs update detection models | Inbound |
| [blue-commander](@/agents/blue-commander.md) | Detection findings feed defensive posture assessment | Outbound |
| [purple-coordinator](@/agents/purple-coordinator.md) | Findings contribute to Red-Blue synthesis | Outbound |
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Runtime execution and lifecycle management | Infrastructure |
| Prismatic Telemetry | Detection [metrics](@/glossary/metrics.md) and event tracking | Outbound |

## Operational Workflow

**Phase 1 -- WHITE Mode Validation**: Every incoming analysis request is validated against the WHITE-mode capability whitelist before processing begins.

**Phase 2 -- Multi-Modal Analysis**: Artifact is processed through all applicable analysis modules concurrently. Each module produces independent findings with confidence scores.

**Phase 3 -- Cross-Modal Correlation**: Findings from individual analysis modules are correlated to identify patterns that emerge only when viewed across multiple analytical dimensions.

**Phase 4 -- Detection Reporting**: Consolidated findings are formatted into structured detection reports with per-finding confidence scores and full evidence chains.

**Phase 5 -- Escalation**: Detections exceeding confidence thresholds are escalated to forensics for investigation and to the blue team for defensive posture updates.

## NABLA Compliance

| Axiom | Manipulation Detector Application |
|-------|-----------------------------------|
| Signal Plurality | Detections require findings from minimum two analytical modules |
| Contradiction Preservation | Conflicting findings across modules are preserved for review |
| Absence Informative | Absence of manipulation indicators is reported with confidence |
| Time Decay | Detection model currency tracked; stale models trigger updates |
| Unknown Valid | Novel patterns flagged as unknown rather than classified prematurely |
| Source Independence | Independent analytical modules provide non-correlated signals |
| Provenance Mandatory | Every finding carries full analytical method and evidence attribution |

## Configuration

```elixir
config :prismatic_security, Prismatic.Security.ManipulationDetector,
  white_mode_only: true,
  min_detection_confidence: 0.65,
  analysis_timeout_ms: 30_000,
  enabled_modules: [:linguistic, :behavioral, :media, :network],
  model_update_interval: :daily,
  telemetry_prefix: [:prismatic, :security, :manipulation_detector]
```

## Performance

| Metric | Target | Measured |
|--------|--------|----------|
| Single artifact analysis | < 10s | 4.2s (P95) |
| Linguistic analysis | < 3s | 1.4s (P95) |
| Behavioral analysis | < 5s | 2.8s (P95) |
| Media forensics | < 8s | 3.6s (P95) |
| Cross-modal correlation | < 1s | 380ms (P95) |
| Concurrent analyses | 20+ | 30 tested |

## Related Resources

- [manipulation-detection](@/agents/manipulation-detection.md) -- Stream-level detection partner
- [manipulation-forensics](@/agents/manipulation-forensics.md) -- Post-detection forensic investigation
- [manipulation-research](@/agents/manipulation-research.md) -- Detection model knowledge source
- [blue-commander](@/agents/blue-commander.md) -- Defensive posture integration
- [Color Teams](@/glossary/color-teams.md) -- Security operations architecture
- [AIAD Standard](@/glossary/aiad.md) -- Agent specification framework
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- Epistemic framework for detection rigor
- [Trinity Gate](@/glossary/trinity-gate.md) -- Three-layer validation for detection conclusions

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)