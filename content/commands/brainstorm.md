+++
title = "/brainstorm"
weight = 110
[extra]
category = "Development"
description = "Technical brainstorming and solution design facilitation"
syntax = "/brainstorm [options]"
authority = "L2+"
agent = "brainstorm-facilitator"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1259
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["brainstorm", "Technical", "commands", "Development", "Prismatic Platform", "Brainstorming", "Phase", "Agent"]
tags = ["commands", "development", "brainstorm", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/brainstorm - Prismatic Platform"
+++

## Overview

The **/brainstorm** command provides intelligent technical brainstorming and solution design facilitation for the Prismatic Platform. Unlike simple prompting, /brainstorm implements a structured multi-phase workflow that begins with intelligent agent discovery (automatically selecting the most relevant specialist agents from the platform's 400+ agent registry), progresses through interactive query refinement (expanding and clarifying requirements through multi-perspective analysis), and culminates in comprehensive creative ideation with feasibility assessment and implementation roadmaps.

The power of /brainstorm lies in its ability to leverage the collective intelligence of the platform's agent ecosystem. When presented with a challenge, the command does not simply apply a single perspective. Instead, it analyzes the problem domain, identifies which specialist agents have relevant expertise (storage architects for data challenges, performance engineers for optimization questions, LiveView specialists for UI problems), and orchestrates a multi-agent brainstorming session where each agent contributes insights from their domain. This produces richer, more complete solution designs that account for cross-cutting concerns that a single-perspective analysis would miss.

Operating at the L2+ authority level and executed by the `brainstorm-facilitator` agent (backed by the `strategic-command` agent for orchestration), /brainstorm is a production command in the Development category. It is part of the platform's 216-command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The command's interactive nature distinguishes it from other development commands: it actively engages the user through a refinement loop, presenting options to continue, refine, adjust agent selection, or proceed to full ideation at each stage.

## Usage

```bash
/brainstorm [topic or challenge]
```

The command accepts a required topic or challenge description that seeds the brainstorming session. The description can range from a brief phrase to a detailed problem statement.

### Examples

```bash
# Architecture brainstorming
/brainstorm "How should we architect multi-tenant data isolation in Prismatic Storage?"

# Performance optimization ideation
/brainstorm "Our LiveView dashboard is slow with 1000+ concurrent users"

# Feature design facilitation
/brainstorm "Ideas for making Prismatic Storage more accessible to non-technical users"

# Security architecture exploration
/brainstorm "Design an epistemic security layer that detects knowledge manipulation"

# Integration design
/brainstorm "Best approaches for integrating KuzuDB graph database with existing ETS storage"
```

## Options and Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| **topic** | string | Yes | - | The challenge, idea, or problem to explore. Can be a brief phrase or detailed problem statement. |

The command's behavior is primarily controlled through its interactive workflow rather than command-line options. During execution, the user can choose from interactive options:

| Interactive Option | Action |
|-------------------|--------|
| **[C] Continue** | Proceed with additional refinement iteration |
| **[R] Refine** | Answer clarification questions and refine requirements further |
| **[A] Adjust** | Modify the automatically selected agent team |
| **[P] Proceed** | Start the full brainstorming ideation session immediately |
| **[E] Exit** | Save the current refinement state and exit |

## Authority and Access

| Property | Value |
|----------|-------|
| **Authority Level** | L2+ |
| **Executing Agent** | `brainstorm-facilitator` (backed by `strategic-command`) |
| **Status** | Production |
| **Usage Frequency** | Medium |
| **Category** | Development |
| **Read Access** | Agent registry, domain specifications, platform architecture documentation |
| **Write Access** | Brainstorming reports, idea catalogs, feasibility matrices |
| **Agent Discovery** | Automatic selection from 400+ agents based on problem domain analysis |
| **User Interaction** | Continuous (multi-stage interactive refinement) |

## Technical Implementation

The /brainstorm command implements a four-phase workflow that progressively narrows the problem space while expanding the solution space. The phases move from automated agent discovery through interactive requirement refinement to multi-agent creative ideation and deliverable generation.

```elixir
defmodule Prismatic.Commands.Brainstorm do
  @moduledoc """
  Intelligent brainstorming with agent-based query refinement
  and multi-agent creative ideation.
  """

  @spec execute(topic :: String.t(), opts :: keyword()) ::
          {:ok, BrainstormReport.t()} | {:error, term()}
  def execute(topic, opts \\ []) do
    with {:ok, query_analysis} <- analyze_query(topic),
         {:ok, agents} <- discover_and_select_agents(query_analysis),
         {:ok, refined} <- refine_requirements(topic, agents),
         {:ok, validated} <- interactive_validation(refined, agents),
         {:ok, ideation} <- execute_multi_agent_brainstorm(validated, agents),
         {:ok, report} <- generate_brainstorm_report(ideation) do
      {:ok, report}
    end
  end

  defp discover_and_select_agents(query_analysis) do
    registry = load_agent_registry()

    lead = determine_lead_agent(registry, query_analysis)
    support = rank_and_select_support(registry, query_analysis, max_agents: 5)

    {:ok, %{lead: lead, support: support}}
  end

  defp refine_requirements(topic, agents) do
    explicit = extract_explicit_requirements(topic)
    implicit = infer_implicit_requirements(topic)

    perspectives = Enum.map([agents.lead | agents.support], fn agent ->
      agent.analyze_requirements(%{explicit: explicit, implicit: implicit})
    end)

    {:ok, %{
      expanded: merge_and_expand(perspectives),
      questions: generate_clarification_questions(perspectives),
      assumptions: surface_assumptions(perspectives),
      alternatives: suggest_alternative_framings(perspectives)
    }}
  end
end
```

Phase 1 (Agent Discovery and Selection) analyzes the user's query to determine the primary domain (e.g., storage, performance, UI), secondary domains, complexity level, and required capabilities. It then scans the agent registry using a weighted scoring system: 80% weight on domain match, 15% on capability coverage, and 5% on complexity match. The result is a lead agent and up to 5 supporting agents optimized for the specific challenge.

Phase 2 (Query Refinement) takes the user's initial input and expands it through multi-agent analysis. Each selected agent examines the requirements from their specialist perspective, identifying implicit assumptions, suggesting alternative problem framings, and generating clarification questions. The refined requirements are presented to the user for validation.

Phase 3 (Interactive Validation) presents the user with the refined requirements, selected agents, and clarification questions, offering interactive options to continue refining, adjust the agent team, or proceed to ideation. This phase can iterate multiple times until the user is satisfied with the problem definition.

Phase 4 (Creative Ideation) executes the multi-agent brainstorming session with divergent thinking (idea generation from each agent's perspective), convergent analysis (feasibility, impact, and risk assessment), and implementation pathway design (short-term wins, medium-term initiatives, long-term vision).

## Workflow Integration

The /brainstorm command serves as the ideation entry point in the development workflow, typically preceding implementation commands like [/code](/commands/code/) and [/architect](/commands/architect/). Its output -- refined requirements, feasibility matrices, and implementation roadmaps -- provides the foundation for informed development decisions.

Common workflow patterns include:

1. **Pre-Architecture Design**: Run `/brainstorm` before `/architect` to explore solution alternatives before committing to an architectural approach
2. **Feature Discovery**: Use for early-stage feature exploration when the problem space is not yet well-defined
3. **Problem Decomposition**: When facing a complex challenge, use /brainstorm to break it into manageable sub-problems with clear implementation paths
4. **Cross-Domain Integration**: Leverage the multi-agent discovery to identify cross-cutting concerns when designing features that span multiple platform domains
5. **Team Alignment**: Generate brainstorming reports that can be shared with team members to align on approach before implementation begins
6. **Innovation Sessions**: Dedicate periodic sessions to open-ended brainstorming with broad topics to discover novel platform capabilities

## Integration Points

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Dynamic agent discovery and multi-agent orchestration |
| AIAD Registry | Agent capability database for intelligent selection |
| [Quality Gates](/glossary/quality-gates/) | Pre/post execution quality validation |
| [Telemetry](/glossary/telemetry/) | Command execution [metrics](/glossary/metrics/) and session tracking |
| Agent Registry | 400+ agents indexed by domain, capability, and expertise level |
| Strategic Command | Orchestration backbone for multi-agent coordination |
| Report Generation | Structured output with executive summaries, idea catalogs, and roadmaps |
| Session Context | Brainstorming state preserved across session boundaries |

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Brainstorming output must be comprehensive and actionable. Idea catalogs include feasibility assessments for every item. Implementation roadmaps cover all identified dependencies and prerequisites. No idea is dismissed without documented reasoning. The command does not produce vague suggestions; every recommendation includes concrete implementation guidance.
- **NO DOUBTS**: Agent selection is evidence-based, using quantified scoring against the agent registry rather than heuristic matching. Requirement refinement surfaces implicit assumptions rather than allowing them to persist unchallenged. Feasibility assessments include specific criteria (technical complexity, resource requirements, risk factors) rather than subjective labels. Clarification questions are generated from identified ambiguities, not generic templates.
- **NABLA Compliance**: The multi-agent approach inherently enforces signal plurality by gathering perspectives from multiple independent domain specialists. Contradiction preservation is built into the ideation process: when agents produce conflicting recommendations, both are preserved and presented with their respective rationale. The interactive refinement loop ensures that the "unknown is valid" axiom is respected, as the user is not forced to proceed until ambiguities are resolved.

## Best Practices

1. **Provide rich context**: The more detail in the initial topic description, the more accurately the agent discovery system can select relevant specialists
2. **Engage with refinement**: The interactive refinement phase is where /brainstorm adds the most value; invest time in answering clarification questions rather than skipping to ideation
3. **Adjust agents when needed**: If the automatically selected agents do not match your expectations, use the [A] option to modify the team rather than accepting a suboptimal composition
4. **Save reports for reference**: Brainstorming reports serve as decision documentation; save them for future reference when implementing the chosen approach
5. **Iterate on framing**: If the initial results are not useful, try reframing the problem using the alternative framings suggested during refinement
6. **Combine with /architect**: After brainstorming produces a preferred approach, use [/architect](/commands/architect/) to generate a formal architectural analysis of the chosen solution

## Related Commands

- [/code](/commands/code/) - Core coding implementation and feature development
- [/fix](/commands/fix/) - Bug fix implementation with mandatory [regression tests](/capabilities/regression-tests/)
- [/test](/commands/test/) - Comprehensive test generation and verification
- [/architect](/commands/architect/) - Architecture design and recommendation generation
- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](/commands/quality-enforce/) - Mandatory progressive [quality debt](/glossary/quality-debt/) elimination with AIAD enforcement
- [/regression-check](/commands/regression-check/) - Execute 25 custom [Credo](/glossary/credo/) regression checks preventing 700+ violations
- [/orchestrate](/commands/orchestrate/) - Revolutionary AI-powered task orchestration with 10x development efficiency

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)