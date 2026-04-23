+++
title = "/security-audit"
weight = 180
[extra]
category = "Development"
description = "Comprehensive application security audit and vulnerability scan"
syntax = "/security-audit [options]"
authority = "L3"
agent = "security-audit-specialist"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1184
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["security-audit", "Comprehensive", "commands", "Development", "Prismatic Platform", "Phase", "Elixir", "Color Team"]
tags = ["commands", "development", "security-audit", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/security-audit - Prismatic Platform"
+++

## Overview

**/security-audit** is a production command in the **Development** category of the Prismatic Platform. It performs comprehensive security audits across the entire umbrella application, scanning for vulnerabilities, misconfigurations, dependency risks, authentication weaknesses, and compliance gaps. The command orchestrates multiple security analysis engines -- static analysis, dependency auditing, configuration review, and runtime behavior assessment -- to produce a unified security posture report with actionable remediation guidance.

This command operates under the **L3** authority level and is executed by the `security-audit-specialist` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The L3 authority level reflects the elevated privilege required: security audits need read access to configuration files, environment variable references, authentication modules, and cryptographic implementations that are normally restricted.

In a platform with 90+ umbrella applications, 6,652 Elixir source files, and multiple external integrations (PostgreSQL, Redis, Meilisearch, KuzuDB, Ollama), the attack surface is substantial. `/security-audit` systematically examines this surface, applying OWASP Top 10 checks, Elixir-specific vulnerability patterns, Phoenix framework security best practices, and custom rules derived from the platform's operational history. The command integrates with the [Color Teams](@/glossary/color-teams.md) security infrastructure, feeding findings to the [Blue Team](@/glossary/blue-team.md) for defensive posture assessment and the [Red Team](@/glossary/red-team.md) for adversarial scenario generation.

## Architecture

The security audit system operates as a multi-engine analysis pipeline that examines the codebase through complementary security lenses.

### Audit Architecture

```
             /security-audit
                    |
           Audit Orchestrator
                    |
          +--------+--------+--------+
          |        |        |        |
       Static    Dependency Config   Runtime
       Analysis  Audit     Review    Analysis
          |        |        |        |
    +-----+--+ +--+--+ +--+--+ +---+---+
    |    |   | |  |  | |  |  | |   |   |
   AST  Taint Hex Mix  Env Plug Auth Socket
   Scan  Track Aud Aud  Var Pipe Check  Check
    |    |   | |  |  | |  |  | |   |   |
    +----+---+-+--+--+-+--+--+-+---+---+
                    |
           Finding Correlator
                    |
          +--------+--------+
          |        |        |
       Critical  Medium   Advisory
       Findings  Findings Findings
          |        |        |
          +--------+--------+
                    |
           Security Report Generator
```

### Audit Engines

| Engine | Focus | Technique | Coverage |
|--------|-------|-----------|----------|
| **Static Analysis** | Source code vulnerabilities | AST pattern matching, taint tracking | All .ex/.exs files |
| **Dependency Audit** | Third-party package risks | Hex advisory database, CVE correlation | All Mix dependencies |
| **Configuration Review** | Misconfigurations | Config file analysis, secret detection | config/, .env, runtime |
| **Runtime Analysis** | Behavioral security | Process inspection, socket analysis | Running application |
| **Authentication Audit** | Auth/authz weaknesses | Plug pipeline analysis, session review | All auth modules |
| **Cryptographic Review** | Crypto implementation | Algorithm verification, key management | Crypto modules |

### Vulnerability Categories

| Category | OWASP Mapping | Elixir-Specific Patterns |
|----------|---------------|--------------------------|
| **Injection** | A03:2021 | Unsafe `String.to_atom/1`, SQL injection via raw queries |
| **Broken Auth** | A07:2021 | Missing plug pipeline auth, session fixation |
| **Sensitive Data** | A02:2021 | Hardcoded secrets, unencrypted PII in logs |
| **Security Misconfig** | A05:2021 | Debug mode in production, permissive CORS |
| **Vulnerable Deps** | A06:2021 | Known CVEs in Hex packages, outdated dependencies |
| **Broken Access** | A01:2021 | Missing authorization checks, IDOR patterns |
| **Crypto Failures** | A02:2021 | Weak algorithms, predictable tokens, missing HMAC |

## Usage

```bash
# Full security audit across all applications
/security-audit

# Audit specific application
/security-audit --app prismatic_web

# Focus on specific vulnerability category
/security-audit --category injection

# Run dependency audit only
/security-audit --engine dependencies

# OWASP Top 10 focused audit
/security-audit --owasp-top-10

# Export findings as JSON
/security-audit --format json --export ./security-report.json

# Audit with severity threshold
/security-audit --min-severity high

# Show remediation guidance
/security-audit --remediation

# Dry run showing audit plan
/security-audit --dry-run

# Compare against previous audit baseline
/security-audit --compare-baseline
```

### Practical Examples

```bash
# Pre-deployment security verification
/security-audit --min-severity medium --format json --export ./pre-deploy-security.json

# Audit authentication and authorization specifically
/security-audit --category auth --app prismatic_web --verbose

# Dependency vulnerability check with CVE details
/security-audit --engine dependencies --verbose --remediation

# Configuration security review for production readiness
/security-audit --engine config --environment production

# Full OWASP compliance audit with remediation plan
/security-audit --owasp-top-10 --remediation --format markdown --export ./owasp-audit.md

# Audit new code changes only (since last commit)
/security-audit --since HEAD~1 --verbose
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--app` | `string` | all | Specific application to audit |
| `--engine` | `enum` | all | Audit engine: `static`, `dependencies`, `config`, `runtime`, `auth`, `crypto`, `all` |
| `--category` | `enum` | all | Vulnerability category: `injection`, `auth`, `data`, `misconfig`, `deps`, `access`, `crypto`, `all` |
| `--min-severity` | `enum` | `info` | Minimum severity: `info`, `low`, `medium`, `high`, `critical` |
| `--owasp-top-10` | `flag` | false | Run OWASP Top 10 focused audit |
| `--format` | `enum` | `text` | Output format: `text`, `json`, `markdown`, `sarif` |
| `--export` | `path` | none | Export findings to file |
| `--remediation` | `flag` | false | Include remediation guidance for each finding |
| `--verbose` | `flag` | false | Detailed finding descriptions with code snippets |
| `--dry-run` | `flag` | false | Show audit plan without executing |
| `--compare-baseline` | `flag` | false | Compare against saved baseline |
| `--since` | `string` | all | Audit only files changed since reference |
| `--environment` | `enum` | `dev` | Target environment context: `dev`, `staging`, `production` |
| `--parallel` | `integer` | 4 | Number of parallel audit workers |
| `--exclude` | `string` | none | Patterns to exclude from audit |
| `--color-team-feed` | `flag` | false | Feed findings to Color Team infrastructure |

## Execution Flow

### Phase 1: Scope Definition

The orchestrator determines audit scope based on options. For full audits, all 90+ umbrella applications are enumerated. For targeted audits, the scope is restricted to specified applications, engines, or categories. File enumeration uses [Git Trees](@/glossary/git-trees.md) for performance.

### Phase 2: Static Analysis

Source files are parsed into ASTs and analyzed for vulnerability patterns. The static analyzer maintains a library of 150+ Elixir-specific vulnerability patterns including unsafe atom creation, SQL injection via `Ecto.Adapters.SQL.query/3` with string interpolation, missing input validation, and unsafe deserialization. Taint tracking follows data flow from external inputs (controller params, socket assigns) through processing to sinks (database queries, system calls).

### Phase 3: Dependency Audit

All Mix dependencies are checked against the Hex advisory database and the National Vulnerability Database (NVD). Each dependency is assessed for known CVEs, maintenance status (last update, open issues), and license compliance. Transitive dependencies are included in the analysis.

### Phase 4: Configuration Review

Configuration files (`config/config.exs`, `config/runtime.exs`, `config/prod.exs`) are analyzed for security misconfigurations. The reviewer checks for hardcoded secrets, debug mode in production configs, permissive CORS policies, missing CSP headers, weak session settings, and insecure cookie configuration.

### Phase 5: Authentication and Authorization Audit

Phoenix plug pipelines are analyzed to verify that all routes have appropriate authentication and authorization checks. The audit identifies routes missing auth plugs, inconsistent authorization patterns, session configuration weaknesses, and token management issues.

### Phase 6: Finding Correlation and Reporting

All findings from individual engines are correlated to identify compound vulnerabilities (where multiple low-severity findings combine into a high-severity risk). Findings are deduplicated, severity-scored, and organized into a structured report with remediation guidance.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/color-team](@/commands/color-team.md) | Downstream | Findings feed Color Team security operations |
| [/blue-team](@/commands/blue-team.md) | Consumer | Blue Team uses findings for defensive posture |
| [/red-team](@/commands/red-team.md) | Consumer | Red Team uses findings for adversarial scenarios |
| [/quality-gates](@/commands/quality-gates.md) | Enforcement | Security findings block quality gate passage |
| [/route-test](@/commands/route-test.md) | Peer | Route testing complements security analysis |
| [/verify-patterns](@/commands/verify-patterns.md) | Peer | Pattern verification includes security patterns |
| [Prismatic Perimeter](@/apps/prismatic-perimeter.md) | Consumer | EASM uses internal security posture data |
| [Telemetry](@/glossary/telemetry.md) | Monitoring | Audit execution metrics and finding trends |

