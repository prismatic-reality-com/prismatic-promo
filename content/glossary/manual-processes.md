+++
title = "Manual Processes"
weight = 40
[extra]
description = "Human-driven operational workflows that lack automation, representing both a risk vector and an optimization target in modern software platforms"
category = "operations"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
abbreviation = "N/A"
related_terms = ["automate-relentlessly", "ci-cd", "pipeline", "quality-gates", "pre-commit-hooks", "mix-task", "continuous-integration", "automated-diagnostics", "automated-self-improvement", "quality-debt"]
keywords = ["manual processes elimination", "automation vs manual workflows", "operational toil reduction", "DevOps automation strategy", "manual process risks", "human error in software operations", "process automation Elixir", "CI/CD pipeline automation", "deployment automation", "operational excellence"]
tags = ["operations", "automation", "quality", "devops", "process-improvement"]
difficulty_level = "intermediate"
platform_relevance = "critical"
elixir_relevance = "high"
version = "1.0.0"
word_count = 1875
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Manual Processes - Prismatic Platform"
+++

## Definition

Manual processes are operational workflows, tasks, or procedures that require direct human intervention to execute, monitor, or complete. In software engineering, manual processes encompass activities such as hand-crafted deployments, ad-hoc testing, manual code reviews without tooling support, copy-paste configuration management, unscripted database migrations, and human-driven monitoring where operators watch dashboards rather than receiving automated alerts. The Prismatic Platform treats the elimination of manual processes as a core architectural principle, codified in the "Automate Relentlessly" doctrine -- every repeatable task must be automated, every human intervention point represents both a reliability risk and an optimization opportunity.

## Overview

The history of software engineering is, in many ways, a history of progressively eliminating manual processes. Early computing required manual toggle-switch programming. Assemblers automated machine code generation. Compilers automated translation from high-level languages. Build systems automated compilation orchestration. CI/CD pipelines automated testing and deployment. Each wave of automation unlocked new levels of productivity, reliability, and scale.

Yet manual processes persist in every software organization, often hidden in plain sight. The developer who manually restarts a service after deployment. The operations engineer who runs database migrations by hand from a terminal. The QA analyst who clicks through test scenarios in a browser. The team lead who manually reviews each pull request's compliance with coding standards before approving it. Each of these represents a point where human attention, human memory, and human consistency are the bottleneck.

The problems with manual processes are well-documented in the Site Reliability Engineering (SRE) literature. Google's SRE team coined the term "toil" to describe manual, repetitive, automatable work that scales linearly with service size. Toil is not inherently evil -- some manual work is creative, strategic, or requires judgment that automation cannot replicate. The problem is toil that masquerades as valuable work while consuming engineering time that could be spent on system improvement.

Manual processes introduce four fundamental risks:

1. **Inconsistency**: Humans perform the same task differently each time. Step 7 gets skipped on Fridays. The staging deployment follows a slightly different procedure than production. Configuration drift accumulates silently.

2. **Latency**: Manual processes execute at human speed. A deployment that takes 45 minutes of human attention could complete in 90 seconds automated. An incident response that requires paging an on-call engineer adds minutes of response time.

3. **Scalability ceiling**: Manual processes scale linearly with workload. If deploying one service takes 30 minutes of human time, deploying 100 services takes 3,000 minutes. Automated processes scale sublinearly or remain constant.

4. **Knowledge concentration**: Manual processes often depend on tribal knowledge -- undocumented procedures that only specific team members know. When that person is unavailable, the process fails.

The Prismatic Platform addresses manual process elimination systematically through its 11-phase pre-commit pipeline, automated quality gates, mix task automation, and the NO MERCY doctrine's requirement that every deliverable must be production-ready from the moment of creation.

## Technical Details

### Quantifying Manual Process Cost

Before eliminating manual processes, they must be identified and measured. The Prismatic Platform uses telemetry to track operational activities and identify automation candidates:

```elixir
defmodule PrismaticOps.ManualProcessTracker do
  @moduledoc """
  Tracks manual operational interventions to identify automation candidates.
  Records each manual process execution with timing, frequency, and error data
  to build the business case for automation investment.
  """

  use GenServer

  @type process_record :: %{
    name: String.t(),
    category: atom(),
    duration_ms: non_neg_integer(),
    operator: String.t(),
    outcome: :success | :failure | :partial,
    timestamp: DateTime.t(),
    automatable: boolean(),
    automation_effort: atom()
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    {:ok, %{records: [], automation_candidates: %{}}}
  end

  @spec record_manual_process(map()) :: :ok
  def record_manual_process(attrs) do
    GenServer.cast(__MODULE__, {:record, attrs})
  end

  @spec automation_report() :: {:ok, list(map())}
  def automation_report do
    GenServer.call(__MODULE__, :automation_report)
  end

  @impl true
  def handle_cast({:record, attrs}, state) do
    record = %{
      name: attrs.name,
      category: attrs.category,
      duration_ms: attrs.duration_ms,
      operator: attrs.operator,
      outcome: attrs.outcome,
      timestamp: DateTime.utc_now(),
      automatable: Map.get(attrs, :automatable, true),
      automation_effort: Map.get(attrs, :automation_effort, :medium)
    }

    :telemetry.execute(
      [:prismatic, :ops, :manual_process],
      %{duration_ms: record.duration_ms},
      %{name: record.name, category: record.category}
    )

    updated = update_candidates(state.automation_candidates, record)
    {:noreply, %{state | records: [record | state.records], automation_candidates: updated}}
  end

  @impl true
  def handle_call(:automation_report, _from, state) do
    report =
      state.automation_candidates
      |> Enum.map(fn {name, stats} ->
        %{
          process: name,
          total_executions: stats.count,
          total_time_ms: stats.total_duration,
          avg_time_ms: div(stats.total_duration, max(stats.count, 1)),
          failure_rate: stats.failures / max(stats.count, 1),
          automation_effort: stats.effort,
          roi_score: calculate_roi(stats)
        }
      end)
      |> Enum.sort_by(& &1.roi_score, :desc)

    {:reply, {:ok, report}, state}
  end

  defp calculate_roi(%{total_duration: duration, count: count, effort: effort}) do
    effort_cost = effort_to_hours(effort) * 60 * 60 * 1000
    annual_savings = duration * (count / max(days_tracked(), 1)) * 365
    if effort_cost > 0, do: annual_savings / effort_cost, else: 0.0
  end

  defp effort_to_hours(:trivial), do: 2
  defp effort_to_hours(:low), do: 8
  defp effort_to_hours(:medium), do: 40
  defp effort_to_hours(:high), do: 160
  defp effort_to_hours(:very_high), do: 480
end
```

### Automation Pipeline Architecture

The Prismatic Platform's automation infrastructure replaces manual processes with deterministic, repeatable pipelines. The 11-phase pre-commit hook system exemplifies this approach:

```elixir
defmodule PrismaticQuality.AutomationPipeline do
  @moduledoc """
  Orchestrates multi-phase automated quality enforcement, replacing
  manual code review checklists and deployment verification steps
  with deterministic pipeline execution.
  """

  @type phase :: %{
    name: String.t(),
    check: (list(String.t()) -> {:ok, term()} | {:error, term()}),
    blocking: boolean(),
    timeout_ms: non_neg_integer()
  }

  @spec run_pipeline(list(phase()), list(String.t())) ::
          {:ok, list(map())} | {:error, String.t(), list(map())}
  def run_pipeline(phases, changed_files) do
    phases
    |> Enum.reduce_while({:ok, []}, fn phase, {:ok, results} ->
      case execute_phase(phase, changed_files) do
        {:ok, result} ->
          {:cont, {:ok, [%{phase: phase.name, status: :passed, result: result} | results]}}

        {:error, reason} when phase.blocking ->
          {:halt, {:error, phase.name, [%{phase: phase.name, status: :failed, reason: reason} | results]}}

        {:error, reason} ->
          {:cont, {:ok, [%{phase: phase.name, status: :warning, reason: reason} | results]}}
      end
    end)
  end

  defp execute_phase(%{check: check, timeout_ms: timeout}, files) do
    task = Task.async(fn -> check.(files) end)

    case Task.yield(task, timeout) || Task.shutdown(task) do
      {:ok, result} -> result
      nil -> {:error, "Phase timed out after #{timeout}ms"}
    end
  end
end
```

