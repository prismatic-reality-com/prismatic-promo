+++
title = "Specification"
weight = 50
[extra]
tags = ["glossary", "architecture", "design", "verification", "quality", "contracts", "testing", "formal-methods"]
description = "A precise, verifiable description of what a software component must do, expressed through type specifications, behaviour callbacks, formal contracts, property definitions, or documentation constraints -- the foundation of the Prismatic Platform's quality-first engineering approach"
category = "architecture"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
difficulty = "advanced"
quality_score = 95
related_terms = ["typespec", "behaviour", "protocol", "property-based-testing", "quality-gate", "openapi", "schema", "validation", "theorem-proving", "trinity-gate"]
related_concepts = ["design by contract", "formal verification", "specification-driven development", "type safety", "behavioral contracts", "API specification", "invariant definition"]
platforms = ["Prismatic Platform", "BEAM/OTP", "Phoenix LiveView"]
see_also = ["typespec", "behaviour", "openapi-spec", "property-based-testing"]
key_takeaway = "Specifications transform software from a collection of code into a verifiable system with mechanical guarantees -- typespecs, behaviours, OpenAPI schemas, and formal properties collectively ensure that implementations match intentions"
date_created = "2026-02-22"
date_updated = "2026-02-22"
word_count = 1535
date_modified = "2026-02-23"
keywords = ["Specification", "Prismatic", "Platforms", "glossary", "architecture", "Prismatic Platform", "Specifications", "Elixir", "OpenAPI"]
image = "/images/sections/glossary.png"
image_alt = "Specification - Prismatic Platform"
+++

## Definition

A Specification in software engineering is a precise, unambiguous, and verifiable description of what a software component, module, system, or interface must do. Specifications exist at multiple levels of formality -- from informal documentation and naming conventions through type annotations and interface contracts to formal mathematical proofs -- and serve as the authoritative reference against which implementations are validated.

The critical property of a specification is verifiability: a specification that cannot be checked against an implementation is merely documentation. Effective specifications enable automated verification through type checkers, contract validators, property-based test generators, and formal proof assistants. The tighter the specification, the narrower the space of valid implementations, reducing the opportunity for defects.

Within the Prismatic Platform, specifications operate at every layer of the architecture. Elixir [typespecs](/glossary/typespec/) annotate every public function. [Behaviours](/glossary/behaviour/) define callback contracts for all pluggable components. [OpenAPI](/glossary/openapi/) schemas specify REST API interfaces. [Property-based tests](/glossary/property-based-testing/) express universal invariants. [Lean4 proofs](/glossary/lean4/) verify critical claims formally. Together, these specifications create a multi-layered verification system that makes defects mechanically detectable rather than relying on human inspection.

## Specification Hierarchy

### Level 0: Naming Conventions

The weakest form of specification is consistent naming. When a function named `fetch_user/1` returns `{:ok, user} | {:error, reason}`, the name itself specifies expected behavior. The platform enforces naming standards (no Manager/Handler/Utils/Helper) to ensure names carry semantic weight.

### Level 1: Documentation

`@moduledoc` and `@doc` attributes provide natural-language specifications. While not mechanically verifiable, good documentation constrains interpretation and serves as the specification of record for human reviewers. The platform requires documentation for all public modules and functions.

### Level 2: Type Specifications

Elixir's `@type` and `@spec` annotations provide machine-checkable specifications of function signatures. [Dialyzer](/glossary/static-analysis/) uses these to detect type violations at compile time without runtime overhead. The platform mandates typespecs on all public functions and maintains zero Dialyzer warnings.

### Level 3: Behavioural Contracts

[Behaviours](/glossary/behaviour/) define sets of callbacks that implementing modules must provide. The compiler verifies that all required callbacks are implemented with correct arities. This is a structural contract: it guarantees interface compatibility without verifying semantic correctness.

### Level 4: Property Specifications

[Property-based testing](/glossary/property-based-testing/) specifications express universal invariants that must hold for all inputs within a domain. Properties like "encoding then decoding returns the original value" or "sorting is idempotent" are specifications that generators can verify across millions of random inputs.

### Level 5: Formal Specifications

[Lean4](/glossary/lean4/) proofs and modal logic specifications provide mathematical certainty. The platform's [Trinity Gate](/glossary/trinity-gate/) requires formal necessity for critical claims, meaning some specifications must be proven, not merely tested.

## Specification-Driven Development

Specification-driven development inverts the traditional workflow. Instead of writing code and then adding tests, the developer writes specifications first and derives implementations that satisfy them. This approach has several advantages:

