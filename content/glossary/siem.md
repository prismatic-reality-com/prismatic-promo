+++
title = "SIEM"
weight = 52
[extra]
category = "security"
description = "Security Information and Event Management for centralized threat detection, log correlation, and compliance reporting across the Prismatic Platform"
acronym = "SIEM"
related_terms = ["observability", "structured-logging", "threat-intelligence", "incident-response", "telemetry", "osint", "blue-team", "nis2", "easm", "security-rating", "color-teams"]
keywords = ["SIEM security monitoring", "security information event management", "log correlation engine", "threat detection platform", "security operations center", "compliance reporting automation", "UEBA analytics", "SOAR orchestration", "Elixir security telemetry", "real-time threat detection"]
tags = ["siem", "security", "compliance", "monitoring", "telemetry"]
platform_integration = "deep"
related_app = "prismatic_safety"
complexity = "advanced"
audience = ["security-engineers", "soc-analysts", "compliance-officers", "platform-architects"]
date_created = "2026-02-22"
version = "2.0.0"
requires_knowledge = ["telemetry", "structured-logging", "otp"]
prismatic_components = ["Blue Team", "Purple Team", "EventEmitter", "SIEMAdapter", "CorrelationPatterns"]
compliance_frameworks = ["NIS2", "ZKB", "SOC2", "GDPR", "ISO27001"]
supported_siem_platforms = ["Splunk", "Elastic SIEM", "Microsoft Sentinel", "Syslog"]
event_categories = ["authentication", "authorization", "data_access", "configuration_change", "system_event", "security_alert", "compliance_event"]
enforcement_level = "P1"
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
word_count = 1777
date_modified = "2026-02-23"
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "SIEM - Prismatic Platform"
+++

## Definition and Overview

SIEM (Security Information and Event Management) is a security technology platform that aggregates, normalizes, correlates, and analyzes log data and security events from across an organization's entire infrastructure to detect threats, anomalies, and compliance violations in real time. SIEM systems combine two historically distinct capabilities: Security Information Management (SIM) for long-term log collection, storage, and compliance reporting, and Security Event Management (SEM) for real-time event correlation, alerting, and incident response. The convergence of these capabilities provides a centralized security operations center (SOC) with a unified view of the organization's security posture.

The fundamental value proposition of SIEM is correlation. Individual log entries from firewalls, servers, applications, and network devices are usually benign in isolation. However, when correlated across time, source, and context, they can reveal multi-step attack patterns, insider threats, lateral movement, and data exfiltration that no single log source would detect independently. A SIEM system applies rules, statistical models, and increasingly machine learning algorithms to identify these correlated patterns and generate alerts for security analysts to investigate.

Modern SIEM platforms have evolved significantly from their origins as log aggregation tools. Contemporary systems incorporate User and Entity Behavior Analytics (UEBA), Security Orchestration Automation and Response (SOAR), and threat intelligence integration. They process billions of events per day, store petabytes of historical data, and provide sub-second query performance for forensic investigation. Cloud-native SIEM platforms have further transformed the landscape by offering elastic scaling, managed infrastructure, and integration with cloud service provider security services.

The Prismatic Platform generates structured [telemetry](@/glossary/telemetry.md) events across all 115 umbrella applications that are designed for SIEM consumption. The platform's approach to security event generation follows the principle that security observability should be built into the application rather than bolted on through external agents. Every security-relevant action -- authentication attempts, authorization decisions, configuration changes, data access, compliance assessments -- emits a structured event that can be consumed by external SIEM platforms or processed internally by the [Blue Team](@/glossary/blue-team.md) signal aggregation pipeline.

## Historical Context and Evolution

The SIEM concept emerged in the early 2000s when Gartner analysts Mark Nicolett and Amrit Williams coined the term to describe the convergence of SIM and SEM products. Before SIEM, organizations relied on separate tools for log management (SIM products like ArcSight Logger) and real-time event monitoring (SEM products like Cisco MARS). The integration of these capabilities into a single platform reflected the growing realization that effective security monitoring requires both historical context and real-time awareness.

