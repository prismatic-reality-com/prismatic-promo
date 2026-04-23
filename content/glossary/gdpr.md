+++
title = "GDPR"
weight = 60
[extra]
category = "security"
description = "EU General Data Protection Regulation governing personal data processing, privacy rights, and data protection obligations for organizations worldwide"
acronym = "GDPR"
full_name = "General Data Protection Regulation"
status = "active"
priority = "critical"
difficulty = "advanced"
audience = ["security-engineers", "compliance-officers", "backend-engineers", "architects", "legal"]
tags = ["privacy", "data-protection", "compliance", "eu-regulation", "gdpr", "personal-data", "consent", "encryption"]
related_terms = ["compliance-framework", "encryption-at-rest", "tls", "nis2", "security-rating", "hawkeye", "iso-27001"]
platforms = ["eu", "eea", "global"]
regulation_id = "EU 2016/679"
effective_date = "2018-05-25"
use_cases = ["data-subject-rights", "breach-notification", "impact-assessment", "consent-management", "data-retention"]
standards = ["iso-27001", "iso-27701", "soc2", "nis2"]
tools = ["guardian", "ecto", "jason", "comeonin"]
date_created = "2026-02-22"
date_updated = "2026-02-22"
version = "2.0.0"
license = "GHL"
author = "Tomáš Korcak"
reading_time = "10 min"
word_count = 1988
date_modified = "2026-02-23"
keywords = ["GDPR", "General", "Data", "Protection", "Regulation", "glossary", "security", "Prismatic Platform", "Consent", "Article"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "GDPR - Prismatic Platform"
+++

## Definition and Overview

The General Data Protection Regulation (GDPR, Regulation EU 2016/679) is the European Union's comprehensive data protection law that governs how organizations collect, process, store, and transfer personal data of individuals located in the EU and European Economic Area (EEA). Enacted on May 25, 2018, GDPR establishes a unified legal framework for data protection across all EU member states, replacing the patchwork of national data protection laws that previously existed under the 1995 Data Protection Directive.

GDPR fundamentally restructured the relationship between organizations and individuals regarding personal data. It grants data subjects extensive rights including the right to access their data, the right to erasure ("right to be forgotten"), the right to data portability, and the right to object to automated decision-making. For organizations, it mandates data protection by design and by default, requires lawful bases for all processing activities, imposes mandatory data breach notification within 72 hours, and establishes significant penalties for non-compliance -- up to 4% of annual global turnover or 20 million EUR, whichever is greater.

The regulation applies extraterritorially: any organization processing personal data of EU residents must comply, regardless of where the organization is located. This global reach has made GDPR the de facto standard for data protection worldwide, with many countries adopting similar legislation (Brazil's LGPD, California's CCPA/CPRA, Japan's APPI amendments, South Korea's PIPA, and others). For software platforms like the Prismatic Platform, GDPR compliance is not optional -- it is a foundational architectural requirement that influences data modeling, storage decisions, access control patterns, and operational procedures.

## Core Principles

GDPR is built on seven fundamental principles (Article 5) that govern all personal data processing. These principles are not abstract guidelines -- they are legally binding requirements with direct technical implications for system architecture and implementation.

| Principle | Description | Technical Implication |
|-----------|-------------|----------------------|
| **Lawfulness, Fairness, Transparency** | Processing must have a legal basis and be transparent to data subjects | Consent management, privacy notices, processing records |
| **Purpose Limitation** | Data collected for specified purposes cannot be repurposed | Purpose tags on data fields, access controls per purpose |
| **Data Minimization** | Only data necessary for the purpose may be collected | Schema design, field-level collection controls |
| **Accuracy** | Data must be kept accurate and up to date | Validation pipelines, correction mechanisms |
| **Storage Limitation** | Data must not be kept longer than necessary | Retention policies, automated deletion schedules |
| **Integrity and Confidentiality** | Appropriate security measures must protect data | [Encryption at rest](/glossary/encryption-at-rest/), access controls, audit logging |
| **Accountability** | Controllers must demonstrate compliance | Documentation, impact assessments, DPO appointment |

Each principle translates into concrete engineering requirements. Data minimization means that database schemas should not include fields that are not strictly necessary for the declared processing purpose. Storage limitation means that every data table must have a defined retention period and automated deletion mechanism. Accountability means that every processing operation must produce an audit trail demonstrating compliance.

## Lawful Bases for Processing

Processing personal data requires at least one lawful basis (Article 6). The choice of lawful basis has significant implications for both user experience and system architecture.

| Lawful Basis | When Applicable | Example | Implementation Impact |
|-------------|-----------------|---------|----------------------|
| **Consent** | Data subject gives specific, informed, unambiguous consent | Cookie consent, marketing opt-in | Consent management system, withdrawal mechanism |
| **Contract** | Processing necessary for contract performance | Order fulfillment, service delivery | Link processing to contract lifecycle |
| **Legal Obligation** | Processing required by law | Tax reporting, employment records | Document legal basis per jurisdiction |
| **Vital Interests** | Processing necessary to protect someone's life | Emergency medical situations | Rarely applicable in software systems |
| **Public Interest** | Processing necessary for public interest tasks | Government services, public health | Scope carefully to specific tasks |
| **Legitimate Interests** | Processing necessary for legitimate interests (balanced against rights) | Fraud prevention, network security | Document balancing test, offer opt-out |

Choosing the correct lawful basis is a critical design decision. Consent is often used as a default, but it introduces operational complexity because consent must be freely given, specific, informed, and withdrawable at any time. For security-related processing (such as OSINT operations), legitimate interests is typically more appropriate, provided the balancing test is documented and data subject rights are respected.

## Data Subject Rights

GDPR establishes eight rights that data subjects can exercise against data controllers. Each right requires specific technical capabilities in the system architecture.

```elixir
defmodule Prismatic.Privacy.DataSubjectRights do
  @moduledoc """
  Handles GDPR data subject right requests across all storage backends.
  Each right has a maximum response time of 30 days (Article 12).
  Requests are tracked with immutable audit trails for accountability.
  """

  @max_response_days 30

  @type right :: :access | :erasure | :portability | :rectification |
                 :restriction | :objection | :automated_decisions | :information

  @spec handle_request(right(), String.t(), map()) ::
          {:ok, map()} | {:error, term()}
  def handle_request(:access, subject_id, _opts) do
    # Article 15: Right of Access
    with {:ok, data} <- collect_all_data(subject_id),
         {:ok, processing_info} <- get_processing_purposes(subject_id) do
      {:ok, %{
        personal_data: data,
        purposes: processing_info.purposes,
        categories: processing_info.categories,
        recipients: processing_info.recipients,
        retention_period: processing_info.retention,
        source: processing_info.source,
        automated_decisions: processing_info.automated_decisions,
        request_timestamp: DateTime.utc_now(),
        deadline: DateTime.add(DateTime.utc_now(), @max_response_days, :day)
      }}
    end
  end

  def handle_request(:erasure, subject_id, _opts) do
    # Article 17: Right to Erasure ("Right to be Forgotten")
    with :ok <- verify_erasure_eligibility(subject_id),
         {:ok, deleted_count} <- delete_all_data(subject_id),
         :ok <- notify_processors(subject_id, :erasure),
         :ok <- audit_log(:erasure, subject_id, deleted_count) do
      {:ok, %{deleted_records: deleted_count, timestamp: DateTime.utc_now()}}
    end
  end

  def handle_request(:portability, subject_id, opts) do
    # Article 20: Right to Data Portability
    format = Map.get(opts, :format, :json)

    with {:ok, data} <- collect_portable_data(subject_id),
         {:ok, exported} <- export_in_format(data, format) do
      {:ok, %{data: exported, format: format, timestamp: DateTime.utc_now()}}
    end
  end

  def handle_request(:rectification, subject_id, opts) do
    # Article 16: Right to Rectification
    corrections = Map.fetch!(opts, :corrections)

    with {:ok, _updated} <- apply_corrections(subject_id, corrections),
         :ok <- audit_log(:rectification, subject_id, corrections) do
      {:ok, %{corrected_fields: Map.keys(corrections), timestamp: DateTime.utc_now()}}
    end
  end

  def handle_request(:restriction, subject_id, opts) do
    # Article 18: Right to Restriction of Processing
    reason = Map.fetch!(opts, :reason)

    with :ok <- apply_processing_restriction(subject_id, reason),
         :ok <- audit_log(:restriction, subject_id, reason) do
      {:ok, %{restricted: true, reason: reason, timestamp: DateTime.utc_now()}}
    end
  end

  defp collect_all_data(_id), do: {:ok, %{}}
  defp get_processing_purposes(_id), do: {:ok, %{purposes: [], categories: [], recipients: [], retention: nil, source: nil, automated_decisions: false}}
  defp verify_erasure_eligibility(_id), do: :ok
  defp delete_all_data(_id), do: {:ok, 0}
  defp notify_processors(_id, _action), do: :ok
  defp collect_portable_data(_id), do: {:ok, %{}}
  defp export_in_format(data, _format), do: {:ok, data}
  defp apply_corrections(_id, _corrections), do: {:ok, %{}}
  defp apply_processing_restriction(_id, _reason), do: :ok
  defp audit_log(_action, _id, _details), do: :ok
end
```

## Data Protection Impact Assessment

Article 35 requires a Data Protection Impact Assessment (DPIA) for processing likely to result in high risk to individuals. This includes large-scale processing of special categories (health data, biometric data, racial or ethnic origin), systematic monitoring of public areas, and automated decision-making with legal effects.

A DPIA must contain: a systematic description of the processing operations, assessment of necessity and proportionality, assessment of risks to data subjects, and measures to address those risks. For the Prismatic Platform, DPIAs are required for the HAWKEYE visitor intelligence system, any OSINT operations that may involve personal data, and the security rating system if it processes data about identifiable individuals.

## Architecture and Implementation

GDPR compliance is implemented as a cross-cutting architectural concern rather than a bolt-on feature. The platform follows the principle of "data protection by design and by default" (Article 25).

**Data Classification**: All data fields are classified by sensitivity level (public, internal, confidential, personal, special category). This classification drives encryption, access control, retention, and audit logging decisions throughout the data lifecycle.

**Purpose Binding**: Processing operations are tagged with their lawful basis and purpose. Data collected for one purpose cannot be accessed for a different purpose without establishing a new lawful basis. This is enforced at the storage adapter level.

**Retention Management**: Automated retention policies enforce storage limitation. Data past its retention period is automatically scheduled for deletion, with audit trails documenting the deletion.

```
Data Ingestion ──> Classification ──> Purpose Binding ──> Storage
                        |                   |                |
                   Sensitivity          Lawful Basis     Encryption
                   Tagging             Recording        at Rest
                        |                   |                |
                        v                   v                v
                   Access Control      Audit Logging    Retention
                   (field-level)       (immutable)      Scheduling
```

**Encryption Strategy**: Personal data is encrypted at rest using AES-256 and in transit using [TLS](/glossary/tls/) 1.3. Field-level encryption is applied to special category data (Article 9), ensuring that even database administrators cannot access sensitive fields without explicit authorization.

**Breach Detection and Notification**: The platform monitors for data breach indicators and can initiate the 72-hour notification process required by Article 33. Breach detection integrates with the Blue Team's defensive monitoring capabilities and the [security rating](/glossary/security-rating/) system.

## Prismatic Perimeter Compliance Assessment

The EASM module evaluates whether discovered organizations demonstrate GDPR-aligned data protection practices. This assessment contributes to the A-F security rating.

```elixir
defmodule PrismaticPerimeter.Compliance.GDPR do
  @moduledoc """
  Evaluates external organizations for observable GDPR
  compliance indicators as part of security ratings.
  Checks are non-invasive and based on publicly available information.
  """

  @spec assess(String.t()) :: {:ok, map()} | {:error, term()}
  def assess(domain) do
    checks = [
      check_privacy_policy(domain),
      check_cookie_consent(domain),
      check_ssl_certificate(domain),
      check_data_collection_forms(domain),
      check_dpo_contact(domain),
      check_international_transfers(domain),
      check_breach_history(domain)
    ]

    score = calculate_compliance_score(checks)

    {:ok, %{
      domain: domain,
      gdpr_score: score,
      checks: checks,
      grade: score_to_grade(score),
      assessed_at: DateTime.utc_now()
    }}
  end

  defp check_privacy_policy(_domain) do
    %{check: :privacy_policy, status: :present, weight: 20,
      description: "Accessible privacy policy page with required GDPR disclosures"}
  end

  defp check_cookie_consent(_domain) do
    %{check: :cookie_consent, status: :compliant, weight: 15,
      description: "GDPR-compliant cookie consent with granular controls"}
  end

  defp check_ssl_certificate(_domain) do
    %{check: :ssl_certificate, status: :valid, weight: 15,
      description: "Valid SSL/TLS certificate for data in transit protection"}
  end

  defp check_data_collection_forms(_domain) do
    %{check: :data_collection, status: :compliant, weight: 15,
      description: "Forms with consent checkboxes and purpose declaration"}
  end

  defp check_dpo_contact(_domain) do
    %{check: :dpo_contact, status: :present, weight: 10,
      description: "Data Protection Officer contact information"}
  end

  defp check_international_transfers(_domain) do
    %{check: :international_transfers, status: :documented, weight: 15,
      description: "International data transfer mechanisms documented"}
  end

  defp check_breach_history(_domain) do
    %{check: :breach_history, status: :clean, weight: 10,
      description: "No known unresolved data breaches"}
  end

  defp calculate_compliance_score(checks) do
    checks
    |> Enum.filter(&(&1.status in [:present, :compliant, :valid, :documented, :clean]))
    |> Enum.reduce(0, fn check, acc -> acc + check.weight end)
  end

  defp score_to_grade(score) when score >= 90, do: :A
  defp score_to_grade(score) when score >= 75, do: :B
  defp score_to_grade(score) when score >= 60, do: :C
  defp score_to_grade(score) when score >= 40, do: :D
  defp score_to_grade(_score), do: :F
end
```

## Usage in Prismatic Platform

The Prismatic Platform implements GDPR compliance at multiple architectural levels, treating data protection as a first-class architectural concern rather than an afterthought.

**OSINT Data Boundaries**: Intelligence gathering operations process only publicly available information. Personal data encountered during OSINT operations is classified immediately, and processing is limited to purposes with established lawful bases (typically legitimate interests in security research). Data minimization ensures only information relevant to the intelligence objective is retained.

**Platform-Internal Data Management**: The platform's own data handling follows GDPR principles with data minimization (collecting only what is necessary), purpose limitation (processing only for declared purposes), and [encryption at rest](/glossary/encryption-at-rest/) for any stored personal data.

**Visitor Intelligence (HAWKEYE)**: The HAWKEYE system implements privacy-by-design architecture with data minimization, anonymization where possible, and configurable retention controls that comply with GDPR storage limitation requirements.

**Audit Logging**: All data processing operations are logged with immutable audit trails that can be presented to supervisory authorities on request. The [structured logging](/glossary/structured-logging/) infrastructure ensures that audit entries include full provenance metadata.

**Cross-Border Data Transfers**: When OSINT operations involve data sources in multiple jurisdictions, the platform tracks data provenance and ensures that appropriate transfer mechanisms (Standard Contractual Clauses, adequacy decisions) are in place.

## International Data Protection Landscape

GDPR's influence has catalyzed a global wave of data protection legislation. Understanding the broader landscape is essential for platforms operating internationally.

| Regulation | Jurisdiction | Key Similarity to GDPR | Key Difference |
|-----------|-------------|----------------------|----------------|
| **LGPD** | Brazil | Rights-based, consent model, DPO requirement | Different legal bases, smaller penalties |
| **CCPA/CPRA** | California, USA | Right to know, delete, opt-out | Opt-out model vs GDPR opt-in |
| **PIPA** | South Korea | Consent-based, cross-border controls | Stricter consent requirements |
| **APPI** | Japan | Adequacy decision with EU | Different enforcement structure |
| **PDPA** | Thailand | Similar principles and rights | Newer, evolving enforcement |
| **[NIS2](/glossary/nis2/)** | EU | Complementary security directive | Focuses on network/information security |

## Best Practices

**Data Mapping**: Maintain a comprehensive data map documenting what personal data is collected, where it is stored, how it flows through the system, who has access, and what the lawful basis for processing is. This map is the foundation of all GDPR compliance activities.

**Privacy by Default**: Configure systems to the most privacy-protective settings by default. Users should opt in to less protective settings, not opt out of invasive ones.

**Record Processing Activities**: Maintain Article 30 records of processing activities documenting all processing operations, purposes, data categories, recipients, and transfers. These records must be available to supervisory authorities on request.

**Conduct DPIAs for High-Risk Processing**: Before deploying new processing operations that involve profiling, large-scale monitoring, or special category data, conduct a Data Protection Impact Assessment and document risk mitigation measures.

**Train Development Teams**: GDPR compliance is not just a legal concern -- it requires developers to understand privacy principles and implement them in code. Regular training ensures privacy considerations are embedded in development practices.

**Implement Data Subject Request Workflows**: Build automated workflows for handling access, erasure, portability, and rectification requests within the 30-day response deadline. Track request status and generate compliance reports.

**Regular Access Reviews**: Implement periodic reviews of who has access to personal data and whether that access is still necessary. Remove access that is no longer justified, following the principle of least privilege enforced through [RBAC](/glossary/rbac/).

## Common Pitfalls

**Consent as Default Lawful Basis**: Using consent for all processing when legitimate interests or contractual necessity would be more appropriate. Consent must be freely given and withdrawable, which creates operational complexity. Use the most appropriate lawful basis for each processing activity.

**Dark Patterns in Consent**: Designing consent interfaces that nudge users toward consent through confusing layouts, pre-checked boxes, or ambiguous language. Supervisory authorities actively enforce against these practices and have issued significant fines.

**Incomplete Data Subject Responses**: Failing to search all storage backends when responding to access requests. Personal data may reside in databases, logs, backups, caches, [ETS tables](/glossary/ets-table/), and third-party systems. All sources must be included.

**Ignoring Data Processor Obligations**: When using third-party services that process personal data, failing to establish Data Processing Agreements (Article 28) with appropriate security guarantees and audit rights.

**Retention Without Review**: Setting retention periods at system design time and never reviewing them. Business needs and legal requirements change; retention policies should be reviewed annually.

**Security-Only Focus**: Treating GDPR as purely a security standard. GDPR's requirements extend far beyond security to include transparency, purpose limitation, data minimization, and individual rights -- areas that security controls alone cannot address.

**Backup Complications**: Failing to account for personal data in backups when handling erasure requests. If personal data exists in backups, the retention schedule for backups must be documented, and data must be erased when the backup expires.

## Enforcement and Penalties

GDPR enforcement is carried out by Data Protection Authorities (DPAs) in each EU member state. Penalties are structured in two tiers depending on the nature and severity of the violation.

| Tier | Maximum Penalty | Applicable Violations |
|------|----------------|----------------------|
| **Lower** | 2% of global turnover or 10M EUR | Record-keeping failures, DPO violations, notification failures |
| **Upper** | 4% of global turnover or 20M EUR | Principles violations, rights violations, international transfer violations |

Notable enforcement actions have established precedent: Amazon (746M EUR, 2021), Meta/WhatsApp (225M EUR, 2021), Google (50M EUR, 2019). These fines demonstrate that enforcement is real, substantial, and applies to organizations of all sizes.

## Related Concepts

- [Compliance Framework](/glossary/compliance-framework/) - Regulatory framework category including GDPR
- [Encryption at Rest](/glossary/encryption-at-rest/) - Technical control satisfying GDPR data protection requirements
- [NIS2](/glossary/nis2/) - Complementary EU directive for network and information security
- [TLS](/glossary/tls/) - Transport encryption protecting personal data in transit
- [ISO 27001](/glossary/iso-27001/) - Information security standard supporting GDPR compliance
- [Security Rating](/glossary/security-rating/) - External assessment incorporating GDPR compliance indicators
- [HAWKEYE](/glossary/hawkeye/) - Visitor intelligence system implementing privacy-by-design
- [RBAC](/glossary/rbac/) - Access control model enforcing data access restrictions
- [Structured Logging](/glossary/structured-logging/) - Audit trail infrastructure for compliance documentation
- [ETS Table](/glossary/ets-table/) - In-memory storage that must be included in data subject requests

## See Also

- [Architecture](/architecture/) - Privacy architecture and data protection patterns
- [Technologies](/technologies/) - Security and privacy technology stack
- [Apps](/apps/) - Applications implementing GDPR compliance

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
