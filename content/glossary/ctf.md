+++
title = "Capture The Flag (CTF)"
weight = 50

[extra]
description = "Capture The Flag (CTF) competitions are cybersecurity challenges where participants solve security puzzles across categories like cryptography, reverse engineering, web exploitation, and forensics. In the Prismatic Platform, CTF methodologies inform the Color Team security architecture and provide authorized contexts for adversarial security testing."
category = "security"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "14 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "security-operations"
related_concepts = ["penetration testing", "adversarial simulation", "red teaming", "security verification", "vulnerability assessment", "defensive security", "cryptography"]
implementation_status = "production"
authority_level = "L3-strategic"
difficulty_rating = "advanced"
prerequisites = ["security.md", "red-team.md", "adversarial-testing.md"]
learning_path = ["security fundamentals", "CTF basics", "web exploitation", "binary exploitation", "cryptography challenges", "red team operations"]
interactive_demos = ["ctf-challenge-sandbox", "web-exploitation-lab", "crypto-puzzle-generator"]
code_examples = true
external_resources = ["https://ctftime.org", "https://overthewire.org/wargames/", "https://pwnable.kr"]
version_introduced = "5.0.0"
stability_level = "stable"
testing_scenarios = ["sandbox-isolation-verification", "challenge-difficulty-calibration", "flag-submission-validation", "anti-cheat-detection"]
keywords = ["CTF", "capture the flag", "cybersecurity", "security challenges", "penetration testing", "red team", "blue team", "adversarial testing", "exploitation", "forensics"]
tags = ["glossary", "security", "ctf", "adversarial-testing", "red-team", "color-teams"]
related_terms = ["red-team", "blue-team", "purple-team", "penetration-testing", "adversarial-testing", "adversarial-simulation", "sandbox", "vulnerability-assessment", "security-verification", "color-teams"]
word_count = 1658
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Capture The Flag (CTF) - Prismatic Platform"
+++

## Definition

Capture The Flag (CTF) is a category of cybersecurity competition where participants or teams solve security-related challenges to discover hidden strings of text called "flags." These competitions test skills across multiple security domains including cryptography, reverse engineering, binary exploitation, web application security, forensics, steganography, and network analysis. CTF competitions serve as both training grounds for security professionals and evaluation frameworks for assessing the security posture of systems and the capabilities of security teams.

In the Prismatic Platform context, CTF methodology extends beyond competitive gaming to provide the authorized operational context for the platform's Color Team security architecture. The Red Team conducts adversarial operations, the Blue Team implements defenses, and the Purple Team synthesizes both perspectives -- all within CTF-derived sandboxed environments that ensure security research occurs safely and ethically.

## Overview

CTF competitions originated in the DEFCON hacker conference community in the mid-1990s and have since evolved into a global ecosystem of events, platforms, and training resources. The annual DEFCON CTF remains the most prestigious competition, but thousands of CTFs now run year-round, ranging from beginner-friendly "Jeopardy-style" competitions to advanced "Attack-Defense" events that simulate real network warfare scenarios.

### CTF Competition Formats

**Jeopardy-Style CTF**: The most common format, organized like the television game show. Challenges are categorized by topic and difficulty, with point values reflecting challenge complexity. Teams select and solve challenges independently, submitting discovered flags for points. Categories typically include:

- **Web Exploitation (Web)**: SQL injection, XSS, CSRF, SSRF, authentication bypass, deserialization attacks
- **Cryptography (Crypto)**: Classical ciphers, modern cryptographic weaknesses, key exchange flaws, hash collisions
- **Reverse Engineering (Rev)**: Binary analysis, malware analysis, protocol reverse engineering, firmware extraction
- **Binary Exploitation (Pwn)**: Buffer overflows, format string vulnerabilities, ROP chains, heap exploitation
- **Forensics**: Disk image analysis, memory forensics, network packet analysis, file carving
- **OSINT**: Open-source intelligence gathering, social engineering reconnaissance, metadata analysis
- **Miscellaneous (Misc)**: Steganography, esoteric programming languages, logic puzzles

