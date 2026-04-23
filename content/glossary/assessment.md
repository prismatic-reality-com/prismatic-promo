+++
title = "Assessment"
weight = 50
[extra]
description = "Systematic evaluation of a subject against defined criteria to determine its state, quality, compliance posture, or risk profile with evidence-based scoring and actionable recommendations"
category = "core"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "advanced"
domain_category = "quality-assurance"
related_concepts = ["compliance-framework", "quality-gates", "risk-score", "due-diligence", "easm"]
implementation_status = "production"
authority_level = "platform-core"
difficulty_rating = 5
prerequisites = ["quality-gates", "compliance-framework"]
learning_path = "quality-assurance"
interactive_demos = ["/labs/glossary/assessment"]
code_examples = ["elixir", "assessment-framework", "scoring-engine"]
external_resources = ["https://www.iso.org/standard/75281.html", "https://www.nist.gov/cyberframework"]
version_introduced = "gen-3"
stability_level = "stable"
testing_scenarios = ["assessment-scoring-accuracy", "compliance-gap-detection", "risk-calculation-validation", "multi-domain-aggregation"]
keywords = ["assessment", "evaluation", "quality assessment", "security assessment", "compliance assessment", "risk assessment", "scoring", "audit"]
tags = ["glossary", "core", "quality", "security", "compliance", "assessment", "risk"]
related_terms = ["compliance-framework", "quality-gates", "risk-score", "due-diligence", "vulnerability-assessment", "easm", "security-rating", "audit-trail"]
word_count = 1865
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Assessment - Prismatic Platform"
+++

## Definition

Assessment is the systematic, structured evaluation of a subject -- a software system, an organization's security posture, a codebase's quality, or a vendor's compliance status -- against explicitly defined criteria, producing measurable results that enable informed decision-making. An assessment transforms subjective impressions into objective, reproducible measurements by applying standardized methodologies, consistent scoring rubrics, and evidence-based evaluation procedures. The output of an assessment includes numerical scores, gap analyses, risk classifications, and prioritized recommendations for improvement.

In software engineering and cybersecurity, assessments operate across multiple domains: security assessments evaluate defensive posture against threat models, quality assessments measure code and architecture against engineering standards, compliance assessments verify adherence to regulatory frameworks, risk assessments quantify the probability and impact of adverse events, and due diligence assessments evaluate acquisition targets or vendor relationships. Each domain has its own methodologies and standards, but they share common structural elements: defined criteria, evidence collection, gap analysis, scoring, and reporting.

## Overview

Assessments serve as the diagnostic function in any quality or security management system. Without assessment, organizations operate on assumptions about their state rather than evidence. The assessment discipline provides the feedback loop necessary for continuous improvement: measure the current state, identify gaps, prioritize remediation, implement changes, and reassess.

### Assessment Lifecycle

| Phase | Activities | Outputs |
|-------|-----------|---------|
| **Scoping** | Define assessment boundaries, criteria, methodology, and stakeholders | Assessment plan, criteria matrix, timeline |
| **Evidence Collection** | Gather data through automated scanning, manual review, interviews, and documentation analysis | Evidence repository, raw measurements |
| **Analysis** | Compare collected evidence against defined criteria, identify gaps and violations | Gap analysis, violation inventory |
| **Scoring** | Apply scoring rubric to produce quantitative measures of compliance and quality | Numeric scores, grades, risk levels |
| **Reporting** | Present findings with context, prioritization, and remediation recommendations | Assessment report, executive summary |
| **Remediation Tracking** | Monitor implementation of recommendations, reassess after changes | Progress dashboard, reassessment schedule |

### Assessment Types in Software Engineering

| Assessment Type | Focus | Methodology | Frequency |
|----------------|-------|-------------|-----------|
| **Security Assessment** | Vulnerabilities, attack surface, threat landscape | NIST CSF, OWASP, penetration testing | Quarterly / continuous |
| **Quality Assessment** | Code quality, architecture fitness, test coverage | Static analysis, metrics, peer review | Per-commit / continuous |
| **Compliance Assessment** | Regulatory adherence (NIS2, GDPR, SOC 2, ZKB) | Framework mapping, evidence collection, gap analysis | Annual / triggered by change |
| **Risk Assessment** | Threat probability, impact, risk appetite alignment | Quantitative (FAIR), qualitative (risk matrix) | Annual / per-change |
| **Performance Assessment** | Response time, throughput, resource utilization | Load testing, APM, benchmarking | Pre-release / continuous |
| **Vendor Assessment** | Third-party risk, supply chain security, SLA compliance | Questionnaires, EASM scanning, contract review | Onboarding / annual |
| **Architecture Assessment** | Structural fitness, quality attributes, technical debt | ATAM, fitness functions, trade-off analysis | Per-milestone / triggered |

