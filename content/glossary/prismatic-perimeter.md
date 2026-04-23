+++
title = "Prismatic Perimeter"
weight = 48
[extra]
category = "security"
description = "External Attack Surface Management application with security ratings, asset discovery, and regulatory compliance assessment"
domain = "cybersecurity"
complexity = "advanced"
stability = "stable"
since_version = "5.0.0"
enforcement_level = "production"
milestone = "M46"
acronym = "EASM"
rating_scale = "A-F (300-900)"
compliance_frameworks = ["NIS2", "ZKB"]
related_terms = ["easm", "security-rating", "nis2", "zkb", "attack-surface", "risk-score", "osint", "gen-statem", "liveview", "phoenix", "postgresql", "circuit-breaker"]
platforms = ["elixir", "phoenix", "liveview"]
use_cases = ["attack-surface-discovery", "security-rating", "compliance-assessment", "third-party-risk", "continuous-monitoring"]
tags = ["easm", "security-ratings", "compliance", "nis2", "zkb", "asset-discovery", "vulnerability-management"]
see_also = ["easm", "security-rating", "nis2", "zkb", "osint"]
difficulty = "advanced"
audience = ["security-engineers", "compliance-officers", "ciso", "platform-architects"]
prerequisites = ["osint", "easm", "phoenix", "liveview"]
competitors = ["bitsight", "black-kite", "securityscorecard", "riskrecon"]
date_created = "2026-02-22"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1287
date_modified = "2026-02-23"
keywords = ["Prismatic", "Perimeter", "External", "Attack", "Surface", "Management", "glossary", "security", "Prismatic Platform", "Prismatic Perimeter"]
quality_score = 80
image = "/images/sections/glossary.png"
image_alt = "Prismatic Perimeter - Prismatic Platform"
+++

## Definition and Overview

Prismatic Perimeter (`prismatic_perimeter`) is the platform's External Attack Surface Management (EASM) application, designed to compete with commercial solutions like BitSight, Black Kite, and SecurityScorecard. It performs automated discovery of an organization's external-facing digital assets -- domains, IP addresses, SSL/TLS certificates, cloud resources, exposed services, and API endpoints -- then assigns security ratings (A-F grades with numeric scores from 300-900), identifies vulnerabilities, and assesses compliance against regulatory frameworks including the NIS2 Directive (EU 2022/2555) and ZKB 264/2025 Sb. (Czech cybersecurity regulation). The MVP was completed in Milestone M46, providing a [LiveView](/glossary/liveview/) dashboard for real-time security posture monitoring.

External Attack Surface Management addresses a critical gap in traditional security programs. Organizations know what assets they have deployed internally, but their external attack surface -- the collection of internet-facing resources visible to potential adversaries -- is often poorly understood. Shadow IT, forgotten subdomains, misconfigured cloud resources, expired certificates, and unpatched services create an attack surface that grows organically and invisibly. Prismatic Perimeter maps this surface through the same techniques that adversaries use for reconnaissance, providing defenders with the attacker's perspective of their organization.

The security rating system provides a quantitative, comparable measure of an organization's external security posture. Like a credit score for cybersecurity, ratings enable rapid assessment of third-party risk, regulatory compliance benchmarking, and trend tracking over time. The A-F grading scale is intuitive for non-technical stakeholders (board members, procurement teams, insurance underwriters), while the numeric score (300-900) provides granularity for security professionals tracking incremental improvements.

## Competitive Landscape

Prismatic Perimeter enters a competitive market dominated by established vendors. Understanding the competitive landscape clarifies the platform's positioning and technical differentiation.

| Vendor | Rating Scale | Asset Discovery | Compliance | Pricing Model |
|--------|-------------|-----------------|------------|---------------|
| **BitSight** | 250-900 | Passive + active | Limited | Per-company |
| **SecurityScorecard** | 0-100 | Passive | SOC2, ISO 27001 | Per-company |
| **Black Kite** | 0-100 | Passive | NIST, GDPR | Per-company |
| **RiskRecon** | 0-10 | Passive | Limited | Per-company |
| **Prismatic Perimeter** | 300-900 (A-F) | Multi-phase active | NIS2, ZKB | Open source |

