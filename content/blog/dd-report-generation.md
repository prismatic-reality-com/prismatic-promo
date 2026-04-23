+++
title = "Automated DD Report Generation with Evidence Linking"
date = 2026-03-14
description = "How Prismatic generates comprehensive DD reports with HTML rendering, evidence linking, confidence annotations, multi-language support, and export formats"

[extra]
author = "Tomas Korcak (korczis)"
category = "product"
tags = ["dd-reports", "report-generation", "evidence-linking", "automation", "export"]
reading_time = "10 min"
keywords = ["dd report generation", "evidence linking", "confidence annotations", "multi-language", "export formats"]
image = "/images/blog/dd-report-generation.png"
word_count = 1200
date_created = "2026-03-14"
date_modified = "2026-03-14"
quality_score = 86
see_also = ["due-diligence", "report", "evidence", "provenance", "audit-trail"]
image_alt = "DD Report Generation - Prismatic Platform"
+++

The output of a due diligence investigation is a report. No matter how sophisticated the data collection and analysis pipeline, the final deliverable must be a clear, well-structured document that communicates findings to decision-makers. Prismatic's report generation system transforms structured investigation data into professional DD reports with full evidence traceability.

## Report Architecture

DD reports in Prismatic are generated through a template-driven pipeline that separates content generation from presentation:

```elixir
defmodule Prismatic.DD.Report.Generator do
  @moduledoc """
  DD report generation pipeline.
  Transforms investigation results into structured reports.
  """

  @type report_config :: %{
    format: :html | :pdf | :docx,
    language: :en | :cs | :de,
    sections: [atom()],
    include_evidence: boolean(),
    confidence_threshold: float(),
    template: binary()
  }

  @default_sections [
    :executive_summary,
    :entity_overview,
    :ownership_analysis,
    :financial_analysis,
    :litigation_review,
    :sanctions_screening,
    :risk_assessment,
    :appendices
  ]

  @spec generate(case_id :: binary(), report_config()) :: {:ok, binary()} | {:error, term()}
  def generate(case_id, config \\ %{}) do
    config = Map.merge(default_config(), config)

    with {:ok, case_data} <- load_case_data(case_id),
         {:ok, sections} <- build_sections(case_data, config),
         {:ok, rendered} <- render_report(sections, config) do
      {:ok, rendered}
    end
  end

  defp build_sections(case_data, config) do
    sections =
      config.sections
      |> Enum.map(fn section_type ->
        builder = section_builder(section_type)
        builder.build(case_data, config)
      end)
      |> Enum.reject(fn
        {:ok, %{content: ""}} -> true
        {:error, _} -> true
        _ -> false
      end)
      |> Enum.map(fn {:ok, section} -> section end)

    {:ok, sections}
  end

  defp section_builder(:executive_summary), do: Prismatic.DD.Report.Sections.ExecutiveSummary
  defp section_builder(:entity_overview), do: Prismatic.DD.Report.Sections.EntityOverview
  defp section_builder(:ownership_analysis), do: Prismatic.DD.Report.Sections.OwnershipAnalysis
  defp section_builder(:financial_analysis), do: Prismatic.DD.Report.Sections.FinancialAnalysis
  defp section_builder(:litigation_review), do: Prismatic.DD.Report.Sections.LitigationReview
  defp section_builder(:sanctions_screening), do: Prismatic.DD.Report.Sections.SanctionsScreening
  defp section_builder(:risk_assessment), do: Prismatic.DD.Report.Sections.RiskAssessment
  defp section_builder(:appendices), do: Prismatic.DD.Report.Sections.Appendices
end
```

Each section builder module knows how to transform raw investigation data into structured report content. This modular design allows sections to be added, removed, or reordered without affecting other parts of the report.

## Evidence Linking

Every claim in a DD report must be traceable to its source. Prismatic implements this through an evidence linking system that attaches source references to individual findings:

```elixir
defmodule Prismatic.DD.Report.Evidence do
  @moduledoc """
  Evidence linking for DD report findings.
  Every finding carries references to source data.
  """

  @type evidence_ref :: %{
    source: atom(),
    source_name: String.t(),
    accessed_at: DateTime.t(),
    url: String.t() | nil,
    document_id: binary() | nil,
    excerpt: String.t() | nil,
    confidence: float()
  }

  @type finding :: %{
    statement: String.t(),
    severity: :info | :low | :medium | :high | :critical,
    evidence: [evidence_ref()],
    confidence: float(),
    section: atom()
  }

  @spec create_finding(String.t(), atom(), [evidence_ref()]) :: finding()
  def create_finding(statement, severity, evidence_refs) do
    aggregate_confidence =
      evidence_refs
      |> Enum.map(& &1.confidence)
      |> then(fn
        [] -> 0.0
        confidences -> Enum.sum(confidences) / length(confidences)
      end)

    %{
      statement: statement,
      severity: severity,
      evidence: evidence_refs,
      confidence: Float.round(aggregate_confidence, 3),
      section: nil
    }
  end
end
```

