+++
title = "primary-identity-verification-commander"
weight = 309
[extra]
domain = "primary"
level = "L3"
description = "Specialized intelligence gathering and analysis"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["aiad", "seadf", "mycelial-network", "otp", "no-doubts", "telemetry", "osint", "no-mercy"]
domain_normalized = "primary"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2100
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["primary-identity-verification-commander", "Specialized", "agents", "agent", "Prismatic Platform", "Stage", "Multi", "Strategic Command"]
tags = ["agents", "agent", "primary-identity-verification-commander", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "primary-identity-verification-commander - Prismatic Platform"
+++

## Overview

The primary-identity-verification-commander operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform's primary intelligence domain, serving as the central authority for entity id[entity resolution](@/glossary/entity-resolution.md) and verification operations. This agent orchestrates the process of confirming that a claimed identity corresponds to a real-world entity, cross-referencing multiple independent data sources to establish identity with quantified confidence. Identity verification is foundational to all downstream intelligence operations -- without confirmed identity, analysis built on assumed entity associations carries unacceptable epistemic risk.

Governed by the [AIAD](@/glossary/aiad.md) standard and the [NO DOUBTS](@/glossary/no-doubts.md) principle, this agent enforces strict multi-source identity corroboration. The [NABLA Infinity](@/glossary/nabla-infinity.md) [signal plurality](@/glossary/signal-plurality.md) axiom is applied at its most rigorous: identity claims require a minimum of three independent source verifications before reaching confirmed status. The agent maintains explicit confidence scores for every identity resolution, distinguishing between confirmed, probable, possible, and unverified identity states.

## Operational Domain

The identity verification domain covers individual, organizational, and institutional entity verification across jurisdictions. The agent accesses public registries, commercial databases, social platform profiles, and domain registration records through the platform's [OSINT](@/glossary/osint.md) infrastructure. Entity resolution handles challenges including name variations, transliteration differences, organizational restructuring, and deliberate identity obfuscation. All verification results are stored in [KuzuDB](@/glossary/kuzudb.md) graph structures for relationship-aware identity queries.

## Key Capabilities

- **Multi-source identity corroboration** -- Cross-references identity claims against public registries, commercial databases, social profiles, and domain records, requiring three or more independent confirmations for verified status
- **Entity resolution** -- Resolves ambiguous identity references by analyzing name variations, associated addresses, organizational affiliations, and temporal activity patterns to distinguish between distinct entities sharing similar identifiers
- **Confidence-scored verification** -- Produces identity verification results with explicit four-tier confidence classifications (confirmed, probable, possible, unverified) backed by traceable evidence chains
- **Identity change tracking** -- Monitors verified entities for identity-relevant changes including name changes, corporate restructuring, and merger events that affect established identity associations
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with self-directed verification workflows triggered by downstream intelligence requests
- **[Telemetry integration](@/capabilities/telemetry-integration.md)** for verification pipeline latency and confidence distribution monitoring

## Authority Level

**L3** - Strategic Command - Multi-domain coordination with authority to block downstream intelligence operations that depend on unverified identity assumptions.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/identity verify` | Initiate identity verification for a specified entity | L3+ |
| `/identity status` | Check verification status and confidence for a known entity | L3+ |
| `/identity resolve` | Attempt entity resolution for ambiguous identity references | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [linkedin-intelligence-specialist](@/agents/linkedin-intelligence-specialist.md) | Provides professional identity signals for corroboration |
| [political-network-intelligence-specialist](@/agents/political-network-intelligence-specialist.md) | Consumes verified entity identities for network construction |
| [risk-assessment-commander](@/agents/risk-assessment-commander.md) | Verified identities required before risk assessment initiation |

## Verification Pipeline Architecture

The identity verification pipeline implements a multi-stage process that progressively increases confidence through independent source corroboration.

**Stage 1: Initial Claim Assessment** receives an identity claim (name, organization, identifier) and performs initial validation against known entity registries. This stage filters out obviously invalid claims (non-existent registration numbers, impossible name-jurisdiction combinations) and establishes the initial search parameters for corroboration.

**Stage 2: Multi-Source Collection** queries multiple independent data sources in parallel to gather corroborating evidence. For individual entities, sources include public registries, professional directories, social platform profiles, and domain registration records. For organizational entities, sources include company registries, tax databases, regulatory filings, and industry association memberships. Each source response is timestamped and tagged with source reliability classification.

**Stage 3: Cross-Reference Analysis** compares evidence collected from independent sources, identifying consistent and inconsistent signals. Consistent signals across independent sources increase confidence. Inconsistent signals trigger further investigation rather than automatic rejection -- the [NABLA Infinity](@/glossary/nabla-infinity.md) contradiction preservation axiom ensures that conflicting evidence is preserved and analyzed rather than discarded.

**Stage 4: Confidence Scoring** aggregates evidence into a quantified confidence classification using a weighted scoring model that accounts for source reliability, evidence recency, and cross-source consistency.

```elixir
defmodule Prismatic.Identity.VerificationPipeline do
  @moduledoc """
  Multi-stage identity verification pipeline with confidence
  scoring and NABLA Infinity compliance.
  """

  alias Prismatic.Identity.{SourceCollector, CrossReferencer, ConfidenceScorer}

  @type verification_result :: %{
    entity_id: String.t(),
    claimed_identity: map(),
    confidence: :confirmed | :probable | :possible | :unverified,
    score: float(),
    sources: [source_evidence()],
    contradictions: [contradiction()]
  }

  @spec verify(map()) :: {:ok, verification_result()} | {:error, term()}
  def verify(identity_claim) do
    with {:ok, validated} <- assess_initial_claim(identity_claim),
         {:ok, evidence} <- SourceCollector.collect_parallel(validated),
         {:ok, analysis} <- CrossReferencer.analyze(evidence),
         {:ok, scored} <- ConfidenceScorer.score(analysis) do
      {:ok, %{
        entity_id: generate_entity_id(identity_claim),
        claimed_identity: identity_claim,
        confidence: classify_confidence(scored.score),
        score: scored.score,
        sources: scored.evidence_chain,
        contradictions: analysis.contradictions
      }}
    end
  end

  defp classify_confidence(score) when score >= 0.95, do: :confirmed
  defp classify_confidence(score) when score >= 0.75, do: :probable
  defp classify_confidence(score) when score >= 0.50, do: :possible
  defp classify_confidence(_score), do: :unverified
end
```

## Confidence Classification Framework

| Level | Score Range | Source Requirements | Downstream Usage |
|-------|-----------|-------------------|-----------------|
| **Confirmed** | >= 0.95 | 3+ independent sources, all consistent | Full analytical operations permitted |
| **Probable** | 0.75 - 0.94 | 2+ independent sources, majority consistent | Analysis permitted with confidence annotation |
| **Possible** | 0.50 - 0.74 | 1-2 sources with partial corroboration | Flagged for additional verification |
| **Unverified** | < 0.50 | Insufficient or contradictory evidence | Blocked from downstream consumption |

## Entity Resolution Challenges

Identity verification faces several systematic challenges that the agent addresses through specialized resolution techniques.

**Name Variation** handles the fact that entities may appear under different name forms across sources -- abbreviated names, transliterated names, maiden names, corporate name changes, and trading names. The agent maintains alias databases and applies phonetic matching, transliteration rules, and fuzzy string comparison to identify potential matches across name variants.

**Jurisdictional Differences** account for varying registration standards, identifier formats, and public disclosure requirements across different legal jurisdictions. An entity registered in multiple jurisdictions may have different identifiers, different registered names, and different publicly available information in each jurisdiction. The agent maintains jurisdiction-specific verification procedures that account for these differences.

**Temporal Identity Changes** track entities through corporate restructuring events (mergers, acquisitions, spin-offs, name changes) that create discontinuities in identity records. The agent maintains temporal identity chains that link current identities to their historical predecessors, ensuring that entity resolution remains valid across time.

## Integration Architecture

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Runtime execution and lifecycle management |
| Prismatic Telemetry | Verification pipeline latency and confidence distribution [metrics](@/glossary/metrics.md) |
| [AIAD](@/glossary/aiad.md) [Registry](@/glossary/registry-otp.md) | Agent specification and identity service discovery |
| [KuzuDB](@/glossary/kuzudb.md) | Graph-based entity storage with relationship-aware queries |
| [SEADF](@/glossary/seadf.md) Pipeline | Verification accuracy assessment within evolution workflows |

## Enforcement

Identity verification follows the strictest [NO MERCY](@/glossary/no-mercy.md) enforcement. No downstream agent may consume identity data that has not reached at least "probable" confidence through multi-source corroboration. The agent enforces [Trinity Gate](@/glossary/trinity-gate.md) validation on all identity claims, and the [time decay](@/glossary/time-decay.md) axiom ensures that verification currency is maintained through periodic re-verification cycles. Confirmed entities are re-verified quarterly, probable entities monthly, and possible entities are subject to continuous verification attempts until they either reach probable confidence or are reclassified as unverifiable.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)