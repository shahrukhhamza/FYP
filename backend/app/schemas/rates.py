from datetime import date
from typing import Literal

from pydantic import BaseModel

from app.domain.estimation.data import RATES_SOURCED_DATE
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
    rates_sourced_date: date = RATES_SOURCED_DATE
    disclaimer: str = (
        f"Today's rate is a sourced estimate (updated {RATES_SOURCED_DATE.isoformat()}), "
        f"not a live feed. The 14-day trend and history shown are still fabricated for "
        f"demonstration — not yet backed by real historical data or the Daily Material "
        f"Rates admin tool."
    )
