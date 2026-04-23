+++
title = "Security Assessment"
weight = 50
[extra]
tags = ["glossary", "security", "assessment", "vulnerability", "compliance", "easm", "perimeter", "rating", "risk-management", "nis2", "zkb", "attack-surface"]
description = "Systematic evaluation of an organization's security posture through automated scanning, vulnerability identification, misconfiguration detection, and compliance gap analysis across infrastructure, applications, and processes"
category = "security"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate-to-advanced"
domain_category = "security-and-compliance"
related_concepts = ["vulnerability assessment", "penetration testing", "compliance framework", "attack surface management", "security rating", "risk scoring", "threat modeling"]
implementation_status = "production"
authority_level = "platform-doctrine"
difficulty_rating = 6
prerequisites = ["basic security concepts", "network fundamentals", "compliance frameworks"]
learning_path = "security-fundamentals > vulnerability-assessment > security-assessment > penetration-testing > easm"
interactive_demos = ["/labs/glossary/security-assessment"]
code_examples = ["Elixir", "Bash"]
external_resources = ["https://owasp.org/www-project-web-security-testing-guide/", "https://nvd.nist.gov/", "https://www.nist.gov/cyberframework"]
version_introduced = "0.45.0"
stability_level = "stable"
testing_scenarios = ["asset discovery validation", "rating calculation accuracy", "compliance mapping completeness", "false positive rate measurement"]
keywords = ["security assessment", "vulnerability scanning", "compliance audit", "risk evaluation", "attack surface", "security posture", "EASM", "security rating"]
related_terms = ["security-rating", "vulnerability-assessment", "attack-surface", "easm", "penetration-testing", "compliance-framework", "security-audit", "audit-trail", "security-operations", "no-mercy-no-doubts"]
word_count = 1886
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Security Assessment - Prismatic Platform"
+++

## Definition

A **security assessment** is a systematic, structured evaluation of an organization's security posture that identifies vulnerabilities, misconfigurations, policy violations, and compliance gaps across the full spectrum of infrastructure, applications, data flows, and operational processes. Unlike ad-hoc vulnerability scans that focus on individual technical weaknesses, a security assessment provides a holistic view of an organization's defensive capabilities by examining technical controls, procedural safeguards, personnel practices, and governance frameworks in a unified analytical model.

Security assessments produce actionable intelligence -- not just lists of findings, but prioritized recommendations that map directly to risk reduction. They answer the fundamental question: "Given our current security posture, what is the probability and potential impact of a successful attack, and what is the most cost-effective path to reducing that risk?"

In the context of the Prismatic Platform, security assessment is operationalized through the [Prismatic Perimeter](@/glossary/easm.md) subsystem, which performs continuous, automated [attack surface](@/glossary/attack-surface.md) evaluation with [security ratings](@/glossary/security-rating.md) graded A through F, [NIS2](@/glossary/compliance-framework.md) and ZKB compliance mapping, and evidence-based risk scoring with confidence intervals.

## Overview

Security assessment as a discipline evolved from manual, periodic audits conducted by specialized consultants into a continuous, automated practice driven by the expanding attack surface of modern organizations. The shift from perimeter-based to zero-trust architectures, the explosion of cloud services, and the proliferation of APIs and microservices have made traditional point-in-time assessments insufficient. Modern security assessment must be continuous, automated, and deeply integrated into the development and operations lifecycle.

The assessment lifecycle follows a structured methodology:

1. **Scope Definition** -- Identifying the boundaries, assets, and systems under evaluation
2. **Asset Discovery** -- Enumerating all components within scope, including shadow IT and unknown assets
3. **Vulnerability Identification** -- Scanning for known vulnerabilities, misconfigurations, and weaknesses
4. **Risk Analysis** -- Evaluating the likelihood and impact of exploitation for each finding
5. **Compliance Mapping** -- Comparing current state against applicable regulatory and standards requirements
6. **Reporting and Prioritization** -- Producing actionable, prioritized recommendations
7. **Remediation Tracking** -- Monitoring fix progress and verifying resolution
8. **Continuous Monitoring** -- Ongoing assessment to detect drift and new exposures

The Prismatic Platform implements this full lifecycle through its [EASM](@/glossary/easm.md) capabilities, the [Color Team](@/glossary/blue-team.md) security architecture, and the [quality gate](@/glossary/quality-gate.md) enforcement pipeline that treats security findings with the same [zero tolerance](@/glossary/zero-tolerance.md) as code quality violations.

## Technical Details