1. **Clarity before complexity**: Specifications force precise thinking before implementation details obscure intent
2. **Automatic test generation**: Property specifications generate tests automatically
3. **Documentation by default**: Specifications serve as living documentation
4. **Refactoring safety**: Implementations can change freely as long as specifications are satisfied
5. **API-first design**: Interface specifications enable parallel development of consumers and producers

The Prismatic Platform's API gateway exemplifies this: [OpenAPI specifications](/glossary/openapi-spec/) are derived automatically from Elixir typespecs, and the API implementation is validated against the specification at compile time through OpenApiSpex.

## Platform Implementation in Elixir

### Multi-Level Specification System

```elixir
defmodule Prismatic.Specification do
  @moduledoc """
  Provides infrastructure for defining, composing, and verifying
  multi-level specifications across the platform. Specifications
  can be structural (types, behaviours), behavioral (properties,
  contracts), or formal (proofs, invariants).
  """

  @type spec_level :: :naming | :documentation | :typespec | :behaviour | :property | :formal
  @type verification_result :: :satisfied | {:violated, [violation()]}
  @type violation :: %{
    level: spec_level(),
    location: {module(), atom(), arity()},
    expected: String.t(),
    actual: String.t(),
    severity: :warning | :error | :critical
  }

  @type spec_definition :: %{
    module: module(),
    level: spec_level(),
    description: String.t(),
    verifiable: boolean(),
    automated: boolean(),
    verification_fn: (module() -> verification_result()) | nil
  }

  @callback specifications() :: [spec_definition()]
  @callback verify() :: verification_result()

  defmacro __using__(_opts) do
    quote do
      @behaviour Prismatic.Specification
      Module.register_attribute(__MODULE__, :specs_defined, accumulate: true)

      import Prismatic.Specification, only: [
        defspec: 2,
        defproperty: 2,
        definvariant: 2
      ]
    end
  end

  @doc "Define a named specification with verification function"
  defmacro defspec(name, opts) do
    quote do
      @specs_defined {unquote(name), unquote(opts)}
    end
  end

  @doc "Define a property specification (universal invariant)"
  defmacro defproperty(name, do: body) do
    quote do
      @specs_defined {unquote(name), %{level: :property, body: unquote(Macro.escape(body))}}

      def unquote(:"property_#{name}")(input) do
        unquote(body)
      end
    end
  end

  @doc "Define an invariant that must hold at all times"
  defmacro definvariant(name, do: body) do
    quote do
      @specs_defined {unquote(name), %{level: :formal, body: unquote(Macro.escape(body))}}

      def unquote(:"invariant_#{name}")() do
        unquote(body)
      end
    end
  end

  @spec verify_module(module()) :: verification_result()
  def verify_module(module) do
    violations =
      []
      |> check_typespecs(module)
      |> check_behaviours(module)
      |> check_documentation(module)
      |> check_naming(module)

    case violations do
      [] -> :satisfied
      _ -> {:violated, violations}
    end
  end

  defp check_typespecs(violations, module) do
    case Code.Typespec.fetch_specs(module) do
      {:ok, specs} ->
        public_fns = module.__info__(:functions)
        missing = Enum.reject(public_fns, fn {name, arity} ->
          Enum.any?(specs, fn {{n, a}, _} -> n == name and a == arity end)
        end)
        Enum.reduce(missing, violations, fn {name, arity}, acc ->
          [%{level: :typespec, location: {module, name, arity},
             expected: "@spec annotation", actual: "none found",
             severity: :error} | acc]
        end)
      :error ->
        violations
    end
  end

  defp check_behaviours(violations, module) do
    behaviours = module_behaviours(module)
    Enum.reduce(behaviours, violations, fn behaviour, acc ->
      required = behaviour.behaviour_info(:callbacks)
      implemented = module.__info__(:functions)
      missing = required -- implemented
      Enum.reduce(missing, acc, fn {name, arity}, inner_acc ->
        [%{level: :behaviour, location: {module, name, arity},
           expected: "callback implementation", actual: "missing",
           severity: :critical} | inner_acc]
      end)
    end)
  end

  defp check_documentation(violations, module) do
    case Code.fetch_docs(module) do
      {:docs_v1, _, _, _, :none, _, _} ->
        [%{level: :documentation, location: {module, nil, nil},
           expected: "@moduledoc", actual: "none",
           severity: :warning} | violations]
      {:docs_v1, _, _, _, _, _, _} ->
        violations
      _ ->
        violations
    end
  end

  defp check_naming(violations, _module), do: violations

  defp module_behaviours(module) do
    module.module_info(:attributes)
    |> Keyword.get_values(:behaviour)
    |> List.flatten()
  end
end
```

