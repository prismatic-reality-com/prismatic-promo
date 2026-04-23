+++
title = "Evidence"
weight = 50
[extra]
description = "Data, observations, measurements, or facts used to support or refute claims within the epistemic pipeline, governed by NABLA axioms requiring plurality, provenance, time decay, and contradiction preservation"
category = "epistemic"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "advanced"
domain_category = "epistemic-systems"
related_concepts = ["nabla-infinity", "signal-plurality", "provenance-mandatory", "time-decay", "contradiction-preservation", "evidence-over-opinion", "epistemic-pipeline"]
implementation_status = "production"
authority_level = "platform-doctrine"
difficulty_rating = 6
prerequisites = ["nabla-infinity", "epistemic-pipeline", "signal-plurality"]
learning_path = ["evidence", "signal-plurality", "provenance-mandatory", "time-decay", "epistemic-reasoning", "trinity-gate"]
interactive_demos = ["/labs/glossary/evidence"]
code_examples = ["Evidence struct definition", "Evidence validation pipeline", "Time-decay computation", "Provenance chain verification"]
external_resources = ["https://plato.stanford.edu/entries/evidence/", "https://en.wikipedia.org/wiki/Evidence-based_practice"]
version_introduced = "0.10.0"
stability_level = "stable"
testing_scenarios = ["evidence provenance chain validation", "time-decay accuracy verification", "contradictory evidence handling", "evidence quality scoring"]
keywords = ["evidence", "epistemic evidence", "data provenance", "signal plurality", "evidence quality", "time decay", "evidence chain", "observation", "measurement"]
tags = ["glossary", "epistemic", "evidence", "nabla", "provenance", "data-quality"]
related_terms = ["nabla-infinity", "signal-plurality", "provenance-mandatory", "time-decay", "contradiction-preservation", "evidence-over-opinion", "epistemic-pipeline", "epistemic-reasoning", "epistemic-coordination", "confidence-threshold", "trinity-gate", "bayesian-reasoning"]
word_count = 2091
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Evidence - Prismatic Platform"
+++

## Definition

Evidence, in the context of epistemic systems and the Prismatic Platform, refers to any data, observation, measurement, or fact that is used to support or refute a claim within the [Epistemic Pipeline](@/glossary/epistemic-pipeline.md). Evidence is the fundamental input to all reasoning processes -- without evidence, no belief can be established, no confidence can be assigned, and no action can be justified.

Crucially, evidence in the Prismatic framework is not merely "data." It is data with metadata: every piece of evidence carries mandatory provenance (where it came from), a timestamp (when it was collected), a quality assessment (how reliable it is), source identification (which agent or system produced it), and a collection method description (how it was obtained). This metadata transforms raw data into epistemically useful evidence that can be properly weighted, aged, and traced through the reasoning chain.

The [NABLA Infinity](@/glossary/nabla-infinity.md) framework defines seven non-negotiable axioms that govern how evidence is handled in the platform. These axioms are not guidelines -- they are enforced at the system level. Evidence that lacks provenance is rejected. Claims supported by a single evidence source are blocked until a second independent source confirms. Contradictory evidence is preserved, never discarded. These constraints produce a system where beliefs are justified, traceable, and robust against manipulation.

## Overview

The concept of evidence spans philosophy, law, science, and engineering, with each domain defining it somewhat differently. In philosophy, evidence is whatever justifies belief. In law, evidence is admissible information presented to establish facts. In science, evidence is data collected through systematic observation or experimentation. In software engineering, evidence is often implicit -- a function returns a value, and we trust it without questioning its provenance.

The Prismatic Platform takes the most rigorous approach: evidence must be explicit, traceable, and independently verifiable. This is motivated by the platform's role in security assessment, intelligence fusion, and compliance evaluation -- domains where acting on false or manipulated evidence has serious consequences.

### Evidence vs. Data vs. Information vs. Knowledge

Understanding evidence requires distinguishing it from related concepts:

**Data** is raw, unprocessed observations. A DNS query response, a certificate transparency log entry, a port scan result -- these are data. Data has no inherent meaning without context.

**Information** is data with context and structure. "Port 443 is open on server X" is information -- it combines raw data (port state) with context (which server, which port).

**Evidence** is information evaluated for a specific purpose. "Port 443 is open on server X, supporting the claim that server X runs an HTTPS service" is evidence -- it connects information to a specific claim with a specific relationship (supports/refutes).

