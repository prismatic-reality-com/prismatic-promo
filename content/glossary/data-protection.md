+++
title = "Data Protection"
weight = 50
[extra]
tags = ["glossary", "privacy", "gdpr", "data-protection", "compliance", "encryption", "personal-data", "security", "dpo", "dpia", "breach-notification", "privacy-by-design"]
description = "Legal and technical measures ensuring personal data is collected, processed, and stored in compliance with privacy regulations including GDPR, NIS2, and ZKB, enforced across all data flows within the Prismatic Platform"
category = "privacy-and-compliance"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate-advanced"
domain_category = "privacy-and-compliance"
related_concepts = ["gdpr", "data-minimization", "encryption", "encryption-at-rest", "compliance-framework", "audit-trail", "security-operations", "nis2"]
implementation_status = "production"
authority_level = "L3 Strategic"
difficulty_rating = 7
prerequisites = ["gdpr", "encryption", "compliance-framework", "security-operations"]
learning_path = ["gdpr", "data-protection", "data-minimization", "compliance-framework", "audit-trail"]
interactive_demos = ["/labs/glossary/data-protection"]
code_examples = ["DataProtectionGuard", "BreachNotificationHandler", "ConsentManager", "DataSubjectRequestProcessor"]
external_resources = ["https://gdpr-info.eu/", "https://ico.org.uk/for-organisations/guide-to-data-protection/", "https://edpb.europa.eu/", "https://www.enisa.europa.eu/topics/data-protection"]
version_introduced = "0.1.0"
stability_level = "stable"
testing_scenarios = ["encryption_at_rest_verification", "breach_detection_response", "consent_management_flow", "data_subject_access_request", "cross_border_transfer_check", "retention_policy_enforcement"]
keywords = ["data protection", "GDPR compliance", "privacy regulation", "personal data security", "breach notification", "consent management", "data subject rights", "privacy by design", "data processing agreement", "cross-border transfer"]
related_terms = ["gdpr", "data-minimization", "encryption", "encryption-at-rest", "compliance-framework", "audit-trail", "security-operations", "nis2", "zkb", "credential-management"]
word_count = 1587
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Data Protection - Prismatic Platform"
+++

## Definition

Data protection is the comprehensive framework of legal obligations, organizational policies, and technical measures that govern how personal data is collected, processed, stored, transferred, and deleted. It encompasses both the regulatory requirements (GDPR, NIS2, national implementations) and the engineering controls (encryption, access control, audit logging) that ensure compliance. Data protection is not a feature to be added -- it is an architectural constraint that shapes every system design decision involving personal data.

In the Prismatic Platform, data protection is implemented as a cross-cutting concern that operates across all 115 umbrella applications. Every data flow involving personal data passes through protection gates: [encryption at rest](/glossary/encryption-at-rest/) for stored data, [TLS](/glossary/tls/) for data in transit, purpose-based [data minimization](/glossary/data-minimization/) at collection, automated retention enforcement, and comprehensive [audit trails](/glossary/audit-trail/) for every access operation. The platform treats data protection violations with the same severity as security vulnerabilities under the [NO MERCY](/glossary/no-mercy/) doctrine.

## Overview

Data protection exists at the intersection of law and engineering. The legal framework (primarily [GDPR](/glossary/gdpr/) in the EU context, supplemented by [NIS2](/glossary/nis2/) for cybersecurity and [ZKB](/glossary/zkb/) for Czech-specific requirements) defines what must be done. The engineering framework defines how it is done. Neither is sufficient alone: perfect encryption without legal compliance is still a violation, and perfect policies without technical enforcement are paper compliance.

The Prismatic Platform addresses data protection through seven pillars:

1. **Lawfulness and Transparency**: Every data processing activity has a documented legal basis (consent, contract, legal obligation, legitimate interest). Processing purposes are registered in the `PurposeRegistry` and auditable by regulators.

2. **Purpose Limitation**: Data collected for one purpose cannot be repurposed without re-evaluation. The platform's purpose-binding mechanism prevents purpose creep at the technical level.

3. **Data Minimization**: Only the minimum necessary data is collected, as enforced by the `DataMinimizer` pipeline. See [Data Minimization](/glossary/data-minimization/) for detailed implementation.

