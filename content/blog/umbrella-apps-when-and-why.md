+++
title = "Umbrella Apps: When the Monolith Should Actually Split"
date = 2026-04-09
description = "Prismatic runs 94 umbrella apps. That number sounds insane until you realize what it isn't: 94 services, 94 deploys, or 94 teams. Here's the heuristic for when a module should become an app and when it should stay a module."

[extra]
author = "Tomáš Korcak (korczis)"
category = "architecture"
tags = ["umbrella", "architecture", "elixir", "modular-monolith", "mix"]
reading_time = "7 min"
keywords = ["Elixir umbrella", "modular monolith", "mix umbrella apps", "Prismatic architecture"]
image = "/images/blog/umbrella-apps.png"
word_count = 520
date_created = "2026-04-09"
date_modified = "2026-04-09"
quality_score = 34
see_also = ["umbrella", "umbrella-application", "otp-application", "modularity", "mix"]
image_alt = "Umbrella Apps: When and Why"
+++

"94 umbrella apps" sounds like a warning. It is actually a discipline. An [umbrella](/glossary/umbrella) is not microservices. It is a modular monolith where the boundaries the team cares about are enforced by the compiler, the supervisor tree, and the dependency graph — not by willpower. Get the split right and you get most of the benefits of services with none of the operational pain.

## What an app gives you that a module doesn't

A plain module gives you a namespace and a file. An [OTP application](/glossary/otp-application) gives you four things a module cannot:

1. **An independent supervision tree.** Crashes are scoped to the app, not the whole system.
2. **An explicit dependency graph.** `mix xref graph --format dot --source apps/foo/lib` shows exactly who depends on foo.
3. **A config boundary.** Per-app config files. Per-app env vars. Per-app telemetry prefixes.
4. **A deletion story.** "Remove the blog" is `rm -rf apps/prismatic_blog && mix deps.get` — not a week of archaeology.

The fourth one is the sleeper. Being able to delete a subsystem cleanly is the single best predictor of long-term codebase health.

## The split heuristic

Split a module into its own app when at least two of these are true:

- It has its own supervision tree (one or more long-lived [GenServers](/glossary/genserver)).
- It has its own config surface (env vars, runtime tunables, connection strings).
- It owns a storage concern that others consume via an API, not via shared tables.
- It could, in principle, be deleted without changing the rest of the system.

Do *not* split when:

- The module is just "things that go together". That is a namespace, not an app.
- The only reason is "it feels like a lot of code". LOC is not a boundary.
- It would create a cycle with an existing app. Cycles are the compiler's way of telling you the split is wrong.

## The 94-app graph

`mix xref graph` over Prismatic's umbrella shows a DAG with a small number of leaf nodes (`prismatic_core`, `prismatic_storage_core`) that nearly everything depends on, and a large number of feature apps that depend on those leaves but rarely on each other. That is the shape you want: a thin core, a wide rim, and no long horizontal edges.

When a new app needs to reach sideways into another feature app, the right question is "does that cross-dependency want to move into the core?" — almost always the answer is yes, and a small amount of refactoring prevents a tangle six months later.

## The deletion test

Pick an app. Ask: if the product killed this feature tomorrow, could I delete this app in one commit? If yes, the boundary is right. If no, it is too entangled — and the fix is not more documentation, it is moving the entanglement into the core or into another app.

## Where to go next

- **Academy**: [OTP Fundamentals](/academy/learn/otp-fundamentals) — supervision and app lifecycles
- **Academy**: [Development Workflow](/academy/learn/development-workflow) — how umbrella work is structured day-to-day
- **Glossary**: [Umbrella](/glossary/umbrella), [Umbrella Application](/glossary/umbrella-application), [OTP Application](/glossary/otp-application), [Modularity](/glossary/modularity), [Mix](/glossary/mix)

94 apps is not the goal. Being able to add or delete the 95th without fear — that is the goal.
