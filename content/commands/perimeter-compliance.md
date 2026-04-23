+++
title = "/perimeter-compliance"
weight = 1440
[extra]
category = "Perimeter"
description = "NIS2 and ZKB compliance assessment with gap analysis"
syntax = "/perimeter-compliance [options]"
authority = "L2+"
agent = "compliance-checker"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1402
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["perimeter-compliance", "NIS2", "commands", "Perimeter", "Prismatic Platform", "Phase"]
tags = ["commands", "perimeter", "perimeter-compliance", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/perimeter-compliance - Prismatic Platform"
+++

## Overview

**/perimeter-compliance** is a production command in the **Perimeter** category of the Prismatic Platform that performs automated compliance assessment against major European cybersecurity regulatory frameworks. The command evaluates an organization's external [attack surface](@/glossary/attack-surface.md) against the requirements of the [NIS2](@/glossary/nis2.md) Directive (EU 2022/2555) and the Czech [ZKB](@/glossary/zkb.md) regulation (264/2025 Sb.), producing comprehensive gap analysis reports with actionable remediation guidance.

The compliance assessment engine operates by correlating discovered assets, security findings, and configuration data from the [Prismatic Perimeter](@/apps/prismatic-perimeter.md) application against a structured regulatory requirement database. Each requirement is mapped to specific technical controls, and the command evaluates whether the organization's observed external posture satisfies those controls. The result is a detailed compliance scorecard that quantifies adherence at the requirement level, identifies specific gaps, and prioritizes remediation actions by risk severity and regulatory criticality.

This command operates under the **L2+** authority level and is executed by the `compliance-checker` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The L2+ authority level reflects the sensitivity of compliance data and the potential business impact of compliance assessments, requiring operators to have established trust within the platform's authorization hierarchy.

Unlike manual compliance audits that can take weeks or months, `/perimeter-compliance` delivers real-time, evidence-based assessments that are continuously updated as the attack surface changes. This positions organizations to maintain ongoing compliance awareness rather than relying on periodic point-in-time assessments that rapidly become stale. The command's integration with the broader Perimeter suite means that compliance gaps are automatically linked to specific assets and vulnerabilities, creating a direct path from regulatory requirement to technical remediation.

## Architecture

The compliance assessment architecture follows a layered evaluation model that separates regulatory framework definitions from technical control evaluation logic.

```
Regulatory Framework DB ──> Requirement Parser ──> Control Mapper
         │                                              │
         v                                              v
  Framework Registry                          Asset/Finding Correlator
  (NIS2, ZKB, GDPR)                          (Perimeter Data Layer)
         │                                              │
         v                                              v
  Requirement Graph ────────> Compliance Engine ────> Gap Analyzer
                                    │                    │
                                    v                    v
                             Score Calculator      Remediation Engine
                                    │                    │
                                    v                    v
                              Compliance Report (JSON/HTML/PDF)
```

The `compliance-checker` agent orchestrates the evaluation pipeline, which consists of four primary stages: requirement decomposition, control mapping, evidence collection, and gap analysis. Each stage is implemented as an independent OTP process within the [Prismatic Perimeter](@/apps/prismatic-perimeter.md) supervision tree, allowing concurrent evaluation of multiple regulatory frameworks.

The framework registry stores structured representations of regulatory requirements using a hierarchical model: Framework > Chapter > Article > Requirement > Control. This decomposition enables granular compliance tracking down to individual technical controls while maintaining the ability to aggregate scores at any level of the hierarchy.

## Usage

### Basic Compliance Check

```bash
# Run full NIS2 + ZKB compliance assessment
/perimeter-compliance

# Assess specific framework only
/perimeter-compliance --framework nis2
/perimeter-compliance --framework zkb

# Target specific domain
/perimeter-compliance --domain example.com --framework nis2

# Generate detailed report with remediation guidance
/perimeter-compliance --domain example.com --detail full --remediation
```

### Framework-Specific Assessment

```bash
# NIS2 Directive assessment with article-level breakdown
/perimeter-compliance --framework nis2 --breakdown article

# ZKB regulation with section-level detail
/perimeter-compliance --framework zkb --breakdown section

# Combined multi-framework assessment
/perimeter-compliance --framework nis2,zkb --compare
```

### Continuous Compliance Monitoring

```bash
# Enable continuous monitoring with alerting
/perimeter-compliance --monitor --interval 24h --alert-on-regression

# Compare current state against baseline
/perimeter-compliance --baseline 2026-01-15 --diff

# Export compliance timeline
/perimeter-compliance --history --format json --output compliance-trend.json
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--domain` | string | all discovered | Target domain for assessment |
| `--framework` | enum | nis2,zkb | Regulatory framework(s) to evaluate |
| `--breakdown` | enum | summary | Detail level: summary, chapter, article, control |
| `--detail` | enum | standard | Output verbosity: minimal, standard, full |
| `--remediation` | flag | false | Include remediation guidance for gaps |
| `--baseline` | date | none | Compare against historical baseline |
| `--diff` | flag | false | Show delta from baseline |
| `--monitor` | flag | false | Enable continuous monitoring mode |
| `--interval` | duration | 24h | Monitoring check interval |
| `--alert-on-regression` | flag | false | Alert when compliance score drops |
| `--format` | enum | table | Output format: table, json, html, pdf |
| `--output` | path | stdout | Write report to file |
| `--compare` | flag | false | Side-by-side multi-framework comparison |
| `--history` | flag | false | Show compliance score history |
| `--evidence` | flag | false | Include raw evidence artifacts |

## Execution Flow

The compliance assessment follows a deterministic multi-phase execution pipeline that ensures comprehensive and reproducible results.

**Phase 1 -- Asset Inventory Collection** (0-5 seconds): The command queries the Perimeter asset registry to retrieve all discovered assets for the target domain. This includes domains, subdomains, IP addresses, TLS certificates, exposed services, and cloud resources. The asset inventory forms the evidence basis against which compliance controls are evaluated.

**Phase 2 -- Framework Requirement Loading** (< 1 second): The regulatory framework database is loaded and the requirement graph is constructed. For NIS2, this encompasses 46 articles across 5 chapters with approximately 180 individual technical controls. For ZKB, the regulation's sections are decomposed into approximately 95 controls specific to the Czech cybersecurity context.

**Phase 3 -- Control-to-Asset Mapping** (1-3 seconds): Each technical control is mapped to the relevant asset categories and security findings. For example, NIS2 Article 21(2)(d) on supply chain security maps to third-party service dependencies detected during asset discovery. The mapping engine uses a rule-based correlation system that links control identifiers to specific Perimeter finding categories.

**Phase 4 -- Evidence Evaluation** (2-10 seconds): For each mapped control, the evaluation engine determines compliance status by analyzing the collected evidence. Controls are classified as Compliant, Partially Compliant, Non-Compliant, or Not Assessable. Each classification is accompanied by the specific evidence that supports the determination, ensuring full auditability.

**Phase 5 -- Gap Analysis & Scoring** (1-2 seconds): Non-compliant and partially compliant controls are aggregated into a gap analysis report. The overall compliance score is calculated using a weighted algorithm that accounts for control criticality, risk severity, and regulatory priority. Remediation recommendations are generated for each identified gap.

**Phase 6 -- Report Generation** (< 1 second): The final compliance report is rendered in the requested format and delivered to the operator. Reports include executive summary, detailed findings, evidence references, and prioritized remediation roadmap.

## Integration Points

The `/perimeter-compliance` command integrates deeply with the Prismatic Platform ecosystem to provide comprehensive compliance intelligence.

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Perimeter](@/apps/prismatic-perimeter.md) | Data Source | Asset inventory, security findings, scan results |
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Execution | `compliance-checker` agent orchestration |
| [Prismatic Storage](@/apps/prismatic-storage.md) | Persistence | Compliance history, baselines, trend data |
| [Telemetry](@/glossary/telemetry.md) | Observability | Assessment timing, control evaluation metrics |
| [Quality Gates](@/glossary/quality-gates.md) | Validation | Pre/post execution quality checks |
| [AIAD Registry](@/glossary/aiad.md) | Discovery | Command specification and routing |
| [/perimeter-easm](@/commands/perimeter-easm.md) | Upstream | Security ratings feed into compliance scoring |
| [/perimeter](@/commands/perimeter.md) | Dashboard | Compliance widgets on main dashboard |

