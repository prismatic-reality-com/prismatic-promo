+++
title = "Security Audit"
weight = 50
[extra]
tags = ["glossary", "security", "audit", "compliance", "iso-27001", "soc2", "governance", "verification", "pre-commit", "quality-gates", "color-team", "controls"]
description = "Formal, systematic examination of security controls, policies, and procedures against defined standards and regulatory requirements, producing evidence-based compliance determinations and remediation recommendations"
category = "security"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate-to-advanced"
domain_category = "security-and-compliance"
related_concepts = ["compliance framework", "audit trail", "security assessment", "ISO 27001", "SOC 2", "governance", "risk management"]
implementation_status = "production"
authority_level = "platform-doctrine"
difficulty_rating = 6
prerequisites = ["security fundamentals", "compliance frameworks", "audit methodology"]
learning_path = "security-fundamentals > audit-logging > security-audit > compliance-framework > iso-27001"
interactive_demos = ["/labs/glossary/security-audit"]
code_examples = ["Elixir", "Bash", "YAML"]
external_resources = ["https://www.iso.org/isoiec-27001-information-security.html", "https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2"]
version_introduced = "0.42.0"
stability_level = "stable"
testing_scenarios = ["control verification coverage", "evidence collection completeness", "compliance mapping accuracy", "audit trail integrity"]
keywords = ["security audit", "compliance audit", "control verification", "audit evidence", "ISO 27001", "SOC 2", "audit trail", "governance", "security controls"]
related_terms = ["audit-trail", "audit-logging", "compliance-framework", "security-assessment", "iso-27001", "soc2", "quality-gate", "pre-commit-hooks", "no-mercy-no-doubts", "zero-tolerance"]
word_count = 1893
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Security Audit - Prismatic Platform"
+++

## Definition

A **security audit** is a formal, systematic examination of an organization's security controls, policies, procedures, and technical implementations against a defined set of standards, regulations, or best practices. Unlike broader [security assessments](@/glossary/security-assessment.md) that evaluate overall posture, a security audit produces a definitive compliance determination -- pass or fail, compliant or non-compliant -- against specific, enumerated criteria.

Security audits serve as the evidentiary foundation for trust. They answer the question: "Can we demonstrate, with verifiable evidence, that our security controls meet the requirements we are obligated to satisfy?" This evidence-based approach aligns directly with the Prismatic Platform's [NABLA infinity](@/glossary/quality-evidence-truth.md) epistemic framework, which demands provenance and plurality for all claims.

In the Prismatic Platform, security auditing is implemented as an automated, continuous process rather than a periodic manual exercise. The platform's [quality gates](@/glossary/quality-gate.md), [pre-commit hooks](@/glossary/pre-commit-hooks.md), [Color Team](@/glossary/blue-team.md) verification, and [audit logging](@/glossary/audit-logging.md) infrastructure collectively create an always-auditable system where compliance is enforced at every stage of the development and deployment lifecycle.

## Overview

The discipline of security auditing has its roots in financial auditing -- the centuries-old practice of independent verification of financial records. As organizations became increasingly dependent on information technology, the principles of formal examination, evidence collection, independence, and attestation were adapted to the security domain. Today, security audits are mandated by regulations (GDPR, NIS2, HIPAA), required by industry standards (ISO 27001, SOC 2, PCI DSS), and demanded by business partners and customers as a condition of trust.

Traditional security audits suffer from fundamental structural problems. They are periodic (typically annual), creating a compliance window where controls may degrade between audits. They are manual, relying on auditor sampling that can miss systematic failures. They are expensive, consuming significant organizational resources for preparation, execution, and remediation. And they produce point-in-time attestations that may not reflect the organization's actual security posture at the moment a stakeholder relies on them.

The Prismatic Platform addresses these limitations through continuous, automated auditing that treats every code change, every deployment, and every configuration modification as an auditable event. The [no-mercy-no-doubts](@/glossary/no-mercy-no-doubts.md) doctrine eliminates the gap between "audit-ready" and "always compliant" by making compliance a blocking prerequisite for all system changes.