**Knowledge** is justified belief derived from evidence that has passed through the reasoning pipeline and the [Trinity Gate](@/glossary/trinity-gate.md). "Server X runs an HTTPS service" is knowledge when supported by multiple independent evidence sources with verified provenance.

### The Evidence Lifecycle

```
Collection --> Validation --> Classification --> Storage --> Retrieval --> Reasoning --> Archival
    |              |              |               |            |            |            |
    v              v              v               v            v            v            v
 Raw data    Provenance     Quality score    Time-stamped   Freshness   Weight in    Decay &
 gathered    verified       assigned         and indexed    checked     Bayesian     retention
                                                                       update       policy
```

## Technical Details

### Evidence Properties

Every piece of evidence in the Prismatic system has the following mandatory properties:

| Property | Type | NABLA Axiom | Description |
|----------|------|-------------|-------------|
| `id` | UUID | - | Unique identifier for the evidence item |
| `source_id` | String | Provenance Mandatory | Identifies the agent, tool, or system that produced the evidence |
| `source_family` | Atom | Source Independence | Groups correlated sources to prevent independence inflation |
| `claim_id` | String | - | The claim this evidence supports or refutes |
| `relationship` | Atom | - | `:supports`, `:refutes`, `:neutral`, or `:ambiguous` |
| `content` | Any | - | The actual data constituting the evidence |
| `timestamp` | DateTime | Time Decay | When the evidence was collected (not when it was processed) |
| `collection_method` | String | Provenance Mandatory | How the evidence was obtained |
| `quality_score` | Float | - | 0.0 to 1.0 assessment of evidence reliability |
| `provenance_chain` | List | Provenance Mandatory | Full chain from original source to current form |
| `independent` | Boolean | Source Independence | Whether this source is independent of other evidence |
| `weight` | Float | Time Decay | Current weight after applying time decay |

### Evidence Quality Dimensions

Evidence quality is not a single number but a composite of multiple dimensions:

**Reliability**: How trustworthy is the source? A certificate transparency log maintained by a major CA is more reliable than a self-reported website header. Reliability scores are calibrated based on historical accuracy of the source.

**Relevance**: How directly does this evidence relate to the claim? A DNS record directly supports claims about domain configuration. A social media post tangentially supports claims about organizational structure.

**Recency**: How fresh is the evidence? A security scan from today is more relevant than one from last month. Recency is formally modeled through [Time Decay](@/glossary/time-decay.md) with exponential decay functions.

**Independence**: Is this evidence independent of other evidence in the set? Ten articles all citing the same press release are not ten independent evidence items -- they are one piece of evidence with nine amplifications. The [Source Independence](@/glossary/nabla-infinity.md) axiom addresses this.

**Completeness**: Does the evidence cover the full scope of the claim, or only a partial aspect? Partial evidence may support a claim directionally but cannot establish it at high confidence.

## Implementation in Prismatic Platform

### Evidence Struct and Validation

