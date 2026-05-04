# CLAUDE.md - Due Diligence Instructions

## Case Context

**Subject**: Petr Novak
**Type**: person (natural person)
**Case ID**: 2026-04-13-enhanced-pipeline-demo-petr-novak

## Investigation Scope

- Identity verification via Czech public registries
- Company registration and legal status (owner/director/stakeholder roles)
- Financial performance of associated companies (if available)
- Key personnel and ownership structure of associated entities
- Network relationships and affiliations
- Insolvency and court proceedings history
- Sanctions and PEP screening
- Property ownership in Prague region
- Risk indicators and red flags

## Data Sources

### Czech Sources (Priority)
- Czech Business Registry (ARES) - search by surname + region Prague
- Justice.cz (Sbirka listin, Obchodni rejstrik) - company filings
- ISIR (Insolvency Registry) - active/historical proceedings
- RZP (Trade License Registry) - trade licenses
- Registr smluv - state contracts involvement
- CEDR - subsidies
- Hlidac Statu - state contracts
- Katastr nemovitosti (CUZK) - property records (CAPTCHA-protected, manual)

### Sanctions & PEP
- EU Sanctions List
- OFAC SDN List
- UN Sanctions List
- OpenSanctions PEP database

### Media & Reputation
- Czech news sources
- LinkedIn professional profile
- Regional media (Prague)

## Output Requirements

1. Update README.md with all findings progressively
2. Create network relationship diagrams (Mermaid) in network/
3. Store source-specific findings in findings/
4. Generate dated reports in reports/
5. Generate risk assessment matrix with scoring
6. Provide actionable recommendations
7. Document all source URLs and timestamps

## Investigation Protocol

1. Start with ARES search for surname businesses in Prague
2. Check Justice.cz for subject in company director/shareholder roles
3. Check ISIR for insolvency records
4. Check RZP for trade licenses
5. Screen against all sanctions lists
6. Map company ownership/directorship network
7. Search Hlidac Statu for state contract involvement
8. Search news/media for mentions
9. Compile comprehensive risk assessment
10. Generate network relationship diagram

## Key Search Queries

```
ARES: surname from subject, region Prague
Justice.cz: full name from subject
ISIR: full name + birth year 1980
Sanctions: full name
Hlidac Statu: full name + associated ICOs
```

---

_Last updated: 2026-04-13T02:45:53.859899Z_

