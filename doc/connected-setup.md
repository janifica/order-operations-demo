# Connected demo setup

The protected Railway instance runs connected mode with a dedicated persistent database. Automatic intake, two-package fulfillment updates, Slack notifications and authenticated receipts have passed real acceptance using synthetic orders. See [verification](verification.md).

## Required runtime

Use one Node 24+ instance, a dedicated persistent SQLite file, an HTTPS public base URL and four Zapier Catch Hook endpoints. Do not run connected mode against the simulation database. The Dockerfile supplies a Node26 runtime; initial Railway build passed; a volume ownership error required a startup fix. The container initializes `/data` ownership, drops to uid/gid1000, then imports the application. Hosted API intake, duplicate detection and database persistence after restart passed; user phone access and connected fulfillment have passed. Mount persistent storage at `/data`. TLS terminates at the hosting provider. Do not run this service behind a path-rewriting proxy; preserve the original route and origin.

Copy `.env.example`, populate secrets privately, select `EXECUTION_MODE=connected`, and set a dedicated `DATABASE_PATH`. Never expose these variables to Vite or publish them in screenshots. Start with `node --env-file=.env build/server/index.js` after `npm run build`. Hosting platforms should inject environment variables directly. Public binding and connected mode require a 16+ character demo password; callbacks require a 32+ character receipt token.

Browser access uses HTTP Basic username `demo`. The same protection applies to operational APIs and assets. `/health` returns only readiness. The callback endpoint requires its own Bearer credential. Cross-origin writes are rejected. Authentication is intended for a restricted portfolio demo, not a multi-user client service.

## Workflow contract

Use the dedicated demo accounts only. The three Zaps are published: intake, fulfillment updates, and notifications (also used for digests).

| Action | Provider step | Mappings |
|---|---|---|
| create_task | ClickUp Create Task | Dedicated list; name=`task_name`, description=`task_description` |
| update_task | ClickUp API Request (Beta), existing OAuth connection | PUT `https://api.clickup.com/api/v2/task/{task_id}`; JSON status=`clickup_status`, description=`task_description` |
| notify | Slack Send Channel Message | Dedicated demo channel; text=`message` |
| daily_digest | Slack Send Channel Message | Same channel; text=`message` |

Each starts with Webhooks by Zapier Catch Hook. Each ends with Webhooks by Zapier POST to `callback_url`, JSON payload `{action_id, attempt, outcome:"succeeded"}` and HTTP `Authorization` header mapped from `callback_authorization`. The create-task receipt additionally maps `task_id` to the ID returned by ClickUp. Never put credentials in the query string. The receipt POST runs only after the provider action succeeds. Use a real public callback URL for testing before publishing. Receipt tokens appear in private Zap test data; keep recordings and screenshots away from those fields.

`clickup_status` maps delivered to `complete`, other states to `to do`; verify these statuses exist in the demo list. Parcel retains the finer shipment state. The bridge serializes actions per order, so task updates and notifications wait for predecessors to succeed. Separate notification and update hooks support separate retry/reconciliation outcomes. Existing Zapier user connections do not automatically enable these workflows.

Optional scheduling uses `DAILY_DIGEST_TIME=09:00` and `DAILY_DIGEST_TIME_ZONE=Asia/Shanghai`. It queues one action per local date; startup catches up today only. SQLite persists the run key and action atomically. On-demand digests remain available independently. Hosted scheduled acceptance is pending deployment. No real tracking number is submitted to AfterShip. Shipment events remain synthetic even with real ClickUp and Slack actions.

## Failure handling

The bridge persists `awaiting_receipt` before network I/O. Ingress HTTP200 means acceptance only. Authenticated receipts complete actions and store real task IDs. Successful duplicate receipts are ignored; conflicting receipts and wrong attempt numbers return409. Replay requires a failed action and is blocked for ambiguous outcomes. Missing receipts and network/5xx uncertainty stop for reconciliation; inspect Zap history and the external task/message, then submit the matching receipt. Never automatically resend an ambiguous task creation or message.

Explicit ingress429 or a `rate_limit` failure receipt can retry up to three attempts. Failure receipts must identify `error_code` as `rate_limit`, `invalid_configuration` or `provider_failure`; raw provider error bodies are deliberately not stored. Configuration failures can be replayed after correction. Do not manually classify an ambiguous outcome as a definitive failure to force replay.

## Remaining acceptance

1. Deploy and verify a scheduled summary, then restart and confirm no second scheduled action for the same date.
2. Finish narrow-screen UI acceptance and sanitized screenshots/video.
3. Definitive rate-limit retry behavior is covered by mocked tests; no intentional real-provider rate limit was induced. Delayed setup receipts were reconciled successfully without resending ambiguous actions.

The fulfillment Zap inserts a Code by Zapier step that returns `JSON.stringify({status: inputData.status, description: inputData.description})`. Map its full `body` output into the API Request body and set Content-Type to application/json. This safely handles multiline descriptions and quotes. Native Update Task did not expose a status field in this setup. All workflows finish with the authenticated receipt step. Premium Zapier features currently run under a trial ending 2026-10-22; no paid plan was purchased.