```elixir
defmodule Prismatic.Epistemic.Evidence do
  @moduledoc """
  Core evidence structure used throughout the Prismatic epistemic
  pipeline. Every piece of evidence must satisfy NABLA axioms
  before entering the reasoning system.
  """

  @type t :: %__MODULE__{
    id: String.t(),
    source_id: String.t(),
    source_family: atom(),
    claim_id: String.t() | nil,
    relationship: :supports | :refutes | :neutral | :ambiguous,
    content: term(),
    timestamp: DateTime.t(),
    collection_method: String.t(),
    quality_score: float(),
    provenance_chain: [provenance_entry()],
    independent_source: boolean(),
    weight: float(),
    metadata: map()
  }

  @type provenance_entry :: %{
    step: pos_integer(),
    actor: String.t(),
    action: String.t(),
    timestamp: DateTime.t(),
    input_hash: String.t(),
    output_hash: String.t()
  }

  @enforce_keys [
    :id, :source_id, :source_family, :content,
    :timestamp, :collection_method, :provenance_chain
  ]
  defstruct [
    :id,
    :source_id,
    :source_family,
    :claim_id,
    :content,
    :timestamp,
    :collection_method,
    :provenance_chain,
    :metadata,
    relationship: :neutral,
    quality_score: 0.5,
    independent_source: true,
    weight: 1.0
  ]

  @spec new(map()) :: {:ok, t()} | {:error, atom()}
  def new(attrs) when is_map(attrs) do
    with {:ok, validated} <- validate_required_fields(attrs),
         {:ok, with_id} <- ensure_id(validated),
         {:ok, with_provenance} <- validate_provenance(with_id),
         {:ok, with_timestamp} <- validate_timestamp(with_provenance) do
      evidence = struct!(__MODULE__, with_id)
      {:ok, %{evidence | weight: compute_initial_weight(evidence)}}
    end
  end

  @spec validate(t()) :: {:ok, t()} | {:error, [atom()]}
  def validate(%__MODULE__{} = evidence) do
    violations =
      []
      |> check_provenance_present(evidence)
      |> check_timestamp_present(evidence)
      |> check_source_identified(evidence)
      |> check_quality_bounds(evidence)

    if Enum.empty?(violations) do
      {:ok, evidence}
    else
      {:error, violations}
    end
  end

  @spec apply_time_decay(t()) :: t()
  def apply_time_decay(%__MODULE__{} = evidence) do
    age_hours = DateTime.diff(DateTime.utc_now(), evidence.timestamp, :hour)
    decay_factor = :math.exp(-age_hours / 720)
    %{evidence | weight: evidence.quality_score * decay_factor}
  end

  @spec merge_provenance(t(), provenance_entry()) :: t()
  def merge_provenance(%__MODULE__{} = evidence, entry) do
    next_step = length(evidence.provenance_chain) + 1
    new_entry = Map.put(entry, :step, next_step)
    %{evidence | provenance_chain: evidence.provenance_chain ++ [new_entry]}
  end

  @spec supports?(t()) :: boolean()
  def supports?(%__MODULE__{relationship: :supports}), do: true
  def supports?(_), do: false

  @spec refutes?(t()) :: boolean()
  def refutes?(%__MODULE__{relationship: :refutes}), do: true
  def refutes?(_), do: false

  @spec stale?(t(), pos_integer()) :: boolean()
  def stale?(%__MODULE__{} = evidence, max_age_hours \\ 720) do
    age_hours = DateTime.diff(DateTime.utc_now(), evidence.timestamp, :hour)
    age_hours > max_age_hours
  end

  @spec compute_initial_weight(t()) :: float()
  defp compute_initial_weight(evidence) do
    base = evidence.quality_score
    independence_bonus = if evidence.independent_source, do: 1.2, else: 1.0
    base * independence_bonus
  end

  @spec validate_required_fields(map()) :: {:ok, map()} | {:error, atom()}
  defp validate_required_fields(attrs) do
    required = [:source_id, :source_family, :content, :timestamp, :collection_method]

    missing = Enum.filter(required, fn key -> not Map.has_key?(attrs, key) end)

    if Enum.empty?(missing) do
      {:ok, attrs}
    else
      {:error, :missing_required_fields}
    end
  end

  @spec ensure_id(map()) :: {:ok, map()}
  defp ensure_id(attrs) do
    if Map.has_key?(attrs, :id) do
      {:ok, attrs}
    else
      {:ok, Map.put(attrs, :id, generate_evidence_id())}
    end
  end

  @spec validate_provenance(map()) :: {:ok, map()} | {:error, atom()}
  defp validate_provenance(attrs) do
    case Map.get(attrs, :provenance_chain, []) do
      [] -> {:error, :empty_provenance_chain}
      chain when is_list(chain) -> {:ok, attrs}
      _ -> {:error, :invalid_provenance_chain}
    end
  end

  @spec validate_timestamp(map()) :: {:ok, map()} | {:error, atom()}
  defp validate_timestamp(attrs) do
    case Map.get(attrs, :timestamp) do
      %DateTime{} -> {:ok, attrs}
      _ -> {:error, :invalid_timestamp}
    end
  end

  @spec check_provenance_present([atom()], t()) :: [atom()]
  defp check_provenance_present(violations, %{provenance_chain: []}) do
    [:missing_provenance | violations]
  end

  defp check_provenance_present(violations, _), do: violations

  @spec check_timestamp_present([atom()], t()) :: [atom()]
  defp check_timestamp_present(violations, %{timestamp: nil}) do
    [:missing_timestamp | violations]
  end

  defp check_timestamp_present(violations, _), do: violations

  @spec check_source_identified([atom()], t()) :: [atom()]
  defp check_source_identified(violations, %{source_id: nil}) do
    [:missing_source_id | violations]
  end

  defp check_source_identified(violations, _), do: violations

  @spec check_quality_bounds([atom()], t()) :: [atom()]
  defp check_quality_bounds(violations, %{quality_score: score})
       when score < 0.0 or score > 1.0 do
    [:quality_out_of_bounds | violations]
  end

  defp check_quality_bounds(violations, _), do: violations

  @spec generate_evidence_id() :: String.t()
  defp generate_evidence_id do
    "ev_" <> Base.encode16(:crypto.strong_rand_bytes(12), case: :lower)
  end
end
```