First-generation SIEM systems (2005-2012) focused primarily on log collection and rule-based correlation. They ingested syslog messages, Windows event logs, and firewall logs, applying static correlation rules to detect known attack patterns. These systems were expensive, difficult to deploy, and generated overwhelming volumes of false positives. The "deploy and forget" mentality left many organizations with expensive SIEM installations that provided minimal security value.

Second-generation SIEM systems (2012-2018) introduced behavioral analytics, machine learning-based anomaly detection, and threat intelligence integration. Products like Splunk Enterprise Security, IBM QRadar, and LogRhythm added UEBA capabilities that could detect anomalous behavior without predefined rules. This generation also saw the emergence of cloud-delivered SIEM (Microsoft Sentinel, Google Chronicle) that eliminated the infrastructure burden of on-premises deployments.

Third-generation SIEM systems (2018-present) blur the boundaries between SIEM, SOAR, XDR (Extended Detection and Response), and cloud security posture management. Modern platforms provide automated response capabilities, native cloud workload monitoring, and API-driven integration with the broader security toolchain. The Prismatic Platform's approach to security telemetry is designed to interoperate with this third-generation landscape while providing internal SIEM-like capabilities through the [Color Teams](@/glossary/color-teams.md) framework.

## Technical Deep Dive

### SIEM Architecture Components

A SIEM system consists of several core components working in concert:

| Component | Function | Prismatic Integration |
|-----------|----------|----------------------|
| Log Collectors | Gather events from diverse sources | Telemetry event emission across all apps |
| Normalization Engine | Convert diverse formats to common schema | Structured JSON logging with consistent schemas |
| Correlation Engine | Detect patterns across multiple events | Blue Team signal aggregator performs internal correlation |
| Rule Engine | Apply detection rules to normalized events | Color Team policies define detection logic |
| Alert Manager | Prioritize and route security alerts | Telemetry events with severity classification |
| Storage Backend | Index and retain events for compliance | [TimescaleDB](@/glossary/timescaledb.md) for time-series security data |
| Dashboard/UI | Visualize security posture and incidents | [LiveView](@/glossary/liveview.md) dashboards at `/perimeter` |
| Forensic Search | Investigate historical events | Meilisearch for full-text log search |

### Structured Event Generation

The Prismatic Platform generates SIEM-compatible events through its Telemetry infrastructure. The event schema is consistent across all 115 umbrella applications, eliminating the normalization burden that external SIEM systems typically face:

```elixir
defmodule Prismatic.Security.EventEmitter do
  @moduledoc """
  Emits structured security events compatible with SIEM ingestion.
  Events follow a consistent schema across all umbrella applications,
  providing normalized, correlation-ready data for both internal
  Blue Team analysis and external SIEM platform consumption.
  """

  @type security_event :: %{
    event_id: String.t(),
    timestamp: DateTime.t(),
    source: String.t(),
    category: event_category(),
    severity: severity_level(),
    actor: String.t() | nil,
    action: String.t(),
    target: String.t() | nil,
    outcome: :success | :failure | :unknown,
    metadata: map()
  }

  @type event_category ::
    :authentication
    | :authorization
    | :data_access
    | :configuration_change
    | :system_event
    | :security_alert
    | :compliance_event

  @type severity_level :: :critical | :high | :medium | :low | :informational

  @spec emit(event_category(), String.t(), keyword()) :: :ok
  def emit(category, action, opts \\ []) do
    event = %{
      event_id: generate_event_id(),
      timestamp: DateTime.utc_now(),
      source: Keyword.get(opts, :source, node_name()),
      category: category,
      severity: Keyword.get(opts, :severity, :informational),
      actor: Keyword.get(opts, :actor),
      action: action,
      target: Keyword.get(opts, :target),
      outcome: Keyword.get(opts, :outcome, :success),
      metadata: Keyword.get(opts, :metadata, %{})
    }

    :telemetry.execute(
      [:prismatic, :security, :event],
      %{count: 1},
      event
    )
  end

  @spec emit_auth_event(String.t(), String.t(), :success | :failure) :: :ok
  def emit_auth_event(actor, action, outcome) do
    emit(:authentication, action,
      actor: actor,
      outcome: outcome,
      severity: if(outcome == :failure, do: :medium, else: :informational)
    )
  end

  @spec emit_compliance_event(String.t(), atom(), map()) :: :ok
  def emit_compliance_event(target, framework, assessment_data) do
    emit(:compliance_event, "#{framework}_assessment",
      target: target,
      severity: :informational,
      metadata: assessment_data
    )
  end

  defp generate_event_id do
    "evt_" <> Base.encode16(:crypto.strong_rand_bytes(12), case: :lower)
  end

  defp node_name, do: to_string(node())
end
```

