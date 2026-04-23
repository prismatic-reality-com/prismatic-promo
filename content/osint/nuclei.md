+++
title = "Nuclei Templates"
weight = 58
[extra]
category = "global"
type = "vulnerability"
module = "Nuclei"
description = "Community-powered vulnerability scanner with 7000+ detection templates"
has_api = false
url = "https://nuclei.projectdiscovery.io"
rate_limit = "Self-hosted, unlimited"
capabilities = ["Vulnerability Scanning", "Misconfiguration Detection", "Exposed Panel Discovery", "CVE Detection", "Technology Detection", "Custom Templates"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1324
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Nuclei", "Templates", "Community-powered", "7000", "osint", "global", "Prismatic Platform", "Description"]
tags = ["osint", "global", "nuclei-templates", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "Nuclei Templates - Prismatic Platform"
+++

## Overview

Nuclei is an open-source vulnerability scanner by ProjectDiscovery that uses YAML-based templates to detect security vulnerabilities, misconfigurations, and exposed services. With over 7,000 community-contributed templates, it covers CVEs, default credentials, exposed panels, misconfigurations, and technology detection. Nuclei's template-driven approach makes it highly extensible and continuously updated by the security community.

Unlike traditional vulnerability scanners that rely on compiled plugins or signature databases, Nuclei uses human-readable YAML templates that define exactly what to check and how to check it. This transparency makes it possible for security teams to understand, audit, modify, and create their own detection logic without vendor dependency. The template format supports HTTP requests, DNS queries, network protocol interactions, and file-based checks, covering the full spectrum of vulnerability assessment needs.

Nuclei's architecture separates the scanning engine from the detection logic. The engine handles target management, rate limiting, authentication, and result aggregation while templates define the specific checks. This separation enables the community to contribute detection templates at a pace that far exceeds what any single vendor could achieve -- new CVE templates often appear within hours of public disclosure, providing near-real-time vulnerability assessment capability.

ProjectDiscovery maintains the nuclei-templates repository on GitHub, which serves as the central collection of community-contributed templates. The repository follows a quality assurance process where submitted templates are reviewed for accuracy, false positive rates, and adherence to the template specification before merging. This quality control makes the template library a reliable source for automated security assessment.

## Data Sources and Coverage

| Template Category | Count | Description | Examples |
|------------------|-------|-------------|----------|
| **[CVE](/glossary/cve/) Detection** | 2,000+ | Checks for known vulnerabilities by CVE ID | CVE-2024-3400, CVE-2023-44487, Log4Shell |
| **Misconfiguration** | 1,000+ | Default configs, debug modes, info disclosure | Debug endpoints, directory listings, .env exposure |
| **Exposure** | 800+ | Admin panels, sensitive files, dashboards | phpMyAdmin, Kibana, Grafana, Jenkins |
| **Default Login** | 400+ | Default credential verification | Admin/admin, root/root, vendor defaults |
| **Technology Detection** | 500+ | Framework, CMS, and server identification | WordPress, Drupal, Apache, nginx versions |
| **DNS** | 200+ | Zone transfer, subdomain takeover, DNS hijack | CNAME takeover, NS delegation issues |
| **Network** | 300+ | [Protocol](/glossary/protocol/)-level vulnerability checks | SSH, FTP, SMTP, SMB, RDP weaknesses |
| **Headless** | 100+ | Browser-based checks requiring JS execution | XSS detection, DOM-based vulnerabilities |
| **Code** | 150+ | Static analysis patterns | Hardcoded secrets, insecure configurations |
| **Workflows** | 50+ | Multi-step detection sequences | Chained vulnerability verification |

### Template Severity Distribution

| Severity | Count | Description |
|----------|-------|-------------|
| Critical | 500+ | Remote code execution, authentication bypass, data exposure |
| High | 1,200+ | Privilege escalation, significant information disclosure |
| Medium | 2,000+ | Moderate impact vulnerabilities, misconfigurations |
| Low | 1,500+ | Informational findings, minor misconfigurations |
| Info | 1,800+ | Technology detection, version identification |

## API Integration

Nuclei is a command-line tool and does not provide a REST API. Integration with the Prismatic Platform uses the nuclei binary as a subprocess with structured JSON output.

### Command-Line Interface

| Flag | Description | Example |
|------|-------------|---------|
| `-target` / `-u` | Single target URL | `-u https://example.com` |
| `-list` / `-l` | File with list of targets | `-l targets.txt` |
| `-templates` / `-t` | Template directory or file | `-t cves/ -t misconfig/` |
| `-tags` | Filter templates by tags | `-tags cve,rce,sqli` |
| `-severity` | Filter by severity level | `-severity critical,high` |
| `-output` / `-o` | Output file path | `-o results.json` |
| `-json` / `-j` | JSON output format | `-j` |
| `-rate-limit` / `-rl` | Max requests per second | `-rl 50` |
| `-bulk-size` / `-bs` | Parallel host processing | `-bs 25` |
| `-concurrency` / `-c` | Number of concurrent templates | `-c 25` |
| `-header` / `-H` | Custom HTTP headers | `-H "Authorization: Bearer TOKEN"` |
| `-proxy` | HTTP/SOCKS5 proxy | `-proxy http://127.0.0.1:8080` |
| `-interactsh-url` | OOB interaction server | `-interactsh-url https://interact.sh` |
| `-silent` | Suppress banner and info output | `-silent` |

### Template YAML Structure

```yaml
id: example-cve-detection
info:
  name: Example CVE-2024-XXXX Detection
  author: prismatic-security
  severity: critical
  description: |
    Detects Example vulnerability allowing remote code execution.
  reference:
    - https://nvd.nist.gov/vuln/detail/CVE-2024-XXXX
  classification:
    cvss-metrics: CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H
    cvss-score: 9.8
    cve-id: CVE-2024-XXXX
    cwe-id: CWE-94
  tags: cve,cve2024,rce,example
  metadata:
    max-request: 2
    vendor: example
    product: example-server

http:
  - method: GET
    path:
      - "{{BaseURL}}/vulnerable-endpoint"
    matchers-condition: and
    matchers:
      - type: status
        status: [200]
      - type: word
        words:
          - "vulnerable_marker_string"
        part: body
    extractors:
      - type: regex
        part: body
        group: 1
        regex:
          - 'version["\s:]+([0-9.]+)'
```

## Query Examples

### Command-Line Usage

```bash
# Scan single target with all templates
nuclei -u https://example.com -t nuclei-templates/

# Scan with specific CVE templates only
nuclei -u https://example.com -t cves/ -severity critical,high

# Technology detection scan
nuclei -u https://example.com -t technologies/ -j -o tech-results.json

# Scan multiple targets from file
nuclei -l targets.txt -t misconfig/ -rl 50 -bs 25

# Check for specific CVE
nuclei -u https://example.com -t cves/2024/CVE-2024-3400.yaml

# Scan with tag filters
nuclei -u https://example.com -tags rce,sqli,lfi -severity critical

# Authenticated scan with custom headers
nuclei -u https://example.com -t cves/ \
  -H "Authorization: Bearer eyJ..." \
  -H "Cookie: session=abc123"

# Scan through proxy (Burp Suite)
nuclei -u https://example.com -t cves/ -proxy http://127.0.0.1:8080

# Export results in SARIF format (for CI/CD integration)
nuclei -u https://example.com -t cves/ -sarif -o results.sarif
```

### Elixir Integration

```elixir
# Run nuclei scan against target
{:ok, results} = PrismaticOsint.Nuclei.scan("example.com",
  templates: [:cves, :misconfig],
  severity: [:critical, :high],
  rate_limit: 50
)
# => %{
#   total_findings: 5,
#   critical: 1,
#   high: 4,
#   findings: [
#     %{template_id: "CVE-2024-3400", severity: :critical,
#       matched_at: "https://example.com/api/v1/...",
#       info: "PAN-OS GlobalProtect RCE"}
#   ]
# }

# Check for specific CVE across multiple hosts
hosts = ["example1.com", "example2.com", "example3.com"]
{:ok, results} = PrismaticOsint.Nuclei.check_cve(hosts, "CVE-2024-3400")
# => %{vulnerable: ["example1.com"], safe: ["example2.com", "example3.com"]}

# Technology detection scan
{:ok, tech} = PrismaticOsint.Nuclei.detect_tech("example.com")
# => %{technologies: [
#   %{name: "nginx", version: "1.24.0", category: "web-server"},
#   %{name: "WordPress", version: "6.4.2", category: "cms"},
#   %{name: "PHP", version: "8.2", category: "language"}
# ]}

# Custom template scan
{:ok, results} = PrismaticOsint.Nuclei.scan("example.com",
  template_path: "/custom/templates/org-specific-check.yaml",
  json_output: true
)

# Scheduled vulnerability assessment
{:ok, schedule} = PrismaticOsint.Nuclei.schedule_scan(
  targets: ["example.com", "api.example.com"],
  templates: [:cves],
  severity: [:critical, :high],
  frequency: :daily,
  notify: :webhook
)
```

## Data Schema

| Field | Type | Description |
|-------|------|-------------|
| `template_id` | string | Unique template identifier |
| `template_path` | string | Path to template file |
| `info.name` | string | Human-readable vulnerability name |
| `info.severity` | enum | `critical`, `high`, `medium`, `low`, `info` |
| `info.description` | string | Detailed vulnerability description |
| `info.classification.cve_id` | string | CVE identifier (if applicable) |
| `info.classification.cvss_score` | float | CVSS v3.1 score |
| `info.classification.cwe_id` | string | CWE weakness identifier |
| `info.tags` | array | Classification tags |
| `matched_at` | string | URL/endpoint where vulnerability was found |
| `ip` | string | Target IP address |
| `host` | string | Target hostname |
| `port` | string | Target port |
| `type` | enum | `http`, `dns`, `network`, `headless`, `code` |
| `timestamp` | datetime | When the finding was detected |
| `extracted_results` | array | Data extracted by template extractors |
| `curl_command` | string | Reproducible curl command for verification |

## Use Cases

### Vulnerability Assessment

Nuclei provides rapid scanning of web applications against thousands of known CVEs. Security teams run nuclei as part of regular vulnerability assessments, generating findings that can be triaged and remediated. The YAML template format makes it easy to understand exactly what each check does, reducing false positive investigation time.

### Attack Surface Reduction

By scanning for exposed admin panels, default credentials, and misconfigured services, nuclei helps organizations identify and remediate low-hanging security issues. These findings often represent the path of least resistance for attackers and should be addressed as part of [attack surface](/glossary/attack-surface/) hardening programs.

### CI/CD Security Integration

Nuclei's command-line interface and SARIF output format enable integration into CI/CD pipelines. Security teams configure nuclei to run against staging environments before deployment, blocking releases that introduce known vulnerabilities. The `-severity` flag enables enforcement policies (e.g., block on critical/high findings).

### Compliance Checking

Templates for security header verification, SSL/[TLS](/glossary/tls/) configuration, and exposed sensitive files support compliance assessments against standards like PCI DSS, HIPAA, and NIST. Custom templates can encode organization-specific compliance requirements.

### Bug Bounty Research

Security researchers use nuclei as a first-pass scanner against bug bounty targets, rapidly identifying known vulnerabilities and misconfigurations before investing time in manual testing. The community-driven template library ensures coverage of recently disclosed vulnerabilities.

## Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **Active scanning** | Generates traffic to targets; may trigger alerts | Obtain authorization; use rate limiting; scan during maintenance windows |
| **False positives** | Some templates may match on benign conditions | Verify findings manually; tune templates; use confidence scoring |
| **No exploitation** | Detection only; does not verify exploitability | Follow up with manual testing or exploitation frameworks for confirmation |
| **Template lag** | New CVEs may not have templates immediately | Write custom templates; contribute to community repository |
| **Rate limiting by targets** | Aggressive scanning may trigger WAF/rate limits | Use `-rl` and `-bs` flags; implement delays |
| **Authentication limitations** | Complex auth flows may require custom handling | Use `-H` for tokens; develop custom templates for auth flows |

## Legal and Ethical Considerations

**Authorization Required**: Nuclei is an active vulnerability scanner that sends requests to target systems. Scanning without explicit authorization is illegal in most jurisdictions under computer fraud and unauthorized access laws. Always obtain written authorization before scanning.

**Scope Compliance**: Ensure all scanned targets fall within the authorized scope. Nuclei can follow redirects and discover related hosts, potentially scanning out-of-scope systems. Use scope limitations and target whitelisting.

**Responsible Disclosure**: Vulnerabilities discovered through nuclei scanning should be reported through appropriate channels -- either to the asset owner directly or through coordinated vulnerability disclosure programs.

**Rate Limiting**: Aggressive scanning can impact target availability. Use appropriate rate limits to avoid denial-of-service conditions, even against authorized targets.

## Integration with Prismatic Platform

Within the [Prismatic Platform](/apps/prismatic/), Nuclei serves as the primary active vulnerability assessment engine for [Prismatic Perimeter](/apps/prismatic-perimeter/) EASM operations.

- **Automated Assessment**: Discovered assets from [Shodan](/osint/shodan/), [Censys](/osint/censys/), and [SecurityTrails](/osint/securitytrails/) are automatically queued for nuclei scanning to identify actionable vulnerabilities.
- **Template Management**: The platform maintains a curated template library combining community templates with organization-specific checks, updated daily from the nuclei-templates repository.
- **Finding Correlation**: Nuclei findings are correlated with passive vulnerability intelligence from [NVD](/osint/nvd/) and [OSV.dev](/osint/osv-dev/) to provide comprehensive vulnerability context.
- **Risk Scoring**: Vulnerability findings contribute to the security rating (A-F grade) in Prismatic Perimeter, weighted by CVSS score and exploitability.
- **Compliance Mapping**: Findings are mapped to compliance frameworks ([NIS2](/glossary/nis2/), ZKB, OWASP) for automated compliance reporting.

## Best Practices

1. **Always obtain authorization**: Never scan targets without explicit written permission. Unauthorized scanning is illegal.

2. **Start with technology detection**: Run info-level technology templates first to understand the target stack, then apply CVE templates for detected technologies.

3. **Use severity filters**: For initial triage, focus on critical and high severity findings. Address medium and low findings in subsequent assessment cycles.

4. **Rate limit appropriately**: Start with conservative rate limits (10-20 req/sec) and increase based on target capacity.

5. **Verify critical findings**: Always manually verify critical severity findings before reporting. False positives in critical findings waste incident response resources.

6. **Keep templates updated**: Run `nuclei -update-templates` regularly to get new CVE templates as they are published.

7. **Write custom templates**: Develop templates for organization-specific applications and configurations not covered by community templates.

8. **Integrate with CI/CD**: Use SARIF output and severity-based exit codes to integrate nuclei into deployment pipelines.

## Related Providers

- [NVD](/osint/nvd/) - National Vulnerability Database for CVE details
- [Exploit-DB](/osint/exploit-db/) - Exploit database with proof-of-concepts
- [Shodan](/osint/shodan/) - Pre-scanned internet asset data
- [MITRE ATT&CK](/osint/mitre-attack/) - TTP mapping for findings
- [FullHunt](/osint/fullhunt/) - Attack surface discovery platform
- [OSV.dev](/osint/osv-dev/) - Open source vulnerability database
- [Netlas](/osint/netlas/) - Internet intelligence for target discovery

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)