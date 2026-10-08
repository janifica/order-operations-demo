# Project Memory

This file records knowledge for this application repository only.

## Current Conventions

- Only application code, tests, synthetic fixtures, runtime documentation, and demo assets belong here. Career planning and selection rationale stay in the sibling upwork-workflow repository.
- English product and portfolio materials; Chinese user communication.
- Default local simulation and connected Zapier bridge implemented. Full connected acceptance and deployment remain pending. Private hooks and SQLite data stay ignored in workspace/.

## Log

### 2026-10-08 - Protected Railway simulation deployment

- Type: Change
- Status: Active
- Context: Continue deployment after the workspace cost cap was approved and saved.
- Record: Source955a0f4 deployed with one replica, /data volume and /health. Railway root-owned volume initially blocked SQLite; container bootstrap now chowns /data, drops groups/gid/uid to node1000, then imports the app. Health200, unauthenticated operational401, intake/dedup and restart persistence passed.
- Impact: Hosted simulation is available; connected mode remains pending and must use a separate database. Browser homepage navigation is blocked by Chrome ERR_BLOCKED_BY_CLIENT; frontend acceptance is unresolved. Do not weaken browser protections to bypass it. Secrets and service identifiers remain in ignored workspace files.
- References: scripts/container-entrypoint.mjs, Dockerfile, doc/verification.md

### 2026-10-08 - Source publication and authorized workspace cap

- Type: Change
- Status: Active
- Context: User accepted the release plan and then authorized the proposed $10 limit after its workspace-wide effect was explained.
- Record: Full application source published to janifica/order-operations-demo, snapshot 07212c5. Railway confirmed Compute Usage Limit $10 and an $8 alert; existing Agent limits remain unchanged. Local Git preserves both initial local and published histories via merge.
- Impact: Hosting budget blocker resolved. The cap stops all shared projects; it does not enforce a separate $5 application allowance. Deployment and connected acceptance remain pending.
- References: doc/release-acceptance.md, https://github.com/janifica/order-operations-demo

### 2026-10-08 - Release criteria and daily scheduling plan

- Type: Decision
- Status: Active
- Context: User requested a fresh delivery checklist and corresponding technology stack.
- Record: Added release-acceptance.md with source publication, protected persistent deployment, receipt-based SaaS acceptance, restart/reconciliation, scheduled digest and UI/media criteria. Plan daily scheduling in the existing Node worker with SQLite run keys and explicit missed-run behavior; it remains unimplemented.
- Impact: Retain the existing application stack and one-instance architecture. Actual carrier tracking and LLM summaries remain optional. Application resource budget is $5/month; workspace-wide shutdown limits remain separately pending authorization.
- References: doc/release-acceptance.md, doc/connected-setup.md

### 2026-10-08 - Evidence-led presentation and hosting budget

- Type: Decision
- Status: Active
- Context: User requested stronger portfolio methods and approved a $5/month resource budget for this application.
- Record: Reworked the English case study around observable business behavior, three implementation decisions and an evidence matrix. Added a two-minute demonstration script and publication checks. No extra AI dependency or UI rewrite added. GitHub and existing Railway account sign-in succeeded; the public repository has only an initialization README so far.
- Impact: Complete connected acceptance before recording live claims. Railway hard limits apply workspace-wide, so applying a $10 workspace cap/$8 alert remains pending user authorization because another project shares the workspace. No application deployment completed.
- References: doc/case-study.md, doc/demo-script.md, doc/connected-setup.md

### 2026-10-08 - Runnable local simulation

- Type: Decision
- Status: Active
- Context: User asked to start the portfolio build and authorized sub-agent implementation.
- Record: Root implemented Fastify/Zod API and SQLite outbox; UI sub-agent implemented React/Vite interface. Backend stores orders/events/actions with transactions, deduplication and capped retries. 25 meaningful tests passed and UI walkthrough verified main paths. Node24+ required for built-in SQLite.
- Impact: `npm run dev` starts UI4300/API4310; `npm run build && npm start` serves the built UI on4310. Run one server per SQLite file. All providers are simulated; actual Zapier configuration must be demonstrated separately. SQL-backed state is authoritative, frontend polls every4s.
- References: README.md, doc/architecture.md, doc/verification.md, server/engine.ts

### 2026-10-08 - Independent portfolio repository

- Type: Constraint
- Status: Active
- Context: User requested that the Upwork repository retain plans while the portfolio repository contains only its own materials.
- Record: Created a local application scaffold with README, repository instructions, and ignores. No dependencies installed or services connected.
- Impact: Maintain implementation documentation here without copying job search records or application drafts.
- References: README.md, AGENTS.md

### 2026-10-08 - Connected bridge and deployment preparation

- Type: Decision
- Status: Active
- Context: User authorized continuing consecutive portfolio steps until a concrete blocker.
- Record: Added authenticated receipts, per-order queue sequencing, real task ID verification, bounded retries and reconciliation of ambiguous outcomes. HTTP 200 from Zapier only acknowledges ingress. Connected mode cannot run local failure injection. Public binding requires an access password; connected mode requires HTTPS callbacks and an explicit persistent database. Docker deployment files are prepared; Docker is unavailable locally.
- Impact: 35 tests and production build passed. Separate real Zapier action test created a synthetic ClickUp task. Workflow drafts still need callback steps and end-to-end acceptance. GitHub sign-in blockage was resolved in the later hosting-budget entry. No paid plan or public deployment completed. Keep real account IDs, hooks and screenshots in ignored workspace files.
- References: server/bridge.ts, tests/bridge.test.ts, doc/connected-setup.md, doc/verification.md
