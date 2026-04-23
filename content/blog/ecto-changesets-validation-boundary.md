+++
title = "Ecto Changesets as the Validation Boundary: Trust Ends at the Schema"
date = 2026-04-09
description = "Validation scattered across controllers, contexts, and tests is how bad data reaches the database. Ecto changesets give you one boundary — enforce it and delete the duplicated checks."

[extra]
author = "Tomáš Korcak (korczis)"
category = "engineering"
tags = ["ecto", "changeset", "validation", "boundary", "elixir"]
reading_time = "6 min"
keywords = ["Ecto changeset", "validation boundary", "input sanitization", "Phoenix contexts"]
image = "/images/blog/ecto-changesets.png"
word_count = 490
date_created = "2026-04-09"
date_modified = "2026-04-09"
quality_score = 33
see_also = ["ecto", "changeset", "validation", "input-sanitization", "invariant"]
image_alt = "Ecto Changesets as Validation Boundary"
+++

Validation is the worst kind of duplicated code. Once you have it in the controller *and* the context *and* the view *and* the test fixture, a single schema change means four places to update, three of which you'll miss. [Ecto](/glossary/ecto) [changesets](/glossary/changeset) solve this by giving you one boundary: input trusted if the changeset is valid, rejected otherwise, nowhere else allowed to check.

## The rule

> Every write path goes through a changeset. Every changeset is the *only* place that checks the input.

Break that rule and [validation](/glossary/validation) drifts. Enforce it and the context becomes a thin layer over `changeset/2`.

## The shape

```elixir
defmodule PrismaticDD.Entity do
  use Ecto.Schema
  import Ecto.Changeset

  schema "entities" do
    field :name, :string
    field :ico, :string
    field :country, :string
    field :tier, Ecto.Enum, values: [:t1, :t2, :t3, :t4]
    timestamps()
  end

  def changeset(entity, attrs) do
    entity
    |> cast(attrs, [:name, :ico, :country, :tier])
    |> validate_required([:name, :country, :tier])
    |> validate_length(:name, min: 1, max: 500)
    |> validate_format(:ico, ~r/^\d{8}$/, message: "must be 8 digits")
    |> validate_inclusion(:country, ~w(CZ SK DE AT PL))
    |> unique_constraint([:ico, :country])
  end
end
```

The [invariant](/glossary/invariant) "every entity has a valid ICO for its country" is encoded in the changeset, not in a helper function, not in a service layer, not in the view. A caller that wants a different rule writes a different changeset — `strict_changeset/2` for imports, `public_changeset/2` for web forms — but each of those is still the sole authority for its path.

## Cast at the boundary, not inside

```elixir
# ❌ Inside the context — too late
def create(attrs) do
  attrs = Map.put(attrs, :country, String.upcase(attrs[:country]))
  %Entity{} |> Entity.changeset(attrs) |> Repo.insert()
end

# ✅ At the changeset — the normalization is part of the contract
def changeset(entity, attrs) do
  attrs = normalize_country(attrs)
  entity
  |> cast(attrs, [:name, :ico, :country, :tier])
  |> ...
end
```

Normalization that happens outside the changeset is normalization that other callers can skip. Put it inside and every caller gets it for free.

## [Input sanitization](/glossary/input-sanitization) is not validation

Sanitization (stripping dangerous HTML, trimming whitespace, normalizing unicode) happens BEFORE validation — but still inside the changeset, via a `prepare_changes` hook. It is not a separate step some callers can forget.

## When to add multiple changesets

When two call sites have genuinely different rules. Public web form vs admin import vs API. Each gets a named function — `public_changeset/2`, `import_changeset/2`, `api_changeset/2` — and the call site picks the right one. What you *do not* do is put an `if web?` inside one changeset.

## Where to go next

- **Academy**: [Storage Patterns](/academy/learn/storage-patterns) — changesets in context modules
- **Glossary**: [Ecto](/glossary/ecto), [Changeset](/glossary/changeset), [Validation](/glossary/validation), [Input Sanitization](/glossary/input-sanitization), [Invariant](/glossary/invariant)

One boundary. One authority. Delete the duplicated checks and stop worrying about drift.
