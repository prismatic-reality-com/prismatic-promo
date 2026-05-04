# INVESTIGATION COMMAND SUITE
## Complete Command Reference for MAKUPAC Methodology

**Version**: 1.0.0
**Date**: 2026-03-05
**Status**: OPERATIONAL REFERENCE
**Platform Integration**: 1,090 AIAD agents, 225 commands, 157 OSINT tools

---

## QUICK REFERENCE

### Essential Commands (Daily Use)

| Command | Purpose | Example |
|---------|---------|---------|
| `/investigate` | Launch investigation | `/investigate "MAKUPAC s.r.o." comprehensive` |
| `/orchestrate` | AI-powered routing | `/orchestrate "13-level analysis of Czech s.r.o."` |
| `/mycelialize` | Network analysis | `/mycelialize findings MAKUPAC_SRO_INVESTIGATION` |
| `/person-investigate` | Personnel profiling | `/person-investigate "Petr Kuchyňka"` |
| `/ghost-recon` | Elite reconnaissance | `/ghost-recon "target entity"` |

### Mix Tasks (CLI Operations)

| Command | Purpose | Example |
|---------|---------|---------|
| `mix investigation.status` | Case monitoring | `mix investigation.status MAKUPAC --verbose` |
| `mix investigation.status --watch` | Continuous watch | `mix investigation.status MAKUPAC --watch --interval 30` |
| `mix investigation.status --all` | All cases overview | `mix investigation.status --all --monitoring` |
| `mix investigation.status --health` | Health report | `mix investigation.status --health-report` |
| `mix evidence.add` | Add evidence | `mix evidence.add MAKUPAC --source ares --data ...` |
| `mix investigation.generate` | New case from template | `mix investigation.generate "ABC s.r.o." "12345678"` |

---

## INVESTIGATION LIFECYCLE COMMANDS

### Phase 1: Case Initialization

```bash
# Create new investigation case
/investigate "ENTITY_NAME s.r.o." --ico="12345678" --depth=13

# Or use orchestrate for AI-powered setup
/orchestrate "Create comprehensive 13-level investigation of ENTITY with IČO 12345678"

# Generate case from MAKUPAC template
mix investigation.generate "ENTITY_NAME s.r.o." "12345678" --template=MAKUPAC

# Verify case creation
mix investigation.status CASE_ID --verbose
```

### Phase 2: Intelligence Collection (Levels 1-5)

```bash
# Corporate structure analysis (Level 1)
/investigate "ENTITY" --level=1 --focus="corporate-structure"
# Uses: czech-business-intelligence-specialist agent

# Financial intelligence (Level 2)
/investigate "ENTITY" --level=2 --focus="financial-analysis"
# Uses: financial-intelligence-commander agent

# Network topology (Level 3)
/investigate "ENTITY" --level=3 --focus="network-mapping"
# Uses: intelligence-fusion-coordinator agent

# Personnel profiling (Level 4)
/person-investigate "KEY_PERSON_NAME" --depth=comprehensive
# Uses: person-investigation-mycelial-agent

# Legal & compliance (Level 5)
/investigate "ENTITY" --level=5 --focus="legal-compliance"
# Uses: legal-intelligence-specialist agent
```

### Phase 3: Operational Intelligence (Levels 6-10)

```bash
# Operational intelligence (Level 6)
/investigate "ENTITY" --level=6 --focus="operations"

# Digital footprint (Level 7)
/ghost-recon "ENTITY" --digital-footprint

# Cross-border intelligence (Level 8)
/investigate "ENTITY" --level=8 --focus="cross-border"

# Risk assessment (Level 9)
/investigate "ENTITY" --level=9 --focus="risk-assessment"

# Market intelligence (Level 10)
/investigate "ENTITY" --level=10 --focus="market-positioning"
```

### Phase 4: Analytical Synthesis (Levels 11-13)

```bash
# Pattern recognition (Level 11)
/investigate "ENTITY" --level=11 --focus="pattern-recognition"

# Predictive intelligence (Level 12)
/investigate "ENTITY" --level=12 --focus="predictive-analysis"

# Strategic synthesis (Level 13)
/orchestrate "Complete strategic synthesis of ENTITY investigation with executive summary"
```

### Phase 5: Monitoring Deployment

```bash
# Deploy 3-tier monitoring
mix investigation.monitor deploy CASE_ID --ico=12345678

# Verify monitoring status
mix investigation.monitor status CASE_ID

# Trigger immediate check
mix investigation.monitor check_now CASE_ID --tier=critical
```

---

## OSINT COMMAND SUITE

### Czech Registry Commands

```bash
# ARES business register search
/osint-hub ares --ico="10664327"
/osint-hub ares --name="MAKUPAC s.r.o."

# Justice.cz commercial register
/osint-hub justice --name="MAKUPAC"
/osint-hub justice --ico="10664327"

# ISIR insolvency check
/osint-hub isir --ico="10664327"
/osint-hub isir --person="Petr Kuchyňka"

# Combined Czech registry sweep
/dd-run ares_sweep --ico="10664327"
```

