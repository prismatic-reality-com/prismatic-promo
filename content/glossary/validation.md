+++
title = "Validation"
weight = 50
[extra]
description = "The process of checking whether data, outputs, or system states meet specified requirements and constraints, encompassing Ecto changeset validation, NABLA axiom enforcement, and Trinity Gate verification"
category = "quality"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate"
domain_category = "data-integrity"
related_concepts = ["verification", "formal-verification", "property-based-testing", "quality-gate", "trinity-gate"]
implementation_status = "production"
authority_level = "platform-wide"
difficulty_rating = 5
prerequisites = ["ecto", "quality-gate", "testing"]
learning_path = ["ecto", "validation", "verification", "formal-verification", "property-based-testing", "trinity-gate"]
interactive_demos = ["/labs/glossary/validation"]
code_examples = ["Ecto.Changeset", "PrismaticSafety.Validation.Pipeline", "PrismaticClaude.Nabla.AxiomValidator", "PrismaticSafety.QualityGate"]
external_resources = ["https://hexdocs.pm/ecto/Ecto.Changeset.html", "https://www.w3.org/TR/xmlschema-2/#rf-validation"]
version_introduced = "0.3.0"
stability_level = "stable"
testing_scenarios = ["changeset-validation", "schema-validation", "axiom-compliance-check", "trinity-gate-passage", "input-sanitization", "boundary-value-testing"]
keywords = ["validation", "data validation", "input validation", "schema validation", "changeset", "constraint", "invariant", "precondition", "postcondition"]
tags = ["glossary", "quality", "validation", "data-integrity", "ecto", "testing"]
related_terms = ["verification", "formal-verification", "property-based-testing", "quality-gate", "trinity-gate", "epistemic-validation", "ecto", "quality-gates", "security-assessment", "testing", "zero-tolerance", "assertion"]
word_count = 1348
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Validation - Prismatic Platform"
+++

## Definition

Validation is the process of checking whether data, outputs, or system states meet specified requirements, constraints, and expectations. In software engineering, validation answers the question "Are we building the right thing?" -- confirming that the system's behavior aligns with user needs and business requirements. This contrasts with [verification](@/glossary/verification.md), which asks "Are we building the thing right?" -- confirming that the implementation correctly follows the specification.

In the Prismatic Platform, validation operates at multiple layers: data validation through [Ecto](@/glossary/ecto.md) changesets ensures database integrity, input validation prevents injection attacks and malformed data, NABLA axiom validation enforces epistemic correctness, and [Trinity Gate](@/glossary/trinity-gate.md) validation ensures claims pass structural, logical, and formal checks before being established as platform truth.

## Overview

Validation is one of the most fundamental operations in reliable software systems. Every piece of data entering a system, every state transition, and every output produced must be validated against its expected constraints. Failure to validate leads to data corruption, security vulnerabilities, incorrect business decisions, and cascading system failures.

The principle of "validate early, fail fast" is central to robust system design. Data should be validated at the point of entry -- at API boundaries, user input handlers, message queue consumers, and database operations. Invalid data detected early produces clear error messages and prevents corrupted data from propagating through the system where it becomes harder to diagnose and more expensive to fix.

### Validation vs Verification vs Testing

| Concept | Question | Scope | Timing |
|---------|----------|-------|--------|
| **Validation** | "Does this meet requirements?" | Requirements conformance | Runtime + design time |
| **[Verification](@/glossary/verification.md)** | "Does this match the spec?" | Specification conformance | Build time + formal proofs |
| **Testing** | "Does this work correctly?" | Behavioral correctness | Development + CI/CD |
| **[Formal Verification](@/glossary/formal-verification.md)** | "Is this mathematically proven?" | Logical proof | Design time |

### Types of Validation

**Syntactic Validation**: Checks that data conforms to expected format, type, and structure. Examples include type checking, regex pattern matching, JSON schema validation, and XML DTD validation.

