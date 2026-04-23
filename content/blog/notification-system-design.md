+++
title = "Designing a Toast Notification System with Alpine.js"
date = 2026-04-01
description = "Building a production notification system with Alpine.js: animation management, severity levels, action buttons, auto-dismiss, and LiveView integration."

[extra]
author = "Tomas Korcak (korczis)"
category = "engineering"
tags = ["notifications", "alpine-js", "animations", "liveview", "ux"]
reading_time = "8 min"
keywords = ["toast notification system", "alpine.js notifications", "liveview notifications", "animation system", "severity levels", "auto-dismiss"]
image = "/images/blog/notification-system-design.png"
word_count = 1200
date_created = "2026-04-01"
date_modified = "2026-04-01"
quality_score = 85
see_also = ["developers", "tutorials"]
image_alt = "Notification System Design - Prismatic Platform"
+++

Every web application needs a notification system. Most get it wrong by treating notifications as simple text banners. A production notification system needs severity classification, action buttons, animation management, auto-dismiss with pause-on-hover, keyboard accessibility, and integration with server-side events. Here is how we built ours with Alpine.js and Phoenix LiveView.

## The Alpine.js Component

The notification system is a single Alpine.js component that manages a notification queue:

```javascript
document.addEventListener('alpine:init', () => {
  Alpine.data('notificationSystem', () => ({
    notifications: [],
    maxVisible: 5,
    defaultDuration: 5000,

    add(notification) {
      const id = crypto.randomUUID();
      const entry = {
        id,
        type: notification.type || 'info',
        title: notification.title || '',
        message: notification.message,
        actions: notification.actions || [],
        duration: notification.duration || this.defaultDuration,
        persistent: notification.persistent || false,
        dismissable: notification.dismissable !== false,
        timestamp: Date.now(),
        visible: false,
        paused: false
      };

      this.notifications.push(entry);
      this.enforceMaxVisible();

      // Trigger enter animation on next frame
      requestAnimationFrame(() => {
        entry.visible = true;
      });

      if (!entry.persistent) {
        this.scheduleAutoDismiss(entry);
      }
    },

    dismiss(id) {
      const entry = this.notifications.find(n => n.id === id);
      if (!entry) return;

      entry.visible = false;
      setTimeout(() => {
        this.notifications = this.notifications.filter(n => n.id !== id);
      }, 300); // Match CSS transition duration
    },

    enforceMaxVisible() {
      while (this.notifications.length > this.maxVisible) {
        this.dismiss(this.notifications[0].id);
      }
    },

    scheduleAutoDismiss(entry) {
      const check = () => {
        if (entry.paused) {
          setTimeout(check, 100);
          return;
        }

        const elapsed = Date.now() - entry.timestamp;
        if (elapsed >= entry.duration) {
          this.dismiss(entry.id);
        } else {
          setTimeout(check, entry.duration - elapsed);
        }
      };

      setTimeout(check, entry.duration);
    },

    pauseDismiss(id) {
      const entry = this.notifications.find(n => n.id === id);
      if (entry) entry.paused = true;
    },

    resumeDismiss(id) {
      const entry = this.notifications.find(n => n.id === id);
      if (entry) {
        entry.paused = false;
        entry.timestamp = Date.now(); // Reset timer
      }
    }
  }));
});
```

## Severity Levels

Four severity levels map to distinct visual treatments using Tailwind classes:

```javascript
getTypeClasses(type) {
  const classes = {
    success: {
      container: 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700',
      icon: 'text-green-600 dark:text-green-400',
      title: 'text-green-800 dark:text-green-200'
    },
    error: {
      container: 'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-700',
      icon: 'text-red-600 dark:text-red-400',
      title: 'text-red-800 dark:text-red-200'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-700',
      icon: 'text-yellow-600 dark:text-yellow-400',
      title: 'text-yellow-800 dark:text-yellow-200'
    },
    info: {
      container: 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700',
      icon: 'text-blue-600 dark:text-blue-400',
      title: 'text-blue-800 dark:text-blue-200'
    }
  };
  return classes[type] || classes.info;
}
```

## Animation System

Notifications enter from the right and exit by fading out. The animation is CSS-driven with Alpine.js controlling the state transitions:

```html
<template x-for="notification in notifications" :key="notification.id">
  <div
    x-show="notification.visible"
    x-transition:enter="transition ease-out duration-300"
    x-transition:enter-start="opacity-0 translate-x-8"
    x-transition:enter-end="opacity-100 translate-x-0"
    x-transition:leave="transition ease-in duration-200"
    x-transition:leave-start="opacity-100 translate-x-0"
    x-transition:leave-end="opacity-0 translate-x-8"
    @mouseenter="pauseDismiss(notification.id)"
    @mouseleave="resumeDismiss(notification.id)"
    :class="getTypeClasses(notification.type).container"
    class="pointer-events-auto w-full max-w-sm rounded-lg border p-4 shadow-lg"
    role="alert"
    :aria-live="notification.type === 'error' ? 'assertive' : 'polite'"
  >
    <div class="flex items-start">
      <div class="flex-shrink-0" x-html="getIcon(notification.type)"></div>
      <div class="ml-3 flex-1">
        <p x-show="notification.title"
           x-text="notification.title"
           :class="getTypeClasses(notification.type).title"
           class="text-sm font-medium"></p>
        <p x-text="notification.message"
           class="mt-1 text-sm text-gray-600 dark:text-gray-300"></p>
        <div x-show="notification.actions.length > 0" class="mt-3 flex gap-2">
          <template x-for="action in notification.actions">
            <button @click="action.handler(); dismiss(notification.id)"
                    x-text="action.label"
                    class="text-sm font-medium text-blue-600 hover:text-blue-500">
            </button>
          </template>
        </div>
      </div>
      <button x-show="notification.dismissable"
              @click="dismiss(notification.id)"
              class="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600">
        <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
</template>
```

## Action Buttons

Notifications can include action buttons that provide contextual operations:

```javascript
// Example: Error notification with retry action
notificationSystem.add({
  type: 'error',
  title: 'OSINT Query Failed',
  message: 'The ARES registry returned a timeout. The query has been queued for retry.',
  persistent: true,
  actions: [
    {
      label: 'Retry Now',
      handler: () => { liveSocket.execJS(document.body, 'retry-osint-query'); }
    },
    {
      label: 'View Details',
      handler: () => { window.location.href = '/hub/osint/runs/latest'; }
    }
  ]
});
```

## LiveView Integration

The critical integration point: server-side events triggering client-side notifications. LiveView pushes events, and a global listener dispatches them to the Alpine.js component:

```elixir
# Server side - in any LiveView
defp notify_success(socket, message) do
  push_event(socket, "notification", %{
    type: "success",
    message: message,
    duration: 3000
  })
end

defp notify_error(socket, message) do
  push_event(socket, "notification", %{
    type: "error",
    title: "Error",
    message: message,
    persistent: true
  })
end
```

```javascript
// Client side - global event listener
document.addEventListener('phx:notification', (event) => {
  const system = Alpine.$data(
    document.querySelector('[x-data*="notificationSystem"]')
  );
  if (system) {
    system.add(event.detail);
  }
});
```

This bidirectional integration means any LiveView in the application can trigger notifications without importing any JavaScript. The server pushes a `"notification"` event with a payload, and the global listener routes it to the Alpine.js component.

## Keyboard Accessibility

The notification system supports keyboard interaction:

- **Escape**: Dismisses the most recent notification.
- **Tab**: Moves focus between action buttons within notifications.
- **aria-live regions**: Screen readers announce notifications based on severity (assertive for errors, polite for info).

```javascript
init() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && this.notifications.length > 0) {
      const latest = this.notifications[this.notifications.length - 1];
      if (latest.dismissable) {
        this.dismiss(latest.id);
      }
    }
  });
}
```

## Reduced Motion Support

For users who prefer reduced motion (a system accessibility setting), animations are replaced with instant show/hide:

```css
@media (prefers-reduced-motion: reduce) {
  [x-transition] {
    transition-duration: 0.01ms !important;
  }
}
```

## Queue Management

Under heavy event load (such as during a bulk OSINT operation that produces many results), the notification system can be overwhelmed. The `enforceMaxVisible` function caps the visible count at 5, dismissing the oldest notification when a new one arrives. For bulk operations, we aggregate notifications:

```elixir
defp notify_bulk_progress(socket, completed, total) do
  push_event(socket, "notification", %{
    type: "info",
    title: "Bulk Operation",
    message: "#{completed}/#{total} items processed",
    duration: 2000,
    group: "bulk_progress"  # Client-side deduplication key
  })
end
```

The client-side component recognizes the `group` key and replaces existing notifications with the same group instead of adding new ones:

```javascript
add(notification) {
  if (notification.group) {
    const existing = this.notifications.find(n => n.group === notification.group);
    if (existing) {
      existing.message = notification.message;
      existing.timestamp = Date.now();
      return;
    }
  }
  // ... normal add logic
}
```

This notification system has been running in production across all Prismatic dashboards since March 2026. It handles approximately 50-100 notifications per user session with zero memory leaks and consistent animation performance across Chrome, Firefox, and Safari.