### Contract-Based Specification

```elixir
defmodule Prismatic.Specification.Contract do
  @moduledoc """
  Design-by-contract specification system. Defines preconditions,
  postconditions, and invariants that wrap function execution
  with automatic verification in development and test environments.
  """

  @type contract :: %{
    preconditions: [(term() -> boolean())],
    postconditions: [(term(), term() -> boolean())],
    invariants: [(-> boolean())]
  }

  defmacro defcontract(name, args, opts) do
    pre = Keyword.get(opts, :pre, [])
    post = Keyword.get(opts, :post, [])
    body = Keyword.fetch!(opts, :do)

    quote do
      def unquote(name)(unquote_splicing(args)) do
        if Application.get_env(:prismatic, :contracts_enabled, false) do
          # Verify preconditions
          unquote(Enum.map(pre, fn condition ->
            quote do
              unless unquote(condition) do
                raise Prismatic.Specification.PreconditionError,
                  function: unquote(name),
                  condition: unquote(Macro.to_string(condition))
              end
            end
          end))
        end

        result = unquote(body)

        if Application.get_env(:prismatic, :contracts_enabled, false) do
          # Verify postconditions
          unquote(Enum.map(post, fn condition ->
            quote do
              unless unquote(condition) do
                raise Prismatic.Specification.PostconditionError,
                  function: unquote(name),
                  condition: unquote(Macro.to_string(condition)),
                  result: result
              end
            end
          end))
        end

        result
      end
    end
  end
end

defmodule Prismatic.Specification.PreconditionError do
  defexception [:function, :condition, :message]

  @impl true
  def exception(opts) do
    msg = "Precondition violated in #{opts[:function]}: #{opts[:condition]}"
    %__MODULE__{function: opts[:function], condition: opts[:condition], message: msg}
  end
end

defmodule Prismatic.Specification.PostconditionError do
  defexception [:function, :condition, :result, :message]

  @impl true
  def exception(opts) do
    msg = "Postcondition violated in #{opts[:function]}: #{opts[:condition]}, got: #{inspect(opts[:result])}"
    %__MODULE__{function: opts[:function], condition: opts[:condition], result: opts[:result], message: msg}
  end
end
```

## Specification in API Design

The Prismatic Platform's [REST API](/glossary/rest-api/) demonstrates specification-driven API design:

1. **Typespecs define function signatures**: `@spec discover(String.t()) :: {:ok, Surface.t()} | {:error, term()}`
2. **OpenApiSpex maps specs to schemas**: The API scanner reads typespecs and generates OpenAPI 3.0 JSON schemas automatically
3. **Request validation**: Incoming requests are validated against the specification before reaching business logic
4. **Response validation**: In development, responses are validated against the specification to catch drift
5. **Documentation generation**: [Swagger UI](/glossary/swagger-ui/) is generated from the specification, ensuring docs match reality

This chain means a single typespec change propagates automatically through validation, documentation, and client SDK generation.

## Specification and Testing

Specifications and tests are complementary but distinct approaches to ensuring software correctness:

| Aspect | Specification | Test |
|--------|--------------|------|
| **Scope** | Universal (all inputs) | Specific (chosen inputs) |
| **Verification** | Static or generated | Dynamic execution |
| **Completeness** | Describes full behavior | Samples behavior |
| **Maintainability** | Changes with interface | Changes with implementation |
| **Discovery** | Defines what to test | Exercises specific scenarios |
| **Exhaustiveness** | Can be complete (formal proofs) | Always incomplete (finite examples) |
| **Feedback Speed** | Fast (compile-time) or slow (proof search) | Fast (runtime execution) |
| **Debug Information** | Often abstract | Concrete failing inputs |

### Specification-Driven Test Generation

The platform uses specifications to generate tests automatically, bridging the gap between universal specifications and concrete verification:

