+++
title = "Financial Analysis Automation for Due Diligence"
date = 2026-03-08
description = "Automating financial due diligence: annual report parsing, ratio analysis, trend detection, peer comparison, and red flag identification"

[extra]
author = "Tomas Korcak (korczis)"
category = "product"
tags = ["financial-analysis", "due-diligence", "automation", "ratio-analysis", "red-flags"]
reading_time = "11 min"
keywords = ["financial dd", "ratio analysis", "trend detection", "peer comparison", "annual report parsing"]
image = "/images/blog/financial-analysis-automation.png"
word_count = 1250
date_created = "2026-03-08"
date_modified = "2026-03-08"
quality_score = 86
see_also = ["architecture", "developers"]
image_alt = "Financial Analysis Automation - Prismatic Platform"
+++

Financial due diligence remains one of the most time-consuming components of any M&A transaction. Analysts spend hours extracting figures from annual reports, computing ratios, identifying trends, and comparing against industry benchmarks. Prismatic automates the mechanical aspects of financial DD, freeing analysts to focus on interpretation and judgment.

## Annual Report Parsing

Czech companies file annual reports (ucetni zaverky) with the Commercial Register (Obchodni rejstrik), accessible through Justice.cz. These documents range from structured XML submissions to scanned PDFs. Prismatic handles both:

```elixir
defmodule Prismatic.DD.Financial.Parser do
  @moduledoc """
  Multi-format parser for Czech annual reports.
  Handles structured XML and extracted PDF data.
  """

  @type financial_data :: %{
    year: integer(),
    balance_sheet: balance_sheet(),
    income_statement: income_statement(),
    source_format: :xml | :pdf_extracted,
    confidence: float()
  }

  @spec parse(binary(), keyword()) :: {:ok, financial_data()} | {:error, term()}
  def parse(content, opts \\ []) do
    case detect_format(content) do
      :xml ->
        parse_xml(content, opts)

      :pdf_text ->
        parse_pdf_extracted(content, opts)

      :unknown ->
        {:error, :unsupported_format}
    end
  end

  defp parse_xml(content, _opts) do
    with {:ok, doc} <- SweetXml.parse(content),
         {:ok, balance_sheet} <- extract_balance_sheet_xml(doc),
         {:ok, income} <- extract_income_statement_xml(doc) do
      {:ok, %{
        balance_sheet: balance_sheet,
        income_statement: income,
        source_format: :xml,
        confidence: 0.98
      }}
    end
  end

  defp extract_balance_sheet_xml(doc) do
    {:ok, %{
      total_assets: xpath_decimal(doc, ~x"//Aktiva/AktivaCelkem/text()"),
      fixed_assets: xpath_decimal(doc, ~x"//Aktiva/StalaAktiva/text()"),
      current_assets: xpath_decimal(doc, ~x"//Aktiva/ObeznaAktiva/text()"),
      equity: xpath_decimal(doc, ~x"//Pasiva/VlastniKapital/text()"),
      total_liabilities: xpath_decimal(doc, ~x"//Pasiva/CiziZdroje/text()"),
      current_liabilities: xpath_decimal(doc, ~x"//Pasiva/CiziZdroje/KratDobeZavazky/text()"),
      long_term_liabilities: xpath_decimal(doc, ~x"//Pasiva/CiziZdroje/DlDobeZavazky/text()"),
      cash: xpath_decimal(doc, ~x"//Aktiva/ObeznaAktiva/KratFinMajetek/text()")
    }}
  end
end
```

For PDF-extracted data, confidence drops significantly. Prismatic flags these with lower confidence scores and marks specific line items that could not be reliably parsed, ensuring analysts know where human verification is needed.

## Ratio Analysis Engine

Once financial data is extracted, Prismatic computes a comprehensive set of ratios organized into four categories: liquidity, profitability, leverage, and efficiency.

```elixir
defmodule Prismatic.DD.Financial.Ratios do
  @moduledoc """
  Financial ratio computation engine.
  Returns structured ratio results with interpretation guidance.
  """

  @spec compute_all(map()) :: %{atom() => ratio_result()}
  def compute_all(financials) do
    %{
      # Liquidity
      current_ratio: compute_ratio(
        financials.balance_sheet.current_assets,
        financials.balance_sheet.current_liabilities,
        :current_ratio
      ),
      quick_ratio: compute_ratio(
        Decimal.sub(
          financials.balance_sheet.current_assets,
          Map.get(financials.balance_sheet, :inventories, Decimal.new(0))
        ),
        financials.balance_sheet.current_liabilities,
        :quick_ratio
      ),
      cash_ratio: compute_ratio(
        financials.balance_sheet.cash,
        financials.balance_sheet.current_liabilities,
        :cash_ratio
      ),

      # Profitability
      return_on_equity: compute_ratio(
        financials.income_statement.net_income,
        financials.balance_sheet.equity,
        :return_on_equity
      ),
      return_on_assets: compute_ratio(
        financials.income_statement.net_income,
        financials.balance_sheet.total_assets,
        :return_on_assets
      ),
      operating_margin: compute_ratio(
        financials.income_statement.operating_income,
        financials.income_statement.revenue,
        :operating_margin
      ),

      # Leverage
      debt_to_equity: compute_ratio(
        financials.balance_sheet.total_liabilities,
        financials.balance_sheet.equity,
        :debt_to_equity
      ),
      equity_ratio: compute_ratio(
        financials.balance_sheet.equity,
        financials.balance_sheet.total_assets,
        :equity_ratio
      )
    }
  end

  defp compute_ratio(numerator, denominator, type) do
    cond do
      is_nil(numerator) or is_nil(denominator) ->
        %{value: nil, status: :data_missing, type: type}

      Decimal.equal?(denominator, Decimal.new(0)) ->
        %{value: nil, status: :division_by_zero, type: type}

      true ->
        value = Decimal.div(numerator, denominator) |> Decimal.round(4)
        %{value: value, status: :computed, type: type, assessment: assess_ratio(type, value)}
    end
  end

  defp assess_ratio(:current_ratio, value) do
    cond do
      Decimal.compare(value, Decimal.new("2.0")) == :gt -> :strong
      Decimal.compare(value, Decimal.new("1.0")) == :gt -> :adequate
      Decimal.compare(value, Decimal.new("0.5")) == :gt -> :weak
      true -> :critical
    end
  end
end
```

