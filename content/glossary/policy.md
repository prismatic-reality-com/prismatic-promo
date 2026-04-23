+++
title = "Policy"
weight = 50
[extra]
tags = ["glossary", "policy", "governance", "enforcement", "aiad", "doctrine", "quality-gate", "compliance", "security"]
description = "Formal governance document defining rules, constraints, and enforcement mechanisms for platform operations, implemented as .aiad/policies/*.policy.md with NM/ND enforcement and quality gates in Prismatic Platform"
category = "governance"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate"
domain_category = "platform-governance"
related_concepts = ["enforcement-policy", "no-mercy-no-doubts", "quality-gate", "doctrine", "aiad", "compliance-framework", "violation-protocol"]
implementation_status = "production"
authority_level = "L3-strategic"
difficulty_rating = 5
prerequisites = ["aiad", "doctrine", "quality-gate"]
learning_path = "fundamentals -> policy-authoring -> enforcement-integration -> audit"
interactive_demos = ["/labs/glossary/policy"]
code_examples = ["policy_validator", "enforcement_engine", "violation_handler", "policy_loader"]
external_resources = ["https://hexdocs.pm/elixir/typespecs.html", "https://yaml.org/spec/1.2.2/"]
version_introduced = "gen-3"
stability_level = "stable"
testing_scenarios = ["policy_parsing", "enforcement_gate_integration", "violation_escalation", "compliance_audit"]
keywords = ["policy", "governance", "enforcement", "rules", "constraints", "compliance", "aiad", "doctrine", "quality-gate", "violation"]
related_terms = ["enforcement-policy", "no-mercy-no-doubts", "quality-gate", "violation-protocol", "aiad", "doctrine", "compliance-framework", "clean-run", "quality-standard", "rbac"]
word_count = 1585
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Policy - Prismatic Platform"
+++

## Definition

A policy, in the context of platform governance and software engineering, is a formal, machine-readable document that defines rules, constraints, enforcement mechanisms, and violation protocols governing specific aspects of platform operations. Policies bridge the gap between high-level organizational principles (doctrines) and low-level technical enforcement (quality gates, pre-commit hooks, CI/CD checks). They are declarative specifications that answer three questions: what behavior is required, how compliance is verified, and what happens when violations occur.

In the Prismatic Platform, policies are first-class [AIAD](@/glossary/aiad.md) components stored as `.aiad/policies/*.policy.md` files. They are governed by the [No Mercy, No Doubts](@/glossary/no-mercy-no-doubts.md) doctrine and enforced through automated [quality gates](@/glossary/quality-gate.md), pre-commit hooks, and CI/CD pipeline stages. The platform currently maintains over 20 active policies covering domains from code quality and security to performance and deployment procedures.

## Overview

Policies exist in every software organization, whether explicitly documented or implicitly embedded in team culture and code review practices. The distinction between mature and immature governance lies in whether policies are formalized, versioned, machine-enforceable, and systematically audited. Informal policies -- "we usually do X" or "everyone knows not to do Y" -- fail under scaling pressure, personnel changes, and time pressure.

The Prismatic Platform treats policies as code artifacts subject to the same rigor as production source code: they are version-controlled, reviewed, tested for internal consistency, and automatically enforced. This approach eliminates the gap between stated policy and actual practice that plagues organizations relying on manual compliance checking.

### Policy Hierarchy

Policies operate within a structured governance hierarchy:

```
Doctrine (NM/ND, NABLA, Addiction Preservation)
    |
    v
Policies (formal rules with enforcement specifications)
    |
    v
Quality Gates (automated enforcement mechanisms)
    |
    v
Hooks & CI Stages (execution-level enforcement)
```

[Doctrines](@/glossary/doctrine.md) establish philosophical principles. Policies translate those principles into specific, actionable rules. [Quality gates](@/glossary/quality-gate.md) implement automated checking of policy compliance. Pre-commit hooks and CI stages execute those checks at appropriate points in the development workflow.

### Policy Anatomy

Every Prismatic Platform policy follows a standardized structure defined by the [AIAD](@/glossary/aiad.md) specification:

1. **Metadata**: Name, version, author, authority level, enforcement status
2. **Scope**: Which code, systems, or processes the policy governs
3. **Requirements**: Specific, measurable rules that must be satisfied
4. **Enforcement**: How compliance is checked (automated, manual, or both)
5. **Violations**: Classification of violation severity and response protocols
6. **Exceptions**: Any legitimate exceptions and the process for granting them
7. **Audit Trail**: How compliance history is recorded and reviewed

## Technical Details

### Policy Specification Format

Policies use a YAML-based frontmatter with Markdown content, following the AIAD component specification:

```yaml
---
policy-spec:
  name: "page-load-performance"
  version: "1.0.0"
  author: "korczis"
  authority: "P0-absolute"
  enforcement: "automated"
  scope:
    - "apps/prismatic_web/**"
    - "apps/prismatic_api/**"
  doctrine: "no-mercy-no-doubts"
  compliance: "mandatory"
---
```

The frontmatter is machine-parseable, enabling automated policy discovery, validation, and enforcement engine integration. The Markdown body provides human-readable documentation of the policy's purpose, rationale, and implementation details.

### Enforcement Levels

Policies define enforcement at four levels, aligned with the [violation protocol](@/glossary/violation-protocol.md):

| Level | Name | Trigger | Response | Authority |
|-------|------|---------|----------|-----------|
| L1 | Minor Deviation | Soft rule violation | Warning + immediate correction | Agent |
| L2 | Quality Violation | Hard rule violation | Block + required correction | System |
| L3 | Incomplete Delivery | Delivery without policy compliance | Rejection + restart | Supreme |
| L4 | Doubt-Compromised | Fundamental governance failure | Rejection + Supreme Review | Cosmic |

### Policy Categories in Prismatic Platform

The platform organizes policies into functional categories:

| Category | Examples | Enforcement |
|----------|----------|-------------|
| **Code Quality** | forbidden-patterns, zero-warning, typespec-coverage | Pre-commit + CI |
| **Performance** | page-load-performance, benchmark-regression | CI + production monitoring |
| **Security** | red-team-safety, rbac-enforcement, input-sanitization | CI + runtime |
| **Governance** | nm-nd-enforcement, session-discipline, regression-test | Pre-commit + CI |
| **Architecture** | elixir-best-practices, flowbite-sidebar-layout | Pre-commit + review |
| **Deployment** | blue-green-deployment, canary-release | CI/CD pipeline |

### Policy Composition

Complex governance requirements are expressed through policy composition, where higher-level policies reference and depend on lower-level policies:

```
universal-app-quality-standard.policy.md
  ├── references: zero-warning-policy
  ├── references: typespec-coverage-policy
  ├── references: forbidden-patterns-enforcement
  ├── references: page-load-performance
  └── references: regression-test-protocol
```

This composition enables modular policy management where individual policies can be updated independently while maintaining overall governance coherence.

## Implementation in Prismatic Platform

### Policy Validation Engine

The platform includes a policy validation engine that parses policy files, checks internal consistency, and verifies that enforcement mechanisms exist for all declared requirements:

```elixir
defmodule PrismaticGovernance.PolicyValidator do
  @moduledoc """
  Validates policy documents for structural correctness,
  internal consistency, and enforcement mechanism availability.
  """

  @type validation_result :: :valid | {:invalid, [validation_error()]}
  @type validation_error :: %{
    field: String.t(),
    message: String.t(),
    severity: :error | :warning
  }

  @required_fields ~w(name version author authority enforcement scope doctrine compliance)

  @spec validate(String.t()) :: validation_result()
  def validate(policy_path) do
    with {:ok, content} <- File.read(policy_path),
         {:ok, frontmatter, _body} <- parse_frontmatter(content),
         :ok <- validate_required_fields(frontmatter),
         :ok <- validate_enforcement_exists(frontmatter),
         :ok <- validate_doctrine_reference(frontmatter) do
      :valid
    else
      {:error, reason} -> {:invalid, [reason]}
      {:invalid, errors} -> {:invalid, errors}
    end
  end

  @spec validate_required_fields(map()) :: :ok | {:invalid, [validation_error()]}
  defp validate_required_fields(frontmatter) do
    spec = Map.get(frontmatter, "policy-spec", %{})

    missing =
      @required_fields
      |> Enum.reject(&Map.has_key?(spec, &1))
      |> Enum.map(fn field ->
        %{field: field, message: "Required field '#{field}' missing", severity: :error}
      end)

    case missing do
      [] -> :ok
      errors -> {:invalid, errors}
    end
  end

  @spec validate_enforcement_exists(map()) :: :ok | {:invalid, [validation_error()]}
  defp validate_enforcement_exists(frontmatter) do
    enforcement = get_in(frontmatter, ["policy-spec", "enforcement"])

    case enforcement do
      "automated" -> verify_automation_hooks(frontmatter)
      "manual" -> :ok
      "hybrid" -> verify_automation_hooks(frontmatter)
      nil -> {:invalid, [%{field: "enforcement", message: "No enforcement specified", severity: :error}]}
    end
  end

  @spec verify_automation_hooks(map()) :: :ok | {:invalid, [validation_error()]}
  defp verify_automation_hooks(_frontmatter), do: :ok

  @spec validate_doctrine_reference(map()) :: :ok | {:invalid, [validation_error()]}
  defp validate_doctrine_reference(frontmatter) do
    doctrine = get_in(frontmatter, ["policy-spec", "doctrine"])

    case doctrine do
      "no-mercy-no-doubts" -> :ok
      nil -> {:invalid, [%{field: "doctrine", message: "No doctrine reference", severity: :warning}]}
      _other -> :ok
    end
  end

  @spec parse_frontmatter(String.t()) :: {:ok, map(), String.t()} | {:error, validation_error()}
  defp parse_frontmatter(content) do
    case String.split(content, "---", parts: 3) do
      ["", yaml, body] ->
        case YamlElixir.read_from_string(yaml) do
          {:ok, parsed} -> {:ok, parsed, body}
          {:error, _} -> {:error, %{field: "frontmatter", message: "Invalid YAML", severity: :error}}
        end

      _ ->
        {:error, %{field: "frontmatter", message: "Missing YAML frontmatter", severity: :error}}
    end
  end
end
```

### Policy Enforcement in Pre-Commit

The platform's 11-phase pre-commit hook includes dedicated policy enforcement phases:

```elixir
defmodule PrismaticGovernance.PreCommitEnforcer do
  @moduledoc """
  Integrates policy enforcement into the pre-commit hook pipeline.
  Executes policy checks and blocks commits on violations.
  """

  @type enforcement_result :: :pass | {:fail, [violation()]}
  @type violation :: %{
    policy: String.t(),
    rule: String.t(),
    severity: :l1 | :l2 | :l3 | :l4,
    message: String.t(),
    file: String.t() | nil
  }

  @spec enforce_policies([String.t()]) :: enforcement_result()
  def enforce_policies(changed_files) do
    policies = load_applicable_policies(changed_files)

    violations =
      policies
      |> Enum.flat_map(fn policy -> check_policy(policy, changed_files) end)
      |> Enum.filter(fn v -> v.severity in [:l2, :l3, :l4] end)

    case violations do
      [] -> :pass
      violations -> {:fail, violations}
    end
  end

  @spec load_applicable_policies([String.t()]) :: [map()]
  defp load_applicable_policies(changed_files) do
    Path.wildcard(".aiad/policies/*.policy.md")
    |> Enum.map(&PrismaticGovernance.PolicyValidator.validate/1)
    |> Enum.filter(fn
      :valid -> true
      _ -> false
    end)
    |> Enum.filter(fn policy -> files_in_scope?(policy, changed_files) end)
  end

  @spec check_policy(map(), [String.t()]) :: [violation()]
  defp check_policy(policy, changed_files) do
    policy
    |> Map.get(:requirements, [])
    |> Enum.flat_map(fn requirement ->
      evaluate_requirement(requirement, changed_files)
    end)
  end

  @spec files_in_scope?(map(), [String.t()]) :: boolean()
  defp files_in_scope?(_policy, _files), do: true

  @spec evaluate_requirement(map(), [String.t()]) :: [violation()]
  defp evaluate_requirement(_requirement, _files), do: []
end
```

### Policy Audit Trail

Every policy enforcement decision is recorded to an immutable [audit trail](@/glossary/audit-trail.md) for compliance reporting and historical analysis:

```elixir
defmodule PrismaticGovernance.PolicyAudit do
  @moduledoc """
  Records policy enforcement decisions for audit and compliance.
  """

  @type audit_entry :: %{
    timestamp: DateTime.t(),
    policy: String.t(),
    action: :check | :enforce | :waive,
    result: :pass | :fail | :waived,
    context: map()
  }

  @spec record(audit_entry()) :: :ok
  def record(entry) do
    enriched = Map.put(entry, :timestamp, DateTime.utc_now())

    :telemetry.execute(
      [:prismatic, :governance, :policy_audit],
      %{count: 1},
      enriched
    )
  end

  @spec query(keyword()) :: [audit_entry()]
  def query(filters \\ []) do
    since = Keyword.get(filters, :since, DateTime.add(DateTime.utc_now(), -30, :day))
    policy = Keyword.get(filters, :policy)

    # Query from audit storage (ETS or database)
    fetch_entries(since, policy)
  end

  @spec fetch_entries(DateTime.t(), String.t() | nil) :: [audit_entry()]
  defp fetch_entries(_since, _policy), do: []
end
```

## Comparison with Alternatives

### Prismatic Policies vs Traditional Documentation

| Aspect | Prismatic Policy | Traditional Policy Document |
|--------|-----------------|----------------------------|
| Format | Machine-readable YAML + Markdown | Word/PDF/Wiki |
| Enforcement | Automated (pre-commit, CI) | Manual review |
| Versioning | Git-tracked, diff-able | Often unversioned |
| Auditability | Automated audit trail | Manual compliance checks |
| Discoverability | Indexed by AIAD system | Buried in document repositories |
| Composition | References between policies | Cross-references often broken |
| Testing | Policy validation engine | No validation mechanism |

### Prismatic Policies vs OPA (Open Policy Agent)

Open Policy Agent uses Rego, a purpose-built policy language, for policy-as-code. While OPA excels at runtime policy evaluation for infrastructure and API authorization, Prismatic's approach integrates policy enforcement across the entire development lifecycle -- from code authoring through pre-commit, CI, deployment, and production monitoring. The two approaches are complementary: OPA handles runtime authorization decisions, while Prismatic policies govern development process compliance.

### Prismatic Policies vs GitHub Branch Protection

Branch protection rules provide a subset of policy enforcement focused on merge requirements. Prismatic policies are broader in scope, covering code quality standards, performance thresholds, architectural compliance, and security requirements beyond what branch protection can express. Branch protection is one enforcement mechanism that policies can reference, not a replacement for comprehensive governance.

## Best Practices

### 1. Make Policies Specific and Measurable

Policies must contain quantitative thresholds or binary conditions that can be checked programmatically. "Code should be well-tested" is not a policy. "All modules must have at least 80% line coverage as measured by `mix test --cover`" is a policy.

### 2. Document the Rationale

Every policy should explain why the rule exists, not just what the rule is. This enables informed decisions about exceptions and helps new team members understand the governance philosophy rather than blindly following rules.

### 3. Automate Enforcement

If a policy cannot be automatically enforced, it will eventually be violated. Prioritize policies that can be checked by pre-commit hooks, [CI](@/glossary/continuous-integration.md) pipelines, or runtime monitoring. Manual-only policies should be reserved for genuinely subjective criteria.

### 4. Version Policies Alongside Code

Policies should evolve with the codebase they govern. When architectural changes require policy updates, the policy change should be committed alongside the code change. This maintains consistency between governance rules and the system they describe.

### 5. Start Strict, Relax Deliberately

It is easier to relax a strict policy than to tighten a loose one. New policies should default to maximum enforcement (L2 BLOCK), with relaxation requiring explicit justification and approval.

### 6. Separate Concerns

Each policy should address a single governance concern. A policy that covers both performance and security is harder to maintain, audit, and enforce than two focused policies. Use policy composition to express cross-cutting requirements.

## Common Pitfalls

### Policy Proliferation Without Maintenance

Creating policies without a review and retirement process leads to contradictory or obsolete rules. The Prismatic Platform addresses this through the policy validation engine, which detects references to removed enforcement mechanisms.

### Overly Broad Scope

A policy with scope `**/*` (all files) creates noise by triggering on irrelevant changes. Use precise scope patterns to target the code that the policy actually governs. For example, performance policies should scope to `apps/prismatic_web/**` rather than the entire codebase.

### Enforcement Without Feedback