## Best Practices

### Regular Audit Cadence

Run full security audits weekly and targeted audits after every significant code change. The `--since` option enables efficient incremental auditing that focuses on newly introduced code without rescanning the entire codebase.

### Dependency Monitoring

Use `--engine dependencies` as part of the CI/CD pipeline. New dependency additions and version updates should trigger automatic dependency audits. Pin dependency versions in `mix.lock` and review all updates for security implications.

### Pre-Deployment Gates

Integrate `/security-audit --min-severity high` as a blocking gate in the deployment pipeline. No deployment should proceed with unaddressed high or critical severity findings. Medium severity findings should be tracked and remediated within defined SLAs.

### Color Team Integration

Enable `--color-team-feed` for comprehensive audits to automatically route findings to the Color Team infrastructure. This enables the Blue Team to update defensive postures and the Red Team to develop adversarial scenarios based on real findings.

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `PARSE_FAILURE` | Cannot parse source file AST | Check file for syntax errors |
| `HEX_ADVISORY_UNAVAILABLE` | Cannot reach Hex advisory database | Check network; use cached advisories |
| `CONFIG_ACCESS_DENIED` | Insufficient permission for config files | Verify L3 authority level |
| `RUNTIME_NOT_AVAILABLE` | Application not running for runtime analysis | Start application or skip runtime engine |
| `BASELINE_NOT_FOUND` | No saved baseline for comparison | Run initial audit without `--compare-baseline` |
| `TAINT_ANALYSIS_TIMEOUT` | Taint tracking exceeded time limit | Narrow scope or increase timeout |
| `CVE_DATABASE_STALE` | CVE database older than 7 days | Update with `--refresh-cve-db` |

