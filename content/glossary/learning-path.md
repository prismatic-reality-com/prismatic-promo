+++
title = "Learning Path"
weight = 50
[extra]
tags = ["glossary", "education", "onboarding", "developer-experience", "training", "curriculum", "knowledge-management", "skills", "mentorship", "progressive-disclosure"]
description = "A Learning Path is a structured, progressive sequence of educational milestones that guides developers from foundational concepts through advanced mastery of a technology, framework, or platform domain."
category = "education"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "beginner"
quality_score = 95
related_terms = ["learning-resource", "curriculum", "developer-experience", "mentorship", "progressive-disclosure", "documentation", "certification-programs", "knowledge-graph", "onboarding", "developer-community"]
key_concepts = ["progressive skill building", "prerequisite chains", "competency milestones", "hands-on exercises", "assessment checkpoints", "adaptive difficulty"]
use_cases = ["developer onboarding", "platform adoption", "team skill development", "certification programs", "self-directed learning"]
see_also = ["competency matrix", "skills taxonomy", "training program", "knowledge transfer"]
date_created = "2026-02-22"
date_updated = "2026-02-22"
word_count = 1779
date_modified = "2026-02-23"
keywords = ["Learning", "Path", "glossary", "education", "Prismatic Platform", "Learning Path", "Phase", "GenServer"]
image = "/images/sections/glossary.png"
image_alt = "Learning Path - Prismatic Platform"
+++

## Definition

A Learning Path is a curated, ordered sequence of educational content, practical exercises, and assessment checkpoints designed to take a learner from a defined starting point to a target level of competency in a specific domain. Unlike ad-hoc tutorials or random documentation browsing, a learning path establishes explicit prerequisites, progressive difficulty scaling, and measurable milestones that ensure learners build knowledge systematically. In the context of platform engineering and Elixir/OTP development, learning paths map the journey from basic language syntax through concurrent programming patterns to production-ready system design, providing clear waypoints at each stage.

## Overview

Modern software platforms face a persistent challenge: the gap between the knowledge required to contribute effectively and the knowledge a new developer brings on day one. As platforms grow in scope -- the Prismatic Platform spans 115 umbrella applications, 530 agents, and approximately 2.8 million lines of code -- the onboarding problem intensifies. Without structured learning paths, developers resort to reading random source files, asking colleagues ad-hoc questions, and building fragile mental models through trial and error.

Learning paths address this by codifying the collective knowledge of experienced contributors into a reproducible sequence. Each path targets a specific role or skill area: "Elixir OTP Fundamentals," "Prismatic Storage Layer," "Agent Development," "Security Operations," or "OSINT Adapter Integration." The path defines what to learn, in what order, with what exercises, and how to verify understanding at each stage.

The concept extends beyond individual developer onboarding. Learning paths serve as the backbone of platform documentation strategy, team skill assessment, hiring evaluation, and open-source community growth. When a new contributor arrives at the Prismatic Platform, they do not face a wall of 1,800+ markdown files -- they follow a curated path that introduces concepts in the order they build upon each other.

Effective learning paths share several structural properties. They are **directed** (each step builds on the previous), **bounded** (they have clear start and end points), **measurable** (each milestone has verifiable criteria), **practical** (theory is immediately reinforced with hands-on exercises), and **adaptive** (learners can skip steps they have already mastered).

## Technical Details

### Learning Path Data Model

A learning path can be modeled as a directed acyclic graph (DAG) where nodes represent learning milestones and edges represent prerequisite relationships:

```elixir
defmodule Prismatic.Education.LearningPath do
  @moduledoc """
  Represents a structured learning path with milestones,
  prerequisites, and progress tracking.
  """

  @type milestone_id :: String.t()

  @type milestone :: %{
    id: milestone_id(),
    title: String.t(),
    description: String.t(),
    difficulty: :beginner | :intermediate | :advanced | :expert,
    estimated_hours: float(),
    resources: [resource()],
    exercises: [exercise()],
    assessment: assessment() | nil,
    prerequisites: [milestone_id()]
  }

  @type resource :: %{
    type: :documentation | :tutorial | :video | :code_example | :book,
    title: String.t(),
    url: String.t(),
    estimated_minutes: non_neg_integer()
  }

  @type exercise :: %{
    title: String.t(),
    description: String.t(),
    starter_code: String.t() | nil,
    solution_path: String.t(),
    verification: :manual | :automated
  }

  @type assessment :: %{
    type: :quiz | :project | :code_review | :presentation,
    passing_criteria: String.t(),
    max_attempts: non_neg_integer() | :unlimited
  }

  @type t :: %__MODULE__{
    id: String.t(),
    title: String.t(),
    description: String.t(),
    target_audience: String.t(),
    milestones: [milestone()],
    total_hours: float(),
    created_at: DateTime.t(),
    updated_at: DateTime.t()
  }

  defstruct [
    :id, :title, :description, :target_audience,
    :milestones, :total_hours, :created_at, :updated_at
  ]
end
```

### Topological Ordering of Prerequisites

Because milestones have prerequisites, the learning path forms a DAG that must be topologically sorted to determine valid learning orders:

```elixir
defmodule Prismatic.Education.PathResolver do
  @moduledoc """
  Resolves learning path milestone ordering using topological sort,
  ensuring prerequisites are always completed before dependent milestones.
  """

  alias Prismatic.Education.LearningPath

  @spec resolve_order([LearningPath.milestone()]) ::
    {:ok, [LearningPath.milestone_id()]} | {:error, :circular_dependency}
  def resolve_order(milestones) do
    graph = build_dependency_graph(milestones)

    case topological_sort(graph) do
      {:ok, sorted_ids} -> {:ok, sorted_ids}
      {:error, :cycle} -> {:error, :circular_dependency}
    end
  end

  defp build_dependency_graph(milestones) do
    milestones
    |> Enum.reduce(%{}, fn milestone, acc ->
      Map.put(acc, milestone.id, milestone.prerequisites)
    end)
  end

  defp topological_sort(graph) do
    vertices = Map.keys(graph)
    visited = MapSet.new()
    in_progress = MapSet.new()
    result = []

    Enum.reduce_while(vertices, {:ok, visited, in_progress, result}, fn vertex, {:ok, v, ip, r} ->
      case visit(vertex, graph, v, ip, r) do
        {:ok, v2, ip2, r2} -> {:cont, {:ok, v2, ip2, r2}}
        {:error, :cycle} -> {:halt, {:error, :cycle}}
      end
    end)
    |> case do
      {:ok, _v, _ip, result} -> {:ok, Enum.reverse(result)}
      {:error, :cycle} -> {:error, :cycle}
    end
  end

  defp visit(vertex, graph, visited, in_progress, result) do
    cond do
      MapSet.member?(in_progress, vertex) ->
        {:error, :cycle}

      MapSet.member?(visited, vertex) ->
        {:ok, visited, in_progress, result}

      true ->
        in_progress = MapSet.put(in_progress, vertex)
        deps = Map.get(graph, vertex, [])

        case Enum.reduce_while(deps, {:ok, visited, in_progress, result}, fn dep, {:ok, v, ip, r} ->
          visit(dep, graph, v, ip, r)
        end) do
          {:ok, v2, ip2, r2} ->
            {:ok, MapSet.put(v2, vertex), MapSet.delete(ip2, vertex), [vertex | r2]}
          error ->
            error
        end
    end
  end
end
```

### Progress Tracking with GenServer

Individual learner progress through a path can be tracked with a stateful GenServer:

```elixir
defmodule Prismatic.Education.ProgressTracker do
  @moduledoc """
  Tracks learner progress through a learning path.
  Persists state to ETS for fast access and periodic disk snapshots.
  """

  use GenServer
  require Logger

  @type learner_id :: String.t()
  @type path_id :: String.t()

  @type progress :: %{
    learner_id: learner_id(),
    path_id: path_id(),
    completed_milestones: MapSet.t(String.t()),
    current_milestone: String.t() | nil,
    started_at: DateTime.t(),
    last_activity: DateTime.t(),
    total_time_minutes: non_neg_integer()
  }

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl GenServer
  def init(_opts) do
    table = :ets.new(:learning_progress, [:set, :protected, read_concurrency: true])
    {:ok, %{table: table}}
  end

  @spec complete_milestone(learner_id(), path_id(), String.t()) ::
    {:ok, progress()} | {:error, :prerequisites_not_met}
  def complete_milestone(learner_id, path_id, milestone_id) do
    GenServer.call(__MODULE__, {:complete, learner_id, path_id, milestone_id})
  end

  @spec get_progress(learner_id(), path_id()) :: {:ok, progress()} | {:error, :not_found}
  def get_progress(learner_id, path_id) do
    GenServer.call(__MODULE__, {:get_progress, learner_id, path_id})
  end

  @spec next_milestones(learner_id(), path_id()) :: {:ok, [String.t()]}
  def next_milestones(learner_id, path_id) do
    GenServer.call(__MODULE__, {:next_milestones, learner_id, path_id})
  end

  @impl GenServer
  def handle_call({:complete, learner_id, path_id, milestone_id}, _from, state) do
    key = {learner_id, path_id}

    case :ets.lookup(state.table, key) do
      [{^key, progress}] ->
        updated = %{progress |
          completed_milestones: MapSet.put(progress.completed_milestones, milestone_id),
          last_activity: DateTime.utc_now()
        }
        :ets.insert(state.table, {key, updated})
        {:reply, {:ok, updated}, state}

      [] ->
        progress = %{
          learner_id: learner_id,
          path_id: path_id,
          completed_milestones: MapSet.new([milestone_id]),
          current_milestone: nil,
          started_at: DateTime.utc_now(),
          last_activity: DateTime.utc_now(),
          total_time_minutes: 0
        }
        :ets.insert(state.table, {key, progress})
        {:reply, {:ok, progress}, state}
    end
  end
end
```

### Path Recommendation Engine

A recommendation system can suggest the next most valuable learning path based on a developer's existing skills and project needs:

```elixir
defmodule Prismatic.Education.PathRecommender do
  @moduledoc """
  Recommends learning paths based on current skill gaps,
  project requirements, and team needs.
  """

  @type skill_profile :: %{String.t() => :none | :beginner | :intermediate | :advanced | :expert}

  @spec recommend(skill_profile(), keyword()) :: [{String.t(), float()}]
  def recommend(current_skills, opts \\ []) do
    project_needs = Keyword.get(opts, :project_needs, [])
    team_gaps = Keyword.get(opts, :team_gaps, [])
    max_results = Keyword.get(opts, :limit, 5)

    available_paths()
    |> Enum.map(fn path ->
      score = calculate_relevance(path, current_skills, project_needs, team_gaps)
      {path.id, score}
    end)
    |> Enum.sort_by(&elem(&1, 1), :desc)
    |> Enum.take(max_results)
  end

  defp calculate_relevance(path, skills, project_needs, team_gaps) do
    skill_gap_score = measure_skill_gap(path, skills) * 0.4
    project_relevance = measure_project_fit(path, project_needs) * 0.35
    team_value = measure_team_value(path, team_gaps) * 0.25

    skill_gap_score + project_relevance + team_value
  end
end
```

## Implementation

### Designing a Learning Path

Creating an effective learning path involves several structured phases:

**Phase 1 -- Audience Analysis**: Define the target learner profile. What do they already know? What do they need to accomplish? A learning path for a senior Java developer joining an Elixir team differs fundamentally from one designed for a fresh graduate.

**Phase 2 -- Competency Mapping**: List the specific skills and knowledge areas the learner should possess upon completion. These become the milestones. For an "Elixir OTP Mastery" path, competencies might include: pattern matching, process spawning, GenServer design, supervisor strategies, ETS usage, and distributed Erlang.

**Phase 3 -- Prerequisite Analysis**: Determine which competencies depend on others. Pattern matching must come before GenServer design (which uses pattern matching in callbacks). This analysis produces the DAG structure.

