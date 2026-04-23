+++
title = "/trinity"
weight = 1740
[extra]
category = "Formal Verification"
description = "Trinity system status and rigidity score verification"
syntax = "/trinity [options]"
authority = "L2+"
agent = "trinity-specialist"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1054
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["trinity", "commands", "Formal Verification", "Prismatic Platform", "Gate", "Show", "Steel", "Diamond"]
tags = ["commands", "formal-verification", "trinity", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/trinity - Prismatic Platform"
+++

## Overview

**/trinity** is a production command in the **[Formal Verification](/glossary/formal-verification/)** category of the Prismatic Platform. It displays the current status of the Trinity Gate verification system, reports rigidity scores across all verified entities, and provides health metrics for the three-layer verification infrastructure. The Trinity Gate is the platform's foundational epistemic barrier: no claim, belief, or system property is considered established without passing all three gates (Structural Consistency, Logical Consistency, Formal Necessity). `/trinity` provides visibility into this critical infrastructure.

This command operates under the **L2+** authority level and is executed by the `trinity-specialist` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The L2+ authority level enables any qualified operator to inspect the Trinity system's health without requiring the elevated L3 authority needed for active verification operations.

The platform currently maintains 629 Trinity-verified entities across agents, commands, policies, and system properties. Each entity has a rigidity score reflecting the strength of its verification: entities verified through all three gates with formal Lean4 proofs have the highest rigidity, while entities with only structural verification have lower rigidity. `/trinity` provides the dashboard for monitoring this verification estate, identifying entities with declining rigidity, and tracking the overall epistemic health of the platform.

## Architecture

The Trinity status system reads from the Trinity verification registry and presents comprehensive health metrics.

### Trinity Status Architecture

```
             /trinity
                 |
          Status Renderer
                 |
          +------+------+------+
          |      |      |      |
       Gate    Entity  Rigidity Health
       Status  Registry Scorer  Monitor
          |      |      |      |
    +-----+-+ +--+--+ +-+--+ +--+--+
    |   |   | |  |  | |  | | |  |  |
   G1  G2  G3 Agent Cmd Prop Avg  Trend
   Stat Stat Stat List List List Score Track
    |   |   | |  |  | |  | | |  |  |
    +---+---+-+--+--+-+--+-+-+--+--+
                 |
          Trinity Dashboard
```

### Trinity Gate Layers

| Gate | Name | Verification Method | Tool | Rigidity Weight |
|------|------|-------------------|------|-----------------|
| **Gate 1** | Structural Consistency | Belief network DAG validation | Graph theory | 0.25 |
| **Gate 2** | Logical Consistency | Rule-based proposition checking | Prolog | 0.35 |
| **Gate 3** | Formal Necessity | Modal logic + formal proofs | Lean4 | 0.40 |

### Rigidity Score Scale

| Score Range | Classification | Meaning |
|-------------|---------------|---------|
| **0.95 - 1.00** | Diamond | Formally proven with Lean4; maximum rigidity |
| **0.85 - 0.94** | Steel | All three gates passed; high confidence |
| **0.70 - 0.84** | Iron | Gates 1 + 2 passed; formal proof pending |
| **0.50 - 0.69** | Bronze | Gate 1 passed; logic and formal pending |
| **0.00 - 0.49** | Clay | Unverified or partially verified |

### Entity Categories

| Category | Count | Typical Rigidity | Verification Scope |
|----------|-------|-----------------|-------------------|
| **Agents** | 404 | Steel-Diamond | Behavioral contracts, capability claims |
| **Commands** | 216 | Iron-Steel | Input/output contracts, authority claims |
| **Policies** | 50+ | Steel-Diamond | Enforcement rules, violation definitions |
| **Properties** | 100+ | Variable | System invariants, performance claims |

## Usage

```bash
# Show Trinity system overview
/trinity

# Show detailed gate status
/trinity status --verbose

# Show rigidity scores for all entities
/trinity rigidity

# Show rigidity for specific category
/trinity rigidity --category agents

# Show entities below rigidity threshold
/trinity rigidity --below 0.80

# Show Trinity health metrics
/trinity health

# Show rigidity trends over time
/trinity trends --since 30d

# Export Trinity status report
/trinity --format json --export ./trinity-status.json

# Show specific entity verification details
/trinity entity "PrismaticPerimeter.SecurityRating"

# Show gate pass/fail statistics
/trinity gates --stats
```

### Practical Examples

```bash
# Pre-release Trinity verification dashboard
/trinity rigidity --below 0.85 --format markdown --export ./pre-release-trinity.md

# Check if specific critical entity is fully verified
/trinity entity "PrismaticPerimeter.discover/1" --verbose

# Monitor Trinity health after system changes
/trinity health --compare-baseline

# Identify entities needing verification attention
/trinity rigidity --category commands --below 0.70 --verbose

# Generate compliance report showing verification coverage
/trinity --format json --export ./compliance/trinity-report.json
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `status` | `subcommand` | default | Show overall Trinity system status |
| `rigidity` | `subcommand` | -- | Show rigidity scores |
| `health` | `subcommand` | -- | Show health metrics |
| `trends` | `subcommand` | -- | Show rigidity trends |
| `entity` | `subcommand` | -- | Show specific entity details |
| `gates` | `subcommand` | -- | Show gate-level statistics |
| `--verbose` | `flag` | false | Detailed output with per-entity breakdown |
| `--category` | `enum` | all | Filter by: `agents`, `commands`, `policies`, `properties`, `all` |
| `--below` | `float` | none | Show only entities below rigidity threshold |
| `--above` | `float` | none | Show only entities above rigidity threshold |
| `--format` | `enum` | `text` | Output format: `text`, `json`, `markdown` |
| `--export` | `path` | none | Export report to file |
| `--since` | `duration` | all | Time filter for trends |
| `--compare-baseline` | `flag` | false | Compare against saved baseline |

## Execution Flow

### Phase 1: Registry Load

The Trinity verification registry is loaded from the platform's verification store. This registry contains every verified entity with its gate pass/fail status, rigidity score, verification timestamps, and proof references.

### Phase 2: Gate Status Assessment

Each of the three gates is assessed for overall health: number of entities passing, failure rate, last verification run time, and any degradation since the previous assessment. Gate health reflects the verification infrastructure's operational status.

### Phase 3: Rigidity Computation

For each entity, the rigidity score is computed from gate results weighted by gate importance (Gate 3 = 0.40, Gate 2 = 0.35, Gate 1 = 0.25). Entities are classified into rigidity tiers (Diamond, Steel, Iron, Bronze, Clay). Aggregate statistics are computed per category.

### Phase 4: Trend Analysis

When historical data is available, rigidity trends are computed: improving entities (rigidity increasing over time), declining entities (rigidity decreasing), and stable entities. Declining rigidity triggers alerts because it indicates verification erosion -- typically caused by code changes that invalidate previous proofs.

### Phase 5: Dashboard Rendering

All metrics are assembled into the requested output format. The dashboard shows: system overview (total entities, average rigidity, gate health), category breakdowns, entities below threshold, trend indicators, and recommendations for verification improvements.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/trinity-3nl-fusion](/commands/trinity-3nl-fusion/) | Active verification | Fusion pipeline for claim verification |
| [/lean](/commands/lean/) | Engine | Lean4 backend for Gate 3 proofs |
| [/prolog](/commands/prolog/) | Engine | Prolog backend for Gate 2 logic |
| [/formal-verify](/commands/formal-verify/) | Peer | General formal verification operations |
| [/nabla-status](/commands/nabla-status/) | Consumer | Trinity health feeds NABLA epistemic status |
| [/white-verify](/commands/white-verify/) | Peer | White team verification uses Trinity infrastructure |
| [NABLA Infinity](/glossary/nabla-infinity/) | Framework | Epistemic framework requiring Trinity passage |
| [Telemetry](/glossary/telemetry/) | Monitoring | Verification performance metrics |

## Best Practices

### Regular Status Monitoring

Run `/trinity` at session start to verify the verification infrastructure itself is healthy. Trinity Gate failures can cascade: if Gate 3 (Lean4) is offline, new formal proofs cannot be generated, and entities will gradually lose Diamond/Steel rigidity as code changes invalidate previous proofs.

### Rigidity Floor Enforcement

Maintain a minimum rigidity threshold per category. Critical categories (security policies, authentication contracts) should maintain Diamond or Steel rigidity. Use `/trinity rigidity --below 0.85 --category policies` to identify entities needing attention.

### Pre-Release Verification

Before every release, run `/trinity rigidity --below 0.80` to identify all entities below the Iron tier. Low-rigidity entities should be either re-verified or explicitly acknowledged as acceptable risks in the release notes.

### Trend-Driven Verification

Use `/trinity trends` to identify entities with declining rigidity. Proactive re-verification of declining entities prevents verification debt accumulation, which is analogous to technical debt but in the epistemic domain.

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `REGISTRY_UNAVAILABLE` | Cannot load verification registry | Check verification store accessibility |
| `GATE_OFFLINE` | One or more gates are not operational | Verify Lean4/Prolog infrastructure |
| `STALE_VERIFICATION` | Entity verification older than threshold | Re-verify with `/trinity-3nl-fusion` |
| `RIGIDITY_COMPUTATION_ERROR` | Cannot compute rigidity for entity | Check entity has at least one gate result |
| `TREND_DATA_INSUFFICIENT` | Not enough historical data for trends | Requires at least 2 data points |
| `BASELINE_MISSING` | No baseline for comparison | Run without `--compare-baseline` |

## Advanced Usage

### Custom Rigidity Weights

Override default gate weights for domain-specific assessment:

```bash
/trinity rigidity --weights "gate1:0.10,gate2:0.30,gate3:0.60" --category security
```

### Verification Gap Analysis

Identify entities with no verification at all:

```bash
/trinity gaps --verbose --format markdown --export ./verification-gaps.md
```

### Cross-Category Rigidity Comparison

Compare rigidity distributions across categories:

```bash
/trinity compare --categories "agents,commands,policies" --format json
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Trinity status reporting is exhaustive; no entity is omitted, no declining rigidity is hidden.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every rigidity score is traceable to specific gate results. No scores are estimated or interpolated.

## Related Commands

- [/trinity-3nl-fusion](/commands/trinity-3nl-fusion/) - Validate input through Trinity-3NL fusion pipeline
- [/lean](/commands/lean/) - Execute Lean 4 code or prove a theorem with the lean-specialist agent
- [/prolog](/commands/prolog/) - Prolog-based logical reasoning and [inference](/glossary/inference/) operations
- [/formal-verify](/commands/formal-verify/) - Formal verification of system properties and invariants
- [/nabla-status](/commands/nabla-status/) - NABLA Infinity epistemic framework health and status
- [/white-verify](/commands/white-verify/) - White team constructive verification and formal proofs
- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation validation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)