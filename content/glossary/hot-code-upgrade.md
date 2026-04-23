+++
title = "Hot Code Upgrade"
description = "BEAM's capability to replace running code modules with new versions without stopping the system, enabling zero-downtime deployments and live debugging in production Elixir applications."
weight = 50

[extra]
category = "elixir"
tags = ["hot-code-upgrade", "beam", "erlang", "elixir", "deployment", "zero-downtime", "code-loading", "release", "otp", "live-update"]
date_created = "2026-02-23"
date_updated = "2026-02-23"
difficulty = "advanced"
audience = ["developers", "architects", "devops-engineers", "sre"]
related_terms = ["beam", "otp", "release", "genserver", "supervisor", "deployment", "code-loading"]
key_concepts = ["code-server", "module-versioning", "code-change-callback", "appup", "relup", "rolling-deployment"]
platforms = ["beam", "erlang", "elixir", "otp"]
prerequisites = ["beam-fundamentals", "otp-behaviors", "release-management"]
use_cases = ["zero-downtime-deployment", "live-debugging", "telecom-systems", "critical-infrastructure", "state-migration"]
complexity = "high"
stability = "mature"
pioneer = "Ericsson (Erlang/OTP team)"
year_introduced = "1996"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1100
date_modified = "2026-02-23"
keywords = ["Hot Code Upgrade", "BEAM", "zero downtime", "live code", "glossary", "Prismatic Platform"]
quality_score = 82
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Hot Code Upgrade - Prismatic Platform"
+++

## Definition and Overview

