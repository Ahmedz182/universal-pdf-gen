# pdf-gen-js

JavaScript/TypeScript implementation of [universal-pdf-gen](https://github.com/Ahmedz182/universal-pdf-gen) — professional invoice, receipt, and certificate PDFs with a programmatic API. Built on [PDFKit](http://pdfkit.org/).

See the [root README](../../README.md) for full screenshots and a side-by-side comparison with the Python package.

## Installation

```bash
npm install
npm run build
```

(Once published: `npm install pdf-gen-js`.)

## Quick Start

```javascript
const { PDFGenerator, Templates } = require('pdf-gen-js');

const pdf = new PDFGenerator({ pageSize: 'A4', orientation: 'portrait' });
Templates.register(pdf);

await pdf.useTemplate('invoice', {
  invoiceNumber: 'INV-001',
  date: '2024-01-15',
  companyName: 'ACME Corp',
  clientName: 'John Doe',
  items: [{ description: 'Service', quantity: 1, unitPrice: 100 }],
  subtotal: 100,
  total: 100
});

await pdf.generate('invoice.pdf');
```

> `useTemplate` is `async` — image embedding (WEBP normalization, SVG parsing) may need to do async work — so always `await` it.

TypeScript types are included — `InvoiceData`, `ReceiptData`, `CertificateData`, `PDFConfig`, and `Theme` are all exported.

## Templates

See the [templates reference in the root README](../../README.md#templates-reference) for the full field list. All keys are `camelCase` in JS/TS.

### Invoice

```typescript
import { InvoiceData } from 'pdf-gen-js';

const data: InvoiceData = {
  invoiceNumber: 'INV-001',
  date: '2024-01-15',
  dueDate: '2024-02-14',
  status: 'DUE',
  companyName: 'ACME Corp',
  companyAddress: 'Optional address',
  clientName: 'John Doe',
  clientAddress: 'Optional address',
  items: [{ description: 'Service', quantity: 1, unitPrice: 100 }],
  subtotal: 100,
  tax: 10,
  taxRate: 10,
  total: 110,
  notes: 'Optional notes',
  paymentTerms: 'Net 30'
};
```

### Receipt

```typescript
const data = {
  storeName: 'Store Name',
  storeAddress: 'Optional address',
  receiptNumber: 'RCP-001',
  dateTime: '2024-01-15 10:30',
  items: [{ name: 'Item', quantity: 1, price: 25.0 }],
  subtotal: 25.0,
  tax: 2.5,
  total: 27.5,
  paymentMethod: 'Cash',
  thankYouMessage: 'Thank you for your purchase!'
};
```

### Certificate

```typescript
const data = {
  title: 'Certificate of Achievement',
  recipientName: 'John Doe',
  achievementText: 'For successfully completing the course',
  issuerName: 'Institution Name',
  issueDate: '2024-01-15',
  certificationNumber: 'CERT-001',
  borderColor: '#1a5f7a'
};
```

## Logos (PNG, JPG, WEBP, SVG)

```javascript
await pdf.useTemplate('invoice', {
  logo: 'logo.svg', // or .png / .jpg / .webp, a Buffer, or { src, width, height }
  // ...
});
```

WEBP is transparently normalized to PNG via `sharp` (PDFKit has no native WEBP support). SVG is drawn as true vector paths via `svg-to-pdfkit` — not rasterized — so it stays crisp. See [Logos & Images in the root README](../../README.md#logos--images) for the full picture, including a side-by-side comparison of all four formats.

## Custom templates — build your own design

Not limited to invoice/receipt/certificate — register any renderer function under any name:

```javascript
pdf.registerTemplate('businessCard', (doc, config, data, theme) => {
  // doc is the raw PDFKit document — full API available
  doc.roundedRect(50, 50, 300, 150, 10).fill(theme.primary);
  doc.fillColor(theme.accent).font('Helvetica-Bold').fontSize(18).text(data.name, 70, 80);
});

await pdf.useTemplate('businessCard', { name: 'Jane Doe' });
```

See [Custom Templates in the root README](../../README.md#custom-templates--build-your-own-design) for a full runnable example and screenshot.

## CLI Usage

```bash
node bin/cli.js invoice output.pdf --config invoice-data.json
node bin/cli.js invoice output.pdf --config invoice-data.json --logo logo.svg
node bin/cli.js receipt receipt.pdf --config receipt-data.json --page-size A4
node bin/cli.js certificate cert.pdf --config cert-data.json --orientation portrait
```

Or, once installed as a package, simply `pdf-gen invoice output.pdf --config invoice-data.json`.

## Programmatic (non-template) API

```javascript
const pdf = new PDFGenerator({ pageSize: 'A4', orientation: 'portrait' });

// Text
pdf.addText('Hello World', { align: 'left' });

// Line
pdf.addLine(100, 200, 300, 200);

// Table with automatic word-wrap and pagination
pdf.addTable(
  [
    { header: 'Name', key: 'name' },
    { header: 'Score', key: 'score', align: 'right' }
  ],
  [
    { name: 'Alice', score: '95' },
    { name: 'Bob', score: '88' }
  ]
);

// New page
pdf.addPage();

// Image (PNG, JPG, WEBP, or SVG — file path or Buffer)
await pdf.addImage('logo.svg', 100, 50, 80, 80); // x, y, width, height

// Write to disk, or get raw bytes for an HTTP response
await pdf.generate('output.pdf');
const buffer = await pdf.generateBuffer();
```

## Theming

```javascript
const pdf = new PDFGenerator({
  theme: { primary: '#7a2048', accent: '#d4af37' }
});
```

## Page numbers

```javascript
pdf.addPageNumbers(); // call once, right before generate() — stamps "Page N of M"
await pdf.generate('output.pdf');
```

## Running tests

```bash
npm test   # builds TypeScript, then runs the test suite
```

## License

MIT
