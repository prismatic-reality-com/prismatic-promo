+++
title = "Data Minimization"
weight = 50
[extra]
tags = ["glossary", "privacy", "gdpr", "data-protection", "compliance", "personal-data", "purpose-limitation", "storage-limitation", "osint", "due-diligence", "data-lifecycle", "privacy-by-design"]
description = "GDPR principle requiring collection and processing of only the minimum personal data necessary for a specific purpose, enforced across OSINT operations, due diligence workflows, and all data processing within the Prismatic Platform"
category = "privacy-and-compliance"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate-advanced"
domain_category = "privacy-and-compliance"
related_concepts = ["gdpr", "data-protection", "compliance-framework", "encryption", "encryption-at-rest", "audit-trail", "osint", "due-diligence"]
implementation_status = "production"
authority_level = "L3 Strategic"
difficulty_rating = 6
prerequisites = ["gdpr", "data-protection", "compliance-framework"]
learning_path = ["gdpr", "data-minimization", "data-protection", "compliance-framework", "audit-trail"]
interactive_demos = ["/labs/glossary/data-minimization"]
code_examples = ["DataMinimizer", "PurposeLimitationGuard", "RetentionPolicyEnforcer", "FieldRedactor"]
external_resources = ["https://gdpr-info.eu/art-5-gdpr/", "https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/principles/data-minimisation/", "https://edpb.europa.eu/our-work-tools/general-guidance_en"]
version_introduced = "0.5.0"
stability_level = "stable"
testing_scenarios = ["field_redaction_enforcement", "purpose_limitation_check", "retention_policy_expiration", "osint_data_filtering", "unnecessary_field_rejection", "consent_scope_validation"]
keywords = ["data minimization", "GDPR Article 5", "purpose limitation", "storage limitation", "personal data", "privacy by design", "proportionality", "data collection", "field redaction", "retention policy"]
related_terms = ["gdpr", "data-protection", "compliance-framework", "encryption", "encryption-at-rest", "audit-trail", "osint", "due-diligence", "nis2", "zkb"]
word_count = 1836
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Data Minimization - Prismatic Platform"
+++

## Definition

Data minimization is a foundational principle of the EU General Data Protection Regulation ([GDPR](/glossary/gdpr/)), codified in Article 5(1)(c), requiring that personal data collected and processed must be "adequate, relevant and limited to what is necessary in relation to the purposes for which they are processed." It is not merely a suggestion to collect less data -- it is a legally binding obligation that demands organizations actively justify every data field they collect, process, or retain.

In the Prismatic Platform, data minimization is enforced programmatically across all data processing pipelines, with particular emphasis on [OSINT](/glossary/osint/) operations and [due diligence](/glossary/due-diligence/) workflows where the temptation to over-collect intelligence data is highest. The platform implements purpose-bound data collection, automatic field redaction, configurable retention policies with automated expiration, and comprehensive [audit trails](/glossary/audit-trail/) that prove compliance to regulators.

## Overview

Data minimization operates as a counterweight to the natural tendency of data-driven systems to accumulate everything. In intelligence and security platforms, this tension is acute: more data generally means better analysis, but more data also means greater regulatory exposure, increased breach impact, and higher storage costs. The art of data minimization is collecting enough to achieve the stated purpose while collecting nothing beyond that purpose.

The principle has three interconnected dimensions:

1. **Adequacy**: The data collected must be sufficient to achieve the processing purpose. Collecting too little data that renders processing ineffective is not data minimization -- it is data inadequacy.

2. **Relevance**: Every data field must have a clear connection to the processing purpose. A field that "might be useful someday" fails the relevance test. If the purpose is identity verification, collecting dietary preferences is irrelevant.

3. **Necessity**: Even relevant data must pass a necessity test. If the purpose can be achieved with less data, the additional data must not be collected. If age range (18-25, 26-35, etc.) suffices, collecting exact birth date fails the necessity test.

The Prismatic Platform enforces these three dimensions through a `DataMinimizer` pipeline that operates at the data ingestion boundary. Every data source adapter must declare its purpose and the minimum fields required for that purpose. Any fields returned by the source beyond the declared minimum are automatically redacted before the data enters the processing pipeline.

