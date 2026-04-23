+++
title = "cer-compliance-commander"
weight = 66
[extra]
domain = "compliance"
level = "L3"
description = "Strategic commander for Czech Critical Entity Resilience (CER) compliance operations, enabling organizations to meet requirements of:"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["nis2", "zkb", "no-mercy", "no-doubts", "trinity-gate", "aiad", "attack-surface", "telemetry", "ecto", "lean4"]
domain_normalized = "compliance"
content_version = "1.1.0"
last_enhanced = "2026-02-14"
word_count = 420
quality_score = 62
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["cer-compliance-commander", "Strategic", "Czech", "Critical", "Entity", "Resilience", "agents", "agent", "Prismatic Platform", "Phase"]
tags = ["agents", "agent", "cer-compliance-commander", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "cer-compliance-commander - Prismatic Platform"
+++

## Overview

The CER Compliance Commander operates as an L3 [strategic command](@/glossary/strategic-command.md) agent within the Compliance domain of the Prismatic Platform. This agent serves as the strategic authority for Czech Critical Entity Resilience (CER) compliance operations, enabling organizations to meet the requirements of the EU [NIS2](@/glossary/nis2.md) Directive (2022/2555), Czech [ZKB](@/glossary/zkb.md) 264/2025 Sb., [GDPR](@/glossary/gdpr.md), and related regulatory frameworks governing critical infrastructure protection. In a regulatory landscape where the intersection of European Union directives and Czech national implementation creates layered compliance obligations, this agent provides automated assessment, gap analysis, and evidence management that reduces the operational burden of maintaining continuous compliance.

Compliance in the Czech regulatory context presents unique challenges that generic compliance tools fail to address. The CER Compliance Commander maintains current knowledge of the Czech transposition of EU directives, understanding the specific technical controls required by ZKB 264/2025 Sb. that go beyond the general NIS2 framework. It maps abstract directive requirements to concrete, verifiable technical controls, coordinates screening operations through the Czech registry system, and produces audit-ready documentation that satisfies both Czech National Cyber and Information Security Agency (NUKIB) requirements and broader European regulatory expectations. This agent is part of the platform's 434-strong autonomous agent ecosystem, built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard.

## Architecture

The CER Compliance Commander implements a layered compliance processing architecture that separates regulatory knowledge from assessment logic and evidence management.

**Regulatory Knowledge Layer** -- The foundation layer maintains structured representations of all applicable regulatory frameworks. Each regulation is decomposed into individual requirements, mapped to specific technical controls, and linked to evidence types that satisfy audit verification. The knowledge base covers NIS2 Directive articles, ZKB implementation measures, CER Directive provisions, and GDPR data protection requirements. Regulatory updates are tracked through monitoring of official publications (Sbirka zakonu, EUR-Lex) and processed through change impact analysis to identify new or modified compliance obligations.

**Assessment Engine** -- The core processing layer performs automated compliance assessments against the regulatory knowledge base. The engine evaluates the organization's current state across all applicable requirements, identifying gaps where technical controls are missing, insufficient, or improperly implemented. Assessments produce quantified compliance scores with severity-weighted gap analysis, enabling prioritization of remediation efforts based on regulatory penalty exposure and operational risk.

**Evidence Management Layer** -- The top layer handles the complete lifecycle of compliance evidence, from collection through audit presentation. Evidence artifacts are cryptographically hashed at collection time, stored with immutable provenance metadata, and organized into audit-ready packages that align with specific regulatory requirements. The evidence chain ensures that every compliance claim can be traced from the presented evidence through the assessment logic to the specific regulatory requirement it addresses.

## Core Capabilities

- **Multi-framework compliance assessment** performing automated gap analysis across NIS2, ZKB, CER, and GDPR requirements simultaneously, producing unified compliance reports that highlight cross-framework dependencies and shared controls
- **Automated audit preparation** collecting, organizing, and validating evidence artifacts with cryptographic integrity verification, producing audit packages that satisfy regulatory auditor expectations for completeness, traceability, and tamper resistance
- **Employee and supplier screening** coordinating background verification through Czech [registry](@/glossary/registry-otp.md) integration with configurable risk scoring thresholds, maintaining screening history with full audit trails
- **Regulatory change tracking** monitoring legislative updates in both Czech and EU jurisdictions through official publication feeds, analyzing change impact against current compliance posture, and proactively identifying new obligations before enforcement deadlines
- **Risk scoring and prioritization** quantifying compliance gaps by severity, regulatory penalty exposure, and operational impact, enabling evidence-based allocation of remediation resources to the highest-risk gaps
- **Evidence chain management** maintaining cryptographically verifiable provenance for all compliance evidence from collection through audit presentation, ensuring chain-of-custody integrity that withstands regulatory scrutiny
- **Cross-regulation control mapping** identifying technical controls that satisfy requirements from multiple regulations simultaneously, eliminating duplicate implementation effort and maintaining consistent control effectiveness across frameworks

## Implementation

The compliance assessment engine is implemented using [Ecto](@/glossary/ecto.md) schemas for persistent compliance state and GenServer processes for real-time assessment coordination.

```elixir
defmodule Prismatic.Compliance.CER.Commander do
  @moduledoc """
  Strategic commander for Czech Critical Entity Resilience compliance.
  Coordinates multi-framework assessment, evidence management, and
  audit preparation across NIS2, ZKB, CER, and GDPR requirements.
  """
  use GenServer

  alias Prismatic.Compliance.{
    AssessmentEngine,
    EvidenceManager,
    RegulatoryKnowledge,
    ScreeningCoordinator
  }

  @type compliance_result :: %{
    framework: atom(),
    score: float(),
    gaps: list(gap()),
    evidence: list(evidence_ref()),
    assessed_at: DateTime.t()
  }

  @type gap :: %{
    requirement_id: String.t(),
    severity: :critical | :high | :medium | :low,
    description: String.t(),
    remediation: String.t(),
    penalty_exposure: Decimal.t()
  }

  @spec assess_compliance(String.t(), list(atom())) :: {:ok, list(compliance_result())} | {:error, term()}
  def assess_compliance(entity_id, frameworks \\ [:nis2, :zkb, :cer, :gdpr]) do
    GenServer.call(__MODULE__, {:assess, entity_id, frameworks}, :timer.minutes(5))
  end

  @spec prepare_audit(String.t(), atom()) :: {:ok, audit_package()} | {:error, term()}
  def prepare_audit(entity_id, framework) do
    GenServer.call(__MODULE__, {:prepare_audit, entity_id, framework}, :timer.minutes(10))
  end

  @impl true
  def handle_call({:assess, entity_id, frameworks}, _from, state) do
    results =
      frameworks
      |> Task.async_stream(fn framework ->
        knowledge = RegulatoryKnowledge.requirements(framework)
        evidence = EvidenceManager.collect(entity_id, framework)
        AssessmentEngine.evaluate(entity_id, knowledge, evidence)
      end, max_concurrency: 4, timeout: :timer.minutes(2))
      |> Enum.map(fn {:ok, result} -> result end)

    :telemetry.execute(
      [:prismatic, :compliance, :assessment_complete],
      %{frameworks_assessed: length(results)},
      %{entity_id: entity_id}
    )

    {:reply, {:ok, results}, state}
  end
end
```

## Integration Points

The CER Compliance Commander coordinates with multiple platform agents and external systems to deliver comprehensive compliance coverage.

| Component | Integration Type | Function |
|-----------|-----------------|----------|
| [cer-screening-specialist](@/agents/cer-screening-specialist.md) | Domain Specialist | Executes specialized CER screening workflows including employee background checks against Czech registry systems |
| [employee-screening-specialist](@/agents/employee-screening-specialist.md) | Screening Operations | Performs detailed employee background verification with configurable risk scoring and audit trail maintenance |
| [supplier-vetting-specialist](@/agents/supplier-vetting-specialist.md) | Supply Chain Assessment | Conducts supplier due diligence and risk assessment for CER compliance, evaluating supply chain resilience |
| [compliance-auditing-specialist](@/agents/compliance-auditing-specialist.md) | Audit Coordination | Manages audit lifecycle from planning through execution to findings resolution and follow-up |
| Czech Business Registry | External Data Source | Provides company registration data, ownership structures, and financial indicators for screening operations |
| NUKIB Guidelines | Regulatory Reference | Supplies Czech-specific technical control requirements and implementation guidance |
| [Prismatic Perimeter](@/glossary/prismatic-perimeter.md) | Security Assessment | Provides [attack surface](@/glossary/attack-surface.md) data that feeds into NIS2 security control assessments |

## Operational Workflow

The CER Compliance Commander executes a structured six-phase compliance lifecycle that ensures continuous regulatory coverage.

**Phase 1: Regulatory Baseline** -- The commander establishes the applicable regulatory baseline by analyzing the organization's sector classification, critical entity designation status, and geographic scope. This determines which combination of NIS2, ZKB, CER, and GDPR requirements apply, creating a tailored compliance requirement set.

**Phase 2: Control Mapping** -- Each regulatory requirement is mapped to specific technical controls that satisfy the requirement. The mapping identifies shared controls that cover multiple requirements across frameworks, eliminating duplicate implementation effort. Control effectiveness criteria are established for each mapping.

**Phase 3: Gap Assessment** -- The assessment engine evaluates the organization's current control implementation against the mapped requirements. Gaps are classified by severity and quantified by regulatory penalty exposure. The assessment produces a prioritized remediation roadmap.

**Phase 4: Evidence Collection** -- For controls that are properly implemented, the evidence management layer collects and validates supporting evidence. Evidence is cryptographically hashed, timestamped, and linked to specific regulatory requirements through the control mapping.

**Phase 5: Screening Operations** -- Employee and supplier screening workflows execute against Czech registry systems. Screening results are integrated into the compliance assessment, with adverse findings triggering risk escalation and remediation requirements.

**Phase 6: Audit Package Assembly** -- All assessment results, evidence artifacts, screening reports, and gap remediation documentation are assembled into framework-specific audit packages ready for regulatory submission.

## NABLA Compliance

Compliance operations require the highest epistemic rigor, making NABLA Infinity axiom compliance essential for the CER Compliance Commander.

| Axiom | Implementation |
|-------|---------------|
| **Signal Plurality** | Compliance assessments require evidence from at least two independent verification methods before accepting a control as effective |
| **Contradiction Preservation** | When screening results conflict with self-reported compliance declarations, both signals are preserved for investigation rather than automatically resolving in either direction |
| **Provenance Mandatory** | Every compliance finding carries a complete provenance chain from the regulatory requirement through the control mapping to the specific evidence that supports or contradicts compliance |
| **Time Decay** | Compliance evidence carries expiration dates aligned with regulatory review cycles; stale evidence triggers re-verification before inclusion in audit packages |
| **Source Independence** | Control effectiveness assessments combine automated technical verification with manual audit observations, weighting independent sources higher |
| **Unknown Valid** | Requirements where compliance status cannot be determined are explicitly marked as unknown rather than assumed compliant, triggering focused assessment |

All compliance conclusions pass [Trinity Gate](@/glossary/trinity-gate.md) validation ensuring structural consistency of evidence, logical consistency of conclusions, and [formal verification](@/glossary/formal-verification.md) of critical controls.

## Configuration

```elixir
config :prismatic_compliance, Prismatic.Compliance.CER.Commander,
  # Applicable regulatory frameworks
  frameworks: [:nis2, :zkb, :cer, :gdpr],
  # Compliance score threshold for passing (percentage)
  pass_threshold: 85.0,
  # Evidence expiration period (days)
  evidence_ttl_days: 365,
  # Maximum concurrent screening operations
  screening_concurrency: 10,
  # Czech registry API endpoint
  registry_endpoint: "https://or.justice.cz/ias/ui/",
  # Audit package format
  audit_format: :pdf_with_evidence,
  # Regulatory update check interval (hours)
  regulatory_check_interval: 24
```

## Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| Full compliance assessment | < 5 minutes | Time to assess all frameworks for a single entity |
| Individual framework assessment | < 90 seconds | Time to complete NIS2, ZKB, CER, or GDPR assessment independently |
| Evidence collection | < 30 seconds | Time to collect and validate evidence for a single control |
| Screening operation | < 60 seconds | Time to complete a single employee or supplier screening check |
| Audit package generation | < 10 minutes | Time to assemble complete audit package for a single framework |
| Regulatory update processing | < 5 minutes | Time to analyze and integrate a regulatory change into the knowledge base |

## Related Resources

- [**cer-screening-specialist**](@/agents/cer-screening-specialist.md) (L3) -- Specialized CER screening workflows and evidence collection
- [**employee-screening-specialist**](@/agents/employee-screening-specialist.md) -- Employee background verification against Czech registries
- [**supplier-vetting-specialist**](@/agents/supplier-vetting-specialist.md) -- Supplier due diligence and supply chain risk assessment
- [**compliance-auditing-specialist**](@/agents/compliance-auditing-specialist.md) -- Audit lifecycle management and findings resolution
- [NIS2 Directive](@/glossary/nis2.md) -- EU Network and Information Security Directive 2022/2555
- [ZKB](@/glossary/zkb.md) -- Czech Cybersecurity Act implementation measure 264/2025 Sb.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)