### Scoring Methodologies

Assessment scoring transforms qualitative observations into quantitative measures. Several methodologies are used in practice:

**Binary scoring** assigns pass/fail status to each criterion. Prismatic's quality gates use binary scoring -- a domain either has zero violations (pass) or it does not (fail). This is the most stringent approach.

**Weighted scoring** assigns numerical weights to criteria based on importance, then computes a weighted sum. Security rating systems like Prismatic Perimeter's A-F grades use weighted scoring across multiple risk categories.

**Maturity model scoring** places the assessed subject on a capability maturity scale (typically 1-5). CMMI and the NIST Cybersecurity Framework use this approach.

**Risk-based scoring** combines probability and impact assessments to produce risk scores. The FAIR (Factor Analysis of Information Risk) methodology provides a quantitative risk scoring framework.

## Technical Details

### Assessment Engine Architecture

An assessment engine must be extensible (supporting multiple assessment types), reproducible (producing consistent results from the same inputs), and auditable (maintaining a complete record of evidence, criteria, and scoring decisions).

```elixir
defmodule PrismaticAssessment.Engine do
  @moduledoc """
  Core assessment engine that evaluates subjects against defined criteria,
  produces scored results, and generates structured reports.

  Supports multiple assessment types: security, quality, compliance, risk.
  All assessments produce auditable evidence chains.
  """

  @type assessment_type :: :security | :quality | :compliance | :risk | :performance
  @type severity :: :critical | :high | :medium | :low | :informational
  @type grade :: :a | :b | :c | :d | :f

  @type criterion :: %{
    id: String.t(),
    name: String.t(),
    description: String.t(),
    weight: float(),
    category: String.t(),
    severity: severity(),
    check_fn: (map() -> {:pass, map()} | {:fail, map()})
  }

  @type finding :: %{
    criterion_id: String.t(),
    status: :pass | :fail | :not_applicable,
    evidence: String.t(),
    remediation: String.t() | nil,
    severity: severity()
  }

  @type assessment_result :: %{
    type: assessment_type(),
    subject: String.t(),
    score: float(),
    grade: grade(),
    findings: [finding()],
    assessed_at: DateTime.t(),
    assessor: String.t(),
    criteria_count: non_neg_integer(),
    pass_count: non_neg_integer(),
    fail_count: non_neg_integer()
  }

  @spec assess(String.t(), assessment_type(), [criterion()], map()) ::
    {:ok, assessment_result()} | {:error, String.t()}
  def assess(subject, type, criteria, context) when is_list(criteria) do
    findings =
      criteria
      |> Enum.map(fn criterion ->
        {status, evidence} = criterion.check_fn.(context)

        %{
          criterion_id: criterion.id,
          status: status,
          evidence: Map.get(evidence, :detail, ""),
          remediation: Map.get(evidence, :remediation),
          severity: criterion.severity
        }
      end)

    score = calculate_weighted_score(criteria, findings)
    grade = score_to_grade(score)
    pass_count = Enum.count(findings, &(&1.status == :pass))
    fail_count = Enum.count(findings, &(&1.status == :fail))

    result = %{
      type: type,
      subject: subject,
      score: score,
      grade: grade,
      findings: findings,
      assessed_at: DateTime.utc_now(),
      assessor: "prismatic-assessment-engine",
      criteria_count: length(criteria),
      pass_count: pass_count,
      fail_count: fail_count
    }

    {:ok, result}
  end

  @spec calculate_weighted_score([criterion()], [finding()]) :: float()
  defp calculate_weighted_score(criteria, findings) do
    total_weight = Enum.reduce(criteria, 0.0, fn c, acc -> acc + c.weight end)

    earned_weight =
      Enum.zip(criteria, findings)
      |> Enum.reduce(0.0, fn {criterion, finding}, acc ->
        case finding.status do
          :pass -> acc + criterion.weight
          :not_applicable -> acc + criterion.weight
          :fail -> acc
        end
      end)

    case total_weight do
      0.0 -> 0.0
      weight -> earned_weight / weight * 100.0
    end
  end

  @spec score_to_grade(float()) :: grade()
  defp score_to_grade(score) when score >= 90.0, do: :a
  defp score_to_grade(score) when score >= 80.0, do: :b
  defp score_to_grade(score) when score >= 70.0, do: :c
  defp score_to_grade(score) when score >= 60.0, do: :d
  defp score_to_grade(_score), do: :f
end
```

