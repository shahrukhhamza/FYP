"""
Two tiers of confidence in this file — read the comment above each block,
not just this header, before trusting a number:

  SOURCED (2026-09-25): MATERIAL_RATE_PKR and FLAT_BENCHMARK_PER_SQFT were
  checked against current web-published Pakistani rate roundups and cost
  guides (Business Recorder-style rate pages, civilconstructionguide.com,
  multiple "construction cost per sqft Pakistan 2026" guides, tile/paint
  dealer rate pages) and picked from the middle of what those sources
  reported. This is NOT the same as a quantity surveyor's or civil
  engineer's sign-off, and the sources themselves disagree with each other
  by 2-3x on some figures (e.g. published "grey structure cost per sqft"
  ranged from ~1,800 to ~7,500 depending on the source) — there is no
  single agreed "correct" number in the Pakistani market for this, and
  presenting one without a range would be false precision. Treat these as
  a defensible, dated estimate, not ground truth.

  STILL INVENTED: covered-area bylaw ratios, material quantity-per-sqft
  ratios (bags of cement per sqft etc.), tile adhesive rate, and every
  renovation labour benchmark have NOT been checked against any source —
  see TAMEER_Refined_Concept.pdf sections 5 and 9 for why real bylaw data
  and quantity-surveyor-verified ratios still matter and are the real
  remaining gap.

This file exists so that verification work is a DATA change, not a CODE
change: replace the values below, leave engine.py untouched, and every
endpoint that depends on it updates automatically.

TODO before this is actually verified:
  - Get real covered-area ratios per plot size, per authority (CDA, RDA,
    DHA, Bahria Town each set their own bylaws; this file currently uses
    one ratio per plot size, not per authority).
  - Get real material quantity ratios per sqft from a quantity surveyor
    or civil engineer, ideally cross-checked against a few real houses —
    the SOURCED rates above only fix the price side of quantity x price;
    the quantity side is still a guess.
  - Replace MATERIAL_RATE_PKR with live data once the Daily Material
    Rates admin entry tool exists; this dict is only a manually-updated
    seed and will go stale the day after it's written.
  - Get tile adhesive, woodwork, and renovation labour rates from an
    actual supplier/contractor — no source was found for these.
"""

from datetime import date

from app.domain.estimation.types import (
    City,
    MaterialCategory,
    PlotSize,
    QualityGrade,
    RenovationWorkItem,
)

# Single source of truth for "when were the rates below last checked" —
# referenced by both the disclaimer text and a structured API field, so
# updating this one line keeps everything in sync the next time rates are
# refreshed instead of hunting down hardcoded date strings.
RATES_SOURCED_DATE = date(2026, 9, 25)

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

# SOURCED (2026-09-25), still a manually-updated seed — see module
# docstring. Rates picked from the middle of ranges reported across
# multiple current Pakistani rate-guide sites: cement ~1,350-1,550/bag,
# steel (sariya) ~228-265/kg, bricks ~14,000-22,000 per 1,000
# (=14-22/brick), sand ~45-120/cft, crush aggregate ~90-150/cft,
# emulsion paint from ~850/litre, ceramic tiles ~150-300/sqft for
# everyday quality. Tile adhesive has no found source — still a guess.
MATERIAL_UNIT: dict[str, str] = {
    "cement_bags": "per 50kg bag",
    "steel_kg": "per kg",
    "aggregate_cft": "per cft",
    "bricks": "per brick",
    "sand_cft": "per cft",
    "paint_litres": "per litre",
    "tiles_sqft": "per sqft",
    "tile_adhesive_bags": "per 20kg bag",
}

MATERIAL_LABEL: dict[str, str] = {
    "cement_bags": "Cement",
    "steel_kg": "Steel (sariya)",
    "aggregate_cft": "Aggregate (crush)",
    "bricks": "Bricks",
    "sand_cft": "Sand",
    "paint_litres": "Paint",
    "tiles_sqft": "Tiles",
    "tile_adhesive_bags": "Tile adhesive",
}

MATERIAL_RATE_PKR: dict[str, float] = {
    "cement_bags": 1420,
    "steel_kg": 245,
    "aggregate_cft": 120,
    "bricks": 18,
    "sand_cft": 85,
    "paint_litres": 900,
    "tiles_sqft": 180,
    "tile_adhesive_bags": 850,  # unsourced — no rate found for this specifically
}