**Semantic Validation**: Checks that data is meaningful and consistent within the business domain. Examples include verifying that a date of birth is in the past, that an order total matches line items, and that a referenced entity exists.

**Cross-Field Validation**: Checks relationships between multiple fields. Examples include verifying that end_date is after start_date, that password_confirmation matches password, and that billing address country matches payment currency.

**Business Rule Validation**: Checks that operations comply with business rules and policies. Examples include order amount limits, inventory availability, compliance thresholds, and access control policies.

**Epistemic Validation**: Checks that claims and beliefs meet epistemological standards -- a concept unique to platforms implementing formal epistemic frameworks like Prismatic's NABLA system. This includes signal plurality (multiple independent sources), provenance tracking, and contradiction preservation.

## Technical Details

### Ecto Changeset Validation

Elixir's Ecto library provides the primary validation mechanism for database-bound data in the Prismatic Platform. Changesets are data structures that track changes, validate them against constraints, and produce clear error messages:

```elixir
defmodule PrismaticPerimeter.Asset do
  @moduledoc """
  Asset schema with comprehensive validation.
  Demonstrates Ecto changeset validation patterns.
  """

  use Ecto.Schema
  import Ecto.Changeset

  @type t :: %__MODULE__{
    id: Ecto.UUID.t(),
    domain: String.t(),
    asset_type: String.t(),
    risk_score: float(),
    last_scanned: DateTime.t() | nil,
    status: String.t()
  }

  @primary_key {:id, :binary_id, autogenerate: true}
  schema "assets" do
    field :domain, :string
    field :asset_type, :string
    field :risk_score, :float, default: 0.0
    field :last_scanned, :utc_datetime
    field :status, :string, default: "active"
    timestamps(type: :utc_datetime)
  end

  @valid_asset_types ~w(domain ip certificate cloud_resource service)
  @valid_statuses ~w(active inactive monitoring archived)

  @spec changeset(t() | Ecto.Changeset.t(), map()) :: Ecto.Changeset.t()
  def changeset(asset, attrs) do
    asset
    |> cast(attrs, [:domain, :asset_type, :risk_score, :last_scanned, :status])
    |> validate_required([:domain, :asset_type])
    |> validate_inclusion(:asset_type, @valid_asset_types)
    |> validate_inclusion(:status, @valid_statuses)
    |> validate_number(:risk_score, greater_than_or_equal_to: 0.0, less_than_or_equal_to: 100.0)
    |> validate_domain_format()
    |> validate_scan_date_not_future()
    |> unique_constraint(:domain, name: :assets_domain_asset_type_index)
  end

  @spec validate_domain_format(Ecto.Changeset.t()) :: Ecto.Changeset.t()
  defp validate_domain_format(changeset) do
    validate_change(changeset, :domain, fn :domain, domain ->
      if String.match?(domain, ~r/^[a-zA-Z0-9][a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}$/) do
        []
      else
        [domain: "must be a valid domain name"]
      end
    end)
  end

  @spec validate_scan_date_not_future(Ecto.Changeset.t()) :: Ecto.Changeset.t()
  defp validate_scan_date_not_future(changeset) do
    validate_change(changeset, :last_scanned, fn :last_scanned, date ->
      if DateTime.compare(date, DateTime.utc_now()) == :gt do
        [last_scanned: "cannot be in the future"]
      else
        []
      end
    end)
  end
end
```

### Validation Pipeline Pattern

The Prismatic Platform uses a validation pipeline pattern for complex multi-step validation:

