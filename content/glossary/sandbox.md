+++
title = "Sandbox"
weight = 50
[extra]
tags = ["glossary", "security", "isolation", "testing", "red-team", "black-team", "execution-environment", "fault-isolation", "adversarial-simulation"]
description = "Sandbox environments provide isolated execution contexts that prevent untrusted or experimental code from affecting production systems. In the Prismatic Platform, sandboxing enforces strict boundaries for Red Team adversarial simulations, Black Team threat modeling, and general process isolation through BEAM VM capabilities."
category = "security"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
difficulty = "advanced"
quality_score = 95
related_terms = ["process-isolation", "red-team", "black-team", "purple-team", "color-teams", "supervision-tree", "otp", "beam-vm", "security", "testing", "adversarial-simulation", "adversarial-testing", "trinity-gate", "quality-gate"]
learning_outcomes = ["Understand sandbox architecture patterns and their security guarantees", "Implement BEAM-based process isolation for untrusted code execution", "Design Red/Black team sandbox environments with proper safety protocols", "Apply supervision tree patterns for sandbox lifecycle management", "Evaluate trade-offs between isolation strength and performance overhead"]
prerequisites = ["otp", "process-isolation", "supervision-tree", "beam-vm"]
key_concepts = ["process isolation", "memory sandboxing", "network isolation", "filesystem restrictions", "capability-based security", "adversarial simulation boundaries", "sandbox escape prevention"]
further_reading = ["BEAM VM process isolation model", "Operating system sandboxing techniques", "Container-based isolation patterns", "Capability-based security systems"]
version = "2.0.0"
date_created = "2026-02-22"
date_updated = "2026-02-22"
acronyms = ["BEAM = Bogdan/Bjorn Erlang Abstract Machine", "OTP = Open Telecom Platform", "VM = Virtual Machine", "RBAC = Role-Based Access Control"]
word_count = 1503
date_modified = "2026-02-23"
keywords = ["Sandbox", "Prismatic", "Platform", "Team", "Black", "glossary", "security", "Prismatic Platform", "Red Team", "Black Team"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Sandbox - Prismatic Platform"
+++

## Definition

A **sandbox** is a controlled, isolated execution environment that restricts the operations available to running code, preventing it from accessing or modifying resources outside its designated boundary. Sandboxing is a fundamental security primitive that enables safe execution of untrusted, experimental, or adversarial code by constraining its capabilities to a well-defined subset of system resources. The concept derives from the physical sandbox where children can play safely within contained boundaries -- in computing, the "sandbox" confines code behavior to prevent unintended or malicious side effects on the host system.

In the Prismatic Platform, sandboxing operates at multiple levels: BEAM VM process isolation provides lightweight per-process memory boundaries, OTP supervision trees manage sandbox lifecycles with automatic cleanup, and dedicated sandbox modules enforce strict safety protocols for Color Team security operations. The platform's `PrismaticDark.Sandbox` module serves as the primary isolation boundary for Red Team adversarial simulations and Black Team theoretical threat modeling, ensuring that no simulation activity can affect production state.

## Historical Context and Evolution

The concept of sandboxing has evolved significantly since its origins in early computing security research. The term gained prominence in the late 1990s with Java's security model, which used a "sandbox" to restrict applet capabilities in web browsers. Early sandboxes were coarse-grained, offering binary allow/deny decisions on broad capability categories.

The evolution progressed through several generations. First-generation sandboxes relied on language-level restrictions (Java SecurityManager, .NET Code Access Security). Second-generation approaches moved to operating system primitives (chroot, seccomp, namespaces). Third-generation sandboxes leveraged hardware-assisted virtualization (Intel VT-x, ARM TrustZone). Fourth-generation approaches combine multiple isolation layers with capability-based security models.

The BEAM virtual machine introduced a distinctive approach to isolation that predates many modern sandboxing techniques. By giving each process its own heap and garbage collector, Erlang/OTP achieved process-level isolation without relying on operating system mechanisms. This design decision, made in the 1980s for telecommunications reliability, provides natural sandboxing properties that modern platforms explicitly engineer.

## Platform Context

Within the Prismatic Platform, sandboxing serves three distinct but interconnected purposes. First, it provides **security isolation** for Color Team operations, ensuring that adversarial simulations cannot escape their designated execution contexts. Second, it enables **fault isolation** for the 115-app umbrella ecosystem, where individual application failures must not cascade across supervision boundaries. Third, it supports **experimental isolation** for the AutoEvolve system, where proposed code mutations can be evaluated safely before integration.

The platform's sandbox architecture leverages the BEAM VM's inherent isolation properties while adding application-level controls for resource limits, network access, filesystem restrictions, and inter-process communication boundaries. This multi-layered approach ensures defense in depth -- even if one isolation layer is compromised, additional boundaries prevent full sandbox escape.

```elixir
defmodule PrismaticDark.Sandbox do
  @moduledoc """
  Provides isolated execution environments for adversarial simulation
  and threat modeling operations. Enforces strict resource boundaries,
  network isolation, and filesystem restrictions.

  The Sandbox module is the primary isolation boundary for Red Team
  and Black Team operations, ensuring zero leakage to production state.

  ## Safety Guarantees

  - No network access from sandboxed processes
  - No filesystem writes outside designated temporary directories
  - Memory limits enforced per sandbox instance
  - Automatic cleanup on sandbox termination
  - Immutable audit trail for all sandbox operations
  """

  @type sandbox_id :: String.t()
  @type sandbox_opts :: [
          memory_limit: pos_integer(),
          timeout: pos_integer(),
          network: :blocked | :localhost_only,
          filesystem: :read_only | :temp_only | :blocked,
          team: :red | :black | :gray | :white
        ]
  @type sandbox_result :: {:ok, term()} | {:error, :timeout | :memory_exceeded | :policy_violation}

  @spec create(sandbox_opts()) :: {:ok, sandbox_id()} | {:error, term()}
  def create(opts \\ []) do
    with :ok <- validate_options(opts),
         {:ok, id} <- generate_sandbox_id(),
         {:ok, _pid} <- start_sandbox_supervisor(id, opts),
         :ok <- apply_resource_limits(id, opts),
         :ok <- audit_log(:sandbox_created, id, opts) do
      {:ok, id}
    end
  end

  @spec execute(sandbox_id(), (-> term())) :: sandbox_result()
  def execute(sandbox_id, func) when is_function(func, 0) do
    with :ok <- verify_sandbox_active(sandbox_id),
         :ok <- audit_log(:execution_started, sandbox_id, %{}) do
      result = execute_with_limits(sandbox_id, func)
      audit_log(:execution_completed, sandbox_id, %{status: elem(result, 0)})
      result
    end
  end

  @spec destroy(sandbox_id()) :: :ok | {:error, term()}
  def destroy(sandbox_id) do
    with :ok <- terminate_all_processes(sandbox_id),
         :ok <- cleanup_temporary_files(sandbox_id),
         :ok <- audit_log(:sandbox_destroyed, sandbox_id, %{}) do
      :ok
    end
  end

  @spec validate_options(sandbox_opts()) :: :ok | {:error, term()}
  defp validate_options(opts) do
    cond do
      Keyword.get(opts, :memory_limit, 0) > max_memory_limit() ->
        {:error, :memory_limit_exceeded}

      Keyword.get(opts, :timeout, 0) > max_timeout() ->
        {:error, :timeout_exceeded}

      true ->
        :ok
    end
  end

  defp max_memory_limit, do: 512 * 1024 * 1024
  defp max_timeout, do: 300_000
end
```

## Core Architecture

### Process-Level Isolation

The BEAM VM provides the foundation for Prismatic's sandbox architecture. Each BEAM process operates with its own private heap, message queue, and garbage collector. This means a sandboxed process cannot directly access another process's memory, preventing entire classes of security vulnerabilities including buffer overflows, use-after-free, and shared-state corruption.

```elixir
defmodule PrismaticDark.Sandbox.ProcessIsolation do
  @moduledoc """
  Manages process-level isolation within sandbox boundaries.
  Leverages BEAM VM process isolation with additional resource
  controls and monitoring.
  """

  @spec spawn_isolated((-> term()), keyword()) :: {:ok, pid()} | {:error, term()}
  def spawn_isolated(func, opts \\ []) do
    memory_limit = Keyword.get(opts, :memory_limit, 50 * 1024 * 1024)
    timeout = Keyword.get(opts, :timeout, 30_000)

    parent = self()

    pid =
      spawn(fn ->
        Process.flag(:trap_exit, true)
        Process.flag(:max_heap_size, %{size: div(memory_limit, 8), kill: true, error_logger: true})

        try do
          result = func.()
          send(parent, {:sandbox_result, self(), {:ok, result}})
        rescue
          error ->
            send(parent, {:sandbox_result, self(), {:error, error}})
        end
      end)

    monitor_ref = Process.monitor(pid)

    receive do
      {:sandbox_result, ^pid, result} ->
        Process.demonitor(monitor_ref, [:flush])
        result

      {:DOWN, ^monitor_ref, :process, ^pid, reason} ->
        {:error, {:process_died, reason}}
    after
      timeout ->
        Process.exit(pid, :kill)
        Process.demonitor(monitor_ref, [:flush])
        {:error, :timeout}
    end
  end
end
```

### Resource Limitation

Beyond process isolation, the platform enforces resource limits at the sandbox level. Memory consumption, CPU time, message queue depth, and process count are all bounded. When any limit is exceeded, the sandbox supervisor terminates the offending processes and records the violation in the audit log.

### Network Isolation

Red Team and Black Team sandboxes operate with complete network isolation. No TCP/UDP connections can be established from within the sandbox. This is enforced both at the application level (intercepting `:gen_tcp`, `:gen_udp`, and `:ssl` calls) and through operating system firewall rules when available. This prevents adversarial simulations from making external network requests that could constitute actual attacks.

### Filesystem Restrictions

Sandboxed processes can only access designated temporary directories. All filesystem operations are intercepted and validated against the sandbox's permission policy. Read-only access may be granted to specific code paths for analysis, but write operations are restricted to ephemeral temporary storage that is cleaned up on sandbox termination.

## Color Team Sandbox Architecture

The Prismatic Platform's [Color Teams](/glossary/color-teams/) rely heavily on sandboxing to maintain safety during security operations. Each team operates within specific sandbox configurations matched to their threat level and operational requirements.

### Red Team Sandbox

The [Red Team](/glossary/red-team/) sandbox is the primary environment for adversarial simulation. It provides access to synthetic data sets, simulated network topologies, and mock service endpoints. All five adversarial primitives (truth distortion, confidence manipulation, signal poisoning, drift induction, salience hijacking) execute within this boundary. The sandbox prevents any simulation from affecting production systems while providing enough fidelity for meaningful security analysis.

### Black Team Sandbox

The [Black Team](/glossary/black-team/) operates under MAXIMUM isolation -- the most restrictive sandbox configuration in the platform. Black Team sandboxes have no network access, no filesystem access beyond in-memory temporary storage, and strict memory limits. All output passes through the AbstractionFilter before leaving the sandbox, ensuring that no executable content or specific exploit instructions can escape the theoretical modeling environment.

### Gray Team Boundaries

Gray Team operations use read-only sandboxes that can examine production code and configuration but cannot modify any state. The `gray-escalation-guard` agent monitors all Gray Team sandbox activity to prevent inadvertent escalation to adversarial behavior. Any operation that would modify state triggers an immediate sandbox termination.

## Supervision Tree Integration

Sandbox lifecycle management is handled through [OTP supervision trees](/glossary/supervision-tree/), ensuring proper cleanup even when sandboxed code crashes or exceeds resource limits.

```elixir
defmodule PrismaticDark.Sandbox.Supervisor do
  @moduledoc """
  Supervises sandbox instances with proper lifecycle management.
  Uses :temporary restart strategy since sandbox processes should
  not be automatically restarted after failure.
  """

  use Supervisor

  @spec start_link(keyword()) :: Supervisor.on_start()
  def start_link(opts) do
    Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl Supervisor
  def init(_opts) do
    children = [
      {DynamicSupervisor, name: PrismaticDark.Sandbox.DynamicSupervisor, strategy: :one_for_one},
      {PrismaticDark.Sandbox.AuditLogger, []},
      {PrismaticDark.Sandbox.ResourceMonitor, []}
    ]

    Supervisor.init(children, strategy: :one_for_all)
  end
end
```

The `:temporary` restart strategy is critical for sandbox processes. Unlike production services that should be restarted on failure, a crashed sandbox represents a contained failure that should be logged and cleaned up, not restarted. The supervision tree ensures that all sandbox resources (processes, temporary files, ETS tables) are properly released when a sandbox terminates.

## Audit and Compliance

Every sandbox operation generates an immutable audit record. These records capture the sandbox creation parameters, all operations executed within the sandbox, resource consumption metrics, and termination details. The audit trail serves both security compliance requirements and provides data for improving sandbox policies.

The [Trinity Gate](/glossary/trinity-gate/) validates that sandbox-derived findings meet structural, logical, and formal consistency requirements before they can influence platform security decisions. This prevents adversarial simulation artifacts from being treated as genuine security findings without proper validation.

## Testing and Verification

Sandbox implementations are verified through property-based testing that attempts to violate isolation boundaries. These tests systematically probe for memory leaks between sandboxes, timing side channels, resource exhaustion attacks, and privilege escalation paths. The testing suite runs as part of the platform's [quality gates](/glossary/quality-gates/) to ensure sandbox integrity across releases.

```elixir
defmodule PrismaticDark.Sandbox.PropertyTest do
  @moduledoc """
  Property-based tests for sandbox isolation guarantees.
  Verifies that no operation within a sandbox can affect
  state outside the sandbox boundary.
  """

  use ExUnit.Case, async: true
  use ExUnitProperties

  @spec isolation_property() :: boolean()
  property "sandboxed processes cannot access external state" do
    check all value <- term() do
      external_ref = make_ref()
      :ets.new(:external_table, [:named_table, :public])
      :ets.insert(:external_table, {external_ref, value})

      {:ok, sandbox_id} = PrismaticDark.Sandbox.create(network: :blocked, filesystem: :blocked)

      result =
        PrismaticDark.Sandbox.execute(sandbox_id, fn ->
          try do
            :ets.lookup(:external_table, external_ref)
          rescue
            _ -> :access_denied
          end
        end)

      PrismaticDark.Sandbox.destroy(sandbox_id)
      :ets.delete(:external_table)

      assert result == {:ok, :access_denied}
    end
  end
end
```

## Performance Considerations

Sandbox creation and teardown introduce overhead that must be managed carefully. BEAM process spawning is lightweight (microseconds), but the full sandbox initialization -- including resource limit configuration, audit logging, and policy validation -- takes 1-5 milliseconds depending on the sandbox configuration. For high-frequency operations, sandbox pooling can amortize this cost by reusing cleaned sandbox instances.

The platform maintains a pool of pre-initialized sandboxes for common configurations, reducing the latency of sandbox acquisition to sub-millisecond levels. Pool management is handled by a dedicated [GenServer](/glossary/genserver/) that maintains sandbox readiness and performs background cleanup.

## Industry Comparison

Modern sandboxing approaches vary widely in their isolation guarantees and performance characteristics. Browser sandboxes (V8 Isolates, WebAssembly) provide strong isolation but limited system access. Container sandboxes (Docker, gVisor) offer operating system-level isolation with higher overhead. Language-level sandboxes (Java SecurityManager, .NET AppDomain) provide convenient but historically weaker isolation. The BEAM VM's process model occupies a unique position -- providing strong per-process isolation with minimal overhead, though without the hardware-backed guarantees of hypervisor-based approaches.

The Prismatic Platform combines BEAM process isolation with application-level security policies to achieve a practical balance between isolation strength, performance, and developer ergonomics. This approach is particularly well-suited to the platform's use case of running many short-lived adversarial simulations concurrently.

## Anti-Patterns and Common Mistakes

Several anti-patterns can undermine sandbox security. Sharing ETS tables between sandboxed and non-sandboxed processes creates information leakage channels. Using `:erlang.send/2` to communicate with processes outside the sandbox boundary bypasses message filtering. Allowing sandboxed code to spawn linked processes outside the sandbox can lead to cascading failures that escape the boundary. The platform's sandbox implementation guards against all of these patterns through supervision tree structure and message interception.

## Relationship to Platform Security Model

Sandboxing integrates with the platform's broader security architecture. The [evidence-based](/glossary/evidence/) security model uses sandbox-derived findings as one input to security assessments, but all sandbox outputs must pass through the [Trinity Gate](/glossary/trinity-gate/) before influencing decisions. The [Purple Team](/glossary/purple-team/) synthesis process correlates Red Team sandbox findings with Blue Team defensive analysis, using sandbox isolation as a trust boundary in the analysis pipeline. The [NABLA Infinity](/glossary/nabla-infinity/) framework's provenance tracking extends into sandboxes, ensuring that every finding can be traced back to its simulation context.

## Related Concepts

- [Process Isolation](/glossary/process-isolation/) -- BEAM VM memory isolation between processes
- [Red Team](/glossary/red-team/) -- Adversarial simulation team operating within sandboxes
- [Black Team](/glossary/black-team/) -- Theoretical threat modeling under MAXIMUM isolation
- [Purple Team](/glossary/purple-team/) -- Synthesis of Red-Blue findings from sandboxed operations
- [Color Teams](/glossary/color-teams/) -- Full Color Team security operations framework
- [Supervision Tree](/glossary/supervision-tree/) -- OTP process supervision for sandbox lifecycle
- [Trinity Gate](/glossary/trinity-gate/) -- Validation gate for sandbox-derived security findings
- [Quality Gates](/glossary/quality-gates/) -- Platform quality enforcement including sandbox testing
- [Adversarial Simulation](/glossary/adversarial-simulation/) -- Simulated attacks within sandbox boundaries
- [OTP](/glossary/otp/) -- Open Telecom Platform providing supervision primitives

---

**Connect & Contribute**: Created by [Tomas Korcak (korczis)](https://github.com/korczis) | [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
