+++
title = "corporate-governance-analyst"
weight = 99
[extra]
domain = "corporate"
level = "L3"
description = "Specialized intelligence gathering and analysis"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["osint", "entity-resolution", "nabla-infinity", "aiad", "trinity-gate", "no-doubts", "telemetry", "no-mercy"]
domain_normalized = "financial"
content_version = "2.1.0"
last_enhanced = "2026-02-16"
word_count = 1650
quality_score = 92
keywords = ["corporate governance", "board analysis", "ownership chains", "beneficial ownership", "regulatory compliance", "risk scoring"]
tags = ["prismatic", "agent", "intelligence", "corporate-domain", "governance-analysis"]
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "corporate-governance-analyst - Prismatic Platform"
+++

## Overview

The Corporate Governance Analyst operates as an L3 strategic command agent within the Corporate domain of the Prismatic Platform. This agent specializes in intelligence gathering and analysis of corporate governance structures, board compositions, ownership chains, and compliance postures for entities under investigation. By synthesizing data from public registries, regulatory filings, and [OSINT](/glossary/osint/) sources, the analyst produces comprehensive governance assessments that inform due diligence, risk scoring, and compliance evaluation workflows.

Corporate governance analysis is a critical component of the platform's due diligence intelligence pipeline. Opaque ownership structures, undisclosed board relationships, and governance deficiencies are leading indicators of financial risk, regulatory exposure, and potential fraud. The Corporate Governance Analyst automates the labor-intensive process of mapping corporate hierarchies, identifying beneficial owners, detecting governance red flags, and assessing compliance with relevant regulatory frameworks including NIS2 Directive (EU 2022/2555) and Czech commercial law.

## Operational Domain

The Corporate domain encompasses all intelligence operations related to corporate entities, their governance structures, ownership chains, and regulatory compliance postures. The Corporate Governance Analyst works alongside financial intelligence agents and legal compliance specialists to produce integrated assessments that combine governance analysis with financial forensics and regulatory intelligence.

## Governance Analysis Capabilities

The analyst performs structured governance assessment across multiple dimensions, each producing scored findings that feed into the platform's risk scoring engine.

| Governance Dimension | Data Sources | Analysis Output | Risk Indicators |
|---|---|---|---|
| Board Composition | Registry filings, annual reports | Board member profiles with tenure and roles | Excessive tenure, lack of independence |
| Ownership Structure | Commercial registries, beneficial ownership databases | Ownership chain visualization with percentages | Circular ownership, nominee structures |
| Beneficial Ownership | UBO registers, corporate filings | Ultimate beneficial owner identification | Undisclosed UBOs, offshore layering |
| Regulatory Compliance | Regulatory filings, sanctions lists | Compliance posture assessment | Missing filings, regulatory actions |
| Related Party Transactions | Financial statements, disclosure documents | Transaction network with valuation flags | Unusual pricing, undisclosed relationships |
| Management Changes | Registry updates, press releases | Executive turnover timeline and patterns | Rapid turnover, mass resignations |

## Entity Resolution Pipeline

The Corporate Governance Analyst leverages the platform's [entity resolution](/glossary/entity-resolution/) capabilities to connect governance data across disparate sources, resolving entity identities despite variations in naming, formatting, and jurisdictional conventions.

```elixir
defmodule PrismaticAgents.CorporateGovernance do
  @moduledoc """
  Corporate governance analysis engine that synthesizes
  intelligence from multiple OSINT sources into structured
  governance assessments.
  """

  @type governance_assessment :: %{
    entity: entity(),
    board: [board_member()],
    ownership_chain: [ownership_link()],
    beneficial_owners: [ubo()],
    compliance_score: float(),
    risk_flags: [risk_flag()],
    confidence: float(),
    sources: [source()]
  }

  @spec analyze_governance(String.t(), keyword()) :: {:ok, governance_assessment()} | {:error, term()}
  def analyze_governance(entity_identifier, opts \\ []) do
    with {:ok, entity} <- resolve_entity(entity_identifier),
         {:ok, board} <- analyze_board_composition(entity),
         {:ok, ownership} <- map_ownership_structure(entity),
         {:ok, ubos} <- identify_beneficial_owners(ownership),
         {:ok, compliance} <- assess_regulatory_compliance(entity),
         {:ok, flags} <- detect_governance_risks(board, ownership, ubos, compliance) do
      {:ok, %{
        entity: entity,
        board: board,
        ownership_chain: ownership,
        beneficial_owners: ubos,
        compliance_score: compliance.score,
        risk_flags: flags,
        confidence: calculate_confidence(board, ownership, compliance),
        sources: aggregate_sources([board, ownership, compliance])
      }}
    end
  end

  defp detect_governance_risks(board, ownership, ubos, compliance) do
    risks = []
      |> check_board_independence(board)
      |> check_ownership_opacity(ownership)
      |> check_ubo_disclosure(ubos)
      |> check_regulatory_actions(compliance)
      |> check_circular_ownership(ownership)

    {:ok, risks}
  end
end
```

