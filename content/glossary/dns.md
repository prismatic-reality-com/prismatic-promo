+++
title = "DNS (Domain Name System)"
description = "The Domain Name System (DNS) is the hierarchical, distributed naming system that translates human-readable domain names into machine-routable IP addresses, serving as the foundational directory service of the internet and a critical intelligence target for security reconnaissance and external attack surface management."
weight = 30

[extra]
category = "glossary"
tags = ["dns", "networking", "security", "osint", "infrastructure", "name-resolution", "dnssec", "attack-surface", "easm", "reconnaissance"]
related_terms = ["easm", "security-rating", "dns-enumeration", "certificate-transparency", "tls", "attack-surface", "monitoring", "osint", "distributed-system", "whois"]
difficulty = "intermediate"
importance = "critical"
date_created = "2026-02-22"
date_modified = "2026-02-22"
version = "2.0.0"
platforms = ["prismatic", "elixir", "phoenix"]
domain = "networking-security"
audience = ["architects", "developers", "devops", "security-engineers"]
prerequisite_knowledge = ["networking-basics", "tcp-ip-fundamentals", "security-concepts"]
learning_outcomes = ["Understand the DNS resolution hierarchy from root servers to authoritative nameservers", "Identify and interpret all major DNS record types and their security implications", "Implement DNS queries in Elixir using the :inet_res module", "Recognize DNS-based attack vectors and their mitigations", "Apply DNS intelligence gathering techniques for external attack surface management"]
quality_score = 95
word_count_target = 2500
cross_references = 10
section_count = 12
has_code_examples = true
has_diagrams = false
review_status = "comprehensive"
author = "Tomas Korcak (korczis)"
reading_time = "15 min"
technical_level = "intermediate-advanced"
implementation_status = "production"
stability_level = "stable"
keywords = ["DNS", "Domain Name System", "name resolution", "DNS records", "DNS security", "zone transfer", "subdomain enumeration", "DNSSEC", "DNS over HTTPS", "recursive resolver", "authoritative nameserver", "root server", "TLD"]
external_resources = ["https://datatracker.ietf.org/doc/html/rfc1035", "https://www.cloudflare.com/learning/dns/what-is-dns/", "https://hexdocs.pm/dns_cluster/readme.html"]
word_count = 2777
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "DNS (Domain Name System) - Prismatic Platform"
+++

## Overview

The **Domain Name System (DNS)** is the hierarchical, distributed database that serves as the internet's directory service, translating human-readable domain names like `prismatic-prod.fly.dev` into machine-routable IP addresses like `66.241.124.100`. Without DNS, every internet interaction -- browsing a website, sending an email, calling an API, discovering a service in a distributed cluster -- would require memorizing numerical addresses. DNS is, without exaggeration, one of the most critical pieces of infrastructure sustaining the modern internet.

Within the Prismatic Platform, DNS occupies a dual role. On the infrastructure side, it enables distributed Elixir clusters to discover peers on Fly.io, routes traffic to the correct application instances, and resolves the addresses of backing services like PostgreSQL and Meilisearch. On the security intelligence side, DNS records represent one of the richest open-source intelligence (OSINT) sources available to the platform's External Attack Surface Management (EASM) module. Every subdomain, mail exchange record, nameserver delegation, and TXT verification entry tells a story about an organization's infrastructure topology -- making DNS reconnaissance the first step in mapping any external attack surface.

## Definition

DNS is a hierarchical, distributed naming system defined in RFC 1034 and RFC 1035 (Paul Mockapetris, 1983) that provides a globally scalable mechanism for translating domain names into IP addresses and other resource records. The system is organized as an inverted tree with the root zone at the top, top-level domains (TLDs) below, and progressively more specific subdomains descending toward leaf nodes. DNS operates primarily over UDP port 53 for queries under 512 bytes and TCP port 53 for larger responses, zone transfers, and reliability-critical operations. The protocol supports caching at every level through Time To Live (TTL) values attached to each record, enabling the system to handle billions of queries per day despite having only 13 logical root server clusters.

