+++
title = "Security Rating"
weight = 26
[extra]
description = "A-F grading system with numeric scores (300-900) for organization security posture"
category = "security"
subcategory = "risk_assessment"
difficulty = "advanced"
technology_type = "assessment_framework"
platform_component = "security_evaluation"
scoring_methodology = "evidence_based"
assessment_scope = "external_posture"
rating_scale = "dual_scale"
confidence_modeling = "epistemic"
compliance_integration = "nis2_zkb"
industry_benchmarking = "enabled"
temporal_tracking = "continuous"
prerequisite_concepts = ["external_attack_surface", "vulnerability_assessment", "compliance_frameworks", "risk_management"]
use_cases = ["vendor_assessment", "supply_chain_risk", "compliance_monitoring", "security_benchmarking"]
benefits = ["objective_measurement", "continuous_monitoring", "industry_comparison", "risk_quantification"]
implementation_patterns = ["multi_dimensional_scoring", "evidence_aggregation", "confidence_weighting", "temporal_analysis"]
quality_metrics = ["assessment_accuracy", "confidence_level", "evidence_coverage", "temporal_consistency"]
integration_points = ["easm_platforms", "vulnerability_scanners", "compliance_frameworks", "threat_intelligence"]
related_disciplines = ["cybersecurity", "risk_management", "compliance", "third_party_risk"]
assessment_frequency = "continuous"
related_app = "prismatic-perimeter"
related_terms = ["easm", "nis2", "zkb", "risk-score", "greynoise", "shodan", "vulnerability-assessment", "compliance-framework", "attack-surface", "security-posture"]
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 819
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Security", "Rating", "300-900", "glossary", "Prismatic Platform", "README", "Architecture"]
tags = ["glossary", "security", "security-rating", "prismatic"]
quality_score = 75
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Security Rating - Prismatic Platform"
+++

## Definition and Overview

A Security Rating is a quantified assessment of an organization's external security posture, expressed as a dual-scale metric combining a letter grade (A through F) with a numeric score ranging from 300 to 900. The rating synthesizes evidence from multiple security dimensions -- asset discovery, vulnerability assessment, configuration analysis, certificate management, DNS hygiene, and compliance posture -- into a single actionable metric that enables rapid comparison across organizations, supply chains, and industry benchmarks.

Security ratings emerged in the cybersecurity industry as a response to the opacity of organizational security posture. Before rating systems, assessing a vendor's or partner's security required expensive audits, lengthy questionnaires, and subjective evaluation. Security ratings provide an objective, continuously updated, evidence-based assessment that can be computed without the target organization's cooperation, using only externally observable data. This external-only approach is both the primary strength and the primary limitation of security ratings.

The Prismatic Platform's Security Rating system, implemented within [Prismatic Perimeter](@/apps/prismatic-perimeter.md), competes with commercial platforms such as BitSight, Black Kite, and SecurityScorecard. It differentiates through integration with EU and Czech compliance frameworks (NIS2 and ZKB), evidence-based scoring with explicit confidence levels, and the epistemic rigor of the NABLA Infinity framework ensuring that ratings are grounded in plural, independent evidence sources rather than single-signal assessments.

## Technical Deep Dive

### Dual-Scale Rating System

The rating system uses two complementary scales:

| Grade | Numeric Range | Interpretation | Typical Posture |
|-------|--------------|----------------|-----------------|
| A | 800-900 | Excellent | Proactive security program, rapid patching, strong controls |
| B | 700-799 | Good | Solid security with minor gaps, reasonable patch cadence |
| C | 600-699 | Adequate | Basic security measures, some gaps in coverage |
| D | 500-599 | Below Average | Significant gaps, slow remediation, compliance issues |
| F | 300-499 | Poor | Critical vulnerabilities, missing basic controls |

### Rating Computation Engine

The rating aggregates scores from multiple security dimensions, each weighted by impact:

