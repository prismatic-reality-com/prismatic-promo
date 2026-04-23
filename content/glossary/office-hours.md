+++
title = "Office Hours"
weight = 50
[extra]
description = "Structured recurring sessions for knowledge sharing, collaborative problem-solving, architectural review, and community engagement in open-source platform development, enabling synchronous interaction between maintainers, contributors, and users"
category = "community"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "17 min"
difficulty = "intermediate"
quality_score = 95
related_terms = ["community-engagement", "mentorship", "community-building", "developer-experience", "collaborative-development", "workshop-facilitation", "conference-speaking", "developer-community", "documentation", "knowledge-graph"]
keywords = ["office hours software development", "developer office hours format", "open source community engagement", "technical mentorship sessions", "architectural review meetings", "community interaction patterns", "knowledge transfer sessions", "collaborative debugging sessions", "open source maintainer time", "developer relations office hours"]
tags = ["community", "collaboration", "knowledge-sharing", "mentorship", "developer-experience"]
date_created = "2026-02-22"
use_cases = ["contributor onboarding", "architectural design review", "community Q&A", "bug triage", "roadmap discussion", "pair programming", "code review workshops"]
technologies = ["Elixir", "Phoenix LiveView", "OTP", "WebSocket"]
word_count = 1785
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Office Hours - Prismatic Platform"
+++

## Definition

Office Hours is a structured, recurring engagement format in which platform maintainers, core contributors, or domain experts make themselves available for synchronous interaction with the broader community. In the context of open-source software development and platform engineering, office hours serve as a bridge between asynchronous collaboration (issues, pull requests, documentation) and fully synchronous collaboration (pair programming, real-time design sessions). Participants can bring questions about architecture, request guidance on contribution workflows, discuss design decisions, debug issues collaboratively, or simply observe conversations between experienced practitioners.

Unlike ad-hoc meetings or scheduled design reviews, office hours are characterized by their regularity (weekly, biweekly), open invitation (anyone can attend without pre-registration), low formality (no fixed agenda, participant-driven), and knowledge dissemination focus (the goal is learning, not decision-making). In the Prismatic Platform ecosystem, office hours represent a commitment to the principles of [Open Source Advocacy](@/glossary/open-source-advocacy.md) -- that knowledge sharing and community interaction are not peripheral activities but core platform operations.

## Overview

The office hours concept originates from academic practice, where professors designate regular times for students to seek guidance outside of lectures. The format translates naturally to open-source software development, where the analogous challenge is enabling asynchronous contributors to access the tacit knowledge that core maintainers carry -- knowledge about design rationale, architectural constraints, historical context, and unwritten conventions that cannot be fully captured in documentation.

In the open-source ecosystem, office hours have become an established practice among successful projects. Kubernetes holds weekly community meetings, Rust has working group sync meetings, and many CNCF projects maintain regular office hours for users and contributors. The practice addresses a fundamental asymmetry in open-source development: maintainers possess deep contextual knowledge, while new contributors need that knowledge to participate effectively. Documentation can bridge this gap partially, but synchronous interaction enables the kind of back-and-forth clarification, contextual exploration, and serendipitous knowledge transfer that static text cannot replicate.

For platform engineering organizations, office hours serve an additional purpose: they create a structured forum for cross-team knowledge sharing. In a large platform with 115 umbrella applications and 530+ agents, no single person understands the entire system. Office hours enable engineers working on different subsystems to learn about each other's domains, identify integration opportunities, and surface cross-cutting concerns that might otherwise remain invisible.

The effectiveness of office hours depends on several factors: consistent scheduling (building habit and expectation), appropriate scope (broad enough to be useful, focused enough to be productive), skilled facilitation (managing diverse participants and topics), accessible tooling (low friction to join and participate), and follow-up mechanisms (capturing decisions and action items from sessions).

## Technical Details

### Scheduling and Session Management

A robust office hours system requires programmatic session management to handle scheduling, notifications, recording, and follow-up. The following Elixir implementation demonstrates a session lifecycle manager.

