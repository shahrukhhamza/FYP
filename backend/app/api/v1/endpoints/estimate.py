from fastapi import APIRouter

from app.domain.estimation.engine import compute_estimate
from app.domain.estimation.types import City, PlotSize, QualityGrade, Storeys
from app.schemas.estimate import EstimateOptions, EstimateRequest, EstimateResponse

router = APIRouter(prefix="/estimate", tags=["estimate"])


@router.post("", response_model=EstimateResponse)
def create_estimate(request: EstimateRequest) -> EstimateResponse:
    return compute_estimate(request)


@router.get("/options", response_model=EstimateOptions)
def get_estimate_options() -> EstimateOptions:
    return EstimateOptions(
        plot_sizes=list(PlotSize),
        cities=list(City),
        storeys=list(Storeys),
        quality_grades=list(QualityGrade),
    )
