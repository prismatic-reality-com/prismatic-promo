+++
title = "Property-Based Testing"
weight = 42
[extra]
category = "testing"
subcategory = "verification"
difficulty = "advanced"
technology_type = "testing_framework"
platform_component = "quality_assurance"
testing_paradigm = "generative"
verification_level = "statistical"
coverage_scope = "invariants"
complexity_level = "high"
learning_curve = "steep"
prerequisite_concepts = ["generators", "shrinking", "invariants", "statistical_verification"]
use_cases = ["contract_testing", "roundtrip_validation", "invariant_checking", "state_machine_testing", "regression_detection"]
benefits = ["edge_case_discovery", "minimal_failing_cases", "automated_input_generation", "statistical_confidence"]
implementation_patterns = ["generator_composition", "property_specification", "shrinking_strategies", "state_machine_modeling"]
quality_metrics = ["property_coverage", "generator_quality", "shrinking_efficiency", "execution_time"]
integration_points = ["exunit", "streamdata", "quality_gates", "trinity_gate", "formal_verification"]
related_disciplines = ["formal_methods", "chaos_engineering", "fuzz_testing", "theorem_proving"]
historical_context = "quickcheck_haskell"
description = "Testing methodology that verifies properties hold for randomly generated inputs rather than hand-written examples, discovering edge cases that example-based tests miss."
related_terms = ["trinity-gate", "exunit", "chaos-engineering", "formal-verification", "theorem-proving", "typespec", "code-coverage", "qdp", "streamdata", "quickcheck", "generators", "shrinking", "invariants", "statistical-verification"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1190
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Property-Based", "Testing", "glossary", "Prismatic Platform", "Properties", "Property", "StreamData", "Platform"]
tags = ["glossary", "testing", "property-based-testing", "prismatic"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Property-Based Testing - Prismatic Platform"
+++

## Definition

Property-based testing is a testing methodology where instead of writing individual test cases with specific inputs and expected outputs, the developer declares properties (invariants) that should hold for all valid inputs, and the testing framework generates hundreds or thousands of random inputs to verify those properties. When a property violation is found, the framework automatically shrinks the failing input to the minimal reproducible case -- the simplest input that still triggers the failure. This shrinking process is what makes property-based testing uniquely powerful for debugging: rather than receiving a complex, 500-character random string that causes a failure, the developer receives the minimal example, often just one or two characters, that exposes the bug.

The approach was pioneered by Koen Claessen and John Hughes with QuickCheck for Haskell (2000), and has since been ported to virtually every programming language. The key insight is that developers are poor at imagining edge cases: they test the happy path, maybe a null input and an empty string, but miss the Unicode surrogate pairs, the maximum-length inputs, the negative numbers, the deeply nested structures, and the concurrent access patterns that cause real-world failures. Property-based testing shifts the burden of test case generation from human imagination to algorithmic exploration of the input space.

The Prismatic Platform uses property-based testing through StreamData, Elixir's property-based testing library, for verifying storage adapter contracts, serialization round-trips, agent decision invariants, and epistemic pipeline properties. The platform's Quality Floor Guardian monitors property test coverage as part of its quality enforcement. The [Trinity Gate](/glossary/trinity-gate/) system's structural consistency layer uses property-based approaches to verify data structure invariants, and the [formal verification](/glossary/formal-verification/) pipeline complements property-based testing with mathematical proofs for critical properties.

## Core Concepts

### Generators

Generators produce random values of a given type. StreamData provides built-in generators for all Elixir primitive types and combinators for building complex custom generators:

```elixir
# Built-in generators
StreamData.integer()           # Random integers
StreamData.string(:alphanumeric)  # Random alphanumeric strings
StreamData.float()             # Random floats
StreamData.boolean()           # true or false

# Custom generators for domain types
def security_grade_generator do
  StreamData.member_of([:A, :B, :C, :D, :F])
end

def security_score_generator do
  StreamData.integer(300..900)
end

def domain_generator do
  StreamData.bind(
    StreamData.string(:alphanumeric, min_length: 1, max_length: 63),
    fn label ->
      StreamData.member_of(["com", "org", "net", "io", "cz"])
      |> StreamData.map(fn tld -> "#{label}.#{tld}" end)
    end
  )
end

def security_rating_generator do
  StreamData.fixed_map(%{
    domain: domain_generator(),
    grade: security_grade_generator(),
    score: security_score_generator(),
    assessed_at: datetime_generator()
  })
end
```

### Properties

A property is a boolean predicate that should hold for all generated inputs. Properties describe relationships and invariants rather than specific input-output pairs:

| Property Type | Description | Example |
|--------------|-------------|---------|
| **Roundtrip** | Encoding then decoding returns the original | `decode(encode(x)) == x` |
| **Idempotency** | Applying operation twice yields same result | `normalize(normalize(x)) == normalize(x)` |
| **Invariant** | Some condition always holds | `length(sort(list)) == length(list)` |
| **Commutative** | Order doesn't matter | `merge(a, b) == merge(b, a)` |
| **Monotonic** | Output grows/shrinks with input | `score(evidence ++ more) >= score(evidence)` |
| **Oracle** | Two implementations agree | `fast_sort(list) == Enum.sort(list)` |

### Shrinking

When a generated input causes a property violation, the framework systematically reduces it to the minimal failing case:

```
Generated failing input: [42, -17, 0, 99, -3, 8, 0, -1, 55, 12]
Shrinking step 1:       [42, -17, 0, 99, -3]         (still fails)
Shrinking step 2:       [-17, 0, -3]                   (still fails)
Shrinking step 3:       [-17, 0]                       (still fails)
Shrinking step 4:       [-1, 0]                        (still fails)
Shrinking step 5:       [0, 0]                         (passes!)
Minimal failing input:  [-1, 0]                        (minimal that fails)
```

The shrunk input immediately reveals the bug: the function fails when the list contains a negative number followed by zero. This insight would take much longer to extract from the original 10-element input.

## StreamData in Practice

### Storage Adapter Contract Testing

The Prismatic Platform uses property-based testing to verify that all storage adapters ([ETS](/glossary/ets/), [Ecto](/glossary/ecto/), Meilisearch, KuzuDB) satisfy the same behavioral contract:

```elixir
defmodule PrismaticStorage.AdapterContractTest do
  use ExUnit.Case
  use ExUnitProperties

  # Shared property tests for ALL storage adapters
  defmacro __using__(opts) do
    adapter = Keyword.fetch!(opts, :adapter_module)

    quote do
      property "store then retrieve returns original entity" do
        check all entity <- entity_generator() do
          {:ok, stored} = unquote(adapter).store(entity)
          {:ok, retrieved} = unquote(adapter).retrieve(stored.id)
          assert retrieved.data == entity.data
        end
      end

      property "delete then retrieve returns not_found" do
        check all entity <- entity_generator() do
          {:ok, stored} = unquote(adapter).store(entity)
          :ok = unquote(adapter).delete(stored.id)
          assert {:error, :not_found} = unquote(adapter).retrieve(stored.id)
        end
      end

      property "store is idempotent on same entity" do
        check all entity <- entity_generator() do
          {:ok, first} = unquote(adapter).store(entity)
          {:ok, second} = unquote(adapter).store(entity)
          assert first.data == second.data
        end
      end
    end
  end
end

# Usage in adapter test files
defmodule PrismaticStorage.ETS.AdapterTest do
  use PrismaticStorage.AdapterContractTest, adapter_module: PrismaticStorage.ETS
end

defmodule PrismaticStorage.Ecto.AdapterTest do
  use PrismaticStorage.AdapterContractTest, adapter_module: PrismaticStorage.Ecto
end
```

### Serialization Roundtrip Properties

```elixir
property "JSON serialization roundtrip preserves security ratings" do
  check all rating <- security_rating_generator() do
    encoded = Jason.encode!(rating)
    decoded = Jason.decode!(encoded, keys: :atoms)

    assert decoded.domain == rating.domain
    assert decoded.grade == rating.grade
    assert decoded.score == rating.score
  end
end

property "term_to_binary roundtrip preserves all Elixir terms" do
  check all term <- StreamData.term() do
    assert term == :erlang.binary_to_term(:erlang.term_to_binary(term))
  end
end
```

### Epistemic Pipeline Properties

Properties verifying invariants of the epistemic pipeline:

```elixir
property "confidence scoring is monotonic: more evidence never decreases confidence" do
  check all base_evidence <- list_of(evidence_generator(), min_length: 2),
            additional <- evidence_generator() do
    base_score = ConfidenceScoring.calculate(base_evidence)
    augmented_score = ConfidenceScoring.calculate([additional | base_evidence])

    assert augmented_score >= base_score,
      "Adding evidence should not decrease confidence: " <>
      "base=#{base_score}, augmented=#{augmented_score}"
  end
end

property "time decay is monotonically decreasing" do
  check all initial_confidence <- StreamData.float(min: 0.0, max: 1.0),
            time_elapsed <- StreamData.positive_integer() do
    decayed = TimeDecay.apply(initial_confidence, time_elapsed)
    assert decayed <= initial_confidence
    assert decayed >= 0.0
  end
end
```

## State Machine Testing

Property-based testing extends to stateful systems through state machine testing, where the framework generates sequences of operations and verifies that the system maintains its invariants throughout:

```elixir
defmodule PrismaticStorage.StateMachineTest do
  use ExUnit.Case
  use ExUnitProperties

  property "storage maintains consistency through arbitrary operation sequences" do
    check all operations <- list_of(operation_generator(), max_length: 100) do
      model = %{}  # Simple map as reference model
      {:ok, adapter} = PrismaticStorage.ETS.start_test_instance()

      Enum.reduce(operations, model, fn op, model ->
        case op do
          {:store, key, value} ->
            PrismaticStorage.ETS.put(adapter, key, value)
            Map.put(model, key, value)

          {:delete, key} ->
            PrismaticStorage.ETS.delete(adapter, key)
            Map.delete(model, key)

          {:retrieve, key} ->
            actual = PrismaticStorage.ETS.get(adapter, key)
            expected = Map.get(model, key)
            assert match_result(actual, expected)
            model
        end
      end)
    end
  end
end
```

## Advanced Property Categories

### Metamorphic Properties

Metamorphic properties describe relationships between multiple invocations of the same function with related inputs:

```elixir
property "search results subset property" do
  check all query <- non_empty_string(),
            additional_term <- non_empty_string() do
    base_results = PrismaticSearch.search(query)
    refined_results = PrismaticSearch.search("#{query} #{additional_term}")

    # Refined search should return subset of original results
    assert MapSet.subset?(
      MapSet.new(refined_results),
      MapSet.new(base_results)
    )
  end
end

property "security rating transitivity" do
  check all domain_a <- domain_generator(),
            domain_b <- domain_generator(),
            domain_c <- domain_generator() do
    score_a = SecurityRating.calculate(domain_a)
    score_b = SecurityRating.calculate(domain_b)
    score_c = SecurityRating.calculate(domain_c)

    # If A > B and B > C, then A > C (transitivity)
    if score_a > score_b and score_b > score_c do
      assert score_a > score_c, "Transitivity violation: #{score_a}, #{score_b}, #{score_c}"
    end
  end
end
```

### Algebraic Properties

Properties based on mathematical relationships:

```elixir
property "confidence aggregation is associative" do
  check all conf_a <- confidence_generator(),
            conf_b <- confidence_generator(),
            conf_c <- confidence_generator() do
    # (a ⊕ b) ⊕ c = a ⊕ (b ⊕ c)
    left = ConfidenceAggregation.combine(
      ConfidenceAggregation.combine(conf_a, conf_b),
      conf_c
    )
    right = ConfidenceAggregation.combine(
      conf_a,
      ConfidenceAggregation.combine(conf_b, conf_c)
    )

    assert_in_delta(left, right, 0.001)
  end
end

property "evidence fusion is commutative" do
  check all evidence_a <- evidence_generator(),
            evidence_b <- evidence_generator() do
    # a ⊕ b = b ⊕ a
    forward = EvidenceFusion.fuse(evidence_a, evidence_b)
    backward = EvidenceFusion.fuse(evidence_b, evidence_a)

    assert forward == backward
  end
end
```

### Temporal Properties

Properties that verify behavior over time:

```elixir
property "confidence decay is monotonic over time" do
  check all initial_conf <- confidence_generator(),
            time_points <- list_of(positive_integer(), min_length: 2, max_length: 10) do
    sorted_times = Enum.sort(time_points)

    decayed_values = Enum.map(sorted_times, fn time ->
      ConfidenceDecay.apply(initial_conf, time)
    end)

    # Each subsequent value should be <= previous
    assert decayed_values == Enum.sort(decayed_values, &>=/2)
  end
end
```

### Security Properties

Properties specific to security-critical components:

```elixir
property "authentication never elevates privileges" do
  check all user <- user_generator(),
            action <- action_generator() do
    initial_perms = Auth.get_permissions(user)

    case Auth.authenticate(user) do
      {:ok, authenticated_user} ->
        final_perms = Auth.get_permissions(authenticated_user)
        assert MapSet.subset?(final_perms, initial_perms) or
               initial_perms == final_perms
      {:error, _} ->
        :ok  # Failed auth doesn't change permissions
    end
  end
end
```

## Generator Design Patterns

### Compositional Generators

Building complex generators from simpler ones:

```elixir
defmodule PrismaticGenerators do
  def email_generator do
    StreamData.bind(
      StreamData.string(:alphanumeric, min_length: 1, max_length: 20),
      fn local ->
        domain_generator()
        |> StreamData.map(fn domain -> "#{local}@#{domain}" end)
      end
    )
  end

  def network_address_generator do
    StreamData.one_of([
      ipv4_generator(),
      ipv6_generator(),
      domain_generator()
    ])
  end

  def vulnerability_report_generator do
    StreamData.fixed_map(%{
      id: StreamData.string(:alphanumeric, length: 8),
      severity: StreamData.member_of([:critical, :high, :medium, :low, :info]),
      cvss_score: StreamData.float(min: 0.0, max: 10.0),
      affected_systems: StreamData.list_of(network_address_generator(), max_length: 20),
      discovered_at: datetime_generator(),
      verified: StreamData.boolean(),
      false_positive: StreamData.boolean()
    })
    |> StreamData.filter(&valid_vulnerability_report?/1)
  end

  defp valid_vulnerability_report?(report) do
    # Ensure severity matches CVSS score
    case {report.severity, report.cvss_score} do
      {:critical, score} when score >= 9.0 -> true
      {:high, score} when score >= 7.0 and score < 9.0 -> true
      {:medium, score} when score >= 4.0 and score < 7.0 -> true
      {:low, score} when score >= 0.1 and score < 4.0 -> true
      {:info, 0.0} -> true
      _ -> false
    end
  end
end
```

### Recursive Generators

For nested data structures:

```elixir
def tree_generator(max_depth \\ 5) do
  leaf_gen = StreamData.one_of([
    StreamData.integer(),
    StreamData.string(:alphanumeric)
  ])

  StreamData.tree(leaf_gen, fn child_gen ->
    StreamData.fixed_map(%{
      value: StreamData.term(),
      children: StreamData.list_of(child_gen, max_length: 3)
    })
  end, max_depth: max_depth)
end

def json_generator(max_depth \\ 3) when max_depth > 0 do
  leaf_gen = StreamData.one_of([
    StreamData.string(:utf8),
    StreamData.integer(),
    StreamData.float(),
    StreamData.boolean(),
    StreamData.constant(nil)
  ])

  if max_depth == 1 do
    leaf_gen
  else
    StreamData.one_of([
      leaf_gen,
      StreamData.list_of(json_generator(max_depth - 1)),
      StreamData.map_of(
        StreamData.string(:alphanumeric),
        json_generator(max_depth - 1)
      )
    ])
  end
end
```

## Shrinking Strategies

### Custom Shrinking

Implementing domain-specific shrinking for complex types:

```elixir
defmodule CustomShrinking do
  def vulnerability_shrinking_strategy(vuln) do
    # Shrink complex vulnerability reports to minimal failing cases
    Stream.concat([
      # Try removing affected systems one by one
      shrink_affected_systems(vuln),

      # Try reducing severity
      shrink_severity(vuln),

      # Try simplifying description
      shrink_description(vuln),

      # Try removing optional fields
      shrink_optional_fields(vuln)
    ])
  end

  defp shrink_affected_systems(vuln) do
    if length(vuln.affected_systems) > 1 do
      vuln.affected_systems
      |> Enum.with_index()
      |> Enum.map(fn {_system, index} ->
        %{vuln | affected_systems: List.delete_at(vuln.affected_systems, index)}
      end)
      |> Stream.filter(&valid_vulnerability_report?/1)
    else
      Stream.empty()
    end
  end

  defp shrink_severity(vuln) do
    severity_order = [:critical, :high, :medium, :low, :info]
    current_index = Enum.find_index(severity_order, &(&1 == vuln.severity))

    if current_index < length(severity_order) - 1 do
      severity_order
      |> Enum.drop(current_index + 1)
      |> Enum.map(&%{vuln | severity: &1})
      |> Stream.filter(&valid_vulnerability_report?/1)
    else
      Stream.empty()
    end
  end
end
```

## Performance Testing with Properties

### Load Testing Properties

```elixir
property "system performance degrades gracefully under load" do
  check all concurrent_users <- StreamData.integer(1..1000),
            operation_type <- StreamData.member_of([:read, :write, :search]) do

    baseline_time = measure_operation_time(operation_type, 1)
    loaded_time = measure_operation_time(operation_type, concurrent_users)

    # Performance should degrade at most quadratically
    acceptable_degradation = baseline_time * concurrent_users * concurrent_users * 0.001

    assert loaded_time <= acceptable_degradation,
      "Performance degradation too severe: #{loaded_time}ms vs acceptable #{acceptable_degradation}ms"
  end
end

property "memory usage is bounded" do
  check all data_size <- StreamData.integer(1..10_000) do
    initial_memory = :erlang.memory(:total)

    data = generate_test_data(data_size)
    _result = PrismaticStorage.process(data)

    :erlang.garbage_collect()  # Force GC
    final_memory = :erlang.memory(:total)

    memory_growth = final_memory - initial_memory
    expected_max = data_size * 1000  # 1KB per data item

    assert memory_growth <= expected_max,
      "Memory leak detected: grew by #{memory_growth} bytes"
  end
end
```

## Testing Distributed Systems

### Consensus Properties

```elixir
property "distributed consensus maintains consistency" do
  check all operations <- list_of(consensus_operation_generator(), max_length: 50),
            partition_scenario <- partition_generator() do

    nodes = [:node1, :node2, :node3, :node4, :node5]
    {:ok, cluster} = ConsensusCluster.start(nodes)

    try do
      # Apply partition
      ConsensusCluster.apply_partition(cluster, partition_scenario)

      # Execute operations
      results = Enum.map(operations, fn op ->
        ConsensusCluster.execute(cluster, op)
      end)

      # Heal partition
      ConsensusCluster.heal_partition(cluster)

      # Verify consistency across all nodes
      final_states = ConsensusCluster.get_all_states(cluster)

      # All reachable nodes should have same state
      reachable_states = Enum.reject(final_states, &is_nil/1)
      assert Enum.uniq(reachable_states) |> length() <= 1,
        "Consensus violation: multiple final states"

    after
      ConsensusCluster.shutdown(cluster)
    end
  end
end
```

### Network Partition Properties

```elixir
property "system remains available during network partitions" do
  check all partition_type <- partition_type_generator(),
            operation <- operation_generator() do

    {:ok, system} = DistributedSystem.start()

    # Create network partition
    DistributedSystem.create_partition(system, partition_type)

    # System should still handle operations (possibly with degraded performance)
    result = DistributedSystem.execute(system, operation)

    case result do
      {:ok, _} -> :ok
      {:error, :temporarily_unavailable} -> :ok  # Acceptable
      {:error, reason} ->
        flunk("System failed permanently during partition: #{inspect(reason)}")
    end

    # Healing partition should restore full functionality
    DistributedSystem.heal_partition(system)

    {:ok, _} = DistributedSystem.execute(system, operation)

    DistributedSystem.shutdown(system)
  end
end
```

## Model-Based Testing

### Abstract State Models

```elixir
defmodule StorageModel do
  @behaviour PropCheck.StateM

  def initial_state, do: %{}

  def command(_state) do
    StreamData.one_of([
      {:put, [StreamData.binary(), StreamData.term()]},
      {:get, [StreamData.binary()]},
      {:delete, [StreamData.binary()]}
    ])
  end

  def precondition(_state, _call), do: true

  def postcondition(state, {:put, [key, value]}, result) do
    result == :ok
  end

  def postcondition(state, {:get, [key]}, result) do
    expected = Map.get(state, key)
    case {expected, result} do
      {nil, {:error, :not_found}} -> true
      {value, {:ok, value}} -> true
      _ -> false
    end
  end

  def postcondition(state, {:delete, [key]}, result) do
    result == :ok
  end

  def next_state(state, _result, {:put, [key, value]}) do
    Map.put(state, key, value)
  end

  def next_state(state, _result, {:get, [_key]}) do
    state
  end

  def next_state(state, _result, {:delete, [key]}) do
    Map.delete(state, key)
  end
end

property "storage system matches model" do
  PropCheck.forall(
    PropCheck.StateM.commands(__MODULE__.StorageModel),
    fn commands ->
      {:ok, storage} = Storage.start_link()

      {history, state, result} = PropCheck.StateM.run_commands(
        __MODULE__.StorageModel,
        commands,
        [{:storage, storage}]
      )

      Storage.stop(storage)
      result == :ok
    end
  )
end
```

## Integration Testing Patterns

### Cross-System Property Verification

```elixir
property "security ratings consistency across adapters" do
  check all domain <- domain_generator() do
    # Test multiple storage adapters return consistent results
    {:ok, ets_rating} = PrismaticStorage.ETS.get_security_rating(domain)
    {:ok, ecto_rating} = PrismaticStorage.Ecto.get_security_rating(domain)
    {:ok, search_rating} = PrismaticStorage.Meilisearch.get_security_rating(domain)

    # Core rating data should be identical
    assert ets_rating.grade == ecto_rating.grade
    assert ets_rating.score == ecto_rating.score
    assert ecto_rating.grade == search_rating.grade

    # Timestamps may differ slightly due to storage timing
    assert_in_delta(
      DateTime.to_unix(ets_rating.assessed_at),
      DateTime.to_unix(ecto_rating.assessed_at),
      5  # 5 second tolerance
    )
  end
end

property "API endpoints respect OpenAPI specification" do
  check all endpoint <- api_endpoint_generator(),
            request <- request_generator_for_endpoint(endpoint) do

    response = HTTPClient.request(endpoint, request)
    spec = OpenAPISpec.get_specification()

    case OpenAPIValidator.validate_response(spec, endpoint, response) do
      :ok -> :ok
      {:error, violations} ->
        flunk("OpenAPI violation for #{endpoint}: #{inspect(violations)}")
    end
  end
end
```

## Error Injection Testing

### Fault Tolerance Properties

```elixir
property "system handles database failures gracefully" do
  check all operation <- database_operation_generator(),
            fault_type <- fault_type_generator() do

    # Inject fault into database layer
    FaultInjection.inject_database_fault(fault_type)

    result = DatabaseLayer.execute(operation)

    case result do
      {:ok, _} -> :ok  # Operation succeeded despite fault
      {:error, :database_unavailable} -> :ok  # Graceful degradation
      {:error, :timeout} -> :ok  # Acceptable timeout
      {:error, reason} ->
        # Should not crash or return unexpected errors
        assert reason in [:database_unavailable, :timeout, :retry_later],
          "Unexpected error during fault: #{inspect(reason)}"
    end

    FaultInjection.clear_faults()
  end
end
```

## Comparison with Other Testing Approaches

| Approach | Input Generation | Coverage | Guarantee | Failure Output |
|----------|-----------------|----------|-----------|----------------|
| **Example-based** ([ExUnit](/glossary/exunit/)) | Hand-written | Developer imagination | Specific cases | Exact failing test |
| **Property-based** (StreamData) | Random + shrinking | Statistical (high) | "No bug found in N tests" | Minimal failing case |
| **Fuzz testing** | Random mutation | Crash/security focused | "No crash in N runs" | Crashing input |
| **[Formal verification](/glossary/formal-verification/)** ([Lean4](/glossary/lean4/)) | Mathematical proof | Universal | "Proven for all inputs" | Counterexample or proof |
| **[Chaos engineering](/glossary/chaos-engineering/)** | Fault injection | System resilience | "System survives failures" | Failure scenario |

The Prismatic Platform uses all five approaches at different levels. Example-based tests verify specific business scenarios. Property-based tests verify invariants across random inputs. Formal verification proves critical properties mathematically. The approaches form a verification pyramid:

```
        /\
       /  \  Formal Verification (Lean4)
      /    \  Proves universal properties
     /------\
    /        \ Property-Based Testing (StreamData)
   /          \ Statistical verification across random inputs
  /------------\
 /              \ Example-Based Testing (ExUnit)
/                \ Specific scenarios and edge cases
------------------
```

## Property Testing in CI/CD Pipeline

### Automated Property Test Execution

The platform's CI/CD pipeline executes property tests at multiple stages:

```yaml
# .gitlab-ci.yml excerpt
property_tests:
  stage: test
  script:
    - mix deps.get
    - mix compile --warnings-as-errors
    - mix test --only property --cover
    - mix property.shrink --regression-check
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: cover/cobertura.xml
    paths:
      - cover/
      - property_regression_cases/
  coverage: '/Total coverage: \d+\.\d+%/'
```

### Regression Test Generation

Failed property tests automatically generate regression test suites:

```elixir
defmodule PropertyRegression do
  def capture_failing_case(property_name, generated_input, error) do
    regression_test = """
    test "regression: #{property_name} with minimal case" do
      input = #{inspect(generated_input)}

      # This test captures a previously failing property case
      # Generated on #{DateTime.utc_now()}
      # Original error: #{inspect(error)}

      assert_property_holds(input)
    end
    """

    File.write!(
      "test/regression/#{property_name}_regression_test.exs",
      regression_test
    )
  end
end
```

### Property Test Metrics

```elixir
defmodule PropertyMetrics do
  def collect_metrics(test_run) do
    %{
      total_properties: count_properties(test_run),
      total_test_cases: count_generated_cases(test_run),
      shrinking_efficiency: calculate_shrinking_ratio(test_run),
      edge_case_coverage: measure_edge_coverage(test_run),
      execution_time: test_run.duration,
      memory_usage: test_run.peak_memory,
      generator_diversity: analyze_input_distribution(test_run)
    }
  end

  def calculate_shrinking_ratio(test_run) do
    failures = get_failures(test_run)

    if Enum.empty?(failures) do
      1.0
    else
      total_original_size = Enum.sum(Enum.map(failures, &input_size(&1.original)))
      total_shrunk_size = Enum.sum(Enum.map(failures, &input_size(&1.shrunk)))

      total_shrunk_size / total_original_size
    end
  end
end
```

## Advanced Property Patterns

### Invariant Discovery

Using property tests to discover system invariants automatically:

```elixir
defmodule InvariantDiscovery do
  def discover_invariants(module, function_name) do
    # Generate diverse inputs
    inputs = StreamData.list_of(StreamData.term(), length: 1000)
              |> Enum.take(1000)

    # Collect outputs
    outputs = Enum.map(inputs, fn input ->
      try do
        apply(module, function_name, [input])
      rescue
        error -> {:error, error}
      end
    end)

    # Analyze patterns
    analyze_invariants(inputs, outputs)
  end

  defp analyze_invariants(inputs, outputs) do
    [
      check_output_type_consistency(outputs),
      check_input_output_relationships(inputs, outputs),
      check_monotonicity(inputs, outputs),
      check_idempotency_patterns(inputs, outputs),
      discover_algebraic_properties(inputs, outputs)
    ]
    |> Enum.filter(&is_valid_invariant?/1)
  end
end
```

### Contract-Based Testing

Integrating with design-by-contract principles:

```elixir
defmodule ContractTesting do
  defmacro property_with_contract(name, contract, do: body) do
    quote do
      property unquote(name) do
        check all input <- unquote(contract.input_generator) do
          # Pre-condition check
          assert unquote(contract.precondition).(input),
            "Precondition failed for input: #{inspect(input)}"

          # Execute test body
          result = unquote(body).(input)

          # Post-condition check
          assert unquote(contract.postcondition).(input, result),
            "Postcondition failed for input: #{inspect(input)}, result: #{inspect(result)}"
        end
      end
    end
  end
end

# Usage example
defmodule SecurityRatingContracts do
  use ContractTesting

  @security_rating_contract %{
    input_generator: domain_generator(),
    precondition: fn domain -> String.valid?(domain) and String.length(domain) > 0 end,
    postcondition: fn domain, {:ok, rating} ->
      is_atom(rating.grade) and
      rating.grade in [:A, :B, :C, :D, :F] and
      is_integer(rating.score) and
      rating.score >= 300 and
      rating.score <= 900
    end
  }

  property_with_contract "security rating respects contract",
                        @security_rating_contract do
    fn domain -> SecurityRating.calculate(domain) end
  end
end
```

### Multi-System Property Verification

Testing properties across multiple interacting systems:

```elixir
property "distributed cache consistency" do
  check all operations <- list_of(cache_operation_generator(), max_length: 100),
            node_failures <- list_of(node_failure_generator(), max_length: 3) do

    # Start distributed cache cluster
    nodes = [:cache1, :cache2, :cache3, :cache4, :cache5]
    {:ok, cluster} = DistributedCache.start_cluster(nodes)

    try do
      # Execute operations with intermittent failures
      Enum.zip(operations, node_failures ++ Stream.cycle([nil]))
      |> Enum.reduce(%{}, fn {operation, failure}, expected_state ->
        # Apply failure if specified
        if failure do
          DistributedCache.simulate_failure(cluster, failure)
        end

        # Execute operation
        case operation do
          {:put, key, value} ->
            DistributedCache.put(cluster, key, value)
            Map.put(expected_state, key, value)

          {:get, key} ->
            result = DistributedCache.get(cluster, key)
            expected = Map.get(expected_state, key)

            case {expected, result} do
              {nil, {:error, :not_found}} -> :ok
              {nil, {:error, :temporarily_unavailable}} -> :ok  # Acceptable during failures
              {value, {:ok, value}} -> :ok
              {expected, actual} ->
                flunk("Cache inconsistency: expected #{inspect(expected)}, got #{inspect(actual)}")
            end

            expected_state

          {:delete, key} ->
            DistributedCache.delete(cluster, key)
            Map.delete(expected_state, key)
        end
      end)

      # Final consistency check after healing all failures
      DistributedCache.heal_all_failures(cluster)
      :timer.sleep(1000)  # Allow convergence

      # Verify final state consistency across all nodes
      final_states = DistributedCache.get_all_node_states(cluster)

      live_states = Enum.reject(final_states, &is_nil/1)
      assert Enum.uniq(live_states) |> length() <= 1,
        "Final state inconsistency across nodes"

    after
      DistributedCache.shutdown_cluster(cluster)
    end
  end
end
```

## Property Test Optimization

### Generator Performance Tuning

```elixir
defmodule OptimizedGenerators do
  # Cache expensive generators
  @cached_domain_list ["example.com", "test.org", "demo.net", "sample.io"]

  def fast_domain_generator do
    # Use pre-computed list instead of generating each time
    StreamData.member_of(@cached_domain_list)
  end

  def biased_integer_generator do
    # Bias towards edge cases that often reveal bugs
    StreamData.frequency([
      {10, StreamData.member_of([0, 1, -1])},               # Common edge cases
      {5, StreamData.member_of([-2_147_483_648, 2_147_483_647])}, # Integer bounds
      {3, StreamData.integer(-1000..-1)},                   # Negative numbers
      {3, StreamData.integer(1..1000)},                     # Small positive
      {1, StreamData.integer()}                             # Any integer
    ])
  end

  def smart_list_generator(element_gen) do
    # Generate lists with strategic sizes
    StreamData.frequency([
      {20, StreamData.constant([])},                        # Empty list
      {15, StreamData.list_of(element_gen, length: 1)},     # Single element
      {10, StreamData.list_of(element_gen, length: 2)},     # Pair
      {5, StreamData.list_of(element_gen, max_length: 10)}, # Small lists
      {1, StreamData.list_of(element_gen, max_length: 1000)} # Large lists
    ])
  end
end
```

### Parallel Property Execution

```elixir
defmodule ParallelPropertyTests do
  use ExUnit.Case, async: true
  use ExUnitProperties

  # Properties that can run in parallel
  @tag :property
  @tag :parallel_safe
  property "stateless function properties can run concurrently" do
    check all input <- input_generator() do
      # This property doesn't modify global state
      result = PureFunctions.transform(input)
      assert_valid_transformation(input, result)
    end
  end

  # Properties requiring serialization
  @tag :property
  @tag :serial_only
  property "database properties must run serially" do
    check all entity <- entity_generator() do
      # This property modifies database state
      {:ok, stored} = Database.store(entity)
      {:ok, retrieved} = Database.retrieve(stored.id)
      assert retrieved.data == entity.data

      Database.cleanup()
    end
  end
end
```

### Resource Management in Properties

```elixir
defmodule ResourceManagedProperties do
  use ExUnit.Case
  use ExUnitProperties

  setup do
    # Resource pool for property tests
    {:ok, pool} = ResourcePool.start_link()
    on_exit(fn -> ResourcePool.stop(pool) end)
    {:ok, pool: pool}
  end

  property "resource allocation properties", %{pool: pool} do
    check all operations <- list_of(resource_operation_generator(), max_length: 50) do
      allocated_resources = MapSet.new()

      try do
        Enum.each(operations, fn operation ->
          case operation do
            {:allocate, resource_type} ->
              {:ok, resource} = ResourcePool.allocate(pool, resource_type)
              allocated_resources = MapSet.put(allocated_resources, resource)

            {:deallocate, resource} ->
              if MapSet.member?(allocated_resources, resource) do
                :ok = ResourcePool.deallocate(pool, resource)
                allocated_resources = MapSet.delete(allocated_resources, resource)
              end
          end
        end)

        # Verify no resource leaks
        assert ResourcePool.active_count(pool) >= 0

      after
        # Cleanup any remaining resources
        Enum.each(allocated_resources, fn resource ->
          ResourcePool.deallocate(pool, resource)
        end)
      end
    end
  end
end
```

## Integration with Quality Enforcement

Property-based tests are a core component of the platform's NO MERCY quality enforcement:

| Quality Gate | Property Requirement |
|-------------|---------------------|
| Storage adapter compliance | All contract properties pass for every adapter |
| Serialization correctness | Roundtrip properties for all serializable types |
| Pipeline invariants | Monotonicity, idempotency, and ordering properties |
| [Typespec](/glossary/typespec/) compliance | Generated inputs respect function typespecs |
| [Code Coverage](/glossary/code-coverage/) | Property tests contribute to 100% coverage target |

## Property Testing Anti-Patterns

### Common Pitfalls to Avoid

| Anti-Pattern | Problem | Solution |
|-------------|---------|----------|
| **Testing Implementation** | Properties test how function works, not what it should do | Focus on external behavior and invariants |
| **Weak Generators** | Using overly simple generators that miss edge cases | Design generators that explore boundary conditions |
| **Non-Deterministic Properties** | Properties that sometimes pass, sometimes fail | Ensure properties are deterministic given same input |
| **Over-Specified Properties** | Properties too tightly coupled to implementation details | Test essential invariants, not implementation choices |
| **Insufficient Test Cases** | Running too few iterations to catch rare bugs | Use at least 1000 iterations for critical properties |

```elixir
# Anti-pattern: Testing implementation details
property "WRONG: sorts using quicksort algorithm" do
  check all list <- list_of(integer()) do
    result = MySort.sort(list)
    # This tests HOW it sorts, not WHAT sorting means
    assert_quicksort_partitioning(result, list)
  end
end

# Better: Testing behavior
property "CORRECT: sorting produces ordered output" do
  check all list <- list_of(integer()) do
    result = MySort.sort(list)
    # This tests WHAT sorting achieves
    assert Enum.sort(result) == result
    assert Enum.sort(list) == result  # Same elements, ordered
  end
end
```

### Property Design Guidelines

```elixir
defmodule PropertyDesignGuidelines do
  # Good: Test essential invariants
  property "encryption roundtrip preserves plaintext" do
    check all plaintext <- binary(),
              key <- encryption_key_generator() do
      ciphertext = Crypto.encrypt(plaintext, key)
      decrypted = Crypto.decrypt(ciphertext, key)
      assert decrypted == plaintext
    end
  end

  # Good: Test algebraic properties
  property "confidence aggregation is associative" do
    check all a <- confidence_generator(),
              b <- confidence_generator(),
              c <- confidence_generator() do
      left = Confidence.combine(Confidence.combine(a, b), c)
      right = Confidence.combine(a, Confidence.combine(b, c))
      assert_in_delta(left, right, 0.001)
    end
  end

  # Bad: Over-specified property
  property "AVOID: serialization uses specific JSON format" do
    check all data <- data_generator() do
      json = JSON.encode(data)
      # This is too specific - what if we change JSON libraries?
      assert String.contains?(json, "\"version\":\"1.0\"")
    end
  end

  # Better: Test essential serialization behavior
  property "BETTER: serialization preserves data" do
    check all data <- data_generator() do
      json = JSON.encode(data)
      decoded = JSON.decode(json)
      assert normalize_data(decoded) == normalize_data(data)
    end
  end
end
```

### Performance Considerations

```elixir
defmodule PropertyPerformance do
  # Optimize generator efficiency
  def efficient_tree_generator do
    # Pre-compute common tree shapes instead of generating recursively each time
    common_shapes = [
      {:leaf, StreamData.integer()},
      {:binary_tree, StreamData.integer(), StreamData.integer()},
      {:unbalanced_left, StreamData.integer(), StreamData.integer()},
      {:unbalanced_right, StreamData.integer(), StreamData.integer()}
    ]

    StreamData.frequency([
      {40, StreamData.member_of(common_shapes)},
      {10, full_recursive_tree_generator()}
    ])
  end

  # Batch operations for expensive setup/teardown
  property "batch database operations for efficiency" do
    check all operations <- list_of(db_operation_generator(), max_length: 100) do
      Database.transaction(fn ->
        # Execute all operations within single transaction
        Enum.each(operations, &Database.execute/1)

        # Verify batch invariants
        assert Database.consistent?()
      end)
    end
  end

  # Use resource pools for expensive resources
  property "reuse expensive resources across test cases" do
    check all request <- api_request_generator() do
      # Reuse HTTP client from pool instead of creating new one
      client = HTTPClientPool.checkout()

      try do
        response = HTTPClient.request(client, request)
        assert_valid_response(response)
      after
        HTTPClientPool.checkin(client)
      end
    end
  end
end
```

## Educational Property Examples

### Learning Property-Based Thinking

Start with simple properties that are easy to understand:

```elixir
defmodule LearningProperties do
  # Level 1: Basic invariants
  property "list length is preserved after sorting" do
    check all list <- list_of(integer()) do
      sorted = Enum.sort(list)
      assert length(sorted) == length(list)
    end
  end

  # Level 2: Roundtrip properties
  property "base64 encoding roundtrip" do
    check all data <- binary() do
      encoded = Base.encode64(data)
      decoded = Base.decode64!(encoded)
      assert decoded == data
    end
  end

  # Level 3: Algebraic properties
  property "string concatenation is associative" do
    check all a <- string(:printable),
              b <- string(:printable),
              c <- string(:printable) do
      left = (a <> b) <> c
      right = a <> (b <> c)
      assert left == right
    end
  end

  # Level 4: State machine properties
  property "state machine transitions preserve invariants" do
    check all transitions <- list_of(state_transition_generator()) do
      initial_state = InitialState.new()

      final_state = Enum.reduce(transitions, initial_state, fn transition, state ->
        StateMachine.apply_transition(state, transition)
      end)

      assert StateMachine.valid_state?(final_state)
    end
  end

  # Level 5: Distributed system properties
  property "consensus protocol maintains safety" do
    check all network_scenario <- network_scenario_generator() do
      {:ok, cluster} = ConsensusCluster.start()

      ConsensusProtocol.simulate_scenario(cluster, network_scenario)

      # Safety: never commit conflicting values
      committed_values = ConsensusProtocol.get_committed_values(cluster)
      assert no_conflicts?(committed_values)

      ConsensusCluster.shutdown(cluster)
    end
  end
end
```

### Property Testing Workshop Exercises

```elixir
defmodule PropertyWorkshop do
  # Exercise 1: Find the bug in this implementation
  def buggy_max(list) when is_list(list) do
    # Intentional bug: doesn't handle empty list
    Enum.reduce(list, fn x, acc -> if x > acc, do: x, else: acc end)
  end

  property "find the bug: maximum element property" do
    check all list <- non_empty(list_of(integer())) do
      max_val = buggy_max(list)
      # This property will fail and shrink to minimal case
      assert Enum.all?(list, fn x -> x <= max_val end)
      assert max_val in list
    end
  end

  # Exercise 2: Write property for this function
  def mystery_function(list) do
    list
    |> Enum.with_index()
    |> Enum.filter(fn {_elem, idx} -> rem(idx, 2) == 0 end)
    |> Enum.map(fn {elem, _idx} -> elem end)
  end

  # Student should discover: this function returns elements at even indices
  property "discover what mystery_function does" do
    check all list <- list_of(integer()) do
      result = mystery_function(list)

      # What invariants hold?
      # length(result) <= length(list)
      # All elements in result are in original list
      # Order is preserved
      # ...
    end
  end
end
```

## Real-World Property Testing Case Studies

### Case Study 1: Finding Unicode Bugs

```elixir
property "text processing handles all Unicode correctly" do
  check all text <- string(:utf8, max_length: 1000) do
    processed = TextProcessor.normalize(text)

    # Properties that should hold for any Unicode text
    assert String.valid?(processed), "Output should be valid UTF-8"
    assert String.length(processed) >= 0, "Length should be non-negative"

    # Normalization should be idempotent
    double_processed = TextProcessor.normalize(processed)
    assert double_processed == processed, "Normalization should be idempotent"
  end
end

# This property found bugs with:
# - Emoji handling (multi-byte sequences)
# - Combining characters
# - Right-to-left text
# - Surrogate pairs
# - Zero-width characters
```

### Case Study 2: Discovering Database Race Conditions

```elixir
property "concurrent database operations maintain consistency" do
  check all operations <- list_of(db_operation_generator(), max_length: 20) do
    # Execute operations concurrently
    tasks = Enum.map(operations, fn op ->
      Task.async(fn ->
        Database.execute(op)
      end)
    end)

    results = Task.await_many(tasks)

    # Check that database remains in consistent state
    assert Database.check_constraints()

    # Check that all successful operations are reflected
    successful_ops = Enum.zip(operations, results)
                    |> Enum.filter(fn {_op, result} -> match?({:ok, _}, result) end)
                    |> Enum.map(fn {op, _result} -> op end)

    verify_operations_applied(successful_ops)
  end
end

# This property discovered:
# - Race conditions in account balance updates
# - Phantom reads in transaction isolation
# - Deadlocks in concurrent writes
# - Index corruption under heavy load
```

### Case Study 3: API Contract Validation

```elixir
property "API responses match OpenAPI specification" do
  check all endpoint <- api_endpoint_generator(),
            request <- valid_request_generator(endpoint) do

    response = APIClient.call(endpoint, request)

    # Response should match OpenAPI spec
    spec = OpenAPISpec.for_endpoint(endpoint)
    validation_result = OpenAPIValidator.validate_response(spec, response)

    case validation_result do
      :ok -> :ok
      {:error, violations} ->
        flunk("API contract violation: #{inspect(violations)}")
    end

    # Additional properties
    assert response.status in [200, 201, 400, 401, 403, 404, 422, 500]
    assert Map.has_key?(response.headers, "content-type")

    if response.status in 200..299 do
      assert response.body != nil, "Success responses should have body"
    end
  end
end

# This property caught:
# - Missing required fields in responses
# - Incorrect HTTP status codes
# - Schema validation failures
# - Missing security headers
# - Inconsistent date formats
```

## Tools and Libraries Ecosystem

### StreamData Extensions

```elixir
defmodule CustomStreamDataExtensions do
  # Domain-specific generators
  def email_generator do
    StreamData.bind(
      StreamData.string(:alphanumeric, min_length: 1, max_length: 64),
      fn local_part ->
        domain_generator()
        |> StreamData.map(fn domain -> "#{local_part}@#{domain}" end)
      end
    )
  end

  def credit_card_generator do
    StreamData.bind(
      StreamData.member_of([:visa, :mastercard, :amex]),
      fn card_type ->
        digits = case card_type do
          :visa -> StreamData.string([?4], length: 1)
          :mastercard -> StreamData.member_of(["51", "52", "53", "54", "55"])
          :amex -> StreamData.member_of(["34", "37"])
        end

        remaining_length = case card_type do
          :visa -> 15
          :mastercard -> 14
          :amex -> 13
        end

        StreamData.bind(digits, fn prefix ->
          StreamData.string(~c"0123456789", length: remaining_length)
          |> StreamData.map(fn suffix -> prefix <> suffix end)
        end)
      end
    )
    |> StreamData.filter(&valid_luhn_checksum?/1)
  end

  def ipv6_generator do
    StreamData.bind(
      StreamData.list_of(
        StreamData.string([?0..?9, ?a..?f, ?A..?F], min_length: 1, max_length: 4),
        length: 8
      ),
      fn groups ->
        StreamData.constant(Enum.join(groups, ":"))
      end
    )
  end
end
```

### Property Test Reporting

```elixir
defmodule PropertyTestReporter do
  def generate_report(test_results) do
    %{
      summary: generate_summary(test_results),
      property_coverage: analyze_coverage(test_results),
      shrinking_analysis: analyze_shrinking(test_results),
      performance_metrics: collect_performance(test_results),
      failure_patterns: identify_patterns(test_results),
      recommendations: generate_recommendations(test_results)
    }
  end

  def generate_summary(results) do
    total_properties = length(results)
    passed_properties = Enum.count(results, &(&1.status == :passed))
    failed_properties = Enum.count(results, &(&1.status == :failed))
    total_test_cases = Enum.sum(Enum.map(results, & &1.test_case_count))

    %{
      total_properties: total_properties,
      passed_properties: passed_properties,
      failed_properties: failed_properties,
      success_rate: passed_properties / total_properties,
      total_test_cases: total_test_cases,
      average_cases_per_property: total_test_cases / total_properties
    }
  end

  def analyze_shrinking(results) do
    failures = Enum.filter(results, &(&1.status == :failed))

    shrinking_stats = Enum.map(failures, fn failure ->
      %{
        property: failure.property_name,
        original_size: estimate_input_size(failure.original_input),
        shrunk_size: estimate_input_size(failure.shrunk_input),
        shrinking_steps: failure.shrinking_steps,
        shrinking_time: failure.shrinking_duration
      }
    end)

    %{
      failures_with_shrinking: length(shrinking_stats),
      average_reduction_ratio: calculate_average_reduction(shrinking_stats),
      shrinking_efficiency: calculate_shrinking_efficiency(shrinking_stats)
    }
  end
end
```

## Best Practices

| Practice | Description |
|----------|-------------|
| **Start with roundtrip properties** | `decode(encode(x)) == x` catches the most common bugs |
| **Test invariants, not implementations** | Properties should describe what, not how |
| **Customize generators for domain** | Generic generators miss domain-specific edge cases |
| **Run enough iterations** | Default 100 may miss rare bugs; use 1,000+ for critical paths |
| **Investigate all shrunk failures** | Minimal failing cases reveal fundamental issues |
| **Combine with example tests** | Properties verify invariants; examples document expected behavior |

## Related Terms

- [ExUnit](/glossary/exunit/) -- Elixir's test framework providing the `check all` macro for property tests
- [Trinity Gate](/glossary/trinity-gate/) -- Verification gate using property-based approaches for structural consistency
- [Formal Verification](/glossary/formal-verification/) -- Mathematical proof complement to statistical property verification
- [Theorem Proving](/glossary/theorem-proving/) -- Formal proof technique providing universal guarantees
- [Chaos Engineering](/glossary/chaos-engineering/) -- Fault injection testing complementing property-based input testing
- [Typespec](/glossary/typespec/) -- Type specifications guiding generator construction
- [Code Coverage](/glossary/code-coverage/) -- Coverage metrics that property tests contribute to
- [QDP](/glossary/qdp/) -- Quality debt eliminated through comprehensive property test suites
- [Lean4](/glossary/lean4/) -- Theorem prover providing formal verification beyond property testing
- [Behaviour](/glossary/behaviour/) -- Callback contracts verified through property-based adapter testing
- [Adapter Pattern](/glossary/adapter-pattern/) -- Storage adapters validated through shared property test suites

## See Also

- [Architecture](/architecture/) -- Platform testing architecture and verification pyramid
- [Technologies](/technologies/) -- Testing technology stack (StreamData, ExUnit, Lean4)

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)