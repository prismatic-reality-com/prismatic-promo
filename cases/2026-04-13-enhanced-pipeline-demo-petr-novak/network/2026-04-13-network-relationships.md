# Network Relationships - Petr Novak

## Relationship Graph

```mermaid
graph TD
    SUBJECT["PETR NOVAK\n(person)"]

    E1["Novak IT Solutions s.r.o.\ncompany\nIČO: 12345678"]
    E2["Jana Novakova\nperson\n50% shares"]
    E3["Tech Consulting Praha s.r.o.\ncompany\ncontractor"]

    SUBJECT -->|"director/owner"| E1
    SUBJECT -->|"business partner"| E2
    E1 -.->|"service provider"| E3

    style SUBJECT fill:#f39c12,stroke:#e67e22,color:#fff
    style E1 fill:#3498db,stroke:#333,color:#fff
    style E2 fill:#e74c3c,stroke:#333,color:#fff
    style E3 fill:#3498db,stroke:#333,color:#fff
```

## Entity Registry

| # | Type | Name | Relationship | Confidence |
|---|------|------|-------------|------------|
| 0 | person | Petr Novak | SUBJECT | - |
| 1 | company | Novak IT Solutions s.r.o. | director | HIGH |
| 2 | person | Jana Novakova | co-owner | MEDIUM |
| 3 | company | Tech Consulting Praha s.r.o. | client | LOW |

---

_Generated: 2026-04-13_