### Global OSINT Commands

```bash
# Email intelligence
/email-osint "person@domain.com" --depth=comprehensive

# Google hacking / dorking
/google-hacking "MAKUPAC s.r.o." --operators="site,inurl,filetype"

# Web reconnaissance
/reconnaissance "makupac.cz" --scope=full

# Person investigation
/person-investigate "Petr Kuchyňka" --jurisdiction=CZ --depth=deep
```

### OSINT Toolbox (157 Tools)

```bash
# Access toolbox UI
# Route: /osint/toolbox

# Categories available:
# Czech (28 adapters): ARES, Justice, ISIR, Commercial Register
# Global (84 adapters): Shodan, VirusTotal, Censys, Hunter.io
# Sanctions (3): EU, OFAC SDN, UN
# EU (1): European Business Register
# UK (1): Companies House
# US (1): SEC EDGAR
# Universal (2): EmailIntelligence

# Toolbox search patterns:
/osint-engines --category=czech --tool=ares --query="10664327"
/osint-engines --category=sanctions --query="Kuchyňka"
/osint-engines --category=global --tool=shodan --query="makupac.cz"
```

---

## DD PIPELINE COMMANDS

### Due Diligence Operations

```bash
# Trigger DD pipeline for specific source group
/dd-run sanctions            # Sanctions screening
/dd-run parliament           # Parliament members check
/dd-run senate               # Senate members check
/dd-run forbes               # Forbes business intelligence
/dd-run local_gov            # Local government data
/dd-run ares_sweep           # ARES comprehensive sweep
/dd-run isir                 # Insolvency registry
/dd-run court_parties        # Court party records
/dd-run pep                  # Politically Exposed Persons

# DD Pipeline status
mix investigation.status CASE_ID --dd-status

# DD dashboard (LiveView)
# Route: /hub/dd/pipeline
```

---

## MYCELIAL ANALYSIS COMMANDS

### Network Intelligence

```bash
# Full mycelial analysis
/mycelialize findings CASE_FOLDER --depth=level2 --steps=13

# Targeted person analysis
/mycelialize "Jiří Kuchyňka" --framework=13-step --confidence=80

# Family network mapping
/mycelialize-formal CASE_FOLDER --pattern="family-succession" --subjects="Kuchyňka"

# Cross-entity pattern propagation
/mycelialize-enforced CASE_FOLDER --pattern="client-dependency" --propagate=true

# Living mycelial network (continuous)
/mycelialize-living CASE_FOLDER --continuous --update-interval=weekly
```

---

## QUALITY & VALIDATION COMMANDS

### Quality Enforcement

```bash
# NMND doctrine validation
/quality-enforce CASE_FOLDER --standard=nmnd --tolerance=zero

# Quality gates check
/quality-gates CASE_FOLDER --comprehensive

# Investigation validation
/validate CASE_FOLDER --framework=13-level --confidence=80

# Evidence chain verification
mix evidence.verify CASE_ID --chain-integrity

# Architecture validation
/architect CASE_FOLDER --validate --permanent-solutions
```

### Investigation Quality Metrics

```bash
# Case quality report
/analyze CASE_FOLDER --quality-metrics

# Confidence level assessment
/validate CASE_FOLDER --confidence-assessment

# Cross-reference consistency check
/check CASE_FOLDER --cross-references --consistency

# File completeness verification
/validate CASE_FOLDER --file-completeness --expected=28
```

---

## REPORTING COMMANDS

### Report Generation

```bash
# Master investigation report
/orchestrate "Generate comprehensive master report for CASE_ID"

# Executive summary (C-suite appropriate)
/orchestrate "Create executive summary for CASE_ID with strategic recommendations"

# Risk assessment report
/analyze CASE_FOLDER --risk-report --format=executive

# Financial intelligence brief
/analyze CASE_FOLDER --financial-brief --include=projections

# Network topology report
/mycelialize CASE_FOLDER --report --format=comprehensive
```

### Export & Delivery

```bash
# JSON export for CI/CD
mix investigation.status CASE_ID --format=json > report.json

# Intelligence export
/intel-export CASE_ID --format=markdown --output=./reports/

# Evidence package
mix evidence.export CASE_ID --format=court-ready --include-proofs
```

---

## MONITORING COMMANDS

### Continuous Monitoring

```bash
# Deploy monitoring
mix investigation.monitor deploy CASE_ID --ico=10664327

# Status check
mix investigation.monitor status CASE_ID

# Immediate check (specific tier)
mix investigation.monitor check_now CASE_ID --tier=critical

# Pause monitoring (maintenance)
mix investigation.monitor pause CASE_ID

# Resume monitoring
mix investigation.monitor resume CASE_ID

# Alert history
mix investigation.monitor history CASE_ID --period=30d

# Watch mode (terminal)
mix investigation.status CASE_ID --watch --interval 60

# Health report
mix investigation.status --health-report
```

