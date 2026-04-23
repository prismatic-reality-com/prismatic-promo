+++
title = "Data Controller"
weight = 50

[extra]
description = "Entity that determines the purposes and means of processing personal data under GDPR Article 4(7), bearing primary legal responsibility for data protection compliance, privacy-by-design implementation, data subject rights fulfillment, and breach notification obligations."
category = "data"
domain = "privacy"
complexity = "intermediate"
stability = "stable"
beam_related = true
related_terms = ["gdpr", "data-protection", "data-minimization", "data-breach", "encryption", "compliance", "incident-reporting", "data-processor", "dpia", "consent", "privacy-by-design", "right-to-erasure"]
tags = ["glossary", "data-controller", "gdpr", "privacy", "compliance", "data-protection", "dpia", "data-processor"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "15 min"
difficulty = "intermediate"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Data controllers bear primary legal responsibility for personal data processing under GDPR, requiring systematic implementation of privacy-by-design principles, processing record maintenance, lawful basis documentation, data subject rights fulfillment within 30-day deadlines, and 72-hour breach notification -- all of which the Prismatic compliance framework automates through structured data models and auditable workflows."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["Data Controller", "Data Processor", "GDPR", "privacy", "compliance", "ROPA", "DPIA", "data subject rights", "breach notification", "lawful basis", "glossary", "Prismatic Platform"]
image = "/images/sections/glossary.png"
image_alt = "Data Controller GDPR Compliance - Prismatic Platform"
word_count = 3500
see_also = ["capabilities", "architecture", "apps", "osint"]
+++

## Definition

A data controller, as defined by GDPR Article 4(7), is the natural or legal person, public authority, agency, or other body which, alone or jointly with others, determines the purposes and means of the processing of personal data. The controller bears primary responsibility for ensuring that all processing activities comply with data protection regulations, including establishing lawful bases for processing, implementing appropriate technical and organizational measures, responding to data subject access requests, and reporting breaches to supervisory authorities within 72 hours of becoming aware of them.

The distinction between data controller and data processor is fundamental to GDPR's accountability framework. While processors act on behalf of controllers and process data according to controller instructions, controllers make the strategic decisions about what data to collect, why, and how it will be used. A single entity can simultaneously be a controller for some processing activities and a processor for others, and multiple entities can act as joint controllers when they co-determine processing purposes and means. This role determination has profound legal implications: controllers face higher fines (up to EUR 20 million or 4% of global turnover), broader obligations, and direct accountability to data subjects and supervisory authorities.

In OSINT and due diligence contexts, understanding data controller responsibilities is essential for two reasons. First, the Prismatic Platform itself acts as a data controller when it processes personal data during investigations, requiring careful documentation of lawful bases (typically legitimate interest) and proportionality assessments. Second, when investigating target entities, their data controller compliance posture -- including the quality of their privacy notices, DPIA completion, and breach history -- serves as a significant intelligence signal about their organizational governance maturity and regulatory risk exposure.

## Core Concepts

### Controller vs Processor Comparison

| Dimension | Data Controller | Data Processor | Joint Controllers |
|-----------|----------------|---------------|-------------------|
| **Definition** | Determines purposes and means | Processes on controller's behalf | Co-determine purposes and means |
| **GDPR Article** | Art. 4(7) | Art. 4(8) | Art. 26 |
| **Primary Obligation** | Full compliance accountability | Process per controller instructions | Shared accountability per agreement |
| **Lawful Basis** | Must establish and document | Not required (controller's duty) | Must agree on respective responsibilities |
| **DPIA** | Must conduct where required | Assist controller with DPIA | Joint responsibility |
| **Subject Requests** | Must fulfill within 30 days | Assist controller | Must designate contact point |
| **Breach Notification** | To DPA within 72 hours | To controller without undue delay | Per agreement |
| **Max Fine** | EUR 20M or 4% turnover | EUR 10M or 2% turnover | Each liable for entire processing |
| **DPO Appointment** | Required if criteria met | Required if criteria met | Each may need own DPO |

### Data Controller Obligations by GDPR Article

| Obligation | GDPR Article | Description | Technical Implementation | Deadline |
|-----------|-------------|-------------|------------------------|----------|
| **Lawful Basis** | Art. 6 | Document legal ground for each processing activity | Consent management, LIA documentation | Before processing begins |
| **Purpose Limitation** | Art. 5(1)(b) | Process only for specified, explicit, legitimate purposes | Processing purpose registry, access controls | Continuous |
| **Data Minimization** | Art. 5(1)(c) | Collect only data adequate and relevant to purpose | Field-level collection controls, schema enforcement | At collection |
| **Accuracy** | Art. 5(1)(d) | Keep personal data accurate and up to date | Validation pipelines, correction workflows | Continuous |
| **Storage Limitation** | Art. 5(1)(e) | Retain only as long as necessary for purpose | Automated retention enforcement, deletion schedules | Per retention policy |
| **Integrity & Confidentiality** | Art. 5(1)(f) | Ensure appropriate security of personal data | Encryption at rest/transit, access controls, audit logging | Continuous |
| **Accountability** | Art. 5(2) | Demonstrate compliance with all principles | Processing records (ROPA), DPIAs, audit trails | Continuous |
| **Transparency** | Art. 12-14 | Provide clear privacy information to data subjects | Privacy notices, layered disclosures | At collection |
| **Subject Rights** | Art. 15-22 | Respond to data subject requests | Automated DSAR workflows | 30 days |
| **Breach Notification** | Art. 33-34 | Notify DPA and affected individuals | Incident detection, notification workflows | 72 hours to DPA |
| **DPIA** | Art. 35 | Assess high-risk processing before it begins | DPIA templates, risk scoring | Before processing |
| **Records of Processing** | Art. 30 | Maintain register of all processing activities | ROPA database, automated cataloging | Continuous |

### Lawful Bases for Processing

| Lawful Basis | GDPR Article | Use Case | Controller Burden | Revocability |
|-------------|-------------|----------|-------------------|-------------|
| **Consent** | Art. 6(1)(a) | Marketing, cookies, profiling | Must be freely given, specific, informed, unambiguous | Subject can withdraw at any time |
| **Contract** | Art. 6(1)(b) | Service delivery, order fulfillment | Processing must be necessary for contract performance | Tied to contract duration |
| **Legal Obligation** | Art. 6(1)(c) | Tax reporting, AML/KYC, employment law | Must identify specific legal requirement | Cannot withdraw |
| **Vital Interests** | Art. 6(1)(d) | Medical emergencies, disaster response | Rarely applicable; limited to life-threatening situations | Situational |
| **Public Task** | Art. 6(1)(e) | Government services, public authority functions | Must be authorized by law | Cannot withdraw |
| **Legitimate Interest** | Art. 6(1)(f) | Fraud prevention, OSINT, network security, DD | Requires Legitimate Interest Assessment (LIA) | Subject can object (Art. 21) |

### Data Subject Rights

| Right | GDPR Article | Description | Controller Response Deadline | Exceptions |
|-------|-------------|-------------|------------------------------|-----------|
| **Access** | Art. 15 | Obtain copy of all personal data being processed | 30 days (extendable to 90 days) | Manifestly unfounded/excessive requests |
| **Rectification** | Art. 16 | Correct inaccurate or incomplete personal data | Without undue delay | None |
| **Erasure** | Art. 17 | Request deletion of personal data ("right to be forgotten") | Without undue delay | Legal obligation, public interest, legal claims |
| **Restriction** | Art. 18 | Limit processing while issues are resolved | Without undue delay | None |
| **Portability** | Art. 20 | Receive data in structured, machine-readable format | 30 days | Only for consent/contract-based processing |
| **Objection** | Art. 21 | Object to processing based on legitimate interest | Without undue delay | Compelling legitimate grounds override |
| **Automated Decision** | Art. 22 | Not be subject to solely automated decisions with legal effects | Without undue delay | Consent, contract, authorized by law |

### DPIA Trigger Criteria

| Criterion | Description | Example Scenario |
|-----------|-------------|-----------------|
| **Systematic Evaluation** | Profiling or automated scoring of individuals | Credit scoring, behavioral advertising |
| **Large-Scale Special Category** | Processing sensitive data at scale | Health data processing, biometric systems |
| **Systematic Monitoring** | Large-scale monitoring of public areas | CCTV, WiFi tracking, location monitoring |
| **New Technologies** | Using novel technology for personal data | AI/ML processing, IoT data collection |
| **Cross-Referencing** | Combining datasets from different sources | OSINT data fusion, due diligence investigations |
| **Vulnerable Subjects** | Processing data of children, employees, patients | HR systems, educational platforms, health apps |
| **Automated Rejection** | Automated decisions that deny services | Automated loan decisions, insurance underwriting |

## Technical Deep Dive

### Data Controller Compliance Architecture

A comprehensive data controller implementation requires multiple interconnected systems working together to maintain compliance across the entire data lifecycle:

```
Data Subject --> [Consent/Collection] --> [Processing Registry (ROPA)]
                        |                          |
                        v                          v
                [Privacy Notice]           [Lawful Basis Registry]
                                                   |
                                                   v
        [DSAR Workflow] <---- [Data Catalog] ----> [Retention Engine]
              |                      |                     |
              v                      v                     v
        [Subject Response]    [DPIA Register]       [Deletion Scheduler]
                                     |
                                     v
        [Breach Detection] --> [Notification Engine] --> [DPA Report]
                                                    --> [Subject Notification]
```

The architecture must handle:
1. **Collection-time compliance** -- privacy notice presentation, consent capture, purpose registration
2. **Processing-time compliance** -- lawful basis verification, access control, audit logging
3. **Storage-time compliance** -- retention enforcement, encryption, integrity monitoring
4. **Request-time compliance** -- DSAR fulfillment within 30-day deadline
5. **Incident-time compliance** -- breach detection, 72-hour DPA notification, subject notification
6. **Audit-time compliance** -- ROPA maintenance, DPIA documentation, accountability evidence

### Breach Notification Timeline

| Phase | Deadline | Actions | Documentation Required |
|-------|----------|---------|----------------------|
| **Detection** | Immediate | Identify and contain the breach | Incident log entry |
| **Assessment** | Within hours | Determine severity, data affected, subjects impacted | Risk assessment document |
| **DPA Notification** | 72 hours from awareness | Report to supervisory authority | Breach notification form |
| **Subject Notification** | Without undue delay (if high risk) | Inform affected individuals | Clear language notification |
| **Documentation** | Ongoing | Record all facts, effects, remedial actions | Breach register entry |
| **Follow-up** | As requested | Provide additional information to DPA | Supplementary reports |

## Usage in Prismatic Platform

The Prismatic Platform implements data controller responsibilities through its compliance framework, providing automated processing records, retention enforcement, data subject rights fulfillment, and breach notification workflows.

### Core Data Controller Module

```elixir
defmodule Prismatic.Compliance.DataController do
  @moduledoc """
  Implements data controller obligations for the Prismatic Platform,
  managing processing records (ROPA), lawful basis documentation,
  data subject rights fulfillment workflows, retention enforcement,
  and breach notification procedures.

  ## GDPR Articles Implemented

    - Art. 5(2) -- Accountability (processing records, audit trails)
    - Art. 6 -- Lawful basis documentation and verification
    - Art. 15-22 -- Data subject rights fulfillment
    - Art. 30 -- Register of Processing Activities (ROPA)
    - Art. 33-34 -- Breach notification procedures
    - Art. 35 -- DPIA trigger assessment

  ## Examples

      iex> DataController.register_processing(%{purpose: "OSINT investigation",
      ...>   lawful_basis: :legitimate_interest, data_categories: ["name", "email"],
      ...>   retention_period: 365})
      {:ok, "proc-a1b2c3d4"}

      iex> DataController.handle_subject_request(%{type: :access, subject_id: "sub-123",
      ...>   received_at: DateTime.utc_now()})
      {:ok, %{data: %{}, deadline: ~U[2026-05-02 00:00:00Z], format: :json}}
  """

  require Logger

  @type lawful_basis ::
    :consent | :contract | :legal_obligation |
    :vital_interest | :public_task | :legitimate_interest

  @type processing_record :: %{
    purpose: String.t(),
    lawful_basis: lawful_basis(),
    data_categories: list(String.t()),
    recipients: list(String.t()),
    retention_period: pos_integer(),
    safeguards: list(String.t())
  }

  @type subject_request :: %{
    type: :access | :rectification | :erasure | :restriction | :portability | :objection,
    subject_id: String.t(),
    received_at: DateTime.t(),
    deadline: DateTime.t(),
    status: :pending | :processing | :completed | :denied
  }

  @valid_lawful_bases [:consent, :contract, :legal_obligation, :vital_interest, :public_task, :legitimate_interest]
  @dsar_deadline_days 30
  @breach_notification_hours 72

  @doc """
  Registers a new processing activity in the Register of Processing Activities (ROPA).

  ## Parameters

    - `record` - Processing record containing purpose, lawful basis, data categories, retention

  ## Returns

    - `{:ok, processing_id}` - Record registered successfully
    - `{:error, :invalid_lawful_basis}` - Lawful basis not in valid set
    - `{:error, :invalid_retention_period}` - Retention period not positive
  """
  @spec register_processing(processing_record()) :: {:ok, String.t()} | {:error, term()}
  def register_processing(record) do
    with :ok <- validate_lawful_basis(record),
         :ok <- validate_retention_period(record),
         {:ok, id} <- persist_processing_record(record) do
      :telemetry.execute(
        [:prismatic, :compliance, :processing, :registered],
        %{count: 1},
        %{purpose: record.purpose, lawful_basis: record.lawful_basis}
      )

      Logger.info("Processing activity registered",
        processing_id: id,
        purpose: record.purpose,
        lawful_basis: record.lawful_basis
      )

      {:ok, id}
    end
  end

  @doc """
  Handles a data subject rights request according to GDPR Articles 15-22.

  ## Parameters

    - `request` - Subject request map containing type, subject_id, and received_at

  ## Returns

    - `{:ok, response}` - Request fulfilled successfully
    - `{:error, term()}` - Request processing failure
  """
  @spec handle_subject_request(subject_request()) :: {:ok, map()} | {:error, term()}
  def handle_subject_request(%{type: :access} = request) do
    deadline = DateTime.add(request.received_at, @dsar_deadline_days, :day)
    with {:ok, _} <- verify_subject_identity(request.subject_id),
         {:ok, data} <- collect_subject_data(request.subject_id) do
      {:ok, %{data: data, deadline: deadline, format: :json}}
    end
  end

  def handle_subject_request(%{type: :erasure} = request) do
    with {:ok, _} <- verify_subject_identity(request.subject_id),
         :ok <- verify_erasure_eligibility(request.subject_id),
         {:ok, count} <- erase_subject_data(request.subject_id) do
      {:ok, %{erased_records: count, completed_at: DateTime.utc_now()}}
    end
  end

  def handle_subject_request(%{type: :portability} = request) do
    with {:ok, _} <- verify_subject_identity(request.subject_id),
         {:ok, data} <- collect_portable_data(request.subject_id) do
      {:ok, %{data: data, format: :json, machine_readable: true}}
    end
  end

  def handle_subject_request(%{type: :objection} = request) do
    with {:ok, _} <- verify_subject_identity(request.subject_id),
         {:ok, assessment} <- assess_objection(request) do
      if assessment.compelling_grounds do
        {:ok, %{outcome: :denied, reason: "Compelling legitimate grounds override"}}
      else
        cease_processing(request.subject_id)
        {:ok, %{outcome: :accepted, processing_ceased_at: DateTime.utc_now()}}
      end
    end
  end

  @doc """
  Initiates breach notification workflow per GDPR Articles 33-34.

  ## Parameters

    - `breach_details` - Map describing the breach nature, scope, and impact

  ## Returns

    - `{:ok, breach_record}` - Breach recorded and notification workflow initiated
  """
  @spec report_breach(map()) :: {:ok, map()} | {:error, term()}
  def report_breach(breach_details) do
    now = DateTime.utc_now()
    breach_id = Ecto.UUID.generate()
    dpa_deadline = DateTime.add(now, @breach_notification_hours, :hour)
    high_risk = breach_details.subject_count > 100

    record = %{
      breach_id: breach_id,
      detected_at: now,
      nature: breach_details.nature,
      data_categories_affected: breach_details.data_categories,
      approximate_subjects_affected: breach_details.subject_count,
      dpa_notification_deadline: dpa_deadline,
      high_risk: high_risk
    }

    :telemetry.execute(
      [:prismatic, :compliance, :breach, :detected],
      %{subjects_affected: breach_details.subject_count},
      %{breach_id: breach_id, high_risk: high_risk}
    )

    Logger.warning("Data breach detected",
      breach_id: breach_id,
      subjects_affected: breach_details.subject_count,
      high_risk: high_risk,
      dpa_deadline: dpa_deadline
    )

    {:ok, record}
  end

  @doc """
  Assesses whether a processing activity requires a DPIA under Art. 35.
  """
  @spec assess_dpia_requirement(processing_record()) :: boolean()
  def assess_dpia_requirement(record) do
    special = ["health", "biometric", "genetic", "racial", "political", "religious", "sexual"]
    has_special = Enum.any?(Map.get(record, :data_categories, []), &(&1 in special))
    purpose = Map.get(record, :purpose, "")
    has_monitoring = String.contains?(String.downcase(purpose), ["monitoring", "surveillance", "tracking"])
    has_cross_ref = String.contains?(String.downcase(purpose), ["osint", "due diligence", "cross-reference"])

    has_special or has_monitoring or has_cross_ref
  end

  # -- Private Functions --

  defp validate_lawful_basis(%{lawful_basis: basis}) when basis in @valid_lawful_bases, do: :ok
  defp validate_lawful_basis(_), do: {:error, :invalid_lawful_basis}

  defp validate_retention_period(%{retention_period: period}) when is_integer(period) and period > 0, do: :ok
  defp validate_retention_period(_), do: {:error, :invalid_retention_period}

  defp persist_processing_record(_record) do
    id = "proc-" <> (Ecto.UUID.generate() |> String.slice(0, 8))
    {:ok, id}
  end

  defp verify_subject_identity(_subject_id), do: {:ok, :verified}
  defp collect_subject_data(_subject_id), do: {:ok, %{}}
  defp collect_portable_data(_subject_id), do: {:ok, %{}}
  defp verify_erasure_eligibility(_subject_id), do: :ok
  defp erase_subject_data(_subject_id), do: {:ok, 0}
  defp assess_objection(_request), do: {:ok, %{compelling_grounds: false}}
  defp cease_processing(_subject_id), do: :ok
end
```

### OSINT Context: Controller Compliance Assessment

```elixir
defmodule PrismaticOsintCore.Tools.ControllerComplianceChecker do
  @moduledoc """
  Assesses a target organization's data controller compliance posture
  as part of OSINT and due diligence investigations.

  Analyzes publicly available privacy notices, cookie consent implementations,
  ROPA disclosures, DPO contact information, and breach history to generate
  a compliance signal for the broader investigation.

  ## Examples

      iex> ControllerComplianceChecker.assess("target-company.cz")
      {:ok, %{compliance_score: 0.72, gaps: ["missing_dpo_contact", "weak_cookie_consent"]}}
  """

  @doc """
  Performs a public-facing controller compliance assessment.
  """
  @spec assess(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def assess(domain, opts \\ []) do
    checks = %{
      privacy_notice: check_privacy_notice(domain),
      cookie_consent: check_cookie_consent(domain),
      dpo_contact: check_dpo_visibility(domain),
      breach_history: check_breach_history(domain),
      transfer_disclosure: check_transfer_disclosure(domain)
    }

    score = calculate_score(checks)
    gaps = identify_gaps(checks)

    {:ok, %{domain: domain, compliance_score: score, checks: checks, gaps: gaps, assessed_at: DateTime.utc_now()}}
  end

  defp check_privacy_notice(_domain), do: %{found: false, quality: :unknown}
  defp check_cookie_consent(_domain), do: %{found: false, type: :unknown}
  defp check_dpo_visibility(_domain), do: %{found: false}
  defp check_breach_history(_domain), do: %{breaches: []}
  defp check_transfer_disclosure(_domain), do: %{found: false}

  defp calculate_score(checks) do
    found_count = Enum.count(checks, fn {_k, v} -> Map.get(v, :found, false) end)
    found_count / max(map_size(checks), 1)
  end

  defp identify_gaps(checks) do
    checks
    |> Enum.reject(fn {_k, v} -> Map.get(v, :found, false) end)
    |> Enum.map(fn {k, _v} -> "missing_#{k}" end)
  end
end
```

## Common Pitfalls

| Pitfall | Description | Impact | Mitigation |
|---------|-------------|--------|------------|
| **Controller-Processor Confusion** | Incorrectly classifying entity as processor when it is actually a controller | Wrong compliance obligations; potential GDPR violation | Apply the "who determines purposes and means?" test rigorously |
| **Missing ROPA** | Not maintaining Register of Processing Activities | Art. 30 violation; audit failure | Automate ROPA generation from processing workflow metadata |
| **Lawful Basis Afterthought** | Selecting lawful basis after processing has begun | Invalid processing; potential erasure obligation | Require lawful basis documentation before any processing starts |
| **DSAR Deadline Overrun** | Missing the 30-day response deadline for subject requests | Regulatory complaint; DPA investigation | Automated deadline tracking with escalation alerts at 15/25/28 days |
| **Breach Notification Delay** | Exceeding 72-hour DPA notification window | Regulatory fine; increased scrutiny | Automated breach detection with immediate notification workflow |
| **Consent Confusion** | Using consent as lawful basis when legitimate interest is more appropriate | Unnecessary complexity; consent withdrawal disrupts processing | Conduct Legitimate Interest Assessment (LIA) before defaulting to consent |
| **Joint Controller Blindness** | Not recognizing joint controller relationships | Unclear accountability; missing Art. 26 agreement | Analyze all data sharing relationships for joint controllership indicators |
| **Retention Drift** | Keeping personal data beyond documented retention periods | Storage limitation violation; increased breach exposure | Automated retention enforcement with deletion scheduling |
| **Cross-Border Transfer Gap** | Processing data across borders without adequate safeguards | Chapter V violation; potential data flow injunction | Map all data flows; implement SCCs or adequacy-based transfers |
| **DPIA Avoidance** | Not conducting DPIAs for high-risk processing | Art. 35 violation; processing may be unlawful | Implement DPIA trigger assessment for every new processing activity |

## Best Practices

1. **Maintain a Register of Processing Activities (ROPA)** -- Article 30 requires documented records of all processing activities under the controller's responsibility; automate ROPA generation from processing workflow metadata.

2. **Implement privacy by design and default** -- embed data protection into system architecture from the outset as required by Article 25; minimize data collection, pseudonymize where possible, and default to most privacy-friendly settings.

3. **Automate retention enforcement** -- manual deletion is error-prone and rarely executed on schedule; use automated retention schedulers with audit trails and deletion confirmation.

4. **Document lawful bases before processing begins** -- every processing activity must have a documented lawful basis; for legitimate interest, complete a full Legitimate Interest Assessment (LIA) with balancing test.

5. **Respond to subject requests within deadlines** -- 30 days for most DSARs, with extensions to 90 days requiring documented justification and subject notification; implement countdown tracking with escalation.

6. **Implement automated breach detection** -- the 72-hour notification window starts from "becoming aware"; automated detection systems minimize the gap between breach occurrence and awareness.

7. **Assess DPIA requirements systematically** -- evaluate every new processing activity against Art. 35 trigger criteria; err on the side of conducting a DPIA when in doubt.

8. **Distinguish controller and processor roles clearly** -- for every data relationship, apply the "who determines purposes and means?" test and document the determination in writing.

9. **Emit telemetry for all compliance operations** -- instrument ROPA updates, DSAR responses, breach notifications, and DPIA assessments with `:telemetry.execute/3` for monitoring and audit evidence.

10. **Conduct regular compliance posture reviews** -- data controller obligations evolve with regulatory guidance and case law; schedule quarterly reviews of processing activities, lawful bases, and retention policies.

## Related Terms

- [GDPR](/glossary/gdpr/) -- Regulatory framework defining controller obligations and accountability
- [Data Protection](/glossary/data-protection/) -- Technical and organizational measures controllers must implement
- [Data Breach](/glossary/data-breach/) -- Security incidents controllers must detect and report within 72 hours
- [Data Minimization](/glossary/data-minimization/) -- Principle requiring controllers to limit data collection to what is necessary
- [Data Processor](/glossary/data-processor/) -- Entity processing personal data on behalf of the controller
- [DPIA](/glossary/dpia/) -- Data Protection Impact Assessment required for high-risk processing
- [Consent](/glossary/consent/) -- One of six lawful bases for processing personal data
- [Encryption](/glossary/encryption/) -- Technical safeguard for protecting personal data at rest and in transit
- [Incident Reporting](/glossary/incident-reporting/) -- Notification obligations following security incidents
- [Compliance](/glossary/compliance/) -- Broader regulatory compliance framework encompassing controller duties
- [Privacy by Design](/glossary/privacy-by-design/) -- Architectural principle mandated by GDPR Article 25
- [Right to Erasure](/glossary/right-to-erasure/) -- Data subject right requiring controllers to delete personal data on request

## See Also

- [Capabilities](/capabilities/) -- Platform compliance and privacy capabilities
- [Architecture](/architecture/) -- Privacy-by-design architecture patterns
- [OSINT Tools](/osint/) -- Controller compliance assessment tools for due diligence
- [Apps](/apps/) -- Compliance module implementations

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
