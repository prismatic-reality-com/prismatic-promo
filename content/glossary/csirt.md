+++
title = "CSIRT"
description = "Computer Security Incident Response Team -- a dedicated organizational unit responsible for detecting, analyzing, and responding to cybersecurity incidents, mandatory under NIS2 directive."
weight = 50

[extra]
category = "security"
tags = ["csirt", "incident-response", "security", "nis2", "cybersecurity", "soc", "cert", "threat-response", "compliance", "blue-team"]
date_created = "2026-02-23"
date_updated = "2026-02-23"
difficulty = "intermediate"
audience = ["security-engineers", "architects", "compliance-officers", "incident-responders"]
related_terms = ["incident-reporting", "nis2", "blue-team", "threat-intelligence", "vulnerability", "soc", "siem"]
key_concepts = ["incident-detection", "triage", "containment", "eradication", "recovery", "lessons-learned"]
platforms = ["prismatic-perimeter", "prismatic-osint", "beam"]
prerequisites = ["cybersecurity-fundamentals", "network-security", "log-analysis"]
use_cases = ["incident-response", "threat-hunting", "vulnerability-coordination", "compliance-reporting"]
complexity = "medium"
stability = "mature"
pioneer = "CERT/CC at Carnegie Mellon"
year_introduced = "1988"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1150
date_modified = "2026-02-23"
keywords = ["CSIRT", "Computer Security Incident Response Team", "incident response", "glossary", "cybersecurity", "Prismatic Platform"]
quality_score = 82
see_also = ["capabilities", "architecture", "teams"]
image = "/images/sections/glossary.png"
image_alt = "CSIRT - Prismatic Platform"
+++

## Definition and Overview

A Computer Security Incident Response Team (CSIRT) is a specialized organizational capability responsible for receiving, reviewing, and responding to computer security incident reports and activity. CSIRTs serve as the central coordination point for cybersecurity events within an organization, providing both reactive incident handling and proactive threat monitoring services. The concept originated with the establishment of CERT/CC at Carnegie Mellon University in 1988, following the Morris Worm incident that highlighted the need for coordinated vulnerability response.

CSIRTs operate under defined policies and procedures that govern how incidents are identified, classified, contained, eradicated, and recovered from. Unlike generic IT support teams, CSIRTs possess specialized skills in digital forensics, malware analysis, network traffic analysis, and threat intelligence. Modern CSIRTs also maintain relationships with national and sector-specific response teams, enabling coordinated response to widespread threats that cross organizational boundaries.

Under the European Union's NIS2 Directive (EU 2022/2555), establishing or designating a CSIRT is mandatory for entities classified as essential or important. This regulatory requirement has elevated CSIRTs from optional security capabilities to compliance necessities, with specific requirements for staffing, availability, and reporting timelines. National CSIRTs must be operational 24/7 and capable of responding to incidents within defined service level agreements.

## Technical Deep Dive

CSIRT operations follow a structured incident response lifecycle defined by frameworks such as NIST SP 800-61 and ISO/IEC 27035. Each phase has specific technical requirements and deliverables.

| Phase | Activities | Tools & Techniques |
|-------|-----------|-------------------|
| **Preparation** | Playbook development, tool deployment, training | SIEM configuration, threat intel feeds, IR toolkits |
| **Detection & Analysis** | Alert triage, log correlation, indicator matching | Splunk, ELK, Suricata, YARA rules, STIX/TAXII |
| **Containment** | Network isolation, account lockdown, evidence preservation | Firewall rules, EDR quarantine, forensic imaging |
| **Eradication** | Malware removal, vulnerability patching, configuration hardening | AV/EDR scans, patch management, configuration baselines |
| **Recovery** | System restoration, service validation, monitoring escalation | Backup restoration, integrity checks, enhanced monitoring |
| **Lessons Learned** | Root cause analysis, process improvement, metric reporting | Post-incident review, timeline reconstruction, KPI tracking |

### Classification Taxonomy

CSIRTs use standardized taxonomies to classify incidents by type and severity:

```
Severity Levels:
  S1 (Critical) - Active data exfiltration, ransomware, APT detection
  S2 (High)     - Unauthorized access, privilege escalation, malware outbreak
  S3 (Medium)   - Policy violation, suspicious activity, vulnerability exploitation attempt
  S4 (Low)      - Reconnaissance, port scanning, failed login clusters

Incident Types:
  - Unauthorized Access (credential theft, brute force, session hijacking)
  - Malicious Code (ransomware, trojans, cryptominers, wipers)
  - Denial of Service (volumetric, application-layer, distributed)
  - Information Gathering (scanning, social engineering, phishing)
  - Information Security (data breach, data loss, privacy violation)
```

