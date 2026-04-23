+++
title = "Prismatic Manipulation"
weight = 56
[extra]
icon = "exclamation-triangle"
color = "red"
description = "Manipulation detection and social engineering analysis for defensive operations"
category = "Security"
files = "110"
status = "Development"
author = "Tomas Korcak (korczis)"
reading_time = "3 min"
word_count = 627
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Manipulation", "apps", "Security", "Prismatic Platform", "PrismaticManipulation", "Prismatic Influence", "Cialdini"]
tags = ["apps", "security", "prismatic-manipulation", "prismatic"]
quality_score = 70
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Manipulation - Prismatic Platform"
+++

## Overview

Prismatic Manipulation provides defensive analysis capabilities for detecting social engineering attempts, manipulation tactics, and deceptive communication patterns. It analyzes communication content for manipulation indicators, scoring the likelihood of deceptive intent for security awareness and [incident response](/glossary/incident-response/). While [Prismatic Influence](/apps/prismatic-influence/) operates at the strategic level of coordinated campaigns, Manipulation focuses on the tactical level -- individual communications, specific phishing attempts, and targeted social engineering against personnel.

The module implements a multi-layered detection framework based on established influence psychology research, including Cialdini's six principles of persuasion (reciprocity, commitment, social proof, authority, liking, scarcity). Each incoming communication is analyzed for the presence and intensity of these manipulation vectors, producing a structured score that security teams can use for triage. A message scoring high on authority impersonation and urgency pressure, for example, is flagged with higher confidence than one exhibiting only mild scarcity language.

Beyond detection, Manipulation serves a training function. It generates realistic but safe social engineering examples that organizations can use for security awareness training. These examples are parameterized by tactic type, sophistication level, and industry context, allowing training programs to evolve alongside the actual threat landscape rather than relying on static, easily-recognized examples.

## Architecture

```
PrismaticManipulation.Application
└── PrismaticManipulation.Supervisor (:one_for_one)
    ├── PrismaticManipulation.DetectionPipeline (GenServer)
    │   ├── NLP Preprocessor → Feature Extractor → Scoring Model
    │   └── Broadway-backed queue for high-throughput email scanning
    ├── PrismaticManipulation.TrainingGenerator (GenServer)
    │   └── Tactic spec + difficulty → synthetic communication
    ├── PrismaticManipulation.SenderReputation (GenServer)
    │   └── ETS: :sender_reputation (historical pattern cache)
    └── PrismaticManipulation.AlertEngine (GenServer)
        └── Severity classification + notification routing
```

The Detection Pipeline accepts raw communication content (emails, messages, documents), applies NLP preprocessing, extracts manipulation features using a configurable feature extractor, and scores the result using a weighted model trained on labeled social engineering datasets. The Training Generator inverts this pipeline -- given a tactic specification and difficulty level, it produces synthetic communications that exhibit those tactics for training purposes.

Both components run as supervised [GenServer](/glossary/genserver/)s with the Detection Pipeline accepting async submissions through a [Broadway](/glossary/broadway/)-backed queue for high-throughput email scanning.

## Key Modules

| Module | Purpose |
|--------|---------|
| `PrismaticManipulation` | Main API facade for detection and training |
| `PrismaticManipulation.Application` | OTP application entry point |
| `PrismaticManipulation.DetectionPipeline` | Multi-stage NLP analysis pipeline for manipulation scoring |
| `PrismaticManipulation.FeatureExtractor` | Cialdini principle extraction from communication content |
| `PrismaticManipulation.ScoringModel` | Weighted model producing manipulation likelihood scores |
| `PrismaticManipulation.TrainingGenerator` | Parameterized social engineering example generation |
| `PrismaticManipulation.SenderReputation` | Historical sender pattern analysis and baseline comparison |
| `PrismaticManipulation.AlertEngine` | Severity classification and notification dispatch |

## Configuration

```elixir
config :prismatic_manipulation,
  # Detection thresholds
  phishing_threshold: 0.7,
  social_engineering_threshold: 0.6,

  # Cialdini principle weights
  cialdini_weights: %{
    reciprocity: 0.15, commitment: 0.15,
    social_proof: 0.10, authority: 0.25,
    liking: 0.10, scarcity: 0.25
  },

  # Broadway pipeline
  broadway_concurrency: 10,
  broadway_batch_size: 50,
  broadway_batch_timeout_ms: 5_000,

  # Alert routing
  alert_channels: [:email, :webhook, :pubsub]
```

