+++
title = "Intelligence Analysis"
weight = 50
[extra]
description = "The systematic process of evaluating collected intelligence data to produce actionable insights, structured assessments, and decision-support recommendations across security, compliance, and business domains."
category = "intelligence"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "intelligence-operations"
related_concepts = ["intelligence cycle", "structured analytic techniques", "entity resolution", "risk scoring", "threat assessment", "confidence calibration", "multi-source fusion"]
implementation_status = "production"
authority_level = "domain-expert"
difficulty_rating = 7
prerequisites = ["osint", "entity-resolution", "data-fusion"]
learning_path = ["osint", "intelligence-fusion", "intelligence-analysis", "threat-assessment", "intelligence-platform"]
interactive_demos = ["/labs/glossary/intelligence-analysis"]
code_examples = ["Elixir GenServer-based analysis pipeline", "Structured Analytic Technique engine", "Confidence-calibrated assessment framework"]
external_resources = ["https://www.cia.gov/resources/csi/studies-in-intelligence/", "https://www.dia.mil/FOIA/Reading-Room/", "https://www.recordedfuture.com/threat-intelligence"]
version_introduced = "0.15.0"
stability_level = "stable"
testing_scenarios = ["multi-source correlation accuracy", "confidence threshold validation", "analyst bias detection", "temporal decay scoring"]
keywords = ["intelligence analysis definition", "structured analytic techniques", "intelligence cycle analysis phase", "OSINT analysis methodology", "threat assessment framework", "confidence calibration intelligence", "multi-source intelligence fusion", "analytic tradecraft"]
tags = ["intelligence", "osint", "analysis", "security", "risk-assessment", "threat-intelligence"]
related_terms = ["osint", "intelligence-fusion", "entity-resolution", "risk-score", "due-diligence", "cyber-threat-intelligence", "threat-assessment", "intelligence-platform", "knowledge-graph", "triple-check"]
word_count = 1514
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Intelligence Analysis - Prismatic Platform"
+++

## Definition

Intelligence Analysis is the systematic process of evaluating, interpreting, and synthesizing collected data from multiple sources to produce actionable intelligence products -- assessments, estimates, warnings, and recommendations that inform decision-making. Unlike raw data collection, analysis transforms unstructured observations into structured knowledge by applying analytic tradecraft: hypothesis generation, evidence weighing, confidence calibration, alternative analysis, and bias mitigation. The output is not merely a summary of collected data but a reasoned judgment about what the data means, what it implies for the future, and what actions it warrants.

In the intelligence community, analysis is the phase of the intelligence cycle where collected information becomes intelligence. The distinction is critical: information is raw, unprocessed, and context-free; intelligence is processed, evaluated, and contextualized for a specific consumer's needs. A domain registration record is information. An assessment that a threat actor is building infrastructure for a phishing campaign targeting financial institutions, based on patterns across domain registrations, certificate issuance, and historical behavior -- that is intelligence.

## Overview

Intelligence analysis operates within the broader [intelligence cycle](@/glossary/osint.md), which comprises planning and direction, collection, processing, analysis, and dissemination. Analysis is the phase where human judgment (or increasingly, automated reasoning systems) transforms processed data into intelligence products. The quality of analysis depends on the quality of collection, but excellent collection cannot compensate for poor analysis, and vice versa.

### The Analysis Spectrum

Analysis exists on a spectrum from descriptive to predictive to prescriptive:

| Level | Purpose | Output | Example |
|-------|---------|--------|---------|
| **Descriptive** | What happened | Situation reports, entity profiles | "Company X registered 14 domains in 48 hours" |
| **Diagnostic** | Why it happened | Root cause assessments | "Domain registration pattern matches infrastructure staging for credential harvesting" |
| **Predictive** | What will happen | Threat forecasts, trend analysis | "Based on historical patterns, campaign launch expected within 7-14 days" |
| **Prescriptive** | What to do | Recommendations, action items | "Block the following indicators, notify affected institutions, increase monitoring" |

The Prismatic Platform supports all four levels through its automated analysis pipelines, with human analyst oversight at the diagnostic and prescriptive levels where judgment is most critical.

### Structured Analytic Techniques

