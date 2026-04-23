# Flowbite Component Reference for Promo Site

**Version**: Flowbite 2.3 + TailwindCSS 3.4
**Last Updated**: 2026-02-20
**Source**: https://flowbite.com/docs/getting-started/llm/

## MCP Server Integration (ACTIVE)

The Flowbite MCP server provides context-aware UI component generation directly in Claude Code.

**Status**: Configured and active via `claude mcp add flowbite -- npx -y flowbite-mcp`

**Capabilities**:
- UI component context for code generation
- Figma-to-code conversion (requires `FIGMA_ACCESS_TOKEN`)
- Theme file generation from brand colors

**Usage in prompts**:
- "use flowbite mcp to convert this figma <FIGMA_NODE_LINK> to code"
- "use flowbite mcp to generate a theme file using the [color] brand color"

**Policy**: `.aiad/policies/flowbite-mcp-integration.policy.md`

## LLM Reference Files

- **Main**: https://raw.githubusercontent.com/themesberg/flowbite/refs/heads/main/llms.txt
- **Full**: https://raw.githubusercontent.com/themesberg/flowbite/refs/heads/main/llms-full.txt
- **Local (standard)**: `.claude/flowbite/llms.txt` (133 lines)
- **Local (full)**: `.claude/flowbite/llms-full.txt` (40,692 lines)

## Sidebar Layout Pattern (ENFORCED)

### Grid-Based Sidebar (Used in Promo Site)

Our promo site uses a grid-based sidebar layout, NOT the Flowbite fixed sidebar.
The sidebar is the right column of a responsive grid.

**MANDATORY Pattern**:

```html
<!-- Main Content + Sidebar Grid -->
<section class="bg-gray-900 py-12 lg:py-16">
    <div class="max-w-screen-xl px-4 mx-auto">
        <div class="grid gap-8 lg:grid-cols-4">
            <!-- Main Content (3/4) -->
            <div class="lg:col-span-3">
                <!-- Content here -->
            </div>

            <!-- Right Sidebar (1/4) - MUST have hidden lg:block -->
            <div class="hidden lg:block space-y-6">
                <!-- Sidebar widgets here -->
            </div>
        </div>
    </div>
</section>
```

**Key Rules**:
1. Sidebar `<div>` MUST have `hidden lg:block` - prevents overlap on mobile/tablet
2. Grid container MUST use `lg:grid-cols-4` (not `md:grid-cols-4`)
3. Main content MUST use `lg:col-span-3`
4. Sidebar widgets use `space-y-6` for consistent spacing

### For 2/3 + 1/3 layouts (page templates):

```html
<div class="grid gap-8 lg:grid-cols-3">
    <!-- Main Content (2/3) -->
    <div class="lg:col-span-2">
        <!-- Content here -->
    </div>

    <!-- Sidebar (1/3) - MUST have hidden lg:block -->
    <div class="hidden lg:block space-y-6">
        <!-- Sidebar widgets here -->
    </div>
</div>
```

## Flowbite Fixed Sidebar Pattern (Reference Only)

For fixed navigation sidebars (NOT used in promo site, but available for platform):

```html
<!-- Mobile toggle button - only visible on small screens -->
<button data-drawer-target="sidebar" data-drawer-toggle="sidebar"
        aria-controls="sidebar" type="button"
        class="inline-flex items-center p-2 text-sm rounded-lg sm:hidden
               hover:bg-gray-700 focus:ring-2 focus:ring-gray-600">
    <span class="sr-only">Open sidebar</span>
    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path clip-rule="evenodd" fill-rule="evenodd"
              d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"/>
    </svg>
</button>

<!-- Fixed sidebar -->
<aside id="sidebar"
       class="fixed top-0 left-0 z-40 w-64 h-full transition-transform
              -translate-x-full sm:translate-x-0"
       aria-label="Sidebar">
    <div class="h-full px-3 py-4 overflow-y-auto bg-gray-800 border-r border-gray-700">
        <ul class="space-y-2 font-medium">
            <!-- Menu items -->
        </ul>
    </div>
</aside>

<!-- Main content shifted right on desktop -->
<div class="sm:ml-64">
    <!-- Page content -->
</div>
```

## Drawer Component Pattern (Off-Canvas Navigation)

