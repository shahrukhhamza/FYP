from datetime import date
from typing import Literal

from pydantic import BaseModel

from app.domain.estimation.types import City

TrendDirection = Literal["up", "down", "flat"]


class RateHistoryPoint(BaseModel):
    date: date
    rate_pkr: float


class MaterialRate(BaseModel):
    material: str
    label: str
    unit: str
    rate_pkr: float
    trend_direction: TrendDirection
    trend_pct: float
    history: list[RateHistoryPoint]


class RatesResponse(BaseModel):
    city: City
    rates: list[MaterialRate]
    disclaimer: str = (
        "Today's rate is a sourced estimate (updated 2026-09-25), not a live feed. The "
        "14-day trend and history shown are still fabricated for demonstration — not yet "
        "backed by real historical data or the Daily Material Rates admin tool."
    )
