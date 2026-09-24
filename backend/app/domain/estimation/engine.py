import random
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from app.domain.estimation import data
from app.domain.estimation.types import (
    CATEGORY_LABELS,
    City,
    MaterialCategory,
    PlotSize,
    QualityGrade,
    Storeys,
)
from app.schemas.estimate import (
    CategoryBreakdown,
    EstimateRequest,
    EstimateResponse,
    MaterialLineItem,
)
from app.schemas.rates import (
    MaterialRate,
    RateHistoryPoint,
    RatesResponse,
    TrendDirection,
)


def built_up_area_sqft(plot_size: PlotSize, storeys: Storeys) -> float:
    plot_area = data.PLOT_SIZE_AREA_SQFT[plot_size]
    covered_ratio = data.COVERED_AREA_RATIO[plot_size]
    return plot_area * covered_ratio * float(storeys)


def material_rate_for_city(material: str, city: City) -> float:
    base_rate = data.MATERIAL_RATE_PKR[material]
    return base_rate * data.CITY_RATE_MULTIPLIER[city]


def _priced_categories(area_sqft: float, city: City, grade: QualityGrade) -> dict[MaterialCategory, CategoryBreakdown]:
    grade_multiplier = data.QUALITY_GRADE_QUANTITY_MULTIPLIER[grade]
    categories: dict[MaterialCategory, CategoryBreakdown] = {
        category: CategoryBreakdown(category=category.value, label=label, cost_pkr=0, percentage=0)
        for category, label in CATEGORY_LABELS.items()
    }

    for material, base_qty_per_sqft in data.MATERIAL_QTY_PER_SQFT.items():
        category = data.MATERIAL_CATEGORY[material]
        quantity = base_qty_per_sqft * grade_multiplier * area_sqft
        rate = material_rate_for_city(material, city)
        cost = quantity * rate

        line_item = MaterialLineItem(
            material=data.MATERIAL_LABEL[material],
            unit=data.MATERIAL_UNIT[material],
            quantity=round(quantity, 2),
            rate_pkr=round(rate, 2),
            cost_pkr=round(cost, 2),
        )
        bucket = categories[category]
        bucket.materials.append(line_item)
        bucket.cost_pkr += cost

    for category, grade_benchmarks in data.FLAT_BENCHMARK_PER_SQFT.items():
        cost = grade_benchmarks[grade] * area_sqft
        categories[category].cost_pkr += cost

    return categories


def compute_estimate(request: EstimateRequest) -> EstimateResponse:
    area = built_up_area_sqft(request.plot_size, request.storeys)
    categories = _priced_categories(area, request.city, request.quality_grade)

    total = sum(c.cost_pkr for c in categories.values())
    for category in categories.values():
        category.cost_pkr = round(category.cost_pkr, 2)
        category.percentage = round((category.cost_pkr / total) * 100, 1) if total else 0.0

    band = data.ESTIMATE_RANGE_FRACTION
    return EstimateResponse(
        plot_size=request.plot_size,
        city=request.city,
        storeys=request.storeys,
        quality_grade=request.quality_grade,
        built_up_area_sqft=round(area, 1),
        total_cost_low_pkr=round(total * (1 - band), 2),
        total_cost_high_pkr=round(total * (1 + band), 2),
        categories=list(categories.values()),
    )


def _rate_history(material: str, city: City, today_rate: float) -> list[RateHistoryPoint]:
    """
    Deterministic fabricated daily history ending exactly at today_rate — see
    the RATE_HISTORY_* comment in data.py for why this isn't real data yet.
    Seeded per (material, city) so it's stable across requests, not re-randomized
    on every call.
    """
    rng = random.Random(f"{material}:{city.value}")
    days = data.RATE_HISTORY_DAYS
    step = data.RATE_HISTORY_MAX_DAILY_STEP

    # Build day-over-day multipliers walking forward from `days` ago to today,
    # then rescale so the walk lands exactly on today_rate.
    multipliers = [1.0]
    for _ in range(days - 1):
        multipliers.append(multipliers[-1] * (1 + rng.uniform(-step, step)))

    implied_today = multipliers[-1]
    scale = today_rate / implied_today

    today = datetime.now(ZoneInfo("Asia/Karachi")).date()
    return [
        RateHistoryPoint(
            date=today - timedelta(days=(days - 1 - i)),
            rate_pkr=round(m * scale, 2),
        )
        for i, m in enumerate(multipliers)
    ]


def _trend(history: list[RateHistoryPoint]) -> tuple[TrendDirection, float]:
    first, last = history[0].rate_pkr, history[-1].rate_pkr
    change_pct = ((last - first) / first) * 100 if first else 0.0
    if change_pct > 0.5:
        direction: TrendDirection = "up"
    elif change_pct < -0.5:
        direction = "down"
    else:
        direction = "flat"
    return direction, round(change_pct, 1) + 0.0  # normalizes -0.0 to 0.0


def get_rates(city: City) -> RatesResponse:
    rates = []
    for material in data.MATERIAL_RATE_PKR:
        today_rate = round(material_rate_for_city(material, city), 2)
        history = _rate_history(material, city, today_rate)
        direction, change_pct = _trend(history)
        rates.append(
            MaterialRate(
                material=material,
                label=data.MATERIAL_LABEL[material],
                unit=data.MATERIAL_UNIT[material],
                rate_pkr=today_rate,
                trend_direction=direction,
                trend_pct=change_pct,
                history=history,
            )
        )
    return RatesResponse(city=city, rates=rates)