### Evidence Collection and Storage

```elixir
defmodule Prismatic.Epistemic.EvidenceStore do
  @moduledoc """
  Storage and retrieval for evidence items. Provides indexed
  access by claim, source, time range, and quality threshold.
  Uses ETS for fast in-memory access with periodic persistence.
  """

  use GenServer

  alias Prismatic.Epistemic.Evidence

  @table_name :evidence_store
  @decay_interval_ms :timer.minutes(15)

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec store(Evidence.t()) :: :ok | {:error, atom()}
  def store(%Evidence{} = evidence) do
    case Evidence.validate(evidence) do
      {:ok, valid_evidence} ->
        :ets.insert(@table_name, {valid_evidence.id, valid_evidence})
        index_by_claim(valid_evidence)
        index_by_source(valid_evidence)
        emit_evidence_stored(valid_evidence)
        :ok

      {:error, violations} ->
        {:error, {:validation_failed, violations}}
    end
  end

  @spec fetch(String.t()) :: {:ok, Evidence.t()} | {:error, :not_found}
  def fetch(evidence_id) do
    case :ets.lookup(@table_name, evidence_id) do
      [{^evidence_id, evidence}] -> {:ok, evidence}
      [] -> {:error, :not_found}
    end
  end

  @spec find_by_claim(String.t(), keyword()) :: [Evidence.t()]
  def find_by_claim(claim_id, opts \\ []) do
    min_quality = Keyword.get(opts, :min_quality, 0.0)
    max_age_hours = Keyword.get(opts, :max_age_hours, 720)

    case :ets.lookup(:evidence_claim_index, claim_id) do
      [{^claim_id, evidence_ids}] ->
        evidence_ids
        |> Enum.map(&fetch/1)
        |> Enum.filter(&match?({:ok, _}, &1))
        |> Enum.map(fn {:ok, ev} -> ev end)
        |> Enum.reject(&Evidence.stale?(&1, max_age_hours))
        |> Enum.filter(&(&1.quality_score >= min_quality))
        |> Enum.map(&Evidence.apply_time_decay/1)
        |> Enum.sort_by(& &1.weight, :desc)

      [] ->
        []
    end
  end

  @spec find_contradictions(String.t()) ::
    [{Evidence.t(), Evidence.t()}]
  def find_contradictions(claim_id) do
    evidence = find_by_claim(claim_id)

    supporting = Enum.filter(evidence, &Evidence.supports?/1)
    refuting = Enum.filter(evidence, &Evidence.refutes?/1)

    for s <- supporting, r <- refuting, do: {s, r}
  end

  @spec count_independent_sources(String.t()) :: non_neg_integer()
  def count_independent_sources(claim_id) do
    claim_id
    |> find_by_claim()
    |> Enum.filter(& &1.independent_source)
    |> Enum.map(& &1.source_family)
    |> Enum.uniq()
    |> length()
  end

  @spec signal_plurality_satisfied?(String.t()) :: boolean()
  def signal_plurality_satisfied?(claim_id) do
    count_independent_sources(claim_id) >= 2
  end

  @impl true
  def init(_opts) do
    :ets.new(@table_name, [:named_table, :public, read_concurrency: true])
    :ets.new(:evidence_claim_index, [:named_table, :public, :bag])
    :ets.new(:evidence_source_index, [:named_table, :public, :bag])

    schedule_decay_pass()
    {:ok, %{decay_count: 0}}
  end

  @impl true
  def handle_info(:apply_decay, state) do
    apply_global_decay()
    schedule_decay_pass()
    {:noreply, %{state | decay_count: state.decay_count + 1}}
  end

  @spec index_by_claim(Evidence.t()) :: true
  defp index_by_claim(%{claim_id: nil}), do: true

  defp index_by_claim(%{claim_id: claim_id, id: id}) do
    :ets.insert(:evidence_claim_index, {claim_id, id})
  end

  @spec index_by_source(Evidence.t()) :: true
  defp index_by_source(%{source_id: source_id, id: id}) do
    :ets.insert(:evidence_source_index, {source_id, id})
  end

  @spec apply_global_decay() :: :ok
  defp apply_global_decay do
    :ets.foldl(
      fn {id, evidence}, _acc ->
        decayed = Evidence.apply_time_decay(evidence)
        :ets.insert(@table_name, {id, decayed})
      end,
      :ok,
      @table_name
    )
  end

  @spec schedule_decay_pass() :: reference()
  defp schedule_decay_pass do
    Process.send_after(self(), :apply_decay, @decay_interval_ms)
  end

  @spec emit_evidence_stored(Evidence.t()) :: :ok
  defp emit_evidence_stored(evidence) do
    :telemetry.execute(
      [:prismatic, :epistemic, :evidence, :stored],
      %{quality_score: evidence.quality_score, weight: evidence.weight},
      %{
        source_id: evidence.source_id,
        source_family: evidence.source_family,
        relationship: evidence.relationship
      }
    )
  end
end
```

