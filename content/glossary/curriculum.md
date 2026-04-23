+++
title = "Curriculum"
weight = 50

[extra]
description = "A curriculum in software engineering defines a structured, progressive learning path that takes practitioners from foundational concepts through advanced specialization. In the Prismatic Platform, the curriculum encompasses Elixir/OTP mastery, platform architecture, security operations, OSINT methodology, and the NABLA epistemic framework -- organized into tiers that mirror the platform's agent authority levels."
category = "education"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "13 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate"
domain_category = "training-education"
related_concepts = ["learning paths", "skill development", "knowledge transfer", "training programs", "competency frameworks", "progressive disclosure", "mentorship"]
implementation_status = "production"
authority_level = "L3-strategic"
difficulty_rating = "intermediate"
prerequisites = ["elixir.md", "otp.md", "architecture.md"]
learning_path = ["platform orientation", "Elixir fundamentals", "OTP patterns", "platform architecture", "security operations", "OSINT methodology", "advanced specialization"]
interactive_demos = ["skill-assessment-tool", "learning-path-navigator", "progress-tracker"]
code_examples = true
external_resources = ["https://elixir-lang.org/learning.html", "https://hexdocs.pm", "https://exercism.org/tracks/elixir"]
version_introduced = "2.0.0"
stability_level = "stable"
testing_scenarios = ["learning-path-progression-test", "prerequisite-validation", "skill-assessment-scoring", "curriculum-completeness-audit"]
keywords = ["curriculum", "learning path", "training", "education", "skill development", "knowledge transfer", "competency framework", "progressive learning", "mentorship"]
tags = ["glossary", "education", "training", "learning-path", "skill-development", "mentorship"]
related_terms = ["learning-path", "learning-resource", "mentorship", "elixir-otp-training", "certification-programs", "workshop-facilitation", "office-hours", "progressive-disclosure", "documentation", "knowledge-graph"]
word_count = 1665
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Curriculum - Prismatic Platform"
+++

## Definition

A curriculum in software engineering is a structured, comprehensive, and progressively organized body of learning material, practical exercises, and assessment criteria designed to guide practitioners from foundational knowledge through advanced specialization within a particular technology domain. Unlike ad-hoc documentation or tutorial collections, a curriculum defines prerequisite chains, learning objectives at each stage, competency thresholds for advancement, and measurable outcomes that validate knowledge acquisition.

In the context of platform engineering, a curriculum serves the dual purpose of onboarding new contributors efficiently and ensuring that the entire team maintains a shared understanding of architectural principles, quality standards, and operational procedures. The Prismatic Platform's curriculum is structured around its agent authority levels (L1 through L5), with each level requiring demonstrated competency in progressively more sophisticated aspects of the platform.

## Overview

The software industry faces a persistent gap between the knowledge developers possess and the knowledge they need to be effective in complex platform environments. Traditional documentation addresses "what" and "how" but rarely provides the structured "when" and "in what order" that enables efficient learning. A curriculum fills this gap by organizing knowledge into a deliberate progression that respects cognitive load, builds on prior understanding, and provides frequent validation points.

Effective curricula in software engineering share several characteristics that distinguish them from documentation:

### Prerequisite Awareness

Each learning unit explicitly declares what the learner must already understand. In the Prismatic Platform, you cannot effectively learn about supervision tree design without first understanding GenServer behavior, which in turn requires understanding processes and message passing. The curriculum encodes these dependencies as a directed acyclic graph (DAG) that prevents learners from encountering concepts they are not prepared for.

### Measurable Outcomes

Each curriculum stage defines specific, observable competencies that the learner should demonstrate upon completion. These are not vague goals like "understand OTP" but specific outcomes like "implement a GenServer with proper init/handle_call/handle_cast callbacks, supervision tree integration, and telemetry instrumentation."

### Progressive Complexity

The curriculum begins with isolated, well-defined concepts and progressively introduces complexity, integration, and ambiguity. Early stages present clear right-and-wrong answers; advanced stages present trade-offs, judgment calls, and multi-factor optimization problems.

### Practical Application

Every theoretical concept is paired with practical exercises that require applying the concept within the actual platform codebase. Theory without practice does not produce competent platform engineers.

### Feedback Mechanisms

The curriculum includes assessment points (code reviews, challenge completions, project milestones) that provide learners with feedback on their progress and identify areas requiring additional attention.

## Technical Details

### Curriculum Structure as Code

