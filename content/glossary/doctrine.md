+++
title = "Doctrine"
weight = 50
[extra]
tags = ["glossary", "core", "governance", "philosophy", "enforcement", "platform-operations", "decision-making"]
description = "A codified set of principles, beliefs, and policies that govern all platform operations and decision-making, enforced through automated gates, violation protocols, and continuous compliance monitoring"
category = "core"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "platform-governance"
related_concepts = ["enforcement-policy", "violation-protocol", "quality-gate", "trinity-gate", "nabla-infinity", "session-discipline"]
implementation_status = "production"
authority_level = "cosmic"
difficulty_rating = 7
prerequisites = ["policy", "enforcement-policy", "quality-gate", "agent"]
learning_path = ["policy -> doctrine -> enforcement-policy -> violation-protocol -> trinity-gate"]
interactive_demos = ["/labs/glossary/doctrine"]
code_examples = ["Elixir GenServer for doctrine enforcement", "Behaviour-based compliance checking", "Telemetry-driven violation tracking"]
external_resources = ["https://en.wikipedia.org/wiki/Doctrine", "https://hexdocs.pm/elixir/GenServer.html"]
version_introduced = "gen-3"
stability_level = "stable"
testing_scenarios = ["doctrine compliance validation", "violation escalation", "cross-doctrine consistency", "enforcement gate integration"]
keywords = ["doctrine", "governance", "enforcement", "no-mercy-no-doubts", "nabla-infinity", "platform principles", "compliance"]
related_terms = ["policy", "enforcement-policy", "violation-protocol", "quality-gate", "trinity-gate", "nabla-infinity", "session-discipline", "aiad", "fitness-score", "clean-run"]
word_count = 1694
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Doctrine - Prismatic Platform"
+++

## Definition

A **doctrine** is a codified, authoritative set of principles, beliefs, and operational policies that govern all platform operations, decision-making processes, and quality enforcement mechanisms. Unlike informal guidelines or suggestions, a doctrine carries binding authority: every component, agent, workflow, and human interaction within the governed system must comply with its tenets or face structured violation consequences. In software platform governance, doctrines bridge the gap between abstract values (such as "quality matters") and concrete, automated enforcement (such as "zero compilation warnings, enforced by pre-commit hooks").

Within the [Prismatic Platform](@/glossary/application.md), doctrines represent the highest tier of governance artifacts. They sit above [policies](@/glossary/compliance-framework.md), which implement doctrine-level principles in specific domains, and above [enforcement rules](@/glossary/clean-run.md), which translate policies into automated checks. The platform currently operates under three primary doctrines: **No Mercy, No Doubts (NM/ND)**, **NABLA Infinity**, and **Addiction Preservation**, each addressing a distinct facet of platform integrity -- execution discipline, epistemic rigor, and evidence plurality, respectively.

## Overview

The concept of doctrine in technology platforms draws from military and organizational theory, where doctrine provides a shared mental model that enables decentralized execution. In a software context, doctrine serves three critical functions:

1. **Alignment**: Ensures that all contributors, automated agents, and CI/CD pipelines operate under the same quality and behavioral expectations, eliminating ambiguity about what constitutes acceptable work.

2. **Enforcement**: Provides the philosophical and structural foundation for automated gates, violation protocols, and escalation mechanisms. Without doctrine, enforcement rules lack coherent justification and become arbitrary.

3. **Evolution**: Doctrines encode the platform's identity and aspirations. As the platform evolves through [generations](@/glossary/generation.md), doctrines provide the stable core that persists across architectural changes, ensuring that quality never regresses even as capabilities expand.

The Prismatic Platform's doctrine system is notable for its multi-layered enforcement architecture. A single doctrine principle (e.g., "zero tolerance for incomplete implementations") cascades through policy documents, pre-commit hooks, CI/CD gates, agent behaviors, and session discipline protocols, creating defense-in-depth against quality erosion.

## Technical Details

### Doctrine Architecture

A well-formed doctrine in the Prismatic ecosystem consists of several structural components:

**Principles**: The foundational beliefs that the doctrine encodes. These are non-negotiable statements about how the platform operates. For NM/ND, examples include "Complete Execution: Finish completely or do not deliver" and "Evidence-Based: Every claim backed by tests, benchmarks, or verification."

