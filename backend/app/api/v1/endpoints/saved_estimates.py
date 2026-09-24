import uuid

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.models.saved_estimate import SavedEstimate
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.saved_estimate import (
    SavedEstimateCreate,
    SavedEstimateRead,
    SavedEstimateSummary,
)

router = APIRouter(prefix="/saved-estimates", tags=["saved-estimates"])

NOT_FOUND = HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saved estimate not found")


async def _get_owned(estimate_id: uuid.UUID, user: User, db: AsyncSession) -> SavedEstimate:
    estimate = await db.get(SavedEstimate, estimate_id)
    if estimate is None or estimate.user_id != user.id:
        # Same 404 whether it doesn't exist or belongs to someone else —
        # confirming existence of another user's resource is its own leak.
        raise NOT_FOUND
    return estimate


@router.post("", response_model=SavedEstimateRead, status_code=status.HTTP_201_CREATED)
async def create_saved_estimate(
    payload: SavedEstimateCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SavedEstimate:
    estimate = SavedEstimate(user_id=current_user.id, **payload.model_dump())
    db.add(estimate)
    await db.commit()
    await db.refresh(estimate)
    return estimate


@router.get("", response_model=list[SavedEstimateSummary])
async def list_saved_estimates(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[SavedEstimate]:
    result = await db.scalars(
        select(SavedEstimate)
        .where(SavedEstimate.user_id == current_user.id)
        .order_by(SavedEstimate.created_at.desc())
    )
    return list(result)


@router.get("/{estimate_id}", response_model=SavedEstimateRead)
async def read_saved_estimate(
    estimate_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SavedEstimate:
    return await _get_owned(estimate_id, current_user, db)


@router.delete("/{estimate_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_saved_estimate(
    estimate_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Response:
    estimate = await _get_owned(estimate_id, current_user, db)
    await db.delete(estimate)
    await db.commit()
    # A 204 must have no body at all. Returning `None` here makes FastAPI
    # serialize it as a JSON "null" body with a Content-Type header, which is
    # invalid framing for a 204 and made Chromium abort the fetch client-side
    # even though the delete had already succeeded server-side.
    return Response(status_code=status.HTTP_204_NO_CONTENT)
