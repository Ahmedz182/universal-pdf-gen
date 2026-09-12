from typing import Any, Dict

from ..config import PDFConfig, Theme
from ..surface import Surface
from ..utils.table import draw_table
from ..utils.validate import require_fields, format_date, format_currency


def render_invoice(surface: Surface, config: PDFConfig, data: Dict[str, Any], theme: Theme) -> None:
    require_fields(data, ['invoice_number', 'company_name', 'client_name', 'items', 'subtotal', 'total'], 'invoice')

    left = config.margins['left']
    right = surface.page_width - config.margins['right']
    content_width = right - left
    currency = data.get('currency', 'USD')

    # --- Header banner -------------------------------------------------
    banner_height = 90
    surface.rect(0, 0, surface.page_width, banner_height, fill=theme.primary)

    surface.text(left, 30, 'INVOICE', font='Helvetica-Bold', size=26, color='#ffffff')
    surface.text(left, 62, data['company_name'], font='Helvetica', size=10, color='#ffffff', width=content_width * 0.6)

    surface.text(
        left, 30, f"#{data['invoice_number']}", font='Helvetica-Bold', size=12,
        color='#ffffff', align='right', width=content_width
    )
    surface.text(
        left, 50, format_date(data.get('date')), font='Helvetica', size=10,
        color='#ffffff', align='right', width=content_width
    )

    status = data.get('status')
    if status:
        status_colors = {'PAID': '#1e8e3e', 'DUE': theme.accent, 'OVERDUE': '#c62828'}
        surface.text(
            left, 68, status, font='Helvetica-Bold', size=10,
            color=status_colors.get(status, theme.accent), align='right', width=content_width
        )

    # --- From / Bill To --------------------------------------------------
    y = banner_height + 30
    surface.text(left, y, 'FROM', font='Helvetica-Bold', size=9, color=theme.muted)
    surface.text(left + content_width / 2, y, 'BILL TO', font='Helvetica-Bold', size=9, color=theme.muted)

    y += 14
    surface.text(left, y, data['company_name'], font='Helvetica-Bold', size=11, color=theme.text, width=content_width / 2 - 10)
    surface.text(left + content_width / 2, y, data['client_name'], font='Helvetica-Bold', size=11, color=theme.text, width=content_width / 2)

    y += 16
    company_address = data.get('company_address')
    client_address = data.get('client_address')
    if company_address:
        surface.text(left, y, company_address, font='Helvetica', size=10, color=theme.muted, width=content_width / 2 - 10)
    if client_address:
        surface.text(left + content_width / 2, y, client_address, font='Helvetica', size=10, color=theme.muted, width=content_width / 2)

    y += 20
    if data.get('due_date'):
        surface.text(left, y, f"Due date: {format_date(data['due_date'])}", font='Helvetica-Bold', size=9, color=theme.muted)
        y += 10

    # --- Line items table --------------------------------------------------
    table_top = y + 15
    rows = []
    for item in data['items']:
        item_total = item.get('total', item['quantity'] * item['unit_price'])
        rows.append({
            'description': item['description'],
            'quantity': str(item['quantity']),
            'unit_price': format_currency(item['unit_price'], currency),
            'total': format_currency(item_total, currency),
        })

    final_y = draw_table(
        surface, config, theme,
        columns=[
            {'header': 'Description', 'key': 'description'},
            {'header': 'Qty', 'key': 'quantity', 'width': content_width * 0.12, 'align': 'right'},
            {'header': 'Unit Price', 'key': 'unit_price', 'width': content_width * 0.2, 'align': 'right'},
            {'header': 'Total', 'key': 'total', 'width': content_width * 0.2, 'align': 'right'},
        ],
        rows=rows,
        start_y=table_top,
    )

    # --- Totals summary --------------------------------------------------
    summary_width = 220
    summary_x = right - summary_width
    sy = final_y + 15

    surface.text(summary_x, sy, 'Subtotal', font='Helvetica', size=10, color=theme.text, width=summary_width - 90)
    surface.text(summary_x + summary_width - 90, sy, format_currency(data['subtotal'], currency), font='Helvetica', size=10, color=theme.text, align='right', width=90)
    sy += 18

    tax = data.get('tax')
    tax_rate = data.get('tax_rate')
    if tax or tax_rate:
        tax_label = f'Tax ({tax_rate}%)' if tax_rate else 'Tax'
        surface.text(summary_x, sy, tax_label, font='Helvetica', size=10, color=theme.text, width=summary_width - 90)
        surface.text(summary_x + summary_width - 90, sy, format_currency(tax or 0, currency), font='Helvetica', size=10, color=theme.text, align='right', width=90)
        sy += 18

    surface.line(summary_x, sy, summary_x + summary_width, sy, color=theme.border)
    sy += 8

    surface.rect(summary_x, sy, summary_width, 30, fill=theme.primary)
    surface.text(summary_x + 10, sy + 8, 'Total', font='Helvetica-Bold', size=12, color='#ffffff', width=summary_width - 100)
    surface.text(summary_x + summary_width - 100, sy + 8, format_currency(data['total'], currency), font='Helvetica-Bold', size=12, color='#ffffff', align='right', width=90)

    # --- Notes & payment terms --------------------------------------------------
    notes = data.get('notes')
    payment_terms = data.get('payment_terms')
    if notes or payment_terms:
        ny = sy + 55
        if ny + 60 > surface.page_height - config.margins['bottom']:
            surface.new_page()
            ny = config.margins['top']

        surface.text(left, ny, 'NOTES', font='Helvetica-Bold', size=9, color=theme.muted)
        ny += 14
        if notes:
            ny = surface.text(left, ny, notes, font='Helvetica', size=10, color=theme.text, width=content_width)
        if payment_terms:
            surface.text(left, ny + 4, f'Payment terms: {payment_terms}', font='Helvetica', size=10, color=theme.text, width=content_width)