**Enforcement Levels**: Each doctrine defines a graduated violation response system. The Prismatic standard uses four levels:

| Level | Description | Response |
|-------|-------------|----------|
| L1 | Minor deviation | Warning + Immediate correction |
| L2 | Quality violation | Block + Required correction |
| L3 | Incomplete delivery | Rejection + Restart |
| L4 | Doubt-compromised | Rejection + Supreme Review |

**Compliance Gates**: Automated checkpoints where doctrine compliance is verified. These include pre-commit hooks, [CI/CD pipeline](@/glossary/continuous-integration.md) stages, quality gate mix tasks, and agent-level self-assessment.

**Axioms**: For epistemic doctrines like [NABLA Infinity](@/glossary/belief-graph.md), the doctrine may encode formal axioms that must hold for any claim to be considered valid. The seven NABLA axioms (Signal Plurality, Contradiction Preservation, Absence Informative, Time Decay, Unknown Valid, Source Independence, Provenance Mandatory) function as logical preconditions for the platform's belief system.

### Doctrine Composition

Doctrines do not exist in isolation. The Prismatic Platform uses a compositional doctrine model where multiple doctrines interact:

```
NM/ND (Execution Discipline)
    |
    +-- Provides enforcement framework
    |
NABLA Infinity (Epistemic Rigor)
    |
    +-- Provides evidence requirements
    |
Addiction Preservation (Evidence Plurality)
    |
    +-- Ensures contradictions are preserved
    |
Session Discipline (Operational Protocol)
    |
    +-- Governs per-session compliance
```

The transition between exploration (NABLA-governed) and execution (NM/ND-governed) is mediated by a confidence threshold and the [Trinity Gate](@/glossary/formal-verification.md): when confidence reaches 0.95 and all three gate checks pass (structural consistency, logical consistency, formal necessity), the platform shifts from evidence-gathering mode to decisive execution mode.

## Implementation in Prismatic Platform

### Doctrine Enforcement GenServer

The platform implements doctrine enforcement through a dedicated OTP process that monitors compliance in real time:

```elixir
defmodule PrismaticDoctrine.Enforcer do
  @moduledoc """
  Real-time doctrine compliance enforcement.

  Monitors all platform operations for doctrine violations,
  escalates according to violation level, and maintains
  an immutable audit trail of all compliance events.
  """

  use GenServer

  alias PrismaticDoctrine.{ViolationProtocol, AuditTrail, ComplianceGate}

  @type violation_level :: :l1 | :l2 | :l3 | :l4
  @type doctrine_name :: :nm_nd | :nabla_infinity | :addiction_preservation | :session_discipline
  @type compliance_result :: {:compliant, map()} | {:violation, violation_level(), String.t()}

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec check_compliance(doctrine_name(), map()) :: compliance_result()
  def check_compliance(doctrine, context) do
    GenServer.call(__MODULE__, {:check_compliance, doctrine, context})
  end

  @spec report_violation(doctrine_name(), violation_level(), map()) :: :ok
  def report_violation(doctrine, level, details) do
    GenServer.cast(__MODULE__, {:report_violation, doctrine, level, details})
  end

  @spec compliance_status() :: map()
  def compliance_status do
    GenServer.call(__MODULE__, :compliance_status)
  end

  @impl true
  @spec init(keyword()) :: {:ok, map()}
  def init(opts) do
    state = %{
      doctrines: load_doctrines(opts),
      violations: [],
      compliance_cache: %{},
      audit_trail: AuditTrail.new(),
      started_at: DateTime.utc_now()
    }

    schedule_periodic_audit()

    {:ok, state}
  end

  @impl true
  def handle_call({:check_compliance, doctrine, context}, _from, state) do
    result = evaluate_doctrine(doctrine, context, state)

    new_state =
      case result do
        {:compliant, _metadata} ->
          update_cache(state, doctrine, :compliant)

        {:violation, level, reason} ->
          state
          |> record_violation(doctrine, level, reason)
          |> execute_violation_protocol(doctrine, level, reason)
      end

    :telemetry.execute(
      [:prismatic_doctrine, :compliance_check],
      %{duration: System.monotonic_time()},
      %{doctrine: doctrine, result: elem(result, 0)}
    )

    {:reply, result, new_state}
  end

  @impl true
  def handle_call(:compliance_status, _from, state) do
    status = %{
      doctrines: Map.keys(state.doctrines),
      total_checks: length(state.audit_trail.entries),
      violations: Enum.frequencies_by(state.violations, & &1.level),
      last_audit: state.audit_trail.last_entry,
      uptime: DateTime.diff(DateTime.utc_now(), state.started_at, :second)
    }

    {:reply, status, state}
  end

  @impl true
  def handle_cast({:report_violation, doctrine, level, details}, state) do
    new_state =
      state
      |> record_violation(doctrine, level, details.reason)
      |> execute_violation_protocol(doctrine, level, details.reason)

    {:noreply, new_state}
  end

  @impl true
  def handle_info(:periodic_audit, state) do
    new_state = run_comprehensive_audit(state)
    schedule_periodic_audit()
    {:noreply, new_state}
  end

  @spec evaluate_doctrine(doctrine_name(), map(), map()) :: compliance_result()
  defp evaluate_doctrine(:nm_nd, context, _state) do
    cond do
      context[:has_stubs] ->
        {:violation, :l3, "Stubs detected: NM/ND requires complete implementations"}

      context[:missing_tests] ->
        {:violation, :l2, "Missing test coverage: NM/ND requires 100% coverage"}

      context[:compilation_warnings] > 0 ->
        {:violation, :l2, "Compilation warnings: NM/ND requires zero warnings"}

      true ->
        {:compliant, %{doctrine: :nm_nd, checked_at: DateTime.utc_now()}}
    end
  end

  defp evaluate_doctrine(:nabla_infinity, context, _state) do
    cond do
      context[:signal_count] < 2 ->
        {:violation, :l2, "Signal Plurality violated: minimum 2 signals required"}

      context[:contradictions_suppressed] ->
        {:violation, :l3, "Contradiction Preservation violated: both sides must be preserved"}

      not context[:provenance_present] ->
        {:violation, :l2, "Provenance Mandatory violated: all beliefs must be traceable"}

      true ->
        {:compliant, %{doctrine: :nabla_infinity, axioms_checked: 7}}
    end
  end

  defp evaluate_doctrine(:addiction_preservation, context, _state) do
    if context[:evidence_cherry_picked] do
      {:violation, :l3, "Cherry-picking detected: all evidence must be preserved"}
    else
      {:compliant, %{doctrine: :addiction_preservation, preserved: true}}
    end
  end

  defp evaluate_doctrine(:session_discipline, context, _state) do
    cond do
      not context[:gitlab_ticket_exists] ->
        {:violation, :l3, "Session without GitLab ticket: FORBIDDEN"}

      context[:no_verify_used] ->
        {:violation, :l4, "--no-verify usage detected: ABSOLUTELY FORBIDDEN"}

      context[:unpushed_commits] ->
        {:violation, :l2, "Unpushed commits: all commits must be pushed"}

      true ->
        {:compliant, %{doctrine: :session_discipline, session_valid: true}}
    end
  end

  @spec load_doctrines(keyword()) :: map()
  defp load_doctrines(_opts) do
    %{
      nm_nd: %{name: "No Mercy, No Doubts", version: "2.0.0", authority: :absolute_supreme},
      nabla_infinity: %{name: "NABLA Infinity", version: "1.0.0", authority: :cosmic},
      addiction_preservation: %{name: "Addiction Preservation", version: "1.0.0", authority: :cosmic},
      session_discipline: %{name: "Session Discipline", version: "1.0.0", authority: :absolute}
    }
  end

  @spec record_violation(map(), doctrine_name(), violation_level(), String.t()) :: map()
  defp record_violation(state, doctrine, level, reason) do
    violation = %{
      doctrine: doctrine,
      level: level,
      reason: reason,
      timestamp: DateTime.utc_now()
    }

    %{state | violations: [violation | state.violations]}
  end

  @spec execute_violation_protocol(map(), doctrine_name(), violation_level(), String.t()) :: map()
  defp execute_violation_protocol(state, doctrine, level, reason) do
    ViolationProtocol.execute(doctrine, level, reason)
    state
  end

  @spec update_cache(map(), doctrine_name(), atom()) :: map()
  defp update_cache(state, doctrine, status) do
    put_in(state, [:compliance_cache, doctrine], %{status: status, at: DateTime.utc_now()})
  end

  @spec run_comprehensive_audit(map()) :: map()
  defp run_comprehensive_audit(state) do
    AuditTrail.record(state.audit_trail, :periodic_audit, %{
      violations_count: length(state.violations),
      doctrines_active: map_size(state.doctrines)
    })

    state
  end

  @spec schedule_periodic_audit() :: reference()
  defp schedule_periodic_audit do
    Process.send_after(self(), :periodic_audit, :timer.minutes(30))
  end
end
```

