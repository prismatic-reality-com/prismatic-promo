+++
title = "/prolog"
weight = 1710
[extra]
category = "Formal Verification"
description = "Prolog-based logical reasoning and inference operations"
syntax = "/prolog [options]"
authority = "L2+"
agent = "prolog-reasoning-agent"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1069
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["prolog", "Prolog-based", "commands", "Formal Verification", "Prismatic Platform", "NABLA", "AIAD", "The Prolog"]
tags = ["commands", "formal-verification", "prolog", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/prolog - Prismatic Platform"
+++

## Overview

**/prolog** is a production command in the **[Formal Verification](/glossary/formal-verification/)** category of the Prismatic Platform that provides Prolog-based logical reasoning and [inference](/glossary/inference/) operations for epistemic analysis, rule evaluation, and constraint solving. The command interfaces with an embedded Prolog engine to evaluate logical queries against knowledge bases derived from platform state, agent configurations, and security policies.

Prolog's declarative logic programming paradigm is uniquely suited to the Prismatic Platform's epistemic architecture, where beliefs, contradictions, and inference chains must be formally reasoned about. The command enables operators to express complex queries about system state using first-order predicate logic, evaluate policy compliance rules, and derive conclusions from the platform's knowledge graph without writing imperative code.

This command operates under the **L2+** authority level and is executed by the `prolog-reasoning-agent` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The Prolog engine is integrated into the platform's [QEVE](/glossary/qeve/) (Quantified Epistemic Verification Engine) framework alongside [Lean4](/glossary/lean4/) for formal proofs and Monte Carlo methods for probabilistic analysis.

The command supports both interactive query sessions and batch evaluation of Prolog programs. Knowledge bases can be loaded from files, generated from platform state, or constructed dynamically from AIAD agent configurations. Results are returned as structured bindings with provenance tracking, satisfying the [NABLA](/glossary/nabla-infinity/) Provenance Mandatory axiom.

## Architecture

The Prolog reasoning system integrates with the platform's formal verification pipeline through a layered architecture.

```
User Query / Prolog Program
         |
         v
+-------------------+
| Query Parser      |
| (Prolog syntax)   |
+-------------------+
         |
         v
+-------------------+     +-------------------+
| Knowledge Base    |<--->| Platform State    |
| Manager           |     | Extractor         |
+-------------------+     +-------------------+
         |
         v
+-------------------+
| Prolog Engine     |
| (SWI-Prolog/erlog)|
+-------------------+
         |
         v
+-------------------+     +-------------------+
| Result Formatter  |---->| Provenance        |
|                   |     | Tracker           |
+-------------------+     +-------------------+
```

| Component | Responsibility |
|-----------|----------------|
| **Query Parser** | Parses Prolog syntax, validates clause structure |
| **Knowledge Base Manager** | Loads, merges, and indexes fact databases |
| **Platform State Extractor** | Converts platform state to Prolog facts |
| **Prolog Engine** | Executes unification, backtracking, and resolution |
| **Result Formatter** | Structures bindings into platform-compatible output |
| **Provenance Tracker** | Records inference chains for NABLA compliance |

## Usage

### Interactive Queries

```bash
# Start an interactive Prolog session
/prolog

# Query agent relationships
/prolog --query "agent_authority(Agent, Level), Level >= 3."

# Evaluate policy compliance
/prolog --query "compliant(Module, Policy) :- has_spec(Module), has_tests(Module)."

# Check dependency cycles
/prolog --query "depends_on(A, B), depends_on(B, A)."
```

### Knowledge Base Operations

```bash
# Load a knowledge base from file
/prolog --load /path/to/knowledge_base.pl

# Generate knowledge base from platform state
/prolog --generate-kb --source agents

# Load multiple knowledge bases
/prolog --load agents.pl --load policies.pl --query "violates(Agent, Policy)."
```

### Batch Evaluation

```bash
# Execute a Prolog program file
/prolog --file /path/to/program.pl

# Evaluate with specific goal
/prolog --file rules.pl --goal "verify_all_agents."

# Export results as JSON
/prolog --file analysis.pl --goal "find_issues(Issues)." --format json
```

### Epistemic Reasoning

```bash
# Evaluate belief consistency
/prolog --epistemic --query "believes(system, Prop), believes(system, not(Prop))."

# Check signal plurality
/prolog --epistemic --query "signal_count(Belief, Count), Count < 2."

# Trace inference chains
/prolog --trace --query "conclusion(X) :- premise(A), premise(B), derives(A, B, X)."
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--query` | `string` | `nil` | Prolog query to evaluate |
| `--file` | `string` | `nil` | Path to Prolog program file |
| `--load` | `string` | `nil` | Path to knowledge base file (repeatable) |
| `--goal` | `string` | `nil` | Top-level goal to evaluate in loaded program |
| `--generate-kb` | `boolean` | `false` | Generate knowledge base from platform state |
| `--source` | `string` | `all` | State source for KB generation: agents, policies, modules, all |
| `--format` | `json \| text \| prolog` | `text` | Output format for results |
| `--trace` | `boolean` | `false` | Enable inference chain tracing |
| `--epistemic` | `boolean` | `false` | Enable epistemic reasoning mode with NABLA axioms |
| `--max-solutions` | `integer` | `100` | Maximum number of solutions to return |
| `--timeout` | `integer` | `30000` | Query timeout in milliseconds |
| `--verbose` | `boolean` | `false` | Show detailed engine execution information |

## Execution Flow

1. **Input Parsing** -- The command parses the provided query or program file, validating Prolog syntax and clause structure. Syntax errors are reported with line numbers and context.

2. **Knowledge Base Loading** -- If `--load` or `--generate-kb` is specified, the knowledge base is constructed. Platform state extraction converts agent definitions, policy rules, and module metadata into Prolog facts.

3. **Engine Initialization** -- The Prolog engine is initialized with the loaded knowledge base. Built-in predicates for platform operations are registered (e.g., `has_spec/1`, `agent_authority/2`, `module_app/2`).

4. **Query Evaluation** -- The query or goal is submitted to the engine. Unification and backtracking proceed according to standard Prolog semantics. If `--trace` is enabled, each resolution step is logged.

5. **Solution Collection** -- Solutions are collected up to `--max-solutions`. Each solution includes variable bindings and, when tracing is enabled, the inference chain that produced it.

6. **Provenance Annotation** -- Each result is annotated with provenance information: which facts contributed, which rules fired, and the confidence level based on source reliability.

7. **Output Formatting** -- Results are formatted according to `--format` and emitted. JSON output includes structured bindings; Prolog output uses standard term notation.

## Integration Points

| System | Integration | Purpose |
|--------|-------------|---------|
| [QEVE](/glossary/qeve/) | Prolog component of the verification engine | Logical verification |
| [Lean4](/glossary/lean4/) | Formal proofs complement Prolog inference | Formal verification |
| [NABLA](/glossary/nabla-infinity/) | Epistemic axiom enforcement during reasoning | Epistemics |
| [Color Teams](/glossary/color-teams/) | Policy rule evaluation for security operations | Security |
| [Quality Gates](/glossary/quality-gates/) | Logic-based quality rule evaluation | Quality |
| [Prismatic Agents](/glossary/prismatic-agents/) | Agent knowledge base generation | Knowledge source |
| [Trinity Gate](/glossary/trinity-gate/) | Logical Consistency layer (Gate 2) | Verification |

The Prolog engine provides the rule-based reasoning layer of the [Trinity Gate](/glossary/trinity-gate/) verification system. Specifically, it serves as the Logical Consistency gate, ensuring that propositions derived from platform state follow valid logical rules before they can be accepted as established claims.

## Best Practices

1. **Scope knowledge bases** -- Load only the facts relevant to your query. Loading the entire platform state as a knowledge base creates unnecessary search space and slows query resolution.

2. **Use cuts judiciously** -- When writing Prolog rules for platform analysis, use the cut operator (`!`) to prune unnecessary backtracking branches, but document why each cut is placed.

3. **Timeout protection** -- Always set reasonable timeouts for complex queries. Recursive rules without proper base cases can cause infinite loops in the Prolog engine.

4. **Prefer ground queries** -- Fully ground queries (all variables bound) execute faster than open queries. When exploring, start with constrained queries and broaden gradually.

5. **Trace for debugging** -- Use `--trace` when results are unexpected. The inference chain often reveals incorrect rule ordering or missing facts that cause unification failures.

6. **Version knowledge bases** -- Store knowledge base files in version control alongside the rules they encode. This enables regression testing of logical reasoning as the platform evolves.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `{:error, :syntax_error, line}` | Invalid Prolog syntax in query or program | Check syntax at the indicated line number |
| `{:error, :undefined_predicate, pred}` | Query references a predicate not in the knowledge base | Load the appropriate knowledge base or define the predicate |
| `{:error, :timeout}` | Query exceeded the timeout threshold | Increase `--timeout` or simplify the query |
| `{:error, :stack_overflow}` | Infinite recursion in rule evaluation | Add base cases or use tail-recursive rule formulations |
| `{:error, :kb_generation_failed}` | Platform state extraction failed | Check that the specified `--source` modules are compiled and loaded |

## Advanced Usage

### Custom Built-in Predicates

```prolog
% Platform-aware predicates available in all sessions
has_spec(Module) :- module_info(Module, specs, Specs), length(Specs, N), N > 0.
agent_authority(Agent, Level) :- agent_config(Agent, authority, Level).
app_module(App, Module) :- module_info(Module, app, App).
quality_score(App, Score) :- quality_dna(App, current_score, Score).
```

### Policy Verification

```prolog
% Verify all agents comply with authority policy
verify_authority_policy :-
    forall(
        (agent(A), agent_authority(A, Level), required_authority(A, Required)),
        Level >= Required
    ).

% Find agents with insufficient authority
authority_violation(Agent, Has, Needs) :-
    agent(Agent),
    agent_authority(Agent, Has),
    required_authority(Agent, Needs),
    Has < Needs.
```

### Integration with Lean4

```bash
# Use Prolog to find candidates, Lean4 to prove properties
/prolog --query "candidate(X), needs_proof(X)." --format json | \
  /lean --prove-from-stdin
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Prolog queries must terminate within the specified timeout. Undefined predicates are errors, not silent failures.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every inference chain is traceable through provenance tracking. No conclusion is accepted without verifiable logical derivation.

The command directly implements [NABLA](/glossary/nabla-infinity/) axioms: Provenance Mandatory (all results traced to source facts), Signal Plurality (multiple derivation paths weighted higher), and Contradiction Preservation (contradictory conclusions are reported, not suppressed).

## Related Commands

- [/lean](/commands/lean/) - Execute Lean 4 code or prove a theorem with the lean-specialist agent
- [/formal-verify](/commands/formal-verify/) - Formal verification of system properties and invariants
- [/monte-carlo](/commands/monte-carlo/) - Monte Carlo simulation for probabilistic analysis and risk assessment
- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](/commands/quality-enforce/) - Mandatory progressive [quality debt](/glossary/quality-debt/) elimination with AIAD enforcement
- [/regression-check](/commands/regression-check/) - Execute 25 custom [Credo](/glossary/credo/) regression checks preventing 700+ violations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)