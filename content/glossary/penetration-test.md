+++
title = "Penetration Test"
weight = 50
[extra]
description = "An authorized simulated cyberattack performed to evaluate the security of a system by actively exploiting vulnerabilities."
category = "security"
related_terms = ["vulnerability-assessment", "red-team", "owasp", "security-audit"]
complexity_level = "advanced"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["penetration test", "pentest", "security assessment", "ethical hacking", "vulnerability", "glossary", "Prismatic Platform"]
tags = ["glossary", "security"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Penetration Test - Prismatic Platform"
+++

## Definition & Overview

A penetration test (pentest) is an authorized, simulated cyberattack performed against a computer system, network, or application to evaluate its security posture. Unlike automated vulnerability scanning, which identifies known weaknesses, penetration testing actively attempts to exploit vulnerabilities to determine their real-world impact, chaining multiple findings to demonstrate attack paths that automated tools cannot discover. The results provide organizations with concrete evidence of their security gaps and prioritized remediation guidance.

Penetration testing follows a structured methodology: reconnaissance (gathering information about the target), scanning (identifying potential vulnerability points), exploitation (attempting to breach the system), post-exploitation (assessing the impact of successful breaches), and reporting (documenting findings with remediation recommendations). The scope, rules of engagement, and authorization boundaries are defined in advance to ensure the test is legal, ethical, and constructive.

The Prismatic Platform both facilitates penetration testing (through its OSINT capabilities for reconnaissance) and is itself a target of penetration testing (as part of the security assurance process). The Color-Team security operations provide an internal capability for continuous security assessment, with the Red Team simulating adversarial scenarios and the Blue Team validating defensive measures. The Perimeter module's security ratings incorporate penetration testing results.

## Technical Deep Dive

Penetration testing methodologies are standardized by frameworks like PTES (Penetration Testing Execution Standard), OWASP Testing Guide, and NIST SP 800-115. These frameworks ensure comprehensive coverage and reproducible results. The OWASP Testing Guide is particularly relevant for web application testing, covering injection, authentication, session management, access control, cryptography, and business logic vulnerabilities.

Three primary approaches exist: black-box testing (the tester has no prior knowledge of the system), white-box testing (the tester has full access to source code and architecture documentation), and gray-box testing (the tester has partial knowledge, typically user-level access and basic documentation). Each approach trades off realism for efficiency: black-box is most realistic but most time-consuming; white-box is most thorough but may not reflect an external attacker's perspective.

```elixir
defmodule PrismaticPerimeter.Assessment.PentestFramework do
  @moduledoc """
  Penetration testing framework for automated security assessment.
  Provides structured test execution with finding classification.

  AUTHORIZATION: All tests require explicit authorization.
  This module is for authorized security testing only.
  """

  @type finding_severity :: :critical | :high | :medium | :low | :informational

  @type finding :: %{
    id: String.t(),
    title: String.t(),
    severity: finding_severity(),
    cvss_score: float(),
    description: String.t(),
    evidence: String.t(),
    remediation: String.t(),
    affected_component: String.t(),
    cwe_id: String.t() | nil,
    owasp_category: String.t() | nil
  }

  @type assessment :: %{
    target: String.t(),
    methodology: String.t(),
    start_time: DateTime.t(),
    end_time: DateTime.t() | nil,
    findings: [finding()],
    status: :in_progress | :completed | :aborted,
    tester: String.t(),
    authorization_ref: String.t()
  }

  @spec create_assessment(map()) :: {:ok, assessment()}
  def create_assessment(%{target: target, authorization_ref: auth_ref} = params) do
    assessment = %{
      target: target,
      methodology: Map.get(params, :methodology, "OWASP Testing Guide v4.2"),
      start_time: DateTime.utc_now(),
      end_time: nil,
      findings: [],
      status: :in_progress,
      tester: Map.get(params, :tester, "automated"),
      authorization_ref: auth_ref
    }

    {:ok, assessment}
  end

  @spec run_checks(assessment(), [atom()]) :: {:ok, assessment()}
  def run_checks(assessment, check_modules) do
    findings =
      check_modules
      |> Task.async_stream(fn module ->
        module.check(assessment.target)
      end, max_concurrency: 3, timeout: 120_000)
      |> Enum.flat_map(fn
        {:ok, {:ok, findings}} -> findings
        _ -> []
      end)
      |> Enum.sort_by(&severity_order(&1.severity))

    {:ok, %{assessment |
      findings: assessment.findings ++ findings,
      end_time: DateTime.utc_now(),
      status: :completed
    }}
  end

  defp severity_order(:critical), do: 0
  defp severity_order(:high), do: 1
  defp severity_order(:medium), do: 2
  defp severity_order(:low), do: 3
  defp severity_order(:informational), do: 4
end
```

The distinction between penetration testing and vulnerability scanning is important. Vulnerability scanners identify known weaknesses based on signatures and version detection. Penetration testing goes further: it validates whether vulnerabilities are actually exploitable, chains multiple findings into attack paths, tests custom business logic that scanners cannot understand, and assesses the real-world impact of successful exploitation. Both are necessary, but penetration testing provides the higher-value findings.

## Architecture & Implementation

The platform's security assessment capabilities operate at multiple levels. Automated security checks (header analysis, TLS configuration, DNS security) run continuously as part of the Perimeter module's scanning pipeline. These provide the baseline security posture. Penetration testing provides deeper, periodic assessment that validates the automated findings and discovers issues that automated tools miss.

The Color-Team architecture provides the organizational framework for internal penetration testing. The Red Team (`red-commander`, `red-epistemic-attacker`, `red-drift-inducer`, `red-scenario-generator`) simulates adversarial scenarios using a taxonomy of 329 attack techniques. The Blue Team evaluates defensive effectiveness. The Purple Team synthesizes findings into actionable improvements. This continuous Red-Blue loop provides pentest-like security validation without the cost and scheduling constraints of external engagements.

All penetration testing activities within the platform are subject to strict safety protocols: sandbox isolation (no production access), synthetic data only (no real PII), immutable audit trails (every action logged), and ethics checks (automated validation every 10-15 seconds). The Black Team's theoretical threat modeling operates at maximum isolation, producing only abstract threat models, never executable exploit code.

## Usage in Prismatic Platform

Security check modules for automated assessment:

```elixir
defmodule PrismaticPerimeter.Checks.HeaderSecurity do
  @moduledoc """
  Automated security header analysis as part of pentest framework.
  Checks for missing or misconfigured HTTP security headers.
  """

  @behaviour PrismaticPerimeter.Assessment.CheckBehaviour

  @required_headers %{
    "strict-transport-security" => %{
      description: "HSTS header prevents protocol downgrade attacks",
      severity: :high,
      cwe: "CWE-319"
    },
    "x-content-type-options" => %{
      description: "Prevents MIME type sniffing",
      severity: :medium,
      cwe: "CWE-693"
    },
    "content-security-policy" => %{
      description: "CSP prevents XSS and injection attacks",
      severity: :high,
      cwe: "CWE-79"
    },
    "x-frame-options" => %{
      description: "Prevents clickjacking attacks",
      severity: :medium,
      cwe: "CWE-1021"
    }
  }

  @impl true
  def check(target) do
    case fetch_headers(target) do
      {:ok, headers} ->
        findings =
          @required_headers
          |> Enum.reject(fn {header, _} ->
            Map.has_key?(headers, String.downcase(header))
          end)
          |> Enum.map(fn {header, config} ->
            %{
              id: "HEADER-#{String.upcase(header)}",
              title: "Missing Security Header: #{header}",
              severity: config.severity,
              cvss_score: severity_to_cvss(config.severity),
              description: config.description,
              evidence: "Header #{header} not present in response",
              remediation: "Add #{header} header to all HTTP responses",
              affected_component: target,
              cwe_id: config.cwe,
              owasp_category: "A05:2021 - Security Misconfiguration"
            }
          end)

        {:ok, findings}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp fetch_headers(target) do
    case Tesla.get(target) do
      {:ok, %{headers: headers}} ->
        header_map = Map.new(headers, fn {k, v} -> {String.downcase(k), v} end)
        {:ok, header_map}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp severity_to_cvss(:critical), do: 9.0
  defp severity_to_cvss(:high), do: 7.5
  defp severity_to_cvss(:medium), do: 5.0
  defp severity_to_cvss(:low), do: 3.0
  defp severity_to_cvss(_), do: 0.0
end
```

Penetration testing, whether automated through the platform's security checks or performed by the Color-Team agents, is the most rigorous validation of the platform's security posture, going beyond theoretical vulnerability identification to demonstrate real exploitability and business impact.

## Cross-References

- [Red Team](@/glossary/red-team.md) - Adversarial simulation team performing internal pentesting
- [OWASP](@/glossary/owasp.md) - Standards body defining web application testing methodology
- [Injection](@/glossary/injection.md) - Common vulnerability class tested during pentests
- **Perimeter** - Security module incorporating pentest results
- [IOC](@/glossary/ioc.md) - Indicators generated during pentest activities

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