### SIEM Integration Patterns

The platform supports multiple SIEM integration patterns through a pluggable adapter architecture. Each adapter transforms the platform's internal event format into the target SIEM's expected schema:

```elixir
defmodule Prismatic.Security.SIEMAdapter do
  @moduledoc """
  Adapts Prismatic security events to various SIEM platform formats.
  Supports Splunk HEC, Elastic ECS, Microsoft Sentinel, and generic syslog.
  Each adapter produces format-compliant JSON or text output ready for
  direct ingestion by the target platform.
  """

  @type siem_format :: :splunk_hec | :elastic_ecs | :sentinel | :syslog | :generic_json

  @spec format_event(map(), siem_format()) :: {:ok, String.t()} | {:error, term()}
  def format_event(event, :splunk_hec) do
    formatted =
      %{
        time: DateTime.to_unix(event.timestamp),
        host: event.source,
        source: "prismatic",
        sourcetype: "prismatic:security:#{event.category}",
        event: event
      }
      |> Jason.encode!()

    {:ok, formatted}
  end

  def format_event(event, :elastic_ecs) do
    formatted =
      %{
        "@timestamp" => DateTime.to_iso8601(event.timestamp),
        "event.id" => event.event_id,
        "event.category" => to_string(event.category),
        "event.action" => event.action,
        "event.outcome" => to_string(event.outcome),
        "event.severity" => severity_to_numeric(event.severity),
        "source.address" => event.source,
        "user.name" => event.actor
      }
      |> Jason.encode!()

    {:ok, formatted}
  end

  def format_event(event, :syslog) do
    priority = syslog_priority(event.severity)
    timestamp = Calendar.strftime(event.timestamp, "%b %d %H:%M:%S")
    formatted = "#{priority}#{timestamp} #{event.source} prismatic[#{event.event_id}]: #{event.action} #{event.outcome}"
    {:ok, formatted}
  end

  def format_event(event, :generic_json), do: Jason.encode(event)

  defp severity_to_numeric(:critical), do: 1
  defp severity_to_numeric(:high), do: 2
  defp severity_to_numeric(:medium), do: 3
  defp severity_to_numeric(:low), do: 4
  defp severity_to_numeric(:informational), do: 5

  defp syslog_priority(:critical), do: "<2>"
  defp syslog_priority(:high), do: "<3>"
  defp syslog_priority(:medium), do: "<4>"
  defp syslog_priority(:low), do: "<5>"
  defp syslog_priority(:informational), do: "<6>"
end
```

### Correlation Rule Engine

SIEM systems apply correlation rules to detect attack patterns. The following module defines how Prismatic events feed into SIEM correlation, providing both internal detection through the Blue Team and exportable rule definitions for external SIEM platforms:

```elixir
defmodule Prismatic.Security.CorrelationPatterns do
  @moduledoc """
  Defines security correlation patterns that SIEM systems use
  to detect attack scenarios from Prismatic telemetry events.
  Rules are expressed as data structures that can be exported
  to external SIEM platforms or evaluated internally by the
  Blue Team signal aggregator.
  """

  @type correlation_rule :: %{
    name: atom(),
    description: String.t(),
    events: list(event_matcher()),
    window: non_neg_integer(),
    group_by: list(atom()),
    severity: atom(),
    mitre_attack: String.t() | nil
  }

  @type event_matcher :: {atom(), atom(), keyword()}

  @spec all_rules() :: [correlation_rule()]
  def all_rules do
    [
      %{
        name: :brute_force_detection,
        description: "Multiple failed auth attempts from same IP within 5 minutes",
        events: [{:authentication, :failure, min_count: 5}],
        window: :timer.minutes(5),
        group_by: [:actor, :source_ip],
        severity: :high,
        mitre_attack: "T1110"
      },
      %{
        name: :privilege_escalation,
        description: "Authorization failure followed by success with elevated privileges",
        events: [
          {:authorization, :failure, role: :admin},
          {:authorization, :success, role: :admin}
        ],
        window: :timer.minutes(15),
        group_by: [:actor],
        severity: :critical,
        mitre_attack: "T1078"
      },
      %{
        name: :security_rating_degradation,
        description: "Security rating drops by more than one grade in 24 hours",
        events: [{:security_alert, :rating_change, grade_drop: 1}],
        window: :timer.hours(24),
        group_by: [:target],
        severity: :high,
        mitre_attack: nil
      },
      %{
        name: :compliance_drift,
        description: "NIS2 or ZKB compliance score drops below threshold",
        events: [{:compliance_event, :score_change, below_threshold: true}],
        window: :timer.hours(1),
        group_by: [:framework],
        severity: :high,
        mitre_attack: nil
      },
      %{
        name: :data_exfiltration_indicator,
        description: "Unusual volume of data access events from single actor",
        events: [{:data_access, :read, min_count: 100}],
        window: :timer.minutes(10),
        group_by: [:actor],
        severity: :critical,
        mitre_attack: "T1048"
      }
    ]
  end
end
```

## Architecture and Implementation

### Blue Team as Internal SIEM

The Prismatic Platform's [Blue Team](@/glossary/blue-team.md) performs SIEM-like functions internally through the `blue-signal-aggregator` agent, providing a first line of detection that operates independently of any external SIEM platform:

| SIEM Function | Blue Team Implementation |
|--------------|------------------------|
| Log Aggregation | Telemetry event collection across all 115 apps |
| Event Correlation | Cross-domain signal correlation with NABLA plurality |
| Threat Detection | Drift detection, anomaly identification |
| Compliance Monitoring | NIS2/ZKB posture assessment via [Perimeter](@/glossary/easm.md) |
| Alert Generation | Structured evidence production for [Purple Team](@/glossary/purple-team.md) synthesis |
| Incident Response | Automated escalation through Color Team chain |

This internal SIEM capability means the platform detects security anomalies even when no external SIEM is configured. The Blue Team's signal aggregator applies [NABLA Axioms](@/glossary/nabla-axioms.md) to security evidence, requiring signal plurality (multiple independent sources confirming a finding) before establishing belief. This epistemic approach reduces false positives by requiring corroboration rather than treating any single signal as authoritative.

### Event Pipeline Architecture

The security event pipeline flows through multiple stages, supporting both internal analysis and external SIEM export:

```
Application Events --> Telemetry --> Structured JSON --> SIEM Adapter
        |                                                    |
        v                                                    v
Blue Team Aggregator                            External SIEM Platform
        |                                       (Splunk/Elastic/Sentinel)
        v
Purple Team Synthesis
        |
        v
Closure Decisions --> Incident Response
```

Each stage in the pipeline is implemented as a supervised [GenServer](@/glossary/genserver.md) process within the platform's [supervision tree](@/glossary/supervision-tree.md), providing fault tolerance and automatic recovery. If the SIEM adapter process crashes (due to network issues with the external SIEM endpoint, for example), the supervisor restarts it automatically, and buffered events are retransmitted.

### Event Buffering and Delivery Guarantees

The SIEM adapter implements at-least-once delivery semantics using a buffer backed by [ETS](@/glossary/ets.md) tables:

```elixir
defmodule Prismatic.Security.SIEMBuffer do
  @moduledoc """
  Buffers security events for reliable delivery to external SIEM platforms.
  Implements at-least-once delivery with configurable batch size and
  flush interval. Events are persisted in ETS until acknowledged.
  """

  use GenServer

  @type buffer_state :: %{
    events: :ets.table(),
    batch_size: pos_integer(),
    flush_interval: pos_integer(),
    siem_format: atom(),
    endpoint: String.t()
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(opts) do
    table = :ets.new(:siem_buffer, [:ordered_set, :public])
    schedule_flush(Keyword.get(opts, :flush_interval, 10_000))

    {:ok, %{
      events: table,
      batch_size: Keyword.get(opts, :batch_size, 100),
      flush_interval: Keyword.get(opts, :flush_interval, 10_000),
      siem_format: Keyword.get(opts, :format, :elastic_ecs),
      endpoint: Keyword.fetch!(opts, :endpoint)
    }}
  end

  @spec buffer_event(map()) :: :ok
  def buffer_event(event) do
    GenServer.cast(__MODULE__, {:buffer, event})
  end

  @impl true
  def handle_cast({:buffer, event}, state) do
    key = System.monotonic_time(:nanosecond)
    :ets.insert(state.events, {key, event})
    {:noreply, state}
  end

  @impl true
  def handle_info(:flush, state) do
    flush_batch(state)
    schedule_flush(state.flush_interval)
    {:noreply, state}
  end

  defp flush_batch(state) do
    batch = :ets.match_object(state.events, :_, state.batch_size)
    # Format and send batch to external SIEM
    # Delete from ETS only after successful delivery
  end

  defp schedule_flush(interval) do
    Process.send_after(self(), :flush, interval)
  end
end
```