### Mix Task Automation

The Prismatic Platform exposes automation through mix tasks that replace manual operational procedures:

```elixir
defmodule Mix.Tasks.Quality.Gates do
  @moduledoc """
  Automated quality gate enforcement replacing manual code review checklists.

  Executes all quality checks that would otherwise require manual verification:
  compilation warnings, Credo analysis, Dialyzer type checking, forbidden
  pattern detection, and test coverage validation.

  ## Usage

      mix quality.gates           # Full gate check
      mix quality.gates --fast    # Quick subset for development
      mix quality.gates --json    # Machine-readable output for CI
  """

  use Mix.Task

  @shortdoc "Run all automated quality gates"

  @impl true
  def run(args) do
    {opts, _, _} = OptionParser.parse(args, switches: [fast: :boolean, json: :boolean])

    gates = [
      {"Compilation", &check_compilation/0},
      {"Credo", &check_credo/0},
      {"Dialyzer", &check_dialyzer/0},
      {"Forbidden Patterns", &check_forbidden_patterns/0},
      {"Test Coverage", &check_coverage/0}
    ]

    gates
    |> maybe_filter_fast(opts[:fast])
    |> Enum.map(fn {name, check} ->
      {name, check.()}
    end)
    |> report_results(opts[:json])
  end
end
```

## Implementation

### The Automation Spectrum

Not all manual processes should be automated immediately or in the same way. The Prismatic Platform uses a tiered approach:

**Tier 1 -- Full Automation**: Processes that are deterministic, high-frequency, and high-risk when performed manually. Examples: compilation, linting, formatting, test execution, dependency vulnerability scanning. These run automatically on every commit with zero human involvement.

**Tier 2 -- Assisted Automation**: Processes that require human judgment but benefit from automated tooling. Examples: code review (assisted by automated checks but still requiring human assessment of design decisions), incident response (automated detection and initial containment, human-driven root cause analysis). The automation handles the mechanical aspects while humans focus on judgment.

**Tier 3 -- Documented Manual**: Processes that cannot or should not be automated but must be documented as runbooks with explicit steps, validation criteria, and rollback procedures. Examples: strategic architecture decisions, vendor negotiations, compliance exception requests.

**Tier 4 -- Monitored Manual**: Rare manual processes that are tracked for frequency and duration to determine whether they should be promoted to a higher automation tier. If a "rare" manual process executes more than N times per quarter, it becomes an automation candidate.

### Pre-Commit Hook Pipeline

The Prismatic Platform's 11-phase pre-commit pipeline is the most visible manifestation of manual process elimination. Activities that traditionally required manual review -- checking for compilation warnings, verifying code style, detecting forbidden patterns, validating test coverage -- are enforced automatically before code enters the repository:

| Phase | Replaces Manual Process | Enforcement |
|-------|------------------------|-------------|
| 1. Compilation | Manual build verification | BLOCKING |
| 2. Formatting | Manual style review | BLOCKING |
| 3. Credo | Manual code quality review | BLOCKING |
| 4. Forbidden Patterns | Manual pattern scanning | BLOCKING |
| 5. Dialyzer | Manual type checking | BLOCKING |
| 6. Test Execution | Manual test running | BLOCKING |
| 7. Coverage Check | Manual coverage verification | BLOCKING |
| 8. Template Validation | Manual HTML/HEEx review | BLOCKING |
| 9. Security Scan | Manual security review | BLOCKING |
| 10. Design Consistency | Manual UI review | BLOCKING |
| 11. Quality Gates | Manual quality sign-off | BLOCKING |

