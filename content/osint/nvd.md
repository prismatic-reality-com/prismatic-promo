+++
title = "NVD"
weight = 44
[extra]
icon = "bug"
color = "cyan"
category = "global"
type = "vulnerability"
module = "Nvd"
source_type = "vulnerability"
description = "NIST National Vulnerability Database - the US government repository of CVE vulnerability data with CVSS scoring"
has_api = true
url = "https://nvd.nist.gov"
rate_limit = "Free: 5 req/30sec (no key), 50 req/30sec (with key)"
capabilities = ["CVE Search", "CVSS Scoring", "CPE Matching", "Vulnerability Timeline", "Impact Analysis", "Bulk Data Feeds"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1317
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["NVD", "NIST", "National", "Vulnerability", "Database", "CVSS", "osint", "global", "Prismatic Platform", "CVEs"]
tags = ["osint", "global", "nvd", "prismatic"]
quality_score = 77
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "NVD - Prismatic Platform"
+++

## Overview

The NVD (National Vulnerability Database) is the US government's authoritative repository of vulnerability management data, maintained by NIST (National Institute of Standards and Technology) under the Information Technology Laboratory. It catalogs all CVEs (Common Vulnerabilities and Exposures) with structured analysis including CVSS (Common Vulnerability Scoring System) scores, affected product enumerations (CPE), weakness classifications (CWE), and references to advisories and patches. The NVD processes every [CVE](/glossary/cve/) published by MITRE's CVE Program and enriches it with additional analysis, making it the world's most comprehensive structured vulnerability intelligence source.

For [OSINT](/glossary/osint/) and security assessments, the NVD is the foundational source for vulnerability intelligence. It provides standardized severity scoring, affected product identification, and remediation guidance that enables systematic vulnerability management across any technology stack. The database contains over 200,000 CVE entries dating back to 1999, with new vulnerabilities added daily as the CVE Program processes disclosures from researchers, vendors, and coordination centers worldwide.

The NVD's structured data model -- combining CVE descriptions, CVSS vector strings, CPE product identifiers, and CWE weakness types -- enables automated vulnerability correlation that would be impossible with unstructured advisory text alone. When a technology detection tool identifies Apache HTTP Server 2.4.49 on a target system, the NVD's CPE matching capability instantly returns all known vulnerabilities affecting that exact version, complete with severity scores and exploitation likelihood indicators.

## Data Sources and Coverage

The NVD aggregates vulnerability data from the MITRE CVE Program, enriching each entry with NIST's own analysis. The enrichment process adds CVSS scores (both v3.1 and v4.0), CPE applicability statements, CWE classifications, and curated reference links. This structured enrichment transforms raw CVE descriptions into actionable vulnerability intelligence.

| Data Type | Description | Coverage |
|-----------|-------------|----------|
| **CVE Details** | Vulnerability description, publication date, modification date | 200,000+ CVEs since 1999 |
| **CVSS Score** | Base, temporal, and environmental scores with vector strings | v3.1 and v4.0 scoring |
| **Affected Products** | CPE entries identifying vulnerable software and hardware | Precise version matching |
| **Weakness Type** | CWE classification of the underlying vulnerability class | Standardized taxonomy |
| **References** | Links to advisories, patches, and technical details | Curated reference links |
| **Known Exploited** | CISA KEV (Known Exploited Vulnerabilities) catalog flag | Active exploitation indicator |
| **Configurations** | Complex CPE applicability statements with AND/OR logic | Version ranges and exclusions |
| **Change History** | Audit trail of all modifications to CVE enrichment data | Full provenance |

### CVSS Scoring Framework

The NVD assigns CVSS scores using a standardized methodology that evaluates attack vector, attack complexity, privileges required, user interaction, scope, and impact on confidentiality, integrity, and availability. The resulting score (0.0-10.0) with severity rating (None, Low, Medium, High, Critical) provides a consistent basis for vulnerability prioritization across heterogeneous technology environments.

| Severity | CVSS Range | Typical Response |
|----------|-----------|------------------|
| **Critical** | 9.0-10.0 | Immediate patching, potential emergency change |
| **High** | 7.0-8.9 | Priority patching within defined SLA |
| **Medium** | 4.0-6.9 | Scheduled patching cycle |
| **Low** | 0.1-3.9 | Risk acceptance or next maintenance window |

## Technical Architecture

The Prismatic Platform integrates the NVD through a multi-tier architecture combining real-time API queries with a local vulnerability database. The primary integration uses the NVD API 2.0, which provides JSON responses with comprehensive CVE data. A local mirror of the NVD data is maintained in PostgreSQL for complex queries, offline access, and historical analysis.

The local mirror is synchronized using NVD's change history feed, which tracks modifications to existing CVE entries. This incremental synchronization approach minimizes API consumption while ensuring the local database reflects the latest NVD analysis. Full resynchronization is performed weekly as a consistency check.

The CPE matching engine implements the official CPE matching algorithm (NIST IR 7696) to evaluate CPE applicability statements against detected technology inventories. This enables precise vulnerability correlation that accounts for version ranges, platform constraints, and complex AND/OR configuration requirements specified in NVD applicability statements.

CISA KEV (Known Exploited Vulnerabilities) catalog data is integrated as an additional enrichment layer, flagging CVEs that are confirmed to be actively exploited in the wild. KEV-flagged vulnerabilities receive elevated priority in all risk scoring calculations.

## API Integration

Prismatic Platform integrates the NVD as the primary vulnerability intelligence source. When technology detection tools identify software versions on target assets, the platform queries NVD to retrieve all known CVEs for those products.

```elixir
# Search CVEs by keyword
{:ok, results} = Nvd.search_cves("Apache HTTP Server",
  results_per_page: 20,
  start_index: 0
)
# => %{
#   total_results: 342,
#   vulnerabilities: [
#     %{cve_id: "CVE-2021-41773",
#       description: "Path traversal and file disclosure vulnerability...",
#       published: ~U[2021-10-05 09:15:00Z],
#       cvss_v31: %{score: 7.5, severity: "HIGH", vector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N"},
#       cwe: ["CWE-22"],
#       cpe_match: ["cpe:2.3:a:apache:http_server:2.4.49:*:*:*:*:*:*:*"],
#       references: ["https://httpd.apache.org/security/..."],
#       kev_listed: true}
#   ]
# }

# Search by CPE (precise product matching)
{:ok, vulns} = Nvd.search_by_cpe("cpe:2.3:a:apache:http_server:2.4.49:*:*:*:*:*:*:*")

# Get specific CVE details
{:ok, cve} = Nvd.get_cve("CVE-2021-44228")

# Search by CVSS severity
{:ok, critical} = Nvd.search_cves(cvss_severity: :critical, pub_start_date: ~D[2025-01-01])

# Search by CWE type
{:ok, sqli} = Nvd.search_cves(cwe_id: "CWE-89")

# Get CISA KEV entries
{:ok, kev} = Nvd.known_exploited_vulnerabilities()

# Bulk vulnerability assessment for technology inventory
{:ok, assessment} = Nvd.assess_inventory([
  "cpe:2.3:a:apache:http_server:2.4.49:*:*:*:*:*:*:*",
  "cpe:2.3:a:openssl:openssl:1.1.1k:*:*:*:*:*:*:*",
  "cpe:2.3:o:linux:linux_kernel:5.10.0:*:*:*:*:*:*:*"
])
```

### Vulnerability Assessment Pipeline

```elixir
defmodule PrismaticPerimeter.Assessment.VulnerabilityScanner do
  @moduledoc """
  Correlates detected technologies with NVD vulnerability data
  to produce risk-prioritized vulnerability reports.
  """

  def assess_asset(asset) do
    cpes = Enum.map(asset.technologies, &build_cpe/1)

    vuln_tasks = Enum.map(cpes, fn cpe ->
      Task.async(fn -> Nvd.search_by_cpe(cpe) end)
    end)

    results = Task.await_many(vuln_tasks, 30_000)

    vulnerabilities = results
    |> Enum.flat_map(fn {:ok, data} -> data.vulnerabilities end)
    |> Enum.sort_by(& &1.cvss_v31.score, :desc)

    {:ok, %{
      asset: asset,
      total_vulnerabilities: length(vulnerabilities),
      critical: Enum.count(vulnerabilities, &(&1.cvss_v31.severity == "CRITICAL")),
      high: Enum.count(vulnerabilities, &(&1.cvss_v31.severity == "HIGH")),
      kev_listed: Enum.count(vulnerabilities, & &1.kev_listed),
      risk_score: calculate_composite_risk(vulnerabilities),
      top_vulnerabilities: Enum.take(vulnerabilities, 10)
    }}
  end
end
```

## Use Cases

### Vulnerability Management
- Systematic vulnerability assessment of detected software versions against the NVD catalog
- CVSS-based risk prioritization for patch management with severity-driven SLAs
- CPE matching to determine whether specific product versions are affected by newly disclosed CVEs
- Tracking newly published vulnerabilities relevant to organizational technology inventories

### Security Rating
- Feed CVSS scores into the Prismatic Perimeter security rating algorithm for external assessments
- Combine NVD data with Exploit-DB exploitability data for risk-prioritized vulnerability reports
- CISA KEV integration for highlighting actively exploited vulnerabilities requiring immediate attention
- Historical vulnerability trend analysis for organizational security posture assessment

### Compliance Reporting
- Standardized vulnerability scoring for regulatory compliance documentation
- NIS2 Directive vulnerability management requirements with structured evidence
- Audit-ready vulnerability reports with CVSS justification and remediation guidance
- Time-to-remediation tracking against severity-based SLA requirements

### Threat Intelligence Correlation
- Map exploited vulnerabilities to MITRE ATT&CK techniques for threat-informed defense
- Correlate NVD data with Shodan and Censys findings for exposed vulnerable services
- Track vulnerability weaponization timelines from disclosure to active exploitation

## Data Quality

The NVD represents the gold standard in vulnerability intelligence data quality, backed by NIST's rigorous analysis methodology and the CVE Program's standardized identification process.

| Quality Dimension | Assessment | Notes |
|-------------------|------------|-------|
| **Authority** | Excellent -- US government authoritative source | NIST/MITRE backing |
| **Completeness** | Very high -- processes all CVE Program entries | Some enrichment lag for new CVEs |
| **Scoring Consistency** | High -- standardized CVSS methodology | Multiple analysts for consistency |
| **Product Matching** | High -- CPE applicability with version ranges | Complex configurations supported |
| **Currency** | Good -- enrichment may lag initial CVE publication | API key recommended for real-time |
| **Historical Coverage** | Comprehensive -- CVEs from 1999 to present | Full archive available |

### API Access Details

The NVD provides a REST API (NVD API 2.0) at `https://services.nvd.nist.gov/rest/json/cves/2.0`. Rate limits apply based on authentication status.

| Access Level | Rate Limit | Features |
|-------------|-----------|----------|
| **No API Key** | 5 requests per 30 seconds | Basic search, limited throughput |
| **With API Key** | 50 requests per 30 seconds | Full search, bulk operations |
| **Bulk Data Feeds** | N/A (file download) | Complete database in JSON format |

## Platform Integration

Within the Prismatic Platform, the NVD serves as the primary vulnerability intelligence source. When technology detection tools (BuiltWith, Shodan, Censys) identify software versions on target assets, the platform queries NVD to retrieve all known CVEs for those products. CVSS scores feed into the Prismatic Perimeter security rating algorithm, contributing to the vulnerability component of the overall security grade.

The integration supports automated vulnerability correlation during EASM assessments, real-time vulnerability alerting for monitored assets, and historical vulnerability trend analysis for security posture reporting.

## NABLA Compliance

NVD integration satisfies NABLA epistemic requirements through its authoritative provenance and structured methodology. The Provenance Mandatory axiom is met through CVE ID tracking, which provides a globally unique identifier for every vulnerability that can be traced to its original disclosure. Signal Plurality is enforced by cross-referencing NVD CVSS scores with vendor-specific severity assessments and CISA KEV active exploitation data.

Time Decay is particularly relevant for vulnerability data, as the risk associated with a CVE changes over time based on patch availability, exploitation status, and environmental factors. The platform tracks CVE modification dates and re-evaluates risk scores when NVD enrichment data is updated.

## Performance

| Metric | Target | Typical |
|--------|--------|---------|
| **Single CVE lookup** | < 200ms | 80-150ms |
| **CPE-based search** | < 500ms | 200-400ms |
| **Bulk assessment (50 CPEs)** | < 15s | 5-10s |
| **Local mirror query** | < 10ms | 1-5ms |
| **Mirror sync (incremental)** | < 5min | 1-3min |
| **Full resync** | < 30min | 10-20min |

The local PostgreSQL mirror enables sub-millisecond vulnerability lookups for cached products, eliminating API latency for the most common queries. The incremental sync process ensures the local mirror stays current without consuming excessive API quota.

## Related Resources

- [Exploit-DB](/osint/exploit-db/) - Public exploits for NVD-cataloged vulnerabilities
- [Shodan](/osint/shodan/) - Service detection revealing vulnerable software
- [BuiltWith](/osint/builtwith/) - Technology detection for CPE matching
- [Censys](/osint/censys/) - Internet scanning for vulnerability context
- [VirusTotal](/osint/virustotal/) - Malware samples exploiting known CVEs
- [MITRE ATT&CK](/osint/mitre-attack/) - Technique mapping for exploited vulnerabilities
- [OSINT Core](/apps/prismatic-osint-core/) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](/apps/prismatic-perimeter/) - Vulnerability-based security ratings

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)