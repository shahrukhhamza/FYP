from app.domain.estimation import data
from app.domain.estimation.engine import material_rate_for_city
from app.domain.estimation.types import WORK_ITEM_LABELS, WORK_ITEM_USES_WALL_AREA
from app.schemas.estimate import CategoryBreakdown, MaterialLineItem
from app.schemas.renovation import RenovationRequest, RenovationResponse


def floor_and_wall_area(length_ft: float, width_ft: float, height_ft: float) -> tuple[float, float]:
    floor_area = length_ft * width_ft
    gross_wall_area = 2 * (length_ft + width_ft) * height_ft
    wall_area = gross_wall_area * (1 - data.WALL_OPENING_DEDUCTION_FRACTION)
    return floor_area, wall_area


def compute_renovation_estimate(request: RenovationRequest) -> RenovationResponse:
    floor_area, wall_area = floor_and_wall_area(request.length_ft, request.width_ft, request.height_ft)
    grade_multiplier = data.QUALITY_GRADE_QUANTITY_MULTIPLIER[request.quality_grade]

    items: list[CategoryBreakdown] = []
    for work_item in request.work_items:
        area = wall_area if WORK_ITEM_USES_WALL_AREA[work_item] else floor_area
        breakdown = CategoryBreakdown(
            category=work_item.value,
            label=WORK_ITEM_LABELS[work_item],
            cost_pkr=0,
            percentage=0,
        )

        for material, base_qty_per_sqft in data.RENOVATION_MATERIAL_QTY_PER_SQFT[work_item].items():
            quantity = base_qty_per_sqft * grade_multiplier * area
            rate = material_rate_for_city(material, request.city)
            cost = quantity * rate
            breakdown.materials.append(
                MaterialLineItem(
                    material=data.MATERIAL_LABEL[material],
                    unit=data.MATERIAL_UNIT[material],
                    quantity=round(quantity, 2),
                    rate_pkr=round(rate, 2),
                    cost_pkr=round(cost, 2),
                )
            )
            breakdown.cost_pkr += cost

        labour_cost = data.RENOVATION_LABOUR_PER_SQFT[work_item][request.quality_grade] * area
        breakdown.materials.append(
            MaterialLineItem(
                material="Labour",
                unit="per sqft",
                quantity=round(area, 2),
                rate_pkr=data.RENOVATION_LABOUR_PER_SQFT[work_item][request.quality_grade],
                cost_pkr=round(labour_cost, 2),
            )
        )
        breakdown.cost_pkr += labour_cost

        items.append(breakdown)

    total = sum(item.cost_pkr for item in items)
    for item in items:
        item.cost_pkr = round(item.cost_pkr, 2)
        item.percentage = round((item.cost_pkr / total) * 100, 1) if total else 0.0

    band = data.ESTIMATE_RANGE_FRACTION
    return RenovationResponse(
        floor_area_sqft=round(floor_area, 1),
        wall_area_sqft=round(wall_area, 1),
        items=items,
        total_cost_low_pkr=round(total * (1 - band), 2),
        total_cost_high_pkr=round(total * (1 + band), 2),
    )
