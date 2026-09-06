# Gazie Commute AI Development Rules

## Project
Gazie Commute is a community-verified commuting platform for people travelling along the same routes.

## Current Stack
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase
- Vercel

## Source of Truth
- `main` is the stable integration branch.
- Do not make feature work directly on `main`.
- Codex works from `codex-dev`.
- Antigravity works from `antigravity-dev`.
- Merge completed, tested work into `main` only after review.

## Codex Ownership
Codex should primarily handle:
- application architecture
- Supabase database work
- authentication and authorization
- Row Level Security policies
- server actions and APIs
- route matching/business logic
- validation
- security review
- automated tests
- performance and code-quality fixes

Codex should avoid redesigning UI unless explicitly assigned.

## Antigravity Ownership
Antigravity should primarily handle:
- UI and UX
- responsive layouts
- onboarding flows
- dashboards
- forms and interaction states
- accessibility
- browser-based verification
- visual polish
- frontend integration with existing APIs

Antigravity should not change database schema, RLS policies, authentication architecture, or core backend contracts unless explicitly assigned.

## Shared Rules
1. Inspect existing code before changing it.
2. Preserve working functionality unless a task explicitly replaces it.
3. Reuse existing components, utilities, types, and patterns before creating duplicates.
4. Never expose Supabase service-role credentials or other secrets to the browser.
5. Never commit `.env`, `.env.local`, API keys, passwords, tokens, or credentials.
6. Keep schema changes in migrations and document any breaking change.
7. Avoid editing the same files simultaneously across agents.
8. If a task requires a shared contract, agree through types/interfaces before implementing dependent work.
9. Keep commits small and descriptive.
10. Before marking work complete, run:
   - `npm run lint`
   - `npm run build`
11. Do not deploy production changes or merge into `main` automatically unless explicitly instructed.

## Coordination
Before starting a task, state:
- files/areas you expect to change
- whether the task touches backend, frontend, or both
- any shared contracts or migrations involved

If another agent is likely to touch the same files, stop and flag the overlap instead of competing for the files.

## Completion Report
At the end of each task, report:
- what changed
- files changed
- migrations/config changes
- tests/checks run
- unresolved issues
- recommended merge order, if relevant
