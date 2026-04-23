+++
title = "Certificate Transparency"
weight = 20
[extra]
category = "security"
description = "Public logging framework for TLS certificate issuance accountability"
related_terms = ["tls", "easm", "attack-surface", "security-rating", "osint", "censys"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1029
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Certificate", "Transparency", "Public", "glossary", "security", "Prismatic Platform", "Certificate Transparency", "SCTs"]
tags = ["glossary", "security", "certificate-transparency", "prismatic"]
quality_score = 72
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Certificate Transparency - Prismatic Platform"
+++

## Definition and Overview

Certificate Transparency (CT) is an open framework for publicly logging, monitoring, and auditing TLS/SSL certificates issued by Certificate Authorities (CAs). CT logs are append-only, cryptographically verifiable records of every certificate issued for a domain, enabling domain owners and security researchers to detect misissued or unauthorized certificates. Browsers like Chrome require CT compliance for trusted certificates. CT logs serve as a rich OSINT data source for discovering subdomains, infrastructure changes, and organizational certificate practices.

The CT framework was created by Google engineers Ben Laurie and Adam Langley in response to high-profile certificate misissuance incidents, most notably the DigiNotar breach of 2011 where fraudulent certificates were issued for google.com and other major domains. Before CT, there was no mechanism for domain owners to know when a CA had issued a certificate for their domain. CT closes this visibility gap by requiring CAs to submit every issued certificate to public, cryptographically verifiable logs.

CT operates on the principle that transparency itself is a security control. By making all certificate issuance visible, CT creates accountability for CAs, enables domain owners to detect unauthorized certificates, and provides security researchers with a comprehensive dataset for infrastructure analysis. The framework is defined in RFC 6962 (v1) and RFC 9162 (v2), and is mandated by major browser vendors including Google Chrome (since 2018) and Apple Safari (since 2021).

## Technical Deep Dive

### CT Architecture

The Certificate Transparency ecosystem consists of four key components:

| Component | Role | Examples |
|-----------|------|---------|
| Certificate Authorities | Submit certificates to CT logs before issuance | Let's Encrypt, DigiCert, Sectigo |
| CT Logs | Store certificates in append-only Merkle trees | Google Argon, Cloudflare Nimbus, DigiCert Yeti |
| Monitors | Watch CT logs for certificates of interest | Facebook CT Monitor, crt.sh, CertStream |
| Auditors | Verify CT log integrity and consistency | Browser built-in auditors |

### Merkle Tree Structure

CT logs use Merkle hash trees (binary hash trees) to provide cryptographic proof of certificate inclusion:

```
                    Root Hash
                   /          \
              H(1-2)          H(3-4)
             /      \        /      \
          H(1)    H(2)    H(3)    H(4)
           |       |       |       |
         Cert1   Cert2   Cert3   Cert4
```

This structure enables:
- **Inclusion proofs**: Prove a specific certificate exists in the log in O(log n) time
- **Consistency proofs**: Prove the log has not been tampered with between two points in time
- **Append-only guarantee**: New entries can only be added; existing entries cannot be modified or removed

### Signed Certificate Timestamps (SCTs)

When a CA submits a certificate to a CT log, the log returns a Signed Certificate Timestamp (SCT) -- a cryptographic promise that the certificate will be included in the log within a Maximum Merge Delay (MMD), typically 24 hours:

```
CA -> CT Log: "Here is a certificate for example.com"
CT Log -> CA: SCT = {
  log_id: "abc123...",
  timestamp: 1706140800,
  signature: "RSA-SHA256:deadbeef...",
  extensions: ""
}
```

Browsers verify that certificates include valid SCTs before establishing trust. This ensures that all trusted certificates are publicly logged and auditable.

### CT Log Querying

CT logs expose a REST API defined in RFC 6962:

| Endpoint | Purpose | Method |
|----------|---------|--------|
| `/ct/v1/add-chain` | Submit a certificate chain | POST |
| `/ct/v1/add-pre-chain` | Submit a pre-certificate | POST |
| `/ct/v1/get-sth` | Get Signed Tree Head | GET |
| `/ct/v1/get-entries` | Retrieve log entries | GET |
| `/ct/v1/get-proof-by-hash` | Get inclusion proof | GET |
| `/ct/v1/get-sth-consistency` | Get consistency proof | GET |

### Data Available in CT Logs

Each CT log entry contains:

| Field | Description | OSINT Value |
|-------|-------------|-------------|
| Subject CN | Common Name of the certificate | Domain/subdomain discovery |
| Subject Alternative Names (SANs) | Additional domains covered | Complete domain inventory |
| Issuer | Certificate Authority that issued the cert | CA relationship mapping |
| Not Before / Not After | Validity period | Infrastructure lifecycle tracking |
| Serial Number | Unique certificate identifier | Certificate tracking |
| Public Key | Subject's public key | Key reuse detection |
| Signature Algorithm | Algorithm used to sign | Crypto hygiene assessment |
| SCT List | Signed Certificate Timestamps | Log submission tracking |

## Architecture and Implementation

### CT Data Pipeline in Elixir

```elixir
defmodule PrismaticPerimeter.CTScanner do
  @moduledoc """
  Queries Certificate Transparency logs to discover
  subdomains and certificate metadata for target organizations.
  """

  @ct_search_url "https://crt.sh"

  @spec discover_subdomains(String.t()) :: {:ok, [map()]} | {:error, term()}
  def discover_subdomains(domain) do
    url = "#{@ct_search_url}/?q=%.#{domain}&output=json"

    case HTTPoison.get(url, [], recv_timeout: 30_000) do
      {:ok, %{status_code: 200, body: body}} ->
        certificates = Jason.decode!(body)
        subdomains = extract_unique_subdomains(certificates, domain)
        {:ok, subdomains}

      {:ok, %{status_code: status}} ->
        {:error, {:http_error, status}}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp extract_unique_subdomains(certificates, base_domain) do
    certificates
    |> Enum.flat_map(fn cert ->
      (cert["name_value"] || "")
      |> String.split("\n")
      |> Enum.filter(&String.ends_with?(&1, base_domain))
    end)
    |> Enum.uniq()
    |> Enum.sort()
  end
end
```

### Real-Time CT Log Monitoring

```elixir
defmodule PrismaticPerimeter.CTMonitor do
  @moduledoc """
  Monitors Certificate Transparency logs in real-time via CertStream
  for certificates issued to monitored domains.
  """

  use GenServer

  @certstream_url "wss://certstream.calidog.io"

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(opts) do
    monitored_domains = Keyword.get(opts, :domains, [])
    connect_to_certstream()
    {:ok, %{domains: monitored_domains, alerts: []}}
  end

  @impl true
  def handle_info({:certstream, certificate_data}, state) do
    case check_monitored_domains(certificate_data, state.domains) do
      {:match, domain, cert_info} ->
        alert = %{
          domain: domain,
          issuer: cert_info.issuer,
          sans: cert_info.sans,
          not_before: cert_info.not_before,
          detected_at: DateTime.utc_now()
        }
        Logger.info("CT alert: New certificate for monitored domain #{domain}")
        {:noreply, %{state | alerts: [alert | state.alerts]}}

      :no_match ->
        {:noreply, state}
    end
  end

  defp check_monitored_domains(cert_data, domains) do
    cert_domains = extract_domains(cert_data)

    case Enum.find(domains, fn d -> Enum.any?(cert_domains, &String.ends_with?(&1, d)) end) do
      nil -> :no_match
      domain -> {:match, domain, parse_cert_info(cert_data)}
    end
  end
end
```

### Certificate Hygiene Scoring

```elixir
defmodule PrismaticPerimeter.CertificateScore do
  @moduledoc """
  Scores certificate hygiene based on CT log analysis.
  Contributes to the overall security rating (A-F).
  """

  @spec score(map()) :: {integer(), [String.t()]}
  def score(cert_analysis) do
    checks = [
      {check_key_strength(cert_analysis), 20},
      {check_validity_period(cert_analysis), 15},
      {check_ca_diversity(cert_analysis), 10},
      {check_ct_compliance(cert_analysis), 25},
      {check_expiration(cert_analysis), 20},
      {check_wildcard_usage(cert_analysis), 10}
    ]

    total = Enum.reduce(checks, 0, fn {{:pass, _}, points}, acc -> acc + points
                                      {{:fail, _}, _}, acc -> acc end)

    findings = checks
    |> Enum.filter(fn {{status, _}, _} -> status == :fail end)
    |> Enum.map(fn {{:fail, reason}, _} -> reason end)

    {total, findings}
  end

  defp check_key_strength(%{key_size: size}) when size >= 2048, do: {:pass, "Adequate key strength"}
  defp check_key_strength(%{key_size: size}), do: {:fail, "Weak key: #{size} bits"}

  defp check_validity_period(%{validity_days: days}) when days <= 398, do: {:pass, "Compliant validity period"}
  defp check_validity_period(%{validity_days: days}), do: {:fail, "Excessive validity: #{days} days"}

  defp check_ct_compliance(%{sct_count: count}) when count >= 2, do: {:pass, "CT compliant"}
  defp check_ct_compliance(_), do: {:fail, "Insufficient CT log submission"}
end
```

## Usage in Prismatic Platform

The Prismatic Platform leverages Certificate Transparency logs as a primary data source within [Prismatic Perimeter's](@/apps/_index.md) EASM asset discovery pipeline.

### EASM Integration

CT log queries form the second stage of the asset discovery pipeline:

```
Stage 1: DNS Enumeration
  |
Stage 2: CT Log Analysis  <-- Certificate Transparency
  |
Stage 3: Service Fingerprinting (Shodan/Censys)
  |
Stage 4: Asset Correlation and Deduplication
  |
Stage 5: Security Rating Calculation
```

### Security Rating Contribution

Certificate hygiene metrics derived from CT log analysis contribute to the A-F security grade:

| Factor | Weight | Scoring Criteria |
|--------|--------|-----------------|
| Key Strength | 20% | RSA >= 2048, ECDSA >= 256 |
| Validity Period | 15% | <= 398 days (industry standard) |
| CT Compliance | 25% | >= 2 SCTs from independent logs |
| Expiration Status | 20% | Not expired, > 30 days remaining |
| Wildcard Usage | 10% | Minimal wildcard scope |
| CA Diversity | 10% | Not single-CA dependent |

### Compliance Framework Integration

CT data feeds into NIS2 and ZKB compliance assessments:

```elixir
defmodule PrismaticPerimeter.Compliance.CertificateChecks do
  @moduledoc """
  Maps CT-derived certificate findings to compliance framework controls.
  """

  @nis2_controls %{
    "Article 21(2)(a)" => :crypto_controls,
    "Article 21(2)(d)" => :supply_chain_security,
    "Article 21(2)(h)" => :encryption_policies
  }

  def assess_nis2_compliance(cert_findings) do
    Enum.map(@nis2_controls, fn {article, check_type} ->
      result = evaluate_control(check_type, cert_findings)
      %{article: article, status: result.status, evidence: result.evidence}
    end)
  end
end
```

## Best Practices

1. **Monitor CT logs continuously** -- Set up real-time monitoring for all domains your organization owns. Unauthorized certificate issuance is a critical security event.

2. **Use multiple CT data sources** -- Query crt.sh, Google CT logs, and Censys for comprehensive coverage. No single source captures all certificates.

3. **Track certificate lifecycle** -- Monitor not just issuance but also expiration, renewal, and revocation events to maintain complete visibility.

4. **Validate SCT presence** -- Ensure all certificates serving your domains include valid SCTs from at least two independent CT logs.

5. **Correlate with DNS data** -- Combine CT subdomain discovery with DNS enumeration for maximum coverage. CT logs may reveal subdomains that DNS queries miss.

6. **Assess CA diversity** -- Depending on a single CA creates a single point of failure. CT data reveals CA concentration risks.

## Common Pitfalls

- **False positives in subdomain discovery**: CT logs contain wildcard certificates and pre-certificates that may reference non-existent subdomains. Validate discovered subdomains with DNS resolution.

- **Stale data**: CT logs are append-only, so expired and revoked certificates remain in the logs. Filter by validity period when analyzing current infrastructure.

- **Rate limiting**: CT log APIs and crt.sh implement rate limits. Implement backoff and caching to avoid being blocked during large-scale scans.

- **Missing pre-certificates**: Some CAs submit only final certificates, not pre-certificates. This can create a gap between certificate issuance and CT log appearance.

- **Privacy concerns**: CT logs expose all certificate SANs publicly. Organizations using certificates for internal subdomains may inadvertently reveal internal infrastructure naming conventions.

## Related Concepts

- [TLS](@/glossary/tls.md) -- Transport security protocol whose certificates CT logs monitor
- [EASM](@/glossary/easm.md) -- Attack surface management consuming CT log data for asset discovery
- [Attack Surface](@/glossary/attack-surface.md) -- Total exposure area that CT data helps map
- [Censys](@/glossary/censys.md) -- Internet scanner that indexes CT log data for certificate search
- [OSINT](@/glossary/osint.md) -- Intelligence discipline that uses CT logs as a data source
- [DNS Enumeration](@/glossary/dns-enumeration.md) -- Complementary discovery technique combined with CT data
- [Security Rating](@/glossary/security-rating.md) -- A-F grade incorporating certificate hygiene metrics

## Further Reading

- [RFC 6962: Certificate Transparency](https://datatracker.ietf.org/doc/html/rfc6962) -- Original CT specification
- [RFC 9162: Certificate Transparency Version 2.0](https://datatracker.ietf.org/doc/html/rfc9162) -- Updated specification
- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Technologies](@/technologies/_index.md) -- Technology stack details

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)