```elixir
defmodule Prismatic.Community.OfficeHours do
  @moduledoc """
  Office Hours session management system. Handles scheduling,
  participant registration, topic queuing, and session lifecycle
  for recurring community engagement sessions.
  """

  use GenServer

  @type session_status :: :scheduled | :in_progress | :completed | :cancelled
  @type topic_priority :: :high | :medium | :low

  @type session :: %{
    id: String.t(),
    scheduled_at: DateTime.t(),
    duration_minutes: pos_integer(),
    status: session_status(),
    host: String.t(),
    participants: [String.t()],
    topics: [topic()],
    notes: String.t(),
    recording_url: String.t() | nil
  }

  @type topic :: %{
    title: String.t(),
    submitted_by: String.t(),
    priority: topic_priority(),
    description: String.t(),
    votes: non_neg_integer()
  }

  defstruct [
    :sessions,
    :recurring_schedule,
    :topic_queue,
    :config
  ]

  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(opts) do
    config = %{
      default_duration: Keyword.get(opts, :duration, 60),
      timezone: Keyword.get(opts, :timezone, "Europe/Prague"),
      max_topics_per_session: Keyword.get(opts, :max_topics, 5),
      notification_lead_time: Keyword.get(opts, :lead_time, 24 * 60)
    }

    state = %__MODULE__{
      sessions: %{},
      recurring_schedule: build_recurring_schedule(opts),
      topic_queue: [],
      config: config
    }

    schedule_next_notification(state)
    {:ok, state}
  end

  @spec schedule_session(DateTime.t(), String.t(), keyword()) ::
          {:ok, session()} | {:error, term()}
  def schedule_session(datetime, host, opts \\ []) do
    GenServer.call(__MODULE__, {:schedule, datetime, host, opts})
  end

  @spec submit_topic(String.t(), String.t(), String.t(), keyword()) ::
          {:ok, topic()} | {:error, term()}
  def submit_topic(session_id, title, submitted_by, opts \\ []) do
    GenServer.call(
      __MODULE__,
      {:submit_topic, session_id, title, submitted_by, opts}
    )
  end

  @spec start_session(String.t()) :: {:ok, session()} | {:error, term()}
  def start_session(session_id) do
    GenServer.call(__MODULE__, {:start_session, session_id})
  end

  @spec complete_session(String.t(), keyword()) ::
          {:ok, session()} | {:error, term()}
  def complete_session(session_id, opts \\ []) do
    GenServer.call(__MODULE__, {:complete_session, session_id, opts})
  end

  @spec list_upcoming() :: [session()]
  def list_upcoming do
    GenServer.call(__MODULE__, :list_upcoming)
  end

  @impl true
  def handle_call({:schedule, datetime, host, opts}, _from, state) do
    session = %{
      id: generate_id(),
      scheduled_at: datetime,
      duration_minutes:
        Keyword.get(opts, :duration, state.config.default_duration),
      status: :scheduled,
      host: host,
      participants: [],
      topics: [],
      notes: "",
      recording_url: nil
    }

    updated_sessions = Map.put(state.sessions, session.id, session)
    {:reply, {:ok, session}, %{state | sessions: updated_sessions}}
  end

  @impl true
  def handle_call(
        {:submit_topic, session_id, title, submitted_by, opts},
        _from,
        state
      ) do
    case Map.get(state.sessions, session_id) do
      nil ->
        {:reply, {:error, :session_not_found}, state}

      session when session.status == :scheduled ->
        topic = %{
          title: title,
          submitted_by: submitted_by,
          priority: Keyword.get(opts, :priority, :medium),
          description: Keyword.get(opts, :description, ""),
          votes: 0
        }

        updated_session = %{session | topics: session.topics ++ [topic]}
        updated = Map.put(state.sessions, session_id, updated_session)
        {:reply, {:ok, topic}, %{state | sessions: updated}}

      _session ->
        {:reply, {:error, :session_not_accepting_topics}, state}
    end
  end

  @impl true
  def handle_call({:start_session, session_id}, _from, state) do
    case Map.get(state.sessions, session_id) do
      nil ->
        {:reply, {:error, :session_not_found}, state}

      %{status: :scheduled} = session ->
        updated = %{session | status: :in_progress}
        updated_sessions = Map.put(state.sessions, session_id, updated)

        :telemetry.execute(
          [:prismatic, :community, :office_hours, :session_started],
          %{
            topic_count: length(updated.topics),
            participant_count: length(updated.participants)
          },
          %{session_id: session_id, host: updated.host}
        )

        {:reply, {:ok, updated}, %{state | sessions: updated_sessions}}

      _ ->
        {:reply, {:error, :invalid_session_state}, state}
    end
  end

  @impl true
  def handle_call({:complete_session, session_id, opts}, _from, state) do
    case Map.get(state.sessions, session_id) do
      nil ->
        {:reply, {:error, :session_not_found}, state}

      %{status: :in_progress} = session ->
        updated = %{
          session
          | status: :completed,
            notes: Keyword.get(opts, :notes, session.notes),
            recording_url: Keyword.get(opts, :recording_url)
        }

        updated_sessions = Map.put(state.sessions, session_id, updated)
        {:reply, {:ok, updated}, %{state | sessions: updated_sessions}}

      _ ->
        {:reply, {:error, :invalid_session_state}, state}
    end
  end

  @impl true
  def handle_call(:list_upcoming, _from, state) do
    now = DateTime.utc_now()

    upcoming =
      state.sessions
      |> Map.values()
      |> Enum.filter(fn s ->
        s.status == :scheduled and DateTime.after?(s.scheduled_at, now)
      end)
      |> Enum.sort_by(& &1.scheduled_at, DateTime)

    {:reply, upcoming, state}
  end

  defp build_recurring_schedule(opts) do
    %{
      day_of_week: Keyword.get(opts, :day, :wednesday),
      hour: Keyword.get(opts, :hour, 14),
      minute: Keyword.get(opts, :minute, 0),
      frequency: Keyword.get(opts, :frequency, :weekly)
    }
  end

  defp schedule_next_notification(_state) do
    Process.send_after(self(), :check_notifications, :timer.minutes(15))
  end

  defp generate_id do
    :crypto.strong_rand_bytes(8) |> Base.url_encode64(padding: false)
  end
end
```