### Assessment Methodologies

Security assessments employ multiple complementary methodologies, each providing different perspectives on the security posture:

**Black-Box Assessment** examines systems from an external attacker's perspective without internal knowledge. This maps to the Prismatic Perimeter's external scanning capabilities, where the system discovers and evaluates the publicly exposed [attack surface](@/glossary/attack-surface.md) of a target domain.

**White-Box Assessment** leverages full internal access to source code, configurations, and architecture documentation. In Prismatic, this corresponds to [static analysis](@/glossary/static-analysis.md) via [Credo](@/glossary/credo.md) and [Dialyzer](@/glossary/dialyzer.md), which have complete visibility into the codebase.

**Gray-Box Assessment** combines elements of both, simulating an attacker with partial internal knowledge. The platform's Gray Team agents perform this function within the [Color Team](@/glossary/adversarial-architecture.md) framework, exploring specification boundaries and edge cases with controlled internal access.

### Scoring and Rating Systems

Security assessments produce quantitative scores that enable comparison across time periods, organizations, and industry sectors:

| Rating System | Scale | Use Case |
|---------------|-------|----------|
| **CVSS** | 0.0--10.0 | Individual vulnerability severity |
| **Prismatic Security Rating** | A--F (300--900) | Overall organizational posture |
| **NIST CSF Maturity** | Tiers 1--4 | Framework implementation maturity |
| **ISO 27001 Compliance** | Percentage | Standards compliance level |

The Prismatic Security Rating system synthesizes findings across multiple domains -- network exposure, certificate hygiene, patch cadence, DNS configuration, email security, and application vulnerabilities -- into a single composite score that enables rapid decision-making while preserving the granularity needed for targeted remediation.

### Automated Discovery Pipeline

Modern security assessment relies on automated asset discovery to maintain accurate scope. The discovery pipeline processes:

- **DNS Records** -- A, AAAA, CNAME, MX, TXT, NS, SOA, SRV records
- **Certificate Transparency Logs** -- Subdomain enumeration from CT log entries
- **IP Range Scanning** -- Port and service enumeration across discovered IP ranges
- **Cloud Resource Detection** -- S3 buckets, Azure blobs, GCP storage, serverless endpoints
- **API Surface Mapping** -- REST, GraphQL, and WebSocket endpoint discovery

## Implementation in Prismatic Platform

The Prismatic Platform implements security assessment as a first-class capability through the Perimeter application and the broader quality enforcement infrastructure.

### Perimeter Security Assessment Engine

```elixir
defmodule PrismaticPerimeter.SecurityAssessment do
  @moduledoc """
  Orchestrates comprehensive security assessments for target domains.

  Coordinates asset discovery, vulnerability scanning, compliance mapping,
  and security rating calculation through a pipeline architecture that
  ensures complete coverage and evidence-based scoring.
  """

  alias PrismaticPerimeter.{AssetDiscovery, VulnerabilityScanner, ComplianceMapper, RatingEngine}

  @type assessment_opts :: [
    scope: :full | :quick | :compliance_only,
    frameworks: [atom()],
    confidence_threshold: float(),
    parallel_workers: pos_integer()
  ]

  @type assessment_result :: %{
    domain: String.t(),
    rating: %{grade: atom(), score: non_neg_integer(), percentile: non_neg_integer()},
    assets: [AssetDiscovery.asset()],
    vulnerabilities: [VulnerabilityScanner.finding()],
    compliance: %{atom() => ComplianceMapper.assessment()},
    metadata: %{started_at: DateTime.t(), completed_at: DateTime.t(), confidence: float()}
  }

  @spec assess(String.t(), assessment_opts()) :: {:ok, assessment_result()} | {:error, term()}
  def assess(domain, opts \\ []) do
    scope = Keyword.get(opts, :scope, :full)
    frameworks = Keyword.get(opts, :frameworks, [:nis2, :zkb])
    confidence_threshold = Keyword.get(opts, :confidence_threshold, 0.80)

    with {:ok, assets} <- AssetDiscovery.discover(domain, scope: scope),
         {:ok, vulns} <- VulnerabilityScanner.scan(assets, parallel: true),
         {:ok, compliance} <- ComplianceMapper.map(assets, vulns, frameworks),
         {:ok, rating} <- RatingEngine.calculate(domain, assets, vulns, compliance) do
      result = %{
        domain: domain,
        rating: rating,
        assets: assets,
        vulnerabilities: vulns,
        compliance: compliance,
        metadata: build_metadata(confidence_threshold)
      }

      if result.metadata.confidence >= confidence_threshold do
        {:ok, result}
      else
        {:error, {:low_confidence, result.metadata.confidence, confidence_threshold}}
      end
    end
  end

  @spec assess_compliance(String.t(), [atom()]) :: {:ok, map()} | {:error, term()}
  def assess_compliance(domain, frameworks) do
    assess(domain, scope: :compliance_only, frameworks: frameworks)
  end

  @spec quick_scan(String.t()) :: {:ok, assessment_result()} | {:error, term()}
  def quick_scan(domain) do
    assess(domain, scope: :quick, confidence_threshold: 0.60)
  end

  defp build_metadata(threshold) do
    %{
      started_at: DateTime.utc_now(),
      completed_at: nil,
      confidence: 0.0,
      confidence_threshold: threshold
    }
  end
end
```

