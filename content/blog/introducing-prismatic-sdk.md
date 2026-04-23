+++
title = "Introducing Prismatic SDK: Open Source Intelligence Development Kit"
date = 2026-02-21
description = "Prismatic SDK is now available as an open-source, MIT-licensed client library for TypeScript, Python, Elixir, and Go. Build intelligence applications with type-safe APIs, built-in retry logic, and streaming support."

[extra]
author = "Tomáš Korcak (korczis)"
category = "announcement"
tags = ["sdk", "open-source", "typescript", "python", "elixir", "developer-tools"]
reading_time = "5 min"
keywords = ["prismatic sdk", "open source intelligence sdk", "OSINT developer tools", "intelligence API client", "TypeScript SDK", "Python SDK", "Elixir SDK"]
image = "/images/blog/prismatic-sdk-launch.png"
featured = true
word_count = 251
date_created = "2026-02-23"
date_modified = "2026-02-23"
quality_score = 27
see_also = ["sdk", "api", "rest-api", "openapi", "prismatic-api"]
image_alt = "Introducing Prismatic SDK: Open Source Intelligence Development Kit - Prismatic Platform"
+++

We are excited to announce the general availability of [Prismatic SDK](/developers/sdk/) -- an open-source, MIT-licensed client library that makes it easy to integrate intelligence capabilities into any application.

## Why We Built the SDK

Intelligence tooling has historically been locked behind enterprise APIs with opaque interfaces. Developers building security dashboards, due diligence workflows, or OSINT aggregators had to reverse-engineer proprietary protocols or build fragile integrations from scratch.

Prismatic SDK changes this. It provides a unified, type-safe interface to the platform's intelligence capabilities across four languages:

- **TypeScript/JavaScript** -- Full type definitions, async/await, streaming support
- **Python** -- Pythonic API with dataclass models, async support via `asyncio`
- **Elixir** -- Native OTP integration, GenServer-backed connection pooling
- **Go** -- Idiomatic Go with context propagation and structured errors

## Getting Started

Install the SDK in your language of choice:

```bash
# TypeScript
npm install @prismatic/sdk

# Python
pip install prismatic-sdk

# Elixir
# Add to mix.exs: {:prismatic_sdk, "~> 0.8.0"}

# Go
go get github.com/prismatic-platform/sdk-go
```

## Key Features

### Type-Safe Entity Resolution

Every API response is fully typed. No more `any` or `Dict[str, Any]` -- you get autocompletion and compile-time validation:

```typescript
const result = await prismatic.entities.resolve({
  name: "Navigara AI s.r.o.",
  jurisdiction: "CZ",
  identifiers: { ico: "21893641" }
});

// result.entity.type is EntityType.COMPANY
// result.confidence is a number between 0 and 1
// result.evidence is Evidence[]
```

### Built-in Retry and Circuit Breaking

Network failures happen. The SDK handles transient errors with configurable exponential backoff and circuit breaker patterns -- the same patterns we use in our 530-agent production deployment.

### Streaming Results

For large-scale intelligence gathering, stream results as they arrive instead of waiting for the full response:

```python
async for entity in prismatic.osint.stream_search("example.com"):
    print(f"Found: {entity.name} ({entity.type})")
```

## What's Next

- **Plugin Kit integration** -- Build custom adapters that plug directly into the SDK's type system
- **Interactive Labs** -- Try SDK functions in our [sandboxed lab environment](/lab/)
- **Academy courses** -- Structured [learning paths](/academy/) for SDK development

Start building at [prismatic-reality.com/developers/sdk/](/developers/sdk/).

---

*Prismatic SDK is MIT licensed. Contributions welcome on GitHub.*
