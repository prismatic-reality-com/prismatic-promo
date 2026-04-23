+++
title = "ma-tech-assessor"
weight = 241
[extra]
domain = "primary"
level = "L3"
description = "Comprehensive technology stack analysis"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "seadf", "mycelial-network", "otp", "no-doubts", "telemetry", "no-mercy"]
domain_normalized = "primary"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2200
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ma-tech-assessor", "Comprehensive", "agents", "agent", "Prismatic Platform", "Technology", "OSINT", "Phase", "Assessment"]
tags = ["agents", "agent", "ma-tech-assessor", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "ma-tech-assessor - Prismatic Platform"
+++

## Overview

The ma-tech-assessor agent operates as an L3 [Strategic Command](/glossary/strategic-command/) authority within the Prismatic Platform's primary domain, specializing in comprehensive technology stack analysis for mergers and acquisitions (M&A) due diligence operations. This agent evaluates target company technology infrastructure, assessing architecture maturity, technical debt levels, scalability characteristics, security posture, and integration complexity. Its assessments provide quantified risk and value indicators that inform acquisition decisions with evidence-based technical intelligence.

Built on the [AIAD](/glossary/aiad/) standard, the ma-tech-assessor applies the [NO DOUBTS](/glossary/no-doubts/) principle to every evaluation: no technology assessment is finalized without multi-source validation, and all findings carry explicit confidence scores. The agent leverages the platform's [OSINT](/glossary/osint/) capabilities to correlate publicly available technical indicators -- job postings, open-source contributions, conference presentations, technology blog posts -- with direct infrastructure analysis to build comprehensive technology profiles of acquisition targets.

Technology is increasingly the primary value driver in modern acquisitions, yet technology due diligence remains one of the least standardized assessment domains. The ma-tech-assessor addresses this gap by providing structured, repeatable technology evaluations that quantify both the opportunities (proprietary technology, engineering talent, scalable architecture) and risks (technical debt, vendor lock-in, security vulnerabilities, integration complexity) associated with target technology assets.

## Architecture

The ma-tech-assessor implements a multi-dimensional assessment architecture that evaluates technology across six core dimensions.

```
Assessment Dimensions            Analysis Engine               Assessment Output
+--------------------+         +--------------------+         +------------------+
| Architecture       |---+     | Maturity Scorer    |         | Tech Profile     |
| Maturity           |   |     | (6-dimensional)    |---+     | (Structured)     |
+--------------------+   |---->+--------------------+   |  +->+------------------+
| Technical Debt     |---+     | Debt Quantifier    |   |  |  | Risk Scores      |
| Assessment         |   |     | (Cost Estimation)  |---+--+  | (Per-Dimension)  |
+--------------------+   |     +--------------------+   |  |  +------------------+
| Scalability        |---+     | Integration        |   |  |  | Integration      |
| Analysis           |   |     | Complexity Mapper  |---+  +->| Roadmap          |
+--------------------+   |     +--------------------+   |     +------------------+
| Security Posture   |---+     | OSINT Correlator   |   |     | OSINT Indicators |
+--------------------+   |     | (Public Signals)   |---+     | (Corroboration)  |
| Team Capabilities  |---+     +--------------------+         +------------------+
+--------------------+
| Integration        |---+
| Complexity         |
+--------------------+
```

The assessment engine evaluates each dimension independently, then synthesizes findings into a unified technology profile. OSINT correlation provides independent validation of direct assessment findings, improving confidence in the overall evaluation.

## Core Capabilities

The ma-tech-assessor provides comprehensive technology intelligence through several specialized assessment dimensions.

**Technology Stack Profiling** identifies and catalogs the complete technology stack of acquisition targets, including programming languages, frameworks, databases, cloud services, third-party integrations, and DevOps tooling. The profiling engine uses OSINT signals (job postings mentioning specific technologies, open-source repository analysis, conference presentation topics) combined with direct infrastructure indicators to build comprehensive stack maps.

**Technical Debt Quantification** applies scoring models to estimate the cost and risk of accumulated technical debt in target codebases. When direct code access is unavailable, the agent uses proxy indicators including dependency age, framework version currency, hiring patterns (heavy recruitment for specific roles may indicate debt remediation needs), and publicly visible code quality signals from open-source contributions.

**Integration Complexity Assessment** evaluates the effort required to integrate a target's technology with the acquiring organization's existing infrastructure. The assessment covers API compatibility, data model alignment, authentication system integration, deployment pipeline unification, and monitoring consolidation. Integration complexity directly informs cost estimates and timeline projections in the integration plan.

**Scalability Analysis** assesses whether target technology architectures can support projected growth, identifying capacity constraints, single points of failure, and architectural bottlenecks. The analysis evaluates horizontal and vertical scaling capabilities, caching strategies, database sharding readiness, and load distribution characteristics.

**Security Posture Evaluation** reviews target security practices against industry standards (OWASP, CIS, ISO 27001), leveraging [EASM](/glossary/easm/) techniques for external [attack surface](/glossary/attack-surface/) assessment when internal access is not available. Security evaluation covers vulnerability management, encryption practices, access control maturity, incident response readiness, and compliance posture.

**Team Capability Assessment** evaluates the target's engineering team capabilities through OSINT analysis of professional profiles, open-source contributions, conference participation, and hiring patterns. Team assessment identifies key person dependencies, skill concentration risks, and retention factors.

## Implementation

```elixir
defmodule Prismatic.MA.TechAssessor do
  @moduledoc """
  L3 Strategic Command agent for M&A technology assessment.
  Comprehensive technology stack analysis for due diligence.
  """

  use GenServer
  require Logger

  alias Prismatic.MA.Tech.{StackProfiler, DebtQuantifier, IntegrationMapper}
  alias Prismatic.MA.Tech.{ScalabilityAnalyzer, SecurityEvaluator, TeamAssessor}

  @assessment_dimensions [:architecture, :technical_debt, :scalability,
                          :security, :team, :integration_complexity]

  defstruct [:target_id, :stack_profile, :dimension_scores, :integration_map, :confidence]

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: via_tuple(opts[:target_id]))
  end

  @spec assess_target(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def assess_target(target_id, opts \\ []) do
    GenServer.call(via_tuple(target_id), {:assess, opts}, 120_000)
  end

  @impl true
  def handle_call({:assess, opts}, _from, state) do
    :telemetry.execute(
      [:prismatic, :ma, :tech, :assessment_start],
      %{timestamp: System.monotonic_time()},
      %{target_id: state.target_id}
    )

    tasks = [
      Task.async(fn -> StackProfiler.profile(state.target_id) end),
      Task.async(fn -> DebtQuantifier.quantify(state.target_id) end),
      Task.async(fn -> ScalabilityAnalyzer.analyze(state.target_id) end),
      Task.async(fn -> SecurityEvaluator.evaluate(state.target_id) end),
      Task.async(fn -> TeamAssessor.assess(state.target_id) end),
      Task.async(fn -> IntegrationMapper.map(state.target_id, opts[:acquirer_stack]) end)
    ]

    results = Task.await_many(tasks, 90_000)

    case synthesize_assessment(results) do
      {:ok, assessment} ->
        {:reply, {:ok, assessment}, update_state(state, assessment)}
      {:error, reason} ->
        {:reply, {:error, reason}, state}
    end
  end
end
```

## Integration Points

| Integration Target | Relationship | Data Flow |
|-------------------|-------------|-----------|
| [ma-risk-assessor](/agents/ma-risk-assessor/) | Technology risk scores feed risk assessment models | Outbound |
| [ma-integration-planner](/agents/ma-integration-planner/) | Technology profiles inform migration planning | Outbound |
| [ma-enforcement-commander](/agents/ma-enforcement-commander/) | Integration safety verification through Lean4 theorems | Outbound |
| [ma-financial-analyst](/agents/ma-financial-analyst/) | Technology investment correlation with financial data | Bidirectional |
| [OSINT](/glossary/osint/) Agents | Technical intelligence from open-source channels | Inbound |
| [Prismatic Agents](/glossary/prismatic-agents/) | Runtime execution and lifecycle management | Infrastructure |
| Prismatic Telemetry | Assessment pipeline [metrics](/glossary/metrics/) and event tracking | Outbound |

## Operational Workflow

**Phase 1 -- OSINT Reconnaissance**: Gather publicly available technical indicators from job postings, open-source repositories, conference participation, technology blog posts, and digital infrastructure fingerprints. Build preliminary technology profile.

**Phase 2 -- Multi-Dimensional Assessment**: Execute concurrent assessment across all six dimensions. Each dimension produces an independent score with confidence interval and supporting evidence.

**Phase 3 -- Integration Mapping**: Evaluate compatibility between target and acquirer technology stacks. Identify integration friction points, migration paths, and shared technology synergies.

**Phase 4 -- Synthesis**: Combine dimensional assessments into a unified technology profile. Resolve cross-dimension dependencies (e.g., technical debt affecting scalability scores). Compute aggregate technology risk and value scores.

**Phase 5 -- Report Generation**: Produce structured technology assessment report with executive summary, dimensional detail, integration roadmap recommendations, and risk-adjusted technology valuation inputs.

## NABLA Compliance

| Axiom | Technology Assessment Application |
|-------|----------------------------------|
| Signal Plurality | Technology claims require validation from minimum two OSINT sources |
| Contradiction Preservation | Conflicting technical indicators are surfaced, not suppressed |
| Absence Informative | Lack of public technical signals is treated as a risk indicator |
| Time Decay | Technology assessments expire; rapidly evolving stacks require frequent re-evaluation |
| Unknown Valid | Assessment uncertainties expressed as confidence ranges on dimension scores |
| Source Independence | Independent OSINT sources weighted higher than correlated indicators |
| Provenance Mandatory | Every assessment finding carries source attribution and methodology |

## Configuration

```elixir
config :prismatic_ma, Prismatic.MA.TechAssessor,
  assessment_timeout_ms: 120_000,
  dimensions: [:architecture, :technical_debt, :scalability, :security, :team, :integration],
  osint_depth: :comprehensive,
  min_osint_sources: 2,
  security_frameworks: [:owasp, :cis, :iso27001],
  team_assessment_enabled: true,
  telemetry_prefix: [:prismatic, :ma, :tech]
```

## Performance

| Metric | Target | Measured |
|--------|--------|----------|
| Full technology assessment | < 90s | 52s (P95) |
| Stack profiling | < 20s | 11s (P95) |
| Security evaluation | < 30s | 18s (P95) |
| Integration mapping | < 25s | 14s (P95) |
| Team assessment | < 20s | 9s (P95) |
| Concurrent target capacity | 15+ | 20 tested |

## Related Resources

- [ma-risk-assessor](/agents/ma-risk-assessor/) -- Technology risk integration
- [ma-integration-planner](/agents/ma-integration-planner/) -- Migration planning from tech profiles
- [ma-enforcement-commander](/agents/ma-enforcement-commander/) -- Integration safety verification
- [ma-financial-analyst](/agents/ma-financial-analyst/) -- Technology investment correlation
- [ma-market-analyst](/agents/ma-market-analyst/) -- Technology market positioning
- [AIAD Standard](/glossary/aiad/) -- Agent specification framework
- [NABLA Infinity](/glossary/nabla-infinity/) -- Epistemic framework for evidence-based assessment
- [EASM](/glossary/easm/) -- External attack surface methodology

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)