+++
title = "Prismatic Modalities"
weight = 75
[extra]
icon = "squares-plus"
color = "violet"
description = "Multi-modal intelligence processing - text, image, audio, and structured data fusion"
category = "Intelligence"
files = "120"
status = "Development"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1061
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Modalities", "Multi-modal", "apps", "Intelligence", "Prismatic Platform", "PrismaticModalities", "Behavioral", "Prismatic Storage", "HARD"]
tags = ["apps", "intelligence", "prismatic-modalities", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Modalities - Prismatic Platform"
+++

## Overview

Prismatic Modalities provides a comprehensive behavioral profiling framework that models, analyzes, and classifies human communication and interaction patterns across multiple expression modalities. Unlike conventional multi-modal data fusion systems that focus on merging sensor inputs, Prismatic Modalities operates at the behavioral intelligence level -- decomposing human observable behavior into discrete, measurable dimensions organized by modality category. Each modality represents a distinct channel through which individuals express cognitive states, emotional responses, social preferences, and adaptive patterns that intelligence analysts can leverage for entity profiling, behavioral prediction, and deception detection.

The application implements a behaviour-driven architecture where each modality dimension is defined through the `ModalityBehaviour` protocol, ensuring consistent measurement, scoring, and comparison across all modality categories. The system currently models over 120 individual modality dimensions organized into seven primary categories: verbal communication, nonverbal communication, emotional expression, cognitive expression, social interaction, learning and knowledge, creative expression, and adaptation to change. This granularity enables the platform to construct multi-dimensional behavioral fingerprints that capture the full spectrum of observable human expression patterns.

The modality framework integrates with the platform's broader [entity resolution](/glossary/entity-resolution/) pipeline by contributing behavioral trait vectors to entity profiles stored in [KuzuDB](/glossary/kuzudb/). When combined with technical intelligence from [OSINT](/glossary/osint/) sources and structural data from corporate registries, behavioral modality profiles enable a holistic assessment that bridges the gap between what entities do technically and how the humans behind them behave -- a capability essential for social engineering detection, insider threat identification, and deception analysis.

## Architecture

```
PrismaticModalities.Application
+-- PrismaticModalities.Manager (GenServer)
|   +-- Category registration and lifecycle
|   +-- Cross-category correlation engine
|   +-- Behavioral fingerprint aggregation
|
+-- PrismaticModalities.Registry (GenServer)
|   +-- ETS: :modality_registry (120+ dimensions)
|   +-- Behaviour compliance validation
|   +-- Hot-reload for new modality definitions
|
+-- Category Supervisors (per-category)
    +-- VerbalCommunication (15 dimensions)
    +-- NonverbalCommunication (16 dimensions)
    +-- EmotionalExpression (15 dimensions)
    +-- CognitiveExpression (16 dimensions)
    +-- SocialInteraction (15 dimensions)
    +-- LearningKnowledge (16 dimensions)
    +-- CreativeExpressive (10 dimensions)
    +-- AdaptationChange (13 dimensions)
```

```
Input Observation --> Modality Router --> Category Processor --> Dimension Scorer
        |                  |                    |                      |
   Behavioral Data    Category Match      Per-Dimension           0.0 - 1.0
   (text, video,      Based on Input      Analysis Using         Normalized Score
   interaction logs)  Feature Type        ModalityBehaviour       + Confidence
        |                                      |                      |
        +--------------------------------------+----------------------+
                              |
                    Behavioral Fingerprint --> Entity Profile --> Knowledge Graph
                              |
                    Cross-Category Correlation --> Anomaly Detection
```

Each modality dimension is implemented as an independent module conforming to the `ModalityBehaviour` protocol, which defines callbacks for measurement, scoring, normalization, and comparison. The Manager coordinates cross-category analysis, aggregating individual dimension scores into composite behavioral fingerprints that represent an entity's characteristic expression patterns across all observable modalities.

## Key Modules

| Module | Purpose |
|--------|---------|
| `PrismaticModalities` | Main API facade for behavioral profiling and modality analysis |
| `PrismaticModalities.Application` | [OTP](/glossary/otp/) application entry point with supervision tree |
| `PrismaticModalities.Manager` | Central coordinator for cross-category behavioral analysis |
| `PrismaticModalities.Registry` | ETS-backed registry of all modality dimension definitions |
| `PrismaticModalities.ModalityBehaviour` | Behaviour protocol defining the contract for all modality dimensions |
| `PrismaticModalities.VerbalCommunication.*` | 15 dimensions including vocabulary complexity, speech patterns |
| `PrismaticModalities.NonverbalCommunication.*` | 16 dimensions including gesture frequency, eye contact, posture |
| `PrismaticModalities.EmotionalExpression.*` | 15 dimensions including affect labeling, emotional granularity |
| `PrismaticModalities.CognitiveExpression.*` | 16 dimensions including decision speed, hypothesis generation |
| `PrismaticModalities.SocialInteraction.*` | 15 dimensions including leadership style, conflict engagement |
| `PrismaticModalities.LearningKnowledge.*` | 16 dimensions including curiosity expression, teaching approach |
| `PrismaticModalities.CreativeExpressive.*` | 10 dimensions including creative risk-taking, synthesis creativity |
| `PrismaticModalities.AdaptationChange.*` | 13 dimensions including flexibility expression, innovation openness |

## Modality Categories

### Verbal Communication

The verbal communication category analyzes how entities express themselves through language. Dimensions include vocabulary complexity (measuring lexical diversity and sophistication), speech pattern analysis (identifying characteristic phrasing, hedging, and assertion patterns), and communication style profiling (distinguishing between directive, collaborative, analytical, and expressive communication modes). These measurements are derived from text-based communications, transcribed audio, and written documents.

### Nonverbal Communication

Nonverbal dimensions capture behavioral signals expressed through physical channels. The framework models 16 distinct dimensions including gesture frequency, eye contact duration, posture openness, facial muscle tension, micro-expression leakage, personal space management, mirroring behavior, touch behavior, fidgeting patterns, energy level display, smile frequency, submission indicators, dominance signaling, and defensive posturing. While direct physical observation is not always available in OSINT contexts, these dimensions become relevant when analyzing video intelligence, profile photographs, and public appearance recordings.

### Emotional Expression

Emotional expression dimensions quantify how entities display and manage emotional states. Key dimensions include emotional granularity (the precision with which emotions are differentiated), emotional authenticity (congruence between expressed and underlying affect), emotional recovery speed, empathic response style, mood persistence, emotional contagion susceptibility, and affect labeling patterns. These measurements feed into deception detection algorithms where incongruence between emotional expression modalities signals potential manipulation.

### Cognitive Expression

The cognitive expression category measures observable indicators of cognitive processes. Dimensions include decision speed, detail orientation, hypothesis generation, pattern recognition expression, problem decomposition, risk assessment verbalization, alternative consideration, confidence expression, logical chain presentation, and information-seeking behavior. These dimensions are particularly valuable for profiling decision-makers in corporate due diligence and assessing analytical capabilities of threat actors.

## Configuration

```elixir
config :prismatic_modalities,
  # Category activation
  active_categories: [
    :verbal_communication, :nonverbal_communication,
    :emotional_expression, :cognitive_expression,
    :social_interaction, :learning_knowledge,
    :creative_expressive, :adaptation_change
  ],

  # Scoring configuration
  normalization_range: {0.0, 1.0},
  confidence_threshold: 0.6,
  minimum_observations: 3,

  # Cross-category correlation
  correlation_engine: :weighted_fusion,
  anomaly_threshold: 2.5,

  # Registry
  hot_reload: true,
  telemetry_prefix: [:prismatic_modalities, :analysis]
```

## API Reference

```elixir
# Analyze behavioral modalities from communication data
{:ok, profile} = PrismaticModalities.analyze(%{
  text_samples: [email_1, email_2, email_3],
  context: %{entity_id: "person_123", interaction_type: :business}
})
# => %BehavioralProfile{
#      verbal: %{vocabulary_complexity: 0.78, ...},
#      cognitive: %{decision_speed: 0.65, detail_orientation: 0.91, ...},
#      confidence: 0.82
#    }

# Cross-modal entity resolution from separately processed inputs
{:ok, fingerprint} = PrismaticModalities.behavioral_fingerprint("person_123")
# => %Fingerprint{dimensions: 120, coverage: 0.67, signature: <<...>>}

# Compare behavioral profiles for entity matching
{:ok, similarity} = PrismaticModalities.compare_profiles(profile_a, profile_b)
# => %{similarity: 0.89, matching_dimensions: 87, divergent: [:decision_speed]}

# Detect behavioral anomalies against established baseline
{:ok, anomalies} = PrismaticModalities.detect_anomalies("person_123",
  baseline: :historical_average,
  threshold: 2.0)
# => %{anomalies: [{:emotional_authenticity, 0.23, :significant_drop}]}
```

## Testing

```bash
# Run all modality tests
cd apps/prismatic_modalities && mix test

# Run with coverage
mix test --cover

# Run specific category tests
mix test test/prismatic_modalities/cognitive_expression_test.exs

# Run behavioral fingerprint property tests
mix test test/prismatic_modalities/fingerprint_test.exs
```

Testing includes property-based tests (via StreamData) for dimension scoring normalization, unit tests for each modality dimension implementation, integration tests for cross-category correlation, and behavioral fingerprint comparison tests verifying similarity metrics satisfy the triangle inequality. The ModalityBehaviour compliance test suite validates that all 120+ dimensions correctly implement the required callbacks.

## Integration Points

| Integrates With | Purpose |
|----------------|---------|
| [Prismatic Tracking](/apps/prismatic-tracking/) | Behavioral modality snapshots enrich entity state with expression pattern intelligence |
| [Prismatic Storage KuzuDB](/apps/prismatic-storage-kuzudb/) | Behavioral trait vectors stored as node properties for graph similarity queries |
| [Prismatic Mycelial Nx](/apps/prismatic-mycelial-nx/) | Numerical feature extraction for embedding computation and similarity scoring |
| [Prismatic Storage Meilisearch](/apps/prismatic-storage-meilisearch/) | Full-text content from verbal modality analysis indexed for search |
| [Prismatic Manipulation](/apps/prismatic-manipulation/) | Behavioral baseline comparison for social engineering detection |
| [Prismatic OSINT Social Media](/apps/prismatic-osint-social-media/) | Social media content feeds verbal and cognitive expression analysis |

## NABLA Compliance

| NABLA Axiom | Enforcement | Implementation |
|-------------|------------|----------------|
| Signal Plurality | HARD -- behavioral conclusions require observations from multiple modality categories | Minimum 2 category coverage before profile generation |
| Contradiction Preservation | HARD -- conflicting behavioral signals across modalities preserved | Verbal confidence vs. nonverbal anxiety both surfaced |
| Provenance Mandatory | HARD -- every dimension score traceable to source observations | Observation timestamp, source type, and raw data reference per score |
| Time Decay | HARD -- behavioral observations carry temporal weight | Recent observations weighted higher; stale profiles flagged |
| Unknown Valid | SOFT -- incomplete modality coverage explicitly acknowledged | Coverage percentage reported with every behavioral fingerprint |

Behavioral intelligence is inherently probabilistic and context-dependent. The NABLA framework ensures that modality-derived conclusions are never presented with false certainty. When verbal communication patterns suggest confidence but nonverbal indicators suggest anxiety, both signals are preserved as a contradiction that enriches rather than degrades the intelligence picture.

## Performance

| Metric | Value | Notes |
|--------|-------|-------|
| Single dimension scoring | < 5ms | Per observation per dimension |
| Full behavioral profile | 50-200ms | All active categories from cached observations |
| Behavioral fingerprint generation | < 100ms | Aggregation across 120+ dimensions |
| Profile comparison | < 10ms | Cosine similarity across dimension vectors |
| Anomaly detection | < 50ms | Against cached baseline profile |
| Registry lookup | < 1ms | ETS-backed dimension definitions |

## Related Resources

- [Prismatic Mycelial Nx](/apps/prismatic-mycelial-nx/) -- Embedding computation and ML inference for behavioral feature vectors
- [Prismatic OSINT Core](/apps/prismatic-osint-core/) -- Source intelligence feeding modality processing pipelines
- [Prismatic Storage KuzuDB](/apps/prismatic-storage-kuzudb/) -- Cross-modal relationship graph storage for behavioral networks
- [Prismatic Storage Meilisearch](/apps/prismatic-storage-meilisearch/) -- Full-text search on extracted verbal communication content
- [Multi-Paradigm Solving](/capabilities/multi-paradigm-solving/) -- Combines behavioral psychology, NLP, and statistical profiling paradigms
- [Intelligence Synthesis](/capabilities/intelligence-synthesis/) -- Cross-modal entity resolution and behavioral intelligence fusion
- [NABLA Axioms](/capabilities/nabla-axioms/) -- Contradiction detection between modalities surfaced as intelligence findings

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)