### Security Assessment Framework

Security assessments in Prismatic are multi-dimensional, covering external attack surface, internal code quality, compliance posture, and operational security.

```elixir
defmodule PrismaticAssessment.Security do
  @moduledoc """
  Security-specific assessment module that evaluates systems against
  security criteria derived from NIST CSF, OWASP, NIS2, and ZKB frameworks.
  """

  alias PrismaticAssessment.Engine

  @type security_domain :: :network | :application | :data | :identity |
                            :operations | :compliance

  @type security_posture :: %{
    overall_grade: Engine.grade(),
    domain_scores: %{security_domain() => float()},
    critical_findings: [Engine.finding()],
    compliance_gaps: [String.t()],
    risk_summary: String.t()
  }

  @spec assess_security_posture(String.t(), keyword()) ::
    {:ok, security_posture()} | {:error, String.t()}
  def assess_security_posture(target, opts \\ []) do
    frameworks = Keyword.get(opts, :frameworks, [:nist_csf, :owasp])

    criteria = build_security_criteria(frameworks)
    context = gather_security_evidence(target, opts)

    case Engine.assess(target, :security, criteria, context) do
      {:ok, result} ->
        posture = %{
          overall_grade: result.grade,
          domain_scores: group_by_domain(result.findings, criteria),
          critical_findings: filter_critical(result.findings),
          compliance_gaps: identify_compliance_gaps(result.findings, frameworks),
          risk_summary: generate_risk_summary(result)
        }

        {:ok, posture}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @spec build_security_criteria([atom()]) :: [Engine.criterion()]
  defp build_security_criteria(frameworks) do
    frameworks
    |> Enum.flat_map(&framework_criteria/1)
    |> Enum.uniq_by(& &1.id)
  end

  @spec framework_criteria(atom()) :: [Engine.criterion()]
  defp framework_criteria(:nist_csf), do: nist_csf_criteria()
  defp framework_criteria(:owasp), do: owasp_criteria()
  defp framework_criteria(:nis2), do: nis2_criteria()
  defp framework_criteria(:zkb), do: zkb_criteria()
  defp framework_criteria(_), do: []

  defp nist_csf_criteria, do: []
  defp owasp_criteria, do: []
  defp nis2_criteria, do: []
  defp zkb_criteria, do: []
  defp gather_security_evidence(_target, _opts), do: %{}
  defp group_by_domain(_findings, _criteria), do: %{}
  defp filter_critical(findings), do: Enum.filter(findings, &(&1.severity == :critical))
  defp identify_compliance_gaps(_findings, _frameworks), do: []
  defp generate_risk_summary(_result), do: ""
end
```

### Quality Assessment Metrics

Quality assessments in Prismatic measure 13 distinct domains, each with its own criteria and measurement methodology:

| Domain | Criteria | Measurement | Tool |
|--------|----------|-------------|------|
| **Compilation** | Zero warnings | `mix compile --warnings-as-errors` | Elixir compiler |
| **Static Analysis** | Zero Credo violations | `mix credo --strict` | Credo |
| **Type Safety** | Zero Dialyzer errors | `mix dialyzer` | Dialyzer |
| **Test Coverage** | 100% line coverage | `mix test --cover` | ExUnit |
| **Typespec Coverage** | @spec on all public functions | Custom analysis | PrismaticQuality |
| **@impl Coverage** | @impl on all callback functions | Custom analysis | PrismaticQuality |
| **Memory Safety** | Zero unsafe map access | Pattern detection | Custom Credo checks |
| **Performance** | Sub-250ms page loads | Benchee + telemetry | PrismaticPerformance |
| **DateTime Precision** | Microsecond precision | Pattern detection | Custom analysis |
| **Guard Functions** | Correct guard usage | Pattern detection | Custom Credo checks |
| **Naming Standards** | No forbidden patterns | Pattern matching | Forbidden patterns scanner |
| **TODO Management** | Zero orphaned TODOs | Pattern detection | Custom analysis |
| **Timing Patterns** | No Process.sleep in prod | Pattern detection | Custom analysis |