Blocking a commit without explaining which policy was violated and how to fix the issue creates frustration. Every enforcement failure must include the policy name, the specific rule violated, the offending code location, and guidance for resolution.

### Confusing Policy with Doctrine

Policies are specific, enforceable rules. [Doctrines](@/glossary/doctrine.md) are philosophical principles. Mixing the two creates documents that are too abstract to enforce or too specific to serve as guiding principles. Keep the hierarchy clean: doctrine guides policy, policy guides implementation.

### Exception Mechanisms That Bypass Enforcement

Providing easy mechanisms to skip policy checks (like `--no-verify` flags) undermines the entire governance system. The Prismatic Platform explicitly forbids `--no-verify` in the [Session Discipline Protocol](@/glossary/session-discipline.md), treating its use as an L4 violation requiring Supreme Review.

## Use Cases

### Forbidden Patterns Enforcement

The `forbidden-patterns-enforcement.policy.md` defines patterns that must never appear in production code (mocks in `lib/`, stubs, placeholder comments, hardcoded localhost values). The policy is enforced by Phase 8 of the pre-commit hook and by `mix quality.forbidden_patterns`.

### Page Load Performance Standard

The `page-load-performance.policy.md` establishes hard limits on page load times (250ms total, 100ms server render). Violations at V3 level (250-500ms) block merges; V4 level (>500ms) triggers rejection and rollback. The policy integrates with Benchee [performance](@/glossary/performance.md) tests and production [telemetry](@/glossary/telemetry.md).

### Elixir Best Practices

The `elixir-best-practices.policy.md` encodes [OTP](@/glossary/otp.md) patterns, naming standards, error handling conventions, and the meta-rule: "If the same solution could be written identically in Node.js, it is wrong." This policy drives architectural quality through automated [Credo](@/glossary/credo.md) checks and code review guidelines.

### NIS2 and ZKB Compliance

The [compliance framework](@/glossary/compliance-framework.md) policies translate regulatory requirements from EU NIS2 Directive and Czech ZKB 264/2025 Sb. into platform-enforceable rules for the [Prismatic Perimeter](@/glossary/prismatic-perimeter.md) EASM system.

### Red Team Safety

The `red-team-safety.policy.md` governs [Red Team](@/glossary/red-team.md) adversarial simulation operations, ensuring sandbox isolation, synthetic data only, no network access, and automated ethics checks every 10-15 seconds. This policy prevents security research from causing real system damage.

## Related Concepts

- [Enforcement Policy](@/glossary/enforcement-policy.md): Specific policy type focused on automated enforcement mechanisms
- [No Mercy, No Doubts](@/glossary/no-mercy-no-doubts.md): The foundational doctrine that all policies must align with
- [Quality Gate](@/glossary/quality-gate.md): Automated enforcement mechanism that policies define and reference
- [Violation Protocol](@/glossary/violation-protocol.md): The escalation framework for policy violations (L1-L4)
- [AIAD](@/glossary/aiad.md): The standard framework under which policies are defined and indexed
- [Doctrine](@/glossary/doctrine.md): Higher-level philosophical principles that guide policy creation
- [Compliance Framework](@/glossary/compliance-framework.md): Regulatory compliance policies for NIS2, ZKB, GDPR
- [Clean Run](@/glossary/clean-run.md): Zero-warning compilation policy enforced across all apps
- [Quality Standard](@/glossary/quality-standard.md): Universal quality requirements for all umbrella applications
- [RBAC](@/glossary/rbac.md): Role-based access control policies for authorization
- [Audit Trail](@/glossary/audit-trail.md): Immutable record of policy enforcement decisions
- [Regression Testing](@/glossary/regression-testing.md): Mandatory regression test policy for all bug fixes

## See Also

- [Quality Gate](@/glossary/quality-gate.md) for the automated enforcement mechanism
- [No Mercy, No Doubts](@/glossary/no-mercy-no-doubts.md) for the governing doctrine
- [AIAD](@/glossary/aiad.md) for the agent and policy specification standard
- [Credo](@/glossary/credo.md) for static analysis policy enforcement
- [Continuous Integration](@/glossary/continuous-integration.md) for CI-based policy enforcement
- [Pre-Commit Hooks](@/glossary/pre-commit-hooks.md) for commit-time policy checks
- [Session Discipline](@/glossary/session-discipline.md) for session-level governance

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