### Evidence Aggregation for Reasoning

```elixir
defmodule Prismatic.Epistemic.EvidenceAggregator do
  @moduledoc """
  Aggregates evidence for a claim, applying NABLA axiom checks
  and producing weighted evidence sets ready for epistemic reasoning.
  """

  alias Prismatic.Epistemic.{Evidence, EvidenceStore}

  @type aggregation_result :: %{
    claim_id: String.t(),
    supporting: [Evidence.t()],
    refuting: [Evidence.t()],
    neutral: [Evidence.t()],
    contradictions: [{Evidence.t(), Evidence.t()}],
    independent_source_count: non_neg_integer(),
    signal_plurality_met: boolean(),
    weighted_support: float(),
    weighted_opposition: float(),
    net_evidence_weight: float()
  }

  @spec aggregate(String.t(), keyword()) :: {:ok, aggregation_result()}
  def aggregate(claim_id, opts \\ []) do
    evidence = EvidenceStore.find_by_claim(claim_id, opts)

    supporting = Enum.filter(evidence, &Evidence.supports?/1)
    refuting = Enum.filter(evidence, &Evidence.refutes?/1)
    neutral = Enum.filter(evidence, &(&1.relationship == :neutral))

    contradictions = EvidenceStore.find_contradictions(claim_id)
    independent_count = EvidenceStore.count_independent_sources(claim_id)

    weighted_support = supporting |> Enum.map(& &1.weight) |> Enum.sum()
    weighted_opposition = refuting |> Enum.map(& &1.weight) |> Enum.sum()

    result = %{
      claim_id: claim_id,
      supporting: supporting,
      refuting: refuting,
      neutral: neutral,
      contradictions: contradictions,
      independent_source_count: independent_count,
      signal_plurality_met: independent_count >= 2,
      weighted_support: weighted_support,
      weighted_opposition: weighted_opposition,
      net_evidence_weight: weighted_support - weighted_opposition
    }

    {:ok, result}
  end

  @spec sufficient_for_belief?(aggregation_result(), float()) :: boolean()
  def sufficient_for_belief?(aggregation, threshold \\ 0.80) do
    aggregation.signal_plurality_met and
      aggregation.net_evidence_weight > 0 and
      compute_confidence(aggregation) >= threshold
  end

  @spec compute_confidence(aggregation_result()) :: float()
  defp compute_confidence(aggregation) do
    total_weight =
      aggregation.weighted_support + aggregation.weighted_opposition

    if total_weight == 0 do
      0.0
    else
      aggregation.weighted_support / total_weight
    end
  end
end
```

## Comparison with Alternatives

### vs. Raw Data Pipelines

Traditional data pipelines (ETL, streaming) process data without epistemic metadata. Data flows from source to destination with transformation steps but without provenance tracking, quality scoring, or contradiction detection. Evidence pipelines add the epistemic layer that transforms data into justified input for reasoning systems.

### vs. Data Lineage Systems

