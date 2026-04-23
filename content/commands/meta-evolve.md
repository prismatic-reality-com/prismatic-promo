+++
title = "/meta-evolve"
weight = 490
[extra]
category = "Evolution"
description = "Evolve the evolution system itself with meta-recursive improvement and GitLab tracking"
syntax = "/meta-evolve [options]"
authority = "SUPREME"
agent = "meta-evolution-orchestrator"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1346
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["meta-evolve", "Evolve", "GitLab", "commands", "Evolution", "Prismatic Platform", "Meta", "String"]
tags = ["commands", "evolution", "meta-evolve", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/meta-evolve - Prismatic Platform"
+++

## Overview

**/meta-evolve** is a production command in the **Evolution** category of the Prismatic Platform. It evolves the evolution system itself through meta-recursive improvement -- a fundamentally reflexive operation where the mechanisms responsible for platform evolution become the subject of their own optimization. This is the platform's most philosophically ambitious evolution command: rather than improving code, agents, or patterns, it improves the process by which improvement occurs.

The meta-evolution concept addresses a critical limitation of fixed evolution strategies. Standard evolution commands like [/evolve](/commands/evolve/) and [/mendelize](/commands/mendelize/) operate with predetermined parameters: mutation rates, selection pressures, propagation thresholds, and quality gate configurations. These parameters were initially set through expert judgment, but optimal values change as the platform evolves. What works at Generation 5 may be suboptimal at Generation 15. Meta-evolution solves this by treating evolution parameters themselves as evolvable traits, subject to the same selection and optimization pressures as any other platform component.

This command operates under the **SUPREME** authority level and is executed by the `meta-evolution-orchestrator` agent, a supreme-level agent with the unique capability of modifying the behavior of other evolution agents. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The SUPREME authority requirement is essential because meta-evolution can alter the fundamental characteristics of the platform's evolution infrastructure, potentially changing how quality is measured, how fitness is evaluated, and how improvements are selected.

The command integrates with GitLab for comprehensive tracking of meta-evolution experiments. Each meta-evolution cycle creates a GitLab issue documenting the hypothesis (which evolution parameters to modify), the experiment (what changes were made), and the outcome (whether the modified parameters produced better evolution results). This tracking supports the platform's commitment to evidence-based decision-making and provides an audit trail for the evolution of evolution itself.

## Architecture

Meta-evolution operates through a layered architecture that separates the meta-level optimization from the object-level evolution it governs.

```
+---------------------+     +---------------------+     +---------------------+
|  Meta-Parameter     |---->|  Strategy Evaluator  |---->|  Parameter Tuner    |
|  Registry           |     |  (A/B Testing)       |     |  (Gradient-Free)    |
+---------------------+     +---------------------+     +---------------------+
         |                           |                           |
         v                           v                           v
+---------------------+     +---------------------+     +---------------------+
|  Evolution Monitor  |---->|  Experiment Manager  |---->|  GitLab Tracker     |
|  (Fitness Tracking) |     |  (Hypothesis Cycle)  |     |  (Issue/MR Mgmt)    |
+---------------------+     +---------------------+     +---------------------+
         |                           |                           |
         v                           v                           v
+---------------------+     +---------------------+     +---------------------+
|  Convergence        |---->|  Rollback Manager    |---->|  Meta-Telemetry     |
|  Detector           |     |  (Safe Revert)       |     |  (Meta-Metrics)     |
+---------------------+     +---------------------+     +---------------------+
```

The **Meta-Parameter Registry** stores all tunable parameters across the platform's evolution subsystems. This includes mutation rates for [/mendelize](/commands/mendelize/), propagation thresholds for [/mycelialize](/commands/mycelialize/), healing aggressiveness for autoheal, and quality gate sensitivity. Each parameter has a valid range, current value, historical values, and sensitivity analysis results.

The **Strategy Evaluator** implements A/B testing for evolution strategies. It runs parallel evolution experiments with different parameter configurations and compares outcomes using statistical significance testing. This ensures that meta-evolution decisions are supported by evidence rather than intuition.

The **Parameter Tuner** applies gradient-free optimization algorithms (Bayesian optimization, evolutionary strategies, simulated annealing) to the meta-parameter space. These algorithms are chosen specifically because they do not require differentiable objective functions, which is appropriate for the discrete, noisy optimization landscape of evolution parameters.

The **Experiment Manager** manages the complete lifecycle of meta-evolution experiments: hypothesis formulation, experiment design, execution, result collection, and conclusion. Each experiment is tracked in GitLab with full documentation.

## Usage

### Meta-Evolution Analysis

```bash
# Show current meta-parameter configuration
/meta-evolve status

# Analyze evolution effectiveness over recent sessions
/meta-evolve analyze --period=30d

# Identify underperforming evolution subsystems
/meta-evolve diagnose
```

### Meta-Evolution Execution

```bash
# Execute a meta-evolution cycle
/meta-evolve

# Execute with specific focus on a subsystem
/meta-evolve --target=mendelize

# Execute with A/B testing enabled
/meta-evolve --experiment --hypothesis="higher mutation rate improves diversity"

# Execute with GitLab tracking
/meta-evolve --track --gitlab-project=prismatic-platform
```

### Parameter Management

```bash
# Show all tunable meta-parameters
/meta-evolve params

# Get detailed info about a specific parameter
/meta-evolve param-info --param=mendelize.mutation_rate

# Override a parameter for experimentation
/meta-evolve set --param=mendelize.mutation_rate --value=0.08

# Reset a parameter to its default
/meta-evolve reset --param=mendelize.mutation_rate
```

### History and Rollback

```bash
# Show meta-evolution history
/meta-evolve history

# Compare two meta-evolution states
/meta-evolve compare --baseline=meta-v12 --current=meta-v15

# Rollback to a previous meta-parameter configuration
/meta-evolve rollback --to=meta-v12
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `status` | Subcommand | -- | Show meta-parameter configuration and evolution health |
| `analyze` | Subcommand | -- | Analyze evolution effectiveness |
| `diagnose` | Subcommand | -- | Identify underperforming evolution subsystems |
| `params` | Subcommand | -- | List all tunable meta-parameters |
| `history` | Subcommand | -- | Show meta-evolution history |
| `--target` | String | all | Evolution subsystem to focus on |
| `--experiment` | Flag | false | Enable A/B testing mode |
| `--hypothesis` | String | none | Hypothesis description for the experiment |
| `--track` | Flag | false | Enable GitLab tracking |
| `--gitlab-project` | String | prismatic-platform | GitLab project for tracking |
| `--param` | String | none | Specific meta-parameter identifier |
| `--value` | String | none | Value for parameter set operations |
| `--period` | Duration | 7d | Analysis period |
| `--baseline` | String | none | Baseline identifier for comparison |
| `--current` | String | latest | Current identifier for comparison |
| `--confidence` | Float | 0.95 | Statistical confidence threshold for A/B tests |
| `--verbose` | Flag | false | Detailed output including statistical analysis |
| `--format` | String | table | Output format (table, json, markdown) |

## Execution Flow

1. **SUPREME Authority Verification** -- The highest platform authority level is confirmed. Meta-evolution can fundamentally alter the platform's improvement dynamics and requires maximum oversight.

2. **Meta-State Snapshot** -- The current configuration of all evolution subsystem parameters is captured as the meta-baseline. This snapshot enables rollback if the meta-evolution produces detrimental changes.

3. **Evolution Effectiveness Analysis** -- Historical evolution metrics are analyzed to identify opportunities for improvement. Metrics include: fitness improvement rate per generation, convergence speed, diversity maintenance, quality gate pass rate, and pattern propagation success rate.

4. **Hypothesis Generation** -- Based on the effectiveness analysis, hypotheses for parameter modifications are generated. For example: "Increasing the mutation rate from 0.05 to 0.08 will improve population diversity by 15% without reducing mean fitness."

5. **Experiment Design** -- Each hypothesis is translated into a controlled experiment with clear success criteria, measurement methodology, and statistical confidence requirements. The experiment design is documented in a GitLab issue.

6. **Controlled Execution** -- The experiment is executed, potentially using A/B testing with parallel evolution runs under different parameter configurations. Execution is monitored in real time for safety constraints.

7. **Statistical Evaluation** -- Experiment results are evaluated using appropriate statistical tests (t-test, Mann-Whitney U, etc.) to determine whether observed differences are statistically significant at the configured confidence level.

8. **Parameter Update or Rollback** -- If the experiment demonstrates statistically significant improvement, the meta-parameters are updated. If results are inconclusive or negative, parameters are rolled back to the baseline.

9. **Documentation and Tracking** -- The complete experiment lifecycle is documented in GitLab: hypothesis, methodology, results, conclusion, and parameter changes. This creates an institutional memory of meta-evolution decisions.

10. **Meta-Telemetry Emission** -- Meta-level metrics are emitted for cross-session tracking of meta-evolution effectiveness.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Agent Execution | Executed by the `meta-evolution-orchestrator` agent |
| [Mega-Evolve](/commands/mega-evolve/) | Phase Integration | Meta-evolution as Phase 7 of mega-evolution |
| [Mendelize](/commands/mendelize/) | Target Subsystem | Genetic algorithm parameters are meta-evolvable |
| [Mycelialize](/commands/mycelialize/) | Target Subsystem | Propagation parameters are meta-evolvable |
| AutoHeal | Target Subsystem | Healing parameters are meta-evolvable |
| [Quality Gates](/glossary/quality-gates/) | Validation | Evolution improvements validated through quality gates |
| [GitLab](/glossary/gitlab-ci/) | Experiment Tracking | Full experiment lifecycle tracked in GitLab issues |
| [NABLA Infinity](/glossary/nabla-infinity/) | Epistemic Framework | Meta-evolution claims validated through Trinity Gate |
| [Telemetry](/glossary/telemetry/) | Observability | Meta-level metrics for evolution of evolution |

## Best Practices

**Evidence Over Intuition**: Never modify meta-parameters based on intuition alone. Always run a controlled experiment with statistical evaluation. The `/meta-evolve --experiment` mode exists specifically for this purpose.

**Conservative Changes**: Modify one meta-parameter at a time. Multi-variable changes make it impossible to attribute improvement or degradation to specific modifications.

**Sufficient Sample Size**: Ensure experiments run for enough generations or sessions to achieve statistical significance. A minimum of 10 evolution cycles per experiment arm is recommended.

**Rollback Readiness**: Always verify that rollback is available before starting a meta-evolution experiment. Use `/meta-evolve history` to confirm the baseline state is recorded.

**Document Hypotheses**: Even failed experiments are valuable. Document every hypothesis, methodology, and result in GitLab to build institutional knowledge about what works and what does not.

## Error Handling

| Error Condition | Response | Recovery |
|----------------|----------|----------|
| Insufficient authority (below SUPREME) | Permission denied | Escalate to SUPREME authority |
| Parameter out of valid range | Validation error with valid range | Adjust parameter value within bounds |
| A/B test inconclusive | Informational report with power analysis | Increase sample size or extend experiment duration |
| Rollback target not found | Error listing available rollback points | Choose an available rollback point from history |
| GitLab tracking failure | Warning; experiment proceeds without tracking | Verify GitLab token and project configuration |
| Concurrent meta-evolution | Blocked; only one meta-evolution cycle at a time | Wait for current cycle to complete |

## Advanced Usage

### Automated Meta-Evolution

Configure meta-evolution to run automatically when evolution effectiveness drops below thresholds:

```bash
# Auto-trigger meta-evolution when fitness improvement rate drops below 0.1% per generation
/meta-evolve --auto --trigger=fitness-stagnation --threshold=0.001
```

### Multi-Objective Meta-Optimization

Optimize meta-parameters for multiple objectives simultaneously:

```bash
# Optimize for both convergence speed and solution quality
/meta-evolve --multi-objective=convergence-speed,solution-quality --pareto
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for undocumented meta-parameter changes. Every modification must be tracked, justified by experimental evidence, and validated through quality gates. Uncontrolled modifications to evolution parameters are rejected as L4 violations.
- **NO DOUBTS**: Full statistical evaluation of every meta-evolution hypothesis. No parameter change is accepted without evidence meeting the configured confidence threshold. The system explicitly maintains and reports uncertainty through confidence intervals and p-values, aligned with the [NABLA Infinity](/glossary/nabla-infinity/) "Unknown Valid" axiom.

## Related Commands

- [/evolve](/commands/evolve/) - Living AIAD ecosystem evolution with 5-phase cycle and GitLab [observability](/glossary/observability/)
- [/mycelialize](/commands/mycelialize/) - Biological-inspired pattern propagation at 500K patterns/sec with emergence detection
- [/mycelialize-formal](/commands/mycelialize-formal/) - [Lean4](/glossary/lean4/) + Prolog [formal verification](/glossary/formal-verification/) for mathematically proven pattern propagation
- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](/commands/quality-enforce/) - Mandatory progressive [quality debt](/glossary/quality-debt/) elimination with AIAD enforcement
- [/regression-check](/commands/regression-check/) - Execute 25 custom [Credo](/glossary/credo/) regression checks preventing 700+ violations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)