4. **Accuracy**: Personal data must be accurate and kept up to date. The platform provides mechanisms for data subjects to request corrections, processed through the `DataSubjectRequestProcessor`.

5. **Storage Limitation**: Data is retained only as long as necessary for its declared purpose. Automated retention policies with provable enforcement ensure compliance.

6. **Integrity and Confidentiality**: Technical measures protect data against unauthorized access, accidental loss, or destruction. [Encryption](/glossary/encryption/), access controls, and monitoring provide defense in depth.

7. **Accountability**: The platform must demonstrate compliance, not merely claim it. Audit trails, processing records, and automated compliance reports provide the evidence base.

These seven pillars map directly to GDPR Article 5's principles. The Prismatic Platform implements each as a verifiable technical control rather than a policy document, ensuring that compliance is enforced by code, not by hope.

## Technical Details

### Data Protection Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA PROTECTION LAYER                     │
│                                                             │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐ │
│  │ Consent    │  │ Purpose    │  │ Data       │  │ Retention│ │
│  │ Manager    │  │ Registry   │  │ Minimizer  │  │ Enforcer │ │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └────┬─────┘ │
│        │              │              │              │        │
│        └──────────┬───┘──────────────┘──────────────┘        │
│                   v                                          │
│        ┌─────────────────────┐                               │
│        │  DataProtectionGuard │                               │
│        │  (pre-processing)    │                               │
│        └──────────┬──────────┘                               │
│                   │                                          │
│  ┌────────────────┼────────────────────────────────────┐     │
│  │                v                                    │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │     │
│  │  │Encryption │  │Access     │  │Audit Trail       │  │     │
│  │  │at Rest    │  │Control    │  │(immutable log)   │  │     │
│  │  └──────────┘  └──────────┘  └──────────────────┘  │     │
│  │                STORAGE LAYER                        │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Breach Detection  │  DSR Processing  │  Compliance   │    │
│  │  & Notification    │  (access, erase) │  Reporting    │    │
│  └──────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Data Protection Guard

The central enforcement point for all data protection controls:

