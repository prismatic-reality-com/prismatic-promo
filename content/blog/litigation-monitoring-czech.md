+++
title = "Czech Litigation Monitoring: Courts, Insolvency, and Enforcement"
date = 2026-03-10
description = "Automated monitoring of Czech court proceedings, ISIR insolvency registry, enforcement tracking, and litigation outcome prediction"

[extra]
author = "Tomas Korcak (korczis)"
category = "product"
tags = ["litigation", "czech-courts", "insolvency", "isir", "enforcement", "monitoring"]
reading_time = "10 min"
keywords = ["czech litigation", "ISIR insolvency", "court monitoring", "enforcement tracking", "justice.cz"]
image = "/images/blog/litigation-monitoring-czech.png"
word_count = 1200
date_created = "2026-03-10"
date_modified = "2026-03-10"
quality_score = 85
see_also = ["architecture", "developers"]
image_alt = "Czech Litigation Monitoring - Prismatic Platform"
+++

Litigation history and active court proceedings are essential signals in due diligence. A company involved in significant litigation faces potential financial exposure, operational disruption, and reputational risk. In the Czech Republic, court data is distributed across multiple systems, each with its own access patterns and data structures. Prismatic integrates these systems into a unified litigation monitoring capability.

## Czech Court System Data Sources

Three primary systems provide litigation data for Czech entities:

**Justice.cz** hosts the public court portal with access to proceedings across district, regional, and high courts. Data includes case numbers, parties, case type, filing dates, and published decisions. Access is public but requires structured querying.

**ISIR (Insolvencni rejstrik)** is the dedicated insolvency register, providing real-time data on insolvency petitions, proceedings, court decisions, creditor claims, and resolution plans. ISIR offers a SOAP API for automated access, making it the most machine-friendly Czech court data source.

**CEDR and the Execution Registry** track enforcement proceedings (exekuce), providing visibility into whether a company has unresolved debts being actively collected through court-ordered enforcement.

## ISIR Integration

The ISIR adapter is Prismatic's most mature Czech court integration, leveraging the registry's structured SOAP API:

```elixir
defmodule Prismatic.DD.Sources.ISIR do
  @moduledoc """
  Czech Insolvency Registry (ISIR) adapter.
  Queries insolvency proceedings by ICO or name.
  """

  @behaviour Prismatic.DD.Source

  @isir_endpoint "https://isir.justice.cz/isir/ws/IsirWsService"

  @impl true
  def fetch(%{ico: ico}, opts) when is_binary(ico) do
    timeout = Keyword.get(opts, :timeout, 15_000)

    soap_body = build_query_by_ico(ico)

    case send_soap_request(soap_body, timeout) do
      {:ok, response} ->
        proceedings = parse_insolvency_proceedings(response)

        {:ok, %{
          data: %{
            proceedings: proceedings,
            active_count: Enum.count(proceedings, & &1.is_active),
            total_count: length(proceedings),
            queried_at: DateTime.utc_now()
          },
          confidence: 0.95,
          source: :isir
        }}

      {:error, reason} ->
        {:error, {:isir_query_failed, reason}}
    end
  end

  @impl true
  def source_group, do: :court

  @impl true
  def rate_limit, do: {5, 60_000}

  @impl true
  def priority, do: 1

  defp parse_insolvency_proceedings(response) do
    response
    |> SweetXml.xpath(~x"//insolvencniRizeni"l)
    |> Enum.map(fn node ->
      %{
        case_number: SweetXml.xpath(node, ~x"./spisovaZnacka/text()"s),
        court: SweetXml.xpath(node, ~x"./soud/text()"s),
        filing_date: parse_date(SweetXml.xpath(node, ~x"./datumZalozeni/text()"s)),
        status: map_status(SweetXml.xpath(node, ~x"./stav/text()"s)),
        is_active: SweetXml.xpath(node, ~x"./stav/text()"s) not in ["KONC", "ZRUS"],
        debtor_role: SweetXml.xpath(node, ~x"./roleSubjektu/text()"s),
        proceedings_type: map_proceedings_type(
          SweetXml.xpath(node, ~x"./druhRizeni/text()"s)
        )
      }
    end)
  end

  defp map_status("NEVYR"), do: :pending
  defp map_status("MORAT"), do: :moratorium
  defp map_status("UPAD"), do: :bankruptcy_declared
  defp map_status("ODDL"), do: :debt_relief
  defp map_status("REOR"), do: :reorganization
  defp map_status("KONK"), do: :liquidation
  defp map_status("KONC"), do: :concluded
  defp map_status("ZRUS"), do: :cancelled
  defp map_status(other), do: {:unknown, other}
end
```

## Litigation Event Processing

Raw court data requires processing to be useful for risk assessment. Prismatic normalizes litigation events into a standard structure and computes aggregate metrics:

```elixir
defmodule Prismatic.DD.Litigation.Processor do
  @moduledoc """
  Litigation event normalization and aggregate risk computation.
  """

  @type litigation_summary :: %{
    total_cases: non_neg_integer(),
    active_cases: non_neg_integer(),
    as_plaintiff: non_neg_integer(),
    as_defendant: non_neg_integer(),
    total_exposure_czk: Decimal.t() | nil,
    insolvency_history: boolean(),
    active_enforcement: boolean(),
    severity_distribution: %{atom() => non_neg_integer()}
  }

  @spec summarize(entity_id :: binary(), [map()]) :: litigation_summary()
  def summarize(entity_id, raw_events) do
    events = Enum.map(raw_events, &normalize_event/1)

    %{
      total_cases: length(events),
      active_cases: Enum.count(events, & &1.is_active),
      as_plaintiff: Enum.count(events, &(&1.entity_role == :plaintiff)),
      as_defendant: Enum.count(events, &(&1.entity_role == :defendant)),
      total_exposure_czk: compute_total_exposure(events),
      insolvency_history: Enum.any?(events, &(&1.case_type == :insolvency)),
      active_enforcement: Enum.any?(events, fn e ->
        e.case_type == :enforcement and e.is_active
      end),
      severity_distribution: compute_severity_distribution(events),
      timeline: build_timeline(events)
    }
  end

  defp compute_total_exposure(events) do
    events
    |> Enum.filter(fn e -> e.is_active and e.entity_role == :defendant end)
    |> Enum.map(& &1.claimed_amount)
    |> Enum.reject(&is_nil/1)
    |> case do
      [] -> nil
      amounts -> Enum.reduce(amounts, Decimal.new(0), &Decimal.add/2)
    end
  end

  defp compute_severity_distribution(events) do
    events
    |> Enum.map(&classify_severity/1)
    |> Enum.frequencies()
  end

  defp classify_severity(%{case_type: :insolvency, is_active: true}), do: :critical
  defp classify_severity(%{case_type: :enforcement, is_active: true}), do: :high
  defp classify_severity(%{claimed_amount: amt}) when not is_nil(amt) do
    if Decimal.compare(amt, Decimal.new("10_000_000")) == :gt, do: :high, else: :medium
  end
  defp classify_severity(_event), do: :low
end
```

## Continuous Monitoring

For entities under ongoing surveillance, Prismatic implements a polling-based monitoring system that checks for new court events at configurable intervals:

```elixir
defmodule Prismatic.DD.Litigation.Monitor do
  @moduledoc """
  Continuous litigation monitoring with change detection.
  """

  use GenServer
  require Logger

  @default_interval :timer.hours(6)

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(opts) do
    interval = Keyword.get(opts, :interval, @default_interval)
    schedule_check(interval)
    {:ok, %{interval: interval, watched_entities: MapSet.new()}}
  end

  @impl true
  def handle_info(:check_updates, state) do
    state.watched_entities
    |> Enum.each(fn entity_id ->
      check_entity_updates(entity_id)
    end)

    schedule_check(state.interval)
    {:noreply, state}
  end

  defp check_entity_updates(entity_id) do
    entity = Prismatic.DD.Entities.get!(entity_id)
    last_check = entity.litigation_last_checked

    case fetch_new_events(entity, last_check) do
      {:ok, []} ->
        :ok

      {:ok, new_events} ->
        Logger.info("Found #{length(new_events)} new litigation events for #{entity_id}")

        Phoenix.PubSub.broadcast(
          Prismatic.PubSub,
          "dd:litigation:#{entity_id}",
          {:new_litigation_events, entity_id, new_events}
        )

        Prismatic.DD.Entities.update_litigation_check(entity_id, DateTime.utc_now())

      {:error, reason} ->
        Logger.warning("Litigation check failed for #{entity_id}: #{inspect(reason)}")
    end
  end

  defp schedule_check(interval) do
    Process.send_after(self(), :check_updates, interval)
  end
end
```

## Outcome Analysis

Historical case outcomes provide context for assessing active cases. Prismatic tracks case dispositions and computes aggregate statistics per case type and court. For insolvency proceedings, the resolution rate, average duration, and creditor recovery percentages are all tracked. This data informs the risk scoring engine, allowing it to weight active cases not just by claimed amount but by the probability of an adverse outcome given historical patterns.

The litigation dimension contributes to the overall entity risk score with a default weight of 10%. However, for entities with active insolvency proceedings or enforcement actions, the scoring engine can escalate the litigation dimension dynamically, reflecting the outsized importance of these findings.

## Integration Notes

All court data in the Czech Republic is public information, and automated access is permissible for legitimate purposes. However, rate limits must be respected. ISIR's API is reasonably reliable but has occasional downtime. Justice.cz is less structured and requires more robust error handling. The enforcement registry has the most limited programmatic access.

Prismatic handles source unavailability gracefully: if a court data source is down during a DD pipeline run, the investigation proceeds with available data and flags the missing source in the results. The analyst can trigger a targeted re-check once the source recovers.
