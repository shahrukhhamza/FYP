# TAMEER Frontend

Next.js (App Router, TypeScript) + Tailwind CSS v4 + shadcn/ui. This is a thin client of the `backend/` FastAPI API — it should not hold business logic; anything computing an estimate, rate, or answer belongs in the backend.

## Setup

```bash
npm install
cp .env.example .env.local
```

## Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The backend (`../backend`) needs to be running on port 8000 for any page that calls the API (e.g. `/estimate`).

## API types

`src/lib/api/schema.d.ts` is generated from the backend's live OpenAPI schema, not hand-written. After changing any backend endpoint/schema, regenerate it with the backend running:

```bash
npm run types:api
```

`src/lib/api/client.ts` (an `openapi-fetch` client) and every API call are fully typed against that file — if the backend contract changes, TypeScript will flag every call site that's now wrong.

## Structure

```
src/
  app/                  # routes (App Router) — one folder per page
  components/
    ui/                 # shadcn primitives (button, card, sheet, ...) — don't hand-edit visuals here, use `npx shadcn add`
    layout/              # navbar, footer
    marketing/           # landing-page-only sections
  lib/utils.ts            # cn() and shared helpers
```

Design tokens (colors, radius) live in `src/app/globals.css` under `@theme inline` / `:root` / `.dark` — the brand navy/amber palette and full dark-mode support are already wired up there. Add UI primitives with `npx shadcn@latest add <component>` rather than writing them from scratch.

## Checks before committing

```bash
npm run lint
npm run build
```
