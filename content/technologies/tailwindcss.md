+++
title = "TailwindCSS"
weight = 20
[extra]
category = "frontend"
description = "Utility-first CSS framework for rapidly building custom user interfaces without leaving HTML"
url = "https://tailwindcss.com"
version = "3.4+"
icon = "tailwind"
color = "cyan"
status = "active"
reading_time = "8 min"
author = "Tomas Korcak (korczis)"
word_count = 1193
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["TailwindCSS", "Utility-first", "HTML", "technologies", "frontend", "Prismatic Platform", "Tailwind"]
tags = ["technologies", "frontend", "tailwindcss", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "TailwindCSS - Prismatic Platform"
+++

## Overview

TailwindCSS is the mandatory styling framework for all Prismatic Platform user interfaces. It provides a comprehensive set of utility classes that enable rapid UI development directly in HTML templates without writing custom CSS. The platform enforces a strict TailwindCSS-first policy -- custom CSS and inline styles are forbidden -- ensuring visual consistency across all dashboards, forms, and data visualization interfaces throughout the 90-application umbrella.

The Prismatic Platform's dark-mode-first design, responsive layouts, and consistent visual language are all built entirely with Tailwind utilities. Combined with [Flowbite](/technologies/flowbite/) components, Tailwind enables the platform to maintain a cohesive design system across its numerous dashboards, forms, and data visualization interfaces. The dark mode is forced via the `class="dark"` attribute on the HTML root element, with all styling using direct dark-theme classes (`bg-gray-950`, `text-white`, `text-gray-400`) rather than `dark:` conditional variants.

Tailwind's JIT (Just-In-Time) compiler generates only the CSS classes actually used in templates, keeping bundle sizes minimal even with the platform's extensive UI surface area. The framework's design token system (colors, spacing, typography) ensures visual consistency across all applications and is configured through a single `tailwind.config.js` that all platform templates reference.

## Key Features

- **Utility-First**: Compose designs with small, single-purpose classes (`p-4`, `text-lg`, `bg-gray-900`) instead of writing custom CSS
- **JIT Compiler**: On-demand CSS generation scans template files and produces only the classes actually used, resulting in small production bundles
- **Responsive Design**: Mobile-first breakpoint system (`sm`, `md`, `lg`, `xl`, `2xl`) for adaptive layouts across device sizes
- **Dark Mode**: Built-in dark mode support with `dark:` variant, though the platform forces dark mode globally via class strategy
- **Design Tokens**: Configurable color palette, spacing scale, typography, and shadows that define the platform's visual language
- **Arbitrary Values**: Escape hatch with bracket notation (`w-[137px]`, `text-[#1da1f2]`) for one-off values that do not fit the design system
- **Plugin Ecosystem**: Extensible through plugins including `@tailwindcss/forms`, `@tailwindcss/typography`, and Flowbite
- **Pseudo-Class Variants**: State variants (`hover:`, `focus:`, `active:`, `disabled:`) for interactive element styling

## Platform Integration

TailwindCSS powers all platform UI through [Phoenix LiveView](/technologies/phoenix-liveview/) templates. The design system follows a consistent pattern across all dashboards.

```html
<!-- Prismatic Platform security rating card pattern -->
<div class="bg-gray-900 rounded-2xl border border-gray-700 p-6
            hover:shadow-xl hover:border-gray-600 transition-all duration-300">
    <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-white">Security Rating</h3>
        <span class="text-xs text-gray-400">Updated 5m ago</span>
    </div>
    <div class="flex items-baseline gap-3">
        <span class="text-5xl font-black text-transparent bg-clip-text
                     bg-gradient-to-r from-teal-400 to-cyan-400">
            A+
        </span>
        <span class="text-2xl font-bold text-gray-300">850/900</span>
    </div>
    <div class="mt-4 grid grid-cols-3 gap-2">
        <div class="text-center p-2 bg-gray-800 rounded-lg">
            <div class="text-sm font-medium text-teal-400">12</div>
            <div class="text-xs text-gray-500">Assets</div>
        </div>
        <div class="text-center p-2 bg-gray-800 rounded-lg">
            <div class="text-sm font-medium text-yellow-400">3</div>
            <div class="text-xs text-gray-500">Findings</div>
        </div>
        <div class="text-center p-2 bg-gray-800 rounded-lg">
            <div class="text-sm font-medium text-green-400">98%</div>
            <div class="text-xs text-gray-500">Compliance</div>
        </div>
    </div>
</div>
```

LiveView components use Tailwind classes for dynamic styling based on server state:

```elixir
defmodule PrismaticWeb.Components.StatusBadge do
  use Phoenix.Component

  attr :status, :atom, required: true
  attr :label, :string, default: nil

  def badge(assigns) do
    ~H"""
    <span class={"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  #{status_classes(@status)}"}>
      <%= @label || to_string(@status) %>
    </span>
    """
  end

  defp status_classes(:active), do: "bg-green-900 text-green-300"
  defp status_classes(:warning), do: "bg-yellow-900 text-yellow-300"
  defp status_classes(:error), do: "bg-red-900 text-red-300"
  defp status_classes(:idle), do: "bg-gray-800 text-gray-400"
end
```

## Architecture

TailwindCSS fits into the frontend build pipeline, processing template files to generate optimized CSS output.

| Stage | Tool | Input | Output |
|-------|------|-------|--------|
| **Template Authoring** | HEEx / HTML | Tailwind utility classes in markup | Template files |
| **CSS Generation** | TailwindCSS JIT | Template files + config | Optimized CSS bundle |
| **Build Integration** | `npx tailwindcss` | Input CSS + config | `tailwind.css` output |
| **Component Library** | [Flowbite](/technologies/flowbite/) | Pre-built component patterns | Consistent UI widgets |
| **Interactivity** | [Alpine.js](/technologies/alpinejs/) | Client-side state management | Dropdowns, modals, toggles |
| **LiveView** | [Phoenix LiveView](/technologies/phoenix-liveview/) | Server-rendered templates | Dynamic HTML with Tailwind classes |

The build pipeline runs during development and as a pre-deployment step:

```bash
# Development: watch mode for live reload
npx tailwindcss -i static/css/tailwind-input.css -o static/css/tailwind.css --watch

# Production: minified build
npx tailwindcss -i static/css/tailwind-input.css -o static/css/tailwind.css --minify
```

## Design System and Token Architecture

The platform's visual language is encoded entirely in the Tailwind configuration file, establishing a single source of truth for colors, typography, spacing, and animation. This token-based approach means that changing the platform's primary color or adjusting spacing scales requires modifying a single configuration file rather than searching through hundreds of templates.

| Token Category | Platform Defaults | Purpose |
|---------------|------------------|---------|
| **Colors** | `prismatic-50` through `prismatic-900` | Brand colors extending the default palette |
| **Typography** | Inter (sans), JetBrains Mono (mono) | Professional typography for dashboards and code |
| **Spacing** | Default Tailwind scale | Consistent spacing across all components |
| **Border radius** | Default + `rounded-2xl` for cards | Rounded, modern card design language |
| **Shadows** | Default + custom elevation scale | Depth hierarchy for overlapping elements |
| **Animations** | `pulse-slow` (3s) for status indicators | Subtle motion for active state indicators |

## Dark Mode Implementation

The platform forces dark mode globally via the `class="dark"` attribute on the HTML root element. This design decision simplifies the styling approach: there is no light mode, no toggle, and no conditional `dark:` prefixed variants on the main application pages. All styling uses direct dark-theme classes.

```html
<!-- base.html - Dark mode is always forced -->
<html lang="en" class="dark">
  <body class="bg-gray-950 text-gray-100 antialiased">
    <!-- All content renders in dark mode -->
  </body>
</html>
```

This forced dark mode approach has practical benefits: security operations teams typically prefer dark interfaces for extended monitoring sessions, the dark aesthetic aligns with the platform's security-focused branding, and eliminating the light/dark toggle reduces the number of visual states that need testing by half.

## Component Extraction Patterns

While Tailwind encourages utility-first styling, the platform extracts frequently repeated class combinations into Phoenix function components to maintain DRY templates. This is the recommended approach over Tailwind's `@apply` directive, which breaks the utility-first model and creates hidden dependencies.

```elixir
defmodule PrismaticWeb.Components.Card do
  use Phoenix.Component

  attr :class, :string, default: ""
  slot :inner_block, required: true

  def card(assigns) do
    ~H"""
    <div class={"bg-gray-900 rounded-2xl border border-gray-700 p-6
                 hover:shadow-xl hover:border-gray-600 transition-all duration-300 #{@class}"}>
      <%= render_slot(@inner_block) %>
    </div>
    """
  end

  attr :title, :string, required: true
  attr :subtitle, :string, default: nil
  slot :inner_block, required: true

  def card_header(assigns) do
    ~H"""
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-bold text-white"><%= @title %></h3>
      <span :if={@subtitle} class="text-xs text-gray-400"><%= @subtitle %></span>
    </div>
    <%= render_slot(@inner_block) %>
    """
  end
end
```

## Performance Characteristics

Tailwind's JIT compiler ensures that production CSS bundles contain only the classes actually used in the application.

| Metric | Value | Notes |
|--------|-------|-------|
| Production CSS size | ~30-50KB | After JIT tree-shaking and minification |
| Full Tailwind CSS | ~3.5MB | Unoptimized (never shipped to production) |
| Build time (JIT) | <2s | Full rebuild scanning all templates |
| Watch mode update | <200ms | Incremental on file change |
| Browser parsing | <5ms | Optimized CSS parses quickly |
| Gzip compressed | ~8-12KB | Transfer size over network |
| Class count (platform) | ~500-800 | Unique classes across all templates |

## Configuration

```javascript
// tailwind.config.js - Prismatic Platform configuration
module.exports = {
  darkMode: 'class',
  content: [
    './templates/**/*.html',
    '../apps/prismatic_web/lib/**/*.{ex,heex}',
    '../apps/prismatic_perimeter/lib/**/*.{ex,heex}',
    './static/js/**/*.js'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        prismatic: {
          50: '#f0fdfa',
          500: '#14b8a6',
          900: '#134e4a',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    }
  },
  plugins: [
    require('flowbite/plugin'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ]
}
```

The input CSS file imports Tailwind's base layers:

```css
/* static/css/tailwind-input.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-950 text-gray-100 antialiased;
  }
}
```

## Maintenance and Long-Term Benefits

The platform's exclusive commitment to TailwindCSS provides significant long-term maintenance advantages. Because all styling is expressed through utility classes directly in templates, there is no separate stylesheet codebase to maintain, no CSS specificity conflicts to debug, and no orphaned styles accumulating as components are removed. New developers can understand a component's visual design by reading its template alone, without cross-referencing external stylesheets.

This colocation of structure and style reduces the cognitive overhead of maintaining 90 applications with consistent visual presentation, and it ensures that the design system remains enforceable through automated template validation rather than relying on manual code review of CSS files. The JIT compiler's tree-shaking guarantees that unused experimental classes never reach production, giving developers freedom to iterate on designs without worrying about bundle size regression.

## Best Practices

- **Never write custom CSS** -- the platform enforces Tailwind-only styling; if a utility does not exist, use arbitrary values (`w-[137px]`) or extend the config
- **Rebuild after template changes** -- `npx tailwindcss -i static/css/tailwind-input.css -o static/css/tailwind.css --minify` must run after any template modification
- **Use semantic component patterns** -- extract repeated class combinations into Phoenix function components rather than duplicating long class strings
- **Prefer design tokens over arbitrary values** -- use configured colors (`text-teal-400`) instead of arbitrary hex values (`text-[#2dd4bf]`) for consistency
- **Test responsive layouts** -- use `sm:`, `md:`, `lg:` breakpoints to ensure dashboards work on tablets and desktop monitors
- **Avoid `dark:` variants** -- the platform forces dark mode globally; use direct dark-theme classes instead of conditional `dark:` prefixed variants
- **Use `transition-all` sparingly** -- transition only the properties that change (`transition-colors`, `transition-opacity`) for better performance

## Comparison with Alternatives

| Feature | TailwindCSS | Bootstrap | CSS Modules | styled-components | Vanilla CSS |
|---------|------------|-----------|-------------|-------------------|-------------|
| Approach | Utility-first | Component-first | Scoped modules | CSS-in-JS | Manual |
| Bundle size | ~30-50KB (JIT) | ~150KB | Varies | Runtime overhead | Varies |
| Dark mode | Built-in variant | Manual theme | Manual | Manual | Manual |
| Customization | Config-driven | Variable overrides | Full control | Full control | Full control |
| Learning curve | Medium | Low | Low | Medium | Low |
| Server rendering | No JS needed | No JS needed | Build step | Requires JS runtime | N/A |
| LiveView compatibility | Excellent | Good | Good | Poor (JS-dependent) | Excellent |
| Platform policy | Mandatory | Forbidden | Forbidden | Forbidden | Forbidden |

TailwindCSS was chosen because it provides excellent server-rendered compatibility (no JavaScript runtime required for styling), produces small production bundles through JIT compilation, and enables consistent design through configurable design tokens.

## Related Technologies

- [Flowbite](/technologies/flowbite/) - Component library built on Tailwind providing pre-built UI patterns
- [Alpine.js](/technologies/alpinejs/) - Reactive JavaScript companion for client-side interactivity
- [Phoenix LiveView](/technologies/phoenix-liveview/) - Server-rendered UI framework using Tailwind classes in HEEx templates
- [Phoenix Framework](/technologies/phoenix/) - Web framework whose templates consume Tailwind utilities

## Related Apps

- [prismatic_web](/apps/prismatic-web/) - All browser-facing interfaces styled with TailwindCSS
- [prismatic_perimeter](/apps/prismatic-perimeter/) - EASM dashboards with Tailwind-based security rating UI

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)