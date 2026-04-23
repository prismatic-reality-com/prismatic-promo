+++
title = "/presales-assess"
weight = 1880
[extra]
category = "Presales"
description = "Technical assessment of opportunities and cases"
syntax = "/presales-assess [options]"
authority = "L2+"
agent = "technical-assessor"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1169
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["presales-assess", "Technical", "commands", "Presales", "Prismatic Platform", "Assessment", "Phase"]
tags = ["commands", "presales", "presales-assess", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/presales-assess - Prismatic Platform"
+++

## Overview

**/presales-assess** is a production command in the **Presales** category of the Prismatic Platform that performs comprehensive technical assessment of presales opportunities and cases. The command evaluates the technical feasibility, architecture alignment, implementation complexity, and risk profile of a prospect's requirements against the Prismatic Platform's capabilities, producing a structured assessment that informs go/no-go decisions, resource planning, and proposal scoping.

The technical assessment engine operates by mapping prospect requirements to platform capabilities, identifying gaps that would require custom development, estimating implementation effort based on complexity analysis, and evaluating technical risks that could impact delivery timelines or solution quality. The assessment considers the full spectrum of technical factors: infrastructure requirements, integration complexity, data migration challenges, performance constraints, security requirements, and compliance obligations.

This command operates under the **L2+** authority level and is executed by the `technical-assessor` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The technical assessor agent has deep knowledge of the platform's architecture, capabilities, and limitations, enabling accurate feasibility analysis without requiring manual engineering review for initial assessments.

Within the presales workflow, `/presales-assess` typically follows [/presales-analyze](@/commands/presales-analyze.md), which extracts requirements from source documents, and precedes [/presales-price](@/commands/presales-price.md), which uses the technical assessment to estimate implementation costs. The assessment output serves as the technical foundation for the entire proposal, ensuring that commitments made in the proposal are technically achievable within the stated constraints.

## Architecture

The technical assessment architecture implements a multi-dimensional evaluation framework that analyzes opportunities across several independent assessment axes.

```
Opportunity Requirements
        │
        v
  Requirement Parser
  (Structured extraction from analysis output)
        │
        ├──> Capability Matcher ────> Gap Analysis
        │    (Platform features     (Custom dev needs,
        │     vs requirements)       integration effort)
        │
        ├──> Complexity Analyzer ──> Effort Estimation
        │    (Architecture fit,      (Person-days,
        │     integration depth)      phases, timeline)
        │
        ├──> Risk Evaluator ───────> Risk Register
        │    (Technical, delivery,   (Scored, mitigated,
        │     dependency risks)       residual risks)
        │
        └──> Compliance Checker ───> Compliance Matrix
             (Regulatory, security,  (Gaps, remediation
              data protection)        requirements)
                    │
                    v
           Technical Assessment Report
           (Score, feasibility, recommendations)
```

Each assessment axis produces an independent score and analysis. The Capability Matcher compares requirements against a structured capability database derived from the AIAD registry, which catalogs all platform features, agents, commands, and applications with their functional specifications. The Complexity Analyzer evaluates the architectural impact of implementing the solution, considering factors like the number of integration points, data transformation complexity, and performance requirements. The Risk Evaluator identifies technical risks using a taxonomy of common delivery risks calibrated to the platform's historical project data.

## Usage

### Basic Technical Assessment

```bash
# Assess opportunity from presales case
/presales-assess --case-id "CASE-2026-042"

# Assess from analysis output
/presales-assess --from-analysis analysis-2026-02-15.json

# Quick feasibility check
/presales-assess --requirements "EASM platform for 500 domains" --quick
```

### Detailed Assessment

```bash
# Full technical assessment with all dimensions
/presales-assess --case-id "CASE-2026-042" --detail full

# Assessment with explicit capability mapping
/presales-assess --case-id "CASE-2026-042" --capability-map --gap-analysis

# Assessment with risk register
/presales-assess --case-id "CASE-2026-042" --risk-analysis --mitigation-plan
```

### Compliance-Focused Assessment

```bash
# Assessment with regulatory compliance dimension
/presales-assess --case-id "CASE-2026-042" --compliance nis2,gdpr

# Assessment with security architecture review
/presales-assess --case-id "CASE-2026-042" --security-review --threat-model
```

### Comparative Assessment

```bash
# Compare two technical approaches
/presales-assess --case-id "CASE-2026-042" \
  --approach-a "SaaS deployment" --approach-b "On-premise deployment" --compare

# Assess against multiple solution architectures
/presales-assess --case-id "CASE-2026-042" --architectures saas,hybrid,onprem
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--case-id` | string | none | Presales case identifier |
| `--from-analysis` | path | none | Analysis output file to assess |
| `--requirements` | string | none | Direct requirement description |
| `--quick` | flag | false | Quick feasibility check only |
| `--detail` | enum | standard | Assessment depth: quick, standard, full |
| `--capability-map` | flag | false | Include platform capability mapping |
| `--gap-analysis` | flag | false | Identify capability gaps requiring custom work |
| `--risk-analysis` | flag | false | Include technical risk register |
| `--mitigation-plan` | flag | false | Generate risk mitigation recommendations |
| `--compliance` | string | none | Compliance frameworks to evaluate |
| `--security-review` | flag | false | Include security architecture review |
| `--threat-model` | flag | false | Generate threat model for solution |
| `--compare` | flag | false | Compare multiple approaches |
| `--approach-a` | string | none | First approach description |
| `--approach-b` | string | none | Second approach description |
| `--architectures` | string | none | Architecture options to evaluate |
| `--effort-model` | enum | standard | Effort estimation model: optimistic, standard, conservative |
| `--format` | enum | table | Output: table, json, html, pdf, markdown |
| `--output` | path | stdout | Output file path |

## Execution Flow

The technical assessment follows a systematic evaluation process that builds understanding progressively.

**Phase 1 -- Requirement Structuring** (1-3 seconds): Requirements are parsed from the input source (case data, analysis output, or direct description) and organized into a structured requirement model. Each requirement is classified by category (functional, non-functional, integration, compliance), priority (must-have, should-have, nice-to-have), and complexity (simple, moderate, complex, very complex).

**Phase 2 -- Capability Assessment** (2-5 seconds): Each structured requirement is evaluated against the platform's capability database. The assessment identifies three categories: directly supported (existing platform feature), partially supported (feature exists but requires configuration or customization), and unsupported (requires custom development). The gap analysis quantifies the custom development effort for each unsupported requirement.

**Phase 3 -- Complexity Analysis** (2-5 seconds): The overall solution architecture is analyzed for complexity factors. This includes integration point count and depth, data model compatibility, performance requirement feasibility, scalability implications, and deployment architecture constraints. Each complexity factor contributes to the overall effort estimation.

**Phase 4 -- Risk Evaluation** (1-3 seconds): Technical risks are identified using a structured risk taxonomy. Each risk is scored on probability (1-5) and impact (1-5), producing a risk priority number. Mitigation strategies are generated for high-priority risks. The risk register includes both technical risks (performance, scalability, integration) and delivery risks (timeline, resource availability, dependency management).

**Phase 5 -- Scoring and Recommendation** (< 1 second): The overall technical feasibility score is calculated by aggregating capability coverage, complexity factors, and risk exposure. The score maps to a recommendation: Strong Go (85-100), Go (70-84), Conditional Go (55-69), Conditional No-Go (40-54), Strong No-Go (0-39). Each recommendation includes specific conditions and caveats.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/presales-analyze](@/commands/presales-analyze.md) | Upstream | Receives analyzed requirements |
| [/presales-price](@/commands/presales-price.md) | Downstream | Effort estimates feed pricing |
| [/presales-propose](@/commands/presales-propose.md) | Downstream | Assessment feeds proposal technical section |
| [/presales-case](@/commands/presales-case.md) | Case Management | Assessment linked to presales case |
| [/presales](@/commands/presales.md) | Parent Command | Top-level presales orchestration |
| [AIAD Registry](@/glossary/aiad.md) | Capability Database | Platform features and capabilities |
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Execution | `technical-assessor` agent |
| [Telemetry](@/glossary/telemetry.md) | Observability | Assessment quality and timing metrics |

