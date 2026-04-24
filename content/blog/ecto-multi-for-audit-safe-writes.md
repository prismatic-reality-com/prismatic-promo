+++
title = "Ecto.Multi for Audit-Safe Writes: The Transaction Is the Audit Trail"
date = 2026-04-09
description = "When a single user action touches five tables, you need atomicity AND a complete audit record. Ecto.Multi gives you both for free — if you commit to the pattern and never mix it with bare Repo calls."

[extra]
author = "Tomáš Korcak (korczis)"
category = "engineering"
tags = ["ecto", "ecto-multi", "transactions", "audit", "postgres"]
reading_time = "7 min"
keywords = ["Ecto.Multi", "audit trail", "transactional writes", "Elixir Postgres"]
image = "/images/blog/ecto-multi.png"
word_count = 520
date_created = "2026-04-09"
date_modified = "2026-04-09"
quality_score = 34
see_also = ["ecto", "acid-transactions", "postgresql", "audit-trail", "invariant"]
image_alt = "Ecto.Multi for Audit-Safe Writes"
+++

A DD case moves from "draft" to "in review". That one user click writes to the case table, inserts a state-transition row, appends to an audit log, updates a counter, and sends a PubSub broadcast. Five writes. Zero room for a partial failure. This is exactly the problem [Ecto](@/glossary/ecto.md) `Multi` was built to solve — and the problem most codebases solve badly.

## The bad shape

```elixir
# ❌ Not atomic, not audited, not safe
def approve(case_id, user_id) do
  Repo.update_all(Case, set: [state: "in_review"])
  Repo.insert!(%StateTransition{...})
  Repo.insert!(%AuditLog{...})
  Phoenix.PubSub.broadcast(...)
end
```

Three problems: any write can succeed while a later one fails, leaving inconsistent state; the PubSub broadcast fires even on failure; and the audit log is one row among many, not a guaranteed consequence of the state change.

## The good shape

```elixir
def approve(case_id, user_id) do
  Ecto.Multi.new()
  |> Ecto.Multi.run(:case, fn repo, _ ->
    case repo.get(Case, case_id) do
      nil -> {:error, :not_found}
      c when c.state != "draft" -> {:error, :invalid_state}
      c -> {:ok, c}
    end
  end)
  |> Ecto.Multi.update(:updated, fn %{case: c} ->
    Case.changeset(c, %{state: "in_review"})
  end)
  |> Ecto.Multi.insert(:transition, fn %{case: c} ->
    %StateTransition{case_id: c.id, from: "draft", to: "in_review", user_id: user_id}
  end)
  |> Ecto.Multi.insert(:audit, fn %{case: c} ->
    AuditLog.entry(user_id, "case.approve", %{case_id: c.id})
  end)
  |> Repo.transaction()
  |> broadcast_on_success()
end
```

Everything is atomic. If `:updated` fails because of a concurrent update, `:transition` and `:audit` are never written. The PubSub broadcast is gated behind a success match — it fires *only* if the whole multi committed.

## Invariants live in the Multi

The [invariant](@/glossary/invariant.md) "every state change has an audit row" is encoded in the Multi itself. You cannot skip the audit row because you cannot commit the state change without it. That is worlds better than a code review comment saying "remember to log state changes."

This is also how you get [ACID](@/glossary/acid-transactions.md) guarantees on aggregates without inventing an event-sourcing cathedral. Postgres already does the hard part; Multi just exposes it.

## The one rule

> Every write path touching more than one table goes through an Ecto.Multi. No exceptions.

The day someone adds a bare `Repo.insert` alongside a Multi is the day the audit trail stops being trustworthy. Lint it, grep it in CI, review it on every PR.

## Where to go next

- **Academy**: [Storage Patterns](/academy/storage-patterns) — when to reach for Multi
- **Academy**: [DD Investigation](/academy/dd-investigation) — how cases use Multi for state transitions
- **Glossary**: [Ecto](@/glossary/ecto.md), [ACID Transactions](@/glossary/acid-transactions.md), [PostgreSQL](@/glossary/postgresql.md), [Audit Trail](@/glossary/audit-trail.md), [Invariant](@/glossary/invariant.md)

The transaction is the audit trail. Treat it that way and a whole class of bugs stops existing.
