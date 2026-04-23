+++
title = "DNS Intelligence and Enumeration: Passive DNS and Security Scoring in Elixir"
date = 2026-03-02
description = "Building DNS intelligence capabilities in Elixir: zone transfer detection, passive DNS analysis, DNSSEC validation, SPF/DKIM/DMARC security scoring, and DNS resolver patterns for OSINT platforms."

[extra]
author = "Tomas Korcak (korczis)"
category = "intelligence"
tags = ["dns", "osint", "elixir", "dnssec", "passive-dns"]
reading_time = "8 min"
keywords = ["dns intelligence", "passive dns", "dnssec validation", "spf dkim dmarc", "dns enumeration"]
image = "/images/blog/dns-intelligence-enumeration.png"
word_count = 1060
date_created = "2026-03-02"
date_modified = "2026-03-02"
quality_score = 85
see_also = ["dns", "osint", "attack-surface", "easm", "threat-intelligence"]
image_alt = "DNS Intelligence and Enumeration - Prismatic Platform"
+++

## DNS as an Intelligence Layer

DNS is the nervous system of the internet. Every domain, every service, every piece of infrastructure relies on DNS resolution. For intelligence platforms, DNS data reveals infrastructure topology, hosting relationships, email security posture, and historical changes that other data sources miss.

Unlike active scanning tools that touch target infrastructure, passive DNS analysis reconstructs DNS history from previously observed resolutions. This lets you map infrastructure changes over time without generating any traffic toward the target — a critical distinction for sensitive investigations.

## Elixir DNS Resolver

Erlang's built-in `:inet_res` module provides DNS resolution, but it lacks support for advanced record types and DNSSEC. We build a resolver that handles all common record types and provides structured output:

```elixir
defmodule Prismatic.OSINT.DNS.Resolver do
  @moduledoc """
  Structured DNS resolver supporting all common record types.
  Wraps :inet_res with timeout handling and result normalization.
  """

  require Logger

  @default_timeout 5_000
  @record_types [:a, :aaaa, :mx, :ns, :txt, :cname, :soa, :srv, :ptr, :caa]

  @type dns_result :: %{
    domain: String.t(),
    record_type: atom(),
    records: list(map()),
    ttl: non_neg_integer() | nil,
    query_time_ms: non_neg_integer()
  }

  @spec resolve(String.t(), atom(), keyword()) :: {:ok, dns_result()} | {:error, term()}
  def resolve(domain, type \\ :a, opts \\ []) when type in @record_types do
    timeout = Keyword.get(opts, :timeout, @default_timeout)
    nameservers = Keyword.get(opts, :nameservers, [])

    start_time = System.monotonic_time(:millisecond)
    domain_charlist = String.to_charlist(domain)

    resolve_opts =
      if nameservers != [] do
        [{:nameservers, Enum.map(nameservers, &parse_nameserver/1)}]
      else
        []
      end

    result = :inet_res.resolve(domain_charlist, :in, type, resolve_opts, timeout)
    elapsed = System.monotonic_time(:millisecond) - start_time

    case result do
      {:ok, msg} ->
        records = extract_records(msg, type)
        {:ok, %{
          domain: domain,
          record_type: type,
          records: records,
          ttl: extract_min_ttl(msg),
          query_time_ms: elapsed
        }}

      {:error, reason} ->
        {:error, {reason, domain, type}}
    end
  end

  @spec resolve_all(String.t(), keyword()) :: map()
  def resolve_all(domain, opts \\ []) do
    @record_types
    |> Task.async_stream(fn type -> {type, resolve(domain, type, opts)} end,
      max_concurrency: 4, timeout: 10_000)
    |> Enum.reduce(%{domain: domain, records: %{}}, fn
      {:ok, {type, {:ok, result}}}, acc ->
        put_in(acc, [:records, type], result.records)

      {:ok, {type, {:error, _}}}, acc ->
        put_in(acc, [:records, type], [])

      {:exit, _}, acc ->
        acc
    end)
  end
end
```

## Zone Transfer Detection

Misconfigured DNS servers that allow zone transfers (AXFR) expose the entire domain's record set. Detecting this misconfiguration is both a security finding and an intelligence opportunity:

```elixir
defmodule Prismatic.OSINT.DNS.ZoneTransfer do
  @moduledoc """
  Detects DNS zone transfer (AXFR) misconfiguration.
  Attempts AXFR against all authoritative nameservers for a domain.
  """

  require Logger

  @spec check(String.t()) :: {:vulnerable, list(map())} | :secure | {:error, term()}
  def check(domain) do
    case Prismatic.OSINT.DNS.Resolver.resolve(domain, :ns) do
      {:ok, %{records: ns_records}} ->
        results =
          ns_records
          |> Enum.map(& &1.value)
          |> Enum.map(fn ns -> {ns, attempt_axfr(domain, ns)} end)

        vulnerable = Enum.filter(results, fn {_ns, result} -> match?({:ok, _}, result) end)

        if vulnerable != [] do
          {:vulnerable, Enum.map(vulnerable, fn {ns, {:ok, records}} ->
            %{nameserver: ns, record_count: length(records), records: records}
          end)}
        else
          :secure
        end

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp attempt_axfr(domain, nameserver) do
    domain_charlist = String.to_charlist(domain)

    case resolve_nameserver_ip(nameserver) do
      {:ok, ip} ->
        case :inet_res.resolve(domain_charlist, :in, :axfr,
               [{:nameservers, [{ip, 53}]}], 10_000) do
          {:ok, msg} -> {:ok, extract_axfr_records(msg)}
          {:error, _} -> :refused
        end

      {:error, _} ->
        :unresolvable
    end
  end
end
```

