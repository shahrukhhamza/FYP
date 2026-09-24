import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from app.db.models.saved_estimate import EstimateType


class SavedEstimateCreate(BaseModel):
    estimate_type: EstimateType
    label: str = Field(min_length=1, max_length=255)
    # The exact request/response the client already has from /estimate or
    # /renovation — stored as-is rather than recomputed, so a saved estimate
    # reflects what the user actually saw, not today's rates.
    request_data: dict[str, Any]
    response_data: dict[str, Any]


class SavedEstimateRead(BaseModel):
    id: uuid.UUID
    estimate_type: EstimateType
    label: str
    request_data: dict[str, Any]
    response_data: dict[str, Any]
    created_at: datetime


class SavedEstimateSummary(BaseModel):
    """Lighter shape for list views — omits the full request/response payloads."""

    id: uuid.UUID
    estimate_type: EstimateType
    label: str
    created_at: datetime
