+++
title = "/reasoning"
weight = 1770
[extra]
category = "Formal Verification"
description = "Multi-paradigm reasoning combining Bayesian, logical and abductive inference"
syntax = "/reasoning [options]"
authority = "L2+"
agent = "reasoning-coordinator"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1241
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["reasoning", "Multi-paradigm", "Bayesian", "commands", "Formal Verification", "Prismatic Platform", "Step", "Trinity Gate"]
tags = ["commands", "formal-verification", "reasoning", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/reasoning - Prismatic Platform"
+++

## Overview

**/reasoning** is a production command in the **[Formal Verification](/glossary/formal-verification/)** category of the Prismatic Platform that provides multi-paradigm reasoning capabilities combining Bayesian probabilistic inference, classical logical deduction, and abductive hypothesis generation. This command serves as the platform's primary cognitive engine for complex decision-making scenarios where a single reasoning paradigm would produce incomplete or biased conclusions.

The reasoning command addresses a fundamental limitation in automated decision systems: the tendency to rely on a single inference method. Bayesian reasoning excels at updating beliefs with new evidence but struggles with structural relationships. Logical deduction provides rigorous proofs but cannot handle uncertainty. Abductive reasoning generates explanatory hypotheses but lacks the formal guarantees of deductive methods. By combining all three paradigms in a coordinated pipeline, the `/reasoning` command produces conclusions that are simultaneously probabilistically calibrated, logically consistent, and explanatorily complete.

At its core, the reasoning engine implements the [NABLA Infinity](/glossary/nabla-infinity/) epistemic framework, enforcing all seven non-negotiable axioms during every reasoning operation. Signal plurality ensures that conclusions draw from multiple independent evidence sources. Contradiction preservation maintains conflicting signals rather than prematurely resolving them. Provenance tracking ensures that every conclusion can be traced back through its complete chain of evidence and inference steps.

This command operates under the **L2+** authority level and is executed by the `reasoning-coordinator` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard.

## Architecture

The reasoning engine is structured as a three-tier inference pipeline with a synthesis layer that reconciles outputs from all paradigms.

```
Input Evidence
    |
    v
[Evidence Preprocessor] --> Normalization, Source Tagging, Timestamp
    |
    +---> [Bayesian Engine] --> Prior Selection, Likelihood, Posterior
    |
    +---> [Logical Engine] --> Axiomatization, Proof Search, Verification
    |
    +---> [Abductive Engine] --> Hypothesis Generation, Ranking, Filtering
    |
    v
[Synthesis Layer] --> Paradigm Reconciliation, Conflict Detection
    |
    v
[Trinity Gate] --> Structural + Logical + Formal Verification
    |
    v
Validated Conclusion with Confidence Score
```

The Bayesian engine maintains a belief network represented as a directed acyclic graph (DAG) where nodes represent propositions and edges represent conditional dependencies. Evidence updates propagate through the network using exact inference for small networks and variational approximation for larger ones.

The logical engine operates on a first-order logic foundation with support for modal operators (necessity and possibility) and temporal logic extensions. Proof search employs resolution-based theorem proving with heuristic guidance from the abductive engine.

The abductive engine generates candidate explanations for observed evidence using a pattern library derived from the platform's [GARDEN](/glossary/garden/) knowledge base. Hypotheses are ranked by explanatory power, simplicity, and consistency with the other paradigms' outputs.

## Usage

```bash
# Basic reasoning about a system behavior
/reasoning --evidence="test failures in prismatic_web after dependency update"

# Bayesian-focused reasoning with prior specification
/reasoning --mode=bayesian --prior=uniform --evidence="latency spike at 14:30"

# Logical proof search for a system property
/reasoning --mode=logical --proposition="all routes return valid HTTP status codes"

# Abductive hypothesis generation for anomaly
/reasoning --mode=abductive --observation="memory growth without request increase"

# Multi-paradigm with explicit confidence threshold
/reasoning --threshold=0.95 --evidence="compilation warning in new module"

# Reasoning with context from previous sessions
/reasoning --context=session-2026-01-28 --evidence="quality score dropped from 100 to 98"

# Formal reasoning with Lean4 proof output
/reasoning --formal --lean4-output --proposition="supervisor restart guarantees liveness"
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--mode` | enum | multi | Reasoning mode: `bayesian`, `logical`, `abductive`, or `multi` |
| `--evidence` | string | required | Evidence string or path to evidence file |
| `--proposition` | string | - | Logical proposition to prove or evaluate |
| `--observation` | string | - | Observed phenomenon for abductive reasoning |
| `--prior` | string | informed | Prior distribution: `uniform`, `informed`, or `custom` |
| `--threshold` | float | 0.80 | Confidence threshold for conclusion acceptance |
| `--context` | string | - | Session context identifier for historical reasoning |
| `--formal` | boolean | false | Enable formal verification of conclusions |
| `--lean4-output` | boolean | false | Generate Lean4 proof artifacts |
| `--max-hypotheses` | integer | 10 | Maximum abductive hypotheses to generate |
| `--depth` | integer | 5 | Maximum proof search depth for logical engine |
| `--trinity-gate` | boolean | true | Require Trinity Gate passage for conclusions |
| `--verbose` | boolean | false | Show intermediate reasoning steps |
| `--format` | enum | text | Output format: `text`, `json`, `graph` |

## Execution Flow

The reasoning command follows a disciplined execution flow that preserves epistemic integrity throughout the process.

**Step 1 - Evidence Ingestion**: Raw evidence is parsed, normalized, and tagged with source metadata and timestamps. Each evidence item receives a unique provenance identifier that follows it through the entire reasoning pipeline. This step enforces the NABLA Provenance Mandatory axiom.

**Step 2 - Paradigm Dispatch**: Based on the selected mode, evidence is distributed to the appropriate reasoning engines. In `multi` mode (the default), all three engines receive the same evidence and operate independently to prevent cross-contamination of reasoning approaches.

**Step 3 - Independent Inference**: Each engine processes the evidence according to its paradigm. The Bayesian engine computes posterior probabilities, the logical engine searches for proofs or counterexamples, and the abductive engine generates ranked hypotheses. Timing constraints ensure that no engine dominates the pipeline.

**Step 4 - Synthesis**: The synthesis layer receives outputs from all active engines and performs paradigm reconciliation. When engines agree, confidence is amplified. When they disagree, the contradiction is preserved (per NABLA Contradiction Preservation axiom) and presented alongside the reasoning for each position.

**Step 5 - Trinity Gate Validation**: The synthesized conclusion passes through the Trinity Gate, verifying structural consistency, logical consistency, and formal necessity. Only conclusions that pass all three gates are presented as established beliefs.

**Step 6 - Output Generation**: The validated conclusion is formatted with its confidence score, supporting evidence chain, and any preserved contradictions. The complete reasoning trace is available in verbose mode for audit purposes.

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `reasoning-coordinator` | Coordinates with specialist agents per paradigm |
| [NABLA Infinity](/glossary/nabla-infinity/) | Epistemic framework | All 7 axioms enforced during reasoning |
| [Trinity Gate](/glossary/trinity-gate/) | Conclusion validation | 3-layer verification for all established beliefs |
| [Lean4](/commands/lean/) | Formal proofs | Logical engine outputs verified in Lean4 |
| [Quality Gates](/glossary/quality-gates/) | Pre/post validation | Reasoning quality metrics tracked |
| [GARDEN](/glossary/garden/) | Pattern library | Abductive engine draws from 55+ known patterns |
| [Telemetry](/glossary/telemetry/) | Execution metrics | Reasoning times and confidence distributions tracked |

## Best Practices

Use multi-paradigm mode (the default) for any decision with significant consequences. Single-paradigm modes are appropriate for exploratory analysis but should not be used as the basis for code changes, architectural decisions, or deployment approvals. The overhead of running all three engines is minimal compared to the risk of a paradigm-biased conclusion.

Provide structured evidence whenever possible. While the reasoning engine can parse natural language evidence strings, structured input (JSON format with explicit source and timestamp fields) produces more reliable results because it eliminates ambiguity in the evidence ingestion phase.

Review contradictions rather than dismissing them. When the synthesis layer preserves a contradiction between paradigms, this is a signal that the problem space contains genuine complexity that deserves further investigation. The most dangerous conclusions are those that appear confident but have suppressed legitimate counterarguments.

Set confidence thresholds appropriate to the decision context. The default 0.80 threshold suits standard development operations, but critical decisions (deployments, architectural changes, security-related reasoning) should use the 0.95 threshold mandated by the NABLA framework for critical contexts.

## Error Handling

The reasoning command handles errors at multiple levels. Evidence parsing errors are reported immediately with suggestions for reformatting. Engine-level errors (such as proof search timeout in the logical engine) are isolated to the failing paradigm; the remaining engines continue processing and the synthesis layer notes the incomplete paradigm coverage.

When the Trinity Gate rejects a conclusion, the error report includes the specific gate that failed and the evidence that contradicts the proposed conclusion. This enables targeted investigation rather than requiring the entire reasoning process to be restarted.

```
REASONING ERROR REPORT
Status: Trinity Gate REJECTED
Failed Gate: Logical Consistency (Gate 2)
Reason: Conclusion "all routes are authenticated" contradicts
        evidence item E-0042 showing /health endpoint has no auth
Suggestion: Refine proposition to exclude health check endpoints
            or provide evidence justifying their exemption
```

## Advanced Usage

Advanced users can chain reasoning operations to build complex inference pipelines. The output of one reasoning operation can serve as evidence input to another, enabling hierarchical reasoning about system properties.

```bash
# Hierarchical reasoning: first analyze symptoms, then reason about root cause
/reasoning --mode=abductive --observation="intermittent test failures" --format=json > /tmp/hypotheses.json
/reasoning --mode=logical --evidence=@/tmp/hypotheses.json --proposition="race condition in GenServer"

# Comparative reasoning across time periods
/reasoning --context=session-2026-01-15 --evidence="quality metrics" --mode=bayesian
/reasoning --context=session-2026-01-28 --evidence="quality metrics" --mode=bayesian
```

The `--graph` output format generates a DOT-format visualization of the reasoning network, showing evidence nodes, inference edges, and conclusion nodes with their confidence scores. This visualization is invaluable for auditing complex reasoning chains and identifying weak links in the evidence structure.

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. The reasoning engine never produces conclusions without complete evidence chains. Partial results are explicitly labeled as such and never presented as established beliefs.
- **NO DOUBTS**: Full investigation before action, evidence-based results. This command is the embodiment of the NO DOUBTS principle. Every conclusion is backed by multi-paradigm evidence, verified through the Trinity Gate, and traceable through complete provenance chains.

## Related Commands

- [/lean](/commands/lean/) - Execute Lean 4 code or prove a theorem with the lean-specialist agent
- [/prolog](/commands/prolog/) - Prolog-based logical reasoning and inference operations
- [/formal-verify](/commands/formal-verify/) - Formal verification of system properties and invariants
- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](/commands/quality-enforce/) - Mandatory progressive [quality debt](/glossary/quality-debt/) elimination with AIAD enforcement
- [/regression-check](/commands/regression-check/) - Execute 25 custom [Credo](/glossary/credo/) regression checks preventing 700+ violations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)