### LiveView Dashboard for Office Hours

The Prismatic Platform uses Phoenix LiveView for real-time session interfaces, enabling participants to join, submit topics, vote, and interact during live sessions.

```elixir
defmodule PrismaticWeb.OfficeHoursLive do
  @moduledoc """
  LiveView interface for office hours sessions.
  Provides real-time topic submission, voting, and
  session state updates via PubSub.
  """

  use PrismaticWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      Phoenix.PubSub.subscribe(
        Prismatic.PubSub,
        "office_hours:updates"
      )
    end

    upcoming = Prismatic.Community.OfficeHours.list_upcoming()

    {:ok,
     assign(socket,
       upcoming_sessions: upcoming,
       active_session: nil,
       topic_form:
         to_form(%{
           "title" => "",
           "description" => "",
           "priority" => "medium"
         })
     )}
  end

  @impl true
  def handle_event("submit_topic", params, socket) do
    %{"title" => title, "description" => desc, "priority" => priority} =
      params

    case socket.assigns.active_session do
      nil ->
        {:noreply, put_flash(socket, :error, "No active session")}

      session ->
        case Prismatic.Community.OfficeHours.submit_topic(
               session.id,
               title,
               socket.assigns.current_user,
               priority: String.to_atom(priority),
               description: desc
             ) do
          {:ok, _topic} ->
            {:noreply, put_flash(socket, :info, "Topic submitted")}

          {:error, reason} ->
            {:noreply,
             put_flash(socket, :error, "Failed: #{inspect(reason)}")}
        end
    end
  end

  @impl true
  def handle_info({:session_update, session}, socket) do
    {:noreply, assign(socket, active_session: session)}
  end
end
```

