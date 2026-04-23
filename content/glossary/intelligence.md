+++
title = "Intelligence"
description = "Comprehensive guide to intelligence as a concept -- the systematic collection, processing, analysis, and dissemination of information to produce actionable knowledge for decision-making in security, business, and technology domains."
weight = 50

[extra]
category = "security"
tags = ["intelligence", "osint", "security", "analysis", "decision-making", "threat-intelligence", "strategic-intelligence", "intelligence-cycle", "knowledge-management"]
status = "active"
author = "Tomas Korcak (korczis)"
date_created = "2026-02-22"
date_updated = "2026-02-22"
reading_time = "20 min"
difficulty = "intermediate"
quality_score = 95
key_takeaway = "Intelligence is the structured process of transforming raw data into actionable knowledge through systematic collection, processing, analysis, and dissemination -- enabling informed decision-making across security operations, business strategy, and technology governance."
related_terms = ["osint", "threat-intelligence", "intelligence-tools", "intelligence-analysis", "intelligence-fusion", "cyber-threat-intelligence", "security", "knowledge-graph", "evidence", "decision-making-hierarchy"]
aliases = ["intel", "intelligence-operations", "intelligence-process"]
prerequisites = ["security", "osint"]
see_also = ["intelligence-tools", "intelligence-analysis", "intelligence-fusion", "intelligence-platform"]
word_count = 1996
date_modified = "2026-02-23"
keywords = ["Intelligence", "Comprehensive", "glossary", "security", "Prismatic Platform", "Analysis", "OSINT"]
image = "/images/sections/glossary.png"
image_alt = "Intelligence - Prismatic Platform"
+++

## Definition

Intelligence, in the context of security and technology, is the product of systematically collecting raw data from diverse sources, processing it into structured formats, analyzing it to identify patterns, relationships, and anomalies, and disseminating the resulting knowledge to decision-makers in a form that enables action. Intelligence is not data, nor is it information -- it is the result of applying analytical tradecraft to data and information to produce understanding that reduces uncertainty and supports decisions. The intelligence cycle (direction, collection, processing, analysis, dissemination, feedback) provides the methodological framework that transforms the chaos of raw data into the clarity of actionable insight. Within the Prismatic Platform, intelligence is the core value proposition: the platform exists to convert scattered, contradictory, incomplete data into coherent, confidence-scored, provenance-tracked knowledge.

## Overview

The concept of intelligence has deep roots in military and diplomatic traditions, where the ability to understand an adversary's capabilities, intentions, and activities could determine the outcome of conflicts. In the modern technology landscape, intelligence has expanded far beyond its military origins to encompass cybersecurity threat intelligence, competitive business intelligence, open source intelligence (OSINT), financial intelligence, and strategic technology intelligence.

At its foundation, intelligence is distinguished from raw data and processed information by the application of analysis. Data is a collection of facts without context (an IP address, a company registration number, a network packet). Information is data organized with context (this IP address belongs to a hosting provider in Eastern Europe). Intelligence is information analyzed for significance (this IP address is associated with a threat actor group that has targeted organizations in our industry, and its recent activity patterns suggest preparation for a new campaign). The transformation from data to intelligence requires human judgment, domain expertise, and analytical frameworks.

**The Intelligence Cycle** provides the canonical framework for intelligence production:

1. **Direction (Planning and Requirements)**: Intelligence consumers define what they need to know. Requirements drive collection priorities, analytical focus, and resource allocation. In the Prismatic Platform, direction takes the form of user queries, automated scan configurations, and strategic intelligence requirements defined in the AIAD agent system.

2. **Collection**: Raw data is gathered from sources matching the requirements. Sources span open (OSINT), technical (network scanning), human (interviews, reports), signals (communications interception, in authorized contexts), and proprietary (licensed databases). The Prismatic Platform's 120+ intelligence tools automate collection from public registries, network scanners, threat feeds, and specialized databases.

3. **Processing**: Raw collected data is converted into usable formats. This includes translation, decryption, deduplication, normalization, entity extraction, and metadata enrichment. Processing transforms heterogeneous raw inputs into structured records suitable for analysis. The platform's Broadway pipelines and adapter normalization layers handle this transformation at scale.

