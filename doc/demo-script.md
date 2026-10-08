# Two-minute portfolio walkthrough

Preparation script, not a recording or completed acceptance report. Use the current verified mode and state its limits. Update narration only after the connected acceptance checklist passes.

| Time | Screen/action | Narration and required evidence |
|---|---|---|
| 0–15s | Order overview | “Parcel keeps order intake, package progress and fulfillment exceptions in one place. This is a personal demo using synthetic data.” Show the execution mode label. |
| 15–40s | Intake and order detail | Submit a synthetic two-package order. Show validation and the queued action. In connected mode, wait for a receipt and inspect the resulting ClickUp task; do not present this segment as live until verified. |
| 40–65s | Package progress | Deliver the first package, then the second. “One delivered package is partial fulfillment. The order completes only when both arrive.” Tracking injection must remain visibly synthetic. |
| 65–85s | Repeat the delivered event | Show the ignored event and unchanged state. Compare action counts before/after instead of assuming no duplicate from a status badge. |
| 85–105s | Exceptions/activity | Show a reproducible simulation recovery. Explain that an uncertain real-service timeout requires reconciliation before replay; do not inject simulated failures in connected mode. |
| 105–120s | Delivery and boundaries | “The package includes fixtures, tests, workflow mappings and maintenance instructions.” Name verified integrations and pending ones accurately. |

## Five useful screenshots

1. Overview: main operational question and mode label visible.
2. Order detail: two packages and partial fulfillment.
3. Real provider evidence: matching synthetic order ID and task/message, after verification.
4. Activity or exception: action attempts, outcome and next operator action.
5. Workflow diagram: trigger, provider action and receipt, with secrets hidden.

Never record webhook URLs, receipt tokens, passwords, browser account menus or unrelated projects. Private account evidence stays in ignored workspace/ until a sanitized export is prepared.

## Publication checks

- The linked demo opens and the supplied demo access works; HTTPS and persistence are verified.
- Every “live” segment has matching app, Zap and provider evidence, including a receipt.
- Keyboard focus, narrow-screen layout, loading/empty/error states are inspected; record actual results in verification.md.
- The case study separates tested behavior, simulation and pending acceptance.
- The owner can explain package aggregation, duplicate events and uncertain external outcomes.
- No business impact or client testimonial is implied without real evidence.
