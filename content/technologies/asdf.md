+++
title = "asdf"
weight = 92
[extra]
category = "tools"
description = "Extendable version manager supporting multiple language runtimes through a plugin system"
url = "https://asdf-vm.com"
version = "0.14+"
icon = "asdf"
color = "purple"
status = "active"
reading_time = "8 min"
author = "Tomas Korcak (korczis)"
word_count = 1129
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["asdf", "Extendable", "technologies", "tools", "Prismatic Platform", "Erlang", "Elixir", "Node", "Docker"]
tags = ["technologies", "tools", "asdf", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "asdf - Prismatic Platform"
+++

## Overview

asdf is the version manager that ensures consistent runtime versions across all Prismatic Platform development environments. It manages [Elixir](/technologies/elixir/), [Erlang/OTP](/technologies/erlang-otp/), Node.js, and other tool versions through a single interface, using a `.tool-versions` file that is committed to the repository to guarantee all developers and CI systems use identical versions. In a platform with 90 umbrella applications and complex native dependencies, runtime version consistency is not optional -- it is a prerequisite for reproducible builds.

The Prismatic Platform's `.tool-versions` file specifies exact versions for Elixir (1.19+), Erlang (27+), and Node.js (used for [TailwindCSS](/technologies/tailwindcss/) asset compilation and the promo site build tooling). When a developer clones the repository and runs `asdf install`, they get exactly the same runtime versions as every other developer and the CI/CD pipeline, eliminating the "works on my machine" problem entirely. This determinism is critical for a platform that enforces zero compilation warnings and zero [Dialyzer](/technologies/dialyzer/) violations -- even minor version differences can introduce spurious warnings or behavioral changes.

asdf's plugin system supports hundreds of tools and runtimes, making it a universal version manager that replaces tool-specific managers like nvm, rbenv, and kerl with a single, consistent interface. For the Prismatic Platform, this means one tool manages both the Erlang VM compilation and the Node.js version for frontend tooling, with consistent shim-based version switching that activates automatically when entering the project directory. The platform's onboarding process relies on asdf to reduce new developer setup from hours of manual version matching to a single `asdf install` command.

## Key Features

asdf provides a unified version management experience that scales from individual developer machines to CI/CD infrastructure.

- **Multi-Runtime**: Single tool for Elixir, Erlang, Node.js, Rust, and 500+ community plugins covering virtually any toolchain
- **Project-Local Versions**: `.tool-versions` file for per-project version pinning, committed to [Git](/technologies/git/) for team-wide consistency
- **Plugin System**: Extensible with community-maintained plugins for virtually any runtime or tool, with standardized lifecycle hooks
- **Shims**: Transparent version switching based on the current directory -- no manual `source` or `use` commands needed
- **Legacy Support**: Reads `.nvmrc`, `.ruby-version`, and similar files for compatibility with other tools and mixed-toolchain projects
- **Global/Local**: Global default versions with per-directory overrides for multi-project workflows on the same machine
- **CI Integration**: `.tool-versions` is read by CI pipelines to install exact versions, ensuring build reproducibility across environments
- **Hermetic Builds**: Each project can use different versions without conflicts, even when working on multiple projects simultaneously

| Runtime | Plugin | Platform Version | Purpose |
|---------|--------|-----------------|---------|
| Erlang | asdf-erlang | 27.0 | [BEAM](/technologies/beam/) virtual machine |
| Elixir | asdf-elixir | 1.19.0-otp-27 | Primary programming language |
| Node.js | asdf-nodejs | 20.11.0 | TailwindCSS compilation, Zola tooling |

## Platform Integration

asdf ensures consistent tool versions across all development environments. The `.tool-versions` file pins every runtime used by the platform, serving as the single source of truth for version requirements.

```bash
# .tool-versions - Prismatic Platform
erlang 27.0
elixir 1.19.0-otp-27
nodejs 20.11.0
```

Developer setup is a single command sequence after cloning the repository:

```bash
# One-time plugin installation
asdf plugin add erlang https://github.com/asdf-vm/asdf-erlang.git
asdf plugin add elixir https://github.com/asdf-vm/asdf-elixir.git
asdf plugin add nodejs https://github.com/asdf-vm/asdf-nodejs.git

# Install all pinned versions
asdf install

# Verify versions match the platform requirements
asdf current
# erlang  27.0     (set by /path/to/prismatic-platform/.tool-versions)
# elixir  1.19.0   (set by /path/to/prismatic-platform/.tool-versions)
# nodejs  20.11.0  (set by /path/to/prismatic-platform/.tool-versions)
```

In GitLab CI/CD, the same `.tool-versions` file drives the CI environment setup, ensuring the build uses identical versions to what developers test locally:

```yaml
# .gitlab-ci.yml excerpt
before_script:
  - asdf install
  - mix local.hex --force
  - mix local.rebar --force
  - mix deps.get
```

## Architecture

asdf's architecture is based on shims -- lightweight wrapper scripts that intercept runtime commands and redirect them to the correct version. This approach is transparent to the application and requires no changes to how tools are invoked.

| Component | Function | Location |
|-----------|----------|----------|
| Core | Plugin management, shim generation | `~/.asdf/` |
| Plugins | Runtime-specific install/uninstall logic | `~/.asdf/plugins/` |
| Installs | Compiled runtime binaries | `~/.asdf/installs/` |
| Shims | Version-dispatching wrapper scripts | `~/.asdf/shims/` |
| `.tool-versions` | Project-local version declarations | Repository root |

The version resolution order is: shell variable > `.tool-versions` in current directory > `.tool-versions` in parent directories > `~/.tool-versions` global default. This hierarchy means a developer can temporarily override a version for debugging without modifying the committed file.

```
Command invocation: `elixir --version`
  |
  v
Shim (~/.asdf/shims/elixir)
  |
  v
Version resolution (.tool-versions -> 1.19.0-otp-27)
  |
  v
Actual binary (~/.asdf/installs/elixir/1.19.0-otp-27/bin/elixir)
```

## Performance Characteristics

asdf's shim-based approach introduces minimal overhead per command invocation. The version lookup is a fast file traversal operation that typically completes in under 10ms.

| Operation | Typical Duration | Notes |
|-----------|-----------------|-------|
| Shim dispatch overhead | < 10ms | Per command invocation |
| `asdf current` | < 50ms | Version display for all plugins |
| `asdf install elixir` | 2-5 minutes | One-time per version (downloads precompiled) |
| `asdf install erlang` | 15-45 minutes | One-time per version (compiles from source) |
| `asdf reshim` | < 1 second | Regenerates shim scripts |
| `.tool-versions` parsing | < 5ms | File read on each invocation |

The one-time Erlang compilation cost is significant but occurs only once per version per machine. The platform documents the required build flags to ensure compilation succeeds on the first attempt, avoiding wasted time on failed builds.

## Configuration

asdf is configured through `~/.asdfrc` for global settings and environment variables for plugin-specific build options. The Prismatic Platform documents the required configuration in its developer setup guide.

```bash
# ~/.asdfrc - asdf configuration
legacy_version_file = yes
use_release_candidates = no
always_keep_download = no
```

Erlang compilation requires specific build flags to ensure OTP documentation and the required SSL support are included:

```bash
# Environment variables for Erlang compilation
export KERL_BUILD_DOCS=yes
export KERL_INSTALL_HTMLDOCS=no
export KERL_CONFIGURE_OPTIONS="--without-javac --with-ssl=$(brew --prefix openssl@3)"
```

For development teams, these environment variables are documented in the repository's `CONTRIBUTING.md` and can be set in shell profiles to persist across sessions.

## Best Practices

The platform enforces strict version management practices to prevent environment drift across the development team and CI/CD infrastructure.

- **Always commit `.tool-versions`** -- this is the single source of truth for runtime versions across the team and CI
- **Pin exact versions** -- use `1.19.0-otp-27` not `1.19` to prevent subtle behavior differences across environments
- **Update versions in a dedicated commit** -- runtime version changes can have wide-ranging effects; isolate them from feature work
- **Set `KERL_BUILD_DOCS=yes`** -- ensures `h` and `i` helpers work in IEx for Erlang modules, improving developer productivity
- **Use `asdf reshim`** after installing new global packages -- [Elixir](/technologies/elixir/) escripts and mix archives need their shims regenerated
- **Test after version upgrades** -- run the full `mix test` suite after any Elixir or Erlang version bump to catch compatibility issues
- **Document build prerequisites** -- Erlang compilation requires system libraries (OpenSSL, ncurses); document these in the setup guide
- **Use `legacy_version_file = yes`** -- allows asdf to read `.nvmrc` files for Node.js compatibility with tools that generate them

## Comparison

asdf was chosen over runtime-specific version managers for its unified interface and project-local version pinning capabilities.

| Criterion | asdf | nvm (Node) | kerl (Erlang) | kiex (Elixir) |
|-----------|------|------------|---------------|---------------|
| Multi-runtime | Yes (500+ plugins) | Node.js only | Erlang only | Elixir only |
| Project-local versions | `.tool-versions` | `.nvmrc` | Manual | Manual |
| Shim-based switching | Yes | Yes | No (manual activation) | No |
| CI/CD integration | Single file for all runtimes | Separate per tool | Separate per tool | Separate per tool |
| Plugin ecosystem | Community-maintained | N/A | N/A | N/A |
| Team consistency | One file, all runtimes | Multiple files | Manual coordination | Manual coordination |

The alternative approach of using [Docker](/technologies/docker/) for development environment consistency was evaluated but rejected for day-to-day development due to the compilation speed penalty and IEx debugging limitations inside containers. Docker remains the platform's deployment packaging tool, while asdf handles the development environment. This separation of concerns ensures developers get native compilation performance and full debugging capabilities while Docker provides production-grade reproducibility for deployment artifacts.

## Related Technologies

- [Elixir](/technologies/elixir/) - Primary language runtime managed by the asdf-elixir plugin
- [Erlang/OTP](/technologies/erlang-otp/) - VM runtime managed by the asdf-erlang plugin, compiled from source
- [Git](/technologies/git/) - `.tool-versions` versioned in the repository for team-wide consistency
- [Docker](/technologies/docker/) - Docker images pin runtime versions independently of asdf for production deployments
- [TailwindCSS](/technologies/tailwindcss/) - Requires the Node.js runtime managed by asdf-nodejs

## Related Apps

- All Prismatic Platform development uses asdf-managed runtimes for consistent builds
- [prismatic_web](/apps/prismatic-web/) - Requires Node.js (via asdf) for TailwindCSS and asset compilation
- [prismatic_perimeter](/apps/prismatic-perimeter/) - Benefits from exact Erlang/OTP version pinning for NIF compatibility

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)