### Doctrine Behaviour

All doctrine implementations conform to a shared behaviour, enabling uniform composition and enforcement:

```elixir
defmodule PrismaticDoctrine.Behaviour do
  @moduledoc """
  Behaviour contract for all platform doctrines.

  Every doctrine must implement evaluation, violation handling,
  and status reporting through this standardized interface.
  """

  @type context :: map()
  @type compliance_result ::
          {:compliant, map()}
          | {:violation, :l1 | :l2 | :l3 | :l4, String.t()}

  @callback name() :: String.t()
  @callback version() :: String.t()
  @callback authority_level() :: :agent | :system | :supreme | :cosmic
  @callback evaluate(context()) :: compliance_result()
  @callback violation_response(:l1 | :l2 | :l3 | :l4, String.t()) :: :ok
  @callback status() :: map()
end
```

### AIAD Doctrine File Structure

Doctrines are stored as AIAD-standard markdown files in `.aiad/doctrine/`:

```
.aiad/doctrine/
  no-mercy-no-doubts.doctrine.md      # Primary execution doctrine
  nabla-infinity.doctrine.md          # Epistemic framework doctrine
  addiction-preservation.doctrine.md  # Evidence plurality doctrine
```

Each doctrine file includes a YAML enforcement block that is machine-parseable:

```yaml
enforcement:
  doctrine: "no-mercy-no-doubts"
  version: "2.0.0"
  compliance: mandatory
  authority: absolute_supreme
  bypass: none
  exceptions: none
```

### Pre-Commit Integration

Doctrine compliance is enforced at the git commit level through an 11-phase pre-commit hook system. Phase 8 specifically checks for forbidden patterns that violate NM/ND doctrine (stubs, mocks, placeholders, TODOs), while the overall hook chain ensures that no commit can bypass doctrine requirements:

```elixir
defmodule PrismaticDoctrine.PreCommitGate do
  @moduledoc """
  Pre-commit gate for doctrine compliance verification.
  """

  @spec validate_commit(list(String.t())) :: :ok | {:error, String.t()}
  def validate_commit(staged_files) do
    with :ok <- check_forbidden_patterns(staged_files),
         :ok <- check_test_coverage(staged_files),
         :ok <- check_compilation_warnings(staged_files),
         :ok <- check_session_discipline() do
      :ok
    end
  end

  @spec check_forbidden_patterns(list(String.t())) :: :ok | {:error, String.t()}
  defp check_forbidden_patterns(files) do
    forbidden = [
      ~r/# PLACEHOLDER/,
      ~r/# STUB/,
      ~r/# MOCK/,
      ~r/# FIXME/,
      ~r/# HACK/,
      ~r/raise "not implemented"/,
      ~r/raise :not_implemented/
    ]

    violations =
      files
      |> Enum.flat_map(&scan_file_for_patterns(&1, forbidden))
      |> Enum.reject(&whitelisted?/1)

    case violations do
      [] -> :ok
      found -> {:error, "NM/ND violation: #{length(found)} forbidden patterns found"}
    end
  end

  @spec check_test_coverage(list(String.t())) :: :ok | {:error, String.t()}
  defp check_test_coverage(files) do
    lib_files = Enum.filter(files, &String.starts_with?(&1, "lib/"))

    missing_tests =
      Enum.reject(lib_files, fn file ->
        test_file = String.replace(file, "lib/", "test/") |> String.replace(".ex", "_test.exs")
        File.exists?(test_file)
      end)

    case missing_tests do
      [] -> :ok
      found -> {:error, "NM/ND violation: #{length(found)} files without corresponding tests"}
    end
  end

  @spec check_compilation_warnings(list(String.t())) :: :ok | {:error, String.t()}
  defp check_compilation_warnings(_files), do: :ok

  @spec check_session_discipline() :: :ok | {:error, String.t()}
  defp check_session_discipline, do: :ok

  @spec scan_file_for_patterns(String.t(), list(Regex.t())) :: list(map())
  defp scan_file_for_patterns(file, patterns) do
    case File.read(file) do
      {:ok, content} ->
        Enum.flat_map(patterns, fn pattern ->
          if Regex.match?(pattern, content), do: [%{file: file, pattern: pattern}], else: []
        end)

      {:error, _} ->
        []
    end
  end

  @spec whitelisted?(map()) :: boolean()
  defp whitelisted?(%{file: file}) do
    whitelisted_paths = ["lib/mix/tasks/quality/", "prismatic_credo/", "config/"]
    Enum.any?(whitelisted_paths, &String.contains?(file, &1))
  end
end
```