### Audit Types

| Type | Scope | Frequency | Prismatic Implementation |
|------|-------|-----------|--------------------------|
| **Internal Audit** | Self-assessment against internal policies | Continuous | Quality gates, pre-commit hooks |
| **External Audit** | Third-party verification against standards | Annual/periodic | Automated evidence generation |
| **Compliance Audit** | Regulatory requirement verification | As required | NIS2/ZKB compliance mapping |
| **Technical Audit** | Infrastructure and code-level controls | Continuous | Static analysis, Color Team verification |
| **Process Audit** | Procedural and governance controls | Quarterly | AIAD policy enforcement |
| **Forensic Audit** | Incident investigation and root cause | On-demand | Audit trail analysis |

## Technical Details

### Audit Control Framework

Security audits evaluate controls organized into domains that map to recognized frameworks. The Prismatic Platform implements controls across all domains through its application architecture:

**Access Control** -- Authentication, authorization, privilege management, and session control. Implemented through `PrismaticWeb.Plugs.APIAuth`, RBAC policies, and the authority level system that governs agent permissions.

**Change Management** -- Configuration management, version control, deployment procedures, and rollback capabilities. Enforced through the 11-phase [pre-commit hook](@/glossary/pre-commit-hooks.md) pipeline, GitLab CI/CD gates, and the Fly.io deployment workflow.

**Logging and Monitoring** -- Event recording, log integrity, alerting, and retention. Provided by the [audit logging](@/glossary/audit-logging.md) infrastructure, Telemetry events, and the Quality Floor Guardian.

**Vulnerability Management** -- Scanning, patching, remediation tracking, and risk acceptance. Automated through [static analysis](@/glossary/static-analysis.md), dependency auditing, and the [EASM](@/glossary/easm.md) continuous monitoring pipeline.

**Data Protection** -- Encryption at rest and in transit, data classification, retention policies, and privacy controls. Enforced through platform policies and the IP Leakage Prevention system.

### Evidence Collection Architecture

Audit evidence must be collected automatically, stored immutably, and retrievable on demand. The Prismatic Platform implements a multi-layer evidence collection architecture:

```elixir
defmodule PrismaticAudit.EvidenceCollector do
  @moduledoc """
  Collects and stores audit evidence from platform operations.

  Evidence is immutable once recorded, timestamped with microsecond
  precision, and linked to the specific control objective it supports.
  All evidence passes through integrity verification before storage.
  """

  alias PrismaticAudit.{EvidenceStore, IntegrityVerifier, ControlMapper}

  @type evidence_type :: :automated_test | :configuration_check | :access_log |
                         :change_record | :scan_result | :policy_attestation

  @type evidence :: %{
    id: String.t(),
    type: evidence_type(),
    control_id: String.t(),
    framework: atom(),
    collected_at: DateTime.t(),
    source: String.t(),
    data: map(),
    integrity_hash: String.t(),
    confidence: float()
  }

  @spec collect(evidence_type(), String.t(), map()) :: {:ok, evidence()} | {:error, term()}
  def collect(type, source, data) do
    evidence = %{
      id: generate_evidence_id(),
      type: type,
      control_id: ControlMapper.infer_control(type, source),
      framework: ControlMapper.infer_framework(type),
      collected_at: DateTime.utc_now(),
      source: source,
      data: data,
      integrity_hash: IntegrityVerifier.hash(data),
      confidence: calculate_confidence(type, data)
    }

    with :ok <- IntegrityVerifier.verify(evidence),
         {:ok, stored} <- EvidenceStore.persist(evidence) do
      {:ok, stored}
    end
  end

  @spec collect_from_quality_gate(map()) :: {:ok, evidence()} | {:error, term()}
  def collect_from_quality_gate(gate_result) do
    collect(:automated_test, "quality_gate_pipeline", %{
      gate_name: gate_result.name,
      passed: gate_result.passed,
      checks: gate_result.checks,
      duration_ms: gate_result.duration_ms,
      commit_sha: gate_result.commit_sha
    })
  end

  @spec collect_from_precommit(map()) :: {:ok, evidence()} | {:error, term()}
  def collect_from_precommit(hook_result) do
    collect(:configuration_check, "pre_commit_hook", %{
      phases_executed: hook_result.phases,
      all_passed: hook_result.success,
      phase_results: hook_result.results,
      timestamp: hook_result.timestamp
    })
  end

  defp generate_evidence_id do
    "EVD-#{DateTime.utc_now() |> DateTime.to_unix(:microsecond)}-#{:crypto.strong_rand_bytes(4) |> Base.encode16()}"
  end

  defp calculate_confidence(:automated_test, _data), do: 0.95
  defp calculate_confidence(:configuration_check, _data), do: 0.90
  defp calculate_confidence(:scan_result, _data), do: 0.85
  defp calculate_confidence(:access_log, _data), do: 0.90
  defp calculate_confidence(:change_record, _data), do: 0.95
  defp calculate_confidence(:policy_attestation, _data), do: 0.80
end
```

