+++
title = "osint-legal-economic-risk-specialist"
weight = 285
[extra]
domain = "osint"
level = "L3"
description = "5 Core Lean4 theorems guaranteeing safe evolution"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["osint", "easm", "entity-resolution", "nabla-infinity", "trinity-gate", "aiad", "garden", "kuzudb", "attack-surface", "no-doubts"]
domain_normalized = "osint"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2200
quality_score = 85
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["osint-legal-economic-risk-specialist", "Core", "Lean4", "agents", "agent", "Prismatic Platform", "Multi", "OSINT", "Sanctions", "Strategic Command"]
tags = ["agents", "agent", "osint-legal-economic-risk-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "osint-legal-economic-risk-specialist - Prismatic Platform"
+++

## Overview

The osint-legal-economic-risk-specialist operates as an L3 [Strategic Command](/glossary/strategic-command/) authority within the Prismatic Platform's [OSINT](/glossary/osint/) domain, responsible for assessing legal and economic risks associated with target entities through systematic analysis of publicly available legal records, financial filings, regulatory actions, and economic indicators. This agent bridges the gap between raw OSINT collection and actionable risk intelligence by applying structured analytical frameworks to legal and economic data, producing risk scores, compliance assessments, and due diligence reports that inform business decisions.

Built on the [AIAD](/glossary/aiad/) standard and integrated with the platform's [entity resolution](/glossary/entity-resolution/) engine, the legal-economic risk specialist correlates legal findings across jurisdictions, tracks financial exposure patterns, and maps regulatory compliance postures. All risk assessments comply with [NABLA Infinity](/glossary/nabla-infinity/) axioms: every risk rating requires evidence from multiple independent sources, and all confidence scores pass [Trinity Gate](/glossary/trinity-gate/) validation before publication.

## Operational Domain

The legal-economic risk domain encompasses corporate legal standing, litigation history, regulatory enforcement actions, financial health indicators, sanctions and watchlist screening, and economic crime exposure. The agent processes data from company registries, court records, regulatory databases, sanctions lists, and financial disclosure repositories across multiple jurisdictions. Risk assessments are entity-centric, building comprehensive risk profiles that aggregate findings across all available legal and economic dimensions.

| Risk Dimension | Data Sources | Risk Indicators |
|---------------|-------------|-----------------|
| Litigation Risk | Court records, legal databases | Active lawsuits, judgment history, claim frequency |
| Regulatory Risk | Regulatory filings, enforcement actions | Fines, sanctions, compliance orders, license revocations |
| Financial Risk | Company registries, financial filings | Insolvency indicators, debt levels, audit opinions |
| Sanctions Exposure | OFAC, EU sanctions, UN lists | Direct/indirect matches, ownership chain exposure |
| Corporate Governance | Beneficial ownership, director records | Structure complexity, related-party transactions |
| Economic Crime | Criminal records, media reports | Fraud allegations, money laundering indicators |

## Key Capabilities

- **Multi-jurisdictional legal analysis** -- Searches and correlates legal records across multiple jurisdictions, mapping litigation patterns, judgment outcomes, and regulatory enforcement actions to build comprehensive legal risk profiles
- **Sanctions and watchlist screening** -- Screens entities against global sanctions lists (OFAC SDN, EU Consolidated, UN Security Council) and PEP databases, including fuzzy matching for name variations and transliterations
- **Financial health assessment** -- Analyzes publicly available financial data including company filings, credit indicators, and insolvency records to produce financial risk scores with trend analysis
- **Beneficial ownership mapping** -- Traces corporate ownership chains through multiple layers to identify ultimate beneficial owners, shell company structures, and potential concealment patterns
- **[Autonomous operation](/capabilities/autonomous-self-healing/)** with self-directed risk monitoring and alert generation for entity portfolio changes
- **[Telemetry integration](/capabilities/telemetry-integration/)** publishing risk scoring metrics, screening volumes, and data source freshness indicators

## Risk Assessment Engine

```elixir
defmodule Prismatic.OSINT.LegalEconomicRisk do
  @moduledoc """
  Assesses legal and economic risks through multi-source
  OSINT analysis with quantified confidence scoring.
  """

  alias Prismatic.OSINT.{SanctionsScreener, LitigationAnalyzer, FinancialAssessor, OwnershipMapper}

  @type risk_assessment :: %{
    entity_id: String.t(),
    overall_risk: :low | :medium | :high | :critical,
    risk_score: float(),
    dimensions: map(),
    findings: [finding()],
    confidence: float(),
    assessed_at: DateTime.t()
  }

  @spec assess(String.t(), keyword()) :: {:ok, risk_assessment()} | {:error, term()}
  def assess(entity_id, opts \\ []) do
    jurisdiction = Keyword.get(opts, :jurisdiction, :all)

    dimensions =
      [
        Task.async(fn -> SanctionsScreener.screen(entity_id) end),
        Task.async(fn -> LitigationAnalyzer.analyze(entity_id, jurisdiction) end),
        Task.async(fn -> FinancialAssessor.evaluate(entity_id) end),
        Task.async(fn -> OwnershipMapper.trace(entity_id) end)
      ]
      |> Task.await_many(60_000)
      |> Enum.zip([:sanctions, :litigation, :financial, :ownership])
      |> Map.new(fn {result, key} -> {key, result} end)

    assessment = %{
      entity_id: entity_id,
      overall_risk: calculate_overall_risk(dimensions),
      risk_score: calculate_risk_score(dimensions),
      dimensions: dimensions,
      findings: extract_all_findings(dimensions),
      confidence: calculate_confidence(dimensions),
      assessed_at: DateTime.utc_now()
    }

    emit_assessment_telemetry(assessment)
    {:ok, assessment}
  end

  defp calculate_overall_risk(dimensions) do
    max_severity =
      dimensions
      |> Enum.map(fn {_key, {:ok, result}} -> result.severity end)
      |> Enum.max()

    case max_severity do
      s when s >= 0.9 -> :critical
      s when s >= 0.7 -> :high
      s when s >= 0.4 -> :medium
      _ -> :low
    end
  end
end
```

## Risk Scoring Framework

| Risk Level | Score Range | Interpretation | Action Required |
|-----------|-------------|---------------|-----------------|
| Critical | 0.90 - 1.00 | Immediate business risk, likely regulatory exposure | Escalate immediately, suspend engagement |
| High | 0.70 - 0.89 | Significant risk indicators requiring investigation | Detailed investigation, enhanced due diligence |
| Medium | 0.40 - 0.69 | Notable risk factors within acceptable bounds | Standard monitoring, periodic review |
| Low | 0.00 - 0.39 | Minimal identified risk indicators | Routine monitoring cycle |

## Authority Level

**L3** - [Strategic Command](/glossary/strategic-command/) - Multi-domain coordination with authority to produce entity risk assessments and trigger enhanced due diligence investigations.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/risk-legal assess` | Run comprehensive legal-economic risk assessment on entity | L3+ |
| `/risk-legal screen` | Screen entity against sanctions and watchlist databases | L3+ |
| `/risk-legal ownership` | Trace beneficial ownership chain for specified entity | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [osint-intelligence-operative](/agents/osint-intelligence-operative/) | Provides investigative support for detailed entity research |
| [municipal-court-specialist](/agents/municipal-court-specialist/) | Supplies Czech court data for jurisdiction-specific legal analysis |
| [risk-intelligence-commander](/agents/risk-intelligence-commander/) | Legal-economic risk feeds into strategic risk intelligence products |
| [regulatory-intelligence-commander](/agents/regulatory-intelligence-commander/) | Coordinates on regulatory compliance assessment methodologies |

## GARDEN and KuzuDB Integration

Legal and economic risk data is stored in [KuzuDB](/glossary/kuzudb/) graph structures, with entities, legal proceedings, regulatory actions, and ownership relationships represented as nodes and edges. This enables complex graph queries such as "find all entities within 2 hops of a sanctioned entity through ownership chains." The [GARDEN](/glossary/garden/) legacy knowledge base provides established patterns for multi-jurisdictional legal data processing refined over 20+ years of OSINT operations.

## Sanctions Screening Architecture

Sanctions screening represents one of the highest-stakes capabilities of the legal-economic risk specialist. A false negative (missing a sanctioned entity) can expose the platform's consumers to severe regulatory penalties, while a false positive (incorrectly flagging a legitimate entity) wastes investigative resources and may damage business relationships.

### Multi-List Coverage

The specialist screens against a comprehensive set of sanctions and watchlists including OFAC SDN (Specially Designated Nationals), EU Consolidated Sanctions List, UN Security Council Sanctions, UK HM Treasury Sanctions, FATF High-Risk Jurisdictions, and country-specific PEP (Politically Exposed Persons) databases. Each list has different update frequencies and data formats, requiring specialized parsers and synchronization schedules.

### Fuzzy Matching

Sanctions evasion frequently involves name variations, transliterations, and aliases. The specialist implements multi-algorithm fuzzy matching that combines Levenshtein distance, Jaro-Winkler similarity, phonetic matching (Soundex, Metaphone), and transliteration-aware comparison for names originating in non-Latin scripts. Matching thresholds are calibrated to minimize false negatives while maintaining manageable false positive rates: threshold settings are validated against benchmark datasets that include known evasion patterns.

### Beneficial Ownership Traversal

Direct name screening is insufficient because sanctioned entities frequently operate through corporate layers. The specialist traverses beneficial ownership chains stored in [KuzuDB](/glossary/kuzudb/) to identify entities that are indirectly connected to sanctioned persons or organizations through ownership, control, or directorship relationships. Traversal depth is configurable (typically 3-5 levels) and follows the regulatory guidance on "owned or controlled" definitions from relevant jurisdictions.

## Multi-Jurisdictional Analysis

The legal-economic risk specialist operates across multiple jurisdictions, each with different legal systems, court record availability, and regulatory frameworks. The specialist maintains jurisdiction profiles that document the available data sources, expected data quality, legal access constraints, and entity identification conventions for each supported jurisdiction. Currently supported jurisdictions include the Czech Republic (primary, with deep integration to InfoSoud and ISIR), EU member states (through company registry APIs), the United States (through SEC EDGAR and PACER), and the United Kingdom (through Companies House).

Cross-jurisdictional analysis is particularly valuable for identifying entities that structure operations across borders to exploit regulatory gaps. The specialist correlates entity registrations, director appointments, and litigation patterns across jurisdictions to identify networks of related entities that may not be apparent when analyzing any single jurisdiction in isolation.

## Enforcement

All risk assessments comply with the [NO MERCY](/glossary/no-mercy/) doctrine: no risk rating is published without meeting minimum evidence thresholds, critical findings trigger mandatory escalation, and risk scores are recalculated when new evidence emerges. The [NO DOUBTS](/glossary/no-doubts/) principle requires that every risk indicator is traceable to its source data with quantified confidence. The [Trinity Gate](/glossary/trinity-gate/) validates risk assessment consistency across all analyzed dimensions before publication.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)