from fastapi import APIRouter

from app.domain.estimation.renovation_engine import compute_renovation_estimate
from app.domain.estimation.types import City, QualityGrade, RenovationWorkItem
from app.schemas.renovation import (
    RenovationOptions,
    RenovationRequest,
    RenovationResponse,
)

router = APIRouter(prefix="/renovation", tags=["renovation"])


@router.post("", response_model=RenovationResponse)
def create_renovation_estimate(request: RenovationRequest) -> RenovationResponse:
    return compute_renovation_estimate(request)


@router.get("/options", response_model=RenovationOptions)
def get_renovation_options() -> RenovationOptions:
    return RenovationOptions(
        work_items=list(RenovationWorkItem),
        cities=list(City),
        quality_grades=list(QualityGrade),
    )