Hot code upgrade (also called hot code loading or hot code swapping) is the BEAM virtual machine's ability to replace a running module's code with a new version while the system continues to operate, without dropping connections, losing state, or interrupting service. This capability was designed for telecom systems (Ericsson's AXD 301 switch achieved nine-nines availability: 99.9999999%) where downtime is measured in milliseconds per year and system restarts are unacceptable.

The BEAM code server maintains up to two versions of each module simultaneously: the "current" version (the latest loaded) and the "old" version (the previously running one). Processes executing functions in the old version continue running until they make a fully qualified function call (Module.function(args) rather than function(args)), at which point they transparently switch to the current version. This gradual migration ensures that no process is forcibly interrupted -- each process transitions at a natural execution boundary.

Hot code upgrades are one of the most powerful features of the BEAM platform, but they are also one of the most complex to use correctly in practice. The challenge is not loading new code (which is straightforward) but managing state transformations: if a GenServer's internal state structure changes between versions, the old state must be migrated to the new format through the `code_change/3` callback. Modern Elixir deployments typically use rolling restarts (blue-green or canary deployments) instead of in-place hot upgrades, as rolling restarts are simpler and more predictable while still achieving zero-downtime deployment.

## Technical Deep Dive

### Code Loading Mechanism

| Step | Action | BEAM Behavior |
|------|--------|--------------|
| 1 | Compile new module version | New `.beam` file created |
| 2 | Load new module | Code server marks it as "current" |
| 3 | Previous current becomes "old" | Both versions coexist |
| 4 | Processes make qualified calls | Gradually switch to current |
| 5 | All processes on current | Old version purged |
| 6 | Purge removes old version | Memory reclaimed |

### Two-Version Coexistence

```
Module: PrismaticOsint.ToolRegistry

Version 1 (old):                  Version 2 (current):
  def handle_call(:list, ...)       def handle_call(:list, ...)
    # old implementation              # new implementation with filtering
  end                                end

Process A (executing v1):
  -> Calls ToolRegistry.list()   (qualified call)
  -> BEAM routes to Version 2    (transparent switch)
  -> Process now running v2

Process B (executing v1):
  -> Calls list() internally     (local call)
  -> Continues on Version 1      (no switch until qualified call)
```

### OTP Code Change Protocol

| Callback | Purpose | Trigger |
|----------|---------|--------|
| `code_change/3` | Migrate GenServer state between versions | `sys:change_code/4` during upgrade |
| `terminate/2` | Clean up before process restart | Supervisor restart |
| `init/1` | Initialize with new-version state | Fresh start |

### Upgrade Artifacts

| Artifact | Extension | Purpose |
|----------|-----------|---------|
| **Appup** | `.appup` | Per-application upgrade instructions |
| **Relup** | `.relup` | Full release upgrade instructions |
| **Release** | `.tar.gz` | Complete deployable release package |

### Hot Upgrade vs Rolling Restart

| Property | Hot Code Upgrade | Rolling Restart |
|----------|-----------------|----------------|
| **Downtime** | Zero (in theory) | Near-zero (during drain) |
| **State preservation** | State preserved, migrated | State lost, reinitialized |
| **Complexity** | Very high (appup, code_change) | Low (standard deployment) |
| **Rollback** | Complex (reverse appup) | Simple (deploy previous version) |
| **Testing** | Difficult to test comprehensively | Standard CI/CD testing |
| **Connection handling** | Connections preserved | Connections drained and re-established |
| **Production use** | Telecom, critical infrastructure | Most web applications |

## Architecture and Implementation

The hot code upgrade architecture in OTP involves several coordinated components. The release handler manages the overall upgrade process, loading new code, executing appup instructions, and handling rollback on failure. The code server manages module versions and handles the two-version coexistence model. Individual OTP behaviors (GenServer, Supervisor, GenStateMachine) implement `code_change/3` callbacks that transform process state between versions.

The appup file specifies the sequence of upgrade instructions for transitioning from one application version to another. Instructions include `{load_module, Module}` for simple code replacement, `{update, Process, {advanced, Extra}}` for processes requiring state transformation, and `{apply, {Module, Function, Args}}` for executing arbitrary upgrade logic.

In practice, the Prismatic Platform uses rolling restarts for production deployments on Fly.io, where the platform orchestrator starts new instances with the new code, waits for them to pass health checks, drains traffic from old instances, and terminates them. This approach provides the same zero-downtime guarantee with significantly lower complexity than in-place hot upgrades.

## Usage in Prismatic Platform

While production deployments use rolling restarts, the BEAM's hot code loading capability is used during development for rapid iteration and in certain administrative scenarios for live configuration changes.

```elixir
defmodule Prismatic.CodeLoader do
  @moduledoc """
  Controlled code loading utilities for development
  and administrative hot code operations. Production
  deployments use rolling restarts via Fly.io.

  Hot code loading is used for:
  - Development rapid iteration (iex> r MyModule)
  - Live configuration module updates
  - Emergency patches in critical scenarios
  """

  @spec reload_module(module()) :: {:ok, module()} | {:error, term()}
  def reload_module(module) do
    case :code.purge(module) do
      true ->
        case :code.load_file(module) do
          {:module, ^module} -> {:ok, module}
          {:error, reason} -> {:error, {:load_failed, reason}}
        end

      false ->
        {:error, :processes_still_running_old_code}
    end
  end

  @spec loaded_modules() :: list({module(), String.t()})
  def loaded_modules do
    :code.all_loaded()
    |> Enum.filter(fn {mod, _path} ->
      mod |> Atom.to_string() |> String.starts_with?("Elixir.Prismatic")
    end)
    |> Enum.map(fn {mod, path} ->
      {mod, to_string(path)}
    end)
    |> Enum.sort_by(fn {mod, _} -> mod end)
  end

  @spec check_old_code(module()) :: boolean()
  def check_old_code(module) do
    :erlang.check_old_code(module)
  end

  @spec safe_purge(module()) :: :ok | {:error, :processes_running}
  def safe_purge(module) do
    if :erlang.check_old_code(module) do
      case :code.soft_purge(module) do
        true -> :ok
        false -> {:error, :processes_running}
      end
    else
      :ok
    end
  end
end
```

During development, `iex> r PrismaticOsintCore.ToolRegistry` hot-reloads the tool registry module for rapid testing. The platform's administrative tools can hot-load configuration modules for emergency changes without full redeployment. The OSINT toolbox benefits from hot code loading when adding new tool adapters during development sessions.

## Cross-References

- [BEAM](@/glossary/beam.md) -- Virtual machine providing hot code upgrade capability
- [OTP](@/glossary/otp.md) -- Framework with code_change callbacks
- [GenServer](@/glossary/genserver.md) -- Server behavior with state migration support
- [Environment](@/glossary/environment.md) -- Deployment environment configuration
- [Health Check](@/glossary/health-check.md) -- Verification after code upgrade
- **Livebooks**: `platform_administration/` notebooks demonstrate code loading
- **Academy**: Topics on BEAM capabilities cover hot code upgrade mechanics

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
