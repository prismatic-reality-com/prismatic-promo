+++
title = "/git-forensics"
weight = 730
[extra]
category = "Intelligence"
description = "Cynical git history analysis distinguishing signal from noise and progress from activity"
syntax = "/git-forensics [options]"
authority = "L2+"
agent = "git-forensics-specialist"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1146
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["git-forensics", "Cynical", "commands", "Intelligence", "Prismatic Platform", "NABLA", "During", "Analysis", "Focus"]
tags = ["commands", "intelligence", "git-forensics", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/git-forensics - Prismatic Platform"
+++

## Overview

**/git-forensics** is a production command in the **Intelligence** category of the Prismatic Platform that performs cynical, evidence-based analysis of git repository histories to distinguish genuine progress from mere activity, substantive changes from cosmetic churn, and real collaboration from performative workflow compliance. Where standard git analytics tools produce flattering dashboards of commit counts and contribution graphs, git forensics applies skeptical analysis to reveal what actually happened in a codebase's history.

This command operates under the **L2+** authority level and is executed by the `git-forensics-specialist` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The forensics approach treats git history as an evidence corpus subject to the same rigorous analysis standards that the [NABLA](/glossary/nabla-infinity/) framework applies to all epistemic claims.

Git forensics serves multiple purposes within the Prismatic ecosystem. During M&A due diligence, it assesses the true health and development velocity of target codebases. During security investigations, it detects suspicious patterns such as credential commits, unauthorized changes, or systematic backdoor insertion. During development process improvement, it identifies workflow friction, knowledge silos, and quality regression patterns.

## Architecture

The forensics engine operates as a multi-pass analysis pipeline that progressively builds deeper understanding of repository history.

### Analysis Pipeline

```
Git Repository -> History Extraction -> Statistical Analysis -> Pattern Detection
                       |                      |                       |
                       v                      v                       v
                 Raw Commit Data        Aggregated Metrics      Forensic Findings
                 Diff Statistics        Time Series Data        Anomaly Reports
                 Author Metadata        Distribution Analysis   Risk Assessments
                                              |
                                              v
                                    Synthesis & Reporting
```

### Analysis Domains

| Domain | What It Reveals | Key Metrics |
|--------|----------------|-------------|
| **Commit Authenticity** | Real work vs. gaming metrics | Net code change ratio, revert frequency |
| **Knowledge Distribution** | Bus factor and knowledge silos | Author file exclusivity, review coverage |
| **Temporal Patterns** | Work patterns and deadline pressure | Commit timing distribution, sprint boundary clustering |
| **Change Coupling** | Hidden dependencies | Files that always change together |
| **Code Churn** | Instability indicators | Lines added then removed within N commits |
| **Security Signals** | Credential leaks and suspicious patterns | Secret patterns, force push frequency, history rewrites |
| **Quality Trajectory** | Quality improvement or degradation | Test-to-code ratio trend, warning count trajectory |

### Forensic Evidence Model

Every forensic finding is structured as an evidence-backed claim with provenance, following the platform's [NABLA](/glossary/nabla-infinity/) epistemic framework.

```elixir
%ForensicFinding{
  claim: "Repository shows signs of deadline-driven quality shortcuts",
  evidence: [
    %Evidence{source: "commit_timing", data: "67% of commits in last 3 days of sprint"},
    %Evidence{source: "test_ratio", data: "test-to-code ratio drops 40% in sprint final days"},
    %Evidence{source: "revert_rate", data: "23% of sprint-final commits reverted within 5 days"}
  ],
  confidence: 0.87,
  severity: :high,
  recommendation: "Implement sprint buffer and mandatory test-first policy"
}
```

## Usage

```bash
# Full forensic analysis of current repository
/git-forensics

# Analyze a specific time period
/git-forensics --since="2025-06-01" --until="2026-01-01"

# Focus on security-relevant patterns
/git-forensics --mode=security

# Analyze knowledge distribution and bus factor
/git-forensics --mode=knowledge

# Examine code churn and instability
/git-forensics --mode=churn

# Investigate a specific file's history
/git-forensics --file="apps/prismatic_web/lib/prismatic_web/router.ex"

# Compare two branches forensically
/git-forensics --compare=main..feature/new-feature

# Generate report for M&A due diligence
/git-forensics --mode=due-diligence --format=markdown --output=forensics-report.md

# Analyze with author focus
/git-forensics --author="developer@example.com"

# Quick anomaly scan
/git-forensics --quick --anomalies-only
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--since` | date | repo creation | Start date for analysis window |
| `--until` | date | now | End date for analysis window |
| `--mode` | string | comprehensive | Analysis mode: comprehensive, security, knowledge, churn, due-diligence |
| `--file` | string | all files | Focus analysis on specific file path |
| `--compare` | string | none | Branch comparison (branch1..branch2) |
| `--author` | string | all authors | Filter by author email |
| `--format` | string | text | Output format: text, json, markdown |
| `--output` | string | stdout | Write report to file |
| `--quick` | flag | false | Abbreviated analysis (recent history only) |
| `--anomalies-only` | flag | false | Report only anomalous findings |
| `--confidence-threshold` | float | 0.6 | Minimum confidence for reported findings |
| `--verbose` | flag | false | Include per-commit detail in findings |

## Execution Flow

1. **Repository Access**: The forensics specialist connects to the target git repository, verifying access and determining the scope of available history. For large repositories, [Git Trees](/commands/git-trees/) infrastructure provides optimized access.

2. **History Extraction**: Commit logs, diff statistics, author metadata, branch history, and tag information are extracted in a single pass through the repository history.

3. **Statistical Baseline**: Baseline statistics are computed including commit frequency distribution, average change size, author contribution patterns, and file modification frequencies.

4. **Multi-Domain Analysis**: Each analysis domain (authenticity, knowledge, temporal, coupling, churn, security, quality) runs its detection algorithms against the extracted data.

5. **Anomaly Detection**: Statistical outliers and pattern deviations are identified by comparing individual data points against the computed baseline. Z-score analysis identifies commits, authors, or files that deviate significantly from the norm.

6. **Cross-Domain Correlation**: Findings from different analysis domains are correlated to identify compound patterns. For example, high code churn combined with deadline-clustering and reduced test ratios forms a compound finding of "deadline-driven quality regression."

7. **Evidence Synthesis**: Each finding is structured as an evidence-backed claim with specific supporting data points, confidence scores, and severity ratings.

8. **Report Generation**: Findings are compiled into a structured forensics report organized by severity, with executive summary, detailed findings, supporting evidence, and recommendations.

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `git-forensics-specialist` | Specialized forensics analysis agent |
| [Git Trees](/commands/git-trees/) | Optimized data extraction | ~100x faster repository access |
| [/dx-brutalist-analysis](/commands/dx-brutalist-analysis/) | Complementary DX analysis | Developer experience insights |
| [/investigate](/commands/investigate/) | Parent investigation suite | Forensics as investigation component |
| [NABLA Framework](/glossary/nabla-infinity/) | Evidence model | All findings follow epistemic standards |
| [Quality Gates](/glossary/quality-gates/) | Quality trajectory | Historical quality metric correlation |
| [Telemetry](/glossary/telemetry/) | Execution [metrics](/glossary/metrics/) | Analysis performance tracking |
| [M&A Operations](/commands/ma-analyze/) | Due diligence input | Codebase health assessment for deals |

## Best Practices

**Analyze trends, not snapshots.** A single anomalous commit is noise. A persistent pattern across weeks or months is signal. Focus on trends in the forensic data rather than individual data points.

**Contextualize findings.** High code churn might indicate instability, or it might indicate healthy refactoring. High force-push frequency might indicate sloppy practices, or it might indicate active use of interactive rebase for clean history. Always interpret findings in context.

**Use for process improvement, not blame.** The cynical analysis style is designed to cut through comfortable narratives about development health, not to target individuals. Focus forensic findings on systemic improvements.

**Combine with DX analysis.** [/dx-brutalist-analysis](/commands/dx-brutalist-analysis/) focuses on developer experience patterns, while git forensics focuses on evidence of what actually happened. Together they provide a complete picture of development health.

**Verify security findings immediately.** Any security-relevant finding (credential commits, suspicious force pushes, unexplained binary additions) should be investigated and remediated immediately, regardless of confidence score.

**Establish baselines early.** Run forensics analysis early in a project's lifecycle to establish normal patterns. Subsequent analyses are far more valuable when compared against an established baseline.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `insufficient_history` | Repository has too few commits for meaningful analysis | Expand analysis window or use `--quick` |
| `git_access_denied` | Insufficient permissions for repository access | Verify git credentials and repository permissions |
| `large_repository_timeout` | Analysis of very large repository exceeded timeout | Use `--since` to limit analysis window or `--quick` mode |
| `branch_not_found` | `--compare` references non-existent branch | Verify branch names with `git branch -a` |
| `file_not_in_history` | `--file` path not found in repository history | Check path spelling and verify file exists in git history |
| `correlation_overflow` | Too many findings to correlate efficiently | Increase `--confidence-threshold` to filter low-confidence findings |

## Advanced Usage

### M&A Due Diligence Package

Generate a comprehensive codebase health report for acquisition due diligence.

```bash
/git-forensics --mode=due-diligence --format=markdown \
  --output=forensics-dd-report.md \
  --verbose --confidence-threshold=0.5
```

The due diligence report includes: codebase health score, knowledge distribution analysis, bus factor assessment, code quality trajectory, security risk indicators, and technical debt estimation.

### Automated Security Scanning

Integrate forensics into the CI/CD pipeline for continuous security monitoring.

```bash
# CI pipeline security check
/git-forensics --mode=security --quick --format=json \
  --confidence-threshold=0.8 --anomalies-only
```

### Change Coupling Analysis

Identify hidden dependencies between files that always change together.

```bash
/git-forensics --mode=churn --extract=coupling-matrix --format=json
```

### Historical Timeline Reconstruction

Build a comprehensive timeline of significant events in a repository's history.

```bash
/git-forensics --mode=comprehensive --extract=timeline \
  --since="2024-01-01" --format=markdown
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for comfortable illusions about codebase health. The forensic analysis reports exactly what the evidence shows, without diplomatic softening.
- **NO DOUBTS**: Full investigation before conclusions. Every finding is backed by specific evidence with confidence scoring and source provenance per [NABLA](/glossary/nabla-infinity/) standards.

## Related Commands

- [/investigate](/commands/investigate/) - Launch comprehensive [OSINT](/glossary/osint/) investigation across 121+ sources
- [/dx-brutalist-analysis](/commands/dx-brutalist-analysis/) - Developer experience brutalist analysis of git history
- [/git-trees](/commands/git-trees/) - Git tree-based codebase exploration at ~100x speed improvement
- [/email-osint](/commands/email-osint/) - Email-based OSINT gathering with breach correlation and social profiling
- [/ma-analyze](/commands/ma-analyze/) - Comprehensive M&A analysis including financial, legal and operational review
- [/google-hacking](/commands/google-hacking/) - Google dorking and advanced search intelligence extraction

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)