The Prismatic Platform represents its curriculum as data structures that can be queried, validated, and evolved programmatically:

```elixir
defmodule Prismatic.Curriculum.Schema do
  @moduledoc """
  Defines the curriculum structure as composable, validatable
  data. Each learning module declares prerequisites, objectives,
  exercises, and assessment criteria.
  """

  @type difficulty :: :beginner | :intermediate | :advanced | :expert
  @type authority_level :: :l1 | :l2 | :l3 | :l4 | :l5

  defmodule LearningModule do
    @moduledoc "A single unit of curriculum content."

    @enforce_keys [:id, :title, :difficulty, :prerequisites, :objectives]
    defstruct [
      :id,
      :title,
      :description,
      :difficulty,
      :authority_level,
      :prerequisites,
      :objectives,
      :exercises,
      :assessment_criteria,
      :estimated_hours,
      :resources,
      :tags
    ]

    @type t :: %__MODULE__{
      id: String.t(),
      title: String.t(),
      description: String.t(),
      difficulty: Prismatic.Curriculum.Schema.difficulty(),
      authority_level: Prismatic.Curriculum.Schema.authority_level(),
      prerequisites: list(String.t()),
      objectives: list(String.t()),
      exercises: list(map()),
      assessment_criteria: list(map()),
      estimated_hours: pos_integer(),
      resources: list(map()),
      tags: list(String.t())
    }
  end

  defmodule Track do
    @moduledoc "A sequence of learning modules forming a specialization path."

    @enforce_keys [:id, :title, :modules]
    defstruct [:id, :title, :description, :modules, :total_hours, :target_level]

    @type t :: %__MODULE__{
      id: String.t(),
      title: String.t(),
      description: String.t(),
      modules: list(LearningModule.t()),
      total_hours: pos_integer(),
      target_level: Prismatic.Curriculum.Schema.authority_level()
    }
  end
end
```

### Prerequisite Validation Engine

```elixir
defmodule Prismatic.Curriculum.PrerequisiteValidator do
  @moduledoc """
  Validates that a learner has completed all prerequisites
  before advancing to a new module. Builds and validates
  a DAG of learning dependencies to prevent cycles and
  ensure completeness.
  """

  alias Prismatic.Curriculum.Schema.LearningModule

  @spec validate(LearningModule.t(), MapSet.t()) ::
          :ok | {:error, {:missing_prerequisites, list(String.t())}}
  def validate(%LearningModule{prerequisites: prereqs}, completed_modules) do
    missing = Enum.reject(prereqs, &MapSet.member?(completed_modules, &1))

    case missing do
      [] -> :ok
      _ -> {:error, {:missing_prerequisites, missing}}
    end
  end

  @spec build_dependency_graph(list(LearningModule.t())) ::
          {:ok, :digraph.graph()} | {:error, :cyclic_dependency}
  def build_dependency_graph(modules) do
    graph = :digraph.new([:acyclic])

    Enum.each(modules, fn module ->
      :digraph.add_vertex(graph, module.id, module)
    end)

    result =
      Enum.reduce_while(modules, :ok, fn module, :ok ->
        edges =
          Enum.map(module.prerequisites, fn prereq ->
            :digraph.add_edge(graph, prereq, module.id)
          end)

        if Enum.any?(edges, &match?({:error, _}, &1)) do
          {:halt, {:error, :cyclic_dependency}}
        else
          {:cont, :ok}
        end
      end)

    case result do
      :ok -> {:ok, graph}
      error -> error
    end
  end

  @spec topological_order(list(LearningModule.t())) ::
          {:ok, list(String.t())} | {:error, :cyclic_dependency}
  def topological_order(modules) do
    case build_dependency_graph(modules) do
      {:ok, graph} ->
        order = :digraph_utils.topsort(graph)
        :digraph.delete(graph)
        {:ok, order}

      {:error, _} = error ->
        error
    end
  end
end
```

### Learner Progress Tracking