### Security Rating Calculation

The rating engine aggregates findings across multiple assessment domains, each weighted according to its contribution to overall security posture:

```elixir
defmodule PrismaticPerimeter.RatingEngine do
  @moduledoc """
  Calculates composite security ratings from assessment findings.

  Implements a weighted multi-domain scoring model that produces
  both a numeric score (300-900) and a letter grade (A-F) with
  industry percentile positioning.
  """

  @type rating :: %{
    grade: :A | :B | :C | :D | :F,
    score: 300..900,
    industry_percentile: 0..100,
    domain_scores: %{atom() => float()},
    confidence: float()
  }

  @domain_weights %{
    network_security: 0.20,
    application_security: 0.20,
    dns_health: 0.10,
    certificate_hygiene: 0.15,
    email_security: 0.10,
    patch_cadence: 0.15,
    information_disclosure: 0.10
  }

  @grade_thresholds [
    {:A, 810},
    {:B, 720},
    {:C, 630},
    {:D, 540},
    {:F, 300}
  ]

  @spec calculate(String.t(), list(), list(), map()) :: {:ok, rating()} | {:error, term()}
  def calculate(domain, assets, vulnerabilities, compliance) do
    domain_scores =
      @domain_weights
      |> Map.keys()
      |> Map.new(fn domain_key ->
        score = score_domain(domain_key, assets, vulnerabilities, compliance)
        {domain_key, score}
      end)

    weighted_score =
      domain_scores
      |> Enum.reduce(0.0, fn {domain_key, score}, acc ->
        weight = Map.fetch!(@domain_weights, domain_key)
        acc + score * weight
      end)

    numeric_score = round(300 + weighted_score * 600)
    grade = determine_grade(numeric_score)

    {:ok, %{
      grade: grade,
      score: numeric_score,
      industry_percentile: calculate_percentile(numeric_score),
      domain_scores: domain_scores,
      confidence: calculate_confidence(domain_scores)
    }}
  end

  defp determine_grade(score) do
    Enum.find_value(@grade_thresholds, :F, fn {grade, threshold} ->
      if score >= threshold, do: grade
    end)
  end

  defp score_domain(domain_key, assets, vulnerabilities, compliance) do
    # Domain-specific scoring logic normalized to 0.0-1.0
    base_score = 1.0
    penalty = calculate_domain_penalty(domain_key, assets, vulnerabilities)
    max(0.0, base_score - penalty)
  end

  defp calculate_domain_penalty(_domain_key, _assets, vulns) do
    vulns
    |> Enum.map(& &1.severity_weight)
    |> Enum.sum()
    |> min(1.0)
  end

  defp calculate_percentile(score), do: round((score - 300) / 6.0)
  defp calculate_confidence(domain_scores) do
    assessed = Enum.count(domain_scores, fn {_k, v} -> v > 0.0 end)
    assessed / map_size(domain_scores)
  end
end
```

### Integration with Platform Quality Gates

Security assessment findings integrate directly into the platform's [quality gate](@/glossary/quality-gate.md) pipeline. Any critical or high-severity finding blocks deployment through the same enforcement mechanism used for [code quality](@/glossary/code-quality.md) violations:

```elixir
defmodule PrismaticPerimeter.QualityIntegration do
  @moduledoc """
  Bridges security assessment results into the platform quality gate pipeline.
  """

  @spec check_security_gate(String.t()) :: :pass | {:fail, [map()]}
  def check_security_gate(domain) do
    case PrismaticPerimeter.SecurityAssessment.assess(domain) do
      {:ok, %{rating: %{grade: grade}}} when grade in [:A, :B] ->
        :pass

      {:ok, %{rating: %{grade: grade}, vulnerabilities: vulns}} ->
        critical_findings = Enum.filter(vulns, &(&1.severity in [:critical, :high]))
        {:fail, critical_findings}

      {:error, reason} ->
        {:fail, [%{type: :assessment_error, reason: reason}]}
    end
  end
end
```

