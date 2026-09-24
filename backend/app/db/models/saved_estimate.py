import uuid
from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class EstimateType(str, Enum):
    HOUSE = "house"
    RENOVATION = "renovation"


class SavedEstimate(Base):
    __tablename__ = "saved_estimates"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    estimate_type: Mapped[EstimateType] = mapped_column(
        SAEnum(EstimateType, name="estimate_type"), nullable=False
    )
    label: Mapped[str] = mapped_column(String(255), nullable=False)
    # Snapshots of the request and computed response at save time — an
    # estimate a user saved shouldn't silently change later if the
    # underlying seed rates change, so we store the result, not just the
    # inputs to recompute from.
    request_data: Mapped[dict] = mapped_column(JSONB, nullable=False)
    response_data: Mapped[dict] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
