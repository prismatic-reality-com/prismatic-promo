+++
title = "DeHashed"
weight = 47
[extra]
category = "global"
type = "breach"
module = "DeHashed"
description = "Breach data search engine with credential intelligence"
has_api = true
url = "https://dehashed.com"
rate_limit = "API key required, plan-dependent"
capabilities = ["Breach Search", "Credential Monitoring", "Email Intelligence", "Username Search", "Password Exposure", "Domain Monitoring"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1326
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["DeHashed", "Breach", "osint", "global", "Prismatic Platform", "Email"]
tags = ["osint", "global", "dehashed", "prismatic"]
quality_score = 77
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "DeHashed - Prismatic Platform"
+++

## Overview

DeHashed is a specialized data breach search engine that enables security professionals to search across billions of records from known data breaches. The platform indexes leaked credentials, personal information, and associated metadata from publicly disclosed breach datasets, providing a critical tool for organizations assessing their exposure from data security incidents. DeHashed is designed for legitimate security purposes including credential monitoring, [incident response](/glossary/incident-response/), security awareness programs, and penetration testing credential validation.

For [OSINT](/glossary/osint/) analysts, DeHashed represents one of the most comprehensive searchable breach databases available through a legitimate commercial service. Unlike raw breach data dumps that require significant processing to query effectively, DeHashed provides an indexed, normalized search interface across multiple breach datasets with consistent field mapping. This enables rapid assessment of credential exposure for domains, email addresses, usernames, IP addresses, and even name-based searches across the aggregated breach corpus.

The platform maintains a continuously growing index as new breach datasets are identified, verified, and added to the searchable database. Each record is tagged with the source breach, enabling analysts to trace exposure back to specific incidents and assess the scope and potential impact of each breach affecting their organization or investigation targets.

DeHashed distinguishes itself from similar services through its comprehensive field indexing (not just email addresses, but also usernames, IP addresses, phone numbers, names, and hashed passwords), its API-first architecture that supports programmatic integration, and its focus on serving the legitimate security community with appropriate use policies.

## Data Sources and Coverage

DeHashed indexes breach data from a wide variety of incident types and sources:

| Breach Category | Examples | Typical Data Fields |
|-----------------|---------|-------------------|
| **Corporate Breaches** | LinkedIn, Adobe, Dropbox, Yahoo | Email, password hash, username, name |
| **Forum/Community Breaches** | MySpace, Zynga, 000webhost | Username, email, password, IP address |
| **E-commerce Breaches** | Online retailers, marketplaces | Email, name, address, phone, payment indicators |
| **Government Leaks** | Voter registration databases, government employee data | Name, address, phone, email, position |
| **Credential Stuffing Lists** | Aggregated combo lists from multiple sources | Email/username, password |
| **Dark Web Leaks** | Stealer log compilations, forum database dumps | Email, password, URL, machine identifier |

### Searchable Fields

| Field | Search Operator | Description |
|-------|----------------|-------------|
| **Email** | `email:user@example.com` | Exact email address match |
| **Domain** | `email:@example.com` | All emails from a domain |
| **Username** | `username:admin` | Account username across platforms |
| **IP Address** | `ip_address:192.168.1.1` | IP associated with breached accounts |
| **Name** | `name:"John Smith"` | Full or partial name match |
| **Phone** | `phone:+1234567890` | Phone number from breach records |
| **Password** | `password:test123` | Plaintext password match (for research) |
| **Hashed Password** | `hashed_password:5f4dcc...` | Hash value match across datasets |
| **VIN** | `vin:1HGBH41JXMN109186` | Vehicle identification number |
| **Address** | `address:"123 Main St"` | Physical address from breach data |

## API Integration

DeHashed provides a REST API that supports programmatic access to the breach search engine. The API uses HTTP Basic authentication with the account email and API key.

```elixir
defmodule Prismatic.Osint.DeHashed do
  @moduledoc """
  DeHashed OSINT adapter for credential breach intelligence.

  Provides structured access to the DeHashed breach search engine
  for credential monitoring, exposure assessment, and incident response
  support. All operations require valid API credentials.
  """

  @base_url "https://api.dehashed.com"

  @doc """
  Search the breach database using DeHashed query syntax.
  Supports all field operators (email, username, ip_address, etc.).
  """
  @spec search(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def search(query, opts \\ []) do
    page = Keyword.get(opts, :page, 1)
    size = Keyword.get(opts, :size, 100)

    headers = [
      {"Accept", "application/json"},
      {"Authorization", basic_auth_header()}
    ]

    params = %{query: query, page: page, size: size}

    with {:ok, response} <- http_get("#{@base_url}/search", headers, params),
         {:ok, parsed} <- Jason.decode(response.body) do
      {:ok, %{
        total: parsed["total"],
        entries: normalize_entries(parsed["entries"]),
        took: parsed["took"],
        source: :dehashed,
        query: query,
        collected_at: DateTime.utc_now()
      }}
    end
  end

  @doc """
  Check a specific email address for breach exposure.
  Returns all breach records associated with the email.
  """
  @spec check(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def check(email, opts \\ []) do
    with {:ok, results} <- search("email:#{email}", opts) do
      {:ok, %{
        email: email,
        breach_count: results.total,
        breaches: extract_breach_sources(results.entries),
        password_exposed: any_password_exposed?(results.entries),
        earliest_exposure: earliest_date(results.entries),
        latest_exposure: latest_date(results.entries),
        entries: results.entries
      }}
    end
  end

  @doc """
  Monitor an entire domain for credential exposure.
  Returns aggregated statistics and detailed breach records.
  """
  @spec monitor(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def monitor(domain, opts \\ []) do
    with {:ok, results} <- search("email:@#{domain}", opts) do
      {:ok, %{
        domain: domain,
        total_exposures: results.total,
        unique_emails: count_unique_emails(results.entries),
        breach_sources: extract_breach_sources(results.entries),
        password_types: analyze_password_exposure(results.entries),
        risk_summary: generate_domain_risk_summary(results),
        entries: results.entries
      }}
    end
  end

  @doc """
  Bulk credential check for a list of email addresses.
  Implements batching to respect API rate limits.
  """
  @spec bulk_check([String.t()], keyword()) :: {:ok, map()} | {:error, term()}
  def bulk_check(email_list, opts \\ []) do
    batch_size = Keyword.get(opts, :batch_size, 10)
    delay_ms = Keyword.get(opts, :delay_ms, 1000)

    results =
      email_list
      |> Enum.chunk_every(batch_size)
      |> Enum.flat_map(fn batch ->
        batch_results = Enum.map(batch, &check/1)
        Process.sleep(delay_ms)
        batch_results
      end)

    exposed = Enum.filter(results, fn
      {:ok, %{breach_count: count}} when count > 0 -> true
      _ -> false
    end)

    {:ok, %{
      total_checked: length(email_list),
      total_exposed: length(exposed),
      exposure_rate: length(exposed) / max(length(email_list), 1),
      results: results
    }}
  end

  defp basic_auth_header do
    email = Application.get_env(:prismatic, :dehashed_email)
    api_key = Application.get_env(:prismatic, :dehashed_api_key)
    encoded = Base.encode64("#{email}:#{api_key}")
    "Basic #{encoded}"
  end
end
```

### API Tiers and Rate Limits

| Plan | Searches/Day | Features | Use Case |
|------|-------------|----------|----------|
| **Basic** | 100 | Search, basic fields | Individual analyst research |
| **Pro** | 1,000 | Full field search, bulk queries | Team security operations |
| **Enterprise** | 10,000+ | Priority access, dedicated support, SLA | SOC integration, continuous monitoring |

## Query Examples

Practical intelligence collection scenarios demonstrating DeHashed capabilities:

```elixir
# Check if employee credentials are exposed
{:ok, results} = Prismatic.Osint.DeHashed.search("email:@company.com")
IO.puts("Total exposed records: #{results.total}")

# Investigate a specific email address
{:ok, exposure} = Prismatic.Osint.DeHashed.check("ceo@company.com")
IO.puts("Breaches: #{length(exposure.breaches)}")
IO.puts("Password exposed: #{exposure.password_exposed}")

# Monitor domain for credential leaks
{:ok, domain_report} = Prismatic.Osint.DeHashed.monitor("company.com")
IO.puts("Unique emails exposed: #{domain_report.unique_emails}")
IO.puts("Breach sources: #{inspect(domain_report.breach_sources)}")

# Username correlation across platforms
{:ok, username_results} = Prismatic.Osint.DeHashed.search("username:target_user")

# IP-based breach investigation
{:ok, ip_results} = Prismatic.Osint.DeHashed.search("ip_address:203.0.113.42")

# Cross-platform credential correlation
{:ok, dehashed} = Prismatic.Osint.DeHashed.check("user@company.com")
{:ok, hibp} = Prismatic.Osint.HaveIBeenPwned.check("user@company.com")

correlation = %{
  email: "user@company.com",
  dehashed_breaches: dehashed.breach_count,
  hibp_breaches: hibp.breach_count,
  unique_sources: MapSet.union(
    MapSet.new(dehashed.breaches),
    MapSet.new(hibp.breaches)
  ) |> MapSet.size(),
  password_at_risk: dehashed.password_exposed
}
```

## Use Cases

### Organizational Credential Exposure Assessment

The primary enterprise use case for DeHashed is assessing an organization's credential exposure from third-party data breaches. By querying the organization's email domain, security teams can identify which employee accounts appear in breach datasets, determine whether passwords were exposed (and in what form -- plaintext, hashed, or encrypted), trace exposures back to specific breach sources for risk assessment, and prioritize password reset enforcement based on exposure severity.

This assessment directly supports security operations by identifying accounts requiring immediate password rotation, informing multi-factor authentication deployment priorities, providing data for security awareness training programs, and establishing baseline metrics for credential hygiene monitoring.

### Incident Response Support

During incident response, DeHashed provides rapid assessment of whether a compromised credential exists in known breach datasets. If an attacker used credentials found in previous breaches (credential stuffing), the breach source can inform the investigation by revealing where the credential was originally exposed, what other credentials from the same breach source might be at risk, the timeline of exposure (when the source breach occurred), and whether the credential was in plaintext (immediately usable) or hashed form.

### Penetration Testing and Red Team Operations

For authorized security testing, DeHashed provides legitimate credential intelligence that supports password spray attack planning using exposed credentials, identification of password patterns and reuse across organizational accounts, social engineering assessment using exposed personal information, and validation of password policy effectiveness against real-world exposure data.

### Third-Party Risk Assessment

When conducting due diligence on vendors, partners, or acquisition targets, DeHashed can reveal the organization's historical credential exposure, providing insight into their security posture. A high volume of exposed credentials, particularly plaintext passwords, may indicate inadequate security practices, poor incident response, or insufficient post-breach remediation.

### Person of Interest Investigation

For authorized investigations, DeHashed enables searching by name, phone number, username, or other personal identifiers across breach datasets. This can reveal digital footprint elements including email addresses and usernames used across platforms, associations between personal and professional identities, IP addresses indicating geographic presence, and phone numbers and physical addresses from comprehensive breach datasets.

## Limitations and Constraints

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **Historical data only** | Cannot detect breaches not yet in the database | Combine with real-time monitoring from DataBreaches.net, HIBP |
| **API rate limits** | Large-scale assessments require careful batching | Implement rate-aware batching with exponential backoff |
| **Data completeness varies** | Some breaches partially indexed or missing | Cross-reference with HIBP and Intelligence X |
| **No breach date precision** | When credentials were exposed vs. when breach occurred | Correlate with breach timeline databases |
| **Password handling sensitivity** | Exposed passwords require careful operational security | Process in memory only, never persist plaintext |
| **False positives possible** | Fabricated breaches or misattributed data | Validate critical findings through independent sources |

## Legal and Ethical Considerations

DeHashed operates as a legitimate security research and defense platform. The Prismatic Platform's integration operates exclusively within authorized security use cases. All DeHashed queries are logged with purpose justification, supporting audit and compliance requirements. The following ethical boundaries are strictly enforced.

Credential data retrieved from DeHashed is used exclusively for defensive security purposes: identifying exposure, driving password resets, informing security awareness, and supporting authorized security testing. Exposed passwords are never persisted in plaintext within the Prismatic Platform. They are processed in memory for analysis and immediately discarded. All queries are logged with the investigating analyst's identity and stated purpose.

Access to DeHashed through the Prismatic Platform is restricted to authorized security personnel with documented need-to-know. Bulk queries against third-party domains require documented authorization from the domain owner or legal justification such as due diligence, incident response, or authorized penetration testing.

Data retention for DeHashed results follows the platform's intelligence retention policy. Breach metadata (which breaches affect which domains) is retained for trend analysis, while specific credential details are retained only for the duration of active investigation or assessment.

## Platform Integration

DeHashed integrates into the Prismatic Platform's credential intelligence pipeline alongside [Have I Been Pwned](/osint/haveibeenpwned/) and [Intelligence X](/osint/intelx/), providing comprehensive breach exposure assessment through multi-source correlation.

```elixir
defmodule Prismatic.Pipeline.CredentialIntelligence do
  @moduledoc """
  Multi-source credential intelligence pipeline correlating
  DeHashed, HIBP, and Intelligence X for comprehensive exposure assessment.
  """

  def assess_credential_exposure(domain) do
    tasks = [
      Task.async(fn -> Prismatic.Osint.DeHashed.monitor(domain) end),
      Task.async(fn -> Prismatic.Osint.HaveIBeenPwned.domain(domain) end),
      Task.async(fn -> Prismatic.Osint.IntelX.search("@#{domain}") end)
    ]

    [dehashed, hibp, intelx] = Task.await_many(tasks, :timer.seconds(30))

    %{
      domain: domain,
      sources_queried: 3,
      dehashed: extract_metrics(dehashed),
      hibp: extract_metrics(hibp),
      intelx: extract_metrics(intelx),
      composite_risk: calculate_composite_risk(dehashed, hibp, intelx),
      recommendation: generate_remediation_plan(dehashed, hibp, intelx)
    }
  end
end
```

## Best Practices

When using DeHashed for organizational security assessment, start with a domain-wide query to establish baseline exposure metrics before investigating individual accounts. Prioritize investigation of accounts where plaintext passwords are exposed, as these represent immediate credential stuffing risk. Cross-reference DeHashed findings with [Have I Been Pwned](/osint/haveibeenpwned/) to ensure comprehensive coverage, as the two platforms may index different breach datasets.

For ongoing monitoring, schedule periodic domain scans and compare results against previous baselines to detect new exposures. Integrate findings into security awareness training by providing employees with evidence of their personal exposure (without revealing actual passwords) to motivate better credential hygiene practices.

Implement appropriate operational security when handling DeHashed results. Process credential data in isolated environments, restrict access to results containing password information, and ensure that investigation activities do not themselves create additional security risks through data leakage.

## Related Sources

- [Have I Been Pwned](/osint/haveibeenpwned/) - Complementary breach notification and credential checking
- [Intelligence X](/osint/intelx/) - Dark web and leak search with historical content
- [Hunter.io](/osint/hunter-io/) - Email discovery for scope assessment
- [SpiderFoot](/osint/spiderfoot/) - Automated OSINT with breach integration modules
- [VirusTotal](/osint/virustotal/) - Threat correlation for breach-related indicators
- [DataBreaches.net](/osint/databreaches-net/) - Breach reporting and threat actor tracking
- [ThreatFox](/osint/threatfox/) - IOC sharing for malware associated with breaches

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)