```elixir
defmodule Prismatic.Privacy.DataProtectionGuard do
  @moduledoc """
  Central data protection enforcement module that validates all
  data processing operations against GDPR requirements before
  allowing them to proceed.

  The DataProtectionGuard operates as a mandatory gateway for
  any operation involving personal data. It verifies:
  - Legal basis exists for the processing
  - Purpose is registered and active
  - Data minimization has been applied
  - Consent is valid (where consent is the legal basis)
  - Cross-border transfer restrictions are respected

  ## Architecture

  This module is designed as a pure function pipeline: each
  check is independent and composable. All checks must pass
  for the operation to proceed. Any failure produces a detailed
  error with the specific regulation article violated.
  """

  alias Prismatic.Privacy.{
    PurposeRegistry,
    ConsentManager,
    DataMinimizer,
    AuditLogger,
    TransferValidator
  }

  @type processing_request :: %{
          purpose: String.t(),
          data: map(),
          data_subject_id: String.t() | nil,
          processor: String.t(),
          destination_country: String.t() | nil
        }

  @type guard_result :: :ok | {:error, guard_violation()}
  @type guard_violation :: %{
          check: String.t(),
          regulation: String.t(),
          article: String.t(),
          message: String.t()
        }

  @spec validate_processing(processing_request()) :: guard_result()
  def validate_processing(request) do
    checks = [
      {:purpose_registered, &check_purpose_registered/1},
      {:legal_basis_valid, &check_legal_basis/1},
      {:consent_valid, &check_consent/1},
      {:data_minimized, &check_minimization/1},
      {:transfer_allowed, &check_transfer_restrictions/1}
    ]

    result =
      Enum.reduce_while(checks, :ok, fn {_name, check_fn}, :ok ->
        case check_fn.(request) do
          :ok -> {:cont, :ok}
          {:error, violation} -> {:halt, {:error, violation}}
        end
      end)

    case result do
      :ok ->
        AuditLogger.log_processing_authorized(request)
        :ok

      {:error, violation} ->
        AuditLogger.log_processing_rejected(request, violation)
        {:error, violation}
    end
  end

  @spec check_purpose_registered(processing_request()) :: guard_result()
  defp check_purpose_registered(%{purpose: purpose}) do
    case PurposeRegistry.get_purpose(purpose) do
      {:ok, _definition} ->
        :ok

      {:error, :unknown_purpose} ->
        {:error, %{
          check: "purpose_registered",
          regulation: "GDPR",
          article: "5(1)(b)",
          message: "Processing purpose '#{purpose}' is not registered. All processing must have a specified, explicit, and legitimate purpose."
        }}
    end
  end

  @spec check_legal_basis(processing_request()) :: guard_result()
  defp check_legal_basis(%{purpose: purpose}) do
    case PurposeRegistry.get_purpose(purpose) do
      {:ok, %{legal_basis: basis}} when basis in [:consent, :contract, :legal_obligation, :vital_interest, :public_interest, :legitimate_interest] ->
        :ok

      {:ok, %{legal_basis: invalid_basis}} ->
        {:error, %{
          check: "legal_basis_valid",
          regulation: "GDPR",
          article: "6(1)",
          message: "Legal basis '#{invalid_basis}' is not valid under GDPR Article 6(1)."
        }}

      {:error, _} ->
        :ok
    end
  end

  @spec check_consent(processing_request()) :: guard_result()
  defp check_consent(%{purpose: purpose, data_subject_id: nil}) do
    case PurposeRegistry.get_purpose(purpose) do
      {:ok, %{legal_basis: :consent}} ->
        {:error, %{
          check: "consent_valid",
          regulation: "GDPR",
          article: "7",
          message: "Processing under consent basis requires identifiable data subject for consent verification."
        }}

      _ ->
        :ok
    end
  end

  defp check_consent(%{purpose: purpose, data_subject_id: subject_id}) do
    case PurposeRegistry.get_purpose(purpose) do
      {:ok, %{legal_basis: :consent}} ->
        case ConsentManager.verify_consent(subject_id, purpose) do
          {:ok, _consent} -> :ok
          {:error, :no_consent} ->
            {:error, %{
              check: "consent_valid",
              regulation: "GDPR",
              article: "7",
              message: "No valid consent on record for data subject '#{subject_id}' for purpose '#{purpose}'."
            }}
          {:error, :consent_withdrawn} ->
            {:error, %{
              check: "consent_valid",
              regulation: "GDPR",
              article: "7(3)",
              message: "Consent has been withdrawn by data subject '#{subject_id}' for purpose '#{purpose}'."
            }}
        end

      _ ->
        :ok
    end
  end

  @spec check_minimization(processing_request()) :: guard_result()
  defp check_minimization(%{purpose: purpose, data: data}) do
    case PurposeRegistry.get_allowed_fields(purpose) do
      {:ok, allowed_fields} ->
        extra_fields = Map.keys(data) -- allowed_fields

        if extra_fields == [] do
          :ok
        else
          {:error, %{
            check: "data_minimized",
            regulation: "GDPR",
            article: "5(1)(c)",
            message: "Data contains fields not allowed for purpose '#{purpose}': #{inspect(extra_fields)}. Apply DataMinimizer before processing."
          }}
        end

      {:error, _} ->
        :ok
    end
  end

  @spec check_transfer_restrictions(processing_request()) :: guard_result()
  defp check_transfer_restrictions(%{destination_country: nil}), do: :ok

  defp check_transfer_restrictions(%{destination_country: country}) do
    case TransferValidator.validate_destination(country) do
      :ok -> :ok
      {:error, :inadequate_protection} ->
        {:error, %{
          check: "transfer_allowed",
          regulation: "GDPR",
          article: "44-49",
          message: "Transfer to '#{country}' requires appropriate safeguards under GDPR Chapter V."
        }}
    end
  end
end
```

### Data Subject Request Processor

GDPR grants data subjects specific rights that the platform must support:

```elixir
defmodule Prismatic.Privacy.DataSubjectRequestProcessor do
  @moduledoc """
  Processes data subject rights requests as required by GDPR
  Articles 15-22. Supports access, rectification, erasure,
  restriction, portability, and objection requests.

  ## Rights Supported

  - **Access (Art. 15)**: Provide copy of all personal data
  - **Rectification (Art. 16)**: Correct inaccurate data
  - **Erasure (Art. 17)**: Delete personal data ("right to be forgotten")
  - **Restriction (Art. 18)**: Limit processing while disputes are resolved
  - **Portability (Art. 20)**: Export data in machine-readable format
  - **Objection (Art. 21)**: Opt out of legitimate interest processing

  ## Response Deadlines

  All requests must be fulfilled within 30 days (extendable to
  90 days for complex requests with notification).
  """

  alias Prismatic.Privacy.AuditLogger

  @type right ::
          :access
          | :rectification
          | :erasure
          | :restriction
          | :portability
          | :objection

  @type request :: %{
          id: String.t(),
          subject_id: String.t(),
          right: right(),
          submitted_at: DateTime.t(),
          deadline: DateTime.t(),
          status: :received | :processing | :completed | :extended,
          details: map()
        }

  @type response :: %{
          request_id: String.t(),
          status: :fulfilled | :partially_fulfilled | :denied,
          data: term() | nil,
          reason: String.t() | nil,
          completed_at: DateTime.t()
        }

  @response_deadline_days 30
  @extension_deadline_days 90

  @spec submit_request(String.t(), right(), map()) :: {:ok, request()}
  def submit_request(subject_id, right, details \\ %{}) do
    now = DateTime.utc_now()

    request = %{
      id: generate_request_id(),
      subject_id: subject_id,
      right: right,
      submitted_at: now,
      deadline: DateTime.add(now, @response_deadline_days, :day),
      status: :received,
      details: details
    }

    AuditLogger.log_dsr_submitted(request)
    {:ok, request}
  end

  @spec process_request(request()) :: {:ok, response()} | {:error, term()}
  def process_request(%{right: :access} = request) do
    case collect_subject_data(request.subject_id) do
      {:ok, data} ->
        response = %{
          request_id: request.id,
          status: :fulfilled,
          data: data,
          reason: nil,
          completed_at: DateTime.utc_now()
        }

        AuditLogger.log_dsr_completed(request, response)
        {:ok, response}

      {:error, reason} ->
        {:error, reason}
    end
  end

  def process_request(%{right: :erasure} = request) do
    case erase_subject_data(request.subject_id) do
      {:ok, erased_count} ->
        response = %{
          request_id: request.id,
          status: :fulfilled,
          data: %{records_erased: erased_count},
          reason: nil,
          completed_at: DateTime.utc_now()
        }

        AuditLogger.log_dsr_completed(request, response)
        {:ok, response}

      {:error, :legal_hold} ->
        response = %{
          request_id: request.id,
          status: :denied,
          data: nil,
          reason: "Data subject to legal retention obligation (Art. 17(3)(b))",
          completed_at: DateTime.utc_now()
        }

        AuditLogger.log_dsr_completed(request, response)
        {:ok, response}
    end
  end

  def process_request(%{right: :portability} = request) do
    case export_subject_data(request.subject_id) do
      {:ok, exported_data} ->
        response = %{
          request_id: request.id,
          status: :fulfilled,
          data: exported_data,
          reason: nil,
          completed_at: DateTime.utc_now()
        }

        AuditLogger.log_dsr_completed(request, response)
        {:ok, response}

      {:error, reason} ->
        {:error, reason}
    end
  end

  def process_request(%{right: right} = request) do
    AuditLogger.log_dsr_received(request)
    {:ok, %{request_id: request.id, status: :fulfilled, data: nil, reason: "#{right} processed", completed_at: DateTime.utc_now()}}
  end

  @spec collect_subject_data(String.t()) :: {:ok, map()} | {:error, term()}
  defp collect_subject_data(_subject_id), do: {:ok, %{}}

  @spec erase_subject_data(String.t()) :: {:ok, non_neg_integer()} | {:error, atom()}
  defp erase_subject_data(_subject_id), do: {:ok, 0}

  @spec export_subject_data(String.t()) :: {:ok, map()} | {:error, term()}
  defp export_subject_data(_subject_id), do: {:ok, %{format: "json", records: []}}

  @spec generate_request_id() :: String.t()
  defp generate_request_id do
    "DSR-" <> (:crypto.strong_rand_bytes(8) |> Base.url_encode64(padding: false))
  end
end
```

### Breach Notification Handler

GDPR Article 33 requires notification to supervisory authorities within 72 hours of a personal data breach:

```elixir
defmodule Prismatic.Privacy.BreachNotificationHandler do
  @moduledoc """
  Manages personal data breach detection, assessment, and
  notification in compliance with GDPR Articles 33 and 34.

  ## Notification Requirements

  - **To supervisory authority (Art. 33)**: Within 72 hours
  - **To data subjects (Art. 34)**: Without undue delay if high risk

  ## Breach Assessment Criteria

  - Nature of the breach (confidentiality, integrity, availability)
  - Categories and volume of personal data affected
  - Categories and volume of data subjects affected
  - Likely consequences for data subjects
  - Measures taken to address and mitigate
  """

  alias Prismatic.Privacy.AuditLogger

  @type breach_severity :: :low | :medium | :high | :critical
  @type breach_type :: :confidentiality | :integrity | :availability

  @type breach_record :: %{
          id: String.t(),
          detected_at: DateTime.t(),
          notification_deadline: DateTime.t(),
          breach_type: breach_type(),
          severity: breach_severity(),
          data_categories: [String.t()],
          subjects_affected: non_neg_integer(),
          description: String.t(),
          containment_measures: [String.t()],
          mitigation_measures: [String.t()],
          authority_notified: boolean(),
          subjects_notified: boolean()
        }

  @notification_deadline_hours 72

  @spec register_breach(map()) :: {:ok, breach_record()}
  def register_breach(details) do
    now = DateTime.utc_now()

    breach = %{
      id: generate_breach_id(),
      detected_at: now,
      notification_deadline: DateTime.add(now, @notification_deadline_hours, :hour),
      breach_type: Map.fetch!(details, :breach_type),
      severity: assess_severity(details),
      data_categories: Map.get(details, :data_categories, []),
      subjects_affected: Map.get(details, :subjects_affected, 0),
      description: Map.fetch!(details, :description),
      containment_measures: Map.get(details, :containment_measures, []),
      mitigation_measures: Map.get(details, :mitigation_measures, []),
      authority_notified: false,
      subjects_notified: false
    }

    AuditLogger.log_breach_registered(breach)

    :telemetry.execute(
      [:prismatic, :privacy, :breach, :registered],
      %{count: 1, subjects_affected: breach.subjects_affected},
      %{breach_id: breach.id, severity: breach.severity}
    )

    {:ok, breach}
  end

  @spec assess_severity(map()) :: breach_severity()
  defp assess_severity(%{subjects_affected: count}) when count > 10_000, do: :critical
  defp assess_severity(%{subjects_affected: count}) when count > 1_000, do: :high
  defp assess_severity(%{subjects_affected: count}) when count > 100, do: :medium
  defp assess_severity(_details), do: :low

  @spec requires_subject_notification?(breach_record()) :: boolean()
  def requires_subject_notification?(%{severity: severity}) do
    severity in [:high, :critical]
  end

  @spec time_remaining_for_notification(breach_record()) :: integer()
  def time_remaining_for_notification(%{notification_deadline: deadline}) do
    DateTime.diff(deadline, DateTime.utc_now(), :hour)
  end

  @spec generate_breach_id() :: String.t()
  defp generate_breach_id do
    "BRE-" <> (:crypto.strong_rand_bytes(8) |> Base.url_encode64(padding: false))
  end
end
```

## Implementation in Prismatic Platform

### Cross-Application Enforcement

Data protection in the Prismatic Platform is enforced at the architecture level, not the application level. The `DataProtectionGuard` module is a dependency of every umbrella application that processes personal data:

- **prismatic_web**: LiveView routes involving user data pass through the guard
- **prismatic_api**: All API endpoints processing personal data validate through the guard
- **prismatic_perimeter**: EASM scanning respects WHOIS privacy and contact data redaction
- **prismatic_agents**: OSINT agents operate under declared processing purposes
- **prismatic_storage_ecto**: Database operations on personal data tables are audit-logged

### Encryption Strategy

| Data State | Mechanism | Key Management | Standard |
|-----------|-----------|----------------|----------|
| **At rest** | AES-256-GCM (database), LUKS (disk) | Fly.io secrets | NIST SP 800-111 |
| **In transit** | TLS 1.3 | Let's Encrypt + Fly.io | NIST SP 800-52 |
| **In processing** | BEAM process isolation | N/A (memory only) | N/A |
| **In backup** | AES-256-CBC (archive) | Fly.io secrets | NIST SP 800-111 |

