# Demonstration images

All customers, orders and shipment events are synthetic. These are actual screenshots, not rendered mockups.

| File | Evidence and suggested caption |
|---|---|
| overview-partial-simulation.jpg | Local simulation: order overview with partial fulfillment visible. |
| order-partial-simulation.jpg | Local simulation: one delivered package leaves the two-package order partially delivered; simulated task ID remains visible. |
| clickup-connected-complete.jpg | Connected Railway workflow: CONNECTED-AUTO-002 reached COMPLETE in the dedicated ClickUp list after both synthetic packages were delivered. |
| slack-connected.jpg | Connected workflow: actual partial/completed alerts and the scheduled daily catch-up summary in the dedicated Slack channel. |

Keep simulation images labeled as simulation. The external images show real provider outputs; matching automatic receipt evidence is described in ../doc/verification.md. The video uses repeatable offline UI replay plus separately dated connected evidence; it is not a continuous live recording. Images contain no webhook URLs, receipt tokens or demo password.

## Desktop captures — 2026-10-08 (Asia/Shanghai)

- `overview-connected.jpg`: hosted connected console before the new walkthrough.
- `intake-connected.jpg`: two synthetic CSV rows before import.
- `order-pending-connected.jpg`: imported PORTFOLIO-2001 with actual task ID and two pending packages.
- `order-partial-connected.jpg`: one delivered package, partial order.
- `order-complete-connected.jpg`: both packages delivered.
- `clickup-portfolio-complete.jpg`: matching real task z8r3fdrbht in COMPLETE.
- `slack-portfolio-connected.jpg`: actual partial/full demo-channel notifications at19:27:00 and19:27:19.
- `receipts-connected.jpg`: five corresponding actions succeeded on attempt1.

Real provider captures are historical verification evidence. Regenerating the video does not refresh or rerun them.
