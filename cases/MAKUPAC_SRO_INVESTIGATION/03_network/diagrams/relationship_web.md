# RELATIONSHIP WEB DIAGRAM
## Complete Entity Relationship Mapping

## Full Network Visualization

```mermaid
graph TB
    subgraph PERSONS["👥 PERSONS"]
        JK["👤 Jiří Kuchyňka<br/>Patriarch<br/>IČO: 72940492"]
        RK["👤 Renata Kuchyňková<br/>Spouse"]
        PK["👤 Petr Kuchyňka<br/>Son, 91% MAKUPAC"]
        MM["👤 Martin Mauler<br/>Austria, 9% MAKUPAC"]
        ML["👤 Milan Lajčin<br/>Zapakuj Shop owner"]
    end

    subgraph COMPANIES["🏢 COMPANIES"]
        MAKUPAC["🏭 MAKUPAC s.r.o.<br/>IČO: 10664327<br/>Fulfillment"]
        CI["🏢 C.I., s.r.o.<br/>IČO: 25527126<br/>Zbýšov"]
        ZAPAKUJ["🛒 Zapakuj Shop s.r.o.<br/>E-commerce<br/>60-80% client"]
        DECO["⚠️ Your Deco s.r.o.<br/>LIQUIDATED 2020"]
    end

    subgraph LOCATIONS["📍 LOCATIONS"]
        ZBYSOV["🏠 Zbýšov 1<br/>Family residence"]
        CITONICE["🏭 Citonice 231<br/>MAKUPAC HQ"]
        BRNO["🏙️ Brno<br/>Petr's residence"]
        GNADENDORF["🇦🇹 Gnadendorf<br/>Austria"]
    end

    %% Family relationships
    JK ---|"Spouse"| RK
    JK ---|"Father"| PK
    RK ---|"Mother"| PK

    %% Business relationships
    PK -->|"91% Owner<br/>Director"| MAKUPAC
    MM -->|"9% Owner"| MAKUPAC
    JK -->|"Owner/Director"| CI
    ML -->|"Owner"| ZAPAKUJ
    PK -.->|"Former owner"| DECO

    %% Client relationship
    ZAPAKUJ ==>|"60-80% Revenue<br/>CRITICAL"| MAKUPAC

    %% Location relationships
    JK --> ZBYSOV
    RK --> ZBYSOV
    CI --> ZBYSOV
    PK --> BRNO
    MM --> GNADENDORF
    MAKUPAC --> CITONICE

    %% Historical
    JK -.->|"Former Director<br/>2022-2026"| MAKUPAC
    RK -.->|"Former Shareholder<br/>2021-2026"| MAKUPAC

    style MAKUPAC fill:#059669,color:#fff,stroke:#047857,stroke-width:3px
    style ZAPAKUJ fill:#dc2626,color:#fff,stroke:#b91c1c,stroke-width:2px
    style PK fill:#10b981,color:#fff
    style JK fill:#3b82f6,color:#fff
    style RK fill:#8b5cf6,color:#fff
    style MM fill:#f59e0b,color:#000
    style DECO fill:#6b7280,color:#fff
```

## Relationship Matrix

```mermaid
heatmap
    title Relationship Strength Matrix
    x-axis [JK, RK, PK, MM, ML]
    y-axis [JK, RK, PK, MM, ML]
    0 0 0 0 0
    0 0 0 0 0
    0 0 0 0 0
    0 0 0 0 0
    0 0 0 0 0
```

## Entity Connections by Type

```mermaid
pie title Connection Types
    "Family (Blood/Marriage)" : 3
    "Business (Ownership)" : 6
    "Business (Client)" : 1
    "Geographic (Location)" : 5
    "Historical" : 3
```

## Centrality Analysis

