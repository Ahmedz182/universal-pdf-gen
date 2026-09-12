"""
Thin drawing layer over a reportlab canvas that lets templates think in
top-down coordinates (y=0 at the top of the page), matching the mental model
used by the JS/TS package. reportlab's native coordinate system has y=0 at
the BOTTOM of the page, which is easy to get wrong when porting layouts.
"""
from typing import Callable, Optional, List
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import simpleSplit


class Surface:
    def __init__(
        self,
        canvas,
        page_width: float,
        page_height: float,
        on_new_page: Optional[Callable[[], None]] = None,
    ):
        self.canvas = canvas
        self.page_width = page_width
        self.page_height = page_height
        self._on_new_page = on_new_page

    def _y(self, y_top: float) -> float:
        return self.page_height - y_top

    def set_font(self, font: str, size: float) -> None:
        self.canvas.setFont(font, size)

    def text_width(self, text: str, font: str, size: float) -> float:
        return self.canvas.stringWidth(text, font, size)

    def wrap(self, text: str, font: str, size: float, max_width: float) -> List[str]:
        return simpleSplit(text, font, size, max_width)

    def text(
        self,
        x: float,
        y_top: float,
        text: str,
        font: str = 'Helvetica',
        size: float = 10,
        color: str = '#000000',
        align: str = 'left',
        width: Optional[float] = None,
    ) -> float:
        """Draws text, optionally word-wrapped to `width`. Returns the y_top
        position immediately below the rendered text (for chaining)."""
        self.canvas.setFont(font, size)
        self.canvas.setFillColor(HexColor(color))

        lines = self.wrap(text, font, size, width) if width else [text]
        line_height = size * 1.3
        cursor = y_top

        for line in lines:
            baseline = self._y(cursor + size)
            if align == 'center' and width is not None:
                self.canvas.drawCentredString(x + width / 2, baseline, line)
            elif align == 'right' and width is not None:
                self.canvas.drawRightString(x + width, baseline, line)
            else:
                self.canvas.drawString(x, baseline, line)
            cursor += line_height

        return cursor

    def measure_height(self, text: str, font: str, size: float, width: float) -> float:
        lines = self.wrap(text, font, size, width)
        return max(1, len(lines)) * size * 1.3

    def rect(
        self,
        x: float,
        y_top: float,
        width: float,
        height: float,
        fill: Optional[str] = None,
        stroke: Optional[str] = None,
        line_width: float = 1,
        radius: float = 0,
    ) -> None:
        y = self._y(y_top) - height
        self.canvas.saveState()
        if line_width:
            self.canvas.setLineWidth(line_width)
        if stroke:
            self.canvas.setStrokeColor(HexColor(stroke))
        if fill:
            self.canvas.setFillColor(HexColor(fill))
        if radius > 0:
            self.canvas.roundRect(x, y, width, height, radius, fill=1 if fill else 0, stroke=1 if stroke else 0)
        else:
            self.canvas.rect(x, y, width, height, fill=1 if fill else 0, stroke=1 if stroke else 0)
        self.canvas.restoreState()

    def line(
        self,
        x1: float,
        y1_top: float,
        x2: float,
        y2_top: float,
        color: str = '#000000',
        width: float = 1,
        dash: Optional[List[float]] = None,
    ) -> None:
        self.canvas.saveState()
        self.canvas.setStrokeColor(HexColor(color))
        self.canvas.setLineWidth(width)
        if dash:
            self.canvas.setDash(dash)
        self.canvas.line(x1, self._y(y1_top), x2, self._y(y2_top))
        self.canvas.restoreState()

    def circle(self, cx: float, cy_top: float, r: float, fill: str = '#000000') -> None:
        self.canvas.saveState()
        self.canvas.setFillColor(HexColor(fill))
        self.canvas.circle(cx, self._y(cy_top), r, fill=1, stroke=0)
        self.canvas.restoreState()

    def new_page(self) -> None:
        if self._on_new_page:
            self._on_new_page()
        self.canvas.showPage()