## Comparison with Alternatives

| Solution | Approach | Strengths | Limitations |
|----------|----------|-----------|-------------|
| **Prismatic Security Assessment** | Integrated EASM + code analysis + compliance | Unified pipeline, evidence-based ratings, continuous | Platform-specific, requires Prismatic ecosystem |
| **BitSight** | External rating service | Industry standard, broad coverage, third-party validation | Black-box only, no code-level insight, vendor lock-in |
| **SecurityScorecard** | External monitoring platform | Comprehensive metrics, supply chain risk | Expensive, limited customization, no internal integration |
| **Qualys VMDR** | Vulnerability management | Deep vulnerability scanning, compliance modules | Agent-based, complex deployment, network-focused |
| **Nessus/Tenable** | Vulnerability scanning | Extensive plugin library, industry standard | Scan-focused, limited assessment context, manual correlation |
| **OWASP ZAP** | Web application scanning | Free, comprehensive web testing, automation | Web-only, requires manual configuration, no rating system |
| **Manual Pen Test** | Human-driven assessment | Deep analysis, creative attack paths, context awareness | Expensive, point-in-time, limited scale, inconsistent |

The Prismatic approach differentiates by combining external attack surface assessment with internal [static analysis](@/glossary/static-analysis.md), [quality gate](@/glossary/quality-gate.md) enforcement, and [color team](@/glossary/blue-team.md) adversarial validation into a single unified assessment pipeline. This eliminates the gap between security findings and development workflow that plagues external-only assessment tools.

## Best Practices

1. **Continuous over periodic** -- Run assessments continuously rather than quarterly. The Prismatic Perimeter performs ongoing monitoring with configurable scan intervals, ensuring that new exposures are detected within hours rather than months.

2. **Evidence-based scoring** -- Every rating and finding must trace back to specific, verifiable evidence. The platform's [NABLA infinity](@/glossary/quality-evidence-truth.md) framework requires provenance for all security claims, preventing false positives from propagating into decision-making.

3. **Scope completeness** -- Include shadow IT, third-party integrations, and supply chain components in assessment scope. Incomplete scope produces false confidence -- the most dangerous assessment outcome.

4. **Risk-based prioritization** -- Not all findings are equal. Prioritize remediation by exploitability, exposure, and business impact rather than raw CVSS scores. A medium-severity finding on an internet-facing production system outranks a critical finding on an isolated test environment.

5. **Compliance integration** -- Map findings directly to applicable regulatory frameworks ([NIS2](@/glossary/compliance-framework.md), ZKB, ISO 27001, SOC 2) to ensure assessment work serves both security improvement and compliance objectives simultaneously.

6. **Automate remediation verification** -- After fixes are applied, automatically re-assess to confirm resolution. The platform's [pre-commit hooks](@/glossary/pre-commit-hooks.md) and quality gates provide this verification for code-level security findings.

7. **Maintain assessment history** -- Track rating trends over time to measure security program effectiveness. Point-in-time ratings are useful; rating trajectories are powerful.

8. **Calibrate confidence levels** -- Report confidence alongside findings. A high-confidence medium finding is more actionable than a low-confidence critical finding.

## Common Pitfalls

1. **Scope blindness** -- Assessing only known assets while the real attack surface includes forgotten subdomains, test environments, and third-party services. The Prismatic asset discovery pipeline addresses this through DNS enumeration, certificate transparency log analysis, and cloud resource scanning.

2. **Checkbox compliance** -- Treating assessment as a compliance exercise rather than a security improvement tool. Meeting the minimum requirements of a framework does not mean the organization is secure. The [no-mercy-no-doubts](@/glossary/no-mercy-no-doubts.md) doctrine rejects this mentality explicitly.

3. **Alert fatigue** -- Generating thousands of findings without prioritization overwhelms remediation teams and leads to critical issues being buried in noise. The rating engine's weighted scoring ensures that the most impactful findings surface first.

4. **Point-in-time myopia** -- A quarterly assessment is stale within weeks. Continuous assessment is essential in environments where infrastructure changes daily.

5. **Ignoring context** -- Applying the same assessment criteria to all systems regardless of their exposure, sensitivity, and criticality. A public-facing payment API requires fundamentally different assessment rigor than an internal documentation wiki.