Prismatic Perimeter differentiates through several key capabilities: open-source transparency (no black-box scoring), EU regulatory focus (NIS2/ZKB compliance), evidence-based scoring (every rating backed by verifiable findings), and deep integration with the Prismatic Platform's [OSINT](/glossary/osint/) capabilities (120 intelligence tools). The open-source nature means organizations can audit the scoring methodology, understand exactly why they received a particular rating, and contribute improvements to the assessment engine.

## Technical Architecture

### Discovery Pipeline

The discovery pipeline operates as a multi-phase process, implemented as a [GenStatem](/glossary/gen-statem/) state machine that progresses through sequential discovery stages. Each phase enriches the asset inventory with additional intelligence gathered from different sources.

```elixir
defmodule PrismaticPerimeter.Discovery.Pipeline do
  @moduledoc """
  Multi-phase asset discovery pipeline for external attack surface mapping.
  Each phase enriches the asset inventory with additional intelligence.
  Implements fault-tolerant discovery with phase-level error isolation.
  """

  @type asset_type :: :domain | :ip_address | :certificate | :service | :cloud_resource
  @type finding_severity :: :critical | :high | :medium | :low | :informational

  @type discovery_result :: %{
    domain: String.t(),
    assets: list(map()),
    findings: list(map()),
    discovery_time_ms: non_neg_integer(),
    phases_completed: list(atom()),
    phases_failed: list(atom())
  }

  @phases [
    :dns_enumeration,
    :certificate_transparency,
    :whois_lookup,
    :subdomain_discovery,
    :port_scanning,
    :service_fingerprinting,
    :vulnerability_correlation,
    :cloud_resource_discovery
  ]

  @spec discover(String.t(), keyword()) :: {:ok, discovery_result()} | {:error, term()}
  def discover(domain, opts \\ []) when is_binary(domain) do
    phases = Keyword.get(opts, :phases, @phases)
    timeout = Keyword.get(opts, :timeout, 120_000)

    initial_state = %{
      domain: domain,
      assets: [],
      findings: [],
      phases_failed: [],
      start_time: System.monotonic_time(:millisecond)
    }

    result =
      Enum.reduce_while(phases, {:ok, initial_state}, fn phase, {:ok, state} ->
        case execute_phase(phase, state, timeout) do
          {:ok, new_state} ->
            {:cont, {:ok, new_state}}

          {:error, reason} ->
            :telemetry.execute(
              [:perimeter, :discovery, :phase_error],
              %{phase: phase},
              %{domain: domain, reason: reason}
            )

            updated = %{state |
              findings: [{:phase_error, phase, reason} | state.findings],
              phases_failed: [phase | state.phases_failed]
            }
            {:cont, {:ok, updated}}
        end
      end)

    case result do
      {:ok, final_state} ->
        elapsed = System.monotonic_time(:millisecond) - final_state.start_time

        :telemetry.execute(
          [:perimeter, :discovery, :complete],
          %{duration_ms: elapsed, asset_count: length(final_state.assets)},
          %{domain: domain}
        )

        {:ok, %{
          domain: domain,
          assets: final_state.assets,
          findings: final_state.findings,
          discovery_time_ms: elapsed,
          phases_completed: phases -- final_state.phases_failed,
          phases_failed: final_state.phases_failed
        }}

      error -> error
    end
  end

  defp execute_phase(:dns_enumeration, state, _timeout) do
    case PrismaticPerimeter.DNS.enumerate(state.domain) do
      {:ok, records} ->
        assets = Enum.map(records, &dns_record_to_asset/1)
        {:ok, %{state | assets: state.assets ++ assets}}

      error -> error
    end
  end

  defp execute_phase(:certificate_transparency, state, _timeout) do
    case PrismaticPerimeter.CertTransparency.query(state.domain) do
      {:ok, certs} ->
        assets = Enum.map(certs, &cert_to_asset/1)
        findings = Enum.flat_map(certs, &cert_findings/1)
        {:ok, %{state | assets: state.assets ++ assets, findings: state.findings ++ findings}}

      error -> error
    end
  end

  defp execute_phase(:service_fingerprinting, state, _timeout) do
    ip_assets = Enum.filter(state.assets, &(&1.type == :ip_address))

    services =
      ip_assets
      |> Task.async_stream(
        &PrismaticPerimeter.ServiceScanner.fingerprint/1,
        max_concurrency: 10,
        timeout: 30_000
      )
      |> Enum.flat_map(fn
        {:ok, {:ok, services}} -> services
        _ -> []
      end)

    {:ok, %{state | assets: state.assets ++ services}}
  end
end
```

