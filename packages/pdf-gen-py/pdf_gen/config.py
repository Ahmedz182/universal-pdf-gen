from typing import Dict, Tuple
from dataclasses import dataclass

@dataclass
class PDFConfig:
    page_size: str = 'A4'
    orientation: str = 'portrait'
    margins: Dict[str, float] = None
    default_font: str = 'Helvetica'
    font_size: int = 12
    line_height: float = 1.5

    def __post_init__(self):
        if self.margins is None:
            self.margins = {'top': 20, 'bottom': 20, 'left': 20, 'right': 20}

PAGE_SIZES: Dict[str, Tuple[float, float]] = {
    'A4': (595.28, 841.89),
    'Letter': (612, 792),
    'A3': (841.89, 1190.55),
    'A5': (419.53, 595.28),
}

DEFAULT_CONFIG = PDFConfig()
