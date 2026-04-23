+++
title = "Prismatic Bifurcation"
weight = 49
[extra]
icon = "arrows-pointing-out"
color = "fuchsia"
description = "Decision branching and scenario analysis for strategic intelligence assessment"
category = "Analytics"
files = "120"
status = "Development"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1012
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Bifurcation", "Decision", "apps", "Analytics", "Prismatic Platform", "Monte Carlo", "Scenario", "PrismaticBifurcation", "Carlo"]
tags = ["apps", "analytics", "prismatic-bifurcation", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Bifurcation - Prismatic Platform"
+++

## Overview

Prismatic Bifurcation provides decision branching and scenario analysis capabilities for strategic intelligence assessment within the Prismatic Platform. The system models multiple possible outcomes from a given entity state, evaluates branching points in behavioral event streams, and supports strategic assessment through "what if" scenario exploration across the intelligence pipeline. Bifurcation integrates with [Prismatic Monte Carlo](/apps/prismatic-monte-carlo/) for probabilistic branch evaluation, [Prismatic Nabla](/apps/prismatic-nabla/) for confidence propagation through decision trees, and [Prismatic Graph](/apps/prismatic-graph/) for scenario state snapshots.

Intelligence analysis frequently requires evaluating how a situation might evolve under different conditions. When a vulnerability is disclosed affecting a monitored entity, the security outcome depends on whether the entity patches quickly, the vulnerability gets exploited in the wild, or the entity ignores the disclosure entirely. Each scenario leads to different [security rating](/glossary/security-rating/) trajectories, compliance implications, and risk assessments. Without systematic scenario analysis, these evaluations remain informal and subjective. Prismatic Bifurcation formalizes scenario analysis by modeling decision trees with probability-weighted branches, enabling quantitative comparison of possible futures.

Each scenario branch is evaluated independently with cascading effect analysis, producing probability-weighted outcome distributions that inform decision recommendations with quantified uncertainty. The design goals encompass branch point identification to detect decision points in event streams where entity behavior could diverge, multi-scenario simulation to model and evaluate multiple outcome scenarios per branch point, probability assignment using Monte Carlo methods, cascading effect analysis to trace how branch outcomes propagate through dependent systems, decision support to produce ranked recommendations with confidence-weighted expected outcomes, and NABLA compliance ensuring all scenario assessments carry provenance and confidence per epistemic axioms.

## Architecture

The architecture follows a pipeline pattern from event stream monitoring through scenario evaluation to decision recommendation. Branch detection feeds into parallel scenario evaluation, with results converging in the decision engine.

```
Event Stream --> Branch Point Detector
       |
  Scenario Generator
  (enumerate possible outcomes)
       |
  +----+----+----+
  |    |    |    |
  Scenario A  Scenario B  Scenario C
  (probability: 0.4) (0.35) (0.25)
       |
  Cascading Effect Analyzer
  (trace impact through dependencies)
       |
  Monte Carlo Evaluation
  (probability-weighted outcomes)
       |
  Decision Recommendation
  (ranked scenarios with confidence)
```

The process topology uses a one-for-one supervisor strategy with a BranchDetector GenServer monitoring event streams for branch point patterns and a Task.Supervisor for parallel scenario evaluation:

```
PrismaticBifurcation.Application (Supervisor, :one_for_one)
+-- PrismaticBifurcation.BranchDetector (GenServer)
|     Monitors event streams for branch point patterns
+-- Task.Supervisor
      Parallel scenario evaluation tasks
```

Event streams are monitored for branch point patterns including vulnerability disclosures, configuration changes, and compliance deadline approaches. When a branch point is detected, the ScenarioGenerator enumerates possible outcomes based on historical patterns and domain rules. Each scenario is evaluated through the CascadeAnalyzer to determine downstream effects, then quantified via Monte Carlo simulation. The DecisionEngine ranks scenarios by expected outcome and produces recommendations.

## Key Modules

| Module | Responsibility |
|--------|----------------|
| `PrismaticBifurcation` | Public facade: `analyze/1`, `evaluate_scenario/2`, `recommend/1` |
| `PrismaticBifurcation.BranchDetector` | Identify decision points in event streams via pattern matching |
| `PrismaticBifurcation.ScenarioGenerator` | Enumerate possible outcomes per branch point using domain rules |
| `PrismaticBifurcation.CascadeAnalyzer` | Trace impact propagation through dependent systems and entities |
| `PrismaticBifurcation.Evaluator` | Monte Carlo-based scenario evaluation with configurable iterations |
| `PrismaticBifurcation.DecisionEngine` | Multi-criteria decision analysis and ranked recommendation output |

Branch points are detected by matching event stream patterns against a rule library. For example, a "vulnerability disclosed" event affecting a monitored entity triggers a branch point with scenarios: patch within SLA, exploit before patch, and ignore. Pattern rules are defined declaratively and can be extended without modifying the detection engine.

```elixir
defmodule PrismaticBifurcation.Scenario do
  @type t :: %__MODULE__{
    id: String.t(),
    branch_point: BranchPoint.t(),
    name: atom(),
    description: String.t(),
    probability: float(),
    outcomes: %{atom() => term()},
    cascading_effects: [CascadeEffect.t()],
    time_horizon: pos_integer(),
    confidence: float()
  }
end
```

## Configuration

```elixir
config :prismatic_bifurcation,
  monte_carlo_iterations: 10_000,
  default_time_horizon: :days_30,
  confidence_threshold: 0.6,
  max_scenarios_per_branch: 10,
  cascade_depth_limit: 5,
  branch_detection_rules_path: "priv/rules/branch_patterns.yaml"
```

Configuration controls the number of Monte Carlo iterations per scenario evaluation (trading accuracy for speed), default time horizon for forward-looking analysis, the minimum confidence threshold for including a scenario in recommendations, maximum branching factor per decision point, and cascade analysis depth limit to prevent infinite propagation chains.

## API Reference

```elixir
# Analyze decision branches for an entity
@spec analyze(keyword()) :: {:ok, [Scenario.t()]}
PrismaticBifurcation.analyze(
  entity: "example.com",
  event: :new_vulnerability_disclosed,
  scenarios: [:patched_quickly, :exploited, :ignored])

# Evaluate a specific scenario with time horizon
@spec evaluate_scenario(atom(), keyword()) :: {:ok, ScenarioOutcome.t()}
PrismaticBifurcation.evaluate_scenario(:exploited, time_horizon: :days_30)

# Get ranked decision recommendation with criteria weights
@spec recommend(keyword()) :: {:ok, Recommendation.t()}
PrismaticBifurcation.recommend(
  entity: "example.com",
  criteria_weights: %{security: 0.4, cost: 0.3, compliance: 0.3})
```

The DecisionEngine evaluates scenarios across multiple dimensions (security impact, compliance impact, cost, likelihood) and produces a weighted ranking using configurable criteria weights. All recommendations carry confidence scores derived from the underlying Monte Carlo simulations.

## Testing

Branch detection tests verify correct identification of known event patterns against a curated set of branch point scenarios. Scenario evaluation tests verify probability calculations against analytical solutions for simple cases where closed-form results are available.

End-to-end integration tests exercise the full analysis pipeline from event through branch detection, scenario generation, evaluation, and recommendation output. Property-based tests use StreamData generators to produce random event sequences and scenario parameters, verifying that probabilities always sum to 1.0 per branch and that recommendations are consistent with scenario evaluations.

## Integration Points

| Application | Relationship |
|-------------|--------------|
| [Prismatic Monte Carlo](/apps/prismatic-monte-carlo/) | Probabilistic scenario evaluation engine |
| [Prismatic Nabla](/apps/prismatic-nabla/) | Confidence propagation through branching structures |
| [Prismatic Graph](/apps/prismatic-graph/) | Scenario state snapshots in knowledge graph |
| [Prismatic Perimeter](/apps/prismatic-perimeter/) | Security rating scenario analysis for EASM |
| [Prismatic Compliance](/apps/prismatic-compliance/) | Compliance impact forecasting across scenarios |

Scenario evaluations are dispatched as supervised tasks for parallel processing. Branch detection monitors [PubSub](/glossary/pubsub/) event topics for incoming events. All computation is performed locally using platform data with no external service dependencies.

## NABLA Compliance

Prismatic Bifurcation enforces [NABLA](/glossary/nabla-infinity/) axiom compliance on all scenario assessments and decision recommendations.

| NABLA Axiom | Bifurcation Enforcement | Implementation |
|-------------|------------------------|----------------|
| Signal Plurality | Multiple scenario paths provide independent assessment signals | Each branch evaluated independently before aggregation |
| Contradiction Preservation | Conflicting scenario outcomes preserved in recommendation output | Recommendation includes both favorable and unfavorable scenarios |
| Provenance Mandatory | Every recommendation traces to specific branch points and rules | Full derivation chain from event through scenario to recommendation |
| Time Decay | Scenario probabilities carry temporal validity windows | Time horizon annotations on all probability estimates |
| Unknown Valid | Scenarios with insufficient data explicitly marked as uncertain | Low-confidence scenarios included with uncertainty quantification |

Scenario manipulation through biased probability inputs could lead to incorrect strategic recommendations. Mitigations include NABLA confidence tracking and mandatory multi-source probability estimation.

## Performance

| Operation | Latency | Notes |
|-----------|---------|-------|
| Branch point detection | < 10ms | Rule matching on event |
| Scenario generation | 10-50ms | Per branch point |
| Monte Carlo evaluation (10K iterations) | 100-500ms | Per scenario |
| Full analysis (3 scenarios) | 500ms-2s | Including cascade analysis |

Scenario evaluations parallelize across branches. Monte Carlo iterations are embarrassingly parallel and scale linearly with available CPU cores.

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| Memory | 128 MB | 512 MB |
| CPU | 2 cores | 4 cores |

[Telemetry](/glossary/telemetry/) events: `[:prismatic, :bifurcation, :analysis_complete]`, `[:prismatic, :bifurcation, :recommendation_generated]`.

## Related Resources

- [Prismatic Monte Carlo](/apps/prismatic-monte-carlo/) -- Probabilistic simulation engine
- [Prismatic Nabla](/apps/prismatic-nabla/) -- Epistemic confidence framework
- [Prismatic Graph](/apps/prismatic-graph/) -- [Knowledge graph](/glossary/knowledge-graph/) for state snapshots
- [Evolution Orchestrator Supreme](/agents/evolution-orchestrator-supreme/) -- Drives scenario evaluation evolution for improved decision recommendations
- [Cross-Pollination Specialist](/agents/cross-pollination-specialist/) -- Transfers bifurcation analysis patterns across security, compliance, and risk domains
- [Evidence Enforcement Agent](/agents/evidence-enforcement-agent/) -- Ensures scenario recommendations carry verifiable probability and confidence chains
- [NABLA Axioms](/capabilities/nabla-axioms/) -- Confidence propagation through decision branches with provenance tracking
- [Multi-Paradigm Solving](/capabilities/multi-paradigm-solving/) -- Combines Monte Carlo, graph analysis, and decision theory for scenario evaluation
- [Trinity Gate](/capabilities/trinity-gate/) -- Formal verification of scenario probability consistency and cascading effect logic

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)