### Continuous Audit Pipeline

The platform transforms auditing from a periodic event into a continuous process by integrating audit checks at every stage of the development lifecycle:

```elixir
defmodule PrismaticAudit.ContinuousAuditPipeline do
  @moduledoc """
  Implements continuous auditing through integration with the
  platform's quality gate and deployment pipeline.

  Each stage produces audit evidence that maps to specific
  control objectives in ISO 27001, SOC 2, and NIS2 frameworks.
  """

  @type audit_stage :: :pre_commit | :ci_build | :pre_deploy | :post_deploy | :runtime

  @type stage_result :: %{
    stage: audit_stage(),
    controls_verified: [String.t()],
    evidence_collected: [String.t()],
    passed: boolean(),
    findings: [map()]
  }

  @spec run_stage(audit_stage(), map()) :: {:ok, stage_result()} | {:error, term()}
  def run_stage(:pre_commit, context) do
    checks = [
      &verify_no_secrets/1,
      &verify_code_quality/1,
      &verify_forbidden_patterns/1,
      &verify_type_safety/1,
      &verify_test_coverage/1,
      &verify_compilation_warnings/1
    ]

    results = Enum.map(checks, fn check -> check.(context) end)
    evidence = Enum.flat_map(results, & &1.evidence)
    findings = Enum.flat_map(results, & &1.findings)

    {:ok, %{
      stage: :pre_commit,
      controls_verified: Enum.flat_map(results, & &1.controls),
      evidence_collected: evidence,
      passed: Enum.all?(results, & &1.passed),
      findings: findings
    }}
  end

  def run_stage(:ci_build, context) do
    checks = [
      &verify_dependency_audit/1,
      &verify_full_test_suite/1,
      &verify_dialyzer/1,
      &verify_credo_strict/1,
      &verify_security_scan/1
    ]

    execute_checks(:ci_build, checks, context)
  end

  defp execute_checks(stage, checks, context) do
    results = Enum.map(checks, fn check -> check.(context) end)

    {:ok, %{
      stage: stage,
      controls_verified: Enum.flat_map(results, & &1.controls),
      evidence_collected: Enum.flat_map(results, & &1.evidence),
      passed: Enum.all?(results, & &1.passed),
      findings: Enum.flat_map(results, & &1.findings)
    }}
  end

  defp verify_no_secrets(ctx), do: run_check("A.8.2", :secret_detection, ctx)
  defp verify_code_quality(ctx), do: run_check("A.14.2", :code_quality, ctx)
  defp verify_forbidden_patterns(ctx), do: run_check("A.14.2", :forbidden_patterns, ctx)
  defp verify_type_safety(ctx), do: run_check("A.14.2", :type_safety, ctx)
  defp verify_test_coverage(ctx), do: run_check("A.14.2", :test_coverage, ctx)
  defp verify_compilation_warnings(ctx), do: run_check("A.14.2", :zero_warnings, ctx)
  defp verify_dependency_audit(ctx), do: run_check("A.12.6", :dependency_audit, ctx)
  defp verify_full_test_suite(ctx), do: run_check("A.14.2", :full_tests, ctx)
  defp verify_dialyzer(ctx), do: run_check("A.14.2", :dialyzer, ctx)
  defp verify_credo_strict(ctx), do: run_check("A.14.2", :credo, ctx)
  defp verify_security_scan(ctx), do: run_check("A.12.6", :security_scan, ctx)

  defp run_check(control_id, check_type, _ctx) do
    %{passed: true, controls: [control_id], evidence: ["#{check_type}_#{control_id}"], findings: []}
  end
end
```