Data lineage tools (Apache Atlas, Marquez) track where data came from and how it was transformed, similar to evidence provenance. However, they do not assess evidence quality, enforce plurality requirements, or handle contradictions. Lineage answers "where did this data come from?" Evidence answers "should I believe this data and how much?"

### vs. Knowledge Graphs

Knowledge graphs (Neo4j, KuzuDB) store entities and relationships, which can represent evidence and claims. However, knowledge graphs typically represent assertions as facts without confidence levels, time decay, or contradiction tracking. Evidence systems add the uncertainty layer that knowledge graphs lack.

### vs. Audit Logs

Audit logs record what happened and when, providing traceability similar to evidence provenance. However, audit logs are passive records -- they do not evaluate the quality of what they record, do not enforce plurality, and do not participate in reasoning. Evidence is active: it influences belief formation and decision-making through weighted aggregation.

### vs. Scientific Evidence Standards

Scientific evidence standards (systematic reviews, meta-analyses, evidence grading like GRADE) are the closest analogy to Prismatic's evidence handling. Both require multiple independent sources, assess evidence quality, track provenance, and handle contradictory findings. Prismatic implements these principles computationally, automating what scientists do manually.

## Best Practices

1. **Always attach provenance at collection time.** Evidence provenance must be recorded when the evidence is collected, not reconstructed later. Include the source system, collection method, authentication context, and any transformations applied. Retroactive provenance is unreliable.

2. **Score quality immediately.** Assign a quality score when evidence enters the system based on source reliability, collection method rigor, and content completeness. Do not defer quality assessment to reasoning time -- by then, the context for assessment may be lost.

3. **Never modify evidence after storage.** Evidence items are immutable once stored. If new information changes the interpretation of evidence, create a new provenance entry rather than modifying the original. This preserves the audit trail and prevents retroactive rationalization.

4. **Use time decay consistently.** Apply the same decay function across all evidence types. An exponential decay with a 30-day half-life (720 hours) is the Prismatic default. Override only with explicit justification and document the rationale.

5. **Track source families, not just source IDs.** Multiple OSINT tools may query the same underlying database. These are not independent sources even though they have different source IDs. Group sources into families and count independence at the family level.

6. **Handle absence as evidence.** When an expected evidence source fails to produce evidence, record this absence explicitly. The absence of a vulnerability in a security scan is evidence (that the scanner did not find it), not a lack of evidence.

7. **Separate evidence from interpretation.** An open port is evidence. "This system is vulnerable because port 443 is open" is interpretation. Keep evidence factual and defer interpretation to the [Epistemic Reasoning](@/glossary/epistemic-reasoning.md) layer.

## Common Pitfalls

1. **Treating quantity as quality.** Ten low-quality evidence items from correlated sources do not equal one high-quality item from an independent source. The signal plurality axiom requires *independent* sources, not merely multiple sources. Weight by quality and independence, not count.

2. **Ignoring time decay.** Evidence from six months ago that has not been refreshed may no longer reflect current reality. A domain that was malicious in January may be clean in July. The time-decay mechanism exists precisely to prevent stale evidence from driving current decisions.

3. **Circular evidence chains.** Source A reports a finding based on Source B's data, and Source B cites Source A as a reference. This creates a circular provenance chain that appears to have two independent sources but actually has zero. The provenance validation pipeline must detect and flag circular chains.

4. **Confirmation bias in evidence collection.** When investigating a hypothesis, there is a natural tendency to seek confirming evidence and overlook contradicting evidence. The [Contradiction Preservation](@/glossary/contradiction-preservation.md) axiom and the separation of collection from reasoning mitigate this, but awareness is still necessary.

5. **Evidence hoarding without review.** Accumulating large volumes of evidence without periodic review leads to a system where stale, low-quality, and contradictory evidence accumulates without contributing to reasoning. Regular decay passes and quality-threshold filtering prevent evidence hoarding.

6. **Destroying evidence during aggregation.** When aggregating evidence from multiple sources, some systems "merge" duplicate findings, destroying the individual evidence items. Always preserve individual evidence items and aggregate by reference, not by modification.

## Use Cases

### OSINT Intelligence Collection

The 120+ OSINT adapters in the Prismatic Platform each produce evidence about target entities. A Czech company lookup produces evidence from ARES, the Commercial Register, the Insolvency Register, and multiple other sources. Each evidence item carries its source provenance, quality score (government registries score higher than social media), and timestamp. The evidence aggregator determines whether signal plurality is met before the intelligence fusion layer produces assessments.

