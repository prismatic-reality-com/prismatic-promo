+++
title = "Dispatch"
weight = 50

[extra]
description = "Mechanism for routing requests, events, or messages to appropriate handlers based on pattern matching, module resolution, or dynamic lookup in registries."
category = "platform"
related_terms = ["genserver", "plug", "router", "adapter-pattern", "event", "message-passing", "protocol"]
tags = ["glossary", "dispatch", "routing", "pattern-matching", "handler", "registry"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
difficulty = "intermediate"
quality_score = 84
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "The Prismatic API uses generic dispatch to route REST requests to any discovered Prismatic facade module function, eliminating per-endpoint controller code through dynamic module and function resolution."
date_created = "2026-02-24"
date_modified = "2026-02-24"
keywords = ["Dispatch", "routing", "pattern matching", "handler", "glossary", "Prismatic Platform", "API"]
image = "/images/sections/glossary.png"
image_alt = "Dispatch - Prismatic Platform"
word_count = 880
see_also = ["capabilities", "architecture", "apps"]
+++

## Definition

Dispatch is the mechanism by which a system routes incoming requests, events, or messages to the appropriate handler for processing. In functional programming, dispatch most commonly occurs through pattern matching, where the structure and values of the input determine which function clause executes. In larger systems, dispatch may involve registry lookups, protocol resolution, or dynamic module selection. The power of dispatch lies in its ability to decouple the sender of a request from the specific handler, enabling extensible architectures where new handlers can be added without modifying dispatch logic.

## Technical Deep Dive

| Dispatch Type | Mechanism | Binding Time | Prismatic Usage |
|--------------|-----------|-------------|-----------------|
| **Pattern Match** | Function clause matching | Compile-time | GenServer callbacks |
| **Protocol** | Data type dispatch | Compile + Runtime | Encoding, formatting |
| **Behaviour** | Module callback dispatch | Compile-time | Storage adapters |
| **Registry** | ETS-based module lookup | Runtime | OSINT tools, DD sources |
| **Dynamic** | `apply/3` with module resolution | Runtime | API generic dispatch |
| **PubSub** | Topic-based fan-out | Runtime | Event distribution |

## Usage in Prismatic Platform

The Prismatic API's generic dispatch controller resolves `{app, action}` tuples to specific module function calls at runtime, enabling automatic REST API exposure for all Prismatic facade modules.

```elixir
defmodule PrismaticApi.DispatchController do
  @moduledoc """
  Generic dispatch controller that routes REST API requests
  to discovered Prismatic facade module functions. Resolves
  {app, action} pairs through the endpoint registry and
  executes the target function with safe argument application.
  """

  use PrismaticApi, :controller

  @spec dispatch(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def dispatch(conn, %{"app" => app, "action" => action} = params) do
    with {:ok, endpoint} <- resolve_endpoint(app, action),
         {:ok, args} <- extract_args(params, endpoint),
         {:ok, result} <- safe_apply(endpoint.module, endpoint.function, args) do
      conn
      |> put_status(200)
      |> json(%{status: "ok", data: result})
    else
      {:error, :not_found} ->
        conn |> put_status(404) |> json(%{error: "Endpoint not found"})
      {:error, reason} ->
        conn |> put_status(500) |> json(%{error: inspect(reason)})
    end
  end

  defp resolve_endpoint(app, action) do
    case PrismaticApi.EndpointRegistry.lookup(app, action) do
      nil -> {:error, :not_found}
      endpoint -> {:ok, endpoint}
    end
  end

  defp extract_args(params, endpoint) do
    args = Enum.map(endpoint.params, fn param_name ->
      Map.get(params, to_string(param_name))
    end)
    {:ok, args}
  end

  defp safe_apply(module, function, args) do
    try do
      result = apply(module, function, args)
      {:ok, result}
    rescue
      error -> {:error, error}
    end
  end
end
```

## Code Examples

```elixir
defmodule Prismatic.EventDispatcher do
  @moduledoc """
  Event dispatch engine that routes domain events to
  registered handlers based on event type and priority.
  Supports synchronous and asynchronous dispatch modes.
  """

  use GenServer

  @type handler :: {module(), atom()}
  @type event :: %{type: atom(), payload: term(), metadata: map()}

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec register_handler(atom(), handler()) :: :ok
  def register_handler(event_type, handler) do
    GenServer.call(__MODULE__, {:register, event_type, handler})
  end

  @spec dispatch(event()) :: :ok
  def dispatch(event) do
    GenServer.cast(__MODULE__, {:dispatch, event})
  end

  @impl GenServer
  def init(_opts) do
    {:ok, %{handlers: %{}}}
  end

  @impl GenServer
  def handle_call({:register, event_type, handler}, _from, state) do
    handlers = Map.update(state.handlers, event_type, [handler], &[handler | &1])
    {:reply, :ok, %{state | handlers: handlers}}
  end

  @impl GenServer
  def handle_cast({:dispatch, event}, state) do
    handlers = Map.get(state.handlers, event.type, [])

    Enum.each(handlers, fn {module, function} ->
      Task.start(fn -> apply(module, function, [event]) end)
    end)

    {:noreply, state}
  end
end
```

## Best Practices

1. **Prefer pattern matching over conditional dispatch** -- Elixir's multi-clause functions provide cleaner, more maintainable dispatch than `case` or `cond` chains.
2. **Use registries for extensible dispatch** -- ETS-backed registries allow adding new handlers without modifying dispatch logic.
3. **Validate inputs before dispatch** -- ensure dispatch targets exist and arguments are valid before invoking handlers.
4. **Implement safe_apply for dynamic dispatch** -- wrap `apply/3` in try/rescue to prevent crashes from invalid module/function combinations.
5. **Use PubSub for fan-out dispatch** -- when an event needs to reach multiple handlers, PubSub provides decoupled distribution.

## Related Terms

- [GenServer](/glossary/genserver/) -- OTP behaviour with message dispatch through pattern-matched callbacks
- [Plug](/glossary/plug/) -- HTTP request dispatch through composable pipelines
- **Event** -- Domain events routed through dispatch mechanisms
- [Adapter Pattern](/glossary/adapter-pattern/) -- Module-level dispatch for backend selection

## See Also

- [Architecture](/architecture/) -- Platform dispatch architecture
- [Apps](/apps/) -- Applications using dispatch patterns

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