4. **Analysis**: Processed data is examined for patterns, relationships, anomalies, and significance. Analysis integrates multiple data sources, applies domain expertise, and produces assessments with confidence levels. The Prismatic Platform's entity resolution engine, graph analysis capabilities, and confidence scoring system automate portions of analysis while preserving human oversight.

5. **Dissemination**: Intelligence products are delivered to consumers in appropriate formats. Strategic intelligence feeds into long-term planning. Tactical intelligence supports operational decisions. Technical intelligence enables immediate defensive actions. The platform disseminates intelligence through LiveView dashboards, API responses, structured reports, and automated alerts.

6. **Feedback**: Consumers provide feedback on the utility, accuracy, and timeliness of intelligence products. This feedback refines future direction, collection priorities, and analytical methods. The platform's quality scoring and telemetry systems capture usage patterns and result quality signals.

### Intelligence in the Prismatic Platform

The Prismatic Platform operationalizes intelligence concepts through several key architectural elements:

**NABLA Infinity (Epistemic Framework)**: The platform's epistemic framework ensures that intelligence products maintain rigorous evidential standards. The seven non-negotiable axioms (Signal Plurality, Contradiction Preservation, Absence Informative, Time Decay, Unknown Valid, Source Independence, Provenance Mandatory) prevent common intelligence failures such as single-source dependency, confirmation bias, and stale assessments.

**Trinity Gate**: Every intelligence claim must pass three verification gates (Structural Consistency, Logical Consistency, Formal Necessity) before it achieves "established" status. This prevents premature conclusions and ensures that intelligence products are defensible.

**Confidence Scoring**: All intelligence products carry explicit confidence scores (0.0-1.0) with documented reasoning. Decision-makers can calibrate their actions based on confidence levels rather than treating all intelligence as equally certain.

**Provenance Tracking**: Every intelligence product traces back to its source data, collection method, processing steps, and analytical judgments. This end-to-end provenance enables verification, dispute resolution, and quality improvement.

## Technical Details

### Intelligence Pipeline Architecture

The Prismatic Platform implements the intelligence cycle as a composable pipeline:

```elixir
defmodule Prismatic.Intelligence.Pipeline do
  @moduledoc """
  Intelligence pipeline implementing the complete intelligence cycle.
  Transforms raw collection data through processing, analysis, and
  dissemination stages with full provenance tracking.
  """

  alias Prismatic.Intelligence.{Collector, Processor, Analyzer, Disseminator}
  alias Prismatic.Intelligence.Provenance

  @type intelligence_requirement :: %{
          topic: String.t(),
          priority: :critical | :high | :medium | :low,
          sources: [atom()],
          deadline: DateTime.t() | nil,
          consumer: atom(),
          context: map()
        }

  @type intelligence_product :: %{
          id: String.t(),
          requirement_id: String.t(),
          topic: String.t(),
          assessment: String.t(),
          confidence: float(),
          evidence: [map()],
          provenance: Provenance.t(),
          dissemination: :strategic | :tactical | :technical,
          produced_at: DateTime.t(),
          valid_until: DateTime.t()
        }

  @spec produce(intelligence_requirement()) ::
          {:ok, intelligence_product()} | {:error, term()}
  def produce(requirement) do
    provenance = Provenance.new(requirement)

    with {:ok, collected, provenance} <- collect(requirement, provenance),
         {:ok, processed, provenance} <- process(collected, provenance),
         {:ok, analyzed, provenance} <- analyze(processed, requirement, provenance),
         {:ok, product, provenance} <- package(analyzed, requirement, provenance) do
      disseminate(product, requirement.consumer)
      {:ok, %{product | provenance: provenance}}
    end
  end

  defp collect(requirement, provenance) do
    results =
      requirement.sources
      |> Enum.map(fn source ->
        case Collector.collect(source, requirement.topic, requirement.context) do
          {:ok, data} -> {:ok, source, data}
          {:error, reason} -> {:error, source, reason}
        end
      end)

    successes =
      results
      |> Enum.filter(&match?({:ok, _, _}, &1))
      |> Enum.map(fn {:ok, source, data} -> {source, data} end)

    if length(successes) < 2 do
      {:error, :insufficient_source_plurality}
    else
      provenance = Provenance.record(provenance, :collection, %{
        sources_queried: length(requirement.sources),
        sources_succeeded: length(successes),
        sources_failed: length(results) - length(successes)
      })

      {:ok, successes, provenance}
    end
  end

  defp process(collected_data, provenance) do
    processed =
      collected_data
      |> Enum.map(fn {source, data} ->
        {source, Processor.normalize(data, source)}
      end)
      |> Enum.map(fn {source, normalized} ->
        {source, Processor.enrich(normalized)}
      end)
      |> Enum.map(fn {source, enriched} ->
        {source, Processor.deduplicate(enriched)}
      end)

    provenance = Provenance.record(provenance, :processing, %{
      records_processed: length(processed),
      enrichment_applied: true,
      deduplication_applied: true
    })

    {:ok, processed, provenance}
  end

  defp analyze(processed_data, requirement, provenance) do
    analysis_result =
      processed_data
      |> Analyzer.correlate()
      |> Analyzer.detect_patterns()
      |> Analyzer.assess_confidence()
      |> Analyzer.check_contradictions()
      |> Analyzer.generate_assessment(requirement.context)

    provenance = Provenance.record(provenance, :analysis, %{
      method: analysis_result.method,
      confidence: analysis_result.confidence,
      contradictions_found: length(analysis_result.contradictions),
      contradictions_preserved: true
    })

    {:ok, analysis_result, provenance}
  end
end
```

