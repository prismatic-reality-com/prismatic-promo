+++
title = "OSV.dev"
weight = 59
[extra]
category = "global"
type = "vulnerability"
module = "OsvDev"
description = "Google's open source vulnerability database with ecosystem-specific advisories"
has_api = true
url = "https://osv.dev"
rate_limit = "No rate limit, open API"
capabilities = ["Vulnerability Search", "Package Scanning", "Ecosystem Coverage", "SBOM Analysis", "Dependency Checking", "Advisory Aggregation"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1327
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["OSVdev", "Googles", "osint", "global", "Prismatic Platform", "Comprehensive"]
tags = ["osint", "global", "osvdev", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "OSV.dev - Prismatic Platform"
+++

## Overview

OSV.dev is Google's open-source vulnerability database that aggregates vulnerability advisories from multiple ecosystems into a unified, machine-readable format. It covers vulnerabilities in open-source packages across all major ecosystems including npm, PyPI, crates.io, [Hex](/glossary/hex/), Go, Maven, and more. OSV provides precise version-level affected ranges, making it ideal for automated dependency scanning and software composition analysis.

The OSV project addresses a fundamental problem in vulnerability management: vulnerability data is scattered across dozens of ecosystem-specific advisory databases, each with different formats, identifiers, and version specifications. OSV aggregates these sources into a single API with a consistent schema, enabling tools to check dependencies against all known vulnerabilities without querying multiple databases. This aggregation is particularly valuable for polyglot projects that span multiple language ecosystems.

OSV distinguishes itself from the National Vulnerability Database ([NVD](/osint/nvd/)) through its focus on precise, machine-actionable affected version ranges. While NVD provides CPE-based matching that often requires manual interpretation, OSV specifies exact version ranges per ecosystem package, enabling fully automated vulnerability detection with minimal false positives. The OSV schema has been adopted by numerous vulnerability databases and security tools as a standard interchange format.

The database is completely open -- all data is freely available through the API, web interface, and bulk data exports. There are no rate limits, no authentication requirements, and no usage restrictions. This makes OSV an ideal data source for building security tools and integrating vulnerability intelligence into development workflows.

## Data Sources and Coverage

OSV aggregates advisories from ecosystem-specific databases, each covering vulnerabilities in their respective package ecosystems.

| Source Database | Ecosystem | Coverage | Advisory Count |
|----------------|-----------|----------|---------------|
| **GitHub Advisory Database (GHSA)** | npm, PyPI, Maven, Go, Rust, Ruby, NuGet, Pub | Multi-ecosystem | 20,000+ |
| **RustSec** | crates.io (Rust) | Comprehensive | 500+ |
| **PyPI Advisory Database** | PyPI (Python) | Comprehensive | 2,000+ |
| **Go Vulnerability Database** | Go modules | Comprehensive | 1,000+ |
| **Linux Kernel CVEs** | Linux kernel | Comprehensive | 5,000+ |
| **Debian Security Tracker** | Debian packages | Comprehensive | 10,000+ |
| **Alpine SecDB** | Alpine Linux packages | Comprehensive | 3,000+ |
| **OSS-Fuzz** | C/C++ projects in OSS-Fuzz | Automated fuzzing findings | 10,000+ |
| **Hex.pm Advisory** | [Hex](/glossary/hex/) ([Elixir](/glossary/elixir/)/Erlang) | Growing | 100+ |
| **NVD** | Cross-ecosystem via CPE | Broad but less precise | 200,000+ |
| **Ubuntu Security Notices** | Ubuntu packages | Comprehensive | 5,000+ |
| **Rocky Linux** | Rocky Linux packages | Comprehensive | 2,000+ |
| **AlmaLinux** | AlmaLinux packages | Comprehensive | 2,000+ |
| **Packagist** | PHP Composer packages | Growing | 1,000+ |
| **Pub.dev** | Dart/Flutter packages | Growing | 200+ |
| **Bitnami** | Bitnami containers | Comprehensive | 1,000+ |
| **Haskell** | Hackage packages | Growing | 100+ |
| **Android** | Android framework | Comprehensive | 3,000+ |

### OSV Schema

The OSV vulnerability format is an open standard for describing vulnerabilities in software.

```json
{
  "id": "GHSA-xxxx-yyyy-zzzz",
  "summary": "Cross-Site Scripting in Example Package",
  "details": "Detailed description of the vulnerability...",
  "aliases": ["CVE-2024-12345"],
  "modified": "2024-06-15T00:00:00Z",
  "published": "2024-06-10T00:00:00Z",
  "database_specific": {},
  "references": [
    {"type": "ADVISORY", "url": "https://..."},
    {"type": "FIX", "url": "https://github.com/.../commit/..."}
  ],
  "affected": [
    {
      "package": {
        "name": "example-package",
        "ecosystem": "npm"
      },
      "ranges": [
        {
          "type": "SEMVER",
          "events": [
            {"introduced": "1.0.0"},
            {"fixed": "1.5.3"}
          ]
        }
      ],
      "versions": ["1.0.0", "1.1.0", "1.2.0", "..."],
      "ecosystem_specific": {},
      "database_specific": {}
    }
  ],
  "severity": [
    {
      "type": "CVSS_V3",
      "score": "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N"
    }
  ]
}
```

## API Integration

OSV provides a completely open REST API at `https://api.osv.dev/` with JSON responses. No authentication or API keys are required. There are no rate limits.

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/vulns/{id}` | GET | Get vulnerability by ID |
| `/v1/query` | POST | Query vulnerabilities for a package/version |
| `/v1/querybatch` | POST | Batch query for multiple packages |
| `/v1/vulns` | GET | List vulnerabilities (with filters) |

### Query Formats

| Query Type | Description | Use Case |
|-----------|-------------|----------|
| **Package + Version** | Check specific version of a package | CI/CD scanning |
| **Package only** | List all vulnerabilities for a package | Security audit |
| **Commit hash** | Check if a commit is affected | Git-based scanning |
| **PURL** | Package URL for ecosystem-agnostic queries | SBOM processing |

## Query Examples

### curl Examples

```bash
# Query vulnerability by ID
curl "https://api.osv.dev/v1/vulns/GHSA-xxxx-yyyy-zzzz"

# Query vulnerabilities for a specific package version
curl -X POST "https://api.osv.dev/v1/query" \
  -H "Content-Type: application/json" \
  -d '{
    "package": {
      "name": "phoenix",
      "ecosystem": "Hex"
    },
    "version": "1.7.0"
  }'

# Batch query for multiple dependencies
curl -X POST "https://api.osv.dev/v1/querybatch" \
  -H "Content-Type: application/json" \
  -d '{
    "queries": [
      {"package": {"name": "phoenix", "ecosystem": "Hex"}, "version": "1.7.0"},
      {"package": {"name": "ecto", "ecosystem": "Hex"}, "version": "3.11.0"},
      {"package": {"name": "plug", "ecosystem": "Hex"}, "version": "1.15.0"}
    ]
  }'

