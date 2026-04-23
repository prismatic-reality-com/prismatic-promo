+++
title = "MX Record"
weight = 50
[extra]
description = "DNS record type that specifies the mail servers responsible for receiving email for a domain, including priority routing."
category = "osint"
related_terms = ["dns", "email", "domain", "spf"]
complexity_level = "beginner"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["MX record", "DNS", "mail exchange", "email", "domain", "OSINT", "glossary", "Prismatic Platform"]
tags = ["glossary", "osint"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "MX Record - Prismatic Platform"
+++

## Definition & Overview

An MX (Mail Exchange) record is a type of DNS resource record that specifies which mail servers are responsible for receiving email messages on behalf of a domain. Each MX record contains two fields: a priority value (lower numbers indicate higher priority) and the hostname of the mail server. When an email is sent to an address at a domain, the sending mail server queries the domain's MX records to determine where to deliver the message, attempting servers in priority order.

MX records are fundamental to email infrastructure and provide valuable intelligence in OSINT investigations. By examining a domain's MX records, an analyst can determine which email hosting provider the organization uses (Google Workspace, Microsoft 365, self-hosted), identify backup mail servers, detect mail filtering services (Proofpoint, Mimecast), and map the organization's email infrastructure. Changes in MX records over time can indicate organizational transitions, acquisitions, or security posture changes.

The Prismatic Platform's OSINT capabilities include comprehensive DNS analysis, with MX record lookup as a core component of the email intelligence workflow. The EmailIntelligence adapter queries MX records as part of its analysis pipeline, combining MX data with SPF, DKIM, and DMARC records to build a complete picture of a domain's email security posture.

## Technical Deep Dive

MX record resolution follows a specific DNS query process. When the sending MTA (Mail Transfer Agent) needs to deliver email to user@example.com, it queries DNS for the MX records of example.com. The DNS response contains one or more MX records, each with a preference value and a mail server hostname. The MTA attempts delivery to the lowest-preference (highest priority) server first. If that server is unavailable, it falls back to the next-priority server.

A typical MX configuration for a Google Workspace domain includes five MX records with increasing priority values, providing redundancy. An organization using a mail filtering service like Proofpoint will have MX records pointing to the filtering service's servers, which then forward clean email to the actual mail server. This layered configuration is visible in DNS and reveals the organization's email security stack.

```elixir
defmodule PrismaticOsintCore.Dns.MxLookup do
  @moduledoc """
  MX record lookup and analysis for email intelligence gathering.
  Resolves MX records and classifies email infrastructure.
  """

  @type mx_record :: %{
    domain: String.t(),
    priority: non_neg_integer(),
    mail_server: String.t(),
    provider: String.t() | nil,
    ip_addresses: [String.t()]
  }

  @type mx_analysis :: %{
    domain: String.t(),
    records: [mx_record()],
    primary_provider: String.t(),
    has_backup: boolean(),
    has_filtering: boolean(),
    security_features: [atom()]
  }

  @provider_patterns %{
    "google" => [~r/google\.com$/, ~r/googlemail\.com$/],
    "microsoft" => [~r/outlook\.com$/, ~r/protection\.outlook\.com$/],
    "proofpoint" => [~r/pphosted\.com$/],
    "mimecast" => [~r/mimecast\.com$/],
    "barracuda" => [~r/barracudanetworks\.com$/],
    "zoho" => [~r/zoho\.com$/]
  }

  @spec lookup(String.t()) :: {:ok, mx_analysis()} | {:error, term()}
  def lookup(domain) when is_binary(domain) do
    case :inet_res.lookup(String.to_charlist(domain), :in, :mx) do
      [] ->
        {:error, :no_mx_records}

      records ->
        mx_records =
          records
          |> Enum.sort_by(fn {priority, _server} -> priority end)
          |> Enum.map(fn {priority, server} ->
            server_str = List.to_string(server)
            %{
              domain: domain,
              priority: priority,
              mail_server: server_str,
              provider: classify_provider(server_str),
              ip_addresses: resolve_ips(server_str)
            }
          end)

        analysis = %{
          domain: domain,
          records: mx_records,
          primary_provider: determine_primary_provider(mx_records),
          has_backup: length(mx_records) > 1,
          has_filtering: has_mail_filtering?(mx_records),
          security_features: check_security_features(domain)
        }

        {:ok, analysis}
    end
  end

  defp classify_provider(server) do
    Enum.find_value(@provider_patterns, "unknown", fn {provider, patterns} ->
      if Enum.any?(patterns, &Regex.match?(&1, server)), do: provider
    end)
  end

  defp determine_primary_provider(records) do
    case records do
      [%{provider: provider} | _] -> provider
      [] -> "none"
    end
  end

  defp has_mail_filtering?(records) do
    Enum.any?(records, fn r ->
      r.provider in ["proofpoint", "mimecast", "barracuda"]
    end)
  end

  defp resolve_ips(hostname) do
    case :inet_res.lookup(String.to_charlist(hostname), :in, :a) do
      ips -> Enum.map(ips, &:inet.ntoa(&1) |> List.to_string())
    end
  end

  defp check_security_features(domain) do
    features = []
    charlist = String.to_charlist(domain)

    features =
      case :inet_res.lookup(charlist, :in, :txt) do
        txts ->
          txt_strings = Enum.map(txts, fn parts -> Enum.join(parts) end)

          features
          |> maybe_add(:spf, Enum.any?(txt_strings, &String.starts_with?(&1, "v=spf1")))
          |> maybe_add(:dmarc, has_dmarc?(domain))
      end

    features
  end

  defp has_dmarc?(domain) do
    dmarc_domain = "_dmarc.#{domain}" |> String.to_charlist()
    case :inet_res.lookup(dmarc_domain, :in, :txt) do
      [] -> false
      _ -> true
    end
  end

  defp maybe_add(list, item, true), do: [item | list]
  defp maybe_add(list, _item, false), do: list
end
```

MX records can also reveal organizational relationships. When a subsidiary uses the parent company's mail servers, or when multiple domains share MX records, it maps corporate structure. The Prismatic Platform's DD pipeline uses this correlation when building entity relationship graphs.

## Architecture & Implementation

The MX lookup capability is part of the platform's DNS analysis subsystem, which also covers A, AAAA, CNAME, NS, TXT, SOA, and PTR records. All DNS queries go through a centralized resolver module that provides caching (ETS-backed with configurable TTL), rate limiting (to avoid triggering DNS provider abuse detection), and telemetry (query timing, cache hit rates, error rates).

The MX analysis results feed into multiple platform subsystems. The OSINT toolbox presents them in the email intelligence workflow. The Perimeter module uses MX data to assess email security posture as part of the overall security rating. The DD pipeline uses MX provider information to classify organizations by technology stack.

DNS lookups use Erlang's built-in `:inet_res` module, which provides native DNS resolution without external dependencies. For OSINT scenarios requiring stealth (avoiding DNS query logging at the target), the platform can route queries through configurable DNS-over-HTTPS (DoH) resolvers.

## Usage in Prismatic Platform

The MX lookup is exposed as a registered OSINT tool:

```elixir
defmodule PrismaticOsintCore.Adapters.MxLookup do
  @moduledoc """
  OSINT tool adapter for MX record analysis.
  """

  use PrismaticOsintCore.Tool

  register_tool(%{
    slug: "mx-record-lookup",
    name: "MX Record Analysis",
    category: :global,
    api_style: :provider,
    input_fields: [
      %{name: :domain, type: :text, label: "Domain Name", required: true},
      %{name: :resolve_ips, type: :checkbox, label: "Resolve IP Addresses", required: false}
    ],
    requires_auth: false
  })

  @impl PrismaticOsintCore.Tool
  def run(%{domain: domain} = _params) do
    case PrismaticOsintCore.Dns.MxLookup.lookup(domain) do
      {:ok, analysis} ->
        {:ok, %{
          data: analysis,
          metadata: %{
            source: "dns",
            query_type: "MX",
            record_count: length(analysis.records)
          }
        }}

      {:error, :no_mx_records} ->
        {:ok, %{
          data: %{domain: domain, records: [], note: "No MX records found"},
          metadata: %{source: "dns", query_type: "MX", record_count: 0}
        }}

      {:error, reason} ->
        {:error, "DNS lookup failed: #{inspect(reason)}"}
    end
  end
end
```

MX record analysis is one of the most frequently used OSINT tools in the platform, providing quick infrastructure intelligence for any domain with minimal API dependency since DNS is a public, distributed system.

## Cross-References

- [DNS](/glossary/dns/) - The protocol system containing MX records
- **Email** - The communication system MX records route
- [OSINT](/glossary/osint/) - Intelligence discipline leveraging MX data
- [SPF](/glossary/spf/) - Complementary email authentication DNS record
- [Domain](/glossary/domain/) - The entity identified by MX records

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