```html
<!-- Trigger button -->
<button data-drawer-target="drawer-nav" data-drawer-show="drawer-nav"
        aria-controls="drawer-nav" type="button"
        class="text-white bg-indigo-600 hover:bg-indigo-700 font-medium
               rounded-lg text-sm px-4 py-2.5">
    Show navigation
</button>

<!-- Off-canvas drawer -->
<div id="drawer-nav"
     class="fixed top-0 left-0 z-40 h-screen p-4 overflow-y-auto
            transition-transform -translate-x-full bg-gray-800 w-80
            border-r border-gray-700"
     tabindex="-1" aria-labelledby="drawer-nav-label">

    <!-- Header with close button -->
    <div class="border-b border-gray-700 pb-4 flex items-center">
        <span class="text-lg font-semibold text-white">Navigation</span>
        <button data-drawer-hide="drawer-nav" aria-controls="drawer-nav"
                class="text-gray-400 hover:text-white hover:bg-gray-700
                       rounded-lg w-9 h-9 absolute top-2.5 end-2.5
                       flex items-center justify-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"/>
            </svg>
            <span class="sr-only">Close menu</span>
        </button>
    </div>

    <!-- Navigation items -->
    <div class="py-5 overflow-y-auto">
        <ul class="space-y-2 font-medium">
            <!-- Items -->
        </ul>
    </div>
</div>
```

## Sidebar Widget Patterns (Promo Site)

### Collapsible Section Card

```html
<div x-data="{ expanded: true }"
     class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
    <button @click="expanded = !expanded"
            class="w-full flex items-center justify-between p-4 text-left
                   hover:bg-gray-750 transition-colors">
        <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor"
                 viewBox="0 0 24 24">
                <!-- Icon path -->
            </svg>
            <span class="font-semibold text-white text-sm">Section Title</span>
        </div>
        <svg class="w-4 h-4 text-gray-400 transition-transform"
             :class="{'rotate-180': !expanded}"
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 9l-7 7-7-7"/>
        </svg>
    </button>
    <div x-show="expanded" x-transition class="px-4 pb-4 space-y-2">
        <!-- Content -->
    </div>
</div>
```

### Animated Info Card

```html
<div class="p-6 bg-gray-800 rounded-xl border border-gray-700"
     x-data="{ shown: false }"
     x-init="setTimeout(() => shown = true, 200)"
     x-show="shown"
     x-transition:enter="transition ease-out duration-500"
     x-transition:enter-start="opacity-0 translate-y-4"
     x-transition:enter-end="opacity-100 translate-y-0">
    <!-- Content -->
</div>
```

## Dark Mode Classes (ENFORCED)

The promo site is ALWAYS dark mode (`class="dark"` on `<html>`).
Use direct dark classes, NOT `dark:` prefixed conditionals.

| Use This | NOT This |
|----------|----------|
| `bg-gray-900` | `dark:bg-gray-900` |
| `bg-gray-800` | `dark:bg-gray-800` |
| `text-white` | `dark:text-white` |
| `text-gray-400` | `dark:text-gray-400` |
| `border-gray-700` | `dark:border-gray-700` |

## Responsive Breakpoints

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| `sm:` | 640px | Mobile landscape |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Desktop - **sidebar visibility** |
| `xl:` | 1280px | Large desktop |
| `2xl:` | 1536px | Extra large |

## Component Reference Links

- [Sidebar](https://flowbite.com/docs/components/sidebar/)
- [Drawer](https://flowbite.com/docs/components/drawer/)
- [Navbar](https://flowbite.com/docs/components/navbar/)
- [Card](https://flowbite.com/docs/components/card/)
- [Accordion](https://flowbite.com/docs/components/accordion/)
- [Tabs](https://flowbite.com/docs/components/tabs/)
- [Modal](https://flowbite.com/docs/components/modal/)
- [Dropdown](https://flowbite.com/docs/components/dropdowns/)
- [Badge](https://flowbite.com/docs/components/badge/)
- [Breadcrumb](https://flowbite.com/docs/components/breadcrumb/)
- [Pagination](https://flowbite.com/docs/components/pagination/)
- [Progress](https://flowbite.com/docs/components/progress/)
- [Typography](https://flowbite.com/docs/components/typography/)
- [Dark Mode](https://flowbite.com/docs/customize/dark-mode/)