### Knowledge Capture Pipeline

The most valuable output of office hours is the tacit knowledge that surfaces during discussion. A knowledge capture pipeline extracts, structures, and stores this knowledge for future reference.

```elixir
defmodule Prismatic.Community.KnowledgeCapture do
  @moduledoc """
  Captures and structures knowledge from office hours sessions.
  Extracts decisions, action items, architectural insights,
  and FAQ entries from session notes and transcripts.
  """

  @type knowledge_entry :: %{
    type: :decision | :action_item | :insight | :faq | :pattern,
    content: String.t(),
    context: String.t(),
    session_id: String.t(),
    timestamp: DateTime.t(),
    tags: [String.t()]
  }

  @spec capture_from_session(map()) ::
          {:ok, [knowledge_entry()]} | {:error, term()}
  def capture_from_session(%{id: session_id, notes: notes, topics: topics}) do
    entries =
      extract_decisions(notes, session_id) ++
        extract_action_items(notes, session_id) ++
        extract_insights(topics, session_id) ++
        extract_faq_entries(notes, session_id)

    Enum.each(entries, &store_entry/1)
    {:ok, entries}
  end

  defp extract_decisions(notes, session_id) do
    ~r/DECISION:\s*(.+?)(?:\n|$)/i
    |> Regex.scan(notes)
    |> Enum.map(fn [_, content] ->
      %{
        type: :decision,
        content: String.trim(content),
        context: "Office Hours Session #{session_id}",
        session_id: session_id,
        timestamp: DateTime.utc_now(),
        tags: ["decision", "office-hours"]
      }
    end)
  end

  defp extract_action_items(notes, session_id) do
    ~r/(?:TODO|ACTION):\s*(.+?)(?:\n|$)/i
    |> Regex.scan(notes)
    |> Enum.map(fn [_, content] ->
      %{
        type: :action_item,
        content: String.trim(content),
        context: "Office Hours Session #{session_id}",
        session_id: session_id,
        timestamp: DateTime.utc_now(),
        tags: ["action-item", "office-hours"]
      }
    end)
  end

  defp extract_insights(topics, session_id) do
    topics
    |> Enum.filter(fn t -> String.length(t.description) > 100 end)
    |> Enum.map(fn topic ->
      tag =
        topic.title
        |> String.downcase()
        |> String.replace(~r/\s+/, "-")

      %{
        type: :insight,
        content: topic.description,
        context: "Topic: #{topic.title} (Session #{session_id})",
        session_id: session_id,
        timestamp: DateTime.utc_now(),
        tags: ["insight", "office-hours", tag]
      }
    end)
  end

  defp extract_faq_entries(notes, session_id) do
    ~r/Q:\s*(.+?)\nA:\s*(.+?)(?:\n\n|$)/is
    |> Regex.scan(notes)
    |> Enum.map(fn [_, question, answer] ->
      %{
        type: :faq,
        content:
          "Q: #{String.trim(question)}\nA: #{String.trim(answer)}",
        context: "Office Hours Session #{session_id}",
        session_id: session_id,
        timestamp: DateTime.utc_now(),
        tags: ["faq", "office-hours"]
      }
    end)
  end

  defp store_entry(entry) do
    :ets.insert(:knowledge_base, {generate_key(entry), entry})
  end

  defp generate_key(entry) do
    :crypto.hash(
      :sha256,
      "#{entry.session_id}:#{entry.type}:#{entry.content}"
    )
    |> Base.url_encode64(padding: false)
    |> binary_part(0, 16)
  end
end
```

## Implementation in the Prismatic Platform

### Community Engagement Model

The Prismatic Platform's community engagement strategy positions office hours as the primary synchronous interaction channel within a broader engagement pyramid. At the base, asynchronous channels (GitHub Issues, GitLab Issues, documentation, glossary) serve the largest audience with the lowest barrier to entry. In the middle tier, office hours provide regular synchronous access for active contributors and users. At the top tier, dedicated mentorship and pair programming sessions serve committed contributors working on complex features.