**Phase 4 -- Content Curation**: For each milestone, assemble the resources: documentation, tutorials, code examples, videos, and exercises. Prioritize official documentation and battle-tested resources over blog posts.

**Phase 5 -- Exercise Design**: Create hands-on exercises that reinforce each milestone. The best exercises are small, focused, and immediately applicable. A GenServer exercise might ask the learner to build a simple cache with TTL expiration.

**Phase 6 -- Assessment Integration**: Define how completion of each milestone is verified. Options range from self-assessment checklists to automated test suites that validate exercise solutions to peer code reviews.

**Phase 7 -- Iteration and Feedback**: Deploy the path to a small group of learners, gather feedback, and refine. Learning paths are living documents that must evolve as the platform and its community grow.

### Platform Integration

In the Prismatic Platform, learning paths are implemented as structured markdown files in the promo site's content directory, with metadata that enables filtering, search, and progress tracking. The Zola static site generator renders them into browsable web pages, while the underlying data model supports programmatic access through the API layer.

## Comparison

### Learning Path vs. Tutorial

A tutorial teaches a single concept or accomplishes a single task. A learning path sequences multiple tutorials (and other resources) into a coherent progression. A tutorial on "Building a GenServer" is a component; a learning path on "Elixir OTP Mastery" is the container that places that tutorial in context.

### Learning Path vs. Documentation

Documentation is reference material organized by topic. A learning path is experiential material organized by pedagogical sequence. Documentation answers "what does this function do?" while a learning path answers "what should I learn next to become proficient?"

### Learning Path vs. Certification Program

Certification programs culminate in a formal credential and typically involve proctored examinations. Learning paths may or may not lead to certification. They focus on competency acquisition rather than credential issuance, though they can serve as the study guide for a certification exam.

### Learning Path vs. Bootcamp

Bootcamps are intensive, time-bounded learning experiences with live instruction. Learning paths are self-paced and asynchronous. Both are structured, but bootcamps add social accountability and instructor interaction that self-directed learning paths lack.

### Learning Path vs. Knowledge Graph

A knowledge graph represents relationships between concepts without prescribing an order. A learning path imposes an order on a subset of the knowledge graph, creating a traversable route through the concept space.

## Best Practices

1. **Start with outcomes, not content**: Define what the learner should be able to do upon completion before selecting resources. Each milestone should have a measurable "can demonstrate" criterion.

2. **Keep milestones small and achievable**: A milestone that takes more than 4 hours to complete should be split. Frequent completion events maintain motivation and provide progress signals.

3. **Interleave theory and practice**: Never present more than 30 minutes of reading without a hands-on exercise. The learning science is clear: active recall and application dramatically improve retention.

4. **Provide escape hatches for experienced learners**: Allow self-assessment at each milestone so experienced developers can skip what they already know. Nobody wants to read "What is a variable?" when they have a decade of experience.

5. **Include real-world context**: Tie each milestone to actual platform code. Instead of abstract examples, point learners to specific modules in the codebase that exemplify the concept being taught.

6. **Version your paths**: As the platform evolves, learning paths must evolve too. Use semantic versioning and changelog entries so learners on older versions know what has changed.

7. **Measure completion rates and drop-off points**: Track where learners abandon the path. High drop-off at a specific milestone indicates that milestone is too difficult, too boring, or has poor resources.

8. **Incorporate peer learning**: Add milestones that require pair programming, code review, or presentation to a team. Social learning reinforces individual study and builds team cohesion.

## Common Pitfalls

1. **The firehose path**: Cramming every possible topic into a single path. Learners feel overwhelmed and drop out. Keep paths focused on a specific skill domain.

2. **Stale content**: Learning paths that reference deprecated APIs, removed modules, or outdated libraries. Automated checks should verify that all linked resources still exist and are current.

3. **Missing prerequisites**: Assuming knowledge that the learner does not have. Every prerequisite must either be explicitly stated or covered by an earlier milestone in the path.

4. **All theory, no practice**: Paths that consist entirely of documentation links without exercises. Reading about GenServer is not the same as building one.