## API Reference

```elixir
# Analyze a communication for manipulation indicators
{:ok, analysis} = PrismaticManipulation.analyze(email_content,
  context: %{sender: sender_address, subject: subject_line})
# => %{manipulation_score: 0.82,
#      tactics: [:urgency, :authority_impersonation],
#      phishing: true,
#      confidence: 0.91,
#      cialdini_scores: %{authority: 0.9, scarcity: 0.7, reciprocity: 0.1}}

# Batch scan an email inbox for social engineering
{:ok, results} = PrismaticManipulation.scan_inbox(
  mailbox: "security@example.com",
  period: :last_24h,
  threshold: 0.6)

# Assess sender reputation from historical patterns
{:ok, reputation} = PrismaticManipulation.sender_reputation(email_address,
  factors: [:domain_age, :authentication, :historical_scores])

# Generate training material for security awareness
{:ok, example} = PrismaticManipulation.training_example(
  tactic: :pretexting,
  difficulty: :advanced,
  industry: :financial_services)
```

## Testing

```bash
# Run all manipulation detection tests
cd apps/prismatic_manipulation && mix test

# Run with coverage
mix test --cover

# Run detection pipeline tests
mix test test/prismatic_manipulation/detection_pipeline_test.exs

# Run feature extraction property tests
mix test test/prismatic_manipulation/feature_extractor_test.exs
```

Testing includes labeled dataset validation for detection accuracy, property-based tests (via StreamData) for feature extraction consistency, Broadway pipeline throughput tests, and sender reputation baseline comparison tests. Training generator output is validated against tactic specifications to ensure generated examples accurately exhibit the requested manipulation techniques.

## Integration Points

| Integrates With | Purpose |
|----------------|---------|
| [Prismatic Influence](/apps/prismatic-influence/) | Strategic campaign analysis complementing tactical detection |
| [Prismatic CER](/apps/prismatic-cer/) | Security incident logging for detected social engineering |
| [Prismatic Deduction](/apps/prismatic-deduction/) | Rule-based risk classification using manipulation scores |
| [Prismatic Suppression](/apps/prismatic-suppression/) | Alert noise management for high-volume scanning |
| [Prismatic Safety](/apps/prismatic-safety/) | Safety validation for training content generation |
| [Prismatic Bifurcation](/apps/prismatic-bifurcation/) | Decision tree analysis for manipulation scenario branching |

## NABLA Compliance

| NABLA Axiom | Enforcement | Implementation |
|-------------|------------|----------------|
| Signal Plurality | HARD -- detection requires multiple indicator types | Minimum 2 Cialdini principles before flagging |
| Contradiction Preservation | HARD -- conflicting signals preserved | Benign vs. malicious indicators both reported |
| Provenance Mandatory | HARD -- every detection traced to specific features | Feature → score → alert provenance chain |
| Source Independence | SOFT -- email metadata independent of content analysis | Separate sender reputation from content scoring |

Detection results are treated as intelligence signals under the NABLA framework, requiring the same confidence scoring and multi-source validation as any other platform intelligence output.

## Performance

| Metric | Value | Notes |
|--------|-------|-------|
| Single email analysis | < 200ms | NLP + feature extraction + scoring |
| Broadway batch throughput | 500+ emails/min | 10 concurrent processors |
| Sender reputation lookup | < 5ms | ETS-cached historical patterns |
| Training example generation | < 2s | Template-based with AI enhancement |
| Alert dispatch | < 10ms | Async PubSub + webhook |

## Related Resources

- [Prismatic Influence](/apps/prismatic-influence/) -- Strategic influence operation detection
- [Prismatic CER](/apps/prismatic-cer/) -- Security incident logging for detected attempts
- [Prismatic Deduction](/apps/prismatic-deduction/) -- Rule-based risk classification
- [Prismatic Suppression](/apps/prismatic-suppression/) -- Alert noise management
- [Intelligence Synthesis](/capabilities/intelligence-synthesis/) -- Cross-domain intelligence fusion
- [Color Teams](/capabilities/color-teams/) -- Adversarial simulation validating detection effectiveness
- [Real-Time Monitoring](/capabilities/real-time-monitoring/) -- Continuous communication monitoring

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)