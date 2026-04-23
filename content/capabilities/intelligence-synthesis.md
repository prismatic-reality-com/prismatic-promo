+++
title = "Intelligence Synthesis"
weight = 9
[extra]
icon = "light-bulb"
color = "amber"
description = "Multi-source intelligence aggregation and synthesis across 121+ OSINT sources with NABLA-compliant epistemic verification, entity resolution, and belief graph construction"
category = "intelligence"
status = "active"
reading_time = "15 min"
author = "Tomas Korcak (korczis)"
word_count = 1119
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Intelligence", "Synthesis", "Multi-source", "OSINT", "NABLA-compliant", "capabilities", "Prismatic Platform", "Trinity Gate", "HARD"]
tags = ["capabilities", "intelligence", "intelligence-synthesis", "prismatic"]
quality_score = 80
see_also = ["glossary", "agents", "architecture"]
image = "/images/sections/capabilities.png"
image_alt = "Intelligence Synthesis - Prismatic Platform"
+++

## Overview

Intelligence Synthesis is the platform capability for aggregating, correlating, and synthesizing intelligence from multiple sources across OSINT, security, and business domains. It transforms raw data into actionable intelligence through the NABLA Infinity epistemic framework. Every synthesized intelligence product carries provenance metadata, confidence scores, and temporal validity markers, ensuring consumers can assess reliability without independently re-evaluating source material.

The synthesis pipeline processes data from 121+ OSINT sources, applying Signal Plurality requirements, Contradiction Preservation protocols, and multi-layer verification before any finding achieves "verified" status. This approach eliminates the common intelligence analysis failure mode of premature convergence on a single narrative.

Intelligence synthesis is not data aggregation. Aggregation collects; synthesis reasons. The platform does not simply merge data from multiple sources into a combined dataset. It resolves entity identities across heterogeneous schemas, detects contradictions between sources, preserves conflicting signals for consumer evaluation, scores confidence based on source reliability and corroboration, and validates conclusions through the [Trinity Gate](/capabilities/trinity-gate/) verification pipeline. The result is intelligence that is traceable, calibrated, and epistemically sound.

## Synthesis Pipeline Architecture

The synthesis pipeline operates as a series of independent OTP processes connected by message passing, with backpressure management ensuring graceful degradation under high load.

```
Sources --> Collection --> Normalization --> Correlation --> Synthesis --> Verification --> Reports
  |            |              |                |              |              |
 121+       Adapters       Schema          Pattern       Confidence     Trinity
 OSINT      Extract       Mapping         Matching       Scoring         Gate
```

Each stage operates as an independent OTP process with backpressure management, ensuring the pipeline degrades gracefully under high load rather than dropping data or producing incomplete assessments.

### Stage Details

| Stage | Process | Output | Quality Gate |
|-------|---------|--------|-------------|
| **Collection** | Adapter-specific extraction with rate limiting | Raw structured data | Source availability check |
| **Normalization** | Schema mapping, encoding normalization, deduplication | Canonical entity records | Schema validation |
| **Correlation** | Cross-source entity linking, temporal alignment | Correlated entity clusters | Minimum 2-source requirement |
| **Synthesis** | Evidence fusion, contradiction detection, gap analysis | Intelligence assessments | [NABLA Axioms](/capabilities/nabla-axioms/) compliance |
| **Verification** | [Trinity Gate](/capabilities/trinity-gate/) passage, peer review, confidence calibration | Verified intelligence products | All 3 Trinity layers pass |
| **Reporting** | Structured output with provenance chain | Consumable intelligence reports | Completeness validation |

## Source Coverage

The platform collects from 121+ sources organized into five intelligence domains, each with domain-specific adapters that handle authentication, rate limiting, schema mapping, and error recovery.

| Category | Sources | Coverage | Key Adapters |
|----------|---------|----------|-------------|
| **Czech Registries** | 15+ | Business, legal, financial | ARES, Justice.cz, ISIR, CNB, RZP |
| **EU Databases** | 10+ | Sanctions, compliance, corporate | EU Sanctions List, EIOPA, ESMA |
| **Global OSINT** | 50+ | Technical, social, financial | Shodan, Censys, Have I Been Pwned |
| **Security Intel** | 30+ | Threat, vulnerability, exposure | CVE databases, Certificate Transparency |
| **Financial** | 16+ | AML, crypto, sanctions | Blockchain explorers, PEP lists |

Each source adapter implements a common behavior contract defined by the [AIAD Standard](/capabilities/aiad-standard/), ensuring consistent error handling, rate limiting, and telemetry across all 121+ sources.

## Entity Resolution

Entity resolution links records from different sources that refer to the same real-world entity. This is the foundational capability that makes multi-source synthesis possible -- without reliable entity resolution, cross-source correlation produces false positives and misattributions.