```elixir
defmodule Prismatic.Testing.SpecificationGenerator do
  @moduledoc """
  Generates property-based tests from typespec and behaviour specifications.
  Transforms universal specifications into concrete test cases.
  """

  import StreamData

  @spec generate_property_tests(module()) :: [{atom(), function()}]
  def generate_property_tests(module) do
    module
    |> extract_function_specs()
    |> Enum.map(&generate_property_test/1)
    |> Enum.reject(&is_nil/1)
  end

  defp extract_function_specs(module) do
    case Code.Typespec.fetch_specs(module) do
      {:ok, specs} ->
        Enum.map(specs, fn {{name, arity}, [spec]} ->
          %{module: module, name: name, arity: arity, spec: spec}
        end)
      :error ->
        []
    end
  end

  defp generate_property_test(%{name: name, spec: spec} = function_spec) do
    case parse_spec_for_generators(spec) do
      {:ok, input_generators, output_validator} ->
        property_name = :"test_property_#{name}"
        property_fn = fn ->
          ExUnit.Case.property("#{name} satisfies specification") do
            check all inputs <- input_generators do
              result = apply(function_spec.module, name, inputs)
              assert output_validator.(result),
                "Function #{name} returned #{inspect(result)} which violates specification"
            end
          end
        end
        {property_name, property_fn}

      :unsupported ->
        nil
    end
  end

  defp parse_spec_for_generators({:type, _, :fun, [{:type, _, :product, input_types}, output_type]}) do
    with {:ok, generators} <- types_to_generators(input_types),
         {:ok, validator} <- type_to_validator(output_type) do
      {:ok, generators, validator}
    else
      _ -> :unsupported
    end
  end

  defp types_to_generators(types) do
    generators = Enum.map(types, fn type ->
      case type_to_generator(type) do
        {:ok, gen} -> gen
        :unsupported -> :unsupported
      end
    end)

    if Enum.any?(generators, &(&1 == :unsupported)) do
      :unsupported
    else
      {:ok, fixed_list(generators)}
    end
  end

  defp type_to_generator({:type, _, :binary, []}) do
    {:ok, binary()}
  end

  defp type_to_generator({:type, _, :integer, []}) do
    {:ok, integer()}
  end

  defp type_to_generator({:type, _, :atom, []}) do
    {:ok, atom(:alphanumeric)}
  end

  defp type_to_generator({:remote_type, _, [{:atom, _, module}, {:atom, _, type}, []]}) do
    case {module, type} do
      {:String, :t} -> {:ok, string(:printable)}
      _ -> :unsupported
    end
  end

  defp type_to_generator(_), do: :unsupported

  defp type_to_validator({:type, _, :binary, []}) do
    {:ok, &is_binary/1}
  end

  defp type_to_validator({:remote_type, _, [{:atom, _, String}, {:atom, _, :t}, []]}) do
    {:ok, &is_binary/1}
  end

  defp type_to_validator({:type, _, :union, types}) do
    validators = Enum.map(types, fn type ->
      case type_to_validator(type) do
        {:ok, validator} -> validator
        :unsupported -> fn _ -> false end
      end
    end)

    validator = fn value ->
      Enum.any?(validators, fn v -> v.(value) end)
    end

    {:ok, validator}
  end

  defp type_to_validator(_), do: :unsupported
end
```

The platform uses specifications to generate tests automatically. Property-based testing frameworks (StreamData in Elixir) take property specifications and generate thousands of test cases, combining the universality of specifications with the concrete verification of tests. This approach catches edge cases that manual testing often misses while providing concrete counterexamples when specifications are violated.

## Specification Quality Metrics

The platform tracks specification quality across multiple dimensions:

| Metric | Target | Current |
|--------|--------|---------|
| **Typespec coverage** | 100% public functions | 100% (enforced) |
| **Behaviour compliance** | 100% callbacks implemented | 100% (compiler-enforced) |
| **Documentation coverage** | 100% public modules | 100% (enforced by quality gates) |
| **Property test coverage** | Critical paths covered | Growing |
| **OpenAPI spec coverage** | All API endpoints | 100% (auto-generated) |
| **Formal proof coverage** | Trinity Gate claims | Active |

## Specification Maintenance

Specifications that diverge from implementation are worse than no specifications -- they create false confidence. The platform prevents specification drift through:

1. **Compile-time enforcement**: Dialyzer catches typespec violations, the compiler catches missing behaviour callbacks
2. **Runtime validation**: OpenApiSpex validates requests and responses against specifications
3. **CI/CD gates**: [Quality gates](/glossary/quality-gates/) block merges with specification violations
4. **Auto-generation**: Where possible, specifications are derived from code (typespecs to OpenAPI) rather than maintained separately

## Common Specification Patterns

### The Result Specification

The platform standardizes on the `{:ok, value} | {:error, reason}` pattern for all operations that can fail. This is a specification that applies universally and enables pattern matching at call sites:

