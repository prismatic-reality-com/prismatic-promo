+++
title = "Mix Releases for Zero-Surprise Deploys: What Ships Is What You Tested"
date = 2026-04-09
description = "A Mix release is a sealed artifact. Build it once, test it, ship the exact bytes to production. Here's the pipeline — and the three mistakes that make releases lie about what's running."

[extra]
author = "Tomáš Korcak (korczis)"
category = "engineering"
tags = ["mix", "release", "deployment", "elixir", "production"]
reading_time = "7 min"
keywords = ["Mix release Elixir", "OTP release", "zero-downtime deploy", "release artifact"]
image = "/images/blog/mix-releases.png"
word_count = 510
date_created = "2026-04-09"
date_modified = "2026-04-09"
quality_score = 34
see_also = ["release", "otp-release", "deployment", "mix", "docker"]
image_alt = "Mix Releases for Zero-Surprise Deploys"
+++

A Mix [release](@/glossary/release.md) is an artifact: a tarball containing the BEAM runtime, every compiled BEAM file, every dep, and a boot script. The machine running production does not need Elixir installed. It does not need mix. It does not need `deps.get`. It unpacks the tarball and runs the binary. That single property — the production server is not a build server — is where most "mysterious production bug" stories dissolve.

## The baseline pipeline

```bash
# Build
MIX_ENV=prod mix deps.get --only prod
MIX_ENV=prod mix compile
MIX_ENV=prod mix assets.deploy
MIX_ENV=prod mix release

# Test the release, not the dev code
_build/prod/rel/prismatic/bin/prismatic eval 'Prismatic.SmokeTest.run()'

# Ship
tar -czf prismatic.tar.gz -C _build/prod/rel prismatic
scp prismatic.tar.gz prod:/opt/
ssh prod 'tar -xzf /opt/prismatic.tar.gz && /opt/prismatic/bin/prismatic start'
```

The "ship" step is literally moving bytes. Nothing on the prod host touches source.

## Mistake 1: compile-time config that depends on runtime env

```elixir
# ❌ Captured at build time — baked into the release
config :prismatic, :api_url, System.get_env("API_URL")
```

The release is built once with whatever `API_URL` was set at build time. On the prod host, `API_URL` might be different — and the release *will not notice*. The fix is `config/runtime.exs`:

```elixir
# ✅ Evaluated at boot on the prod host
import Config
config :prismatic, :api_url, System.fetch_env!("API_URL")
```

Put every environment-dependent setting in `runtime.exs`. Not `prod.exs`. Not `config.exs`. `runtime.exs`.

## Mistake 2: `Mix.env/0` at runtime

`Mix.env/0` returns `nil` in a release because `mix` is not loaded. Code that branches on `Mix.env/0` silently takes the nil branch in prod. Every crash report eventually traces back to this one line.

The fix: move the branch to compile time using `@env Mix.env()`:

```elixir
@env Mix.env()
if @env == :prod, do: ...  # resolved at compile time, safe at runtime
```

Better yet: put the behavior in config and read config at runtime.

## Mistake 3: assets not bundled in the release

Phoenix releases need `mix assets.deploy` BEFORE `mix release`. If you skip it, the release ships with no compiled CSS/JS and the running server 404s on `/assets/app.css`. The fix is boring: run `mix assets.deploy` in CI before the release step. The `:releases` config block in `mix.exs` can enforce it via a `steps: [&assets_check/1, :assemble]` hook.

## Rolling vs blue-green

For Prismatic, blue-green beats rolling — new release starts on a new VM, health check passes, traffic cuts over, old VM shuts down. Rolling restarts in-place save VM cost but add "what version is process 12345 running?" questions to every incident. Blue-green makes the answer obvious.

## Where to go next

- **Academy**: [Development Workflow](/academy/learn/development-workflow) — the release in CI
- **Glossary**: [Release](@/glossary/release.md), [OTP Release](@/glossary/otp-release.md), [Deployment](@/glossary/deployment.md), [Mix](@/glossary/mix.md), [Docker](@/glossary/docker.md)

What ships is what you tested — if you configured the release correctly. Three mistakes break that guarantee. Avoid all three.