### Confidence Scoring System

Intelligence products carry explicit, traceable confidence scores:

```elixir
defmodule Prismatic.Intelligence.ConfidenceScorer do
  @moduledoc """
  Calculates intelligence confidence scores based on source
  reliability, information consistency, analytical method,
  and temporal freshness.
  """

  @type confidence_factors :: %{
          source_reliability: float(),
          source_count: pos_integer(),
          consistency: float(),
          freshness: float(),
          corroboration: float(),
          method_strength: float()
        }

  @type scored_result :: %{
          confidence: float(),
          factors: confidence_factors(),
          classification: :very_high | :high | :moderate | :low | :very_low,
          reasoning: String.t()
        }

  @weights %{
    source_reliability: 0.25,
    source_plurality: 0.20,
    consistency: 0.20,
    freshness: 0.15,
    corroboration: 0.10,
    method_strength: 0.10
  }

  @spec score(confidence_factors()) :: scored_result()
  def score(factors) do
    weighted_score =
      @weights
      |> Enum.reduce(0.0, fn {factor, weight}, acc ->
        factor_value = Map.get(factors, factor, 0.0)
        acc + factor_value * weight
      end)

    clamped_score = max(0.0, min(1.0, weighted_score))

    %{
      confidence: Float.round(clamped_score, 4),
      factors: factors,
      classification: classify(clamped_score),
      reasoning: generate_reasoning(factors, clamped_score)
    }
  end

  @spec source_plurality_score(pos_integer()) :: float()
  def source_plurality_score(1), do: 0.2
  def source_plurality_score(2), do: 0.6
  def source_plurality_score(3), do: 0.8
  def source_plurality_score(n) when n >= 4, do: 0.95

  @spec freshness_score(DateTime.t()) :: float()
  def freshness_score(timestamp) do
    age_hours = DateTime.diff(DateTime.utc_now(), timestamp, :hour)

    cond do
      age_hours < 1 -> 1.0
      age_hours < 24 -> 0.9
      age_hours < 168 -> 0.7
      age_hours < 720 -> 0.5
      age_hours < 2160 -> 0.3
      true -> 0.1
    end
  end

  defp classify(score) when score >= 0.90, do: :very_high
  defp classify(score) when score >= 0.75, do: :high
  defp classify(score) when score >= 0.50, do: :moderate
  defp classify(score) when score >= 0.25, do: :low
  defp classify(_score), do: :very_low

  defp generate_reasoning(factors, score) do
    weaknesses =
      factors
      |> Enum.filter(fn {_key, value} -> value < 0.5 end)
      |> Enum.map(fn {key, value} -> "#{key}: #{Float.round(value, 2)}" end)

    base = "Overall confidence: #{Float.round(score, 2)} (#{classify(score)})"

    case weaknesses do
      [] -> "#{base}. All factors are within acceptable ranges."
      weak -> "#{base}. Weak factors: #{Enum.join(weak, ", ")}."
    end
  end
end
```

