import uuid
from datetime import datetime

from pydantic import BaseModel


class SiteDiaryEntryRead(BaseModel):
    id: uuid.UUID
    saved_estimate_id: uuid.UUID
    author_name: str
    note: str
    has_photo: bool
    created_at: datetime