Professional intelligence analysis employs Structured Analytic Techniques (SATs) to mitigate cognitive biases and improve analytic rigor. Key techniques include:

- **Analysis of Competing Hypotheses (ACH)**: Systematically evaluates evidence against multiple hypotheses rather than seeking confirmation of a single hypothesis
- **Key Assumptions Check**: Identifies and challenges the assumptions underlying an analytic judgment
- **Red Team Analysis**: Deliberately adopts an adversarial perspective to identify vulnerabilities in assessments
- **Indicators and Warnings (I&W)**: Defines observable indicators that would signal a change in assessed conditions
- **Weighted Evidence Assessment**: Assigns reliability and relevance scores to individual evidence items

## Technical Details

### The Analytic Process Model

Intelligence analysis in automated systems follows a structured pipeline:

```
Collection → Normalization → Enrichment → Correlation → Hypothesis Generation
    → Evidence Weighing → Confidence Calibration → Assessment Production → Dissemination
```

Each stage has specific technical requirements:

**Normalization** converts heterogeneous source data into a common schema. A domain record from WHOIS, a company record from ARES, and a certificate from CT logs must all be representable in a unified entity model.

**Enrichment** augments normalized records with contextual data: geolocation for IP addresses, industry classification for companies, historical behavior profiles for entities.

**Correlation** identifies relationships between entities across sources. This is where [entity resolution](@/glossary/entity-resolution.md) is critical -- determining that "Acme Corp" in one source, "ACME Corporation s.r.o." in another, and a registrant email "admin@acme-corp.cz" in a third all refer to the same entity.

**Confidence Calibration** assigns probability estimates to analytic judgments using a standardized vocabulary:

| Term | Probability Range | Numeric Score |
|------|------------------|---------------|
| Almost Certain | 95-99% | 0.95-0.99 |
| Very Likely | 80-95% | 0.80-0.95 |
| Likely | 55-80% | 0.55-0.80 |
| Roughly Even | 45-55% | 0.45-0.55 |
| Unlikely | 20-45% | 0.20-0.45 |
| Very Unlikely | 5-20% | 0.05-0.20 |
| Remote | 1-5% | 0.01-0.05 |

### Temporal Analysis

Intelligence analysis must account for temporal dimensions -- the age, freshness, and decay rate of information:

```elixir
defmodule PrismaticIntelligence.TemporalAnalysis do
  @moduledoc """
  Temporal decay and freshness scoring for intelligence assessments.
  Older information receives lower confidence weights unless corroborated
  by recent collection.
  """

  @type temporal_weight :: %{
    source_timestamp: DateTime.t(),
    collection_timestamp: DateTime.t(),
    decay_function: :linear | :exponential | :step,
    half_life_hours: pos_integer(),
    weight: float()
  }

  @spec calculate_temporal_weight(DateTime.t(), keyword()) :: float()
  def calculate_temporal_weight(source_timestamp, opts \\ []) do
    half_life = Keyword.get(opts, :half_life_hours, 168)
    decay_fn = Keyword.get(opts, :decay_function, :exponential)
    hours_elapsed = DateTime.diff(DateTime.utc_now(), source_timestamp, :hour)

    case decay_fn do
      :exponential -> :math.exp(-0.693 * hours_elapsed / half_life)
      :linear -> max(0.0, 1.0 - hours_elapsed / (half_life * 2))
      :step -> if hours_elapsed <= half_life, do: 1.0, else: 0.5
    end
  end

  @spec apply_temporal_weights(list(map()), keyword()) :: list(map())
  def apply_temporal_weights(evidence_items, opts \\ []) do
    Enum.map(evidence_items, fn item ->
      weight = calculate_temporal_weight(item.timestamp, opts)
      Map.put(item, :temporal_weight, weight)
    end)
  end
end
```

## Implementation in Prismatic Platform

The Prismatic Platform implements intelligence analysis through a multi-layered architecture that combines automated processing with structured analytic frameworks. The analysis engine operates as an OTP application within the umbrella, leveraging GenServer processes for stateful analysis sessions and supervised pipelines for fault-tolerant processing.

### Analysis Pipeline Architecture

