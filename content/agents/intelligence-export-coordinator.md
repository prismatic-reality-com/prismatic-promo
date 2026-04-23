+++
title = "intelligence-export-coordinator"
weight = 213
[extra]
domain = "medium-predator"
level = "L2"
description = "Specialized coordinator for intelligence export and report generation"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "seadf", "mycelial-network", "nabla-infinity", "no-doubts", "telemetry", "ecto", "no-mercy"]
domain_normalized = "predator"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1650
quality_score = 92
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["intelligence-export-coordinator", "Specialized", "agents", "agent", "Prismatic Platform", "JSON", "STIX", "The Intelligence"]
tags = ["agents", "agent", "intelligence-export-coordinator", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "intelligence-export-coordinator - Prismatic Platform"
+++

## Overview

The Intelligence Export Coordinator operates as an L2 tactical operations agent within the Medium Predator domain of the Prismatic Platform. This agent manages the transformation and export of internal intelligence data into external-facing formats suitable for client delivery, regulatory submission, compliance reporting, and inter-system data exchange. Every export operation applies data sanitization, format transformation, access control verification, and output validation before releasing intelligence beyond the platform boundary.

Intelligence gathered and analyzed within the Prismatic Platform exists in rich, interconnected graph structures with cross-references, confidence scores, and provenance chains. External consumers -- whether human analysts, client portals, or regulatory interfaces -- require intelligence in specific formats (PDF reports, JSON feeds, CSV exports, STIX bundles) with appropriate redaction of internal metadata. The Intelligence Export Coordinator bridges this gap, producing export-ready intelligence packages that maintain analytical value while respecting security boundaries.

## Operational Domain

The Medium Predator domain encompasses agents that operate at the intersection of intelligence analysis and operational delivery. The Intelligence Export Coordinator sits at the output boundary of the intelligence pipeline, transforming analyzed intelligence into deliverable products. It coordinates with analysis agents for content and with infrastructure agents for delivery mechanisms.

## Export Pipeline Architecture

The export pipeline processes internal intelligence through multiple transformation and validation stages.

| Stage | Function | Input | Output |
|---|---|---|---|
| Selection | Choose intelligence records for export | Query criteria | Selected record set |
| Authorization | Verify export permissions | Records + requester identity | Authorized subset |
| Redaction | Remove internal-only metadata | Authorized records | Redacted records |
| Transformation | Convert to target format | Redacted records | Formatted output |
| Validation | Verify output completeness and format | Formatted output | Validated export package |
| Delivery | Transmit to destination | Validated package | Delivery confirmation |

```elixir
defmodule PrismaticAgents.IntelligenceExport do
  @moduledoc """
  Intelligence export coordination engine.
  Manages the transformation of internal intelligence
  into external-facing export formats.
  """

  use GenServer

  @supported_formats [:pdf, :json, :csv, :stix, :html, :xlsx]

  @type export_request :: %{
    query: map(),
    format: atom(),
    requester: String.t(),
    destination: destination(),
    redaction_level: :standard | :enhanced | :maximum
  }

  @type export_result :: %{
    id: String.t(),
    format: atom(),
    record_count: non_neg_integer(),
    file_path: String.t(),
    checksum: String.t(),
    exported_at: DateTime.t()
  }

  @spec export(export_request()) :: {:ok, export_result()} | {:error, term()}
  def export(request) do
    GenServer.call(__MODULE__, {:export, request}, :timer.minutes(10))
  end

  @impl true
  def handle_call({:export, request}, _from, state) do
    with {:ok, records} <- select_records(request.query),
         {:ok, authorized} <- verify_authorization(records, request.requester),
         {:ok, redacted} <- apply_redaction(authorized, request.redaction_level),
         {:ok, formatted} <- transform_format(redacted, request.format),
         {:ok, validated} <- validate_output(formatted, request.format),
         {:ok, delivered} <- deliver(validated, request.destination) do
      result = build_export_result(delivered, request)
      {:reply, {:ok, result}, log_export(state, result)}
    end
  end
end
```

## Export Formats

The coordinator supports multiple export formats, each optimized for different consumption patterns.

| Format | Use Case | Content Type | Typical Size |
|---|---|---|---|
| PDF | Client reports, executive summaries | Rich text with charts | 2-50 pages |
| JSON | API consumers, data pipelines | Structured data | Variable |
| CSV | Spreadsheet analysis, bulk data | Tabular data | Rows to millions |
| STIX | Threat intelligence sharing | Structured threat data | Bundle-dependent |
| HTML | Web display, email delivery | Rich formatted content | Variable |
| XLSX | Financial analysis, compliance reports | Multi-sheet workbooks | Variable |

## Redaction Policy

All exports undergo redaction to remove internal-only metadata that should not cross the platform boundary.

| Redaction Level | What Gets Removed | Use Case |
|---|---|---|
| Standard | Internal IDs, process metadata, agent traces | Normal client delivery |
| Enhanced | Confidence internals, scoring weights, source IDs | Regulatory submission |
| Maximum | All internal metadata, only final conclusions remain | Public disclosure |

```elixir
defmodule PrismaticAgents.IntelligenceExport.Redactor do
  @spec redact(map(), :standard | :enhanced | :maximum) :: {:ok, map()}
  def redact(record, :standard) do
    {:ok, Map.drop(record, [:internal_id, :process_trace, :agent_refs, :pipeline_metadata])}
  end

  def redact(record, :enhanced) do
    {:ok, record} = redact(record, :standard)
    {:ok, Map.drop(record, [:scoring_weights, :source_ids, :confidence_breakdown])}
  end

  def redact(record, :maximum) do
    {:ok, record} = redact(record, :enhanced)
    {:ok, Map.take(record, [:entity, :findings, :risk_level, :summary, :timestamp])}
  end
end
```

## Key Capabilities

- **Multi-format export** transforming internal intelligence representations into PDF, JSON, CSV, STIX, HTML, and XLSX formats for diverse consumer requirements
- **Granular redaction** applying configurable redaction levels that remove internal metadata while preserving analytical value appropriate for the target audience
- **Access control verification** ensuring every export request is authorized by the requester's permissions before any data crosses the platform boundary
- **Output validation** verifying that exported data is complete, properly formatted, and free of internal metadata that should have been redacted
- **Audit logging** recording complete export history including requester identity, record counts, format, redaction level, and destination for compliance and accountability
- **Batch and streaming export** supporting both one-time bulk exports and continuous streaming feeds for real-time intelligence consumers

## Authority Level

**L2** - Tactical Operations. Domain-specific [tactical execution](/glossary/tactical-execution/) with cross-domain coordination capabilities. The Intelligence Export Coordinator can request intelligence from any analysis agent but requires L3 authorization for exports that cross security boundaries.

## Coordination

| Agent | Relationship | Purpose |
|---|---|---|
| [report-synthesis-specialist](/agents/report-synthesis-specialist/) | Report Generation | Produces formatted reports from intelligence data |
| [risk-assessment-commander](/agents/risk-assessment-commander/) | Risk Data | Provides risk assessment data for export inclusion |
| [mendelian-genetics-coordinator](/agents/mendelian-genetics-coordinator/) | Pattern Data | Supplies evolved pattern data for export analysis |
| [commit-coordinator](/agents/commit-coordinator/) | Version Control | Coordinates export of version-controlled intelligence snapshots |

## Integration

| Component | Relationship |
|---|---|
| [NABLA Infinity](/glossary/nabla-infinity/) | Provenance tracking for exported intelligence |
| [Ecto](/glossary/ecto/) | Database queries for intelligence record selection |
| [SEADF](/glossary/seadf/) | Evolutionary fitness data for export analysis |
| Platform [Telemetry](/glossary/telemetry/) | Export throughput and latency metrics |

## Enforcement

The Intelligence Export Coordinator operates under the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine. No intelligence is exported without authorization verification. All exports undergo mandatory redaction appropriate to the target audience. Export output validation ensures no internal metadata leaks through formatting artifacts. Every export operation is recorded in an immutable [audit trail](/glossary/audit-trail/) with complete provenance. Failed validation at any stage blocks the export entirely with no partial delivery.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)