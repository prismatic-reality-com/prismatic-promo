+++
title = "Provenance"
weight = 50
[extra]
description = "Traceable origin chain for data and beliefs satisfying NABLA axiom requirements and regulatory audit trails"
category = "epistemic"
related_terms = ["pep", "pii", "sanctions", "quality-floor", "semantic-link"]
complexity_level = "advanced"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-24"
keywords = ["provenance", "data lineage", "origin tracing", "NABLA", "audit trail", "glossary", "Prismatic Platform"]
tags = ["glossary", "epistemic", "compliance", "nabla"]
quality_score = 79
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Provenance - Prismatic Platform"
+++

## Definition & Overview

Provenance is the documented chain of origin, transformation, and custody for data, beliefs, or artifacts within a system. In the context of intelligence platforms, provenance answers three fundamental questions: Where did this data come from? How was it transformed? Who has accessed or modified it? Complete provenance tracking enables audit compliance, reproducibility, trust assessment, and the ability to invalidate downstream conclusions when upstream sources are found to be unreliable.

The concept extends beyond simple data lineage into the epistemic domain. The Prismatic Platform's NABLA Infinity framework mandates provenance as one of its seven non-negotiable axioms: "All beliefs must be traceable." This means that every claim, score, assessment, or recommendation produced by the platform must carry a provenance chain linking it back to its source data, the transformations applied, the algorithms used, and the confidence level at each stage.

Provenance tracking operates at multiple granularities in the Prismatic Platform: record-level provenance for individual OSINT findings and DD entities, field-level provenance for security ratings (which specific scanner produced which score component), and system-level provenance for platform configuration changes. The provenance infrastructure supports both forward tracing (from source to derived products) and backward tracing (from a conclusion back to its evidentiary basis).

## Technical Deep Dive

The platform implements provenance as an immutable chain of provenance records. Each record captures the actor, action, timestamp, input references, and output references. Records are append-only and cryptographically linked via content hashes, preventing retroactive modification of the provenance chain.

```elixir
defmodule PrismaticCompliance.Provenance do
  @moduledoc """
  Immutable provenance chain for data origin tracing.
  Supports forward and backward traversal with cryptographic
  integrity verification.
  """

  @type provenance_record :: %{
    id: binary(),
    parent_id: binary() | nil,
    actor: String.t(),
    action: atom(),
    timestamp: DateTime.t(),
    inputs: [binary()],
    outputs: [binary()],
    metadata: map(),
    content_hash: binary()
  }

  @spec record(atom(), map()) :: {:ok, provenance_record()}
  def record(action, attrs) do
    record = %{
      id: generate_id(),
      parent_id: attrs[:parent_id],
      actor: attrs[:actor] || "system",
      action: action,
      timestamp: DateTime.utc_now(),
      inputs: attrs[:inputs] || [],
      outputs: attrs[:outputs] || [],
      metadata: attrs[:metadata] || %{}
    }

    record = Map.put(record, :content_hash, compute_hash(record))

    {:ok, _} = persist(record)
    {:ok, record}
  end

  @spec trace_backward(binary()) :: {:ok, [provenance_record()]}
  def trace_backward(entity_id) do
    chain = do_trace_backward(entity_id, [])
    {:ok, Enum.reverse(chain)}
  end

  @spec trace_forward(binary()) :: {:ok, [provenance_record()]}
  def trace_forward(entity_id) do
    chain = do_trace_forward(entity_id, [])
    {:ok, chain}
  end

  @spec verify_integrity([provenance_record()]) :: :ok | {:error, :integrity_violation}
  def verify_integrity(chain) do
    valid =
      Enum.all?(chain, fn record ->
        expected_hash = compute_hash(Map.delete(record, :content_hash))
        record.content_hash == expected_hash
      end)

    if valid, do: :ok, else: {:error, :integrity_violation}
  end

  defp do_trace_backward(entity_id, acc) do
    records = find_records_with_output(entity_id)

    case records do
      [] ->
        acc

      records ->
        new_acc = records ++ acc

        records
        |> Enum.flat_map(& &1.inputs)
        |> Enum.uniq()
        |> Enum.reduce(new_acc, fn input_id, chain ->
          do_trace_backward(input_id, chain)
        end)
    end
  end

  defp do_trace_forward(entity_id, acc) do
    records = find_records_with_input(entity_id)

    case records do
      [] ->
        acc

      records ->
        new_acc = acc ++ records

        records
        |> Enum.flat_map(& &1.outputs)
        |> Enum.uniq()
        |> Enum.reduce(new_acc, fn output_id, chain ->
          do_trace_forward(output_id, chain)
        end)
    end
  end

  defp compute_hash(record) do
    record
    |> :erlang.term_to_binary()
    |> then(&:crypto.hash(:sha256, &1))
    |> Base.encode16(case: :lower)
  end

  defp generate_id, do: Ecto.UUID.generate()

  defp persist(record) do
    # Append to immutable provenance store
    {:ok, record}
  end

  defp find_records_with_output(entity_id) do
    # Query provenance records where entity_id is in outputs
    []
  end

  defp find_records_with_input(entity_id) do
    # Query provenance records where entity_id is in inputs
    []
  end
end
```

