+++
title = "Building EASM Features"
weight = 10
[extra]
description = "External Attack Surface Management development with security ratings, compliance assessment, and asset discovery"
category = "advanced"
difficulty = "advanced"
duration = "65 min"
prerequisites = ["agent-orchestration", "storage-patterns", "liveview-dashboards"]
glossary_terms = ["easm", "aiad", "no-mercy", "nabla-infinity", "trinity-gate", "quality-dna"]
technologies = ["elixir", "phoenix-liveview", "postgresql", "ecto"]
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 803
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Building", "EASM", "Features", "External", "Attack", "Surface", "Management", "academy", "advanced", "Prismatic Platform"]
tags = ["academy", "advanced", "building-easm-features", "prismatic"]
quality_score = 80
see_also = ["glossary", "capabilities", "technologies"]
image = "/images/sections/academy.png"
image_alt = "Building EASM Features - Prismatic Platform"
+++

## Overview

Prismatic Perimeter is the platform's External Attack Surface Management ([EASM](/glossary/easm/)) module -- a system that discovers, monitors, and scores the security posture of organizations' internet-facing assets. It competes with commercial products like BitSight, Black Kite, and SecurityScorecard. This guide teaches you to build EASM features from asset discovery through security rating to compliance assessment.

You will learn:

- The EASM domain model: assets, findings, ratings, and compliance
- How to implement asset discovery for domains, IPs, and certificates
- Security rating calculation with evidence-based scoring (A-F grades, 300-900 numeric)
- NIS2 Directive and ZKB 264/2025 Sb. compliance assessment
- Building the LiveView dashboard at `/perimeter`

## Prerequisites

- Completed [Multi-Agent Orchestration Patterns](/academy/agent-orchestration/)
- Completed [Storage Architecture & Adapters](/academy/storage-patterns/)
- Completed [Building LiveView Dashboards](/academy/liveview-dashboards/)
- Understanding of network security concepts (DNS, TLS, HTTP headers)

## Core Concepts

### The EASM Pipeline

EASM follows a four-stage pipeline:

```
Discovery --> Enumeration --> Assessment --> Rating
   |              |               |            |
   v              v               v            v
 Domains     Subdomains      Findings     A-F Grade
 IP ranges   Open ports      Severity      300-900
 Seeds       Certificates    Evidence      Compliance
```

Each stage is implemented by specialized agents coordinated by an L2 orchestrator.

### Asset Types

The platform discovers and monitors these asset types:

| Asset Type | Discovery Method | Examples |
|------------|-----------------|----------|
| Domain | DNS enumeration, certificate transparency | example.com, api.example.com |
| IP Address | DNS resolution, range scanning | 93.184.216.34 |
| Certificate | CT log monitoring, TLS connection | Let's Encrypt cert for *.example.com |
| Cloud Resource | DNS CNAME analysis, header detection | s3.amazonaws.com, cloudfront.net |
| Service | Port scanning, banner grabbing | HTTPS/443, SMTP/25 |

### Security Rating Model

Ratings use a dual-scale system:

- **Letter Grade**: A through F (like academic grading)
- **Numeric Score**: 300-900 (like credit scores)

```
A: 850-900 (Excellent)   - No critical findings, strong configuration
B: 750-849 (Good)        - Minor issues, above industry average
C: 650-749 (Average)     - Some findings, at industry average
D: 500-649 (Below Avg)   - Significant issues requiring attention
F: 300-499 (Poor)        - Critical vulnerabilities, immediate action needed
```

## Step-by-Step Guide

### Step 1: Define the Domain Model

