+++
title = "/setup-shell"
weight = 1400
[extra]
category = "Infrastructure"
description = "Shell environment setup and configuration for development"
syntax = "/setup-shell [options]"
authority = "L2+"
agent = "shell-setup-specialist"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1142
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["setup-shell", "Shell", "commands", "Infrastructure", "Prismatic Platform", "Elixir", "Erlang"]
tags = ["commands", "infrastructure", "setup-shell", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/setup-shell - Prismatic Platform"
+++

## Overview

**/setup-shell** is a production command in the **Infrastructure** category of the Prismatic Platform that handles shell environment setup and configuration for development. The Prismatic Platform's development environment requires specific shell configurations, environment variables, path settings, and tool integrations to function correctly. The `/setup-shell` command automates this setup process, transforming a bare developer workstation into a fully configured Prismatic development environment in a single operation.

The command addresses a fundamental challenge in complex Elixir/OTP umbrella projects: ensuring that every developer and every CI/CD runner has an identical, reproducible environment. Without standardized shell configuration, subtle differences in PATH ordering, Erlang/OTP versions, environment variable settings, or tool availability can produce hard-to-diagnose build failures and behavioral inconsistencies across development machines.

This command operates under the **L2+** authority level and is executed by the `shell-setup-specialist` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The L2+ authority level ensures that only developers with operational privileges can modify the shell environment, preventing accidental misconfiguration by less experienced team members.

The setup process is idempotent by design. Running `/setup-shell` on an already-configured environment detects existing configurations, skips redundant steps, and only applies updates where the current state diverges from the expected configuration. This makes it safe to run repeatedly -- for example, after upgrading Elixir versions, adding new platform dependencies, or onboarding to a new machine.

## Architecture

The shell setup system uses a layered configuration architecture that separates concerns between system-level tools, language runtimes, project-specific settings, and developer preferences.

```
/setup-shell
       |
       v
  [System Prerequisites]    -- Homebrew, git, curl, build tools
       |
       v
  [Runtime Installer]       -- Elixir, Erlang/OTP, Node.js via asdf
       |
       v
  [Environment Configurator] -- ENV vars, PATH, shell profile
       |
       v
  [Tool Installer]          -- Mix tasks, Hex packages, npm globals
       |
       v
  [Verification Suite]      -- Validate all components operational
       |
       v
  Configured Development Environment
```

| Component | Purpose | Implementation |
|-----------|---------|----------------|
| **System Prerequisites** | Ensures base system tools are installed (Homebrew, git, curl) | Shell detection and package manager integration |
| **Runtime Installer** | Installs and configures Elixir, Erlang/OTP, and Node.js via version manager | `asdf` plugin management with `.tool-versions` |
| **Environment Configurator** | Sets environment variables and PATH entries in shell profile | Profile file detection (`.zshrc`, `.bashrc`, `.bash_profile`) |
| **Tool Installer** | Installs required Mix tasks, Hex packages, and npm dependencies | `mix local.hex`, `mix local.rebar`, `npm install -g` |
| **Verification Suite** | Validates that all components are correctly installed and accessible | Version checks, compilation tests, connectivity verification |

## Usage

### Full Environment Setup

```bash
# Complete environment setup (interactive, prompts for confirmation)
/setup-shell

# Non-interactive setup (accept all defaults)
/setup-shell --yes

# Setup with specific Elixir version
/setup-shell --elixir-version 1.19.0

# Setup for CI/CD environment (minimal, no interactive prompts)
/setup-shell --ci
```

### Targeted Configuration

```bash
# Only configure environment variables
/setup-shell --env-only

# Only install/update language runtimes
/setup-shell --runtimes-only

# Only install project dependencies
/setup-shell --deps-only

# Only configure shell profile (aliases, PATH)
/setup-shell --profile-only
```

### Verification and Diagnostics

```bash
# Verify current environment without making changes
/setup-shell --verify

# Show what would be configured (dry run)
/setup-shell --dry-run

# Generate environment diagnostic report
/setup-shell --diagnose

# Export current configuration as shareable profile
/setup-shell --export > my-env.sh
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--yes` | flag | false | Accept all defaults without prompting |
| `--ci` | flag | false | CI/CD mode: minimal setup, no interactive prompts, no profile modification |
| `--elixir-version` | string | from `.tool-versions` | Specific Elixir version to install |
| `--otp-version` | string | from `.tool-versions` | Specific Erlang/OTP version to install |
| `--node-version` | string | from `.tool-versions` | Specific Node.js version to install |
| `--env-only` | flag | false | Only configure environment variables |
| `--runtimes-only` | flag | false | Only install/update language runtimes |
| `--deps-only` | flag | false | Only install project dependencies |
| `--profile-only` | flag | false | Only configure shell profile |
| `--verify` | flag | false | Verify current environment without changes |
| `--dry-run` | flag | false | Show planned actions without executing |
| `--diagnose` | flag | false | Generate diagnostic report of current environment |
| `--export` | flag | false | Export current configuration as shell script |
| `--shell` | string | auto-detected | Target shell: `zsh`, `bash`, `fish` |
| `--force` | flag | false | Force reinstallation of all components |

## Execution Flow

1. **Shell Detection** -- Detect the current shell (`zsh`, `bash`, `fish`) and locate the appropriate profile file. On macOS, this is typically `~/.zshrc`; on Linux, `~/.bashrc` or `~/.bash_profile`.

2. **System Prerequisites Check** -- Verify that Homebrew (macOS) or apt/yum (Linux) is available. Check for git, curl, and C build tools. Install missing prerequisites with user confirmation.

3. **Version Manager Setup** -- Install or update `asdf` version manager. Add required plugins for Elixir, Erlang, and Node.js. Read version specifications from the project's `.tool-versions` file.

4. **Runtime Installation** -- Install specified versions of Elixir, Erlang/OTP, and Node.js through asdf. Set global versions to match project requirements. Verify compilation capabilities with a simple test module.

5. **Environment Variable Configuration** -- Configure required environment variables in the shell profile:
   - `MIX_ENV` defaults
   - `GITLAB_TOKEN` placeholder (with setup instructions)
   - `DATABASE_URL` connection string template
   - `MEILISEARCH_URL` and `MEILISEARCH_KEY` placeholders
   - `ERL_AFLAGS` for UTF-8 support

6. **Path Configuration** -- Add required directories to PATH: asdf shims, Elixir escripts, local bin directories. Ensure correct ordering to avoid version conflicts.

7. **Tool Installation** -- Install Hex package manager, Rebar3 build tool, and required Mix tasks. Install Node.js global packages for TailwindCSS compilation. Fetch and compile project dependencies.

8. **Git Configuration** -- Configure git hooks directory to `.githooks/`, set up conventional commit message template, and verify pre-commit hook accessibility.

9. **Verification** -- Run comprehensive verification suite checking every installed component, version compatibility, and connectivity to required services.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| asdf Version Manager | Runtime | Manages Elixir, Erlang/OTP, and Node.js versions |
| [Mix Build Tool](@/glossary/mix.md) | Tooling | Configures Mix environment, Hex, and Rebar |
| [Git Hooks](@/glossary/quality-gates.md) | Enforcement | Sets up `.githooks/` directory and pre-commit quality gates |
| [GitLab CI/CD](@/glossary/gitlab-ci.md) | CI | `--ci` mode provides CI-compatible configuration |
| [TailwindCSS](@/glossary/tailwindcss.md) | Frontend | Installs Node.js dependencies for CSS compilation |
| [Telemetry](@/glossary/telemetry.md) | Observability | Emits setup progress events for monitoring |

## Best Practices

**First-Time Setup**: Run `/setup-shell` immediately after cloning the repository. This ensures all dependencies are installed before attempting to compile the project, avoiding confusing error messages from missing tools.

**After Upgrades**: Run `/setup-shell --runtimes-only` after any change to the `.tool-versions` file. This updates language runtimes to match the project's current requirements without disturbing other configuration.

**CI/CD Environments**: Always use `--ci` mode in automated environments. This skips interactive prompts, avoids modifying shell profiles (which are ephemeral in CI), and focuses on the minimal setup required for compilation and testing.

**Team Onboarding**: Share the `/setup-shell --export` output as part of onboarding documentation. This gives new team members a reference for the expected environment configuration, even if they prefer to set up manually.

**Security**: Never store actual tokens or secrets in shell profiles. Use `/setup-shell` to create placeholder entries with clear instructions for obtaining and setting the real values. Sensitive values should come from environment variables or secret management systems.

## Error Handling

| Error Condition | Response | Recovery |
|----------------|----------|----------|
| Homebrew not installed (macOS) | Provide installation command and pause | Run the provided Homebrew install command |
| asdf plugin installation failure | Retry with verbose output, show manual install steps | Install the plugin manually: `asdf plugin add elixir` |
| Version not available | Show available versions, suggest closest match | Use `asdf list all elixir` to find available versions |
| Profile file not writable | Display file permissions and suggest fix | Run `chmod u+w ~/.zshrc` or equivalent |
| Network connectivity failure | Skip online-dependent steps, mark as incomplete | Retry when connectivity is restored |
| Compilation test failure | Show error details, suggest OTP version compatibility check | Verify Elixir and OTP version compatibility matrix |

## Advanced Usage

### Custom Environment Profiles

```bash
# Create a named environment profile
/setup-shell --export --name production > ~/.prismatic-envs/production.sh

# Load a specific profile
source ~/.prismatic-envs/production.sh

# Switch between profiles
/setup-shell --profile staging
```

### Docker Development Environment

```bash
# Generate Dockerfile-compatible setup script
/setup-shell --ci --export --shell bash > docker-setup.sh

# Verify Docker environment matches local
docker exec -it prismatic-dev /setup-shell --verify
```

### Multi-Project Configuration

```bash
# Setup shell for multiple Prismatic Platform instances
/setup-shell --project-root /path/to/prismatic-platform
/setup-shell --project-root /path/to/prismatic-staging

# Use direnv for automatic environment switching
/setup-shell --generate-envrc > .envrc
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: The setup process validates every component after installation. A partially configured environment is treated as a failure -- either the setup completes fully or it reports exactly what failed and what manual steps are required. No silent failures, no "it might work" outcomes.
- **NO DOUBTS**: The `--verify` flag provides evidence-based confirmation that the environment is correctly configured. Every verification check produces a pass/fail result with version details, enabling confident assessment of environment readiness before attempting development work.

## Related Commands

- [/ollama](@/commands/ollama.md) - Local AI Ollama model management, installation and optimization
- [/gardener](@/commands/gardener.md) - [GARDEN](@/glossary/garden.md) legacy knowledge repository management across 116 repos
- [/garden-explore](@/commands/garden-explore.md) - Explore GARDEN repositories for patterns and knowledge
- [/connect](@/commands/connect.md) - MCP server connection management across 14+ servers
- [/agents](@/commands/agents.md) - List and manage agent ecosystem with status monitoring
- [/commit](@/commands/commit.md) - Smart commit with quality gates and conventional format

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)