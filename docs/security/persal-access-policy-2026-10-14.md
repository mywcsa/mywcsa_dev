# MyWCSA PERSAL — exclusive access policy (updated 14 October 2026)

**Status:** Approved named 19-person access group, with individual Microsoft Entra identity mappings NOT YET VERIFIED OR ACTIVATED. This document does not authorize bypassing dual controls.

## Approved officials (19) and primary workspaces

| Official | Primary workspace |
|---|---|
| Selina Ngalo | Executive Directors |
| Lungiswa Ngalo | Executive Directors |
| Zillindile Lucas Jantjies | Executive Directors |
| Tyson Williams | Management Team |
| Chloe Williams | Management Team |
| Manette Leibrandt | Management Team |
| Pieter Marais | Management Team |
| Christiaan De Villiers | ICT & BiT |
| Zaylin-Zyle Morris | ICT & BiT |
| Felicia Marais | Finance Department |
| Selena Leibrandt | Finance Department |
| Adriaan Barnard | Finance Department |
| Stefan Petersen | Finance Department |
| Shedrick Pietersen | Finance Department; PERSAL Manager |
| Leandra Neff | WCSA e-Innovation |
| Brenda Swarts | Communications; Department Director |
| Monique Abrahams | Communications |
| Gerhard October | Communications |
| Lisakhanya Boxoza | People's Management; Head of PERSAL |

## Security and data-access rules

1. Only approved named officials may receive PERSAL access. A name in the allow-list is **not** sufficient for account access.
2. Authenticate using the configured Microsoft Entra tenant. After independent verification, bind each person to their immutable provider subject and issuer. Set \`verified_at\` and enable access only under authorised dual control.
3. Default deny all anonymous, non-Entra, unmapped, disabled and unlisted identities. Enforce on pages, APIs, exports and document retrieval, not just the launcher.
4. The seven access groups are workspace/navigation assignments, **not** unrestricted financial or personnel data rights. Individual record scopes and final approval limits require separate formal delegation.
5. Personnel and Executive roles can see identifiable employee master summaries; all other roles require explicit granular scopes before access to identifiable information. Technical staff are not automatically entitled to salary, banking or tax records.
6. Maintain segregation between personnel capture, verification, approval, payroll payment release, system administration and audit.
7. PERSAL is WCSA's internal employee master and payroll authority, **not** the government's official PERSAL service. DPSA / Treasury / WCG alignment does not constitute government certification.
8. Event-driven downstream integrations may only publish approved, permitted data; no employee payroll details may appear in the general event outbox payload.
9. Maintain immutable transaction audit, alerting and access reviews. Do not launch payroll or employee-data write paths before authorisation tests and legal approval.

## Implementation evidence, October 14

- Database register has 19 named rows, 0 enabled, 0 identity-bound as of the migration.
- Seven workspace assignment groups have been seeded; switching cannot grant additional privileges.
- Restricted Next.js /persal routes and the search API deny unauthorised users.
- Sensitive PERSAL tables have row-level security enabled and no \`anon\` or \`authenticated\` table grants.
- First review build is in pull request #21; production rollout is not authorised or verified.
