# AI_Symptoms_Checker — Evaluation Matrix

This evaluation matrix summarizes the current quality, risks, and recommended remediation actions for the AI_Symptoms_Checker project. Use it as a checklist for release readiness and prioritization.

| # | Area | Description / What to check | Current status (short) | Score (1-5) | Risk Level (Low/Med/High) | Recommended actions | Owner | Target date |
|---|------|----------------------------|------------------------:|:----------:|:------------------------:|---------------------|-------|------------:|
| 1 | Functionality | Core features: symptom input, AI analysis, admin dashboard, appointment booking, predictions persistence | Mostly implemented; admin modal, find-by-email, booking flows implemented | 4 | Medium | Add end-to-end tests for flows (admin search/view/delete, symptom analyze, booking) | FE lead | 2w |
| 2 | Usability / UX | Clarity of UI, dialogs, error handling, feedback (toasts) | Good primitives; missing toasts and some visual polish | 3 | Medium | Add toasts for success/failure, polish cards & modal styles, mobile checks | FE | 1w |
| 3 | Data correctness | Date/time handling, timezone normalization, slot generation, prediction persistence | Date param changed to `YYYY-MM-DD`; fallback parsing present | 4 | Medium | Validate server accepts YYYY-MM-DD; add unit tests for slots and timezone edge cases | BE/FE | 1w |
| 4 | Security / Auth | API auth tokens, role checks for admin endpoints, delete protections | Auth via localStorage token; admin flows present but no role-guard UI protections | 3 | High | Enforce server-side RBAC; disable destructive actions for admin accounts in UI; add audit logs | BE | 2w |
| 5 | Privacy & Consent | Health data handling, Google Health sync consent, storage of PHI | Consent flag exists; google sync guarded for meaningful metrics | 4 | Medium | Add explicit consent UI audit, review data retention & encryption of sensitive fields | Product/Legal | 2w |
| 6 | Accessibility | Keyboard nav, semantic HTML, ARIA, color contrast | Basic components (radix/Tailwind) but not audited | 2 | Medium | Run axe/accessibility audit, fix issues (labels, roles, focus states) | FE | 2w |
| 7 | Performance | Load times, bundle size, API latency | Vite build present; some client-side computations (slot generation) | 3 | Low | Measure with Lighthouse; lazy-load heavy components; optimize API pagination | FE/Infra | 3w |
| 8 | Maintainability | Code structure, TypeScript types, modularity, docs | Good modular structure, UI primitives and services exist | 4 | Low | Add CONTRIBUTING.md, document API expectations and DTOs, add codeowners | Eng Team | 2w |
| 9 | Test Coverage | Unit and integration tests | Minimal automated tests in repo | 2 | High | Add unit tests for components and services, integration tests for API flows | Eng Team | 3w |
|10 | Monitoring & Logging | Error reporting, user action logs, observability | No central monitoring configured in project | 2 | High | Integrate Sentry/Log sink, add server + client error reporting, instrument key flows | Ops | 3w |
|11 | CI / CD | Automated builds, linting, tests on PRs | `package.json` present; CI config not evident in repo | 2 | High | Add GitHub Actions: lint, build, test, preview deploy for PRs | Eng Team | 2w |
|12 | Deployment / Infra | Hosting, env management, secrets | Vite build folder present; deployment instructions limited | 3 | Medium | Add README deploy steps, configure env handling and secret management | DevOps | 2w |
|13 | Compliance & Legal | Medical disclaimers, data locality, HIPAA/GDPR considerations | MedicalDisclaimer component exists; compliance not documented | 2 | High | Consult legal, document compliance controls, sign-off for PHI processing | Legal/Product | 4w |

## Summary Recommendations (priority order)

1. Security & Compliance (High priority)
   - Enforce server-side RBAC and audit logging for admin actions.
   - Complete privacy & consent review; document data retention and encryption needs.

2. Tests & CI (High priority)
   - Add unit and integration tests for key flows (symptom analyze, appointment booking, admin user management).
   - Add CI pipeline to run lint/build/tests on PRs.

3. Monitoring & Error Reporting (High priority)
   - Integrate Sentry (or similar) for client and server error reporting.
   - Add structured logs for booking and user deletion events.

4. Usability & Accessibility (Medium priority)
   - Add toasts for success/failure and small UI polish to cards and modal.
   - Run automated accessibility audits and fix issues.

5. Documentation & Maintainability (Medium priority)
   - Add API DTO docs (endpoints used by frontend), CONTRIBUTING.md, and developer setup steps.

## Example scoring rubric
- 5 — Excellent: production-ready with tests, monitoring, and docs
- 4 — Good: implemented and mostly stable, minor gaps
- 3 — Fair: works but needs improvements in UX or reliability
- 2 — Poor: significant gaps (security, tests, compliance)
- 1 — Blocker: cannot release

## How to use this matrix
- Update `Score`, `Status`, and `Target date` as work completes.
- Use `Risk Level` to decide what gets fixed before release.
- Assign specific owners and track in your sprint board.

---

Generated on: 2025-11-25