### Entity Resolution for Intelligence Fusion

Intelligence from multiple sources is fused through entity resolution:

```elixir
defmodule Prismatic.Intelligence.EntityResolver do
  @moduledoc """
  Resolves entities across multiple intelligence sources.
  Determines when records from different sources refer to the
  same real-world entity (person, company, asset, IP address).
  """

  @type entity_record :: %{
          source: atom(),
          identifier: String.t(),
          name: String.t(),
          attributes: map()
        }

  @type resolved_entity :: %{
          canonical_id: String.t(),
          canonical_name: String.t(),
          records: [entity_record()],
          sources: [atom()],
          confidence: float(),
          name_variants: [String.t()],
          merged_attributes: map()
        }

  @name_similarity_threshold 0.85
  @attribute_match_boost 0.10

  @spec resolve([entity_record()]) :: {:ok, [resolved_entity()]}
  def resolve(records) when is_list(records) do
    resolved =
      records
      |> group_by_exact_identifiers()
      |> merge_by_name_similarity()
      |> build_resolved_entities()

    {:ok, resolved}
  end

  defp group_by_exact_identifiers(records) do
    records
    |> Enum.group_by(fn record ->
      normalize_identifier(record.identifier)
    end)
  end

  defp merge_by_name_similarity(groups) do
    groups
    |> Map.values()
    |> Enum.reduce([], fn group, acc ->
      case find_similar_group(group, acc) do
        nil -> [group | acc]
        {index, existing} -> List.replace_at(acc, index, existing ++ group)
      end
    end)
  end

  defp find_similar_group(group, existing_groups) do
    group_name = canonical_name(group)

    existing_groups
    |> Enum.with_index()
    |> Enum.find(fn {existing, _index} ->
      existing_name = canonical_name(existing)
      String.jaro_distance(group_name, existing_name) >= @name_similarity_threshold
    end)
    |> case do
      {existing, index} -> {index, existing}
      nil -> nil
    end
  end

  defp build_resolved_entities(groups) do
    Enum.map(groups, fn records ->
      %{
        canonical_id: generate_canonical_id(records),
        canonical_name: canonical_name(records),
        records: records,
        sources: records |> Enum.map(& &1.source) |> Enum.uniq(),
        confidence: calculate_resolution_confidence(records),
        name_variants: records |> Enum.map(& &1.name) |> Enum.uniq(),
        merged_attributes: merge_attributes(records)
      }
    end)
  end

  defp calculate_resolution_confidence(records) do
    source_count = records |> Enum.map(& &1.source) |> Enum.uniq() |> length()
    name_consistency = name_consistency_score(records)

    base = ConfidenceScorer.source_plurality_score(source_count)
    Float.round(base * name_consistency, 4)
  end
end
```

## Implementation

Implementing intelligence capabilities within the Prismatic Platform follows the intelligence cycle as an architectural pattern.

**Requirements Management**: Intelligence requirements are modeled as first-class entities with priorities, deadlines, and consumer specifications. The AIAD agent system translates user queries and automated scan configurations into formal requirements that drive collection and analysis.

**Multi-Source Collection**: The platform's 120+ intelligence tool adapters collect data from Czech registries (28 sources), global providers (84 sources), sanctions databases (3 sources), and specialized registries (EU, UK, US). Each adapter implements the `Prismatic.Intelligence.Tool` behaviour, ensuring consistent error handling, rate limiting, and result formatting.

**Entity-Centric Processing**: Raw collected data is processed through entity extraction, normalization, and resolution. The entity resolution engine uses identifier matching, name similarity (Jaro-Winkler distance), and attribute correlation to determine when records from different sources refer to the same real-world entity. Resolved entities carry confidence scores and provenance chains.