```elixir
defmodule PrismaticIntelligence.AnalysisPipeline do
  @moduledoc """
  Orchestrates the intelligence analysis pipeline from raw collected data
  through enrichment, correlation, and assessment production.

  Each stage is implemented as a supervised GenServer that processes
  items from a Broadway-style pipeline with backpressure support.
  """

  use GenServer

  @type pipeline_config :: %{
    sources: list(atom()),
    enrichment_modules: list(module()),
    correlation_engine: module(),
    assessment_template: atom(),
    confidence_threshold: float(),
    temporal_decay: keyword()
  }

  @type analysis_result :: %{
    assessment_id: String.t(),
    subject: String.t(),
    findings: list(map()),
    confidence: float(),
    evidence_count: pos_integer(),
    sources_consulted: list(atom()),
    analytic_notes: list(String.t()),
    produced_at: DateTime.t()
  }

  @spec start_link(pipeline_config()) :: GenServer.on_start()
  def start_link(config) do
    GenServer.start_link(__MODULE__, config, name: via_tuple(config))
  end

  @spec analyze(GenServer.server(), String.t(), keyword()) ::
          {:ok, analysis_result()} | {:error, term()}
  def analyze(pipeline, subject, opts \\ []) do
    timeout = Keyword.get(opts, :timeout, 30_000)
    GenServer.call(pipeline, {:analyze, subject, opts}, timeout)
  end

  @impl true
  def init(config) do
    state = %{
      config: config,
      active_analyses: %{},
      completed_count: 0,
      error_count: 0
    }

    {:ok, state}
  end

  @impl true
  def handle_call({:analyze, subject, opts}, from, state) do
    analysis_id = generate_analysis_id(subject)

    task =
      Task.Supervisor.async_nolink(
        PrismaticIntelligence.TaskSupervisor,
        fn -> execute_analysis(state.config, subject, analysis_id, opts) end
      )

    active = Map.put(state.active_analyses, task.ref, {from, analysis_id})
    {:noreply, %{state | active_analyses: active}}
  end

  @impl true
  def handle_info({ref, result}, state) when is_reference(ref) do
    Process.demonitor(ref, [:flush])

    case Map.pop(state.active_analyses, ref) do
      {{from, _analysis_id}, active} ->
        GenServer.reply(from, {:ok, result})
        {:noreply, %{state | active_analyses: active, completed_count: state.completed_count + 1}}

      {nil, _active} ->
        {:noreply, state}
    end
  end

  @impl true
  def handle_info({:DOWN, ref, :process, _pid, reason}, state) do
    case Map.pop(state.active_analyses, ref) do
      {{from, _analysis_id}, active} ->
        GenServer.reply(from, {:error, {:analysis_failed, reason}})
        {:noreply, %{state | active_analyses: active, error_count: state.error_count + 1}}

      {nil, _active} ->
        {:noreply, state}
    end
  end

  defp execute_analysis(config, subject, analysis_id, opts) do
    with {:ok, raw_data} <- collect_from_sources(config.sources, subject),
         {:ok, enriched} <- enrich_data(config.enrichment_modules, raw_data),
         {:ok, correlated} <- correlate_entities(config.correlation_engine, enriched),
         {:ok, assessment} <- produce_assessment(correlated, config, analysis_id, opts) do
      assessment
    end
  end

  defp collect_from_sources(sources, subject) do
    results =
      sources
      |> Task.async_stream(fn source -> source.collect(subject) end,
        max_concurrency: 10,
        timeout: 15_000
      )
      |> Enum.reduce([], fn
        {:ok, {:ok, data}}, acc -> [data | acc]
        {:ok, {:error, _reason}}, acc -> acc
        {:exit, _reason}, acc -> acc
      end)

    {:ok, List.flatten(results)}
  end

  defp enrich_data(modules, raw_data) do
    enriched =
      Enum.reduce(modules, raw_data, fn module, data ->
        case module.enrich(data) do
          {:ok, enriched_data} -> enriched_data
          {:error, _reason} -> data
        end
      end)

    {:ok, enriched}
  end

  defp correlate_entities(engine, enriched_data) do
    engine.correlate(enriched_data)
  end

  defp produce_assessment(correlated, config, analysis_id, opts) do
    confidence = calculate_composite_confidence(correlated, config)
    threshold = Keyword.get(opts, :confidence_threshold, config.confidence_threshold)

    if confidence >= threshold do
      assessment = %{
        assessment_id: analysis_id,
        subject: correlated.subject,
        findings: correlated.findings,
        confidence: confidence,
        evidence_count: length(correlated.evidence),
        sources_consulted: correlated.sources,
        analytic_notes: correlated.notes,
        produced_at: DateTime.utc_now()
      }

      {:ok, assessment}
    else
      {:error, {:insufficient_confidence, confidence, threshold}}
    end
  end

  defp calculate_composite_confidence(correlated, config) do
    correlated.evidence
    |> PrismaticIntelligence.TemporalAnalysis.apply_temporal_weights(config.temporal_decay)
    |> Enum.map(& &1.temporal_weight * &1.source_reliability)
    |> then(fn weights ->
      if Enum.empty?(weights), do: 0.0, else: Enum.sum(weights) / length(weights)
    end)
  end

  defp generate_analysis_id(subject) do
    hash = :crypto.hash(:sha256, "#{subject}-#{System.system_time(:nanosecond)}")
    "IA-" <> Base.encode16(hash, case: :lower) |> String.slice(0, 16)
  end

  defp via_tuple(config) do
    {:via, Registry, {PrismaticIntelligence.Registry, {:pipeline, config.assessment_template}}}
  end
end
```

