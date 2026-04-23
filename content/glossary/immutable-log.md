+++
title = "Immutable Log"
description = "An append-only audit trail where entries cannot be modified or deleted after creation, providing tamper-evident records for compliance, forensics, and system state reconstruction."
weight = 50

[extra]
category = "architecture"
tags = ["immutable-log", "audit-trail", "append-only", "tamper-proof", "compliance", "forensics", "nis2", "gdpr", "blockchain", "event-sourcing"]
date_created = "2026-02-23"
date_updated = "2026-02-23"
difficulty = "intermediate"
audience = ["architects", "developers", "compliance-officers", "security-engineers"]
related_terms = ["event-log", "event", "audit-trail", "blockchain", "event-sourcing", "wal", "compliance"]
key_concepts = ["append-only", "tamper-evidence", "cryptographic-chaining", "retention-policy", "write-once-read-many"]
platforms = ["postgresql", "beam", "elixir"]
prerequisites = ["database-fundamentals", "compliance-basics", "cryptography-basics"]
use_cases = ["audit-compliance", "regulatory-reporting", "forensic-investigation", "state-reconstruction", "change-tracking"]
complexity = "medium"
stability = "mature"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1050
date_modified = "2026-02-23"
keywords = ["Immutable Log", "audit trail", "append-only", "glossary", "Prismatic Platform"]
quality_score = 80
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Immutable Log - Prismatic Platform"
+++

## Definition and Overview

An immutable log is a data structure that enforces strict append-only semantics: once an entry is written, it can never be modified, overwritten, or deleted. This immutability provides a tamper-evident historical record that serves as the authoritative source of truth for what happened in a system and when it happened. Immutable logs are foundational to audit compliance (NIS2, GDPR, SOC 2, PCI DSS), digital forensics, and event-sourced system architectures.

The immutability guarantee can be enforced at multiple levels. Application-level enforcement uses code conventions and API design (no update/delete endpoints). Database-level enforcement uses triggers, row-level security policies, and schema constraints (no UPDATE or DELETE permissions on log tables). Cryptographic enforcement uses hash chains where each entry includes the hash of the previous entry, making any tampering detectable. Hardware-level enforcement uses WORM (Write Once Read Many) storage where physical media prevents overwriting.

Immutable logs differ from regular database tables in their temporal properties. A regular table represents current state -- it answers "what is?" An immutable log represents complete history -- it answers "what happened?" This distinction is critical for compliance, where regulators require evidence not just of current state but of the complete sequence of events that led to it. If a user's permissions were changed, the immutable log records who changed them, when, what the previous values were, and what the new values are.

## Technical Deep Dive

### Immutability Enforcement Layers

| Layer | Mechanism | Strength | Bypass Risk |
|-------|-----------|----------|-------------|
| **Application** | API design (no delete/update methods) | Moderate | Application code change |
| **Database** | Triggers, row security, revoked permissions | Strong | DBA access |
| **Cryptographic** | Hash chains, digital signatures | Very strong | Key compromise |
| **Hardware** | WORM storage, HSM-backed signing | Maximum | Physical access |

### Hash Chain Structure

```
Entry 1:
  data: {...}
  hash: SHA256(data_1)
  prev_hash: NULL (genesis)

Entry 2:
  data: {...}
  hash: SHA256(data_2 || prev_hash_1)
  prev_hash: hash_1

Entry 3:
  data: {...}
  hash: SHA256(data_3 || prev_hash_2)
  prev_hash: hash_2

Tampering with Entry 2 would change hash_2,
which would invalidate Entry 3's prev_hash reference,
and all subsequent entries.
```

### Compliance Requirements

| Regulation | Log Requirements | Retention Period |
|-----------|-----------------|-----------------|
| **NIS2** | Incident records, access logs, configuration changes | 3+ years |
| **GDPR** | Processing activity records, consent records | Duration of processing + 5 years |
| **SOC 2** | Access logs, change logs, security events | 1+ year |
| **PCI DSS** | Audit trails for all system components | 1 year available, 3 months immediate |
| **HIPAA** | Access logs, disclosure records | 6 years |

### Storage Strategies

| Strategy | Write Performance | Storage Cost | Tamper Resistance |
|----------|-----------------|--------------|-------------------|
| **PostgreSQL (constrained)** | High | Moderate | Database-level |
| **PostgreSQL + hash chain** | High | Moderate+ | Cryptographic |
| **Kafka (compaction disabled)** | Very high | High | Append-only by design |
| **Blockchain** | Low | Very high | Maximum (distributed consensus) |
| **Object storage (S3, GCS)** | Moderate | Low | Object versioning + lock |

