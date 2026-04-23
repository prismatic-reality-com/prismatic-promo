+++
title = "/svihadlo"
weight = 220
[extra]
category = "Development"
description = "Ultra-fast visible feature implementation in 5-15 minutes"
syntax = "/svihadlo [options]"
authority = "L3"
agent = "liveview-specialist"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1096
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["svihadlo", "Ultra-fast", "5-15", "commands", "Development", "Prismatic Platform", "TailwindCSS", "Flowbite", "LiveView", "Feature"]
tags = ["commands", "development", "svihadlo", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/svihadlo - Prismatic Platform"
+++

## Overview

**/svihadlo** is a production command in the **Development** category of the Prismatic Platform. It implements visible, user-facing features with extreme speed, targeting a 5-15 minute delivery window from specification to working, tested, quality-gate-passing code. The name "svihadlo" (Czech for "jump rope") reflects the command's rapid, rhythmic execution style: quick iterations with tight feedback loops that produce visible results almost immediately. This is the platform's answer to the common development frustration of invisible backend work -- `/svihadlo` ensures every execution produces something a user can see and interact with.

This command operates under the **L3** authority level and is executed by the `liveview-specialist` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The L3 authority level grants the LiveView specialist full access to Phoenix templates, LiveView modules, component libraries, routing configuration, and the [TailwindCSS](/glossary/tailwindcss/)/[Flowbite](/glossary/flowbite/) design system. This broad access enables the specialist to deliver complete features without coordination delays.

The command focuses on the visible layer of the platform: LiveView pages, interactive components, dashboard widgets, data visualizations, form interfaces, and navigation elements. It generates Phoenix LiveView modules with proper mount/3, handle_event/3, and handle_info/2 callbacks, HEEx templates with TailwindCSS styling and Flowbite components, and comprehensive tests. Every feature produced by `/svihadlo` must pass quality gates including zero-warning compilation, Credo strict compliance, and route accessibility verification.

## Architecture

The svihadlo system operates as a rapid-delivery pipeline optimized for LiveView feature generation.

### Svihadlo Architecture

```
             /svihadlo
                  |
          Feature Analyzer
                  |
          +-------+-------+
          |       |       |
       Spec     Route    Component
       Parser   Planner  Selector
          |       |       |
          +-------+-------+
                  |
          Code Generator
                  |
          +-------+-------+-------+
          |       |       |       |
       LiveView Template  Test    Route
       Module   (HEEx)   Suite   Config
          |       |       |       |
          +-------+-------+-------+
                  |
          Quality Validator
                  |
          +-------+-------+
          |       |       |
       Compile  Credo   Route
       Check    Check   Test
          |       |       |
          +-------+-------+
                  |
          Feature Delivery
```

### Feature Categories

| Category | Typical Time | Examples | Complexity |
|----------|-------------|----------|------------|
| **Dashboard Widget** | 5 min | Metric card, status indicator, mini chart | Low |
| **Data Table** | 8 min | Sortable, filterable table with pagination | Medium |
| **Form Interface** | 10 min | Multi-field form with validation and submission | Medium |
| **Interactive Page** | 12 min | Full LiveView page with real-time updates | Medium-High |
| **Component Library** | 15 min | Reusable component set with variants | High |

### Component Stack

| Layer | Technology | Enforced Standard |
|-------|------------|-------------------|
| **Behavior** | Phoenix LiveView | mount/3, handle_event/3, handle_info/2 |
| **Templates** | HEEx | Function components, slots, assigns |
| **Styling** | TailwindCSS 3.4 | Utility-first, no custom CSS |
| **Components** | Flowbite 2.3 | Pre-built component library |
| **Interactivity** | Alpine.js 3.13 | Client-side reactivity |
| **Testing** | ExUnit + LiveViewTest | ConnTest for routes, LiveViewTest for interaction |

## Usage

```bash
# Implement a dashboard widget
/svihadlo "add system health widget to dashboard"

# Create a data table page
/svihadlo "create sortable asset table for perimeter module"

# Build a form interface
/svihadlo "add compliance assessment form with NIS2 fields"

# Implement a LiveView page
/svihadlo "create real-time security rating display page"

# Add navigation element
/svihadlo "add perimeter submenu to main navigation"

# Build an interactive component
/svihadlo "create expandable risk detail card component"

# Quick metric display
/svihadlo "add agent count metric to admin dashboard"

# Chart visualization
/svihadlo "add trend chart for quality score history"
```

### Practical Examples

```bash
# Full page implementation with routing
/svihadlo "create /perimeter/assets page with filterable asset inventory table" --verbose

# Dashboard enhancement with multiple widgets
/svihadlo "add 4-card metric row showing assets, vulnerabilities, rating, compliance to /perimeter"

# Interactive form with real-time validation
/svihadlo "create domain scan request form with URL validation and progress indicator"

# Component with variants
/svihadlo "create severity badge component with critical/high/medium/low/info variants"

# Real-time feature with PubSub
/svihadlo "add live scan progress tracker that updates via PubSub on /perimeter/easm"
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--app` | `string` | `prismatic_web` | Target Phoenix application |
| `--route` | `string` | auto | Specific route path for the feature |
| `--component-only` | `flag` | false | Generate only reusable component, not full page |
| `--verbose` | `flag` | false | Show detailed generation steps |
| `--dry-run` | `flag` | false | Show planned files without generating |
| `--skip-tests` | `flag` | false | Skip test generation (NOT recommended) |
| `--skip-routes` | `flag` | false | Skip route configuration |
| `--design` | `enum` | `flowbite` | Design system: `flowbite`, `custom`, `minimal` |
| `--realtime` | `flag` | false | Include PubSub real-time update support |
| `--format` | `enum` | `liveview` | Feature type: `liveview`, `component`, `static` |
| `--target-time` | `duration` | `10m` | Target delivery time |
| `--quality-gates` | `flag` | true | Run quality gates after generation |

## Execution Flow

### Phase 1: Specification Analysis (30 seconds)

The feature analyzer parses the natural language specification to identify: the feature type (page, component, widget), target location (route, existing page), data requirements (what data to display or collect), interaction model (read-only, interactive, real-time), and visual complexity (simple metric, data table, full dashboard).

### Phase 2: Route Planning (15 seconds)

For page-level features, the route planner determines the appropriate route path, plug pipeline, and LiveView module location. It checks for route conflicts, identifies the correct router file, and plans the navigation integration if needed.

### Phase 3: Code Generation (3-8 minutes)

The code generator produces all required files simultaneously. LiveView modules include proper callbacks with assigns management. HEEx templates use TailwindCSS utilities and Flowbite components exclusively (no custom CSS -- this is a platform-wide enforcement). Tests cover both controller-level route accessibility and LiveView-level interaction behavior.

### Phase 4: Quality Validation (1-2 minutes)

Generated code passes through the quality gate pipeline: zero-warning compilation (`mix compile --warnings-as-errors`), Credo strict compliance (`mix credo --strict`), and route accessibility verification. Any failures trigger immediate code correction within the svihadlo session.

### Phase 5: Feature Delivery (15 seconds)

The completed feature is reported with: file paths for all generated/modified files, route information for accessing the feature, screenshot or description of the visual result, and test execution results confirming all tests pass.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/code](/commands/code/) | Peer | General coding for non-UI work |
| [/ui-enhance](/commands/ui-enhance/) | Peer | UI enhancement for existing features |
| [/test](/commands/test/) | Downstream | Test generation for edge cases beyond svihadlo scope |
| [/route-test](/commands/route-test/) | Validation | Route verification after feature delivery |
| [/quality-gates](/commands/quality-gates/) | Enforcement | All generated code passes quality gates |
| [TailwindCSS](/glossary/tailwindcss/) | Design | Utility-first styling system |
| [Flowbite](/glossary/flowbite/) | Components | Pre-built component library |
| [Telemetry](/glossary/telemetry/) | Monitoring | Feature delivery time tracking |

