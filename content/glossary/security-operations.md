+++
title = "Security Operations"
weight = 30
[extra]
description = "Organizational function and technical infrastructure responsible for continuous monitoring, detection, analysis, and response to cybersecurity threats across an enterprise"
category = "security"
abbreviation = "SecOps"
related_terms = ["security-analyst", "security-modeling", "siem", "incident-response", "threat-intelligence", "monitoring", "observability", "zero-trust", "compliance-framework", "risk-assessment"]
keywords = ["security operations center definition", "SOC architecture design", "SecOps automation", "security monitoring infrastructure", "incident response operations", "SOAR platform integration", "security operations maturity", "continuous security monitoring"]
tags = ["security", "operations", "soc", "monitoring", "incident-response"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "15 min"
difficulty = "advanced"
quality_score = 95
date_created = "2026-02-22"
date_updated = "2026-02-22"
word_count = 1326
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Security Operations - Prismatic Platform"
+++

## Definition

Security Operations (SecOps) is the organizational function and technical infrastructure responsible for the continuous protection of an enterprise's information assets through real-time monitoring, threat detection, incident response, and vulnerability management. A Security Operations Center (SOC) serves as the nerve center of this function, staffed by [security analysts](/glossary/security-analyst/) who monitor security telemetry, investigate alerts, respond to incidents, and proactively hunt for threats. SecOps represents the operational instantiation of an organization's security strategy -- the point where security policies, threat models, and compliance requirements translate into daily defensive actions.

The scope of security operations extends far beyond traditional network monitoring. Modern SecOps encompasses endpoint detection and response (EDR), cloud security posture management (CSPM), identity threat detection and response (ITDR), application security monitoring, supply chain security, and data loss prevention. The unifying theme is continuous visibility: SecOps aims to ensure that no significant security event goes undetected, uninvestigated, or unresolved. This requires integrating telemetry from dozens of sources, correlating signals across domains, and maintaining the human expertise needed to distinguish genuine threats from operational noise.

## Overview

Security operations has undergone a fundamental transformation over the past decade. The traditional SOC model -- a room full of analysts staring at dashboards -- has given way to a hybrid model combining automated detection, orchestrated response, and human-led threat hunting. This evolution was driven by three forces: the explosion in telemetry volume (too many alerts for humans to review individually), the increasing sophistication of adversaries (automated tools alone cannot detect novel attacks), and the shift to cloud and hybrid infrastructure (the network perimeter no longer defines the security boundary).

The modern SecOps function is built on several pillars:

| Pillar | Description | Key Technologies |
|--------|-------------|-----------------|
| **Visibility** | Comprehensive telemetry from all assets | SIEM, EDR, NDR, cloud logs |
| **Detection** | Identifying malicious or anomalous activity | Detection rules, ML models, behavioral analytics |
| **Investigation** | Analyzing detected events to determine severity and scope | SOAR, case management, forensic tools |
| **Response** | Containing and remediating confirmed threats | Playbooks, automated response, IR procedures |
| **Prevention** | Proactive measures to reduce attack surface | Vulnerability management, hardening, patching |
| **Intelligence** | External context for understanding threats | Threat feeds, OSINT, dark web monitoring |

Within the Prismatic Platform, security operations is implemented through the [Color Teams](/glossary/color-teams/) framework, the [Perimeter](/glossary/attack-surface/) EASM system, 120+ [OSINT](/glossary/osint/) tools, and the automated [monitoring](/glossary/monitoring/) infrastructure that provides continuous visibility across the platform.

## Technical Deep Dive

### SOC Architecture

A modern SOC architecture separates concerns into data collection, processing, analysis, and response layers:

```elixir
defmodule PrismaticSecOps.SOCArchitecture do
  @moduledoc """
  Security Operations Center architecture for the Prismatic Platform.
  Implements a multi-tier architecture that separates data collection,
  normalization, detection, investigation, and response into distinct
  processing stages with well-defined interfaces.
  """

  @type telemetry_source :: %{
    name: String.t(),
    type: :endpoint | :network | :cloud | :identity | :application,
    format: :syslog | :json | :cef | :leef | :custom,
    events_per_second: non_neg_integer(),
    retention_days: pos_integer()
  }

  @type normalized_event :: %{
    id: String.t(),
    timestamp: DateTime.t(),
    source: telemetry_source(),
    category: String.t(),
    severity: :critical | :high | :medium | :low | :info,
    actors: [String.t()],
    targets: [String.t()],
    actions: [String.t()],
    indicators: [String.t()],
    raw_data: map()
  }

  @type detection_result :: %{
    event: normalized_event(),
    rule_id: String.t(),
    rule_name: String.t(),
    confidence: float(),
    mitre_tactic: String.t() | nil,
    mitre_technique: String.t() | nil,
    priority: :p1 | :p2 | :p3 | :p4
  }

  @doc """
  Normalizes raw security events from diverse sources into
  a common schema for consistent analysis and correlation.
  """
  @spec normalize(map(), telemetry_source()) :: {:ok, normalized_event()} | {:error, String.t()}
  def normalize(raw_event, source) do
    case source.format do
      :syslog -> normalize_syslog(raw_event, source)
      :json -> normalize_json(raw_event, source)
      :cef -> normalize_cef(raw_event, source)
      :leef -> normalize_leef(raw_event, source)
      :custom -> normalize_custom(raw_event, source)
    end
  end

  @doc """
  Runs detection rules against a normalized event.
  Returns all matching rules with confidence scores.
  """
  @spec detect(normalized_event(), [detection_rule()]) :: [detection_result()]
  def detect(event, rules) do
    rules
    |> Enum.filter(fn rule -> rule_matches?(rule, event) end)
    |> Enum.map(fn rule ->
      %{
        event: event,
        rule_id: rule.id,
        rule_name: rule.name,
        confidence: calculate_confidence(rule, event),
        mitre_tactic: rule.mitre_tactic,
        mitre_technique: rule.mitre_technique,
        priority: determine_priority(rule, event)
      }
    end)
    |> Enum.sort_by(& &1.priority)
  end

  @type detection_rule :: %{
    id: String.t(),
    name: String.t(),
    logic: (normalized_event() -> boolean()),
    mitre_tactic: String.t() | nil,
    mitre_technique: String.t() | nil,
    severity: :critical | :high | :medium | :low
  }

  defp rule_matches?(rule, event) do
    rule.logic.(event)
  rescue
    _ -> false
  end

  defp calculate_confidence(rule, _event) do
    case rule.severity do
      :critical -> 0.95
      :high -> 0.85
      :medium -> 0.70
      :low -> 0.50
    end
  end

  defp determine_priority(rule, _event) do
    case rule.severity do
      :critical -> :p1
      :high -> :p2
      :medium -> :p3
      :low -> :p4
    end
  end

  defp normalize_syslog(raw, source) do
    {:ok, build_normalized_event(raw, source)}
  end

  defp normalize_json(raw, source) do
    {:ok, build_normalized_event(raw, source)}
  end

  defp normalize_cef(raw, source) do
    {:ok, build_normalized_event(raw, source)}
  end

  defp normalize_leef(raw, source) do
    {:ok, build_normalized_event(raw, source)}
  end

  defp normalize_custom(raw, source) do
    {:ok, build_normalized_event(raw, source)}
  end

  defp build_normalized_event(raw, source) do
    %{
      id: generate_event_id(),
      timestamp: DateTime.utc_now(),
      source: source,
      category: Map.get(raw, "category", "unknown"),
      severity: :info,
      actors: [],
      targets: [],
      actions: [],
      indicators: [],
      raw_data: raw
    }
  end

  defp generate_event_id do
    :crypto.strong_rand_bytes(16) |> Base.encode16(case: :lower)
  end
end
```

### Security Orchestration and Automated Response (SOAR)

SOAR platforms automate the repetitive aspects of security operations, executing playbooks that codify analyst expertise:

```elixir
defmodule PrismaticSecOps.Playbook do
  @moduledoc """
  Security playbook engine for automated incident response.
  Playbooks codify analyst expertise into repeatable,
  auditable workflows that execute automatically
  when specific conditions are met.
  """

  @type step :: %{
    name: String.t(),
    action: atom(),
    params: map(),
    on_success: atom(),
    on_failure: atom(),
    timeout_ms: pos_integer(),
    requires_approval: boolean()
  }

  @type playbook :: %{
    id: String.t(),
    name: String.t(),
    trigger_conditions: map(),
    steps: [step()],
    escalation_path: [String.t()],
    sla_minutes: pos_integer(),
    auto_execute: boolean()
  }

  @type execution_result :: %{
    playbook_id: String.t(),
    started_at: DateTime.t(),
    completed_at: DateTime.t() | nil,
    steps_completed: non_neg_integer(),
    steps_failed: non_neg_integer(),
    status: :running | :completed | :failed | :escalated | :awaiting_approval,
    audit_trail: [audit_entry()]
  }

  @type audit_entry :: %{
    step_name: String.t(),
    action: atom(),
    result: :success | :failure | :skipped,
    timestamp: DateTime.t(),
    details: map()
  }

  @doc """
  Executes a security playbook against an incident.
  Every step is logged to an immutable audit trail.
  Steps marked as requires_approval pause for human review.
  """
  @spec execute(playbook(), map()) :: execution_result()
  def execute(playbook, incident_context) do
    initial_result = %{
      playbook_id: playbook.id,
      started_at: DateTime.utc_now(),
      completed_at: nil,
      steps_completed: 0,
      steps_failed: 0,
      status: :running,
      audit_trail: []
    }

    Enum.reduce_while(playbook.steps, initial_result, fn step, result ->
      case execute_step(step, incident_context) do
        {:ok, details} ->
          entry = %{
            step_name: step.name,
            action: step.action,
            result: :success,
            timestamp: DateTime.utc_now(),
            details: details
          }

          {:cont, %{result |
            steps_completed: result.steps_completed + 1,
            audit_trail: [entry | result.audit_trail]
          }}

        {:error, reason} ->
          entry = %{
            step_name: step.name,
            action: step.action,
            result: :failure,
            timestamp: DateTime.utc_now(),
            details: %{error: reason}
          }

          {:halt, %{result |
            steps_failed: result.steps_failed + 1,
            status: :failed,
            audit_trail: [entry | result.audit_trail]
          }}

        :awaiting_approval ->
          entry = %{
            step_name: step.name,
            action: step.action,
            result: :skipped,
            timestamp: DateTime.utc_now(),
            details: %{reason: :requires_human_approval}
          }

          {:halt, %{result |
            status: :awaiting_approval,
            audit_trail: [entry | result.audit_trail]
          }}
      end
    end)
    |> finalize_execution()
  end

  defp execute_step(%{requires_approval: true}, _context), do: :awaiting_approval

  defp execute_step(step, context) do
    try do
      apply_action(step.action, step.params, context)
    rescue
      error -> {:error, Exception.message(error)}
    end
  end

  defp apply_action(:block_ip, %{ip: ip}, _context) do
    {:ok, %{action: :block_ip, target: ip, status: :blocked}}
  end

  defp apply_action(:isolate_host, %{host: host}, _context) do
    {:ok, %{action: :isolate_host, target: host, status: :isolated}}
  end

  defp apply_action(:disable_account, %{account: account}, _context) do
    {:ok, %{action: :disable_account, target: account, status: :disabled}}
  end

  defp apply_action(:enrich_indicators, params, _context) do
    {:ok, %{action: :enrich_indicators, indicators: Map.get(params, :indicators, [])}}
  end

  defp apply_action(action, _params, _context) do
    {:error, "Unknown action: #{action}"}
  end

  defp finalize_execution(%{status: :running} = result) do
    %{result |
      status: :completed,
      completed_at: DateTime.utc_now()
    }
  end

  defp finalize_execution(result), do: result
end
```

### Detection Engineering

Detection engineering is the practice of designing, building, testing, and maintaining detection rules -- the logic that identifies malicious activity in telemetry streams:

```elixir
defmodule PrismaticSecOps.DetectionEngineering do
  @moduledoc """
  Detection rule lifecycle management for security operations.
  Implements the detection-as-code paradigm where detection rules
  are version-controlled, tested, and deployed through CI/CD pipelines.
  """

  @type detection_rule :: %{
    id: String.t(),
    name: String.t(),
    description: String.t(),
    author: String.t(),
    mitre_attack: [%{tactic: String.t(), technique: String.t()}],
    data_sources: [String.t()],
    logic: String.t(),
    severity: :critical | :high | :medium | :low,
    false_positive_rate: float(),
    test_cases: [test_case()],
    status: :draft | :testing | :active | :deprecated,
    created_at: DateTime.t(),
    updated_at: DateTime.t()
  }

  @type test_case :: %{
    name: String.t(),
    input: map(),
    expected_result: :should_fire | :should_not_fire,
    description: String.t()
  }

  @type rule_metrics :: %{
    rule_id: String.t(),
    total_fires: non_neg_integer(),
    true_positives: non_neg_integer(),
    false_positives: non_neg_integer(),
    precision: float(),
    mean_triage_time_seconds: float(),
    last_fired: DateTime.t() | nil
  }

  @doc """
  Validates a detection rule by running all test cases.
  A rule must pass all test cases before deployment.
  """
  @spec validate_rule(detection_rule()) ::
    {:ok, :all_tests_passed} | {:error, [String.t()]}
  def validate_rule(rule) do
    results = Enum.map(rule.test_cases, fn test_case ->
      actual = evaluate_rule(rule.logic, test_case.input)
      expected = test_case.expected_result == :should_fire

      if actual == expected do
        :pass
      else
        {:fail, "Test '#{test_case.name}' expected #{test_case.expected_result}, got #{if actual, do: :fired, else: :not_fired}"}
      end
    end)

    failures = Enum.filter(results, &match?({:fail, _}, &1))
               |> Enum.map(fn {:fail, msg} -> msg end)

    if Enum.empty?(failures) do
      {:ok, :all_tests_passed}
    else
      {:error, failures}
    end
  end

  @doc """
  Calculates effectiveness metrics for a detection rule.
  Rules with low precision (high false positive rate) are
  candidates for tuning or deprecation.
  """
  @spec calculate_metrics(String.t(), [map()]) :: rule_metrics()
  def calculate_metrics(rule_id, triage_history) do
    rule_events = Enum.filter(triage_history, &(&1.rule_id == rule_id))
    tp = Enum.count(rule_events, &(&1.disposition == :true_positive))
    fp = Enum.count(rule_events, &(&1.disposition == :false_positive))
    total = length(rule_events)

    triage_times = rule_events
    |> Enum.filter(&Map.has_key?(&1, :triage_duration))
    |> Enum.map(& &1.triage_duration)

    mean_triage = if Enum.empty?(triage_times),
      do: 0.0,
      else: Enum.sum(triage_times) / length(triage_times)

    %{
      rule_id: rule_id,
      total_fires: total,
      true_positives: tp,
      false_positives: fp,
      precision: if(tp + fp > 0, do: tp / (tp + fp), else: 0.0),
      mean_triage_time_seconds: mean_triage,
      last_fired: rule_events |> Enum.map(& &1.timestamp) |> Enum.max(DateTime, fn -> nil end)
    }
  end

  defp evaluate_rule(_logic, _input), do: false
end
```

## Platform Integration

### SecOps within the Prismatic Architecture

The Prismatic Platform implements security operations across multiple layers:

| Layer | SecOps Function | Implementation |
|-------|----------------|----------------|
| **Infrastructure** | Network and host monitoring | Telemetry collection, log aggregation |
| **Application** | Runtime security monitoring | Phoenix telemetry, BEAM process monitoring |
| **Data** | Data access auditing | Ecto query logging, ETS access tracking |
| **Identity** | Authentication and authorization monitoring | Session tracking, RBAC audit logs |
| **External** | Attack surface monitoring | Perimeter EASM, OSINT collection |

### Integration with Observability

Security operations and [observability](/glossary/observability/) share the same telemetry infrastructure but serve different purposes:

| Aspect | Observability | Security Operations |
|--------|--------------|-------------------|
| **Question** | "Is the system healthy?" | "Is the system compromised?" |
| **Telemetry** | Metrics, traces, logs | Alerts, indicators, events |
| **Analysis** | Performance trends, error rates | Threat patterns, anomalous behavior |
| **Response** | Auto-scaling, circuit breaking | Containment, incident response |
| **Retention** | Days to weeks | Months to years (compliance) |

The Prismatic Platform unifies these through a shared [Telemetry](/glossary/telemetry/) infrastructure where the same events feed both operational dashboards and security analytics.

### SecOps Metrics Dashboard

Key metrics tracked by the platform's security operations function:

| Metric Category | Metrics | Target |
|----------------|---------|--------|
| **Detection** | MTTD, detection coverage (MITRE), alert volume | MTTD < 24h, 80%+ coverage |
| **Investigation** | Mean triage time, false positive rate | Triage < 15min, FP < 30% |
| **Response** | MTTR, containment time, playbook execution rate | MTTR < 4h, 90%+ playbook coverage |
| **Prevention** | Vulnerability patch time, attack surface size | Patch < 72h critical, surface declining |
| **Intelligence** | Threat feed coverage, indicator match rate | 10+ feeds, 5%+ match rate |

## Industry Context

### SOC Maturity Model

Organizations progress through SOC maturity levels:

| Level | Name | Characteristics |
|-------|------|----------------|
| **0** | No SOC | Ad hoc incident handling, no dedicated security monitoring |
| **1** | Reactive | Basic SIEM, alert-driven, minimal documentation |
| **2** | Proactive | Threat hunting, detection engineering, playbooks |
| **3** | Optimized | SOAR automation, metrics-driven, continuous improvement |
| **4** | Advanced | AI-augmented, predictive analytics, threat intelligence fusion |
| **5** | Autonomous | Self-healing, automated response, minimal human intervention |

### Regulatory Drivers

Multiple frameworks mandate security operations capabilities:

| Framework | Requirement | SecOps Impact |
|-----------|------------|---------------|
| **NIS2 Directive** | Article 21: risk management, incident handling | 24/7 monitoring, 24h incident notification |
| **DORA** | ICT risk management, incident reporting | Financial sector SOC requirements |
| **PCI DSS 4.0** | Requirement 10: log monitoring | Continuous log review, alert response |
| **SOC 2** | CC7: System operations | Monitoring, incident management procedures |
| **ISO 27001** | A.12: Operations security | Logging, monitoring, vulnerability management |
| **GDPR** | Article 33: Breach notification | 72-hour breach notification capability |

### SecOps Tooling Landscape

| Category | Purpose | Examples |
|----------|---------|---------|
| **SIEM** | Log aggregation and correlation | Splunk, Elastic Security, Microsoft Sentinel |
| **SOAR** | Automated response orchestration | Palo Alto XSOAR, Splunk SOAR, Swimlane |
| **EDR** | Endpoint detection and response | CrowdStrike, SentinelOne, Carbon Black |
| **NDR** | Network detection and response | Darktrace, ExtraHop, Vectra |
| **CSPM** | Cloud security posture | Prisma Cloud, Orca, Wiz |
| **TIP** | Threat intelligence platform | MISP, Anomali, Recorded Future |

## Anti-Patterns and Pitfalls

### Common SecOps Failures

| Anti-Pattern | Description | Remedy |
|-------------|-------------|--------|
| **Alert tsunami** | Thousands of untuned alerts overwhelming analysts | Detection engineering, tuning feedback loops, tiered alerting |
| **Tool sprawl** | Dozens of disconnected security tools | Platform consolidation, API-driven integration, SOAR orchestration |
| **Checkbox compliance** | Operating SOC for audit purposes, not actual security | Threat-driven metrics, red team validation, real-world exercises |
| **Single point of failure** | Critical knowledge held by one analyst or one tool | Cross-training, documentation, redundant tooling |
| **Perimeter fixation** | Focusing only on network boundaries | Zero-trust architecture, identity-centric detection |
| **Stale playbooks** | Outdated response procedures | Regular playbook review, tabletop exercises, version control |
| **Metric gaming** | Optimizing for metrics rather than security outcomes | Outcome-based metrics (breaches prevented, MTTR), red team validation |

## Evolution and Future Directions

Security operations is evolving rapidly:

- **AI-native SOC**: Moving from rule-based detection to AI-native security analytics that understand normal behavior and identify deviations
- **Platform consolidation**: Convergence of SIEM, SOAR, EDR, and NDR into unified security platforms that reduce tool sprawl
- **Detection-as-code**: Version-controlled, CI/CD-deployed detection rules with automated testing and metrics tracking
- **Cloud-native SecOps**: Security operations designed for cloud-first architectures with ephemeral infrastructure and API-driven controls
- **Autonomous response**: AI-driven containment actions for high-confidence threats, reducing MTTR to seconds for certain attack types
- **Threat-informed defense**: Using frameworks like MITRE ATT&CK to systematically map detection coverage and prioritize detection engineering

The Prismatic Platform's security operations architecture -- combining [Color Team](/glossary/color-teams/) adversarial-defensive synthesis, automated [OSINT](/glossary/osint/) enrichment, [SIEM](/glossary/siem/) integration, and playbook-driven response -- provides a foundation that scales from startup SOC to enterprise security operations.

## Related Concepts

Security operations connects to numerous platform concepts:

- [Security Analyst](/glossary/security-analyst/) -- The human operators who staff security operations
- [Security Modeling](/glossary/security-modeling/) -- The formal framework that informs detection engineering
- [SIEM](/glossary/siem/) -- The core technology platform for security event management
- [Incident Response](/glossary/incident-response/) -- The structured process for handling confirmed security events
- [Threat Intelligence](/glossary/threat-intelligence/) -- External context that enriches security operations
- [Monitoring](/glossary/monitoring/) -- The underlying telemetry infrastructure that feeds SecOps
- [Observability](/glossary/observability/) -- The complementary practice of system health monitoring
- [Zero Trust](/glossary/zero-trust/) -- The architecture paradigm that reshapes SecOps boundaries

## Summary

Security operations is the organizational function that translates security strategy into daily defensive action. A modern SOC combines automated detection through SIEM and EDR platforms, orchestrated response through SOAR playbooks, proactive threat hunting by skilled analysts, and continuous intelligence integration from external sources. The effectiveness of security operations is measured not by the volume of alerts processed but by the outcomes achieved: threats detected before impact, incidents contained before spread, and vulnerabilities remediated before exploitation. Within the Prismatic Platform, security operations is implemented through the Color Teams framework, automated OSINT enrichment, detection-as-code pipelines, and playbook-driven response -- creating an integrated defense that addresses the full spectrum from external attack surface monitoring to internal threat hunting.

---

*Built with precision. Operated with vigilance.*

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
