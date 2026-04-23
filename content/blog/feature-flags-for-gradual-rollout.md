+++
title = "Feature Flags for Gradual Rollout: Ship the Code, Gate the Blast Radius"
date = 2026-04-09
description = "Deploy and release are different events. Feature flags let you ship code to production and enable it for 1% of users, then 10%, then everyone. Here's how Prismatic gates risky changes without branching hell."

[extra]
author = "Tomáš Korcak (korczis)"
category = "engineering"
tags = ["feature-flag", "rollout", "deployment", "patterns", "elixir"]
reading_time = "6 min"
keywords = ["feature flags Elixir", "gradual rollout", "canary deployment", "blast radius"]
image = "/images/blog/feature-flags.png"
word_count = 490
date_created = "2026-04-09"
date_modified = "2026-04-09"
quality_score = 33
see_also = ["feature-flag", "deployment", "rollback", "release", "telemetry"]
image_alt = "Feature Flags for Gradual Rollout"
+++

"Deploy" and "release" used to be the same word. They should not be. Deploying code is moving bytes to a server. Releasing a feature is enabling it for users. Collapsing the two into one event means every risky change is an all-or-nothing gamble. [Feature flags](@/glossary/feature-flag.md) separate them, and the separation is where safe rollouts actually start.

## The shape of a flag check

```elixir
defmodule PrismaticDD.Decision do
  def run(case_id) do
    if Flags.enabled?(:new_reconciliation_loop, user_id: current_user()) do
      NewReconciliation.run(case_id)
    else
      LegacyReconciliation.run(case_id)
    end
  end
end
```

Two code paths. Both fully tested. The flag picks which one runs per user. Flip the flag off and the rollback is instant — no redeploy, no revert PR.

## The four kinds of flag

Not all flags are the same, and mixing them is how flags become an unmanaged mess:

1. **Release flags.** "Is this feature on?" — short-lived, deleted once the feature reaches 100%.
2. **Experiment flags.** "Which variant does this user see?" — lives for the experiment, then deleted.
3. **Ops flags.** "Is the degraded-mode circuit tripped?" — long-lived, controlled by ops, not product.
4. **Permission flags.** "Does this tenant have access?" — long-lived, part of the access control model.

Only the first two should be temporary. The last two are not flags in the rollout sense — they are permission and control surfaces. Treating them as rollout flags is how they never get cleaned up.

## Gradual rollout strategies

- **Percentage** — `1% → 10% → 50% → 100%` over days. Simplest. Fits most features.
- **Allowlist** — specific user ids. Use for internal testers or a single partner who opted in.
- **Segment** — tenants in the EU, or accounts created after date X. Use when the feature's risk is correlated with a user property.

Every strategy needs [telemetry](@/glossary/telemetry.md) on both the "flag on" and "flag off" paths so you can compare error rates, latency, and outcomes. A flag rollout without a side-by-side metric is superstition.

## The three-week rule

> No flag lives longer than three weeks unless it is an ops or permission flag.

After three weeks, the flag is either at 100% (delete it + delete the old path) or it is at 0% (delete it + delete the new path). A flag left at 25% for six months is a liability — two code paths, both rotting, both claiming ownership. Kill them.

## Where to go next

- **Academy**: [Development Workflow](/academy/learn/development-workflow) — flags in the delivery pipeline
- **Glossary**: [Feature Flag](@/glossary/feature-flag.md), [Deployment](@/glossary/deployment.md), [Rollback](@/glossary/rollback.md), [Release](@/glossary/release.md), [Telemetry](@/glossary/telemetry.md)

Deploy is not release. Separate them, flag the risky changes, delete the flags on schedule, and bad rollouts stop being outages.