In the rendered report, evidence links appear as superscript reference numbers that link to the appendix where full source details are listed. This pattern is familiar to DD practitioners and enables quick source verification.

## Confidence Annotations

Not all findings carry equal certainty. Prismatic annotates each finding with a confidence level derived from the underlying data quality:

```elixir
defmodule Prismatic.DD.Report.Sections.ExecutiveSummary do
  @moduledoc """
  Executive summary section builder with confidence-aware content.
  """

  @spec build(map(), map()) :: {:ok, map()}
  def build(case_data, config) do
    risk_score = case_data.scoring.composite_score
    risk_level = case_data.scoring.risk_level
    confidence = case_data.scoring.confidence

    summary_text = build_summary_text(case_data, config.language)

    key_findings =
      case_data.findings
      |> Enum.filter(fn f -> f.confidence >= config.confidence_threshold end)
      |> Enum.sort_by(& &1.severity, :desc)
      |> Enum.take(10)

    low_confidence_note =
      if confidence < 0.5 do
        disclaimer_text(config.language)
      else
        nil
      end

    {:ok, %{
      type: :executive_summary,
      content: summary_text,
      risk_score: risk_score,
      risk_level: risk_level,
      confidence: confidence,
      key_findings: key_findings,
      low_confidence_disclaimer: low_confidence_note,
      data_coverage: compute_data_coverage(case_data)
    }}
  end
end
```

Findings below the configured confidence threshold are either excluded or moved to an "uncertain findings" appendix, depending on report configuration. This prevents low-quality data from appearing as established fact in the main report body.

## Multi-Language Support

DD reports in Central European M&A contexts often need to be delivered in multiple languages. Prismatic supports report generation in English, Czech, and German through a localization layer:

```elixir
defmodule Prismatic.DD.Report.I18n do
  @moduledoc """
  Report localization for multi-language DD report generation.
  """

  @translations %{
    en: %{
      executive_summary: "Executive Summary",
      entity_overview: "Entity Overview",
      ownership_analysis: "Ownership Structure Analysis",
      risk_level_critical: "Critical Risk",
      risk_level_high: "High Risk",
      confidence_low: "Note: This assessment is based on limited data. Additional verification is recommended."
    },
    cs: %{
      executive_summary: "Shrnutí",
      entity_overview: "Přehled subjektu",
      ownership_analysis: "Analýza vlastnické struktury",
      risk_level_critical: "Kritické riziko",
      risk_level_high: "Vysoké riziko",
      confidence_low: "Pozn.: Toto hodnocení je založeno na omezených datech. Doporučujeme další ověření."
    },
    de: %{
      executive_summary: "Zusammenfassung",
      entity_overview: "Unternehmensübersicht",
      ownership_analysis: "Analyse der Eigentümerstruktur",
      risk_level_critical: "Kritisches Risiko",
      risk_level_high: "Hohes Risiko",
      confidence_low: "Hinweis: Diese Bewertung basiert auf begrenzten Daten. Weitere Überprüfung wird empfohlen."
    }
  }

  @spec t(atom(), atom()) :: String.t()
  def t(key, language) do
    get_in(@translations, [language, key]) ||
      get_in(@translations, [:en, key]) ||
      to_string(key)
  end
end
```

## Export Formats

The report rendering pipeline supports multiple output formats. HTML is the primary format for interactive review within the platform, with collapsible sections, interactive ownership diagrams, and clickable evidence links. PDF export uses the HTML as an intermediate representation, rendered through a headless browser for precise layout control. DOCX export is available for clients who need editable documents.

```elixir
defmodule Prismatic.DD.Report.Renderer do
  @moduledoc """
  Multi-format report renderer.
  """

  @spec render(sections :: [map()], config :: map()) :: {:ok, binary()} | {:error, term()}
  def render(sections, %{format: :html} = config) do
    template = load_template(config.template || "default")
    assigns = %{sections: sections, config: config, i18n: &Prismatic.DD.Report.I18n.t(&1, config.language)}
    {:ok, EEx.eval_string(template, assigns: assigns)}
  end

  def render(sections, %{format: :pdf} = config) do
    with {:ok, html} <- render(sections, %{config | format: :html}) do
      convert_html_to_pdf(html)
    end
  end
end
```

All export formats maintain the evidence linking structure. In PDF and DOCX, evidence references become traditional footnotes. In HTML, they remain interactive hyperlinks.

## Practical Usage

In practice, report generation completes in 2 to 5 seconds for a standard investigation, depending on the number of findings and the complexity of ownership diagrams. Reports are cached at the case level and regenerated when new data arrives or when the analyst requests a refresh.

The combination of automated generation with evidence traceability addresses the two main pain points of traditional DD reporting: it eliminates the hours spent manually compiling findings into documents, and it ensures that every statement in the report can be independently verified against source data. For compliance purposes, this audit trail is invaluable.