## Best Practices

**Use Analysis Output as Input**: The most reliable assessments come from structured analysis output rather than free-text requirements. Run [/presales-analyze](@/commands/presales-analyze.md) first to produce structured input for the assessment.

**Start with Quick Feasibility**: For initial opportunity screening, use `--quick` to get a rapid feasibility indication before investing time in detailed assessment. This prevents wasted effort on technically infeasible opportunities.

**Always Include Risk Analysis**: Even for straightforward opportunities, `--risk-analysis` reveals potential delivery challenges that may not be apparent from capability mapping alone. Identifying risks early allows for proactive mitigation in the proposal.

**Compare Architecture Options**: When multiple deployment or architecture approaches are viable, use `--compare` to produce a structured comparison. This gives the proposal team clear talking points for each option.

**Calibrate Effort Models**: Use `--effort-model conservative` for fixed-price proposals and `--effort-model standard` for time-and-materials engagements. The conservative model adds buffers for uncertainty.

## Error Handling

| Error Condition | Behavior | Recovery |
|----------------|----------|----------|
| Case not found | Error with available cases | Verify case ID |
| No requirements extracted | Error with guidance | Provide structured requirements |
| Capability database unavailable | Assessment with cached data | Warning about data freshness |
| Unknown compliance framework | Error with supported frameworks | Use supported framework codes |
| Assessment timeout | Partial results with warning | Use `--quick` for faster assessment |
| Conflicting requirements | Warning with conflict details | Resolve conflicts with prospect |