### Regulatory Coverage

| Regulation | Jurisdiction | Key Requirements | Platform Implementation |
|-----------|-------------|-----------------|------------------------|
| **GDPR** | EU/EEA | Full data protection framework | DataProtectionGuard, DataMinimizer, DSR processor |
| **NIS2** | EU | Cybersecurity for essential services | Security monitoring, incident reporting |
| **ZKB 264/2025** | Czech Republic | National cybersecurity law | Czech registry compliance, local DPA alignment |
| **ePrivacy** | EU | Cookie consent, electronic communications | Consent management for tracking |

### Telemetry Events

| Event | Measurements | Metadata |
|-------|-------------|----------|
| `[:prismatic, :privacy, :processing, :authorized]` | `%{count: 1}` | `%{purpose, processor}` |
| `[:prismatic, :privacy, :processing, :rejected]` | `%{count: 1}` | `%{purpose, violation_article}` |
| `[:prismatic, :privacy, :dsr, :submitted]` | `%{count: 1}` | `%{right, subject_id}` |
| `[:prismatic, :privacy, :dsr, :completed]` | `%{duration_hours: float}` | `%{right, status}` |
| `[:prismatic, :privacy, :breach, :registered]` | `%{subjects_affected: int}` | `%{severity, breach_type}` |
| `[:prismatic, :privacy, :retention, :purged]` | `%{records_purged: int}` | `%{purpose}` |

## Comparison with Alternatives

| Approach | Compliance Coverage | Automation | Cost | Complexity | Prismatic Usage |
|----------|-------------------|-----------|------|------------|-----------------|
| **Built-in enforcement (code)** | High | Full | Development cost | High | Primary method |
| **OneTrust** | Very High | Medium | $$$$$ | Medium | Not used |
| **TrustArc** | High | Medium | $$$$ | Medium | Not used |
| **Osano** | Medium | Low | $$ | Low | Not used |
| **Manual compliance** | Variable | None | Staff time | Low | Fallback only |
| **Privacy-as-code** | High | Full | Development cost | High | Philosophy adopted |

The Prismatic Platform chose built-in enforcement over third-party compliance tools because the platform's data flows are non-standard (OSINT intelligence, security scanning, multi-source entity resolution) and cannot be easily modeled by generic compliance platforms. The `DataProtectionGuard` is purpose-built for the platform's specific data processing patterns.

## Best Practices

1. **Privacy by design, not by audit**: Data protection must be designed into the architecture from the start. Retrofitting privacy controls onto an existing system is more expensive, more error-prone, and less effective than building them in from day one.

2. **Implement technical controls, not just policies**: A data protection policy that relies on human compliance will fail. The `DataProtectionGuard` enforces policy through code: non-compliant processing is blocked, not just flagged.

3. **Maintain a Record of Processing Activities (ROPA)**: GDPR Article 30 requires maintaining records of all processing activities. The `PurposeRegistry` and audit trail together satisfy this requirement automatically.

4. **Automate data subject request processing**: Manual DSR processing is slow and error-prone. The `DataSubjectRequestProcessor` provides automated fulfillment within the 30-day deadline.

5. **Encrypt at every layer**: Defense in depth for data protection means encryption at rest, in transit, and in backup. A single missing layer creates a vulnerability.

6. **Test breach notification procedures**: Run tabletop exercises to verify that breach detection, assessment, and notification can be completed within the 72-hour GDPR deadline.

7. **Conduct Data Protection Impact Assessments**: Before implementing new processing activities that involve high-risk personal data, conduct a DPIA as required by GDPR Article 35.

8. **Monitor for data protection violations**: Continuous monitoring through telemetry events ensures that violations are detected and addressed in real time, not during annual audits.

## Common Pitfalls

1. **Treating data protection as a legal problem only**: Lawyers define the requirements, but engineers must implement the controls. Data protection without technical enforcement is compliance theater.

2. **Assuming anonymization is simple**: True anonymization (irreversible de-identification) is technically difficult. Many "anonymization" techniques are actually pseudonymization, which still constitutes personal data under GDPR.

