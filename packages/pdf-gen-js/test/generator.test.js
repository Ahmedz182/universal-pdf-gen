const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { PDFGenerator, Templates } = require('../dist/index');

function tmpFile(name) {
  return path.join(os.tmpdir(), `pdf-gen-test-${Date.now()}-${name}`);
}

test('generates a non-trivial invoice PDF', async () => {
  const pdf = new PDFGenerator({ pageSize: 'A4', orientation: 'portrait' });
  Templates.register(pdf);
  pdf.useTemplate('invoice', {
    invoiceNumber: 'T-1',
    date: '2024-01-01',
    companyName: 'Acme',
    clientName: 'Client',
    items: [{ description: 'Item', quantity: 1, unitPrice: 10 }],
    subtotal: 10,
    total: 10
  });

  const file = tmpFile('invoice.pdf');
  await pdf.generate(file);

  const stats = fs.statSync(file);
  assert.ok(stats.size > 1000, 'PDF should be a reasonably sized, non-empty file');
  fs.unlinkSync(file);
});

test('throws a clear error when required invoice fields are missing', () => {
  const pdf = new PDFGenerator();
  Templates.register(pdf);
  assert.throws(
    () => pdf.useTemplate('invoice', { invoiceNumber: 'T-2' }),
    /Missing required field/
  );
});

test('throws when using an unregistered template', () => {
  const pdf = new PDFGenerator();
  assert.throws(() => pdf.useTemplate('nonexistent', {}), /not found/);
});

test('paginates long invoices across multiple pages', async () => {
  const pdf = new PDFGenerator();
  Templates.register(pdf);
  const items = Array.from({ length: 40 }, (_, i) => ({
    description: `Item number ${i} with a longer description for wrapping`,
    quantity: i + 1,
    unitPrice: 12.5
  }));
  pdf.useTemplate('invoice', {
    invoiceNumber: 'T-3',
    companyName: 'Acme',
    clientName: 'Client',
    items,
    subtotal: 1000,
    total: 1000
  });

  const file = tmpFile('big-invoice.pdf');
  await pdf.generate(file);
  const content = fs.readFileSync(file, 'latin1');
  const pageMatches = content.match(/\/Type\s*\/Page[^s]/g) || [];
  assert.ok(pageMatches.length > 1, 'expected more than one page for a long invoice');
  fs.unlinkSync(file);
});

test('respects custom page size (Letter vs A4 produce different dimensions)', () => {
  const a4 = new PDFGenerator({ pageSize: 'A4' });
  const letter = new PDFGenerator({ pageSize: 'Letter' });
  assert.notStrictEqual(a4.getDocument().page.width, letter.getDocument().page.width);
});