## Best Practices

### Specification Clarity

The more specific the feature specification, the faster and more accurate the delivery. "Create a table showing assets" is functional but vague. "Create a sortable, filterable table at /perimeter/assets showing domain, IP, port, service, severity with pagination at 25 rows" produces the exact feature needed on the first attempt.

### Incremental Feature Building

Use `/svihadlo` iteratively: start with the basic visible feature, then enhance with additional calls. A dashboard page might be built in three svihadlo calls: first the layout and metric cards, then the data table, then the interactive filters. Each iteration is tested independently.

### TailwindCSS-Only Styling

All styling must use TailwindCSS utilities. Custom CSS is strictly forbidden on the Prismatic Platform. The `/svihadlo` agent enforces this by generating only Tailwind classes and Flowbite component patterns. If you find yourself wanting custom CSS, request a Flowbite component pattern instead.

### Test Coverage Expectations

Every svihadlo feature includes tests, but the tests cover the generated feature scope. For comprehensive edge case testing, follow up with `/test` to generate additional test scenarios for complex interaction patterns.

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `ROUTE_CONFLICT` | Requested route conflicts with existing route | Choose different route or modify existing |
| `COMPILATION_FAILURE` | Generated code fails to compile | Automatic correction within svihadlo session |
| `CREDO_VIOLATION` | Generated code has Credo violations | Automatic correction; typically formatting |
| `TEMPLATE_ERROR` | HEEx template has syntax errors | Automatic correction of template syntax |
| `COMPONENT_NOT_FOUND` | Referenced Flowbite component unavailable | Fallback to alternative component |
| `TIME_EXCEEDED` | Feature exceeded target delivery time | Split into smaller features |
| `SPEC_AMBIGUOUS` | Feature specification too vague to implement | Request clarification from operator |

## Advanced Usage

### Batch Feature Generation

Generate multiple related features in sequence:

```bash
/svihadlo --batch "metric cards, data table, filter sidebar" --route /perimeter/assets
```

### Component Extraction

Extract an inline component into a reusable one:

```bash
/svihadlo --extract-component "severity badge" --from PrismaticWeb.PerimeterLive.Assets
```

### Design System Preview

Generate a component with multiple visual variants:

```bash
/svihadlo "create status badge component" --variants "active,inactive,warning,error,unknown"
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Every svihadlo feature must compile, pass Credo, and have tests before delivery. No partial features, no TODO placeholders.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Feature specifications are fully analyzed before generation begins, and all deliverables are verified through compilation and test execution.

## Related Commands

- [/code](/commands/code/) - Core coding implementation and feature development
- [/ui-enhance](/commands/ui-enhance/) - UI/UX enhancement with TailwindCSS and Flowbite
- [/test](/commands/test/) - Comprehensive test generation and verification
- [/fix](/commands/fix/) - Bug fix implementation with mandatory [regression tests](/capabilities/regression-tests/)
- [/route-test](/commands/route-test/) - Route testing and HTTP endpoint verification
- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quickstart](/commands/quickstart/) - Feature scaffolding and boilerplate generation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)