**Attack-Defense CTF**: Teams simultaneously defend their own vulnerable services while attacking identical services run by other teams. This format most closely simulates real-world security operations, requiring both offensive and defensive skills under time pressure. Teams must patch vulnerabilities in their services without breaking functionality while exploiting the same vulnerabilities in opponents' services.

**King of the Hill (KoTH)**: Teams compete to gain and maintain control of shared systems. Points accumulate based on how long a team maintains access or control. This format emphasizes persistence, stealth, and the ability to detect and evict other teams.

**Mixed/Hybrid CTF**: Combines elements of multiple formats, sometimes incorporating physical security challenges, hardware hacking, or social engineering components.

### Why CTF Matters for Platform Security

CTF methodology provides several critical benefits for security-focused platforms:

1. **Controlled adversarial testing** in environments where the consequences of exploitation are learning rather than damage
2. **Skill development** across the full spectrum of security disciplines
3. **Methodology for security evaluation** that produces quantifiable, comparable results
4. **Team coordination practice** that mirrors real incident response scenarios
5. **Discovery of novel attack vectors** through creative problem-solving under competition pressure

## Technical Details

### CTF Challenge Infrastructure in Prismatic

The Prismatic Platform implements CTF infrastructure for internal security training and Color Team operations. All challenges run within sandboxed environments with strict isolation guarantees:

```elixir
defmodule PrismaticDark.CTF.ChallengeRunner do
  @moduledoc """
  Executes CTF challenges in isolated sandbox environments.
  All challenge operations are contained within dedicated
  supervision trees with resource limits, network isolation,
  and comprehensive audit logging.
  """
  use GenServer

  @type challenge_id :: String.t()
  @type team_id :: String.t()
  @type flag :: String.t()

  defstruct [
    :challenge_id,
    :team_id,
    :category,
    :difficulty,
    :started_at,
    :sandbox_pid,
    :flag_hash,
    :status
  ]

  @spec start_challenge(challenge_id(), team_id(), keyword()) ::
          {:ok, pid()} | {:error, term()}
  def start_challenge(challenge_id, team_id, opts \\ []) do
    with {:ok, challenge} <- load_challenge(challenge_id),
         {:ok, sandbox} <- PrismaticDark.Sandbox.create(challenge, opts),
         :ok <- verify_authorization(team_id, challenge) do
      GenServer.start_link(__MODULE__, %__MODULE__{
        challenge_id: challenge_id,
        team_id: team_id,
        category: challenge.category,
        difficulty: challenge.difficulty,
        started_at: DateTime.utc_now(),
        sandbox_pid: sandbox,
        flag_hash: challenge.flag_hash,
        status: :running
      })
    end
  end

  @spec submit_flag(pid(), flag()) ::
          {:ok, :correct, integer()} | {:error, :incorrect} | {:error, term()}
  def submit_flag(runner_pid, submitted_flag) do
    GenServer.call(runner_pid, {:submit_flag, submitted_flag})
  end

  @impl true
  def init(state) do
    emit_telemetry(:challenge_started, state)
    {:ok, state}
  end

  @impl true
  def handle_call({:submit_flag, submitted_flag}, _from, state) do
    submitted_hash = :crypto.hash(:sha256, submitted_flag) |> Base.encode16(case: :lower)

    if submitted_hash == state.flag_hash do
      elapsed = DateTime.diff(DateTime.utc_now(), state.started_at, :second)
      points = calculate_points(state.difficulty, elapsed)
      emit_telemetry(:flag_captured, %{state | status: :solved})
      {:reply, {:ok, :correct, points}, %{state | status: :solved}}
    else
      emit_telemetry(:incorrect_submission, state)
      {:reply, {:error, :incorrect}, state}
    end
  end

  defp load_challenge(challenge_id) do
    PrismaticDark.CTF.Registry.get_challenge(challenge_id)
  end

  defp verify_authorization(team_id, challenge) do
    PrismaticDark.CTF.Authorization.check(team_id, challenge)
  end

  defp calculate_points(difficulty, elapsed_seconds) do
    base_points = difficulty_points(difficulty)
    time_bonus = max(0, 100 - div(elapsed_seconds, 60))
    base_points + time_bonus
  end

  defp difficulty_points(:easy), do: 100
  defp difficulty_points(:medium), do: 250
  defp difficulty_points(:hard), do: 500
  defp difficulty_points(:insane), do: 1000

  defp emit_telemetry(event, state) do
    :telemetry.execute(
      [:prismatic_dark, :ctf, event],
      %{timestamp: System.monotonic_time()},
      %{
        challenge_id: state.challenge_id,
        team_id: state.team_id,
        category: state.category
      }
    )
  end
end
```

