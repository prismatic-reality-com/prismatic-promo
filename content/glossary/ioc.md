+++
title = "IOC (Indicator of Compromise)"
weight = 50
[extra]
description = "Observable artifact or evidence that indicates a system has been breached or is under active attack, used for threat detection and incident response."
category = "security"
related_terms = ["threat-intelligence", "osint", "incident-response", "malware"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["IOC", "indicator of compromise", "threat intelligence", "security", "OSINT", "glossary", "Prismatic Platform"]
tags = ["glossary", "security"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "IOC - Prismatic Platform"
+++

## Definition & Overview

An Indicator of Compromise (IOC) is a piece of forensic evidence or observable artifact that suggests a computer system, network, or application has been breached or is under active attack. IOCs serve as digital fingerprints left behind by threat actors, enabling security teams to detect intrusions, scope incidents, and share threat intelligence across organizations. Common IOC types include malicious IP addresses, domain names, file hashes (MD5, SHA-256), email addresses, URL patterns, registry modifications, and unusual network traffic signatures.

IOCs are foundational to modern threat intelligence and security operations. When a new malware variant is discovered, its IOCs (file hashes, command-and-control domains, mutexes) are extracted and shared through feeds like STIX/TAXII, MISP, or commercial threat intelligence platforms. Organizations then use these IOCs to scan their environments for signs of the same threat, enabling proactive defense and rapid incident response.

The Prismatic Platform's OSINT capabilities are deeply integrated with IOC processing. The 127 OSINT tools include multiple threat intelligence adapters that query IOC databases, validate suspicious indicators, and correlate findings across multiple sources. The platform's NABLA framework ensures IOC-based claims maintain signal plurality (multiple independent confirmations) and provenance tracking (tracing each IOC back to its original source).

## Technical Deep Dive

IOCs exist on a spectrum of specificity and perishability. Atomic IOCs (individual IP addresses, file hashes) are highly specific but perishable: attackers rotate infrastructure frequently. Computed IOCs (YARA rules, behavioral signatures) are more durable because they describe patterns rather than specific values. Behavioral IOCs (techniques and tactics mapped to MITRE ATT&CK) are the most durable but least actionable without additional context.

The IOC lifecycle involves collection, validation, enrichment, correlation, and consumption. Collection gathers raw indicators from honeypots, malware analysis, incident reports, and open-source feeds. Validation confirms the IOC is active and relevant (an IP that was malicious last month may be reassigned to a legitimate host today). Enrichment adds context such as geolocation, WHOIS data, passive DNS history, and related IOCs. Correlation links IOCs to threat actors, campaigns, and techniques. Consumption integrates IOCs into detection systems (SIEM rules, firewall blocklists, EDR signatures).

```elixir
defmodule PrismaticOsintCore.Ioc do
  @moduledoc """
  IOC data structure and validation for the Prismatic Platform.
  Supports atomic and computed indicator types with confidence scoring.
  """

  @type ioc_type ::
    :ip_address | :domain | :url | :file_hash_md5 | :file_hash_sha256 |
    :email | :mutex | :registry_key | :yara_rule | :certificate_hash

  @type confidence :: :low | :medium | :high | :confirmed

  @type t :: %__MODULE__{
    type: ioc_type(),
    value: String.t(),
    confidence: confidence(),
    first_seen: DateTime.t(),
    last_seen: DateTime.t(),
    sources: [String.t()],
    tags: [String.t()],
    ttl_hours: pos_integer(),
    metadata: map()
  }

  defstruct [
    :type,
    :value,
    :confidence,
    :first_seen,
    :last_seen,
    sources: [],
    tags: [],
    ttl_hours: 720,
    metadata: %{}
  ]

  @spec validate(t()) :: {:ok, t()} | {:error, [String.t()]}
  def validate(%__MODULE__{} = ioc) do
    errors =
      []
      |> validate_type(ioc)
      |> validate_value(ioc)
      |> validate_freshness(ioc)

    case errors do
      [] -> {:ok, ioc}
      errors -> {:error, errors}
    end
  end

  defp validate_type(errors, %{type: type}) when type in [
    :ip_address, :domain, :url, :file_hash_md5, :file_hash_sha256,
    :email, :mutex, :registry_key, :yara_rule, :certificate_hash
  ], do: errors
  defp validate_type(errors, _), do: ["invalid IOC type" | errors]

  defp validate_value(errors, %{type: :ip_address, value: value}) do
    case :inet.parse_address(String.to_charlist(value)) do
      {:ok, _} -> errors
      {:error, _} -> ["invalid IP address format" | errors]
    end
  end

  defp validate_value(errors, %{type: :file_hash_sha256, value: value}) do
    if Regex.match?(~r/^[a-fA-F0-9]{64}$/, value),
      do: errors,
      else: ["invalid SHA-256 hash format" | errors]
  end

  defp validate_value(errors, _), do: errors

  defp validate_freshness(errors, %{last_seen: last_seen, ttl_hours: ttl}) do
    expiry = DateTime.add(last_seen, ttl * 3600, :second)

    if DateTime.compare(DateTime.utc_now(), expiry) == :gt,
      do: ["IOC has expired (TTL exceeded)" | errors],
      else: errors
  end
end
```

False positives are a significant challenge in IOC-based detection. Legitimate services may share IP addresses with malicious actors (cloud hosting), domain names may be repurposed after takedowns, and file hashes may collide with benign software. The Prismatic Platform addresses this through confidence scoring and the NABLA plurality requirement: an IOC-based alert requires confirmation from at least two independent sources before being treated as actionable intelligence.

## Architecture & Implementation

The platform's IOC processing pipeline spans multiple OSINT adapters. VirusTotal, Shodan, Censys, and AlienVault OTX adapters each provide IOC lookup capabilities. When a user queries an indicator, the platform can fan out to multiple sources simultaneously, aggregate results, and present a unified confidence assessment that accounts for source independence and temporal freshness.

IOC storage uses the DD pipeline's entity model, treating each IOC as an entity with typed attributes. Relationships between IOCs (an IP hosting a malicious domain that serves a malicious file) are stored as DD relationships, enabling graph-based threat analysis. The KuzuDB adapter provides efficient multi-hop relationship queries for threat actor infrastructure mapping.

The Perimeter module consumes IOC feeds to enhance security ratings. When an organization's assets (domains, IPs) appear in IOC databases, the security score is adjusted proportionally to the severity and freshness of the indicators, with appropriate confidence weighting.

## Usage in Prismatic Platform

Multi-source IOC enrichment in practice:

```elixir
defmodule PrismaticOsintCore.Enrichment.IocEnricher do
  @moduledoc """
  Enriches IOCs by querying multiple OSINT sources in parallel
  and aggregating results with NABLA-compliant confidence scoring.
  """

  alias PrismaticOsintCore.Ioc

  @sources [
    {"virustotal", PrismaticOsintCore.Adapters.VirusTotal},
    {"shodan", PrismaticOsintCore.Adapters.Shodan},
    {"censys", PrismaticOsintCore.Adapters.Censys}
  ]

  @spec enrich(Ioc.t()) :: {:ok, Ioc.t()} | {:error, term()}
  def enrich(%Ioc{} = ioc) do
    results =
      @sources
      |> Task.async_stream(fn {name, module} ->
        {name, module.lookup(ioc.type, ioc.value)}
      end, timeout: 10_000, on_timeout: :kill_task)
      |> Enum.reduce([], fn
        {:ok, {name, {:ok, data}}}, acc -> [{name, data} | acc]
        _, acc -> acc
      end)

    enriched = %{ioc |
      sources: Enum.map(results, &elem(&1, 0)),
      confidence: compute_confidence(results),
      metadata: merge_metadata(results)
    }

    {:ok, enriched}
  end

  defp compute_confidence(results) do
    positive_count = Enum.count(results, fn {_, data} -> data.malicious end)

    case positive_count do
      n when n >= 3 -> :confirmed
      n when n >= 2 -> :high
      1 -> :medium
      0 -> :low
    end
  end

  defp merge_metadata(results) do
    Enum.reduce(results, %{}, fn {source, data}, acc ->
      Map.put(acc, source, data.details)
    end)
  end
end
```

This multi-source approach, combined with NABLA's signal plurality requirement, ensures that IOC-based intelligence claims in the Prismatic Platform are robust against individual source errors and manipulation.

## Cross-References

- [Threat Intelligence](/glossary/threat-intelligence/) - Broader intelligence context for IOCs
- [OSINT](/glossary/osint/) - Open-source intelligence gathering including IOC collection
- [Incident Response](/glossary/incident-response/) - Operational use of IOCs during breaches
- **MITRE ATT&CK** - Framework for classifying IOC-related techniques
- **Penetration Test** - Controlled testing that may generate IOCs

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
