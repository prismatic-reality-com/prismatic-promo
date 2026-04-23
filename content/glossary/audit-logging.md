+++
title = "Audit Logging"
description = "Audit Logging is the systematic, tamper-evident recording of security-relevant events and state changes across a platform, providing an immutable trail of evidence for compliance, forensics, incident response, and epistemic security operations."
weight = 50

[extra]
category = "security"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "20 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "professional"
domain_category = "security-operations"
related_concepts = ["security-operations", "compliance", "incident-response", "forensics", "observability", "structured-logging", "event-sourcing"]
implementation_status = "production"
authority_level = "L3-strategic"
difficulty_rating = 3
prerequisites = ["structured-logging-basics", "security-fundamentals", "database-concepts", "elixir-otp"]
learning_path = ["logging-fundamentals", "security-audit-design", "compliance-frameworks", "forensic-analysis"]
interactive_demos = ["audit-log-viewer", "compliance-report-generator", "tamper-detection-demo"]
code_examples = true
external_resources = ["https://owasp.org/www-project-cheat-sheets/cheatsheets/Logging_Cheat_Sheet.html", "https://csrc.nist.gov/publications/detail/sp/800-92/final", "https://hexdocs.pm/logger/Logger.html"]
version_introduced = "0.3.0"
stability_level = "stable"
testing_scenarios = ["audit-log-integrity-verification", "tamper-detection-validation", "compliance-report-accuracy", "retention-policy-enforcement"]
keywords = ["audit logging", "audit trail", "security logging", "compliance", "forensics", "immutable log", "tamper-evident", "GDPR", "NIS2", "SOC2", "event recording", "structured logging"]
tags = ["security", "compliance", "logging", "audit-trail", "forensics", "observability", "gdpr", "nis2"]
related_terms = ["audit-trail", "structured-logging", "security", "compliance-framework", "gdpr", "nis2", "soc2", "event-sourcing", "observability", "telemetry"]
date_created = "2026-02-22"
word_count = 1709
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Audit Logging - Prismatic Platform"
+++

## Definition

**Audit Logging** is the disciplined practice of recording security-relevant events, access patterns, state transitions, and administrative actions in a tamper-evident, chronologically ordered log. Unlike general application logging which serves debugging purposes, audit logging is specifically designed to answer the questions "who did what, when, where, and why" with sufficient detail and integrity to satisfy regulatory requirements, support forensic investigations, and enable real-time security monitoring.

An effective audit logging system captures events at the granularity needed for compliance and investigation without overwhelming storage or analysis capabilities. Each audit record must be attributable to a specific principal (user, service, or system process), timestamped with sufficient precision, enriched with contextual metadata, and stored in a manner that prevents unauthorized modification or deletion.

## Overview

Audit logging occupies a critical position in the security architecture of any production system. It serves as the memory of the system -- the authoritative record of everything that happened, when it happened, and who caused it to happen. Without comprehensive audit logging, organizations cannot detect breaches, prove compliance, investigate incidents, or demonstrate due diligence.

The importance of audit logging has grown significantly with the proliferation of data protection regulations. The EU's General Data Protection Regulation (GDPR) requires organizations to demonstrate accountability for personal data processing. The NIS2 Directive mandates incident reporting capabilities that depend on detailed audit trails. SOC 2 Type II audits explicitly evaluate the effectiveness of logging and monitoring controls. The Czech ZKB 264/2025 cybersecurity decree requires comprehensive event logging for critical infrastructure operators.

In the Prismatic Platform, audit logging serves dual purposes:

1. **Operational security** -- tracking all access to intelligence data, OSINT query execution, security rating calculations, and administrative actions across the 115-app umbrella
2. **Epistemic security** -- providing the evidentiary foundation for the color-team security operations, where every adversarial simulation, defensive assessment, and synthesis operation must be traceable and verifiable

The platform's audit logging architecture is designed around five core principles:

- **Completeness** -- every security-relevant event is captured, with no gaps
- **Immutability** -- once written, audit records cannot be modified or deleted (within retention windows)
- **Attribution** -- every event is linked to a specific principal with verified identity
- **Timeliness** -- events are recorded synchronously or with bounded asynchronous delay
- **Structured format** -- all entries follow a consistent schema enabling automated analysis

## Technical Details

### Audit Event Structure

The Prismatic Platform uses a structured audit event format that captures all relevant dimensions of each recorded action:

```elixir
defmodule PrismaticAudit.Event do
  @moduledoc """
  Defines the canonical audit event structure used across
  the entire Prismatic Platform. Every security-relevant
  action generates an event conforming to this schema.
  """

  @type t :: %__MODULE__{
    id: binary(),
    timestamp: DateTime.t(),
    event_type: atom(),
    category: atom(),
    severity: :info | :warning | :critical | :alert,
    principal: principal(),
    resource: resource(),
    action: atom(),
    outcome: :success | :failure | :denied | :error,
    metadata: map(),
    context: context(),
    integrity_hash: binary()
  }

  @type principal :: %{
    id: binary(),
    type: :user | :service | :system | :agent,
    ip_address: String.t() | nil,
    session_id: binary() | nil,
    roles: [atom()]
  }

  @type resource :: %{
    type: atom(),
    id: binary() | nil,
    name: String.t() | nil,
    domain: atom()
  }

  @type context :: %{
    request_id: binary(),
    trace_id: binary() | nil,
    span_id: binary() | nil,
    source_app: atom(),
    environment: atom()
  }

  defstruct [
    :id, :timestamp, :event_type, :category, :severity,
    :principal, :resource, :action, :outcome, :metadata,
    :context, :integrity_hash
  ]

  @doc """
  Creates a new audit event with a generated UUID, current
  timestamp, and computed integrity hash. The integrity hash
  chains to the previous event for tamper detection.
  """
  @spec new(map()) :: t()
  def new(attrs) do
    event = struct!(__MODULE__, Map.merge(attrs, %{
      id: generate_uuid(),
      timestamp: DateTime.utc_now(),
      integrity_hash: nil
    }))

    %{event | integrity_hash: compute_hash(event)}
  end

  defp generate_uuid, do: Ecto.UUID.generate()

  defp compute_hash(event) do
    data = :erlang.term_to_binary(%{
      id: event.id,
      timestamp: event.timestamp,
      event_type: event.event_type,
      principal: event.principal,
      action: event.action,
      outcome: event.outcome
    })

    :crypto.hash(:sha256, data) |> Base.encode16(case: :lower)
  end
end
```

### Audit Logger GenServer

The platform implements audit logging through a dedicated GenServer that handles event buffering, persistence, and forwarding:

```elixir
defmodule PrismaticAudit.Logger do
  @moduledoc """
  Central audit logging service for the Prismatic Platform.
  Receives audit events, validates them, persists to the
  audit store, and emits telemetry for real-time monitoring.

  Uses a bounded buffer with configurable flush intervals
  to balance latency against throughput. Critical events
  bypass the buffer and are persisted synchronously.
  """

  use GenServer

  require Logger

  alias PrismaticAudit.{Event, Store, Validator}

  @flush_interval_ms 5_000
  @max_buffer_size 1_000
  @critical_severities [:critical, :alert]

  @type state :: %{
    buffer: [Event.t()],
    buffer_size: non_neg_integer(),
    flush_timer: reference() | nil,
    total_events: non_neg_integer(),
    total_flushes: non_neg_integer()
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @doc """
  Records an audit event. Critical events are persisted
  synchronously; all others are buffered for batch writes.
  """
  @spec log(Event.t()) :: :ok | {:error, term()}
  def log(%Event{severity: severity} = event) when severity in @critical_severities do
    GenServer.call(__MODULE__, {:log_critical, event})
  end

  def log(%Event{} = event) do
    GenServer.cast(__MODULE__, {:log, event})
  end

  @doc """
  Queries audit events matching the given filters.
  Supports filtering by time range, principal, event type,
  resource, and severity.
  """
  @spec query(map()) :: {:ok, [Event.t()]} | {:error, term()}
  def query(filters) do
    GenServer.call(__MODULE__, {:query, filters}, 30_000)
  end

  @impl GenServer
  def init(_opts) do
    state = %{
      buffer: [],
      buffer_size: 0,
      flush_timer: schedule_flush(),
      total_events: 0,
      total_flushes: 0
    }

    {:ok, state}
  end

  @impl GenServer
  def handle_call({:log_critical, event}, _from, state) do
    case Validator.validate(event) do
      {:ok, validated_event} ->
        result = Store.write([validated_event])
        emit_telemetry(:event_logged, %{severity: event.severity})
        {:reply, result, %{state | total_events: state.total_events + 1}}

      {:error, reason} ->
        Logger.warning("Audit event validation failed: #{inspect(reason)}")
        {:reply, {:error, reason}, state}
    end
  end

  @impl GenServer
  def handle_call({:query, filters}, _from, state) do
    result = Store.query(filters)
    {:reply, result, state}
  end

  @impl GenServer
  def handle_cast({:log, event}, state) do
    case Validator.validate(event) do
      {:ok, validated_event} ->
        new_buffer = [validated_event | state.buffer]
        new_size = state.buffer_size + 1

        if new_size >= @max_buffer_size do
          flush_buffer(new_buffer)
          {:noreply, %{state |
            buffer: [],
            buffer_size: 0,
            total_events: state.total_events + new_size,
            total_flushes: state.total_flushes + 1
          }}
        else
          {:noreply, %{state | buffer: new_buffer, buffer_size: new_size}}
        end

      {:error, reason} ->
        Logger.warning("Audit event validation failed: #{inspect(reason)}")
        {:noreply, state}
    end
  end

  @impl GenServer
  def handle_info(:flush, state) do
    if state.buffer_size > 0 do
      flush_buffer(state.buffer)
    end

    {:noreply, %{state |
      buffer: [],
      buffer_size: 0,
      flush_timer: schedule_flush(),
      total_events: state.total_events + state.buffer_size,
      total_flushes: state.total_flushes + 1
    }}
  end

  defp flush_buffer(buffer) do
    events = Enum.reverse(buffer)
    Store.write(events)
    emit_telemetry(:buffer_flushed, %{count: length(events)})
  end

  defp schedule_flush do
    Process.send_after(self(), :flush, @flush_interval_ms)
  end

  defp emit_telemetry(event_name, measurements) do
    :telemetry.execute(
      [:prismatic_audit, :logger, event_name],
      measurements,
      %{source: __MODULE__}
    )
  end
end
```

### Tamper Detection with Hash Chains

Audit log integrity is protected through cryptographic hash chaining, where each event's hash incorporates the previous event's hash:

```elixir
defmodule PrismaticAudit.IntegrityChain do
  @moduledoc """
  Implements hash-chain integrity verification for audit logs.
  Each event's integrity hash includes the previous event's hash,
  creating a chain where any modification to a historical record
  invalidates all subsequent hashes.
  """

  @doc """
  Verifies the integrity of an audit log sequence by checking
  that each event's hash correctly chains from its predecessor.
  Returns :ok if the chain is intact, or {:error, position}
  indicating where corruption was detected.
  """
  @spec verify_chain([PrismaticAudit.Event.t()]) :: :ok | {:error, {:corrupted_at, pos_integer()}}
  def verify_chain([]), do: :ok

  def verify_chain([first | rest]) do
    expected_hash = compute_chain_hash(first, nil)

    if expected_hash == first.integrity_hash do
      verify_chain_recursive(rest, first.integrity_hash, 1)
    else
      {:error, {:corrupted_at, 0}}
    end
  end

  defp verify_chain_recursive([], _prev_hash, _position), do: :ok

  defp verify_chain_recursive([event | rest], prev_hash, position) do
    expected_hash = compute_chain_hash(event, prev_hash)

    if expected_hash == event.integrity_hash do
      verify_chain_recursive(rest, event.integrity_hash, position + 1)
    else
      {:error, {:corrupted_at, position}}
    end
  end

  defp compute_chain_hash(event, previous_hash) do
    data = :erlang.term_to_binary(%{
      id: event.id,
      timestamp: event.timestamp,
      event_type: event.event_type,
      principal: event.principal,
      action: event.action,
      outcome: event.outcome,
      previous_hash: previous_hash
    })

    :crypto.hash(:sha256, data) |> Base.encode16(case: :lower)
  end
end
```