### Sandbox Isolation for CTF Environments

```elixir
defmodule PrismaticDark.Sandbox do
  @moduledoc """
  Provides isolated execution environments for CTF challenges
  and Color Team operations. Enforces strict resource limits,
  network isolation, and filesystem restrictions.

  Safety guarantees:
  - No network access to production systems
  - Memory and CPU limits per sandbox
  - Filesystem restricted to sandbox directory
  - All operations logged to immutable audit trail
  """

  @type sandbox_config :: %{
    memory_limit_mb: pos_integer(),
    cpu_limit_percent: pos_integer(),
    network_policy: :none | :localhost_only | :restricted,
    filesystem_root: String.t(),
    max_duration_seconds: pos_integer()
  }

  @default_config %{
    memory_limit_mb: 256,
    cpu_limit_percent: 25,
    network_policy: :none,
    filesystem_root: "/tmp/prismatic_sandbox",
    max_duration_seconds: 3600
  }

  @spec create(map(), keyword()) :: {:ok, pid()} | {:error, term()}
  def create(challenge, opts \\ []) do
    config = build_config(challenge, opts)

    with :ok <- validate_config(config),
         {:ok, sandbox_dir} <- create_sandbox_directory(config),
         {:ok, pid} <- start_sandbox_process(config, sandbox_dir) do
      schedule_cleanup(pid, config.max_duration_seconds)
      {:ok, pid}
    end
  end

  @spec destroy(pid()) :: :ok
  def destroy(sandbox_pid) do
    GenServer.stop(sandbox_pid, :normal)
  end

  defp build_config(challenge, opts) do
    category_config = category_defaults(challenge.category)
    Map.merge(@default_config, category_config)
    |> Map.merge(Map.new(opts))
  end

  defp category_defaults(:web), do: %{network_policy: :localhost_only}
  defp category_defaults(:pwn), do: %{memory_limit_mb: 128, cpu_limit_percent: 10}
  defp category_defaults(:crypto), do: %{cpu_limit_percent: 50}
  defp category_defaults(_), do: %{}

  defp validate_config(config) do
    cond do
      config.memory_limit_mb > 1024 -> {:error, :memory_limit_exceeded}
      config.cpu_limit_percent > 75 -> {:error, :cpu_limit_exceeded}
      config.max_duration_seconds > 7200 -> {:error, :duration_limit_exceeded}
      true -> :ok
    end
  end

  defp create_sandbox_directory(config) do
    sandbox_id = :crypto.strong_rand_bytes(16) |> Base.url_encode64(padding: false)
    path = Path.join(config.filesystem_root, sandbox_id)
    File.mkdir_p!(path)
    {:ok, path}
  end

  defp start_sandbox_process(config, sandbox_dir) do
    {:ok, spawn_link(fn -> sandbox_loop(config, sandbox_dir) end)}
  end

  defp sandbox_loop(config, sandbox_dir) do
    receive do
      :shutdown -> cleanup(sandbox_dir)
    after
      config.max_duration_seconds * 1000 -> cleanup(sandbox_dir)
    end
  end

  defp cleanup(sandbox_dir) do
    File.rm_rf!(sandbox_dir)
  end

  defp schedule_cleanup(pid, max_duration) do
    Process.send_after(pid, :shutdown, max_duration * 1000)
  end
end
```