This tiered model ensures that community investment scales with community engagement. Casual users can find answers in documentation. Active users can attend office hours. Dedicated contributors receive direct mentorship. The Prismatic Platform's 530+ agent system, 115 umbrella apps, and 2.8M lines of code create significant knowledge barriers for new contributors. Office hours lower these barriers by providing a forum where questions that are difficult to answer through documentation alone can be addressed through interactive dialogue.

### Architectural Decision Records

Office hours frequently surface architectural questions that lead to design decisions. The platform captures these decisions through Architectural Decision Records (ADRs) that are linked back to the office hours session where the discussion occurred. This creates a traceable provenance chain from question to discussion to decision to implementation, supporting the Nabla Infinity axiom of Provenance Mandatory.

### Contributor Onboarding Pathway

New contributors follow a structured onboarding pathway that includes attending at least two office hours sessions before submitting their first significant pull request. This ensures they have exposure to the platform's architectural philosophy, coding conventions, quality standards, and testing requirements before investing effort in implementation. The onboarding office hours cover: platform architecture overview, development environment setup, quality gate system, AIAD agent and command authoring, and the NO MERCY NO DOUBTS doctrine.

## Comparison with Alternative Engagement Formats

### Scheduled Meetings

Fixed-agenda meetings with specific invitees are appropriate for decision-making and status reporting but poor for knowledge sharing and community building. Office hours differ in their open-door policy, participant-driven agenda, and learning-first orientation.

### Chat and Forum Support

Asynchronous channels (Discord, Slack, Discourse) provide 24/7 availability but lack the depth of synchronous interaction. Complex architectural questions often require multiple rounds of clarification that are tedious in chat but natural in voice conversation. Office hours complement async channels by handling the questions that async channels struggle with.

### Conference Talks

Conference presentations reach large audiences with polished content but provide limited interaction. The knowledge transfer is one-directional (speaker to audience) with minimal feedback. Office hours are bidirectional: the host learns from participants' questions and use cases as much as participants learn from the host's expertise.

### Pair Programming

Pair programming provides the deepest knowledge transfer but requires significant time investment and scales to only one participant. Office hours occupy a middle ground: deeper than chat, broader than pairing, more interactive than talks.

### Documentation Sprints

Focused documentation efforts capture knowledge in permanent form but require significant coordination and produce artifacts that may become stale. Office hours generate knowledge continuously in small increments, and the knowledge capture pipeline converts session outputs into documentation updates.

## Best Practices

**Maintain consistent scheduling.** The value of office hours compounds over time as community members build the habit of attending. Changing times or skipping sessions erodes this habit. Schedule sessions at a fixed time and maintain them even when attendance is low.

**Rotate hosts across domains.** No single person understands the entire platform. Rotating hosts across different domain experts ensures broad topic coverage and prevents knowledge concentration. The Prismatic Platform rotates through architecture, security, OSINT, quality, and infrastructure experts.

**Capture and publish session notes.** Synchronous knowledge is ephemeral unless captured. Publish session notes, decisions, and action items within 24 hours of each session. The knowledge capture pipeline automates extraction of structured entries from session notes.

**Welcome silence.** Not every moment needs to be filled with discussion. Participants may need time to formulate questions. Comfortable silences signal a psychologically safe environment.

**Start with a brief update.** Begin each session with a 5-minute update on recent platform changes, upcoming releases, or noteworthy developments. This provides context and often sparks questions.

**Follow up on action items.** Track action items from session to session. Completing follow-ups demonstrates that office hours produce tangible outcomes, encouraging continued participation.

**Record sessions with consent.** Recordings extend the reach of office hours to those who cannot attend live. Always obtain participant consent before recording, and publish recordings in an accessible location.

## Common Pitfalls