### Continuous Deployment Automation

The platform's CI/CD pipeline through GitLab CI automates the entire path from commit to production:

1. **Build**: Automated Docker image construction with multi-stage builds
2. **Test**: Full test suite execution in isolated containers
3. **Analyze**: Static analysis, type checking, and security scanning
4. **Stage**: Automated deployment to `prismatic-staging.fly.dev`
5. **Verify**: Automated smoke tests and health checks
6. **Promote**: Automated promotion to `prismatic-prod.fly.dev`
7. **Monitor**: Automated health monitoring and rollback triggers

## Comparison

### Manual vs. Automated Process Characteristics

| Dimension | Manual Process | Automated Process |
|-----------|---------------|-------------------|
| **Consistency** | Variable (human error) | Deterministic (same every time) |
| **Speed** | Minutes to hours | Seconds to minutes |
| **Scalability** | Linear with workload | Sublinear or constant |
| **Knowledge** | Tribal, undocumented | Codified in scripts/config |
| **Auditability** | Depends on discipline | Automatic logging |
| **Cost per execution** | High (human time) | Near-zero (compute time) |
| **Setup cost** | Low (just do it) | High (build automation) |
| **Adaptability** | High (humans adapt) | Low (requires code changes) |
| **Error recovery** | Humans can improvise | Must be explicitly programmed |

### Industry Approaches to Automation

| Approach | Philosophy | Automation Level | Example |
|----------|-----------|-----------------|---------|
| **Traditional Ops** | Manual is fine, scripts as needed | 20-40% | Ad-hoc shell scripts |
| **DevOps** | Automate repetitive tasks | 60-80% | CI/CD pipelines, IaC |
| **SRE** | Eliminate toil systematically | 80-90% | Error budgets, SLO-driven |
| **Platform Engineering** | Self-service everything | 90-95% | Internal developer platforms |
| **Prismatic (NO MERCY)** | Zero manual tolerance | 95-100% | 11-phase pipeline, auto-evolution |

## Best Practices

1. **Measure before automating**: Track the frequency, duration, and error rate of manual processes before investing in automation. Automate high-frequency, high-error processes first for maximum ROI.

2. **Automate incrementally**: Replace manual processes one phase at a time rather than attempting a complete automation overhaul. Each automated phase delivers immediate value and builds confidence.

3. **Codify tribal knowledge**: Before automating a manual process, document it as a runbook. The runbook becomes the specification for the automation. This captures institutional knowledge that would otherwise be lost.

4. **Make automation observable**: Automated processes must produce logs, metrics, and alerts. Silent automation is dangerous -- failures go unnoticed. The Prismatic Platform uses telemetry events for every automated phase.

5. **Preserve escape hatches**: Even fully automated processes should have manual override capabilities for exceptional circumstances. The key is making overrides explicit, logged, and rare rather than routine.

6. **Test the automation**: Automated processes are code and must be tested like code. A broken automation pipeline is worse than a manual process because it creates false confidence.

7. **Track automation debt**: When a manual process is identified but not yet automated, track it as automation debt alongside quality debt. The Prismatic Platform's Quality Debt system tracks both.

8. **Reject manual workarounds**: When automation breaks, fix the automation rather than reverting to manual execution. Manual workarounds become permanent if not actively resisted.

## Pitfalls

1. **Premature automation**: Automating a process before it is well-understood leads to "automating the wrong thing." Ensure the manual process is correct and stable before codifying it.

2. **Automation without monitoring**: Deploying automation and assuming it works forever. Automated processes degrade over time as dependencies change, environments evolve, and edge cases emerge.

3. **Over-engineering**: Building complex automation for rare processes. If a manual process executes once per quarter and takes 10 minutes, the ROI on spending a week automating it is negative.