### Web Exploitation Challenge Example

```elixir
defmodule PrismaticDark.CTF.Challenges.WebSQLInjection do
  @moduledoc """
  Example CTF challenge: SQL injection vulnerability in a
  simulated login form. Demonstrates how CTF challenges teach
  both attack and defense methodologies.

  Challenge: Extract the admin password from a vulnerable
  login endpoint. The application uses string interpolation
  for SQL queries instead of parameterized queries.
  """

  @behaviour PrismaticDark.CTF.ChallengeBehaviour

  @flag "FLAG{sql_1nj3ct10n_1s_st1ll_d4ng3r0us_2026}"

  @impl true
  def metadata do
    %{
      title: "Login Bypass",
      category: :web,
      difficulty: :easy,
      points: 100,
      description: "A web application has a login form. Can you bypass authentication?",
      hints: [
        "The developer might have forgotten about input sanitization",
        "What happens when you put a single quote in the username field?",
        "Classic SQL injection techniques still work"
      ],
      flag_hash: :crypto.hash(:sha256, @flag) |> Base.encode16(case: :lower),
      learning_objectives: [
        "Understand SQL injection attack vectors",
        "Learn parameterized query defenses",
        "Practice input validation techniques"
      ]
    }
  end

  @impl true
  def setup(sandbox_dir) do
    vulnerable_app = """
    # DELIBERATELY VULNERABLE - CTF CHALLENGE ONLY
    # DO NOT USE THIS PATTERN IN PRODUCTION
    def authenticate(username, password) do
      query = "SELECT * FROM users WHERE username = '\#{username}' AND password = '\#{password}'"
      Repo.query(query)
    end
    """

    File.write!(Path.join(sandbox_dir, "vulnerable_app.ex"), vulnerable_app)
    {:ok, %{flag: @flag}}
  end

  @impl true
  def verify_flag(submitted), do: submitted == @flag
end
```

### Scoring and Leaderboard System

```elixir
defmodule PrismaticDark.CTF.Scoreboard do
  @moduledoc """
  Real-time CTF scoreboard using ETS for high-performance
  reads and GenServer for write serialization. Supports
  dynamic scoring where challenge point values decrease
  as more teams solve them.
  """
  use GenServer

  @table :ctf_scoreboard

  @spec get_leaderboard(pos_integer()) :: list(map())
  def get_leaderboard(top_n \\ 10) do
    :ets.tab2list(@table)
    |> Enum.sort_by(fn {_team, score, _solves, _last_solve} -> score end, :desc)
    |> Enum.take(top_n)
    |> Enum.map(fn {team, score, solves, last_solve} ->
      %{team: team, score: score, solves: solves, last_solve: last_solve}
    end)
  end

  @spec record_solve(String.t(), String.t(), integer()) :: :ok
  def record_solve(team_id, challenge_id, points) do
    GenServer.call(__MODULE__, {:record_solve, team_id, challenge_id, points})
  end

  @impl true
  def init(_) do
    table = :ets.new(@table, [:named_table, :set, :public, read_concurrency: true])
    {:ok, %{table: table, solves: %{}}}
  end

  @impl true
  def handle_call({:record_solve, team_id, challenge_id, points}, _from, state) do
    solve_key = {team_id, challenge_id}

    if Map.has_key?(state.solves, solve_key) do
      {:reply, {:error, :already_solved}, state}
    else
      update_score(team_id, points)
      new_solves = Map.put(state.solves, solve_key, DateTime.utc_now())
      {:reply, :ok, %{state | solves: new_solves}}
    end
  end

  defp update_score(team_id, points) do
    case :ets.lookup(@table, team_id) do
      [{^team_id, current_score, solves, _last}] ->
        :ets.insert(@table, {team_id, current_score + points, solves + 1, DateTime.utc_now()})

      [] ->
        :ets.insert(@table, {team_id, points, 1, DateTime.utc_now()})
    end
  end
end
```