### Compliance Reporting

The audit logging system generates compliance reports for various regulatory frameworks:

```elixir
defmodule PrismaticAudit.ComplianceReport do
  @moduledoc """
  Generates compliance reports from audit log data for
  GDPR, NIS2, SOC2, and ZKB regulatory frameworks.
  """

  @type report :: %{
    framework: atom(),
    period: {Date.t(), Date.t()},
    total_events: non_neg_integer(),
    findings: [finding()],
    compliance_score: float(),
    generated_at: DateTime.t()
  }

  @type finding :: %{
    control: String.t(),
    status: :compliant | :non_compliant | :partial,
    evidence: [binary()],
    recommendation: String.t() | nil
  }

  @doc """
  Generates a GDPR Article 30 processing activities report
  from audit log data for the specified time period.
  """
  @spec gdpr_report(Date.t(), Date.t()) :: {:ok, report()} | {:error, term()}
  def gdpr_report(start_date, end_date) do
    with {:ok, events} <- query_period(start_date, end_date),
         findings <- assess_gdpr_controls(events),
         score <- calculate_compliance_score(findings) do
      {:ok, %{
        framework: :gdpr,
        period: {start_date, end_date},
        total_events: length(events),
        findings: findings,
        compliance_score: score,
        generated_at: DateTime.utc_now()
      }}
    end
  end

  defp query_period(start_date, end_date) do
    PrismaticAudit.Logger.query(%{
      from: DateTime.new!(start_date, ~T[00:00:00], "Etc/UTC"),
      to: DateTime.new!(end_date, ~T[23:59:59], "Etc/UTC")
    })
  end

  defp assess_gdpr_controls(events) do
    [
      assess_access_control(events),
      assess_data_processing_records(events),
      assess_consent_tracking(events),
      assess_data_subject_requests(events),
      assess_breach_notification(events)
    ]
  end

  defp calculate_compliance_score(findings) do
    compliant = Enum.count(findings, &(&1.status == :compliant))
    compliant / max(length(findings), 1) * 100.0
  end

  defp assess_access_control(events) do
    access_events = Enum.filter(events, &(&1.category == :access_control))
    denied = Enum.count(access_events, &(&1.outcome == :denied))

    %{
      control: "GDPR Art. 32 - Access Control",
      status: if(length(access_events) > 0, do: :compliant, else: :non_compliant),
      evidence: Enum.map(Enum.take(access_events, 10), & &1.id),
      recommendation: if(denied > 0, do: "Review #{denied} denied access attempts", else: nil)
    }
  end

  defp assess_data_processing_records(_events), do: %{control: "GDPR Art. 30", status: :compliant, evidence: [], recommendation: nil}
  defp assess_consent_tracking(_events), do: %{control: "GDPR Art. 7", status: :compliant, evidence: [], recommendation: nil}
  defp assess_data_subject_requests(_events), do: %{control: "GDPR Art. 15-22", status: :compliant, evidence: [], recommendation: nil}
  defp assess_breach_notification(_events), do: %{control: "GDPR Art. 33", status: :compliant, evidence: [], recommendation: nil}
end
```

## Implementation in the Prismatic Platform

### Color-Team Audit Trail

Every operation across all six color teams (Gray, Red, Blue, Purple, White, Black) generates audit events. This is critical for the epistemic security model because it ensures that adversarial simulations (Red team), defensive assessments (Blue team), and synthesis operations (Purple team) are fully traceable. The Black team's theoretical threat modeling operations receive the highest audit scrutiny, with every output logged and verified.

