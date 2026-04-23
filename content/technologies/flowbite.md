+++
title = "Flowbite"
weight = 21
[extra]
category = "frontend"
description = "Open-source UI component library built on TailwindCSS with interactive elements and dark mode support"
url = "https://flowbite.com"
version = "2.3+"
icon = "flowbite"
color = "blue"
status = "active"
reading_time = "8 min"
author = "Tomas Korcak (korczis)"
word_count = 1259
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Flowbite", "Open-source", "TailwindCSS", "technologies", "frontend", "Prismatic Platform", "JavaScript"]
tags = ["technologies", "frontend", "flowbite", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "Flowbite - Prismatic Platform"
+++

## Overview

Flowbite is the UI component library that provides pre-built, accessible components for the Prismatic Platform's interfaces. Built on [TailwindCSS](@/technologies/tailwindcss.md), Flowbite offers dropdowns, modals, navigation bars, tables, forms, and data display components that maintain visual consistency across the platform's extensive dashboard ecosystem. The library supplies over 50 production-ready components that have been tested for accessibility, responsiveness, and cross-browser compatibility, eliminating the need for custom CSS development across the platform's 90 applications.

The Prismatic Platform mandates Flowbite as the primary component library, ensuring that all UI elements follow a consistent interaction pattern and visual design language. This mandate is enforced at the code review level -- custom CSS and inline styles are forbidden in favor of Flowbite's utility-class-based components. Flowbite's JavaScript-powered components (dropdowns, modals, tooltips, collapse) work seamlessly with [Phoenix LiveView](@/technologies/phoenix-liveview.md)'s server-rendered approach, where the DOM is patched by the server while Flowbite handles client-side animation and positioning. This division of responsibility is a deliberate architectural decision: the server owns the data and DOM structure, while Flowbite handles presentation-layer behaviors like transitions, focus management, and positioning.

Flowbite's dark mode support is critical for the platform, which defaults to a dark theme optimized for extended monitoring sessions typical in security operations centers. The platform forces dark mode via the `dark` class on the root `<html>` element, and all Flowbite components render in their dark variant automatically. This approach eliminates the conditional `dark:` prefix overhead that would otherwise be required on every utility class, since the dark context is always active.

## Key Features

- **Pre-built Components**: Tables, forms, navigation bars, modals, alerts, badges, breadcrumbs, and 50+ additional components ready for production use
- **Dark Mode**: Full dark mode support matching TailwindCSS `dark:` variant, active by default in Prismatic for SOC-optimized visual environments
- **Accessibility**: ARIA attributes, keyboard navigation, and focus management built into every component following WCAG 2.1 AA compliance
- **JavaScript Interactions**: Dropdowns, collapse toggles, tooltips, popovers, and dismissable alerts with smooth CSS transitions
- **Data Display**: Cards, tables with sorting, list groups, timeline components, and statistics widgets for dashboard construction
- **Form Components**: Inputs, selects, toggles, file uploads, range sliders, and datepickers with validation states and error messaging
- **Navigation Protection**: Dropdown components use `phx-click` compatible event handling that does not conflict with LiveView DOM patching
- **Responsive Design**: All components adapt from mobile to desktop viewports through TailwindCSS responsive breakpoints

## Platform Integration

Flowbite components are used throughout the platform's dashboards, including the [Perimeter EASM](@/apps/prismatic-perimeter.md) security dashboard, the [agent coordination](@/apps/prismatic-agents.md) console, and the visitor intelligence panels. Every interactive element visible to platform users is built from Flowbite primitives, ensuring consistency across the entire interface.

```html
<!-- Flowbite data table in Prismatic agent dashboard -->
<div class="relative overflow-x-auto shadow-md sm:rounded-lg">
    <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50
                      dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <th scope="col" class="px-6 py-3">Agent</th>
                <th scope="col" class="px-6 py-3">Status</th>
                <th scope="col" class="px-6 py-3">Domain</th>
                <th scope="col" class="px-6 py-3">Last Activity</th>
            </tr>
        </thead>
        <tbody>
            <%= for agent <- @agents do %>
            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700
                       hover:bg-gray-50 dark:hover:bg-gray-600">
                <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    <%= agent.name %>
                </td>
                <td class="px-6 py-4">
                    <span class="px-2.5 py-0.5 rounded-full text-xs font-medium
                                 bg-green-100 text-green-800 dark:bg-green-900
                                 dark:text-green-300">
                        <%= agent.status %>
                    </span>
                </td>
                <td class="px-6 py-4"><%= agent.domain %></td>
                <td class="px-6 py-4"><%= agent.last_activity %></td>
            </tr>
            <% end %>
        </tbody>
    </table>
</div>
```

Flowbite's modal component is used for confirmation dialogs, agent detail views, and security finding drill-downs. The tooltip component displays contextual help throughout the EASM dashboard, while badge components convey status information with color-coded severity levels.

## Architecture

Flowbite occupies the presentation layer in the Prismatic Platform's frontend architecture, sitting between [TailwindCSS](@/technologies/tailwindcss.md) (the utility framework) and [Phoenix LiveView](@/technologies/phoenix-liveview.md) (the server-rendered DOM). This layering creates a clean separation of concerns.

| Layer | Technology | Responsibility |
|-------|-----------|----------------|
| Server DOM | [Phoenix LiveView](@/technologies/phoenix-liveview.md) | Data binding, DOM structure, event handling |
| UI Components | Flowbite | Pre-built component patterns, dark mode, layout |
| Utility Framework | [TailwindCSS](@/technologies/tailwindcss.md) | Atomic utility classes, responsive design |
| Client Reactivity | [Alpine.js](@/technologies/alpinejs.md) | Custom client-side state beyond Flowbite defaults |
| JavaScript | Flowbite JS | Animations, positioning, focus trapping, transitions |

The architectural constraint is important: Flowbite components must never assume control over the DOM structure that LiveView manages. LiveView patches the DOM from the server, and Flowbite must re-initialize its JavaScript behaviors after each patch. This is accomplished through Phoenix hooks that call `initFlowbite()` on the `updated` lifecycle callback.

## Component Catalog

The platform uses a specific subset of Flowbite's component library, chosen for relevance to security operations and data-intensive dashboard interfaces.

| Component | Platform Usage | LiveView Compatible |
|-----------|---------------|---------------------|
| Tables | Agent registry, finding lists, asset inventory | Yes - server-sorted/filtered |
| Modals | Detail views, confirmation dialogs, finding drilldowns | Yes - `phx-click` triggers |
| Dropdowns | Navigation menus, filter selectors, action menus | Yes - with re-init hook |
| Badges | Status indicators, severity levels, compliance grades | Yes - direct rendering |
| Cards | Dashboard widgets, metric panels, summary views | Yes - direct rendering |
| Alerts | System notifications, error messages, warnings | Yes - dismissable via Flowbite JS |
| Tooltips | Help text, abbreviation expansion, metric definitions | Yes - with re-init hook |
| Breadcrumbs | Dashboard navigation paths, section hierarchy | Yes - direct rendering |
| Tabs | Multi-view panels, configuration sections | Yes - with `phx-click` integration |
| Timeline | Activity logs, event history, audit trails | Yes - direct rendering |

## Performance Characteristics

Flowbite's performance impact on the Prismatic Platform is minimal due to its utility-class approach -- there is no runtime CSS generation or virtual DOM overhead. Performance characteristics measured in the platform environment include the following.

| Metric | Value | Notes |
|--------|-------|-------|
| CSS bundle size (minified) | ~12 KB | Flowbite-specific additions to TailwindCSS |
| JavaScript bundle (minified) | ~45 KB | Component initialization and interaction handlers |
| Component init time | < 5ms | Per-component JavaScript initialization |
| Re-initialization (LiveView patch) | < 10ms | Full `initFlowbite()` call after DOM update |
| First Contentful Paint impact | < 50ms | Measured against bare TailwindCSS baseline |
| Cumulative Layout Shift | 0.0 | Components render at final size immediately |

These measurements satisfy the platform's [quality gates](@/capabilities/quality-gates.md) requirement that all pages load under 250ms total, with server-side render time under 100ms.

## Configuration

Flowbite is loaded via CDN in the base template. The CSS is included before the closing `</head>` tag, and the JavaScript is loaded before `</body>` to ensure components initialize after DOM rendering.

```html
<!-- Flowbite loaded in base.html -->
<link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.css"
      rel="stylesheet" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.js"></script>
```

For LiveView compatibility, Flowbite components are re-initialized after LiveView DOM patches using a hook that calls `initFlowbite()` on the `updated` callback. This is the most critical integration point between Flowbite and the platform's server-rendered architecture.

```javascript
// Phoenix LiveView hook for Flowbite re-initialization
let Hooks = {};
Hooks.FlowbiteInit = {
  mounted() {
    initFlowbite();
  },
  updated() {
    initFlowbite();
  }
};

let liveSocket = new LiveSocket("/live", Socket, {
  hooks: Hooks,
  params: { _csrf_token: csrfToken }
});
```

## Best Practices

The platform enforces strict conventions around Flowbite usage to maintain consistency and prevent regressions across the 90-application umbrella.

- **Always use Flowbite components** over custom implementations -- consistency is enforced platform-wide through code review and the [AIAD Standard](@/capabilities/aiad-standard.md)
- **Never use inline styles** -- all styling must go through TailwindCSS utility classes and Flowbite patterns; violations are caught by pre-commit hooks
- **Protect navigation dropdowns** -- ensure `phx-click` events on dropdown items do not conflict with Flowbite's toggle handlers; test dropdown interaction after every LiveView change
- **Re-initialize after LiveView patches** -- Flowbite JavaScript needs re-initialization when LiveView replaces DOM elements; always attach the `FlowbiteInit` hook to containers with interactive Flowbite components
- **Use dark variant classes directly** -- since Prismatic forces dark mode, prefer `dark:bg-gray-800` patterns consistently and never add light-mode-only styling
- **Test keyboard navigation** -- all Flowbite components must remain keyboard-accessible in the platform context; verify Tab, Enter, and Escape key behaviors
- **Avoid custom JavaScript** -- if a behavior exists in Flowbite, use it rather than implementing a custom [Alpine.js](@/technologies/alpinejs.md) solution

## Comparison with Alternatives

| Feature | Flowbite | Headless UI | DaisyUI | Radix UI |
|---------|----------|-------------|---------|----------|
| TailwindCSS Native | Yes | Yes | Yes | No |
| Dark Mode Built-in | Yes | Manual | Yes | Manual |
| JavaScript Included | Yes | Yes | No | Yes |
| LiveView Compatible | Yes (with hooks) | Partial | Yes | No (React only) |
| Component Count | 50+ | 10 | 40+ | 30+ |
| Accessibility | WCAG 2.1 AA | WCAG 2.1 AA | Partial | WCAG 2.1 AAA |
| Bundle Size | ~57 KB | ~15 KB | ~0 KB (CSS only) | ~25 KB |
| Server-rendered Support | Yes | Limited | Yes | No |

Flowbite was selected for the Prismatic Platform because of its combination of server-rendered HTML compatibility, built-in dark mode, comprehensive component library, and JavaScript interaction support that works alongside LiveView without requiring a JavaScript framework like React or Vue.

## Related Technologies

- [TailwindCSS](@/technologies/tailwindcss.md) - The underlying utility-first CSS framework that Flowbite extends with component patterns
- [Alpine.js](@/technologies/alpinejs.md) - Client-side reactivity for custom interactions beyond Flowbite's built-in capabilities
- [Phoenix LiveView](@/technologies/phoenix-liveview.md) - Server-side rendering that Flowbite components complement for dynamic interfaces
- [Phoenix](@/technologies/phoenix.md) - The web framework providing the template and rendering infrastructure

## Related Apps

- [prismatic_web](@/apps/prismatic-web.md) - All Flowbite-powered dashboard interfaces across the platform
- [prismatic_perimeter](@/apps/prismatic-perimeter.md) - EASM dashboard using Flowbite tables, badges, and modals for security data display
- [prismatic_api](@/apps/prismatic-api.md) - Swagger UI interface styled with Flowbite conventions

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)