```elixir
defmodule Prismatic.Curriculum.ProgressTracker do
  @moduledoc """
  Tracks learner progress through the curriculum. Uses ETS
  for high-performance reads and GenServer for write
  serialization. Supports milestone tracking, time estimates,
  and competency assessment records.
  """
  use GenServer

  @table :curriculum_progress

  defstruct [:learner_id, :completed_modules, :current_module, :started_at, :assessments]

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec get_progress(String.t()) :: {:ok, map()} | {:error, :not_found}
  def get_progress(learner_id) do
    case :ets.lookup(@table, learner_id) do
      [{^learner_id, progress}] -> {:ok, progress}
      [] -> {:error, :not_found}
    end
  end

  @spec complete_module(String.t(), String.t(), map()) :: :ok | {:error, term()}
  def complete_module(learner_id, module_id, assessment_result) do
    GenServer.call(__MODULE__, {:complete, learner_id, module_id, assessment_result})
  end

  @spec recommended_next(String.t()) :: {:ok, list(String.t())} | {:error, term()}
  def recommended_next(learner_id) do
    with {:ok, progress} <- get_progress(learner_id) do
      completed = MapSet.new(progress.completed_modules)
      all_modules = Prismatic.Curriculum.Registry.all_modules()

      available =
        all_modules
        |> Enum.filter(fn module ->
          not MapSet.member?(completed, module.id) and
            Enum.all?(module.prerequisites, &MapSet.member?(completed, &1))
        end)
        |> Enum.sort_by(& &1.difficulty)
        |> Enum.map(& &1.id)

      {:ok, available}
    end
  end

  @impl true
  def init(_opts) do
    :ets.new(@table, [:named_table, :set, :public, read_concurrency: true])
    {:ok, %{}}
  end

  @impl true
  def handle_call({:complete, learner_id, module_id, assessment}, _from, state) do
    progress =
      case :ets.lookup(@table, learner_id) do
        [{^learner_id, existing}] -> existing
        [] -> %{completed_modules: [], assessments: %{}, started_at: DateTime.utc_now()}
      end

    updated = %{
      progress
      | completed_modules: [module_id | progress.completed_modules],
        assessments: Map.put(progress.assessments, module_id, assessment)
    }

    :ets.insert(@table, {learner_id, updated})
    {:reply, :ok, state}
  end
end
```

### Skill Assessment Framework

```elixir
defmodule Prismatic.Curriculum.Assessment do
  @moduledoc """
  Assessment engine for evaluating learner competency.
  Supports multiple assessment types: code review challenges,
  architecture design exercises, debugging scenarios, and
  knowledge verification.
  """

  @type assessment_type :: :code_review | :architecture_design | :debugging | :knowledge_check
  @type score :: 0..100

  defmodule Result do
    @enforce_keys [:learner_id, :module_id, :score, :passed]
    defstruct [:learner_id, :module_id, :score, :passed, :feedback, :completed_at]

    @type t :: %__MODULE__{
      learner_id: String.t(),
      module_id: String.t(),
      score: Prismatic.Curriculum.Assessment.score(),
      passed: boolean(),
      feedback: list(String.t()),
      completed_at: DateTime.t()
    }
  end

  @passing_threshold 75

  @spec evaluate(String.t(), String.t(), map()) :: {:ok, Result.t()}
  def evaluate(learner_id, module_id, submission) do
    criteria = load_criteria(module_id)

    {score, feedback} =
      Enum.reduce(criteria, {0, []}, fn criterion, {total_score, fb} ->
        {points, comment} = evaluate_criterion(criterion, submission)
        {total_score + points, [comment | fb]}
      end)

    normalized_score = min(100, div(score * 100, max_possible_score(criteria)))

    result = %Result{
      learner_id: learner_id,
      module_id: module_id,
      score: normalized_score,
      passed: normalized_score >= @passing_threshold,
      feedback: Enum.reverse(feedback),
      completed_at: DateTime.utc_now()
    }

    {:ok, result}
  end

  defp load_criteria(module_id) do
    Prismatic.Curriculum.Registry.get_module(module_id).assessment_criteria
  end

  defp evaluate_criterion(%{type: :code_quality, weight: weight}, submission) do
    score = analyze_code_quality(submission.code)
    {score * weight, "Code quality: #{score}/100"}
  end

  defp evaluate_criterion(%{type: :test_coverage, weight: weight}, submission) do
    coverage = calculate_coverage(submission.tests, submission.code)
    {coverage * weight, "Test coverage: #{coverage}%"}
  end

  defp evaluate_criterion(%{type: :architecture_compliance, weight: weight}, submission) do
    compliance = check_architecture_patterns(submission.design)
    {compliance * weight, "Architecture compliance: #{compliance}/100"}
  end

  defp max_possible_score(criteria) do
    Enum.reduce(criteria, 0, fn c, acc -> acc + 100 * c.weight end)
  end

  defp analyze_code_quality(_code), do: 85
  defp calculate_coverage(_tests, _code), do: 90
  defp check_architecture_patterns(_design), do: 88
end
```

