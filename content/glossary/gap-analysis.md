+++
title = "Gap Analysis"
description = "A systematic assessment methodology that identifies deficits between current capabilities and desired target state, applied to security posture, compliance readiness, and skill development."
weight = 50

[extra]
category = "security"
tags = ["gap-analysis", "assessment", "compliance", "security", "nis2", "maturity", "risk", "remediation", "baseline", "target-state"]
date_created = "2026-02-23"
date_updated = "2026-02-23"
difficulty = "intermediate"
audience = ["security-engineers", "compliance-officers", "architects", "managers"]
related_terms = ["risk-assessment", "compliance", "maturity-model", "nis2", "security-rating", "remediation"]
key_concepts = ["current-state-assessment", "target-state-definition", "gap-identification", "remediation-planning", "prioritization"]
platforms = ["prismatic-perimeter", "prismatic-platform", "beam"]
prerequisites = ["security-frameworks", "compliance-basics", "risk-management"]
use_cases = ["compliance-assessment", "security-posture-review", "skill-assessment", "maturity-evaluation", "remediation-planning"]
complexity = "medium"
stability = "mature"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1000
date_modified = "2026-02-23"
keywords = ["Gap Analysis", "assessment", "compliance", "security", "glossary", "Prismatic Platform"]
quality_score = 78
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Gap Analysis - Prismatic Platform"
+++

## Definition and Overview

Gap analysis is a structured assessment methodology that compares an organization's current state against a defined target state to identify deficiencies (gaps) that require remediation. In cybersecurity, gap analysis is used to assess security posture against frameworks (NIST CSF, ISO 27001, CIS Controls), regulatory requirements (NIS2, GDPR, SOC 2), and industry benchmarks. In skill development, it identifies competency gaps between current team capabilities and required proficiency levels.

The methodology follows a systematic process: define the target state (what controls, capabilities, or skills should be in place), assess the current state (what actually exists today), identify gaps (the delta between target and current), prioritize gaps by risk and impact, and develop a remediation plan with timelines and resource requirements. The output is typically a matrix or heatmap showing compliance/maturity levels across assessment domains with clear visibility into areas requiring attention.

Gap analysis is foundational to security program management because it transforms abstract compliance requirements into concrete, actionable work items. Rather than attempting to implement every possible security control simultaneously, gap analysis enables risk-based prioritization -- addressing the most critical gaps first while accepting managed risk in lower-priority areas. This pragmatic approach is particularly important for organizations subject to the EU NIS2 Directive, which requires demonstrable progress toward compliance rather than instantaneous perfection.

## Technical Deep Dive

### Gap Analysis Framework

| Phase | Activities | Deliverable |
|-------|-----------|-------------|
| **Scope Definition** | Define assessment boundaries, select framework | Scope document |
| **Target State** | Map framework requirements to organization context | Target maturity matrix |
| **Current State** | Assess existing controls, capabilities, processes | Current state assessment |
| **Gap Identification** | Compare current vs target for each domain | Gap register |
| **Risk Assessment** | Rate gaps by likelihood and impact | Prioritized risk register |
| **Remediation Planning** | Define actions, owners, timelines, resources | Remediation roadmap |
| **Validation** | Verify gap closure, reassess periodically | Compliance evidence |

### Maturity Levels (Typical 5-Level Scale)

| Level | Name | Description | Compliance Implication |
|-------|------|-------------|----------------------|
| **0** | Non-existent | No controls or processes | Critical gap |
| **1** | Initial | Ad-hoc, reactive, undocumented | Major gap |
| **2** | Developing | Partially implemented, inconsistent | Moderate gap |
| **3** | Defined | Documented, standardized, repeatable | Minor gap or compliant |
| **4** | Managed | Measured, monitored, continuously improved | Compliant |
| **5** | Optimized | Automated, predictive, industry-leading | Exceeds requirements |

### NIS2 Gap Analysis Domains

| Domain | Key Requirements | Assessment Areas |
|--------|-----------------|-----------------|
| **Risk Management** | Risk analysis, security policies | Risk methodology, policy currency, review cycle |
| **Incident Handling** | Detection, response, reporting | CSIRT capability, 24/72h reporting, escalation procedures |
| **Business Continuity** | Backup, disaster recovery, crisis management | RTO/RPO targets, tested DR plans, crisis communication |
| **Supply Chain** | Supplier security assessment | Vendor risk management, contractual security requirements |
| **Network Security** | Vulnerability handling, disclosure | Patching cadence, vulnerability scanning, responsible disclosure |
| **Cryptography** | Encryption policies | Data-at-rest, data-in-transit, key management |
| **Access Control** | Authentication, authorization | MFA, RBAC, privileged access management |
| **Asset Management** | Asset inventory, classification | Complete inventory, classification scheme, ownership |