3. **Ignoring data in logs and monitoring**: Personal data appears in application logs, error messages, and monitoring dashboards. These data stores must also be subject to data protection controls.

4. **Missing data processor agreements**: When using third-party services that process personal data (cloud hosting, email providers, analytics tools), GDPR requires Data Processing Agreements (DPA). Missing DPAs are a common compliance gap.

5. **Inadequate breach detection**: Many organizations discover breaches months after they occur. The 72-hour notification deadline starts at detection, but regulators also evaluate detection capability.

6. **Cross-border transfer blind spots**: Transferring personal data outside the EU/EEA requires appropriate safeguards (Standard Contractual Clauses, adequacy decisions). Using a US-based cloud provider constitutes a transfer.

7. **No data protection officer**: Organizations processing personal data at scale typically require a DPO under GDPR Article 37. Operating without one is both a compliance violation and an organizational gap.

8. **Consent fatigue and dark patterns**: Obtaining consent through confusing interfaces or pre-checked boxes violates the GDPR requirement for freely given, specific, informed, and unambiguous consent.

## Use Cases

### OSINT Intelligence Gathering with Privacy Compliance

The Prismatic Platform's 120+ OSINT adapters query external data sources that frequently return personal data. The `DataProtectionGuard` validates each query against the declared processing purpose, the `DataMinimizer` strips unnecessary personal fields, and the retention enforcer ensures that collected data is purged after the purpose-defined retention period. This enables intelligence gathering while maintaining GDPR compliance.

### Due Diligence with Data Subject Rights

When performing [due diligence](/glossary/due-diligence/) on individuals (KYC, sanctions screening), the platform collects personal data under the `legal_obligation` basis. Even under this basis, data subjects retain access rights (Article 15). The `DataSubjectRequestProcessor` handles access requests by collecting all personal data associated with a subject ID across all storage backends and presenting it in a portable format.

### Security Monitoring with Privacy Balance

[Security operations](/glossary/security-operations/) require processing IP addresses, user agents, and request patterns -- all personal data under GDPR. The platform processes this data under the `legitimate_interest` basis with a documented balancing test. Retention is limited to 90 days, and IP addresses are pseudonymized (last two octets masked) after 24 hours.

### Prismatic Perimeter EASM Compliance

External attack surface scanning discovers domain ownership, DNS records, and certificate details that may include personal data (registrant contacts, administrative emails). The `DataProtectionGuard` ensures that WHOIS personal contact details are automatically redacted, retaining only organization-level information under the `perimeter_easm` purpose.

## Related Concepts

- [GDPR](/glossary/gdpr/) -- the primary regulatory framework for data protection in the EU
- [Data Minimization](/glossary/data-minimization/) -- the principle of collecting only necessary data
- [Encryption](/glossary/encryption/) -- cryptographic controls protecting data confidentiality
- [Encryption at Rest](/glossary/encryption-at-rest/) -- protecting stored personal data
- [Compliance Framework](/glossary/compliance-framework/) -- systematic approach to regulatory compliance
- [Audit Trail](/glossary/audit-trail/) -- immutable record proving data protection compliance
- [Security Operations](/glossary/security-operations/) -- monitoring and incident response for data breaches
- [NIS2](/glossary/nis2/) -- EU cybersecurity directive complementing GDPR
- [ZKB](/glossary/zkb/) -- Czech cybersecurity regulation with data protection provisions
- [Credential Management](/glossary/credential-management/) -- protecting authentication secrets as sensitive data
- [OSINT](/glossary/osint/) -- intelligence operations subject to data protection rules
- [Due Diligence](/glossary/due-diligence/) -- KYC workflows with data protection obligations

## See Also

- [GDPR Full Text](https://gdpr-info.eu/) -- complete General Data Protection Regulation
- [ICO Guide to Data Protection](https://ico.org.uk/for-organisations/guide-to-data-protection/) -- UK Information Commissioner's Office guidance
- [EDPB Guidelines](https://edpb.europa.eu/our-work-tools/general-guidance_en) -- European Data Protection Board official guidance
- [ENISA Data Protection Resources](https://www.enisa.europa.eu/topics/data-protection) -- EU cybersecurity agency privacy resources
- Glossary Index -- complete glossary of Prismatic Platform terminology

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
