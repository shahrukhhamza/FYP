"""
PLACEHOLDER DATA — every number in this file is a stand-in, not a verified
figure. Nothing here has been checked against the Punjab Market Rate
Schedule, actual CDA/DHA/Bahria Town bylaws, or a practising civil engineer
(see TAMEER_Refined_Concept.pdf, section 5 and section 9 for why that
verification matters and is required before this engine's output can be
trusted).

This file exists so that verification work is a DATA change, not a CODE
change: replace the values below, leave engine.py untouched, and every
endpoint that depends on it updates automatically.

TODO before this stops being a placeholder:
  - Get real covered-area ratios per plot size, per authority (CDA, RDA,
    DHA, Bahria Town each set their own bylaws; this file currently uses
    one ratio per plot size, not per authority).
  - Get real material quantity ratios per sqft from a quantity surveyor
    or civil engineer, ideally cross-checked against a few real houses.
  - Replace MATERIAL_RATES_BY_CITY with live data once the Daily Material
    Rates module (rate DB + admin entry) exists; this dict is only a seed.
  - Replace FLAT_BENCHMARK_PER_SQFT with real cost benchmarks — electrical,
    plumbing, woodwork and tiles/finishing aren't in the tracked material
    rate list (cement, steel, bricks, sand, aggregate, paint), so they're
    modeled as a flat PKR/sqft figure by quality grade instead of a
    quantity x rate calculation.
"""

from app.domain.estimation.types import City, MaterialCategory, PlotSize, QualityGrade

# 1 Marla = 225 sqft, 1 Kanal = 20 Marla. These conversions are standard,
# not placeholders.
PLOT_SIZE_AREA_SQFT: dict[PlotSize, float] = {
    PlotSize.MARLA_3: 675,
    PlotSize.MARLA_5: 1125,
    PlotSize.MARLA_7: 1575,
    PlotSize.MARLA_10: 2250,
    PlotSize.KANAL_1: 4500,
    PlotSize.KANAL_2: 9000,
}

# PLACEHOLDER — bylaw-derived max covered area as a fraction of plot size.
# Real bylaws vary by authority (CDA/RDA/DHA/Bahria) as well as plot size;
# this is a single rough figure per plot size until authority-level data
# is collected.
COVERED_AREA_RATIO: dict[PlotSize, float] = {
    PlotSize.MARLA_3: 0.80,
    PlotSize.MARLA_5: 0.75,
    PlotSize.MARLA_7: 0.72,
    PlotSize.MARLA_10: 0.70,
    PlotSize.KANAL_1: 0.55,
    PlotSize.KANAL_2: 0.50,
}

# PLACEHOLDER — material quantity per sqft of built-up area, at "standard"
# quality grade. Scaled by QUALITY_GRADE_QUANTITY_MULTIPLIER below for
# economy/premium.
MATERIAL_QTY_PER_SQFT: dict[str, float] = {
    "cement_bags": 0.40,
    "steel_kg": 3.00,
    "aggregate_cft": 1.20,
    "bricks": 8.00,
    "sand_cft": 1.50,
    "paint_litres": 0.08,
}

# Which category each priced material rolls up into.
MATERIAL_CATEGORY: dict[str, MaterialCategory] = {
    "cement_bags": MaterialCategory.STRUCTURE_STEEL,
    "steel_kg": MaterialCategory.STRUCTURE_STEEL,
    "aggregate_cft": MaterialCategory.STRUCTURE_STEEL,
    "bricks": MaterialCategory.CEMENT_MASONRY,
    "sand_cft": MaterialCategory.CEMENT_MASONRY,
    "paint_litres": MaterialCategory.TILES_PAINT_FINISHING,
}

QUALITY_GRADE_QUANTITY_MULTIPLIER: dict[QualityGrade, float] = {
    QualityGrade.ECONOMY: 0.85,
    QualityGrade.STANDARD: 1.00,
    QualityGrade.PREMIUM: 1.25,
}

# PLACEHOLDER — seed material rates (PKR). Stand-in for the real Daily
# Material Rates module (rate DB + admin entry), not yet built.
MATERIAL_UNIT: dict[str, str] = {
    "cement_bags": "per 50kg bag",
    "steel_kg": "per kg",
    "aggregate_cft": "per cft",
    "bricks": "per brick",
    "sand_cft": "per cft",
    "paint_litres": "per litre",
}

MATERIAL_LABEL: dict[str, str] = {
    "cement_bags": "Cement",
    "steel_kg": "Steel (sariya)",
    "aggregate_cft": "Aggregate (crush)",
    "bricks": "Bricks",
    "sand_cft": "Sand",
    "paint_litres": "Paint",
}

MATERIAL_RATE_PKR: dict[str, float] = {
    "cement_bags": 1450,
    "steel_kg": 285,
    "aggregate_cft": 145,
    "bricks": 18,
    "sand_cft": 110,
    "paint_litres": 950,
}

# PLACEHOLDER — small city cost-of-transport multiplier applied on top of
# the base rates above. Not derived from real observed price differences.
CITY_RATE_MULTIPLIER: dict[City, float] = {
    City.ISLAMABAD: 1.05,
    City.RAWALPINDI: 1.00,
}

# PLACEHOLDER — flat PKR/sqft benchmarks for categories not covered by the
# tracked material rates (electrical, plumbing, woodwork, tiles/finishing).
FLAT_BENCHMARK_PER_SQFT: dict[MaterialCategory, dict[QualityGrade, float]] = {
    MaterialCategory.ELECTRICAL_PLUMBING: {
        QualityGrade.ECONOMY: 220,
        QualityGrade.STANDARD: 320,
        QualityGrade.PREMIUM: 480,
    },
    MaterialCategory.WOODWORK_DOORS: {
        QualityGrade.ECONOMY: 180,
        QualityGrade.STANDARD: 280,
        QualityGrade.PREMIUM: 450,
    },
    MaterialCategory.TILES_PAINT_FINISHING: {
        QualityGrade.ECONOMY: 300,
        QualityGrade.STANDARD: 450,
        QualityGrade.PREMIUM: 750,
    },
}

# Estimate range band: +/- this fraction around the point estimate.
ESTIMATE_RANGE_FRACTION = 0.08

# PLACEHOLDER — there is no real rate history yet (no persistence, no admin
# entry tool — that's the roadmap "Daily Material Rates" admin work). This
# is a fabricated-but-deterministic daily walk ending at today's canonical
# rate, so the /rates trend indicator has something real to compute against
# instead of the frontend inventing fake numbers of its own. Replace with
# real stored history once the admin entry tool exists.
RATE_HISTORY_DAYS = 14
RATE_HISTORY_MAX_DAILY_STEP = 0.012  # +/- 1.2% per day, deterministic per material/city
