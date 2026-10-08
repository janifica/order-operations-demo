# Verification

Verified locally on 2026-10-08 with Node.js 26.3.0.

- 42 automated tests passed: validation, canonical duplicate intake, conflicting IDs, shipment uniqueness, quoted CSV parsing, grouped import, partial-import prevention, event deduplication and ordering, terminal delivery protection, exception recovery, capped retries, replay, SQLite reopen persistence, rollback, and HTTP validation.
- Server/client TypeScript checks and Vite production build passed.
- npm audit reports zero known vulnerabilities for the installed lockfile after dependency updates. This is a point-in-time dependency check.
- Browser walkthrough verified two-package partial/completed delivery; ignored duplicate events; failed connection exception and replay resolution; a temporary timeout succeeding on attempt two; CSV importing two valid orders and reporting the invalid email.
- An imported order accepted a synthetic exception event through its detail form. Built application was opened successfully in the browser on a separate local port/database. The overview screenshot is stored in `assets/overview.jpg`.

Connected bridge tests use a mocked transport and cover receipt waiting, task-ID validation, duplicate receipts, stale attempts, uncertain outcomes, capped retries, sequencing, worker replacement, endpoint validation and HTTP access controls.

## Railway deployment acceptance (2026-10-08)

Source 955a0f4 built and started on Railway with one replica, `/data` persistent volume, `/health` check, and HTTPS at https://order-operations-demo-production.up.railway.app. Workspace compute cap $10/period and $8 alert saved with user authorization.

Unauthenticated health returned200; operational access returned401. Authenticated order intake returned200 and repeated intake marked duplicate. Synthetic DEPLOY-RESTART-001 remained readable after a confirmed container restart (startup log16:02:40 Shanghai). This is hosted simulation evidence, not connected ClickUp/Slack acceptance.

The user successfully logged in on a phone and supplied a screenshot showing the hosted order console with five synthetic orders, including DEPLOY-RESTART-001. This verifies user browser access. The screenshot renders the desktop layout at a small scale; mobile layout and interactions remain to test. Agent-controlled Chrome navigation remains blocked (ERR_BLOCKED_BY_CLIENT); its cause is unresolved. No browser protection was disabled.

## Connected intake and Slack setup (2026-10-08)

Connected runtime uses a separate /data/connected-orders.sqlite database. Intake Zap v1 published. An application-submitted CONNECTED-AUTO-002 order automatically created ClickUp task z8r3fdr8vh and received a succeeded receipt on attempt1. Repeated intake returned duplicate without another outbox action. CONNECTED-INTAKE-001 was a separate, manually stepped setup test; it is not the automatic-run evidence.

Notifications Zap v1 published after a real Slack digest message test and accepted receipt. The message was sent only to the dedicated demo channel. The on-demand digest automatically succeeded after publication. Fulfillment updates and notifications passed as described below; scheduled deployment acceptance passed. Zapier warns these premium features are included in the trial ending2026-10-22; no paid Zapier plan purchased.

## Connected fulfillment and scheduler (2026-10-08)

CONNECTED-AUTO-002 first became partially delivered, then delivered after its second synthetic package event. The published fulfillment Zap used ClickUp API Request with its existing OAuth connection and safely serialized JSON. The second update and both Slack notifications completed automatically with succeeded receipts on attempt1. Real ClickUp task z8r3fdr8vh was inspected in COMPLETE status; both messages were inspected in the dedicated Slack channel. The first update was a manually stepped setup test, reconciled with its delayed receipt; it is not automatic-run evidence.

Repeating the second event and sending an older event returned accepted=false; the order remained delivered and its five provider actions remained unchanged. No extra update or notification was queued.

Seven scheduler tests passed: local due time, next-day run, startup catch-up, SQLite reopen, daylight-saving fallback, atomic rollback, same-day time change/failed send, disabled and invalid configuration. Total42 tests and production build passed. Scheduled runtime uses the existing worker and persists one run/action per local date; hosted scheduling and restart acceptance passed as described below.

The hosted scheduler caught up the current date after enabling09:00 Asia/Shanghai. Action fcbe7075-41e3-4eb5-869b-01cf8decc1f4 succeeded on attempt1; the actual Slack message at16:49:32 showed2 orders,1 active and0 exceptions. After confirmed container restart (startup16:50:59), the same single scheduled action remained succeeded and both orders persisted. Future daily boundaries are verified with clock-controlled tests, not an observed next-day production run.

Local browser at390×844 verified responsive metrics, modal fields, Tab focus inside the native dialog and Escape dismissal. An absolutely positioned screen-reader table heading initially caused page width596; anchoring it to left/top0 reduced page width to375 within the390 viewport. The table retains its own horizontal scrolling. Hosted phone screenshot shows desktop layout; the phone may be using desktop-site mode, which has not been confirmed. Empty search and a conflicting order ID were also checked: the UI displayed No matching orders and an explicit conflict error. Loading-state inspection and connected recording remain pending.
