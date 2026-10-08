# Parcel: Reliable Order-to-Fulfillment Workflows

Personal portfolio demonstration. Synthetic customers and shipment events. Built with AI-assisted implementation and review.

## The operational problem

An order can ship in several packages. If a workflow marks it complete when the first package arrives, the fulfillment team loses track of unfinished work. Repeated events can also produce repeated updates, while a network timeout may leave an operator unsure whether an external action happened.

Parcel models these situations in an operations console: order intake, package progress, fulfillment actions and exceptions appear together.

## Three decisions that shape the workflow

**Track packages before completing orders.** Order status is aggregated across packages. Partial delivery remains visible until every package is delivered. Duplicate and older events are ignored.

**Persist the action before contacting another service.** SQLite transactions save business changes and queued actions together. The connected bridge waits for an authenticated execution receipt; a webhook acknowledgment alone does not mark success.

**Reconcile uncertain outcomes before replay.** A timeout could occur after a task was created. Parcel exposes the uncertainty and blocks blind replay. Definitive rate-limit failures can use bounded retries; ambiguous actions need external verification.

## What has been verified

| Evidence | Current result |
|---|---|
| Automated domain, bridge and HTTP checks | 42 tests passed; production build passed |
| Local browser walkthrough | Partial/full delivery, ignored events, CSV validation and simulated recovery verified |
| Full app → Zapier → ClickUp/Slack → receipt | Automatic task creation, two-package completion and channel notifications passed on Railway |
| Daily schedule | Restart-safe implementation and local tests passed; hosted scheduled acceptance pending |
| Real carrier tracking | Not included; shipment events are synthetic |

See [verification](verification.md) for the scope of each check. All logistics events and customers in these runs are synthetic.

## Delivery package

React/TypeScript console, Fastify API, persistent SQLite outbox, synthetic fixtures, tests and [connection/maintenance instructions](connected-setup.md). The [two-minute walkthrough](demo-script.md) specifies the evidence to capture before publication.

This is an independent demonstration, not previous client work. Client revenue, adoption and time savings have not been measured. The owner should describe their actual decisions and AI-assisted contribution when presenting it.

## Short portfolio summary

Parcel is a personal order-operations demo that tracks multi-package delivery and exposes queued actions, retries and exceptions. Its deployed Zapier bridge creates and updates real ClickUp tasks and posts real Slack notifications, with authenticated execution receipts. All customer and shipment data is synthetic.