```elixir
defmodule PrismaticSafety.Validation.Pipeline do
  @moduledoc """
  Composable validation pipeline for complex multi-step
  validation workflows. Each step can halt the pipeline
  on failure or continue with accumulated context.
  """

  @type validation_step :: (map() -> {:ok, map()} | {:error, term()})
  @type pipeline_result :: {:ok, map()} | {:error, [term()]}

  @spec run(map(), [validation_step()]) :: pipeline_result()
  def run(input, steps) do
    Enum.reduce_while(steps, {:ok, input, []}, fn step, {:ok, data, errors} ->
      case step.(data) do
        {:ok, updated_data} ->
          {:cont, {:ok, updated_data, errors}}

        {:error, error} ->
          {:halt, {:error, [error | errors]}}

        {:warn, updated_data, warning} ->
          {:cont, {:ok, Map.update(updated_data, :warnings, [warning], &[warning | &1]), errors}}
      end
    end)
    |> case do
      {:ok, data, []} -> {:ok, data}
      {:ok, data, _errors} -> {:ok, data}
      {:error, errors} -> {:error, Enum.reverse(errors)}
    end
  end

  @spec validate_required_fields(map(), [atom()]) :: {:ok, map()} | {:error, term()}
  def validate_required_fields(data, fields) do
    missing = Enum.filter(fields, fn field -> is_nil(Map.get(data, field)) end)

    case missing do
      [] -> {:ok, data}
      fields -> {:error, {:missing_required_fields, fields}}
    end
  end

  @spec validate_type(map(), atom(), atom()) :: {:ok, map()} | {:error, term()}
  def validate_type(data, field, expected_type) do
    value = Map.get(data, field)

    if matches_type?(value, expected_type) do
      {:ok, data}
    else
      {:error, {:type_mismatch, field, expected_type, type_of(value)}}
    end
  end

  @spec validate_range(map(), atom(), number(), number()) :: {:ok, map()} | {:error, term()}
  def validate_range(data, field, min, max) do
    value = Map.get(data, field)

    cond do
      is_nil(value) -> {:ok, data}
      value < min -> {:error, {:below_minimum, field, min, value}}
      value > max -> {:error, {:above_maximum, field, max, value}}
      true -> {:ok, data}
    end
  end
end
```

### NABLA Axiom Validation

The Prismatic Platform's NABLA epistemic framework enforces validation of beliefs and claims against seven non-negotiable axioms:

```elixir
defmodule PrismaticClaude.Nabla.AxiomValidator do
  @moduledoc """
  Validates claims against NABLA epistemic axioms.
  Every claim entering the belief system must pass
  axiom validation before being accepted.
  """

  @type axiom :: :signal_plurality | :contradiction_preservation | :absence_informative
               | :time_decay | :unknown_valid | :source_independence | :provenance_mandatory

  @type validation_result :: %{
    claim: String.t(),
    axiom_results: %{axiom() => :pass | :fail | :warn},
    overall: :pass | :fail,
    violations: [violation()],
    confidence: float()
  }

  @type violation :: %{
    axiom: axiom(),
    severity: :hard | :soft,
    message: String.t()
  }

  @hard_axioms [:signal_plurality, :contradiction_preservation, :time_decay,
                :unknown_valid, :provenance_mandatory]
  @soft_axioms [:absence_informative, :source_independence]

  @spec validate(map()) :: {:ok, validation_result()} | {:error, validation_result()}
  def validate(claim) do
    axiom_results =
      (@hard_axioms ++ @soft_axioms)
      |> Enum.map(fn axiom -> {axiom, check_axiom(axiom, claim)} end)
      |> Map.new()

    violations =
      axiom_results
      |> Enum.filter(fn {_axiom, result} -> result != :pass end)
      |> Enum.map(fn {axiom, _result} ->
        %{
          axiom: axiom,
          severity: if(axiom in @hard_axioms, do: :hard, else: :soft),
          message: violation_message(axiom)
        }
      end)

    hard_failures = Enum.any?(violations, &(&1.severity == :hard))

    result = %{
      claim: claim.statement,
      axiom_results: axiom_results,
      overall: if(hard_failures, do: :fail, else: :pass),
      violations: violations,
      confidence: calculate_confidence(axiom_results)
    }

    if hard_failures, do: {:error, result}, else: {:ok, result}
  end

  @spec check_axiom(:signal_plurality, map()) :: :pass | :fail
  defp check_axiom(:signal_plurality, claim) do
    if length(claim.signals || []) >= 2, do: :pass, else: :fail
  end

  defp check_axiom(:provenance_mandatory, claim) do
    if claim.provenance != nil and claim.provenance != "", do: :pass, else: :fail
  end

  defp check_axiom(:time_decay, claim) do
    if claim.timestamp != nil, do: :pass, else: :fail
  end

  defp check_axiom(:contradiction_preservation, claim) do
    if claim[:contradictions_acknowledged] != false, do: :pass, else: :fail
  end

  defp check_axiom(:unknown_valid, claim) do
    if claim[:uncertainty_acknowledged] != false, do: :pass, else: :fail
  end

  defp check_axiom(:source_independence, claim) do
    sources = claim.signals |> Enum.map(& &1.source) |> Enum.uniq()
    if length(sources) >= 2, do: :pass, else: :warn
  end

  defp check_axiom(:absence_informative, claim) do
    if Map.has_key?(claim, :absent_signals), do: :pass, else: :warn
  end
end
```