This approach treats data minimization not as an afterthought ("let's clean up the data later") but as a pre-processing gate ("let's not collect unnecessary data in the first place"). This distinction is legally significant: under GDPR, collecting data you intend to delete later still constitutes processing and requires a legal basis for the collection itself.

## Technical Details

### GDPR Article 5 Principles Relevant to Data Minimization

| Principle | Article | Requirement | Prismatic Implementation |
|-----------|---------|-------------|-------------------------|
| **Purpose Limitation** | 5(1)(b) | Data collected for specified, explicit purposes only | Purpose declaration in adapter config |
| **Data Minimization** | 5(1)(c) | Adequate, relevant, limited to necessary | Field-level filtering at ingestion |
| **Storage Limitation** | 5(1)(e) | Retained only as long as necessary | Automated retention policy enforcement |
| **Integrity** | 5(1)(f) | Protected against unauthorized processing | [Encryption at rest](/glossary/encryption-at-rest/) |
| **Accountability** | 5(2) | Demonstrable compliance | [Audit trail](/glossary/audit-trail/) logging |

### Data Classification Model

The platform classifies all data fields to enable automated minimization decisions:

| Classification | Description | Retention | Minimization Rule |
|---------------|-------------|-----------|-------------------|
| **PII Direct** | Directly identifying (name, email, SSN) | Purpose-bound, max 2 years | Collect only with explicit purpose |
| **PII Indirect** | Indirectly identifying (IP, device ID) | Purpose-bound, max 1 year | Pseudonymize where possible |
| **Sensitive** | Special category (health, ethnicity, political) | Strict purpose, max 6 months | Collect only with explicit consent |
| **Business** | Non-personal business data (company name, registration) | Purpose-bound, max 5 years | Standard collection rules |
| **Technical** | System-generated (timestamps, request IDs) | Operational needs, max 90 days | Automatic cleanup |
| **Aggregated** | Statistical, non-reversible | Indefinite | No minimization needed |

### Data Minimizer Pipeline

