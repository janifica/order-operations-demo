# Release acceptance

Current state: local UI/domain behavior and the receipt bridge are implemented; 35 tests and production build passed. A separate real ClickUp task-creation action test passed. Full connected acceptance, deployment and final media are pending.

## Engineering release checklist

- [x] Publish full source, lockfile, synthetic fixtures and runtime documentation to https://github.com/janifica/order-operations-demo (source snapshot 07212c5).
- [ ] Deploy one protected Node instance with HTTPS, a dedicated SQLite file and persistent storage. Verify restart durability and health checks.
- [x] User authorized and Railway confirmed a $10/period workspace compute hard limit with an $8 alert. The limit stops all shared projects when reached. Maintain the application's $5/month resource target; the workspace cap is not a per-project cap.
- [ ] Intake: submit an order from Parcel, inspect one matching ClickUp task, receive its actual ID and a matching succeeded receipt. Repeat intake and verify task count.
- [ ] Fulfillment: deliver one of two synthetic packages, then the other; verify partial/completed state, real task updates, Slack messages and receipts.
- [ ] Events: repeat an event and send an older event; verify no extra provider actions and no state regression.
- [ ] Reliability: verify definitive retry handling, missing-receipt reconciliation, restart continuity and operator recovery. Do not inject local simulator failures into connected mode.
- [ ] Daily digest: implement scheduling and persist a run key for the selected time zone. Define missed-run behavior, prevent duplicate scheduling after restart and verify a real message/receipt. Ambiguous sends must reconcile before resend.
- [ ] UI: inspect narrow-screen layout, keyboard focus, loading/empty/error states and terminology. Record actual findings.
- [ ] Update verification.md and case-study.md from observed evidence, then capture sanitized screenshots and a two-minute recording using demo-script.md.

## Existing stack and planned additions

React/TypeScript/Vite/CSS provides the console. Node/Fastify/Zod provides validation, rules and authenticated endpoints. SQLite transactions and the outbox persist state and actions. Zapier dispatches ClickUp and Slack steps and returns authenticated receipts. Docker and Railway provide the planned single-instance deployment. Vitest, TypeScript builds and browser acceptance provide validation.

Planned daily scheduling uses the existing Node worker and SQLite run records; it is not implemented yet. Actual carrier tracking and LLM summaries are optional follow-up work. No separate Redis, hosted database, scheduling SaaS or AI dependency is needed for this release.

Publication to Upwork and career-specific planning remain in the sibling upwork-workflow repository.
