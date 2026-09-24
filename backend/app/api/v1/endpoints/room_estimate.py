from fastapi import APIRouter

from app.domain.estimation.room_estimate_engine import compute_room_estimate
from app.schemas.room_estimate import RoomEstimateRequest, RoomEstimateResponse

router = APIRouter(prefix="/room-estimate", tags=["room-estimate"])


@router.post("", response_model=RoomEstimateResponse)
def create_room_estimate(request: RoomEstimateRequest) -> RoomEstimateResponse:
    return compute_room_estimate(request)
