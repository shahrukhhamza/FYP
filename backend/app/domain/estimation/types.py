from enum import Enum


class PlotSize(str, Enum):
    MARLA_3 = "3_marla"
    MARLA_5 = "5_marla"
    MARLA_7 = "7_marla"
    MARLA_10 = "10_marla"
    KANAL_1 = "1_kanal"
    KANAL_2 = "2_kanal"


class City(str, Enum):
    ISLAMABAD = "islamabad"
    RAWALPINDI = "rawalpindi"


class QualityGrade(str, Enum):
    ECONOMY = "economy"
    STANDARD = "standard"
    PREMIUM = "premium"


class Storeys(float, Enum):
    ONE = 1.0
    ONE_AND_HALF = 1.5
    TWO = 2.0
    TWO_AND_HALF = 2.5
    THREE = 3.0


class MaterialCategory(str, Enum):
    STRUCTURE_STEEL = "structure_steel"
    CEMENT_MASONRY = "cement_masonry"
    ELECTRICAL_PLUMBING = "electrical_plumbing"
    WOODWORK_DOORS = "woodwork_doors"
    TILES_PAINT_FINISHING = "tiles_paint_finishing"


CATEGORY_LABELS: dict[MaterialCategory, str] = {
    MaterialCategory.STRUCTURE_STEEL: "Structure & steel",
    MaterialCategory.CEMENT_MASONRY: "Cement & masonry",
    MaterialCategory.ELECTRICAL_PLUMBING: "Electrical & plumbing",
    MaterialCategory.WOODWORK_DOORS: "Woodwork & doors",
    MaterialCategory.TILES_PAINT_FINISHING: "Tiles, paint & finishing",
}