### Discovery Phases Explained

| Phase | Data Source | Assets Discovered | Findings Generated |
|-------|-----------|-------------------|-------------------|
| **DNS Enumeration** | DNS servers | A, AAAA, MX, NS, TXT records | Missing SPF/DKIM/DMARC |
| **Certificate Transparency** | CT logs | SSL/TLS certificates | Expired/weak certs |
| **WHOIS Lookup** | WHOIS registrars | Domain registration details | Expiring domains |
| **Subdomain Discovery** | Multiple sources | Subdomains, virtual hosts | Shadow IT subdomains |
| **Port Scanning** | Network probes | Open ports per IP | Unexpected open ports |
| **Service Fingerprinting** | Banner grabbing | Service versions, technologies | Outdated software |
| **Vulnerability Correlation** | CVE databases | N/A | Known CVEs for services |
| **Cloud Resource Discovery** | Cloud APIs | S3 buckets, Azure blobs, GCP | Misconfigured storage |

## Security Rating Engine

The rating engine calculates security scores across multiple assessment categories, producing both an intuitive letter grade and a numeric score for detailed analysis.

```elixir
defmodule PrismaticPerimeter.Rating.Engine do
  @moduledoc """
  Security rating engine calculating A-F grades from evidence-based assessment.
  Produces numeric scores (300-900) with industry percentile ranking.
  All ratings are backed by verifiable evidence chains.
  """

  @type grade :: :A | :B | :C | :D | :F
  @type score :: 300..900

  @type rating :: %{
    grade: grade(),
    score: score(),
    industry_percentile: 0..100,
    categories: map(),
    evidence: list(map()),
    assessed_at: DateTime.t()
  }

  @category_weights %{
    vulnerability_exposure: 0.25,
    certificate_hygiene: 0.15,
    dns_security: 0.15,
    configuration_posture: 0.15,
    patch_management: 0.10,
    encryption_strength: 0.10,
    information_leakage: 0.10
  }

  @grade_thresholds [
    {:A, 800},
    {:B, 680},
    {:C, 560},
    {:D, 440},
    {:F, 0}
  ]

  @spec calculate_rating(list(map()), list(map())) :: {:ok, rating()} | {:error, term()}
  def calculate_rating(assets, findings) when is_list(assets) and is_list(findings) do
    category_scores =
      @category_weights
      |> Enum.map(fn {category, weight} ->
        raw_score = assess_category(category, assets, findings)
        {category, %{raw: raw_score, weighted: raw_score * weight, weight: weight}}
      end)
      |> Enum.into(%{})

    total_score =
      category_scores
      |> Enum.map(fn {_, %{weighted: w}} -> w end)
      |> Enum.sum()
      |> normalize_to_range(300, 900)
      |> round()

    grade = score_to_grade(total_score)

    {:ok, %{
      grade: grade,
      score: total_score,
      industry_percentile: calculate_percentile(total_score),
      categories: category_scores,
      evidence: compile_evidence(assets, findings),
      assessed_at: DateTime.utc_now()
    }}
  end

  defp assess_category(:vulnerability_exposure, _assets, findings) do
    vulns = Enum.filter(findings, &(&1.type == :vulnerability))
    critical = Enum.count(vulns, &(&1.severity == :critical))
    high = Enum.count(vulns, &(&1.severity == :high))
    medium = Enum.count(vulns, &(&1.severity == :medium))

    (1.0 - (critical * 0.3) - (high * 0.15) - (medium * 0.05))
    |> max(0.0)
  end

  defp assess_category(:certificate_hygiene, assets, _findings) do
    certs = Enum.filter(assets, &(&1.type == :certificate))
    if Enum.empty?(certs), do: 0.5, else: evaluate_certificates(certs)
  end

  defp assess_category(:dns_security, assets, _findings) do
    dns_records = Enum.filter(assets, &(&1.type == :dns_record))
    evaluate_dns_security(dns_records)
  end

  defp score_to_grade(score) do
    Enum.find_value(@grade_thresholds, fn {grade, threshold} ->
      if score >= threshold, do: grade
    end)
  end

  defp normalize_to_range(value, min, max) do
    clamped = value |> Kernel.max(0.0) |> Kernel.min(1.0)
    min + clamped * (max - min)
  end
end
```

