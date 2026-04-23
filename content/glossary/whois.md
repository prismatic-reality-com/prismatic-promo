+++
title = "WHOIS"
weight = 56
[extra]
category = "intelligence"
description = "Domain registration lookup protocol for ownership and infrastructure data"
related_terms = ["osint", "easm", "attack-surface", "dns-enumeration", "censys", "gdpr"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1360
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["WHOIS", "Domain", "glossary", "intelligence", "Prismatic Platform", "Available", "GDPR", "RDAP"]
tags = ["glossary", "intelligence", "whois", "prismatic"]
quality_score = 77
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "WHOIS - Prismatic Platform"
+++

## Definition & Overview

WHOIS is a query-response protocol defined by RFC 3912 used to retrieve registration and ownership data for domain names, IP address blocks, and autonomous system numbers. When a domain is registered, the registrar records registrant contact information, administrative and technical contacts, registration and expiration dates, name server delegations, registrar details, and domain status codes. This data is stored in distributed databases maintained by regional Internet registries (RIRs) and domain registrars, accessible via the WHOIS protocol on TCP port 43.

WHOIS has been a foundational protocol of the Internet since its earliest days. Originally specified in RFC 812 (1982) as a simple directory service for ARPANET users, it evolved through RFC 954 and RFC 3912 to serve as the primary mechanism for querying domain registration information. The protocol is deliberately simple: a client connects to a WHOIS server, sends a query string terminated by a carriage return and line feed, and receives a human-readable text response containing the registration record.

The landscape of WHOIS data availability changed dramatically with the implementation of the EU's General Data Protection Regulation ([GDPR](@/glossary/gdpr.md)) in 2018. ICANN's Temporary Specification for gTLD Registration Data required registrars to redact personal data from public WHOIS records, replacing registrant names, email addresses, phone numbers, and physical addresses with "REDACTED FOR PRIVACY" markers. This significantly reduced the intelligence value of WHOIS for individual attribution, though organizational registrations and infrastructure metadata remain available.

The Registration Data Access Protocol (RDAP), defined in RFCs 7480-7484, is the modern successor to WHOIS. RDAP provides structured JSON responses, standardized query formats, internationalization support, and differentiated access levels. While RDAP is gradually replacing WHOIS for domain queries, the legacy WHOIS protocol remains widely supported and continues to be the primary tool for quick domain lookups in security operations and [OSINT](@/glossary/osint.md) investigations.

| Data Element | Pre-GDPR | Post-GDPR | RDAP |
|-------------|----------|-----------|------|
| **Registrant Name** | Full name | Redacted | Tiered access |
| **Registrant Email** | Full email | Web form or redacted | Tiered access |
| **Registration Date** | Available | Available | Available |
| **Expiration Date** | Available | Available | Available |
| **Name Servers** | Available | Available | Available |
| **Registrar** | Available | Available | Available |
| **Domain Status** | Available | Available | Available |
| **DNSSEC** | Available | Available | Available |

## Technical Deep Dive

### Protocol Mechanics

The WHOIS protocol operates over TCP port 43 with a simple request-response model. The client establishes a TCP connection, sends the query followed by `\r\n`, and reads the response until the server closes the connection. There is no authentication, no session management, and no standardized response format---responses are free-form text that varies by registrar and registry.

```
Client                          WHOIS Server (port 43)
  |                                    |
  |--- TCP SYN ---------------------->|
  |<-- TCP SYN-ACK -------------------|
  |--- TCP ACK ---------------------->|
  |                                    |
  |--- "example.com\r\n" ------------>|
  |                                    |
  |<-- Registration data (text) ------|
  |<-- Connection close ---------------|
```

### Query Routing

WHOIS queries must be directed to the appropriate server based on the query type. For generic top-level domains (gTLDs like .com, .org, .net), queries are routed through a thin WHOIS server maintained by the registry (e.g., Verisign for .com) which returns a referral to the registrar's thick WHOIS server. For country-code top-level domains (ccTLDs like .cz, .de, .uk), each country's registry operates its own WHOIS server with varying data policies.

For IP address queries, the five Regional Internet Registries (RIRs) maintain WHOIS databases:

| RIR | Region | WHOIS Server |
|-----|--------|-------------|
| **ARIN** | North America | `whois.arin.net` |
| **RIPE NCC** | Europe, Middle East, Central Asia | `whois.ripe.net` |
| **APNIC** | Asia-Pacific | `whois.apnic.net` |
| **LACNIC** | Latin America, Caribbean | `whois.lacnic.net` |
| **AFRINIC** | Africa | `whois.afrinic.net` |

### Data Fields and Intelligence Value

Each WHOIS record contains multiple fields with varying intelligence value for security operations:

**Registration Dates** provide domain age analysis. Recently registered domains (less than 30 days) are statistically more likely to be associated with malicious activity such as phishing, malware distribution, or spam campaigns. Domain age is a significant factor in [security rating](@/glossary/security-rating.md) calculations.

**Name Server Records** reveal DNS hosting infrastructure and provider relationships. Shared name servers across multiple domains can indicate common ownership or hosting relationships. Changes in name server delegation may indicate domain hijacking or infrastructure migration.

**Registrar Information** indicates where and how a domain was registered. Certain registrars are known for bulk domain registration services used in domain squatting or phishing campaigns. Registrar patterns across related domains can reveal organizational procurement practices.

**Domain Status Codes** (EPP status codes) indicate the current lifecycle state of a domain. Codes like `clientTransferProhibited` and `serverTransferProhibited` indicate active domain protection. `pendingDelete` indicates an expiring domain. `serverHold` may indicate a suspended domain.

## Architecture & Implementation

### Prismatic WHOIS Integration

The Prismatic Platform integrates WHOIS lookups within the [Prismatic Perimeter](@/apps/prismatic-perimeter.md) EASM pipeline:

```elixir
defmodule PrismaticPerimeter.Intelligence.Whois do
  @moduledoc """
  WHOIS lookup and analysis for domain registration intelligence.
  Supports both traditional WHOIS (RFC 3912) and RDAP (RFC 7480).
  """

  @type whois_record :: %{
    domain: String.t(),
    registrant: map() | :redacted,
    registrar: String.t(),
    registration_date: Date.t(),
    expiration_date: Date.t(),
    updated_date: Date.t(),
    name_servers: list(String.t()),
    status_codes: list(String.t()),
    dnssec: boolean(),
    raw_response: String.t(),
    source: :whois | :rdap,
    queried_at: DateTime.t()
  }

  @spec lookup(String.t(), keyword()) :: {:ok, whois_record()} | {:error, term()}
  def lookup(domain, opts \\ []) do
    protocol = Keyword.get(opts, :protocol, :auto)

    case protocol do
      :rdap -> rdap_lookup(domain)
      :whois -> whois_lookup(domain)
      :auto -> rdap_with_whois_fallback(domain)
    end
  end

  defp rdap_with_whois_fallback(domain) do
    case rdap_lookup(domain) do
      {:ok, record} -> {:ok, record}
      {:error, _} -> whois_lookup(domain)
    end
  end

  defp whois_lookup(domain) do
    server = resolve_whois_server(domain)

    with {:ok, socket} <- :gen_tcp.connect(to_charlist(server), 43, [:binary, active: false]),
         :ok <- :gen_tcp.send(socket, "#{domain}\r\n"),
         {:ok, response} <- receive_full_response(socket),
         :ok <- :gen_tcp.close(socket) do
      {:ok, parse_whois_response(domain, response)}
    end
  end

  defp rdap_lookup(domain) do
    tld = domain |> String.split(".") |> List.last()
    base_url = rdap_bootstrap_url(tld)

    case HTTPClient.get("#{base_url}/domain/#{domain}") do
      {:ok, %{status: 200, body: body}} ->
        {:ok, parse_rdap_response(domain, body)}

      {:ok, %{status: 404}} ->
        {:error, :not_found}

      {:error, reason} ->
        {:error, reason}
    end
  end
end
```

### Domain Age Analysis

Domain age is a critical security signal. The platform computes age-based risk factors:

```elixir
defmodule PrismaticPerimeter.Intelligence.DomainAgeAnalyzer do
  @moduledoc """
  Analyzes domain registration age as a security signal.
  Newer domains carry higher risk scores for phishing and malware.
  """

  @spec age_risk_factor(Date.t()) :: float()
  def age_risk_factor(registration_date) do
    age_days = Date.diff(Date.utc_today(), registration_date)

    cond do
      age_days < 7 -> 1.0     # Very high risk - brand new domain
      age_days < 30 -> 0.8    # High risk - recently registered
      age_days < 90 -> 0.5    # Moderate risk - young domain
      age_days < 365 -> 0.3   # Low-moderate risk - under one year
      age_days < 1825 -> 0.1  # Low risk - established domain
      true -> 0.05            # Very low risk - well-established
    end
  end

  @spec expiration_risk_factor(Date.t()) :: float()
  def expiration_risk_factor(expiration_date) do
    days_remaining = Date.diff(expiration_date, Date.utc_today())

    cond do
      days_remaining < 0 -> 1.0    # Expired - critical risk
      days_remaining < 30 -> 0.7   # Expiring soon - high risk
      days_remaining < 90 -> 0.4   # Short renewal window
      days_remaining < 365 -> 0.1  # Normal registration period
      true -> 0.0                  # Multi-year registration - low risk
    end
  end
end
```

### Registrant Pattern Analysis

WHOIS data enables cross-domain correlation to identify organizational infrastructure boundaries:

```elixir
defmodule PrismaticPerimeter.Intelligence.RegistrantAnalyzer do
  @moduledoc """
  Correlates WHOIS registrant patterns across domains
  to identify organizational infrastructure boundaries.
  """

  @spec correlate_domains(list(whois_record())) :: list(domain_cluster())
  def correlate_domains(whois_records) do
    whois_records
    |> group_by_registrant_signals()
    |> merge_overlapping_clusters()
    |> score_cluster_confidence()
  end

  defp group_by_registrant_signals(records) do
    # Group by shared signals even when registrant data is redacted
    by_name_servers = Enum.group_by(records, & &1.name_servers)
    by_registrar = Enum.group_by(records, & &1.registrar)
    by_registration_pattern = group_by_temporal_proximity(records)

    combine_groupings([by_name_servers, by_registrar, by_registration_pattern])
  end
end
```

## Usage in Prismatic Platform

### EASM Asset Discovery

WHOIS lookups are a core component of [Prismatic Perimeter's](@/apps/prismatic-perimeter.md) asset discovery pipeline. When discovering an organization's external attack surface, WHOIS data provides:

1. **Domain ownership confirmation**: Verifies that discovered domains belong to the target organization
2. **Infrastructure mapping**: Name server records reveal DNS hosting relationships and provider dependencies
3. **Expiration monitoring**: Approaching expiration dates represent security risks (domain takeover via expired registration)
4. **Registrar intelligence**: Registration patterns indicate organizational procurement practices

### Security Rating Contribution

WHOIS-derived data contributes to the overall [security rating](@/glossary/security-rating.md) through several factors:

| WHOIS Factor | Rating Impact | Weight |
|-------------|--------------|--------|
| Domain age (young = risky) | Negative for < 90 days | 0.05 |
| Expiration proximity | Negative for < 30 days | 0.08 |
| WHOIS privacy usage | Neutral (privacy is legitimate) | 0.02 |
| DNSSEC status | Positive when enabled | 0.05 |
| Registration consistency | Positive when stable | 0.03 |

### Integration with Other Intelligence Sources

WHOIS data gains maximum value when correlated with complementary intelligence sources:

- **[DNS Enumeration](@/glossary/dns-enumeration.md)**: WHOIS name servers validated against DNS records
- **[Certificate Transparency](@/glossary/certificate-transparency.md)**: Domain registrant correlated with certificate subject information
- **[OSINT](@/glossary/osint.md)**: Registration data enriches organizational profiles
- **[Censys](@/glossary/censys.md)**: IP ranges from WHOIS correlated with Censys service discovery

## Code Examples

### Complete WHOIS Lookup and Analysis

```elixir
# Perform WHOIS lookup with automatic RDAP fallback
{:ok, record} = PrismaticPerimeter.Intelligence.Whois.lookup("example.com")

# Analyze domain age risk
age_risk = DomainAgeAnalyzer.age_risk_factor(record.registration_date)
expiry_risk = DomainAgeAnalyzer.expiration_risk_factor(record.expiration_date)

# Check DNSSEC status
dnssec_score = if record.dnssec, do: 1.0, else: 0.0

# Correlate with related domains
related_records = Enum.map(related_domains, &Whois.lookup/1)
clusters = RegistrantAnalyzer.correlate_domains(related_records)
```

### Bulk Domain Intelligence

```elixir
defmodule PrismaticPerimeter.Intelligence.BulkWhois do
  @moduledoc """
  Batch WHOIS lookups with rate limiting and caching.
  """

  @spec lookup_batch(list(String.t()), keyword()) :: list({String.t(), whois_record()})
  def lookup_batch(domains, opts \\ []) do
    rate_limit = Keyword.get(opts, :rate_limit_ms, 1_000)

    domains
    |> Enum.map(fn domain ->
      case Cache.get({:whois, domain}) do
        {:ok, cached} -> {domain, cached}
        :miss ->
          Process.sleep(rate_limit)
          case Whois.lookup(domain) do
            {:ok, record} ->
              Cache.put({:whois, domain}, record, ttl: :timer.hours(24))
              {domain, record}
            {:error, _} ->
              {domain, nil}
          end
      end
    end)
    |> Enum.reject(fn {_, record} -> is_nil(record) end)
  end
end
```

## Best Practices

1. **Prefer RDAP over legacy WHOIS**: RDAP provides structured JSON responses, eliminating the fragile text parsing required for WHOIS. Use WHOIS as a fallback for registries that do not yet support RDAP.

2. **Implement rate limiting**: WHOIS servers enforce query rate limits (typically 10-30 queries per minute). Excessive queries result in IP blocking. Cache results and respect server policies.

3. **Cache aggressively**: Domain registration data changes infrequently. Cache WHOIS records for 24 hours for active monitoring and 7 days for historical analysis. Only re-query when monitoring detects changes through other channels (DNS, CT logs).

4. **Parse defensively**: WHOIS response formats vary wildly between registrars and registries. Never assume a specific field will be present or formatted consistently. Build parsers that handle missing, redacted, and malformed fields gracefully.

5. **Correlate multiple signals**: Post-GDPR, individual WHOIS records contain less intelligence value. Correlate name servers, registrar patterns, registration timing, and other observable signals to build organizational profiles.

6. **Monitor expiration dates**: Domain expiration is a security-critical event. Expired domains can be re-registered by attackers for phishing, email interception, or subdomain takeover. Alert on domains expiring within 30 days.

## Common Pitfalls

- **Relying on registrant data post-GDPR**: Most gTLD registrations now redact personal data. Building intelligence workflows that depend on registrant name or email will fail for the majority of domains. Use infrastructure signals (name servers, registrar, timing) instead.

- **Ignoring rate limits**: WHOIS servers will block IP addresses that exceed query limits. This can disrupt not only WHOIS lookups but also other services running from the same IP. Always implement rate limiting and respect server policies.

- **Trusting WHOIS data uncritically**: WHOIS data is self-reported by registrants and not independently verified. Registration information may be inaccurate, outdated, or deliberately falsified. Corroborate WHOIS intelligence with independent sources.

- **Parsing assumptions**: Assuming all WHOIS servers return data in the same format is a common source of parsing failures. Build robust parsers that handle the full range of response formats across registrars and registries.

- **Neglecting historical data**: Current WHOIS records show only the latest state. Historical WHOIS data (available through commercial providers) reveals registration changes, ownership transfers, and infrastructure migrations that provide valuable temporal intelligence.

## Related Concepts

- [OSINT](@/glossary/osint.md) - Intelligence discipline that uses WHOIS as a primary data source
- [EASM](@/glossary/easm.md) - Attack surface management consuming WHOIS data for asset discovery
- [DNS Enumeration](@/glossary/dns-enumeration.md) - Complementary technique mapping domain infrastructure
- [Attack Surface](@/glossary/attack-surface.md) - Exposure area that WHOIS data helps map and attribute
- [GDPR](@/glossary/gdpr.md) - Privacy regulation impacting WHOIS data availability
- [Certificate Transparency](@/glossary/certificate-transparency.md) - Complementary domain intelligence source
- [Security Rating](@/glossary/security-rating.md) - Rating system incorporating WHOIS-derived signals
- [Censys](@/glossary/censys.md) - Internet scanning platform correlated with WHOIS data

## See Also

- [Architecture](@/architecture/_index.md) - Platform architecture overview
- [Technologies](@/technologies/_index.md) - Technology stack details
- [Apps](@/apps/_index.md) - Application ecosystem including Prismatic Perimeter
- [Agents](@/agents/_index.md) - Intelligence agents consuming WHOIS data

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)