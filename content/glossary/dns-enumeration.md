+++
title = "DNS Enumeration"
weight = 24
[extra]
category = "intelligence"
description = "Systematic discovery of DNS records to map an organization's digital infrastructure through forward lookups, subdomain brute-forcing, zone transfers, reverse DNS, and passive DNS database queries"
related_app = "prismatic_perimeter"
platform_layer = "intelligence"
difficulty = "intermediate"
domain = "reconnaissance"
stability = "stable"
since_version = "0.8.0"
elixir_module = "PrismaticPerimeter.DNS.SubdomainEnumerator"
otp_compliant = true
tags = ["DNS", "subdomain-discovery", "AXFR", "brute-force", "passive-DNS", "reconnaissance", "infrastructure-mapping", "EASM", "SPF", "DKIM", "DMARC", "DNSSEC", "CAA"]
related_terms = ["easm", "osint", "attack-surface", "censys", "shodan", "penetration-testing", "certificate-transparency", "security-rating", "nis2", "threat-intelligence"]
date_created = "2025-07-20"
date_updated = "2026-02-22"
use_cases = ["attack surface discovery", "subdomain takeover detection", "email security assessment", "cloud provider identification", "compliance verification", "infrastructure change detection"]
compliance_frameworks = ["NIS2", "ZKB"]
performance_impact = "low"
dependencies = ["easm", "certificate-transparency"]
dns_record_types = ["A", "AAAA", "CNAME", "MX", "TXT", "NS", "SRV", "SOA", "CAA", "DNSKEY", "TLSA", "PTR"]
techniques = ["forward-lookup", "subdomain-brute-force", "zone-transfer", "reverse-DNS", "passive-DNS", "CT-log-mining", "cache-snooping"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1675
date_modified = "2026-02-23"
keywords = ["DNS", "Enumeration", "Systematic", "glossary", "intelligence", "Prismatic Platform", "DNSSEC", "CNAME", "EASM"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "DNS Enumeration - Prismatic Platform"
+++

## Definition

DNS enumeration is a reconnaissance technique that systematically queries the Domain Name System to discover an organization's digital infrastructure. It encompasses subdomain brute-forcing, zone transfer attempts (AXFR), reverse DNS lookups, DNS record type enumeration (A, AAAA, CNAME, MX, TXT, NS, SRV, SOA, CAA, DNSKEY, TLSA), passive DNS database queries, and [certificate transparency](@/glossary/certificate-transparency.md) log mining. The technique reveals hostnames, mail servers, service endpoints, cloud provider usage, content delivery networks, and security configurations (SPF, DKIM, DMARC, DNSSEC, CAA) that collectively map an organization's digital footprint. DNS enumeration is a foundational capability in [External Attack Surface Management (EASM)](@/glossary/easm.md) and [Open Source Intelligence (OSINT)](@/glossary/osint.md) operations.

Unlike port scanning or vulnerability assessment, DNS enumeration operates at the naming layer of the internet, discovering what exists before probing how it is configured. This makes it the natural first step in any reconnaissance workflow: you must know what assets exist before you can assess their security posture. The DNS layer is particularly valuable because it is designed to be publicly queryable -- organizations cannot hide their DNS records without breaking the services those records support.

Within the Prismatic Platform, DNS enumeration is the first stage of the Prismatic Perimeter's EASM asset discovery pipeline, feeding subdomain inventories and security configuration assessments into the security rating engine.

## Historical Context

DNS enumeration as a security practice has evolved alongside the Domain Name System itself. The early internet (1980s-1990s) relied on simple forward lookups and zone transfers for legitimate administrative purposes. Zone transfers (AXFR), designed for DNS replication between authoritative servers, were widely available without access controls, making it trivial to download an organization's entire DNS zone file.

As organizations recognized the security implications of unrestricted zone transfers in the late 1990s, most disabled AXFR for external requesters. This drove the development of alternative enumeration techniques: subdomain brute-forcing emerged in the early 2000s, passive DNS databases became available in the mid-2000s (Farsight Security's DNSDB, VirusTotal), and Certificate Transparency logs provided a new discovery vector starting in 2013.

The modern DNS enumeration landscape (2020s) combines multiple techniques simultaneously for comprehensive coverage. No single technique provides complete visibility, but the combination of active brute-forcing, passive DNS history, CT log mining, and search engine dorking approaches comprehensive coverage for most organizations' external infrastructure.

Tools like Amass (OWASP), Subfinder, DNSRecon, and Fierce have made DNS enumeration accessible to security practitioners, while cloud-native scanning platforms like [Censys](@/glossary/censys.md) and [Shodan](@/glossary/shodan.md) have incorporated DNS data into their broader internet scanning datasets. The Prismatic Platform integrates these capabilities natively in Elixir, combining them with OTP's concurrency model for high-performance parallel enumeration.

## Overview

The Domain Name System is a globally distributed, hierarchical database that maps human-readable domain names to IP addresses and service records. Every organization with an internet presence maintains DNS records that describe its infrastructure topology. These records are, by design, publicly queryable -- this transparency is what makes DNS enumeration both possible and valuable for security assessment.

DNS enumeration techniques fall into two broad categories: active enumeration (sending queries to DNS servers) and passive enumeration (querying third-party databases that have already collected DNS data). Active techniques provide current data but are detectable by the target organization. Passive techniques are undetectable but may return stale data.

| Technique | Type | Detection Risk | Data Freshness | Coverage |
|-----------|------|----------------|----------------|----------|
| **Forward lookup** | Active | Low | Real-time | Known hostnames only |
| **Subdomain brute-force** | Active | Medium-High | Real-time | Depends on wordlist quality |
| **Zone transfer (AXFR)** | Active | High | Real-time | Complete (if allowed) |
| **Reverse DNS** | Active | Low | Real-time | IP range dependent |
| **Certificate Transparency** | Passive | None | Hours to days | Certificate-issuing domains |
| **Passive DNS databases** | Passive | None | Days to months | Historical coverage |
| **Search engine dorking** | Passive | None | Variable | Indexed content only |
| **DNS cache snooping** | Active | Medium | Recent queries | Resolver dependent |

## Technical Details

### DNS Record Types and Intelligence Value

Each DNS record type reveals different aspects of an organization's infrastructure:

| Record Type | Purpose | Intelligence Value |
|------------|---------|-------------------|
| **A / AAAA** | Maps hostname to IPv4/IPv6 address | Server locations, hosting providers, CDN usage |
| **CNAME** | Alias pointing to canonical hostname | Third-party services, CDN configurations, potential dangling CNAMEs |
| **MX** | Mail server designation | Email infrastructure, anti-spam providers |
| **TXT** | Arbitrary text data | SPF/DKIM/DMARC policy, domain verification tokens, service integrations |
| **NS** | Authoritative nameserver | DNS hosting provider, delegation structure |
| **SOA** | Start of authority metadata | Zone admin contact, refresh intervals, serial numbers |
| **SRV** | Service location records | Internal services (LDAP, SIP, XMPP), federation endpoints |
| **CAA** | Certificate Authority Authorization | Which CAs can issue certificates for the domain |
| **PTR** | Reverse DNS mapping | Hostname discovery from IP addresses |
| **DNSKEY / DS** | DNSSEC signing keys | DNSSEC deployment status and chain of trust |
| **TLSA** | DANE TLS authentication | Certificate pinning via DNS |

### Subdomain Discovery Techniques

Subdomain enumeration is the highest-yield DNS reconnaissance technique, as organizations often expose development, staging, internal, and legacy subdomains that were never intended to be publicly known:

```elixir
defmodule PrismaticPerimeter.DNS.SubdomainEnumerator do
  @moduledoc """
  Multi-technique subdomain discovery combining brute-force,
  certificate transparency, and passive DNS sources.

  Runs multiple discovery techniques in parallel using OTP's
  Task.async_stream for maximum throughput while respecting
  rate limits on target nameservers.
  """

  @type discovery_result :: %{
    subdomain: String.t(),
    source: atom(),
    resolved_ips: [String.t()],
    cname_chain: [String.t()],
    first_seen: DateTime.t()
  }

  @spec enumerate(String.t(), keyword()) :: {:ok, [discovery_result()]} | {:error, term()}
  def enumerate(domain, opts \\ []) do
    techniques = Keyword.get(opts, :techniques, [:brute_force, :ct_logs, :passive_dns])
    timeout = Keyword.get(opts, :timeout, :timer.minutes(5))

    tasks =
      Enum.map(techniques, fn technique ->
        Task.async(fn -> run_technique(technique, domain, opts) end)
      end)

    results =
      tasks
      |> Task.yield_many(timeout)
      |> Enum.flat_map(fn
        {_task, {:ok, {:ok, subdomains}}} -> subdomains
        {task, nil} -> Task.shutdown(task, :brutal_kill); []
        _ -> []
      end)
      |> deduplicate_results()
      |> resolve_all()

    {:ok, results}
  end

  defp run_technique(:brute_force, domain, opts) do
    wordlist = Keyword.get(opts, :wordlist, default_wordlist())

    subdomains =
      wordlist
      |> Task.async_stream(
        fn prefix -> resolve_subdomain("#{prefix}.#{domain}") end,
        max_concurrency: 50,
        timeout: :timer.seconds(5)
      )
      |> Enum.flat_map(fn
        {:ok, {:ok, result}} -> [result]
        _ -> []
      end)

    {:ok, subdomains}
  end

  defp run_technique(:ct_logs, domain, _opts) do
    PrismaticPerimeter.DNS.CTLogScanner.search(domain)
  end

  defp run_technique(:passive_dns, domain, _opts) do
    PrismaticPerimeter.DNS.PassiveDNS.query(domain)
  end

  defp resolve_subdomain(fqdn) do
    case :inet_res.lookup(to_charlist(fqdn), :in, :a) do
      [] -> {:error, :nxdomain}
      ips ->
        {:ok, %{
          subdomain: fqdn,
          resolved_ips: Enum.map(ips, &to_string(:inet.ntoa(&1))),
          source: :brute_force,
          first_seen: DateTime.utc_now()
        }}
    end
  end

  defp deduplicate_results(results) do
    results
    |> Enum.uniq_by(& &1.subdomain)
    |> Enum.sort_by(& &1.subdomain)
  end

  defp resolve_all(results) do
    Enum.map(results, fn result ->
      case result do
        %{resolved_ips: []} -> resolve_and_update(result)
        _ -> result
      end
    end)
  end

  defp resolve_and_update(result) do
    case :inet_res.lookup(to_charlist(result.subdomain), :in, :a) do
      [] -> result
      ips -> %{result | resolved_ips: Enum.map(ips, &to_string(:inet.ntoa(&1)))}
    end
  end

  defp default_wordlist do
    ~w(www mail ftp ssh vpn admin dev staging test api app cdn static assets
       portal webmail mx ns dns backup db database intranet wiki blog shop
       store cart checkout payment gateway sso auth login oauth internal
       monitoring grafana prometheus kibana elastic jenkins ci cd deploy
       stage preview demo sandbox lab beta alpha)
  end
end
```

### Dangling CNAME Detection

Dangling CNAMEs represent one of the most exploitable findings from DNS enumeration. When a CNAME record points to a decommissioned cloud service, an attacker can claim that service endpoint and serve content under the organization's domain:

```elixir
defmodule PrismaticPerimeter.DNS.DanglingCNAME do
  @moduledoc """
  Detects dangling CNAME records that indicate potential
  subdomain takeover vulnerabilities.

  A CNAME is dangling when it points to an external service
  (S3 bucket, Azure app, Heroku instance, GitHub Pages) that
  no longer exists or is unclaimed. An attacker can register
  the target service and serve arbitrary content under the
  organization's domain.
  """

  @cloud_patterns [
    {~r/\.s3\.amazonaws\.com$/, :aws_s3},
    {~r/\.s3-website[.-]/, :aws_s3_website},
    {~r/\.azurewebsites\.net$/, :azure},
    {~r/\.cloudapp\.azure\.com$/, :azure},
    {~r/\.herokuapp\.com$/, :heroku},
    {~r/\.github\.io$/, :github_pages},
    {~r/\.netlify\.app$/, :netlify},
    {~r/\.vercel\.app$/, :vercel},
    {~r/\.firebaseapp\.com$/, :firebase},
    {~r/\.elasticbeanstalk\.com$/, :aws_eb}
  ]

  @type takeover_finding :: %{
    subdomain: String.t(),
    cname_target: String.t(),
    provider: atom(),
    risk: :high | :medium | :low,
    verified: boolean()
  }

  @spec detect(String.t(), [String.t()]) :: {:ok, [takeover_finding()]} | {:error, term()}
  def detect(domain, subdomains) do
    findings =
      subdomains
      |> Task.async_stream(&check_cname/1, max_concurrency: 20, timeout: 10_000)
      |> Enum.flat_map(fn
        {:ok, {:ok, finding}} -> [finding]
        _ -> []
      end)

    {:ok, findings}
  end

  defp check_cname(subdomain) do
    case :inet_res.lookup(to_charlist(subdomain), :in, :cname) do
      [] ->
        {:error, :no_cname}

      [cname_target | _] ->
        target = to_string(cname_target)
        case identify_provider(target) do
          nil -> {:error, :not_cloud_service}
          provider -> verify_dangling(subdomain, target, provider)
        end
    end
  end

  defp identify_provider(cname_target) do
    Enum.find_value(@cloud_patterns, fn {pattern, provider} ->
      if Regex.match?(pattern, cname_target), do: provider
    end)
  end

  defp verify_dangling(subdomain, target, provider) do
    case :inet_res.lookup(to_charlist(target), :in, :a) do
      [] ->
        {:ok, %{
          subdomain: subdomain,
          cname_target: target,
          provider: provider,
          risk: :high,
          verified: true
        }}

      _ips ->
        # Target resolves but may still be unclaimed
        {:ok, %{
          subdomain: subdomain,
          cname_target: target,
          provider: provider,
          risk: :medium,
          verified: false
        }}
    end
  end
end
```

### Security Configuration Analysis

DNS TXT records contain critical security policy information that reveals an organization's email security posture:

```elixir
defmodule PrismaticPerimeter.DNS.SecurityAnalyzer do
  @moduledoc """
  Analyzes DNS records for security configuration assessment.
  Evaluates SPF, DKIM, DMARC, DNSSEC, and CAA deployment.

  Each security control is assessed independently and contributes
  to a weighted DNS hygiene score (0-100) that feeds into the
  overall EASM security rating.
  """

  @type security_assessment :: %{
    spf: :configured | :missing | :weak,
    dkim: :configured | :missing,
    dmarc: :configured | :missing | :monitoring_only,
    dnssec: :signed | :unsigned,
    caa: :configured | :missing,
    dangling_cnames: [String.t()],
    score: float()
  }

  @spec assess(String.t()) :: {:ok, security_assessment()} | {:error, term()}
  def assess(domain) do
    with {:ok, txt_records} <- query_txt(domain),
         {:ok, caa_records} <- query_caa(domain),
         {:ok, dnskey} <- check_dnssec(domain),
         {:ok, cnames} <- check_dangling_cnames(domain) do
      assessment = %{
        spf: analyze_spf(txt_records),
        dkim: analyze_dkim(domain),
        dmarc: analyze_dmarc(domain),
        dnssec: if(dnskey, do: :signed, else: :unsigned),
        caa: if(length(caa_records) > 0, do: :configured, else: :missing),
        dangling_cnames: cnames,
        score: 0.0
      }

      {:ok, %{assessment | score: calculate_dns_score(assessment)}}
    end
  end

  defp calculate_dns_score(assessment) do
    weights = [
      {assessment.spf == :configured, 25.0},
      {assessment.dmarc == :configured, 25.0},
      {assessment.dnssec == :signed, 20.0},
      {assessment.caa == :configured, 15.0},
      {assessment.dkim == :configured, 10.0},
      {assessment.dangling_cnames == [], 5.0}
    ]

    Enum.reduce(weights, 0.0, fn {condition, weight}, acc ->
      if condition, do: acc + weight, else: acc
    end)
  end

  defp analyze_spf(txt_records) do
    spf_record = Enum.find(txt_records, &String.starts_with?(&1, "v=spf1"))

    cond do
      is_nil(spf_record) -> :missing
      String.contains?(spf_record, "+all") -> :weak
      String.contains?(spf_record, "~all") -> :weak
      true -> :configured
    end
  end

  defp analyze_dkim(domain) do
    # Check common DKIM selector prefixes
    selectors = ~w(default google selector1 selector2 k1 dkim)

    if Enum.any?(selectors, fn sel ->
      case query_txt("#{sel}._domainkey.#{domain}") do
        {:ok, records} -> Enum.any?(records, &String.contains?(&1, "v=DKIM1"))
        _ -> false
      end
    end) do
      :configured
    else
      :missing
    end
  end

  defp analyze_dmarc(domain) do
    case query_txt("_dmarc.#{domain}") do
      {:ok, records} ->
        dmarc = Enum.find(records, &String.starts_with?(&1, "v=DMARC1"))

        cond do
          is_nil(dmarc) -> :missing
          String.contains?(dmarc, "p=none") -> :monitoring_only
          true -> :configured
        end

      _ ->
        :missing
    end
  end
end
```

## Implementation in Prismatic Platform

DNS enumeration is a core capability within Prismatic Perimeter's [EASM](@/glossary/easm.md) asset discovery pipeline. The platform performs automated DNS record discovery across all standard record types, identifying subdomains, mail infrastructure, and service endpoints for target organizations.

The discovery pipeline operates in three phases:

1. **Passive Collection**: [Certificate Transparency](@/glossary/certificate-transparency.md) logs, passive DNS databases, and search engine indices are queried for known subdomains and historical records without sending any traffic to the target.

2. **Active Enumeration**: Targeted DNS queries enumerate all record types for discovered domains and attempt subdomain brute-forcing with curated wordlists optimized for common naming patterns.

3. **Security Assessment**: Discovered DNS configurations are evaluated against security best practices, with results feeding into the A-F [security rating](@/glossary/security-rating.md) calculation.

| Pipeline Stage | Data Source | Output |
|---------------|-------------|--------|
| CT Log Mining | Certificate Transparency | Subdomain list from issued certificates |
| Passive DNS | VirusTotal, SecurityTrails | Historical DNS records and IP associations |
| Active Brute-force | Curated wordlists | Newly discovered subdomains |
| Record Enumeration | Authoritative DNS | Complete record set per domain |
| Security Analysis | TXT, DNSKEY, CAA records | DNS hygiene score (0-100) |
| Dangling CNAME Detection | CNAME resolution | Subdomain takeover vulnerabilities |

Results feed into the security rating engine, where DNS hygiene factors (DNSSEC deployment, SPF/DKIM/DMARC configuration, dangling CNAMEs, zone transfer exposure) contribute to the A-F grade calculation.

## Wordlist Strategies

The quality of subdomain brute-forcing is directly proportional to the quality of the wordlist. The Prismatic Platform uses a tiered wordlist approach:

| Tier | Size | Speed | Coverage | Use Case |
|------|------|-------|----------|----------|
| **Quick** | 500 words | ~30s | Common patterns | Initial reconnaissance |
| **Standard** | 5,000 words | ~5min | Good coverage | Standard EASM scans |
| **Comprehensive** | 50,000 words | ~45min | Extensive | Deep-dive assessments |
| **Custom** | Variable | Variable | Target-specific | Industry-specific patterns |

Custom wordlists incorporate industry-specific naming patterns (e.g., healthcare organizations commonly use patterns like `ehr`, `epic`, `cerner`; financial institutions use `swift`, `trading`, `compliance`) and are augmented with permutation techniques that combine discovered subdomains with common suffixes.

## Comparison with Alternatives

| Tool/Approach | Strengths | Weaknesses | Integration |
|--------------|-----------|------------|-------------|
| **Prismatic Perimeter DNS** | Integrated with EASM pipeline, Elixir native, OTP concurrency | Platform-specific | Native |
| **Amass (OWASP)** | Comprehensive, many data sources | External tool, Go binary | Script integration |
| **Subfinder** | Fast, passive-only option | Limited active capabilities | API integration |
| **DNSRecon** | Full record enumeration | Python, slower at scale | Script integration |
| **Shodan DNS** | Massive historical database | API rate limits, cost | REST API |
| **SecurityTrails** | Rich historical data | Commercial API | REST API |

## Best Practices

1. **Start Passive**: Always begin with passive techniques (CT logs, passive DNS databases) before active enumeration. This provides broad coverage without alerting the target organization.

2. **Rate Limit Active Queries**: Aggressive DNS brute-forcing can trigger rate limiting or blacklisting by authoritative nameservers. The platform limits concurrent queries to 50 per target domain.

3. **Monitor Dangling CNAMEs**: CNAME records pointing to decommissioned services represent subdomain takeover vulnerabilities. Continuous monitoring catches these before attackers exploit them.

4. **Validate DNSSEC Chains**: DNSSEC deployment is only effective when the entire chain of trust from root to leaf is valid. Partial or broken DNSSEC deployments are worse than no DNSSEC.

5. **Track Changes Over Time**: DNS infrastructure changes frequently. Periodic re-enumeration detects new subdomains, changed configurations, and removed records that indicate infrastructure changes.

6. **Combine with Certificate Transparency**: CT logs provide a continuously updated source of subdomain intelligence that complements active enumeration, often revealing subdomains that brute-forcing misses.

7. **Correlate with IP Intelligence**: Combine DNS resolution data with [Shodan](@/glossary/shodan.md) and [Censys](@/glossary/censys.md) data to enrich subdomain discoveries with service fingerprinting and vulnerability context.

8. **Document Zone Transfer Results**: If zone transfers succeed, document the finding as a significant security misconfiguration. Zone transfers should be restricted to authorized secondary nameservers.

## Use Cases

- **Attack Surface Discovery**: Mapping all externally-visible subdomains, mail servers, and service endpoints for a target organization as the first step in EASM assessment.

- **Subdomain Takeover Detection**: Identifying dangling CNAME records that point to decommissioned cloud services (S3 buckets, Azure apps, Heroku instances) vulnerable to takeover.

- **Email Security Assessment**: Evaluating SPF, DKIM, and DMARC deployment to assess email spoofing risk and phishing vulnerability.

- **Cloud Provider Identification**: Analyzing CNAME chains and IP address ranges to identify cloud providers, CDNs, and third-party services in use.

- **Compliance Verification**: Assessing DNSSEC deployment, CAA record configuration, and DNS hygiene as part of [NIS2](@/glossary/nis2.md) and ZKB compliance frameworks within Prismatic Perimeter.

- **Infrastructure Change Detection**: Periodic re-enumeration detects new subdomains, decommissioned services, and configuration changes that alter the [attack surface](@/glossary/attack-surface.md).

- **Incident Response Support**: During security incidents, DNS enumeration helps identify the full scope of potentially affected infrastructure and discover related domains or services.

## Related Concepts

- [EASM](@/glossary/easm.md) -- Attack surface management framework using DNS enumeration for discovery
- [OSINT](@/glossary/osint.md) -- Open source intelligence discipline encompassing DNS reconnaissance
- [Attack Surface](@/glossary/attack-surface.md) -- Total exposure area that DNS enumeration helps quantify
- [Certificate Transparency](@/glossary/certificate-transparency.md) -- Complementary passive discovery technique via CT logs
- [Shodan](@/glossary/shodan.md) -- Internet scanner complementing DNS data with service fingerprinting
- [Censys](@/glossary/censys.md) -- Certificate and host scanner enriching DNS discovery results
- [Security Rating](@/glossary/security-rating.md) -- A-F grading system incorporating DNS hygiene scores
- [Penetration Testing](@/glossary/penetration-testing.md) -- Security assessment that begins with DNS enumeration
- [NIS2](@/glossary/nis2.md) -- EU compliance framework requiring attack surface visibility
- [Threat Intelligence](@/glossary/threat-intelligence.md) -- Intelligence feeds enriching DNS discovery results
- [Intelligence Fusion](@/glossary/intelligence-fusion.md) -- Multi-source correlation that includes DNS signals

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
