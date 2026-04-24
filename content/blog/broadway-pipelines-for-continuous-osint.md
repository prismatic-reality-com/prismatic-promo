+++
title = "Broadway Pipelines for Continuous OSINT: Backpressure Is a Feature"
date = 2026-04-09
description = "When Shodan, VirusTotal, and three rate-limited registries all feed the same pipeline, backpressure stops being a nice-to-have and starts being the reason production doesn't melt. Broadway patterns from prismatic_osint_monitoring."

[extra]
author = "Tomáš Korcak (korczis)"
category = "engineering"
tags = ["broadway", "genstage", "backpressure", "osint", "pipeline"]
reading_time = "7 min"
keywords = ["Broadway Elixir", "GenStage backpressure", "OSINT pipeline", "continuous monitoring"]
image = "/images/blog/broadway-osint.png"
word_count = 520
date_created = "2026-04-09"
date_modified = "2026-04-09"
quality_score = 34
see_also = ["broadway", "genstage", "backpressure", "pipeline", "rate-limiting"]
image_alt = "Broadway Pipelines for Continuous OSINT"
+++

Continuous OSINT is a pipeline, not a cron job. And pipelines without [backpressure](@/glossary/backpressure.md) explode the first time one stage slows down. [Broadway](@/glossary/broadway.md) — built on [GenStage](@/glossary/genstage.md) — is how Prismatic's monitoring apps absorb spiky rate-limited upstreams without dropping messages or melting the database.

## The spiky reality

A realistic monitoring load:

- Certificate transparency firehose: ~1k events/sec peak, 50/sec off-peak
- Shodan polled queries: 100 req/min hard ceiling
- Czech ARES: 30 req/min polite ceiling
- Entity enrichment (Postgres + graph write): ~500 writes/sec sustained

Without backpressure, the CT firehose drowns Shodan, Shodan gets 429'd, retries storm, and the ARES ceiling gets blown. Every stage fails for a reason caused by some *other* stage.

## The Broadway shape

```elixir
defmodule PrismaticOsint.CtPipeline do
  use Broadway

  def start_link(_opts) do
    Broadway.start_link(__MODULE__,
      name: __MODULE__,
      producer: [
        module: {PrismaticOsint.CtProducer, []},
        concurrency: 1,
        rate_limiting: [allowed_messages: 1000, interval: 1_000]
      ],
      processors: [
        default: [concurrency: 20, min_demand: 5, max_demand: 20]
      ],
      batchers: [
        enrich: [concurrency: 4, batch_size: 50, batch_timeout: 500],
        index:  [concurrency: 2, batch_size: 100, batch_timeout: 1_000]
      ]
    )
  end

  def handle_message(_, msg, _), do: route(msg)
  def handle_batch(:enrich, msgs, _, _), do: enrich_batch(msgs)
  def handle_batch(:index,  msgs, _, _), do: index_batch(msgs)
end
```

Four knobs matter:

- `rate_limiting` at the producer — hard ceiling on incoming messages.
- `max_demand` on processors — how far the pipeline pulls ahead before waiting.
- `batch_size` on batchers — amortize Postgres + graph writes.
- `batch_timeout` — cap tail latency when volume drops.

Get those four right and the pipeline *pulls* work at a rate the slowest stage can handle. That is the whole point of backpressure: the slow stage sets the tempo.

## Rate-limited adapters get their own pipeline

Shodan and ARES do not belong in the CT firehose pipeline. They get their own Broadway with its own producer-level [rate limiting](@/glossary/rate-limiting.md). Mixing them into a high-throughput pipeline means the high-throughput stages starve while the slow stages crawl.

## Dead letters are evidence

Every message that fails after retries ends up in a dead-letter Postgres table — with the original payload, the failing stage, and the last error. Dead letters are not "things to fix someday." They are the ground truth about which part of the real world your pipeline does not model. Review them weekly or they compound.

## Where to go next

- **Academy**: [Storage Patterns](/academy/storage-patterns) — the write side of the pipeline
- **Academy**: [OTP Fundamentals](/academy/otp-fundamentals) — GenStage / Broadway foundations
- **Glossary**: [Broadway](@/glossary/broadway.md), [GenStage](@/glossary/genstage.md), [Backpressure](@/glossary/backpressure.md), [Pipeline](@/glossary/pipeline.md), [Rate Limiting](@/glossary/rate-limiting.md)

The slowest stage sets the tempo. Plan for it. The pipeline will thank you at 3am.
