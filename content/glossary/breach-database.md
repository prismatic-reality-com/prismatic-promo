+++
title = "Breach Database"
weight = 50
[extra]
description = "A breach database is a structured collection of credentials, personal information, and metadata exposed through security incidents, used defensively for threat intelligence, credential monitoring, and attack surface management."
category = "security"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "cybersecurity"
related_concepts = ["credential stuffing", "data exfiltration", "threat intelligence", "OSINT", "attack surface management", "password hashing", "identity protection", "dark web monitoring"]
implementation_status = "production"
authority_level = "L3-strategic"
difficulty_rating = 4
prerequisites = ["security fundamentals", "OSINT concepts", "database design", "cryptographic hashing"]
learning_path = ["security foundations", "OSINT methodology", "breach intelligence", "threat hunting", "attack surface management"]
interactive_demos = ["breach search simulation", "credential correlation engine", "exposure timeline visualization"]
code_examples = true
external_resources = ["https://haveibeenpwned.com", "https://owasp.org/www-community/attacks/Credential_stuffing", "https://www.enisa.europa.eu/topics/incident-reporting"]
version_introduced = "0.14.0"
stability_level = "stable"
testing_scenarios = ["breach record ingestion", "credential deduplication", "PII detection and redaction", "hash format identification", "exposure correlation"]
keywords = ["breach database", "credential leak", "data breach", "compromised credentials", "exposure monitoring", "breach intelligence", "HIBP", "dark web", "OSINT security"]
tags = ["glossary", "security", "osint", "breach-intelligence", "threat-intelligence", "credential-monitoring"]
related_terms = ["osint", "security", "threat-intelligence", "attack-surface", "credential-management", "encryption", "vulnerability", "easm", "risk-assessment", "authentication"]
word_count = 1802
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Breach Database - Prismatic Platform"
+++

## Definition

A **breach database** is a structured repository of data that has been exposed, leaked, or stolen through security incidents, unauthorized access, or system compromises. These databases contain credentials (usernames, passwords, password hashes), personally identifiable information (PII), financial records, and associated metadata extracted from data breaches. In a defensive security context, breach databases serve as critical intelligence sources for identifying compromised credentials, assessing organizational exposure, monitoring attack surfaces, and strengthening authentication systems against credential-based attacks.

## Overview

Data breaches represent one of the most persistent and damaging threats in modern cybersecurity. According to industry reports, billions of credentials have been exposed across thousands of breaches, creating an ever-expanding corpus of compromised data that adversaries actively exploit through credential stuffing, password spraying, and account takeover attacks.

Breach databases exist in multiple contexts. On the adversarial side, threat actors compile and trade breach data on dark web forums and underground marketplaces. On the defensive side, organizations like Have I Been Pwned (HIBP), security vendors, and internal security teams aggregate breach data to provide early warning systems, credential monitoring services, and exposure assessments.

For an intelligence platform, breach database integration is not about possessing stolen data -- it is about understanding the threat landscape, correlating exposure signals across organizational boundaries, and enabling proactive defense. The distinction between offensive exploitation and defensive intelligence is fundamental: defensive use focuses on identifying whether an organization's credentials have been compromised, not on exploiting those credentials.

### Key Characteristics of Breach Databases

- **Volume**: Modern breach compilations can contain billions of records, requiring efficient storage and retrieval mechanisms
- **Heterogeneity**: Data formats vary wildly across breaches -- different delimiter formats, encoding schemes, hash algorithms, and field structures
- **Temporal relevance**: Breach data has a time-decay component; recently exposed credentials are more actionable than historical ones
- **Provenance tracking**: Understanding which breach a credential originated from is critical for risk assessment and compliance
- **Deduplication complexity**: The same credential may appear across multiple breaches, requiring sophisticated deduplication and correlation

## Technical Details

### Breach Data Taxonomy

Breach databases contain various categories of exposed information, each with different risk implications and handling requirements:

| Data Category | Examples | Risk Level | Retention Policy |
|---------------|----------|------------|-----------------|
| **Credentials** | email:password, email:hash | Critical | Hash-only storage |
| **PII** | Name, address, SSN, DOB | Critical | Encrypted, access-controlled |
| **Financial** | Credit card numbers, bank accounts | Critical | Tokenized only |
| **Authentication tokens** | API keys, session tokens, OAuth tokens | High | Immediate invalidation |
| **Metadata** | IP addresses, timestamps, user agents | Medium | Aggregated analytics |
| **Configuration** | Database strings, internal URLs | High | Redacted storage |