```mermaid
flowchart TD
    subgraph CENTRAL["🎯 HIGH CENTRALITY"]
        MAKUPAC["MAKUPAC s.r.o.<br/>Network Hub<br/>Centrality: 0.85"]
        PK["Petr Kuchyňka<br/>Control Node<br/>Centrality: 0.78"]
    end

    subgraph MEDIUM["📊 MEDIUM CENTRALITY"]
        JK["Jiří Kuchyňka<br/>Centrality: 0.65"]
        ZBYSOV["Zbýšov 1<br/>Centrality: 0.55"]
    end

    subgraph PERIPHERAL["🔹 PERIPHERAL"]
        RK["Renata<br/>Centrality: 0.35"]
        MM["Mauler<br/>Centrality: 0.25"]
        ZAPAKUJ["Zapakuj<br/>Centrality: 0.40"]
    end

    style MAKUPAC fill:#dc2626,color:#fff
    style PK fill:#f97316,color:#fff
    style JK fill:#eab308,color:#000
    style ZBYSOV fill:#22c55e,color:#fff
```

## Influence Flow

```mermaid
flowchart LR
    subgraph CONTROL["💰 CONTROL FLOW"]
        direction LR
        PK["Petr<br/>91%"] -->|"Controls"| MAKUPAC["MAKUPAC"]
        MM["Mauler<br/>9%"] -->|"Minority"| MAKUPAC
    end

    subgraph ADVISORY["🎓 ADVISORY FLOW"]
        direction LR
        JK["Jiří"] -.->|"Experience"| PK
        JK -.->|"Contacts"| MAKUPAC
    end

    subgraph REVENUE["💵 REVENUE FLOW"]
        direction LR
        ZAPAKUJ["Zapakuj"] ==>|"60-80%<br/>Revenue"| MAKUPAC
        OTHER["Other Clients"] -->|"20-40%"| MAKUPAC
    end

    subgraph FAMILY["👪 FAMILY SUPPORT"]
        direction LR
        RK["Renata"] -.->|"Support"| JK
        RK -.->|"Support"| PK
    end

    style ZAPAKUJ fill:#dc2626,color:#fff,stroke:#b91c1c,stroke-width:3px
    style PK fill:#059669,color:#fff
```

## Network Evolution

```mermaid
timeline
    title Network Evolution 2021-2026
    section 2021
        Mar : Mauler alone
            : Single node network
        May : Renata enters
            : Family node added
    section 2022
        Dec : Jiří takes control
            : Family network expands
            : Mauler becomes peripheral
    section 2026
        Jan : Petr assumes control
            : Generational shift
            : Jiří+Renata exit
        Mar : Current state
            : Petr central
            : Zapakuj critical
```

## Risk Dependencies

```mermaid
flowchart TD
    subgraph CRITICAL["🔴 CRITICAL DEPENDENCY"]
        ZAPAKUJ["Zapakuj Shop<br/>60-80% Revenue"]
    end

    subgraph HIGH["🟠 HIGH DEPENDENCY"]
        PK["Petr Kuchyňka<br/>Key Person"]
        CITONICE["Citonice Facility<br/>Single Location"]
    end

    subgraph MEDIUM["🟡 MEDIUM DEPENDENCY"]
        TECH["Technology<br/>Basic Systems"]
        MARKET["Market Position<br/>Regional"]
    end

    ZAPAKUJ ==>|"Revenue Risk"| MAKUPAC["MAKUPAC"]
    PK -->|"Management Risk"| MAKUPAC
    CITONICE -->|"Operational Risk"| MAKUPAC
    TECH -->|"Efficiency Risk"| MAKUPAC
    MARKET -->|"Growth Risk"| MAKUPAC

    style ZAPAKUJ fill:#dc2626,color:#fff,stroke:#b91c1c,stroke-width:3px
    style PK fill:#f97316,color:#fff
    style CITONICE fill:#f97316,color:#fff
    style MAKUPAC fill:#059669,color:#fff,stroke:#047857,stroke-width:3px
```