```elixir
defmodule PrismaticPerimeter.Schema.Asset do
  @moduledoc """
  Represents a discovered internet-facing asset.
  """

  use Ecto.Schema
  import Ecto.Changeset

  @type asset_type :: :domain | :ip_address | :certificate | :cloud_resource | :service

  schema "perimeter_assets" do
    field :organization_id, :string
    field :type, Ecto.Enum, values: [:domain, :ip_address, :certificate, :cloud_resource, :service]
    field :identifier, :string
    field :metadata, :map, default: %{}
    field :first_seen, :utc_datetime_usec
    field :last_seen, :utc_datetime_usec
    field :status, Ecto.Enum, values: [:active, :inactive, :decommissioned], default: :active

    has_many :findings, PrismaticPerimeter.Schema.Finding

    timestamps(type: :utc_datetime_usec)
  end

  @spec changeset(t(), map()) :: Ecto.Changeset.t()
  def changeset(asset, attrs) do
    asset
    |> cast(attrs, [:organization_id, :type, :identifier, :metadata, :first_seen, :last_seen, :status])
    |> validate_required([:organization_id, :type, :identifier])
    |> unique_constraint([:organization_id, :type, :identifier])
  end
end

defmodule PrismaticPerimeter.Schema.Finding do
  @moduledoc """
  A security finding associated with an asset.
  Each finding contributes to the security rating calculation.
  """

  use Ecto.Schema
  import Ecto.Changeset

  schema "perimeter_findings" do
    field :category, :string
    field :severity, Ecto.Enum, values: [:critical, :high, :medium, :low, :info]
    field :title, :string
    field :description, :string
    field :evidence, :map, default: %{}
    field :confidence, :float
    field :score_impact, :float
    field :remediation, :string
    field :resolved_at, :utc_datetime_usec

    belongs_to :asset, PrismaticPerimeter.Schema.Asset

    timestamps(type: :utc_datetime_usec)
  end

  @spec changeset(t(), map()) :: Ecto.Changeset.t()
  def changeset(finding, attrs) do
    finding
    |> cast(attrs, [:category, :severity, :title, :description, :evidence,
                     :confidence, :score_impact, :remediation, :asset_id])
    |> validate_required([:category, :severity, :title, :description, :asset_id])
    |> validate_number(:confidence, greater_than_or_equal_to: 0.0, less_than_or_equal_to: 1.0)
    |> validate_length(:description, min: 10)
  end
end
```

### Step 2: Implement Asset Discovery

```elixir
defmodule PrismaticPerimeter.Discovery do
  @moduledoc """
  Discovers internet-facing assets for a given domain through
  DNS enumeration, certificate transparency, and service detection.
  """

  alias PrismaticPerimeter.Schema.Asset

  @type discovery_result :: %{
          domain: String.t(),
          assets: [Asset.t()],
          duration_ms: non_neg_integer(),
          discovered_at: DateTime.t()
        }

  @spec discover(String.t()) :: {:ok, discovery_result()} | {:error, term()}
  def discover(domain) when is_binary(domain) do
    start_time = System.monotonic_time(:millisecond)

    with {:ok, normalized} <- normalize_domain(domain),
         {:ok, dns_assets} <- discover_dns(normalized),
         {:ok, cert_assets} <- discover_certificates(normalized),
         {:ok, service_assets} <- discover_services(dns_assets) do
      all_assets = dns_assets ++ cert_assets ++ service_assets
      duration = System.monotonic_time(:millisecond) - start_time

      result = %{
        domain: normalized,
        assets: all_assets,
        duration_ms: duration,
        discovered_at: DateTime.utc_now()
      }

      :telemetry.execute(
        [:prismatic_perimeter, :discovery, :complete],
        %{asset_count: length(all_assets), duration_ms: duration},
        %{domain: normalized}
      )

      {:ok, result}
    end
  end

  @spec normalize_domain(String.t()) :: {:ok, String.t()} | {:error, :invalid_domain}
  def normalize_domain(domain) do
    normalized =
      domain
      |> String.downcase()
      |> String.trim()
      |> String.replace(~r/^https?:\/\//, "")
      |> String.replace(~r/\/.*$/, "")

    if String.match?(normalized, ~r/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/) do
      {:ok, normalized}
    else
      {:error, :invalid_domain}
    end
  end

  defp discover_dns(domain) do
    # DNS enumeration: A, AAAA, MX, NS, CNAME records
    # In production, uses :inet_res module
    {:ok, [
      %{type: :domain, identifier: domain, metadata: %{record_type: "A"}},
      %{type: :domain, identifier: "www.#{domain}", metadata: %{record_type: "CNAME"}}
    ]}
  end

  defp discover_certificates(domain) do
    # Certificate Transparency log queries
    {:ok, [
      %{type: :certificate, identifier: "*.#{domain}", metadata: %{issuer: "Let's Encrypt"}}
    ]}
  end

  defp discover_services(dns_assets) do
    # Service detection on discovered hosts
    services = Enum.flat_map(dns_assets, fn asset ->
      [%{type: :service, identifier: "#{asset.identifier}:443", metadata: %{protocol: "HTTPS"}}]
    end)

    {:ok, services}
  end
end
```

