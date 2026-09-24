import uuid

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Response,
    UploadFile,
    status,
)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.api.v1.endpoints.saved_estimates import _get_owned
from app.db.models.site_diary_entry import SiteDiaryEntry
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.site_diary import SiteDiaryEntryRead

router = APIRouter(tags=["site-diary"])

NOT_FOUND = HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Diary entry not found")

MAX_PHOTO_BYTES = 5 * 1024 * 1024  # 5MB
ALLOWED_PHOTO_TYPES = {"image/jpeg", "image/png", "image/webp"}


def _to_read_model(entry: SiteDiaryEntry, author_name: str) -> SiteDiaryEntryRead:
    return SiteDiaryEntryRead(
        id=entry.id,
        saved_estimate_id=entry.saved_estimate_id,
        author_name=author_name,
        note=entry.note,
        has_photo=entry.photo_data is not None,
        created_at=entry.created_at,
    )


async def _get_owned_entry(entry_id: uuid.UUID, user: User, db: AsyncSession) -> SiteDiaryEntry:
    entry = await db.get(SiteDiaryEntry, entry_id)
    if entry is None:
        raise NOT_FOUND
    # Ownership runs through the parent project, not a direct user_id
    # column on the entry — same "confirm nothing" 404 as everywhere else.
    await _get_owned(entry.saved_estimate_id, user, db)
    return entry


@router.post(
    "/saved-estimates/{estimate_id}/diary",
    response_model=SiteDiaryEntryRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_diary_entry(
    estimate_id: uuid.UUID,
    note: str = Form(min_length=1, max_length=2000),
    photo: UploadFile | None = File(default=None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SiteDiaryEntryRead:
    await _get_owned(estimate_id, current_user, db)

    photo_data: bytes | None = None
    photo_content_type: str | None = None
    if photo is not None and photo.filename:
        if photo.content_type not in ALLOWED_PHOTO_TYPES:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Photo must be JPEG, PNG, or WebP.",
            )
        photo_data = await photo.read()
        if len(photo_data) > MAX_PHOTO_BYTES:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Photo must be under 5MB.",
            )
        photo_content_type = photo.content_type

    entry = SiteDiaryEntry(
        saved_estimate_id=estimate_id,
        author_id=current_user.id,
        note=note,
        photo_data=photo_data,
        photo_content_type=photo_content_type,
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return _to_read_model(entry, current_user.full_name)


@router.get("/saved-estimates/{estimate_id}/diary", response_model=list[SiteDiaryEntryRead])
async def list_diary_entries(
    estimate_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[SiteDiaryEntryRead]:
    await _get_owned(estimate_id, current_user, db)
    result = await db.scalars(
        select(SiteDiaryEntry)
        .where(SiteDiaryEntry.saved_estimate_id == estimate_id)
        .order_by(SiteDiaryEntry.created_at.desc())
    )
    # v1 only ever has the project owner as author (see PHASES.md), so this
    # doesn't need a per-entry author lookup yet.
    return [_to_read_model(entry, current_user.full_name) for entry in result]


@router.get("/site-diary/{entry_id}/photo")
async def read_diary_entry_photo(
    entry_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Response:
    entry = await _get_owned_entry(entry_id, current_user, db)
    if entry.photo_data is None:
        raise NOT_FOUND
    return Response(content=entry.photo_data, media_type=entry.photo_content_type)


@router.delete("/site-diary/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_diary_entry(
    entry_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Response:
    entry = await _get_owned_entry(entry_id, current_user, db)
    await db.delete(entry)
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
