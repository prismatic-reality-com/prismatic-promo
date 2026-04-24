+++
title = "Observer in Production: The BEAM Introspection Nobody Talks About"
date = 2026-04-09
description = ":observer is the most underused debugging tool in the Elixir ecosystem. Attached to a running node, it shows you every process, every ETS table, every mailbox — live. Here's how to run it safely against prod."

[extra]
author = "Tomáš Korcak (korczis)"
category = "engineering"
tags = ["observer", "debugging", "beam", "production", "introspection"]
reading_time = "6 min"
keywords = ["Elixir observer", "BEAM introspection", "production debugging", "process inspection"]
image = "/images/blog/observer-prod.png"
word_count = 490
date_created = "2026-04-09"
date_modified = "2026-04-09"
quality_score = 33
see_also = ["observer", "introspection", "beam", "beam-vm", "monitoring"]
image_alt = "Observer in Production"
+++

The first time you attach [observer](@/glossary/observer.md) to a running production node and see every process, every mailbox, every ETS table, every linked supervisor — live, updating, interactive — you realize how much production debugging you have been doing blind. This is BEAM [introspection](@/glossary/introspection.md), and it is arguably the single biggest operational advantage Elixir has over other runtimes.

## Attaching to a remote node

```bash
# On your laptop, start a local node with the same cookie:
iex --sname debug --cookie $COOKIE

# Connect:
iex(debug@laptop)> Node.connect(:"prismatic@prod-01")
true

# Open observer scoped to the remote node:
iex(debug@laptop)> :observer.start()
# In Observer: Nodes → prismatic@prod-01
```

The GUI now shows the remote node's processes, applications, ETS tables, and load averages. Every tab is live. Drill into a process and see its mailbox depth, stack trace, links, monitors, and current function.

## What to look at first

Three tabs, three things:

1. **Processes** — sort by reductions desc. Top 10 tells you where the CPU went. Sort by message queue desc. Top 10 tells you which GenServer is overloaded.
2. **Applications** — the supervision tree visualized. Crashed children are obvious. Restart intensity is visible per supervisor.
3. **Table Viewer** — every [ETS](@/glossary/ets.md) table with row counts and memory. A table that keeps growing is a leak.

Most production problems show up in one of these three tabs in under a minute.

## Safety rules

Observer on prod is powerful enough to hurt you. Three rules:

1. **Read-only operations only.** Never kill a process, never delete from a table, never modify state via the UI. Use it to look.
2. **Cookie hygiene.** The prod cookie is a secret. Rotate after every team member who had it leaves. Treat it like an SSH key.
3. **Connect from a bastion.** Do not expose the distribution port to the internet. Tunnel through a bastion host and attach locally.

## The textual alternative

If GUI over SSH is too slow, `:runtime_tools` and `:recon` give you the same information in IEx:

```elixir
:recon.proc_count(:memory, 10)      # top 10 memory-hungry processes
:recon.proc_count(:message_queue_len, 10)  # top 10 overloaded mailboxes
:recon.bin_leak(10)                 # find binary memory leaks
```

`:recon` is the tool to reach for on locked-down hosts where Observer is a non-starter. Same information, text-only, scriptable.

## Where to go next

- **Academy**: [OTP Fundamentals](/academy/otp-fundamentals) — the supervision trees Observer visualizes
- **Glossary**: [Observer](@/glossary/observer.md), [Introspection](@/glossary/introspection.md), [BEAM](@/glossary/beam.md), [BEAM VM](@/glossary/beam-vm.md), [Monitoring](@/glossary/monitoring.md)

Most production debugging in other runtimes is archaeology. In Elixir it is live inspection. Use it.
