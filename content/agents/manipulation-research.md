+++
title = "manipulation-research"
weight = 246
[extra]
domain = "research"
level = "L3"
description = "Content to analyze"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "seadf", "telemetry"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2200
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["manipulation-research", "Content", "agents", "agent", "Prismatic Platform", "Outbound", "Phase", "Research", "Trinity Gate"]
tags = ["agents", "agent", "manipulation-research", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "manipulation-research - Prismatic Platform"
+++

## Overview

The manipulation-research agent operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform's research domain, specializing in the systematic study and cataloging of information manipulation techniques. This agent conducts deep analytical research into narrative manipulation methodologies, disinformation propagation patterns, and influence operation structures. Its research outputs feed directly into the platform's epistemic defense infrastructure, providing the foundational knowledge required by detection and forensics agents to identify live manipulation campaigns.

Operating under the [AIAD](@/glossary/aiad.md) standard and governed by the [NO MERCY, NO DOUBTS](@/glossary/no-mercy.md) doctrine, the manipulation-research agent produces evidence-backed research artifacts that meet [Trinity Gate](@/glossary/trinity-gate.md) validation requirements. Every research finding carries full provenance metadata, ensuring traceability from raw source material through analysis to final classification. The agent applies the [NABLA Infinity](@/glossary/nabla-infinity.md) framework's [signal plurality](@/glossary/signal-plurality.md) axiom, requiring multiple independent sources before establishing any manipulation technique classification.

The research function is foundational to the platform's epistemic defense strategy because it produces the knowledge artifacts that every other agent in the manipulation defense chain depends on. Detection agents need technique signatures to identify active campaigns. Forensics agents need taxonomies to classify observed patterns. Red-team agents need technique intelligence to design realistic adversarial simulations. Without rigorous, continuously updated research, the entire defense chain operates on stale knowledge against an evolving adversary.

## Architecture

The manipulation-research agent implements a research pipeline architecture that progressively refines raw intelligence into structured taxonomies and detection signatures.

```
Research Sources              Analysis Pipeline                 Research Outputs
+------------------+        +--------------------+           +------------------+
| Academic Papers  |---+    | Source Aggregator  |           | Technique        |
+------------------+   |    | (Multi-Channel)    |---+       | Taxonomy         |
| Incident Reports |---+--->+--------------------+   |   +-->+------------------+
+------------------+   |    | Pattern Extractor  |   |   |   | Detection        |
| Campaign Studies |---+    | (Technique ID)     |---+---+   | Signatures       |
+------------------+   |    +--------------------+   |   |   +------------------+
| Forensic Outputs |---+    | Taxonomy Builder   |   |   |   | Evolution        |
+------------------+        | (Classification)   |---+   +-->| Tracking         |
                            +--------------------+   |       +------------------+
                            | Signature Generator|   |       | Simulation       |
                            | (Detection Rules)  |---+       | Scenarios        |
                            +--------------------+           +------------------+
```

The pipeline processes research inputs through four stages: source aggregation (collecting intelligence from academic, operational, and forensic channels), pattern extraction (identifying manipulation technique patterns from raw data), taxonomy construction (organizing patterns into hierarchical classifications), and signature generation (producing machine-readable detection rules from classified techniques).

## Core Capabilities

The manipulation-research agent provides comprehensive manipulation knowledge through several specialized capability domains.

**Manipulation Taxonomy Development** classifies and catalogs manipulation techniques into structured hierarchies covering multiple dimensions. The primary taxonomy organizes techniques by method: narrative distortion (false attribution, selective quoting, context stripping, strawman construction), source poisoning (credential fabrication, authority borrowing, source laundering, citation manipulation), emotional exploitation (fear amplification, outrage manufacturing, trust exploitation, empathy hijacking), and coordinated amplification (bot networks, sock puppet coordination, astroturfing, brigading). Secondary taxonomies organize techniques by target (individual, group, institutional), medium (text, image, video, audio), and sophistication level.

**Historical Campaign Analysis** studies documented manipulation campaigns to extract reusable detection signatures and behavioral fingerprints. Campaign analysis covers high-profile state-sponsored disinformation operations, corporate manipulation campaigns, and grassroots influence operations. Each campaign study produces structured outputs: technique catalog (what methods were used), infrastructure mapping (what platforms and tools were employed), effectiveness assessment (what impact was achieved), and detection gap analysis (what defenses failed and why).

**Technique Evolution Tracking** monitors the evolution of manipulation methods across platforms and contexts, identifying adaptation patterns that signal emerging threats. Evolution tracking maintains temporal models of technique sophistication, adoption rates, and cross-platform migration patterns. Tracked evolution dimensions include automation level (manual to fully automated), targeting precision (broadcast to micro-targeted), multi-modal integration (single-medium to cross-medium), and detection evasion sophistication.

**Detection Signature Production** translates classified manipulation techniques into machine-readable detection signatures compatible with the platform's detection infrastructure. Signatures specify observable indicators, confidence weighting factors, and combination rules for multi-indicator detection. Each signature is tested against historical campaign data to validate detection sensitivity before deployment.

**Cross-Platform Analysis** examines manipulation technique variations across different communication platforms, identifying platform-specific adaptations and cross-platform coordination patterns. This analysis enables platform-aware detection that accounts for the distinct characteristics of each communication channel.

**Adversarial Scenario Development** produces structured scenario descriptions for red-team simulation based on research findings. Scenarios specify technique combinations, targeting strategies, and expected behavioral indicators, enabling realistic adversarial testing of the platform's detection infrastructure.

## Implementation

```elixir
defmodule Prismatic.Research.ManipulationResearch do
  @moduledoc """
  L3 Strategic Command agent for manipulation technique research.
  Systematic study and cataloging of information manipulation techniques.
  """

  use GenServer
  require Logger

  alias Prismatic.Research.Manipulation.{SourceAggregator, PatternExtractor}
  alias Prismatic.Research.Manipulation.{TaxonomyBuilder, SignatureGenerator, EvolutionTracker}

  @research_sources [:academic, :incident_reports, :campaign_studies, :forensic_outputs]
  @taxonomy_update_interval :weekly

  defstruct [:taxonomy_version, :technique_catalog, :signatures, :evolution_models]

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec catalog(keyword()) :: {:ok, map()} | {:error, term()}
  def catalog(opts \\ []) do
    GenServer.call(__MODULE__, {:catalog, opts}, 60_000)
  end

  @spec analyze_pattern(map()) :: {:ok, map()} | {:error, term()}
  def analyze_pattern(pattern_data) do
    GenServer.call(__MODULE__, {:analyze_pattern, pattern_data}, 120_000)
  end

  @impl true
  def handle_call({:analyze_pattern, pattern_data}, _from, state) do
    :telemetry.execute(
      [:prismatic, :research, :manipulation, :analysis_start],
      %{timestamp: System.monotonic_time()},
      %{}
    )

    with {:ok, patterns} <- PatternExtractor.extract(pattern_data),
         {:ok, classified} <- TaxonomyBuilder.classify(patterns, state.technique_catalog),
         {:ok, signatures} <- SignatureGenerator.generate(classified),
         {:ok, evolution} <- EvolutionTracker.update(classified, state.evolution_models) do
      report = %{
        patterns: classified,
        new_signatures: signatures,
        evolution_update: evolution,
        taxonomy_version: state.taxonomy_version,
        generated_at: DateTime.utc_now()
      }
      {:reply, {:ok, report}, update_state(state, classified, signatures)}
    else
      {:error, reason} ->
        {:reply, {:error, reason}, state}
    end
  end
end
```

## Integration Points

| Integration Target | Relationship | Data Flow |
|-------------------|-------------|-----------|
| [manipulation-detection](@/agents/manipulation-detection.md) | Consumes research outputs for real-time detection rule generation | Outbound |
| [manipulation-forensics](@/agents/manipulation-forensics.md) | Uses technique taxonomy for incident classification and attribution | Outbound |
| [manipulation-detector](@/agents/manipulation-detector.md) | Research outputs update artifact-level detection models | Outbound |
| [red-epistemic-attacker](@/agents/red-epistemic-attacker.md) | Receives technique intelligence for adversarial simulation scenarios | Outbound |
| [blue-signal-aggregator](@/agents/blue-signal-aggregator.md) | Research findings inform defensive signal correlation models | Outbound |
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Runtime execution and lifecycle management | Infrastructure |
| Prismatic Telemetry | Research pipeline [metrics](@/glossary/metrics.md) and progress tracking | Outbound |

## Operational Workflow

**Phase 1 -- Source Collection**: Gather research inputs from academic publications, incident reports, campaign studies, and forensic investigation outputs. Validate source credibility and recency.

**Phase 2 -- Pattern Extraction**: Analyze collected sources to identify manipulation technique patterns. Extract observable indicators, behavioral signatures, and structural characteristics.

**Phase 3 -- Taxonomy Classification**: Organize extracted patterns into the hierarchical technique taxonomy. Identify new technique categories, sub-categories, and cross-category relationships.

**Phase 4 -- Signature Generation**: Produce machine-readable detection signatures from classified techniques. Test signatures against historical data to validate sensitivity and specificity.

**Phase 5 -- Intelligence Distribution**: Publish updated taxonomies, signatures, and evolution models to all dependent agents through the platform's intelligence distribution channels.

**Phase 6 -- Evolution Monitoring**: Continuously track technique evolution patterns across platforms and contexts. Generate evolution reports and threat forecasts for strategic planning.

## NABLA Compliance

| Axiom | Manipulation Research Application |
|-------|-----------------------------------|
| Signal Plurality | Technique classifications require evidence from minimum two independent research sources |
| Contradiction Preservation | Conflicting research findings are preserved and analyzed as research data |
| Absence Informative | Gaps in technique taxonomy coverage are tracked as research priorities |
| Time Decay | Research findings carry timestamps; taxonomy entries expire without refresh |
| Unknown Valid | Novel patterns are classified as "emerging" rather than forced into existing categories |
| Source Independence | Academic, operational, and forensic sources provide independent validation |
| Provenance Mandatory | Every taxonomy entry traces to specific source material with full attribution |

All research outputs are validated through the [NO DOUBTS](@/glossary/no-doubts.md) principle and must pass [Trinity Gate](@/glossary/trinity-gate.md) structural consistency checks.

## Configuration

```elixir
config :prismatic_research, Prismatic.Research.ManipulationResearch,
  taxonomy_update_interval: :weekly,
  min_sources_per_classification: 2,
  signature_test_coverage: 0.90,
  evolution_tracking_window_months: 24,
  research_sources: [:academic, :incident_reports, :campaign_studies, :forensic_outputs],
  telemetry_prefix: [:prismatic, :research, :manipulation]
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `taxonomy_update_interval` | `:weekly` | Frequency of taxonomy review cycles |
| `min_sources_per_classification` | 2 | Minimum sources for NABLA signal plurality |
| `signature_test_coverage` | 0.90 | Required test coverage for new detection signatures |
| `evolution_tracking_window_months` | 24 | Historical window for evolution trend analysis |

## Performance

| Metric | Target | Measured |
|--------|--------|----------|
| Pattern analysis | < 60s | 32s (P95) |
| Taxonomy classification | < 10s | 4.5s (P95) |
| Signature generation | < 15s | 7s (P95) |
| Full research cycle | < 120s | 58s (P95) |
| Taxonomy query | < 100ms | 25ms (P95) |
| Evolution model update | < 30s | 14s (P95) |

## Related Resources

- [manipulation-detection](@/agents/manipulation-detection.md) -- Primary consumer of detection signatures
- [manipulation-forensics](@/agents/manipulation-forensics.md) -- Primary consumer of technique taxonomy
- [manipulation-detector](@/agents/manipulation-detector.md) -- Artifact detection model updates
- [red-epistemic-attacker](@/agents/red-epistemic-attacker.md) -- Adversarial simulation inputs
- [blue-signal-aggregator](@/agents/blue-signal-aggregator.md) -- Defensive correlation model inputs
- [AIAD Standard](@/glossary/aiad.md) -- Agent specification framework
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- Epistemic framework for evidence-based research
- [Trinity Gate](@/glossary/trinity-gate.md) -- Three-layer validation for research conclusions

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)