The command also emits structured [telemetry](@/glossary/telemetry.md) events at each pipeline phase, enabling performance monitoring and operational dashboards. Key telemetry events include `[:perimeter, :compliance, :assessment_started]`, `[:perimeter, :compliance, :framework_evaluated]`, and `[:perimeter, :compliance, :report_generated]`.

## Best Practices

**Schedule Regular Assessments**: Configure continuous monitoring with `/perimeter-compliance --monitor` to catch compliance regressions early. Weekly assessments provide a good balance between coverage and resource utilization for most organizations.

**Establish Baselines Early**: Run an initial comprehensive assessment and save the results as a baseline using the `--baseline` option. All subsequent assessments can then show delta changes, making it immediately clear whether the compliance posture is improving or degrading.

**Prioritize by Risk**: When the gap analysis reveals multiple non-compliant controls, use the remediation priority rankings to focus on the highest-risk gaps first. NIS2 Article 21 requirements related to incident handling and access control typically carry the highest regulatory risk.

**Combine with EASM Data**: The compliance assessment is most valuable when the underlying asset inventory is comprehensive. Run [/perimeter-easm](@/commands/perimeter-easm.md) before compliance assessment to ensure all external assets are discovered and their security posture is current.

**Export for Audit**: For regulatory audit preparation, use `--format pdf --evidence` to generate self-contained compliance reports that include all supporting evidence artifacts. These reports are designed to satisfy auditor documentation requirements.