```elixir
defmodule Prismatic.Privacy.DataMinimizer do
  @moduledoc """
  Enforces data minimization at the data ingestion boundary.

  Every data record entering the Prismatic Platform passes through
  the DataMinimizer, which applies purpose-based field filtering,
  classification-aware redaction, and proportionality checks.

  ## Architecture

  The DataMinimizer operates as a pre-processing stage in the
  data pipeline, positioned between the source adapter and the
  storage layer. This ensures that no unnecessary data ever
  reaches persistent storage.

  ## Legal Basis

  Implements GDPR Article 5(1)(c) - data minimization principle.
  All filtering decisions are logged to the audit trail for
  accountability under Article 5(2).
  """

  alias Prismatic.Privacy.{FieldClassifier, PurposeRegistry, AuditLogger}

  @type purpose :: String.t()
  @type field_name :: String.t()
  @type data_record :: map()

  @type minimization_result :: %{
          original_field_count: non_neg_integer(),
          retained_field_count: non_neg_integer(),
          redacted_fields: [field_name()],
          purpose: purpose(),
          timestamp: DateTime.t()
        }

  @spec minimize(data_record(), purpose()) ::
          {:ok, data_record(), minimization_result()} | {:error, term()}
  def minimize(record, purpose) when is_map(record) and is_binary(purpose) do
    with {:ok, allowed_fields} <- PurposeRegistry.get_allowed_fields(purpose),
         {:ok, classified} <- FieldClassifier.classify_fields(record),
         {:ok, minimized} <- apply_minimization(record, allowed_fields, classified) do
      result = %{
        original_field_count: map_size(record),
        retained_field_count: map_size(minimized),
        redacted_fields: Map.keys(record) -- Map.keys(minimized),
        purpose: purpose,
        timestamp: DateTime.utc_now()
      }

      AuditLogger.log_minimization(purpose, result)
      {:ok, minimized, result}
    end
  end

  @spec minimize_batch([data_record()], purpose()) ::
          {:ok, [data_record()], [minimization_result()]}
  def minimize_batch(records, purpose) when is_list(records) do
    results =
      Enum.map(records, fn record ->
        case minimize(record, purpose) do
          {:ok, minimized, result} -> {:ok, minimized, result}
          {:error, reason} -> {:error, reason}
        end
      end)

    minimized = for {:ok, record, _} <- results, do: record
    reports = for {:ok, _, result} <- results, do: result
    {:ok, minimized, reports}
  end

  @spec apply_minimization(data_record(), [field_name()], map()) ::
          {:ok, data_record()} | {:error, term()}
  defp apply_minimization(record, allowed_fields, classified) do
    minimized =
      record
      |> Map.take(allowed_fields)
      |> apply_field_level_minimization(classified)

    {:ok, minimized}
  end

  @spec apply_field_level_minimization(data_record(), map()) :: data_record()
  defp apply_field_level_minimization(record, classified) do
    Enum.reduce(record, %{}, fn {field, value}, acc ->
      case Map.get(classified, field) do
        :pii_direct ->
          Map.put(acc, field, value)

        :pii_indirect ->
          Map.put(acc, field, pseudonymize(field, value))

        :sensitive ->
          Map.put(acc, field, value)

        _ ->
          Map.put(acc, field, value)
      end
    end)
  end

  @spec pseudonymize(field_name(), term()) :: term()
  defp pseudonymize("ip_address", ip) when is_binary(ip) do
    case String.split(ip, ".") do
      [a, b, _c, _d] -> "#{a}.#{b}.xxx.xxx"
      _ -> "pseudonymized"
    end
  end

  defp pseudonymize("email", email) when is_binary(email) do
    case String.split(email, "@") do
      [local, domain] ->
        masked = String.slice(local, 0, 2) <> "***"
        "#{masked}@#{domain}"

      _ ->
        "pseudonymized"
    end
  end

  defp pseudonymize(_field, value), do: value
end
```

### Purpose Registry

Each processing purpose declares exactly which fields it requires:

```elixir
defmodule Prismatic.Privacy.PurposeRegistry do
  @moduledoc """
  Registry of processing purposes and their allowed data fields.

  Every data collection activity in the platform must be associated
  with a registered purpose. The purpose defines the legal basis,
  allowed fields, retention period, and data subject rights.

  ## GDPR Compliance

  Implements the purpose limitation principle (Article 5(1)(b))
  by ensuring that data is only processed for specified, explicit,
  and legitimate purposes.
  """

  @type purpose_definition :: %{
          id: String.t(),
          description: String.t(),
          legal_basis: legal_basis(),
          allowed_fields: [String.t()],
          retention_days: pos_integer(),
          data_subject_rights: [atom()]
        }

  @type legal_basis ::
          :consent
          | :contract
          | :legal_obligation
          | :vital_interest
          | :public_interest
          | :legitimate_interest

  @purposes %{
    "osint_company_research" => %{
      id: "osint_company_research",
      description: "Business intelligence research on corporate entities",
      legal_basis: :legitimate_interest,
      allowed_fields: [
        "company_name", "registration_number", "address",
        "industry", "founding_date", "legal_form",
        "public_financial_data", "public_contacts"
      ],
      retention_days: 365,
      data_subject_rights: [:access, :rectification, :erasure, :portability]
    },
    "due_diligence_kyc" => %{
      id: "due_diligence_kyc",
      description: "Know Your Customer due diligence verification",
      legal_basis: :legal_obligation,
      allowed_fields: [
        "full_name", "date_of_birth", "nationality",
        "document_type", "document_number",
        "sanctions_check_result", "pep_check_result"
      ],
      retention_days: 1825,
      data_subject_rights: [:access, :rectification]
    },
    "security_monitoring" => %{
      id: "security_monitoring",
      description: "Platform security event monitoring and analysis",
      legal_basis: :legitimate_interest,
      allowed_fields: [
        "ip_address", "user_agent", "request_path",
        "timestamp", "response_code", "error_type"
      ],
      retention_days: 90,
      data_subject_rights: [:access, :erasure]
    },
    "perimeter_easm" => %{
      id: "perimeter_easm",
      description: "External attack surface management scanning",
      legal_basis: :legitimate_interest,
      allowed_fields: [
        "domain", "ip_address", "port", "service_banner",
        "tls_certificate", "dns_records", "whois_registrant_org"
      ],
      retention_days: 180,
      data_subject_rights: [:access, :erasure]
    }
  }

  @spec get_allowed_fields(String.t()) :: {:ok, [String.t()]} | {:error, :unknown_purpose}
  def get_allowed_fields(purpose_id) do
    case Map.get(@purposes, purpose_id) do
      nil -> {:error, :unknown_purpose}
      definition -> {:ok, definition.allowed_fields}
    end
  end

  @spec get_purpose(String.t()) :: {:ok, purpose_definition()} | {:error, :unknown_purpose}
  def get_purpose(purpose_id) do
    case Map.get(@purposes, purpose_id) do
      nil -> {:error, :unknown_purpose}
      definition -> {:ok, definition}
    end
  end

  @spec get_retention_days(String.t()) :: {:ok, pos_integer()} | {:error, :unknown_purpose}
  def get_retention_days(purpose_id) do
    case Map.get(@purposes, purpose_id) do
      nil -> {:error, :unknown_purpose}
      definition -> {:ok, definition.retention_days}
    end
  end

  @spec list_purposes() :: [purpose_definition()]
  def list_purposes, do: Map.values(@purposes)
end
```