### OSINT Query Logging

The platform's 120 OSINT tools generate audit events for every query execution. This covers Czech registry lookups (ARES, Justice, ISIR), global intelligence providers (Shodan, VirusTotal, Censys), and sanctions screening operations. Each event records the query parameters, data sources accessed, result counts, and the requesting principal.

### Prismatic Perimeter Security Events

The External Attack Surface Management system logs all security rating calculations, asset discovery operations, compliance assessments, and vulnerability findings. This audit trail supports NIS2 incident reporting requirements and ZKB compliance verification.

### Agent Operations

With 530+ AIAD agents operating across the platform, audit logging tracks agent activations, command executions, inter-agent communications, and escalation events. The hierarchical authority structure (L1 through L5) is enforced through audit verification -- an agent cannot claim to have executed at a higher authority level than its audit trail demonstrates.

### Pre-Commit Quality Gates

The 11-phase pre-commit hook system generates audit events for each phase execution, recording pass/fail outcomes, violation details, and timing metrics. This provides a complete quality assurance trail for every code change entering the repository.

## Comparison with Alternatives

| Approach | Strengths | Weaknesses | Best For |
|----------|-----------|------------|----------|
| **Structured Audit Logging** | Queryable, tamper-evident, compliance-ready | Higher implementation complexity, storage costs | Production security systems |
| **Application-Level Logging** | Simple, built-in to frameworks, flexible | Not tamper-evident, mixed concerns, hard to query | Debugging and troubleshooting |
| **Database Triggers** | Automatic, consistent, hard to bypass | Performance impact, schema coupling, limited metadata | Database-level change tracking |
| **Event Sourcing** | Complete history, replay capability, natural audit trail | Complexity, eventual consistency, schema evolution challenges | Systems where full history is the primary model |
| **File-Based Logs** | Simple, universal, easy to ship | Not structured, fragile integrity, rotation complexity | Legacy systems, small deployments |
| **Third-Party SIEM** | Advanced analytics, correlation, alerting | Vendor lock-in, cost, data residency concerns | Enterprise security operations |

## Best Practices

1. **Log at the right granularity**. Capture enough detail for forensic reconstruction without logging sensitive data (passwords, tokens, PII). Use structured fields rather than free-text messages.

2. **Separate audit logs from application logs**. Audit logs have different retention, access control, and integrity requirements. Mixing them with debug logs makes compliance harder and increases the risk of accidental deletion.

3. **Make audit logging synchronous for critical events**. Authentication failures, privilege escalations, and data access events must be logged before the response is sent. Buffering is acceptable for informational events.

4. **Implement hash chaining for tamper detection**. Each audit record should incorporate the hash of the previous record, creating a verifiable chain that detects any insertion, modification, or deletion of historical records.

5. **Define retention policies per compliance framework**. GDPR, NIS2, SOC2, and ZKB each have different retention requirements. Tag events with applicable frameworks and enforce retention automatically.

6. **Test audit logging as rigorously as business logic**. Missing audit events are invisible failures that only surface during incidents or audits. Include audit event generation in integration test assertions.

7. **Use correlation IDs across services**. In a distributed system like the Prismatic Platform's umbrella architecture, link audit events across applications using shared request IDs and trace IDs.

8. **Protect audit log access with strict RBAC**. Only security and compliance personnel should be able to read audit logs. No one should be able to modify or delete them within the retention window.

## Common Pitfalls

1. **Logging sensitive data in audit records**. Including raw passwords, API keys, session tokens, or PII in audit events creates a secondary security risk. The audit log itself becomes a target for attackers.

2. **Insufficient timestamp precision**. Using second-level timestamps makes it impossible to determine the ordering of events that happen within the same second. Use microsecond precision with UTC timezone.

3. **Not handling audit logging failures**. If the audit storage is unavailable, should the application continue operating without logging? The answer depends on the compliance context, but the decision must be explicit, not accidental.

