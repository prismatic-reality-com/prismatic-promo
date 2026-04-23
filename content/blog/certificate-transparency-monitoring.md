+++
title = "Certificate Transparency Monitoring: Real-Time Subdomain Discovery in Elixir"
date = 2026-02-27
description = "Implementing Certificate Transparency log monitoring in Elixir for continuous subdomain discovery, phishing detection from SAN fields, and real-time certificate stream processing with GenServer."

[extra]
author = "Tomas Korcak (korczis)"
category = "intelligence"
tags = ["certificate-transparency", "subdomain-discovery", "elixir", "genserver", "phishing"]
reading_time = "8 min"
keywords = ["certificate transparency", "ct logs", "subdomain enumeration", "phishing detection", "elixir genserver"]
image = "/images/blog/certificate-transparency-monitoring.png"
word_count = 1020
date_created = "2026-02-27"
date_modified = "2026-02-27"
quality_score = 85
see_also = ["easm", "attack-surface", "dns", "threat-intelligence", "osint"]
image_alt = "Certificate Transparency Monitoring - Prismatic Platform"
+++

## Certificate Transparency as an Intelligence Source

Certificate Transparency (CT) logs are append-only, publicly auditable records of every TLS certificate issued by participating Certificate Authorities. Every time a CA issues a certificate for `login.example.com` or `vpn-internal.corp.net`, that fact becomes public record. For intelligence platforms, CT logs are a goldmine: they reveal subdomain structures, infrastructure changes, and potential phishing domains in real time.

The challenge is volume. Major CT logs process millions of certificates daily. An effective monitoring system must stream these entries continuously, extract actionable intelligence from Subject Alternative Name (SAN) fields, and alert on patterns that indicate phishing or unauthorized certificate issuance.

## CT Log Stream Architecture

Our CT monitor uses a GenServer that polls CT log servers via their RFC 6962 API. Each log maintains a Merkle tree of certificate entries, and we track our position using the tree size:

```elixir
defmodule Prismatic.OSINT.CT.Monitor do
  @moduledoc """
  Continuous Certificate Transparency log monitor.
  Streams certificate entries, extracts domains from SAN fields,
  and detects phishing patterns in real time.
  """

  use GenServer

  require Logger

  @poll_interval_ms 30_000
  @batch_size 256
  @ct_logs [
    %{name: "Google Argon", url: "https://ct.googleapis.com/logs/argon2025h1"},
    %{name: "Cloudflare Nimbus", url: "https://ct.cloudflare.com/logs/nimbus2025"},
    %{name: "DigiCert Yeti", url: "https://yeti2025.ct.digicert.com/log"}
  ]

  defstruct [
    :watched_domains,
    log_positions: %{},
    stats: %{processed: 0, matches: 0, phishing_alerts: 0}
  ]

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    watched = Keyword.get(opts, :watched_domains, [])
    GenServer.start_link(__MODULE__, watched, name: __MODULE__)
  end

  @impl true
  def init(watched_domains) do
    state = %__MODULE__{
      watched_domains: MapSet.new(watched_domains)
    }

    Enum.each(@ct_logs, fn log ->
      Process.send_after(self(), {:poll_log, log}, 1_000)
    end)

    {:ok, state}
  end

  @impl true
  def handle_info({:poll_log, log}, state) do
    new_state =
      case fetch_entries(log, state) do
        {:ok, entries, new_position} ->
          domains = extract_all_domains(entries)
          matches = filter_watched(domains, state.watched_domains)
          phishing = detect_phishing(domains, state.watched_domains)

          broadcast_matches(matches)
          broadcast_phishing_alerts(phishing)

          positions = Map.put(state.log_positions, log.name, new_position)
          stats = %{
            state.stats
            | processed: state.stats.processed + length(entries),
              matches: state.stats.matches + length(matches),
              phishing_alerts: state.stats.phishing_alerts + length(phishing)
          }

          %{state | log_positions: positions, stats: stats}

        {:error, reason} ->
          Logger.warning("CT poll failed for #{log.name}: #{inspect(reason)}")
          state
      end

    Process.send_after(self(), {:poll_log, log}, @poll_interval_ms)
    {:noreply, new_state}
  end
end
```

## SAN Field Extraction

Each certificate can contain dozens of domain names in the Subject Alternative Name extension. Parsing these requires handling both the leaf certificate and any pre-certificates:

```elixir
defp extract_all_domains(entries) do
  entries
  |> Enum.flat_map(&extract_san_domains/1)
  |> Enum.uniq()
end

defp extract_san_domains(%{"leaf_cert" => cert}) do
  all_domains = Map.get(cert, "all_domains", [])
  subject_cn = get_in(cert, ["subject", "CN"]) || ""

  ([subject_cn | all_domains])
  |> Enum.reject(&(&1 == "" or &1 == "*"))
  |> Enum.map(&clean_domain/1)
  |> Enum.uniq()
end

defp extract_san_domains(_), do: []

defp clean_domain(domain) do
  domain
  |> String.downcase()
  |> String.trim_leading("*.")
  |> String.trim()
end
```

## Phishing Detection Patterns

Phishing domains often mimic legitimate brands through typosquatting, homoglyph substitution, or strategic subdomain placement. Our detector scores each discovered domain against the watched list using multiple similarity algorithms:

| Detection Method | Description | Example Match |
|-----------------|-------------|---------------|
| Levenshtein distance | Edit distance <= 2 from watched domain | `examp1e.com` vs `example.com` |
| Homoglyph substitution | Unicode lookalike characters | `exаmple.com` (Cyrillic 'а') |
| Keyword embedding | Brand name as subdomain | `example-login.attacker.com` |
| TLD variation | Same name, different TLD | `example.xyz` vs `example.com` |
| Combosquatting | Brand + common suffix | `example-secure.com` |

```elixir
defp detect_phishing(domains, watched_domains) do
  watched_list = MapSet.to_list(watched_domains)

  Enum.flat_map(domains, fn domain ->
    Enum.flat_map(watched_list, fn watched ->
      scores = [
        {:levenshtein, levenshtein_score(domain, watched)},
        {:keyword_embed, keyword_embed_score(domain, watched)},
        {:tld_variation, tld_variation_score(domain, watched)},
        {:combosquat, combosquat_score(domain, watched)}
      ]

      max_score = scores |> Enum.map(&elem(&1, 1)) |> Enum.max()

      if max_score > 0.7 and domain != watched do
        method = scores |> Enum.max_by(&elem(&1, 1)) |> elem(0)
        [%{
          domain: domain,
          target: watched,
          method: method,
          score: max_score,
          detected_at: DateTime.utc_now()
        }]
      else
        []
      end
    end)
  end)
end

defp levenshtein_score(domain, watched) do
  base_a = extract_base_domain(domain)
  base_b = extract_base_domain(watched)
  distance = String.jaro_distance(base_a, base_b)
  if distance > 0.85 and base_a != base_b, do: distance, else: 0.0
end

defp keyword_embed_score(domain, watched) do
  brand = extract_base_domain(watched) |> String.split(".") |> List.first()

  if String.contains?(domain, brand) and
       extract_base_domain(domain) != extract_base_domain(watched) do
    0.85
  else
    0.0
  end
end
```

## Real-Time Broadcasting

When the monitor detects a match or phishing attempt, it broadcasts through Phoenix PubSub for real-time dashboard updates:

```elixir
defp broadcast_matches(matches) do
  Enum.each(matches, fn match ->
    Phoenix.PubSub.broadcast(
      Prismatic.PubSub,
      "ct:matches",
      {:ct_match, match}
    )

    :telemetry.execute(
      [:prismatic, :ct, :match],
      %{count: 1},
      %{domain: match.domain}
    )
  end)
end

defp broadcast_phishing_alerts(alerts) do
  Enum.each(alerts, fn alert ->
    Phoenix.PubSub.broadcast(
      Prismatic.PubSub,
      "ct:phishing",
      {:phishing_alert, alert}
    )

    Logger.warning(
      "Phishing detected: #{alert.domain} targeting #{alert.target} " <>
        "(method=#{alert.method}, score=#{alert.score})"
    )
  end)
end
```

## Production Deployment Considerations

Running CT monitoring in production requires addressing several scaling concerns. CT log servers can be slow or unreliable, so each log is polled independently with its own error backoff. Position tracking is persisted to ETS (and periodically to disk) so the monitor survives restarts without reprocessing millions of entries.

The watched domain list is managed dynamically — investigation workflows automatically add target domains, and completed cases remove them. This keeps the phishing detection focused and reduces false positives.

| Metric | Typical Value | Alert Threshold |
|--------|--------------|-----------------|
| Certificates processed per hour | 50,000 - 200,000 | N/A (informational) |
| Watched domain matches per day | 5 - 50 | > 100 (unusual activity) |
| Phishing alerts per day | 0 - 5 | > 10 (active campaign) |
| Log poll latency (p95) | 800ms | > 5,000ms (degraded) |
| Position drift (entries behind) | 0 - 1,000 | > 10,000 (falling behind) |

The CT monitor integrates with the broader OSINT mesh by publishing discovered subdomains to the entity enrichment pipeline. When a new subdomain appears for a watched domain, it automatically triggers DNS resolution, port scanning, and web technology fingerprinting — building a complete picture of infrastructure changes as they happen.