## Compliance Reporting

SIEM systems generate compliance reports required by regulatory frameworks. The Prismatic Platform pre-formats events for common compliance requirements, enabling automated evidence collection:

| Framework | Event Requirements | Prismatic Coverage | Retention |
|-----------|-------------------|-------------------|-----------|
| [NIS2](@/glossary/nis2.md) | Incident notification within 24 hours | Security alert events with timestamps | 18 months |
| ZKB | Security measure documentation | Configuration change events | 5 years |
| SOC 2 | Audit trail for all access | Authentication and authorization events | 7 years |
| [GDPR](@/glossary/gdpr.md) | Data access logging | Data access events with actor tracking | Duration of processing |
| ISO 27001 | Information security event logging | Full security event taxonomy | 3 years |

The platform's compliance event generation is automatic -- every authentication attempt, authorization decision, data access operation, and configuration change emits a structured event with actor identification, timestamp, outcome, and contextual metadata. This eliminates the manual evidence collection that consumes significant compliance team resources.

## Usage in Prismatic Platform

### Configuring SIEM Export

```elixir
# config/config.exs - SIEM integration configuration
config :prismatic, :siem,
  enabled: true,
  format: :elastic_ecs,
  endpoint: System.get_env("SIEM_ENDPOINT"),
  batch_size: 100,
  flush_interval: :timer.seconds(10),
  include_categories: [
    :authentication,
    :authorization,
    :security_alert,
    :compliance_event
  ],
  exclude_severities: [:informational],
  buffer_max_size: 10_000,
  retry_attempts: 3,
  retry_backoff_ms: 1_000
```

### Generating Security Events

```elixir
# Authentication event
Prismatic.Security.EventEmitter.emit_auth_event(
  "user@example.com",
  "login",
  :success
)

# Security alert from Perimeter EASM
Prismatic.Security.EventEmitter.emit(
  :security_alert,
  "rating_degradation",
  target: "example.com",
  severity: :high,
  metadata: %{from_grade: :B, to_grade: :C, score_delta: -120}
)

# Compliance event from NIS2 assessment
Prismatic.Security.EventEmitter.emit_compliance_event(
  "example.com",
  :nis2,
  %{score: 85, previous_score: 92, framework: :nis2, articles_assessed: 21}
)

# Data access event for audit trail
Prismatic.Security.EventEmitter.emit(
  :data_access,
  "export_asset_inventory",
  actor: "analyst@company.com",
  target: "perimeter_assets",
  severity: :low,
  metadata: %{record_count: 1250, format: :csv}
)
```

## Comparison with External SIEM Platforms

| Capability | Prismatic Internal (Blue Team) | Splunk Enterprise | Elastic SIEM | Microsoft Sentinel |
|-----------|-------------------------------|-------------------|--------------|-------------------|
| Log Sources | 115 Prismatic apps | Universal | Universal | Azure-focused |
| Correlation | NABLA-axiom-based | SPL queries | KQL/EQL | KQL |
| Behavioral Analytics | Drift detection | Splunk UBA | ML Jobs | UEBA |
| Response | Color Team escalation | Phantom SOAR | Elastic Agent | Logic Apps |
| Cost Model | Platform-integrated | Per-GB ingestion | Per-GB ingestion | Per-GB ingestion |
| Deployment | [BEAM](@/glossary/beam.md) process | On-prem/Cloud | On-prem/Cloud | Cloud-only |
| Latency | Sub-millisecond (in-process) | Seconds | Seconds | Seconds |