### Metrics and KPIs

Effective CSIRTs track operational metrics to measure and improve performance:

| Metric | Target | Description |
|--------|--------|-------------|
| **MTTD** (Mean Time to Detect) | < 24 hours | Time from incident start to detection |
| **MTTR** (Mean Time to Respond) | < 4 hours | Time from detection to initial response |
| **MTTC** (Mean Time to Contain) | < 8 hours | Time from detection to containment |
| **MTTE** (Mean Time to Eradicate) | < 72 hours | Time from containment to full eradication |
| **False Positive Rate** | < 15% | Percentage of alerts that are not true incidents |
| **Escalation Rate** | Context-dependent | Percentage of incidents requiring external coordination |

## Architecture and Implementation

Modern CSIRT architectures combine human expertise with automated detection and response capabilities. The technical infrastructure typically consists of several interconnected layers.

The detection layer aggregates data from network sensors, endpoint agents, application logs, and threat intelligence feeds into a central SIEM platform. Correlation rules and machine learning models identify patterns indicative of malicious activity. When a potential incident is detected, an alert is generated and routed to the appropriate analyst based on severity and type.

The analysis layer provides analysts with tools for deep investigation, including packet capture analysis, memory forensics, disk forensics, and sandbox detonation for suspicious files. Analysts correlate indicators of compromise (IOCs) across multiple data sources to determine the scope and impact of an incident.

The response layer enables coordinated containment and eradication actions. This includes automated playbook execution for well-understood incident types, as well as manual intervention capabilities for novel threats. Integration with network infrastructure (firewalls, NAC), endpoint management (EDR, MDM), and identity systems (Active Directory, IAM) enables rapid containment actions.

## Usage in Prismatic Platform

The Prismatic Platform integrates CSIRT capabilities through multiple subsystems, with the Blue Team agents providing automated incident detection and the Perimeter module monitoring the external attack surface.

```elixir
defmodule Prismatic.CSIRT.IncidentHandler do
  @moduledoc """
  Coordinates CSIRT incident response workflow using the
  platform's Blue Team agents and OSINT intelligence feeds.
  Implements the NIST SP 800-61 incident response lifecycle.
  """

  use GenServer

  alias PrismaticPerimeter.SecurityRating
  alias PrismaticOsintCore.ToolRegistry

  @type severity :: :critical | :high | :medium | :low
  @type phase :: :detection | :analysis | :containment | :eradication | :recovery | :lessons_learned

  @type incident :: %{
    id: String.t(),
    severity: severity(),
    phase: phase(),
    detected_at: DateTime.t(),
    indicators: list(map()),
    affected_assets: list(String.t()),
    analyst_notes: list(String.t())
  }

  @spec create_incident(severity(), map()) :: {:ok, incident()} | {:error, term()}
  def create_incident(severity, details) do
    incident = %{
      id: generate_incident_id(),
      severity: severity,
      phase: :detection,
      detected_at: DateTime.utc_now(),
      indicators: Map.get(details, :indicators, []),
      affected_assets: Map.get(details, :assets, []),
      analyst_notes: []
    }

    Phoenix.PubSub.broadcast(
      Prismatic.PubSub,
      "csirt:incidents",
      {:new_incident, incident}
    )

    {:ok, incident}
  end

  @spec escalate(String.t(), severity()) :: {:ok, incident()} | {:error, term()}
  def escalate(incident_id, new_severity) do
    GenServer.call(__MODULE__, {:escalate, incident_id, new_severity})
  end

  defp generate_incident_id do
    timestamp = DateTime.utc_now() |> Calendar.strftime("%Y%m%d")
    random = :crypto.strong_rand_bytes(4) |> Base.encode16(case: :lower)
    "INC-#{timestamp}-#{random}"
  end
end
```

The platform's Color Team architecture maps directly to CSIRT operational roles. Blue Team agents perform continuous monitoring and detection, Red Team agents simulate adversarial scenarios for preparedness testing, and Purple Team agents synthesize findings to close defensive gaps. The **incident-reporting** module handles NIS2-compliant notification workflows.

## Cross-References

- **Incident Reporting** -- NIS2 mandatory notification procedures
- [Blue Team](@/glossary/blue-team.md) -- Defensive security operations
- [Threat Intelligence](@/glossary/threat-intelligence.md) -- Intelligence feeds for detection
- [Vulnerability](@/glossary/vulnerability.md) -- Security weaknesses that CSIRTs remediate
- [NIS2](@/glossary/nis2.md) -- EU directive mandating CSIRT capabilities
- **Livebooks**: `security_compliance/` domain notebooks for incident response workflows
- **Academy**: AdvancedThreatHunting topic covers CSIRT detection techniques

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