```elixir
defmodule PrismaticPerimeter.Rating.Engine do
  @moduledoc """
  Computes security ratings from multi-dimensional evidence.
  Produces both letter grade and numeric score with confidence.
  """

  @type rating :: %{
    grade: :A | :B | :C | :D | :F,
    score: 300..900,
    confidence: float(),
    industry_percentile: non_neg_integer(),
    dimensions: %{atom() => dimension_score()},
    evidence_count: non_neg_integer(),
    last_updated: DateTime.t(),
    trend: :improving | :stable | :degrading
  }

  @type dimension_score :: %{
    score: 0..100,
    weight: float(),
    confidence: float(),
    evidence: [evidence_item()],
    last_updated: DateTime.t()
  }

  @type evidence_item :: %{
    type: atom(),
    value: term(),
    source: String.t(),
    timestamp: DateTime.t(),
    reliability: :high | :medium | :low
  }

  @dimension_weights %{
    vulnerabilities: 0.25,
    tls_configuration: 0.15,
    dns_security: 0.10,
    certificate_management: 0.12,
    exposed_services: 0.18,
    compliance_posture: 0.20
  }

  @spec compute_rating(String.t()) :: {:ok, rating()} | {:error, term()}
  def compute_rating(organization_domain) do
    with {:ok, evidence} <- gather_evidence(organization_domain),
         {:ok, dimension_scores} <- score_dimensions(evidence),
         {:ok, overall_score} <- calculate_overall_score(dimension_scores),
         {:ok, grade} <- determine_grade(overall_score),
         {:ok, confidence} <- calculate_confidence(dimension_scores) do

      rating = %{
        grade: grade,
        score: overall_score,
        confidence: confidence,
        industry_percentile: calculate_industry_percentile(overall_score),
        dimensions: dimension_scores,
        evidence_count: count_evidence(evidence),
        last_updated: DateTime.utc_now(),
        trend: analyze_trend(organization_domain, overall_score)
      }

      {:ok, rating}
    else
      error -> error
    end
  end

  defp gather_evidence(domain) do
    evidence_gathering_tasks = [
      Task.async(fn -> scan_vulnerabilities(domain) end),
      Task.async(fn -> analyze_tls_configuration(domain) end),
      Task.async(fn -> assess_dns_security(domain) end),
      Task.async(fn -> check_certificate_status(domain) end),
      Task.async(fn -> enumerate_exposed_services(domain) end),
      Task.async(fn -> evaluate_compliance_posture(domain) end)
    ]

    evidence_results = Task.await_many(evidence_gathering_tasks, 30_000)

    case Enum.all?(evidence_results, fn {:ok, _} -> true; _ -> false end) do
      true ->
        evidence = Enum.map(evidence_results, fn {:ok, data} -> data end)
        {:ok, List.flatten(evidence)}

      false ->
        errors = Enum.filter(evidence_results, fn {:error, _} -> true; _ -> false end)
        {:error, {:evidence_gathering_failed, errors}}
    end
  end

  defp score_dimensions(evidence) do
    dimension_evidence = Enum.group_by(evidence, &classify_evidence_dimension/1)

    dimension_scores = Enum.into(@dimension_weights, %{}, fn {dimension, weight} ->
      evidence_for_dimension = Map.get(dimension_evidence, dimension, [])
      score = calculate_dimension_score(dimension, evidence_for_dimension)

      {dimension, %{
        score: score.value,
        weight: weight,
        confidence: score.confidence,
        evidence: evidence_for_dimension,
        last_updated: DateTime.utc_now()
      }}
    end)

    {:ok, dimension_scores}
  end

  defp calculate_dimension_score(:vulnerabilities, evidence) do
    # Score based on presence and severity of vulnerabilities
    critical_vulns = count_vulnerabilities_by_severity(evidence, :critical)
    high_vulns = count_vulnerabilities_by_severity(evidence, :high)
    medium_vulns = count_vulnerabilities_by_severity(evidence, :medium)

    # Base score starts at 100 and decreases with vulnerabilities
    deductions = critical_vulns * 25 + high_vulns * 10 + medium_vulns * 3

    base_score = 100
    final_score = max(0, base_score - deductions)

    # Confidence based on evidence recency and source reliability
    confidence = calculate_evidence_confidence(evidence)

    %{value: final_score, confidence: confidence}
  end

  defp calculate_dimension_score(:tls_configuration, evidence) do
    tls_evidence = Enum.filter(evidence, &(&1.type == :tls_scan))

    case tls_evidence do
      [] ->
        %{value: 0, confidence: 0.0}  # No evidence means no score

      tls_results ->
        # Analyze TLS configuration quality
        scores = Enum.map(tls_results, fn tls ->
          score_tls_configuration(tls.value)
        end)

        average_score = Enum.sum(scores) / length(scores)
        confidence = calculate_evidence_confidence(tls_results)

        %{value: round(average_score), confidence: confidence}
    end
  end

  defp score_tls_configuration(tls_config) do
    base_score = 100

    # Deduct points for security issues
    deductions = [
      if tls_config.supports_tls_1_0, do: 30, else: 0,
      if tls_config.supports_tls_1_1, do: 20, else: 0,
      if tls_config.weak_ciphers > 0, do: tls_config.weak_ciphers * 5, else: 0,
      if not tls_config.supports_tls_1_3, do: 10, else: 0,
      if not tls_config.perfect_forward_secrecy, do: 15, else: 0,
      if tls_config.certificate_issues > 0, do: tls_config.certificate_issues * 8, else: 0
    ]

    max(0, base_score - Enum.sum(deductions))
  end

  defp calculate_dimension_score(:dns_security, evidence) do
    dns_evidence = Enum.filter(evidence, &(&1.type in [:dns_sec, :dns_config]))

    dns_score = case dns_evidence do
      [] ->
        50  # Neutral score if no DNS evidence

      dns_results ->
        analyze_dns_security_posture(dns_results)
    end

    confidence = calculate_evidence_confidence(dns_evidence)
    %{value: dns_score, confidence: confidence}
  end

  defp analyze_dns_security_posture(dns_evidence) do
    base_score = 100

    # Check for various DNS security features and issues
    dnssec_enabled = Enum.any?(dns_evidence, &(&1.value.dnssec_enabled))
    caa_records = Enum.any?(dns_evidence, &(&1.value.caa_records_present))
    wildcard_exposure = Enum.any?(dns_evidence, &(&1.value.wildcard_records > 5))
    subdomain_takeover_risk = Enum.any?(dns_evidence, &(&1.value.takeover_vulnerable))

    deductions = [
      if not dnssec_enabled, do: 25, else: 0,
      if not caa_records, do: 10, else: 0,
      if wildcard_exposure, do: 15, else: 0,
      if subdomain_takeover_risk, do: 30, else: 0
    ]

    max(0, base_score - Enum.sum(deductions))
  end

  defp calculate_overall_score(dimension_scores) do
    # Weighted average of dimension scores
    weighted_sum = Enum.reduce(dimension_scores, 0.0, fn {_dimension, score_data}, acc ->
      acc + (score_data.score * score_data.weight * score_data.confidence)
    end)

    total_weight = Enum.reduce(dimension_scores, 0.0, fn {_dimension, score_data}, acc ->
      acc + (score_data.weight * score_data.confidence)
    end)

    if total_weight > 0 do
      overall_score = round(weighted_sum / total_weight)
      # Scale to 300-900 range
      scaled_score = 300 + round((overall_score / 100) * 600)
      {:ok, min(900, max(300, scaled_score))}
    else
      {:error, :insufficient_evidence}
    end
  end

  defp determine_grade(numeric_score) do
    grade = cond do
      numeric_score >= 800 -> :A
      numeric_score >= 700 -> :B
      numeric_score >= 600 -> :C
      numeric_score >= 500 -> :D
      true -> :F
    end

    {:ok, grade}
  end

  defp calculate_confidence(dimension_scores) do
    # Overall confidence is the weighted average of dimension confidences
    total_confidence = Enum.reduce(dimension_scores, 0.0, fn {_dim, score}, acc ->
      acc + (score.confidence * score.weight)
    end)

    total_weight = Enum.reduce(dimension_scores, 0.0, fn {_dim, score}, acc ->
      acc + score.weight
    end)

    confidence = total_confidence / total_weight
    {:ok, Float.round(confidence, 3)}
  end

  defp calculate_industry_percentile(score) do
    # Compare against industry benchmark data
    # This would typically query a database of industry scores
    cond do
      score >= 850 -> 95
      score >= 800 -> 85
      score >= 750 -> 75
      score >= 700 -> 60
      score >= 650 -> 45
      score >= 600 -> 30
      score >= 550 -> 20
      score >= 500 -> 10
      true -> 5
    end
  end
end

defmodule PrismaticPerimeter.Rating.TemporalAnalysis do
  @moduledoc """
  Analyzes security rating trends over time to detect improvements or degradation.
  """

  @type trend_analysis :: %{
    direction: :improving | :stable | :degrading,
    velocity: float(),
    volatility: float(),
    recent_events: [rating_event()],
    prediction: predicted_rating()
  }

  @type rating_event :: %{
    timestamp: DateTime.t(),
    score: integer(),
    cause: atom(),
    impact: float()
  }

  @type predicted_rating :: %{
    score_in_30_days: integer(),
    confidence: float(),
    factors: [prediction_factor()]
  }

  def analyze_trends(domain, current_score) do
    historical_ratings = fetch_historical_ratings(domain)

    case length(historical_ratings) do
      n when n < 5 ->
        # Insufficient data for trend analysis
        %{
          direction: :unknown,
          velocity: 0.0,
          volatility: 0.0,
          recent_events: [],
          prediction: %{score_in_30_days: current_score, confidence: 0.1, factors: []}
        }

      _ ->
        perform_comprehensive_trend_analysis(historical_ratings, current_score)
    end
  end

  defp perform_comprehensive_trend_analysis(ratings, current_score) do
    # Sort by timestamp
    sorted_ratings = Enum.sort_by(ratings, & &1.timestamp, DateTime)

    # Calculate trend direction using linear regression
    {slope, _intercept} = calculate_linear_trend(sorted_ratings)
    direction = determine_trend_direction(slope)

    # Calculate velocity (change per day)
    velocity = calculate_trend_velocity(sorted_ratings)

    # Calculate volatility (standard deviation of changes)
    volatility = calculate_score_volatility(sorted_ratings)

    # Identify significant events
    events = identify_rating_events(sorted_ratings)

    # Predict future score
    prediction = predict_future_rating(sorted_ratings, current_score)

    %{
      direction: direction,
      velocity: velocity,
      volatility: volatility,
      recent_events: Enum.take(events, 5),
      prediction: prediction
    }
  end

  defp calculate_linear_trend(ratings) do
    n = length(ratings)

    # Convert timestamps to days since first rating
    first_timestamp = List.first(ratings).timestamp

    points = Enum.with_index(ratings)
             |> Enum.map(fn {rating, index} ->
               days_elapsed = DateTime.diff(rating.timestamp, first_timestamp) / 86400
               {days_elapsed, rating.score}
             end)

    # Calculate linear regression
    sum_x = Enum.sum(Enum.map(points, &elem(&1, 0)))
    sum_y = Enum.sum(Enum.map(points, &elem(&1, 1)))
    sum_xy = Enum.sum(Enum.map(points, fn {x, y} -> x * y end))
    sum_x2 = Enum.sum(Enum.map(points, fn {x, _y} -> x * x end))

    slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x * sum_x)
    intercept = (sum_y - slope * sum_x) / n

    {slope, intercept}
  end

  defp determine_trend_direction(slope) do
    cond do
      slope > 2.0 -> :improving
      slope < -2.0 -> :degrading
      true -> :stable
    end
  end

  defp identify_rating_events(ratings) do
    # Look for significant jumps or drops in rating
    ratings
    |> Enum.chunk_every(2, 1, :discard)
    |> Enum.map(fn [prev, curr] ->
      change = curr.score - prev.score

      if abs(change) >= 50 do
        %{
          timestamp: curr.timestamp,
          score: curr.score,
          cause: classify_rating_change(change, prev, curr),
          impact: abs(change) / prev.score
        }
      else
        nil
      end
    end)
    |> Enum.reject(&is_nil/1)
  end

  defp classify_rating_change(change, prev_rating, curr_rating) do
    cond do
      change > 100 -> :major_improvement
      change > 50 -> :improvement
      change < -100 -> :major_incident
      change < -50 -> :security_incident
      true -> :minor_change
    end
  end

  defp predict_future_rating(ratings, current_score) do
    # Simple linear extrapolation for 30-day prediction
    {slope, _intercept} = calculate_linear_trend(ratings)

    predicted_score = round(current_score + (slope * 30))

    # Confidence based on historical accuracy and volatility
    volatility = calculate_score_volatility(ratings)
    confidence = max(0.1, min(0.9, 1.0 - (volatility / 100)))

    # Identify factors that might affect future rating
    factors = identify_prediction_factors(ratings)

    %{
      score_in_30_days: max(300, min(900, predicted_score)),
      confidence: Float.round(confidence, 2),
      factors: factors
    }
  end

  defp identify_prediction_factors(ratings) do
    recent_ratings = Enum.take(ratings, -10)

    factors = []

    # Check for seasonal patterns
    factors = if has_seasonal_pattern?(recent_ratings) do
      [:seasonal_variation | factors]
    else
      factors
    end

    # Check for improvement/degradation patterns
    factors = case analyze_recent_pattern(recent_ratings) do
      :consistent_improvement -> [:ongoing_improvements | factors]
      :consistent_degradation -> [:ongoing_degradation | factors]
      _ -> factors
    end

    factors
  end

  defp has_seasonal_pattern?(ratings) do
    # Simple heuristic: look for cyclical patterns in monthly data
    false  # Placeholder - would implement proper seasonal analysis
  end

  defp analyze_recent_pattern(ratings) do
    if length(ratings) < 5 do
      :insufficient_data
    else
      changes = ratings
                |> Enum.chunk_every(2, 1, :discard)
                |> Enum.map(fn [prev, curr] -> curr.score - prev.score end)

      positive_changes = Enum.count(changes, &(&1 > 0))
      negative_changes = Enum.count(changes, &(&1 < 0))

      cond do
        positive_changes >= length(changes) * 0.7 -> :consistent_improvement
        negative_changes >= length(changes) * 0.7 -> :consistent_degradation
        true -> :mixed_pattern
      end
    end
  end
end

defmodule PrismaticPerimeter.Rating.BenchmarkingEngine do
  @moduledoc """
  Provides industry benchmarking and comparative analysis for security ratings.
  """

  @type benchmark_result :: %{
    industry_avg: float(),
    percentile: integer(),
    peer_comparison: [peer_comparison()],
    improvement_recommendations: [recommendation()]
  }

  @type peer_comparison :: %{
    organization_size: atom(),
    industry_sector: String.t(),
    average_score: float(),
    score_range: {integer(), integer()},
    sample_size: integer()
  }

  @type recommendation :: %{
    priority: :high | :medium | :low,
    category: atom(),
    description: String.t(),
    estimated_impact: integer(),
    implementation_effort: :low | :medium | :high
  }

  def generate_benchmark_report(domain, current_rating) do
    organization_profile = analyze_organization_profile(domain)

    %{
      industry_avg: calculate_industry_average(organization_profile.sector),
      percentile: current_rating.industry_percentile,
      peer_comparison: generate_peer_comparisons(organization_profile, current_rating.score),
      improvement_recommendations: generate_improvement_recommendations(current_rating)
    }
  end

  defp analyze_organization_profile(domain) do
    # Analyze organization characteristics from external data
    %{
      sector: classify_industry_sector(domain),
      size: estimate_organization_size(domain),
      geographic_region: determine_geographic_region(domain)
    }
  end

  defp classify_industry_sector(domain) do
    # Use domain name, whois data, and other indicators to classify
    cond do
      String.contains?(domain, "bank") or String.contains?(domain, "financial") -> "Financial Services"
      String.contains?(domain, "health") or String.contains?(domain, "medical") -> "Healthcare"
      String.contains?(domain, "edu") -> "Education"
      String.contains?(domain, "gov") -> "Government"
      true -> "Technology"  # Default classification
    end
  end

  defp generate_improvement_recommendations(rating) do
    recommendations = []

    # Analyze each dimension and generate specific recommendations
    recommendations = recommendations ++ analyze_vulnerability_dimension(rating.dimensions.vulnerabilities)
    recommendations = recommendations ++ analyze_tls_dimension(rating.dimensions.tls_configuration)
    recommendations = recommendations ++ analyze_dns_dimension(rating.dimensions.dns_security)

    # Sort by priority and estimated impact
    Enum.sort_by(recommendations, fn rec ->
      {priority_weight(rec.priority), -rec.estimated_impact}
    end)
  end

  defp analyze_vulnerability_dimension(vuln_dimension) do
    recommendations = []

    if vuln_dimension.score < 70 do
      recommendations = [%{
        priority: :high,
        category: :vulnerability_management,
        description: "Implement automated vulnerability scanning and establish regular patching cadence",
        estimated_impact: 30,
        implementation_effort: :medium
      } | recommendations]
    end

    if vuln_dimension.score < 50 do
      recommendations = [%{
        priority: :high,
        category: :critical_vulnerabilities,
        description: "Address critical and high-severity vulnerabilities immediately",
        estimated_impact: 50,
        implementation_effort: :high
      } | recommendations]
    end

    recommendations
  end

  defp priority_weight(:high), do: 1
  defp priority_weight(:medium), do: 2
  defp priority_weight(:low), do: 3
end
    last_updated: DateTime.t()
  }

  @type dimension_score :: %{
    dimension: atom(),
    score: float(),
    weight: float(),
    evidence: [evidence_item()],
    confidence: float()
  }

  @type evidence_item :: %{
    source: String.t(),
    finding: String.t(),
    severity: :critical | :high | :medium | :low | :info,
    timestamp: DateTime.t(),
    confidence: float()
  }

  @dimensions [
    %{name: :network_security, weight: 0.20, sources: [:shodan, :censys, :nmap]},
    %{name: :patching_cadence, weight: 0.15, sources: [:cve_scan, :version_detection]},
    %{name: :dns_health, weight: 0.10, sources: [:dns_enumeration, :spf_dkim_dmarc]},
    %{name: :certificate_management, weight: 0.15, sources: [:cert_transparency, :ssl_scan]},
    %{name: :application_security, weight: 0.15, sources: [:header_analysis, :waf_detection]},
    %{name: :email_security, weight: 0.10, sources: [:spf, :dkim, :dmarc, :bimi]},
    %{name: :reputation, weight: 0.05, sources: [:greynoise, :abuseipdb]},
    %{name: :compliance, weight: 0.10, sources: [:nis2_check, :zkb_check]}
  ]

  @spec compute(String.t(), [evidence_item()]) :: {:ok, rating()} | {:error, term()}
  def compute(domain, evidence) do
    dimension_scores =
      @dimensions
      |> Enum.map(fn dim ->
        relevant_evidence = filter_evidence(evidence, dim.sources)
        score = calculate_dimension_score(relevant_evidence)
        confidence = calculate_confidence(relevant_evidence)

        {dim.name, %{
          dimension: dim.name,
          score: score,
          weight: dim.weight,
          evidence: relevant_evidence,
          confidence: confidence
        }}
      end)
      |> Map.new()

    weighted_score = calculate_weighted_score(dimension_scores)
    grade = score_to_grade(weighted_score)
    overall_confidence = calculate_overall_confidence(dimension_scores)

    {:ok, %{
      grade: grade,
      score: round(weighted_score),
      confidence: overall_confidence,
      industry_percentile: calculate_percentile(weighted_score),
      dimensions: dimension_scores,
      evidence_count: length(evidence),
      last_updated: DateTime.utc_now()
    }}
  end

  defp score_to_grade(score) when score >= 800, do: :A
  defp score_to_grade(score) when score >= 700, do: :B
  defp score_to_grade(score) when score >= 600, do: :C
  defp score_to_grade(score) when score >= 500, do: :D
  defp score_to_grade(_score), do: :F

  defp calculate_weighted_score(dimension_scores) do
    dimension_scores
    |> Enum.map(fn {_name, dim} -> dim.score * dim.weight end)
    |> Enum.sum()
    |> max(300)
    |> min(900)
  end
end
```

