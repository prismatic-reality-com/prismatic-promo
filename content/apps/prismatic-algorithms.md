+++
title = "Prismatic Algorithms"
weight = 23
[extra]
icon = "calculator"
color = "green"
description = "Pure functional decision algorithms library: calibration, drift detection, uncertainty quantification, dimensionality reduction, sensitivity analysis, and multi-criteria aggregation -- built on Nx tensors with optional EXLA JIT compilation"
category = "Foundation"
files = "150"
status = "Production"
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
word_count = 4200
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Algorithms", "Calibration", "Drift Detection", "Uncertainty", "PCA", "SVD", "Nx", "EXLA", "Platt Scaling", "Bootstrap", "Sensitivity", "Counterfactual", "Aggregation", "Foundation", "Prismatic Platform", "PrismaticAlgorithms"]
tags = ["apps", "foundation", "prismatic-algorithms", "prismatic", "machine-learning", "calibration", "drift-detection"]
quality_score = 95
see_also = ["technologies", "agents", "glossary", "capabilities"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Algorithms - Prismatic Platform"
+++

## Abstract

Prismatic Algorithms is a **pure functional decision algorithms library** built with lambda-calculus principles on [Nx](https://hexdocs.pm/nx/) tensors with optional [EXLA](https://hexdocs.pm/exla/) JIT compilation. Every algorithm is deterministic, referentially transparent, and free from side effects. The library provides ten algorithm domains: **probability calibration** (Platt scaling, isotonic regression), **distribution drift detection** (PSI, KL divergence, JS divergence, Wasserstein distance), **uncertainty quantification** (bootstrap variance, epistemic/aleatoric decomposition), **dimensionality reduction** (SVD, PCA), **data preprocessing** (z-score, robust, min-max normalization; one-hot and positional encoding), **sensitivity analysis** (finite difference local sensitivity), **counterfactual generation** (constrained optimization with plausibility checking), **decision integrity** (threshold stability analysis, margin-based metrics), **multi-criteria aggregation** (Pareto dominance, veto rules, OWA operators), and **feature attribution** (leave-one-out ablation, additive attribution).

All algorithms operate on Nx tensors with explicit randomness (seed-based), composable validation, and `{:ok, result} | {:error, reason}` return conventions. The library has **zero external dependencies** beyond Nx -- no database, no Phoenix, no I/O, no global state.

## 1. Introduction

### 1.1 Problem Statement

Enterprise AI and intelligence platforms face a fundamental challenge: **how to make reliable, explainable, and auditable decisions under uncertainty**. Raw model outputs (scores, logits, predictions) are not directly actionable without:

- **Calibration**: Converting raw scores into well-calibrated probabilities that reflect true likelihoods
- **Drift Detection**: Monitoring whether the statistical properties of data have changed over time
- **Uncertainty Quantification**: Distinguishing what the system knows from what it does not know
- **Sensitivity Analysis**: Understanding which inputs most influence outputs
- **Decision Integrity**: Verifying that decisions are stable and not artifacts of threshold placement

Prismatic Algorithms provides all of these as composable, pure functional building blocks that any platform component can use without coupling to specific frameworks or infrastructure.

### 1.2 Design Goals

1. **Pure Functions**: Input to Output, deterministic, no side effects, no I/O
2. **Nx-Native**: All computation on Nx tensors -- GPU-accelerable via EXLA
3. **Composable Validation**: Every function validates inputs via `with` chains
4. **Explicit Randomness**: RNG seed/state passed explicitly, never hidden
5. **Backend-Switchable**: Toggle between pure Nx and EXLA JIT at runtime

### 1.3 Architecture

```
PrismaticAlgorithms (facade)
├── Backend (Nx / EXLA switching via :persistent_term)
├── Core (Validate, Vector, Matrix -- shared primitives)
├── Preprocessing (Normalize, Embed)
├── Reduction (SVD, PCA)
├── Calibration (Platt Scaling, Isotonic Regression)
├── Drift (PSI, KL, JS, Wasserstein)
├── Uncertainty (Bootstrap, Decomposition)
├── Sensitivity (Local finite-difference)
├── Counterfactual (Constrained, Plausibility)
├── Integrity (Threshold Stability, Margin)
├── Aggregation (Pareto, Veto, OWA)
├── Attribution (Leave-One-Out, Additive)
└── Adapters (Bifurcation, Blackboard, Streaming)
```

## 2. Algorithm Domains -- Detailed

### 2.1 Probability Calibration

**Problem**: Raw model scores (e.g., drift magnitude 0.73) do not correspond to true probabilities. A score of 0.73 does not mean there is a 73% chance of drift. Calibration maps raw scores to probabilities where P(event | score=0.73) is actually close to 0.73.

**Platt Scaling** fits a logistic sigmoid: `P(y=1|s) = 1 / (1 + exp(A*s + B))` via Newton-Raphson optimization with L2 regularization.

**Isotonic Regression** uses the Pool Adjacent Violators (PAV) algorithm for non-parametric monotonic calibration -- no functional form assumed.

```elixir
# Fit calibration model on validation data
{:ok, model} = PrismaticAlgorithms.Calibration.Platt.fit(scores, labels,
  max_iterations: 100, tolerance: 1.0e-6)

# Apply to new scores
{:ok, calibrated} = PrismaticAlgorithms.Calibration.Platt.predict(model, new_scores)
```

**Applications**:
- **AI Drift Detection**: Replacing magic threshold constants with statistically grounded decision boundaries
- **Security Ratings**: Calibrating raw vulnerability scores to actual breach probabilities
- **Risk Assessment**: Converting OSINT source reliability scores to confidence levels
- **Enterprise Compliance**: Producing calibrated probability of non-compliance for regulatory reporting

### 2.2 Distribution Drift Detection

**Problem**: Detecting when the statistical properties of a data distribution have changed -- critical for monitoring AI systems, market conditions, population demographics, and threat landscapes.

| Algorithm | Formula | Properties |
|-----------|---------|------------|
| **PSI** (Population Stability Index) | `sum((actual% - expected%) * ln(actual%/expected%))` | Symmetric, interpretable thresholds |
| **KL Divergence** | `sum(P * ln(P/Q))` | Asymmetric, information-theoretic |
| **JS Divergence** | `0.5*KL(P||M) + 0.5*KL(Q||M)` where M=(P+Q)/2 | Symmetric, bounded [0, ln2] |
| **Wasserstein** | Optimal transport distance | Metric, geometry-aware |

Each returns drift magnitude + interpretation level:

```elixir
{:ok, %{value: 0.42, interpretation: :major_shift}} =
  PrismaticAlgorithms.Drift.psi(reference_distribution, current_distribution)
```

**Interpretation Levels**: `:no_drift` (< 0.1), `:minor_drift` (0.1-0.25), `:moderate_drift` (0.25-0.5), `:major_shift` (> 0.5)

**Applications**:
- **AI Model Monitoring**: Detecting when input feature distributions shift, degrading model performance
- **Financial Surveillance**: Monitoring transaction pattern changes for fraud detection
- **OSINT Intelligence**: Detecting changes in entity risk profiles over time
- **HR Decision Auditing**: Ensuring AI-assisted hiring decisions remain fair as applicant demographics evolve
- **Cybersecurity**: Detecting behavioral drift in network traffic patterns indicating compromise

### 2.3 Uncertainty Quantification

**Problem**: Point estimates hide the confidence (or lack thereof) in a prediction. Enterprise decisions require knowing both the estimate and its reliability.

**Bootstrap Variance Estimation** uses resampling with replacement to estimate the variance of any statistic:

```elixir
{:ok, %{variance: v, ci_lower: lo, ci_upper: hi}} =
  PrismaticAlgorithms.Uncertainty.bootstrap_variance(data,
    n_resamples: 1000, seed: 42, ci_level: 0.95)
```

**Epistemic/Aleatoric Decomposition** separates:
- **Epistemic uncertainty** (reducible -- lack of data/knowledge)
- **Aleatoric uncertainty** (irreducible -- inherent randomness)

**Applications**:
- **Risk Reporting**: Presenting security ratings with confidence intervals (e.g., "B grade, 95% CI: [720, 810]")
- **Investment Decisions**: Quantifying uncertainty in ROI projections from security improvements
- **Regulatory Compliance**: Demonstrating confidence bounds on compliance assessments
- **Intelligence Analysis**: Distinguishing high-confidence from speculative assessments

### 2.4 Dimensionality Reduction

**SVD** (Singular Value Decomposition) decomposes any matrix A into U * S * V^T. Used for noise reduction, rank estimation, and pseudoinverse computation.

**PCA** (Principal Component Analysis) projects data onto directions of maximum variance:

```elixir
{:ok, {model, transformed}} =
  PrismaticAlgorithms.Reduction.PCA.fit_transform(high_dim_data, n_components: 3)

# How much variance is retained?
{:ok, ratios} = PrismaticAlgorithms.Reduction.PCA.explained_variance(model)
```

**Applications**:
- **Feature Engineering**: Reducing dimensionality of OSINT evidence vectors before scoring
- **Anomaly Detection**: Identifying outliers in reduced-dimension space
- **Visualization**: Projecting multi-dimensional risk profiles to 2D/3D for dashboard display
- **Noise Reduction**: Filtering out noise dimensions from sensor/telemetry data

### 2.5 Data Preprocessing

**Normalization Methods**:

| Method | Formula | Best For |
|--------|---------|----------|
| Z-Score | `(x - mean) / std` | Gaussian-distributed features |
| Robust | `(x - median) / MAD` | Outlier-contaminated data |
| Min-Max | `(x - min) / (max - min)` | Bounded [0,1] features |

All normalizations are **idempotent** and return statistics for inverse transformation.

**Embedding Methods**:
- **One-Hot Encoding**: Integer labels to binary matrix
- **Positional Encoding**: Sinusoidal embeddings for sequence position

**Applications**:
- **Multi-Source Fusion**: Normalizing scores from different OSINT sources to comparable scales
- **Time Series Alignment**: Standardizing financial indicators before trend comparison
- **Model Input Preparation**: Preprocessing features before ML model inference

### 2.6 Sensitivity Analysis

**Problem**: Understanding which input variables most influence the output.

**Local Finite-Difference Sensitivity**: Perturbs each input by small epsilon and measures output change.

```elixir
{:ok, sensitivities} =
  PrismaticAlgorithms.Sensitivity.local(model_fn, input_vector,
    epsilon: 1.0e-4)
# => %{feature_0: 0.82, feature_1: 0.03, feature_2: 0.45, ...}
```

**Applications**:
- **Model Explainability**: Identifying which evidence dimensions drive a security rating
- **Risk Driver Analysis**: Determining which factors contribute most to risk scores
- **Threshold Calibration**: Understanding sensitivity of decisions to threshold placement
- **Audit Support**: Providing regulators with feature importance rankings

### 2.7 Counterfactual Generation

**Problem**: "What would need to change for the decision to be different?"

**Constrained Counterfactual**: Finds the minimal input change that flips the decision, subject to plausibility constraints.

```elixir
{:ok, counterfactual} =
  PrismaticAlgorithms.Counterfactual.generate(
    model_fn, current_input, target_outcome,
    constraints: [immutable: [:age, :gender], max_change: 0.2])
```

**Applications**:
- **Fairness Auditing**: "What would this applicant need to change to receive approval?"
- **Regulatory Explanation**: Providing actionable feedback on compliance gaps
- **Remediation Planning**: Identifying minimal security improvements to achieve target rating

### 2.8 Decision Integrity

**Threshold Stability**: Analyzes how sensitive a binary decision is to threshold placement.

**Margin-Based Metrics**: Measures the distance between a score and the decision boundary.

**Applications**:
- **Enterprise Governance**: Ensuring decisions are robust, not artifacts of threshold placement
- **Alert Fatigue Reduction**: Identifying borderline cases that need human review
- **Model Validation**: Verifying that decision boundaries are stable across data subsets

### 2.9 Multi-Criteria Aggregation

**Pareto Dominance**: Identifies non-dominated solutions across multiple objectives.

**Veto Rules**: Rejects solutions that violate minimum thresholds on any criterion.

**OWA Operators** (Ordered Weighted Averaging): Flexible aggregation between AND and OR semantics.

```elixir
{:ok, frontier} = PrismaticAlgorithms.Aggregation.pareto_frontier(solutions)
{:ok, aggregated} = PrismaticAlgorithms.Aggregation.owa(scores, weights)
```

**Applications**:
- **Multi-Objective Optimization**: Balancing security vs. usability vs. cost
- **Consensus Decision Making**: Aggregating assessments from multiple OSINT sources
- **Risk Portfolio Management**: Finding optimal risk-return tradeoffs
- **Vendor Assessment**: Scoring vendors across multiple criteria with veto thresholds

### 2.10 Feature Attribution

**Leave-One-Out**: Ablation-based importance by removing each feature and measuring impact.

**Additive Attribution**: Distributes the total prediction among input features.

**Applications**:
- **Explainable AI**: SHAP-like explanations for platform decisions
- **Evidence Ranking**: Ranking which evidence sources contributed most to an assessment
- **Debugging**: Identifying which inputs cause unexpected model behavior

## 3. Backend Architecture

### 3.1 Nx / EXLA Switching

```elixir
# Switch backend at runtime (no recompilation)
PrismaticAlgorithms.set_backend(:exla)  # GPU/JIT acceleration
PrismaticAlgorithms.set_backend(:nx_only)  # Pure Nx (default)

# Current backend
PrismaticAlgorithms.get_backend()  # => :nx_only
```

Backend selection stored in `:persistent_term` for zero-cost reads across all processes.

### 3.2 Validation Pattern

Every public function validates all inputs via composable `with` chains:

```elixir
with {:ok, tensor} <- Validate.tensor(input),
     {:ok, tensor} <- Validate.tensor_finite(tensor),
     {:ok, tensor} <- Validate.tensor_shape(tensor, {n, m}) do
  {:ok, compute(tensor)}
end
```

Validation functions: `tensor/1`, `tensor_finite/1`, `tensor_shape/2`, `tensor_rank/2`, `in_range/3`, `positive/1`, `non_negative/1`.

## 4. Integration with Platform

### 4.1 Adapters (Boundary Layer)

Three adapters connect pure algorithms to platform infrastructure:

| Adapter | Purpose |
|---------|---------|
| `BifurcationAdapter` | Bridges algorithms to `PrismaticCore.Bifurcation` for dynamical systems analysis |
| `BlackboardAdapter` | Connects to the Blackboard shared memory for inter-agent result sharing |
| `StreamingAdapter` | Connects to streaming data pipelines for real-time computation |

Adapters are the **only** modules that reference external platform modules. They handle data format conversion only -- no business logic.

### 4.2 Dependencies

| Direction | Application | Relationship |
|-----------|-------------|--------------|
| **Internal** | None | Zero internal umbrella dependencies |
| **External** | `nx ~> 0.8` | Core numerical computing |
| **Optional** | `exla ~> 0.8` | JIT compilation for GPU acceleration |

### 4.3 Dependents

| Application | Usage |
|-------------|-------|
| AI Drift Detection | Calibration + drift metrics + uncertainty |
| Prismatic Perimeter | Security rating calibration + sensitivity |
| OSINT Core | Multi-source aggregation + attribution |
| Detection Engine | Anomaly detection preprocessing |
| HAWKEYE | Behavioral scoring + threshold stability |

## 5. Performance

| Operation | Time | Space |
|-----------|------|-------|
| Platt scaling fit (1K samples) | < 50ms | O(n) |
| PSI drift detection (1K bins) | < 10ms | O(n) |
| Bootstrap variance (10K resamples) | < 200ms | O(n*k) |
| PCA fit (1K samples, 100 features) | < 100ms | O(m*n + k*n) |
| Full SVD (1K x 100) | < 200ms | O(m*n) |
| Z-score normalization (100K samples) | < 5ms | O(n) |
| Pareto frontier (1K solutions, 5 objectives) | < 20ms | O(n*m) |

With EXLA backend, tensor operations see 2-10x speedup depending on data size and GPU availability.

## 6. Testing Strategy

| Test Type | Coverage | Purpose |
|-----------|----------|---------|
| Unit Tests | 100% public API | Function correctness with known inputs |
| Property Tests | Mathematical invariants | SVD reconstruction, normalization idempotence, calibration monotonicity |
| Integration Tests | Cross-module | Algorithm composition (preprocess -> reduce -> calibrate) |
| Benchmark Tests | Performance regression | Throughput tracking per domain |

### Key Invariants Verified

- SVD: `U * S * V^T` reconstructs original matrix within precision
- PCA: explained variance ratios sum to <= 1.0
- Calibration: output probabilities monotonically ordered relative to input scores
- Normalization: inverse transform recovers original data
- Drift: PSI >= 0 always; KL >= 0 always
- Bootstrap: CI contains true parameter with stated confidence level

## 7. Real-World Application: AI Drift Detection Pipeline

The complete AI Drift detection pipeline demonstrates how algorithm domains compose:

```
Raw Scores ──▶ Preprocessing (z-score) ──▶ Drift Detection (PSI + KL)
     │                                            │
     └── Calibration (Platt) ──▶ P(drift) ──▶ Decision Policy
                                      │
                    Uncertainty (Bootstrap CI) ──▶ Confidence Band
                                      │
                    Sensitivity (Local) ──▶ Feature Importance
                                      │
                    Integrity (Margin) ──▶ Stability Check
```

This is not a hypothetical pipeline -- it is the architecture used by the Prismatic Platform's AI Drift subsystem, with each step backed by the algorithms in this library.

## References

- [Platt, J. (1999). Probabilistic Outputs for SVMs](https://www.cs.colorado.edu/~mozer/Teaching/syllabi/6622/papers/Platt1999.pdf) -- Platt scaling foundation
- [Kullback-Leibler Divergence](https://en.wikipedia.org/wiki/Kullback%E2%80%93Leibler_divergence) -- Information-theoretic drift measure
- [Efron, B. (1979). Bootstrap Methods](https://projecteuclid.org/euclid.aos/1176344552) -- Bootstrap uncertainty estimation

## Related Resources

- [Prismatic Core](@/apps/prismatic-core.md) -- Foundation module with Monte Carlo engine and bifurcation analysis
- [Prismatic Monte Carlo](@/apps/prismatic-monte-carlo.md) -- Probabilistic simulation engine
- [AI Drift](@/apps/ai-drift.md) -- AI Drift detection system using this library
- [Trinity Gate](@/capabilities/trinity-gate.md) -- Formal verification of algorithm invariants
- [Multi-Paradigm Solving](@/capabilities/multi-paradigm-solving.md) -- Combining statistical, algebraic, and optimization approaches

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
