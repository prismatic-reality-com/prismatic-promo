+++
title = "estimator"
weight = 153
[extra]
domain = "decomposer"
level = "L3"
description = "Evidence-based effort estimation through historical velocity analysis, complexity metrics, and calibrated prediction with uncertainty quantification"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "telemetry"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2000
quality_score = 85
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["estimator", "Evidence-based", "agents", "agent", "Prismatic Platform", "The Estimator", "Risk", "Complexity"]
tags = ["agents", "agent", "estimator", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "estimator - Prismatic Platform"
+++

## Overview

The Estimator Agent operates as an L3 [strategic command](@/glossary/strategic-command.md) agent within the Decomposer domain of the Prismatic Platform. This agent analyzes project backlogs, historical velocity data, and complexity [metrics](@/glossary/metrics.md) to produce evidence-based effort estimates for development tasks. By combining quantitative analysis of past performance with structural complexity assessment of proposed work, the Estimator delivers calibrated predictions that account for uncertainty and risk factors rather than the single-point guesses that characterize most software estimation practices.

Estimation in a platform of this scale -- 90 [umbrella application](@/glossary/umbrella-application.md)s, 6,600+ source files, 430+ autonomous agents -- requires more than naive story-point assignment. The Estimator Agent examines task structure, identifies analogous historical tasks, measures the complexity of affected code regions through cyclomatic complexity and coupling metrics, and produces estimates with explicit confidence intervals. This approach eliminates the optimism bias that plagues manual estimation and provides planning decisions with quantified uncertainty.

Software estimation has a well-documented history of systematic failure. Projects routinely exceed estimates by 50-100%, and traditional estimation methods (expert judgment, analogy, parametric models) each have known biases and failure modes. The Estimator Agent addresses this by combining multiple estimation methods, cross-validating results, and always presenting estimates as probability distributions rather than point values. A task estimated at "3 days" is meaningless without confidence bounds; a task estimated at "2-5 days with 80% confidence" enables informed planning decisions.

## Operational Domain

The Decomposer domain handles the systematic breakdown of large objectives into estimable work units. The Estimator Agent operates at the estimation stage of this pipeline, receiving decomposed tasks and producing calibrated effort predictions. These estimates feed into the platform's planning and scheduling systems, enabling resource allocation decisions grounded in evidence rather than intuition.

The domain's value proposition is precision through decomposition: large objectives that are impossible to estimate accurately are broken into smaller units where historical data, complexity metrics, and analogous task matching produce reliable predictions. The Estimator works with the output of decomposition agents that ensure each estimation target is small enough for meaningful prediction.

## Key Capabilities

The Estimator Agent provides six core estimation capabilities that together produce calibrated effort predictions.

**Historical velocity analysis** examines past task completion rates, adjusted for complexity and team composition, to calibrate baseline estimation models. The agent maintains historical records of estimated-vs-actual durations for all completed tasks, using this data to calculate velocity metrics (tasks per week, story points per sprint, hours per complexity unit) that serve as baseline references for new estimates. Velocity data is segmented by task type, application area, and complexity level to provide relevant reference points for each new estimate.

**Complexity-driven estimation** measures cyclomatic complexity, coupling metrics, and dependency depth of affected code regions to quantify technical difficulty. The agent analyzes the specific files and modules that a task will modify, computing structural complexity metrics that predict implementation effort. High coupling (many dependencies between modules), high cyclomatic complexity (many decision paths), and deep dependency chains (changes that cascade across applications) all increase estimated effort. These metrics provide objective difficulty measurements that complement subjective task descriptions.

**Confidence interval generation** produces estimates with explicit uncertainty ranges rather than single-point predictions, enabling risk-aware planning decisions. The agent computes confidence intervals at multiple levels (50%, 80%, 95%) based on historical variance for similar tasks and the current estimate's risk factors. Wide confidence intervals indicate high estimation uncertainty, signaling that the task may benefit from further decomposition or spike investigation before commitment.

**Analogous task matching** identifies historically completed tasks with similar characteristics to the current estimate target, using their actual durations as reference points. The agent matches on multiple dimensions: affected applications, code complexity, task type (feature, bugfix, refactor), and dependency structure. Matched tasks provide empirical duration data that grounds the estimate in actual outcomes rather than theoretical models.

**Risk factor identification** flags estimation-relevant risks including unfamiliar technology, cross-application dependencies, quality gate complexity, and external system integration. Each identified risk factor includes a quantified impact estimate on the overall effort prediction. Risk factors widen confidence intervals and raise the median estimate, reflecting the empirical observation that risks almost always add effort rather than reduce it.

**Estimate calibration and tracking** continuously improves estimation accuracy by comparing predictions against actual outcomes and adjusting models accordingly. When completed tasks significantly exceed or fall below their estimates, the agent investigates the cause of the deviation and updates its estimation models to prevent similar miscalibration in future estimates.

## Estimation Methodology

The Estimator Agent combines multiple estimation methods and cross-validates results.

```
Task Description --> Complexity Analysis --> Historical Matching --> Multi-Method Estimation
       |                    |                      |                        |
   Requirements         Cyclomatic             Analogous task          Parametric model
   Affected files       complexity             identification          Reference class
   Dependencies         Coupling metrics       Duration data           Expert heuristics
   Risk factors         Dependency depth       Outcome variance

   --> Cross-Validation --> Confidence Interval --> Risk Adjustment --> Delivery
           |                      |                     |                 |
       Method comparison       50/80/95%             Risk factor       Distribution
       Outlier detection       confidence             impact            with metadata
       Consensus building      bounds                 adjustment        and provenance
```

## Estimation Output Format

Estimates are delivered as probability distributions with supporting metadata.

| Component | Content | Purpose |
|-----------|---------|---------|
| Median estimate | Central tendency prediction | Planning reference point |
| 50% confidence interval | Likely range | Scheduling baseline |
| 80% confidence interval | Extended range | Buffer planning |
| 95% confidence interval | Extreme range | Risk assessment |
| Analogous tasks | Historical reference data | Estimate justification |
| Risk factors | Identified risk catalog | Uncertainty explanation |
| Complexity metrics | Code analysis results | Difficulty quantification |

## Estimation Accuracy Metrics

The agent tracks its own estimation accuracy to drive continuous improvement.

| Metric | Target | Description |
|--------|--------|-------------|
| Mean Estimation Ratio | 0.9 - 1.1 | Actual/estimated ratio across all tasks |
| 80% Interval Capture Rate | > 80% | Percentage of actuals falling within 80% CI |
| Systematic Bias | < 5% | Consistent over- or under-estimation trend |
| Extreme Miss Rate | < 5% | Percentage of tasks exceeding 95% CI |
| Calibration Score | > 0.85 | Statistical calibration quality |

## Authority Level

**L3** - Strategic Command - Multi-domain coordination and specialized operational command. The Estimator has authority to request complexity analyses of any codebase region, access historical task completion data, and produce estimates that inform planning decisions across the platform.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [compressor](@/agents/compressor.md) | Task Input | Provides compressed task descriptions for estimation processing |
| [explain-specialist](@/agents/explain-specialist.md) | Complexity Analysis | Clarifies technical complexity factors that influence estimation |
| [evolution-analyzer-specialist](@/agents/evolution-analyzer-specialist.md) | Historical Data | Provides ecosystem health metrics for context |

## Common Estimation Pitfalls

The Estimator Agent explicitly avoids well-documented estimation anti-patterns.

| Anti-Pattern | Description | Agent Mitigation |
|-------------|-------------|-----------------|
| Anchoring bias | First number dominates thinking | Multiple independent methods |
| Planning fallacy | Best-case as typical | Reference class forecasting |
| Scope creep blindness | Ignoring scope growth risk | Explicit scope risk factors |
| Single-point estimates | No uncertainty communication | Mandatory confidence intervals |
| Happy path bias | Ignoring error handling effort | Complexity metrics include error paths |

## Enforcement

All estimation operations are governed by the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. Estimates without confidence intervals are rejected as incomplete. No estimate is treated as a commitment -- estimates are predictions with quantified uncertainty. The NABLA [Time Decay](@/glossary/time-decay.md) axiom ensures that historical velocity data is weighted by recency, preventing outdated performance data from skewing current estimates. Over-optimistic estimates that consistently miss targets trigger recalibration and investigation.

## Related Agents

- [**compressor**](@/agents/compressor.md) (L3) - Task compression and decomposition feeding estimation
- [**explain-specialist**](@/agents/explain-specialist.md) (L3) - Technical complexity clarification for estimation inputs
- [**evolution-analyzer-specialist**](@/agents/evolution-analyzer-specialist.md) (L3) - Ecosystem metrics providing estimation context

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)