### Evidence Collection Pipeline

Security ratings require evidence from multiple independent sources, enforcing the NABLA Infinity signal plurality axiom:

```elixir
defmodule PrismaticPerimeter.Rating.EvidenceCollector do
  @moduledoc """
  Collects evidence from multiple sources for rating computation.
  Enforces signal plurality - minimum 2 independent sources per dimension.
  """

  @spec collect(String.t()) :: {:ok, [evidence_item()]} | {:error, term()}
  def collect(domain) do
    collectors = [
      {&collect_dns_evidence/1, :dns},
      {&collect_certificate_evidence/1, :certificates},
      {&collect_network_evidence/1, :network},
      {&collect_application_evidence/1, :application},
      {&collect_email_evidence/1, :email},
      {&collect_reputation_evidence/1, :reputation},
      {&collect_compliance_evidence/1, :compliance}
    ]

    results =
      collectors
      |> Task.async_stream(fn {collector, _type} -> collector.(domain) end,
           max_concurrency: 4,
           timeout: 30_000)
      |> Enum.flat_map(fn
        {:ok, {:ok, evidence}} -> evidence
        {:ok, {:error, _reason}} -> []
        {:exit, _reason} -> []
      end)

    # Enforce signal plurality
    if adequate_signal_plurality?(results) do
      {:ok, results}
    else
      {:error, :insufficient_signal_plurality}
    end
  end

  defp adequate_signal_plurality?(evidence) do
    sources = evidence |> Enum.map(& &1.source) |> Enum.uniq()
    length(sources) >= 2
  end
end
```

