+++
title = "cer-screening-specialist"
weight = 67
[extra]
domain = "domain"
level = "L3"
description = "Comprehensive employee screening agent for Czech Critical Infrastructure (CER) compliance. Version 2.1 adds CLI tooling (mix cer.screen), REST API endpoints (/api/cer/screen), a..."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "hot-code-reload", "telemetry", "phoenix"]
domain_normalized = "general"
content_version = "1.0.0"
last_enhanced = "2026-02-01"
word_count = 217
quality_score = 42
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["cer-screening-specialist", "Comprehensive", "Czech", "Critical", "Infrastructure", "Version", "REST", "agents", "agent", "Prismatic Platform"]
tags = ["agents", "agent", "cer-screening-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "cer-screening-specialist - Prismatic Platform"
+++

## Overview

The CER Screening Specialist operates as an L3 [strategic command](/glossary/strategic-command/) agent within the Domain domain of the Prismatic Platform, providing comprehensive employee and entity screening capabilities for Czech Critical Infrastructure (CER) compliance. Version 2.1 of this agent introduces CLI tooling through [mix](/glossary/mix/) tasks (`mix cer.screen`), [REST API](/glossary/rest-api/) endpoints (`/api/cer/screen`), and a LiveView dashboard for interactive screening management. The agent automates the complex process of verifying individuals and organizations against Czech registry systems, producing compliance-ready screening reports with full audit trails.

Czech critical infrastructure regulation requires organizations designated as critical entities to conduct background screening of personnel with access to critical systems. This screening must verify identity against official registries, check for criminal records, validate professional qualifications, and assess potential conflict-of-interest situations. The CER Screening Specialist automates this multi-registry verification process, reducing screening turnaround from days of manual work to minutes of automated processing. Each screening operation produces a structured report with evidence provenance that satisfies NUKIB auditor requirements. This agent is part of the platform's 434-strong autonomous agent ecosystem, built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard, operating under the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine.

## Architecture

The CER Screening Specialist implements a pipeline-based screening architecture with pluggable registry adapters and configurable screening profiles.

**Screening Profile Engine** -- The entry point defines screening profiles that specify which checks are required for different personnel categories. A profile for personnel with access to critical OT systems might require identity verification, criminal record check, financial status check, and professional qualification validation. A profile for administrative staff might require only identity verification and basic background check. Profiles are configurable per organization and personnel category, aligning with the principle of proportionate screening.

**Registry Adapter Layer** -- The platform connects to multiple Czech registry systems through pluggable adapters that abstract the specific API protocols, authentication mechanisms, and data formats of each registry. Adapters exist for the Czech Business Registry (OR), Trade Registry (RZP), Insolvency Registry (ISIR), and Criminal Records Registry. Each adapter implements a common interface that normalizes registry responses into a unified screening result format, enabling consistent processing regardless of the underlying data source.

**Scoring and Assessment Engine** -- Raw registry results are processed through a configurable risk scoring model that assigns severity levels to findings. A criminal record for financial fraud in a screening for a financial systems administrator would score differently than the same record for a facilities maintenance role. The scoring model supports configurable weight tables that organizations can adjust based on their specific risk appetite and regulatory requirements.

**Report Generation Pipeline** -- Screening results are assembled into structured reports that include the screening profile used, each registry check performed with its result, the risk score calculation with contributing factors, and a final screening recommendation. Reports carry cryptographic signatures and evidence provenance chains that enable auditors to verify the integrity and completeness of the screening process.

## Core Capabilities

- **Multi-registry parallel screening** executing identity verification, criminal record checks, financial status assessment, and qualification validation across multiple Czech registries simultaneously, reducing total screening time through concurrent processing
- **Configurable screening profiles** supporting organization-specific and role-specific screening requirements, ensuring proportionate screening depth aligned with the access level and criticality of the screened position
- **Risk-based scoring** applying configurable risk models that weight screening findings by relevance to the specific role, producing nuanced risk assessments rather than binary pass/fail determinations
- **CLI tooling integration** through `mix cer.screen` commands that enable batch screening operations, scheduled re-screening campaigns, and integration with existing HR workflows through scriptable interfaces
- **REST API exposure** via `/api/cer/screen` endpoints that enable external systems (HR platforms, access management systems) to trigger and retrieve screening results programmatically
- **LiveView screening dashboard** providing real-time visibility into screening operations, queue status, result summaries, and trend analysis through an interactive [Phoenix](/glossary/phoenix/) LiveView interface
- **Audit trail management** maintaining immutable records of every screening operation including who requested it, when it was performed, which registries were consulted, and what results were obtained
- **Re-screening scheduling** automatically scheduling periodic re-screening of previously cleared personnel based on configurable intervals aligned with regulatory requirements

## Implementation

The screening pipeline is implemented as an [OTP](/glossary/otp/) application with supervised registry adapter processes and a GenStage-based processing pipeline.

```elixir
defmodule Prismatic.CER.Screening.Specialist do
  @moduledoc """
  Comprehensive employee screening for Czech Critical Infrastructure
  compliance with multi-registry verification and risk scoring.
  """
  use GenServer

  alias Prismatic.CER.Screening.{
    ProfileEngine,
    RegistryAdapter,
    ScoringEngine,
    ReportGenerator
  }

  @type screening_request :: %{
    entity_id: String.t(),
    entity_type: :person | :organization,
    profile: atom(),
    requested_by: String.t(),
    priority: :normal | :urgent
  }

  @type screening_result :: %{
    request: screening_request(),
    checks: list(registry_check()),
    risk_score: float(),
    recommendation: :clear | :review | :reject,
    report_id: String.t(),
    completed_at: DateTime.t()
  }

  @spec screen(screening_request()) :: {:ok, screening_result()} | {:error, term()}
  def screen(request) do
    with {:ok, profile} <- ProfileEngine.resolve(request.profile),
         {:ok, checks} <- execute_registry_checks(request, profile),
         {:ok, scored} <- ScoringEngine.evaluate(checks, profile),
         {:ok, report} <- ReportGenerator.generate(request, scored) do
      :telemetry.execute(
        [:prismatic, :cer, :screening, :complete],
        %{duration_ms: report.duration_ms, checks_count: length(checks)},
        %{entity_type: request.entity_type, recommendation: scored.recommendation}
      )
      {:ok, report}
    end
  end

  defp execute_registry_checks(request, profile) do
    results =
      profile.required_checks
      |> Task.async_stream(fn check ->
        adapter = RegistryAdapter.for_check(check)
        adapter.execute(request.entity_id, check)
      end, max_concurrency: 4, timeout: :timer.seconds(30))
      |> Enum.reduce_while([], fn
        {:ok, {:ok, result}}, acc -> {:cont, [result | acc]}
        {:ok, {:error, reason}}, _acc -> {:halt, {:error, reason}}
        {:exit, reason}, _acc -> {:halt, {:error, {:registry_timeout, reason}}}
      end)

    case results do
      {:error, _} = error -> error
      checks when is_list(checks) -> {:ok, Enum.reverse(checks)}
    end
  end
end
```

## Integration Points

| Component | Integration Type | Function |
|-----------|-----------------|----------|
| [cer-compliance-commander](/agents/cer-compliance-commander/) | Command Authority | Receives screening directives and reports results back for compliance assessment integration |
| Czech Business Registry (OR) | External Registry | Provides company registration data, ownership structures, and statutory representatives |
| Czech Trade Registry (RZP) | External Registry | Supplies trade license information and business activity classifications |
| Czech Insolvency Registry (ISIR) | External Registry | Reports insolvency proceedings, bankruptcy declarations, and financial distress indicators |
| [Prismatic API](/glossary/prismatic-api/) | REST Exposure | Exposes screening operations through `/api/cer/screen` endpoints for external system integration |
| [Phoenix LiveView](/glossary/liveview/) | Dashboard UI | Provides interactive screening management interface with real-time status updates |
| [Prismatic Telemetry](/glossary/telemetry/) | Observability | Emits screening operation metrics for monitoring, alerting, and capacity planning |

## Operational Workflow

**Phase 1: Request Intake** -- Screening requests arrive through CLI commands, REST API calls, or LiveView dashboard submissions. Each request is validated for required fields, deduplicated against in-progress screenings, and assigned a priority level that determines queue position.

**Phase 2: Profile Resolution** -- The screening profile for the request is resolved based on the entity type, organizational context, and role classification. The profile specifies which registry checks are required, the scoring model to apply, and the threshold levels for screening recommendations.

**Phase 3: Registry Execution** -- Required registry checks execute concurrently through their respective adapters. Each adapter handles authentication, request formatting, response parsing, and error handling specific to its target registry. Adapter results are normalized into the common screening check format.

**Phase 4: Risk Assessment** -- Completed registry checks are evaluated through the risk scoring engine. The engine applies role-specific weights to each finding, calculates composite risk scores, and produces a screening recommendation of clear, review, or reject based on configurable thresholds.

**Phase 5: Report Generation** -- A structured screening report is generated containing all check results, the risk assessment calculation, the final recommendation, and cryptographic integrity signatures. The report is stored in the compliance evidence repository and linked to the entity's compliance record.

**Phase 6: Post-Screening Actions** -- Based on the screening recommendation, automated actions may be triggered: clear results update access permissions, review results notify compliance officers for manual evaluation, and reject results trigger access restriction workflows.

## NABLA Compliance

| Axiom | Implementation |
|-------|---------------|
| **Signal Plurality** | Screening assessments require results from at least two independent registries before producing a final recommendation |
| **Contradiction Preservation** | Conflicting results across registries (e.g., clean criminal record but active insolvency proceedings) are preserved and flagged for manual review |
| **Provenance Mandatory** | Every screening result carries complete provenance from the specific registry query through the adapter response to the risk score contribution |
| **Time Decay** | Previous screening results carry validity periods; expired screenings trigger automatic re-screening rather than relying on stale data |
| **Source Independence** | Registry results from independent government systems are weighted higher than self-reported organizational data |

## Configuration

```elixir
config :prismatic_cer, Prismatic.CER.Screening.Specialist,
  # Maximum concurrent registry queries
  registry_concurrency: 4,
  # Registry query timeout (milliseconds)
  registry_timeout: 30_000,
  # Default screening profile
  default_profile: :standard,
  # Re-screening interval (days)
  rescreening_interval: 365,
  # Risk score thresholds
  thresholds: %{clear: 0.3, review: 0.7, reject: 1.0},
  # Report retention period (days)
  report_retention: 3650
```

## Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| Single screening completion | < 60 seconds | End-to-end time including all registry queries |
| Registry adapter response | < 10 seconds | Individual registry query round-trip time |
| Batch screening throughput | > 100 screenings/hour | Sustained batch processing rate |
| Report generation | < 5 seconds | Time from scoring completion to report availability |
| API response time | < 200ms | REST API endpoint response for status queries |
| Dashboard render time | < 100ms | LiveView initial mount and subsequent updates |

## Related Resources

- [**cer-compliance-commander**](/agents/cer-compliance-commander/) (L3) -- Strategic CER compliance coordination authority
- [**employee-screening-specialist**](/agents/employee-screening-specialist/) -- Employee-specific screening operations
- [**supplier-vetting-specialist**](/agents/supplier-vetting-specialist/) -- Supply chain screening and vendor assessment
- [**aiad-dashboard-commander**](/agents/aiad-dashboard-commander/) (L3) -- Dashboard management for screening visualization
- [Hot Code Reload](/glossary/hot-code-reload/) -- Registry adapter updates without screening downtime

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)