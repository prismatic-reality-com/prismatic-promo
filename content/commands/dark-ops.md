+++
title = "/dark-ops"
weight = 1100
[extra]
category = "Crisis"
description = "NABLA structural crisis detection and dark operations analysis"
syntax = "/dark-ops [options]"
authority = "SUPREME"
agent = "dark-ops-analyst"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 877
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["dark-ops", "NABLA", "commands", "Crisis", "Prismatic Platform", "Dark Ops", "Analysis"]
tags = ["commands", "crisis", "dark-ops", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/dark-ops - Prismatic Platform"
+++

## Overview

The **/dark-ops** command activates structural crisis detection and analysis for systems that have entered a state where conventional optimization fails. Named after the mathematical concept of nabla-infinity, this command identifies **structural singularities** -- situations where small changes cause disproportionate consequences, where "correct solutions" worsen the situation, and where standard management approaches are counterproductive. It is the platform's tool for when something is fundamentally wrong at a structural level, not merely broken at a surface level.

The distinction between optimizable problems and structural singularities is critical. An optimizable problem (symbolized as nabla-f) has local causes, predictable impact, and responds to normal management interventions. A structural singularity (symbolized as nabla-infinity) has systemic causes, chaotic response patterns, and actively resists conventional fixes. Dark Ops mode activates when the system detects that a problem falls into the second category, deploying specialized analytical tools drawn from graph theory, topology analysis, and contradiction mapping.

This command operates under the **SUPREME** authority level and is executed by the `dark-ops-analyst` agent, supported by a response team that includes the `structural-analyst`, `graph-analyst`, and `contradiction-detector` agents. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. All Dark Ops operations are audited and subject to ethical review, ensuring that structural analysis serves constructive purposes.

The NABLA pipeline processes input through up to 14 levels of analysis, from raw signal processing (L0) through pattern recognition (L11) to philosophical override checks (L12) and recursive convergence (L-infinity). This depth of analysis enables the command to detect contradictions, paradoxes, and structural tensions that are invisible to surface-level inspection, providing actionable intervention strategies that address root causes rather than symptoms.

## Architecture

### Dark Ops Processing Pipeline

```
DARK OPS ACTIVATION
    |
    v
PHASE 1: DETECTION (0-2 minutes)
    +-- NABLA pipeline activation
    +-- Convergence state analysis
    +-- Attractor class determination
    +-- Chaos detection metrics
    +-- Initial classification
    |
    v
PHASE 2: MAPPING (2-10 minutes)
    +-- Contradiction graph construction
    +-- Decision topology analysis
    +-- Centrality node identification
    +-- Cycle detection
    +-- Paradox mapping (Level 7)
    |
    v
PHASE 3: ANALYSIS (10-20 minutes)
    +-- Pattern recognition (Level 11)
    +-- Philosophical override check (NI-12)
    +-- Ethical resonance evaluation (Level 8)
    +-- Belief decomposition (Level 10)
    +-- Recursive convergence (Level infinity)
    |
    v
PHASE 4: INTERVENTION DESIGN
    +-- Safety constraint analysis
    +-- Intervention option generation
    +-- Unintended consequence modeling
    +-- Decision tree construction
    +-- Recommendation synthesis
    |
    v
PHASE 5: DELIVERABLE
    +-- Structural assessment report
    +-- Intervention matrix
    +-- Audit trail record
```

### Attractor Classification

| Attractor Class | Symbol | Characteristics | Recommended Approach |
|----------------|--------|-----------------|---------------------|
| **Stable** | `:stable` | Converging to fixed point, predictable | Standard management |
| **Chaotic** | `:chaotic` | High variance, no convergence, unpredictable | Dark Ops structural intervention |
| **Critical** | `:critical` | Near bifurcation point, could go either way | Dark Ops with careful monitoring |
| **Unknown** | `:unknown` | Insufficient data for classification | Extend analysis depth |

### Two Operating Regimes

| Regime | Symbol | Characteristics | Approach |
|--------|--------|-----------------|----------|
| **Optimizable** | nabla-f | Local causes, predictable impact, responds to fixes | Normal management |
| **Singular** | nabla-infinity | Structural causes, chaotic response, resists fixes | Dark Ops mode |

## Usage

### Detection -- Identify Structural Singularities

```bash
# Detect if a domain has entered nabla-infinity state
/dark-ops detect "engineering-team"

# Detection with increased analysis depth
/dark-ops detect "decision-making-process" --depth 10

# Detect with full format output
/dark-ops detect "organizational-culture" --format full
```

### Mapping -- Chart Structural Contradictions

```bash
# Map contradictions in system architecture
/dark-ops map "codebase-architecture"

# Map organizational dynamics with full analysis
/dark-ops map "team-communication" --format full

# Map with maximum depth
/dark-ops map "strategic-priorities" --depth 14
```

### Intervention -- Generate Resolution Strategies

```bash
# Generate intervention recommendations
/dark-ops intervene "leadership-dynamics"

# Deep intervention analysis
/dark-ops intervene "sales-engineering-conflict" --depth 12

# Tactical intervention output
/dark-ops intervene "migration-stall" --format tactical
```

### Audit -- Review Historical Analyses

```bash
# Audit Dark Ops activity for a period
/dark-ops audit "2026-Q1"

# Audit specific domain
/dark-ops audit "project-alpha" --format brief
```

## Options & Parameters

| Parameter | Position/Flag | Required | Type | Default | Description |
|-----------|---------------|----------|------|---------|-------------|
| **analysis_type** | $1 | Yes | enum | -- | detect, map, intervene, or audit |
| **target_domain** | $2 | Yes | string | -- | System/domain to analyze |
| **--depth** | flag | No | integer | 7 | NABLA processing depth (0-14) |
| **--format** | flag | No | enum | `tactical` | Output format: brief, full, tactical |

## Execution Flow

### Technical Implementation

```elixir
# Dark Ops analysis through NABLA pipeline
{:ok, result} = PrismaticNabla.process(input,
  levels: 0..14,
  mode: :dark_ops,
  context: %{
    domain: target_domain,
    depth: processing_depth
  }
)

# Extract attractor class
attractor = result.convergence.attractor_class
# => :stable | :chaotic | :critical | :unknown

# Check for nabla-infinity state
if attractor in [:chaotic, :critical] do
  activate_dark_ops_mode(result)
end
```

### Convergence Detection

```elixir
defmodule PrismaticNabla.Core.ConvergenceDetector do
  @type attractor_class :: :stable | :chaotic | :critical | :unknown

  def detect_attractor(belief_history) do
    variance = calculate_variance(belief_history)
    trend = analyze_trend(belief_history)

    cond do
      converging_to_fixed_point?(trend) -> :stable
      chaotic_basin?(variance) -> :chaotic
      near_bifurcation?(trend, variance) -> :critical
      true -> :unknown
    end
  end
end
```

### Graph Evidence Analysis

```elixir
# Decision topology analysis
{:ok, graph} = PrismaticNabla.GraphEvidence.build_graph(evidence)

# Identify high-centrality nodes (power concentration)
centrality = GraphEvidence.calculate_centrality(graph)
critical_nodes = Enum.filter(centrality, fn {_, score} -> score > 0.8 end)

# Detect contradiction cycles
cycles = GraphEvidence.detect_cycles(graph)
paradox_cycles = Enum.filter(cycles, &contains_contradiction?/1)
```

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Multi-agent response team | structural-analyst, graph-analyst, contradiction-detector |
| NABLA Pipeline | Core processing engine | 14-level epistemic processing pipeline |
| [AIAD](/glossary/aiad/) Registry | Command specification | Crisis-detection category |
| [Quality Gates](/glossary/quality-gates/) | 4-gate quality validation | Activation, Analysis, Intervention Safety, Documentation |
| [Telemetry](/glossary/telemetry/) | Event tracking and [metrics](/glossary/metrics/) | All operations emit telemetry events |
| Ethics Validator | Mandatory ethical review | Every intervention passes ethical boundary check |
| Audit System | Immutable audit trail | All Dark Ops operations recorded |

### Quality Gates

```
GATE 1: ACTIVATION CRITERIA
    +-- Nabla-infinity indicators present
    +-- Conventional approaches exhausted
    +-- Appropriate authority level
    +-- Ethical review passed

GATE 2: ANALYSIS QUALITY
    +-- Evidence sufficiency (>3 independent signals)
    +-- Contradiction graph complete
    +-- Centrality analysis performed
    +-- Paradox mapping done

GATE 3: INTERVENTION SAFETY
    +-- Unintended consequence analysis
    +-- Ethical boundary check
    +-- Risk assessment complete
    +-- Reversibility evaluation

GATE 4: DOCUMENTATION
    +-- Audit trail complete
    +-- Decision rationale recorded
    +-- Evidence preserved
    +-- Intervention outcomes tracked
```

## Best Practices

1. **Exhaust conventional approaches first** -- Dark Ops is for structural singularities, not ordinary problems. Verify that standard optimization, management, and technical interventions have been tried and failed.

2. **Start with detect, then map, then intervene** -- Follow the analytical progression. Do not skip to intervention without understanding the structural landscape.

3. **Use appropriate depth levels** -- Depth 7 (default) is sufficient for most analyses. Increase to 10-14 only for deeply entrenched structural issues. Higher depth requires more processing time.

4. **Read contraindicated actions carefully** -- Dark Ops explicitly identifies actions that will worsen the situation. These "do not do" lists are often more valuable than the recommendations.

5. **Review audit trails regularly** -- Historical Dark Ops analyses reveal patterns across incidents. Use `/dark-ops audit` to identify recurring structural themes.

6. **Ethical review is mandatory** -- Every intervention recommendation passes through ethical validation. Do not bypass ethical review even under time pressure.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `INSUFFICIENT_EVIDENCE` | Fewer than 3 independent signals | Gather more evidence before analysis |
| `DEPTH_EXCEEDED` | Analysis depth beyond system capacity | Reduce depth parameter; default (7) usually sufficient |
| `ETHICS_VIOLATION` | Intervention fails ethical review | Redesign intervention within ethical boundaries |
| `CONVERGENCE_TIMEOUT` | NABLA pipeline fails to converge | Reduce depth; simplify target domain; check input quality |
| `AUTHORITY_INSUFFICIENT` | Operator lacks SUPREME authority | Escalate to authorized operator |

## Advanced Usage

### Case Study: Architecture Migration Crisis

```bash
/dark-ops map "monolith-microservices-migration"
```

Output:

```
ATTRACTOR CLASS: :chaotic
VARIANCE: 0.92 (CRITICAL)
NABLA-INFINITY DETECTED: YES

TOPOLOGY ANALYSIS:
- Bidirectional dependencies: 47 (vs 0 target)
- Circular imports: 12 cycles detected
- Shared state: 8 global mutation points
- Service boundaries: UNDEFINED (0.23 cohesion score)

PARADOX MAP:
- "Cannot migrate without tests" <-> "Cannot test without migration"
- "Need new features" <-> "Cannot add features during migration"

INTERVENTION PRIORITY:
1. STRANGLER FIG pattern (isolate first, migrate second)
2. Dependency graph linearization
3. State extraction to dedicated service
4. Test infrastructure parallel build

CONTRAINDICATED ACTIONS:
- "Big bang migration" (amplifies chaos)
- "Feature freeze" (organization will route around it)
- "Add more architects" (increases coordination cost)
```

### Case Study: Organizational Conflict

```bash
/dark-ops detect "sales-engineering-conflict"
```

Output:

```
ATTRACTOR CLASS: :critical
VARIANCE: 0.87 (HIGH)
NABLA-INFINITY DETECTED: YES

STRUCTURAL FINDINGS:
- Incentive misalignment (sales: volume vs engineering: quality)
- Information asymmetry (customer expectations vs technical reality)
- Authority gap (decision maker lacks domain knowledge)

CONTRAINDICATED ACTIONS:
- "Improve communication" (increases noise without structure change)
- "Add more meetings" (amplifies existing dysfunction)
- "Hire mediator" (treats symptom, not structure)
```

### Audit Trail Record

```elixir
PrismaticAudit.record(%{
  operation: :dark_ops,
  type: analysis_type,
  target: target_domain,
  timestamp: DateTime.utc_now(),
  operator: operator_id,
  findings: structured_findings,
  recommendations: intervention_matrix,
  ethical_review: ethics_result
})
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for surface-level crisis analysis. When structural singularities are detected, they must be fully mapped and documented. No partial analyses. No intervention recommendations without consequence modeling.
- **NO DOUBTS**: Full evidence gathering before classification. Attractor class determination requires multiple independent signals. Contradiction graphs must be complete. NABLA axiom of contradiction preservation enforced -- both sides of every paradox preserved, never discarded.

Dark Ops directly implements the NABLA axiom of **Contradiction Preservation** -- contradictions are preserved and analyzed, never smoothed over or resolved prematurely.

## Related Commands

- [/emergency](/commands/emergency/) - Emergency response and crisis management activation
- [/archer-supreme](/commands/archer-supreme/) - Supreme authority activation for platform-wide operations
- [/analyze](/commands/analyze/) - System architecture analysis with dependency mapping
- [/investigate](/commands/investigate/) - Launch comprehensive [OSINT](/glossary/osint/) investigation across 121+ sources
- [/agents](/commands/agents/) - List and manage agent ecosystem with status monitoring

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)