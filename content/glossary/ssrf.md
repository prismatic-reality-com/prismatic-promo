+++
title = "SSRF"
weight = 50
[extra]
description = "Server-Side Request Forgery - vulnerability where an attacker induces the server to make HTTP requests to unintended internal or external destinations"
category = "security"
related_terms = ["owasp", "vulnerability", "input-validation", "firewall", "allowlist", "security-rating"]
complexity_level = "advanced"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["SSRF", "Server-Side Request Forgery", "vulnerability", "security", "OWASP", "glossary", "Prismatic Platform"]
tags = ["glossary", "security", "vulnerability"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "SSRF - Prismatic Platform"
+++

## Definition & Overview

Server-Side Request Forgery (SSRF) is a web application vulnerability where an attacker manipulates the server into making HTTP requests to destinations the attacker chooses. The server acts as a proxy, sending requests to internal services, cloud metadata endpoints, or external systems that would be unreachable from the attacker's network. SSRF is particularly dangerous in cloud environments where metadata APIs (like AWS's `169.254.169.254`) can expose credentials, configuration, and other sensitive data accessible only from within the cloud instance.

SSRF ranked in the OWASP Top 10 (2021 edition, A10) as a dedicated category, reflecting its growing severity in modern cloud-native architectures. The vulnerability arises whenever a server-side application fetches a URL that is influenced by user input without adequate validation. Common attack vectors include URL parameters, webhook configurations, PDF generators, image processors, and any feature that fetches remote resources based on user-provided URLs.

In the Prismatic Platform, SSRF is a critical concern because the OSINT toolbox and DD pipeline make outbound HTTP requests as part of their core functionality. When a user submits a query to an OSINT tool, the platform must fetch data from external APIs. Without proper safeguards, a crafted input could redirect these requests to internal infrastructure. The platform implements multiple defense layers to prevent SSRF while maintaining the legitimate external request capability that OSINT operations require.

## Technical Deep Dive

### SSRF Prevention in Outbound Requests

The platform uses an allowlist-based URL validator that checks every outbound request before execution:

```elixir
defmodule PrismaticSecurity.SSRFGuard do
  @moduledoc """
  Prevents Server-Side Request Forgery by validating
  all outbound HTTP request URLs against allowlists
  and blocking internal/reserved address ranges.
  """

  @blocked_ranges [
    # Loopback
    {127, 0, 0, 0, 8},
    # Private Class A
    {10, 0, 0, 0, 8},
    # Private Class B
    {172, 16, 0, 0, 12},
    # Private Class C
    {192, 168, 0, 0, 16},
    # Link-local
    {169, 254, 0, 0, 16},
    # IPv6 mapped IPv4
    {0, 0, 0, 0, 8}
  ]

  @blocked_hostnames ["localhost", "metadata.google.internal", "metadata.internal"]

  @spec validate_url(String.t()) :: :ok | {:error, :ssrf_blocked, String.t()}
  def validate_url(url) do
    uri = URI.parse(url)

    with :ok <- validate_scheme(uri),
         :ok <- validate_hostname(uri),
         :ok <- validate_resolved_ip(uri) do
      :ok
    end
  end

  defp validate_scheme(%{scheme: scheme}) when scheme in ["http", "https"], do: :ok
  defp validate_scheme(%{scheme: scheme}) do
    {:error, :ssrf_blocked, "Blocked scheme: #{scheme}"}
  end

  defp validate_hostname(%{host: host}) when host in @blocked_hostnames do
    {:error, :ssrf_blocked, "Blocked hostname: #{host}"}
  end

  defp validate_hostname(%{host: host}) do
    if String.ends_with?(host, ".internal") or String.ends_with?(host, ".local") do
      {:error, :ssrf_blocked, "Blocked internal hostname: #{host}"}
    else
      :ok
    end
  end

  defp validate_resolved_ip(%{host: host}) do
    case :inet.getaddr(to_charlist(host), :inet) do
      {:ok, ip_tuple} ->
        if ip_in_blocked_range?(ip_tuple) do
          {:error, :ssrf_blocked, "Resolved to blocked IP range: #{inspect(ip_tuple)}"}
        else
          :ok
        end

      {:error, _} ->
        {:error, :ssrf_blocked, "Failed to resolve hostname: #{host}"}
    end
  end

  defp ip_in_blocked_range?({a, b, c, d}) do
    ip = Bitwise.bsl(a, 24) + Bitwise.bsl(b, 16) + Bitwise.bsl(c, 8) + d

    Enum.any?(@blocked_ranges, fn {ra, rb, rc, rd, prefix_len} ->
      range_start = Bitwise.bsl(ra, 24) + Bitwise.bsl(rb, 16) + Bitwise.bsl(rc, 8) + rd
      mask = Bitwise.bsl(0xFFFFFFFF, 32 - prefix_len) |> Bitwise.band(0xFFFFFFFF)
      Bitwise.band(ip, mask) == Bitwise.band(range_start, mask)
    end)
  end
end
```

