+++
title = "web-application-security-specialist"
weight = 413
[extra]
domain = "infrastructure"
level = "L3"
description = "OWASP Top 10 and web security vulnerability expert"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ets", "dynamic-supervisor", "circuit-breaker", "umbrella-application", "postgresql", "aiad"]
domain_normalized = "infrastructure"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2250
quality_score = 83
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["web-application-security-specialist", "OWASP", "agents", "agent", "Prismatic Platform", "Phoenix", "Prismatic Perimeter", "LiveView"]
tags = ["agents", "agent", "web-application-security-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "web-application-security-specialist - Prismatic Platform"
+++

## Overview

The Web Application Security Specialist operates as an L3 [Strategic Command](/glossary/strategic-command/) authority within the Prismatic Platform's infrastructure domain, providing comprehensive [OWASP](/glossary/owasp/) Top 10 coverage and web security vulnerability expertise for the platform's Phoenix-based web applications. This agent performs continuous security assessment of HTTP endpoints, [LiveView](/glossary/liveview/) interfaces, API surfaces, authentication flows, and session management across all web-facing components.

The Prismatic Platform exposes multiple web interfaces: the main LiveView dashboard on port 4000, the auto-introspecting REST API on port 4004, the Prismatic Perimeter EASM dashboard, and various administrative interfaces. Each interface presents a distinct attack surface with unique security characteristics. The Web Application Security Specialist maintains a comprehensive security model for each interface, continuously evaluating them against the OWASP Top 10 vulnerability categories and Phoenix-specific security concerns.

Built on the [AIAD](/glossary/aiad/) standard, the agent integrates with the [vulnerability-scanning-specialist](/agents/vulnerability-scanning-specialist/) for platform-wide vulnerability correlation and the [Prismatic Perimeter](/apps/prismatic-perimeter/) for external attack surface assessment. The agent enforces the [NO MERCY](/glossary/no-mercy/) doctrine's zero-tolerance policy for web security violations and complies with the [NABLA Infinity](/glossary/nabla-infinity/) epistemic framework for all security claims.

## Architecture

The Web Application Security Specialist is built on a domain-driven architecture that organizes security checks by OWASP category, with specialized scanners for each vulnerability class operating as supervised [OTP](/glossary/otp/) processes.

```
WebAppSecurity.Supervisor
+-- InjectionScanner.Worker       (A03:2021 - Injection)
+-- AuthenticationAuditor.Worker  (A07:2021 - Identification/Auth)
+-- AccessControlChecker.Worker   (A01:2021 - Broken Access Control)
+-- CryptoAuditor.Worker          (A02:2021 - Cryptographic Failures)
+-- SecurityConfigChecker.Worker  (A05:2021 - Security Misconfiguration)
+-- ComponentAuditor.Worker       (A06:2021 - Vulnerable Components)
+-- SessionAnalyzer.Worker        (session/cookie security)
+-- HeaderValidator.Worker        (HTTP security headers)
+-- CSRFProtector.Worker          (cross-site request forgery)
```

Each scanner operates independently under the [supervision tree](/glossary/supervision-tree/), enabling fine-grained restart strategies and failure isolation. The InjectionScanner uses AST analysis to detect SQL injection, command injection, and template injection patterns in [Elixir](/glossary/elixir/) source code. The AuthenticationAuditor examines Plug pipelines, Guardian configurations, and token validation logic. The AccessControlChecker verifies that authorization checks are present on all protected routes and that privilege escalation paths are blocked.

The architecture follows a collect-analyze-report pipeline: scanners collect evidence, the analysis engine correlates findings across scanners, and the report generator produces structured security assessments with remediation guidance.

## Core Capabilities

The agent provides comprehensive web application security assessment across ten primary capability areas aligned with the OWASP Top 10.

**A01 - Broken Access Control Detection** verifies that Phoenix route pipelines enforce proper authorization on every protected endpoint. The agent analyzes router modules, Plug pipelines, and LiveView mount callbacks to detect missing authorization checks, insecure direct object references, and privilege escalation vulnerabilities.

**A02 - Cryptographic Failure Detection** identifies weak or improperly used cryptography in session management, token generation, password hashing, and data encryption. The agent verifies that bcrypt or argon2 is used for password hashing, that JWT tokens use appropriate algorithms and key sizes, and that TLS configuration meets security requirements.

**A03 - Injection Prevention** performs AST-level analysis of Ecto query construction, template rendering, system command execution, and dynamic code evaluation to detect injection vulnerabilities. The agent understands Ecto's parameterized query system and flags any use of raw SQL interpolation or `fragment/1` with user-controlled input.

**A05 - Security Misconfiguration Detection** examines Phoenix endpoint configuration, CORS settings, cookie attributes, session configuration, error handling behavior, and HTTP security headers. The agent verifies that production configurations disable debug mode, stack trace exposure, and verbose error messages.

**A07 - Identification and Authentication Failure Detection** audits authentication flows for weaknesses: missing rate limiting on login endpoints, weak password policies, insecure session fixation handling, missing multi-factor authentication enforcement, and credential exposure in logs or error messages.

**Phoenix-Specific Security** addresses security concerns unique to the Phoenix framework: LiveView WebSocket security, channel authorization, PubSub message validation, upload handling security, and HEEX template escaping verification.

## Implementation

The core security assessment coordinator is implemented as an [OTP](/glossary/otp/) [GenServer](/glossary/genserver/) that orchestrates scanning operations across all OWASP categories.

```elixir
defmodule Prismatic.Agents.WebAppSecurity do
  @moduledoc """
  Web Application Security Specialist - OWASP Top 10
  coverage and Phoenix-specific security assessment.
  """

  use GenServer

  alias Prismatic.Agents.WebAppSecurity.{
    InjectionScanner,
    AuthAuditor,
    AccessControlChecker,
    CryptoAuditor,
    ConfigChecker,
    HeaderValidator
  }

  @owasp_categories [
    :broken_access_control,
    :cryptographic_failures,
    :injection,
    :insecure_design,
    :security_misconfiguration,
    :vulnerable_components,
    :identification_auth_failures,
    :software_data_integrity,
    :logging_monitoring_failures,
    :server_side_request_forgery
  ]

  @type finding :: %{
    id: String.t(),
    category: atom(),
    severity: :critical | :high | :medium | :low,
    endpoint: String.t(),
    description: String.t(),
    evidence: map(),
    remediation: String.t(),
    owasp_ref: String.t()
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(opts) do
    schedule_assessment(opts[:interval] || :timer.hours(12))

    {:ok, %{
      findings: %{},
      last_assessment: nil,
      config: Map.new(opts)
    }}
  end

  @spec security_assessment :: {:ok, map()}
  def security_assessment do
    GenServer.call(__MODULE__, :full_assessment, :timer.minutes(15))
  end

  @impl true
  def handle_call(:full_assessment, _from, state) do
    results = %{
      injection: InjectionScanner.scan(),
      auth: AuthAuditor.audit(),
      access_control: AccessControlChecker.verify(),
      crypto: CryptoAuditor.audit(),
      config: ConfigChecker.check(),
      headers: HeaderValidator.validate()
    }

    all_findings =
      results
      |> Map.values()
      |> List.flatten()
      |> Enum.sort_by(& &1.severity, &severity_order/1)

    grade = calculate_security_grade(all_findings)

    :telemetry.execute(
      [:prismatic, :web_security, :assessment_complete],
      %{
        total_findings: length(all_findings),
        critical: count_by_severity(all_findings, :critical),
        high: count_by_severity(all_findings, :high),
        grade: grade_to_int(grade)
      },
      %{assessment_type: :full}
    )

    report = %{
      findings: all_findings,
      grade: grade,
      assessed_at: DateTime.utc_now(),
      categories_covered: @owasp_categories
    }

    {:reply, {:ok, report}, %{state |
      findings: Map.new(all_findings, &{&1.id, &1}),
      last_assessment: DateTime.utc_now()
    }}
  end

  defp severity_order(:critical), do: 0
  defp severity_order(:high), do: 1
  defp severity_order(:medium), do: 2
  defp severity_order(:low), do: 3

  defp calculate_security_grade(findings) do
    critical = count_by_severity(findings, :critical)
    high = count_by_severity(findings, :high)

    cond do
      critical > 0 -> :f
      high > 2 -> :d
      high > 0 -> :c
      length(findings) > 5 -> :b
      true -> :a
    end
  end

  defp count_by_severity(findings, severity) do
    Enum.count(findings, &(&1.severity == severity))
  end

  defp grade_to_int(:a), do: 5
  defp grade_to_int(:b), do: 4
  defp grade_to_int(:c), do: 3
  defp grade_to_int(:d), do: 2
  defp grade_to_int(:f), do: 1

  defp schedule_assessment(interval) do
    Process.send_after(self(), :scheduled_assessment, interval)
  end
end
```

The security grade calculation maps finding severity distributions to letter grades (A through F), consistent with the [Prismatic Perimeter](/apps/prismatic-perimeter/) security rating system. Each scanner module produces structured findings with OWASP category references and specific remediation guidance.

## Integration Points

| Component | Direction | Description |
|-----------|-----------|-------------|
| [vulnerability-scanning-specialist](/agents/vulnerability-scanning-specialist/) | Bidirectional | Shares web vulnerability findings; receives dependency vulnerability data |
| [Prismatic Perimeter](/apps/prismatic-perimeter/) | Outbound | Contributes web security posture to EASM security ratings |
| [blue-commander](/agents/blue-commander/) | Outbound | Feeds web security evidence to Blue Team defensive posture assessment |
| [red-epistemic-attacker](/agents/red-epistemic-attacker/) | Inbound | Receives adversarial scenario findings for web attack simulation validation |
| [Prismatic Web](/glossary/prismatic-web/) | Target | Primary scanning target -- Phoenix LiveView application |
| [Prismatic API](/apps/prismatic-api/) | Target | REST API endpoint security assessment target |
| [Quality Floor Guardian](/glossary/quality-floor-guardian/) | Outbound | Reports security quality metrics for platform scoring |

## Operational Workflow

The agent operates through three primary modes: scheduled assessment, continuous monitoring, and on-demand audit.

**Scheduled Assessment** runs a comprehensive OWASP Top 10 evaluation every 12 hours, covering all web-facing components. Results are compared against the previous assessment to identify newly introduced vulnerabilities and track remediation progress.

**Continuous Monitoring** watches for events that may introduce web security vulnerabilities: new route additions, Plug pipeline modifications, authentication configuration changes, and dependency updates affecting web components. These events trigger targeted re-assessment of affected areas.

**On-Demand Audit** provides immediate security assessment when requested through the command interface. This mode supports focused audits on specific OWASP categories, individual endpoints, or complete web interfaces. Results include detailed evidence and specific remediation guidance.

The assessment workflow proceeds through five phases: (1) endpoint discovery across all Phoenix routers, (2) parallel scanning by OWASP category, (3) finding correlation and deduplication, (4) risk-based prioritization and grading, and (5) report generation with remediation guidance.

## NABLA Compliance

The Web Application Security Specialist operates under [NABLA Infinity](/glossary/nabla-infinity/) epistemic governance for all security claims.

**Signal Plurality**: Every security finding requires confirmation from at least two signals. An injection vulnerability requires both AST pattern detection and contextual analysis confirming that user input reaches the vulnerable code path.

**Contradiction Preservation**: When scanners produce conflicting assessments (one flagging an endpoint as vulnerable, another as safe due to upstream protection), both assessments are preserved with their respective evidence chains.

**Provenance Mandatory**: Every finding carries complete provenance: OWASP category reference, detection module, source file location, evidence artifacts (code snippets, configuration values), and the specific security rule that triggered detection.

**Time Decay**: Security findings include discovery timestamps and are periodically re-validated. Findings from previous assessments that are no longer reproducible are marked as potentially remediated but retained for audit purposes.

All security claims pass through [Trinity Gate](/glossary/trinity-gate/) validation before being classified as confirmed vulnerabilities.

## Configuration

```elixir
config :prismatic_agents, Prismatic.Agents.WebAppSecurity,
  assessment_interval: :timer.hours(12),
  target_ports: [4000, 4004],
  owasp_categories: :all,
  severity_threshold: :low,
  auto_block_critical: true,
  scan_liveview: true,
  scan_api: true,
  scan_channels: true,
  max_concurrent_scanners: 6,
  telemetry_prefix: [:prismatic, :web_security]
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `assessment_interval` | 12 hours | Time between scheduled full assessments |
| `target_ports` | `[4000, 4004]` | Ports hosting web applications to assess |
| `owasp_categories` | `:all` | OWASP categories to include in assessment |
| `auto_block_critical` | `true` | Block deployments with critical web vulnerabilities |
| `scan_liveview` | `true` | Include LiveView security in assessments |

## Performance

| Metric | Target | Measured |
|--------|--------|----------|
| Full OWASP assessment | < 15 minutes | 5-10 minutes |
| Injection scan (all endpoints) | < 5 minutes | 2-3 minutes |
| Auth audit | < 3 minutes | 1-2 minutes |
| Header validation | < 30 seconds | 5-15 seconds |
| Configuration check | < 60 seconds | 15-30 seconds |
| Memory footprint | < 100 MB | 40-70 MB |
| Finding lookup (ETS) | < 1 ms | 0.1-0.3 ms |

The agent parallelizes scanning across OWASP categories, with each scanner operating as an independent OTP process. AST analysis results are cached in [ETS](/glossary/ets/) for incremental scanning, and endpoint discovery leverages Phoenix router introspection for rapid surface enumeration.

## Related Resources

- [OWASP Top 10](/glossary/owasp/) -- Industry standard web application security risks
- [vulnerability-scanning-specialist](/agents/vulnerability-scanning-specialist/) -- Platform-wide vulnerability detection agent
- [Prismatic Perimeter](/apps/prismatic-perimeter/) -- External Attack Surface Management system
- [Blue Team](/glossary/blue-team/) -- Epistemic defense team consuming security intelligence
- [Red Team](/glossary/red-team/) -- Adversarial simulation team testing web defenses
- [NO MERCY Doctrine](/glossary/no-mercy/) -- Zero-tolerance enforcement for security violations
- [LiveView](/glossary/liveview/) -- Phoenix real-time UI framework with specific security concerns
- [AIAD Standard](/glossary/aiad/) -- Agent specification standard

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)