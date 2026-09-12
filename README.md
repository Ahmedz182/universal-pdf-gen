# PDF Gen - Multi-Language PDF Generation

A unified, framework-agnostic PDF generation library with predefined templates and programmatic API support for JavaScript/TypeScript, Python, and more.

## Features

- 🎯 **Multiple Templates**: Invoice, Receipt, Certificate, Report (easily extensible)
- 📝 **Programmatic API**: Full control via code with TypeScript/Python support
- 🎨 **Customizable**: Page size, orientation, margins, fonts, colors
- 🚀 **Multi-Language**: JavaScript/TypeScript (Node.js) and Python
- 💪 **Zero Dependencies**: Minimal external dependencies, maximum portability
- 📊 **Rich Content**: Tables, images, headers/footers, barcodes
- 🔧 **CLI Tools**: Generate PDFs from command line

## Quick Start

### JavaScript/TypeScript

```bash
npm install pdf-gen-js
```

```javascript
const { PDFGenerator, Templates } = require('pdf-gen-js');

const pdf = new PDFGenerator({
  pageSize: 'A4',
  orientation: 'portrait',
  margins: { top: 20, bottom: 20, left: 20, right: 20 }
});

pdf.useTemplate(Templates.INVOICE, {
  invoiceNumber: 'INV-001',
  date: new Date(),
  companyName: 'ACME Corp',
  items: [
    { description: 'Service', quantity: 1, price: 100 }
  ],
  total: 100
});

pdf.generate('invoice.pdf');
```

### Python

```bash
pip install pdf-gen
```

```python
from pdf_gen import PDFGenerator, Templates

pdf = PDFGenerator(
    page_size='A4',
    orientation='portrait',
    margins={'top': 20, 'bottom': 20, 'left': 20, 'right': 20}
)

pdf.use_template(Templates.INVOICE, {
    'invoice_number': 'INV-001',
    'date': datetime.now(),
    'company_name': 'ACME Corp',
    'items': [
        {'description': 'Service', 'quantity': 1, 'price': 100}
    ],
    'total': 100
})

pdf.generate('invoice.pdf')
```

## Packages

- **pdf-gen-js** - JavaScript/TypeScript implementation
- **pdf-gen-py** - Python implementation

## Templates

- **Invoice** - Professional invoice generation
- **Receipt** - Receipt/transaction records
- **Certificate** - Certificate generation
- **Report** - Multi-page report generation

## Configuration Options

```typescript
interface PDFConfig {
  pageSize: 'A4' | 'Letter' | 'A3' | 'A5';
  orientation: 'portrait' | 'landscape';
  margins: { top: number; bottom: number; left: number; right: number };
  defaultFont: string;
  fontSize: number;
  lineHeight: number;
}
```

## License

MIT

## Author

Ahmed Fayyaz