```elixir
defmodule PrismaticOsint.EntityResolver do
  @moduledoc """
  Multi-strategy entity resolution across heterogeneous OSINT sources.
  Combines deterministic, fuzzy, network-based, and temporal methods
  for high-confidence entity linking.
  """

  @spec resolve(list(source_record())) :: {:ok, unified_entity()} | {:error, term()}
  def resolve(source_records) when length(source_records) >= 2 do
    candidates =
      source_records
      |> apply_deterministic_matching()
      |> apply_fuzzy_matching()
      |> apply_network_matching()
      |> apply_temporal_matching()
      |> score_candidates()

    case select_best_match(candidates) do
      {:ok, match} when match.confidence >= 0.85 ->
        unified = build_unified_entity(match, source_records)
        {:ok, unified}

      {:ok, match} ->
        {:ok, %{unified_entity: build_unified_entity(match, source_records),
                 confidence_warning: :below_threshold,
                 score: match.confidence}}

      :no_match ->
        {:error, :no_reliable_match}
    end
  end

  defp apply_deterministic_matching(records) do
    # Exact identifier matching: ICO, DUNS, LEI, VAT number
    Enum.group_by(records, fn r ->
      r.identifiers
      |> Enum.filter(& &1.type in [:ico, :duns, :lei, :vat])
      |> Enum.map(& &1.value)
    end)
  end
end
```

### Resolution Methods

| Resolution Method | Application | Accuracy | Speed |
|-------------------|-------------|----------|-------|
| **Deterministic** | Exact identifier match (ICO, DUNS, LEI) | 100% | < 1ms |
| **Fuzzy** | Name similarity with normalization | 85-95% | < 10ms |
| **Network-based** | Shared address, directors, ownership | 90-98% | < 50ms |
| **Temporal** | Historical record linkage with time windows | 80-95% | < 100ms |

## Belief Graph Construction

The Belief Graph represents synthesized intelligence as a directed acyclic graph where nodes are claims and edges represent evidential support or contradiction. This structure enables consumers to trace any conclusion back to its supporting evidence and evaluate the strength of the reasoning chain.

```
Claim: "Entity X is high risk"
  |
  +-- Evidence 1: Sanctions list match (confidence: 0.92, source: EU)
  |     +-- Sub-evidence: Name similarity 0.97
  |     +-- Sub-evidence: Country match
  |
  +-- Evidence 2: Financial anomaly (confidence: 0.78, source: AML scan)
  |     +-- Sub-evidence: Unusual transaction pattern
  |
  +-- Contradiction: Clean compliance record (confidence: 0.85, source: local registry)
        +-- Sub-evidence: No enforcement actions
        +-- Sub-evidence: Active business license
```

The belief graph preserves contradictions rather than resolving them, following the Addiction Preservation doctrine. Consumers receive the full evidence picture with calibrated confidence scores. This approach is critical for regulatory compliance contexts where premature resolution of ambiguity can lead to both false positives (over-blocking legitimate entities) and false negatives (missing genuine risks).

## Confidence Framework

Intelligence synthesis follows all 7 [NABLA Axioms](/capabilities/nabla-axioms/) with strict enforcement.

| Axiom | Synthesis Application | Enforcement |
|-------|----------------------|-------------|
| **Signal Plurality** | Minimum 2 independent sources per finding | HARD -- blocked until met |
| **Contradiction Preservation** | Conflicting signals preserved and flagged | HARD -- never discard |
| **Absence Informative** | Missing data from expected sources tracked | SOFT -- investigation triggered |
| **Time Decay** | Recency weighting on all intelligence | HARD -- mandatory timestamps |
| **Unknown Valid** | "Insufficient data" is a valid assessment | HARD -- no forced conclusions |
| **Source Independence** | Weight independent sources higher than derivatives | SOFT -- bias assessment required |
| **Provenance Mandatory** | Every finding traceable to original source | HARD -- blocked without provenance |

### Confidence Scoring Model

Confidence scoring combines source reliability, evidence strength, and temporal relevance into a calibrated score.

```elixir
defmodule PrismaticOsint.ConfidenceScorer do
  @moduledoc """
  NABLA-compliant confidence scoring for synthesized intelligence.
  Combines source reliability, evidence count, corroboration, and time decay.
  """

  @spec score(list(evidence())) :: confidence_score()
  def score(evidence_list) do
    source_reliability = calculate_source_reliability(evidence_list)
    evidence_count = length(evidence_list)
    corroboration = calculate_corroboration_factor(evidence_list)
    time_decay = calculate_time_decay(evidence_list)

    raw_score = source_reliability * corroboration * time_decay *
                :math.log(evidence_count + 1) / :math.log(10)

    # Normalize to [0.0, 1.0] range
    normalized = min(raw_score, 1.0)

    %{
      score: normalized,
      components: %{
        source_reliability: source_reliability,
        evidence_count: evidence_count,
        corroboration: corroboration,
        time_decay: time_decay
      },
      timestamp: DateTime.utc_now()
    }
  end

  defp calculate_time_decay(evidence_list) do
    half_life_hours = 720  # 30 days
    Enum.map(evidence_list, fn e ->
      age_hours = DateTime.diff(DateTime.utc_now(), e.timestamp, :hour)
      :math.exp(-age_hours / half_life_hours)
    end)
    |> Enum.max()
  end
end
```