**Irregular scheduling.** The most common failure mode is inconsistency. Skipping sessions, changing times, or cancelling when attendance is low sends the message that office hours are not a priority.

**Host monologue.** When the host dominates conversation, office hours become a lecture. Effective facilitation means asking questions, directing discussion, and creating space for participant contributions.

**Scope creep into decision-making.** Office hours are for knowledge sharing, not governance. Design decisions that emerge during office hours should be captured as proposals and ratified through the project's normal decision-making process, not treated as final simply because they were discussed in office hours.

**Excluding time zones.** A single office hours time inherently excludes contributors in distant time zones. Mitigate this by rotating times, offering async follow-up, or hosting multiple sessions at different times.

**No follow-through.** Questions raised in office hours that are not answered should be tracked and followed up on. Unanswered questions accumulate into a perception that office hours are not useful.

**Over-formalization.** Adding too much structure (mandatory agendas, formal presentations, registration requirements) transforms office hours into meetings and loses the casual, approachable character that makes them effective.

## Use Cases

**Contributor onboarding.** New contributors attend office hours to learn about platform architecture, development workflow, quality standards, and contribution guidelines through interactive Q&A rather than documentation alone.

**Architectural design review.** Engineers working on significant features present their design approach in office hours for feedback from experienced contributors before investing heavily in implementation.

**Bug triage.** Complex bugs that span multiple subsystems are discussed in office hours where contributors from different domains can collaborate on diagnosis and resolution strategies.

**Roadmap discussion.** Upcoming features and strategic direction are previewed in office hours, allowing community members to ask questions, raise concerns, and suggest alternatives before plans are finalized.

**Cross-team knowledge sharing.** Engineers from different platform subsystems present their domain's architecture, current challenges, and integration points, enabling the cross-pollination of ideas and identification of shared concerns.

**Quality improvement workshops.** Focused sessions on specific quality topics -- test writing, Credo compliance, Dialyzer annotation, performance optimization -- provide hands-on guidance that complements documentation.

## Related Concepts

Office hours connect to several community and development practices in the Prismatic Platform:

- [Community Engagement](@/glossary/community-engagement.md) -- the broader strategy of building and sustaining an active contributor community
- [Mentorship](@/glossary/mentorship.md) -- one-on-one knowledge transfer relationships that office hours can initiate
- [Community Building](@/glossary/community-building.md) -- the organizational effort to create and grow a healthy open-source community
- [Developer Experience](@/glossary/developer-experience.md) -- the overall quality of the contributor's interaction with the platform
- [Collaborative Development](@/glossary/collaborative-development.md) -- working together on shared codebases, which office hours facilitate
- [Workshop Facilitation](@/glossary/workshop-facilitation.md) -- structured teaching sessions that complement the informal learning of office hours
- [Conference Speaking](@/glossary/conference-speaking.md) -- public presentations that reach broader audiences than office hours
- [Documentation](@/glossary/documentation.md) -- the permanent knowledge artifacts that office hours help create and improve
- [Developer Community](@/glossary/developer-community.md) -- the people who participate in and benefit from office hours
- [Open Source Advocacy](@/glossary/open-source-advocacy.md) -- the principles of openness and sharing that office hours embody

## See Also

- [Knowledge Graph](@/glossary/knowledge-graph.md) -- structured knowledge representation that can store insights captured from office hours sessions
- [Learning Resource](@/glossary/learning-resource.md) -- educational materials that office hours sessions generate
- [Community Contributions](@/glossary/community-contributions.md) -- the work products that result from contributor engagement through office hours
- [Certification Programs](@/glossary/certification-programs.md) -- formal learning pathways that office hours complement informally
- [Share Openly](@/glossary/share-openly.md) -- the philosophical commitment to knowledge sharing that motivates office hours

---

**Connect and Contribute**: Created by [Tomas Korcak (korczis)](https://github.com/korczis) | Open Source under [GHL License](https://github.com/korczis/prismatic-platform/blob/main/LICENSE) | [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