### Confidence Scoring

Every rating includes a confidence level indicating how reliable the assessment is, based on evidence quantity, quality, and freshness:

```elixir
defmodule PrismaticPerimeter.Rating.ConfidenceCalculator do
  @moduledoc """
  Calculates confidence levels for security ratings based on
  evidence quality, quantity, freshness, and source independence.
  """

  @spec calculate(list()) :: float()
  def calculate(evidence) do
    quantity_factor = quantity_confidence(length(evidence))
    freshness_factor = freshness_confidence(evidence)
    independence_factor = source_independence(evidence)

    (quantity_factor * 0.3 + freshness_factor * 0.3 + independence_factor * 0.4)
    |> Float.round(3)
    |> max(0.0)
    |> min(1.0)
  end

  defp quantity_confidence(count) when count >= 50, do: 1.0
  defp quantity_confidence(count) when count >= 20, do: 0.8
  defp quantity_confidence(count) when count >= 10, do: 0.6
  defp quantity_confidence(count) when count >= 5, do: 0.4
  defp quantity_confidence(_count), do: 0.2

  defp freshness_confidence(evidence) do
    now = DateTime.utc_now()

    evidence
    |> Enum.map(fn e ->
      age_hours = DateTime.diff(now, e.timestamp, :hour)
      cond do
        age_hours < 24 -> 1.0
        age_hours < 168 -> 0.8
        age_hours < 720 -> 0.5
        true -> 0.2
      end
    end)
    |> then(fn scores -> Enum.sum(scores) / max(length(scores), 1) end)
  end
end
```

