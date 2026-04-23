+++
title = "IR/PVM: Triple-Verified Investigation Reports"
date = 2026-03-26
description = "How Prismatic generates investigation reports with triple-source verification, evidence chains, structured templates, and confidence scoring."

[extra]
author = "Tomas Korcak (korczis)"
category = "product"
tags = ["investigation", "ir-pvm", "verification", "evidence-chain", "reports"]
reading_time = "10 min"
keywords = ["investigation report system", "triple verification", "evidence chains", "source validation", "structured reports", "intelligence reports"]
image = "/images/blog/investigation-report-system.png"
word_count = 1350
date_created = "2026-03-26"
date_modified = "2026-03-26"
quality_score = 86
see_also = ["capabilities", "osint"]
image_alt = "Investigation Report System - Prismatic Platform"
+++

An investigation is only as good as its documentation. Raw OSINT findings, scraped registry data, and analyst notes have limited value until they are structured into a report that a decision-maker can act on. Prismatic's IR/PVM (Investigation Report / Prismatic Verification Model) system transforms raw intelligence into structured, triple-verified reports with complete evidence chains.

## The Verification Problem

In intelligence work, single-source claims are dangerous. A business registry might list an address that no longer exists. A sanctions database might contain a false positive. A news article might report unverified allegations. The classic intelligence standard requires corroboration: a claim should be verified by at least three independent sources before being treated as established fact.

IR/PVM enforces this standard architecturally. Every claim in a report is tagged with its supporting sources, and the system calculates verification status automatically.

## Report Structure

An IR/PVM report follows a standardized schema:

```elixir
defmodule PrismaticIrPvm.Report do
  @moduledoc """
  Investigation report with triple-verification model.
  Each claim carries source attribution and verification status.
  """

  use Ecto.Schema

  @type verification_status :: :verified | :partially_verified | :unverified | :contradicted

  schema "investigation_reports" do
    field :title, :string
    field :report_type, Ecto.Enum, values: [:legal, :comprehensive, :profile, :email, :financial]
    field :status, Ecto.Enum, values: [:draft, :in_progress, :review, :published]
    field :subject, :string
    field :executive_summary, :string
    field :overall_confidence, :float
    field :methodology_notes, :string

    has_many :sections, PrismaticIrPvm.Section
    has_many :claims, through: [:sections, :claims]
    has_many :sources, PrismaticIrPvm.Source

    timestamps()
  end
end
```

### Claims and Sources

The core of the verification model is the many-to-many relationship between claims and sources:

```elixir
defmodule PrismaticIrPvm.Claim do
  @moduledoc """
  An individual claim within an investigation report.
  Claims carry verification metadata and source attribution.
  """

  use Ecto.Schema

  schema "investigation_claims" do
    field :statement, :string
    field :category, Ecto.Enum,
      values: [:identity, :financial, :legal, :relationship, :address, :activity]
    field :confidence, :float
    field :verification_status, Ecto.Enum,
      values: [:verified, :partially_verified, :unverified, :contradicted]

    belongs_to :section, PrismaticIrPvm.Section
    many_to_many :sources, PrismaticIrPvm.Source, join_through: "claim_sources"

    timestamps()
  end
end

defmodule PrismaticIrPvm.Source do
  @moduledoc """
  An evidence source supporting one or more claims.
  """

  use Ecto.Schema

  schema "investigation_sources" do
    field :name, :string
    field :source_type, Ecto.Enum,
      values: [:registry, :database, :osint, :document, :interview, :public_record]
    field :url, :string
    field :accessed_at, :utc_datetime
    field :reliability_rating, Ecto.Enum,
      values: [:a_reliable, :b_usually_reliable, :c_fairly_reliable,
               :d_not_usually_reliable, :e_unreliable, :f_cannot_judge]
    field :raw_data, :map

    many_to_many :claims, PrismaticIrPvm.Claim, join_through: "claim_sources"

    timestamps()
  end
end
```

The source reliability rating follows the NATO Admiralty System (A through F for source reliability, 1 through 6 for information confidence). This standardized rating system is widely understood in the intelligence community and provides a consistent framework for assessing source quality.

## Triple Verification Engine

The verification engine automatically computes the verification status of each claim based on its supporting sources:

```elixir
defmodule PrismaticIrPvm.Verification do
  @moduledoc """
  Automatic verification status computation based on
  source count, independence, and reliability.
  """

  @spec compute_status(PrismaticIrPvm.Claim.t()) :: verification_status()
  def compute_status(claim) do
    sources = claim.sources
    independent_sources = count_independent_sources(sources)
    contradicting = Enum.filter(sources, & &1.contradicts_claim)

    cond do
      contradicting != [] ->
        :contradicted

      independent_sources >= 3 ->
        :verified

      independent_sources >= 1 ->
        :partially_verified

      true ->
        :unverified
    end
  end

  defp count_independent_sources(sources) do
    sources
    |> Enum.group_by(&source_category/1)
    |> Map.keys()
    |> length()
  end

  defp source_category(source) do
    case source.source_type do
      type when type in [:registry, :public_record] -> :official
      :database -> :database
      :osint -> :osint
      :document -> :document
      :interview -> :human
    end
  end
end
```