## Governance Risk Scoring

The analyst produces quantified risk scores for each governance dimension using a weighted scoring model. Each risk indicator contributes to a composite governance risk score.

| Risk Category | Weight | Score Range | Critical Threshold |
|---|---|---|---|
| Board Independence | 20% | 0-100 | < 40 triggers alert |
| Ownership Transparency | 25% | 0-100 | < 30 triggers alert |
| Beneficial Owner Disclosure | 25% | 0-100 | < 25 triggers alert |
| Regulatory Compliance | 20% | 0-100 | < 50 triggers alert |
| Management Stability | 10% | 0-100 | < 35 triggers alert |

## Czech Commercial Registry Integration

The analyst integrates with Czech commercial registries (Justice.cz, ARES) to extract governance data for Czech-incorporated entities, including board appointments, statutory representatives, and ownership changes.

```elixir
defmodule PrismaticAgents.CorporateGovernance.CzechRegistry do
  @spec fetch_governance_data(String.t()) :: {:ok, registry_data()} | {:error, term()}
  def fetch_governance_data(ico) do
    with {:ok, justice} <- PrismaticOsint.CzechLegal.fetch_entity(ico),
         {:ok, ares} <- PrismaticOsint.ARES.fetch_entity(ico) do
      {:ok, merge_registry_data(justice, ares)}
    end
  end
end
```

## Key Capabilities

- **Board composition analysis** mapping board members, their roles, tenure, independence status, and cross-board relationships to detect concentration of power and governance gaps
- **Ownership chain mapping** tracing ownership structures through multiple corporate layers to identify ultimate beneficial owners and detect opacity patterns
- **Regulatory compliance assessment** evaluating entity compliance posture against applicable regulatory frameworks including filing obligations, sanctions screening, and disclosure requirements
- **Governance risk scoring** producing quantified, weighted risk scores that enable comparison across entities and integration with the platform's risk assessment pipeline
- **Cross-jurisdictional analysis** handling entities across multiple jurisdictions with awareness of varying governance requirements and reporting standards
- **Historical governance tracking** maintaining temporal records of governance changes to detect patterns such as pre-transaction board restructuring or ownership shuffling

## Authority Level

**L3** - [Strategic Command](/glossary/strategic-command/). Multi-domain coordination with authority to request intelligence from OSINT providers, trigger entity resolution operations, and produce governance assessments that feed into due diligence workflows.

## Coordination

| Agent | Relationship | Purpose |
|---|---|---|
| [financial-intelligence-commander](/agents/financial-intelligence-commander/) | Intelligence Partner | Coordinates financial analysis with governance findings |
| [czech-business-intelligence-specialist](/agents/czech-business-intelligence-specialist/) | Czech Registries | Provides Czech commercial registry data and entity information |
| [regulatory-intelligence-commander](/agents/regulatory-intelligence-commander/) | Compliance Data | Supplies regulatory filing and compliance intelligence |
| [risk-assessment-commander](/agents/risk-assessment-commander/) | Risk Integration | Integrates governance scores into composite risk assessments |

## Integration

| Component | Relationship |
|---|---|
| [NABLA Infinity](/glossary/nabla-infinity/) | Signal plurality and provenance tracking for governance claims |
| [Trinity Gate](/glossary/trinity-gate/) | Formal verification of governance risk conclusions |
| Entity Resolution Engine | Cross-source entity identity resolution |
| Platform [Telemetry](/glossary/telemetry/) | Analysis performance metrics and throughput tracking |

## Enforcement

The Corporate Governance Analyst operates under the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine. All governance claims must be supported by evidence from at least two independent sources (NABLA Signal Plurality). Ownership chains that cannot be fully resolved are reported with explicit uncertainty markers rather than assumed structures. Governance risk scores include confidence intervals derived from source quality and coverage completeness. No governance assessment is finalized without [Trinity Gate](/glossary/trinity-gate/) passage verifying structural, logical, and formal consistency of the analysis.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)