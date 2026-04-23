+++
title = "Prismatic Platform Hub"
description = "Interactive dashboards, tools, and real-time analytics. Access the full Prismatic Platform."
sort_by = "weight"
template = "hub/list.html"
weight = 10

[extra]
category = "navigation"
tags = ["hub", "platform", "interactive", "dashboard"]
date_created = "2026-02-22"
platform_redirect = true
author = "Tomas Korcak (korczis)"
reading_time = "1 min"
word_count = 280
date_modified = "2026-02-23"
keywords = ["Prismatic", "Platform", "Hub", "Interactive", "Access", "navigation", "Prismatic Platform", "Real", "Interactive Platform"]
quality_score = 27
see_also = ["agents", "capabilities", "technologies"]
image = "/images/sections/hub.png"
image_alt = "Prismatic Platform Hub - Prismatic Platform"
+++

# Prismatic Platform Hub

The **Prismatic Platform Hub** provides interactive dashboards, real-time analytics, and live tools for intelligence gathering, due diligence, and system management.

## 🚀 Interactive Platform Access

The hub features live on the **Prismatic Platform** (not this static documentation site):

### **🎯 Agent Registry**
**[→ Agent Hub](@/hub/agents.md)**
Platform path: `/hub/agents`
- 530+ AIAD agents with live status
- Interactive filtering and search
- Real-time agent deployment monitoring
- Command execution tracking

### **🔍 OSINT Toolbox**
**[→ OSINT Hub](@/hub/osint.md)**
Platform path: `/hub/osint/toolbox`
- 120+ OSINT adapters with live data
- Multi-source intelligence gathering
- Czech legal sources integration
- Breach database correlation

### **📊 Analytics Dashboard**
**[→ Analytics Hub](#platform-access)**
Platform path: `/dashboard`
- Real-time BI metrics with Chart.js
- System performance monitoring
- Operations per second tracking
- Health overview with live updates

### **⚖️ Due Diligence Platform**
**[→ DD Hub](#platform-access)**
Platform path: `/hub/dd`
- Interactive investigation workspace
- Entity relationship mapping
- Multi-source data correlation
- Investigation case management

### **🛡️ Perimeter Management**
**[→ EASM Hub](#platform-access)**
Platform path: `/perimeter`
- External attack surface monitoring
- Security ratings (A-F grades)
- Asset discovery and tracking
- NIS2/ZKB compliance dashboards

## 📚 Static Documentation (This Site)

For reference material and documentation, explore these sections on this site:

- **[Agents Documentation](@/agents/_index.md)** - Static agent specifications and guides
- **[OSINT Reference](@/osint/_index.md)** - OSINT methodology and source catalog
- **[DD Methodology](@/dd/_index.md)** - Due diligence process documentation
- **[Technology Stack](@/technologies/_index.md)** - Platform architecture details
- **[Glossary](@/glossary/_index.md)** - 1,840+ technical terms and definitions

## 🔄 Architecture Overview

| **Interactive Platform** | **Static Documentation** |
|-------------------------|-------------------------|
| **Live data & tools** | **Reference materials** |
| Phoenix LiveView + WebSockets | Zola static site generator |
| Platform endpoint + `/hub/*` paths | Promo site root paths |
| Real-time dashboards | Read-only documentation |

## 🚀 Platform Access {#platform-access}

Access the interactive platform through your configured endpoint:

**Platform Base URL** + **Hub Path**
- Agent Registry: `{platform}/hub/agents`
- OSINT Toolbox: `{platform}/hub/osint/toolbox`
- Analytics Dashboard: `{platform}/dashboard`
- DD Platform: `{platform}/hub/dd`
- EASM Management: `{platform}/perimeter`

**Configuration**: Platform access is configured through your deployment settings and authentication system.

---

**Need help?** Check our **[FAQ](@/faq/_index.md)** or contact **[support](mailto:korczis@gmail.com)**.