### Hash Format Identification

A critical capability in breach database processing is identifying the hash algorithm used to protect passwords. Different breaches use different hashing schemes, and understanding the algorithm informs the risk assessment:

```elixir
defmodule Prismatic.BreachIntelligence.HashIdentifier do
  @moduledoc """
  Identifies password hash formats found in breach data.
  Supports detection of common algorithms and provides
  risk assessment based on hash strength.
  """

  @type hash_info :: %{
    algorithm: atom(),
    strength: :weak | :moderate | :strong,
    crackable: boolean(),
    description: String.t()
  }

  @hash_patterns [
    {~r/^\$2[aby]?\$\d{2}\$[.\/A-Za-z0-9]{53}$/, :bcrypt, :strong},
    {~r/^\$argon2(i|d|id)\$/, :argon2, :strong},
    {~r/^\$scrypt\$/, :scrypt, :strong},
    {~r/^\$6\$[a-zA-Z0-9.\/]{8,16}\$[a-zA-Z0-9.\/]{86}$/, :sha512crypt, :moderate},
    {~r/^\$5\$[a-zA-Z0-9.\/]{8,16}\$[a-zA-Z0-9.\/]{43}$/, :sha256crypt, :moderate},
    {~r/^[a-f0-9]{128}$/, :sha512, :weak},
    {~r/^[a-f0-9]{64}$/, :sha256, :weak},
    {~r/^[a-f0-9]{40}$/, :sha1, :weak},
    {~r/^[a-f0-9]{32}$/, :md5, :weak}
  ]

  @spec identify(String.t()) :: {:ok, hash_info()} | {:error, :unknown_format}
  def identify(hash) when is_binary(hash) do
    hash = String.trim(hash)

    case Enum.find(@hash_patterns, fn {pattern, _algo, _strength} ->
      Regex.match?(pattern, hash)
    end) do
      {_pattern, algorithm, strength} ->
        {:ok, %{
          algorithm: algorithm,
          strength: strength,
          crackable: strength == :weak,
          description: describe_algorithm(algorithm)
        }}

      nil ->
        {:error, :unknown_format}
    end
  end

  defp describe_algorithm(:bcrypt), do: "Adaptive hash function with configurable work factor"
  defp describe_algorithm(:argon2), do: "Memory-hard hash function resistant to GPU attacks"
  defp describe_algorithm(:scrypt), do: "Memory-hard key derivation function"
  defp describe_algorithm(:sha512crypt), do: "SHA-512 based Unix crypt with rounds"
  defp describe_algorithm(:sha256crypt), do: "SHA-256 based Unix crypt with rounds"
  defp describe_algorithm(:sha512), do: "Unsalted SHA-512 - vulnerable to rainbow tables"
  defp describe_algorithm(:sha256), do: "Unsalted SHA-256 - vulnerable to rainbow tables"
  defp describe_algorithm(:sha1), do: "Deprecated SHA-1 - trivially crackable"
  defp describe_algorithm(:md5), do: "Deprecated MD5 - trivially crackable"
end
```

### Credential Correlation Engine

The core challenge of breach intelligence is correlating exposure data across multiple sources to build a comprehensive exposure profile for an organization:

```elixir
defmodule Prismatic.BreachIntelligence.CorrelationEngine do
  @moduledoc """
  Correlates breach records across multiple data sources
  to build organizational exposure profiles. Uses domain-based
  matching, temporal analysis, and confidence scoring.
  """

  alias Prismatic.BreachIntelligence.HashIdentifier

  @type breach_record :: %{
    email: String.t(),
    domain: String.t(),
    hash: String.t() | nil,
    breach_source: String.t(),
    breach_date: DateTime.t(),
    data_classes: [String.t()]
  }

  @type correlation_result :: %{
    domain: String.t(),
    total_exposures: non_neg_integer(),
    unique_accounts: non_neg_integer(),
    breach_sources: [String.t()],
    risk_score: float(),
    timeline: [%{date: DateTime.t(), count: non_neg_integer()}]
  }

  @spec correlate_for_domain(String.t(), [breach_record()]) :: {:ok, correlation_result()}
  def correlate_for_domain(domain, records) when is_binary(domain) do
    domain_records =
      records
      |> Enum.filter(&String.ends_with?(&1.email, "@" <> domain))
      |> Enum.uniq_by(fn record -> {record.email, record.breach_source} end)

    unique_accounts =
      domain_records
      |> Enum.map(& &1.email)
      |> Enum.uniq()
      |> length()

    breach_sources =
      domain_records
      |> Enum.map(& &1.breach_source)
      |> Enum.uniq()
      |> Enum.sort()

    timeline = build_exposure_timeline(domain_records)
    risk_score = calculate_risk_score(domain_records, unique_accounts)

    {:ok, %{
      domain: domain,
      total_exposures: length(domain_records),
      unique_accounts: unique_accounts,
      breach_sources: breach_sources,
      risk_score: risk_score,
      timeline: timeline
    }}
  end

  defp build_exposure_timeline(records) do
    records
    |> Enum.group_by(&DateTime.to_date(&1.breach_date))
    |> Enum.map(fn {date, group} -> %{date: date, count: length(group)} end)
    |> Enum.sort_by(& &1.date, Date)
  end

  defp calculate_risk_score(records, unique_accounts) do
    recency_factor = calculate_recency_factor(records)
    hash_weakness_factor = calculate_hash_weakness(records)
    volume_factor = min(unique_accounts / 100.0, 1.0)

    (recency_factor * 0.4 + hash_weakness_factor * 0.35 + volume_factor * 0.25)
    |> Float.round(3)
  end

  defp calculate_recency_factor(records) do
    now = DateTime.utc_now()

    records
    |> Enum.map(fn record ->
      days_ago = DateTime.diff(now, record.breach_date, :day)
      max(1.0 - days_ago / 365.0, 0.0)
    end)
    |> then(fn factors ->
      if factors == [], do: 0.0, else: Enum.max(factors)
    end)
  end

  defp calculate_hash_weakness(records) do
    records
    |> Enum.filter(& &1.hash)
    |> Enum.map(fn record ->
      case HashIdentifier.identify(record.hash) do
        {:ok, %{strength: :weak}} -> 1.0
        {:ok, %{strength: :moderate}} -> 0.5
        {:ok, %{strength: :strong}} -> 0.1
        {:error, _} -> 0.5
      end
    end)
    |> then(fn scores ->
      if scores == [], do: 0.5, else: Enum.sum(scores) / length(scores)
    end)
  end
end
```

### Storage Architecture

Breach databases present unique storage challenges due to their scale and sensitivity. A well-designed system separates raw breach data from derived intelligence:

```elixir
defmodule Prismatic.BreachIntelligence.Storage do
  @moduledoc """
  Storage layer for breach intelligence data.
  Implements tiered storage with encryption at rest,
  access control, and automatic PII redaction.
  """

  @type storage_tier :: :hot | :warm | :cold | :archive
  @type access_level :: :analyst | :senior_analyst | :administrator

  @spec store_breach_record(map(), keyword()) :: {:ok, String.t()} | {:error, term()}
  def store_breach_record(record, opts \\ []) do
    tier = Keyword.get(opts, :tier, classify_tier(record))

    record
    |> redact_pii()
    |> normalize_format()
    |> encrypt_sensitive_fields()
    |> persist_to_tier(tier)
  end

  defp classify_tier(record) do
    days_since_breach = DateTime.diff(DateTime.utc_now(), record.breach_date, :day)

    cond do
      days_since_breach < 90 -> :hot
      days_since_breach < 365 -> :warm
      days_since_breach < 1095 -> :cold
      true -> :archive
    end
  end

  defp redact_pii(record) do
    record
    |> Map.update(:email, nil, &hash_email/1)
    |> Map.delete(:plaintext_password)
    |> Map.update(:ip_address, nil, &anonymize_ip/1)
  end

  defp hash_email(email) when is_binary(email) do
    :crypto.hash(:sha256, String.downcase(email))
    |> Base.hex_encode32(case: :lower, padding: false)
  end

  defp anonymize_ip(ip) when is_binary(ip) do
    case String.split(ip, ".") do
      [a, b, _c, _d] -> "#{a}.#{b}.0.0/16"
      _ -> "redacted"
    end
  end

  defp normalize_format(record), do: record
  defp encrypt_sensitive_fields(record), do: record
  defp persist_to_tier(record, _tier), do: {:ok, record |> :erlang.phash2() |> Integer.to_string()}
end
```

## Implementation in Prismatic Platform

The Prismatic Platform integrates breach intelligence as a core component of its [External Attack Surface Management (EASM)](/glossary/easm/) capabilities through Prismatic Perimeter. The implementation follows a layered architecture:

### Intelligence Pipeline

1. **Ingestion Layer**: Breach data is imported from authorized intelligence feeds, normalized into a common schema, and deduplicated. The platform supports multiple input formats including CSV, JSON, and custom delimiter formats commonly found in breach compilations.