## Implementation in Prismatic Platform

### Five-Tier Curriculum Structure

The Prismatic Platform's curriculum is organized into five tiers that correspond to agent authority levels:

**Tier 1 -- Foundation (L1 Operational Units)**
Covers Elixir language fundamentals, functional programming concepts, basic OTP patterns (GenServer, Supervisor), Mix project structure, and the platform's coding standards. Estimated duration: 40-60 hours. Completion qualifies the learner to implement features within existing modules.

**Tier 2 -- Architecture (L2 Tactical Specialists)**
Covers advanced OTP patterns (DynamicSupervisor, GenStage, Broadway), umbrella application architecture, storage adapter patterns, Phoenix LiveView development, and the platform's quality gate system. Estimated duration: 80-120 hours. Completion qualifies the learner to design new modules and modify existing architecture.

**Tier 3 -- Strategic (L3 Strategic Commanders)**
Covers distributed systems design, NABLA epistemic framework, Color Team security operations, OSINT methodology, performance optimization, and cross-application coordination. Estimated duration: 120-200 hours. Completion qualifies the learner to lead feature development and make architectural decisions.

**Tier 4 -- Expert (L4 Safety-Critical)**
Covers formal verification with Lean4, advanced security modeling, platform evolution mechanisms (AutoHeal, AutoEvolve), quality DNA management, and crisis resolution protocols. Estimated duration: 200-300 hours. Completion qualifies the learner for safety-critical operations and platform-wide quality responsibility.

**Tier 5 -- Supreme (L5 Supreme Authority)**
Covers platform governance, doctrine management, ecosystem strategy, cross-platform coordination, and the full scope of the AIAD standard. This tier is achieved through demonstrated sustained excellence rather than structured coursework. Requires all previous tiers plus significant platform contribution history.

### AIAD Agent as Curriculum Delivery

The platform's 530+ AIAD agents serve as both learning resources and assessment tools. Each agent's documentation includes learning objectives, usage examples, and progression paths. The agent registry functions as a living curriculum index that evolves with the platform.

### Quality Gates as Assessment

The platform's quality gate system (`mix quality.gates`) functions as an automated assessment mechanism. Code that passes all quality gates demonstrates competency in the platform's standards. Progressive exposure to stricter quality requirements mirrors curriculum advancement.

### Session Context as Learning Record

Each development session generates a context record in `.claude/session-context/` that documents decisions made, patterns applied, and challenges encountered. These records form a learning journal that supports retrospective analysis and mentorship discussions.

## Comparison with Alternatives

### Traditional Documentation

Documentation tells you what exists and how it works. A curriculum tells you what to learn, in what order, and how to know when you have learned it. The Prismatic Platform maintains both: documentation for reference and curriculum for structured learning.

### Video Course Platforms (Udemy, Coursera)

Video courses provide passive learning with limited interactivity. The Prismatic Platform's curriculum emphasizes active participation in the actual codebase, providing deeper learning through real-world application rather than simplified examples.

### Bootcamp Model

Bootcamps provide intensive, time-bounded training but often sacrifice depth for speed. The Prismatic curriculum supports self-paced learning with depth appropriate to each tier, allowing learners to achieve mastery rather than surface familiarity.

### Mentorship-Only Model

Pure mentorship is high-quality but does not scale. The Prismatic curriculum provides structured content that enables self-directed learning while reserving mentorship for nuanced guidance and assessment at advancement gates.

### Exercism/Kata-Style Practice

Code exercise platforms develop language fluency but lack platform context. The Prismatic curriculum integrates language exercises with platform-specific challenges that develop both language skill and architectural understanding.

## Best Practices

1. **Define learning objectives before content.** Each curriculum module should start with "After completing this module, the learner will be able to..." Objectives guide content creation and enable meaningful assessment.

2. **Enforce prerequisites strictly.** Allowing learners to skip prerequisites leads to knowledge gaps that compound over time. The DAG-based prerequisite system prevents advancement without demonstrated readiness.

3. **Balance theory and practice in every module.** Neither pure theory nor pure practice produces competent engineers. Each module should alternate between conceptual explanation and hands-on exercises.

4. **Update the curriculum continuously.** Platform evolution invalidates curriculum content. Treat curriculum maintenance as a first-class engineering task, not an afterthought.

