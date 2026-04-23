+++
title = "Triage"
weight = 50
[extra]
description = "Incident response prioritization process that classifies and ranks issues by severity, impact, and urgency for efficient resolution"
category = "security"
related_terms = ["incident-response", "severity", "alert", "monitoring"]
complexity_level = "intermediate"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["triage", "incident response", "prioritization", "severity classification", "security operations", "glossary", "Prismatic Platform"]
tags = ["glossary", "security"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Triage - Prismatic Platform"
+++

## Definition & Overview

Triage is the systematic process of evaluating, classifying, and prioritizing incidents, alerts, or issues based on their severity, impact, and urgency. Borrowed from medical emergency response where patients are sorted by the immediacy of their need for treatment, triage in software systems ensures that limited response capacity is directed toward the most critical issues first. Effective triage prevents resource waste on low-priority noise while ensuring that critical problems receive immediate attention.

In security operations, triage is the first step of incident response, transforming a stream of raw alerts into a prioritized queue of actionable items. The triage process evaluates each alert against multiple criteria: is it a true positive or false positive? What systems are affected? What data is at risk? Is the threat active or historical? What is the business impact? This multi-dimensional assessment produces a severity classification that determines the response timeline and escalation path.

The Prismatic Platform applies triage principles across multiple domains. The Color-Team security operations use triage to prioritize findings from Red Team adversarial simulations, routing critical vulnerabilities to Blue Team defense before minor issues. The Quality Floor Guardian triages quality violations by severity level, with L4 violations triggering immediate escalation while L1 violations receive standard correction. The OSINT toolbox triages intelligence signals by confidence and relevance, ensuring high-confidence findings surface before unverified data.

## Technical Deep Dive

The platform's triage system uses a multi-factor scoring model that combines severity, impact, and urgency into a unified priority score:

```elixir
defmodule PrismaticSecurity.Triage do
  @moduledoc """
  Multi-factor incident triage system with configurable
  scoring weights and automatic escalation.
  """

  @type severity :: :critical | :high | :medium | :low | :info
  @type impact :: :widespread | :significant | :moderate | :limited | :minimal
  @type urgency :: :immediate | :urgent | :standard | :low | :planned

  @type triage_result :: %{
    priority_score: float(),
    severity: severity(),
    impact: impact(),
    urgency: urgency(),
    classification: :p0 | :p1 | :p2 | :p3 | :p4,
    response_sla_minutes: pos_integer(),
    escalation_path: [String.t()]
  }

  @severity_weights %{
    critical: 100, high: 75, medium: 50, low: 25, info: 5
  }

  @impact_weights %{
    widespread: 100, significant: 75, moderate: 50, limited: 25, minimal: 5
  }

  @urgency_weights %{
    immediate: 100, urgent: 75, standard: 50, low: 25, planned: 5
  }

  @spec triage(map()) :: {:ok, triage_result()}
  def triage(%{severity: severity, impact: impact, urgency: urgency} = incident) do
    severity_score = Map.fetch!(@severity_weights, severity)
    impact_score = Map.fetch!(@impact_weights, impact)
    urgency_score = Map.fetch!(@urgency_weights, urgency)

    priority_score = severity_score * 0.4 + impact_score * 0.35 + urgency_score * 0.25

    classification = classify_priority(priority_score)
    sla = response_sla(classification)
    escalation = escalation_path(classification, incident)

    result = %{
      priority_score: Float.round(priority_score, 1),
      severity: severity,
      impact: impact,
      urgency: urgency,
      classification: classification,
      response_sla_minutes: sla,
      escalation_path: escalation,
      triaged_at: DateTime.utc_now()
    }

    :telemetry.execute(
      [:prismatic, :security, :triage, :complete],
      %{priority_score: priority_score},
      %{classification: classification, severity: severity}
    )

    {:ok, result}
  end

  defp classify_priority(score) when score >= 85, do: :p0
  defp classify_priority(score) when score >= 65, do: :p1
  defp classify_priority(score) when score >= 45, do: :p2
  defp classify_priority(score) when score >= 25, do: :p3
  defp classify_priority(_score), do: :p4

  defp response_sla(:p0), do: 15
  defp response_sla(:p1), do: 60
  defp response_sla(:p2), do: 240
  defp response_sla(:p3), do: 1_440
  defp response_sla(:p4), do: 10_080

  defp escalation_path(:p0, _), do: ["on-call", "team-lead", "cto"]
  defp escalation_path(:p1, _), do: ["on-call", "team-lead"]
  defp escalation_path(:p2, _), do: ["assigned-engineer"]
  defp escalation_path(_, _), do: ["backlog"]
end
```

The triage system also handles batch processing for alert storms where many alerts arrive simultaneously:

```elixir
defmodule PrismaticSecurity.BatchTriage do
  @moduledoc """
  Batch triage for alert storms, with deduplication
  and correlation before individual classification.
  """

  alias PrismaticSecurity.Triage

  @spec triage_batch([map()]) :: %{classified: map(), deduplicated: non_neg_integer()}
  def triage_batch(alerts) do
    deduplicated = deduplicate(alerts)

    classified =
      deduplicated
      |> Enum.map(fn alert ->
        {:ok, result} = Triage.triage(alert)
        {alert, result}
      end)
      |> Enum.sort_by(fn {_, result} -> -result.priority_score end)
      |> Enum.group_by(fn {_, result} -> result.classification end)

    %{
      classified: classified,
      deduplicated: length(alerts) - length(deduplicated),
      total_processed: length(deduplicated)
    }
  end

  defp deduplicate(alerts) do
    alerts
    |> Enum.uniq_by(fn alert ->
      {alert[:source], alert[:type], alert[:target]}
    end)
  end
end
```

## Architecture & Implementation

Triage in the Prismatic Platform operates through a multi-stage pipeline:

**Alert Ingestion**: Raw alerts from monitoring systems, security scanners, quality gates, and OSINT tools flow into a centralized alert queue. Each alert carries metadata about its source, type, and raw severity assessment.

**Enrichment**: Before triage scoring, alerts are enriched with contextual information. An alert about a failed quality gate is enriched with the specific domain, current score, and historical trend. A security alert is enriched with asset criticality and exposure data from the Perimeter module.

**Classification**: The enriched alert passes through the multi-factor scoring model, producing a priority classification (P0 through P4) with associated SLAs and escalation paths.

**Routing**: Classified alerts are routed to appropriate response channels. P0 alerts trigger immediate notification. P1-P2 alerts enter the active response queue. P3-P4 alerts are added to the backlog for scheduled resolution.

The Color-Team security operations integrate triage at every handoff point. Red Team findings are triaged before being passed to Purple Team for synthesis. Blue Team defensive gaps are triaged to prioritize which defenses to strengthen first. This ensures that the adversarial-defensive cycle focuses on the highest-impact vulnerabilities.

## Usage in Prismatic Platform

The Quality Floor Guardian uses triage to prioritize quality violations detected during pre-commit checks:

```elixir
defmodule PrismaticSafety.QualityTriage do
  @moduledoc """
  Triages quality violations detected by pre-commit hooks
  and quality gates, routing to appropriate handlers.
  """

  @spec triage_violation(map()) :: {:ok, map()}
  def triage_violation(%{domain: domain, violation_type: type} = violation) do
    severity = domain_severity(domain)
    impact = violation_impact(type)

    PrismaticSecurity.Triage.triage(%{
      severity: severity,
      impact: impact,
      urgency: :immediate,
      source: :quality_gate,
      details: violation
    })
  end

  defp domain_severity(:dialyzer), do: :high
  defp domain_severity(:compilation), do: :critical
  defp domain_severity(:memory_safety), do: :critical
  defp domain_severity(:credo), do: :medium
  defp domain_severity(_), do: :low

  defp violation_impact(:new_violation), do: :significant
  defp violation_impact(:regression), do: :widespread
  defp violation_impact(:warning), do: :moderate
  defp violation_impact(_), do: :limited
end
```

The triage system ensures that the platform's NO MERCY doctrine is enforced proportionally, with the most severe violations receiving the most immediate and forceful response, while minor deviations receive appropriate but measured correction.

## Cross-References

- [Incident Response](@/glossary/incident-response.md) - Full response lifecycle
- [Monitoring](@/glossary/monitoring.md) - Alert source systems
- **Severity** - Classification levels
- [Throttling](@/glossary/throttling.md) - Rate control during incident response
- [Trace](@/glossary/trace.md) - Request tracking for incident investigation

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
