from typing import Callable, Dict, Any
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, Letter, A3, A5
from reportlab.lib.units import inch
from io import BytesIO

from .config import PDFConfig, PAGE_SIZES

class PDFGenerator:
    def __init__(self, config: PDFConfig = None):
        if config is None:
            config = PDFConfig()
        self.config = config
        self.templates: Dict[str, Callable] = {}
        self.output = BytesIO()
        self.canvas = None
        self._setup_canvas()

    def _setup_canvas(self):
        page_sizes = {
            'A4': A4,
            'Letter': Letter,
            'A3': A3,
            'A5': A5,
        }

        page_size = page_sizes.get(self.config.page_size, A4)
        if self.config.orientation == 'landscape':
            page_size = (page_size[1], page_size[0])

        self.canvas = canvas.Canvas(self.output, pagesize=page_size)

    def register_template(self, name: str, renderer: Callable) -> None:
        self.templates[name] = renderer

    def use_template(self, template_name: str, data: Dict[str, Any]) -> None:
        if template_name not in self.templates:
            available = ', '.join(self.templates.keys())
            raise ValueError(f'Template "{template_name}" not found. Available: {available}')

        template = self.templates[template_name]
        template(self.canvas, self.config, data)

    def add_text(self, text: str, x: float = None, y: float = None, **options) -> 'PDFGenerator':
        if x is None:
            x = self.config.margins['left']
        if y is None:
            y = self.config.margins['top']

        self.canvas.drawString(x, y, text)
        return self

    def add_image(self, image_path: str, x: float, y: float, width: float = None, height: float = None) -> 'PDFGenerator':
        self.canvas.drawImage(image_path, x, y, width=width, height=height)
        return self

    def add_table(self, columns: list, rows: list, x: float = None, y: float = None, **options) -> 'PDFGenerator':
        if x is None:
            x = self.config.margins['left']
        if y is None:
            y = self.config.margins['top']

        page_width = 595.28 - self.config.margins['left'] - self.config.margins['right']
        col_width = page_width / len(columns)
        row_height = options.get('row_height', 20)

        # Draw header
        self.canvas.setFillColor('#f0f0f0')
        for i, col in enumerate(columns):
            self.canvas.rect(x + i * col_width, y, col_width, row_height, fill=True)
            self.canvas.drawString(x + i * col_width + 5, y + 8, str(col))

        # Draw rows
        for row_idx, row in enumerate(rows):
            for col_idx, cell in enumerate(row):
                self.canvas.rect(x + col_idx * col_width, y + (row_idx + 1) * row_height, col_width, row_height)
                self.canvas.drawString(x + col_idx * col_width + 5, y + (row_idx + 1) * row_height + 8, str(cell))

        return self

    def add_page(self) -> 'PDFGenerator':
        self.canvas.showPage()
        return self

    def add_line(self, x1: float, y1: float, x2: float, y2: float, color: str = 'black') -> 'PDFGenerator':
        self.canvas.line(x1, y1, x2, y2)
        return self

    def set_font(self, font_name: str, size: int) -> 'PDFGenerator':
        self.canvas.setFont(font_name, size)
        return self

    def generate(self, filename: str) -> None:
        self.canvas.save()
        with open(filename, 'wb') as f:
            f.write(self.output.getvalue())
