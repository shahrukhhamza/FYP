# Build Phases

Execution order for the FYP build. Each phase should be demo-able before moving to the next.

- [x] **Phase 0 — Foundation.** Repo structure, Next.js + FastAPI scaffolds, design tokens, base layout, CI-less local tooling (lint/build) verified.
- [x] **Phase 1 — Design System & Landing Page.** Reusable UI components (shadcn-based), dark/light theme, and a real landing page matching the product positioning.
- [x] **Phase 2 — Estimation Engine + API.** Quantity-takeoff logic (`POST /api/v1/estimate`) and material rates (`GET /api/v1/rates`), backed by placeholder-but-isolated data (see `backend/app/domain/estimation/data.py`) pending real bylaw/ratio/rate verification. No persistent DB yet — seed data in code; real storage lands once the Daily Material Rates admin UI (Phase 4) needs it.
- [x] **Phase 3 — Instant Estimate Flow.** Real `/estimate` page: form → `POST /api/v1/estimate` → itemized breakdown with category bars and an expandable per-material accordion. Frontend types are generated from the backend's live OpenAPI schema (`npm run types:api`) via openapi-typescript/openapi-fetch, so the API contract can't silently drift between the two.
- [ ] **Phase 4 — Daily Material Rates Page.** Public rates table + trend indicator, admin entry interface.
- [ ] **Phase 5 — Renovation Estimator.**
- [ ] **Phase 6 — Accounts, Auth, Saved Estimates, PDF Report Export.**
- [ ] **Phase 7 — In-webapp AI Assistant.**
- [ ] **Phase 8 — Quote/Lead Request Flow + Site Diary.**
- [ ] **Phase 9 — CV/ML Integration Hookup.** Swap stub endpoints for the real floor-plan/photo-measurement models once ready — the API contracts from Phase 2 make this a drop-in, not a rewrite.

Mobile app (Android) is the final phase, after the webapp is functionally complete — see the root `README.md` for the architecture reasoning (API-first backend so it's a thin client, not a rebuild).