## Architecture and Implementation

### Rating Dimensions

Each dimension evaluates a specific aspect of the external security posture:

| Dimension | Weight | Evidence Sources | Key Indicators |
|-----------|--------|-----------------|----------------|
| Network Security | 20% | Shodan, Censys, Nmap | Open ports, exposed services, firewall posture |
| Patching Cadence | 15% | CVE scan, version detection | Time-to-patch, known vulnerabilities, EOL software |
| DNS Health | 10% | DNS enumeration, SPF/DKIM/DMARC | Zone security, DNSSEC, mail authentication |
| Certificate Mgmt | 15% | CT logs, SSL scan | Expiry, chain validity, key strength, HSTS |
| Application Security | 15% | Header analysis, WAF detection | Security headers, CSP, WAF presence |
| Email Security | 10% | SPF, DKIM, DMARC, BIMI | Mail authentication, spoofing protection |
| Reputation | 5% | GreyNoise, AbuseIPDB | IP reputation, abuse reports, blocklisting |
| Compliance | 10% | NIS2, ZKB checks | Regulatory compliance posture |

### Compliance Integration

Security ratings integrate NIS2 and ZKB compliance posture directly into the scoring model:

```elixir
defmodule PrismaticPerimeter.Rating.ComplianceIntegration do
  @moduledoc """
  Integrates NIS2 and ZKB compliance assessment into security ratings.
  Compliance posture affects the overall rating score.
  """

  @spec assess_compliance(String.t(), [atom()]) :: {:ok, compliance_result()} | {:error, term()}
  def assess_compliance(domain, frameworks) do
    results =
      Enum.map(frameworks, fn
        :nis2 -> {assess_nis2(domain), :nis2}
        :zkb -> {assess_zkb(domain), :zkb}
      end)

    compliance_score =
      results
      |> Enum.map(fn {{:ok, result}, _framework} -> result.score end)
      |> then(fn scores -> Enum.sum(scores) / max(length(scores), 1) end)

    {:ok, %{
      frameworks: Map.new(results, fn {{:ok, r}, f} -> {f, r} end),
      overall_compliance_score: compliance_score,
      gaps: extract_gaps(results),
      recommendations: generate_recommendations(results)
    }}
  end
end
```

