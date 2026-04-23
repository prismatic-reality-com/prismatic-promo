+++
title = "Penetration Testing"
weight = 58
[extra]
category = "security"
description = "Authorized simulated attack testing system defenses by actively exploiting vulnerabilities to validate security controls and measure real-world breach impact"
related_terms = ["vulnerability-assessment", "red-team", "cyber-threat-intelligence", "easm", "color-teams", "blue-team", "purple-team", "owasp", "security-rating"]
difficulty = "advanced"
importance = "critical"
platform_relevance = "core"
date_created = "2025-05-20"
date_updated = "2026-02-22"
version = "2.0.0"
audience = ["security-engineers", "penetration-testers", "compliance-officers", "platform-architects", "devsecops-engineers"]
prerequisites = ["vulnerability-assessment", "owasp", "networking"]
domain = "cybersecurity"
related_patterns = ["kill-chain", "mitre-attack", "diamond-model", "cyber-kill-chain", "adversary-simulation", "defense-in-depth"]
see_also = ["architecture", "technologies", "capabilities"]
acronyms = ["PTES", "OWASP", "OSSTMM", "NIST", "CVE", "CVSS", "DAST", "SAST", "IAST", "ROE", "PCI-DSS", "SOC2", "EASM"]
standards = ["PTES", "OWASP-Testing-Guide-v4", "OSSTMM-3.0", "NIST-SP-800-115", "ISO-27001-Annex-A", "PCI-DSS-11.3"]
tools = ["sobelow", "burp-suite", "metasploit", "nmap", "nuclei", "zap", "sqlmap", "nikto", "gobuster"]
platforms = ["beam", "kali-linux", "parrot-os", "docker"]
keywords = ["penetration testing methodology", "ethical hacking", "security assessment", "red team operations", "vulnerability exploitation", "security audit", "application security testing", "OWASP Top 10 testing"]
tags = ["security", "penetration-testing", "red-team", "offensive-security", "compliance"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1488
date_modified = "2026-02-23"
quality_score = 80
image = "/images/sections/glossary.png"
image_alt = "Penetration Testing - Prismatic Platform"
+++

## Definition

Penetration testing (pen testing) is an authorized, simulated cyberattack against a system, network, or application to evaluate its security defenses by actively attempting to exploit vulnerabilities. Unlike [vulnerability assessment](/glossary/vulnerability-assessment/), which identifies and catalogs weaknesses without exploitation, penetration testing validates whether identified vulnerabilities are actually exploitable and measures the real-world impact of a successful breach. Pen tests follow structured methodologies encompassing reconnaissance, scanning, exploitation, post-exploitation, and reporting, and require explicit written authorization from the system owner before execution.

The discipline originated in military and government contexts during the 1960s and 1970s when "tiger teams" were formed to test the physical and electronic security of defense installations. James P. Anderson's 1972 report for the US Air Force is widely considered the first formal articulation of computer penetration testing methodology. Today, penetration testing is a cornerstone of enterprise security programs, required by compliance frameworks including [PCI DSS](/glossary/compliance-framework/), [SOC 2](/glossary/soc2/), and [ISO 27001](/glossary/iso-27001/), and recommended by NIST, [OWASP](/glossary/owasp/), and national cybersecurity agencies worldwide.

The Prismatic Platform integrates penetration testing capabilities through its Color-Team security architecture, where the [Red Team](/glossary/red-team/) conducts adversarial simulations and the [Purple Team](/glossary/purple-team/) synthesizes offensive findings with defensive intelligence. Additionally, Prismatic Perimeter's [EASM](/glossary/easm/) functionality incorporates automated external security probing that applies penetration testing principles to discovered attack surface assets.

## Overview and Industry Context

Penetration testing exists on a spectrum between automated vulnerability scanning and full adversarial simulation (red teaming). Vulnerability scanners identify known weaknesses through signature matching and configuration checks. Red teams simulate persistent advanced threats over extended periods with broader scope. Penetration testing occupies the middle ground: it actively exploits vulnerabilities within a defined scope and timeframe, providing evidence of exploitability without the extended duration and operational complexity of full red team engagements.

The value of penetration testing lies in its empirical nature. Theoretical vulnerability assessments can produce false positives (flagging vulnerabilities that are not exploitable in context) and miss chained exploits (where individually low-risk vulnerabilities combine into critical attack paths). Penetration testing resolves both issues by demonstrating actual exploitation, providing unambiguous evidence of risk that drives remediation prioritization.

Modern penetration testing extends beyond traditional network and application boundaries to encompass cloud infrastructure, API security, mobile applications, IoT devices, and -- critically for the Prismatic Platform -- epistemic systems where the "attack surface" includes belief formation, evidence evaluation, and confidence calibration. The NABLA Infinity framework's axioms define the epistemic boundaries that must be tested for resistance to adversarial manipulation.

## Testing Methodology Phases

Professional penetration testing follows a structured methodology, typically aligned with PTES (Penetration Testing Execution Standard) or OWASP Testing Guide:

```
Phase 1: Pre-Engagement
  |-- Scope definition and authorization (mandatory legal requirement)
  |-- Rules of engagement (ROE) agreement
  |-- Communication plan and escalation contacts
  |-- Legal and compliance documentation
  |-- Emergency stop procedures

Phase 2: Reconnaissance
  |-- Passive: OSINT, DNS enumeration, certificate transparency
  |-- Active: Port scanning, service fingerprinting, technology detection
  |-- Social: Employee enumeration, organizational structure mapping
  |-- Output: Target inventory, technology stack, potential entry points

Phase 3: Vulnerability Analysis
  |-- Automated scanning (Nessus, OpenVAS, Sobelow for Elixir)
  |-- Manual analysis of application logic and business flows
  |-- Vulnerability correlation and prioritization
  |-- Output: Vulnerability catalog with exploitability assessment

Phase 4: Exploitation
  |-- Attempt exploitation of identified vulnerabilities
  |-- Chain multiple low-severity findings into high-impact attacks
  |-- Document each successful exploitation with evidence
  |-- Maintain stealth where scope permits (test detection capabilities)

Phase 5: Post-Exploitation
  |-- Assess access gained (lateral movement potential)
  |-- Identify sensitive data accessible from compromised position
  |-- Evaluate persistence mechanisms available
  |-- Document business impact of successful compromise

Phase 6: Reporting
  |-- Executive summary with business risk context
  |-- Technical findings with reproduction steps
  |-- Remediation recommendations prioritized by risk
  |-- Evidence artifacts (screenshots, logs, network captures)
  |-- Retest verification plan
```

## Testing Types and Approaches

| Type | Knowledge | Scope | Simulates |
|------|-----------|-------|-----------|
| **Black Box** | No prior knowledge | External attacker perspective | Unknown external threat |
| **White Box** | Full source code and architecture | Comprehensive security review | Insider threat, code audit |
| **Gray Box** | Partial knowledge (credentials, docs) | Authenticated user perspective | Compromised credential scenario |
| **Network** | Infrastructure focus | Hosts, services, protocols | Network-level attacks |
| **Web Application** | Application focus | OWASP Top 10 categories | Application-layer attacks |
| **API** | Interface focus | Endpoints, authentication, data | API abuse, injection, broken auth |
| **Social Engineering** | Human focus | Phishing, pretexting, vishing | Human-targeted attacks |
| **Physical** | Facility focus | Access controls, hardware | Physical breach scenarios |
| **Cloud** | Infrastructure focus | AWS/GCP/Azure misconfig | Cloud-native attack paths |
| **Wireless** | RF focus | WiFi, Bluetooth, RFID | Wireless protocol attacks |

## Epistemic Penetration Testing

The Prismatic Platform extends traditional penetration testing into the epistemic domain -- testing the integrity of knowledge systems, reasoning pipelines, and decision-making processes governed by the NABLA Infinity framework:

```elixir
defmodule PrismaticDark.EpistemicPenTest do
  @moduledoc """
  Epistemic penetration testing framework for testing the
  integrity of knowledge systems and reasoning pipelines.
  All operations execute in sandboxed environments only.
  Validates NABLA Infinity axioms under adversarial conditions.
  """

  @type test_vector :: %{
    target: :belief_formation | :evidence_evaluation | :confidence_calibration,
    technique: :truth_distortion | :signal_poisoning | :drift_induction,
    severity: :low | :medium | :high | :critical,
    preconditions: [String.t()],
    expected_defense: String.t(),
    nabla_axiom: atom()
  }

  @type test_result :: %{
    vector: test_vector(),
    outcome: :defended | :partial_bypass | :full_bypass,
    evidence: map(),
    recommendations: [String.t()],
    trinity_gate_impact: :none | :structural | :logical | :formal
  }

  @spec execute_test(test_vector(), sandbox :: map()) ::
          {:ok, test_result()} | {:error, term()}
  def execute_test(vector, sandbox) do
    with :ok <- verify_sandbox_isolation(sandbox),
         :ok <- verify_synthetic_data(sandbox),
         :ok <- verify_ethics_check(vector),
         {:ok, result} <- run_attack_vector(vector, sandbox) do
      {:ok, %{
        vector: vector,
        outcome: classify_result(result),
        evidence: result.evidence,
        recommendations: generate_recommendations(result),
        trinity_gate_impact: assess_trinity_impact(result)
      }}
    end
  end

  defp verify_sandbox_isolation(%{network_access: false, data_source: :synthetic_only}), do: :ok
  defp verify_sandbox_isolation(_), do: {:error, :safety_violation}

  defp verify_synthetic_data(%{data_source: :synthetic_only}), do: :ok
  defp verify_synthetic_data(_), do: {:error, :non_synthetic_data}

  defp verify_ethics_check(%{severity: severity}) when severity in [:high, :critical] do
    case PrismaticDark.EthicsValidator.validate() do
      :ok -> :ok
      {:error, _} = err -> err
    end
  end
  defp verify_ethics_check(_), do: :ok
end
```

## Implementation in the Prismatic Platform

The Prismatic Platform's penetration testing capability operates through the Color-Team security architecture, with the [Red Team](/glossary/red-team/) serving as the primary offensive testing unit:

### Red Team Agents

The four Red Team agents conduct penetration testing scenarios within sandboxed environments using synthetic data exclusively:

| Agent | Role | Specialization |
|-------|------|---------------|
| `red-commander` | L3 Strategic Commander | Orchestrates adversarial scenarios, routes findings to Purple/Blue |
| `red-epistemic-attacker` | L2 Tactical Specialist | Truth distortion and source poisoning simulation |
| `red-drift-inducer` | L2 Tactical Specialist | Sub-threshold drift attacks, cascade propagation analysis |
| `red-scenario-generator` | L2 Tactical Specialist | Composes multi-technique scenarios from 329-entry taxonomy |

### Sandbox Isolation

All penetration testing operations execute in `PrismaticDark.Sandbox` with strict safety constraints: no network access, synthetic data only, mandatory ethics checks every 10-15 seconds, and immutable audit logging for every operation. The Black Team's `black-abstraction-enforcer` provides an additional safety layer ensuring no executable exploit content is produced.

### Purple Team Integration

Penetration test findings flow from Red Team to [Purple Team](/glossary/purple-team/) for synthesis with [Blue Team](/glossary/blue-team/) defensive intelligence. Purple Team evaluates findings against a 4-condition closure protocol, ensuring that identified vulnerabilities are not prematurely dismissed. The closure protocol requires: (1) exploit confirmed, (2) defense validated, (3) regression test added, (4) monitoring deployed.

### Perimeter EASM Probing

Prismatic Perimeter performs automated external security assessments that incorporate penetration testing principles:

```elixir
defmodule PrismaticPerimeter.SecurityProbe do
  @moduledoc """
  Active security probing for discovered external assets.
  Tests for common exploitable conditions without destructive actions.
  Feeds findings into the security rating calculation engine.
  """

  @type finding :: %{
    type: atom(),
    severity: :info | :low | :medium | :high | :critical,
    details: map(),
    remediation: String.t(),
    cvss_score: float() | nil
  }

  @spec probe_asset(String.t(), keyword()) :: {:ok, [finding()]} | {:error, term()}
  def probe_asset(domain, opts \\ []) do
    timeout = Keyword.get(opts, :timeout, 30_000)

    probes = [
      {:tls_weakness, fn -> probe_tls_configuration(domain) end},
      {:header_missing, fn -> probe_security_headers(domain) end},
      {:open_redirect, fn -> probe_redirect_behavior(domain) end},
      {:information_disclosure, fn -> probe_error_responses(domain) end},
      {:cors_misconfiguration, fn -> probe_cors_policy(domain) end},
      {:dns_zone_transfer, fn -> probe_dns_zone_transfer(domain) end},
      {:subdomain_takeover, fn -> probe_subdomain_takeover(domain) end}
    ]

    findings =
      probes
      |> Task.async_stream(fn {type, probe_fn} ->
        {type, probe_fn.()}
      end, timeout: timeout, max_concurrency: 4)
      |> Enum.flat_map(fn
        {:ok, {type, {:vulnerable, details}}} ->
          [%{type: type, severity: classify_severity(type), details: details,
             remediation: remediation_for(type), cvss_score: cvss_for(type)}]
        {:ok, {_type, :secure}} -> []
        {:exit, _reason} -> []
      end)

    {:ok, findings}
  end

  defp classify_severity(:tls_weakness), do: :high
  defp classify_severity(:cors_misconfiguration), do: :medium
  defp classify_severity(:header_missing), do: :low
  defp classify_severity(:subdomain_takeover), do: :critical
  defp classify_severity(_), do: :medium
end
```

## Elixir-Specific Security Testing

The Prismatic Platform incorporates Elixir-specific security testing using Sobelow, the security-focused static analysis tool for Phoenix applications:

```elixir
defmodule PrismaticSafety.SecurityAudit do
  @moduledoc """
  Automated security audit combining static analysis (Sobelow),
  dependency scanning, and configuration validation for
  all Phoenix applications in the umbrella.
  """

  @type audit_result :: %{
    sobelow_findings: [map()],
    dependency_vulnerabilities: [map()],
    config_issues: [map()],
    overall_risk: :low | :medium | :high | :critical
  }

  @spec run_full_audit() :: {:ok, audit_result()} | {:error, term()}
  def run_full_audit do
    with {:ok, sobelow} <- run_sobelow_scan(),
         {:ok, deps} <- scan_dependencies(),
         {:ok, config} <- validate_security_config() do
      {:ok, %{
        sobelow_findings: sobelow,
        dependency_vulnerabilities: deps,
        config_issues: config,
        overall_risk: calculate_risk(sobelow, deps, config)
      }}
    end
  end

  @sobelow_checks [
    "Config.HTTPS",
    "Config.CSP",
    "Config.CSRF",
    "SQL.Query",
    "XSS.Raw",
    "Traversal.FileModule",
    "Misc.BinToTerm",
    "DOS.BinToAtom"
  ]

  defp run_sobelow_scan do
    results =
      @sobelow_checks
      |> Enum.flat_map(fn check ->
        case System.cmd("mix", ["sobelow", "--check", check, "--format", "json"],
               cd: project_root()) do
          {output, 0} -> Jason.decode!(output)["findings"]
          {_output, _code} -> []
        end
      end)

    {:ok, results}
  end
end
```

## Comparison with Alternatives

| Approach | Active Exploitation | Duration | Scope | Output | Cost |
|----------|-------------------|----------|-------|--------|------|
| **Penetration Testing** | Yes | Days to weeks | Defined scope | Exploitation evidence + remediation | Medium-High |
| **Vulnerability Assessment** | No | Hours to days | Broad scan | Vulnerability catalog | Low-Medium |
| **Red Team Exercise** | Yes | Weeks to months | Organization-wide | Comprehensive attack narrative | High |
| **Bug Bounty** | Yes (external) | Ongoing | Public scope | Individual vulnerability reports | Variable |
| **DAST Scanning** | Partial (automated) | Minutes to hours | Application endpoints | Automated findings | Low |
| **SAST Analysis** | No | Minutes | Source code | Code-level weakness catalog | Low |
| **Threat Modeling** | No | Days | Architecture | Risk assessment document | Medium |

## Best Practices

**Authorization First**: Never conduct penetration testing without explicit written authorization. Document scope, rules of engagement, testing windows, and emergency contacts before beginning any testing activity. Unauthorized testing is illegal in most jurisdictions regardless of intent.

**Scope Discipline**: Define clear boundaries for what systems, techniques, and data are in scope. Out-of-scope testing creates legal liability and can cause unintended service disruption. The Prismatic Platform's sandbox isolation enforces scope boundaries programmatically.

**Evidence Preservation**: Document every step of exploitation with screenshots, command outputs, network captures, and timestamps. Findings without reproducible evidence are disputed during remediation discussions.

**Risk-Based Prioritization**: Focus testing effort on high-value targets and likely attack paths rather than attempting exhaustive coverage. A skilled tester exploiting the most likely attack chain provides more value than scanning every endpoint superficially.

**Safe Exploitation**: Prefer non-destructive exploitation techniques that demonstrate vulnerability without causing data loss or service disruption. Denial-of-service testing requires explicit scope inclusion and production safeguards.

**Remediation Verification**: After vulnerabilities are remediated, retest to confirm fixes are effective. A finding is not closed until exploitation no longer succeeds under the same conditions. The Prismatic Platform's mandatory regression test protocol ensures every fix includes verification tests.

**Continuous Testing**: Move beyond annual pen tests to continuous security validation. The Prismatic Platform's EASM probing provides ongoing external security assessment rather than point-in-time snapshots.

## Common Vulnerability Categories

The OWASP Top 10 provides the standard taxonomy for web application penetration testing findings:

| Category | Testing Approach | Prismatic Defense |
|----------|-----------------|-------------------|
| Injection (SQL, NoSQL, OS) | Parameter manipulation, payload injection | Parameterized queries via [Ecto](/glossary/ecto/), input validation |
| Broken Authentication | Credential stuffing, session manipulation | JWT with rotation, RBAC enforcement |
| Sensitive Data Exposure | Traffic interception, storage inspection | TLS 1.3, encryption at rest, data classification |
| XML External Entities | Payload injection in XML parsers | Disabled by default in Erlang XML parsers |
| Broken Access Control | Privilege escalation, IDOR testing | Role-based access via Plug pipeline |
| Security Misconfiguration | Configuration review, default credential checks | Quality gates, pre-commit validation |
| Cross-Site Scripting (XSS) | Payload injection in rendered output | HEEx auto-escaping, Content Security Policy |
| Insecure Deserialization | Crafted serialized objects | No `:erlang.binary_to_term/1` on untrusted input |
| Known Vulnerabilities | Dependency scanning, version enumeration | `mix deps.audit`, automated dependency updates |
| Insufficient Logging | Log review, detection gap analysis | Comprehensive [telemetry](/glossary/telemetry/) across all apps |

## Use Cases

**Compliance Validation**: Meeting [PCI DSS](/glossary/compliance-framework/), [SOC 2](/glossary/soc2/), or [ISO 27001](/glossary/iso-27001/) requirements for periodic penetration testing of internet-facing systems and internal network segments.

**Pre-Release Security**: Testing new application features, API endpoints, or infrastructure changes before production deployment to identify exploitable vulnerabilities early in the development lifecycle.

**Incident Response Preparedness**: Simulating realistic attack scenarios to test detection capabilities, response procedures, and recovery processes.

**Epistemic System Validation**: Testing the Prismatic Platform's NABLA Infinity axioms under adversarial conditions to verify that signal plurality, contradiction preservation, and confidence thresholds resist manipulation.

**Supply Chain Assessment**: Evaluating the security posture of third-party components, APIs, and services that the platform depends on. The Prismatic Platform's 115 umbrella applications each have dependency auditing through `mix deps.audit`.

**Merger and Acquisition Due Diligence**: Assessing the security posture of target organizations before integration, identifying risks that could affect the combined entity.

## Related Concepts

- [Vulnerability Assessment](/glossary/vulnerability-assessment/) - Discovery phase preceding exploitation testing
- [Red Team](/glossary/red-team/) - Adversarial simulation agents conducting pen test scenarios
- [Purple Team](/glossary/purple-team/) - Synthesis hub integrating pen test findings with defenses
- [Blue Team](/glossary/blue-team/) - Defensive team whose controls are validated by pen testing
- [Cyber Threat Intelligence](/glossary/cyber-threat-intelligence/) - Intelligence informing test scenarios
- [Color Teams](/glossary/color-teams/) - Six-team security operations framework
- [OWASP](/glossary/owasp/) - Testing methodology standards for web application pen testing
- [EASM](/glossary/easm/) - External attack surface discovery informing pen test scope
- [SOC 2](/glossary/soc2/) - Compliance framework requiring periodic penetration testing
- [Security Rating](/glossary/security-rating/) - Quantified security posture incorporating pen test results

## See Also

- [Architecture](/architecture/) - Security testing architecture
- [Technologies](/technologies/) - Security tooling stack
- [Capabilities](/capabilities/) - Platform security capabilities

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