5. **No feedback mechanism**: Learners who complete exercises with no way to verify correctness learn bad habits. Provide automated test suites, solution examples, or review channels.

6. **One-size-fits-all approach**: Treating all learners identically regardless of background. A senior developer and a junior developer need different path structures, even for the same end goal.

7. **Ignoring motivation design**: Failing to provide progress indicators, completion celebrations, or intermediate rewards. Learning is a long game; motivation design matters.

8. **Orphaned paths**: Creating paths that are never maintained, linked, or promoted. A learning path that nobody can find provides zero value.

## Use Cases

### New Developer Onboarding

When a new developer joins the Prismatic Platform team, they follow the "Platform Fundamentals" learning path that covers: Elixir basics, OTP patterns, umbrella project structure, storage layer contracts, agent architecture, quality gates, and deployment workflow. This reduces time-to-first-contribution from weeks to days.

### Open-Source Contributor Ramp-Up

External contributors to the platform follow a tailored path that focuses on: repository structure, contribution guidelines, testing conventions, code review expectations, and the specific subsystem they want to contribute to. This path is publicly accessible on the promo site.

### Technology Adoption

When the platform adopts a new technology (e.g., KuzuDB for graph storage, Lean4 for formal verification), a learning path is created that brings the team from zero knowledge to productive usage. The path includes hands-on exercises using the platform's actual codebase.

### Compliance Training

Security and compliance requirements (NIS2, GDPR, ZKB) demand that all team members understand specific policies and procedures. Learning paths for compliance topics include policy reading, scenario exercises, and assessment quizzes that demonstrate comprehension.

### Career Development

Individual contributors use learning paths to develop expertise in areas adjacent to their current role. A backend developer might follow the "LiveView Frontend" path to become full-stack capable, while a web developer might follow the "OSINT Adapter Development" path to contribute to the intelligence layer.

## Related Concepts

Learning paths intersect with numerous concepts in education, knowledge management, and platform engineering:

- [Learning Resource](@/glossary/learning-resource.md) -- the atomic building blocks (tutorials, docs, videos) that compose a learning path
- [Curriculum](@/glossary/curriculum.md) -- the broader educational program of which individual learning paths are components
- [Developer Experience](@/glossary/developer-experience.md) -- the overall quality of a developer's interaction with a platform, heavily influenced by available learning paths
- [Mentorship](@/glossary/mentorship.md) -- human-guided learning that complements structured paths with personalized advice and feedback
- [Progressive Disclosure](@/glossary/progressive-disclosure.md) -- the UX principle of revealing complexity gradually, directly applicable to learning path design
- [Documentation](@/glossary/documentation.md) -- reference material that learning paths curate and sequence for pedagogical effectiveness
- [Certification Programs](@/glossary/certification-programs.md) -- formal credential programs that learning paths can prepare learners for
- [Knowledge Graph](@/glossary/knowledge-graph.md) -- the underlying concept network from which learning paths extract ordered traversals
- [Developer Community](@/glossary/developer-community.md) -- the social context in which learning paths are created, shared, and improved
- [Community Building](@/glossary/community-building.md) -- strategic efforts that leverage learning paths as tools for growing contributor engagement

## See Also

- [Workshop Facilitation](@/glossary/workshop-facilitation.md) -- live instructional sessions that can complement self-paced learning paths
- [Office Hours](@/glossary/office-hours.md) -- scheduled availability for learners to ask questions about path content
- [Reference Documentation](@/glossary/reference-documentation.md) -- comprehensive API and module documentation that paths reference as resources
- [Elixir OTP Training](@/glossary/elixir-otp-training.md) -- specific training programs focused on Elixir and OTP concepts
- [Conference Speaking](@/glossary/conference-speaking.md) -- public presentations that can introduce learning paths to broader audiences

---

*Built with precision. Ready for the future.*

**[Prismatic Platform](https://github.com/korczis/prismatic-platform)** | Created by [Tomas Korcak (korczis)](https://github.com/korczis) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
