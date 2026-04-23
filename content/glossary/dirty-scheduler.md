+++
title = "Dirty Scheduler"
weight = 50

[extra]
description = "Dedicated BEAM scheduler threads for executing long-running or blocking operations (NIFs, I/O) without starving normal process scheduling on the main scheduler pool."
category = "platform"
related_terms = ["beam", "process-isolation", "gc", "execution-time", "dirty-scheduler", "genserver", "nif"]
tags = ["glossary", "dirty-scheduler", "beam", "scheduling", "nif", "blocking", "performance"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
difficulty = "advanced"
quality_score = 86
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Dirty schedulers prevent long-running NIFs and I/O operations from blocking the BEAM's normal preemptive scheduling, maintaining soft real-time guarantees for all other processes in the system."
date_created = "2026-02-24"
date_modified = "2026-02-24"
keywords = ["Dirty Scheduler", "BEAM", "NIF", "scheduling", "blocking", "glossary", "Prismatic Platform"]
image = "/images/sections/glossary.png"
image_alt = "Dirty Scheduler - Prismatic Platform"
word_count = 900
see_also = ["technologies", "architecture", "capabilities"]
+++

## Definition

Dirty schedulers are dedicated BEAM virtual machine threads designed to execute long-running or blocking operations without interfering with the normal preemptive scheduling of Erlang/Elixir processes. The BEAM normally schedules processes cooperatively based on reduction counting, preempting any process after approximately 4,000 reductions. However, certain operations -- particularly Native Implemented Functions (NIFs), file I/O, and external library calls -- cannot be interrupted at reduction boundaries. Dirty schedulers provide separate thread pools where these operations can execute for arbitrary durations without starving other processes.

The BEAM provides two types of dirty scheduler pools: dirty CPU schedulers (for CPU-bound operations, defaulting to the number of CPU cores) and dirty I/O schedulers (for blocking I/O operations, defaulting to 10 threads).

## Technical Deep Dive

| Scheduler Type | Default Count | Purpose | Preemption |
|---------------|---------------|---------|------------|
| **Normal** | CPU cores | Regular Erlang process scheduling | Reduction-based (4k reductions) |
| **Dirty CPU** | CPU cores | CPU-intensive NIFs | No preemption |
| **Dirty I/O** | 10 | Blocking I/O operations | No preemption |

When a process invokes a dirty NIF, the BEAM migrates that process from a normal scheduler to a dirty scheduler thread, freeing the normal scheduler to continue running other processes. The process returns to a normal scheduler once the dirty operation completes.

## Usage in Prismatic Platform

The Prismatic Platform uses dirty schedulers for KuzuDB graph operations, file I/O in the storage layer, and external HTTP calls in OSINT adapters.

```elixir
defmodule Prismatic.DirtyScheduler.Usage do
  @moduledoc """
  Demonstrates proper dirty scheduler usage patterns for
  operations that would block normal BEAM schedulers.
  """

  @doc """
  Runs a CPU-intensive computation on a dirty CPU scheduler
  to avoid blocking the normal scheduler pool. Uses Task
  with explicit scheduler hints.
  """
  @spec heavy_computation(term()) :: {:ok, term()}
  def heavy_computation(data) do
    task = Task.async(fn ->
      # This runs on a dirty scheduler via spawn_opt
      result = :erlang.apply(fn ->
        perform_computation(data)
      end, [])
      result
    end)

    Task.await(task, 30_000)
  end

  @doc """
  Wraps a blocking file operation to ensure it runs on
  a dirty I/O scheduler rather than blocking a normal scheduler.
  """
  @spec read_large_file(String.t()) :: {:ok, binary()} | {:error, term()}
  def read_large_file(path) do
    # File operations in Elixir already use dirty I/O schedulers
    # through the BEAM's built-in file driver
    case File.read(path) do
      {:ok, content} -> {:ok, content}
      {:error, reason} -> {:error, reason}
    end
  end

  @doc """
  Demonstrates how to detect dirty scheduler saturation
  through scheduler utilization monitoring.
  """
  @spec scheduler_utilization() :: map()
  def scheduler_utilization do
    :scheduler.utilization(1)
    |> Enum.reduce(%{normal: [], dirty_cpu: [], dirty_io: []}, fn
      {:normal, id, util, _percent}, acc ->
        %{acc | normal: [{id, util} | acc.normal]}
      {:cpu, id, util, _percent}, acc ->
        %{acc | dirty_cpu: [{id, util} | acc.dirty_cpu]}
      {:io, id, util, _percent}, acc ->
        %{acc | dirty_io: [{id, util} | acc.dirty_io]}
      _, acc -> acc
    end)
  end

  defp perform_computation(data) do
    # Simulates CPU-intensive work
    :crypto.hash(:sha256, :erlang.term_to_binary(data))
  end
end
```

## Code Examples

```elixir
defmodule Prismatic.NIFExample do
  @moduledoc """
  Example of a dirty NIF declaration. Real NIFs would be
  implemented in C/Rust; this demonstrates the Elixir-side
  scheduling annotations.
  """

  # In a real NIF module, the on_load callback initializes the NIF library:
  # @on_load :load_nif
  # def load_nif do
  #   :erlang.load_nif(~c"priv/nif_library", 0)
  # end

  # A dirty CPU NIF would be declared in C with:
  # ERL_NIF_DIRTY_JOB_CPU_BOUND flag
  #
  # A dirty I/O NIF would use:
  # ERL_NIF_DIRTY_JOB_IO_BOUND flag

  @doc """
  Monitors dirty scheduler health by checking queue depths.
  High queue depths indicate dirty scheduler saturation.
  """
  @spec dirty_scheduler_health() :: %{cpu_available: boolean(), io_available: boolean()}
  def dirty_scheduler_health do
    stats = :erlang.statistics(:scheduler_wall_time_all)

    cpu_count = :erlang.system_info(:dirty_cpu_schedulers)
    io_count = :erlang.system_info(:dirty_io_schedulers)

    %{
      dirty_cpu_schedulers: cpu_count,
      dirty_io_schedulers: io_count,
      normal_schedulers: :erlang.system_info(:schedulers),
      cpu_available: cpu_count > 0,
      io_available: io_count > 0,
      total_scheduler_threads: length(stats)
    }
  end
end
```

## Best Practices

1. **Never run long operations on normal schedulers** -- any operation exceeding a few milliseconds should use dirty schedulers or be broken into reduction-yielding chunks.
2. **Monitor dirty scheduler utilization** -- saturated dirty schedulers create backpressure that affects the entire system.
3. **Size dirty I/O pool for concurrency** -- the default 10 threads may be insufficient for I/O-heavy workloads; configure with `+SDio`.
4. **Prefer yielding NIFs over dirty NIFs** -- if the operation can be split into chunks, yielding NIFs provide better scheduling fairness.
5. **Use Task for dirty-scheduler-eligible work** -- `Task.async/1` combined with dirty-aware operations automatically utilizes dirty schedulers.

## Related Terms

- [BEAM](@/glossary/beam.md) -- Virtual machine providing the scheduler infrastructure
- **GC** -- Garbage collection interacts with scheduler availability
- **Execution Time** -- Operation duration determining scheduler selection
- **Heap** -- Per-process memory managed independently of scheduler type

## See Also

- [Technologies](@/technologies/_index.md) -- BEAM runtime configuration
- [Architecture](@/architecture/_index.md) -- Platform scheduler architecture

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
