+++
title = "explain-specialist"
weight = 161
[extra]
domain = "development"
level = "L3"
description = "Intelligent code explanation with multi-level analysis, pattern recognition, and clear communication"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ecto", "phoenix", "liveview", "aiad", "ets", "hot-code-reload"]
domain_normalized = "development"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1900
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["explain-specialist", "Intelligent", "agents", "agent", "Prismatic Platform", "The Explain", "Specialist", "Code"]
tags = ["agents", "agent", "explain-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "explain-specialist - Prismatic Platform"
+++

## Overview

The Explain Specialist operates as an L3 strategic command agent within the Development domain of the Prismatic Platform. This agent provides intelligent code explanation through multi-level analysis, pattern recognition, and clear communication calibrated to the audience's expertise level. In a platform with 6,600+ [Elixir](@/glossary/elixir.md) source files across 90 [umbrella application](@/glossary/umbrella-application.md)s, understanding existing code is as important as writing new code -- developers, architects, and even other agents need to understand module behavior, design rationale, and integration patterns before they can work with unfamiliar code effectively.

The agent is part of the platform's 430-strong autonomous agent ecosystem, built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. It operates under the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine: NO DOUBTS means that explanations are based on thorough analysis of the code rather than surface-level description, and NO MERCY means that explanations do not gloss over complexity or hide design trade-offs. The Explain Specialist produces explanations that are accurate, complete, and honest about what the code does, including its limitations and potential issues.

Code explanation is distinct from code documentation (which the Doc Specialist handles). Documentation describes what code is intended to do; explanation analyzes what code actually does and why it was designed that way. The Explain Specialist reads source code, identifies patterns, traces execution paths, maps dependencies, and constructs narrative explanations that reveal both the "what" and the "why" of code behavior. This capability is essential for onboarding new components, debugging unfamiliar modules, and architectural review.

## Operational Domain

The Development domain encompasses all software engineering activities within the platform. The Explain Specialist focuses on code comprehension -- transforming raw source code into structured understanding. This capability serves multiple use cases: agents querying the behavior of modules they need to interact with, developers understanding unfamiliar code before modification, architects reviewing code for pattern compliance, and debuggers tracing execution paths through complex process interactions.

The domain requires understanding not just Elixir syntax but [OTP](@/glossary/otp.md) patterns, [BEAM](@/glossary/beam.md) runtime behavior, [Phoenix](@/glossary/phoenix.md)/[LiveView](@/glossary/liveview.md) conventions, and the platform's specific architectural patterns. An explanation of a [GenServer](@/glossary/genserver.md) module must cover not just the function implementations but the process lifecycle, state management strategy, message protocol design, supervision context, and failure handling behavior.

## Key Capabilities

The Explain Specialist provides six core code explanation capabilities.

**Multi-level analysis** examines code at multiple abstraction levels simultaneously: the syntactic level (what the code says), the semantic level (what the code means), the architectural level (how the code fits into the broader system), and the behavioral level (what the code does at runtime). Each level reveals different aspects of the code's purpose and design. The specialist selects the appropriate level of detail based on the question being asked -- a "what does this function do?" query requires different analysis depth than a "why was this module designed this way?" query.

**Pattern recognition** identifies OTP patterns, design patterns, and platform-specific patterns in the code being analyzed. Recognizing that a module implements the Saga pattern, the Circuit Breaker pattern, or the Platform's biological organism pattern provides immediate high-level understanding that would take much longer to derive from reading the code line by line. Pattern recognition also identifies anti-patterns, flagging code that deviates from platform standards.

**Execution path tracing** follows the flow of data and control through function calls, process messages, and pipeline stages to explain how inputs become outputs. For complex operations that span multiple modules, processes, or applications, the specialist constructs execution traces that show the complete path from initial trigger to final result, including branching conditions, error handling paths, and asynchronous message exchanges.

**Dependency mapping** constructs dependency graphs showing which modules, applications, and external services a piece of code depends on. Dependency maps reveal coupling patterns (tight vs. loose), circular dependencies (which should not exist in a well-designed system), and integration boundaries (where the code interacts with external systems). This information is critical for understanding the blast radius of potential changes.

**Audience-calibrated communication** adjusts explanation depth, terminology, and emphasis based on the expertise level and information needs of the requesting party. An explanation for an architect focuses on design patterns, trade-offs, and architectural alignment. An explanation for a debugger focuses on execution paths, state mutations, and failure modes. An explanation for an agent focuses on interface contracts, message protocols, and behavioral guarantees.

**Design rationale reconstruction** infers the design decisions behind code structure by analyzing patterns, comments, git history, and architectural context. Why was this implemented as a GenServer instead of a simple module? Why does this pipeline use GenStage instead of Task.async_stream? Why are these modules in separate applications? The specialist constructs plausible rationale by combining code analysis with platform architectural principles.

## Explanation Output Structure

The specialist produces structured explanations following a consistent format.

```
Code Reference --> Purpose Summary --> Implementation Analysis --> Integration Context
       |                |                      |                        |
   File, module,    What this code         How it works:           Where it fits:
   function          does and why           - Algorithm/pattern     - Dependencies
   identification    in 1-2 sentences       - State management      - Consumers
                                            - Error handling        - Domain role
                                            - Performance

   --> Design Rationale --> Potential Issues --> Related Components
           |                      |                    |
       Why this design        Known limitations     Other modules
       was chosen             Edge cases             that interact
       Trade-offs made        Complexity hotspots    with this code
```

## Explanation Levels

| Level | Depth | Use Case | Example |
|-------|-------|----------|---------|
| Surface | Function signatures, module purpose | Quick orientation | "This module manages user sessions" |
| Behavioral | Execution flow, state changes | Understanding behavior | "This GenServer maintains a cache with TTL..." |
| Architectural | Design patterns, integration points | Design review | "This implements the Saga pattern for..." |
| Deep | Runtime behavior, performance characteristics | Debugging, optimization | "The ETS table uses read_concurrency because..." |

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination and specialized operational command. The Explain Specialist has read access to all codebase files and can coordinate with architecture agents for additional context when explaining complex cross-application behavior.

## Integration Architecture

| Component | Relationship | Purpose |
|-----------|-------------|---------|
| [Phoenix](@/glossary/phoenix.md) Framework | Analysis target | Web application and [LiveView](@/glossary/liveview.md) component explanation |
| [Elixir](@/glossary/elixir.md)/[OTP](@/glossary/otp.md) | Language platform | OTP pattern recognition and BEAM behavior analysis |
| [Quality Gates](@/glossary/quality-gates.md) | Context source | Quality standards for pattern compliance assessment |
| Git Trees | File discovery | Rapid location of code to explain |
| AST Parser | Code analysis | Abstract syntax tree analysis for pattern recognition |
| Git History | Rationale source | Commit history for design rationale reconstruction |

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [code-specialist](@/agents/code-specialist.md) | Code generation partner | Explanation informs code generation decisions |
| [doc-specialist](@/agents/doc-specialist.md) | Documentation partner | Explanations complement and validate documentation |
| [estimator](@/agents/estimator.md) | Complexity input | Code explanations inform effort estimation |
| [elixir-architect](@/agents/elixir-architect.md) | Architectural context | Architecture patterns inform explanation content |

## Enforcement

The Explain Specialist operates under [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. Explanations are thorough and honest -- complexity is not hidden, design trade-offs are not glossed over, and limitations are not omitted. When code contains anti-patterns or quality issues, the explanation identifies them explicitly. When design rationale cannot be determined with confidence, the explanation states the uncertainty rather than inventing plausible-sounding but unverified reasoning. Every explanation is grounded in code analysis, not assumption.

## Related Agents

- [**code-specialist**](@/agents/code-specialist.md) (L3) - Intelligent code generation informed by code understanding
- [**doc-specialist**](@/agents/doc-specialist.md) (L3) - Documentation generation complementing explanation
- [**estimator**](@/agents/estimator.md) (L3) - Effort estimation using complexity analysis from explanations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)