2. **Processing Layer**: Records pass through the hash identification engine, PII detection and redaction pipeline, and domain classification system. Each record is tagged with provenance metadata and confidence scores.

3. **Correlation Layer**: The correlation engine matches breach records against monitored domains and entities, building exposure profiles that feed into the security rating system.

4. **Alerting Layer**: Real-time notifications are triggered when new breaches affecting monitored domains are detected. Alerts include risk assessment, affected account counts, and recommended remediation actions.

### Integration with Security Ratings

Breach exposure is a weighted factor in Prismatic Perimeter's A-F [security rating](/glossary/security-rating/) system. The scoring considers:

- **Number of unique compromised accounts** relative to estimated organization size
- **Recency of exposure** -- recent breaches carry higher weight
- **Hash algorithm strength** -- breaches with weak hashing increase risk scores
- **Credential reuse indicators** -- accounts appearing across multiple breaches signal password reuse
- **Remediation evidence** -- password resets and MFA adoption reduce the negative impact

### Compliance Alignment

Breach database handling in Prismatic Platform is designed to comply with [GDPR](/glossary/gdpr/) data processing requirements, [NIS2](/glossary/nis2/) incident reporting obligations, and Czech ZKB 264/2025 Sb. national security requirements. All PII is processed under legitimate interest or consent-based legal bases, with automatic data minimization and retention policies.

## Comparison with Alternatives

| Platform | Approach | Strengths | Limitations |
|----------|----------|-----------|-------------|
| **Have I Been Pwned** | Public API, k-anonymity | Free, widely adopted, privacy-preserving | Limited to email lookup, no organizational view |
| **SpyCloud** | Commercial intelligence | Deep coverage, account takeover prevention | Expensive, closed source |
| **DeHashed** | Search engine model | Broad data, API access | Legal gray areas, raw data exposure |
| **Prismatic Platform** | Integrated EASM intelligence | Correlation engine, security ratings, compliance | Requires intelligence feed subscriptions |
| **BreachDirectory** | Free lookup service | Easy access | Limited features, questionable data provenance |

The Prismatic Platform differentiates itself through deep integration between breach intelligence and the broader [attack surface](/glossary/attack-surface/) management workflow. Rather than providing standalone breach lookup, breach data is one signal among many that contributes to a holistic security posture assessment.

## Best Practices

### Data Handling

1. **Never store plaintext passwords**: Even when breach data contains plaintext credentials, store only salted hashes for comparison purposes. The original plaintext must be discarded immediately after hashing.

2. **Implement access controls**: Breach data is sensitive by nature. Apply role-based access control ([RBAC](/glossary/rbac/)) with principle of least privilege. Analysts should only see aggregated exposure metrics, not individual credentials.

3. **Maintain provenance chains**: Every breach record must be traceable to its source. This is critical for both intelligence quality assessment and compliance with data protection regulations.

4. **Apply time-decay weighting**: Breach data loses relevance over time as credentials are rotated. Implement automatic decay factors in risk calculations and consider archival policies for old breach data.

5. **Deduplicate aggressively**: The same credentials often appear across multiple compilations and breach aggregations. Without deduplication, exposure metrics become inflated and misleading.

### Intelligence Operations

1. **Validate breach authenticity**: Not all claimed breaches are real. Cross-reference breach claims against known breach disclosures, check data consistency, and assess source reliability before ingesting.

2. **Correlate across sources**: Single-source intelligence is unreliable. The [signal plurality](/glossary/signal-plurality/) principle requires corroboration from multiple independent sources before establishing high-confidence exposure claims.

3. **Monitor for recombination attacks**: Threat actors combine data from multiple breaches to build enriched profiles. Monitor for credential reuse patterns that indicate cross-breach correlation by adversaries.

4. **Integrate with [authentication](/glossary/authentication/) systems**: Breach intelligence should feed directly into authentication decisions -- blocking or flagging login attempts using known-compromised credentials.

## Common Pitfalls

### Legal and Ethical Risks

