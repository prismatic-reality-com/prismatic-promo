+++
title = "The Command Palette: 228 Commands at Your Fingertips"
date = 2026-03-08
description = "Inside Prismatic's command palette system: 228 discoverable commands organized by domain, with keyboard-driven navigation, fuzzy search, and contextual suggestions."

[extra]
author = "Tomas Korcak (korczis)"
category = "product"
tags = ["command-palette", "developer-experience", "navigation", "productivity", "ui", "commands"]
reading_time = "7 min"
keywords = ["command palette design", "keyboard-driven interface", "developer productivity", "fuzzy search commands", "VS Code style command palette"]
image = "/images/blog/command-palette.png"
word_count = 1300
date_created = "2026-03-08"
date_modified = "2026-03-08"
quality_score = 82
see_also = ["command", "slash-command", "aiad", "ui-components", "liveview"]
image_alt = "The Command Palette: 228 Commands at Your Fingertips - Prismatic Platform"
+++

Power users navigate with keyboards, not mice. Prismatic's command palette puts 228 platform commands behind a single shortcut: Cmd+K (or Ctrl+K on Linux/Windows). This post explains how we built it and why it matters for intelligence workflows.

## The Problem

Prismatic has 30+ LiveView pages organized into 5 navigation sections: Investigate, Monitor, Decide, Learn, and System. Finding the right tool requires knowing where it lives in the hierarchy. For new users, this means clicking through menus. For power users, this is friction.

The command palette solves this by making every action discoverable through search.

## Architecture

The command palette is an Alpine.js component that maintains a command registry:

```javascript
Alpine.data('commandPalette', () => ({
  open: false,
  query: '',
  commands: [],
  selectedIndex: 0,

  init() {
    this.commands = window.__PRISMATIC_COMMANDS__ || [];

    // Register global shortcut
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.toggle();
      }
    });
  },

  get filteredCommands() {
    if (!this.query) return this.commands.slice(0, 10);
    return this.fuzzyMatch(this.query, this.commands);
  },

  fuzzyMatch(query, commands) {
    const terms = query.toLowerCase().split(/\s+/);
    return commands
      .map(cmd => ({
        ...cmd,
        score: this.matchScore(terms, cmd)
      }))
      .filter(cmd => cmd.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);
  }
}));
```

## Command Categories

The 228 commands span six categories:

| Category | Count | Examples |
|----------|-------|---------|
| Navigation | 45 | Go to Dashboard, Open OSINT Toolbox |
| OSINT | 60 | Search ARES, Scan Domain, Check Sanctions |
| Due Diligence | 35 | New Case, Run Pipeline, Export Report |
| System | 40 | Health Check, View Logs, Clear Cache |
| Development | 28 | Run Tests, Validate Doctrine, Format Code |
| Intelligence | 20 | Investigate Entity, Expand Mesh, Score Risk |

Commands are registered from multiple sources:

1. **Route-based commands** -- automatically generated from the Phoenix router
2. **Mix task commands** -- exposed from the 448 registered mix tasks
3. **OSINT adapter commands** -- one command per adapter for quick execution
4. **Custom commands** -- manually registered for complex workflows

## Fuzzy Search

The search algorithm scores matches across multiple fields:

```javascript
matchScore(terms, command) {
  let score = 0;
  const searchable = [
    command.title,
    command.category,
    ...command.keywords
  ].join(' ').toLowerCase();

  for (const term of terms) {
    if (searchable.includes(term)) {
      score += term.length;
      // Bonus for title matches
      if (command.title.toLowerCase().includes(term)) {
        score += term.length * 2;
      }
    }
  }
  return score;
}
```

Typing "ares" surfaces the ARES adapter command. Typing "dd case" surfaces due diligence case management. Typing "health" surfaces system health checks.

## Keyboard Navigation

The palette supports full keyboard navigation:

- **Up/Down arrows** -- move through results
- **Enter** -- execute selected command
- **Escape** -- close palette
- **Tab** -- autocomplete from selected result

This means you can go from any page to any command without touching the mouse: Cmd+K, type a few characters, Enter.

## Contextual Suggestions

When opened without a query, the palette shows contextual suggestions based on the current page:

- On `/hub/dd/cases` -- shows DD-related commands first
- On `/hub/osint/tools` -- shows OSINT execution commands
- On `/admin/` -- shows system administration commands

Context is determined by the current URL path and recent command history (stored in localStorage).

## Integration with LiveView

When a command targets a LiveView page, navigation happens via `live_navigate`:

```javascript
executeCommand(command) {
  this.open = false;
  this.query = '';

  switch (command.action) {
    case 'navigate':
      window.liveSocket.pushEvent('navigate', {path: command.path});
      break;
    case 'execute':
      window.liveSocket.pushEvent('execute_command', {
        command: command.id,
        params: command.params
      });
      break;
  }
}
```

This preserves the LiveView connection and avoids full page reloads.

## Impact on Workflows

Before the command palette, an analyst investigating a company would:

1. Navigate to OSINT section (click)
2. Find the ARES adapter (scroll, click)
3. Enter the query (type)
4. Navigate to DD section (click)
5. Create a new case (click)
6. Link the OSINT results (click)

With the command palette:

1. Cmd+K, "ares", Enter (3 keystrokes)
2. Enter the query
3. Cmd+K, "new case", Enter (3 keystrokes)
4. Link results (1 click)

The keyboard-driven workflow is faster and maintains focus.

## Conclusion

The command palette is a small feature with outsized impact. By making 228 commands discoverable through fuzzy search, it eliminates the need to memorize navigation hierarchies and reduces the cognitive load of context-switching between tools.

---

*Try the command palette on any Prismatic page with Cmd+K or explore the [Developer Portal](/developers/) for the full command reference.*