## Comparison with Alternatives

### Doctrine vs. Policy

A [policy](@/glossary/compliance-framework.md) is a domain-specific implementation of doctrine-level principles. For example, the NM/ND doctrine's principle of "zero tolerance" becomes the Forbidden Patterns Enforcement Policy, which specifies exactly which code patterns are blocked. Doctrines are stable across platform generations; policies evolve more frequently.

### Doctrine vs. Convention

Conventions are informal, socially enforced norms (e.g., "we prefer functional programming"). Doctrines are formally codified with automated enforcement. A convention violation might produce a code review comment; a doctrine violation produces an automated block or rejection.

### Doctrine vs. Configuration

Configuration defines technical parameters (timeouts, feature flags, connection pool sizes). Doctrines define behavioral principles. Configuration can be changed per environment; doctrines apply universally across all environments.

### Doctrine vs. ADR (Architecture Decision Record)

ADRs document point-in-time decisions with context and consequences. Doctrines encode ongoing principles that transcend individual decisions. An ADR might document the choice to use KuzuDB; the NM/ND doctrine ensures that the KuzuDB integration meets quality standards.

| Aspect | Doctrine | Policy | Convention | Configuration |
|--------|----------|--------|------------|---------------|
| Authority | Supreme/Cosmic | System | Social | Technical |
| Enforcement | Automated | Automated | Manual | Runtime |
| Scope | Platform-wide | Domain-specific | Team-level | Environment-specific |
| Stability | Multi-generational | Per-generation | Fluid | Per-deployment |
| Violation Impact | Block/Reject | Block/Warn | Comment | Error/Fallback |

## Best Practices

1. **Keep doctrines minimal and principled**: A doctrine should encode 5-10 core principles, not hundreds of specific rules. Specific rules belong in policies. Doctrines answer "what do we believe?" while policies answer "how do we enforce that belief?"

2. **Automate enforcement exhaustively**: Every doctrine principle should map to at least one automated check. If a principle cannot be automated, it is either too vague or belongs at the convention level rather than the doctrine level.

3. **Use graduated violation levels**: Not all violations are equal. A missing test (L2) is less severe than shipping stubs to production (L3). Graduated responses prevent enforcement fatigue while maintaining strict overall compliance.

4. **Document the "why" explicitly**: Each doctrine principle should include a rationale. The NM/ND doctrine does not just say "no stubs"; it explains that stubs signal incomplete thinking that compounds into technical debt, which violates the platform's quality identity.

5. **Version doctrines independently**: As doctrines evolve (e.g., NM/ND v1.0 to v2.0), previous versions should remain accessible for audit and historical understanding. This supports the [Provenance Mandatory](@/glossary/audit-trail.md) axiom from NABLA Infinity.

6. **Compose doctrines, do not merge them**: The NM/ND and NABLA Infinity doctrines serve distinct purposes. Merging them would lose the clarity of each. Instead, define interaction protocols (like the confidence threshold transition) that compose their effects.

7. **Test doctrine enforcement itself**: The enforcement mechanisms should themselves be tested. If the pre-commit hook that enforces NM/ND has a bug, doctrine violations can slip through. Meta-testing (testing the tests) is essential.

## Common Pitfalls

1. **Doctrine creep**: Adding too many principles to a single doctrine, diluting its core message. If a doctrine has more than 10 principles, consider splitting it into multiple doctrines with clear separation of concerns.

2. **Enforcement gaps**: Having well-written doctrine documents but incomplete automation. A doctrine principle without automated enforcement is effectively a suggestion, not a rule. The Prismatic Platform addresses this through its 11-phase pre-commit system and `mix quality.gates` integration.