5. **Provide multiple learning modalities.** People learn differently. Include written material, code examples, visual diagrams, interactive exercises, and mentorship opportunities for each major concept.

6. **Make assessment constructive, not punitive.** Assessment should identify growth opportunities, not gatekeep advancement. Provide detailed feedback that guides improvement.

7. **Connect curriculum to real platform work.** The most effective learning exercises are real platform tasks, not artificial challenges. Advanced curriculum modules should involve actual feature development or bug fixing.

## Common Pitfalls

1. **Curriculum drift from platform reality.** When the platform evolves faster than the curriculum is updated, learners study outdated patterns. Automated validation of curriculum code examples against the current codebase prevents this.

2. **Over-emphasis on tools over concepts.** Tools change; concepts persist. A curriculum that teaches "how to use GenServer" without explaining "when and why to use GenServer" produces tool operators, not engineers.

3. **Linear-only progression.** Not all learners need or want every module. Providing specialization tracks (security, architecture, OSINT) alongside the core curriculum respects different learning goals and career paths.

4. **Assessment that rewards memorization over understanding.** Multiple-choice knowledge checks are easy to create but measure recall, not competency. Practical assessments that require applying knowledge to novel situations are harder to evaluate but far more valuable.

5. **Ignoring the social dimension.** Learning is more effective in community. Isolating learners with self-paced content without peer interaction, code review, or mentorship reduces both motivation and knowledge depth.

6. **Treating curriculum completion as the end.** The curriculum is an on-ramp, not a destination. The most important learning happens after curriculum completion, when learners apply their knowledge to novel challenges in the real platform.

## Use Cases

### New Contributor Onboarding

When new contributors join the Prismatic Platform, the curriculum provides a structured path from "I know some Elixir" to "I can contribute productively." The prerequisite system ensures contributors build knowledge in the right order, reducing the frustration of encountering concepts they are not prepared for.

### Team Skill Gap Analysis

By mapping team members' curriculum progress, engineering leaders identify systematic skill gaps. If most team members have not completed the security operations modules, that indicates a team-wide vulnerability that should be addressed through focused training.

### Architecture Decision Qualification

Major architectural decisions in the Prismatic Platform require L3 or higher competency in the relevant domain. The curriculum provides an objective mechanism for establishing this competency, preventing unqualified decisions that could compromise platform integrity.

### Cross-Domain Knowledge Transfer

When specialists from one domain (e.g., OSINT) need to understand another domain (e.g., storage architecture), the curriculum provides a structured path for cross-training without requiring full specialization in the target domain.

### Conference and Workshop Content

The curriculum's modular structure provides ready-made content for conference talks, workshops, and training sessions. Each module includes learning objectives, exercises, and assessment criteria that translate directly to workshop formats.

## Related Concepts

The curriculum concept connects to multiple education and platform concepts within the Prismatic ecosystem:

- [Learning Path](/glossary/learning-path/) -- individual paths through the curriculum based on learner goals
- [Learning Resource](/glossary/learning-resource/) -- the content artifacts that compose curriculum modules
- [Mentorship](/glossary/mentorship/) -- human guidance that complements structured curriculum content
- [Elixir/OTP Training](/glossary/elixir-otp-training/) -- the platform-specific training track within the curriculum
- [Certification Programs](/glossary/certification-programs/) -- formal validation of curriculum completion
- [Workshop Facilitation](/glossary/workshop-facilitation/) -- delivery of curriculum content in workshop format
- [Office Hours](/glossary/office-hours/) -- scheduled mentorship sessions supporting curriculum progress
- [Progressive Disclosure](/glossary/progressive-disclosure/) -- the UX principle applied to curriculum content organization
- [Documentation](/glossary/documentation/) -- reference material that supports but differs from curriculum content
- [Knowledge Graph](/glossary/knowledge-graph/) -- the structured representation of knowledge relationships

## See Also

- [AIAD](/glossary/aiad/) -- the standard that defines agent-assisted learning within the platform
- [Quality Gates](/glossary/quality-gates/) -- automated assessment mechanism aligned with curriculum objectives
- [Architecture](/glossary/architecture/) -- the platform architecture that the curriculum teaches
- [Community Building](/glossary/community-building/) -- the community context within which curriculum operates

---

**Connect & Contribute**: Created by [Tomas Korcak (korczis)](https://github.com/korczis) | [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
