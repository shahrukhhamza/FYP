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
from app.schemas.rates import MaterialRate, RatesResponse


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


def get_rates(city: City) -> RatesResponse:
    rates = [
        MaterialRate(
            material=material,
            label=data.MATERIAL_LABEL[material],
            unit=data.MATERIAL_UNIT[material],
            rate_pkr=round(material_rate_for_city(material, city), 2),
        )
        for material in data.MATERIAL_RATE_PKR
    ]
    return RatesResponse(city=city, rates=rates)
