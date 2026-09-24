from fastapi import APIRouter

from app.domain.estimation.engine import get_rates
from app.domain.estimation.types import City
from app.schemas.rates import RatesResponse

router = APIRouter(prefix="/rates", tags=["rates"])


@router.get("", response_model=RatesResponse)
def read_rates(city: City = City.ISLAMABAD) -> RatesResponse:
    return get_rates(city)