### Quality Gate Validation

```elixir
defmodule PrismaticSafety.QualityGate do
  @moduledoc """
  Quality gate validation ensuring code changes meet
  platform quality standards before merge.
  """

  @type gate_check :: :compilation | :credo | :dialyzer | :tests | :coverage
                    | :forbidden_patterns | :performance | :security
  @type gate_result :: %{
    check: gate_check(),
    status: :pass | :fail | :skip,
    duration_ms: non_neg_integer(),
    details: String.t()
  }

  @spec run_all_gates(keyword()) :: {:ok, [gate_result()]} | {:error, [gate_result()]}
  def run_all_gates(opts \\ []) do
    gates = [
      &check_compilation/1,
      &check_credo/1,
      &check_dialyzer/1,
      &check_tests/1,
      &check_coverage/1,
      &check_forbidden_patterns/1
    ]

    results = Enum.map(gates, fn gate -> gate.(opts) end)
    failures = Enum.filter(results, &(&1.status == :fail))

    if Enum.empty?(failures) do
      {:ok, results}
    else
      {:error, results}
    end
  end

  @spec check_compilation(keyword()) :: gate_result()
  defp check_compilation(_opts) do
    start = System.monotonic_time(:millisecond)
    {output, exit_code} = System.cmd("mix", ["compile", "--warnings-as-errors", "--force"])
    duration = System.monotonic_time(:millisecond) - start

    %{
      check: :compilation,
      status: if(exit_code == 0, do: :pass, else: :fail),
      duration_ms: duration,
      details: if(exit_code == 0, do: "Zero warnings", else: output)
    }
  end

  @spec check_credo(keyword()) :: gate_result()
  defp check_credo(_opts) do
    start = System.monotonic_time(:millisecond)
    {output, exit_code} = System.cmd("mix", ["credo", "--strict"])
    duration = System.monotonic_time(:millisecond) - start

    %{
      check: :credo,
      status: if(exit_code == 0, do: :pass, else: :fail),
      duration_ms: duration,
      details: if(exit_code == 0, do: "All checks pass", else: output)
    }
  end
end
```

## Implementation in Prismatic Platform

### Multi-Layer Validation Architecture

The Prismatic Platform implements validation at every system boundary:

| Layer | Validation Type | Mechanism | Example |
|-------|----------------|-----------|---------|
| **HTTP Input** | Request validation | Plug pipeline, parameter casting | API request body schema |
| **LiveView** | Form validation | Changeset-driven forms | Asset creation form |
| **Business Logic** | Domain validation | Context functions with changesets | Compliance score thresholds |
| **Database** | Constraint validation | [Ecto](@/glossary/ecto.md) constraints, DB constraints | Unique domain, foreign keys |
| **Epistemic** | Axiom validation | NABLA axiom checker | Signal plurality, provenance |
| **Quality** | Gate validation | [Quality gates](@/glossary/quality-gates.md) pipeline | Compilation, Credo, Dialyzer |
| **Trinity** | Formal validation | [Trinity Gate](@/glossary/trinity-gate.md) | Structural, logical, formal |

### Input Validation for Security

Input [validation](@/glossary/validation.md) is the first line of defense against injection attacks, XSS, and data corruption:

```elixir
defmodule PrismaticWeb.InputValidator do
  @moduledoc """
  Input validation utilities for web requests.
  Sanitizes and validates all external input.
  """

  @spec validate_domain(String.t()) :: {:ok, String.t()} | {:error, String.t()}
  def validate_domain(domain) when is_binary(domain) do
    domain = String.trim(domain) |> String.downcase()

    cond do
      String.length(domain) > 253 ->
        {:error, "Domain name exceeds maximum length of 253 characters"}

      not String.match?(domain, ~r/^[a-z0-9][a-z0-9\-\.]+\.[a-z]{2,}$/) ->
        {:error, "Invalid domain name format"}

      String.contains?(domain, "..") ->
        {:error, "Domain name contains consecutive dots"}

      true ->
        {:ok, domain}
    end
  end

  def validate_domain(_), do: {:error, "Domain must be a string"}

  @spec validate_email(String.t()) :: {:ok, String.t()} | {:error, String.t()}
  def validate_email(email) when is_binary(email) do
    email = String.trim(email) |> String.downcase()

    if String.match?(email, ~r/^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/) do
      {:ok, email}
    else
      {:error, "Invalid email format"}
    end
  end

  def validate_email(_), do: {:error, "Email must be a string"}

  @spec sanitize_html(String.t()) :: String.t()
  def sanitize_html(input) when is_binary(input) do
    input
    |> String.replace(~r/<script[^>]*>.*?<\/script>/is, "")
    |> String.replace(~r/<[^>]+>/, "")
    |> HtmlEntities.encode()
  end
end
```

## Comparison with Alternatives

| Approach | Timing | Strength | Weakness |
|----------|--------|----------|----------|
| **Ecto Changesets** | Runtime (data mutation) | Type-safe, composable, clear errors | Database-specific |
| **JSON Schema** | Runtime (API input) | Language-agnostic, widely supported | Verbose, limited logic |
| **[Property-Based Testing](@/glossary/property-based-testing.md)** | Test time | Exhaustive edge case discovery | Not runtime validation |
| **[Formal Verification](@/glossary/formal-verification.md)** | Design/build time | Mathematical proof | High effort, limited scope |
| **Contract Testing** | Integration test time | API boundary validation | Does not cover all inputs |
| **Type Systems (Dialyzer)** | Compile time | Static type checking | Cannot validate runtime data |

Prismatic combines all these approaches in a layered strategy: Dialyzer catches type errors at compile time, Ecto changesets validate data at runtime, property-based testing validates invariants during testing, and the [Trinity Gate](@/glossary/trinity-gate.md) provides formal verification for critical claims.

## Best Practices

1. **Validate at the boundary**: All external input must be validated at the point of entry into the system. Never trust data from HTTP requests, message queues, file uploads, or third-party APIs.

2. **Use Ecto changesets idiomatically**: Build changesets that combine casting, validation, and constraint checks in a single composable pipeline. Return `{:ok, struct}` or `{:error, changeset}` from context functions.

3. **Fail fast with clear errors**: Invalid data should produce immediate, specific error messages that help the caller understand what is wrong and how to fix it. Never silently coerce invalid data.

4. **Separate validation from persistence**: Validation logic should be testable independently of database operations. Use `Ecto.Changeset.apply_action/2` to validate without inserting.

