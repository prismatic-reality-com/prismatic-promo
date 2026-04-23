+++
title = "/ui-enhance"
weight = 160
[extra]
category = "Development"
description = "UI/UX enhancement with TailwindCSS and Flowbite"
syntax = "/ui-enhance [options]"
authority = "L2+"
agent = "ui-enhance-specialist"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1095
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ui-enhance", "UIUX", "TailwindCSS", "Flowbite", "commands", "Development", "Prismatic Platform", "Phase"]
tags = ["commands", "development", "ui-enhance", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/ui-enhance - Prismatic Platform"
+++

## Overview

**/ui-enhance** is a production command in the **Development** category of the Prismatic Platform. It improves the visual quality, usability, and accessibility of existing UI components, pages, and layouts using [TailwindCSS](@/glossary/tailwindcss.md) utilities and [Flowbite](@/glossary/flowbite.md) component patterns. While [/svihadlo](@/commands/svihadlo.md) creates new visible features from scratch, `/ui-enhance` focuses on refining and improving existing interfaces: modernizing layouts, improving responsive behavior, enhancing color schemes, fixing alignment issues, adding loading states, improving error presentations, and bringing pages up to the platform's design standards.

This command operates under the **L2+** authority level and is executed by the `ui-enhance-specialist` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The ui-enhance-specialist agent has deep expertise in TailwindCSS utility composition, Flowbite component library patterns, responsive design breakpoints, dark mode implementation, and Phoenix LiveView component architecture.

The platform enforces a strict design mandate: all styling must use TailwindCSS utilities exclusively. Custom CSS is forbidden. This constraint means UI enhancement is entirely a matter of TailwindCSS class composition and Flowbite pattern application. `/ui-enhance` ensures this constraint is maintained while improving visual quality: it never introduces custom CSS, never adds inline styles, and always produces output that conforms to the platform's design system documentation.

## Architecture

The UI enhancement system operates as an analysis-and-transform pipeline.

### Enhancement Architecture

```
             /ui-enhance
                  |
           UI Analyzer
                  |
          +-------+-------+
          |       |       |
       Visual   Access   Responsive
       Audit    Audit    Audit
          |       |       |
          +-------+-------+
                  |
          Enhancement Planner
                  |
          +-------+-------+-------+
          |       |       |       |
       Layout  Color    Component  Interaction
       Fixes   Updates  Upgrades   Improvements
          |       |       |       |
          +-------+-------+-------+
                  |
          Code Transformer
                  |
          +-------+-------+
          |       |       |
       Template  Test     Route
       Update    Update   Verify
```

### Enhancement Categories

| Category | Focus | Common Improvements |
|----------|-------|---------------------|
| **Layout** | Spacing, alignment, grid | Fix padding inconsistencies, improve grid layouts, add proper gap spacing |
| **Typography** | Text hierarchy, readability | Consistent heading sizes, proper line heights, responsive font scaling |
| **Color & Theme** | Color consistency, dark mode | Fix contrast ratios, consistent color palette, proper dark mode support |
| **Components** | Flowbite patterns | Upgrade to standard Flowbite patterns, add missing states |
| **Responsive** | Mobile/tablet adaptation | Add breakpoint variants, fix overflow, improve touch targets |
| **Accessibility** | WCAG compliance | Add aria labels, improve focus indicators, fix contrast |
| **Loading States** | Skeleton screens, spinners | Add loading indicators, skeleton placeholders, progress bars |
| **Error States** | Error presentation | Improve error messages, add error boundaries, friendly error pages |

### Design System Constraints (ENFORCED)

| Constraint | Rule | Violation Response |
|-----------|------|-------------------|
| **No Custom CSS** | All styling via TailwindCSS utilities only | REJECTED -- rewrite with Tailwind |
| **No Inline Styles** | No `style=""` attributes allowed | REJECTED -- convert to classes |
| **Flowbite Components** | Use Flowbite patterns for standard UI | WARNING -- suggest Flowbite equivalent |
| **Dark Mode Required** | All components must support dark mode | BLOCKED until dark mode added |
| **Responsive Required** | All layouts must work on mobile | BLOCKED until responsive variants added |

## Usage

```bash
# Enhance specific page
/ui-enhance /perimeter

# Enhance specific component
/ui-enhance --component PrismaticWeb.Components.SecurityBadge

# Fix layout issues on a page
/ui-enhance /perimeter/assets --focus layout

# Improve color consistency
/ui-enhance --focus color --app prismatic_web

# Add dark mode support
/ui-enhance --focus dark-mode /perimeter/compliance

# Improve accessibility
/ui-enhance --focus accessibility /perimeter

# Enhance responsive behavior
/ui-enhance --focus responsive /perimeter/easm

# Full enhancement audit
/ui-enhance --audit --app prismatic_web

# Dry run showing planned enhancements
/ui-enhance --dry-run /perimeter

# Export enhancement report
/ui-enhance --audit --format json --export ./ui-report.json
```

### Practical Examples

```bash
# Complete visual overhaul of perimeter dashboard
/ui-enhance /perimeter --focus "layout,color,components" --verbose

# Fix specific accessibility issues
/ui-enhance /perimeter/assets --focus accessibility --wcag-level AA

# Add loading states to all data-fetching pages
/ui-enhance --app prismatic_web --focus loading-states --verbose

# Upgrade all tables to Flowbite table pattern
/ui-enhance --app prismatic_web --component-type table --upgrade-to-flowbite

# Responsive audit and fix for all pages
/ui-enhance --audit --focus responsive --format markdown --export ./responsive-report.md
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--focus` | `string` | all | Enhancement focus: `layout`, `color`, `components`, `responsive`, `accessibility`, `loading-states`, `error-states`, `dark-mode`, `all` |
| `--app` | `string` | `prismatic_web` | Target Phoenix application |
| `--component` | `string` | none | Specific component module to enhance |
| `--component-type` | `string` | none | Component type to bulk-enhance: `table`, `form`, `card`, `badge`, `modal` |
| `--audit` | `flag` | false | Run enhancement audit without making changes |
| `--upgrade-to-flowbite` | `flag` | false | Upgrade matching components to Flowbite patterns |
| `--wcag-level` | `enum` | `AA` | WCAG compliance target: `A`, `AA`, `AAA` |
| `--verbose` | `flag` | false | Show detailed enhancement descriptions |
| `--dry-run` | `flag` | false | Show planned changes without applying |
| `--format` | `enum` | `text` | Output format: `text`, `json`, `markdown` |
| `--export` | `path` | none | Export audit report |
| `--before-after` | `flag` | false | Show before/after comparison for each change |

## Execution Flow

### Phase 1: UI Audit

The UI analyzer inspects the target page or component. Visual audit checks layout consistency, spacing, color usage, and component patterns. Accessibility audit checks ARIA attributes, focus management, color contrast, and keyboard navigation. Responsive audit checks breakpoint behavior, overflow handling, and touch target sizes.

### Phase 2: Enhancement Planning

Based on the audit results and focus options, the enhancement planner prioritizes improvements. Critical issues (broken layouts, missing accessibility) are addressed first. Cosmetic improvements (color refinement, spacing polish) are secondary. Each planned enhancement includes the specific TailwindCSS class changes required.

### Phase 3: Code Transformation

Template files (HEEx) are modified with updated TailwindCSS classes. The transformer operates at the HTML attribute level, adding, removing, or replacing class strings. It never modifies template logic (assigns, conditionals, loops) -- only styling classes. Component modules are updated if structural changes are needed (adding slots, changing assigns).

### Phase 4: Validation

Enhanced templates are validated: compilation check (HEEx parsing), Flowbite pattern compliance, TailwindCSS class validity (no classes outside the configured theme), responsive coverage (all breakpoints tested), and dark mode coverage (all elements have dark variants).

### Phase 5: Verification

Routes serving enhanced pages are tested via [/route-test](@/commands/route-test.md) to verify they still render correctly. Visual regression detection compares the enhanced output against the previous version to identify unintended changes.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/svihadlo](@/commands/svihadlo.md) | Peer | New features; ui-enhance refines existing |
| [/code](@/commands/code.md) | Peer | General coding for non-UI work |
| [/route-test](@/commands/route-test.md) | Validation | Route verification after enhancements |
| [/quality-gates](@/commands/quality-gates.md) | Enforcement | Enhanced code passes quality gates |
| [TailwindCSS](@/glossary/tailwindcss.md) | Design System | Exclusive styling system |
| [Flowbite](@/glossary/flowbite.md) | Component Library | Standard component patterns |
| [Telemetry](@/glossary/telemetry.md) | Monitoring | Enhancement execution metrics |
| Page Load Performance | Constraint | Enhancements must not degrade load time |

