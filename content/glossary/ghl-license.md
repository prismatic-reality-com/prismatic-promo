+++
title = "GHL License"
weight = 50
[extra]
tags = ["glossary", "licensing", "open-source", "legal", "governance", "community", "ghl", "oss"]
description = "The GHL (General Hybrid License) is the Prismatic Platform's custom open-source license that balances open community contribution with sustainable commercial viability, enabling a dual-track ecosystem of free core and premium extensions."
category = "governance"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "20 min"
difficulty = "intermediate"
quality_score = 95
date_created = "2026-02-22"
date_updated = "2026-02-22"
version = "2.0.0"
related_terms = ["open-source", "community-ownership", "developer-portal", "ecosystem-expansion", "sdk", "open-source-strategy", "open-source-leadership", "sustainable-funding-models", "community-building", "complete-transparency"]
platforms = ["prismatic-platform"]
audience = ["engineers", "architects", "legal", "open-source-maintainers"]
prerequisite_knowledge = ["software-licensing", "open-source"]
word_count = 1839
date_modified = "2026-02-23"
keywords = ["GHL", "License", "General", "Hybrid", "Prismatic", "Platforms", "glossary", "governance", "Prismatic Platform", "The GHL"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "GHL License - Prismatic Platform"
+++

## Definition

The GHL (General Hybrid License) is the custom software license under which the Prismatic Platform is distributed. It is a hybrid license that combines open-source principles -- transparency, community contribution, and free access to source code -- with provisions for commercial sustainability and intellectual property protection. The GHL enables a dual-track ecosystem where the platform's core functionality is freely available for inspection, modification, and contribution, while certain premium features, commercial deployments, and enterprise integrations may be subject to additional licensing terms. This approach reflects the platform's philosophy that open source and commercial viability are not mutually exclusive but rather complementary when structured correctly.

## Overview

Software licensing is one of the most consequential decisions in any platform's lifecycle. The choice of license determines who can use the software, how it can be modified, whether derivatives must also be open, and how the project sustains itself financially. The landscape of software licenses ranges from fully permissive (MIT, BSD) through copyleft (GPL, AGPL) to proprietary, with a growing category of hybrid or source-available licenses emerging in the 2020s.

The Prismatic Platform's GHL license exists in this hybrid space, drawing inspiration from several licensing models:

- **MIT/BSD permissiveness**: Core platform code is readable, forkable, and modifiable
- **AGPL network protection**: Network use of the platform triggers certain obligations
- **Business Source License (BSL) time-delay**: Some advanced features have usage restrictions that relax over time
- **Dual licensing**: Commercial entities can obtain alternative licensing for enterprise deployment

### Why Not Standard Licenses?

Standard open-source licenses were designed for a different era. The MIT license, written in the 1980s, assumes a world where software is distributed as binaries or source tarballs. It does not address cloud services, SaaS deployment, AI training data, or the "open-source sustainability problem" where corporations extract enormous value from community-maintained projects without contributing back.

The GPL family attempts to address some of these issues through copyleft requirements, but the "SaaS loophole" in GPL v2 (closed by AGPL v3) demonstrated how quickly licensing assumptions can be undermined by new deployment models. Even AGPL v3 has limitations in the context of AI/ML systems where the concept of "derivative work" becomes ambiguous.

The GHL was designed from the ground up to address the realities of modern software distribution:

1. **Cloud-native deployment** where software runs as services, not installed binaries
2. **AI integration** where code may be used to train models or processed by LLMs
3. **Ecosystem economics** where a platform's value comes from its ecosystem, not just its code
4. **Community sustainability** where maintainer burnout is the primary risk to project survival

## Technical Details

### License Structure

The GHL is structured in four tiers that define progressively broader usage rights:

```
Tier 1: Community (Free)
  - Source code access
  - Personal and educational use
  - Non-commercial deployment
  - Contribution rights
  - Bug fix redistribution

Tier 2: Startup (Free with attribution)
  - Small-scale commercial deployment (<$1M revenue)
  - Must provide attribution
  - Must contribute bug fixes upstream
  - Access to community support channels

Tier 3: Enterprise (Commercial license)
  - Unlimited commercial deployment
  - Priority support and SLAs
  - Custom integration assistance
  - No copyleft obligations
  - Advanced features and modules

Tier 4: OEM (Negotiated)
  - Embedding in third-party products
  - White-labeling rights
  - Custom license terms
  - Dedicated engineering support
```

### Core Provisions

The GHL's core provisions can be represented structurally:

```elixir
defmodule Prismatic.License.GHL do
  @moduledoc """
  Represents the GHL license structure and compliance
  verification. This module is used internally to validate
  deployment configurations against license terms.
  """

  @type tier :: :community | :startup | :enterprise | :oem
  @type usage :: :personal | :educational | :commercial | :redistribution | :embedding

  @type license_context :: %{
    tier: tier(),
    organization: String.t() | nil,
    revenue: non_neg_integer(),
    usage: usage(),
    attribution: boolean(),
    upstream_contributions: boolean()
  }

  @type compliance_result :: %{
    compliant: boolean(),
    tier: tier(),
    obligations: list(String.t()),
    restrictions: list(String.t())
  }

  @spec check_compliance(license_context()) :: compliance_result()
  def check_compliance(context) do
    tier = determine_tier(context)
    obligations = tier_obligations(tier)
    restrictions = tier_restrictions(tier)

    compliant = Enum.all?(obligations, &obligation_met?(&1, context))

    %{
      compliant: compliant,
      tier: tier,
      obligations: obligations,
      restrictions: restrictions
    }
  end

  @spec determine_tier(license_context()) :: tier()
  def determine_tier(%{usage: usage}) when usage in [:personal, :educational] do
    :community
  end

  def determine_tier(%{usage: :commercial, revenue: rev}) when rev < 1_000_000 do
    :startup
  end

  def determine_tier(%{usage: :commercial}) do
    :enterprise
  end

  def determine_tier(%{usage: :embedding}) do
    :oem
  end

  def determine_tier(%{usage: :redistribution}) do
    :community
  end

  defp tier_obligations(:community) do
    ["maintain_license_notice", "no_warranty_claims"]
  end

  defp tier_obligations(:startup) do
    [
      "maintain_license_notice",
      "provide_attribution",
      "contribute_bug_fixes_upstream",
      "no_warranty_claims"
    ]
  end

  defp tier_obligations(:enterprise) do
    [
      "maintain_commercial_license",
      "comply_with_sla_terms"
    ]
  end

  defp tier_obligations(:oem) do
    [
      "maintain_oem_agreement",
      "comply_with_embedding_terms"
    ]
  end

  defp tier_restrictions(:community) do
    ["no_commercial_deployment", "no_warranty", "no_sla"]
  end

  defp tier_restrictions(:startup) do
    ["revenue_under_1m", "must_attribute", "no_warranty", "community_sla_only"]
  end

  defp tier_restrictions(:enterprise), do: ["per_agreement"]
  defp tier_restrictions(:oem), do: ["per_agreement"]

  defp obligation_met?("provide_attribution", ctx), do: ctx.attribution
  defp obligation_met?("contribute_bug_fixes_upstream", ctx), do: ctx.upstream_contributions
  defp obligation_met?("maintain_license_notice", _ctx), do: true
  defp obligation_met?("no_warranty_claims", _ctx), do: true
  defp obligation_met?(_, _ctx), do: true
end
```

### Contribution License Agreement

Contributors to the Prismatic Platform under the GHL agree to a lightweight Contributor License Agreement (CLA) that grants the project the right to relicense contributions under any tier of the GHL. This is necessary to maintain the dual-track model: community contributions must be includable in both the free and commercial tiers.

The CLA does NOT assign copyright. Contributors retain ownership of their code. The CLA grants a non-exclusive, perpetual, irrevocable license to distribute the contribution under the GHL's terms.

### Patent Provisions

The GHL includes an explicit patent grant: contributors grant a perpetual, worldwide, non-exclusive, royalty-free patent license covering any patents that would be infringed by their contribution. This protects both the project and its users from patent claims by contributors.

The patent grant includes a defensive termination clause: if a licensee initiates patent litigation against any contributor, the patent license granted to that licensee terminates automatically.

## Implementation

### License Compliance Tooling

The platform includes automated license compliance checking:

```bash
# Check all dependencies for license compatibility
mix license.check

# Generate a license compliance report
mix license.report --format=json

# Verify GHL compliance of deployment configuration
mix license.verify_deployment
```

### SPDX Identifier

While the GHL is a custom license, it follows SPDX (Software Package Data Exchange) conventions for machine-readability. The license is registered with a custom identifier `GHL-1.0` and includes structured metadata:

```
SPDX-License-Identifier: GHL-1.0
SPDX-FileCopyrightText: 2024-2026 Tomas Korcak <korczis@gmail.com>
```

### Open-Source Package Licensing

The four OSS packages released as part of Gen 19 (Ecosystem Expansion) use standard open-source licenses (MIT or Apache 2.0) to maximize adoption. The GHL applies to the platform as a whole, while individual packages extracted for standalone use may carry more permissive licenses:

| Package | License | Rationale |
|---------|---------|-----------|
| Prismatic SDK | MIT | Maximum adoption, minimal friction |
| Prismatic Plugin Kit | MIT | Encourage third-party plugins |
| Prismatic Security | Apache 2.0 | Patent protection for security code |
| Prismatic UI | MIT | Enable community UI contributions |
| Prismatic Platform (core) | GHL-1.0 | Hybrid sustainability model |

This tiered licensing strategy allows the ecosystem to grow freely while the core platform maintains its commercial viability.

## Comparison with Other Licenses

| License | Open Source | Commercial Use | Copyleft | SaaS Protection | Sustainability |
|---------|-----------|---------------|----------|-----------------|---------------|
| **MIT** | Yes | Unrestricted | No | None | Poor |
| **Apache 2.0** | Yes | Unrestricted | No | None | Poor |
| **GPL v3** | Yes | Restricted | Strong | Weak | Moderate |
| **AGPL v3** | Yes | Restricted | Strong | Strong | Moderate |
| **BSL 1.1** | Source Available | Restricted (time-limited) | No | Strong | Good |
| **SSPL** | Controversial | Restricted | Ultra-strong | Very Strong | Good |
| **Elastic v2** | Source Available | Restricted | No | Strong | Good |
| **GHL 1.0** | Hybrid | Tiered | Selective | Strong | Strong |

### MIT/BSD: Maximum Freedom, Minimum Protection

The MIT and BSD licenses are the most permissive standard licenses. They allow anyone to do anything with the code, including incorporating it into proprietary products without contributing back. While this maximizes adoption, it provides no protection against value extraction by large corporations and no mechanism for project sustainability.

### GPL/AGPL: Strong Copyleft

The GPL family requires derivative works to carry the same license, ensuring that improvements to the software remain available to the community. AGPL extends this to network use (SaaS). However, copyleft can discourage commercial adoption and creates complex compatibility issues with other licenses.

### BSL/SSPL: Source Available with Restrictions

Business Source License (used by MariaDB, CockroachDB) and Server Side Public License (used by MongoDB, Elasticsearch) restrict certain commercial uses while making source code available. These licenses have been controversial in the open-source community because they do not meet the Open Source Definition's requirements for unrestricted use.

### GHL: Hybrid Approach

The GHL takes a different path by defining explicit tiers rather than blanket restrictions. Community and educational use is genuinely free and open. Small commercial use is free with attribution. Large commercial use requires a commercial license. This granularity allows the project to be generous with individuals and small teams while capturing value from enterprise deployment.

## Best Practices

### 1. Include License Headers in All Source Files

Every source file should include the SPDX license identifier and copyright notice. This makes license compliance unambiguous and machine-verifiable.

### 2. Maintain a LICENSES Directory

Keep the full license text, any additional terms, and the CLA in a `LICENSES/` directory at the repository root. This follows the REUSE specification for clear license documentation.

### 3. Document License Obligations Clearly

Contributors and users should be able to understand their obligations without consulting a lawyer. The GHL's tier structure is designed for clarity, but additional documentation (FAQ, examples, flowcharts) helps ensure compliance.

### 4. Separate Core and Premium at the Module Level

When implementing the dual-track model, ensure that the boundary between community-available and premium features is at the module level, not scattered across functions. This makes license compliance enforceable and auditable.

### 5. Automate Compliance Checking

Use automated tooling (`mix license.check`) to verify that all dependencies are compatible with the GHL and that deployment configurations comply with the appropriate tier.

### 6. Contribute Bug Fixes Upstream

The GHL's startup tier requires upstream contribution of bug fixes. Even when not legally required (enterprise/OEM tiers), contributing fixes back strengthens the ecosystem and reduces maintenance burden for all participants.

## Common Pitfalls

### License Incompatibility

Not all open-source licenses are compatible with each other. A dependency licensed under GPL v3 may create copyleft obligations that conflict with the GHL's commercial tiers. The platform's `mix license.check` tool detects these conflicts before they become legal issues.

### Ambiguous Derivative Work Boundaries

In a microservices architecture, determining what constitutes a "derivative work" can be contentious. The GHL addresses this by defining clear boundaries: code that imports Prismatic modules directly is covered; code that communicates via HTTP APIs is not.

### Over-Restriction Killing Adoption

Setting commercial restrictions too aggressively can drive potential users to competitors with more permissive licenses. The GHL's free startup tier (under $1M revenue) is specifically designed to prevent this: most startups and small businesses can use the platform freely.

### Under-Protection Enabling Exploitation

Conversely, being too permissive allows large corporations to extract value without contributing back. The GHL's enterprise tier ensures that organizations with significant revenue contribute to the platform's sustainability.

### Ignoring AI/ML Considerations

Modern licenses must address whether code can be used to train AI models. The GHL includes explicit provisions regarding AI training data usage, requiring attribution and, for commercial AI products, an appropriate license tier.

## Use Cases

### Individual Developer Learning

A developer studying the Prismatic Platform's architecture for educational purposes operates under Tier 1 (Community). They can read all source code, run the platform locally, modify it for learning, and contribute improvements back. No cost, no restrictions beyond maintaining the license notice.

### Startup Building on Prismatic

A startup with $500K in annual revenue building a security product on the Prismatic Platform operates under Tier 2 (Startup). They deploy commercially with attribution, contribute bug fixes upstream, and benefit from community support. When their revenue exceeds $1M, they transition to Tier 3.

### Enterprise Security Operations

A large enterprise deploying Prismatic Perimeter for attack surface management across their global infrastructure operates under Tier 3 (Enterprise). They pay for a commercial license, receive priority support and SLAs, and have access to advanced features not available in the community tier.

### OEM Integration

A cybersecurity vendor embedding Prismatic's OSINT capabilities into their own product operates under Tier 4 (OEM). They negotiate custom terms for white-labeling, receive dedicated engineering support, and have rights to redistribute within their product.

### Open-Source Package Consumers

Developers using the standalone Prismatic SDK (MIT licensed) in their projects operate under the SDK's MIT license, not the GHL. They have the full freedom of MIT licensing for the SDK specifically, regardless of the platform's GHL terms.

## Related Concepts

The GHL license connects to numerous aspects of the Prismatic Platform's governance and strategy:

- [Open Source](/glossary/open-source/) is the philosophical foundation that the GHL builds upon while adding sustainability mechanisms
- [Community Ownership](/glossary/community-ownership/) describes the governance model that the GHL's contribution terms support
- [Developer Portal](/glossary/developer-portal/) provides the public-facing interface for developers operating under any GHL tier
- [Ecosystem Expansion](/glossary/ecosystem-expansion/) (Gen 19) introduced the dual-track licensing strategy with MIT-licensed standalone packages
- [SDK](/glossary/sdk/) is the first package released under MIT license as part of the ecosystem expansion
- [Open Source Strategy](/glossary/open-source-strategy/) covers the broader strategic thinking behind the GHL's design
- [Open Source Leadership](/glossary/open-source-leadership/) describes the leadership model that the GHL enables
- [Sustainable Funding Models](/glossary/sustainable-funding-models/) explores the economics that the GHL's tiered structure supports
- [Community Building](/glossary/community-building/) covers the community practices enabled by the GHL's permissive community tier
- [Complete Transparency](/glossary/complete-transparency/) is the value that drives the GHL's source-available approach across all tiers

## See Also

- [Open Source Advocacy](/glossary/open-source-advocacy/) -- the broader movement that the GHL participates in
- [Community Contributions](/glossary/community-contributions/) -- how contributions flow under the GHL's CLA
- [Open Source Superiority](/glossary/open-source-superiority/) -- the platform's thesis on open source as a competitive advantage
- [Perfection Over Profit](/glossary/perfection-over-profit/) -- the value that prioritizes quality over commercial extraction
- [Quality and Transparency](/glossary/quality-and-transparency/) -- the twin values that the GHL is designed to protect

---

**Connect & Contribute**: Built by [Tomas Korcak (korczis)](https://github.com/korczis) as part of the [Prismatic Platform](https://github.com/korczis/prismatic-platform). Licensed under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE). Contributions welcome via [GitHub Issues](https://github.com/korczis/prismatic-platform/issues) and [Pull Requests](https://github.com/korczis/prismatic-platform/pulls).
