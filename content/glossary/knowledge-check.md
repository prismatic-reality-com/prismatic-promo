+++
title = "Knowledge Check"
weight = 50
[extra]
description = "A Knowledge Check is an interactive assessment mechanism embedded within learning content that validates learner comprehension through targeted questions, scenario analysis, or practical exercises before progression to advanced material"
category = "learning"
domain = "education"
complexity = "intermediate"
stability = "stable"
beam_related = false
related_terms = ["learning-analytics", "prerequisite", "progress", "learning-path", "academy", "spaced-repetition", "bloom-taxonomy", "formative-assessment", "mastery-learning", "retrieval-practice", "adaptive-testing", "feedback-loop"]
tags = ["glossary", "knowledge-check", "assessment", "learning", "validation", "academy", "education", "comprehension", "bloom-taxonomy", "mastery", "adaptive", "spaced-repetition"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
difficulty = "beginner"
quality_score = 94
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Knowledge checks are embedded assessment gates within Prismatic Academy topics that validate comprehension before allowing progression to dependent material"
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["knowledge check", "assessment", "comprehension validation", "learning gate", "quiz", "formative assessment", "embedded assessment", "learner validation", "Bloom's taxonomy", "mastery learning", "adaptive testing"]
image = "/images/sections/glossary.png"
image_alt = "Knowledge Check - Prismatic Platform"
word_count = 3100
see_also = ["academy", "capabilities", "architecture", "learning-analytics"]
+++

## Definition

A **Knowledge Check** is an interactive assessment mechanism integrated directly into learning content that evaluates whether a learner has understood key concepts before proceeding to more advanced material. Unlike summative assessments (final exams, certifications), knowledge checks are formative -- they occur during learning, provide immediate feedback, and serve both as validation gates and as learning reinforcement mechanisms. Research in educational psychology consistently shows that retrieval practice (actively recalling information) strengthens memory more effectively than passive re-reading.

Knowledge checks take various forms: multiple-choice questions testing factual recall, scenario-based questions testing application of concepts, code completion exercises testing practical skills, and open-ended reflection prompts testing deeper understanding. The key property is that they are embedded within the learning flow rather than appended at the end.

In the context of the Prismatic Platform, knowledge checks are first-class components of the Academy system. They serve a dual purpose: validating that learners have absorbed prerequisite knowledge before advancing to topics that build on it, and generating analytics data that content authors use to improve topic quality. A knowledge check with a 95% pass rate is too easy; one with a 30% pass rate indicates either unclear content or a poorly-worded question.

## Core Concepts

### Bloom's Taxonomy Alignment

Effective knowledge checks must be designed at the appropriate cognitive level. Bloom's taxonomy provides a framework for categorizing the depth of understanding each question demands:

| Level | Cognitive Demand | Question Type | Example |
|-------|-----------------|---------------|---------|
| **Remember** | Recall facts | Multiple choice, fill-in-blank | "What OTP behaviour provides state management?" |
| **Understand** | Explain concepts | Short answer, paraphrase | "Explain why GenServer uses synchronous calls for state reads." |
| **Apply** | Use knowledge in new situations | Code completion, scenario | "Write an Ecto query that filters entities by source." |
| **Analyze** | Break down components | Diagram interpretation, comparison | "Given this supervision tree, identify the single point of failure." |
| **Evaluate** | Make judgments | Design review, tradeoff analysis | "Which caching strategy is better for this access pattern and why?" |
| **Create** | Produce original work | Open-ended coding, architecture | "Design a GenServer that implements rate limiting." |

Academy topics should include checks across multiple Bloom's levels. A topic on GenServer might include Remember-level checks ("What function handles synchronous messages?"), Apply-level checks ("Complete this GenServer implementation"), and Analyze-level checks ("Why would this GenServer implementation cause a bottleneck?").

### Question Type Comparison

| Question Type | Bloom's Levels | Auto-Gradable | Feedback Quality | Development Cost |
|--------------|----------------|---------------|-----------------|-----------------|
| **Multiple Choice** | Remember, Understand | Yes | High (with distractors explained) | Low |
| **True/False** | Remember | Yes | Low (binary feedback) | Very Low |
| **Fill-in-the-Blank** | Remember, Apply | Partial (exact match) | Medium | Low |
| **Code Completion** | Apply, Create | Yes (with test suite) | High (test output) | High |
| **Scenario Analysis** | Analyze, Evaluate | No (needs review) | Very High | Medium |
| **Matching** | Remember, Understand | Yes | Medium | Low |
| **Ordering/Sequencing** | Understand, Analyze | Yes | Medium | Low |
| **Code Review** | Analyze, Evaluate | Partial (pattern match) | High | Medium |

### Formative vs Summative Assessment

| Characteristic | Formative (Knowledge Check) | Summative (Certification) |
|---------------|---------------------------|--------------------------|
| **Timing** | During learning | After learning |
| **Purpose** | Guide learning, identify gaps | Measure achievement |
| **Feedback** | Immediate, explanatory | Delayed, score-only |
| **Stakes** | Low (can retry) | High (pass/fail) |
| **Frequency** | Every 10-15 minutes of content | End of course/module |
| **Grading** | Mastery-based (80%+ to proceed) | Norm-referenced or criterion |
| **Data use** | Content improvement, personalization | Credentialing, ranking |

## Technical Deep Dive

### Adaptive Testing with Item Response Theory

Basic knowledge checks present the same questions to every learner. Adaptive testing improves efficiency by selecting questions based on the learner's demonstrated ability level. Item Response Theory (IRT) provides the mathematical framework:

The three-parameter logistic (3PL) model estimates the probability of a correct response:

```
P(correct) = c + (1 - c) / (1 + e^(-a(theta - b)))
```

Where:
- **theta**: learner ability (estimated from response history)
- **a**: item discrimination (how well the item differentiates ability levels)
- **b**: item difficulty (the ability level at which P(correct) = 0.5)
- **c**: guessing parameter (lower bound for random guessing, e.g., 0.25 for 4-choice MCQ)

After each response, the system updates the learner's ability estimate using maximum likelihood estimation and selects the next item that maximizes information gain at the current ability level. This converges to an accurate ability estimate in fewer questions than fixed-length tests.

In practice, full IRT implementations require large item banks and calibration data. The Academy uses a simplified mastery-based approach that provides most of the benefit with much less complexity.

### Mastery-Based Progression

Mastery learning requires learners to demonstrate competency (typically 80%+ correct) before advancing. The progression logic:

1. Learner attempts all knowledge checks in a topic section
2. If score >= mastery threshold, the next section/topic unlocks
3. If score < threshold, the learner receives targeted feedback and can retry
4. After multiple failures, the system suggests prerequisite review

The mastery threshold should vary by topic criticality. For security-related topics (OSINT operational security, sanctions screening procedures), a higher threshold (90%+) is appropriate because the cost of incomplete understanding is severe.

### Spaced Repetition Integration

Knowledge checks become more powerful when combined with spaced repetition -- re-presenting questions at increasing intervals to strengthen long-term retention. The Leitner system provides a simple implementation:

| Box | Interval | Trigger |
|-----|----------|---------|
| Box 1 | 1 day | New or missed questions |
| Box 2 | 3 days | Correct once from Box 1 |
| Box 3 | 7 days | Correct once from Box 2 |
| Box 4 | 14 days | Correct once from Box 3 |
| Box 5 | 30 days | Correct once from Box 4 (retired) |

When a learner answers correctly, the question advances to the next box. When answered incorrectly, it returns to Box 1. This ensures that difficult concepts are reviewed more frequently while well-understood concepts fade into long-term memory.

### Timing and Engagement

The timing of knowledge checks matters significantly. Research on the attention span decay curve shows that engagement drops sharply after 10-15 minutes of passive content consumption. Knowledge checks serve as "cognitive resets" that re-engage the learner through active processing.

Optimal placement:
- **After each major concept** (every 10-15 minutes of content)
- **Before dependent concepts** (gate progression, prevent knowledge gaps)
- **At topic boundaries** (comprehensive check before moving on)
- **Immediately after code examples** (verify understanding of implementation)

Immediate feedback after each check is essential. Delayed feedback (showing results only after completing all questions) significantly reduces the learning effect because the learner has moved on mentally from the question context.

## Advanced Topics

### Question Quality Metrics

Not all questions are effective assessments. Track these metrics per question to identify quality issues:

| Metric | Healthy Range | Action if Outside Range |
|--------|-------------|----------------------|
| **Pass rate** | 40-90% | <40%: question too hard or unclear; >90%: too easy |
| **Discrimination index** | >0.3 | <0.3: question does not differentiate mastery levels |
| **Distractor effectiveness** | Each distractor chosen by >5% | <5%: distractor is obviously wrong, replace it |
| **Time to answer** | 30-120 seconds | <15s: guessing; >180s: confusing question |
| **Retry rate** | <30% | >50%: content preceding the check is inadequate |

### Anti-Gaming Patterns

Knowledge checks must resist common gaming strategies:

- **Question randomization**: Randomize question order and option order to prevent position-based memorization
- **Question pools**: Draw N questions from a larger pool so retakes present different questions
- **Time limits**: Prevent answer lookup by limiting response time (but generously -- 2x expected time)
- **Explanation requirements**: For higher Bloom's levels, require explanation alongside the answer
- **Cooldown periods**: Require minimum time between retry attempts to encourage study before retrying

### Accessibility Considerations

Knowledge checks must be accessible to all learners:

- Screen reader compatible (ARIA labels on all interactive elements)
- Keyboard navigable (tab through options, Enter to submit)
- Sufficient contrast for visual elements
- Alternative text for image-based questions
- Extended time option for learners who need it
- No time-dependent animations in question presentation

## Usage in Prismatic Platform

Prismatic Academy implements knowledge checks as embedded components within each Topic module. The Academy's metaprogramming architecture (`use PrismaticAcademy.Topic` + `register_topic/1`) includes knowledge check definitions as part of topic configuration. Each topic specifies check points with questions, expected responses, and feedback text. The ProgressTracker GenServer records check results and determines whether the learner meets prerequisites for dependent topics.

The InterconnectionEngine uses knowledge check completion data to recommend next topics: if a learner passes checks on "OSINT Signal Synthesis" but struggles with "Social Media OSINT" scenario questions, the engine can recommend intermediate material targeting the specific gap. The Academy dashboard displays completion rates and average scores per knowledge check, enabling content authors to identify questions that are too easy (100% pass) or too hard (below 40% pass) and adjust accordingly.

Knowledge check data also feeds into the platform's Learning Analytics system, which tracks cohort-level patterns. When multiple learners fail the same question, it triggers a content quality review flag. When a question consistently discriminates between learners who succeed and fail in subsequent topics, it is marked as a high-value assessment item.

The Academy's 4 self-registering topics each define knowledge checks inline using the topic macro system. The ETS-based TopicRegistry stores check metadata alongside topic content, enabling fast lookups for the ProgressTracker without database round-trips.

## Code Examples

### Knowledge Check Definition and Evaluation

```elixir
defmodule PrismaticAcademy.KnowledgeCheck do
  @moduledoc """
  Defines and evaluates knowledge check questions within Academy topics.
  Supports multiple question types aligned with Bloom's taxonomy levels.
  Provides immediate feedback and mastery-based progression gating.
  """

  @type bloom_level :: :remember | :understand | :apply | :analyze | :evaluate | :create

  @type question :: %{
    id: String.t(),
    prompt: String.t(),
    type: :multiple_choice | :code_completion | :scenario | :ordering | :matching,
    options: list(String.t()) | nil,
    correct_answer: term(),
    feedback: %{correct: String.t(), incorrect: String.t()},
    bloom_level: bloom_level(),
    difficulty: float(),
    time_limit_seconds: pos_integer() | nil,
    tags: list(String.t())
  }

  @type result :: %{
    question_id: String.t(),
    learner_answer: term(),
    correct: boolean(),
    feedback: String.t(),
    bloom_level: bloom_level(),
    time_taken_seconds: float() | nil,
    timestamp: DateTime.t()
  }

  @doc """
  Evaluates a learner's answer against the expected correct answer.
  Returns a result struct with correctness, feedback, and metadata.

  ## Examples

      iex> q = %{id: "q1", correct_answer: "GenServer", feedback: %{correct: "Right!", incorrect: "Try again."}, bloom_level: :remember}
      iex> result = KnowledgeCheck.evaluate(q, "GenServer")
      iex> result.correct
      true

  """
  @spec evaluate(question(), term(), keyword()) :: result()
  def evaluate(%{id: id, correct_answer: expected, feedback: fb, bloom_level: level}, answer, opts \\ []) do
    correct = normalize_answer(answer) == normalize_answer(expected)
    time_taken = Keyword.get(opts, :time_taken_seconds)

    %{
      question_id: id,
      learner_answer: answer,
      correct: correct,
      feedback: if(correct, do: fb.correct, else: fb.incorrect),
      bloom_level: level,
      time_taken_seconds: time_taken,
      timestamp: DateTime.utc_now()
    }
  end

  @doc """
  Determines whether a learner has achieved mastery on a set of results.
  Default threshold is 80% correct.

  ## Examples

      iex> results = [%{correct: true}, %{correct: true}, %{correct: false}, %{correct: true}, %{correct: true}]
      iex> KnowledgeCheck.mastery_achieved?(results)
      true

  """
  @spec mastery_achieved?(list(result()), float()) :: boolean()
  def mastery_achieved?(results, threshold \\ 0.8) do
    case results do
      [] ->
        false

      results ->
        correct = Enum.count(results, & &1.correct)
        correct / length(results) >= threshold
    end
  end

  @doc """
  Computes per-Bloom-level performance from a set of results.
  Useful for identifying specific cognitive skill gaps.
  """
  @spec performance_by_level(list(result())) :: %{bloom_level() => float()}
  def performance_by_level(results) do
    results
    |> Enum.group_by(& &1.bloom_level)
    |> Enum.into(%{}, fn {level, level_results} ->
      correct = Enum.count(level_results, & &1.correct)
      total = length(level_results)
      {level, if(total > 0, do: correct / total, else: 0.0)}
    end)
  end

  @doc """
  Computes question quality metrics from aggregated results across learners.
  """
  @spec question_quality(String.t(), list(result())) :: map()
  def question_quality(question_id, all_results) do
    question_results = Enum.filter(all_results, &(&1.question_id == question_id))
    total = length(question_results)

    if total == 0 do
      %{pass_rate: 0.0, avg_time: nil, total_attempts: 0}
    else
      correct = Enum.count(question_results, & &1.correct)
      times = question_results |> Enum.map(& &1.time_taken_seconds) |> Enum.reject(&is_nil/1)

      %{
        pass_rate: correct / total,
        avg_time: if(times != [], do: Enum.sum(times) / length(times), else: nil),
        total_attempts: total,
        discrimination: compute_discrimination(question_results)
      }
    end
  end

  @spec normalize_answer(term()) :: term()
  defp normalize_answer(answer) when is_binary(answer), do: String.trim(String.downcase(answer))
  defp normalize_answer(answer), do: answer

  @spec compute_discrimination(list(result())) :: float()
  defp compute_discrimination(results) when length(results) < 10, do: 0.0

  defp compute_discrimination(results) do
    sorted = Enum.sort_by(results, & &1.correct, :desc)
    third = div(length(sorted), 3)
    top = Enum.take(sorted, third)
    bottom = Enum.take(sorted, -third)

    top_rate = Enum.count(top, & &1.correct) / max(length(top), 1)
    bottom_rate = Enum.count(bottom, & &1.correct) / max(length(bottom), 1)

    top_rate - bottom_rate
  end
end
```

### Progress Tracker with Mastery Gating

```elixir
defmodule PrismaticAcademy.ProgressTracker do
  @moduledoc """
  Tracks learner progress through Academy topics.
  Implements mastery-based progression gating using knowledge check results.
  Stores state in ETS for sub-millisecond lookups.
  """

  use GenServer

  require Logger

  @table :academy_progress
  @mastery_threshold 0.8

  @type learner_id :: String.t()
  @type topic_id :: String.t()

  @type progress :: %{
    topic_id: topic_id(),
    learner_id: learner_id(),
    results: list(PrismaticAcademy.KnowledgeCheck.result()),
    mastery: boolean(),
    attempts: non_neg_integer(),
    last_attempt: DateTime.t() | nil
  }

  @doc "Start the progress tracker GenServer."
  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @doc """
  Records a knowledge check result for a learner.
  Updates mastery status if threshold is reached.
  """
  @spec record_result(learner_id(), topic_id(), PrismaticAcademy.KnowledgeCheck.result()) :: :ok
  def record_result(learner_id, topic_id, result) do
    GenServer.call(__MODULE__, {:record, learner_id, topic_id, result})
  end

  @doc """
  Checks whether a learner has achieved mastery on a topic.
  Returns immediately from ETS without GenServer call.
  """
  @spec mastery?(learner_id(), topic_id()) :: boolean()
  def mastery?(learner_id, topic_id) do
    case :ets.lookup(@table, {learner_id, topic_id}) do
      [{_, progress}] -> progress.mastery
      [] -> false
    end
  end

  @doc """
  Checks whether a learner can access a topic based on prerequisites.
  All prerequisite topics must have mastery achieved.
  """
  @spec can_access?(learner_id(), topic_id(), list(topic_id())) :: boolean()
  def can_access?(learner_id, _topic_id, prerequisites) do
    Enum.all?(prerequisites, &mastery?(learner_id, &1))
  end

  @impl GenServer
  def init(_opts) do
    :ets.new(@table, [:named_table, :set, :public, read_concurrency: true])
    {:ok, %{}}
  end

  @impl GenServer
  def handle_call({:record, learner_id, topic_id, result}, _from, state) do
    key = {learner_id, topic_id}

    progress =
      case :ets.lookup(@table, key) do
        [{_, existing}] ->
          updated_results = [result | existing.results]

          %{existing |
            results: updated_results,
            mastery: PrismaticAcademy.KnowledgeCheck.mastery_achieved?(updated_results, @mastery_threshold),
            attempts: existing.attempts + 1,
            last_attempt: DateTime.utc_now()
          }

        [] ->
          %{
            topic_id: topic_id,
            learner_id: learner_id,
            results: [result],
            mastery: result.correct,
            attempts: 1,
            last_attempt: DateTime.utc_now()
          }
      end

    :ets.insert(@table, {key, progress})

    if progress.mastery do
      Logger.info("Learner #{learner_id} achieved mastery on topic #{topic_id}")

      :telemetry.execute(
        [:prismatic, :academy, :mastery_achieved],
        %{attempts: progress.attempts},
        %{learner_id: learner_id, topic_id: topic_id}
      )
    end

    {:reply, :ok, state}
  end
end
```

### Topic Macro with Embedded Checks

```elixir
defmodule PrismaticAcademy.TopicDSL do
  @moduledoc """
  Macro DSL for defining Academy topics with embedded knowledge checks.
  Used by the 4 self-registering topics in the platform.
  """

  defmacro knowledge_check(id, opts) do
    quote do
      @knowledge_checks {unquote(id), %{
        id: unquote(id),
        prompt: unquote(Keyword.fetch!(opts, :prompt)),
        type: unquote(Keyword.get(opts, :type, :multiple_choice)),
        options: unquote(Keyword.get(opts, :options)),
        correct_answer: unquote(Keyword.fetch!(opts, :answer)),
        feedback: %{
          correct: unquote(Keyword.get(opts, :correct_feedback, "Correct!")),
          incorrect: unquote(Keyword.get(opts, :incorrect_feedback, "Not quite. Review the material above."))
        },
        bloom_level: unquote(Keyword.get(opts, :bloom_level, :remember)),
        difficulty: unquote(Keyword.get(opts, :difficulty, 0.5)),
        time_limit_seconds: unquote(Keyword.get(opts, :time_limit)),
        tags: unquote(Keyword.get(opts, :tags, []))
      }}
    end
  end
end
```

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| All questions at Remember level | Learners memorize facts but cannot apply concepts | Include Apply/Analyze level questions for technical topics |
| No immediate feedback | Learners do not learn from mistakes | Show correct answer + explanation immediately after each question |
| Binary pass/fail only | No insight into specific gaps | Track per-question and per-Bloom-level performance |
| Questions too easy (>90% pass) | False sense of mastery, no learning reinforcement | Increase difficulty, add distractor analysis |
| Questions too hard (<40% pass) | Learner frustration, content abandonment | Review preceding content; question may be unclear |
| No retry mechanism | Single failure blocks progression permanently | Allow retries with question pool rotation |
| Grading code by exact string match | Valid alternative solutions marked wrong | Use test-suite-based grading for code questions |
| Ignoring time data | Cannot distinguish mastery from lookup | Track time-to-answer; flag suspiciously fast responses |
| No cooldown between retries | Learners brute-force through checks | Require minimum study time between attempts |
| Static question bank | Answers spread through learner community | Rotate questions, use parameterized templates |

## Best Practices

1. **Align each knowledge check question with a specific learning objective** stated at the topic start. If a question does not map to an objective, either add the objective or remove the question.

2. **Provide immediate, explanatory feedback** for both correct and incorrect answers. Explain why the correct answer is correct and why each distractor is wrong.

3. **Space checks every 10-15 minutes of content** to maximize retention through retrieval practice and re-engage attention.

4. **Use scenario-based questions for intermediate and advanced topics** rather than pure recall. Technical learners benefit more from "here is a situation, what would you do?" than "what is the definition of X?"

5. **Track completion rates and scores per question** to identify content that needs improvement. Questions below 40% or above 90% pass rate need revision.

6. **Require mastery (80%+ correct) before unlocking dependent topics** to prevent knowledge gaps from compounding through the learning path.

7. **Include at least one code-based question per technical topic** to validate practical understanding alongside theoretical knowledge.

8. **Randomize question and option order** on each attempt to prevent position-based memorization.

9. **Use question pools larger than the number presented** so retakes encounter fresh questions, requiring genuine understanding rather than answer memorization.

10. **Review question discrimination metrics quarterly** -- questions that everyone gets right or everyone gets wrong provide no assessment value and should be replaced.

## Related Terms

- [Learning Analytics](@/glossary/learning-analytics.md) -- data analysis of learner performance on knowledge checks
- [Prerequisite](@/glossary/prerequisite.md) -- dependency relationship gated by knowledge check completion
- [Progress](@/glossary/progress.md) -- learner advancement tracked through check completions
- [Learning Path](@/glossary/learning-path.md) -- structured sequence of topics with embedded checks
- [Academy](/glossary/academy/) -- the Prismatic learning platform using knowledge checks
- [Spaced Repetition](/glossary/spaced-repetition/) -- review scheduling that strengthens knowledge check retention
- [Formative Assessment](/glossary/formative-assessment/) -- assessment during learning, the category knowledge checks belong to
- [Retrieval Practice](/glossary/retrieval-practice/) -- cognitive strategy underlying knowledge check effectiveness
- [Mastery Learning](/glossary/mastery-learning/) -- pedagogical model requiring demonstrated competency
- [Feedback Loop](/glossary/feedback-loop/) -- system pattern enabling continuous improvement from check data
- [Bloom's Taxonomy](/glossary/bloom-taxonomy/) -- cognitive framework for question difficulty design
- [Adaptive Testing](/glossary/adaptive-testing/) -- personalized question selection based on ability estimation

## See Also

- [Academy](@/academy/_index.md) -- the Prismatic learning platform using knowledge checks
- [Capabilities](@/capabilities/_index.md) -- platform educational capabilities
- [Learning Analytics Dashboard](/hub/academy/analytics) -- knowledge check performance visualization
- [Topic Registry Architecture](@/architecture/_index.md) -- metaprogramming system for topic registration

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