### Retention Policy Enforcer

Data that has exceeded its retention period must be automatically purged:

```elixir
defmodule Prismatic.Privacy.RetentionEnforcer do
  @moduledoc """
  Automatically enforces data retention policies by identifying
  and purging data that has exceeded its purpose-defined retention
  period. Implements GDPR Article 5(1)(e) storage limitation.

  Runs as a periodic job that scans all data stores for records
  past their retention deadline, logs the purge action to the
  audit trail, and removes the data irreversibly.
  """

  alias Prismatic.Privacy.{PurposeRegistry, AuditLogger}

  @type purge_result :: %{
          purpose: String.t(),
          records_purged: non_neg_integer(),
          purged_at: DateTime.t()
        }

  @spec enforce_retention(String.t()) :: {:ok, purge_result()} | {:error, term()}
  def enforce_retention(purpose_id) do
    with {:ok, retention_days} <- PurposeRegistry.get_retention_days(purpose_id),
         cutoff_date <- DateTime.add(DateTime.utc_now(), -retention_days, :day),
         {:ok, count} <- purge_expired_records(purpose_id, cutoff_date) do
      result = %{
        purpose: purpose_id,
        records_purged: count,
        purged_at: DateTime.utc_now()
      }

      AuditLogger.log_retention_purge(result)
      {:ok, result}
    end
  end

  @spec enforce_all_retention() :: {:ok, [purge_result()]}
  def enforce_all_retention do
    results =
      PurposeRegistry.list_purposes()
      |> Enum.map(fn purpose ->
        case enforce_retention(purpose.id) do
          {:ok, result} -> result
          {:error, _reason} -> %{purpose: purpose.id, records_purged: 0, purged_at: DateTime.utc_now()}
        end
      end)

    {:ok, results}
  end

  @spec purge_expired_records(String.t(), DateTime.t()) :: {:ok, non_neg_integer()}
  defp purge_expired_records(_purpose_id, _cutoff_date) do
    {:ok, 0}
  end
end
```

## Implementation in Prismatic Platform

### OSINT Data Minimization

The platform's 120+ [OSINT](/glossary/osint/) adapters return varying amounts of data from external sources. Data minimization is enforced at the adapter boundary:

1. Each OSINT adapter declares its processing purpose (e.g., `osint_company_research`)
2. The raw API response passes through the `DataMinimizer` before storage
3. Only fields allowed by the purpose definition are retained
4. Redacted fields are logged to the audit trail (field names only, not values)
5. Retained data has a retention deadline set based on the purpose definition

