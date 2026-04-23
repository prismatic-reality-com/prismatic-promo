+++
title = "l3-strategy-optimizer"
weight = 214
[extra]
domain = "meta-learning-optimization"
level = "L3"
description = "Third-level strategic optimization engine for intelligence pipeline parameter tuning, collection strategy refinement, and meta-learning across investigation campaigns"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "seadf", "telemetry", "lean4", "nabla-infinity", "trinity-gate"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["l3-strategy-optimizer", "Third-level", "agents", "agent", "Prismatic Platform", "Czech", "Receives", "Strategic Command", "AIAD"]
tags = ["agents", "agent", "l3-strategy-optimizer", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "l3-strategy-optimizer - Prismatic Platform"
+++

## Overview

The l3-strategy-optimizer is an L3 [Strategic Command](@/glossary/strategic-command.md) agent operating within the meta-learning optimization domain of the Prismatic Platform. It serves as the third and highest processing level in the platform's three-tier intelligence pipeline (L1 pattern recognition, L2 entity resolution, L3 strategy optimization), responsible for analyzing the effectiveness of intelligence collection and analysis strategies across investigation campaigns and optimizing pipeline parameters to improve future performance. While L1 operates on data patterns and L2 operates on entities, L3 operates on strategies -- the meta-level decisions about how intelligence is collected, processed, and analyzed.

Built on the [AIAD](@/glossary/aiad.md) standard with integration into the platform's [SEADF](@/glossary/seadf.md) (Self-Evolving Autonomous Deterministic Framework), the l3-strategy-optimizer implements a continuous improvement loop where the outcomes of completed investigations inform the configuration and execution of future investigations. This meta-learning capability enables the intelligence pipeline to become more effective over time without requiring manual parameter tuning or heuristic adjustment.

## Meta-Learning Architecture

The meta-learning architecture operates on two feedback loops: a short-term tactical loop and a long-term strategic loop. The tactical loop adjusts pipeline parameters within a single investigation based on intermediate results. For example, if early data collection reveals that a target entity is a Czech s.r.o. (limited liability company), the tactical loop can adjust downstream collection parameters to prioritize Czech registry sources, activate Czech-specific pattern recognition rules in the [l1-pattern-engine](@/agents/l1-pattern-engine.md), and configure Czech phonetic matching in the [l2-entity-resolver](@/agents/l2-entity-resolver.md).

The strategic loop analyzes aggregate performance across completed investigations to identify systematic optimization opportunities. This analysis examines which data sources consistently produce the most valuable intelligence for different entity types, which pattern recognition rules have the highest precision and recall rates, which entity resolution thresholds produce the best balance of false positives and false negatives, and which investigation workflow structures yield the most comprehensive results for different investigation categories.

The strategic loop's outputs take the form of pipeline configuration updates that propagate to all agents in the intelligence pipeline. These updates are version-controlled and reversible, with performance monitoring that automatically rolls back configuration changes that degrade pipeline performance below established baselines.

## Key Capabilities

- **Investigation outcome analysis** -- Analyzes completed investigation outcomes to extract performance metrics including intelligence yield (useful findings per source queried), collection efficiency (time and resource cost per finding), and resolution accuracy (entity resolution correctness rates)
- **Source effectiveness ranking** -- Maintains dynamic rankings of intelligence sources by their effectiveness for different entity types, investigation categories, and geographic contexts, informing source selection in future investigations
- **Pipeline parameter optimization** -- Tunes configurable parameters across all pipeline stages (blocking keys, matching thresholds, confidence cutoffs, parallelism levels) based on historical performance data
- **Strategy template refinement** -- Evolves investigation workflow templates based on outcome analysis, adjusting stage ordering, source selection, and analysis depth to optimize for investigation success metrics
- **A/B testing of pipeline configurations** -- Supports controlled experiments comparing alternative pipeline configurations on matched investigation sets, with statistical analysis of performance differences
- **Feedback loop to L1 and L2** -- Pushes optimized parameters and configuration updates to the [l1-pattern-engine](@/agents/l1-pattern-engine.md) and [l2-entity-resolver](@/agents/l2-entity-resolver.md), closing the optimization loop
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with continuous analysis of investigation outcomes
- **[Telemetry integration](@/capabilities/telemetry-integration.md)** for optimization impact measurement and regression monitoring

## Optimization Dimensions

The strategy optimizer operates across several optimization dimensions, each with distinct metrics and tuning mechanisms.

**Source selection optimization** determines which intelligence sources to query for different investigation types. The optimizer tracks source yield (percentage of queries that return actionable data), source latency (time from query to result), source cost (financial and computational cost per query), and source reliability (percentage of queries that complete successfully). These metrics drive dynamic source prioritization that allocates investigation resources to the highest-value sources for each investigation context.

**Collection depth optimization** determines how deeply the pipeline explores each intelligence dimension. Deeper collection (more sources, more relationship hops, longer temporal windows) produces more comprehensive intelligence but at increasing marginal cost. The optimizer models the relationship between collection depth and intelligence yield for different investigation types, identifying the depth threshold beyond which additional collection produces diminishing returns.

**Resolution threshold optimization** tunes the matching and clustering thresholds in the [l2-entity-resolver](@/agents/l2-entity-resolver.md). Lower thresholds produce more entity merges but risk false positives (incorrectly merging distinct entities). Higher thresholds reduce false positives but risk false negatives (failing to merge records that represent the same entity). The optimizer calibrates thresholds based on the downstream impact of resolution errors, weighting false positive costs against false negative costs for each investigation context.

**Workflow structure optimization** refines the ordering and composition of investigation stages. Some investigation types benefit from early broad collection followed by targeted deep dives into promising leads. Others benefit from focused initial collection with progressive broadening based on initial findings. The optimizer identifies the most effective workflow structures for different investigation categories and codifies them as reusable templates.

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination authority enabling the strategy optimizer to access investigation outcome data across all intelligence domains, modify pipeline configuration parameters, and publish optimized strategy templates to the investigation workflow registry.

## Integration Architecture

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Runtime execution and lifecycle management |
| [SEADF](@/glossary/seadf.md) | Autonomous evolution framework for strategy optimization cycles |
| Prismatic Telemetry | Investigation outcome [metrics](@/glossary/metrics.md) and optimization impact measurement |
| [PostgreSQL](@/glossary/postgresql.md) | Historical investigation outcome data storage and analysis |
| AIAD [Registry](@/glossary/registry-otp.md) | Agent configuration management and parameter distribution |
| [Trinity Gate](@/glossary/trinity-gate.md) | Validation of optimization decisions against epistemic constraints |

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/l3 optimize <pipeline>` | Run optimization analysis for a specified pipeline | L3+ |
| `/l3 sources --rank` | Display source effectiveness rankings | L2+ |
| `/l3 ab-test <config_a> <config_b>` | Configure A/B test between two pipeline configurations | L3+ |
| `/l3 rollback <config_version>` | Roll back pipeline configuration to a previous version | L3+ |

## Coordination with Pipeline Agents

| Agent | Relationship |
|-------|-------------|
| [**l1-pattern-engine**](@/agents/l1-pattern-engine.md) (L3) | Receives optimized pattern recognition parameters and rule priorities |
| [**l2-entity-resolver**](@/agents/l2-entity-resolver.md) (L3) | Receives optimized matching thresholds and blocking key configurations |
| [**investigate-coordinator**](@/agents/investigate-coordinator.md) (L3) | Receives optimized investigation workflow templates and source rankings |

## Formal Verification

Critical optimization decisions are subject to formal verification through [Lean4](@/glossary/lean4.md) proofs that guarantee optimization invariants. Five core theorems govern the strategy optimizer's behavior: monotonicity (optimization cycles never degrade overall pipeline performance below the pre-optimization baseline), convergence (parameter tuning converges toward stable optima rather than oscillating), reversibility (every optimization can be rolled back to restore the previous state), isolation (optimization changes to one pipeline stage do not create regressions in other stages), and boundedness (optimized parameters remain within declared valid ranges).

## Enforcement

The [NO MERCY](@/glossary/no-mercy.md) doctrine requires that optimization recommendations are backed by statistical evidence with stated significance levels. The [NABLA Infinity](@/glossary/nabla-infinity.md) framework ensures that optimization decisions consider multiple performance dimensions rather than optimizing a single metric at the expense of others. The [NO DOUBTS](@/glossary/no-doubts.md) principle requires that the optimizer explicitly quantifies its confidence in proposed parameter changes and flags high-uncertainty optimizations for human review before deployment.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)