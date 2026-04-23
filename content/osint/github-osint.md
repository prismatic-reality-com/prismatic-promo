+++
title = "GitHub OSINT"
weight = 65
[extra]
category = "global"
type = "code"
module = "GithubOsint"
description = "Source code intelligence - leaked secrets, exposed configs, and developer profiling"
has_api = true
url = "https://github.com"
rate_limit = "5,000 req/hour (authenticated)"
capabilities = ["Secret Detection", "Code Search", "Developer Profiling", "Repository Analysis", "Commit History", "Organization Mapping"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1364
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["GitHub", "OSINT", "Source", "global", "Prismatic Platform", "GitHub OSINT", "Medium"]
tags = ["osint", "global", "github-osint", "prismatic"]
quality_score = 74
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "GitHub OSINT - Prismatic Platform"
+++

## Overview

GitHub is the world's largest source code hosting platform, with over 100 million repositories, 400 million contributions per year, and tens of millions of active developers. For [OSINT](/glossary/osint/) analysts, GitHub represents one of the richest publicly accessible intelligence sources available, offering insights that span from technical vulnerability discovery to organizational structure mapping and individual developer profiling. The platform's open-by-default nature means that vast quantities of sensitive information -- including credentials, configuration files, internal documentation, and infrastructure details -- are inadvertently exposed through public repositories.

GitHub OSINT encompasses a broad spectrum of intelligence collection activities. At the most immediately actionable level, it involves scanning for leaked secrets such as API keys, database credentials, authentication tokens, and private cryptographic keys that have been accidentally committed to public repositories. Beyond secret detection, GitHub intelligence includes technology stack identification through dependency analysis, organizational structure mapping through membership and contribution patterns, developer profiling through commit history and social connections, and supply chain analysis through dependency graph examination.

The GitHub API provides comprehensive programmatic access to public repository data, user profiles, organization structures, and code search capabilities. With authenticated requests supporting 5,000 requests per hour, the API enables systematic intelligence collection at scale. The platform's code search functionality, while having some limitations compared to dedicated code search tools, supports operators that enable targeted queries for specific file patterns, code constructs, and string matches across the entire public repository corpus.

For security teams, GitHub OSINT is a critical component of external attack surface management. Leaked credentials discovered on GitHub represent immediate, exploitable vulnerabilities that bypass all other security controls. Studies consistently show that secrets exposed on GitHub are found and exploited by automated scanners within minutes of being pushed, making continuous monitoring essential.

## Data Sources and Intelligence Categories

GitHub provides multiple intelligence vectors, each yielding different types of actionable information:

| Intelligence Category | Source | Data Yielded | Risk Level |
|----------------------|--------|-------------|------------|
| **Secret Leaks** | Code content, commit diffs, gists | API keys, passwords, tokens, private keys | Critical -- immediate exploitation risk |
| **Configuration Exposure** | Repository files | Infrastructure details, service endpoints, internal URLs | High -- reveals architecture |
| **Developer Profiles** | User accounts, contributions | Names, emails, organizations, skill sets, locations | Medium -- enables social engineering |
| **Organization Mapping** | Org members, teams, repositories | Corporate structure, project portfolios, team composition | Medium -- competitive intelligence |
| **Technology Stack** | Dependencies, package files, CI configs | Languages, frameworks, libraries, versions | Medium -- vulnerability surface identification |
| **Commit History** | Git log, diffs, blame | Change patterns, authorship, development timeline | Low-Medium -- process intelligence |
| **Infrastructure Clues** | CI/CD configs, Dockerfiles, deploy scripts | Cloud providers, deployment targets, infrastructure patterns | High -- attack surface details |

### Secret Types Commonly Found

| Secret Type | Search Pattern | Exploitation Risk |
|-------------|---------------|------------------|
| **AWS Access Keys** | `AKIA[0-9A-Z]{16}` | Critical -- full cloud account access |
| **GitHub Tokens** | `ghp_[a-zA-Z0-9]{36}` | High -- repository and organization access |
| **Slack Webhooks** | `hooks.slack.com/services/T` | Medium -- message injection |
| **Database Strings** | `postgres://` or `mysql://` with credentials | Critical -- direct database access |
| **Private Keys** | `-----BEGIN RSA PRIVATE KEY-----` | Critical -- authentication bypass |
| **JWT Secrets** | `JWT_SECRET=` or `SECRET_KEY=` | High -- token forgery |
| **SMTP Credentials** | `smtp_password` or `MAIL_PASSWORD` | Medium -- email system access |
| **API Keys (Generic)** | `api_key=` or `apikey:` in config files | Variable -- depends on service |

## API Integration

The GitHub REST API and GraphQL API provide comprehensive access to public data. The Prismatic Platform adapter leverages both APIs for different collection scenarios.

```elixir
defmodule Prismatic.Osint.GithubOsint do
  @moduledoc """
  GitHub OSINT adapter for source code intelligence collection.

  Provides structured access to GitHub's public data for secret detection,
  developer profiling, organization mapping, and technology assessment.
  Requires GitHub personal access token for authenticated API access.
  """

  @rest_api "https://api.github.com"

  @doc """
  Search for leaked secrets associated with an organization or domain.
  Uses targeted code search patterns for common secret types.
  """
  @spec search_secrets(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def search_secrets(target, opts \\ []) do
    secret_patterns = Keyword.get(opts, :patterns, default_secret_patterns())
    scope = Keyword.get(opts, :scope, :org)

    results =
      Enum.map(secret_patterns, fn {pattern_name, query_template} ->
        query = build_search_query(query_template, target, scope)

        case code_search(query) do
          {:ok, matches} -> {pattern_name, matches}
          {:error, _} -> {pattern_name, []}
        end
      end)

    findings = Enum.filter(results, fn {_name, matches} -> length(matches) > 0 end)

    {:ok, %{
      target: target,
      scope: scope,
      total_findings: Enum.sum(Enum.map(findings, fn {_, m} -> length(m) end)),
      findings_by_type: Map.new(findings),
      severity_summary: calculate_severity_summary(findings),
      source: :github,
      collected_at: DateTime.utc_now()
    }}
  end

  @doc """
  Build a comprehensive developer profile from GitHub public data.
  Aggregates profile information, contributions, and social connections.
  """
  @spec developer_profile(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def developer_profile(username, opts \\ []) do
    with {:ok, user} <- fetch_user(username),
         {:ok, repos} <- fetch_user_repos(username),
         {:ok, events} <- fetch_user_events(username) do
      {:ok, %{
        username: username,
        name: user["name"],
        email: user["email"],
        company: user["company"],
        location: user["location"],
        bio: user["bio"],
        public_repos: user["public_repos"],
        followers: user["followers"],
        following: user["following"],
        created_at: user["created_at"],
        languages: extract_languages(repos),
        organizations: extract_orgs_from_events(events),
        activity_pattern: analyze_activity_pattern(events),
        top_repositories: extract_top_repos(repos),
        email_addresses: extract_commit_emails(repos),
        source: :github,
        collected_at: DateTime.utc_now()
      }}
    end
  end

  @doc """
  Map an organization's structure, members, and technology portfolio.
  Returns comprehensive organizational intelligence.
  """
  @spec org_intelligence(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def org_intelligence(org_name, opts \\ []) do
    with {:ok, org} <- fetch_org(org_name),
         {:ok, members} <- fetch_org_members(org_name),
         {:ok, repos} <- fetch_org_repos(org_name) do
      {:ok, %{
        organization: org_name,
        description: org["description"],
        website: org["blog"],
        public_repos: org["public_repos"],
        member_count: length(members),
        members: Enum.map(members, &Map.take(&1, ["login", "type"])),
        technology_stack: aggregate_technologies(repos),
        repository_portfolio: categorize_repos(repos),
        activity_metrics: calculate_org_activity(repos),
        dependency_landscape: extract_dependencies(repos),
        source: :github,
        collected_at: DateTime.utc_now()
      }}
    end
  end

  @doc """
  Audit a specific repository for security issues.
  Checks for secrets, sensitive files, and security misconfigurations.
  """
  @spec audit_repository(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def audit_repository(repo_path, opts \\ []) do
    [owner, repo] = String.split(repo_path, "/")

    with {:ok, repo_data} <- fetch_repo(owner, repo),
         {:ok, contents} <- fetch_repo_contents(owner, repo),
         {:ok, commits} <- fetch_recent_commits(owner, repo) do
      {:ok, %{
        repository: repo_path,
        sensitive_files: scan_for_sensitive_files(contents),
        exposed_secrets: scan_for_secrets_in_commits(commits),
        security_features: check_security_features(owner, repo),
        dependency_risks: analyze_dependency_security(contents),
        contributor_emails: extract_contributor_emails(commits),
        branch_protection: check_branch_protection(owner, repo),
        source: :github,
        collected_at: DateTime.utc_now()
      }}
    end
  end

  defp default_secret_patterns do
    [
      {:aws_keys, "AKIA"},
      {:github_tokens, "ghp_"},
      {:private_keys, "BEGIN RSA PRIVATE KEY"},
      {:database_urls, "postgres://"},
      {:slack_webhooks, "hooks.slack.com/services"},
      {:jwt_secrets, "JWT_SECRET"},
      {:smtp_passwords, "SMTP_PASSWORD"},
      {:env_files, "filename:.env"}
    ]
  end
end
```

## Search Operators and Query Patterns

GitHub's code search supports operators for targeted intelligence collection:

```bash
# Find AWS keys in an organization's repos
AKIA filename:.env org:target-org

# Discover database connection strings
password filename:config extension:yml org:target-org

# Exposed Kubernetes secrets
kind:Secret filename:*.yaml org:target-org

# Private keys committed to repos
"BEGIN RSA PRIVATE KEY" org:target-org

# API keys in environment files
filename:.env "API_KEY" org:target-org

# Exposed Docker registry credentials
filename:.dockercfg org:target-org

# Internal URLs and endpoints
"internal" filename:config extension:json org:target-org

# Terraform state files with secrets
filename:terraform.tfstate org:target-org
```

## Query Examples

Practical GitHub OSINT collection scenarios:

```elixir
# Scan for leaked secrets in an organization
{:ok, secrets} = Prismatic.Osint.GithubOsint.search_secrets("target-org",
  scope: :org,
  patterns: [
    {:aws_keys, "AKIA"},
    {:private_keys, "BEGIN RSA PRIVATE KEY"},
    {:database_urls, "postgres://"}
  ]
)

IO.puts("Total secret findings: #{secrets.total_findings}")
IO.puts("Severity: #{inspect(secrets.severity_summary)}")

# Profile a developer
{:ok, profile} = Prismatic.Osint.GithubOsint.developer_profile("target-user")
IO.puts("Name: #{profile.name}")
IO.puts("Company: #{profile.company}")
IO.puts("Languages: #{inspect(profile.languages)}")
IO.puts("Email addresses found: #{inspect(profile.email_addresses)}")

# Map organization structure
{:ok, org} = Prismatic.Osint.GithubOsint.org_intelligence("target-org")
IO.puts("Members: #{org.member_count}")
IO.puts("Tech stack: #{inspect(org.technology_stack)}")

# Repository security audit
{:ok, audit} = Prismatic.Osint.GithubOsint.audit_repository("target-org/main-app")
IO.puts("Sensitive files: #{length(audit.sensitive_files)}")
IO.puts("Exposed secrets: #{length(audit.exposed_secrets)}")

# Cross-reference developer emails with breach databases
{:ok, profile} = Prismatic.Osint.GithubOsint.developer_profile("target-user")
breach_check = Enum.map(profile.email_addresses, fn email ->
  {:ok, result} = Prismatic.Osint.DeHashed.check(email)
  {email, result.breach_count}
end)
```

## Use Cases

### Credential Leak Detection and Monitoring

The most critical GitHub OSINT use case is detecting leaked credentials before adversaries exploit them. Research consistently demonstrates that exposed secrets on GitHub are discovered by automated scanners within minutes. Organizations must implement continuous monitoring of their GitHub presence -- including employee personal repositories -- for accidentally committed secrets.

The Prismatic Platform's GitHub adapter implements pattern-based scanning across organization repositories, personal repositories of known employees, gists, and commit history (including deleted commits accessible through the API). When a potential secret is detected, the adapter assesses the secret type, estimates the exploitation impact, and generates an alert with recommended remediation actions.

### Developer and Employee Intelligence

GitHub profiles reveal significant personal and professional intelligence about developers. Public profiles include real names, email addresses, company affiliations, geographic locations, and professional interests. Contribution history reveals technology skills, work patterns, and organizational affiliations. Commit email addresses often expose both personal and corporate email addresses, enabling identity correlation across platforms.

For authorized security assessments, this intelligence supports social engineering simulations, insider threat assessment, and attack surface mapping through identification of employees with elevated access to code repositories.

### Technology Stack Assessment

Repository analysis reveals an organization's technology choices, including programming languages, frameworks, libraries, and infrastructure tools. Dependency files (package.json, Gemfile, requirements.txt, mix.exs) enumerate the entire software supply chain, enabling vulnerability assessment through known-vulnerable dependency identification and supply chain risk analysis.

### Organizational Structure Mapping

GitHub organization data reveals corporate structure through team membership, repository access patterns, and contribution graphs. For competitive intelligence, this reveals project portfolios, team sizes, technology investment areas, and development velocity metrics.

### Supply Chain Security Analysis

By analyzing dependency graphs across an organization's repositories, analysts can identify shared dependencies that represent single points of failure, outdated libraries with known vulnerabilities, dependencies with suspicious ownership changes, and the complete software bill of materials for publicly visible projects.

## Limitations and Constraints

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **Code search rate limits** | 30 searches/minute for authenticated users | Implement rate-aware queuing with prioritization |
| **Private repository blindness** | Cannot access private or internal repositories | Focus on public repos, personal employee repos, gists |
| **Historical commit access** | Force-pushed and deleted commits may be temporarily accessible but eventually garbage-collected | Capture findings immediately, maintain local mirrors |
| **False positives in secret detection** | Test keys, example values, and documentation may trigger alerts | Implement validation layers, entropy analysis |
| **API pagination limits** | Large result sets require multiple paginated requests | Implement efficient pagination with cursor-based traversal |
| **Search result caps** | Code search returns max 1,000 results per query | Narrow queries with additional filters for comprehensive coverage |

## Legal and Ethical Considerations

GitHub OSINT collection through the Prismatic Platform operates within clearly defined legal and ethical boundaries. All data collected is publicly accessible through GitHub's standard interface and API. The platform respects GitHub's terms of service and API rate limits. No authentication bypass, private repository access, or social engineering of GitHub users is involved.

Secret detection findings are handled through responsible disclosure channels. When the Prismatic Platform detects leaked credentials belonging to the client organization, immediate remediation is recommended. When credentials belonging to third parties are discovered during authorized assessments, the platform's disclosure policy governs notification procedures.

Developer profiling is conducted only within the scope of authorized security assessments and intelligence operations. Personal information derived from GitHub profiles is processed in compliance with GDPR and applicable data protection regulations, with appropriate data minimization and purpose limitation controls.

## Platform Integration

GitHub OSINT feeds into multiple Prismatic Platform intelligence pipelines, including attack surface management, credential intelligence, and supply chain security assessment.

```elixir
defmodule Prismatic.Pipeline.CodeIntelligence do
  @moduledoc """
  Code intelligence pipeline integrating GitHub OSINT with
  credential monitoring, technology assessment, and supply chain analysis.
  """

  def assess_code_exposure(organization) do
    with {:ok, secrets} <- Prismatic.Osint.GithubOsint.search_secrets(organization),
         {:ok, org_data} <- Prismatic.Osint.GithubOsint.org_intelligence(organization) do
      %{
        organization: organization,
        credential_exposure: secrets.total_findings,
        critical_secrets: count_critical(secrets.findings_by_type),
        technology_stack: org_data.technology_stack,
        member_count: org_data.member_count,
        public_repos: org_data.public_repos,
        risk_score: calculate_code_risk(secrets, org_data),
        remediation_priority: prioritize_remediation(secrets)
      }
    end
  end
end
```

## Best Practices

Effective GitHub OSINT requires a systematic approach that balances thoroughness with operational efficiency. Start with organization-level reconnaissance to understand the scope of public repositories and team membership. Then conduct targeted secret scanning using known high-value patterns (AWS keys, database credentials, private keys) before expanding to broader pattern matching.

Monitor not just organization repositories but also personal repositories of known employees, as developers frequently commit work-related code to personal accounts. Gists represent another often-overlooked source of leaked credentials and sensitive configuration snippets.

Implement continuous monitoring rather than point-in-time scans. The Prismatic Platform's scheduled collection framework enables automated periodic scanning with alerting on new findings. Cross-reference GitHub intelligence with [DeHashed](/osint/dehashed/) for credential exposure correlation and [FullHunt](/osint/fullhunt/) for infrastructure exposure that matches discovered configuration details.

For organizations conducting defensive GitHub OSINT on their own presence, consider implementing pre-commit hooks, GitHub secret scanning (available for public and enterprise repositories), and developer training on secure coding practices to reduce the volume of inadvertent secret exposure.

## Related Sources

- [Intelligence X](/osint/intelx/) - Code leak search engine with historical content
- [DeHashed](/osint/dehashed/) - Credential breach data for cross-referencing exposed emails
- [Have I Been Pwned](/osint/haveibeenpwned/) - Breach notification for discovered email addresses
- [Hunter.io](/osint/hunter-io/) - Email discovery for employee identification
- [SpiderFoot](/osint/spiderfoot/) - Automated OSINT with GitHub integration modules
- [FullHunt](/osint/fullhunt/) - Attack surface correlation with discovered infrastructure
- [VirusTotal](/osint/virustotal/) - Malware analysis for suspicious code findings

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)