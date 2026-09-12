from typing import Any, Dict

from ..config import PDFConfig, Theme
from ..surface import Surface
from ..utils.validate import require_fields, format_date


def render_certificate(surface: Surface, config: PDFConfig, data: Dict[str, Any], theme: Theme) -> None:
    require_fields(data, ['title', 'recipient_name', 'achievement_text', 'issuer_name'], 'certificate')

    page_width = surface.page_width
    page_height = surface.page_height
    center_x = page_width / 2
    border_color = data.get('border_color', theme.primary)

    if data.get('decorative_elements', True):
        from reportlab.lib.colors import HexColor

        surface.canvas.saveState()
        surface.canvas.setStrokeColor(HexColor(border_color))
        surface.canvas.setLineWidth(3)
        surface.canvas.rect(30, 30, page_width - 60, page_height - 60, fill=0, stroke=1)

        surface.canvas.setStrokeColor(HexColor(theme.accent))
        surface.canvas.setLineWidth(1)
        surface.canvas.rect(42, 42, page_width - 84, page_height - 84, fill=0, stroke=1)
        surface.canvas.restoreState()

        for cx, cy_top in [(42, 42), (page_width - 42, 42), (42, page_height - 42), (page_width - 42, page_height - 42)]:
            surface.circle(cx, cy_top, 4, fill=theme.accent)

    y = page_height * 0.14

    y = surface.text(60, y, data['title'], font='Helvetica-Bold', size=30, color=border_color, align='center', width=page_width - 120)
    y += 20

    y = surface.text(60, y, 'This certificate is proudly presented to', font='Helvetica', size=15, color=theme.text, align='center', width=page_width - 120)
    y += 20

    y = surface.text(60, y, data['recipient_name'], font='Helvetica-Bold', size=30, color=theme.primary_dark, align='center', width=page_width - 120)
    y += 6

    surface.line(center_x - 120, y, center_x + 120, y, color=theme.accent, width=1.5)
    y += 24

    surface.text(100, y, data['achievement_text'], font='Helvetica', size=13, color=theme.text, align='center', width=page_width - 200)

    bottom_y = page_height - 150

    surface.text(100, bottom_y, f"Date: {format_date(data.get('issue_date'))}", font='Helvetica', size=11, color=theme.muted, width=220)
    cert_number = data.get('certification_number')
    if cert_number:
        surface.text(100, bottom_y + 16, f'Certificate No: {cert_number}', font='Helvetica', size=11, color=theme.muted, width=220)

    surface.line(100, bottom_y - 10, 320, bottom_y - 10, color=theme.border)
    surface.line(page_width - 320, bottom_y - 10, page_width - 100, bottom_y - 10, color=theme.border)

    surface.text(page_width - 320, bottom_y, data['issuer_name'], font='Helvetica-Bold', size=11, color=theme.text, align='right', width=220)
    surface.text(page_width - 320, bottom_y + 16, 'Authorized Signature', font='Helvetica', size=9, color=theme.muted, align='right', width=220)
