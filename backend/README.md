# TAMEER Backend

FastAPI backend — the single source of truth for all business logic (estimation engine, rate database, chatbot tool-calling). The web app and, later, the Android app are both thin clients of this API; no logic should be duplicated in either.

## Setup

```bash
python3.12 -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

## Run

```bash
uvicorn app.main:app --reload
```

- API: http://localhost:8000
- Interactive docs (OpenAPI): http://localhost:8000/docs
- Health check: http://localhost:8000/api/v1/health

## Structure

```
app/
  main.py            # FastAPI app, CORS, router mounting
  core/config.py      # Settings (env-driven)
  api/v1/
    router.py         # aggregates all v1 routers
    endpoints/         # one file per resource (health, estimate, rates, ...)
```

Every new feature gets its own router under `app/api/v1/endpoints/`, included in `app/api/v1/router.py`. Keep endpoint contracts (request/response models) stable — the frontend and the future mobile app both depend on them.
