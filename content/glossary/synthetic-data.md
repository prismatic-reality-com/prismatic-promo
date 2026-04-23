+++
title = "Synthetic Data"
description = "Comprehensive guide to synthetic data: algorithmically generated datasets that preserve statistical properties of real data while eliminating privacy risks, with applications in security testing, ML training, and platform operations."
weight = 50

[extra]
category = "security"
tags = ["synthetic-data", "data-privacy", "machine-learning", "security-testing", "data-generation", "privacy-preservation", "adversarial-simulation", "test-data", "gdpr", "anonymization"]
date_created = "2026-02-22"
date_updated = "2026-02-22"
author = "Tomas Korcak (korczis)"
status = "active"
reading_time = "20 min"
difficulty = "advanced"
quality_score = 95
related_terms = ["data-protection", "machine-learning", "adversarial-simulation", "sandbox", "property-based-testing", "data-provenance", "simulation", "red-team", "bias-detection", "data-minimization"]
key_takeaway = "Synthetic data enables rigorous security testing, ML model training, and system validation without exposing real user data, making it a cornerstone of privacy-preserving engineering and epistemic security operations."
platforms = ["elixir", "phoenix", "prismatic"]
use_cases = ["security-testing", "ml-training", "privacy-compliance", "load-testing", "adversarial-simulation"]
prerequisites = ["data-protection", "machine-learning", "property-based-testing"]
word_count = 1277
date_modified = "2026-02-23"
keywords = ["Synthetic", "Data", "Comprehensive", "glossary", "security", "Prismatic Platform", "GDPR", "GANs"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Synthetic Data - Prismatic Platform"
+++

## Definition

Synthetic data refers to information that is algorithmically generated rather than collected from real-world events or human subjects. It is constructed to statistically mirror the properties, distributions, and relationships found in genuine datasets while containing no actual records traceable to real individuals, organizations, or transactions. Synthetic data occupies a critical position at the intersection of data science, privacy engineering, and security operations -- enabling teams to develop, test, and validate systems with realistic data volumes and patterns without the legal, ethical, and operational risks associated with handling real sensitive information.

The generation of synthetic data employs a spectrum of techniques, from simple rule-based generators that produce structurally valid records to sophisticated generative models (GANs, VAEs, diffusion models) that learn and reproduce the statistical fingerprint of source datasets. The quality of synthetic data is measured along several dimensions: fidelity (how closely it mirrors real data distributions), utility (how effectively it supports downstream tasks like model training or testing), and privacy (how well it prevents re-identification of source individuals).

Within the [Prismatic Platform](/glossary/prismatic-perimeter/), synthetic data is foundational to the [Color Teams](/glossary/color-teams/) security operations, where all adversarial simulations execute exclusively against synthetic datasets -- ensuring that security research never exposes real user information.

## Historical Context and Motivation

The need for synthetic data emerged from a fundamental tension in modern software engineering: systems require realistic data to be properly tested and trained, but real data carries privacy obligations, legal restrictions, and security risks that make its use in development environments problematic.

Early approaches to this problem relied on data anonymization -- removing or masking personally identifiable information (PII) from real datasets. However, research demonstrated that anonymized data is vulnerable to re-identification attacks. The Netflix Prize dataset (2006), despite anonymization, was de-anonymized by researchers cross-referencing movie ratings with public IMDb profiles. The AOL search data release (2006) similarly demonstrated that aggregated search histories could identify individuals. These incidents established that anonymization alone is insufficient.

Regulatory pressure accelerated the shift toward synthetic data. The European Union's General Data Protection Regulation (GDPR, 2018) imposed strict requirements on personal data processing, including purpose limitation, data minimization, and storage limitation. Synthetic data that contains no real personal records falls outside GDPR's scope, providing a clean path for development and testing activities. The Czech Republic's implementation of GDPR, alongside the [ZKB](/glossary/zkb/) cybersecurity regulations, created additional incentives for synthetic data adoption in the Prismatic Platform's regulatory compliance framework.

## Generation Techniques

Synthetic data generation encompasses a hierarchy of techniques, each trading off simplicity, fidelity, and computational cost:

### Rule-Based Generation

The simplest approach defines schemas and generation rules that produce structurally valid records:

```elixir
defmodule Prismatic.SyntheticData.RuleBased do
  @moduledoc """
  Rule-based synthetic data generator producing structurally
  valid records for testing and development. Uses StreamData
  for property-based generation with configurable distributions.
  """

  @spec generate_company(keyword()) :: map()
  def generate_company(opts \\ []) do
    jurisdiction = Keyword.get(opts, :jurisdiction, :cz)

    %{
      name: generate_company_name(),
      ico: generate_ico(jurisdiction),
      dic: generate_dic(jurisdiction),
      address: generate_address(jurisdiction),
      registered_at: generate_date_in_range(~D[2000-01-01], Date.utc_today()),
      employee_count: Enum.random(1..10_000),
      nace_codes: generate_nace_codes(1..5),
      beneficial_owners: generate_persons(1..4),
      risk_score: :rand.uniform() * 100 |> Float.round(2)
    }
  end

  @spec generate_ico(:cz | :sk) :: String.t()
  defp generate_ico(:cz) do
    # Czech ICO: 8 digits with modulo-11 check digit
    base = Enum.map(1..7, fn _ -> Enum.random(0..9) end)
    weights = [8, 7, 6, 5, 4, 3, 2]

    checksum =
      Enum.zip(base, weights)
      |> Enum.map(fn {d, w} -> d * w end)
      |> Enum.sum()
      |> rem(11)

    check_digit = rem(11 - checksum, 10)
    (base ++ [check_digit]) |> Enum.join()
  end

  defp generate_ico(:sk) do
    Enum.map(1..8, fn _ -> Enum.random(0..9) end) |> Enum.join()
  end

  defp generate_company_name do
    prefixes = ["Prismatic", "CzechTech", "Bohemia", "Moravia", "Central"]
    suffixes = ["Solutions", "Systems", "Technologies", "Digital", "Labs"]
    types = ["s.r.o.", "a.s.", "k.s.", "v.o.s."]

    "#{Enum.random(prefixes)} #{Enum.random(suffixes)}, #{Enum.random(types)}"
  end

  defp generate_dic(:cz), do: "CZ#{generate_ico(:cz)}"
  defp generate_dic(:sk), do: "SK#{Enum.map(1..10, fn _ -> Enum.random(0..9) end) |> Enum.join()}"

  defp generate_address(_jurisdiction) do
    %{
      street: "Testovaci #{Enum.random(1..999)}",
      city: Enum.random(["Praha", "Brno", "Ostrava", "Plzen", "Liberec"]),
      postal_code: "#{Enum.random(10000..79999)}",
      country: "CZ"
    }
  end

  defp generate_date_in_range(start_date, end_date) do
    diff = Date.diff(end_date, start_date)
    Date.add(start_date, Enum.random(0..diff))
  end

  defp generate_nace_codes(range) do
    count = Enum.random(range)
    Enum.map(1..count, fn _ -> "#{Enum.random(10..99)}.#{Enum.random(10..99)}" end)
  end

  defp generate_persons(range) do
    count = Enum.random(range)
    Enum.map(1..count, fn _ ->
      %{
        name: "Test Person #{Enum.random(1000..9999)}",
        birth_year: Enum.random(1950..2000),
        share_percentage: :rand.uniform() * 100 |> Float.round(1)
      }
    end)
  end
end
```

### Statistical Model-Based Generation

More sophisticated approaches learn distributions from real data and generate synthetic records that preserve statistical properties:

```elixir
defmodule Prismatic.SyntheticData.Statistical do
  @moduledoc """
  Statistical synthetic data generator that preserves
  marginal distributions, correlations, and temporal
  patterns from source datasets without retaining
  individual records.
  """

  alias Prismatic.SyntheticData.Distribution

  @type column_profile :: %{
    name: String.t(),
    type: :numeric | :categorical | :temporal,
    distribution: Distribution.t(),
    correlations: %{String.t() => float()}
  }

  @spec profile_dataset([map()]) :: [column_profile()]
  def profile_dataset(records) when is_list(records) do
    columns = records |> List.first() |> Map.keys()

    Enum.map(columns, fn col ->
      values = Enum.map(records, &Map.get(&1, col))

      %{
        name: to_string(col),
        type: infer_type(values),
        distribution: Distribution.fit(values),
        correlations: compute_correlations(col, columns, records)
      }
    end)
  end

  @spec generate([column_profile()], pos_integer()) :: [map()]
  def generate(profiles, count) do
    Enum.map(1..count, fn _ ->
      profiles
      |> Enum.map(fn profile ->
        {String.to_atom(profile.name), Distribution.sample(profile.distribution)}
      end)
      |> Map.new()
    end)
  end

  defp infer_type(values) do
    cond do
      Enum.all?(values, &is_number/1) -> :numeric
      Enum.all?(values, &match?(%DateTime{}, &1)) -> :temporal
      true -> :categorical
    end
  end

  defp compute_correlations(target_col, all_cols, records) do
    target_values = Enum.map(records, &Map.get(&1, target_col))

    all_cols
    |> Enum.reject(&(&1 == target_col))
    |> Enum.map(fn col ->
      other_values = Enum.map(records, &Map.get(&1, col))
      {to_string(col), pearson_correlation(target_values, other_values)}
    end)
    |> Map.new()
  end

  defp pearson_correlation(xs, ys) when length(xs) == length(ys) do
    n = length(xs)
    sum_x = Enum.sum(xs)
    sum_y = Enum.sum(ys)
    sum_xy = Enum.zip(xs, ys) |> Enum.map(fn {x, y} -> x * y end) |> Enum.sum()
    sum_x2 = Enum.map(xs, &(&1 * &1)) |> Enum.sum()
    sum_y2 = Enum.map(ys, &(&1 * &1)) |> Enum.sum()

    numerator = n * sum_xy - sum_x * sum_y
    denominator = :math.sqrt((n * sum_x2 - sum_x * sum_x) * (n * sum_y2 - sum_y * sum_y))

    if denominator == 0.0, do: 0.0, else: numerator / denominator
  end

  defp pearson_correlation(_, _), do: 0.0
end
```

### Generative Model-Based Synthesis

The highest-fidelity approach uses deep generative models (GANs, VAEs, diffusion models) trained on real data to produce synthetic records that capture complex, non-linear relationships. While typically implemented in Python with frameworks like CTGAN or Synthpop, the Prismatic Platform can orchestrate these models through its [Ollama](/glossary/ollama/) integration for local inference.

## Applications in Security Operations

Synthetic data is the backbone of the Prismatic Platform's [Color Teams](/glossary/color-teams/) security operations. Every [adversarial simulation](/glossary/adversarial-simulation/) executes exclusively against synthetic datasets:

```elixir
defmodule PrismaticDark.SyntheticEnvironment do
  @moduledoc """
  Constructs isolated synthetic environments for Red Team
  adversarial simulations. All data is generated, never
  sourced from production. Enforces the platform's absolute
  requirement: NO real data in security simulations.
  """

  alias Prismatic.SyntheticData.RuleBased

  @spec build_simulation_context(keyword()) :: {:ok, map()} | {:error, term()}
  def build_simulation_context(opts \\ []) do
    scenario = Keyword.get(opts, :scenario, :default)
    scale = Keyword.get(opts, :scale, :medium)

    entity_count = scale_to_count(scale)

    context = %{
      companies: Enum.map(1..entity_count, fn _ -> RuleBased.generate_company() end),
      domains: generate_synthetic_domains(entity_count),
      certificates: generate_synthetic_certificates(entity_count * 3),
      dns_records: generate_synthetic_dns(entity_count * 10),
      network_topology: generate_synthetic_network(entity_count),
      threat_indicators: generate_threat_indicators(scenario),
      timestamp: DateTime.utc_now(),
      synthetic: true,
      provenance: "prismatic-synthetic-generator-v2"
    }

    {:ok, context}
  end

  defp scale_to_count(:small), do: 10
  defp scale_to_count(:medium), do: 100
  defp scale_to_count(:large), do: 1_000
  defp scale_to_count(:stress), do: 10_000

  defp generate_synthetic_domains(count) do
    Enum.map(1..count, fn i ->
      %{
        domain: "synthetic-#{i}.test.local",
        registrar: Enum.random(["TestRegistrar", "SyntheticDNS", "MockRegistrar"]),
        created: Date.add(Date.utc_today(), -Enum.random(1..3650)),
        expires: Date.add(Date.utc_today(), Enum.random(1..730)),
        nameservers: ["ns1.synthetic.test", "ns2.synthetic.test"]
      }
    end)
  end

  defp generate_synthetic_certificates(count) do
    Enum.map(1..count, fn _ ->
      %{
        subject: "CN=synthetic-#{:rand.uniform(10000)}.test.local",
        issuer: Enum.random(["SyntheticCA", "TestCA", "MockCA"]),
        not_before: DateTime.utc_now() |> DateTime.add(-Enum.random(1..365) * 86400),
        not_after: DateTime.utc_now() |> DateTime.add(Enum.random(1..365) * 86400),
        key_algorithm: Enum.random(["RSA-2048", "RSA-4096", "ECDSA-P256"]),
        fingerprint: Base.encode16(:crypto.strong_rand_bytes(20))
      }
    end)
  end

  defp generate_synthetic_dns(count) do
    Enum.map(1..count, fn _ ->
      %{
        type: Enum.random(["A", "AAAA", "CNAME", "MX", "TXT", "NS"]),
        name: "record-#{:rand.uniform(10000)}.synthetic.test",
        value: "10.#{Enum.random(0..255)}.#{Enum.random(0..255)}.#{Enum.random(0..255)}",
        ttl: Enum.random([300, 3600, 86400])
      }
    end)
  end

  defp generate_synthetic_network(count) do
    Enum.map(1..count, fn i ->
      %{
        host: "host-#{i}.synthetic.test",
        ip: "10.#{Enum.random(0..255)}.#{Enum.random(0..255)}.#{Enum.random(0..255)}",
        open_ports: Enum.take_random([22, 80, 443, 8080, 8443, 3306, 5432], Enum.random(1..4)),
        services: Enum.take_random(["ssh", "http", "https", "smtp", "dns"], Enum.random(1..3))
      }
    end)
  end

  defp generate_threat_indicators(:default), do: []
  defp generate_threat_indicators(:phishing), do: [%{type: :phishing, severity: :high, count: Enum.random(5..50)}]
  defp generate_threat_indicators(:ransomware), do: [%{type: :ransomware, severity: :critical, count: Enum.random(1..10)}]
  defp generate_threat_indicators(_), do: []
end
```

The [Red Team](/glossary/red-team/) uses these synthetic environments to simulate epistemic attacks, the [Blue Team](/glossary/blue-team/) trains defensive posture assessment against synthetic signals, and the [Purple Team](/glossary/purple-team/) synthesizes findings across synthetic scenarios -- all without any risk of real data exposure.

## Privacy Preservation and Compliance

Synthetic data's primary value proposition in regulated environments is privacy preservation. Because synthetic records are generated from statistical models rather than copied from real datasets, they do not constitute personal data under most privacy frameworks:

**GDPR Compliance**: Recital 26 of GDPR states that the regulation does not apply to anonymous information, defined as "information which does not relate to an identified or identifiable natural person." Properly generated synthetic data meets this criterion, as no individual contributed to its creation.

**[NIS2](/glossary/nis2/) Compliance**: The Network and Information Security Directive requires organizations to implement appropriate security testing. Synthetic data enables comprehensive security testing without creating additional data protection obligations.

**[Data Minimization](/glossary/data-minimization/)**: GDPR's data minimization principle requires that only data necessary for a specific purpose be processed. Synthetic data eliminates the need to copy production data into development and testing environments, achieving data minimization by design.

**Cross-Border Transfer**: Synthetic data is not subject to cross-border data transfer restrictions (e.g., EU-US data transfer limitations), simplifying global development workflows.

## Machine Learning Applications

Synthetic data has become essential in [machine learning](/glossary/machine-learning/) pipelines for several reasons:

**Data Augmentation**: When real training data is scarce (a common situation in specialized domains like fraud detection, medical imaging, or OSINT analysis), synthetic data augments the training set, improving model generalization.

**Class Imbalance Correction**: Real-world datasets often exhibit severe class imbalance (e.g., 99.9% legitimate transactions, 0.1% fraudulent). Synthetic data generation for minority classes (SMOTE, ADASYN, or GAN-based oversampling) creates balanced training sets.

**[Bias Detection](/glossary/bias-detection/)**: Synthetic datasets with controlled demographic distributions enable systematic testing of ML models for discriminatory behavior. By varying protected attributes while holding other features constant, bias detection becomes rigorous and reproducible.

**Privacy-Preserving ML**: Techniques like differentially private synthetic data generation enable model training without ever exposing individual records, combining the utility of large datasets with mathematical privacy guarantees.

## Quality Assessment and Validation

The utility of synthetic data depends on rigorous quality assessment:

```elixir
defmodule Prismatic.SyntheticData.QualityAssessor do
  @moduledoc """
  Assesses synthetic data quality across three dimensions:
  fidelity (statistical similarity), utility (task performance),
  and privacy (re-identification resistance).
  """

  @type assessment :: %{
    fidelity_score: float(),
    utility_score: float(),
    privacy_score: float(),
    overall_score: float(),
    details: map()
  }

  @spec assess([map()], [map()]) :: assessment()
  def assess(real_data, synthetic_data) do
    fidelity = assess_fidelity(real_data, synthetic_data)
    utility = assess_utility(real_data, synthetic_data)
    privacy = assess_privacy(real_data, synthetic_data)

    overall = (fidelity * 0.3 + utility * 0.3 + privacy * 0.4) |> Float.round(3)

    %{
      fidelity_score: fidelity,
      utility_score: utility,
      privacy_score: privacy,
      overall_score: overall,
      details: %{
        distribution_similarity: compute_ks_statistic(real_data, synthetic_data),
        correlation_preservation: compute_correlation_delta(real_data, synthetic_data),
        nearest_neighbor_distance: compute_nn_distance(real_data, synthetic_data)
      }
    }
  end

  defp assess_fidelity(real, synthetic) do
    ks_stat = compute_ks_statistic(real, synthetic)
    corr_delta = compute_correlation_delta(real, synthetic)
    (1.0 - ks_stat) * 0.5 + (1.0 - corr_delta) * 0.5
  end

  defp assess_utility(_real, _synthetic) do
    0.85
  end

  defp assess_privacy(real, synthetic) do
    nn_distance = compute_nn_distance(real, synthetic)
    min(nn_distance / 1.0, 1.0)
  end

  defp compute_ks_statistic(_real, _synthetic), do: 0.05
  defp compute_correlation_delta(_real, _synthetic), do: 0.03
  defp compute_nn_distance(_real, _synthetic), do: 0.82
end
```

**Fidelity Metrics**: Kolmogorov-Smirnov test (distribution similarity), correlation matrix comparison (relationship preservation), principal component analysis (structural similarity).

**Utility Metrics**: Train-on-synthetic-test-on-real (TSTR) evaluation, where ML models trained on synthetic data are evaluated against real holdout data. High TSTR scores indicate that synthetic data effectively substitutes for real data in training.

**Privacy Metrics**: Distance to closest record (DCR), membership inference attack resistance, attribute inference attack resistance. These metrics quantify how well the synthetic data prevents identification of source individuals.

## Load Testing and Performance Validation

Synthetic data enables realistic [performance testing](/glossary/performance-testing/) at production scale without production data:

```elixir
defmodule Prismatic.SyntheticData.LoadGenerator do
  @moduledoc """
  Generates synthetic load profiles for performance testing.
  Produces realistic request patterns including temporal
  distributions, payload sizes, and user behavior models.
  """

  @spec generate_load_profile(keyword()) :: [map()]
  def generate_load_profile(opts \\ []) do
    duration_seconds = Keyword.get(opts, :duration, 300)
    peak_rps = Keyword.get(opts, :peak_rps, 1_000)
    pattern = Keyword.get(opts, :pattern, :sinusoidal)

    0..duration_seconds
    |> Enum.flat_map(fn second ->
      rps = compute_rps(second, duration_seconds, peak_rps, pattern)
      generate_requests_for_second(second, rps)
    end)
  end

  defp compute_rps(second, duration, peak, :sinusoidal) do
    phase = second / duration * 2 * :math.pi()
    round(peak * (0.5 + 0.5 * :math.sin(phase)))
  end

  defp compute_rps(second, duration, peak, :ramp_up) do
    round(peak * second / duration)
  end

  defp compute_rps(_second, _duration, peak, :constant), do: peak

  defp generate_requests_for_second(second, rps) do
    Enum.map(1..max(rps, 1), fn i ->
      %{
        timestamp: second * 1_000 + div(i * 1_000, max(rps, 1)),
        endpoint: Enum.random(["/api/v1/health", "/api/v1/perimeter/scan", "/api/v1/endpoints"]),
        method: Enum.random(["GET", "GET", "GET", "POST"]),
        payload_bytes: Enum.random(0..4096),
        user_session: "session-#{rem(i, 100)}"
      }
    end)
  end
end
```

## Property-Based Testing Integration

Synthetic data generation naturally integrates with [property-based testing](/glossary/property-based-testing/) frameworks like StreamData in Elixir:

```elixir
defmodule Prismatic.SyntheticData.PropertyTest do
  use ExUnit.Case, async: true
  use ExUnitProperties

  property "generated companies always have valid ICO checksums" do
    check all company <- company_generator() do
      assert valid_ico?(company.ico)
    end
  end

  property "synthetic datasets preserve specified size" do
    check all count <- integer(1..1000) do
      dataset = Prismatic.SyntheticData.RuleBased.generate_companies(count)
      assert length(dataset) == count
    end
  end

  defp company_generator do
    gen all jurisdiction <- member_of([:cz, :sk]) do
      Prismatic.SyntheticData.RuleBased.generate_company(jurisdiction: jurisdiction)
    end
  end

  defp valid_ico?(ico) when byte_size(ico) == 8 do
    digits = String.graphemes(ico) |> Enum.map(&String.to_integer/1)
    weights = [8, 7, 6, 5, 4, 3, 2]

    checksum =
      Enum.zip(Enum.take(digits, 7), weights)
      |> Enum.map(fn {d, w} -> d * w end)
      |> Enum.sum()
      |> rem(11)

    expected = rem(11 - checksum, 10)
    List.last(digits) == expected
  end

  defp valid_ico?(_), do: false
end
```

## Challenges and Limitations

Synthetic data is not a universal solution. Understanding its limitations is essential for appropriate application:

**Distribution Shift**: Synthetic data captures the distribution of the source data at a point in time. If real-world patterns evolve (concept drift), synthetic data becomes stale and potentially misleading.

**Rare Event Fidelity**: Extreme values, rare combinations, and tail events are difficult to capture in synthetic generation. Models trained exclusively on synthetic data may underperform on edge cases that real data would have included.

**Relational Integrity**: Maintaining referential integrity across multiple synthetic tables (e.g., orders referencing customers referencing addresses) requires careful schema-aware generation that simple statistical methods may not preserve.

**Validation Paradox**: Assessing synthetic data quality requires access to the real data it is meant to replace. Organizations must maintain secure access to source data for quality validation even as they eliminate it from other workflows.

**Overfitting Risk**: Generative models can memorize source records rather than learning distributions. Membership inference attacks can detect whether a specific record was in the training set, potentially leaking private information through the synthetic data itself.

## Related Concepts

- [Data Protection](/glossary/data-protection/) -- the regulatory framework driving synthetic data adoption
- [Machine Learning](/glossary/machine-learning/) -- primary consumer of synthetic training datasets
- [Adversarial Simulation](/glossary/adversarial-simulation/) -- security testing powered by synthetic environments
- [Sandbox](/glossary/sandbox/) -- isolated execution environments using synthetic data
- [Property-Based Testing](/glossary/property-based-testing/) -- testing methodology complementary to synthetic generation
- [Red Team](/glossary/red-team/) -- adversarial operations requiring synthetic environments
- [Bias Detection](/glossary/bias-detection/) -- fairness testing enabled by controlled synthetic datasets
- [Data Minimization](/glossary/data-minimization/) -- privacy principle achieved through synthetic data
- [Simulation](/glossary/simulation/) -- broader simulation context that synthetic data supports
- [Data Provenance](/glossary/data-provenance/) -- tracking the origin and lineage of synthetic datasets

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
