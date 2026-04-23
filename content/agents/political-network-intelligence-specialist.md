+++
title = "political-network-intelligence-specialist"
weight = 304
[extra]
domain = "political"
level = "L3"
description = "Specialized intelligence gathering and analysis"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "seadf", "telemetry", "osint"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2200
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["political-network-intelligence-specialist", "Specialized", "agents", "agent", "Prismatic Platform", "Political", "NABLA Infinity", "Influence", "Temporal"]
tags = ["agents", "agent", "political-network-intelligence-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "political-network-intelligence-specialist - Prismatic Platform"
+++

## Overview

The political-network-intelligence-specialist operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform's political intelligence domain, dedicated to mapping and analyzing political relationship networks, influence structures, and power dynamics. This agent constructs graph-based models of political entities -- individuals, organizations, lobbying groups, and institutional actors -- and their interconnections, revealing influence pathways, alliance structures, and potential conflicts of interest that are not visible through surface-level analysis.

Built on the [AIAD](@/glossary/aiad.md) standard and leveraging the platform's [OSINT](@/glossary/osint.md) infrastructure, this agent synthesizes intelligence from public records, legislative databases, campaign finance disclosures, lobbying registrations, and media reporting. All network models comply with [NABLA Infinity](@/glossary/nabla-infinity.md) axioms: every relationship link requires evidence from at least two independent sources, and all entity attributions carry quantified confidence scores. The [NO DOUBTS](@/glossary/no-doubts.md) principle ensures that speculative connections are never presented as established facts.

## Operational Domain

The political intelligence domain covers the analysis of governmental, legislative, regulatory, and institutional networks across multiple jurisdictions. The agent maintains living network models stored in [KuzuDB](@/glossary/kuzudb.md) graph database structures, supporting temporal analysis of how political relationships evolve over time. Network analysis extends to identifying indirect influence through intermediary entities, funding flows, and organizational affiliations.

| Network Layer | Entities | Relationships | Intelligence Value |
|--------------|---------|---------------|-------------------|
| Legislative | Legislators, committees, caucuses | Voting patterns, co-sponsorship | Policy prediction |
| Executive | Ministers, agencies, appointees | Reporting lines, jurisdiction | Regulatory anticipation |
| Lobbying | Lobbying firms, industry groups | Client relationships, spending | Influence mapping |
| Campaign Finance | Donors, PACs, party committees | Contributions, bundling | Funding dependency analysis |
| Institutional | Think tanks, NGOs, media orgs | Board memberships, funding | Ideological alignment |
| Corporate-Political | Companies, trade associations | Regulatory engagement, revolving door | Interest identification |

## Key Capabilities

- **Political network graph construction** -- Builds comprehensive relationship graphs of political actors, mapping direct connections, organizational affiliations, funding relationships, and shared institutional memberships using evidence from public sources
- **Influence pathway analysis** -- Identifies multi-hop influence paths through political networks, revealing indirect connections between actors who have no direct public relationship
- **Temporal network evolution** -- Tracks changes in political networks over time, detecting new alliances, dissolving relationships, and shifts in influence concentration
- **Conflict of interest detection** -- Cross-references network positions against regulatory roles, procurement decisions, and policy outcomes to identify potential conflicts
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with self-directed intelligence collection cycles
- **[Telemetry integration](@/capabilities/telemetry-integration.md)** for network model freshness tracking and query performance monitoring

## Network Analysis Engine

```elixir
defmodule Prismatic.Political.NetworkAnalyzer do
  @moduledoc """
  Constructs and analyzes political relationship networks
  from public records and OSINT sources.
  """

  alias Prismatic.Political.{EntityGraph, InfluenceCalculator, TemporalTracker}

  @type network_query :: %{
    source_entity: String.t(),
    target_entity: String.t() | nil,
    max_hops: pos_integer(),
    relationship_types: [atom()],
    time_window: {Date.t(), Date.t()} | nil
  }

  @spec analyze_influence(network_query()) :: {:ok, influence_report()} | {:error, term()}
  def analyze_influence(query) do
    with {:ok, subgraph} <- EntityGraph.extract_subgraph(query),
         {:ok, paths} <- find_influence_paths(subgraph, query),
         {:ok, scored} <- InfluenceCalculator.score_paths(paths) do
      report = %{
        source: query.source_entity,
        target: query.target_entity,
        paths: scored,
        strongest_path: List.first(scored),
        network_density: EntityGraph.density(subgraph),
        key_intermediaries: identify_intermediaries(scored)
      }

      emit_analysis_telemetry(report)
      {:ok, report}
    end
  end

  @spec detect_conflicts(String.t()) :: {:ok, [conflict()]}
  def detect_conflicts(entity_id) do
    roles = EntityGraph.get_roles(entity_id)
    interests = EntityGraph.get_financial_interests(entity_id)

    conflicts =
      for role <- roles,
          interest <- interests,
          overlap?(role.jurisdiction, interest.sector) do
        %{
          entity: entity_id,
          role: role,
          interest: interest,
          severity: calculate_conflict_severity(role, interest),
          evidence: gather_conflict_evidence(role, interest)
        }
      end

    {:ok, Enum.sort_by(conflicts, & &1.severity, :desc)}
  end
end
```

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination with authority to orchestrate OSINT collection operations and publish network intelligence products.

## Network Intelligence Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| Graph Coverage | Percentage of known political entities modeled | > 80% for target jurisdictions |
| Relationship Freshness | Age of most recent evidence for each link | < 90 days for active links |
| Path Discovery Rate | New influence paths identified per analysis | Monitored, trend-tracked |
| Confidence Distribution | Distribution of link confidence scores | > 60% at High or Confirmed |
| Temporal Coverage | Historical depth of network evolution data | > 5 years for key actors |

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/political-network map` | Generate network visualization for specified political entities | L3+ |
| `/political-network analyze` | Identify influence pathways between specified actors | L3+ |
| `/political-network monitor` | Set up continuous monitoring for network changes | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [linkedin-intelligence-specialist](@/agents/linkedin-intelligence-specialist.md) | Sources professional relationship data for network enrichment |
| [regulatory-intelligence-commander](@/agents/regulatory-intelligence-commander.md) | Provides political context for regulatory landscape analysis |
| [risk-intelligence-commander](@/agents/risk-intelligence-commander.md) | Network insights inform geopolitical risk assessments |
| [reputation-risk-specialist](@/agents/reputation-risk-specialist.md) | Political association analysis feeds reputation risk models |

## KuzuDB Graph Storage

Political network models are stored in [KuzuDB](@/glossary/kuzudb.md) graph database structures optimized for multi-hop traversal queries. The graph schema represents entities as nodes (persons, organizations, institutions) with typed relationship edges (funding, membership, appointment, lobbying). Temporal properties on edges enable point-in-time network snapshots, supporting "what did the network look like on date X" queries essential for historical influence analysis.

## Network Analysis Algorithms

The political-network-intelligence-specialist employs several graph analysis algorithms from network science to extract intelligence from political relationship models.

### Centrality Analysis

Centrality measures identify the most influential actors in a political network. The specialist computes multiple centrality metrics for each entity: **degree centrality** (how many direct connections an entity has), **betweenness centrality** (how often an entity lies on the shortest path between other entities), **closeness centrality** (how close an entity is to all other entities in the network), and **eigenvector centrality** (how connected an entity is to other well-connected entities). Each centrality measure reveals a different aspect of influence: degree centrality identifies the most connected actors, betweenness centrality identifies the key intermediaries and gatekeepers, and eigenvector centrality identifies those connected to power centers.

### Community Detection

Community detection algorithms identify clusters of entities that are more densely connected to each other than to the rest of the network. In political networks, communities often correspond to political factions, industry alliances, or ideological groups. The specialist applies modularity-based community detection (Louvain algorithm) to the political network graph, identifying natural groupings that may not be visible through surface-level analysis. Changes in community structure over time -- entities shifting from one community to another, communities merging or splitting -- provide early indicators of political realignment.

### Temporal Network Analysis

Political networks are dynamic: relationships form, strengthen, weaken, and dissolve over time. The specialist maintains temporal properties on all relationship edges, enabling point-in-time network snapshots and trend analysis. Key temporal metrics include relationship duration (how long a connection has existed), relationship recency (when the connection was last evidenced), and relationship trajectory (whether the connection is strengthening or weakening based on evidence frequency). Temporal analysis enables the specialist to answer questions such as "who were the key intermediaries between actors X and Y three years ago, and how has that changed?"

## Intelligence Product Formats

The political-network-intelligence-specialist produces several types of intelligence products, each tailored to specific analytical needs.

| Product | Format | Content | Use Case |
|---------|--------|---------|----------|
| Network Map | Interactive graph visualization | Entity nodes, relationship edges, centrality highlighting | Visual briefing for stakeholders |
| Influence Report | Structured text with evidence | Influence pathways, intermediary analysis, confidence scores | Due diligence and risk assessment |
| Community Analysis | Cluster diagram with membership lists | Political faction identification, cross-community bridges | Political landscape understanding |
| Temporal Brief | Timeline visualization with narrative | Relationship evolution, emerging alliances, dissolving connections | Trend monitoring and forecasting |
| Conflict Matrix | Cross-reference table | Role-interest overlaps, potential conflicts, severity ratings | Governance and compliance review |

Each product includes mandatory NABLA Infinity provenance sections that link every claim to its source evidence, state the confidence level for each assertion, and explicitly identify analytical gaps where evidence is insufficient to support conclusions.

## Enforcement

All network intelligence outputs comply with strict [NO MERCY](@/glossary/no-mercy.md) doctrine requirements: no network model is published without complete provenance chains, every entity requires verified identification, and all relationship claims must pass [Trinity Gate](@/glossary/trinity-gate.md) validation. The agent enforces source independence per [NABLA Infinity](@/glossary/nabla-infinity.md) axioms to prevent single-source network claims from entering analytical products. Speculative connections are labeled with explicit confidence scores and never presented as established facts.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)