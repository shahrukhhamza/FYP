from typing import Any

from pydantic import BaseModel

from app.db.models.saved_estimate import EstimateType


class ReportRequest(BaseModel):
    estimate_type: EstimateType
    label: str | None = None
    request_data: dict[str, Any]
    response_data: dict[str, Any]
