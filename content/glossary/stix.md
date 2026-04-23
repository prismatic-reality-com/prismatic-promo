+++
title = "STIX"
weight = 50
[extra]
description = "Structured Threat Information eXpression - standardized JSON format for representing and sharing cyber threat intelligence data"
category = "security"
related_terms = ["taxii", "threat-feed", "osint", "ioc", "vulnerability", "cve", "mitre-attack"]
complexity_level = "advanced"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["STIX", "threat intelligence", "CTI", "structured data", "cybersecurity", "glossary", "Prismatic Platform"]
tags = ["glossary", "security", "threat-intelligence"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "STIX - Prismatic Platform"
+++

## Definition & Overview

Structured Threat Information eXpression (STIX) is an open standard language for representing cyber threat intelligence (CTI) in a machine-readable JSON format. Developed by OASIS (Organization for the Advancement of Structured Information Standards) and originally created by MITRE, STIX provides a common vocabulary and data model for describing threats, threat actors, attack patterns, indicators of compromise (IOCs), malware, tools, vulnerabilities, and the relationships between them.

STIX 2.1 (the current version) defines 18 STIX Domain Objects (SDOs) and 2 STIX Relationship Objects (SROs). SDOs represent the entities in the threat landscape: `attack-pattern`, `campaign`, `indicator`, `malware`, `threat-actor`, `vulnerability`, among others. SROs represent directed relationships between SDOs (e.g., "malware X uses technique Y"). Every STIX object has a unique identifier, creation timestamp, and standard metadata fields.

In the Prismatic Platform, STIX serves as the interchange format for threat intelligence data. The OSINT toolbox can produce STIX-formatted output when integrating with external threat intelligence platforms. The Perimeter EASM module maps vulnerability findings to STIX `vulnerability` objects. The platform's threat feed integration consumes STIX bundles from external sources via the TAXII protocol, normalizing them into the platform's internal signal format for NABLA epistemic processing.

## Technical Deep Dive

### STIX Object Representation

The platform models STIX objects as Elixir structs with validation:

```elixir
defmodule PrismaticThreatIntel.Stix.Object do
  @moduledoc """
  Base module for STIX 2.1 Domain Objects.
  Provides common fields and validation for all STIX types.
  """

  @type t :: %{
    type: String.t(),
    spec_version: String.t(),
    id: String.t(),
    created: DateTime.t(),
    modified: DateTime.t(),
    name: String.t() | nil,
    description: String.t() | nil,
    labels: [String.t()],
    external_references: [map()],
    object_marking_refs: [String.t()]
  }

  @stix_types ~w(
    attack-pattern campaign course-of-action grouping identity
    indicator infrastructure intrusion-set location malware
    malware-analysis note observed-data opinion report
    threat-actor tool vulnerability
  )

  @spec new(String.t(), map()) :: {:ok, map()} | {:error, term()}
  def new(type, attrs) when type in @stix_types do
    object = %{
      type: type,
      spec_version: "2.1",
      id: "#{type}--#{UUID.uuid4()}",
      created: DateTime.utc_now(),
      modified: DateTime.utc_now()
    }
    |> Map.merge(attrs)

    {:ok, object}
  end

  def new(type, _attrs), do: {:error, {:invalid_stix_type, type}}
end
```

### STIX Indicator Creation from OSINT Findings

The platform converts OSINT findings to STIX indicators:

```elixir
defmodule PrismaticThreatIntel.Stix.IndicatorBuilder do
  @moduledoc """
  Builds STIX 2.1 Indicator objects from OSINT findings.
  Maps platform signals to standardized threat intelligence format.
  """

  alias PrismaticThreatIntel.Stix.Object

  @spec from_osint_finding(map()) :: {:ok, map()} | {:error, term()}
  def from_osint_finding(%{type: :malicious_domain, domain: domain, confidence: conf}) do
    Object.new("indicator", %{
      name: "Malicious Domain: #{domain}",
      description: "Domain identified as malicious through OSINT analysis",
      indicator_types: ["malicious-activity"],
      pattern: "[domain-name:value = '#{domain}']",
      pattern_type: "stix",
      valid_from: DateTime.utc_now(),
      confidence: round(conf * 100),
      labels: ["malicious-activity", "osint"]
    })
  end

  def from_osint_finding(%{type: :suspicious_ip, ip: ip, confidence: conf, ports: ports}) do
    port_patterns = Enum.map(ports, &"network-traffic:dst_port = #{&1}")
    pattern = "[ipv4-addr:value = '#{ip}' AND (#{Enum.join(port_patterns, " OR ")})]"

    Object.new("indicator", %{
      name: "Suspicious IP: #{ip}",
      description: "IP address flagged through multi-source intelligence analysis",
      indicator_types: ["anomalous-activity"],
      pattern: pattern,
      pattern_type: "stix",
      valid_from: DateTime.utc_now(),
      confidence: round(conf * 100),
      labels: ["anomalous-activity", "osint"]
    })
  end

  @spec build_bundle([map()]) :: map()
  def build_bundle(objects) do
    %{
      type: "bundle",
      id: "bundle--#{UUID.uuid4()}",
      objects: objects
    }
  end
end
```

### STIX Bundle Consumption

The platform ingests STIX bundles from external threat feeds:

```elixir
defmodule PrismaticThreatIntel.Stix.BundleParser do
  @moduledoc """
  Parses STIX 2.1 bundles from external threat feeds
  and converts them to platform signals for NABLA processing.
  """

  alias PrismaticNabla.Signal

  @spec parse_bundle(String.t()) :: {:ok, [Signal.t()]} | {:error, term()}
  def parse_bundle(json_string) do
    case Jason.decode(json_string) do
      {:ok, %{"type" => "bundle", "objects" => objects}} ->
        signals =
          objects
          |> Enum.map(&object_to_signal/1)
          |> Enum.reject(&is_nil/1)

        {:ok, signals}

      {:ok, _} ->
        {:error, :invalid_bundle_format}

      {:error, reason} ->
        {:error, {:json_parse_error, reason}}
    end
  end

  defp object_to_signal(%{"type" => "indicator"} = obj) do
    %{
      source: %{
        adapter: __MODULE__,
        query: obj["id"],
        source_type: :secondary,
        independence_group: :stix_feed
      },
      observation: %{
        indicator_type: List.first(obj["indicator_types"] || []),
        pattern: obj["pattern"],
        name: obj["name"],
        stix_id: obj["id"]
      },
      confidence: (obj["confidence"] || 50) / 100,
      domain: :threat_intelligence,
      provenance: %{
        pipeline: "stix_ingestion",
        tool_slug: "stix-bundle-parser",
        raw_response_hash: :crypto.hash(:sha256, Jason.encode!(obj)) |> Base.encode16(case: :lower) |> binary_part(0, 16),
        transformation_chain: [:stix_json, :parsed, :signal]
      }
    }
  end

  defp object_to_signal(%{"type" => "vulnerability"} = obj) do
    %{
      source: %{
        adapter: __MODULE__,
        query: obj["id"],
        source_type: :secondary,
        independence_group: :stix_feed
      },
      observation: %{
        vulnerability_name: obj["name"],
        cve_id: extract_cve(obj),
        description: obj["description"],
        stix_id: obj["id"]
      },
      confidence: 0.85,
      domain: :vulnerability,
      provenance: %{
        pipeline: "stix_ingestion",
        tool_slug: "stix-bundle-parser",
        raw_response_hash: :crypto.hash(:sha256, Jason.encode!(obj)) |> Base.encode16(case: :lower) |> binary_part(0, 16),
        transformation_chain: [:stix_json, :parsed, :signal]
      }
    }
  end

  defp object_to_signal(_), do: nil

  defp extract_cve(%{"external_references" => refs}) do
    Enum.find_value(refs, fn
      %{"source_name" => "cve", "external_id" => id} -> id
      _ -> nil
    end)
  end

  defp extract_cve(_), do: nil
end
```

## Architecture & Implementation

The platform's STIX integration follows a bidirectional architecture. Inbound STIX data from threat feeds is consumed through the TAXII protocol, parsed into platform signals, and processed through the NABLA epistemic framework. Outbound STIX data is produced when platform findings need to be shared with external systems or partners, translating internal intelligence products into the standardized format.

STIX objects are stored in PostgreSQL with JSONB columns, enabling efficient querying of STIX-specific fields while preserving the full object structure. The KuzuDB graph database stores STIX relationships (SROs), enabling graph traversal queries like "find all threat actors related to this malware family through two or fewer intermediary campaigns."

The platform validates all STIX objects against the 2.1 specification before storage, rejecting malformed objects. This validation ensures that exported STIX bundles are always specification-compliant and interoperable with other STIX-consuming platforms.

## Usage in Prismatic Platform

STIX integration connects the platform to the broader threat intelligence ecosystem:

```elixir
# Create STIX indicator from OSINT finding
{:ok, indicator} = PrismaticThreatIntel.Stix.IndicatorBuilder.from_osint_finding(finding)

# Parse incoming STIX bundle
{:ok, signals} = PrismaticThreatIntel.Stix.BundleParser.parse_bundle(json_data)

# Build export bundle
bundle = PrismaticThreatIntel.Stix.IndicatorBuilder.build_bundle(indicators)
```

## Cross-References

- **TAXII** - Transport protocol for exchanging STIX data
- **Threat Feed** - Real-time intelligence stream often using STIX format
- [OSINT](@/glossary/osint.md) - Intelligence source producing data convertible to STIX
- [Signal](@/glossary/signal.md) - Platform-native evidence format derived from STIX objects

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
