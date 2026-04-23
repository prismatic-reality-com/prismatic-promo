+++
title = "SPF"
weight = 50
[extra]
description = "Sender Policy Framework - DNS-based email authentication protocol that specifies which mail servers are authorized to send email for a domain"
category = "security"
related_terms = ["dns", "dkim", "dmarc", "email", "osint", "domain", "txt-record"]
complexity_level = "intermediate"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["SPF", "Sender Policy Framework", "email authentication", "DNS", "security", "glossary", "Prismatic Platform"]
tags = ["glossary", "security", "email"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "SPF - Prismatic Platform"
+++

## Definition & Overview

Sender Policy Framework (SPF) is a DNS-based email authentication mechanism defined in RFC 7208. It allows domain owners to publish a list of IP addresses and hostnames authorized to send email on behalf of their domain. When a receiving mail server gets a message claiming to be from `@example.com`, it checks the DNS TXT record for `example.com` to see if the sending server's IP address is listed. If the IP is not authorized, the receiving server can reject, quarantine, or flag the message.

SPF addresses a fundamental weakness in the SMTP protocol: there is no built-in mechanism to verify that the claimed sender domain actually authorized the sending server. Without SPF, any server can send email claiming to be from any domain. This enables phishing, spam, and domain spoofing attacks. SPF does not solve email authentication completely (it only validates the envelope sender, not the header from address), but it forms the first layer of a defense-in-depth strategy alongside DKIM and DMARC.

In the Prismatic Platform, SPF analysis is a key component of email OSINT operations and the Perimeter EASM module. The platform's email intelligence tools check SPF records to assess domain security posture, identify authorized mail infrastructure, and detect misconfigurations that could enable spoofing. SPF record analysis also reveals organizational infrastructure details -- the mail providers, marketing platforms, and transactional email services a domain uses.

## Technical Deep Dive

### SPF Record Structure

An SPF record is a DNS TXT record with a specific syntax:

```
v=spf1 ip4:192.168.1.0/24 include:_spf.google.com include:sendgrid.net -all
```

The platform parses SPF records into structured data for analysis:

```elixir
defmodule PrismaticOsintCore.Email.SpfParser do
  @moduledoc """
  Parses SPF DNS TXT records into structured data
  for security assessment and infrastructure discovery.
  """

  @type mechanism :: %{
    qualifier: :pass | :fail | :softfail | :neutral,
    type: :ip4 | :ip6 | :include | :a | :mx | :ptr | :exists | :all,
    value: String.t() | nil
  }

  @type spf_record :: %{
    version: String.t(),
    mechanisms: [mechanism()],
    redirect: String.t() | nil,
    all_policy: :pass | :fail | :softfail | :neutral | nil
  }

  @spec parse(String.t()) :: {:ok, spf_record()} | {:error, term()}
  def parse("v=spf1" <> rest) do
    mechanisms =
      rest
      |> String.trim()
      |> String.split(~r/\s+/)
      |> Enum.map(&parse_mechanism/1)
      |> Enum.reject(&is_nil/1)

    all_policy = Enum.find_value(mechanisms, fn
      %{type: :all, qualifier: q} -> q
      _ -> nil
    end)

    redirect = Enum.find_value(mechanisms, fn
      %{type: :redirect, value: v} -> v
      _ -> nil
    end)

    {:ok, %{
      version: "spf1",
      mechanisms: mechanisms,
      redirect: redirect,
      all_policy: all_policy
    }}
  end

  def parse(_), do: {:error, :invalid_spf_record}

  defp parse_mechanism("+" <> term), do: parse_term(:pass, term)
  defp parse_mechanism("-" <> term), do: parse_term(:fail, term)
  defp parse_mechanism("~" <> term), do: parse_term(:softfail, term)
  defp parse_mechanism("?" <> term), do: parse_term(:neutral, term)
  defp parse_mechanism(term), do: parse_term(:pass, term)

  defp parse_term(qualifier, "ip4:" <> value) do
    %{qualifier: qualifier, type: :ip4, value: value}
  end

  defp parse_term(qualifier, "ip6:" <> value) do
    %{qualifier: qualifier, type: :ip6, value: value}
  end

  defp parse_term(qualifier, "include:" <> value) do
    %{qualifier: qualifier, type: :include, value: value}
  end

  defp parse_term(qualifier, "a" <> rest) do
    %{qualifier: qualifier, type: :a, value: if(rest == "", do: nil, else: String.trim_leading(rest, ":"))}
  end

  defp parse_term(qualifier, "mx" <> rest) do
    %{qualifier: qualifier, type: :mx, value: if(rest == "", do: nil, else: String.trim_leading(rest, ":"))}
  end

  defp parse_term(qualifier, "all") do
    %{qualifier: qualifier, type: :all, value: nil}
  end

  defp parse_term(_qualifier, "redirect=" <> value) do
    %{qualifier: :pass, type: :redirect, value: value}
  end

  defp parse_term(_, _), do: nil
end
```

### SPF Security Assessment

The Perimeter module evaluates SPF configuration quality as part of domain security scoring:

```elixir
defmodule PrismaticPerimeter.Email.SpfAssessment do
  @moduledoc """
  Assesses SPF record security posture for Perimeter EASM.
  Identifies misconfigurations, overly permissive policies,
  and infrastructure exposure.
  """

  alias PrismaticOsintCore.Email.SpfParser

  @type finding :: %{
    severity: :critical | :high | :medium | :low | :info,
    code: atom(),
    description: String.t()
  }

  @spec assess(String.t()) :: {:ok, [finding()]}
  def assess(domain) do
    case resolve_spf(domain) do
      {:ok, record_text} ->
        case SpfParser.parse(record_text) do
          {:ok, parsed} -> {:ok, analyze(parsed, domain)}
          {:error, _} -> {:ok, [%{severity: :high, code: :invalid_spf, description: "Invalid SPF record syntax"}]}
        end

      {:error, :no_spf} ->
        {:ok, [%{severity: :high, code: :missing_spf, description: "No SPF record found for #{domain}"}]}
    end
  end

  defp analyze(spf, _domain) do
    findings = []

    findings = case spf.all_policy do
      :fail -> findings
      :softfail -> [%{severity: :medium, code: :softfail_policy, description: "SPF uses ~all (softfail) instead of -all (hard fail)"} | findings]
      :neutral -> [%{severity: :high, code: :neutral_policy, description: "SPF uses ?all (neutral), providing no protection"} | findings]
      :pass -> [%{severity: :critical, code: :pass_all_policy, description: "SPF uses +all, allowing any server to send email"} | findings]
      nil -> [%{severity: :high, code: :missing_all, description: "SPF record missing 'all' mechanism"} | findings]
    end

    include_count = Enum.count(spf.mechanisms, &(&1.type == :include))
    if include_count > 10 do
      [%{severity: :medium, code: :too_many_includes, description: "SPF has #{include_count} includes (risk of exceeding 10 DNS lookup limit)"} | findings]
    else
      findings
    end
  end

  defp resolve_spf(domain) do
    case :inet_res.lookup(to_charlist(domain), :in, :txt) do
      records when is_list(records) ->
        spf = Enum.find_value(records, fn parts ->
          text = parts |> Enum.join()
          if String.starts_with?(text, "v=spf1"), do: text
        end)
        if spf, do: {:ok, spf}, else: {:error, :no_spf}

      _ -> {:error, :dns_failure}
    end
  end
end
```

## Architecture & Implementation

SPF checking integrates into the platform's email intelligence pipeline. When the OSINT toolbox's email intelligence tool processes a domain, it resolves the SPF record, parses it, and feeds the structured data into both the security assessment engine and the infrastructure discovery module. The parsed SPF data reveals which third-party services a domain uses (Google Workspace, SendGrid, Mailchimp, etc.), providing valuable intelligence about organizational technology choices.

The platform caches SPF resolution results in ETS with configurable TTL, respecting DNS record TTL values. This prevents redundant DNS lookups when multiple OSINT tools query the same domain within a short time frame.

SPF is part of the email authentication triad (SPF, DKIM, DMARC). The platform assesses all three together, as they provide complementary protections. SPF validates the sending server, DKIM validates message integrity, and DMARC ties them together with policy enforcement.

## Usage in Prismatic Platform

SPF analysis is used in email OSINT operations, Perimeter security assessments, and DD compliance checks (verifying that entities have proper email security):

```elixir
# Assess SPF for a domain
{:ok, findings} = PrismaticPerimeter.Email.SpfAssessment.assess("example.com")

# Parse SPF record directly
{:ok, spf} = PrismaticOsintCore.Email.SpfParser.parse("v=spf1 include:_spf.google.com -all")
```

## Cross-References

- [DNS](@/glossary/dns.md) - Protocol hosting SPF TXT records
- **DKIM** - Complementary email authentication via cryptographic signatures
- [DMARC](@/glossary/dmarc.md) - Policy layer that combines SPF and DKIM results
- [OSINT](@/glossary/osint.md) - Intelligence discipline using SPF for infrastructure discovery

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
