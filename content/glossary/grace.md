+++
title = "GRACE"
description = "An intelligence analysis framework (Gather, Relate, Analyze, Conclude, Evaluate) used in OSINT investigations to structure the progression from raw data to actionable intelligence."
weight = 50

[extra]
category = "osint"
tags = ["grace", "framework", "intelligence-analysis", "osint", "methodology", "gather", "relate", "analyze", "conclude", "evaluate"]
date_created = "2026-02-23"
date_updated = "2026-02-23"
difficulty = "intermediate"
audience = ["osint-analysts", "security-engineers", "investigators", "intelligence-professionals"]
related_terms = ["osint", "intelligence-cycle", "epistemic-confidence", "signal-plurality", "respect-framework", "hunter-framework"]
key_concepts = ["structured-analysis", "data-gathering", "relationship-mapping", "hypothesis-testing", "confidence-assessment"]
platforms = ["prismatic-osint", "prismatic-academy", "beam"]
prerequisites = ["osint-fundamentals", "critical-thinking", "analytical-methods"]
use_cases = ["osint-investigation", "threat-analysis", "due-diligence", "entity-resolution", "intelligence-production"]
complexity = "medium"
stability = "mature"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1100
date_modified = "2026-02-23"
keywords = ["GRACE", "intelligence analysis", "OSINT", "framework", "glossary", "Prismatic Platform"]
quality_score = 82
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "GRACE - Prismatic Platform"
+++

## Definition and Overview

GRACE is a structured intelligence analysis framework that guides analysts through five phases of investigation: Gather (collecting raw data from multiple sources), Relate (establishing connections between data points), Analyze (applying analytical techniques to derive meaning), Conclude (forming evidence-based assessments with confidence levels), and Evaluate (reviewing the quality and validity of conclusions). The framework is taught in the Prismatic Academy's OSINTSignalSynthesis topic and implemented in the platform's OSINT investigation workflows.

The framework addresses a fundamental challenge in intelligence analysis: the gap between data collection and actionable intelligence. Collecting vast amounts of raw OSINT data is relatively straightforward with modern tools. The difficult part is transforming that data into reliable intelligence -- distinguishing signal from noise, identifying meaningful patterns, assessing confidence levels, and producing conclusions that decision-makers can act upon. GRACE provides a structured methodology that prevents common analytical pitfalls such as confirmation bias, premature conclusion, and overconfidence.

Each GRACE phase builds upon the previous, creating a logical progression from uncertainty to assessed confidence. The framework integrates with the NABLA Infinity epistemic framework by requiring explicit confidence scoring at the Conclude phase and structured review at the Evaluate phase. This integration ensures that GRACE-produced intelligence meets the platform's epistemic standards, with claims supported by traceable evidence and assessed at appropriate confidence levels.

## Technical Deep Dive

### GRACE Phase Breakdown

| Phase | Purpose | Inputs | Outputs | Tools |
|-------|---------|--------|---------|-------|
| **Gather** | Collect raw data from multiple sources | Investigation requirements | Raw data corpus | OSINT tools, web scrapers, API queries |
| **Relate** | Map connections between data points | Raw data corpus | Relationship graph | Entity resolution, link analysis, timeline |
| **Analyze** | Apply techniques to derive meaning | Relationship graph | Hypotheses with evidence | ACH, pattern analysis, statistical methods |
| **Conclude** | Form assessed judgments | Hypotheses + evidence | Intelligence assessments | Confidence scoring, NABLA axioms |
| **Evaluate** | Review quality and validity | Intelligence assessments | Validated conclusions | Peer review, methodology audit |

### Phase 1: Gather -- Data Collection

| Source Type | Examples | Quality Indicators |
|-------------|---------|-------------------|
| **Open Records** | Company registries, court records, property records | High reliability, structured data |
| **Social Media** | LinkedIn, Facebook, Twitter/X posts | Medium reliability, unverified claims |
| **Technical** | DNS records, WHOIS, IP ranges, SSL certificates | High reliability, machine-generated |
| **News/Media** | News articles, press releases, interviews | Variable reliability, editorial bias |
| **Financial** | Annual reports, financial filings, sanctions lists | High reliability, audited data |
| **Dark Web** | Paste sites, forums, markets | Low reliability, high intelligence value |

### Phase 2: Relate -- Relationship Mapping

```
Entity Relationship Types:
  PERSON -[:DIRECTS]-> COMPANY
  PERSON -[:OWNS]-> COMPANY (with ownership_pct)
  COMPANY -[:SUPPLIES]-> COMPANY
  COMPANY -[:REGISTERED_AT]-> ADDRESS
  PERSON -[:RELATED_TO]-> PERSON (family, business)
  IP_ADDRESS -[:HOSTS]-> DOMAIN
  DOMAIN -[:REGISTERED_BY]-> PERSON/COMPANY
```

### Phase 3: Analyze -- Analytical Techniques

| Technique | Description | Best For |
|-----------|-------------|----------|
| **ACH** (Analysis of Competing Hypotheses) | Evaluate evidence against multiple hypotheses | Attribution, motive analysis |
| **Timeline Analysis** | Chronological ordering of events | Sequence of actions, pattern detection |
| **Network Analysis** | Graph-based relationship analysis | Influence mapping, key node identification |
| **Pattern of Life** | Behavioral routine identification | Target profiling, anomaly detection |
| **Financial Flow** | Money movement tracing | Fraud detection, sanctions evasion |
| **SWOT Analysis** | Strengths/Weaknesses/Opportunities/Threats | Strategic assessment |

### Phase 4: Conclude -- Confidence Assessment

