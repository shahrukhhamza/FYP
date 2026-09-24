from app.domain.estimation import data
from app.domain.estimation.engine import priced_categories
from app.schemas.room_estimate import RoomEstimateRequest, RoomEstimateResponse


def _room_areas(request: RoomEstimateRequest) -> tuple[float, float]:
    """
    Exact geometry from the rooms the user actually described, not a
    plot-size approximation:
      floor area  = sum(count x length x width) per room group
      gross walls = sum(count x perimeter) x ceiling height
      net walls   = gross walls, less a flat opening (door/window)
                    deduction — same WALL_OPENING_DEDUCTION_FRACTION the
                    renovation estimator uses, not a second invented number
    Both are then scaled by storeys, on the simplifying assumption that
    each floor repeats roughly the same room layout — a real building
    can vary floor to floor, which this doesn't attempt to model.
    """
    floor_area_per_storey = sum(r.count * r.length_ft * r.width_ft for r in request.rooms)
    gross_perimeter_per_storey = sum(r.count * 2 * (r.length_ft + r.width_ft) for r in request.rooms)
    gross_wall_area_per_storey = gross_perimeter_per_storey * request.height_ft
    net_wall_area_per_storey = gross_wall_area_per_storey * (1 - data.WALL_OPENING_DEDUCTION_FRACTION)

    storeys = float(request.storeys)
    return floor_area_per_storey * storeys, net_wall_area_per_storey * storeys


def compute_room_estimate(request: RoomEstimateRequest) -> RoomEstimateResponse:
    floor_area, wall_area = _room_areas(request)
    categories = priced_categories(floor_area, wall_area, request.city, request.quality_grade)

    total = sum(c.cost_pkr for c in categories.values())
    for category in categories.values():
        category.cost_pkr = round(category.cost_pkr, 2)
        category.percentage = round((category.cost_pkr / total) * 100, 1) if total else 0.0

    band = data.ESTIMATE_RANGE_FRACTION
    return RoomEstimateResponse(
        total_floor_area_sqft=round(floor_area, 1),
        total_wall_area_sqft=round(wall_area, 1),
        categories=list(categories.values()),
        total_cost_low_pkr=round(total * (1 - band), 2),
        total_cost_high_pkr=round(total * (1 + band), 2),
    )
