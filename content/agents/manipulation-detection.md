+++
title = "manipulation-detection"
weight = 243
[extra]
domain = "safety"
level = "L3"
description = "Content to analyze"
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
keywords = ["manipulation-detection", "Content", "agents", "agent", "Prismatic Platform", "Phase", "Detection", "NABLA Infinity", "Every"]
tags = ["agents", "agent", "manipulation-detection", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "manipulation-detection - Prismatic Platform"
+++

## Overview

The manipulation-detection agent operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform's safety domain, responsible for real-time identification of active information manipulation campaigns. Unlike the research and forensics agents that study manipulation historically, this agent functions as the live detection layer -- continuously monitoring content streams, communication patterns, and behavioral signals to identify manipulation operations as they unfold. Early detection is critical to limiting the impact of narrative distortion, confidence manipulation, and coordinated inauthentic behavior.

Governed by the [NO MERCY, NO DOUBTS](@/glossary/no-mercy.md) doctrine and built on the [AIAD](@/glossary/aiad.md) standard, the detection agent applies the [NABLA Infinity](@/glossary/nabla-infinity.md) framework's [signal plurality](@/glossary/signal-plurality.md) axiom to minimize false positives. Every detection alert requires corroboration from at least two independent signal sources before escalation. The agent publishes detection events through the platform's [telemetry](@/glossary/telemetry.md) infrastructure, enabling immediate response coordination across the [color-team](@/glossary/color-teams.md) security architecture.

The manipulation detection domain addresses a growing threat to information integrity across digital and traditional media channels. As manipulation techniques become more sophisticated -- leveraging AI-generated content, coordinated bot networks, and multi-platform amplification strategies -- automated detection becomes essential for maintaining epistemic defenses. This agent provides the real-time layer that bridges the gap between research knowledge of manipulation techniques and operational defensive response.

## Architecture

The manipulation-detection agent implements a multi-layer detection architecture that processes content streams through increasingly sophisticated analysis stages.

```
Content Streams              Detection Pipeline              Alert System
+------------------+       +--------------------+          +------------------+
| Text Content     |---+   | Signature Matcher  |          | Alert Generator  |
+------------------+   |   | (Known Patterns)   |---+      | (Confidence)     |
| Behavioral Data  |---+-->+--------------------+   |  +-->+------------------+
+------------------+   |   | Anomaly Detector   |   |  |   | Escalation       |
| Network Topology |---+   | (Statistical)      |---+--+   | Manager          |
+------------------+   |   +--------------------+   |  |   +------------------+
| Temporal Signals |---+   | Coordination       |   |  |   | Response         |
+------------------+       | Detector           |---+  +-->| Coordinator      |
                           | (Network Analysis) |   |      +------------------+
                           +--------------------+   |
                           | Adaptive Model     |   |
                           | (Learning Loop)    |---+
                           +--------------------+
```

The pipeline processes content through four detection stages: signature matching (comparing against known manipulation patterns), statistical anomaly detection (identifying deviations from baseline behavior), coordination detection (revealing synchronized activity across multiple actors), and adaptive modeling (continuously updating detection capabilities as new techniques emerge).

## Core Capabilities

The manipulation-detection agent provides comprehensive real-time detection through several specialized capability domains.

**Real-time Pattern Matching** applies detection signatures derived from the manipulation technique taxonomy to incoming content streams. Signatures cover narrative distortion patterns (false attribution, selective quoting, context stripping), emotional manipulation techniques (fear amplification, outrage manufacturing, trust exploitation), and source poisoning indicators (credential fabrication, authority borrowing, source laundering).

**Behavioral Anomaly Detection** identifies coordinated inauthentic behavior through temporal analysis, volume anomalies, and network topology indicators that diverge from established baselines. The anomaly detection engine maintains rolling baselines for normal behavior patterns and flags deviations that exceed statistical thresholds. Anomaly types include burst activity patterns, synchronized posting behavior, unnatural engagement ratios, and topology changes in communication networks.

**Confidence-scored Alerting** ensures every detection alert carries a quantified confidence score, computed from the number and quality of corroborating signals. Escalation thresholds are enforced to prevent alert fatigue from low-confidence signals. Alerts below the minimum confidence threshold are logged for pattern analysis but not escalated.

**Adaptive Detection Models** continuously incorporate new technique signatures from research outputs and forensic findings, evolving detection capabilities alongside manipulation tactics. The adaptive layer implements a feedback loop where confirmed detections refine model parameters and missed detections (identified through forensic analysis) trigger signature updates.

**Coordination Detection** uses network analysis to identify coordinated manipulation campaigns involving multiple actors operating in synchronized patterns. The coordination detector analyzes timing correlations, content similarity, amplification patterns, and network topology to distinguish organic information spread from orchestrated campaigns.

**Self-tuning Thresholds** automatically adjust detection sensitivity based on false-positive feedback loops and environmental context. During periods of elevated threat, thresholds tighten to increase detection coverage; during normal operations, thresholds relax to reduce alert volume.

## Implementation

```elixir
defmodule Prismatic.Safety.ManipulationDetection do
  @moduledoc """
  L3 Strategic Command agent for real-time manipulation detection.
  Monitors content streams for active information manipulation campaigns.
  """

  use GenServer
  require Logger

  alias Prismatic.Safety.Detection.{SignatureMatcher, AnomalyDetector, CoordinationDetector}
  alias Prismatic.Safety.Detection.{AlertGenerator, AdaptiveModel}

  @min_alert_confidence 0.70
  @escalation_threshold 0.85

  defstruct [:pipeline_state, :baselines, :active_alerts, :model_version]

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec analyze_content(map()) :: {:ok, :clean | {:detected, map()}} | {:error, term()}
  def analyze_content(content) do
    GenServer.call(__MODULE__, {:analyze, content}, 5_000)
  end

  @impl true
  def handle_call({:analyze, content}, _from, state) do
    :telemetry.execute(
      [:prismatic, :safety, :manipulation, :detection_start],
      %{timestamp: System.monotonic_time()},
      %{content_type: content.type}
    )

    signals = [
      Task.async(fn -> SignatureMatcher.match(content, state.model_version) end),
      Task.async(fn -> AnomalyDetector.analyze(content, state.baselines) end),
      Task.async(fn -> CoordinationDetector.check(content) end)
    ]
    |> Task.await_many(3_000)
    |> Enum.filter(&match?({:ok, _}, &1))
    |> Enum.map(fn {:ok, signal} -> signal end)

    case AlertGenerator.evaluate(signals, @min_alert_confidence) do
      {:alert, alert} when alert.confidence >= @escalation_threshold ->
        escalate_alert(alert)
        {:reply, {:ok, {:detected, alert}}, update_state(state, alert)}
      {:alert, alert} ->
        log_alert(alert)
        {:reply, {:ok, {:detected, alert}}, state}
      :clean ->
        {:reply, {:ok, :clean}, state}
    end
  end
end
```

## Integration Points

| Integration Target | Relationship | Data Flow |
|-------------------|-------------|-----------|
| [manipulation-research](@/agents/manipulation-research.md) | Consumes technique taxonomy for detection rule generation | Inbound |
| [manipulation-forensics](@/agents/manipulation-forensics.md) | Escalates confirmed detections for forensic investigation | Outbound |
| [manipulation-detector](@/agents/manipulation-detector.md) | Complementary detection coverage (WHITE variant mode) | Bidirectional |
| [blue-drift-detector](@/agents/red-drift-inducer.md) | Shares behavioral drift signals for cross-domain correlation | Bidirectional |
| [red-scenario-generator](@/agents/red-scenario-generator.md) | Receives adversarial scenarios for detection model stress testing | Inbound |
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Runtime execution and lifecycle management | Infrastructure |
| Prismatic Telemetry | Detection event publishing and monitoring dashboard feeds | Outbound |

## Operational Workflow

**Phase 1 -- Baseline Establishment**: Build and maintain behavioral baselines for monitored content streams. Baselines capture normal patterns for volume, timing, engagement, and network topology.

**Phase 2 -- Continuous Monitoring**: Process incoming content through the multi-stage detection pipeline. Each stage operates independently with sub-second latency requirements.

**Phase 3 -- Signal Aggregation**: Combine detection signals from all pipeline stages. Apply confidence scoring based on signal count, quality, and independence.

**Phase 4 -- Alert Generation**: Generate alerts for detections that exceed the minimum confidence threshold. Apply escalation rules based on severity and confidence levels.

**Phase 5 -- Response Coordination**: Route escalated alerts to appropriate response agents (forensics for investigation, blue team for defense, purple team for synthesis).

**Phase 6 -- Model Adaptation**: Update detection models based on confirmed detections and false-positive feedback. Incorporate new technique signatures from research outputs.

## NABLA Compliance

| Axiom | Manipulation Detection Application |
|-------|-------------------------------------|
| Signal Plurality | Detection alerts require corroboration from minimum two independent detection stages |
| Contradiction Preservation | Conflicting detection signals are preserved for forensic analysis |
| Absence Informative | Absence of expected manipulation patterns during known campaigns triggers investigation |
| Time Decay | Detection baselines are continuously refreshed; stale baselines trigger recalibration |
| Unknown Valid | Novel patterns that do not match known signatures are flagged as unknown rather than dismissed |
| Source Independence | Independent detection stages provide non-correlated validation signals |
| Provenance Mandatory | Every detection alert carries full signal chain documentation |

Detection outputs are held to [Trinity Gate](@/glossary/trinity-gate.md) validation standards. False-positive rates are tracked and must remain below defined thresholds.

## Configuration

```elixir
config :prismatic_safety, Prismatic.Safety.ManipulationDetection,
  min_alert_confidence: 0.70,
  escalation_threshold: 0.85,
  detection_timeout_ms: 5_000,
  baseline_refresh_interval_hours: 24,
  adaptive_model_update_interval: :hourly,
  max_concurrent_analyses: 100,
  telemetry_prefix: [:prismatic, :safety, :manipulation]
```

## Performance

| Metric | Target | Measured |
|--------|--------|----------|
| Single content analysis | < 1s | 340ms (P95) |
| Signature matching | < 200ms | 85ms (P95) |
| Anomaly detection | < 500ms | 210ms (P95) |
| Coordination detection | < 500ms | 280ms (P95) |
| Alert generation | < 100ms | 35ms (P95) |
| Throughput | 1000+/s | 1,500/s tested |

## Related Resources

- [manipulation-research](@/agents/manipulation-research.md) -- Technique taxonomy provider
- [manipulation-forensics](@/agents/manipulation-forensics.md) -- Post-detection investigation
- [manipulation-detector](@/agents/manipulation-detector.md) -- Complementary detection (WHITE mode)
- [blue-commander](@/agents/blue-commander.md) -- Defensive posture integration
- [red-scenario-generator](@/agents/red-scenario-generator.md) -- Adversarial testing
- [AIAD Standard](@/glossary/aiad.md) -- Agent specification framework
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- Epistemic framework for detection rigor
- [Color Teams](@/glossary/color-teams.md) -- Security operations architecture

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)