# Investigation Plan

**Subject**: Petr Novak
**Type**: person
**Country**: CZ
**Region**: Prague
**Birth Year**: 1980
**Network Expansion**: true
**Estimated Duration**: 140s

## Sources

| ID | Name | Category | Priority | Mode |
|----|------|----------|----------|------|
| ares | ARES | Business Registry | P1 | AUTO |
| justice_cz | Justice.cz (VR) | Commercial Register | P1 | AUTO |
| isir | ISIR | Insolvency Registry | P1 | AUTO |
| eu_sanctions | EU Sanctions | Sanctions | P1 | AUTO |
| ofac_sdn | OFAC SDN | Sanctions | P1 | AUTO |
| un_sanctions | UN Sanctions | Sanctions | P1 | AUTO |
| rzp | RZP | Trade License Registry | P2 | AUTO |
| registr_smluv | Registr smluv | State Contracts | P2 | AUTO |
| hlidac_statu | Hlidac Statu | Government Watch | P2 | AUTO |
| cuzk | CUZK | Land Registry | P2 | MANUAL |
| cedr | CEDR | Subsidies | P3 | AUTO |
| penize_cz | Penize.cz | Company Profiles | P3 | AUTO |
| kurzy_cz | Kurzy.cz | Company Profiles | P3 | AUTO |

## Phases

| # | Phase | Sources | Est. Duration |
|---|-------|---------|---------------|
| 1 | Registry Scan (Critical) | ARES, Justice.cz (VR), ISIR, EU Sanctions, OFAC SDN, UN Sanctions | 30s |
| 2 | Extended Registry Scan | RZP, Registr smluv, Hlidac Statu | 30s |
| 3 | Supplementary Sources | CEDR, Penize.cz, Kurzy.cz | 20s |
| 4 | Network Expansion |  | 45s |
| 5 | Manual Verification Required | CUZK | 0s |
| 6 | Risk Assessment & Report |  | 15s |

---

_Generated: 2026-04-13T02:45:53.876785Z_
