from datetime import date

from pydantic import BaseModel, Field

from app.domain.estimation.data import RATES_SOURCED_DATE
from app.domain.estimation.types import City, QualityGrade, Storeys
from app.schemas.estimate import CategoryBreakdown


class RoomGroup(BaseModel):
    """One or more identical rooms — "4 bedrooms, 6ft x 7ft each" is
    count=4, length_ft=6, width_ft=7. Add multiple groups to describe a
    whole house (bedrooms + kitchen + lounge + ...)."""

    label: str = Field(min_length=1, max_length=50)
    count: int = Field(default=1, ge=1, le=20)
    length_ft: float = Field(gt=0, le=100)
    width_ft: float = Field(gt=0, le=100)


class RoomEstimateRequest(BaseModel):
    rooms: list[RoomGroup] = Field(min_length=1, max_length=20)
    height_ft: float = Field(default=9, gt=0, le=20)
    storeys: Storeys
    city: City
    quality_grade: QualityGrade


class RoomEstimateResponse(BaseModel):
    total_floor_area_sqft: float
    total_wall_area_sqft: float
    categories: list[CategoryBreakdown]
    total_cost_low_pkr: float
    total_cost_high_pkr: float
    rates_sourced_date: date = RATES_SOURCED_DATE
    disclaimer: str = (
        f"Preliminary estimate only, not a binding quotation. Material rates are sourced "
        f"estimates (updated {RATES_SOURCED_DATE.isoformat()}). Floor and wall areas are "
        f"computed directly from the room dimensions you entered (exact geometry, not a "
        f"plot-size approximation), but the material-quantity-per-sqft ratios applied to "
        f"them, the door/window wall-area deduction, and the RCC structural quantities are "
        f"still standard rule-of-thumb figures, not a structural engineer's calculation."
    )
