+++
title = "Threat Intelligence Feeds: Real-Time IOC Ingestion with GenServer"
date = 2026-03-04
description = "Building a threat intelligence feed aggregator in Elixir: integrating abuse.ch, AlienVault OTX, and MISP format feeds with IOC correlation, feed reliability scoring, and real-time GenServer ingestion."

[extra]
author = "Tomas Korcak (korczis)"
category = "intelligence"
tags = ["threat-intelligence", "ioc", "genserver", "misp", "elixir"]
reading_time = "9 min"
keywords = ["threat intelligence feeds", "ioc correlation", "abuse.ch", "alienvault otx", "misp format"]
image = "/images/blog/threat-intelligence-feeds.png"
word_count = 1080
date_created = "2026-03-04"
date_modified = "2026-03-04"
quality_score = 85
see_also = ["architecture", "developers"]
image_alt = "Threat Intelligence Feeds - Prismatic Platform"
+++

## The Feed Aggregation Problem

Threat intelligence feeds provide streams of Indicators of Compromise (IOCs) — IP addresses, domain names, file hashes, and URLs associated with malicious activity. No single feed is comprehensive or perfectly reliable. Effective threat intelligence requires aggregating multiple feeds, correlating overlapping indicators, and scoring feed reliability based on historical accuracy.

The challenge is both technical and analytical. Feeds use different formats (STIX, MISP, CSV, custom JSON), update at different intervals, and have vastly different false positive rates. A production-grade ingestion system must handle all of this while maintaining sub-second query latency against the consolidated IOC database.

## Feed Registry and Configuration

Each feed has distinct characteristics that govern how we ingest and weight its data:

| Feed | Format | Update Interval | IOC Types | Typical Volume |
|------|--------|----------------|-----------|----------------|
| abuse.ch URLhaus | CSV/JSON | 5 min | URLs, domains | 500K+ total |
| abuse.ch MalBazaar | JSON | 10 min | File hashes (SHA256) | 300K+ total |
| AlienVault OTX | JSON (Pulse) | Real-time | IPs, domains, hashes, URLs | 1M+ pulses |
| MISP Community | MISP JSON | Varies | All IOC types | Varies by instance |
| Emerging Threats | Suricata rules | Daily | IPs, domains | 40K+ rules |
| Blocklist.de | Text | Hourly | IP addresses | 25K+ IPs |

```elixir
defmodule Prismatic.ThreatIntel.FeedRegistry do
  @moduledoc """
  Registry of configured threat intelligence feeds.
  Manages feed metadata, scheduling, and reliability scores.
  """

  use GenServer

  require Logger

  @feeds [
    %{
      id: :urlhaus,
      name: "abuse.ch URLhaus",
      url: "https://urlhaus-api.abuse.ch/v1/urls/recent/",
      parser: Prismatic.ThreatIntel.Parsers.URLhaus,
      poll_interval_ms: 300_000,
      ioc_types: [:url, :domain],
      default_confidence: 0.85
    },
    %{
      id: :malbazaar,
      name: "abuse.ch MalBazaar",
      url: "https://mb-api.abuse.ch/api/v1/",
      parser: Prismatic.ThreatIntel.Parsers.MalBazaar,
      poll_interval_ms: 600_000,
      ioc_types: [:sha256, :sha1, :md5],
      default_confidence: 0.90
    },
    %{
      id: :otx,
      name: "AlienVault OTX",
      url: "https://otx.alienvault.com/api/v1/pulses/subscribed",
      parser: Prismatic.ThreatIntel.Parsers.OTX,
      poll_interval_ms: 60_000,
      ioc_types: [:ip, :domain, :url, :sha256],
      default_confidence: 0.75
    }
  ]

  def start_link(opts), do: GenServer.start_link(__MODULE__, opts, name: __MODULE__)

  @impl true
  def init(_opts) do
    table = :ets.new(:threat_iocs, [:set, :named_table, read_concurrency: true])
    reliability_table = :ets.new(:feed_reliability, [:set, :named_table, read_concurrency: true])

    Enum.each(@feeds, fn feed ->
      :ets.insert(reliability_table, {feed.id, feed.default_confidence, 0, 0})
      Process.send_after(self(), {:poll_feed, feed}, 1_000)
    end)

    {:ok, %{ioc_table: table, reliability_table: reliability_table, stats: %{}}}
  end
end
```