# Query by commit hash (for C/C++ projects)
curl -X POST "https://api.osv.dev/v1/query" \
  -H "Content-Type: application/json" \
  -d '{"commit": "abc123def456..."}'

# Query by Package URL (PURL)
curl -X POST "https://api.osv.dev/v1/query" \
  -H "Content-Type: application/json" \
  -d '{"package": {"purl": "pkg:hex/phoenix@1.7.0"}}'

# Search for vulnerabilities by keyword
curl "https://api.osv.dev/v1/vulns?q=sql+injection&ecosystem=npm"

# Download all vulnerabilities for an ecosystem
curl -O "https://osv-vulnerabilities.storage.googleapis.com/Hex/all.zip"
```

### Elixir Integration

```elixir
# Query vulnerability by ID
{:ok, vuln} = PrismaticOsint.OsvDev.get("GHSA-xxxx-yyyy-zzzz")
# => %{
#   id: "GHSA-xxxx-yyyy-zzzz",
#   summary: "SQL Injection in example-package",
#   severity: %{cvss_v3: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H", score: 9.8},
#   affected: [%{package: "example-package", ecosystem: "Hex",
#     introduced: "1.0.0", fixed: "1.5.3"}],
#   aliases: ["CVE-2024-12345"],
#   references: [%{type: :advisory, url: "https://..."}]
# }

