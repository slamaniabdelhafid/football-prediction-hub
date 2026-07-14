# Football Prediction Hub — Build Plan

Full spec: Next.js (frontend) + FastAPI (backend), mock data now, real API later.

## Stages
- [x] Stage 1 — Scaffold: folder structure, design system, backend mock API (leagues/teams/matches/standings/predictions), shared TS types
- [x] Stage 2 — Frontend: Homepage (featured, today/tomorrow/yesterday, top predictions, popular leagues)
- [x] Stage 3 — Frontend: Leagues index page (all countries/leagues) + League detail page (standings/fixtures/results)
- [x] Stage 4 — Frontend: Match Details page (prediction bars, BTTS/O-U, form, H2H, stats)
- [x] Stage 5 — Admin dashboard (stats, feature/hide matches, manual sync trigger, logs — mocked)
- [x] Stage 6 — Search + filters, light/dark mode, responsive polish
- [x] Stage 7 — Real API wiring guide (Football-Data.org), daily sync job (APScheduler), deployment notes for Hostinger/WSL
- [x] Stage 8 — Cup competitions (real 2026 World Cup data), improved predictions (recent form + knockout logic), data-source transparency badges

## Status: ALL STAGES COMPLETE

## How to continue
Each stage is self-contained and written to disk under `frontend/` and `backend/`.
When resuming, just say "continue" — the plan above tracks what's left.

## Design direction (see docs/DESIGN.md)
"Floodlit pitch at night" — deep navy/charcoal base, turf-green + scoreboard-amber accents,
condensed display type for scores/numbers, dense stat tables like a real sports data product
(not a generic dark-mode SaaS dashboard).

## Stack decisions
- Frontend: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion
- Backend: FastAPI + Pydantic, mock data layer now, swappable for real DB (PostgreSQL) later
- Data source (Stage 7): Football-Data.org free tier (simplest free API, good docs, no key hassle)
