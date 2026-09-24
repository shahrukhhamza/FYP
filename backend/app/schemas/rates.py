from pydantic import BaseModel

from app.domain.estimation.types import City


class MaterialRate(BaseModel):
    material: str
    label: str
    unit: str
    rate_pkr: float


class RatesResponse(BaseModel):
    city: City
    rates: list[MaterialRate]
    disclaimer: str = "Placeholder seed rates — not yet backed by the live Daily Material Rates admin data."
