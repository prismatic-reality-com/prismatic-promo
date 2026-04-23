+++
title = "ui-flowbite-specialist"
weight = 407
[extra]
domain = "development"
level = "L3"
description = "UI/UX enhancement using Flowbite components and TailwindCSS with strict design system adherence"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ecto", "phoenix", "liveview", "aiad", "ets", "hot-code-reload"]
domain_normalized = "development"
content_version = "1.0.0"
last_enhanced = "2026-02-01"
word_count = 141
quality_score = 31
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ui-flowbite-specialist", "UIUX", "Flowbite", "TailwindCSS", "agents", "agent", "Prismatic Platform", "Flowbite Specialist"]
tags = ["agents", "agent", "ui-flowbite-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "ui-flowbite-specialist - Prismatic Platform"
+++

## Overview

The UI Flowbite Specialist is an L3 agent operating in the **development** domain of the Prismatic Platform. This agent specializes in UI/UX enhancement using [Flowbite](@/glossary/flowbite.md) components and [TailwindCSS](@/glossary/tailwindcss.md) with strict design system adherence. Every user interface element in the Prismatic Platform must be built using TailwindCSS utility classes and Flowbite component patterns -- inline styles and custom CSS are forbidden. The UI Flowbite Specialist enforces this mandate while ensuring that the platform's [LiveView](@/glossary/liveview.md) dashboards, administrative interfaces, and monitoring pages maintain a consistent, professional, and accessible design language.

The platform's TailwindCSS-first policy is not merely an aesthetic preference but an architectural decision that enables consistent theming, efficient CSS bundle sizes, and maintainable component libraries. By centralizing all styling decisions in utility classes and pre-built Flowbite components, the platform eliminates the CSS specificity conflicts, dead CSS accumulation, and design inconsistencies that plague projects with ad-hoc styling approaches.

This agent is part of the platform's 434-strong autonomous agent ecosystem, operating under [AIAD](@/glossary/aiad.md) standard compliance and enforcing the design system through automated validation.

## Design System Rules

The UI Flowbite Specialist enforces a strict set of design system rules that govern all UI development.

| Rule | Enforcement Level | Violation Response |
|------|-------------------|-------------------|
| **TailwindCSS utilities only** | BLOCKING | Reject PR with inline styles |
| **Flowbite components for common patterns** | ADVISORY | Suggest Flowbite alternative |
| **No custom CSS files** | BLOCKING | Reject PR with custom CSS |
| **Dark mode support** | BLOCKING | All components must support dark mode |
| **Responsive design** | BLOCKING | All layouts must be responsive |
| **Accessibility (WCAG 2.1 AA)** | BLOCKING | Reject inaccessible components |
| **Consistent spacing scale** | ADVISORY | Suggest standard spacing values |

## Component Library

The UI Flowbite Specialist maintains a curated component library built on Flowbite patterns, adapted for the platform's [Phoenix](@/glossary/phoenix.md) LiveView architecture.

| Component Category | Components | Flowbite Base | LiveView Integration |
|-------------------|------------|---------------|---------------------|
| **Navigation** | Sidebar, navbar, breadcrumbs, tabs | Yes | `phx-click` handlers |
| **Data Display** | Tables, cards, badges, stats | Yes | `phx-update="stream"` |
| **Forms** | Inputs, selects, toggles, date pickers | Yes | `phx-change`, `phx-submit` |
| **Feedback** | Alerts, toasts, progress bars, spinners | Yes | `phx-hook` animations |
| **Overlays** | Modals, dropdowns, popovers, tooltips | Yes | Alpine.js integration |
| **Charts** | Line, bar, pie, area, sparklines | Custom | LiveView push events |

## Technical Implementation

```elixir
defmodule PrismaticAgents.UIFlowbiteSpecialist do
  @moduledoc """
  L3 UI Flowbite Specialist agent.
  Enforces TailwindCSS-first design system with Flowbite components.
  """

  use GenServer
  require Logger

  @design_audit_interval_ms :timer.hours(8)

  @forbidden_patterns [
    ~r/style\s*=\s*"/,           # Inline styles
    ~r/<style[^>]*>/,             # Style tags
    ~r/\.css"[^>]*>/,             # Custom CSS imports (excluding tailwind)
    ~r/!important/                 # !important overrides
  ]

  defstruct [
    :template_registry,
    :violation_count,
    :component_usage,
    :last_audit_at,
    status: :enforcing
  ]

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    schedule_design_audit()
    {:ok, %__MODULE__{template_registry: %{}, violation_count: 0}}
  end

  @impl true
  def handle_info(:design_audit, state) do
    templates = discover_all_templates()
    violations = audit_design_compliance(templates)
    usage = analyze_component_usage(templates)

    :telemetry.execute(
      [:prismatic, :agents, :ui_flowbite, :audit],
      %{templates_audited: length(templates), violations: length(violations)},
      %{component_usage: map_size(usage)}
    )

    schedule_design_audit()

    {:noreply, %{state |
      template_registry: templates,
      violation_count: length(violations),
      component_usage: usage,
      last_audit_at: DateTime.utc_now()
    }}
  end

  defp audit_design_compliance(templates) do
    templates
    |> Enum.flat_map(fn template ->
      content = File.read!(template.path)

      @forbidden_patterns
      |> Enum.flat_map(fn pattern ->
        if Regex.match?(pattern, content) do
          [%{template: template.path, pattern: pattern, severity: :blocking}]
        else
          []
        end
      end)
    end)
  end
end
```

## TailwindCSS Configuration

The platform's TailwindCSS configuration is managed by the UI Flowbite Specialist to ensure consistency across all applications.

```javascript
// tailwind.config.js (managed by UI Flowbite Specialist)
module.exports = {
  content: [
    './apps/*/lib/*_web/**/*.{heex,ex}',
    './sites/promo/templates/**/*.html',
    './node_modules/flowbite/**/*.js'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        prismatic: {
          50: '#f0f4ff',
          500: '#6366f1',
          900: '#1e1b4b',
          950: '#0f0d2e'
        }
      }
    }
  },
  plugins: [
    require('flowbite/plugin'),
    require('@tailwindcss/typography')
  ]
}
```

## LiveView Component Patterns

The UI Flowbite Specialist defines standard patterns for integrating Flowbite components with [Phoenix LiveView](@/glossary/liveview.md).

| Pattern | Use Case | Implementation |
|---------|----------|----------------|
| **Stateless Component** | Static UI elements | `Phoenix.Component` function components |
| **Stateful Component** | Interactive elements | `Phoenix.LiveComponent` |
| **JS Hook** | Complex interactions | `phx-hook` with Flowbite JS |
| **Alpine.js** | Dropdowns, modals | `x-data`, `x-show`, `@click` |
| **Stream** | Large data tables | `phx-update="stream"` |

## Design Audit Metrics

| Metric | Current | Target |
|--------|---------|--------|
| **Templates audited** | 250+ | All templates |
| **Design violations** | 0 | 0 |
| **Flowbite adoption rate** | 95% | > 90% |
| **Dark mode coverage** | 100% | 100% |
| **Accessibility compliance** | WCAG 2.1 AA | WCAG 2.1 AA |
| **CSS bundle size** | 45 KB (minified) | < 100 KB |

## Navigation Protection

A critical responsibility of the UI Flowbite Specialist is protecting navigation functionality. The platform's dropdown menus, sidebars, and navigation elements use `phx-click` handlers that can be broken by improper DOM structure changes. Navigation breakage is among the most user-visible types of regression and receives zero tolerance under the NO MERCY doctrine.

| Navigation Element | Protection Mechanism | Validation | Risk Level |
|-------------------|---------------------|------------|------------|
| **Sidebar** | `phx-click` event handlers | E2E test coverage | High |
| **Dropdown menus** | Alpine.js `x-data` state | Component test coverage | High |
| **Mobile hamburger** | Alpine.js toggle | Responsive test coverage | Medium |
| **Breadcrumbs** | Static `<a>` links | Link validation | Low |
| **Tab navigation** | `phx-click` with active state | State management tests | Medium |
| **Pagination** | LiveView `phx-click` handlers | Integration tests | Medium |

## Responsive Design Framework

The UI Flowbite Specialist enforces a mobile-first responsive design approach where all components must function correctly across the platform's supported viewport sizes. Every component in the library has been tested against these breakpoints and includes responsive utility classes.

| Breakpoint | Min Width | Target Devices | Tailwind Prefix | Layout Strategy |
|-----------|-----------|----------------|-----------------|-----------------|
| **Mobile** | 0px | Phones | (default) | Single column, stacked |
| **Small** | 640px | Large phones, small tablets | `sm:` | Two columns where appropriate |
| **Medium** | 768px | Tablets | `md:` | Sidebar + content |
| **Large** | 1024px | Laptops | `lg:` | Full navigation + content |
| **XL** | 1280px | Desktops | `xl:` | Wide content with margins |
| **2XL** | 1536px | Large monitors | `2xl:` | Maximum width constraints |

```elixir
defmodule PrismaticAgents.UIFlowbiteSpecialist.ResponsiveAuditor do
  @moduledoc """
  Audits templates for responsive design compliance.
  Ensures all layouts include proper responsive breakpoint classes.
  """

  @required_breakpoints ["sm:", "md:", "lg:"]

  @spec audit_responsive_compliance(String.t()) :: {:ok, map()} | {:violations, list(map())}
  def audit_responsive_compliance(template_path) do
    content = File.read!(template_path)

    layout_elements = extract_layout_elements(content)

    violations =
      layout_elements
      |> Enum.flat_map(fn element ->
        missing = @required_breakpoints -- extract_breakpoints(element)

        if missing != [] do
          [%{
            element: element.tag,
            line: element.line,
            missing_breakpoints: missing,
            severity: if("lg:" in missing, do: :blocking, else: :advisory)
          }]
        else
          []
        end
      end)

    if violations == [], do: {:ok, %{elements_checked: length(layout_elements)}}, else: {:violations, violations}
  end
end
```

## Dark Mode Implementation

The platform enforces mandatory dark mode support for all components. The UI Flowbite Specialist ensures that the `dark:` variant is properly applied to all color-related utility classes and that contrast ratios meet WCAG 2.1 AA standards in both light and dark modes.

| Color Category | Light Mode | Dark Mode | Contrast Ratio (Dark) |
|---------------|------------|-----------|----------------------|
| **Background** | `bg-white` | `bg-gray-900` / `bg-gray-950` | N/A |
| **Primary Text** | `text-gray-900` | `text-white` / `text-gray-100` | 15.6:1 |
| **Secondary Text** | `text-gray-600` | `text-gray-400` | 5.7:1 |
| **Accent** | `text-indigo-600` | `text-indigo-400` | 5.2:1 |
| **Border** | `border-gray-200` | `border-gray-700` | 3.1:1 |
| **Hover** | `hover:bg-gray-50` | `hover:bg-gray-800` | N/A |

## Integration Points

- [**Quality Gates**](@/capabilities/quality-gates.md) -- Design compliance gates deployments
- [**Telemetry Integration**](@/capabilities/telemetry-integration.md) -- Design audit metrics
- [**Real-time Monitoring**](@/capabilities/real-time-monitoring.md) -- Dashboard UI performance
- [**AIAD Standard**](@/capabilities/aiad-standard.md) -- Full agent specification compliance

## AIAD Specification Compliance

| AIAD Component | Status |
|----------------|--------|
| Agent specification file | Compliant |
| Behavioral rules | 12 rules defined |
| [Telemetry](@/glossary/telemetry.md) integration | Full coverage |
| [NM/ND doctrine](@/glossary/no-mercy.md) enforcement | Active |
| [SEADF](@/glossary/seadf.md) integration | Registered |

## Related Agents

- [**Shell Setup Specialist**](@/agents/shell-setup-specialist.md) -- Frontend build tooling configuration
- [**Scalability Architect**](@/agents/scalability-architect.md) -- Frontend performance at scale
- [**Strangler Pattern Specialist**](@/agents/strangler-pattern-specialist.md) -- UI migration from legacy templates

## Accessibility Enforcement

The UI Flowbite Specialist enforces WCAG 2.1 AA accessibility compliance as a blocking quality gate. Every UI component must meet accessibility standards before it can be merged into the codebase.

| Accessibility Criterion | Requirement | Test Method |
|------------------------|-------------|-------------|
| **Color Contrast** | Minimum 4.5:1 for normal text, 3:1 for large text | Automated contrast checker |
| **Keyboard Navigation** | All interactive elements keyboard accessible | Tab-order testing |
| **Screen Reader** | Meaningful `aria-label` and `role` attributes | axe-core automated testing |
| **Focus Indicators** | Visible focus rings on all interactive elements | Visual inspection + automated |
| **Alt Text** | All images have descriptive alt text | Template scanning |
| **Form Labels** | All form inputs have associated labels | HTML validator |

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination with authority to enforce the TailwindCSS-first design system and reject non-compliant UI changes.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)