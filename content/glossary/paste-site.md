+++
title = "Paste Site"
weight = 50
[extra]
description = "Online platform where users can anonymously share text content, frequently used in dark web contexts for publishing stolen data dumps and breach information."
category = "osint"
related_terms = ["dark-web", "data-breach", "osint", "threat-intelligence"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["paste site", "data dump", "dark web", "breach monitoring", "OSINT", "glossary", "Prismatic Platform"]
tags = ["glossary", "osint"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Paste Site - Prismatic Platform"
+++

## Definition & Overview

A paste site (or pastebin) is an online service that allows users to store and share plain text content, often anonymously. While legitimate paste sites like Pastebin.com serve developers sharing code snippets, they are also extensively used for publishing stolen data, including credential dumps, database exports, personal information, and sensitive documents. Dark web paste sites (accessible via Tor) provide even greater anonymity, making them primary distribution channels for breach data and threat actor communications.

Paste site monitoring is a critical component of threat intelligence and external attack surface management. When an organization's data appears on paste sites, it may indicate a data breach, compromised credentials, or insider threat. Early detection enables rapid incident response: credential rotation, affected user notification, and forensic investigation before the exposed data is widely exploited. Many high-profile breaches were first detected through paste site monitoring rather than internal security tools.

The Prismatic Platform's OSINT capabilities include paste site monitoring as part of the broader threat intelligence workflow. The platform can search for organizational indicators (domain names, email patterns, IP ranges) across known paste sites, alert on new exposures, and integrate findings into the Perimeter security rating. This capability supports the HAWKEYE visitor intelligence and Perimeter EASM modules in maintaining awareness of an organization's exposure.

## Technical Deep Dive

Paste sites vary in their accessibility, content policies, and anonymity guarantees. Surface web paste sites (Pastebin.com, Ghostbin, dpaste) are indexed by search engines and accessible via normal browsers. Dark web paste sites (DeepPaste, ZeroBin instances on .onion domains) require Tor access and offer stronger anonymity. Some sites expire content after a set period, while others archive indefinitely.

Monitoring paste sites involves several challenges. Volume is immense: millions of new pastes are created daily across thousands of sites. Content is unstructured text requiring pattern matching to identify relevant data. False positives are common: an email domain appearing in a paste may be a legitimate mailing list, not a breach. The platform addresses these challenges through targeted keyword monitoring, pattern-based filtering (email format validation, credential pair detection), and confidence scoring.

```elixir
defmodule PrismaticOsintCore.Monitoring.PasteSiteMonitor do
  @moduledoc """
  Monitors paste sites for organizational data exposure.
  Searches for domain-specific indicators and classifies findings.
  """

  @type paste_finding :: %{
    source: String.t(),
    url: String.t(),
    timestamp: DateTime.t(),
    matches: [match_detail()],
    severity: :low | :medium | :high | :critical,
    content_type: :credentials | :pii | :source_code | :configuration | :unknown
  }

  @type match_detail :: %{
    pattern: String.t(),
    matched_text: String.t(),
    line_number: pos_integer(),
    context: String.t()
  }

  @type monitoring_config :: %{
    domain: String.t(),
    email_patterns: [Regex.t()],
    keyword_patterns: [Regex.t()],
    exclude_patterns: [Regex.t()]
  }

  @spec monitor(monitoring_config()) :: {:ok, [paste_finding()]}
  def monitor(%{domain: domain} = config) do
    patterns = build_search_patterns(config)

    findings =
      list_paste_sources()
      |> Task.async_stream(fn source ->
        search_source(source, patterns)
      end, max_concurrency: 5, timeout: 60_000)
      |> Enum.flat_map(fn
        {:ok, {:ok, results}} -> results
        _ -> []
      end)
      |> Enum.map(&classify_finding/1)
      |> Enum.reject(&false_positive?(&1, config))
      |> Enum.sort_by(& &1.severity, &severity_order/2)

    {:ok, findings}
  end

  defp build_search_patterns(%{domain: domain, email_patterns: email_pats}) do
    base_patterns = [
      ~r/#{Regex.escape(domain)}/i,
      ~r/[a-zA-Z0-9._%+-]+@#{Regex.escape(domain)}/i
    ]

    base_patterns ++ email_pats
  end

  defp classify_finding(finding) do
    content_type = detect_content_type(finding.raw_content)
    severity = compute_severity(finding, content_type)

    %{finding |
      content_type: content_type,
      severity: severity
    }
  end

  defp detect_content_type(content) do
    cond do
      Regex.match?(~r/password|passwd|pwd/i, content) and
        Regex.match?(~r/[a-zA-Z0-9._%+-]+@/, content) ->
        :credentials

      Regex.match?(~r/SSN|social.security|date.of.birth/i, content) ->
        :pii

      Regex.match?(~r/BEGIN (RSA |EC |DSA )?PRIVATE KEY/i, content) or
        Regex.match?(~r/api[_-]?key|secret[_-]?key|auth[_-]?token/i, content) ->
        :configuration

      Regex.match?(~r/def |defmodule |class |function |import /i, content) ->
        :source_code

      true ->
        :unknown
    end
  end

  defp compute_severity(finding, content_type) do
    base_severity =
      case content_type do
        :credentials -> :critical
        :pii -> :high
        :configuration -> :high
        :source_code -> :medium
        :unknown -> :low
      end

    # Increase severity based on volume
    if length(finding.matches) > 100 do
      escalate(base_severity)
    else
      base_severity
    end
  end

  defp escalate(:low), do: :medium
  defp escalate(:medium), do: :high
  defp escalate(severity), do: severity

  defp false_positive?(finding, config) do
    Enum.any?(config.exclude_patterns, fn pattern ->
      Enum.all?(finding.matches, fn match ->
        Regex.match?(pattern, match.matched_text)
      end)
    end)
  end

  defp severity_order(:critical, _), do: true
  defp severity_order(_, :critical), do: false
  defp severity_order(:high, _), do: true
  defp severity_order(_, :high), do: false
  defp severity_order(:medium, _), do: true
  defp severity_order(_, _), do: false

  defp list_paste_sources, do: []
  defp search_source(_source, _patterns), do: {:ok, []}
end
```

Content type classification is essential for prioritizing findings. Credential dumps (username:password pairs) require immediate action (password resets). PII exposure requires regulatory notification (GDPR 72-hour breach notification). Configuration data (API keys, private keys) requires secret rotation. Source code exposure may indicate insider threat or repository misconfiguration.

## Architecture & Implementation

Paste site monitoring operates as a scheduled OSINT workflow in the platform. The monitoring configuration is defined per-organization and stored in the DD entity system. Scheduled scans run at configurable intervals (default: every 6 hours for critical organizations, daily for standard monitoring). Results are stored as OSINT findings linked to the monitored organization entity.

The platform's NABLA framework applies to paste site findings: each finding requires source provenance (which paste site, when posted), confidence scoring (how likely is this a genuine exposure versus a false positive), and signal plurality (ideally confirmed by multiple monitoring sources or correlated with other intelligence). This prevents overreaction to false positives while ensuring genuine exposures are escalated promptly.

Integration with the Perimeter security rating means that confirmed paste site exposures directly impact an organization's security score. A critical credential dump exposure can move an organization's rating from A to C, reflecting the genuine increase in risk. The score recovers when the exposure is remediated (credentials rotated, data removed).

## Usage in Prismatic Platform

Integration with the Perimeter security assessment:

```elixir
defmodule PrismaticPerimeter.RiskFactors.PasteSiteExposure do
  @moduledoc """
  Risk factor assessment based on paste site monitoring findings.
  Integrates with Perimeter security rating.
  """

  alias PrismaticOsintCore.Monitoring.PasteSiteMonitor

  @severity_impacts %{
    critical: -150,
    high: -80,
    medium: -30,
    low: -10
  }

  @spec assess(String.t()) :: {:ok, %{score_impact: integer(), findings: list()}}
  def assess(domain) do
    config = %{
      domain: domain,
      email_patterns: [~r/@#{Regex.escape(domain)}$/i],
      keyword_patterns: [],
      exclude_patterns: []
    }

    case PasteSiteMonitor.monitor(config) do
      {:ok, findings} ->
        impact = Enum.reduce(findings, 0, fn finding, acc ->
          acc + Map.get(@severity_impacts, finding.severity, 0)
        end)

        {:ok, %{
          score_impact: impact,
          findings: length(findings),
          worst_severity: worst_severity(findings),
          credential_exposures: count_by_type(findings, :credentials),
          pii_exposures: count_by_type(findings, :pii)
        }}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp worst_severity([]), do: :none
  defp worst_severity(findings), do: hd(findings).severity

  defp count_by_type(findings, type) do
    Enum.count(findings, &(&1.content_type == type))
  end
end
```

Paste site monitoring provides the platform's users with early warning of data exposures, enabling proactive incident response and continuous external threat surface awareness.

## Cross-References

- [OSINT](/glossary/osint/) - Intelligence discipline encompassing paste site monitoring
- [Threat Intelligence](/glossary/threat-intelligence/) - Broader intelligence context
- [Data Breach](/glossary/data-breach/) - Security incident detected through paste monitoring
- [IOC](/glossary/ioc/) - Indicators found in paste site content
- **Perimeter** - Security rating affected by paste site exposures

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
