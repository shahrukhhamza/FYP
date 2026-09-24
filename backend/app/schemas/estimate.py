from datetime import date

from pydantic import BaseModel, Field

from app.domain.estimation.data import RATES_SOURCED_DATE
from app.domain.estimation.types import City, PlotSize, QualityGrade, Storeys


class EstimateRequest(BaseModel):
    plot_size: PlotSize
    city: City
    storeys: Storeys
    quality_grade: QualityGrade


class MaterialLineItem(BaseModel):
    material: str
    unit: str
    quantity: float
    rate_pkr: float
    cost_pkr: float


class CategoryBreakdown(BaseModel):
    category: str
    label: str
    cost_pkr: float
    percentage: float
    materials: list[MaterialLineItem] = Field(default_factory=list)


class EstimateResponse(BaseModel):
    plot_size: PlotSize
    city: City
    storeys: Storeys
    quality_grade: QualityGrade
    built_up_area_sqft: float
    total_cost_low_pkr: float
    total_cost_high_pkr: float
    categories: list[CategoryBreakdown]
    rates_sourced_date: date = RATES_SOURCED_DATE
    disclaimer: str = (
        f"Preliminary estimate only, not a binding quotation. Material rates are "
        f"sourced estimates (updated {RATES_SOURCED_DATE.isoformat()}), not a live "
        f"feed. Bylaw coverage ratios and material quantity ratios are still "
        f"unverified, pending a civil engineer's review."
    )


class EstimateOptions(BaseModel):
    plot_sizes: list[PlotSize]
    cities: list[City]
    storeys: list[Storeys]
    quality_grades: list[QualityGrade]