## Architecture and Implementation

Immutable log architecture in the Prismatic Platform uses PostgreSQL as the storage backend with application-level and database-level immutability enforcement. The architecture consists of four components: the log writer (appending new entries with hash chain linking), the log reader (querying and replaying entries), the integrity verifier (validating the hash chain), and the retention manager (archiving old entries to cold storage while preserving the chain).

The log writer computes a hash of each new entry and includes the hash of the previous entry, creating a cryptographic chain that makes tampering detectable. Database-level protections include revoking UPDATE and DELETE permissions on log tables and using a trigger that rejects any modification attempts. Application-level protections ensure that the log module's public API only exposes append and query operations.

The integrity verifier runs periodically (and on-demand) to validate the hash chain from any entry to any other entry. If the chain is broken at any point, the verification fails and an alert is raised. This provides ongoing assurance that the log has not been tampered with, even if an attacker gained temporary database access.

## Usage in Prismatic Platform

The Prismatic Platform maintains immutable logs for OSINT tool executions, security events, agent actions, and DD pipeline operations.

```elixir
defmodule Prismatic.ImmutableLog do
  @moduledoc """
  Cryptographically chained immutable log for audit
  compliance. Entries are append-only with hash chain
  linking for tamper detection.
  """

  use Ecto.Schema
  import Ecto.Query

  @type t :: %__MODULE__{
    sequence: integer(),
    entry_type: String.t(),
    subject: String.t(),
    actor: String.t(),
    action: String.t(),
    payload: map(),
    entry_hash: String.t(),
    prev_hash: String.t() | nil,
    created_at: DateTime.t()
  }

  @primary_key false
  schema "immutable_audit_log" do
    field :sequence, :integer, primary_key: true, autogenerate: true
    field :entry_type, :string
    field :subject, :string
    field :actor, :string
    field :action, :string
    field :payload, :map
    field :entry_hash, :string
    field :prev_hash, :string
    field :created_at, :utc_datetime_usec
  end

  @spec append(String.t(), String.t(), String.t(), String.t(), map()) :: {:ok, t()} | {:error, term()}
  def append(entry_type, subject, actor, action, payload) do
    prev_hash = get_latest_hash()
    now = DateTime.utc_now()

    entry_data = "#{entry_type}|#{subject}|#{actor}|#{action}|#{Jason.encode!(payload)}|#{DateTime.to_iso8601(now)}|#{prev_hash}"
    entry_hash = :crypto.hash(:sha256, entry_data) |> Base.encode16(case: :lower)

    %__MODULE__{
      entry_type: entry_type,
      subject: subject,
      actor: actor,
      action: action,
      payload: payload,
      entry_hash: entry_hash,
      prev_hash: prev_hash,
      created_at: now
    }
    |> Prismatic.Repo.insert()
  end

  @spec verify_chain(pos_integer(), pos_integer()) :: {:ok, :valid} | {:error, {:broken_at, integer()}}
  def verify_chain(from_sequence, to_sequence) do
    entries =
      __MODULE__
      |> where([e], e.sequence >= ^from_sequence and e.sequence <= ^to_sequence)
      |> order_by([e], asc: e.sequence)
      |> Prismatic.Repo.all()

    verify_entries(entries)
  end

  defp verify_entries([]), do: {:ok, :valid}
  defp verify_entries([_single]), do: {:ok, :valid}

  defp verify_entries([prev | [current | rest]]) do
    if current.prev_hash == prev.entry_hash do
      verify_entries([current | rest])
    else
      {:error, {:broken_at, current.sequence}}
    end
  end

  defp get_latest_hash do
    __MODULE__
    |> order_by([e], desc: e.sequence)
    |> limit(1)
    |> select([e], e.entry_hash)
    |> Prismatic.Repo.one()
  end
end
```

The platform logs all OSINT tool executions (who ran what tool, with what parameters, when), all agent orchestration decisions, all DD pipeline operations, and all authentication events. The immutable log supports NIS2 compliance by providing a complete, tamper-evident record of all security-relevant activities.

## Cross-References

- [Event Log](@/glossary/event-log.md) -- Event-focused append-only storage
- [Event](@/glossary/event.md) -- Individual log entries
- [Incident Reporting](@/glossary/incident-reporting.md) -- NIS2 reporting from log data
- [HMAC Signature](@/glossary/hmac-signature.md) -- Cryptographic integrity for log entries
- **Livebooks**: `security_compliance/` notebooks include log verification tools
- **Academy**: ComplianceAutomationFramework topic covers audit logging

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