### Step 3: Implement Security Rating

```elixir
defmodule PrismaticPerimeter.Rating do
  @moduledoc """
  Calculates security ratings from findings using evidence-based scoring.
  Produces both letter grades (A-F) and numeric scores (300-900).
  """

  alias PrismaticPerimeter.Schema.Finding

  @type rating :: %{
          grade: :A | :B | :C | :D | :F,
          score: non_neg_integer(),
          category_scores: map(),
          finding_count: non_neg_integer(),
          confidence: float(),
          assessed_at: DateTime.t()
        }

  @severity_weights %{critical: 100, high: 50, medium: 20, low: 5, info: 0}
  @base_score 900

  @spec calculate(String.t(), [Finding.t()]) :: {:ok, rating()}
  def calculate(domain, findings) do
    deductions = calculate_deductions(findings)
    raw_score = max(@base_score - deductions, 300)

    category_scores =
      findings
      |> Enum.group_by(& &1.category)
      |> Map.new(fn {category, cat_findings} ->
        cat_deduction = calculate_deductions(cat_findings)
        {category, max(100 - cat_deduction, 0)}
      end)

    rating = %{
      grade: score_to_grade(raw_score),
      score: raw_score,
      category_scores: category_scores,
      finding_count: length(findings),
      confidence: calculate_confidence(findings),
      assessed_at: DateTime.utc_now()
    }

    :telemetry.execute(
      [:prismatic_perimeter, :rating, :calculated],
      %{score: raw_score},
      %{domain: domain, grade: rating.grade}
    )

    {:ok, rating}
  end

  defp calculate_deductions(findings) do
    findings
    |> Enum.reject(fn f -> f.resolved_at != nil end)
    |> Enum.map(fn f ->
      weight = Map.get(@severity_weights, f.severity, 0)
      weight * f.confidence
    end)
    |> Enum.sum()
    |> round()
  end

  defp calculate_confidence(findings) do
    if findings == [] do
      0.0
    else
      findings
      |> Enum.map(& &1.confidence)
      |> then(fn confs -> Enum.sum(confs) / length(confs) end)
    end
  end

  defp score_to_grade(score) when score >= 850, do: :A
  defp score_to_grade(score) when score >= 750, do: :B
  defp score_to_grade(score) when score >= 650, do: :C
  defp score_to_grade(score) when score >= 500, do: :D
  defp score_to_grade(_score), do: :F
end
```

### Step 4: Compliance Assessment

```elixir
defmodule PrismaticPerimeter.Compliance do
  @moduledoc """
  Assesses compliance against regulatory frameworks:
  - NIS2 Directive (EU 2022/2555)
  - ZKB 264/2025 Sb. (Czech cybersecurity regulation)
  """

  @type compliance_result :: %{
          framework: :nis2 | :zkb,
          status: :compliant | :partially_compliant | :non_compliant,
          controls_passed: non_neg_integer(),
          controls_total: non_neg_integer(),
          gaps: [map()]
        }

  @spec assess(String.t(), [:nis2 | :zkb]) :: {:ok, [compliance_result()]}
  def assess(domain, frameworks) do
    results = Enum.map(frameworks, fn framework ->
      assess_framework(domain, framework)
    end)

    {:ok, results}
  end

  defp assess_framework(domain, :nis2) do
    controls = [
      {:risk_management, "Article 21(2)(a) - Risk analysis and security policies"},
      {:incident_handling, "Article 21(2)(b) - Incident handling"},
      {:business_continuity, "Article 21(2)(c) - Business continuity"},
      {:supply_chain, "Article 21(2)(d) - Supply chain security"},
      {:network_security, "Article 21(2)(e) - Network and information systems security"},
      {:vulnerability_disclosure, "Article 21(2)(f) - Vulnerability handling and disclosure"},
      {:effectiveness_assessment, "Article 21(2)(g) - Assessment of cybersecurity measures"},
      {:cryptography, "Article 21(2)(h) - Cryptography and encryption"},
      {:access_control, "Article 21(2)(i) - Access control policies"},
      {:asset_management, "Article 21(2)(j) - Asset management"}
    ]

    {passed, gaps} = evaluate_controls(domain, controls)

    %{
      framework: :nis2,
      status: compliance_status(passed, length(controls)),
      controls_passed: passed,
      controls_total: length(controls),
      gaps: gaps
    }
  end

  defp assess_framework(domain, :zkb) do
    controls = [
      {:cyber_risk_assessment, "Section 4 - Cyber risk assessment"},
      {:security_measures, "Section 5 - Security measures implementation"},
      {:incident_response, "Section 6 - Incident response capability"},
      {:reporting, "Section 7 - Reporting obligations"},
      {:audit_trail, "Section 8 - Audit trail maintenance"}
    ]

    {passed, gaps} = evaluate_controls(domain, controls)

    %{
      framework: :zkb,
      status: compliance_status(passed, length(controls)),
      controls_passed: passed,
      controls_total: length(controls),
      gaps: gaps
    }
  end

  defp evaluate_controls(_domain, controls) do
    # In production, each control is evaluated against discovered findings
    passed = length(controls) - 2  # Example: 2 gaps

    gaps =
      controls
      |> Enum.take(2)
      |> Enum.map(fn {control, description} ->
        %{control: control, description: description, severity: :medium}
      end)

    {passed, gaps}
  end

  defp compliance_status(passed, total) when passed == total, do: :compliant
  defp compliance_status(passed, total) when passed >= total * 0.7, do: :partially_compliant
  defp compliance_status(_passed, _total), do: :non_compliant
end
```