## Advanced Usage

### Custom Vulnerability Rules

Add project-specific vulnerability patterns:

```bash
/security-audit --custom-rules ./security-rules/prismatic-rules.yaml
```

### SARIF Export for IDE Integration

Generate SARIF (Static Analysis Results Interchange Format) for IDE integration:

```bash
/security-audit --format sarif --export ./security-results.sarif
```

### Compliance-Focused Audits

Run audits targeting specific compliance frameworks:

```bash
# NIS2 compliance focused audit
/security-audit --compliance nis2 --format markdown --export ./nis2-audit.md

# GDPR data protection audit
/security-audit --compliance gdpr --category data --verbose
```

### Automated Remediation

For low-risk findings with known safe fixes, enable auto-remediation:

```bash
/security-audit --auto-fix --max-severity low --dry-run
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Every vulnerability pattern is checked without exception, and critical findings block downstream operations.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every finding includes source location, evidence, confidence score, and traceable remediation steps.

## Related Commands

- [/code](@/commands/code.md) - Core coding implementation and feature development
- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)
- [/test](@/commands/test.md) - Comprehensive test generation and verification
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/route-test](@/commands/route-test.md) - Route testing and HTTP endpoint verification
- [/color-team](@/commands/color-team.md) - Color team status overview across all 6 teams
- [/verify-patterns](@/commands/verify-patterns.md) - Pattern matching audit for file, module or entire codebase
- [/regression-check](@/commands/regression-check.md) - Execute 25 custom [Credo](@/glossary/credo.md) regression checks preventing 700+ violations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)