from fastapi import APIRouter

from app.api.v1.endpoints import health

api_router = APIRouter()
api_router.include_router(health.router)

# Future routers plug in here, each behind its own fixed contract so the
# frontend (and, later, the mobile app) never depends on how a route is
# implemented internally:
#   api_router.include_router(estimate.router)   # instant estimate + BOQ
#   api_router.include_router(rates.router)      # daily material rates
#   api_router.include_router(renovation.router) # renovation estimator
#   api_router.include_router(assistant.router)  # in-app AI assistant
