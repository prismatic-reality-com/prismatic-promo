+++
title = "Compliance"
weight = 50
[extra]
description = "The state of conformance with regulatory requirements, industry standards, and organizational policies, including NIS2 Directive, GDPR, and Czech ZKB 264/2025"
category = "governance"
related_terms = ["certification", "consent", "audit-trail", "compliance-framework", "credential"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["compliance", "NIS2", "GDPR", "ZKB", "regulatory", "governance", "audit", "glossary", "Prismatic Platform"]
tags = ["glossary", "governance", "compliance"]
quality_score = 82
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Compliance - Prismatic Platform"
+++

## Definition & Overview

Compliance is the verified state of conformance with applicable regulatory requirements, industry standards, and organizational policies. In the cybersecurity and data protection domain, compliance encompasses a complex landscape of overlapping regulations that organizations must simultaneously satisfy. Key frameworks include the EU's NIS2 Directive (EU 2022/2555) for cybersecurity, GDPR (EU 2016/679) for data protection, the Czech ZKB 264/2025 Sb. for national cybersecurity, and industry standards like ISO 27001, SOC 2, and PCI DSS.

Compliance is not a binary state but a spectrum. An organization may be fully compliant with one regulation while partially compliant with another, or compliant at a point in time but drifting due to configuration changes. Effective compliance management requires continuous monitoring, evidence collection, and remediation -- not periodic audits that provide only snapshot assessments.

The Prismatic Platform addresses compliance from two perspectives. Internally, the platform enforces its own compliance standards through the NO MERCY doctrine, Quality Floor Guardian, and 11-phase pre-commit pipeline. Externally, the Perimeter EASM module assesses organizational compliance posture against NIS2 and ZKB requirements, producing compliance reports as part of the security rating system. The platform treats compliance as a data-driven, automatable process rather than a manual documentation exercise.

## Technical Deep Dive

### Regulatory Landscape

| Regulation | Jurisdiction | Focus | Key Requirements |
|-----------|-------------|-------|-----------------|
| **NIS2** (EU 2022/2555) | EU | Cybersecurity | Risk management, incident reporting, supply chain security |
| **GDPR** (EU 2016/679) | EU | Data protection | Consent, data rights, breach notification, DPO |
| **ZKB** (264/2025 Sb.) | Czech Republic | Cybersecurity | National implementation of NIS2 + local requirements |
| **ISO 27001** | International | ISMS | Risk assessment, controls, continuous improvement |
| **SOC 2 Type II** | US/International | Service controls | Security, availability, processing integrity, confidentiality, privacy |

### Compliance Assessment Engine

```elixir
defmodule PrismaticPerimeter.ComplianceEngine do
  @moduledoc """
  Assesses organizational compliance posture against multiple
  regulatory frameworks. Produces evidence-based compliance
  reports with gap analysis and remediation recommendations.
  """

  @type compliance_report :: %{
    target: String.t(),
    framework: atom(),
    overall_score: float(),
    article_assessments: [article_assessment()],
    gaps: [compliance_gap()],
    evidence: [evidence_item()],
    assessed_at: DateTime.t()
  }

  @type article_assessment :: %{
    article_id: String.t(),
    title: String.t(),
    status: :compliant | :partial | :non_compliant | :not_assessed,
    score: float(),
    evidence_count: non_neg_integer()
  }

  @type compliance_gap :: %{
    article_id: String.t(),
    description: String.t(),
    severity: :critical | :high | :medium | :low,
    remediation: String.t()
  }

  @type evidence_item :: %{
    source: String.t(),
    type: atom(),
    finding: String.t(),
    confidence: float(),
    collected_at: DateTime.t()
  }

  @spec assess(String.t(), atom()) :: {:ok, compliance_report()}
  def assess(target, framework) do
    articles = get_framework_articles(framework)
    evidence = collect_evidence(target)

    article_assessments = Enum.map(articles, fn article ->
      assess_article(article, evidence)
    end)

    gaps = article_assessments
    |> Enum.filter(&(&1.status in [:partial, :non_compliant]))
    |> Enum.map(&build_gap/1)

    overall = calculate_overall_score(article_assessments)

    {:ok, %{
      target: target,
      framework: framework,
      overall_score: overall,
      article_assessments: article_assessments,
      gaps: gaps,
      evidence: evidence,
      assessed_at: DateTime.utc_now()
    }}
  end

  defp assess_article(article, evidence) do
    relevant = Enum.filter(evidence, fn e ->
      e.type in article.evidence_types
    end)

    status = cond do
      length(relevant) == 0 -> :not_assessed
      Enum.all?(relevant, &(&1.confidence >= 0.8)) -> :compliant
      Enum.any?(relevant, &(&1.confidence >= 0.5)) -> :partial
      true -> :non_compliant
    end

    %{
      article_id: article.id,
      title: article.title,
      status: status,
      score: status_to_score(status),
      evidence_count: length(relevant)
    }
  end

  defp status_to_score(:compliant), do: 1.0
  defp status_to_score(:partial), do: 0.5
  defp status_to_score(:non_compliant), do: 0.0
  defp status_to_score(:not_assessed), do: 0.0

  defp calculate_overall_score(assessments) do
    scores = Enum.map(assessments, & &1.score)
    if length(scores) > 0, do: Enum.sum(scores) / length(scores) * 100, else: 0.0
  end

  defp get_framework_articles(_framework), do: []
  defp collect_evidence(_target), do: []
  defp build_gap(assessment), do: %{article_id: assessment.article_id, description: "", severity: :medium, remediation: ""}
end
```

### NIS2 Article Mapping

| NIS2 Article | Requirement | Prismatic Assessment Method |
|-------------|-------------|---------------------------|
| Art. 21(1) | Risk management measures | Security rating + policy detection |
| Art. 21(2)(a) | Risk analysis policies | DNS, TLS, header analysis |
| Art. 21(2)(b) | Incident handling | Response capability assessment |
| Art. 21(2)(c) | Business continuity | Backup, DR evidence |
| Art. 21(2)(d) | Supply chain security | Third-party risk assessment |
| Art. 21(2)(e) | Network security | Port scanning, vulnerability detection |
| Art. 21(2)(h) | Cryptography | Cipher suite + certificate analysis |
| Art. 21(2)(j) | Multi-factor auth | Authentication mechanism detection |

## Architecture & Implementation

The compliance engine integrates with the Perimeter EASM module's broader security rating system. When assessing a target organization, the engine collects evidence from multiple sources: DNS configuration analysis, TLS certificate inspection, HTTP security header evaluation, email security (SPF/DKIM/DMARC) verification, and known vulnerability correlation. Each evidence item maps to one or more compliance articles, building a comprehensive compliance picture from externally observable signals.

The engine supports multiple frameworks simultaneously. A single assessment scan can produce compliance reports for NIS2, ZKB, and GDPR concurrently, since the underlying evidence collection is framework-agnostic. The framework-specific logic maps evidence to articles and calculates compliance scores according to each framework's requirements.

The compliance dashboard at `/perimeter/compliance` renders assessment results as interactive compliance matrices, showing article-by-article compliance status with drill-down capabilities for evidence inspection. Gap analysis highlights the highest-priority remediation items, and exportable reports support audit documentation requirements.

## Usage in Prismatic Platform

The Perimeter module's security rating (A-F grade, 300-900 numeric score) incorporates compliance assessment as a major scoring component. Organizations with verified NIS2 compliance receive higher security ratings than those with compliance gaps, reflecting the correlation between regulatory compliance and security posture.

OSINT investigations leverage compliance data as a due diligence signal. When assessing a potential business partner or acquisition target, the DD pipeline can include a compliance assessment alongside financial and legal research, providing a holistic risk picture. Compliance gaps discovered during OSINT investigations are flagged as risk indicators in the DD entity records.

The platform's internal compliance is enforced through the pre-commit pipeline, Quality Floor Guardian, and Session Discipline Protocol. These mechanisms ensure that every code change, every session, and every deployment meets the platform's own stringent compliance standards -- practicing what the Perimeter module preaches to external organizations.

## Cross-References

- [Certification](/glossary/certification/) - credentials validating compliance
- **Consent** - GDPR data processing requirement
- [Audit Trail](/glossary/audit-trail/) - compliance evidence mechanism
- [Compliance Framework](/glossary/compliance-framework/) - regulatory structure detail
- **Credential** - compliance certification artifacts
- **Livebooks**: `livebooks/domains/security_compliance/` - compliance assessment labs
- **Perimeter**: NIS2 and ZKB compliance engine at `/perimeter/compliance`

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