## Email Security Scoring (SPF/DKIM/DMARC)

Email authentication records reveal an organization's security maturity. We parse and score all three major email authentication mechanisms:

| Record | Purpose | Score Weight | Best Practice |
|--------|---------|-------------|---------------|
| SPF | Authorized mail senders | 0.30 | `-all` (hard fail) |
| DKIM | Message integrity verification | 0.35 | 2048-bit RSA or Ed25519 |
| DMARC | Policy enforcement + reporting | 0.35 | `p=reject` with rua/ruf |

```elixir
defmodule Prismatic.OSINT.DNS.EmailSecurity do
  @moduledoc """
  Scores email security posture by analyzing SPF, DKIM, and DMARC records.
  """

  @spec score(String.t()) :: {:ok, map()} | {:error, term()}
  def score(domain) do
    with {:ok, spf} <- check_spf(domain),
         {:ok, dmarc} <- check_dmarc(domain),
         dkim_result <- check_dkim(domain) do
      spf_score = score_spf(spf)
      dkim_score = score_dkim(dkim_result)
      dmarc_score = score_dmarc(dmarc)

      overall = spf_score * 0.30 + dkim_score * 0.35 + dmarc_score * 0.35

      {:ok, %{
        domain: domain,
        overall_score: Float.round(overall, 2),
        grade: score_to_grade(overall),
        spf: %{record: spf, score: spf_score, details: analyze_spf(spf)},
        dkim: %{score: dkim_score, details: dkim_result},
        dmarc: %{record: dmarc, score: dmarc_score, details: analyze_dmarc(dmarc)}
      }}
    end
  end

  defp check_spf(domain) do
    case Prismatic.OSINT.DNS.Resolver.resolve(domain, :txt) do
      {:ok, %{records: records}} ->
        spf = Enum.find(records, fn r ->
          String.starts_with?(r.value, "v=spf1")
        end)
        {:ok, spf && spf.value}

      error -> error
    end
  end

  defp score_spf(nil), do: 0.0
  defp score_spf(record) do
    cond do
      String.contains?(record, "-all") -> 1.0
      String.contains?(record, "~all") -> 0.7
      String.contains?(record, "?all") -> 0.3
      String.contains?(record, "+all") -> 0.1
      true -> 0.5
    end
  end

  defp analyze_dmarc(nil), do: %{policy: :none, configured: false}
  defp analyze_dmarc(record) do
    policy = extract_dmarc_tag(record, "p")
    rua = extract_dmarc_tag(record, "rua")
    ruf = extract_dmarc_tag(record, "ruf")
    pct = extract_dmarc_tag(record, "pct") || "100"

    %{
      policy: policy,
      configured: true,
      aggregate_reporting: rua != nil,
      forensic_reporting: ruf != nil,
      percentage: String.to_integer(pct)
    }
  end

  defp score_to_grade(score) when score >= 0.9, do: "A"
  defp score_to_grade(score) when score >= 0.7, do: "B"
  defp score_to_grade(score) when score >= 0.5, do: "C"
  defp score_to_grade(score) when score >= 0.3, do: "D"
  defp score_to_grade(_), do: "F"
end
```

## Passive DNS Integration

Passive DNS data comes from sensors that record DNS queries and responses without actively querying targets. We integrate with passive DNS providers to build historical resolution timelines:

| Provider | Coverage | History Depth | Rate Limit |
|----------|----------|---------------|------------|
| Farsight DNSDB | Global | 10+ years | Per-query pricing |
| SecurityTrails | Global | 5+ years | 50/month (free) |
| PassiveTotal | Global | 8+ years | 15/day (community) |
| VirusTotal pDNS | Global | 3+ years | Included with VT API |

```elixir
@spec passive_lookup(String.t(), keyword()) :: {:ok, list(map())} | {:error, term()}
def passive_lookup(domain, opts \\ []) do
  providers = Keyword.get(opts, :providers, [:security_trails, :virustotal])

  results =
    providers
    |> Task.async_stream(&fetch_passive(&1, domain), max_concurrency: 3, timeout: 15_000)
    |> Enum.flat_map(fn
      {:ok, {:ok, records}} -> records
      _ -> []
    end)
    |> Enum.uniq_by(&{&1.rrname, &1.rrtype, &1.rdata})
    |> Enum.sort_by(& &1.first_seen, {:desc, DateTime})

  {:ok, results}
end
```

## DNSSEC Validation

DNSSEC adds cryptographic signatures to DNS responses, preventing cache poisoning and man-in-the-middle attacks. Validating DNSSEC provides insight into an organization's DNS security posture and helps detect tampering in active investigations.

The DNS intelligence module integrates with the platform's entity enrichment pipeline. When an investigation discovers a domain, the module automatically resolves all record types, checks email security, queries passive DNS history, and scores the overall DNS security posture. Results feed into the confidence scoring engine, where DNS-derived intelligence is weighted against other OSINT sources to produce a composite reliability assessment.