```elixir
@spec fetch_entity(String.t()) :: {:ok, Entity.t()} | {:error, :not_found | :unauthorized}
```

### The Behaviour Specification

For pluggable components, behaviours specify the full interface:

```elixir
@callback init(keyword()) :: {:ok, state()} | {:error, term()}
@callback handle(request(), state()) :: {:reply, response(), state()}
@callback terminate(reason(), state()) :: :ok
```

### The Schema Specification

For data structures, Ecto schemas and embedded schemas provide structural specifications:

```elixir
embedded_schema do
  field :name, :string
  field :score, :float
  field :status, Ecto.Enum, values: [:active, :inactive, :pending]
end
```

### The Property Specification

For behavioral invariants, property specifications express universal truths:

```elixir
property "encoding roundtrips" do
  check all data <- term_generator() do
    assert data == decode(encode(data))
  end
end
```

## Challenges in Specification

### Specification Completeness

No specification captures all requirements. There is always a gap between what the specification says and what stakeholders actually need. The platform addresses this through layered specifications -- each level catches issues that lower levels miss. However, even comprehensive specifications may miss:

- **Emergent behavior**: Interactions between components that individually meet their specifications but produce unexpected system behavior
- **Non-functional requirements**: Performance, scalability, usability concerns that are hard to specify formally
- **Context-dependent behavior**: Requirements that vary based on deployment environment, user role, or external conditions
- **Implicit assumptions**: Unspoken requirements that stakeholders consider "obvious" but aren't captured in specifications

The platform mitigates completeness gaps through:

```elixir
defmodule Prismatic.Specification.CompletenessAnalyzer do
  @moduledoc """
  Analyzes specification coverage and identifies potential gaps.
  Uses static analysis and runtime monitoring to detect underspecified areas.
  """

  def analyze_specification_gaps(module) do
    %{
      unspecified_functions: find_unspecified_functions(module),
      error_cases_missing: find_missing_error_specs(module),
      side_effects_undocumented: find_undocumented_side_effects(module),
      performance_constraints_missing: find_missing_performance_specs(module),
      interaction_patterns_unspecified: find_missing_interaction_specs(module)
    }
  end

  defp find_unspecified_functions(module) do
    public_functions = module.__info__(:functions)
    specs = case Code.Typespec.fetch_specs(module) do
      {:ok, specs} -> Enum.map(specs, fn {{name, arity}, _} -> {name, arity} end)
      :error -> []
    end

    public_functions -- specs
  end

  defp find_missing_error_specs(module) do
    case Code.Typespec.fetch_specs(module) do
      {:ok, specs} ->
        Enum.filter(specs, fn {{name, arity}, [spec]} ->
          not has_error_return_type?(spec)
        end)
        |> Enum.map(fn {{name, arity}, _} -> {name, arity} end)
      :error ->
        []
    end
  end

  defp has_error_return_type?({:type, _, :union, types}) do
    Enum.any?(types, fn
      {:type, _, :tuple, [{:atom, _, :error}, _]} -> true
      _ -> false
    end)
  end

  defp has_error_return_type?(_), do: false
end
```

### Specification Cost

Writing and maintaining specifications requires effort. The platform minimizes this cost through auto-generation (typespecs to OpenAPI), shared contracts (reusable behaviour definitions), and tooling that makes specification writing as natural as coding. However, specification costs include:

- **Initial specification effort**: Time to write comprehensive specifications upfront
- **Maintenance overhead**: Keeping specifications synchronized with evolving requirements
- **Learning curve**: Team members need to understand specification languages and tools
- **Tool complexity**: Specification tools may have their own bugs and limitations
- **False confidence**: Poor specifications can be worse than no specifications

Cost mitigation strategies:

- **Incremental specification**: Start with core contracts, expand coverage over time
- **Template reuse**: Common specification patterns (CRUD operations, API endpoints) use templates
- **Tooling integration**: IDE support, linters, and formatters reduce specification friction
- **Automated derivation**: Generate lower-level specifications from higher-level ones where possible

### Over-Specification

Specifications that are too tight constrain implementation unnecessarily. The art of specification is specifying enough to prevent defects without preventing valid implementations. The platform favors behavioral specifications (what it does) over structural specifications (how it does it). Over-specification manifests as:

- **Implementation coupling**: Specifications that describe implementation details rather than interface contracts
- **Premature optimization**: Performance specifications that constrain valid optimizations
- **Inflexibility**: Specifications that prevent beneficial refactoring or alternative approaches
- **Maintenance burden**: Overly detailed specifications that change frequently with implementation details

