+++
title = "documentation-validation-commander"
weight = 141
[extra]
domain = "documentation-quality"
level = "L3"
description = "5 Core Lean4 theorems guaranteeing safe evolution"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "seadf", "no-mercy", "meilisearch", "no-doubts", "genstage", "ets", "telemetry", "lean4"]
domain_normalized = "documentation"
content_version = "1.1.0"
last_enhanced = "2026-02-14"
word_count = 400
quality_score = 62
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["documentation-validation-commander", "Core", "Lean4", "agents", "agent", "Prismatic Platform", "Validation", "AIAD", "Phase"]
tags = ["agents", "agent", "documentation-validation-commander", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "documentation-validation-commander - Prismatic Platform"
+++

## Overview

The Documentation Validation Commander operates as an L3 [strategic command](@/glossary/strategic-command.md) agent within the Documentation Quality domain of the Prismatic Platform. This agent ensures that all platform documentation -- from inline code comments to CLAUDE.md files to promo site content -- maintains accuracy, completeness, and consistency with the actual codebase. In a platform managing over 11,300 documentation files across 90 [umbrella application](@/glossary/umbrella-application.md)s, documentation drift represents a constant threat to developer productivity and system reliability. The Documentation Validation Commander systematically eliminates this drift through continuous cross-referencing, automated validation pipelines, and five core [Lean4](@/glossary/lean4.md) theorems that formally guarantee the safety of documentation evolution alongside code evolution.

Documentation that diverges from implementation is worse than absent documentation, because it actively misleads developers and operators. When a CLAUDE.md file claims an API accepts three parameters but the implementation requires four, when a promo article describes a feature that was refactored two generations ago, when cross-references point to renamed modules -- these discrepancies compound into a pervasive trust deficit that undermines the entire documentation ecosystem. The Documentation Validation Commander addresses this by treating documentation as a first-class artifact subject to the same quality enforcement as production code.

The agent coordinates a network of validation specialists, each responsible for specific documentation formats and validation dimensions. This hierarchical approach enables the commander to maintain strategic oversight of documentation quality trends while delegating detailed verification to domain-specific agents.

## Architecture

The Documentation Validation Commander implements a hierarchical validation architecture with three operational tiers.

```
                     Documentation Validation Commander (L3)
                                    |
                 +------------------+------------------+
                 |                  |                  |
          Format Validators   Content Validators   Link Validators
          (Markdown, TOML,    (Accuracy, Currency,  (Cross-refs,
           ExDoc, YAML)        Completeness)         URLs, anchors)
                 |                  |                  |
                 +------ Aggregation Pipeline ---------+
                                    |
                              Lean4 Safety Proofs
                                    |
                            Validation Verdicts
```

**Tier 1: Format Validation.** Documents are validated against their expected structural formats. Markdown files are checked for valid TOML frontmatter, proper heading hierarchy, and consistent formatting. AIAD specifications are validated against the agent-spec or command-spec schemas. ExDoc annotations are checked for typespec consistency and example code validity.

**Tier 2: Content Validation.** The semantic accuracy of documentation content is verified against the actual codebase. Function signatures documented in ExDoc are compared against `Code.Typespec.fetch_specs/1` results. Configuration examples are validated against actual config schema. Architectural descriptions are cross-referenced against supervision tree implementations.

**Tier 3: Link Validation.** All cross-references, internal links, and external URLs are verified for validity. The Zola promo site build enforces `/path/file/` link validity at compile time, but this tier extends validation to cover ExDoc cross-references, AIAD agent references, and documentation-to-code links that exist outside the build system's scope.

The aggregation pipeline combines validation results from all three tiers and applies the five Lean4 safety theorems to verify that any proposed documentation change preserves the overall consistency invariants.

## Core Capabilities

**Cross-Reference Validation.** The commander verifies that documentation links, file references, and code examples point to existing, current resources rather than deleted or renamed targets. This capability spans the entire documentation corpus including Markdown content, ExDoc annotations, AIAD specifications, and Zola promo templates. [Meilisearch](@/glossary/meilisearch.md) integration enables full-text search validation across the documentation index, identifying semantic references that may not be explicit hyperlinks but still create implicit dependencies.

**API Documentation Accuracy.** Documented function signatures, return types, and behavior descriptions are compared against actual module typespecs and implementations using Elixir introspection (`Code.fetch_docs/1`, `Code.Typespec.fetch_specs/1`). Discrepancies between documented and actual behavior are classified by severity: signature mismatches are critical violations, while description inaccuracies are standard warnings.

**Content Quality Scoring.** Documentation files are evaluated against configurable thresholds for word count, section structure, frontmatter completeness, and cross-references. The scoring model assigns 50 points for word count adequacy (1,500+ words), 25 points for section structure (8+ sections), 15 points for frontmatter completeness (5+ extra keys), and 10 points for cross-reference density (3+ internal links). Files scoring below 75/100 are flagged for enhancement.

**Documentation Drift Detection.** The agent identifies files where documentation has not been updated to reflect recent code changes in corresponding modules. By correlating git commit timestamps between documentation files and their referenced source modules, the commander detects documentation that has fallen behind implementation changes. Drift age is measured and reported, with escalation thresholds at 7, 14, and 30 days.

**AIAD Specification Validation.** Agent and command specification files are validated against the AIAD v2.0 schema requirements, ensuring all mandatory fields are present, enforcement blocks reference valid doctrine versions, and behavioral rules are syntactically correct. Invalid specifications are blocked from the AIAD registry index.

**Lean4 Safety Theorem Verification.** Five core theorems formally guarantee that documentation evolution preserves system consistency. These theorems verify: (1) link integrity preservation under rename operations, (2) schema compatibility under format evolution, (3) content accuracy monotonicity under update operations, (4) cross-reference transitivity across document chains, and (5) temporal consistency under concurrent modification.

## Implementation

The Documentation Validation Commander is implemented as a [GenServer](@/glossary/genserver.md) with [GenStage](@/glossary/genstage.md) integration for demand-driven validation pipeline processing.

```elixir
defmodule PrismaticAgents.DocumentationValidation.Commander do
  @moduledoc """
  L3 Documentation Validation Commander - ensures documentation
  accuracy, completeness, and consistency across the entire
  platform documentation ecosystem.
  """
  use GenServer

  alias PrismaticAgents.DocumentationValidation.{
    FormatValidator,
    ContentValidator,
    LinkValidator,
    Lean4SafetyProver,
    QualityScorer
  }

  @type validation_campaign :: %{
    id: String.t(),
    scope: :full | :incremental | :targeted,
    started_at: DateTime.t(),
    status: :running | :completed | :failed,
    results: [validation_result()]
  }

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(opts) do
    schedule_incremental_validation()
    {:ok, %{
      campaigns: %{},
      drift_tracker: %{},
      quality_scores: %{},
      config: Keyword.get(opts, :config, default_config())
    }}
  end

  @spec validate_document(String.t(), keyword()) ::
    {:ok, validation_result()} | {:error, term()}
  def validate_document(path, opts \\ []) do
    GenServer.call(__MODULE__, {:validate, path, opts}, 30_000)
  end

  @spec run_campaign(:full | :incremental | :targeted, keyword()) ::
    {:ok, campaign_id :: String.t()} | {:error, term()}
  def run_campaign(scope, opts \\ []) do
    GenServer.call(__MODULE__, {:campaign, scope, opts})
  end

  @impl true
  def handle_call({:validate, path, opts}, _from, state) do
    result =
      with {:ok, format} <- FormatValidator.validate(path),
           {:ok, content} <- ContentValidator.verify_accuracy(path),
           {:ok, links} <- LinkValidator.check_all(path),
           {:ok, safety} <- Lean4SafetyProver.verify_invariants(path) do
        score = QualityScorer.compute(path, format, content, links)
        {:ok, %{
          path: path,
          format: format,
          content: content,
          links: links,
          safety: safety,
          quality_score: score,
          validated_at: DateTime.utc_now()
        }}
      end

    {:reply, result, update_scores(state, path, result)}
  end
end
```

The GenStage integration enables incremental validation campaigns that process changed documents through a demand-driven pipeline, preventing validation from overwhelming system resources during large-scale documentation updates.

## Integration Points

| Component | Integration Type | Purpose |
|-----------|-----------------|---------|
| [documentation-verifier](@/agents/documentation-verifier.md) | Verification Partner | Performs detailed document-level verification under commander directives |
| [doc-specialist](@/agents/doc-specialist.md) | Content Authority | Handles documentation content creation and revision when validation identifies gaps |
| [aiad-verification-engine](@/agents/aiad-verification-engine.md) | AIAD Validation | Validates AIAD agent specification documentation compliance |
| [Meilisearch](@/glossary/meilisearch.md) | Search Engine | Full-text search across documentation corpus for semantic cross-reference validation |
| [ETS](@/glossary/ets.md) | Cache Layer | Validation results cached for rapid re-query and drift tracking |
| [SEADF](@/glossary/seadf.md) | Quality Framework | Documentation quality metrics feed into platform-wide quality monitoring |
| [Telemetry](@/glossary/telemetry.md) | Observability | Validation campaign metrics and drift detection events |

## Operational Workflow

**Phase 1: Drift Detection.** The commander continuously monitors git commit activity across all 90 umbrella applications. When source files are modified, the commander identifies all documentation files that reference the changed modules and marks them for re-validation. This incremental approach ensures that documentation drift is detected within hours rather than discovered during manual review.

**Phase 2: Validation Campaign.** Detected drift triggers a targeted validation campaign that processes affected documents through the three-tier validation architecture. Full campaigns that validate the entire 11,300-file corpus are scheduled weekly. Emergency campaigns can be triggered manually or by other agents when critical documentation inconsistencies are reported.

**Phase 3: Severity Classification.** Validation failures are classified by severity. Critical failures (broken cross-references, API signature mismatches) trigger immediate notification and block affected documentation from publication. Warning-level failures (quality score below threshold, minor description inaccuracies) are queued for remediation during the next documentation enhancement cycle.

**Phase 4: Remediation Coordination.** The commander issues remediation directives to the documentation specialist agents, specifying exactly which documents need updates, what the current discrepancy is, and what the correct content should be based on codebase analysis. This targeted approach eliminates the need for manual investigation of validation failures.

**Phase 5: Verification Closure.** After remediation, the commander re-validates affected documents to confirm that corrections resolve the identified issues. Validation campaigns are not closed until all critical failures have been remediated and re-validated.

## NABLA Compliance

The Documentation Validation Commander enforces [NABLA Infinity](@/glossary/nabla-infinity.md) axioms specifically adapted for documentation quality assurance.

| Axiom | Documentation Enforcement |
|-------|--------------------------|
| **Signal Plurality** | Documentation accuracy claims require corroboration from at least two independent validation dimensions (format + content, content + links) |
| **Contradiction Preservation** | When documentation contradicts code, both the documented claim and the actual behavior are preserved in the validation report rather than silently resolving the discrepancy |
| **Provenance Mandatory** | Every validation verdict links to specific file paths, line numbers, and git commits that constitute the evidence base |
| **Time Decay** | Validation results carry timestamps and are automatically invalidated after configurable freshness thresholds |
| **Unknown Valid** | Documents with insufficient information for conclusive validation are classified as "inconclusive" rather than assumed valid |

## Configuration

```elixir
config :prismatic_agents, PrismaticAgents.DocumentationValidation.Commander,
  # Quality scoring thresholds
  quality_pass_threshold: 75,
  word_count_target: 1_500,
  section_count_target: 8,
  frontmatter_keys_target: 5,
  crossref_count_target: 3,

  # Drift detection
  drift_warning_threshold_days: 7,
  drift_critical_threshold_days: 30,
  incremental_scan_interval_minutes: 60,
  full_campaign_interval_hours: 168,

  # Lean4 safety proofs
  lean4_proof_timeout_ms: 60_000,
  skip_lean4_for_non_critical: true,

  # Remediation
  auto_remediate_minor: false,
  notification_channels: [:telemetry, :audit_log]
```

## Performance

| Metric | Target | Description |
|--------|--------|-------------|
| **Incremental Scan** | < 30s | Time to identify drift in recently changed files |
| **Full Campaign** | < 15 min | Complete validation of 11,300+ documentation files |
| **Single Document** | < 200ms | Three-tier validation for one document |
| **Drift Detection Latency** | < 1 hour | Time from code change to documentation drift alert |
| **False Positive Rate** | < 2% | Valid documentation incorrectly flagged as drifted |
| **Remediation Closure** | < 48 hours | Time from critical failure detection to verified fix |

## Related Resources

- [**documentation-verifier**](@/agents/documentation-verifier.md) (L3) - Performs detailed code-comment consistency checking and return type documentation verification
- [**doc-specialist**](@/agents/doc-specialist.md) (L3) - Handles documentation content creation and revision under commander directives
- [**aiad-verification-engine**](@/agents/aiad-verification-engine.md) - Validates AIAD agent specification documentation compliance
- [**document-authentication-specialist**](@/agents/document-authentication-specialist.md) (L3) - Verifies document provenance and integrity, complementing content validation with authenticity assurance
- [Lean4 Formal Verification](@/glossary/lean4.md) - Theorem proving framework used for documentation safety invariant proofs

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)