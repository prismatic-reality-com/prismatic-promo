+++
title = "/green-beret"
weight = 660
[extra]
category = "Intelligence"
description = "Unconventional intelligence with adaptive investigation techniques"
syntax = "/green-beret [options]"
authority = "L3"
agent = "green-beret-operator"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1305
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["green-beret", "Unconventional", "commands", "Intelligence", "Prismatic Platform", "OSINT", "Investigation", "Intelligence Fusion"]
tags = ["commands", "intelligence", "green-beret", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/green-beret - Prismatic Platform"
+++

## Overview

**/green-beret** is a production command in the **Intelligence** category of the Prismatic Platform that provides unconventional intelligence gathering capabilities through adaptive investigation techniques, creative source combination, and non-standard analytical approaches. Named after the U.S. Army Special Forces known for unconventional warfare and foreign internal defense, this command specializes in intelligence problems that resist standard [OSINT](/glossary/osint/) methodologies and require creative, multi-vector investigation strategies.

This command operates under the **L3** authority level and is executed by the `green-beret-operator` agent, which is trained in adaptive intelligence tradecraft that goes beyond conventional open source intelligence patterns. While standard OSINT commands like [/investigate](/commands/investigate/) and [/google-hacking](/commands/google-hacking/) apply well-known techniques systematically, the green-beret operator adapts its approach in real-time based on what it discovers, pivoting between investigation vectors, cross-referencing unexpected data sources, and applying lateral thinking to connect seemingly unrelated intelligence fragments. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard.

The command fills a critical gap in the intelligence pipeline. Standard intelligence gathering follows predictable patterns: query known databases, apply established dork patterns, check breach databases, enumerate public records. These methods are effective for common targets but fail when subjects have minimal digital footprints, use sophisticated operational security, or when the intelligence objective requires connecting dots across disparate domains. The green-beret operator excels precisely in these challenging scenarios, applying unconventional approaches such as infrastructure correlation, behavioral pattern analysis, temporal activity mapping, and indirect attribution through associated entities.

The command's low usage frequency reflects its specialized nature. It is deployed selectively for high-value intelligence targets where standard methods have been exhausted or where the investigation requires a fundamentally different analytical approach. Each invocation represents a significant commitment of analytical resources and produces deep intelligence products rather than broad surface-level findings.

## Architecture

```
/green-beret Command
    |
    +-- Adaptive Strategy Engine
    |       +-- Investigation Planner
    |       +-- Technique Selector
    |       +-- Pivot Decision Engine
    |       +-- Success Evaluator
    |
    +-- Unconventional Source Manager
    |       +-- Infrastructure Correlator
    |       +-- Behavioral Analyzer
    |       +-- Temporal Pattern Mapper
    |       +-- Indirect Attribution Engine
    |       +-- Social Graph Walker
    |
    +-- Intelligence Fusion Center
    |       +-- Multi-Vector Correlator
    |       +-- Confidence Calculator
    |       +-- Contradiction Detector
    |       +-- Hypothesis Generator
    |
    +-- Adaptive Execution Engine
    |       +-- Real-time Pivot Controller
    |       +-- Dead End Detector
    |       +-- Resource Optimizer
    |       +-- Progress Tracker
    |
    +-- Report Generator
            +-- Finding Synthesizer
            +-- Attribution Chain Builder
            +-- Confidence Assessor
            +-- Recommendation Engine
```

The Adaptive Strategy Engine is the core differentiator. Unlike fixed-pipeline intelligence commands, it dynamically adjusts the investigation plan based on intermediate results. If infrastructure correlation reveals a shared hosting pattern, the engine automatically pivots to investigate other entities on the same infrastructure. If behavioral analysis identifies temporal activity patterns, the engine cross-references those patterns against known operational profiles. This adaptive capability mirrors how skilled human intelligence analysts work -- following leads as they emerge rather than executing a predetermined checklist.

## Usage

### Adaptive Investigations

```bash
# Launch adaptive investigation on a target
/green-beret --target=example.com --mode=adaptive

# Investigate with specific focus area
/green-beret --target=example.com --focus=infrastructure

# Deep investigation with maximum resource allocation
/green-beret --target=example.com --depth=deep --max-pivots=10

# Investigate a person/entity rather than a domain
/green-beret --entity="John Doe" --mode=entity-focused
```

### Unconventional Techniques

```bash
# Infrastructure correlation analysis
/green-beret --target=example.com --technique=infrastructure-correlation

# Behavioral pattern analysis
/green-beret --target=example.com --technique=behavioral-analysis

# Temporal activity mapping
/green-beret --target=example.com --technique=temporal-mapping

# Indirect attribution through associated entities
/green-beret --target=example.com --technique=indirect-attribution
```

### Intelligence Fusion

```bash
# Fuse results from multiple previous investigations
/green-beret --fuse --investigations=inv-001,inv-002,inv-003

# Cross-reference with existing intelligence database
/green-beret --target=example.com --cross-ref=internal

# Generate hypothesis from partial intelligence
/green-beret --hypothesis --evidence=findings.json
```

### Report Generation

```bash
# Generate comprehensive intelligence assessment
/green-beret --target=example.com --report=full

# Generate executive summary
/green-beret --target=example.com --report=executive

# Export in structured format for external analysis
/green-beret --target=example.com --format=json --output=assessment.json
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--target` | string | required | Target domain, entity, or identifier |
| `--entity` | string | none | Named entity for person/organization investigations |
| `--mode` | string | adaptive | Investigation mode (adaptive, infrastructure, behavioral, temporal, entity-focused) |
| `--focus` | string | broad | Focus area (infrastructure, people, technology, financial, legal) |
| `--depth` | string | standard | Investigation depth (surface, standard, deep) |
| `--max-pivots` | integer | 5 | Maximum number of adaptive pivots allowed |
| `--technique` | string | auto | Specific technique to apply |
| `--fuse` | flag | false | Enable intelligence fusion mode |
| `--investigations` | string | none | Comma-separated investigation IDs for fusion |
| `--cross-ref` | string | none | Cross-reference source (internal, external, all) |
| `--hypothesis` | flag | false | Enable hypothesis generation mode |
| `--report` | string | standard | Report type (standard, full, executive, technical) |
| `--format` | string | text | Output format (text, json, markdown, html) |
| `--output` | string | stdout | File path for report output |
| `--timeout` | integer | 300 | Maximum investigation time in seconds |

## Execution Flow

1. **Mission Briefing**: Analyze the target specification and investigation objective. Review any existing intelligence from previous investigations. Assess which unconventional techniques are most likely to produce results for this target type.

2. **Strategy Formation**: The Adaptive Strategy Engine develops an initial investigation plan, selecting starting techniques based on target characteristics. For domains, infrastructure correlation is typically prioritized. For entities, social graph analysis takes precedence.

3. **Initial Reconnaissance**: Execute the first wave of investigation techniques. Gather baseline data from standard sources to establish context before applying unconventional methods. Identify gaps in standard intelligence that unconventional techniques should address.

4. **Adaptive Pivoting**: Based on initial results, the Pivot Decision Engine determines the next investigation vector. If a technique produces valuable leads, the engine allocates more resources to follow them. If a technique reaches a dead end, the engine pivots to alternative approaches. Each pivot is logged for audit and reproducibility.

5. **Intelligence Fusion**: As findings accumulate from multiple techniques, the Intelligence Fusion Center correlates them, identifies patterns, detects contradictions (preserving them per NABLA axioms), and generates hypotheses about the target that no single technique could produce alone.

6. **Confidence Assessment**: Each finding is assigned a confidence score based on the number of corroborating sources, the reliability of the techniques used, and the strength of the attribution chain. Findings below the confidence threshold are flagged as tentative.

7. **Report Synthesis**: Generate a comprehensive intelligence assessment that includes findings, attribution chains, confidence scores, contradictions, and recommendations for further investigation. The report follows a structured format that integrates with the platform's intelligence pipeline.

8. **Integration**: Feed findings back into the platform's intelligence ecosystem, updating [Prismatic Perimeter](/apps/prismatic-perimeter/) attack surface data and contributing to the [/investigate](/commands/investigate/) evidence chain.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Agent Execution | Executed by `green-beret-operator` agent at L3 authority |
| [/investigate](/commands/investigate/) | Intelligence Pipeline | Provides unconventional supplements to standard investigations |
| [/google-hacking](/commands/google-hacking/) | Source Data | Leverages dorking results as starting points for deeper analysis |
| [/email-osint](/commands/email-osint/) | Cross-Reference | Correlates email intelligence with behavioral patterns |
| [Prismatic Perimeter](/apps/prismatic-perimeter/) | Attack Surface | Discoveries feed into external attack surface assessments |
| [/intel-export](/commands/intel-export/) | Export Pipeline | Assessment packaged for external LLM or human analysis |
| [Telemetry](/glossary/telemetry/) | Metrics | Investigation duration, pivot count, finding quality tracked |
| NABLA Framework | Epistemics | Contradiction preservation and signal plurality enforced |

## Best Practices

**Exhaust Standard Methods First**: Deploy `/green-beret` only after standard OSINT commands (`/investigate`, `/google-hacking`, `/email-osint`) have been exhausted. The green-beret operator is resource-intensive and most valuable when applied to problems that resist conventional approaches.

**Define Clear Objectives**: Provide specific investigation objectives rather than broad targets. "Identify the infrastructure connections between example.com and known threat actors" is more actionable than "investigate example.com."

**Limit Pivots Appropriately**: Set `--max-pivots` based on the investigation scope. Too few pivots may miss important leads; too many pivots can lead to scope creep and diminishing returns. Start with the default of 5 and adjust based on result quality.

**Preserve Contradictions**: The green-beret operator explicitly preserves contradictory findings per the NABLA Addiction Preservation doctrine. Do not dismiss contradictions -- they often indicate complexity in the target environment that warrants further investigation.

**Time Boxing**: Use `--timeout` to prevent investigations from consuming excessive resources. Deep investigations can be run in multiple time-boxed sessions, with intelligence fusion (`--fuse`) combining results across sessions.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `Target not specified` | Missing target parameter | Provide `--target` or `--entity` parameter |
| `L3 authority required` | Insufficient permission level | Escalate command authority or use a lower-authority command |
| `Max pivots exhausted` | Investigation reached pivot limit | Increase `--max-pivots` or run a focused follow-up investigation |
| `Investigation timeout` | Exceeded time limit | Increase `--timeout` or run focused sub-investigations |
| `Fusion data unavailable` | Referenced investigation not found | Verify investigation IDs with `/investigate --list` |
| `Dead end detected` | All techniques exhausted without findings | Review target specification; consider alternative target vectors |

## Advanced Usage

### Multi-Session Deep Investigation

```bash
# Session 1: Infrastructure focus
/green-beret --target=example.com --focus=infrastructure --output=session-1.json

# Session 2: Behavioral focus, fusing with session 1
/green-beret --target=example.com --focus=behavioral --fuse --evidence=session-1.json --output=session-2.json

# Session 3: Full synthesis
/green-beret --fuse --evidence=session-1.json,session-2.json --report=full
```

### Hypothesis-Driven Investigation

```bash
# Generate hypotheses from existing evidence
/green-beret --hypothesis --evidence=partial-findings.json

# Test a specific hypothesis
/green-beret --target=example.com --test-hypothesis="Target infrastructure shared with known APT group"
```

### Integration with Color-Team Operations

The green-beret operator can provide intelligence products to the platform's color-team security operations, feeding findings into Red Team adversarial scenarios or Blue Team defensive assessments.

## Doctrine Compliance

All green-beret operations enforce the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine.

- **NO MERCY**: Every investigation technique is executed completely before pivoting. Dead ends are confirmed through multiple verification attempts. The operator does not abandon leads prematurely.
- **NO DOUBTS**: All findings include attribution chains with full provenance. Confidence scores are evidence-based, not estimated. Contradictions are preserved and reported per the NABLA Addiction Preservation doctrine. The operator explicitly states uncertainty when it exists rather than presenting unverified hypotheses as conclusions.

The command additionally enforces the NABLA axioms of Signal Plurality (minimum 2 independent signals for any finding), Contradiction Preservation (both sides of contradictory evidence preserved), and Provenance Mandatory (all findings traceable to source techniques and data).

## Related Commands

- [/investigate](/commands/investigate/) - Launch comprehensive [OSINT](/glossary/osint/) investigation across 121+ sources
- [/email-osint](/commands/email-osint/) - Email-based OSINT gathering with breach correlation and social profiling
- [/google-hacking](/commands/google-hacking/) - Google dorking and advanced search intelligence extraction
- [/intel-export](/commands/intel-export/) - Generate comprehensive intelligence packages for external analysis
- [/osint-engines](/commands/osint-engines/) - Multi-engine OSINT source coordination and parallel querying
- [/agents](/commands/agents/) - List and manage agent ecosystem with status monitoring
- [/commit](/commands/commit/) - Smart commit with quality gates and conventional format

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)