+++
title = "UI Components"
description = "Comprehensive architecture for building reusable, accessible, and type-safe user interface components using Phoenix LiveView, HEEx templates, CoreComponents, Flowbite, and TailwindCSS within the Prismatic Platform."
weight = 42

[extra]
category = "frontend"
tags = ["ui-components", "liveview", "phoenix", "flowbite", "tailwindcss", "heex", "core-components", "accessibility", "design-system", "wcag", "dark-mode", "responsive"]
related_terms = ["phoenix-liveview", "flowbite", "tailwindcss", "phoenix-framework", "plug", "telemetry", "genserver", "otp", "pattern-matching", "behaviour", "typespec", "testing"]
keywords = ["Phoenix LiveView components", "HEEx template components", "Flowbite Elixir integration", "CoreComponents Phoenix", "TailwindCSS component design", "accessible UI Elixir", "LiveView function components", "Phoenix component architecture", "design system Elixir", "reusable UI patterns"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "25 min"
difficulty = "intermediate"
quality_score = 95
date_created = "2026-02-22"
date_updated = "2026-02-22"
version = "2.0.0"
learning_outcomes = ["Understand Phoenix LiveView component architecture", "Build reusable function components with slots and attributes", "Integrate Flowbite and TailwindCSS into component design", "Implement CoreComponents patterns for platform-wide consistency", "Apply accessibility standards to all UI elements", "Use telemetry for component performance monitoring"]
prerequisites = ["phoenix-liveview", "tailwindcss", "flowbite", "pattern-matching", "typespec"]
see_also = ["phoenix-framework", "plug", "telemetry", "testing", "quality-gates"]
key_technologies = ["Phoenix LiveView", "HEEx", "TailwindCSS 3.4", "Flowbite 2.3", "Alpine.js", "Phoenix.LiveView.JS"]
use_cases = ["Building platform dashboards", "Creating OSINT tool interfaces", "Rendering security rating displays", "Constructing navigation systems", "Implementing data table components"]
complexity = "intermediate"
acronyms = ["WCAG = Web Content Accessibility Guidelines", "ARIA = Accessible Rich Internet Applications", "DOM = Document Object Model", "CSS = Cascading Style Sheets"]
word_count = 3200
date_modified = "2026-02-23"
image = "/images/sections/glossary.png"
image_alt = "UI Components - Prismatic Platform"
+++

## Definition and Overview

UI Components in the Prismatic Platform are self-contained, reusable building blocks for constructing user interfaces. Built on [Phoenix LiveView](@/glossary/phoenix-liveview.md)'s component system, they combine HEEx templates, [TailwindCSS](@/glossary/tailwindcss.md) utility classes, and [Flowbite](@/glossary/flowbite.md) design patterns into a cohesive architecture that enforces type safety, accessibility, and visual consistency across every page in the platform. The component model spans three layers: function components (stateless, pure rendering), live components (stateful, process-backed), and CoreComponents (platform-wide shared primitives).

The Prismatic Platform enforces a TailwindCSS-first policy for all UI work. Inline styles are forbidden. Custom CSS is forbidden. Every visual property is expressed through Tailwind utility classes, ensuring that the design system remains auditable, consistent, and maintainable across 115 umbrella applications. Flowbite provides the interaction patterns (modals, dropdowns, accordions, sidebars) while TailwindCSS provides the visual vocabulary. Phoenix LiveView provides the rendering engine and real-time update mechanism.

This architecture reflects a deliberate choice: UI components in the Prismatic Platform are not thin wrappers around HTML. They are typed, documented, testable units of UI logic that participate in the same quality infrastructure as backend code. Every component has [typespecs](@/glossary/typespec.md), every component is verified by [Credo](@/glossary/credo.md) and [Dialyzer](@/glossary/dialyzer.md), and every component must pass the platform's [quality gates](@/glossary/quality-gates.md) before deployment. The goal is to treat the UI layer with the same rigor applied to OTP supervision trees and database schemas.

## Component Architecture Layers

### Function Components (Stateless)

Function components are the primary building block. They are pure functions that accept attributes and slots, returning HEEx markup. They hold no state, spawn no processes, and have no side effects. This purity makes them trivially testable and infinitely composable.

```elixir
defmodule PrismaticWeb.Components.Badge do
  @moduledoc """
  Badge component for status indicators, counts, and labels.
  Supports five variants (info, success, warning, danger, neutral)
  and three sizes (sm, md, lg).

  ## Examples

      <.badge variant={:success}>Active</.badge>
      <.badge variant={:danger} size={:lg}>Critical</.badge>
  """

  use Phoenix.Component

  @type variant :: :info | :success | :warning | :danger | :neutral
  @type size :: :sm | :md | :lg

  attr :variant, :atom, default: :info, values: [:info, :success, :warning, :danger, :neutral]
  attr :size, :atom, default: :md, values: [:sm, :md, :lg]
  attr :class, :string, default: nil
  attr :rest, :global

  slot :inner_block, required: true

  @spec badge(map()) :: Phoenix.LiveView.Rendered.t()
  def badge(assigns) do
    ~H"""
    <span
      class={[
        "inline-flex items-center font-medium rounded-full",
        variant_classes(@variant),
        size_classes(@size),
        @class
      ]}
      {@rest}
    >
      <%= render_slot(@inner_block) %>
    </span>
    """
  end

  @spec variant_classes(variant()) :: String.t()
  defp variant_classes(:info), do: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
  defp variant_classes(:success), do: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
  defp variant_classes(:warning), do: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
  defp variant_classes(:danger), do: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
  defp variant_classes(:neutral), do: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"

  @spec size_classes(size()) :: String.t()
  defp size_classes(:sm), do: "text-xs px-2 py-0.5"
  defp size_classes(:md), do: "text-sm px-2.5 py-0.5"
  defp size_classes(:lg), do: "text-base px-3 py-1"
end
```

Key properties of function components:

- **Typed attributes**: `attr` declarations provide compile-time validation of component inputs
- **Slots**: Named slots enable content projection without prop drilling
- **Pattern matching**: Elixir's [pattern matching](@/glossary/pattern-matching.md) powers variant dispatch, eliminating conditional chains
- **Global attributes**: The `:global` rest attribute forwards arbitrary HTML attributes, supporting accessibility attrs like `aria-label`

### Live Components (Stateful)

Live components maintain their own state and handle events independently from the parent LiveView. They are backed by a process (the parent LiveView's process) and participate in the LiveView lifecycle. Use live components when a piece of UI needs to manage its own state transitions, handle its own events, or update independently of the rest of the page.

```elixir
defmodule PrismaticWeb.Live.SearchFilterComponent do
  @moduledoc """
  Stateful search filter component with debounced input, tag selection,
  and real-time result preview. Manages its own filter state independently
  from the parent LiveView.
  """

  use PrismaticWeb, :live_component

  @impl Phoenix.LiveComponent
  @spec mount(Phoenix.LiveView.Socket.t()) :: {:ok, Phoenix.LiveView.Socket.t()}
  def mount(socket) do
    {:ok,
     assign(socket,
       query: "",
       selected_tags: MapSet.new(),
       suggestions: [],
       debounce_ref: nil
     )}
  end

  @impl Phoenix.LiveComponent
  @spec update(map(), Phoenix.LiveView.Socket.t()) :: {:ok, Phoenix.LiveView.Socket.t()}
  def update(assigns, socket) do
    {:ok,
     socket
     |> assign(:available_tags, assigns.available_tags)
     |> assign(:on_filter_change, assigns.on_filter_change)}
  end

  @impl Phoenix.LiveComponent
  def handle_event("search", %{"query" => query}, socket) do
    if socket.assigns.debounce_ref, do: Process.cancel_timer(socket.assigns.debounce_ref)

    ref = Process.send_after(self(), {:debounced_search, query, socket.assigns.id}, 300)

    {:noreply, assign(socket, query: query, debounce_ref: ref)}
  end

  def handle_event("toggle_tag", %{"tag" => tag}, socket) do
    updated_tags =
      if MapSet.member?(socket.assigns.selected_tags, tag) do
        MapSet.delete(socket.assigns.selected_tags, tag)
      else
        MapSet.put(socket.assigns.selected_tags, tag)
      end

    notify_parent(socket, updated_tags, socket.assigns.query)
    {:noreply, assign(socket, selected_tags: updated_tags)}
  end

  defp notify_parent(socket, tags, query) do
    send(self(), {socket.assigns.on_filter_change, %{tags: tags, query: query}})
  end
end
```

### CoreComponents (Platform Primitives)

CoreComponents is a single module that defines the shared UI vocabulary for the entire platform. Every Prismatic web page uses CoreComponents for buttons, forms, modals, tables, flash messages, and navigation elements. This centralization ensures visual consistency and enables platform-wide UI updates through a single module change.

```elixir
defmodule PrismaticWeb.CoreComponents do
  @moduledoc """
  Platform-wide shared UI components.

  Provides the foundational component library used across all LiveView pages
  in the Prismatic Platform. Every component follows Flowbite design patterns
  with TailwindCSS utility classes exclusively.

  ## Component Categories

  - **Layout**: modal/1, header/1, sidebar/1, drawer/1
  - **Navigation**: navbar/1, breadcrumb/1, tabs/1, pagination/1
  - **Forms**: input/1, button/1, select/1, checkbox/1, radio/1
  - **Data Display**: table/1, list/1, card/1, badge/1, stat/1
  - **Feedback**: flash/1, alert/1, progress/1, spinner/1, tooltip/1
  """

  use Phoenix.Component

  alias Phoenix.LiveView.JS

  @doc """
  Renders a modal dialog with Flowbite styling.

  ## Attributes
  - `id` - Required unique identifier for the modal
  - `show` - Whether the modal is visible (default: false)
  - `on_cancel` - JS command to run on cancel (default: hide modal)

  ## Slots
  - `:inner_block` - Modal body content

  ## Examples

      <.modal id="confirm-delete" show={@show_modal}>
        <p>Are you sure you want to delete this item?</p>
        <.button phx-click="delete">Confirm</.button>
      </.modal>
  """
  attr :id, :string, required: true
  attr :show, :boolean, default: false
  attr :on_cancel, JS, default: %JS{}

  slot :inner_block, required: true

  @spec modal(map()) :: Phoenix.LiveView.Rendered.t()
  def modal(assigns) do
    ~H"""
    <div
      id={@id}
      phx-mounted={@show && show_modal(@id)}
      phx-remove={hide_modal(@id)}
      data-cancel={JS.exec(@on_cancel, "phx-remove")}
      class="relative z-50 hidden"
    >
      <div
        id={"#{@id}-bg"}
        class="bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 transition-opacity"
        aria-hidden="true"
      />
      <div
        class="fixed inset-0 overflow-y-auto"
        aria-labelledby={"#{@id}-title"}
        aria-describedby={"#{@id}-description"}
        role="dialog"
        aria-modal="true"
        tabindex="0"
      >
        <div class="flex min-h-full items-center justify-center">
          <div
            id={"#{@id}-container"}
            phx-window-keydown={JS.exec("data-cancel", to: "##{@id}")}
            phx-key="escape"
            phx-click-away={JS.exec("data-cancel", to: "##{@id}")}
            class="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
          >
            <button
              phx-click={JS.exec("data-cancel", to: "##{@id}")}
              type="button"
              class="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
              aria-label="Close"
            >
              <.icon name="hero-x-mark" class="h-5 w-5" />
            </button>
            <%= render_slot(@inner_block) %>
          </div>
        </div>
      </div>
    </div>
    """
  end

  @spec show_modal(String.t()) :: JS.t()
  defp show_modal(id) do
    JS.show(to: "##{id}")
    |> JS.show(to: "##{id}-bg", transition: {"transition-opacity ease-out duration-300", "opacity-0", "opacity-100"})
    |> JS.show(to: "##{id}-container", transition: {"transition-all ease-out duration-300", "opacity-0 translate-y-4", "opacity-100 translate-y-0"})
    |> JS.focus_first(to: "##{id}-container")
  end

  @spec hide_modal(String.t()) :: JS.t()
  defp hide_modal(id) do
    JS.hide(to: "##{id}-bg", transition: {"transition-opacity ease-in duration-200", "opacity-100", "opacity-0"})
    |> JS.hide(to: "##{id}-container", transition: {"transition-all ease-in duration-200", "opacity-100 translate-y-0", "opacity-0 translate-y-4"})
    |> JS.hide(to: "##{id}", transition: {"block", "block", "hidden"})
    |> JS.pop_focus()
  end
end
```

## TailwindCSS-First Policy

The Prismatic Platform enforces an absolute TailwindCSS-first policy. This is not a suggestion. It is a blocking requirement enforced by [pre-commit hooks](@/glossary/pre-commit-hooks.md) and [Credo](@/glossary/credo.md) checks.

### Rules

| Rule | Enforcement | Consequence |
|------|-------------|-------------|
| All styling via Tailwind utilities | Pre-commit hook | Commit blocked |
| No inline `style` attributes | Credo check | Build fails |
| No custom CSS files for components | Code review | PR rejected |
| Flowbite patterns for interactions | Design review | Revision required |
| Dark mode support on all components | Quality gate | Deploy blocked |
| Responsive design (mobile-first) | Visual QA | Revision required |

### Class Composition Pattern

Rather than building complex class strings inline, components use Elixir's list-based class composition:

```elixir
@spec button(map()) :: Phoenix.LiveView.Rendered.t()
def button(assigns) do
  ~H"""
  <button
    class={[
      # Base classes (always applied)
      "inline-flex items-center justify-center font-medium rounded-lg",
      "focus:ring-4 focus:outline-none transition-colors duration-200",
      # Variant classes (pattern-matched)
      variant_classes(@variant),
      # Size classes (pattern-matched)
      size_classes(@size),
      # Disabled state
      @disabled && "opacity-50 cursor-not-allowed",
      # Custom override (last wins in Tailwind)
      @class
    ]}
    disabled={@disabled}
    {@rest}
  >
    <%= render_slot(@inner_block) %>
  </button>
  """
end
```

This pattern leverages Phoenix's automatic filtering of `nil` and `false` values from class lists, producing clean HTML output without conditional string building.

## Flowbite Integration

[Flowbite](@/glossary/flowbite.md) provides the interaction design language for the platform. It is not used as a runtime dependency but as a pattern library -- Flowbite's HTML structure and Tailwind class combinations are adapted into Phoenix function components.

### Flowbite Component Mapping

| Flowbite Pattern | Phoenix Component | Usage |
|------------------|-------------------|-------|
| Modal | `CoreComponents.modal/1` | Confirmation dialogs, forms, detail views |
| Dropdown | `Navigation.dropdown/1` | Navigation menus, action menus |
| Sidebar | `Navigation.sidebar/1` | Section navigation with `hidden lg:block` |
| Accordion | `CoreComponents.accordion/1` | FAQ sections, collapsible panels |
| Table | `CoreComponents.table/1` | Data display with sorting and pagination |
| Toast | `CoreComponents.flash/1` | Notifications and status messages |
| Card | `CoreComponents.card/1` | Content containers, dashboard widgets |
| Tabs | `Navigation.tabs/1` | View switching within a page |

### Sidebar Pattern (Enforced)

All sidebar components must follow the Flowbite sidebar enforcement policy. The sidebar `<div>` in grid layouts MUST include `hidden lg:block` classes to prevent content overlap on mobile and tablet:

```elixir
@spec sidebar(map()) :: Phoenix.LiveView.Rendered.t()
def sidebar(assigns) do
  ~H"""
  <aside class="hidden lg:block lg:col-span-1">
    <div class="sticky top-4 space-y-4">
      <nav class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <%= render_slot(@inner_block) %>
      </nav>
    </div>
  </aside>
  """
end
```

## Attribute Type System

Phoenix LiveView provides a compile-time attribute type system that serves as the contract between component producer and consumer. The Prismatic Platform mandates comprehensive attribute declarations on every component.

### Attribute Types

| Type | Description | Example |
|------|-------------|---------|
| `:string` | Text values | `attr :label, :string, required: true` |
| `:atom` | Enumerated values | `attr :variant, :atom, values: [:primary, :secondary]` |
| `:boolean` | Toggle flags | `attr :disabled, :boolean, default: false` |
| `:integer` | Numeric values | `attr :page, :integer, default: 1` |
| `:list` | List of items | `attr :items, :list, default: []` |
| `:map` | Structured data | `attr :user, :map, required: true` |
| `:global` | HTML pass-through | `attr :rest, :global, include: ~w(role aria-label)` |
| `Phoenix.LiveView.JS` | JS commands | `attr :on_click, Phoenix.LiveView.JS` |

### Slot Declarations

Slots provide content projection -- the ability to inject arbitrary content into specific locations within a component's template:

```elixir
defmodule PrismaticWeb.Components.DataTable do
  @moduledoc """
  Data table component with typed column slots, sorting, and pagination.
  """

  use Phoenix.Component

  attr :id, :string, required: true
  attr :rows, :list, required: true
  attr :row_click, :any, default: nil
  attr :row_id, :any, default: nil

  slot :col, required: true do
    attr :label, :string, required: true
    attr :sortable, :boolean
    attr :class, :string
  end

  slot :action do
    attr :label, :string
  end

  @spec data_table(map()) :: Phoenix.LiveView.Rendered.t()
  def data_table(assigns) do
    ~H"""
    <div class="relative overflow-x-auto shadow-md rounded-lg">
      <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th :for={col <- @col} class={["px-6 py-3", col[:class]]}>
              <%= col.label %>
            </th>
            <th :if={@action != []} class="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            :for={row <- @rows}
            id={@row_id && @row_id.(row)}
            class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <td :for={col <- @col} class={["px-6 py-4", col[:class]]}>
              <%= render_slot(col, row) %>
            </td>
            <td :if={@action != []} class="px-6 py-4">
              <span :for={action <- @action}>
                <%= render_slot(action, row) %>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    """
  end
end
```

## Accessibility Standards

Every component in the Prismatic Platform must meet WCAG 2.1 AA compliance. This is enforced through code review, automated testing, and component documentation requirements.

### Mandatory Accessibility Patterns

| Pattern | Requirement | Implementation |
|---------|-------------|----------------|
| Keyboard navigation | All interactive elements focusable via Tab | `tabindex`, focus styles |
| ARIA labels | All non-text controls have accessible names | `aria-label`, `aria-labelledby` |
| Role attributes | Custom widgets declare their role | `role="dialog"`, `role="navigation"` |
| Focus management | Modals trap focus, restore on close | `JS.focus_first/1`, `JS.pop_focus/0` |
| Color contrast | 4.5:1 minimum for normal text | Tailwind color palette compliance |
| Screen reader support | Dynamic content changes announced | `aria-live="polite"`, `role="alert"` |
| Reduced motion | Animations respect user preferences | `motion-reduce:` Tailwind variant |

### Focus Management Example

```elixir
@spec accessible_dropdown(map()) :: Phoenix.LiveView.Rendered.t()
def accessible_dropdown(assigns) do
  ~H"""
  <div class="relative" phx-click-away={close_dropdown(@id)}>
    <button
      id={"#{@id}-trigger"}
      phx-click={toggle_dropdown(@id)}
      aria-haspopup="true"
      aria-expanded={@open}
      aria-controls={"#{@id}-menu"}
      class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-blue-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700"
    >
      <%= @label %>
      <.icon name="hero-chevron-down" class="ml-2 h-4 w-4" />
    </button>
    <div
      id={"#{@id}-menu"}
      role="menu"
      aria-labelledby={"#{@id}-trigger"}
      class={[
        "absolute right-0 z-10 mt-2 w-56 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-700",
        !@open && "hidden"
      ]}
    >
      <%= render_slot(@inner_block) %>
    </div>
  </div>
  """
end
```

## Component Testing

Components are tested at three levels: unit tests for rendering, integration tests for event handling, and visual regression tests for appearance.

### Unit Testing Components

```elixir
defmodule PrismaticWeb.Components.BadgeTest do
  @moduledoc """
  Tests for the Badge function component.
  """

  use PrismaticWeb.ConnCase, async: true
  import Phoenix.LiveViewTest

  alias PrismaticWeb.Components.Badge

  describe "badge/1" do
    test "renders with default variant and size" do
      html = render_component(&Badge.badge/1, inner_block: ["Active"])

      assert html =~ "Active"
      assert html =~ "bg-blue-100"
      assert html =~ "text-sm"
    end

    test "renders danger variant" do
      html = render_component(&Badge.badge/1,
        variant: :danger,
        inner_block: ["Critical"]
      )

      assert html =~ "bg-red-100"
      assert html =~ "text-red-800"
    end

    test "applies custom class" do
      html = render_component(&Badge.badge/1,
        class: "ml-2",
        inner_block: ["Custom"]
      )

      assert html =~ "ml-2"
    end

    test "forwards global attributes" do
      html = render_component(&Badge.badge/1,
        "aria-label": "Status badge",
        inner_block: ["Test"]
      )

      assert html =~ "aria-label"
    end
  end
end
```

### LiveView Integration Testing

```elixir
defmodule PrismaticWeb.Live.SearchFilterComponentTest do
  @moduledoc """
  Integration tests for the SearchFilter live component.
  """

  use PrismaticWeb.ConnCase, async: true
  import Phoenix.LiveViewTest

  describe "search functionality" do
    test "debounces search input", %{conn: conn} do
      {:ok, view, _html} = live(conn, "/test-search")

      view
      |> element("#search-input")
      |> render_change(%{"query" => "test"})

      # Result appears after debounce
      assert_receive {:filter_changed, %{query: "test"}}, 500
    end

    test "toggles tag selection", %{conn: conn} do
      {:ok, view, _html} = live(conn, "/test-search")

      view
      |> element("[data-tag='elixir']")
      |> render_click()

      assert has_element?(view, "[data-tag='elixir'].selected")
    end
  end
end
```

## Component Organization

The Prismatic Platform organizes components in a hierarchical module structure:

```
apps/prismatic_web/lib/prismatic_web/
  components/
    core_components.ex          # Platform-wide primitives
    navigation.ex               # Navbar, sidebar, breadcrumbs, tabs
    layouts.ex                  # Page layouts, grid systems
  live/
    perimeter/
      components/
        security_rating.ex      # Domain-specific: security grade display
        asset_card.ex           # Domain-specific: asset summary card
    osint/
      components/
        tool_card.ex            # Domain-specific: OSINT tool card
        result_panel.ex         # Domain-specific: search result panel
    labs/
      components/
        experiment_card.ex      # Domain-specific: lab experiment card
```

### Module Naming Convention

| Level | Pattern | Example |
|-------|---------|---------|
| Platform-wide | `PrismaticWeb.Components.*` | `CoreComponents`, `Navigation` |
| Domain-specific | `PrismaticWeb.Live.{Domain}.Components.*` | `Perimeter.Components.SecurityRating` |
| Page-specific | Inline in LiveView module | Private functions in the LiveView |

## Performance Considerations

UI components must comply with the platform's page load performance standard. Server-side render time must stay under 100ms, and total page load under 250ms.

### Optimization Techniques

**Minimize assigns in components.** Every assign that changes triggers a re-render of the component. Keep component assigns to the minimum necessary for rendering. Derive computed values in the parent and pass them as attrs rather than computing inside the component.

**Use `phx-update="stream"` for large lists.** Instead of re-rendering entire lists when items change, LiveView streams allow inserting, updating, and removing individual items without touching the rest of the DOM:

```elixir
@spec mount(map(), map(), Phoenix.LiveView.Socket.t()) :: {:ok, Phoenix.LiveView.Socket.t()}
def mount(_params, _session, socket) do
  {:ok, stream(socket, :items, fetch_items())}
end

@spec handle_event(String.t(), map(), Phoenix.LiveView.Socket.t()) ::
        {:noreply, Phoenix.LiveView.Socket.t()}
def handle_event("add_item", params, socket) do
  item = create_item(params)
  {:noreply, stream_insert(socket, :items, item)}
end
```

**Lazy-load heavy components.** Components that require expensive data fetching should use `connected?/1` checks to render a skeleton during the initial static render and load data only after the WebSocket connects.

**Use `:temporary` assigns for one-time data.** Assigns marked as temporary are reset after render, reducing the socket's memory footprint for data that is only needed during a single render cycle.

## Dark Mode Implementation

The Prismatic Platform uses forced dark mode with the `class="dark"` strategy on the root `<html>` element. There is no light/dark toggle. All components must support dark mode variants.

### Dark Mode Pattern

```elixir
# Every component includes dark: variants for all color-bearing classes
defp card_classes do
  [
    "bg-white dark:bg-gray-800",
    "text-gray-900 dark:text-white",
    "border border-gray-200 dark:border-gray-700",
    "shadow-md dark:shadow-gray-900/30"
  ]
end
```

### Tailwind Dark Mode Classes

| Light Class | Dark Variant | Usage |
|-------------|-------------|-------|
| `bg-white` | `dark:bg-gray-800` | Card backgrounds |
| `bg-gray-50` | `dark:bg-gray-900` | Page backgrounds |
| `text-gray-900` | `dark:text-white` | Primary text |
| `text-gray-500` | `dark:text-gray-400` | Secondary text |
| `border-gray-200` | `dark:border-gray-700` | Borders |
| `hover:bg-gray-100` | `dark:hover:bg-gray-700` | Hover states |

## LiveView JS Commands

Phoenix LiveView's JS module provides client-side interactivity without custom JavaScript. The Prismatic Platform uses JS commands for transitions, visibility toggling, focus management, and CSS class manipulation.

```elixir
defmodule PrismaticWeb.Components.Transitions do
  @moduledoc """
  Reusable JS transition commands for component animations.
  """

  alias Phoenix.LiveView.JS

  @spec fade_in(String.t()) :: JS.t()
  def fade_in(selector) do
    JS.show(
      to: selector,
      transition: {
        "transition-opacity ease-out duration-300",
        "opacity-0",
        "opacity-100"
      }
    )
  end

  @spec fade_out(String.t()) :: JS.t()
  def fade_out(selector) do
    JS.hide(
      to: selector,
      transition: {
        "transition-opacity ease-in duration-200",
        "opacity-100",
        "opacity-0"
      }
    )
  end

  @spec slide_in(String.t()) :: JS.t()
  def slide_in(selector) do
    JS.show(
      to: selector,
      transition: {
        "transition-all ease-out duration-300",
        "opacity-0 translate-y-4",
        "opacity-100 translate-y-0"
      }
    )
  end
end
```

## Common Pitfalls

**Using inline styles instead of Tailwind classes.** The pre-commit hook detects and blocks `style=` attributes in HEEx templates. Every visual property must be expressed as a Tailwind utility class. If a needed utility does not exist, extend the Tailwind config rather than writing inline CSS.

**Forgetting dark mode variants.** Every color-bearing Tailwind class needs a corresponding `dark:` variant. Components that look correct in light mode but break in dark mode will fail visual QA.

**Prop drilling through deeply nested components.** Instead of passing data through multiple component layers, use LiveView assigns or application-level state. Function components should receive only the data they directly render.

**Ignoring mobile responsiveness.** All components must be mobile-first. Grid layouts must use responsive breakpoints (`sm:`, `md:`, `lg:`). Sidebars must be hidden on mobile with `hidden lg:block`.

**Hardcoding text in components.** All user-visible text should be passed as attributes or slots, not hardcoded in the component. This enables reusability and future internationalization.

## Related Concepts

- [Phoenix LiveView](@/glossary/phoenix-liveview.md) -- The rendering engine powering all UI components
- [Flowbite](@/glossary/flowbite.md) -- Design pattern library providing component interaction patterns
- [TailwindCSS](@/glossary/tailwindcss.md) -- Utility-first CSS framework for all visual styling
- [Phoenix Framework](@/glossary/phoenix-framework.md) -- Web framework providing the component infrastructure
- [Pattern Matching](@/glossary/pattern-matching.md) -- Elixir feature used for variant dispatch in components
- [Typespec](@/glossary/typespec.md) -- Type specifications ensuring component function contracts
- [Telemetry](@/glossary/telemetry.md) -- Metrics tracking component render performance
- [Testing](@/glossary/testing.md) -- Component test strategies and LiveViewTest helpers
- [Quality Gates](@/glossary/quality-gates.md) -- Gates that verify component accessibility and styling compliance
- [Pre-commit Hooks](@/glossary/pre-commit-hooks.md) -- Hooks enforcing TailwindCSS-first policy

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Technologies](@/technologies/_index.md) -- Full technology stack details
- [Apps](@/apps/_index.md) -- Umbrella applications using the component system
- Glossary Index -- Complete glossary of platform concepts

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