### Analysis of Competing Hypotheses Engine

The platform implements ACH as a core structured analytic technique:

```elixir
defmodule PrismaticIntelligence.ACH do
  @moduledoc """
  Analysis of Competing Hypotheses (ACH) implementation.
  Systematically evaluates evidence against multiple hypotheses
  to identify the most supported assessment while flagging
  diagnostic evidence that distinguishes between hypotheses.
  """

  @type hypothesis :: %{
    id: String.t(),
    description: String.t(),
    prior_probability: float()
  }

  @type evidence_item :: %{
    id: String.t(),
    description: String.t(),
    source: atom(),
    reliability: float(),
    relevance: float(),
    timestamp: DateTime.t()
  }

  @type consistency_rating :: :very_consistent | :consistent | :neutral |
                              :inconsistent | :very_inconsistent

  @type ach_matrix :: %{
    hypotheses: list(hypothesis()),
    evidence: list(evidence_item()),
    ratings: %{{String.t(), String.t()} => consistency_rating()},
    scores: %{String.t() => float()},
    diagnosticity: %{String.t() => float()}
  }

  @spec build_matrix(list(hypothesis()), list(evidence_item())) :: ach_matrix()
  def build_matrix(hypotheses, evidence) do
    ratings = generate_ratings(hypotheses, evidence)
    scores = calculate_hypothesis_scores(hypotheses, evidence, ratings)
    diagnosticity = calculate_diagnosticity(hypotheses, evidence, ratings)

    %{
      hypotheses: hypotheses,
      evidence: evidence,
      ratings: ratings,
      scores: scores,
      diagnosticity: diagnosticity
    }
  end

  @spec most_supported(ach_matrix()) :: {:ok, hypothesis()} | {:error, :inconclusive}
  def most_supported(matrix) do
    case Enum.max_by(matrix.hypotheses, &Map.get(matrix.scores, &1.id, 0.0)) do
      nil -> {:error, :inconclusive}
      best -> {:ok, best}
    end
  end

  @spec diagnostic_evidence(ach_matrix()) :: list(evidence_item())
  def diagnostic_evidence(matrix) do
    matrix.evidence
    |> Enum.filter(fn ev -> Map.get(matrix.diagnosticity, ev.id, 0.0) > 0.6 end)
    |> Enum.sort_by(fn ev -> Map.get(matrix.diagnosticity, ev.id, 0.0) end, :desc)
  end

  defp generate_ratings(hypotheses, evidence) do
    for h <- hypotheses, e <- evidence, into: %{} do
      {{h.id, e.id}, rate_consistency(h, e)}
    end
  end

  defp rate_consistency(_hypothesis, _evidence) do
    # Production implementation uses NLP and domain-specific rules
    :neutral
  end

  defp calculate_hypothesis_scores(hypotheses, evidence, ratings) do
    for h <- hypotheses, into: %{} do
      score =
        evidence
        |> Enum.map(fn e ->
          rating = Map.get(ratings, {h.id, e.id}, :neutral)
          rating_to_numeric(rating) * e.reliability * e.relevance
        end)
        |> Enum.sum()

      {h.id, score}
    end
  end

  defp calculate_diagnosticity(hypotheses, evidence, ratings) do
    for e <- evidence, into: %{} do
      scores_for_evidence =
        Enum.map(hypotheses, fn h ->
          rating = Map.get(ratings, {h.id, e.id}, :neutral)
          rating_to_numeric(rating)
        end)

      variance =
        if length(scores_for_evidence) > 1 do
          mean = Enum.sum(scores_for_evidence) / length(scores_for_evidence)
          scores_for_evidence
          |> Enum.map(fn s -> (s - mean) * (s - mean) end)
          |> Enum.sum()
          |> Kernel./(length(scores_for_evidence))
        else
          0.0
        end

      {e.id, :math.sqrt(variance)}
    end
  end

  defp rating_to_numeric(:very_consistent), do: 2.0
  defp rating_to_numeric(:consistent), do: 1.0
  defp rating_to_numeric(:neutral), do: 0.0
  defp rating_to_numeric(:inconsistent), do: -1.0
  defp rating_to_numeric(:very_inconsistent), do: -2.0
end
```