### Rating Categories Explained

| Category | Weight | What It Measures | Key Indicators |
|----------|--------|-----------------|----------------|
| **Vulnerability Exposure** | 25% | Known CVEs affecting discovered services | Critical/High/Medium vulnerability counts |
| **Certificate Hygiene** | 15% | SSL/TLS certificate health | Expiration, key strength, chain validity |
| **DNS Security** | 15% | DNS configuration security | DNSSEC, SPF, DKIM, DMARC presence |
| **Configuration Posture** | 15% | Server/service configuration | Security headers, default credentials |
| **Patch Management** | 10% | Software version currency | Days behind latest patch, EOL software |
| **Encryption Strength** | 10% | Cryptographic algorithm quality | TLS version, cipher suite strength |
| **Information Leakage** | 10% | Unintended data exposure | Directory listings, error pages, metadata |

## Compliance Assessment

The compliance module maps security findings to regulatory controls, supporting NIS2 (EU 2022/2555) and ZKB 264/2025 Sb. (Czech cybersecurity regulation).

```elixir
defmodule PrismaticPerimeter.Compliance.Assessor do
  @moduledoc """
  Regulatory compliance assessment against NIS2 and ZKB frameworks.
  Maps discovered assets and security findings to specific compliance
  controls, producing evidence-based gap analysis reports.
  """

  @type compliance_status :: :compliant | :partial | :non_compliant | :not_assessed
  @type framework :: :nis2 | :zkb

  @type compliance_result :: %{
    framework: framework(),
    overall_compliance: float(),
    controls: list(map()),
    gaps: list(map()),
    evidence: list(map()),
    assessed_at: DateTime.t()
  }

  @spec assess(String.t(), list(framework())) :: {:ok, list(compliance_result())} | {:error, term()}
  def assess(domain, frameworks \\ [:nis2, :zkb]) when is_binary(domain) do
    case load_latest_assessment(domain) do
      {:ok, {assets, findings}} ->
        results =
          Enum.map(frameworks, fn framework ->
            controls = load_controls(framework)

            assessed_controls =
              Enum.map(controls, fn control ->
                status = evaluate_control(control, assets, findings)
                evidence = gather_evidence(control, assets, findings)

                %{
                  control_id: control.id,
                  description: control.description,
                  status: status,
                  evidence: evidence,
                  remediation: if(status != :compliant, do: control.remediation)
                }
              end)

            compliant_count = Enum.count(assessed_controls, &(&1.status == :compliant))
            total = length(assessed_controls)

            %{
              framework: framework,
              overall_compliance: if(total > 0, do: compliant_count / total, else: 0.0),
              controls: assessed_controls,
              gaps: Enum.filter(assessed_controls, &(&1.status != :compliant)),
              evidence: Enum.flat_map(assessed_controls, & &1.evidence),
              assessed_at: DateTime.utc_now()
            }
          end)

        {:ok, results}

      {:error, reason} ->
        {:error, {:no_assessment_data, reason}}
    end
  end
end
```

### Compliance Frameworks

| Framework | Jurisdiction | Key Articles | Sectors |
|-----------|-------------|--------------|---------|
| **NIS2 Article 21** | EU | Risk management measures | 18 critical sectors |
| **NIS2 Article 23** | EU | Incident reporting obligations | Essential + important entities |
| **ZKB Section 4** | Czech Republic | Cybersecurity obligations | Czech transposition of NIS2 |
| **ZKB Section 8** | Czech Republic | Incident response requirements | Czech-specific reporting |