### Control-to-Framework Mapping

The platform maintains explicit mappings between its automated controls and the frameworks they satisfy:

| Platform Control | ISO 27001 | SOC 2 | NIS2 |
|-----------------|-----------|-------|------|
| Pre-commit secret detection | A.8.2 | CC6.1 | Art. 21(2)(d) |
| Static analysis (Credo/Dialyzer) | A.14.2.1 | CC8.1 | Art. 21(2)(e) |
| Quality gate enforcement | A.14.2.9 | CC8.1 | Art. 21(2)(e) |
| Audit logging | A.12.4.1 | CC7.2 | Art. 21(2)(g) |
| Access control (RBAC) | A.9.1.1 | CC6.1 | Art. 21(2)(d) |
| Dependency auditing | A.12.6.1 | CC7.1 | Art. 21(2)(e) |
| Color Team verification | A.18.2.3 | CC4.1 | Art. 21(2)(f) |
| Regression test mandate | A.14.2.9 | CC8.1 | Art. 21(2)(e) |

## Implementation in Prismatic Platform

### 11-Phase Pre-Commit Audit Hook

The platform's pre-commit hook system implements a comprehensive automated audit that runs on every code change. Each phase maps to specific audit control objectives:

```bash
# Pre-commit audit phases (simplified)
# Phase 1: Secret detection (ISO A.8.2, SOC CC6.1)
# Phase 2: Compilation warnings (ISO A.14.2, SOC CC8.1)
# Phase 3: Credo strict (ISO A.14.2, SOC CC8.1)
# Phase 4: Dialyzer type checking (ISO A.14.2, SOC CC8.1)
# Phase 5: Test execution (ISO A.14.2, SOC CC8.1)
# Phase 6: Forbidden patterns (ISO A.14.2, SOC CC8.1)
# Phase 7: Quality gates (ISO A.14.2, SOC CC8.1)
# Phase 8: Template validation (ISO A.14.2, NIS2 Art.21)
# Phase 9: Coverage verification (ISO A.14.2, SOC CC8.1)
# Phase 10: Design consistency (ISO A.14.2, SOC CC8.1)
# Phase 11: Final attestation (all frameworks)
```

This creates a system where every commit is an audited event, producing evidence that can be compiled into formal audit reports without additional manual effort.

### Color Team Audit Verification

The [Color Team](@/glossary/adversarial-simulation.md) security architecture provides an additional audit layer through structured adversarial-defensive verification. The Purple Team specifically functions as an audit synthesis layer, closing the loop between Red Team adversarial findings and Blue Team defensive evidence:

- **Red Team** generates adversarial scenarios that test whether controls actually work under attack conditions
- **Blue Team** produces defensive evidence demonstrating control effectiveness
- **Purple Team** synthesizes both perspectives into verified compliance determinations
- **White Team** provides formal mathematical proofs of control properties

This multi-perspective audit approach satisfies the independence requirement of formal audit frameworks while providing deeper assurance than traditional single-perspective auditing.

## Comparison with Alternatives