The key insight is that three sources from the same database are not truly independent. The `count_independent_sources/1` function groups sources by category. A claim verified by an official registry, an OSINT tool, and a document analysis counts as triple-verified. Three hits from different OSINT tools searching the same underlying database count as single-source.

## Report Templates

IR/PVM includes structured templates for common investigation types:

### Legal Investigation

Sections: Subject identification, corporate structure, ownership chain, legal proceedings, regulatory compliance, sanctions screening, adverse media.

### Financial Investigation

Sections: Revenue analysis, asset identification, liability assessment, transaction patterns, related-party transactions, tax compliance.

### Comprehensive Profile

Sections: Personal identification, professional history, corporate affiliations, public records, digital footprint, network analysis.

Each template defines the required sections and the minimum verification standard for each:

```elixir
defmodule PrismaticIrPvm.Template do
  @moduledoc """
  Investigation report templates with section requirements
  and minimum verification standards.
  """

  @spec sections_for(:legal) :: list(map())
  def sections_for(:legal) do
    [
      %{name: "Subject Identification", required: true, min_verification: :verified},
      %{name: "Corporate Structure", required: true, min_verification: :partially_verified},
      %{name: "Ownership Chain", required: true, min_verification: :verified},
      %{name: "Legal Proceedings", required: true, min_verification: :partially_verified},
      %{name: "Sanctions Screening", required: true, min_verification: :verified},
      %{name: "Adverse Media", required: false, min_verification: :unverified}
    ]
  end
end
```

## Evidence Chains

Every claim traces back to its raw evidence through an evidence chain. The chain records each transformation the data underwent:

```elixir
defmodule PrismaticIrPvm.EvidenceChain do
  @moduledoc """
  Traceable evidence chain from raw source data to report claim.
  """

  @spec build_chain(PrismaticIrPvm.Claim.t()) :: list(map())
  def build_chain(claim) do
    claim.sources
    |> Enum.map(fn source ->
      %{
        source_name: source.name,
        source_type: source.source_type,
        accessed_at: source.accessed_at,
        reliability: source.reliability_rating,
        raw_data_hash: hash_raw_data(source.raw_data),
        transformations: trace_transformations(source, claim)
      }
    end)
  end

  defp trace_transformations(source, claim) do
    [
      %{step: "ingestion", description: "Raw data captured from #{source.name}"},
      %{step: "extraction", description: "Relevant fields extracted from response"},
      %{step: "normalization", description: "Data normalized to standard schema"},
      %{step: "claim_formation", description: "Claim '#{claim.statement}' formed from evidence"}
    ]
  end
end
```

The raw data hash ensures that evidence integrity can be verified after the fact. If the source data changes (a registry updates its records), the hash mismatch indicates that the evidence chain may need re-validation.

## Report Generation

Reports can be generated automatically from OSINT pipeline results or composed manually by analysts. The automatic generation workflow:

1. **Trigger**: An OSINT investigation completes, producing a set of findings.
2. **Claim extraction**: Findings are converted to claims with source attribution.
3. **Verification**: The verification engine computes status for each claim.
4. **Template application**: Claims are organized into the appropriate template structure.
5. **Confidence scoring**: Overall report confidence is computed as a weighted average of claim confidences.
6. **Review queue**: Reports enter a human review queue before publication.

```elixir
defmodule PrismaticIrPvm.Generator do
  @moduledoc """
  Automatic report generation from OSINT pipeline results.
  """

  @spec generate(list(map()), atom()) :: {:ok, PrismaticIrPvm.Report.t()}
  def generate(findings, report_type) do
    claims = Enum.flat_map(findings, &extract_claims/1)
    verified_claims = Enum.map(claims, &Verification.enrich/1)
    sections = Template.sections_for(report_type)
    organized = organize_into_sections(verified_claims, sections)

    report = %{
      report_type: report_type,
      status: :review,
      sections: organized,
      overall_confidence: compute_overall_confidence(verified_claims),
      methodology_notes: generate_methodology(findings)
    }

    PrismaticIrPvm.Repo.insert(report)
  end
end
```

## Dashboard

The IR/PVM dashboard at `/investigations` provides investigation management with filtering by type, status, and verification level. Each report displays visual indicators for verification status: green checkmarks for verified claims, yellow warnings for partially verified, and red alerts for contradicted claims.

The dashboard also surfaces aggregate statistics: verification rate across all active reports, average source count per claim, and distribution of claim categories. These metrics help investigation teams identify where additional sourcing effort is needed.

IR/PVM represents the output layer of Prismatic's intelligence cycle. Where OSINT tools gather raw data and the Decision Engine scores and prioritizes findings, IR/PVM structures the results into actionable, verifiable, and defensible investigation reports.