### Alert Management

```bash
# View active alerts
mix investigation.monitor alerts CASE_ID --active

# Acknowledge alert
mix investigation.monitor ack ALERT_ID

# Configure alert thresholds
mix investigation.monitor configure CASE_ID --ownership-threshold=3%

# Alert channels setup
mix investigation.monitor channels CASE_ID --add=email:analyst@prismatic.com
```

---

## MULTI-CASE OPERATIONS

### Case Management

```bash
# List all investigation cases
mix investigation.status --all

# Compare cases
/orchestrate "Compare investigations MAKUPAC and ABC_LOGISTICS for common patterns"

# Bulk monitoring status
mix investigation.status --all --monitoring

# Cross-case pattern analysis
/analyze-gaps --cases="MAKUPAC,ABC,XYZ" --pattern="family-succession"

# Portfolio risk assessment
/orchestrate "Generate portfolio-level risk assessment across all active cases"
```

### Template Operations

```bash
# Replicate MAKUPAC template to new entity
mix investigation.generate "NEW_ENTITY s.r.o." "12345678" --template=MAKUPAC

# Batch generation from CSV
mix investigation.batch entities.csv --template=MAKUPAC --parallel

# Cross-country template adaptation
mix investigation.generate "GmbH Entity" "ATU12345" --template=MAKUPAC --country=AT
```

---

## ADVANCED OPERATIONS

### Crisis Intelligence Integration

```bash
# Crisis pattern monitoring
/orchestrate "Monitor MAKUPAC for crisis indicators using CrisisPredictor"

# Scenario modeling
/orchestrate "Generate 5 risk scenarios for MAKUPAC using ScenarioGenerator"

# Emergency response activation
/emergency CASE_ID --type=critical --trigger="insolvency_filing"
```

### Evidence Vault Operations

```bash
# Store evidence with chain-of-custody
mix evidence.add CASE_ID --source=ares --data=registry_snapshot.json

# Verify evidence chain integrity
mix evidence.verify CASE_ID --chain-integrity

# Create evidence snapshot (Merkle tree)
mix evidence.snapshot CASE_ID

# Generate court-ready inclusion proof
mix evidence.proof CASE_ID --evidence-id=EVD_001

# Export evidence package
mix evidence.export CASE_ID --format=court-ready
```

### Agent Coordination

```bash
# Deploy specialized agent squad
/orchestrate "Deploy investigation squad: financial, legal, operational for CASE_ID"

# Coordinate multi-agent analysis
/coordinate "financial-intelligence-commander,risk-assessment-commander" --case=CASE_ID

# Agent performance review
/agents --status --domain=investigation

# Emergency agent re-routing
/orchestrate "Re-route failed Level 9 analysis to backup risk-assessment agent"
```

---

## COMMAND CHEAT SHEET

### Most Common Workflows

**Quick Investigation (15 minutes)**:
```bash
/investigate "ENTITY s.r.o." comprehensive
```

**Full 13-Level Investigation (8-15 days)**:
```bash
/orchestrate "Launch complete 13-level investigation of ENTITY (IČO: 12345678) with mycelial analysis, monitoring, and executive reporting"
```

**Person Deep Profile**:
```bash
/person-investigate "Full Name" --jurisdiction=CZ --depth=comprehensive
```

**Continuous Monitoring Setup**:
```bash
mix investigation.monitor deploy CASE_ID --ico=12345678
mix investigation.status CASE_ID --watch
```

**Quality Validation**:
```bash
/validate CASE_FOLDER --framework=13-level --confidence=80
/quality-enforce CASE_FOLDER --standard=nmnd
```

---

## PLATFORM ROUTES REFERENCE

### Investigation LiveView Pages

| Route | Component | Purpose |
|-------|-----------|---------|
| `/investigation/console` | InvestigationConsoleLive | Real-time investigation control |
| `/investigation/progress` | InvestigationProgressLive | Progress tracking |
| `/intelligence/dashboard` | IntelligenceDashboard | Multi-source intelligence |
| `/intelligence/investigation` | InvestigationLive | Active investigation console |
| `/crisis/intelligence` | CrisisIntelligenceLive | Crisis monitoring |
| `/hub/dd/pipeline` | PipelineLive | DD pipeline dashboard |
| `/osint/toolbox` | ToolboxLive | 157 OSINT tools UI |
| `/academy` | AcademyDashboard | Investigation training |

---

**Command Suite Status**: COMPREHENSIVE REFERENCE COMPLETE
**Total Commands Documented**: 80+ commands across 10 categories
**Platform Coverage**: Investigation, OSINT, DD, Mycelial, Quality, Monitoring, Reporting
**Integration**: 1,090 AIAD agents + 157 OSINT tools + Evidence Vault

*Investigation Command Suite - Complete operational reference for MAKUPAC methodology*