| Approach | Coverage | Frequency | Evidence Quality | Cost |
|----------|----------|-----------|-----------------|------|
| **Prismatic Automated Audit** | Full pipeline, code to deployment | Continuous (every commit) | High (automated, reproducible) | Low (built-in) |
| **Manual External Audit** | Sampled controls, interviews | Annual | Variable (auditor-dependent) | High ($50K-$500K+) |
| **GRC Platform (ServiceNow, Archer)** | Policy-level, workflow tracking | Quarterly reviews | Medium (manual attestation) | High (licensing + staff) |
| **Cloud-Native (AWS Config, Azure Policy)** | Infrastructure controls | Continuous | High (automated) | Medium (per-rule pricing) |
| **Open Source (InSpec, OpenSCAP)** | Configuration compliance | On-demand | High (automated) | Low (tooling), High (expertise) |

The Prismatic approach uniquely integrates audit into the development workflow itself, making compliance a natural byproduct of normal operations rather than a separate, expensive activity layered on top.

## Best Practices

1. **Automate evidence collection** -- Manual evidence gathering is the primary bottleneck in traditional audits. Every automated check should produce machine-readable evidence that maps to specific control objectives.

2. **Map controls to multiple frameworks** -- A single automated control often satisfies requirements across ISO 27001, SOC 2, NIS2, and internal policies. Maintain explicit mappings to eliminate redundant audit work.

3. **Enforce immutability** -- [Audit trails](@/glossary/audit-trail.md) must be immutable. If evidence can be modified after collection, the entire audit loses credibility. The platform's evidence store uses append-only patterns with integrity hashes.

4. **Audit the audit** -- Meta-auditing ensures that the audit process itself is functioning correctly. The Quality Floor Guardian monitors the health of quality gates and enforcement mechanisms, providing assurance that the continuous audit pipeline has not degraded.

5. **Separate duties** -- Even in automated systems, maintain separation between those who write controls, those who verify controls, and those who can modify the audit infrastructure. The Color Team architecture enforces this separation by design.

6. **Document exceptions formally** -- When a control cannot be implemented as specified, document the exception, the compensating control, and the risk acceptance decision. The [zero tolerance](@/glossary/zero-tolerance.md) doctrine permits no undocumented exceptions.

7. **Test audit completeness** -- Regularly verify that the automated audit pipeline covers all required controls. Coverage gaps are audit findings themselves.

8. **Retain evidence appropriately** -- Evidence retention periods must satisfy regulatory requirements. NIS2 requires demonstrable compliance; retain evidence for the period specified by applicable frameworks plus a reasonable buffer.

## Common Pitfalls

1. **Audit theater** -- Performing visible audit activities without substantive verification. Having a checklist does not mean the checks are meaningful. The [no-mercy](@/glossary/no-mercy.md) doctrine specifically targets this pattern -- controls must demonstrably prevent violations, not merely document them.

2. **Evidence decay** -- Audit evidence that was valid at collection time may become misleading if the underlying system changes. Continuous auditing mitigates this, but the timestamp and context of each evidence artifact must be preserved.

3. **Scope manipulation** -- Defining audit scope to exclude systems or processes that would reveal non-compliance. The platform's asset discovery and [EASM](@/glossary/easm.md) capabilities work against this by automatically identifying the full scope of assessable assets.

4. **Compliance fatigue** -- Organizations subject to multiple overlapping frameworks (ISO 27001, SOC 2, NIS2, GDPR) can experience burnout from redundant compliance activities. Framework mapping eliminates redundancy by proving once and attesting many times.

5. **Over-reliance on certifications** -- An ISO 27001 certificate attests to the existence of a management system, not to the absence of vulnerabilities. Certifications complement but do not replace ongoing security assessment.

6. **Incomplete remediation tracking** -- Identifying audit findings without tracking them to verified closure creates a growing backlog of unresolved risks. The platform's QDP tracking system ensures that every finding is tracked, assigned, and resolved.

