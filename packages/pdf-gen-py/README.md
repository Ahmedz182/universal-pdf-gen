# pdf-gen (Python)

Python implementation of [universal-pdf-gen](https://github.com/Ahmedz182/universal-pdf-gen) — professional invoice, receipt, and certificate PDFs with a programmatic API. Built on [ReportLab](https://www.reportlab.com/).

See the [root README](../../README.md) for full screenshots and a side-by-side comparison with the JavaScript/TypeScript package.

## Installation

```bash
pip install -e .
```

(Once published: `pip install pdf-gen`.)

## Quick Start

```python
from pdf_gen import PDFGenerator, Templates

pdf = PDFGenerator(page_size='A4', orientation='portrait')
Templates.register(pdf)

pdf.use_template('invoice', {
    'invoice_number': 'INV-001',
    'date': '2024-01-15',
    'company_name': 'ACME Corp',
    'client_name': 'John Doe',
    'logo': 'logo.svg',  # optional — .png, .jpg, .webp, or .svg
    'items': [
        {'description': 'Service', 'quantity': 1, 'unit_price': 100}
    ],
    'subtotal': 100,
    'total': 100
})

pdf.generate('invoice.pdf')
```

## Templates

See the [templates reference in the root README](../../README.md#templates-reference) for the full field list. All keys are `snake_case` in Python.

### Invoice

```python
data = {
    'invoice_number': 'INV-001',
    'date': '2024-01-15',
    'due_date': '2024-02-14',
    'status': 'DUE',
    'company_name': 'ACME Corp',
    'company_address': 'Optional address',
    'client_name': 'John Doe',
    'client_address': 'Optional address',
    'items': [
        {'description': 'Service', 'quantity': 1, 'unit_price': 100}
    ],
    'subtotal': 100,
    'tax': 10,
    'tax_rate': 10,
    'total': 110,
    'notes': 'Optional notes',
    'payment_terms': 'Net 30'
}
```

### Receipt

```python
data = {
    'store_name': 'Store Name',
    'store_address': 'Optional address',
    'receipt_number': 'RCP-001',
    'datetime': '2024-01-15 10:30',
    'items': [
        {'name': 'Item', 'quantity': 1, 'price': 25.00}
    ],
    'subtotal': 25.00,
    'tax': 2.50,
    'total': 27.50,
    'payment_method': 'Cash',
    'thank_you_message': 'Thank you for your purchase!'
}
```

### Certificate

```python
data = {
    'title': 'Certificate of Achievement',
    'recipient_name': 'John Doe',
    'achievement_text': 'For successfully completing the course',
    'issuer_name': 'Institution Name',
    'issue_date': '2024-01-15',
    'certification_number': 'CERT-001',
    'border_color': '#1a5f7a'
}
```

## Logos (PNG, JPG, WEBP, SVG)

```python
pdf.use_template('invoice', {
    'logo': 'logo.svg',  # or .png / .jpg / .webp, bytes, or {'src', 'width', 'height'}
    # ...
})
```

Raster formats (including WEBP) are handled by Pillow via reportlab's `ImageReader` — no conversion needed. SVG is drawn as true vector paths via `svglib` — not rasterized — so it stays crisp. See [Logos & Images in the root README](../../README.md#logos--images) for the full picture, including a side-by-side comparison of all four formats.

## Custom templates — build your own design

Not limited to invoice/receipt/certificate — register any renderer function under any name:

```python
def render_business_card(surface, config, data, theme):
    # surface.canvas gives you the raw reportlab canvas if needed
    surface.rect(50, 50, 300, 150, fill=theme.primary, radius=10)
    surface.text(70, 80, data['name'], font='Helvetica-Bold', size=18, color=theme.accent)

pdf.register_template('business_card', render_business_card)
pdf.use_template('business_card', {'name': 'Jane Doe'})
```

See [Custom Templates in the root README](../../README.md#custom-templates--build-your-own-design) for a full runnable example and screenshot.

## CLI Usage

```bash
python3 -m pdf_gen.cli invoice output.pdf --config invoice-data.json
python3 -m pdf_gen.cli invoice output.pdf --config invoice-data.json --logo logo.svg
python3 -m pdf_gen.cli receipt receipt.pdf --config receipt-data.json --page-size A4
python3 -m pdf_gen.cli certificate cert.pdf --config cert-data.json --orientation portrait
```

Or, once installed as a package, simply `pdf-gen invoice output.pdf --config invoice-data.json`.

## Programmatic (non-template) API

```python
from pdf_gen import PDFGenerator

pdf = PDFGenerator(page_size='A4', orientation='portrait')

# Text (top-down coordinates: y=0 is the TOP of the page)
pdf.add_text('Hello World', x=100, y=100)

# Line
pdf.add_line(100, 200, 300, 200)

# Table with automatic word-wrap and pagination
pdf.add_table(
    columns=[{'header': 'Name', 'key': 'name'}, {'header': 'Score', 'key': 'score', 'align': 'right'}],
    rows=[{'name': 'Alice', 'score': '95'}, {'name': 'Bob', 'score': '88'}],
)

# New page
pdf.add_page()

# Image (PNG, JPG, WEBP, or SVG — file path or bytes)
pdf.add_image('logo.svg', x=100, y_top=50, width=80, height=80)

# Write to disk, or get raw bytes for an HTTP response
pdf.generate('output.pdf')
pdf_bytes = pdf.generate_bytes()
```

## Theming

```python
from pdf_gen import PDFGenerator, Theme

pdf = PDFGenerator(theme=Theme(primary='#7a2048', accent='#d4af37'))
```

## Page numbers

```python
pdf = PDFGenerator(page_numbers=True)  # stamps "Page N" at the bottom of every page
```

## Running tests

```bash
pip install -e .   # pulls in reportlab, pillow, and svglib
python3 -m unittest discover -s tests -v
```

## License

MIT