### Step 5: The Perimeter Dashboard

The LiveView dashboard ties everything together at `/perimeter`:

```elixir
defmodule PrismaticWeb.PerimeterLive do
  use PrismaticWeb, :live_view

  alias PrismaticPerimeter.{Discovery, Rating, Compliance}

  @impl true
  def mount(_params, _session, socket) do
    {:ok, assign(socket, domain: nil, rating: nil, compliance: nil, loading: false)}
  end

  @impl true
  def handle_event("assess", %{"domain" => domain}, socket) do
    socket = assign(socket, loading: true, domain: domain)
    send(self(), {:run_assessment, domain})
    {:noreply, socket}
  end

  @impl true
  def handle_info({:run_assessment, domain}, socket) do
    with {:ok, surface} <- Discovery.discover(domain),
         {:ok, rating} <- Rating.calculate(domain, surface.findings),
         {:ok, compliance} <- Compliance.assess(domain, [:nis2, :zkb]) do
      {:noreply, assign(socket, rating: rating, compliance: compliance, loading: false)}
    else
      {:error, reason} ->
        {:noreply, assign(socket, error: reason, loading: false)}
    end
  end
end
```

## Common Pitfalls

**Performing network scans without rate limiting.** Asset discovery involves DNS queries and connection attempts. Always implement rate limiting to avoid being blocked or flagged as malicious.

**Treating absence of findings as security.** A clean scan might mean the asset is secure, or it might mean the scanner is insufficient. Apply NABLA Axiom 3 (Absence Informative) and track what was not found.

**Hardcoding compliance requirements.** Regulatory frameworks evolve. Store control definitions in configuration or database, not in module code.

**Ignoring finding confidence.** A finding with 0.3 confidence should weight differently than one with 0.95. Always factor confidence into score calculations.

## Exercises

1. **Add a new finding category.** Implement HTTP header analysis (missing Content-Security-Policy, HSTS, etc.) as a new finding category with severity mappings.

2. **Implement industry percentile.** Add a percentile score that compares a domain's rating against all assessed domains in the database.

3. **Build a compliance report export.** Create a PDF or HTML export of the compliance assessment results suitable for sharing with auditors.

4. **Add trending.** Track rating changes over time and display a trend indicator (improving, stable, degrading) on the dashboard.

## Summary

EASM development in Prismatic follows the pipeline pattern: discover assets, enumerate their properties, assess security findings, and calculate ratings. The security rating model produces both letter grades and numeric scores from evidence-based findings. Compliance assessment maps findings against NIS2 and ZKB regulatory frameworks. The LiveView dashboard provides real-time visibility into an organization's external attack surface.

## Practical Implementation

### In Prismatic Platform

EASM is implemented across these applications:

- **prismatic_perimeter** (`apps/prismatic_perimeter/`) -- Core EASM engine with `PrismaticPerimeter.Discovery` (asset discovery), `PrismaticPerimeter.Rating` (A-F security ratings, 300-900 numeric scores), and `PrismaticPerimeter.Compliance` (NIS2 and ZKB compliance assessment). The public facade `PrismaticPerimeter` exposes `discover/1`, `security_rating/1`, and `assess_compliance/2`
- **prismatic_perimeter_core** (`apps/prismatic_perimeter_core/`) -- Shared types, schemas, and protocols for the perimeter subsystem. Contains `PrismaticPerimeter.Schema.Asset` and `PrismaticPerimeter.Schema.Finding` Ecto schemas
- **prismatic_perimeter_web** (`apps/prismatic_perimeter_web/`) -- LiveView dashboard components for the Perimeter UI at `/perimeter`, `/perimeter/assets`, `/perimeter/compliance`, and `/perimeter/easm`
- **prismatic_web** (`apps/prismatic_web/`) -- Routes EASM traffic through `scope "/perimeter"` to the appropriate LiveView modules
- **prismatic_compliance** (`apps/prismatic_compliance/`) -- Compliance framework engine supporting NIS2 Directive (EU 2022/2555) and ZKB 264/2025 Sb. (Czech cybersecurity regulation) control mapping

### Code Examples from the Codebase

The Perimeter facade exposes auto-discoverable API endpoints:

```elixir
# PrismaticPerimeter facade functions become REST API endpoints automatically
# GET /api/v1/perimeter/security_rating?domain=example.com
{:ok, rating} = PrismaticPerimeter.security_rating("example.com")
# => %{grade: :B, score: 780, industry_percentile: 72}

# POST /api/v1/perimeter/discover
{:ok, surface} = PrismaticPerimeter.discover("example.com")
# => %{assets: [...], duration_ms: 1500, discovered_at: ~U[...]}

# POST /api/v1/perimeter/assess_compliance
{:ok, assessment} = PrismaticPerimeter.assess_compliance("example.com", [:nis2, :zkb])
```

The Perimeter dashboard routes in `prismatic_web/lib/prismatic_web/router.ex`:

```elixir
scope "/perimeter", PrismaticWeb.Perimeter do
  live "/", DashboardLive, :index
  live "/assets", AssetsLive, :index
  live "/compliance", ComplianceLive, :index
  live "/easm", EasmLive, :index
end
```

## See Also

### Related Applications
- [prismatic_perimeter](/apps/prismatic-perimeter/) -- Core EASM engine
- [prismatic_perimeter_core](/apps/prismatic-perimeter-core/) -- Shared EASM types and schemas
- [prismatic_perimeter_web](/apps/prismatic-perimeter-web/) -- EASM LiveView dashboards
- [prismatic_compliance](/apps/prismatic-compliance/) -- NIS2 and ZKB compliance engine
- [prismatic_api](/apps/prismatic-api/) -- Auto-introspecting REST API exposing EASM endpoints

### Glossary
- [EASM](/glossary/easm/) -- External Attack Surface Management
- [Security Rating](/glossary/security-rating/) -- A-F grade with 300-900 numeric score
- [Attack Surface](/glossary/attack-surface/) -- Internet-facing assets of an organization
- [Certificate Transparency](/glossary/certificate-transparency/) -- CT log monitoring for certificate discovery
- [TLS](/glossary/tls/) -- Transport Layer Security assessment
- [Risk Score](/glossary/risk-score/) -- Evidence-based scoring with confidence levels
- [ZKB](/glossary/zkb/) -- Czech cybersecurity regulation 264/2025 Sb.
- [Vulnerability Assessment](/glossary/vulnerability-assessment/) -- Security finding evaluation

### Architecture
- [Storage Adapters](/architecture/storage-adapters/) -- PostgreSQL storage for findings and ratings
- [Phoenix LiveView](/architecture/phoenix-liveview/) -- Dashboard architecture for Perimeter UI

### Related Academy Topics
- [Color Team Security](/academy/color-team-security/) -- Adversarial testing of EASM features
- [API Integration](/academy/api-integration/) -- Exposing EASM features through REST API
- [Formal Verification](/academy/formal-verification-guide/) -- Proving rating calculations are correct
- [DD Investigation Techniques](/academy/dd-investigation/) -- Complementary due diligence capabilities

## Next Steps

- [Color Team Security Operations](/academy/color-team-security/) -- adversarial testing of EASM features
- [API Integration Guide](/academy/api-integration/) -- exposing EASM features through the REST API
- [Formal Verification with Lean4](/academy/formal-verification-guide/) -- proving rating calculations are correct

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)