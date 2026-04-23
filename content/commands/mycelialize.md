+++
title = "/mycelialize"
weight = 420
[extra]
category = "Evolution"
description = "Biological-inspired pattern propagation at 500K patterns/sec with emergence detection"
syntax = "/mycelialize [options]"
authority = "Strategic Operational"
agent = "mycelial-network-coordinator"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1144
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["mycelialize", "Biological-inspired", "500K", "commands", "Evolution", "Prismatic Platform", "Phase", "Propagation"]
tags = ["commands", "evolution", "mycelialize", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/mycelialize - Prismatic Platform"
+++

## Overview

**/mycelialize** is a production command in the **Evolution** category of the Prismatic Platform. It implements biological-inspired pattern propagation through a simulated [mycelial network](/glossary/mycelial-network/), achieving throughput of 500,000 patterns per second while detecting emergent behaviors that arise from pattern interactions. The mycelial metaphor is not merely decorative: the system models pattern relationships as a network topology analogous to fungal mycelium, where knowledge nutrients flow along established pathways and new connections form dynamically in response to environmental signals.

This command operates under the **Strategic Operational** authority level and is executed by the `mycelial-network-coordinator` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The Strategic Operational authority reflects the command's role as a production workhorse: it processes high volumes of patterns but operates within well-defined safety boundaries.

The mycelial propagation system serves as the foundation for the platform's knowledge distribution infrastructure. When a quality pattern is discovered in one area of the codebase, `/mycelialize` propagates it to all applicable locations, transforming local improvements into platform-wide enhancements. The emergence detection subsystem monitors for unexpected positive interactions between patterns, flagging them for human review and potential promotion to first-class patterns.

## Architecture

The mycelial network is implemented as a directed graph where nodes represent pattern application sites and edges represent propagation pathways. The architecture prioritizes throughput and low-latency propagation.

### Network Topology

```
             Source Patterns
                  |
          Pattern Classifier
                  |
         +--------+--------+
         |        |        |
      Fast Path  Standard  Deep
      (cached)    Path    Analysis
         |        |        |
         +--------+--------+
                  |
          Propagation Engine
         /    |    |    \
       N1    N2   N3   N4  ... (Network Nodes)
        \    |    |    /
         Emergence Detector
                  |
          Result Aggregator
```

### Core Components

| Component | Responsibility | Performance |
|-----------|---------------|-------------|
| **Pattern Classifier** | Routes patterns to appropriate processing paths | < 1ms per classification |
| **Fast Path Cache** | ETS-backed cache for previously propagated patterns | < 0.1ms lookup |
| **Propagation Engine** | Core pattern distribution across network nodes | 500K patterns/sec sustained |
| **Network Node** | Individual pattern application site | Concurrent OTP process |
| **Emergence Detector** | Monitors for unexpected pattern interactions | Real-time streaming analysis |
| **Result Aggregator** | Collects propagation results and statistics | Batched aggregation every 100ms |

### Propagation Algorithms

The system implements three propagation strategies, selected automatically based on pattern characteristics:

1. **Flood Propagation** -- For universal patterns applicable everywhere. Simple, fast, broadcast-style.
2. **Gradient Propagation** -- For patterns with locality preferences. Propagates outward from the discovery site with decreasing priority.
3. **Targeted Propagation** -- For patterns with specific applicability criteria. Uses the pattern classifier to identify valid targets before propagation.

## Usage

```bash
# Standard mycelial propagation
/mycelialize

# Propagate patterns in a specific domain
/mycelialize --domain quality

# Propagate a specific pattern
/mycelialize --pattern cascade_type_mismatch

# Run with emergence detection enabled
/mycelialize --detect-emergence

# High-throughput mode (batch processing)
/mycelialize --batch --batch-size 10000

# Dry run showing propagation plan
/mycelialize --dry-run

# Propagate with detailed statistics
/mycelialize --stats

# Limit propagation depth (hops from source)
/mycelialize --max-depth 5

# Propagate only to specific apps
/mycelialize --target-apps prismatic_web,prismatic_api
```

### Practical Examples

```bash
# Propagate all quality patterns across the entire platform
/mycelialize --domain quality --detect-emergence --stats

# Quick propagation of a single high-priority pattern
/mycelialize --pattern unsafe_map_access --strategy targeted

# Batch propagation of GARDEN-extracted patterns
/mycelialize --source garden --batch --batch-size 5000 --stats

# Preview what would change without executing
/mycelialize --domain performance --dry-run --verbose
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--domain` | `string` | all | Quality domain scope |
| `--pattern` | `string` | `*` | Specific pattern name or glob |
| `--strategy` | `enum` | `auto` | Propagation strategy: `flood`, `gradient`, `targeted`, `auto` |
| `--detect-emergence` | `flag` | false | Enable emergence detection subsystem |
| `--batch` | `flag` | false | Enable batch processing mode |
| `--batch-size` | `integer` | 1000 | Patterns per batch in batch mode |
| `--max-depth` | `integer` | unlimited | Maximum propagation depth (hops) |
| `--target-apps` | `string` | all | Comma-separated list of target applications |
| `--source` | `enum` | `registry` | Pattern source: `registry`, `garden`, `scan`, `file` |
| `--dry-run` | `flag` | false | Show plan without executing |
| `--stats` | `flag` | false | Display detailed propagation statistics |
| `--verbose` | `flag` | false | Verbose output with per-node results |
| `--parallel` | `integer` | system | Number of parallel propagation workers |
| `--throttle` | `integer` | 0 | Maximum patterns per second (0 = unlimited) |
| `--rollback-on-failure` | `flag` | true | Rollback all changes if any propagation fails |

## Execution Flow

### Phase 1: Pattern Collection

The command collects patterns from the specified source. The default source is the mycelial network registry, which contains all known patterns indexed by domain, type, and applicability criteria. Alternative sources include [GARDEN](/glossary/garden/) repositories, ad-hoc scans, or direct file input.

### Phase 2: Classification and Routing

Each pattern is classified based on its structure, scope, and applicability:

| Classification | Strategy | Typical Throughput |
|---------------|----------|-------------------|
| Universal | Flood | 500K/sec |
| Domain-scoped | Gradient | 350K/sec |
| Site-specific | Targeted | 200K/sec |
| Complex/Multi-step | Sequential | 50K/sec |

### Phase 3: Network Preparation

The propagation engine prepares the network by identifying active nodes, checking connectivity, and pre-allocating message buffers. Nodes that are temporarily unavailable are marked and excluded from the current propagation cycle.

### Phase 4: Propagation Execution

Patterns flow through the network according to their assigned strategy. Each node receives patterns, applies them to its local context, and reports results back to the aggregator. The propagation engine monitors throughput and backpressure, dynamically adjusting parallelism to maintain optimal performance.

### Phase 5: Emergence Detection

When enabled, the emergence detector analyzes propagation results for unexpected interactions:

- **Synergistic Emergence** -- Two patterns together produce better results than either alone
- **Conflicting Emergence** -- Two patterns produce contradictory effects at the same site
- **Cascade Emergence** -- A pattern triggers a chain reaction of secondary propagations
- **Null Emergence** -- A pattern has no effect despite matching applicability criteria

### Phase 6: Result Aggregation and Reporting

Final statistics are aggregated: patterns propagated, sites affected, emergence events detected, failures encountered. Results are written to the [telemetry](/glossary/telemetry/) system and optionally displayed to the user.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/mycelialize-formal](/commands/mycelialize-formal/) | Verification | Formally verifies critical patterns before propagation |
| [/mycelialize-living](/commands/mycelialize-living/) | Evolution | Supplies evolved pattern variants for propagation |
| [/scan-mycelium](/commands/scan-mycelium/) | Discovery | Scans for new patterns to add to the network |
| [/evolve](/commands/evolve/) | Framework | Part of the broader ecosystem evolution cycle |
| [/propagate-pattern](/commands/propagate-pattern/) | Downstream | Low-level pattern propagation primitive |
| [Quality Gates](/glossary/quality-gates/) | Enforcement | Propagated patterns must pass quality gates |
| [Telemetry](/glossary/telemetry/) | Monitoring | Throughput, latency, emergence events |
| [ETS](/glossary/ets/) | Cache | Fast-path pattern cache |

