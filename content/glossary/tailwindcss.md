+++
title = "TailwindCSS"
weight = 8
[extra]
category = "architecture"
description = "Utility-first CSS framework, mandatory for all platform UI components"
related_terms = ["flowbite", "phoenix-liveview", "liveview", "phoenix", "clean-run", "docker"]
author = "Tomas Korcak (korczis)"
reading_time = "2 min"
word_count = 425
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["TailwindCSS", "Utility-first", "glossary", "architecture", "Prismatic Platform", "HTML"]
tags = ["glossary", "architecture", "tailwindcss", "prismatic"]
quality_score = 67
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "TailwindCSS - Prismatic Platform"
+++

## Definition

TailwindCSS is a utility-first CSS framework that fundamentally changes how developers approach styling by providing a comprehensive set of low-level, single-purpose utility classes that are composed directly in HTML markup to build custom designs. Rather than writing semantic CSS class names like `.card-header` or `.navigation-menu` and then defining their styles in separate stylesheet files, TailwindCSS developers apply atomic utilities like `flex`, `pt-4`, `text-center`, `rounded-lg`, and `bg-gray-900` directly to elements, constructing any design without ever leaving the HTML template.

This approach eliminates several categories of problems that plague traditional CSS development: specificity conflicts (where multiple rules compete to style the same element), dead CSS accumulation (where unused styles bloat production bundles), naming debates (where teams spend time arguing over BEM, SMACSS, or other naming conventions), and context switching (where developers constantly jump between template and stylesheet files). The utility-first philosophy treats CSS as a design API rather than a separate programming concern, and the resulting markup is self-documenting---any developer can look at a component's HTML and immediately understand its visual presentation without tracing through cascading stylesheets.

TailwindCSS uses a JIT (Just-In-Time) compiler that scans all configured template files (HTML, JSX, Elixir HEEx, ERB, or any other format) at build time, identifies which utility classes are actually used, and generates a minimal CSS bundle containing only those classes. This means a production build typically produces a CSS file of 10-30KB (gzip-compressed), regardless of how many utility classes TailwindCSS offers in total. The JIT compiler also enables arbitrary value support (e.g., `w-[137px]`, `bg-[#1da1f2]`), making the framework infinitely flexible without custom configuration.

## Utility-First Philosophy

The utility-first approach represents a paradigm shift from component-based CSS frameworks like Bootstrap or Material UI:

| Approach | Example | Pros | Cons |
|----------|---------|------|------|
| **Semantic CSS** | `.btn-primary { ... }` | Clean HTML, reusable names | Naming fatigue, specificity wars |
| **CSS Modules** | `.Button_primary__3Kx2` | Scoped, no conflicts | Build complexity, no sharing |
| **CSS-in-JS** | `styled.button\`...\`` | Dynamic, scoped | Runtime cost, bundle size |
| **Utility-First** | `class="bg-blue-600 px-4 py-2 rounded"` | No naming, no dead CSS | Verbose markup |

```html
<!-- Traditional CSS approach -->
<button class="btn-primary">Submit</button>
<!-- Requires: .btn-primary { background: blue; padding: 0.5rem 1rem; border-radius: 0.25rem; } -->

<!-- TailwindCSS utility-first approach -->
<button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
  Submit
</button>
<!-- No separate CSS file needed -->
```

When patterns repeat across multiple components, TailwindCSS provides two extraction mechanisms:

1. **Component extraction**: Create reusable [LiveView](/glossary/liveview/) function components that encapsulate utility classes
2. **@apply directive**: Extract utility combinations into named CSS classes (used sparingly, as it defeats the utility-first advantage)

## Responsive Design System

TailwindCSS implements a mobile-first responsive design system through breakpoint prefix modifiers that apply styles conditionally based on viewport width:

| Prefix | Min Width | CSS Media Query | Common Use |
|--------|-----------|-----------------|------------|
| (none) | 0px | Default (mobile) | Base styles |
| `sm:` | 640px | `@media (min-width: 640px)` | Small tablets |
| `md:` | 768px | `@media (min-width: 768px)` | Tablets, small laptops |
| `lg:` | 1024px | `@media (min-width: 1024px)` | Laptops, desktops |
| `xl:` | 1280px | `@media (min-width: 1280px)` | Large desktops |
| `2xl:` | 1536px | `@media (min-width: 1536px)` | Extra-large screens |

```html
<!-- Responsive grid: 1 column on mobile, 2 on tablet, 3 on desktop -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  <div class="bg-gray-800 rounded-lg p-6">
    <h3 class="text-lg sm:text-xl font-semibold text-white">Asset Card</h3>
    <p class="mt-2 text-sm text-gray-400">Security rating: A</p>
  </div>
</div>
```

The mobile-first approach means that unprefixed utilities target all screen sizes, and breakpoint prefixes progressively enhance the layout for larger viewports. This produces more maintainable code because the base mobile layout is defined first, and larger screens add complexity incrementally.

## Dark Mode

TailwindCSS provides built-in dark mode support through the `dark:` prefix variant, with two activation strategies:

| Strategy | Configuration | Activation | Use Case |
|----------|---------------|------------|----------|
| **Class-based** | `darkMode: 'class'` | `class="dark"` on `<html>` | Manual toggle, SSR |
| **Media-based** | `darkMode: 'media'` | `prefers-color-scheme: dark` | OS preference |

```html
<!-- Dark mode styling (class strategy) -->
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  <h2 class="text-xl font-bold">Security Dashboard</h2>
  <p class="text-gray-600 dark:text-gray-400">Current threat level: Low</p>
</div>
```

The Prismatic Platform uses the class-based strategy with a forced-dark theme---the `<html>` element always has `class="dark"` applied, and all UI is designed exclusively for dark mode. This eliminates the need for `dark:` conditional prefixes on the promo site frontpage, where direct dark classes (`bg-gray-950`, `text-white`, `text-gray-400`) are used instead.

## JIT Compilation and Build Process

The JIT compiler is the engine that makes TailwindCSS practical for production use. It operates in three phases:

1. **Content scanning**: Parse all configured template files to extract class names
2. **CSS generation**: Generate only the CSS for classes that actually appear in templates
3. **Optimization**: Apply PostCSS plugins (autoprefixer, cssnano) for cross-browser compatibility and minification

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./templates/**/*.html",
    "./templates/**/*.html.heex",
    "../lib/*_web/**/*.*ex",
    "../lib/*_web/**/*.html.heex",
    "../deps/flowbite/**/*.js"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        prismatic: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        }
      }
    }
  },
  plugins: [
    require('flowbite/plugin')
  ]
}
```

The `content` configuration is critical: any class name that does not appear in a scanned file will be excluded from the generated CSS. This is why dynamically constructed class names (e.g., `bg-${color}-500`) do not work---the JIT compiler performs static analysis and cannot resolve runtime expressions. Instead, use complete class strings with conditional logic.

## Configuration and Customization

TailwindCSS's default design system is fully customizable through `tailwind.config.js`:

| Configuration Area | Purpose | Example |
|-------------------|---------|---------|
| **theme.colors** | Color palette | Custom brand colors |
| **theme.spacing** | Spacing scale | Additional spacing values |
| **theme.fontFamily** | Typography | Custom font stacks |
| **theme.extend** | Additive customization | Extend without overriding defaults |
| **plugins** | Feature extensions | [Flowbite](/glossary/flowbite/), typography, forms |
| **content** | Template file paths | Files to scan for class usage |

TailwindCSS ships with a carefully crafted default design system that includes:

- A 22-shade color palette across 22 color families (50-950 shades per color)
- A spacing scale from 0 to 96 (0px to 24rem) in consistent increments
- A type scale with 10 font sizes from `xs` to `9xl`
- 7 font weights from `thin` (100) to `black` (900)
- 6 border radius values from `rounded-sm` to `rounded-full`
- Shadow, opacity, and transition utilities with sensible defaults

## Context in Prismatic

Within the Prismatic Platform, TailwindCSS is the mandatory and exclusive styling approach enforced by platform policy. This is a hard requirement with zero exceptions---inline styles and custom CSS files are explicitly forbidden across all applications.

**Enforcement Scope**: All UI across [LiveView](/glossary/liveview/) dashboards, the [Perimeter EASM](/glossary/easm/) interface, administrative panels, and the public promo site must use TailwindCSS utilities combined with [Flowbite](/glossary/flowbite/) 2.3 components. This mandate ensures visual consistency across 89 umbrella applications and eliminates CSS specificity conflicts.

**Build Integration**: TailwindCSS is integrated into [Phoenix](/glossary/phoenix/)'s asset pipeline through esbuild configuration. The JIT compiler watches template files during development and generates optimized CSS for production releases. [Docker](/glossary/docker/) container builds include a TailwindCSS compilation step as part of the multi-stage build process.

**Promo Site Rebuild Requirement**: The promo site at `sites/promo/` requires explicit TailwindCSS rebuilds after any template changes:

```bash
cd sites/promo
npx tailwindcss -i static/css/tailwind-input.css -o static/css/tailwind.css --minify
```

Failure to rebuild after template changes causes newly used classes to be absent from the generated CSS, resulting in invisible text or broken layouts. This is a known operational requirement documented in the platform's deployment procedures.

**Platform UI Stack**:

| Layer | Technology | Role |
|-------|-----------|------|
| **Styling** | TailwindCSS 3.4 | Utility classes for all visual presentation |
| **Components** | [Flowbite](/glossary/flowbite/) 2.3 | Pre-built accessible UI components |
| **Interactivity** | Alpine.js 3.13.5 | Client-side behavior (dropdowns, modals) |
| **Rendering** | [Phoenix LiveView](/glossary/liveview/) | Server-rendered reactive UI |
| **Theme** | Forced dark mode | `class="dark"` on `<html>`, no toggle |

## TailwindCSS Anti-Patterns

| Anti-Pattern | Problem | Correct Approach |
|-------------|---------|-----------------|
| Dynamic class construction | `bg-${color}-500` not scanned by JIT | Use complete strings: `bg-red-500`, `bg-blue-500` |
| Inline styles | Bypasses design system, no responsive | Use TailwindCSS utilities exclusively |
| Custom CSS files | Specificity conflicts, maintenance burden | Extract to components or use `@apply` sparingly |
| `!important` overrides | Breaks utility predictability | Use proper specificity ordering |
| Unused `@apply` extraction | Defeats utility-first benefits | Extract only when truly repeated 3+ times |

## Related Terms

- [Flowbite](/glossary/flowbite/) - TailwindCSS component library providing pre-built UI elements
- [LiveView](/glossary/liveview/) - Server-side rendering framework consuming TailwindCSS for reactive UI
- [Phoenix](/glossary/phoenix/) - Web framework integrating TailwindCSS via asset pipeline
- [Clean Run](/glossary/clean-run/) - Quality standard extending to UI code consistency
- [Docker](/glossary/docker/) - Container builds that include TailwindCSS compilation step
- [EASM](/glossary/easm/) - Perimeter dashboard built entirely with TailwindCSS utilities
- [Plug](/glossary/plug/) - Middleware serving compiled TailwindCSS assets
- [Metrics](/glossary/metrics/) - Dashboard visualizations styled with TailwindCSS
- [Observability](/glossary/observability/) - Monitoring UI built with TailwindCSS components

## See Also

- [Architecture](/architecture/) - Platform UI architecture and component strategy
- [Technologies](/technologies/) - Technology stack details
- [Apps](/apps/) - Applications using TailwindCSS for their interfaces

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)