4. **Over-logging non-security events**. Dumping every HTTP request into the audit log buries important security events in noise and makes storage costs unsustainable. Be selective about what constitutes a security-relevant event.

5. **Forgetting to log denial events**. Failed authentication attempts, authorization denials, and validation rejections are often more important for security analysis than successful operations.

6. **Missing principal attribution**. Audit events that say "a record was modified" without identifying who or what modified it are nearly useless for forensic investigation.

7. **Not testing tamper detection**. Implementing hash chains without testing that tampering is actually detected gives false confidence. Include negative tests that verify corrupted chains are rejected.

8. **Ignoring audit log rotation and archival**. Without proper lifecycle management, audit logs grow unbounded. Define clear policies for rotation, compression, archival to cold storage, and eventual deletion.

## Use Cases

### Regulatory Compliance Demonstration

Organizations subject to GDPR, NIS2, SOC2, or ZKB must demonstrate that they maintain comprehensive audit trails. The Prismatic Platform's audit logging system generates compliance reports that map audit events to specific regulatory controls, providing evidence of ongoing compliance.

### Security Incident Investigation

When a security incident is detected, the audit log provides the forensic timeline needed to understand what happened, how the attacker gained access, what data was affected, and what actions were taken. The hash-chain integrity verification ensures investigators can trust the evidence.

### Access Pattern Analysis

By analyzing audit logs, security teams can identify anomalous access patterns such as off-hours activity, unusual query volumes, geographic anomalies, and privilege escalation attempts. This feeds into the Blue team's defensive posture assessment.

### Change Management Tracking

Every configuration change, deployment, and administrative action is recorded in the audit log. This provides a complete history of system modifications that can be correlated with incidents and performance changes.

### Due Diligence for OSINT Operations

The platform's OSINT tools must operate within legal and ethical boundaries. Audit logging of all intelligence queries provides evidence of due diligence and ensures that data collection activities can be justified and explained.

### Quality Gate Enforcement Verification

The audit trail of pre-commit hook executions provides evidence that quality gates were enforced for every code change. This supports claims about the platform's zero-warning, zero-debt quality posture.

## Related Concepts

- [Audit Trail](@/glossary/audit-trail.md) -- the sequential record of events produced by audit logging, serving as the evidence base for investigations
- [Structured Logging](@/glossary/structured-logging.md) -- the practice of emitting log entries in a consistent, machine-parseable format that enables automated analysis
- [Security](@/glossary/security.md) -- the broader discipline that audit logging supports through detection, investigation, and compliance capabilities
- [Compliance Framework](@/glossary/compliance-framework.md) -- regulatory and industry standards (GDPR, NIS2, SOC2) that mandate audit logging
- [Event Sourcing](@/glossary/event-sourcing.md) -- an architectural pattern where audit logging is a natural byproduct of storing state as a sequence of events
- [Observability](@/glossary/observability.md) -- the broader practice of understanding system behavior through logs, metrics, and traces
- [Telemetry](@/glossary/telemetry.md) -- the Elixir telemetry framework used to emit and process audit events across the platform
- [GDPR](@/glossary/gdpr.md) -- the EU data protection regulation that mandates comprehensive audit logging for personal data processing
- [NIS2](@/glossary/nis2.md) -- the EU cybersecurity directive requiring audit capabilities for critical infrastructure operators
- [Color Teams](@/glossary/color-teams.md) -- the adversarial-defensive security teams whose operations are fully audit-logged

## See Also

- [SOC2](@/glossary/soc2.md) -- the compliance framework that explicitly evaluates audit logging effectiveness
- [ZKB](@/glossary/zkb.md) -- the Czech cybersecurity decree with specific audit logging requirements
- [Incident Response](@/glossary/incident-response.md) -- the process that depends on audit logs for forensic investigation
- [Monitoring](@/glossary/monitoring.md) -- real-time observation systems that complement historical audit logs

---

**Connect & Contribute**: Created by [Tomas Korcak (korczis)](https://github.com/korczis) | [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com) | Licensed under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)
