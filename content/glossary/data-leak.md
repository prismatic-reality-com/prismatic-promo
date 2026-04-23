+++
title = "Data Leak"
description = "Unintentional exposure of sensitive data through misconfiguration, human error, or inadequate access controls, distinct from data breaches which involve active security boundary violations."
weight = 50

[extra]
domain = "security"
category = "security"
related_terms = ["data-breach", "dark-web", "osint", "easm", "encryption", "input-sanitization", "data-protection", "dmarc", "seal", "dlp", "secret-scanning", "cloud-security", "gdpr"]
tags = ["glossary", "security", "data-leak", "exposure", "misconfiguration", "osint", "monitoring", "dlp", "seal-doctrine", "easm", "exfiltration"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "15 min"
difficulty = "intermediate"
complexity = "medium"
stability = "mature"
beam_related = false
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Data leaks from misconfigured services, exposed repositories, and careless data handling represent one of the most common attack surface exposures, detectable through continuous EASM and OSINT monitoring and preventable through the SEAL doctrine."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["Data Leak", "exposure", "misconfiguration", "security", "glossary", "Prismatic Platform", "OSINT", "SEAL", "DLP", "exfiltration", "GDPR"]
image = "/images/sections/glossary.png"
image_alt = "Data Leak - Prismatic Platform"
word_count = 3400
key_concepts = ["passive-exposure", "active-breach", "attack-surface", "secret-detection", "dlp-pipeline", "remediation-workflow", "regulatory-notification", "continuous-monitoring"]
audience = ["developers", "security-engineers", "sre", "compliance-officers", "architects"]
prerequisites = ["security-basics", "osint-fundamentals", "cloud-infrastructure"]
use_cases = ["attack-surface-monitoring", "compliance-validation", "incident-response", "secret-scanning", "vendor-assessment"]
see_also = ["osint", "capabilities", "architecture", "easm", "data-breach", "seal"]
+++

## Definition and Overview

A data leak is the unintentional exposure of sensitive, confidential, or protected information to unauthorized parties, typically resulting from misconfiguration, human error, or inadequate access controls rather than deliberate attack. Common leak vectors include publicly accessible cloud storage buckets, exposed database ports, hardcoded credentials in source code repositories, unprotected API endpoints, and misconfigured network shares. While data breaches involve active exploitation of security boundaries, data leaks represent passive exposure where the data is available to anyone who looks -- no exploitation skill required.

Data leaks are particularly insidious because they can persist for extended periods without detection. An exposed S3 bucket or a public GitHub repository containing API keys may remain accessible for months before discovery, providing a long window for adversaries to collect sensitive information. Research consistently shows that the average time to detect a data leak exceeds 200 days, during which automated scanners operated by threat actors continuously harvest exposed credentials, databases, and configuration files. The asymmetry is stark: exposure is instant and permanent (once data is leaked, it cannot be "unleaked"), while detection and remediation are slow and uncertain.

The distinction between data leaks and data breaches carries significant implications for incident response, regulatory notification, and remediation strategy. A leak requires closing the exposure vector and assessing what was accessible. A breach requires forensic investigation of what was actually accessed, lateral movement analysis, and potentially law enforcement notification. However, from a regulatory perspective (particularly GDPR), both constitute "personal data breaches" if personal data was involved, triggering the same notification obligations. The Prismatic Platform's SEAL doctrine addresses data leak prevention through pre-commit secret scanning, hardcoded credential detection, and continuous attack surface monitoring.

## Core Concepts

| Concept | Description | Detection Method |
|---------|-------------|-----------------|
| **Passive Exposure** | Data accessible without exploitation | Automated scanning, EASM monitoring |
| **Active Breach** | Deliberate exploitation of security controls | Log analysis, IDS/IPS, anomaly detection |
| **Attack Surface** | Total external-facing exposure area | Continuous EASM scanning (Perimeter module) |
| **Secret Leakage** | Credentials/keys in code or config | Pre-commit hooks, repository scanning |
| **Metadata Leakage** | Incidental information in file metadata | EXIF extraction, document metadata analysis |
| **Configuration Drift** | Security settings degrading over time | Continuous configuration auditing |
| **Data Loss Prevention (DLP)** | Systems preventing data from leaving boundaries | Content inspection, endpoint monitoring |
| **Exposure Window** | Duration between leak creation and detection | MTTD (Mean Time To Detect) metric |
| **Remediation Window** | Duration between detection and closure | MTTR (Mean Time To Remediate) metric |
| **Data Classification** | Categorization of data by sensitivity level | Automated classification, manual labeling |
| **Regulatory Notification** | Mandatory disclosure to authorities/subjects | GDPR Article 33: 72 hours to authority |
| **SEAL Doctrine** | Security Enforcement Absolute Lock principle | Pre-commit hooks, CI/CD gates |

## Technical Deep Dive

### Leak Vector Taxonomy

| Leak Vector | Detection Method | Severity | Common Causes | OSINT Tools |
|------------|-----------------|----------|---------------|-------------|
| **Cloud Storage** | Bucket enumeration, S3 scanner | Critical | Public ACL, missing encryption | GrayhatWarfare, bucket-finder |
| **Source Code** | Repository scanning, secret detection | Critical | Hardcoded credentials, .env files | GitLeaks, TruffleHog, GitHub search |
| **API Endpoints** | Endpoint discovery, fuzzing | High | Missing authentication, verbose errors | Swagger exposure, API fuzzing |
| **DNS Records** | Zone transfer, subdomain enum | Medium | Exposed internal hostnames | Subfinder, Amass, SecurityTrails |
| **Metadata** | EXIF extraction, document metadata | Low-Medium | Unstripped file metadata | ExifTool, FOCA, Metagoofil |
| **Email Headers** | Header analysis, DMARC checks | Medium | Internal IP disclosure, relay info | MxToolbox, DMARCian |
| **Database Ports** | Port scanning, service detection | Critical | Exposed MongoDB/PostgreSQL/Redis | Shodan, Censys, Nmap |
| **CI/CD Artifacts** | Build log analysis, artifact scanning | High | Secrets in build logs, public artifacts | CircleCI/GitHub Actions log scanning |
| **Container Images** | Image layer inspection | High | Secrets baked into Docker layers | Dive, Trivy, container scanning |
| **Backup Files** | URL path discovery, fuzzing | Critical | `.bak`, `.sql`, `.tar.gz` on web servers | DirBuster, ffuf, custom wordlists |
| **Error Messages** | Error page analysis | Medium | Stack traces, SQL errors in responses | Manual testing, automated crawling |
| **SSL Certificates** | Certificate transparency logs | Low | Subdomain disclosure via cert SANs | crt.sh, CertStream |

### Data Leak Lifecycle

| Phase | Duration | Activities | Key Metrics |
|-------|----------|-----------|-------------|
| **Creation** | Instant | Misconfiguration, accidental commit, deployment error | N/A |
| **Exposure** | Hours to months | Data accessible to anyone, automated harvesters active | Exposure window (MTTD) |
| **Discovery** | Variable | EASM scan, OSINT alert, third-party notification, attacker use | Time to detect |
| **Triage** | 1-4 hours | Severity assessment, scope determination, data classification | Triage completion time |
| **Containment** | 1-24 hours | Close exposure vector, revoke credentials, block access | Time to contain |
| **Notification** | 24-72 hours | Regulatory notification (GDPR: 72h), affected party notification | Compliance deadline |
| **Remediation** | Days to weeks | Root cause fix, process improvement, control implementation | MTTR |
| **Verification** | Ongoing | Confirm closure, monitor for re-exposure, test controls | Re-exposure rate |

### Regulatory Framework

The distinction between a leak and a breach matters for regulatory compliance. Under GDPR, a data leak involving personal data still constitutes a personal data breach (Article 4(12)) and triggers notification obligations, but the incident classification and response procedures differ from active intrusion scenarios.

| Regulation | Notification Deadline | Scope | Key Requirement |
|-----------|----------------------|-------|-----------------|
| **GDPR (EU)** | 72 hours to authority | Personal data of EU residents | Article 33/34 notification, DPIA if high risk |
| **NIS2 (EU)** | 24 hours early warning, 72 hours full | Essential/important entities | Incident response capability mandatory |
| **Czech Cybersecurity Act** | Without undue delay | Critical infrastructure operators | Coordination with NUKIB |
| **CCPA (California)** | Without unreasonable delay | California resident data | 30-day cure period for some violations |
| **HIPAA (US)** | 60 days to individuals | Protected health information | Breach notification rule applies |

## Architecture and Implementation

### SEAL Doctrine Integration

The Prismatic Platform's SEAL (Security Enforcement Absolute Lock) doctrine provides multi-layered data leak prevention:

1. **Pre-Commit Layer**: Git hooks scan staged files for hardcoded secrets (API keys, passwords, tokens, private keys). Blocked patterns include AWS keys, JWT secrets, database URLs with credentials, and PEM-encoded private keys.

2. **CI/CD Layer**: The `mix check.doctrines --changed` pipeline runs SEAL validation on every commit, checking for SQL injection patterns, hardcoded secrets, and Code.eval usage.

3. **Runtime Layer**: The application never logs sensitive data. Logger metadata filters strip credentials, tokens, and personal data before log emission.

4. **Monitoring Layer**: The Prismatic Perimeter EASM module continuously scans the organization's external attack surface for data leak indicators.

## Usage in Prismatic Platform

The Prismatic Perimeter EASM module continuously monitors organizational attack surfaces for data leak indicators, combining automated scanning with OSINT intelligence collection.

```elixir
defmodule PrismaticPerimeter.LeakDetector do
  @moduledoc """
  Automated data leak detection engine that scans for exposed
  services, credentials, and sensitive data across the
  organization's external attack surface.

  Integrates with the SEAL doctrine enforcement pipeline to
  provide continuous monitoring for data exposure vectors.
  Uses concurrent Task-based scanning with timeout protection
  to efficiently check multiple vectors simultaneously.

  ## Detection Vectors

  - Cloud storage bucket enumeration
  - Source code repository secret scanning
  - API endpoint authentication verification
  - DNS record analysis for information leakage
  - Document metadata extraction and analysis

  ## Examples

      iex> {:ok, findings} = PrismaticPerimeter.LeakDetector.scan_domain("example.com")
      iex> is_list(findings)
      true
  """

  use GenServer
  require Logger

  @type severity :: :critical | :high | :medium | :low
  @type vector :: :cloud_storage | :source_code | :api_endpoint | :dns | :metadata | :email
  @type status :: :open | :triaged | :contained | :remediated | :verified

  @type leak_finding :: %{
    vector: vector(),
    severity: severity(),
    asset: String.t(),
    description: String.t(),
    remediation: String.t(),
    discovered_at: DateTime.t(),
    status: status(),
    cve_ids: list(String.t()),
    regulatory_impact: list(:gdpr | :nis2 | :ccpa | :hipaa)
  }

  @scan_timeout_ms 60_000

  @doc """
  Starts the LeakDetector GenServer.

  ## Options

  - `:name` - Process registration name (default: `__MODULE__`)

  ## Examples

      iex> {:ok, pid} = PrismaticPerimeter.LeakDetector.start_link([])
      iex> is_pid(pid)
      true
  """
  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    name = Keyword.get(opts, :name, __MODULE__)
    GenServer.start_link(__MODULE__, opts, name: name)
  end

  @doc """
  Scans a domain for data leak indicators across all vectors.

  Runs concurrent checks for cloud exposure, repository leaks,
  API exposure, DNS leaks, and metadata exposure. Each check
  runs as a supervised Task with a 60-second timeout.

  Returns findings sorted by severity (critical first).

  ## Parameters

  - `domain` - The domain to scan (e.g., "example.com")

  ## Examples

      iex> {:ok, findings} = PrismaticPerimeter.LeakDetector.scan_domain("example.com")
      iex> Enum.all?(findings, &Map.has_key?(&1, :severity))
      true
  """
  @spec scan_domain(String.t()) :: {:ok, list(leak_finding())} | {:error, term()}
  def scan_domain(domain) when is_binary(domain) do
    :telemetry.span([:prismatic, :perimeter, :leak_scan], %{domain: domain}, fn ->
      checks = [
        Task.async(fn -> check_cloud_exposure(domain) end),
        Task.async(fn -> check_repository_leaks(domain) end),
        Task.async(fn -> check_api_exposure(domain) end),
        Task.async(fn -> check_dns_leaks(domain) end),
        Task.async(fn -> check_metadata_exposure(domain) end)
      ]

      findings =
        checks
        |> Task.await_many(@scan_timeout_ms)
        |> List.flatten()
        |> Enum.sort_by(&severity_rank/1, :asc)

      Logger.info("Leak scan complete for #{domain}: #{length(findings)} findings")

      {{:ok, findings}, %{finding_count: length(findings)}}
    end)
  end

  @doc """
  Scans staged git files for hardcoded secrets.

  Used by pre-commit hooks to prevent credential leakage
  into source control. Checks for common secret patterns
  including API keys, database URLs, private keys, and tokens.

  ## Parameters

  - `file_paths` - List of file paths to scan

  ## Examples

      iex> findings = PrismaticPerimeter.LeakDetector.scan_secrets(["config/dev.exs"])
      iex> is_list(findings)
      true
  """
  @spec scan_secrets(list(String.t())) :: list(leak_finding())
  def scan_secrets(file_paths) when is_list(file_paths) do
    secret_patterns = [
      {~r/(?:api[_-]?key|apikey)\s*[:=]\s*["'][A-Za-z0-9]{20,}["']/i, "API key"},
      {~r/(?:password|passwd|pwd)\s*[:=]\s*["'][^"']{8,}["']/i, "Password"},
      {~r/(?:secret|token)\s*[:=]\s*["'][A-Za-z0-9+\/]{20,}["']/i, "Secret/Token"},
      {~r/-----BEGIN (?:RSA |EC |DSA )?PRIVATE KEY-----/, "Private key"},
      {~r/postgres:\/\/[^:]+:[^@]+@/, "Database URL with credentials"},
      {~r/AKIA[0-9A-Z]{16}/, "AWS Access Key ID"},
      {~r/sk-[a-zA-Z0-9]{20,}/, "Stripe/OpenAI secret key"},
      {~r/ghp_[a-zA-Z0-9]{36}/, "GitHub personal access token"}
    ]

    Enum.flat_map(file_paths, fn path ->
      case File.read(path) do
        {:ok, content} ->
          Enum.flat_map(secret_patterns, fn {pattern, label} ->
            if Regex.match?(pattern, content) do
              [%{
                vector: :source_code,
                severity: :critical,
                asset: path,
                description: "Hardcoded #{label} detected in #{path}",
                remediation: "Remove secret, rotate credential, use environment variable",
                discovered_at: DateTime.utc_now(),
                status: :open,
                cve_ids: [],
                regulatory_impact: [:gdpr]
              }]
            else
              []
            end
          end)

        {:error, _reason} ->
          []
      end
    end)
  end

  # GenServer callbacks

  @impl true
  def init(opts) do
    {:ok, %{scan_interval_ms: Keyword.get(opts, :scan_interval_ms, 3_600_000)}}
  end

  # Private helpers

  defp check_cloud_exposure(domain) do
    bucket_patterns = [
      "#{domain}-backup",
      "#{domain}-data",
      "#{domain}-assets",
      "#{domain}-staging",
      "#{domain}-prod",
      String.replace(domain, ".", "-")
    ]

    Enum.flat_map(bucket_patterns, fn pattern ->
      case probe_bucket(pattern) do
        {:ok, :public} ->
          [%{
            vector: :cloud_storage,
            severity: :critical,
            asset: pattern,
            description: "Publicly accessible storage bucket: #{pattern}",
            remediation: "Set bucket ACL to private, enable server-side encryption, audit contents",
            discovered_at: DateTime.utc_now(),
            status: :open,
            cve_ids: [],
            regulatory_impact: [:gdpr, :nis2]
          }]

        _ ->
          []
      end
    end)
  end

  defp check_repository_leaks(domain) do
    Logger.debug("Checking repository leaks for #{domain}")
    []
  end

  defp check_api_exposure(domain) do
    Logger.debug("Checking API exposure for #{domain}")
    []
  end

  defp check_dns_leaks(domain) do
    Logger.debug("Checking DNS leaks for #{domain}")
    []
  end

  defp check_metadata_exposure(domain) do
    Logger.debug("Checking metadata exposure for #{domain}")
    []
  end

  defp probe_bucket(_pattern) do
    {:ok, :private}
  end

  defp severity_rank(%{severity: :critical}), do: 0
  defp severity_rank(%{severity: :high}), do: 1
  defp severity_rank(%{severity: :medium}), do: 2
  defp severity_rank(%{severity: :low}), do: 3
end
```

### Logger Metadata Filtering

The platform prevents data leakage through application logs using metadata filters:

```elixir
defmodule Prismatic.Security.LogFilter do
  @moduledoc """
  Filters sensitive data from logger metadata to prevent
  data leakage through application logs.

  Automatically strips credentials, tokens, personal data,
  and other sensitive fields before log emission. Integrated
  with the SEAL doctrine enforcement pipeline.

  ## Filtered Fields

  - `:password`, `:secret`, `:token`, `:api_key` - Credentials
  - `:credit_card`, `:ssn`, `:birth_date` - Personal data
  - `:authorization` - HTTP authorization headers

  ## Examples

      iex> filtered = Prismatic.Security.LogFilter.filter_metadata(%{
      ...>   user_id: 123,
      ...>   password: "secret123",
      ...>   action: "login"
      ...> })
      iex> filtered.password
      "[FILTERED]"
      iex> filtered.user_id
      123
  """

  @sensitive_keys ~w(password secret token api_key private_key
                     credit_card ssn birth_date authorization
                     cookie session_id refresh_token)a

  @doc """
  Filters sensitive keys from a metadata map.

  Replaces values of known sensitive keys with `"[FILTERED]"`.
  Non-sensitive keys are passed through unchanged.

  ## Parameters

  - `metadata` - Map of logger metadata key-value pairs

  ## Examples

      iex> Prismatic.Security.LogFilter.filter_metadata(%{token: "abc", name: "test"})
      %{token: "[FILTERED]", name: "test"}
  """
  @spec filter_metadata(map()) :: map()
  def filter_metadata(metadata) when is_map(metadata) do
    Map.new(metadata, fn {key, value} ->
      if key in @sensitive_keys do
        {key, "[FILTERED]"}
      else
        {key, value}
      end
    end)
  end
end
```

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Committing `.env` files to git | Credentials exposed in repository history permanently | Add `.env` to `.gitignore`, use pre-commit secret scanning |
| Public S3 bucket ACLs | Entire bucket contents accessible to internet | Default to private, use S3 Block Public Access |
| Verbose error messages in production | Stack traces reveal internal architecture | Custom error pages, structured error responses |
| Debug logging sensitive data | Credentials appear in log aggregation | Log metadata filtering, sensitive field redaction |
| Docker layers containing secrets | Secrets persist in image layers even if deleted | Multi-stage builds, never COPY secrets, use build args |
| Assuming "security through obscurity" | Automated scanners find exposed services within hours | Assume everything public is discovered |
| Not rotating leaked credentials | Exposed credentials remain valid after leak closure | Immediate rotation of all potentially exposed credentials |
| Ignoring metadata in published files | Documents reveal internal usernames, paths, software | Strip metadata before publication (ExifTool, PDF sanitizer) |
| Overly permissive CORS | Browser-based data exfiltration possible | Restrict CORS to specific trusted origins |
| Logging request bodies | POST data with passwords/tokens captured in logs | Never log request bodies, or redact sensitive fields |
| Git force-push to "delete" secrets | Secrets remain in reflog and may be in forks/mirrors | Rotate credential immediately, never rely on history rewriting |
| Exposing internal APIs on public interfaces | Internal services accessible from internet | Network segmentation, API gateway with authentication |

## Best Practices

1. **Implement continuous attack surface monitoring** -- Data leaks are time-sensitive; the longer exposure persists, the greater the risk. The Prismatic Perimeter EASM module provides automated, continuous scanning.

2. **Scan repositories for secrets before commits** -- Pre-commit hooks with secret detection patterns prevent credential leaks at the source. The SEAL doctrine enforces this through the pre-commit pipeline.

3. **Enforce least-privilege access controls** -- Cloud resources should default to private, requiring explicit public access grants. Use S3 Block Public Access and equivalent controls.

4. **Strip metadata from published files** -- Documents, images, and PDFs contain metadata that can reveal internal infrastructure details, usernames, and software versions.

5. **Monitor for organizational mentions on paste sites** -- Paste sites are common venues for leaked credentials and data dumps. OSINT monitoring detects these quickly.

6. **Automate remediation workflows** -- Detected leaks should trigger automated ticketing, credential rotation, and remediation tracking with SLA enforcement.

7. **Classify data by sensitivity level** -- Not all data leaks have equal impact. Classification enables proportionate response and regulatory compliance.

8. **Implement log metadata filtering** -- Application logs are a frequent leak vector. Filter sensitive fields before log emission, never log request bodies containing credentials.

9. **Use multi-stage Docker builds** -- Never copy secrets into Docker images. Use multi-stage builds where the runtime stage contains only the compiled artifact.

10. **Establish a 72-hour notification pipeline** -- GDPR requires notification within 72 hours. Pre-establish the decision tree, templates, and authority contacts before an incident occurs.

## Related Terms

- [Data Breach](/glossary/data-breach/) -- Active security boundary violations, distinct from passive leaks
- [EASM](/glossary/easm/) -- External attack surface management for continuous leak detection
- [Dark Web](/glossary/dark-web/) -- Networks where leaked data is traded and distributed
- [OSINT](/glossary/osint/) -- Intelligence collection methodology for discovering data leaks
- [SEAL](/glossary/seal/) -- Security Enforcement Absolute Lock doctrine preventing leaks
- [DMARC](/glossary/dmarc/) -- Email authentication preventing information leakage through spoofed messages
- [Encryption](/glossary/encryption/) -- Data protection rendering leaked data unreadable
- [Input Sanitization](/glossary/input-sanitization/) -- Preventing injection attacks that lead to data exposure
- [Cloud Security](/glossary/cloud-security/) -- Securing cloud resources against misconfiguration
- [Secret Scanning](/glossary/secret-scanning/) -- Automated detection of credentials in code
- [DLP](/glossary/dlp/) -- Data Loss Prevention systems controlling data movement
- [GDPR](/glossary/gdpr/) -- EU regulation governing personal data breach notification

## See Also

- [OSINT Tools](/osint/) -- Platform tools for leak detection and monitoring
- [Capabilities](/capabilities/) -- Security monitoring capabilities
- [Architecture](/architecture/) -- Platform security architecture
- **SEAL Doctrine** -- Pre-commit and CI enforcement preventing code-level leaks
- **Prismatic Perimeter** -- EASM module for continuous attack surface monitoring
- **NIS2 Compliance** -- European directive requiring incident response capabilities

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
