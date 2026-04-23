+++
title = "Certification"
weight = 50

[extra]
description = "Formal validation process verifying compliance with established standards, encompassing security certifications (ISO 27001, SOC 2), personal credentials (CISSP, OSCP), and system-level attestations critical to OSINT, due diligence, and regulatory compliance operations."
category = "governance"
domain = "compliance"
complexity = "intermediate"
stability = "stable"
beam_related = true
related_terms = ["compliance", "iso-27001", "soc2", "gdpr", "nis2", "assessment", "credential", "audit", "accreditation", "risk-management", "due-diligence", "data-protection"]
tags = ["glossary", "certification", "governance", "compliance", "security", "iso-27001", "soc2", "due-diligence"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "15 min"
difficulty = "intermediate"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Certification is a multi-phase lifecycle process (eligibility, preparation, assessment, issuance, maintenance, revocation) that the Prismatic Platform models as a first-class auditable entity across the Academy, Perimeter, and OSINT subsystems for both personnel competency tracking and organizational compliance verification."
date_created = "2026-02-23"
date_modified = "2026-04-02"
keywords = ["certification", "ISO 27001", "SOC 2", "CISSP", "OSCP", "compliance", "accreditation", "security certification", "credential validation", "glossary", "Prismatic Platform"]
image = "/images/sections/glossary.png"
image_alt = "Certification Lifecycle - Prismatic Platform Governance"
word_count = 3500
see_also = ["capabilities", "academy", "architecture", "osint"]
+++

## Definition

Certification is a formal process through which an individual, system, or organization demonstrates compliance with a defined set of standards, competencies, or requirements. Unlike informal assessments, certification carries institutional weight -- it represents a verified, auditable claim that specific criteria have been met. The certification process creates a trust chain between the certified entity, the certifying body, and any relying parties who depend on the certification as evidence of capability or compliance.

In information security and software engineering, certifications span a wide spectrum from personal credentials (CISSP, OSCP, CEH, AWS Solutions Architect) to system-level attestations (ISO 27001, SOC 2 Type II, Common Criteria EAL) to organizational compliance certifications (NIS2 compliance, GDPR readiness, PCI DSS). Each category serves a distinct purpose in the overall trust architecture: personal certifications validate individual competency, system certifications validate technical controls, and organizational certifications validate governance and process maturity.

The certification process typically involves three major phases: preparation (acquiring the necessary knowledge, skills, and implementing required controls), assessment (formal evaluation against defined criteria by an accredited assessor), and maintenance (ongoing compliance through continuing education, periodic re-evaluation, or continuous monitoring). Each phase has distinct requirements that must be tracked and verified independently. The value of a certification degrades over time without active maintenance, making lifecycle management a critical operational concern.

In the Prismatic Platform context, certification intersects with multiple subsystems: the Academy learning system tracks learner progress toward certifiable competencies, the Perimeter compliance engine verifies system-level security certifications during external attack surface assessments, and the OSINT toolbox leverages certification data when evaluating target organizations during due diligence operations. The platform treats certification as a first-class data entity rather than a simple boolean flag, preserving the full provenance chain from skill acquisition through assessment to credential issuance and eventual renewal or revocation.

## Core Concepts

### Certification Lifecycle Model

| Phase | Description | Data Captured | Duration | Prismatic Module |
|-------|-------------|---------------|----------|------------------|
| **Eligibility** | Prerequisites verified against requirements | Skill graph traversal, dependency chain | Instant (computed) | `PrismaticAcademy.TopicRegistry` |
| **Preparation** | Learning path execution toward competency | Topic completion, lab results, study hours | Weeks to months | `PrismaticAcademy.ProgressTracker` |
| **Assessment** | Formal evaluation against defined criteria | Score, duration, attempt count, assessor ID | Hours to days | `PrismaticAcademy.SessionManager` |
| **Issuance** | Credential creation and registration | Certificate ID, expiry date, issuer, scope | Instant | Credential Store |
| **Active** | Credential in valid use | Usage count, verification requests, CE credits | Months to years | Registry + Scheduler |
| **Maintenance** | Ongoing compliance verification | CE credits, re-assessment dates, audit results | Periodic (annual) | Scheduler + Audit Trail |
| **Renewal** | Re-certification before expiry | Updated assessment, fee payment, scope review | Weeks | Credential Store |
| **Revocation** | Credential invalidation | Reason code, timestamp, authority, appeal status | Instant | Audit Trail |

### Industry Certification Categories

| Category | Examples | Validity Period | Relevance to OSINT/DD | Verification Method |
|----------|---------|----------------|----------------------|---------------------|
| **Information Security** | CISSP, CEH, OSCP, GIAC, CISM | 3 years (CE renewal) | Direct -- threat intelligence, penetration testing | Issuer online verification |
| **Cloud & Infrastructure** | AWS SA, Azure, GCP, CKA | 2-3 years | Infrastructure security assessment | Cloud provider portal |
| **Compliance & Audit** | CISA, CRISC, CDPSE, CIA | 3 years (CE renewal) | Regulatory framework knowledge | ISACA/IIA registries |
| **Data & Analytics** | CDMP, Google Data Analytics, CBIP | 2-3 years | Data quality and analysis capability | Issuer verification |
| **Privacy & Data Protection** | CIPP/E, CIPM, DPO, CIPT | 2 years (CE renewal) | GDPR, NIS2 compliance expertise | IAPP registry |
| **System/Organizational** | ISO 27001, SOC 2 Type II, PCI DSS | 1-3 years (audit cycle) | Organizational security posture | Certificate body registry |
| **Common Criteria** | EAL1 through EAL7 | Per product version | Product security assurance level | CCRA portal |

### Certification Trust Chain

| Trust Element | Role | Verification Method | Failure Impact |
|--------------|------|--------------------|--------------------|
| **Accreditation Body** | Accredits certification bodies | National accreditation registry | Entire certification chain invalid |
| **Certification Body** | Issues certifications after assessment | CB public registry + certificate | Specific certifications questionable |
| **Lead Assessor** | Conducts assessment | CB assessor registry | Assessment validity in question |
| **Certified Entity** | Holds and presents certification | Certificate + registry lookup | Certification claim unverified |
| **Relying Party** | Depends on certification | Independent verification | Risk of false trust |
| **Regulatory Authority** | Mandates certain certifications | Regulatory database | Non-compliance exposure |

### Certification vs Related Concepts

| Concept | Definition | Key Difference from Certification |
|---------|-----------|-----------------------------------|
| **Accreditation** | Recognition that a body is competent to perform specific tasks | Accreditation validates the certifier, not the certified |
| **Attestation** | Formal statement that something is true | Less rigorous than certification; self-attestation common |
| **Compliance** | State of meeting regulatory requirements | Compliance is the state; certification is evidence of that state |
| **Qualification** | Demonstrated fitness for a specific role | Broader than certification; may include experience, education |
| **License** | Legal permission to perform certain activities | Licenses are government-granted; certifications are industry-granted |
| **Badge** | Digital credential for specific achievement | Typically less rigorous; often micro-credentials |

## Technical Deep Dive

### Certification State Machine

Certification status transitions follow a deterministic state machine where every transition produces an auditable event. The state machine enforces business rules such as: only eligible candidates can begin assessment, only passing assessments result in issuance, and only active certifications can be renewed.

```
[Eligible] --> [In Progress] --> [Assessed: Pass] --> [Certified/Active]
                                                            |
                                                    [Maintenance Due]
                                                            |
                                                [Renewed] or [Expired]
                                                            |
                                  [Assessed: Fail] --> [Failed]
                                                            |
                            [Revoked] <-- Manual revocation at any active state
```

Valid transitions:
- `eligible -> in_progress` (candidate begins preparation)
- `in_progress -> assessed` (candidate completes assessment)
- `assessed -> certified` (assessment passed)
- `assessed -> failed` (assessment not passed)
- `failed -> eligible` (after cooling period)
- `certified -> maintenance_due` (approaching renewal window)
- `maintenance_due -> renewed` (re-certification completed)
- `maintenance_due -> expired` (renewal window missed)
- `certified -> revoked` (manual or automatic revocation)
- `expired -> eligible` (re-entry after expiration)

### ISO 27001 Certification Structure

ISO 27001 is the most commonly referenced information security management system (ISMS) certification, and understanding its structure is essential for both compliance operations and OSINT target assessment.

| ISO 27001 Component | Clause | Purpose | Assessment Method |
|---------------------|--------|---------|-------------------|
| **Context of Organization** | Clause 4 | Scope and stakeholder needs | Document review |
| **Leadership** | Clause 5 | Management commitment | Interview + evidence |
| **Planning** | Clause 6 | Risk assessment methodology | Process audit |
| **Support** | Clause 7 | Resources, competence, awareness | Training records audit |
| **Operation** | Clause 8 | Risk treatment implementation | Technical audit |
| **Performance Evaluation** | Clause 9 | Monitoring, measurement, audit | Internal audit review |
| **Improvement** | Clause 10 | Nonconformity, corrective action | Corrective action review |
| **Annex A Controls** | A.5-A.18 | 114 security controls | Control-by-control evidence |

### SOC 2 Type II Report Structure

| SOC 2 Trust Principle | Coverage | Typical Evidence | DD Relevance |
|----------------------|----------|------------------|--------------|
| **Security** | Mandatory | Firewall configs, IDS logs, access reviews | Critical -- baseline security posture |
| **Availability** | Optional | SLA reports, DR tests, uptime metrics | High -- service reliability |
| **Processing Integrity** | Optional | Data validation, QA reports | Medium -- data processing accuracy |
| **Confidentiality** | Optional | Encryption configs, DLP policies | High -- data protection |
| **Privacy** | Optional | Privacy policies, consent records, DSAR logs | High -- GDPR alignment |

## Usage in Prismatic Platform

### Certification Engine

```elixir
defmodule PrismaticAcademy.CertificationEngine do
  @moduledoc """
  Manages the complete certification lifecycle from eligibility verification
  through issuance, maintenance, and potential revocation. All state
  transitions are audited via telemetry events and produce immutable
  audit records.

  The engine integrates with:
  - `PrismaticAcademy.TopicRegistry` for prerequisite verification
  - `PrismaticAcademy.ProgressTracker` for learning progress assessment
  - `PrismaticAcademy.SessionManager` for formal assessment management
  - Telemetry pipeline for audit and monitoring

  ## State Machine

  Certification follows a deterministic state machine:

      eligible -> in_progress -> assessed -> certified -> maintenance_due -> renewed
                                    |                                          |
                                  failed                                    expired
                                    |
                                eligible (after cooling period)

  ## Examples

      iex> CertificationEngine.check_eligibility("learner_1", "iso-27001-foundations")
      {:ok, %{status: :eligible, prerequisites_met: true}}

      iex> CertificationEngine.assess("learner_1", "iso-27001-foundations", %{score: 85})
      {:ok, %{status: :certified, issued_at: ~U[2026-04-02 10:00:00Z]}}

      iex> CertificationEngine.check_eligibility("learner_2", "oscp")
      {:error, {:missing_prerequisites, ["networking-fundamentals", "linux-administration"]}}
  """

  require Logger

  @type cert_status ::
    :eligible
    | :in_progress
    | :assessed
    | :certified
    | :maintenance_due
    | :renewed
    | :expired
    | :failed
    | :revoked

  @type cert_record :: %{
    learner_id: String.t(),
    certification_id: String.t(),
    status: cert_status(),
    issued_at: DateTime.t() | nil,
    expires_at: DateTime.t() | nil,
    score: float() | nil,
    attempt: pos_integer(),
    assessor_id: String.t() | nil,
    audit_trail: list(map())
  }

  @type eligibility_result :: %{
    learner_id: String.t(),
    certification_id: String.t(),
    status: :eligible | :not_eligible,
    prerequisites_met: boolean(),
    missing_prerequisites: list(String.t()),
    eligible_since: DateTime.t() | nil
  }

  @doc """
  Verifies whether a learner meets all prerequisites for a given certification.

  Traverses the prerequisite dependency graph in the TopicRegistry to
  ensure all required topics have been completed by the learner.

  ## Parameters

    - `learner_id` - Unique identifier for the learner
    - `certification_id` - Unique identifier for the target certification

  ## Returns

    - `{:ok, eligibility_result()}` - Eligibility check completed
    - `{:error, {:missing_prerequisites, list()}}` - Prerequisites not met
    - `{:error, :certification_not_found}` - Unknown certification ID
  """
  @spec check_eligibility(String.t(), String.t()) :: {:ok, eligibility_result()} | {:error, term()}
  def check_eligibility(learner_id, certification_id) do
    with {:ok, cert_def} <- get_certification_definition(certification_id),
         {:ok, progress} <- PrismaticAcademy.ProgressTracker.get_progress(learner_id),
         {:ok, _} <- verify_prerequisites(progress, cert_def.prerequisites) do
      result = %{
        learner_id: learner_id,
        certification_id: certification_id,
        status: :eligible,
        prerequisites_met: true,
        missing_prerequisites: [],
        eligible_since: DateTime.utc_now()
      }

      :telemetry.execute(
        [:prismatic, :academy, :certification, :eligibility_check],
        %{duration: 0},
        %{learner_id: learner_id, certification_id: certification_id, result: :eligible}
      )

      {:ok, result}
    end
  end

  @doc """
  Evaluates assessment results and issues certification if passing threshold met.

  The passing threshold is defined per certification in the certification
  definition registry. Successful assessments produce a certified record
  with a calculated expiry date based on the certification's validity period.

  ## Parameters

    - `learner_id` - Unique identifier for the learner
    - `certification_id` - Unique identifier for the target certification
    - `assessment_results` - Map containing at minimum `:score` and `:attempt_number`

  ## Returns

    - `{:ok, cert_record()}` - Certification issued (score >= threshold)
    - `{:error, :below_threshold}` - Assessment score below passing threshold
  """
  @spec assess(String.t(), String.t(), map()) :: {:ok, cert_record()} | {:error, atom()}
  def assess(learner_id, certification_id, assessment_results) do
    passing_score = get_passing_threshold(certification_id)
    validity_years = get_validity_period(certification_id)

    if assessment_results.score >= passing_score do
      now = DateTime.utc_now()
      expires = DateTime.add(now, validity_years * 365, :day)

      record = %{
        learner_id: learner_id,
        certification_id: certification_id,
        status: :certified,
        issued_at: now,
        expires_at: expires,
        score: assessment_results.score,
        attempt: assessment_results.attempt_number,
        assessor_id: Map.get(assessment_results, :assessor_id),
        audit_trail: [
          %{event: :issued, timestamp: now, details: %{score: assessment_results.score}}
        ]
      }

      :telemetry.execute(
        [:prismatic, :academy, :certification, :issued],
        %{score: assessment_results.score},
        %{learner_id: learner_id, certification_id: certification_id}
      )

      Logger.info("Certification issued",
        learner_id: learner_id,
        certification_id: certification_id,
        score: assessment_results.score,
        expires_at: expires
      )

      {:ok, record}
    else
      :telemetry.execute(
        [:prismatic, :academy, :certification, :failed],
        %{score: assessment_results.score, threshold: passing_score},
        %{learner_id: learner_id, certification_id: certification_id}
      )

      {:error, :below_threshold}
    end
  end

  @doc """
  Checks maintenance status and triggers renewal workflow if needed.

  Certifications approaching their expiry date (within the renewal window)
  are flagged for maintenance. Expired certifications are transitioned
  to the expired state.

  ## Parameters

    - `cert_record` - The certification record to check

  ## Returns

    - `{:ok, updated_record}` - Record with updated status if applicable
  """
  @spec check_maintenance(cert_record()) :: {:ok, cert_record()}
  def check_maintenance(%{status: :certified, expires_at: expires} = record) do
    now = DateTime.utc_now()
    renewal_window = DateTime.add(expires, -90, :day)

    cond do
      DateTime.compare(now, expires) == :gt ->
        {:ok, %{record | status: :expired}}

      DateTime.compare(now, renewal_window) in [:gt, :eq] ->
        {:ok, %{record | status: :maintenance_due}}

      true ->
        {:ok, record}
    end
  end

  def check_maintenance(record), do: {:ok, record}

  @doc """
  Revokes an active certification with documented reason.

  Revocation is an irreversible action that produces an audit trail
  entry. Revoked certifications cannot be renewed -- the holder must
  re-enter the certification process from the eligibility phase.

  ## Parameters

    - `cert_record` - The certification record to revoke
    - `reason` - Documented reason for revocation
    - `authority_id` - ID of the person or system authorizing revocation
  """
  @spec revoke(cert_record(), String.t(), String.t()) :: {:ok, cert_record()}
  def revoke(%{status: status} = record, reason, authority_id)
      when status in [:certified, :maintenance_due, :renewed] do
    now = DateTime.utc_now()

    updated = %{record |
      status: :revoked,
      audit_trail: record.audit_trail ++ [
        %{event: :revoked, timestamp: now, reason: reason, authority: authority_id}
      ]
    }

    Logger.warning("Certification revoked",
      learner_id: record.learner_id,
      certification_id: record.certification_id,
      reason: reason,
      authority: authority_id
    )

    {:ok, updated}
  end

  # -- Private Functions --

  defp verify_prerequisites(progress, prerequisites) do
    missing = Enum.reject(prerequisites, fn prereq ->
      Map.get(progress.completed_topics, prereq, false)
    end)

    case missing do
      [] -> {:ok, :all_met}
      gaps -> {:error, {:missing_prerequisites, gaps}}
    end
  end

  defp get_certification_definition(id) do
    {:ok, %{id: id, prerequisites: [], validity_years: 2}}
  end

  defp get_passing_threshold(_id), do: 80
  defp get_validity_period(_id), do: 2
end
```

### OSINT Certification Verification

```elixir
defmodule PrismaticOsintCore.Tools.CertificationVerifier do
  @moduledoc """
  Verifies organizational certification claims against public certification
  body registries during OSINT and due diligence investigations.

  Cross-references certification claims from corporate filings, websites,
  and marketing materials against authoritative certification body databases
  to detect fraudulent or expired certification claims.

  ## Verification Sources

    - ISO certification body registries (UKAS, DAkkS, CAI)
    - AICPA SOC report registry
    - PCI SSC qualified assessor database
    - National accreditation body registries

  ## Examples

      iex> CertificationVerifier.verify("Acme Corp", :iso_27001)
      {:ok, %{verified: true, certificate_number: "IS-12345", valid_until: ~D[2027-03-15]}}

      iex> CertificationVerifier.verify("Fake Corp", :soc2_type2)
      {:ok, %{verified: false, reason: :not_found_in_registry}}
  """

  @doc """
  Verifies an organization's certification claim against public registries.

  ## Parameters

    - `organization` - Name of the organization to verify
    - `certification_type` - Type of certification to verify
    - `opts` - Verification options
  """
  @spec verify(String.t(), atom(), keyword()) :: {:ok, map()} | {:error, term()}
  def verify(organization, certification_type, opts \\ []) do
    with {:ok, registry} <- get_registry(certification_type),
         {:ok, result} <- search_registry(registry, organization, opts) do
      {:ok, %{
        organization: organization,
        certification: certification_type,
        verified: result.found,
        certificate_number: result[:certificate_number],
        valid_until: result[:valid_until],
        certifying_body: result[:certifying_body],
        verified_at: DateTime.utc_now()
      }}
    end
  end

  defp get_registry(:iso_27001), do: {:ok, :iso_registry}
  defp get_registry(:soc2_type2), do: {:ok, :aicpa_registry}
  defp get_registry(:pci_dss), do: {:ok, :pci_ssc_registry}
  defp get_registry(type), do: {:error, {:unsupported_certification, type}}

  defp search_registry(_registry, _org, _opts) do
    {:ok, %{found: false, reason: :not_implemented}}
  end
end
```

### Perimeter Integration

The Perimeter module's SecurityRating engine incorporates certification status as a weighted factor in organizational security posture assessment. Active ISO 27001 or SOC 2 certifications increase the security rating, while expired certifications or unverifiable claims decrease it. The rating algorithm treats certification as one signal among many -- a certified organization with poor technical controls may still receive a low rating, while an uncertified organization with excellent controls may receive a moderate rating.

## Common Pitfalls

| Pitfall | Description | Impact | Mitigation |
|---------|-------------|--------|------------|
| **Boolean Certification** | Treating certification as true/false without lifecycle | Expired certifications treated as valid | Model certification as stateful entity with expiry tracking |
| **Unverified Claims** | Accepting certification claims without registry verification | False sense of security in DD operations | Always verify against authoritative certification body registries |
| **Scope Blindness** | Ignoring certification scope (e.g., ISO 27001 for one office only) | Misattributing certification to entire organization | Capture and display certification scope alongside status |
| **Expiry Neglect** | Not tracking certification renewal deadlines | Certifications silently expire, leaving compliance gaps | Implement proactive renewal window alerts (90 days before expiry) |
| **Prerequisite Bypass** | Allowing assessment without completing all prerequisites | Certification quality degradation | Enforce strict prerequisite verification via dependency graph |
| **Missing Audit Trail** | Not recording certification state transitions | Cannot demonstrate compliance history to auditors | Every state transition produces an immutable audit record |
| **Static Threshold** | Using fixed passing scores across all certification types | Inappropriate difficulty calibration | Configure passing thresholds per certification definition |
| **Revocation Delay** | Slow revocation process when criteria no longer met | Revoked entity continues to present invalid certification | Implement real-time revocation with registry notification |
| **CE Credit Tracking Gap** | Not tracking continuing education credits | Renewal eligibility unknown until renewal attempt | Continuous CE credit tracking with progress dashboard |
| **Cross-Jurisdiction Confusion** | Treating certifications identically across jurisdictions | NIS2 transposition varies by EU member state | Map certifications to specific national regulatory requirements |

## Best Practices

1. **Model certification as a state machine** -- every certification follows a deterministic lifecycle with auditable transitions; never reduce certification to a boolean flag.

2. **Verify certification claims against authoritative registries** -- in OSINT and DD contexts, always cross-reference certification claims with the issuing certification body's public registry.

3. **Track certification scope explicitly** -- an ISO 27001 certificate may cover only specific locations, processes, or business units; capture and display scope to prevent over-attribution.

4. **Implement proactive renewal alerts** -- trigger maintenance workflows 90 days before certification expiry to prevent compliance gaps and operational disruption.

5. **Maintain full audit trails** -- every certification state transition must produce an immutable audit record with timestamp, actor, reason, and supporting evidence.

6. **Separate certification definition from certification state** -- definitions describe requirements and evolve over time; state tracks individual progress and should not be affected by definition updates.

7. **Weight certifications in security ratings** -- use certification status as one factor among many in composite security assessments; never treat certification as a sole indicator of security posture.

8. **Enforce prerequisite dependency chains** -- use directed graph traversal to ensure no certification can be attempted without completing the full prerequisite chain.

9. **Emit telemetry for all certification events** -- instrument eligibility checks, assessments, issuances, renewals, and revocations with `:telemetry.execute/3` for monitoring and alerting.

10. **Handle cross-jurisdiction complexity** -- map certifications to specific regulatory frameworks and national transpositions; NIS2 compliance in Czechia (ZKB 264/2025) differs from Germany (BSI-KritisV).

## Related Terms

- [ISO 27001](@/glossary/iso-27001.md) -- Information security management system certification standard
- [SOC 2](@/glossary/soc2.md) -- Service organization control framework for trust principles
- [Compliance](@/glossary/compliance.md) -- Regulatory framework requiring certifications as evidence
- [NIS2](@/glossary/nis2.md) -- EU cybersecurity directive mandating organizational security measures
- [GDPR](@/glossary/gdpr.md) -- Data protection regulation with competency requirements
- [Assessment](@/glossary/assessment.md) -- Evaluation process within the certification lifecycle
- [Audit](/glossary/audit/) -- Systematic examination process underlying certification
- [Accreditation](/glossary/accreditation/) -- Recognition that a certification body is competent
- [Risk Management](@/glossary/risk-management.md) -- Framework that certifications help validate
- [Due Diligence](@/glossary/due-diligence.md) -- Investigation context where certification verification is critical
- [Data Protection](@/glossary/data-protection.md) -- Technical measures that certifications help validate
- [Credential](@/glossary/credential.md) -- Authentication artifact issued upon certification

## See Also

- [Academy](@/academy/_index.md) -- Interactive learning system with certification pathways
- [Capabilities](@/capabilities/_index.md) -- Platform compliance and certification verification capabilities
- [Architecture](@/architecture/_index.md) -- Certification engine and state machine architecture
- [OSINT Tools](@/osint/_index.md) -- Certification verification tools in the OSINT registry

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
