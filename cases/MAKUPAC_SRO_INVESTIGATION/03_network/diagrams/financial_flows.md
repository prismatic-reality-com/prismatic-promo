# FINANCIAL FLOWS DIAGRAM
## Capital & Revenue Intelligence

## Capital Structure Evolution

```mermaid
sankey-beta
    Mauler Initial,MAKUPAC Capital,20000
    Renata Entry,MAKUPAC Capital,20000
    MAKUPAC Capital,Operations 2021-2022,40000
    Jiří Era Growth,MAKUPAC Capital,182223
    MAKUPAC Capital,Current Capital,222223
    Current Capital,Petr Share (91%),202223
    Current Capital,Mauler Share (9%),20000
```

## Ownership Value Distribution

```mermaid
pie title Current Capital Distribution (222,223 CZK)
    "Petr Kuchyňka (91%)" : 202223
    "Martin Mauler (9%)" : 20000
```

## Revenue Stream Analysis

```mermaid
flowchart TD
    subgraph REVENUE["💰 REVENUE STREAMS"]
        R1["Fulfillment Services<br/>~100,800 CZK/month<br/>PRIMARY"]
        R2["Warehouse Storage<br/>~10,000 CZK/month<br/>SECONDARY"]
        R3["Additional Services<br/>15-20% markup<br/>TERTIARY"]
    end

    subgraph CLIENTS["👥 CLIENT BASE"]
        C1["Zapakuj Shop<br/>60-80% revenue<br/>⚠️ CONCENTRATION"]
        C2["Other Clients<br/>20-40% revenue"]
    end

    subgraph ANNUAL["📊 ANNUAL PROJECTION"]
        A1["Revenue Range<br/>1.2-2.1M CZK"]
        A2["EBITDA ~15%<br/>180K-315K CZK"]
    end

    C1 --> R1
    C2 --> R1
    C1 --> R2
    C2 --> R2
    R1 --> A1
    R2 --> A1
    R3 --> A1
    A1 --> A2

    style C1 fill:#dc2626,color:#fff
    style A2 fill:#059669,color:#fff
```

## Cost Structure Breakdown

```mermaid
pie title Operating Cost Distribution
    "Personnel (45-55%)" : 50
    "Operating Expenses (20-25%)" : 23
    "Facility Costs (10-15%)" : 12
    "EBITDA Margin (~15%)" : 15
```

## Monthly Cash Flow Model

```mermaid
xychart-beta
    title "Estimated Monthly Cash Flow (CZK)"
    x-axis ["Revenue", "Personnel", "Facility", "Operating", "Net CF"]
    y-axis "Amount (CZK thousands)" -100 --> 150
    bar [131, -65, -16, -29, 21]
```

## Financial Health Indicators

```mermaid
flowchart LR
    subgraph POSITIVE["✅ POSITIVE INDICATORS"]
        P1["VAT Reliable Payer"]
        P2["No Insolvency"]
        P3["Growing Sector"]
        P4["Positive Cash Flow"]
    end

    subgraph RISK["⚠️ RISK FACTORS"]
        R1["Ownership Changes<br/>3x in 5 years"]
        R2["Previous Liquidation<br/>Your Deco 2020"]
        R3["Client Concentration<br/>60-80% single"]
    end

    subgraph RATING["📊 OVERALL RATING"]
        RATE["7.2/10<br/>GOOD<br/>LOW-MEDIUM RISK"]
    end

    P1 --> RATE
    P2 --> RATE
    P3 --> RATE
    P4 --> RATE
    R1 --> RATE
    R2 --> RATE
    R3 --> RATE

    style RATE fill:#059669,color:#fff,stroke:#047857,stroke-width:3px
    style R3 fill:#dc2626,color:#fff
```

## Working Capital Cycle

```mermaid
sequenceDiagram
    participant C as Client Order
    participant F as Fulfillment
    participant AR as Accounts Receivable
    participant CF as Cash Flow

    C->>F: Order Received
    Note over F: Processing<br/>(24h)
    F->>AR: Invoice Generated
    Note over AR: Payment Cycle<br/>(15-30 days)
    AR->>CF: Cash Received
    Note over CF: Working Capital<br/>70K-130K CZK
```