## Error Handling

The compliance assessment pipeline implements comprehensive error handling at each evaluation phase.

| Error Condition | Behavior | Recovery |
|----------------|----------|----------|
| No assets discovered | Warning + empty assessment | Run [/perimeter](@/commands/perimeter.md) first |
| Framework not recognized | Error with supported list | Use `nis2` or `zkb` |
| Incomplete asset data | Partial assessment + warnings | Controls marked "Not Assessable" |
| Storage unavailable | Assessment continues in-memory | Results not persisted to history |
| Baseline not found | Error with available baselines | Run without `--diff` or create baseline |
| Timeout on large domains | Phase timeout with partial results | Increase timeout or narrow scope |

All errors are logged with full context to the platform's structured logging system, including the specific phase, control, and asset that triggered the error. The `compliance-checker` agent applies circuit breaker patterns to prevent cascading failures when upstream data sources are unavailable.

## Advanced Usage

### Custom Compliance Frameworks

```bash
# Load custom regulatory framework definition
/perimeter-compliance --framework custom --framework-file /path/to/framework.json

# Extend existing framework with additional controls
/perimeter-compliance --framework nis2 --extend additional-controls.json
```

### Multi-Domain Enterprise Assessment

```bash
# Assess multiple domains across a corporate group
/perimeter-compliance --domain "corp.example.com,subsidiary.example.com,partner.example.com" \
  --framework nis2 --aggregate --format pdf

# Compare compliance across business units
/perimeter-compliance --group "enterprise" --compare-domains --breakdown article
```

### Integration with CI/CD Pipeline

```bash
# Compliance gate in deployment pipeline
/perimeter-compliance --domain staging.example.com --framework nis2 \
  --threshold 85 --fail-on-regression --format json --output compliance-gate.json
```

The `--threshold` parameter sets a minimum compliance score percentage. If the assessment result falls below this threshold, the command exits with a non-zero status code, allowing it to function as a deployment gate in continuous delivery pipelines.

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Every compliance control must be evaluated -- partial assessments are clearly marked and never presented as complete. No compliance gap is suppressed or minimized.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every compliance determination is backed by specific evidence artifacts from the Perimeter data layer. The [NABLA](@/glossary/nabla-infinity.md) axiom of Signal Plurality is enforced: compliance status requires corroboration from multiple data sources where available.

The compliance assessment pipeline enforces the Trinity Gate for all critical compliance determinations, ensuring structural consistency (the compliance graph forms a valid DAG), logical consistency (no contradictory compliance states), and formal necessity (critical controls are formally verified).

## Related Commands

- [/perimeter](@/commands/perimeter.md) - External [attack surface](@/glossary/attack-surface.md) management dashboard and overview
- [/perimeter-assets](@/commands/perimeter-assets.md) - Asset inventory with domain, IP, certificate discovery
- [/perimeter-easm](@/commands/perimeter-easm.md) - Advanced EASM dashboard with [security rating](@/glossary/security-rating.md)s (A-F)
- [/investigate](@/commands/investigate.md) - Launch comprehensive [OSINT](@/glossary/osint.md) investigation across 121+ sources
- [/email-osint](@/commands/email-osint.md) - Email-based OSINT gathering with breach correlation and social profiling
- [/google-hacking](@/commands/google-hacking.md) - Google dorking and advanced search intelligence extraction

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)