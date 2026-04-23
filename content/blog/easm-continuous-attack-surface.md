+++
title = "EASM as a Closed Loop: Discovery, Rating, Remediation, Repeat"
date = 2026-04-09
description = "External Attack Surface Management only works as a closed loop. How Prismatic Perimeter discovers assets, rates them, feeds the decision engine, and shortens time-to-remediation from weeks to hours."

[extra]
author = "Tomáš Korcak (korczis)"
category = "security"
tags = ["easm", "perimeter", "security", "nis2", "closed-loop"]
reading_time = "8 min"
keywords = ["EASM closed loop", "attack surface management", "Prismatic Perimeter", "NIS2 compliance"]
image = "/images/blog/easm-loop.png"
featured = true
word_count = 540
date_created = "2026-04-09"
date_modified = "2026-04-09"
quality_score = 35
see_also = ["easm", "attack-surface", "nis2", "threat-intelligence", "risk-score"]
image_alt = "EASM Closed Loop: Discover, Rate, Remediate"
+++

A vulnerability scan is not security. A report is not security. Security is the closed loop between *discovering* what you own, *rating* what matters, *remediating* what's broken, and *proving* it stayed fixed. [EASM](@/glossary/easm.md) fails whenever any of those four edges break.

## The four edges

```
           ┌─────────────┐
           │  Discover   │
           └──────┬──────┘
                  ▼
           ┌─────────────┐
           │    Rate     │
           └──────┬──────┘
                  ▼
           ┌─────────────┐
           │  Remediate  │
           └──────┬──────┘
                  ▼
           ┌─────────────┐
           │   Verify    │
           └──────┬──────┘
                  │
                  └──── (loop back to Discover)
```

Most "EASM tools" are single-edge: they scan. They hand you a PDF. The remaining three edges are left to humans who then drift out of sync within a week.

## Discovery: assets you forgot you owned

Discovery starts from a seed (domain, ASN, company name) and fans out across [DNS](@/glossary/dns.md), certificate transparency, WHOIS, reverse-DNS, and passive-DNS sources. Each finding carries provenance so downstream stages know *how* it was discovered:

```elixir
%Asset{
  host: "forgotten-staging.example.com",
  source: :cert_transparency,
  first_seen: ~U[2026-04-09 03:14:00Z],
  tier: :t1,
  evidence: %{ct_log: "...", sha256: "..."}
}
```

The hard part is not finding new assets. The hard part is not forgetting old ones. Every asset discovered stays in the registry even after it disappears, because "gone" is a signal too.

## Rating: not every finding is equal

An expired cert on marketing.example.com is not the same problem as an open Redis on prod-db. Ratings combine exposure, criticality, and context:

- **Exposure** — can the internet reach it?
- **Criticality** — does a business process depend on it?
- **Context** — is the owning team on-call?

The [risk score](@/glossary/risk-score.md) is computed per finding and fed into the decision engine as a sealed envelope — so the operator dashboard can sort "what to fix first" in real time instead of arguing in a meeting.

## Remediation: tickets are a symptom

A ticket is an admission that the loop is broken. Prismatic Perimeter instead emits an *intent* — "this host should not expose port 6379" — and checks it on the next discovery pass. If the intent is satisfied, the finding closes automatically. If not, it reopens. No one manually updates status fields.

## Verification: the loop must close

Every closed finding is re-tested on a cadence appropriate to its tier. T1 findings get re-verified hourly. T4 findings get re-verified daily. A finding that silently reopens is a louder signal than a finding that never closed.

## NIS2 and why this matters now

Under [NIS2](@/glossary/nis2.md), Czech critical-infrastructure entities owe regulators a defensible answer to "what do you own, and how do you know?" A closed-loop EASM is that answer. An Excel sheet is not.

## Where to go next

- **Academy**: [EASM Development](/academy/learn/easm-development) — build the loop end-to-end
- **Academy**: [Color Team Security](/academy/learn/color-team-security) — red/blue/purple workflows
- **Glossary**: [EASM](@/glossary/easm.md), [Attack Surface](@/glossary/attack-surface.md), [NIS2](@/glossary/nis2.md), [Threat Intelligence](@/glossary/threat-intelligence.md), [Risk Score](@/glossary/risk-score.md)

Four edges. Close all of them or you do not have EASM — you have a scan.
