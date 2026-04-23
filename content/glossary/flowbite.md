+++
title = "Flowbite"
weight = 9
[extra]
category = "architecture"
description = "TailwindCSS component library used across all platform dashboards"
related_terms = ["tailwindcss", "phoenix-liveview", "liveview", "phoenix", "easm", "clean-run"]
tier = "TIER 1"
domain = "UI Components"
platform_integration = "PrismaticWeb + Promo Site"
maturity = "Production"
complexity = "Intermediate"
audience = ["frontend-developers", "ui-designers", "web-engineers"]
key_benefits = ["zero-custom-css", "accessibility", "dark-mode", "component-consistency"]
prerequisites = ["tailwindcss", "liveview"]
version = "2.3"
css_framework = "TailwindCSS 3.4"
interactivity = "Alpine.js 3.13.5"
component_count = "50+"
accessibility_standard = "WAI-ARIA 1.2 / WCAG 2.1 Level AA"
dark_mode = "Full support via dark: variants"
bundle_size = "~15KB JS"
license = "MIT"
prismatic_enforcement = "TailwindCSS-first mandate"
sidebar_policy = "hidden lg:block (mandatory)"
navigation_protection = "phx-click handlers protected"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1340
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Flowbite", "TailwindCSS", "glossary", "architecture", "Prismatic Platform", "ARIA", "Alpine"]
tags = ["glossary", "architecture", "flowbite", "prismatic"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Flowbite - Prismatic Platform"
+++

## Definition

Flowbite is an open-source UI component library built entirely on [TailwindCSS](@/glossary/tailwindcss.md) utility classes, providing a comprehensive collection of pre-designed, accessible, and interactive components for building modern web interfaces. Unlike monolithic CSS frameworks that ship their own styling system, Flowbite components are composed exclusively from TailwindCSS utilities, meaning they inherit the framework's utility-first philosophy, JIT compilation benefits, and design token consistency without introducing any custom CSS or additional styling abstraction layers.

The library provides over 50 component categories -- from basic elements like buttons, badges, and alerts to complex interactive components like dropdowns, modals, datepickers, and data tables -- each implementing WAI-ARIA accessibility guidelines, keyboard navigation, and screen reader support out of the box. Interactive behaviors (opening modals, toggling dropdowns, managing accordion state) are powered by lightweight vanilla JavaScript or Alpine.js integration, avoiding heavy framework dependencies while maintaining framework agnosticism across React, Vue, Svelte, Angular, and server-rendered environments like [Phoenix LiveView](@/glossary/liveview.md).

Flowbite's design philosophy centers on providing production-ready components that require zero custom CSS while remaining fully customizable through TailwindCSS's existing configuration and utility override mechanisms. Every component is designed with full dark mode support through TailwindCSS's `dark:` variant system, consistent spacing using the default spacing scale, and responsive layouts through breakpoint prefixes. This makes Flowbite a natural extension of TailwindCSS rather than a competing styling system.

## Component Catalog

Flowbite organizes its components into functional categories, each addressing a specific UI pattern:

| Category | Components | Description |
|----------|-----------|-------------|
| **Layout** | Container, Grid, Spacing | Page structure and responsive layouts |
| **Navigation** | Navbar, Sidebar, Breadcrumb, Tabs, Pagination | User navigation patterns |
| **Data Display** | Table, List, Card, Timeline, Badge | Presenting structured information |
| **Forms** | Input, Select, Checkbox, Radio, Toggle, File Upload | User input collection |
| **Feedback** | Alert, Toast, Modal, Drawer, Popover, Tooltip | User notifications and dialogs |
| **Overlay** | Dropdown, Modal, Drawer, Popover | Content layered above the page |
| **Progress** | Progress Bar, Spinner, Skeleton | Loading and status indicators |
| **Typography** | Heading, Paragraph, Link, Blockquote | Text presentation |
| **Charts** | Line, Bar, Pie, Area, Radar | Data visualization |
| **Marketing** | Hero, CTA, Feature, Pricing, Testimonial | Landing page sections |

### Component Selection Criteria

When selecting Flowbite components for the Prismatic Platform, the following criteria apply:

| Criterion | Requirement | Enforcement |
|-----------|-------------|-------------|
| **Zero custom CSS** | Component must use only TailwindCSS utilities | Build-time validation |
| **Dark mode support** | Full dark: variant coverage | Visual regression testing |
| **Keyboard navigation** | Tab, Enter, Space, Escape, Arrow keys | Accessibility audit |
| **Screen reader** | ARIA roles, labels, and descriptions | Automated axe-core checks |
| **LiveView compatibility** | Works with server-rendered HTML and phx- events | Integration testing |
| **Mobile responsive** | Functional at all breakpoints | Responsive testing |

## Alpine.js Integration

Flowbite's interactive components use Alpine.js for client-side behavior management. Alpine.js provides a declarative, HTML-attribute-based approach to adding interactivity that aligns perfectly with TailwindCSS's markup-centric philosophy:

```html
<!-- Flowbite dropdown with Alpine.js -->
<div x-data="{ open: false }" class="relative">
  <button @click="open = !open"
    class="text-white bg-blue-700 hover:bg-blue-800 rounded-lg px-5 py-2.5
           text-sm font-medium inline-flex items-center">
    Filter Assets
    <svg class="w-2.5 h-2.5 ml-2.5" fill="none" viewBox="0 0 10 6">
      <path stroke="currentColor" stroke-linecap="round"
            stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
    </svg>
  </button>

  <div x-show="open" @click.away="open = false"
    x-transition:enter="transition ease-out duration-100"
    x-transition:enter-start="opacity-0 scale-95"
    x-transition:enter-end="opacity-100 scale-100"
    x-transition:leave="transition ease-in duration-75"
    x-transition:leave-start="opacity-100 scale-100"
    x-transition:leave-end="opacity-0 scale-95"
    class="absolute z-10 mt-2 w-56 rounded-lg bg-gray-800 shadow-lg ring-1
           ring-black ring-opacity-5 divide-y divide-gray-700">
    <div class="p-3">
      <label class="flex items-center p-2 rounded hover:bg-gray-700">
        <input type="checkbox" class="w-4 h-4 text-blue-600 rounded
               bg-gray-600 border-gray-500">
        <span class="ml-2 text-sm text-gray-300">Critical Assets</span>
      </label>
    </div>
  </div>
</div>
```

The Alpine.js integration enables component behaviors like:

- **Dropdowns**: Toggle visibility with click-away dismissal and keyboard navigation
- **Modals**: Overlay management with focus trapping, ESC key dismissal, and scroll locking
- **Accordions**: Collapsible content sections with exclusive or multi-open modes
- **Tabs**: Content switching with URL hash synchronization
- **Toasts**: Auto-dismissing notifications with progress indicators
- **Drawer/Sidebar**: Slide-in navigation panels with backdrop overlay

### Alpine.js and LiveView Coexistence

When using Alpine.js alongside Phoenix LiveView, careful coordination is required to prevent conflicts between Alpine.js's client-side state and LiveView's server-side rendering:

```elixir
defmodule PrismaticWeb.Components.FlowbiteHelpers do
  @moduledoc "Helper functions for Flowbite component integration with LiveView."

  use Phoenix.Component

  attr :id, :string, required: true
  attr :title, :string, required: true
  slot :inner_block, required: true

  def flowbite_modal(assigns) do
    ~H"""
    <div id={@id}
         x-data="{ show: false }"
         x-show="show"
         x-on:open-modal.window="if ($event.detail.id === $el.id) show = true"
         x-on:close-modal.window="if ($event.detail.id === $el.id) show = false"
         x-on:keydown.escape.window="show = false"
         x-cloak
         class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-75">
      <div @click.away="show = false"
           class="relative w-full max-w-2xl bg-gray-800 rounded-lg shadow-xl">
        <div class="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 class="text-xl font-semibold text-white"><%= @title %></h3>
          <button @click="show = false"
                  class="text-gray-400 hover:text-white rounded-lg text-sm p-1.5">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
            </svg>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <%= render_slot(@inner_block) %>
        </div>
      </div>
    </div>
    """
  end
end
```

## Accessibility Features

Flowbite components implement WAI-ARIA (Web Accessibility Initiative - Accessible Rich Internet Applications) guidelines:

| Feature | Implementation | Standard |
|---------|---------------|----------|
| **ARIA Roles** | `role="dialog"`, `role="menu"`, `role="alert"` | WAI-ARIA 1.2 |
| **Keyboard Navigation** | Tab, Enter, Space, Escape, Arrow keys | WCAG 2.1 |
| **Focus Management** | Focus trapping in modals, focus restoration | WCAG 2.1 Level AA |
| **Screen Readers** | `aria-label`, `aria-describedby`, `aria-expanded` | WAI-ARIA 1.2 |
| **Color Contrast** | Minimum 4.5:1 ratio for text | WCAG 2.1 Level AA |
| **Reduced Motion** | Respects `prefers-reduced-motion` | WCAG 2.1 Level AAA |
| **Visible Focus** | Clear focus indicators on all interactive elements | WCAG 2.1 Level AA |
| **Semantic HTML** | Proper heading hierarchy, landmark regions | WCAG 2.1 Level A |

## Data Table Component

Data tables are one of the most heavily used Flowbite components in the Prismatic Platform, powering asset inventories, compliance reports, and security rating displays:

```html
<!-- Flowbite data table for asset inventory -->
<div class="relative overflow-x-auto shadow-md rounded-lg">
  <table class="w-full text-sm text-left text-gray-400">
    <thead class="text-xs uppercase bg-gray-700 text-gray-400">
      <tr>
        <th scope="col" class="px-6 py-3">Domain</th>
        <th scope="col" class="px-6 py-3">Type</th>
        <th scope="col" class="px-6 py-3">Grade</th>
        <th scope="col" class="px-6 py-3">Score</th>
        <th scope="col" class="px-6 py-3">Last Seen</th>
      </tr>
    </thead>
    <tbody>
      <tr class="bg-gray-800 border-b border-gray-700 hover:bg-gray-600">
        <td class="px-6 py-4 font-medium text-white whitespace-nowrap">
          example.com
        </td>
        <td class="px-6 py-4">Domain</td>
        <td class="px-6 py-4">
          <span class="bg-green-900 text-green-300 text-xs font-medium px-2.5
                 py-0.5 rounded">A</span>
        </td>
        <td class="px-6 py-4">850</td>
        <td class="px-6 py-4">2026-02-14</td>
      </tr>
    </tbody>
  </table>
</div>
```

Table features include sortable columns, row selection with checkboxes, pagination controls, search/filter inputs, and responsive horizontal scrolling for mobile viewports.

## Sidebar Layout Pattern

The Prismatic Platform enforces a specific sidebar layout pattern using Flowbite components. This pattern is validated by automated scripts and enforced through pre-commit hooks:

```html
<!-- Mandatory sidebar pattern: hidden lg:block -->
<div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
  <!-- Main content: 3/4 width on large screens -->
  <div class="lg:col-span-3">
    <div class="prose prose-invert prose-lg max-w-none">
      <!-- Page content -->
    </div>
  </div>

  <!-- Sidebar: hidden on mobile, visible on large screens -->
  <div class="hidden lg:block">
    <div class="sticky top-4 space-y-6">
      <!-- Sidebar widgets -->
      <div class="bg-gray-800 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-white mb-4">Related Topics</h3>
        <!-- Widget content -->
      </div>
    </div>
  </div>
</div>
```

| Rule | Requirement | Validation Script |
|------|-------------|-------------------|
| **R1** | All sidebar `<div>` elements must have `hidden lg:block` | `validate-flowbite-sidebar.sh` |
| **R2** | Grid layouts must use `lg:` breakpoint (not `md:`) | `validate-flowbite-sidebar.sh` |
| **R3** | Main content uses `lg:col-span-3` | `validate-flowbite-sidebar.sh` |
| **R5** | Content wrappers use `prose prose-invert` | `validate-flowbite-sidebar.sh` |

## Modal and Dialog Components

Modals provide focused interaction surfaces for confirmations, detail views, and form inputs:

```html
<!-- Flowbite modal for compliance details -->
<div x-data="{ showModal: false }">
  <button @click="showModal = true"
    class="text-blue-500 hover:underline text-sm">
    View Details
  </button>

  <div x-show="showModal" x-cloak
    class="fixed inset-0 z-50 flex items-center justify-center p-4
           bg-gray-900 bg-opacity-75"
    @keydown.escape.window="showModal = false">
    <div class="relative w-full max-w-2xl bg-gray-800 rounded-lg shadow-xl"
      @click.away="showModal = false">
      <div class="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 class="text-xl font-semibold text-white">NIS2 Compliance Details</h3>
        <button @click="showModal = false"
          class="text-gray-400 hover:text-white rounded-lg text-sm p-1.5">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10
              8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293
              4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0
              01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
          </svg>
        </button>
      </div>
      <div class="p-6 space-y-4">
        <!-- Compliance assessment content -->
      </div>
    </div>
  </div>
</div>
```

## Notification Components

The platform uses Flowbite's alert and toast components for system notifications:

```elixir
defmodule PrismaticWeb.Components.Notifications do
  @moduledoc "Flowbite-based notification components for platform alerts."

  use Phoenix.Component

  attr :type, :atom, values: [:info, :success, :warning, :error], required: true
  attr :message, :string, required: true
  attr :dismissible, :boolean, default: true

  def alert(assigns) do
    ~H"""
    <div role="alert"
         class={"flex items-center p-4 mb-4 rounded-lg #{alert_colors(@type)}"}>
      <svg class="flex-shrink-0 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <%= alert_icon(@type) %>
      </svg>
      <span class="sr-only"><%= @type %></span>
      <div class="ml-3 text-sm font-medium"><%= @message %></div>
      <button :if={@dismissible}
              type="button"
              class={"ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 #{dismiss_colors(@type)}"}
              phx-click="dismiss_alert">
        <span class="sr-only">Close</span>
        <svg class="w-3 h-3" fill="none" viewBox="0 0 14 14">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
        </svg>
      </button>
    </div>
    """
  end

  defp alert_colors(:info), do: "text-blue-400 bg-blue-900/50 border border-blue-800"
  defp alert_colors(:success), do: "text-green-400 bg-green-900/50 border border-green-800"
  defp alert_colors(:warning), do: "text-yellow-400 bg-yellow-900/50 border border-yellow-800"
  defp alert_colors(:error), do: "text-red-400 bg-red-900/50 border border-red-800"
end
```

## Context in Prismatic

The Prismatic Platform uses Flowbite 2.3 as its standard component library for all [LiveView](@/glossary/liveview.md) dashboards and web interfaces across 115 umbrella applications. The library is a core part of the platform's UI stack alongside [TailwindCSS](@/glossary/tailwindcss.md) 3.4 and Alpine.js 3.13.5.

**Dashboard Components**: The [Perimeter EASM](@/glossary/easm.md) dashboard at `/perimeter` uses Flowbite data tables for asset inventory display, badge components for security grade visualization (color-coded A-F grades), progress bars for compliance scores, and card layouts for metric summaries.

**Navigation Protection**: Platform development rules specifically mandate that `phx-click` handlers on Flowbite dropdowns must never be broken during code changes. This navigation protection rule exists because dropdown menus in the LiveView dashboards combine Flowbite's JavaScript toggle behavior with Phoenix's server-side event handling, and breaking either layer renders navigation unusable.

**Promo Site Integration**: The public promo site at `sites/promo/` uses Flowbite 2.3 integrated with Alpine.js 3.13.5 for interactive features including agent registry filtering, glossary search, capability browsing, and section navigation. The Flowbite plugin is loaded in the TailwindCSS configuration to ensure all component utility classes are included in the generated CSS.

**Installation and Configuration**:

```javascript
// In tailwind.config.js
module.exports = {
  content: [
    // ... template paths
    "../deps/flowbite/**/*.js",   // Include Flowbite JS for class scanning
    "./node_modules/flowbite/**/*.js"  // NPM-installed Flowbite
  ],
  plugins: [
    require('flowbite/plugin')     // Register Flowbite's TailwindCSS plugin
  ],
  darkMode: 'class',              // Class-based dark mode
  theme: {
    extend: {
      // Platform-specific extensions
    }
  }
}
```

**Component Usage Patterns**:

| Component | Platform Usage | Route |
|-----------|---------------|-------|
| **Data Table** | Asset inventory, agent registry, compliance reports | `/perimeter/assets` |
| **Dropdown** | Filter menus, action menus, navigation | All dashboards |
| **Modal** | Detail views, confirmations, compliance deep-dives | `/perimeter/compliance` |
| **Badge** | Security grades, status indicators, priority labels | `/perimeter` |
| **Card** | Metric summaries, feature highlights, overview panels | `/perimeter`, promo site |
| **Alert** | Security warnings, system notifications, validation errors | All dashboards |
| **Sidebar** | Main navigation, section navigation | `/perimeter/*` |
| **Tabs** | Content organization, view switching | `/perimeter/easm` |
| **Progress Bar** | Compliance scores, scan progress | `/perimeter/compliance` |
| **Tooltip** | Contextual help, field descriptions | All dashboards |

## TailwindCSS Rebuild Requirement

After any template changes that add or modify Flowbite component classes, the TailwindCSS output must be rebuilt to include the new utility classes:

```bash
# MANDATORY after template changes
cd sites/promo && npx tailwindcss -i static/css/tailwind-input.css -o static/css/tailwind.css --minify

# For development (watch mode)
npx tailwindcss -i static/css/tailwind-input.css -o static/css/tailwind.css --watch
```

Failure to rebuild causes invisible text, missing backgrounds, and broken layouts because TailwindCSS's JIT compiler only generates CSS for classes it finds in scanned template files.

## Flowbite vs Other Component Libraries

| Library | CSS Framework | Bundle Size | Dark Mode | Accessibility | LiveView Compat |
|---------|--------------|-------------|-----------|---------------|-----------------|
| **Flowbite** | TailwindCSS | ~15KB JS | Full support | WAI-ARIA | Excellent |
| **DaisyUI** | TailwindCSS | CSS only | Full support | Partial | Good |
| **Headless UI** | Any | ~10KB JS | Manual | Full WAI-ARIA | Good |
| **Radix UI** | Any | Per-component | Manual | Full WAI-ARIA | Poor (React-only) |
| **Bootstrap** | Own CSS | ~60KB CSS + JS | v5.3+ | WAI-ARIA | Moderate |
| **Material UI** | Own CSS-in-JS | ~300KB | Full support | WAI-ARIA | Poor (React-only) |

Flowbite was chosen for the Prismatic Platform because it provides the best balance of TailwindCSS integration (zero custom CSS), interactive components (Alpine.js-powered), accessibility compliance, and dark mode support within the constraint of the platform's TailwindCSS-first mandate.

## Design Token Consistency

Flowbite inherits TailwindCSS's design token system, ensuring visual consistency across all platform components:

| Token Category | Scale | Example |
|---------------|-------|---------|
| **Spacing** | 0, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24 | `p-4`, `mt-6`, `gap-8` |
| **Colors** | 50-950 shades per color | `bg-gray-800`, `text-blue-400` |
| **Border Radius** | none, sm, md, lg, xl, 2xl, full | `rounded-lg` |
| **Font Size** | xs, sm, base, lg, xl, 2xl, 3xl, 4xl | `text-sm`, `text-xl` |
| **Font Weight** | thin, light, normal, medium, semibold, bold, extrabold | `font-semibold` |
| **Shadow** | sm, md, lg, xl, 2xl, inner | `shadow-lg` |

## Related Terms

- [TailwindCSS](@/glossary/tailwindcss.md) - The underlying CSS framework that Flowbite extends with components
- [LiveView](@/glossary/liveview.md) - Server-side rendering framework consuming Flowbite components
- [Phoenix](@/glossary/phoenix.md) - Web framework providing the application layer
- [EASM](@/glossary/easm.md) - Dashboard using Flowbite components for asset inventory and compliance views
- [Clean Run](@/glossary/clean-run.md) - Quality standard extending to UI code consistency
- [Channel](@/glossary/channel.md) - Real-time communication backing live dashboard updates
- [WebSocket](@/glossary/websocket.md) - Transport protocol enabling real-time Flowbite component updates
- [PubSub](@/glossary/pubsub.md) - Event system triggering dashboard component refreshes
- [Observability](@/glossary/observability.md) - Monitoring dashboards built with Flowbite components
- [Docker](@/glossary/docker.md) - Container builds including Flowbite dependency installation

## See Also

- [Architecture](@/architecture/_index.md) - Platform UI architecture and component strategy
- [Technologies](@/technologies/_index.md) - Technology stack details
- [Apps](@/apps/_index.md) - Applications using Flowbite components

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