### Secure HTTP Client Wrapper

The platform wraps Tesla HTTP calls through the SSRF guard:

```elixir
defmodule PrismaticHttp.SecureClient do
  @moduledoc """
  Tesla HTTP client with mandatory SSRF protection.
  All outbound requests from OSINT tools and DD sources
  MUST use this client instead of raw Tesla calls.
  """

  @spec get(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def get(url, opts \\ []) do
    with :ok <- PrismaticSecurity.SSRFGuard.validate_url(url) do
      Tesla.get(url, opts)
    end
  end

  @spec post(String.t(), term(), keyword()) :: {:ok, map()} | {:error, term()}
  def post(url, body, opts \\ []) do
    with :ok <- PrismaticSecurity.SSRFGuard.validate_url(url) do
      Tesla.post(url, body, opts)
    end
  end
end
```

### SSRF Detection in Security Scanning

The Perimeter EASM module checks for SSRF vulnerabilities in target applications:

```elixir
defmodule PrismaticPerimeter.Scanners.SSRFDetector do
  @moduledoc """
  Detects potential SSRF vulnerabilities in target applications
  as part of External Attack Surface Management.
  """

  @ssrf_indicators [
    "url=",
    "uri=",
    "path=",
    "dest=",
    "redirect=",
    "src=",
    "source=",
    "link=",
    "fetch=",
    "proxy=",
    "callback="
  ]

  @spec scan(String.t()) :: {:ok, [map()]}
  def scan(target_url) do
    findings =
      @ssrf_indicators
      |> Enum.flat_map(fn param ->
        check_parameter(target_url, param)
      end)

    {:ok, findings}
  end

  defp check_parameter(target_url, param) do
    uri = URI.parse(target_url)
    query_params = URI.decode_query(uri.query || "")

    if Map.has_key?(query_params, String.trim_trailing(param, "=")) do
      [%{
        type: :ssrf_parameter,
        severity: :medium,
        parameter: param,
        description: "URL parameter '#{param}' may be vulnerable to SSRF"
      }]
    else
      []
    end
  end
end
```

## Architecture & Implementation

The platform's SSRF defense follows a defense-in-depth strategy with three layers. The application layer validates URLs before any HTTP request using the SSRFGuard module. The network layer uses firewall rules to block outbound connections to internal IP ranges from the application container. The infrastructure layer uses cloud-provider metadata service protection (IMDSv2 on AWS, metadata concealment on GCP).

The SSRFGuard performs DNS resolution and validates the resolved IP address, not just the hostname. This prevents DNS rebinding attacks where a hostname initially resolves to a safe IP but later resolves to an internal address. The guard resolves the hostname at validation time and uses the resolved IP for the actual request, eliminating the TOCTOU (Time of Check, Time of Use) window.

All OSINT tools and DD sources are required to use `PrismaticHttp.SecureClient` instead of raw Tesla calls. This requirement is enforced through code review and the forbidden patterns scanner, which flags direct Tesla usage outside of the secure client module.

## Usage in Prismatic Platform

SSRF protection is transparent to OSINT tool developers. The secure client handles validation automatically:

```elixir
# Safe: uses SecureClient with SSRF protection
{:ok, response} = PrismaticHttp.SecureClient.get("https://api.example.com/data")

# Blocked: internal IP would be rejected
{:error, :ssrf_blocked, reason} = PrismaticHttp.SecureClient.get("http://169.254.169.254/metadata")
```

## Cross-References

- [OWASP](/glossary/owasp/) - Security standard that categorizes SSRF as A10
- **Input Validation** - Defense technique preventing SSRF
- [Vulnerability](/glossary/vulnerability/) - Broader category encompassing SSRF
- [Security Rating](/glossary/security-rating/) - Perimeter score affected by SSRF findings

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