## Best Practices

### Throughput Optimization

The 500K patterns/sec throughput assumes warmed caches and a healthy network topology. For initial propagation runs on a cold system, expect 100-200K/sec as caches warm up. Use `--batch` mode for large-scale propagation campaigns to minimize per-pattern overhead.

### Emergence Detection Overhead

The emergence detection subsystem adds approximately 15-20% overhead to propagation throughput. Enable it selectively: during initial platform-wide propagation campaigns or when introducing new pattern families. For routine incremental propagation, the overhead is rarely justified.

### Rollback Safety

The default `--rollback-on-failure` ensures atomicity: either all patterns propagate successfully or none do. For very large propagation campaigns, consider disabling rollback and using `--batch` mode with smaller batch sizes to limit the blast radius of individual failures.

### Gradual Propagation

When introducing patterns that affect critical code paths, use `--target-apps` to propagate incrementally, starting with low-risk applications and expanding scope after validation.

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `NETWORK_PARTITION` | Network topology has disconnected components | Check node health; reconnect failed nodes |
| `BACKPRESSURE_EXCEEDED` | Propagation rate exceeds node processing capacity | Reduce `--parallel` or enable `--throttle` |
| `PATTERN_CONFLICT` | Conflicting patterns at same application site | Review patterns for compatibility; use conflict resolution |
| `ROLLBACK_TRIGGERED` | Propagation failure triggered automatic rollback | Investigate failed pattern; fix and retry |
| `CACHE_OVERFLOW` | ETS cache exceeded allocated memory | Increase cache size or reduce pattern cardinality |
| `EMERGENCE_ANOMALY` | Detected potentially harmful emergence event | Review emergence report; quarantine affected patterns |