## LiveView Dashboard

The Perimeter dashboard provides real-time security posture monitoring through [Phoenix](/glossary/phoenix/) [LiveView](/glossary/liveview/).

```elixir
defmodule PrismaticWeb.PerimeterDashboardLive do
  @moduledoc """
  LiveView dashboard for Prismatic Perimeter security posture monitoring.
  Provides real-time updates on security ratings, asset counts,
  critical findings, and compliance status.
  """

  use PrismaticWeb, :live_view

  @refresh_interval_ms 30_000

  @impl Phoenix.LiveView
  @spec mount(map(), map(), Phoenix.LiveView.Socket.t()) :: {:ok, Phoenix.LiveView.Socket.t()}
  def mount(_params, _session, socket) do
    if connected?(socket) do
      :timer.send_interval(@refresh_interval_ms, :refresh_data)
    end

    {:ok, assign_dashboard_data(socket)}
  end

  @impl Phoenix.LiveView
  def handle_info(:refresh_data, socket) do
    {:noreply, assign_dashboard_data(socket)}
  end

  defp assign_dashboard_data(socket) do
    socket
    |> assign(:security_rating, fetch_latest_rating())
    |> assign(:asset_count, count_assets())
    |> assign(:critical_findings, fetch_critical_findings())
    |> assign(:compliance_status, fetch_compliance_summary())
    |> assign(:recent_discoveries, fetch_recent_discoveries(10))
    |> assign(:trend_data, fetch_rating_trend(30))
  end
end
```

### Dashboard Routes

| Route | View | Purpose |
|-------|------|---------|
| `/perimeter` | `PerimeterDashboardLive` | Overview with security rating, asset count, top findings |
| `/perimeter/assets` | `AssetInventoryLive` | Searchable, filterable asset inventory |
| `/perimeter/compliance` | `ComplianceAssessmentLive` | NIS2/ZKB compliance status and gap analysis |
| `/perimeter/easm` | `EASMDashboardLive` | Advanced EASM with discovery pipeline status |

## Application Architecture

```
PrismaticPerimeter.Application
+-- PrismaticPerimeter.Cache (ETS)
+-- PrismaticPerimeter.Discovery.Supervisor
|   +-- PrismaticPerimeter.DNS
|   +-- PrismaticPerimeter.CertTransparency
|   +-- PrismaticPerimeter.WHOIS
|   +-- PrismaticPerimeter.ServiceScanner
|   +-- PrismaticPerimeter.CloudDiscovery
+-- PrismaticPerimeter.Rating.Engine
+-- PrismaticPerimeter.Compliance.Assessor
+-- PrismaticPerimeter.Monitoring.Scheduler
+-- PrismaticPerimeter.Telemetry
```

## Platform Integration

Within the 115-app umbrella, prismatic_perimeter is a flagship application driving the security intelligence mission. It integrates with multiple platform components.

| Integration | Component | Purpose |
|------------|-----------|---------|
| **OSINT** | `prismatic_osint` | DNS, certificate, and WHOIS data sources |
| **Storage** | `prismatic_storage_ecto` | Persistent storage for assets and findings |
| **Web** | `prismatic_web` | LiveView dashboard rendering |
| **API** | `prismatic_api` | REST API endpoints for programmatic access |
| **Agents** | `prismatic_agents` | AIAD agents for automated scanning |
| **Compliance** | `prismatic_compliance` | Regulatory framework definitions |
| **Telemetry** | `prismatic_telemetry` | Metrics and monitoring |

## Usage Examples

```elixir
# Discover external attack surface
{:ok, surface} = PrismaticPerimeter.discover("example.com")
# => %{assets: [...], findings: [...], discovery_time_ms: 45_000}

# Get security rating
{:ok, rating} = PrismaticPerimeter.security_rating("example.com")
# => %{grade: :B, score: 780, industry_percentile: 72}

# Assess compliance
{:ok, assessment} = PrismaticPerimeter.assess_compliance("example.com", [:nis2, :zkb])
# => [%{framework: :nis2, overall_compliance: 0.82, gaps: [...]}, ...]

# Continuous monitoring
{:ok, _ref} = PrismaticPerimeter.schedule_monitoring("example.com", interval: :daily)

# Export compliance report
{:ok, report} = PrismaticPerimeter.export_report("example.com", :nis2, format: :pdf)
```

