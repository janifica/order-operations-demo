# Verification

Verified locally on 2026-10-08 with Node.js 26.3.0.

- 35 automated tests passed: validation, canonical duplicate intake, conflicting IDs, shipment uniqueness, quoted CSV parsing, grouped import, partial-import prevention, event deduplication and ordering, terminal delivery protection, exception recovery, capped retries, replay, SQLite reopen persistence, rollback, and HTTP validation.
- Server/client TypeScript checks and Vite production build passed.
- npm audit reports zero known vulnerabilities for the installed lockfile after dependency updates. This is a point-in-time dependency check.
- Browser walkthrough verified two-package partial/completed delivery; ignored duplicate events; failed connection exception and replay resolution; a temporary timeout succeeding on attempt two; CSV importing two valid orders and reporting the invalid email.
- An imported order accepted a synthetic exception event through its detail form. Built application was opened successfully in the browser on a separate local port/database. The overview screenshot is stored in `assets/overview.jpg`.

Connected bridge tests use a mocked transport and cover receipt waiting, task-ID validation, duplicate receipts, stale attempts, uncertain outcomes, capped retries, sequencing, worker replacement, endpoint validation and HTTP access controls.

A separate real Zapier action test created a synthetic fulfillment task in the dedicated ClickUp demo list; the task was verified in ClickUp. This is not yet evidence of the complete application-to-Zapier-to-receipt workflow. Slack workflow remains a draft. All tracking events remain synthetic. No cloud deployment or container execution has been validated (Docker is unavailable locally).

## Railway deployment acceptance (2026-10-08)

Source 955a0f4 built and started on Railway with one replica, `/data` persistent volume, `/health` check, and HTTPS at https://order-operations-demo-production.up.railway.app. Workspace compute cap $10/period and $8 alert saved with user authorization.

Unauthenticated health returned200; operational access returned401. Authenticated order intake returned200 and repeated intake marked duplicate. Synthetic DEPLOY-RESTART-001 remained readable after a confirmed container restart (startup log16:02:40 Shanghai). This is hosted simulation evidence, not connected ClickUp/Slack acceptance.

Browser navigation to the protected homepage was blocked by Chrome (ERR_BLOCKED_BY_CLIENT). Frontend acceptance and the reason for that browser block remain unresolved. No browser protection was disabled.
