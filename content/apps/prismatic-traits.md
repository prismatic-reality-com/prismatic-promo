+++
title = "Prismatic Traits"
weight = 52
[extra]
icon = "finger-print"
color = "indigo"
description = "Behavioral trait system for entity profiling and pattern recognition"
category = "Intelligence"
files = "130"
status = "Production"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1290
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Traits", "Behavioral", "apps", "Intelligence", "Prismatic Platform", "Trait", "Core"]
tags = ["apps", "intelligence", "prismatic-traits", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Traits - Prismatic Platform"
+++

## Overview

Prismatic Traits implements a comprehensive behavioral trait system built on [Elixir](/glossary/elixir/) [behaviours](/glossary/behaviour/) and [protocols](/glossary/protocol/). Rather than storing static attributes about entities, Traits computes dynamic behavioral fingerprints from observed data across multiple intelligence dimensions. Each entity receives scores along axes such as security posture, compliance responsiveness, risk appetite, and operational maturity, producing a multi-dimensional vector that enables comparison, clustering, and anomaly detection at scale.

The trait computation pipeline ingests evidence from across the platform -- [OSINT](/glossary/osint/) collections, security scans, compliance assessments, and historical observations -- and distills them into normalized trait scores with confidence weights. Traits evolve over time as new evidence arrives, with temporal decay ensuring that recent observations carry more weight than historical data. This evidence-based approach aligns with the platform's [NABLA epistemic framework](/glossary/nabla-infinity/), where every trait score maintains full provenance traceability.

The system serves as the foundation for entity intelligence throughout the Prismatic Platform. Downstream consumers such as [Prismatic Detection Engine](/apps/prismatic-detection-engine/) use trait vectors to establish behavioral baselines, while [Prismatic Perimeter Core](/apps/prismatic-perimeter-core/) leverages trait scores as inputs to [security rating](/glossary/security-rating/) algorithms.

## Architecture

```
Evidence Sources --> Trait Computation Pipeline --> Trait Store (ETS/Ecto)
      |                    |                          |
  OSINT Data         Score Normalization        Query Interface
  Scan Results       Confidence Weighting       Similarity Search
  Compliance Data    Temporal Decay             Clustering Engine
```

The architecture follows [OTP](/glossary/otp/) principles with dedicated [GenServer](/glossary/genserver/) processes managing trait computation queues and an [ETS](/glossary/ets/)-backed cache for high-throughput trait lookups. The computation pipeline uses [GenStage](/glossary/genstage/) for [backpressure](/glossary/backpressure/)-aware processing of large evidence batches.

## Trait Computation Pipeline

The trait computation pipeline transforms raw evidence from diverse platform sources into normalized trait scores through a multi-stage process. Understanding this pipeline is essential for interpreting trait scores and their confidence weights.

**Evidence Collection.** The first stage gathers evidence from all available sources for a given entity. For a domain entity, this might include Shodan scan results (open ports, services, TLS configuration), DNS records, certificate transparency logs, WHOIS data, and historical vulnerability scan results. The collection stage queries each source through the platform's OSINT adapter layer and assembles the raw evidence into a structured evidence set.

**Feature Extraction.** The second stage extracts trait-relevant features from the raw evidence. From Shodan data, it extracts features like "patch cadence" (estimated from service version dates), "TLS configuration strength" (cipher suite analysis), and "exposed service count." From DNS data, it extracts "DNSSEC adoption," "SPF/DKIM/DMARC configuration," and "DNS provider diversity." Each feature extraction function is a pure function that maps raw evidence to a numeric value with an associated confidence weight.

**Score Normalization.** The third stage normalizes extracted features into trait scores on a 0.0 to 1.0 scale. Normalization uses percentile ranking against a peer population -- an entity's "security posture" score of 0.78 means it ranks at the 78th percentile among entities of the same type. This relative scoring enables meaningful comparison across entities regardless of the absolute values of underlying features.

**Confidence Weighting.** Each trait score carries a confidence weight between 0.0 and 1.0 that reflects the quality and quantity of evidence supporting it. A trait computed from five independent sources with consistent results receives higher confidence than one computed from a single source. When evidence sources disagree, the confidence weight is reduced to reflect the uncertainty, following the NABLA Contradiction Preservation axiom.

**Temporal Decay.** Trait scores are time-weighted to ensure that recent evidence has more influence than historical observations. The decay function follows an exponential model with configurable half-life per trait dimension. Security posture traits have shorter half-lives (30 days) because security configurations change frequently, while compliance traits have longer half-lives (180 days) because compliance postures evolve slowly.

## Key Features

### Trait Computation
- Multi-dimensional entity profiling across 12+ trait axes
- Evidence-based trait scoring with confidence weights
- Temporal trait evolution tracking with configurable decay rates
- Confidence-weighted trait assignment following [NABLA axioms](/capabilities/nabla-axioms/)

### Trait Catalog

The platform defines the following standard trait dimensions:

| Trait Dimension | Evidence Sources | Half-Life |
|----------------|-----------------|-----------|
| Security Posture | Scan results, vulnerability data, TLS config | 30 days |
| Patch Cadence | Service version dates, CVE response times | 45 days |
| Configuration Hardening | Server headers, security controls, DNSSEC | 60 days |
| Compliance Responsiveness | Assessment results, remediation speed | 180 days |
| Compliance Completeness | Control coverage, documentation quality | 180 days |
| Risk Appetite | Technology choices, exposure tolerance | 90 days |
| Operational Maturity | Uptime, change frequency, incident response | 120 days |
| Infrastructure Diversity | Provider diversity, geographic distribution | 90 days |
| Communication Security | Email authentication, encryption adoption | 60 days |
| Third-Party Risk | Supply chain exposure, vendor diversity | 120 days |
| Transparency | Public disclosure practices, reporting quality | 180 days |
| Digital Footprint | Online presence breadth, consistency | 90 days |

### Analysis Capabilities
- Entity similarity comparison via cosine distance on trait vectors
- Peer group identification and industry benchmarking
- Trait-based anomaly detection for behavioral drift alerts
- Predictive trait trajectory modeling using historical trends

## Similarity and Clustering

The trait vector representation enables powerful analytical capabilities through vector space operations. Each entity's trait profile is a point in a multi-dimensional space, and the distance between points quantifies behavioral similarity.

**Cosine similarity** measures the angular distance between trait vectors, providing a scale-invariant similarity metric. Two entities with similar security postures and compliance behaviors will have high cosine similarity regardless of their absolute scores. This metric powers the peer discovery function, which identifies entities with behavioral profiles most similar to a given target.

**Clustering** groups entities with similar behavioral profiles into natural clusters using k-means or DBSCAN algorithms. These clusters often correspond to meaningful categories -- well-managed enterprises, neglected infrastructure, newly deployed systems -- that emerge from the data without requiring manual categorization. Cluster membership provides context for individual entity analysis: an entity that changes clusters may be undergoing significant operational changes.

**Anomaly detection** identifies entities whose trait profiles deviate significantly from their historical patterns or their peer group. A sudden drop in security posture for an entity that has historically maintained high scores triggers an anomaly alert, as does a gradual drift in compliance responsiveness across multiple assessment cycles.

## Usage

```elixir
# Compute entity traits from all available evidence
{:ok, traits} = PrismaticTraits.compute("example.com")
# => %{security_posture: 0.78, compliance: 0.82, risk_appetite: 0.45, ...}

# Compare two entities across all trait dimensions
{:ok, similarity} = PrismaticTraits.compare("entity_a.com", "entity_b.com")
# => %{score: 0.91, divergent_traits: [:risk_appetite], aligned_traits: [...]}

# Find peer entities with similar behavioral profiles
{:ok, peers} = PrismaticTraits.find_peers("example.com", threshold: 0.8)
# => [%{entity: "similar.org", similarity: 0.87}, ...]

# Track trait evolution over time
{:ok, history} = PrismaticTraits.history("example.com", window: :last_90_days)
```

## Testing

```bash
mix test apps/prismatic_traits/test
mix test apps/prismatic_traits/test --cover
```

| Test Category | Tests | What It Verifies |
|--------------|-------|------------------|
| Computation Pipeline | 12 | Feature extraction, normalization, weighting |
| Temporal Decay | 6 | Decay function accuracy, half-life configuration |
| Similarity | 8 | Cosine distance, peer discovery, threshold filtering |
| Clustering | 6 | Cluster formation, membership stability, anomaly flagging |
| Confidence | 8 | Multi-source weighting, contradiction handling |

## Integration Points

- **[Prismatic Detection Engine](/apps/prismatic-detection-engine/)** -- Trait vectors establish behavioral baselines for anomaly detection
- **[Prismatic Perimeter Core](/apps/prismatic-perimeter-core/)** -- Trait scores feed into security rating computation
- **[Prismatic Signals](/apps/prismatic-signals/)** -- Trait changes emit signals for down[stream processing](/glossary/stream-processing/)
- **[Prismatic Storage Core](/apps/prismatic-storage-core/)** -- Trait data persisted through the unified storage adapter protocol

## NABLA Compliance

Every trait score maintains full provenance traceability through the evidence chain, satisfying the Provenance Mandatory axiom. The confidence weighting system implements Signal Plurality by computing independent scores from multiple sources and combining them with explicit uncertainty. The Contradiction Preservation axiom is satisfied by reducing confidence weights rather than resolving contradictory evidence -- when Shodan and Censys report different service configurations for the same entity, both observations are preserved and the confidence weight is reduced to reflect the disagreement. Temporal decay implements the Time Decay axiom at the entity intelligence level, ensuring that stale evidence gradually loses influence over trait scores.

## Performance

| Metric | Value |
|--------|-------|
| Trait computation | 100-500ms per entity (depending on source count) |
| Trait lookup (cached) | Microseconds (ETS) |
| Similarity comparison | Sub-millisecond |
| Peer discovery | Low milliseconds (for 10K entity populations) |
| Clustering | Seconds (for 10K entity populations) |

## Related Components

- [Prismatic OSINT Core](/apps/prismatic-osint-core/) -- Primary evidence source for trait computation
- [Prismatic Algorithms](/apps/prismatic-algorithms/) -- Mathematical foundations for similarity and clustering
- [Prismatic Quality Intelligence](/apps/prismatic-quality-intelligence/) -- Applies similar trait-based profiling to code quality

## Related Agents

- [Evolution Analyzer Specialist](/agents/evolution-analyzer-specialist/) -- Analyzes trait evolution patterns over time to identify behavioral drift and trend shifts
- [Cross-Pollination Specialist](/agents/cross-pollination-specialist/) -- Transfers trait computation techniques across security, compliance, and operational intelligence domains
- [Elixir Architect](/agents/elixir-architect/) -- Designs the OTP process topology for GenStage-based trait computation pipelines and ETS-backed caching

## Related Capabilities

- [NABLA Axioms](/capabilities/nabla-axioms/) -- Every trait score maintains full provenance traceability with confidence weights per epistemic axioms
- [Intelligence Synthesis](/capabilities/intelligence-synthesis/) -- Multi-dimensional evidence fusion from OSINT, scans, and compliance data into normalized trait vectors
- [Quality Gates](/capabilities/quality-gates/) -- Trait computation validation ensuring scores are bounded, confidence-weighted, and temporally decayed

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)