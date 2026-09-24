from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    estimate,
    health,
    rates,
    renovation,
    reports,
    saved_estimates,
)

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(estimate.router)
api_router.include_router(rates.router)
api_router.include_router(renovation.router)
api_router.include_router(auth.router)
api_router.include_router(saved_estimates.router)
api_router.include_router(reports.router)

# Future routers plug in here, each behind its own fixed contract so the
# frontend (and, later, the mobile app) never depends on how a route is
# implemented internally:
#   api_router.include_router(assistant.router)  # in-app AI assistant
