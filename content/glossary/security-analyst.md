+++
title = "Security Analyst"
weight = 30
[extra]
description = "Specialized role responsible for monitoring, analyzing, and responding to security threats across organizational infrastructure and digital assets"
category = "security"
related_terms = ["security-operations", "security-modeling", "threat-intelligence", "incident-response", "osint", "siem", "vulnerability-assessment", "penetration-testing", "risk-assessment", "compliance-framework"]
keywords = ["security analyst role definition", "SOC analyst responsibilities", "threat analysis methodology", "security incident investigation", "security monitoring analyst", "cyber threat analyst skills", "security analyst career path", "threat detection and response"]
tags = ["security", "analyst", "soc", "threat-detection", "incident-response"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "15 min"
difficulty = "intermediate"
quality_score = 95
date_created = "2026-02-22"
date_updated = "2026-02-22"
word_count = 1430
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Security Analyst - Prismatic Platform"
+++

## Definition

A security analyst is a specialized professional responsible for protecting an organization's information systems, digital assets, and infrastructure by continuously monitoring for threats, analyzing security events, investigating incidents, and implementing defensive measures. The role encompasses a wide spectrum of activities: from real-time threat detection in Security Operations Centers (SOCs) to long-term strategic threat intelligence analysis, from vulnerability assessment and penetration testing coordination to compliance auditing and risk assessment. Security analysts serve as the human intelligence layer in a defense-in-depth strategy, applying domain expertise, pattern recognition, and investigative reasoning to distinguish genuine threats from noise in an increasingly complex threat landscape.

The security analyst role has evolved dramatically since its emergence in the late 1990s. Early security analysts were primarily system administrators who also monitored firewall logs. Modern security analysts operate in a world of sophisticated adversaries, advanced persistent threats (APTs), supply chain attacks, zero-day exploits, and AI-generated phishing campaigns. The skill set has expanded correspondingly: modern analysts must understand network protocols, operating system internals, malware behavior, cloud architectures, cryptographic systems, regulatory frameworks, and the tactics, techniques, and procedures (TTPs) documented in frameworks like MITRE ATT&CK.

## Overview

The security analyst function exists at the intersection of technology and human judgment. While automated systems can detect known attack signatures and flag statistical anomalies, they cannot yet match the human capacity for contextual reasoning, creative hypothesis generation, and strategic thinking about adversary intent. A security analyst does not merely react to alerts -- they understand the broader context: who might be targeting the organization, why, what assets are most valuable, what attack vectors are most likely, and how the organization's defenses map to the threat landscape.

Security analysts are typically organized into tiered structures within a SOC:

| Tier | Role | Responsibilities | Tools |
|------|------|-----------------|-------|
| **Tier 1** | Alert Triage | Initial alert review, false positive filtering, escalation | SIEM dashboards, playbooks |
| **Tier 2** | Incident Investigation | Deep investigation of escalated alerts, correlation analysis | EDR, SOAR, packet capture |
| **Tier 3** | Threat Hunting | Proactive search for undetected threats, hypothesis-driven investigation | Custom queries, threat intel, OSINT |
| **Tier 4** | Threat Intelligence | Strategic analysis, adversary profiling, intelligence production | Intel platforms, dark web monitoring |

Within the Prismatic Platform, the security analyst role is augmented by automated [OSINT](@/glossary/osint.md) collection, AI-assisted [threat intelligence](@/glossary/threat-intelligence.md) correlation, and the [Color Teams](@/glossary/color-teams.md) framework that provides structured adversarial-defensive analysis workflows.

The relationship between security analysts and the broader security organization is bidirectional. Analysts produce intelligence that informs security architecture decisions, and security architects define the monitoring requirements and detection logic that analysts operate. This feedback loop -- analyst observations driving architectural improvements, architectural changes requiring updated monitoring -- is central to a mature security program.

## Technical Deep Dive

### Alert Triage and Analysis Pipeline

The core workflow of a security analyst begins with alert triage -- the process of evaluating security alerts to determine their severity, validity, and required response:

```elixir
defmodule PrismaticSecurity.AlertTriage do
  @moduledoc """
  Alert triage pipeline for security analyst workflows.
  Implements structured analysis methodology that augments
  human judgment with automated enrichment and scoring.
  """

  @type severity :: :critical | :high | :medium | :low | :informational
  @type disposition :: :true_positive | :false_positive | :benign_positive | :undetermined

  @type alert :: %{
    id: String.t(),
    source: String.t(),
    rule_name: String.t(),
    severity: severity(),
    raw_event: map(),
    timestamp: DateTime.t(),
    enrichments: map(),
    disposition: disposition() | nil,
    analyst_notes: String.t() | nil
  }

  @type triage_result :: %{
    alert: alert(),
    risk_score: float(),
    recommended_action: :escalate | :investigate | :monitor | :close,
    enrichment_data: map(),
    similar_alerts: [alert()],
    threat_context: map()
  }

  @doc """
  Performs automated pre-triage enrichment on an alert.
  This step runs before the analyst sees the alert, providing
  context that accelerates human decision-making.
  """
  @spec enrich(alert()) :: triage_result()
  def enrich(alert) do
    enrichments = %{
      ip_reputation: lookup_ip_reputation(alert),
      domain_intelligence: lookup_domain_intel(alert),
      threat_intel_matches: correlate_threat_intel(alert),
      asset_context: identify_affected_assets(alert),
      historical_correlation: find_similar_alerts(alert),
      mitre_mapping: map_to_mitre_attack(alert)
    }

    risk_score = calculate_risk_score(alert, enrichments)
    recommended_action = determine_action(risk_score, alert.severity)

    %{
      alert: %{alert | enrichments: enrichments},
      risk_score: risk_score,
      recommended_action: recommended_action,
      enrichment_data: enrichments,
      similar_alerts: enrichments.historical_correlation,
      threat_context: build_threat_context(enrichments)
    }
  end

  @doc """
  Records analyst disposition for an alert.
  All triage decisions are immutable and auditable.
  """
  @spec record_disposition(alert(), disposition(), String.t()) ::
    {:ok, alert()} | {:error, String.t()}
  def record_disposition(alert, disposition, analyst_notes) do
    updated = %{alert |
      disposition: disposition,
      analyst_notes: analyst_notes
    }

    :telemetry.execute(
      [:prismatic, :security, :alert, :triaged],
      %{duration: DateTime.diff(DateTime.utc_now(), alert.timestamp, :second)},
      %{
        severity: alert.severity,
        disposition: disposition,
        source: alert.source
      }
    )

    {:ok, updated}
  end

  defp lookup_ip_reputation(alert) do
    case extract_ips(alert.raw_event) do
      [] -> %{status: :no_ips}
      ips -> Enum.map(ips, &query_reputation_service/1)
    end
  end

  defp lookup_domain_intel(alert) do
    case extract_domains(alert.raw_event) do
      [] -> %{status: :no_domains}
      domains -> Enum.map(domains, &query_domain_intelligence/1)
    end
  end

  defp correlate_threat_intel(alert) do
    indicators = extract_indicators(alert.raw_event)
    Enum.flat_map(indicators, &match_threat_feeds/1)
  end

  defp identify_affected_assets(alert) do
    %{
      hosts: extract_hosts(alert.raw_event),
      services: extract_services(alert.raw_event),
      users: extract_users(alert.raw_event)
    }
  end

  defp find_similar_alerts(alert) do
    # Historical correlation using rule name and indicators
    []
  end

  defp map_to_mitre_attack(alert) do
    %{
      tactic: infer_tactic(alert.rule_name),
      technique: infer_technique(alert.rule_name),
      sub_technique: nil
    }
  end

  defp calculate_risk_score(alert, enrichments) do
    base_score = severity_to_score(alert.severity)
    threat_intel_modifier = if Enum.any?(enrichments.threat_intel_matches), do: 0.3, else: 0.0
    reputation_modifier = calculate_reputation_modifier(enrichments.ip_reputation)

    min(base_score + threat_intel_modifier + reputation_modifier, 1.0)
  end

  defp severity_to_score(:critical), do: 0.9
  defp severity_to_score(:high), do: 0.7
  defp severity_to_score(:medium), do: 0.5
  defp severity_to_score(:low), do: 0.3
  defp severity_to_score(:informational), do: 0.1

  defp determine_action(risk_score, _severity) when risk_score >= 0.8, do: :escalate
  defp determine_action(risk_score, _severity) when risk_score >= 0.5, do: :investigate
  defp determine_action(risk_score, _severity) when risk_score >= 0.3, do: :monitor
  defp determine_action(_risk_score, _severity), do: :close

  defp calculate_reputation_modifier(_reputation), do: 0.0
  defp extract_ips(_event), do: []
  defp extract_domains(_event), do: []
  defp extract_indicators(_event), do: []
  defp extract_hosts(_event), do: []
  defp extract_services(_event), do: []
  defp extract_users(_event), do: []
  defp query_reputation_service(_ip), do: %{}
  defp query_domain_intelligence(_domain), do: %{}
  defp match_threat_feeds(_indicator), do: []
  defp infer_tactic(_rule), do: nil
  defp infer_technique(_rule), do: nil
end
```

### Threat Hunting Methodology

Tier 3 analysts engage in proactive threat hunting -- the hypothesis-driven search for threats that evade automated detection:

```elixir
defmodule PrismaticSecurity.ThreatHunting do
  @moduledoc """
  Threat hunting framework for proactive security analysis.
  Implements hypothesis-driven hunting methodology where
  analysts formulate theories about adversary behavior
  and systematically test them against available data.
  """

  @type hunt_hypothesis :: %{
    id: String.t(),
    analyst: String.t(),
    hypothesis: String.t(),
    mitre_techniques: [String.t()],
    data_sources: [String.t()],
    queries: [query()],
    findings: [finding()],
    status: :active | :completed | :inconclusive,
    created_at: DateTime.t()
  }

  @type query :: %{
    source: String.t(),
    query_text: String.t(),
    timeframe: {DateTime.t(), DateTime.t()},
    results_count: non_neg_integer()
  }

  @type finding :: %{
    description: String.t(),
    severity: :critical | :high | :medium | :low,
    evidence: [map()],
    recommended_action: String.t(),
    new_detection_rule: String.t() | nil
  }

  @doc """
  Creates a new threat hunt based on an analyst hypothesis.
  Every hunt must be tied to specific MITRE ATT&CK techniques
  and must identify the data sources needed for investigation.
  """
  @spec create_hunt(String.t(), String.t(), [String.t()], [String.t()]) ::
    {:ok, hunt_hypothesis()}
  def create_hunt(analyst, hypothesis_text, mitre_techniques, data_sources) do
    hunt = %{
      id: generate_hunt_id(),
      analyst: analyst,
      hypothesis: hypothesis_text,
      mitre_techniques: mitre_techniques,
      data_sources: data_sources,
      queries: [],
      findings: [],
      status: :active,
      created_at: DateTime.utc_now()
    }

    {:ok, hunt}
  end

  @doc """
  Records a query executed during a hunt.
  All queries are logged for reproducibility and knowledge sharing.
  """
  @spec record_query(hunt_hypothesis(), query()) :: hunt_hypothesis()
  def record_query(hunt, query) do
    %{hunt | queries: [query | hunt.queries]}
  end

  @doc """
  Records a finding from a hunt.
  Findings may include recommendations for new detection rules
  that automate future detection of this threat pattern.
  """
  @spec record_finding(hunt_hypothesis(), finding()) :: hunt_hypothesis()
  def record_finding(hunt, finding) do
    %{hunt | findings: [finding | hunt.findings]}
  end

  defp generate_hunt_id do
    "HUNT-" <> (:crypto.strong_rand_bytes(8) |> Base.encode16(case: :upper))
  end
end
```

### Incident Investigation Workflow

When alerts escalate to incidents, security analysts follow structured investigation workflows:

| Phase | Activities | Outputs |
|-------|-----------|---------|
| **Identification** | Confirm incident, assess scope, classify severity | Incident ticket, initial severity rating |
| **Containment** | Isolate affected systems, block malicious indicators | Containment actions, isolation confirmation |
| **Eradication** | Remove threat artifacts, patch vulnerabilities | Clean system images, patch verification |
| **Recovery** | Restore services, verify integrity | Service restoration confirmation |
| **Lessons Learned** | Post-incident review, detection improvement | Post-mortem report, new detection rules |

## Platform Integration

### Color Teams and the Security Analyst

The Prismatic Platform's [Color Teams](@/glossary/color-teams.md) framework provides structured roles that map to different security analyst specializations:

| Color Team | Analyst Analogue | Function |
|-----------|-----------------|----------|
| **Red Team** | Offensive security analyst | Adversarial simulation, attack path identification |
| **Blue Team** | Defensive security analyst | Detection engineering, incident response |
| **Purple Team** | Threat hunting analyst | Red-Blue synthesis, detection gap analysis |
| **White Team** | Compliance analyst | Verification, formal proof of security controls |
| **Gray Team** | Boundary analyst | Edge case discovery, specification gap identification |
| **Black Team** | Threat intelligence analyst | Abstract threat modeling, adversary capability assessment |

### OSINT Integration for Analyst Workflows

Security analysts in the Prismatic Platform leverage the 120+ [OSINT](@/glossary/osint.md) tools for threat investigation:

| OSINT Category | Analyst Use Case | Example Tools |
|---------------|-----------------|---------------|
| **Domain Intelligence** | Investigate suspicious domains in alerts | WHOIS, DNS enumeration, subdomain discovery |
| **IP Reputation** | Assess source/destination IP risk | Shodan, Censys, AbuseIPDB |
| **Certificate Intelligence** | Identify impersonation, phishing infrastructure | Certificate Transparency logs |
| **Registry Intelligence** | Background investigation on entities | ARES, Commercial Register, beneficial ownership |
| **Threat Feeds** | Correlate indicators with known threats | VirusTotal, AlienVault OTX, Abuse.ch |

### Automated Analyst Augmentation

The platform augments security analysts with automated enrichment, correlation, and scoring, reducing mean time to detect (MTTD) and mean time to respond (MTTR):

```elixir
defmodule PrismaticSecurity.AnalystAugmentation do
  @moduledoc """
  AI-augmented security analyst support system.
  Provides automated enrichment, correlation, and recommendation
  while keeping the human analyst as the final decision authority.
  """

  @type recommendation :: %{
    action: :investigate | :escalate | :contain | :monitor | :dismiss,
    confidence: float(),
    reasoning: String.t(),
    evidence: [map()],
    analyst_override: boolean()
  }

  @doc """
  Generates an action recommendation for a security event.
  The recommendation includes confidence scoring and explicit
  reasoning that the analyst can evaluate.
  Analysts always have override authority.
  """
  @spec recommend_action(map()) :: recommendation()
  def recommend_action(enriched_event) do
    signals = extract_signals(enriched_event)
    historical_patterns = match_historical_patterns(signals)
    threat_context = correlate_threat_intelligence(signals)

    confidence = calculate_confidence(signals, historical_patterns, threat_context)
    action = determine_recommended_action(confidence, threat_context)

    %{
      action: action,
      confidence: confidence,
      reasoning: build_reasoning_chain(signals, historical_patterns, threat_context),
      evidence: compile_evidence(signals, historical_patterns),
      analyst_override: false
    }
  end

  defp extract_signals(_event), do: []
  defp match_historical_patterns(_signals), do: []
  defp correlate_threat_intelligence(_signals), do: %{}
  defp calculate_confidence(_signals, _patterns, _context), do: 0.0
  defp determine_recommended_action(confidence, _context) when confidence >= 0.8, do: :escalate
  defp determine_recommended_action(confidence, _context) when confidence >= 0.5, do: :investigate
  defp determine_recommended_action(_confidence, _context), do: :monitor
  defp build_reasoning_chain(_signals, _patterns, _context), do: ""
  defp compile_evidence(_signals, _patterns), do: []
end
```

## Industry Context

### Security Analyst Skills Framework

The industry has standardized around several skills frameworks for security analysts:

| Framework | Focus | Key Competencies |
|-----------|-------|-----------------|
| **NICE Cybersecurity Workforce** | Role-based skills taxonomy | 52 work roles, 7 categories |
| **MITRE ATT&CK** | Adversary behavior understanding | 14 tactics, 200+ techniques |
| **SANS GIAC** | Technical certification | GSEC, GCIH, GCIA, GCFA |
| **CompTIA** | Foundation knowledge | Security+, CySA+, CASP+ |

### Security Analyst Metrics

Measuring security analyst effectiveness requires balancing speed with accuracy:

| Metric | Description | Industry Benchmark |
|--------|-------------|-------------------|
| **Mean Time to Detect (MTTD)** | Time from intrusion to detection | 24-48 hours (mature SOCs) |
| **Mean Time to Respond (MTTR)** | Time from detection to containment | 4-8 hours (mature SOCs) |
| **False Positive Rate** | Percentage of alerts that are false positives | 50-80% (industry average) |
| **Alert Fatigue Index** | Alerts per analyst per shift | 50-100 (sustainable) |
| **Hunt Conversion Rate** | Percentage of hunts producing findings | 10-30% (typical) |
| **Detection Coverage** | MITRE ATT&CK technique coverage | 60-80% (mature programs) |

### Evolving Threat Landscape

Security analysts must continuously adapt to evolving threats:

| Threat Category | 2020 | 2026 | Impact on Analyst Role |
|----------------|------|------|----------------------|
| **Ransomware** | Opportunistic | Targeted, double-extortion | Requires threat intel integration |
| **Supply Chain** | Emerging | Major attack vector | Requires SBOM analysis, dependency monitoring |
| **AI-Generated** | Theoretical | Active (phishing, deepfakes) | Requires AI-awareness, new detection methods |
| **Cloud-Native** | Growing | Dominant | Requires cloud security expertise (IAM, K8s) |
| **Zero-Day** | State actors | Commoditized | Requires behavior-based detection over signatures |

## Anti-Patterns and Pitfalls

### Common Security Analyst Failures

| Anti-Pattern | Description | Remedy |
|-------------|-------------|--------|
| **Alert fatigue** | Ignoring alerts due to volume | Tuning detection rules, automated triage, tiered response |
| **Tunnel vision** | Focusing on one indicator while missing the bigger picture | Structured investigation methodology, peer review |
| **Automation over-reliance** | Trusting automated verdicts without validation | Human-in-the-loop for high-severity decisions |
| **Knowledge hoarding** | Critical knowledge held by single analysts | Documentation, knowledge bases, runbooks, pair analysis |
| **Reactive only** | Only responding to alerts, never hunting proactively | Dedicated threat hunting time, hypothesis-driven approach |
| **Compliance theater** | Performing security checks for audit purposes only | Aligning compliance activities with genuine threat reduction |
| **Tool obsession** | Buying tools instead of developing analyst skills | Skills-first approach, tools as force multipliers |

## Evolution and Future Directions

The security analyst role is being reshaped by several forces:

- **AI-assisted analysis**: Large language models and machine learning are automating routine triage, freeing analysts for higher-order reasoning and threat hunting
- **Security automation (SOAR)**: Security Orchestration, Automation, and Response platforms handle playbook execution, allowing analysts to focus on novel threats
- **Cloud-native security**: Shift from perimeter-based defense to identity-centric, zero-trust architectures requires new analyst skills
- **Threat intelligence operationalization**: Moving from intelligence reports to automated indicator feeds integrated directly into detection pipelines
- **Cross-domain expertise**: Security analysts increasingly need expertise in adjacent domains -- cloud architecture, software development, data engineering, regulatory compliance

The Prismatic Platform's approach -- providing analysts with automated [OSINT](@/glossary/osint.md) enrichment, structured [Color Team](@/glossary/color-teams.md) workflows, [SIEM](@/glossary/siem.md) integration, and AI-augmented recommendations while preserving human decision authority -- represents the direction the industry is heading: augmented intelligence rather than replacement.

## Related Concepts

The security analyst role connects to numerous Prismatic Platform concepts:

- [Security Operations](@/glossary/security-operations.md) -- The organizational framework within which analysts operate
- [Security Modeling](@/glossary/security-modeling.md) -- Formal methods for reasoning about security that analysts apply
- [Threat Intelligence](@/glossary/threat-intelligence.md) -- Intelligence that feeds analyst decision-making
- [Incident Response](@/glossary/incident-response.md) -- The structured process analysts follow during security events
- [OSINT](@/glossary/osint.md) -- Open source intelligence gathering techniques analysts employ
- [SIEM](@/glossary/siem.md) -- The primary monitoring platform analysts use daily
- [Vulnerability Assessment](@/glossary/vulnerability-assessment.md) -- Systematic identification of weaknesses that analysts analyze
- [Penetration Testing](@/glossary/penetration-testing.md) -- Offensive testing that validates defensive analyst capabilities

## Summary

The security analyst is the human intelligence layer in an organization's defense. While automated systems handle signature matching, statistical anomaly detection, and known-threat blocking, security analysts provide the contextual reasoning, creative hypothesis generation, and strategic thinking required to address novel threats, sophisticated adversaries, and complex attack chains. Within the Prismatic Platform, security analysts are augmented by 120+ OSINT tools, structured Color Team workflows, automated enrichment pipelines, and AI-assisted recommendations -- all designed to amplify human judgment rather than replace it. The role continues to evolve as threats become more sophisticated and tools become more capable, but the fundamental value proposition remains: security ultimately depends on human judgment applied with discipline, rigor, and domain expertise.

---

*Built with precision. Defended with intelligence.*

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