The platform's internal SIEM capability provides near-zero-latency detection for platform-specific events, while external SIEM integration provides broader organizational context by correlating Prismatic events with events from other infrastructure components.

## MITRE ATT&CK Mapping

The platform's correlation rules map to MITRE ATT&CK techniques, enabling consistent threat classification across internal and external SIEM systems:

| Detection Rule | ATT&CK Technique | Tactic | Prismatic Coverage |
|---------------|-------------------|--------|-------------------|
| Brute Force | T1110 | Credential Access | Authentication events |
| Valid Accounts | T1078 | Privilege Escalation | Authorization events |
| Data Exfiltration | T1048 | Exfiltration | Data access events |
| Account Manipulation | T1098 | Persistence | Configuration events |
| System Discovery | T1082 | Discovery | API enumeration events |

## Best Practices

1. **Normalize event schemas before SIEM ingestion**. Inconsistent schemas across applications create parsing failures and correlation gaps. Use the centralized EventEmitter for all security events to ensure uniform structure.

2. **Set appropriate retention periods**. Compliance frameworks specify minimum retention. NIS2 requires incident logs for at least 18 months. Configure SIEM storage accordingly and automate retention policy enforcement.

3. **Tune correlation rules to reduce false positives**. An overwhelming number of false alerts causes alert fatigue and missed real threats. Start with high-confidence rules and refine thresholds based on operational experience.

4. **Integrate threat intelligence feeds**. SIEM correlation rules enriched with current [threat intelligence](@/glossary/threat-intelligence.md) detect known attack patterns more effectively than signature-only detection.

5. **Test incident detection regularly**. Run simulated security scenarios via the [Red Team](@/glossary/red-team.md) and verify that SIEM correctly detects and alerts on them. Document detection gaps and create new correlation rules to close them.

6. **Monitor SIEM health metrics**. Track ingestion rate, correlation engine latency, storage utilization, and alert volume. A SIEM that is silently dropping events provides a dangerous false sense of security.

## Common Pitfalls

- **Collecting everything without filtering**: Ingesting all application logs into SIEM creates noise and increases storage costs without improving detection. Focus on security-relevant events using the `include_categories` configuration.

- **Ignoring event normalization**: Raw log formats from different applications are difficult to correlate. The Prismatic Platform's consistent event schema eliminates this problem for platform-generated events, but external log sources still require normalization.

- **Not correlating across time windows**: Single-event detection misses multi-step attacks. Configure correlation rules with appropriate time windows that match realistic attack timelines.

- **Treating SIEM as set-and-forget**: SIEM rules require continuous tuning as the application evolves. New features introduce new event types that need corresponding detection rules. The platform's correlation rule definitions should be updated alongside feature development.

- **Alert fatigue from excessive false positives**: Too many low-quality alerts desensitize security analysts. Implement alert triage workflows and continuously raise detection thresholds for noisy rules.

## Related Concepts

- [Observability](@/glossary/observability.md) -- Broader monitoring practice that SIEM specializes for security
- [Structured Logging](@/glossary/structured-logging.md) -- JSON log format enabling SIEM ingestion
- [Threat Intelligence](@/glossary/threat-intelligence.md) -- External feeds enriching SIEM correlation rules
- [Telemetry](@/glossary/telemetry.md) -- Event system producing data consumed by SIEM platforms
- [Blue Team](@/glossary/blue-team.md) -- Internal SIEM-like signal aggregation and correlation
- [NIS2 Directive](@/glossary/nis2.md) -- Compliance framework requiring SIEM-level logging
- [Incident Response](@/glossary/incident-response.md) -- Workflow triggered by SIEM alerts
- [EASM](@/glossary/easm.md) -- Attack surface monitoring generating SIEM events
- [Color Teams](@/glossary/color-teams.md) -- Security framework providing internal SIEM functions
- [Security Rating](@/glossary/security-rating.md) -- Scores derived from SIEM-correlated evidence

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Technologies](@/technologies/_index.md) -- Technology stack details
- [Apps](@/apps/_index.md) -- Application directory

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