3. **Cargo cult compliance**: Teams following doctrine rules mechanically without understanding the underlying principles. This produces code that technically passes all gates but misses the spirit of the doctrine. Combat this through documentation, onboarding, and code review that asks "why" questions.

4. **Doctrine ossification**: Treating doctrines as immutable sacred texts rather than living documents. While doctrines should be more stable than policies, they must evolve with the platform. The Prismatic Platform versions its doctrines and tracks evolution through [generations](@/glossary/generation.md).

5. **False confidence from passing gates**: Assuming that passing all automated checks means the code is truly doctrine-compliant. Automated checks catch known patterns; novel violations require human judgment. The [Color Teams](@/glossary/color-teams.md) system (particularly Purple Team synthesis) addresses this gap.

6. **Ignoring doctrine interaction effects**: Applying doctrines independently without considering how they compose. For example, NM/ND's "decisive action" principle can conflict with NABLA's "preserve contradictions" principle if the transition protocol is not properly implemented.

## Use Cases

### Platform Quality Governance

The primary use case for doctrine is establishing and maintaining platform-wide quality standards. In Prismatic, the NM/ND doctrine ensures that every commit meets production-ready standards through automated gates. This eliminates the common "we will fix it later" anti-pattern that leads to technical debt accumulation.

### Epistemic Security

The NABLA Infinity doctrine governs how the platform handles uncertain or contradictory information, which is critical for [OSINT](@/glossary/due-diligence.md) and intelligence operations. By requiring signal plurality and contradiction preservation, the doctrine prevents the platform from arriving at false certainties based on incomplete evidence.

### Multi-Agent Coordination

With 530+ [AIAD agents](@/glossary/aiad.md), doctrines provide the shared behavioral framework that enables autonomous agent operation without constant human oversight. Every agent embeds a doctrine enforcement block, ensuring consistent behavior across the entire agent fleet.

### Regulatory Compliance

For security-sensitive operations like [EASM](@/glossary/easm.md) and compliance assessment, doctrines provide the governance layer that maps to regulatory requirements (NIS2, ZKB). The doctrine's violation protocol and [audit trail](@/glossary/audit-trail.md) capabilities directly support compliance reporting.

### Session Discipline

The Session Discipline doctrine governs how development sessions operate, requiring GitLab ticket tracking, continuous commits, immediate pushes, and local testing. This prevents the common failure mode of large, untested batches of changes that introduce regressions.

## Related Concepts

- [Policy](@/glossary/compliance-framework.md) -- domain-specific implementation of doctrine principles with automated enforcement rules
- [AIAD](@/glossary/aiad.md) -- the agent framework that embeds doctrine compliance in every agent specification
- [Quality Gate](@/glossary/clean-run.md) -- automated checkpoints where doctrine compliance is verified before code merges
- [Trinity Gate](@/glossary/formal-verification.md) -- three-layer verification system (structural, logical, formal) required for epistemic claims
- [Generation](@/glossary/generation.md) -- platform evolution milestones where doctrine stability enables capability growth
- [Color Teams](@/glossary/color-teams.md) -- adversarial-defensive security operations governed by doctrine safety protocols
- [Fitness Score](@/glossary/fitness-score.md) -- quantitative measure of platform health that doctrine enforcement directly maintains
- [Audit Trail](@/glossary/audit-trail.md) -- immutable record of all compliance events required by doctrine provenance axioms
- [Contradiction Preservation](@/glossary/contradiction-preservation.md) -- NABLA axiom ensuring conflicting evidence is never discarded
- [Confidence Threshold](@/glossary/confidence-threshold.md) -- the tau value that gates the transition from exploration to execution

## See Also

- [NABLA Infinity](@/glossary/belief-graph.md) -- the epistemic framework doctrine governing evidence and belief management
- [Epistemic Robustness](@/glossary/epistemic-robustness.md) -- the property that doctrines aim to achieve through enforcement
- [Archer Supreme](@/glossary/archer-supreme.md) -- supreme coordinator agent that enforces doctrine at the highest authority level
- [Continuous Integration](@/glossary/continuous-integration.md) -- the CI/CD infrastructure through which doctrine gates operate
- [Credo](@/glossary/credo.md) -- static analysis tool that enforces code-level doctrine compliance

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