## Advanced Usage

### Custom Propagation Strategies

Implement the `PropagationStrategy` behaviour for domain-specific routing:

```elixir
defmodule MyStrategy do
  @behaviour PrismaticMycelial.PropagationStrategy

  def select_targets(pattern, network) do
    network
    |> filter_by_domain(pattern.domain)
    |> sort_by_priority()
    |> Enum.take(100)
  end
end
```

### Network Visualization

Export the network topology for visualization:

```bash
/mycelialize --export-topology ./network.dot
dot -Tpng network.dot -o network.png
```

### Scheduled Propagation

Integrate with the platform scheduler for automated periodic propagation:

```bash
/mycelialize --schedule "0 */6 * * *" --domain quality --detect-emergence
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Failed propagations are rolled back, not silently ignored.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Propagation decisions are based on pattern classification and applicability analysis.

## Related Commands

- [/mycelialize-formal](/commands/mycelialize-formal/) - [Lean4](/glossary/lean4/) + Prolog [formal verification](/glossary/formal-verification/) for mathematically proven pattern propagation
- [/mycelialize-living](/commands/mycelialize-living/) - Living self-evolving intelligence with introspection, AST manipulation and agent swarms
- [/evolve](/commands/evolve/) - Living AIAD ecosystem evolution with 5-phase cycle and GitLab [observability](/glossary/observability/)
- [/scan-mycelium](/commands/scan-mycelium/) - Mycelial pattern scanning across documentation and code
- [/swarm-evolve](/commands/swarm-evolve/) - Multi-agent swarm coordination for intelligent autonomous platform evolution
- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](/commands/quality-enforce/) - Mandatory progressive [quality debt](/glossary/quality-debt/) elimination with AIAD enforcement
- [/regression-check](/commands/regression-check/) - Execute 25 custom [Credo](/glossary/credo/) regression checks preventing 700+ violations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)