# PLACEHOLDER — city cost-of-transport multiplier applied on top of the
# base rates above. The direction is loosely consistent with what rate
# guides report (Rawalpindi and Islamabad tracking close to each other,
# both a bit below Lahore) but the specific magnitude here is still a
# guess, not derived from real observed price differences.
CITY_RATE_MULTIPLIER: dict[City, float] = {
    City.ISLAMABAD: 1.05,
    City.RAWALPINDI: 1.00,
}

# SOURCED (2026-09-25) for ELECTRICAL_PLUMBING and TILES_PAINT_FINISHING —
# still a guess for WOODWORK_DOORS (no source found). These were the most
# wrong numbers in this file before this pass: multiple current Pakistani
# cost guides put standard-quality "finishing" (tiles/paint/fixtures) at
# roughly 1,200-1,800/sqft and MEP (electrical+plumbing combined) at
# roughly 300-800/sqft, budgeted as ~8-12% of total cost — the previous
# values here (320 and 450) were landing at roughly a third of the
# low end of those published ranges. Cross-checked against a second,
# independent data point: published 10-Marla "grey structure vs finished
# house" costs (~5-6M vs ~9-12M PKR) imply combined MEP+finishing of
# roughly 950-2,220 PKR per sqft of built-up area, which the totals below
# (450 + ~1,100, before the woodwork guess) fall inside.
FLAT_BENCHMARK_PER_SQFT: dict[MaterialCategory, dict[QualityGrade, float]] = {
    MaterialCategory.ELECTRICAL_PLUMBING: {
        QualityGrade.ECONOMY: 300,
        QualityGrade.STANDARD: 450,
        QualityGrade.PREMIUM: 700,
    },
    MaterialCategory.WOODWORK_DOORS: {
        QualityGrade.ECONOMY: 250,
        QualityGrade.STANDARD: 350,
        QualityGrade.PREMIUM: 550,
    },
    MaterialCategory.TILES_PAINT_FINISHING: {
        QualityGrade.ECONOMY: 700,
        QualityGrade.STANDARD: 1100,
        QualityGrade.PREMIUM: 2600,
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

# --- Renovation Estimator ---------------------------------------------------
# PLACEHOLDER — same status as everything else in this file: reasonable
# order-of-magnitude ratios, not verified against a quantity surveyor.

# Fraction of gross wall area assumed taken up by doors/windows and therefore
# not tiled/painted/plastered. A single flat figure, not measured per room.
WALL_OPENING_DEDUCTION_FRACTION = 0.15

# Material quantity per sqft of the relevant area (floor area for tiling,
# wall area for wall tiling/painting/plastering), at "standard" grade —
# reuses QUALITY_GRADE_QUANTITY_MULTIPLIER for economy/premium scaling, and
# reuses MATERIAL_RATE_PKR above for pricing, so "cement" costs the same
# whether it's going into a full house estimate or a plastering job.
RENOVATION_MATERIAL_QTY_PER_SQFT: dict[RenovationWorkItem, dict[str, float]] = {
    RenovationWorkItem.FLOOR_TILING: {"tiles_sqft": 1.05, "tile_adhesive_bags": 0.025},
    RenovationWorkItem.WALL_TILING: {"tiles_sqft": 1.05, "tile_adhesive_bags": 0.025},
    RenovationWorkItem.PAINTING: {"paint_litres": 0.12},
    RenovationWorkItem.PLASTERING: {"cement_bags": 0.09, "sand_cft": 0.12},
}

# PLACEHOLDER — flat labour PKR/sqft by work item and quality grade. Labour
# isn't a "material" with a rate/unit, so it isn't in MATERIAL_RATE_PKR —
# same flat-benchmark pattern as FLAT_BENCHMARK_PER_SQFT above.
RENOVATION_LABOUR_PER_SQFT: dict[RenovationWorkItem, dict[QualityGrade, float]] = {
    RenovationWorkItem.FLOOR_TILING: {
        QualityGrade.ECONOMY: 80,
        QualityGrade.STANDARD: 120,
        QualityGrade.PREMIUM: 180,
    },
    RenovationWorkItem.WALL_TILING: {
        QualityGrade.ECONOMY: 90,
        QualityGrade.STANDARD: 130,
        QualityGrade.PREMIUM: 190,
    },
    RenovationWorkItem.PAINTING: {
        QualityGrade.ECONOMY: 40,
        QualityGrade.STANDARD: 60,
        QualityGrade.PREMIUM: 90,
    },
    RenovationWorkItem.PLASTERING: {
        QualityGrade.ECONOMY: 50,
        QualityGrade.STANDARD: 75,
        QualityGrade.PREMIUM: 110,
    },
}
