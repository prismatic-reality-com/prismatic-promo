+++
title = "CVE"
weight = 23
[extra]
category = "security"
description = "Standardized identifiers for publicly known cybersecurity vulnerabilities"
related_terms = ["vulnerability-assessment", "penetration-testing", "easm", "security-rating", "risk-score", "threat-intelligence"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1318
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["CVE", "Standardized", "glossary", "security", "Prismatic Platform", "CVSS", "CVEs"]
tags = ["glossary", "security", "cve", "prismatic"]
quality_score = 72
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "CVE - Prismatic Platform"
+++

## Definition and Overview

CVE (Common Vulnerabilities and Exposures) is a standardized identification and cataloging system for publicly disclosed cybersecurity vulnerabilities, maintained by the MITRE Corporation under sponsorship from the U.S. Department of Homeland Security's Cybersecurity and Infrastructure Security Agency (CISA). Each CVE entry receives a globally unique identifier in the format CVE-YYYY-NNNNN (where YYYY is the year of assignment and NNNNN is a sequential number), along with a description of the vulnerability, affected software versions, and references to advisories, patches, and mitigations. Since its inception in 1999, the CVE system has become the universal language for vulnerability identification, enabling consistent tracking, prioritization, and remediation across security tools, databases, and organizations worldwide.

The CVE system solves a fundamental coordination problem in cybersecurity: without standardized identifiers, the same vulnerability might be described differently by different vendors, researchers, and tools, making it impossible to determine whether two reports refer to the same issue. A single CVE identifier eliminates this ambiguity, serving as a common reference point that links vulnerability scanners, patch management systems, SIEMs (Security Information and Event Management), compliance frameworks, and threat intelligence feeds. When a scanner reports CVE-2024-12345, every tool in the security stack knows exactly which vulnerability is being referenced.

The CVE ecosystem extends beyond simple identification. The National Vulnerability Database (NVD), maintained by the National Institute of Standards and Technology (NIST), enriches CVE entries with structured metadata including Common Vulnerability Scoring System (CVSS) scores, Common Platform Enumeration (CPE) identifiers for affected products, and Common Weakness Enumeration (CWE) classifications for the underlying flaw type. This enrichment transforms bare identifiers into actionable intelligence that drives risk-based decision making.

## Technical Deep Dive

### CVE Lifecycle

A CVE entry progresses through several stages from discovery to publication:

| Stage | Actor | Activity | Duration |
|-------|-------|----------|----------|
| **Discovery** | Researcher/Vendor | Vulnerability identified through testing, fuzzing, or code review | Variable |
| **Reporting** | Discoverer | Reported to vendor via coordinated disclosure or to CNA | Days |
| **CNA Assignment** | CVE Numbering Authority | CVE ID reserved and assigned | 1-7 days typical |
| **Vendor Patch** | Software vendor | Patch developed, tested, and prepared for release | Days to months |
| **Publication** | MITRE/NVD | CVE entry published with description and references | Coordinated with patch |
| **NVD Enrichment** | NIST | CVSS score, CPE, and CWE classifications added | 1-14 days after publication |
| **Scanner Integration** | Security tool vendors | Detection signatures created and distributed | 1-30 days after publication |

The coordinated disclosure process aims to publish CVE details simultaneously with the availability of a patch, giving defenders a window to remediate before exploit code becomes widely available. However, this process sometimes breaks down, resulting in zero-day vulnerabilities (known CVEs without available patches) or n-day vulnerabilities (patches available but not yet widely applied).

### CVSS Scoring System

The Common Vulnerability Scoring System provides a standardized framework for rating vulnerability severity on a 0.0 to 10.0 scale. CVSS v3.1 (the current widely-adopted version) computes scores across three metric groups:

| Metric Group | Components | Purpose |
|--------------|------------|---------|
| **Base Score** | Attack Vector, Attack Complexity, Privileges Required, User Interaction, Scope, Confidentiality/Integrity/Availability Impact | Intrinsic vulnerability characteristics |
| **Temporal Score** | Exploit Code Maturity, Remediation Level, Report Confidence | Current threat landscape context |
| **Environmental Score** | Modified Base Metrics, Confidentiality/Integrity/Availability Requirements | Organization-specific impact |

CVSS severity ratings map to qualitative labels:

| CVSS Score | Severity | Example | Typical Response |
|------------|----------|---------|------------------|
| 0.0 | None | Informational finding | Monitor |
| 0.1 - 3.9 | Low | Minor information disclosure | Patch in next cycle |
| 4.0 - 6.9 | Medium | Authentication bypass with mitigations | Patch within 30 days |
| 7.0 - 8.9 | High | Remote code execution requiring authentication | Patch within 7 days |
| 9.0 - 10.0 | Critical | Unauthenticated remote code execution | Emergency patch |

### CWE Classification

Each CVE is classified under one or more Common Weakness Enumeration (CWE) entries that describe the underlying vulnerability type:

| CWE ID | Name | Prevalence | Example CVEs |
|--------|------|------------|--------------|
| CWE-79 | Cross-Site Scripting (XSS) | Very High | Reflected, stored, DOM-based XSS |
| CWE-89 | SQL Injection | High | Parameterized query bypass |
| CWE-787 | Out-of-bounds Write | High | Buffer overflow, heap corruption |
| CWE-862 | Missing Authorization | High | Privilege escalation |
| CWE-918 | Server-Side Request Forgery | Medium | SSRF to internal services |
| CWE-502 | Deserialization of Untrusted Data | Medium | Remote code execution via deserialization |

CWE classifications enable trend analysis -- organizations can identify which vulnerability classes they are most susceptible to and invest in targeted prevention (e.g., adopting parameterized queries to eliminate SQL injection).

### CVE Data Formats

CVE data is distributed in multiple machine-readable formats for tool integration:

- **CVE JSON 5.0**: The canonical format used by MITRE for CVE records, including description, affected products, references, and metrics
- **NVD CPE Match Criteria**: Structured product matching data linking CVEs to specific software versions
- **OVAL**: Open Vulnerability and Assessment Language definitions for automated vulnerability detection
- **STIX/TAXII**: Structured Threat Information Expression for threat intelligence sharing

## Architecture and Implementation

### CVE Integration Architecture

A production CVE monitoring system integrates multiple data sources and processes:

```
CVE Data Sources                  Processing Pipeline              Output
┌─────────────┐                  ┌──────────────────┐            ┌────────────────┐
│ NVD API v2  │──────────────>   │ Ingest & Parse   │            │ Security Rating│
│ MITRE CVE   │──────────────>   │ CVSS Enrichment  │──────────> │ Compliance     │
│ Vendor Feeds│──────────────>   │ CPE Matching     │            │ Dashboards     │
│ Exploit-DB  │──────────────>   │ Priority Scoring │            │ Alerts         │
└─────────────┘                  └──────────────────┘            └────────────────┘
                                        |
                                        v
                                 ┌──────────────────┐
                                 │ Asset Correlation │
                                 │ (CVE x Inventory)│
                                 └──────────────────┘
```

The asset correlation step is critical: a CVE only matters if the organization runs affected software. Matching CVE CPE data against the asset inventory determines which vulnerabilities represent actual risk versus theoretical exposure.

### NVD API Integration

```elixir
defmodule PrismaticPerimeter.CVE.NVDClient do
  @moduledoc """
  Client for the NIST National Vulnerability Database API v2.0.
  Fetches CVE data with rate limiting and caching.
  """

  @base_url "https://services.nvd.nist.gov/rest/json/cves/2.0"
  @rate_limit_ms 6_000  # NVD requires 6s between requests without API key

  @spec fetch_cve(String.t()) :: {:ok, map()} | {:error, term()}
  def fetch_cve(cve_id) do
    case check_cache(cve_id) do
      {:ok, cached} ->
        {:ok, cached}

      :miss ->
        with {:ok, response} <- rate_limited_request("#{@base_url}?cveId=#{cve_id}"),
             {:ok, parsed} <- parse_nvd_response(response) do
          cache_result(cve_id, parsed)
          {:ok, parsed}
        end
    end
  end

  @spec fetch_recent(keyword()) :: {:ok, list(map())} | {:error, term()}
  def fetch_recent(opts \\ []) do
    days_back = Keyword.get(opts, :days, 7)
    severity = Keyword.get(opts, :min_severity, "HIGH")

    start_date = Date.utc_today() |> Date.add(-days_back) |> Date.to_iso8601()

    params = URI.encode_query(%{
      "pubStartDate" => "#{start_date}T00:00:00.000",
      "cvssV3Severity" => severity,
      "resultsPerPage" => 100
    })

    with {:ok, response} <- rate_limited_request("#{@base_url}?#{params}"),
         {:ok, parsed} <- parse_nvd_response(response) do
      {:ok, parsed.vulnerabilities}
    end
  end

  defp rate_limited_request(url) do
    Process.sleep(@rate_limit_ms)
    HTTPClient.get(url, headers: [{"Accept", "application/json"}])
  end

  defp parse_nvd_response(%{status: 200, body: body}) do
    {:ok, Jason.decode!(body)}
  end

  defp parse_nvd_response(%{status: status}) do
    {:error, {:nvd_api_error, status}}
  end

  defp check_cache(cve_id) do
    case :ets.lookup(:cve_cache, cve_id) do
      [{^cve_id, data, inserted_at}] ->
        if DateTime.diff(DateTime.utc_now(), inserted_at, :hour) < 24 do
          {:ok, data}
        else
          :miss
        end
      [] -> :miss
    end
  end

  defp cache_result(cve_id, data) do
    :ets.insert(:cve_cache, {cve_id, data, DateTime.utc_now()})
  end
end
```

## Usage in Prismatic Platform

The Prismatic Platform integrates CVE data within [Prismatic Perimeter](/glossary/prismatic-perimeter/)'s security assessment pipeline, using vulnerability exposure as a key factor in [security rating](/glossary/security-rating/) calculations.

### Security Rating Impact

CVE exposure directly influences the security rating grade assigned to assessed organizations:

```elixir
defmodule PrismaticPerimeter.Rating.CVEScorer do
  @moduledoc """
  Calculates CVE impact on security ratings using CVSS severity weighting.
  """

  @spec score_cve_exposure(list(map())) :: float()
  def score_cve_exposure(cve_findings) do
    base_score = 100.0

    deductions =
      cve_findings
      |> Enum.map(&cve_deduction/1)
      |> Enum.sum()

    max(0.0, base_score - deductions)
  end

  defp cve_deduction(%{cvss_score: score, patch_available: true}) when score >= 9.0, do: 15.0
  defp cve_deduction(%{cvss_score: score, patch_available: true}) when score >= 7.0, do: 8.0
  defp cve_deduction(%{cvss_score: score, patch_available: true}) when score >= 4.0, do: 3.0
  defp cve_deduction(%{cvss_score: score, patch_available: false}) when score >= 9.0, do: 25.0
  defp cve_deduction(%{cvss_score: score, patch_available: false}) when score >= 7.0, do: 15.0
  defp cve_deduction(%{cvss_score: _score, patch_available: _}), do: 1.0
end
```

### Dependency Scanning

The platform scans its own Hex package dependencies against known CVE databases:

```elixir
defmodule PrismaticSafety.DependencyAudit do
  @moduledoc """
  Audits Hex dependencies for known CVEs in the Erlang/Elixir ecosystem.
  """

  @spec audit_dependencies() :: {:ok, list(map())} | {:error, term()}
  def audit_dependencies do
    deps = Mix.Dep.cached()

    findings =
      deps
      |> Enum.map(fn dep ->
        case check_cve_database(dep.app, to_string(dep.requirement)) do
          {:ok, cves} when cves != [] ->
            %{dependency: dep.app, version: dep.requirement, cves: cves, severity: max_severity(cves)}

          _ ->
            nil
        end
      end)
      |> Enum.reject(&is_nil/1)

    {:ok, findings}
  end

  defp max_severity(cves) do
    cves
    |> Enum.map(& &1.cvss_score)
    |> Enum.max(fn -> 0.0 end)
    |> classify_severity()
  end

  defp classify_severity(score) when score >= 9.0, do: :critical
  defp classify_severity(score) when score >= 7.0, do: :high
  defp classify_severity(score) when score >= 4.0, do: :medium
  defp classify_severity(_score), do: :low
end
```

### OSINT Correlation

The [OSINT](/glossary/osint/) framework correlates CVE data with external service fingerprints from Shodan and Censys:

```elixir
defmodule PrismaticOsint.CVECorrelator do
  @moduledoc """
  Correlates discovered services with known CVEs for exploitability assessment.
  """

  @spec correlate(map()) :: {:ok, list(map())}
  def correlate(service_fingerprint) do
    cpe = build_cpe(service_fingerprint)

    with {:ok, matching_cves} <- PrismaticPerimeter.CVE.NVDClient.fetch_by_cpe(cpe) do
      enriched =
        matching_cves
        |> Enum.map(fn cve ->
          %{
            cve_id: cve.id,
            cvss_score: cve.cvss_v3_score,
            exploit_available: check_exploit_db(cve.id),
            patch_available: cve.patch_references != [],
            days_since_publication: Date.diff(Date.utc_today(), cve.published_date),
            risk_level: assess_risk(cve)
          }
        end)
        |> Enum.sort_by(& &1.cvss_score, :desc)

      {:ok, enriched}
    end
  end

  defp assess_risk(cve) do
    cond do
      cve.cvss_v3_score >= 9.0 and not cve.patch_available -> :critical
      cve.cvss_v3_score >= 7.0 and check_exploit_db(cve.id) -> :high
      cve.cvss_v3_score >= 7.0 -> :medium
      true -> :low
    end
  end
end
```

## Best Practices

**Prioritize by exploitability, not just CVSS score.** A CVSS 10.0 vulnerability in software you do not run poses zero risk, while a CVSS 6.5 vulnerability with a public exploit in your exposed service is critical. Use asset correlation and exploit availability to prioritize remediation effectively.

**Automate CVE monitoring.** Manual CVE tracking is unsustainable. Implement automated scanning that matches your asset inventory against new CVE publications daily, with alerting thresholds based on severity and asset criticality. The NVD API provides programmatic access for this automation.

**Track patch SLAs.** Define and enforce Service Level Agreements for patching based on severity: critical CVEs within 24-72 hours, high within 7 days, medium within 30 days. Measure actual patch times against SLAs and report on compliance gaps.

**Monitor the gap between publication and detection.** The time between CVE publication and your organization's detection (mean time to detect, MTTD) and between detection and remediation (mean time to remediate, MTTR) are key security metrics. Reducing MTTD and MTTR directly reduces the exploitation window.

**Include CVE data in compliance assessments.** Regulatory frameworks including [NIS2](/glossary/nis2/) and [ZKB](/glossary/zkb/) require vulnerability management programs. CVE tracking provides the evidence base for compliance documentation.

## Common Pitfalls

**Treating all CVEs equally.** Not all CVEs represent equal risk. A critical CVE in an internal-only service is less urgent than a medium CVE in an internet-facing service with known exploits. Risk-based prioritization must consider context, not just raw CVSS scores.

**Relying solely on NVD.** NVD enrichment can lag CVE publication by days to weeks. Supplement NVD data with vendor security advisories, GitHub Security Advisories, and exploit databases for faster awareness of new vulnerabilities.

**Ignoring CVE disputes and rejections.** Some published CVEs are later disputed or rejected as non-issues. Monitor CVE status changes and remove resolved findings from your risk assessments to avoid alert fatigue.

**Neglecting the Erlang/Elixir ecosystem.** While CVE coverage for mainstream languages is comprehensive, the Erlang/Elixir ecosystem has lower CVE coverage. Supplement automated scanning with manual review of Hex package changelogs and Erlang security announcements.

**Scanning without asset inventory.** CVE scanning without a complete, accurate asset inventory produces noise -- findings for software you do not run. Invest in asset discovery before CVE correlation.

## Related Concepts

- [Vulnerability Assessment](/glossary/vulnerability-assessment/) -- Process that uses CVE data to evaluate exposure
- [Security Rating](/glossary/security-rating/) -- Grades that factor CVE exposure into scoring
- [Risk Score](/glossary/risk-score/) -- Quantified risk incorporating CVE severity data
- [Cyber Threat Intelligence](/glossary/cyber-threat-intelligence/) -- Intelligence context for CVE exploitation trends
- [EASM](/glossary/easm/) -- Attack surface management checking assets against CVE databases
- [Prismatic Perimeter](/glossary/prismatic-perimeter/) -- Platform component integrating CVE assessment
- [OSINT](/glossary/osint/) -- Open-source intelligence for CVE correlation with exposed services

## See Also

- [Architecture](/architecture/) -- Platform architecture overview
- [Technologies](/technologies/) -- Technology stack details
- [Apps](/apps/) -- Applications implementing CVE monitoring

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)