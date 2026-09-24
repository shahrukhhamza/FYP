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
  main.py              # FastAPI app, CORS, router mounting
  core/config.py       # Settings (env-driven)
  api/v1/
    router.py          # aggregates all v1 routers
    endpoints/          # one file per resource (health, estimate, rates, ...) — HTTP layer only
  schemas/               # Pydantic request/response models — the API contract
  domain/estimation/
    types.py             # shared enums (PlotSize, City, QualityGrade, ...)
    data.py               # ALL placeholder bylaw/ratio/rate numbers, isolated and heavily commented
    engine.py              # the actual quantity-takeoff + pricing logic
```

Every new feature gets its own router under `app/api/v1/endpoints/`, included in `app/api/v1/router.py`. Keep endpoint contracts (request/response models in `app/schemas/`) stable — the frontend and the future mobile app both depend on them.

**`app/domain/estimation/data.py` is placeholder data**, not verified figures — see the module docstring. When real bylaw/material-ratio/rate data is available, that file is the only thing that should need to change; `engine.py` should not.

## Checks before committing

```bash
pip install -r requirements-dev.txt
ruff check app/
mypy app/ --ignore-missing-imports
```