## Implementation in Prismatic Platform

### Continuous Quality Assessment

Prismatic implements continuous assessment through multiple automated systems:

**Pre-commit assessment** (11 phases): Every commit triggers a comprehensive quality assessment. The pre-commit hook runs compilation checks, static analysis, type checking, test execution, forbidden pattern detection, and composite quality gate evaluation. Commits that fail any phase are rejected.

**Quality Floor Guardian**: A continuous monitoring process that assesses quality metrics across the platform and triggers interventions when degradation is detected. The guardian operates at four enforcement levels (OPTIMAL, WARNING, CRITICAL, EMERGENCY).

**Quality DNA**: Cross-session assessment persistence. Each session begins with a baseline assessment (`mix autoheal.baseline`) and ends with a comparative assessment that measures improvement or regression.

### Security Assessment (Prismatic Perimeter)

Prismatic Perimeter implements External Attack Surface Management (EASM), which is fundamentally a continuous security assessment platform:

| Assessment Component | Description | Output |
|---------------------|-------------|--------|
| **Asset Discovery** | Automated reconnaissance of external-facing assets | Asset inventory with confidence scores |
| **Vulnerability Assessment** | Identification of known vulnerabilities and misconfigurations | CVE mappings, severity ratings |
| **Security Rating** | A-F grade based on weighted security criteria | Numeric score (300-900) + letter grade |
| **Compliance Assessment** | NIS2 and ZKB compliance gap analysis | Compliance percentage, gap inventory |
| **Risk Scoring** | Quantitative risk assessment per asset and aggregate | Risk scores with confidence levels |

### Due Diligence Assessment

For OSINT and due diligence operations, Prismatic provides structured assessment of entities across 120+ data sources:

- **Entity identity verification** against Czech registries (ARES, Justice, ISIR)
- **Beneficial ownership** assessment through corporate structure analysis
- **Sanctions screening** against EU, OFAC SDN, and UN sanctions lists
- **Adverse media** detection and relevance scoring
- **Financial health** indicators from commercial registry data

## Comparison with Alternatives

| Approach | Strengths | Weaknesses | When to Use |
|----------|-----------|------------|-------------|
| **Automated continuous assessment** | Real-time, consistent, scalable | May miss nuance, false positives | Ongoing quality/security monitoring |
| **Manual expert assessment** | Deep insight, contextual judgment | Expensive, inconsistent, slow | Initial architecture review, complex decisions |
| **Questionnaire-based** | Structured, comparable across orgs | Self-reported bias, gaming risk | Vendor assessment, compliance self-evaluation |
| **Penetration testing** | Real-world validation | Point-in-time, expensive | Annual security validation |
| **Maturity model assessment** | Progression framework, roadmap | Subjective levels, gaming risk | Organizational capability development |
| **Benchmark-based** | Industry comparison, peer context | Benchmark relevance, data quality | Strategic positioning, investment decisions |

### Assessment Anti-Patterns

| Anti-Pattern | Description | Consequence |
|-------------|-------------|-------------|
| **Assessment Theater** | Performing assessments without acting on results | Wasted resources, false confidence |
| **Checkbox Compliance** | Treating assessment as a checklist rather than genuine evaluation | Missing real risks, shallow coverage |
| **Assessment Fatigue** | Over-assessing without proportional value | Reduced engagement, assessment avoidance |
| **Single-Point Assessment** | Assessing once without continuous monitoring | Stale results, regression blindness |
| **Metric Gaming** | Optimizing assessment scores without improving underlying quality | Inflated scores, hidden problems |

## Best Practices

1. **Define criteria before assessment**: Assessment criteria must be established and agreed upon before evidence collection begins. Post-hoc criteria selection introduces bias and reduces reproducibility.

2. **Automate where possible**: Manual assessments do not scale and produce inconsistent results. Prismatic automates 13 quality domains and runs assessments on every commit.

3. **Maintain evidence chains**: Every assessment finding must be traceable to specific evidence. The audit trail from criterion to evidence to finding to recommendation must be complete and auditable.

4. **Assess continuously, not periodically**: Point-in-time assessments miss regressions between assessment cycles. Continuous assessment catches degradation immediately. Prismatic's pre-commit hooks provide per-commit assessment.

5. **Act on findings promptly**: An assessment whose findings languish in a backlog provides no value. The NO MERCY doctrine mandates immediate action on all assessment findings.