# Scan a specific package version
{:ok, vulns} = PrismaticOsint.OsvDev.query(
  ecosystem: "Hex",
  package: "phoenix",
  version: "1.7.0"
)
# => %{vulns: [], count: 0}  # No known vulnerabilities

# Batch scan all dependencies from mix.lock
{:ok, report} = PrismaticOsint.OsvDev.scan_lockfile("mix.lock")
# => %{
#   total_packages: 45,
#   vulnerable: 2,
#   results: [
#     %{package: "some_dep", version: "0.9.2",
#       vulnerabilities: [%{id: "GHSA-...", severity: :high, fixed: "0.9.5"}]}
#   ]
# }

# Scan SBOM (CycloneDX format)
{:ok, report} = PrismaticOsint.OsvDev.scan_sbom("bom.json", format: :cyclonedx)

# Search across ecosystems
{:ok, results} = PrismaticOsint.OsvDev.search("sql injection", ecosystem: "Hex")

# Monitor for new vulnerabilities affecting your stack
{:ok, monitor} = PrismaticOsint.OsvDev.monitor_packages([
  %{name: "phoenix", ecosystem: "Hex"},
  %{name: "ecto", ecosystem: "Hex"},
  %{name: "plug", ecosystem: "Hex"}
], notify: :webhook)

