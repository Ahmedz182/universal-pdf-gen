from typing import Any, Dict

from ..config import PDFConfig, Theme
from ..surface import Surface
from ..utils.validate import require_fields, to_date, format_currency


def render_receipt(surface: Surface, config: PDFConfig, data: Dict[str, Any], theme: Theme) -> None:
    require_fields(data, ['store_name', 'receipt_number', 'items', 'subtotal', 'total', 'payment_method'], 'receipt')

    left = config.margins['left']
    right = surface.page_width - config.margins['right']
    width = right - left
    currency = data.get('currency', 'USD')
    date_time = to_date(data.get('datetime'))

    y = config.margins['top']

    y = surface.text(left, y, data['store_name'], font='Helvetica-Bold', size=18, color=theme.primary, align='center', width=width)
    y += 2

    store_address = data.get('store_address')
    if store_address:
        y = surface.text(left, y, store_address, font='Helvetica', size=9, color=theme.muted, align='center', width=width)

    y += 12
    surface.line(left, y, right, y, color=theme.border, width=1)
    y += 12

    surface.text(left, y, f"Receipt #: {data['receipt_number']}", font='Helvetica', size=9, color=theme.text)
    y += 12
    surface.text(left, y, date_time.strftime('%b %d, %Y, %I:%M %p'), font='Helvetica', size=9, color=theme.text)
    y += 14

    surface.line(left, y, right, y, color=theme.border, width=1, dash=[2, 2])
    y += 10

    surface.text(left, y, 'ITEM', font='Helvetica-Bold', size=9, color=theme.muted, width=width * 0.5)
    surface.text(left + width * 0.5, y, 'QTY x PRICE', font='Helvetica-Bold', size=9, color=theme.muted, align='right', width=width * 0.3)
    surface.text(left + width * 0.8, y, 'TOTAL', font='Helvetica-Bold', size=9, color=theme.muted, align='right', width=width * 0.2)
    y += 14

    for item in data['items']:
        item_total = item.get('total', item['quantity'] * item['price'])

        if y + 16 > surface.page_height - config.margins['bottom']:
            surface.new_page()
            y = config.margins['top']

        surface.text(left, y, item['name'], font='Helvetica', size=10, color=theme.text, width=width * 0.5)
        surface.text(
            left + width * 0.5, y, f"{item['quantity']} x {format_currency(item['price'], currency)}",
            font='Helvetica', size=10, color=theme.text, align='right', width=width * 0.3
        )
        surface.text(left + width * 0.8, y, format_currency(item_total, currency), font='Helvetica', size=10, color=theme.text, align='right', width=width * 0.2)
        y += 16

    y += 4
    surface.line(left, y, right, y, color=theme.border)
    y += 10

    label_width = width - 90
    surface.text(left, y, 'Subtotal', font='Helvetica', size=10, color=theme.text, width=label_width)
    surface.text(left + label_width, y, format_currency(data['subtotal'], currency), font='Helvetica', size=10, color=theme.text, align='right', width=90)
    y += 16

    tax = data.get('tax')
    if tax:
        surface.text(left, y, 'Tax', font='Helvetica', size=10, color=theme.text, width=label_width)
        surface.text(left + label_width, y, format_currency(tax, currency), font='Helvetica', size=10, color=theme.text, align='right', width=90)
        y += 16

    surface.text(left, y, 'TOTAL', font='Helvetica-Bold', size=13, color=theme.primary, width=label_width)
    surface.text(left + label_width, y, format_currency(data['total'], currency), font='Helvetica-Bold', size=13, color=theme.primary, align='right', width=90)
    y += 24

    y = surface.text(left, y, f"Payment method: {data['payment_method']}", font='Helvetica', size=9, color=theme.muted, align='center', width=width)
    y += 14

    thank_you = data.get('thank_you_message')
    if thank_you:
        surface.text(left, y, thank_you, font='Helvetica-BoldOblique', size=11, color=theme.primary, align='center', width=width)