## Usage in Prismatic Platform

### API Usage

```elixir
# Discover attack surface and compute rating
{:ok, surface} = PrismaticPerimeter.discover("example.com")

# Get security rating
{:ok, rating} = PrismaticPerimeter.security_rating("example.com")
# => %{grade: :B, score: 780, industry_percentile: 72, confidence: 0.85}

# Assess compliance alongside rating
{:ok, assessment} = PrismaticPerimeter.assess_compliance("example.com", [:nis2, :zkb])
```

### Dashboard Routes

| Route | Purpose |
|-------|---------|
| `/perimeter` | Main dashboard with rating overview |
| `/perimeter/assets` | Asset inventory with security scores |
| `/perimeter/compliance` | Detailed compliance assessment |
| `/perimeter/easm` | Advanced EASM dashboard |

## Best Practices

1. **Treat ratings as indicators, not absolutes**. A security rating summarizes externally observable posture. Internal security controls, incident response capability, and security culture are not visible externally.

2. **Monitor rating trends, not snapshots**. A B-rated organization improving toward A is in better shape than an A-rated organization trending toward B.

3. **Always check confidence levels**. A rating with low confidence (< 0.6) has insufficient evidence for reliable assessment. Collect more evidence before making decisions based on the rating.

4. **Cross-reference multiple rating providers**. Different providers weight dimensions differently. Using Prismatic alongside BitSight or SecurityScorecard provides a more complete picture.

