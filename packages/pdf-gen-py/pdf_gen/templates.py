from datetime import datetime
from typing import Dict, Any, List

def render_invoice(canvas, config: Any, data: Dict[str, Any]) -> None:
    left_margin = config.margins['left']
    top_margin = config.margins['top']
    page_width = 595.28 - config.margins['left'] - config.margins['right']

    canvas.setFont('Helvetica-Bold', 24)
    canvas.drawString(left_margin, top_margin, 'INVOICE')

    canvas.setFont('Helvetica', 10)
    canvas.drawString(left_margin, top_margin + 40, f"Invoice #: {data['invoice_number']}")
    canvas.drawString(left_margin, top_margin + 55, f"Date: {data['date']}")

    canvas.setFont('Helvetica-Bold', 12)
    canvas.drawString(left_margin, top_margin + 80, 'From:')
    canvas.setFont('Helvetica', 11)
    canvas.drawString(left_margin, top_margin + 100, data['company_name'])
    if 'company_address' in data:
        canvas.drawString(left_margin, top_margin + 115, data['company_address'])

    canvas.setFont('Helvetica-Bold', 12)
    canvas.drawString(left_margin + 300, top_margin + 80, 'Bill To:')
    canvas.setFont('Helvetica', 11)
    canvas.drawString(left_margin + 300, top_margin + 100, data['client_name'])
    if 'client_address' in data:
        canvas.drawString(left_margin + 300, top_margin + 115, data['client_address'])

    # Table header
    table_top = top_margin + 160
    columns = ['Description', 'Quantity', 'Unit Price', 'Total']
    column_widths = [page_width * 0.5, page_width * 0.15, page_width * 0.15, page_width * 0.2]

    canvas.setFont('Helvetica-Bold', 11)
    x_pos = left_margin
    for i, col in enumerate(columns):
        canvas.drawString(x_pos, table_top, col)
        x_pos += column_widths[i]

    canvas.line(left_margin, table_top + 20, left_margin + page_width, table_top + 20)

    # Items
    canvas.setFont('Helvetica', 10)
    y_pos = table_top + 30
    for item in data['items']:
        item_total = item.get('total', item['quantity'] * item['unit_price'])
        x_pos = left_margin
        canvas.drawString(x_pos, y_pos, item['description'])
        x_pos += column_widths[0]
        canvas.drawString(x_pos, y_pos, str(item['quantity']))
        x_pos += column_widths[1]
        canvas.drawString(x_pos, y_pos, f"${item['unit_price']:.2f}")
        x_pos += column_widths[2]
        canvas.drawString(x_pos, y_pos, f"${item_total:.2f}")
        y_pos += 20

    # Summary
    summary_x = left_margin + page_width - 200
    y_pos += 10
    canvas.line(summary_x - 20, y_pos, summary_x + 150, y_pos)

    y_pos += 10
    canvas.setFont('Helvetica', 10)
    canvas.drawString(summary_x, y_pos, 'Subtotal:')
    canvas.drawRightString(summary_x + 150, y_pos, f"${data['subtotal']:.2f}")

    if 'tax' in data:
        y_pos += 20
        canvas.drawString(summary_x, y_pos, 'Tax:')
        canvas.drawRightString(summary_x + 150, y_pos, f"${data['tax']:.2f}")

    y_pos += 20
    canvas.setFont('Helvetica-Bold', 12)
    canvas.drawString(summary_x, y_pos, 'Total:')
    canvas.drawRightString(summary_x + 150, y_pos, f"${data['total']:.2f}")

def render_receipt(canvas, config: Any, data: Dict[str, Any]) -> None:
    left_margin = config.margins['left']
    top_margin = config.margins['top']
    page_width = 595.28 - config.margins['left'] - config.margins['right']
    center_x = left_margin + page_width / 2

    canvas.setFont('Helvetica-Bold', 16)
    canvas.drawCentredString(center_x, top_margin, data['store_name'])

    canvas.setFont('Helvetica', 9)
    if 'store_address' in data:
        canvas.drawCentredString(center_x, top_margin + 20, data['store_address'])

    canvas.drawString(left_margin, top_margin + 40, f"Receipt #: {data['receipt_number']}")
    canvas.drawString(left_margin, top_margin + 55, f"Date/Time: {data['datetime']}")

    canvas.line(left_margin, top_margin + 75, left_margin + page_width, top_margin + 75)

    y_pos = top_margin + 90
    canvas.setFont('Helvetica', 9)

    for item in data['items']:
        item_total = item.get('total', item['quantity'] * item['price'])
        canvas.drawString(left_margin, y_pos, item['name'])
        canvas.drawString(left_margin + 200, y_pos, f"{item['quantity']}x @ ${item['price']:.2f}")
        canvas.drawRightString(left_margin + page_width - 60, y_pos, f"${item_total:.2f}")
        y_pos += 15

    canvas.line(left_margin, y_pos, left_margin + page_width, y_pos)
    y_pos += 10

    canvas.drawString(left_margin + page_width - 130, y_pos, 'Subtotal:')
    canvas.drawRightString(left_margin + page_width - 60, y_pos, f"${data['subtotal']:.2f}")

    if 'tax' in data:
        y_pos += 15
        canvas.drawString(left_margin + page_width - 130, y_pos, 'Tax:')
        canvas.drawRightString(left_margin + page_width - 60, y_pos, f"${data['tax']:.2f}")

    y_pos += 15
    canvas.setFont('Helvetica-Bold', 10)
    canvas.drawString(left_margin + page_width - 130, y_pos, 'Total:')
    canvas.drawRightString(left_margin + page_width - 60, y_pos, f"${data['total']:.2f}")

def render_certificate(canvas, config: Any, data: Dict[str, Any]) -> None:
    page_width = 595.28
    page_height = 841.89
    center_x = page_width / 2

    border_color = data.get('border_color', '#1a5f7a')

    # Border
    canvas.setLineWidth(2)
    canvas.rect(40, 40, page_width - 80, page_height - 80)
    canvas.setLineWidth(1)
    canvas.rect(60, 60, page_width - 120, page_height - 120)

    # Title
    canvas.setFont('Helvetica-Bold', 32)
    canvas.drawCentredString(center_x, 700, data['title'])

    # This certifies
    canvas.setFont('Helvetica', 16)
    canvas.drawCentredString(center_x, 600, 'This is to certify that')

    # Recipient
    canvas.setFont('Helvetica-Bold', 28)
    canvas.drawCentredString(center_x, 500, data['recipient_name'])

    # Achievement text
    canvas.setFont('Helvetica', 13)
    # Simple text wrapping
    text = data['achievement_text']
    canvas.drawCentredString(center_x, 400, text[:50])
    if len(text) > 50:
        canvas.drawCentredString(center_x, 380, text[50:])

    # Date
    bottom_y = 150
    canvas.setFont('Helvetica', 11)
    canvas.drawString(100, bottom_y, f"Date: {data['issue_date']}")

    if 'certification_number' in data:
        canvas.drawString(100, bottom_y - 30, f"Certificate #: {data['certification_number']}")

    # Signature lines
    canvas.line(100, bottom_y - 80, 250, bottom_y - 80)
    canvas.setFont('Helvetica', 10)
    canvas.drawString(100, bottom_y - 100, 'Authorized Signature')

    canvas.line(page_width - 250, bottom_y - 80, page_width - 100, bottom_y - 80)
    canvas.drawString(page_width - 250, bottom_y - 100, data['issuer_name'])
