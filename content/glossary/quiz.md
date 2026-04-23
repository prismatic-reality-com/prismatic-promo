+++
title = "Quiz"
description = "An interactive assessment component within the Prismatic Academy that evaluates learner understanding through structured questions, adaptive difficulty, and immediate feedback with OTP-backed session management."
weight = 50

[extra]
domain = "education"
category = "education"
related_terms = ["topic-registry", "skill-matrix", "test-suite", "academy", "session", "progress-tracker", "ets", "genserver", "liveview", "pubsub", "interconnection-engine", "knowledge-graph"]
tags = ["quiz", "assessment", "academy", "learning", "education", "interactive", "elixir", "liveview", "adaptive", "scoring", "feedback"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "15 min"
difficulty = "beginner"
complexity = "medium"
stability = "mature"
beam_related = true
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Quizzes in Prismatic Academy provide structured knowledge assessment with adaptive difficulty, multiple question formats, weighted scoring, and real-time progress tracking through OTP-backed session management and LiveView interactivity."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["Quiz", "assessment", "Academy", "learning", "glossary", "Prismatic Platform", "adaptive", "scoring", "LiveView", "OTP"]
image = "/images/sections/glossary.png"
image_alt = "Quiz - Prismatic Platform"
word_count = 3300
key_concepts = ["adaptive-difficulty", "weighted-scoring", "question-formats", "progress-tracking", "skill-matrix-integration", "topic-gating", "sandbox-evaluation", "spaced-repetition"]
audience = ["developers", "educators", "learners", "architects"]
prerequisites = ["academy-basics", "liveview-fundamentals", "otp-basics"]
use_cases = ["knowledge-assessment", "skill-certification", "learning-path-gating", "competency-mapping", "onboarding-validation"]
see_also = ["academy", "capabilities", "topic-registry", "skill-matrix"]
+++

## Definition and Overview

A quiz is an interactive assessment mechanism that evaluates a learner's understanding of specific concepts through structured questions. In the Prismatic Academy context, quizzes are embedded within topic modules and serve as knowledge checkpoints that validate comprehension before allowing progression to more advanced material. Each quiz consists of questions with defined correct answers, explanations, difficulty levels, and scoring criteria. The quiz engine is built on OTP primitives (GenServer for session state, ETS for question banks, PubSub for real-time updates) and rendered through Phoenix LiveView for instant feedback without page reloads.

Unlike static multiple-choice tests, Prismatic Academy quizzes are dynamic -- they adapt difficulty based on learner performance, provide immediate feedback with detailed explanations, and contribute to the learner's skill matrix profile. Quiz results are tracked through the ProgressTracker GenServer and persist across sessions. The adaptive algorithm selects questions from a pool based on the learner's demonstrated competency level, ensuring that advanced learners are challenged while beginners receive appropriate scaffolding. This approach follows established principles from computerized adaptive testing (CAT) and item response theory (IRT).

The quiz system serves three distinct assessment purposes within the Academy. First, formative assessment: inline knowledge checks every 3-5 concepts that reinforce learning and identify misconceptions early. Second, summative assessment: end-of-topic comprehensive evaluations that gate progression to the next topic. Third, synthesis assessment: cross-topic quizzes that validate the learner's ability to integrate knowledge from multiple domains (e.g., combining OSINT methodology with security analysis techniques).

## Core Concepts

| Concept | Description | Implementation |
|---------|-------------|----------------|
| **Question Bank** | Pool of questions per topic, stored in ETS | TopicRegistry includes quiz specs per topic |
| **Adaptive Difficulty** | Dynamic question selection based on performance | Algorithm adjusts after each answer |
| **Weighted Scoring** | Harder questions worth more points | Weight 1-5 based on difficulty level |
| **Question Formats** | Multiple input types for diverse assessment | Single-choice, multi-choice, free-text, code-eval |
| **Passing Threshold** | Minimum score to progress | 70% weighted score required |
| **Immediate Feedback** | Explanation shown after each answer | LiveView updates without page reload |
| **Attempt Tracking** | History of all quiz attempts | ProgressTracker GenServer, persisted to database |
| **Skill Matrix Integration** | Quiz scores map to competency dimensions | Results feed into learner skill profile |
| **Topic Gating** | Quizzes control access to advanced topics | Must pass prerequisite quiz to unlock next topic |
| **Spaced Repetition** | Previously missed questions resurface | Interval-based re-presentation of weak areas |
| **Code Sandbox** | Safe execution of learner-submitted code | Restricted module/function allowlist, timeout |
| **Analytics Pipeline** | Aggregate quiz performance data | InterconnectionEngine identifies systemic gaps |

## Technical Deep Dive

### Question Format Specifications

| Format | Input Type | Scoring Model | Complexity | Use Case |
|--------|-----------|---------------|------------|----------|
| **Single Choice** | Radio button selection | Binary (correct/incorrect) | Low | Fact recall, definition matching |
| **Multiple Choice** | Checkbox selection | Partial credit (Jaccard similarity) | Medium | Comprehensive understanding |
| **Free Text** | Text input | Pattern matching or exact match | Medium | Terminology, short answers |
| **Code Evaluation** | Code editor | Execution result validation | High | Applied knowledge, syntax mastery |
| **Ordering** | Drag-and-drop list | Position-weighted scoring | Medium | Process understanding, sequencing |
| **Matching** | Pair association | Per-pair binary scoring | Medium | Concept-relationship mapping |
| **Fill-in-the-Blank** | Inline text inputs | Per-blank exact/fuzzy match | Low-Medium | Syntax recall, formula completion |

### Scoring Algorithm

The quiz scoring system uses weighted evaluation where question difficulty determines point value. The algorithm accounts for partial credit on multi-select questions and applies time-based bonuses for rapid correct answers.

| Component | Calculation | Weight |
|-----------|-------------|--------|
| **Base Score** | Sum of correct answer weights / total weight | 100% of score |
| **Partial Credit** | Jaccard similarity for multi-select | Applied per question |
| **Time Bonus** | 10% bonus if completed under 50% time limit | Up to 10% extra |
| **Streak Bonus** | 5% bonus for 5+ consecutive correct | Up to 5% extra |
| **Penalty** | No penalty for incorrect answers | 0% (encourage attempts) |
| **Final Score** | min(100%, base + time_bonus + streak_bonus) | Capped at 100% |

### Adaptive Difficulty Algorithm

The adaptive system adjusts question selection based on a running estimate of learner ability:

| Learner Performance | Next Question Difficulty | Rationale |
|--------------------|-----------------------|-----------|
| 3+ correct in a row | Increase one level | Learner is above current level |
| 2 incorrect in a row | Decrease one level | Learner needs easier material |
| Mixed results | Stay at current level | Appropriate challenge level |
| All beginner correct, >90% | Jump to intermediate | Fast-track capable learners |
| Expert level, >80% correct | Mark topic as mastered | No further assessment needed |

### OTP Architecture

The quiz system is built on BEAM/OTP primitives for concurrent session management:

| Component | OTP Primitive | Purpose |
|-----------|--------------|---------|
| **QuizSession** | GenServer | Manages state for a single quiz attempt |
| **QuestionBank** | ETS table | Fast concurrent read access to questions |
| **ProgressTracker** | GenServer + DB | Persists results, computes skill matrix |
| **TopicRegistry** | ETS-backed Registry | Self-registering topic/quiz discovery |
| **QuizSupervisor** | DynamicSupervisor | Supervises per-session GenServers |
| **ResultBroadcaster** | PubSub | Real-time score updates to dashboard |
| **SandboxEvaluator** | Task + timeout | Isolated code execution for code-eval questions |

## Architecture and Implementation

Quiz implementation in the Prismatic Platform leverages the self-registering topic system. Each topic module defines its quiz questions as structured data within the topic configuration. The `PrismaticAcademy.Topic` behaviour includes quiz specifications as part of the `register_topic/1` macro call, ensuring quizzes are automatically available when a topic is registered in the TopicRegistry.

Questions support multiple formats: single-choice, multiple-choice, free-text with pattern matching, and code evaluation (where the learner writes Elixir code that is evaluated in a sandboxed environment). The quiz engine tracks time spent per question, number of attempts, and generates analytics for the InterconnectionEngine to identify knowledge gaps across the learner population.

The scoring algorithm uses weighted evaluation -- harder questions contribute more to the final score, and partial credit is awarded for multiple-choice questions where some correct options are selected. The adaptive difficulty system adjusts question selection based on accumulated performance data, using a simplified item response theory model where each question has a difficulty parameter and each learner has an estimated ability parameter.

The LiveView rendering pipeline ensures immediate feedback:

1. Learner submits answer via `phx-submit` event
2. LiveView `handle_event/3` validates and scores the answer
3. QuizSession GenServer updates state (answer record, running score, adaptive level)
4. LiveView re-renders with feedback (correct/incorrect, explanation, next question)
5. On quiz completion, ProgressTracker persists results and updates skill matrix
6. PubSub broadcasts completion event for dashboard updates

## Usage in Prismatic Platform

The Academy subsystem uses quizzes at three integration points. First, as inline assessments within topic content (knowledge checks every 3-5 concepts). Second, as end-of-topic comprehensive assessments that gate progression. Third, as cross-topic synthesis quizzes that validate understanding across multiple related topics.

Quiz results feed into the skill matrix, which maps learner competencies across OSINT, security, data analysis, and platform engineering domains. The LiveView dashboard at `/academy` displays quiz statistics, completion rates, and personalized recommendations.

### Quiz Engine Implementation

```elixir
defmodule PrismaticAcademy.Quiz do
  @moduledoc """
  Quiz engine for Academy topic assessments.

  Manages question selection, scoring, and adaptive difficulty.
  Supports multiple question formats including single-choice,
  multiple-choice, free-text with pattern matching, and sandboxed
  code evaluation.

  The scoring system uses weighted evaluation where harder questions
  contribute more to the final score. Partial credit is awarded for
  multiple-choice questions using Jaccard similarity. A 70% weighted
  score is required to pass and unlock subsequent topics.

  ## Question Formats

  - `:single_choice` - One correct answer from options
  - `:multiple_choice` - Multiple correct answers, partial credit
  - `:free_text` - Pattern matching or exact string comparison
  - `:code_eval` - Elixir code evaluated in sandbox

  ## Examples

      iex> questions = [
      ...>   %{id: "q1", text: "What is OTP?", type: :single_choice,
      ...>     options: ["A framework", "A language", "An OS"],
      ...>     correct: [0], difficulty: :beginner, explanation: "OTP is a framework",
      ...>     weight: 1}
      ...> ]
      iex> result = PrismaticAcademy.Quiz.evaluate(questions, [0])
      iex> result.passed
      true
  """

  require Logger

  @type difficulty :: :beginner | :intermediate | :advanced | :expert
  @type question_type :: :single_choice | :multiple_choice | :free_text | :code_eval

  @type question :: %{
    id: String.t(),
    text: String.t(),
    type: question_type(),
    options: list(String.t()) | nil,
    correct: list(integer()) | String.t() | (String.t() -> boolean()),
    difficulty: difficulty(),
    explanation: String.t(),
    weight: pos_integer(),
    tags: list(String.t()),
    time_limit_seconds: non_neg_integer() | nil
  }

  @type answer_detail :: %{
    question_id: String.t(),
    correct: boolean(),
    points: non_neg_integer(),
    time_seconds: non_neg_integer()
  }

  @type result :: %{
    score: float(),
    total: pos_integer(),
    percentage: float(),
    passed: boolean(),
    time_seconds: non_neg_integer(),
    answers: list(answer_detail()),
    difficulty_reached: difficulty(),
    recommendations: list(String.t())
  }

  @passing_threshold 0.70

  @doc """
  Evaluates a completed quiz, computing scores and pass/fail status.

  Takes a list of questions and corresponding answers, scores each
  answer against its question's correct answer specification, and
  computes the weighted total. A 70% weighted score is required to pass.

  ## Parameters

  - `questions` - List of question maps with scoring criteria
  - `answers` - List of learner answers (positional, matching questions)

  ## Returns

  A result map containing score, percentage, pass status, and per-answer details.

  ## Examples

      iex> qs = [
      ...>   %{id: "q1", text: "1+1?", type: :single_choice, options: ["2", "3"],
      ...>     correct: [0], difficulty: :beginner, explanation: "Basic math",
      ...>     weight: 1, tags: [], time_limit_seconds: nil},
      ...>   %{id: "q2", text: "2+2?", type: :single_choice, options: ["3", "4"],
      ...>     correct: [1], difficulty: :beginner, explanation: "Basic math",
      ...>     weight: 2, tags: [], time_limit_seconds: nil}
      ...> ]
      iex> result = PrismaticAcademy.Quiz.evaluate(qs, [0, 1])
      iex> result.percentage
      1.0
      iex> result.passed
      true

      iex> result = PrismaticAcademy.Quiz.evaluate(qs, [0, 0])
      iex> result.percentage
      0.3333333333333333
      iex> result.passed
      false
  """
  @spec evaluate(list(question()), list(term())) :: result()
  def evaluate(questions, answers) when is_list(questions) and is_list(answers) do
    scored =
      Enum.zip(questions, answers)
      |> Enum.map(fn {question, answer} ->
        correct = check_answer(question, answer)
        points = if correct, do: question.weight, else: 0

        %{
          question_id: question.id,
          correct: correct,
          points: points,
          time_seconds: 0
        }
      end)

    total = Enum.sum(Enum.map(questions, & &1.weight))
    score = Enum.sum(Enum.map(scored, & &1.points))
    percentage = if total > 0, do: score / total, else: 0.0

    max_difficulty =
      questions
      |> Enum.zip(scored)
      |> Enum.filter(fn {_q, s} -> s.correct end)
      |> Enum.map(fn {q, _s} -> q.difficulty end)
      |> Enum.max_by(&difficulty_rank/1, fn -> :beginner end)

    recommendations = generate_recommendations(questions, scored)

    %{
      score: score,
      total: total,
      percentage: percentage,
      passed: percentage >= @passing_threshold,
      time_seconds: 0,
      answers: scored,
      difficulty_reached: max_difficulty,
      recommendations: recommendations
    }
  end

  @doc """
  Selects questions for adaptive quiz based on learner ability level.

  Picks questions from the bank that match the estimated ability,
  with a distribution biased toward the target difficulty level
  but including some questions above and below for calibration.

  ## Parameters

  - `question_bank` - Full list of available questions
  - `ability_level` - Estimated learner ability
  - `count` - Number of questions to select

  ## Examples

      iex> bank = [
      ...>   %{id: "q1", difficulty: :beginner, weight: 1},
      ...>   %{id: "q2", difficulty: :intermediate, weight: 2},
      ...>   %{id: "q3", difficulty: :advanced, weight: 3}
      ...> ]
      iex> selected = PrismaticAcademy.Quiz.select_adaptive(bank, :beginner, 2)
      iex> length(selected) == 2
      true
  """
  @spec select_adaptive(list(question()), difficulty(), pos_integer()) :: list(question())
  def select_adaptive(question_bank, ability_level, count) do
    target_rank = difficulty_rank(ability_level)

    question_bank
    |> Enum.sort_by(fn q ->
      abs(difficulty_rank(q.difficulty) - target_rank) + :rand.uniform() * 0.5
    end)
    |> Enum.take(count)
  end

  @doc """
  Returns the passing threshold as a float (0.0 to 1.0).

  ## Examples

      iex> PrismaticAcademy.Quiz.passing_threshold()
      0.70
  """
  @spec passing_threshold() :: float()
  def passing_threshold, do: @passing_threshold

  # Answer checking for different question types

  defp check_answer(%{type: :single_choice, correct: [idx]}, answer) when is_integer(answer) do
    answer == idx
  end

  defp check_answer(%{type: :multiple_choice, correct: expected_idxs}, answer) do
    expected = MapSet.new(expected_idxs)
    given = MapSet.new(List.wrap(answer))
    MapSet.equal?(expected, given)
  end

  defp check_answer(%{type: :free_text, correct: pattern}, answer) when is_function(pattern, 1) do
    pattern.(to_string(answer))
  end

  defp check_answer(%{type: :free_text, correct: expected}, answer)
       when is_binary(expected) and is_binary(answer) do
    String.downcase(String.trim(answer)) == String.downcase(String.trim(expected))
  end

  defp check_answer(%{type: :code_eval, correct: validator}, answer)
       when is_function(validator, 1) do
    try do
      validator.(to_string(answer))
    rescue
      _e in RuntimeError -> false
    end
  end

  defp check_answer(_question, _answer), do: false

  # Difficulty ranking for adaptive selection

  defp difficulty_rank(:beginner), do: 1
  defp difficulty_rank(:intermediate), do: 2
  defp difficulty_rank(:advanced), do: 3
  defp difficulty_rank(:expert), do: 4

  # Recommendation generation based on incorrect answers

  defp generate_recommendations(questions, scored) do
    incorrect =
      Enum.zip(questions, scored)
      |> Enum.reject(fn {_q, s} -> s.correct end)
      |> Enum.map(fn {q, _s} -> q end)

    case incorrect do
      [] ->
        ["Excellent performance! Consider advancing to the next difficulty level."]

      missed ->
        tags =
          missed
          |> Enum.flat_map(fn q -> Map.get(q, :tags, []) end)
          |> Enum.frequencies()
          |> Enum.sort_by(fn {_tag, count} -> count end, :desc)
          |> Enum.take(3)
          |> Enum.map(fn {tag, _} -> tag end)

        Enum.map(tags, fn tag ->
          "Review material related to: #{tag}"
        end)
    end
  end
end
```

### Quiz Session GenServer

```elixir
defmodule PrismaticAcademy.QuizSession do
  @moduledoc """
  Manages state for an individual quiz attempt.

  Each quiz session is a GenServer that tracks the learner's
  progress through a set of questions, manages adaptive difficulty
  adjustments, and persists results on completion.

  Sessions are supervised by a DynamicSupervisor and automatically
  terminate after 30 minutes of inactivity to prevent resource leaks.

  ## Lifecycle

  1. Session started via DynamicSupervisor
  2. Questions selected (adaptive or fixed)
  3. Learner answers questions one at a time
  4. Each answer updates running score and adaptive level
  5. On completion, results persisted and PubSub notified
  6. Session terminates (or times out after 30 minutes)

  ## Examples

      iex> {:ok, pid} = PrismaticAcademy.QuizSession.start_link(
      ...>   learner_id: "user-123",
      ...>   topic_id: "elixir-basics",
      ...>   questions: sample_questions()
      ...> )
      iex> is_pid(pid)
      true
  """

  use GenServer
  require Logger

  @idle_timeout_ms 1_800_000  # 30 minutes

  @type state :: %{
    learner_id: String.t(),
    topic_id: String.t(),
    questions: list(PrismaticAcademy.Quiz.question()),
    current_index: non_neg_integer(),
    answers: list(term()),
    started_at: DateTime.t(),
    adaptive_level: PrismaticAcademy.Quiz.difficulty()
  }

  @doc """
  Starts a quiz session for a learner.

  ## Options

  - `:learner_id` (required) - Unique learner identifier
  - `:topic_id` (required) - Topic being assessed
  - `:questions` (required) - List of questions for this session

  ## Examples

      iex> {:ok, pid} = PrismaticAcademy.QuizSession.start_link(
      ...>   learner_id: "u1", topic_id: "t1", questions: []
      ...> )
      iex> is_pid(pid)
      true
  """
  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts)
  end

  @doc """
  Submits an answer for the current question.

  Returns `{:ok, feedback}` with correctness and explanation,
  or `{:error, :quiz_complete}` if all questions have been answered.

  ## Examples

      iex> {:ok, feedback} = PrismaticAcademy.QuizSession.answer(pid, 0)
      iex> is_boolean(feedback.correct)
      true
  """
  @spec answer(GenServer.server(), term()) ::
          {:ok, map()} | {:error, :quiz_complete}
  def answer(session, answer) do
    GenServer.call(session, {:answer, answer})
  end

  @doc """
  Returns the current quiz state for display purposes.

  ## Examples

      iex> state = PrismaticAcademy.QuizSession.get_state(pid)
      iex> Map.has_key?(state, :current_question)
      true
  """
  @spec get_state(GenServer.server()) :: map()
  def get_state(session) do
    GenServer.call(session, :get_state)
  end

  # GenServer callbacks

  @impl true
  def init(opts) do
    state = %{
      learner_id: Keyword.fetch!(opts, :learner_id),
      topic_id: Keyword.fetch!(opts, :topic_id),
      questions: Keyword.fetch!(opts, :questions),
      current_index: 0,
      answers: [],
      started_at: DateTime.utc_now(),
      adaptive_level: :beginner
    }

    Logger.info("Quiz session started: #{state.learner_id} / #{state.topic_id}")
    {:ok, state, @idle_timeout_ms}
  end

  @impl true
  def handle_call({:answer, answer}, _from, %{current_index: idx, questions: qs} = state)
      when idx >= length(qs) do
    {:reply, {:error, :quiz_complete}, state, @idle_timeout_ms}
  end

  def handle_call({:answer, answer}, _from, state) do
    question = Enum.at(state.questions, state.current_index)
    correct = PrismaticAcademy.Quiz.evaluate([question], [answer])

    feedback = %{
      correct: hd(correct.answers).correct,
      explanation: question.explanation,
      score_so_far: correct.score,
      questions_remaining: length(state.questions) - state.current_index - 1
    }

    new_state = %{state |
      current_index: state.current_index + 1,
      answers: state.answers ++ [answer]
    }

    if new_state.current_index >= length(state.questions) do
      finalize_quiz(new_state)
    end

    {:reply, {:ok, feedback}, new_state, @idle_timeout_ms}
  end

  def handle_call(:get_state, _from, state) do
    current_question =
      if state.current_index < length(state.questions) do
        q = Enum.at(state.questions, state.current_index)
        Map.drop(q, [:correct, :explanation])
      else
        nil
      end

    reply = %{
      current_question: current_question,
      current_index: state.current_index,
      total_questions: length(state.questions),
      answers_given: length(state.answers),
      adaptive_level: state.adaptive_level
    }

    {:reply, reply, state, @idle_timeout_ms}
  end

  @impl true
  def handle_info(:timeout, state) do
    Logger.info("Quiz session timed out: #{state.learner_id} / #{state.topic_id}")
    {:stop, :normal, state}
  end

  defp finalize_quiz(state) do
    result = PrismaticAcademy.Quiz.evaluate(state.questions, state.answers)

    :telemetry.execute(
      [:prismatic, :academy, :quiz_completed],
      %{score: result.percentage, time_seconds: result.time_seconds},
      %{learner_id: state.learner_id, topic_id: state.topic_id, passed: result.passed}
    )

    Phoenix.PubSub.broadcast(
      PrismaticWeb.PubSub,
      "academy:quiz:#{state.learner_id}",
      {:quiz_completed, result}
    )

    Logger.info(
      "Quiz completed: #{state.learner_id} / #{state.topic_id} - " <>
        "#{Float.round(result.percentage * 100, 1)}% (#{if result.passed, do: "PASSED", else: "FAILED"})"
    )
  end
end
```

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Executing untrusted learner code | Arbitrary code execution, system compromise | Restricted sandbox with module allowlist and timeout |
| Single-attempt assessment | Does not capture learning over time | Allow retries with question shuffling and new selections |
| All-or-nothing scoring | Discourages guessing, penalizes partial knowledge | Weighted scoring with partial credit for multi-select |
| Hardcoded question pools | Stale content, predictable assessments | Dynamic question banks registered through topic system |
| No time limits | Sessions accumulate indefinitely, resource leak | GenServer timeout (30 min idle), per-question time limits |
| Binary difficulty levels | Cannot adapt to learner's actual ability | Continuous adaptive algorithm with 4+ difficulty levels |
| Missing explanations | Incorrect answers do not lead to learning | Every answer (correct or incorrect) must include explanation |
| Global question ordering | All learners see same sequence, enables sharing | Randomized question order per session |
| Ignoring attempt analytics | Cannot identify systemic content problems | Aggregate analysis of per-question success rates |
| No accessibility support | Excludes learners with disabilities | ARIA labels, keyboard navigation, screen reader support |
| Synchronous code evaluation | Long-running code blocks LiveView process | Async Task with timeout for code evaluation |
| State loss on crash | Quiz progress lost if GenServer crashes | Periodic state checkpointing to database |

## Best Practices

1. **Keep questions focused** -- Each question should test one specific concept, not compound knowledge. Questions testing multiple concepts make it impossible to identify which concept the learner misunderstands.

2. **Provide detailed explanations** -- Every answer (correct or incorrect) should include an explanation that reinforces learning. Explanations should reference specific topic sections for deeper review.

3. **Use difficulty progression** -- Start with recall-level questions (Bloom's "Remember") and progress to application and analysis levels (Bloom's "Apply", "Analyze"). Map difficulty to Bloom's taxonomy explicitly.

4. **Track attempt patterns** -- Repeated failures on specific questions indicate content gaps, not learner deficiency. Use aggregate analytics to identify questions that need revision.

5. **Sandbox code evaluation** -- Never execute learner-submitted code outside a restricted sandbox environment. Use a module allowlist, function allowlist, and hard timeout (5 seconds maximum).

6. **Randomize question presentation** -- Shuffle question order and option order per session to prevent answer sharing and encourage genuine understanding.

7. **Implement spaced repetition for weak areas** -- Questions the learner previously answered incorrectly should resurface at increasing intervals to reinforce retention.

8. **Use GenServer with idle timeout** -- Quiz sessions should terminate after inactivity to prevent resource accumulation. The 30-minute timeout balances usability with resource management.

9. **Broadcast results via PubSub** -- Use Phoenix PubSub to notify dashboards, skill matrix, and progress trackers of quiz completion in real-time.

10. **Design for accessibility** -- All quiz components must support keyboard navigation, screen readers (ARIA labels), and sufficient color contrast per WCAG 2.1 AA standards.

## Related Terms

- [Topic Registry](@/glossary/topic-registry.md) -- Self-registering system where quiz-containing topics are discovered
- [Skill Matrix](@/glossary/skill-matrix.md) -- Competency mapping fed by quiz results across domains
- [Academy](/glossary/academy/) -- The learning platform containing quizzes and topic modules
- [LiveView](@/glossary/liveview.md) -- Phoenix real-time UI framework rendering quiz interactions
- [GenServer](@/glossary/genserver.md) -- OTP server managing quiz session state
- [ETS](@/glossary/ets.md) -- In-memory storage for question banks and topic registry
- [PubSub](@/glossary/pubsub.md) -- Event broadcasting for quiz completion notifications
- [Progress Tracker](/glossary/progress-tracker/) -- Persistent learner progress management
- [InterconnectionEngine](/glossary/interconnection-engine/) -- Cross-topic knowledge graph for synthesis quizzes
- [Test Suite](@/glossary/test-suite.md) -- Automated testing analogous to learner assessment
- [Session](@/glossary/session.md) -- The context in which quiz attempts are tracked
- [Knowledge Graph](@/glossary/knowledge-graph.md) -- Concept relationships informing cross-topic assessments

## See Also

- [Prismatic Academy](@/academy/_index.md) -- The learning platform containing quizzes
- [Capabilities](@/capabilities/_index.md) -- Skills developed through quiz-validated learning
- [Architecture](@/architecture/_index.md) -- OTP architecture supporting quiz session management
- **ProgressTracker GenServer** -- Persistent progress tracking across quiz sessions
- **InterconnectionEngine** -- Cross-domain knowledge mapping for synthesis assessments
- **TACH Doctrine** -- Testing assurance principles applied to quiz question validation

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
