+++
title = "Prismatic Influence"
weight = 47
[extra]
icon = "megaphone"
color = "orange"
description = "Influence operation detection and information warfare analysis"
category = "Intelligence"
files = "175"
status = "Development"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1047
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Influence", "apps", "Intelligence", "Prismatic Platform", "PrismaticInfluence", "Multi", "Campaign"]
tags = ["apps", "intelligence", "prismatic-influence", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Influence - Prismatic Platform"
+++

## Overview

Prismatic Influence provides tools for detecting and analyzing influence operations, disinformation campaigns, and information warfare tactics. It monitors information channels for coordinated inauthentic behavior, narrative manipulation, and sentiment engineering targeting organizations or public discourse. In an era where reputation attacks and disinformation campaigns can materially damage organizations, Influence provides the analytical foundation for understanding who is saying what, whether the behavior is coordinated, and what the likely objectives are. This module operates at the strategic level of [threat intelligence](/glossary/threat-intelligence/), analyzing campaigns as organized operations rather than individual messages.

The module models information flows as directed graphs where nodes represent accounts, publications, or platforms, and edges represent content propagation with temporal metadata. By analyzing the structural properties of these graphs -- clustering coefficients, propagation velocity, temporal synchronization -- Influence can distinguish organic information spread from coordinated campaigns with high confidence. The [NABLA](/glossary/nabla-infinity/) framework's [signal plurality](/glossary/signal-plurality/) axiom is enforced throughout: no single indicator is sufficient to classify behavior as inauthentic; multiple independent signals must converge. Graph analysis results are persisted in [KuzuDB](/glossary/kuzudb/) as a [knowledge graph](/glossary/knowledge-graph/), enabling relationship traversal across campaigns, actors, and narratives.

Influence also provides counter-narrative effectiveness measurement, allowing organizations to evaluate whether their communications are successfully addressing disinformation. This closed-loop capability transforms Influence from a passive monitoring tool into an active defense system for organizational reputation -- directly supporting the platform's [EASM](/glossary/easm/) mission by covering the informational dimension of the [attack surface](/glossary/attack-surface/).

## Architecture

```
Social APIs --> Collection Layer --> Normalization --> Analysis Layer --> Assessment
News Feeds -->       |                  |               |               |
Forums     -->   GenStage Pipeline   Event Stream   Graph Build     Confidence
Telegram   -->   Rate Limiting       Dedup/Enrich   NLP Classify    Scoring
Custom     -->   Backpressure        Entity Tag      Temporal Sync   KuzuDB Store
```

The module is organized around three processing layers. The **Collection Layer** aggregates content from configured channels (social media APIs, news feeds, forum scrapers) into a normalized event stream. The **Analysis Layer** applies graph construction, temporal pattern detection, and NLP-based content classification using a pipeline of [GenStage](/glossary/genstage/) producers and consumers with [backpressure](/glossary/backpressure/) management. The **Assessment Layer** combines analytical outputs into structured influence assessments with [confidence scoring](/glossary/confidence-scoring/), stored in KuzuDB for relationship traversal and in [PostgreSQL](/glossary/postgresql/) for time-series querying.

Each analysis function runs as a supervised Task under a `TaskSupervisor` within the [OTP](/glossary/otp/) [supervision tree](/glossary/supervision-tree/), enabling parallel processing of multiple channels and campaigns simultaneously. [Telemetry](/glossary/telemetry/) events report processing latencies, detection rates, and false positive ratios for continuous calibration.

## Key Modules

| Module | Responsibility |
|--------|----------------|
| `PrismaticInfluence` | Public facade: `analyze_narrative/1`, `detect_coordination/1`, `assess_credibility/2` |
| `PrismaticInfluence.Application` | OTP application entry point and supervision tree |
| `PrismaticInfluence.Collector` | Multi-channel content collection with rate limiting |
| `PrismaticInfluence.GraphBuilder` | Information flow graph construction with temporal edges |
| `PrismaticInfluence.NlpClassifier` | Content classification using semantic embeddings |
| `PrismaticInfluence.CoordinationDetector` | Temporal synchronization and behavioral clustering analysis |
| `PrismaticInfluence.CredibilityAssessor` | Source credibility scoring with historical accuracy tracking |
| `PrismaticInfluence.CounterNarrative` | Counter-narrative effectiveness measurement |
| `PrismaticInfluence.CampaignTracker` | Long-running campaign state management with lifecycle tracking |

## Key Features

### Detection Capabilities
- Coordinated inauthentic behavior identification through temporal synchronization analysis
- Bot network detection using account creation patterns, posting frequency, and content similarity
- Narrative tracking with semantic clustering to group related messaging across platforms using [embedding](/glossary/embedding/)s
- Astroturfing and fake grassroots identification through account provenance analysis

### Analysis Tools
- Narrative network mapping showing propagation paths from origin to amplification nodes
- Source credibility assessment using historical accuracy, editorial standards, and ownership data
- Information cascade analysis measuring reach, velocity, and amplification ratios
- Counter-narrative effectiveness measurement comparing sentiment shifts before and after response

### Coordination Detection Methodology

The coordination detection system uses three complementary signals that must converge before classifying behavior as coordinated:

| Signal | Method | Weight |
|--------|--------|--------|
| Temporal Synchronization | Message timing correlation within sliding windows | 0.35 |
| Content Similarity | Semantic embedding cosine similarity above threshold | 0.35 |
| Network Overlap | Shared follower/following patterns and engagement targets | 0.30 |

```elixir
defmodule PrismaticInfluence.CoordinationDetector do
  @spec detect(list(map()), keyword()) :: {:ok, list(map())} | {:error, term()}
  def detect(accounts, opts \\ []) do
    threshold = Keyword.get(opts, :threshold, 0.85)
    methods = Keyword.get(opts, :methods, [:temporal_sync, :content_similarity, :network_overlap])

    signals = Enum.map(methods, fn method ->
      {method, compute_signal(accounts, method)}
    end)

    clusters = fuse_signals(signals, threshold)

    {:ok, Enum.map(clusters, fn cluster ->
      %{
        accounts: cluster.members,
        coordination_score: cluster.score,
        evidence: cluster.signals,
        confidence: compute_confidence(cluster)
      }
    end)}
  end
end
```

### Narrative Lifecycle Tracking

Influence campaigns evolve through distinct phases, from initial seeding through amplification to saturation. The CampaignTracker models this lifecycle to provide predictive intelligence on campaign trajectory:

| Phase | Indicators | Typical Duration | Response Window |
|-------|-----------|------------------|-----------------|
| Seeding | Low volume, few accounts, test messaging | 1-7 days | Pre-emptive |
| Amplification | Rapid volume increase, bot activation, cross-platform spread | 1-3 days | Immediate |
| Peak | Maximum reach, mainstream media pickup | 12-48 hours | Reactive |
| Decay | Declining engagement, account cleanup | 3-14 days | Assessment |

```elixir
defmodule PrismaticInfluence.CampaignTracker do
  @spec assess_phase(Campaign.t()) :: {:ok, CampaignPhase.t()} | {:error, term()}
  def assess_phase(campaign) do
    metrics = compute_campaign_metrics(campaign)

    phase = cond do
      metrics.volume_trend == :rapid_increase and metrics.account_diversity < 0.3 ->
        :amplification
      metrics.volume > metrics.baseline * 10 ->
        :peak
      metrics.volume_trend == :declining and metrics.age_days > 3 ->
        :decay
      true ->
        :seeding
    end

    {:ok, %CampaignPhase{phase: phase, confidence: metrics.confidence, metrics: metrics}}
  end
end
```

### Monitoring and Alerting
- Real-time information [channel](/glossary/channel/) surveillance with configurable keyword and [entity resolution](/glossary/entity-resolution/) tracking
- Trend divergence detection comparing observed narrative volume against baseline models
- Cross-platform coordination identification linking accounts across social media services
- Early warning system for emerging campaigns based on velocity and coordination indicators

### Evidence and Reporting
- Campaign evidence packaging with full provenance chains for [audit trail](/glossary/audit-trail/) requirements
- [GDPR](/glossary/gdpr/)-compliant personal data handling in influence analysis outputs
- Structured evidence export for regulatory reporting on information security [incident response](/glossary/incident-response/)
- Visualization of influence networks for executive briefings via [Phoenix LiveView](/glossary/phoenix-liveview/)

## Usage

```elixir
# Analyze narrative spread across channels
{:ok, analysis} = PrismaticInfluence.analyze_narrative(
  topic: "brand_name",
  channels: [:twitter, :reddit, :news, :telegram],
  window: :last_7_days)
# => %{narratives: [...], coordination_score: 0.73, top_amplifiers: [...]}

# Detect coordinated inauthentic behavior
{:ok, clusters} = PrismaticInfluence.detect_coordination(
  accounts: account_list,
  threshold: 0.85,
  methods: [:temporal_sync, :content_similarity, :network_overlap])

# Assess source credibility with evidence
{:ok, assessment} = PrismaticInfluence.assess_credibility(source_url,
  factors: [:editorial_history, :ownership, :citation_patterns])

# Monitor for emerging influence campaigns
{:ok, monitor} = PrismaticInfluence.create_monitor(
  entity: "organization_name",
  channels: [:all],
  alert_threshold: :medium)

# Measure counter-narrative effectiveness
{:ok, effectiveness} = PrismaticInfluence.measure_counter_narrative(
  campaign_id: campaign_id,
  metric: :sentiment_shift,
  window: :post_response_7_days)
```

## NABLA Compliance

| NABLA Axiom | Influence Enforcement | Implementation |
|-------------|----------------------|----------------|
| Signal Plurality | Multi-signal convergence required for coordination classification | Three independent detection methods must agree above threshold |
| Provenance Mandatory | Every influence claim traceable to source content | Full evidence chain from social media post to assessment |
| Contradiction Preservation | Conflicting credibility assessments preserved | Multiple assessment methods maintained independently |
| Source Independence | Each analysis method operates independently | Separate GenStage stages with independent state |
| Unknown Valid | Low-confidence assessments explicitly marked | Confidence scores with explicit uncertainty ranges |

## Testing

Collection tests verify channel integration, rate limiting, and content normalization against captured API response fixtures. Coordination detection tests verify temporal synchronization, content similarity, and network overlap algorithms against labeled datasets of known coordinated and organic behavior. NLP classification tests verify semantic clustering accuracy.

Integration tests exercise the full pipeline from content collection through analysis to assessment generation. Property-based tests generate random content streams to verify coordination detection stability. Campaign lifecycle tests verify phase transition accuracy using synthetic campaign data with known trajectories.

## Integration Points

| Application | Relationship |
|-------------|--------------|
| [Prismatic Manipulation](/apps/prismatic-manipulation/) | Tactical social engineering analysis complementing strategic detection |
| [Prismatic Narrative](/apps/prismatic-narrative/) | Intelligence report generation from influence analysis findings |
| [Prismatic Deduction](/apps/prismatic-deduction/) | Rule-based [inference](/glossary/inference/) over influence indicators |
| [Prismatic CER](/apps/prismatic-cer/) | Campaign evidence storage for regulatory reporting |
| [Prismatic Graph](/apps/prismatic-graph/) | Influence network graph stored in KuzuDB |

## Performance

| Operation | Latency | Notes |
|-----------|---------|-------|
| Content collection (per channel) | 1-5s | API rate limiting |
| Coordination detection | 2-10s | Depends on account volume |
| NLP classification | 100-500ms | Per content item |
| Credibility assessment | 500ms-2s | Multi-factor evaluation |
| Graph construction | < 1s | Per campaign update |
| Campaign phase assessment | < 200ms | Metric computation and classification |

[Telemetry](/glossary/telemetry/) events: `[:prismatic, :influence, :campaign_detected]`, `[:prismatic, :influence, :coordination_scored]`, `[:prismatic, :influence, :narrative_tracked]`.

## Related Resources

- [Prismatic Suppression](/apps/prismatic-suppression/) -- Alert noise reduction for high-volume influence monitoring
- [Evidence Enforcement Agent](/agents/evidence-enforcement-agent/) -- Ensures influence claims meet evidentiary thresholds
- [Competitor Researcher](/agents/competitor-researcher/) -- Competitive intelligence overlapping with influence monitoring
- [Alert Management Specialist](/agents/alert-management-specialist/) -- Routes influence campaign alerts to response teams
- [Intelligence Synthesis](/capabilities/intelligence-synthesis/) -- Multi-channel information fusion for campaign detection
- [Nabla Axioms](/capabilities/nabla-axioms/) -- Signal plurality prevents single-indicator classification
- [Color Teams](/capabilities/color-teams/) -- Red team simulates influence attacks while Blue validates detection

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)