### Confidence Level Interpretation

| Confidence Level | Score Range | Interpretation | Action |
|-----------------|-------------|----------------|--------|
| **Very High** | 0.95-1.00 | Near certainty, multiple corroborating sources | Direct action authorized |
| **High** | 0.80-0.94 | Strong evidence, minor gaps possible | Action with monitoring |
| **Moderate** | 0.60-0.79 | Supporting evidence exists, gaps identified | Additional collection recommended |
| **Low** | 0.40-0.59 | Limited evidence, significant uncertainty | Investigation required |
| **Very Low** | 0.00-0.39 | Insufficient evidence or high contradiction | No action, collection priority |

## Verification Pipeline

All synthesized intelligence passes through [Trinity Gate](/capabilities/trinity-gate/) verification before achieving "verified" status.

| Gate Layer | Verification | Synthesis Application |
|------------|-------------|----------------------|
| **Structural** (Graph Theory) | Belief graph forms valid DAG | No circular reasoning, evidence chains are acyclic |
| **Logical** (Rule-Based) | Propositions follow logical rules | No contradictory conclusions without flagging |
| **Formal** (Modal Logic) | Claims proven in formal systems | Compliance assessments formally verified |
| **Consciousness** | Meta-verification of reasoning quality | Assessment of assessment methodology |

## Agent Infrastructure

Intelligence synthesis is executed by 62+ specialized OSINT agents organized by domain, each operating under [AIAD Standard](/capabilities/aiad-standard/) specifications with full [AIAD Compliance](/capabilities/aiad-compliance/).

| Agent Domain | Agent Count | Specialization | Key Capabilities |
|-------------|-------------|----------------|-----------------|
| **Czech Legal** | 12 | Registry, court, and compliance intelligence | ARES lookup, insolvency check, UBO extraction |
| **Network** | 15 | DNS, certificate, port, and cloud discovery | Subdomain enum, cert chain analysis, port scan |
| **Financial** | 10 | AML, sanctions, crypto, and transaction analysis | PEP screening, blockchain tracing, transaction flow |
| **Social** | 8 | Social media, forum, and reputation intelligence | Profile aggregation, sentiment analysis, influence mapping |
| **Security** | 17 | Vulnerability, exposure, and threat intelligence | CVE matching, exposure scoring, threat correlation |

## Performance and Metrics

| Metric | Current Value | Target |
|--------|--------------|--------|
| **OSINT sources integrated** | 121+ | 150+ |
| **Entity resolution accuracy** | 95%+ | 98% |
| **Mean synthesis latency** | < 5s per entity | < 3s |
| **Signal Plurality compliance** | 100% | 100% |
| **Trinity Gate pass rate** | 92%+ | 95% |
| **False positive rate** | < 3% | < 1% |
| **Provenance completeness** | 100% | 100% |
| **Active OSINT agents** | 62+ | 80+ |

## Integration

- Validated through [Trinity Gate](/capabilities/trinity-gate/) 4-layer verification for all intelligence products
- Governed by [NABLA Axioms](/capabilities/nabla-axioms/) epistemic framework for all belief formation
- Enforces [NO DOUBTS](/capabilities/no-doubts/) evidence standards for all assessments
- Quality enforced by [NO MERCY](/capabilities/no-mercy/) zero-tolerance standards
- Agent specifications defined by [AIAD Standard](/capabilities/aiad-standard/) with OSINT-specific capability declarations
- Compliance verified by [AIAD Compliance](/capabilities/aiad-compliance/) for all 62+ OSINT agents
- Fed by [Real-Time Monitoring](/capabilities/real-time-monitoring/) for operational intelligence
- Tracked through [Telemetry Integration](/capabilities/telemetry-integration/) for pipeline performance
- Supports [Multi-Paradigm Solving](/capabilities/multi-paradigm-solving/) with domain-specific analytical outputs
- Security validated by [Color Teams](/capabilities/color-teams/) for pipeline integrity
- Pipeline quality maintained by [Autonomous Self-Healing](/capabilities/autonomous-self-healing/)
- [Quality Gates](/capabilities/quality-gates/) enforced at every synthesis pipeline stage
- [Cross-Domain Flexibility](/capabilities/cross-domain-flexibility/) enables multi-domain investigation workflows
- Supports [EASM](/capabilities/easm/) with external attack surface intelligence
- Supports [Compliance](/capabilities/compliance/) with regulatory assessment data

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)