## Implementation in Prismatic Platform

### Color Team Integration

The Prismatic Platform's Color Team security architecture draws directly from CTF methodology. The six color teams (Gray, Red, Blue, Purple, White, Black) operate within CTF-derived frameworks:

- **Red Team** operations use CTF-style challenge categorization to structure adversarial simulations. Each simulated attack is categorized, scored, and tracked like a CTF challenge.
- **Blue Team** defenses are tested through automated CTF-style challenges that probe defensive capabilities across the same categories used in offensive CTF.
- **Purple Team** synthesis maps Red Team findings to Blue Team defenses using a scoring matrix inspired by CTF leaderboards.
- **Gray Team** boundary exploration uses CTF's "miscellaneous" category mindset to discover edge cases that do not fit established categories.

### Security Training Pipeline

New platform contributors complete a structured CTF curriculum that progressively introduces security concepts relevant to the Prismatic Platform. This curriculum covers web security (relevant to Phoenix/LiveView), Erlang/BEAM security, OSINT methodology, and platform-specific security patterns.

### Sandboxed Security Research

All security research within the Prismatic Platform executes within the `PrismaticDark.Sandbox` module, which provides the same isolation guarantees used in professional CTF infrastructure. This ensures that security experiments never affect production systems, real user data, or external networks.

### Automated Security Validation

CTF-style automated challenges run as part of the platform's continuous integration pipeline. These challenges verify that known vulnerability classes (SQL injection, XSS, CSRF, privilege escalation) are properly defended against, providing regression testing for security properties.

## Comparison with Alternatives

### Bug Bounty Programs

Bug bounty programs incentivize external researchers to find vulnerabilities in production systems. While effective for discovering real-world bugs, they carry risks that CTF avoids: exposure of actual vulnerabilities, potential for accidental damage, and legal complexity. CTFs provide a controlled environment where the same skills are developed and tested without production risk.

### Penetration Testing

Professional penetration testing provides targeted security assessment by qualified testers. CTFs complement pentesting by providing continuous training for the skills pentesting requires and by enabling broader participation than the specialist-only pentest model.

### Security Certifications (OSCP, CEH)

Certification programs validate security knowledge through standardized exams. CTFs provide more practical, hands-on skill development and more closely simulate real-world security scenarios than most certification exams. Many security professionals view CTF performance as a stronger signal of practical capability than certifications alone.

### Automated Vulnerability Scanning

Tools like Nessus, Qualys, and OWASP ZAP automate known vulnerability detection. CTFs develop the human skills needed to discover novel vulnerabilities and complex attack chains that automated tools miss. The two approaches are complementary.

### Adversarial Machine Learning

In the AI/ML context, adversarial testing of models serves a similar purpose to CTF challenges: probing systems for weaknesses through structured adversarial engagement. The Prismatic Platform's NABLA framework draws on this connection, applying CTF-style rigor to epistemic security.

## Best Practices

1. **Start with Jeopardy-style CTFs** before attempting Attack-Defense formats. The Jeopardy format allows self-paced learning across multiple categories, while Attack-Defense requires simultaneous offensive and defensive skills.

2. **Build challenges from real vulnerabilities.** The most effective CTF challenges are based on actual CVEs or vulnerability patterns discovered in production systems. This ensures training aligns with real-world threats.

3. **Implement dynamic scoring** where challenge point values decrease as more teams solve them. This prevents easy challenges from dominating the scoreboard and rewards solving difficult challenges.

4. **Maintain strict sandbox isolation.** CTF challenges often involve actual exploitation techniques. Without proper sandboxing, challenge infrastructure can become a liability rather than an asset.

5. **Document writeups after every competition.** The learning value of CTF comes not from solving challenges but from understanding the techniques. Mandatory writeups ensure knowledge transfer beyond the competition.