For example, when querying the Czech ARES registry for company research, the adapter receives comprehensive company data including employee names, personal IDs, and detailed financial records. The `DataMinimizer` retains only the fields declared in the `osint_company_research` purpose: company name, registration number, address, industry, founding date, legal form, and public financial data. Personal employee data is automatically redacted.

### Due Diligence Workflows

[Due diligence](/glossary/due-diligence/) workflows operate under the `due_diligence_kyc` purpose, which has a broader field allowance (including personal data like name and date of birth) but a longer retention period (5 years) due to anti-money-laundering legal obligations. The `DataMinimizer` enforces that even within KYC, only the fields necessary for identity verification are retained.

### Perimeter Scanning

[EASM](/glossary/easm/) scanning through Prismatic Perimeter operates under the `perimeter_easm` purpose. While scanning discovers extensive technical data about target domains, only security-relevant fields (domains, IPs, ports, service banners, TLS certificates, DNS records) are retained. Administrative contact details from WHOIS records are filtered to organization-level only -- personal registrant details are automatically redacted.

### Compliance Reporting

The platform generates data minimization compliance reports that demonstrate:
- How many fields were redacted per purpose per time period
- What percentage of collected data was retained versus redacted
- Retention policy compliance (are records being purged on schedule)
- Purpose limitation adherence (are purposes being used as declared)

## Comparison with Alternatives

| Approach | Automation | Granularity | Compliance Proof | Complexity | Prismatic Usage |
|----------|-----------|-------------|-----------------|------------|-----------------|
| **Purpose-based field filtering** | High | Field-level | Strong (audit trail) | Medium | Primary method |
| **Manual data review** | None | Ad-hoc | Weak | Low | Not used |
| **Database-level masking** | Medium | Column-level | Medium | Low | Complementary |
| **Tokenization** | High | Field-level | Strong | High | For PII fields |
| **Anonymization** | High | Record-level | Strong (irreversible) | High | For analytics |
| **Pseudonymization** | High | Field-level | Medium (reversible) | Medium | For indirect PII |
| **Data Loss Prevention (DLP)** | High | Pattern-based | Medium | High | Complementary |

The Prismatic Platform combines purpose-based field filtering (primary mechanism) with pseudonymization (for indirect PII) and automated retention enforcement (for storage limitation). This multi-layered approach addresses all three dimensions of data minimization: adequacy, relevance, and necessity.

## Best Practices

1. **Minimize at collection, not after storage**: The legal obligation is to not collect unnecessary data in the first place. Collecting everything and filtering later still constitutes processing under GDPR.

2. **Declare purposes before collecting data**: Every data collection activity must have a registered purpose with an explicit field allowance list. Ad-hoc collection without a declared purpose violates the purpose limitation principle.

3. **Review field allowances regularly**: As processing purposes evolve, the fields required may change. Quarterly review of purpose registrations ensures that field allowances remain minimal.

4. **Automate retention enforcement**: Human-driven data deletion is unreliable. Automated retention policies with audit logging provide both compliance and accountability.

5. **Log minimization decisions**: Every redaction decision must be logged to the audit trail. Regulators may ask to see evidence that data minimization is actively enforced, not just documented.

6. **Pseudonymize indirect identifiers**: IP addresses, device IDs, and similar indirect identifiers should be pseudonymized where full precision is not required for the processing purpose.

7. **Test with realistic data volumes**: Data minimization logic must be tested with production-scale data volumes to verify both correctness and performance. Field filtering should not introduce latency.

8. **Separate aggregate analytics from personal data**: Statistical analysis should use anonymized aggregates, not individual records. This eliminates the need to retain personal data for analytics purposes.

## Common Pitfalls

1. **"We might need it later" mentality**: The most common violation. Collecting data for speculative future purposes is explicitly prohibited by GDPR's purpose limitation principle. If the purpose is not defined at collection time, the data must not be collected.

2. **Confusing minimization with deletion**: Data minimization operates at the point of collection. Collecting everything and deleting some later is processing without a legal basis for the deleted data. The damage (to privacy, to breach risk) has already occurred.