## Best Practices

### Enhancement Before Feature Addition

Run `/ui-enhance --audit` on a page before adding new features to it. Starting from a clean, well-structured page produces better feature integration than adding features to a page with existing visual debt.

### Focus-Based Iteration

Enhance one focus area at a time rather than applying all improvements simultaneously. A layout-focused pass followed by a color-focused pass produces better results than attempting everything at once, because each pass can be validated independently.

### Accessibility First

When time is limited, prioritize accessibility enhancements (`--focus accessibility`). Accessibility improvements benefit all users (screen readers, keyboard navigation, high contrast) and are often required for compliance with NIS2 and WCAG standards.

### Dark Mode Consistency

Every enhancement must maintain dark mode support. The platform uses forced dark mode (`class="dark"` on `<html>`). All TailwindCSS classes must include appropriate dark variants. Use `/ui-enhance --focus dark-mode` periodically to catch pages that have drifted.

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `TEMPLATE_PARSE_ERROR` | Cannot parse HEEx template | Check template for syntax errors |
| `CLASS_CONFLICT` | Conflicting TailwindCSS classes | Remove redundant classes |
| `CUSTOM_CSS_DETECTED` | Custom CSS found in template | Convert to TailwindCSS utilities |
| `INLINE_STYLE_DETECTED` | Inline style attribute found | Convert to TailwindCSS classes |
| `CONTRAST_RATIO_FAIL` | Color contrast below WCAG threshold | Adjust foreground/background colors |
| `RESPONSIVE_OVERFLOW` | Content overflows viewport at breakpoint | Add responsive width constraints |
| `ROUTE_RENDER_FAILURE` | Enhanced page fails to render | Rollback enhancement; investigate |

## Advanced Usage

### Design System Compliance Report

Generate a comprehensive compliance report:

```bash
/ui-enhance --audit --app prismatic_web --format markdown --export ./design-compliance.md
```

### Bulk Component Upgrade

Upgrade all instances of a component pattern:

```bash
/ui-enhance --upgrade-to-flowbite --component-type card --app prismatic_web --dry-run
```

### Visual Regression Testing

Compare before and after screenshots:

```bash
/ui-enhance /perimeter --before-after --export ./visual-diff/
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. No custom CSS, no inline styles, no accessibility regressions. Every enhancement must improve or maintain the design standard.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every enhancement is based on audit findings, not aesthetic preference. Changes are validated through compilation, route testing, and visual verification.

## Related Commands

- [/svihadlo](@/commands/svihadlo.md) - Ultra-fast visible feature implementation in 5-15 minutes
- [/code](@/commands/code.md) - Core coding implementation and feature development
- [/test](@/commands/test.md) - Comprehensive test generation and verification
- [/route-test](@/commands/route-test.md) - Route testing and HTTP endpoint verification
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)