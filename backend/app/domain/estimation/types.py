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


class RenovationWorkItem(str, Enum):
    FLOOR_TILING = "floor_tiling"
    WALL_TILING = "wall_tiling"
    PAINTING = "painting"
    PLASTERING = "plastering"


WORK_ITEM_LABELS: dict[RenovationWorkItem, str] = {
    RenovationWorkItem.FLOOR_TILING: "Floor tiling",
    RenovationWorkItem.WALL_TILING: "Wall tiling",
    RenovationWorkItem.PAINTING: "Painting",
    RenovationWorkItem.PLASTERING: "Plastering",
}

# Which measurement each work item is priced against.
WORK_ITEM_USES_WALL_AREA: dict[RenovationWorkItem, bool] = {
    RenovationWorkItem.FLOOR_TILING: False,
    RenovationWorkItem.WALL_TILING: True,
    RenovationWorkItem.PAINTING: True,
    RenovationWorkItem.PLASTERING: True,
}


class RoomType(str, Enum):
    BEDROOM = "bedroom"
    KITCHEN = "kitchen"
    BATHROOM = "bathroom"
    LOUNGE = "lounge"
    DINING = "dining"
    STORE = "store"
    GARAGE = "garage"
    OTHER = "other"


ROOM_TYPE_LABELS: dict[RoomType, str] = {
    RoomType.BEDROOM: "Bedroom",
    RoomType.KITCHEN: "Kitchen",
    RoomType.BATHROOM: "Bathroom",
    RoomType.LOUNGE: "Lounge / Living Room",
    RoomType.DINING: "Dining Room",
    RoomType.STORE: "Store Room",
    RoomType.GARAGE: "Garage",
    RoomType.OTHER: "Other",
}

# "Wet" areas (full wall tiling, waterproofing, much higher plumbing
# fixture density) cost meaningfully more per sqft than "dry" areas
# (paint only, a light switch or two) — a real estimator always separates
# these. Everything not listed here is dry.
WET_ROOM_TYPES: frozenset[RoomType] = frozenset({RoomType.KITCHEN, RoomType.BATHROOM})
