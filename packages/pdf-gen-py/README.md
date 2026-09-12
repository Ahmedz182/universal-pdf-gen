# pdf-gen - Python PDF Generation

Python implementation of pdf-gen with support for invoices, receipts, and certificates.

## Installation

```bash
pip install pdf-gen
```

## Quick Start

```python
from pdf_gen import PDFGenerator, Templates
from datetime import datetime

pdf = PDFGenerator(
    page_size='A4',
    orientation='portrait'
)

Templates.register(pdf)

pdf.use_template('invoice', {
    'invoice_number': 'INV-001',
    'date': datetime.now().strftime('%Y-%m-%d'),
    'company_name': 'ACME Corp',
    'client_name': 'John Doe',
    'items': [
        {'description': 'Service', 'quantity': 1, 'unit_price': 100}
    ],
    'subtotal': 100,
    'total': 100
})

pdf.generate('invoice.pdf')
```

## Templates

### Invoice

```python
data = {
    'invoice_number': 'INV-001',
    'date': '2024-01-15',
    'company_name': 'ACME Corp',
    'company_address': 'Optional address',
    'client_name': 'John Doe',
    'client_address': 'Optional address',
    'items': [
        {
            'description': 'Service',
            'quantity': 1,
            'unit_price': 100
        }
    ],
    'subtotal': 100,
    'tax': 10,
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
        {
            'name': 'Item',
            'quantity': 1,
            'price': 25.00
        }
    ],
    'subtotal': 25.00,
    'tax': 2.50,
    'total': 27.50,
    'payment_method': 'Cash'
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
    'certification_number': 'CERT-001'
}
```

## CLI Usage

```bash
pdf-gen invoice output.pdf --config invoice-data.json
pdf-gen receipt receipt.pdf --config receipt-data.json --page-size A4
pdf-gen certificate cert.pdf --config cert-data.json --orientation portrait
```

## Programmatic API

```python
from pdf_gen import PDFGenerator

pdf = PDFGenerator(page_size='A4', orientation='portrait')

# Add text
pdf.add_text('Hello World', 100, 100)

# Add line
pdf.add_line(100, 200, 300, 200)

# Add image
pdf.add_image('image.png', 100, 300, width=100, height=100)

# Add new page
pdf.add_page()

# Generate
pdf.generate('output.pdf')
```

## License

MIT