# Get ecosystem-wide vulnerability statistics
{:ok, stats} = PrismaticOsint.OsvDev.ecosystem_stats("Hex")
# => %{total_vulns: 127, by_severity: %{critical: 5, high: 23, medium: 54, low: 45}}
```

## Data Schema

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique vulnerability identifier (GHSA, OSV, RUSTSEC, etc.) |
| `summary` | string | One-line vulnerability description |
| `details` | string | Detailed markdown description |
| `aliases` | array | Alternative IDs (CVE, etc.) |
| `modified` | datetime | Last modification timestamp |
| `published` | datetime | Initial publication timestamp |
| `withdrawn` | datetime | Withdrawal timestamp (if retracted) |
| `affected[].package.name` | string | Package name |
| `affected[].package.ecosystem` | string | Package ecosystem (npm, Hex, PyPI, etc.) |
| `affected[].ranges[].type` | enum | `SEMVER`, `ECOSYSTEM`, `GIT` |
| `affected[].ranges[].events` | array | Version events (introduced, fixed, last_affected, limit) |
| `affected[].versions` | array | Explicit list of affected versions |
| `severity[].type` | string | Severity system (`CVSS_V3`, `CVSS_V2`) |
| `severity[].score` | string | CVSS vector string |
| `references[].type` | enum | `ADVISORY`, `ARTICLE`, `DETECTION`, `FIX`, `REPORT`, `WEB` |
| `references[].url` | string | Reference URL |
| `credits[].name` | string | Vulnerability reporter/discoverer |
| `database_specific` | object | Source database-specific metadata |

## Use Cases

### Supply Chain Security

OSV enables comprehensive dependency scanning across polyglot projects. By checking all dependencies against the aggregated vulnerability database, development teams identify known vulnerabilities before they reach production. The precise version range specifications minimize false positives that plague CPE-based scanning.

### Elixir/Hex Security

For [Elixir](/glossary/elixir/) and Erlang projects, OSV provides vulnerability coverage through the Hex advisory database. Teams integrate OSV queries into their [mix](/glossary/mix/) build process, checking hex.pm packages against known vulnerabilities. This is particularly important for the Prismatic Platform's extensive Hex dependency tree.

### CI/CD Integration

OSV's open API and lack of rate limits make it ideal for CI/CD integration. Every build can check its dependency tree against the latest vulnerability data without worrying about API quotas or authentication complexity. The `osv-scanner` CLI tool provides direct integration with common CI platforms.

### SBOM Analysis

OSV supports CycloneDX and SPDX Software Bill of Materials formats, enabling vulnerability scanning of software inventories without requiring access to source code or lockfiles. This supports compliance with executive orders and regulations requiring SBOM production and analysis.

### Vulnerability Tracking

Development teams use OSV to track the remediation status of known vulnerabilities across their projects. The structured affected version data makes it easy to determine which package upgrades will resolve specific vulnerabilities and whether any transitive dependencies remain affected.

## Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **Advisory aggregation delay** | New advisories may take hours to appear | Monitor source databases directly for critical CVEs |
| **Ecosystem coverage varies** | Some ecosystems have better coverage than others | Supplement with ecosystem-specific tools for critical dependencies |
| **No exploit intelligence** | OSV tracks vulnerabilities, not exploits | Combine with [Exploit-DB](/osint/exploit-db/) for exploit availability |
| **Version range precision** | Some advisories have imprecise version ranges from source | Cross-reference with NVD and vendor advisories |
| **No runtime detection** | Checks package versions, not runtime behavior | Use runtime application security testing (RAST) tools |
| **Limited severity data** | Not all advisories include CVSS scores | Fall back to qualitative severity from advisory text |

## Legal and Ethical Considerations

**Open Data**: OSV data is completely open and freely available. There are no licensing restrictions on using OSV data in commercial or open-source tools.

**Responsible Vulnerability Handling**: While OSV makes vulnerability data publicly accessible, organizations discovering that they are affected by a vulnerability should follow responsible vulnerability management practices -- prioritize remediation based on severity and exposure, and avoid disclosing exploitation details.

**Compliance Requirements**: Several regulatory frameworks (NIS2, PCI DSS 4.0, Executive Order 14028) require organizations to monitor software dependencies for known vulnerabilities. OSV provides the data foundation for compliance with these requirements.

## Integration with Prismatic Platform

Within the [Prismatic Platform](/apps/prismatic/), OSV.dev serves as the primary dependency vulnerability intelligence source.

- **Automated Dependency Scanning**: The platform's build process queries OSV for all Hex, npm, and other ecosystem dependencies, blocking deployments with unresolved critical vulnerabilities.
- **Lockfile Monitoring**: Changes to `mix.lock` trigger automatic OSV scans, alerting teams when new dependencies introduce known vulnerabilities.
- **SBOM Generation and Analysis**: The platform generates CycloneDX SBOMs and scans them against OSV for compliance reporting.
- **Vulnerability Dashboard**: OSV data feeds into the security dashboard in [Prismatic Perimeter](/apps/prismatic-perimeter/), showing dependency vulnerability posture alongside infrastructure findings.
- **Cross-Source Correlation**: OSV findings are correlated with [NVD](/osint/nvd/) CVE data and [Nuclei](/osint/nuclei/) active scanning results for comprehensive vulnerability management.
- **Hex Ecosystem Focus**: Special attention to Hex/[OTP](/glossary/otp/) advisories ensures comprehensive coverage of the platform's Elixir dependency tree.

## Best Practices

1. **Scan on every build**: OSV has no rate limits. Integrate scanning into every CI/CD pipeline run for continuous vulnerability awareness.

2. **Use batch queries**: For projects with many dependencies, use the `/v1/querybatch` endpoint to check all packages in a single request.

3. **Monitor continuously**: Set up monitoring for your dependency list to receive alerts when new vulnerabilities are published.

4. **Check transitive dependencies**: Vulnerabilities in transitive dependencies are equally dangerous. Scan your complete dependency tree, not just direct dependencies.

5. **Track remediation**: Use OSV's fix information to plan upgrade paths. The affected version ranges show exactly which version resolves each vulnerability.

6. **Generate SBOMs**: Maintain current SBOMs for your projects. OSV can scan SBOMs directly, simplifying vulnerability management for complex projects.

7. **Supplement with ecosystem tools**: Use `mix audit` for Hex, `npm audit` for npm, and similar tools alongside OSV for maximum coverage.

8. **Download bulk data for offline use**: For air-gapped environments, download ecosystem-specific vulnerability archives from OSV's Google Cloud Storage bucket.

## Related Providers

- [NVD](/osint/nvd/) - National Vulnerability Database (CVE authority)
- [Exploit-DB](/osint/exploit-db/) - Exploit proof-of-concepts
- [MITRE ATT&CK](/osint/mitre-attack/) - Adversary technique mapping
- [Nuclei](/osint/nuclei/) - Template-based vulnerability scanning
- [VirusTotal](/osint/virustotal/) - Malware and threat analysis
- [Netlas](/osint/netlas/) - Internet intelligence with CVE mapping

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)