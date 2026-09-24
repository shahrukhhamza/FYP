from datetime import date

from pydantic import BaseModel, Field

from app.domain.estimation.data import RATES_SOURCED_DATE
from app.domain.estimation.types import City, QualityGrade, RoomType, Storeys
from app.schemas.estimate import CategoryBreakdown


class RoomGroup(BaseModel):
    """One or more identical rooms — "4 bedrooms, 6ft x 7ft each, 1 door,
    1 window" is room_type=bedroom, count=4, length_ft=6, width_ft=7,
    doors=1, windows=1. Add multiple groups to describe a whole house."""

    room_type: RoomType
    label: str | None = Field(default=None, max_length=50)
    count: int = Field(default=1, ge=1, le=20)
    length_ft: float = Field(gt=0, le=100)
    width_ft: float = Field(gt=0, le=100)
    doors: int = Field(default=1, ge=0, le=5)
    windows: int = Field(default=1, ge=0, le=6)


class RoomEstimateRequest(BaseModel):
    rooms: list[RoomGroup] = Field(min_length=1, max_length=20)
    height_ft: float = Field(default=9, gt=0, le=20)
    storeys: Storeys
    city: City
    quality_grade: QualityGrade


class RoomEstimateResponse(BaseModel):
    total_floor_area_sqft: float
    total_wall_area_sqft: float
    wet_floor_area_sqft: float
    dry_floor_area_sqft: float
    total_doors: int
    total_windows: int
    categories: list[CategoryBreakdown]
    total_cost_low_pkr: float
    total_cost_high_pkr: float
    rates_sourced_date: date = RATES_SOURCED_DATE
    disclaimer: str = (
        f"Preliminary estimate only, not a binding quotation. Material rates are sourced "
        f"estimates (updated {RATES_SOURCED_DATE.isoformat()}). Floor and wall areas, door "
        f"and window counts are computed directly from what you entered (exact geometry, not "
        f"a plot-size approximation). Wet-area (kitchen/bathroom) cost multipliers, per-opening "
        f"door/window costs, material-quantity-per-sqft ratios, and RCC structural quantities "
        f"are still rule-of-thumb industry figures, not a structural engineer's calculation."
    )