## Monitoring and Metrics

Prismatic Perimeter emits comprehensive Telemetry events for operational monitoring.

| Event | Description | Key Measurements |
|-------|-------------|-----------------|
| `[:perimeter, :discovery, :complete]` | Discovery pipeline finished | duration_ms, asset_count |
| `[:perimeter, :discovery, :phase_error]` | Individual phase failed | phase, reason |
| `[:perimeter, :rating, :calculated]` | Rating computed | grade, score, duration_ms |
| `[:perimeter, :compliance, :assessed]` | Compliance evaluated | framework, compliance_pct |
| `[:perimeter, :monitoring, :alert]` | Rating change detected | old_grade, new_grade, delta |

## Best Practices

1. **Discover before rating.** Always run a complete discovery before calculating security ratings. Ratings based on incomplete asset inventories produce misleadingly high scores because undiscovered vulnerabilities are not counted.

2. **Update assessments regularly.** External attack surfaces change continuously. Schedule automated re-discovery and re-rating at least weekly, with continuous monitoring for critical changes (certificate expiration, new service exposure).

3. **Correlate across data sources.** The most valuable findings come from correlating signals across multiple sources. A newly discovered subdomain combined with an expired certificate and an open database port tells a much more concerning story than any single finding alone.

4. **Use ratings for trend analysis, not absolute judgment.** A B rating does not mean an organization is secure; it means their external posture is better than organizations rated C-F. Track rating trends over time to measure improvement rather than relying on absolute scores.

5. **Map compliance gaps to remediation priorities.** Not all compliance gaps have equal risk. Prioritize remediation based on the risk score of associated findings rather than treating all controls equally.

6. **Verify critical findings manually.** Automated discovery can produce false positives, particularly in service fingerprinting and vulnerability correlation. Verify critical and high severity findings before escalating to stakeholders.

## Common Pitfalls

- **Incomplete asset discovery.** Organizations often have more external assets than they expect. Ensure discovery covers wildcard certificates, cloud resources, CDN endpoints, and third-party services that may expose organizational data.

- **False positives in vulnerability correlation.** Automated vulnerability correlation can produce false positives when service fingerprinting is imprecise. Verify critical findings manually before reporting to stakeholders.

- **Stale ratings from cached data.** Rating calculations should use the most recent discovery data. Stale cache entries can produce outdated ratings that do not reflect current security posture.

- **Compliance checkbox mentality.** Compliance assessment should identify genuine security improvements, not just produce passing scores. A control marked "compliant" based on minimal evidence may not represent actual security.

- **Ignoring rate limits on external services.** Discovery involves querying external services (DNS, certificate logs, Shodan). Respect rate limits to avoid being blocked and to maintain sustainable access.

## Related Concepts

- [EASM](/glossary/easm/) - Security discipline that Prismatic Perimeter implements
- [Security Rating](/glossary/security-rating/) - A-F grading system produced by the rating engine
- [NIS2](/glossary/nis2/) - EU cybersecurity directive assessed by the compliance module
- [ZKB](/glossary/zkb/) - Czech cybersecurity regulation assessed alongside NIS2
- [Attack Surface](/glossary/attack-surface/) - External exposure area that Prismatic Perimeter maps
- [OSINT](/glossary/osint/) - Intelligence discipline powering asset discovery
- [GenStatem](/glossary/gen-statem/) - State machine modelling the discovery pipeline
- [LiveView](/glossary/liveview/) - Real-time dashboard technology
- [Phoenix](/glossary/phoenix/) - Web framework hosting the Perimeter dashboard
- [Circuit Breaker](/glossary/circuit-breaker/) - Fault tolerance for external service dependencies

## See Also

- [Architecture](/architecture/) - Platform architecture overview
- [Technologies](/technologies/) - Technology stack details
- [Apps](/apps/) - Umbrella applications including Prismatic Perimeter
- [OSINT Tools](/osint/) - Intelligence tools powering discovery

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
