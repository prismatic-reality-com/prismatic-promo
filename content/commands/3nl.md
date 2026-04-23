+++
title = "/3nl"
weight = 2040
[extra]
category = "Framework"
description = "Three-layer neural linguistic processing and coordination"
syntax = "/3nl [options]"
authority = "L2+"
agent = "3nl-coordinator"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1660
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["3nl", "Three-layer", "commands", "Framework", "Prismatic Platform", "Depths", "Logic", "Neural"]
tags = ["commands", "framework", "3nl", "prismatic"]
quality_score = 90
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/3nl - Prismatic Platform"
+++

## Overview

The **/3nl** command provides strategic access to the Three-Layer Neural Learning (3NL) intelligence processing system within the Prismatic Platform. This framework orchestrates three distinct cognitive layers -- L1 (Logic), L2 (Neural), and L3 (Linguistic) -- to deliver unified intelligence analysis across the entire [AIAD](@/glossary/aiad.md) ecosystem. By decomposing complex analytical tasks into specialized processing domains and then fusing the results, the 3NL command enables a depth of analysis that no single processing paradigm can achieve in isolation.

The significance of the 3NL command lies in its role as the epistemic backbone of the platform's intelligence capabilities. Where traditional analysis tools operate through a single lens -- either rule-based reasoning, statistical pattern recognition, or natural language understanding -- the 3NL command synthesizes all three simultaneously. This multi-layered approach aligns with the platform's [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic framework, which mandates signal plurality and contradiction preservation. Every query processed through the 3NL pipeline receives evaluation from multiple independent cognitive perspectives, ensuring that conclusions are robust, evidence-based, and resistant to single-point epistemic failures.

Within the broader architecture of the Prismatic Platform, the 3NL command serves as a foundational intelligence primitive. It is invoked both directly by operators seeking deep analysis capabilities and indirectly by other platform commands that require multi-layered cognitive processing. The command integrates tightly with the [Trinity Gate](@/glossary/trinity-gate.md) validation system and the 16-level epistemic pipeline (L0 through L13, plus Meta and Consciousness levels), providing the analytical substrate upon which higher-order intelligence operations are built. The 3NL framework represents the convergence of symbolic AI, connectionist approaches, and natural language processing into a single, cohesive command interface -- a synthesis that reflects decades of research in hybrid AI architectures applied to the practical demands of intelligence analysis and platform evolution.

## Syntax and Usage

```bash
/3nl <subcommand> [options]
```

The command accepts a required subcommand that determines the processing mode, followed by optional parameters that control depth, fusion strategy, and output format. Four primary subcommands are available: `process` for query-driven analysis, `analyze` for document and data analysis, `status` for system health inspection, and `config` for runtime parameter tuning.

### Process a Query Through the Full 3NL Pipeline

```bash
/3nl process "What security risks exist in the authentication layer?" --context security
```

### Deep Multi-Level Analysis

```bash
/3nl analyze document.txt --depth 14 --fusion attention
```

### Check 3NL System Status

```bash
/3nl status --verbose
```

### Configure Processing Parameters

```bash
/3nl config --set fusion=ensemble
```

### Security-Focused Analysis with Cascade Fusion

```bash
/3nl process "Analyze supply chain dependencies for vulnerabilities" --context security --fusion cascade
```

### Batch Multi-Document Analysis

```bash
/3nl analyze ./reports/ --depth 10 --fusion consensus --format json --output analysis-results.json
```

## Parameters and Options

| Option | Short | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `subcommand` | -- | string | -- | Action to perform: `process`, `analyze`, `status`, `config` |
| `--context` | `-c` | string | `general` | Processing context: `security`, `analysis`, `osint`, `general` |
| `--fusion` | `-f` | string | `weighted` | Fusion strategy: `weighted`, `consensus`, `cascade`, `ensemble`, `attention` |
| `--depth` | `-d` | integer | `7` | Analysis depth (1-14, corresponding to [NABLA](@/glossary/nabla-infinity.md) epistemic levels) |
| `--verbose` | `-v` | boolean | `false` | Verbose output with per-layer details and confidence scores |
| `--format` | -- | string | `text` | Output format: `text`, `json`, `markdown` |
| `--output` | `-o` | path | stdout | Write results to file |
| `--timeout` | -- | integer | `300` | Maximum processing time in seconds |
| `--cache` | -- | boolean | `true` | Enable result caching for repeated queries |

The `--depth` parameter maps directly to the NABLA epistemic pipeline levels. Depths 1-5 invoke surface-level analysis suitable for quick assessments. Depths 6-10 engage the full three-layer pipeline with comprehensive cross-validation. Depths 11-14 activate the deepest epistemic processing, including meta-level reflection and consciousness-layer evaluation, and should be reserved for critical decisions where processing time is secondary to analytical rigor.

The `--fusion` parameter selects the strategy for combining outputs from the three cognitive layers. Each strategy embodies a different epistemic philosophy regarding how independent analytical perspectives should be reconciled into a unified conclusion.

## Implementation Architecture

The 3NL command is implemented as a multi-agent coordination pipeline. The `3nl-coordinator` agent orchestrates three specialized sub-agents, each responsible for one cognitive layer. Results from all three layers are combined through the selected fusion strategy before passing through [Trinity Gate](@/glossary/trinity-gate.md) validation.

```elixir
defmodule Prismatic3NL.Command do
  @moduledoc """
  Three-Layer Neural Learning command handler.
  Orchestrates L1 (Logic), L2 (Neural), and L3 (Linguistic) processing
  with configurable fusion strategies and depth control.
  """

  alias Prismatic3NL.{L1Logic, L2Neural, L3Linguistic, FusionEngine}

  @spec process(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def process(query, opts \\ []) do
    context = Keyword.get(opts, :context, :general)
    fusion = Keyword.get(opts, :fusion, :weighted)

    with {:ok, l1_result} <- L1Logic.analyze(query, context),
         {:ok, l2_result} <- L2Neural.analyze(query, context),
         {:ok, l3_result} <- L3Linguistic.analyze(query, context),
         {:ok, fused} <- FusionEngine.fuse([l1_result, l2_result, l3_result], fusion) do
      {:ok, %{
        result: fused,
        layers: %{logic: l1_result, neural: l2_result, linguistic: l3_result},
        confidence: fused.confidence,
        fusion_strategy: fusion
      }}
    end
  end
end
```

The three cognitive layers provide complementary analytical capabilities that, when combined, produce insights no single approach can achieve independently.

**L1 Logic Layer**: Performs symbolic reasoning using facts, rules, and Prolog-style inference chains. This layer excels at deductive analysis, formal constraint validation, and logical consistency checking. It operates on structured representations of knowledge, applying formal rules to derive conclusions. The L1 layer is particularly effective for security policy validation, access control analysis, and regulatory compliance checking where rules can be formally expressed.

**L2 Neural Layer**: Handles pattern recognition through embeddings, classification models, and anomaly detection algorithms. This layer identifies statistical regularities that rule-based systems miss, including subtle correlations in data, emergent behavioral patterns, and deviations from established baselines. The L2 layer leverages the platform's Ollama integration for local model inference, ensuring that sensitive data never leaves the platform boundary.

**L3 Linguistic Layer**: Provides natural language understanding through named entity recognition, sentiment analysis, contextual response generation, and semantic similarity computation. This layer processes unstructured text inputs, extracts structured information, and generates human-readable explanations of analytical results. It serves as both the input parser and the output formatter for the 3NL pipeline.

The fusion engine supports five distinct strategies for combining layer outputs:

| Strategy | Mechanism | Best For |
|----------|-----------|----------|
| **Weighted** | Static pre-configured weights per layer | General-purpose queries with known layer reliability |
| **Consensus** | Requires agreement across layers | High-stakes decisions requiring cross-validation |
| **Cascade** | Sequential refinement, each layer refining predecessor output | Complex multi-step analysis chains |
| **Ensemble** | Majority voting across layer outputs | Robust predictions resistant to individual layer errors |
| **Attention** | Dynamic weight allocation based on query characteristics | Adaptive processing where optimal layer varies by query |

## Examples

### Security Architecture Assessment

```bash
/3nl process "Evaluate the authentication subsystem for OWASP Top 10 vulnerabilities" \
  --context security --fusion consensus --depth 12 --verbose
```

This invocation engages all three layers with security-specific processing modes. L1 Logic checks authentication flows against formal security rules. L2 Neural analyzes patterns for known vulnerability signatures. L3 Linguistic processes threat intelligence feeds for relevant advisories. The consensus fusion ensures all three layers agree before establishing any finding.

### OSINT Cross-Validation

```bash
/3nl process "Cross-validate intelligence on target entity across open sources" \
  --context osint --fusion attention --depth 10
```

The attention fusion strategy is ideal for OSINT because different source types benefit from different layer strengths. Text-heavy sources are best processed by L3 Linguistic, while structured data benefits from L1 Logic analysis.

### Architecture Decision Analysis

```bash
/3nl analyze ./docs/architecture/proposed-migration.md --depth 8 --fusion weighted
```

Document analysis mode processes the entire file through each layer, extracting architectural patterns (L1), identifying similarity to known successful and failed migrations (L2), and summarizing the proposal in actionable terms (L3).

## Integration with Platform

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Coordinated execution through `3nl-coordinator` and three layer agents |
| [Trinity Gate](@/glossary/trinity-gate.md) | All 3NL outputs validated through 4-layer Trinity Gate |
| [NABLA Infinity](@/glossary/nabla-infinity.md) | Depth parameter maps directly to 16-level epistemic pipeline |
| [Quality Gates](@/glossary/quality-gates.md) | Pre/post execution quality validation enforced |
| [Telemetry](@/glossary/telemetry.md) | Command execution [metrics](@/glossary/metrics.md) and layer performance tracking |
| [Quality DNA](@/glossary/quality-dna.md) | Results persisted for cross-session continuity |
| AIAD Registry | Command specification discovery and versioning |
| [Mycelial Network](@/glossary/mycelial-network.md) | Pattern propagation across agent ecosystem |
| Ollama Integration | Local AI model inference for L2 Neural layer |
| Session Lifecycle | Automatic result persistence and cross-session recall |

The 3NL command is also invoked programmatically by higher-order platform operations, including [/archer-supreme](@/commands/archer-supreme.md) missions and [/aiad-auto-evolution](@/commands/aiad-auto-evolution.md) cycles, where deep multi-layered analysis is required before making critical decisions. The command's output format is designed to be consumed by both human operators and downstream automated systems.

## Workflow Integration

The 3NL command is most effective in scenarios that demand multi-perspective analysis. Security assessments benefit from the combination of rule-based vulnerability checks (L1), anomaly pattern detection (L2), and natural language threat intelligence processing (L3). OSINT operations leverage all three layers to cross-validate intelligence from diverse sources.

In a typical development workflow, the 3NL command is invoked during architectural reviews, security audits, and complex debugging sessions where surface-level analysis is insufficient. It integrates with the platform's [session lifecycle](@/glossary/session-discipline.md) system, meaning results are automatically persisted to session context for cross-session continuity.

The command fits into several established workflow patterns:

1. **Pre-Decision Analysis**: Before architectural decisions, security policy changes, or deployment approvals, run `/3nl process` with high depth to ensure multi-perspective evaluation.
2. **Post-Incident Investigation**: After security incidents or quality regressions, use `/3nl analyze` on incident logs to identify root causes that single-perspective analysis might miss.
3. **Continuous Intelligence**: Schedule periodic `/3nl process` runs against evolving threat landscapes to maintain current situational awareness.
4. **Quality Evolution Support**: The 3NL analysis results feed into [/quality-evolve](@/commands/quality-evolve.md) cycles, providing the analytical foundation for targeted improvements.

## NABLA Compliance

All 3NL command operations are governed by the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine with explicit enforcement at every processing stage:

- **NO MERCY**: Zero tolerance for incomplete layer processing. All three cognitive layers must complete successfully before fusion. Partial results are never returned. Fusion strategies must produce validated outputs or fail explicitly. No approximate or degraded results are permitted.
- **NO DOUBTS**: Full investigation before conclusions. Every 3NL output includes confidence scores from all three layers, provenance tracking for all reasoning chains, and explicit contradiction preservation when layers disagree. The NABLA axiom of Signal Plurality is enforced by requiring at minimum two independent layer signals before establishing any belief.

The command enforces the seven NABLA axioms throughout its operation:

| Axiom | Enforcement in 3NL |
|-------|-------------------|
| **Signal Plurality** | Three independent layers provide minimum two confirming signals |
| **Contradiction Preservation** | Layer disagreements preserved in output, never suppressed |
| **Absence Informative** | Missing layer results tracked as data points |
| **Time Decay** | Results timestamped, confidence degrades over time |
| **Unknown Valid** | "Inconclusive" is a valid fusion output |
| **Source Independence** | Each layer operates on independent analytical pathways |
| **Provenance Mandatory** | Full reasoning chain from input through each layer to fusion |

The command also enforces the Addiction Preservation principle: when L1 Logic and L2 Neural layers produce contradictory results, both signals are preserved in the output rather than being resolved prematurely. This ensures that downstream consumers receive the full epistemic picture, including uncomfortable contradictions that might indicate genuine ambiguity in the input.

## Performance

| Metric | Target | Typical |
|--------|--------|---------|
| L1 Logic processing | < 2s | ~500ms |
| L2 Neural processing | < 5s | ~2s (Ollama dependent) |
| L3 Linguistic processing | < 3s | ~1s |
| Fusion computation | < 500ms | ~100ms |
| Total pipeline (depth 7) | < 10s | ~4s |
| Total pipeline (depth 14) | < 60s | ~25s |
| Cache hit response | < 100ms | ~20ms |
| Memory overhead per query | < 50MB | ~15MB |

Performance scales with depth parameter. Depths 1-5 complete in under 3 seconds for typical queries. Depths 6-10 range from 4-15 seconds. Depths 11-14 may require 15-60 seconds for exhaustive processing. The caching system eliminates repeated computation for identical queries with identical parameters, reducing response time to sub-100ms for cache hits.

## Related Commands

- [/seadf](@/commands/seadf.md) - Self-Evolving Autonomous Development Framework control and monitoring
- [/analyze](@/commands/analyze.md) - System architecture analysis with dependency mapping
- [/rc1-orchestrate](@/commands/rc1-orchestrate.md) - Complete RC1 delivery pipeline execution with ROC optimization
- [/inject](@/commands/inject.md) - AIAD injection coordination for pattern and agent deployment
- [/migrate](@/commands/migrate.md) - Safe migration planning with rollback strategies
- [/integrate](@/commands/integrate.md) - Cross-system integration design and implementation
- [/aiad-auto-evolution](@/commands/aiad-auto-evolution.md) - Self-evolving command specification with meta-evolution capabilities
- [/archer-supreme](@/commands/archer-supreme.md) - Supreme strategic coordination with multi-domain analysis

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)