### Integration with OSINT Pipelines

The analysis engine integrates directly with the platform's [OSINT](@/glossary/osint.md) collection infrastructure. When an OSINT pipeline completes collection for a target, the analysis engine is automatically invoked:

1. **Entity Resolution**: The [entity resolution](@/glossary/entity-resolution.md) engine consolidates collected records into a unified entity graph
2. **Risk Scoring**: The [risk score](@/glossary/risk-score.md) module calculates composite risk based on multiple indicators
3. **Threat Assessment**: The [threat assessment](@/glossary/threat-assessment.md) framework evaluates potential threats based on capability, intent, and opportunity
4. **Assessment Production**: Final intelligence products are generated with confidence ratings and analytic notes

## Comparison with Alternatives

| Platform | Approach | Strengths | Limitations |
|----------|----------|-----------|-------------|
| **Prismatic** | Automated pipeline + SATs | OTP fault tolerance, Elixir concurrency, integrated entity resolution | Specialized for OSINT sources |
| **Palantir Gotham** | Graph-based visual analysis | Massive dataset handling, government adoption | Proprietary, expensive, requires dedicated analysts |
| **Maltego** | Graph link analysis | Visual entity mapping, many transforms | Manual-heavy, limited automation |
| **Recorded Future** | ML-driven threat intelligence | Real-time threat feeds, NLP analysis | SaaS-only, limited customization |
| **IBM i2** | Analyst notebook paradigm | Established methodology, law enforcement standard | Legacy architecture, steep learning curve |
| **Analyst's Notebook** | Timeline and link analysis | Temporal analysis, courtroom-ready output | Desktop-only, no automation |

Prismatic's advantage is architectural: by building intelligence analysis as OTP processes within an Elixir umbrella, the platform achieves fault-tolerant, concurrent analysis that scales horizontally without the complexity of distributed Java or Python systems.

## Best Practices

1. **Apply Structured Analytic Techniques**: Never rely on intuition alone. Use ACH, key assumptions checks, and red team analysis for every significant assessment
2. **Calibrate Confidence**: Use standardized probability language. "Likely" means 55-80%, not "I think so"
3. **Document Assumptions**: Every assessment rests on assumptions. Make them explicit so they can be challenged
4. **Preserve Contradictions**: Following the [NABLA Infinity](@/glossary/3nl.md) framework, contradictory evidence must be preserved, not discarded
5. **Separate Collection from Analysis**: Analysts should not direct their own collection -- this introduces confirmation bias
6. **Apply Temporal Decay**: Older evidence receives lower weight unless corroborated by recent collection
7. **Use the Triple-Check Pattern**: Critical assessments must pass the [triple-check](@/glossary/triple-check.md) validation engine with three independent source corroboration
8. **Version Assessments**: Intelligence is perishable. Assessments must be versioned and updated as new evidence arrives

## Common Pitfalls

