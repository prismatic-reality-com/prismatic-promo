+++
title = "PII (Personally Identifiable Information)"
weight = 50
[extra]
description = "Data that can identify a specific individual, requiring strict handling under GDPR and privacy regulations"
category = "compliance"
related_terms = ["pep", "permission", "secrets", "sanctions", "scope", "aml", "gdpr"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-24"
keywords = ["PII", "personally identifiable information", "GDPR", "privacy", "data protection", "glossary", "Prismatic Platform"]
tags = ["glossary", "compliance", "privacy", "security"]
quality_score = 78
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "PII (Personally Identifiable Information) - Prismatic Platform"
+++

## Definition & Overview

Personally Identifiable Information (PII) refers to any data that can be used, alone or in combination with other information, to identify, contact, or locate a specific individual. Direct PII includes names, social security numbers, email addresses, and biometric data. Indirect PII includes date of birth, ZIP code, and employment information which, when combined, can uniquely identify a person. The distinction between direct and indirect PII is critical for determining appropriate handling, storage, and transmission controls.

Under the EU General Data Protection Regulation (GDPR), PII falls under the broader concept of "personal data" defined in Article 4(1). GDPR imposes strict requirements on data controllers and processors: lawful basis for processing, purpose limitation, data minimization, accuracy obligations, storage limitation, integrity and confidentiality, and accountability. Violations carry penalties up to 4% of annual global turnover or 20 million EUR, whichever is greater.

The Prismatic Platform processes PII in multiple contexts: OSINT intelligence gathering (names, email addresses, corporate registrations), DD pipeline entity enrichment (political exposure, business relationships), and Perimeter scanning (domain registration data, certificate details). Each context requires distinct PII handling policies governed by the platform's data classification framework, which tags every data field with its sensitivity level and applicable regulatory requirements.

## Technical Deep Dive

PII detection and classification in the Prismatic Platform operates at the data ingestion boundary. Every piece of data entering the system passes through a classification pipeline that identifies PII fields, assigns sensitivity levels, and applies appropriate handling rules. This boundary enforcement ensures that PII handling requirements are attached to data at the point of entry, not retroactively.

```elixir
defmodule PrismaticCompliance.PII.Classifier do
  @moduledoc """
  Classifies data fields for PII content using pattern matching
  and contextual analysis. Assigns sensitivity levels and
  applicable regulatory frameworks.
  """

  @type sensitivity :: :public | :internal | :confidential | :restricted
  @type regulation :: :gdpr | :ccpa | :czech_gdpr | :nis2

  @type classification :: %{
    field: String.t(),
    pii_type: atom(),
    sensitivity: sensitivity(),
    regulations: [regulation()],
    handling: map()
  }

  @pii_patterns %{
    email: ~r/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    phone: ~r/^\+?[1-9]\d{6,14}$/,
    national_id: ~r/^\d{6}\/?\d{3,4}$/,
    ip_address: ~r/^(?:\d{1,3}\.){3}\d{1,3}$/,
    iban: ~r/^[A-Z]{2}\d{2}[A-Z0-9]{4,}$/
  }

  @spec classify(map()) :: {:ok, [classification()]}
  def classify(data) when is_map(data) do
    classifications =
      data
      |> Enum.flat_map(fn {field, value} ->
        detect_pii(to_string(field), to_string(value))
      end)
      |> Enum.map(&enrich_classification/1)

    {:ok, classifications}
  end

  defp detect_pii(field, value) do
    pattern_matches =
      @pii_patterns
      |> Enum.filter(fn {_type, pattern} -> Regex.match?(pattern, value) end)
      |> Enum.map(fn {type, _} -> %{field: field, pii_type: type, value_hash: hash(value)} end)

    name_match =
      if field_suggests_pii?(field) do
        [%{field: field, pii_type: :name_field, value_hash: hash(value)}]
      else
        []
      end

    pattern_matches ++ name_match
  end

  defp field_suggests_pii?(field) do
    pii_field_names = ~w(name first_name last_name email phone address ssn birth_date)
    String.downcase(field) in pii_field_names
  end

  defp enrich_classification(%{pii_type: type} = classification) do
    Map.merge(classification, %{
      sensitivity: sensitivity_for(type),
      regulations: regulations_for(type),
      handling: handling_rules_for(type)
    })
  end

  defp sensitivity_for(:email), do: :confidential
  defp sensitivity_for(:phone), do: :confidential
  defp sensitivity_for(:national_id), do: :restricted
  defp sensitivity_for(:ip_address), do: :internal
  defp sensitivity_for(_), do: :confidential

  defp regulations_for(:national_id), do: [:gdpr, :czech_gdpr]
  defp regulations_for(:email), do: [:gdpr, :ccpa]
  defp regulations_for(_), do: [:gdpr]

  defp handling_rules_for(:restricted), do: %{encrypt_at_rest: true, encrypt_in_transit: true, audit_access: true, retention_days: 90}
  defp handling_rules_for(_type), do: %{encrypt_at_rest: true, encrypt_in_transit: true, audit_access: true, retention_days: 365}

  defp hash(value), do: :crypto.hash(:sha256, value) |> Base.encode16(case: :lower)
end
```

Data minimization is enforced through field-level redaction. When PII data is accessed for purposes that do not require the full value (such as analytics or logging), the platform automatically applies redaction rules based on the field's classification.

```elixir
defmodule PrismaticCompliance.PII.Redactor do
  @moduledoc """
  Field-level PII redaction for logging, analytics, and
  non-privileged data access contexts.
  """

  @spec redact(map(), [PrismaticCompliance.PII.Classifier.classification()]) :: map()
  def redact(data, classifications) do
    pii_fields = MapSet.new(classifications, & &1.field)

    Map.new(data, fn {key, value} ->
      if MapSet.member?(pii_fields, to_string(key)) do
        {key, redact_value(value)}
      else
        {key, value}
      end
    end)
  end

  defp redact_value(value) when is_binary(value) do
    cond do
      String.contains?(value, "@") -> redact_email(value)
      String.length(value) > 4 -> String.slice(value, 0, 2) <> "***" <> String.slice(value, -2, 2)
      true -> "***"
    end
  end

  defp redact_value(_value), do: "***"

  defp redact_email(email) do
    case String.split(email, "@") do
      [local, domain] ->
        redacted_local = String.slice(local, 0, 2) <> "***"
        "#{redacted_local}@#{domain}"
      _ -> "***@***"
    end
  end
end
```

## Architecture & Implementation

The Prismatic Platform's PII handling architecture follows a data lifecycle approach: classification at ingestion, encryption at rest, access control during processing, redaction for non-privileged contexts, and secure deletion at retention expiry. Each stage is enforced by distinct subsystem components that operate independently, providing defense-in-depth against PII exposure.

The storage layer encrypts PII fields using AES-256-GCM with per-field encryption keys derived from a master key via HKDF. This field-level encryption enables granular access control: a user with permission to view entity names but not national IDs will see decrypted names alongside encrypted (or redacted) national IDs, enforced at the storage adapter level.

Audit logging tracks every PII access event with the accessing user, purpose, timestamp, and the specific fields accessed. This audit trail satisfies GDPR Article 30 record-keeping requirements and enables compliance officers to demonstrate lawful processing to supervisory authorities.

## Usage in Prismatic Platform

PII handling is deeply integrated across the OSINT, DD, and Perimeter subsystems. The OSINT toolbox applies PII classification to all intelligence results, the DD pipeline enforces data minimization during entity enrichment, and the Perimeter module handles domain registration PII with appropriate redaction.

```elixir
defmodule PrismaticDd.Pipeline.PIIGuard do
  @moduledoc """
  Pipeline stage that ensures PII handling compliance
  before entity data is persisted to the DD storage layer.
  """

  @behaviour PrismaticDd.Pipeline.Stage

  @impl true
  def execute(%{entities: entities} = context) do
    processed =
      Enum.map(entities, fn entity ->
        {:ok, classifications} = PrismaticCompliance.PII.Classifier.classify(entity.attributes)

        entity
        |> Map.put(:pii_classifications, classifications)
        |> Map.put(:pii_fields, Enum.map(classifications, & &1.field))
        |> Map.put(:data_retention_policy, determine_retention(classifications))
      end)

    {:ok, %{context | entities: processed}}
  end

  defp determine_retention(classifications) do
    max_sensitivity =
      classifications
      |> Enum.map(& &1.sensitivity)
      |> Enum.max_by(&sensitivity_rank/1, fn -> :public end)

    case max_sensitivity do
      :restricted -> %{days: 90, review_required: true}
      :confidential -> %{days: 365, review_required: false}
      _ -> %{days: 730, review_required: false}
    end
  end

  defp sensitivity_rank(:restricted), do: 4
  defp sensitivity_rank(:confidential), do: 3
  defp sensitivity_rank(:internal), do: 2
  defp sensitivity_rank(:public), do: 1
end
```

## Cross-References

- [PEP](@/glossary/pep.md) - Politically exposed persons whose PII requires enhanced due diligence
- **Sanctions** - Restrictive measures databases containing PII of designated individuals
- [Permission](@/glossary/permission.md) - Access rights governing who can view PII fields
- **Secrets** - Encryption keys and credentials protecting PII at rest
- **Provenance** - Origin tracking satisfying GDPR data lineage requirements

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