## Architecture and Implementation

Gap analysis automation in the Prismatic Platform leverages the Perimeter module's security rating engine to assess external attack surface gaps and the compliance assessment engine for regulatory gap identification. The architecture consists of a framework definition layer (encoding compliance requirements as structured data), an evidence collection layer (gathering assessment data from automated scans and manual inputs), and an analysis engine that computes gap scores and generates remediation recommendations.

The evidence collection layer integrates with multiple data sources: vulnerability scanners provide technical control evidence, configuration management databases provide asset inventory evidence, access management systems provide authentication/authorization evidence, and OSINT tools provide external perspective evidence. This multi-source approach ensures that gap assessments are grounded in objective, verifiable data rather than subjective self-assessments.

## Usage in Prismatic Platform

The Prismatic Perimeter module includes automated gap analysis for security ratings and NIS2 compliance assessment.

```elixir
defmodule PrismaticPerimeter.GapAnalysis do
  @moduledoc """
  Automated gap analysis engine for security posture
  and compliance assessment. Compares current security
  state against target frameworks and generates
  prioritized remediation recommendations.
  """

  @type maturity_level :: 0..5
  @type gap :: %{
    domain: String.t(),
    control: String.t(),
    current_level: maturity_level(),
    target_level: maturity_level(),
    gap_severity: :critical | :major | :moderate | :minor | :none,
    remediation: String.t(),
    effort: :low | :medium | :high,
    priority: pos_integer()
  }

  @spec assess(String.t(), atom()) :: {:ok, list(gap())} | {:error, term()}
  def assess(domain, framework \\ :nis2) do
    requirements = load_framework_requirements(framework)
    current_state = collect_evidence(domain)

    gaps =
      requirements
      |> Enum.map(fn req ->
        current = assess_control(current_state, req)
        target = req.target_level

        %{
          domain: req.domain,
          control: req.control_id,
          current_level: current,
          target_level: target,
          gap_severity: classify_gap(target - current),
          remediation: req.remediation_guidance,
          effort: estimate_effort(current, target),
          priority: calculate_priority(req.risk_weight, target - current)
        }
      end)
      |> Enum.filter(fn gap -> gap.current_level < gap.target_level end)
      |> Enum.sort_by(& &1.priority)

    {:ok, gaps}
  end

  @spec compliance_score(list(gap())) :: float()
  def compliance_score(gaps) do
    total_controls = length(gaps)
    if total_controls == 0, do: 100.0, else:
      compliant = Enum.count(gaps, fn g -> g.gap_severity == :none end)
      compliant / total_controls * 100.0
  end

  defp classify_gap(delta) when delta <= 0, do: :none
  defp classify_gap(1), do: :minor
  defp classify_gap(2), do: :moderate
  defp classify_gap(3), do: :major
  defp classify_gap(_), do: :critical

  defp estimate_effort(current, target) when target - current <= 1, do: :low
  defp estimate_effort(current, target) when target - current <= 2, do: :medium
  defp estimate_effort(_current, _target), do: :high

  defp calculate_priority(risk_weight, gap_size), do: risk_weight * gap_size

  defp load_framework_requirements(_framework), do: []
  defp collect_evidence(_domain), do: %{}
  defp assess_control(_state, _req), do: 2
end
```

The Perimeter dashboard at `/perimeter/compliance` displays gap analysis results as interactive heatmaps, enabling security teams to quickly identify the most critical gaps and track remediation progress over time.

## Cross-References

- [Security Rating](@/glossary/security-rating.md) -- Quantified security posture assessment
- [NIS2](@/glossary/nis2.md) -- EU directive requiring gap analysis
- [Compliance](@/glossary/compliance.md) -- Regulatory compliance frameworks
- [CSIRT](@/glossary/csirt.md) -- Incident handling gap assessment
- **Livebooks**: `security_compliance/` notebooks include interactive gap analysis
- **Academy**: ComplianceAutomationFramework topic covers gap analysis methodology

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
