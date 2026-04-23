+++
title = "ma-deal-manager"
weight = 235
[extra]
domain = "primary"
level = "L2"
description = "Create new M&A deal with complete initialization"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "seadf", "mycelial-network", "otp", "no-doubts", "telemetry", "no-mercy"]
domain_normalized = "primary"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1650
quality_score = 92
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ma-deal-manager", "Create", "agents", "agent", "Prismatic Platform", "Deal Manager", "Risk", "Financial", "Integration", "Every"]
tags = ["agents", "agent", "ma-deal-manager", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "ma-deal-manager - Prismatic Platform"
+++

## Overview

The M&A Deal Manager operates as an L2 tactical operations agent within the Primary domain of the Prismatic Platform. This agent manages the complete lifecycle of mergers and acquisitions (M&A) deal tracking, from initial deal creation and target identification through due diligence coordination, risk assessment, and deal closure. Every M&A deal is initialized with a structured data model that ensures comprehensive coverage of financial, legal, operational, and regulatory dimensions.

M&A intelligence is a core use case for the Prismatic Platform's [OSINT](@/glossary/osint.md) and due diligence capabilities. The M&A Deal Manager coordinates the work of specialized analysis agents -- financial analysts, risk assessors, regulatory intelligence operatives, and corporate governance analysts -- into a unified deal management workflow. Each deal maintains a complete audit trail from initial identification through final disposition, with all intelligence findings linked to their source evidence.

## Operational Domain

The Primary domain encompasses core business intelligence operations. The M&A Deal Manager sits at the coordination layer, orchestrating specialized agents across financial, legal, and operational analysis domains to produce comprehensive deal assessments.

## Deal Lifecycle

Every M&A deal progresses through a defined lifecycle with quality gates at each transition.

| Phase | Activities | Key Outputs | Gate Criteria |
|---|---|---|---|
| Identification | Target screening, initial assessment | Target profile, preliminary valuation | Minimum data coverage threshold |
| Preliminary Analysis | Financial review, market assessment | Financial summary, market position | Financial data completeness |
| Due Diligence | Deep investigation across all dimensions | DD report with findings | All DD workstreams complete |
| Risk Assessment | Risk identification and scoring | Risk matrix with mitigations | Risk thresholds evaluated |
| Negotiation | Valuation refinement, terms structuring | Term sheet, valuation model | Parties aligned on key terms |
| Closure | Legal documentation, regulatory approval | Closing documents, compliance verification | All approvals obtained |
| Post-Merger | Integration monitoring, synergy tracking | Integration progress reports | Integration milestones met |

## Deal Data Model

```elixir
defmodule PrismaticAgents.MADealManager do
  @moduledoc """
  M&A deal lifecycle management engine.
  Coordinates deal creation, due diligence orchestration,
  and deal progression tracking.
  """

  use GenServer

  @type deal :: %{
    id: String.t(),
    name: String.t(),
    phase: deal_phase(),
    target: entity(),
    acquirer: entity(),
    deal_type: :acquisition | :merger | :joint_venture | :divestiture,
    estimated_value: Decimal.t() | nil,
    currency: String.t(),
    initiated_at: DateTime.t(),
    due_diligence: dd_status(),
    risk_assessment: risk_summary(),
    intelligence_findings: [finding()],
    audit_trail: [audit_entry()]
  }

  @type deal_phase :: :identification | :preliminary | :due_diligence |
                       :risk_assessment | :negotiation | :closure | :post_merger

  @spec create_deal(map()) :: {:ok, deal()} | {:error, term()}
  def create_deal(params) do
    GenServer.call(__MODULE__, {:create, params})
  end

  @spec advance_phase(String.t()) :: {:ok, deal()} | {:error, term()}
  def advance_phase(deal_id) do
    GenServer.call(__MODULE__, {:advance, deal_id})
  end

  @impl true
  def handle_call({:create, params}, _from, state) do
    with {:ok, validated} <- validate_deal_params(params),
         {:ok, deal} <- initialize_deal(validated),
         {:ok, enriched} <- trigger_initial_intelligence(deal) do
      {:reply, {:ok, enriched}, register_deal(state, enriched)}
    end
  end

  @impl true
  def handle_call({:advance, deal_id}, _from, state) do
    with {:ok, deal} <- fetch_deal(deal_id, state),
         {:ok, _} <- verify_phase_gate(deal),
         {:ok, advanced} <- transition_phase(deal) do
      {:reply, {:ok, advanced}, update_deal(state, advanced)}
    else
      {:error, :gate_not_met, missing} ->
        {:reply, {:error, %{reason: :gate_not_met, missing_criteria: missing}}, state}
    end
  end
end
```

## Due Diligence Orchestration

The M&A Deal Manager orchestrates due diligence across multiple workstreams, each handled by specialized agents.

| DD Workstream | Responsible Agent | Key Deliverables | Duration |
|---|---|---|---|
| Financial Analysis | [ma-financial-analyst](@/agents/ma-financial-analyst.md) | Financial statements, ratio analysis, projections | 2-4 weeks |
| Market Analysis | [ma-market-analyst](@/agents/ma-market-analyst.md) | Market position, competitive landscape, growth | 1-2 weeks |
| Risk Assessment | [ma-risk-assessor](@/agents/ma-risk-assessor.md) | Risk matrix, mitigation strategies | 2-3 weeks |
| Technical Assessment | [technical-assessor](@/agents/technical-assessor.md) | Technology stack, IP analysis, technical debt | 1-3 weeks |
| Governance Review | [corporate-governance-analyst](@/agents/corporate-governance-analyst.md) | Board composition, ownership, compliance | 1-2 weeks |
| Regulatory Check | [regulatory-intelligence-commander](@/agents/regulatory-intelligence-commander.md) | Regulatory filings, compliance posture | 1-2 weeks |

## Risk Scoring Framework

Each deal receives a composite risk score based on multiple dimensions.

| Risk Dimension | Weight | Score Range | Critical Threshold |
|---|---|---|---|
| Financial Risk | 25% | 0-100 | < 40 blocks advancement |
| Regulatory Risk | 20% | 0-100 | < 30 blocks advancement |
| Operational Risk | 20% | 0-100 | < 35 blocks advancement |
| Market Risk | 15% | 0-100 | < 40 triggers review |
| Governance Risk | 10% | 0-100 | < 25 blocks advancement |
| Integration Risk | 10% | 0-100 | < 30 triggers review |

## Key Capabilities

- **Complete deal initialization** creating structured deal records with all required dimensions, automatically triggering intelligence gathering for target entities
- **Phase gate enforcement** preventing deal progression until all criteria for the current phase are satisfied, including due diligence completeness and risk threshold compliance
- **Multi-workstream due diligence** orchestrating parallel investigation workstreams across financial, legal, operational, and regulatory dimensions with progress tracking
- **Risk-adjusted deal scoring** producing composite risk scores from multiple dimensions with configurable weights and critical thresholds that gate deal progression
- **Intelligence integration** linking all OSINT findings, corporate governance assessments, and financial analyses directly to the deal record for comprehensive visibility
- **Audit trail management** maintaining immutable records of all deal actions, phase transitions, and intelligence findings for compliance and accountability

## Authority Level

**L2** - Tactical Operations. Domain-specific [tactical execution](@/glossary/tactical-execution.md) with cross-domain coordination capabilities. The M&A Deal Manager coordinates specialized analysis agents but escalates deal approval decisions to L3 authority.

## Coordination

| Agent | Relationship | Purpose |
|---|---|---|
| [ma-financial-analyst](@/agents/ma-financial-analyst.md) | Financial DD | Provides financial analysis for deal targets |
| [ma-risk-assessor](@/agents/ma-risk-assessor.md) | Risk Assessment | Produces risk scores for deal evaluation |
| [corporate-governance-analyst](@/agents/corporate-governance-analyst.md) | Governance DD | Analyzes target governance structures |
| [ma-market-analyst](@/agents/ma-market-analyst.md) | Market Analysis | Evaluates market position and competitive landscape |

## Integration

| Component | Relationship |
|---|---|
| [NABLA Infinity](@/glossary/nabla-infinity.md) | Signal plurality for intelligence findings |
| Entity Resolution | Target entity identification and linking |
| Platform [Telemetry](@/glossary/telemetry.md) | Deal processing metrics and timeline tracking |
| [SEADF](@/glossary/seadf.md) | Evolutionary optimization of deal scoring models |

## Enforcement

The M&A Deal Manager operates under the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. No deal advances to the next phase without satisfying all gate criteria. Due diligence workstreams must reach minimum completeness thresholds before the DD phase can close. All intelligence findings require source provenance (NABLA Provenance Mandatory). Risk scores below critical thresholds block deal progression without exception. Every deal action is recorded in an immutable [audit trail](@/glossary/audit-trail.md) with timestamps and actor identification.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)