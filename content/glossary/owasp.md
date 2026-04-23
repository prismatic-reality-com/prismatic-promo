+++
title = "OWASP"
weight = 46
[extra]
category = "security"
description = "Open Web Application Security Project providing security standards and tools"
related_terms = ["penetration-testing", "vulnerability-assessment", "rbac", "rate-limiting", "tls", "compliance-framework"]
tier = "TIER_1"
domain = "security"
complexity = "advanced"
audience = ["security-engineers", "developers", "architects", "compliance-officers"]
maturity = "flagship"
acronym = "OWASP"
full_name = "Open Web Application Security Project"
founded = "2001"
license = "CC BY-SA 4.0"
current_version = "Top 10 2021"
standard_type = "voluntary"
scope = "web-application-security"
prismatic_integration = "perimeter-rating-engine"
color_team_relevance = ["red-team", "blue-team", "purple-team"]
compliance_mapping = ["pci-dss", "soc2", "gdpr", "nis2", "iso-27001"]
platform_modules = ["prismatic_perimeter", "prismatic_web", "prismatic_safety"]
enforcement_level = "automated"
keywords = ["web security", "application security", "top 10", "ASVS", "WSTG", "vulnerability", "injection", "access control"]
author = "Tomas Korcak (korczis)"
reading_time = "11 min"
word_count = 2244
date_created = "2026-02-23"
date_modified = "2026-02-23"
tags = ["glossary", "security", "owasp", "prismatic"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "OWASP - Prismatic Platform"
+++

## Definition

OWASP (Open Web Application Security Project) is a nonprofit foundation dedicated to improving the security of software through freely available standards, tools, documentation, and community-driven research. Founded in 2001, OWASP produces the most widely referenced security resources in the industry, including the OWASP Top 10 -- a periodically updated list of the most critical web application security risks -- along with the Application Security Verification Standard (ASVS), the Web Security Testing Guide (WSTG), and numerous open-source security tools. OWASP operates through local chapters worldwide, with contributions from thousands of security professionals who develop and maintain its projects under open-source licenses.

The significance of OWASP extends beyond its individual publications. It has become the de facto common language for application security discussions, referenced by regulatory frameworks (PCI DSS, SOC 2, GDPR technical measures), enterprise security policies, and security tool vendors alike. When organizations say they are "OWASP compliant," they typically mean they have addressed the risks enumerated in the Top 10 and follow the testing methodologies prescribed in the WSTG. The framework provides a shared vocabulary for security teams, developers, auditors, and executives to discuss application risk without ambiguity.

OWASP's methodology is fundamentally risk-based rather than vulnerability-based. The Top 10 categories are determined by analyzing reported vulnerability data weighted by exploitability, prevalence, detectability, and business impact. This means the list reflects real-world risk rather than theoretical vulnerability severity, making it immediately actionable for engineering and security teams prioritizing remediation efforts. The data-driven approach ensures that the Top 10 evolves with the threat landscape, dropping categories that become less prevalent and introducing categories that emerge as significant risks.

## Overview

OWASP organizes its work into flagship projects, lab projects, and incubator projects, each maintained by dedicated project leaders and community contributors. The flagship projects represent the most mature and widely adopted resources, having undergone extensive peer review and real-world validation across thousands of organizations.

The foundation's governance model ensures that all output remains vendor-neutral -- no commercial tool or service receives preferential treatment. This neutrality has made OWASP the trusted reference for regulators, auditors, and security teams who need objective criteria for evaluating application security without commercial bias. The OWASP Foundation is funded through corporate sponsorships, conference revenues, and individual donations, ensuring that all published materials remain freely accessible.

### Flagship Projects

| Project | Purpose | Prismatic Relevance |
|---------|---------|---------------------|
| **Top 10** | Risk-aware ranking of critical web application security risks | Core security posture assessment for Perimeter ratings |
| **ASVS** | Detailed security requirements for application verification | ASVS L2 compliance target for platform authentication and authorization |
| **WSTG** | Comprehensive web security testing methodology | Red Team attack taxonomy mapping for adversarial simulations |
| **ZAP** | Open-source dynamic application security testing (DAST) | CI/CD pipeline integration for automated security regression testing |
| **Dependency-Check** | Software composition analysis for known vulnerabilities | Complements `mix hex.audit` for Hex dependency vulnerability scanning |
| **SAMM** | Software Assurance Maturity Model for organizational assessment | Framework for evaluating platform security program maturity |
| **Cheat Sheet Series** | Practical security guidance for developers | Developer reference for secure coding patterns in Elixir and Phoenix |
| **ModSecurity CRS** | Core Rule Set for web application firewalls | WAF rule reference for Perimeter security header assessment |

## Technical Details

### OWASP Top 10 (2021 Edition)

The current Top 10 reflects significant shifts from previous editions, consolidating some categories and introducing new ones based on evolving threat landscapes:

| Rank | Category | Description | Phoenix/Elixir Relevance |
|------|----------|-------------|--------------------------|
| A01 | Broken Access Control | Unauthorized access to resources | RBAC plugs, authorization checks |
| A02 | Cryptographic Failures | Sensitive data exposure | TLS configuration, secret management |
| A03 | Injection | SQL, NoSQL, LDAP, OS command injection | Ecto parameterized queries |
| A04 | Insecure Design | Missing or ineffective security controls | Threat modeling, secure architecture |
| A05 | Security Misconfiguration | Default configs, open cloud storage | Production config hardening |
| A06 | Vulnerable Components | Using components with known vulnerabilities | `mix audit`, dependency scanning |
| A07 | Authentication Failures | Broken authentication mechanisms | Session management, token validation |
| A08 | Software and Data Integrity | Untrusted deserialization, CI/CD attacks | Release verification, supply chain |
| A09 | Security Logging Failures | Insufficient logging and monitoring | Structured logging, audit trails |
| A10 | Server-Side Request Forgery | Server making unvalidated external requests | URL validation, allowlisting |

### Application Security Verification Standard (ASVS)

ASVS defines three verification levels with increasing rigor, providing a comprehensive checklist of security requirements organized across 14 chapters:

| Level | Target | Typical Application | Verification Depth |
|-------|--------|--------------------|--------------------|
| **L1** | All applications | Standard web apps | Automated + basic manual testing |
| **L2** | Sensitive applications | Financial, healthcare, PII-handling | L1 + thorough manual testing |
| **L3** | Critical applications | Infrastructure, military, safety-critical | L2 + source code review + architecture analysis |

ASVS organizes requirements into 14 chapters covering authentication, session management, access control, validation, cryptography, error handling, data protection, communications, HTTP security, malicious code, business logic, files, API, and configuration. Each requirement maps to specific OWASP Top 10 categories, providing the detailed implementation guidance that the Top 10 does not itself specify.

### Web Security Testing Guide (WSTG)

The WSTG provides step-by-step procedures for testing each OWASP category, serving as the primary methodology reference for both automated scanning tools and manual penetration testing engagements:

```
Testing Methodology Flow:
1. Information Gathering (WSTG-INFO)
   |-- Fingerprint web server, frameworks, technologies
   |-- Map application architecture and entry points

2. Configuration and Deployment Management (WSTG-CONF)
   |-- Test network configuration, platform configuration
   |-- Test file extensions handling, backup files

3. Identity Management (WSTG-IDNT)
   |-- Test role definitions, user registration
   |-- Test account provisioning, enumeration

4. Authentication Testing (WSTG-ATHN)
   |-- Test credentials transport, default credentials
   |-- Test lockout, bypass, password change, MFA

5. Authorization Testing (WSTG-ATHZ)
   |-- Test directory traversal, privilege escalation
   |-- Test IDOR, business logic authorization

6. Session Management (WSTG-SESS)
   |-- Test session management schema, cookies
   |-- Test session fixation, CSRF, logout

7. Input Validation (WSTG-INPV)
   |-- Test XSS, injection (SQL, LDAP, XML, SSI)
   |-- Test code injection, command injection

8. Error Handling (WSTG-ERRH)
   |-- Test error codes, stack traces
   |-- Verify error messages do not leak sensitive information

9. Cryptography (WSTG-CRYP)
   |-- Test TLS configuration, cipher strength
   |-- Test key management, sensitive data encryption

10. Business Logic (WSTG-BUSL)
    |-- Test workflow circumvention, data integrity
    |-- Test function-level access control
```

## Implementation in Prismatic Platform

The Prismatic Platform's security posture is built around OWASP guidelines across all web-facing components, with both preventive controls and active monitoring. The compliance matrix maps each OWASP category to specific platform implementations:

```elixir
defmodule PrismaticWeb.Security.OWASPCompliance do
  @moduledoc """
  OWASP Top 10 compliance mapping for the Prismatic Platform.
  Each control maps to specific OWASP categories and ASVS requirements.
  Provides verification status for security posture assessment.
  """

  @type control :: %{
    owasp_category: String.t(),
    asvs_requirement: String.t(),
    implementation: module(),
    verification: :automated | :manual | :both,
    status: :compliant | :partial | :non_compliant
  }

  @spec compliance_matrix() :: {:ok, [control()]}
  def compliance_matrix do
    controls = [
      %{
        owasp_category: "A01:2021 - Broken Access Control",
        asvs_requirement: "V4 - Access Control",
        implementation: PrismaticWeb.Plugs.RequireAdmin,
        verification: :automated,
        status: :compliant
      },
      %{
        owasp_category: "A02:2021 - Cryptographic Failures",
        asvs_requirement: "V6 - Stored Cryptography",
        implementation: PrismaticWeb.Plugs.SecureHeaders,
        verification: :both,
        status: :compliant
      },
      %{
        owasp_category: "A03:2021 - Injection",
        asvs_requirement: "V5 - Validation, Sanitization, Encoding",
        implementation: Ecto.Query,
        verification: :automated,
        status: :compliant
      },
      %{
        owasp_category: "A05:2021 - Security Misconfiguration",
        asvs_requirement: "V14 - Configuration",
        implementation: PrismaticWeb.Plugs.SecureHeaders,
        verification: :automated,
        status: :compliant
      },
      %{
        owasp_category: "A07:2021 - Authentication Failures",
        asvs_requirement: "V2 - Authentication",
        implementation: PrismaticWeb.Plugs.APIAuth,
        verification: :both,
        status: :compliant
      },
      %{
        owasp_category: "A09:2021 - Security Logging Failures",
        asvs_requirement: "V7 - Error Handling and Logging",
        implementation: PrismaticWeb.Plugs.AuditLogger,
        verification: :automated,
        status: :compliant
      }
    ]

    {:ok, controls}
  end

  @spec assess_category(String.t()) :: {:ok, map()} | {:error, :unknown_category}
  def assess_category(category_id) do
    case find_control(category_id) do
      nil -> {:error, :unknown_category}
      control -> {:ok, %{control: control, evidence: collect_evidence(control)}}
    end
  end
end
```

### Control Implementation Details

**A01 - Broken Access Control**: [RBAC](@/glossary/rbac.md) authorization plugs enforce role-based access on every route. The `RequireAdmin` plug protects administrative routes. LiveView mounts verify session authentication before rendering sensitive data. The platform implements both coarse-grained route-level authorization (via plug pipelines) and fine-grained component-level authorization (via LiveView assign checks).

**A02 - Cryptographic Failures**: [Encryption at rest](@/glossary/encryption-at-rest.md) protects stored sensitive data using AES-256-GCM through Cloak.Ecto. [TLS](@/glossary/tls.md) 1.3 is enforced for all transport encryption. Secret management uses environment variables with no hardcoded credentials in source code. Key rotation policies ensure that encryption keys are replaced on a defined schedule.

**A03 - Injection**: [Ecto](@/glossary/ecto.md)'s parameterized queries prevent SQL injection by construction. All database queries pass through Ecto's query builder, which separates query structure from user-supplied values at the protocol level. Phoenix's HEEx templates automatically escape output to prevent XSS injection. The platform's pre-commit hooks scan for raw SQL string interpolation patterns.

**A05 - Security Misconfiguration**: The `put_secure_browser_headers` plug sets Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, and other security headers. Production configuration disables debug endpoints and error detail exposure. The [Quality Gates](@/glossary/quality-gates.md) system verifies that production configurations do not expose development-only features.

**A07 - Authentication Failures**: Bearer token authentication with configurable expiration, [rate limiting](@/glossary/rate-limiting.md) on authentication endpoints to prevent credential stuffing, and session management with secure cookie attributes (HttpOnly, Secure, SameSite). Failed authentication attempts are logged with structured metadata for forensic analysis.

**A09 - Security Logging Failures**: Structured JSON logging with request metadata, authentication events, and authorization decisions. The audit logger creates immutable records of administrative actions for forensic analysis. All security-relevant events emit telemetry that feeds into the platform's [metrics](@/glossary/metrics.md) and alerting infrastructure.

### Perimeter OWASP Assessment

Prismatic Perimeter's security rating engine evaluates external assets against OWASP criteria, incorporating OWASP risks into the A-F security grade calculation:

```elixir
defmodule PrismaticPerimeter.Rating.OWASPFactor do
  @moduledoc """
  Evaluates external assets against OWASP security criteria
  for inclusion in the overall security rating calculation.
  Checks security headers, TLS configuration, cookie attributes,
  CORS policies, and Content Security Policy compliance.
  """

  @spec assess(String.t()) :: {:ok, float()} | {:error, term()}
  def assess(domain) do
    checks = [
      {:security_headers, check_security_headers(domain)},
      {:tls_configuration, check_tls_configuration(domain)},
      {:cookie_security, check_cookie_security(domain)},
      {:cors_policy, check_cors_policy(domain)},
      {:content_security_policy, check_csp(domain)},
      {:hsts_preload, check_hsts_preload(domain)},
      {:x_frame_options, check_xfo(domain)}
    ]

    case Enum.all?(checks, fn {_, result} -> match?({:ok, _}, result) end) do
      true ->
        score = calculate_weighted_score(checks)
        {:ok, score}

      false ->
        failed = Enum.filter(checks, fn {_, r} -> match?({:error, _}, r) end)
        {:error, {:assessment_failed, failed}}
    end
  end

  @spec check_security_headers(String.t()) :: {:ok, float()} | {:error, term()}
  defp check_security_headers(domain) do
    required_headers = [
      "Content-Security-Policy",
      "X-Content-Type-Options",
      "X-Frame-Options",
      "Strict-Transport-Security",
      "Referrer-Policy",
      "Permissions-Policy"
    ]

    case fetch_headers(domain) do
      {:ok, headers} ->
        present = Enum.count(required_headers, &Map.has_key?(headers, &1))
        {:ok, present / length(required_headers)}

      {:error, reason} ->
        {:error, reason}
    end
  end
end
```

### Color-Team OWASP Integration

The [Red Team](@/glossary/red-team.md) generates adversarial scenarios based on the OWASP testing guide taxonomy. Each of the 329 entries in the Red Team's attack taxonomy maps to one or more OWASP categories, ensuring comprehensive coverage of known web application security risks. [Blue Team](@/glossary/blue-team.md) defensive posture assessments reference OWASP ASVS requirements as verification criteria. The [Purple Team](@/glossary/purple-team.md) synthesizes Red-Blue findings through OWASP-mapped closure criteria, ensuring that every identified OWASP risk has a corresponding defensive control validated through adversarial testing.

## Comparison with Alternatives

| Standard | Scope | Update Frequency | Enforcement | Cost |
|----------|-------|------------------|-------------|------|
| **OWASP Top 10** | Web application risks | Every 3-4 years | Voluntary / regulatory reference | Free |
| **SANS Top 25 (CWE)** | Software weakness enumeration | Annual | Voluntary | Free |
| **NIST SP 800-53** | Federal information systems | Continuous | Mandatory (US federal) | Free |
| **PCI DSS** | Payment card data | Every 3 years | Mandatory (card processors) | Assessment costs |
| **[ISO 27001](@/glossary/iso-27001.md)** | Information security management | Periodic revision | Voluntary certification | Certification costs |
| **SOC 2** | Service organization controls | Annual audit | Market-driven requirement | Audit costs |
| **NIST CSF** | Cybersecurity framework | Periodic revision | Voluntary | Free |

OWASP is unique in being completely free, community-driven, and focused specifically on application-layer security rather than organizational or infrastructure controls. It complements broader standards like NIST and ISO by providing detailed technical guidance that those frameworks reference but do not themselves specify. The combination of OWASP (application security) with [ISO 27001](@/glossary/iso-27001.md) (information security management) and [NIS2](@/glossary/nis2.md) (regulatory compliance) provides comprehensive security coverage across technical, organizational, and regulatory dimensions.

## OWASP Top 10 Evolution

The Top 10 has evolved significantly across editions, reflecting changes in the threat landscape:

| Category | 2013 Position | 2017 Position | 2021 Position | Trend |
|----------|--------------|--------------|--------------|-------|
| Injection | A1 | A1 | A03 | Declining (better frameworks) |
| Broken Authentication | A2 | A2 | A07 | Declining (better tooling) |
| XSS | A3 | A7 | Merged into A03 | Consolidated |
| Broken Access Control | A4 | A5 | A01 | Rising (most critical) |
| Security Misconfiguration | A5 | A6 | A05 | Stable |
| Sensitive Data Exposure | A6 | A3 | A02 (renamed) | Stable |
| Insecure Design | -- | -- | A04 | New in 2021 |
| SSRF | -- | -- | A10 | New in 2021 |
| Software Integrity | -- | A8 (partial) | A08 | Expanded |

The 2021 edition introduced "Insecure Design" (A04) as a new category, acknowledging that many security failures stem from design flaws rather than implementation bugs. This category emphasizes threat modeling, secure design patterns, and reference architectures -- areas where Elixir's OTP patterns and the Prismatic Platform's architecture-first approach provide strong inherent protection.

## Best Practices

**Risk-Based Prioritization**: Address OWASP categories in order of risk to your specific application. A public-facing API serving financial data should prioritize A01 (Access Control) and A02 (Cryptographic Failures) over A10 (SSRF) if the application makes no outbound requests. Use the platform's [risk score](@/glossary/risk-score.md) calculations to quantify the relative importance of each category.

**Defense in Depth**: Never rely on a single control for any OWASP category. Injection prevention should combine parameterized queries, input validation, output encoding, and least-privilege database accounts. Each layer catches what the previous layer misses. The Prismatic Platform implements this through multiple security [plug](@/glossary/plug.md) layers in the Phoenix pipeline.

**Automated Verification**: Integrate OWASP ZAP or similar DAST tools into CI/CD pipelines for continuous security regression testing. Static analysis tools (SAST) like Sobelow for Elixir catch common security patterns at compile time. The platform's pre-commit hooks and [quality gates](@/glossary/quality-gates.md) automate verification of OWASP-relevant controls.

**Security Headers as Code**: Define security headers in plug pipelines rather than web server configuration. This keeps security controls version-controlled, testable, and consistent across environments. The platform's `SecureHeaders` plug centralizes all OWASP-recommended HTTP security headers.

**Dependency Scanning**: Run `mix hex.audit` regularly to check for known vulnerabilities in Hex dependencies. The OWASP Dependency-Check tool provides broader coverage across ecosystems. Address A06 (Vulnerable Components) through automated dependency scanning in the CI/CD pipeline.

**Threat Modeling**: Before implementing features, perform lightweight threat modeling using OWASP's STRIDE or PASTA methodologies to identify security requirements proactively rather than reactively. Address A04 (Insecure Design) at the architecture level before code is written.

## Use Cases

**Regulatory Compliance**: Organizations subject to PCI DSS, HIPAA, or GDPR reference OWASP standards as evidence of technical security controls. An OWASP-aligned security program satisfies the technical requirement component of these regulations. The Prismatic Platform's [compliance framework](@/glossary/compliance-framework.md) maps OWASP controls to regulatory requirements automatically.

**Security Rating Assessment**: Prismatic Perimeter uses OWASP criteria when evaluating external [attack surfaces](@/glossary/attack-surface.md), checking for security header presence, TLS configuration quality, and known vulnerability exposure. Each OWASP-relevant finding contributes to the organization's A-F security rating.

**Penetration Testing Scope**: OWASP WSTG provides the methodology and test case catalog for authorized [penetration testing](@/glossary/penetration-testing.md) engagements, ensuring comprehensive and reproducible security assessments. The platform's Red Team maps its adversarial scenarios to WSTG test identifiers for traceability.

**Developer Training**: OWASP's WebGoat and Juice Shop provide hands-on vulnerable applications for training developers to recognize and prevent common security flaws in their own code. These training tools complement the platform's secure coding guidelines and pre-commit enforcement.

**Supply Chain Security**: OWASP's Software Component Verification Standard (SCVS) and CycloneDX SBOM format address A08 (Software and Data Integrity) through systematic dependency verification. The platform's `mix hex.audit` integration automates supply chain vulnerability detection.

**CI/CD Security Integration**: OWASP provides the reference architecture for integrating security testing into continuous delivery pipelines. The platform's pre-commit hooks, quality gates, and deployment checks implement OWASP's DevSecOps recommendations for shifting security left in the development lifecycle.

## Common Pitfalls

**Treating the Top 10 as a Checklist**: The Top 10 identifies the most critical risks, not all risks. Addressing only the Top 10 while ignoring other OWASP resources (ASVS, WSTG) leaves significant gaps. Use the Top 10 as a starting point and ASVS as the comprehensive requirements reference.

**Static Compliance**: Passing an OWASP assessment once does not ensure ongoing compliance. The threat landscape evolves, new vulnerabilities emerge, and application changes introduce new attack vectors. Continuous assessment through automated security testing is essential.

**Ignoring A04 (Insecure Design)**: Many organizations focus on implementation-level controls (input validation, output encoding) while neglecting design-level security. Insecure Design requires architectural review and threat modeling -- activities that cannot be automated away.

**Over-Reliance on Tools**: OWASP ZAP and similar tools catch common, automatable vulnerabilities. Business logic flaws, design weaknesses, and complex authentication bypass chains require manual security review. Use tools for breadth, manual review for depth.

## Related Concepts

- [Penetration Testing](@/glossary/penetration-testing.md) - Security testing methodology guided by OWASP standards
- [Vulnerability Assessment](@/glossary/vulnerability-assessment.md) - Evaluation process using OWASP risk categories
- [RBAC](@/glossary/rbac.md) - Access control addressing OWASP broken access control risk
- [Rate Limiting](@/glossary/rate-limiting.md) - Protection against OWASP brute force and DoS risks
- [Compliance Framework](@/glossary/compliance-framework.md) - Regulatory standards that reference OWASP guidelines
- [Red Team](@/glossary/red-team.md) - Adversarial simulation using OWASP testing taxonomy
- [TLS](@/glossary/tls.md) - Transport security addressing OWASP cryptographic failures
- [Attack Surface](@/glossary/attack-surface.md) - Exposure points assessed against OWASP criteria
- [Encryption at Rest](@/glossary/encryption-at-rest.md) - Data protection addressing A02 cryptographic failures
- [Quality Gates](@/glossary/quality-gates.md) - Automated enforcement of OWASP security controls
- [ISO 27001](@/glossary/iso-27001.md) - Information security standard referencing OWASP controls

## See Also

- [Architecture](@/architecture/_index.md) - Platform security architecture
- [Technologies](@/technologies/_index.md) - Security tooling and frameworks
- [Capabilities](@/capabilities/_index.md) - Security and compliance capabilities

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
