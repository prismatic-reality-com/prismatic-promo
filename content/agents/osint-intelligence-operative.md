+++
title = "osint-intelligence-operative"
weight = 284
[extra]
domain = "tactical"
level = "L3"
description = "The OSINT Intelligence Operative conducts precision intelligence operations:"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "seadf", "telemetry", "osint"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2200
quality_score = 85
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["osint-intelligence-operative", "OSINT", "Intelligence", "Operative", "agents", "agent", "Prismatic Platform", "Days", "High"]
tags = ["agents", "agent", "osint-intelligence-operative", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "osint-intelligence-operative - Prismatic Platform"
+++

## Overview

The osint-intelligence-operative operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform's tactical domain, serving as the primary field agent for precision [OSINT](@/glossary/osint.md) intelligence operations. This agent conducts targeted intelligence collection missions that require coordinated use of multiple OSINT capabilities -- search engines, digital profiling, entity resolution, and source correlation -- to answer specific intelligence questions with actionable, evidence-backed findings. Where specialist agents focus on individual collection disciplines, the operative synthesizes across disciplines to produce complete intelligence products.

Built on the [AIAD](@/glossary/aiad.md) standard, the intelligence operative follows a structured intelligence cycle: requirements definition, collection planning, source exploitation, processing and analysis, production, and dissemination. The [NO MERCY](@/glossary/no-mercy.md) doctrine governs operational standards: every intelligence product must include sourcing, confidence assessment, and analytical limitations. The [NO DOUBTS](@/glossary/no-doubts.md) principle requires that operational findings are distinguished from analytical judgments.

## Operational Domain

The tactical OSINT domain covers the execution of intelligence operations that span multiple collection disciplines and require coordinated multi-source analysis. Operations range from focused entity investigations (individual or corporate profiling) through thematic intelligence collection (industry analysis, threat landscape mapping) to counter-intelligence assessments (identifying information exposure and vulnerability). The operative maintains operational security awareness, ensuring that intelligence collection activities do not reveal investigation targets or compromise source access.

| Operation Type | Duration | Sources | Output |
|---------------|----------|---------|--------|
| Quick Reconnaissance | Minutes to hours | 2-3 primary sources | Situation briefing |
| Entity Investigation | Hours to days | 5-10 sources | Comprehensive profile |
| Network Mapping | Days to weeks | 10+ sources | Relationship graph |
| Threat Assessment | Days | 5-8 sources | Risk intelligence report |
| Due Diligence | Days to weeks | 8-15 sources | Compliance report |
| Counter-Intelligence | Hours to days | 3-5 sources | Exposure assessment |

## Key Capabilities

- **Intelligence cycle execution** -- Manages the complete OSINT intelligence cycle from requirements gathering through collection planning, source exploitation, analysis, and production to dissemination of finished intelligence products
- **Multi-source correlation** -- Synthesizes intelligence from diverse OSINT sources (search engines, social media, public records, domain data, code repositories) into coherent analytical narratives with source weighting
- **Collection planning** -- Develops optimized collection strategies that identify the most productive sources for specific intelligence requirements, minimizing collection time while maximizing coverage
- **Operational security** -- Maintains awareness of operational signatures that could reveal collection activities or investigation targets, implementing counter-detection measures in source exploitation
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with self-directed collection cycles that adapt based on emerging findings
- **[Telemetry integration](@/capabilities/telemetry-integration.md)** publishing operation metrics, source utilization, and intelligence production statistics

## Intelligence Operation Framework

```elixir
defmodule Prismatic.OSINT.IntelligenceOperative do
  @moduledoc """
  Conducts precision OSINT intelligence operations following
  a structured intelligence cycle with multi-source correlation.
  """

  alias Prismatic.OSINT.{CollectionPlanner, SourceExploiter, Analyst, ProductionEngine}

  @type operation :: %{
    id: String.t(),
    type: atom(),
    requirements: [requirement()],
    collection_plan: collection_plan(),
    findings: [finding()],
    status: :planning | :collecting | :analyzing | :producing | :complete
  }

  @spec execute_operation(requirements :: [requirement()]) :: {:ok, intel_product()} | {:error, term()}
  def execute_operation(requirements) do
    operation = %{
      id: Ecto.UUID.generate(),
      type: classify_operation(requirements),
      requirements: requirements,
      status: :planning
    }

    with {:ok, plan} <- CollectionPlanner.develop(requirements),
         {:ok, collected} <- execute_collection(plan),
         {:ok, analyzed} <- Analyst.correlate_and_assess(collected),
         {:ok, product} <- ProductionEngine.produce(analyzed, requirements) do
      emit_operation_telemetry(operation, product)
      {:ok, product}
    end
  end

  defp execute_collection(plan) do
    results =
      plan.sources
      |> Task.async_stream(fn source ->
        SourceExploiter.exploit(source, plan.queries)
      end, timeout: 60_000, max_concurrency: 5)
      |> Enum.flat_map(fn
        {:ok, {:ok, data}} -> data
        _ -> []
      end)

    {:ok, %{raw_data: results, sources_queried: length(plan.sources)}}
  end

  defp classify_operation(requirements) do
    cond do
      Enum.any?(requirements, &(&1.type == :entity_profile)) -> :investigation
      Enum.any?(requirements, &(&1.type == :network_map)) -> :network_mapping
      Enum.any?(requirements, &(&1.type == :risk_assessment)) -> :threat_assessment
      true -> :general_collection
    end
  end
end
```

## Intelligence Product Standards

| Product Type | Structure | Confidence Requirement |
|-------------|-----------|----------------------|
| Situation Briefing | Executive summary + key findings | Moderate (0.6+) for each finding |
| Entity Profile | Structured profile with sourced attributes | High (0.75+) for identity claims |
| Network Analysis | Graph visualization + relationship table | Moderate (0.6+) for each link |
| Risk Assessment | Risk matrix + evidence table | High (0.8+) for risk ratings |
| Due Diligence Report | Comprehensive sections with findings | High (0.8+) for compliance claims |

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination with authority to orchestrate multi-discipline OSINT operations and produce finished intelligence products.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/osint investigate` | Launch targeted OSINT investigation on specified entity | L3+ |
| `/osint recon` | Execute quick reconnaissance sweep for initial assessment | L3+ |
| `/osint report` | Generate finished intelligence product from collected data | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [osint-engines-specialist](@/agents/osint-engines-specialist.md) | Provides multi-engine search capability for collection operations |
| [osint-digital-profile-specialist](@/agents/osint-digital-profile-specialist.md) | Supplies digital profiling capability for entity investigations |
| [osint-legal-economic-risk-specialist](@/agents/osint-legal-economic-risk-specialist.md) | Provides legal and economic risk analysis for due diligence operations |
| [risk-intelligence-commander](@/agents/risk-intelligence-commander.md) | Receives intelligence products for strategic risk assessment |

## SEADF Integration

The intelligence operative operates within the [SEADF](@/glossary/seadf.md) evolutionary framework, where operational effectiveness metrics (collection success rates, analysis accuracy, product timeliness) feed back into evolutionary optimization. Successful operational patterns are propagated through the [mycelial network](@/glossary/mycelial-network.md) to improve collection strategies across the OSINT agent ecosystem.

## Intelligence Cycle Methodology

The osint-intelligence-operative follows a rigorous intelligence cycle that structures each operation from initial requirement through final product delivery. This cycle ensures systematic coverage and prevents the analytical biases that can emerge from unstructured collection.

### Requirements Definition

Every operation begins with explicit requirements definition. Requirements specify the intelligence question to be answered (not the collection activities to be performed), the confidence threshold required for the answer, the time sensitivity of the intelligence, and the intended consumer of the final product. Well-defined requirements prevent scope creep and ensure that collection activities remain focused on answering the specific question rather than gathering information broadly.

### Collection Planning

The collection plan identifies which sources will be exploited, in what order, and with what priority. The operative builds collection matrices that map intelligence requirements to available sources, identifying the most productive sources for each requirement. Collection is planned in phases: initial broad collection to establish baseline awareness, followed by targeted deep collection on areas where initial results indicate high-value intelligence potential. Each phase has defined completion criteria that determine when to proceed to the next phase.

### Source Exploitation

Source exploitation involves querying identified sources using optimized techniques. The operative coordinates with specialist agents -- the [osint-engines-specialist](@/agents/osint-engines-specialist.md) for search engine queries, the [osint-digital-profile-specialist](@/agents/osint-digital-profile-specialist.md) for entity profiling, and the [municipal-court-specialist](@/agents/municipal-court-specialist.md) for legal record searches. Exploitation follows operational security protocols that prevent collection activities from alerting targets or compromising source access.

### Analysis and Production

Collected data undergoes structured analysis that separates factual observations from analytical judgments. The operative identifies patterns, correlations, and gaps in the collected data, producing analytical conclusions that explicitly state their supporting evidence and confidence levels. The final intelligence product is formatted according to the standards specified in the requirements, with clear source attribution and analytical limitations sections.

## Analytical Tradecraft

The operative applies established intelligence analytical tradecraft to prevent cognitive biases from compromising intelligence quality. Key techniques include Analysis of Competing Hypotheses (ACH) for evaluating alternative explanations of observed data, Structured Analytic Techniques (SATs) for systematic evaluation of complex scenarios, and Devil's Advocacy for stress-testing preferred conclusions. These techniques are particularly important for high-stakes intelligence products such as due diligence reports and risk assessments where analytical errors could have significant business consequences.

The operative also maintains a "knowledge gap register" for each operation -- a structured record of information that was sought but not found, information that was found but contradictory, and questions that emerged during analysis but could not be answered with available sources. This register is included in the intelligence product to give consumers full awareness of what is known, what is unknown, and what remains uncertain.

## Enforcement

All intelligence operations comply with the [NO MERCY](@/glossary/no-mercy.md) doctrine: no intelligence product is published without complete sourcing and confidence assessments, analytical limitations are always stated explicitly, and the distinction between fact and analytical judgment is maintained throughout all products. The [NO DOUBTS](@/glossary/no-doubts.md) principle requires evidence-based assessments with [NABLA Infinity](@/glossary/nabla-infinity.md) provenance chains for every factual claim.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)