**Graph-Based Analysis**: The KuzuDB graph database stores entity relationships, enabling graph traversal queries that reveal hidden connections (beneficial ownership chains, corporate networks, shared infrastructure). Graph analysis identifies clusters, bridges, and anomalies that are invisible in tabular data.

**Confidence-Scored Dissemination**: Every intelligence product carries an explicit confidence score calculated from source reliability, plurality, consistency, freshness, and analytical method strength. Decision-makers receive both the intelligence assessment and the supporting evidence chain, enabling calibrated decision-making.

## Comparison

| Intelligence Type | Focus | Sources | Consumers | Timeliness |
|-------------------|-------|---------|-----------|------------|
| **Strategic Intelligence** | Long-term trends, capabilities | All sources, historical data | Executive leadership, planners | Weeks to months |
| **Tactical Intelligence** | Operational decisions | Targeted collection, current data | Operational managers, teams | Days to weeks |
| **Technical Intelligence** | Specific indicators, artifacts | Technical sensors, feeds | SOC analysts, engineers | Minutes to hours |
| **OSINT** | Publicly available information | Open sources, registries | Broad, multi-purpose | Hours to days |
| **Threat Intelligence** | Adversary TTPs, IOCs | Threat feeds, incident data | Security teams | Real-time to days |
| **Business Intelligence** | Market, competitive data | Financial reports, market data | Business strategy | Days to weeks |

The Prismatic Platform primarily produces OSINT and threat intelligence, with capabilities extending into tactical and strategic intelligence through its entity resolution and graph analysis features.

## Best Practices

1. **Source Plurality**: Never base intelligence assessments on a single source. The NABLA Infinity axiom of Signal Plurality requires minimum two independent sources before a belief can be established. More sources increase confidence and reduce the risk of manipulation.

2. **Contradiction Preservation**: When sources disagree, preserve both perspectives rather than resolving the contradiction prematurely. Contradictions often reveal the most important intelligence -- they indicate deception, complexity, or rapidly changing situations.

3. **Explicit Confidence**: Always communicate confidence levels alongside intelligence assessments. "We assess with moderate confidence (0.65) that..." is fundamentally different from "We assess with high confidence (0.92) that..." and demands different decision-making responses.

4. **Provenance Chains**: Maintain end-to-end provenance for every intelligence product. When a consumer questions an assessment, the production team must be able to trace it back through analysis, processing, and collection to the original source data.

5. **Timeliness Over Completeness**: Intelligence delivered too late to support a decision is worthless regardless of its accuracy. Deliver preliminary assessments with appropriate confidence caveats rather than waiting for complete data that arrives after the decision window closes.

6. **Separate Facts from Analysis**: Clearly distinguish between observed facts (the company was registered on this date), analytical judgments (the registration timing suggests involvement in a specific scheme), and speculative hypotheses (the company may be a shell entity). Each carries different evidentiary weight.

7. **Regular Requirements Review**: Intelligence requirements evolve as situations change. Regularly review and update collection priorities, analytical focus, and dissemination formats to ensure that intelligence production remains aligned with consumer needs.

8. **Adversarial Thinking**: Consider how intelligence could be manipulated, planted, or fabricated by adversaries. Apply red team thinking to intelligence products: what would an adversary want you to believe, and does the available evidence support that narrative?

## Pitfalls

**Confirmation Bias**: The tendency to seek, interpret, and remember information that confirms pre-existing beliefs. Intelligence analysts must actively seek disconfirming evidence and challenge their own assumptions. The NABLA Infinity framework's Contradiction Preservation axiom exists specifically to counter this bias.

**Mirror Imaging**: Assuming that adversaries or subjects of intelligence think and behave the same way you do. Cultural, organizational, and individual differences can make adversary behavior unpredictable when viewed through your own cognitive framework.

**Information Overload**: Collecting more data than can be meaningfully analyzed produces noise, not intelligence. Focus collection on answering specific intelligence requirements rather than casting the widest possible net.

**Stale Intelligence**: Intelligence products have a shelf life determined by the volatility of the subject. IP reputation data may be stale within hours. Corporate registration data may remain valid for months. Assign explicit validity windows to all intelligence products.