## Historical Context

The Domain Name System was born from necessity. In the early ARPANET era, host-to-address mappings were maintained in a single file called `HOSTS.TXT`, distributed from a central server at SRI International. By the early 1980s, this approach was collapsing under its own weight -- the file was growing too large, updates were too slow, and naming conflicts between institutions were increasingly common. Paul Mockapetris proposed the Domain Name System in RFC 882 and RFC 883 (November 1983), later refined in RFC 1034 and RFC 1035 (November 1987), establishing the hierarchical, distributed architecture that persists to this day.

The 1990s saw DNS become the backbone of the World Wide Web. The explosive growth of `.com` domains drove the commercialization of domain registration through the creation of ICANN (1998) and the introduction of competitive registrars. Security concerns emerged early: the first DNS cache poisoning attacks were demonstrated in the mid-1990s, leading to the development of DNSSEC (DNS Security Extensions) in RFC 2535 (1999), though widespread deployment took over a decade.

The 2010s brought privacy to DNS through DNS over HTTPS (DoH, RFC 8484, 2018) and DNS over TLS (DoT, RFC 7858, 2016), encrypting queries that had previously been transmitted in plaintext. Simultaneously, the security community recognized DNS as a primary intelligence source for attack surface discovery, with tools like Amass, Subfinder, and MassDNS enabling rapid subdomain enumeration at scale.

## Core Concepts

### The DNS Hierarchy

DNS operates through a strictly hierarchical namespace organized as an inverted tree:

- **Root Zone** (`.`): The apex of the hierarchy, served by 13 logical root server clusters (A through M) operated by organizations including ICANN, Verisign, NASA, and the U.S. Army Research Lab. These servers contain delegation records pointing to TLD servers.
- **Top-Level Domains (TLDs)**: Directly below the root, TLDs include generic TLDs (`.com`, `.org`, `.net`), country-code TLDs (`.cz`, `.de`, `.uk`), and new gTLDs (`.dev`, `.io`, `.app`). TLD servers contain delegation records pointing to authoritative nameservers for second-level domains.
- **Second-Level Domains**: Registered by organizations and individuals (e.g., `prismatic-reality` in `prismatic-reality.com`). These are where most organizational DNS administration occurs.
- **Subdomains**: Arbitrary subdivisions created by domain owners (e.g., `api.prismatic-prod.fly.dev`, `staging.prismatic-prod.fly.dev`). Subdomains can be nested to arbitrary depth.

### The Resolution Process

When a client needs to resolve a domain name, the following process occurs:

1. **Stub Resolver**: The client application calls the operating system's stub resolver, which checks the local cache and `/etc/hosts` file.
2. **Recursive Resolver**: If no cached answer exists, the stub resolver forwards the query to a recursive resolver (typically the ISP's resolver or a public resolver like `1.1.1.1` or `8.8.8.8`).
3. **Root Server Query**: The recursive resolver, if it lacks a cached answer, queries a root server, which responds with a referral to the appropriate TLD server.
4. **TLD Server Query**: The recursive resolver queries the TLD server, which responds with a referral to the authoritative nameserver for the requested domain.
5. **Authoritative Query**: The recursive resolver queries the authoritative nameserver, which returns the definitive answer (the requested record or NXDOMAIN if no such record exists).
6. **Response Caching**: The answer is cached at each level according to the TTL value, preventing redundant queries for popular domains.

This process can involve **iterative** queries (where the recursive resolver performs each step itself) or fully **recursive** queries (where each server forwards the query onward). In practice, caching at the recursive resolver means most queries are answered without reaching root or TLD servers.

### DNS Record Types

Each DNS record type serves a specific purpose in the naming system:

| Record Type | Purpose | Example |
|-------------|---------|---------|
| **A** | Maps a domain to an IPv4 address | `prismatic-prod.fly.dev. IN A 66.241.124.100` |
| **AAAA** | Maps a domain to an IPv6 address | `prismatic-prod.fly.dev. IN AAAA 2a09:8280:1::...` |
| **CNAME** | Creates an alias from one domain to another | `www.example.com. IN CNAME example.com.` |
| **MX** | Specifies mail exchange servers with priority | `example.com. IN MX 10 mail.example.com.` |
| **TXT** | Stores arbitrary text (SPF, DKIM, verification) | `example.com. IN TXT "v=spf1 include:_spf.google.com ~all"` |
| **SRV** | Defines service locations for specific protocols | `_sip._tcp.example.com. IN SRV 10 60 5060 sip.example.com.` |
| **NS** | Delegates a zone to authoritative nameservers | `example.com. IN NS ns1.provider.com.` |
| **SOA** | Contains zone administrative information (serial, refresh, retry, expire) | `example.com. IN SOA ns1.provider.com. admin.example.com. ...` |
| **PTR** | Provides reverse DNS lookup (IP to domain name) | `100.124.241.66.in-addr.arpa. IN PTR prismatic-prod.fly.dev.` |
| **CAA** | Specifies which Certificate Authorities may issue certificates | `example.com. IN CAA 0 issue "letsencrypt.org"` |

## Technical Deep Dive

### DNS Security: DNSSEC, DoH, and DoT

DNS was designed in an era when security was not a primary concern. The original protocol transmits queries and responses in plaintext with no authentication, making it vulnerable to eavesdropping, spoofing, and manipulation.

**DNSSEC (DNS Security Extensions)** addresses authenticity and integrity by adding cryptographic signatures to DNS records. Each zone signs its records with a private key, and resolvers verify signatures using the corresponding public key published in DNSKEY records. A chain of trust extends from the root zone (whose keys are distributed out-of-band) down through each delegation. DNSSEC does not encrypt queries -- it only proves that responses have not been tampered with. Adoption has grown to approximately 30% of TLDs, though client-side validation remains inconsistent.

**DNS over HTTPS (DoH)** wraps DNS queries inside standard HTTPS connections on port 443, encrypting them with TLS and making them indistinguishable from regular web traffic. This prevents on-path observers (ISPs, network administrators, attackers) from seeing which domains a client is resolving. DoH was standardized in RFC 8484 (2018) and is now supported by major browsers and resolvers.

**DNS over TLS (DoT)** encrypts DNS queries using TLS on a dedicated port (853). Unlike DoH, DoT uses its own port, making it easier for network administrators to identify and manage DNS traffic separately from web traffic. This is both an advantage (operational visibility) and a disadvantage (easier to block).

### DNS-Based Attack Vectors

Understanding DNS attacks is essential for both defensive security and EASM:

- **DNS Cache Poisoning**: An attacker injects forged records into a resolver's cache, redirecting victims to malicious servers. The Kaminsky attack (2008) demonstrated that this could be done at scale by exploiting the predictability of DNS transaction IDs.
- **DNS Spoofing**: Similar to cache poisoning but targets the client directly by sending forged responses before the legitimate resolver can reply. DNSSEC mitigates this when fully deployed.
- **DNS Tunneling**: Encodes arbitrary data within DNS queries and responses, exploiting the fact that DNS traffic is rarely filtered by firewalls. Used for data exfiltration and command-and-control communication by sophisticated malware.
- **DDoS Amplification**: Exploits open DNS resolvers to amplify attack traffic. A small query (tens of bytes) can generate a response of thousands of bytes, achieving amplification factors of 50x or more. The attacker spoofs the victim's IP address as the source, directing amplified responses at the target.
- **Subdomain Takeover**: When a CNAME record points to a cloud resource (S3 bucket, Azure app, Heroku instance) that has been decommissioned, an attacker can claim that resource and serve arbitrary content on the victim's subdomain.
- **Domain Generation Algorithms (DGAs)**: Malware generates pseudo-random domain names to locate command-and-control servers, making it difficult to block or sinkhole individual domains.

### DNS in the EASM Context

For External Attack Surface Management, DNS records are among the most valuable intelligence sources:

- **Subdomain Enumeration**: Techniques include brute-force resolution against wordlists, zone transfer requests (AXFR), certificate transparency log mining, passive DNS database queries, and search engine dorking. The Prismatic Perimeter module combines all these approaches for comprehensive coverage.
- **DNS Reconnaissance**: Analyzing NS records reveals the hosting provider. MX records expose the email infrastructure. TXT records may contain SPF policies, DKIM keys, domain verification tokens (for Google, Microsoft, etc.), and even internal information accidentally published. SOA records reveal administrative contacts.
- **Certificate Transparency Correlation**: CT logs record every SSL/TLS certificate issued by participating Certificate Authorities. Mining these logs for a target domain reveals subdomains that may not appear in any other source, including internal-only names that were accidentally included in certificate Subject Alternative Names (SANs).
- **Passive DNS Databases**: Services like Farsight DNSDB and SecurityTrails maintain historical records of DNS resolutions. These databases reveal previously used IP addresses, former subdomains, and infrastructure changes over time -- intelligence that active scanning alone cannot provide.

## Prismatic Platform Implementation

### DNS in Platform Infrastructure

The Prismatic Platform depends on DNS at multiple infrastructure levels:

**Fly.io DNS Resolution**: Production deployments at `prismatic-prod.fly.dev` and staging at `prismatic-staging.fly.dev` rely on Fly.io's DNS infrastructure for routing client requests to the nearest edge node. Fly.io uses Anycast DNS to direct traffic to the closest data center, minimizing latency.

**Custom Domain Resolution**: The `prismatic-reality.com` domain uses external DNS providers with A and AAAA records pointing to Fly.io's edge network. CAA records restrict certificate issuance to Let's Encrypt, and TXT records carry SPF and domain verification entries.

**GitHub Pages DNS**: The promo site at `korczis.github.io/prismatic-promo` uses GitHub's DNS infrastructure with CNAME records for custom domain configuration.

**Erlang Cluster Formation**: In multi-instance deployments, the platform uses the `dns_cluster` library to discover peer BEAM nodes. DNS SRV or A records are queried at regular intervals, and newly discovered nodes are automatically connected to form a distributed Erlang cluster.

### DNS Intelligence in Prismatic Perimeter

The EASM module uses DNS as its primary discovery vector:

```elixir
defmodule Prismatic.DNS.Resolver do
  @moduledoc """
  DNS resolution utilities for the Prismatic Platform.
  Provides both standard resolution and security-focused
  DNS intelligence gathering capabilities using the BEAM's
  built-in :inet_res module.
  """

  require Logger

  @type dns_record :: %{
    type: :a | :aaaa | :cname | :mx | :txt | :ns | :soa | :srv | :caa | :ptr,
    name: String.t(),
    value: String.t(),
    ttl: non_neg_integer()
  }

  @type resolution_result :: {:ok, [dns_record()]} | {:error, atom()}

  @doc """
  Resolves a domain name to its A records using the BEAM's
  built-in DNS resolution via :inet_res.
  """
  @spec resolve_a(String.t()) :: resolution_result()
  def resolve_a(domain) when is_binary(domain) do
    domain
    |> String.to_charlist()
    |> :inet_res.lookup(:in, :a)
    |> case do
      [] ->
        {:error, :nxdomain}

      addresses ->
        records =
          Enum.map(addresses, fn {a, b, c, d} ->
            %{
              type: :a,
              name: domain,
              value: "#{a}.#{b}.#{c}.#{d}",
              ttl: 0
            }
          end)

        {:ok, records}
    end
  end

  @doc """
  Performs comprehensive DNS enumeration for a domain,
  querying multiple record types in parallel using Task.async_stream.
  This is the primary entry point for EASM DNS reconnaissance.
  """
  @spec enumerate(String.t(), keyword()) :: {:ok, map()}
  def enumerate(domain, opts \\ []) when is_binary(domain) do
    record_types = Keyword.get(opts, :types, [:a, :aaaa, :mx, :txt, :ns, :cname, :soa])
    timeout = Keyword.get(opts, :timeout, 10_000)

    results =
      record_types
      |> Task.async_stream(
        fn type -> {type, query_record(domain, type)} end,
        timeout: timeout,
        max_concurrency: System.schedulers_online()
      )
      |> Enum.reduce(%{}, fn
        {:ok, {type, {:ok, records}}}, acc ->
          Map.put(acc, type, records)

        {:ok, {type, {:error, _reason}}}, acc ->
          Map.put(acc, type, [])

        {:exit, _reason}, acc ->
          acc
      end)

    {:ok, results}
  end

  @spec query_record(String.t(), atom()) :: resolution_result()
  defp query_record(domain, type) do
    charlist_domain = String.to_charlist(domain)

    case :inet_res.resolve(charlist_domain, :in, type) do
      {:ok, dns_message} ->
        records = parse_dns_response(dns_message, type, domain)
        {:ok, records}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp parse_dns_response(dns_message, type, domain) do
    dns_message
    |> :inet_dns.msg()
    |> Keyword.get(:anlist, [])
    |> Enum.map(fn rr ->
      data = :inet_dns.rr(rr)

      %{
        type: type,
        name: domain,
        value: format_rr_data(type, Keyword.get(data, :data)),
        ttl: Keyword.get(data, :ttl, 0)
      }
    end)
  end

  defp format_rr_data(:a, {a, b, c, d}), do: "#{a}.#{b}.#{c}.#{d}"
  defp format_rr_data(:aaaa, addr), do: :inet.ntoa(addr) |> to_string()
  defp format_rr_data(:mx, {priority, exchange}), do: "#{priority} #{exchange}"
  defp format_rr_data(:txt, texts), do: Enum.join(texts, " ")
  defp format_rr_data(:cname, cname), do: to_string(cname)
  defp format_rr_data(:ns, ns), do: to_string(ns)
  defp format_rr_data(_type, data), do: inspect(data)
end
```

### DNS-Based Cluster Formation

The BEAM ecosystem provides first-class support for DNS-based service discovery, which is critical for the platform's distributed architecture on Fly.io:

```elixir
defmodule Prismatic.Cluster.DNSStrategy do
  @moduledoc """
  DNS-based cluster formation strategy for Prismatic Platform.
  Uses DNS SRV or A records to discover peer nodes, enabling
  automatic cluster formation in cloud environments like Fly.io.
  """

  use GenServer
  require Logger

  @poll_interval :timer.seconds(5)

  defstruct [:query, :node_basename, :polling_ref]

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl GenServer
  def init(opts) do
    query = Keyword.fetch!(opts, :query)
    node_basename = Keyword.fetch!(opts, :node_basename)

    state = %__MODULE__{
      query: query,
      node_basename: node_basename,
      polling_ref: schedule_poll()
    }

    {:ok, state}
  end

  @impl GenServer
  def handle_info(:poll, state) do
    discover_and_connect(state)
    {:noreply, %{state | polling_ref: schedule_poll()}}
  end

  defp discover_and_connect(%{query: query, node_basename: basename}) do
    case resolve_peers(query) do
      {:ok, addresses} ->
        addresses
        |> Enum.map(&build_node_name(&1, basename))
        |> Enum.reject(&(&1 == Node.self()))
        |> Enum.each(fn node ->
          case Node.connect(node) do
            true -> Logger.info("Connected to peer: #{node}")
            false -> Logger.debug("Failed to connect to peer: #{node}")
            :ignored -> :ok
          end
        end)

      {:error, reason} ->
        Logger.warning("DNS discovery failed: #{inspect(reason)}")
    end
  end

  defp resolve_peers(query) do
    query
    |> String.to_charlist()
    |> :inet_res.lookup(:in, :a)
    |> case do
      [] -> {:error, :no_records}
      addresses -> {:ok, Enum.map(addresses, &format_ip/1)}
    end
  end

  defp format_ip({a, b, c, d}), do: "#{a}.#{b}.#{c}.#{d}"
  defp build_node_name(ip, basename), do: :"#{basename}@#{ip}"
  defp schedule_poll, do: Process.send_after(self(), :poll, @poll_interval)
end
```

### DNS Anomaly Detection

The platform monitors DNS query patterns to detect potential security threats:

```elixir
defmodule Prismatic.DNS.AnomalyDetector do
  @moduledoc """
  Detects anomalous DNS patterns that may indicate tunneling,
  DGA-based malware communication, or reconnaissance activity.
  """

  @type anomaly :: :high_entropy_subdomain | :excessive_txt_queries
                   | :unusual_query_volume | :known_dga_pattern

  @entropy_threshold 3.5

  @spec analyze_query(String.t(), atom()) :: {:ok, :normal} | {:alert, anomaly(), map()}
  def analyze_query(domain, _record_type) when is_binary(domain) do
    labels = String.split(domain, ".")

    cond do
      high_entropy_label?(labels) ->
        {:alert, :high_entropy_subdomain,
         %{domain: domain, entropy: calculate_entropy(hd(labels))}}

      excessive_label_count?(labels) ->
        {:alert, :known_dga_pattern,
         %{domain: domain, label_count: length(labels)}}

      true ->
        {:ok, :normal}
    end
  end

  defp high_entropy_label?(labels) do
    labels
    |> List.first()
    |> calculate_entropy()
    |> Kernel.>(@entropy_threshold)
  end

  defp excessive_label_count?(labels), do: length(labels) > 6

  @spec calculate_entropy(String.t()) :: float()
  defp calculate_entropy(string) when is_binary(string) do
    len = String.length(string)

    string
    |> String.graphemes()
    |> Enum.frequencies()
    |> Enum.reduce(0.0, fn {_char, count}, acc ->
      probability = count / len
      acc - probability * :math.log2(probability)
    end)
  end
end
```

## Code Examples

### Basic DNS Resolution with :inet_res

```elixir
# Simple A record lookup
:inet_res.lookup(~c"prismatic-prod.fly.dev", :in, :a)
# => [{66, 241, 124, 100}]

# MX record lookup for email infrastructure analysis
:inet_res.lookup(~c"example.com", :in, :mx)
# => [{10, ~c"mail.example.com"}, {20, ~c"mail2.example.com"}]

# TXT record lookup for SPF/DKIM/verification tokens
:inet_res.lookup(~c"example.com", :in, :txt)
# => [[~c"v=spf1 include:_spf.google.com ~all"]]

# NS record lookup to identify hosting provider
:inet_res.lookup(~c"example.com", :in, :ns)
# => [~c"ns1.cloudflare.com", ~c"ns2.cloudflare.com"]

# Full DNS message with metadata (TTL, authority, additional sections)
{:ok, msg} = :inet_res.resolve(~c"example.com", :in, :a)
:inet_dns.msg(msg) |> Keyword.get(:anlist) |> Enum.map(&:inet_dns.rr/1)
```

### ETS-Backed DNS Cache

```elixir
defmodule Prismatic.DNS.Cache do
  @moduledoc """
  ETS-backed DNS cache that respects TTL values from authoritative responses.
  Reduces external DNS dependency for frequently resolved domains.
  """

  @table :dns_cache

  @spec init() :: :ok
  def init do
    :ets.new(@table, [:named_table, :set, :public, read_concurrency: true])
    :ok
  end

  @spec lookup(String.t(), atom()) :: {:hit, term()} | :miss
  def lookup(domain, type) do
    key = {domain, type}

    case :ets.lookup(@table, key) do
      [{^key, value, expires_at}] ->
        if DateTime.compare(DateTime.utc_now(), expires_at) == :lt do
          {:hit, value}
        else
          :ets.delete(@table, key)
          :miss
        end

      [] ->
        :miss
    end
  end

  @spec store(String.t(), atom(), term(), non_neg_integer()) :: true
  def store(domain, type, value, ttl_seconds) do
    expires_at = DateTime.add(DateTime.utc_now(), ttl_seconds, :second)
    :ets.insert(@table, {{domain, type}, value, expires_at})
  end
end
```

## Best Practices

1. **Set appropriate TTL values**: Balance caching efficiency against propagation speed. For production services, use TTLs between 300 and 3600 seconds. Lower TTLs to 60 seconds before planned migrations or DNS changes to accelerate global propagation.

2. **Implement DNSSEC for authoritative zones**: Sign zones with DNSSEC to prevent spoofing and cache poisoning. Automate key rotation and monitor signature expiration to avoid outages caused by expired RRSIG records.

3. **Restrict zone transfers**: Configure nameservers to allow AXFR requests only from legitimate secondary nameservers. An unrestricted zone transfer exposes the entire domain structure to any attacker who asks.

4. **Monitor DNS query patterns**: Anomalous DNS traffic can indicate data exfiltration via tunneling, DGA-based malware communication, or active reconnaissance. Baseline normal query volumes and alert on deviations.

5. **Use DNS-based service discovery in Elixir clusters**: Leverage the `dns_cluster` library for automatic cluster formation rather than hardcoding node addresses. This enables dynamic scaling and self-healing deployments on Fly.io.

6. **Implement application-level DNS caching**: Use ETS-backed caches for frequently resolved domains to reduce latency and external DNS dependency. Always respect TTL values from authoritative responses.

7. **Configure CAA records**: Specify which Certificate Authorities are authorized to issue certificates for your domains, reducing the risk of unauthorized certificate issuance.

8. **Remove dangling DNS records**: When decommissioning services, remove corresponding CNAME and A records immediately. Dangling records pointing to unclaimed cloud resources are prime targets for subdomain takeover.

9. **Use split-horizon DNS carefully**: When serving different responses for internal and external queries, ensure consistent security policies across both views and audit regularly for information leakage.

10. **Deploy DoH or DoT for client privacy**: Encrypt DNS queries in transit to prevent eavesdropping by on-path observers, especially in environments with untrusted network infrastructure.

## Anti-Patterns

1. **Relying on DNS for security boundaries**: DNS was not designed as a security mechanism. Never use DNS-based access control as your sole security layer. Always implement authentication and authorization at the application level.

2. **Ignoring TTL propagation delays**: When changing DNS records, old values persist in caches worldwide for up to the previous TTL duration. Failing to pre-lower TTLs before a migration causes extended periods of split traffic.

3. **Zone transfer exposure**: Leaving AXFR unrestricted is one of the most common DNS misconfigurations. A single query can enumerate an entire domain structure, handing attackers a complete map of the infrastructure.

4. **Subdomain takeover negligence**: Decommissioning a cloud service without removing the corresponding DNS record creates a subdomain takeover vulnerability. Attackers can claim the orphaned resource and serve malicious content under your domain.

5. **DNS resolution in hot paths**: Performing DNS lookups on every request in high-throughput Elixir applications creates bottlenecks. Cache resolutions and use connection pooling to amortize DNS costs.

6. **Hardcoded DNS resolvers**: Embedding resolver addresses like `8.8.8.8` directly in application code prevents operators from configuring resolvers appropriate to their environment and breaks in air-gapped networks.

7. **Ignoring DNS in disaster recovery planning**: DNS failover and multi-region strategies are critical for business continuity. Test DNS-based failover regularly as part of chaos engineering exercises.

8. **Publishing sensitive information in TXT records**: SPF records, DKIM keys, and domain verification tokens are legitimate TXT entries, but accidentally publishing internal hostnames, API keys, or debugging information in TXT records is a surprisingly common mistake.

## Related Technologies

### DNS Security Comparison

| Feature | Traditional DNS | DNSSEC | DNS over HTTPS (DoH) | DNS over TLS (DoT) |
|---------|----------------|--------|----------------------|---------------------|
| **Encryption** | None | None (signs, not encrypts) | Full TLS encryption | Full TLS encryption |
| **Authentication** | None | Cryptographic signatures | Server certificate | Server certificate |
| **Port** | UDP/TCP 53 | UDP/TCP 53 | TCP 443 | TCP 853 |
| **Privacy** | None | None | High (blends with HTTPS) | Moderate (dedicated port) |
| **Complexity** | Low | High (key management) | Moderate | Moderate |
| **Adoption** | Universal | ~30% of TLDs | Growing rapidly | Moderate |
| **BEAM Support** | Native `:inet_res` | Limited | Via HTTP clients | Via SSL sockets |

### DNS vs Service Discovery Alternatives

| Approach | DNS | Consul | etcd | Kubernetes DNS |
|----------|-----|--------|------|----------------|
| **Infrastructure** | Existing | Dedicated cluster | Dedicated cluster | K8s built-in |
| **Consistency** | Eventual (TTL) | Strong (Raft) | Strong (Raft) | Eventual |
| **Health Checks** | None native | Built-in | External | Built-in |
| **BEAM Integration** | Native `:inet_res` | Via HTTP API | Via HTTP API | Native (CoreDNS) |
| **Complexity** | Minimal | Moderate | Moderate | K8s required |
| **Prismatic Usage** | Primary | Not used | Not used | Supported |

## Future Directions

DNS continues to evolve in response to emerging challenges. **Oblivious DNS over HTTPS (ODoH)**, standardized in RFC 9230, adds a proxy layer between clients and resolvers to prevent even the resolver from learning which client made which query. **DNS over QUIC (DoQ)**, specified in RFC 9250, leverages the QUIC transport protocol for lower-latency encrypted DNS with 0-RTT connection establishment.

On the security front, **Certificate Transparency enforcement** through CAA records and browser CT policies is becoming stricter, making DNS configuration increasingly important for TLS security. **Encrypted Client Hello (ECH)**, which encrypts the TLS handshake's server name indication, works in conjunction with DNS to distribute encryption keys via HTTPS resource records.

For the Prismatic Platform, future DNS-related developments include deeper integration of passive DNS intelligence feeds into the EASM scoring engine, real-time DNS change monitoring for tracked domains, and automated subdomain takeover detection using DNS record lifecycle analysis.

## See Also

- [DNS Enumeration](/glossary/dns-enumeration/) -- the systematic process of discovering DNS records for intelligence gathering, a core capability of the Prismatic Perimeter EASM module
- [Attack Surface](/glossary/attack-surface/) -- DNS records expose the external-facing components of an organization's infrastructure, making DNS a primary vector for attack surface discovery
- [EASM](/glossary/easm/) -- External Attack Surface Management relies heavily on DNS intelligence to map and monitor an organization's internet-facing assets
- [Certificate Transparency](/glossary/certificate-transparency/) -- CT logs complement DNS enumeration by revealing certificates issued for domains and subdomains
- [TLS](/glossary/tls/) -- Transport Layer Security depends on DNS for certificate validation, CAA enforcement, and secure connection establishment
- [Security Rating](/glossary/security-rating/) -- DNS configuration quality (DNSSEC, CAA, SPF/DKIM) contributes directly to an organization's security rating score
- [OSINT](/glossary/osint/) -- DNS data is a foundational open-source intelligence source for security investigations and due diligence
- [Monitoring](/glossary/monitoring/) -- DNS resolution timing and query patterns are essential infrastructure health metrics
- [Distributed System](/glossary/distributed-system/) -- DNS-based service discovery enables distributed Elixir clusters to form and maintain connectivity
- [WHOIS](/glossary/whois/) -- domain registration data from WHOIS complements DNS records to provide ownership and administrative context
- [Shodan](/glossary/shodan/) -- correlating DNS records with Shodan's internet-wide scanning data reveals services running on discovered IP addresses
- [Fly.io](/glossary/fly-io/) -- the platform's production hosting environment that uses DNS for Anycast routing and cluster formation

---

**Built with precision by the Prismatic Platform team.**

[GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
