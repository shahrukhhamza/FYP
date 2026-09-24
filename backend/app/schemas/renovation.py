from pydantic import BaseModel, Field

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
    disclaimer: str = (
        "Preliminary estimate only, not a binding quotation. Material quantity ratios, "
        "labour benchmarks and the door/window wall-area deduction are placeholder values "
        "pending verification."
    )


class RenovationOptions(BaseModel):
    work_items: list[RenovationWorkItem]
    cities: list[City]
    quality_grades: list[QualityGrade]
