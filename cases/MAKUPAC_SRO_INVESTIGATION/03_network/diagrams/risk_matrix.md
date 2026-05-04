# RISK MATRIX DIAGRAMS
## Comprehensive Risk Visualization

## Family Member Risk Profiles

```mermaid
quadrantChart
    title Individual Risk Assessment Matrix
    x-axis Low Financial Risk --> High Financial Risk
    y-axis Low Operational Risk --> High Operational Risk
    quadrant-1 High Risk Zone
    quadrant-2 Operational Watch
    quadrant-3 Safe Zone
    quadrant-4 Financial Watch
    "Jiří Kuchyňka": [0.25, 0.30]
    "Renata Kuchyňková": [0.20, 0.15]
    "Petr Kuchyňka": [0.45, 0.55]
    "Martin Mauler": [0.35, 0.25]
```

## Business Risk Distribution

```mermaid
pie title Risk Category Distribution
    "Client Concentration (Zapakuj)" : 30
    "Key Person Dependency" : 22
    "Single Facility" : 18
    "Market Competition" : 15
    "Technology Obsolescence" : 10
    "Regulatory Changes" : 5
```

## Risk Priority Matrix

```mermaid
flowchart TD
    subgraph P1["🔴 PRIORITY 1 - CRITICAL"]
        R1["Client Concentration<br/>60-80% Zapakuj<br/>Score: 9.6/10"]
        R2["Key Person Risk<br/>Petr Kuchyňka<br/>Score: 7.0/10"]
    end

    subgraph P2["🟠 PRIORITY 2 - HIGH"]
        R3["Single Facility<br/>Citonice 231<br/>Score: 6.0/10"]
        R4["Market Competition<br/>3PL Pressure<br/>Score: 5.2/10"]
    end

    subgraph P3["🟡 PRIORITY 3 - MEDIUM"]
        R5["Technology Gap<br/>Basic Automation<br/>Score: 4.5/10"]
        R6["Regulatory Risk<br/>Compliance<br/>Score: 3.8/10"]
    end

    subgraph P4["🟢 PRIORITY 4 - LOW"]
        R7["Insolvency Risk<br/>Clean Record<br/>Score: 3.0/10"]
        R8["Cross-border<br/>Complications<br/>Score: 2.0/10"]
    end

    R1 --> M1["Diversification Campaign"]
    R2 --> M2["Succession Planning"]
    R3 --> M3["Backup Facility"]
    R4 --> M4["Differentiation"]

    style R1 fill:#dc2626,color:#fff
    style R2 fill:#dc2626,color:#fff
    style R3 fill:#f97316,color:#fff
    style R4 fill:#f97316,color:#fff
    style R5 fill:#eab308,color:#000
    style R6 fill:#eab308,color:#000
    style R7 fill:#22c55e,color:#fff
    style R8 fill:#22c55e,color:#fff
```

## Scenario Impact Analysis

```mermaid
xychart-beta
    title "Risk Scenario Probability vs Impact"
    x-axis ["Zapakuj Exit", "Ownership Dispute", "Facility Disaster", "Market Disruption"]
    y-axis "Score (Probability × Impact)" 0 --> 10
    bar [9.6, 4.5, 3.0, 5.2]
```

## Risk Evolution Timeline

```mermaid
timeline
    title Risk Landscape Evolution
    section Pre-2022
        Low Awareness : Risk management minimal
                     : Single founder model
    section 2022-2025
        Family Control : Governance risks emerge
                      : Client concentration builds
                      : Operational growth
    section 2026+
        Current State : Zapakuj dependency critical
                     : Key person risk high
                     : Mitigation required
    section Future
        Planned Mitigation : Diversification campaign
                          : Technology investment
                          : Succession planning
```

## Mitigation Status Dashboard

```mermaid
flowchart LR
    subgraph IMMEDIATE["⚡ IMMEDIATE (0-3 mo)"]
        I1["Client Diversification<br/>🔴 NOT STARTED"]
        I2["Zapakuj Strengthening<br/>🟡 IN PROGRESS"]
        I3["BCP Development<br/>🟡 IN PROGRESS"]
    end

    subgraph SHORT["📅 SHORT-TERM (3-12 mo)"]
        S1["Shoptet Optimization<br/>⬜ PLANNED"]
        S2["Tech Investment<br/>⬜ PLANNED"]
        S3["Backup Facility<br/>⬜ PLANNED"]
    end

    subgraph MEDIUM["📆 MEDIUM-TERM (1-3 yr)"]
        M1["Second Facility<br/>⬜ CONSIDERED"]
        M2["Strategic Partnerships<br/>⬜ CONSIDERED"]
        M3["Market Position<br/>⬜ CONSIDERED"]
    end

    I1 --> S1
    I2 --> S2
    I3 --> S3
    S1 --> M1
    S2 --> M2
    S3 --> M3

    style I1 fill:#dc2626,color:#fff
    style I2 fill:#eab308,color:#000
    style I3 fill:#eab308,color:#000
```
