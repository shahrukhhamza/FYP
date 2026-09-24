# Build Phases

Execution order for the FYP build. Each phase should be demo-able before moving to the next.

- [x] **Phase 0 — Foundation.** Repo structure, Next.js + FastAPI scaffolds, design tokens, base layout, CI-less local tooling (lint/build) verified.
- [x] **Phase 1 — Design System & Landing Page.** Reusable UI components (shadcn-based), dark/light theme, and a real landing page matching the product positioning.
- [ ] **Phase 2 — Estimation Engine + API.** Quantity-takeoff logic, rate DB schema, core endpoints (`/api/v1/estimate`, `/api/v1/rates`).
- [ ] **Phase 3 — Instant Estimate Flow.** Plot size/storeys/city/quality form → itemized breakdown UI. The flagship screen.
- [ ] **Phase 4 — Daily Material Rates Page.** Public rates table + trend indicator, admin entry interface.
- [ ] **Phase 5 — Renovation Estimator.**
- [ ] **Phase 6 — Accounts, Auth, Saved Estimates, PDF Report Export.**
- [ ] **Phase 7 — In-webapp AI Assistant.**
- [ ] **Phase 8 — Quote/Lead Request Flow + Site Diary.**
- [ ] **Phase 9 — CV/ML Integration Hookup.** Swap stub endpoints for the real floor-plan/photo-measurement models once ready — the API contracts from Phase 2 make this a drop-in, not a rewrite.

Mobile app (Android) is the final phase, after the webapp is functionally complete — see the root `README.md` for the architecture reasoning (API-first backend so it's a thin client, not a rebuild).