## Trend Detection

A single year's financials tell a limited story. Trend analysis across multiple periods reveals the trajectory:

```elixir
defmodule Prismatic.DD.Financial.Trends do
  @moduledoc """
  Multi-year financial trend analysis with pattern detection.
  """

  @spec analyze_trends([map()]) :: trend_analysis()
  def analyze_trends(yearly_data) when length(yearly_data) >= 2 do
    sorted = Enum.sort_by(yearly_data, & &1.year)

    %{
      revenue_trend: compute_metric_trend(sorted, [:income_statement, :revenue]),
      margin_trend: compute_ratio_trend(sorted, :operating_margin),
      leverage_trend: compute_ratio_trend(sorted, :debt_to_equity),
      liquidity_trend: compute_ratio_trend(sorted, :current_ratio),
      cagr_revenue: compute_cagr(sorted, [:income_statement, :revenue]),
      red_flags: detect_trend_red_flags(sorted),
      years_analyzed: length(sorted),
      period: {hd(sorted).year, List.last(sorted).year}
    }
  end

  defp detect_trend_red_flags(yearly_data) do
    flags = []

    flags =
      if consecutive_decline?(yearly_data, [:income_statement, :revenue], 3),
        do: [%{type: :revenue_decline_3yr, severity: :high} | flags],
        else: flags

    flags =
      if margin_compression?(yearly_data),
        do: [%{type: :margin_compression, severity: :medium} | flags],
        else: flags

    flags =
      if equity_erosion?(yearly_data),
        do: [%{type: :equity_erosion, severity: :critical} | flags],
        else: flags

    flags =
      if working_capital_deterioration?(yearly_data),
        do: [%{type: :working_capital_deterioration, severity: :high} | flags],
        else: flags

    flags
  end

  defp consecutive_decline?(data, path, min_years) do
    values = Enum.map(data, fn d -> get_in(d, path) end) |> Enum.reject(&is_nil/1)

    values
    |> Enum.chunk_every(2, 1, :discard)
    |> Enum.map(fn [a, b] -> Decimal.compare(b, a) == :lt end)
    |> Enum.chunk_by(& &1)
    |> Enum.any?(fn chunk -> hd(chunk) == true and length(chunk) >= min_years - 1 end)
  end
end
```

## Red Flag Identification

Beyond ratio analysis, Prismatic scans for specific patterns that warrant attention:

Revenue concentration risk, where a single customer represents more than 30% of revenue. Related-party transactions, particularly loans to shareholders or above-market payments to affiliated entities. Deferred revenue spikes that may indicate aggressive revenue recognition. Unusual changes in accounting policies or auditor changes. And significant off-balance-sheet obligations such as operating leases or guarantees.

Each red flag is documented with the specific data that triggered it, the relevant financial periods, and the potential implications for the transaction. This evidence-linked approach allows analysts to quickly verify flags against source documents rather than starting from scratch.

## Peer Comparison

Financial ratios gain meaning through comparison. Prismatic maintains industry benchmarks derived from publicly available Czech company filings, grouped by NACE code:

```elixir
defmodule Prismatic.DD.Financial.Benchmarks do
  @moduledoc """
  Industry benchmark comparison for financial ratios.
  """

  @spec compare_to_peers(map(), binary()) :: peer_comparison()
  def compare_to_peers(entity_ratios, nace_code) do
    benchmarks = load_benchmarks(nace_code)

    Enum.map(entity_ratios, fn {ratio_name, ratio_result} ->
      peer_data = Map.get(benchmarks, ratio_name, %{})

      percentile =
        case {ratio_result.value, peer_data} do
          {nil, _} -> nil
          {_, %{distribution: dist}} -> compute_percentile(ratio_result.value, dist)
          _ -> nil
        end

      {ratio_name, Map.merge(ratio_result, %{
        peer_median: Map.get(peer_data, :median),
        peer_percentile: percentile,
        peer_sample_size: Map.get(peer_data, :sample_size, 0)
      })}
    end)
    |> Map.new()
  end
end
```

An entity with a current ratio of 1.5 might seem adequate in isolation, but if the industry median is 2.8, it signals relative weakness. Conversely, an entity significantly outperforming peers on profitability may warrant investigation into the sustainability of that outperformance.

## Integration with the DD Pipeline

Financial analysis integrates with the broader DD pipeline through the standard source adapter pattern. The financial analysis module receives parsed financial data from the Client layer and produces structured ratio analyses, trend reports, and red flag lists that feed into the entity's overall risk score.

The financial dimension contributes 15% of the composite risk score by default, but this weight increases for acquisition-focused investigations where financial health is paramount. All financial findings are traceable back to specific line items in specific annual reports, maintaining the evidence chain that compliance requires.

Automating financial DD does not replace financial analysts. It replaces the mechanical data extraction and computation that consumes their time, allowing them to focus on the interpretive work that requires human judgment: understanding the story behind the numbers.
