# Connected demo setup

The connected bridge is implemented and tested with mocked transport. It has not been deployed or validated end to end. The account setup and a Zapier draft are separate evidence, not proof of this application running live.

## Required runtime

Use one Node 24+ instance, a dedicated persistent SQLite file, an HTTPS public base URL and four Zapier Catch Hook endpoints. Do not run connected mode against the simulation database. The Dockerfile supplies a Node26 runtime; initial Railway build passed; a volume ownership error required a startup fix. The container initializes `/data` ownership, drops to uid/gid1000, then imports the application. Runtime acceptance remains pending. Mount persistent storage at `/data`. TLS terminates at the hosting provider. Do not run this service behind a path-rewriting proxy; preserve the original route and origin.

Copy `.env.example`, populate secrets privately, select `EXECUTION_MODE=connected`, and set a dedicated `DATABASE_PATH`. Never expose these variables to Vite or publish them in screenshots. Start with `node --env-file=.env build/server/index.js` after `npm run build`. Hosting platforms should inject environment variables directly. Public binding and connected mode require a 16+ character demo password; callbacks require a 32+ character receipt token.

Browser access uses HTTP Basic username `demo`. The same protection applies to operational APIs and assets. `/health` returns only readiness. The callback endpoint requires its own Bearer credential. Cross-origin writes are rejected. Authentication is intended for a restricted portfolio demo, not a multi-user client service.

## Workflow contract

Create these draft Zaps using the dedicated demo accounts only:

| Action | Provider step | Mappings |
|---|---|---|
| create_task | ClickUp Create Task | Dedicated list; name=`task_name`, description=`task_description` |
| update_task | ClickUp Update Task | task ID=`task_id`, status=`clickup_status`, description=`task_description` |
| notify | Slack Send Channel Message | Dedicated demo channel; text=`message` |
| daily_digest | Slack Send Channel Message | Same channel; text=`message` |

Each starts with Webhooks by Zapier Catch Hook. Each ends with Webhooks by Zapier POST to `callback_url`, JSON payload `{action_id, attempt, outcome:"succeeded"}` and HTTP `Authorization` header mapped from `callback_authorization`. The create-task receipt additionally maps `task_id` to the ID returned by ClickUp. Never put credentials in the query string. The receipt POST runs only after the provider action succeeds. Use a real public callback URL for testing before publishing. Receipt tokens appear in private Zap test data; keep recordings and screenshots away from those fields.

`clickup_status` maps delivered to `complete`, other states to `to do`; verify these statuses exist in the demo list. Parcel retains the finer shipment state. The bridge serializes actions per order, so task updates and notifications wait for predecessors to succeed. Separate notification and update hooks support separate retry/reconciliation outcomes. Existing Zapier user connections do not automatically enable these workflows.

The daily digest currently runs on demand; a timed daily trigger remains to configure and verify. No real tracking number is submitted to AfterShip. Shipment events remain synthetic even with real ClickUp and Slack actions.

## Failure handling

The bridge persists `awaiting_receipt` before network I/O. Ingress HTTP200 means acceptance only. Authenticated receipts complete actions and store real task IDs. Successful duplicate receipts are ignored; conflicting receipts and wrong attempt numbers return409. Replay requires a failed action and is blocked for ambiguous outcomes. Missing receipts and network/5xx uncertainty stop for reconciliation; inspect Zap history and the external task/message, then submit the matching receipt. Never automatically resend an ambiguous task creation or message.

Explicit ingress429 or a `rate_limit` failure receipt can retry up to three attempts. Failure receipts must identify `error_code` as `rate_limit`, `invalid_configuration` or `provider_failure`; raw provider error bodies are deliberately not stored. Configuration failures can be replayed after correction. Do not manually classify an ambiguous outcome as a definitive failure to force replay.

## Acceptance evidence still required

1. Submit a synthetic order from the app; verify one ClickUp task, its real ID in Parcel and a succeeded receipt.
2. Deliver one of two packages; verify partial state. Deliver the second; verify complete status and channel notifications.
3. Repeat an event; verify no new task update or notification.
4. Test rate limit, missing receipt and process restart; reconcile safely and verify queue outcomes.
5. Trigger and verify a daily scheduled summary, then record screenshots/video without credentials.