4. **Ignoring human judgment**: Some processes are manual because they require judgment, creativity, or contextual awareness that automation cannot replicate. Forcing automation on inherently creative work reduces quality.

5. **Shadow manual processes**: Automated systems that appear automated but actually require hidden manual steps -- an engineer who manually triggers the "automated" deployment, or a process that requires manual credential rotation before it can run.

6. **Automation silos**: Different teams automating the same processes in incompatible ways. The Prismatic Platform addresses this through standardized mix tasks and shared pipeline definitions.

7. **Configuration drift**: Automated processes that work in development but fail in production because environments have drifted. Infrastructure as Code and environment parity are prerequisites for reliable automation.

## Use Cases

### Quality Gate Enforcement

The Prismatic Platform replaces manual code review checklists with automated quality gates. Rather than relying on reviewers to remember to check for compilation warnings, forbidden patterns, missing typespecs, and test coverage, the 11-phase pre-commit pipeline checks all of these automatically and blocks commits that violate any gate.

### Automated Regression Testing

The mandatory regression test protocol replaces the manual process of remembering to write tests for bug fixes. The protocol enforces a deterministic workflow: identify root cause, write failing test, apply fix, verify test passes. This prevents the common manual failure mode of fixing a bug without testing for regression.

### Session Context Management

The platform automates session context persistence, replacing the manual process of developers remembering to document their work. Session context is automatically saved to `.claude/session-context/` with standardized formatting, ensuring continuity across development sessions without relying on human discipline.

### Continuous Evolution

The `autoevolve` and `autoheal` systems automate platform improvement that would otherwise require manual identification of optimization opportunities. The system automatically scans for quality improvements, applies fixes, and validates results in a continuous loop.

### OSINT Collection Pipeline

The 120+ OSINT tool integrations automate intelligence gathering that would otherwise require manual searches across dozens of data sources, manual data normalization, and manual cross-referencing. The automated pipeline collects, normalizes, and correlates intelligence at machine speed.

## Related Concepts

Understanding manual processes connects to the broader automation and quality architecture of the Prismatic Platform:

- [Automate Relentlessly](/glossary/automate-relentlessly/) -- the doctrine that every repeatable task must be automated
- [CI/CD](/glossary/ci-cd/) -- continuous integration and deployment pipelines that automate the build-test-deploy cycle
- [Quality Gates](/glossary/quality-gates/) -- automated enforcement points that replace manual quality verification
- [Pre-Commit Hooks](/glossary/pre-commit-hooks/) -- automated checks that execute before code enters the repository
- [Pipeline](/glossary/pipeline/) -- the orchestrated sequence of automated stages in a workflow
- [Quality Debt](/glossary/quality-debt/) -- the accumulation of quality shortcuts that manual processes often create
- [Continuous Integration](/glossary/continuous-integration/) -- the practice of automatically integrating and testing code changes
- [Automated Diagnostics](/glossary/automated-diagnostics/) -- automated analysis that replaces manual debugging and investigation
- [Mix Task](/glossary/mix-task/) -- Elixir's task runner that codifies manual operations as executable commands
- [Quality Assurance](/glossary/quality-assurance/) -- the discipline of ensuring software meets quality standards

## See Also

- [Automated Self-Improvement](/glossary/automated-self-improvement/) -- how the platform automatically improves itself
- [Continuous Deployment](/glossary/continuous-deployment/) -- automated deployment to production environments
- [Quality Monitoring](/glossary/quality-monitoring/) -- automated observation of quality metrics over time
- [Static Analysis](/glossary/static-analysis/) -- automated code analysis that replaces manual code inspection
- [Testing](/glossary/testing/) -- the automated verification of software correctness

---

**Connect & Contribute**: Created by [Tomas Korcak (korczis)](https://github.com/korczis). Part of the [Prismatic Platform](https://github.com/korczis/prismatic-platform) glossary. Contributions welcome via pull request.
