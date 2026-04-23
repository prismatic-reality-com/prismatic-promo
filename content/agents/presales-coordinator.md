+++
title = "presales-coordinator"
weight = 306
[extra]
domain = "medium-predator"
level = "L2"
description = "Case study creation and presales project coordination specialist"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["aiad", "seadf", "mycelial-network", "nabla-infinity", "no-doubts", "telemetry", "no-mercy"]
domain_normalized = "predator"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2200
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["presales-coordinator", "Case", "agents", "agent", "Prismatic Platform", "Proof", "Case Study"]
tags = ["agents", "agent", "presales-coordinator", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "presales-coordinator - Prismatic Platform"
+++

## Overview

The presales-coordinator operates as an L2 [tactical execution](@/glossary/tactical-execution.md) agent within the Prismatic Platform's medium-predator domain, responsible for coordinating presales activities including case study creation, demonstration preparation, proof-of-concept project management, and prospect-specific capability assessments. This agent bridges the gap between the platform's technical capabilities and prospect requirements, translating complex platform features into compelling narratives that demonstrate value for specific use cases.

Built on the [AIAD](@/glossary/aiad.md) standard and integrated with the [SEADF](@/glossary/seadf.md) evolutionary framework, the presales-coordinator continuously improves its effectiveness through feedback loops that track which presales approaches lead to successful engagements. Through the [mycelial network](@/glossary/mycelial-network.md), the agent shares successful presales patterns across the platform's business development ecosystem, enabling institutional learning about what resonates with different prospect profiles.

## Operational Domain

The presales coordination domain covers all pre-engagement activities that demonstrate platform capabilities to potential customers and partners. This includes creating tailored case studies, preparing live demonstrations, managing proof-of-concept projects, producing capability comparison matrices, and coordinating with technical specialists to address prospect-specific questions. The agent maintains a library of presales assets organized by industry vertical, use case, and platform capability area.

| Presales Activity | Duration | Output | Success Metric |
|------------------|----------|--------|---------------|
| Case Study Creation | 2-5 days | Published case study document | Prospect engagement rate |
| Demo Preparation | 1-3 days | Live demonstration script + environment | Demo conversion rate |
| Proof of Concept | 1-4 weeks | Working POC with results report | POC to contract rate |
| Capability Assessment | 1-2 days | Gap analysis + capability matrix | Requirement coverage score |
| Technical Proposal | 3-7 days | Detailed technical proposal document | Proposal acceptance rate |
| Competitive Analysis | 1-3 days | Feature comparison matrix | Differentiation clarity score |

## Key Capabilities

- **Case study authoring** -- Creates compelling case studies that articulate business problems, platform solutions, and measurable outcomes, tailored to specific industry verticals and decision-maker profiles
- **Demo environment management** -- Maintains pre-configured demonstration environments with realistic data sets that showcase platform capabilities relevant to prospect requirements
- **POC project coordination** -- Manages proof-of-concept timelines, resource allocation, success criteria, and progress reporting, ensuring that POC results directly address prospect evaluation criteria
- **Competitive positioning** -- Analyzes competitor capabilities against platform features to produce differentiation narratives that highlight unique platform strengths
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with self-directed presales asset maintenance and prospect research cycles
- **[Telemetry integration](@/capabilities/telemetry-integration.md)** publishing presales pipeline metrics, asset utilization rates, and engagement conversion statistics

## Presales Pipeline Management

```elixir
defmodule Prismatic.Presales.Coordinator do
  @moduledoc """
  Coordinates presales activities including case study creation,
  demo preparation, and proof-of-concept management.
  """

  alias Prismatic.Presales.{AssetLibrary, DemoEnvironment, POCManager}

  @type engagement :: %{
    id: String.t(),
    prospect: String.t(),
    industry: atom(),
    stage: :qualification | :assessment | :demo | :poc | :proposal | :decision,
    requirements: [requirement()],
    assets_assigned: [asset()],
    started_at: DateTime.t()
  }

  @spec create_engagement(prospect :: String.t(), requirements :: map()) :: {:ok, engagement()}
  def create_engagement(prospect, requirements) do
    engagement = %{
      id: Ecto.UUID.generate(),
      prospect: prospect,
      industry: classify_industry(requirements),
      stage: :qualification,
      requirements: extract_requirements(requirements),
      assets_assigned: [],
      started_at: DateTime.utc_now()
    }

    matching_assets = AssetLibrary.find_matching(engagement.industry, engagement.requirements)
    engagement = %{engagement | assets_assigned: matching_assets}

    emit_engagement_telemetry(engagement)
    {:ok, engagement}
  end

  @spec prepare_demo(engagement(), keyword()) :: {:ok, demo_config()}
  def prepare_demo(engagement, opts \\ []) do
    features = Keyword.get(opts, :features, :all_relevant)
    data_profile = Keyword.get(opts, :data, :industry_realistic)

    DemoEnvironment.configure(%{
      prospect: engagement.prospect,
      features: resolve_features(features, engagement.requirements),
      data: generate_demo_data(data_profile, engagement.industry),
      script: generate_demo_script(engagement)
    })
  end

  @spec advance_stage(engagement(), atom()) :: {:ok, engagement()}
  def advance_stage(engagement, next_stage) do
    updated = %{engagement | stage: next_stage}
    emit_stage_transition_telemetry(engagement, next_stage)
    {:ok, updated}
  end
end
```

## Presales Asset Categories

| Asset Type | Format | Shelf Life | Maintenance |
|-----------|--------|-----------|-------------|
| Case Studies | PDF + Web | 12 months | Annual refresh |
| Demo Scripts | Markdown + Environment | 6 months | Quarterly update |
| Capability Matrices | Spreadsheet + Web | 3 months | Monthly review |
| Technical Proposals | Template + Custom | Per-engagement | Template quarterly |
| Competitive Analysis | Internal document | 3 months | Monthly review |
| ROI Models | Spreadsheet template | 6 months | Bi-annual recalibration |

## Authority Level

**L2** - [Tactical Operations](@/glossary/tactical-execution.md) - Domain-specific tactical execution with authority to create presales assets, manage demonstration environments, and coordinate POC projects.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/presales engage` | Create new presales engagement with prospect requirements | L2+ |
| `/presales demo` | Prepare demonstration environment for specific prospect | L2+ |
| `/presales assets` | Search and retrieve presales assets matching criteria | L2+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [presales-intelligence-commander](@/agents/presales-intelligence-commander.md) | Receives strategic direction and priority prospect assignments |
| [linkedin-intelligence-specialist](@/agents/linkedin-intelligence-specialist.md) | Provides prospect professional intelligence for engagement customization |
| [risk-intelligence-commander](@/agents/risk-intelligence-commander.md) | Supplies prospect risk profiles for engagement qualification |
| [code-quality-commander](@/agents/code-quality-commander.md) | Ensures demo environments reflect production quality standards |

## Case Study Methodology

The presales-coordinator follows a structured methodology for creating case studies that demonstrate platform value through concrete, measurable outcomes.

### Problem-Solution-Result Framework

Every case study follows the Problem-Solution-Result (PSR) framework. The Problem section articulates the business challenge in terms that resonate with the target audience's domain vocabulary. The Solution section describes how the platform addressed the challenge, with sufficient technical detail to demonstrate credibility without overwhelming non-technical stakeholders. The Result section presents measurable outcomes -- quantified improvements in efficiency, cost reduction, time savings, or risk mitigation -- with explicit measurement methodology and confidence levels.

### Industry Vertical Customization

Case studies are customized for specific industry verticals by emphasizing the capabilities most relevant to each industry's concerns. Financial services case studies emphasize compliance automation, risk scoring, and regulatory reporting capabilities. Technology sector case studies highlight integration depth, API performance, and developer experience. Government and public sector case studies focus on OSINT capabilities, data sovereignty, and audit trail completeness. The coordinator maintains a mapping of platform capabilities to industry value propositions that guides customization decisions.

### Validation Protocol

Before publication, every case study undergoes a validation protocol that verifies all stated outcomes against actual measured data. Quantified claims must be traceable to specific telemetry measurements or benchmark results. Platform capability claims must be verified against the current implementation (not future roadmap features). Competitive positioning statements must be evidence-based rather than aspirational. This validation ensures that presales materials maintain credibility under scrutiny from technical evaluators.

## Demonstration Environment Architecture

The presales-coordinator maintains pre-configured demonstration environments that showcase platform capabilities with realistic data sets. Each demonstration environment is a self-contained deployment that includes representative data (anonymized and synthetic), pre-configured agent coordination scenarios, live dashboard visualizations, and API endpoints that demonstrate integration capabilities.

Demonstration environments are versioned and environment-specific configurations are maintained in source control. This ensures reproducibility -- the same demonstration can be reliably repeated for different prospects. Environment data is refreshed on a quarterly cycle to ensure that demonstrations reflect current platform capabilities and do not rely on deprecated features.

## Competitive Differentiation Narratives

The presales-coordinator produces differentiation narratives that articulate the platform's unique strengths relative to specific competitors in each engagement. These narratives are fact-based, drawing from the competitive intelligence maintained by the [presales-intelligence-commander](@/agents/presales-intelligence-commander.md). Each narrative is customized to the specific prospect's requirements, emphasizing the platform capabilities that most directly address the prospect's stated needs while acknowledging areas where competitors may have strengths. This honest, evidence-based approach builds credibility with technical evaluators who are likely to verify competitive claims independently.

## Proof of Concept Management

Proof-of-concept (POC) projects require careful management to balance prospect expectations with platform capabilities. The coordinator defines clear success criteria at the outset of every POC, agreed upon with the prospect. These criteria are specific, measurable, and time-bounded, preventing scope creep that can transform a focused evaluation into an open-ended development project.

During POC execution, the coordinator publishes weekly progress reports that document completed milestones, current status against success criteria, any identified blockers, and projected completion timeline. This transparency builds trust and provides early warning if the POC is unlikely to meet its success criteria, enabling course correction before resources are wasted.

## Enforcement

All presales activities comply with the [NO MERCY](@/glossary/no-mercy.md) doctrine: case studies include only verified outcomes with measurable metrics, demonstration environments maintain production-quality code standards, and POC results are transparently reported without selective presentation. The [NO DOUBTS](@/glossary/no-doubts.md) principle requires that all capability claims in presales materials are verifiable against the actual platform, with [NABLA Infinity](@/glossary/nabla-infinity.md) provenance chains linking stated capabilities to implemented features.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)