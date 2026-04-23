+++
title = "EASM"
weight = 25
[extra]
description = "External Attack Surface Management for continuous security posture monitoring"
category = "security"
abbreviation = "EASM"
related_app = "prismatic-perimeter"
related_terms = ["security-rating", "nis2", "zkb", "color-teams", "risk-score", "attack-surface", "censys", "hawkeye", "liveview", "osint", "sanctions-screening", "shodan", "threat-intelligence", "timescaledb"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1137
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["EASM", "External", "Attack", "Surface", "Management", "glossary", "security", "Prismatic Platform", "SaaS", "README"]
tags = ["glossary", "security", "easm", "prismatic"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "EASM - Prismatic Platform"
+++

## Definition

External Attack Surface Management (EASM) is a cybersecurity discipline focused on the continuous discovery, inventory, classification, and monitoring of an organization's externally visible digital assets. These assets include domains, subdomains, IP addresses, SSL/TLS certificates, cloud resources, SaaS integrations, exposed APIs, email servers, and any internet-facing services that could be targeted by adversaries. EASM provides organizations with an outside-in view of their security posture -- the same perspective an attacker would have -- enabling proactive identification and remediation of exposures before they are exploited.

EASM emerged as a distinct market category around 2020, driven by the rapid expansion of organizational attack surfaces through cloud adoption, SaaS proliferation, shadow IT, mergers and acquisitions, and remote work infrastructure. Traditional vulnerability management approaches, which rely on organizations knowing what assets they have, became insufficient as the typical enterprise's external footprint grew to include thousands of unknown or unmanaged assets. EASM addresses this gap by continuously discovering assets from the outside, without requiring internal access or agent deployment.

## Overview

The external attack surface of a modern organization extends far beyond its primary domain and known IP ranges. Shadow IT deployments, forgotten development environments, acquired company infrastructure, third-party SaaS integrations, and cloud resources created by individual teams all contribute to an attack surface that is often 30-60% larger than what the security team is aware of. EASM platforms close this visibility gap through automated, continuous reconnaissance.

The EASM lifecycle follows a four-phase continuous loop:

| Phase | Activity | Output |
|-------|----------|--------|
| **Discovery** | Automated reconnaissance across DNS, certificates, IP space, cloud, and OSINT sources | Comprehensive asset inventory |
| **Classification** | Categorization of assets by type, ownership, technology, and business function | Structured asset taxonomy |
| **Assessment** | Security evaluation of each asset for vulnerabilities, misconfigurations, and compliance gaps | Risk scores and security ratings |
| **Monitoring** | Continuous change detection and alerting on new exposures or degraded posture | Real-time security intelligence |

### Market Context

EASM competes in a market alongside established players and emerging platforms:

| Vendor | Approach | Differentiator | Limitation |
|--------|----------|---------------|------------|
| **BitSight** | Third-party risk ratings | Largest rating database, insurance integration | Limited asset discovery depth |
| **SecurityScorecard** | Security rating platform | Broad data sources, questionnaire integration | Rating methodology opacity |
| **Black Kite** | Cyber risk intelligence | Financial quantification of risk | Complex pricing model |
| **Censys** | Internet scanning + ASM | Deep technical scanning, research-grade data | Enterprise pricing |
| **Prismatic Perimeter** | EASM + compliance + OSINT | NIS2/ZKB compliance, open source intelligence, Elixir/BEAM architecture | Platform-specific |

## Technical Details

### Asset Discovery Architecture

EASM discovery operates across multiple data planes, each contributing different asset types and intelligence:

| Data Plane | Sources | Assets Discovered |
|-----------|---------|-------------------|
| **DNS** | Authoritative DNS, passive DNS, CT logs, brute-force | Subdomains, mail servers, name servers, CNAME chains |
| **Certificate** | Certificate Transparency, SSL/TLS handshakes | Domains on certificates, CA information, expiry dates |
| **IP/Network** | WHOIS, BGP, Shodan, Censys, port scanning | IP ranges, open ports, running services, banners |
| **Cloud** | Cloud provider APIs, configuration detection | S3 buckets, Azure blobs, GCP resources, CDN configs |
| **Web** | HTTP crawling, technology fingerprinting | Web applications, technology stacks, exposed paths |
| **Email** | MX records, SPF/DKIM/DMARC analysis | Mail infrastructure, email security configuration |

### Security Rating Methodology

EASM platforms produce security ratings that quantify an organization's external security posture. The Prismatic Perimeter rating methodology uses a weighted scoring system:

```elixir
defmodule PrismaticPerimeter.SecurityRating do
  @moduledoc """
  Calculates security ratings (A-F, 300-900) from EASM assessment data.
  Weighted scoring across multiple security domains produces a composite grade.
  """

  @type rating :: %{
    grade: :A | :B | :C | :D | :F,
    score: 300..900,
    domain_scores: %{atom() => float()},
    industry_percentile: non_neg_integer(),
    assessed_at: DateTime.t()
  }

  @domain_weights %{
    network_security: 0.25,
    application_security: 0.20,
    dns_health: 0.15,
    email_security: 0.15,
    certificate_management: 0.10,
    patch_cadence: 0.10,
    information_leak: 0.05
  }

  @spec calculate([map()]) :: {:ok, rating()} | {:error, term()}
  def calculate(assets) when is_list(assets) and length(assets) > 0 do
    domain_scores =
      @domain_weights
      |> Enum.map(fn {domain, _weight} ->
        {domain, assess_domain(domain, assets)}
      end)
      |> Map.new()

    weighted_score =
      Enum.reduce(@domain_weights, 0.0, fn {domain, weight}, acc ->
        acc + Map.get(domain_scores, domain, 0.0) * weight
      end)

    numeric_score = normalize_to_range(weighted_score, 300, 900)

    {:ok, %{
      grade: score_to_grade(numeric_score),
      score: round(numeric_score),
      domain_scores: domain_scores,
      industry_percentile: calculate_percentile(numeric_score),
      assessed_at: DateTime.utc_now()
    }}
  end

  def calculate(_), do: {:error, :invalid_assets}

  defp score_to_grade(score) when score >= 850, do: :A
  defp score_to_grade(score) when score >= 700, do: :B
  defp score_to_grade(score) when score >= 550, do: :C
  defp score_to_grade(score) when score >= 400, do: :D
  defp score_to_grade(_score), do: :F

  defp normalize_to_range(value, min, max) do
    min + value * (max - min)
  end
end
```

### Compliance Integration

EASM data feeds directly into regulatory compliance assessment. The Prismatic Perimeter evaluates organizational posture against multiple frameworks:

| Framework | Jurisdiction | Key EASM-Relevant Requirements |
|-----------|-------------|-------------------------------|
| **NIS2** (EU 2022/2555) | European Union | Risk management, incident reporting, supply chain security |
| **ZKB** (264/2025 Sb.) | Czech Republic | Cybersecurity obligations, critical infrastructure protection |
| **GDPR** (EU 2016/679) | European Union | Data protection, breach notification, privacy by design |
| **DORA** (EU 2022/2554) | European Union | ICT risk management for financial entities |

## Implementation in Prismatic Platform

The Prismatic Platform implements EASM through the Prismatic Perimeter application (MVP complete, Milestone M46). The system architecture combines Elixir/OTP concurrency for parallel asset discovery with Phoenix LiveView for real-time dashboard visualization:

```elixir
defmodule PrismaticPerimeter do
  @moduledoc """
  External Attack Surface Management facade.
  Provides the primary API for asset discovery, security rating,
  and compliance assessment.
  """

  @spec discover(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def discover(domain, opts \\ []) do
    techniques = Keyword.get(opts, :techniques, [:dns, :certificates, :web, :email])

    tasks =
      Enum.map(techniques, fn technique ->
        Task.async(fn ->
          apply(PrismaticPerimeter.Discovery, technique, [domain, opts])
        end)
      end)

    results =
      tasks
      |> Task.yield_many(:timer.minutes(5))
      |> Enum.flat_map(fn
        {_task, {:ok, {:ok, assets}}} -> assets
        {task, nil} -> Task.shutdown(task, :brutal_kill); []
        _ -> []
      end)

    {:ok, %{
      domain: domain,
      assets: results,
      asset_count: length(results),
      discovered_at: DateTime.utc_now()
    }}
  end

  @spec security_rating(String.t()) :: {:ok, map()} | {:error, term()}
  def security_rating(domain) do
    with {:ok, surface} <- discover(domain),
         {:ok, rating} <- PrismaticPerimeter.SecurityRating.calculate(surface.assets) do
      {:ok, rating}
    end
  end

  @spec assess_compliance(String.t(), [atom()]) :: {:ok, map()} | {:error, term()}
  def assess_compliance(domain, frameworks \\ [:nis2, :zkb]) do
    with {:ok, surface} <- discover(domain),
         {:ok, rating} <- security_rating(domain) do
      assessments =
        Enum.map(frameworks, fn framework ->
          {framework, PrismaticPerimeter.Compliance.assess(framework, surface, rating)}
        end)
        |> Map.new()

      {:ok, %{domain: domain, frameworks: assessments}}
    end
  end
end
```

### Dashboard Routes

| Route | Purpose | Technology |
|-------|---------|-----------|
| `/perimeter` | Main dashboard with overview metrics | Phoenix LiveView |
| `/perimeter/assets` | Asset inventory with filtering and search | LiveView + Alpine.js |
| `/perimeter/compliance` | Detailed compliance assessment by framework | LiveView |
| `/perimeter/easm` | Advanced EASM dashboard with discovery controls | LiveView |

## Comparison with Alternatives

| Capability | Prismatic Perimeter | BitSight | SecurityScorecard | Censys ASM |
|-----------|--------------------|-----------|--------------------|------------|
| Asset Discovery | DNS, Certs, Web, Email | Network scanning | Multiple sources | Deep scanning |
| Security Rating | A-F (300-900) | 250-900 | 0-100 | N/A (risk scores) |
| Compliance | NIS2, ZKB, GDPR | SOC2, ISO | NIST, SOC2 | Limited |
| Real-time Dashboard | Phoenix LiveView | Web portal | Web portal | Web portal |
| OSINT Integration | Native (250+ providers) | Limited | Limited | Research-grade |
| Architecture | Elixir/BEAM (fault-tolerant) | Proprietary | Proprietary | Go/Python |
| Deployment | Self-hosted + Fly.io | SaaS only | SaaS only | SaaS only |

## Best Practices

1. **Continuous Discovery**: Run EASM discovery on a regular schedule (daily minimum) rather than point-in-time assessments. Attack surfaces change constantly as infrastructure evolves.

2. **Correlate Multiple Sources**: No single data source provides complete attack surface visibility. Combine DNS enumeration, certificate transparency, passive DNS, and active scanning for comprehensive coverage.

3. **Contextualize Findings**: Raw asset counts are meaningless without business context. Classify assets by business unit, criticality, data sensitivity, and regulatory scope.

4. **Prioritize by Risk**: Not all exposures are equal. Focus remediation on assets with high business impact and high exploitability, not just high severity scores.

5. **Track Trends**: Monitor security rating trends over time, not just point-in-time scores. Declining trends indicate systemic issues even when absolute scores remain acceptable.

6. **Integrate with Incident Response**: EASM findings should feed into incident response playbooks. When an exposure is discovered, there should be a clear workflow for assessment, remediation, and verification.

## Use Cases

- **Third-Party Risk Management**: Assessing the security posture of vendors, partners, and supply chain organizations through external observation without requiring internal access or questionnaires.

- **M&A Due Diligence**: Evaluating the digital security posture of acquisition targets to identify hidden liabilities, technical debt, and compliance gaps before transaction completion.

- **Continuous Compliance Monitoring**: Maintaining ongoing NIS2 and ZKB compliance through continuous external security posture assessment, generating evidence for regulatory audits.

- **Shadow IT Discovery**: Identifying unauthorized cloud resources, SaaS integrations, and infrastructure deployments that exist outside the security team's awareness.

- **Brand Protection**: Detecting typosquatting domains, phishing infrastructure, and unauthorized use of organizational branding through continuous external monitoring.

## Related Concepts

- [Security Rating](@/glossary/security-rating.md) - A-F grading system produced by EASM analysis
- [NIS2](@/glossary/nis2.md) - EU compliance framework assessed by the platform
- [ZKB](@/glossary/zkb.md) - Czech compliance framework assessed alongside NIS2
- [DNS Enumeration](@/glossary/dns-enumeration.md) - Core discovery technique within EASM
- [OSINT](@/glossary/osint.md) - Intelligence methodology powering asset discovery
- [Attack Surface](@/glossary/attack-surface.md) - The total exposure area that EASM manages
- [HAWKEYE](@/glossary/hawkeye.md) - Visitor intelligence system complementing external EASM
- [Threat Intelligence](@/glossary/threat-intelligence.md) - Structured threat data enriching EASM findings
- [Shodan](@/glossary/shodan.md) - Internet scanner providing port and service intelligence
- [Censys](@/glossary/censys.md) - Certificate and host scanner enriching discovery results
- [GDPR](@/glossary/gdpr.md) - Data protection regulation assessed through EASM compliance

## See Also

- [prismatic_perimeter](../../../apps/prismatic_perimeter/README.md) -- Primary EASM application with discovery, rating, and compliance
- [prismatic_perimeter_core](../../../apps/prismatic_perimeter_core/README.md) -- Core EASM logic and domain models
- [prismatic_perimeter_web](../../../apps/prismatic_perimeter_web/README.md) -- LiveView dashboards for EASM visualization
- [prismatic_osint_core](../../../apps/prismatic_osint_core/README.md) -- OSINT engine powering asset discovery
- [prismatic_osint_network](../../../apps/prismatic_osint_network/README.md) -- Network reconnaissance for attack surface mapping
- [prismatic_compliance](../../../apps/prismatic_compliance/README.md) -- Compliance assessment engine for NIS2 and ZKB
- [prismatic_web](../../../apps/prismatic_web/README.md) -- Main web interface hosting Perimeter dashboards

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)