The platform addresses over-specification through:

```elixir
defmodule Prismatic.Specification.FlexibilityGuide do
  @moduledoc """
  Guidelines for writing flexible, maintainable specifications.
  Balances constraint with implementation freedom.
  """

  # Good: Behavioral specification
  @spec process_payment(amount :: Money.t(), method :: PaymentMethod.t()) ::
    {:ok, Receipt.t()} | {:error, :insufficient_funds | :invalid_method | :network_error}

  # Bad: Over-specified (constrains implementation)
  # @spec process_payment_via_stripe_api_v3_using_cached_connection(...)

  # Good: Interface specification
  @callback handle_request(Request.t()) :: Response.t()

  # Bad: Implementation specification
  # @callback handle_request_by_validating_then_processing_then_logging(...)

  # Specification flexibility principles:
  @flexibility_principles [
    "Specify what, not how",
    "Constrain behavior, not implementation",
    "Leave optimization opportunities open",
    "Focus on essential invariants",
    "Enable multiple valid implementations"
  ]

  def validate_specification_flexibility(spec) do
    warnings = []

    warnings = if contains_implementation_details?(spec) do
      ["Specification contains implementation details" | warnings]
    else
      warnings
    end

    warnings = if overly_constrains_performance?(spec) do
      ["Specification may overconstrain performance" | warnings]
    else
      warnings
    end

    case warnings do
      [] -> {:ok, :flexible}
      warnings -> {:warning, warnings}
    end
  end

  defp contains_implementation_details?(spec) do
    # Heuristic: Look for implementation-specific terms in specifications
    impl_keywords = ["via", "using", "by_calling", "through", "cache", "database", "api"]
    spec_string = Macro.to_string(spec)

    Enum.any?(impl_keywords, fn keyword ->
      String.contains?(String.downcase(spec_string), keyword)
    end)
  end

  defp overly_constrains_performance?(spec) do
    # Check for very specific performance requirements that might prevent optimization
    perf_patterns = [~r/\d+ms/, ~r/O\(\w+\)/, ~r/exactly \d+/]
    spec_string = Macro.to_string(spec)

    Enum.any?(perf_patterns, fn pattern ->
      Regex.match?(pattern, spec_string)
    end)
  end
end
```

### Specification Evolution

Specifications must evolve with requirements, but changes can break existing implementations and consumers. The platform handles specification evolution through:

- **Versioning strategies**: Semantic versioning for breaking vs. non-breaking specification changes
- **Deprecation paths**: Gradual migration from old to new specifications
- **Backward compatibility**: Maintaining support for multiple specification versions during transitions
- **Impact analysis**: Tooling to identify what breaks when specifications change

## Advanced Specification Techniques

### Compositional Specifications

Complex systems require specifications that can be composed and reasoned about modularly. The platform supports compositional specification through several mechanisms:

```elixir
defmodule Prismatic.Specification.Composition do
  @moduledoc """
  Compositional specification system allowing complex specifications to be built
  from simpler, well-understood parts.
  """

  @type composed_spec :: %{
    name: String.t(),
    components: [component_spec()],
    composition_rules: [composition_rule()],
    verification_strategy: :sequential | :parallel | :hierarchical
  }

  @type component_spec :: %{
    name: String.t(),
    interface: module(),
    properties: [property()]
  }

  @type composition_rule :: %{
    rule_type: :before | :after | :around | :concurrent,
    components: [String.t()],
    constraint: (term() -> boolean())
  }

  @doc """
  Compose multiple component specifications into a system specification
  """
  def compose(specs, composition_rules) do
    # Verify compatibility between component interfaces
    with :ok <- verify_interface_compatibility(specs),
         :ok <- verify_composition_rules(specs, composition_rules),
         {:ok, combined} <- merge_specifications(specs, composition_rules) do
      {:ok, combined}
    else
      {:error, reason} -> {:error, {:composition_failed, reason}}
    end
  end

  defp verify_interface_compatibility(specs) do
    # Check that output types of one component match input types of dependent components
    dependency_graph = build_dependency_graph(specs)

    case detect_type_mismatches(dependency_graph) do
      [] -> :ok
      mismatches -> {:error, {:type_mismatches, mismatches}}
    end
  end

  defp build_dependency_graph(specs) do
    for spec <- specs do
      dependencies = extract_dependencies(spec)
      {spec.name, dependencies}
    end
    |> Enum.into(%{})
  end
end
```

### Temporal Specifications

For systems that evolve over time, specifications must capture temporal properties:

```elixir
defmodule Prismatic.Specification.Temporal do
  @moduledoc """
  Temporal specification system for properties that hold over time,
  state transitions, and lifecycle constraints.
  """

  @type temporal_property :: %{
    name: String.t(),
    property_type: :always | :eventually | :until | :since,
    condition: (state() -> boolean()),
    time_bound: pos_integer() | :infinity
  }

  defmacro always(condition) do
    quote do
      %{
        property_type: :always,
        condition: fn state -> unquote(condition) end,
        time_bound: :infinity
      }
    end
  end

  defmacro eventually(condition, opts \\ []) do
    timeout = Keyword.get(opts, :within, :infinity)
    quote do
      %{
        property_type: :eventually,
        condition: fn state -> unquote(condition) end,
        time_bound: unquote(timeout)
      }
    end
  end

  # Example usage in a GenServer specification
  defmodule StateTransitionSpec do
    use Prismatic.Specification.Temporal

    # Specify that a process always responds to ping with pong
    defproperty :responsiveness do
      always(fn state ->
        case GenServer.call(state.pid, :ping, 1000) do
          :pong -> true
          _ -> false
        end
      end)
    end

    # Specify that initialization completes within 5 seconds
    defproperty :initialization do
      eventually(fn state ->
        state.status == :initialized
      end, within: 5000)
    end
  end
end
```

### Probabilistic Specifications

Some systems have inherent uncertainty that must be captured in specifications:

```elixir
defmodule Prismatic.Specification.Probabilistic do
  @moduledoc """
  Probabilistic specification system for systems with inherent uncertainty,
  such as machine learning models, network operations, or distributed systems.
  """

  @type probability_spec :: %{
    event: String.t(),
    probability: float(),
    confidence_interval: {float(), float()},
    sample_size: pos_integer()
  }

  defmacro with_probability(prob, condition) do
    quote do
      %{
        event: unquote(Macro.to_string(condition)),
        probability: unquote(prob),
        condition: fn input -> unquote(condition) end
      }
    end
  end

  # Example: ML model accuracy specification
  defmodule ModelAccuracySpec do
    use Prismatic.Specification.Probabilistic

    defproperty :classification_accuracy do
      with_probability(0.95, fn {input, expected_output} ->
        predicted = MyModel.classify(input)
        predicted == expected_output
      end)
    end

    defproperty :response_time do
      with_probability(0.99, fn input ->
        {time, _result} = :timer.tc(MyModel, :classify, [input])
        time < 100_000  # 100ms in microseconds
      end)
    end
  end
end
```

## Specification Evolution and Versioning

Specifications must evolve as systems grow and requirements change:

```elixir
defmodule Prismatic.Specification.Evolution do
  @moduledoc """
  Handles evolution and versioning of specifications, ensuring backward
  compatibility and migration paths between specification versions.
  """

  @type spec_version :: %{
    major: non_neg_integer(),
    minor: non_neg_integer(),
    patch: non_neg_integer(),
    changes: [change()]
  }

  @type change :: %{
    type: :addition | :modification | :deprecation | :removal,
    component: String.t(),
    description: String.t(),
    breaking: boolean(),
    migration_guide: String.t()
  }

  def evolve_specification(current_spec, changes) do
    with {:ok, new_version} <- calculate_version_bump(current_spec.version, changes),
         {:ok, evolved_spec} <- apply_changes(current_spec, changes),
         {:ok, migration} <- generate_migration_guide(current_spec, evolved_spec) do
      {:ok, %{evolved_spec | version: new_version}, migration}
    end
  end

  defp calculate_version_bump(current_version, changes) do
    breaking_changes = Enum.any?(changes, & &1.breaking)

    new_version = cond do
      breaking_changes ->
        %{current_version | major: current_version.major + 1, minor: 0, patch: 0}

      Enum.any?(changes, & &1.type == :addition) ->
        %{current_version | minor: current_version.minor + 1, patch: 0}

      true ->
        %{current_version | patch: current_version.patch + 1}
    end

    {:ok, new_version}
  end

  def compatibility_check(spec_v1, spec_v2) do
    changes = diff_specifications(spec_v1, spec_v2)
    breaking_changes = Enum.filter(changes, & &1.breaking)

    compatibility_level = cond do
      Enum.empty?(breaking_changes) -> :fully_compatible
      length(breaking_changes) < 3 -> :mostly_compatible
      true -> :incompatible
    end

    %{
      compatibility: compatibility_level,
      breaking_changes: breaking_changes,
      migration_required: compatibility_level == :incompatible
    }
  end
end
```