6. **Calibrate scoring regularly**: Assessment scoring rubrics must be reviewed and updated as standards evolve, threats change, and organizational risk appetite shifts.

7. **Separate assessment from remediation**: The entity performing assessment should be independent of the entity responsible for remediation. This prevents conflicts of interest and ensures honest evaluation.

8. **Aggregate across domains**: Individual domain assessments provide depth; cross-domain aggregation provides breadth. Prismatic's composite quality score aggregates 13 domains into a single 0-100 metric.

## Common Pitfalls

**Confusing assessment with testing**: Testing verifies specific behaviors. Assessment evaluates against broader criteria including architecture, process, documentation, and operational readiness. A system can pass all tests while failing an architectural assessment.

**Ignoring assessment context**: A security assessment without knowledge of the threat model, a quality assessment without understanding the development stage, or a compliance assessment without clarity on applicable regulations produces misleading results.

**Over-weighting automated findings**: Automated tools find certain categories of issues efficiently but miss others entirely. Security scanners find known vulnerability patterns but miss business logic flaws. Assessment must combine automated and human analysis.

**Assessment without accountability**: Assessment reports that lack clear ownership for remediation actions are destined for neglect. Every finding must have an owner, a deadline, and a verification mechanism.

**Failing to reassess after remediation**: Implementing fixes without re-running the assessment leaves uncertainty about whether the fix was effective. Prismatic's quality gates re-run automatically, verifying that fixes achieve the intended improvement.

**Scope creep during assessment**: Assessment scope should be defined and fixed before the assessment begins. Expanding scope mid-assessment delays delivery and reduces depth of analysis.

## Use Cases

**Pre-acquisition due diligence**: Before acquiring a company, assess the target's technology stack, code quality, security posture, regulatory compliance, and technical debt. This assessment directly influences valuation and integration planning.

**Regulatory compliance verification**: Organizations subject to NIS2, GDPR, SOC 2, or ZKB regulations use compliance assessments to verify adherence, identify gaps, and demonstrate compliance to auditors.

**Vendor risk management**: Before onboarding a third-party vendor, assess their security practices, data handling procedures, incident response capabilities, and compliance posture. Prismatic Perimeter provides automated external assessment for this purpose.

**Continuous quality monitoring**: Embed quality assessments into the development workflow to catch regressions immediately. Prismatic's 11-phase pre-commit pipeline is the implementation of continuous quality assessment.

**Security posture evaluation**: Regularly assess the organization's security posture across all layers (network, application, data, identity, operations) to identify weaknesses before adversaries exploit them.

**Architecture fitness evaluation**: Assess whether the system's architecture continues to satisfy its quality attribute requirements as the system evolves. Fitness functions provide the assessment mechanism.

## Related Concepts

- [Compliance Framework](/glossary/compliance-framework/) -- Structured set of regulatory requirements that assessment criteria are derived from
- [Quality Gates](/glossary/quality-gates/) -- Automated enforcement points where assessment results determine whether code proceeds through the pipeline
- [Risk Score](/glossary/risk-score/) -- Quantitative measure of risk produced by risk assessment methodologies
- [Due Diligence](/glossary/due-diligence/) -- Comprehensive assessment of entities for business, legal, and financial purposes
- [Vulnerability Assessment](/glossary/vulnerability-assessment/) -- Security-specific assessment focused on identifying exploitable weaknesses
- [EASM](/glossary/easm/) -- External Attack Surface Management providing continuous security assessment from an outside-in perspective
- [Security Rating](/glossary/security-rating/) -- Letter grade or numeric score summarizing an organization's security assessment results
- [Audit Trail](/glossary/audit-trail/) -- Immutable record of assessment activities, findings, and remediation actions
- [Confidence Scoring](/glossary/confidence-scoring/) -- Quantifying the reliability and certainty of assessment findings
- [Code Coverage](/glossary/code-coverage/) -- Metric used in quality assessment to measure test thoroughness

## See Also

- [Perimeter section](/perimeter/) -- Prismatic Perimeter's continuous security assessment capabilities
- NIST Cybersecurity Framework 2.0 -- https://www.nist.gov/cyberframework -- Federal standard for cybersecurity assessment
- ISO 27001:2022 -- International standard for information security management assessment
- FAIR Institute -- https://www.fairinstitute.org/ -- Quantitative risk assessment methodology
- OWASP Testing Guide -- Comprehensive web application security assessment methodology

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