| Confidence Level | Description | Language | NABLA Threshold |
|-----------------|-------------|----------|----------------|
| **Near certainty** | 95-99% | "We assess with high confidence..." | >= 0.95 |
| **Highly likely** | 80-95% | "We assess it highly likely..." | >= 0.80 |
| **Likely** | 55-80% | "We assess it likely..." | >= 0.60 |
| **Roughly even** | 45-55% | "The evidence is inconclusive..." | >= 0.50 |
| **Unlikely** | 20-45% | "We assess it unlikely..." | >= 0.30 |
| **Remote** | 5-20% | "We assess it remote..." | >= 0.10 |

## Architecture and Implementation

The GRACE framework is implemented in the Prismatic Platform as a structured workflow that guides analysts through each phase, tracks evidence and conclusions, and enforces epistemic standards. The implementation uses a case-based approach where each investigation is represented as a case object containing data gathered, relationships mapped, analyses performed, conclusions drawn, and evaluation results.

Each phase has defined inputs, outputs, and quality gates. The Gather phase requires minimum source diversity (at least 2 independent source types per key claim). The Relate phase requires entity resolution with confidence scores. The Analyze phase requires at least one structured analytical technique (not just intuition). The Conclude phase requires explicit confidence levels aligned with NABLA thresholds. The Evaluate phase requires peer review or automated quality checks.

## Usage in Prismatic Platform

The Prismatic Academy's OSINTSignalSynthesis topic teaches the GRACE framework with interactive exercises. The OSINT toolbox integrates GRACE phases into investigation workflows.

```elixir
defmodule Prismatic.OSINT.GRACE do
  @moduledoc """
  GRACE intelligence analysis framework implementation.
  Structures OSINT investigations through five phases
  with quality gates and epistemic confidence tracking.
  """

  @type phase :: :gather | :relate | :analyze | :conclude | :evaluate
  @type confidence :: float()

  @type investigation :: %{
    id: String.t(),
    subject: String.t(),
    current_phase: phase(),
    gathered_data: list(map()),
    relationships: list(map()),
    analyses: list(map()),
    conclusions: list(map()),
    evaluation: map() | nil,
    created_at: DateTime.t()
  }

  @spec new_investigation(String.t()) :: investigation()
  def new_investigation(subject) do
    %{
      id: Ecto.UUID.generate(),
      subject: subject,
      current_phase: :gather,
      gathered_data: [],
      relationships: [],
      analyses: [],
      conclusions: [],
      evaluation: nil,
      created_at: DateTime.utc_now()
    }
  end

  @spec add_data(investigation(), map()) :: {:ok, investigation()} | {:error, term()}
  def add_data(%{current_phase: :gather} = inv, data_item) do
    enriched = Map.merge(data_item, %{
      collected_at: DateTime.utc_now(),
      source_reliability: assess_source_reliability(data_item.source_type)
    })

    {:ok, %{inv | gathered_data: [enriched | inv.gathered_data]}}
  end

  def add_data(_, _), do: {:error, :not_in_gather_phase}

  @spec advance_phase(investigation()) :: {:ok, investigation()} | {:error, term()}
  def advance_phase(%{current_phase: :gather} = inv) do
    if source_diversity_met?(inv.gathered_data) do
      {:ok, %{inv | current_phase: :relate}}
    else
      {:error, :insufficient_source_diversity}
    end
  end

  def advance_phase(%{current_phase: :relate} = inv) do
    if length(inv.relationships) > 0 do
      {:ok, %{inv | current_phase: :analyze}}
    else
      {:error, :no_relationships_mapped}
    end
  end

  def advance_phase(%{current_phase: :analyze} = inv) do
    if Enum.any?(inv.analyses, &structured_technique?/1) do
      {:ok, %{inv | current_phase: :conclude}}
    else
      {:error, :no_structured_analysis}
    end
  end

  def advance_phase(%{current_phase: :conclude} = inv) do
    if Enum.all?(inv.conclusions, &has_confidence_level?/1) do
      {:ok, %{inv | current_phase: :evaluate}}
    else
      {:error, :missing_confidence_levels}
    end
  end

  def advance_phase(%{current_phase: :evaluate}), do: {:error, :investigation_complete}

  defp assess_source_reliability(:official_registry), do: 0.9
  defp assess_source_reliability(:technical), do: 0.85
  defp assess_source_reliability(:news), do: 0.6
  defp assess_source_reliability(:social_media), do: 0.4
  defp assess_source_reliability(_), do: 0.3

  defp source_diversity_met?(data) do
    data |> Enum.map(& &1.source_type) |> Enum.uniq() |> length() >= 2
  end

  defp structured_technique?(%{technique: t}) when t in [:ach, :timeline, :network, :financial], do: true
  defp structured_technique?(_), do: false

  defp has_confidence_level?(%{confidence: c}) when is_float(c) and c >= 0.0 and c <= 1.0, do: true
  defp has_confidence_level?(_), do: false
end
```

## Cross-References

- [OSINT](@/glossary/osint.md) -- Open source intelligence collection
- [Epistemic Confidence](@/glossary/epistemic-confidence.md) -- Confidence scoring at Conclude phase
- [Entity Resolution](@/glossary/entity-resolution.md) -- Relationship mapping at Relate phase
- [Threat Intelligence](@/glossary/threat-intelligence.md) -- Intelligence production using GRACE
- **Livebooks**: `osint_intelligence/` notebooks provide interactive GRACE exercises
- **Academy**: OSINTSignalSynthesis topic teaches GRACE with the graceWizard component

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
