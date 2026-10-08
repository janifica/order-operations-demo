# Project Memory

This file records knowledge for this application repository only.

## Current Conventions

- Only application code, tests, synthetic fixtures, runtime documentation, and demo assets belong here. Career planning and selection rationale stay in the sibling upwork-workflow repository.
- English product and portfolio materials; Chinese user communication.
- Local simulation implemented; live SaaS integrations remain unimplemented. SQLite data is ignored in workspace/.

## Log

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