## GenServer Feed Ingestion

Each feed poll fetches new indicators, parses them into a normalized format, and merges them into the consolidated IOC table. The GenServer manages polling schedules and tracks per-feed statistics:

```elixir
@impl true
def handle_info({:poll_feed, feed}, state) do
  start_time = System.monotonic_time(:millisecond)

  result =
    case fetch_feed(feed) do
      {:ok, raw_data} ->
        iocs = feed.parser.parse(raw_data)
        inserted = ingest_iocs(iocs, feed, state.ioc_table)

        :telemetry.execute(
          [:prismatic, :threat_intel, :feed_poll],
          %{count: length(iocs), inserted: inserted,
            duration_ms: System.monotonic_time(:millisecond) - start_time},
          %{feed_id: feed.id}
        )

        {:ok, inserted}

      {:error, reason} ->
        Logger.warning("Feed poll failed for #{feed.name}: #{inspect(reason)}")
        update_reliability(feed.id, :failure, state.reliability_table)
        {:error, reason}
    end

  Process.send_after(self(), {:poll_feed, feed}, feed.poll_interval_ms)
  new_stats = Map.put(state.stats, feed.id, %{last_poll: DateTime.utc_now(), result: result})
  {:noreply, %{state | stats: new_stats}}
end

defp ingest_iocs(iocs, feed, table) do
  Enum.reduce(iocs, 0, fn ioc, count ->
    normalized = %{
      indicator: ioc.value,
      type: ioc.type,
      sources: MapSet.new([feed.id]),
      first_seen: DateTime.utc_now(),
      last_seen: DateTime.utc_now(),
      tags: ioc.tags || [],
      threat_type: ioc.threat_type,
      confidence: calculate_ioc_confidence(ioc, feed)
    }

    case :ets.lookup(table, {ioc.type, ioc.value}) do
      [{_key, existing}] ->
        merged = merge_ioc(existing, normalized)
        :ets.insert(table, {{ioc.type, ioc.value}, merged})
        count

      [] ->
        :ets.insert(table, {{ioc.type, ioc.value}, normalized})
        count + 1
    end
  end)
end
```

## IOC Correlation Engine

When multiple feeds report the same indicator, confidence increases. The correlation engine merges observations and calculates a composite score:

```elixir
defmodule Prismatic.ThreatIntel.Correlator do
  @moduledoc """
  Correlates IOCs across multiple feeds, calculating composite
  confidence scores based on multi-source consensus.
  """

  @spec lookup(atom(), String.t()) :: {:ok, map()} | :not_found
  def lookup(type, value) do
    case :ets.lookup(:threat_iocs, {type, value}) do
      [{_key, ioc}] -> {:ok, enrich_with_correlation(ioc)}
      [] -> :not_found
    end
  end

  @spec bulk_lookup(list({atom(), String.t()})) :: list(map())
  def bulk_lookup(indicators) do
    indicators
    |> Enum.map(fn {type, value} -> lookup(type, value) end)
    |> Enum.filter(&match?({:ok, _}, &1))
    |> Enum.map(fn {:ok, ioc} -> ioc end)
  end

  defp enrich_with_correlation(ioc) do
    source_count = MapSet.size(ioc.sources)

    multi_source_bonus =
      case source_count do
        1 -> 0.0
        2 -> 0.10
        3 -> 0.15
        _ -> 0.20
      end

    age_factor = calculate_age_factor(ioc.first_seen)

    adjusted_confidence =
      min(ioc.confidence + multi_source_bonus, 1.0) * age_factor

    Map.merge(ioc, %{
      source_count: source_count,
      correlated_confidence: Float.round(adjusted_confidence, 3),
      age_days: DateTime.diff(DateTime.utc_now(), ioc.first_seen, :day)
    })
  end

  defp calculate_age_factor(first_seen) do
    age_days = DateTime.diff(DateTime.utc_now(), first_seen, :day)

    cond do
      age_days < 1 -> 1.0
      age_days < 7 -> 0.95
      age_days < 30 -> 0.85
      age_days < 90 -> 0.70
      age_days < 365 -> 0.50
      true -> 0.30
    end
  end
end
```

