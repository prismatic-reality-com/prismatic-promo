+++
title = "pattern-quality-analyst"
weight = 291
[extra]
domain = "quality-analysis"
level = "L3"
description = "Comprehensive quality analysis for mycelial patterns including confidence scoring, consistency validation, impact assessment, and quality gate enforcement"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["qdp", "cascade", "no-mercy", "no-doubts", "trinity-gate", "aiad", "property-based-testing", "telemetry", "seadf", "mycelial-network"]
domain_normalized = "quality"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2100
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["pattern-quality-analyst", "Comprehensive", "agents", "agent", "Prismatic Platform", "Quality", "Hard", "Pattern", "Behavioral"]
tags = ["agents", "agent", "pattern-quality-analyst", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "pattern-quality-analyst - Prismatic Platform"
+++

## Overview

The Pattern Quality Analyst operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform's quality-analysis domain, providing comprehensive quality assessment for patterns that flow through the platform's [mycelial network](@/glossary/mycelial-network.md). Every pattern in the platform -- whether a code quality fix, an architectural decision, a performance optimization, or an intelligence correlation rule -- must be evaluated for quality before it is propagated, stored, or acted upon. This agent serves as the central quality gatekeeper for the platform's pattern ecosystem.

The analyst applies a multi-dimensional quality framework that evaluates patterns across [confidence scoring](@/glossary/confidence-scoring.md), structural consistency, empirical impact assessment, and contextual appropriateness. Built on the [AIAD](@/glossary/aiad.md) standard and governed by the [NO DOUBTS](@/glossary/no-doubts.md) principle, the agent ensures that quality assessments are themselves evidence-based rather than heuristic, producing quantified quality scores backed by traceable evaluation criteria. The [Trinity Gate](@/glossary/trinity-gate.md) validation framework provides the formal backbone for quality gate enforcement.

## Theoretical Foundations

Pattern quality in a self-evolving system requires a formal definition that goes beyond simple correctness. The agent's quality model decomposes pattern quality into five orthogonal dimensions: structural validity (the pattern is well-formed according to its type schema), behavioral correctness (the pattern produces expected outcomes when applied), compositional safety (the pattern does not create harmful interactions when combined with other patterns), temporal stability (the pattern's quality properties are maintained over time), and contextual fitness (the pattern is appropriate for its intended application domain).

Each dimension is evaluated using quantified metrics that produce scores on a normalized scale. The aggregate quality score is computed as a weighted combination of dimensional scores, with weights that vary by pattern type and application context. Critical infrastructure patterns, for example, weight behavioral correctness and compositional safety more heavily than contextual fitness, while intelligence correlation patterns weight temporal stability and contextual fitness more highly.

The formal quality model is grounded in [NABLA Infinity](@/glossary/nabla-infinity.md) axioms. The signal plurality axiom requires that quality assessments draw on multiple independent evaluation signals rather than relying on a single metric. The contradiction preservation axiom ensures that conflicting quality indicators are preserved and flagged rather than averaged into a misleading composite score.

## Operational Domain

The quality-analysis domain spans all pattern types within the Prismatic Platform, making it one of the broadest operational domains in the agent ecosystem. Pattern types evaluated include code quality patterns (identified by the [pattern-matching-auditor](@/agents/pattern-matching-auditor.md) and related quality agents), architectural patterns (structural decisions about module organization, process topology, and data flow), performance patterns (optimization strategies and resource utilization approaches), intelligence patterns (OSINT correlation rules, entity resolution heuristics, and confidence scoring models), and evolutionary patterns (genetic programming outcomes from the [SEADF](@/glossary/seadf.md) framework).

The agent maintains a quality history database that tracks the evolution of pattern quality over time, supporting trend analysis that detects gradual quality degradation before it reaches critical thresholds. Quality history data also supports the identification of patterns that improve with evolutionary refinement versus those that plateau or degrade.

## Key Capabilities

- **Multi-dimensional confidence scoring** -- Evaluates patterns across five quality dimensions (structural validity, behavioral correctness, compositional safety, temporal stability, contextual fitness) producing quantified scores with confidence intervals rather than point estimates

- **Consistency validation** -- Verifies that patterns are internally consistent and externally compatible with the platform's architectural constraints, detecting logical contradictions, circular dependencies, and assumption conflicts

