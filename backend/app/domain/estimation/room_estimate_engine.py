from app.domain.estimation import data
from app.domain.estimation.engine import material_rate_for_city
from app.domain.estimation.types import (
    CATEGORY_LABELS,
    WET_ROOM_TYPES,
    MaterialCategory,
)
from app.schemas.estimate import CategoryBreakdown, MaterialLineItem
from app.schemas.room_estimate import RoomEstimateRequest, RoomEstimateResponse


class _Areas:
    """Aggregated geometry across all room groups, already scaled by
    storeys. Split by wet/dry because they're priced differently — see
    the WET_ROOM_TYPES comment in types.py."""

    def __init__(self) -> None:
        self.floor_area = 0.0
        self.wall_area = (
            0.0  # all rooms — bricks/sand need walls regardless of room type
        )
        self.dry_wall_area = (
            0.0  # dry rooms only — paint goes on dry walls; wet walls are tiled
        )
        self.wet_floor_area = 0.0
        self.dry_floor_area = 0.0
        self.doors = 0
        self.windows = 0


def _aggregate_rooms(request: RoomEstimateRequest) -> _Areas:
    areas = _Areas()
    storeys = float(request.storeys)

    for room in request.rooms:
        floor_area = room.count * room.length_ft * room.width_ft
        perimeter = room.count * 2 * (room.length_ft + room.width_ft)
        gross_wall_area = perimeter * request.height_ft
        opening_area = room.count * (
            room.doors * data.DOOR_AREA_SQFT + room.windows * data.WINDOW_AREA_SQFT
        )
        net_wall_area = max(
            gross_wall_area - opening_area,
            gross_wall_area * data.MIN_NET_WALL_AREA_FRACTION,
        )
        is_wet = room.room_type in WET_ROOM_TYPES

        areas.floor_area += floor_area
        areas.wall_area += net_wall_area
        areas.doors += room.count * room.doors
        areas.windows += room.count * room.windows
        if is_wet:
            areas.wet_floor_area += floor_area
        else:
            areas.dry_floor_area += floor_area
            areas.dry_wall_area += net_wall_area

    areas.floor_area *= storeys
    areas.wall_area *= storeys
    areas.dry_wall_area *= storeys
    areas.wet_floor_area *= storeys
    areas.dry_floor_area *= storeys
    areas.doors = round(areas.doors * storeys)
    areas.windows = round(areas.windows * storeys)
    return areas


def _priced_room_categories(
    areas: _Areas, request: RoomEstimateRequest
) -> dict[MaterialCategory, CategoryBreakdown]:
    grade = request.quality_grade
    city = request.city
    grade_multiplier = data.QUALITY_GRADE_QUANTITY_MULTIPLIER[grade]

    categories: dict[MaterialCategory, CategoryBreakdown] = {
        category: CategoryBreakdown(
            category=category.value, label=label, cost_pkr=0, percentage=0
        )
        for category, label in CATEGORY_LABELS.items()
    }

    def add_material(
        material: str, quantity: float, category: MaterialCategory
    ) -> None:
        rate = material_rate_for_city(material, city)
        cost = quantity * rate
        categories[category].materials.append(
            MaterialLineItem(
                material=data.MATERIAL_LABEL[material],
                unit=data.MATERIAL_UNIT[material],
                quantity=round(quantity, 2),
                rate_pkr=round(rate, 2),
                cost_pkr=round(cost, 2),
            )
        )
        categories[category].cost_pkr += cost

    # Structure (cement/steel/aggregate) — scales with floor footprint, a
    # stand-in for RCC slab/footing/column volume.
    for material in ("cement_bags", "steel_kg", "aggregate_cft"):
        qty = data.MATERIAL_QTY_PER_SQFT[material] * grade_multiplier * areas.floor_area
        add_material(material, qty, MaterialCategory.STRUCTURE_STEEL)

    # Masonry (bricks/sand) — scales with total wall area, wet or dry.
    for material in ("bricks", "sand_cft"):
        qty = data.MATERIAL_QTY_PER_SQFT[material] * grade_multiplier * areas.wall_area
        add_material(material, qty, MaterialCategory.CEMENT_MASONRY)

    # Paint — dry walls only; wet-area (kitchen/bathroom) walls are tiled,
    # not painted, which the elevated finishing benchmark below covers.
    paint_qty = (
        data.MATERIAL_QTY_PER_SQFT["paint_litres"]
        * grade_multiplier
        * areas.dry_wall_area
    )
    add_material("paint_litres", paint_qty, MaterialCategory.TILES_PAINT_FINISHING)

    # Flat benchmarks, split wet/dry: wet floor space costs more for both
    # fixture-dense electrical/plumbing and full tiling.
    finishing_rate = data.FLAT_BENCHMARK_PER_SQFT[
        MaterialCategory.TILES_PAINT_FINISHING
    ][grade]
    categories[MaterialCategory.TILES_PAINT_FINISHING].cost_pkr += (
        areas.dry_floor_area * finishing_rate
        + areas.wet_floor_area * finishing_rate * data.WET_AREA_FINISHING_MULTIPLIER
    )

    electrical_rate = data.FLAT_BENCHMARK_PER_SQFT[
        MaterialCategory.ELECTRICAL_PLUMBING
    ][grade]
    categories[MaterialCategory.ELECTRICAL_PLUMBING].cost_pkr += (
        areas.dry_floor_area * electrical_rate
        + areas.wet_floor_area
        * electrical_rate
        * data.WET_AREA_ELECTRICAL_PLUMBING_MULTIPLIER
    )

    # Woodwork & doors — priced by what's actually being built (counted
    # openings), not a per-sqft guess.
    woodwork = categories[MaterialCategory.WOODWORK_DOORS]
    if areas.doors:
        door_cost = areas.doors * data.DOOR_COST_PKR[grade]
        woodwork.materials.append(
            MaterialLineItem(
                material="Doors",
                unit="per door (installed)",
                quantity=areas.doors,
                rate_pkr=data.DOOR_COST_PKR[grade],
                cost_pkr=round(door_cost, 2),
            )
        )
        woodwork.cost_pkr += door_cost
    if areas.windows:
        window_cost = areas.windows * data.WINDOW_COST_PKR[grade]
        woodwork.materials.append(
            MaterialLineItem(
                material="Windows",
                unit="per window (installed)",
                quantity=areas.windows,
                rate_pkr=data.WINDOW_COST_PKR[grade],
                cost_pkr=round(window_cost, 2),
            )
        )
        woodwork.cost_pkr += window_cost

    return categories


def compute_room_estimate(request: RoomEstimateRequest) -> RoomEstimateResponse:
    areas = _aggregate_rooms(request)
    categories = _priced_room_categories(areas, request)

    total = sum(c.cost_pkr for c in categories.values())
    for category in categories.values():
        category.cost_pkr = round(category.cost_pkr, 2)
        category.percentage = (
            round((category.cost_pkr / total) * 100, 1) if total else 0.0
        )

    band = data.ESTIMATE_RANGE_FRACTION
    return RoomEstimateResponse(
        total_floor_area_sqft=round(areas.floor_area, 1),
        total_wall_area_sqft=round(areas.wall_area, 1),
        wet_floor_area_sqft=round(areas.wet_floor_area, 1),
        dry_floor_area_sqft=round(areas.dry_floor_area, 1),
        total_doors=areas.doors,
        total_windows=areas.windows,
        categories=list(categories.values()),
        total_cost_low_pkr=round(total * (1 - band), 2),
        total_cost_high_pkr=round(total * (1 + band), 2),
    )