## Specification-Based Code Generation

Specifications can drive automatic code generation, reducing boilerplate and ensuring consistency:

```elixir
defmodule Prismatic.Specification.Codegen do
  @moduledoc """
  Code generation from specifications. Generates boilerplate implementations,
  test scaffolding, and documentation from specification definitions.
  """

  def generate_from_behaviour(behaviour_module) do
    callbacks = behaviour_module.behaviour_info(:callbacks)

    implementation_template = for {name, arity} <- callbacks do
      generate_callback_stub(behaviour_module, name, arity)
    end

    test_template = for {name, arity} <- callbacks do
      generate_callback_test(behaviour_module, name, arity)
    end

    %{
      implementation: implementation_template,
      tests: test_template,
      documentation: generate_callback_docs(behaviour_module, callbacks)
    }
  end

  defp generate_callback_stub(behaviour, name, arity) do
    args = for i <- 1..arity, do: :"arg#{i}"

    quote do
      @impl unquote(behaviour)
      def unquote(name)(unquote_splicing(args)) do
        # TODO: Implement #{unquote(name)}/#{unquote(arity)}
        {:error, :not_implemented}
      end
    end
  end

  defp generate_callback_test(behaviour, name, arity) do
    quote do
      test "#{unquote(name)}/#{unquote(arity)} callback" do
        # TODO: Add meaningful test for #{unquote(name)}/#{unquote(arity)}
        assert {:error, :not_implemented} = MyModule.unquote(name)(test_args())
      end
    end
  end

  def generate_property_tests(properties) do
    for property <- properties do
      quote do
        property unquote("#{property.name} property") do
          check all input <- unquote(property.generator) do
            assert unquote(property.condition).(input)
          end
        end
      end
    end
  end
end
```

## Integration with External Systems

Specifications enable safe integration with external systems by making assumptions explicit:

```elixir
defmodule Prismatic.Specification.External do
  @moduledoc """
  Specifications for external system integrations, including API contracts,
  data format assumptions, and failure mode specifications.
  """

  @type external_spec :: %{
    system_name: String.t(),
    api_version: String.t(),
    base_url: String.t(),
    authentication: auth_spec(),
    endpoints: [endpoint_spec()],
    error_handling: error_spec(),
    rate_limits: rate_limit_spec()
  }

  @type endpoint_spec :: %{
    path: String.t(),
    method: :get | :post | :put | :delete,
    request_schema: map(),
    response_schema: map(),
    error_codes: [integer()],
    timeout_ms: pos_integer()
  }

  def validate_external_integration(spec, actual_responses) do
    validation_results = for response <- actual_responses do
      validate_response_against_spec(response, spec)
    end

    successful = Enum.count(validation_results, &(&1 == :ok))
    total = length(validation_results)

    compliance_rate = successful / total

    %{
      compliance_rate: compliance_rate,
      passing_validations: successful,
      total_validations: total,
      specification_drift: compliance_rate < 0.95
    }
  end

  # Example: Shodan API specification
  def shodan_api_spec do
    %{
      system_name: "Shodan",
      api_version: "1.0",
      base_url: "https://api.shodan.io",
      authentication: %{type: :api_key, header: "Authorization"},
      endpoints: [
        %{
          path: "/shodan/host/{ip}",
          method: :get,
          request_schema: %{ip: {:string, :required}},
          response_schema: %{
            ip: {:string, :required},
            ports: {:array, :required, item_type: :integer},
            hostnames: {:array, :optional, item_type: :string}
          },
          error_codes: [401, 404, 429, 500],
          timeout_ms: 10_000
        }
      ]
    }
  end
end
```

## Related Concepts

- [Typespec](/glossary/typespec/) -- Elixir's type specification system for static analysis
- [Behaviour](/glossary/behaviour/) -- Callback contract specifications for pluggable modules
- [OpenAPI Spec](/glossary/openapi-spec/) -- REST API specification standard
- [Property-Based Testing](/glossary/property-based-testing/) -- Testing specifications with generated inputs
- [Quality Gate](/glossary/quality-gate/) -- Enforcement checkpoints for specification compliance
- [Validation](/glossary/validation/) -- Runtime checking of data against specifications
- [Schema](/glossary/schema/) -- Data structure specifications
- [Trinity Gate](/glossary/trinity-gate/) -- Multi-layer verification requiring formal specifications

See the Glossary index for the complete taxonomy of platform concepts.

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
