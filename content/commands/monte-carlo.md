+++
title = "/monte-carlo"
weight = 1730
[extra]
category = "Formal Verification"
description = "Monte Carlo simulation for probabilistic analysis and risk assessment"
syntax = "/monte-carlo [options]"
authority = "L2+"
agent = "monte-carlo-specialist"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1408
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["monte-carlo", "Monte", "Carlo", "commands", "Formal Verification", "Prismatic Platform", "Monte Carlo", "Output", "Distribution"]
tags = ["commands", "formal-verification", "monte-carlo", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/monte-carlo - Prismatic Platform"
+++

## Overview

**/monte-carlo** is a production command in the **[Formal Verification](@/glossary/formal-verification.md)** category of the Prismatic Platform that executes Monte Carlo simulations for probabilistic analysis, risk assessment, and uncertainty quantification. Monte Carlo methods use repeated random sampling to obtain numerical results for problems that may be deterministic in principle but are too complex for analytical solutions. Within the Prismatic Platform, this command provides the probabilistic layer of the QEVE (Quantitative Evidence Verification Engine) framework, complementing [Lean4](@/glossary/lean4.md) formal proofs and [NABLA](@/glossary/nabla-infinity.md) epistemic validation.

This command operates under the **L2+** authority level and is executed by the `monte-carlo-specialist` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The L2+ authority level makes Monte Carlo simulations broadly accessible to platform operators while requiring elevated clearance for simulations that consume significant compute resources.

Monte Carlo simulation is fundamental to several critical platform functions. In M&A analysis through [/ma-analyze](@/commands/ma-analyze.md), Monte Carlo simulations model financial outcomes under uncertainty -- projecting revenue distributions, synergy realization probabilities, and deal NPV ranges. In the [Prismatic Perimeter](@/glossary/prismatic-perimeter.md) EASM system, simulations model attack probability distributions and vulnerability exploitation timelines. In the [NABLA](@/glossary/nabla-infinity.md) epistemic framework, simulations validate confidence calibration by testing whether stated confidence levels match observed outcome frequencies.

The platform's Monte Carlo engine leverages Elixir's BEAM concurrency model to execute simulations with massive parallelism. Each simulation trial runs as a lightweight Elixir process, enabling millions of trials per second on modern hardware. The engine supports configurable distribution types (normal, log-normal, uniform, triangular, custom), correlation structures between variables, convergence detection, and variance reduction techniques including stratified sampling and antithetic variates.

## Architecture

The Monte Carlo engine is structured as a parallel simulation framework with configurable models, sampling strategies, and analysis outputs.

### Simulation Architecture

```
/monte-carlo -> Model Builder -> Sampler Engine -> Trial Runner -> Analyzer
                    |                 |                 |              |
                    v                 v                 v              v
              Variable Defs     Distribution      BEAM Process    Statistics
              Correlations      Selection         Parallelism     Convergence
              Constraints       Variance Reduce   Result Buffer   Visualizations
              Output Defs       Random Seed       Aggregation     Confidence
```

### Simulation Types

| Type | Use Case | Variables | Typical Trials | Output |
|------|----------|-----------|----------------|--------|
| **Financial** | DCF valuation, NPV | Revenue, costs, growth, discount | 10K-100K | Value distributions, percentiles |
| **Risk** | Attack probability, failure rates | Threat frequency, vulnerability, impact | 50K-500K | Risk distributions, VaR |
| **Quality** | System reliability, test coverage | Error rates, detection probability | 10K-50K | Reliability curves, MTBF |
| **Scheduling** | Project timelines, deal closing | Task duration, dependencies, resources | 5K-50K | Duration distributions, critical path |
| **Epistemic** | Confidence calibration | Confidence scores, outcome frequencies | 100K-1M | Calibration curves, Brier scores |

### Distribution Types

| Distribution | Parameters | Use Case | Example |
|-------------|-----------|----------|---------|
| **Normal** | mean, std_dev | Symmetric uncertainty | Revenue growth rate |
| **Log-Normal** | mu, sigma | Right-skewed positive values | Deal size, market cap |
| **Uniform** | min, max | Equal probability range | Unknown parameters |
| **Triangular** | min, mode, max | Expert estimates | Task duration |
| **Beta** | alpha, beta | Bounded probabilities | Success probability |
| **Poisson** | lambda | Count data, event frequency | Security incidents |
| **Custom** | histogram | Empirical data | Historical returns |
| **Correlated** | base + correlation_matrix | Dependent variables | Market factors |

### Variance Reduction Techniques

| Technique | Speedup | Description |
|-----------|---------|-------------|
| **Stratified Sampling** | 2-5x | Divide input space into strata, sample proportionally |
| **Antithetic Variates** | 1.5-3x | Generate complementary random pairs |
| **Control Variates** | 2-10x | Use known analytical results to reduce variance |
| **Importance Sampling** | 5-50x | Over-sample critical regions of the input space |
| **Latin Hypercube** | 2-5x | Ensure full coverage of input space |

## Usage

```bash
# Run a basic Monte Carlo simulation
/monte-carlo --model=financial --trials=10000

# DCF valuation with uncertainty
/monte-carlo --model=dcf-valuation \
  --var="revenue_growth:normal(0.08,0.03)" \
  --var="discount_rate:triangular(0.08,0.10,0.14)" \
  --var="terminal_growth:normal(0.02,0.01)" \
  --trials=50000

# Risk assessment simulation
/monte-carlo --model=risk-assessment \
  --var="attack_frequency:poisson(12)" \
  --var="vulnerability_probability:beta(2,5)" \
  --var="impact_magnitude:lognormal(100000,50000)" \
  --trials=100000

# Quality reliability simulation
/monte-carlo --model=system-reliability \
  --var="component_failure:exponential(0.001)" \
  --var="detection_probability:beta(8,2)" \
  --components=50 --trials=50000

# Project scheduling simulation
/monte-carlo --model=schedule \
  --var="task_a:triangular(5,7,12)" \
  --var="task_b:triangular(3,5,8)" \
  --var="task_c:triangular(8,10,15)" \
  --dependencies="c->a,c->b" \
  --trials=10000

# Epistemic calibration check
/monte-carlo --model=confidence-calibration \
  --data-source=nabla-confidence-log.json \
  --trials=100000

# Simulation with convergence detection
/monte-carlo --model=dcf-valuation --trials=auto --convergence-threshold=0.001

# Export results
/monte-carlo --model=financial --trials=50000 --format=json --output=simulation-results.json

# Visualization output
/monte-carlo --model=financial --trials=50000 --visualize --output=simulation-charts.html

# Set random seed for reproducibility
/monte-carlo --model=financial --trials=50000 --seed=42

# Use variance reduction
/monte-carlo --model=risk-assessment --trials=10000 --variance-reduction=stratified

# Sensitivity analysis through simulation
/monte-carlo --model=dcf-valuation --sensitivity --variables=all --trials=50000

# Batch simulation for multiple scenarios
/monte-carlo --batch=scenarios.yaml --trials=50000 --output-dir=results/
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--model` | string | required | Simulation model: dcf-valuation, risk-assessment, system-reliability, schedule, confidence-calibration, custom |
| `--var` | string | none | Variable definition: "name:distribution(params)" (repeatable) |
| `--trials` | integer/string | 10000 | Number of simulation trials or "auto" for convergence-based |
| `--convergence-threshold` | float | 0.005 | Convergence threshold for auto trials |
| `--seed` | integer | random | Random seed for reproducibility |
| `--variance-reduction` | string | none | Technique: stratified, antithetic, control, importance, latin-hypercube |
| `--dependencies` | string | none | Variable dependencies in "a->b,c->d" format |
| `--components` | integer | none | Number of components for reliability models |
| `--data-source` | string | none | Input data file for data-driven models |
| `--sensitivity` | flag | false | Run sensitivity analysis |
| `--variables` | string | all | Variables for sensitivity analysis |
| `--format` | string | text | Output format: text, json, csv, markdown |
| `--output` | string | stdout | Output file path |
| `--visualize` | flag | false | Generate visualization charts |
| `--batch` | string | none | Batch scenario file (YAML) |
| `--output-dir` | string | none | Output directory for batch results |
| `--parallel` | integer | auto | Number of parallel simulation processes |
| `--percentiles` | string | "5,25,50,75,95" | Percentiles to report |

## Execution Flow

1. **Model Loading**: The simulation model is loaded from the model registry or constructed from provided variable definitions. Model parameters are validated for consistency and completeness.

2. **Distribution Construction**: Each variable's probability distribution is constructed from the specified parameters. Correlation structures are applied if defined. Distribution parameters are validated (positive standard deviations, valid ranges, etc.).

3. **Sampler Configuration**: The sampling engine is configured with the specified variance reduction technique, random seed, and parallel execution parameters. For auto-convergence mode, initial trial count is estimated based on model complexity.

4. **Parallel Trial Execution**: Simulation trials are dispatched across available BEAM processes. Each trial independently samples all input variables from their distributions, evaluates the model function, and records the output. Results are aggregated in a concurrent-safe buffer.

5. **Convergence Monitoring**: For auto-convergence mode, the engine monitors the running statistics (mean, standard deviation, percentiles) after each batch of trials. When the change between batches falls below the convergence threshold, the simulation terminates.

6. **Statistical Analysis**: Complete results are analyzed to produce summary statistics: mean, median, standard deviation, percentiles, confidence intervals, skewness, and kurtosis. Distribution fitting is performed to characterize the output distribution shape.

7. **Sensitivity Analysis**: If enabled, tornado diagrams and Sobol indices are computed to identify which input variables have the greatest impact on output uncertainty. This guides analysts toward the assumptions that most affect the result.

8. **Visualization Generation**: If requested, charts are generated including histograms, cumulative distribution functions, tornado diagrams, scatter plots, and convergence traces. Charts are rendered as interactive HTML with VegaLite.

9. **Result Output**: Results are formatted and written to the specified output. JSON output includes the complete statistical summary, raw trial data (if requested), and visualization specifications.

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Executed by `monte-carlo-specialist` | Simulation orchestration |
| [/ma-analyze](@/commands/ma-analyze.md) | Financial modeling | DCF valuations with uncertainty |
| [Prismatic Perimeter](@/glossary/prismatic-perimeter.md) | Risk modeling | Attack probability simulations |
| [NABLA Framework](@/glossary/nabla-infinity.md) | Confidence calibration | Epistemic validation simulations |
| [/lean](@/commands/lean.md) | Formal proofs | QEVE framework integration |
| [/formal-verify](@/commands/formal-verify.md) | Verification | Probabilistic property verification |
| [Quality Gates](@/glossary/quality-gates.md) | Quality modeling | System reliability simulations |
| [Telemetry](@/glossary/telemetry.md) | Execution [metrics](@/glossary/metrics.md) | Simulation performance tracking |
| [/prolog](@/commands/prolog.md) | Logical reasoning | Model constraint validation |

## Best Practices

**Start with fewer trials and increase.** Run an initial simulation with 1,000 trials to verify model correctness and output reasonableness. Then increase to 10,000-100,000 for production results. This catches model errors before investing significant compute time.

**Use convergence-based trial counts.** Instead of guessing the right number of trials, use `--trials=auto` with a convergence threshold. This ensures sufficient precision without over-computing.

**Apply variance reduction for rare events.** When modeling low-probability, high-impact events (security breaches, system failures), importance sampling dramatically improves efficiency by focusing trials on the critical region.

**Validate with known analytical solutions.** Before trusting a complex Monte Carlo model, validate it against a simplified version that has a known analytical solution. This catches model implementation errors.

**Set seeds for reproducibility.** Use `--seed` for any simulation whose results will be shared or referenced. Reproducible simulations allow others to verify and extend your analysis.

**Run sensitivity analysis routinely.** Sensitivity analysis identifies which assumptions drive the result. If the output is highly sensitive to an assumption with low confidence, that assumption deserves more investigation before the result is trusted.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `model_not_found` | Specified model does not exist | Use built-in model or provide custom variable definitions |
| `invalid_distribution` | Distribution parameters are invalid | Check parameter values (e.g., positive std_dev) |
| `convergence_not_reached` | Auto trials exceeded maximum without converging | Increase maximum trials or relax convergence threshold |
| `memory_exceeded` | Too many trials for available memory | Reduce trial count or enable streaming mode |
| `correlation_matrix_invalid` | Correlation matrix is not positive semi-definite | Verify correlation values and matrix structure |
| `dependency_cycle` | Variable dependencies contain a cycle | Review and correct dependency graph |
| `batch_file_invalid` | Batch scenario YAML has syntax errors | Validate YAML structure |

## Advanced Usage

### Custom Model Functions

Define custom model functions for domain-specific simulations.

```bash
# Custom model from Elixir module
/monte-carlo --model=custom --module=PrismaticPerimeter.RiskModel \
  --function=simulate_attack_surface --trials=100000

# Custom model from YAML definition
/monte-carlo --model-file=custom-model.yaml --trials=50000
```

### Correlated Variable Simulation

Model dependencies between uncertain variables.

```bash
# Financial model with correlated variables
/monte-carlo --model=dcf-valuation \
  --var="revenue_growth:normal(0.08,0.03)" \
  --var="margin:normal(0.15,0.05)" \
  --correlation="revenue_growth,margin:0.6" \
  --trials=50000
```

### Sequential Monte Carlo

Run simulations where later stages depend on earlier results.

```bash
# Two-stage M&A simulation
/monte-carlo --model=sequential \
  --stage1="acquisition_cost:lognormal(100M,20M)" \
  --stage2="synergy_realization:beta(3,2) * stage1.value * 0.15" \
  --trials=50000
```

### Real-Time Risk Monitoring

Integrate Monte Carlo simulation with live data feeds.

```bash
# Continuous risk simulation with live data
/monte-carlo --model=risk-assessment \
  --data-source=live:perimeter-telemetry \
  --trials=10000 --interval=300 --output=risk-monitor.json
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Simulations run to completion or convergence. Partial results from interrupted simulations are not reported as valid. Statistical summaries include confidence intervals.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Monte Carlo provides quantitative evidence for uncertainty claims. Sensitivity analysis identifies which assumptions matter most. Convergence verification ensures that results are statistically stable.

## Related Commands

- [/lean](@/commands/lean.md) - Execute Lean 4 code or prove a theorem with the lean-specialist agent
- [/prolog](@/commands/prolog.md) - Prolog-based logical reasoning and [inference](@/glossary/inference.md) operations
- [/formal-verify](@/commands/formal-verify.md) - Formal verification of system properties and invariants
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](@/commands/quality-enforce.md) - Mandatory progressive [quality debt](@/glossary/quality-debt.md) elimination with AIAD enforcement
- [/regression-check](@/commands/regression-check.md) - Execute 25 custom [Credo](@/glossary/credo.md) regression checks preventing 700+ violations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)