6. **Over-reliance on automation** -- Automated scanners excel at finding known vulnerability patterns but miss business logic flaws, design weaknesses, and novel attack vectors. The [Color Team](@/glossary/adversarial-simulation.md) architecture supplements automated assessment with structured adversarial analysis.

7. **Assessment without remediation** -- Identifying problems without fixing them provides no security benefit and may increase legal liability. Every assessment finding must have an assigned owner, a remediation timeline, and a verification plan.

## Use Cases

### External Attack Surface Management

An organization deploys Prismatic Perimeter to continuously assess its external attack surface. The system discovers 847 assets across 23 subdomains, identifies 12 expired certificates, 3 services running outdated TLS configurations, and 2 DNS misconfigurations enabling zone transfer. The composite security rating of C (score: 645) triggers automatic remediation workflows that bring the rating to B within 72 hours.

### Regulatory Compliance Assessment

A Czech financial institution uses the compliance mapping module to assess its posture against both NIS2 Directive (EU 2022/2555) and Czech ZKB 264/2025 Sb. requirements. The assessment identifies 14 compliance gaps, maps each to specific regulatory articles, and generates prioritized remediation recommendations with estimated effort and risk reduction per fix.

### Supply Chain Security

A procurement team evaluates potential vendors by running external security assessments against their domains. The rating system provides standardized, comparable scores that supplement traditional questionnaire-based vendor assessment, reducing evaluation time from weeks to hours while providing more objective, evidence-based risk data.

### Development Pipeline Integration

The platform integrates security assessment into the CI/CD pipeline. Every deployment to production triggers a quick security scan that verifies no new critical exposures have been introduced. Failed assessments block deployment through the same [quality gate](@/glossary/quality-gate.md) mechanism that blocks code quality violations, ensuring security is treated as a non-negotiable build requirement.

### Incident Response Prioritization

Following a disclosed vulnerability (e.g., a new CVE affecting a commonly used library), the security assessment pipeline immediately re-evaluates all monitored assets to identify affected systems. The rating impact is calculated before manual triage begins, allowing the incident response team to prioritize their investigation based on actual exposure rather than theoretical risk.

## Related Concepts

- [Security Rating](@/glossary/security-rating.md) -- Quantitative scoring system (A-F, 300-900) produced by security assessments to enable comparison and trend analysis
- [Vulnerability Assessment](@/glossary/vulnerability-assessment.md) -- Focused identification and classification of specific technical vulnerabilities within systems
- [Attack Surface](@/glossary/attack-surface.md) -- The total set of points where an attacker can attempt to enter or extract data from a system
- [EASM](@/glossary/easm.md) -- External Attack Surface Management, the continuous discovery and assessment of externally exposed assets
- [Penetration Testing](@/glossary/penetration-testing.md) -- Active exploitation attempts that validate assessment findings and test defensive controls
- [Compliance Framework](@/glossary/compliance-framework.md) -- Regulatory and standards requirements (NIS2, ZKB, ISO 27001, SOC 2) that assessments evaluate against
- [Security Audit](@/glossary/security-audit.md) -- Formal examination of security controls against defined standards, often a subset of broader assessment
- [Audit Trail](@/glossary/audit-trail.md) -- Immutable record of security events and assessment findings for accountability and forensics
- [Quality Gate](@/glossary/quality-gate.md) -- Enforcement checkpoints that block progression when security or quality thresholds are not met
- [No Mercy No Doubts](@/glossary/no-mercy-no-doubts.md) -- Platform doctrine that mandates zero tolerance for security violations and incomplete assessments
- [Static Analysis](@/glossary/static-analysis.md) -- Code-level security assessment performed without execution, complementing external assessment
- [Security Operations](@/glossary/security-operations.md) -- Ongoing operational security functions that consume and act on assessment outputs

## See Also

- [Prismatic Perimeter documentation](@/apps/prismatic-perimeter.md) -- Full EASM implementation guide
- [Color Team Security Operations](/architecture/color-teams/) -- Adversarial-defensive security architecture
- [Quality Gate Pipeline](/architecture/quality-gates/) -- How security findings integrate with quality enforcement
- [OWASP Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/) -- Industry-standard web assessment methodology
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework) -- Federal framework for security assessment and improvement
- [NIS2 Directive (EU 2022/2555)](https://eur-lex.europa.eu/eli/dir/2022/2555) -- EU network and information security requirements

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
