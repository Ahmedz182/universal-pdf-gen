from dataclasses import dataclass, field
from typing import Dict, Tuple

PAGE_SIZES: Dict[str, Tuple[float, float]] = {
    'A4': (595.28, 841.89),
    'Letter': (612, 792),
    'A3': (841.89, 1190.55),
    'A5': (419.53, 595.28),
}


@dataclass
class Theme:
    primary: str = '#2b5797'
    primary_dark: str = '#1c3a66'
    accent: str = '#e8b923'
    text: str = '#1a1a1a'
    muted: str = '#6b7280'
    border: str = '#d9dee4'
    table_header_bg: str = '#2b5797'
    table_header_text: str = '#ffffff'
    table_stripe_bg: str = '#f4f6f9'
    background: str = '#ffffff'


def default_margins() -> Dict[str, float]:
    return {'top': 40, 'bottom': 40, 'left': 40, 'right': 40}


@dataclass
class PDFConfig:
    page_size: str = 'A4'
    orientation: str = 'portrait'
    margins: Dict[str, float] = field(default_factory=default_margins)
    default_font: str = 'Helvetica'
    font_size: int = 12
    line_height: float = 1.5
    theme: Theme = field(default_factory=Theme)

    def resolve_page_dimensions(self) -> Tuple[float, float]:
        width, height = PAGE_SIZES.get(self.page_size, PAGE_SIZES['A4'])
        if self.orientation == 'landscape':
            return height, width
        return width, height


DEFAULT_CONFIG = PDFConfig()
