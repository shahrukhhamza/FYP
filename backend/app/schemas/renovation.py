from datetime import date

from pydantic import BaseModel, Field

from app.domain.estimation.data import RATES_SOURCED_DATE
from app.domain.estimation.types import City, QualityGrade, RenovationWorkItem
from app.schemas.estimate import CategoryBreakdown


class RenovationRequest(BaseModel):
    length_ft: float = Field(gt=0, le=200)
    width_ft: float = Field(gt=0, le=200)
    height_ft: float = Field(default=9, gt=0, le=20)
    work_items: list[RenovationWorkItem] = Field(min_length=1)
    city: City
    quality_grade: QualityGrade


class RenovationResponse(BaseModel):
    floor_area_sqft: float
    wall_area_sqft: float
    items: list[CategoryBreakdown]
    total_cost_low_pkr: float
    total_cost_high_pkr: float
    rates_sourced_date: date = RATES_SOURCED_DATE
    disclaimer: str = (
        f"Preliminary estimate only, not a binding quotation. Material rates are sourced "
        f"estimates (updated {RATES_SOURCED_DATE.isoformat()}); tile adhesive rate, "
        f"material quantity ratios, labour benchmarks and the door/window wall-area "
        f"deduction are still unverified."
    )


class RenovationOptions(BaseModel):
    work_items: list[RenovationWorkItem]
    cities: list[City]
    quality_grades: list[QualityGrade]