The NABLA axiom enforcement layer validates that every belief or claim produced by the platform has a complete provenance chain. Claims without provenance are blocked by the Trinity Gate.

```elixir
defmodule PrismaticNabla.ProvenanceValidator do
  @moduledoc """
  Validates that beliefs and claims satisfy the NABLA
  provenance axiom: all beliefs must be traceable to sources.
  """

  @spec validate(map()) :: :ok | {:error, :provenance_missing}
  def validate(%{provenance: provenance}) when is_list(provenance) and length(provenance) > 0 do
    case PrismaticCompliance.Provenance.verify_integrity(provenance) do
      :ok -> :ok
      {:error, _} -> {:error, :provenance_integrity_failed}
    end
  end

  def validate(%{provenance_id: id}) when is_binary(id) do
    case PrismaticCompliance.Provenance.trace_backward(id) do
      {:ok, [_ | _]} -> :ok
      {:ok, []} -> {:error, :provenance_missing}
    end
  end

  def validate(_), do: {:error, :provenance_missing}
end
```

## Architecture & Implementation

Provenance records are stored in a dedicated PostgreSQL table with JSONB columns for flexible metadata and GIN indexes for efficient input/output lookups. The append-only nature of provenance data makes it suitable for time-partitioned tables, where older provenance records are moved to cold storage while recent records remain in hot partitions.

The architecture separates provenance collection (recording what happened) from provenance analysis (querying the chain). Collection is synchronous and lightweight -- each provenance record creation adds minimal latency to the operation being tracked. Analysis is asynchronous and can traverse deep chains without blocking the operation that triggered the query.

Integration with the DD pipeline adds provenance records at each stage: source fetch, entity extraction, normalization, enrichment, and persistence. This creates a complete chain from the original data source through to the final entity record, enabling full backward tracing for any DD entity.

## Usage in Prismatic Platform

Provenance tracking is automatic for OSINT tool results, DD pipeline outputs, and security assessments. The provenance chain is accessible through the platform's audit interface and can be exported for regulatory compliance reporting.

```elixir
defmodule PrismaticOsint.ProvenanceIntegration do
  @moduledoc """
  Automatic provenance recording for OSINT tool executions.
  Creates provenance records linking tool inputs to outputs.
  """

  @spec record_execution(String.t(), map(), map()) :: {:ok, binary()}
  def record_execution(tool_slug, input_params, results) do
    {:ok, record} =
      PrismaticCompliance.Provenance.record(:osint_execution, %{
        actor: "osint:#{tool_slug}",
        inputs: [hash_params(input_params)],
        outputs: Enum.map(results, &hash_result/1),
        metadata: %{
          tool_slug: tool_slug,
          input_summary: summarize_params(input_params),
          result_count: length(Map.get(results, :items, [])),
          executed_at: DateTime.utc_now()
        }
      })

    {:ok, record.id}
  end

  defp hash_params(params), do: :crypto.hash(:sha256, :erlang.term_to_binary(params)) |> Base.encode16(case: :lower)
  defp hash_result(result), do: :crypto.hash(:sha256, :erlang.term_to_binary(result)) |> Base.encode16(case: :lower)
  defp summarize_params(params), do: Map.take(params, [:query, :category, :tool_slug])
end
```

## Cross-References

- [PEP](@/glossary/pep.md) - PEP screening results requiring provenance for regulatory compliance
- [PII](@/glossary/pii.md) - Personal data requiring provenance for GDPR data lineage
- **Sanctions** - Sanctions screening with mandatory provenance trails
- [Quality Floor](@/glossary/quality-floor.md) - Quality standards verified through provenance completeness
- **Semantic Link** - Knowledge graph connections with provenance metadata

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