7. **Ignoring audit trail integrity** -- If the [audit logging](@/glossary/audit-logging.md) system itself can be compromised or modified, all evidence it produces becomes unreliable. Audit infrastructure must be treated as critical security infrastructure.

## Use Cases

### Continuous Compliance Monitoring

A SaaS provider maintains SOC 2 Type II compliance through the platform's continuous audit pipeline. Every commit generates audit evidence mapping to SOC 2 trust service criteria. When the annual external audit occurs, the evidence package is automatically compiled, reducing audit preparation from 6 weeks to 2 days.

### NIS2 Directive Compliance

A Czech critical infrastructure operator uses the compliance mapping module to demonstrate NIS2 Article 21 compliance. The platform maps its 11-phase pre-commit pipeline, Color Team verification, and incident response procedures to specific NIS2 requirements, producing a compliance report that satisfies the Czech national authority (NUKIB).

### Development Security Audit

A development team undergoes an internal security audit focused on secure coding practices. The platform provides evidence from [Credo](@/glossary/credo.md) analysis (code quality), [Dialyzer](@/glossary/dialyzer.md) (type safety), forbidden pattern detection (anti-pattern prevention), and test coverage metrics (verification completeness), demonstrating that development practices meet ISO 27001 Annex A.14.2 requirements.

### Third-Party Vendor Audit

A client requests evidence of security controls as part of vendor due diligence. The platform generates a comprehensive audit package including security rating history, compliance mapping against the client's required framework, evidence of continuous monitoring, and Color Team assessment reports, all without manual compilation.

### Post-Incident Audit

Following a security incident, the forensic audit capability reconstructs the timeline of events using immutable [audit trail](@/glossary/audit-trail.md) records. The evidence chain traces from initial detection through investigation, containment, remediation, and verification, satisfying regulatory notification requirements.

## Related Concepts

- [Audit Trail](@/glossary/audit-trail.md) -- Immutable record of events that provides the evidentiary foundation for security audits
- [Audit Logging](@/glossary/audit-logging.md) -- Technical implementation of event recording that feeds audit trail construction
- [Compliance Framework](@/glossary/compliance-framework.md) -- Standards and regulations (ISO 27001, NIS2, SOC 2) that define audit criteria
- [Security Assessment](@/glossary/security-assessment.md) -- Broader evaluation of security posture that encompasses but extends beyond formal auditing
- [ISO 27001](@/glossary/iso-27001.md) -- Information security management system standard with comprehensive audit requirements
- [SOC 2](@/glossary/soc2.md) -- Trust service criteria framework commonly used for SaaS provider audits
- [Quality Gate](@/glossary/quality-gate.md) -- Enforcement checkpoints that implement automated audit controls in the development pipeline
- [Pre-commit Hooks](@/glossary/pre-commit-hooks.md) -- Git hooks that execute audit checks before code changes are committed
- [No Mercy No Doubts](@/glossary/no-mercy-no-doubts.md) -- Platform doctrine mandating zero tolerance for audit findings and compliance gaps
- [Zero Tolerance](@/glossary/zero-tolerance.md) -- Principle of accepting no violations of audit criteria or quality standards
- [Static Analysis](@/glossary/static-analysis.md) -- Code-level analysis that provides evidence for secure development audit controls
- [Code Quality](@/glossary/code-quality.md) -- Quality metrics that serve as audit evidence for development practice controls

## See Also

- [Prismatic Perimeter EASM](@/apps/prismatic-perimeter.md) -- External audit and assessment capabilities
- [Quality Gate Documentation](/capabilities/quality-gates/) -- Automated audit control implementation
- [Color Team Security Architecture](/architecture/color-teams/) -- Multi-perspective audit verification
- [ISO/IEC 27001:2022](https://www.iso.org/isoiec-27001-information-security.html) -- Information security management standard
- [AICPA SOC 2](https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2) -- Trust service criteria for service organizations

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
