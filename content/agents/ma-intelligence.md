+++
title = "M&A Intelligence Agents"
weight = 6
[extra]
icon = "briefcase"
color = "emerald"
agent_count = 28
commands = ["/ma-analyze", "/ma-dashboard", "/ma-create", "/presales"]
description = "Mergers & acquisitions due diligence and deal intelligence"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2200
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Intelligence", "Agents", "Mergers", "Prismatic Platform", "Stage", "Full", "NABLA Infinity"]
tags = ["agents", "ma-intelligence-agents", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "M&A Intelligence Agents - Prismatic Platform"
+++

## Overview

The M&A Intelligence agent cluster provides comprehensive, automated support for mergers, acquisitions, and investment analysis within the Prismatic Platform. Comprising 28 specialized agents operating across financial analysis, risk assessment, market intelligence, technology evaluation, legal compliance, and integration planning domains, this cluster transforms the traditionally manual and time-intensive M&A due diligence process into a rapid, evidence-based intelligence operation. From initial target screening through deep due diligence to post-acquisition integration monitoring, these agents automate the intelligence-gathering, analysis, and reporting pipeline while maintaining the rigorous evidentiary standards required for high-stakes transaction decisions.

Built on the [AIAD](/glossary/aiad/) standard and governed by the [NO MERCY, NO DOUBTS](/glossary/no-mercy/) doctrine, every M&A Intelligence agent applies the [NABLA Infinity](/glossary/nabla-infinity/) framework's seven axioms to ensure that deal intelligence is evidence-based, multi-source validated, and free from confirmation bias. The cluster's collective intelligence capability leverages the platform's [mycelial network](/glossary/mycelial-network/) for cross-agent coordination, enabling real-time synthesis of findings from multiple specialist domains into unified deal assessments.

The M&A Intelligence cluster addresses a fundamental challenge in corporate development: the asymmetry between the volume of information relevant to an acquisition decision and the capacity of human analysts to process it within deal timelines. By deploying autonomous agents across every due diligence domain simultaneously, the platform compresses analysis timelines from months to days while improving coverage and reducing the risk of overlooked critical findings.

## Architecture

The M&A Intelligence cluster operates through a hierarchical command structure with specialized agents organized into functional domains.

```
                    +---------------------------+
                    | ma-intelligence-supreme   |
                    | (L4 - Full Deal Lifecycle)|
                    +---------------------------+
                              |
              +---------------+---------------+
              |               |               |
    +---------v------+ +-----v--------+ +----v-----------+
    | due-diligence  | | presales-    | | deal-tracker   |
    | commander (L3) | | analyst (L3) | | (L2)           |
    +----------------+ +--------------+ +----------------+
              |               |               |
    +---------v-------------------------------v-----------+
    |                 Specialist Agents (L2-L3)           |
    | +-------------+ +-------------+ +-------------+    |
    | | ma-financial| | ma-risk-    | | ma-tech-    |    |
    | | analyst     | | assessor    | | assessor    |    |
    | +-------------+ +-------------+ +-------------+    |
    | +-------------+ +-------------+ +-------------+    |
    | | ma-market-  | | ma-enforce- | | ma-integra- |    |
    | | analyst     | | ment-cmdr   | | tion-planner|    |
    | +-------------+ +-------------+ +-------------+    |
    +-----------------------------------------------------+
```

## Core Capabilities

### Deal Lifecycle Management

The M&A Intelligence cluster manages the complete deal lifecycle from initial discovery through post-acquisition monitoring.

```
Discovery --> Screening --> Analysis --> Due Diligence --> Closing --> Integration
    |             |            |              |              |            |
 Target ID    Fit Score    Financials     Deep Dive      Report     Monitoring
 Market Scan  Risk Flag    Strategic      Legal/Tax      Recommend  Synergy Track
              Go/No-Go     Synergies      Compliance                Realization
```

Each phase is orchestrated by the ma-intelligence-supreme agent, which coordinates specialist agents, manages phase transitions, and ensures that gate requirements are satisfied before deals advance. Phase transitions are formally verified through the enforcement commander's Lean4 safety theorems.

### Due Diligence Domains

The cluster provides deep analysis across seven due diligence domains, each served by specialist agents.

| Domain | Coverage | Depth | Primary Agent |
|--------|----------|-------|---------------|
| **Financial** | Revenue, EBITDA, Cash Flow, Working Capital | 5-year historical + projections | [ma-financial-analyst](/agents/ma-financial-analyst/) |
| **Legal** | Contracts, IP, Litigation, Regulatory | Full exposure assessment | Legal compliance specialists |
| **Tax** | Structure, Obligations, Transfer Pricing | Cross-border analysis | Tax assessment agents |
| **Operational** | Processes, Technology, Supply Chain | Efficiency audit | [ma-tech-assessor](/agents/ma-tech-assessor/) |
| **HR** | Key personnel, Culture, Retention | Organizational risk | HR assessment agents |
| **Compliance** | Regulatory, Licenses, Permits | Gap analysis with remediation | [ma-enforcement-commander](/agents/ma-enforcement-commander/) |
| **Cyber** | Security posture, Breach history, EASM | External attack surface scan | Security assessment agents |

### Presales Intelligence

The presales intelligence capability enables rapid opportunity qualification before full due diligence commitment.

```elixir
# Opportunity qualification
{:ok, assessment} = Prismatic.Presales.assess(%{
  company: "Target Corp",
  deal_size: "5M-10M EUR",
  industry: :technology,
  geography: :eu
})

# Result structure
%{
  fit_score: 0.85,
  risk_factors: [:key_person_dependency, :revenue_concentration],
  recommended_approach: :strategic_acquisition,
  financial_indicators: %{
    estimated_revenue: "8.2M EUR",
    growth_rate: 0.23,
    margin_profile: :healthy
  },
  next_steps: ["Request financials", "Schedule management meeting"],
  confidence: 0.78
}
```

### Report Generation

The cluster generates automated analytical reports at each deal phase, supporting decision-making with structured intelligence outputs.

- **Investment Memorandum** -- Comprehensive deal thesis with financial projections and strategic rationale
- **Due Diligence Summary** -- Cross-domain findings synthesis with risk-adjusted recommendations
- **Risk Assessment Matrix** -- Quantified risk catalog with probability, impact, and mitigation strategies
- **Synergy Analysis** -- Detailed synergy identification with realization timelines and confidence levels
- **Integration Roadmap** -- Phase-sequenced integration plan with resource requirements and milestones

## Implementation

The M&A Intelligence cluster is coordinated through a central orchestrator that manages deal state and specialist agent coordination.

```elixir
defmodule Prismatic.MA.Intelligence do
  @moduledoc """
  M&A Intelligence cluster orchestrator.
  Coordinates 28 specialist agents across the deal lifecycle.
  """

  alias Prismatic.MA.{
    FinancialAnalyst, RiskAssessor, TechAssessor,
    MarketAnalyst, EnforcementCommander, IntegrationPlanner
  }

  @spec full_analysis(String.t(), map()) :: {:ok, map()} | {:error, term()}
  def full_analysis(target_id, opts \\ %{}) do
    tasks = [
      Task.async(fn -> FinancialAnalyst.analyze_target(target_id) end),
      Task.async(fn -> RiskAssessor.assess_target(target_id) end),
      Task.async(fn -> TechAssessor.assess_target(target_id) end),
      Task.async(fn -> MarketAnalyst.analyze_market(target_id) end)
    ]

    results = Task.await_many(tasks, 300_000)

    with {:ok, financial} <- Enum.at(results, 0),
         {:ok, risk} <- Enum.at(results, 1),
         {:ok, tech} <- Enum.at(results, 2),
         {:ok, market} <- Enum.at(results, 3) do
      synthesis = synthesize_findings(financial, risk, tech, market)
      {:ok, %{synthesis: synthesis, confidence: compute_confidence(results)}}
    end
  end
end
```

## Integration Points

| Integration Target | Relationship | Data Flow |
|-------------------|-------------|-----------|
| [OSINT](/glossary/osint/) Agents | Background intelligence on targets and principals | Inbound |
| Security Agents | Cyber due diligence and [attack surface](/glossary/attack-surface/) assessment | Inbound |
| Czech [Registry](/glossary/registry-otp/) | Corporate data, ownership structures, beneficial owners | Inbound |
| Dashboard | [LiveView](/glossary/liveview/) deal pipeline visualization | Outbound |
| [Prismatic Agents](/glossary/prismatic-agents/) | Runtime execution and lifecycle management | Infrastructure |
| Prismatic Telemetry | Deal pipeline [metrics](/glossary/metrics/) and performance tracking | Outbound |

## Operational Workflow

The M&A Intelligence cluster follows a structured deal workflow from opportunity identification through integration monitoring.

**Stage 1 -- Discovery and Screening**: Automated market scanning identifies potential targets. The presales analyst applies fit scoring against strategic criteria. Go/no-go decisions are evidence-based with explicit confidence thresholds.

**Stage 2 -- Preliminary Analysis**: Financial, market, and technology assessments run concurrently. Results are synthesized into a preliminary deal thesis with identified risks and opportunities.

**Stage 3 -- Deep Due Diligence**: Full seven-domain investigation with specialist agents operating independently and coordinated by the due diligence commander. Findings are continuously published to the deal dashboard.

**Stage 4 -- Decision Support**: Enforcement commander validates compliance, risk assessor produces final risk matrix, and integration planner generates post-close roadmap. All outputs are assembled into decision-support documentation.

**Stage 5 -- Post-Close Monitoring**: Integration tracking, synergy realization measurement, and operational stability monitoring continue after transaction close.

## NABLA Compliance

All M&A Intelligence operations enforce the seven [NABLA Infinity](/glossary/nabla-infinity/) axioms. Signal plurality requires multi-source validation for every deal finding. Contradiction preservation ensures conflicting assessments from different domains are surfaced rather than suppressed. Provenance is mandatory for every claim in deal documentation, enabling complete audit trail reconstruction.

## Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `concurrent_analyses` | 4 | Maximum parallel domain analyses per deal |
| `screening_threshold` | 0.60 | Minimum fit score for screening passage |
| `dd_timeout_hours` | 72 | Maximum due diligence phase duration |
| `report_format` | `:structured` | Output format for generated reports |

## Performance

| Metric | Target | Measured |
|--------|--------|----------|
| Full screening | < 30min | 12min (P95) |
| Concurrent deal support | 10+ | 15 tested |
| Report generation | < 5min | 2.8min (P95) |
| Cross-domain synthesis | < 60s | 28s (P95) |

## Commands

| Command | Description | Authority |
|---------|-------------|-----------|
| `/ma-analyze` | Full M&A analysis of target entity | L3 |
| `/ma-dashboard` | Interactive deal pipeline dashboard | L2+ |
| `/ma-create` | Create new deal record | L2+ |
| `/ma-start-dd` | Initiate due diligence process | L3 |
| `/ma-report` | Generate M&A report | L2+ |
| `/presales` | Presales intelligence assessment | L2+ |

## Related Resources

- [ma-financial-analyst](/agents/ma-financial-analyst/) -- Financial data extraction and analysis
- [ma-risk-assessor](/agents/ma-risk-assessor/) -- Risk identification and quantification
- [ma-tech-assessor](/agents/ma-tech-assessor/) -- Technology stack evaluation
- [ma-market-analyst](/agents/ma-market-analyst/) -- Market and competitive analysis
- [ma-enforcement-commander](/agents/ma-enforcement-commander/) -- Compliance enforcement
- [ma-integration-planner](/agents/ma-integration-planner/) -- Post-acquisition integration planning
- [AIAD Standard](/glossary/aiad/) -- Agent specification framework
- [NABLA Infinity](/glossary/nabla-infinity/) -- Epistemic framework governing deal intelligence

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)