+++
title = "Interactive Academy: Learning Intelligence Engineering"
date = 2026-03-12
description = "Inside Prismatic Academy: self-registering learning topics, hands-on labs, ETS-backed topic registry, and how we built an interactive education system within a production platform."

[extra]
author = "Tomas Korcak (korczis)"
category = "product"
tags = ["academy", "education", "learning", "liveview", "interactive", "labs"]
reading_time = "7 min"
keywords = ["interactive learning platform", "OSINT training", "intelligence education", "hands-on labs", "Elixir academy system", "self-registering education"]
image = "/images/blog/interactive-academy.png"
word_count = 1300
date_created = "2026-03-12"
date_modified = "2026-03-12"
quality_score = 82
see_also = ["academy", "developers", "capabilities"]
image_alt = "Interactive Academy: Learning Intelligence Engineering - Prismatic Platform"
+++

Prismatic Academy is an interactive learning system built directly into the platform. Instead of separate documentation sites and external training tools, the Academy provides hands-on exercises alongside the production tools they teach. This post explains how we built it.

## Self-Registering Topics

Academy topics register themselves at compile time, similar to OSINT adapters:

```elixir
defmodule PrismaticAcademy.Topics.OsintFundamentals do
  use PrismaticAcademy.Topic

  @impl true
  def metadata do
    %{
      title: "OSINT Fundamentals",
      slug: "osint-fundamentals",
      category: :intelligence,
      difficulty: :beginner,
      estimated_time: "45 min",
      prerequisites: [],
      description: "Learn the basics of Open Source Intelligence gathering"
    }
  end

  @impl true
  def lessons do
    [
      %{title: "What is OSINT?", content: &lesson_1/0},
      %{title: "Source Categories", content: &lesson_2/0},
      %{title: "Your First Query", content: &lesson_3/0, exercise: true}
    ]
  end
end
```

The `use PrismaticAcademy.Topic` macro registers the topic in an ETS-backed registry at compile time. No manual registration is needed -- add a topic module, and it appears in the Academy automatically.

## ETS-Backed Topic Registry

The TopicRegistry uses the same ETS pattern as the OSINT adapter registry:

```elixir
defmodule PrismaticAcademy.TopicRegistry do
  @table :academy_topics

  def register(topic_module) do
    ensure_table()
    metadata = topic_module.metadata()
    :ets.insert(@table, {metadata.slug, topic_module, metadata})
  end

  def list_topics do
    ensure_table()
    :ets.tab2list(@table)
    |> Enum.map(fn {_slug, _module, metadata} -> metadata end)
    |> Enum.sort_by(& &1.category)
  end

  def get_topic(slug) do
    ensure_table()
    case :ets.lookup(@table, slug) do
      [{^slug, module, metadata}] -> {:ok, module, metadata}
      [] -> {:error, :not_found}
    end
  end
end
```

Lookups are sub-microsecond. The registry supports the same patterns as the platform's other registries: concurrent reads, lazy initialization, and compile-time loading.

## Interactive Exercises

Unlike static documentation, Academy exercises execute real platform code:

- **OSINT exercises** -- make actual queries against development adapters
- **Analysis exercises** -- run entity resolution on sample data
- **Security exercises** -- perform EASM scans on test domains
- **Architecture exercises** -- explore supervision trees and ETS tables

Exercises run in a sandboxed context that prevents modifications to production data while providing realistic results.

## LiveView-Powered Interface

The Academy interface uses five LiveView components:

| Component | Route | Purpose |
|-----------|-------|---------|
| TopicListLive | `/academy` | Browse all available topics |
| TopicDetailLive | `/academy/:slug` | Topic overview and lesson list |
| LessonLive | `/academy/:slug/:lesson` | Individual lesson with content |
| ExerciseLive | `/academy/:slug/:lesson/exercise` | Interactive exercise |
| ProgressLive | `/academy/progress` | Completion tracking |

The lesson view renders markdown content with embedded interactive components. When a lesson includes an exercise, the ExerciseLive component provides a form-based interface for executing the exercise and comparing results.

## Topic Categories

Current Academy topics span four categories:

| Category | Topics | Focus |
|----------|--------|-------|
| Intelligence | 2 | OSINT fundamentals, source evaluation |
| Security | 1 | Attack surface assessment |
| Engineering | 1 | Platform architecture patterns |

Each topic includes theory lessons, practical exercises, and knowledge checks. Topics are designed to be completed in 30-60 minutes.

## Integration with Platform

The Academy links bidirectionally with other platform features:

- **Blog posts** link to related Academy topics
- **Glossary entries** reference Academy lessons for deeper learning
- **OSINT tools** link to tutorials for their specific adapters
- **Lab exercises** provide sandbox environments for Academy exercises

This creates a learning mesh: wherever you are in the platform, relevant learning resources are one click away.

## Building New Topics

Adding a new Academy topic requires a single Elixir module:

1. Create `lib/prismatic_academy/topics/your_topic.ex`
2. Implement the `Topic` behaviour (metadata + lessons)
3. Compile -- the topic appears automatically

No routing changes, no configuration files, no database entries. The self-registration pattern eliminates the ceremony of adding new content.

## Conclusion

The Academy demonstrates a pattern that applies beyond education: self-registering modules that appear in the system automatically at compile time. Whether it is OSINT adapters, Academy topics, or blog articles, the pattern is the same -- define a behaviour, implement it, and let the registry handle discovery.

---

*Start learning at [Academy](/academy/) or browse the [Glossary](/glossary/) for quick reference on platform concepts.*