5. **Address critical findings first**. Focus on findings in the Network Security and Patching Cadence dimensions, which have the highest weight and represent the greatest risk.

## Common Pitfalls

- **Optimizing for the rating rather than security**: Organizations sometimes fix only the issues that affect their rating while ignoring internal security gaps. The rating is a proxy for security, not security itself.

- **Ignoring the compliance dimension**: For organizations subject to NIS2 or ZKB, the compliance dimension can significantly affect the overall rating. Address compliance gaps systematically.

- **Treating all dimensions equally**: Dimensions have different weights for a reason. A critical finding in Network Security (20% weight) has four times the impact of a reputation issue (5% weight).

- **Not considering evidence freshness**: Stale evidence produces unreliable ratings. Ensure evidence collection runs regularly to maintain rating accuracy.

## Related Concepts

- [EASM](@/glossary/easm.md) -- The system producing security ratings through external scanning
- [NIS2 Directive](@/glossary/nis2.md) -- EU compliance factor influencing ratings
- [ZKB](@/glossary/zkb.md) -- Czech compliance factor influencing ratings
- [Signal Plurality](@/glossary/signal-plurality.md) -- NABLA axiom enforcing multi-source evidence
- [Confidence Threshold](@/glossary/confidence-threshold.md) -- Rating confidence methodology
- [HAWKEYE](@/glossary/hawkeye.md) -- Visitor intelligence contributing to security posture
- [Risk Score](@/glossary/risk-score.md) -- Per-finding risk quantification within rating dimensions

## See Also

- [prismatic_perimeter](../../../apps/prismatic_perimeter/README.md) -- EASM application producing A-F security ratings
- [prismatic_perimeter_core](../../../apps/prismatic_perimeter_core/README.md) -- Rating engine core logic
- [prismatic_compliance](../../../apps/prismatic_compliance/README.md) -- Compliance assessment linked to security ratings
- [prismatic_osint_core](../../../apps/prismatic_osint_core/README.md) -- OSINT data feeding rating calculations
- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Apps](@/apps/_index.md) -- Application directory including Prismatic Perimeter

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)