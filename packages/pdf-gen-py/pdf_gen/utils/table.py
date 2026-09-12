from typing import Any, Dict, List, Optional, Union

from ..config import PDFConfig, Theme
from ..surface import Surface

Row = Union[Dict[str, Any], List[Any]]


def _cell_value(row: Row, col: Dict[str, Any], idx: int) -> str:
    raw = row[idx] if isinstance(row, list) else row.get(col.get('key'))
    return '' if raw is None else str(raw)


def draw_table(
    surface: Surface,
    config: PDFConfig,
    theme: Theme,
    columns: List[Dict[str, Any]],
    rows: List[Row],
    start_y: float,
    font_size: float = 10,
    header_height: float = 26,
    row_height: float = 22,
    striped: bool = True,
) -> float:
    """Draws a table using top-down coordinates, word-wrapping cells and
    breaking to a new page when a row would run past the bottom margin.
    Returns the y (top-down) position immediately below the table."""

    x = config.margins['left']
    total_width = surface.page_width - config.margins['left'] - config.margins['right']

    explicit_width = sum(c.get('width') or 0 for c in columns)
    flex_columns = sum(1 for c in columns if not c.get('width'))
    flex_width = (total_width - explicit_width) / flex_columns if flex_columns else 0
    widths = [c.get('width') or flex_width for c in columns]

    def draw_header(y: float) -> float:
        surface.rect(x, y, total_width, header_height, fill=theme.table_header_bg)
        col_x = x
        for i, col in enumerate(columns):
            surface.text(
                col_x + 6,
                y + header_height / 2 - font_size / 2,
                col['header'],
                font='Helvetica-Bold',
                size=font_size,
                color=theme.table_header_text,
                align=col.get('align', 'left'),
                width=widths[i] - 12,
            )
            col_x += widths[i]
        return y + header_height

    def row_lines_height(row: Row) -> float:
        max_h = row_height
        for i, col in enumerate(columns):
            text = _cell_value(row, col, i)
            h = surface.measure_height(text, 'Helvetica', font_size, widths[i] - 12) + 10
            max_h = max(max_h, h)
        return max_h

    bottom_limit = surface.page_height - config.margins['bottom']

    y = start_y
    if y + header_height > bottom_limit:
        surface.new_page()
        y = config.margins['top']
    y = draw_header(y)

    for row_idx, row in enumerate(rows):
        height = row_lines_height(row)

        if y + height > bottom_limit:
            surface.new_page()
            y = config.margins['top']
            y = draw_header(y)

        if striped and row_idx % 2 == 1:
            surface.rect(x, y, total_width, height, fill=theme.table_stripe_bg)

        col_x = x
        for i, col in enumerate(columns):
            surface.text(
                col_x + 6,
                y + 6,
                _cell_value(row, col, i),
                font='Helvetica',
                size=font_size,
                color=theme.text,
                align=col.get('align', 'left'),
                width=widths[i] - 12,
            )
            col_x += widths[i]

        surface.line(x, y + height, x + total_width, y + height, color=theme.border, width=0.5)
        y += height

    return y
