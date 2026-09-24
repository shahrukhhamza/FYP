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
        "Placeholder seed rates and fabricated trend history — not yet backed by the live "
        "Daily Material Rates admin data."
    )
