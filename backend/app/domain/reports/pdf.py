import io
from datetime import datetime
from typing import Any
from zoneinfo import ZoneInfo

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

# Keep in sync with frontend/src/lib/labels.ts and
# backend/app/domain/estimation/types.py — display strings only.
PLOT_SIZE_LABELS = {
    "3_marla": "3 Marla",
    "5_marla": "5 Marla",
    "7_marla": "7 Marla",
    "10_marla": "10 Marla",
    "1_kanal": "1 Kanal",
    "2_kanal": "2 Kanal",
}
CITY_LABELS = {"islamabad": "Islamabad", "rawalpindi": "Rawalpindi"}
QUALITY_GRADE_LABELS = {"economy": "Economy", "standard": "Standard", "premium": "Premium"}

BRAND_NAVY = colors.HexColor("#1B3557")
MUTED = colors.HexColor("#6B7280")
BORDER = colors.HexColor("#E2E6EA")


def _format_pkr(amount: float) -> str:
    if amount >= 100_000:
        return f"PKR {amount / 100_000:.1f}L"
    return f"PKR {amount:,.0f}"


def _label(mapping: dict[str, str], value: Any) -> str:
    key = str(value) if value is not None else ""
    return mapping.get(key, key)


def _subtitle(estimate_type: str, request_data: dict[str, Any]) -> str:
    if estimate_type == "house":
        plot = _label(PLOT_SIZE_LABELS, request_data.get("plot_size"))
        city = _label(CITY_LABELS, request_data.get("city"))
        grade = _label(QUALITY_GRADE_LABELS, request_data.get("quality_grade"))
        storeys = request_data.get("storeys")
        return f"{plot} · {storeys} storey(s) · {city} · {grade}"
    city = _label(CITY_LABELS, request_data.get("city"))
    dims = f"{request_data.get('length_ft')}ft × {request_data.get('width_ft')}ft × {request_data.get('height_ft')}ft"
    return f"Room {dims} · {city}"


def build_estimate_pdf(
    estimate_type: str,
    label: str | None,
    request_data: dict[str, Any],
    response_data: dict[str, Any],
) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=20 * mm,
        bottomMargin=18 * mm,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        title=label or "TAMEER Estimate",
    )
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "TameerTitle", parent=styles["Title"], textColor=BRAND_NAVY, fontSize=20, spaceAfter=2
    )
    subtitle_style = ParagraphStyle("TameerSubtitle", parent=styles["Normal"], textColor=MUTED, fontSize=10)
    section_style = ParagraphStyle(
        "TameerSection", parent=styles["Heading2"], textColor=BRAND_NAVY, fontSize=13, spaceBefore=14
    )
    body_style = ParagraphStyle("TameerBody", parent=styles["Normal"], fontSize=9, textColor=MUTED)

    elements: list[Any] = []
    elements.append(Paragraph("TAMEER", title_style))
    elements.append(
        Paragraph(
            "Pakistan&rsquo;s trusted source for fair construction and renovation costs",
            subtitle_style,
        )
    )
    elements.append(Spacer(1, 10 * mm))

    heading = label or ("Instant Estimate" if estimate_type == "house" else "Renovation Estimate")
    elements.append(Paragraph(heading, styles["Heading1"]))
    elements.append(Paragraph(_subtitle(estimate_type, request_data), subtitle_style))
    generated_at = datetime.now(ZoneInfo("Asia/Karachi")).strftime("%d %b %Y, %I:%M %p PKT")
    elements.append(Paragraph(f"Generated {generated_at}", subtitle_style))
    elements.append(Spacer(1, 6 * mm))

    total_low = response_data.get("total_cost_low_pkr", 0)
    total_high = response_data.get("total_cost_high_pkr", 0)
    elements.append(Paragraph("Estimated total cost", body_style))
    elements.append(
        Paragraph(
            f"{_format_pkr(total_low)} &ndash; {_format_pkr(total_high)}",
            ParagraphStyle("Total", parent=styles["Heading1"], textColor=BRAND_NAVY, fontSize=22),
        )
    )
    elements.append(Spacer(1, 4 * mm))

    items = response_data.get("categories") or response_data.get("items") or []

    breakdown_rows = [["Category", "Cost", "Share"]]
    for item in items:
        breakdown_rows.append(
            [item["label"], _format_pkr(item["cost_pkr"]), f"{item['percentage']}%"]
        )
    elements.append(Paragraph("Cost breakdown", section_style))
    elements.append(_styled_table(breakdown_rows, col_widths=[90 * mm, 40 * mm, 30 * mm]))

    for item in items:
        materials = item.get("materials") or []
        if not materials:
            continue
        elements.append(Paragraph(item["label"], section_style))
        material_rows = [["Material", "Quantity", "Rate", "Cost"]]
        for m in materials:
            material_rows.append(
                [
                    m["material"],
                    f"{m['quantity']:,} {m['unit']}",
                    _format_pkr(m["rate_pkr"]),
                    _format_pkr(m["cost_pkr"]),
                ]
            )
        elements.append(_styled_table(material_rows, col_widths=[55 * mm, 45 * mm, 30 * mm, 30 * mm]))

    elements.append(Spacer(1, 4 * mm))
    disclaimer = response_data.get(
        "disclaimer", "Preliminary estimate only, not a binding quotation."
    )
    elements.append(Paragraph(disclaimer, body_style))

    doc.build(elements)
    return buffer.getvalue()


def _styled_table(rows: list[list[str]], col_widths: list[float]) -> Table:
    table = Table(rows, colWidths=col_widths, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F4F5F7")),
                ("TEXTCOLOR", (0, 0), (-1, 0), BRAND_NAVY),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("LINEBELOW", (0, 0), (-1, 0), 0.75, BORDER),
                ("LINEBELOW", (0, 1), (-1, -2), 0.5, BORDER),
                ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
            ]
        )
    )
    return table
