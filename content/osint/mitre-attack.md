+++
title = "MITRE ATT&CK"
weight = 43
[extra]
category = "global"
type = "threat"
module = "MitreAttack"
description = "Knowledge base of adversary tactics, techniques, and procedures (TTPs)"
has_api = true
url = "https://attack.mitre.org"
rate_limit = "No rate limit, open framework"
capabilities = ["TTP Mapping", "Adversary Profiling", "Detection Engineering", "Threat Modeling", "Coverage Assessment", "Campaign Tracking"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1314
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["MITRE", "ATTCK", "Knowledge", "TTPs", "osint", "global", "Prismatic Platform", "STIX"]
tags = ["osint", "global", "mitre-attck", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "MITRE ATT&CK - Prismatic Platform"
+++

## Overview

MITRE ATT&CK (Adversarial Tactics, Techniques, and Common Knowledge) is the global standard framework for understanding adversary behavior in cybersecurity. Maintained by the MITRE Corporation, a federally funded research and development center, ATT&CK documents real-world observations of threat actor TTPs (Tactics, Techniques, and Procedures) organized into a comprehensive matrix covering the full attack lifecycle from initial reconnaissance through ultimate impact. Every serious security operation worldwide uses ATT&CK as the common language for [threat intelligence](/glossary/threat-intelligence/), detection engineering, and security assessment.

The framework was first published in 2013 based on observations from MITRE's internal research into APT (Advanced Persistent Threat) group behavior. Since then, it has evolved into three distinct matrices -- Enterprise (covering Windows, macOS, Linux, cloud, network, and containers), Mobile (iOS and Android), and ICS (Industrial Control Systems) -- each documenting the specific techniques adversaries employ against these technology domains. The Enterprise matrix alone catalogs over 200 techniques and 400 sub-techniques, each backed by real-world evidence from threat intelligence reports and incident response investigations.

For [OSINT](/glossary/osint/) practitioners and security teams, ATT&CK serves multiple critical functions: it provides a standardized vocabulary for discussing adversary behavior, enables systematic gap analysis of defensive capabilities, facilitates threat-informed defense prioritization, and supports structured threat intelligence production. The framework's emphasis on observable, evidence-based adversary behavior -- rather than theoretical attack possibilities -- makes it uniquely actionable for operational security teams.

## Data Sources and Coverage

The ATT&CK knowledge base encompasses a structured taxonomy of adversary behavior derived from publicly reported cyber intrusions, threat intelligence reports, and incident response findings. The framework is updated quarterly with new techniques, threat group attributions, and software mappings.

| Data Type | Description | Scale |
|-----------|-------------|-------|
| **Tactics** | 14 high-level adversary goals (Reconnaissance through Impact) | Stable taxonomy |
| **Techniques** | Specific methods adversaries use to achieve tactical goals | 200+ techniques |
| **Sub-Techniques** | Granular variations within parent techniques | 400+ sub-techniques |
| **Groups** | Tracked threat actors with attributed TTPs | 140+ groups |
| **Software** | Malware and tools mapped to techniques they implement | 600+ entries |
| **Mitigations** | Defensive recommendations per technique | Comprehensive coverage |
| **Data Sources** | Detection data requirements per technique | Mapped to each technique |
| **Campaigns** | Specific intrusion campaigns with attributed TTPs | Growing collection |

### ATT&CK Matrix Structure

```
Reconnaissance --> Resource Dev --> Initial Access --> Execution --> Persistence
     |                |              |              |            |
  Active          Acquire         Phishing      Command      Registry
  Scanning        Infra           Exploit        Shell        Run Keys
  Passive         Develop          Supply        Script       Scheduled
  Recon           Accounts         Chain         API          Tasks

--> Privilege Esc --> Defense Evasion --> Credential Access --> Discovery
        |                  |                   |                   |
    Exploit SW          Masquerade         OS Credential       Network
    Process Inj         Indicator Rem      Brute Force         Account
    Valid Accts         Obfuscation        Credentials          System
```

### Coverage by Domain

The Enterprise matrix provides the deepest coverage, with techniques mapped across Windows, Linux, macOS, cloud platforms (AWS, Azure, GCP), network infrastructure, and container environments. Each technique includes detection guidance specifying the data sources and analytics needed to identify adversary use of that technique, creating a direct link between threat intelligence and detection engineering.

## Technical Architecture

The Prismatic Platform integrates ATT&CK as the canonical taxonomy for all threat classification across security modules. The integration architecture consists of three primary components: a local ATT&CK knowledge base maintained in ETS for sub-millisecond lookups, a STIX 2.1 parser that ingests the official ATT&CK data bundles, and a classification engine that maps platform findings to ATT&CK technique IDs.

The local knowledge base is refreshed automatically from the MITRE CTI GitHub repository on a configurable schedule (default: weekly), with incremental updates that preserve local annotations and custom mappings. The STIX 2.1 parser handles the full ATT&CK data model including relationship objects that link techniques to groups, software, and mitigations.

The classification engine uses a combination of keyword matching, behavioral pattern recognition, and configurable rule sets to map findings from Perimeter assessments, OSINT intelligence, and detection events to ATT&CK technique IDs. Classification confidence scores are assigned based on the specificity of the match, with exact behavioral matches receiving higher confidence than keyword-based associations.

## API Integration

Prismatic Platform uses ATT&CK as the canonical taxonomy for threat classification across all security modules. Perimeter findings, [OSINT](/glossary/osint/) intelligence, and detection events are automatically mapped to ATT&CK technique IDs.

```elixir
# Map finding to ATT&CK techniques
{:ok, mapping} = MitreAttack.classify(finding)
# => %{techniques: ["T1595.002", "T1590.001"], tactics: [:reconnaissance]}

# Get technique details
{:ok, technique} = MitreAttack.technique("T1595.002")
# => %{
#   id: "T1595.002",
#   name: "Active Scanning: Vulnerability Scanning",
#   tactic: :reconnaissance,
#   platforms: ["PRE"],
#   description: "Adversaries may scan victims for vulnerabilities...",
#   detection: "Monitor for suspicious network traffic...",
#   mitigations: ["M1056 - Pre-compromise"],
#   data_sources: ["DS0029 - Network Traffic"],
#   groups: ["G0007 - APT28", "G0016 - APT29"]
# }

# Assess coverage against a threat group
{:ok, coverage} = MitreAttack.coverage_assessment("APT29", current_detections)
# => %{
#   group: "APT29",
#   total_techniques: 42,
#   detected: 28,
#   coverage_percentage: 66.7,
#   gaps: [
#     %{technique: "T1055", name: "Process Injection", priority: :critical},
#     %{technique: "T1027", name: "Obfuscated Files", priority: :high}
#   ]
# }

# List all techniques for a tactic
{:ok, techniques} = MitreAttack.techniques_for_tactic(:initial_access)

# Search techniques by keyword
{:ok, results} = MitreAttack.search("phishing")

# Get threat group profile
{:ok, group} = MitreAttack.group("APT29")

# Generate coverage heatmap data
{:ok, heatmap} = MitreAttack.coverage_heatmap(current_detections)
```

### Threat-Informed Defense Pipeline

```elixir
defmodule PrismaticPerimeter.ThreatIntel.AttackMapper do
  @moduledoc """
  Maps Perimeter findings to ATT&CK techniques and generates
  threat-informed defense recommendations.
  """

  def analyze_findings(findings) do
    mapped = Enum.map(findings, fn finding ->
      {:ok, mapping} = MitreAttack.classify(finding)
      Map.put(finding, :attack_mapping, mapping)
    end)

    techniques = mapped
    |> Enum.flat_map(& &1.attack_mapping.techniques)
    |> Enum.frequencies()

    {:ok, %{
      findings: mapped,
      technique_distribution: techniques,
      most_targeted_tactics: identify_top_tactics(techniques),
      recommended_detections: generate_detection_recommendations(techniques),
      coverage_gaps: identify_gaps(techniques)
    }}
  end
end
```

## Use Cases

### Threat Intelligence Production
- Map adversary campaigns to known TTPs for structured intelligence reporting
- Compare threat group capabilities and evolution over time using attributed technique sets
- Identify technique trends across the threat landscape through periodic analysis
- Correlate IOCs with behavioral patterns to move beyond indicator-based detection

### Detection Engineering
- Assess detection coverage against the ATT&CK matrix to identify blind spots
- Prioritize detection rule development based on techniques used by relevant threat groups
- Map [SIEM](/glossary/siem/) rules to techniques for systematic gap analysis
- Build detection-as-code aligned to ATT&CK IDs for structured detection management

### Security Assessment
- [Red team](/glossary/red-team/) operation planning using ATT&CK techniques as the exercise framework
- [Purple team](/glossary/purple-team/) exercises structured around specific technique testing and detection validation
- Security posture assessment against techniques used by real-world adversaries targeting your sector
- Risk-based prioritization of defensive investments based on coverage gap analysis

### Compliance and Reporting
- Map security controls to ATT&CK techniques for compliance documentation
- Generate executive-level reports showing coverage against named threat groups
- Support NIS2 Directive requirements for threat-informed risk management

## Data Quality

ATT&CK data quality is among the highest in the threat intelligence domain due to MITRE's rigorous evidence-based methodology. Every technique entry is backed by at least one real-world observation documented in publicly available threat intelligence reports. Group attributions follow strict criteria requiring multiple independent reports before associations are established.

| Quality Dimension | Assessment | Notes |
|-------------------|------------|-------|
| **Evidence Basis** | Excellent -- all entries require real-world observations | Publicly verifiable sources |
| **Update Frequency** | Quarterly -- consistent release cadence | Version-controlled releases |
| **Coverage** | Comprehensive for IT environments; growing for OT/ICS | Cloud and container coverage expanding |
| **Attribution Rigor** | High -- multiple independent sources required | Conservative attribution policy |
| **Community Validation** | Strong -- widely adopted and peer-reviewed | Industry standard |
| **Actionability** | High -- detection guidance included per technique | Direct operational applicability |

## Platform Integration

Within the Prismatic Platform, ATT&CK serves as the universal threat taxonomy layer. Every security-relevant finding -- whether from Perimeter EASM assessments, OSINT intelligence gathering, or detection event processing -- is tagged with ATT&CK technique IDs when applicable. This creates a unified threat language across all platform modules.

The ATT&CK integration supports three primary workflows: finding classification (automatically mapping discoveries to techniques), coverage assessment (evaluating detection capabilities against threat group profiles), and threat-informed prioritization (ranking findings based on the techniques and threat groups most relevant to the organization's sector and geography).

ATT&CK data is available through the STIX 2.1 bundles via the MITRE CTI GitHub repository and the ATT&CK Workbench API. Data is freely available without authentication.

| Format | Source | Use |
|--------|--------|-----|
| STIX 2.1 | GitHub (mitre/cti) | Machine-readable threat data |
| Navigator | ATT&CK Navigator | Visual coverage mapping |
| Workbench | ATT&CK Workbench | Custom knowledge management |
| Excel | attack.mitre.org | Offline analysis |

## NABLA Compliance

ATT&CK integration satisfies NABLA epistemic requirements through its evidence-based methodology and structured provenance. The Signal Plurality axiom is inherently satisfied by ATT&CK's requirement for multiple independent observations before technique entries are created or group attributions established. The Provenance Mandatory axiom is met through ATT&CK's comprehensive citation system, where every technique, group, and software entry links to its source references.

The Contradiction Preservation axiom is addressed when multiple threat intelligence sources provide conflicting technique attributions for a threat group. The platform preserves both attributions with their respective confidence levels rather than arbitrarily resolving the conflict, flagging the contradiction for analyst review.

Time Decay is implemented through ATT&CK version tracking, with the platform maintaining awareness of when technique entries were last updated and adjusting confidence accordingly for techniques that may have evolved since the last ATT&CK release.

## Performance

| Metric | Target | Typical |
|--------|--------|---------|
| **Technique lookup (ETS)** | < 1ms | 0.1-0.5ms |
| **Finding classification** | < 50ms | 10-30ms |
| **Coverage assessment (single group)** | < 100ms | 40-80ms |
| **Full matrix heatmap generation** | < 500ms | 200-400ms |
| **STIX bundle ingestion (full ATT&CK)** | < 30s | 10-20s |
| **Knowledge base refresh** | < 60s | 25-45s |

The ETS-backed local knowledge base ensures that ATT&CK lookups never introduce network latency into the classification pipeline. The full ATT&CK knowledge base (approximately 15MB of STIX 2.1 data) is loaded into memory at application startup and refreshed in the background without interrupting active classification operations.

## Related Resources

- [Exploit-DB](/osint/exploit-db/) - Exploit database mapped to CVEs and TTPs
- [NVD](/osint/nvd/) - National Vulnerability Database for [CVE](/glossary/cve/) context
- [VirusTotal](/osint/virustotal/) - Malware analysis with behavioral TTPs
- [ThreatFox](/osint/threatfox/) - IOC sharing with ATT&CK mapping
- [GreyNoise](/osint/greynoise/) - Scanner identification with technique context
- [OSINT Core](/apps/prismatic-osint-core/) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](/apps/prismatic-perimeter/) - Threat-informed security ratings

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)