**Single Source Dependency**: Relying on a single intelligence source, regardless of how reliable it has been historically, creates catastrophic fragility. Sources can be compromised, manipulated, deprecated, or simply wrong. Always require corroboration.

**Analysis Paralysis**: The pursuit of perfect intelligence prevents timely delivery. In many decision contexts, a 70%-confident assessment delivered in time is more valuable than a 95%-confident assessment delivered too late.

## Use Cases

**Cybersecurity Threat Assessment**: A security team needs to understand the threat landscape for their organization. Intelligence processes collect threat actor profiles, vulnerability disclosures, attack campaign data, and industry-specific threat reports. Analysis correlates these inputs to produce a threat assessment with prioritized risks and recommended defensive actions.

**Corporate Due Diligence**: Before acquiring a company, an investment firm conducts intelligence-driven due diligence. Collection covers business registries, court records, sanctions lists, media reports, and industry databases across multiple jurisdictions. Analysis identifies red flags, validates claims, and produces a risk-scored assessment that informs the acquisition decision.

**Incident Investigation**: After a security incident, intelligence production shifts to tactical mode. Collection focuses on indicators of compromise (IOCs), threat actor attribution data, and similar incident reports. Analysis reconstructs the attack timeline, identifies the adversary, and produces recommendations for containment and prevention.

**Geopolitical Risk Assessment**: A multinational corporation assesses the risk of operating in a specific country. Intelligence collection covers political stability indicators, regulatory changes, sanctions risks, and supply chain vulnerabilities. Analysis produces a risk-scored assessment that informs market entry or exit decisions.

**Continuous Security Monitoring**: The Prismatic Perimeter application implements intelligence-driven continuous monitoring. Collection tools regularly scan an organization's external attack surface. Analysis detects changes, identifies new vulnerabilities, and produces security ratings. Dissemination delivers real-time dashboard updates and alerts for critical findings.

## Related Concepts

Intelligence is deeply connected to numerous platform and security concepts:

- [OSINT](@/glossary/osint.md) -- open source intelligence, the most accessible and widely used form of intelligence collection
- [Intelligence Tools](@/glossary/intelligence-tools.md) -- the software instruments used to collect, process, and analyze intelligence
- [Intelligence Analysis](@/glossary/intelligence-analysis.md) -- the analytical tradecraft applied to transform data into intelligence
- [Intelligence Fusion](@/glossary/intelligence-fusion.md) -- combining intelligence from multiple sources and disciplines for comprehensive understanding
- [Threat Intelligence](@/glossary/threat-intelligence.md) -- intelligence focused specifically on understanding and countering cyber threats
- [Knowledge Graph](@/glossary/knowledge-graph.md) -- graph-based representation of entities and relationships central to intelligence analysis
- [Evidence](@/glossary/evidence.md) -- the evidentiary basis for intelligence assessments, governed by NABLA Infinity axioms
- [Confidence Scoring](@/glossary/confidence-scoring.md) -- quantitative expression of certainty in intelligence assessments
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- the epistemic framework governing intelligence rigor in the Prismatic Platform
- [Entity Resolution](@/glossary/entity-resolution.md) -- determining when records from different sources refer to the same real-world entity

## See Also

- [Intelligence Platform](@/glossary/intelligence-platform.md) -- integrated systems for managing the complete intelligence lifecycle
- [Cyber Threat Intelligence](@/glossary/cyber-threat-intelligence.md) -- technical intelligence about threat actors and indicators of compromise
- [Due Diligence](@/glossary/due-diligence.md) -- a primary application domain for intelligence production
- [Security Rating](@/glossary/security-rating.md) -- quantitative security assessments produced through intelligence processes
- [Risk Assessment](@/glossary/risk-assessment.md) -- evaluating risks informed by intelligence products
- [Decision-Making Hierarchy](@/glossary/decision-making-hierarchy.md) -- the organizational structure through which intelligence is consumed and acted upon

---

**Connect & Contribute**: Created by [Tomas Korcak (korczis)](https://github.com/korczis) | Part of the Prismatic Platform Glossary | Licensed under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)
