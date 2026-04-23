+++
title = "Advisory"
weight = 50
[extra]
description = "A formal notification or bulletin issued by security organizations, CERTs, or vendors describing vulnerabilities, threats, or recommended actions for system protection"
category = "security"
related_terms = ["csirt", "compliance", "alert", "anomaly-detection", "containment", "credential-stuffing", "vulnerability"]
tags = ["glossary", "advisory", "security", "vulnerability", "cert", "cve", "threat-intelligence", "osint", "beam"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
difficulty = "intermediate"
quality_score = 84
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Security advisories are structured intelligence products that enable proactive vulnerability management and threat response across the Prismatic Platform's OSINT and Perimeter systems"
date_created = "2026-02-24"
date_modified = "2026-02-24"
keywords = ["security advisory", "CVE", "CERT advisory", "vulnerability disclosure", "threat bulletin", "patch management", "OSINT threat feed", "advisory parsing", "vulnerability management"]
image = "/images/sections/glossary.png"
image_alt = "Advisory - Prismatic Platform"
word_count = 980
see_also = ["capabilities", "architecture", "agents"]
+++

## Definition

A security advisory is a formal, structured notification published by a trusted authority -- such as a Computer Emergency Response Team (CERT), software vendor, or security researcher -- that describes a known vulnerability, active threat, or recommended defensive action. Advisories follow standardized formats (CVE identifiers, CVSS scores, affected versions, remediation steps) and serve as the primary communication channel between vulnerability discoverers and the organizations responsible for remediation.

In the Prismatic Platform, advisories are consumed, parsed, correlated, and integrated into the OSINT toolbox, Perimeter security ratings, and compliance assessment workflows as structured intelligence products.

## Technical Deep Dive

### Advisory Taxonomy

| Type | Source | Content | Urgency |
|------|--------|---------|---------|
| **CVE Advisory** | MITRE/NVD | Specific vulnerability description | Varies (CVSS) |
| **Vendor Advisory** | Software vendors | Patches, workarounds | High |
| **CERT Advisory** | National CERTs | Coordinated disclosure | Critical |
| **Threat Advisory** | ISACs, threat intel | Active exploitation reports | Critical |
| **Compliance Advisory** | Regulators | Policy changes, deadlines | Medium |

### Advisory Lifecycle

```
Discovery → Reporting → Triage → Assignment (CVE) → Disclosure → Patch → Verification
     ↓                                                    ↓
  Embargo period                                   Public advisory
     ↓                                                    ↓
  Coordinated disclosure                          Consumer action
```

### Severity Scoring (CVSS v3.1)

| Score Range | Rating | Response SLA |
|-------------|--------|-------------|
| 9.0 - 10.0 | Critical | Immediate (< 24h) |
| 7.0 - 8.9 | High | Urgent (< 72h) |
| 4.0 - 6.9 | Medium | Planned (< 30d) |
| 0.1 - 3.9 | Low | Scheduled (< 90d) |

## Architecture and Implementation

### Advisory Ingestion Pipeline

```elixir
defmodule PrismaticOsintCore.AdvisoryIngester do
  @moduledoc """
  Ingests security advisories from multiple feeds (NVD, CERT-CZ,
  vendor feeds) into the OSINT intelligence pipeline. Advisories
  are normalized to a common schema and stored with full provenance.
  """

  @type advisory :: %{
          cve_id: String.t() | nil,
          title: String.t(),
          description: String.t(),
          severity: :critical | :high | :medium | :low,
          cvss_score: float() | nil,
          source: String.t(),
          published_at: DateTime.t(),
          affected_products: [String.t()],
          remediation: String.t() | nil,
          references: [String.t()]
        }

  @spec ingest_from_feed(String.t(), keyword()) :: {:ok, [advisory()]} | {:error, term()}
  def ingest_from_feed(feed_url, opts \\ []) do
    with {:ok, raw_data} <- fetch_feed(feed_url, opts),
         {:ok, parsed} <- parse_feed_format(raw_data),
         normalized <- Enum.map(parsed, &normalize_advisory/1) do
      Enum.each(normalized, &store_advisory/1)

      :telemetry.execute(
        [:prismatic, :osint, :advisory, :ingested],
        %{count: length(normalized)},
        %{source: feed_url}
      )

      {:ok, normalized}
    end
  end

  @spec normalize_advisory(map()) :: advisory()
  defp normalize_advisory(raw) do
    %{
      cve_id: Map.get(raw, "cve_id") || Map.get(raw, "id"),
      title: Map.fetch!(raw, "title"),
      description: Map.get(raw, "description", ""),
      severity: parse_severity(Map.get(raw, "cvss_score")),
      cvss_score: Map.get(raw, "cvss_score"),
      source: Map.fetch!(raw, "source"),
      published_at: parse_datetime(Map.fetch!(raw, "published")),
      affected_products: Map.get(raw, "affected", []),
      remediation: Map.get(raw, "remediation"),
      references: Map.get(raw, "references", [])
    }
  end

  @spec parse_severity(float() | nil) :: atom()
  defp parse_severity(score) when is_number(score) and score >= 9.0, do: :critical
  defp parse_severity(score) when is_number(score) and score >= 7.0, do: :high
  defp parse_severity(score) when is_number(score) and score >= 4.0, do: :medium
  defp parse_severity(_score), do: :low
end
```

## Usage in Prismatic Platform

- **OSINT Toolbox**: Advisory feeds integrated as intelligence sources in the 127-tool ecosystem
- **Perimeter EASM**: Security ratings factor in unpatched advisories affecting discovered assets
- **Compliance Assessment**: NIS2 and ZKB compliance checks verify advisory response timelines
- **Alert Generation**: Critical advisories trigger platform alerts via PubSub
- **DD Pipeline**: Advisory data enriches entity risk profiles in due diligence assessments

## Code Examples

### Advisory Correlation with Assets

```elixir
defmodule PrismaticPerimeter.AdvisoryCorrelator do
  @moduledoc """
  Correlates security advisories with discovered assets to
  identify exposure. Feeds into security rating calculations.
  """

  @spec correlate(String.t(), list(map())) :: {:ok, list(map())}
  def correlate(domain, advisories) do
    assets = PrismaticPerimeter.AssetStore.get_assets(domain)

    matches =
      for advisory <- advisories,
          asset <- assets,
          affected?(advisory, asset) do
        %{
          advisory_id: advisory.cve_id,
          asset_id: asset.id,
          severity: advisory.severity,
          matched_product: asset.software_version,
          remediation: advisory.remediation
        }
      end

    {:ok, matches}
  end

  @spec affected?(map(), map()) :: boolean()
  defp affected?(advisory, asset) do
    Enum.any?(advisory.affected_products, fn product ->
      String.contains?(String.downcase(asset.software_version || ""), String.downcase(product))
    end)
  end
end
```

## Best Practices

1. **Automate advisory ingestion**: Manual advisory tracking does not scale. Set up automated feeds from NVD, vendor sources, and relevant CERTs.

2. **Prioritize by exploitability**: CVSS score alone is insufficient. Factor in known exploitation (CISA KEV catalog) and asset exposure.

3. **Maintain advisory provenance**: Track the full chain from discovery to remediation for compliance audit trails.

4. **Correlate advisories with your asset inventory**: An advisory is only actionable when mapped to affected systems in your environment.

5. **Define response SLAs by severity**: Establish and enforce maximum remediation timelines for each severity level.

6. **Preserve advisory history**: Do not delete resolved advisories. Historical advisory data is valuable for trend analysis and compliance evidence.

## Related Terms

- **CSIRT** -- teams that publish and respond to advisories
- [Alert](/glossary/alert/) -- automated notifications triggered by advisory conditions
- **Compliance** -- regulatory frameworks mandating advisory response
- [Anomaly Detection](/glossary/anomaly-detection/) -- detecting advisory-related exploitation attempts
- **Containment** -- isolating systems affected by critical advisories
- [ASN](/glossary/asn/) -- network context for advisory-affected infrastructure

## See Also

- [NVD - National Vulnerability Database](https://nvd.nist.gov/) -- primary CVE advisory source
- [CERT-CZ](https://www.csirt.cz/) -- Czech Republic CERT advisories
- [CISA Known Exploited Vulnerabilities](https://www.cisa.gov/known-exploited-vulnerabilities-catalog) -- actively exploited advisories

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
