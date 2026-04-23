+++
title = "Alpine.js"
weight = 22
[extra]
category = "frontend"
description = "Lightweight reactive JavaScript framework for composing behavior directly in HTML markup"
url = "https://alpinejs.dev"
version = "3.13+"
icon = "alpine"
color = "cyan"
status = "active"
reading_time = "8 min"
author = "Tomas Korcak (korczis)"
word_count = 1142
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Alpinejs", "Lightweight", "JavaScript", "HTML", "technologies", "frontend", "Prismatic Platform", "Alpine", "LiveView", "Phoenix LiveView"]
tags = ["technologies", "frontend", "alpinejs", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "Alpine.js - Prismatic Platform"
+++

## Overview

Alpine.js is the client-side reactive framework used in the Prismatic Platform for interactive UI behaviors that complement [Phoenix LiveView](@/technologies/phoenix-liveview.md)'s server-rendered approach. At just ~15KB minified and gzipped, Alpine provides reactive data binding, event handling, and DOM manipulation through declarative HTML attributes -- no build step, no bundler, no compilation pipeline required. It occupies the sweet spot between plain JavaScript and a full single-page application framework, delivering reactivity without the complexity overhead.

The Prismatic Platform uses Alpine.js for client-side-only interactions: search filtering, tab switching, dropdown menus, modal dialogs, and data table sorting. These interactions benefit from instant client-side response without a server round-trip, improving perceived performance for common UI operations. On the promotional site built with [Zola](@/technologies/zola.md), Alpine handles the entire registry filtering system, allowing visitors to search and filter through 404 agents, 211 commands, and 45 technologies entirely in the browser without any backend calls.

Alpine's `x-data`, `x-bind`, and `x-on` directives integrate cleanly with Zola's static site generation for the platform's documentation and promotional sites, while also working alongside LiveView in the main application. This dual-context usage means Alpine components are authored once and deployed across both static and dynamic contexts without modification, reducing the maintenance burden of shared UI patterns.

## Key Features

Alpine.js provides a focused set of reactive primitives that cover the vast majority of client-side interaction needs without introducing framework-level complexity.

- **Declarative Syntax**: `x-data`, `x-show`, `x-bind`, `x-on` directives embedded directly in HTML markup for transparent behavior
- **Reactive Data**: Automatic DOM updates when underlying data properties change, with no manual re-rendering or virtual DOM diffing
- **Transitions**: Built-in CSS transition support with `x-transition` for smooth show/hide animations with configurable enter/leave states
- **No Build Step**: Script tag inclusion only -- no webpack, no bundler, no compilation required, keeping the toolchain minimal
- **Small Footprint**: ~15KB minified and gzipped, contributing minimal overhead to page load times and Core Web Vitals scores
- **Component Pattern**: Reusable behaviors registered via `Alpine.data()` for structured, testable components with encapsulated state
- **LiveView Compatibility**: Works alongside Phoenix LiveView without DOM conflicts through careful scope isolation
- **Store Pattern**: Global state management via `Alpine.store()` for cross-component data sharing without prop drilling
- **Magic Properties**: `$refs`, `$el`, `$dispatch`, and `$nextTick` for common DOM interaction patterns

| Directive | Purpose | Platform Usage |
|-----------|---------|----------------|
| `x-data` | Component initialization | Every interactive widget |
| `x-model` | Two-way data binding | Search inputs, form fields |
| `x-show` | Conditional visibility | Dropdown menus, collapsible panels |
| `x-for` | List rendering | Registry tables, card grids |
| `x-on` / `@` | Event handling | Button clicks, keyboard shortcuts |
| `x-bind` / `:` | Dynamic attributes | CSS classes, disabled states |
| `x-transition` | Enter/leave animations | Modal dialogs, toast notifications |
| `x-init` | Lifecycle hook | Data fetching on mount |

## Platform Integration

Alpine.js powers client-side filtering and interactions across all list views on the promo site, including the agent registry, command catalog, and technology explorer pages. The implementation demonstrates how Alpine handles complex filtering logic entirely in the browser.

```html
<!-- Alpine.js powered search and filter for technology registry -->
<div x-data="techTable()">
    <input type="text"
           x-model="searchQuery"
           @input="filterTech()"
           class="bg-gray-800 text-white border-gray-700 rounded-lg px-4 py-2 w-full"
           placeholder="Search technologies...">

    <div class="flex gap-2 mt-3">
        <template x-for="cat in categories" :key="cat">
            <button @click="toggleCategory(cat)"
                    :class="activeCategory === cat ? 'bg-blue-600' : 'bg-gray-700'"
                    class="px-3 py-1 rounded-full text-sm text-white"
                    x-text="cat"></button>
        </template>
    </div>

    <template x-for="tech in paginatedTech" :key="tech.id">
        <div class="p-4 rounded-xl border border-gray-700 hover:border-blue-500 transition"
             @click="window.location.href = tech.url">
            <h3 x-text="tech.name" class="text-white font-semibold"></h3>
            <p x-text="tech.description" class="text-gray-400 text-sm mt-1"></p>
        </div>
    </template>

    <div class="mt-4 text-gray-400 text-sm">
        Showing <span x-text="paginatedTech.length"></span>
        of <span x-text="filteredTech.length"></span> technologies
    </div>
</div>
```

In the main [prismatic_web](@/apps/prismatic-web.md) application, Alpine handles lightweight interactions that do not require server state -- collapsible sidebar sections, clipboard copy buttons, and local preference toggles such as table density settings. These are interactions where a server round-trip would add unnecessary latency.

## Architecture

Alpine.js occupies a specific niche in the platform's frontend architecture. The platform follows a layered approach where each tool handles the interaction tier it is best suited for.

| Interaction Tier | Handler | Latency | State Location |
|-----------------|---------|---------|----------------|
| Page navigation | Phoenix Router | Full page load | Server |
| Dynamic content | [Phoenix LiveView](@/technologies/phoenix-liveview.md) | ~50ms WebSocket | Server (assigns) |
| Client-only UI | Alpine.js | Instant (0ms) | Browser (x-data) |
| Styling/layout | [TailwindCSS](@/technologies/tailwindcss.md) | N/A (CSS) | Stylesheet |

This separation ensures that Alpine never competes with LiveView for DOM control. Alpine manages visibility, class toggling, and local state, while LiveView manages server-rendered content. The boundary is explicit: if an interaction requires data from the database or business logic, it belongs to LiveView. If it is purely presentational (show/hide, filter client-side data, toggle theme), it belongs to Alpine.

```javascript
// Alpine component registration pattern used across the platform
document.addEventListener('alpine:init', () => {
    Alpine.data('registryTable', () => ({
        searchQuery: '',
        activeCategory: 'all',
        items: [],

        get filteredItems() {
            return this.items.filter(item => {
                const matchesSearch = item.name.toLowerCase()
                    .includes(this.searchQuery.toLowerCase());
                const matchesCategory = this.activeCategory === 'all'
                    || item.category === this.activeCategory;
                return matchesSearch && matchesCategory;
            });
        },

        get categories() {
            return ['all', ...new Set(this.items.map(i => i.category))];
        }
    }));
});
```

## Performance Characteristics

Alpine.js was selected specifically for its minimal performance impact. The platform's page load performance standard requires all pages to load under 250ms, and Alpine's ~15KB footprint ensures it does not contribute meaningfully to that budget.

| Metric | Value | Impact |
|--------|-------|--------|
| Bundle size (min+gzip) | ~15KB | Negligible on page load |
| Parse time | < 5ms | Below measurement threshold |
| First interaction | Instant | No hydration delay |
| Memory per component | ~1-2KB | Minimal overhead per widget |
| DOM update granularity | Targeted | No virtual DOM diffing overhead |
| LiveView compatibility | Full | No DOM patching conflicts |

Compared to React (~45KB) or Vue (~33KB), Alpine's footprint is 2-3x smaller with no build step overhead. For the promo site, where pages are static HTML enhanced with filtering, Alpine provides the optimal performance-to-capability ratio.

## Configuration

Alpine.js is loaded via CDN with the `defer` attribute to avoid blocking page rendering. No additional build tooling is required, keeping the deployment pipeline simple and fast.

```html
<!-- Alpine.js loaded via CDN with defer in base.html -->
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.13.5/dist/cdn.min.js"></script>
```

For the promo site, Alpine component definitions are placed in inline `<script>` blocks within Zola templates, keeping behavior co-located with the markup it controls. In the main application, Alpine components are defined in the Phoenix asset pipeline alongside LiveView hooks.

Platform-wide Alpine configuration ensures consistent behavior across all pages:

```javascript
// Global Alpine configuration
document.addEventListener('alpine:init', () => {
    // Global store for shared state
    Alpine.store('preferences', {
        tableDensity: 'comfortable',
        sidebarCollapsed: false,

        toggleSidebar() {
            this.sidebarCollapsed = !this.sidebarCollapsed;
            localStorage.setItem('sidebar', this.sidebarCollapsed);
        }
    });
});
```

## Best Practices

The platform follows several conventions for Alpine.js usage to maintain consistency and prevent conflicts with LiveView. These practices are enforced through code review and template validation scripts.

- **Use `x-data` for local state only** -- server-managed state belongs in LiveView assigns, not Alpine data properties
- **Prefer `Alpine.data()` registration** over inline `x-data` objects for any component exceeding five lines of logic
- **Avoid DOM manipulation** that conflicts with LiveView's DOM patching -- Alpine controls visibility and class toggling, LiveView controls content
- **Keep Alpine logic minimal** -- if an interaction requires server data, it should be a LiveView event, not an Alpine fetch call
- **Use `$dispatch` for cross-component communication** rather than direct DOM manipulation or global variables
- **Leverage `x-transition` for smooth animations** instead of custom CSS transitions to maintain consistency
- **Test with data attributes** -- use `data-testid` attributes on Alpine-controlled elements for reliable end-to-end testing
- **Prefer computed getters** (`get filteredItems()`) over manual filtering in event handlers for automatic reactivity

## Comparison

Alpine.js was chosen over heavier frontend frameworks because the Prismatic Platform's architecture delegates most interactivity to [Phoenix LiveView](@/technologies/phoenix-liveview.md) on the server side. Alpine fills the remaining gap for client-only interactions without introducing build complexity.

| Criterion | Alpine.js | React | Vue | Stimulus |
|-----------|-----------|-------|-----|----------|
| Bundle size | ~15KB | ~45KB | ~33KB | ~8KB |
| Build step required | No | Yes | Yes | No |
| Learning curve | Minimal | Significant | Moderate | Minimal |
| LiveView compatibility | Excellent | Poor (DOM conflicts) | Fair | Good |
| Reactivity model | Proxy-based | Virtual DOM | Proxy-based | None (DOM-only) |
| Component registration | `Alpine.data()` | JSX components | SFC / Options | Controllers |
| State management | `Alpine.store()` | Context / Redux | Pinia / Vuex | N/A |

## Related Technologies

- [Phoenix LiveView](@/technologies/phoenix-liveview.md) - Server-side real-time UI, complementary to Alpine's client-side role
- [TailwindCSS](@/technologies/tailwindcss.md) - Utility-first CSS framework styled alongside Alpine directives
- [Flowbite](@/technologies/flowbite.md) - Component library that uses Alpine-compatible JavaScript patterns
- [Zola](@/technologies/zola.md) - Static site generator where Alpine provides all interactivity for the promo site
- [Phoenix Framework](@/technologies/phoenix.md) - Web framework providing the server-side application layer

## Related Apps

- [prismatic_web](@/apps/prismatic-web.md) - Client-side Alpine interactions in LiveView dashboards for collapsible panels and local preferences
- [prismatic_perimeter](@/apps/prismatic-perimeter.md) - Alpine-powered filter controls on the EASM dashboard for asset filtering
- [prismatic_api](@/apps/prismatic-api.md) - Swagger UI enhanced with Alpine.js for interactive API exploration

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)