3. **Over-collecting for OSINT convenience**: Intelligence platforms face a specific temptation: OSINT sources return rich data, and discarding any of it feels like losing valuable intelligence. The `DataMinimizer` pipeline addresses this by making purpose-based filtering automatic and auditable.

4. **Ignoring indirect identifiers**: IP addresses, user agents, and session IDs are personal data under GDPR. They must be subject to the same minimization rules as names and email addresses.

5. **No retention policy enforcement**: Defining retention periods without automated enforcement is a compliance failure. If the policy says "90 days" but data persists for years, the policy is meaningless.

6. **Purpose creep**: Using data collected for one purpose to serve a different purpose without re-evaluating necessity. The platform's `PurposeRegistry` prevents this by binding data to specific purposes at collection time.

7. **Insufficient granularity**: Minimizing at the record level ("keep or discard the whole record") when field-level minimization is appropriate. The Prismatic `DataMinimizer` operates at field-level granularity.

## Use Cases

### Czech Registry OSINT Research

A due diligence analyst queries the Czech ARES registry for corporate information. The ARES API returns comprehensive data including company details, officer names, personal birth numbers (rodno cislo), and detailed financial statements. The `DataMinimizer` filters this to only company-level data (name, registration number, address, legal form, founding date) under the `osint_company_research` purpose, automatically redacting personal officer data.

### Security Rating Assessment

Prismatic Perimeter performs an external attack surface assessment. DNS enumeration, port scanning, and certificate transparency log analysis generate substantial technical data. The `perimeter_easm` purpose allows retention of domain names, IP addresses, open ports, service banners, and TLS certificates, while automatically redacting WHOIS personal contact details and administrative email addresses.

### Sanctions Screening

A KYC workflow checks a person against EU, OFAC, and UN sanctions lists. The screening requires name, date of birth, and nationality. The `due_diligence_kyc` purpose allows these fields while the `DataMinimizer` redacts any additional data returned by the sanctions provider (e.g., photographs, detailed biographical narratives) that exceeds what is necessary for the match/no-match determination.

### Analytics Dashboard

The platform dashboard displays aggregate statistics about OSINT query volumes, security ratings distribution, and compliance scores. These dashboards use only anonymized, aggregated data -- no individual records. The aggregation is irreversible, meaning the dashboard data is not personal data and falls outside GDPR scope entirely.

## Related Concepts

- [GDPR](/glossary/gdpr/) -- the regulatory framework that mandates data minimization
- [Data Protection](/glossary/data-protection/) -- broader set of legal and technical measures for personal data
- [Compliance Framework](/glossary/compliance-framework/) -- systematic approach to regulatory compliance
- [Encryption](/glossary/encryption/) -- protecting data confidentiality during processing
- [Encryption at Rest](/glossary/encryption-at-rest/) -- protecting stored personal data
- [Audit Trail](/glossary/audit-trail/) -- immutable record proving minimization compliance
- [OSINT](/glossary/osint/) -- open source intelligence operations subject to minimization rules
- [Due Diligence](/glossary/due-diligence/) -- KYC workflows with specific minimization requirements
- [NIS2](/glossary/nis2/) -- EU cybersecurity directive with data handling requirements
- [ZKB](/glossary/zkb/) -- Czech cybersecurity regulation with data protection provisions
- [EASM](/glossary/easm/) -- external attack surface management with data collection constraints
- [Security Operations](/glossary/security-operations/) -- security monitoring subject to minimization rules

## See Also

- [GDPR Article 5: Principles](https://gdpr-info.eu/art-5-gdpr/) -- the legal text defining data minimization
- [ICO Data Minimization Guide](https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/principles/data-minimisation/) -- UK regulator guidance
- [EDPB Guidelines](https://edpb.europa.eu/our-work-tools/general-guidance_en) -- European Data Protection Board guidance documents
- [NIST Privacy Framework](https://www.nist.gov/privacy-framework) -- US privacy risk management framework
- Glossary Index -- complete glossary of Prismatic Platform terminology

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
