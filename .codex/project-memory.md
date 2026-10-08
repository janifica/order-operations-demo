# Project Memory

This file records knowledge for this application repository only.

## Current Conventions

- Only application code, tests, synthetic fixtures, runtime documentation, and demo assets belong here. Career planning and selection rationale stay in the sibling upwork-workflow repository.
- English product and portfolio materials; Chinese user communication.
- Default local simulation and connected Zapier bridge implemented. Automatic intake/fulfillment/Slack receipt acceptance and protected deployment passed; scheduled catch-up/restart acceptance passed; final UI acceptance passed; repeatable media pipeline and120-second MP4 verified; Upwork publication pending. Private hooks and SQLite data stay ignored in workspace/.

## Log

### 2026-10-08 - Motion-led portfolio video

- Type: Constraint | Change
- Status: Active
- Context: User wants a more polished, juicy video with less text and simple UI animations instead of static slides.
- Record: One component per scene, short headlines, Engine-backed animated package progress/state switches, CSV grouping, duplicate rejection, workflow particles, spring entrances and evidence camera moves. Original UI tones are synthesized deterministically with no external audio. Scene IDs bind the timeline to components; temporary encoding output only replaces the deliverable after success. Check-only runs write a separate report. Rendering still sends no SaaS actions.
- Verification: Complete120-second1080p/30fps H.264+AAC render passed;37 input/output hashes matched. Selected scene/state frames inspected;42 tests/build and media types passed. Original audio regeneration hash matched.
- References: media/src/scenes/, media/src/motion.tsx, media/scripts/sound.mjs, doc/video-pipeline.md


### 2026-10-08 - Repeatable video pipeline and browser access resolved

- Type: Decision | Change
- Status: Active
- Context: User requires a repeatable pipeline after UI/detail changes instead of manual agent recordings.
- Record: Use actual Engine replay and App presentation props with no polling, not a separately maintained UI replica. Remotion consumes fixed synthetic states plus separately dated real ClickUp/Slack evidence; npm run video regenerates preview/MP4/hash manifest without SaaS actions. Media dependencies stay separate and are excluded from Docker. Hosted Chrome access passed after user login; PORTFOLIO-2001 automatically created real task z8r3fdrbht, reached COMPLETE, produced both Slack messages and five succeeded first-attempt receipts.
- Impact: Browser blocker is resolved, superseding older blocked-access entries. Never imply video rerender reverified a real provider. Keep synthetic replay and dated provider evidence labeled.
- References: doc/video-pipeline.md, media/scripts/pipeline.mjs, client/App.tsx
- Verification: H.2641920×1080/30fps/3600frames/120seconds;23 inputs and output hash matched. Repeated replay inputs were identical. Chrome for Testing is pinned as the rendering mode after default Headless Shell ICU startup failure.


### 2026-10-08 - Mode wording and loading acceptance

- Type: Change
- Status: Active
- Record: Header previously hardcoded Local simulation in connected mode. Mode labels now follow the API result, with an explicit unknown/loading label before fetch completion. Connection errors no longer tell hosted viewers to start a local API. Local delayed-response acceptance showed the loading state; empty search and conflict error feedback passed. Four labeled simulation/connected screenshots published in assets/.
- Impact: Final connected recording and Upwork upload remain pending because agent Chrome blocks hosted Basic-auth navigation; user phone login succeeded.
- References: client/App.tsx, doc/verification.md, assets/README.md

### 2026-10-08 - Narrow-screen overflow correction

- Type: Discovery
- Status: Resolved
- Record: At390px width, the absolute .sr-only table heading escaped its scroll container and expanded document width to596px. Anchoring left/top0 keeps accessibility text while restoring page width375px; table scroll remains contained. Native modal Tab and Escape passed. Hosted phone desktop-site mode is only a possibility, not verified.
- References: client/styles.css, doc/verification.md

### 2026-10-08 - Connected fulfillment and durable daily scheduler

- Type: Change
- Status: Active
- Record: Published fulfillment Zap uses existing ClickUp OAuth API Request PUT, with Code by Zapier JSON.stringify for safe multiline bodies. Automatic second-package update set the real task COMPLETE; ordered Slack notifications and receipts passed. Duplicate and old events queued no extra actions. Added optional DAILY_DIGEST_TIME/DAILY_DIGEST_TIME_ZONE scheduling in the existing worker, with atomic digest_runs + action persistence, one run per zone/local date, today-only catch-up and no blind resend of failed/ambiguous actions.42 tests and build passed; hosted catch-up/Slack receipt and confirmed restart deduplication passed.
- Impact: No extra SaaS or dependencies. Use separate connected database; do not claim real carrier tracking. Existing intake/notification entry's fulfillment-pending state is superseded.
- References: server/scheduler.ts, tests/scheduler.test.ts, doc/verification.md


### 2026-10-08 - Automatic connected intake and notification publication

- Type: Change
- Status: Active
- Context: User supplied a successful phone login screenshot; continue real workflow acceptance.
- Record: Switched runtime to connected mode with a separate persistent database. Published intake Zap v1; CONNECTED-AUTO-002 automatically created a real ClickUp task, stored its ID and succeeded receipt; duplicate intake produced no extra action. Notifications Zap v1 passed Slack message and receipt setup tests. The phone screenshot verifies frontend access, though agent Chrome still blocks Basic-auth navigation.
- Impact: Order creation is connected and verified. Native ClickUp Update Task currently lacks a visible status field; investigate its authenticated API Request action. Fulfillment acceptance and scheduled digest remain pending. Zapier premium trial ends2026-10-22; no paid plan approved or bought.
- References: doc/verification.md, doc/connected-setup.md

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