1. **Confirmation Bias**: Seeking evidence that confirms an existing hypothesis while ignoring contradictory data. ACH mitigates this by requiring explicit evaluation of evidence against all hypotheses
2. **Mirror Imaging**: Assuming the adversary thinks and acts the same way you do. Red team analysis helps counter this
3. **Anchoring**: Over-weighting the first piece of evidence received. Temporal weighting and structured evidence evaluation reduce anchoring effects
4. **Groupthink**: Convergence on a single assessment without genuine deliberation. The platform's contradiction preservation axiom (from NABLA Infinity) explicitly prevents this
5. **Satisficing**: Stopping analysis when a "good enough" explanation is found rather than evaluating all hypotheses. ACH's exhaustive matrix approach prevents premature closure
6. **Source Fixation**: Over-relying on a single high-quality source at the expense of multi-source corroboration
7. **Recency Bias**: Over-weighting recent evidence while discounting historical patterns. Balanced temporal decay functions address this
8. **Ignoring Base Rates**: Failing to account for the prior probability of events when evaluating new evidence

## Use Cases

### Corporate Due Diligence

When conducting [due diligence](@/glossary/due-diligence.md) on a potential business partner, the analysis engine collects data from Czech business registries (ARES, Justice.cz), international company databases, sanctions lists, and open web sources. The ACH framework evaluates competing hypotheses about the entity's legitimacy, beneficial ownership structure, and risk profile. The output is a structured assessment with confidence ratings suitable for compliance documentation.

### Cyber Threat Intelligence

The platform's [cyber threat intelligence](@/glossary/cyber-threat-intelligence.md) capability uses intelligence analysis to assess threat actor campaigns. Indicators of compromise (IoCs) are collected from multiple sources, correlated through entity resolution, and analyzed to produce threat assessments with predicted timelines and recommended mitigations.

### Attack Surface Monitoring

Within the [EASM](@/glossary/easm.md) framework, intelligence analysis continuously evaluates the organization's external attack surface. Changes in DNS records, certificate issuance, and exposed services are analyzed to produce risk-scored assessments that drive security ratings through [Prismatic Perimeter](@/glossary/prismatic-perimeter.md).

### Sanctions Compliance

For [sanctions screening](@/glossary/sanctions-screening.md) and [AML](@/glossary/aml.md) compliance, the analysis engine evaluates matches against sanctions lists using fuzzy matching and contextual analysis to reduce false positives while maintaining compliance sensitivity.

## Related Concepts

- [OSINT](@/glossary/osint.md) -- The discipline of collecting intelligence from publicly available sources, providing the raw material for analysis
- [Intelligence Fusion](@/glossary/intelligence-fusion.md) -- The process of combining intelligence from multiple sources and disciplines into a unified picture
- [Entity Resolution](@/glossary/entity-resolution.md) -- Determining that records from different sources refer to the same real-world entity
- [Risk Score](@/glossary/risk-score.md) -- Quantified risk assessment produced by analysis pipelines
- [Due Diligence](@/glossary/due-diligence.md) -- Investigative process that relies on intelligence analysis for assessment production
- [Cyber Threat Intelligence](@/glossary/cyber-threat-intelligence.md) -- Specialized analysis focused on adversarial cyber operations
- [Threat Assessment](@/glossary/threat-assessment.md) -- Evaluation of potential threats based on capability, intent, and opportunity
- [Intelligence Platform](@/glossary/intelligence-platform.md) -- The comprehensive system within which analysis operates
- [Knowledge Graph](@/glossary/knowledge-graph.md) -- Graph-based knowledge representation that supports analytic reasoning
- [Triple Check](@/glossary/triple-check.md) -- Three-source corroboration validation for critical assessments

## See Also

- [OSINT](@/glossary/osint.md) -- Collection discipline feeding the analysis pipeline
- [Intelligence Fusion](@/glossary/intelligence-fusion.md) -- Multi-source integration methodology
- [Hawkeye](@/glossary/hawkeye.md) -- Visitor intelligence system using analysis techniques
- [EASM](@/glossary/easm.md) -- External Attack Surface Management leveraging continuous analysis
- [Risk Assessment](@/glossary/risk-assessment.md) -- Broader risk evaluation framework
- [Prismatic Perimeter](@/glossary/prismatic-perimeter.md) -- Security ratings driven by intelligence analysis

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