### Security Vulnerability Assessment

A security scan produces evidence about open ports, certificate configurations, HTTP headers, and DNS records. Each finding is an evidence item with specific provenance (which scanner, which scan profile, when executed). The time-decay mechanism ensures that old scan results are weighted less than fresh results. Contradictory evidence (one scanner reports a vulnerability, another does not) is preserved for Purple Team analysis.

### Compliance Evaluation

NIS2 and ZKB compliance assessments aggregate evidence from multiple dimensions: technical controls, policy documentation, incident response capability, and supply chain security. Each dimension produces evidence with different quality characteristics. The evidence aggregator determines per-dimension and overall compliance confidence, with explicit uncertainty markers for dimensions where evidence is insufficient.

### Threat Intelligence Correlation

When correlating threat intelligence across multiple feeds, evidence from different sources about the same indicator of compromise (IOC) must be reconciled. Different feeds may disagree about the severity, attribution, or even validity of an IOC. The evidence system preserves all perspectives, scores them by source reliability, and presents the full evidence landscape to analysts rather than a single "resolved" view.

## Theoretical Foundations

### Evidential Decision Theory

Evidence in the Prismatic Platform aligns with evidential decision theory (EDT), which evaluates actions based on their evidential relationship to outcomes rather than their causal relationship. An evidence item supports a claim if observing that evidence makes the claim more probable, regardless of whether the evidence caused the claim to be true.

### Bayesian Evidence Theory

In Bayesian terms, evidence E supports hypothesis H if P(H|E) > P(H) -- that is, if observing the evidence increases the probability of the hypothesis. The strength of evidence is measured by the likelihood ratio P(E|H) / P(E|not-H). The evidence aggregator uses this framework to compute weighted support and opposition scores.

### Evidence Strength Hierarchy

| Level | Type | Strength | Example |
|-------|------|----------|---------|
| L1 | Direct observation | Highest | Port scan shows service running |
| L2 | Documented record | High | Certificate transparency log entry |
| L3 | Expert assessment | Medium | Security analyst evaluation |
| L4 | Indirect inference | Lower | Behavioral pattern suggests configuration |
| L5 | Hearsay/report | Lowest | Third-party report without primary source |

## Related Concepts

- [NABLA Infinity](@/glossary/nabla-infinity.md) - The 7-axiom framework governing all evidence handling
- [Signal Plurality](@/glossary/signal-plurality.md) - The axiom requiring minimum 2 independent evidence sources
- [Provenance Mandatory](@/glossary/provenance-mandatory.md) - The axiom requiring full traceability of all evidence
- [Time Decay](@/glossary/time-decay.md) - Temporal weighting that reduces evidence quality over time
- [Contradiction Preservation](@/glossary/contradiction-preservation.md) - The axiom preventing premature discarding of contradictory evidence
- [Evidence Over Opinion](@/glossary/evidence-over-opinion.md) - The principle that evidence must override subjective assessment
- [Epistemic Pipeline](@/glossary/epistemic-pipeline.md) - The processing pipeline through which evidence flows
- [Epistemic Reasoning](@/glossary/epistemic-reasoning.md) - The reasoning processes that consume evidence to produce beliefs
- [Epistemic Coordination](@/glossary/epistemic-coordination.md) - Cross-agent coordination of evidence-based findings
- [Confidence Threshold](@/glossary/confidence-threshold.md) - Minimum evidence-based confidence for action triggers
- [Trinity Gate](@/glossary/trinity-gate.md) - The 3-gate verification that evidence-based conclusions must pass
- [Bayesian Reasoning](@/glossary/bayesian-reasoning.md) - Probabilistic framework for evidence-based belief updating

## See Also

- [Epistemic Attack](@/glossary/epistemic-attack.md) - Attacks targeting evidence integrity and provenance
- [Epistemic Robustness](@/glossary/epistemic-robustness.md) - System resilience against evidence manipulation
- [Epistemic Validation](@/glossary/epistemic-validation.md) - Validation of evidence quality and provenance
- [Observability](@/glossary/observability.md) - Monitoring the evidence pipeline itself
- [Telemetry](@/glossary/telemetry.md) - Event tracking for evidence collection and processing metrics

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