## Feed Reliability Scoring

Feeds are not equally trustworthy. We track each feed's historical accuracy by correlating its IOCs against confirmed incidents and measuring false positive rates:

| Reliability Metric | Calculation | Weight |
|-------------------|-------------|--------|
| True positive rate | Confirmed malicious / total reported | 0.40 |
| Timeliness | Average time to first report | 0.25 |
| Coverage overlap | % also reported by 2+ other feeds | 0.20 |
| Uptime | Successful polls / total polls | 0.15 |

```elixir
defp update_reliability(feed_id, outcome, table) do
  case :ets.lookup(table, feed_id) do
    [{^feed_id, score, successes, failures}] ->
      {new_successes, new_failures} =
        case outcome do
          :success -> {successes + 1, failures}
          :failure -> {successes, failures + 1}
        end

      total = new_successes + new_failures
      uptime = if total > 0, do: new_successes / total, else: 1.0
      new_score = score * 0.95 + uptime * 0.05

      :ets.insert(table, {feed_id, Float.round(new_score, 3), new_successes, new_failures})

    [] ->
      :ets.insert(table, {feed_id, 0.5, 0, 1})
  end
end
```

## MISP Format Support

MISP (Malware Information Sharing Platform) has become the de facto standard for structured threat intelligence exchange. Our parser handles MISP events with their attributes, galaxies, and tag taxonomies:

```elixir
defmodule Prismatic.ThreatIntel.Parsers.MISP do
  @moduledoc """
  Parses MISP-format threat intelligence events into normalized IOCs.
  """

  @spec parse(map()) :: list(map())
  def parse(%{"Event" => event}) do
    attributes = event["Attribute"] || []
    event_tags = extract_tags(event["Tag"] || [])

    Enum.map(attributes, fn attr ->
      %{
        value: attr["value"],
        type: map_misp_type(attr["type"]),
        tags: event_tags ++ extract_tags(attr["Tag"] || []),
        threat_type: infer_threat_type(event_tags),
        misp_event_id: event["id"],
        misp_category: attr["category"],
        first_seen: parse_timestamp(attr["first_seen"]),
        comment: attr["comment"]
      }
    end)
    |> Enum.filter(&(&1.type != :unknown))
  end

  defp map_misp_type("ip-dst"), do: :ip
  defp map_misp_type("ip-src"), do: :ip
  defp map_misp_type("domain"), do: :domain
  defp map_misp_type("hostname"), do: :domain
  defp map_misp_type("url"), do: :url
  defp map_misp_type("sha256"), do: :sha256
  defp map_misp_type("sha1"), do: :sha1
  defp map_misp_type("md5"), do: :md5
  defp map_misp_type("email-src"), do: :email
  defp map_misp_type(_), do: :unknown
end
```

## Production Architecture

The threat intelligence subsystem runs as an OTP application with a supervision tree that isolates feed polling from query serving. Feed pollers are supervised individually — if one feed's API goes down, others continue operating. The ETS-backed IOC table provides sub-microsecond lookups for real-time scanning, while periodic snapshots persist the state to disk for crash recovery.

The system processes approximately 50,000 new IOCs daily across all feeds, maintaining a rolling window of active indicators with automatic expiry for aged-out entries. This feeds directly into the platform's investigation workflows, where every discovered IP, domain, and hash is automatically checked against the consolidated threat intelligence database.