5. **Layer validation defense in depth**: Combine client-side validation (UX), server-side validation (security), database constraints (integrity), and business rule validation (correctness) for comprehensive coverage.

6. **Test validation boundaries exhaustively**: Use [property-based testing](@/glossary/property-based-testing.md) to generate random inputs and verify that validation correctly accepts valid data and rejects invalid data across the full input space.

7. **Document validation rules**: Make validation rules explicit in module documentation and API specs. Use `@spec` and `@doc` to communicate what inputs are accepted and what errors are returned.

## Common Pitfalls

- **Client-side only validation**: Relying on JavaScript validation without server-side validation is a security vulnerability. Client-side validation is a UX convenience; server-side validation is a security requirement.

- **Validation after processing**: Validating data after it has already been used in computations or stored in the database is too late. By then, invalid data may have caused side effects that are difficult or impossible to reverse.

- **Overly permissive validation**: Accepting data that "looks close enough" leads to data quality problems that compound over time. Be strict about format, type, and range requirements.

- **Missing cross-field validation**: Validating fields individually but not their relationships misses logical inconsistencies (e.g., end_date before start_date, total not matching line items).

- **Silently coercing invalid data**: Converting invalid input to a default value without error is dangerous. The caller does not know their input was modified, leading to incorrect assumptions about system state.

- **Not validating absence**: Failing to validate that required fields are present is as dangerous as failing to validate their format. Use `validate_required/3` consistently.

## Use Cases

**API Input Validation**: Every request to the Prismatic API is validated against OpenApiSpex schemas before processing. Invalid requests receive 400 responses with detailed error descriptions.

**Compliance Assessment Validation**: ZKB and [NIS2](@/glossary/nis2.md) compliance assessment inputs (organization data, control evidence, configuration settings) are validated for completeness and consistency before assessment calculations begin.

**Agent Authority Validation**: [AIAD](@/glossary/aiad.md) agent operations are validated against authority level requirements. An L4 agent cannot perform L2 operations without explicit escalation through the validation pipeline.

**Quality Gate Enforcement**: Every code change passes through [quality gate](@/glossary/quality-gate.md) validation: compilation (zero warnings), Credo (strict mode), Dialyzer (type checking), tests (100% pass), and coverage thresholds.

**Epistemic Claim Validation**: Claims entering the NABLA belief system are validated against seven axioms. Claims lacking signal plurality, provenance, or timestamps are rejected, maintaining epistemic integrity.

## Related Concepts

- [Verification](@/glossary/verification.md) -- Confirming implementation matches specification
- [Formal Verification](@/glossary/formal-verification.md) -- Mathematical proof of system properties
- [Property-Based Testing](@/glossary/property-based-testing.md) -- Generative testing of validation invariants
- [Quality Gate](@/glossary/quality-gate.md) -- Automated validation checkpoints for code changes
- [Trinity Gate](@/glossary/trinity-gate.md) -- Three-layer formal validation for epistemic claims
- [Epistemic Validation](@/glossary/epistemic-validation.md) -- NABLA axiom compliance checking
- [Ecto](@/glossary/ecto.md) -- Elixir database library providing changeset validation
- [Quality Gates](@/glossary/quality-gates.md) -- Pipeline of validation checks for code quality
- [Security Assessment](@/glossary/security-assessment.md) -- Validation of security posture
- [Zero Tolerance](@/glossary/zero-tolerance.md) -- Quality enforcement requiring validation passage
- [OWASP](@/glossary/owasp.md) -- Input validation requirements for web security
- [AIAD](@/glossary/aiad.md) -- Agent authority validation framework

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Technologies](@/technologies/_index.md) -- Technology stack details
- [Apps](@/apps/_index.md) -- Application ecosystem
- [Vulnerability](@/glossary/vulnerability.md) -- Vulnerabilities prevented by proper validation
- [Authentication](@/glossary/authentication.md) -- Identity validation

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
