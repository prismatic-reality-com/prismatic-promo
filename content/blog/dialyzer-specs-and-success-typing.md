+++
title = "Dialyzer, @spec, and the Shape of Correctness"
date = 2026-04-09
description = "Dialyzer is not a type checker. It's a proof assistant that accepts anything you can't prove wrong — and that is exactly what you want for a 94-app umbrella. Here's how Prismatic uses @spec and success typing without it becoming busywork."

[extra]
author = "Tomáš Korcak (korczis)"
category = "engineering"
tags = ["dialyzer", "typespec", "success-typing", "elixir", "correctness"]
reading_time = "7 min"
keywords = ["Dialyzer Elixir", "typespec @spec", "success typing", "static analysis Elixir"]
image = "/images/blog/dialyzer-specs.png"
word_count = 510
date_created = "2026-04-09"
date_modified = "2026-04-09"
quality_score = 34
see_also = ["dialyzer", "typespec", "success-typing", "static-analysis", "correctness"]
image_alt = "Dialyzer Specs and Success Typing"
+++

[Dialyzer](/glossary/dialyzer) confuses people because it is not what they expect. It is not a type checker like TypeScript. It does not reject your code unless it can *prove* it wrong. That is [success typing](/glossary/success-typing), and once you accept it, Dialyzer becomes an unusually high-signal tool — it reports bugs that nobody writes tests for.

## What Dialyzer actually catches

Three categories:

1. **Contract violations** — a function annotated `@spec f(integer) :: atom` that sometimes returns a string.
2. **Impossible branches** — a pattern match that can never succeed given the types flowing in (e.g. matching `{:ok, _}` on a function that only returns `:error`).
3. **Dead code via upstream guarantees** — a `case` clause for `nil` that the caller never produces.

These are bugs your tests usually do not cover because they require you to *think* about the input set. Dialyzer does the thinking.

## The [typespec](/glossary/typespec) is the contract

```elixir
@spec search(query :: String.t(), opts :: keyword()) ::
  {:ok, [map()]} | {:error, :timeout | :rate_limited | {:transport, String.t()}}
def search(query, opts) do
  ...
end
```

The value of this spec is not documentation — it is that Dialyzer can now verify every caller handles the error cases. A caller that only pattern-matches on `{:ok, _}` becomes a Dialyzer warning: "the `{:error, _}` return is never matched". That is exactly the bug that bites you in production six months later.

## PLT: the up-front cost

Dialyzer's Persistent Lookup Table caches type information for OTP, Elixir, and your deps. Building it on a fresh checkout takes 3–5 minutes. After that, incremental runs are fast (10–30 seconds for a reasonable module change). Cache the PLT between CI runs or Dialyzer becomes a time sink.

## The rule that makes Dialyzer worth it

> `@spec` every public function in `lib/`. Leave private functions to inference unless Dialyzer complains.

Public functions are where callers cross module boundaries. Spec them and Dialyzer can reason about the whole call graph. Private functions are usually small enough that inference gets the right answer without help.

## When Dialyzer is wrong

Dialyzer is sometimes wrong — it has false negatives (bugs it will not catch) and, rarely, false positives (warnings you cannot fix without contorting the code). For the latter, `@dialyzer {:nowarn_function, [name: arity]}` is an acceptable escape hatch, but every use should come with a comment explaining *why*. A silent `nowarn` is just a bug waiting to happen.

## Where to go next

- **Academy**: [Development Workflow](/academy/learn/development-workflow) — where Dialyzer runs in the pipeline
- **Glossary**: [Dialyzer](/glossary/dialyzer), [Typespec](/glossary/typespec), [Success Typing](/glossary/success-typing), [Static Analysis](/glossary/static-analysis), [Correctness](/glossary/correctness)

Not a type checker. A bug finder. Treat it as the second, run it every CI, and the bugs it finds are the ones you were going to miss.