- **Empirical impact assessment** -- Measures the actual impact of applied patterns by comparing pre-application and post-application metrics, distinguishing genuine improvements from noise and ensuring that claimed benefits are statistically significant

- **Quality gate enforcement** -- Implements configurable quality gates that patterns must pass before propagation or production deployment, with gate thresholds that vary by pattern criticality and application context

- **Temporal quality tracking** -- Monitors pattern quality over time, detecting degradation trends and triggering re-evaluation or deprecation of patterns whose quality falls below maintenance thresholds

- **[Property-based testing](@/glossary/property-based-testing.md) integration** -- Generates property-based test suites for behavioral correctness evaluation, testing patterns against randomized inputs to discover edge-case quality issues

- **[Telemetry integration](@/capabilities/telemetry-integration.md)** publishing quality assessment results for dashboard visualization and trend monitoring

## Authority Level

**L3** - Strategic Command - Multi-domain coordination with authority to evaluate pattern quality across all platform domains and enforce quality gates that block low-quality patterns from propagation or deployment.

## Quality Assessment Pipeline

The quality assessment pipeline processes patterns through a structured sequence of evaluation stages:

1. **Schema Validation** -- The pattern is verified against its type schema for structural well-formedness
2. **Static Analysis** -- Pattern properties are analyzed without execution to identify potential issues
3. **Behavioral Testing** -- The pattern is tested against known input scenarios and property-based test suites
4. **Composition Analysis** -- The pattern is evaluated for interactions with existing patterns in target contexts
5. **Impact Projection** -- Historical data from similar patterns is used to project expected impact
6. **Confidence Computation** -- All evaluation signals are combined into dimensional and aggregate quality scores
7. **Gate Decision** -- Quality scores are compared against applicable gate thresholds to produce pass/fail decisions

Each pipeline stage produces structured output that feeds into subsequent stages, creating a comprehensive quality dossier for every evaluated pattern. Pipeline execution is instrumented with [telemetry](@/glossary/telemetry.md) events for performance monitoring and diagnostic analysis.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/pattern-quality assess` | Evaluate quality of a specified pattern | L3+ |
| `/pattern-quality gates` | Display current quality gate configurations | L2+ |
| `/pattern-quality trends` | Show quality trend analysis for pattern categories | L3+ |
| `/pattern-quality report` | Generate comprehensive quality assessment report | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [pattern-matching-auditor](@/agents/pattern-matching-auditor.md) | Provides patterns for quality evaluation from code auditing |
| [pattern-propagator-specialist](@/agents/pattern-propagator-specialist.md) | Quality scores determine propagation eligibility and priority |
| [code-quality-commander](@/agents/code-quality-commander.md) | Quality assessment results feed into platform quality score |
| [Mycelial Genetic Evolver Agent](@/agents/mycelial-genetic-evolver-agent.md) | Quality fitness metrics drive evolutionary selection pressure |

## Quality Gate Configuration

Quality gates are configurable by pattern type and criticality level:

| Pattern Type | Minimum Score | Critical Dimensions | Gate Mode |
|-------------|---------------|---------------------|-----------|
| **Infrastructure** | 90/100 | Behavioral, Compositional | Hard block |
| **Security** | 95/100 | All dimensions | Hard block |
| **Performance** | 80/100 | Behavioral, Temporal | Soft warning |
| **Intelligence** | 85/100 | Consistency, Contextual | Hard block |
| **Code Quality** | 75/100 | Structural, Behavioral | Soft warning |

Hard block gates prevent pattern progression until the quality score meets the threshold. Soft warning gates allow progression with quality advisories attached to the pattern's metadata.

## Enforcement

Quality analysis enforcement follows the [NO MERCY](@/glossary/no-mercy.md) doctrine: patterns that fail quality gates are not propagated, deployed, or acted upon regardless of urgency. The [NO DOUBTS](@/glossary/no-doubts.md) principle governs the assessment process itself, requiring that all quality scores are backed by traceable evaluation evidence and that assessment methodology is auditable. Quality gate decisions pass through [Trinity Gate](@/glossary/trinity-gate.md) validation to ensure structural, logical, and formal consistency.

## Related Agents

Agents in the **quality-analysis** domain collaborate with pattern management agents and domain-specific quality agents to maintain the platform's comprehensive quality assurance infrastructure, ensuring that the self-evolving pattern ecosystem maintains consistently high quality standards.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)