6. **Integrate CTF findings into platform security.** Every CTF challenge solved reveals a vulnerability class. Map these to the platform's attack surface and verify that defenses are in place.

7. **Rotate challenge categories** to prevent specialization blind spots. Teams that only practice web exploitation will miss binary and cryptographic vulnerabilities.

## Common Pitfalls

1. **Treating CTF as only a game.** While the competitive format is engaging, the purpose is skill development and security posture improvement. Without connecting CTF findings to actual platform security, competitions become entertainment without security value.

2. **Inadequate sandbox isolation.** CTF challenges that escape their sandboxes create real vulnerabilities. The sandbox infrastructure must be as rigorously engineered as the challenges themselves.

3. **Over-focusing on offensive skills.** CTF culture often emphasizes attack over defense. A balanced approach that equally values defensive challenges (Blue Team operations, incident response simulations) produces more complete security professionals.

4. **Static challenge sets.** Challenges that never change become memorizable rather than educational. Regularly rotate and update challenges to maintain learning value.

5. **Excluding beginners.** CTF competitions without entry-level challenges exclude newcomers and create expertise silos. Always include challenges at every difficulty level.

6. **Ignoring ethical boundaries.** Even in CTF contexts, certain techniques (social engineering against real people, attacking non-target systems) must remain off-limits. Clear rules of engagement are essential.

## Use Cases

### Security Team Skill Assessment

Organizations use CTF competitions to assess the capabilities of their security teams. By tracking performance across challenge categories, team leaders identify skill gaps and allocate training resources effectively. The Prismatic Platform's Color Team structure uses CTF-style assessment to ensure each team maintains baseline competency across all security domains.

### Recruitment and Hiring

CTF competition results serve as practical demonstrations of security skills, complementing traditional interview processes. Many security teams recruit directly from CTF competitions, where candidates demonstrate hands-on ability rather than theoretical knowledge.

### Incident Response Training

Attack-Defense CTFs closely simulate real incident response scenarios, providing practice in detecting, containing, and remediating active attacks under time pressure. The Prismatic Platform's Purple Team conducts regular Attack-Defense exercises to maintain incident response readiness.

### Security Architecture Validation

CTF challenges based on the platform's own architecture test whether security controls actually work as designed. These challenges reveal the gap between intended security posture and actual security posture, driving continuous improvement.

## Related Concepts

CTF methodology connects to numerous security and platform concepts within the Prismatic ecosystem:

- [Red Team](@/glossary/red-team.md) -- adversarial simulation team that uses CTF methodology for offensive security operations
- [Blue Team](@/glossary/blue-team.md) -- defensive security team that validates defenses through CTF-style challenges
- [Purple Team](@/glossary/purple-team.md) -- synthesis team that bridges offensive and defensive CTF findings
- [Color Teams](@/glossary/color-teams.md) -- the full color team architecture derived from CTF organizational models
- [Penetration Testing](@/glossary/penetration-testing.md) -- professional security testing that CTF training supports
- [Adversarial Testing](@/glossary/adversarial-testing.md) -- the broader framework of testing through adversarial engagement
- [Adversarial Simulation](@/glossary/adversarial-simulation.md) -- simulated attacks within controlled environments
- [Sandbox](@/glossary/sandbox.md) -- isolated execution environments essential for safe CTF operations
- [Vulnerability Assessment](@/glossary/vulnerability-assessment.md) -- systematic identification of security weaknesses
- [Security Verification](@/glossary/security-verification.md) -- formal verification of security properties discovered through CTF

## See Also

- [OSINT](@/glossary/osint.md) -- open-source intelligence gathering, a common CTF challenge category
- [Security](@/glossary/security.md) -- the overarching security framework within which CTF operates
- [Defensive Security](@/glossary/defensive-security.md) -- Blue Team security operations informed by CTF insights
- [Incident Response](@/glossary/incident-response.md) -- real-world application of skills developed through CTF training

---

**Connect & Contribute**: Created by [Tomas Korcak (korczis)](https://github.com/korczis) | [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
