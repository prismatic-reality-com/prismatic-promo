+++
title = "Property-Based Testing for OSINT Parsers: Find the Bugs Your Examples Miss"
date = 2026-04-09
description = "Example-based tests prove your parser works on the inputs you thought of. Property-based tests prove it works on the inputs you didn't. Here's how Prismatic uses StreamData to harden 128 OSINT adapters."

[extra]
author = "Tomáš Korcak (korczis)"
category = "engineering"
tags = ["testing", "property-based", "stream-data", "osint", "parsers"]
reading_time = "7 min"
keywords = ["property-based testing Elixir", "StreamData", "OSINT parser testing", "ExUnitProperties"]
image = "/images/blog/property-testing.png"
word_count = 510
date_created = "2026-04-09"
date_modified = "2026-04-09"
quality_score = 34
see_also = ["property-based-testing", "testing", "unit-testing", "shrinking", "exunit"]
image_alt = "Property-Based Testing for OSINT Parsers"
+++

A [unit test](@/glossary/unit-testing.md) proves the parser works on Example A. Example-based tests are great at capturing regressions — you fix a bug, write the test, it never comes back. What they are bad at is finding the bugs you never thought of. That is the job of [property-based testing](@/glossary/property-based-testing.md), and for an adapter that ingests scraped HTML from the open internet, it is not optional.

## The failure mode

You wrote a parser for Czech ARES results. You tested it against 20 real responses. Shipped. Six months later, an ARES result comes back with a Unicode diaeresis in an address field, and your parser crashes because your regex assumed ASCII. No example test would have caught this — you had no example with a diaeresis.

Property tests catch it because they generate inputs you would never write by hand.

## The shape

```elixir
defmodule PrismaticOsint.Parsers.AresTest do
  use ExUnit.Case
  use ExUnitProperties

  property "parser never crashes on any string" do
    check all input <- string(:printable, max_length: 10_000) do
      assert {:ok, _} = safe_parse(input)
    end
  end

  property "round-trip: encode then decode is identity" do
    check all record <- ares_record_generator() do
      encoded = AresEncoder.encode(record)
      assert {:ok, ^record} = AresParser.parse(encoded)
    end
  end
end
```

The first property is a *fuzz test* masquerading as a property: the parser must never raise. The second is a real property: encoding and decoding are inverses.

## Generators are where the value is

A weak generator produces boring inputs. A strong generator produces weird ones:

```elixir
def ares_record_generator do
  gen all name <- unicode_name_generator(),
          ico <- ico_generator(),
          address <- address_generator(),
          owners <- list_of(owner_generator(), min_length: 0, max_length: 20) do
    %AresRecord{name: name, ico: ico, address: address, owners: owners}
  end
end

def unicode_name_generator do
  gen all parts <- list_of(string(:utf8, min_length: 1, max_length: 20), length: 1..4) do
    Enum.join(parts, " ")
  end
end
```

Unicode strings find encoding bugs. Empty lists find "must have at least one" assumptions. Nested structures find recursion bugs. Every weakness in your assumptions becomes a failing property — with a minimal counterexample courtesy of [shrinking](@/glossary/shrinking.md).

## Shrinking is the killer feature

When a property fails, StreamData automatically shrinks the input to the smallest example that still fails. A 10,000-character crash becomes a 4-character crash becomes a 1-character crash — and now you know *exactly* which character broke the parser. No debugging archeology.

## The rule

> Every pure parser in lib/ gets one example test per real-world format and at least one property.

The example tests are for regressions. The property tests are for the bugs that have not happened yet. You need both.

## Where to go next

- **Academy**: [Storage Patterns](/academy/learn/storage-patterns) — parsers live close to storage
- **Glossary**: [Property-Based Testing](@/glossary/property-based-testing.md), [Testing](@/glossary/testing.md), [Unit Testing](@/glossary/unit-testing.md), [Shrinking](@/glossary/shrinking.md), [ExUnit](@/glossary/exunit.md)

Example tests find yesterday's bugs. Properties find tomorrow's.
