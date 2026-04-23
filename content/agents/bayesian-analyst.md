+++
title = "bayesian-analyst"
weight = 51
[extra]
domain = "general"
level = "L3"
description = "Probabilistic reasoning specialist implementing Bayesian inference, Monte Carlo methods, and belief network analysis for uncertainty quantification"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "nabla-infinity", "telemetry", "3nl", "trinity-gate", "confidence-scoring", "signal-plurality"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 85
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["bayesian-analyst", "Probabilistic", "Bayesian", "Monte", "Carlo", "agents", "agent", "Prismatic Platform", "Monte Carlo", "Step"]
tags = ["agents", "agent", "bayesian-analyst", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "bayesian-analyst - Prismatic Platform"
+++

## Overview

The Bayesian Analyst operates as an L3 [strategic command](@/glossary/strategic-command.md) agent providing probabilistic reasoning capabilities within the Prismatic Platform. This agent implements Bayesian [inference](@/glossary/inference.md), Monte Carlo simulation methods, and belief network analysis for uncertainty quantification across the platform's decision-making processes. In an intelligence platform where decisions must be made under uncertainty, the Bayesian Analyst provides the mathematical framework for reasoning about probability, updating beliefs with new evidence, and quantifying confidence levels.

The [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic framework requires that all platform beliefs carry confidence scores and that uncertainty is treated as legitimate data rather than noise to be eliminated. The Bayesian Analyst operationalizes these requirements by implementing prior-posterior update cycles, computing marginal probabilities over complex belief networks, and running Monte Carlo simulations to estimate distributions when analytical solutions are intractable. This agent directly supports the [Trinity Gate](@/glossary/trinity-gate.md)'s formal necessity layer by providing probabilistic proofs where deterministic proofs are not possible.

The distinction between genuine knowledge and false certainty is central to the platform's epistemic integrity. The Bayesian Analyst enforces this distinction by ensuring that every probability estimate includes its uncertainty range, every belief update documents the evidence that drove it, and every confidence claim is calibrated against historical prediction accuracy.

## Operational Domain

The Bayesian Analyst serves all platform domains that require uncertainty quantification. This includes [OSINT](@/glossary/osint.md) intelligence [confidence scoring](@/glossary/confidence-scoring.md), security risk probability estimation for [Prismatic Perimeter](@/glossary/prismatic-perimeter.md) assessments, compliance likelihood evaluation, and agent fitness scoring in the evolutionary framework. The agent provides a shared probabilistic reasoning service that ensures consistent uncertainty quantification methodology across the platform.

The General domain placement ensures that probabilistic reasoning is available to all consuming agents without domain restrictions. This is essential because uncertainty quantification is a cross-cutting concern: OSINT analysts need confidence scores for intelligence findings, security agents need probability estimates for vulnerability exploitation, compliance agents need likelihood assessments for regulatory risk, and evolution agents need fitness probability distributions for selection decisions.

## Key Capabilities

- **Bayesian inference engine** implementing prior-posterior update cycles that systematically incorporate new evidence to refine belief probabilities, following the NABLA [Time Decay](@/glossary/time-decay.md) axiom for evidence freshness weighting

- **Monte Carlo simulation** running configurable simulation passes to estimate probability distributions for complex scenarios where analytical Bayesian solutions are computationally intractable. The simulation engine supports both standard Monte Carlo sampling and Markov Chain Monte Carlo (MCMC) methods for high-dimensional parameter spaces.

- **Belief network construction** building and maintaining directed acyclic graphs of conditional dependencies between platform beliefs, enabling propagation of evidence updates through connected propositions so that updating one belief correctly propagates to all dependent beliefs

- **Confidence calibration** ensuring that stated confidence levels accurately reflect actual prediction accuracy through calibration testing and historical accuracy tracking. A system that claims 90% confidence should be correct approximately 90% of the time -- deviations trigger automatic recalibration.

- **Multi-hypothesis tracking** maintaining and updating probability estimates for competing hypotheses simultaneously, supporting the NABLA [Signal Plurality](@/glossary/signal-plurality.md) axiom by preventing premature convergence on a single explanation

- **Sensitivity analysis** identifying which evidence inputs most strongly influence posterior beliefs, enabling focused data collection that maximizes belief refinement per unit of investigation effort

## Bayesian Update Protocol

The Bayesian Analyst follows a formal update protocol that ensures epistemic rigor in every belief modification.

**Step 1: Prior Assessment.** Before incorporating new evidence, the analyst documents the current belief state including the prior probability, the evidence basis for the prior, and the confidence in the prior itself. Priors without documented provenance are flagged for NABLA [Provenance Mandatory](@/glossary/provenance-mandatory.md) violation.

**Step 2: Evidence Evaluation.** New evidence is evaluated for relevance, reliability, and independence. The analyst computes the likelihood of observing this evidence under each competing hypothesis. Evidence from independent sources receives higher weight than correlated evidence, following the NABLA Source Independence axiom.

**Step 3: Posterior Computation.** Bayes' theorem is applied to compute the posterior probability incorporating the new evidence. For simple models, this is analytical. For complex belief networks, the analyst uses either exact inference (variable elimination, junction tree) or approximate inference (MCMC, variational methods) depending on network complexity.

**Step 4: Calibration Check.** The new posterior is checked against historical calibration data. If the analyst's confidence in this domain has historically been miscalibrated (e.g., 90% confidence predictions are only correct 75% of the time), an automatic calibration adjustment is applied.

**Step 5: Propagation.** Updated beliefs are propagated through the belief network to all dependent propositions. Propagation respects the NABLA Time Decay axiom: older evidence contributing to dependent beliefs is down-weighted based on its age.

## Belief Network Architecture

The Bayesian Analyst maintains a platform-wide belief network that models conditional dependencies between related propositions.

| Network Component | Description | Scale |
|------------------|-------------|-------|
| Entity beliefs | Confidence in entity attributes (name, address, ownership) | Thousands of nodes |
| Risk beliefs | Probability estimates for security and compliance risks | Hundreds of nodes |
| Intelligence beliefs | Confidence in OSINT intelligence findings | Dynamic, growing |
| Fitness beliefs | Probability distributions for agent fitness scores | 400+ nodes |
| Causal beliefs | Hypothesized causal relationships between platform events | Hundreds of edges |

The network supports both forward inference (given causes, what effects are likely?) and backward inference (given observed effects, what causes are probable?). This bidirectional reasoning capability is essential for both predictive analysis and root cause investigation.

## Monte Carlo Simulation Framework

For scenarios where exact Bayesian inference is computationally infeasible, the analyst provides a configurable Monte Carlo simulation framework.

**Standard Monte Carlo** generates random samples from prior distributions, evaluates each sample against the model, and estimates posterior distributions from the accepted samples. Configured for 10,000-100,000 samples depending on required precision.

**MCMC Methods** implement Metropolis-Hastings and Hamiltonian Monte Carlo algorithms for efficient exploration of high-dimensional parameter spaces. MCMC is used when the belief network has more than 50 interconnected nodes.

**Convergence Diagnostics** automatically assess simulation quality using Gelman-Rubin statistics, effective sample size estimates, and trace plot analysis. Simulations that fail convergence diagnostics are flagged and their results are annotated with uncertainty warnings.

## Authority Level

**L3** - Strategic Command - Multi-domain coordination and specialized operational command with authority to set confidence thresholds, calibrate probability models, and flag beliefs that fail calibration standards.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [3nl-coordinator](@/agents/3nl-coordinator.md) | Reasoning Hub | Provides probabilistic reasoning within the 3NL multi-layer framework |
| [3nl-l1-logic](@/agents/3nl-l1-logic.md) | Logic Complement | Receives formal constraints that bound probabilistic estimates |
| [capability-emergence-detector](@/agents/capability-emergence-detector.md) | Emergence Partner | Supplies probability estimates for capability emergence detection |
| [blue-signal-aggregator](@/agents/blue-signal-aggregator.md) | Signal Analysis | Provides Bayesian signal correlation for defensive intelligence |

## Performance Metrics

| Metric | Current | Target | Description |
|--------|---------|--------|-------------|
| Calibration accuracy | 92% | > 90% | Correlation between stated confidence and actual accuracy |
| Update throughput | > 1,000/sec | > 500/sec | Belief updates processed per second |
| MCMC convergence rate | 98% | > 95% | Percentage of simulations passing convergence diagnostics |
| Belief network consistency | 100% | 100% | No contradictions in belief network structure |
| Evidence incorporation latency | < 100ms | < 500ms | Time from evidence arrival to posterior update |

## Enforcement

All probabilistic reasoning operations are governed by the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. Every probability estimate must include the methodology used, the evidence incorporated, and the prior assumptions applied. Probability claims without documented methodology are rejected. The Bayesian Analyst never produces point estimates without accompanying uncertainty ranges, and overconfident predictions (confidence exceeding evidence support) trigger automatic recalibration review. The NABLA [Contradiction Preservation](@/glossary/contradiction-preservation.md) axiom requires that conflicting evidence is preserved in the belief network rather than being discarded to achieve artificial consensus. The [Trinity Gate](@/glossary/trinity-gate.md) validates that probabilistic conclusions maintain structural consistency with the belief network, logical consistency with formal constraints, and formal necessity through mathematical proof of the underlying inference.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)