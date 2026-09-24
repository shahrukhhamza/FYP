import uuid

from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.api.v1.endpoints.saved_estimates import _get_owned
from app.db.models.user import User
from app.db.session import get_db
from app.domain.reports.pdf import build_estimate_pdf
from app.schemas.report import ReportRequest

router = APIRouter(prefix="/reports", tags=["reports"])


def _pdf_response(pdf_bytes: bytes, filename: str) -> Response:
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/pdf")
async def download_report(payload: ReportRequest) -> Response:
    pdf_bytes = build_estimate_pdf(
        payload.estimate_type.value, payload.label, payload.request_data, payload.response_data
    )
    return _pdf_response(pdf_bytes, f"buniyad-{payload.estimate_type.value}-estimate.pdf")


@router.get("/saved-estimates/{estimate_id}/pdf")
async def download_saved_estimate_report(
    estimate_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Response:
    estimate = await _get_owned(estimate_id, current_user, db)
    pdf_bytes = build_estimate_pdf(
        estimate.estimate_type.value, estimate.label, estimate.request_data, estimate.response_data
    )
    return _pdf_response(pdf_bytes, f"buniyad-{estimate.label}.pdf")