- **Unauthorized data possession**: Possessing raw breach data may violate data protection laws in many jurisdictions. Always ensure legal basis for processing and prefer hash-based comparison methods (like HIBP's k-anonymity model) over storing raw credentials.
- **Conflating defensive and offensive use**: Breach databases must be used exclusively for defensive purposes -- protecting organizations and individuals. Any use for unauthorized access constitutes a criminal offense regardless of intent.
- **Ignoring data minimization**: Storing more breach data than necessary for the specific intelligence purpose violates GDPR's data minimization principle and increases liability in case of a security incident affecting the intelligence platform itself.

### Technical Pitfalls

- **Underestimating scale**: Breach databases can contain billions of records. Naive in-memory processing will fail. Use streaming approaches, partitioned storage, and indexed lookups.
- **Ignoring encoding issues**: Breach data comes in every conceivable encoding -- UTF-8, Latin-1, Windows-1252, mixed encodings within a single file. Robust parsing requires encoding detection and normalization.
- **Trusting hash identification blindly**: A 32-character hexadecimal string could be MD5, NTLM, or numerous other formats. Context from the breach source is often necessary for accurate identification.
- **Failing to account for credential rotation**: An exposed credential from 2015 may have been changed multiple times since. Risk models must incorporate temporal decay and evidence of remediation.

## Use Cases

### Organizational Exposure Assessment

Security teams use breach databases to understand their organization's exposure footprint. By querying breach intelligence with corporate email domains, they can identify how many employee credentials have been compromised, which breaches affected them, and whether password hashing was adequate. This assessment informs password policy decisions, MFA rollout priorities, and security awareness training focus areas.

### Third-Party Risk Management

During [due diligence](/glossary/due-diligence/) assessments, breach intelligence provides insight into a vendor's or partner's security posture. A history of frequent breaches or exposure of sensitive data may indicate systemic security weaknesses that affect the risk profile of the business relationship.

### Incident Response

When investigating a security incident, breach databases help determine whether compromised credentials were the initial access vector. If an attacker used credentials found in a prior breach to gain access, this narrows the investigation scope and informs remediation -- specifically, identifying all accounts that may have been compromised through the same credential source.

### Compliance Monitoring

Regulatory frameworks including [NIS2](/glossary/nis2/) and the Czech [ZKB](/glossary/zkb/) require organizations to maintain awareness of their security posture and report incidents. Continuous breach monitoring provides evidence of proactive security management and supports compliance reporting obligations.

### Red Team Operations

Authorized [penetration testing](/glossary/penetration-testing/) teams use breach intelligence to simulate realistic attack scenarios. By identifying actually compromised credentials (with proper authorization and scope agreements), red teams can demonstrate the real-world risk of credential-based attacks and validate the effectiveness of detective controls.

## Related Concepts

Breach databases intersect with numerous security and intelligence domains within the Prismatic Platform:

- [OSINT](/glossary/osint/) -- Breach databases are a primary source within the broader open-source intelligence discipline, providing actionable data about exposed credentials and organizational security posture
- [EASM](/glossary/easm/) -- External Attack Surface Management uses breach intelligence as one signal for assessing an organization's external exposure and security rating
- [Attack Surface](/glossary/attack-surface/) -- Compromised credentials expand an organization's effective attack surface by providing adversaries with valid authentication vectors
- [Credential Management](/glossary/credential-management/) -- Breach intelligence informs credential lifecycle policies, rotation schedules, and complexity requirements
- [Security Rating](/glossary/security-rating/) -- Breach exposure is a weighted factor in computing A-F security grades within Prismatic Perimeter
- [Threat Intelligence](/glossary/threat-intelligence/) -- Breach databases represent one category of threat intelligence feeds integrated into comprehensive threat analysis
- [Vulnerability](/glossary/vulnerability/) -- Compromised credentials represent a vulnerability class that traditional vulnerability scanning cannot detect
- [Authentication](/glossary/authentication/) -- Breach-aware authentication systems reject known-compromised passwords and enforce stronger authentication for exposed accounts
- [Risk Assessment](/glossary/risk-assessment/) -- Breach exposure data feeds directly into organizational risk quantification models
- [Encryption](/glossary/encryption/) -- The strength of password hashing in breached databases directly impacts the exploitability of exposed credentials

## See Also

- [Prismatic Perimeter](/glossary/prismatic-perimeter/) -- The EASM module that integrates breach intelligence into security ratings
- [Due Diligence](/glossary/due-diligence/) -- Third-party risk assessment process that leverages breach intelligence
- [GDPR](/glossary/gdpr/) -- European data protection regulation governing breach data handling
- [NIS2](/glossary/nis2/) -- EU directive requiring breach awareness and incident reporting
- [Sanctions Screening](/glossary/sanctions-screening/) -- Another intelligence-driven compliance capability in the platform
- [Penetration Testing](/glossary/penetration-testing/) -- Authorized security testing that may leverage breach intelligence

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
