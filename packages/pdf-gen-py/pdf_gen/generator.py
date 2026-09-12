from typing import Any, Callable, Dict, List, Optional
from io import BytesIO

from reportlab.pdfgen import canvas as rl_canvas

from .config import PDFConfig, Theme, default_margins
from .surface import Surface
from .utils.table import draw_table


class PDFGenerator:
    def __init__(
        self,
        page_size: str = 'A4',
        orientation: str = 'portrait',
        margins: Optional[Dict[str, float]] = None,
        theme: Optional[Theme] = None,
        page_numbers: bool = False,
        **_ignored: Any,
    ):
        self.config = PDFConfig(
            page_size=page_size,
            orientation=orientation,
            margins={**default_margins(), **(margins or {})},
            theme=theme or Theme(),
        )
        self.theme = self.config.theme
        self.templates: Dict[str, Callable] = {}
        self._page_numbers_enabled = page_numbers
        self._page_num = 1

        self.output = BytesIO()
        self.page_width, self.page_height = self.config.resolve_page_dimensions()
        self.canvas = rl_canvas.Canvas(self.output, pagesize=(self.page_width, self.page_height))
        self.surface = Surface(
            self.canvas,
            self.page_width,
            self.page_height,
            on_new_page=self._handle_new_page if page_numbers else None,
        )

    def _handle_new_page(self) -> None:
        self._stamp_page_number(self._page_num)
        self._page_num += 1

    def _stamp_page_number(self, n: int) -> None:
        self.surface.text(
            0,
            self.page_height - self.config.margins['bottom'] + 12,
            f'Page {n}',
            font='Helvetica',
            size=8,
            color=self.theme.muted,
            align='center',
            width=self.page_width,
        )

    @property
    def content_width(self) -> float:
        return self.page_width - self.config.margins['left'] - self.config.margins['right']

    @property
    def content_height(self) -> float:
        return self.page_height - self.config.margins['top'] - self.config.margins['bottom']

    def register_template(self, name: str, renderer: Callable) -> None:
        self.templates[name] = renderer

    def use_template(self, template_name: str, data: Dict[str, Any]) -> 'PDFGenerator':
        if template_name not in self.templates:
            available = ', '.join(self.templates.keys()) or '(none registered)'
            raise ValueError(f'Template "{template_name}" not found. Available: {available}')
        self.templates[template_name](self.surface, self.config, data, self.theme)
        return self

    def add_text(self, text: str, x: Optional[float] = None, y: Optional[float] = None, **options) -> 'PDFGenerator':
        x = self.config.margins['left'] if x is None else x
        y = self.config.margins['top'] if y is None else y
        self.surface.text(x, y, text, **options)
        return self

    def add_image(self, image_path: str, x: float, y_top: float, width: float = None, height: float = None) -> 'PDFGenerator':
        canvas_y = self.page_height - y_top - (height or 0)
        self.canvas.drawImage(image_path, x, canvas_y, width=width, height=height)
        return self

    def add_table(self, columns: List[Dict[str, Any]], rows: List[Any], start_y: Optional[float] = None, **options) -> 'PDFGenerator':
        y = self.config.margins['top'] if start_y is None else start_y
        draw_table(self.surface, self.config, self.theme, columns, rows, y, **options)
        return self

    def add_page(self) -> 'PDFGenerator':
        self.surface.new_page()
        return self

    def add_line(self, x1: float, y1: float, x2: float, y2: float, color: str = None, width: float = 1) -> 'PDFGenerator':
        self.surface.line(x1, y1, x2, y2, color=color or self.theme.border, width=width)
        return self

    def set_font(self, font_name: str, size: int) -> 'PDFGenerator':
        self.canvas.setFont(font_name, size)
        return self

    def generate(self, filename: str) -> None:
        if self._page_numbers_enabled:
            self._stamp_page_number(self._page_num)
        self.canvas.save()
        with open(filename, 'wb') as f:
            f.write(self.output.getvalue())

    def generate_bytes(self) -> bytes:
        if self._page_numbers_enabled:
            self._stamp_page_number(self._page_num)
        self.canvas.save()
        return self.output.getvalue()
