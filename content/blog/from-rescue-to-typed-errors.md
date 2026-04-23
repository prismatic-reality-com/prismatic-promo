+++
title = "From Bare Rescue to Typed Errors: How Prismatic Killed 6,000 Silent Failures"
date = 2026-04-09
description = "A `rescue _ -> :error` is a bug factory. It swallows the context that would have told you what went wrong. The ZERO doctrine banned them — here's what replaced them across 128 OSINT adapters."

[extra]
author = "Tomáš Korcak (korczis)"
category = "engineering"
tags = ["error-handling", "zero-tolerance", "rescue", "elixir", "doctrine"]
reading_time = "7 min"
keywords = ["Elixir bare rescue", "typed errors", "error handling", "ZERO doctrine"]
image = "/images/blog/typed-errors.png"
word_count = 520
date_created = "2026-04-09"
date_modified = "2026-04-09"
quality_score = 34
see_also = ["error-handling", "zero-tolerance", "exunit", "observability", "structured-logging"]
image_alt = "From Bare Rescue to Typed Errors"
+++

A `rescue _ -> :error` is the programming equivalent of closing your eyes during a car crash. The exception happens; the context that would have told you *what* happened is discarded; all you know is "something." When Prismatic audited the codebase under the [zero-tolerance](/glossary/zero-tolerance) doctrine, it found 6,000+ bare rescues. Every single one was a place where a future outage would be harder to diagnose than it needed to be.

## What is wrong with a bare rescue

Three things:

1. **It catches everything** — including `ArgumentError` from a developer bug, `DBConnection.ConnectionError` from a real outage, and `Protocol.UndefinedError` from a schema mismatch. These three need very different responses. A bare rescue gives them all the same response.
2. **It discards the stacktrace** — unless you bind it and log it. Almost nobody does.
3. **It lies about the failure mode** — the caller sees `:error` and assumes a well-known failure. It was actually a segfault in a NIF.

## The pattern that replaces it

```elixir
# ❌ Bare rescue — banned by ZERO
try do
  HTTPClient.get(url)
rescue
  _ -> :error
end

# ✅ Specific rescues + typed error + structured log
try do
  HTTPClient.get(url)
rescue
  e in [HTTPoison.Error, Mint.TransportError] ->
    Logger.warning("http transport error",
      url: url, reason: Exception.message(e))
    {:error, {:transport, Exception.message(e)}}

  e in [Jason.DecodeError] ->
    Logger.warning("http payload decode error",
      url: url, reason: Exception.message(e))
    {:error, {:decode, Exception.message(e)}}
end
```

Two improvements, both important:

- **Specific exception types.** Bugs that the rescue is not meant to catch (like `FunctionClauseError` from a code change) propagate to the supervisor — where they belong.
- **Typed error tuples.** Callers get `{:error, {:transport, msg}}` instead of `:error`. Pattern-matching on the reason is the difference between a retry loop that helps and one that makes things worse.

## Let it crash — for real this time

The Elixir slogan is "let it crash." A bare rescue is the opposite of that philosophy. It catches the crash, hides it, and makes the [supervisor](/glossary/supervisor) think everything is fine. Removing the rescue — so the adapter genuinely crashes and the supervisor genuinely restarts it — is usually the right move.

The rule: only rescue what you can *do something about*. Otherwise let the process die and the supervisor recover.

## Regression tests

Every removed bare rescue got a regression test that asserts the replacement behavior:

```elixir
test "adapter returns typed transport error on network failure" do
  assert {:error, {:transport, _}} = Adapter.fetch("http://127.0.0.1:1")
end
```

Without the regression test, the next refactor reintroduces a bare rescue because "it was simpler that way." With the test, it fails CI.

## Where to go next

- **Academy**: [OTP Fundamentals](/academy/learn/otp-fundamentals) — supervisors and crash recovery
- **Glossary**: [Error Handling](/glossary/error-handling), [Zero Tolerance](/glossary/zero-tolerance), [ExUnit](/glossary/exunit), [Observability](/glossary/observability), [Structured Logging](/glossary/structured-logging)

6,000 silent failures caught nothing and explained nothing. Typed errors catch the right things and explain the rest. Pick the second one.
