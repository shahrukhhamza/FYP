# Buniyad

Pakistan's trusted source for fair construction and renovation costs — an instant, no-floor-plan-required cost estimator, daily material rates, a renovation estimator, and an in-app AI assistant, backed by an itemized quantity-takeoff engine.

Final Year Project, BS Software Engineering — Capital University of Science and Technology, Islamabad

## Team

- Shahrukh Hamza (BSE233185)
- Abdul Rehman (BSE233208)
- Aater Imran (BSE233120)

Supervisor: Mam Madiha

## Status

Phases 0–6 complete: design system, estimation engine, instant estimate, daily rates, renovation estimator, and accounts/auth/saved-estimates/PDF export are all live and verified end-to-end. See `PHASES.md` for the full breakdown and what's next.

## Modules (planned)

1. Daily Material Rates
2. Instant Estimate (no floor plan needed)
3. Renovation Estimator
4. In-webapp AI Assistant
5. Site Diary (progress feed for remote/overseas owners)
6. Construction Tracker (roadmap)
7. Mobile app (Android, roadmap — last phase)

## Architecture

- **Backend** (`backend/`): Python + FastAPI. The single source of truth for all business logic (estimation engine, rate database, chatbot). API-first and versioned (`/api/v1/...`) so the web frontend and, later, the Android app are both thin clients of the same API — see `backend/README.md`.
- **Frontend** (`frontend/`): Next.js + TypeScript + Tailwind + shadcn/ui.
- **Mobile**: Android, planned as the final phase, consuming the same backend API.

## Getting started

See `backend/README.md` and `frontend/README.md` for setup.