## Advanced Usage

### Assessment Templates

```bash
# Use predefined assessment template
/presales-assess --template easm-deployment --case-id "CASE-2026-042"

# List available assessment templates
/presales-assess --list-templates
```

### Integration with Proposal Pipeline

```bash
# Full presales pipeline
/presales-analyze --file rfp.pdf --case-id "CASE-2026-042"
/presales-assess --case-id "CASE-2026-042" --detail full --risk-analysis
/presales-price --case-id "CASE-2026-042" --from-assessment
/presales-propose --case-id "CASE-2026-042" --from-assessment --from-pricing
```

### Automated Reassessment

```bash
# Reassess after requirement changes
/presales-assess --case-id "CASE-2026-042" --reassess --diff-from previous

# Track assessment score over requirement iterations
/presales-assess --case-id "CASE-2026-042" --history --trend
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Every requirement must be assessed -- no requirements are skipped or deferred. Capability gaps are reported honestly without minimization. Risk registers include all identified risks, including those that might make the opportunity less attractive.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Feasibility determinations are based on verified platform capabilities, not assumptions. Effort estimates reference historical project data. The [NABLA](@/glossary/nabla-infinity.md) axiom of Unknown Valid is respected: when assessment cannot determine feasibility for a requirement, it is classified as "Unknown" rather than assumed feasible or infeasible.

## Related Commands

- [/presales](@/commands/presales.md) - Presales intelligence for company analysis and opportunity identification
- [/presales-analyze](@/commands/presales-analyze.md) - Text, file and URL analysis for presales opportunity assessment
- [/presales-case](@/commands/presales-case.md) - Presales case management for status tracking and updates
- [/investigate](@/commands/investigate.md) - Launch comprehensive [OSINT](@/glossary/osint.md) investigation across 121+ sources
- [/email-osint](@/commands/email-osint.md) - Email-based OSINT gathering with breach correlation and social profiling
- [/google-hacking](@/commands/google-hacking.md) - Google dorking and advanced search intelligence extraction

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)